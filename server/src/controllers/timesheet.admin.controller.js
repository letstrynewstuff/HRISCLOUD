


// src/controllers/timesheet.admin.controller.js
//
// Endpoints (all require authenticate + requireRole(['hr_admin','super_admin'])):
//   GET  /timesheets/admin/entries                        → getAllEntries
//   GET  /timesheets/admin/pending                        → getPendingApprovals
//   GET  /timesheets/admin/entries/:id                    → getAdminEntry
//   POST /timesheets/admin/entries/:id/approve            → approveEntry
//   POST /timesheets/admin/entries/approve-bulk           → approveBulk
//   POST /timesheets/admin/entries/:id/reject             → rejectEntry
//   GET  /timesheets/admin/summary                        → getCompanySummary
//   GET  /timesheets/admin/employees/:employeeId/entries  → getEmployeeHistory
//   GET  /timesheets/admin/export                         → exportCSV

import { db } from "../config/db.js";
import { logAudit, currentWeekRange } from "../utils/timesheet.helpers.js";

// ──────────────────────────────────────────────────────────────
// GET /timesheets/admin/entries
// Query: startDate, endDate, employeeId, departmentId, status, search, page, limit
// ──────────────────────────────────────────────────────────────
export async function getAllEntries(req, res) {
  const { companyId } = req.user;

  const {
    startDate,
    endDate,
    employeeId,
    departmentId,
    status,
    search,
    page  = 1,
    limit = 50,
  } = req.query;

  const offset = (Number(page) - 1) * Number(limit);
  const params  = [companyId];
  const filters = [];

  if (startDate)    { params.push(startDate);    filters.push(`te.entry_date >= $${params.length}`); }
  if (endDate)      { params.push(endDate);       filters.push(`te.entry_date <= $${params.length}`); }
  if (employeeId)   { params.push(employeeId);    filters.push(`te.employee_id = $${params.length}`); }
  if (departmentId) { params.push(departmentId);  filters.push(`e.department_id = $${params.length}`); }
  if (status)       { params.push(status);        filters.push(`te.status = $${params.length}`); }
  if (search)       { params.push(`%${search}%`); filters.push(`te.description ILIKE $${params.length}`); }

  const whereClause = filters.length ? `AND ${filters.join(" AND ")}` : "";

  try {
    // Count query
    const countParams = [...params];
    const countResult = await db.query(
      `SELECT COUNT(*) AS total
       FROM   timesheet_entries te
       JOIN   employees e ON e.id = te.employee_id
       WHERE  te.company_id = $1 ${whereClause}`,
      countParams,
    );

    // Data query — join users to get approved_by_name
    params.push(Number(limit), offset);
    const result = await db.query(
      `SELECT
         te.*,
         e.first_name  || ' ' || e.last_name  AS employee_name,
         e.employee_code,
         d.name                                AS department,
         jr.title                              AS job_title,
         u.first_name  || ' ' || u.last_name  AS approved_by_name
       FROM   timesheet_entries te
       JOIN   employees   e  ON e.id  = te.employee_id
       LEFT JOIN departments  d  ON d.id  = e.department_id
       LEFT JOIN job_roles    jr ON jr.id = e.job_role_id
       LEFT JOIN users        u  ON u.id  = te.approved_by
       WHERE  te.company_id = $1 ${whereClause}
       ORDER BY te.entry_date DESC, employee_name ASC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );

    return res.status(200).json({
      entries: result.rows.map(formatAdminEntry),
      meta: {
        total:      Number(countResult.rows[0].total),
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(Number(countResult.rows[0].total) / Number(limit)),
      },
    });
  } catch (err) {
    console.error("getAllEntries error:", err);
    return res.status(500).json({ message: "Server error fetching entries." });
  }
}

// ──────────────────────────────────────────────────────────────
// GET /timesheets/admin/pending
// Returns Submitted entries grouped by employee
// ──────────────────────────────────────────────────────────────
export async function getPendingApprovals(req, res) {
  const { companyId } = req.user;

  try {
    const summaryResult = await db.query(
      `SELECT
         e.id                                AS employee_id,
         e.first_name || ' ' || e.last_name AS employee_name,
         e.employee_code,
         d.name                              AS department,
         COUNT(te.id)                        AS pending_entries,
         SUM(te.duration_minutes)            AS pending_minutes
       FROM   timesheet_entries te
       JOIN   employees   e ON e.id = te.employee_id
       LEFT JOIN departments d ON d.id = e.department_id
       WHERE  te.company_id = $1
         AND  te.status = 'Submitted'
       GROUP BY e.id, e.first_name, e.last_name, e.employee_code, d.name
       ORDER BY employee_name`,
      [companyId],
    );

    const entriesResult = await db.query(
      `SELECT
         te.*,
         e.first_name || ' ' || e.last_name AS employee_name,
         d.name                              AS department
       FROM   timesheet_entries te
       JOIN   employees   e ON e.id = te.employee_id
       LEFT JOIN departments d ON d.id = e.department_id
       WHERE  te.company_id = $1
         AND  te.status = 'Submitted'
       ORDER BY e.first_name, e.last_name, te.entry_date DESC`,
      [companyId],
    );

    const byEmployee = {};
    for (const row of entriesResult.rows) {
      const empId = row.employee_id;
      if (!byEmployee[empId]) byEmployee[empId] = [];
      byEmployee[empId].push(formatAdminEntry(row));
    }

    return res.status(200).json({
      employees: summaryResult.rows.map((s) => ({
        employeeId:     s.employee_id,
        employeeName:   s.employee_name,
        employeeCode:   s.employee_code,
        department:     s.department,
        pendingEntries: Number(s.pending_entries),
        pendingMinutes: Number(s.pending_minutes),
        pendingHours:   +(Number(s.pending_minutes) / 60).toFixed(2),
        entries:        byEmployee[s.employee_id] || [],
      })),
      totalPending: entriesResult.rows.length,
    });
  } catch (err) {
    console.error("getPendingApprovals error:", err);
    return res.status(500).json({ message: "Server error fetching pending approvals." });
  }
}

// ──────────────────────────────────────────────────────────────
// GET /timesheets/admin/entries/:id
// ──────────────────────────────────────────────────────────────
export async function getAdminEntry(req, res) {
  const { companyId } = req.user;
  const entryId = req.params.id;

  try {
    const result = await db.query(
      `SELECT
         te.*,
         e.first_name  || ' ' || e.last_name AS employee_name,
         e.employee_code,
         d.name                               AS department,
         jr.title                             AS job_title,
         u.first_name  || ' ' || u.last_name AS approved_by_name
       FROM   timesheet_entries te
       JOIN   employees   e  ON e.id  = te.employee_id
       LEFT JOIN departments  d  ON d.id  = e.department_id
       LEFT JOIN job_roles    jr ON jr.id = e.job_role_id
       LEFT JOIN users        u  ON u.id  = te.approved_by
       WHERE  te.id = $1 AND te.company_id = $2`,
      [entryId, companyId],
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "Entry not found." });
    }

    return res.status(200).json({ entry: formatAdminEntry(result.rows[0]) });
  } catch (err) {
    console.error("getAdminEntry error:", err);
    return res.status(500).json({ message: "Server error fetching entry." });
  }
}

// ──────────────────────────────────────────────────────────────
// POST /timesheets/admin/entries/:id/approve
// ──────────────────────────────────────────────────────────────
export async function approveEntry(req, res) {
  const { userId, companyId } = req.user;
  const entryId = req.params.id;

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT id, status, employee_id
       FROM timesheet_entries
       WHERE id = $1 AND company_id = $2`,
      [entryId, companyId],
    );

    if (!existing.rows[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Entry not found." });
    }

    if (existing.rows[0].status !== "Submitted") {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: `Cannot approve an entry with status '${existing.rows[0].status}'. Only Submitted entries can be approved.`,
      });
    }

    await client.query(
      `UPDATE timesheet_entries
       SET status      = 'Approved',
           approved_by = $1,
           approved_at = NOW(),
           updated_at  = NOW()
       WHERE id = $2 AND company_id = $3`,
      [userId, entryId, companyId],
    );

    // Fetch updated entry with approver name joined
    const updated = await client.query(
      `SELECT
         te.*,
         e.first_name  || ' ' || e.last_name AS employee_name,
         e.employee_code,
         d.name                               AS department,
         jr.title                             AS job_title,
         u.first_name  || ' ' || u.last_name AS approved_by_name
       FROM   timesheet_entries te
       JOIN   employees   e  ON e.id  = te.employee_id
       LEFT JOIN departments  d  ON d.id  = e.department_id
       LEFT JOIN job_roles    jr ON jr.id = e.job_role_id
       LEFT JOIN users        u  ON u.id  = te.approved_by
       WHERE  te.id = $1`,
      [entryId],
    );

    await logAudit(client, {
      companyId,
      userId,
      action:        "APPROVE",
      recordId:      entryId,
      previousValue: { status: "Submitted" },
      newValue:      { status: "Approved", approvedBy: userId },
    });

    await client.query("COMMIT");
    return res.status(200).json({
      message: "Entry approved.",
      entry:   formatAdminEntry(updated.rows[0]),
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("approveEntry error:", err);
    return res.status(500).json({ message: "Server error approving entry." });
  } finally {
    client.release();
  }
}

// ──────────────────────────────────────────────────────────────
// POST /timesheets/admin/entries/approve-bulk
// Body: { entryIds: [...] }
// ──────────────────────────────────────────────────────────────
export async function approveBulk(req, res) {
  const { userId, companyId } = req.user;
  const { entryIds } = req.body;

  if (!Array.isArray(entryIds) || entryIds.length === 0) {
    return res.status(400).json({ message: "entryIds must be a non-empty array." });
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const candidates = await client.query(
      `SELECT id, status FROM timesheet_entries
       WHERE id = ANY($1::uuid[]) AND company_id = $2`,
      [entryIds, companyId],
    );

    const approved = [];
    const skipped  = [];

    for (const row of candidates.rows) {
      if (row.status !== "Submitted") {
        skipped.push({ id: row.id, reason: `Status is '${row.status}', expected Submitted.` });
        continue;
      }

      await client.query(
        `UPDATE timesheet_entries
         SET status      = 'Approved',
             approved_by = $1,
             approved_at = NOW(),
             updated_at  = NOW()
         WHERE id = $2`,
        [userId, row.id],
      );

      await logAudit(client, {
        companyId,
        userId,
        action:        "APPROVE",
        recordId:      row.id,
        previousValue: { status: "Submitted" },
        newValue:      { status: "Approved", approvedBy: userId },
      });

      approved.push(row.id);
    }

    const foundIds = candidates.rows.map((r) => r.id);
    for (const id of entryIds) {
      if (!foundIds.includes(id)) {
        skipped.push({ id, reason: "Entry not found in this company." });
      }
    }

    await client.query("COMMIT");
    return res.status(200).json({
      message: `${approved.length} entry/entries approved.`,
      approved,
      skipped,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("approveBulk error:", err);
    return res.status(500).json({ message: "Server error during bulk approval." });
  } finally {
    client.release();
  }
}

// ──────────────────────────────────────────────────────────────
// POST /timesheets/admin/entries/:id/reject
// Body: { rejectionReason }
// ──────────────────────────────────────────────────────────────
export async function rejectEntry(req, res) {
  const { userId, companyId } = req.user;
  const entryId = req.params.id;
  const { rejectionReason } = req.body;

  if (!rejectionReason?.trim()) {
    return res.status(400).json({ message: "rejectionReason is required." });
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT id, status, employee_id
       FROM timesheet_entries
       WHERE id = $1 AND company_id = $2`,
      [entryId, companyId],
    );

    if (!existing.rows[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Entry not found." });
    }

    if (existing.rows[0].status !== "Submitted") {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: `Cannot reject an entry with status '${existing.rows[0].status}'. Only Submitted entries can be rejected.`,
      });
    }

    await client.query(
      `UPDATE timesheet_entries
       SET status           = 'Rejected',
           rejection_reason = $1,
           updated_at       = NOW()
       WHERE id = $2 AND company_id = $3`,
      [rejectionReason.trim(), entryId, companyId],
    );

    // Fetch updated entry with rejector name for the response
    const updated = await client.query(
      `SELECT
         te.*,
         e.first_name  || ' ' || e.last_name  AS employee_name,
         e.employee_code,
         d.name                                AS department,
         jr.title                              AS job_title,
         ru.first_name || ' ' || ru.last_name AS rejected_by_name
       FROM   timesheet_entries te
       JOIN   employees   e  ON e.id  = te.employee_id
       LEFT JOIN departments  d  ON d.id  = e.department_id
       LEFT JOIN job_roles    jr ON jr.id = e.job_role_id
       LEFT JOIN users        ru ON ru.id = $2
       WHERE  te.id = $1`,
      [entryId, userId],
    );

    await logAudit(client, {
      companyId,
      userId,
      action:        "REJECT",
      recordId:      entryId,
      previousValue: { status: "Submitted" },
      newValue:      { status: "Rejected", rejectionReason: rejectionReason.trim(), rejectedBy: userId },
    });

    await client.query("COMMIT");

    // TODO: notificationService.notifyEmployee(existing.rows[0].employee_id, { entryId, rejectionReason })

    const row = updated.rows[0];
    return res.status(200).json({
      message: "Entry rejected.",
      entry: {
        ...formatAdminEntry(row),
        rejectedByName: row.rejected_by_name ?? null,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("rejectEntry error:", err);
    return res.status(500).json({ message: "Server error rejecting entry." });
  } finally {
    client.release();
  }
}

// ──────────────────────────────────────────────────────────────
// GET /timesheets/admin/summary
// Query: startDate, endDate  (default: current week)
// ──────────────────────────────────────────────────────────────
export async function getCompanySummary(req, res) {
  const { companyId } = req.user;

  const week      = currentWeekRange();
  const startDate = req.query.startDate || week.startDate;
  const endDate   = req.query.endDate   || week.endDate;

  try {
    // Company-wide totals — minutes AND entry counts by status
    const totalsResult = await db.query(
      `SELECT
         COALESCE(SUM(duration_minutes), 0)                                  AS total_minutes,
         COALESCE(SUM(duration_minutes) FILTER (WHERE status = 'Draft'),     0) AS draft_minutes,
         COALESCE(SUM(duration_minutes) FILTER (WHERE status = 'Submitted'), 0) AS submitted_minutes,
         COALESCE(SUM(duration_minutes) FILTER (WHERE status = 'Approved'),  0) AS approved_minutes,
         COALESCE(SUM(duration_minutes) FILTER (WHERE status = 'Rejected'),  0) AS rejected_minutes,
         COUNT(*)                                                             AS total_entries,
         COUNT(*) FILTER (WHERE status = 'Draft')                            AS draft_count,
         COUNT(*) FILTER (WHERE status = 'Submitted')                        AS submitted_count,
         COUNT(*) FILTER (WHERE status = 'Approved')                         AS approved_count,
         COUNT(*) FILTER (WHERE status = 'Rejected')                         AS rejected_count
       FROM timesheet_entries
       WHERE company_id = $1
         AND entry_date BETWEEN $2 AND $3`,
      [companyId, startDate, endDate],
    );

    // Per-department breakdown
    const deptResult = await db.query(
      `SELECT
         d.id                           AS department_id,
         d.name                         AS department,
         SUM(te.duration_minutes)       AS total_minutes,
         COUNT(DISTINCT te.employee_id) AS employee_count,
         COUNT(te.id)                   AS entry_count
       FROM   timesheet_entries te
       JOIN   employees   e ON e.id = te.employee_id
       LEFT JOIN departments d ON d.id = e.department_id
       WHERE  te.company_id = $1
         AND  te.entry_date BETWEEN $2 AND $3
       GROUP BY d.id, d.name
       ORDER BY d.name`,
      [companyId, startDate, endDate],
    );

    // Per-employee breakdown
    const empResult = await db.query(
      `SELECT
         e.id                                           AS employee_id,
         e.first_name || ' ' || e.last_name            AS employee_name,
         e.employee_code,
         COUNT(te.id)                                   AS entry_count,
         COALESCE(SUM(te.duration_minutes), 0)          AS total_minutes,
         COUNT(*) FILTER (WHERE te.status = 'Approved') AS approved_count
       FROM   employees e
       LEFT JOIN timesheet_entries te
         ON   te.employee_id = e.id
          AND te.company_id  = $1
          AND te.entry_date BETWEEN $2 AND $3
       WHERE  e.company_id = $1
         AND  e.employment_status NOT IN ('terminated', 'resigned')
       GROUP BY e.id, e.first_name, e.last_name, e.employee_code
       ORDER BY employee_name`,
      [companyId, startDate, endDate],
    );

    const zeroEntryEmployees = empResult.rows
      .filter((r) => Number(r.entry_count) === 0)
      .map((r) => ({
        employeeId:   r.employee_id,
        employeeName: r.employee_name,
        employeeCode: r.employee_code,
      }));

    const t = totalsResult.rows[0];

    return res.status(200).json({
      period: { startDate, endDate },
      totals: {
        minutes:        Number(t.total_minutes),
        hours:          +(Number(t.total_minutes) / 60).toFixed(2),
        totalEntries:   Number(t.total_entries),
        // Entry counts per status
        byStatusCount: {
          Draft:     Number(t.draft_count),
          Submitted: Number(t.submitted_count),
          Approved:  Number(t.approved_count),
          Rejected:  Number(t.rejected_count),
        },
        // Minutes per status (for hour breakdowns)
        byStatusMinutes: {
          Draft:     Number(t.draft_minutes),
          Submitted: Number(t.submitted_minutes),
          Approved:  Number(t.approved_minutes),
          Rejected:  Number(t.rejected_minutes),
        },
      },
      byDepartment: deptResult.rows.map((r) => ({
        departmentId:  r.department_id,
        department:    r.department,
        totalMinutes:  Number(r.total_minutes),
        totalHours:    +(Number(r.total_minutes) / 60).toFixed(2),
        employeeCount: Number(r.employee_count),
        entryCount:    Number(r.entry_count),
      })),
      byEmployee: empResult.rows.map((r) => ({
        employeeId:   r.employee_id,
        employeeName: r.employee_name,
        employeeCode: r.employee_code,
        entryCount:   Number(r.entry_count),
        totalMinutes: Number(r.total_minutes),
        totalHours:   +(Number(r.total_minutes) / 60).toFixed(2),
        approvalRate:
          Number(r.entry_count) > 0
            ? +((Number(r.approved_count) / Number(r.entry_count)) * 100).toFixed(1)
            : 0,
      })),
      zeroEntryEmployees,
    });
  } catch (err) {
    console.error("getCompanySummary error:", err);
    return res.status(500).json({ message: "Server error fetching summary." });
  }
}

// ──────────────────────────────────────────────────────────────
// GET /timesheets/admin/employees/:employeeId/entries
// Query: startDate, endDate, status
// ──────────────────────────────────────────────────────────────
export async function getEmployeeHistory(req, res) {
  const { companyId }  = req.user;
  const employeeId     = req.params.employeeId;
  const { startDate, endDate, status } = req.query;

  try {
    const params  = [companyId, employeeId];
    const filters = [];

    if (startDate) { params.push(startDate); filters.push(`te.entry_date >= $${params.length}`); }
    if (endDate)   { params.push(endDate);   filters.push(`te.entry_date <= $${params.length}`); }
    if (status)    { params.push(status);    filters.push(`te.status = $${params.length}`); }

    const whereClause = filters.length ? `AND ${filters.join(" AND ")}` : "";

    const result = await db.query(
      `SELECT
         te.*,
         e.first_name  || ' ' || e.last_name AS employee_name,
         e.employee_code,
         d.name                               AS department,
         jr.title                             AS job_title,
         u.first_name  || ' ' || u.last_name AS approved_by_name
       FROM   timesheet_entries te
       JOIN   employees   e  ON e.id  = te.employee_id
       LEFT JOIN departments  d  ON d.id  = e.department_id
       LEFT JOIN job_roles    jr ON jr.id = e.job_role_id
       LEFT JOIN users        u  ON u.id  = te.approved_by
       WHERE  te.company_id  = $1
         AND  te.employee_id = $2
         ${whereClause}
       ORDER BY te.entry_date DESC, te.start_time ASC`,
      params,
    );

    return res.status(200).json({
      employeeId,
      entries: result.rows.map(formatAdminEntry),
      total:   result.rows.length,
    });
  } catch (err) {
    console.error("getEmployeeHistory error:", err);
    return res.status(500).json({ message: "Server error fetching employee history." });
  }
}

// ──────────────────────────────────────────────────────────────
// GET /timesheets/admin/export
// Query: startDate, endDate, employeeId (optional), departmentId (optional)
// Streams CSV — never loads full result set into memory.
// ──────────────────────────────────────────────────────────────
export async function exportCSV(req, res) {
  const { companyId } = req.user;
  const { startDate, endDate, employeeId, departmentId } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: "startDate and endDate are required for export." });
  }

  const params  = [companyId, startDate, endDate];
  const filters = [];

  if (employeeId)   { params.push(employeeId);   filters.push(`te.employee_id = $${params.length}`); }
  if (departmentId) { params.push(departmentId); filters.push(`e.department_id = $${params.length}`); }

  const whereClause = filters.length ? `AND ${filters.join(" AND ")}` : "";

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="timesheets-${startDate}-to-${endDate}.csv"`,
  );

  res.write(
    "Employee Name,Employee Code,Department,Date,Start Time,End Time,Duration (min),Duration (hrs),Description,Project Tag,Status,Approved By,Approved Date\n",
  );

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    await client.query(
      "DECLARE ts_export_cursor CURSOR FOR " +
        `SELECT
           e.first_name  || ' ' || e.last_name  AS employee_name,
           e.employee_code,
           d.name                                AS department,
           te.entry_date,
           te.start_time,
           te.end_time,
           te.duration_minutes,
           te.description,
           te.project_tag,
           te.status,
           COALESCE(u.first_name || ' ' || u.last_name, '') AS approved_by_name,
           te.approved_at
         FROM   timesheet_entries te
         JOIN   employees   e  ON e.id  = te.employee_id
         LEFT JOIN departments  d  ON d.id  = e.department_id
         LEFT JOIN users        u  ON u.id  = te.approved_by
         WHERE  te.company_id = $1
           AND  te.entry_date BETWEEN $2 AND $3
           ${whereClause}
         ORDER BY e.first_name, e.last_name, te.entry_date, te.start_time`,
      params,
    );

    let done = false;
    while (!done) {
      const batch = await client.query("FETCH 200 FROM ts_export_cursor");
      if (batch.rows.length === 0) { done = true; break; }

      for (const row of batch.rows) {
        const cols = [
          csvEscape(row.employee_name),
          csvEscape(row.employee_code || ""),
          csvEscape(row.department || ""),
          row.entry_date ? String(row.entry_date).slice(0, 10) : "",
          row.start_time || "",
          row.end_time   || "",
          row.duration_minutes,
          (Number(row.duration_minutes) / 60).toFixed(2),
          csvEscape(row.description || ""),
          csvEscape(row.project_tag || ""),
          row.status,
          csvEscape(row.approved_by_name || ""),
          row.approved_at ? new Date(row.approved_at).toISOString().slice(0, 10) : "",
        ];
        res.write(cols.join(",") + "\n");
      }
    }

    await client.query("CLOSE ts_export_cursor");
    await client.query("COMMIT");
    res.end();
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("exportCSV error:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error during export." });
    } else {
      res.end();
    }
  } finally {
    client.release();
  }
}

// ─── CSV helper ───────────────────────────────────────────────
function csvEscape(value) {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ─── Response shaper ──────────────────────────────────────────
function formatAdminEntry(row) {
  return {
    id:              row.id,
    companyId:       row.company_id,
    employeeId:      row.employee_id,
    employeeName:    row.employee_name    ?? null,
    employeeCode:    row.employee_code    ?? null,
    department:      row.department       ?? null,
    jobTitle:        row.job_title        ?? null,
    entryDate:       row.entry_date,
    startTime:       row.start_time,
    endTime:         row.end_time,
    durationMinutes: row.duration_minutes,
    durationHours:   +(Number(row.duration_minutes) / 60).toFixed(2),
    description:     row.description,
    projectTag:      row.project_tag      ?? null,
    status:          row.status,
    submittedAt:     row.submitted_at     ?? null,
    approvedBy:      row.approved_by      ?? null,
    approvedByName:  row.approved_by_name ?? null,   // ← human name, not UUID
    approvedAt:      row.approved_at      ?? null,
    rejectionReason: row.rejection_reason ?? null,
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  };
}