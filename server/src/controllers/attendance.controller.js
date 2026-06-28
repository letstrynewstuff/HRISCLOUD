


// src/controllers/attendance.controller.js
//
// Endpoints:
//   POST /api/attendance/clock-in              → clockIn
//   POST /api/attendance/clock-out             → clockOut
//   POST /api/attendance/break-start           → breakStart
//   POST /api/attendance/break-end             → breakEnd
//   GET  /api/attendance                       → getAllAttendanceHandler  (HR / Manager)
//   GET  /api/attendance/today                 → getTodayAttendance       (HR / Manager)
//   GET  /api/attendance/me                    → getMyAttendance          (employee)
//   GET  /api/attendance/employee/:id          → getEmployeeAttendanceHandler (HR)
//   PUT  /api/attendance/:id/correct           → correctAttendance        (HR)
//   POST /api/attendance/shifts                → createShift              (HR)
//   PUT  /api/attendance/shifts/:id            → updateShift              (HR)
//   GET  /api/attendance/shifts                → getShiftsHandler         (any auth)
//
// Auth: authenticate (all) + requireRole("hr_admin"|"super_admin") for HR endpoints

import { validationResult } from "express-validator";
import {
  clockIn as dbClockIn,
  clockOut as dbClockOut,
  getTodayRecord,
  getAllAttendance,
  getTodaySnapshot,
  getEmployeeAttendance as dbGetEmployeeAttendance,
  getAttendanceById,
  correctAttendance as dbCorrectAttendance,
  createShift as dbCreateShift,
  updateShift as dbUpdateShift,
  getShifts,
  getShiftById,
} from "../models/Attendance.js";
import { getCompanySettings } from "../models/CompanySettings.model.js";
import { uploadToCloud } from "../utils/upload.js";
import { db } from "../config/db.js";

// ─── Internal helpers ─────────────────────────────────────────

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

function serializeRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    companyId: row.company_id,
    employeeId: row.employee_id,
    attendanceDate: row.attendance_date,
    clockIn: row.clock_in,
    clockOut: row.clock_out,
    clockInLocation:
      row.clock_in_lat != null
        ? { lat: row.clock_in_lat, lng: row.clock_in_lng }
        : null,
    clockInSelfie: row.clock_in_selfie,
    status: row.status,
    hoursWorked: row.hours_worked ? Number(row.hours_worked) : null,
    overtimeHours: row.overtime_hours ? Number(row.overtime_hours) : 0,
    // ── Break fields ──────────────────────────────────────────
    onBreak: row.on_break ?? false,
    breakStartedAt: row.break_started_at ?? null,
    totalBreakMinutes: row.total_break_minutes ?? 0,
    // ── Audit ─────────────────────────────────────────────────
    isManuallyEdited: row.is_manually_edited,
    editedBy: row.edited_by,
    editReason: row.edit_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // ── Joined fields (present on HR queries) ─────────────────
    employee: row.first_name
      ? {
          firstName: row.first_name,
          lastName: row.last_name,
          employeeId: row.employee_display_id,
          department: row.department_name,
          jobTitle: row.job_title,
        }
      : undefined,
  };
}

/** Parse 'HH:MM' → total minutes from midnight */
function parseTimeToMinutes(hhmm) {
  if (!hhmm) return null;
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + m;
}

/** Determine whether a clock-in Date is 'late' relative to workingHoursStart */
function resolveStatus(clockInDate, workingHoursStart, lateGraceMinutes = 15) {
  const threshMinutes = parseTimeToMinutes(workingHoursStart);
  if (!threshMinutes) return "present";
  const ciMinutes = clockInDate.getHours() * 60 + clockInDate.getMinutes();
  return ciMinutes > threshMinutes + lateGraceMinutes ? "late" : "present";
}

/** Resolve the active employee id for the authenticated user */
async function resolveEmployeeId(userId, companyId) {
  const result = await db.query(
    `SELECT id FROM employees
     WHERE user_id = $1
       AND company_id = $2
       AND LOWER(employment_status) = 'active'`,
    [userId, companyId]
  );
  return result.rows[0]?.id ?? null;
}

// ══════════════════════════════════════════════════════════════
// POST /api/attendance/clock-in
//
// Body (optional): { lat, lng }
// ══════════════════════════════════════════════════════════════
export async function clockIn(req, res) {
  console.log("JWT payload:", req.user);
  try {
    const { companyId, userId } = req.user;

    const employeeId = await resolveEmployeeId(userId, companyId);
    if (!employeeId) {
      return res.status(403).json({
        message:
          "No active employee profile found for your account. Please contact HR.",
      });
    }

    // Guard: already clocked in today?
    const existing = await getTodayRecord(employeeId);
    if (existing?.clock_in) {
      return res.status(409).json({
        message: "You have already clocked in today.",
        record: serializeRecord(existing),
      });
    }

    // Fetch company settings for late-check logic
    const settings = await getCompanySettings(companyId);
    const workStart = settings?.working_hours_start ?? "08:00";

    const clockInTime = new Date();
    const status = resolveStatus(clockInTime, workStart);

    // Optional selfie upload
    let selfieUrl = null;
    if (req.file) {
      const { url } = await uploadToCloud(req.file.buffer, {
        folder: `hriscloud/${companyId}/selfies`,
        publicId: `selfie_${employeeId}_${Date.now()}`,
        resourceType: "image",
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
        ],
      });
      selfieUrl = url;
    }

    const { lat, lng } = req.body;

    const record = await dbClockIn({
      companyId,
      employeeId,
      clockIn: clockInTime,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      selfieUrl,
      status,
    });

    return res.status(201).json({
      message:
        status === "late"
          ? `Clocked in at ${clockInTime.toLocaleTimeString()}. Marked as late.`
          : `Clocked in successfully at ${clockInTime.toLocaleTimeString()}.`,
      status,
      record: serializeRecord(record),
    });
  } catch (err) {
    console.error("clockIn error:", err);
    return res.status(500).json({ message: "Server error during clock-in." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/attendance/clock-out
//
// No body required.
// Auto-closes any open break before recording clock-out.
// ══════════════════════════════════════════════════════════════
export async function clockOut(req, res) {
  try {
    const { companyId, userId } = req.user;

    const employeeId = await resolveEmployeeId(userId, companyId);
    if (!employeeId) {
      return res
        .status(403)
        .json({ message: "No active employee profile found." });
    }

    const today = await getTodayRecord(employeeId);
    if (!today) {
      return res.status(409).json({ message: "You haven't clocked in today." });
    }
    if (today.clock_out) {
      return res.status(409).json({
        message: "You have already clocked out today.",
        record: serializeRecord(today),
      });
    }

    const clockOutTime = new Date();

    // ── Auto-close an open break if the employee forgot to end it ──
    if (today.on_break && today.break_started_at) {
      const autoBreakMins = Math.round(
        (clockOutTime - new Date(today.break_started_at)) / 60000
      );
      await db.query(
        `UPDATE attendance
         SET on_break            = FALSE,
             break_started_at    = NULL,
             total_break_minutes = total_break_minutes + $1,
             updated_at          = NOW()
         WHERE id = $2`,
        [autoBreakMins, today.id]
      );
    }

    // Fetch standard working hours from settings
    const settings = await getCompanySettings(companyId);
    const workStart = settings?.working_hours_start ?? "08:00";
    const workEnd = settings?.working_hours_end ?? "17:00";
    const [endH, endM] = workEnd.split(":").map(Number);
    const [startH, startM] = workStart.split(":").map(Number);
    const standardHours = (endH * 60 + endM - (startH * 60 + startM)) / 60;

    const updated = await dbClockOut(today.id, clockOutTime, standardHours);
    if (!updated) {
      return res
        .status(409)
        .json({ message: "Clock-out failed — record may already be closed." });
    }

    return res.status(200).json({
      message: `Clocked out at ${clockOutTime.toLocaleTimeString()}. Hours worked: ${updated.hours_worked}h.`,
      record: serializeRecord(updated),
    });
  } catch (err) {
    console.error("clockOut error:", err);
    return res.status(500).json({ message: "Server error during clock-out." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/attendance/break-start
//
// Rules:
//   • Must be clocked in today
//   • Must NOT already be on break
//   • Cannot call after clocking out
// ══════════════════════════════════════════════════════════════
export async function breakStart(req, res) {
  try {
    const { companyId, userId } = req.user;

    const employeeId = await resolveEmployeeId(userId, companyId);
    if (!employeeId) {
      return res
        .status(403)
        .json({ message: "No active employee profile found." });
    }

    const today = await getTodayRecord(employeeId);
    if (!today?.clock_in) {
      return res.status(409).json({ message: "You haven't clocked in today." });
    }
    if (today.clock_out) {
      return res.status(409).json({
        message: "You have already clocked out — cannot start a break.",
      });
    }
    if (today.on_break) {
      return res.status(409).json({ message: "You are already on a break." });
    }

    const now = new Date();

    const result = await db.query(
      `UPDATE attendance
       SET on_break         = TRUE,
           break_started_at = $1,
           updated_at       = NOW()
       WHERE id = $2 AND company_id = $3
       RETURNING *`,
      [now, today.id, companyId]
    );

    return res.status(200).json({
      message: `Break started at ${now.toLocaleTimeString()}.`,
      record: serializeRecord(result.rows[0]),
    });
  } catch (err) {
    console.error("breakStart error:", err);
    return res
      .status(500)
      .json({ message: "Server error during break start." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/attendance/break-end
//
// Rules:
//   • Must currently be on a break
//   • Calculates duration and adds it to total_break_minutes
// ══════════════════════════════════════════════════════════════
export async function breakEnd(req, res) {
  try {
    const { companyId, userId } = req.user;

    const employeeId = await resolveEmployeeId(userId, companyId);
    if (!employeeId) {
      return res
        .status(403)
        .json({ message: "No active employee profile found." });
    }

    const today = await getTodayRecord(employeeId);
    if (!today?.clock_in) {
      return res.status(409).json({ message: "You haven't clocked in today." });
    }
    if (!today.on_break) {
      return res
        .status(409)
        .json({ message: "You are not currently on a break." });
    }

    const now = new Date();
    const breakDurationMinutes = Math.round(
      (now - new Date(today.break_started_at)) / 60000
    );
    const newTotal = (today.total_break_minutes || 0) + breakDurationMinutes;

    const result = await db.query(
      `UPDATE attendance
       SET on_break            = FALSE,
           break_started_at    = NULL,
           total_break_minutes = $1,
           updated_at          = NOW()
       WHERE id = $2 AND company_id = $3
       RETURNING *`,
      [newTotal, today.id, companyId]
    );

    return res.status(200).json({
      message: `Break ended. Duration: ${breakDurationMinutes} min. Total break today: ${newTotal} min.`,
      breakDurationMinutes,
      totalBreakMinutes: newTotal,
      record: serializeRecord(result.rows[0]),
    });
  } catch (err) {
    console.error("breakEnd error:", err);
    return res.status(500).json({ message: "Server error during break end." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/attendance/today   [HR + Manager]
// ══════════════════════════════════════════════════════════════
export async function getTodayAttendance(req, res) {
  try {
    const { companyId, isHR, employeeId: managerEmpId } = req.user;

    if (isHR) {
      const snapshot = await getTodaySnapshot(companyId);
      return res.status(200).json({
        ...snapshot,
        lateEmployees: snapshot.lateEmployees.map(serializeRecord),
      });
    }

    // Manager path — scoped to direct reports only
    const today = new Date().toISOString().split("T")[0];

    const result = await db.query(
      `SELECT
         a.*,
         e.first_name,
         e.last_name,
         e.employee_code   AS employee_display_id,
         d.name            AS department_name,
         jr.title          AS job_title
       FROM attendance a
       JOIN employees e ON e.id = a.employee_id
       LEFT JOIN departments d  ON d.id  = e.department_id
       LEFT JOIN job_roles   jr ON jr.id = e.job_role_id
       WHERE a.company_id        = $1
         AND a.attendance_date   = $2
         AND e.manager_id        = $3
         AND e.employment_status NOT IN ('terminated','resigned')
       ORDER BY a.clock_in ASC NULLS LAST`,
      [companyId, today, managerEmpId]
    );

    const rows = result.rows;
    const present = rows.filter((r) => r.status === "present").length;
    const late = rows.filter((r) => r.status === "late").length;
    const lateEmployees = rows
      .filter((r) => r.status === "late")
      .map(serializeRecord);

    const teamTotal = await db.query(
      `SELECT COUNT(*) AS total
       FROM employees
       WHERE manager_id        = $1
         AND company_id        = $2
         AND employment_status NOT IN ('terminated','resigned')`,
      [managerEmpId, companyId]
    );
    const total = parseInt(teamTotal.rows[0].total, 10);

    return res.status(200).json({
      present,
      late,
      absent: Math.max(0, total - present - late),
      total,
      lateEmployees,
    });
  } catch (err) {
    console.error("getTodayAttendance error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/attendance   [HR + Manager]
// ══════════════════════════════════════════════════════════════
export async function getAllAttendanceHandler(req, res) {
  try {
    const { companyId, isHR, employeeId: managerEmpId } = req.user;

    if (isHR) {
      const result = await getAllAttendance(companyId, {
        date: req.query.date,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        status: req.query.status,
        departmentId: req.query.departmentId,
        employeeId: req.query.employeeId,
        search: req.query.search,
        page: parseInt(req.query.page ?? 1, 10),
        limit: parseInt(req.query.limit ?? 25, 10),
        sortBy: req.query.sortBy,
        sortDir: req.query.sortDir,
      });
      return res
        .status(200)
        .json({ ...result, rows: result.rows.map(serializeRecord) });
    }

    // Manager path — scoped to direct reports
    const result = await getAllAttendance(companyId, {
      date: req.query.date,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      status: req.query.status,
      employeeId: req.query.employeeId,
      search: req.query.search,
      page: parseInt(req.query.page ?? 1, 10),
      limit: parseInt(req.query.limit ?? 25, 10),
      sortBy: req.query.sortBy,
      sortDir: req.query.sortDir,
      managerEmpId,
    });

    return res
      .status(200)
      .json({ ...result, rows: result.rows.map(serializeRecord) });
  } catch (err) {
    console.error("getAllAttendance error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/attendance/me   [employee]
// Query params: startDate, endDate, status, page, limit
// ══════════════════════════════════════════════════════════════
export async function getMyAttendance(req, res) {
  try {
    const { companyId, userId } = req.user;

    const empResult = await db.query(
      `SELECT id FROM employees WHERE user_id = $1 AND company_id = $2`,
      [userId, companyId]
    );
    if (!empResult.rows[0]) {
      return res.status(404).json({ message: "Employee profile not found." });
    }
    const employeeId = empResult.rows[0].id;

    const result = await dbGetEmployeeAttendance(companyId, employeeId, {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      status: req.query.status,
      page: parseInt(req.query.page ?? 1, 10),
      limit: parseInt(req.query.limit ?? 31, 10),
    });

    return res.status(200).json({
      ...result,
      rows: result.rows.map(serializeRecord),
    });
  } catch (err) {
    console.error("getMyAttendance error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/attendance/employee/:id   [HR]
// ══════════════════════════════════════════════════════════════
export async function getEmployeeAttendanceHandler(req, res) {
  try {
    const { id: employeeId } = req.params;

    const result = await dbGetEmployeeAttendance(
      req.user.companyId,
      employeeId,
      {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        status: req.query.status,
        page: parseInt(req.query.page ?? 1, 10),
        limit: parseInt(req.query.limit ?? 31, 10),
      }
    );

    if (result.total === 0) {
      const empCheck = await db.query(
        `SELECT id FROM employees WHERE id = $1 AND company_id = $2`,
        [employeeId, req.user.companyId]
      );
      if (!empCheck.rows[0]) {
        return res.status(404).json({ message: "Employee not found." });
      }
    }

    return res.status(200).json({
      ...result,
      rows: result.rows.map(serializeRecord),
    });
  } catch (err) {
    console.error("getEmployeeAttendance error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/attendance/:id/correct   [HR]
// Body: { clockIn?, clockOut?, status?, hoursWorked?, overtimeHours?, editReason }
// ══════════════════════════════════════════════════════════════
export async function correctAttendance(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { id } = req.params;
  const { clockIn, clockOut, status, hoursWorked, overtimeHours, editReason } =
    req.body;

  try {
    const existing = await getAttendanceById(id, req.user.companyId);
    if (!existing) {
      return res
        .status(404)
        .json({ message: "Attendance record not found." });
    }

    const resolvedIn = clockIn ? new Date(clockIn) : existing.clock_in;
    const resolvedOut = clockOut ? new Date(clockOut) : existing.clock_out;

    if (resolvedIn && resolvedOut && resolvedOut <= resolvedIn) {
      return res
        .status(422)
        .json({ message: "clock_out must be after clock_in." });
    }

    const settings = await getCompanySettings(req.user.companyId);
    const workStart = settings?.working_hours_start ?? "08:00";
    const workEnd = settings?.working_hours_end ?? "17:00";
    const [endH, endM] = workEnd.split(":").map(Number);
    const [startH, startM] = workStart.split(":").map(Number);
    const standardHours = (endH * 60 + endM - (startH * 60 + startM)) / 60;

    const updated = await dbCorrectAttendance(
      id,
      req.user.companyId,
      {
        clockIn: clockIn ? new Date(clockIn) : undefined,
        clockOut: clockOut ? new Date(clockOut) : undefined,
        status,
        hoursWorked:
          hoursWorked !== undefined ? Number(hoursWorked) : undefined,
        overtimeHours:
          overtimeHours !== undefined ? Number(overtimeHours) : undefined,
        editReason,
        editedBy: req.user.userId,
      },
      standardHours
    );

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Attendance record not found or update failed." });
    }

    return res.status(200).json({
      message: "Attendance record corrected.",
      record: serializeRecord(updated),
    });
  } catch (err) {
    console.error("correctAttendance error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/attendance/shifts   [HR]
// Body: { name, description?, startTime, endTime, days[] }
// ══════════════════════════════════════════════════════════════
export async function createShift(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { name, description, startTime, endTime, days } = req.body;

  try {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    if (eh * 60 + em <= sh * 60 + sm) {
      return res
        .status(422)
        .json({ message: "endTime must be after startTime." });
    }

    const shift = await dbCreateShift(req.user.companyId, {
      name,
      description,
      startTime,
      endTime,
      days,
    });

    return res.status(201).json({ message: "Shift created.", shift });
  } catch (err) {
    console.error("createShift error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/attendance/shifts/:id   [HR]
// Body: { name?, description?, startTime?, endTime?, days?, isActive? }
// ══════════════════════════════════════════════════════════════
export async function updateShift(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { id: shiftId } = req.params;
  const { name, description, startTime, endTime, days, isActive } = req.body;

  try {
    const existing = await getShiftById(shiftId, req.user.companyId);
    if (!existing) {
      return res.status(404).json({ message: "Shift not found." });
    }

    if (startTime && endTime) {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      if (eh * 60 + em <= sh * 60 + sm) {
        return res
          .status(422)
          .json({ message: "endTime must be after startTime." });
      }
    }

    const updated = await dbUpdateShift(shiftId, req.user.companyId, {
      name,
      description,
      startTime,
      endTime,
      days,
      isActive,
    });

    return res.status(200).json({ message: "Shift updated.", shift: updated });
  } catch (err) {
    console.error("updateShift error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/attendance/shifts   [any authenticated user]
// ══════════════════════════════════════════════════════════════
export async function getShiftsHandler(req, res) {
  try {
    const shifts = await getShifts(req.user.companyId);
    return res.status(200).json({ shifts });
  } catch (err) {
    console.error("getShifts error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}