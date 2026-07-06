

// src/components/leave/LeaveHistoryRow.tsx
// One row in the Leave History list — tap to open the detail modal.

import { View, Text, Pressable, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";
import C from "../../styles/colors";
import { getLeaveMeta } from "./leaveMeta";
import StatusBadge from "./StatusBadge";
import { LeaveRequest } from "../../types/leave";

type LeaveHistoryRowProps = {
  leave: LeaveRequest;
  onPress: (leave: LeaveRequest) => void;
};

function fmtRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${s.toLocaleDateString("en-GB", opts)} – ${e.toLocaleDateString("en-GB", { ...opts, year: "numeric" })}`;
}

export default function LeaveHistoryRow({
  leave,
  onPress,
}: LeaveHistoryRowProps) {
  const meta = getLeaveMeta(leave.leaveType);

  return (
    <Pressable
      onPress={() => onPress(leave)}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
        <meta.Icon size={16} color={meta.color} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {leave.policyName ?? meta.label}
          </Text>
          <StatusBadge status={leave.status} />
        </View>
        <Text style={styles.subtitle}>
          {fmtRange(leave.startDate, leave.endDate)} ·{" "}
          <Text style={styles.bold}>
            {leave.days} day{leave.days !== 1 ? "s" : ""}
          </Text>
        </Text>
      </View>

      <ChevronRight size={15} color={C.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13,
    borderRadius: 16,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  iconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  title: { fontSize: 13, fontWeight: "700", color: C.textPrimary, flexShrink: 1 },
  subtitle: { fontSize: 11.5, color: C.textMuted },
  bold: { fontWeight: "700", color: C.textSecondary },
});