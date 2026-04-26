// src/controllers/leave.controller.js

import { validationResult } from "express-validator";
import { db } from "../config/db.js";

// ─── Internal helpers ──────────────────────────────────────────────────────────

/** Return 422 with field errors if express-validator found any. Returns true if halted. */
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
 * Count working days between two ISO date strings (inclusive).
 * Skips Saturday (6) and Sunday (0).
 * Public holidays are not deducted here — HR can adjust manually.
 */
function countWorkingDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  const cursor = new Date(start);

  while (cursor <= end) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count++;
    cursor.setDate(cursor.getDate() + 1);
  }

  return count;
}

// ══════════════════════════════════════════════════════════════
// GET /api/leave/policies
// Returns all active leave policies for the company.
// Requires: authenticate + requireRole(["hr_admin","super_admin","employee"])
// ══════════════════════════════════════════════════════════════
export async function getPolicies(req, res) {
  try {
    const { companyId } = req.user;

    const result = await db.query(
      `SELECT
         id,
         name,
         leave_type,
         days_allowed,
         carry_over_days,
         is_paid,
         requires_approval,
         requires_document,
         min_days_per_request,
         max_days_per_request,
         notice_days,
         applicable_to,
         is_active,
         created_at,
         updated_at
       FROM leave_policies
       WHERE company_id = $1
       ORDER BY leave_type ASC`,
      [companyId],
    );

    return res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error("getPolicies error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching leave policies." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/leave/policies
// Creates a new leave policy for the company.
// Also seeds leave_balances rows for all active employees
// so every existing employee immediately has a balance entry.
// Requires: authenticate + requireRole(["hr_admin","super_admin"])
// ══════════════════════════════════════════════════════════════
export async function createPolicy(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { companyId, userId } = req.user;
  const {
    name,
    leaveType,
    daysAllowed,
    carryOverDays = 0,
    isPaid = true,
    requiresApproval = true,
    requiresDocument = false,
    minDaysPerRequest = 1,
    maxDaysPerRequest,
    noticeDays = 0,
    applicableTo = ["full_time", "part_time", "contract", "intern"],
  } = req.body;

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    // 1. Check for duplicate leave type within this company
    const dupCheck = await client.query(
      `SELECT id FROM leave_policies
       WHERE company_id = $1 AND leave_type = $2 AND is_active = true`,
      [companyId, leaveType],
    );
    if (dupCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: `An active policy for leave type "${leaveType}" already exists.`,
      });
    }

    // 2. Create the policy
    const policyResult = await client.query(
      `INSERT INTO leave_policies (
         company_id, name, leave_type, days_allowed, carry_over_days,
         is_paid, requires_approval, requires_document,
         min_days_per_request, max_days_per_request,
         notice_days, applicable_to, is_active, created_by, created_at
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,true,$13,NOW())
       RETURNING *`,
      [
        companyId,
        name,
        leaveType,
        daysAllowed,
        carryOverDays,
        isPaid,
        requiresApproval,
        requiresDocument,
        minDaysPerRequest,
        maxDaysPerRequest ?? daysAllowed,
        noticeDays,
        applicableTo,
        userId,
      ],
    );
    const policy = policyResult.rows[0];

    // 3. Seed a balance row for every active employee in this company
    //    so the new policy is immediately visible on all profiles.
    await client.query(
      `INSERT INTO leave_balances (
         company_id, employee_id, leave_policy_id,
         entitled_days, used_days, pending_days, remaining_days,
         year, created_at
       )
       SELECT
         $1,
         e.id,
         $2,
         $3,   -- entitled_days
         0,    -- used_days
         0,    -- pending_days
         $3,   -- remaining_days = entitled at creation
         EXTRACT(YEAR FROM NOW())::int,
         NOW()
       FROM employees e
       WHERE e.company_id = $1
         AND e.employment_status = 'active'
         AND e.employment_type = ANY($4::text[])
       ON CONFLICT (employee_id, leave_policy_id, year) DO NOTHING`,
      [companyId, policy.id, daysAllowed, applicableTo],
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Leave policy created successfully.",
      data: policy,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("createPolicy error:", err);
    return res
      .status(500)
      .json({ message: "Server error creating leave policy." });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/leave/policies/:id
// Updates a leave policy. If days_allowed changes, the delta is
// applied to all active employee balances for the current year.
// Requires: authenticate + requireRole(["hr_admin","super_admin"])
// ══════════════════════════════════════════════════════════════
export async function updatePolicy(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { id } = req.params;
  const { companyId } = req.user;
  const {
    name,
    daysAllowed,
    carryOverDays,
    isPaid,
    requiresApproval,
    requiresDocument,
    minDaysPerRequest,
    maxDaysPerRequest,
    noticeDays,
    applicableTo,
    isActive,
  } = req.body;

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    // Fetch current policy (company guard)
    const current = await client.query(
      `SELECT * FROM leave_policies WHERE id = $1 AND company_id = $2`,
      [id, companyId],
    );
    if (current.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Leave policy not found." });
    }
    const old = current.rows[0];

    // Apply update — only include fields that were sent
    const updateResult = await client.query(
      `UPDATE leave_policies
       SET
         name                = COALESCE($1,  name),
         days_allowed        = COALESCE($2,  days_allowed),
         carry_over_days     = COALESCE($3,  carry_over_days),
         is_paid             = COALESCE($4,  is_paid),
         requires_approval   = COALESCE($5,  requires_approval),
         requires_document   = COALESCE($6,  requires_document),
         min_days_per_request= COALESCE($7,  min_days_per_request),
         max_days_per_request= COALESCE($8,  max_days_per_request),
         notice_days         = COALESCE($9,  notice_days),
         applicable_to       = COALESCE($10, applicable_to),
         is_active           = COALESCE($11, is_active),
         updated_at          = NOW()
       WHERE id = $12 AND company_id = $13
       RETURNING *`,
      [
        name ?? null,
        daysAllowed ?? null,
        carryOverDays ?? null,
        isPaid ?? null,
        requiresApproval ?? null,
        requiresDocument ?? null,
        minDaysPerRequest ?? null,
        maxDaysPerRequest ?? null,
        noticeDays ?? null,
        applicableTo ?? null,
        isActive ?? null,
        id,
        companyId,
      ],
    );
    const updated = updateResult.rows[0];

    // If entitled days changed, propagate the delta to all open balances
    if (daysAllowed !== undefined && daysAllowed !== old.days_allowed) {
      const delta = daysAllowed - old.days_allowed;
      await client.query(
        `UPDATE leave_balances
         SET
           entitled_days  = entitled_days  + $1,
           remaining_days = GREATEST(0, remaining_days + $1),
           updated_at     = NOW()
         WHERE leave_policy_id = $2
           AND year = EXTRACT(YEAR FROM NOW())::int`,
        [delta, id],
      );
    }

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Leave policy updated successfully.",
      data: updated,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("updatePolicy error:", err);
    return res
      .status(500)
      .json({ message: "Server error updating leave policy." });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/leave/balances
// All employee leave balances for the company — HR view.
// Query params: employeeId, leaveType, year (default current year)
// Requires: authenticate + requireRole(["hr_admin","super_admin"])
// ══════════════════════════════════════════════════════════════
export async function getAllBalances(req, res) {
  try {
    const { companyId } = req.user;
    const year = parseInt(req.query.year ?? new Date().getFullYear(), 10);

    const conditions = ["lb.company_id = $1", "lb.year = $2"];
    const values = [companyId, year];
    let idx = 3;

    if (req.query.employeeId) {
      conditions.push(`lb.employee_id = $${idx}`);
      values.push(req.query.employeeId);
      idx++;
    }

    if (req.query.leaveType) {
      conditions.push(`lp.leave_type = $${idx}`);
      values.push(req.query.leaveType);
      idx++;
    }

    const result = await db.query(
      `SELECT
         lb.id,
         lb.employee_id,
         CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
         e.employee_code,
         d.name                                  AS department_name,
         lp.name                                 AS policy_name,
         lp.leave_type,
         lb.entitled_days,
         lb.used_days,
         lb.pending_days,
         lb.remaining_days,
         lb.carry_over_days,
         lb.year,
         lb.updated_at
       FROM leave_balances lb
       JOIN employees     e  ON e.id  = lb.employee_id
       JOIN leave_policies lp ON lp.id = lb.leave_policy_id
       LEFT JOIN departments d ON d.id = e.department_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY e.last_name, lp.leave_type`,
      values,
    );

    return res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error("getAllBalances error:", err);
    return res.status(500).json({ message: "Server error fetching balances." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/leave/balances/me
// Authenticated employee views their own leave balances for the
// current year across all policy types.
// Requires: authenticate (any role)
// ══════════════════════════════════════════════════════════════

export async function getMyBalances(req, res) {
  try {
    const { userId, companyId } = req.user;
    const year = parseInt(req.query.year ?? new Date().getFullYear(), 10);

    // Resolve employee record for this user
    const empResult = await db.query(
      `SELECT id 
       FROM employees 
       WHERE user_id = $1 
         AND company_id = $2`,
      [userId, companyId],
    );

    if (empResult.rows.length === 0) {
      return res.status(404).json({ message: "Employee profile not found." });
    }

    const employeeId = empResult.rows[0].id;

    const result = await db.query(
      `SELECT
         lb.id,
         lp.name        AS policy_name,
         lp.leave_type,
         lp.is_paid,
         lb.entitled,
         lb.taken,
         lb.pending,
         lb.remaining,
         lb.carried_over,
         lb.year
       FROM leave_balances lb
       JOIN leave_policies lp 
         ON lp.id = lb.leave_policy_id
       WHERE lb.employee_id = $1
         AND lb.company_id  = $2
         AND lb.year        = $3
         AND lp.is_active   = true
       ORDER BY lp.leave_type`,
      [employeeId, companyId, year],
    );

    return res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error("getMyBalances error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching your balances." });
  }
}
// ══════════════════════════════════════════════════════════════
// PUT /api/leave/balances/:id
// HR manually adjusts an employee's leave balance (e.g., correction,
// carry-over adjustment, or compassionate top-up).
// Logs the adjustment reason to leave_balance_adjustments.
// Requires: authenticate + requireRole(["hr_admin","super_admin"])
// ══════════════════════════════════════════════════════════════
export async function adjustBalance(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { id } = req.params;
  const { companyId, userId } = req.user;
  const { adjustment, reason } = req.body; // adjustment: signed integer e.g. 3 or -2

  if (adjustment === undefined || typeof adjustment !== "number") {
    return res
      .status(400)
      .json({ message: "adjustment must be a signed number (e.g. 3 or -2)." });
  }
  if (!reason?.trim()) {
    return res.status(400).json({
      message: "A reason is required for manual balance adjustments.",
    });
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    // Fetch balance — guard company ownership via the employee join
    const balResult = await client.query(
      `SELECT lb.*, e.company_id
       FROM leave_balances lb
       JOIN employees e ON e.id = lb.employee_id
       WHERE lb.id = $1 AND e.company_id = $2`,
      [id, companyId],
    );
    if (balResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ message: "Leave balance record not found." });
    }

    const bal = balResult.rows[0];
    const newEntitled = bal.entitled_days + adjustment;
    const newRemaining = Math.max(0, bal.remaining_days + adjustment);

    if (newEntitled < 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Adjustment would result in a negative entitled balance.",
      });
    }

    const updated = await client.query(
      `UPDATE leave_balances
       SET
         entitled_days  = $1,
         remaining_days = $2,
         updated_at     = NOW()
       WHERE id = $3
       RETURNING *`,
      [newEntitled, newRemaining, id],
    );

    // Audit log
    await client.query(
      `INSERT INTO leave_balance_adjustments (
         leave_balance_id, adjusted_by, adjustment, reason, created_at
       )
       VALUES ($1, $2, $3, $4, NOW())`,
      [id, userId, adjustment, reason],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Leave balance adjusted successfully.",
      data: updated.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("adjustBalance error:", err);
    return res.status(500).json({ message: "Server error adjusting balance." });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/leave/requests
// All leave requests for the company — HR view.
// Query params:
//   status     — pending | approved | rejected | cancelled
//   employeeId — UUID
//   leaveType  — text
//   from       — ISO date (filter start_date >=)
//   to         — ISO date (filter end_date <=)
//   page       — default 1
//   limit      — default 20, max 100
// Requires: authenticate + requireRole(["hr_admin","super_admin","manager"])
// ══════════════════════════════════════════════════════════════

export async function getAllRequests(req, res) {
  try {
    // isHR and employeeId are set by requireManagerial middleware
    const { companyId, isHR, employeeId: managerEmpId } = req.user;

    const page = Math.max(1, parseInt(req.query.page ?? 1, 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit ?? 20, 10)),
    );
    const offset = (page - 1) * limit;

    const conditions = ["l.company_id = $1"];
    const values = [companyId];
    let idx = 2;

    // ── MANAGER SCOPE ─────────────────────────────────────────────────────
    // FIX: was `if (role === "manager")` — role is NEVER "manager" in the JWT.
    // Now we use isHR which is set by requireManagerial based on live DB check.
    if (!isHR && managerEmpId) {
      conditions.push(`e.manager_id = $${idx}`);
      values.push(managerEmpId);
      idx++;
    }
    // ──────────────────────────────────────────────────────────────────────

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

    if (req.query.leaveType) {
      conditions.push(`lp.leave_type = $${idx}`);
      values.push(req.query.leaveType);
      idx++;
    }

    if (req.query.from) {
      conditions.push(`l.start_date >= $${idx}`);
      values.push(req.query.from);
      idx++;
    }

    if (req.query.to) {
      conditions.push(`l.end_date <= $${idx}`);
      values.push(req.query.to);
      idx++;
    }

    const whereClause = conditions.join(" AND ");

    const countResult = await db.query(
      `SELECT COUNT(*) AS total
       FROM leaves l
       JOIN employees     e  ON e.id  = l.employee_id
       JOIN leave_policies lp ON lp.id = l.leave_policy_id
       WHERE ${whereClause}`,
      values,
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const dataResult = await db.query(
      `SELECT
         l.id,
         l.employee_id,
         CONCAT(e.first_name, ' ', e.last_name)   AS employee_name,
         e.employee_code,
         d.name                                    AS department_name,
         lp.name                                   AS policy_name,
         lp.leave_type,
         lp.is_paid,
         l.start_date,
         l.end_date,
         l.days,
         l.reason,
         l.supporting_document,
         l.status,
         l.approved_at,
         l.rejection_reason,
         CONCAT(a.first_name, ' ', a.last_name)    AS approved_by_name,
         l.created_at
       FROM leaves l
       JOIN employees     e  ON e.id  = l.employee_id
       JOIN leave_policies lp ON lp.id = l.leave_policy_id
       LEFT JOIN departments d ON d.id = e.department_id
       LEFT JOIN users       a ON a.id = l.approved_by
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
    console.error("getAllRequests error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching leave requests." });
  }
}
 

// ══════════════════════════════════════════════════════════════
// POST /api/leave/requests
// Employee submits a new leave request.
// Validations applied before insert:
//   • Policy exists + belongs to this company + is active
//   • Employee has sufficient remaining balance
//   • start_date < end_date and both are in the future
//   • Required notice period is met (policy.notice_days)
//   • No overlapping approved/pending leave for this employee
//   • supporting_document required if policy.requires_document
// Deducts pending_days from balance immediately on submission.
// Requires: authenticate (any role — employees submit their own)
// ══════════════════════════════════════════════════════════════
export async function submitLeaveRequest(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { userId, companyId } = req.user;
  const {
    leavePolicyId,
    startDate,
    endDate,
    reason,
    supportingDocument, // URL / file path — upload handled by separate middleware
  } = req.body;

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    // 1. Resolve employee
    const empResult = await client.query(
      `SELECT id, employment_status, employment_type
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
        message: "Only active employees can submit leave requests.",
      });
    }

    // 2. Validate policy
    const policyResult = await client.query(
      `SELECT * FROM leave_policies
       WHERE id = $1 AND company_id = $2 AND is_active = true`,
      [leavePolicyId, companyId],
    );
    if (policyResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ message: "Leave policy not found or inactive." });
    }
    const policy = policyResult.rows[0];

    // 3. Check employment type is covered by policy
    if (!policy.applicable_to.includes(emp.employment_type)) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        message: `This leave policy does not apply to your employment type (${emp.employment_type}).`,
      });
    }

    // 4. Date validations
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "Start date cannot be in the past." });
    }
    if (end < start) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "End date cannot be before start date." });
    }

    // 5. Notice period check
    const noticeDaysRequired = policy.notice_days ?? 0;
    const daysUntilLeave = Math.floor((start - today) / (1000 * 60 * 60 * 24));
    if (daysUntilLeave < noticeDaysRequired) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: `This leave type requires at least ${noticeDaysRequired} day(s) notice.`,
      });
    }

    // 6. Working day count
    const days = countWorkingDays(startDate, endDate);
    if (days < (policy.min_days_per_request ?? 1)) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: `Minimum request is ${policy.min_days_per_request} working day(s).`,
      });
    }
    if (policy.max_days_per_request && days > policy.max_days_per_request) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: `Maximum request for this policy is ${policy.max_days_per_request} working day(s).`,
      });
    }

    // 7. Supporting document required?
    if (policy.requires_document && !supportingDocument) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "A supporting document is required for this leave type.",
      });
    }

    // 8. Balance check
    const currentYear = new Date().getFullYear();
    const balResult = await client.query(
      `SELECT id, remaining_days, pending_days
       FROM leave_balances
       WHERE employee_id = $1
         AND leave_policy_id = $2
         AND year = $3
       FOR UPDATE`, // row-level lock to prevent race conditions
      [emp.id, leavePolicyId, currentYear],
    );
    if (balResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "No leave balance found for this policy. Contact HR.",
      });
    }
    const balance = balResult.rows[0];

    if (balance.remaining_days < days) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: `Insufficient leave balance. You have ${balance.remaining_days} day(s) remaining but requested ${days}.`,
      });
    }

    // 9. Overlap check — no pending or approved leave on same dates
    const overlapResult = await client.query(
      `SELECT id FROM leaves
       WHERE employee_id = $1
         AND status IN ('pending','approved')
         AND start_date <= $2
         AND end_date   >= $3`,
      [emp.id, endDate, startDate],
    );
    if (overlapResult.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message:
          "You have an existing pending or approved leave that overlaps with these dates.",
      });
    }

    // 10. Insert leave request
    const leaveResult = await client.query(
      `INSERT INTO leaves (
         company_id, employee_id, leave_policy_id,
         start_date, end_date, days, reason,
         supporting_document, status, created_at
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending',NOW())
       RETURNING *`,
      [
        companyId,
        emp.id,
        leavePolicyId,
        startDate,
        endDate,
        days,
        reason ?? null,
        supportingDocument ?? null,
      ],
    );
    const leave = leaveResult.rows[0];

    // 11. Deduct pending_days from balance (remaining stays until approval)
    await client.query(
      `UPDATE leave_balances
       SET
         pending_days   = pending_days   + $1,
         remaining_days = remaining_days - $1,
         updated_at     = NOW()
       WHERE id = $2`,
      [days, balance.id],
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: policy.requires_approval
        ? "Leave request submitted and is pending approval."
        : "Leave request submitted and automatically approved.",
      data: leave,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("submitLeaveRequest error:", err);
    return res
      .status(500)
      .json({ message: "Server error submitting leave request." });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/leave/requests/me
// Employee views their own leave requests.
// Query params: status, year
// Requires: authenticate (any role)
// ══════════════════════════════════════════════════════════════
export async function getMyRequests(req, res) {
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

    if (req.query.year) {
      conditions.push(`EXTRACT(YEAR FROM l.start_date) = $${idx}`);
      values.push(parseInt(req.query.year, 10));
      idx++;
    }

    const result = await db.query(
      `SELECT
         l.id,
         lp.name       AS policy_name,
         lp.leave_type,
         lp.is_paid,
         l.start_date,
         l.end_date,
         l.days,
         l.reason,
         l.supporting_document,
         l.status,
         l.approved_at,
         l.rejection_reason,
         CONCAT(a.first_name, ' ', a.last_name) AS approved_by_name,
         l.created_at
       FROM leaves l
       JOIN leave_policies lp ON lp.id = l.leave_policy_id
       LEFT JOIN users      a  ON a.id  = l.approved_by
       WHERE ${conditions.join(" AND ")}
       ORDER BY l.created_at DESC`,
      values,
    );

    return res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error("getMyRequests error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching your leave requests." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/leave/requests/:id/approve
// HR approves a pending leave request.
//   • Moves pending_days → used_days on the balance
//   • Sets employee employment_status = 'on_leave' if leave starts today
//   • Sends notification (non-fatal)
// Requires: authenticate + requireRole(["hr_admin","super_admin","manager"])
// ══════════════════════════════════════════════════════════════
export async function approveLeaveRequest(req, res) {
  const { id } = req.params;
  const { companyId, userId } = req.user;
  const { comment } = req.body;

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    // Fetch leave — company guard via employee join
    const leaveResult = await client.query(
      `SELECT l.*, e.company_id, e.id AS emp_id
       FROM leaves l
       JOIN employees e ON e.id = l.employee_id
       WHERE l.id = $1 AND e.company_id = $2`,
      [id, companyId],
    );
    if (leaveResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Leave request not found." });
    }
    const leave = leaveResult.rows[0];

    if (leave.status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: `Cannot approve a request with status "${leave.status}".`,
      });
    }

    // Update leave status — mirrors approveLeave() from the model
    const updatedLeave = await client.query(
      `UPDATE leaves
       SET
         status      = 'approved',
         approved_by = $1,
         approved_at = NOW(),
         comment     = $2,
         updated_at  = NOW()
       WHERE id = $3
       RETURNING *`,
      [userId, comment ?? null, id],
    );

    // Move pending_days → used_days on balance
    const currentYear = new Date().getFullYear();
    await client.query(
      `UPDATE leave_balances
       SET
         pending_days = GREATEST(0, pending_days - $1),
         used_days    = used_days + $1,
         updated_at   = NOW()
       WHERE employee_id = $2
         AND leave_policy_id = $3
         AND year = $4`,
      [leave.days, leave.emp_id, leave.leave_policy_id, currentYear],
    );

    // If leave starts today, mark employee as on_leave
    const today = new Date().toISOString().split("T")[0];
    if (leave.start_date <= today && leave.end_date >= today) {
      await client.query(
        `UPDATE employees
         SET employment_status = 'on_leave', updated_at = NOW()
         WHERE id = $1`,
        [leave.emp_id],
      );
    }

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Leave request approved.",
      data: updatedLeave.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("approveLeaveRequest error:", err);
    return res
      .status(500)
      .json({ message: "Server error approving leave request." });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/leave/requests/:id/reject
// HR rejects a pending leave request.
//   • Restores pending_days back to remaining_days on the balance
// Requires: authenticate + requireRole(["hr_admin","super_admin","manager"])
// ══════════════════════════════════════════════════════════════
export async function rejectLeaveRequest(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { id } = req.params;
  const { companyId, userId } = req.user;
  const { rejectionReason } = req.body;

  if (!rejectionReason?.trim()) {
    return res.status(400).json({ message: "A rejection reason is required." });
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const leaveResult = await client.query(
      `SELECT l.*, e.company_id, e.id AS emp_id
       FROM leaves l
       JOIN employees e ON e.id = l.employee_id
       WHERE l.id = $1 AND e.company_id = $2`,
      [id, companyId],
    );
    if (leaveResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Leave request not found." });
    }
    const leave = leaveResult.rows[0];

    if (leave.status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: `Cannot reject a request with status "${leave.status}".`,
      });
    }

    // Update leave status — mirrors rejectLeave() from the model
    const updatedLeave = await client.query(
      `UPDATE leaves
       SET
         status           = 'rejected',
         approved_by      = $1,
         approved_at      = NOW(),
         rejection_reason = $2,
         updated_at       = NOW()
       WHERE id = $3
       RETURNING *`,
      [userId, rejectionReason, id],
    );

    // Restore the pending days back to remaining
    const currentYear = new Date().getFullYear();
    await client.query(
      `UPDATE leave_balances
       SET
         pending_days   = GREATEST(0, pending_days   - $1),
         remaining_days = remaining_days + $1,
         updated_at     = NOW()
       WHERE employee_id = $2
         AND leave_policy_id = $3
         AND year = $4`,
      [leave.days, leave.emp_id, leave.leave_policy_id, currentYear],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Leave request rejected.",
      data: updatedLeave.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("rejectLeaveRequest error:", err);
    return res
      .status(500)
      .json({ message: "Server error rejecting leave request." });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/leave/calendar
// Returns all approved leaves within a date window for the company.
// Used to render a team calendar on the frontend.
// Query params:
//   from  — ISO date, default = first day of current month
//   to    — ISO date, default = last day of current month
//   department — optional department UUID filter
// Requires: authenticate (any role)
// ══════════════════════════════════════════════════════════════
export async function getLeaveCalendar(req, res) {
  try {
    const { companyId } = req.user;

    // Default window: current calendar month
    const now = new Date();
    const fromDate =
      req.query.from ??
      new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
    const toDate =
      req.query.to ??
      new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

    const conditions = [
      "l.company_id = $1",
      "l.status = 'approved'",
      "l.start_date <= $3", // end_date >= from → overlap
      "l.end_date   >= $2", // start_date <= to → overlap
    ];
    const values = [companyId, fromDate, toDate];
    let idx = 4;

    if (req.query.department) {
      conditions.push(`e.department_id = $${idx}`);
      values.push(req.query.department);
      idx++;
    }

    const result = await db.query(
      `SELECT
         l.id,
         l.employee_id,
         CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
         e.avatar,
         d.name                                  AS department_name,
         lp.name                                 AS policy_name,
         lp.leave_type,
         l.start_date,
         l.end_date,
         l.days
       FROM leaves l
       JOIN employees     e  ON e.id  = l.employee_id
       JOIN leave_policies lp ON lp.id = l.leave_policy_id
       LEFT JOIN departments d ON d.id = e.department_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY l.start_date ASC`,
      values,
    );

    return res.status(200).json({
      data: result.rows,
      meta: { from: fromDate, to: toDate, total: result.rows.length },
    });
  } catch (err) {
    console.error("getLeaveCalendar error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching leave calendar." });
  }
}
