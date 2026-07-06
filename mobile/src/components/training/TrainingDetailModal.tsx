



// src/components/training/TrainingDetailModal.tsx
// Detail sheet shown when tapping a training card — status, description,
// details grid, certificate, and an "Open Training Link" CTA.
// Handles both snake_case and camelCase backend responses.

import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Linking,
} from "react-native";
import { X, Award, ExternalLink } from "lucide-react-native";
import C from "../../styles/colors";
import { getStatusMeta, getTypeMeta } from "./trainingMeta";

type TrainingDetailModalProps = {
  training: any | null;
  onClose: () => void;
};

function fmtDate(ds?: string) {
  if (!ds) return "TBD";
  return new Date(ds).toLocaleDateString("en-GB");
}

export default function TrainingDetailModal({
  training,
  onClose,
}: TrainingDetailModalProps) {
  if (!training) return null;

  // Handle both snake_case and camelCase from backend
  const title = training.title;
  const provider = training.provider;
  const status = getStatusMeta(training.status);
  const typeMeta = getTypeMeta(training.type);
  const mandatory = training.mandatory;
  const description = training.description;
  const link = training.link;

  const startDate = training.start_date ?? training.startDate;
  const endDate = training.end_date ?? training.endDate;
  const location = training.location ?? "Remote / TBD";
  const enrolledAt = training.enrolled_at ?? training.enrolledAt;
  const completedAt = training.completed_at ?? training.completedAt;
  const hasCert = training.certificate_issued ?? training.certificateIssued;

  const rows = [
    { label: "Start Date", value: fmtDate(startDate) },
    { label: "End Date", value: fmtDate(endDate) },
    { label: "Location", value: location },
    {
      label: "Enrolled",
      value: enrolledAt ? fmtDate(enrolledAt) : "—",
    },
  ];

  return (
    <Modal
      visible={!!training}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>{title}</Text>
              <Text style={styles.headerSubtitle}>
                {provider ?? "—"}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <X size={15} color="#fff" />
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Status + type flags */}
            <View style={styles.flagsRow}>
              <View style={[styles.flag, { backgroundColor: status.bg }]}>
                <status.Icon size={11} color={status.color} />
                <Text style={[styles.flagText, { color: status.color }]}>
                  {status.label}
                </Text>
              </View>
              <View style={[styles.flag, { backgroundColor: typeMeta.bg }]}>
                <Text style={[styles.flagText, { color: typeMeta.color }]}>
                  {training.type}
                </Text>
              </View>
              {mandatory && (
                <View style={[styles.flag, { backgroundColor: "#FEE2E2" }]}>
                  <Text style={[styles.flagText, { color: "#EF4444" }]}>
                    Mandatory
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            {description ? (
              <Text style={styles.description}>{description}</Text>
            ) : null}

            {/* Details grid */}
            <View style={styles.grid}>
              {rows.map((r) => (
                <View key={r.label} style={styles.gridCell}>
                  <Text style={styles.gridLabel}>{r.label}</Text>
                  <Text style={styles.gridValue}>{r.value}</Text>
                </View>
              ))}
            </View>

            {/* Certificate */}
            {hasCert && (
              <View style={styles.certBox}>
                <Award size={20} color="#D97706" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.certTitle}>Certificate Issued</Text>
                  <Text style={styles.certSub}>
                    {completedAt
                      ? new Date(completedAt).toLocaleDateString(
                          "en-GB",
                          { dateStyle: "long" },
                        )
                      : ""}
                  </Text>
                </View>
              </View>
            )}

            {/* External link */}
            {link && (
              <Pressable
                onPress={() => Linking.openURL(link)}
                style={({ pressed }) => [
                  styles.linkBtn,
                  pressed && { opacity: 0.88 },
                ]}
              >
                <ExternalLink size={14} color="#fff" />
                <Text style={styles.linkBtnLabel}>Open Training Link</Text>
              </Pressable>
            )}

            <View style={{ height: 8 }} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  sheet: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "85%",
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 18,
    backgroundColor: C.navy,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 21,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    marginTop: 3,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  body: {
    padding: 18,
  },
  flagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 14,
  },
  flag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  flagText: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  description: {
    fontSize: 12.5,
    color: C.textSecondary,
    lineHeight: 19,
    marginBottom: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 6,
  },
  gridCell: {
    width: "47%",
    backgroundColor: C.surfaceAlt,
    borderRadius: 14,
    padding: 11,
  },
  gridLabel: {
    fontSize: 9.5,
    color: C.textMuted,
    marginBottom: 3,
  },
  gridValue: {
    fontSize: 12.5,
    fontWeight: "700",
    color: C.textPrimary,
  },
  certBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 14,
    padding: 13,
    marginTop: 14,
  },
  certTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400E",
  },
  certSub: {
    fontSize: 11,
    color: "#B45309",
    marginTop: 1,
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: C.primary,
    marginTop: 14,
  },
  linkBtnLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#fff",
  },
});