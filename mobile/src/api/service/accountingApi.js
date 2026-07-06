

// src/api/service/accountingApi.js
//
// Complete frontend API service for the BantaHR Accounting Module.
// All amounts: KOBO on the wire (backend stores kobo).
// Frontend display helpers included at the bottom.
//
// Base URL: /api/accounting  (mounted in app.js)

import API from "../axios";

// ═════════════════════════════════════════════════════════════
// DISPLAY HELPERS (used across accounting UI components)
// ═════════════════════════════════════════════════════════════

/** Format kobo integer → ₦1,234.56 */
export const formatNaira = (kobo) => {
  if (kobo == null) return "₦0.00";
  const naira = Number(kobo) / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(naira);
};

/** Naira (number) → kobo integer */
export const nairaToKobo = (naira) => Math.round(Number(naira) * 100);

/** Kobo integer → naira number */
export const koboToNaira = (kobo) => Number(kobo) / 100;

// Status badge colours used across accounting tabs
export const JE_STATUS_COLORS = {
  Draft:  { bg: "#FEF3C7", color: "#D97706" },
  Posted: { bg: "#D1FAE5", color: "#059669" },
  Void:   { bg: "#FEE2E2", color: "#DC2626" },
};

export const RECON_STATUS_COLORS = {
  "In Progress": { bg: "#DBEAFE", color: "#2563EB" },
  Completed:     { bg: "#D1FAE5", color: "#059669" },
};

export const TAX_STATUS_COLORS = {
  Pending:   { bg: "#FEF3C7", color: "#D97706" },
  Remitted:  { bg: "#D1FAE5", color: "#059669" },
  Filed:     { bg: "#DBEAFE", color: "#2563EB" },
  Paid:      { bg: "#D1FAE5", color: "#059669" },
  Open:      { bg: "#F3E8FF", color: "#7C3AED" },
};

// COA type colours
export const COA_TYPE_COLORS = {
  Asset:     { bg: "#DBEAFE", color: "#1D4ED8" },
  Liability: { bg: "#FEE2E2", color: "#DC2626" },
  Equity:    { bg: "#F3E8FF", color: "#7C3AED" },
  Income:    { bg: "#D1FAE5", color: "#059669" },
  Expense:   { bg: "#FEF3C7", color: "#D97706" },
};

// ═════════════════════════════════════════════════════════════
// SETUP
// ═════════════════════════════════════════════════════════════

const setup = () =>
  API.post("/accounting/setup").then((r) => r.data);

// ═════════════════════════════════════════════════════════════
// CHART OF ACCOUNTS
// ═════════════════════════════════════════════════════════════

const getAccounts = (params = {}) =>
  API.get("/accounting/accounts", { params }).then((r) => r.data);

const getAccountById = (id) =>
  API.get(`/accounting/accounts/${id}`).then((r) => r.data);

const getSummary = () =>
  API.get("/accounting/summary").then((r) => r.data);

const createAccount = (payload) =>
  API.post("/accounting/accounts", payload).then((r) => r.data);

const updateAccount = (id, payload) =>
  API.put(`/accounting/accounts/${id}`, payload).then((r) => r.data);

const deactivateAccount = (id) =>
  API.delete(`/accounting/accounts/${id}`).then((r) => r.data);

// ═════════════════════════════════════════════════════════════
// JOURNAL ENTRIES
// ═════════════════════════════════════════════════════════════

const getJournalEntries = (params = {}) =>
  API.get("/accounting/journal-entries", { params }).then((r) => r.data);

const getJournalEntryById = (id) =>
  API.get(`/accounting/journal-entries/${id}`).then((r) => r.data);

/**
 * Create a new journal entry (Draft).
 * payload: { entryDate, description, lines: [{ accountId, debitAmount, creditAmount }] }
 * Amounts in KOBO.
 */
const createJournalEntry = (payload) =>
  API.post("/accounting/journal-entries", payload).then((r) => r.data);

const postJournalEntry = (id) =>
  API.post(`/accounting/journal-entries/${id}/post`).then((r) => r.data);

const voidJournalEntry = (id, reason) =>
  API.post(`/accounting/journal-entries/${id}/void`, { reason }).then((r) => r.data);

// ═════════════════════════════════════════════════════════════
// GENERAL LEDGER
// ═════════════════════════════════════════════════════════════

/**
 * Full ledger for one account — opening balance, transactions, running balance, closing balance.
 * params: { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
 */
const getGeneralLedger = (accountId, params = {}) =>
  API.get(`/accounting/general-ledger/${accountId}`, { params }).then((r) => r.data);

// ═════════════════════════════════════════════════════════════
// AUDIT TRAIL
// ═════════════════════════════════════════════════════════════

const getAuditTrail = (params = {}) =>
  API.get("/accounting/audit-trail", { params }).then((r) => r.data);

const getRecordAuditTrail = (recordId) =>
  API.get(`/accounting/audit-trail/${recordId}`).then((r) => r.data);

// ═════════════════════════════════════════════════════════════
// MANUAL BANK RECONCILIATION
// ═════════════════════════════════════════════════════════════
//
// The reconciliation flow:
//   1. User picks an account TYPE (Asset / Liability / etc.)
//   2. User picks a specific GL account within that type
//   3. Backend returns all POSTED journal entry lines for that account
//   4. User checks off (confirms) each line that matches their bank statement
//   5. Frontend sends the confirmed line IDs to /reconciliation/accounts/:accountId/confirm
//   6. Backend marks those lines as reconciled

// const reconciliation = {
//   /**
//    * GET /accounting/reconciliation/accounts?type=Asset&search=
//    * Returns accounts filtered by type (for the left-panel picker).
//    * Reuses the existing getAccounts endpoint with a type filter.
//    */
//   getAccountsByType: (type, search) =>
//     API.get("/accounting/accounts", {
//       params: { type, active: true, ...(search ? { search } : {}) },
//     }).then((r) => r.data),

//   // /**
//   //  * GET /accounting/reconciliation/accounts/:accountId/lines
//   //  * Returns all posted journal entry lines for a GL account.
//   //  * params: { from, to, reconciled } — reconciled: 'yes'|'no'|'' (default all)
//   //  */
//   // getLines: (accountId, params = {}) =>
//   //   API.get(`/accounting/reconciliation/accounts/${accountId}/lines`, { params }).then((r) => r.data),

//   // /**
//   //  * POST /accounting/reconciliation/accounts/:accountId/confirm
//   //  * body: { lineIds: string[], note? }
//   //  * Marks the given journal entry line IDs as reconciled for this account.
//   //  */
//   // confirm: (accountId, lineIds, note) =>
//   //   API.post(`/accounting/reconciliation/accounts/${accountId}/confirm`, { lineIds, note }).then((r) => r.data),

//   // /**
//   //  * POST /accounting/reconciliation/accounts/:accountId/unconfirm
//   //  * body: { lineIds: string[] }
//   //  * Reverts reconciliation on specific lines (for corrections).
//   //  */
//   // unconfirm: (accountId, lineIds) =>
//   //   API.post(`/accounting/reconciliation/accounts/${accountId}/unconfirm`, { lineIds }).then((r) => r.data),

//   // /**
//   //  * GET /accounting/reconciliation/accounts/:accountId/summary
//   //  * Returns: total posted lines, confirmed count, unconfirmed count,
//   //  * total debit, total credit, running balance.
//   //  */
//   // getSummary: (accountId, params = {}) =>
//   //   API.get(`/accounting/reconciliation/accounts/${accountId}/summary`, { params }).then((r) => r.data),

//   /**
//    * GET /accounting/reconciliation/accounts/:accountId/lines
//    * Returns all posted journal entry lines for a GL account directly from core journal records.
//    * params: { from, to, reconciled } — reconciled: 'yes'|'no'|'' (default all)
//    */
//   getLines: (accountId, params = {}) =>
//     API.get(`/accounting/reconciliation/accounts/${accountId}/lines`, {
//       params,
//     }).then((r) => {
//       // Unpack the backend's data wrapper envelope safely
//       const rawLines = r.data?.data || r.data || [];

//       // Map backend snake_case keys to frontend camelCase keys for your component state
//       return rawLines.map((line) => ({
//         id: line.id,
//         accountId: line.account_id,
//         journalEntryId: line.journal_entry_id,
//         debitAmount: Number(line.debit_amount || 0),
//         creditAmount: Number(line.credit_amount || 0),
//         reconciled: line.is_reconciled || false,
//         entryDate: line.entry_date,
//         description:
//           line.description || `Journal Ref: ${line.reference_number || "N/A"}`,
//         referenceNumber: line.reference_number,
//       }));
//     }),

//   /**
//    * POST /accounting/reconciliation/accounts/:accountId/confirm
//    * body: { lineIds: string[], note? }
//    * Marks the given journal entry line IDs as reconciled for this account.
//    */
//   confirm: (accountId, lineIds, note) =>
//     API.post(`/accounting/reconciliation/accounts/${accountId}/confirm`, {
//       lineIds,
//       note,
//     }).then((r) => r.data),

//   /**
//    * POST /accounting/reconciliation/accounts/:accountId/unconfirm
//    * body: { lineIds: string[] }
//    * Reverts reconciliation on specific lines (for corrections).
//    */
//   unconfirm: (accountId, lineIds) =>
//     API.post(`/accounting/reconciliation/accounts/${accountId}/unconfirm`, {
//       lineIds,
//     }).then((r) => r.data),

//   /**
//    * GET /accounting/reconciliation/accounts/:accountId/summary
//    * Returns: total posted lines, confirmed count, unconfirmed count,
//    * total debit, total credit, running balance.
//    */
//   getSummary: (accountId, params = {}) =>
//     API.get(`/accounting/reconciliation/accounts/${accountId}/summary`, {
//       params,
//     }).then((r) => {
//       // Unpack the backend metrics object safely
//       const s = r.data?.data || r.data || {};

//       return {
//         totalLines: s.total_lines || 0,
//         confirmedCount: s.confirmed_count || 0,
//         unconfirmedCount: s.unconfirmed_count || 0,
//         totalDebit: Number(s.total_debit || 0),
//         totalCredit: Number(s.total_credit || 0),
//         runningBalance: Number(s.running_balance || 0),
//       };
//     }),

//   // ── Bank Accounts (optional CSV-based flow) ───────────────
//   bankAccounts: {
//     list: () =>
//       API.get("/accounting/reconciliation/bank-accounts").then((r) => r.data),
//     create: (payload) =>
//       API.post("/accounting/reconciliation/bank-accounts", payload).then(
//         (r) => r.data,
//       ),
//     update: (id, p) =>
//       API.put(`/accounting/reconciliation/bank-accounts/${id}`, p).then(
//         (r) => r.data,
//       ),
//     updateBalance: (id, balance) =>
//       API.post(
//         `/accounting/reconciliation/bank-accounts/${id}/update-balance`,
//         { balance },
//       ).then((r) => r.data),
//   },

//   // ── CSV Import ────────────────────────────────────────────
//   importStatement: (bankAccountId, file) => {
//     const fd = new FormData();
//     fd.append("statement", file);
//     fd.append("bankAccountId", bankAccountId);
//     return API.post("/accounting/reconciliation/import", fd, {
//       headers: { "Content-Type": "multipart/form-data" },
//     }).then((r) => r.data);
//   },

//   // ── Match / Unmatch ───────────────────────────────────────
//   getUnmatched: (bankAccountId) =>
//     API.get("/accounting/reconciliation/unmatched", {
//       params: bankAccountId ? { bankAccountId } : {},
//     }).then((r) => r.data),

//   getUnmatchedJournalEntries: () =>
//     API.get("/accounting/reconciliation/journal-entries/unmatched").then(
//       (r) => r.data,
//     ),

//   match: (bankStatementLineId, journalEntryId) =>
//     API.post("/accounting/reconciliation/match", {
//       bankStatementLineId,
//       journalEntryId,
//     }).then((r) => r.data),

//   unmatch: (bankStatementLineId) =>
//     API.post("/accounting/reconciliation/unmatch", {
//       bankStatementLineId,
//     }).then((r) => r.data),

//   createAdjustment: (payload) =>
//     API.post("/accounting/reconciliation/create-adjustment", payload).then(
//       (r) => r.data,
//     ),

//   // ── Sessions ──────────────────────────────────────────────
//   sessions: {
//     start: (payload) =>
//       API.post("/accounting/reconciliation/sessions", payload).then(
//         (r) => r.data,
//       ),
//     list: (bankAccountId) =>
//       API.get("/accounting/reconciliation/sessions", {
//         params: bankAccountId ? { bankAccountId } : {},
//       }).then((r) => r.data),
//     get: (id) =>
//       API.get(`/accounting/reconciliation/sessions/${id}`).then((r) => r.data),
//     complete: (id) =>
//       API.post(`/accounting/reconciliation/sessions/${id}/complete`).then(
//         (r) => r.data,
//       ),
//   },
// };

// ═════════════════════════════════════════════════════════════
// MANUAL BANK RECONCILIATION
// ═════════════════════════════════════════════════════════════

const reconciliation = {
  /**
   * GET /accounting/reconciliation/accounts?type=Asset&search=
   * Returns accounts filtered by type (for the left-panel picker).
   * Reuses the existing getAccounts endpoint with a type filter.
   */
  getAccountsByType: (type, search) =>
    API.get("/accounting/accounts", {
      params: { type, active: true, ...(search ? { search } : {}) },
    }).then((r) => r.data),

  /**
   * GET /accounting/reconciliation/accounts/:accountId/lines
   * Returns all posted journal entry lines for a GL account directly from core journal records.
   * params: { from, to, reconciled } — reconciled: 'yes'|'no'|'' (default all)
   */
  getLines: (accountId, params = {}) =>
    API.get(`/accounting/reconciliation/accounts/${accountId}/lines`, {
      params,
    }).then((r) => {
      // Unpack the backend's data wrapper envelope safely
      const rawLines = r.data?.data || r.data || [];

      // Map backend snake_case keys to frontend camelCase keys for your component state
      return rawLines.map((line) => ({
        id: line.id,
        accountId: line.account_id,
        journalEntryId: line.journal_entry_id,
        debitAmount: Number(line.debit_amount || 0),
        creditAmount: Number(line.credit_amount || 0),
        reconciled: line.reconciled || line.is_reconciled || false,
        entryDate: line.entry_date,
        description:
          line.description || `Journal Ref: ${line.reference_number || "N/A"}`,
        referenceNumber: line.reference_number,
      }));
    }),

  /**
   * POST /accounting/reconciliation/accounts/:accountId/confirm
   * body: { lineIds: string[], note?, bankAccountId }
   * Marks the given journal entry line IDs as reconciled for this account.
   */
  confirm: (accountId, lineIds, note, bankAccountId) =>
    API.post(`/accounting/reconciliation/accounts/${accountId}/confirm`, {
      lineIds,
      note,
      bankAccountId,
    }).then((r) => r.data),

  /**
   * POST /accounting/reconciliation/accounts/:accountId/unconfirm
   * body: { lineIds: string[], bankAccountId }
   * Reverts reconciliation on specific lines (for corrections).
   */
  unconfirm: (accountId, lineIds, bankAccountId) =>
    API.post(`/accounting/reconciliation/accounts/${accountId}/unconfirm`, {
      lineIds,
      bankAccountId,
    }).then((r) => r.data),

  /**
   * GET /accounting/reconciliation/accounts/:accountId/summary
   * Returns: total posted lines, confirmed count, unconfirmed count,
   * total debit, total credit, running balance.
   */
  getSummary: (accountId, params = {}) =>
    API.get(`/accounting/reconciliation/accounts/${accountId}/summary`, {
      params,
    }).then((r) => {
      // Unpack the backend metrics object safely
      const s = r.data?.data || r.data || {};

      return {
        totalLines: s.total_lines || 0,
        confirmedCount: s.confirmed_count || 0,
        unconfirmedCount: s.unconfirmed_count || 0,
        totalDebit: Number(s.total_debit || 0),
        totalCredit: Number(s.total_credit || 0),
        runningBalance: Number(s.running_balance || 0),
      };
    }),

  // ── Bank Accounts (optional CSV-based flow) ───────────────
  bankAccounts: {
    list: () =>
      API.get("/accounting/reconciliation/bank-accounts").then((r) => r.data),
    create: (payload) =>
      API.post("/accounting/reconciliation/bank-accounts", payload).then(
        (r) => r.data,
      ),
    update: (id, p) =>
      API.put(`/accounting/reconciliation/bank-accounts/${id}`, p).then(
        (r) => r.data,
      ),
    updateBalance: (id, balance) =>
      API.post(
        `/accounting/reconciliation/bank-accounts/${id}/update-balance`,
        { balance },
      ).then((r) => r.data),
  },

  // ── CSV Import ────────────────────────────────────────────
  importStatement: (bankAccountId, file) => {
    const fd = new FormData();
    fd.append("statement", file);
    fd.append("bankAccountId", bankAccountId);
    return API.post("/accounting/reconciliation/import", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },

  // ── Match / Unmatch ───────────────────────────────────────
  getUnmatched: (bankAccountId) =>
    API.get("/accounting/reconciliation/unmatched", {
      params: bankAccountId ? { bankAccountId } : {},
    }).then((r) => r.data),

  getUnmatchedJournalEntries: () =>
    API.get("/accounting/reconciliation/journal-entries/unmatched").then(
      (r) => r.data,
    ),

  match: (bankStatementLineId, journalEntryId) =>
    API.post("/accounting/reconciliation/match", {
      bankStatementLineId,
      journalEntryId,
    }).then((r) => r.data),

  unmatch: (bankStatementLineId) =>
    API.post("/accounting/reconciliation/unmatch", {
      bankStatementLineId,
    }).then((r) => r.data),

  createAdjustment: (payload) =>
    API.post("/accounting/reconciliation/create-adjustment", payload).then(
      (r) => r.data,
    ),

  // ── Sessions ──────────────────────────────────────────────
  sessions: {
    start: (payload) =>
      API.post("/accounting/reconciliation/sessions", payload).then(
        (r) => r.data,
      ),
    list: (bankAccountId) =>
      API.get("/accounting/reconciliation/sessions", {
        params: bankAccountId ? { bankAccountId } : {},
      }).then((r) => r.data),
    get: (id) =>
      API.get(`/accounting/reconciliation/sessions/${id}`).then((r) => r.data),
    complete: (id) =>
      API.post(`/accounting/reconciliation/sessions/${id}/complete`).then(
        (r) => r.data,
      ),
  },
};

// ═════════════════════════════════════════════════════════════
// TAX MANAGEMENT
// ═════════════════════════════════════════════════════════════

const tax = {
  // Config
  config: {
    getAll: () => API.get("/accounting/tax/config").then((r) => r.data),
    upsert: (payload) =>
      API.post("/accounting/tax/config", payload).then((r) => r.data),
    update: (id, p) =>
      API.put(`/accounting/tax/config/${id}`, p).then((r) => r.data),
    // deactivate: (id)        => API.post(`/accounting/tax/config/${id}/deactivate`).then((r) => r.data),
    deactivate: (id) =>
      API.delete(`/accounting/tax/config/${id}`).then((r) => r.data),
  },

  // VAT
  vat: {
    summary: (period) =>
      API.get("/accounting/tax/vat/summary", { params: { period } }).then(
        (r) => r.data,
      ),
    file: (period) =>
      API.post("/accounting/tax/vat/file", { period }).then((r) => r.data),
    pay: (payload) =>
      API.post("/accounting/tax/vat/pay", payload).then((r) => r.data),
    history: () => API.get("/accounting/tax/vat/history").then((r) => r.data),
  },

  // WHT
  wht: {
    summary: (period) =>
      API.get("/accounting/tax/wht/summary", { params: { period } }).then(
        (r) => r.data,
      ),
    remit: (payload) =>
      API.post("/accounting/tax/wht/remit", payload).then((r) => r.data),
    history: () => API.get("/accounting/tax/wht/history").then((r) => r.data),
  },

  // PAYE
  paye: {
    summary: (period) =>
      API.get("/accounting/tax/paye/summary", { params: { period } }).then(
        (r) => r.data,
      ),
    remit: (payload) =>
      API.post("/accounting/tax/paye/remit", payload).then((r) => r.data),
    history: () => API.get("/accounting/tax/paye/history").then((r) => r.data),
  },

  // Statutory (type = 'Pension' | 'NHF' | 'NSITF')
  statutory: {
    summary: (type, period) =>
      API.get(`/accounting/tax/statutory/${type}/summary`, {
        params: { period },
      }).then((r) => r.data),
    remit: (type, payload) =>
      API.post(`/accounting/tax/statutory/${type}/remit`, payload).then(
        (r) => r.data,
      ),
    history: (type) =>
      API.get(`/accounting/tax/statutory/${type}/history`).then((r) => r.data),
  },

  // Calendar
  calendar: () => API.get("/accounting/tax/calendar").then((r) => r.data),
  calendarOverdue: () =>
    API.get("/accounting/tax/calendar/overdue").then((r) => r.data),
};

// ═════════════════════════════════════════════════════════════
// DEFAULT EXPORT — named `accountingApi`
// ═════════════════════════════════════════════════════════════

export const accountingApi = {
  setup,
  getAccounts,
  getAccountById,
  getSummary,
  createAccount,
  updateAccount,
  deactivateAccount,
  getJournalEntries,
  getJournalEntryById,
  createJournalEntry,
  postJournalEntry,
  voidJournalEntry,
  getGeneralLedger,
  getAuditTrail,
  getRecordAuditTrail,
  recon: reconciliation,
  tax,
};