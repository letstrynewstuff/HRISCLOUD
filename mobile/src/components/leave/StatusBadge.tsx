// src/components/leave/StatusBadge.tsx
// Status pill for leave requests (approved / pending / rejected / cancelled).

import { View, Text, StyleSheet } from "react-native";
import { CheckCircle2, Clock, XCircle, LucideIcon } from "lucide-react-native";
import C from "../../styles/colors";

export type LeaveStatus = "approved" | "pending" | "rejected" | "cancelled";

type StatusBadgeProps = {
  status: LeaveStatus | string;
};

const MAP: Record<
  LeaveStatus,
  { label: string; bg: string; color: string; Icon: LucideIcon }
> = {
  approved: {
    label: "Approved",
    bg: C.successLight,
    color: C.success,
    Icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    bg: C.warningLight,
    color: C.warning,
    Icon: Clock,
  },
  rejected: {
    label: "Rejected",
    bg: C.dangerLight,
    color: C.danger,
    Icon: XCircle,
  },
  cancelled: {
    label: "Cancelled",
    bg: C.surfaceAlt,
    color: C.textMuted,
    Icon: XCircle,
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const key = (status?.toLowerCase() as LeaveStatus) ?? "pending";
  const { label, bg, color, Icon } = MAP[key] ?? MAP.pending;

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Icon size={10} color={color} strokeWidth={2.4} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 10.5,
    fontWeight: "700",
  },
});
