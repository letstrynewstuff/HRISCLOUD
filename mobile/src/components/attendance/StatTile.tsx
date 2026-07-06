// src/components/attendance/StatTile.tsx
// One card in the monthly summary grid: icon chip, big value, label.
// Reused for both the 5-up quick stats row and the 4-up secondary row.

import { View, Text, StyleSheet } from "react-native";
import C from "../../styles/colors";

type StatTileProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bg: string;
  compact?: boolean;
};

export default function StatTile({
  label,
  value,
  icon,
  color,
  bg,
  compact,
}: StatTileProps) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={[styles.iconChip, { backgroundColor: bg }]}>{icon}</View>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: "31%",
    flexGrow: 1,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
  },
  cardCompact: {
    flexBasis: "47%",
  },
  iconChip: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  value: {
    fontSize: 19,
    fontWeight: "800",
    color: C.textPrimary,
    letterSpacing: -0.3,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
});
