// src/components/admin/announcements/AnnouncementViewModal.tsx

import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { X, Eye, Clock } from "lucide-react-native";
import C from "../../../styles/colors";
import {
  getTypeConfig,
  deriveStatus,
  AnnStatusBadge,
  fmtDateTime,
  stripHtml,
} from "./announcementsShared";

interface Props {
  visible: boolean;
  announcement: any;
  onClose: () => void;
}

export default function AnnouncementViewModal({
  visible,
  announcement,
  onClose,
}: Props) {
  if (!announcement) return null;
  const tc = getTypeConfig(announcement.type);
  const status = deriveStatus(announcement);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={[styles.banner, { backgroundColor: tc.color }]}>
            <Text style={styles.bannerIcon}>{tc.icon}</Text>
            <Text style={styles.bannerLabel}>{tc.label}</Text>
            <View style={{ marginLeft: "auto" }}>
              <AnnStatusBadge status={status} />
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={16} color="#fff" />
            </Pressable>
          </View>

          <ScrollView
            style={{ maxHeight: 420 }}
            contentContainerStyle={{ padding: 18 }}
          >
            <Text style={styles.title}>{announcement.title}</Text>

            <View style={styles.metaRow}>
              <Clock size={12} color={C.textMuted} />
              <Text style={styles.metaText}>
                {fmtDateTime(announcement.publishAt || announcement.createdAt)}
              </Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText}>
                {announcement.createdByName ||
                  announcement.postedBy ||
                  "HR Team"}
              </Text>
            </View>
            <Text style={[styles.metaText, { marginBottom: 14 }]}>
              {announcement.audience === "all"
                ? "All Employees"
                : announcement.departmentName || "Your Department"}
            </Text>

            <Text style={styles.body}>{stripHtml(announcement.body)}</Text>

            <View style={styles.statsBox}>
              <Eye size={14} color={C.primary} />
              <Text style={styles.statsText}>
                <Text style={{ fontWeight: "800", color: C.primary }}>
                  {announcement.views ?? 0}
                </Text>{" "}
                people viewed this
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15,23,42,0.5)",
  },
  sheet: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  banner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 16 },
  bannerIcon: { fontSize: 16 },
  bannerLabel: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
    textTransform: "uppercase",
  },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: C.textPrimary,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  metaText: { fontSize: 12, color: C.textMuted },
  metaDot: { fontSize: 12, color: C.textMuted },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: C.textSecondary,
    marginBottom: 18,
  },
  statsBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  statsText: { fontSize: 12, color: C.textMuted },
});
