# BantaHR rebrand — test plan

Coverage for the Phases 0–4 migration (see `REBRAND-MIGRATION.md`).

Two layers: **automated** checks that gate every commit, and **manual** cases
that need a human or a browser. Every edge case in §4 is a defect that actually
occurred during the migration, not a hypothetical.

```bash
npm run audit:brand        # 15 static checks, exit 1 on failure
npm run audit:brand:list   # with file:line for each violation
npm run lint:gate          # fails only on NEW lint errors above baseline
npm run verify             # lint:gate + audit + build
node scripts/brand-audit.selftest.mjs   # proves the audit can fail (13 mutants)
npm run test:e2e           # 104 browser tests across 3 viewports
npm run verify:all         # everything
```

> **Lint baseline.** The repo carries **113 pre-existing ESLint errors** that
> predate the rebrand (78 `react-hooks/set-state-in-effect`, 14 `no-empty`,
> 14 `react-hooks/static-components`, plus a few others). Verified by linting
> the committed pre-migration copies out of `git show HEAD:…` — identical
> counts before and after. None sit in a file the migration rewrote. A plain
> `eslint .` therefore can never exit 0, which is why `verify` uses
> `lint:gate`: it fails only when the count **rises**.

---

## 1. Automated static checks

Implemented in `user/scripts/brand-audit.mjs`. Runs over 158 source files.
Comments are blanked before analysis (line numbers preserved) so commented-out
code never produces a false hit.

| ID | Check | Enforces | Fails when |
|---|---|---|---|
| **C1** | No off-token colour literals | D1 | Any `#rrggbb` absent from `colors.js` |
| **C2** | No retired brand hues | D1 | cyan `#06B6D4`, violet `#8B5CF6`/`#7C3AED`, pink `#EC4899`, teal `#0D9488` |
| **C3** | No collapsed gradients | D1 | `linear-gradient` whose stops are all identical |
| **C4** | No near-flat gradients *(warn)* | D1 | Two stops differing < 8 per RGB channel |
| **C5** | No coloured shadows | System §5 | `boxShadow` containing an indigo rgba or `${C.primary}` |
| **T1** | No retired typefaces | D2 | `Sora`, `DM Sans`, `Plus Jakarta Sans`, `Inter` |
| **T2** | No bold utility on `h1`–`h3` | D3 | `font-bold` / `-extrabold` / `-black` / `-semibold` |
| **T3** | No inline `fontWeight ≥ 700` on headings | D3 | `<h1..3 … fontWeight: 700\|800\|900` |
| **S1** | Buttons use the pill radius | D4 | `<button>` with `rounded-xl\|2xl\|lg\|md` |
| **I1** | `colors.js` ↔ `index.css` parity | Phase 0 | The two token files disagree on any shared value |
| **I2** | Every `C.*` consumer imports `C` | Phase 3 | File reads `C.x` with no import and no local decl |
| **I3** | No duplicate `C` declarations | Phase 3 | `C` imported and/or declared more than once |
| **I4** | No local shadow palettes | Phases 3–4 | A file declares its own `const C = {` |
| **I5** | No undefined token keys | Phase 0 | `C.someKey` where `someKey` isn't in `colors.js` |
| **E1** | No emoji in shipped code | Emoji are not iconography | Any emoji/dingbat codepoint (arrows are typography, not matched) |
| **E2** | Icon components render as JSX | React error #31 | `{cfg.icon}` as a bare child — `icon={x.icon}` (a prop) is excluded |
| **E3** | Icon components resolve | undefined component | An `icon: Name` that is neither imported, declared, nor rendered as `<Name` |
| **E4** | Page heroes use the shared gradient | Header unification | A `p-8 text-white` slab containing an `h1` with a bespoke gradient |
| **H1** | No large dead comment blocks *(warn)* | Hygiene | ≥ 60 consecutive commented lines |

### 1.1 Self-test (mutation testing)

`scripts/brand-audit.selftest.mjs` injects one deliberate violation per check
into a real source file, confirms the audit reports **that specific check**,
then restores the file. Current result: **18/18 mutants detected** — the
injectable checks plus the structural ones (I2 missing import, I3 duplicate
declaration, I4 local palette) and the content checks (E1 emoji, E2 component-
as-child, E3 unresolved icon, C3b adjacent duplicate gradient stop).

A check that cannot fail is not a test. Re-run this whenever a check is edited.

---

## 2. Build & regression gates

| ID | Case | Pass criterion |
|---|---|---|
| B1 | `npm run build` | Exits 0, no `Transform failed` |
| B2 | `npm run lint:gate` | Error count ≤ 113 baseline; exits 1 on any increase |
| B3 | Dev server boots | `npm run dev`, zero `error`/`failed` in output |
| B4 | Built CSS carries tokens | `--color-primary:#4f46e5`, `--radius-pill:64px`, `--grad-hero` present |
| B5 | Retired font absent from bundle | `Plus Jakarta` count = 0 in `dist/assets/*.css` |
| B6 | Font `@import` position | Both `@import url(...)` are the **first** rules in the built CSS — a later `@import` is dropped by the browser |
| B7 | No duplicate React keys | Console clean when rendering list-heavy pages (Leave, Payroll, Reports) |

---

## 3. Manual / browser cases

### 3.1 Typography

| ID | Case | Expected |
|---|---|---|
| M1 | Load any page, DevTools → Network, filter `font` | `general-sans` and `DM Mono` return 200 from Fontshare / Google |
| M2 | Inspect `<body>`, computed `font-family` | Resolves to **General Sans**, not the `system-ui` fallback |
| M3 | Inspect any page `h1` | `font-weight: 500`, `letter-spacing: -0.03em` |
| M4 | Inspect a table header | Weight **preserved** (600/700) — D3 exempts tables |
| M5 | Block `api.fontshare.com` in DevTools, reload | Falls back to `system-ui` without layout shift or overflow |
| M6 | Inspect an eyebrow / KPI caption | DM Mono, uppercase, `0.04em` tracking |

### 3.2 Colour & shape

| ID | Case | Expected |
|---|---|---|
| M7 | Admin nav rail | Indigo **gradient**, not flat navy |
| M8 | Landing hero + closing CTA | Visible gradient travel, no banding |
| M9 | Any primary button | Fully rounded pill, gradient fill |
| M10 | Approval / leave status chips | Green, amber, red **with a text label** — never colour alone |
| M11 | Scan every admin page for a non-indigo accent | None: no cyan, teal, violet, pink, orange as decoration |
| M12 | Card edges | Hairline `#E4E7F0` border; no coloured glow |

### 3.3 Functional regression (colour changes must not break behaviour)

| ID | Case | Expected |
|---|---|---|
| M13 | `/request-demo` — submit empty | Four field errors, red border + message |
| M14 | `/request-demo` — valid submit | Opens `mailto:`, then the confirmation screen |
| M15 | Login → employee dashboard | Auth unaffected |
| M16 | Admin sidebar nav, all 11 destinations | Every route renders; active item highlighted |
| M17 | Leave request approve / reject | Status transitions and badge colour update |
| M18 | Payroll run screen | Amounts, countdown and progress render |
| M19 | Landing feature deck | Auto-advances at 5s; pauses on hover; arrows, dots, swipe, ←/→ all work |
| M20 | Employee timesheet entry modal | Opens, validates, saves |

### 3.4 Accessibility

| ID | Case | Expected |
|---|---|---|
| A1 | Body text on every surface | ≥ 4.5:1. `--color-ink-2` is redefined to `#3F4A61` on every tinted band (5.96:1) and reset to `#64748B` inside white cards (4.76:1) — structural, not per-selector |
| A2 | Status chip text on its tint | ≥ 4.5:1 (`successInk`/`warningInk`/`dangerInk` exist for this) |
| A3 | Keyboard tab through a form | Visible focus ring, `2px solid #3730A3`, offset 2px |
| A4 | `prefers-reduced-motion: reduce` | Deck autoplay off, reveals instant, no transitions |
| A5 | Screen reader on the deck | Announces "*Feature*, N of 9" via the live region |
| A6 | Zoom to 200% | No horizontal body scroll; wide tables scroll in their own container |
| A7 | Forced-colors / high-contrast mode | Controls remain distinguishable |

### 3.5 Responsive

| ID | Viewport | Expected |
|---|---|---|
| R1 | 375 px | Bottom nav visible, rail hidden, no horizontal scroll |
| R2 | 768 px | Admin rail collapses to icons; marketing nav → burger |
| R3 | 1024 px | Top/bottom nav heights zero out (`--top-bar-height: 0px`) |
| R4 | 1440 px+ | Content capped at 1120 px, centred |
| R5 | 375 px, landing deck | Cards fit; flankers clipped not overflowing |

---

## 4. Edge cases — every one of these actually happened

These are the migration's real defects. Each now has a guard.

| # | Edge case | What happened | Guard |
|---|---|---|---|
| **E1** | **Comment substring defeats an import check** | The test `if "styles/colors" not in source` matched a *comment* in `Chat.jsx` and in `sharedData.js`, so their palettes were deleted and no import added → runtime `C is not defined` | I2 + comments blanked before analysis |
| **E2** | **File with no `import` statement** | `StatusBadge.jsx` starts with `export default`, so a regex anchored on `^import` had nothing to match and silently skipped it | I2 |
| **E3** | **Duplicate `C` declaration** | Five files already imported `C` from `sharedData`; adding a second import broke the build | I3 |
| **E4** | **Gradient collapses to a flat fill** | Replacing cyan with indigo turned `linear-gradient(#6366F1, #06B6D4)` into `(#6366F1, #6366F1)` across **21 files** | C3 + C4 |
| **E5** | **Tailwind utility beats `@layer base`** | 175 headings carried `font-bold`, which loads after the base layer — the weight-500 rule never applied and the app still looked pre-rebrand | T2 + T3 |
| **E6** | **Off-token drift misread as "reserved status"** | 190 arbitrary red/amber/green shades (`#DC2626`, `#D97706`, `#059669`…) were left alone under a blanket "status is reserved" rule. They were never in the palette | C1 |
| **E7** | **Regex misses a spacing variant** | `"Sora,sans-serif"` was stripped but `"Sora, sans-serif"` survived in 24 places | T1 (matches the family name, not the declaration) |
| **E8** | **Sweep corrupts the token file's own prose** | A blanket hex replace rewrote comments inside `colors.js` describing which hues were retired | `colors.js` excluded from sweeps; audit strips comments when harvesting |
| **E9** | **A banned colour whitelists itself** | Because `colors.js` documents `#06B6D4` in prose, the audit harvested it as valid and C1 went blind to cyan | Token harvest strips comments first |
| **E10** | **Dead code absorbs the replacement** | `RequestDemo.jsx` carried 1,061 commented lines and `AdminMobileBottomNav.jsx` 149; a "first occurrence" replace hit the dead copy and left the live one | H1 + comments blanked |
| **E11** | **Comment inside JSX breaks an element regex** | A `// onClick=` comment inside `<Motion.button>` split the tag, hiding a `rounded-xl` from the pill sweep | S1 over comment-blanked source |
| **E12** | **Shared module has a hidden blast radius** | `sharedData.js` exports a palette to **45 files**; nothing named it as shared | I4 |
| **E13** | **Undefined token renders as no colour** | `C.accentLight` was referenced 37× and never defined — silently `undefined` | I5 |
| **E14** | **Two token files drift apart** | `colors.js` and `index.css` are synced by hand; divergence means inline-styled and Tailwind-styled components render different colours | I1 |
| **E15** | **Import path variant** | `BantaHRLogo.jsx` imports from `./colors`, not `../styles/colors` — a path-shaped check reported a false positive | I2 accepts any `colors` path |

### 4.1 Edge cases still uncovered

Honest gaps — no automated guard today:

| # | Risk | Why it isn't automated | Mitigation |
|---|---|---|---|
| ~~U5~~ | ~~Authenticated surfaces~~ | **CLOSED** — `tests/auth.js` seeds the token and fulfils `/auth/me` at the network layer; 13 admin + 11 employee routes are checked as rendered | — |
| **U1** | Tailwind arbitrary values (`bg-[#06B6D4]`) | C1 does catch these in `className` strings, but a value built at runtime (`` `bg-[${x}]` ``) is invisible to static analysis | Manual M11 |
| **U2** | Colour arriving from the API (e.g. a department colour field) | Not in source | Manual M11; consider server-side validation |
| ~~U3~~ | ~~Contrast regressions~~ | **CLOSED** — `tests/a11y.spec.js` measures computed colour against the real rendered background, plus axe on every public route | — |
| ~~U4~~ | ~~Visual layout regressions~~ | **CLOSED** — `tests/brand.spec.js` records full-page baselines at 1440/768/393 | — |
| **U5** | Mockup parity | `AdminDashboard.jsx` renders correct tokens but its **layout** still differs from `design/admin-dashboard-mockup.html` | Structural rewrite, tracked separately |
| **U6** | `mobile/` app | Out of scope by decision D5; will visibly diverge | Track as a separate migration |

---

## 5. Suggested CI gate

```yaml
- run: npm ci
- run: npm run lint:gate            # fails only on NEW lint errors
- run: npm run audit:brand          # fails the build on any brand regression
- run: node scripts/brand-audit.selftest.mjs   # proves the audit still works
- run: npm run build
```

`audit:brand` is fast (single pass over 158 files) and has no dependencies
beyond Node, so it is safe to run on every push.


---

## 6. Round-two coverage (auth, emoji, icons, headers, dashboards)

`tests/authenticated.spec.js` (12) and `tests/dashboards.spec.js` (15) —
272 Playwright assertions across desktop / tablet / mobile.

### 6.1 Authenticated fixture

`tests/auth.js` seeds `localStorage.accessToken` and fulfils `/auth/me` with
one of three users (admin / employee / manager). Every other endpoint returns a
valid empty envelope, so pages must render chrome and zero states with no
backend — which is exactly the presentation coverage the rebrand needs.

| Case | Asserts |
|---|---|
| 13 admin + 11 employee routes | mounts, no page error, **not blank**, no retired hue, no bold `h1–h3`, no non-pill surfaced button, no emoji, no status colour as a non-status action, no sideways scroll |
| Role gating | employee bounced off `/admin`, anonymous sent to `/login`, manager reaches both consoles |
| Rail | gradient carrier found by walking the subtree; all 12 destinations mount |

### 6.2 Dashboards, heroes, icons, 404

| Case | Asserts |
|---|---|
| Hero on 7 routes | a `linear-gradient` slab containing the `h1`, with **> 2 distinct stops** |
| Hero consistency | all page heroes resolve to **one identical** gradient string |
| Hero title | weight 500, General Sans, white clears 3:1 at the gradient's **lightest** stop |
| KPI tiles | mono captions, the four labels, `tabular-nums` |
| **Sparkline degenerate data** | with every counter at 0 the series is flat — the division-by-zero case. No throw, and no `NaN`/`Infinity` in any path `d` |
| Delta chips | carry a label (never colour alone) and clear 4.5:1 on their tint |
| Icons on 5 routes | no React #31, > 3 SVGs present, no literal `[object Object]` |
| Composer | offers icon markers, renders no emoji |
| **404 catch-all** | 5 unmatched paths — including `/admin/settings` (the real path is `/admin/settings/admin-settings`), a traversal-shaped path and a percent-encoded one — all render content, none throw; the page names the bad path and routes back role-appropriately |

### 6.3 Defects these found

| Defect | Detail |
|---|---|
| **341 non-pill buttons** | `/<button.*?>/s` stops at the `>` inside `onClick={() => …}`. Replaced with a brace-balancing scanner (`scripts/jsx-tags.mjs`) shared by the sweep and check S1 |
| **`/login` rendered 0 characters** | React #31 from an icon config rendered as a text child. Every existing test passed — a blank page has no contrast, scroll or emoji violations |
| **No catch-all route** | 65 routes, no `path="*"`; any typo gave a silent blank screen |
| **Status colour as brand action** | "Run Payroll" was an amber gradient, "Announce" amber |
| **Hero title at 2.98:1** | The gradient's lightest stop `#818CF8` put white large text just under the 3:1 floor. Now `#7480F4` at 3.42 |
| **Adjacent duplicate gradient stops** | `#047857 0%, #047857 50%, #3730A3` renders a flat band; C3 only caught *all*-identical stops |
| **Two bespoke page heroes** | `JobRoles.jsx` and `SuperSubscriptionBillingPage.jsx` (the latter a **green** hero) |

### 6.4 Test bugs found by running them

Worth recording separately — these were faults in the tests, not the app:

- `test.use({ reducedMotion })` inside a `describe` is silently overridden by the project-level `use`; `page.emulateMedia()` is authoritative.
- axe measured **mid-fade**, reporting a `#0F172A` label as `#A1A4AB`.
- `effectiveBackground()` read only `background-color`, walking past a gradient to the page white — reporting white-on-hero text as 1.06:1.
- Regexes for E2/E3/E4 initially matched prop passes, destructuring and avatar chips.
- A fixed `waitForTimeout` in role gating flaked under parallel workers; now waits on the URL.
