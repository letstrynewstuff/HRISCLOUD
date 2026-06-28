// src/utils/timesheet.helpers.js
//
// Shared utility functions used by both the employee and admin controllers.

import { db } from "../config/db.js";

// ─── Duration ────────────────────────────────────────────────────────────────

/**
 * Calculate duration in whole minutes between two "HH:MM" or "HH:MM:SS" strings.
 * Returns null if endTime <= startTime.
 */
export function calcDurationMinutes(startTime, endTime) {
  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const diff = toMinutes(endTime) - toMinutes(startTime);
  return diff > 0 ? diff : null;
}

// ─── Overlap detection ────────────────────────────────────────────────────────

/**
 * Check whether a proposed [startTime, endTime] overlaps any existing entry
 * for the same employee on the same date.
 *
 * Excludes `excludeId` so UPDATE can compare against all *other* rows.
 *
 * Two ranges [A, B] and [C, D] overlap when A < D AND C < B.
 */
export async function hasOverlappingEntry(
  client,
  { companyId, employeeId, entryDate, startTime, endTime, excludeId = null },
) {
  const params = [companyId, employeeId, entryDate, startTime, endTime];
  let excludeClause = "";
  if (excludeId) {
    excludeClause = `AND id <> $${params.length + 1}`;
    params.push(excludeId);
  }

  const result = await client.query(
    `SELECT id
     FROM   timesheet_entries
     WHERE  company_id  = $1
       AND  employee_id = $2
       AND  entry_date  = $3
       AND  start_time  < $5::time   -- existing starts before new ends
       AND  end_time    > $4::time   -- existing ends   after  new starts
       ${excludeClause}
     LIMIT 1`,
    params,
  );

  return result.rows.length > 0;
}

// ─── Audit trail ─────────────────────────────────────────────────────────────

/**
 * Write one row to the audit_logs table.
 *
 * @param {import('pg').PoolClient} client  — transactional client (or db for non-tx)
 * @param {object} opts
 * @param {number}  opts.companyId
 * @param {number}  opts.userId        — who performed the action
 * @param {string}  opts.module        — always "TimesheetEntry"
 * @param {string}  opts.action        — CREATE | UPDATE | DELETE | SUBMIT | APPROVE | REJECT
 * @param {number}  opts.recordId      — timesheet_entries.id
 * @param {any}     [opts.previousValue]
 * @param {any}     [opts.newValue]
 */

export async function logAudit(client, opts) {
  const {
    companyId,
    userId,
    module = "TimesheetEntry",
    action,
    recordId,
    previousValue = null,
    newValue = null,
  } = opts;

  await client.query(
    `INSERT INTO timesheet_audit_logs
       (company_id, performed_by, action, module, record_id, previous_value, new_value, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
    [
      companyId,
      userId,
      action,
      module,
      recordId,
      previousValue !== null ? JSON.stringify(previousValue) : null,
      newValue !== null ? JSON.stringify(newValue) : null,
    ],
  );
}
/**
 * Returns { startDate, endDate } for the current ISO week (Mon–Sun).
 * Used as the default date range when no range is supplied.
 */
export function currentWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 1 = Mon …
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    startDate: monday.toISOString().slice(0, 10),
    endDate: sunday.toISOString().slice(0, 10),
  };
}

/**
 * Returns { startDate, endDate } for the current calendar month.
 */
export function currentMonthRange() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
  return {
    startDate: `${y}-${m}-01`,
    endDate: `${y}-${m}-${lastDay}`,
  };
}

// ─── Employee ID lookup ───────────────────────────────────────────────────────

/**
 * Resolve the employees.id for the authenticated user.
 * Throws a structured error object if no employee record found.
 */
export async function resolveEmployeeId(userId, companyId) {
  const result = await db.query(
    `SELECT id FROM employees WHERE user_id = $1 AND company_id = $2 LIMIT 1`,
    [userId, companyId],
  );
  if (!result.rows[0]) {
    const err = new Error("Employee record not found for this user.");
    err.status = 404;
    throw err;
  }
  return result.rows[0].id;
}
