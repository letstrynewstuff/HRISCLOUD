import { test, expect } from "@playwright/test";
import { PUBLIC_ROUTES, hasHorizontalScroll, fontsReady, parseRGB } from "./helpers.js";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Covers §3.2 M7–M12 and §3.5 R1–R5 — brand conformance as rendered, plus the
 * visual regression baselines that close gap U4.
 */

const RETIRED_HUES = [
  { name: "cyan", rgb: [6, 182, 212] },
  { name: "violet", rgb: [139, 92, 246] },
  { name: "pink", rgb: [236, 72, 153] },
  { name: "teal", rgb: [13, 148, 136] },
];

test.describe("brand conformance, as rendered", () => {
  test("M9 — every visible button renders a pill", async ({ page }) => {
    await page.goto("/");
    await fontsReady(page);

    const notPill = await page.evaluate(() =>
      [...document.querySelectorAll("button")]
        .filter((el) => el.offsetParent !== null && el.getBoundingClientRect().height > 0)
        .map((el) => {
          const r = parseFloat(getComputedStyle(el).borderTopLeftRadius);
          const h = el.getBoundingClientRect().height;
          return { text: el.textContent.trim().slice(0, 28), radius: r, height: h };
        })
        // A pill's radius is at least half its height (or the 64px token)
        .filter((b) => b.radius < Math.min(b.height / 2, 64) - 0.5),
    );
    expect(notPill).toEqual([]);
  });

  test("M11 — no retired hue is painted anywhere on a public page", async ({ page }) => {
    for (const route of PUBLIC_ROUTES) {
      await page.goto(route);
      await fontsReady(page);

      const found = await page.evaluate((hues) => {
        const hits = [];
        const near = (c, t) => c && Math.abs(c[0] - t[0]) < 12 && Math.abs(c[1] - t[1]) < 12 && Math.abs(c[2] - t[2]) < 12;
        const parse = (s) => {
          const m = s.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/);
          return m ? [+m[1], +m[2], +m[3]] : null;
        };
        for (const el of document.querySelectorAll("*")) {
          if (el.offsetParent === null) continue;
          const s = getComputedStyle(el);
          for (const prop of ["color", "backgroundColor", "borderTopColor"]) {
            const c = parse(s[prop]);
            for (const h of hues) {
              if (near(c, h.rgb)) {
                hits.push(`${h.name} in ${prop} on ${el.tagName}.${el.className}`.slice(0, 90));
              }
            }
          }
        }
        return [...new Set(hits)];
      }, RETIRED_HUES);

      expect(found, `retired hues rendered on ${route}`).toEqual([]);
    }
  });

  test("M8 — hero and closing CTA paint a real gradient", async ({ page }) => {
    await page.goto("/");
    await fontsReady(page);

    for (const sel of [".mk-hero", ".mk-close"]) {
      const bg = await page.locator(sel).evaluate((el) => getComputedStyle(el).backgroundImage);
      expect(bg, `${sel} must carry a gradient`).toContain("linear-gradient");

      // More than two distinct stops — proves it did not collapse to a flat fill
      const stops = [...new Set(bg.match(/rgba?\([^)]+\)/g) ?? [])];
      expect(stops.length, `${sel} distinct gradient stops`).toBeGreaterThan(2);
    }
  });

  test("M12 — cards use a hairline border and flat depth", async ({ page }) => {
    await page.goto("/");
    await fontsReady(page);

    const card = page.locator(".mk-card").first();
    await card.scrollIntoViewIfNeeded();

    const s = await card.evaluate((el) => {
      const c = getComputedStyle(el);
      return { border: c.borderTopWidth, color: c.borderTopColor, shadow: c.boxShadow };
    });
    expect(parseFloat(s.border)).toBeLessThanOrEqual(1);
    // No coloured glow: the shadow must be neutral, not indigo
    if (s.shadow !== "none") {
      const rgb = parseRGB(s.shadow);
      if (rgb) {
        const [r, g, b] = rgb;
        expect(Math.abs(b - r), "shadow must not be tinted indigo").toBeLessThan(60);
      }
    }
  });
});

test.describe("responsive (R1–R5)", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`renders and does not scroll sideways: ${route}`, async ({ page }) => {
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(route);
      await fontsReady(page);
      await page.waitForTimeout(200);

      expect(errors, `uncaught error on ${route}`).toEqual([]);
      const chars = (await page.locator("body").innerText()).trim().length;
      expect(chars, `${route} rendered a blank page`).toBeGreaterThan(40);
      expect(await hasHorizontalScroll(page), `${route} scrolls sideways`).toBe(false);
    });
  }

  test("R4 — content caps at 1120px on wide viewports", async ({ page, viewport }) => {
    test.skip(viewport.width < 1200, "desktop only");
    await page.goto("/");
    const width = await page.locator(".mk-shell").first().evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeLessThanOrEqual(1120);
  });

  test("R2/R5 — nav collapses and the deck fits at narrow widths", async ({ page, viewport }) => {
    await page.goto("/");
    await fontsReady(page);

    const burgerVisible = await page.locator(".mk-nav__burger").isVisible();
    const linksVisible = await page.locator(".mk-nav__links").isVisible();

    if (viewport.width <= 768) {
      expect(burgerVisible, "burger should show under 768px").toBe(true);
      expect(linksVisible, "inline links should hide under 768px").toBe(false);
    } else {
      expect(linksVisible, "inline links should show above 768px").toBe(true);
    }

    await page.locator("#features").scrollIntoViewIfNeeded();
    expect(await hasHorizontalScroll(page), "deck must not overflow").toBe(false);
  });
});

/**
 * Visual baselines — gap U4.
 *
 * Screenshots are NOT portable across operating systems: font rasterisation,
 * subpixel antialiasing and scrollbar metrics all differ, which is why
 * Playwright suffixes them -darwin / -win32 / -linux. The committed baselines
 * are rendered in the official Playwright container (`npm run test:visual`),
 * so one -linux set is authoritative on macOS, Windows and Linux alike.
 *
 * Running natively on a host with no matching baseline SKIPS rather than
 * fails — a Windows developer must not be blocked by a diff they cannot
 * legitimately resolve. CI runs the containerised job, where it never skips.
 */
const SNAP_DIR = join(dirname(fileURLToPath(import.meta.url)), "brand.spec.js-snapshots");

/**
 * Whether to skip. Only a NATIVE run on a host with no baseline skips —
 * inside the container CI=1, so it always runs and can therefore record the
 * first `-linux` set and fail honestly on a real diff.
 */
function skipVisual(name, projectName) {
  if (process.env.CI) return false;
  return !existsSync(join(SNAP_DIR, `${name}-${projectName}-${process.platform}.png`));
}

test.describe("visual regression", () => {
  test("landing page", async ({ page }, testInfo) => {
    test.skip(
      skipVisual("landing", testInfo.project.name),
      `no ${process.platform} baseline — run \`npm run test:visual\` (containerised, portable)`,
    );
    await page.goto("/");
    await fontsReady(page);
    await page.waitForTimeout(400);
    await expect(page).toHaveScreenshot("landing.png", {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.02,
      // the deck rotates on a timer
      mask: [page.locator(".mk-deck__stage")],
    });
  });

  test("request demo", async ({ page }, testInfo) => {
    test.skip(
      skipVisual("request-demo", testInfo.project.name),
      `no ${process.platform} baseline — run \`npm run test:visual\` (containerised, portable)`,
    );
    await page.goto("/request-demo");
    await fontsReady(page);
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot("request-demo.png", {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.02,
    });
  });

  test("login", async ({ page }, testInfo) => {
    test.skip(
      skipVisual("login", testInfo.project.name),
      `no ${process.platform} baseline — run \`npm run test:visual\` (containerised, portable)`,
    );
    await page.goto("/login");
    await fontsReady(page);
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot("login.png", {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.02,
    });
  });
});
