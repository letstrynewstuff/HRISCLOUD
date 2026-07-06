// src/components/admin/documents/documentsShared.tsx
// Shared config/helpers/badges for the Documents module.

import { View, Text, StyleSheet } from "react-native";
import {
  CheckCircle2,
  PenLine,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react-native";
import C from "../../../styles/colors";

export const CATEGORIES = [
  "Contract",
  "NDA",
  "Offer Letter",
  "Policy",
  "Onboarding",
  "Compliance",
  "Promotion Letter",
  "Disciplinary Notice",
  "Exit Letter",
  "Other",
];

export const STEPS = ["Upload File", "Select Employees", "Add Message & Send"];

export function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getInitials(first?: string, last?: string) {
  return `${(first?.[0] ?? "?").toUpperCase()}${(last?.[0] ?? "").toUpperCase()}`;
}

const STATUS_MAP: Record<
  string,
  { bg: string; color: string; icon: any; label: string }
> = {
  signed: {
    bg: "#F0FDF4",
    color: "#15803D",
    icon: CheckCircle2,
    label: "Signed",
  },
  sent: {
    bg: "#EFF6FF",
    color: "#1D4ED8",
    icon: PenLine,
    label: "Awaiting Signature",
  },
  pending: { bg: "#FFF7ED", color: "#C2410C", icon: Clock, label: "Pending" },
  rejected: {
    bg: C.dangerLight,
    color: C.danger,
    icon: XCircle,
    label: "Rejected",
  },
};

export function getStatusConfig(status?: string) {
  const key = (status ?? "").toLowerCase();
  return (
    STATUS_MAP[key] ?? {
      bg: C.surfaceAlt,
      color: C.textMuted,
      icon: AlertCircle,
      label: status ?? "—",
    }
  );
}

export function DocStatusBadge({ status }: { status?: string }) {
  const cfg = getStatusConfig(status);
  const Icon = cfg.icon;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Icon size={9} color={cfg.color} />
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 10, fontWeight: "800" },
});
