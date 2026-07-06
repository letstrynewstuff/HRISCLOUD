import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Target, CheckCircle, Clock, AlertCircle } from "lucide-react-native";
import C from "../../../styles/colors";
import { listGoals } from "../../../api/service/performanceApi";
import { listPIPs } from "../../../api/service/performanceApi";

export default function PerformanceDashboardView({
  searchQuery,
}: {
  searchQuery: string;
}) {
  const [stats, setStats] = useState({
    totalGoals: 0,
    completedGoals: 0,
    inProgressGoals: 0,
    activePIPs: 0,
    completedPIPs: 0,
    failedPIPs: 0,
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [gRes, pRes] = await Promise.allSettled([
        listGoals({ limit: 200 }),
        listPIPs({}),
      ]);
      const goals = gRes.status === "fulfilled" ? (gRes.value?.data ?? []) : [];
      const pips = pRes.status === "fulfilled" ? (pRes.value?.pips ?? []) : [];

      setStats({
        totalGoals: goals.length,
        completedGoals: goals.filter((g: any) => g.status === "completed")
          .length,
        inProgressGoals: goals.filter((g: any) => g.status === "in_progress")
          .length,
        activePIPs: pips.filter((p: any) => p.status === "active").length,
        completedPIPs: pips.filter((p: any) => p.status === "completed").length,
        failedPIPs: pips.filter((p: any) => p.status === "failed").length,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cards = [
    {
      label: "Total Goals",
      value: stats.totalGoals,
      icon: Target,
      color: C.primary,
      bg: C.primaryLight,
    },
    {
      label: "Completed",
      value: stats.completedGoals,
      icon: CheckCircle,
      color: "#059669",
      bg: "#d1fae5",
    },
    {
      label: "In Progress",
      value: stats.inProgressGoals,
      icon: Clock,
      color: "#2563eb",
      bg: "#dbeafe",
    },
    {
      label: "Active PIPs",
      value: stats.activePIPs,
      icon: AlertCircle,
      color: "#d97706",
      bg: "#fef3c7",
    },
    {
      label: "Completed PIPs",
      value: stats.completedPIPs,
      icon: CheckCircle,
      color: "#059669",
      bg: "#d1fae5",
    },
    {
      label: "Failed PIPs",
      value: stats.failedPIPs,
      icon: AlertCircle,
      color: "#dc2626",
      bg: "#fee2e2",
    },
  ];

  if (loading) {
    return (
      <View style={{ padding: 24, alignItems: "center" }}>
        <ActivityIndicator color={C.primary} />
      </View>
    );
  }

  return (
    <View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <View
              key={i}
              style={[
                styles.card,
                { backgroundColor: card.bg, flex: 1, minWidth: "45%" },
              ]}
            >
              <Icon size={20} color={card.color} />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: card.color,
                  marginTop: 8,
                }}
              >
                {card.value}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: card.color,
                  opacity: 0.8,
                  marginTop: 2,
                }}
              >
                {card.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    gap: 4,
  },
});
