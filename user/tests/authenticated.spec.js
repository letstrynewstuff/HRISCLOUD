import { test, expect, EMPLOYEE_ROUTES, ADMIN_ROUTES } from "./auth.js";
import { hasHorizontalScroll, fontsReady, contrast, parseRGB, effectiveBackground } from "./helpers.js";

/**
 * Brand conformance behind the auth wall — the gap the public-page suite could
 * not reach. Every admin and employee surface is checked for the same four
 * rules the static audit enforces, but as rendered.
 */

const RETIRED = [
  { name: "cyan", rgb: [6, 182, 212] },
  { name: "violet", rgb: [139, 92, 246] },
  { name: "pink", rgb: [236, 72, 153] },
  { name: "teal", rgb: [13, 148, 136] },
];

/** Collects every brand violation actually painted on the page. */
async function auditRendered(page) {
  return page.evaluate((hues) => {
    const parse = (s) => {
      const m = s.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s]+([\d.]+))?/);
      return m && (m[4] === undefined || +m[4] > 0.3) ? [+m[1], +m[2], +m[3]] : null;
    };
    const near = (c, t) =>
      c && Math.abs(c[0] - t[0]) < 14 && Math.abs(c[1] - t[1]) < 14 && Math.abs(c[2] - t[2]) < 14;

    const out = { hues: [], boldHeadings: [], squareButtons: [], emoji: [], statusAsAction: [] };
    const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}]/u;

    for (const el of document.querySelectorAll("*")) {
      if (el.offsetParent === null && el.tagName !== "BODY") continue;
      const s = getComputedStyle(el);

      for (const prop of ["color", "backgroundColor", "borderTopColor"]) {
        const c = parse(s[prop]);
        for (const h of hues)
          if (near(c, h.rgb)) out.hues.push(`${h.name} · ${prop} · ${el.tagName}.${String(el.className).slice(0, 30)}`);
      }

      if (/^H[123]$/.test(el.tagName) && +s.fontWeight > 500)
        out.boldHeadings.push(`${el.tagName} "${el.textContent.trim().slice(0, 30)}" @${s.fontWeight}`);

      // A reserved status colour must never fill a non-status control.
      // "Run Payroll" shipped as an amber gradient and "Announce" as amber —
      // both read as warnings for actions that are not warnings.
      if (el.tagName === "BUTTON" || el.tagName === "A") {
        const img = s.backgroundImage;
        const fill = parse(s.backgroundColor);
        const label = el.textContent.trim().toLowerCase();
        const isStatusAction =
          /clock|delete|remove|reject|decline|cancel|approve|discard|deactivate|terminate/.test(label);
        const AMBER = [245, 158, 11], GREEN = [16, 185, 129];
        const usesStatus =
          near(fill, AMBER) || near(fill, GREEN) ||
          /rgb\(245, 158, 11\)|rgb\(16, 185, 129\)/.test(img);
        if (usesStatus && !isStatusAction && label.length > 2)
          out.statusAsAction.push(`"${el.textContent.trim().slice(0, 26)}"`);
      }

      if (el.tagName === "BUTTON") {
        // D4 governs control SURFACES. A bare icon affordance with no
        // background and no border has nothing to round, so it is exempt.
        const hasFill = parse(s.backgroundColor) !== null;
        const hasEdge = parseFloat(s.borderTopWidth) > 0;
        const r = parseFloat(s.borderTopLeftRadius);
        const h = el.getBoundingClientRect().height;
        if ((hasFill || hasEdge) && h > 0 && r < Math.min(h / 2, 64) - 0.5)
          out.squareButtons.push(`"${el.textContent.trim().slice(0, 24)}" r=${r}`);
      }

      for (const n of el.childNodes)
        if (n.nodeType === 3 && EMOJI.test(n.textContent))
          out.emoji.push(`${el.tagName}: ${n.textContent.trim().slice(0, 30)}`);
    }
    const uniq = (a) => [...new Set(a)];
    return { hues: uniq(out.hues), boldHeadings: uniq(out.boldHeadings), squareButtons: uniq(out.squareButtons), emoji: uniq(out.emoji), statusAsAction: uniq(out.statusAsAction) };
  }, RETIRED);
}

test.describe("admin surfaces", () => {
  for (const route of ADMIN_ROUTES) {
    test(`brand conformance on ${route}`, async ({ as, page }) => {
      await as("admin");
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));

      await page.goto(route);
      await fontsReady(page);
      await page.waitForTimeout(900);

      // The route must actually mount, not bounce to /login or /dashboard
      expect(page.url(), `${route} redirected away — guard or mount failure`).toContain(route);
      expect(errors, `uncaught error on ${route}`).toEqual([]);

      // A blank page trivially passes every contrast, scroll and emoji check.
      // /login once rendered 0 characters after a bad icon swap and no test
      // noticed — so assert the page actually rendered something first.
      const chars = (await page.locator("body").innerText()).trim().length;
      expect(chars, `${route} rendered a blank page`).toBeGreaterThan(40);

      const a = await auditRendered(page);
      expect(a.hues, `retired hues on ${route}`).toEqual([]);
      expect(a.boldHeadings, `headings above weight 500 on ${route}`).toEqual([]);
      expect(a.squareButtons, `non-pill buttons on ${route}`).toEqual([]);
      expect(a.emoji, `emoji rendered on ${route}`).toEqual([]);
      expect(a.statusAsAction, `status colour used as a non-status action on ${route}`).toEqual([]);
      expect(await hasHorizontalScroll(page), `${route} scrolls sideways`).toBe(false);
    });
  }
});

test.describe("employee surfaces", () => {
  for (const route of EMPLOYEE_ROUTES) {
    test(`brand conformance on ${route}`, async ({ as, page }) => {
      await as("employee");
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));

      await page.goto(route);
      await fontsReady(page);
      await page.waitForTimeout(900);

      expect(page.url(), `${route} redirected away`).toContain(route);
      expect(errors, `uncaught error on ${route}`).toEqual([]);

      const chars = (await page.locator("body").innerText()).trim().length;
      expect(chars, `${route} rendered a blank page`).toBeGreaterThan(40);

      const a = await auditRendered(page);
      expect(a.hues, `retired hues on ${route}`).toEqual([]);
      expect(a.boldHeadings, `headings above weight 500 on ${route}`).toEqual([]);
      expect(a.squareButtons, `non-pill buttons on ${route}`).toEqual([]);
      expect(a.emoji, `emoji rendered on ${route}`).toEqual([]);
      expect(a.statusAsAction, `status colour used as a non-status action on ${route}`).toEqual([]);
      expect(await hasHorizontalScroll(page), `${route} scrolls sideways`).toBe(false);
    });
  }
});

test.describe("shared chrome", () => {
  test("admin rail renders the brand gradient", async ({ as, page }) => {
    await as("admin");
    await page.goto("/admin/dashboard");
    await fontsReady(page);

    // The <aside> is only a width wrapper — SidebarContent inside it paints
    // the gradient, so walk down to whichever descendant actually carries it.
    const bg = await page.locator("aside").first().evaluate((aside) => {
      const stack = [aside];
      while (stack.length) {
        const el = stack.shift();
        const img = getComputedStyle(el).backgroundImage;
        if (img.includes("linear-gradient")) return img;
        stack.push(...el.children);
      }
      return "none";
    });
    expect(bg, "the admin rail must paint the brand gradient").toContain("linear-gradient");
    expect([...new Set(bg.match(/rgba?\([^)]+\)/g) ?? [])].length).toBeGreaterThan(2);
  });

  test("every rail destination navigates and marks itself current", async ({ as, page }) => {
    await as("admin");
    await page.goto("/admin/dashboard");
    await fontsReady(page);

    const links = page.locator("aside a[href^='/admin']");
    const n = await links.count();
    expect(n, "admin rail destinations").toBeGreaterThanOrEqual(10);

    for (let i = 0; i < Math.min(n, 12); i++) {
      const href = await links.nth(i).getAttribute("href");
      await page.goto(href);
      await page.waitForTimeout(350);
      expect(page.url(), `${href} did not mount`).toContain(href);
    }
  });

  test("employee sidebar and bottom nav render on their breakpoints", async ({ as, page, viewport }) => {
    await as("employee");
    await page.goto("/dashboard");
    await fontsReady(page);
    await page.waitForTimeout(400);

    if (viewport.width >= 1024) {
      await expect(page.locator("aside").first()).toBeVisible();
    } else {
      await expect(page.locator("nav").last()).toBeVisible();
    }
  });
});

test.describe("role gating", () => {
  // These redirects happen once AuthContext resolves /auth/me, so wait on the
  // URL itself. A fixed sleep flaked under parallel workers — the guard was
  // correct, the test was just reading the URL mid-redirect.
  test("an employee is bounced off admin routes", async ({ as, page }) => {
    await as("employee");
    await page.goto("/admin/dashboard");
    await page.waitForURL((url) => !url.pathname.startsWith("/admin"), { timeout: 10_000 });
    expect(page.url(), "employee must not reach the admin console").not.toContain("/admin");
  });

  test("an unauthenticated visitor is sent to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    expect(page.url()).toContain("/login");
  });

  test("a manager reaches both the admin console and the manager profile", async ({ as, page }) => {
    await as("manager");

    await page.goto("/admin/dashboard");
    await expect
      .poll(() => new URL(page.url()).pathname, { timeout: 10_000 })
      .toBe("/admin/dashboard");

    await page.goto("/managerprofile");
    await expect
      .poll(() => new URL(page.url()).pathname, { timeout: 10_000 })
      .toBe("/managerprofile");
  });
});
