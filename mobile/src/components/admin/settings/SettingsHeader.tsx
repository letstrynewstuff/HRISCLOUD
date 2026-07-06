// src/components/admin/settings/shared/SettingsHeader.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "../../ThemeContext";

type Props = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  right?: React.ReactNode;
};

export default function SettingsHeader({
  title,
  subtitle,
  onBack,
  right,
}: Props) {
  const { colors: C } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + 12,
          borderBottomColor: C.border,
          backgroundColor: C.bg,
        },
      ]}
    >
      <Pressable
        onPress={onBack}
        style={[
          styles.backBtn,
          { backgroundColor: C.surface, borderColor: C.border },
        ]}
      >
        <ChevronLeft size={20} color={C.textSecondary} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: C.textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: C.textMuted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  title: { fontSize: 17, fontWeight: "800" },
  subtitle: { fontSize: 12, marginTop: 2 },
});
