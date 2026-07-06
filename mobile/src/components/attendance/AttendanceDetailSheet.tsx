// src/components/attendance/AttendanceDetailSheet.tsx
// Bottom-sheet-style modal showing full detail for one attendance entry,
// mirrors the web app's detail modal (Status, Clock In/Out, Hours, etc).

import { View, Text, Pressable, StyleSheet, Modal } from "react-native";
import { X } from "lucide-react-native";
import StatusBadge from "../ui/StatusBadge";
import C from "../../styles/colors";
import type { AttendanceLogEntry } from "./AttendanceLogRow";

type AttendanceDetailSheetProps = {
  entry: AttendanceLogEntry | null;
  onClose: () => void;
};

export default function AttendanceDetailSheet({
  entry,
  onClose,
}: AttendanceDetailSheetProps) {
  if (!entry) return null;

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Status", value: <StatusBadge status={entry.status} /> },
    { label: "Clock In", value: entry.clockIn ?? "—" },
    { label: "Clock Out", value: entry.clockOut ?? "—" },
    { label: "Hours Worked", value: entry.hoursLabel },
  ];

  if (entry.isManuallyEdited) {
    rows.push({
      label: "Note",
      value: "This record was manually corrected by HR",
    });
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>{entry.dateStr}</Text>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <X size={18} color={C.textMuted} />
            </Pressable>
          </View>

          <View style={styles.rows}>
            {rows.map(({ label, value }) => (
              <View key={label} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{label}</Text>
                {typeof value === "string" ? (
                  <Text style={styles.detailValue}>{value}</Text>
                ) : (
                  value
                )}
              </View>
            ))}
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  sheet: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: C.surface,
    borderRadius: 22,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: C.textPrimary,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
  },
  rows: {
    gap: 2,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  detailLabel: {
    fontSize: 13,
    color: C.textSecondary,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textPrimary,
  },
  closeButton: {
    marginTop: 18,
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
