// src/components/timesheets/WeeklySummaryCards.tsx
// 2x2 grid of weekly stat tiles: total hours, approved, pending, drafts.

import { View, Text, StyleSheet } from "react-native";
import { Clock, CheckCircle2, Send, FileText } from "lucide-react-native";
import C from "../../styles/colors";

export type WeeklySummary = {
  totalHours: number;
  byStatus: {
    Approved?: number;
    Submitted?: number;
    Draft?: number;
    Rejected?: number;
  };
};

type WeeklySummaryCardsProps = {
  summary: WeeklySummary | null;
};

export default function WeeklySummaryCards({
  summary,
}: WeeklySummaryCardsProps) {
  if (!summary) return null;

  const stats = [
    {
      label: "Total hours",
      value: `${summary.totalHours ?? 0}h`,
      Icon: Clock,
      color: C.primary,
      bg: C.primaryLight,
    },
    {
      label: "Approved",
      value: `${summary.byStatus?.Approved ?? 0} entries`,
      Icon: CheckCircle2,
      color: "#059669",
      bg: C.successLight,
    },
    {
      label: "Pending review",
      value: `${summary.byStatus?.Submitted ?? 0} entries`,
      Icon: Send,
      color: "#3B82F6",
      bg: "#EFF6FF",
    },
    {
      label: "Drafts",
      value: `${summary.byStatus?.Draft ?? 0} entries`,
      Icon: FileText,
      color: "#6B7280",
      bg: "#F3F4F6",
    },
  ];

  return (
    <View style={styles.grid}>
      {stats.map((s) => (
        <View
          key={s.label}
          style={[
            styles.tile,
            { backgroundColor: s.bg, borderColor: `${s.color}22` },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: `${s.color}22` }]}>
            <s.Icon size={15} color={s.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.value, { color: s.color }]} numberOfLines={1}>
              {s.value}
            </Text>
            <Text style={styles.label} numberOfLines={1}>
              {s.label}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tile: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: 14,
    fontWeight: "700",
  },
  label: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 1,
  },
});
