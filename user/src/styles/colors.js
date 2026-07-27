// src/styles/colors.js
//
// ── BantaHR design tokens — single source of truth ──────────────────────────
//
// Every colour in the app should come from here. The matching CSS custom
// properties and Tailwind utilities live in src/index.css; the two files are
// kept in sync by hand, so change them together.
//
// Rebrand rules in force (see REBRAND-MIGRATION.md):
//   · One accent: BantaHR indigo #4F46E5. Cyan is retired.
//   · Charts use lighter steps of the same indigo, never a second hue.
//   · Status (success / warning / danger) is RESERVED — never decorative.
//   · Display headings sit at weight 500; tables keep their weight.
//   · Pills (64px) on buttons and chips, app-wide and marketing alike.
//
// Every key that existed before is still here under the same name, so the
// 41 files already importing this re-theme without edits.

/* ── Indigo ramp — the brand ────────────────────────────────────────────────
   #4F46E5 is Tailwind indigo 600 and stays the primary. The rest of the
   ladder gives us gradients and chart steps without inventing a second hue. */
const indigo = {
  50: "#EEF2FF",
  100: "#E0E7FF",
  200: "#C7D2FE",
  300: "#A5B4FC",
  400: "#818CF8",
  500: "#6366F1",
  600: "#4F46E5", // ← primary
  700: "#4338CA",
  800: "#3730A3",
  900: "#312E81",
  950: "#1E1B4B",
};

/* ── Slate ramp — text and hairlines ─────────────────────────────────────── */
const slate = {
  50: "#F7F8FC",
  100: "#F0F2F8",
  200: "#E4E7F0",
  300: "#CBD5E1",
  400: "#94A3B8",
  500: "#5F6D7E",
  700: "#334155",
  900: "#0F172A",
};

const C = {
  /* ── Ramps, exposed for gradients, charts and one-off tints ── */
  indigo,
  slate,

  /* ── Dark grounds (hero, rails, deep gradient ends) ──
     navyMid/navyLight were #2D2A6E/#3D3A8E — off-ramp violets that didn't
     match anything. Moved onto the indigo ladder. */
  navy: "#1E1B4B",
  navyMid: "#312E81",
  navyLight: "#3730A3",
  navyGlow: "rgba(79, 70, 229, 0.35)",

  /* ── Brand ──
     `accent` used to be cyan #06B6D4. It is now indigo 500, so the ~96
     existing `C.accent` call sites land on-brand instead of on a retired hue. */
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  primaryTint: "#E0E7FF",
  primaryStrong: "#3730A3",
  primaryDark: "#3730A3", // alias — several pages' local palettes used this name
  primaryGlow: "rgba(79, 70, 229, 0.16)", // referenced but never defined
  accent: "#6366F1",
  accentLight: "#E0E7FF", // referenced 37× but never defined
  accentGlow: "rgba(99, 102, 241, 0.28)",

  /* ── Surfaces ── */
  bg: "#F7F8FC",
  bgMid: "#F0F2F8", // referenced but never defined
  surface: "#FFFFFF",
  surfaceAlt: "#F7F8FC",
  surfaceHover: "#F7F8FC", // row/card hover fill
  border: "#E4E7F0",
  borderFocus: "#4F46E5",

  /* ── Status — RESERVED. Never use as decorative or series colours.
        Contrast against white is below 3:1, so every status mark must ship
        with a visible label or icon, never colour alone. ── */
  success: "#10B981",
  successLight: "#D1FAE5",
  successInk: "#047857", // accessible text on successLight
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  warningInk: "#92400E",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  dangerInk: "#B91C1C",
  info: "#4F46E5",
  infoLight: "#EEF2FF",

  /* ── Text ── */
  textPrimary: "#0F172A",
  textSecondary: "#5F6D7E", // clears 4.5:1 on paper, surfaceAlt AND bgMid
  textMuted: "#94A3B8",
  textOnAccent: "#FFFFFF",

  /* ── Legacy decorative hues ──
     One-off accents scattered through the app. Under a one-accent system they
     resolve onto the indigo ramp, so nothing renders undefined and nothing
     reintroduces a competing hue. Prefer `primary` / `accent` in new code.
     `purple` was #8B5CF6. */
  purple: "#6366F1",
  purpleLight: "#E0E7FF",
  sky: "#818CF8",
  skyLight: "#E0E7FF",
  pink: "#6366F1",
  pinkLight: "#E0E7FF",
  orange: "#F59E0B",
  orangeLight: "#FEF3C7",

  /* ── Charts ──
     Decision D1: no second hue, series step down the indigo ramp. Ordered
     for maximum lightness separation between neighbours, not ramp order.
     Reads cleanly for one series, sequential magnitude and small multiples.
     For 4+ categorical series that must be told apart at a glance, pair with
     direct labels or shape — lightness alone is not enough separation. */
  chart: {
    series: ["#4F46E5", "#A5B4FC", "#312E81", "#818CF8", "#1E1B4B", "#C7D2FE"],
    grid: "#E4E7F0",
    axis: "#94A3B8",
    fillFrom: "rgba(79, 70, 229, 0.24)",
    fillTo: "rgba(79, 70, 229, 0.02)",
  },

  /* ── Gradients — every indigo surface is a gradient, never a flat fill ── */
  gradient: {
    // Marketing hero slab
    hero:
      "linear-gradient(158deg, #7480F4 0%, #6366F1 18%, #4F46E5 40%, " +
      "#4338CA 62%, #312E81 82%, #1E1B4B 100%)",
    // Buttons, badges, small accent surfaces
    accent: "linear-gradient(135deg, #6366F1 0%, #4F46E5 48%, #3730A3 100%)",
    accentHover: "linear-gradient(135deg, #4F46E5 0%, #3730A3 48%, #312E81 100%)",
    // Closing CTA — nine stops so the fall reads gradual but still lands deep
    cta:
      "linear-gradient(152deg, #A5B4FC 0%, #818CF8 12%, #6366F1 24%, " +
      "#5A51E8 36%, #4F46E5 48%, #4338CA 60%, #3730A3 72%, #312E81 86%, " +
      "#1E1B4B 100%)",
    // Admin nav rail
    rail:
      "linear-gradient(168deg, #6366F1 0%, #4F46E5 26%, #4338CA 52%, " +
      "#312E81 78%, #1E1B4B 100%)",
    // Light tinted bands — alternate direction between sections so a page
    // reads as one continuous wash rather than stripes
    canvasDown: "linear-gradient(180deg, #FFFFFF 0%, #EEF2FF 42%, #C7D2FE 100%)",
    canvasUp: "linear-gradient(180deg, #C7D2FE 0%, #EEF2FF 58%, #FFFFFF 100%)",
    canvasDiag: "linear-gradient(152deg, #FFFFFF 0%, #E0E7FF 40%, #BAC5FD 100%)",
    // Icon chips, avatars
    soft: "linear-gradient(135deg, #EEF2FF 0%, #C7D2FE 100%)",
  },

  /* ── Depth — flat. Hairline borders carry structure, not shadows. ── */
  shadow: {
    card: "0 1px 2px rgba(15, 23, 42, 0.05)",
    lift: "0 10px 30px rgba(15, 23, 42, 0.08)",
    accent: "0 24px 60px rgba(15, 23, 42, 0.18)", // neutral: depth is colour-free
  },

  /* ── Shape ── */
  radius: {
    input: "10px",
    card: "16px",
    pill: "64px", // decision D4: buttons + chips, app-wide
  },

  /* ── Type ── */
  font: {
    display: '"General Sans", system-ui, -apple-system, sans-serif',
    body: '"General Sans", system-ui, -apple-system, sans-serif',
    mono: '"DM Mono", ui-monospace, "SF Mono", Menlo, monospace',
  },

  /* ── Motion ── */
  ease: {
    out: "cubic-bezier(0.16, 1, 0.3, 1)",
    inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
    drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
  },
  duration: { short: "220ms", mid: "360ms" },
};

export default C;
