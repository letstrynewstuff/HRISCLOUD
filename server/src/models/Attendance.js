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
//  e.employee_code AS employee_display_id,
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
//       data.lat ?? null,
//       data.lng ?? null,
//       data.selfieUrl ?? null,
//       data.status,
//     ],
//   );
//   return result.rows[0];
// };

// // ─────────────────────────────────────────────────────────────
// // CLOCK OUT
// // ─────────────────────────────────────────────────────────────
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
//        AND clock_out IS NULL
//      RETURNING *`,
//     [clockOut, standardHours, attendanceId],
//   );
//   return result.rows[0];
// };

// // ─────────────────────────────────────────────────────────────
// // FIND TODAY'S RECORD
// // ─────────────────────────────────────────────────────────────
// export const getTodayRecord = async (employeeId) => {
//   const result = await db.query(
//     `SELECT * FROM attendance
//      WHERE employee_id   = $1
//        AND attendance_date = CURRENT_DATE`,
//     [employeeId],
//   );
//   return result.rows[0];
// };

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
//     // UPDATED: Search against employee_code instead of employee_id/number
//     conditions.push(
//       `(e.first_name ILIKE $${idx} OR e.last_name ILIKE $${idx} OR e.employee_code ILIKE $${idx})`,
//     );
//     params.push(`%${search}%`);
//     idx++;
//   }

//   const WHERE = `WHERE ${conditions.join(" AND ")}`;
//   const orderCol = ["attendance_date", "clock_in", "status"].includes(sortBy)
//     ? `a.${sortBy}`
//     : "a.attendance_date";
//   const offset = (page - 1) * limit;

//   const countRes = await db.query(
//     `SELECT COUNT(*) ${ATTENDANCE_JOINS} ${WHERE}`,
//     params,
//   );
//   const dataRes = await db.query(
//     `SELECT ${ATTENDANCE_COLS} ${ATTENDANCE_JOINS} ${WHERE} ORDER BY ${orderCol} ${sortDir} LIMIT $${idx} OFFSET $${idx + 1}`,
//     [...params, limit, offset],
//   );

//   return {
//     rows: dataRes.rows,
//     total: parseInt(countRes.rows[0].count),
//     page: Number(page),
//     limit: Number(limit),
//     totalPages: Math.ceil(parseInt(countRes.rows[0].count) / limit),
//   };
// };

// export const getTodaySnapshot = async (companyId) => {
//   // 1. Status Counts
//   const summaryRes = await db.query(
//     `SELECT status, COUNT(*) AS count FROM attendance WHERE company_id = $1 AND attendance_date = CURRENT_DATE GROUP BY status`,
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
//   summaryRes.rows.forEach((r) => {
//     const key =
//       r.status === "half_day"
//         ? "halfDay"
//         : r.status === "on_leave"
//           ? "onLeave"
//           : r.status;
//     if (key in summary) summary[key] = parseInt(r.count);
//   });

//   // 2. Total Active Employees - UPDATED: Using employment_status = 'active'
//   const totalRes = await db.query(
//     `SELECT COUNT(*) FROM employees WHERE company_id = $1 AND employment_status = 'active'`,
//     [companyId],
//   );

//   summary.totalActive = parseInt(totalRes.rows[0].count);
//   summary.noRecord = Math.max(
//     0,
//     summary.totalActive -
//       summaryRes.rows.reduce((s, r) => s + parseInt(r.count), 0),
//   );

//   // 3. Late list
//   const lateRes = await db.query(
//     `SELECT ${ATTENDANCE_COLS} ${ATTENDANCE_JOINS} WHERE a.company_id = $1 AND a.attendance_date = CURRENT_DATE AND a.status = 'late' ORDER BY a.clock_in ASC LIMIT 20`,
//     [companyId],
//   );

//   return {
//     date: new Date().toISOString().split("T")[0],
//     summary,
//     lateEmployees: lateRes.rows,
//   };
// };

// // ─────────────────────────────────────────────────────────────
// // SINGLE EMPLOYEE HISTORY
// // ─────────────────────────────────────────────────────────────
// export const getEmployeeAttendance = async (
//   companyId,
//   employeeId,
//   filters = {},
// ) => {
//   const { startDate, endDate, status, page = 1, limit = 31 } = filters;
//   const conditions = ["a.company_id = $1", "a.employee_id = $2"];
//   const params = [companyId, employeeId];
//   let idx = 3;

//   if (startDate) {
//     conditions.push(`a.attendance_date >= $${idx++}`);
//     params.push(startDate);
//   }
//   if (endDate) {
//     conditions.push(`a.attendance_date <= $${idx++}`);
//     params.push(endDate);
//   }
//   if (status) {
//     conditions.push(`a.status = $${idx++}`);
//     params.push(status);
//   }

//   const WHERE = `WHERE ${conditions.join(" AND ")}`;
//   const offset = (page - 1) * limit;

//   const [countRes, dataRes, statsRes] = await Promise.all([
//     db.query(`SELECT COUNT(*) ${ATTENDANCE_JOINS} ${WHERE}`, params),
//     db.query(
//       `SELECT ${ATTENDANCE_COLS} ${ATTENDANCE_JOINS} ${WHERE} ORDER BY a.attendance_date DESC LIMIT $${idx} OFFSET $${idx + 1}`,
//       [...params, limit, offset],
//     ),
//     db.query(
//       `SELECT COUNT(*) AS total_days, COUNT(*) FILTER (WHERE status = 'present') AS present, COUNT(*) FILTER (WHERE status = 'absent') AS absent, COUNT(*) FILTER (WHERE status = 'late') AS late, COUNT(*) FILTER (WHERE status = 'half_day') AS half_day, COUNT(*) FILTER (WHERE status = 'on_leave') AS on_leave, COALESCE(SUM(hours_worked), 0) AS total_hours, COALESCE(SUM(overtime_hours), 0) AS total_overtime, ROUND(100.0 * COUNT(*) FILTER (WHERE status IN ('present','late')) / NULLIF(COUNT(*), 0), 1) AS attendance_rate ${ATTENDANCE_JOINS} ${WHERE}`,
//       params,
//     ),
//   ]);

//   const total = parseInt(countRes.rows[0].count, 10);
//   return {
//     rows: dataRes.rows,
//     stats: statsRes.rows[0],
//     total,
//     page: Number(page),
//     limit: Number(limit),
//     totalPages: Math.ceil(total / limit),
//   };
// };

// // ─────────────────────────────────────────────────────────────
// // FIND ATTENDANCE RECORD BY ID
// // ─────────────────────────────────────────────────────────────
// export const getAttendanceById = async (id, companyId) => {
//   const result = await db.query(
//     `SELECT ${ATTENDANCE_COLS} ${ATTENDANCE_JOINS} WHERE a.id = $1 AND a.company_id = $2`,
//     [id, companyId],
//   );
//   return result.rows[0];
// };

// // ─────────────────────────────────────────────────────────────
// // MANUAL CORRECTION (HR)
// // ─────────────────────────────────────────────────────────────
// export const correctAttendance = async (
//   id,
//   companyId,
//   data,
//   standardHours = 8,
// ) => {
//   const result = await db.query(
//     `UPDATE attendance
//      SET
//        clock_in = COALESCE($1, clock_in),
//        clock_out = COALESCE($2, clock_out),
//        status = COALESCE($3, status),
//        hours_worked = CASE WHEN $4::numeric IS NOT NULL THEN $4::numeric WHEN $1 IS NOT NULL OR $2 IS NOT NULL THEN ROUND(EXTRACT(EPOCH FROM (COALESCE($2, clock_out) - COALESCE($1, clock_in))) / 3600.0, 2) ELSE hours_worked END,
//        overtime_hours = CASE WHEN $5::numeric IS NOT NULL THEN $5::numeric WHEN $1 IS NOT NULL OR $2 IS NOT NULL THEN GREATEST(0, ROUND(EXTRACT(EPOCH FROM (COALESCE($2, clock_out) - COALESCE($1, clock_in))) / 3600.0, 2) - $6) ELSE overtime_hours END,
//        is_manually_edited = true, edited_by = $7, edit_reason = $8, updated_at = NOW()
//      WHERE id = $9 AND company_id = $10 RETURNING *`,
//     [
//       data.clockIn ?? null,
//       data.clockOut ?? null,
//       data.status ?? null,
//       data.hoursWorked ?? null,
//       data.overtimeHours ?? null,
//       standardHours,
//       data.editedBy,
//       data.editReason,
//       id,
//       companyId,
//     ],
//   );
//   return result.rows[0];
// };

// // ─────────────────────────────────────────────────────────────
// // BULK MARK ABSENT
// // ─────────────────────────────────────────────────────────────
// export const bulkMarkAbsent = async (companyId) => {
//   const result = await db.query(
//     `INSERT INTO attendance (company_id, employee_id, attendance_date, status)
//      SELECT e.company_id, e.id, CURRENT_DATE, 'absent'
//      FROM employees e WHERE e.company_id = $1 AND e.is_active = true
//      AND NOT EXISTS (SELECT 1 FROM attendance a WHERE a.employee_id = e.id AND a.attendance_date = CURRENT_DATE)
//      ON CONFLICT (employee_id, attendance_date) DO NOTHING RETURNING id`,
//     [companyId],
//   );
//   return result.rowCount;
// };

// // ─────────────────────────────────────────────────────────────
// // SHIFTS
// // ─────────────────────────────────────────────────────────────
// export const createShift = async (companyId, data) => {
//   const result = await db.query(
//     `INSERT INTO shifts (company_id, name, description, start_time, end_time, days) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
//     [
//       companyId,
//       data.name,
//       data.description ?? null,
//       data.startTime,
//       data.endTime,
//       data.days,
//     ],
//   );
//   return result.rows[0];
// };

// export const updateShift = async (shiftId, companyId, data) => {
//   const result = await db.query(
//     `UPDATE shifts SET name = COALESCE($1, name), description = COALESCE($2, description), start_time = COALESCE($3, start_time), end_time = COALESCE($4, end_time), days = COALESCE($5, days), is_active = COALESCE($6, is_active), updated_at = NOW() WHERE id = $7 AND company_id = $8 RETURNING *`,
//     [
//       data.name ?? null,
//       data.description ?? null,
//       data.startTime ?? null,
//       data.endTime ?? null,
//       data.days ?? null,
//       data.isActive ?? null,
//       shiftId,
//       companyId,
//     ],
//   );
//   return result.rows[0];
// };

// export const getShifts = async (companyId) => {
//   const result = await db.query(
//     `SELECT * FROM shifts WHERE company_id = $1 ORDER BY start_time ASC`,
//     [companyId],
//   );
//   return result.rows;
// };

// export const getShiftById = async (shiftId, companyId) => {
//   const result = await db.query(
//     `SELECT * FROM shifts WHERE id = $1 AND company_id = $2`,
//     [shiftId, companyId],
//   );
//   return result.rows[0];
// };

// import { db } from "../config/db.js";

// // ─────────────────────────────────────────────────────────────
// // Helper: shared SELECT columns for attendance records
// // ─────────────────────────────────────────────────────────────
// // const ATTENDANCE_COLS = `
// //   a.id,
// //   a.company_id,
// //   a.employee_id,
// //   a.attendance_date,
// //   a.clock_in,
// //   a.clock_out,
// //   a.clock_in_lat,
// //   a.clock_in_lng,
// //   a.clock_in_selfie,
// //   a.status,
// //   a.hours_worked,
// //   a.overtime_hours,
// //   a.is_manually_edited,
// //   a.edited_by,
// //   a.edit_reason,
// //   a.created_at,
// //   a.updated_at,
// //   e.first_name,
// //   e.last_name,
// //  e.employee_code AS employee_display_id,
// //   d.name  AS department_name,
// //   j.title AS job_title
// // `;
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
//   a.on_break,
//   a.break_started_at,
//   a.total_break_minutes,
//   a.is_manually_edited,
//   a.edited_by,
//   a.edit_reason,
//   a.created_at,
//   a.updated_at,
//   e.first_name,
//   e.last_name,
//  e.employee_code AS employee_display_id,
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
//       data.lat ?? null,
//       data.lng ?? null,
//       data.selfieUrl ?? null,
//       data.status,
//     ],
//   );
//   return result.rows[0];
// };

// // ─────────────────────────────────────────────────────────────
// // CLOCK OUT
// // ─────────────────────────────────────────────────────────────
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
//        AND clock_out IS NULL
//      RETURNING *`,
//     [clockOut, standardHours, attendanceId],
//   );
//   return result.rows[0];
// };

// // ─────────────────────────────────────────────────────────────
// // FIND TODAY'S RECORD
// //
// // FIX: Previously matched strictly on `attendance_date = CURRENT_DATE`.
// //      This broke for late-night clock-ins: e.g. clocking in at 23:47
// //      local time stores attendance_date as that day, but a few minutes
// //      later CURRENT_DATE rolls over to the next day, so the strict date
// //      match no longer finds the (still open) session — causing false
// //      "you haven't clocked in" errors on break-start/break-end/clock-out.
// //
// //      Now we find the most recent OPEN session (clocked in, not yet
// //      clocked out) for the employee, regardless of which calendar date
// //      it technically started on. This correctly represents "the shift
// //      you're currently in."
// // ─────────────────────────────────────────────────────────────
// export const getTodayRecord = async (employeeId) => {
//   const result = await db.query(
//     `SELECT * FROM attendance
//      WHERE employee_id = $1
//        AND clock_in IS NOT NULL
//        AND clock_out IS NULL
//      ORDER BY clock_in DESC
//      LIMIT 1`,
//     [employeeId],
//   );
//   return result.rows[0];
// };

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
//     // UPDATED: Search against employee_code instead of employee_id/number
//     conditions.push(
//       `(e.first_name ILIKE $${idx} OR e.last_name ILIKE $${idx} OR e.employee_code ILIKE $${idx})`,
//     );
//     params.push(`%${search}%`);
//     idx++;
//   }

//   const WHERE = `WHERE ${conditions.join(" AND ")}`;
//   const orderCol = ["attendance_date", "clock_in", "status"].includes(sortBy)
//     ? `a.${sortBy}`
//     : "a.attendance_date";
//   const offset = (page - 1) * limit;

//   const countRes = await db.query(
//     `SELECT COUNT(*) ${ATTENDANCE_JOINS} ${WHERE}`,
//     params,
//   );
//   const dataRes = await db.query(
//     `SELECT ${ATTENDANCE_COLS} ${ATTENDANCE_JOINS} ${WHERE} ORDER BY ${orderCol} ${sortDir} LIMIT $${idx} OFFSET $${idx + 1}`,
//     [...params, limit, offset],
//   );

//   return {
//     rows: dataRes.rows,
//     total: parseInt(countRes.rows[0].count),
//     page: Number(page),
//     limit: Number(limit),
//     totalPages: Math.ceil(parseInt(countRes.rows[0].count) / limit),
//   };
// };

// export const getTodaySnapshot = async (companyId) => {
//   // 1. Status Counts
//   const summaryRes = await db.query(
//     `SELECT status, COUNT(*) AS count FROM attendance WHERE company_id = $1 AND attendance_date = CURRENT_DATE GROUP BY status`,
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
//   summaryRes.rows.forEach((r) => {
//     const key =
//       r.status === "half_day"
//         ? "halfDay"
//         : r.status === "on_leave"
//           ? "onLeave"
//           : r.status;
//     if (key in summary) summary[key] = parseInt(r.count);
//   });

//   // 2. Total Active Employees - UPDATED: Using employment_status = 'active'
//   const totalRes = await db.query(
//     `SELECT COUNT(*) FROM employees WHERE company_id = $1 AND employment_status = 'active'`,
//     [companyId],
//   );

//   summary.totalActive = parseInt(totalRes.rows[0].count);
//   summary.noRecord = Math.max(
//     0,
//     summary.totalActive -
//       summaryRes.rows.reduce((s, r) => s + parseInt(r.count), 0),
//   );

//   // 3. Late list
//   const lateRes = await db.query(
//     `SELECT ${ATTENDANCE_COLS} ${ATTENDANCE_JOINS} WHERE a.company_id = $1 AND a.attendance_date = CURRENT_DATE AND a.status = 'late' ORDER BY a.clock_in ASC LIMIT 20`,
//     [companyId],
//   );

//   return {
//     date: new Date().toISOString().split("T")[0],
//     summary,
//     lateEmployees: lateRes.rows,
//   };
// };

// // ─────────────────────────────────────────────────────────────
// // SINGLE EMPLOYEE HISTORY
// // ─────────────────────────────────────────────────────────────
// export const getEmployeeAttendance = async (
//   companyId,
//   employeeId,
//   filters = {},
// ) => {
//   const { startDate, endDate, status, page = 1, limit = 31 } = filters;
//   const conditions = ["a.company_id = $1", "a.employee_id = $2"];
//   const params = [companyId, employeeId];
//   let idx = 3;

//   if (startDate) {
//     conditions.push(`a.attendance_date >= $${idx++}`);
//     params.push(startDate);
//   }
//   if (endDate) {
//     conditions.push(`a.attendance_date <= $${idx++}`);
//     params.push(endDate);
//   }
//   if (status) {
//     conditions.push(`a.status = $${idx++}`);
//     params.push(status);
//   }

//   const WHERE = `WHERE ${conditions.join(" AND ")}`;
//   const offset = (page - 1) * limit;

//   const [countRes, dataRes, statsRes] = await Promise.all([
//     db.query(`SELECT COUNT(*) ${ATTENDANCE_JOINS} ${WHERE}`, params),
//     db.query(
//       `SELECT ${ATTENDANCE_COLS} ${ATTENDANCE_JOINS} ${WHERE} ORDER BY a.attendance_date DESC LIMIT $${idx} OFFSET $${idx + 1}`,
//       [...params, limit, offset],
//     ),
//     db.query(
//       `SELECT COUNT(*) AS total_days, COUNT(*) FILTER (WHERE status = 'present') AS present, COUNT(*) FILTER (WHERE status = 'absent') AS absent, COUNT(*) FILTER (WHERE status = 'late') AS late, COUNT(*) FILTER (WHERE status = 'half_day') AS half_day, COUNT(*) FILTER (WHERE status = 'on_leave') AS on_leave, COALESCE(SUM(hours_worked), 0) AS total_hours, COALESCE(SUM(overtime_hours), 0) AS total_overtime, ROUND(100.0 * COUNT(*) FILTER (WHERE status IN ('present','late')) / NULLIF(COUNT(*), 0), 1) AS attendance_rate ${ATTENDANCE_JOINS} ${WHERE}`,
//       params,
//     ),
//   ]);

//   const total = parseInt(countRes.rows[0].count, 10);
//   return {
//     rows: dataRes.rows,
//     stats: statsRes.rows[0],
//     total,
//     page: Number(page),
//     limit: Number(limit),
//     totalPages: Math.ceil(total / limit),
//   };
// };

// // ─────────────────────────────────────────────────────────────
// // FIND ATTENDANCE RECORD BY ID
// // ─────────────────────────────────────────────────────────────
// export const getAttendanceById = async (id, companyId) => {
//   const result = await db.query(
//     `SELECT ${ATTENDANCE_COLS} ${ATTENDANCE_JOINS} WHERE a.id = $1 AND a.company_id = $2`,
//     [id, companyId],
//   );
//   return result.rows[0];
// };

// // ─────────────────────────────────────────────────────────────
// // MANUAL CORRECTION (HR)
// // ─────────────────────────────────────────────────────────────
// export const correctAttendance = async (
//   id,
//   companyId,
//   data,
//   standardHours = 8,
// ) => {
//   const result = await db.query(
//     `UPDATE attendance
//      SET
//        clock_in = COALESCE($1, clock_in),
//        clock_out = COALESCE($2, clock_out),
//        status = COALESCE($3, status),
//        hours_worked = CASE WHEN $4::numeric IS NOT NULL THEN $4::numeric WHEN $1 IS NOT NULL OR $2 IS NOT NULL THEN ROUND(EXTRACT(EPOCH FROM (COALESCE($2, clock_out) - COALESCE($1, clock_in))) / 3600.0, 2) ELSE hours_worked END,
//        overtime_hours = CASE WHEN $5::numeric IS NOT NULL THEN $5::numeric WHEN $1 IS NOT NULL OR $2 IS NOT NULL THEN GREATEST(0, ROUND(EXTRACT(EPOCH FROM (COALESCE($2, clock_out) - COALESCE($1, clock_in))) / 3600.0, 2) - $6) ELSE overtime_hours END,
//        is_manually_edited = true, edited_by = $7, edit_reason = $8, updated_at = NOW()
//      WHERE id = $9 AND company_id = $10 RETURNING *`,
//     [
//       data.clockIn ?? null,
//       data.clockOut ?? null,
//       data.status ?? null,
//       data.hoursWorked ?? null,
//       data.overtimeHours ?? null,
//       standardHours,
//       data.editedBy,
//       data.editReason,
//       id,
//       companyId,
//     ],
//   );
//   return result.rows[0];
// };

// // ─────────────────────────────────────────────────────────────
// // BULK MARK ABSENT
// // ─────────────────────────────────────────────────────────────
// export const bulkMarkAbsent = async (companyId) => {
//   const result = await db.query(
//     `INSERT INTO attendance (company_id, employee_id, attendance_date, status)
//      SELECT e.company_id, e.id, CURRENT_DATE, 'absent'
//      FROM employees e WHERE e.company_id = $1 AND e.is_active = true
//      AND NOT EXISTS (SELECT 1 FROM attendance a WHERE a.employee_id = e.id AND a.attendance_date = CURRENT_DATE)
//      ON CONFLICT (employee_id, attendance_date) DO NOTHING RETURNING id`,
//     [companyId],
//   );
//   return result.rowCount;
// };

// // ─────────────────────────────────────────────────────────────
// // SHIFTS
// // ─────────────────────────────────────────────────────────────
// export const createShift = async (companyId, data) => {
//   const result = await db.query(
//     `INSERT INTO shifts (company_id, name, description, start_time, end_time, days) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
//     [
//       companyId,
//       data.name,
//       data.description ?? null,
//       data.startTime,
//       data.endTime,
//       data.days,
//     ],
//   );
//   return result.rows[0];
// };

// export const updateShift = async (shiftId, companyId, data) => {
//   const result = await db.query(
//     `UPDATE shifts SET name = COALESCE($1, name), description = COALESCE($2, description), start_time = COALESCE($3, start_time), end_time = COALESCE($4, end_time), days = COALESCE($5, days), is_active = COALESCE($6, is_active), updated_at = NOW() WHERE id = $7 AND company_id = $8 RETURNING *`,
//     [
//       data.name ?? null,
//       data.description ?? null,
//       data.startTime ?? null,
//       data.endTime ?? null,
//       data.days ?? null,
//       data.isActive ?? null,
//       shiftId,
//       companyId,
//     ],
//   );
//   return result.rows[0];
// };

// export const getShifts = async (companyId) => {
//   const result = await db.query(
//     `SELECT * FROM shifts WHERE company_id = $1 ORDER BY start_time ASC`,
//     [companyId],
//   );
//   return result.rows;
// };

// export const getShiftById = async (shiftId, companyId) => {
//   const result = await db.query(
//     `SELECT * FROM shifts WHERE id = $1 AND company_id = $2`,
//     [shiftId, companyId],
//   );
//   return result.rows[0];
// };

import { db } from "../config/db.js";

// ─────────────────────────────────────────────────────────────
// Helper: shared SELECT columns for attendance records
//
// FIX: previously omitted on_break, break_started_at, and
//      total_break_minutes — meaning every GET endpoint that used
//      ATTENDANCE_COLS (getAllAttendance, getTodaySnapshot,
//      getEmployeeAttendance i.e. GET /attendance/me,
//      getAttendanceById) returned those fields as undefined even
//      though the DB had correct values. This caused the frontend
//      to think the employee was never on a break / had 0 break
//      minutes, right after a successful break-start.
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
  a.on_break,
  a.break_started_at,
  a.total_break_minutes,
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
//
// FIX: hours_worked previously calculated as (clock_out - clock_in)
//      only, which IGNORED any time spent on break — inflating
//      hours_worked by however long the employee was on break.
//      Now subtracts total_break_minutes (converted to hours) so
//      hours_worked reflects actual time worked, not elapsed time.
//      GREATEST(0, ...) guards against negative values for edge
//      cases (e.g. manually-edited records).
// ─────────────────────────────────────────────────────────────
export const clockOut = async (attendanceId, clockOut, standardHours = 8) => {
  const result = await db.query(
    `UPDATE attendance
     SET
       clock_out      = $1,
       hours_worked   = ROUND(
                          GREATEST(
                            0,
                            EXTRACT(EPOCH FROM ($1 - clock_in)) / 3600.0
                              - (total_break_minutes / 60.0)
                          ), 2
                        ),
       overtime_hours = GREATEST(
                          0,
                          ROUND(
                            GREATEST(
                              0,
                              EXTRACT(EPOCH FROM ($1 - clock_in)) / 3600.0
                                - (total_break_minutes / 60.0)
                            ), 2
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
//
// FIX: Previously matched strictly on `attendance_date = CURRENT_DATE`.
//      This broke for late-night clock-ins: e.g. clocking in at 23:47
//      local time stores attendance_date as that day, but a few minutes
//      later CURRENT_DATE rolls over to the next day, so the strict date
//      match no longer finds the (still open) session — causing false
//      "you haven't clocked in" errors on break-start/break-end/clock-out.
//
//      Now we find the most recent OPEN session (clocked in, not yet
//      clocked out) for the employee, regardless of which calendar date
//      it technically started on. This correctly represents "the shift
//      you're currently in."
// ─────────────────────────────────────────────────────────────
export const getTodayRecord = async (employeeId) => {
  const result = await db.query(
    `SELECT * FROM attendance
     WHERE employee_id = $1
       AND clock_in IS NOT NULL
       AND clock_out IS NULL
     ORDER BY clock_in DESC
     LIMIT 1`,
    [employeeId],
  );
  return result.rows[0];
};

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