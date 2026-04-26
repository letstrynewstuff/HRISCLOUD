// src/admin/payroll/PayslipViewer.jsx
// HR: pass employeeId + month + year props.
// Employee self-service: omit employeeId → calls /me endpoint.
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  AlertCircle,
  Download,
  Printer,
  Building2,
  User,
} from "lucide-react";
import { getPayslip, getMyPayslip } from "../../api/service/payrollApi";
import { C } from "../employeemanagement/sharedData";

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
const fmt = (n) =>
  `₦${Number(n ?? 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

function Row({ label, value, bold, color }) {
  return (
    <div
      className="flex justify-between items-center py-2.5 border-b last:border-0"
      style={{ borderColor: C.border }}
    >
      <span
        className="text-sm"
        style={{
          color: bold ? C.textPrimary : C.textSecondary,
          fontWeight: bold ? 600 : 400,
        }}
      >
        {label}
      </span>
      <span
        className="text-sm font-semibold"
        style={{ color: color ?? C.textPrimary }}
      >
        {value}
      </span>
    </div>
  );
}

export default function PayslipViewer({
  employeeId,
  month,
  year,
  isEmployee = false,
}) {
  const now = new Date();
  const [selMonth, setSelMonth] = useState(month ?? now.getMonth() + 1);
  const [selYear, setSelYear] = useState(year ?? now.getFullYear());
  const [slip, setSlip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentYear = now.getFullYear();

  const fetchSlip = async () => {
    setLoading(true);
    setError(null);
    setSlip(null);
    try {
      const res = isEmployee
        ? await getMyPayslip(selMonth, selYear)
        : await getPayslip(employeeId, selMonth, selYear);
      setSlip(res.data ?? res);
    } catch (e) {
      setError(
        e?.response?.data?.message ?? "Payslip not found for this period.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId || isEmployee) fetchSlip();
  }, [selMonth, selYear]);

  const handlePrint = () => window.print();

  const handleDownloadCSV = () => {
    if (!slip) return;
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
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payslip-${selYear}-${String(selMonth).padStart(2, "0")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selMonth}
          onChange={(e) => setSelMonth(Number(e.target.value))}
          className="px-3.5 py-2.5 rounded-xl text-sm outline-none appearance-none"
          style={{
            background: C.surface,
            border: `1.5px solid ${C.border}`,
            color: C.textPrimary,
            minWidth: 140,
          }}
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={selYear}
          onChange={(e) => setSelYear(Number(e.target.value))}
          className="px-3.5 py-2.5 rounded-xl text-sm outline-none appearance-none"
          style={{
            background: C.surface,
            border: `1.5px solid ${C.border}`,
            color: C.textPrimary,
          }}
        >
          {[currentYear - 1, currentYear].map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={fetchSlip}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{
            background: C.primary,
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            "Load Payslip"
          )}
        </motion.button>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 p-4 rounded-2xl"
          style={{
            background: C.dangerLight,
            border: `1px solid ${C.danger}33`,
          }}
        >
          <AlertCircle size={15} color={C.danger} />
          <p className="text-sm" style={{ color: C.danger }}>
            {error}
          </p>
        </div>
      )}

      {loading && (
        <div className="py-16 text-center">
          <Loader2
            size={28}
            color={C.primary}
            className="animate-spin mx-auto"
          />
        </div>
      )}

      {slip && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          id="payslip-printable"
        >
          {/* Payslip header */}
          <div
            className="rounded-2xl overflow-hidden border"
            style={{ background: C.surface, borderColor: C.border }}
          >
            <div
              className="p-6"
              style={{
                background: `linear-gradient(135deg,${C.navy},${C.primary})`,
              }}
            >
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  >
                    <Building2 size={22} color="#fff" />
                  </div>
                  <div>
                    <p
                      className="text-white font-bold text-base"
                      style={{ fontFamily: "Sora,sans-serif" }}
                    >
                      {slip.company_name ?? "HRISCloud Ltd"}
                    </p>
                    <p className="text-white/60 text-xs">
                      Payslip — {MONTHS[selMonth - 1]} {selYear}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <Printer size={13} /> Print
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleDownloadCSV}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <Download size={13} /> CSV
                  </motion.button>
                </div>
              </div>

              {/* Employee details */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Employee", value: slip.employee_name },
                  { label: "Employee Code", value: slip.employee_code },
                  { label: "Department", value: slip.department_name ?? "—" },
                  { label: "Bank", value: slip.bank_name ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-white/50 text-[10px] uppercase tracking-wider">
                      {label}
                    </p>
                    <p className="text-white font-semibold text-sm mt-0.5">
                      {value ?? "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Earnings */}
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-3"
                  style={{ color: C.textMuted }}
                >
                  Earnings
                </p>
                <div>
                  <Row label="Basic Salary" value={fmt(slip.basic_salary)} />
                  <Row
                    label="Housing Allowance"
                    value={fmt(slip.housing_allowance)}
                  />
                  <Row
                    label="Transport Allowance"
                    value={fmt(slip.transport_allowance)}
                  />
                  {slip.medical_allowance > 0 && (
                    <Row
                      label="Medical Allowance"
                      value={fmt(slip.medical_allowance)}
                    />
                  )}
                  {slip.other_allowances > 0 && (
                    <Row
                      label="Other Allowances"
                      value={fmt(slip.other_allowances)}
                    />
                  )}
                  {slip.overtime > 0 && (
                    <Row label="Overtime" value={fmt(slip.overtime)} />
                  )}
                  {slip.bonus > 0 && (
                    <Row label="Bonus" value={fmt(slip.bonus)} />
                  )}
                </div>
                <div
                  className="mt-3 p-3 rounded-xl"
                  style={{ background: C.primaryLight }}
                >
                  <div className="flex justify-between">
                    <span
                      className="text-sm font-bold"
                      style={{ color: C.primary }}
                    >
                      Gross Pay
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: C.primary }}
                    >
                      {fmt(slip.gross_pay)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-3"
                  style={{ color: C.textMuted }}
                >
                  Deductions
                </p>
                <div>
                  {slip.paye_tax > 0 && (
                    <Row
                      label="PAYE Tax"
                      value={fmt(slip.paye_tax)}
                      color={C.danger}
                    />
                  )}
                  {slip.pension_employee > 0 && (
                    <Row
                      label="Pension (Employee 8%)"
                      value={fmt(slip.pension_employee)}
                      color={C.danger}
                    />
                  )}
                  {slip.nhf > 0 && (
                    <Row
                      label="NHF (2.5%)"
                      value={fmt(slip.nhf)}
                      color={C.danger}
                    />
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
                </div>
                <div
                  className="mt-3 p-3 rounded-xl"
                  style={{ background: C.dangerLight }}
                >
                  <div className="flex justify-between">
                    <span
                      className="text-sm font-bold"
                      style={{ color: C.danger }}
                    >
                      Total Deductions
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: C.danger }}
                    >
                      {fmt(slip.total_deductions)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Pay */}
            <div
              className="mx-6 mb-6 p-5 rounded-2xl"
              style={{
                background: C.successLight,
                border: `1px solid ${C.success}33`,
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: C.success }}
                  >
                    Net Pay
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                    Credit to{" "}
                    {slip.account_number
                      ? `****${slip.account_number.slice(-4)}`
                      : "bank account"}
                  </p>
                </div>
                <p
                  className="text-3xl font-bold"
                  style={{ color: C.success, fontFamily: "Sora,sans-serif" }}
                >
                  {fmt(slip.net_pay)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
