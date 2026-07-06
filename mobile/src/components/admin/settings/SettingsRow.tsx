// src/components/admin/settings/shared/SettingsRow.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { ChevronRight, LucideIcon } from "lucide-react-native";
import { useTheme } from "../../ThemeContext";

type Props = {
  icon: LucideIcon;
  label: string;
  sub?: string;
  onPress?: () => void;
  disabled?: boolean;
  badge?: string;
  destructive?: boolean;
  right?: React.ReactNode;
  showChevron?: boolean;
};

export default function SettingsRow({
  icon: Icon,
  label,
  sub,
  onPress,
  disabled,
  badge,
  destructive,
  right,
  showChevron = true,
}: Props) {
  const { colors: C } = useTheme();
  const tint = destructive ? C.danger : C.primary;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.row,
        {
          borderBottomColor: C.border,
          opacity: disabled ? 0.55 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: destructive ? C.dangerLight : C.primaryLight },
        ]}
      >
        <Icon size={16} color={tint} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.labelRow}>
          <Text
            style={[
              styles.label,
              { color: destructive ? C.danger : C.textPrimary },
            ]}
          >
            {label}
          </Text>
          {badge ? (
            <View
              style={[
                styles.badge,
                { backgroundColor: C.surfaceAlt, borderColor: C.border },
              ]}
            >
              <Text style={[styles.badgeText, { color: C.textMuted }]}>
                {badge}
              </Text>
            </View>
          ) : null}
        </View>
        {sub ? (
          <Text style={[styles.sub, { color: C.textMuted }]}>{sub}</Text>
        ) : null}
      </View>
      {right ? (
        right
      ) : showChevron && !disabled ? (
        <ChevronRight size={16} color={C.textMuted} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 14, fontWeight: "700" },
  sub: { fontSize: 11, marginTop: 2 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: { fontSize: 9, fontWeight: "800", textTransform: "uppercase" },
});
