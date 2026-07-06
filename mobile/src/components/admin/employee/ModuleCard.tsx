// src/components/admin/employee/ModuleCard.tsx
import { Pressable, Text, View, StyleSheet } from "react-native";
import C from "../../../styles/colors";

type ModuleCardProps = {
  label: string;
  desc: string;
  icon: React.ReactNode;
  onPress: () => void;
};

export default function ModuleCard({
  label,
  desc,
  icon,
  onPress,
}: ModuleCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={styles.iconWrap}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.desc} numberOfLines={2}>
          {desc}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    gap: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  label: {
    fontSize: 12.5,
    fontWeight: "700",
    color: C.textPrimary,
  },
  desc: {
    fontSize: 10.5,
    color: C.textMuted,
    marginTop: 2,
    lineHeight: 14,
  },
});
