// src/components/admin/settings/shared/SettingsSection.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../ThemeContext";

export default function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { colors: C } = useTheme();
  return (
    <View style={{ marginBottom: 22 }}>
      <Text style={[styles.title, { color: C.textMuted }]}>{title}</Text>
      <View
        style={[
          styles.card,
          { backgroundColor: C.surface, borderColor: C.border },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 12 },
});
