/**
 * scripts/jsx-tags.mjs
 *
 * Extract the attribute text of a JSX opening tag correctly.
 *
 * A naive /<button\b(.*?)>/s stops at the first ">" — which an arrow function
 * (`onClick={() => save()}`) supplies inside the attributes. That truncates
 * the match and silently hides everything after it, which is how 20+
 * `rounded-xl` buttons survived several sweeps and a static check.
 *
 * This walks the tag, tracking brace depth and string state, so it stops at
 * the ">" that actually closes the tag.
 */

export function findOpeningTags(src, names) {
  const alt = names.map((n) => n.replace(".", "\\.")).join("|");
  const start = new RegExp(`<(${alt})(?=[\\s/>])`, "g");
  const out = [];

  for (const m of src.matchAll(start)) {
    let i = m.index + m[0].length;
    let depth = 0;
    let quote = null;
    let tick = false;

    while (i < src.length) {
      const c = src[i];

      if (quote) {
        if (c === "\\") i++;
        else if (c === quote) quote = null;
      } else if (tick) {
        if (c === "\\") i++;
        else if (c === "`") tick = false;
      } else if (c === '"' || c === "'") {
        quote = c;
      } else if (c === "`") {
        tick = true;
      } else if (c === "{") {
        depth++;
      } else if (c === "}") {
        depth--;
      } else if (c === ">" && depth === 0) {
        break;
      }
      i++;
    }

    out.push({
      tag: m[1],
      attrsStart: m.index + m[0].length,
      attrsEnd: i,
      attrs: src.slice(m.index + m[0].length, i),
      index: m.index,
    });
  }
  return out;
}

export const BUTTON_TAGS = ["button", "Motion.button", "motion.button"];
