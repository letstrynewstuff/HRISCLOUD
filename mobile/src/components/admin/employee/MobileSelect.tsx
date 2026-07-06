import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import { ChevronDown, X, Check } from "lucide-react-native";
import C from "../../../styles/colors";

interface Option {
  label: string;
  value: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
}

export default function MobileSelect({
  value,
  onChange,
  options,
  placeholder,
  error,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.trigger,
          {
            borderColor: error ? C.danger : value ? C.primary + "66" : C.border,
          },
        ]}
      >
        <Text style={[styles.triggerText, !selected && { color: C.textMuted }]}>
          {selected?.label || placeholder || "Select…"}
        </Text>
        <ChevronDown size={16} color={C.textMuted} />
      </Pressable>

      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select an option</Text>
              <Pressable onPress={() => setOpen(false)} style={styles.closeBtn}>
                <X size={20} color={C.textSecondary} />
              </Pressable>
            </View>
            <ScrollView>
              {options.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  style={styles.option}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === opt.value && styles.optionTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {value === opt.value && <Check size={18} color={C.primary} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  triggerText: { fontSize: 14, color: C.textPrimary, flex: 1 },

  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
    paddingBottom: 30,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  sheetTitle: { fontSize: 16, fontWeight: "800", color: C.textPrimary },
  closeBtn: { padding: 4 },

  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  optionText: { fontSize: 15, color: C.textPrimary },
  optionTextActive: { fontWeight: "700", color: C.primary },
});
