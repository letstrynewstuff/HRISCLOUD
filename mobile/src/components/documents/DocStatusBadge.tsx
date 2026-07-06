

// src/components/documents/DocStatusBadge.tsx

import { View, Text, StyleSheet } from "react-native";
import { Clock, Shield, CheckCircle2, LucideIcon } from "lucide-react-native";
import C from "../../styles/colors";
import { DocStatus } from "../../types/document";

const MAP: Record<
  DocStatus,
  { label: string; bg: string; color: string; Icon: LucideIcon }
> = {
  pending: {
    label: "Pending",
    bg: "#FFF7ED",
    color: "#C2410C",
    Icon: Clock,
  },
  sent: {
    label: "Awaiting Signature",
    bg: "#EFF6FF",
    color: "#1D4ED8",
    Icon: Shield,
  },
  signed: {
    label: "Signed",
    bg: "#F0FDF4",
    color: "#15803D",
    Icon: CheckCircle2,
  },
};

export default function DocStatusBadge({
  status,
}: {
  status: DocStatus | string;
}) {
  const cfg = MAP[status as DocStatus] ?? MAP.pending;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <cfg.Icon size={9} color={cfg.color} strokeWidth={2.4} />
      <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
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
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  label: { fontSize: 9.5, fontWeight: "700" },
});
