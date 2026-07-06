// src/components/timesheets/StatusBadge.tsx
// Mirrors the web StatusBadge color mapping for timesheet entry statuses.

import { View, Text, StyleSheet } from "react-native";
import C from "../../styles/colors";

export type TimesheetStatus = "Draft" | "Submitted" | "Approved" | "Rejected";

type StatusBadgeProps = {
  status: TimesheetStatus | string;
  size?: "xs" | "sm";
};

const CONFIG: Record<
  TimesheetStatus,
  { bg: string; color: string; label: string }
> = {
  Draft: { bg: "#F3F4F6", color: "#6B7280", label: "Draft" },
  Submitted: { bg: "#EFF6FF", color: "#3B82F6", label: "Submitted" },
  Approved: { bg: C.successLight, color: "#059669", label: "Approved" },
  Rejected: { bg: C.dangerLight, color: "#DC2626", label: "Rejected" },
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const c = CONFIG[status as TimesheetStatus] ?? CONFIG.Draft;
  const isXs = size === "xs";

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: c.bg,
          paddingVertical: isXs ? 4 : 5,
          paddingHorizontal: isXs ? 8 : 10,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: c.color }]} />
      <Text
        style={[styles.label, { color: c.color, fontSize: isXs ? 10.5 : 11.5 }]}
      >
        {c.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontWeight: "700",
  },
});
