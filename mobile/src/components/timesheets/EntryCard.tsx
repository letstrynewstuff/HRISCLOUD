// src/components/timesheets/EntryCard.tsx
// Single timesheet entry row — shown in the day list on the Timesheets screen.
// Draft entries are selectable (checkbox) and offer edit/delete/submit actions.
// Submitted/Approved/Rejected entries are read-only.

import { View, Text, Pressable, StyleSheet } from "react-native";
import { Clock, Tag, Pencil, Trash2, Send, Check } from "lucide-react-native";
import C from "../../styles/colors";
import StatusBadge, { TimesheetStatus } from "./StatusBadge";

export type TimesheetEntry = {
  id: string;
  entryDate: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  description: string;
  projectTag?: string;
  status: TimesheetStatus;
  durationMinutes: number;
};

type EntryCardProps = {
  entry: TimesheetEntry;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (entry: TimesheetEntry) => void;
  onDelete?: (id: string) => void;
  onSubmit?: (id: string) => void;
};

function fmtDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function EntryCard({
  entry,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onSubmit,
}: EntryCardProps) {
  const isDraft = entry.status === "Draft";

  return (
    <View style={[styles.card, selected && styles.cardSelected]}>
      <View style={styles.topRow}>
        {isDraft && onSelect ? (
          <Pressable
            onPress={() => onSelect(entry.id)}
            hitSlop={8}
            style={[styles.checkbox, selected && styles.checkboxChecked]}
          >
            {selected && <Check size={12} color="#fff" strokeWidth={3} />}
          </Pressable>
        ) : (
          <View style={{ width: 18 }} />
        )}

        <View style={styles.timeRow}>
          <Clock size={13} color={C.textMuted} />
          <Text style={styles.timeText}>
            {entry.startTime} – {entry.endTime}
          </Text>
          <Text style={styles.durationText}>
            · {fmtDuration(entry.durationMinutes)}
          </Text>
        </View>

        <StatusBadge status={entry.status} size="xs" />
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {entry.description || "No description"}
      </Text>

      {entry.projectTag ? (
        <View style={styles.tagRow}>
          <Tag size={11} color={C.primary} />
          <Text style={styles.tagText}>{entry.projectTag}</Text>
        </View>
      ) : null}

      {isDraft && (
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => onEdit?.(entry)}
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Pencil size={12} color={C.textSecondary} />
            <Text style={styles.actionLabel}>Edit</Text>
          </Pressable>

          <Pressable
            onPress={() => onDelete?.(entry.id)}
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Trash2 size={12} color={C.danger} />
            <Text style={[styles.actionLabel, { color: C.danger }]}>
              Delete
            </Text>
          </Pressable>

          <Pressable
            onPress={() => onSubmit?.(entry.id)}
            style={({ pressed }) => [
              styles.submitBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Send size={12} color="#fff" />
            <Text style={styles.submitLabel}>Submit</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 8,
  },
  cardSelected: {
    borderColor: C.primary,
    backgroundColor: C.primaryLight,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
  },
  checkboxChecked: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  timeRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  timeText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: C.textPrimary,
  },
  durationText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.textMuted,
  },
  description: {
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 18,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: C.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.primary,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: C.surfaceAlt,
  },
  actionLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: C.textSecondary,
  },
  submitBtn: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: C.primary,
  },
  submitLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#fff",
  },
});
