// src/components/performance/GoalCard.tsx
import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import {
  Target,
  CheckCircle2,
  ChevronDown,
  Calendar,
} from "lucide-react-native";
import C from "../../styles/colors";

type GoalCardProps = {
  goal: {
    id: string;
    title: string;
    description?: string;
    progress?: number;
    priority?: string;
    status?: string;
    due_date?: string;
    dueDate?: string;
  };
};

function barColor(pct: number) {
  if (pct >= 100) return C.success;
  if (pct >= 60) return C.primary;
  if (pct >= 30) return C.warning;
  return C.danger;
}

function priorityStyle(p?: string) {
  switch ((p ?? "medium").toLowerCase()) {
    case "high":
      return { color: C.danger, bg: C.dangerBg };
    case "low":
      return { color: C.success, bg: C.successBg };
    default:
      return { color: C.warning, bg: C.warningBg };
  }
}

export default function GoalCard({ goal }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const pct = goal.progress ?? 0;
  const isDone = pct >= 100 || goal.status?.toLowerCase() === "completed";
  const color = barColor(pct);
  const pri = priorityStyle(goal.priority);
  const due = goal.due_date ?? goal.dueDate;

  return (
    <Pressable
      onPress={() => setExpanded((p) => !p)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.icon,
            { backgroundColor: isDone ? C.successBg : C.primaryLight },
          ]}
        >
          {isDone ? (
            <CheckCircle2 size={16} color={C.success} />
          ) : (
            <Target size={16} color={C.primary} />
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {goal.title}
            </Text>
            <View style={[styles.priPill, { backgroundColor: pri.bg }]}>
              <Text style={[styles.priText, { color: pri.color }]}>
                {goal.priority ?? "medium"}
              </Text>
            </View>
            {isDone && (
              <View style={[styles.priPill, { backgroundColor: C.successBg }]}>
                <Text style={[styles.priText, { color: C.success }]}>
                  ✓ Done
                </Text>
              </View>
            )}
          </View>

          {/* Progress bar */}
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${pct}%`, backgroundColor: color },
              ]}
            />
          </View>
          <View style={styles.barLabelRow}>
            <Text style={styles.barLabel}>{pct}% complete</Text>
            <Text style={[styles.barLabel, { color }]}>{pct}%</Text>
          </View>
        </View>

        <ChevronDown
          size={14}
          color={C.textMuted}
          style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}
        />
      </View>

      {expanded && (
        <View style={styles.detail}>
          {goal.description ? (
            <Text style={styles.desc}>{goal.description}</Text>
          ) : null}
          {due ? (
            <View style={styles.dueRow}>
              <Calendar size={11} color={C.textMuted} />
              <Text style={styles.dueText}>Due: {due}</Text>
            </View>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 10,
  },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  content: { flex: 1, gap: 6 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textPrimary,
    flexShrink: 1,
  },
  priPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  priText: { fontSize: 9.5, fontWeight: "700" },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: C.surfaceAlt,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 3 },
  barLabelRow: { flexDirection: "row", justifyContent: "space-between" },
  barLabel: { fontSize: 10, color: C.textMuted },
  detail: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: 6,
  },
  desc: { fontSize: 12.5, color: C.textSecondary, lineHeight: 18 },
  dueRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  dueText: { fontSize: 11, color: C.textMuted },
});
