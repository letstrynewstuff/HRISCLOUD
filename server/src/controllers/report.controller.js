// src/controllers/report.controller.js
//
// Employee → HR complaint reporting.
// Lets an employee raise a report of any kind (sexual harassment,
// discrimination, unfair treatment, workplace safety, attendance issues,
// fraud, policy violations, etc.) directly to HR, optionally anonymously.
//
// Endpoints:
//   POST   /api/reports              → createReport            (any authenticated employee)
//   GET    /api/reports/me           → getMyReports             (any authenticated employee)
//   GET    /api/reports/:id          → getReport                (owner OR hr_admin/super_admin)
//   GET    /api/reports              → listReports              (hr_admin/super_admin)
//   GET    /api/reports/stats/summary→ getReportStats           (hr_admin/super_admin)
//   PUT    /api/reports/:id/status   → updateReportStatus       (hr_admin/super_admin)
//   PUT    /api/reports/:id/assign   → assignReport             (hr_admin/super_admin)
//   POST   /api/reports/:id/notes    → addReportNote            (hr_admin/super_admin)
//   POST   /api/reports/:id/reveal   → revealReporterIdentity   (super_admin only)
//
// Table schema this controller expects (see migrations/xxxx_create_reports.sql):
//   reports(
//     id, company_id, reporter_id, is_anonymous, category, severity,
//     subject, description, incident_date, location, involved_parties,
//     witnesses, desired_outcome, attachments, status, assigned_to,
//     resolution_notes, resolved_at, created_at, updated_at
//   )
//   report_notes(
//     id, report_id, author_id, note, is_status_change, visible_to_reporter, created_at
//   )
//   report_identity_reveals(
//     id, report_id, revealed_by, reason, created_at
//   )

import { validationResult } from "express-validator";
import { db } from "../config/db.js";
import { resolveEmployeeId } from "../utils/hierarchy.js";

// ─── Constants ──────────────────────────────────────────────────────────────

export const REPORT_CATEGORIES = [
  "sexual_harassment",
  "discrimination",
  "bullying_harassment",
  "unfair_treatment",
  "workplace_safety",
  "attendance_absenteeism",
  "fraud_theft",
  "policy_violation",
  "retaliation",
  "other",
];

export const REPORT_SEVERITIES = ["low", "medium", "high", "critical"];

export const REPORT_STATUSES = [
  "submitted",
  "under_review",
  "investigating",
  "resolved",
  "dismissed",
];

const HR_ROLES = ["hr_admin", "super_admin"];

// ─── Internal helpers ───────────────────────────────────────────────────────

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

/** Short, human-friendly reference code an employee can quote to HR. */
function toReferenceCode(id) {
  return `RPT-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

// Shared SELECT with joins for reporter / assignee display names.
// Reporter identity is ALWAYS fetched here (needed for HR follow-up and
// legal accountability) — it is stripped out at serialization time
// whenever the report is anonymous and the viewer isn't the reporter.
const SELECT_WITH_JOINS = `
  SELECT
    r.*,
    CONCAT(rep.first_name, ' ', rep.last_name) AS reporter_name,
    rep.employee_code                           AS reporter_code,
    u_rep.email                                 AS reporter_email,
    d.name                                       AS reporter_department,
    CONCAT(au.first_name, ' ', au.last_name)    AS assigned_to_name
  FROM reports r
  LEFT JOIN employees   rep   ON rep.id   = r.reporter_id
  LEFT JOIN users       u_rep ON u_rep.id = rep.user_id
  LEFT JOIN departments d     ON d.id     = rep.department_id
  LEFT JOIN users       au    ON au.id    = r.assigned_to
`;

/**
 * Serialize one pg row → camelCase response.
 * maskReporter=true hides reporter identity outright (used for HR list views
 * of anonymous reports). Even when maskReporter=false, identity is still
 * hidden whenever the report is anonymous — callers that legitimately need
 * to bypass that (the reporter viewing their own report) handle it separately.
 */
function serializeReport(row, { maskReporter = false } = {}) {
  const hideReporter = maskReporter || row.is_anonymous;

  return {
    id: row.id,
    referenceCode: toReferenceCode(row.id),
    category: row.category,
    severity: row.severity,
    subject: row.subject,
    description: row.description,
    incidentDate: row.incident_date,
    location: row.location,
    involvedParties: row.involved_parties,
    witnesses: row.witnesses,
    desiredOutcome: row.desired_outcome,
    attachments: row.attachments ?? [],
    status: row.status,
    isAnonymous: row.is_anonymous,
    reporter: hideReporter
      ? null
      : {
          id: row.reporter_id,
          name: row.reporter_name ?? null,
          code: row.reporter_code ?? null,
          email: row.reporter_email ?? null,
          department: row.reporter_department ?? null,
        },
    assignedTo: row.assigned_to
      ? { id: row.assigned_to, name: row.assigned_to_name ?? null }
      : null,
    resolutionNotes: row.resolution_notes,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ══════════════════════════════════════════════════════════════
// POST /api/reports
// Body: {
//   category, severity?, subject, description, incidentDate?, location?,
//   involvedParties?, witnesses?, desiredOutcome?, isAnonymous?, attachments?
// }
// Requires: authenticate (any employee)
// ══════════════════════════════════════════════════════════════
export async function createReport(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { userId, companyId } = req.user;
  const {
    category,
    severity = "medium",
    subject,
    description,
    incidentDate,
    location,
    involvedParties,
    witnesses,
    desiredOutcome,
    isAnonymous = false,
    attachments = [],
  } = req.body;

  if (!REPORT_CATEGORIES.includes(category)) {
    return res.status(422).json({
      message: `Invalid category. Must be one of: ${REPORT_CATEGORIES.join(", ")}`,
    });
  }
  if (!REPORT_SEVERITIES.includes(severity)) {
    return res.status(422).json({
      message: `Invalid severity. Must be one of: ${REPORT_SEVERITIES.join(", ")}`,
    });
  }
  if (!subject?.trim() || !description?.trim()) {
    return res
      .status(400)
      .json({ message: "Subject and description are required." });
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    // Every report is tied to an employee record internally — even
    // "anonymous" ones — so HR can follow up if the reporter chooses to
    // reveal themselves, and so a super admin can act in serious cases.
    // Anonymity is enforced at the *serialization* layer, not storage.
    const employeeId = await resolveEmployeeId(client, userId, companyId);
    if (!employeeId) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Employee profile not found." });
    }

    const inserted = await client.query(
      `INSERT INTO reports (
         company_id, reporter_id, is_anonymous, category, severity,
         subject, description, incident_date, location,
         involved_parties, witnesses, desired_outcome, attachments,
         status, created_at, updated_at
       )
       VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,
         'submitted', NOW(), NOW()
       )
       RETURNING id, created_at`,
      [
        companyId,
        employeeId,
        Boolean(isAnonymous),
        category,
        severity,
        subject.trim(),
        description.trim(),
        incidentDate ?? null,
        location ?? null,
        involvedParties ?? null,
        witnesses ?? null,
        desiredOutcome ?? null,
        JSON.stringify(Array.isArray(attachments) ? attachments : []),
      ],
    );

    const reportId = inserted.rows[0].id;

    // System note documenting submission — visible to the reporter so
    // their own timeline shows it was received.
    await client.query(
      `INSERT INTO report_notes (report_id, author_id, note, is_status_change, visible_to_reporter)
       VALUES ($1, $2, 'Report submitted and awaiting HR review.', true, true)`,
      [reportId, userId],
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message:
        "Your report has been submitted confidentially. HR will review it shortly.",
      data: {
        id: reportId,
        referenceCode: toReferenceCode(reportId),
        status: "submitted",
        createdAt: inserted.rows[0].created_at,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("createReport error:", err);
    return res.status(500).json({ message: "Server error submitting report." });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/reports/me
// The employee's own submitted reports (never masked — it's their own).
// Requires: authenticate
// ══════════════════════════════════════════════════════════════
export async function getMyReports(req, res) {
  try {
    const { userId, companyId } = req.user;

    const employeeId = await resolveEmployeeId(db, userId, companyId);
    if (!employeeId) {
      return res.status(404).json({ message: "Employee profile not found." });
    }

    const { rows } = await db.query(
      `${SELECT_WITH_JOINS}
       WHERE r.reporter_id = $1 AND r.company_id = $2
       ORDER BY r.created_at DESC`,
      [employeeId, companyId],
    );

    return res.status(200).json({
      data: rows.map((row) => ({
        ...serializeReport(row, { maskReporter: false }),
        reporter: {
          id: row.reporter_id,
          name: row.reporter_name,
          code: row.reporter_code,
          email: row.reporter_email,
          department: row.reporter_department,
        },
      })),
    });
  } catch (err) {
    console.error("getMyReports error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching your reports." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/reports/:id
// Owner sees their own report in full (regardless of anonymity flag).
// HR sees any company report, with identity masked when anonymous.
// Requires: authenticate
// ══════════════════════════════════════════════════════════════
export async function getReport(req, res) {
  try {
    const { id } = req.params;
    const { userId, companyId, role } = req.user;

    const { rows } = await db.query(
      `${SELECT_WITH_JOINS} WHERE r.id = $1 AND r.company_id = $2`,
      [id, companyId],
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Report not found." });
    }
    const row = rows[0];

    const isHR = HR_ROLES.includes(role);
    const employeeId = await resolveEmployeeId(db, userId, companyId);
    const isOwner = Boolean(employeeId) && employeeId === row.reporter_id;

    if (!isHR && !isOwner) {
      return res.status(403).json({ message: "Access denied." });
    }

    const notesResult = await db.query(
      `SELECT rn.*, CONCAT(u.first_name, ' ', u.last_name) AS author_name
       FROM report_notes rn
       LEFT JOIN users u ON u.id = rn.author_id
       WHERE rn.report_id = $1
       ORDER BY rn.created_at ASC`,
      [id],
    );

    // Reporters only ever see notes explicitly flagged visible_to_reporter,
    // and never see which HR staffer wrote them — internal investigation
    // detail stays internal.
    const notes = notesResult.rows
      .filter((n) => isHR || n.visible_to_reporter)
      .map((n) => ({
        id: n.id,
        note: n.note,
        isStatusChange: n.is_status_change,
        visibleToReporter: n.visible_to_reporter,
        authorName: isHR ? (n.author_name ?? "HR") : "HR Team",
        createdAt: n.created_at,
      }));

    const base = isOwner
      ? {
          ...serializeReport(row, { maskReporter: false }),
          reporter: {
            id: row.reporter_id,
            name: row.reporter_name,
            code: row.reporter_code,
            email: row.reporter_email,
            department: row.reporter_department,
          },
        }
      : serializeReport(row, { maskReporter: false }); // masking already applied for anonymous inside serializeReport

    return res.status(200).json({ data: { ...base, notes } });
  } catch (err) {
    console.error("getReport error:", err);
    return res.status(500).json({ message: "Server error fetching report." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/reports
// Query params: page, limit, status, category, severity, assignedTo,
//               search, dateFrom, dateTo
// Reporter identity is always masked in the list view for anonymous
// reports — use GET /:id + reveal endpoint if identity is truly needed.
// Requires: authenticate + requireRole(["hr_admin","super_admin"])
// ══════════════════════════════════════════════════════════════
export async function listReports(req, res) {
  try {
    const { companyId } = req.user;
    const page = Math.max(1, parseInt(req.query.page ?? 1, 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit ?? 20, 10)),
    );
    const offset = (page - 1) * limit;

    const conditions = ["r.company_id = $1"];
    const values = [companyId];
    let idx = 2;

    const { status, category, severity, assignedTo, search, dateFrom, dateTo } =
      req.query;

    if (status) {
      conditions.push(`r.status = $${idx}`);
      values.push(status);
      idx++;
    }
    if (category) {
      conditions.push(`r.category = $${idx}`);
      values.push(category);
      idx++;
    }
    if (severity) {
      conditions.push(`r.severity = $${idx}`);
      values.push(severity);
      idx++;
    }
    if (assignedTo) {
      conditions.push(`r.assigned_to = $${idx}`);
      values.push(assignedTo);
      idx++;
    }
    if (search) {
      conditions.push(
        `(r.subject ILIKE $${idx} OR r.description ILIKE $${idx})`,
      );
      values.push(`%${search}%`);
      idx++;
    }
    if (dateFrom) {
      conditions.push(`r.created_at >= $${idx}`);
      values.push(dateFrom);
      idx++;
    }
    if (dateTo) {
      conditions.push(`r.created_at <= $${idx}`);
      values.push(dateTo);
      idx++;
    }

    const whereClause = conditions.join(" AND ");

    const countResult = await db.query(
      `SELECT COUNT(*) AS total FROM reports r WHERE ${whereClause}`,
      values,
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const dataResult = await db.query(
      `${SELECT_WITH_JOINS}
       WHERE ${whereClause}
       ORDER BY
         CASE r.severity
           WHEN 'critical' THEN 0
           WHEN 'high'     THEN 1
           WHEN 'medium'   THEN 2
           ELSE 3
         END,
         r.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset],
    );

    return res.status(200).json({
      data: dataResult.rows.map((row) =>
        serializeReport(row, { maskReporter: true }),
      ),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("listReports error:", err);
    return res.status(500).json({ message: "Server error fetching reports." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/reports/:id/status
// Body: { status, note? }
// Requires: authenticate + requireRole(["hr_admin","super_admin"])
// ══════════════════════════════════════════════════════════════
export async function updateReportStatus(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { id } = req.params;
  const { userId, companyId } = req.user;
  const { status, note } = req.body;

  if (!REPORT_STATUSES.includes(status)) {
    return res.status(422).json({
      message: `Invalid status. Must be one of: ${REPORT_STATUSES.join(", ")}`,
    });
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT id FROM reports WHERE id = $1 AND company_id = $2`,
      [id, companyId],
    );
    if (existing.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Report not found." });
    }

    const isResolving = ["resolved", "dismissed"].includes(status);

    await client.query(
      `UPDATE reports
       SET status = $1,
           resolution_notes = COALESCE($2, resolution_notes),
           resolved_at = CASE WHEN $3 THEN NOW() ELSE resolved_at END,
           updated_at = NOW()
       WHERE id = $4 AND company_id = $5`,
      [status, note ?? null, isResolving, id, companyId],
    );

    await client.query(
      `INSERT INTO report_notes (report_id, author_id, note, is_status_change, visible_to_reporter)
       VALUES ($1, $2, $3, true, true)`,
      [
        id,
        userId,
        note
          ? `Status changed to "${status}": ${note}`
          : `Status changed to "${status}".`,
      ],
    );

    await client.query("COMMIT");

    const full = await db.query(
      `${SELECT_WITH_JOINS} WHERE r.id = $1 AND r.company_id = $2`,
      [id, companyId],
    );

    return res.status(200).json({
      message: "Report status updated.",
      data: serializeReport(full.rows[0], { maskReporter: true }),
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("updateReportStatus error:", err);
    return res.status(500).json({ message: "Server error updating report." });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/reports/:id/assign
// Body: { assignedTo: userId | null }
// Requires: authenticate + requireRole(["hr_admin","super_admin"])
// ══════════════════════════════════════════════════════════════
export async function assignReport(req, res) {
  const { id } = req.params;
  const { userId, companyId } = req.user;
  const { assignedTo } = req.body;

  try {
    const existing = await db.query(
      `SELECT id FROM reports WHERE id = $1 AND company_id = $2`,
      [id, companyId],
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Report not found." });
    }

    if (assignedTo) {
      const adminCheck = await db.query(
        `SELECT id FROM users
         WHERE id = $1 AND company_id = $2 AND role = ANY($3::text[])`,
        [assignedTo, companyId, HR_ROLES],
      );
      if (adminCheck.rows.length === 0) {
        return res
          .status(400)
          .json({ message: "assignedTo must be an HR admin in your company." });
      }
    }

    await db.query(
      `UPDATE reports SET assigned_to = $1, updated_at = NOW() WHERE id = $2 AND company_id = $3`,
      [assignedTo ?? null, id, companyId],
    );

    await db.query(
      `INSERT INTO report_notes (report_id, author_id, note, is_status_change, visible_to_reporter)
       VALUES ($1, $2, $3, true, false)`,
      [
        id,
        userId,
        assignedTo
          ? "Report assigned for investigation."
          : "Report unassigned.",
      ],
    );

    const full = await db.query(
      `${SELECT_WITH_JOINS} WHERE r.id = $1 AND r.company_id = $2`,
      [id, companyId],
    );

    return res.status(200).json({
      message: "Report assignment updated.",
      data: serializeReport(full.rows[0], { maskReporter: true }),
    });
  } catch (err) {
    console.error("assignReport error:", err);
    return res.status(500).json({ message: "Server error assigning report." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/reports/:id/notes
// Body: { note, visibleToReporter? }
// Internal HR investigation log. `visibleToReporter` controls whether the
// employee sees this entry on their own report timeline.
// Requires: authenticate + requireRole(["hr_admin","super_admin"])
// ══════════════════════════════════════════════════════════════
export async function addReportNote(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { id } = req.params;
  const { userId, companyId } = req.user;
  const { note, visibleToReporter = false } = req.body;

  if (!note?.trim()) {
    return res.status(400).json({ message: "Note text is required." });
  }

  try {
    const existing = await db.query(
      `SELECT id FROM reports WHERE id = $1 AND company_id = $2`,
      [id, companyId],
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Report not found." });
    }

    const { rows } = await db.query(
      `INSERT INTO report_notes (report_id, author_id, note, is_status_change, visible_to_reporter)
       VALUES ($1, $2, $3, false, $4)
       RETURNING id, note, visible_to_reporter, created_at`,
      [id, userId, note.trim(), Boolean(visibleToReporter)],
    );

    await db.query(`UPDATE reports SET updated_at = NOW() WHERE id = $1`, [id]);

    return res.status(201).json({
      message: "Note added.",
      data: {
        id: rows[0].id,
        note: rows[0].note,
        visibleToReporter: rows[0].visible_to_reporter,
        createdAt: rows[0].created_at,
      },
    });
  } catch (err) {
    console.error("addReportNote error:", err);
    return res.status(500).json({ message: "Server error adding note." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/reports/stats/summary
// Dashboard counts for HR: open/resolved breakdown, category & severity
// mix, average resolution time.
// Requires: authenticate + requireRole(["hr_admin","super_admin"])
// ══════════════════════════════════════════════════════════════
export async function getReportStats(req, res) {
  try {
    const { companyId } = req.user;

    const [totalResult, byStatus, byCategory, bySeverity, resolutionTime] =
      await Promise.all([
        db.query(
          `SELECT COUNT(*) AS total FROM reports WHERE company_id = $1`,
          [companyId],
        ),
        db.query(
          `SELECT status, COUNT(*) AS count FROM reports WHERE company_id = $1 GROUP BY status`,
          [companyId],
        ),
        db.query(
          `SELECT category, COUNT(*) AS count FROM reports WHERE company_id = $1 GROUP BY category`,
          [companyId],
        ),
        db.query(
          `SELECT severity, COUNT(*) AS count FROM reports WHERE company_id = $1 GROUP BY severity`,
          [companyId],
        ),
        db.query(
          `SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400) AS avg_days
           FROM reports
           WHERE company_id = $1 AND resolved_at IS NOT NULL`,
          [companyId],
        ),
      ]);

    return res.status(200).json({
      data: {
        total: parseInt(totalResult.rows[0].total, 10),
        byStatus: Object.fromEntries(
          byStatus.rows.map((r) => [r.status, parseInt(r.count, 10)]),
        ),
        byCategory: Object.fromEntries(
          byCategory.rows.map((r) => [r.category, parseInt(r.count, 10)]),
        ),
        bySeverity: Object.fromEntries(
          bySeverity.rows.map((r) => [r.severity, parseInt(r.count, 10)]),
        ),
        avgResolutionDays: resolutionTime.rows[0].avg_days
          ? Math.round(parseFloat(resolutionTime.rows[0].avg_days) * 10) / 10
          : null,
      },
    });
  } catch (err) {
    console.error("getReportStats error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching report stats." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/reports/:id/reveal
// Body: { reason }
// Breaks anonymity on a single report. Restricted to super_admin and
// always requires a written reason — every reveal is permanently logged
// to report_identity_reveals for audit purposes.
// Requires: authenticate + requireRole(["super_admin"])
// ══════════════════════════════════════════════════════════════
export async function revealReporterIdentity(req, res) {
  const { id } = req.params;
  const { userId, companyId, role } = req.user;
  const { reason } = req.body;

  if (role !== "super_admin") {
    return res
      .status(403)
      .json({
        message: "Only a super admin can reveal a reporter's identity.",
      });
  }
  if (!reason?.trim()) {
    return res
      .status(400)
      .json({ message: "A reason is required to reveal reporter identity." });
  }

  try {
    const { rows } = await db.query(
      `${SELECT_WITH_JOINS} WHERE r.id = $1 AND r.company_id = $2`,
      [id, companyId],
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Report not found." });
    }
    const row = rows[0];

    if (!row.is_anonymous) {
      return res
        .status(400)
        .json({ message: "This report was not submitted anonymously." });
    }

    await db.query(
      `INSERT INTO report_identity_reveals (report_id, revealed_by, reason)
       VALUES ($1, $2, $3)`,
      [id, userId, reason.trim()],
    );

    return res.status(200).json({
      message: "Reporter identity revealed. This action has been logged.",
      data: {
        reporter: {
          id: row.reporter_id,
          name: row.reporter_name,
          code: row.reporter_code,
          email: row.reporter_email,
          department: row.reporter_department,
        },
      },
    });
  } catch (err) {
    console.error("revealReporterIdentity error:", err);
    return res
      .status(500)
      .json({ message: "Server error revealing identity." });
  }
}
