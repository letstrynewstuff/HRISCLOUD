import { test, expect } from "./auth.js";
import { fontsReady, hasHorizontalScroll, contrast, parseRGB, effectiveBackground } from "./helpers.js";

/**
 * Coverage for the dashboard rebuild, the shared PageHero, the KpiTile
 * sparkline, and the 404 catch-all.
 *
 * The emphasis is on the failure modes actually hit: a component rendered as
 * a text child blanking the page, a gradient collapsing to a flat fill, a
 * status colour standing in for a brand action, and unmatched routes rendering
 * nothing at all.
 */

const GRADIENT_STOPS = (bg) => [...new Set(bg.match(/rgba?\([^)]+\)/g) ?? [])];

/* ══════════════════════════════════════════════════════════════════════
   PAGE HERO
   ══════════════════════════════════════════════════════════════════════ */
test.describe("page hero", () => {
  const HERO_ROUTES = [
    ["admin", "/admin/dashboard"],
    ["admin", "/admin/attendance/admin-attendance"],
    ["admin", "/admin/documents/admin-documents"],
    ["admin", "/admin/leave-management"],
    ["admin", "/admin/payroll/admin-payroll"],
    ["employee", "/dashboard"],
    ["employee", "/leave"],
  ];

  for (const [who, route] of HERO_ROUTES) {
    test(`hero on ${route} is a real multi-stop gradient`, async ({ as, page }) => {
      await as(who);
      await page.goto(route);
      await fontsReady(page);
      await page.waitForTimeout(800);

      // The hero is the first white-on-gradient slab containing the page title
      const bg = await page.evaluate(() => {
        for (const el of document.querySelectorAll("div, header, section")) {
          const s = getComputedStyle(el);
          if (!s.backgroundImage.includes("linear-gradient")) continue;
          if (!el.querySelector("h1")) continue;
          if (el.getBoundingClientRect().height < 80) continue;
          return s.backgroundImage;
        }
        return null;
      });

      expect(bg, `${route} has no gradient page hero`).not.toBeNull();
      // >2 distinct stops proves it did not collapse to a flat fill
      expect(
        GRADIENT_STOPS(bg).length,
        `${route} hero has too few distinct stops — it reads flat`,
      ).toBeGreaterThan(2);
    });
  }

  test("every hero shares the same gradient", async ({ as, page }) => {
    await as("admin");
    const seen = [];
    for (const route of [
      "/admin/dashboard",
      "/admin/attendance/admin-attendance",
      "/admin/documents/admin-documents",
    ]) {
      await page.goto(route);
      await page.waitForTimeout(700);
      seen.push(
        await page.evaluate(() => {
          for (const el of document.querySelectorAll("div, header, section")) {
            const s = getComputedStyle(el);
            if (s.backgroundImage.includes("linear-gradient") && el.querySelector("h1"))
              return s.backgroundImage;
          }
          return null;
        }),
      );
    }
    expect(new Set(seen).size, "page heroes must all use one gradient").toBe(1);
  });

  test("hero title is display weight and legible on the gradient", async ({ as, page }) => {
    await as("admin");
    await page.goto("/admin/dashboard");
    await fontsReady(page);
    await page.waitForTimeout(700);

    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();

    const s = await h1.evaluate((el) => {
      const c = getComputedStyle(el);
      return { weight: c.fontWeight, family: c.fontFamily, color: c.color };
    });
    expect(s.weight).toBe("500");
    expect(s.family).toContain("General Sans");

    // white on the hero's mid-gradient must clear large-text contrast (3:1)
    const fg = parseRGB(s.color);
    const bg = parseRGB(await effectiveBackground(h1)) ?? [79, 70, 229];
    expect(contrast(fg, bg)).toBeGreaterThan(3);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   KPI TILES — including the sparkline edge cases
   ══════════════════════════════════════════════════════════════════════ */
test.describe("KPI tiles", () => {
  test("render with a value, caption and delta chip", async ({ as, page }) => {
    await as("admin");
    await page.goto("/admin/dashboard");
    await fontsReady(page);
    await page.waitForTimeout(900);

    const captions = page.locator(".label-mono");
    expect(await captions.count(), "expected mono KPI captions").toBeGreaterThan(3);

    for (const label of ["Total Headcount", "New Hires", "Active Staff", "On Leave Today"]) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }
  });

  test("values use tabular figures so columns align", async ({ as, page }) => {
    await as("admin");
    await page.goto("/admin/dashboard");
    await page.waitForTimeout(800);

    const variant = await page
      .locator(".tnum")
      .first()
      .evaluate((el) => getComputedStyle(el).fontVariantNumeric);
    expect(variant).toContain("tabular-nums");
  });

  test("sparklines survive degenerate data (zeros, flat series)", async ({ as, page }) => {
    // Every API returns empty, so all counters are 0 — a flat series is the
    // division-by-zero case for the sparkline scale.
    await as("admin");
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/admin/dashboard");
    await page.waitForTimeout(1000);
    expect(errors, "flat/zero series must not throw").toEqual([]);

    const paths = await page.evaluate(() =>
      [...document.querySelectorAll("svg path")]
        .map((p) => p.getAttribute("d"))
        .filter(Boolean),
    );
    // no NaN or Infinity leaked into any path
    const bad = paths.filter((d) => /NaN|Infinity|undefined/.test(d));
    expect(bad, "sparkline path contains NaN/Infinity").toEqual([]);
  });

  test("delta chips pair colour with an arrow or text, never colour alone", async ({ as, page }) => {
    await as("admin");
    await page.goto("/admin/dashboard");
    await page.waitForTimeout(900);

    const chips = page.locator(".chip-pill");
    const n = await chips.count();
    expect(n, "expected delta chips").toBeGreaterThan(0);

    for (let i = 0; i < n; i++) {
      const chip = chips.nth(i);
      if (!(await chip.isVisible())) continue;
      const text = (await chip.textContent()).trim();
      expect(text.length, "a chip must carry a label, not colour alone").toBeGreaterThan(0);

      // and the chip's own text must be legible on its tint
      const fg = parseRGB(await chip.evaluate((e) => getComputedStyle(e).color));
      const bg = parseRGB(await effectiveBackground(chip));
      if (fg && bg) expect(contrast(fg, bg), `chip "${text}"`).toBeGreaterThan(4.4);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════
   ICONS — the React #31 class of bug
   ══════════════════════════════════════════════════════════════════════ */
test.describe("icons", () => {
  const ICON_ROUTES = [
    ["admin", "/admin/announcements"],
    ["admin", "/admin/leave-management"],
    ["admin", "/admin/dashboard"],
    ["employee", "/announcements"],
    ["employee", "/leave"],
  ];

  for (const [who, route] of ICON_ROUTES) {
    test(`icons render as SVG, not text, on ${route}`, async ({ as, page }) => {
      await as(who);
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));

      await page.goto(route);
      await fontsReady(page);
      await page.waitForTimeout(900);

      // React error #31 is the specific failure of rendering a component object
      expect(
        errors.filter((e) => /Minified React error #31|object with keys/.test(e)),
        `${route} rendered a component as a text child`,
      ).toEqual([]);

      // and the page must have real icon markup
      const svgs = await page.locator("svg").count();
      expect(svgs, `${route} rendered no icons at all`).toBeGreaterThan(3);

      // nothing should render the literal string "[object Object]"
      const body = await page.locator("body").innerText();
      expect(body).not.toContain("[object Object]");
    });
  }

  test("the announcement composer offers icon markers, not emoji", async ({ as, page }) => {
    await as("admin");
    await page.goto("/admin/announcements/create");
    await page.waitForTimeout(900);

    const body = await page.locator("body").innerText();
    const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    expect(EMOJI.test(body), "composer still renders emoji").toBe(false);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   404 CATCH-ALL — unmatched routes used to render a blank page
   ══════════════════════════════════════════════════════════════════════ */
test.describe("unmatched routes", () => {
  const BAD = [
    "/definitely-not-a-page",
    "/admin/settings",              // the real path is /admin/settings/admin-settings
    "/admin/nope/deeper/still",
    "/dashboard/../../etc",
    "/leave%20request",
  ];

  for (const route of BAD) {
    test(`renders a 404 page, not a blank one: ${route}`, async ({ as, page }) => {
      await as("admin");
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));

      await page.goto(route);
      await page.waitForTimeout(700);

      const chars = (await page.locator("body").innerText()).trim().length;
      expect(chars, `${route} rendered a blank page`).toBeGreaterThan(40);
      expect(errors, `${route} threw`).toEqual([]);
    });
  }

  test("the 404 page offers a route back and names the bad path", async ({ as, page }) => {
    await as("admin");
    await page.goto("/admin/this-does-not-exist");
    await page.waitForTimeout(600);

    await expect(page.getByText("Error 404")).toBeVisible();
    await expect(page.getByRole("heading", { name: /doesn.t exist/i })).toBeVisible();
    await expect(page.getByText("/admin/this-does-not-exist")).toBeVisible();

    // an admin lands back in the admin console, not the employee dashboard
    const back = page.getByRole("link", { name: /Admin dashboard/i });
    await expect(back).toBeVisible();
    await back.click();
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 10_000 });
  });

  test("an employee's 404 routes back to the employee dashboard", async ({ as, page }) => {
    await as("employee");
    await page.goto("/nope");
    await page.waitForTimeout(600);
    await expect(page.getByRole("link", { name: /My dashboard/i })).toBeVisible();
  });
});
