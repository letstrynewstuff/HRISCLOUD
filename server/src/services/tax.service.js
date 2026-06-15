


// // src/services/tax.service.js
// //
// // Pure business logic for Group 3 — Tax Management.
// // All monetary values in KOBO (BigInt safe for arithmetic).
// // Every payment creates a journal entry via accounting.service.js.
// // Payroll data is pulled directly from payroll_runs + payroll_records.

// import { db } from "../config/db.js";
// import {
//   findAccountByCode,
//   createJournalEntry,
//   postJournalEntry,
//   writeAuditLog,
//   ValidationError,
//   NotFoundError,
//   ConflictError,
// } from "./accounting.service.js";

// // ─── Account code map for tax payments ───────────────────────
// const TAX_ACCOUNTS = {
//   VAT: { payable: "2200", bank: "1000" },
//   WHT: { payable: "2300", bank: "5030" },
//   PAYE: { payable: "2400", bank: "1000" },
//   Pension: { payable: "2500", bank: "1000" },
//   NHF: { payable: "2600", bank: "5030" },
//   NSITF: { payable: "2700", bank: "5030" },
// };

// export const TAX_DUE_RULES = [
//   { type: "VAT",     label: "VAT Filing",        dayOfMonth: 21,      recipient: "FIRS" },
//   { type: "WHT",     label: "WHT Remittance",     dayOfMonth: 21,      recipient: "FIRS" },
//   { type: "PAYE",    label: "PAYE Remittance",    dayOfMonth: 10,      recipient: "FIRS" },
//   { type: "Pension", label: "Pension Remittance", daysAfterPayroll: 7, recipient: "PFA" },
//   { type: "NHF",     label: "NHF Remittance",     dayOfMonth: 21,      recipient: "Federal Mortgage Bank" },
//   { type: "NSITF",   label: "NSITF Remittance",   dayOfMonth: 21,      recipient: "NSITF Office" },
// ];

// // ─── Tax payment JE helper ────────────────────────────────────
// async function createTaxPaymentJE({
//   companyId, createdBy, amount, entryDate,
//   description, taxType, source, sourceRefId,
// }) {
//   const codes = TAX_ACCOUNTS[taxType];
//   if (!codes) throw new ValidationError(`Unknown tax type: ${taxType}`);

//   const [payableAcct, bankAcct] = await Promise.all([
//     findAccountByCode(companyId, codes.payable),
//     findAccountByCode(companyId, codes.bank),
//   ]);

//   if (!payableAcct)
//     throw new ValidationError(`GL account ${codes.payable} (${taxType} Payable) not found. Run accounting setup first.`);
//   if (!bankAcct)
//     throw new ValidationError(`GL account ${codes.bank} (Bank Account) not found. Run accounting setup first.`);

//   const je = await createJournalEntry({
//     companyId, createdBy, entryDate, description,
//     source: source ?? "tax_payment",
//     sourceRefId: sourceRefId ?? null,
//     lines: [
//       { accountId: payableAcct.id, debitAmount: amount,  creditAmount: 0,      description: `${taxType} liability cleared` },
//       { accountId: bankAcct.id,    debitAmount: 0,        creditAmount: amount, description: `${taxType} payment disbursed` },
//     ],
//   });

//   await postJournalEntry(je.id, companyId, createdBy);
//   return je.id;
// }

// // ═════════════════════════════════════════════════════════════
// // TAX CONFIG
// // ═════════════════════════════════════════════════════════════

// export async function upsertTaxConfig({ companyId, taxType, rate, effectiveDate, notes, createdBy }) {
//   const result = await db.query(
//     `INSERT INTO tax_configs (company_id, tax_type, rate, effective_date, notes, created_by)
//      VALUES ($1,$2,$3,$4,$5,$6)
//      ON CONFLICT (company_id, tax_type)
//      DO UPDATE SET rate=$3, effective_date=$4, notes=$5, is_active=TRUE, updated_at=NOW()
//      RETURNING *`,
//     [companyId, taxType, rate, effectiveDate ?? new Date(), notes ?? null, createdBy],
//   );
//   await writeAuditLog({
//     companyId,
//     userId: createdBy,
//     action: "CREATE",
//     module: "TaxConfig",                // ✅ was "ChartOfAccounts"
//     recordId: result.rows[0].id,
//     newValue: result.rows[0],
//   });
//   return result.rows[0];
// }

// export async function getTaxConfigs(companyId) {
//   const result = await db.query(
//     "SELECT * FROM tax_configs WHERE company_id=$1 AND is_active=TRUE ORDER BY tax_type",
//     [companyId],
//   );
//   return result.rows;
// }

// export async function updateTaxConfig(id, companyId, payload) {
//   const existing = await db.query(
//     "SELECT * FROM tax_configs WHERE id=$1 AND company_id=$2",
//     [id, companyId],
//   );
//   if (!existing.rows.length) throw new NotFoundError("Tax config not found.");
//   const prev = existing.rows[0];

//   const updated = await db.query(
//     `UPDATE tax_configs
//      SET rate=$1, effective_date=$2, notes=$3, updated_at=NOW()
//      WHERE id=$4 AND company_id=$5
//      RETURNING *`,
//     [
//       payload.rate ?? prev.rate,
//       payload.effectiveDate ?? prev.effective_date,
//       payload.notes ?? prev.notes,
//       id,
//       companyId,
//     ],
//   );
//   return updated.rows[0];
// }

// export async function deactivateTaxConfig(id, companyId) {
//   const result = await db.query(
//     "UPDATE tax_configs SET is_active=FALSE, updated_at=NOW() WHERE id=$1 AND company_id=$2 RETURNING *",
//     [id, companyId],
//   );
//   if (!result.rows.length) throw new NotFoundError("Tax config not found.");
//   return result.rows[0];
// }

// // ═════════════════════════════════════════════════════════════
// // VAT
// // ═════════════════════════════════════════════════════════════

// // export async function getOrBuildVatSummary(companyId, period) {
// //   const [year, month] = period.split("-");
// //   const periodStart = `${year}-${month}-01`;
// //   const periodEnd = new Date(parseInt(year), parseInt(month), 0).toISOString().split("T")[0];

// //   let totalVatCollected = 0n;
// //   let totalSales = 0n;
// //   try {
// //     const invRes = await db.query(
// //       `SELECT COALESCE(SUM(vat_amount_kobo),0) AS vat, COALESCE(SUM(subtotal_kobo),0) AS sales
// //        FROM invoices
// //        WHERE company_id=$1 AND invoice_date BETWEEN $2 AND $3 AND status IN ('Sent','Paid')`,
// //       [companyId, periodStart, periodEnd],
// //     );
// //     totalVatCollected = BigInt(Math.round(Number(invRes.rows[0].vat ?? 0)));
// //     totalSales        = BigInt(Math.round(Number(invRes.rows[0].sales ?? 0)));
// //   } catch { /* invoices table may not exist */ }

// //   let totalVatRecoverable = 0n;
// //   let totalPurchases = 0n;
// //   try {
// //     const billRes = await db.query(
// //       `SELECT COALESCE(SUM(vat_amount_kobo),0) AS vat, COALESCE(SUM(subtotal_kobo),0) AS purch
// //        FROM bills
// //        WHERE company_id=$1 AND bill_date BETWEEN $2 AND $3 AND status IN ('Approved','Paid')`,
// //       [companyId, periodStart, periodEnd],
// //     );
// //     totalVatRecoverable = BigInt(Math.round(Number(billRes.rows[0].vat ?? 0)));
// //     totalPurchases      = BigInt(Math.round(Number(billRes.rows[0].purch ?? 0)));
// //   } catch { /* bills table may not exist */ }

// //   const result = await db.query(
// //     `INSERT INTO vat_records
// //        (company_id, period, total_sales_kobo, total_vat_collected,
// //         total_purchases_kobo, total_vat_recoverable)
// //      VALUES ($1,$2,$3,$4,$5,$6)
// //      ON CONFLICT (company_id, period) DO UPDATE SET
// //        total_sales_kobo      = EXCLUDED.total_sales_kobo,
// //        total_vat_collected   = EXCLUDED.total_vat_collected,
// //        total_purchases_kobo  = EXCLUDED.total_purchases_kobo,
// //        total_vat_recoverable = EXCLUDED.total_vat_recoverable,
// //        updated_at            = NOW()
// //      RETURNING *`,
// //     [companyId, period, totalSales.toString(), totalVatCollected.toString(),
// //      totalPurchases.toString(), totalVatRecoverable.toString()],
// //   );
// //   return result.rows[0];
// // }


// export async function getOrBuildVatSummary(companyId, period) {
//   const [year, month] = period.split("-");
//   const periodStart = `${year}-${month}-01`;
//   const periodEnd = new Date(parseInt(year), parseInt(month), 0)
//     .toISOString()
//     .split("T")[0];

//   let totalVatCollected = 0n;
//   let totalSales = 0n;
//   let totalVatRecoverable = 0n;
//   let totalPurchases = 0n;

//   // ── 1. Try invoices table (may not exist) ──────────────────
//   try {
//     const invRes = await db.query(
//       `SELECT COALESCE(SUM(vat_amount_kobo),0) AS vat,
//               COALESCE(SUM(subtotal_kobo),0)   AS sales
//        FROM invoices
//        WHERE company_id=$1
//          AND invoice_date BETWEEN $2 AND $3
//          AND status IN ('Sent','Paid')`,
//       [companyId, periodStart, periodEnd],
//     );
//     totalVatCollected = BigInt(Math.round(Number(invRes.rows[0].vat ?? 0)));
//     totalSales = BigInt(Math.round(Number(invRes.rows[0].sales ?? 0)));
//   } catch {
//     /* invoices table may not exist */
//   }

//   // ── 2. Try bills table (may not exist) ────────────────────
//   try {
//     const billRes = await db.query(
//       `SELECT COALESCE(SUM(vat_amount_kobo),0) AS vat,
//               COALESCE(SUM(subtotal_kobo),0)   AS purch
//        FROM bills
//        WHERE company_id=$1
//          AND bill_date BETWEEN $2 AND $3
//          AND status IN ('Approved','Paid')`,
//       [companyId, periodStart, periodEnd],
//     );
//     totalVatRecoverable = BigInt(Math.round(Number(billRes.rows[0].vat ?? 0)));
//     totalPurchases = BigInt(Math.round(Number(billRes.rows[0].purch ?? 0)));
//   } catch {
//     /* bills table may not exist */
//   }

//   // ── 3. FALLBACK: read directly from VAT Payable GL account ─
//   // If invoices/bills gave us nothing, pull credits (VAT collected)
//   // and debits (VAT paid/recovered) from the 2200 account's journal lines.
//   if (totalVatCollected === 0n && totalVatRecoverable === 0n) {
//     try {
//       const glRes = await db.query(
//         `SELECT
//            COALESCE(SUM(jel.credit_amount), 0) AS credits,
//            COALESCE(SUM(jel.debit_amount),  0) AS debits
//          FROM journal_entry_lines jel
//          JOIN journal_entries je
//            ON je.id = jel.journal_entry_id
//           AND je.status = 'Posted'
//           AND je.entry_date BETWEEN $2 AND $3
//          JOIN chart_of_accounts coa
//            ON coa.id = jel.account_id
//           AND coa.account_code = '2200'
//           AND coa.company_id = $1
//          WHERE je.company_id = $1`,
//         [companyId, periodStart, periodEnd],
//       );
//       // Credits on a liability account = VAT collected (output VAT)
//       // Debits on a liability account  = VAT paid/cleared (input VAT / payments)
//       totalVatCollected = BigInt(
//         Math.round(Number(glRes.rows[0].credits ?? 0)),
//       );
//       totalVatRecoverable = BigInt(
//         Math.round(Number(glRes.rows[0].debits ?? 0)),
//       );
//     } catch (e) {
//       console.error("VAT GL fallback failed:", e.message);
//     }
//   }

//   const result = await db.query(
//     `INSERT INTO vat_records
//        (company_id, period, total_sales_kobo, total_vat_collected,
//         total_purchases_kobo, total_vat_recoverable)
//      VALUES ($1,$2,$3,$4,$5,$6)
//      ON CONFLICT (company_id, period) DO UPDATE SET
//        total_sales_kobo      = EXCLUDED.total_sales_kobo,
//        total_vat_collected   = EXCLUDED.total_vat_collected,
//        total_purchases_kobo  = EXCLUDED.total_purchases_kobo,
//        total_vat_recoverable = EXCLUDED.total_vat_recoverable,
//        updated_at            = NOW()
//      RETURNING *`,
//     [
//       companyId,
//       period,
//       totalSales.toString(),
//       totalVatCollected.toString(),
//       totalPurchases.toString(),
//       totalVatRecoverable.toString(),
//     ],
//   );
//   return result.rows[0];
// }

// export async function fileVat(companyId, period, userId) {
//   const rec = await db.query(
//     "SELECT * FROM vat_records WHERE company_id=$1 AND period=$2",
//     [companyId, period],
//   );
//   if (!rec.rows.length) throw new NotFoundError(`No VAT record for period ${period}.`);
//   if (rec.rows[0].status !== "Open")
//     throw new ConflictError(`VAT period ${period} is already ${rec.rows[0].status}.`);

//   const updated = await db.query(
//     `UPDATE vat_records SET status='Filed', filed_date=NOW(), updated_at=NOW()
//      WHERE company_id=$1 AND period=$2 RETURNING *`,
//     [companyId, period],
//   );
//   await writeAuditLog({
//     companyId,
//     userId,
//     action: "FILE",                      // ✅ was "UPDATE"
//     module: "VAT",                       // ✅ was "ChartOfAccounts"
//     recordId: updated.rows[0].id,
//     newValue: { status: "Filed", period },
//   });
//   return updated.rows[0];
// }

// export async function payVat({ companyId, period, amountPaid, paymentDate, paymentReference, userId }) {
//   const rec = await db.query(
//     "SELECT * FROM vat_records WHERE company_id=$1 AND period=$2",
//     [companyId, period],
//   );
//   if (!rec.rows.length) throw new NotFoundError(`No VAT record for period ${period}.`);
//   if (rec.rows[0].status === "Paid") throw new ConflictError("VAT already paid for this period.");

//   const jeId = await createTaxPaymentJE({
//     companyId, createdBy: userId, amount: BigInt(amountPaid),
//     entryDate: paymentDate, description: `VAT payment — ${period}`,
//     taxType: "VAT", source: "vat_payment", sourceRefId: rec.rows[0].id,
//   });

//   const updated = await db.query(
//     `UPDATE vat_records
//      SET status='Paid', payment_date=$1, payment_reference=$2,
//          journal_entry_id=$3, updated_at=NOW()
//      WHERE company_id=$4 AND period=$5
//      RETURNING *`,
//     [paymentDate, paymentReference, jeId, companyId, period],
//   );

//   await writeAuditLog({                  // ✅ was missing
//     companyId, userId,
//     action: "CREATE",
//     module: "VAT",
//     recordId: updated.rows[0].id,
//     newValue: { period, amountPaid: amountPaid.toString(), paymentReference, status: "Paid" },
//   });
//   return { record: updated.rows[0], journalEntryId: jeId };
// }

// export async function getVatHistory(companyId) {
//   const result = await db.query(
//     "SELECT * FROM vat_records WHERE company_id=$1 ORDER BY period DESC",
//     [companyId],
//   );
//   return result.rows;
// }

// // ═════════════════════════════════════════════════════════════
// // WHT
// // ═════════════════════════════════════════════════════════════

// export async function getWhtSummary(companyId, period) {
//   const conditions = ["company_id=$1"];
//   const params = [companyId];
//   if (period) { conditions.push("period=$2"); params.push(period); }
//   const result = await db.query(
//     `SELECT * FROM wht_records WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC`,
//     params,
//   );
//   return result.rows;
// }

// export async function remitWht({ companyId, period, totalAmount, remittanceDate, remittanceReference, userId }) {
//   const pending = await db.query(
//     "SELECT COUNT(*) FROM wht_records WHERE company_id=$1 AND period=$2 AND status='Pending'",
//     [companyId, period],
//   );
//   if (parseInt(pending.rows[0].count) === 0)
//     throw new NotFoundError(`No pending WHT records for period ${period}.`);

//   const jeId = await createTaxPaymentJE({
//     companyId, createdBy: userId, amount: BigInt(totalAmount),
//     entryDate: remittanceDate, description: `WHT remittance to FIRS — ${period}`,
//     taxType: "WHT", source: "wht_remittance",
//   });

//   await db.query(
//     `UPDATE wht_records
//      SET status='Remitted', remittance_date=$1, remittance_reference=$2, journal_entry_id=$3
//      WHERE company_id=$4 AND period=$5 AND status='Pending'`,
//     [remittanceDate, remittanceReference, jeId, companyId, period],
//   );

//   await writeAuditLog({
//     companyId, userId,
//     action: "REMIT",                     // ✅ was "UPDATE"
//     module: "WHT",                       // ✅ was "JournalEntry"
//     recordId: jeId,
//     newValue: { type: "WHT", period, totalAmount: totalAmount.toString(), remittanceReference },
//   });
//   return { period, journalEntryId: jeId, message: "WHT remitted to FIRS." };
// }

// export async function getWhtHistory(companyId) {
//   const result = await db.query(
//     `SELECT period,
//        SUM(wht_amount_kobo) AS total_remitted_kobo,
//        MAX(remittance_date) AS remittance_date,
//        MAX(remittance_reference) AS remittance_reference,
//        status
//      FROM wht_records
//      WHERE company_id=$1
//      GROUP BY company_id, period, status
//      ORDER BY period DESC`,
//     [companyId],
//   );
//   return result.rows;
// }

// // ═════════════════════════════════════════════════════════════
// // PAYE
// // ═════════════════════════════════════════════════════════════

// export async function buildPayeSummary(companyId, period) {
//   const [year, month] = period.split("-").map(Number);
//   const result = await db.query(
//     `SELECT
//        COALESCE(SUM(pr.gross_salary), 0) AS total_gross,
//        COALESCE(SUM(pr.paye_tax),     0) AS total_paye,
//        pr2.id AS payroll_run_id
//      FROM payroll_records pr
//      JOIN payroll_runs pr2 ON pr2.id = pr.payroll_run_id
//      WHERE pr.company_id=$1 AND pr.month=$2 AND pr.year=$3
//        AND pr.status IN ('paid','approved')
//      GROUP BY pr2.id
//      LIMIT 1`,
//     [companyId, month, year],
//   );
//   const row = result.rows[0];
//   const totalGross = row ? BigInt(Math.round(Number(row.total_gross) * 100)) : 0n;
//   const totalPaye  = row ? BigInt(Math.round(Number(row.total_paye)  * 100)) : 0n;
//   const payrollRunId = row?.payroll_run_id ?? null;

//   const upsert = await db.query(
//     `INSERT INTO paye_remittances
//        (company_id, period, payroll_run_id, total_gross_pay, total_paye)
//      VALUES ($1,$2,$3,$4,$5)
//      ON CONFLICT (company_id, period) DO UPDATE SET
//        total_gross_pay = EXCLUDED.total_gross_pay,
//        total_paye      = EXCLUDED.total_paye,
//        payroll_run_id  = EXCLUDED.payroll_run_id,
//        updated_at      = NOW()
//      RETURNING *`,
//     [companyId, period, payrollRunId, totalGross.toString(), totalPaye.toString()],
//   );
//   return upsert.rows[0];
// }

// export async function remitPaye({ companyId, period, remittanceDate, remittanceReference, userId }) {
//   const rec = await db.query(
//     "SELECT * FROM paye_remittances WHERE company_id=$1 AND period=$2",
//     [companyId, period],
//   );
//   if (!rec.rows.length) throw new NotFoundError(`No PAYE record for period ${period}.`);
//   if (rec.rows[0].status === "Remitted") throw new ConflictError("PAYE already remitted for this period.");

//   const amount = BigInt(rec.rows[0].total_paye);
//   if (amount <= 0n) throw new ValidationError("PAYE amount is zero — nothing to remit.");

//   const jeId = await createTaxPaymentJE({
//     companyId, createdBy: userId, amount,
//     entryDate: remittanceDate, description: `PAYE remittance to FIRS — ${period}`,
//     taxType: "PAYE", source: "paye_remittance", sourceRefId: rec.rows[0].id,
//   });

//   const updated = await db.query(
//     `UPDATE paye_remittances
//      SET status='Remitted', remittance_date=$1, remittance_reference=$2,
//          journal_entry_id=$3, updated_at=NOW()
//      WHERE company_id=$4 AND period=$5
//      RETURNING *`,
//     [remittanceDate, remittanceReference, jeId, companyId, period],
//   );

//   await writeAuditLog({                  // ✅ was missing
//     companyId, userId,
//     action: "REMIT",
//     module: "PAYE",
//     recordId: updated.rows[0].id,
//     newValue: { period, remittanceReference, status: "Remitted" },
//   });
//   return { record: updated.rows[0], journalEntryId: jeId };
// }

// export async function getPayeHistory(companyId) {
//   const result = await db.query(
//     "SELECT * FROM paye_remittances WHERE company_id=$1 ORDER BY period DESC",
//     [companyId],
//   );
//   return result.rows;
// }

// // ═════════════════════════════════════════════════════════════
// // STATUTORY DEDUCTIONS (Pension / NHF / NSITF)
// // ═════════════════════════════════════════════════════════════

// export async function buildStatutorySummary(companyId, period, deductionType) {
//   const [year, month] = period.split("-").map(Number);
//   const colMap = {
//     Pension: { emp: "pension_employee", empr: null },
//     NHF:     { emp: "nhf_deduction",    empr: null },
//     NSITF:   { emp: null,               empr: null },
//   };
//   const col = colMap[deductionType];
//   if (!col) throw new ValidationError(`Unknown deduction type: ${deductionType}`);

//   let employeeShare = 0n;
//   let employerShare = 0n;

//   // if (col.emp) {
//   //   const res = await db.query(
//   //     `SELECT COALESCE(SUM(pr.${col.emp}),0) AS total
//   //      FROM payroll_records pr
//   //      JOIN payroll_runs r ON r.id = pr.payroll_run_id
//   //      WHERE pr.company_id=$1 AND pr.month=$2 AND pr.year=$3
//   //        AND pr.status IN ('paid','approved')`,
//   //     [companyId, month, year],
//   //   );
//   //   employeeShare = BigInt(Math.round(Number(res.rows[0]?.total ?? 0)));
//   // }
//   if (col.emp) {
//     const res = await db.query(
//       `SELECT COALESCE(SUM(pr.${col.emp}),0) AS total
//      FROM payroll_records pr
//      JOIN payroll_runs r ON r.id = pr.payroll_run_id
//      WHERE pr.company_id=$1 AND pr.month=$2 AND pr.year=$3
//        AND pr.status IN ('paid','approved')`,
//       [companyId, month, year],
//     );
//     // pension_employee is stored in NAIRA — convert to kobo
//     employeeShare = BigInt(Math.round(Number(res.rows[0]?.total ?? 0) * 100));
//   }

//   if (deductionType === "NSITF") {
//     const res = await db.query(
//       `SELECT COALESCE(SUM((pr.deductions_breakdown->>'NSITF')::NUMERIC),0) AS total
//        FROM payroll_records pr
//        WHERE pr.company_id=$1 AND pr.month=$2 AND pr.year=$3
//          AND pr.status IN ('paid','approved')`,
//       [companyId, month, year],
//     );
//    employerShare = BigInt(Math.round(Number(res.rows[0]?.total ?? 0) * 100));
//   }

//   const payrollRunRes = await db.query(
//     `SELECT id FROM payroll_runs
//      WHERE company_id=$1 AND month=$2 AND year=$3
//        AND status IN ('paid','approved')
//      ORDER BY created_at DESC LIMIT 1`,
//     [companyId, month, year],
//   );
//   const payrollRunId = payrollRunRes.rows[0]?.id ?? null;

//   const upsert = await db.query(
//     `INSERT INTO statutory_remittances
//        (company_id, deduction_type, period, payroll_run_id,
//         total_employee_share, total_employer_share)
//      VALUES ($1,$2,$3,$4,$5,$6)
//      ON CONFLICT (company_id, deduction_type, period) DO UPDATE SET
//        total_employee_share = EXCLUDED.total_employee_share,
//        total_employer_share = EXCLUDED.total_employer_share,
//        payroll_run_id       = EXCLUDED.payroll_run_id,
//        updated_at           = NOW()
//      RETURNING *`,
//     [companyId, deductionType, period, payrollRunId,
//      employeeShare.toString(), employerShare.toString()],
//   );
//   return upsert.rows[0];
// }

// export async function remitStatutory({
//   companyId,
//   period,
//   deductionType,
//   remittanceDate,
//   remittanceReference,
//   remittedTo,
//   userId,
// }) {
//   const rec = await db.query(
//     "SELECT * FROM statutory_remittances WHERE company_id=$1 AND period=$2 AND deduction_type=$3",
//     [companyId, period, deductionType],
//   );
//   if (!rec.rows.length)
//     throw new NotFoundError(`No ${deductionType} record for period ${period}.`);
//   if (rec.rows[0].status === "Remitted")
//     throw new ConflictError(
//       `${deductionType} already remitted for this period.`,
//     );

//   // const amount = BigInt(rec.rows[0].total_amount ?? rec.rows[0].total_employee_share);

//   // CORRECT — sum both shares (already stored in kobo after the fix above):
//   // const employeeShare = BigInt(rec.rows[0].total_employee_share ?? 0);
//   // const employerShare = BigInt(rec.rows[0].total_employer_share ?? 0);
//   // const amount = employeeShare + employerShare;
//   const employeeShare = BigInt(rec.rows[0].total_employee_share ?? 0);
//   const employerShare = BigInt(rec.rows[0].total_employer_share ?? 0);
//   const amount = employeeShare + employerShare;
//   if (amount <= 0n)
//     throw new ValidationError(
//       `${deductionType} amount is zero — nothing to remit.`,
//     );

//   const jeId = await createTaxPaymentJE({
//     companyId,
//     createdBy: userId,
//     amount,
//     entryDate: remittanceDate,
//     description: `${deductionType} remittance — ${period}`,
//     taxType: deductionType,
//     source: "statutory_remittance",
//     sourceRefId: rec.rows[0].id,
//   });

//   const updated = await db.query(
//     `UPDATE statutory_remittances
//      SET status='Remitted', remittance_date=$1, remittance_reference=$2,
//          remitted_to=$3, journal_entry_id=$4, updated_at=NOW()
//      WHERE company_id=$5 AND period=$6 AND deduction_type=$7
//      RETURNING *`,
//     [
//       remittanceDate,
//       remittanceReference,
//       remittedTo ?? null,
//       jeId,
//       companyId,
//       period,
//       deductionType,
//     ],
//   );

//   await writeAuditLog({
//     // ✅ was missing
//     companyId,
//     userId,
//     action: "REMIT",
//     module: "Statutory",
//     recordId: updated.rows[0].id,
//     newValue: {
//       period,
//       deductionType,
//       remittanceReference,
//       remittedTo,
//       status: "Remitted",
//     },
//   });
//   return { record: updated.rows[0], journalEntryId: jeId };
// }

// export async function getStatutoryHistory(companyId, deductionType) {
//   const result = await db.query(
//     "SELECT * FROM statutory_remittances WHERE company_id=$1 AND deduction_type=$2 ORDER BY period DESC",
//     [companyId, deductionType],
//   );
//   return result.rows;
// }

// // ═════════════════════════════════════════════════════════════
// // TAX CALENDAR
// // ═════════════════════════════════════════════════════════════

// // export async function buildTaxCalendar(companyId, overdueOnly = false) {
// //   const now   = new Date();
// //   const year  = now.getFullYear();
// //   const month = now.getMonth() + 1;
// //   const items = [];

// //   for (const rule of TAX_DUE_RULES) {
// //     let dueDate;
// //     if (rule.dayOfMonth) {
// //       dueDate = new Date(year, month - 1, rule.dayOfMonth);
// //     } else {
// //       dueDate = new Date(year, month, rule.daysAfterPayroll ?? 7);
// //     }

// //     const isOverdue = dueDate < now;
// //     const daysUntil = Math.ceil((dueDate - now) / 86400000);
// //     if (overdueOnly && !isOverdue) continue;

// //     let status = "Pending";
// //     const period = `${year}-${String(month).padStart(2, "0")}`;

// //     if (rule.type === "VAT") {
// //       const r = await db.query(
// //         "SELECT status FROM vat_records WHERE company_id=$1 AND period=$2",
// //         [companyId, period],
// //       );
// //       if (r.rows.length) status = r.rows[0].status === "Open" ? "Pending" : r.rows[0].status;
// //     } else if (rule.type === "WHT") {
// //       const r = await db.query(
// //         "SELECT COUNT(*) FROM wht_records WHERE company_id=$1 AND period=$2 AND status='Pending'",
// //         [companyId, period],
// //       );
// //       status = parseInt(r.rows[0].count) === 0 ? "Clear" : "Pending";
// //     } else if (rule.type === "PAYE") {
// //       const r = await db.query(
// //         "SELECT status FROM paye_remittances WHERE company_id=$1 AND period=$2",
// //         [companyId, period],
// //       );
// //       if (r.rows.length) status = r.rows[0].status;
// //     } else {
// //       const r = await db.query(
// //         "SELECT status FROM statutory_remittances WHERE company_id=$1 AND period=$2 AND deduction_type=$3",
// //         [companyId, period, rule.type],
// //       );
// //       if (r.rows.length) status = r.rows[0].status;
// //     }

// //     items.push({ taxType: rule.type, label: rule.label, recipient: rule.recipient,
// //                  dueDate: dueDate.toISOString().split("T")[0], period, status, isOverdue, daysUntil });
// //   }

// //   return items;
// // }

// export async function buildTaxCalendar(companyId, overdueOnly = false) {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = now.getMonth() + 1;
//   const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//   const items = [];

//   for (const rule of TAX_DUE_RULES) {
//     let dueDate;
//     if (rule.dayOfMonth) {
//       dueDate = new Date(year, month - 1, rule.dayOfMonth);
//     } else {
//       dueDate = new Date(year, month, rule.daysAfterPayroll ?? 7);
//     }

//     const isOverdue = dueDate < today;
//     const daysUntil = Math.ceil((dueDate - today) / 86400000);

//     // ── Only show if due within 14 days OR already overdue ──
//     const isDueSoon = daysUntil >= 0 && daysUntil <= 14;
//     if (!isOverdue && !isDueSoon) continue;

//     const period = `${year}-${String(month).padStart(2, "0")}`;
//     let status = "Pending";

//     if (rule.type === "VAT") {
//       const r = await db.query(
//         "SELECT status FROM vat_records WHERE company_id=$1 AND period=$2",
//         [companyId, period],
//       );
//       if (r.rows.length)
//         status = r.rows[0].status === "Open" ? "Pending" : r.rows[0].status;
//     } else if (rule.type === "WHT") {
//       const r = await db.query(
//         "SELECT COUNT(*) FROM wht_records WHERE company_id=$1 AND period=$2 AND status='Pending'",
//         [companyId, period],
//       );
//       status = parseInt(r.rows[0].count) === 0 ? "Clear" : "Pending";
//     } else if (rule.type === "PAYE") {
//       const r = await db.query(
//         "SELECT status FROM paye_remittances WHERE company_id=$1 AND period=$2",
//         [companyId, period],
//       );
//       if (r.rows.length) status = r.rows[0].status;
//     } else {
//       const r = await db.query(
//         "SELECT status FROM statutory_remittances WHERE company_id=$1 AND period=$2 AND deduction_type=$3",
//         [companyId, period, rule.type],
//       );
//       if (r.rows.length) status = r.rows[0].status;
//     }

//     // ── Hide if already paid/remitted/filed ──
//     const doneStatuses = ["Paid", "Remitted", "Filed", "Clear"];
//     if (doneStatuses.includes(status)) continue;

//     if (overdueOnly && !isOverdue) continue;

//     items.push({
//       taxType: rule.type,
//       label: rule.label,
//       recipient: rule.recipient,
//       dueDate: dueDate.toISOString().split("T")[0],
//       period,
//       status,
//       isOverdue,
//       daysUntil,
//     });
//   }

//   return items;
// }

// // // src/services/tax.service.js
// // //
// // // Pure business logic for Group 3 — Tax Management.
// // // All monetary values in KOBO (BigInt safe for arithmetic).
// // // Every payment creates a journal entry via accounting.service.js.
// // // Payroll data is pulled directly from payroll_runs + payroll_records.
// // //
// // // FIX SUMMARY:
// // // 1. buildPayeSummary: payroll_records stores gross_salary and paye_tax in NAIRA
// // //    (not kobo). The previous code multiplied by 100 correctly BUT only for
// // //    rows that exist. Now also widens the status filter to include 'processing'
// // //    and 'draft' runs that have been processed, and falls back to the run-level
// // //    totals if no individual records are found.
// // //
// // // 2. buildStatutorySummary: pension_employee and nhf_deduction in payroll_records
// // //    are NAIRA values. Previous code did NOT multiply by 100, storing them as
// // //    naira-as-kobo (100x too small). Now consistently converts naira → kobo (* 100).
// // //    Also fixes the total_amount read in remitStatutory (column doesn't exist;
// // //    use total_employee_share + total_employer_share instead).
// // //
// // // 3. remitStatutory: was reading non-existent total_amount column. Now correctly
// // //    sums total_employee_share + total_employer_share.
// // //
// // // 4. Status filter broadened: payroll_records.status includes 'approved', 'paid',
// // //    and sometimes 'processing' (when run completes but records haven't been
// // //    individually approved yet). Now catches all processed states.

// // import { db } from "../config/db.js";
// // import {
// //   findAccountByCode,
// //   createJournalEntry,
// //   postJournalEntry,
// //   writeAuditLog,
// //   ValidationError,
// //   NotFoundError,
// //   ConflictError,
// // } from "./accounting.service.js";

// // // ─── Account code map for tax payments ───────────────────────
// // const TAX_ACCOUNTS = {
// //   VAT:    { payable: "2200", bank: "1002" },
// //   WHT:    { payable: "2300", bank: "1002" },
// //   PAYE:   { payable: "2400", bank: "1002" },
// //   Pension:{ payable: "2500", bank: "1002" },
// //   NHF:    { payable: "2600", bank: "1002" },
// //   NSITF:  { payable: "2700", bank: "1002" },
// // };

// // export const TAX_DUE_RULES = [
// //   { type: "VAT",     label: "VAT Filing",        dayOfMonth: 21,      recipient: "FIRS" },
// //   { type: "WHT",     label: "WHT Remittance",     dayOfMonth: 21,      recipient: "FIRS" },
// //   { type: "PAYE",    label: "PAYE Remittance",    dayOfMonth: 10,      recipient: "FIRS" },
// //   { type: "Pension", label: "Pension Remittance", daysAfterPayroll: 7, recipient: "PFA" },
// //   { type: "NHF",     label: "NHF Remittance",     dayOfMonth: 21,      recipient: "Federal Mortgage Bank" },
// //   { type: "NSITF",   label: "NSITF Remittance",   dayOfMonth: 21,      recipient: "NSITF Office" },
// // ];

// // // ─── Tax payment JE helper ────────────────────────────────────
// // async function createTaxPaymentJE({
// //   companyId, createdBy, amount, entryDate,
// //   description, taxType, source, sourceRefId,
// // }) {
// //   const codes = TAX_ACCOUNTS[taxType];
// //   if (!codes) throw new ValidationError(`Unknown tax type: ${taxType}`);

// //   const [payableAcct, bankAcct] = await Promise.all([
// //     findAccountByCode(companyId, codes.payable),
// //     findAccountByCode(companyId, codes.bank),
// //   ]);

// //   if (!payableAcct)
// //     throw new ValidationError(`GL account ${codes.payable} (${taxType} Payable) not found. Run accounting setup first.`);
// //   if (!bankAcct)
// //     throw new ValidationError(`GL account ${codes.bank} (Bank Account) not found. Run accounting setup first.`);

// //   const je = await createJournalEntry({
// //     companyId, createdBy, entryDate, description,
// //     source: source ?? "tax_payment",
// //     sourceRefId: sourceRefId ?? null,
// //     lines: [
// //       { accountId: payableAcct.id, debitAmount: amount,  creditAmount: 0,      description: `${taxType} liability cleared` },
// //       { accountId: bankAcct.id,    debitAmount: 0,        creditAmount: amount, description: `${taxType} payment disbursed` },
// //     ],
// //   });

// //   await postJournalEntry(je.id, companyId, createdBy);
// //   return je.id;
// // }

// // // ═════════════════════════════════════════════════════════════
// // // TAX CONFIG
// // // ═════════════════════════════════════════════════════════════

// // export async function upsertTaxConfig({ companyId, taxType, rate, effectiveDate, notes, createdBy }) {
// //   const result = await db.query(
// //     `INSERT INTO tax_configs (company_id, tax_type, rate, effective_date, notes, created_by)
// //      VALUES ($1,$2,$3,$4,$5,$6)
// //      ON CONFLICT (company_id, tax_type)
// //      DO UPDATE SET rate=$3, effective_date=$4, notes=$5, is_active=TRUE, updated_at=NOW()
// //      RETURNING *`,
// //     [companyId, taxType, rate, effectiveDate ?? new Date(), notes ?? null, createdBy],
// //   );
// //   await writeAuditLog({
// //     companyId,
// //     userId: createdBy,
// //     action: "CREATE",
// //     module: "TaxConfig",
// //     recordId: result.rows[0].id,
// //     newValue: result.rows[0],
// //   });
// //   return result.rows[0];
// // }

// // export async function getTaxConfigs(companyId) {
// //   const result = await db.query(
// //     "SELECT * FROM tax_configs WHERE company_id=$1 AND is_active=TRUE ORDER BY tax_type",
// //     [companyId],
// //   );
// //   return result.rows;
// // }

// // export async function updateTaxConfig(id, companyId, payload) {
// //   const existing = await db.query(
// //     "SELECT * FROM tax_configs WHERE id=$1 AND company_id=$2",
// //     [id, companyId],
// //   );
// //   if (!existing.rows.length) throw new NotFoundError("Tax config not found.");
// //   const prev = existing.rows[0];

// //   const updated = await db.query(
// //     `UPDATE tax_configs
// //      SET rate=$1, effective_date=$2, notes=$3, updated_at=NOW()
// //      WHERE id=$4 AND company_id=$5
// //      RETURNING *`,
// //     [
// //       payload.rate ?? prev.rate,
// //       payload.effectiveDate ?? prev.effective_date,
// //       payload.notes ?? prev.notes,
// //       id,
// //       companyId,
// //     ],
// //   );
// //   return updated.rows[0];
// // }

// // export async function deactivateTaxConfig(id, companyId) {
// //   const result = await db.query(
// //     "UPDATE tax_configs SET is_active=FALSE, updated_at=NOW() WHERE id=$1 AND company_id=$2 RETURNING *",
// //     [id, companyId],
// //   );
// //   if (!result.rows.length) throw new NotFoundError("Tax config not found.");
// //   return result.rows[0];
// // }

// // // ═════════════════════════════════════════════════════════════
// // // VAT
// // // ═════════════════════════════════════════════════════════════

// // export async function getOrBuildVatSummary(companyId, period) {
// //   const [year, month] = period.split("-");
// //   const periodStart = `${year}-${month}-01`;
// //   const periodEnd = new Date(parseInt(year), parseInt(month), 0).toISOString().split("T")[0];

// //   let totalVatCollected = 0n;
// //   let totalSales = 0n;
// //   try {
// //     const invRes = await db.query(
// //       `SELECT COALESCE(SUM(vat_amount_kobo),0) AS vat, COALESCE(SUM(subtotal_kobo),0) AS sales
// //        FROM invoices
// //        WHERE company_id=$1 AND invoice_date BETWEEN $2 AND $3 AND status IN ('Sent','Paid')`,
// //       [companyId, periodStart, periodEnd],
// //     );
// //     totalVatCollected = BigInt(Math.round(Number(invRes.rows[0].vat ?? 0)));
// //     totalSales        = BigInt(Math.round(Number(invRes.rows[0].sales ?? 0)));
// //   } catch { /* invoices table may not exist */ }

// //   let totalVatRecoverable = 0n;
// //   let totalPurchases = 0n;
// //   try {
// //     const billRes = await db.query(
// //       `SELECT COALESCE(SUM(vat_amount_kobo),0) AS vat, COALESCE(SUM(subtotal_kobo),0) AS purch
// //        FROM bills
// //        WHERE company_id=$1 AND bill_date BETWEEN $2 AND $3 AND status IN ('Approved','Paid')`,
// //       [companyId, periodStart, periodEnd],
// //     );
// //     totalVatRecoverable = BigInt(Math.round(Number(billRes.rows[0].vat ?? 0)));
// //     totalPurchases      = BigInt(Math.round(Number(billRes.rows[0].purch ?? 0)));
// //   } catch { /* bills table may not exist */ }

// //   const result = await db.query(
// //     `INSERT INTO vat_records
// //        (company_id, period, total_sales_kobo, total_vat_collected,
// //         total_purchases_kobo, total_vat_recoverable)
// //      VALUES ($1,$2,$3,$4,$5,$6)
// //      ON CONFLICT (company_id, period) DO UPDATE SET
// //        total_sales_kobo      = EXCLUDED.total_sales_kobo,
// //        total_vat_collected   = EXCLUDED.total_vat_collected,
// //        total_purchases_kobo  = EXCLUDED.total_purchases_kobo,
// //        total_vat_recoverable = EXCLUDED.total_vat_recoverable,
// //        updated_at            = NOW()
// //      RETURNING *`,
// //     [companyId, period, totalSales.toString(), totalVatCollected.toString(),
// //      totalPurchases.toString(), totalVatRecoverable.toString()],
// //   );
// //   return result.rows[0];
// // }

// // export async function fileVat(companyId, period, userId) {
// //   const rec = await db.query(
// //     "SELECT * FROM vat_records WHERE company_id=$1 AND period=$2",
// //     [companyId, period],
// //   );
// //   if (!rec.rows.length) throw new NotFoundError(`No VAT record for period ${period}.`);
// //   if (rec.rows[0].status !== "Open")
// //     throw new ConflictError(`VAT period ${period} is already ${rec.rows[0].status}.`);

// //   const updated = await db.query(
// //     `UPDATE vat_records SET status='Filed', filed_date=NOW(), updated_at=NOW()
// //      WHERE company_id=$1 AND period=$2 RETURNING *`,
// //     [companyId, period],
// //   );
// //   await writeAuditLog({
// //     companyId,
// //     userId,
// //     action: "FILE",
// //     module: "VAT",
// //     recordId: updated.rows[0].id,
// //     newValue: { status: "Filed", period },
// //   });
// //   return updated.rows[0];
// // }

// // export async function payVat({ companyId, period, amountPaid, paymentDate, paymentReference, userId }) {
// //   const rec = await db.query(
// //     "SELECT * FROM vat_records WHERE company_id=$1 AND period=$2",
// //     [companyId, period],
// //   );
// //   if (!rec.rows.length) throw new NotFoundError(`No VAT record for period ${period}.`);
// //   if (rec.rows[0].status === "Paid") throw new ConflictError("VAT already paid for this period.");

// //   const jeId = await createTaxPaymentJE({
// //     companyId, createdBy: userId, amount: BigInt(amountPaid),
// //     entryDate: paymentDate, description: `VAT payment — ${period}`,
// //     taxType: "VAT", source: "vat_payment", sourceRefId: rec.rows[0].id,
// //   });

// //   const updated = await db.query(
// //     `UPDATE vat_records
// //      SET status='Paid', payment_date=$1, payment_reference=$2,
// //          journal_entry_id=$3, updated_at=NOW()
// //      WHERE company_id=$4 AND period=$5
// //      RETURNING *`,
// //     [paymentDate, paymentReference, jeId, companyId, period],
// //   );

// //   await writeAuditLog({
// //     companyId, userId,
// //     action: "CREATE",
// //     module: "VAT",
// //     recordId: updated.rows[0].id,
// //     newValue: { period, amountPaid: amountPaid.toString(), paymentReference, status: "Paid" },
// //   });
// //   return { record: updated.rows[0], journalEntryId: jeId };
// // }

// // export async function getVatHistory(companyId) {
// //   const result = await db.query(
// //     "SELECT * FROM vat_records WHERE company_id=$1 ORDER BY period DESC",
// //     [companyId],
// //   );
// //   return result.rows;
// // }

// // // ═════════════════════════════════════════════════════════════
// // // WHT
// // // ═════════════════════════════════════════════════════════════

// // export async function getWhtSummary(companyId, period) {
// //   const conditions = ["company_id=$1"];
// //   const params = [companyId];
// //   if (period) { conditions.push("period=$2"); params.push(period); }
// //   const result = await db.query(
// //     `SELECT * FROM wht_records WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC`,
// //     params,
// //   );
// //   return result.rows;
// // }

// // export async function remitWht({ companyId, period, totalAmount, remittanceDate, remittanceReference, userId }) {
// //   const pending = await db.query(
// //     "SELECT COUNT(*) FROM wht_records WHERE company_id=$1 AND period=$2 AND status='Pending'",
// //     [companyId, period],
// //   );
// //   if (parseInt(pending.rows[0].count) === 0)
// //     throw new NotFoundError(`No pending WHT records for period ${period}.`);

// //   const jeId = await createTaxPaymentJE({
// //     companyId, createdBy: userId, amount: BigInt(totalAmount),
// //     entryDate: remittanceDate, description: `WHT remittance to FIRS — ${period}`,
// //     taxType: "WHT", source: "wht_remittance",
// //   });

// //   await db.query(
// //     `UPDATE wht_records
// //      SET status='Remitted', remittance_date=$1, remittance_reference=$2, journal_entry_id=$3
// //      WHERE company_id=$4 AND period=$5 AND status='Pending'`,
// //     [remittanceDate, remittanceReference, jeId, companyId, period],
// //   );

// //   await writeAuditLog({
// //     companyId, userId,
// //     action: "REMIT",
// //     module: "WHT",
// //     recordId: jeId,
// //     newValue: { type: "WHT", period, totalAmount: totalAmount.toString(), remittanceReference },
// //   });
// //   return { period, journalEntryId: jeId, message: "WHT remitted to FIRS." };
// // }

// // export async function getWhtHistory(companyId) {
// //   const result = await db.query(
// //     `SELECT period,
// //        SUM(wht_amount_kobo) AS total_remitted_kobo,
// //        MAX(remittance_date) AS remittance_date,
// //        MAX(remittance_reference) AS remittance_reference,
// //        status
// //      FROM wht_records
// //      WHERE company_id=$1
// //      GROUP BY company_id, period, status
// //      ORDER BY period DESC`,
// //     [companyId],
// //   );
// //   return result.rows;
// // }

// // // ═════════════════════════════════════════════════════════════
// // // PAYE
// // // ═════════════════════════════════════════════════════════════

// // // FIX: payroll_records stores gross_salary and paye_tax in NAIRA.
// // // We convert to kobo (* 100) before storing in paye_remittances so
// // // the JE amounts are consistent with the rest of the accounting system.
// // // We also widen the status filter to catch all "processed" states:
// // //   payroll_records.status: 'approved' | 'paid' (set by approvePayrollRun / markPayrollPaid)
// // //   payroll_runs.status:    'approved' | 'paid' (the run itself)
// // // If no records exist at the record level, we fall back to the run-level
// // // total_gross / total_deductions so the summary is never empty after processing.
// // export async function buildPayeSummary(companyId, period) {
// //   const [year, month] = period.split("-").map(Number);

// //   // Primary: sum from individual payroll_records (most accurate)
// //   const recordRes = await db.query(
// //     `SELECT
// //        COALESCE(SUM(pr.gross_salary), 0) AS total_gross,
// //        COALESCE(SUM(pr.paye_tax),     0) AS total_paye,
// //        MAX(pr.payroll_run_id)             AS payroll_run_id
// //      FROM payroll_records pr
// //      JOIN payroll_runs run ON run.id = pr.payroll_run_id
// //      WHERE pr.company_id = $1
// //        AND pr.month      = $2
// //        AND pr.year       = $3
// //        AND run.status    IN ('approved', 'paid', 'processing')`,
// //     [companyId, month, year],
// //   );

// //   let totalGrossNaira = Number(recordRes.rows[0]?.total_gross ?? 0);
// //   let totalPayeNaira  = Number(recordRes.rows[0]?.total_paye  ?? 0);
// //   let payrollRunId    = recordRes.rows[0]?.payroll_run_id ?? null;

// //   // Fallback: if records aren't there yet, pull from the run totals
// //   // (run.total_gross is also naira)
// //   if (totalGrossNaira === 0 || totalPayeNaira === 0) {
// //     const runRes = await db.query(
// //       `SELECT id, total_gross, total_deductions, total_net
// //        FROM payroll_runs
// //        WHERE company_id = $1
// //          AND month      = $2
// //          AND year       = $3
// //          AND status     IN ('approved', 'paid', 'processing')
// //        ORDER BY created_at DESC
// //        LIMIT 1`,
// //       [companyId, month, year],
// //     );
// //     if (runRes.rows.length > 0) {
// //       const run = runRes.rows[0];
// //       payrollRunId = run.id;
// //       // Use run-level totals if record-level are zero
// //       if (totalGrossNaira === 0) totalGrossNaira = Number(run.total_gross ?? 0);
// //       // total_paye isn't stored at run level; keep record-level value (may stay 0
// //       // until individual records are queried — that's expected for the fallback).
// //       // We still store the run's gross so the summary isn't blank.
// //     }
// //   }

// //   // Convert naira → kobo for storage (consistent with rest of accounting system)
// //   const totalGrossKobo = BigInt(Math.round(totalGrossNaira * 100));
// //   const totalPayeKobo  = BigInt(Math.round(totalPayeNaira  * 100));

// //   const upsert = await db.query(
// //     `INSERT INTO paye_remittances
// //        (company_id, period, payroll_run_id, total_gross_pay, total_paye)
// //      VALUES ($1,$2,$3,$4,$5)
// //      ON CONFLICT (company_id, period) DO UPDATE SET
// //        total_gross_pay = EXCLUDED.total_gross_pay,
// //        total_paye      = EXCLUDED.total_paye,
// //        payroll_run_id  = EXCLUDED.payroll_run_id,
// //        updated_at      = NOW()
// //      RETURNING *`,
// //     [companyId, period, payrollRunId, totalGrossKobo.toString(), totalPayeKobo.toString()],
// //   );
// //   return upsert.rows[0];
// // }

// // export async function remitPaye({ companyId, period, remittanceDate, remittanceReference, userId }) {
// //   const rec = await db.query(
// //     "SELECT * FROM paye_remittances WHERE company_id=$1 AND period=$2",
// //     [companyId, period],
// //   );
// //   if (!rec.rows.length) throw new NotFoundError(`No PAYE record for period ${period}. Run payroll first.`);
// //   if (rec.rows[0].status === "Remitted") throw new ConflictError("PAYE already remitted for this period.");

// //   const amount = BigInt(rec.rows[0].total_paye);
// //   if (amount <= 0n) throw new ValidationError("PAYE amount is zero. Ensure payroll has been processed and approved for this period.");

// //   const jeId = await createTaxPaymentJE({
// //     companyId, createdBy: userId, amount,
// //     entryDate: remittanceDate, description: `PAYE remittance to FIRS — ${period}`,
// //     taxType: "PAYE", source: "paye_remittance", sourceRefId: rec.rows[0].id,
// //   });

// //   const updated = await db.query(
// //     `UPDATE paye_remittances
// //      SET status='Remitted', remittance_date=$1, remittance_reference=$2,
// //          journal_entry_id=$3, updated_at=NOW()
// //      WHERE company_id=$4 AND period=$5
// //      RETURNING *`,
// //     [remittanceDate, remittanceReference, jeId, companyId, period],
// //   );

// //   await writeAuditLog({
// //     companyId, userId,
// //     action: "REMIT",
// //     module: "PAYE",
// //     recordId: updated.rows[0].id,
// //     newValue: { period, remittanceReference, status: "Remitted" },
// //   });
// //   return { record: updated.rows[0], journalEntryId: jeId };
// // }

// // export async function getPayeHistory(companyId) {
// //   const result = await db.query(
// //     "SELECT * FROM paye_remittances WHERE company_id=$1 ORDER BY period DESC",
// //     [companyId],
// //   );
// //   return result.rows;
// // }

// // // ═════════════════════════════════════════════════════════════
// // // STATUTORY DEDUCTIONS (Pension / NHF / NSITF)
// // // ═════════════════════════════════════════════════════════════

// // // FIX: payroll_records.pension_employee and nhf_deduction are stored in NAIRA.
// // // Previous code used BigInt(Math.round(Number(val))) without * 100,
// // // so it was storing naira values in a kobo column — 100x too small.
// // // Now we multiply by 100 to convert naira → kobo before storage.
// // export async function buildStatutorySummary(companyId, period, deductionType) {
// //   const [year, month] = period.split("-").map(Number);
// //   const colMap = {
// //     Pension: { emp: "pension_employee", empr: null },
// //     NHF:     { emp: "nhf_deduction",    empr: null },
// //     NSITF:   { emp: null,               empr: null },
// //   };
// //   const col = colMap[deductionType];
// //   if (!col) throw new ValidationError(`Unknown deduction type: ${deductionType}`);

// //   let employeeShareNaira = 0;
// //   let employerShareNaira = 0;

// //   // Widen status filter to catch all post-processing states
// //   const statusFilter = `AND run.status IN ('approved', 'paid', 'processing')`;

// //   if (col.emp) {
// //     const res = await db.query(
// //       `SELECT COALESCE(SUM(pr.${col.emp}), 0) AS total
// //        FROM payroll_records pr
// //        JOIN payroll_runs run ON run.id = pr.payroll_run_id
// //        WHERE pr.company_id = $1
// //          AND pr.month      = $2
// //          AND pr.year       = $3
// //          ${statusFilter}`,
// //       [companyId, month, year],
// //     );
// //     // Values are in NAIRA — convert to kobo
// //     employeeShareNaira = Number(res.rows[0]?.total ?? 0);
// //   }

// //   if (deductionType === "NSITF") {
// //     const res = await db.query(
// //       `SELECT COALESCE(SUM((pr.deductions_breakdown->>'NSITF')::NUMERIC), 0) AS total
// //        FROM payroll_records pr
// //        JOIN payroll_runs run ON run.id = pr.payroll_run_id
// //        WHERE pr.company_id = $1
// //          AND pr.month      = $2
// //          AND pr.year       = $3
// //          ${statusFilter}`,
// //       [companyId, month, year],
// //     );
// //     // NSITF is stored in the JSON breakdown in naira — convert to kobo
// //     employerShareNaira = Number(res.rows[0]?.total ?? 0);
// //   }

// //   // Convert naira → kobo
// //   const employeeShareKobo = BigInt(Math.round(employeeShareNaira * 100));
// //   const employerShareKobo = BigInt(Math.round(employerShareNaira * 100));

// //   const payrollRunRes = await db.query(
// //     `SELECT id FROM payroll_runs
// //      WHERE company_id = $1
// //        AND month      = $2
// //        AND year       = $3
// //        AND status IN ('approved', 'paid', 'processing')
// //      ORDER BY created_at DESC
// //      LIMIT 1`,
// //     [companyId, month, year],
// //   );
// //   const payrollRunId = payrollRunRes.rows[0]?.id ?? null;

// //   const upsert = await db.query(
// //     `INSERT INTO statutory_remittances
// //        (company_id, deduction_type, period, payroll_run_id,
// //         total_employee_share, total_employer_share)
// //      VALUES ($1,$2,$3,$4,$5,$6)
// //      ON CONFLICT (company_id, deduction_type, period) DO UPDATE SET
// //        total_employee_share = EXCLUDED.total_employee_share,
// //        total_employer_share = EXCLUDED.total_employer_share,
// //        payroll_run_id       = EXCLUDED.payroll_run_id,
// //        updated_at           = NOW()
// //      RETURNING *`,
// //     [companyId, deductionType, period, payrollRunId,
// //      employeeShareKobo.toString(), employerShareKobo.toString()],
// //   );
// //   return upsert.rows[0];
// // }

// // export async function remitStatutory({
// //   companyId, period, deductionType,
// //   remittanceDate, remittanceReference, remittedTo, userId,
// // }) {
// //   const rec = await db.query(
// //     "SELECT * FROM statutory_remittances WHERE company_id=$1 AND period=$2 AND deduction_type=$3",
// //     [companyId, period, deductionType],
// //   );
// //   if (!rec.rows.length) throw new NotFoundError(`No ${deductionType} record for period ${period}. Ensure payroll has been processed.`);
// //   if (rec.rows[0].status === "Remitted")
// //     throw new ConflictError(`${deductionType} already remitted for this period.`);

// //   // FIX: total_amount column does not exist on statutory_remittances.
// //   // Compute total from employee + employer shares (both stored in kobo now).
// //   const employeeShare = BigInt(rec.rows[0].total_employee_share ?? 0);
// //   const employerShare = BigInt(rec.rows[0].total_employer_share ?? 0);
// //   const amount = employeeShare + employerShare;

// //   if (amount <= 0n) throw new ValidationError(`${deductionType} amount is zero. Ensure payroll has been processed and approved for this period.`);

// //   const jeId = await createTaxPaymentJE({
// //     companyId, createdBy: userId, amount,
// //     entryDate: remittanceDate, description: `${deductionType} remittance — ${period}`,
// //     taxType: deductionType, source: "statutory_remittance", sourceRefId: rec.rows[0].id,
// //   });

// //   const updated = await db.query(
// //     `UPDATE statutory_remittances
// //      SET status='Remitted', remittance_date=$1, remittance_reference=$2,
// //          remitted_to=$3, journal_entry_id=$4, updated_at=NOW()
// //      WHERE company_id=$5 AND period=$6 AND deduction_type=$7
// //      RETURNING *`,
// //     [remittanceDate, remittanceReference, remittedTo ?? null, jeId, companyId, period, deductionType],
// //   );

// //   await writeAuditLog({
// //     companyId, userId,
// //     action: "REMIT",
// //     module: "Statutory",
// //     recordId: updated.rows[0].id,
// //     newValue: { period, deductionType, remittanceReference, remittedTo, status: "Remitted" },
// //   });
// //   return { record: updated.rows[0], journalEntryId: jeId };
// // }

// // export async function getStatutoryHistory(companyId, deductionType) {
// //   const result = await db.query(
// //     "SELECT * FROM statutory_remittances WHERE company_id=$1 AND deduction_type=$2 ORDER BY period DESC",
// //     [companyId, deductionType],
// //   );
// //   return result.rows;
// // }

// // // ═════════════════════════════════════════════════════════════
// // // TAX CALENDAR
// // // ═════════════════════════════════════════════════════════════

// // export async function buildTaxCalendar(companyId, overdueOnly = false) {
// //   const now   = new Date();
// //   const year  = now.getFullYear();
// //   const month = now.getMonth() + 1;
// //   const items = [];

// //   for (const rule of TAX_DUE_RULES) {
// //     let dueDate;
// //     if (rule.dayOfMonth) {
// //       dueDate = new Date(year, month - 1, rule.dayOfMonth);
// //     } else {
// //       dueDate = new Date(year, month, rule.daysAfterPayroll ?? 7);
// //     }

// //     const isOverdue = dueDate < now;
// //     const daysUntil = Math.ceil((dueDate - now) / 86400000);
// //     if (overdueOnly && !isOverdue) continue;

// //     let status = "Pending";
// //     const period = `${year}-${String(month).padStart(2, "0")}`;

// //     if (rule.type === "VAT") {
// //       const r = await db.query(
// //         "SELECT status FROM vat_records WHERE company_id=$1 AND period=$2",
// //         [companyId, period],
// //       );
// //       if (r.rows.length) status = r.rows[0].status === "Open" ? "Pending" : r.rows[0].status;
// //     } else if (rule.type === "WHT") {
// //       const r = await db.query(
// //         "SELECT COUNT(*) FROM wht_records WHERE company_id=$1 AND period=$2 AND status='Pending'",
// //         [companyId, period],
// //       );
// //       status = parseInt(r.rows[0].count) === 0 ? "Clear" : "Pending";
// //     } else if (rule.type === "PAYE") {
// //       const r = await db.query(
// //         "SELECT status FROM paye_remittances WHERE company_id=$1 AND period=$2",
// //         [companyId, period],
// //       );
// //       if (r.rows.length) status = r.rows[0].status;
// //     } else {
// //       const r = await db.query(
// //         "SELECT status FROM statutory_remittances WHERE company_id=$1 AND period=$2 AND deduction_type=$3",
// //         [companyId, period, rule.type],
// //       );
// //       if (r.rows.length) status = r.rows[0].status;
// //     }

// //     items.push({ taxType: rule.type, label: rule.label, recipient: rule.recipient,
// //                  dueDate: dueDate.toISOString().split("T")[0], period, status, isOverdue, daysUntil });
// //   }

// //   return items;
// // }

// src/services/tax.service.js
//
// Pure business logic for Group 3 — Tax Management.
// All monetary values in KOBO (BigInt safe for arithmetic).
// Every payment creates a journal entry via accounting.service.js.
// Payroll data is pulled directly from payroll_runs + payroll_records.

import { db } from "../config/db.js";
import {
  findAccountByCode,
  createJournalEntry,
  postJournalEntry,
  writeAuditLog,
  ValidationError,
  NotFoundError,
  ConflictError,
} from "./accounting.service.js";

// ─── Account code map for tax payments ───────────────────────
// payable = the liability account to DEBIT (clear the debt)
// bank    = the asset (cash/bank) account to CREDIT (money goes out)
// 1000 = Cash / Bank Account (Asset) — money physically leaves here
const TAX_ACCOUNTS = {
  VAT:     { payable: "2200", bank: "1000" },
  WHT:     { payable: "2300", bank: "1000" },
  PAYE:    { payable: "2400", bank: "1000" },
  Pension: { payable: "2500", bank: "1000" },
  NHF:     { payable: "2600", bank: "1000" },
  NSITF:   { payable: "2700", bank: "1000" },
};

export const TAX_DUE_RULES = [
  { type: "VAT",     label: "VAT Filing",        dayOfMonth: 21,      recipient: "FIRS" },
  { type: "WHT",     label: "WHT Remittance",     dayOfMonth: 21,      recipient: "FIRS" },
  { type: "PAYE",    label: "PAYE Remittance",    dayOfMonth: 10,      recipient: "FIRS" },
  { type: "Pension", label: "Pension Remittance", daysAfterPayroll: 7, recipient: "PFA" },
  { type: "NHF",     label: "NHF Remittance",     dayOfMonth: 21,      recipient: "Federal Mortgage Bank" },
  { type: "NSITF",   label: "NSITF Remittance",   dayOfMonth: 21,      recipient: "NSITF Office" },
];

// ─── Tax payment JE helper ────────────────────────────────────
// Correct double-entry for every tax payment:
//   DR  Tax Payable (2xxx)   — clears the liability (reduces what we owe)
//   CR  Bank/Cash   (1000)   — money physically leaves the company
async function createTaxPaymentJE({
  companyId, createdBy, amount, entryDate,
  description, taxType, source, sourceRefId,
}) {
  const codes = TAX_ACCOUNTS[taxType];
  if (!codes) throw new ValidationError(`Unknown tax type: ${taxType}`);

  const [payableAcct, bankAcct] = await Promise.all([
    findAccountByCode(companyId, codes.payable),
    findAccountByCode(companyId, codes.bank),
  ]);

  if (!payableAcct)
    throw new ValidationError(
      `GL account ${codes.payable} (${taxType} Payable) not found. Run accounting setup first.`
    );
  if (!bankAcct)
    throw new ValidationError(
      `GL account ${codes.bank} (Bank/Cash) not found. Run accounting setup first.`
    );

  const je = await createJournalEntry({
    companyId,
    createdBy,
    entryDate,
    description,
    source: source ?? "tax_payment",
    sourceRefId: sourceRefId ?? null,
    lines: [
      // DR Tax Payable — reduces liability (what we owe FIRS/PFA/etc.)
      {
        accountId: payableAcct.id,
        debitAmount: amount,
        creditAmount: 0,
        description: `${taxType} liability cleared`,
      },
      // CR Bank/Cash — money leaves the company
      {
        accountId: bankAcct.id,
        debitAmount: 0,
        creditAmount: amount,
        description: `${taxType} payment disbursed`,
      },
    ],
  });

  await postJournalEntry(je.id, companyId, createdBy);
  return je.id;
}

// ═════════════════════════════════════════════════════════════
// TAX CONFIG
// ═════════════════════════════════════════════════════════════

export async function upsertTaxConfig({
  companyId, taxType, rate, effectiveDate, notes, createdBy,
}) {
  const result = await db.query(
    `INSERT INTO tax_configs (company_id, tax_type, rate, effective_date, notes, created_by)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (company_id, tax_type)
     DO UPDATE SET rate=$3, effective_date=$4, notes=$5, is_active=TRUE, updated_at=NOW()
     RETURNING *`,
    [companyId, taxType, rate, effectiveDate ?? new Date(), notes ?? null, createdBy],
  );
  await writeAuditLog({
    companyId,
    userId: createdBy,
    action: "CREATE",
    module: "TaxConfig",
    recordId: result.rows[0].id,
    newValue: result.rows[0],
  });
  return result.rows[0];
}

export async function getTaxConfigs(companyId) {
  const result = await db.query(
    "SELECT * FROM tax_configs WHERE company_id=$1 AND is_active=TRUE ORDER BY tax_type",
    [companyId],
  );
  return result.rows;
}

export async function updateTaxConfig(id, companyId, payload) {
  const existing = await db.query(
    "SELECT * FROM tax_configs WHERE id=$1 AND company_id=$2",
    [id, companyId],
  );
  if (!existing.rows.length) throw new NotFoundError("Tax config not found.");
  const prev = existing.rows[0];

  const updated = await db.query(
    `UPDATE tax_configs
     SET rate=$1, effective_date=$2, notes=$3, updated_at=NOW()
     WHERE id=$4 AND company_id=$5
     RETURNING *`,
    [
      payload.rate ?? prev.rate,
      payload.effectiveDate ?? prev.effective_date,
      payload.notes ?? prev.notes,
      id,
      companyId,
    ],
  );
  return updated.rows[0];
}

export async function deactivateTaxConfig(id, companyId) {
  const result = await db.query(
    "UPDATE tax_configs SET is_active=FALSE, updated_at=NOW() WHERE id=$1 AND company_id=$2 RETURNING *",
    [id, companyId],
  );
  if (!result.rows.length) throw new NotFoundError("Tax config not found.");
  return result.rows[0];
}

// ═════════════════════════════════════════════════════════════
// VAT
// ═════════════════════════════════════════════════════════════

export async function getOrBuildVatSummary(companyId, period) {
  const [year, month] = period.split("-");
  const periodStart = `${year}-${month}-01`;
  const periodEnd = new Date(parseInt(year), parseInt(month), 0)
    .toISOString()
    .split("T")[0];

  let totalVatCollected = 0n;
  let totalSales = 0n;
  let totalVatRecoverable = 0n;
  let totalPurchases = 0n;

  // ── 1. Try invoices table ──────────────────────────────────
  try {
    const invRes = await db.query(
      `SELECT COALESCE(SUM(vat_amount_kobo),0) AS vat,
              COALESCE(SUM(subtotal_kobo),0)   AS sales
       FROM invoices
       WHERE company_id=$1
         AND invoice_date BETWEEN $2 AND $3
         AND status IN ('Sent','Paid')`,
      [companyId, periodStart, periodEnd],
    );
    totalVatCollected = BigInt(Math.round(Number(invRes.rows[0].vat  ?? 0)));
    totalSales        = BigInt(Math.round(Number(invRes.rows[0].sales ?? 0)));
  } catch { /* invoices table may not exist */ }

  // ── 2. Try bills table ─────────────────────────────────────
  try {
    const billRes = await db.query(
      `SELECT COALESCE(SUM(vat_amount_kobo),0) AS vat,
              COALESCE(SUM(subtotal_kobo),0)   AS purch
       FROM bills
       WHERE company_id=$1
         AND bill_date BETWEEN $2 AND $3
         AND status IN ('Approved','Paid')`,
      [companyId, periodStart, periodEnd],
    );
    totalVatRecoverable = BigInt(Math.round(Number(billRes.rows[0].vat   ?? 0)));
    totalPurchases      = BigInt(Math.round(Number(billRes.rows[0].purch ?? 0)));
  } catch { /* bills table may not exist */ }

  // ── 3. Fallback: read from VAT Payable GL account (2200) ──
  // Credits on liability = VAT collected (output VAT owed to FIRS)
  // Debits  on liability = VAT payments already made
  if (totalVatCollected === 0n && totalVatRecoverable === 0n) {
    try {
      const glRes = await db.query(
        `SELECT
           COALESCE(SUM(jel.credit_amount), 0) AS credits,
           COALESCE(SUM(jel.debit_amount),  0) AS debits
         FROM journal_entry_lines jel
         JOIN journal_entries je
           ON je.id = jel.journal_entry_id
          AND je.status = 'Posted'
          AND je.entry_date BETWEEN $2 AND $3
         JOIN chart_of_accounts coa
           ON coa.id = jel.account_id
          AND coa.account_code = '2200'
          AND coa.company_id = $1
         WHERE je.company_id = $1`,
        [companyId, periodStart, periodEnd],
      );
      totalVatCollected   = BigInt(Math.round(Number(glRes.rows[0].credits ?? 0)));
      totalVatRecoverable = BigInt(Math.round(Number(glRes.rows[0].debits  ?? 0)));
    } catch (e) {
      console.error("VAT GL fallback failed:", e.message);
    }
  }

  const result = await db.query(
    `INSERT INTO vat_records
       (company_id, period, total_sales_kobo, total_vat_collected,
        total_purchases_kobo, total_vat_recoverable)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (company_id, period) DO UPDATE SET
       total_sales_kobo      = EXCLUDED.total_sales_kobo,
       total_vat_collected   = EXCLUDED.total_vat_collected,
       total_purchases_kobo  = EXCLUDED.total_purchases_kobo,
       total_vat_recoverable = EXCLUDED.total_vat_recoverable,
       updated_at            = NOW()
     RETURNING *`,
    [
      companyId,
      period,
      totalSales.toString(),
      totalVatCollected.toString(),
      totalPurchases.toString(),
      totalVatRecoverable.toString(),
    ],
  );
  return result.rows[0];
}

export async function fileVat(companyId, period, userId) {
  const rec = await db.query(
    "SELECT * FROM vat_records WHERE company_id=$1 AND period=$2",
    [companyId, period],
  );
  if (!rec.rows.length)
    throw new NotFoundError(`No VAT record for period ${period}.`);
  if (rec.rows[0].status !== "Open")
    throw new ConflictError(`VAT period ${period} is already ${rec.rows[0].status}.`);

  const updated = await db.query(
    `UPDATE vat_records SET status='Filed', filed_date=NOW(), updated_at=NOW()
     WHERE company_id=$1 AND period=$2 RETURNING *`,
    [companyId, period],
  );
  await writeAuditLog({
    companyId,
    userId,
    action: "FILE",
    module: "VAT",
    recordId: updated.rows[0].id,
    newValue: { status: "Filed", period },
  });
  return updated.rows[0];
}

export async function payVat({
  companyId, period, amountPaid, paymentDate, paymentReference, userId,
}) {
  const rec = await db.query(
    "SELECT * FROM vat_records WHERE company_id=$1 AND period=$2",
    [companyId, period],
  );
  if (!rec.rows.length)
    throw new NotFoundError(`No VAT record for period ${period}.`);
  if (rec.rows[0].status === "Paid")
    throw new ConflictError("VAT already paid for this period.");

  const jeId = await createTaxPaymentJE({
    companyId,
    createdBy: userId,
    amount: BigInt(amountPaid),
    entryDate: paymentDate,
    description: `VAT payment — ${period}`,
    taxType: "VAT",
    source: "vat_payment",
    sourceRefId: rec.rows[0].id,
  });

  const updated = await db.query(
    `UPDATE vat_records
     SET status='Paid', payment_date=$1, payment_reference=$2,
         journal_entry_id=$3, updated_at=NOW()
     WHERE company_id=$4 AND period=$5
     RETURNING *`,
    [paymentDate, paymentReference, jeId, companyId, period],
  );

  await writeAuditLog({
    companyId,
    userId,
    action: "CREATE",
    module: "VAT",
    recordId: updated.rows[0].id,
    newValue: {
      period,
      amountPaid: amountPaid.toString(),
      paymentReference,
      status: "Paid",
    },
  });
  return { record: updated.rows[0], journalEntryId: jeId };
}

export async function getVatHistory(companyId) {
  const result = await db.query(
    "SELECT * FROM vat_records WHERE company_id=$1 ORDER BY period DESC",
    [companyId],
  );
  return result.rows;
}

// ═════════════════════════════════════════════════════════════
// WHT
// ═════════════════════════════════════════════════════════════

export async function getWhtSummary(companyId, period) {
  const conditions = ["company_id=$1"];
  const params = [companyId];
  if (period) { conditions.push("period=$2"); params.push(period); }
  const result = await db.query(
    `SELECT * FROM wht_records WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC`,
    params,
  );
  return result.rows;
}

export async function remitWht({
  companyId, period, totalAmount, remittanceDate, remittanceReference, userId,
}) {
  const pending = await db.query(
    "SELECT COUNT(*) FROM wht_records WHERE company_id=$1 AND period=$2 AND status='Pending'",
    [companyId, period],
  );
  if (parseInt(pending.rows[0].count) === 0)
    throw new NotFoundError(`No pending WHT records for period ${period}.`);

  const jeId = await createTaxPaymentJE({
    companyId,
    createdBy: userId,
    amount: BigInt(totalAmount),
    entryDate: remittanceDate,
    description: `WHT remittance to FIRS — ${period}`,
    taxType: "WHT",
    source: "wht_remittance",
  });

  await db.query(
    `UPDATE wht_records
     SET status='Remitted', remittance_date=$1, remittance_reference=$2, journal_entry_id=$3
     WHERE company_id=$4 AND period=$5 AND status='Pending'`,
    [remittanceDate, remittanceReference, jeId, companyId, period],
  );

  await writeAuditLog({
    companyId,
    userId,
    action: "REMIT",
    module: "WHT",
    recordId: jeId,
    newValue: {
      type: "WHT",
      period,
      totalAmount: totalAmount.toString(),
      remittanceReference,
    },
  });
  return { period, journalEntryId: jeId, message: "WHT remitted to FIRS." };
}

export async function getWhtHistory(companyId) {
  const result = await db.query(
    `SELECT period,
       SUM(wht_amount_kobo)          AS total_remitted_kobo,
       MAX(remittance_date)          AS remittance_date,
       MAX(remittance_reference)     AS remittance_reference,
       status
     FROM wht_records
     WHERE company_id=$1
     GROUP BY company_id, period, status
     ORDER BY period DESC`,
    [companyId],
  );
  return result.rows;
}

// ═════════════════════════════════════════════════════════════
// PAYE
// ═════════════════════════════════════════════════════════════

export async function buildPayeSummary(companyId, period) {
  const [year, month] = period.split("-").map(Number);

  const result = await db.query(
    `SELECT
       COALESCE(SUM(pr.gross_salary), 0) AS total_gross,
       COALESCE(SUM(pr.paye_tax),     0) AS total_paye,
       pr2.id AS payroll_run_id
     FROM payroll_records pr
     JOIN payroll_runs pr2 ON pr2.id = pr.payroll_run_id
     WHERE pr.company_id=$1
       AND pr.month=$2
       AND pr.year=$3
       AND pr2.status IN ('paid','approved','processing')
     GROUP BY pr2.id
     LIMIT 1`,
    [companyId, month, year],
  );

  const row = result.rows[0];
  // gross_salary and paye_tax are stored in NAIRA — convert to kobo
  const totalGross = row ? BigInt(Math.round(Number(row.total_gross) * 100)) : 0n;
  const totalPaye  = row ? BigInt(Math.round(Number(row.total_paye)  * 100)) : 0n;
  const payrollRunId = row?.payroll_run_id ?? null;

  const upsert = await db.query(
    `INSERT INTO paye_remittances
       (company_id, period, payroll_run_id, total_gross_pay, total_paye)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (company_id, period) DO UPDATE SET
       total_gross_pay = EXCLUDED.total_gross_pay,
       total_paye      = EXCLUDED.total_paye,
       payroll_run_id  = EXCLUDED.payroll_run_id,
       updated_at      = NOW()
     RETURNING *`,
    [companyId, period, payrollRunId, totalGross.toString(), totalPaye.toString()],
  );
  return upsert.rows[0];
}

export async function remitPaye({
  companyId, period, remittanceDate, remittanceReference, userId,
}) {
  const rec = await db.query(
    "SELECT * FROM paye_remittances WHERE company_id=$1 AND period=$2",
    [companyId, period],
  );
  if (!rec.rows.length)
    throw new NotFoundError(`No PAYE record for period ${period}.`);
  if (rec.rows[0].status === "Remitted")
    throw new ConflictError("PAYE already remitted for this period.");

  const amount = BigInt(rec.rows[0].total_paye);
  if (amount <= 0n)
    throw new ValidationError("PAYE amount is zero — nothing to remit.");

  const jeId = await createTaxPaymentJE({
    companyId,
    createdBy: userId,
    amount,
    entryDate: remittanceDate,
    description: `PAYE remittance to FIRS — ${period}`,
    taxType: "PAYE",
    source: "paye_remittance",
    sourceRefId: rec.rows[0].id,
  });

  const updated = await db.query(
    `UPDATE paye_remittances
     SET status='Remitted', remittance_date=$1, remittance_reference=$2,
         journal_entry_id=$3, updated_at=NOW()
     WHERE company_id=$4 AND period=$5
     RETURNING *`,
    [remittanceDate, remittanceReference, jeId, companyId, period],
  );

  await writeAuditLog({
    companyId,
    userId,
    action: "REMIT",
    module: "PAYE",
    recordId: updated.rows[0].id,
    newValue: { period, remittanceReference, status: "Remitted" },
  });
  return { record: updated.rows[0], journalEntryId: jeId };
}

export async function getPayeHistory(companyId) {
  const result = await db.query(
    "SELECT * FROM paye_remittances WHERE company_id=$1 ORDER BY period DESC",
    [companyId],
  );
  return result.rows;
}

// ═════════════════════════════════════════════════════════════
// STATUTORY DEDUCTIONS (Pension / NHF / NSITF)
// ═════════════════════════════════════════════════════════════

export async function buildStatutorySummary(companyId, period, deductionType) {
  const [year, month] = period.split("-").map(Number);
  const colMap = {
    Pension: { emp: "pension_employee", empr: null },
    NHF:     { emp: "nhf_deduction",    empr: null },
    NSITF:   { emp: null,               empr: null },
  };
  const col = colMap[deductionType];
  if (!col) throw new ValidationError(`Unknown deduction type: ${deductionType}`);

  let employeeShare = 0n;
  let employerShare = 0n;

  if (col.emp) {
    const res = await db.query(
      `SELECT COALESCE(SUM(pr.${col.emp}), 0) AS total
       FROM payroll_records pr
       JOIN payroll_runs r ON r.id = pr.payroll_run_id
       WHERE pr.company_id=$1
         AND pr.month=$2
         AND pr.year=$3
         AND r.status IN ('paid','approved','processing')`,
      [companyId, month, year],
    );
    // pension_employee / nhf_deduction stored in NAIRA — convert to kobo
    employeeShare = BigInt(Math.round(Number(res.rows[0]?.total ?? 0) * 100));
  }

  if (deductionType === "NSITF") {
    const res = await db.query(
      `SELECT COALESCE(SUM((pr.deductions_breakdown->>'NSITF')::NUMERIC), 0) AS total
       FROM payroll_records pr
       JOIN payroll_runs r ON r.id = pr.payroll_run_id
       WHERE pr.company_id=$1
         AND pr.month=$2
         AND pr.year=$3
         AND r.status IN ('paid','approved','processing')`,
      [companyId, month, year],
    );
    // NSITF in JSON breakdown is also NAIRA — convert to kobo
    employerShare = BigInt(Math.round(Number(res.rows[0]?.total ?? 0) * 100));
  }

  const payrollRunRes = await db.query(
    `SELECT id FROM payroll_runs
     WHERE company_id=$1
       AND month=$2
       AND year=$3
       AND status IN ('paid','approved','processing')
     ORDER BY created_at DESC LIMIT 1`,
    [companyId, month, year],
  );
  const payrollRunId = payrollRunRes.rows[0]?.id ?? null;

  const upsert = await db.query(
    `INSERT INTO statutory_remittances
       (company_id, deduction_type, period, payroll_run_id,
        total_employee_share, total_employer_share)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (company_id, deduction_type, period) DO UPDATE SET
       total_employee_share = EXCLUDED.total_employee_share,
       total_employer_share = EXCLUDED.total_employer_share,
       payroll_run_id       = EXCLUDED.payroll_run_id,
       updated_at           = NOW()
     RETURNING *`,
    [
      companyId,
      deductionType,
      period,
      payrollRunId,
      employeeShare.toString(),
      employerShare.toString(),
    ],
  );
  return upsert.rows[0];
}

export async function remitStatutory({
  companyId,
  period,
  deductionType,
  remittanceDate,
  remittanceReference,
  remittedTo,
  userId,
}) {
  const rec = await db.query(
    "SELECT * FROM statutory_remittances WHERE company_id=$1 AND period=$2 AND deduction_type=$3",
    [companyId, period, deductionType],
  );
  if (!rec.rows.length)
    throw new NotFoundError(`No ${deductionType} record for period ${period}.`);
  if (rec.rows[0].status === "Remitted")
    throw new ConflictError(`${deductionType} already remitted for this period.`);

  // Sum both shares — both stored in kobo
  const employeeShare = BigInt(rec.rows[0].total_employee_share ?? 0);
  const employerShare = BigInt(rec.rows[0].total_employer_share ?? 0);
  const amount = employeeShare + employerShare;

  if (amount <= 0n)
    throw new ValidationError(`${deductionType} amount is zero — nothing to remit.`);

  const jeId = await createTaxPaymentJE({
    companyId,
    createdBy: userId,
    amount,
    entryDate: remittanceDate,
    description: `${deductionType} remittance — ${period}`,
    taxType: deductionType,
    source: "statutory_remittance",
    sourceRefId: rec.rows[0].id,
  });

  const updated = await db.query(
    `UPDATE statutory_remittances
     SET status='Remitted', remittance_date=$1, remittance_reference=$2,
         remitted_to=$3, journal_entry_id=$4, updated_at=NOW()
     WHERE company_id=$5 AND period=$6 AND deduction_type=$7
     RETURNING *`,
    [
      remittanceDate,
      remittanceReference,
      remittedTo ?? null,
      jeId,
      companyId,
      period,
      deductionType,
    ],
  );

  await writeAuditLog({
    companyId,
    userId,
    action: "REMIT",
    module: "Statutory",
    recordId: updated.rows[0].id,
    newValue: {
      period,
      deductionType,
      remittanceReference,
      remittedTo,
      status: "Remitted",
    },
  });
  return { record: updated.rows[0], journalEntryId: jeId };
}

export async function getStatutoryHistory(companyId, deductionType) {
  const result = await db.query(
    "SELECT * FROM statutory_remittances WHERE company_id=$1 AND deduction_type=$2 ORDER BY period DESC",
    [companyId, deductionType],
  );
  return result.rows;
}

// ═════════════════════════════════════════════════════════════
// TAX CALENDAR
// ═════════════════════════════════════════════════════════════

export async function buildTaxCalendar(companyId, overdueOnly = false) {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const items = [];

  for (const rule of TAX_DUE_RULES) {
    let dueDate;
    if (rule.dayOfMonth) {
      dueDate = new Date(year, month - 1, rule.dayOfMonth);
    } else {
      dueDate = new Date(year, month, rule.daysAfterPayroll ?? 7);
    }

    const isOverdue = dueDate < today;
    const daysUntil = Math.ceil((dueDate - today) / 86400000);

    // Only show if overdue OR due within 14 days
    const isDueSoon = daysUntil >= 0 && daysUntil <= 14;
    if (!isOverdue && !isDueSoon) continue;

    const period = `${year}-${String(month).padStart(2, "0")}`;
    let status = "Pending";

    if (rule.type === "VAT") {
      const r = await db.query(
        "SELECT status FROM vat_records WHERE company_id=$1 AND period=$2",
        [companyId, period],
      );
      if (r.rows.length)
        status = r.rows[0].status === "Open" ? "Pending" : r.rows[0].status;
    } else if (rule.type === "WHT") {
      const r = await db.query(
        "SELECT COUNT(*) FROM wht_records WHERE company_id=$1 AND period=$2 AND status='Pending'",
        [companyId, period],
      );
      status = parseInt(r.rows[0].count) === 0 ? "Clear" : "Pending";
    } else if (rule.type === "PAYE") {
      const r = await db.query(
        "SELECT status FROM paye_remittances WHERE company_id=$1 AND period=$2",
        [companyId, period],
      );
      if (r.rows.length) status = r.rows[0].status;
    } else {
      const r = await db.query(
        "SELECT status FROM statutory_remittances WHERE company_id=$1 AND period=$2 AND deduction_type=$3",
        [companyId, period, rule.type],
      );
      if (r.rows.length) status = r.rows[0].status;
    }

    // Hide if already completed
    const doneStatuses = ["Paid", "Remitted", "Filed", "Clear"];
    if (doneStatuses.includes(status)) continue;

    if (overdueOnly && !isOverdue) continue;

    items.push({
      taxType:   rule.type,
      label:     rule.label,
      recipient: rule.recipient,
      dueDate:   dueDate.toISOString().split("T")[0],
      period,
      status,
      isOverdue,
      daysUntil,
    });
  }

  return items;
}