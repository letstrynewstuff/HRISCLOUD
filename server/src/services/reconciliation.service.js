// // src/services/reconciliation.service.js
// //
// // Bank Reconciliation — pure business logic.
// // All amounts in KOBO. Linked to journal_entries (Group 1 GL).
// // CSV parsing uses the built-in csv-parse package already in package.json.

// import { parse } from "csv-parse/sync";
// import { db } from "../config/db.js";
// import {
//   createJournalEntry,
//   postJournalEntry,
//   findAccountByCode,
//   writeAuditLog,
//   ValidationError,
//   NotFoundError,
//   ConflictError,
// } from "./accounting.service.js";

// // ─── Kobo helpers ─────────────────────────────────────────────
// const toKobo = (v) => {
//   if (v === null || v === undefined || v === "") return 0;
//   const n = parseFloat(String(v).replace(/,/g, "").trim());
//   return isNaN(n) ? 0 : Math.round(n * 100);
// };

// // ═════════════════════════════════════════════════════════════
// // BANK ACCOUNTS
// // ═════════════════════════════════════════════════════════════

// export async function createBankAccount({
//   companyId,
//   bankName,
//   accountName,
//   accountNumber,
//   currency,
//   currentBalance,
//   glAccountId,
//   userId,
// }) {
//   const dup = await db.query(
//     "SELECT id FROM recon_bank_accounts WHERE company_id=$1 AND account_number=$2",
//     [companyId, accountNumber],
//   );
//   if (dup.rows.length)
//     throw new ConflictError(`Account number ${accountNumber} already exists.`);

//   // Validate linked GL account belongs to this company
//   if (glAccountId) {
//     const glCheck = await db.query(
//       "SELECT id FROM chart_of_accounts WHERE id=$1 AND company_id=$2",
//       [glAccountId, companyId],
//     );
//     if (!glCheck.rows.length)
//       throw new ValidationError(
//         "Linked GL account not found for this company.",
//       );
//   }

//   const result = await db.query(
//     `INSERT INTO recon_bank_accounts
//        (company_id, bank_name, account_name, account_number, currency, current_balance_kobo, gl_account_id)
//      VALUES ($1,$2,$3,$4,$5,$6,$7)
//      RETURNING *`,
//     [
//       companyId,
//       bankName,
//       accountName,
//       accountNumber,
//       currency ?? "NGN",
//       toKobo(currentBalance ?? 0),
//       glAccountId ?? null,
//     ],
//   );

//   await writeAuditLog({
//     companyId,
//     userId,
//     action: "CREATE",
//     module: "ChartOfAccounts",
//     recordId: result.rows[0].id,
//     newValue: { bankName, accountNumber },
//   });
//   return result.rows[0];
// }

// export async function listBankAccounts(companyId) {
//   const result = await db.query(
//     `SELECT rba.*, coa.account_code, coa.account_name AS gl_account_name
//      FROM recon_bank_accounts rba
//      LEFT JOIN chart_of_accounts coa ON coa.id = rba.gl_account_id
//      WHERE rba.company_id=$1 AND rba.is_active=TRUE
//      ORDER BY rba.bank_name`,
//     [companyId],
//   );
//   return result.rows;
// }

// export async function updateBankAccount(id, companyId, payload, userId) {
//   const existing = await db.query(
//     "SELECT * FROM recon_bank_accounts WHERE id=$1 AND company_id=$2",
//     [id, companyId],
//   );
//   if (!existing.rows.length) throw new NotFoundError("Bank account not found.");

//   const updated = await db.query(
//     `UPDATE recon_bank_accounts
//      SET bank_name=$1, account_name=$2, currency=$3, gl_account_id=$4, updated_at=NOW()
//      WHERE id=$5 AND company_id=$6
//      RETURNING *`,
//     [
//       payload.bankName ?? existing.rows[0].bank_name,
//       payload.accountName ?? existing.rows[0].account_name,
//       payload.currency ?? existing.rows[0].currency,
//       payload.glAccountId ?? existing.rows[0].gl_account_id,
//       id,
//       companyId,
//     ],
//   );
//   return updated.rows[0];
// }

// export async function updateBankBalance(id, companyId, balanceKobo, userId) {
//   const result = await db.query(
//     `UPDATE recon_bank_accounts
//      SET current_balance_kobo=$1, updated_at=NOW()
//      WHERE id=$2 AND company_id=$3
//      RETURNING *`,
//     [balanceKobo, id, companyId],
//   );
//   if (!result.rows.length) throw new NotFoundError("Bank account not found.");

//   await writeAuditLog({
//     companyId,
//     userId,
//     action: "UPDATE",
//     module: "ChartOfAccounts",
//     recordId: id,
//     newValue: { current_balance_kobo: balanceKobo },
//   });
//   return result.rows[0];
// }

// // ═════════════════════════════════════════════════════════════
// // CSV IMPORT
// // ═════════════════════════════════════════════════════════════

// /**
//  * Parse and import a bank statement CSV.
//  *
//  * Expected columns (case-insensitive, flexible header names):
//  *   Date | Description | Debit | Credit | Balance | Reference
//  *
//  * Returns: { imported, autoMatched, unmatched, errors }
//  */
// export async function importBankStatement(
//   companyId,
//   bankAccountId,
//   csvBuffer,
//   userId,
// ) {
//   // Verify bank account
//   const acctRes = await db.query(
//     "SELECT * FROM recon_bank_accounts WHERE id=$1 AND company_id=$2",
//     [bankAccountId, companyId],
//   );
//   if (!acctRes.rows.length) throw new NotFoundError("Bank account not found.");

//   // ── Parse CSV ─────────────────────────────────────────────
//   let rows;
//   try {
//     rows = parse(csvBuffer, {
//       columns: true,
//       skip_empty_lines: true,
//       trim: true,
//       bom: true,
//     });
//   } catch (err) {
//     throw new ValidationError(`CSV parse failed: ${err.message}`);
//   }

//   if (!rows.length)
//     throw new ValidationError("CSV file is empty or has no data rows.");

//   // ── Normalise header names (case-insensitive) ─────────────
//   const normalise = (row) => {
//     const out = {};
//     for (const [k, v] of Object.entries(row)) {
//       out[k.toLowerCase().trim()] = v;
//     }
//     return out;
//   };

//   const importedLines = [];
//   const parseErrors = [];

//   for (let i = 0; i < rows.length; i++) {
//     const r = normalise(rows[i]);
//     const lineNo = i + 2; // +2 = 1-based + header row

//     // Resolve flexible column names
//     const dateRaw = r.date ?? r["value date"] ?? r["transaction date"] ?? "";
//     const desc = r.description ?? r.narration ?? r.details ?? "";
//     const debitRaw = r.debit ?? r.dr ?? r.withdrawal ?? "0";
//     const creditRaw = r.credit ?? r.cr ?? r.deposit ?? "0";
//     const balRaw = r.balance ?? r.bal ?? "0";
//     const ref = r.reference ?? r.ref ?? r["transaction id"] ?? "";

//     // Validate date
//     const txDate = new Date(dateRaw);
//     if (isNaN(txDate.getTime())) {
//       parseErrors.push({ line: lineNo, error: `Invalid date: "${dateRaw}"` });
//       continue;
//     }

//     const debitKobo = toKobo(debitRaw);
//     const creditKobo = toKobo(creditRaw);
//     const balKobo = toKobo(balRaw);

//     if (isNaN(debitKobo) || isNaN(creditKobo)) {
//       parseErrors.push({
//         line: lineNo,
//         error: `Invalid amount on row ${lineNo}`,
//       });
//       continue;
//     }

//     importedLines.push({
//       company_id: companyId,
//       bank_account_id: bankAccountId,
//       transaction_date: txDate.toISOString().split("T")[0],
//       description: desc || null,
//       debit_amount_kobo: debitKobo,
//       credit_amount_kobo: creditKobo,
//       balance_kobo: balKobo,
//       reference: ref || null,
//     });
//   }

//   if (!importedLines.length && parseErrors.length) {
//     throw new ValidationError(
//       `All ${parseErrors.length} rows failed validation. First error: ${parseErrors[0].error}`,
//     );
//   }

//   // ── Insert lines + auto-match ─────────────────────────────
//   let autoMatched = 0;
//   const client = await db.getClient();

//   try {
//     await client.query("BEGIN");

//     for (const line of importedLines) {
//       // Insert statement line
//       const insRes = await client.query(
//         `INSERT INTO bank_statement_lines
//            (company_id, bank_account_id, transaction_date, description,
//             debit_amount_kobo, credit_amount_kobo, balance_kobo, reference)
//          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
//          RETURNING *`,
//         [
//           line.company_id,
//           line.bank_account_id,
//           line.transaction_date,
//           line.description,
//           line.debit_amount_kobo,
//           line.credit_amount_kobo,
//           line.balance_kobo,
//           line.reference,
//         ],
//       );
//       const insertedLine = insRes.rows[0];

//       // ── AUTO-MATCH LOGIC ──────────────────────────────────
//       // Match if:  amount matches AND date within ±3 days AND reference matches (if available)
//       const amount =
//         line.credit_amount_kobo > 0
//           ? line.credit_amount_kobo
//           : line.debit_amount_kobo;

//       const dateFrom = new Date(line.transaction_date);
//       dateFrom.setDate(dateFrom.getDate() - 3);
//       const dateTo = new Date(line.transaction_date);
//       dateTo.setDate(dateTo.getDate() + 3);

//       let matchQuery;
//       let matchParams;

//       if (line.reference) {
//         // Try exact reference match first (strongest signal)
//         matchQuery = `
//           SELECT je.id
//           FROM journal_entries je
//           JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id
//           WHERE je.company_id  = $1
//             AND je.status      = 'Posted'
//             AND je.entry_date  BETWEEN $2 AND $3
//             AND je.reference_number ILIKE $4
//             AND (jel.debit_amount = $5 OR jel.credit_amount = $5)
//             AND NOT EXISTS (
//               SELECT 1 FROM bank_statement_lines bsl2
//               WHERE bsl2.matched_journal_entry_id = je.id
//             )
//           LIMIT 1`;
//         matchParams = [
//           companyId,
//           dateFrom,
//           dateTo,
//           `%${line.reference}%`,
//           amount,
//         ];
//       } else {
//         // Amount + date match only
//         matchQuery = `
//           SELECT je.id
//           FROM journal_entries je
//           JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id
//           WHERE je.company_id  = $1
//             AND je.status      = 'Posted'
//             AND je.entry_date  BETWEEN $2 AND $3
//             AND (jel.debit_amount = $4 OR jel.credit_amount = $4)
//             AND NOT EXISTS (
//               SELECT 1 FROM bank_statement_lines bsl2
//               WHERE bsl2.matched_journal_entry_id = je.id
//             )
//           LIMIT 1`;
//         matchParams = [companyId, dateFrom, dateTo, amount];
//       }

//       const matchRes = await client.query(matchQuery, matchParams);

//       if (matchRes.rows.length) {
//         const jeId = matchRes.rows[0].id;
//         await client.query(
//           `UPDATE bank_statement_lines
//            SET is_matched=TRUE, matched_journal_entry_id=$1
//            WHERE id=$2`,
//           [jeId, insertedLine.id],
//         );
//         autoMatched++;
//       }
//     }

//     await client.query("COMMIT");
//   } catch (err) {
//     await client.query("ROLLBACK");
//     throw err;
//   } finally {
//     client.release();
//   }

//   await writeAuditLog({
//     companyId,
//     userId,
//     action: "CREATE",
//     module: "JournalEntry",
//     recordId: bankAccountId,
//     newValue: {
//       imported: importedLines.length,
//       autoMatched,
//       errors: parseErrors.length,
//     },
//   });

//   return {
//     imported: importedLines.length,
//     autoMatched,
//     unmatched: importedLines.length - autoMatched,
//     parseErrors,
//     message: `Imported ${importedLines.length} lines. Auto-matched ${autoMatched}.`,
//   };
// }

// // ═════════════════════════════════════════════════════════════
// // MATCHING
// // ═════════════════════════════════════════════════════════════

// export async function getUnmatchedStatementLines(companyId, bankAccountId) {
//   const params = [companyId];
//   const conditions = ["bsl.company_id=$1", "bsl.is_matched=FALSE"];
//   if (bankAccountId) {
//     conditions.push("bsl.bank_account_id=$2");
//     params.push(bankAccountId);
//   }

//   const result = await db.query(
//     `SELECT bsl.*, rba.bank_name, rba.account_number
//      FROM bank_statement_lines bsl
//      JOIN recon_bank_accounts rba ON rba.id = bsl.bank_account_id
//      WHERE ${conditions.join(" AND ")}
//      ORDER BY bsl.transaction_date DESC`,
//     params,
//   );
//   return result.rows;
// }

// export async function getUnmatchedJournalEntries(companyId) {
//   const result = await db.query(
//     `SELECT je.id, je.reference_number, je.entry_date, je.description,
//        SUM(jel.debit_amount)  AS total_debits,
//        SUM(jel.credit_amount) AS total_credits
//      FROM journal_entries je
//      JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id
//      WHERE je.company_id = $1
//        AND je.status     = 'Posted'
//        AND NOT EXISTS (
//          SELECT 1 FROM bank_statement_lines bsl
//          WHERE bsl.matched_journal_entry_id = je.id
//        )
//      GROUP BY je.id
//      ORDER BY je.entry_date DESC`,
//     [companyId],
//   );
//   return result.rows;
// }

// export async function matchLineToJournalEntry(
//   companyId,
//   bankStatementLineId,
//   journalEntryId,
//   userId,
// ) {
//   // Fetch the statement line
//   const lineRes = await db.query(
//     "SELECT * FROM bank_statement_lines WHERE id=$1 AND company_id=$2",
//     [bankStatementLineId, companyId],
//   );
//   if (!lineRes.rows.length)
//     throw new NotFoundError("Bank statement line not found.");
//   const line = lineRes.rows[0];
//   if (line.is_matched)
//     throw new ConflictError("This statement line is already matched.");

//   // Fetch the journal entry
//   const jeRes = await db.query(
//     `SELECT je.*, SUM(jel.debit_amount) AS total_debits, SUM(jel.credit_amount) AS total_credits
//      FROM journal_entries je
//      JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id
//      WHERE je.id=$1 AND je.company_id=$2
//      GROUP BY je.id`,
//     [journalEntryId, companyId],
//   );
//   if (!jeRes.rows.length) throw new NotFoundError("Journal entry not found.");
//   const je = jeRes.rows[0];

//   if (je.status !== "Posted")
//     throw new ValidationError("Can only match to Posted journal entries.");

//   // Verify amount match
//   const lineAmount =
//     line.credit_amount_kobo > 0
//       ? BigInt(line.credit_amount_kobo)
//       : BigInt(line.debit_amount_kobo);

//   const jeAmount = BigInt(je.total_debits); // debits = credits, so either works

//   if (lineAmount !== jeAmount) {
//     throw new ValidationError(
//       `Amount mismatch: statement line ₦${Number(lineAmount) / 100} vs journal entry ₦${Number(jeAmount) / 100}.`,
//     );
//   }

//   // Do the match
//   await db.query(
//     `UPDATE bank_statement_lines
//      SET is_matched=TRUE, matched_journal_entry_id=$1
//      WHERE id=$2`,
//     [journalEntryId, bankStatementLineId],
//   );

//   await writeAuditLog({
//     companyId,
//     userId,
//     action: "UPDATE",
//     module: "JournalEntry",
//     recordId: bankStatementLineId,
//     newValue: { matched: true, journalEntryId },
//   });

//   return {
//     message: "Matched successfully.",
//     bankStatementLineId,
//     journalEntryId,
//   };
// }

// export async function unmatchLine(companyId, bankStatementLineId, userId) {
//   const result = await db.query(
//     `UPDATE bank_statement_lines
//      SET is_matched=FALSE, matched_journal_entry_id=NULL
//      WHERE id=$1 AND company_id=$2
//      RETURNING *`,
//     [bankStatementLineId, companyId],
//   );
//   if (!result.rows.length)
//     throw new NotFoundError("Bank statement line not found.");

//   await writeAuditLog({
//     companyId,
//     userId,
//     action: "UPDATE",
//     module: "JournalEntry",
//     recordId: bankStatementLineId,
//     newValue: { matched: false },
//   });
//   return result.rows[0];
// }

// /**
//  * Create an adjustment journal entry for a bank line that has no matching JE
//  * (bank charges, interest, fees, etc.)
//  */
// export async function createAdjustmentEntry(
//   companyId,
//   bankStatementLineId,
//   { debitAccountId, creditAccountId, description, userId },
// ) {
//   const lineRes = await db.query(
//     "SELECT * FROM bank_statement_lines WHERE id=$1 AND company_id=$2",
//     [bankStatementLineId, companyId],
//   );
//   if (!lineRes.rows.length)
//     throw new NotFoundError("Bank statement line not found.");
//   const line = lineRes.rows[0];
//   if (line.is_matched) throw new ConflictError("This line is already matched.");

//   const isDebit = line.debit_amount_kobo > 0;
//   const amount = isDebit
//     ? BigInt(line.debit_amount_kobo)
//     : BigInt(line.credit_amount_kobo);

//   if (!debitAccountId || !creditAccountId) {
//     throw new ValidationError(
//       "debitAccountId and creditAccountId are required for adjustment entries.",
//     );
//   }

//   const je = await createJournalEntry({
//     companyId,
//     createdBy: userId,
//     entryDate: line.transaction_date,
//     description: description ?? `Bank adjustment: ${line.description ?? ""}`,
//     source: "bank_adjustment",
//     sourceRefId: bankStatementLineId,
//     lines: [
//       { accountId: debitAccountId, debitAmount: amount, creditAmount: 0n },
//       { accountId: creditAccountId, debitAmount: 0n, creditAmount: amount },
//     ],
//   });

//   await postJournalEntry(je.id, companyId, userId);

//   // Auto-match the line to the new JE
//   await db.query(
//     "UPDATE bank_statement_lines SET is_matched=TRUE, matched_journal_entry_id=$1 WHERE id=$2",
//     [je.id, bankStatementLineId],
//   );

//   return { journalEntry: je, message: "Adjustment entry created and matched." };
// }

// // ═════════════════════════════════════════════════════════════
// // RECONCILIATION SESSIONS
// // ═════════════════════════════════════════════════════════════

// export async function startSession(
//   companyId,
//   {
//     bankAccountId,
//     periodStart,
//     periodEnd,
//     openingBalance,
//     closingBalance,
//     userId,
//   },
// ) {
//   const acct = await db.query(
//     "SELECT * FROM recon_bank_accounts WHERE id=$1 AND company_id=$2",
//     [bankAccountId, companyId],
//   );
//   if (!acct.rows.length) throw new NotFoundError("Bank account not found.");

//   // Only one In Progress session per account at a time
//   const active = await db.query(
//     `SELECT id FROM reconciliation_sessions
//      WHERE company_id=$1 AND bank_account_id=$2 AND status='In Progress'`,
//     [companyId, bankAccountId],
//   );
//   if (active.rows.length) {
//     throw new ConflictError(
//       "There is already an active reconciliation session for this account. Complete it first.",
//     );
//   }

//   const result = await db.query(
//     `INSERT INTO reconciliation_sessions
//        (company_id, bank_account_id, period_start, period_end,
//         opening_balance, closing_balance, reconciled_by)
//      VALUES ($1,$2,$3,$4,$5,$6,$7)
//      RETURNING *`,
//     [
//       companyId,
//       bankAccountId,
//       periodStart,
//       periodEnd,
//       toKobo(openingBalance ?? 0),
//       toKobo(closingBalance ?? 0),
//       userId,
//     ],
//   );
//   return result.rows[0];
// }

// export async function getSessionProgress(companyId, sessionId) {
//   const sessRes = await db.query(
//     `SELECT rs.*, rba.bank_name, rba.account_number, rba.gl_account_id
//      FROM reconciliation_sessions rs
//      JOIN recon_bank_accounts rba ON rba.id = rs.bank_account_id
//      WHERE rs.id=$1 AND rs.company_id=$2`,
//     [sessionId, companyId],
//   );
//   if (!sessRes.rows.length)
//     throw new NotFoundError("Reconciliation session not found.");
//   const session = sessRes.rows[0];

//   // Bank statement lines in this period
//   const bankLines = await db.query(
//     `SELECT
//        COUNT(*)                                                      AS total_lines,
//        COUNT(*) FILTER (WHERE is_matched = TRUE)                     AS matched_count,
//        COUNT(*) FILTER (WHERE is_matched = FALSE)                    AS unmatched_count,
//        COALESCE(SUM(credit_amount_kobo),0) - COALESCE(SUM(debit_amount_kobo),0) AS net_movement
//      FROM bank_statement_lines
//      WHERE bank_account_id=$1
//        AND transaction_date BETWEEN $2 AND $3`,
//     [session.bank_account_id, session.period_start, session.period_end],
//   );
//   const bankStats = bankLines.rows[0];

//   // Book balance from GL (only if we have a linked account)
//   let bookBalance = null;
//   if (session.gl_account_id) {
//     const glRes = await db.query(
//       `SELECT
//          COALESCE(SUM(jel.debit_amount),  0) AS total_debits,
//          COALESCE(SUM(jel.credit_amount), 0) AS total_credits
//        FROM journal_entry_lines jel
//        JOIN journal_entries je ON je.id = jel.journal_entry_id
//        WHERE jel.account_id = $1
//          AND je.status      = 'Posted'
//          AND je.entry_date  <= $2`,
//       [session.gl_account_id, session.period_end],
//     );
//     const gl = glRes.rows[0];
//     // Bank account is Asset (debit-normal): balance = debits - credits
//     bookBalance = Number(gl.total_debits) - Number(gl.total_credits);
//   }

//   const bankBalance = Number(session.closing_balance);
//   const difference = bookBalance !== null ? bankBalance - bookBalance : null;

//   return {
//     session,
//     bankLines: {
//       total: parseInt(bankStats.total_lines),
//       matched: parseInt(bankStats.matched_count),
//       unmatched: parseInt(bankStats.unmatched_count),
//       netMovement: Number(bankStats.net_movement),
//     },
//     bookBalance,
//     bankBalance,
//     difference,
//     canComplete: difference === 0,
//   };
// }

// export async function completeSession(companyId, sessionId, userId) {
//   const progress = await getSessionProgress(companyId, sessionId);

//   if (progress.session.status === "Completed") {
//     throw new ConflictError("Session is already completed.");
//   }
//   if (progress.difference !== 0) {
//     throw new ValidationError(
//       `Cannot complete reconciliation: difference is ₦${Number(progress.difference) / 100}. ` +
//         "All items must balance to zero.",
//     );
//   }

//   const client = await db.getClient();
//   try {
//     await client.query("BEGIN");

//     // Mark session complete
//     await client.query(
//       `UPDATE reconciliation_sessions
//        SET status='Completed', completed_at=NOW(), reconciled_by=$1
//        WHERE id=$2 AND company_id=$3`,
//       [userId, sessionId, companyId],
//     );

//     // Update last reconciled date on bank account
//     await client.query(
//       `UPDATE recon_bank_accounts
//        SET last_reconciled_date=$1, updated_at=NOW()
//        WHERE id=$2`,
//       [progress.session.period_end, progress.session.bank_account_id],
//     );

//     await writeAuditLog(
//       {
//         companyId,
//         userId,
//         action: "UPDATE",
//         module: "JournalEntry",
//         recordId: sessionId,
//         newValue: { status: "Completed", period: progress.session.period_end },
//       },
//       client,
//     );

//     await client.query("COMMIT");
//     return {
//       message: "Reconciliation completed.",
//       sessionId,
//       period: progress.session.period_end,
//     };
//   } catch (err) {
//     await client.query("ROLLBACK");
//     throw err;
//   } finally {
//     client.release();
//   }
// }

// export async function listSessions(companyId, bankAccountId) {
//   const params = [companyId];
//   const conditions = ["rs.company_id=$1"];
//   if (bankAccountId) {
//     conditions.push("rs.bank_account_id=$2");
//     params.push(bankAccountId);
//   }

//   const result = await db.query(
//     `SELECT rs.*, rba.bank_name, rba.account_number
//      FROM reconciliation_sessions rs
//      JOIN recon_bank_accounts rba ON rba.id = rs.bank_account_id
//      WHERE ${conditions.join(" AND ")}
//      ORDER BY rs.created_at DESC`,
//     params,
//   );
//   return result.rows;
// }



// src/services/reconciliation.service.js
//
// Bank Reconciliation — pure business logic.
// All amounts in KOBO. Linked to journal_entries (Group 1 GL).
// CSV parsing uses the built-in csv-parse package already in package.json.

import { parse } from "csv-parse/sync";
import { db } from "../config/db.js";
import {
  createJournalEntry,
  postJournalEntry,
  findAccountByCode,
  writeAuditLog,
  ValidationError,
  NotFoundError,
  ConflictError,
} from "./accounting.service.js";

// ─── Kobo helpers ─────────────────────────────────────────────
const toKobo = (v) => {
  if (v === null || v === undefined || v === "") return 0;
  const n = parseFloat(String(v).replace(/,/g, "").trim());
  return isNaN(n) ? 0 : Math.round(n * 100);
};

// ═════════════════════════════════════════════════════════════
// BANK ACCOUNTS
// ═════════════════════════════════════════════════════════════

export async function createBankAccount({
  companyId,
  bankName,
  accountName,
  accountNumber,
  currency,
  currentBalance,
  glAccountId,
  userId,
}) {
  const dup = await db.query(
    "SELECT id FROM recon_bank_accounts WHERE company_id=$1 AND account_number=$2",
    [companyId, accountNumber],
  );
  if (dup.rows.length)
    throw new ConflictError(`Account number ${accountNumber} already exists.`);

  // Validate linked GL account belongs to this company
  if (glAccountId) {
    const glCheck = await db.query(
      "SELECT id FROM chart_of_accounts WHERE id=$1 AND company_id=$2",
      [glAccountId, companyId],
    );
    if (!glCheck.rows.length)
      throw new ValidationError(
        "Linked GL account not found for this company.",
      );
  }

  const result = await db.query(
    `INSERT INTO recon_bank_accounts
       (company_id, bank_name, account_name, account_number, currency, current_balance_kobo, gl_account_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      companyId,
      bankName,
      accountName,
      accountNumber,
      currency ?? "NGN",
      toKobo(currentBalance ?? 0),
      glAccountId ?? null,
    ],
  );

  await writeAuditLog({
    companyId,
    userId,
    action: "CREATE",
    module: "ChartOfAccounts",
    recordId: result.rows[0].id,
    newValue: { bankName, accountNumber },
  });
  return result.rows[0];
}

export async function listBankAccounts(companyId) {
  const result = await db.query(
    `SELECT rba.*, coa.account_code, coa.account_name AS gl_account_name
     FROM recon_bank_accounts rba
     LEFT JOIN chart_of_accounts coa ON coa.id = rba.gl_account_id
     WHERE rba.company_id=$1 AND rba.is_active=TRUE
     ORDER BY rba.bank_name`,
    [companyId],
  );
  return result.rows;
}

export async function updateBankAccount(id, companyId, payload, userId) {
  const existing = await db.query(
    "SELECT * FROM recon_bank_accounts WHERE id=$1 AND company_id=$2",
    [id, companyId],
  );
  if (!existing.rows.length) throw new NotFoundError("Bank account not found.");

  const updated = await db.query(
    `UPDATE recon_bank_accounts
     SET bank_name=$1, account_name=$2, currency=$3, gl_account_id=$4, updated_at=NOW()
     WHERE id=$5 AND company_id=$6
     RETURNING *`,
    [
      payload.bankName ?? existing.rows[0].bank_name,
      payload.accountName ?? existing.rows[0].account_name,
      payload.currency ?? existing.rows[0].currency,
      payload.glAccountId ?? existing.rows[0].gl_account_id,
      id,
      companyId,
    ],
  );
  return updated.rows[0];
}

export async function updateBankBalance(id, companyId, balanceKobo, userId) {
  const result = await db.query(
    `UPDATE recon_bank_accounts
     SET current_balance_kobo=$1, updated_at=NOW()
     WHERE id=$2 AND company_id=$3
     RETURNING *`,
    [balanceKobo, id, companyId],
  );
  if (!result.rows.length) throw new NotFoundError("Bank account not found.");

  await writeAuditLog({
    companyId,
    userId,
    action: "UPDATE",
    module: "ChartOfAccounts",
    recordId: id,
    newValue: { current_balance_kobo: balanceKobo },
  });
  return result.rows[0];
}

// ═════════════════════════════════════════════════════════════
// CSV IMPORT
// ═════════════════════════════════════════════════════════════

/**
 * Parse and import a bank statement CSV.
 *
 * Expected columns (case-insensitive, flexible header names):
 *   Date | Description | Debit | Credit | Balance | Reference
 *
 * Returns: { imported, autoMatched, unmatched, errors }
 */
export async function importBankStatement(
  companyId,
  bankAccountId,
  csvBuffer,
  userId,
) {
  // Verify bank account
  const acctRes = await db.query(
    "SELECT * FROM recon_bank_accounts WHERE id=$1 AND company_id=$2",
    [bankAccountId, companyId],
  );
  if (!acctRes.rows.length) throw new NotFoundError("Bank account not found.");

  // ── Parse CSV ─────────────────────────────────────────────
  let rows;
  try {
    rows = parse(csvBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    });
  } catch (err) {
    throw new ValidationError(`CSV parse failed: ${err.message}`);
  }

  if (!rows.length)
    throw new ValidationError("CSV file is empty or has no data rows.");

  // ── Normalise header names (case-insensitive) ─────────────
  const normalise = (row) => {
    const out = {};
    for (const [k, v] of Object.entries(row)) {
      out[k.toLowerCase().trim()] = v;
    }
    return out;
  };

  const importedLines = [];
  const parseErrors = [];

  for (let i = 0; i < rows.length; i++) {
    const r = normalise(rows[i]);
    const lineNo = i + 2; // +2 = 1-based + header row

    // Resolve flexible column names
    const dateRaw = r.date ?? r["value date"] ?? r["transaction date"] ?? "";
    const desc = r.description ?? r.narration ?? r.details ?? "";
    const debitRaw = r.debit ?? r.dr ?? r.withdrawal ?? "0";
    const creditRaw = r.credit ?? r.cr ?? r.deposit ?? "0";
    const balRaw = r.balance ?? r.bal ?? "0";
    const ref = r.reference ?? r.ref ?? r["transaction id"] ?? "";

    // Validate date
    const txDate = new Date(dateRaw);
    if (isNaN(txDate.getTime())) {
      parseErrors.push({ line: lineNo, error: `Invalid date: "${dateRaw}"` });
      continue;
    }

    const debitKobo = toKobo(debitRaw);
    const creditKobo = toKobo(creditRaw);
    const balKobo = toKobo(balRaw);

    if (isNaN(debitKobo) || isNaN(creditKobo)) {
      parseErrors.push({
        line: lineNo,
        error: `Invalid amount on row ${lineNo}`,
      });
      continue;
    }

    importedLines.push({
      company_id: companyId,
      bank_account_id: bankAccountId,
      transaction_date: txDate.toISOString().split("T")[0],
      description: desc || null,
      debit_amount_kobo: debitKobo,
      credit_amount_kobo: creditKobo,
      balance_kobo: balKobo,
      reference: ref || null,
    });
  }

  if (!importedLines.length && parseErrors.length) {
    throw new ValidationError(
      `All ${parseErrors.length} rows failed validation. First error: ${parseErrors[0].error}`,
    );
  }

  // ── Insert lines + auto-match ─────────────────────────────
  let autoMatched = 0;
  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    for (const line of importedLines) {
      // Insert statement line
      const insRes = await client.query(
        `INSERT INTO bank_statement_lines
           (company_id, bank_account_id, transaction_date, description,
            debit_amount_kobo, credit_amount_kobo, balance_kobo, reference)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING *`,
        [
          line.company_id,
          line.bank_account_id,
          line.transaction_date,
          line.description,
          line.debit_amount_kobo,
          line.credit_amount_kobo,
          line.balance_kobo,
          line.reference,
        ],
      );
      const insertedLine = insRes.rows[0];

      // ── AUTO-MATCH LOGIC ──────────────────────────────────
      // Match if:  amount matches AND date within ±3 days AND reference matches (if available)
      const amount =
        line.credit_amount_kobo > 0
          ? line.credit_amount_kobo
          : line.debit_amount_kobo;

      const dateFrom = new Date(line.transaction_date);
      dateFrom.setDate(dateFrom.getDate() - 3);
      const dateTo = new Date(line.transaction_date);
      dateTo.setDate(dateTo.getDate() + 3);

      let matchQuery;
      let matchParams;

      if (line.reference) {
        // Try exact reference match first (strongest signal)
        matchQuery = `
          SELECT je.id
          FROM journal_entries je
          JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id
          WHERE je.company_id  = $1
            AND je.status      = 'Posted'
            AND je.entry_date  BETWEEN $2 AND $3
            AND je.reference_number ILIKE $4
            AND (jel.debit_amount = $5 OR jel.credit_amount = $5)
            AND NOT EXISTS (
              SELECT 1 FROM bank_statement_lines bsl2
              WHERE bsl2.matched_journal_entry_id = je.id
            )
          LIMIT 1`;
        matchParams = [
          companyId,
          dateFrom,
          dateTo,
          `%${line.reference}%`,
          amount,
        ];
      } else {
        // Amount + date match only
        matchQuery = `
          SELECT je.id
          FROM journal_entries je
          JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id
          WHERE je.company_id  = $1
            AND je.status      = 'Posted'
            AND je.entry_date  BETWEEN $2 AND $3
            AND (jel.debit_amount = $4 OR jel.credit_amount = $4)
            AND NOT EXISTS (
              SELECT 1 FROM bank_statement_lines bsl2
              WHERE bsl2.matched_journal_entry_id = je.id
            )
          LIMIT 1`;
        matchParams = [companyId, dateFrom, dateTo, amount];
      }

      const matchRes = await client.query(matchQuery, matchParams);

      if (matchRes.rows.length) {
        const jeId = matchRes.rows[0].id;
        await client.query(
          `UPDATE bank_statement_lines
           SET is_matched=TRUE, matched_journal_entry_id=$1
           WHERE id=$2`,
          [jeId, insertedLine.id],
        );
        autoMatched++;
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  await writeAuditLog({
    companyId,
    userId,
    action: "CREATE",
    module: "BankReconciliation",
    recordId: bankAccountId,
    newValue: {
      imported: importedLines.length,
      autoMatched,
      errors: parseErrors.length,
    },
  });

  return {
    imported: importedLines.length,
    autoMatched,
    unmatched: importedLines.length - autoMatched,
    parseErrors,
    message: `Imported ${importedLines.length} lines. Auto-matched ${autoMatched}.`,
  };
}

// ═════════════════════════════════════════════════════════════
// MATCHING
// ═════════════════════════════════════════════════════════════

export async function getUnmatchedStatementLines(companyId, bankAccountId) {
  const params = [companyId];
  const conditions = ["bsl.company_id=$1", "bsl.is_matched=FALSE"];
  if (bankAccountId) {
    conditions.push("bsl.bank_account_id=$2");
    params.push(bankAccountId);
  }

  const result = await db.query(
    `SELECT bsl.*, rba.bank_name, rba.account_number
     FROM bank_statement_lines bsl
     JOIN recon_bank_accounts rba ON rba.id = bsl.bank_account_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY bsl.transaction_date DESC`,
    params,
  );
  return result.rows;
}

export async function getUnmatchedJournalEntries(companyId) {
  const result = await db.query(
    `SELECT je.id, je.reference_number, je.entry_date, je.description,
       SUM(jel.debit_amount)  AS total_debits,
       SUM(jel.credit_amount) AS total_credits
     FROM journal_entries je
     JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id
     WHERE je.company_id = $1
       AND je.status     = 'Posted'
       AND NOT EXISTS (
         SELECT 1 FROM bank_statement_lines bsl
         WHERE bsl.matched_journal_entry_id = je.id
       )
     GROUP BY je.id
     ORDER BY je.entry_date DESC`,
    [companyId],
  );
  return result.rows;
}

export async function matchLineToJournalEntry(
  companyId,
  bankStatementLineId,
  journalEntryId,
  userId,
) {
  // Fetch the statement line
  const lineRes = await db.query(
    "SELECT * FROM bank_statement_lines WHERE id=$1 AND company_id=$2",
    [bankStatementLineId, companyId],
  );
  if (!lineRes.rows.length)
    throw new NotFoundError("Bank statement line not found.");
  const line = lineRes.rows[0];
  if (line.is_matched)
    throw new ConflictError("This statement line is already matched.");

  // Fetch the journal entry
  const jeRes = await db.query(
    `SELECT je.*, SUM(jel.debit_amount) AS total_debits, SUM(jel.credit_amount) AS total_credits
     FROM journal_entries je
     JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id
     WHERE je.id=$1 AND je.company_id=$2
     GROUP BY je.id`,
    [journalEntryId, companyId],
  );
  if (!jeRes.rows.length) throw new NotFoundError("Journal entry not found.");
  const je = jeRes.rows[0];

  if (je.status !== "Posted")
    throw new ValidationError("Can only match to Posted journal entries.");

  // Verify amount match
  const lineAmount =
    line.credit_amount_kobo > 0
      ? BigInt(line.credit_amount_kobo)
      : BigInt(line.debit_amount_kobo);

  const jeAmount = BigInt(je.total_debits); // debits = credits, so either works

  if (lineAmount !== jeAmount) {
    throw new ValidationError(
      `Amount mismatch: statement line ₦${Number(lineAmount) / 100} vs journal entry ₦${Number(jeAmount) / 100}.`,
    );
  }

  // Do the match
  await db.query(
    `UPDATE bank_statement_lines
     SET is_matched=TRUE, matched_journal_entry_id=$1
     WHERE id=$2`,
    [journalEntryId, bankStatementLineId],
  );

  await writeAuditLog({
    companyId,
    userId,
    action: "UPDATE",
    module: "BankReconciliation",
    recordId: bankStatementLineId,
    newValue: { matched: true, journalEntryId },
  });

  return {
    message: "Matched successfully.",
    bankStatementLineId,
    journalEntryId,
  };
}

export async function unmatchLine(companyId, bankStatementLineId, userId) {
  const result = await db.query(
    `UPDATE bank_statement_lines
     SET is_matched=FALSE, matched_journal_entry_id=NULL
     WHERE id=$1 AND company_id=$2
     RETURNING *`,
    [bankStatementLineId, companyId],
  );
  if (!result.rows.length)
    throw new NotFoundError("Bank statement line not found.");

  await writeAuditLog({
    companyId,
    userId,
    action: "UPDATE",
    module: "BankReconciliation",
    recordId: bankStatementLineId,
    newValue: { matched: false },
  });
  return result.rows[0];
}

/**
 * Create an adjustment journal entry for a bank line that has no matching JE
 * (bank charges, interest, fees, etc.)
 */
export async function createAdjustmentEntry(
  companyId,
  bankStatementLineId,
  { debitAccountId, creditAccountId, description, userId },
) {
  const lineRes = await db.query(
    "SELECT * FROM bank_statement_lines WHERE id=$1 AND company_id=$2",
    [bankStatementLineId, companyId],
  );
  if (!lineRes.rows.length)
    throw new NotFoundError("Bank statement line not found.");
  const line = lineRes.rows[0];
  if (line.is_matched) throw new ConflictError("This line is already matched.");

  const isDebit = line.debit_amount_kobo > 0;
  const amount = isDebit
    ? BigInt(line.debit_amount_kobo)
    : BigInt(line.credit_amount_kobo);

  if (!debitAccountId || !creditAccountId) {
    throw new ValidationError(
      "debitAccountId and creditAccountId are required for adjustment entries.",
    );
  }

  const je = await createJournalEntry({
    companyId,
    createdBy: userId,
    entryDate: line.transaction_date,
    description: description ?? `Bank adjustment: ${line.description ?? ""}`,
    source: "bank_adjustment",
    sourceRefId: bankStatementLineId,
    lines: [
      { accountId: debitAccountId, debitAmount: amount, creditAmount: 0n },
      { accountId: creditAccountId, debitAmount: 0n, creditAmount: amount },
    ],
  });

  await postJournalEntry(je.id, companyId, userId);

  // Auto-match the line to the new JE
  await db.query(
    "UPDATE bank_statement_lines SET is_matched=TRUE, matched_journal_entry_id=$1 WHERE id=$2",
    [je.id, bankStatementLineId],
  );

  return { journalEntry: je, message: "Adjustment entry created and matched." };
}

// ═════════════════════════════════════════════════════════════
// RECONCILIATION SESSIONS
// ═════════════════════════════════════════════════════════════

export async function startSession(
  companyId,
  {
    bankAccountId,
    periodStart,
    periodEnd,
    openingBalance,
    closingBalance,
    userId,
  },
) {
  const acct = await db.query(
    "SELECT * FROM recon_bank_accounts WHERE id=$1 AND company_id=$2",
    [bankAccountId, companyId],
  );
  if (!acct.rows.length) throw new NotFoundError("Bank account not found.");

  // Only one In Progress session per account at a time
  const active = await db.query(
    `SELECT id FROM reconciliation_sessions
     WHERE company_id=$1 AND bank_account_id=$2 AND status='In Progress'`,
    [companyId, bankAccountId],
  );
  if (active.rows.length) {
    throw new ConflictError(
      "There is already an active reconciliation session for this account. Complete it first.",
    );
  }

  const result = await db.query(
    `INSERT INTO reconciliation_sessions
       (company_id, bank_account_id, period_start, period_end,
        opening_balance, closing_balance, reconciled_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      companyId,
      bankAccountId,
      periodStart,
      periodEnd,
      toKobo(openingBalance ?? 0),
      toKobo(closingBalance ?? 0),
      userId,
    ],
  );
  return result.rows[0];
}

export async function getSessionProgress(companyId, sessionId) {
  const sessRes = await db.query(
    `SELECT rs.*, rba.bank_name, rba.account_number, rba.gl_account_id
     FROM reconciliation_sessions rs
     JOIN recon_bank_accounts rba ON rba.id = rs.bank_account_id
     WHERE rs.id=$1 AND rs.company_id=$2`,
    [sessionId, companyId],
  );
  if (!sessRes.rows.length)
    throw new NotFoundError("Reconciliation session not found.");
  const session = sessRes.rows[0];

  // Bank statement lines in this period
  const bankLines = await db.query(
    `SELECT
       COUNT(*)                                                      AS total_lines,
       COUNT(*) FILTER (WHERE is_matched = TRUE)                     AS matched_count,
       COUNT(*) FILTER (WHERE is_matched = FALSE)                    AS unmatched_count,
       COALESCE(SUM(credit_amount_kobo),0) - COALESCE(SUM(debit_amount_kobo),0) AS net_movement
     FROM bank_statement_lines
     WHERE bank_account_id=$1
       AND transaction_date BETWEEN $2 AND $3`,
    [session.bank_account_id, session.period_start, session.period_end],
  );
  const bankStats = bankLines.rows[0];

  // Book balance from GL (only if we have a linked account)
  let bookBalance = null;
  if (session.gl_account_id) {
    const glRes = await db.query(
      `SELECT
         COALESCE(SUM(jel.debit_amount),  0) AS total_debits,
         COALESCE(SUM(jel.credit_amount), 0) AS total_credits
       FROM journal_entry_lines jel
       JOIN journal_entries je ON je.id = jel.journal_entry_id
       WHERE jel.account_id = $1
         AND je.status      = 'Posted'
         AND je.entry_date  <= $2`,
      [session.gl_account_id, session.period_end],
    );
    const gl = glRes.rows[0];
    // Bank account is Asset (debit-normal): balance = debits - credits
    bookBalance = Number(gl.total_debits) - Number(gl.total_credits);
  }

  const bankBalance = Number(session.closing_balance);
  const difference = bookBalance !== null ? bankBalance - bookBalance : null;

  return {
    session,
    bankLines: {
      total: parseInt(bankStats.total_lines),
      matched: parseInt(bankStats.matched_count),
      unmatched: parseInt(bankStats.unmatched_count),
      netMovement: Number(bankStats.net_movement),
    },
    bookBalance,
    bankBalance,
    difference,
    canComplete: difference === 0,
  };
}

export async function completeSession(companyId, sessionId, userId) {
  const progress = await getSessionProgress(companyId, sessionId);

  if (progress.session.status === "Completed") {
    throw new ConflictError("Session is already completed.");
  }
  if (progress.difference !== 0) {
    throw new ValidationError(
      `Cannot complete reconciliation: difference is ₦${Number(progress.difference) / 100}. ` +
        "All items must balance to zero.",
    );
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    // Mark session complete
    await client.query(
      `UPDATE reconciliation_sessions
       SET status='Completed', completed_at=NOW(), reconciled_by=$1
       WHERE id=$2 AND company_id=$3`,
      [userId, sessionId, companyId],
    );

    // Update last reconciled date on bank account
    await client.query(
      `UPDATE recon_bank_accounts
       SET last_reconciled_date=$1, updated_at=NOW()
       WHERE id=$2`,
      [progress.session.period_end, progress.session.bank_account_id],
    );

    await writeAuditLog(
      {
        companyId,
        userId,
        action: "UPDATE",
        module: "JournalEntry",
        recordId: sessionId,
        newValue: { status: "Completed", period: progress.session.period_end },
      },
      client,
    );

    await client.query("COMMIT");
    return {
      message: "Reconciliation completed.",
      sessionId,
      period: progress.session.period_end,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function listSessions(companyId, bankAccountId) {
  const params = [companyId];
  const conditions = ["rs.company_id=$1"];
  if (bankAccountId) {
    conditions.push("rs.bank_account_id=$2");
    params.push(bankAccountId);
  }

  const result = await db.query(
    `SELECT rs.*, rba.bank_name, rba.account_number
     FROM reconciliation_sessions rs
     JOIN recon_bank_accounts rba ON rba.id = rs.bank_account_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY rs.created_at DESC`,
    params,
  );
  return result.rows;
}