// src/components/dashboard/GlanceCard.tsx
// One card in the "Today at a glance" 2x2 grid: label, big value, optional
// secondary line, and a small icon chip in the corner.

import { View, Text, Pressable, StyleSheet } from "react-native";
import C from "../../styles/colors";

type GlanceCardProps = {
  label: string;
  value: string;
  valueColor?: string;
  subLabel?: string;
  icon: React.ReactNode;
  iconBg?: string;
  tint?: string; // optional card background tint
  onPress?: () => void;
};

export default function GlanceCard({
  label,
  value,
  valueColor,
  subLabel,
  icon,
  iconBg = C.surfaceAlt,
  tint,
  onPress,
}: GlanceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        tint ? { backgroundColor: tint, borderColor: "transparent" } : null,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text
        style={[styles.value, valueColor ? { color: valueColor } : null]}
        numberOfLines={1}
      >
        {value}
      </Text>
      {subLabel ? (
        <Text style={styles.subLabel} numberOfLines={1}>
          {subLabel}
        </Text>
      ) : null}

      <View style={[styles.iconChip, { backgroundColor: iconBg }]}>{icon}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: "48%",
    flexGrow: 1,
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    minHeight: 104,
    justifyContent: "flex-start",
  },
  label: {
    fontSize: 12.5,
    fontWeight: "600",
    color: C.textSecondary,
  },
  value: {
    fontSize: 20,
    fontWeight: "800",
    color: C.textPrimary,
    marginTop: 8,
    letterSpacing: -0.3,
  },
  subLabel: {
    fontSize: 11.5,
    color: C.textMuted,
    marginTop: 3,
  },
  iconChip: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
