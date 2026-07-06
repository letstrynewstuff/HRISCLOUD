// src/components/admin/payroll/shared/StatusBadge.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CheckCircle2, Clock, XCircle, LucideIcon } from "lucide-react-native";

export const STATUS_CONFIG: Record<
  string,
  { bg: string; color: string; label: string; icon: LucideIcon }
> = {
  paid: { bg: "#D1FAE5", color: "#065F46", label: "Paid", icon: CheckCircle2 },
  approved: {
    bg: "#EDE9FE",
    color: "#5B21B6",
    label: "Approved",
    icon: CheckCircle2,
  },
  processed: {
    bg: "#DBEAFE",
    color: "#1D4ED8",
    label: "Processed",
    icon: CheckCircle2,
  },
  processing: {
    bg: "#FEF3C7",
    color: "#92400E",
    label: "Processing",
    icon: Clock,
  },
  draft: { bg: "#F1F5F9", color: "#475569", label: "Draft", icon: Clock },
  cancelled: {
    bg: "#FEE2E2",
    color: "#991B1B",
    label: "Cancelled",
    icon: XCircle,
  },
};

export default function StatusBadge({ status }: { status?: string | null }) {
  const cfg = STATUS_CONFIG[status ?? "draft"] ?? STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  return (
    <View style={[styles.wrap, { backgroundColor: cfg.bg }]}>
      <Icon size={10} color={cfg.color} />
      <Text style={[styles.text, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  text: { fontSize: 10, fontWeight: "800" },
});
