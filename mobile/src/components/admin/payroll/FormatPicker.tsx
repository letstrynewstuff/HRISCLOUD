// src/components/admin/payroll/shared/FormatPicker.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Table2, FileText } from "lucide-react-native";
import C from "../../../styles/colors";

type Props = {
  value: "csv" | "pdf";
  onChange: (v: "csv" | "pdf") => void;
};

const OPTIONS = [
  { id: "csv" as const, icon: Table2, label: "CSV", sub: "Bank portal upload" },
  {
    id: "pdf" as const,
    icon: FileText,
    label: "PDF / HTML",
    sub: "Full payroll report",
  },
];

export default function FormatPicker({ value, onChange }: Props) {
  return (
    <View>
      <Text style={styles.label}>Export Format</Text>
      <View style={styles.row}>
        {OPTIONS.map((f) => {
          const active = value === f.id;
          return (
            <Pressable
              key={f.id}
              onPress={() => onChange(f.id)}
              style={[
                styles.card,
                {
                  backgroundColor: active ? C.primaryLight : C.surface,
                  borderColor: active ? C.primary : C.border,
                },
              ]}
            >
              <f.icon size={16} color={active ? C.primary : C.textMuted} />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.title,
                    { color: active ? C.primary : C.textPrimary },
                  ]}
                >
                  {f.label}
                </Text>
                <Text style={styles.sub}>{f.sub}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textMuted,
    marginBottom: 8,
  },
  row: { flexDirection: "row", gap: 8 },
  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 2,
  },
  title: { fontSize: 13, fontWeight: "800" },
  sub: { fontSize: 10, color: C.textMuted, marginTop: 1 },
});
