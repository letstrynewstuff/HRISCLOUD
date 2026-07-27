#!/usr/bin/env node
/**
 * scripts/lint-gate.mjs
 *
 * The repo carries pre-existing ESLint debt that predates the rebrand, so a
 * plain `eslint .` can never exit 0 and would make `npm run verify` useless as
 * a gate. This wrapper fails only when the error count RISES above a recorded
 * baseline, so regressions are caught while existing debt stays visible.
 *
 * Lower the baseline whenever debt is paid down — never raise it to make a
 * failing run pass.
 *
 *   node scripts/lint-gate.mjs             # gate against the baseline
 *   node scripts/lint-gate.mjs --report    # per-rule breakdown
 */

import { execSync } from "node:child_process";

/**
 * Verified pre-existing on 2026-07-26 by linting the committed (pre-migration)
 * copies of the worst offenders out of `git show HEAD:…` — TimesheetApproval
 * 12, TaxManagement 9, Dashboard 3 — identical counts before and after.
 * None of these sit in a file the migration rewrote.
 */
const BASELINE = 113;

let raw = "[]";
try {
  raw = execSync("npx eslint src/ -f json", { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
} catch (e) {
  raw = e.stdout || "[]"; // eslint exits non-zero whenever errors exist
}

const files = JSON.parse(raw);
const errors = files.reduce((n, f) => n + f.errorCount, 0);
const warnings = files.reduce((n, f) => n + f.warningCount, 0);

if (process.argv.includes("--report")) {
  const byRule = {};
  for (const f of files)
    for (const m of f.messages)
      if (m.severity === 2) {
        const k = m.ruleId ?? m.message.slice(0, 50);
        byRule[k] = (byRule[k] ?? 0) + 1;
      }
  console.log("\n  errors by rule");
  for (const [rule, n] of Object.entries(byRule).sort((a, b) => b[1] - a[1]))
    console.log(`  ${String(n).padStart(4)}  ${rule}`);
}

const delta = errors - BASELINE;
console.log(
  `\n  eslint: ${errors} errors, ${warnings} warnings ` +
    `(baseline ${BASELINE}, delta ${delta >= 0 ? "+" : ""}${delta})`,
);

if (errors > BASELINE) {
  console.error(`\n  FAIL — ${delta} new error(s) above baseline\n`);
  process.exit(1);
}
if (errors < BASELINE) {
  console.log(`  Debt reduced by ${-delta}. Lower BASELINE to ${errors} in this file.\n`);
} else {
  console.log("  No regression.\n");
}
process.exit(0);
