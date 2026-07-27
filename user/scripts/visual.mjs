#!/usr/bin/env node
/**
 * scripts/visual.mjs
 *
 * Runs the visual-regression tests inside the official Playwright container so
 * screenshots are byte-identical on macOS, Windows and Linux.
 *
 * Font rasterisation, subpixel antialiasing and scrollbar metrics all differ
 * per OS, so a baseline recorded on macOS can never match a Windows run —
 * Playwright names them `-darwin` / `-win32` / `-linux` precisely because they
 * are not interchangeable. Rendering in one fixed container removes the
 * variable entirely: everyone compares against the same `-linux` baseline.
 *
 *   npm run test:visual            # verify against the committed baselines
 *   npm run test:visual:update     # re-record them (review the diff!)
 *
 * Requires Docker. Without it, `npm run test:e2e` still runs everything else —
 * the visual specs skip themselves when no baseline exists for the host.
 */

import { execFileSync, execSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const VERSION = require("@playwright/test/package.json").version;
const IMAGE = `mcr.microsoft.com/playwright:v${VERSION}-noble`;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const update = process.argv.includes("--update");

try {
  execSync("docker info", { stdio: "ignore" });
} catch {
  console.error(
    "\n  Docker is not running.\n\n" +
      "  Visual baselines are rendered in a container so they match on every OS.\n" +
      "  Start Docker and re-run, or run `npm run test:e2e` — the visual specs\n" +
      "  skip themselves when there is no baseline for your platform.\n",
  );
  process.exit(2);
}

// The container needs the browsers the image already ships, and a writable
// node_modules — mounting the host's would drop in darwin/win32 binaries.
const args = [
  "run", "--rm", "--init",
  "--ipc=host",                       // Chromium needs more than the 64MB default
  "-v", `${ROOT}:/work`,
  "-v", "bantahr-pw-modules:/work/node_modules",
  "-w", "/work",
  "-e", "CI=1",
  IMAGE,
  "bash", "-lc",
  [
    "npm ci --no-audit --no-fund",
    `npx playwright test --grep 'visual regression'${update ? " --update-snapshots" : ""}`,
  ].join(" && "),
];

console.log(`\n  ${update ? "Recording" : "Verifying"} visual baselines in ${IMAGE}\n`);

try {
  execFileSync("docker", args, { stdio: "inherit" });
  console.log(
    update
      ? "\n  Baselines re-recorded as -linux. Review the diff before committing.\n"
      : "\n  Visual baselines match.\n",
  );
} catch {
  process.exit(1);
}
