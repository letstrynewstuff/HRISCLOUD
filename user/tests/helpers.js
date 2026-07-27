/** Shared helpers for the rebrand browser tests. */

/** Public routes — reachable without a seeded account. */
export const PUBLIC_ROUTES = ["/", "/request-demo", "/login", "/register"];

/** WCAG relative luminance. */
function luminance([r, g, b]) {
  const [R, G, B] = [r, g, b]
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function parseRGB(str) {
  const m = str.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (!m) return null;
  return [+m[1], +m[2], +m[3]];
}

export function contrast(fg, bg) {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

/**
 * The effective background behind an element: walk up until a non-transparent
 * background-color is found. Needed because most text sits on a gradient
 * ancestor rather than carrying its own fill.
 */
export async function effectiveBackground(locator) {
  return locator.evaluate((el) => {
    let node = el;
    while (node && node !== document.documentElement) {
      const cs = getComputedStyle(node);

      // A gradient ancestor IS the background. Reading only background-color
      // walks straight past it to the page white, which reported white-on-
      // gradient hero text as 1.06:1. Use the LIGHTEST stop — the worst case
      // for light text sitting on it.
      if (cs.backgroundImage && cs.backgroundImage.includes("gradient")) {
        const stops = cs.backgroundImage.match(/rgba?\([^)]+\)/g) ?? [];
        if (stops.length) {
          const lum = (c) => {
            const [r, g, b] = c.match(/[\d.]+/g).map(Number);
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
          };
          return stops.reduce((a, b) => (lum(b) > lum(a) ? b : a));
        }
      }

      const bg = cs.backgroundColor;
      const m = bg.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s]+([\d.]+))?/);
      if (m && (m[4] === undefined || +m[4] > 0.5)) return bg;
      node = node.parentElement;
    }
    return "rgb(255, 255, 255)";
  });
}

/** True when the document scrolls sideways — the classic responsive break. */
export async function hasHorizontalScroll(page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
}

/** Wait for webfonts so computed font-family and metrics are stable. */
export async function fontsReady(page) {
  await page.evaluate(() => document.fonts.ready);
}
