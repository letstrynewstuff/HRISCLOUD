// src/controllers/attendanceExtras.controller.js
//
// This is the backend that was missing entirely for corrections and
// overtime — nothing in attendance.controller.js or attendance.routes.js
// handled them, which is why AttendanceCorrectionsView and
// OvertimeManagementView failed to load: the requests they make had
// nowhere to land.
//
// Endpoints (mount under /api/attendance, see routes patch):
//   GET  /api/attendance/corrections             → getCorrections
//   PUT  /api/attendance/corrections/:id/approve → approveCorrection
//   PUT  /api/attendance/corrections/:id/reject  → rejectCorrection
//   GET  /api/attendance/overtime                → getOvertime
//   PUT  /api/attendance/overtime/:id/approve    → approveOvertime
//   PUT  /api/attendance/overtime/:id/reject     → rejectOvertime
//
// NOTE: Timesheets intentionally live elsewhere. `timesheet.admin.controller.js`
// already owns the full timesheet model (`timesheet_entries` table) with
// bulk approval, audit logging, CSV export, and summaries. That controller
// is mounted separately at /timesheets/admin/*. Do not re-add timesheet
// handlers here — it would create a second, shallower timesheet system
// pointed at a different table (`timesheets`) than the UI already uses.
//
// Requires: authenticate + requireRole(["hr_admin","super_admin"]) on all
// of these (HR/manager-only screens).

import { db } from "../config/db.js";

function pagination(req, defaultLimit = 20) {
  const page = Math.max(1, parseInt(req.query.page ?? 1, 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(req.query.limit ?? defaultLimit, 10)),
  );
  return { page, limit, offset: (page - 1) * limit };
}

const EMPLOYEE_JOIN = `
  LEFT JOIN employees e ON e.id = t.employee_id
  LEFT JOIN departments d ON d.id = e.department_id
`;

function serializeEmployee(row) {
  return {
    firstName: row.first_name,
    lastName: row.last_name,
    department: row.department_name,
  };
}

/* ══════════════════════════════════════════════════════════════
   CORRECTIONS
   ══════════════════════════════════════════════════════════════ */

// // GET /api/attendance/corrections?status=pending&page=1&limit=20
// export async function getCorrections(req, res) {
//   try {
//     const { companyId } = req.user;
//     const { status } = req.query;
//     const { page, limit, offset } = pagination(req);

//     const conditions = ["t.company_id = $1"];
//     const values = [companyId];
//     let idx = 2;
//     if (status && status !== "all") {
//       conditions.push(`t.status = $${idx}`);
//       values.push(status);
//       idx++;
//     }
//     const where = conditions.join(" AND ");

//     const countRes = await db.query(
//       `SELECT COUNT(*) AS total FROM attendance_corrections t WHERE ${where}`,
//       values,
//     );
//     const total = parseInt(countRes.rows[0].total, 10);

//     const dataRes = await db.query(
//       `SELECT t.*, e.first_name, e.last_name, d.name AS department_name
//        FROM attendance_corrections t
//        ${EMPLOYEE_JOIN}
//        WHERE ${where}
//        ORDER BY t.created_at DESC
//        LIMIT $${idx} OFFSET $${idx + 1}`,
//       [...values, limit, offset],
//     );

//     return res.status(200).json({
//       rows: dataRes.rows.map((row) => ({
//         id: row.id,
//         employeeId: row.employee_id,
//         attendanceDate: row.attendance_date,
//         originalClockIn: row.original_clock_in,
//         originalClockOut: row.original_clock_out,
//         requestedClockIn: row.requested_clock_in,
//         requestedClockOut: row.requested_clock_out,
//         reason: row.reason,
//         status: row.status,
//         rejectionReason: row.rejection_reason,
//         employee: serializeEmployee(row),
//         createdAt: row.created_at,
//       })),
//       total,
//       page,
//       limit,
//     });
//   } catch (err) {
//     console.error("getCorrections error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error fetching corrections." });
//   }
// }


// GET /api/attendance/corrections?status=pending&departmentId=...&page=1&limit=20
export async function getCorrections(req, res) {
  try {
    const { companyId } = req.user;
    const { status, departmentId } = req.query;
    const { page, limit, offset } = pagination(req);
 
    const conditions = ["t.company_id = $1"];
    const values = [companyId];
    let idx = 2;
    if (status && status !== "all") {
      conditions.push(`t.status = $${idx}`);
      values.push(status);
      idx++;
    }
    if (departmentId) {
      conditions.push(`e.department_id = $${idx}`);
      values.push(departmentId);
      idx++;
    }
    const where = conditions.join(" AND ");
 
    const countRes = await db.query(
      `SELECT COUNT(*) AS total
       FROM attendance_corrections t
       ${EMPLOYEE_JOIN}
       WHERE ${where}`,
      values,
    );
    const total = parseInt(countRes.rows[0].total, 10);
 
    const dataRes = await db.query(
      `SELECT t.*, e.first_name, e.last_name, d.name AS department_name
       FROM attendance_corrections t
       ${EMPLOYEE_JOIN}
       WHERE ${where}
       ORDER BY t.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset],
    );
 
    return res.status(200).json({
      rows: dataRes.rows.map((row) => ({
        id: row.id,
        employeeId: row.employee_id,
        attendanceDate: row.attendance_date,
        originalClockIn: row.original_clock_in,
        originalClockOut: row.original_clock_out,
        requestedClockIn: row.requested_clock_in,
        requestedClockOut: row.requested_clock_out,
        reason: row.reason,
        status: row.status,
        rejectionReason: row.rejection_reason,
        employee: serializeEmployee(row),
        createdAt: row.created_at,
      })),
      total,
      page,
      limit,
    });
  } catch (err) {
    console.error("getCorrections error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching corrections." });
  }
}
 

// PUT /api/attendance/corrections/:id/approve
export async function approveCorrection(req, res) {
  const { id } = req.params;
  const { companyId, userId } = req.user;

  try {
    const existing = await db.query(
      `SELECT * FROM attendance_corrections WHERE id = $1 AND company_id = $2`,
      [id, companyId],
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Correction request not found." });
    }
    const corr = existing.rows[0];
    if (corr.status !== "pending") {
      return res
        .status(409)
        .json({ message: "This request has already been reviewed." });
    }

    // Apply the requested times onto the actual attendance record, if one
    // is linked; otherwise this just documents the approval.
    if (corr.attendance_id) {
      await db.query(
        `UPDATE attendance
         SET clock_in          = COALESCE($1, clock_in),
             clock_out         = COALESCE($2, clock_out),
             is_manually_edited = true,
             edited_by         = $3,
             edit_reason       = $4,
             updated_at        = NOW()
         WHERE id = $5`,
        [
          corr.requested_clock_in,
          corr.requested_clock_out,
          userId,
          corr.reason,
          corr.attendance_id,
        ],
      );
    }

    await db.query(
      `UPDATE attendance_corrections
       SET status = 'approved', reviewed_by = $1, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $2`,
      [userId, id],
    );

    return res.status(200).json({ message: "Correction approved." });
  } catch (err) {
    console.error("approveCorrection error:", err);
    return res
      .status(500)
      .json({ message: "Server error approving correction." });
  }
}

// PUT /api/attendance/corrections/:id/reject
// Body: { reason }
export async function rejectCorrection(req, res) {
  const { id } = req.params;
  const { companyId, userId } = req.user;
  const { reason } = req.body;

  if (!reason?.trim()) {
    return res.status(400).json({ message: "A rejection reason is required." });
  }

  try {
    const result = await db.query(
      `UPDATE attendance_corrections
       SET status = 'rejected', rejection_reason = $1, reviewed_by = $2, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $3 AND company_id = $4 AND status = 'pending'
       RETURNING id`,
      [reason.trim(), userId, id, companyId],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Correction request not found or already reviewed." });
    }
    return res.status(200).json({ message: "Correction rejected." });
  } catch (err) {
    console.error("rejectCorrection error:", err);
    return res
      .status(500)
      .json({ message: "Server error rejecting correction." });
  }
}

/* ══════════════════════════════════════════════════════════════
   OVERTIME
   ══════════════════════════════════════════════════════════════ */

// GET /api/attendance/overtime?status=pending&departmentId=...&page=1&limit=20
export async function getOvertime(req, res) {
  try {
    const { companyId } = req.user;
    const { status, departmentId } = req.query;
    const { page, limit, offset } = pagination(req);

    const conditions = ["t.company_id = $1"];
    const values = [companyId];
    let idx = 2;
    if (status && status !== "all") {
      conditions.push(`t.status = $${idx}`);
      values.push(status);
      idx++;
    }
    if (departmentId) {
      conditions.push(`e.department_id = $${idx}`);
      values.push(departmentId);
      idx++;
    }
    const where = conditions.join(" AND ");

    const countRes = await db.query(
      `SELECT COUNT(*) AS total
       FROM overtime_requests t
       LEFT JOIN employees e ON e.id = t.employee_id
       WHERE ${where}`,
      values,
    );
    const total = parseInt(countRes.rows[0].total, 10);

    const dataRes = await db.query(
      `SELECT t.*, e.first_name, e.last_name, d.name AS department_name
       FROM overtime_requests t
       ${EMPLOYEE_JOIN}
       WHERE ${where}
       ORDER BY t.date DESC, t.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset],
    );

    return res.status(200).json({
      rows: dataRes.rows.map((row) => ({
        id: row.id,
        employeeId: row.employee_id,
        date: row.date,
        hours: Number(row.hours),
        reason: row.reason,
        status: row.status,
        rejectionReason: row.rejection_reason,
        employee: serializeEmployee(row),
        createdAt: row.created_at,
      })),
      total,
      page,
      limit,
    });
  } catch (err) {
    console.error("getOvertime error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching overtime records." });
  }
}

// PUT /api/attendance/overtime/:id/approve
export async function approveOvertime(req, res) {
  const { id } = req.params;
  const { companyId, userId } = req.user;

  try {
    const result = await db.query(
      `UPDATE overtime_requests
       SET status = 'approved', reviewed_by = $1, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $2 AND company_id = $3 AND status = 'pending'
       RETURNING id`,
      [userId, id, companyId],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Overtime request not found or already reviewed." });
    }
    return res.status(200).json({ message: "Overtime approved." });
  } catch (err) {
    console.error("approveOvertime error:", err);
    return res
      .status(500)
      .json({ message: "Server error approving overtime." });
  }
}

// PUT /api/attendance/overtime/:id/reject
// Body: { reason }
export async function rejectOvertime(req, res) {
  const { id } = req.params;
  const { companyId, userId } = req.user;
  const { reason } = req.body;

  if (!reason?.trim()) {
    return res.status(400).json({ message: "A rejection reason is required." });
  }

  try {
    const result = await db.query(
      `UPDATE overtime_requests
       SET status = 'rejected', rejection_reason = $1, reviewed_by = $2, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $3 AND company_id = $4 AND status = 'pending'
       RETURNING id`,
      [reason.trim(), userId, id, companyId],
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Overtime request not found or already reviewed." });
    }
    return res.status(200).json({ message: "Overtime rejected." });
  } catch (err) {
    console.error("rejectOvertime error:", err);
    return res
      .status(500)
      .json({ message: "Server error rejecting overtime." });
  }
}
