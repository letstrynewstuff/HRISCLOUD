// src/components/admin/KpiCard.tsx
import { View, Text, StyleSheet } from "react-native";
import C from "../../../styles/colors";

type KpiCardProps = {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  sub: string;
};

export default function KpiCard({
  label,
  value,
  icon,
  color,
  bg,
  sub,
}: KpiCardProps) {
  return (
    <View style={[styles.card, { minWidth: "47%", flex: 1 }]}>
      <View style={[styles.iconWrap, { backgroundColor: bg }]}>{icon}</View>
      <Text style={styles.value}>{value}</Text>
      <Text style={[styles.label, { color }]}>{label}</Text>
      <Text style={styles.sub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  value: {
    fontSize: 24,
    fontWeight: "800",
    color: C.textPrimary,
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  sub: {
    fontSize: 10,
    color: C.textMuted,
  },
});
