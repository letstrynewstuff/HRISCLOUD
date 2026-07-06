// src/components/profile/JobTab.tsx
import { View, Text, StyleSheet } from "react-native";
import { Briefcase } from "lucide-react-native";
import C from "../../styles/colors";
import InfoRow from "./InfoRow";

export function JobTab({ emp }: { emp: Record<string, any> }) {
  const fmtDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-NG") : null;

  const rows = [
    { label: "Employee Code", value: emp.employee_code, mono: true },
    { label: "Department", value: emp.department_name },
    { label: "Job Role", value: emp.job_role_name },
    { label: "Manager", value: emp.manager_name },
    {
      label: "Employment Type",
      value: emp.employment_type?.replace("_", " "),
    },
    { label: "Start Date", value: fmtDate(emp.start_date) },
    { label: "Confirmation", value: fmtDate(emp.confirmation_date) },
    { label: "Location", value: emp.location },
    { label: "Status", value: emp.employment_status },
    { label: "Pay Grade", value: emp.pay_grade },
  ];

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Briefcase size={14} color={C.primary} />
        </View>
        <Text style={styles.title}>Employment Details</Text>
      </View>
      <View style={styles.body}>
        {rows.map((r, i) => (
          <InfoRow
            key={r.label}
            label={r.label}
            value={r.value}
            mono={r.mono}
            last={i === rows.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// src/components/profile/PayrollTab.tsx
// Bank & salary details with account number masking.
// ─────────────────────────────────────────────────────────────
import { CreditCard } from "lucide-react-native";

export function PayrollTab({ emp }: { emp: Record<string, any> }) {
  const salary = emp.basic_salary
    ? `₦${Number(emp.basic_salary).toLocaleString()}`
    : null;

  const rows = [
    { label: "Basic Salary", value: salary },
    { label: "Pay Grade", value: emp.pay_grade },
    { label: "Bank Name", value: emp.bank_name },
    {
      label: "Account Number",
      value: emp.account_number,
      masked: true,
      mono: true,
    },
    { label: "Account Name", value: emp.account_name },
    { label: "Pension PIN", value: emp.pension_pin, mono: true },
    { label: "Tax ID", value: emp.tax_id, mono: true },
  ];

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: C.successLight }]}>
          <CreditCard size={14} color={C.success} />
        </View>
        <View>
          <Text style={styles.title}>Bank & Payroll Details</Text>
          <Text style={styles.sub}>Salary and banking information</Text>
        </View>
      </View>
      <View style={styles.body}>
        {rows.map((r, i) => (
          <InfoRow
            key={r.label}
            label={r.label}
            value={r.value}
            masked={r.masked}
            mono={r.mono}
            last={i === rows.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  title: {
    fontSize: 13.5,
    fontWeight: "700",
    color: C.textPrimary,
  },
  sub: {
    fontSize: 10,
    color: C.textMuted,
    marginTop: 1,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
});
