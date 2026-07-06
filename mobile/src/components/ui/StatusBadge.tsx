// src/components/ui/StatusBadge.tsx
// Small status pill (Present / Absent / Late / Holiday / Weekend), mirrors
// the web app's StatusBadge color mapping.

import { View, Text, StyleSheet } from "react-native";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Minus,
  LucideIcon,
} from "lucide-react-native";
import C from "../../styles/colors";

export type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "holiday"
  | "weekend";

type StatusBadgeProps = {
  status: AttendanceStatus | string;
};

const MAP: Record<
  AttendanceStatus,
  { label: string; bg: string; color: string; Icon: LucideIcon }
> = {
  present: {
    label: "Present",
    bg: C.successBg,
    color: C.success,
    Icon: CheckCircle2,
  },
  absent: { label: "Absent", bg: C.dangerBg, color: C.danger, Icon: XCircle },
  late: {
    label: "Late",
    bg: C.warningBg,
    color: C.warning,
    Icon: AlertTriangle,
  },
  holiday: { label: "Holiday", bg: C.infoBg, color: C.info, Icon: Calendar },
  weekend: {
    label: "Weekend",
    bg: C.surfaceAlt,
    color: C.textMuted,
    Icon: Minus,
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const key = (status?.toLowerCase() as AttendanceStatus) ?? "present";
  const { label, bg, color, Icon } = MAP[key] ?? MAP.present;

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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 10.5,
    fontWeight: "700",
  },
});
