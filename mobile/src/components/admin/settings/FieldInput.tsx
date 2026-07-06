// src/components/admin/settings/shared/FieldInput.tsx
import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { AlertCircle } from "lucide-react-native";
import { useTheme } from "../../ThemeContext";

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export default function FieldInput({
  label,
  error,
  style,
  ...inputProps
}: Props) {
  const { colors: C } = useTheme();

  return (
    <View>
      <Text style={[styles.label, { color: C.textPrimary }]}>{label}</Text>
      <TextInput
        placeholderTextColor={C.textMuted}
        style={[
          styles.input,
          {
            color: C.textPrimary,
            backgroundColor: C.surfaceAlt,
            borderColor: error ? C.danger : C.border,
          },
          style,
        ]}
        {...inputProps}
      />
      {error ? (
        <View style={styles.errRow}>
          <AlertCircle size={11} color={C.danger} />
          <Text style={[styles.errText, { color: C.danger }]}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: "700", marginBottom: 6 },
  input: {
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    fontSize: 14,
    borderWidth: 1.5,
  },
  errRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
  },
  errText: { fontSize: 11, fontWeight: "600" },
});
