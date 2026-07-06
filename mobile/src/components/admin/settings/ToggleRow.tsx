// src/components/admin/settings/shared/ToggleRow.tsx
import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { useTheme } from "../../ThemeContext";

type Props = {
  icon: LucideIcon;
  label: string;
  sub?: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export default function ToggleRow({
  icon: Icon,
  label,
  sub,
  value,
  onChange,
}: Props) {
  const { colors: C } = useTheme();

  return (
    <View style={[styles.row, { borderBottomColor: C.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: C.primaryLight }]}>
        <Icon size={16} color={C.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: C.textPrimary }]}>{label}</Text>
        {sub ? (
          <Text style={[styles.sub, { color: C.textMuted }]}>{sub}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: C.border, true: C.success }}
        thumbColor="#fff"
      />
    </View>
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
  label: { fontSize: 13, fontWeight: "700" },
  sub: { fontSize: 11, marginTop: 2, lineHeight: 15 },
});
