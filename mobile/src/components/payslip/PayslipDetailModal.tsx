// src/components/payslip/PayslipDetailModal.tsx
// Full breakdown sheet shown when tapping a payslip row — earnings,
// deductions, net pay, mirroring the web app's modal content.

import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { X, Download } from "lucide-react-native";
import C from "../../styles/colors";
import {
  Payslip,
  MONTH_NAMES,
  STATUS_CFG,
  fmt,
} from "../../hooks/payslipHelpers";

type PayslipDetailModalProps = {
  payslip: Payslip | null;
  onClose: () => void;
  onDownload: (p: Payslip) => void;
};

function Row({
  label,
  value,
  bold,
  color,
}: {
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
}) {
  return (
    <View style={styles.row}>
      <Text
        style={[
          styles.rowLabel,
          bold && { fontWeight: "700", color: C.textPrimary },
        ]}
      >
        {label}
      </Text>
      <Text style={[styles.rowValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

export default function PayslipDetailModal({
  payslip,
  onClose,
  onDownload,
}: PayslipDetailModalProps) {
  if (!payslip) return null;
  const badge = STATUS_CFG[payslip.runStatus ?? "draft"] ?? STATUS_CFG.draft;

  return (
    <Modal
      visible={!!payslip}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>
                {MONTH_NAMES[payslip.month]} {payslip.year} Payslip
              </Text>
              <Text style={styles.headerSubtitle}>{payslip.employeeName}</Text>
            </View>
            <Pressable
              onPress={() => onDownload(payslip)}
              hitSlop={8}
              style={styles.iconBtn}
            >
              <Download size={15} color={C.textSecondary} />
            </Pressable>
            <Pressable onPress={onClose} hitSlop={8} style={styles.iconBtn}>
              <X size={15} color={C.textSecondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Employee info grid */}
            <View style={styles.infoGrid}>
              {[
                { label: "Department", value: payslip.departmentName },
                { label: "Job Role", value: payslip.jobRoleName },
                { label: "Employee Code", value: payslip.employeeCode },
              ].map((r) => (
                <View key={r.label} style={styles.infoCell}>
                  <Text style={styles.infoLabel}>{r.label}</Text>
                  <Text style={styles.infoValue}>{r.value ?? "—"}</Text>
                </View>
              ))}
              <View style={styles.infoCell}>
                <Text style={styles.infoLabel}>Status</Text>
                <View
                  style={[styles.statusBadge, { backgroundColor: badge.bg }]}
                >
                  <Text style={[styles.statusLabel, { color: badge.color }]}>
                    {badge.label}
                  </Text>
                </View>
              </View>
            </View>

            {/* Earnings */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Earnings</Text>
              <Row label="Basic Salary" value={fmt(payslip.basicSalary)} />
              <Row
                label="Housing Allowance"
                value={fmt(payslip.housingAllowance)}
              />
              <Row
                label="Transport Allowance"
                value={fmt(payslip.transportAllowance)}
              />
              <Row
                label="Utility Allowance"
                value={fmt(payslip.utilityAllowance)}
              />
              <Row label="Meal Allowance" value={fmt(payslip.mealAllowance)} />
              {!!payslip.overtime && (
                <Row label="Overtime" value={fmt(payslip.overtime)} />
              )}
              {!!payslip.bonus && (
                <Row label="Bonus" value={fmt(payslip.bonus)} />
              )}
              <View style={styles.divider} />
              <Row label="Gross Salary" value={fmt(payslip.grossSalary)} bold />
            </View>

            {/* Deductions */}
            <View style={[styles.section, styles.deductionsSection]}>
              <Text style={[styles.sectionLabel, { color: C.danger }]}>
                Deductions
              </Text>
              <Row
                label="Income Tax (PAYE)"
                value={fmt(payslip.payeTax)}
                color={C.danger}
              />
              <Row
                label="Pension (Employee 8%)"
                value={fmt(payslip.pensionEmployee)}
                color={C.danger}
              />
              <Row
                label="NHF (2.5%)"
                value={fmt(payslip.nhfDeduction)}
                color={C.danger}
              />
              <View style={[styles.divider, { borderColor: "#FCA5A5" }]} />
              <Row
                label="Total Deductions"
                value={fmt(payslip.totalDeductions)}
                bold
                color={C.danger}
              />
            </View>

            {/* Net pay */}
            <View style={styles.netBox}>
              <Text style={styles.netLabel}>Net Pay</Text>
              <Text style={styles.netValue}>{fmt(payslip.netSalary)}</Text>
            </View>

            <View style={{ height: 8 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    maxHeight: "88%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center",
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 2,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  infoCell: {
    width: "47%",
  },
  infoLabel: {
    fontSize: 10,
    color: C.textMuted,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 12.5,
    fontWeight: "700",
    color: C.textPrimary,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  section: {
    backgroundColor: C.surfaceAlt,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  deductionsSection: {
    backgroundColor: "#FFF5F5",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  rowLabel: {
    fontSize: 12.5,
    color: C.textSecondary,
  },
  rowValue: {
    fontSize: 12.5,
    fontWeight: "700",
    color: C.textPrimary,
  },
  divider: {
    borderTopWidth: 1,
    borderColor: C.border,
    marginTop: 6,
    marginBottom: 2,
  },
  netBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.successLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#6EE7B7",
  },
  netLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: C.success,
  },
  netValue: {
    fontSize: 19,
    fontWeight: "800",
    color: C.success,
  },
});
