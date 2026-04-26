// src/controllers/announcement.controller.js
//
// Endpoints:
//   GET    /api/announcements          → all announcements, paginated + filtered (HR)
//   POST   /api/announcements          → create announcement (HR)
//   PUT    /api/announcements/:id      → edit announcement (HR)
//   DELETE /api/announcements/:id      → delete announcement (HR)
//   GET    /api/announcements/feed     → employee-facing feed (audience-scoped)
//   PUT    /api/announcements/:id/view → increment view count (any authenticated user)
//
// Stack : Express · pg (raw) · express-validator
// Auth  : authenticate injects req.user { userId, companyId, role }
//
// Schema reference:
//   announcements (
//     id uuid pk, company_id uuid, title varchar(255), body text,
//     audience varchar(20) — 'all'|'department'|'role',
//     department_id uuid|null, is_pinned boolean, publish_at timestamptz,
//     expires_at timestamptz, created_by uuid, views integer,
//     created_at timestamptz, updated_at timestamptz
//   )

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

// ══════════════════════════════════════════════════════════════
// GET /api/announcements
// HR view — all announcements for the company, paginated.
// Query params:
//   page       — default 1
//   limit      — default 20, max 100
//   audience   — 'all' | 'department' | 'role'
//   department — department UUID
//   pinned     — 'true' | 'false'
//   status     — 'active' | 'scheduled' | 'expired'
//               active    = publish_at <= NOW() AND (expires_at IS NULL OR expires_at > NOW())
//               scheduled = publish_at > NOW()
//               expired   = expires_at <= NOW()
// Requires: authenticate + requireRole(["hr_admin","super_admin"])
// ══════════════════════════════════════════════════════════════
export async function listAnnouncements(req, res) {
  try {
    const { companyId } = req.user;

    const page = Math.max(1, parseInt(req.query.page ?? 1, 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit ?? 20, 10)),
    );
    const offset = (page - 1) * limit;

    const conditions = ["a.company_id = $1"];
    const values = [companyId];
    let idx = 2;

    if (req.query.audience) {
      conditions.push(`a.audience = $${idx}`);
      values.push(req.query.audience);
      idx++;
    }

    if (req.query.department) {
      conditions.push(`a.department_id = $${idx}`);
      values.push(req.query.department);
      idx++;
    }

    if (req.query.pinned !== undefined) {
      conditions.push(`a.is_pinned = $${idx}`);
      values.push(req.query.pinned === "true");
      idx++;
    }

    if (req.query.status === "active") {
      conditions.push(
        `(a.publish_at IS NULL OR a.publish_at <= NOW()) AND (a.expires_at IS NULL OR a.expires_at > NOW())`,
      );
    } else if (req.query.status === "scheduled") {
      conditions.push(`a.publish_at > NOW()`);
    } else if (req.query.status === "expired") {
      conditions.push(`a.expires_at <= NOW()`);
    }

    const whereClause = conditions.join(" AND ");

    const countResult = await db.query(
      `SELECT COUNT(*) AS total FROM announcements a WHERE ${whereClause}`,
      values,
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const dataResult = await db.query(
      `SELECT
         a.id,
         a.title,
         a.body,
         a.audience,
         a.department_id,
         d.name                                    AS department_name,
         a.is_pinned,
         a.publish_at,
         a.expires_at,
         a.views,
         a.created_at,
         a.updated_at,
         CONCAT(u.first_name, ' ', u.last_name)    AS created_by_name,
         u.id                                      AS created_by_id
       FROM announcements a
       LEFT JOIN departments d ON d.id = a.department_id
       LEFT JOIN users       u ON u.id = a.created_by
       WHERE ${whereClause}
       ORDER BY a.is_pinned DESC, a.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset],
    );

    return res.status(200).json({
      data: dataResult.rows,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("listAnnouncements error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching announcements." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/announcements
// Creates a new announcement.
// audience = 'department' requires a department_id.
// Requires: authenticate + requireRole(["hr_admin","super_admin"])
// ══════════════════════════════════════════════════════════════
export async function createAnnouncement(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { companyId, userId } = req.user;
  const {
    title,
    body,
    audience,
    departmentId,
    isPinned = false,
    publishAt, // ISO string — null means publish immediately
    expiresAt, // ISO string — null means never expires
  } = req.body;

  // Audience-specific guard
  if (audience === "department" && !departmentId) {
    return res.status(400).json({
      message: "departmentId is required when audience is 'department'.",
    });
  }

  // Validate departmentId belongs to this company (when provided)
  if (departmentId) {
    const deptCheck = await db.query(
      `SELECT id FROM departments WHERE id = $1 AND company_id = $2`,
      [departmentId, companyId],
    );
    if (deptCheck.rows.length === 0) {
      return res.status(404).json({ message: "Department not found." });
    }
  }

  try {
    const result = await db.query(
      `INSERT INTO announcements (
         company_id, title, body, audience, department_id,
         is_pinned, publish_at, expires_at, created_by, created_at
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
       RETURNING *`,
      [
        companyId,
        title,
        body,
        audience,
        departmentId ?? null,
        isPinned,
        publishAt ?? null,
        expiresAt ?? null,
        userId,
      ],
    );

    return res.status(201).json({
      message: "Announcement created successfully.",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("createAnnouncement error:", err);
    return res
      .status(500)
      .json({ message: "Server error creating announcement." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/announcements/:id
// Edits an existing announcement — only the fields that are sent
// are updated (COALESCE pattern, same as leave.controller).
// Cannot edit an already-expired announcement.
// Requires: authenticate + requireRole(["hr_admin","super_admin"])
// ══════════════════════════════════════════════════════════════
export async function updateAnnouncement(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { id } = req.params;
  const { companyId } = req.user;
  const {
    title,
    body,
    audience,
    departmentId,
    isPinned,
    publishAt,
    expiresAt,
  } = req.body;

  try {
    // Fetch current row — company guard
    const current = await db.query(
      `SELECT * FROM announcements WHERE id = $1 AND company_id = $2`,
      [id, companyId],
    );
    if (current.rows.length === 0) {
      return res.status(404).json({ message: "Announcement not found." });
    }

    const ann = current.rows[0];

    // Block edits on expired announcements
    if (ann.expires_at && new Date(ann.expires_at) <= new Date()) {
      return res.status(409).json({
        message: "Cannot edit an expired announcement.",
      });
    }

    // If switching to audience = 'department', a departmentId is needed
    const resolvedAudience = audience ?? ann.audience;
    const resolvedDeptId =
      departmentId !== undefined ? departmentId : ann.department_id;

    if (resolvedAudience === "department" && !resolvedDeptId) {
      return res.status(400).json({
        message: "departmentId is required when audience is 'department'.",
      });
    }

    // Validate new departmentId if changed
    if (departmentId && departmentId !== ann.department_id) {
      const deptCheck = await db.query(
        `SELECT id FROM departments WHERE id = $1 AND company_id = $2`,
        [departmentId, companyId],
      );
      if (deptCheck.rows.length === 0) {
        return res.status(404).json({ message: "Department not found." });
      }
    }

    const result = await db.query(
      `UPDATE announcements
       SET
         title         = COALESCE($1,  title),
         body          = COALESCE($2,  body),
         audience      = COALESCE($3,  audience),
         department_id = $4,
         is_pinned     = COALESCE($5,  is_pinned),
         publish_at    = COALESCE($6,  publish_at),
         expires_at    = COALESCE($7,  expires_at),
         updated_at    = NOW()
       WHERE id = $8 AND company_id = $9
       RETURNING *`,
      [
        title ?? null,
        body ?? null,
        audience ?? null,
        resolvedDeptId ?? null, // always pass — allows clearing to null
        isPinned ?? null,
        publishAt ?? null,
        expiresAt ?? null,
        id,
        companyId,
      ],
    );

    return res.status(200).json({
      message: "Announcement updated successfully.",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("updateAnnouncement error:", err);
    return res
      .status(500)
      .json({ message: "Server error updating announcement." });
  }
}

// ══════════════════════════════════════════════════════════════
// DELETE /api/announcements/:id
// Hard deletes the announcement (no soft delete needed — the
// expires_at mechanism handles soft retirement).
// Requires: authenticate + requireRole(["hr_admin","super_admin"])
// ══════════════════════════════════════════════════════════════
export async function deleteAnnouncement(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    const result = await db.query(
      `DELETE FROM announcements
       WHERE id = $1 AND company_id = $2
       RETURNING id, title`,
      [id, companyId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Announcement not found." });
    }

    return res.status(200).json({
      message: `Announcement "${result.rows[0].title}" deleted successfully.`,
      data: { id: result.rows[0].id },
    });
  } catch (err) {
    console.error("deleteAnnouncement error:", err);
    return res
      .status(500)
      .json({ message: "Server error deleting announcement." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/announcements/feed
// Employee-facing feed — only returns announcements the calling
// employee is entitled to see based on audience + their dept.
//
// Scoping rules:
//   audience = 'all'        → visible to everyone in the company
//   audience = 'department' → visible only if employee is in that department
//   audience = 'role'       → visible only if user role matches (future-use;
//                             stored as the created_by user's role for now)
//
// Additional filters:
//   • publish_at  IS NULL OR <= NOW()  (not yet scheduled)
//   • expires_at  IS NULL OR > NOW()   (not expired)
//
// Pinned items are always sorted first.
// Query params:
//   page  — default 1
//   limit — default 10, max 50
// Requires: authenticate (any role)
// ══════════════════════════════════════════════════════════════
// export async function getAnnouncementFeed(req, res) {
//   try {
//     const { userId, companyId } = req.user;

//     const page = Math.max(1, parseInt(req.query.page ?? 1, 10));
//     const limit = Math.min(
//       50,
//       Math.max(1, parseInt(req.query.limit ?? 10, 10)),
//     );
//     const offset = (page - 1) * limit;

//     // Resolve calling employee's department
//     const empResult = await db.query(
//       `SELECT id, department_id FROM employees
//        WHERE user_id = $1 AND company_id = $2`,
//       [userId, companyId],
//     );

//     // department_id may be null if employee not yet assigned
//     const employeeDeptId = empResult.rows[0]?.department_id ?? null;

//     // Build audience filter:
//     //   • audience = 'all'  always included
//     //   • audience = 'department' only if department matches (or employee has no dept — excluded)
//     const audienceClause = employeeDeptId
//       ? `(a.audience = 'all' OR (a.audience = 'department' AND a.department_id = $3))`
//       : `a.audience = 'all'`;

//     const baseValues = employeeDeptId
//       ? [
//           companyId,
//           /* publish/expire handled inline */ companyId,
//           employeeDeptId,
//         ]
//       : [companyId];

//     // Count
//     const countResult = await db.query(
//       `SELECT COUNT(*) AS total
//        FROM announcements a
//        WHERE a.company_id = $1
//          AND (a.publish_at IS NULL OR a.publish_at <= NOW())
//          AND (a.expires_at IS NULL OR a.expires_at > NOW())
//          AND ${audienceClause}`,
//       employeeDeptId ? [companyId, companyId, employeeDeptId] : [companyId],
//     );

//     // Simpler flat values for both queries
//     const qValues = employeeDeptId ? [companyId, employeeDeptId] : [companyId];

//     const audienceFilter = employeeDeptId
//       ? `(a.audience = 'all' OR (a.audience = 'department' AND a.department_id = $2))`
//       : `a.audience = 'all'`;

//     const total = parseInt(countResult.rows[0].total, 10);
//     const limitIdx = employeeDeptId ? 3 : 2;

//     const dataResult = await db.query(
//       `SELECT
//          a.id,
//          a.title,
//          a.body,
//          a.audience,
//          a.department_id,
//          d.name                                  AS department_name,
//          a.is_pinned,
//          a.publish_at,
//          a.expires_at,
//          a.views,
//          a.created_at,
//          CONCAT(u.first_name, ' ', u.last_name)  AS posted_by
//        FROM announcements a
//        LEFT JOIN departments d ON d.id = a.department_id
//        LEFT JOIN users       u ON u.id = a.created_by
//        WHERE a.company_id = $1
//          AND (a.publish_at IS NULL OR a.publish_at <= NOW())
//          AND (a.expires_at IS NULL OR a.expires_at > NOW())
//          AND ${audienceFilter}
//        ORDER BY a.is_pinned DESC, a.publish_at DESC NULLS LAST, a.created_at DESC
//        LIMIT $${limitIdx} OFFSET $${limitIdx + 1}`,
//       [...qValues, limit, offset],
//     );

//     return res.status(200).json({
//       data: dataResult.rows,
//       meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
//     });
//   } catch (err) {
//     console.error("getAnnouncementFeed error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error fetching announcement feed." });
//   }
// }

// ══════════════════════════════════════════════════════════════
// GET /api/announcements/feed
// Employee-facing feed — only returns announcements the calling
// employee is entitled to see based on audience + their dept.
// ══════════════════════════════════════════════════════════════
export async function getAnnouncementFeed(req, res) {
  try {
    const { userId, companyId } = req.user;

    const page = Math.max(1, parseInt(req.query.page ?? 1, 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit ?? 10, 10)),
    );
    const offset = (page - 1) * limit;

    // Resolve calling employee's department
    const empResult = await db.query(
      `SELECT id, department_id FROM employees
       WHERE user_id = $1 AND company_id = $2`,
      [userId, companyId],
    );

    // department_id may be null if employee not yet assigned
    const employeeDeptId = empResult.rows[0]?.department_id ?? null;

    // Define the dynamic values and filter clause ONCE for both queries
    const qValues = employeeDeptId ? [companyId, employeeDeptId] : [companyId];
    
    // If employee has a dept, use $2. If not, only $1 is used.
    const audienceFilter = employeeDeptId
      ? `(a.audience = 'all' OR (a.audience = 'department' AND a.department_id = $2))`
      : `a.audience = 'all'`;

    // 1. Count Query
    const countResult = await db.query(
      `SELECT COUNT(*) AS total
       FROM announcements a
       WHERE a.company_id = $1
         AND (a.publish_at IS NULL OR a.publish_at <= NOW())
         AND (a.expires_at IS NULL OR a.expires_at > NOW())
         AND ${audienceFilter}`,
      qValues,
    );

    const total = parseInt(countResult.rows[0].total, 10);
    
    // Determine the parameter index for LIMIT and OFFSET
    const limitIdx = employeeDeptId ? 3 : 2;

    // 2. Data Query
    const dataResult = await db.query(
      `SELECT
         a.id,
         a.title,
         a.body,
         a.audience,
         a.department_id,
         d.name                                  AS department_name,
         a.is_pinned,
         a.publish_at,
         a.expires_at,
         a.views,
         a.created_at,
         CONCAT(u.first_name, ' ', u.last_name)  AS posted_by
       FROM announcements a
       LEFT JOIN departments d ON d.id = a.department_id
       LEFT JOIN users       u ON u.id = a.created_by
       WHERE a.company_id = $1
         AND (a.publish_at IS NULL OR a.publish_at <= NOW())
         AND (a.expires_at IS NULL OR a.expires_at > NOW())
         AND ${audienceFilter}
       ORDER BY a.is_pinned DESC, a.publish_at DESC NULLS LAST, a.created_at DESC
       LIMIT $${limitIdx} OFFSET $${limitIdx + 1}`,
      [...qValues, limit, offset],
    );

    return res.status(200).json({
      data: dataResult.rows,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("getAnnouncementFeed error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching announcement feed." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/announcements/:id/view
// Atomically increments the view counter for an announcement.
// Only counts views for announcements the employee can actually
// see (same audience rules as the feed) — prevents HR from
// inflating counts by hitting admin endpoints.
// Requires: authenticate (any role)
// ══════════════════════════════════════════════════════════════
export async function incrementViewCount(req, res) {
  const { id } = req.params;
  const { userId, companyId } = req.user;

  try {
    // Resolve employee department for audience guard
    const empResult = await db.query(
      `SELECT department_id FROM employees WHERE user_id = $1 AND company_id = $2`,
      [userId, companyId],
    );
    const deptId = empResult.rows[0]?.department_id ?? null;

    const audienceFilter = deptId
      ? `(audience = 'all' OR (audience = 'department' AND department_id = $3))`
      : `audience = 'all'`;

    const qValues = deptId ? [id, companyId, deptId] : [id, companyId];

    const result = await db.query(
      `UPDATE announcements
       SET views = views + 1, updated_at = NOW()
       WHERE id = $1
         AND company_id = $2
         AND (publish_at IS NULL OR publish_at <= NOW())
         AND (expires_at IS NULL OR expires_at  > NOW())
         AND ${audienceFilter}
       RETURNING id, views`,
      qValues,
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Announcement not found or not visible to you.",
      });
    }

    return res.status(200).json({
      message: "View recorded.",
      data: { id: result.rows[0].id, views: result.rows[0].views },
    });
  } catch (err) {
    console.error("incrementViewCount error:", err);
    return res.status(500).json({ message: "Server error recording view." });
  }
}
