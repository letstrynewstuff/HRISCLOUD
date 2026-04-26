// // import postgres from "postgres";

// // const sql = postgres(process.env.DATABASE_URL);

// // /**
// //  * Clock In
// //  */
// // export const clockIn = async (data) => {
// //   const [attendance] = await sql`
// //     insert into attendance (
// //       company_id,
// //       employee_id,
// //       attendance_date,
// //       clock_in,
// //       clock_in_lat,
// //       clock_in_lng,
// //       clock_in_selfie,
// //       status
// //     )
// //     values (
// //       ${data.companyId},
// //       ${data.employeeId},
// //       ${data.date},
// //       ${data.clockIn},
// //       ${data.lat},
// //       ${data.lng},
// //       ${data.selfie},
// //       ${data.status ?? "present"}
// //     )
// //     returning *
// //   `;

// //   return attendance;
// // };

// // /**
// //  * Clock Out
// //  */
// // export const clockOut = async (
// //   employeeId,
// //   date,
// //   clockOutTime,
// //   hoursWorked,
// //   overtimeHours,
// // ) => {
// //   const [attendance] = await sql`
// //     update attendance
// //     set
// //       clock_out = ${clockOutTime},
// //       hours_worked = ${hoursWorked},
// //       overtime_hours = ${overtimeHours},
// //       updated_at = now()
// //     where employee_id = ${employeeId}
// //     and attendance_date = ${date}
// //     returning *
// //   `;

// //   return attendance;
// // };

// // /**
// //  * Get Attendance by Employee
// //  */
// // export const getAttendanceByEmployee = async (employeeId) => {
// //   return await sql`
// //     select *
// //     from attendance
// //     where employee_id = ${employeeId}
// //     order by attendance_date desc
// //   `;
// // };

// // /**
// //  * Manual Edit
// //  */
// // export const manuallyEditAttendance = async (id, data) => {
// //   const [attendance] = await sql`
// //     update attendance
// //     set
// //       clock_in = ${data.clockIn},
// //       clock_out = ${data.clockOut},
// //       hours_worked = ${data.hoursWorked},
// //       overtime_hours = ${data.overtimeHours},
// //       status = ${data.status},
// //       is_manually_edited = true,
// //       edited_by = ${data.editedBy},
// //       edit_reason = ${data.editReason},
// //       updated_at = now()
// //     where id = ${id}
// //     returning *
// //   `;

// //   return attendance;
// // };

// // src/models/Attendance.model.js
// //
// // All raw PostgreSQL queries for the attendance table and related shifts table.
// // Uses the shared db pool from src/config/db.js

// import { db } from "../config/db.js";

// // ─────────────────────────────────────────────────────────────
// // Helper: shared SELECT columns for attendance records
// // ─────────────────────────────────────────────────────────────
// const ATTENDANCE_COLS = `
//   a.id,
//   a.company_id,
//   a.employee_id,
//   a.attendance_date,
//   a.clock_in,
//   a.clock_out,
//   a.clock_in_lat,
//   a.clock_in_lng,
//   a.clock_in_selfie,
//   a.status,
//   a.hours_worked,
//   a.overtime_hours,
//   a.is_manually_edited,
//   a.edited_by,
//   a.edit_reason,
//   a.created_at,
//   a.updated_at,
//   e.first_name,
//   e.last_name,
//   e.employee_number,
//   d.name  AS department_name,
//   j.title AS job_title
// `;

// const ATTENDANCE_JOINS = `
//   FROM attendance a
//   JOIN employees e  ON e.id  = a.employee_id
//   LEFT JOIN departments d ON d.id = e.department_id
//   LEFT JOIN job_roles   j ON j.id = e.job_role_id
// `;

// // ─────────────────────────────────────────────────────────────
// // CLOCK IN
// // ─────────────────────────────────────────────────────────────

// /**
//  * Create today's attendance row and record the clock-in time.
//  * Determines status (present / late) based on company working_hours_start.
//  *
//  * @param {Object} data
//  * @param {string} data.companyId
//  * @param {string} data.employeeId
//  * @param {Date}   data.clockIn
//  * @param {number} [data.lat]
//  * @param {number} [data.lng]
//  * @param {string} [data.selfieUrl]
//  * @param {string} data.status  - 'present' | 'late'
//  * @returns attendance row
//  */
// export const clockIn = async (data) => {
//   const result = await db.query(
//     `INSERT INTO attendance (
//        company_id, employee_id, attendance_date,
//        clock_in, clock_in_lat, clock_in_lng, clock_in_selfie, status
//      )
//      VALUES ($1, $2, $3::date, $4, $5, $6, $7, $8)
//      ON CONFLICT (employee_id, attendance_date)
//      DO UPDATE SET
//        clock_in         = EXCLUDED.clock_in,
//        clock_in_lat     = EXCLUDED.clock_in_lat,
//        clock_in_lng     = EXCLUDED.clock_in_lng,
//        clock_in_selfie  = EXCLUDED.clock_in_selfie,
//        status           = EXCLUDED.status,
//        updated_at       = NOW()
//      RETURNING *`,
//     [
//       data.companyId,
//       data.employeeId,
//       data.clockIn,
//       data.clockIn,
//       data.lat    ?? null,
//       data.lng    ?? null,
//       data.selfieUrl ?? null,
//       data.status,
//     ]
//   );
//   return result.rows[0];
// };

// // ─────────────────────────────────────────────────────────────
// // CLOCK OUT
// // ─────────────────────────────────────────────────────────────

// /**
//  * Record clock-out time, compute hours_worked and overtime_hours.
//  * overtime_hours = MAX(0, hours_worked - standard_hours).
//  *
//  * @param {string} attendanceId
//  * @param {Date}   clockOut
//  * @param {number} standardHours  - from company settings (default 8)
//  * @returns updated attendance row
//  */
// export const clockOut = async (attendanceId, clockOut, standardHours = 8) => {
//   const result = await db.query(
//     `UPDATE attendance
//      SET
//        clock_out      = $1,
//        hours_worked   = ROUND(
//                           EXTRACT(EPOCH FROM ($1 - clock_in)) / 3600.0, 2
//                         ),
//        overtime_hours = GREATEST(
//                           0,
//                           ROUND(
//                             EXTRACT(EPOCH FROM ($1 - clock_in)) / 3600.0, 2
//                           ) - $2
//                         ),
//        status         = CASE
//                           WHEN status = 'present' THEN 'present'
//                           WHEN status = 'late'    THEN 'late'
//                           ELSE status
//                         END,
//        updated_at     = NOW()
//      WHERE id = $3
//        AND clock_out IS NULL   -- prevent double clock-out
//      RETURNING *`,
//     [clockOut, standardHours, attendanceId]
//   );
//   return result.rows[0]; // undefined if already clocked out
// };

// // ─────────────────────────────────────────────────────────────
// // FIND TODAY'S RECORD
// // ─────────────────────────────────────────────────────────────

// /**
//  * Get today's attendance row for an employee (for clock-in/out guards).
//  */
// export const getTodayRecord = async (employeeId) => {
//   const result = await db.query(
//     `SELECT * FROM attendance
//      WHERE employee_id   = $1
//        AND attendance_date = CURRENT_DATE`,
//     [employeeId]
//   );
//   return result.rows[0];
// };

// // ─────────────────────────────────────────────────────────────
// // GET ALL ATTENDANCE (HR / ADMIN VIEW)
// // ─────────────────────────────────────────────────────────────

// /**
//  * Paginated, filtered list of all attendance records for a company.
//  *
//  * @param {string} companyId
//  * @param {Object} filters
//  * @param {string} [filters.date]         - exact date YYYY-MM-DD
//  * @param {string} [filters.startDate]
//  * @param {string} [filters.endDate]
//  * @param {string} [filters.status]       - present|absent|late|...
//  * @param {string} [filters.departmentId]
//  * @param {string} [filters.employeeId]
//  * @param {string} [filters.search]       - name / employee_number search
//  * @param {number} [filters.page]         - 1-based
//  * @param {number} [filters.limit]        - rows per page
//  * @param {string} [filters.sortBy]       - column name
//  * @param {string} [filters.sortDir]      - ASC | DESC
//  * @returns { rows, total, page, totalPages }
//  */
// export const getAllAttendance = async (companyId, filters = {}) => {
//   const {
//     date,
//     startDate,
//     endDate,
//     status,
//     departmentId,
//     employeeId,
//     search,
//     page    = 1,
//     limit   = 25,
//     sortBy  = "attendance_date",
//     sortDir = "DESC",
//   } = filters;

//   // Build WHERE clauses dynamically
//   const conditions = ["a.company_id = $1"];
//   const params     = [companyId];
//   let   idx        = 2;

//   if (date) {
//     conditions.push(`a.attendance_date = $${idx++}`);
//     params.push(date);
//   } else {
//     if (startDate) { conditions.push(`a.attendance_date >= $${idx++}`); params.push(startDate); }
//     if (endDate)   { conditions.push(`a.attendance_date <= $${idx++}`); params.push(endDate); }
//   }

//   if (status)       { conditions.push(`a.status = $${idx++}`);            params.push(status); }
//   if (employeeId)   { conditions.push(`a.employee_id = $${idx++}`);       params.push(employeeId); }
//   if (departmentId) { conditions.push(`e.department_id = $${idx++}`);     params.push(departmentId); }

//   if (search) {
//     conditions.push(
//       `(e.first_name ILIKE $${idx} OR e.last_name ILIKE $${idx} OR e.employee_number ILIKE $${idx})`
//     );
//     params.push(`%${search}%`);
//     idx++;
//   }

//   const WHERE = `WHERE ${conditions.join(" AND ")}`;

//   // Whitelist sort columns to prevent SQL injection
//   const ALLOWED_SORT = ["attendance_date", "clock_in", "clock_out", "hours_worked", "status", "created_at"];
//   const orderCol = ALLOWED_SORT.includes(sortBy) ? `a.${sortBy}` : "a.attendance_date";
//   const orderDir = sortDir.toUpperCase() === "ASC" ? "ASC" : "DESC";

//   const offset = (page - 1) * limit;

//   // Count query (no LIMIT/OFFSET)
//   const countResult = await db.query(
//     `SELECT COUNT(*) ${ATTENDANCE_JOINS} ${WHERE}`,
//     params
//   );
//   const total = parseInt(countResult.rows[0].count, 10);

//   // Data query
//   const dataResult = await db.query(
//     `SELECT ${ATTENDANCE_COLS}
//      ${ATTENDANCE_JOINS}
//      ${WHERE}
//      ORDER BY ${orderCol} ${orderDir}
//      LIMIT $${idx} OFFSET $${idx + 1}`,
//     [...params, limit, offset]
//   );

//   return {
//     rows:       dataResult.rows,
//     total,
//     page:       Number(page),
//     limit:      Number(limit),
//     totalPages: Math.ceil(total / limit),
//   };
// };

// // ─────────────────────────────────────────────────────────────
// // TODAY'S SNAPSHOT (real-time HR view)
// // ─────────────────────────────────────────────────────────────

// /**
//  * Real-time summary: how many employees are present, absent, late, etc.
//  * Also returns a list of late employees for the widget.
//  *
//  * @param {string} companyId
//  * @returns { summary: {present,absent,late,halfDay,onLeave}, lateEmployees[] }
//  */
// export const getTodaySnapshot = async (companyId) => {
//   // 1. Status counts
//   const summaryResult = await db.query(
//     `SELECT
//        status,
//        COUNT(*) AS count
//      FROM attendance
//      WHERE company_id    = $1
//        AND attendance_date = CURRENT_DATE
//      GROUP BY status`,
//     [companyId]
//   );

//   const summary = { present: 0, absent: 0, late: 0, halfDay: 0, onLeave: 0, holiday: 0 };
//   for (const row of summaryResult.rows) {
//     const key = row.status === "half_day" ? "halfDay"
//       : row.status === "on_leave" ? "onLeave"
//       : row.status;
//     if (key in summary) summary[key] = parseInt(row.count, 10);
//   }

//   // 2. Active employees total (for "absent" calculation when no record exists)
//   const totalResult = await db.query(
//     `SELECT COUNT(*) FROM employees WHERE company_id = $1 AND is_active = true`,
//     [companyId]
//   );
//   summary.totalActive = parseInt(totalResult.rows[0].count, 10);
//   // Employees with no record today are effectively absent
//   const recorded = Object.values(summary).reduce((s, v) => (typeof v === "number" ? s + v : s), 0) - summary.totalActive;
//   summary.noRecord = Math.max(0, summary.totalActive - (summaryResult.rows.reduce((s, r) => s + parseInt(r.count, 10), 0)));

//   // 3. Late employees list
//   const lateResult = await db.query(
//     `SELECT ${ATTENDANCE_COLS}
//      ${ATTENDANCE_JOINS}
//      WHERE a.company_id    = $1
//        AND a.attendance_date = CURRENT_DATE
//        AND a.status         = 'late'
//      ORDER BY a.clock_in ASC
//      LIMIT 20`,
//     [companyId]
//   );

//   // 4. Currently clocked-in employees
//   const clockedInResult = await db.query(
//     `SELECT COUNT(*) FROM attendance
//      WHERE company_id    = $1
//        AND attendance_date = CURRENT_DATE
//        AND clock_in IS NOT NULL
//        AND clock_out IS NULL`,
//     [companyId]
//   );
//   summary.currentlyClockedIn = parseInt(clockedInResult.rows[0].count, 10);

//   return {
//     date:          new Date().toISOString().slice(0, 10),
//     summary,
//     lateEmployees: lateResult.rows,
//   };
// };

// // ─────────────────────────────────────────────────────────────
// // SINGLE EMPLOYEE HISTORY
// // ─────────────────────────────────────────────────────────────

// /**
//  * Paginated attendance history for one employee.
//  * Includes monthly summary stats.
//  */
// export const getEmployeeAttendance = async (companyId, employeeId, filters = {}) => {
//   const {
//     startDate,
//     endDate,
//     status,
//     page  = 1,
//     limit = 31, // default: one month of records
//   } = filters;

//   const conditions = ["a.company_id = $1", "a.employee_id = $2"];
//   const params     = [companyId, employeeId];
//   let   idx        = 3;

//   if (startDate) { conditions.push(`a.attendance_date >= $${idx++}`); params.push(startDate); }
//   if (endDate)   { conditions.push(`a.attendance_date <= $${idx++}`); params.push(endDate); }
//   if (status)    { conditions.push(`a.status = $${idx++}`);           params.push(status); }

//   const WHERE  = `WHERE ${conditions.join(" AND ")}`;
//   const offset = (page - 1) * limit;

//   const [countRes, dataRes, statsRes] = await Promise.all([
//     // Total count
//     db.query(`SELECT COUNT(*) ${ATTENDANCE_JOINS} ${WHERE}`, params),

//     // Paginated rows
//     db.query(
//       `SELECT ${ATTENDANCE_COLS}
//        ${ATTENDANCE_JOINS}
//        ${WHERE}
//        ORDER BY a.attendance_date DESC
//        LIMIT $${idx} OFFSET $${idx + 1}`,
//       [...params, limit, offset]
//     ),

//     // Aggregate stats for the filtered period
//     db.query(
//       `SELECT
//          COUNT(*)                                          AS total_days,
//          COUNT(*) FILTER (WHERE status = 'present')       AS present,
//          COUNT(*) FILTER (WHERE status = 'absent')        AS absent,
//          COUNT(*) FILTER (WHERE status = 'late')          AS late,
//          COUNT(*) FILTER (WHERE status = 'half_day')      AS half_day,
//          COUNT(*) FILTER (WHERE status = 'on_leave')      AS on_leave,
//          COALESCE(SUM(hours_worked),   0)                 AS total_hours,
//          COALESCE(SUM(overtime_hours), 0)                 AS total_overtime,
//          ROUND(
//            100.0 * COUNT(*) FILTER (WHERE status IN ('present','late'))
//            / NULLIF(COUNT(*), 0), 1
//          )                                                AS attendance_rate
//        ${ATTENDANCE_JOINS}
//        ${WHERE}`,
//       params
//     ),
//   ]);

//   const total = parseInt(countRes.rows[0].count, 10);

//   return {
//     rows:       dataRes.rows,
//     stats:      statsRes.rows[0],
//     total,
//     page:       Number(page),
//     limit:      Number(limit),
//     totalPages: Math.ceil(total / limit),
//   };
// };

// // ─────────────────────────────────────────────────────────────
// // FIND ATTENDANCE RECORD BY ID
// // ─────────────────────────────────────────────────────────────

// export const getAttendanceById = async (id, companyId) => {
//   const result = await db.query(
//     `SELECT ${ATTENDANCE_COLS}
//      ${ATTENDANCE_JOINS}
//      WHERE a.id = $1 AND a.company_id = $2`,
//     [id, companyId]
//   );
//   return result.rows[0];
// };

// // ─────────────────────────────────────────────────────────────
// // MANUAL CORRECTION (HR)
// // ─────────────────────────────────────────────────────────────

// /**
//  * HR corrects an attendance record.
//  * Recalculates hours_worked and overtime_hours after edit.
//  *
//  * @param {string} id           - attendance record UUID
//  * @param {string} companyId
//  * @param {Object} data
//  * @param {string} [data.clockIn]
//  * @param {string} [data.clockOut]
//  * @param {string} [data.status]
//  * @param {number} [data.hoursWorked]    - override computed value
//  * @param {number} [data.overtimeHours]
//  * @param {string} data.editReason
//  * @param {string} data.editedBy        - HR user UUID
//  * @param {number} [standardHours]
//  * @returns updated attendance row
//  */
// export const correctAttendance = async (id, companyId, data, standardHours = 8) => {
//   const result = await db.query(
//     `UPDATE attendance
//      SET
//        clock_in           = COALESCE($1, clock_in),
//        clock_out          = COALESCE($2, clock_out),
//        status             = COALESCE($3, status),
//        hours_worked       = CASE
//                               WHEN $4::numeric IS NOT NULL THEN $4::numeric
//                               WHEN $1 IS NOT NULL OR $2 IS NOT NULL THEN
//                                 ROUND(
//                                   EXTRACT(EPOCH FROM (
//                                     COALESCE($2, clock_out) - COALESCE($1, clock_in)
//                                   )) / 3600.0, 2
//                                 )
//                               ELSE hours_worked
//                             END,
//        overtime_hours     = CASE
//                               WHEN $5::numeric IS NOT NULL THEN $5::numeric
//                               WHEN $1 IS NOT NULL OR $2 IS NOT NULL THEN
//                                 GREATEST(0,
//                                   ROUND(
//                                     EXTRACT(EPOCH FROM (
//                                       COALESCE($2, clock_out) - COALESCE($1, clock_in)
//                                     )) / 3600.0, 2
//                                   ) - $6
//                                 )
//                               ELSE overtime_hours
//                             END,
//        is_manually_edited = true,
//        edited_by          = $7,
//        edit_reason        = $8,
//        updated_at         = NOW()
//      WHERE id = $9 AND company_id = $10
//      RETURNING *`,
//     [
//       data.clockIn       ?? null,
//       data.clockOut      ?? null,
//       data.status        ?? null,
//       data.hoursWorked   ?? null,
//       data.overtimeHours ?? null,
//       standardHours,
//       data.editedBy,
//       data.editReason,
//       id,
//       companyId,
//     ]
//   );
//   return result.rows[0];
// };

// // ─────────────────────────────────────────────────────────────
// // BULK MARK ABSENT (run by a daily cron job)
// // ─────────────────────────────────────────────────────────────

// /**
//  * For all active employees who have no attendance row for today,
//  * insert an 'absent' record.
//  * Called by a scheduled job at end-of-day.
//  *
//  * @param {string} companyId
//  * @returns number of rows inserted
//  */
// export const bulkMarkAbsent = async (companyId) => {
//   const result = await db.query(
//     `INSERT INTO attendance (company_id, employee_id, attendance_date, status)
//      SELECT
//        e.company_id,
//        e.id,
//        CURRENT_DATE,
//        'absent'
//      FROM employees e
//      WHERE e.company_id = $1
//        AND e.is_active  = true
//        AND NOT EXISTS (
//          SELECT 1 FROM attendance a
//          WHERE a.employee_id   = e.id
//            AND a.attendance_date = CURRENT_DATE
//        )
//      ON CONFLICT (employee_id, attendance_date) DO NOTHING
//      RETURNING id`,
//     [companyId]
//   );
//   return result.rowCount;
// };

// // ─────────────────────────────────────────────────────────────
// // SHIFTS
// // ─────────────────────────────────────────────────────────────
// //
// // Schema assumed:
// //   CREATE TABLE shifts (
// //     id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
// //     company_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
// //     name         TEXT NOT NULL,              -- e.g. "Morning Shift"
// // --     description  TEXT,
// //     start_time   TIME NOT NULL,              -- e.g. '08:00'
// //     end_time     TIME NOT NULL,              -- e.g. '16:00'
// //     days         TEXT[] NOT NULL,            -- {Mon,Tue,Wed,Thu,Fri}
// //     is_active    BOOLEAN NOT NULL DEFAULT true,
// //     created_at   TIMESTAMPTZ DEFAULT NOW(),
// //     updated_at   TIMESTAMPTZ DEFAULT NOW()
// //   );

// /**
//  * Create a new shift definition.
//  */
// export const createShift = async (companyId, data) => {
//   const result = await db.query(
//     `INSERT INTO shifts (company_id, name, description, start_time, end_time, days)
//      VALUES ($1, $2, $3, $4, $5, $6)
//      RETURNING *`,
//     [
//       companyId,
//       data.name,
//       data.description ?? null,
//       data.startTime,
//       data.endTime,
//       data.days,
//     ]
//   );
//   return result.rows[0];
// };

// /**
//  * Update a shift.
//  */
// export const updateShift = async (shiftId, companyId, data) => {
//   const result = await db.query(
//     `UPDATE shifts
//      SET
//        name        = COALESCE($1, name),
//        description = COALESCE($2, description),
//        start_time  = COALESCE($3, start_time),
//        end_time    = COALESCE($4, end_time),
//        days        = COALESCE($5, days),
//        is_active   = COALESCE($6, is_active),
//        updated_at  = NOW()
//      WHERE id = $7 AND company_id = $8
//      RETURNING *`,
//     [
//       data.name        ?? null,
//       data.description ?? null,
//       data.startTime   ?? null,
//       data.endTime     ?? null,
//       data.days        ?? null,
//       data.isActive    ?? null,
//       shiftId,
//       companyId,
//     ]
//   );
//   return result.rows[0];
// };

// /**
//  * List all shifts for a company.
//  */
// export const getShifts = async (companyId) => {
//   const result = await db.query(
//     `SELECT * FROM shifts
//      WHERE company_id = $1
//      ORDER BY start_time ASC`,
//     [companyId]
//   );
//   return result.rows;
// };

// /**
//  * Find a shift by ID.
//  */
// export const getShiftById = async (shiftId, companyId) => {
//   const result = await db.query(
//     `SELECT * FROM shifts WHERE id = $1 AND company_id = $2`,
//     [shiftId, companyId]
//   );
//   return result.rows[0];
// };

import { db } from "../config/db.js";

// ─────────────────────────────────────────────────────────────
// Helper: shared SELECT columns for attendance records
// ─────────────────────────────────────────────────────────────
const ATTENDANCE_COLS = `
  a.id,
  a.company_id,
  a.employee_id,
  a.attendance_date,
  a.clock_in,
  a.clock_out,
  a.clock_in_lat,
  a.clock_in_lng,
  a.clock_in_selfie,
  a.status,
  a.hours_worked,
  a.overtime_hours,
  a.is_manually_edited,
  a.edited_by,
  a.edit_reason,
  a.created_at,
  a.updated_at,
  e.first_name,
  e.last_name,
 e.employee_code AS employee_display_id,
  d.name  AS department_name,
  j.title AS job_title
`;

const ATTENDANCE_JOINS = `
  FROM attendance a
  JOIN employees e  ON e.id  = a.employee_id
  LEFT JOIN departments d ON d.id = e.department_id
  LEFT JOIN job_roles   j ON j.id = e.job_role_id
`;

// ─────────────────────────────────────────────────────────────
// CLOCK IN
// ─────────────────────────────────────────────────────────────
export const clockIn = async (data) => {
  const result = await db.query(
    `INSERT INTO attendance (
       company_id, employee_id, attendance_date,
       clock_in, clock_in_lat, clock_in_lng, clock_in_selfie, status
     )
     VALUES ($1, $2, $3::date, $4, $5, $6, $7, $8)
     ON CONFLICT (employee_id, attendance_date)
     DO UPDATE SET
       clock_in         = EXCLUDED.clock_in,
       clock_in_lat     = EXCLUDED.clock_in_lat,
       clock_in_lng     = EXCLUDED.clock_in_lng,
       clock_in_selfie  = EXCLUDED.clock_in_selfie,
       status           = EXCLUDED.status,
       updated_at       = NOW()
     RETURNING *`,
    [
      data.companyId,
      data.employeeId,
      data.clockIn,
      data.clockIn,
      data.lat ?? null,
      data.lng ?? null,
      data.selfieUrl ?? null,
      data.status,
    ],
  );
  return result.rows[0];
};

// ─────────────────────────────────────────────────────────────
// CLOCK OUT
// ─────────────────────────────────────────────────────────────
export const clockOut = async (attendanceId, clockOut, standardHours = 8) => {
  const result = await db.query(
    `UPDATE attendance
     SET
       clock_out      = $1,
       hours_worked   = ROUND(
                          EXTRACT(EPOCH FROM ($1 - clock_in)) / 3600.0, 2
                        ),
       overtime_hours = GREATEST(
                          0,
                          ROUND(
                            EXTRACT(EPOCH FROM ($1 - clock_in)) / 3600.0, 2
                          ) - $2
                        ),
       status         = CASE
                          WHEN status = 'present' THEN 'present'
                          WHEN status = 'late'    THEN 'late'
                          ELSE status
                        END,
       updated_at     = NOW()
     WHERE id = $3
       AND clock_out IS NULL
     RETURNING *`,
    [clockOut, standardHours, attendanceId],
  );
  return result.rows[0];
};

// ─────────────────────────────────────────────────────────────
// FIND TODAY'S RECORD
// ─────────────────────────────────────────────────────────────
export const getTodayRecord = async (employeeId) => {
  const result = await db.query(
    `SELECT * FROM attendance
     WHERE employee_id   = $1
       AND attendance_date = CURRENT_DATE`,
    [employeeId],
  );
  return result.rows[0];
};

// ─────────────────────────────────────────────────────────────
// GET ALL ATTENDANCE (HR / ADMIN VIEW)
// ─────────────────────────────────────────────────────────────
// export const getAllAttendance = async (companyId, filters = {}) => {
//   const {
//     date,
//     startDate,
//     endDate,
//     status,
//     departmentId,
//     employeeId,
//     search,
//     page = 1,
//     limit = 25,
//     sortBy = "attendance_date",
//     sortDir = "DESC",
//   } = filters;

//   const conditions = ["a.company_id = $1"];
//   const params = [companyId];
//   let idx = 2;

//   if (date) {
//     conditions.push(`a.attendance_date = $${idx++}`);
//     params.push(date);
//   } else {
//     if (startDate) {
//       conditions.push(`a.attendance_date >= $${idx++}`);
//       params.push(startDate);
//     }
//     if (endDate) {
//       conditions.push(`a.attendance_date <= $${idx++}`);
//       params.push(endDate);
//     }
//   }

//   if (status) {
//     conditions.push(`a.status = $${idx++}`);
//     params.push(status);
//   }
//   if (employeeId) {
//     conditions.push(`a.employee_id = $${idx++}`);
//     params.push(employeeId);
//   }
//   if (departmentId) {
//     conditions.push(`e.department_id = $${idx++}`);
//     params.push(departmentId);
//   }

//   if (search) {
//     // SEARCH CHANGED TO e.employee_id
//     conditions.push(
//       `(e.first_name ILIKE $${idx} OR e.last_name ILIKE $${idx} OR e.employee_id ILIKE $${idx})`,
//     );
//     params.push(`%${search}%`);
//     idx++;
//   }

//   const WHERE = `WHERE ${conditions.join(" AND ")}`;
//   const ALLOWED_SORT = [
//     "attendance_date",
//     "clock_in",
//     "clock_out",
//     "hours_worked",
//     "status",
//     "created_at",
//   ];
//   const orderCol = ALLOWED_SORT.includes(sortBy)
//     ? `a.${sortBy}`
//     : "a.attendance_date";
//   const orderDir = sortDir.toUpperCase() === "ASC" ? "ASC" : "DESC";

//   const offset = (page - 1) * limit;

//   const countResult = await db.query(
//     `SELECT COUNT(*) ${ATTENDANCE_JOINS} ${WHERE}`,
//     params,
//   );
//   const total = parseInt(countResult.rows[0].count, 10);

//   const dataResult = await db.query(
//     `SELECT ${ATTENDANCE_COLS}
//      ${ATTENDANCE_JOINS}
//      ${WHERE}
//      ORDER BY ${orderCol} ${orderDir}
//      LIMIT $${idx} OFFSET $${idx + 1}`,
//     [...params, limit, offset],
//   );

//   return {
//     rows: dataResult.rows,
//     total,
//     page: Number(page),
//     limit: Number(limit),
//     totalPages: Math.ceil(total / limit),
//   };
// };

// // ─────────────────────────────────────────────────────────────
// // TODAY'S SNAPSHOT
// // ─────────────────────────────────────────────────────────────
// export const getTodaySnapshot = async (companyId) => {
//   const summaryResult = await db.query(
//     `SELECT status, COUNT(*) AS count FROM attendance
//      WHERE company_id = $1 AND attendance_date = CURRENT_DATE
//      GROUP BY status`,
//     [companyId],
//   );

//   const summary = {
//     present: 0,
//     absent: 0,
//     late: 0,
//     halfDay: 0,
//     onLeave: 0,
//     holiday: 0,
//   };
//   for (const row of summaryResult.rows) {
//     const key =
//       row.status === "half_day"
//         ? "halfDay"
//         : row.status === "on_leave"
//           ? "onLeave"
//           : row.status;
//     if (key in summary) summary[key] = parseInt(row.count, 10);
//   }

//   // 2. Active employees total
//   const totalResult = await db.query(
//     `SELECT COUNT(*) FROM employees WHERE company_id = $1`, // Removed "AND is_active = true"
//     [companyId],
//   );
//   summary.totalActive = parseInt(totalResult.rows[0].count, 10);
//   summary.noRecord = Math.max(
//     0,
//     summary.totalActive -
//       summaryResult.rows.reduce((s, r) => s + parseInt(r.count, 10), 0),
//   );

//   const lateResult = await db.query(
//     `SELECT ${ATTENDANCE_COLS} ${ATTENDANCE_JOINS}
//      WHERE a.company_id = $1 AND a.attendance_date = CURRENT_DATE AND a.status = 'late'
//      ORDER BY a.clock_in ASC LIMIT 20`,
//     [companyId],
//   );

//   const clockedInResult = await db.query(
//     `SELECT COUNT(*) FROM attendance
//      WHERE company_id = $1 AND attendance_date = CURRENT_DATE AND clock_in IS NOT NULL AND clock_out IS NULL`,
//     [companyId],
//   );
//   summary.currentlyClockedIn = parseInt(clockedInResult.rows[0].count, 10);

//   return {
//     date: new Date().toISOString().slice(0, 10),
//     summary,
//     lateEmployees: lateResult.rows,
//   };
// };;

export const getAllAttendance = async (companyId, filters = {}) => {
  const {
    date,
    startDate,
    endDate,
    status,
    departmentId,
    employeeId,
    search,
    page = 1,
    limit = 25,
    sortBy = "attendance_date",
    sortDir = "DESC",
  } = filters;
  const conditions = ["a.company_id = $1"];
  const params = [companyId];
  let idx = 2;

  if (date) {
    conditions.push(`a.attendance_date = $${idx++}`);
    params.push(date);
  } else {
    if (startDate) {
      conditions.push(`a.attendance_date >= $${idx++}`);
      params.push(startDate);
    }
    if (endDate) {
      conditions.push(`a.attendance_date <= $${idx++}`);
      params.push(endDate);
    }
  }

  if (status) {
    conditions.push(`a.status = $${idx++}`);
    params.push(status);
  }
  if (employeeId) {
    conditions.push(`a.employee_id = $${idx++}`);
    params.push(employeeId);
  }
  if (departmentId) {
    conditions.push(`e.department_id = $${idx++}`);
    params.push(departmentId);
  }

  if (search) {
    // UPDATED: Search against employee_code instead of employee_id/number
    conditions.push(
      `(e.first_name ILIKE $${idx} OR e.last_name ILIKE $${idx} OR e.employee_code ILIKE $${idx})`,
    );
    params.push(`%${search}%`);
    idx++;
  }

  const WHERE = `WHERE ${conditions.join(" AND ")}`;
  const orderCol = ["attendance_date", "clock_in", "status"].includes(sortBy)
    ? `a.${sortBy}`
    : "a.attendance_date";
  const offset = (page - 1) * limit;

  const countRes = await db.query(
    `SELECT COUNT(*) ${ATTENDANCE_JOINS} ${WHERE}`,
    params,
  );
  const dataRes = await db.query(
    `SELECT ${ATTENDANCE_COLS} ${ATTENDANCE_JOINS} ${WHERE} ORDER BY ${orderCol} ${sortDir} LIMIT $${idx} OFFSET $${idx + 1}`,
    [...params, limit, offset],
  );

  return {
    rows: dataRes.rows,
    total: parseInt(countRes.rows[0].count),
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(parseInt(countRes.rows[0].count) / limit),
  };
};

export const getTodaySnapshot = async (companyId) => {
  // 1. Status Counts
  const summaryRes = await db.query(
    `SELECT status, COUNT(*) AS count FROM attendance WHERE company_id = $1 AND attendance_date = CURRENT_DATE GROUP BY status`,
    [companyId],
  );

  const summary = {
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    onLeave: 0,
    holiday: 0,
  };
  summaryRes.rows.forEach((r) => {
    const key =
      r.status === "half_day"
        ? "halfDay"
        : r.status === "on_leave"
          ? "onLeave"
          : r.status;
    if (key in summary) summary[key] = parseInt(r.count);
  });

  // 2. Total Active Employees - UPDATED: Using employment_status = 'active'
  const totalRes = await db.query(
    `SELECT COUNT(*) FROM employees WHERE company_id = $1 AND employment_status = 'active'`,
    [companyId],
  );

  summary.totalActive = parseInt(totalRes.rows[0].count);
  summary.noRecord = Math.max(
    0,
    summary.totalActive -
      summaryRes.rows.reduce((s, r) => s + parseInt(r.count), 0),
  );

  // 3. Late list
  const lateRes = await db.query(
    `SELECT ${ATTENDANCE_COLS} ${ATTENDANCE_JOINS} WHERE a.company_id = $1 AND a.attendance_date = CURRENT_DATE AND a.status = 'late' ORDER BY a.clock_in ASC LIMIT 20`,
    [companyId],
  );

  return {
    date: new Date().toISOString().split("T")[0],
    summary,
    lateEmployees: lateRes.rows,
  };
};

// ─────────────────────────────────────────────────────────────
// SINGLE EMPLOYEE HISTORY
// ─────────────────────────────────────────────────────────────
export const getEmployeeAttendance = async (
  companyId,
  employeeId,
  filters = {},
) => {
  const { startDate, endDate, status, page = 1, limit = 31 } = filters;
  const conditions = ["a.company_id = $1", "a.employee_id = $2"];
  const params = [companyId, employeeId];
  let idx = 3;

  if (startDate) {
    conditions.push(`a.attendance_date >= $${idx++}`);
    params.push(startDate);
  }
  if (endDate) {
    conditions.push(`a.attendance_date <= $${idx++}`);
    params.push(endDate);
  }
  if (status) {
    conditions.push(`a.status = $${idx++}`);
    params.push(status);
  }

  const WHERE = `WHERE ${conditions.join(" AND ")}`;
  const offset = (page - 1) * limit;

  const [countRes, dataRes, statsRes] = await Promise.all([
    db.query(`SELECT COUNT(*) ${ATTENDANCE_JOINS} ${WHERE}`, params),
    db.query(
      `SELECT ${ATTENDANCE_COLS} ${ATTENDANCE_JOINS} ${WHERE} ORDER BY a.attendance_date DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, offset],
    ),
    db.query(
      `SELECT COUNT(*) AS total_days, COUNT(*) FILTER (WHERE status = 'present') AS present, COUNT(*) FILTER (WHERE status = 'absent') AS absent, COUNT(*) FILTER (WHERE status = 'late') AS late, COUNT(*) FILTER (WHERE status = 'half_day') AS half_day, COUNT(*) FILTER (WHERE status = 'on_leave') AS on_leave, COALESCE(SUM(hours_worked), 0) AS total_hours, COALESCE(SUM(overtime_hours), 0) AS total_overtime, ROUND(100.0 * COUNT(*) FILTER (WHERE status IN ('present','late')) / NULLIF(COUNT(*), 0), 1) AS attendance_rate ${ATTENDANCE_JOINS} ${WHERE}`,
      params,
    ),
  ]);

  const total = parseInt(countRes.rows[0].count, 10);
  return {
    rows: dataRes.rows,
    stats: statsRes.rows[0],
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  };
};

// ─────────────────────────────────────────────────────────────
// FIND ATTENDANCE RECORD BY ID
// ─────────────────────────────────────────────────────────────
export const getAttendanceById = async (id, companyId) => {
  const result = await db.query(
    `SELECT ${ATTENDANCE_COLS} ${ATTENDANCE_JOINS} WHERE a.id = $1 AND a.company_id = $2`,
    [id, companyId],
  );
  return result.rows[0];
};

// ─────────────────────────────────────────────────────────────
// MANUAL CORRECTION (HR)
// ─────────────────────────────────────────────────────────────
export const correctAttendance = async (
  id,
  companyId,
  data,
  standardHours = 8,
) => {
  const result = await db.query(
    `UPDATE attendance
     SET
       clock_in = COALESCE($1, clock_in),
       clock_out = COALESCE($2, clock_out),
       status = COALESCE($3, status),
       hours_worked = CASE WHEN $4::numeric IS NOT NULL THEN $4::numeric WHEN $1 IS NOT NULL OR $2 IS NOT NULL THEN ROUND(EXTRACT(EPOCH FROM (COALESCE($2, clock_out) - COALESCE($1, clock_in))) / 3600.0, 2) ELSE hours_worked END,
       overtime_hours = CASE WHEN $5::numeric IS NOT NULL THEN $5::numeric WHEN $1 IS NOT NULL OR $2 IS NOT NULL THEN GREATEST(0, ROUND(EXTRACT(EPOCH FROM (COALESCE($2, clock_out) - COALESCE($1, clock_in))) / 3600.0, 2) - $6) ELSE overtime_hours END,
       is_manually_edited = true, edited_by = $7, edit_reason = $8, updated_at = NOW()
     WHERE id = $9 AND company_id = $10 RETURNING *`,
    [
      data.clockIn ?? null,
      data.clockOut ?? null,
      data.status ?? null,
      data.hoursWorked ?? null,
      data.overtimeHours ?? null,
      standardHours,
      data.editedBy,
      data.editReason,
      id,
      companyId,
    ],
  );
  return result.rows[0];
};

// ─────────────────────────────────────────────────────────────
// BULK MARK ABSENT
// ─────────────────────────────────────────────────────────────
export const bulkMarkAbsent = async (companyId) => {
  const result = await db.query(
    `INSERT INTO attendance (company_id, employee_id, attendance_date, status)
     SELECT e.company_id, e.id, CURRENT_DATE, 'absent'
     FROM employees e WHERE e.company_id = $1 AND e.is_active = true
     AND NOT EXISTS (SELECT 1 FROM attendance a WHERE a.employee_id = e.id AND a.attendance_date = CURRENT_DATE)
     ON CONFLICT (employee_id, attendance_date) DO NOTHING RETURNING id`,
    [companyId],
  );
  return result.rowCount;
};

// ─────────────────────────────────────────────────────────────
// SHIFTS
// ─────────────────────────────────────────────────────────────
export const createShift = async (companyId, data) => {
  const result = await db.query(
    `INSERT INTO shifts (company_id, name, description, start_time, end_time, days) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      companyId,
      data.name,
      data.description ?? null,
      data.startTime,
      data.endTime,
      data.days,
    ],
  );
  return result.rows[0];
};

export const updateShift = async (shiftId, companyId, data) => {
  const result = await db.query(
    `UPDATE shifts SET name = COALESCE($1, name), description = COALESCE($2, description), start_time = COALESCE($3, start_time), end_time = COALESCE($4, end_time), days = COALESCE($5, days), is_active = COALESCE($6, is_active), updated_at = NOW() WHERE id = $7 AND company_id = $8 RETURNING *`,
    [
      data.name ?? null,
      data.description ?? null,
      data.startTime ?? null,
      data.endTime ?? null,
      data.days ?? null,
      data.isActive ?? null,
      shiftId,
      companyId,
    ],
  );
  return result.rows[0];
};

export const getShifts = async (companyId) => {
  const result = await db.query(
    `SELECT * FROM shifts WHERE company_id = $1 ORDER BY start_time ASC`,
    [companyId],
  );
  return result.rows;
};

export const getShiftById = async (shiftId, companyId) => {
  const result = await db.query(
    `SELECT * FROM shifts WHERE id = $1 AND company_id = $2`,
    [shiftId, companyId],
  );
  return result.rows[0];
};