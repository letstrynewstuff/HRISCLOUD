// src/components/admin/payroll/PayslipDetailCard.tsx
// RN port of the payslip breakdown portion of PayslipViewer.jsx.
// A reusable card component that renders a single payslip's earnings,
// deductions, and net pay, plus Share/Export actions.

import React from "react";
import { View, Text, Pressable, StyleSheet, Share } from "react-native";
import { Building2, Download } from "lucide-react-native";
import C from "../../../styles/colors";
import { saveAndShareText } from "./downloadFile";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const fmt = (n: any) =>
  `₦${Number(n ?? 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

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
      <Text style={[styles.rowValue, { color: color ?? C.textPrimary }]}>
        {value}
      </Text>
    </View>
  );
}

export default function PayslipDetailCard({
  slip,
  month,
  year,
}: {
  slip: any;
  month: number;
  year: number;
}) {
  const handleDownloadCSV = async () => {
    const rows = [
      ["Item", "Amount"],
      ["Basic Salary", slip.basic_salary],
      ["Housing Allowance", slip.housing_allowance],
      ["Transport Allowance", slip.transport_allowance],
      ["Medical Allowance", slip.medical_allowance],
      ["Other Allowances", slip.other_allowances],
      ["Gross Pay", slip.gross_pay],
      ["PAYE Tax", slip.paye_tax],
      ["Pension (Employee)", slip.pension_employee],
      ["NHF", slip.nhf],
      ["Other Deductions", slip.other_deductions],
      ["Total Deductions", slip.total_deductions],
      ["Net Pay", slip.net_pay],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    await saveAndShareText({
      content: csv,
      filename: `payslip-${year}-${String(month).padStart(2, "0")}.csv`,
      mimeType: "text/csv",
    });
  };

  const handleShareSummary = async () => {
    try {
      await Share.share({
        message: `Payslip — ${MONTHS[month - 1]} ${year}\n${slip.employee_name ?? ""}\nGross: ${fmt(slip.gross_pay)}\nDeductions: ${fmt(slip.total_deductions)}\nNet Pay: ${fmt(slip.net_pay)}`,
      });
    } catch {
      // user cancelled — no-op
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerBand}>
        <View style={styles.headerRow}>
          <View style={styles.companyIcon}>
            <Building2 size={20} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.companyName}>
              {slip.company_name ?? "HRISCloud Ltd"}
            </Text>
            <Text style={styles.periodText}>
              Payslip — {MONTHS[month - 1]} {year}
            </Text>
          </View>
        </View>

        <View style={styles.detailGrid}>
          {[
            { label: "Employee", value: slip.employee_name },
            { label: "Employee Code", value: slip.employee_code },
            { label: "Department", value: slip.department_name ?? "—" },
            { label: "Bank", value: slip.bank_name ?? "—" },
          ].map(({ label, value }) => (
            <View key={label} style={styles.detailItem}>
              <Text style={styles.detailLabel}>{label}</Text>
              <Text style={styles.detailValue}>{value ?? "—"}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.body}>
        {/* Earnings */}
        <Text style={styles.sectionLabel}>Earnings</Text>
        <Row label="Basic Salary" value={fmt(slip.basic_salary)} />
        <Row label="Housing Allowance" value={fmt(slip.housing_allowance)} />
        <Row
          label="Transport Allowance"
          value={fmt(slip.transport_allowance)}
        />
        {slip.medical_allowance > 0 && (
          <Row label="Medical Allowance" value={fmt(slip.medical_allowance)} />
        )}
        {slip.other_allowances > 0 && (
          <Row label="Other Allowances" value={fmt(slip.other_allowances)} />
        )}
        {slip.overtime > 0 && (
          <Row label="Overtime" value={fmt(slip.overtime)} />
        )}
        {slip.bonus > 0 && <Row label="Bonus" value={fmt(slip.bonus)} />}
        <View style={[styles.totalBar, { backgroundColor: C.primaryLight }]}>
          <Text style={[styles.totalLabel, { color: C.primary }]}>
            Gross Pay
          </Text>
          <Text style={[styles.totalValue, { color: C.primary }]}>
            {fmt(slip.gross_pay)}
          </Text>
        </View>

        {/* Deductions */}
        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Deductions</Text>
        {slip.paye_tax > 0 && (
          <Row label="PAYE Tax" value={fmt(slip.paye_tax)} color={C.danger} />
        )}
        {slip.pension_employee > 0 && (
          <Row
            label="Pension (Employee 8%)"
            value={fmt(slip.pension_employee)}
            color={C.danger}
          />
        )}
        {slip.nhf > 0 && (
          <Row label="NHF (2.5%)" value={fmt(slip.nhf)} color={C.danger} />
        )}
        {slip.loan_repayment > 0 && (
          <Row
            label="Loan Repayment"
            value={fmt(slip.loan_repayment)}
            color={C.danger}
          />
        )}
        {slip.other_deductions > 0 && (
          <Row
            label="Other Deductions"
            value={fmt(slip.other_deductions)}
            color={C.danger}
          />
        )}
        <View style={[styles.totalBar, { backgroundColor: C.dangerLight }]}>
          <Text style={[styles.totalLabel, { color: C.danger }]}>
            Total Deductions
          </Text>
          <Text style={[styles.totalValue, { color: C.danger }]}>
            {fmt(slip.total_deductions)}
          </Text>
        </View>
      </View>

      {/* Net Pay */}
      <View style={styles.netPayCard}>
        <Text style={styles.netPayLabel}>Net Pay</Text>
        <Text style={styles.netPaySub}>
          Credit to{" "}
          {slip.account_number
            ? `****${String(slip.account_number).slice(-4)}`
            : "bank account"}
        </Text>
        <Text style={styles.netPayValue}>{fmt(slip.net_pay)}</Text>
      </View>

      <View style={styles.actionsRow}>
        <Pressable onPress={handleDownloadCSV} style={styles.actionBtn}>
          <Download size={13} color={C.primary} />
          <Text style={styles.actionBtnText}>Export CSV</Text>
        </Pressable>
        <Pressable
          onPress={handleShareSummary}
          style={[styles.actionBtn, { backgroundColor: C.surfaceAlt }]}
        >
          <Text style={[styles.actionBtnText, { color: C.textSecondary }]}>
            Share Summary
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    overflow: "hidden",
  },
  headerBand: { backgroundColor: C.navy, padding: 18 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  companyIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  companyName: { color: "#fff", fontWeight: "800", fontSize: 14 },
  periodText: { color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 2 },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 18,
  },
  detailItem: { width: "45%" },
  detailLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: { color: "#fff", fontWeight: "700", fontSize: 12, marginTop: 3 },
  body: { padding: 18 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: C.textMuted,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  rowLabel: { fontSize: 13, color: C.textSecondary },
  rowValue: { fontSize: 13, fontWeight: "700" },
  totalBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  totalLabel: { fontSize: 13, fontWeight: "800" },
  totalValue: { fontSize: 13, fontWeight: "800" },
  netPayCard: {
    marginHorizontal: 18,
    marginBottom: 18,
    padding: 18,
    borderRadius: 16,
    backgroundColor: C.successLight,
    borderWidth: 1,
    borderColor: `${C.success}33`,
  },
  netPayLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: C.success,
    textTransform: "uppercase",
  },
  netPaySub: { fontSize: 11, color: C.textMuted, marginTop: 3 },
  netPayValue: {
    fontSize: 28,
    fontWeight: "800",
    color: C.success,
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: C.primaryLight,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionBtnText: { fontSize: 12, fontWeight: "700", color: C.primary },
});
