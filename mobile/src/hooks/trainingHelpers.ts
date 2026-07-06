// src/hooks/trainingHelpers.ts
// Shared helpers for the mobile Training module — mirrors the formatting
// utilities scattered across the web training pages (TrainingCatalog,
// TrainingBudget, TrainingAttendance, CertificationTracker).

export const TRAINING_TYPE_CFG: Record<string, { bg: string; color: string }> =
  {
    Internal: { bg: "#EEF2FF", color: "#4F46E5" },
    External: { bg: "#ECFEFF", color: "#06B6D4" },
  };

export const CERT_STATUS_CFG: Record<string, { bg: string; color: string }> = {
  Valid: { bg: "#D1FAE5", color: "#059669" },
  Expiring: { bg: "#FEF3C7", color: "#D97706" },
  Expired: { bg: "#FEE2E2", color: "#DC2626" },
};

export const ATTENDANCE_STATUS_CFG: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  attended: { bg: "#D1FAE5", color: "#059669", label: "Attended" },
  absent: { bg: "#FEE2E2", color: "#DC2626", label: "Absent" },
  pending: { bg: "#F1F5F9", color: "#64748B", label: "Pending" },
};

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fmtShortDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

// Naira formatting, mirroring the ₦(value/1000)K and ₦(value/1_000_000)M
// patterns used across the web training pages.
export function fmtNairaCompact(value?: number | null) {
  const n = Number(value ?? 0);
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1000).toFixed(0)}K`;
  return `₦${n.toLocaleString()}`;
}

export function fmtNairaPrecise(value?: number | null) {
  const n = Number(value ?? 0);
  return `₦${(n / 1_000_000).toFixed(2)}M`;
}
