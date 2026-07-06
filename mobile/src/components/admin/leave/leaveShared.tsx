// src/components/admin/leave/leaveShared.tsx
// Shared constants + small presentational components reused across every
// Leave Management tab view (Requests, Policies, Balances, Detail).

import { View, Text, StyleSheet } from "react-native";
import { Clock, CheckCircle2, XCircle } from "lucide-react-native";
import C from "../../../styles/colors";

// ── Leave type → color/icon map ─────────────────────────────
export const LEAVE_TYPE_UI: Record<
  string,
  { color: string; light: string; icon: string }
> = {
  "Annual Leave": { color: "#4F46E5", light: "#EEF2FF", icon: "☀️" },
  "Sick Leave": { color: "#EF4444", light: "#FEE2E2", icon: "🏥" },
  "Maternity Leave": { color: "#EC4899", light: "#FDF2F8", icon: "🤱" },
  "Paternity Leave": { color: "#06B6D4", light: "#ECFEFF", icon: "👨‍👩‍👧" },
  Compassionate: { color: "#8B5CF6", light: "#EDE9FE", icon: "🕊️" },
  "Study Leave": { color: "#10B981", light: "#D1FAE5", icon: "📚" },
  "Unpaid Leave": { color: "#F59E0B", light: "#FEF3C7", icon: "⏸️" },
};

export const getTypeColor = (t?: string) =>
  (t && LEAVE_TYPE_UI[t]?.color) ?? C.primary;
export const getTypeLight = (t?: string) =>
  (t && LEAVE_TYPE_UI[t]?.light) ?? C.primaryLight;
export const getTypeIcon = (t?: string) =>
  (t && LEAVE_TYPE_UI[t]?.icon) ?? "📋";

export const getInitials = (name?: string) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "??";

export const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-NG") : "—";

// ── Avatar ───────────────────────────────────────────────────
export function LeaveAvatar({
  initials,
  color = C.primary,
  size = 36,
}: {
  initials: string;
  color?: string;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>
        {initials}
      </Text>
    </View>
  );
}

// ── Status badge ─────────────────────────────────────────────
export function LeaveStatusBadge({ status }: { status?: string }) {
  const cfg = {
    approved: {
      bg: C.successLight,
      color: C.success,
      label: "Approved",
      Icon: CheckCircle2,
    },
    pending: {
      bg: C.warningLight,
      color: C.warning,
      label: "Pending",
      Icon: Clock,
    },
    rejected: {
      bg: C.dangerLight,
      color: C.danger,
      label: "Rejected",
      Icon: XCircle,
    },
  }[status?.toLowerCase() ?? ""] ?? {
    bg: C.surfaceAlt,
    color: C.textMuted,
    label: status ?? "—",
    Icon: Clock,
  };
  const { Icon } = cfg;
  return (
    <View style={[badgeStyles.wrap, { backgroundColor: cfg.bg }]}>
      <Icon size={10} color={cfg.color} />
      <Text style={[badgeStyles.text, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

// ── Leave type pill ──────────────────────────────────────────
export function LeaveTypePill({ type }: { type?: string }) {
  return (
    <View style={[badgeStyles.pill, { backgroundColor: getTypeLight(type) }]}>
      <Text style={[badgeStyles.pillText, { color: getTypeColor(type) }]}>
        {type ?? "—"}
      </Text>
    </View>
  );
}

// ── Mini progress bar (used-fraction) ───────────────────────
export function BalanceMiniBar({
  remaining,
  entitled,
  color,
}: {
  remaining: number;
  entitled: number;
  color: string;
}) {
  const used = entitled - remaining;
  const pct = entitled > 0 ? Math.min((used / entitled) * 100, 100) : 0;
  const low = entitled > 0 && remaining / entitled < 0.2;
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "800",
            color: low ? C.danger : C.textPrimary,
          }}
        >
          {remaining}
        </Text>
        <Text style={{ fontSize: 10, color: C.textMuted }}>/ {entitled}</Text>
      </View>
      <View
        style={{
          height: 5,
          width: 56,
          borderRadius: 3,
          backgroundColor: C.surfaceAlt,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${pct}%`,
            backgroundColor: low ? C.danger : color,
            borderRadius: 3,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "800" },
});

const badgeStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  text: { fontSize: 10, fontWeight: "800" },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  pillText: { fontSize: 10, fontWeight: "700" },
});
