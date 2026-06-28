// src/controllers/timesheet.employee.controller.js
//
// Endpoints (all require authenticate middleware — see routes file):
//   POST   /timesheets/entries              → createEntry
//   PUT    /timesheets/entries/:id          → updateEntry
//   DELETE /timesheets/entries/:id          → deleteEntry
//   POST   /timesheets/entries/submit       → submitEntries
//   GET    /timesheets/entries/my           → getMyEntries
//   GET    /timesheets/entries/my/summary   → getMySummary
//   GET    /timesheets/entries/:id          → getEntry

import { db } from "../config/db.js";
import {
  calcDurationMinutes,
  hasOverlappingEntry,
  logAudit,
  currentWeekRange,
  resolveEmployeeId,
} from "../utils/timesheet.helpers.js";

// ──────────────────────────────────────────────────────────────
// POST /timesheets/entries
// ──────────────────────────────────────────────────────────────
export async function createEntry(req, res) {
  const { userId, companyId } = req.user;
  const { entryDate, startTime, endTime, description, projectTag } = req.body;

  // ── Basic field validation ──────────────────────────────────
  if (!entryDate || !startTime || !endTime || !description) {
    return res.status(400).json({
      message: "entryDate, startTime, endTime, and description are required.",
    });
  }

  if (!description.trim() || description.trim().length < 3) {
    return res.status(400).json({
      message: "Description must be at least 3 characters.",
    });
  }

  const durationMinutes = calcDurationMinutes(startTime, endTime);
  if (durationMinutes === null) {
    return res
      .status(400)
      .json({ message: "End time must be after start time." });
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    // Resolve employee record
    const empResult = await client.query(
      `SELECT id FROM employees WHERE user_id = $1 AND company_id = $2 LIMIT 1`,
      [userId, companyId],
    );
    if (!empResult.rows[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Employee record not found." });
    }
    const employeeId = empResult.rows[0].id;

    // ── Overlap check ───────────────────────────────────────────
    const overlaps = await hasOverlappingEntry(client, {
      companyId,
      employeeId,
      entryDate,
      startTime,
      endTime,
    });
    if (overlaps) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: "You already have an entry for this time period.",
      });
    }

    // ── Insert ──────────────────────────────────────────────────
    const insertResult = await client.query(
      `INSERT INTO timesheet_entries
         (company_id, employee_id, entry_date, start_time, end_time,
          duration_minutes, description, project_tag, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4::time, $5::time, $6, $7, $8, 'Draft', NOW(), NOW())
       RETURNING *`,
      [
        companyId,
        employeeId,
        entryDate,
        startTime,
        endTime,
        durationMinutes,
        description.trim(),
        projectTag?.trim() || null,
      ],
    );
    const entry = insertResult.rows[0];

    // ── Audit ───────────────────────────────────────────────────
    await logAudit(client, {
      companyId,
      userId,
      action: "CREATE",
      recordId: entry.id,
      newValue: { status: "Draft", entryDate, startTime, endTime },
    });

    await client.query("COMMIT");
    return res
      .status(201)
      .json({ message: "Entry created.", entry: formatEntry(entry) });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("createEntry error:", err);
    return res.status(500).json({ message: "Server error creating entry." });
  } finally {
    client.release();
  }
}

// ──────────────────────────────────────────────────────────────
// PUT /timesheets/entries/:id
// ──────────────────────────────────────────────────────────────
export async function updateEntry(req, res) {
  const { userId, companyId } = req.user;
  const entryId = Number(req.params.id);
  const { entryDate, startTime, endTime, description, projectTag } = req.body;

  if (!entryDate || !startTime || !endTime || !description) {
    return res.status(400).json({
      message: "entryDate, startTime, endTime, and description are required.",
    });
  }

  if (!description.trim() || description.trim().length < 3) {
    return res.status(400).json({
      message: "Description must be at least 3 characters.",
    });
  }

  const durationMinutes = calcDurationMinutes(startTime, endTime);
  if (durationMinutes === null) {
    return res
      .status(400)
      .json({ message: "End time must be after start time." });
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    // ── Fetch & ownership check ─────────────────────────────────
    const existing = await client.query(
      `SELECT te.*, e.user_id
       FROM   timesheet_entries te
       JOIN   employees e ON e.id = te.employee_id
       WHERE  te.id = $1 AND te.company_id = $2`,
      [entryId, companyId],
    );

    if (!existing.rows[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Entry not found." });
    }

    const row = existing.rows[0];

    if (row.user_id !== userId) {
      await client.query("ROLLBACK");
      return res
        .status(403)
        .json({ message: "You can only edit your own entries." });
    }

    if (row.status === "Submitted" || row.status === "Approved") {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: `Cannot edit an entry with status '${row.status}'.`,
      });
    }

    // ── Overlap check (exclude current entry) ───────────────────
    const overlaps = await hasOverlappingEntry(client, {
      companyId,
      employeeId: row.employee_id,
      entryDate,
      startTime,
      endTime,
      excludeId: entryId,
    });
    if (overlaps) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: "You already have an entry for this time period.",
      });
    }

    // ── Update — if previously Rejected, reset to Draft ─────────
    const newStatus = row.status === "Rejected" ? "Draft" : row.status;

    const updateResult = await client.query(
      `UPDATE timesheet_entries
       SET entry_date       = $1,
           start_time       = $2::time,
           end_time         = $3::time,
           duration_minutes = $4,
           description      = $5,
           project_tag      = $6,
           status           = $7,
           rejection_reason = CASE WHEN $7 = 'Draft' THEN NULL ELSE rejection_reason END,
           updated_at       = NOW()
       WHERE id = $8 AND company_id = $9
       RETURNING *`,
      [
        entryDate,
        startTime,
        endTime,
        durationMinutes,
        description.trim(),
        projectTag?.trim() || null,
        newStatus,
        entryId,
        companyId,
      ],
    );

    const updated = updateResult.rows[0];

    await logAudit(client, {
      companyId,
      userId,
      action: "UPDATE",
      recordId: entryId,
      previousValue: {
        status: row.status,
        entryDate: row.entry_date,
        startTime: row.start_time,
        endTime: row.end_time,
      },
      newValue: {
        status: newStatus,
        entryDate,
        startTime,
        endTime,
      },
    });

    await client.query("COMMIT");
    return res
      .status(200)
      .json({ message: "Entry updated.", entry: formatEntry(updated) });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("updateEntry error:", err);
    return res.status(500).json({ message: "Server error updating entry." });
  } finally {
    client.release();
  }
}

// ──────────────────────────────────────────────────────────────
// DELETE /timesheets/entries/:id
// ──────────────────────────────────────────────────────────────
export async function deleteEntry(req, res) {
  const { userId, companyId } = req.user;
  const entryId = Number(req.params.id);

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT te.*, e.user_id
       FROM   timesheet_entries te
       JOIN   employees e ON e.id = te.employee_id
       WHERE  te.id = $1 AND te.company_id = $2`,
      [entryId, companyId],
    );

    if (!existing.rows[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Entry not found." });
    }

    const row = existing.rows[0];

    if (row.user_id !== userId) {
      await client.query("ROLLBACK");
      return res
        .status(403)
        .json({ message: "You can only delete your own entries." });
    }

    if (row.status !== "Draft") {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: `Cannot delete an entry with status '${row.status}'. Only Draft entries can be deleted.`,
      });
    }

    await client.query(
      `DELETE FROM timesheet_entries WHERE id = $1 AND company_id = $2`,
      [entryId, companyId],
    );

    await logAudit(client, {
      companyId,
      userId,
      action: "DELETE",
      recordId: entryId,
      previousValue: {
        status: row.status,
        entryDate: row.entry_date,
        startTime: row.start_time,
        endTime: row.end_time,
      },
    });

    await client.query("COMMIT");
    return res.status(200).json({ message: "Entry deleted." });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("deleteEntry error:", err);
    return res.status(500).json({ message: "Server error deleting entry." });
  } finally {
    client.release();
  }
}

// ──────────────────────────────────────────────────────────────
// POST /timesheets/entries/submit
// Body: { entryIds: [1,2,3] }  OR  { startDate, endDate }
// ──────────────────────────────────────────────────────────────
export async function submitEntries(req, res) {
  const { userId, companyId } = req.user;
  const { entryIds, startDate, endDate } = req.body;

  // Must supply either entryIds array OR a date range
  const byIds = Array.isArray(entryIds) && entryIds.length > 0;
  const byRange = startDate && endDate;

  if (!byIds && !byRange) {
    return res.status(400).json({
      message: "Provide either entryIds (array) or startDate + endDate.",
    });
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    // Resolve employee
    const empResult = await client.query(
      `SELECT id FROM employees WHERE user_id = $1 AND company_id = $2 LIMIT 1`,
      [userId, companyId],
    );
    if (!empResult.rows[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Employee record not found." });
    }
    const employeeId = empResult.rows[0].id;

    // Fetch candidate entries (always scoped to this employee)
    let fetchQuery;
    let fetchParams;

    if (byIds) {
      fetchQuery = `
        SELECT id, status FROM timesheet_entries
       WHERE  id = ANY($1::uuid[])
          AND  company_id  = $2
          AND  employee_id = $3`;
      fetchParams = [entryIds, companyId, employeeId];
    } else {
      fetchQuery = `
        SELECT id, status FROM timesheet_entries
        WHERE  company_id  = $1
          AND  employee_id = $2
          AND  entry_date BETWEEN $3 AND $4
          AND  status = 'Draft'`;
      fetchParams = [companyId, employeeId, startDate, endDate];
    }

    const candidates = await client.query(fetchQuery, fetchParams);

    if (candidates.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ message: "No eligible Draft entries found." });
    }

    const submitted = [];
    const skipped = [];

    for (const row of candidates.rows) {
      if (row.status !== "Draft") {
        skipped.push({
          id: row.id,
          reason: `Status is '${row.status}', not Draft.`,
        });
        continue;
      }

      await client.query(
        `UPDATE timesheet_entries
         SET status = 'Submitted', submitted_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [row.id],
      );

      await logAudit(client, {
        companyId,
        userId,
        action: "SUBMIT",
        recordId: row.id,
        previousValue: { status: "Draft" },
        newValue: { status: "Submitted" },
      });

      submitted.push(row.id);
    }

    await client.query("COMMIT");

    // ── Notification hook ────────────────────────────────────────
    // TODO: notificationService.notifyHRAdmins(companyId, { submittedCount: submitted.length, employeeId })

    return res.status(200).json({
      message: `${submitted.length} entry/entries submitted for approval.`,
      submitted,
      skipped,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("submitEntries error:", err);
    return res
      .status(500)
      .json({ message: "Server error submitting entries." });
  } finally {
    client.release();
  }
}

// ──────────────────────────────────────────────────────────────
// GET /timesheets/entries/my
// Query: startDate, endDate, status
// Default: current week
// ──────────────────────────────────────────────────────────────
export async function getMyEntries(req, res) {
  const { userId, companyId } = req.user;

  const week = currentWeekRange();
  const startDate = req.query.startDate || week.startDate;
  const endDate = req.query.endDate || week.endDate;
  const status = req.query.status || null;

  try {
    const employeeId = await resolveEmployeeId(userId, companyId);

    const params = [companyId, employeeId, startDate, endDate];
    let statusClause = "";
    if (status) {
      statusClause = `AND status = $${params.length + 1}`;
      params.push(status);
    }

    const result = await db.query(
      `SELECT *
       FROM   timesheet_entries
       WHERE  company_id  = $1
         AND  employee_id = $2
         AND  entry_date BETWEEN $3 AND $4
         ${statusClause}
       ORDER BY entry_date DESC, start_time ASC`,
      params,
    );

    return res.status(200).json({
      entries: result.rows.map(formatEntry),
      meta: { startDate, endDate, total: result.rows.length },
    });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    console.error("getMyEntries error:", err);
    return res.status(500).json({ message: "Server error fetching entries." });
  }
}

// ──────────────────────────────────────────────────────────────
// GET /timesheets/entries/my/summary
// Query: startDate, endDate  (default: current week)
// ──────────────────────────────────────────────────────────────
export async function getMySummary(req, res) {
  const { userId, companyId } = req.user;

  const week = currentWeekRange();
  const startDate = req.query.startDate || week.startDate;
  const endDate = req.query.endDate || week.endDate;

  try {
    const employeeId = await resolveEmployeeId(userId, companyId);

    // Total minutes + counts by status
    const totalsResult = await db.query(
      `SELECT
         COALESCE(SUM(duration_minutes), 0)            AS total_minutes,
         COUNT(*)                                       AS total_entries,
         COUNT(*) FILTER (WHERE status = 'Draft')      AS draft_count,
         COUNT(*) FILTER (WHERE status = 'Submitted')  AS submitted_count,
         COUNT(*) FILTER (WHERE status = 'Approved')   AS approved_count,
         COUNT(*) FILTER (WHERE status = 'Rejected')   AS rejected_count
       FROM timesheet_entries
       WHERE company_id  = $1
         AND employee_id = $2
         AND entry_date BETWEEN $3 AND $4`,
      [companyId, employeeId, startDate, endDate],
    );

    // Daily breakdown
    const dailyResult = await db.query(
      `SELECT
         entry_date                        AS date,
         SUM(duration_minutes)             AS total_minutes,
         COUNT(*)                          AS entry_count
       FROM   timesheet_entries
       WHERE  company_id  = $1
         AND  employee_id = $2
         AND  entry_date BETWEEN $3 AND $4
       GROUP BY entry_date
       ORDER BY entry_date`,
      [companyId, employeeId, startDate, endDate],
    );

    const t = totalsResult.rows[0];

    return res.status(200).json({
      period: { startDate, endDate },
      totalMinutes: Number(t.total_minutes),
      totalHours: +(Number(t.total_minutes) / 60).toFixed(2),
      totalEntries: Number(t.total_entries),
      byStatus: {
        Draft: Number(t.draft_count),
        Submitted: Number(t.submitted_count),
        Approved: Number(t.approved_count),
        Rejected: Number(t.rejected_count),
      },
      dailyBreakdown: dailyResult.rows.map((r) => ({
        date: r.date,
        totalMinutes: Number(r.total_minutes),
        entryCount: Number(r.entry_count),
      })),
    });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    console.error("getMySummary error:", err);
    return res.status(500).json({ message: "Server error fetching summary." });
  }
}

// ──────────────────────────────────────────────────────────────
// GET /timesheets/entries/:id
// ──────────────────────────────────────────────────────────────
export async function getEntry(req, res) {
  const { userId, companyId } = req.user;
  const entryId = Number(req.params.id);

  try {
    const result = await db.query(
      `SELECT te.*, e.user_id
       FROM   timesheet_entries te
       JOIN   employees e ON e.id = te.employee_id
       WHERE  te.id = $1 AND te.company_id = $2`,
      [entryId, companyId],
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Entry not found." });
    }

    const row = result.rows[0];

    if (row.user_id !== userId) {
      return res
        .status(403)
        .json({ message: "You can only view your own entries." });
    }

    return res.status(200).json({ entry: formatEntry(row) });
  } catch (err) {
    console.error("getEntry error:", err);
    return res.status(500).json({ message: "Server error fetching entry." });
  }
}

// ─── Response shaper ─────────────────────────────────────────
function formatEntry(row) {
  return {
    id: row.id,
    companyId: row.company_id,
    employeeId: row.employee_id,
    entryDate: row.entry_date,
    startTime: row.start_time,
    endTime: row.end_time,
    durationMinutes: row.duration_minutes,
    description: row.description,
    projectTag: row.project_tag,
    status: row.status,
    submittedAt: row.submitted_at,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
