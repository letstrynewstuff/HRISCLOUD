// src/components/profile/InfoRow.tsx
// Label + value row used across all profile tab sections.
// Optional masking (for account numbers) with a copy button.

import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Clipboard } from "react-native";
import { Copy, Check } from "lucide-react-native";
import C from "../../styles/colors";

type InfoRowProps = {
  label: string;
  value?: string | null;
  masked?: boolean;
  mono?: boolean;
  last?: boolean;
};

export default function InfoRow({
  label,
  value,
  masked,
  mono,
  last,
}: InfoRowProps) {
  const [copied, setCopied] = useState(false);

  const display =
    masked && value ? value.replace(/(\d{4})\d+(\d{4})/, "$1••••$2") : value;

  function handleCopy() {
    if (!value) return;
    Clipboard.setString(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.right}>
        <Text
          style={[
            styles.value,
            mono && styles.mono,
            !value && styles.valueMuted,
          ]}
          numberOfLines={2}
        >
          {display ?? "—"}
        </Text>
        {masked && !!value && (
          <Pressable onPress={handleCopy} hitSlop={8} style={styles.copyBtn}>
            {copied ? (
              <Check size={12} color={C.success} />
            ) : (
              <Copy size={12} color={C.textMuted} />
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 16,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: "500",
    minWidth: 130,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "flex-end",
  },
  value: {
    fontSize: 12.5,
    color: C.textPrimary,
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
  },
  valueMuted: {
    color: C.textMuted,
    fontWeight: "400",
  },
  mono: {
    fontFamily: "monospace",
  },
  copyBtn: {
    padding: 2,
  },
});
