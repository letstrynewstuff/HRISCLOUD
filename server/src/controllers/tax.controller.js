

// src/controllers/tax.controller.js

import { db } from "../config/db.js";
import multer from "multer";

import {
  upsertTaxConfig,
  getTaxConfigs,
  updateTaxConfig,
  deactivateTaxConfig,
  getOrBuildVatSummary,
  fileVat,
  payVat,
  getVatHistory,
  getWhtSummary,
  remitWht,
  getWhtHistory,
  buildPayeSummary,
  remitPaye,
  getPayeHistory,
  buildStatutorySummary,
  remitStatutory,
  getStatutoryHistory,
  buildTaxCalendar,
} from "../services/tax.service.js";

import {
  createBankAccount,
  listBankAccounts,
  updateBankAccount,
  updateBankBalance,
  importBankStatement,
  getUnmatchedStatementLines,
  getUnmatchedJournalEntries,
  matchLineToJournalEntry,
  unmatchLine,
  createAdjustmentEntry,
  startSession,
  getSessionProgress,
  completeSession,
  listSessions,
} from "../services/reconciliation.service.js";

export const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv"))
      cb(null, true);
    else cb(new Error("Only CSV files are accepted."));
  },
}).single("statement");

function handleErr(res, err) {
  console.error("[Accounting]", err.message);
  return res
    .status(err.status ?? 500)
    .json({ message: err.message ?? "Server error." });
}

// ── Central audit log writer ──────────────────────────────────
// Valid actions (must match DB constraint):
//   CREATE | UPDATE | DELETE | POST | VOID | LOGIN
//   REMIT  | FILE   | MATCH  | IMPORT | CONFIRM
// Valid modules (must match DB constraint):
//   JournalEntry | ChartOfAccounts | TaxConfig | VAT | WHT | PAYE
//   Statutory    | BankAccount     | ReconSession | BankReconciliation
async function auditLog(companyId, userId, action, module, recordId, newValue) {
  try {
    await db.query(
      `INSERT INTO accounting_audit_trail
         (company_id, user_id, action, module, record_id, new_value)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [companyId, userId, action, module, recordId, JSON.stringify(newValue)],
    );
  } catch (err) {
    console.error("[AuditLog] Failed:", err.message, "| action:", action, "| module:", module);
  }
}

// ═════════════════════════════════════════════════════════════
// TAX CONFIG
// ═════════════════════════════════════════════════════════════

export async function createOrUpdateTaxConfig(req, res) {
  const { companyId, userId } = req.user;
  const { taxType, rate, effectiveDate, notes } = req.body;
  if (!taxType || rate === undefined)
    return res.status(422).json({ message: "taxType and rate are required." });
  try {
    const data = await upsertTaxConfig({
      companyId,
      taxType,
      rate,
      effectiveDate,
      notes,
      createdBy: userId,
    });
    await auditLog(companyId, userId, "CREATE", "TaxConfig", data.id, {
      taxType,
      rate,
      effectiveDate,
    });
    return res.status(201).json({ message: "Tax config saved.", data });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function getAllTaxConfigs(req, res) {
  const { companyId } = req.user;
  try {
    return res.status(200).json({ data: await getTaxConfigs(companyId) });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function updateTaxConfigHandler(req, res) {
  const { companyId, userId } = req.user;
  try {
    const data = await updateTaxConfig(req.params.id, companyId, req.body);
    await auditLog(
      companyId,
      userId,
      "UPDATE",
      "TaxConfig",
      req.params.id,
      req.body,
    );
    return res.status(200).json({ message: "Tax config updated.", data });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function deactivateTaxConfigHandler(req, res) {
  const { companyId, userId } = req.user;
  try {
    const data = await deactivateTaxConfig(req.params.id, companyId);
    await auditLog(companyId, userId, "DELETE", "TaxConfig", req.params.id, {
      deactivated: true,
    });
    return res.status(200).json({ message: "Tax config deactivated.", data });
  } catch (err) {
    return handleErr(res, err);
  }
}

// ═════════════════════════════════════════════════════════════
// VAT
// ═════════════════════════════════════════════════════════════

export async function getVatSummary(req, res) {
  const { companyId } = req.user;
  const period = req.query.period ?? new Date().toISOString().slice(0, 7);
  try {
    return res
      .status(200)
      .json({ data: await getOrBuildVatSummary(companyId, period) });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function fileVatPeriod(req, res) {
  const { companyId, userId } = req.user;
  const { period } = req.body;
  if (!period)
    return res.status(422).json({ message: "period is required (YYYY-MM)." });
  try {
    const data = await fileVat(companyId, period, userId);
    // FILE is a custom action — requires the expanded DB constraint
    await auditLog(companyId, userId, "FILE", "VAT", data.id, {
      period,
      status: "Filed",
    });
    return res.status(200).json({ message: "VAT period filed.", data });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function payVatHandler(req, res) {
  const { companyId, userId } = req.user;
  const { period, amountPaid, paymentDate, paymentReference } = req.body;
  if (!period || !amountPaid || !paymentDate)
    return res
      .status(422)
      .json({ message: "period, amountPaid, and paymentDate are required." });
  try {
    const result = await payVat({
      companyId,
      period,
      amountPaid,
      paymentDate,
      paymentReference,
      userId,
    });
    await auditLog(companyId, userId, "CREATE", "VAT", result.record.id, {
      period,
      amountPaid,
      paymentReference,
      status: "Paid",
    });
    return res.status(200).json({
      message: "VAT payment recorded. Journal entry created.",
      data: result,
    });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function getVatHistoryHandler(req, res) {
  const { companyId } = req.user;
  try {
    return res.status(200).json({ data: await getVatHistory(companyId) });
  } catch (err) {
    return handleErr(res, err);
  }
}

// ═════════════════════════════════════════════════════════════
// WHT
// ═════════════════════════════════════════════════════════════

export async function getWhtSummaryHandler(req, res) {
  const { companyId } = req.user;
  try {
    return res
      .status(200)
      .json({ data: await getWhtSummary(companyId, req.query.period) });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function remitWhtHandler(req, res) {
  const { companyId, userId } = req.user;
  const { period, totalAmount, remittanceDate, remittanceReference } = req.body;
  if (!period || !totalAmount || !remittanceDate)
    return res.status(422).json({
      message: "period, totalAmount, and remittanceDate are required.",
    });
  try {
    const result = await remitWht({
      companyId,
      period,
      totalAmount,
      remittanceDate,
      remittanceReference,
      userId,
    });
    // REMIT is a custom action — requires the expanded DB constraint
    await auditLog(companyId, userId, "REMIT", "WHT", result.journalEntryId, {
      period,
      totalAmount,
      remittanceReference,
    });
    return res.status(200).json({
      message: "WHT remitted to FIRS. Journal entry created.",
      data: result,
    });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function getWhtHistoryHandler(req, res) {
  const { companyId } = req.user;
  try {
    return res.status(200).json({ data: await getWhtHistory(companyId) });
  } catch (err) {
    return handleErr(res, err);
  }
}

// ═════════════════════════════════════════════════════════════
// PAYE
// ═════════════════════════════════════════════════════════════

export async function getPayeSummaryHandler(req, res) {
  const { companyId } = req.user;
  const period = req.query.period ?? new Date().toISOString().slice(0, 7);
  try {
    return res
      .status(200)
      .json({ data: await buildPayeSummary(companyId, period) });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function remitPayeHandler(req, res) {
  const { companyId, userId } = req.user;
  const { period, remittanceDate, remittanceReference } = req.body;
  if (!period || !remittanceDate)
    return res
      .status(422)
      .json({ message: "period and remittanceDate are required." });
  try {
    const result = await remitPaye({
      companyId,
      period,
      remittanceDate,
      remittanceReference,
      userId,
    });
    // REMIT is a custom action — requires the expanded DB constraint
    await auditLog(companyId, userId, "REMIT", "PAYE", result.record.id, {
      period,
      remittanceReference,
      status: "Remitted",
    });
    return res.status(200).json({
      message: "PAYE remitted to FIRS. Journal entry created.",
      data: result,
    });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function getPayeHistoryHandler(req, res) {
  const { companyId } = req.user;
  try {
    return res.status(200).json({ data: await getPayeHistory(companyId) });
  } catch (err) {
    return handleErr(res, err);
  }
}

// ═════════════════════════════════════════════════════════════
// STATUTORY
// ═════════════════════════════════════════════════════════════

export async function getStatutorySummaryHandler(req, res) {
  const { companyId } = req.user;
  const period = req.query.period ?? new Date().toISOString().slice(0, 7);
  try {
    return res.status(200).json({
      data: await buildStatutorySummary(companyId, period, req.params.type),
    });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function remitStatutoryHandler(req, res) {
  const { companyId, userId } = req.user;
  const deductionType = req.params.type;
  const { period, remittanceDate, remittanceReference, remittedTo } = req.body;
  if (!period || !remittanceDate)
    return res
      .status(422)
      .json({ message: "period and remittanceDate are required." });
  try {
    const result = await remitStatutory({
      companyId,
      period,
      deductionType,
      remittanceDate,
      remittanceReference,
      remittedTo,
      userId,
    });
    // REMIT is a custom action — requires the expanded DB constraint
    await auditLog(companyId, userId, "REMIT", "Statutory", result.record.id, {
      period,
      deductionType,
      remittanceReference,
      remittedTo,
    });
    return res.status(200).json({
      message: `${deductionType} remitted. Journal entry created.`,
      data: result,
    });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function getStatutoryHistoryHandler(req, res) {
  const { companyId } = req.user;
  try {
    return res
      .status(200)
      .json({ data: await getStatutoryHistory(companyId, req.params.type) });
  } catch (err) {
    return handleErr(res, err);
  }
}

// ═════════════════════════════════════════════════════════════
// TAX CALENDAR
// ═════════════════════════════════════════════════════════════

export async function getTaxCalendar(req, res) {
  const { companyId } = req.user;
  try {
    return res
      .status(200)
      .json({ data: await buildTaxCalendar(companyId, false) });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function getOverdueTaxCalendar(req, res) {
  const { companyId } = req.user;
  try {
    return res
      .status(200)
      .json({ data: await buildTaxCalendar(companyId, true) });
  } catch (err) {
    return handleErr(res, err);
  }
}

// ═════════════════════════════════════════════════════════════
// BANK ACCOUNTS
// ═════════════════════════════════════════════════════════════

export async function createBankAccountHandler(req, res) {
  const { companyId, userId } = req.user;
  try {
    const data = await createBankAccount({ companyId, userId, ...req.body });
    await auditLog(companyId, userId, "CREATE", "BankAccount", data.id, {
      bankName: data.bank_name,
      accountNumber: data.account_number,
    });
    return res.status(201).json({ message: "Bank account created.", data });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function listBankAccountsHandler(req, res) {
  const { companyId } = req.user;
  try {
    return res.status(200).json({ data: await listBankAccounts(companyId) });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function updateBankAccountHandler(req, res) {
  const { companyId, userId } = req.user;
  try {
    const data = await updateBankAccount(
      req.params.id,
      companyId,
      req.body,
      userId,
    );
    await auditLog(
      companyId,
      userId,
      "UPDATE",
      "BankAccount",
      req.params.id,
      req.body,
    );
    return res.status(200).json({ message: "Bank account updated.", data });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function updateBankBalanceHandler(req, res) {
  const { companyId, userId } = req.user;
  const { balance } = req.body;
  if (balance === undefined)
    return res.status(422).json({ message: "balance is required (in kobo)." });
  try {
    const data = await updateBankBalance(
      req.params.id,
      companyId,
      balance,
      userId,
    );
    await auditLog(companyId, userId, "UPDATE", "BankAccount", req.params.id, {
      balance,
    });
    return res.status(200).json({ message: "Balance updated.", data });
  } catch (err) {
    return handleErr(res, err);
  }
}

// ═════════════════════════════════════════════════════════════
// CSV IMPORT
// ═════════════════════════════════════════════════════════════

export async function importStatementHandler(req, res) {
  const { companyId, userId } = req.user;
  const bankAccountId = req.body.bankAccountId;
  if (!req.file)
    return res
      .status(422)
      .json({ message: "CSV file is required (field: statement)." });
  if (!bankAccountId)
    return res.status(422).json({ message: "bankAccountId is required." });
  try {
    const result = await importBankStatement(
      companyId,
      bankAccountId,
      req.file.buffer,
      userId,
    );
    // IMPORT is a custom action — requires the expanded DB constraint
    await auditLog(
      companyId,
      userId,
      "IMPORT",
      "BankReconciliation",
      bankAccountId,
      { imported: result.imported, autoMatched: result.autoMatched },
    );
    return res.status(200).json(result);
  } catch (err) {
    return handleErr(res, err);
  }
}

// ═════════════════════════════════════════════════════════════
// MATCHING
// ═════════════════════════════════════════════════════════════

export async function getUnmatchedHandler(req, res) {
  const { companyId } = req.user;
  try {
    return res.status(200).json({
      data: await getUnmatchedStatementLines(
        companyId,
        req.query.bankAccountId,
      ),
    });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function getUnmatchedJEsHandler(req, res) {
  const { companyId } = req.user;
  try {
    return res
      .status(200)
      .json({ data: await getUnmatchedJournalEntries(companyId) });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function matchHandler(req, res) {
  const { companyId, userId } = req.user;
  const { bankStatementLineId, journalEntryId } = req.body;
  if (!bankStatementLineId || !journalEntryId)
    return res.status(422).json({
      message: "bankStatementLineId and journalEntryId are required.",
    });
  try {
    const result = await matchLineToJournalEntry(
      companyId,
      bankStatementLineId,
      journalEntryId,
      userId,
    );
    // MATCH is a custom action — requires the expanded DB constraint
    await auditLog(
      companyId,
      userId,
      "MATCH",
      "BankReconciliation",
      bankStatementLineId,
      { journalEntryId, matched: true },
    );
    return res.status(200).json(result);
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function unmatchHandler(req, res) {
  const { companyId, userId } = req.user;
  const { bankStatementLineId } = req.body;
  if (!bankStatementLineId)
    return res
      .status(422)
      .json({ message: "bankStatementLineId is required." });
  try {
    const result = await unmatchLine(companyId, bankStatementLineId, userId);
    await auditLog(
      companyId,
      userId,
      "UPDATE",
      "BankReconciliation",
      bankStatementLineId,
      { matched: false },
    );
    return res.status(200).json({ message: "Unmatched.", data: result });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function createAdjustmentHandler(req, res) {
  const { companyId, userId } = req.user;
  try {
    const result = await createAdjustmentEntry(
      companyId,
      req.body.bankStatementLineId,
      { ...req.body, userId },
    );
    await auditLog(
      companyId,
      userId,
      "CREATE",
      "BankReconciliation",
      req.body.bankStatementLineId,
      { adjustment: true },
    );
    return res.status(201).json(result);
  } catch (err) {
    return handleErr(res, err);
  }
}

// ═════════════════════════════════════════════════════════════
// RECONCILIATION SESSIONS
// ═════════════════════════════════════════════════════════════

export async function startSessionHandler(req, res) {
  const { companyId, userId } = req.user;
  try {
    const data = await startSession(companyId, { ...req.body, userId });
    await auditLog(companyId, userId, "CREATE", "ReconSession", data.id, {
      bankAccountId: data.bank_account_id,
      periodStart: data.period_start,
      periodEnd: data.period_end,
    });
    return res
      .status(201)
      .json({ message: "Reconciliation session started.", data });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function listSessionsHandler(req, res) {
  const { companyId } = req.user;
  try {
    return res
      .status(200)
      .json({ data: await listSessions(companyId, req.query.bankAccountId) });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function getSessionHandler(req, res) {
  const { companyId } = req.user;
  try {
    return res
      .status(200)
      .json({ data: await getSessionProgress(companyId, req.params.id) });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function completeSessionHandler(req, res) {
  const { companyId, userId } = req.user;
  try {
    const result = await completeSession(companyId, req.params.id, userId);
    await auditLog(companyId, userId, "UPDATE", "ReconSession", req.params.id, {
      status: "Completed",
    });
    return res.status(200).json(result);
  } catch (err) {
    return handleErr(res, err);
  }
}

// ═════════════════════════════════════════════════════════════
// MANUAL GL RECONCILIATION
// ═════════════════════════════════════════════════════════════

export async function getLinesHandler(req, res) {
  const { companyId } = req.user;
  const { accountId } = req.params;
  const { from, to, reconciled } = req.query;
  try {
    let queryStr = `
      SELECT
        jel.id, jel.account_id, jel.journal_entry_id,
        jel.debit_amount, jel.credit_amount,
        je.entry_date, je.description, je.reference_number,
        COALESCE(rls.is_reconciled, false) AS is_reconciled,
        rls.reconciled_at, rls.reconciliation_note
      FROM journal_entry_lines jel
      JOIN journal_entries je ON je.id = jel.journal_entry_id
      LEFT JOIN recon_line_status rls
        ON  rls.journal_entry_line_id = jel.id
        AND rls.account_id            = $2
        AND rls.company_id            = $1
      WHERE je.company_id  = $1
        AND jel.account_id = $2
        AND je.status      = 'Posted'
    `;
    const params = [companyId, accountId];
    if (from) {
      params.push(from);
      queryStr += ` AND je.entry_date >= $${params.length}`;
    }
    if (to) {
      params.push(to);
      queryStr += ` AND je.entry_date <= $${params.length}`;
    }
    if (reconciled === "yes")
      queryStr += ` AND COALESCE(rls.is_reconciled, false) = true`;
    if (reconciled === "no")
      queryStr += ` AND COALESCE(rls.is_reconciled, false) = false`;
    queryStr += ` ORDER BY je.entry_date DESC, jel.id ASC`;
    const result = await db.query(queryStr, params);
    return res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error("[Reconciliation Lines Error]", err.message);
    return res.status(500).json({ message: "Failed to load transactions." });
  }
}

export async function confirmLinesHandler(req, res) {
  const { companyId, userId } = req.user;
  const { accountId } = req.params;
  const { lineIds, note } = req.body;
  if (!Array.isArray(lineIds) || lineIds.length === 0)
    return res.status(422).json({ message: "lineIds array is required." });
  try {
    await db.query(
      `INSERT INTO recon_line_status
         (company_id, account_id, journal_entry_line_id,
          is_reconciled, reconciled_at, reconciliation_note, reconciled_by)
       SELECT $1, $2, jel.id, true, NOW(), $3, $4
       FROM journal_entry_lines jel
       JOIN journal_entries je ON je.id = jel.journal_entry_id
       WHERE je.company_id = $1 AND jel.account_id = $2 AND jel.id = ANY($5::uuid[])
       ON CONFLICT (account_id, journal_entry_line_id)
       DO UPDATE SET
         is_reconciled       = true,
         reconciled_at       = NOW(),
         reconciliation_note = EXCLUDED.reconciliation_note,
         reconciled_by       = EXCLUDED.reconciled_by,
         updated_at          = NOW()`,
      [companyId, accountId, note || null, userId, lineIds],
    );
    // CONFIRM is a custom action — requires the expanded DB constraint
    await auditLog(
      companyId,
      userId,
      "CONFIRM",
      "BankReconciliation",
      accountId,
      { confirmedLines: lineIds.length, note },
    );
    return res.status(200).json({ message: "Lines confirmed." });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function unconfirmLinesHandler(req, res) {
  const { companyId, userId } = req.user;
  const { accountId } = req.params;
  const { lineIds } = req.body;
  if (!Array.isArray(lineIds) || lineIds.length === 0)
    return res.status(422).json({ message: "lineIds array is required." });
  try {
    await db.query(
      `UPDATE recon_line_status
       SET is_reconciled = false, reconciled_at = NULL,
           reconciliation_note = NULL, updated_at = NOW()
       WHERE company_id = $1 AND account_id = $2
         AND journal_entry_line_id = ANY($3::uuid[])`,
      [companyId, accountId, lineIds],
    );
    await auditLog(
      companyId,
      userId,
      "UPDATE",
      "BankReconciliation",
      accountId,
      { unconfirmedLines: lineIds.length },
    );
    return res
      .status(200)
      .json({ message: "Reconciliation removed from lines." });
  } catch (err) {
    return handleErr(res, err);
  }
}

export async function getSummaryHandler(req, res) {
  const { companyId } = req.user;
  const { accountId } = req.params;
  try {
    const result = await db.query(
      `SELECT
         COUNT(jel.id)::int                                                              AS total_lines,
         COUNT(rls.id) FILTER (WHERE rls.is_reconciled = true)::int                     AS confirmed_count,
         COUNT(jel.id) FILTER (WHERE COALESCE(rls.is_reconciled, false) = false)::int   AS unconfirmed_count,
         COALESCE(SUM(jel.debit_amount),  0)::bigint                                    AS total_debit,
         COALESCE(SUM(jel.credit_amount), 0)::bigint                                    AS total_credit
       FROM journal_entry_lines jel
       JOIN journal_entries je ON je.id = jel.journal_entry_id
       LEFT JOIN recon_line_status rls
         ON  rls.journal_entry_line_id = jel.id
         AND rls.account_id            = $2
         AND rls.company_id            = $1
       WHERE je.company_id = $1 AND jel.account_id = $2 AND je.status = 'Posted'`,
      [companyId, accountId],
    );
    const m = result.rows[0];
    m.running_balance = Number(m.total_debit) - Number(m.total_credit);
    return res.status(200).json({ data: m });
  } catch (err) {
    return handleErr(res, err);
  }
}