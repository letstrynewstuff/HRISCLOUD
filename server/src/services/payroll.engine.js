

// // src/services/payroll.engine.js
// // ─────────────────────────────────────────────────────────────────────────────
// // Architecture:
// //   • Salary lives on employees.basic_salary — SINGLE SOURCE OF TRUTH.
// //   • payroll_structures splits gross into allowance components (percentages).
// //   • payroll_deductions holds statutory + custom deductions.
// //   • Every optional config defaults to 0 — engine NEVER crashes on missing data.
// //
// // Nigeria statutory deductions implemented:
// //   • PAYE   — graduated tax table (Finance Act 2019 + CRA relief)
// //   • Pension — employee 8 %, employer 10 % of gross
// //   • NHF    — 2.5 % of basic salary
// //
// // Functions exported:
// //   calculatePayslip()       — pure calculation, no DB write (for preview)
// //   runPayrollForEmployee()  — calculates + writes payroll_records row
// //   seedDefaultDeductions()  — seeds statutory deductions on company creation
// //   seedDefaultStructure()   — seeds default 60/20/10/5/5 structure
// // ─────────────────────────────────────────────────────────────────────────────

// import { db } from "../config/db.js";

// // ── Nigeria PAYE tax table (Finance Act 2019) ──────────────────────────────
// // Taxable income = Gross - Pension(employee) - NHF - CRA(20% gross + ₦200k)
// // Tax brackets are applied on taxable income annually.
// const PAYE_BRACKETS = [
//   { limit: 300_000,     rate: 0.07 },
//   { limit: 300_000,     rate: 0.11 },
//   { limit: 500_000,     rate: 0.15 },
//   { limit: 500_000,     rate: 0.19 },
//   { limit: 1_600_000,   rate: 0.21 },
//   { limit: Infinity,    rate: 0.24 },
// ];

// function calcPayeAnnual(annualTaxable) {
//   if (annualTaxable <= 0) return 0;
//   let remaining = annualTaxable;
//   let tax = 0;
//   for (const { limit, rate } of PAYE_BRACKETS) {
//     if (remaining <= 0) break;
//     const slice = Math.min(remaining, limit);
//     tax += slice * rate;
//     remaining -= slice;
//   }
//   return Math.max(0, tax);
// }

// // ── Fetch employee + company config defensively ────────────────────────────
// async function fetchPayrollInputs(employeeId, companyId, dbOrClient) {
//   const q = dbOrClient.query.bind(dbOrClient);

//   // 1. Employee — salary is the ONLY required field
//   const empResult = await q(
//     `SELECT
//        e.id,
//        e.first_name,
//        e.last_name,
//        e.employee_code,
//        e.basic_salary,
//        e.housing_allowance,
//        e.transport_allowance,
//        e.medical_allowance,
//        e.other_allowances,
//        e.bank_name,
//        e.account_number,
//        e.account_name,
//        e.employment_type,
//        e.department_id,
//        e.job_role_id,
//        d.name  AS department_name,
//        jr.title AS job_role_name
//      FROM employees e
//      LEFT JOIN departments d  ON d.id  = e.department_id
//      LEFT JOIN job_roles   jr ON jr.id = e.job_role_id
//      WHERE e.id = $1 AND e.company_id = $2`,
//     [employeeId, companyId],
//   );

//   if (empResult.rowCount === 0) {
//     throw new Error(`Employee ${employeeId} not found in company ${companyId}.`);
//   }
//   const emp = empResult.rows[0];

//   // 2. Active payroll structure (optional — defaults to 60/20/10/5/5)
//   const structResult = await q(
//     `SELECT * FROM payroll_structures
//      WHERE company_id = $1 AND is_active = true
//      ORDER BY created_at DESC LIMIT 1`,
//     [companyId],
//   );
//   const struct = structResult.rows[0] ?? null;

//   // 3. Active deductions (optional — defaults to 0 each)
//   const dedResult = await q(
//     `SELECT * FROM payroll_deductions
//      WHERE company_id = $1 AND is_active = true
//      ORDER BY is_statutory DESC, name ASC`,
//     [companyId],
//   );
//   const deductions = dedResult.rows ?? [];

//   return { emp, struct, deductions };
// }

// // ── Core payslip calculation (pure, no DB writes) ──────────────────────────
// async function calculatePayslip(
//   employeeId,
//   companyId,
//   month,
//   year,
//   overrides = {},
//   dbOrClient = db,
// ) {
//   const { emp, struct, deductions } = await fetchPayrollInputs(
//     employeeId,
//     companyId,
//     dbOrClient,
//   );

//   // ── 1. Gross Salary ───────────────────────────────────────────────────────
//   // Salary lives on employees table. If missing, treat as 0 (HR data issue,
//   // not an engine crash). Each allowance can be stored directly on the
//   // employee OR split via the payroll structure.

//   const basicSalary = Number(emp.basic_salary ?? 0);

//   let housingAllowance;
//   let transportAllowance;
//   let utilityAllowance;
//   let mealAllowance;

//   // If allowances are stored directly on employee (preferred), use them.
//   // Otherwise derive from payroll structure percentages.
//   if (
//     emp.housing_allowance != null ||
//     emp.transport_allowance != null
//   ) {
//     housingAllowance   = Number(emp.housing_allowance   ?? 0);
//     transportAllowance = Number(emp.transport_allowance ?? 0);
//     utilityAllowance   = 0; // not a standard employee column — put in medical
//     mealAllowance      = 0;
//   } else if (struct) {
//     // Structure percentages apply to the total gross (basic is the percentage base)
//     // Total gross = basic / (basic_percent / 100)
//     const grossBase = basicSalary > 0
//       ? basicSalary / ((Number(struct.basic_percent) || 60) / 100)
//       : 0;
//     housingAllowance   = grossBase * (Number(struct.housing_percent)   || 0) / 100;
//     transportAllowance = grossBase * (Number(struct.transport_percent) || 0) / 100;
//     utilityAllowance   = grossBase * (Number(struct.utility_percent)   || 0) / 100;
//     mealAllowance      = grossBase * (Number(struct.meal_percent)      || 0) / 100;
//   } else {
//     // No structure, no allowance columns — sensible Nigeria defaults
//     // Housing 20%, Transport 10% of basic
//     housingAllowance   = basicSalary * 0.20;
//     transportAllowance = basicSalary * 0.10;
//     utilityAllowance   = 0;
//     mealAllowance      = 0;
//   }

//   const medicalAllowance  = Number(emp.medical_allowance  ?? 0);
//   const otherAllowances   = Number(emp.other_allowances   ?? 0);
//   const overtime          = Number(overrides.overtime     ?? 0);
//   const bonus             = Number(overrides.bonus        ?? 0);

//   const grossSalary =
//     basicSalary +
//     housingAllowance +
//     transportAllowance +
//     utilityAllowance +
//     mealAllowance +
//     medicalAllowance +
//     otherAllowances +
//     overtime +
//     bonus;

//   // ── 2. Statutory deductions ───────────────────────────────────────────────
//   // Pension employee: 8% of gross
//   const pensionEmployee = grossSalary * 0.08;

//   // NHF: 2.5% of basic salary (not gross)
//   const nhfDeduction = basicSalary * 0.025;

//   // ── 3. PAYE ───────────────────────────────────────────────────────────────
//   // CRA = higher of ₦200,000 or 20% of gross (monthly → annualise)
//   const annualGross       = grossSalary * 12;
//   const annualPension     = pensionEmployee * 12;
//   const annualNhf         = nhfDeduction * 12;
//   const cra               = Math.max(200_000, annualGross * 0.20);
//   const annualTaxable     = Math.max(0, annualGross - annualPension - annualNhf - cra);
//   const annualPaye        = calcPayeAnnual(annualTaxable);
//   const payeTax           = annualPaye / 12; // monthly PAYE

//   // ── 4. Custom deductions ─────────────────────────────────────────────────
//   // Statutory ones (paye, pension, nhf) handled above.
//   // Custom flat/percent deductions from payroll_deductions table.
//   let customDeductionsTotal = 0;
//   const deductionsBreakdown = {};

//   for (const ded of deductions) {
//     // Skip if this is a handled statutory type (we already computed above)
//     if (ded.formula_key === "paye" || ded.formula_key === "pension_employee" || ded.formula_key === "nhf") {
//       continue;
//     }

//     let amount = 0;
//     const base = ded.calculation_base === "basic" ? basicSalary : grossSalary;

//     if (ded.type === "flat") {
//       amount = Number(ded.value ?? 0);
//     } else if (ded.type === "percent") {
//       amount = base * (Number(ded.value ?? 0) / 100);
//     } else if (ded.type === "formula") {
//       // Formula deductions are handled statut-side — skip here
//       continue;
//     }

//     if (amount > 0) {
//       customDeductionsTotal += amount;
//       deductionsBreakdown[ded.name] = amount;
//     }
//   }

//   const totalDeductions = pensionEmployee + nhfDeduction + payeTax + customDeductionsTotal;
//   const netSalary = Math.max(0, grossSalary - totalDeductions);

//   // ── Taxable income (informational) ────────────────────────────────────────
//   const taxableIncome = Math.max(0, grossSalary - pensionEmployee - nhfDeduction);

//   return {
//     // Employee info
//     employeeId,
//     employeeName:   `${emp.first_name} ${emp.last_name}`,
//     employeeCode:   emp.employee_code,
//     departmentName: emp.department_name,
//     jobRoleName:    emp.job_role_name,
//     bankName:       emp.bank_name,
//     accountNumber:  emp.account_number,
//     accountName:    emp.account_name,

//     // Earnings
//     basicSalary,
//     housingAllowance,
//     transportAllowance,
//     utilityAllowance,
//     mealAllowance,
//     medicalAllowance,
//     otherAllowances,
//     overtime,
//     bonus,
//     grossSalary,

//     // Deductions
//     pensionEmployee,
//     nhfDeduction,
//     payeTax,
//     otherDeductions:    customDeductionsTotal,
//     deductionsBreakdown,
//     totalDeductions,

//     // Net
//     taxableIncome,
//     netSalary,

//     // Metadata
//     month,
//     year,
//     companyId,
//   };
// }

// // ── Write payslip to DB (used during payroll run) ─────────────────────────
// async function runPayrollForEmployee(
//   employeeId,
//   companyId,
//   payrollRunId,
//   month,
//   year,
//   overrides = {},
//   dbOrClient = db,
// ) {
//   const payslip = await calculatePayslip(
//     employeeId,
//     companyId,
//     month,
//     year,
//     overrides,
//     dbOrClient,
//   );

//   const q = dbOrClient.query.bind(dbOrClient);

//   // Upsert payroll_records — if re-running the same employee, update.
//   const result = await q(
//     `INSERT INTO payroll_records (
//        company_id, payroll_run_id, employee_id,
//        month, year,
//        basic_salary, housing_allowance, transport_allowance,
//        utility_allowance, meal_allowance,
//        medical_allowance, other_allowances,
//        overtime, bonus,
//        gross_salary,
//        pension_employee, nhf_deduction, paye_tax,
//        other_deductions, deductions_breakdown,
//        total_deductions, taxable_income, net_salary,
//        status, created_at, updated_at
//      )
//      VALUES (
//        $1,  $2,  $3,
//        $4,  $5,
//        $6,  $7,  $8,
//        $9,  $10,
//        $11, $12,
//        $13, $14,
//        $15,
//        $16, $17, $18,
//        $19, $20,
//        $21, $22, $23,
//        'draft', NOW(), NOW()
//      )
//      ON CONFLICT (payroll_run_id, employee_id)
//      DO UPDATE SET
//        basic_salary          = EXCLUDED.basic_salary,
//        housing_allowance     = EXCLUDED.housing_allowance,
//        transport_allowance   = EXCLUDED.transport_allowance,
//        utility_allowance     = EXCLUDED.utility_allowance,
//        meal_allowance        = EXCLUDED.meal_allowance,
//        medical_allowance     = EXCLUDED.medical_allowance,
//        other_allowances      = EXCLUDED.other_allowances,
//        overtime              = EXCLUDED.overtime,
//        bonus                 = EXCLUDED.bonus,
//        gross_salary          = EXCLUDED.gross_salary,
//        pension_employee      = EXCLUDED.pension_employee,
//        nhf_deduction         = EXCLUDED.nhf_deduction,
//        paye_tax              = EXCLUDED.paye_tax,
//        other_deductions      = EXCLUDED.other_deductions,
//        deductions_breakdown  = EXCLUDED.deductions_breakdown,
//        total_deductions      = EXCLUDED.total_deductions,
//        taxable_income        = EXCLUDED.taxable_income,
//        net_salary            = EXCLUDED.net_salary,
//        updated_at            = NOW()
//      RETURNING *`,
//     [
//       companyId,
//       payrollRunId,
//       employeeId,
//       month,
//       year,
//       payslip.basicSalary,
//       payslip.housingAllowance,
//       payslip.transportAllowance,
//       payslip.utilityAllowance,
//       payslip.mealAllowance,
//       payslip.medicalAllowance,
//       payslip.otherAllowances,
//       payslip.overtime,
//       payslip.bonus,
//       payslip.grossSalary,
//       payslip.pensionEmployee,
//       payslip.nhfDeduction,
//       payslip.payeTax,
//       payslip.otherDeductions,
//       JSON.stringify(payslip.deductionsBreakdown),
//       payslip.totalDeductions,
//       payslip.taxableIncome,
//       payslip.netSalary,
//     ],
//   );

//   return {
//     ...payslip,
//     id: result.rows[0]?.id,
//   };
// }

// // ── Seed helpers ──────────────────────────────────────────────────────────
// async function seedDefaultStructure(companyId, dbOrClient = db) {
//   const q = dbOrClient.query.bind(dbOrClient);
//   const existing = await q(
//     "SELECT id FROM payroll_structures WHERE company_id = $1 LIMIT 1",
//     [companyId],
//   );
//   if (existing.rowCount > 0) return; // already seeded

//   await q(
//     `INSERT INTO payroll_structures
//        (company_id, name, basic_percent, housing_percent, transport_percent,
//         utility_percent, meal_percent, is_active)
//      VALUES ($1, 'Standard', 60, 20, 10, 5, 5, true)`,
//     [companyId],
//   );
// }

// async function seedDefaultDeductions(companyId, dbOrClient = db) {
//   const q = dbOrClient.query.bind(dbOrClient);
//   const existing = await q(
//     "SELECT id FROM payroll_deductions WHERE company_id = $1 AND is_statutory = true LIMIT 1",
//     [companyId],
//   );
//   if (existing.rowCount > 0) return; // already seeded

//   const statutory = [
//     {
//       name: "PAYE Tax",
//       category: "tax",
//       type: "formula",
//       formulaKey: "paye",
//       calculationBase: "gross",
//     },
//     {
//       name: "Pension (Employee 8%)",
//       category: "pension",
//       type: "percent",
//       value: 8,
//       formulaKey: "pension_employee",
//       calculationBase: "gross",
//     },
//     {
//       name: "NHF (2.5%)",
//       category: "nhf",
//       type: "percent",
//       value: 2.5,
//       formulaKey: "nhf",
//       calculationBase: "basic",
//     },
//   ];

//   for (const d of statutory) {
//     await q(
//       `INSERT INTO payroll_deductions
//          (company_id, name, category, type, value, formula_key,
//           calculation_base, is_statutory, is_active, applies_to_all)
//        VALUES ($1, $2, $3, $4, $5, $6, $7, true, true, true)
//        ON CONFLICT DO NOTHING`,
//       [
//         companyId,
//         d.name,
//         d.category,
//         d.type,
//         d.value ?? null,
//         d.formulaKey ?? null,
//         d.calculationBase,
//       ],
//     );
//   }
// }

// export {
//   calculatePayslip,
//   runPayrollForEmployee,
//   seedDefaultDeductions,
//   seedDefaultStructure,
// };


// // src/services/payroll.engine.js
// // ─────────────────────────────────────────────────────────────────────────────
// // Architecture:
// //   • Salary lives on employees.basic_salary — SINGLE SOURCE OF TRUTH.
// //   • payroll_structures splits gross into allowance components (percentages).
// //   • payroll_deductions holds statutory + custom deductions.
// //   • Every optional config defaults to 0 — engine NEVER crashes on missing data.
// //
// // Nigeria statutory deductions implemented:
// //   • PAYE   — graduated tax table (Finance Act 2019 + CRA relief)
// //   • Pension — employee 8 %, employer 10 % of gross
// //   • NHF    — 2.5 % of basic salary
// //
// // Functions exported:
// //   calculatePayslip()       — pure calculation, no DB write (for preview)
// //   runPayrollForEmployee()  — calculates + writes payroll_records row
// //   seedDefaultDeductions()  — seeds statutory deductions on company creation
// //   seedDefaultStructure()   — seeds default 60/20/10/5/5 structure
// // ─────────────────────────────────────────────────────────────────────────────

// import { db } from "../config/db.js";

// // ── Nigeria PAYE tax table (Finance Act 2019) ──────────────────────────────
// const PAYE_BRACKETS = [
//   { limit: 300_000,   rate: 0.07 },
//   { limit: 300_000,   rate: 0.11 },
//   { limit: 500_000,   rate: 0.15 },
//   { limit: 500_000,   rate: 0.19 },
//   { limit: 1_600_000, rate: 0.21 },
//   { limit: Infinity,  rate: 0.24 },
// ];

// function calcPayeAnnual(annualTaxable) {
//   if (annualTaxable <= 0) return 0;
//   let remaining = annualTaxable;
//   let tax = 0;
//   for (const { limit, rate } of PAYE_BRACKETS) {
//     if (remaining <= 0) break;
//     const slice = Math.min(remaining, limit);
//     tax += slice * rate;
//     remaining -= slice;
//   }
//   return Math.max(0, tax);
// }

// // ── Fetch employee + company config defensively ────────────────────────────
// async function fetchPayrollInputs(employeeId, companyId, dbOrClient) {
//   const q = dbOrClient.query.bind(dbOrClient);

//   // FIX: Only select columns that actually exist on the employees table.
//   // housing_allowance, transport_allowance, medical_allowance, other_allowances
//   // do NOT exist — allowances are derived from payroll_structures instead.
//   const empResult = await q(
//     `SELECT
//        e.id,
//        e.first_name,
//        e.last_name,
//        e.employee_code,
//        e.basic_salary,
//        e.bank_name,
//        e.account_number,
//        e.account_name,
//        e.employment_type,
//        e.department_id,
//        e.job_role_id,
//        d.name   AS department_name,
//        jr.title AS job_role_name
//      FROM employees e
//      LEFT JOIN departments d  ON d.id  = e.department_id
//      LEFT JOIN job_roles   jr ON jr.id = e.job_role_id
//      WHERE e.id = $1 AND e.company_id = $2`,
//     [employeeId, companyId],
//   );

//   if (empResult.rowCount === 0) {
//     throw new Error(`Employee ${employeeId} not found in company ${companyId}.`);
//   }
//   const emp = empResult.rows[0];

//   // Active payroll structure (optional — defaults to 60/20/10/5/5)
//   const structResult = await q(
//     `SELECT * FROM payroll_structures
//      WHERE company_id = $1 AND is_active = true
//      ORDER BY created_at DESC LIMIT 1`,
//     [companyId],
//   );
//   const struct = structResult.rows[0] ?? null;

//   // Active deductions (optional — defaults to 0 each)
//   const dedResult = await q(
//     `SELECT * FROM payroll_deductions
//      WHERE company_id = $1 AND is_active = true
//      ORDER BY is_statutory DESC, name ASC`,
//     [companyId],
//   );
//   const deductions = dedResult.rows ?? [];

//   return { emp, struct, deductions };
// }

// // ── Core payslip calculation (pure, no DB writes) ──────────────────────────
// async function calculatePayslip(
//   employeeId,
//   companyId,
//   month,
//   year,
//   overrides = {},
//   dbOrClient = db,
// ) {
//   const { emp, struct, deductions } = await fetchPayrollInputs(
//     employeeId,
//     companyId,
//     dbOrClient,
//   );

//   // ── 1. Gross Salary ───────────────────────────────────────────────────────
//   // Allowance columns don't exist on employees — always derive from structure.
//   const basicSalary = Number(emp.basic_salary ?? 0);

//   let housingAllowance;
//   let transportAllowance;
//   let utilityAllowance;
//   let mealAllowance;

//   if (struct) {
//     // Derive allowances from payroll structure percentages
//     // Total gross = basic / (basic_percent / 100)
//     const grossBase = basicSalary > 0
//       ? basicSalary / ((Number(struct.basic_percent) || 60) / 100)
//       : 0;
//     housingAllowance   = grossBase * (Number(struct.housing_percent)   || 0) / 100;
//     transportAllowance = grossBase * (Number(struct.transport_percent) || 0) / 100;
//     utilityAllowance   = grossBase * (Number(struct.utility_percent)   || 0) / 100;
//     mealAllowance      = grossBase * (Number(struct.meal_percent)      || 0) / 100;
//   } else {
//     // No structure — Nigeria sensible defaults: Housing 20%, Transport 10%
//     housingAllowance   = basicSalary * 0.20;
//     transportAllowance = basicSalary * 0.10;
//     utilityAllowance   = 0;
//     mealAllowance      = 0;
//   }

//   // These allowance columns don't exist on employees either — default to 0
//   const medicalAllowance = 0;
//   const otherAllowances  = 0;
//   const overtime         = Number(overrides.overtime ?? 0);
//   const bonus            = Number(overrides.bonus    ?? 0);

//   const grossSalary =
//     basicSalary +
//     housingAllowance +
//     transportAllowance +
//     utilityAllowance +
//     mealAllowance +
//     medicalAllowance +
//     otherAllowances +
//     overtime +
//     bonus;

//   // ── 2. Statutory deductions ───────────────────────────────────────────────
//   const pensionEmployee = grossSalary * 0.08;
//   const nhfDeduction    = basicSalary * 0.025;

//   // ── 3. PAYE ───────────────────────────────────────────────────────────────
//   const annualGross   = grossSalary * 12;
//   const annualPension = pensionEmployee * 12;
//   const annualNhf     = nhfDeduction * 12;
//   const cra           = Math.max(200_000, annualGross * 0.20);
//   const annualTaxable = Math.max(0, annualGross - annualPension - annualNhf - cra);
//   const annualPaye    = calcPayeAnnual(annualTaxable);
//   const payeTax       = annualPaye / 12;

//   // ── 4. Custom deductions ──────────────────────────────────────────────────
//   let customDeductionsTotal = 0;
//   const deductionsBreakdown = {};

//   for (const ded of deductions) {
//     if (
//       ded.formula_key === "paye" ||
//       ded.formula_key === "pension_employee" ||
//       ded.formula_key === "nhf"
//     ) continue;

//     let amount = 0;
//     const base = ded.calculation_base === "basic" ? basicSalary : grossSalary;

//     if (ded.type === "flat") {
//       amount = Number(ded.value ?? 0);
//     } else if (ded.type === "percent") {
//       amount = base * (Number(ded.value ?? 0) / 100);
//     } else if (ded.type === "formula") {
//       continue;
//     }

//     if (amount > 0) {
//       customDeductionsTotal += amount;
//       deductionsBreakdown[ded.name] = amount;
//     }
//   }

//   const totalDeductions = pensionEmployee + nhfDeduction + payeTax + customDeductionsTotal;
//   const netSalary       = Math.max(0, grossSalary - totalDeductions);
//   const taxableIncome   = Math.max(0, grossSalary - pensionEmployee - nhfDeduction);

//   return {
//     employeeId,
//     employeeName:   `${emp.first_name} ${emp.last_name}`,
//     employeeCode:   emp.employee_code,
//     departmentName: emp.department_name,
//     jobRoleName:    emp.job_role_name,
//     bankName:       emp.bank_name,
//     accountNumber:  emp.account_number,
//     accountName:    emp.account_name,

//     basicSalary,
//     housingAllowance,
//     transportAllowance,
//     utilityAllowance,
//     mealAllowance,
//     medicalAllowance,
//     otherAllowances,
//     overtime,
//     bonus,
//     grossSalary,

//     pensionEmployee,
//     nhfDeduction,
//     payeTax,
//     otherDeductions:     customDeductionsTotal,
//     deductionsBreakdown,
//     totalDeductions,

//     taxableIncome,
//     netSalary,

//     month,
//     year,
//     companyId,
//   };
// }

// // ── Write payslip to DB (used during payroll run) ─────────────────────────
// async function runPayrollForEmployee(
//   employeeId,
//   companyId,
//   payrollRunId,
//   month,
//   year,
//   overrides = {},
//   dbOrClient = db,
// ) {
//   const payslip = await calculatePayslip(
//     employeeId,
//     companyId,
//     month,
//     year,
//     overrides,
//     dbOrClient,
//   );

//   const q = dbOrClient.query.bind(dbOrClient);

//   const result = await q(
//     `INSERT INTO payroll_records (
//        company_id, payroll_run_id, employee_id,
//        month, year,
//        basic_salary, housing_allowance, transport_allowance,
//        utility_allowance, meal_allowance,
//        medical_allowance, other_allowances,
//        overtime, bonus,
//        gross_salary,
//        pension_employee, nhf_deduction, paye_tax,
//        other_deductions, deductions_breakdown,
//        total_deductions, taxable_income, net_salary,
//        status, created_at, updated_at
//      )
//      VALUES (
//        $1,  $2,  $3,
//        $4,  $5,
//        $6,  $7,  $8,
//        $9,  $10,
//        $11, $12,
//        $13, $14,
//        $15,
//        $16, $17, $18,
//        $19, $20,
//        $21, $22, $23,
//        'draft', NOW(), NOW()
//      )
//      ON CONFLICT (payroll_run_id, employee_id)
//      DO UPDATE SET
//        basic_salary         = EXCLUDED.basic_salary,
//        housing_allowance    = EXCLUDED.housing_allowance,
//        transport_allowance  = EXCLUDED.transport_allowance,
//        utility_allowance    = EXCLUDED.utility_allowance,
//        meal_allowance       = EXCLUDED.meal_allowance,
//        medical_allowance    = EXCLUDED.medical_allowance,
//        other_allowances     = EXCLUDED.other_allowances,
//        overtime             = EXCLUDED.overtime,
//        bonus                = EXCLUDED.bonus,
//        gross_salary         = EXCLUDED.gross_salary,
//        pension_employee     = EXCLUDED.pension_employee,
//        nhf_deduction        = EXCLUDED.nhf_deduction,
//        paye_tax             = EXCLUDED.paye_tax,
//        other_deductions     = EXCLUDED.other_deductions,
//        deductions_breakdown = EXCLUDED.deductions_breakdown,
//        total_deductions     = EXCLUDED.total_deductions,
//        taxable_income       = EXCLUDED.taxable_income,
//        net_salary           = EXCLUDED.net_salary,
//        updated_at           = NOW()
//      RETURNING *`,
//     [
//       companyId,
//       payrollRunId,
//       employeeId,
//       month,
//       year,
//       payslip.basicSalary,
//       payslip.housingAllowance,
//       payslip.transportAllowance,
//       payslip.utilityAllowance,
//       payslip.mealAllowance,
//       payslip.medicalAllowance,
//       payslip.otherAllowances,
//       payslip.overtime,
//       payslip.bonus,
//       payslip.grossSalary,
//       payslip.pensionEmployee,
//       payslip.nhfDeduction,
//       payslip.payeTax,
//       payslip.otherDeductions,
//       JSON.stringify(payslip.deductionsBreakdown),
//       payslip.totalDeductions,
//       payslip.taxableIncome,
//       payslip.netSalary,
//     ],
//   );

//   return {
//     ...payslip,
//     id: result.rows[0]?.id,
//   };
// }

// // ── Seed helpers ──────────────────────────────────────────────────────────
// async function seedDefaultStructure(companyId, dbOrClient = db) {
//   const q = dbOrClient.query.bind(dbOrClient);
//   const existing = await q(
//     "SELECT id FROM payroll_structures WHERE company_id = $1 LIMIT 1",
//     [companyId],
//   );
//   if (existing.rowCount > 0) return;

//   await q(
//     `INSERT INTO payroll_structures
//        (company_id, name, basic_percent, housing_percent, transport_percent,
//         utility_percent, meal_percent, is_active)
//      VALUES ($1, 'Standard', 60, 20, 10, 5, 5, true)`,
//     [companyId],
//   );
// }

// async function seedDefaultDeductions(companyId, dbOrClient = db) {
//   const q = dbOrClient.query.bind(dbOrClient);
//   const existing = await q(
//     "SELECT id FROM payroll_deductions WHERE company_id = $1 AND is_statutory = true LIMIT 1",
//     [companyId],
//   );
//   if (existing.rowCount > 0) return;

//   const statutory = [
//     {
//       name: "PAYE Tax",
//       category: "tax",
//       type: "formula",
//       formulaKey: "paye",
//       calculationBase: "gross",
//     },
//     {
//       name: "Pension (Employee 8%)",
//       category: "pension",
//       type: "percent",
//       value: 8,
//       formulaKey: "pension_employee",
//       calculationBase: "gross",
//     },
//     {
//       name: "NHF (2.5%)",
//       category: "nhf",
//       type: "percent",
//       value: 2.5,
//       formulaKey: "nhf",
//       calculationBase: "basic",
//     },
//   ];

//   for (const d of statutory) {
//     await q(
//       `INSERT INTO payroll_deductions
//          (company_id, name, category, type, value, formula_key,
//           calculation_base, is_statutory, is_active, applies_to_all)
//        VALUES ($1, $2, $3, $4, $5, $6, $7, true, true, true)
//        ON CONFLICT DO NOTHING`,
//       [
//         companyId,
//         d.name,
//         d.category,
//         d.type,
//         d.value ?? null,
//         d.formulaKey ?? null,
//         d.calculationBase,
//       ],
//     );
//   }
// }

// export {
//   calculatePayslip,
//   runPayrollForEmployee,
//   seedDefaultDeductions,
//   seedDefaultStructure,
// };


// // src/services/payroll.engine.js
// // ─────────────────────────────────────────────────────────────────────────────
// // Architecture:
// //   • Salary lives on employees.basic_salary — SINGLE SOURCE OF TRUTH.
// //   • payroll_structures splits gross into allowance components (percentages).
// //   • payroll_deductions holds statutory + custom deductions.
// //   • Every optional config defaults to 0 — engine NEVER crashes on missing data.
// //
// // Nigeria statutory deductions implemented:
// //   • PAYE   — graduated tax table (Finance Act 2019 + CRA relief)
// //   • Pension — employee 8 %, employer 10 % of gross
// //   • NHF    — 2.5 % of basic salary
// // ─────────────────────────────────────────────────────────────────────────────

// import { db } from "../config/db.js";

// // ── Nigeria PAYE tax table (Finance Act 2019) ─────────────────────────────
// const PAYE_BRACKETS = [
//   { limit: 300_000,   rate: 0.07 },
//   { limit: 300_000,   rate: 0.11 },
//   { limit: 500_000,   rate: 0.15 },
//   { limit: 500_000,   rate: 0.19 },
//   { limit: 1_600_000, rate: 0.21 },
//   { limit: Infinity,  rate: 0.24 },
// ];

// function calcPayeAnnual(annualTaxable) {
//   if (annualTaxable <= 0) return 0;
//   let remaining = annualTaxable;
//   let tax = 0;
//   for (const { limit, rate } of PAYE_BRACKETS) {
//     if (remaining <= 0) break;
//     const slice = Math.min(remaining, limit);
//     tax += slice * rate;
//     remaining -= slice;
//   }
//   return Math.max(0, tax);
// }

// // ── Fetch employee + company config defensively ───────────────────────────
// async function fetchPayrollInputs(employeeId, companyId, dbOrClient) {
//   const q = dbOrClient.query.bind(dbOrClient);

//   // Only select columns that exist on employees table.
//   // Allowances are NOT stored on employees — derived from payroll_structures.
//   const empResult = await q(
//     `SELECT
//        e.id,
//        e.first_name,
//        e.last_name,
//        e.employee_code,
//        e.basic_salary,
//        e.bank_name,
//        e.account_number,
//        e.account_name,
//        e.employment_type,
//        e.department_id,
//        e.job_role_id,
//        d.name   AS department_name,
//        jr.title AS job_role_name
//      FROM employees e
//      LEFT JOIN departments d  ON d.id  = e.department_id
//      LEFT JOIN job_roles   jr ON jr.id = e.job_role_id
//      WHERE e.id = $1 AND e.company_id = $2`,
//     [employeeId, companyId],
//   );

//   if (empResult.rowCount === 0) {
//     throw new Error(`Employee ${employeeId} not found in company ${companyId}.`);
//   }
//   const emp = empResult.rows[0];

//   // Active payroll structure (optional — defaults to 60/20/10/5/5)
//   const structResult = await q(
//     `SELECT * FROM payroll_structures
//      WHERE company_id = $1 AND is_active = true
//      ORDER BY created_at DESC LIMIT 1`,
//     [companyId],
//   );
//   const struct = structResult.rows[0] ?? null;

//   // Active deductions
//   const dedResult = await q(
//     `SELECT * FROM payroll_deductions
//      WHERE company_id = $1 AND is_active = true
//      ORDER BY is_statutory DESC, name ASC`,
//     [companyId],
//   );
//   const deductions = dedResult.rows ?? [];

//   return { emp, struct, deductions };
// }

// // ── Core payslip calculation (pure, no DB writes) ─────────────────────────
// async function calculatePayslip(
//   employeeId,
//   companyId,
//   month,
//   year,
//   overrides = {},
//   dbOrClient = db,
// ) {
//   const { emp, struct, deductions } = await fetchPayrollInputs(
//     employeeId,
//     companyId,
//     dbOrClient,
//   );

//   // ── 1. Basic salary ───────────────────────────────────────────────────────
//   const basicSalary = Number(emp.basic_salary ?? 0);

//   // ── 2. Allowances — always derived from payroll structure ─────────────────
//   let housingAllowance;
//   let transportAllowance;
//   let utilityAllowance;
//   let mealAllowance;

//   if (struct) {
//     const grossBase = basicSalary > 0
//       ? basicSalary / ((Number(struct.basic_percent) || 60) / 100)
//       : 0;
//     housingAllowance   = grossBase * (Number(struct.housing_percent)   || 0) / 100;
//     transportAllowance = grossBase * (Number(struct.transport_percent) || 0) / 100;
//     utilityAllowance   = grossBase * (Number(struct.utility_percent)   || 0) / 100;
//     mealAllowance      = grossBase * (Number(struct.meal_percent)      || 0) / 100;
//   } else {
//     // Nigeria sensible defaults when no structure is configured
//     housingAllowance   = basicSalary * 0.20;
//     transportAllowance = basicSalary * 0.10;
//     utilityAllowance   = 0;
//     mealAllowance      = 0;
//   }

//   const overtime      = Number(overrides.overtime      ?? 0);
//   const bonus         = Number(overrides.bonus         ?? 0);
//   const otherEarnings = Number(overrides.otherEarnings ?? 0);

//   const grossSalary =
//     basicSalary +
//     housingAllowance +
//     transportAllowance +
//     utilityAllowance +
//     mealAllowance +
//     overtime +
//     bonus +
//     otherEarnings;

//   // ── 3. Statutory deductions ───────────────────────────────────────────────
//   const pensionEmployee = grossSalary * 0.08;
//   const nhfDeduction    = basicSalary * 0.025;

//   // ── 4. PAYE ───────────────────────────────────────────────────────────────
//   const annualGross   = grossSalary * 12;
//   const annualPension = pensionEmployee * 12;
//   const annualNhf     = nhfDeduction * 12;
//   const cra           = Math.max(200_000, annualGross * 0.20);
//   const annualTaxable = Math.max(0, annualGross - annualPension - annualNhf - cra);
//   const annualPaye    = calcPayeAnnual(annualTaxable);
//   const payeTax       = annualPaye / 12;

//   // ── 5. Custom deductions ──────────────────────────────────────────────────
//   let customDeductionsTotal = 0;
//   const deductionsBreakdown = {};

//   for (const ded of deductions) {
//     if (
//       ded.formula_key === "paye" ||
//       ded.formula_key === "pension_employee" ||
//       ded.formula_key === "nhf"
//     ) continue;

//     let amount = 0;
//     const base = ded.calculation_base === "basic" ? basicSalary : grossSalary;

//     if (ded.type === "flat") {
//       amount = Number(ded.value ?? 0);
//     } else if (ded.type === "percent") {
//       amount = base * (Number(ded.value ?? 0) / 100);
//     } else if (ded.type === "formula") {
//       continue;
//     }

//     if (amount > 0) {
//       customDeductionsTotal += amount;
//       deductionsBreakdown[ded.name] = amount;
//     }
//   }

//   const totalDeductions = pensionEmployee + nhfDeduction + payeTax + customDeductionsTotal;
//   const netSalary       = Math.max(0, grossSalary - totalDeductions);
//   const taxableIncome   = Math.max(0, grossSalary - pensionEmployee - nhfDeduction);

//   return {
//     // Employee info
//     employeeId,
//     employeeName:   `${emp.first_name} ${emp.last_name}`,
//     employeeCode:   emp.employee_code,
//     departmentId:   emp.department_id,
//     jobRoleId:      emp.job_role_id,
//     departmentName: emp.department_name,
//     jobRoleName:    emp.job_role_name,
//     bankName:       emp.bank_name,
//     accountNumber:  emp.account_number,
//     accountName:    emp.account_name,

//     // Earnings
//     basicSalary,
//     housingAllowance,
//     transportAllowance,
//     utilityAllowance,
//     mealAllowance,
//     overtime,
//     bonus,
//     otherEarnings,
//     grossSalary,

//     // Deductions
//     pensionEmployee,
//     nhfDeduction,
//     payeTax,
//     otherDeductions:     customDeductionsTotal,
//     deductionsBreakdown,
//     totalDeductions,

//     // Net
//     taxableIncome,
//     netSalary,

//     // Metadata
//     month,
//     year,
//     companyId,
//   };
// }

// // ── Write payslip to DB (used during payroll run) ─────────────────────────
// async function runPayrollForEmployee(
//   employeeId,
//   companyId,
//   payrollRunId,
//   month,
//   year,
//   overrides = {},
//   dbOrClient = db,
// ) {
//   const payslip = await calculatePayslip(
//     employeeId,
//     companyId,
//     month,
//     year,
//     overrides,
//     dbOrClient,
//   );

//   const q = dbOrClient.query.bind(dbOrClient);

//   // Columns matched exactly to payroll_records schema.
//   // medical_allowance / other_allowances do NOT exist on the table.
//   // other_earnings DOES exist. department_id and job_role_id DO exist.
//   const result = await q(
//     `INSERT INTO payroll_records (
//        company_id, payroll_run_id, employee_id,
//        department_id, job_role_id,
//        month, year,
//        basic_salary,
//        housing_allowance, transport_allowance,
//        utility_allowance, meal_allowance,
//        overtime, bonus, other_earnings,
//        gross_salary,
//        pension_employee, nhf_deduction, paye_tax,
//        deductions_breakdown,
//        total_deductions, taxable_income, net_salary,
//        status, created_at, updated_at
//      )
//      VALUES (
//        $1,  $2,  $3,
//        $4,  $5,
//        $6,  $7,
//        $8,
//        $9,  $10,
//        $11, $12,
//        $13, $14, $15,
//        $16,
//        $17, $18, $19,
//        $20,
//        $21, $22, $23,
//        'draft', NOW(), NOW()
//      )
//      ON CONFLICT (payroll_run_id, employee_id)
//      DO UPDATE SET
//        department_id        = EXCLUDED.department_id,
//        job_role_id          = EXCLUDED.job_role_id,
//        basic_salary         = EXCLUDED.basic_salary,
//        housing_allowance    = EXCLUDED.housing_allowance,
//        transport_allowance  = EXCLUDED.transport_allowance,
//        utility_allowance    = EXCLUDED.utility_allowance,
//        meal_allowance       = EXCLUDED.meal_allowance,
//        overtime             = EXCLUDED.overtime,
//        bonus                = EXCLUDED.bonus,
//        other_earnings       = EXCLUDED.other_earnings,
//        gross_salary         = EXCLUDED.gross_salary,
//        pension_employee     = EXCLUDED.pension_employee,
//        nhf_deduction        = EXCLUDED.nhf_deduction,
//        paye_tax             = EXCLUDED.paye_tax,
//        deductions_breakdown = EXCLUDED.deductions_breakdown,
//        total_deductions     = EXCLUDED.total_deductions,
//        taxable_income       = EXCLUDED.taxable_income,
//        net_salary           = EXCLUDED.net_salary,
//        updated_at           = NOW()
//      RETURNING *`,
//     [
//       companyId,
//       payrollRunId,
//       employeeId,
//       payslip.departmentId,
//       payslip.jobRoleId,
//       month,
//       year,
//       payslip.basicSalary,
//       payslip.housingAllowance,
//       payslip.transportAllowance,
//       payslip.utilityAllowance,
//       payslip.mealAllowance,
//       payslip.overtime,
//       payslip.bonus,
//       payslip.otherEarnings,
//       payslip.grossSalary,
//       payslip.pensionEmployee,
//       payslip.nhfDeduction,
//       payslip.payeTax,
//       JSON.stringify(payslip.deductionsBreakdown),
//       payslip.totalDeductions,
//       payslip.taxableIncome,
//       payslip.netSalary,
//     ],
//   );

//   return {
//     ...payslip,
//     id: result.rows[0]?.id,
//   };
// }

// // ── Seed helpers ──────────────────────────────────────────────────────────
// async function seedDefaultStructure(companyId, dbOrClient = db) {
//   const q = dbOrClient.query.bind(dbOrClient);
//   const existing = await q(
//     "SELECT id FROM payroll_structures WHERE company_id = $1 LIMIT 1",
//     [companyId],
//   );
//   if (existing.rowCount > 0) return;

//   await q(
//     `INSERT INTO payroll_structures
//        (company_id, name, basic_percent, housing_percent, transport_percent,
//         utility_percent, meal_percent, is_active)
//      VALUES ($1, 'Standard', 60, 20, 10, 5, 5, true)`,
//     [companyId],
//   );
// }

// async function seedDefaultDeductions(companyId, dbOrClient = db) {
//   const q = dbOrClient.query.bind(dbOrClient);
//   const existing = await q(
//     "SELECT id FROM payroll_deductions WHERE company_id = $1 AND is_statutory = true LIMIT 1",
//     [companyId],
//   );
//   if (existing.rowCount > 0) return;

//   const statutory = [
//     {
//       name: "PAYE Tax",
//       category: "tax",
//       type: "formula",
//       formulaKey: "paye",
//       calculationBase: "gross",
//     },
//     {
//       name: "Pension (Employee 8%)",
//       category: "pension",
//       type: "percent",
//       value: 8,
//       formulaKey: "pension_employee",
//       calculationBase: "gross",
//     },
//     {
//       name: "NHF (2.5%)",
//       category: "nhf",
//       type: "percent",
//       value: 2.5,
//       formulaKey: "nhf",
//       calculationBase: "basic",
//     },
//   ];

//   for (const d of statutory) {
//     await q(
//       `INSERT INTO payroll_deductions
//          (company_id, name, category, type, value, formula_key,
//           calculation_base, is_statutory, is_active, applies_to_all)
//        VALUES ($1, $2, $3, $4, $5, $6, $7, true, true, true)
//        ON CONFLICT DO NOTHING`,
//       [
//         companyId,
//         d.name,
//         d.category,
//         d.type,
//         d.value ?? null,
//         d.formulaKey ?? null,
//         d.calculationBase,
//       ],
//     );
//   }
// }

// export {
//   calculatePayslip,
//   runPayrollForEmployee,
//   seedDefaultDeductions,
//   seedDefaultStructure,
// };


// // src/services/payroll.engine.js
// // ─────────────────────────────────────────────────────────────────────────────
// // Nigeria Tax Act 2025 — effective 1 January 2026

// // KEY 2026 CHANGES:
// //   • New PAYE brackets: 0% on first ₦800k annual, top rate 25%
// //   • CRA abolished — replaced by specific deductions (pension, NHF, rent relief)
// //   • NHF now 2.5% of GROSS (was basic before)
// //   • Pension base = basic + housing + transport (NOT full gross)
// //   • Statutory deductions are CONFIGURABLE per company:
// //       - If company disables PAYE/Pension/NHF in payroll_deductions → skipped
// //       - If employee is in exempt_employee_ids → skipped for that employee
// //       - Enabled by default when seeded, but never hardcoded as always-on
// // ─────────────────────────────────────────────────────────────────────────────

// import { db } from "../config/db.js";

// // ── 2026 Nigeria Tax Act PAYE brackets (annual taxable income) ────────────
// const PAYE_BRACKETS_2026 = [
//   { limit:  800_000,  rate: 0.00 }, // tax-free band — first ₦800k
//   { limit: 2_200_000, rate: 0.15 }, // next ₦2.2M   → 15%
//   { limit: 9_000_000, rate: 0.18 }, // next ₦9M      → 18%
//   { limit:13_000_000, rate: 0.21 }, // next ₦13M     → 21%
//   { limit:25_000_000, rate: 0.23 }, // next ₦25M     → 23%
//   { limit: Infinity,  rate: 0.25 }, // above ₦50M    → 25%
// ];

// function calcPayeAnnual2026(annualTaxable) {
//   if (annualTaxable <= 0) return 0;
//   let remaining = annualTaxable;
//   let tax = 0;
//   for (const { limit, rate } of PAYE_BRACKETS_2026) {
//     if (remaining <= 0) break;
//     const slice = Math.min(remaining, limit);
//     tax += slice * rate;
//     remaining -= slice;
//   }
//   return Math.max(0, tax);
// }

// // ── Fetch employee + config ───────────────────────────────────────────────
// async function fetchPayrollInputs(employeeId, companyId, dbOrClient) {
//   const q = dbOrClient.query.bind(dbOrClient);

//   const empResult = await q(
//     `SELECT
//        e.id, e.first_name, e.last_name, e.employee_code,
//        e.basic_salary, e.bank_name, e.account_number, e.account_name,
//        e.employment_type, e.department_id, e.job_role_id,
//        d.name   AS department_name,
//        jr.title AS job_role_name
//      FROM employees e
//      LEFT JOIN departments d  ON d.id  = e.department_id
//      LEFT JOIN job_roles   jr ON jr.id = e.job_role_id
//      WHERE e.id = $1 AND e.company_id = $2`,
//     [employeeId, companyId],
//   );
//   if (empResult.rowCount === 0)
//     throw new Error(`Employee ${employeeId} not found in company ${companyId}.`);

//   const emp = empResult.rows[0];

//   const structResult = await q(
//     `SELECT * FROM payroll_structures
//      WHERE company_id = $1 AND is_active = true
//      ORDER BY created_at DESC LIMIT 1`,
//     [companyId],
//   );
//   const struct = structResult.rows[0] ?? null;

//   const dedResult = await q(
//     `SELECT * FROM payroll_deductions
//      WHERE company_id = $1 AND is_active = true
//      ORDER BY is_statutory DESC, name ASC`,
//     [companyId],
//   );
//   const deductions = dedResult.rows ?? [];

//   return { emp, struct, deductions };
// }

// // ── Does this deduction apply to this employee? ───────────────────────────
// // Returns false if:
// //   • Employee is in the deduction's exempt_employee_ids list, OR
// //   • applies_to_all is false AND employee is not in applies_to_employee_ids
// function deductionApplies(ded, employeeId) {
//   const exemptIds = ded.exempt_employee_ids ?? [];
//   if (Array.isArray(exemptIds) && exemptIds.includes(employeeId)) return false;

//   if (!ded.applies_to_all) {
//     const includeIds = ded.applies_to_employee_ids ?? [];
//     if (!Array.isArray(includeIds) || !includeIds.includes(employeeId)) return false;
//   }

//   return true;
// }

// // ── Core payslip calculation (pure — no DB writes) ────────────────────────
// export async function calculatePayslip(
//   employeeId, companyId, month, year, overrides = {}, dbOrClient = db,
// ) {
//   const { emp, struct, deductions } = await fetchPayrollInputs(employeeId, companyId, dbOrClient);

//   // 1. Basic salary
//   const basicSalary = Number(emp.basic_salary ?? 0);

//   // 2. Allowances from structure (or Nigeria defaults)
//   let housingAllowance, transportAllowance, utilityAllowance, mealAllowance;
//   if (struct) {
//     const grossBase = basicSalary > 0
//       ? basicSalary / ((Number(struct.basic_percent) || 60) / 100)
//       : 0;
//     housingAllowance   = grossBase * (Number(struct.housing_percent)   || 0) / 100;
//     transportAllowance = grossBase * (Number(struct.transport_percent) || 0) / 100;
//     utilityAllowance   = grossBase * (Number(struct.utility_percent)   || 0) / 100;
//     mealAllowance      = grossBase * (Number(struct.meal_percent)      || 0) / 100;
//   } else {
//     housingAllowance   = basicSalary * 0.20;
//     transportAllowance = basicSalary * 0.10;
//     utilityAllowance   = 0;
//     mealAllowance      = 0;
//   }

//   const overtime      = Number(overrides.overtime      ?? 0);
//   const bonus         = Number(overrides.bonus         ?? 0);
//   const otherEarnings = Number(overrides.otherEarnings ?? 0);

//   const grossSalary =
//     basicSalary + housingAllowance + transportAllowance +
//     utilityAllowance + mealAllowance + overtime + bonus + otherEarnings;

//   // 3. Statutory deductions — only if enabled in company config AND applies to employee

//   // Pension base (2026): basic + housing + transport only
//   const pensionBase = basicSalary + housingAllowance + transportAllowance;

//   const payeDed    = deductions.find(d => d.formula_key === "paye");
//   const pensionDed = deductions.find(d => d.formula_key === "pension_employee");
//   const nhfDed     = deductions.find(d => d.formula_key === "nhf");

//   let pensionEmployee = 0;
//   if (pensionDed && deductionApplies(pensionDed, employeeId)) {
//     pensionEmployee = pensionBase * (Number(pensionDed.value ?? 8) / 100);
//   }

//   // NHF 2026: 2.5% of GROSS (changed from basic)
//   let nhfDeduction = 0;
//   if (nhfDed && deductionApplies(nhfDed, employeeId)) {
//     nhfDeduction = grossSalary * (Number(nhfDed.value ?? 2.5) / 100);
//   }

//   // PAYE 2026: taxable = gross - pension - nhf - rent relief (no CRA)
//   let payeTax = 0;
//   if (payeDed && deductionApplies(payeDed, employeeId)) {
//     const annualRent  = Number(overrides.annualRent ?? 0);
//     const rentRelief  = annualRent > 0 ? Math.min(annualRent * 0.20, 500_000) : 0;
//     const annualTaxable = Math.max(
//       0,
//       (grossSalary * 12) - (pensionEmployee * 12) - (nhfDeduction * 12) - rentRelief,
//     );
//     payeTax = calcPayeAnnual2026(annualTaxable) / 12;
//   }

//   // 4. Custom deductions
//   let customDeductionsTotal = 0;
//   const deductionsBreakdown = {};

//   // Add statutory items to breakdown for full transparency
//   if (pensionEmployee > 0) deductionsBreakdown["Pension (Employee 8%)"] = +pensionEmployee.toFixed(2);
//   if (nhfDeduction    > 0) deductionsBreakdown["NHF (2.5% of Gross)"]   = +nhfDeduction.toFixed(2);
//   if (payeTax         > 0) deductionsBreakdown["PAYE Tax (2026)"]        = +payeTax.toFixed(2);

//   for (const ded of deductions) {
//     if (["paye", "pension_employee", "nhf"].includes(ded.formula_key)) continue;
//     if (!deductionApplies(ded, employeeId)) continue;

//     const base = ded.calculation_base === "basic" ? basicSalary : grossSalary;
//     let amount = 0;

//     if (ded.type === "flat")    amount = Number(ded.value ?? 0);
//     else if (ded.type === "percent") amount = base * (Number(ded.value ?? 0) / 100);
//     else continue; // formula types handled above

//     if (amount > 0) {
//       customDeductionsTotal += amount;
//       deductionsBreakdown[ded.name] = +amount.toFixed(2);
//     }
//   }

//   const totalDeductions = pensionEmployee + nhfDeduction + payeTax + customDeductionsTotal;
//   const netSalary       = Math.max(0, grossSalary - totalDeductions);
//   const taxableIncome   = Math.max(0, grossSalary - pensionEmployee - nhfDeduction);

//   return {
//     employeeId,
//     employeeName:   `${emp.first_name} ${emp.last_name}`,
//     employeeCode:   emp.employee_code,
//     departmentId:   emp.department_id,
//     jobRoleId:      emp.job_role_id,
//     departmentName: emp.department_name,
//     jobRoleName:    emp.job_role_name,
//     bankName:       emp.bank_name,
//     accountNumber:  emp.account_number,
//     accountName:    emp.account_name,
//     basicSalary,
//     housingAllowance,
//     transportAllowance,
//     utilityAllowance,
//     mealAllowance,
//     overtime,
//     bonus,
//     otherEarnings,
//     grossSalary,
//     pensionEmployee,
//     nhfDeduction,
//     payeTax,
//     otherDeductions: customDeductionsTotal,
//     deductionsBreakdown,
//     totalDeductions,
//     taxableIncome,
//     netSalary,
//     month,
//     year,
//     companyId,
//   };
// }

// // ── Write payslip to DB ───────────────────────────────────────────────────
// export async function runPayrollForEmployee(
//   employeeId, companyId, payrollRunId, month, year, overrides = {}, dbOrClient = db,
// ) {
//   const p = await calculatePayslip(employeeId, companyId, month, year, overrides, dbOrClient);
//   const q = dbOrClient.query.bind(dbOrClient);

//   const result = await q(
//     `INSERT INTO payroll_records (
//        company_id, payroll_run_id, employee_id, department_id, job_role_id,
//        month, year, basic_salary,
//        housing_allowance, transport_allowance, utility_allowance, meal_allowance,
//        overtime, bonus, other_earnings, gross_salary,
//        pension_employee, nhf_deduction, paye_tax,
//        deductions_breakdown, total_deductions, taxable_income, net_salary,
//        status, created_at, updated_at
//      ) VALUES (
//        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,
//        $13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,
//        'draft',NOW(),NOW()
//      )
//      ON CONFLICT (payroll_run_id, employee_id) DO UPDATE SET
//        department_id        = EXCLUDED.department_id,
//        job_role_id          = EXCLUDED.job_role_id,
//        basic_salary         = EXCLUDED.basic_salary,
//        housing_allowance    = EXCLUDED.housing_allowance,
//        transport_allowance  = EXCLUDED.transport_allowance,
//        utility_allowance    = EXCLUDED.utility_allowance,
//        meal_allowance       = EXCLUDED.meal_allowance,
//        overtime             = EXCLUDED.overtime,
//        bonus                = EXCLUDED.bonus,
//        other_earnings       = EXCLUDED.other_earnings,
//        gross_salary         = EXCLUDED.gross_salary,
//        pension_employee     = EXCLUDED.pension_employee,
//        nhf_deduction        = EXCLUDED.nhf_deduction,
//        paye_tax             = EXCLUDED.paye_tax,
//        deductions_breakdown = EXCLUDED.deductions_breakdown,
//        total_deductions     = EXCLUDED.total_deductions,
//        taxable_income       = EXCLUDED.taxable_income,
//        net_salary           = EXCLUDED.net_salary,
//        updated_at           = NOW()
//      RETURNING *`,
//     [
//       companyId, payrollRunId, p.employeeId, p.departmentId, p.jobRoleId,
//       month, year, p.basicSalary,
//       p.housingAllowance, p.transportAllowance, p.utilityAllowance, p.mealAllowance,
//       p.overtime, p.bonus, p.otherEarnings, p.grossSalary,
//       p.pensionEmployee, p.nhfDeduction, p.payeTax,
//       JSON.stringify(p.deductionsBreakdown), p.totalDeductions, p.taxableIncome, p.netSalary,
//     ],
//   );

//   return { ...p, id: result.rows[0]?.id };
// }

// // ── Seed helpers ──────────────────────────────────────────────────────────
// export async function seedDefaultStructure(companyId, dbOrClient = db) {
//   const q = dbOrClient.query.bind(dbOrClient);
//   const ex = await q("SELECT id FROM payroll_structures WHERE company_id=$1 LIMIT 1", [companyId]);
//   if (ex.rowCount > 0) return;
//   await q(
//     `INSERT INTO payroll_structures
//        (company_id,name,basic_percent,housing_percent,transport_percent,utility_percent,meal_percent,is_active)
//      VALUES ($1,'Standard',60,20,10,5,5,true)`,
//     [companyId],
//   );
// }

// export async function seedDefaultDeductions(companyId, dbOrClient = db) {
//   const q = dbOrClient.query.bind(dbOrClient);
//   const ex = await q(
//     "SELECT id FROM payroll_deductions WHERE company_id=$1 AND is_statutory=true LIMIT 1",
//     [companyId],
//   );
//   if (ex.rowCount > 0) return;

//   for (const d of [
//     { name: "PAYE Tax (2026)",       category: "tax",     type: "formula",  value: null, key: "paye",             base: "gross" },
//     { name: "Pension (Employee 8%)", category: "pension", type: "percent",  value: 8,    key: "pension_employee", base: "gross" },
//     { name: "NHF (2.5% of Gross)",   category: "nhf",     type: "percent",  value: 2.5,  key: "nhf",              base: "gross" },
//   ]) {
//     await q(
//       `INSERT INTO payroll_deductions
//          (company_id,name,category,type,value,formula_key,calculation_base,is_statutory,is_active,applies_to_all)
//        VALUES ($1,$2,$3,$4,$5,$6,$7,true,true,true) ON CONFLICT DO NOTHING`,
//       [companyId, d.name, d.category, d.type, d.value ?? null, d.key, d.base],
//     );
//   }
// }


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