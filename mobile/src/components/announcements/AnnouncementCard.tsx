

// src/components/announcements/AnnouncementCard.tsx
// Card backed entirely by the shape from announcementApi — no mock imports.

import { View, Text, Pressable, StyleSheet } from "react-native";
import { Clock, Globe, Building2, Pin, ChevronRight, User } from "lucide-react-native";
import C from "../../styles/colors";
import { Announcement, audienceConfig } from "../../data/announcementConfig";

type Props = {
  announcement: Announcement;
  viewed?: boolean;
  onPress: (a: Announcement) => void;
};

function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AnnouncementCard({ announcement, viewed, onPress }: Props) {
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
        : (announcement.departmentName ?? "Your Dept.");

  return (
    <Pressable
      onPress={() => onPress(announcement)}
      style={({ pressed }) => [
        styles.card,
        { borderColor: viewed ? C.border : `${cfg.color}55` },
        pressed && { opacity: 0.9 },
      ]}
    >
      {/* Top strip */}
      <View
        style={[
          styles.strip,
          { backgroundColor: viewed ? C.surfaceAlt : cfg.bg },
        ]}
      >
        <View style={[styles.typeBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.typeBadgeLabel, { color: cfg.color }]}>
            {cfg.icon} {cfg.label}
          </Text>
        </View>
        {announcement.isPinned && (
          <View style={styles.pinFlag}>
            <Pin size={9} color={C.warning} />
            <Text style={styles.pinFlagText}>Pinned</Text>
          </View>
        )}
        {!viewed && (
          <View style={[styles.newBadge, { backgroundColor: cfg.color }]}>
            <Text style={styles.newBadgeLabel}>NEW</Text>
          </View>
        )}
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {announcement.title}
        </Text>
        <Text style={styles.preview} numberOfLines={3}>
          {announcement.body}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaLeft}>
            <Clock size={10} color={C.textMuted} />
            <Text style={styles.metaText}>
              {fmtDate(announcement.publishAt ?? announcement.createdAt)}
            </Text>
            <Text style={styles.metaDot}>·</Text>
            <AudienceIcon size={10} color={C.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>
              {audienceLabel}
            </Text>
          </View>
          <View style={styles.readMore}>
            <Text style={[styles.readMoreText, { color: cfg.color }]}>
              Read more
            </Text>
            <ChevronRight size={11} color={cfg.color} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1.5,
    backgroundColor: C.surface,
    overflow: "hidden",
  },
  strip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  typeBadgeLabel: { fontSize: 10, fontWeight: "700" },
  pinFlag: { flexDirection: "row", alignItems: "center", gap: 3 },
  pinFlagText: { fontSize: 9.5, fontWeight: "700", color: C.warning },
  newBadge: {
    marginLeft: "auto",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 999,
  },
  newBadgeLabel: { fontSize: 8.5, fontWeight: "800", color: "#fff" },
  body: { padding: 14 },
  title: {
    fontSize: 13.5,
    fontWeight: "700",
    color: C.textPrimary,
    marginBottom: 6,
    lineHeight: 18,
  },
  preview: {
    fontSize: 11.5,
    color: C.textSecondary,
    lineHeight: 17,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  metaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  metaText: { fontSize: 10, color: C.textMuted, flexShrink: 1 },
  metaDot: { fontSize: 10, color: C.textMuted },
  readMore: { flexDirection: "row", alignItems: "center", gap: 2 },
  readMoreText: { fontSize: 10.5, fontWeight: "700" },
});