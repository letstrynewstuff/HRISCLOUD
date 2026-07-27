import { defineConfig, devices } from "@playwright/test";

/**
 * Browser-level coverage for the rebrand — the gaps the static audit cannot
 * reach (BRAND-TEST-PLAN.md §4.1 U3/U4): computed styles, real contrast,
 * layout at breakpoints, and behaviour under reduced motion.
 *
 *   npm run test:e2e            # headless
 *   npm run test:e2e:ui         # interactive
 *   npm run test:e2e -- --update-snapshots
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],

  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "tablet", use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],

  // Preview serves the production build — the same bundle users get, so the
  // @import ordering and Tailwind output are exercised as shipped.
  webServer: {
    command: "npm run build && npm run preview -- --port 4173",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
