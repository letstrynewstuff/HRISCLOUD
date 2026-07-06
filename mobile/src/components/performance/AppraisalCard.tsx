// src/components/performance/AppraisalCard.tsx
// Card for ONE appraisal in the list (received by employee OR created by manager).
// Shows status chip, score (if completed), and a View / Edit / Submit button.

import { View, Text, Pressable, StyleSheet } from "react-native";
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Send,
  Pencil,
  Lock,
} from "lucide-react-native";
import C from "../../styles/colors";

export type AppraisalStatus =
  | "draft"
  | "submitted"
  | "hr_scored"
  | "completed"
  | "rejected";

const STATUS: Record<
  AppraisalStatus,
  { label: string; color: string; bg: string }
> = {
  draft: { label: "Draft", color: C.textMuted, bg: C.surfaceAlt },
  submitted: { label: "Under Review", color: C.warning, bg: C.warningBg },
  hr_scored: { label: "HR Scored", color: "#7C3AED", bg: "#F3E8FF" },
  completed: { label: "Completed", color: C.success, bg: C.successBg },
  rejected: { label: "Returned", color: C.danger, bg: C.dangerBg },
};

type AppraisalCardProps = {
  appraisal: Record<string, any>;
  /** "received" = employee view of their own.  "created" = manager view of team. */
  perspective: "received" | "created";
  onView: () => void;
  onEdit?: () => void;
  onSubmit?: () => void;
};

export default function AppraisalCard({
  appraisal,
  perspective,
  onView,
  onEdit,
  onSubmit,
}: AppraisalCardProps) {
  const status = appraisal.status as AppraisalStatus;
  const cfg = STATUS[status] ?? STATUS.draft;
  const isDone = status === "completed";
  const isEditable = ["draft", "rejected"].includes(status);
  const isLocked = isDone;
  const isWaiting = ["submitted", "hr_scored"].includes(status);
  const score = appraisal.appraisalScore ?? appraisal.managerOverall;

  const label =
    perspective === "created"
      ? appraisal.employee
        ? `${appraisal.employee.firstName} ${appraisal.employee.lastName}`
        : "Employee"
      : (appraisal.cycleName ?? `Appraisal — ${appraisal.period}`);

  const sub =
    perspective === "created"
      ? (appraisal.cycleName ?? `Period ${appraisal.period}`)
      : appraisal.manager
        ? `By ${appraisal.manager.firstName} ${appraisal.manager.lastName}`
        : `Period ${appraisal.period}`;

  return (
    <View style={[styles.card, status === "rejected" && styles.cardRejected]}>
      <View style={styles.row}>
        {/* Icon */}
        <View style={[styles.icon, { backgroundColor: cfg.bg }]}>
          {isDone ? (
            <CheckCircle2 size={16} color={cfg.color} />
          ) : status === "rejected" ? (
            <AlertTriangle size={16} color={cfg.color} />
          ) : (
            <ClipboardList size={16} color={cfg.color} />
          )}
        </View>

        {/* Text */}
        <View style={styles.text}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {label}
            </Text>
            <View style={[styles.chip, { backgroundColor: cfg.bg }]}>
              <Text style={[styles.chipText, { color: cfg.color }]}>
                {cfg.label}
              </Text>
            </View>
          </View>
          <Text style={styles.sub} numberOfLines={1}>
            {sub}
          </Text>
          {isDone && score != null && (
            <Text style={styles.scoreText}>
              Final score: {Math.round(score)}/100
            </Text>
          )}
        </View>

        {/* Score ring placeholder for completed */}
        {isDone && score != null && (
          <View style={[styles.scoreBox, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.scoreNum, { color: cfg.color }]}>
              {Math.round(score)}
            </Text>
          </View>
        )}
      </View>

      {/* Rejection note */}
      {status === "rejected" && appraisal.hrFeedback ? (
        <View style={styles.rejectionNote}>
          <Text style={styles.rejectionText} numberOfLines={2}>
            <Text style={{ fontWeight: "700" }}>HR returned: </Text>
            {appraisal.hrFeedback}
          </Text>
        </View>
      ) : null}

      {/* Progress stepper for in-flight */}
      {isWaiting && (
        <View style={styles.progress}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: status === "submitted" ? "55%" : "82%",
                  backgroundColor: cfg.color,
                },
              ]}
            />
          </View>
          <View style={styles.stepRow}>
            {["Draft", "Submitted", "HR Review", "Complete"].map((s, i) => {
              const activeIdx = [
                "draft",
                "submitted",
                "hr_scored",
                "completed",
              ].indexOf(status);
              return (
                <Text
                  key={s}
                  style={[
                    styles.stepLabel,
                    { color: i <= activeIdx ? cfg.color : C.textMuted },
                  ]}
                >
                  {s}
                </Text>
              );
            })}
          </View>
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actions}>
        <Pressable onPress={onView} style={styles.viewBtn}>
          <Eye size={12} color={C.primary} />
          <Text style={styles.viewLabel}>View</Text>
        </Pressable>

        {perspective === "created" && isEditable && onEdit && (
          <Pressable onPress={onEdit} style={styles.editBtn}>
            <Pencil size={12} color={C.textSecondary} />
            <Text style={styles.editLabel}>Edit</Text>
          </Pressable>
        )}

        {perspective === "created" && isEditable && onSubmit && (
          <Pressable onPress={onSubmit} style={styles.submitBtn}>
            <Send size={12} color="#fff" />
            <Text style={styles.submitLabel}>Submit to HR</Text>
          </Pressable>
        )}

        {isLocked && (
          <View style={styles.lockedBadge}>
            <Lock size={11} color={C.textMuted} />
            <Text style={styles.lockedLabel}>Locked</Text>
          </View>
        )}
      </View>
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
    marginBottom: 10,
    gap: 10,
  },
  cardRejected: { borderColor: "#FECACA" },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  text: { flex: 1, gap: 3 },
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
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  chipText: { fontSize: 10, fontWeight: "700" },
  sub: { fontSize: 11.5, color: C.textMuted },
  scoreText: { fontSize: 11.5, fontWeight: "700", color: C.success },
  scoreBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  scoreNum: { fontSize: 17, fontWeight: "900" },
  rejectionNote: { backgroundColor: C.dangerBg, borderRadius: 10, padding: 10 },
  rejectionText: { fontSize: 11.5, color: C.danger },
  progress: { gap: 6 },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: C.surfaceAlt,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  stepRow: { flexDirection: "row", justifyContent: "space-between" },
  stepLabel: { fontSize: 9, fontWeight: "600" },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: C.primaryLight ?? "#EEF2FF",
  },
  viewLabel: { fontSize: 11.5, fontWeight: "700", color: C.primary },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: C.surfaceAlt,
  },
  editLabel: { fontSize: 11.5, fontWeight: "700", color: C.textSecondary },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: C.primary,
  },
  submitLabel: { fontSize: 11.5, fontWeight: "700", color: "#fff" },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: C.surfaceAlt,
  },
  lockedLabel: { fontSize: 11, color: C.textMuted, fontWeight: "600" },
});
