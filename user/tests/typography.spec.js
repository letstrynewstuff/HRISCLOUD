import { test, expect } from "@playwright/test";
import { PUBLIC_ROUTES, fontsReady } from "./helpers.js";

/**
 * Covers BRAND-TEST-PLAN.md §3.1 M1–M6 — the cases the static audit cannot
 * reach, because "the CSS rule exists" is not the same as "the browser
 * resolved it".
 */

test.describe("typography", () => {
  test("M1 — both webfonts actually load over the network", async ({ page }) => {
    const fontRequests = [];
    page.on("response", (r) => {
      const u = r.url();
      if (/fontshare|gstatic|googleapis/.test(u)) fontRequests.push({ url: u, status: r.status() });
    });

    await page.goto("/");
    await fontsReady(page);

    const families = await page.evaluate(() =>
      [...document.fonts].map((f) => f.family.replace(/["']/g, "")),
    );

    expect(families, "General Sans should be registered").toContain("General Sans");
    expect(families, "DM Mono should be registered").toContain("DM Mono");
    // Nothing that was fetched may have failed
    expect(fontRequests.filter((r) => r.status >= 400)).toEqual([]);
  });

  test("M2 — body resolves to General Sans, not the fallback", async ({ page }) => {
    await page.goto("/");
    await fontsReady(page);

    const family = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    expect(family).toContain("General Sans");

    // Prove the face is genuinely applied, not just declared: General Sans and
    // system-ui render the same string at measurably different widths.
    const measured = await page.evaluate(() => {
      const make = (f) => {
        const s = document.createElement("span");
        s.textContent = "Employee Management 0123456789";
        s.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font-size:32px;font-family:${f}`;
        document.body.appendChild(s);
        const w = s.getBoundingClientRect().width;
        s.remove();
        return w;
      };
      return { brand: make('"General Sans"'), fallback: make("system-ui") };
    });
    expect(Math.abs(measured.brand - measured.fallback)).toBeGreaterThan(0.5);
  });

  test("M3 — display headings sit at weight 500 (D3)", async ({ page }) => {
    await page.goto("/");
    await fontsReady(page);

    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();

    const style = await h1.evaluate((el) => {
      const s = getComputedStyle(el);
      return { weight: s.fontWeight, tracking: s.letterSpacing, family: s.fontFamily };
    });
    expect(style.weight).toBe("500");
    expect(style.family).toContain("General Sans");
    // -0.03em at the hero's clamped size
    expect(parseFloat(style.tracking)).toBeLessThan(0);
  });

  test("M3b — every h1–h3 on public pages is 500", async ({ page }) => {
    for (const route of PUBLIC_ROUTES) {
      await page.goto(route);
      await fontsReady(page);

      const heavy = await page.evaluate(() =>
        [...document.querySelectorAll("h1,h2,h3")]
          .filter((el) => el.offsetParent !== null)
          .map((el) => ({ tag: el.tagName, weight: getComputedStyle(el).fontWeight, text: el.textContent.trim().slice(0, 40) }))
          .filter((h) => +h.weight > 500),
      );
      expect(heavy, `heavy headings on ${route}`).toEqual([]);
    }
  });

  test("M6 — mono labels use DM Mono with wide tracking", async ({ page }) => {
    await page.goto("/");
    await fontsReady(page);

    const eyebrow = page.locator(".mk-eyebrow").first();
    await expect(eyebrow).toBeVisible();

    const s = await eyebrow.evaluate((el) => {
      const c = getComputedStyle(el);
      return { family: c.fontFamily, transform: c.textTransform, tracking: parseFloat(c.letterSpacing) };
    });
    expect(s.family).toContain("DM Mono");
    expect(s.transform).toBe("uppercase");
    expect(s.tracking).toBeGreaterThan(0);
  });

  test("M5 — blocked webfonts degrade without breaking layout", async ({ page }) => {
    await page.route("**://api.fontshare.com/**", (r) => r.abort());
    await page.route("**://fonts.googleapis.com/**", (r) => r.abort());
    await page.route("**://fonts.gstatic.com/**", (r) => r.abort());

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Falls back rather than rendering nothing
    const family = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    expect(family).toMatch(/system-ui|General Sans/);

    // Text is visible during and after fallback (display=swap)
    await expect(page.locator("h1").first()).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflow, "fallback font must not cause horizontal scroll").toBe(false);
  });
});
