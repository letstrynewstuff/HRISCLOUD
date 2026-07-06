// src/components/admin/settings/AppearanceView.tsx

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Sun, Moon, Smartphone, Check } from "lucide-react-native";
import { useTheme } from "../../ThemeContext";
import SettingsHeader from "./SettingsHeader";
import SettingsSection from "./SettingsSection";

const OPTIONS = [
  {
    id: "light" as const,
    icon: Sun,
    label: "Light",
    sub: "Bright background, ideal for daytime",
  },
  {
    id: "dark" as const,
    icon: Moon,
    label: "Dark",
    sub: "Dimmed background, easier at night",
  },
];

type Props = { onClose: () => void };

export default function AppearanceView({ onClose }: Props) {
  const { colors: C, scheme, setScheme } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: C.bg }]}>
      <SettingsHeader
        title="Appearance"
        subtitle="Choose how the app looks"
        onBack={onClose}
      />

      <View style={{ padding: 16 }}>
        <SettingsSection title="Theme">
          {OPTIONS.map((opt, i) => {
            const active = scheme === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setScheme(opt.id)}
                style={[
                  styles.row,
                  i > 0 && { borderTopWidth: 1, borderTopColor: C.border },
                ]}
              >
                <View
                  style={[
                    styles.iconWrap,
                    { backgroundColor: active ? C.primary : C.surfaceAlt },
                  ]}
                >
                  <opt.icon size={16} color={active ? "#fff" : C.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: C.textPrimary }]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.sub, { color: C.textMuted }]}>
                    {opt.sub}
                  </Text>
                </View>
                {active ? (
                  <View
                    style={[styles.checkCircle, { backgroundColor: C.primary }]}
                  >
                    <Check size={12} color="#fff" />
                  </View>
                ) : (
                  <View
                    style={[styles.checkCircleEmpty, { borderColor: C.border }]}
                  />
                )}
              </Pressable>
            );
          })}
        </SettingsSection>

        <View style={[styles.hintCard, { backgroundColor: C.primaryLight }]}>
          <Smartphone size={14} color={C.primary} />
          <Text style={[styles.hintText, { color: C.primary }]}>
            Your choice is saved to this device and applied the next time you
            open the app.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 14, fontWeight: "700" },
  sub: { fontSize: 11, marginTop: 2 },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircleEmpty: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  hintCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 16,
    marginTop: 6,
  },
  hintText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: "600" },
});
