# BantaHR rebrand — frontend migration map

Applying the Appt-derived design system (BantaHR indigo `#4F46E5`, General Sans +
DM Mono, pill controls, flat depth, gradient indigo surfaces) across `user/`.

Reference mockups (versioned in `design/`, never served):
`design/marketing-mockup.html` · `design/admin-dashboard-mockup.html`

---

## 1. What we're actually working with

Measured across `user/src` — 159 `.jsx`/`.js` files, 96,480 lines.

| Area | Files | Already imports `styles/colors.js` |
|---|---:|---:|
| `admin/` | 82 | 11 |
| `pages/` (employee + marketing) | 27 | 13 |
| `api/` | 21 | — |
| `components/` (shared chrome) | 12 | 3 |
| `super/` | 10 | 10 |
| `login/` | 3 | 3 |
| `styles/` | 2 | 1 |

### The finding that shapes everything

**A token layer exists but is mostly bypassed.**

| Signal | Count |
|---|---:|
| Hardcoded hex literals | **2,698** across **122 files** |
| Distinct hex values in use | **155** |
| Files importing `styles/colors.js` | **41** |

So 81 files paint themselves directly. A rebrand that edits `colors.js` changes
roughly a third of the app and leaves the rest on the old palette. **Establishing
the token layer is the migration; recolouring is the easy part afterwards.**

### Most-used hardcoded colours

| Hex | Uses | Role | Fate |
|---|---:|---|---|
| `#4F46E5` | 208 | Primary indigo | **Survives unchanged** — it's the new accent |
| `#EEF2FF` | 111 | Indigo 50 tint | Survives |
| `#D1FAE5` / `#10B981` | 105 / 101 | Success | **Survives** — status is reserved |
| `#EF4444` / `#FEE2E2` | 103 / 99 | Danger | Survives |
| `#F59E0B` / `#FEF3C7` | 99 / 99 | Warning | Survives |
| `#06B6D4` | **92** in 56 files | Cyan secondary | **No home in the new system** — see decision D1 |
| `#64748B` / `#94A3B8` / `#0F172A` | 91 / 81 / 77 | Text ramp | Survives |
| `#1E1B4B` | 75 | Navy ground | Becomes the deep end of gradients |

The good news buried in that table: **your primary, your status palette and your
text ramp all survive.** The rebrand is not a colour replacement — it's mostly
consolidation, gradients, type and shape.

### Type — there are three fonts running, not one

| Font | Where | Refs |
|---|---|---:|
| **Plus Jakarta Sans** | Global `body` + `@theme --font-sans` in `index.css` | app-wide default |
| **Sora** | Inline on headings | **279** in 82 files |
| **DM Sans** | Inline | 48 in 45 files |

The design system wants **two**: General Sans (display + body) and DM Mono
(labels only). So this is a 3 → 2 consolidation, and the 279 inline
`fontFamily: "Sora,sans-serif"` declarations are the bulk of the work.

### Shape, weight and depth

| Signal | Count | Tension with the new system |
|---|---:|---|
| `rounded-xl` | 1,201 | System says 16px card / 10px input — close, mostly fine |
| `rounded-2xl` | 553 | Slightly larger than the 16px card token |
| `rounded-full` | 427 | Already pill — these are correct |
| `font-semibold` | 1,000 | See decision D3 |
| `font-bold` | 967 | See decision D3 |
| `font-black` | 52 | Contradicts the system outright |
| Inline `boxShadow` | 271 | System is near-flat; most of these get dropped |
| `linear-gradient` | 207 | Many are indigo→cyan and change meaning under D1 |

---

## 2. Decisions needed before any code moves

These are yours, not mine. Each one changes the size of the job.

### D1 — What happens to cyan `#06B6D4`? *(92 uses, 56 files)*

Trusted Indigo is a **one-accent** system. Cyan currently carries the "HR" in the
logo, the gradient tails, and a slice of the feature icon palette.

| Option | Consequence |
|---|---|
| **A. Retire it** — remap to `#6366F1` (indigo 400) | Truest to the system. 207 gradients collapse toward monochrome; some need re-stopping so they don't go flat. Logo needs a new treatment for "HR". |
| **B. Demote to a data-only hue** | Cyan disappears from chrome but stays available for charts, where a second series legitimately needs a second hue. My recommendation. |
| **C. Keep as full secondary** | Cheapest. But then it isn't the Appt system anymore, it's your current brand with new type. |

### D2 — Does General Sans replace Plus Jakarta Sans app-wide?

Plus Jakarta Sans is loaded globally and is genuinely close to General Sans in
character. Replacing it touches one line; replacing the 279 inline Sora
declarations is the real cost.

- **Full swap** — one voice, matches the mockups exactly.
- **Marketing only** — landing/auth get General Sans, the app keeps Plus Jakarta.
  Cheap, but the two halves stop matching.

### D3 — Does "headings at weight 500, never bold" apply inside the app?

There are **2,019** `font-bold` + `font-semibold` instances. That rule is what
makes the marketing pages feel calm — but a dense admin table with no bold loses
its scanning anchors.

**My recommendation:** the 500 rule binds **display headings** (page titles, card
headings, hero type). Table headers, KPI values and inline emphasis keep their
weight. This is what the admin mockup already does.

### D4 — Do pills apply to app controls, or only marketing?

64px pills on a marketing CTA look confident; on a dense filter bar with eight
controls they waste horizontal space. The admin mockup uses pills for **buttons,
chips and search**, and keeps `10px` on inputs and `16px` on cards.

### D5 — Is the mobile app in scope?

`mobile/` is a separate codebase — **220 files**. Nothing in this plan touches it.
It will visibly diverge from the web app the day this ships.

---

## 3. The migration, in dependency order

### Phase 0 — Foundation *(2 files, blocks everything else)*

Build the token layer once so later phases are edits, not rewrites.

1. **`user/src/styles/colors.js`** — rewrite as the single source of truth.
   Keep every existing key name so the 41 files already importing it keep working
   and re-theme for free. Add the gradient ramps.
2. **`user/src/index.css`** — extend the Tailwind v4 `@theme` block so tokens
   become utilities (`bg-accent`, `text-ink-2`, `rounded-pill`). This is the
   leverage point: Tailwind v4's `@theme` means one file gives every component
   access without an import.
3. Add the font links; drop the Plus Jakarta import if D2 says full swap.

**Nothing visual changes yet.** That's the point — it's reversible.

### Phase 1 — Shared chrome *(~12 files, highest visual return)*

`components/NavbarNew.jsx` · `Header.jsx` · `MainLayout.jsx` · `MobileBottomNav.jsx`
· `Loader.jsx` · `admin/AdminSideNavbar.jsx` · `AdminMainLayout.jsx` ·
`AdminMobileBottomNav.jsx` · `styles/BantaHRLogo.jsx`

Twelve files that appear on **every** screen. Ship this and the whole app reads as
rebranded before a single page is touched. `BantaHRLogo.jsx` needs the D1 answer
first — its gradient and the cyan "HR" both depend on it.

### Phase 2 — Marketing + auth *(6 files)*

`pages/LandingPage.jsx` (1,729 lines) · `pages/RequestDemo.jsx` ·
`login/Login.jsx` · `Register.jsx` · `CompanyRegister.jsx` · `super/SuperAdminLogin.jsx`

LandingPage is the single biggest win and the mockup is already a 1:1 reference.
Recommend rewriting it against classes rather than porting its ~1,700 lines of
inline style objects.

### Phase 3 — Employee side *(27 files)*

`pages/` — Dashboard, Leave, Payslips, Attendance, Documents, Performance,
Training, Benefits, Team, Settings, Requests, Announcements, Chat, Profile,
timesheets/…

13 of 27 already import `colors.js`, so those re-theme largely for free once
Phase 0 lands. The other 14 need hex extraction.

### Phase 4 — Admin side *(82 files)*

The bulk. Only 11 of 82 use the token layer today.

Sub-areas, roughly by size: `employeemanagement/` (13) · `payroll/` ·
`accounting/` (6) · `attendance/` (6) · `Training/` (7) · `performance/` ·
`leavemanagement/` · `reports/` · `settings/` · `announcements/` (3) ·
`benefits/` · `documents/`

`AdminDashboard.jsx` (1,988 lines) first — it's the landing screen and the mockup
covers it.

### Phase 5 — Super admin *(10 files)*

All 10 already import `colors.js`. Should be close to free after Phase 0.

---

## 4. What will break if this is done carelessly

**Do not run a global find-and-replace on hex values.** Three specific traps:

1. **Flattening status colour.** Of the 155 distinct hex values, the
   success/warning/danger families are *semantic* — a script that maps "all
   non-indigo colour → indigo" destroys the meaning of every approval badge,
   payroll state and leave status in the app. Status colours are reserved and
   must survive untouched.

2. **Collapsing gradients.** 207 gradients, many running indigo → cyan. Replace
   cyan with indigo and they become invisible two-stop gradients of nearly the
   same colour. Each needs re-stopping against the new ramp, not substitution.

3. **Killing scannability.** Dropping 2,019 bold/semibold instances to weight 500
   would flatten every table, KPI and form label in the app. See D3.

**Also worth knowing:** the mockups revealed two live copy bugs in
`pages/LandingPage.jsx` that are independent of this work —
`"Limited offer Pricing"` (line 203) and `"Minimum 1 employees"` (line 188).

---

## 5. Rough shape of the effort

| Phase | Files | Character of the work |
|---|---:|---|
| 0 · Foundation | 2 | Design work, low volume, blocks all else |
| 1 · Shared chrome | ~12 | High leverage, moderate effort |
| 2 · Marketing + auth | 6 | One large rewrite, mockup exists |
| 3 · Employee side | 27 | ~half re-theme free |
| 4 · Admin side | 82 | The long tail |
| 5 · Super admin | 10 | Mostly free |

Phases 3–5 are independently shippable per page — no big-bang release needed, and
the app stays coherent throughout because Phase 1 sets the frame.
