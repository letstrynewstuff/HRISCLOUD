// // src/services/payroll.engine.js
// //
// // Pure calculation logic — no req/res. Called by controllers.
// // All DB calls use the shared pg pool via db.query().
// //
// // Flow:
// //   1. Load employee salary + structure
// //   2. Compute earnings breakdown (basic, housing, transport …)
// //   3. Apply extra earnings (overtime, bonus, HR-defined earnings)
// //   4. Compute taxable income
// //   5. Apply all active deductions (dynamic from DB — statutory + custom)
// //   6. Return full payslip breakdown

// import { db } from "../config/db.js";

// // ─── Nigeria PAYE table (2024) ─────────────────────────────────
// // Only used when a deduction has formula_key = "nigeria_paye".
// // Companies that don't want PAYE simply set is_active = false.
// function computeNigeriaPAYE(annualTaxableIncome) {
//   const BANDS = [
//     { limit: 300_000, rate: 0.07 },
//     { limit: 300_000, rate: 0.11 },
//     { limit: 500_000, rate: 0.15 },
//     { limit: 500_000, rate: 0.19 },
//     { limit: 1_600_000, rate: 0.21 },
//     { limit: Infinity, rate: 0.24 },
//   ];

//   let tax = 0;
//   let remaining = Math.max(0, annualTaxableIncome);
//   for (const band of BANDS) {
//     const taxable = Math.min(remaining, band.limit);
//     tax += taxable * band.rate;
//     remaining -= taxable;
//     if (remaining <= 0) break;
//   }
//   return Math.round(tax / 12); // monthly PAYE
// }

// // ─── Resolve deduction amount ──────────────────────────────────
// function resolveDeductionAmount(deduction, ctx) {
//   const { basic, gross, taxableIncome, overrideValue } = ctx;
//   const val = overrideValue ?? Number(deduction.value ?? 0);
//   const base = deduction.calculation_base;

//   if (deduction.type === "fixed" || base === "fixed") {
//     return Math.round(val);
//   }

//   if (deduction.formula_key === "nigeria_paye") {
//     return computeNigeriaPAYE(taxableIncome * 12); // annual → monthly
//   }

//   const baseAmount =
//     base === "basic" ? basic : base === "taxable" ? taxableIncome : gross; // default = gross

//   return Math.round((val / 100) * baseAmount);
// }

// // ══════════════════════════════════════════════════════════════
// // seedDefaultDeductions(companyId, client)
// //
// // Called once when a new company registers.
// // Seeds Nigerian statutory deductions as is_active = true,
// // but HR can toggle any of them off.
// // ══════════════════════════════════════════════════════════════
// export async function seedDefaultDeductions(companyId, client) {
//   const defaults = [
//     {
//       name: "PAYE (Personal Income Tax)",
//       category: "tax",
//       type: "formula",
//       value: null,
//       formula_key: "nigeria_paye",
//       calculation_base: "taxable",
//       is_statutory: true,
//       is_active: true,
//     },
//     {
//       name: "Employee Pension (8%)",
//       category: "pension",
//       type: "percentage",
//       value: 8.0,
//       formula_key: null,
//       calculation_base: "basic",
//       is_statutory: true,
//       is_active: true,
//     },
//     {
//       name: "NHF (2.5%)",
//       category: "housing",
//       type: "percentage",
//       value: 2.5,
//       formula_key: null,
//       calculation_base: "basic",
//       is_statutory: true,
//       is_active: true,
//     },
//     {
//       name: "NHIS (1.75%)",
//       category: "health",
//       type: "percentage",
//       value: 1.75,
//       formula_key: null,
//       calculation_base: "basic",
//       is_statutory: true,
//       is_active: true,
//     },
//   ];

//   for (const d of defaults) {
//     await client.query(
//       `INSERT INTO payroll_deductions
//          (company_id, name, category, type, value, formula_key,
//           calculation_base, is_statutory, is_active, applies_to_all)
//        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true)
//        ON CONFLICT (company_id, name) DO NOTHING`,
//       [
//         companyId,
//         d.name,
//         d.category,
//         d.type,
//         d.value,
//         d.formula_key,
//         d.calculation_base,
//         d.is_statutory,
//         d.is_active,
//       ],
//     );
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // seedDefaultStructure(companyId, client)
// //
// // Seeds a default payroll structure for the company.
// // ══════════════════════════════════════════════════════════════
// export async function seedDefaultStructure(companyId, client) {
//   await client.query(
//     `INSERT INTO payroll_structures
//        (company_id, name, basic_percent, housing_percent,
//         transport_percent, utility_percent, meal_percent, is_active)
//      VALUES ($1,'Standard Structure',60,20,10,5,5,true)
//      ON CONFLICT (company_id, name) DO NOTHING`,
//     [companyId],
//   );
// }

// // ══════════════════════════════════════════════════════════════
// // calculatePayslip(employeeId, companyId, month, year, overrides?)
// //
// // Core calculation. Returns a full payslip object.
// // overrides: { overtime?, bonus?, extraEarnings?, skipDeductions? }
// // ══════════════════════════════════════════════════════════════
// export async function calculatePayslip(
//   employeeId,
//   companyId,
//   month,
//   year,
//   overrides = {},
// ) {
//   // ── 1. Load employee + salary ──────────────────────────────
//   const empResult = await db.query(
//     `SELECT
//        e.id, e.basic_salary, e.department_id, e.job_role_id,
//        e.first_name, e.last_name, e.employee_code,
//        d.name AS department_name,
//        jr.title AS job_role_name
//      FROM employees e
//      LEFT JOIN departments d  ON d.id = e.department_id
//      LEFT JOIN job_roles   jr ON jr.id = e.job_role_id
//      WHERE e.id = $1 AND e.company_id = $2 AND e.employment_status = 'active'`,
//     [employeeId, companyId],
//   );

//   if (empResult.rowCount === 0) {
//     throw new Error(`Employee ${employeeId} not found or not active.`);
//   }

//   const emp = empResult.rows[0];
//   const grossSalary = Number(emp.basic_salary) || 0;

//   if (grossSalary <= 0) {
//     throw new Error(`Employee ${emp.first_name} has no salary configured.`);
//   }

//   // ── 2. Load active structure ───────────────────────────────
//   const structResult = await db.query(
//     `SELECT * FROM payroll_structures
//      WHERE company_id = $1 AND is_active = true
//      ORDER BY created_at ASC LIMIT 1`,
//     [companyId],
//   );

//   const struct = structResult.rows[0] ?? {
//     basic_percent: 60,
//     housing_percent: 20,
//     transport_percent: 10,
//     utility_percent: 5,
//     meal_percent: 5,
//   };

//   // ── 3. Compute earnings from structure ────────────────────
//   const basic = Math.round((grossSalary * Number(struct.basic_percent)) / 100);
//   const housing = Math.round(
//     (grossSalary * Number(struct.housing_percent)) / 100,
//   );
//   const transport = Math.round(
//     (grossSalary * Number(struct.transport_percent)) / 100,
//   );
//   const utility = Math.round(
//     (grossSalary * Number(struct.utility_percent)) / 100,
//   );
//   const meal = Math.round((grossSalary * Number(struct.meal_percent)) / 100);

//   // ── 4. Apply extra earnings ───────────────────────────────
//   const overtime = Math.round(Number(overrides.overtime ?? 0));
//   const bonus = Math.round(Number(overrides.bonus ?? 0));

//   // DB-defined extra earnings (percentage or fixed on top of salary)
//   const earningsResult = await db.query(
//     `SELECT * FROM payroll_earnings
//      WHERE company_id = $1 AND is_active = true`,
//     [companyId],
//   );

//   let otherEarnings = 0;
//   const extraEarningsBreakdown = [];

//   for (const earning of earningsResult.rows) {
//     let amount = 0;
//     if (earning.type === "fixed") {
//       amount = Number(earning.value);
//     } else {
//       const base = earning.calculation_base === "gross" ? grossSalary : basic;
//       amount = Math.round((Number(earning.value) / 100) * base);
//     }
//     otherEarnings += amount;
//     extraEarningsBreakdown.push({ name: earning.name, amount });
//   }

//   const computedGross =
//     basic +
//     housing +
//     transport +
//     utility +
//     meal +
//     overtime +
//     bonus +
//     otherEarnings;

//   // ── 5. Taxable income (gross minus pension employee, NHF) ──
//   // Simplified: taxable = gross − pension_employee − NHF
//   // We compute pension first with a provisional figure, then recalculate.
//   const provisionalPension = Math.round(basic * 0.08);
//   const provisionalNHF = Math.round(basic * 0.025);
//   const cra =
//     Math.max(200_000 / 12, 0.01 * computedGross) + 0.2 * computedGross; // Consolidated Relief Allowance
//   const taxableIncome = Math.max(
//     0,
//     computedGross - provisionalPension - provisionalNHF - cra,
//   );

//   // ── 6. Load all active deductions for this company ────────
//   const deductionResult = await db.query(
//     `SELECT pd.*, ped.override_value, ped.is_active AS emp_override_active
//      FROM payroll_deductions pd
//      LEFT JOIN payroll_employee_deductions ped
//        ON ped.deduction_id = pd.id AND ped.employee_id = $1
//      WHERE pd.company_id = $2
//        AND pd.is_active = true
//        AND (ped.is_active IS NULL OR ped.is_active = true)
//      ORDER BY pd.is_statutory DESC, pd.name ASC`,
//     [employeeId, companyId],
//   );

//   const deductionsBreakdown = [];
//   let totalDeductions = 0;
//   let payeTax = 0;
//   let pensionEmployee = 0;
//   let nhfDeduction = 0;

//   for (const deduction of deductionResult.rows) {
//     const overrideValue = deduction.override_value
//       ? Number(deduction.override_value)
//       : null;

//     const amount = resolveDeductionAmount(deduction, {
//       basic,
//       gross: computedGross,
//       taxableIncome,
//       overrideValue,
//     });

//     if (amount <= 0) continue;

//     deductionsBreakdown.push({
//       id: deduction.id,
//       name: deduction.name,
//       category: deduction.category,
//       type: deduction.type,
//       amount,
//       isStatutory: deduction.is_statutory,
//     });

//     totalDeductions += amount;

//     // Track named deductions for record columns
//     if (deduction.formula_key === "nigeria_paye") payeTax = amount;
//     if (deduction.category === "pension") pensionEmployee = amount;
//     if (deduction.category === "housing") nhfDeduction = amount;
//   }

//   const netSalary = computedGross - totalDeductions;

//   // ── 7. Return full payslip object ─────────────────────────
//   return {
//     employeeId: emp.id,
//     employeeCode: emp.employee_code,
//     firstName: emp.first_name,
//     lastName: emp.last_name,
//     departmentId: emp.department_id,
//     departmentName: emp.department_name,
//     jobRoleName: emp.job_role_name,
//     month,
//     year,
//     period: `${new Date(year, month - 1).toLocaleString("default", { month: "long" })} ${year}`,

//     earnings: {
//       basic,
//       housing,
//       transport,
//       utility,
//       meal,
//       overtime,
//       bonus,
//       otherEarnings,
//       extraEarningsBreakdown,
//     },

//     grossSalary: computedGross,
//     taxableIncome,
//     deductionsBreakdown,
//     totalDeductions,
//     netSalary,
//     payeTax,
//     pensionEmployee,
//     nhfDeduction,
//   };
// }

// // ══════════════════════════════════════════════════════════════
// // runPayrollForEmployee(employeeId, companyId, payrollRunId, month, year, overrides, client)
// // Persists the calculated payslip to payroll_records.
// // ══════════════════════════════════════════════════════════════
// export async function runPayrollForEmployee(
//   employeeId,
//   companyId,
//   payrollRunId,
//   month,
//   year,
//   overrides = {},
//   client,
// ) {
//   const payslip = await calculatePayslip(
//     employeeId,
//     companyId,
//     month,
//     year,
//     overrides,
//   );
//   const db_ = client || db;

//   await db_.query(
//     `INSERT INTO payroll_records
//        (payroll_run_id, company_id, employee_id, department_id, job_role_id,
//         month, year,
//         basic_salary, housing_allowance, transport_allowance,
//         utility_allowance, meal_allowance, overtime, bonus,
//         other_earnings, gross_salary,
//         deductions_breakdown, total_deductions, net_salary,
//         taxable_income, paye_tax, pension_employee, nhf_deduction,
//         status)
//      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,'draft')
//      ON CONFLICT (payroll_run_id, employee_id)
//      DO UPDATE SET
//        basic_salary          = EXCLUDED.basic_salary,
//        housing_allowance     = EXCLUDED.housing_allowance,
//        transport_allowance   = EXCLUDED.transport_allowance,
//        utility_allowance     = EXCLUDED.utility_allowance,
//        meal_allowance        = EXCLUDED.meal_allowance,
//        overtime              = EXCLUDED.overtime,
//        bonus                 = EXCLUDED.bonus,
//        other_earnings        = EXCLUDED.other_earnings,
//        gross_salary          = EXCLUDED.gross_salary,
//        deductions_breakdown  = EXCLUDED.deductions_breakdown,
//        total_deductions      = EXCLUDED.total_deductions,
//        net_salary            = EXCLUDED.net_salary,
//        taxable_income        = EXCLUDED.taxable_income,
//        paye_tax              = EXCLUDED.paye_tax,
//        pension_employee      = EXCLUDED.pension_employee,
//        nhf_deduction         = EXCLUDED.nhf_deduction,
//        updated_at            = NOW()`,
//     [
//       payrollRunId,
//       companyId,
//       employeeId,
//       payslip.departmentId,
//       null, // job_role_id — add if needed
//       month,
//       year,
//       payslip.earnings.basic,
//       payslip.earnings.housing,
//       payslip.earnings.transport,
//       payslip.earnings.utility,
//       payslip.earnings.meal,
//       payslip.earnings.overtime,
//       payslip.earnings.bonus,
//       payslip.earnings.otherEarnings,
//       payslip.grossSalary,
//       JSON.stringify(payslip.deductionsBreakdown),
//       payslip.totalDeductions,
//       payslip.netSalary,
//       payslip.taxableIncome,
//       payslip.payeTax,
//       payslip.pensionEmployee,
//       payslip.nhfDeduction,
//     ],
//   );

//   return payslip;
// }


// src/services/payroll.engine.js
// ─────────────────────────────────────────────────────────────────────────────
// Architecture:
//   • Salary lives on employees.basic_salary — SINGLE SOURCE OF TRUTH.
//   • payroll_structures splits gross into allowance components (percentages).
//   • payroll_deductions holds statutory + custom deductions.
//   • Every optional config defaults to 0 — engine NEVER crashes on missing data.
//
// Nigeria statutory deductions implemented:
//   • PAYE   — graduated tax table (Finance Act 2019 + CRA relief)
//   • Pension — employee 8 %, employer 10 % of gross
//   • NHF    — 2.5 % of basic salary
//
// Functions exported:
//   calculatePayslip()       — pure calculation, no DB write (for preview)
//   runPayrollForEmployee()  — calculates + writes payroll_records row
//   seedDefaultDeductions()  — seeds statutory deductions on company creation
//   seedDefaultStructure()   — seeds default 60/20/10/5/5 structure
// ─────────────────────────────────────────────────────────────────────────────

import { db } from "../config/db.js";

// ── Nigeria PAYE tax table (Finance Act 2019) ──────────────────────────────
// Taxable income = Gross - Pension(employee) - NHF - CRA(20% gross + ₦200k)
// Tax brackets are applied on taxable income annually.
const PAYE_BRACKETS = [
  { limit: 300_000,     rate: 0.07 },
  { limit: 300_000,     rate: 0.11 },
  { limit: 500_000,     rate: 0.15 },
  { limit: 500_000,     rate: 0.19 },
  { limit: 1_600_000,   rate: 0.21 },
  { limit: Infinity,    rate: 0.24 },
];

function calcPayeAnnual(annualTaxable) {
  if (annualTaxable <= 0) return 0;
  let remaining = annualTaxable;
  let tax = 0;
  for (const { limit, rate } of PAYE_BRACKETS) {
    if (remaining <= 0) break;
    const slice = Math.min(remaining, limit);
    tax += slice * rate;
    remaining -= slice;
  }
  return Math.max(0, tax);
}

// ── Fetch employee + company config defensively ────────────────────────────
async function fetchPayrollInputs(employeeId, companyId, dbOrClient) {
  const q = dbOrClient.query.bind(dbOrClient);

  // 1. Employee — salary is the ONLY required field
  const empResult = await q(
    `SELECT
       e.id,
       e.first_name,
       e.last_name,
       e.employee_code,
       e.basic_salary,
       e.housing_allowance,
       e.transport_allowance,
       e.medical_allowance,
       e.other_allowances,
       e.bank_name,
       e.account_number,
       e.account_name,
       e.employment_type,
       e.department_id,
       e.job_role_id,
       d.name  AS department_name,
       jr.title AS job_role_name
     FROM employees e
     LEFT JOIN departments d  ON d.id  = e.department_id
     LEFT JOIN job_roles   jr ON jr.id = e.job_role_id
     WHERE e.id = $1 AND e.company_id = $2`,
    [employeeId, companyId],
  );

  if (empResult.rowCount === 0) {
    throw new Error(`Employee ${employeeId} not found in company ${companyId}.`);
  }
  const emp = empResult.rows[0];

  // 2. Active payroll structure (optional — defaults to 60/20/10/5/5)
  const structResult = await q(
    `SELECT * FROM payroll_structures
     WHERE company_id = $1 AND is_active = true
     ORDER BY created_at DESC LIMIT 1`,
    [companyId],
  );
  const struct = structResult.rows[0] ?? null;

  // 3. Active deductions (optional — defaults to 0 each)
  const dedResult = await q(
    `SELECT * FROM payroll_deductions
     WHERE company_id = $1 AND is_active = true
     ORDER BY is_statutory DESC, name ASC`,
    [companyId],
  );
  const deductions = dedResult.rows ?? [];

  return { emp, struct, deductions };
}

// ── Core payslip calculation (pure, no DB writes) ──────────────────────────
async function calculatePayslip(
  employeeId,
  companyId,
  month,
  year,
  overrides = {},
  dbOrClient = db,
) {
  const { emp, struct, deductions } = await fetchPayrollInputs(
    employeeId,
    companyId,
    dbOrClient,
  );

  // ── 1. Gross Salary ───────────────────────────────────────────────────────
  // Salary lives on employees table. If missing, treat as 0 (HR data issue,
  // not an engine crash). Each allowance can be stored directly on the
  // employee OR split via the payroll structure.

  const basicSalary = Number(emp.basic_salary ?? 0);

  let housingAllowance;
  let transportAllowance;
  let utilityAllowance;
  let mealAllowance;

  // If allowances are stored directly on employee (preferred), use them.
  // Otherwise derive from payroll structure percentages.
  if (
    emp.housing_allowance != null ||
    emp.transport_allowance != null
  ) {
    housingAllowance   = Number(emp.housing_allowance   ?? 0);
    transportAllowance = Number(emp.transport_allowance ?? 0);
    utilityAllowance   = 0; // not a standard employee column — put in medical
    mealAllowance      = 0;
  } else if (struct) {
    // Structure percentages apply to the total gross (basic is the percentage base)
    // Total gross = basic / (basic_percent / 100)
    const grossBase = basicSalary > 0
      ? basicSalary / ((Number(struct.basic_percent) || 60) / 100)
      : 0;
    housingAllowance   = grossBase * (Number(struct.housing_percent)   || 0) / 100;
    transportAllowance = grossBase * (Number(struct.transport_percent) || 0) / 100;
    utilityAllowance   = grossBase * (Number(struct.utility_percent)   || 0) / 100;
    mealAllowance      = grossBase * (Number(struct.meal_percent)      || 0) / 100;
  } else {
    // No structure, no allowance columns — sensible Nigeria defaults
    // Housing 20%, Transport 10% of basic
    housingAllowance   = basicSalary * 0.20;
    transportAllowance = basicSalary * 0.10;
    utilityAllowance   = 0;
    mealAllowance      = 0;
  }

  const medicalAllowance  = Number(emp.medical_allowance  ?? 0);
  const otherAllowances   = Number(emp.other_allowances   ?? 0);
  const overtime          = Number(overrides.overtime     ?? 0);
  const bonus             = Number(overrides.bonus        ?? 0);

  const grossSalary =
    basicSalary +
    housingAllowance +
    transportAllowance +
    utilityAllowance +
    mealAllowance +
    medicalAllowance +
    otherAllowances +
    overtime +
    bonus;

  // ── 2. Statutory deductions ───────────────────────────────────────────────
  // Pension employee: 8% of gross
  const pensionEmployee = grossSalary * 0.08;

  // NHF: 2.5% of basic salary (not gross)
  const nhfDeduction = basicSalary * 0.025;

  // ── 3. PAYE ───────────────────────────────────────────────────────────────
  // CRA = higher of ₦200,000 or 20% of gross (monthly → annualise)
  const annualGross       = grossSalary * 12;
  const annualPension     = pensionEmployee * 12;
  const annualNhf         = nhfDeduction * 12;
  const cra               = Math.max(200_000, annualGross * 0.20);
  const annualTaxable     = Math.max(0, annualGross - annualPension - annualNhf - cra);
  const annualPaye        = calcPayeAnnual(annualTaxable);
  const payeTax           = annualPaye / 12; // monthly PAYE

  // ── 4. Custom deductions ─────────────────────────────────────────────────
  // Statutory ones (paye, pension, nhf) handled above.
  // Custom flat/percent deductions from payroll_deductions table.
  let customDeductionsTotal = 0;
  const deductionsBreakdown = {};

  for (const ded of deductions) {
    // Skip if this is a handled statutory type (we already computed above)
    if (ded.formula_key === "paye" || ded.formula_key === "pension_employee" || ded.formula_key === "nhf") {
      continue;
    }

    let amount = 0;
    const base = ded.calculation_base === "basic" ? basicSalary : grossSalary;

    if (ded.type === "flat") {
      amount = Number(ded.value ?? 0);
    } else if (ded.type === "percent") {
      amount = base * (Number(ded.value ?? 0) / 100);
    } else if (ded.type === "formula") {
      // Formula deductions are handled statut-side — skip here
      continue;
    }

    if (amount > 0) {
      customDeductionsTotal += amount;
      deductionsBreakdown[ded.name] = amount;
    }
  }

  const totalDeductions = pensionEmployee + nhfDeduction + payeTax + customDeductionsTotal;
  const netSalary = Math.max(0, grossSalary - totalDeductions);

  // ── Taxable income (informational) ────────────────────────────────────────
  const taxableIncome = Math.max(0, grossSalary - pensionEmployee - nhfDeduction);

  return {
    // Employee info
    employeeId,
    employeeName:   `${emp.first_name} ${emp.last_name}`,
    employeeCode:   emp.employee_code,
    departmentName: emp.department_name,
    jobRoleName:    emp.job_role_name,
    bankName:       emp.bank_name,
    accountNumber:  emp.account_number,
    accountName:    emp.account_name,

    // Earnings
    basicSalary,
    housingAllowance,
    transportAllowance,
    utilityAllowance,
    mealAllowance,
    medicalAllowance,
    otherAllowances,
    overtime,
    bonus,
    grossSalary,

    // Deductions
    pensionEmployee,
    nhfDeduction,
    payeTax,
    otherDeductions:    customDeductionsTotal,
    deductionsBreakdown,
    totalDeductions,

    // Net
    taxableIncome,
    netSalary,

    // Metadata
    month,
    year,
    companyId,
  };
}

// ── Write payslip to DB (used during payroll run) ─────────────────────────
async function runPayrollForEmployee(
  employeeId,
  companyId,
  payrollRunId,
  month,
  year,
  overrides = {},
  dbOrClient = db,
) {
  const payslip = await calculatePayslip(
    employeeId,
    companyId,
    month,
    year,
    overrides,
    dbOrClient,
  );

  const q = dbOrClient.query.bind(dbOrClient);

  // Upsert payroll_records — if re-running the same employee, update.
  const result = await q(
    `INSERT INTO payroll_records (
       company_id, payroll_run_id, employee_id,
       month, year,
       basic_salary, housing_allowance, transport_allowance,
       utility_allowance, meal_allowance,
       medical_allowance, other_allowances,
       overtime, bonus,
       gross_salary,
       pension_employee, nhf_deduction, paye_tax,
       other_deductions, deductions_breakdown,
       total_deductions, taxable_income, net_salary,
       status, created_at, updated_at
     )
     VALUES (
       $1,  $2,  $3,
       $4,  $5,
       $6,  $7,  $8,
       $9,  $10,
       $11, $12,
       $13, $14,
       $15,
       $16, $17, $18,
       $19, $20,
       $21, $22, $23,
       'draft', NOW(), NOW()
     )
     ON CONFLICT (payroll_run_id, employee_id)
     DO UPDATE SET
       basic_salary          = EXCLUDED.basic_salary,
       housing_allowance     = EXCLUDED.housing_allowance,
       transport_allowance   = EXCLUDED.transport_allowance,
       utility_allowance     = EXCLUDED.utility_allowance,
       meal_allowance        = EXCLUDED.meal_allowance,
       medical_allowance     = EXCLUDED.medical_allowance,
       other_allowances      = EXCLUDED.other_allowances,
       overtime              = EXCLUDED.overtime,
       bonus                 = EXCLUDED.bonus,
       gross_salary          = EXCLUDED.gross_salary,
       pension_employee      = EXCLUDED.pension_employee,
       nhf_deduction         = EXCLUDED.nhf_deduction,
       paye_tax              = EXCLUDED.paye_tax,
       other_deductions      = EXCLUDED.other_deductions,
       deductions_breakdown  = EXCLUDED.deductions_breakdown,
       total_deductions      = EXCLUDED.total_deductions,
       taxable_income        = EXCLUDED.taxable_income,
       net_salary            = EXCLUDED.net_salary,
       updated_at            = NOW()
     RETURNING *`,
    [
      companyId,
      payrollRunId,
      employeeId,
      month,
      year,
      payslip.basicSalary,
      payslip.housingAllowance,
      payslip.transportAllowance,
      payslip.utilityAllowance,
      payslip.mealAllowance,
      payslip.medicalAllowance,
      payslip.otherAllowances,
      payslip.overtime,
      payslip.bonus,
      payslip.grossSalary,
      payslip.pensionEmployee,
      payslip.nhfDeduction,
      payslip.payeTax,
      payslip.otherDeductions,
      JSON.stringify(payslip.deductionsBreakdown),
      payslip.totalDeductions,
      payslip.taxableIncome,
      payslip.netSalary,
    ],
  );

  return {
    ...payslip,
    id: result.rows[0]?.id,
  };
}

// ── Seed helpers ──────────────────────────────────────────────────────────
async function seedDefaultStructure(companyId, dbOrClient = db) {
  const q = dbOrClient.query.bind(dbOrClient);
  const existing = await q(
    "SELECT id FROM payroll_structures WHERE company_id = $1 LIMIT 1",
    [companyId],
  );
  if (existing.rowCount > 0) return; // already seeded

  await q(
    `INSERT INTO payroll_structures
       (company_id, name, basic_percent, housing_percent, transport_percent,
        utility_percent, meal_percent, is_active)
     VALUES ($1, 'Standard', 60, 20, 10, 5, 5, true)`,
    [companyId],
  );
}

async function seedDefaultDeductions(companyId, dbOrClient = db) {
  const q = dbOrClient.query.bind(dbOrClient);
  const existing = await q(
    "SELECT id FROM payroll_deductions WHERE company_id = $1 AND is_statutory = true LIMIT 1",
    [companyId],
  );
  if (existing.rowCount > 0) return; // already seeded

  const statutory = [
    {
      name: "PAYE Tax",
      category: "tax",
      type: "formula",
      formulaKey: "paye",
      calculationBase: "gross",
    },
    {
      name: "Pension (Employee 8%)",
      category: "pension",
      type: "percent",
      value: 8,
      formulaKey: "pension_employee",
      calculationBase: "gross",
    },
    {
      name: "NHF (2.5%)",
      category: "nhf",
      type: "percent",
      value: 2.5,
      formulaKey: "nhf",
      calculationBase: "basic",
    },
  ];

  for (const d of statutory) {
    await q(
      `INSERT INTO payroll_deductions
         (company_id, name, category, type, value, formula_key,
          calculation_base, is_statutory, is_active, applies_to_all)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, true, true)
       ON CONFLICT DO NOTHING`,
      [
        companyId,
        d.name,
        d.category,
        d.type,
        d.value ?? null,
        d.formulaKey ?? null,
        d.calculationBase,
      ],
    );
  }
}

export {
  calculatePayslip,
  runPayrollForEmployee,
  seedDefaultDeductions,
  seedDefaultStructure,
};