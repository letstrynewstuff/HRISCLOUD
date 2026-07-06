// src/components/shared/reports/reportShared.tsx
// Shared constants + small presentational components reused across every
// Report screen — both admin (HR review) and employee (submit/track).

import { View, Text, StyleSheet } from "react-native";
import C from "../../../styles/colors";

// ── Category config ──────────────────────────────────────────
export const CATEGORY_CONFIG: Record<
  string,
  { label: string; color: string; light: string; icon: string }
> = {
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
  ([value, cfg]) => ({ label: `${cfg.icon} ${cfg.label}`, value }),
);

export const getCategoryConfig = (cat?: string) =>
  (cat && CATEGORY_CONFIG[cat]) ?? CATEGORY_CONFIG.other;

// ── Severity config ──────────────────────────────────────────
export const SEVERITY_CONFIG: Record<
  string,
  { label: string; color: string; light: string }
> = {
  low: { label: "Low", color: C.success, light: C.successLight },
  medium: { label: "Medium", color: C.warning, light: C.warningLight },
  high: { label: "High", color: "#F97316", light: "#FFEDD5" },
  critical: { label: "Critical", color: C.danger, light: C.dangerLight },
};

export const SEVERITY_OPTIONS = Object.entries(SEVERITY_CONFIG).map(
  ([value, cfg]) => ({ label: cfg.label, value }),
);

export const getSeverityConfig = (sev?: string) =>
  (sev && SEVERITY_CONFIG[sev]) ?? SEVERITY_CONFIG.medium;

// ── Status config ────────────────────────────────────────────
export const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; light: string }
> = {
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
  ([value, cfg]) => ({ label: cfg.label, value }),
);

export const getStatusConfig = (status?: string) =>
  (status && STATUS_CONFIG[status]) ?? STATUS_CONFIG.submitted;

// ── Helpers ──────────────────────────────────────────────────
export const fmtDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export const fmtDateTime = (d?: string | null) =>
  d
    ? new Date(d).toLocaleString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export const getInitials = (name?: string | null) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "??";

// ── Badges ───────────────────────────────────────────────────
export function CategoryPill({ category }: { category?: string }) {
  const cfg = getCategoryConfig(category);
  return (
    <View style={[pillStyles.wrap, { backgroundColor: cfg.light }]}>
      <Text style={[pillStyles.text, { color: cfg.color }]}>
        {cfg.icon} {cfg.label}
      </Text>
    </View>
  );
}

export function SeverityBadge({ severity }: { severity?: string }) {
  const cfg = getSeverityConfig(severity);
  return (
    <View style={[pillStyles.wrap, { backgroundColor: cfg.light }]}>
      <Text style={[pillStyles.text, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

export function StatusBadge({ status }: { status?: string }) {
  const cfg = getStatusConfig(status);
  return (
    <View style={[pillStyles.wrap, { backgroundColor: cfg.light }]}>
      <Text style={[pillStyles.text, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

export function ReportAvatar({
  initials,
  color = C.primary,
  size = 36,
  anonymous = false,
}: {
  initials: string;
  color?: string;
  size?: number;
  anonymous?: boolean;
}) {
  return (
    <View
      style={[
        avatarStyles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: anonymous ? C.textMuted : color,
        },
      ]}
    >
      <Text style={[avatarStyles.text, { fontSize: size * 0.36 }]}>
        {anonymous ? "?" : initials}
      </Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  wrap: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  text: { fontSize: 10, fontWeight: "800" },
});

const avatarStyles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  text: { color: "#fff", fontWeight: "800" },
});
