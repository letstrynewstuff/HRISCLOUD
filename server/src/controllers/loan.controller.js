// src/controllers/loan.controller.js
//
// Endpoints:
//   GET  /api/loans              → all loans, paginated + filtered (HR)
//   POST /api/loans              → employee submits a loan request
//   GET  /api/loans/me           → employee's own loans
//   GET  /api/loans/:id/schedule → full repayment schedule for a loan
//   PUT  /api/loans/:id/approve  → HR approves + optionally disburses
//   PUT  /api/loans/:id/reject   → HR rejects
//
// Stack : Express · pg (raw) · express-validator
// Auth  : authenticate injects req.user { userId, companyId, role }
//
// Loan model reference (Loan.js):
//   createLoan  — monthly = amount / repaymentMonths, balance = amount
//   addRepayment — appends to repayment_history JSONB, decrements balance
//   Both used as the exact logic template; controller calls db.query directly.

import { validationResult } from "express-validator";
import { db } from "../config/db.js";
import { createAuditLog } from "../models/AuditLog.js";

// ─── Internal helpers ──────────────────────────────────────────────────────────

function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res
      .status(422)
      .json({ message: "Validation failed.", errors: errors.array() });
    return true;
  }
  return false;
}

/**
 * Build a full repayment schedule from loan parameters.
 * Mirrors the monthly = amount / repaymentMonths logic from Loan.js.
 * Returns an array of { installment, dueDate, amount, balance } rows.
 */
function buildRepaymentSchedule(
  amount,
  monthlyDeduction,
  repaymentMonths,
  disbursedAt,
) {
  const schedule = [];
  const startDate = disbursedAt ? new Date(disbursedAt) : new Date();
  let balance = parseFloat(amount);

  for (let i = 1; i <= repaymentMonths; i++) {
    const due = new Date(startDate);
    due.setMonth(due.getMonth() + i);

    // Last installment takes the remaining balance to avoid rounding drift
    const payment =
      i === repaymentMonths
        ? parseFloat(balance.toFixed(2))
        : parseFloat(monthlyDeduction.toFixed(2));

    balance -= payment;

    schedule.push({
      installment: i,
      dueDate: due.toISOString().split("T")[0],
      amount: payment,
      balance: parseFloat(Math.max(0, balance).toFixed(2)),
    });
  }

  return schedule;
}

// ══════════════════════════════════════════════════════════════
// GET /api/loans
// All loans for the company — HR view, paginated + filtered.
// Query params:
//   page       — default 1
//   limit      — default 20, max 100
//   status     — pending | approved | rejected | active | completed
//   employeeId — UUID
// Requires: authenticate + requireRole(["hr_admin","super_admin"])
// ══════════════════════════════════════════════════════════════
export async function listLoans(req, res) {
  try {
    const { companyId } = req.user;

    const page = Math.max(1, parseInt(req.query.page ?? 1, 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit ?? 20, 10)),
    );
    const offset = (page - 1) * limit;

    const conditions = ["l.company_id = $1"];
    const values = [companyId];
    let idx = 2;

    if (req.query.status) {
      conditions.push(`l.status = $${idx}`);
      values.push(req.query.status);
      idx++;
    }

    if (req.query.employeeId) {
      conditions.push(`l.employee_id = $${idx}`);
      values.push(req.query.employeeId);
      idx++;
    }

    const whereClause = conditions.join(" AND ");

    const countResult = await db.query(
      `SELECT COUNT(*) AS total FROM loans l WHERE ${whereClause}`,
      values,
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const dataResult = await db.query(
      `SELECT
         l.id,
         l.employee_id,
         CONCAT(e.first_name, ' ', e.last_name)  AS employee_name,
         e.employee_code,
         d.name                                   AS department_name,
         l.amount,
         l.reason,
         l.repayment_months,
         l.monthly_deduction,
         l.status,
         l.total_repaid,
         l.balance,
         l.disbursed_at,
         l.approved_at,
         CONCAT(u.first_name, ' ', u.last_name)  AS approved_by_name,
         l.created_at,
         l.updated_at
       FROM loans l
       JOIN employees   e ON e.id  = l.employee_id
       LEFT JOIN departments d ON d.id = e.department_id
       LEFT JOIN users      u ON u.id = l.approved_by
       WHERE ${whereClause}
       ORDER BY l.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset],
    );

    return res.status(200).json({
      data: dataResult.rows,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("listLoans error:", err);
    return res.status(500).json({ message: "Server error fetching loans." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/loans
// Employee submits a loan request.
// Business rules:
//   • Employee must be active
//   • No existing pending or active loan for this employee
//     (one loan at a time policy)
//   • monthly_deduction = amount / repaymentMonths  (from Loan.js)
//   • balance = amount at creation               (from Loan.js)
// Requires: authenticate (any role — employee submits for themselves)
// ══════════════════════════════════════════════════════════════
export async function submitLoanRequest(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { userId, companyId } = req.user;
  const { amount, reason, repaymentMonths } = req.body;

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    // 1. Resolve employee
    const empResult = await client.query(
      `SELECT id, employment_status
       FROM employees
       WHERE user_id = $1 AND company_id = $2`,
      [userId, companyId],
    );
    if (empResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Employee profile not found." });
    }
    const emp = empResult.rows[0];

    if (emp.employment_status !== "active") {
      await client.query("ROLLBACK");
      return res.status(403).json({
        message: "Only active employees can submit a loan request.",
      });
    }

    // 2. One-loan-at-a-time guard
    const existing = await client.query(
      `SELECT id FROM loans
       WHERE employee_id = $1
         AND status IN ('pending', 'active', 'approved')`,
      [emp.id],
    );
    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message:
          "You already have a pending or active loan. Please complete repayment before applying again.",
      });
    }

    // 3. Compute monthly deduction — mirrors Loan.js: monthly = amount / repaymentMonths
    const monthly = parseFloat((amount / repaymentMonths).toFixed(2));

    // 4. Insert loan — balance = amount at creation (from Loan.js)
    const loanResult = await client.query(
      `INSERT INTO loans (
         company_id, employee_id,
         amount, reason,
         repayment_months, monthly_deduction,
         balance, status, created_at
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending',NOW())
       RETURNING *`,
      [
        companyId,
        emp.id,
        amount,
        reason ?? null,
        repaymentMonths,
        monthly,
        amount,
      ],
    );
    const loan = loanResult.rows[0];

    // 5. Audit log
    await createAuditLog({
      companyId,
      userId,
      action: "loan.request",
      entity: "loans",
      entityId: loan.id,
      before: null,
      after: { amount, repaymentMonths, monthly },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Loan request submitted successfully.",
      data: loan,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("submitLoanRequest error:", err);
    return res
      .status(500)
      .json({ message: "Server error submitting loan request." });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/loans/me
// Employee views their own loans — all statuses, newest first.
// Query params: status
// Requires: authenticate (any role)
// ══════════════════════════════════════════════════════════════
export async function getMyLoans(req, res) {
  try {
    const { userId, companyId } = req.user;

    const empResult = await db.query(
      `SELECT id FROM employees WHERE user_id = $1 AND company_id = $2`,
      [userId, companyId],
    );
    if (empResult.rows.length === 0) {
      return res.status(404).json({ message: "Employee profile not found." });
    }
    const employeeId = empResult.rows[0].id;

    const conditions = ["l.employee_id = $1"];
    const values = [employeeId];
    let idx = 2;

    if (req.query.status) {
      conditions.push(`l.status = $${idx}`);
      values.push(req.query.status);
      idx++;
    }

    const result = await db.query(
      `SELECT
         l.id,
         l.amount,
         l.reason,
         l.repayment_months,
         l.monthly_deduction,
         l.status,
         l.total_repaid,
         l.balance,
         l.disbursed_at,
         l.approved_at,
         l.created_at,
         l.repayment_history
       FROM loans l
       WHERE ${conditions.join(" AND ")}
       ORDER BY l.created_at DESC`,
      values,
    );

    return res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error("getMyLoans error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching your loans." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/loans/:id/schedule
// Returns the full month-by-month repayment schedule for a loan.
// HR can view any loan; employee can only view their own.
// Requires: authenticate
// ══════════════════════════════════════════════════════════════
export async function getLoanSchedule(req, res) {
  const { id } = req.params;
  const { userId, companyId, role } = req.user;

  try {
    const result = await db.query(
      `SELECT
         l.*,
         CONCAT(e.first_name, ' ', e.last_name) AS employee_name
       FROM loans l
       JOIN employees e ON e.id = l.employee_id
       WHERE l.id = $1 AND l.company_id = $2`,
      [id, companyId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Loan not found." });
    }

    const loan = result.rows[0];

    // Employees can only view their own loan schedule
    if (!["hr_admin", "super_admin"].includes(role)) {
      const empResult = await db.query(
        `SELECT id FROM employees WHERE user_id = $1 AND company_id = $2`,
        [userId, companyId],
      );
      if (empResult.rows[0]?.id !== loan.employee_id) {
        return res.status(403).json({ message: "Access denied." });
      }
    }

    const schedule = buildRepaymentSchedule(
      loan.amount,
      loan.monthly_deduction,
      loan.repayment_months,
      loan.disbursed_at,
    );

    return res.status(200).json({
      data: {
        loanId: loan.id,
        employeeName: loan.employee_name,
        amount: loan.amount,
        monthlyDeduction: loan.monthly_deduction,
        repaymentMonths: loan.repayment_months,
        totalRepaid: loan.total_repaid,
        balance: loan.balance,
        status: loan.status,
        disbursedAt: loan.disbursed_at,
        schedule,
      },
    });
  } catch (err) {
    console.error("getLoanSchedule error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching repayment schedule." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/loans/:id/approve
// HR approves a pending loan.
//   • Sets status → 'approved' then optionally 'active' if disbursedAt sent
//   • Records approved_by + approved_at
//   • If disbursedAt provided, marks disbursed_at and flips to 'active'
//   • Creates a notification for the employee
//   • Writes audit log
// Requires: authenticate + requireRole(["hr_admin","super_admin"])
// ══════════════════════════════════════════════════════════════
export async function approveLoan(req, res) {
  const { id } = req.params;
  const { companyId, userId } = req.user;
  const { disburse = false } = req.body; // if true → mark active immediately

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const loanResult = await client.query(
      `SELECT l.*, e.user_id AS employee_user_id
       FROM loans l
       JOIN employees e ON e.id = l.employee_id
       WHERE l.id = $1 AND l.company_id = $2`,
      [id, companyId],
    );
    if (loanResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Loan not found." });
    }
    const loan = loanResult.rows[0];

    if (loan.status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: `Cannot approve a loan with status "${loan.status}".`,
      });
    }

    const newStatus = disburse ? "active" : "approved";
    const disbursedAt = disburse ? new Date().toISOString() : null;

    const updatedResult = await client.query(
      `UPDATE loans
       SET
         status      = $1,
         approved_by = $2,
         approved_at = NOW(),
         disbursed_at= $3,
         updated_at  = NOW()
       WHERE id = $4
       RETURNING *`,
      [newStatus, userId, disbursedAt, id],
    );
    const updated = updatedResult.rows[0];

    // Notify the employee
    await client.query(
      `INSERT INTO notifications (
         company_id, user_id, title, message, type, link, created_at
       )
       VALUES ($1,$2,$3,$4,'payroll',$5,NOW())`,
      [
        companyId,
        loan.employee_user_id,
        "Loan Request Approved",
        `Your loan request of ₦${parseFloat(loan.amount).toLocaleString()} has been approved.${disburse ? " Funds have been disbursed." : ""}`,
        `/loans/${loan.id}`,
      ],
    );

    // Audit log
    await createAuditLog({
      companyId,
      userId,
      action: disburse ? "loan.approved_disbursed" : "loan.approved",
      entity: "loans",
      entityId: id,
      before: { status: "pending" },
      after: { status: newStatus, approvedBy: userId, disbursedAt },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await client.query("COMMIT");

    return res.status(200).json({
      message: disburse
        ? "Loan approved and marked as disbursed."
        : "Loan approved.",
      data: updated,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("approveLoan error:", err);
    return res.status(500).json({ message: "Server error approving loan." });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/loans/:id/reject
// HR rejects a pending loan.
//   • Sets status → 'rejected'
//   • rejectionReason is required
//   • Notifies the employee
//   • Writes audit log
// Requires: authenticate + requireRole(["hr_admin","super_admin"])
// ══════════════════════════════════════════════════════════════
export async function rejectLoan(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { id } = req.params;
  const { companyId, userId } = req.user;
  const { rejectionReason } = req.body;

  if (!rejectionReason?.trim()) {
    return res.status(400).json({ message: "rejectionReason is required." });
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const loanResult = await client.query(
      `SELECT l.*, e.user_id AS employee_user_id
       FROM loans l
       JOIN employees e ON e.id = l.employee_id
       WHERE l.id = $1 AND l.company_id = $2`,
      [id, companyId],
    );
    if (loanResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Loan not found." });
    }
    const loan = loanResult.rows[0];

    if (loan.status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: `Cannot reject a loan with status "${loan.status}".`,
      });
    }

    const updatedResult = await client.query(
      `UPDATE loans
       SET
         status      = 'rejected',
         approved_by = $1,
         approved_at = NOW(),
         updated_at  = NOW()
       WHERE id = $2
       RETURNING *`,
      [userId, id],
    );

    // Notify employee
    await client.query(
      `INSERT INTO notifications (
         company_id, user_id, title, message, type, link, created_at
       )
       VALUES ($1,$2,$3,$4,'payroll',$5,NOW())`,
      [
        companyId,
        loan.employee_user_id,
        "Loan Request Rejected",
        `Your loan request of ₦${parseFloat(loan.amount).toLocaleString()} was not approved. Reason: ${rejectionReason}`,
        `/loans/${loan.id}`,
      ],
    );

    // Audit log
    await createAuditLog({
      companyId,
      userId,
      action: "loan.rejected",
      entity: "loans",
      entityId: id,
      before: { status: "pending" },
      after: { status: "rejected", rejectionReason },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Loan request rejected.",
      data: updatedResult.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("rejectLoan error:", err);
    return res.status(500).json({ message: "Server error rejecting loan." });
  } finally {
    client.release();
  }
}
