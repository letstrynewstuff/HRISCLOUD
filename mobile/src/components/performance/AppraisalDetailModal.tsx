// src/components/performance/AppraisalDetailModal.tsx
// Full detail sheet for a single appraisal. Works for both perspectives.

import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  X,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Star,
  MessageSquare,
  User,
} from "lucide-react-native";
import C from "../../styles/colors";

type Props = {
  appraisal: Record<string, any> | null;
  perspective: "received" | "created";
  onClose: () => void;
  onEdit?: () => void;
  onSubmit?: () => void;
  submitting?: boolean;
};

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> =
  {
    draft: { label: "Draft", color: C.textMuted, bg: C.surfaceAlt },
    submitted: { label: "Under Review", color: C.warning, bg: C.warningLight },
    hr_scored: { label: "HR Scored", color: "#7C3AED", bg: "#F3E8FF" },
    completed: { label: "Completed", color: C.success, bg: C.successLight },
    rejected: { label: "Returned", color: C.danger, bg: C.dangerLight },
  };

function RatingRow({
  label,
  score,
  maxScore = 10,
}: {
  label: string;
  score: number;
  maxScore?: number;
}) {
  const pct = Math.min((score / maxScore) * 100, 100);
  return (
    <View style={rating.row}>
      <Text style={rating.label} numberOfLines={1}>
        {label}
      </Text>
      <View style={rating.track}>
        <View
          style={[
            rating.fill,
            { width: `${pct}%`, backgroundColor: C.primary },
          ]}
        />
      </View>
      <Text style={rating.score}>
        {score}/{maxScore}
      </Text>
    </View>
  );
}

const rating = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  label: { fontSize: 11.5, color: C.textSecondary, width: 90, flexShrink: 0 },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.surfaceAlt,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 3 },
  score: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textPrimary,
    width: 32,
    textAlign: "right",
  },
});

export default function AppraisalDetailModal({
  appraisal,
  perspective,
  onClose,
  onEdit,
  onSubmit,
  submitting,
}: Props) {
  if (!appraisal) return null;

  const status = appraisal.status ?? "draft";
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.draft;
  const isDone = status === "completed";
  const isEditable = ["draft", "rejected"].includes(status);

  const employeeName = appraisal.employee
    ? `${appraisal.employee.firstName} ${appraisal.employee.lastName}`
    : null;
  const managerName = appraisal.manager
    ? `${appraisal.manager.firstName} ${appraisal.manager.lastName}`
    : null;

  const managerRatings: any[] = appraisal.managerRatings ?? [];
  const hrRatings: any[] = appraisal.hrRatings ?? [];

  return (
    <Modal
      visible={!!appraisal}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
              {isDone ? (
                <CheckCircle2 size={17} color={cfg.color} />
              ) : status === "rejected" ? (
                <AlertTriangle size={17} color={cfg.color} />
              ) : (
                <ClipboardList size={17} color={cfg.color} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {appraisal.cycleName ?? `Appraisal — ${appraisal.period}`}
              </Text>
              <View style={[styles.statusChip, { backgroundColor: cfg.bg }]}>
                <Text style={[styles.statusLabel, { color: cfg.color }]}>
                  {cfg.label}
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <X size={15} color={C.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.body}
          >
            {/* People */}
            <View style={styles.grid}>
              {perspective === "created" && employeeName && (
                <View style={styles.gridCell}>
                  <Text style={styles.gridLabel}>Employee</Text>
                  <Text style={styles.gridValue}>{employeeName}</Text>
                </View>
              )}
              {perspective === "received" && managerName && (
                <View style={styles.gridCell}>
                  <Text style={styles.gridLabel}>Appraiser</Text>
                  <Text style={styles.gridValue}>{managerName}</Text>
                </View>
              )}
              <View style={styles.gridCell}>
                <Text style={styles.gridLabel}>Period</Text>
                <Text style={styles.gridValue}>{appraisal.period ?? "—"}</Text>
              </View>
              {appraisal.appraisalScore != null && (
                <View style={styles.gridCell}>
                  <Text style={styles.gridLabel}>Final Score</Text>
                  <Text style={[styles.gridValue, { color: C.success }]}>
                    {Math.round(appraisal.appraisalScore)}/100
                  </Text>
                </View>
              )}
              {appraisal.submittedAt && (
                <View style={styles.gridCell}>
                  <Text style={styles.gridLabel}>Submitted</Text>
                  <Text style={styles.gridValue}>
                    {new Date(appraisal.submittedAt).toLocaleDateString(
                      "en-NG",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </Text>
                </View>
              )}
            </View>

            {/* Rejection reason */}
            {status === "rejected" && appraisal.hrFeedback ? (
              <View style={styles.alertBox}>
                <AlertTriangle size={13} color={C.danger} />
                <Text style={styles.alertText}>
                  <Text style={{ fontWeight: "700" }}>Returned by HR: </Text>
                  {appraisal.hrFeedback}
                </Text>
              </View>
            ) : null}

            {/* Manager feedback */}
            {appraisal.managerFeedback ? (
              <View style={styles.feedbackBox}>
                <View style={styles.feedbackHeader}>
                  <MessageSquare size={13} color={C.primary} />
                  <Text style={styles.feedbackTitle}>Manager Feedback</Text>
                </View>
                <Text style={styles.feedbackText}>
                  {appraisal.managerFeedback}
                </Text>
              </View>
            ) : null}

            {/* Manager ratings */}
            {managerRatings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Manager Ratings</Text>
                {managerRatings.map((r: any, i: number) => (
                  <RatingRow
                    key={i}
                    label={r.label}
                    score={r.score}
                    maxScore={r.maxScore ?? 10}
                  />
                ))}
                {appraisal.managerOverall != null && (
                  <Text style={styles.overallText}>
                    Overall:{" "}
                    <Text style={{ color: C.primary }}>
                      {Math.round(appraisal.managerOverall)}/100
                    </Text>
                  </Text>
                )}
              </View>
            )}

            {/* HR feedback */}
            {appraisal.hrFeedback && status !== "rejected" ? (
              <View
                style={[styles.feedbackBox, { backgroundColor: "#F3E8FF" }]}
              >
                <View style={styles.feedbackHeader}>
                  <Star size={13} color="#7C3AED" />
                  <Text style={[styles.feedbackTitle, { color: "#7C3AED" }]}>
                    HR Feedback
                  </Text>
                </View>
                <Text style={[styles.feedbackText, { color: "#6D28D9" }]}>
                  {appraisal.hrFeedback}
                </Text>
              </View>
            ) : null}

            {/* HR ratings */}
            {hrRatings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>HR Ratings</Text>
                {hrRatings.map((r: any, i: number) => (
                  <RatingRow
                    key={i}
                    label={r.label}
                    score={r.score}
                    maxScore={r.maxScore ?? 10}
                  />
                ))}
                {appraisal.hrOverall != null && (
                  <Text style={styles.overallText}>
                    HR Overall:{" "}
                    <Text style={{ color: "#7C3AED" }}>
                      {Math.round(appraisal.hrOverall)}/100
                    </Text>
                  </Text>
                )}
              </View>
            )}
          </ScrollView>

          {/* Manager action buttons */}
          {perspective === "created" && (
            <View style={styles.footer}>
              {isEditable && onEdit && (
                <Pressable
                  onPress={onEdit}
                  style={({ pressed }) => [
                    styles.editBtn,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.editLabel}>Edit</Text>
                </Pressable>
              )}
              {isEditable && onSubmit && (
                <Pressable
                  onPress={onSubmit}
                  disabled={submitting}
                  style={({ pressed }) => [
                    styles.submitBtn,
                    submitting && { opacity: 0.6 },
                    pressed && !submitting && { opacity: 0.88 },
                  ]}
                >
                  <Send size={13} color="#fff" />
                  <Text style={styles.submitLabel}>
                    {submitting ? "Submitting…" : "Submit to HR"}
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    maxHeight: "90%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center",
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 16,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: C.textPrimary,
    marginBottom: 4,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  statusLabel: { fontSize: 10, fontWeight: "700" },
  closeBtn: { padding: 6, borderRadius: 10, backgroundColor: C.surfaceAlt },
  body: { gap: 14, paddingBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridCell: {
    width: "47%",
    backgroundColor: C.surfaceAlt,
    borderRadius: 14,
    padding: 11,
  },
  gridLabel: { fontSize: 9.5, color: C.textMuted, marginBottom: 3 },
  gridValue: { fontSize: 12.5, fontWeight: "700", color: C.textPrimary },
  alertBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: C.dangerLight,
    borderRadius: 12,
    padding: 11,
  },
  alertText: { flex: 1, fontSize: 12, color: C.danger, lineHeight: 17 },
  feedbackBox: {
    backgroundColor: C.primaryLight,
    borderRadius: 14,
    padding: 13,
    gap: 6,
  },
  feedbackHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  feedbackTitle: { fontSize: 11.5, fontWeight: "700", color: C.primary },
  feedbackText: { fontSize: 12.5, color: C.primary, lineHeight: 18 },
  section: { gap: 4 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textSecondary,
    marginBottom: 6,
  },
  overallText: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: "600",
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  editBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  editLabel: { fontSize: 13, fontWeight: "700", color: C.textSecondary },
  submitBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  submitLabel: { fontSize: 13, fontWeight: "700", color: "#fff" },
});
