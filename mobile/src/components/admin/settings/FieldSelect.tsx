// src/components/admin/settings/shared/FieldSelect.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import { ChevronDown, Check, X } from "lucide-react-native";
import { useTheme } from "../../ThemeContext";

type Option = { label: string; value: string };

type Props = {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
};

export default function FieldSelect({
  label,
  value,
  options,
  onChange,
}: Props) {
  const { colors: C } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View>
      <Text style={[styles.label, { color: C.textPrimary }]}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          { backgroundColor: C.surfaceAlt, borderColor: C.border },
        ]}
      >
        <Text
          style={[styles.value, { color: C.textPrimary }]}
          numberOfLines={1}
        >
          {selected?.label ?? "Select…"}
        </Text>
        <ChevronDown size={16} color={C.textMuted} />
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: C.surface }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: C.textPrimary }]}>
                {label}
              </Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <X size={18} color={C.textMuted} />
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    style={[
                      styles.option,
                      active && { backgroundColor: C.primaryLight },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: active ? C.primary : C.textPrimary },
                        active && { fontWeight: "700" },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {active && <Check size={16} color={C.primary} />}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: "700", marginBottom: 6 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  value: { fontSize: 14, flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: "70%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sheetTitle: { fontSize: 16, fontWeight: "800" },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  optionText: { fontSize: 14 },
});
