// src/hooks/chatHelpers.ts
// Shared utilities used by both Team and Chat screens.

export function colorFor(str = "") {
  const cols = [
    "#4F46E5",
    "#06B6D4",
    "#10B981",
    "#F59E0B",
    "#EC4899",
    "#8B5CF6",
    "#EF4444",
    "#F97316",
  ];
  let h = 0;
  for (const c of str) h = c.charCodeAt(0) + ((h << 5) - h);
  return cols[Math.abs(h) % cols.length];
}

export function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

export function fmtTime(d?: string | null) {
  if (!d) return "";
  const dt = new Date(d);
  const now = new Date();
  const isToday = dt.toDateString() === now.toDateString();
  return isToday
    ? dt.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })
    : dt.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

export function isImageMime(mime?: string) {
  return !!mime?.startsWith("image/");
}

export function isManager(role?: string, isManagerFlag?: boolean) {
  return (
    isManagerFlag === true ||
    ["manager", "hr_admin", "super_admin"].includes(role ?? "")
  );
}
