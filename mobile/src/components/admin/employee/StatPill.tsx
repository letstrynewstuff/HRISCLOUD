// src/components/admin/employee/StatPill.tsx
import { View, Text, StyleSheet } from "react-native";
import C from "../../../styles/colors";

type StatPillProps = {
  label: string;
  value: number;
  color: string;
  loading?: boolean;
};

export default function StatPill({
  label,
  value,
  color,
  loading,
}: StatPillProps) {
  return (
    <View style={styles.pill}>
      {loading ? (
        <View style={styles.skeleton} />
      ) : (
        <Text style={[styles.value, { color }]}>{value}</Text>
      )}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  skeleton: {
    width: 24,
    height: 18,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.20)",
  },
  value: {
    fontSize: 16,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  label: {
    fontSize: 11,
    color: "rgba(255,255,255,0.60)",
    fontWeight: "500",
  },
});
