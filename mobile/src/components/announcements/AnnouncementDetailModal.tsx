

// src/components/announcements/AnnouncementDetailModal.tsx
// Full-detail bottom sheet for a single announcement.
// All data comes from the API via announcementApi — no mock imports.

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
  Pin,
  Clock,
  Eye,
  Globe,
  Building2,
  User,
  CalendarX,
} from "lucide-react-native";
import C from "../../styles/colors";
import { Announcement, audienceConfig } from "../../data/announcementConfig";

type Props = {
  announcement: Announcement | null;
  onClose: () => void;
};

function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AnnouncementDetailModal({ announcement, onClose }: Props) {
  if (!announcement) return null;

  const cfg = audienceConfig(announcement.audience);

  const AudienceIcon =
    announcement.audience === "all"
      ? Globe
      : announcement.audience === "role"
        ? User
        : Building2;

  const audienceLabel =
    announcement.audience === "all"
      ? "Everyone"
      : announcement.audience === "role"
        ? "Role-based"
        : (announcement.departmentName ?? "Your Department");

  const meta = [
    {
      icon: Clock,
      label: "Published",
      value: fmtDate(announcement.publishAt ?? announcement.createdAt),
    },
    {
      icon: AudienceIcon,
      label: "Audience",
      value: audienceLabel,
    },
    {
      icon: Eye,
      label: "Views",
      value: String(announcement.views ?? 0),
    },
    ...(announcement.expiresAt
      ? [{ icon: CalendarX, label: "Expires", value: fmtDate(announcement.expiresAt) }]
      : []),
    ...(announcement.postedBy ?? announcement.createdByName
      ? [{ icon: User, label: "Posted by", value: announcement.postedBy ?? announcement.createdByName ?? "—" }]
      : []),
  ];

  return (
    <Modal
      visible={!!announcement}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Header strip */}
          <View style={[styles.headerStrip, { backgroundColor: cfg.bg }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.badgePill, { backgroundColor: cfg.bg }]}>
                <Text style={[styles.badgeLabel, { color: cfg.color }]}>
                  {cfg.icon} {cfg.label}
                </Text>
              </View>
              {announcement.isPinned && (
                <View style={styles.pinFlag}>
                  <Pin size={10} color={C.warning} />
                  <Text style={styles.pinFlagText}>Pinned</Text>
                </View>
              )}
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <X size={16} color={C.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <Text style={styles.title}>{announcement.title}</Text>

            {/* Meta grid */}
            <View style={styles.metaGrid}>
              {meta.map((m) => (
                <View key={m.label} style={styles.metaCell}>
                  <m.icon size={11} color={cfg.color} />
                  <View>
                    <Text style={styles.metaCellLabel}>{m.label}</Text>
                    <Text style={styles.metaCellValue}>{m.value}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Body */}
            <View style={styles.bodyBox}>
              <Text style={styles.bodyText}>{announcement.body}</Text>
            </View>
          </ScrollView>
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
    maxHeight: "88%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 0,
  },
  headerStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  badgePill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  badgeLabel: { fontSize: 10.5, fontWeight: "700" },
  pinFlag: { flexDirection: "row", alignItems: "center", gap: 4 },
  pinFlagText: { fontSize: 10, fontWeight: "700", color: C.warning },
  closeBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  body: { padding: 18, paddingBottom: 32, gap: 16 },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: C.textPrimary,
    lineHeight: 24,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaCell: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
    minWidth: "45%",
    flex: 1,
  },
  metaCellLabel: { fontSize: 9.5, color: C.textMuted, marginBottom: 1 },
  metaCellValue: { fontSize: 12, fontWeight: "700", color: C.textPrimary },
  bodyBox: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  bodyText: {
    fontSize: 13.5,
    color: C.textSecondary,
    lineHeight: 21,
  },
});