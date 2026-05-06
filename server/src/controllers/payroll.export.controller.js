// src/controllers/payroll.export.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payroll/runs/:id/export?format=csv   → bank transfer CSV
// GET /api/payroll/runs/:id/export?format=pdf   → full payroll PDF report
//
// CSV columns (Nigerian bank bulk transfer format):
//   Beneficiary Account Name, Bank Name, Account Number, Amount (Net Pay), Narration
//   + full earnings + deductions for transparency
//
// PDF: full payroll register with company name, period, every employee,
//      earnings breakdown, deductions breakdown, summary totals
// ─────────────────────────────────────────────────────────────────────────────

import { db } from "../config/db.js";

// ── Shared: fetch run + records + company name ────────────────────────────
async function fetchRunData(runId, companyId) {
  // 1. Verify run and get period info
  const runResult = await db.query(
    `SELECT pr.*, c.name AS company_name
     FROM payroll_runs pr
     JOIN companies c ON c.id = pr.company_id
     WHERE pr.id = $1 AND pr.company_id = $2`,
    [runId, companyId],
  );
  if (runResult.rowCount === 0) return null;
  const run = runResult.rows[0];

  // 2. Fetch all payroll records with employee bank details
  const records = await db.query(
    `SELECT
       pr.id,
       pr.basic_salary,
       pr.housing_allowance,
       pr.transport_allowance,
       pr.utility_allowance,
       pr.meal_allowance,
       pr.overtime,
       pr.bonus,
       pr.other_earnings,
       pr.gross_salary,
       pr.pension_employee,
       pr.nhf_deduction,
       pr.paye_tax,
       pr.total_deductions,
       pr.taxable_income,
       pr.net_salary,
       pr.deductions_breakdown,
       pr.status,
       e.first_name,
       e.last_name,
       e.employee_code,
       e.bank_name,
       e.account_number,
       e.account_name,
       d.name  AS department_name,
       jr.title AS job_role_name
     FROM payroll_records pr
     JOIN employees e  ON e.id  = pr.employee_id
     LEFT JOIN departments d  ON d.id  = pr.department_id
     LEFT JOIN job_roles   jr ON jr.id = pr.job_role_id
     WHERE pr.payroll_run_id = $1 AND pr.company_id = $2
     ORDER BY e.last_name, e.first_name`,
    [runId, companyId],
  );

  return { run, records: records.rows };
}

// ── Number formatter ──────────────────────────────────────────────────────
const fmt = (n) => Number(n ?? 0).toFixed(2);
const fmtNGN = (n) =>
  `₦${Number(n ?? 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

// ── CSV export ────────────────────────────────────────────────────────────
function buildCSV(run, records) {
  const period = `${run.label ?? `${run.month}/${run.year}`}`;
  const narration = `${run.company_name} Salary - ${period}`;

  // Section 1: Bank Transfer Sheet (what you upload to the bank)
  const transferHeaders = [
    "S/N",
    "Beneficiary Account Name",
    "Bank Name",
    "Account Number",
    "Net Pay (₦)",
    "Narration",
  ];

  const transferRows = records.map((r, i) => [
    i + 1,
    `"${r.account_name || `${r.first_name} ${r.last_name}`}"`,
    `"${r.bank_name || "N/A"}"`,
    `"${r.account_number || "N/A"}"`,
    fmt(r.net_salary),
    `"${narration}"`,
  ]);

  // Transfer summary row
  const totalNet = records.reduce((s, r) => s + Number(r.net_salary ?? 0), 0);
  const transferSummary = [
    "",
    `"TOTAL (${records.length} employees)"`,
    "",
    "",
    fmt(totalNet),
    "",
  ];

  // Section 2: Full Payroll Register (earnings + deductions per employee)
  const registerHeaders = [
    "S/N",
    "Employee Code",
    "Employee Name",
    "Department",
    "Job Role",
    "Basic Salary (₦)",
    "Housing Allowance (₦)",
    "Transport Allowance (₦)",
    "Utility Allowance (₦)",
    "Meal Allowance (₦)",
    "Overtime (₦)",
    "Bonus (₦)",
    "Other Earnings (₦)",
    "Gross Salary (₦)",
    "Taxable Income (₦)",
    "Pension - Employee 8% (₦)",
    "NHF 2.5% of Gross (₦)",
    "PAYE Tax 2026 (₦)",
    "Other Deductions (₦)",
    "Total Deductions (₦)",
    "Net Pay (₦)",
    "Bank Name",
    "Account Number",
    "Account Name",
    "Status",
  ];

  const registerRows = records.map((r, i) => {
    // Parse deductions_breakdown for any extra custom deductions
    let breakdown = {};
    try {
      breakdown =
        typeof r.deductions_breakdown === "string"
          ? JSON.parse(r.deductions_breakdown)
          : (r.deductions_breakdown ?? {});
    } catch (_) {
      breakdown = {};
    }

    const customDeds =
      Number(r.total_deductions ?? 0) -
      Number(r.pension_employee ?? 0) -
      Number(r.nhf_deduction ?? 0) -
      Number(r.paye_tax ?? 0);

    return [
      i + 1,
      `"${r.employee_code || ""}"`,
      `"${r.first_name} ${r.last_name}"`,
      `"${r.department_name || "—"}"`,
      `"${r.job_role_name || "—"}"`,
      fmt(r.basic_salary),
      fmt(r.housing_allowance),
      fmt(r.transport_allowance),
      fmt(r.utility_allowance),
      fmt(r.meal_allowance),
      fmt(r.overtime),
      fmt(r.bonus),
      fmt(r.other_earnings),
      fmt(r.gross_salary),
      fmt(r.taxable_income),
      fmt(r.pension_employee),
      fmt(r.nhf_deduction),
      fmt(r.paye_tax),
      fmt(Math.max(0, customDeds)),
      fmt(r.total_deductions),
      fmt(r.net_salary),
      `"${r.bank_name || "N/A"}"`,
      `"${r.account_number || "N/A"}"`,
      `"${r.account_name || `${r.first_name} ${r.last_name}`}"`,
      `"${r.status || "draft"}"`,
    ];
  });

  // Register summary row
  const sum = (field) => records.reduce((s, r) => s + Number(r[field] ?? 0), 0);
  const customTotal =
    sum("total_deductions") -
    sum("pension_employee") -
    sum("nhf_deduction") -
    sum("paye_tax");

  const registerSummary = [
    "",
    "",
    `"TOTALS"`,
    "",
    "",
    fmt(sum("basic_salary")),
    fmt(sum("housing_allowance")),
    fmt(sum("transport_allowance")),
    fmt(sum("utility_allowance")),
    fmt(sum("meal_allowance")),
    fmt(sum("overtime")),
    fmt(sum("bonus")),
    fmt(sum("other_earnings")),
    fmt(sum("gross_salary")),
    fmt(sum("taxable_income")),
    fmt(sum("pension_employee")),
    fmt(sum("nhf_deduction")),
    fmt(sum("paye_tax")),
    fmt(Math.max(0, customTotal)),
    fmt(sum("total_deductions")),
    fmt(totalNet),
    "",
    "",
    "",
    "",
  ];

  // Assemble full CSV
  //   const lines = [
  //     // Header block
  //     `"${run.company_name} — Payroll Report"`,
  //     `"Period: ${period}"`,
  //     `"Generated: ${new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" })} WAT"`,
  //     `"Tax Law: Nigeria Tax Act 2025 (effective Jan 1 2026)"`,
  //     `"Total Employees: ${records.length}"`,
  //     "",
  //     // ── SECTION 1: BANK TRANSFER SHEET ──
  //     '"=== SECTION 1: BANK TRANSFER SHEET ==="',
  //     '"Upload this section to your bank portal for bulk salary payment"',
  //     transferHeaders.join(","),
  //     ...transferRows.map((r) => r.join(",")),
  //     transferSummary.join(","),
  //     "",
  //     // ── SECTION 2: FULL PAYROLL REGISTER ──
  //     '"=== SECTION 2: FULL PAYROLL REGISTER ==="',
  //     '"Complete earnings and deductions breakdown per employee"',
  //     registerHeaders.join(","),
  //     ...registerRows.map((r) => r.join(",")),
  //     registerSummary.join(","),
  //     "",
  //     // ── SECTION 3: RUN SUMMARY ──
  //     '"=== SECTION 3: RUN SUMMARY ==="',
  //     `"Total Gross Payroll","${fmtNGN(sum("gross_salary"))}"`,
  //     `"Total Pension (Employee)","${fmtNGN(sum("pension_employee"))}"`,
  //     `"Total NHF","${fmtNGN(sum("nhf_deduction"))}"`,
  //     `"Total PAYE Tax","${fmtNGN(sum("paye_tax"))}"`,
  //     `"Total Other Deductions","${fmtNGN(Math.max(0, customTotal))}"`,
  //     `"Total Deductions","${fmtNGN(sum("total_deductions"))}"`,
  //     `"Total Net Pay","${fmtNGN(totalNet)}"`,
  //     `"Employees Paid","${records.length}"`,
  //   ];
  // REPLACE the lines array assembly at the bottom of buildCSV():
  const lines = [
    // Minimal header (keeps Excel happy without burying the data)
    `"${run.company_name} — Payroll ${period}"`,
    `"Generated: ${new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" })} WAT | ${records.length} Employees"`,
    "",

    // ── SECTION 1: BANK TRANSFER SHEET (first — this is what the bank portal needs) ──
    '"=== SECTION 1: BANK TRANSFER SHEET ==="',
    '"Upload rows below directly to your bank portal for bulk payment"',
    transferHeaders.join(","),
    ...transferRows.map((r) => r.join(",")),
    transferSummary.join(","),
    "",

    // ── SECTION 2: FULL PAYROLL REGISTER ──
    '"=== SECTION 2: FULL PAYROLL REGISTER ==="',
    '"Complete earnings and deductions breakdown — for records only"',
    registerHeaders.join(","),
    ...registerRows.map((r) => r.join(",")),
    registerSummary.join(","),
    "",

    // ── SECTION 3: RUN SUMMARY ──
    '"=== SECTION 3: SUMMARY ==="',
    `"Total Gross Payroll","${fmtNGN(sum("gross_salary"))}"`,
    `"Total Pension (Employee 8%)","${fmtNGN(sum("pension_employee"))}"`,
    `"Total NHF (2.5%)","${fmtNGN(sum("nhf_deduction"))}"`,
    `"Total PAYE Tax","${fmtNGN(sum("paye_tax"))}"`,
    `"Total Other Deductions","${fmtNGN(Math.max(0, customTotal))}"`,
    `"Total Deductions","${fmtNGN(sum("total_deductions"))}"`,
    `"Total Net Pay (Bank Transfer Total)","${fmtNGN(totalNet)}"`,
    `"Number of Employees","${records.length}"`,
  ];

  return lines.join("\n");
}

// ── PDF export ────────────────────────────────────────────────────────────
function buildPDF(run, records) {
  const period = `${run.label ?? `${run.month}/${run.year}`}`;
  const now = new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" });
  const sum = (field) => records.reduce((s, r) => s + Number(r[field] ?? 0), 0);
  const totalNet = sum("net_salary");
  const customTotal = Math.max(
    0,
    sum("total_deductions") -
      sum("pension_employee") -
      sum("nhf_deduction") -
      sum("paye_tax"),
  );

  const employeeRows = records
    .map(
      (r, i) => `
    <tr class="${i % 2 === 0 ? "even" : "odd"}">
      <td>${i + 1}</td>
      <td>${r.employee_code || "—"}</td>
      <td class="name">${r.first_name} ${r.last_name}</td>
      <td>${r.department_name || "—"}</td>
      <td class="num">${fmtNGN(r.basic_salary)}</td>
      <td class="num">${fmtNGN(r.gross_salary)}</td>
      <td class="num">${fmtNGN(r.taxable_income)}</td>
      <td class="num">${fmtNGN(r.pension_employee)}</td>
      <td class="num">${fmtNGN(r.nhf_deduction)}</td>
      <td class="num">${fmtNGN(r.paye_tax)}</td>
      <td class="num">${fmtNGN(r.total_deductions)}</td>
      <td class="num net">${fmtNGN(r.net_salary)}</td>
      <td>${r.bank_name || "—"}</td>
      <td>${r.account_number || "—"}</td>
      <td>${r.account_name || `${r.first_name} ${r.last_name}`}</td>
    </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${run.company_name} — Payroll ${period}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 9px; color: #1a1a2e; padding: 20px; }

  .header { text-align:center; margin-bottom:20px; border-bottom:3px solid #4f46e5; padding-bottom:12px; }
  .header h1 { font-size:18px; color:#4f46e5; font-weight:800; }
  .header h2 { font-size:12px; color:#374151; margin-top:4px; }
  .header p  { font-size:8px; color:#6b7280; margin-top:2px; }

  .meta { display:flex; justify-content:space-between; margin-bottom:14px; gap:10px; }
  .meta-box { flex:1; background:#f8f9ff; border:1px solid #e0e3ff; border-radius:6px; padding:8px 12px; }
  .meta-box .label { font-size:7px; text-transform:uppercase; color:#6b7280; font-weight:700; letter-spacing:.5px; }
  .meta-box .value { font-size:11px; font-weight:800; color:#4f46e5; margin-top:2px; }

  .section-title { font-size:10px; font-weight:800; color:#4f46e5; text-transform:uppercase;
                   letter-spacing:.5px; margin:14px 0 6px; padding-bottom:4px;
                   border-bottom:1px solid #e0e3ff; }

  table { width:100%; border-collapse:collapse; margin-bottom:16px; }
  th { background:#4f46e5; color:#fff; padding:5px 6px; text-align:left; font-size:7.5px;
       font-weight:700; text-transform:uppercase; letter-spacing:.3px; }
  td { padding:4px 6px; border-bottom:1px solid #f1f5f9; font-size:8px; }
  tr.even td { background:#f8f9ff; }
  tr.odd  td { background:#fff; }
  td.num  { text-align:right; font-family:monospace; }
  td.name { font-weight:600; }
  td.net  { color:#059669; font-weight:700; }

  .totals-row td { background:#eef2ff !important; font-weight:800; border-top:2px solid #4f46e5;
                   border-bottom:2px solid #4f46e5; font-size:8.5px; }

  .summary { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-top:14px; }
  .summary-card { background:#f8f9ff; border:1px solid #e0e3ff; border-radius:8px; padding:10px 12px; }
  .summary-card .s-label { font-size:7.5px; color:#6b7280; font-weight:700; text-transform:uppercase; }
  .summary-card .s-value { font-size:13px; font-weight:800; color:#4f46e5; margin-top:3px; }
  .summary-card.danger .s-value { color:#dc2626; }
  .summary-card.success .s-value { color:#059669; }

  .footer { margin-top:24px; padding-top:10px; border-top:1px solid #e5e7eb; display:flex;
            justify-content:space-between; font-size:7.5px; color:#9ca3af; }

  .tax-notice { margin-top:10px; padding:8px 12px; background:#fefce8; border:1px solid #fde047;
                border-radius:6px; font-size:7.5px; color:#713f12; }

  @media print {
    body { padding:10px; }
    .no-print { display:none; }
  }
</style>
</head>
<body>

<div class="header">
  <h1>${run.company_name}</h1>
  <h2>Payroll Report — ${period}</h2>
  <p>Generated: ${now} WAT &nbsp;|&nbsp; Tax Law: Nigeria Tax Act 2025 (effective 1 Jan 2026) &nbsp;|&nbsp; ${records.length} Employees</p>
</div>

<div class="meta">
  <div class="meta-box">
    <div class="label">Gross Payroll</div>
    <div class="value">${fmtNGN(sum("gross_salary"))}</div>
  </div>
  <div class="meta-box">
    <div class="label">Total PAYE Tax</div>
    <div class="value" style="color:#dc2626">${fmtNGN(sum("paye_tax"))}</div>
  </div>
  <div class="meta-box">
    <div class="label">Total Pension</div>
    <div class="value" style="color:#d97706">${fmtNGN(sum("pension_employee"))}</div>
  </div>
  <div class="meta-box">
    <div class="label">Total NHF</div>
    <div class="value" style="color:#7c3aed">${fmtNGN(sum("nhf_deduction"))}</div>
  </div>
  <div class="meta-box">
    <div class="label">Total Deductions</div>
    <div class="value" style="color:#dc2626">${fmtNGN(sum("total_deductions"))}</div>
  </div>
  <div class="meta-box">
    <div class="label">Net Pay (Bank Total)</div>
    <div class="value" style="color:#059669">${fmtNGN(totalNet)}</div>
  </div>
</div>

<div class="section-title">Payroll Register — Earnings &amp; Deductions</div>
<table>
  <thead>
    <tr>
      <th>#</th><th>Code</th><th>Employee Name</th><th>Department</th>
      <th>Basic (₦)</th><th>Gross (₦)</th><th>Taxable (₦)</th>
      <th>Pension (₦)</th><th>NHF (₦)</th><th>PAYE (₦)</th>
      <th>Total Ded. (₦)</th><th>Net Pay (₦)</th>
      <th>Bank</th><th>Account No.</th><th>Account Name</th>
    </tr>
  </thead>
  <tbody>
    ${employeeRows}
    <tr class="totals-row">
      <td colspan="4"><strong>TOTALS (${records.length} employees)</strong></td>
      <td class="num">${fmtNGN(sum("basic_salary"))}</td>
      <td class="num">${fmtNGN(sum("gross_salary"))}</td>
      <td class="num">${fmtNGN(sum("taxable_income"))}</td>
      <td class="num">${fmtNGN(sum("pension_employee"))}</td>
      <td class="num">${fmtNGN(sum("nhf_deduction"))}</td>
      <td class="num">${fmtNGN(sum("paye_tax"))}</td>
      <td class="num">${fmtNGN(sum("total_deductions"))}</td>
      <td class="num net">${fmtNGN(totalNet)}</td>
      <td colspan="3"></td>
    </tr>
  </tbody>
</table>

<div class="section-title">Bank Transfer Summary</div>
<table>
  <thead>
    <tr>
      <th>#</th><th>Account Name</th><th>Bank Name</th>
      <th>Account Number</th><th>Amount to Transfer (₦)</th><th>Narration</th>
    </tr>
  </thead>
  <tbody>
    ${records
      .map(
        (r, i) => `
    <tr class="${i % 2 === 0 ? "even" : "odd"}">
      <td>${i + 1}</td>
      <td class="name">${r.account_name || `${r.first_name} ${r.last_name}`}</td>
      <td>${r.bank_name || "—"}</td>
      <td>${r.account_number || "—"}</td>
      <td class="num net">${fmtNGN(r.net_salary)}</td>
      <td>${run.company_name} Salary - ${period}</td>
    </tr>`,
      )
      .join("")}
    <tr class="totals-row">
      <td colspan="4"><strong>TOTAL BANK TRANSFER</strong></td>
      <td class="num net"><strong>${fmtNGN(totalNet)}</strong></td>
      <td></td>
    </tr>
  </tbody>
</table>

<div class="tax-notice">
  <strong>⚖️ Tax Compliance Notice:</strong> PAYE computed under Nigeria Tax Act 2025 (effective 1 January 2026).
  Brackets: ₦0–₦800k @ 0% | ₦800k–₦3M @ 15% | ₦3M–₦12M @ 18% | ₦12M–₦25M @ 21% | ₦25M–₦50M @ 23% | Above ₦50M @ 25%.
  NHF @ 2.5% of gross salary. Pension @ 8% of (Basic + Housing + Transport). CRA abolished from Jan 2026.
</div>

<div class="footer">
  <span>${run.company_name} — Confidential Payroll Document</span>
  <span>Period: ${period} &nbsp;|&nbsp; Run ID: ${run.id} &nbsp;|&nbsp; Generated: ${now}</span>
</div>

</body>
</html>`;
}

// ── Main export handler ───────────────────────────────────────────────────
export async function getPaymentFile(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;
  const format = (req.query.format ?? "csv").toLowerCase(); // "csv" | "pdf"

  try {
    const data = await fetchRunData(id, companyId);
    if (!data)
      return res.status(404).json({ message: "Payroll run not found." });

    const { run, records } = data;

    if (records.length === 0) {
      return res
        .status(400)
        .json({
          message: "No payroll records found for this run. Process it first.",
        });
    }

    const period =
      run.label ?? `${String(run.month).padStart(2, "0")}-${run.year}`;
    const safeName = run.company_name.replace(/[^a-zA-Z0-9]/g, "_");

    if (format === "pdf") {
      const html = buildPDF(run, records);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${safeName}_Payroll_${period}.html"`,
      );
      return res.status(200).send(html);
    }

    // Default: CSV
    const csv = buildCSV(run, records);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeName}_Payroll_${period}.csv"`,
    );
    return res.status(200).send("\uFEFF" + csv); // BOM prefix for Excel compatibility
  } catch (err) {
    console.error("getPaymentFile error:", err);
    return res.status(500).json({ message: "Error generating export file." });
  }
}
