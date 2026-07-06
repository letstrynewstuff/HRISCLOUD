// src/components/admin/announcements/announcementsShared.tsx
// Shared config/helpers/badges for the Announcements module (admin + employee).

import { View, Text, StyleSheet } from "react-native";
import C from "../../../styles/colors";

export const TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: string }
> = {
  general: { label: "General", color: C.primary, bg: C.primaryLight, icon: "📢" },
  urgent: { label: "Urgent", color: C.danger, bg: C.dangerLight, icon: "⚠️" },
  policy: { label: "Policy", color: C.purple, bg: "#EDE9FE", icon: "📋" },
  event: { label: "Event", color: C.warning, bg: C.warningLight, icon: "🎉" },
  reminder: { label: "Reminder", color: C.accent, bg: "#ECFEFF", icon: "🔔" },
};

export const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  active: { label: "Active", color: C.success, bg: C.successLight },
  scheduled: { label: "Scheduled", color: C.accent, bg: "#ECFEFF" },
  expired: { label: "Expired", color: C.warning, bg: C.warningLight },
};

export const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Finance",
  "HR",
  "Operations",
  "Sales",
  "Marketing",
  "Legal",
];

export function getTypeConfig(type?: string) {
  return TYPE_CONFIG[type || "general"] || TYPE_CONFIG.general;
}

export function deriveStatus(ann: any): "active" | "scheduled" | "expired" {
  const now = new Date();
  const publishAt = ann.publishAt ? new Date(ann.publishAt) : null;
  const expiresAt = ann.expiresAt ? new Date(ann.expiresAt) : null;
  if (publishAt && publishAt > now) return "scheduled";
  if (expiresAt && expiresAt <= now) return "expired";
  return "active";
}

export function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateTime(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Body comes back as HTML from the rich editor on web. RN has no <div/> to
// dangerouslySetInnerHTML into, so we strip tags for now. If you later add
// `react-native-render-html`, swap this out in the detail modals.
export function stripHtml(html?: string) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function getInitials(name?: string) {
  if (!name) return "HR";
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ─── Small presentational components ─── */

export function AnnTypeBadge({ type }: { type?: string }) {
  const tc = getTypeConfig(type);
  return (
    <View style={[styles.badge, { backgroundColor: tc.bg }]}>
      <Text style={[styles.badgeText, { color: tc.color }]}>
        {tc.icon} {tc.label}
      </Text>
    </View>
  );
}

export function AnnStatusBadge({
  status,
}: {
  status: "active" | "scheduled" | "expired";
}) {
  const sc = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  return (
    <View style={[styles.badge, { backgroundColor: sc.bg }]}>
      <Text style={[styles.badgeText, { color: sc.color }]}>{sc.label}</Text>
    </View>
  );
}

export function AnnAvatar({
  initials,
  color = C.primary,
  size = 32,
}: {
  initials: string;
  color?: string;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.36 }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 10, fontWeight: "800" },
  avatar: { alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "800" },
});