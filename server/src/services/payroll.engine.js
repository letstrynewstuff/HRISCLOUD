

// src/services/payroll.engine.js
// ─────────────────────────────────────────────────────────────────────────────
// Nigeria Tax Act 2025 — effective 1 January 2026
//
// ALLOWANCE PHILOSOPHY (fixed):
//   • If a payroll_structure exists AND has non-zero percentages → derive allowances
//   • If NO structure exists → gross = basic_salary only (no invented allowances)
//   • If structure exists but a specific percent is 0 → that allowance is 0
//   • Companies that don't give allowances simply have no structure, or a structure
//     with 100% basic_percent and everything else at 0
// ─────────────────────────────────────────────────────────────────────────────

import { db } from "../config/db.js";

// ── 2026 Nigeria Tax Act PAYE brackets (annual taxable income) ────────────
const PAYE_BRACKETS_2026 = [
  { limit:  800_000,  rate: 0.00 },
  { limit: 2_200_000, rate: 0.15 },
  { limit: 9_000_000, rate: 0.18 },
  { limit:13_000_000, rate: 0.21 },
  { limit:25_000_000, rate: 0.23 },
  { limit: Infinity,  rate: 0.25 },
];

function calcPayeAnnual2026(annualTaxable) {
  if (annualTaxable <= 0) return 0;
  let remaining = annualTaxable;
  let tax = 0;
  for (const { limit, rate } of PAYE_BRACKETS_2026) {
    if (remaining <= 0) break;
    const slice = Math.min(remaining, limit);
    tax += slice * rate;
    remaining -= slice;
  }
  return Math.max(0, tax);
}

// ── Fetch employee + config ───────────────────────────────────────────────
async function fetchPayrollInputs(employeeId, companyId, dbOrClient) {
  const q = dbOrClient.query.bind(dbOrClient);

  const empResult = await q(
    `SELECT
       e.id, e.first_name, e.last_name, e.employee_code,
       e.basic_salary, e.bank_name, e.account_number, e.account_name,
       e.employment_type, e.department_id, e.job_role_id,
       d.name   AS department_name,
       jr.title AS job_role_name
     FROM employees e
     LEFT JOIN departments d  ON d.id  = e.department_id
     LEFT JOIN job_roles   jr ON jr.id = e.job_role_id
     WHERE e.id = $1 AND e.company_id = $2`,
    [employeeId, companyId],
  );
  if (empResult.rowCount === 0)
    throw new Error(`Employee ${employeeId} not found in company ${companyId}.`);

  const emp = empResult.rows[0];

  const structResult = await q(
    `SELECT * FROM payroll_structures
     WHERE company_id = $1 AND is_active = true
     ORDER BY created_at DESC LIMIT 1`,
    [companyId],
  );
  const struct = structResult.rows[0] ?? null;

  const dedResult = await q(
    `SELECT * FROM payroll_deductions
     WHERE company_id = $1 AND is_active = true
     ORDER BY is_statutory DESC, name ASC`,
    [companyId],
  );
  const deductions = dedResult.rows ?? [];

  return { emp, struct, deductions };
}

// ── Does this deduction apply to this employee? ───────────────────────────
function deductionApplies(ded, employeeId) {
  const exemptIds = ded.exempt_employee_ids ?? [];
  if (Array.isArray(exemptIds) && exemptIds.includes(employeeId)) return false;

  if (!ded.applies_to_all) {
    const includeIds = ded.applies_to_employee_ids ?? [];
    if (!Array.isArray(includeIds) || !includeIds.includes(employeeId)) return false;
  }

  return true;
}

// ── Derive allowances from structure ─────────────────────────────────────
// KEY RULE: only called when struct exists and has been explicitly configured.
// Returns zero for any allowance whose percent is 0 or unset.
// Never invents allowances when no structure is present.
function deriveAllowances(basicSalary, struct) {
  const basicPct     = Number(struct.basic_percent     ?? 0);
  const housingPct   = Number(struct.housing_percent   ?? 0);
  const transportPct = Number(struct.transport_percent ?? 0);
  const utilityPct   = Number(struct.utility_percent   ?? 0);
  const mealPct      = Number(struct.meal_percent      ?? 0);

  // If basic_percent is 0 or 100 and no other allowances set → no allowances
  const totalAllowancePct = housingPct + transportPct + utilityPct + mealPct;
  if (totalAllowancePct === 0) {
    // Structure exists but company configured no allowances — respect that
    return {
      housingAllowance:   0,
      transportAllowance: 0,
      utilityAllowance:   0,
      mealAllowance:      0,
    };
  }

  // Back-calculate grossBase from basic_salary and basic_percent
  // e.g. basic = 60% of gross → gross = basic / 0.60
  const grossBase = basicPct > 0 && basicPct < 100
    ? basicSalary / (basicPct / 100)
    : basicSalary; // if basicPct=0 or 100, can't back-calc → use basic as base

  return {
    housingAllowance:   grossBase * (housingPct   / 100),
    transportAllowance: grossBase * (transportPct / 100),
    utilityAllowance:   grossBase * (utilityPct   / 100),
    mealAllowance:      grossBase * (mealPct      / 100),
  };
}

// ── Core payslip calculation (pure — no DB writes) ────────────────────────
export async function calculatePayslip(
  employeeId, companyId, month, year, overrides = {}, dbOrClient = db,
) {
  const { emp, struct, deductions } = await fetchPayrollInputs(employeeId, companyId, dbOrClient);

  // 1. Basic salary — always the foundation
  const basicSalary = Number(emp.basic_salary ?? 0);

  // 2. Allowances — ONLY from an explicitly configured structure
  //    No structure = no allowances. Gross = basic only.
  let housingAllowance   = 0;
  let transportAllowance = 0;
  let utilityAllowance   = 0;
  let mealAllowance      = 0;

  if (struct) {
    const allowances = deriveAllowances(basicSalary, struct);
    housingAllowance   = allowances.housingAllowance;
    transportAllowance = allowances.transportAllowance;
    utilityAllowance   = allowances.utilityAllowance;
    mealAllowance      = allowances.mealAllowance;
  }
  // else: no struct → all allowances stay 0 → gross = basic + overrides only

  const overtime      = Number(overrides.overtime      ?? 0);
  const bonus         = Number(overrides.bonus         ?? 0);
  const otherEarnings = Number(overrides.otherEarnings ?? 0);

  // 3. Gross salary
  const grossSalary =
    basicSalary + housingAllowance + transportAllowance +
    utilityAllowance + mealAllowance + overtime + bonus + otherEarnings;

  // 4. Statutory deductions (only if enabled per company config)

  // Pension base (2026): basic + housing + transport only
  const pensionBase = basicSalary + housingAllowance + transportAllowance;

  const payeDed    = deductions.find(d => d.formula_key === "paye");
  const pensionDed = deductions.find(d => d.formula_key === "pension_employee");
  const nhfDed     = deductions.find(d => d.formula_key === "nhf");

  let pensionEmployee = 0;
  if (pensionDed && deductionApplies(pensionDed, employeeId)) {
    pensionEmployee = pensionBase * (Number(pensionDed.value ?? 8) / 100);
  }

  // NHF 2026: 2.5% of gross
  let nhfDeduction = 0;
  if (nhfDed && deductionApplies(nhfDed, employeeId)) {
    nhfDeduction = grossSalary * (Number(nhfDed.value ?? 2.5) / 100);
  }

  // PAYE 2026: taxable = gross - pension - nhf - rent relief
  let payeTax = 0;
  if (payeDed && deductionApplies(payeDed, employeeId)) {
    const annualRent  = Number(overrides.annualRent ?? 0);
    const rentRelief  = annualRent > 0 ? Math.min(annualRent * 0.20, 500_000) : 0;
    const annualTaxable = Math.max(
      0,
      (grossSalary * 12) - (pensionEmployee * 12) - (nhfDeduction * 12) - rentRelief,
    );
    payeTax = calcPayeAnnual2026(annualTaxable) / 12;
  }

  // 5. Custom deductions
  let customDeductionsTotal = 0;
  const deductionsBreakdown = {};

  if (pensionEmployee > 0) deductionsBreakdown["Pension (Employee 8%)"] = +pensionEmployee.toFixed(2);
  if (nhfDeduction    > 0) deductionsBreakdown["NHF (2.5% of Gross)"]   = +nhfDeduction.toFixed(2);
  if (payeTax         > 0) deductionsBreakdown["PAYE Tax (2026)"]        = +payeTax.toFixed(2);

  for (const ded of deductions) {
    if (["paye", "pension_employee", "nhf"].includes(ded.formula_key)) continue;
    if (!deductionApplies(ded, employeeId)) continue;

    const base   = ded.calculation_base === "basic" ? basicSalary : grossSalary;
    let amount   = 0;

    if      (ded.type === "flat")    amount = Number(ded.value ?? 0);
    else if (ded.type === "percent") amount = base * (Number(ded.value ?? 0) / 100);
    else continue;

    if (amount > 0) {
      customDeductionsTotal += amount;
      deductionsBreakdown[ded.name] = +amount.toFixed(2);
    }
  }

  const totalDeductions = pensionEmployee + nhfDeduction + payeTax + customDeductionsTotal;
  const netSalary       = Math.max(0, grossSalary - totalDeductions);
  const taxableIncome   = Math.max(0, grossSalary - pensionEmployee - nhfDeduction);

  return {
    employeeId,
    employeeName:   `${emp.first_name} ${emp.last_name}`,
    employeeCode:   emp.employee_code,
    departmentId:   emp.department_id,
    jobRoleId:      emp.job_role_id,
    departmentName: emp.department_name,
    jobRoleName:    emp.job_role_name,
    bankName:       emp.bank_name,
    accountNumber:  emp.account_number,
    accountName:    emp.account_name,
    basicSalary,
    housingAllowance,
    transportAllowance,
    utilityAllowance,
    mealAllowance,
    overtime,
    bonus,
    otherEarnings,
    grossSalary,
    pensionEmployee,
    nhfDeduction,
    payeTax,
    otherDeductions: customDeductionsTotal,
    deductionsBreakdown,
    totalDeductions,
    taxableIncome,
    netSalary,
    month,
    year,
    companyId,
  };
}

// ── Write payslip to DB ───────────────────────────────────────────────────
export async function runPayrollForEmployee(
  employeeId, companyId, payrollRunId, month, year, overrides = {}, dbOrClient = db,
) {
  const p = await calculatePayslip(employeeId, companyId, month, year, overrides, dbOrClient);
  const q = dbOrClient.query.bind(dbOrClient);

  const result = await q(
    `INSERT INTO payroll_records (
       company_id, payroll_run_id, employee_id, department_id, job_role_id,
       month, year, basic_salary,
       housing_allowance, transport_allowance, utility_allowance, meal_allowance,
       overtime, bonus, other_earnings, gross_salary,
       pension_employee, nhf_deduction, paye_tax,
       deductions_breakdown, total_deductions, taxable_income, net_salary,
       status, created_at, updated_at
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,
       $13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,
       'draft',NOW(),NOW()
     )
     ON CONFLICT (payroll_run_id, employee_id) DO UPDATE SET
       department_id        = EXCLUDED.department_id,
       job_role_id          = EXCLUDED.job_role_id,
       basic_salary         = EXCLUDED.basic_salary,
       housing_allowance    = EXCLUDED.housing_allowance,
       transport_allowance  = EXCLUDED.transport_allowance,
       utility_allowance    = EXCLUDED.utility_allowance,
       meal_allowance       = EXCLUDED.meal_allowance,
       overtime             = EXCLUDED.overtime,
       bonus                = EXCLUDED.bonus,
       other_earnings       = EXCLUDED.other_earnings,
       gross_salary         = EXCLUDED.gross_salary,
       pension_employee     = EXCLUDED.pension_employee,
       nhf_deduction        = EXCLUDED.nhf_deduction,
       paye_tax             = EXCLUDED.paye_tax,
       deductions_breakdown = EXCLUDED.deductions_breakdown,
       total_deductions     = EXCLUDED.total_deductions,
       taxable_income       = EXCLUDED.taxable_income,
       net_salary           = EXCLUDED.net_salary,
       updated_at           = NOW()
     RETURNING *`,
    [
      companyId, payrollRunId, p.employeeId, p.departmentId, p.jobRoleId,
      month, year, p.basicSalary,
      p.housingAllowance, p.transportAllowance, p.utilityAllowance, p.mealAllowance,
      p.overtime, p.bonus, p.otherEarnings, p.grossSalary,
      p.pensionEmployee, p.nhfDeduction, p.payeTax,
      JSON.stringify(p.deductionsBreakdown), p.totalDeductions, p.taxableIncome, p.netSalary,
    ],
  );

  return { ...p, id: result.rows[0]?.id };
}

// ── Seed helpers ──────────────────────────────────────────────────────────
// NOTE: seedDefaultStructure is intentionally NOT called automatically on
// company creation anymore. A company with no structure = basic salary only.
// HR must explicitly create a structure if they want allowances.

export async function seedDefaultStructure(companyId, dbOrClient = db) {
  const q = dbOrClient.query.bind(dbOrClient);
  const ex = await q("SELECT id FROM payroll_structures WHERE company_id=$1 LIMIT 1", [companyId]);
  if (ex.rowCount > 0) return;
  // Creates a structure where basic = 100% of gross, no allowances
  // HR can edit this later to add allowances
  await q(
    `INSERT INTO payroll_structures
       (company_id,name,basic_percent,housing_percent,transport_percent,utility_percent,meal_percent,is_active)
     VALUES ($1,'Standard',100,0,0,0,0,true)`,
    [companyId],
  );
}

export async function seedDefaultDeductions(companyId, dbOrClient = db) {
  const q = dbOrClient.query.bind(dbOrClient);
  const ex = await q(
    "SELECT id FROM payroll_deductions WHERE company_id=$1 AND is_statutory=true LIMIT 1",
    [companyId],
  );
  if (ex.rowCount > 0) return;

  for (const d of [
    { name: "PAYE Tax (2026)",       category: "tax",     type: "formula",  value: null, key: "paye",             base: "gross" },
    { name: "Pension (Employee 8%)", category: "pension", type: "percent",  value: 8,    key: "pension_employee", base: "gross" },
    { name: "NHF (2.5% of Gross)",   category: "nhf",     type: "percent",  value: 2.5,  key: "nhf",              base: "gross" },
  ]) {
    await q(
      `INSERT INTO payroll_deductions
         (company_id,name,category,type,value,formula_key,calculation_base,is_statutory,is_active,applies_to_all)
       VALUES ($1,$2,$3,$4,$5,$6,$7,true,true,true) ON CONFLICT DO NOTHING`,
      [companyId, d.name, d.category, d.type, d.value ?? null, d.key, d.base],
    );
  }
}