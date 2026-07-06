// src/components/payslip/PayslipListItem.tsx
// One row in the payslips list — tap to open the detail modal.

import { View, Text, Pressable, StyleSheet } from "react-native";
import { FileText, ChevronRight } from "lucide-react-native";
import C from "../../styles/colors";
import {
  Payslip,
  MONTH_NAMES,
  STATUS_CFG,
  fmt,
} from "../../hooks/payslipHelpers";

type PayslipListItemProps = {
  payslip: Payslip;
  masked?: boolean;
  onPress: (p: Payslip) => void;
};

export default function PayslipListItem({
  payslip,
  masked,
  onPress,
}: PayslipListItemProps) {
  const badge = STATUS_CFG[payslip.runStatus ?? 'draft'] ?? STATUS_CFG.draft;
  const disp = (n?: number) => (masked ? "₦ ••••••" : fmt(n));

  return (
    <Pressable
      onPress={() => onPress(payslip)}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.iconWrap}>
        <FileText size={17} color={C.primary} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>
          {MONTH_NAMES[payslip.month]} {payslip.year}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          Gross {disp(payslip.grossSalary)} · Ded{" "}
          {disp(payslip.totalDeductions)}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.net}>{disp(payslip.netSalary)}</Text>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeLabel, { color: badge.color }]}>
            {badge.label}
          </Text>
        </View>
      </View>

      <ChevronRight size={15} color={C.textMuted} style={{ marginLeft: 4 }} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: C.textMuted,
  },
  right: {
    alignItems: "flex-end",
  },
  net: {
    fontSize: 13,
    fontWeight: "700",
    color: C.primary,
    marginBottom: 3,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeLabel: {
    fontSize: 9.5,
    fontWeight: "700",
  },
});
