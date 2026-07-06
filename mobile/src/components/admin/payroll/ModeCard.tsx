// src/components/admin/payroll/shared/ModeCard.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { LucideIcon } from "lucide-react-native";
import C from "../../../styles/colors";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  selected: boolean;
  onPress: () => void;
};

export default function ModeCard({
  icon: Icon,
  title,
  description,
  badge,
  selected,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: selected ? C.primaryLight : C.surface,
          borderColor: selected ? C.primary : C.border,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: selected ? C.primary : C.surfaceAlt },
        ]}
      >
        <Icon size={20} color={selected ? "#fff" : C.textMuted} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.desc}>{description}</Text>
      </View>
      <View
        style={[
          styles.radio,
          {
            borderColor: selected ? C.primary : C.border,
            backgroundColor: selected ? C.primary : "transparent",
          },
        ]}
      >
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 14, fontWeight: "800", color: C.textPrimary },
  badge: {
    backgroundColor: C.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: { fontSize: 9, fontWeight: "800", color: C.success },
  desc: { fontSize: 12, color: C.textSecondary, marginTop: 4, lineHeight: 17 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
});
