// src/controllers/payroll.controller.js
//
// Endpoints:
//   POST   /api/payroll/structures              → createPayrollStructure
//   GET    /api/payroll/structures              → getPayrollStructures
//   PUT    /api/payroll/structures/:id          → updatePayrollStructure
//
//   GET    /api/payroll/deductions              → getDeductions
//   POST   /api/payroll/deductions              → createDeduction
//   PATCH  /api/payroll/deductions/:id/toggle   → toggleDeduction
//   PUT    /api/payroll/deductions/:id          → updateDeduction
//   DELETE /api/payroll/deductions/:id          → deleteDeduction
//
//   POST   /api/payroll/runs                    → initPayrollRun
//   GET    /api/payroll/runs                    → listPayrollRuns
//   GET    /api/payroll/runs/:id                → getPayrollRun
//   POST   /api/payroll/runs/:id/process        → runPayrollForCompany
//   POST   /api/payroll/runs/:id/approve        → approvePayrollRun
//   POST   /api/payroll/runs/:id/mark-paid      → markPayrollPaid
//   POST   /api/payroll/runs/:id/employees/:empId → runPayrollForEmployee
//
//   GET    /api/payroll/payslip/:employeeId/:month/:year → getPayslip
//   GET    /api/payroll/payslip/me/:month/:year          → getMyPayslip (employee)
//   GET    /api/payroll/dashboard                        → getDashboard
//   GET    /api/payroll/history                          → getHistory
//   POST   /api/payroll/preview/:employeeId              → previewPayslip

import { validationResult } from "express-validator";
import { db } from "../config/db.js";
import {
  calculatePayslip,
  runPayrollForEmployee as engineRunEmployee,
  seedDefaultDeductions,
  seedDefaultStructure,
} from "../services/payroll.engine.js";

function validationFailed(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res
      .status(422)
      .json({ message: "Validation failed.", errors: errors.array() });
    return true;
  }
  return false;
}

// ─── Camel-case formatter helpers ─────────────────────────────
function fmtStructure(r) {
  return {
    id: r.id,
    companyId: r.company_id,
    name: r.name,
    basicPercent: Number(r.basic_percent),
    housingPercent: Number(r.housing_percent),
    transportPercent: Number(r.transport_percent),
    utilityPercent: Number(r.utility_percent),
    mealPercent: Number(r.meal_percent),
    isActive: r.is_active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function fmtDeduction(r) {
  return {
    id: r.id,
    companyId: r.company_id,
    name: r.name,
    category: r.category,
    type: r.type,
    value: r.value !== null ? Number(r.value) : null,
    formulaKey: r.formula_key,
    calculationBase: r.calculation_base,
    isStatutory: r.is_statutory,
    isActive: r.is_active,
    appliesToAll: r.applies_to_all,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function fmtRun(r) {
  return {
    id: r.id,
    companyId: r.company_id,
    month: r.month,
    year: r.year,
    period: r.period,
    status: r.status,
    totalGross: Number(r.total_gross),
    totalDeductions: Number(r.total_deductions),
    totalNet: Number(r.total_net),
    employeeCount: r.employee_count,
    notes: r.notes,
    initiatedBy: r.initiated_by,
    approvedBy: r.approved_by,
    approvedAt: r.approved_at,
    paidAt: r.paid_at,
    createdAt: r.created_at,
  };
}

function fmtRecord(r) {
  return {
    id: r.id,
    payrollRunId: r.payroll_run_id,
    employeeId: r.employee_id,
    employeeName: r.employee_name,
    employeeCode: r.employee_code,
    departmentName: r.department_name,
    jobRoleName: r.job_role_name,
    month: r.month,
    year: r.year,
    basicSalary: Number(r.basic_salary),
    housingAllowance: Number(r.housing_allowance),
    transportAllowance: Number(r.transport_allowance),
    utilityAllowance: Number(r.utility_allowance),
    mealAllowance: Number(r.meal_allowance),
    overtime: Number(r.overtime),
    bonus: Number(r.bonus),
    otherEarnings: Number(r.other_earnings),
    grossSalary: Number(r.gross_salary),
    deductionsBreakdown: r.deductions_breakdown,
    totalDeductions: Number(r.total_deductions),
    netSalary: Number(r.net_salary),
    taxableIncome: Number(r.taxable_income),
    payeTax: Number(r.paye_tax),
    pensionEmployee: Number(r.pension_employee),
    nhfDeduction: Number(r.nhf_deduction),
    status: r.status,
    payslipGenerated: r.payslip_generated,
  };
}

// ══════════════════════════════════════════════════════════════
// STRUCTURE
// ══════════════════════════════════════════════════════════════

export async function createPayrollStructure(req, res) {
  if (validationFailed(req, res)) return;
  const { companyId } = req.user;
  const {
    name,
    basicPercent = 60,
    housingPercent = 20,
    transportPercent = 10,
    utilityPercent = 5,
    mealPercent = 5,
  } = req.body;

  const total = [
    basicPercent,
    housingPercent,
    transportPercent,
    utilityPercent,
    mealPercent,
  ].reduce((s, v) => s + Number(v), 0);

  if (Math.abs(total - 100) > 0.01) {
    return res
      .status(400)
      .json({
        message: `Percentages must sum to 100. Got ${total.toFixed(2)}.`,
      });
  }

  try {
    const result = await db.query(
      `INSERT INTO payroll_structures
         (company_id, name, basic_percent, housing_percent,
          transport_percent, utility_percent, meal_percent)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        companyId,
        name,
        basicPercent,
        housingPercent,
        transportPercent,
        utilityPercent,
        mealPercent,
      ],
    );
    return res.status(201).json({ data: fmtStructure(result.rows[0]) });
  } catch (err) {
    if (err.code === "23505")
      return res
        .status(409)
        .json({ message: "A structure with this name already exists." });
    console.error("createPayrollStructure error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

export async function getPayrollStructures(req, res) {
  const { companyId } = req.user;
  try {
    const result = await db.query(
      "SELECT * FROM payroll_structures WHERE company_id=$1 ORDER BY created_at DESC",
      [companyId],
    );
    return res.status(200).json({ data: result.rows.map(fmtStructure) });
  } catch (err) {
    console.error("getPayrollStructures error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

export async function updatePayrollStructure(req, res) {
  if (validationFailed(req, res)) return;
  const { id } = req.params;
  const { companyId } = req.user;
  const {
    name,
    basicPercent,
    housingPercent,
    transportPercent,
    utilityPercent,
    mealPercent,
    isActive,
  } = req.body;

  try {
    const existing = await db.query(
      "SELECT * FROM payroll_structures WHERE id=$1 AND company_id=$2",
      [id, companyId],
    );
    if (existing.rowCount === 0)
      return res.status(404).json({ message: "Structure not found." });

    const s = existing.rows[0];
    const result = await db.query(
      `UPDATE payroll_structures
       SET name=$1, basic_percent=$2, housing_percent=$3, transport_percent=$4,
           utility_percent=$5, meal_percent=$6, is_active=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [
        name ?? s.name,
        basicPercent ?? s.basic_percent,
        housingPercent ?? s.housing_percent,
        transportPercent ?? s.transport_percent,
        utilityPercent ?? s.utility_percent,
        mealPercent ?? s.meal_percent,
        isActive ?? s.is_active,
        id,
      ],
    );
    return res.status(200).json({ data: fmtStructure(result.rows[0]) });
  } catch (err) {
    console.error("updatePayrollStructure error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// DEDUCTIONS
// ══════════════════════════════════════════════════════════════

export async function getDeductions(req, res) {
  const { companyId } = req.user;
  const { category, isActive } = req.query;

  const conditions = ["company_id = $1"];
  const params = [companyId];
  let idx = 2;

  if (category) {
    conditions.push(`category = $${idx++}`);
    params.push(category);
  }
  if (isActive !== undefined) {
    conditions.push(`is_active = $${idx++}`);
    params.push(isActive === "true");
  }

  try {
    const result = await db.query(
      `SELECT * FROM payroll_deductions WHERE ${conditions.join(" AND ")} ORDER BY is_statutory DESC, name ASC`,
      params,
    );
    return res
      .status(200)
      .json({ data: result.rows.map(fmtDeduction), total: result.rowCount });
  } catch (err) {
    console.error("getDeductions error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

export async function createDeduction(req, res) {
  if (validationFailed(req, res)) return;
  const { companyId } = req.user;
  const {
    name,
    category = "custom",
    type,
    value,
    formulaKey,
    calculationBase = "gross",
    isStatutory = false,
    isActive = true,
    appliesToAll = true,
  } = req.body;

  if (type !== "formula" && (value === undefined || value === null)) {
    return res
      .status(400)
      .json({ message: "value is required for non-formula deductions." });
  }

  try {
    const result = await db.query(
      `INSERT INTO payroll_deductions
         (company_id, name, category, type, value, formula_key,
          calculation_base, is_statutory, is_active, applies_to_all)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        companyId,
        name,
        category,
        type,
        value ?? null,
        formulaKey ?? null,
        calculationBase,
        isStatutory,
        isActive,
        appliesToAll,
      ],
    );
    return res
      .status(201)
      .json({
        message: "Deduction created.",
        data: fmtDeduction(result.rows[0]),
      });
  } catch (err) {
    if (err.code === "23505")
      return res
        .status(409)
        .json({ message: "A deduction with this name already exists." });
    console.error("createDeduction error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

export async function toggleDeduction(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    const result = await db.query(
      `UPDATE payroll_deductions
       SET is_active = NOT is_active, updated_at = NOW()
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      [id, companyId],
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Deduction not found." });
    const d = result.rows[0];
    return res.status(200).json({
      message: `"${d.name}" is now ${d.is_active ? "enabled" : "disabled"}.`,
      data: fmtDeduction(d),
    });
  } catch (err) {
    console.error("toggleDeduction error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

export async function updateDeduction(req, res) {
  if (validationFailed(req, res)) return;
  const { id } = req.params;
  const { companyId } = req.user;
  const {
    name,
    category,
    type,
    value,
    formulaKey,
    calculationBase,
    isActive,
    appliesToAll,
  } = req.body;

  try {
    const existing = await db.query(
      "SELECT * FROM payroll_deductions WHERE id=$1 AND company_id=$2",
      [id, companyId],
    );
    if (existing.rowCount === 0)
      return res.status(404).json({ message: "Deduction not found." });
    const d = existing.rows[0];

    const result = await db.query(
      `UPDATE payroll_deductions
       SET name=$1, category=$2, type=$3, value=$4, formula_key=$5,
           calculation_base=$6, is_active=$7, applies_to_all=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [
        name ?? d.name,
        category ?? d.category,
        type ?? d.type,
        value !== undefined ? value : d.value,
        formulaKey !== undefined ? formulaKey : d.formula_key,
        calculationBase ?? d.calculation_base,
        isActive ?? d.is_active,
        appliesToAll ?? d.applies_to_all,
        id,
      ],
    );
    return res.status(200).json({ data: fmtDeduction(result.rows[0]) });
  } catch (err) {
    console.error("updateDeduction error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

export async function deleteDeduction(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;
  try {
    const result = await db.query(
      "DELETE FROM payroll_deductions WHERE id=$1 AND company_id=$2 AND is_statutory=false RETURNING id",
      [id, companyId],
    );
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({
          message:
            "Deduction not found or statutory deductions cannot be deleted.",
        });
    }
    return res.status(200).json({ message: "Deduction deleted." });
  } catch (err) {
    console.error("deleteDeduction error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// PAYROLL RUNS
// ══════════════════════════════════════════════════════════════

export async function initPayrollRun(req, res) {
  if (validationFailed(req, res)) return;
  const { companyId, userId } = req.user;
  const { month, year, notes } = req.body;
  const period = `${new Date(year, month - 1).toLocaleString("default", { month: "long" })} ${year}`;

  try {
    const existing = await db.query(
      "SELECT id, status FROM payroll_runs WHERE company_id=$1 AND month=$2 AND year=$3",
      [companyId, month, year],
    );
    if (existing.rowCount > 0) {
      return res.status(409).json({
        message: `A payroll run for ${period} already exists.`,
        data: fmtRun(existing.rows[0]),
      });
    }

    const result = await db.query(
      `INSERT INTO payroll_runs (company_id, month, year, period, notes, initiated_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [companyId, month, year, period, notes ?? null, userId],
    );
    return res
      .status(201)
      .json({ message: "Payroll run created.", data: fmtRun(result.rows[0]) });
  } catch (err) {
    console.error("initPayrollRun error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

export async function listPayrollRuns(req, res) {
  const { companyId } = req.user;
  const { status, year } = req.query;
  const conditions = ["company_id = $1"];
  const params = [companyId];
  let idx = 2;
  if (status) {
    conditions.push(`status = $${idx++}`);
    params.push(status);
  }
  if (year) {
    conditions.push(`year = $${idx++}`);
    params.push(Number(year));
  }

  try {
    const result = await db.query(
      `SELECT * FROM payroll_runs WHERE ${conditions.join(" AND ")} ORDER BY year DESC, month DESC`,
      params,
    );
    return res
      .status(200)
      .json({ data: result.rows.map(fmtRun), total: result.rowCount });
  } catch (err) {
    console.error("listPayrollRuns error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

export async function getPayrollRun(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;
  try {
    const runResult = await db.query(
      "SELECT * FROM payroll_runs WHERE id=$1 AND company_id=$2",
      [id, companyId],
    );
    if (runResult.rowCount === 0)
      return res.status(404).json({ message: "Payroll run not found." });

    const records = await db.query(
      `SELECT
         pr.*,
         CONCAT(e.first_name,' ',e.last_name) AS employee_name,
         e.employee_code,
         d.name AS department_name,
         jr.title AS job_role_name
       FROM payroll_records pr
       JOIN employees e   ON e.id  = pr.employee_id
       LEFT JOIN departments d  ON d.id  = e.department_id
       LEFT JOIN job_roles   jr ON jr.id = e.job_role_id
       WHERE pr.payroll_run_id = $1
       ORDER BY e.last_name ASC`,
      [id],
    );

    return res.status(200).json({
      run: fmtRun(runResult.rows[0]),
      records: records.rows.map(fmtRecord),
      total: records.rowCount,
    });
  } catch (err) {
    console.error("getPayrollRun error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ── Process entire company payroll ─────────────────────────────
export async function runPayrollForCompany(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    const runResult = await db.query(
      "SELECT * FROM payroll_runs WHERE id=$1 AND company_id=$2",
      [id, companyId],
    );
    if (runResult.rowCount === 0)
      return res.status(404).json({ message: "Payroll run not found." });

    const run = runResult.rows[0];
    if (!["draft"].includes(run.status)) {
      return res
        .status(400)
        .json({
          message: `Cannot process a payroll run with status "${run.status}".`,
        });
    }

    // Fetch all active employees
    const employees = await db.query(
      "SELECT id FROM employees WHERE company_id=$1 AND employment_status='active'",
      [companyId],
    );

    if (employees.rowCount === 0) {
      return res.status(400).json({ message: "No active employees found." });
    }

    await db.query("UPDATE payroll_runs SET status='processing' WHERE id=$1", [
      id,
    ]);

    let totalGross = 0,
      totalDeductions = 0,
      totalNet = 0;
    const processed = [];
    const errors = [];

    const client = await db.getClient();
    try {
      await client.query("BEGIN");

      for (const emp of employees.rows) {
        try {
          const payslip = await engineRunEmployee(
            emp.id,
            companyId,
            id,
            run.month,
            run.year,
            {},
            client,
          );
          totalGross += payslip.grossSalary;
          totalDeductions += payslip.totalDeductions;
          totalNet += payslip.netSalary;
          processed.push({ employeeId: emp.id, netSalary: payslip.netSalary });
        } catch (empErr) {
          errors.push({ employeeId: emp.id, error: empErr.message });
        }
      }

      // Update run totals
      await client.query(
        `UPDATE payroll_runs
         SET total_gross=$1, total_deductions=$2, total_net=$3,
             employee_count=$4, status='draft', updated_at=NOW()
         WHERE id=$5`,
        [totalGross, totalDeductions, totalNet, processed.length, id],
      );

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      await db.query("UPDATE payroll_runs SET status='draft' WHERE id=$1", [
        id,
      ]);
      throw err;
    } finally {
      client.release();
    }

    return res.status(200).json({
      message: `Payroll processed for ${processed.length} employees. ${errors.length} errors.`,
      summary: {
        totalGross,
        totalDeductions,
        totalNet,
        processed: processed.length,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("runPayrollForCompany error:", err);
    return res.status(500).json({ message: "Error processing payroll." });
  }
}

// ── Run payroll for a single employee ─────────────────────────
export async function runPayrollForEmployee(req, res) {
  const { id, empId } = req.params;
  const { companyId } = req.user;
  const overrides = req.body ?? {};

  try {
    const runResult = await db.query(
      "SELECT * FROM payroll_runs WHERE id=$1 AND company_id=$2",
      [id, companyId],
    );
    if (runResult.rowCount === 0)
      return res.status(404).json({ message: "Payroll run not found." });
    const run = runResult.rows[0];

    const payslip = await engineRunEmployee(
      empId,
      companyId,
      id,
      run.month,
      run.year,
      overrides,
    );

    return res
      .status(200)
      .json({ message: "Payroll calculated.", data: payslip });
  } catch (err) {
    console.error("runPayrollForEmployee error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Error calculating payroll." });
  }
}

export async function approvePayrollRun(req, res) {
  const { id } = req.params;
  const { companyId, userId } = req.user;
  try {
    const result = await db.query(
      `UPDATE payroll_runs
       SET status='approved', approved_by=$1, approved_at=NOW(), updated_at=NOW()
       WHERE id=$2 AND company_id=$3 AND status='draft'
       RETURNING *`,
      [userId, id, companyId],
    );
    if (result.rowCount === 0)
      return res
        .status(404)
        .json({ message: "Run not found or not in draft status." });
    // Mark all records approved
    await db.query(
      "UPDATE payroll_records SET status='approved', updated_at=NOW() WHERE payroll_run_id=$1",
      [id],
    );
    return res
      .status(200)
      .json({ message: "Payroll approved.", data: fmtRun(result.rows[0]) });
  } catch (err) {
    console.error("approvePayrollRun error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

export async function markPayrollPaid(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;
  try {
    const result = await db.query(
      `UPDATE payroll_runs
       SET status='paid', paid_at=NOW(), updated_at=NOW()
       WHERE id=$1 AND company_id=$2 AND status='approved'
       RETURNING *`,
      [id, companyId],
    );
    if (result.rowCount === 0)
      return res
        .status(404)
        .json({ message: "Run not found or not approved yet." });
    await db.query(
      "UPDATE payroll_records SET status='paid', updated_at=NOW() WHERE payroll_run_id=$1",
      [id],
    );
    return res
      .status(200)
      .json({
        message: "Payroll marked as paid.",
        data: fmtRun(result.rows[0]),
      });
  } catch (err) {
    console.error("markPayrollPaid error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// PAYSLIPS
// ══════════════════════════════════════════════════════════════

export async function getPayslip(req, res) {
  const { employeeId, month, year } = req.params;
  const { companyId, role, userId } = req.user;

  // Employees can only see their own payslip
  if (role === "employee") {
    const emp = await db.query(
      "SELECT id FROM employees WHERE user_id=$1 AND company_id=$2",
      [userId, companyId],
    );
    if (emp.rowCount === 0 || emp.rows[0].id !== employeeId) {
      return res.status(403).json({ message: "Access denied." });
    }
  }

  try {
    const result = await db.query(
      `SELECT
         pr.*,
         CONCAT(e.first_name,' ',e.last_name) AS employee_name,
         e.employee_code, e.personal_email,
         d.name AS department_name,
         jr.title AS job_role_name,
         prun.period, prun.status AS run_status
       FROM payroll_records pr
       JOIN employees e     ON e.id  = pr.employee_id
       LEFT JOIN departments d  ON d.id  = e.department_id
       LEFT JOIN job_roles   jr ON jr.id = e.job_role_id
       JOIN payroll_runs prun ON prun.id = pr.payroll_run_id
       WHERE pr.employee_id=$1 AND pr.month=$2 AND pr.year=$3 AND pr.company_id=$4`,
      [employeeId, Number(month), Number(year), companyId],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Payslip not found for this period." });
    }

    return res.status(200).json({ data: fmtRecord(result.rows[0]) });
  } catch (err) {
    console.error("getPayslip error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

export async function getMyPayslip(req, res) {
  const { month, year } = req.params;
  const { userId, companyId } = req.user;

  try {
    const emp = await db.query(
      "SELECT id FROM employees WHERE user_id=$1 AND company_id=$2",
      [userId, companyId],
    );
    if (emp.rowCount === 0)
      return res.status(404).json({ message: "Employee profile not found." });

    req.params.employeeId = emp.rows[0].id;
    req.user.role = "employee"; // ensure own-only check passes
    return getPayslip(req, res);
  } catch (err) {
    console.error("getMyPayslip error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ── Live preview (no DB write) ─────────────────────────────────
export async function previewPayslip(req, res) {
  const { employeeId } = req.params;
  const { companyId } = req.user;
  const { month, year, overtime, bonus } = req.body;

  if (!month || !year)
    return res.status(400).json({ message: "month and year are required." });

  try {
    const preview = await calculatePayslip(
      employeeId,
      companyId,
      Number(month),
      Number(year),
      { overtime: Number(overtime || 0), bonus: Number(bonus || 0) },
    );
    return res.status(200).json({ data: preview });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Error generating preview." });
  }
}

// ── Dashboard ──────────────────────────────────────────────────
export async function getDashboard(req, res) {
  const { companyId } = req.user;
  try {
    const [latest, history, deptBreakdown] = await Promise.all([
      db.query(
        "SELECT * FROM payroll_runs WHERE company_id=$1 ORDER BY year DESC, month DESC LIMIT 1",
        [companyId],
      ),
      db.query(
        "SELECT period, total_gross, total_net, status FROM payroll_runs WHERE company_id=$1 ORDER BY year DESC, month DESC LIMIT 6",
        [companyId],
      ),
      db.query(
        `SELECT d.name AS department, SUM(pr.gross_salary) AS gross, SUM(pr.net_salary) AS net, COUNT(*) AS employees
         FROM payroll_records pr
         JOIN employees e ON e.id = pr.employee_id
         LEFT JOIN departments d ON d.id = e.department_id
         WHERE pr.company_id=$1
           AND pr.payroll_run_id=(SELECT id FROM payroll_runs WHERE company_id=$1 ORDER BY year DESC, month DESC LIMIT 1)
         GROUP BY d.name ORDER BY gross DESC`,
        [companyId],
      ),
    ]);

    return res.status(200).json({
      latestRun: latest.rows[0] ? fmtRun(latest.rows[0]) : null,
      recentRuns: history.rows.map((r) => ({
        period: r.period,
        gross: Number(r.total_gross),
        net: Number(r.total_net),
        status: r.status,
      })),
      departmentBreakdown: deptBreakdown.rows.map((r) => ({
        department: r.department || "Unassigned",
        gross: Number(r.gross),
        net: Number(r.net),
        employees: Number(r.employees),
      })),
    });
  } catch (err) {
    console.error("getDashboard error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

export async function getHistory(req, res) {
  const { companyId } = req.user;
  const { limit = 12 } = req.query;
  try {
    const result = await db.query(
      "SELECT * FROM payroll_runs WHERE company_id=$1 ORDER BY year DESC, month DESC LIMIT $2",
      [companyId, Number(limit)],
    );
    return res
      .status(200)
      .json({ data: result.rows.map(fmtRun), total: result.rowCount });
  } catch (err) {
    console.error("getHistory error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// Add this to your exports in payroll.controller.js

export async function getPaymentFile(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    // 1. Verify run exists
    const runResult = await db.query(
      "SELECT period FROM payroll_runs WHERE id=$1 AND company_id=$2",
      [id, companyId]
    );
    if (runResult.rowCount === 0) return res.status(404).json({ message: "Run not found." });

    const period = runResult.rows[0].period;

    // 2. Fetch records with bank details
    // Note: Adjust 'bank_name' and 'account_number' to match your employees table columns
    const records = await db.query(
      `SELECT 
         CONCAT(e.first_name, ' ', e.last_name) as account_name,
         e.bank_name,
         e.account_number,
         pr.net_salary
       FROM payroll_records pr
       JOIN employees e ON e.id = pr.employee_id
       WHERE pr.payroll_run_id = $1 AND pr.company_id = $2`,
      [id, companyId]
    );

    // 3. Generate CSV String
    const headers = "Account Name,Bank Name,Account Number,Amount,Narration\n";
    const rows = records.rows.map(r => 
      `"${r.account_name}","${r.bank_name || 'N/A'}","${r.account_number || 'N/A'}",${r.net_salary},"Salary Payment - ${period}"`
    ).join("\n");

    const csvContent = headers + rows;

    // 4. Send as file download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=Payment_File_${id}.csv`);
    return res.status(200).send(csvContent);

  } catch (err) {
    console.error("getPaymentFile error:", err);
    return res.status(500).json({ message: "Error generating payment file." });
  }
}
