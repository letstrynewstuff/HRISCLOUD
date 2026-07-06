// src/components/admin/payroll/shared/ApprovalGate.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { ShieldCheck, Lock, Unlock, Check } from "lucide-react-native";
import C from "../../../styles/colors";

export const APPROVAL_ITEMS = [
  {
    id: "ceo",
    label: "CEO / Managing Director approval",
    sub: "Confirm that the Chief Executive or MD has reviewed and authorised this payroll run.",
  },
  {
    id: "finance",
    label: "Finance / Accounts department sign-off",
    sub: "Confirm that the Finance or Accounts team has verified the totals and approved fund release.",
  },
  {
    id: "hr",
    label: "HR review completed",
    sub: "Confirm that HR has cross-checked all employee records, deductions, and net pay figures.",
  },
] as const;

type Checked = { ceo: boolean; finance: boolean; hr: boolean };

type Props = {
  checked: Checked;
  onChange: (id: keyof Checked, val: boolean) => void;
};

export default function ApprovalGate({ checked, onChange }: Props) {
  const allChecked = APPROVAL_ITEMS.every((item) => checked[item.id]);
  const remaining = APPROVAL_ITEMS.filter((i) => !checked[i.id]).length;

  return (
    <View
      style={[styles.wrap, { borderColor: allChecked ? C.success : C.border }]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: allChecked ? C.successLight : C.surfaceAlt },
        ]}
      >
        <View
          style={[
            styles.headerIcon,
            { backgroundColor: allChecked ? C.success : C.border },
          ]}
        >
          {allChecked ? (
            <Unlock size={16} color="#fff" />
          ) : (
            <Lock size={16} color="#fff" />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.headerTitle,
              { color: allChecked ? C.success : C.textPrimary },
            ]}
          >
            {allChecked
              ? "All approvals confirmed"
              : "Approval confirmation required"}
          </Text>
          <Text style={styles.headerSub}>
            Tick all three boxes to confirm sign-off.
          </Text>
        </View>
        <ShieldCheck size={20} color={allChecked ? C.success : C.textMuted} />
      </View>

      {APPROVAL_ITEMS.map((item, i) => {
        const isChecked = !!checked[item.id];
        return (
          <Pressable
            key={item.id}
            onPress={() => onChange(item.id, !isChecked)}
            style={[
              styles.row,
              i < APPROVAL_ITEMS.length - 1 && styles.rowBorder,
            ]}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: isChecked ? C.success : C.border,
                  backgroundColor: isChecked ? C.success : "transparent",
                },
              ]}
            >
              {isChecked ? <Check size={12} color="#fff" /> : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.rowLabel,
                  { color: isChecked ? C.success : C.textPrimary },
                ]}
              >
                {item.label}
              </Text>
              <Text style={styles.rowSub}>{item.sub}</Text>
            </View>
          </Pressable>
        );
      })}

      {!allChecked && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {remaining} confirmation{remaining > 1 ? "s" : ""} still needed
            before you can finalise.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    borderWidth: 2,
    overflow: "hidden",
    backgroundColor: C.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 13, fontWeight: "800" },
  headerSub: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  rowLabel: { fontSize: 13, fontWeight: "700" },
  rowSub: { fontSize: 11, color: C.textMuted, marginTop: 2, lineHeight: 15 },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: C.dangerLight,
  },
  footerText: { fontSize: 11, fontWeight: "700", color: C.danger },
});
