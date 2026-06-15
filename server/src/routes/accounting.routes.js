

import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";

// ── Group 1: Core accounting controller ───────────────────────
import {
  setupAccounting,
  getAccounts,
  getAccountById,
  getAccountingSummary,
  createAccount,
  updateAccount,
  deactivateAccount,
  createJournalEntryHandler,
  getJournalEntries,
  getJournalEntryById,
  postJournalEntryHandler,
  voidJournalEntryHandler,
  getGeneralLedger,
  getAuditTrail,
  getRecordAuditTrail,
} from "../controllers/accounting.controller.js";

// ── Group 3: Tax + Reconciliation controller ──────────────────
import {
  // Tax Config
  createOrUpdateTaxConfig,
  getAllTaxConfigs,
  updateTaxConfigHandler,
  deactivateTaxConfigHandler,
  // VAT
  getVatSummary,
  fileVatPeriod,
  payVatHandler,
  getVatHistoryHandler,
  // WHT
  getWhtSummaryHandler,
  remitWhtHandler,
  getWhtHistoryHandler,
  // PAYE
  getPayeSummaryHandler,
  remitPayeHandler,
  getPayeHistoryHandler,
  // Statutory (Pension / NHF / NSITF)
  getStatutorySummaryHandler,
  remitStatutoryHandler,
  getStatutoryHistoryHandler,
  // Tax Calendar
  getTaxCalendar,
  getOverdueTaxCalendar,
  // Bank Accounts
  createBankAccountHandler,
  listBankAccountsHandler,
  updateBankAccountHandler,
  updateBankBalanceHandler,
  // CSV Import (multer middleware bundled here)
  csvUpload,
  importStatementHandler,
  // Matching
  getUnmatchedHandler,
  getUnmatchedJEsHandler,
  matchHandler,
  unmatchHandler,
  createAdjustmentHandler,
  // Manual GL Account Reconciliation Operations
  getLinesHandler,
  confirmLinesHandler,
  unconfirmLinesHandler,
  getSummaryHandler,
  // Reconciliation Sessions
  startSessionHandler,
  listSessionsHandler,
  getSessionHandler,
  completeSessionHandler,
} from "../controllers/tax.controller.js";

const accountingRouter = Router();

// Every accounting endpoint requires a valid JWT
accountingRouter.use(authenticate);

// ═════════════════════════════════════════════════════════════
// GROUP 1 — CORE ACCOUNTING
// ═════════════════════════════════════════════════════════════

// ── Setup ─────────────────────────────────────────────────────
// Seeds default chart of accounts for the company (run once on onboarding)
accountingRouter.post("/setup", setupAccounting);

// ── Chart of Accounts ─────────────────────────────────────────
accountingRouter.get("/accounts", getAccounts);
accountingRouter.get("/accounts/:id", getAccountById);
accountingRouter.get("/summary", getAccountingSummary);
accountingRouter.post("/accounts", createAccount);
accountingRouter.put("/accounts/:id", updateAccount);
accountingRouter.delete("/accounts/:id", deactivateAccount);

// ── Journal Entries ───────────────────────────────────────────
// GET    ?status=Draft|Posted|Void&from=YYYY-MM-DD&to=YYYY-MM-DD&accountId=&page=1&limit=20
accountingRouter.get("/journal-entries", getJournalEntries);
accountingRouter.get("/journal-entries/:id", getJournalEntryById);
// POST body: { entryDate, description, lines: [{ accountId, debitAmount, creditAmount }] }
// Amounts in KOBO. Creates in Draft status. Debits must equal credits.
accountingRouter.post("/journal-entries", createJournalEntryHandler);
accountingRouter.post("/journal-entries/:id/post", postJournalEntryHandler);
// POST body: { reason? }  → voids Posted entry + auto-creates reversal
accountingRouter.post("/journal-entries/:id/void", voidJournalEntryHandler);

// ── General Ledger ────────────────────────────────────────────
// GET /general-ledger/:accountId?from=YYYY-MM-DD&to=YYYY-MM-DD
accountingRouter.get("/general-ledger/:accountId", getGeneralLedger);

// // ── Audit Trail ───────────────────────────────────────────────
// // GET ?userId=&module=ChartOfAccounts|JournalEntry&action=CREATE|UPDATE|DELETE|POST|VOID&from=&to=&page=1&limit=50
// accountingRouter.get("/audit-trail", getAuditTrail);
// accountingRouter.get("/audit-trail/:recordId", getRecordAuditTrail);
// ── Audit Trail ───────────────────────────────────────────────
// GET ?userId=&module=JournalEntry|ChartOfAccounts|BankReconciliation|BankAccount|
//             ReconSession|TaxConfig|VAT|WHT|PAYE|Statutory
//     &action=CREATE|UPDATE|DELETE|POST|VOID|REMIT|FILE|CONFIRM|IMPORT|MATCH
//     &from=YYYY-MM-DD&to=YYYY-MM-DD&page=1&limit=50
accountingRouter.get("/audit-trail", getAuditTrail);
accountingRouter.get("/audit-trail/:recordId", getRecordAuditTrail);

// ═════════════════════════════════════════════════════════════
// GROUP 3 — TAX MANAGEMENT
// ═════════════════════════════════════════════════════════════

// ── Tax Config ────────────────────────────────────────────────
// POST body: { taxType, rate, effectiveDate?, notes? }
accountingRouter.post("/tax/config", createOrUpdateTaxConfig);
accountingRouter.get("/tax/config", getAllTaxConfigs);
// PUT body: { rate?, effectiveDate?, notes? }
accountingRouter.put("/tax/config/:id", updateTaxConfigHandler);
accountingRouter.post("/tax/config/:id/deactivate", deactivateTaxConfigHandler);

// ── VAT ───────────────────────────────────────────────────────
// GET  ?period=YYYY-MM  — builds/refreshes VAT summary from invoices & bills
accountingRouter.get("/tax/vat/summary", getVatSummary);
// POST body: { period }
accountingRouter.post("/tax/vat/file", fileVatPeriod);
// POST body: { period, amountPaid (kobo), paymentDate, paymentReference }
// Creates GL journal entry: Dr VAT Payable (2200)  Cr Bank (1002)
accountingRouter.post("/tax/vat/pay", payVatHandler);
accountingRouter.get("/tax/vat/history", getVatHistoryHandler);

// ── WHT ───────────────────────────────────────────────────────
// GET  ?period=YYYY-MM
accountingRouter.get("/tax/wht/summary", getWhtSummaryHandler);
// POST body: { period, totalAmount (kobo), remittanceDate, remittanceReference }
// Creates GL journal entry: Dr WHT Payable (2300)  Cr Bank (1002)
accountingRouter.post("/tax/wht/remit", remitWhtHandler);
accountingRouter.get("/tax/wht/history", getWhtHistoryHandler);

// ── PAYE ──────────────────────────────────────────────────────
// GET  ?period=YYYY-MM  — builds summary from payroll_records
accountingRouter.get("/tax/paye/summary", getPayeSummaryHandler);
// POST body: { period, remittanceDate, remittanceReference }
// Creates GL journal entry: Dr PAYE Payable (2400)  Cr Bank (1002)
accountingRouter.post("/tax/paye/remit", remitPayeHandler);
accountingRouter.get("/tax/paye/history", getPayeHistoryHandler);

// ── Statutory Deductions — :type = Pension | NHF | NSITF ─────
// GET  ?period=YYYY-MM
accountingRouter.get(
  "/tax/statutory/:type/summary",
  getStatutorySummaryHandler,
);
// POST body: { period, remittanceDate, remittanceReference, remittedTo? }
// Creates GL JE: Dr Payable (2500/2600/2700)  Cr Bank (1002)
accountingRouter.post("/tax/statutory/:type/remit", remitStatutoryHandler);
accountingRouter.get(
  "/tax/statutory/:type/history",
  getStatutoryHistoryHandler,
);

// ── Tax Calendar ──────────────────────────────────────────────
// Returns all upcoming/current tax obligations with due dates & statuses
accountingRouter.get("/tax/calendar", getTaxCalendar);
// Returns only overdue items
accountingRouter.get("/tax/calendar/overdue", getOverdueTaxCalendar);

// ═════════════════════════════════════════════════════════════
// GROUP 3 — BANK RECONCILIATION
// ═════════════════════════════════════════════════════════════

// ── Bank Accounts ─────────────────────────────────────────────
// POST body: { bankName, accountName, accountNumber, currency?, currentBalance?, glAccountId? }
accountingRouter.post(
  "/reconciliation/bank-accounts",
  createBankAccountHandler,
);
accountingRouter.get("/reconciliation/bank-accounts", listBankAccountsHandler);
// PUT body: { bankName?, accountName?, currency?, glAccountId? }
accountingRouter.put(
  "/reconciliation/bank-accounts/:id",
  updateBankAccountHandler,
);
// POST body: { balance }  — balance in KOBO
accountingRouter.post(
  "/reconciliation/bank-accounts/:id/update-balance",
  updateBankBalanceHandler,
);

// ── CSV Statement Import ──────────────────────────────────────
// POST multipart/form-data: statement (file) + bankAccountId (field)
// Parses CSV, inserts bank_statement_lines, auto-matches where possible
// Expected CSV columns: Date, Description, Debit, Credit, Balance, Reference (case-insensitive)
accountingRouter.post(
  "/reconciliation/import",
  csvUpload,
  importStatementHandler,
);

// ── Matching ──────────────────────────────────────────────────
// GET ?bankAccountId=  — unmatched bank statement lines
accountingRouter.get("/reconciliation/unmatched", getUnmatchedHandler);
// GET — posted journal entries not yet matched to any bank line
accountingRouter.get(
  "/reconciliation/journal-entries/unmatched",
  getUnmatchedJEsHandler,
);
// POST body: { bankStatementLineId, journalEntryId }
// Validates amount match before linking
accountingRouter.post("/reconciliation/match", matchHandler);
// POST body: { bankStatementLineId }
accountingRouter.post("/reconciliation/unmatch", unmatchHandler);
// POST body: { bankStatementLineId, debitAccountId, creditAccountId, description? }
// Creates a Posted adjustment JE and auto-matches the line
accountingRouter.post(
  "/reconciliation/create-adjustment",
  createAdjustmentHandler,
);

// ── Manual GL Account Reconciliation ──────────────────────────
// Explicitly isolated under /accounts/:accountId to bypass wildcard session routing conflicts
accountingRouter.get(
  "/reconciliation/accounts/:accountId/lines",
  getLinesHandler,
);
accountingRouter.post(
  "/reconciliation/accounts/:accountId/confirm",
  confirmLinesHandler,
);
accountingRouter.post(
  "/reconciliation/accounts/:accountId/unconfirm",
  unconfirmLinesHandler,
);
accountingRouter.get(
  "/reconciliation/accounts/:accountId/summary",
  getSummaryHandler,
);

// ── Reconciliation Sessions ───────────────────────────────────
// POST body: { bankAccountId, periodStart, periodEnd, openingBalance, closingBalance }
accountingRouter.post("/reconciliation/sessions", startSessionHandler);
// GET ?bankAccountId=  — list all sessions (optionally filtered)
accountingRouter.get("/reconciliation/sessions", listSessionsHandler);
// GET — progress: matched/unmatched counts, book vs bank balance, difference
accountingRouter.get("/reconciliation/sessions/:id", getSessionHandler);
// POST — completes session only if difference === 0
accountingRouter.post(
  "/reconciliation/sessions/:id/complete",
  completeSessionHandler,
);

export default accountingRouter;