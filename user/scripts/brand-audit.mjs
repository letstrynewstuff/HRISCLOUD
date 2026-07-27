#!/usr/bin/env node
/**
 * scripts/brand-audit.mjs
 *
 * Static conformance audit for the BantaHR rebrand (Phases 0–4).
 * Every check is derived from a decision in REBRAND-MIGRATION.md or from a
 * defect actually hit during the migration — see BRAND-TEST-PLAN.md.
 *
 *   node scripts/brand-audit.mjs          # report, exit 1 on any FAIL
 *   node scripts/brand-audit.mjs --json   # machine-readable
 *   node scripts/brand-audit.mjs --list   # show every offending location
 *
 * Exit codes:  0 = all pass   1 = one or more FAIL   2 = audit itself errored
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { findOpeningTags, BUTTON_TAGS } from "./jsx-tags.mjs";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const SRC = join(ROOT, "src");
const TOKENS_JS = join(SRC, "styles", "colors.js");
const TOKENS_CSS = join(SRC, "index.css");

const argv = new Set(process.argv.slice(2));
const AS_JSON = argv.has("--json");
const LIST = argv.has("--list");

/* ── collect source files ─────────────────────────────────────────────── */
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name.startsWith(".")) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if ([".jsx", ".js"].includes(extname(p))) out.push(p);
  }
  return out;
}

// Comments are blanked (newlines preserved, so line numbers stay true) — a
// commented-out colour never renders, and scanning it produces false hits.
// Dead blocks are reported separately by check H1.
const blankComments = (code) =>
  code
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/^([ \t]*)\/\/.*$/gm, (m, i) => i + " ".repeat(Math.max(0, m.length - i.length)));

const FILES = walk(SRC)
  .map((p) => {
    const raw = readFileSync(p, "utf8");
    return { path: p, rel: relative(SRC, p), src: blankComments(raw), raw };
  })
  .filter((f) => f.rel !== "styles/colors.js"); // the token file defines the palette

const HEX = /#[0-9A-Fa-f]{6}\b/g;
const tokenRaw = readFileSync(TOKENS_JS, "utf8");
const tokenSrc = tokenRaw;
const cssSrc = readFileSync(TOKENS_CSS, "utf8");
// Strip comments first — colors.js documents retired hues in prose, and
// harvesting those would whitelist the very colours we are banning.
const stripComments = (css) =>
  css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const TOKEN_HEX = new Set(
  (stripComments(tokenSrc).match(HEX) || []).map((h) => h.toUpperCase()),
);

const ALL = [...FILES, { path: TOKENS_JS, rel: "styles/colors.js", src: tokenRaw, raw: tokenRaw }];

/* ── check harness ────────────────────────────────────────────────────── */
const results = [];
const check = (id, name, rule, hits, { warn = false } = {}) =>
  results.push({ id, name, rule, count: hits.length, hits, status: hits.length === 0 ? "PASS" : warn ? "WARN" : "FAIL" });

const each = (fn) => {
  const hits = [];
  for (const f of FILES) fn(f, (detail, line) => hits.push({ file: f.rel, detail, line }));
  return hits;
};
const lineOf = (src, index) => src.slice(0, index).split("\n").length;

/* ══ COLOUR ═══════════════════════════════════════════════════════════ */

// C1 — every colour literal must exist in the token file
check("C1", "No off-token colour literals", "REBRAND-MIGRATION.md D1",
  each((f, hit) => {
    for (const m of f.src.matchAll(HEX)) {
      const v = m[0].toUpperCase();
      if (!TOKEN_HEX.has(v)) hit(v, lineOf(f.src, m.index));
    }
  }));

// C2 — hues explicitly retired by D1
const RETIRED = { "#06B6D4": "cyan", "#8B5CF6": "violet", "#EC4899": "pink", "#7C3AED": "violet", "#0D9488": "teal" };
check("C2", "No retired brand hues", "D1 — one accent only",
  each((f, hit) => {
    for (const [hex, name] of Object.entries(RETIRED)) {
      const re = new RegExp(hex, "gi");
      for (const m of f.src.matchAll(re)) hit(`${name} ${hex}`, lineOf(f.src, m.index));
    }
  }));

// C3 — a gradient whose stops are all identical renders as a flat fill.
// This is the documented failure mode of substituting one hue for another.
check("C3", "No collapsed gradients", "D1 — re-stop, never substitute",
  each((f, hit) => {
    for (const m of f.src.matchAll(/linear-gradient\([^)]*\)/g)) {
      const stops = (m[0].match(HEX) || []).map((h) => h.toUpperCase());
      if (stops.length < 2) continue;
      // all stops identical → a flat fill
      if (new Set(stops).size === 1) {
        hit(m[0].slice(0, 60), lineOf(f.src, m.index));
        continue;
      }
      // adjacent duplicates → a flat band inside a varying gradient
      for (let i = 1; i < stops.length; i++) {
        if (stops[i] === stops[i - 1]) {
          hit(`adjacent duplicate stop ${stops[i]} — ${m[0].slice(0, 44)}`, lineOf(f.src, m.index));
          break;
        }
      }
    }
  }));

// C4 — two stops that differ by < 8 in each RGB channel are visually flat
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
check("C4", "No near-flat gradients", "D1 — a gradient must read as one",
  each((f, hit) => {
    for (const m of f.src.matchAll(/linear-gradient\([^)]*\)/g)) {
      const stops = [...new Set((m[0].match(HEX) || []).map((h) => h.toUpperCase()))];
      if (stops.length !== 2) continue;
      const [a, b] = stops.map(rgb);
      if (a.every((v, i) => Math.abs(v - b[i]) < 8)) hit(m[0].slice(0, 60), lineOf(f.src, m.index));
    }
  }), { warn: true });

// C5 — coloured shadows are forbidden; depth is flat and neutral
check("C5", "No coloured shadows", "Design system §5 — flat, colour-free depth",
  each((f, hit) => {
    for (const m of f.src.matchAll(/boxShadow: ?[`"]([^`"]*)[`"]/g)) {
      // Named indigo tokens, or any rgba whose blue channel materially
      // outruns its red — that is a tinted shadow however it was written.
      const tinted = [...m[1].matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)]
        .some(([, r, , b]) => +b - +r > 40);
      if (/\$\{C\.(primary|accent)/.test(m[1]) || tinted)
        hit(m[1].slice(0, 48), lineOf(f.src, m.index));
    }
  }));

/* ══ TYPE ═════════════════════════════════════════════════════════════ */

// T1 — D2 retired these families app-wide
check("T1", "No retired typefaces", "D2 — General Sans + DM Mono only",
  each((f, hit) => {
    for (const m of f.src.matchAll(/\b(Sora|DM Sans|Plus Jakarta Sans|Inter)\b/g))
      hit(m[1], lineOf(f.src, m.index));
  }));

// T2 — Tailwind utilities load AFTER @layer base, so a bold utility on a
// heading silently defeats the weight-500 rule. This is the defect that made
// the whole app still look pre-rebrand.
check("T2", "No bold utility on h1–h3", "D3 — display headings sit at 500",
  each((f, hit) => {
    for (const m of f.src.matchAll(/<h[123]\b[^>]*?\bfont-(bold|extrabold|black|semibold)\b/gs))
      hit(`font-${m[1]}`, lineOf(f.src, m.index));
  }));

// T3 — same rule, inline form
check("T3", "No inline fontWeight ≥ 700 on headings", "D3",
  each((f, hit) => {
    for (const m of f.src.matchAll(/<h[123]\b[^>]{0,300}?fontWeight: ?([789]00)/gs))
      hit(m[1], lineOf(f.src, m.index));
  }));

/* ══ SHAPE ════════════════════════════════════════════════════════════ */

// S1 — D4: buttons and chips are 64px pills, app-wide
check("S1", "Buttons use the pill radius", "D4",
  each((f, hit) => {
    // Uses a brace-balancing scanner, NOT a regex. `<button ... >` matched
    // with /(.*?)>/ stops at the ">" inside `onClick={() => …}`, which hid
    // 341 rounded-xl buttons from three separate sweeps and from this check.
    for (const t of findOpeningTags(f.src, BUTTON_TAGS)) {
      const cls = t.attrs.match(/rounded-(xl|2xl|lg|md)\b/);
      if (cls) hit(cls[0], lineOf(f.src, t.index));
      const inline = t.attrs.match(/borderRadius:\s*(\d+)(?![\d%])/);
      if (inline && +inline[1] < 64) hit(`borderRadius: ${inline[1]}`, lineOf(f.src, t.index));
    }
  }));

/* ══ TOKEN LAYER INTEGRITY ════════════════════════════════════════════ */

// I1 — colors.js and index.css are synced by hand. Drift means a component
// styled via Tailwind and one styled inline render different colours.
const jsPairs = {};
for (const m of tokenSrc.matchAll(/^\s{2}([a-zA-Z]+): "(#[0-9A-Fa-f]{6})"/gm))
  jsPairs[m[1]] = m[2].toUpperCase();
const CSS_MAP = {
  primary: "--color-primary", primaryLight: "--color-primary-light",
  primaryTint: "--color-primary-tint", primaryStrong: "--color-primary-strong",
  accent: "--color-accent", surface: "--color-paper", bg: "--color-ground",
  border: "--color-rule", textPrimary: "--color-ink", textSecondary: "--color-ink-2",
  textMuted: "--color-ink-3", success: "--color-success", warning: "--color-warning",
  danger: "--color-danger", navy: "--color-navy",
};
{
  const hits = [];
  for (const [key, cssVar] of Object.entries(CSS_MAP)) {
    const m = cssSrc.match(new RegExp(`${cssVar}:\\s*(#[0-9A-Fa-f]{6})`));
    if (!m) { hits.push({ file: "index.css", detail: `${cssVar} not defined` }); continue; }
    if (m[1].toUpperCase() !== jsPairs[key])
      hits.push({ file: "index.css", detail: `${cssVar}=${m[1]} but colors.js ${key}=${jsPairs[key]}` });
  }
  check("I1", "colors.js ↔ index.css token parity", "Phase 0 — synced by hand", hits);
}

// I2 — a file that reads C.* but never imports it throws at runtime.
// Caused three times during migration by an import check that matched
// the substring "styles/colors" inside a COMMENT.
check("I2", "Every C.* consumer imports C", "Phase 3 defect",
  FILES.filter((f) => /(?<![\w.])C\.[a-zA-Z]/.test(f.src) &&
    !/^import .*\bC\b.*from ["'][^"']*(colors|sharedData)["']/m.test(f.src) &&
    !/^const C = \{/m.test(f.src) &&
    !/^(export )?const C\b/m.test(f.src))
    .map((f) => ({ file: f.rel, detail: "uses C.* with no import" })));

// I3 — duplicate declaration is a build-breaking error
check("I3", "No duplicate C declarations", "Phase 3 defect",
  FILES.filter((f) => {
    const imp = (f.src.match(/^import .*\bC\b.*from/gm) || []).length;
    const loc = /^const C = \{/m.test(f.src) ? 1 : 0;
    return imp + loc > 1;
  }).map((f) => ({ file: f.rel, detail: "C declared more than once" })));

// I4 — a local palette shadows the token layer, so the file never re-themes
check("I4", "No local shadow palettes", "Phases 3–4",
  FILES.filter((f) => /^const C = \{/m.test(f.src))
    .map((f) => ({ file: f.rel, detail: "defines its own const C" })));

// I5 — referencing a key the token file does not define yields `undefined`,
// which renders as no colour. C.accentLight was undefined 37× pre-migration.
{
  const defined = new Set([...tokenSrc.matchAll(/^\s{2}([a-zA-Z]+):/gm)].map((m) => m[1]));
  ["indigo", "slate", "chart", "gradient", "shadow", "radius", "font", "ease", "duration"]
    .forEach((k) => defined.add(k));
  check("I5", "No undefined token keys referenced", "Phase 0 defect",
    each((f, hit) => {
      for (const m of f.src.matchAll(/(?<![\w.])C\.([a-zA-Z]+)/g))
        if (!defined.has(m[1])) hit(`C.${m[1]}`, lineOf(f.src, m.index));
    }));
}

/* ══ CONTENT & ICONS ══════════════════════════════════════════════════ */

// E1 — emoji are not iconography. 293 of them shipped as category markers,
// status glyphs and prose decoration; all are now lucide components.
// Arrows (→ ←) are typography, not emoji, and are deliberately not matched.
const EMOJI_RE =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}\u{FE0F}]/gu;
check("E1", "No emoji in shipped code", "Emoji are not iconography",
  each((f, hit) => {
    for (const m of f.src.matchAll(EMOJI_RE)) hit(m[0], lineOf(f.src, m.index));
  }));

// E2 — a component stored in a config and rendered as a bare child, {cfg.icon},
// is an object child: React error #31, which blanks the entire page. This
// shipped in Login.jsx and every contrast/scroll/emoji test still passed.
// `icon={x.icon}` is excluded — passing a component as a PROP is correct.
check("E2", "Icon components are rendered as JSX", "React error #31",
  each((f, hit) => {
    const comps = new Set(
      [...f.src.matchAll(/\bicon:\s*([A-Z]\w+)\s*[,}]/g)].map((m) => m[1]),
    );
    if (!comps.size) return;
    for (const m of f.src.matchAll(/(.?.?)\{\s*(\w+)\.icon\s*\}/g)) {
      const lead = m[1];
      if (lead.endsWith("=") || lead.endsWith("<")) continue; // prop or element
      hit(`{${m[2]}.icon} should be <${m[2]}.icon />`, lineOf(f.src, m.index));
    }
  }));

// E3 — an icon name that is neither imported, locally declared, nor rendered
// as JSX somewhere in the file is `undefined` at runtime.
check("E3", "Icon components resolve", "undefined component",
  each((f, hit) => {
    const used = new Set(
      [...f.src.matchAll(/\bicon:\s*([A-Z]\w+)\s*[,}]/g)].map((m) => m[1]),
    );
    if (!used.size) return;
    const known = new Set();
    for (const m of f.src.matchAll(/import\s*\{([^}]*)\}\s*from\s*["'][^"']+["']/g))
      for (const part of m[1].split(",")) known.add(part.split(" as ").pop().trim());
    for (const m of f.src.matchAll(/import\s+(\w+)\s+from/g)) known.add(m[1]);
    for (const m of f.src.matchAll(/(?:function|const|let)\s+([A-Z]\w+)/g)) known.add(m[1]);
    // a name rendered as <Name is by definition in scope (usually destructured)
    for (const m of f.src.matchAll(/<([A-Z]\w+)[\s/>]/g)) known.add(m[1]);
    for (const u of used) if (!known.has(u)) hit(`${u} does not resolve`, 1);
  }));

// E4 — a PAGE HERO is the large white-on-gradient slab that carries the page
// title. Matched by shape (p-8 + text-white) AND a heading inside it, so
// avatars and small gradient chips are not mistaken for one.
check("E4", "Page heroes use the shared gradient", "Header unification",
  each((f, hit) => {
    for (const m of f.src.matchAll(
      /className="[^"]*\bp-8\b[^"]*text-white[^"]*"[\s\S]{0,200}?background:\s*(["'`][^"'`]*linear-gradient[^"'`]*["'`])/g,
    )) {
      const after = f.src.slice(m.index, m.index + 1400);
      if (!/<h1\b/.test(after)) continue;         // not a page hero
      hit(`bespoke hero gradient ${m[1].slice(0, 44)}`, lineOf(f.src, m.index));
    }
  }));

// E5 — two destinations in the same nav sharing an icon makes them
// indistinguishable at a glance: a navigation defect, not a style one.
// Attendance and TimeSheet both shipped as `Clock`.
//
// A "destination" is an object literal carrying BOTH an icon and a path —
// that combination is what makes it a nav entry rather than any other config.
check("E5", "Nav destinations have distinct icons", "Navigation legibility",
  each((f, hit) => {
    const dests = [];
    for (const m of f.src.matchAll(/\{[^{}]*\bpath:\s*["'`][^"'`]*["'`][^{}]*\}/g)) {
      const icon = m[0].match(/\bicon:\s*([A-Z]\w+)/);
      const label = m[0].match(/\blabel:\s*["']([^"']+)["']/);
      if (icon && label) dests.push({ icon: icon[1], label: label[1], at: m.index });
    }
    if (dests.length < 3) return;              // not a nav list

    const byIcon = new Map();
    for (const d of dests) {
      if (!byIcon.has(d.icon)) byIcon.set(d.icon, new Set());
      byIcon.get(d.icon).add(d.label);
    }
    for (const [icon, labels] of byIcon) {
      if (labels.size > 1)
        hit(`${icon} is used by ${[...labels].join(" and ")}`, lineOf(f.src, dests[0].at));
    }
  }));

/* ══ HYGIENE ══════════════════════════════════════════════════════════ */

// H1 — large commented-out blocks absorbed replacements during migration
// (RequestDemo.jsx carried 1,061 dead lines; AdminMobileBottomNav.jsx 149).
check("H1", "No large dead commented blocks", "Migration hygiene",
  ALL.map((f) => {
    const lines = (f.raw ?? f.src).split("\n");
    let run = 0, max = 0;
    for (const l of lines) {
      if (/^\s*\/\//.test(l)) { run++; max = Math.max(max, run); } else run = 0;
    }
    return max >= 60 ? { file: f.rel, detail: `${max} consecutive commented lines` } : null;
  }).filter(Boolean), { warn: true });

/* ── report ───────────────────────────────────────────────────────────── */
const fails = results.filter((r) => r.status === "FAIL");
const warns = results.filter((r) => r.status === "WARN");

if (AS_JSON) {
  console.log(JSON.stringify({ pass: fails.length === 0, results }, null, 2));
} else {
  console.log(`\n  BantaHR brand audit — ${FILES.length} source files\n`);
  for (const r of results) {
    const tag = { PASS: "  PASS", FAIL: "  FAIL", WARN: "  WARN" }[r.status];
    const note = r.count ? `${r.count} occurrence${r.count > 1 ? "s" : ""}` : "";
    console.log(`${tag}  ${r.id.padEnd(4)} ${r.name.padEnd(42)} ${note}`);
    if (LIST && r.count) {
      const shown = r.hits.slice(0, 12);
      for (const h of shown) console.log("           %s%s  %s", h.file, h.line ? `:${h.line}` : "", h.detail ?? "");
      if (r.hits.length > shown.length) console.log("           … and %d more", r.hits.length - shown.length);
    }
  }
  console.log(`\n  ${results.length - fails.length - warns.length} passed, ` +
    `${fails.length} failed, ${warns.length} warnings` +
    `${LIST ? "" : "   (run with --list for locations)"}\n`);
}

process.exit(fails.length ? 1 : 0);
