import { View, Text, StyleSheet } from "react-native";
import { AlertCircle } from "lucide-react-native";
import C from "../../../styles/colors";

interface Props {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export default function MobileFormField({
  label,
  required,
  error,
  hint,
  children,
}: Props) {
  return (
    <View>
      <Text style={styles.label}>
        {label} {required && <Text style={{ color: C.danger }}>*</Text>}
      </Text>
      {children}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
      {error && (
        <View style={styles.errorRow}>
          <AlertCircle size={12} color={C.danger} />
          <Text style={styles.error}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textPrimary,
    marginBottom: 6,
  },
  hint: { fontSize: 11, color: C.textMuted, marginTop: 4 },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  error: { fontSize: 11, color: C.danger, fontWeight: "600" },
});
