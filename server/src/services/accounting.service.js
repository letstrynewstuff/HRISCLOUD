// src/services/accounting.service.js
//
// Pure business logic — no req/res objects.
// Called by controllers AND by payroll integration.
// All monetary values are BIGINT kobo (₦ × 100).

import { db } from "../config/db.js";

// ─────────────────────────────────────────────────────────────
// AUDIT TRAIL HELPER
// Write-only. Never throws — a failed audit log should never
// block the primary operation.
// ─────────────────────────────────────────────────────────────
export async function writeAuditLog(
  {
    companyId,
    userId,
    action,
    module,
    recordId,
    previousValue = null,
    newValue = null,
    ipAddress = null,
    userAgent = null,
  },
  client = null,
) {
  const runner = client ?? db;
  try {
    await runner.query(
      `INSERT INTO accounting_audit_trail
         (company_id, user_id, action, module, record_id,
          previous_value, new_value, ip_address, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        companyId,
        userId,
        action,
        module,
        recordId,
        previousValue ? JSON.stringify(previousValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        ipAddress,
        userAgent,
      ],
    );
  } catch (err) {
    // Never crash the caller — just log the failure
    console.error("[AuditTrail] Failed to write log:", err.message);
  }
}

// ─────────────────────────────────────────────────────────────
// REFERENCE NUMBER GENERATOR
// Uses the DB sequence function for uniqueness under concurrency.
// ─────────────────────────────────────────────────────────────
export async function generateRefNumber(companyId, client = null) {
  const runner = client ?? db;
  const result = await runner.query(
    "SELECT next_ref_num($1, 'JE', 'journal_entry') AS ref",
    [companyId],
  );
  return result.rows[0].ref;
}

// ─────────────────────────────────────────────────────────────
// SEED DEFAULT CHART OF ACCOUNTS
// Called once when a new company registers.
// ─────────────────────────────────────────────────────────────
export async function seedDefaultAccounts(companyId, client = null) {
  const runner = client ?? db;
  await runner.query("SELECT seed_chart_of_accounts($1)", [companyId]);
}

// ─────────────────────────────────────────────────────────────
// FIND ACCOUNT BY CODE (scoped to company)
// ─────────────────────────────────────────────────────────────
export async function findAccountByCode(companyId, code, client = null) {
  const runner = client ?? db;
  const result = await runner.query(
    `SELECT id FROM chart_of_accounts
     WHERE company_id = $1 AND account_code = $2 AND is_active = TRUE
     LIMIT 1`,
    [companyId, code],
  );
  return result.rows[0] ?? null;
}

// ─────────────────────────────────────────────────────────────
// CREATE JOURNAL ENTRY (full transaction)
//
// payload: {
//   companyId, createdBy, entryDate, description, source?,
//   sourceRefId?, lines: [{ accountId, debitAmount, creditAmount, description? }]
// }
//
// All amounts in kobo. Returns the created journal entry row.
// ─────────────────────────────────────────────────────────────
export async function createJournalEntry(payload, ip = null, userAgent = null) {
  const {
    companyId,
    createdBy,
    entryDate,
    description,
    source = "manual",
    sourceRefId = null,
    lines,
  } = payload;

  // ── Validation ────────────────────────────────────────────
  if (!lines || lines.length < 2) {
    throw new ValidationError("Journal entry must have at least two lines.");
  }

  const totalDebits = lines.reduce(
    (s, l) => s + BigInt(l.debitAmount ?? 0),
    0n,
  );
  const totalCredits = lines.reduce(
    (s, l) => s + BigInt(l.creditAmount ?? 0),
    0n,
  );

  if (totalDebits !== totalCredits) {
    throw new ValidationError(
      `Debits (${totalDebits}) must equal credits (${totalCredits}). Double-entry violated.`,
    );
  }
  if (totalDebits === 0n) {
    throw new ValidationError("Journal entry cannot have zero-value lines.");
  }
  for (const line of lines) {
    const d = BigInt(line.debitAmount ?? 0);
    const c = BigInt(line.creditAmount ?? 0);
    if ((d > 0n && c > 0n) || (d === 0n && c === 0n)) {
      throw new ValidationError(
        "Each line must have either a debit or a credit amount — not both, not neither.",
      );
    }
    if (!line.accountId) {
      throw new ValidationError(
        "Every journal entry line requires an accountId.",
      );
    }
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    // Verify all accounts exist and belong to this company
    for (const line of lines) {
      const acctRes = await client.query(
        `SELECT id FROM chart_of_accounts
         WHERE id = $1 AND company_id = $2 AND is_active = TRUE`,
        [line.accountId, companyId],
      );
      if (acctRes.rows.length === 0) {
        throw new ValidationError(
          `Account ${line.accountId} not found or inactive for this company.`,
        );
      }
    }

    // Generate reference number (uses DB sequence — safe under concurrency)
    const refNumber = await generateRefNumber(companyId, client);

    // Insert journal entry header
    const jeRes = await client.query(
      `INSERT INTO journal_entries
         (company_id, reference_number, entry_date, description,
          status, source, source_ref_id, created_by)
       VALUES ($1,$2,$3,$4,'Draft',$5,$6,$7)
       RETURNING *`,
      [
        companyId,
        refNumber,
        entryDate,
        description,
        source,
        sourceRefId,
        createdBy,
      ],
    );
    const je = jeRes.rows[0];

    // Insert lines
    for (const line of lines) {
      await client.query(
        `INSERT INTO journal_entry_lines
           (journal_entry_id, account_id, debit_amount, credit_amount, description)
         VALUES ($1,$2,$3,$4,$5)`,
        [
          je.id,
          line.accountId,
          Number(line.debitAmount ?? 0),
          Number(line.creditAmount ?? 0),
          line.description ?? null,
        ],
      );
    }

    // Audit log
    await writeAuditLog(
      {
        companyId,
        userId: createdBy,
        action: "CREATE",
        module: "JournalEntry",
        recordId: je.id,
        newValue: {
          referenceNumber: je.reference_number,
          totalDebits: totalDebits.toString(),
        },
        ipAddress: ip,
        userAgent,
      },
      client,
    );

    await client.query("COMMIT");
    return je;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ─────────────────────────────────────────────────────────────
// POST JOURNAL ENTRY (Draft → Posted)
// Posted entries are immutable.
// ─────────────────────────────────────────────────────────────
export async function postJournalEntry(
  journalEntryId,
  companyId,
  userId,
  ip = null,
  ua = null,
) {
  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      "SELECT * FROM journal_entries WHERE id = $1 AND company_id = $2 FOR UPDATE",
      [journalEntryId, companyId],
    );

    if (existing.rows.length === 0)
      throw new NotFoundError("Journal entry not found.");
    const je = existing.rows[0];

    if (je.status !== "Draft") {
      throw new ValidationError(
        `Cannot post a journal entry with status '${je.status}'.`,
      );
    }

    const updated = await client.query(
      `UPDATE journal_entries
       SET status = 'Posted', posted_by = $1, posted_at = NOW(), updated_at = NOW()
       WHERE id = $2 AND company_id = $3
       RETURNING *`,
      [userId, journalEntryId, companyId],
    );

    await writeAuditLog(
      {
        companyId,
        userId,
        action: "POST",
        module: "JournalEntry",
        recordId: journalEntryId,
        previousValue: { status: "Draft" },
        newValue: { status: "Posted" },
        ipAddress: ip,
        userAgent: ua,
      },
      client,
    );

    await client.query("COMMIT");
    return updated.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ─────────────────────────────────────────────────────────────
// VOID JOURNAL ENTRY (Posted → Void)
// Creates an automatic reversal journal entry.
// ─────────────────────────────────────────────────────────────
export async function voidJournalEntry(
  journalEntryId,
  companyId,
  userId,
  reason,
  ip = null,
  ua = null,
) {
  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT je.*, json_agg(jel.*) AS lines
       FROM journal_entries je
       LEFT JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id
       WHERE je.id = $1 AND je.company_id = $2
       GROUP BY je.id
       FOR UPDATE OF je`,
      [journalEntryId, companyId],
    );

    if (existing.rows.length === 0)
      throw new NotFoundError("Journal entry not found.");
    const je = existing.rows[0];

    if (je.status !== "Posted") {
      throw new ValidationError(
        `Only Posted entries can be voided. Current status: '${je.status}'.`,
      );
    }

    // Mark original as Void
    await client.query(
      `UPDATE journal_entries
       SET status = 'Void', voided_by = $1, voided_at = NOW(), updated_at = NOW()
       WHERE id = $2`,
      [userId, journalEntryId],
    );

    // Create the reversal entry (swap debit/credit on every line)
    const reversalRef = await generateRefNumber(companyId, client);

    const reversalRes = await client.query(
      `INSERT INTO journal_entries
         (company_id, reference_number, entry_date, description,
          status, source, created_by, reversal_of)
       VALUES ($1,$2,NOW(),$3,'Posted','system',$4,$5)
       RETURNING *`,
      [
        companyId,
        reversalRef,
        `REVERSAL of ${je.reference_number}: ${reason ?? "Voided"}`,
        userId,
        journalEntryId,
      ],
    );
    const reversal = reversalRes.rows[0];

    // Mirror lines with swapped amounts
    for (const line of je.lines) {
      await client.query(
        `INSERT INTO journal_entry_lines
           (journal_entry_id, account_id, debit_amount, credit_amount, description)
         VALUES ($1,$2,$3,$4,$5)`,
        [
          reversal.id,
          line.account_id,
          line.credit_amount, // swap
          line.debit_amount, // swap
          `Reversal: ${line.description ?? ""}`,
        ],
      );
    }

    await writeAuditLog(
      {
        companyId,
        userId,
        action: "VOID",
        module: "JournalEntry",
        recordId: journalEntryId,
        previousValue: { status: "Posted" },
        newValue: { status: "Void", reversalId: reversal.id },
        ipAddress: ip,
        userAgent: ua,
      },
      client,
    );

    await client.query("COMMIT");
    return { original: { id: journalEntryId, status: "Void" }, reversal };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ─────────────────────────────────────────────────────────────
// PAYROLL INTEGRATION
// Called by payroll controller after a run is marked as Paid.
// Creates a Posted journal entry automatically.
//
// payload: { companyId, createdBy, totalNetPay (kobo), payrollDate,
//            payrollRunId, totalGross (kobo), totalTax (kobo), totalPension (kobo) }
// ─────────────────────────────────────────────────────────────
export async function createPayrollJournalEntry(payload) {
  const {
    companyId,
    createdBy,
    totalNetPay,
    payrollDate,
    payrollRunId,
    totalGross,
    totalTax = 0,
    totalPension = 0,
  } = payload;

  // Lookup the required default accounts
  const [salaryExpense, bankAccount, payeTax, pension, salariesPayable] =
    await Promise.all([
      findAccountByCode(companyId, "5001"), // Salaries & Wages Expense
      findAccountByCode(companyId, "1002"), // Bank Account
      findAccountByCode(companyId, "2021"), // PAYE Tax Payable
      findAccountByCode(companyId, "2022"), // Pension Payable
      findAccountByCode(companyId, "2030"), // Salaries Payable
    ]);

  if (!salaryExpense || !bankAccount) {
    throw new ValidationError(
      "Default accounts 5001 (Salary Expense) and 1002 (Bank) must exist. " +
        "Run account setup first.",
    );
  }

  // Build double-entry lines
  // Debit: Salary Expense (gross payroll cost)
  // Credit: PAYE Tax Payable + Pension Payable + Bank (net pay)
  const lines = [
    // DEBIT: total gross salary expense
    {
      accountId: salaryExpense.id,
      debitAmount: totalGross,
      creditAmount: 0,
      description: "Gross payroll cost",
    },
  ];

  // CREDIT: PAYE Tax Payable
  if (totalTax > 0 && payeTax) {
    lines.push({
      accountId: payeTax.id,
      debitAmount: 0,
      creditAmount: totalTax,
      description: "PAYE tax withheld",
    });
  }

  // CREDIT: Pension Payable
  if (totalPension > 0 && pension) {
    lines.push({
      accountId: pension.id,
      debitAmount: 0,
      creditAmount: totalPension,
      description: "Pension contribution withheld",
    });
  }

  // CREDIT: Bank (net cash disbursed)
  const netToBank = totalGross - totalTax - totalPension;
  lines.push({
    accountId: bankAccount.id,
    debitAmount: 0,
    creditAmount: netToBank,
    description: "Net payroll disbursement",
  });

  const je = await createJournalEntry({
    companyId,
    createdBy,
    entryDate: payrollDate,
    description: `Payroll run — ${payrollDate}`,
    source: "payroll",
    sourceRefId: payrollRunId,
    lines,
  });

  // Auto-post the payroll journal entry
  await postJournalEntry(je.id, companyId, createdBy);

  return je;
}

// ─────────────────────────────────────────────────────────────
// Error classes (re-use existing patterns in the project)
// ─────────────────────────────────────────────────────────────
export class ValidationError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "ValidationError";
    this.status = 422;
  }
}
export class NotFoundError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "NotFoundError";
    this.status = 404;
  }
}
export class ConflictError extends Error {
  constructor(msg) {
    super(msg);
    this.name = "ConflictError";
    this.status = 409;
  }
}
