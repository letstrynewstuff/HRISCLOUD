// src/controllers/accounting.controller.js
//
// Handles all REST operations for the accounting module.
// Follows the same req/res pattern as every other BantaHR controller.
//
// All monetary values are received as numbers (₦) from the client and
// converted to kobo (× 100) before storage. They are converted back on read.

import { db } from "../config/db.js";
import {
  seedDefaultAccounts,
  createJournalEntry,
  postJournalEntry,
  voidJournalEntry,
  writeAuditLog,
  ValidationError,
  NotFoundError,
} from "../services/accounting.service.js";

// ─── Helper: convert req to audit context ──────────────────────
function auditCtx(req) {
  return {
    ip: req.ip ?? req.headers["x-forwarded-for"] ?? null,
    userAgent: req.headers["user-agent"] ?? null,
  };
}

// ─── Helper: kobo ↔ naira ──────────────────────────────────────
const toKobo = (n) => Math.round(Number(n) * 100);
const fromKobo = (n) => Number(n) / 100;

function formatEntry(je) {
  if (!je) return je;
  return { ...je }; // amounts stay as-is in kobo; the frontend formats display
}

// ═══════════════════════════════════════════════════════════════
// SETUP
// POST /api/accounting/setup
// Seed default chart of accounts for a company.
// Called automatically on company registration.
// ═══════════════════════════════════════════════════════════════
export async function setupAccounting(req, res) {
  const { companyId, userId } = req.user;
  try {
    await seedDefaultAccounts(companyId);
    await writeAuditLog({
      companyId,
      userId,
      action: "CREATE",
      module: "ChartOfAccounts",
      recordId: companyId,
      newValue: { seeded: true },
      ipAddress: auditCtx(req).ip,
    });
    return res
      .status(201)
      .json({ message: "Default chart of accounts created." });
  } catch (err) {
    console.error("setupAccounting:", err);
    return res.status(500).json({ message: "Failed to set up accounting." });
  }
}

// ═══════════════════════════════════════════════════════════════
// CHART OF ACCOUNTS
// ═══════════════════════════════════════════════════════════════

// GET /api/accounting/accounts
// Query: ?type=Asset&active=true&search=
// export async function getAccounts(req, res) {
//   const { companyId } = req.user;
//   const { type, active, search } = req.query;

//   const conditions = ["company_id = $1"];
//   const params = [companyId];
//   let idx = 2;

//   if (type) {
//     conditions.push(`account_type = $${idx++}`);
//     params.push(type);
//   }
//   if (active !== undefined) {
//     conditions.push(`is_active = $${idx++}`);
//     params.push(active === "true" || active === "1");
//   }
//   if (search) {
//     conditions.push(
//       `(account_name ILIKE $${idx} OR account_code ILIKE $${idx})`,
//     );
//     params.push(`%${search}%`);
//     idx++;
//   }

//   try {
//     const result = await db.query(
//       `SELECT
//          id, account_code, account_name, account_type,
//          parent_account_id, is_default, is_active, description,
//          created_at, updated_at
//        FROM chart_of_accounts
//        WHERE ${conditions.join(" AND ")}
//        ORDER BY account_code ASC`,
//       params,
//     );
//     return res.status(200).json({ data: result.rows, total: result.rowCount });
//   } catch (err) {
//     console.error("getAccounts:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }
export async function getAccounts(req, res) {
  const { companyId } = req.user;

  try {
    const result = await db.query(
      `
      WITH account_balances AS (
        SELECT
          coa.id AS account_id,
          COALESCE(
            SUM(
              CASE
                WHEN coa.account_type IN ('Asset','Expense')
                  THEN jel.debit_amount - jel.credit_amount
                ELSE
                  jel.credit_amount - jel.debit_amount
              END
            ),
            0
          ) AS balance
        FROM chart_of_accounts coa
        LEFT JOIN journal_entry_lines jel
          ON jel.account_id = coa.id
        LEFT JOIN journal_entries je
          ON je.id = jel.journal_entry_id
          AND je.status = 'Posted'
        WHERE coa.company_id = $1
        GROUP BY coa.id
      )
      SELECT
        coa.*,
        ab.balance
      FROM chart_of_accounts coa
      LEFT JOIN account_balances ab
        ON ab.account_id = coa.id
      WHERE coa.company_id = $1
      ORDER BY coa.account_code
      `,
      [companyId],
    );

    return res.json({
      data: result.rows,
      total: result.rowCount,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error",
    });
  }
}

export async function getAccountById(req, res) {
  const { companyId } = req.user;
  const { id } = req.params;

  try {
    const result = await db.query(
      `
      WITH account_balance AS (
        SELECT
          coa.id,
          COALESCE(
            SUM(
              CASE
                WHEN coa.account_type IN ('Asset', 'Expense')
                  THEN jel.debit_amount - jel.credit_amount
                ELSE
                  jel.credit_amount - jel.debit_amount
              END
            ),
            0
          ) AS balance
        FROM chart_of_accounts coa
        LEFT JOIN journal_entry_lines jel
          ON coa.id = jel.account_id
        LEFT JOIN journal_entries je
          ON je.id = jel.journal_entry_id
        WHERE coa.id = $1
          AND coa.company_id = $2
          AND (je.status = 'Posted' OR je.id IS NULL)
        GROUP BY coa.id
      )
      SELECT
        coa.*,
        ab.balance
      FROM chart_of_accounts coa
      LEFT JOIN account_balance ab
        ON ab.id = coa.id
      WHERE coa.id = $1
        AND coa.company_id = $2
      `,
      [id, companyId],
    );

    if (!result.rows.length) {
      return res.status(404).json({
        message: "Account not found.",
      });
    }

    return res.status(200).json({
      data: result.rows[0],
    });
  } catch (err) {
    console.error("getAccountById:", err);
    return res.status(500).json({
      message: "Server error.",
    });
  }
}

// GET /api/accounting/summary
export async function getAccountingSummary(req, res) {
  const { companyId } = req.user;

  try {
    const result = await db.query(
      `
      WITH balances AS (
        SELECT
          coa.account_type,
          CASE
            WHEN coa.account_type IN ('Asset','Expense')
              THEN SUM(jel.debit_amount - jel.credit_amount)
            ELSE
              SUM(jel.credit_amount - jel.debit_amount)
          END AS balance
        FROM chart_of_accounts coa
        JOIN journal_entry_lines jel
          ON jel.account_id = coa.id
        JOIN journal_entries je
          ON je.id = jel.journal_entry_id
        WHERE coa.company_id = $1
          AND je.status = 'Posted'
        GROUP BY coa.account_type
      )
      SELECT * FROM balances
      `,
      [companyId],
    );

    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Server error",
    });
  }
}

// POST /api/accounting/accounts
// Body: { accountCode, accountName, accountType, parentAccountId?, description? }
export async function createAccount(req, res) {
  const { companyId, userId } = req.user;
  const {
    accountCode,
    accountName,
    accountType,
    parentAccountId,
    description,
  } = req.body;

  if (!accountCode?.trim() || !accountName?.trim() || !accountType) {
    return res.status(422).json({
      message: "accountCode, accountName, and accountType are required.",
    });
  }
  const validTypes = ["Asset", "Liability", "Equity", "Income", "Expense"];
  if (!validTypes.includes(accountType)) {
    return res.status(422).json({
      message: `accountType must be one of: ${validTypes.join(", ")}.`,
    });
  }

  try {
    // Check for duplicate code
    const dup = await db.query(
      "SELECT id FROM chart_of_accounts WHERE company_id = $1 AND account_code = $2",
      [companyId, accountCode.trim()],
    );
    if (dup.rows.length)
      return res
        .status(409)
        .json({ message: `Account code '${accountCode}' already exists.` });

    // Validate parent if provided
    if (parentAccountId) {
      const parent = await db.query(
        "SELECT id, account_type FROM chart_of_accounts WHERE id = $1 AND company_id = $2",
        [parentAccountId, companyId],
      );
      if (!parent.rows.length)
        return res.status(422).json({ message: "Parent account not found." });
      if (parent.rows[0].account_type !== accountType) {
        return res.status(422).json({
          message: "Sub-account must have the same account type as its parent.",
        });
      }
    }

    const result = await db.query(
      `INSERT INTO chart_of_accounts
         (company_id, account_code, account_name, account_type,
          parent_account_id, description, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,FALSE)
       RETURNING *`,
      [
        companyId,
        accountCode.trim(),
        accountName.trim(),
        accountType,
        parentAccountId ?? null,
        description ?? null,
      ],
    );
    const account = result.rows[0];

    await writeAuditLog({
      companyId,
      userId,
      action: "CREATE",
      module: "ChartOfAccounts",
      recordId: account.id,
      newValue: account,
      ipAddress: auditCtx(req).ip,
    });

    return res.status(201).json({ message: "Account created.", data: account });
  } catch (err) {
    console.error("createAccount:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// PUT /api/accounting/accounts/:id
export async function updateAccount(req, res) {
  const { companyId, userId } = req.user;
  const { id } = req.params;
  const { accountName, description, isActive, parentAccountId } = req.body;

  try {
    const existing = await db.query(
      "SELECT * FROM chart_of_accounts WHERE id = $1 AND company_id = $2",
      [id, companyId],
    );
    if (!existing.rows.length)
      return res.status(404).json({ message: "Account not found." });
    const prev = existing.rows[0];

    // Prevent editing code/type of default system accounts
    if (prev.is_default && (req.body.accountCode || req.body.accountType)) {
      return res.status(422).json({
        message: "Cannot change code or type of a default system account.",
      });
    }

    const updated = await db.query(
      `UPDATE chart_of_accounts
       SET
         account_name      = COALESCE($1, account_name),
         description       = COALESCE($2, description),
         is_active         = COALESCE($3, is_active),
         parent_account_id = COALESCE($4, parent_account_id),
         updated_at        = NOW()
       WHERE id = $5 AND company_id = $6
       RETURNING *`,
      [accountName, description, isActive, parentAccountId, id, companyId],
    );

    await writeAuditLog({
      companyId,
      userId,
      action: "UPDATE",
      module: "ChartOfAccounts",
      recordId: id,
      previousValue: prev,
      newValue: updated.rows[0],
      ipAddress: auditCtx(req).ip,
    });

    return res
      .status(200)
      .json({ message: "Account updated.", data: updated.rows[0] });
  } catch (err) {
    console.error("updateAccount:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// DELETE /api/accounting/accounts/:id
// Soft-delete: sets is_active = false.
// Hard delete only allowed for custom non-default accounts with no transactions.
export async function deactivateAccount(req, res) {
  const { companyId, userId } = req.user;
  const { id } = req.params;

  try {
    const existing = await db.query(
      "SELECT * FROM chart_of_accounts WHERE id = $1 AND company_id = $2",
      [id, companyId],
    );
    if (!existing.rows.length)
      return res.status(404).json({ message: "Account not found." });
    const acct = existing.rows[0];

    // Check if account has any journal entry lines
    const usage = await db.query(
      "SELECT 1 FROM journal_entry_lines WHERE account_id = $1 LIMIT 1",
      [id],
    );

    if (usage.rows.length === 0 && !acct.is_default) {
      // Hard delete — never used and not a system account
      await db.query("DELETE FROM chart_of_accounts WHERE id = $1", [id]);
      await writeAuditLog({
        companyId,
        userId,
        action: "DELETE",
        module: "ChartOfAccounts",
        recordId: id,
        previousValue: acct,
        ipAddress: auditCtx(req).ip,
      });
      return res.status(200).json({ message: "Account deleted permanently." });
    }

    // Soft deactivate
    await db.query(
      "UPDATE chart_of_accounts SET is_active = FALSE, updated_at = NOW() WHERE id = $1",
      [id],
    );
    await writeAuditLog({
      companyId,
      userId,
      action: "UPDATE",
      module: "ChartOfAccounts",
      recordId: id,
      previousValue: { is_active: true },
      newValue: { is_active: false },
      ipAddress: auditCtx(req).ip,
    });
    return res.status(200).json({ message: "Account deactivated." });
  } catch (err) {
    console.error("deactivateAccount:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ═══════════════════════════════════════════════════════════════
// JOURNAL ENTRIES
// ═══════════════════════════════════════════════════════════════

// POST /api/accounting/journal-entries
// Body: { entryDate, description, lines: [{ accountId, debitAmount, creditAmount, description? }] }
// Amounts arrive in KOBO from the client.
// export async function createJournalEntryHandler(req, res) {
//   const { companyId, userId } = req.user;
//   const { entryDate, description, lines } = req.body;
//   const ctx = auditCtx(req);

//   if (!entryDate)
//     return res.status(422).json({ message: "entryDate is required." });
//   if (!Array.isArray(lines) || lines.length < 2) {
//     return res.status(422).json({
//       message: "At least two lines (one debit, one credit) are required.",
//     });
//   }

//   try {
//     const je = await createJournalEntry(
//       { companyId, createdBy: userId, entryDate, description, lines },
//       ctx.ip,
//       ctx.userAgent,
//     );
//     return res
//       .status(201)
//       .json({ message: "Journal entry created (Draft).", data: je });
//   } catch (err) {
//     if (err.status)
//       return res.status(err.status).json({ message: err.message });
//     console.error("createJournalEntryHandler:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// POST /api/accounting/journal-entries
export async function createJournalEntryHandler(req, res) {
  const { companyId, userId } = req.user;
  const { entryDate, description, lines, vatExempt, exemptCode } = req.body;
  const ctx = auditCtx(req);

  if (!entryDate)
    return res.status(422).json({ message: "entryDate is required." });
  if (!Array.isArray(lines) || lines.length < 2)
    return res.status(422).json({ message: "At least two lines are required." });

  // Validate exempt code server-side too
  const TAX_EXEMPT_CODE = "127669ED";
  const isExempt = vatExempt === true && exemptCode === TAX_EXEMPT_CODE;

  try {
    // If NOT exempt, verify VAT line is present (frontend adds it; double-check here)
    // The frontend already adds VAT lines into the `lines` array when applicable,
    // so we just pass them through. Server-side we record the exemption flag in the description.
    const finalDescription = isExempt
      ? `${description} [VAT EXEMPT: ${exemptCode}]`
      : description;

    const je = await createJournalEntry(
      {
        companyId,
        createdBy: userId,
        entryDate,
        description: finalDescription,
        lines,
      },
      ctx.ip,
      ctx.userAgent,
    );

    // Write audit log with VAT info
    await writeAuditLog({
      companyId,
      userId,
      action: "CREATE",
      module: "JournalEntry",
      recordId: je.id,
      newValue: {
        referenceNumber: je.reference_number,
        vatExempt: isExempt,
        exemptCode: isExempt ? exemptCode : null,
      },
      ipAddress: ctx.ip,
    });

    return res.status(201).json({ message: "Journal entry created (Draft).", data: je });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("createJournalEntryHandler:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// GET /api/accounting/journal-entries
// Query: ?status=Draft|Posted|Void &from=YYYY-MM-DD &to=YYYY-MM-DD &accountId= &page= &limit=
export async function getJournalEntries(req, res) {
  const { companyId } = req.user;
  const { status, from, to, accountId, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const conditions = ["je.company_id = $1"];
  const params = [companyId];
  let idx = 2;

  if (status) {
    conditions.push(`je.status = $${idx++}`);
    params.push(status);
  }
  if (from) {
    conditions.push(`je.entry_date >= $${idx++}`);
    params.push(from);
  }
  if (to) {
    conditions.push(`je.entry_date <= $${idx++}`);
    params.push(to);
  }
  if (accountId) {
    conditions.push(
      `EXISTS (SELECT 1 FROM journal_entry_lines jel WHERE jel.journal_entry_id = je.id AND jel.account_id = $${idx++})`,
    );
    params.push(accountId);
  }

  try {
    const total = await db.query(
      `SELECT COUNT(*) FROM journal_entries je WHERE ${conditions.join(" AND ")}`,
      params,
    );

    const result = await db.query(
      `SELECT
         je.*,
         u.email AS created_by_email,
         COALESCE(
           (SELECT SUM(jel.debit_amount)
            FROM journal_entry_lines jel
            WHERE jel.journal_entry_id = je.id), 0
         ) AS total_debits
       FROM journal_entries je
       LEFT JOIN users u ON u.id = je.created_by
       WHERE ${conditions.join(" AND ")}
       ORDER BY je.entry_date DESC, je.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset],
    );

    return res.status(200).json({
      data: result.rows,
      total: parseInt(total.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error("getJournalEntries:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// GET /api/accounting/journal-entries/:id
export async function getJournalEntryById(req, res) {
  const { companyId } = req.user;
  const { id } = req.params;

  try {
    const jeRes = await db.query(
      `SELECT je.*, u.email AS created_by_email
       FROM journal_entries je
       LEFT JOIN users u ON u.id = je.created_by
       WHERE je.id = $1 AND je.company_id = $2`,
      [id, companyId],
    );
    if (!jeRes.rows.length)
      return res.status(404).json({ message: "Journal entry not found." });

    const linesRes = await db.query(
      `SELECT
         jel.*,
         coa.account_code,
         coa.account_name,
         coa.account_type
       FROM journal_entry_lines jel
       JOIN chart_of_accounts coa ON coa.id = jel.account_id
       WHERE jel.journal_entry_id = $1
       ORDER BY jel.debit_amount DESC`,
      [id],
    );

    return res.status(200).json({
      data: { ...jeRes.rows[0], lines: linesRes.rows },
    });
  } catch (err) {
    console.error("getJournalEntryById:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// POST /api/accounting/journal-entries/:id/post
export async function postJournalEntryHandler(req, res) {
  const { companyId, userId } = req.user;
  const { id } = req.params;
  const ctx = auditCtx(req);

  try {
    const je = await postJournalEntry(
      id,
      companyId,
      userId,
      ctx.ip,
      ctx.userAgent,
    );
    return res.status(200).json({ message: "Journal entry posted.", data: je });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    console.error("postJournalEntryHandler:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// POST /api/accounting/journal-entries/:id/void
// Body: { reason? }
export async function voidJournalEntryHandler(req, res) {
  const { companyId, userId } = req.user;
  const { id } = req.params;
  const { reason } = req.body;
  const ctx = auditCtx(req);

  try {
    const result = await voidJournalEntry(
      id,
      companyId,
      userId,
      reason,
      ctx.ip,
      ctx.userAgent,
    );
    return res.status(200).json({
      message: "Journal entry voided. Reversal entry created.",
      data: result,
    });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    console.error("voidJournalEntryHandler:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ═══════════════════════════════════════════════════════════════
// GENERAL LEDGER
// GET /api/accounting/general-ledger/:accountId
// Query: ?from=YYYY-MM-DD &to=YYYY-MM-DD
// Returns opening balance, all posted transactions with running balance, closing balance.
// ═══════════════════════════════════════════════════════════════
export async function getGeneralLedger(req, res) {
  const { companyId } = req.user;
  const { accountId } = req.params;
  const { from, to } = req.query;

  const periodFrom = from ?? "1900-01-01";
  const periodTo = to ?? new Date().toISOString().split("T")[0];

  try {
    // Verify account belongs to this company
    const acctRes = await db.query(
      "SELECT * FROM chart_of_accounts WHERE id = $1 AND company_id = $2",
      [accountId, companyId],
    );
    if (!acctRes.rows.length)
      return res.status(404).json({ message: "Account not found." });
    const account = acctRes.rows[0];

    // Opening balance = all POSTED transactions BEFORE the period
    const openingRes = await db.query(
      `SELECT
         COALESCE(SUM(jel.debit_amount),  0) AS total_debits,
         COALESCE(SUM(jel.credit_amount), 0) AS total_credits
       FROM journal_entry_lines jel
       JOIN journal_entries je ON je.id = jel.journal_entry_id
       WHERE jel.account_id  = $1
         AND je.company_id   = $2
         AND je.status       = 'Posted'
         AND je.entry_date   < $3`,
      [accountId, companyId, periodFrom],
    );
    const ob = openingRes.rows[0];

    // Debit-normal accounts (Assets, Expenses): opening = debits - credits
    // Credit-normal accounts (Liabilities, Equity, Income): opening = credits - debits
    const debitNormal = ["Asset", "Expense"].includes(account.account_type);
    const openingBalance = debitNormal
      ? Number(ob.total_debits) - Number(ob.total_credits)
      : Number(ob.total_credits) - Number(ob.total_debits);

    // All transactions in the period
    const txRes = await db.query(
      `SELECT
         jel.id          AS line_id,
         je.id           AS journal_entry_id,
         je.reference_number,
         je.entry_date,
         jel.description AS line_description,
         je.description  AS entry_description,
         jel.debit_amount,
         jel.credit_amount
       FROM journal_entry_lines jel
       JOIN journal_entries je ON je.id = jel.journal_entry_id
       WHERE jel.account_id  = $1
         AND je.company_id   = $2
         AND je.status       = 'Posted'
         AND je.entry_date  >= $3
         AND je.entry_date  <= $4
       ORDER BY je.entry_date ASC, je.created_at ASC`,
      [accountId, companyId, periodFrom, periodTo],
    );

    // Compute running balance
    let runningBalance = openingBalance;
    const transactions = txRes.rows.map((tx) => {
      const movement = debitNormal
        ? Number(tx.debit_amount) - Number(tx.credit_amount)
        : Number(tx.credit_amount) - Number(tx.debit_amount);
      runningBalance += movement;
      return { ...tx, running_balance: runningBalance };
    });

    return res.status(200).json({
      data: {
        account,
        period: { from: periodFrom, to: periodTo },
        opening_balance: openingBalance,
        transactions,
        closing_balance: runningBalance,
        total_debits: transactions.reduce(
          (s, t) => s + Number(t.debit_amount),
          0,
        ),
        total_credits: transactions.reduce(
          (s, t) => s + Number(t.credit_amount),
          0,
        ),
      },
    });
  } catch (err) {
    console.error("getGeneralLedger:", err);
    return res.status(500).json({ message: "Server error." });
  }
}


// // ═══════════════════════════════════════════════════════════════
// // AUDIT TRAIL
// // ═══════════════════════════════════════════════════════════════

// // GET /api/accounting/audit-trail
// // Query: ?userId= &module= &action= &from= &to= &page= &limit=
// export async function getAuditTrail(req, res) {
//   const { companyId } = req.user;
//   const {
//     userId,
//     module: mod,
//     action,
//     from,
//     to,
//     page = 1,
//     limit = 50,
//   } = req.query;
//   const offset = (parseInt(page) - 1) * parseInt(limit);

//   // 1. Add the 'aat.' alias to EVERY condition to prevent ambiguity during the JOIN
//   const conditions = ["aat.company_id = $1"];
//   const params = [companyId];
//   let idx = 2;

//   if (userId) {
//     conditions.push(`aat.user_id = $${idx++}`);
//     params.push(userId);
//   }
//   if (mod) {
//     conditions.push(`aat.module = $${idx++}`);
//     params.push(mod);
//   }
//   if (action) {
//     conditions.push(`aat.action = $${idx++}`);
//     params.push(action);
//   }
//   if (from) {
//     conditions.push(`aat.timestamp >= $${idx++}`);
//     params.push(from);
//   }
//   if (to) {
//     conditions.push(`aat.timestamp <= $${idx++}::date + INTERVAL '1 day'`);
//     params.push(to);
//   }

//   try {
//     // 2. Add the 'aat' alias to the count query's FROM clause!
//     const total = await db.query(
//       `SELECT COUNT(*) FROM accounting_audit_trail aat WHERE ${conditions.join(" AND ")}`,
//       params,
//     );

//     // 3. Main Query: Added u.email AS user_name to bridge matching to front-end state
//     const result = await db.query(
//       `SELECT aat.*, u.email AS user_email, u.email AS user_name
//        FROM accounting_audit_trail aat
//        LEFT JOIN users u ON u.id = aat.user_id
//        WHERE ${conditions.join(" AND ")}
//        ORDER BY aat.timestamp DESC
//        LIMIT $${idx} OFFSET $${idx + 1}`,
//       [...params, parseInt(limit), offset],
//     );

//     return res.status(200).json({
//       data: result.rows,
//       total: parseInt(total.rows[0].count),
//       page: parseInt(page),
//       limit: parseInt(limit),
//     });
//   } catch (err) {
//     console.error("getAuditTrail:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// // GET /api/accounting/audit-trail/:recordId
// // Full history of a specific record
// export async function getRecordAuditTrail(req, res) {
//   const { companyId } = req.user;
//   const { recordId } = req.params;

//   try {
//     // Added u.email AS user_name here as well for the detailed drawer breakdown
//     const result = await db.query(
//       `SELECT aat.*, u.email AS user_email, u.email AS user_name
//        FROM accounting_audit_trail aat
//        LEFT JOIN users u ON u.id = aat.user_id
//        WHERE aat.company_id = $1 AND aat.record_id = $2
//        ORDER BY aat.timestamp ASC`,
//       [companyId, recordId],
//     );
//     return res.status(200).json({ data: result.rows, total: result.rowCount });
//   } catch (err) {
//     console.error("getRecordAuditTrail:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// ═══════════════════════════════════════════════════════════════
// AUDIT TRAIL CONTROLLER
// ═══════════════════════════════════════════════════════════════

// GET /api/accounting/audit-trail
// Query: ?userId= &module= &action= &from= &to= &page= &limit=
export async function getAuditTrail(req, res) {
  const { companyId } = req.user;
  const {
    userId,
    module: mod,
    action,
    from,
    to,
    page = 1,
    limit = 30,
  } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  // 1. Add the 'aat.' alias to EVERY condition to prevent ambiguity during the JOIN
  const conditions = ["aat.company_id = $1"];
  const params = [companyId];
  let idx = 2;

  if (userId) {
    conditions.push(`aat.user_id = $${idx++}`);
    params.push(userId);
  }
  if (mod) {
    conditions.push(`aat.module = $${idx++}`);
    params.push(mod);
  }
  if (action) {
    conditions.push(`aat.action = $${idx++}`);
    params.push(action);
  }
  if (from) {
    conditions.push(`aat.timestamp >= $${idx++}`);
    params.push(from);
  }
  if (to) {
    conditions.push(`aat.timestamp <= $${idx++}::date + INTERVAL '1 day'`);
    params.push(to);
  }

  try {
    // 2. Add the 'aat' alias to the count query's FROM clause!
    const totalResult = await db.query(
      `SELECT COUNT(*) FROM accounting_audit_trail aat WHERE ${conditions.join(" AND ")}`,
      params,
    );

    // 3. Main Query: Added u.email AS user_name to bridge matching to front-end state
    const result = await db.query(
      `SELECT aat.*, u.email AS user_email, u.email AS user_name
       FROM accounting_audit_trail aat
       LEFT JOIN users u ON u.id = aat.user_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY aat.timestamp DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset],
    );

    // 🟢 Return BOTH keys ('logs' and 'data') to completely avoid frontend shape errors
    return res.status(200).json({
      success: true,
      logs: result.rows,
      data: result.rows,
      total: parseInt(totalResult.rows[0].count || 0),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error("getAuditTrail Controller Error:", err);
    return res.status(500).json({ success: false, message: "Server error processing audit logs." });
  }
}

// GET /api/accounting/audit-trail/:recordId
// Full history of a specific record
export async function getRecordAuditTrail(req, res) {
  const { companyId } = req.user;
  const { recordId } = req.params;

  try {
    const result = await db.query(
      `SELECT aat.*, u.email AS user_email, u.email AS user_name
       FROM accounting_audit_trail aat
       LEFT JOIN users u ON u.id = aat.user_id
       WHERE aat.company_id = $1 AND aat.record_id = $2
       ORDER BY aat.timestamp ASC`,
      [companyId, recordId],
    );
    return res.status(200).json({ 
      success: true,
      data: result.rows, 
      logs: result.rows,
      total: result.rowCount 
    });
  } catch (err) {
    console.error("getRecordAuditTrail Controller Error:", err);
    return res.status(500).json({ success: false, message: "Server error processing record tracking details." });
  }
}