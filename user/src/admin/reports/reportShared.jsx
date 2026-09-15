// src/admin/reports/reportShared.jsx
//
// Web port of src/components/shared/reports/reportShared.tsx (mobile).
// Same category/severity/status config + formatters, rendered as
// styled <span>/<div> instead of RN <View>/<Text>.
//
// Shared between the admin report views AND the employee report screen —
// import from here in both places rather than duplicating config.

import { C } from "../employeemanagement/sharedData";
// ^ Adjust this import path if your shared color palette (C) lives
//   somewhere else — it's the same `C` used throughout Offboarding.jsx.

/* ───────────────── Category config ───────────────── */
export const CATEGORY_CONFIG = {
  sexual_harassment: {
    label: "Sexual Harassment",
    color: "#EF4444",
    light: "#FEE2E2",
    icon: "🚫",
  },
  discrimination: {
    label: "Discrimination",
    color: "#8B5CF6",
    light: "#EDE9FE",
    icon: "⚖️",
  },
  bullying_harassment: {
    label: "Bullying / Harassment",
    color: "#EC4899",
    light: "#FDF2F8",
    icon: "😠",
  },
  unfair_treatment: {
    label: "Unfair Treatment",
    color: "#F59E0B",
    light: "#FEF3C7",
    icon: "⚠️",
  },
  workplace_safety: {
    label: "Workplace Safety",
    color: "#06B6D4",
    light: "#ECFEFF",
    icon: "🦺",
  },
  attendance_absenteeism: {
    label: "Attendance / Absenteeism",
    color: "#4F46E5",
    light: "#EEF2FF",
    icon: "🕒",
  },
  fraud_theft: {
    label: "Fraud / Theft",
    color: "#B91C1C",
    light: "#FEE2E2",
    icon: "💰",
  },
  policy_violation: {
    label: "Policy Violation",
    color: "#0EA5E9",
    light: "#E0F2FE",
    icon: "📋",
  },
  retaliation: {
    label: "Retaliation",
    color: "#DC2626",
    light: "#FEE2E2",
    icon: "🛑",
  },
  other: { label: "Other", color: "#64748B", light: "#F1F5F9", icon: "📝" },
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_CONFIG).map(
  ([value, cfg]) => ({
    label: `${cfg.icon} ${cfg.label}`,
    value,
  }),
);

export const getCategoryConfig = (cat) =>
  (cat && CATEGORY_CONFIG[cat]) ?? CATEGORY_CONFIG.other;

/* ───────────────── Severity config ───────────────── */
export const SEVERITY_CONFIG = {
  low: { label: "Low", color: C.success, light: C.successLight },
  medium: { label: "Medium", color: C.warning, light: C.warningLight },
  high: { label: "High", color: "#F97316", light: "#FFEDD5" },
  critical: { label: "Critical", color: C.danger, light: C.dangerLight },
};

export const SEVERITY_OPTIONS = Object.entries(SEVERITY_CONFIG).map(
  ([value, cfg]) => ({
    label: cfg.label,
    value,
  }),
);

export const getSeverityConfig = (sev) =>
  (sev && SEVERITY_CONFIG[sev]) ?? SEVERITY_CONFIG.medium;

/* ───────────────── Status config ───────────────── */
export const STATUS_CONFIG = {
  submitted: { label: "Submitted", color: C.primary, light: C.primaryLight },
  under_review: {
    label: "Under Review",
    color: C.warning,
    light: C.warningLight,
  },
  investigating: { label: "Investigating", color: C.purple, light: "#EDE9FE" },
  resolved: { label: "Resolved", color: C.success, light: C.successLight },
  dismissed: { label: "Dismissed", color: C.textMuted, light: C.surfaceAlt },
};

export const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(
  ([value, cfg]) => ({
    label: cfg.label,
    value,
  }),
);

export const getStatusConfig = (status) =>
  (status && STATUS_CONFIG[status]) ?? STATUS_CONFIG.submitted;

/* ───────────────── Helpers ───────────────── */
export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export const getInitials = (name) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "??";

/* ───────────────── Badges ───────────────── */
export function CategoryPill({ category }) {
  const cfg = getCategoryConfig(category);
  return (
    <span
      className="inline-flex items-center text-[10px] font-extrabold px-2 py-1 rounded-full"
      style={{ background: cfg.light, color: cfg.color }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const cfg = getSeverityConfig(severity);
  return (
    <span
      className="inline-flex items-center text-[10px] font-extrabold px-2 py-1 rounded-full"
      style={{ background: cfg.light, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

export function StatusBadge({ status }) {
  const cfg = getStatusConfig(status);
  return (
    <span
      className="inline-flex items-center text-[10px] font-extrabold px-2 py-1 rounded-full"
      style={{ background: cfg.light, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

export function ReportAvatar({
  initials,
  color,
  size = 36,
  anonymous = false,
}) {
  return (
    <div
      className="flex items-center justify-center shrink-0 rounded-full font-extrabold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: anonymous ? C.textMuted : (color ?? C.primary),
      }}
    >
      {anonymous ? "?" : initials}
    </div>
  );
}
