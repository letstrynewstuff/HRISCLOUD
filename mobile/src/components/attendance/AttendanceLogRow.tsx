// src/components/attendance/AttendanceLogRow.tsx
// One row in the attendance history list: date, in/out times, hours, and
// status badge. Tapping opens the detail modal.

import { View, Text, Pressable, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";
import StatusBadge, { AttendanceStatus } from "../ui/StatusBadge";
import C from "../../styles/colors";

export type AttendanceLogEntry = {
  id: string;
  dateStr: string;
  clockIn: string | null;
  clockOut: string | null;
  hoursLabel: string;
  status: AttendanceStatus;
  isManuallyEdited?: boolean;
};

type AttendanceLogRowProps = {
  entry: AttendanceLogEntry;
  onPress: () => void;
};

export default function AttendanceLogRow({
  entry,
  onPress,
}: AttendanceLogRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.dateCol}>
        <Text style={styles.dateText} numberOfLines={1}>
          {entry.dateStr}
        </Text>
        {entry.isManuallyEdited && (
          <View style={styles.editedPill}>
            <Text style={styles.editedText}>Edited</Text>
          </View>
        )}
        <Text style={styles.timesText} numberOfLines={1}>
          {entry.clockIn ?? "—"} – {entry.clockOut ?? "—"}
        </Text>
      </View>

      <View style={styles.hoursCol}>
        <Text style={styles.hoursText}>{entry.hoursLabel}</Text>
      </View>

      <View style={styles.statusCol}>
        <StatusBadge status={entry.status} />
      </View>

      <ChevronRight size={16} color={C.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 8,
  },
  dateCol: {
    flex: 1.3,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textPrimary,
  },
  timesText: {
    fontSize: 11.5,
    color: C.textMuted,
    marginTop: 2,
  },
  editedPill: {
    alignSelf: "flex-start",
    backgroundColor: C.warningBg,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 3,
  },
  editedText: {
    fontSize: 9,
    fontWeight: "700",
    color: C.warning,
  },
  hoursCol: {
    flex: 0.8,
    alignItems: "flex-start",
  },
  hoursText: {
    fontSize: 13,
    fontWeight: "800",
    color: C.textPrimary,
  },
  statusCol: {
    flex: 1,
    alignItems: "flex-start",
  },
});
