import { test, expect } from "@playwright/test";
import { fontsReady } from "./helpers.js";

/**
 * Covers §3.3 M13/M14/M19 and §3.4 A4 — the behavioural cases. These prove the
 * rewrites (LandingPage 1,729→818, RequestDemo 1,752→384) preserved behaviour,
 * and that reduced motion is honoured at runtime rather than just declared.
 */

test.describe("feature deck", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await fontsReady(page);
    await page.locator("#features").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
  });

  const activeTitle = (page) =>
    page.locator('.mk-card[data-slot="0"] h3').textContent();

  test("M19 — autoplay advances one card every 5s", async ({ page }) => {
    const first = await activeTitle(page);
    await expect(page.locator('.mk-card[data-slot="0"]')).toHaveCount(1);

    await page.waitForTimeout(5600);
    const second = await activeTitle(page);
    expect(second).not.toBe(first);

    // Exactly one slot of each kind at any moment
    await expect(page.locator('.mk-card[data-slot="0"]')).toHaveCount(1);
    await expect(page.locator('.mk-card[data-slot="next"]')).toHaveCount(1);
    await expect(page.locator('.mk-card[data-slot="prev"]')).toHaveCount(1);
  });

  test("M19 — hovering holds the current card", async ({ page }) => {
    await page.locator(".mk-deck__stage").hover();
    const held = await activeTitle(page);
    await page.waitForTimeout(6000);
    expect(await activeTitle(page)).toBe(held);
  });

  test("M19 — arrows, dots and keyboard all navigate", async ({ page }) => {
    await page.locator(".mk-deck__stage").hover(); // freeze autoplay
    const start = await activeTitle(page);

    await page.locator('.mk-deck__arrow[aria-label="Next function"]').click();
    const afterNext = await activeTitle(page);
    expect(afterNext).not.toBe(start);

    await page.locator('.mk-deck__arrow[aria-label="Previous function"]').click();
    expect(await activeTitle(page)).toBe(start);

    // Dots jump directly
    await page.locator(".mk-deck__dot").nth(4).click();
    await expect(page.locator('.mk-deck__dot[aria-current="true"]')).toHaveCount(1);

    // Keyboard
    const before = await activeTitle(page);
    await page.locator(".mk-deck__dot").nth(4).press("ArrowRight");
    expect(await activeTitle(page)).not.toBe(before);
  });

  test("M19 — clicking a flanking card brings it forward", async ({ page, viewport }) => {
    // The deck clips at its container edge, so below ~1000px the flanking card
    // is mostly outside the visible stage and is not a real hit target. Arrows
    // and dots are the affordance there, and both are covered above.
    test.skip(viewport.width < 1000, "flanking cards are clipped below 1000px");

    await page.locator(".mk-deck__stage").hover();
    const nextTitle = await page.locator('.mk-card[data-slot="next"] h3').textContent();
    await page.locator('.mk-card[data-slot="next"]').click({ force: true });
    await page.waitForTimeout(500);
    expect(await activeTitle(page)).toBe(nextTitle);
  });
});

test.describe("request-demo form", () => {
  test("M13 — empty submit surfaces four field errors", async ({ page }) => {
    await page.goto("/request-demo");
    await fontsReady(page);

    await page.getByRole("button", { name: /Request My Free Demo/i }).click();

    for (const msg of [
      "Your name is required.",
      "Email address is required.",
      "Company name is required.",
      "Please select your team size.",
    ]) {
      await expect(page.getByText(msg, { exact: true })).toBeVisible();
    }

    await expect(page.locator(".mk-field--error")).toHaveCount(4);
    // Still on step 1 — no navigation occurred
    await expect(page.getByRole("heading", { name: /Request a Free Demo/i })).toBeVisible();
  });

  test("M13b — malformed email is rejected, and typing clears the error", async ({ page }) => {
    await page.goto("/request-demo");
    await page.getByPlaceholder("e.g. Adaeze Okonkwo").fill("Adaeze Okonkwo");
    await page.getByPlaceholder("you@yourcompany.com").fill("adaeze@");
    await page.getByPlaceholder("e.g. Acme Technologies Ltd").fill("Acme Technologies Ltd");
    await page.locator("select").selectOption({ index: 3 });

    await page.getByRole("button", { name: /Request My Free Demo/i }).click();
    await expect(page.getByText("Please enter a valid email.")).toBeVisible();
    await expect(page.locator(".mk-field--error")).toHaveCount(1);

    await page.getByPlaceholder("you@yourcompany.com").fill("adaeze@acme.ng");
    await expect(page.getByText("Please enter a valid email.")).toHaveCount(0);
  });

  test("M14 — a valid submission reaches the confirmation screen", async ({ page }) => {
    await page.goto("/request-demo");

    // Intercept the mailto: so the run does not try to open a mail client
    let mailto = null;
    await page.route("mailto:**", (r) => { mailto = r.request().url(); r.abort(); });
    page.on("dialog", (d) => d.dismiss());

    await page.getByPlaceholder("e.g. Adaeze Okonkwo").fill("Adaeze Okonkwo");
    await page.getByPlaceholder("you@yourcompany.com").fill("adaeze@acme.ng");
    await page.getByPlaceholder("e.g. Acme Technologies Ltd").fill("Acme Technologies Ltd");
    await page.locator("select").selectOption({ index: 3 });
    await page.getByRole("button", { name: /Request My Free Demo/i }).click();

    await expect(page.getByRole("heading", { name: "Request Sent" })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("What happens next")).toBeVisible();
    await expect(page.getByRole("button", { name: "Back to Home" })).toBeVisible();
  });
});

test.describe("reduced motion (A4)", () => {
  test("deck does not autoplay and reveals are immediate", async ({ page }) => {
    // NOTE: `test.use({ reducedMotion })` inside a describe is silently
    // overridden by the project-level `use`, so the emulation never applied
    // and this test failed for the wrong reason. emulateMedia is authoritative.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("#features").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Guard the emulation itself — a silently-unapplied reducedMotion setting
    // would make this test pass or fail for the wrong reason.
    expect(
      await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches),
      "reducedMotion emulation must be active",
    ).toBe(true);

    const first = await page.locator('.mk-card[data-slot="0"] h3').textContent();
    await page.waitForTimeout(6000);
    expect(await page.locator('.mk-card[data-slot="0"] h3').textContent()).toBe(first);

    // Reveals render visible rather than animating in
    const opacity = await page.locator(".mk-reveal").first().evaluate(
      (el) => getComputedStyle(el).opacity,
    );
    expect(+opacity).toBe(1);

    // Durations collapse
    // getPropertyValue normalises 120ms to ".12s" — compare in seconds
    const dur = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--dur-short").trim(),
    );
    const seconds = dur.endsWith("ms") ? parseFloat(dur) / 1000 : parseFloat(dur);
    expect(seconds).toBeCloseTo(0.12, 3);
  });
});
