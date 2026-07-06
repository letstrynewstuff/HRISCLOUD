// src/components/dashboard/QuickActionTile.tsx
// One tile in the Quick Actions grid: square icon chip + label underneath.

import { View, Text, Pressable, StyleSheet } from "react-native";
import C from "../../styles/colors";

type QuickActionTileProps = {
  label: string;
  icon: React.ReactNode;
  iconBg: string;
  onPress?: () => void;
  badge?: boolean;
};

export default function QuickActionTile({
  label,
  icon,
  iconBg,
  onPress,
  badge,
}: QuickActionTileProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        {icon}
        {badge && <View style={styles.badgeDot} />}
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    width: 64,
    gap: 8,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  badgeDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.danger,
  },
  label: {
    fontSize: 11.5,
    fontWeight: "600",
    color: C.textSecondary,
    textAlign: "center",
  },
});
