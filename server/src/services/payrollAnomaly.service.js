// src/services/payrollAnomaly.service.js
import { db } from "../config/db.js";
import { calculatePayslip } from "./payroll.engine.js";

const TOLERANCE_NGN = 1.0; // ignore rounding differences under ₦1
const LARGE_CHANGE_PCT = 0.4; // flag if net pay moved >40% vs previous month
const HIGH_OVERTIME_RATIO = 0.5; // flag if overtime > 50% of basic salary

function pctDiff(expected, actual) {
  if (expected === 0) return actual === 0 ? 0 : 1;
  return Math.abs(actual - expected) / Math.abs(expected);
}


async function checkOneRecord(r, companyId) {
  const found = [];
  const employeeLabel = `${r.employee_name} (${r.employee_code || r.employee_id})`;

  // ── 1. Recalculate independently (engine call + previous-month lookup
  //       run in parallel — they don't depend on each other) ────────────
  let recalculated;
  let prevResult;
  try {
    [recalculated, prevResult] = await Promise.all([
      calculatePayslip(r.employee_id, companyId, r.month, r.year, {
        overtime: Number(r.overtime || 0),
        bonus: Number(r.bonus || 0),
        otherEarnings: Number(r.other_earnings || 0),
      }),
      db.query(
        `SELECT net_salary FROM payroll_records
         WHERE employee_id=$1 AND company_id=$2
           AND (year < $3 OR (year = $3 AND month < $4))
         ORDER BY year DESC, month DESC LIMIT 1`,
        [r.employee_id, companyId, r.year, r.month],
      ),
    ]);
  } catch (err) {
    found.push({
      type: "recalculation_failed",
      severity: "high",
      employee: employeeLabel,
      detail: `Could not recalculate payslip for verification: ${err.message}`,
    });
    return found;
  }

  const checks = [
    ["gross_salary", "grossSalary"],
    ["pension_employee", "pensionEmployee"],
    ["nhf_deduction", "nhfDeduction"],
    ["paye_tax", "payeTax"],
    ["total_deductions", "totalDeductions"],
    ["net_salary", "netSalary"],
  ];

  for (const [storedKey, calcKey] of checks) {
    const stored = Number(r[storedKey] ?? 0);
    const expected = Number(recalculated[calcKey] ?? 0);
    const diff = Math.abs(stored - expected);
    if (diff > TOLERANCE_NGN && pctDiff(expected, stored) > 0.001) {
      found.push({
        type: "calculation_mismatch",
        field: storedKey,
        severity: "high",
        employee: employeeLabel,
        stored,
        expected: +expected.toFixed(2),
        difference: +(stored - expected).toFixed(2),
        detail: `Stored ${storedKey} (₦${stored.toLocaleString()}) does not match recalculated value (₦${expected.toFixed(2)}). Structure or deduction rates may have changed after this run was processed.`,
      });
    }
  }

  // ── 2. Sanity checks ────────────────────────────────────────────────
  const netSalary = Number(r.net_salary ?? 0);
  const grossSalary = Number(r.gross_salary ?? 0);
  const totalDeductions = Number(r.total_deductions ?? 0);
  const basicSalary = Number(r.basic_salary ?? 0);
  const overtime = Number(r.overtime ?? 0);

  if (netSalary < 0) {
    found.push({
      type: "negative_net_pay",
      severity: "critical",
      employee: employeeLabel,
      netSalary,
      detail: `Net pay is negative (₦${netSalary}). This payslip cannot be paid as-is.`,
    });
  }
  if (netSalary > grossSalary) {
    found.push({
      type: "net_exceeds_gross",
      severity: "critical",
      employee: employeeLabel,
      detail: `Net pay (₦${netSalary}) exceeds gross salary (₦${grossSalary}), which is impossible.`,
    });
  }
  if (totalDeductions > grossSalary) {
    found.push({
      type: "deductions_exceed_gross",
      severity: "critical",
      employee: employeeLabel,
      detail: `Total deductions (₦${totalDeductions}) exceed gross salary (₦${grossSalary}).`,
    });
  }
  if (!r.bank_name || !r.account_number) {
    found.push({
      type: "missing_bank_details",
      severity: "high",
      employee: employeeLabel,
      detail: `No bank name/account number on file — this employee cannot be paid via bank transfer.`,
    });
  }
  if (basicSalary > 0 && overtime > basicSalary * HIGH_OVERTIME_RATIO) {
    found.push({
      type: "unusually_high_overtime",
      severity: "medium",
      employee: employeeLabel,
      overtime,
      basicSalary,
      detail: `Overtime (₦${overtime}) is more than ${HIGH_OVERTIME_RATIO * 100}% of basic salary (₦${basicSalary}) — worth a manual check.`,
    });
  }

  // ── 3. Month-over-month comparison ──────────────────────────────────
  if (prevResult.rowCount > 0) {
    const prevNet = Number(prevResult.rows[0].net_salary ?? 0);
    if (prevNet > 0 && pctDiff(prevNet, netSalary) > LARGE_CHANGE_PCT) {
      found.push({
        type: "large_month_over_month_change",
        severity: "medium",
        employee: employeeLabel,
        previousNet: prevNet,
        currentNet: netSalary,
        detail: `Net pay changed by ${(pctDiff(prevNet, netSalary) * 100).toFixed(1)}% vs previous month (₦${prevNet} → ₦${netSalary}).`,
      });
    }
  }

  return found;
}

/**
 * Pure rules-engine anomaly detection for one payroll run.
 *
 * Every employee's checks run CONCURRENTLY (Promise.allSettled) instead of
 * one after another — this is the same pattern runPayrollForCompany already
 * uses. For a handful of employees this typically completes in 1-3s instead
 * of the 15-20s+ a sequential loop takes against a remote DB.
 *
 * No AI involved in detection — only plain arithmetic and SQL.
 */
export async function detectAnomaliesForRun(runId, companyId) {
  const runResult = await db.query(
    "SELECT * FROM payroll_runs WHERE id=$1 AND company_id=$2",
    [runId, companyId],
  );
  if (runResult.rowCount === 0) throw new Error("Payroll run not found.");
  const run = runResult.rows[0];

  const recordsResult = await db.query(
    `SELECT
       pr.*,
       CONCAT(e.first_name,' ',e.last_name) AS employee_name,
       e.employee_code, e.bank_name, e.account_number
     FROM payroll_records pr
     JOIN employees e ON e.id = pr.employee_id
     WHERE pr.payroll_run_id = $1 AND pr.company_id = $2`,
    [runId, companyId],
  );
  const records = recordsResult.rows;

  const results = await Promise.allSettled(
    records.map((r) => checkOneRecord(r, companyId)),
  );

  const anomalies = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      anomalies.push(...result.value);
    } else {
      const r = records[i];
      console.error(
        `[anomalies] check failed for employee ${r.employee_id}:`,
        result.reason?.message,
      );
      anomalies.push({
        type: "recalculation_failed",
        severity: "high",
        employee: `${r.employee_name} (${r.employee_code || r.employee_id})`,
        detail: `Could not verify this payslip: ${result.reason?.message || "unknown error"}`,
      });
    }
  });

  return {
    run: {
      id: run.id,
      period: run.period,
      status: run.status,
      employeeCount: records.length,
    },
    anomalies,
  };
}
