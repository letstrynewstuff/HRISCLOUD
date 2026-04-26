// src/controllers/training.controller.js
import { validationResult } from "express-validator";
import { db } from "../config/db.js";

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

// ══════════════════════════════════════════════════════
// GET /api/trainings
// Query: type, status, search, page, limit
// ══════════════════════════════════════════════════════
export async function listTrainings(req, res) {
  try {
    const { companyId } = req.user;
    const { type, status, search, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conditions = ["t.company_id = $1"];
    const values = [companyId];
    let idx = 2;

    if (type) {
      conditions.push(`t.type = $${idx++}`);
      values.push(type);
    }
    if (status) {
      conditions.push(`t.status = $${idx++}`);
      values.push(status);
    }
    if (search) {
      conditions.push(`(t.title ILIKE $${idx} OR t.provider ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const where = conditions.join(" AND ");

    const countRes = await db.query(
      `SELECT COUNT(*) FROM trainings t WHERE ${where}`,
      values,
    );

    const dataRes = await db.query(
      `SELECT
         t.*,
         u.first_name || ' ' || u.last_name AS created_by_name,
         (SELECT COUNT(*) FROM training_enrollments te WHERE te.training_id = t.id) AS enrolled_count
       FROM trainings t
       LEFT JOIN users u ON u.id = t.created_by
       WHERE ${where}
       ORDER BY t.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, Number(limit), offset],
    );

    return res.status(200).json({
      data: dataRes.rows,
      meta: {
        total: parseInt(countRes.rows[0].count, 10),
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(
          parseInt(countRes.rows[0].count, 10) / Number(limit),
        ),
      },
    });
  } catch (err) {
    console.error("listTrainings error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════
// GET /api/trainings/:id
// ══════════════════════════════════════════════════════
export async function getTraining(req, res) {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const trainingRes = await db.query(
      `SELECT t.*,
         u.first_name || ' ' || u.last_name AS created_by_name
       FROM trainings t
       LEFT JOIN users u ON u.id = t.created_by
       WHERE t.id = $1 AND t.company_id = $2`,
      [id, companyId],
    );

    if (!trainingRes.rows.length)
      return res.status(404).json({ message: "Training not found." });

    // Get enrollments with employee details
    const enrollRes = await db.query(
      `SELECT
         te.*,
         e.first_name || ' ' || e.last_name AS employee_name,
         e.employee_code,
         e.avatar,
         d.name AS department_name,
         jr.name AS role_name
       FROM training_enrollments te
       JOIN employees e ON e.id = te.employee_id
       LEFT JOIN departments d ON d.id = e.department_id
       LEFT JOIN job_roles jr ON jr.id = e.job_role_id
       WHERE te.training_id = $1
       ORDER BY te.enrolled_at ASC`,
      [id],
    );

    return res.status(200).json({
      data: { ...trainingRes.rows[0], enrollments: enrollRes.rows },
    });
  } catch (err) {
    console.error("getTraining error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════
// POST /api/trainings
// Creates a training + optionally assigns employees
// Body fields mirror the Training.js model exactly.
// ══════════════════════════════════════════════════════
export async function createTraining(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { companyId, userId } = req.user;
  const {
    title,
    type,
    provider,
    description,
    startDate,
    endDate,
    location,
    link,
    cost,
    maxAttendees,
    assignedTo = [],
    certificateTemplate,
  } = req.body;

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const trainingRes = await client.query(
      `INSERT INTO trainings (
         company_id, title, type, provider, description,
         start_date, end_date, location, link,
         cost, max_attendees, assigned_to,
         certificate_template, created_by, status
       ) VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'upcoming'
       ) RETURNING *`,
      [
        companyId,
        title,
        type,
        provider,
        description ?? null,
        startDate,
        endDate ?? null,
        location ?? null,
        link ?? null,
        cost ?? null,
        maxAttendees ?? null,
        assignedTo, // uuid[]
        certificateTemplate ?? null,
        userId,
      ],
    );

    const training = trainingRes.rows[0];

    // Enroll each assigned employee immediately
    if (assignedTo.length > 0) {
      for (const empId of assignedTo) {
        await client.query(
          `INSERT INTO training_enrollments
             (training_id, employee_id, status, enrolled_at, assigned_by)
           VALUES ($1, $2, 'enrolled', NOW(), $3)
           ON CONFLICT (training_id, employee_id) DO NOTHING`,
          [training.id, empId, userId],
        );
      }

      // Notify each assigned employee
      for (const empId of assignedTo) {
        const empRes = await client.query(
          `SELECT user_id FROM employees WHERE id = $1`,
          [empId],
        );
        if (empRes.rows[0]?.user_id) {
          await client.query(
            `INSERT INTO notifications
               (company_id, user_id, title, message, type, link, created_at)
             VALUES ($1, $2, $3, $4, 'attendance', $5, NOW())`,
            [
              companyId,
              empRes.rows[0].user_id,
              `New Training Assigned: ${title}`,
              `You have been enrolled in "${title}" starting ${startDate}. Please confirm your attendance.`,
              `/my-trainings`,
            ],
          );
        }
      }
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Training created successfully.",
      data: { ...training, enrolledCount: assignedTo.length },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("createTraining error:", err);
    return res.status(500).json({ message: "Server error creating training." });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════
// PUT /api/trainings/:id
// Partial update — COALESCE pattern
// ══════════════════════════════════════════════════════
export async function updateTraining(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { id } = req.params;
  const { companyId } = req.user;
  const {
    title,
    type,
    provider,
    description,
    startDate,
    endDate,
    location,
    link,
    cost,
    maxAttendees,
    status,
    certificateTemplate,
  } = req.body;

  try {
    const res_ = await db.query(
      `UPDATE trainings SET
         title                = COALESCE($1,  title),
         type                 = COALESCE($2,  type),
         provider             = COALESCE($3,  provider),
         description          = COALESCE($4,  description),
         start_date           = COALESCE($5,  start_date),
         end_date             = COALESCE($6,  end_date),
         location             = COALESCE($7,  location),
         link                 = COALESCE($8,  link),
         cost                 = COALESCE($9,  cost),
         max_attendees        = COALESCE($10, max_attendees),
         status               = COALESCE($11, status),
         certificate_template = COALESCE($12, certificate_template),
         updated_at           = NOW()
       WHERE id = $13 AND company_id = $14
       RETURNING *`,
      [
        title ?? null,
        type ?? null,
        provider ?? null,
        description ?? null,
        startDate ?? null,
        endDate ?? null,
        location ?? null,
        link ?? null,
        cost ?? null,
        maxAttendees ?? null,
        status ?? null,
        certificateTemplate ?? null,
        id,
        companyId,
      ],
    );

    if (!res_.rows.length)
      return res.status(404).json({ message: "Training not found." });

    return res
      .status(200)
      .json({ message: "Training updated.", data: res_.rows[0] });
  } catch (err) {
    console.error("updateTraining error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════
// DELETE /api/trainings/:id   (soft-delete → cancelled)
// ══════════════════════════════════════════════════════
export async function deleteTraining(req, res) {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const res_ = await db.query(
      `UPDATE trainings SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND company_id = $2 RETURNING id, title`,
      [id, companyId],
    );

    if (!res_.rows.length)
      return res.status(404).json({ message: "Training not found." });

    return res.status(200).json({
      message: `Training "${res_.rows[0].title}" cancelled.`,
    });
  } catch (err) {
    console.error("deleteTraining error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════
// POST /api/trainings/:id/assign
// Assign (enroll) one or more employees + notify them
// Body: { employeeIds: string[] }
// ══════════════════════════════════════════════════════
// export async function assignTraining(req, res) {
//   const { id } = req.params;
//   const { companyId, userId } = req.user;
//   const { employeeIds = [] } = req.body;

//   if (!employeeIds.length)
//     return res
//       .status(400)
//       .json({ message: "employeeIds must be a non-empty array." });

//   const client = await db.getClient();
//   try {
//     await client.query("BEGIN");

//     // Confirm training belongs to this company
//     const trainingRes = await client.query(
//       `SELECT id, title, start_date FROM trainings WHERE id = $1 AND company_id = $2`,
//       [id, companyId],
//     );
//     if (!trainingRes.rows.length) {
//       await client.query("ROLLBACK");
//       return res.status(404).json({ message: "Training not found." });
//     }
//     const training = trainingRes.rows[0];

//     const enrolled = [];
//     const skipped = [];

//     for (const empId of employeeIds) {
//       const insertRes = await client.query(
//         `INSERT INTO training_enrollments
//            (training_id, employee_id, status, enrolled_at, assigned_by)
//          VALUES ($1, $2, 'enrolled', NOW(), $3)
//          ON CONFLICT (training_id, employee_id) DO NOTHING
//          RETURNING id`,
//         [id, empId, userId],
//       );

//       if (insertRes.rows.length) {
//         enrolled.push(empId);

//         // Keep assigned_to array in sync on parent row
//         await client.query(
//           `UPDATE trainings
//            SET assigned_to = array_append(
//                  CASE WHEN $1::uuid = ANY(assigned_to) THEN assigned_to
//                       ELSE assigned_to END, $1::uuid)
//            WHERE id = $2`,
//           [empId, id],
//         );

//         // Notify the employee
//         const empRes = await client.query(
//           `SELECT user_id FROM employees WHERE id = $1`,
//           [empId],
//         );
//         if (empRes.rows[0]?.user_id) {
//           await client.query(
//             `INSERT INTO notifications
//                (company_id, user_id, title, message, type, link, created_at)
//              VALUES ($1, $2, $3, $4, 'attendance', $5, NOW())`,
//             [
//               companyId,
//               empRes.rows[0].user_id,
//               `Training Assigned: ${training.title}`,
//               `You've been enrolled in "${training.title}" starting ${training.start_date}. Check your training portal.`,
//               `/my-trainings`,
//             ],
//           );
//         }
//       } else {
//         skipped.push(empId);
//       }
//     }

//     await client.query("COMMIT");

//     return res.status(200).json({
//       message: `${enrolled.length} enrolled, ${skipped.length} already assigned.`,
//       enrolled,
//       skipped,
//     });
//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error("assignTraining error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error assigning training." });
//   } finally {
//     client.release();
//   }
// }

export async function assignTraining(req, res) {
  const { id } = req.params;
  const { companyId, userId } = req.user; // This is the UUID from your JWT (Users table)
  const { employeeIds = [] } = req.body;

  if (!employeeIds.length) {
    return res
      .status(400)
      .json({ message: "employeeIds must be a non-empty array." });
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    // 1. CRITICAL FIX: Get the Employee ID of the person performing the assignment
    // We need the ID from the 'employees' table, not the 'users' table.
    // const assignorRes = await client.query(
    //   `SELECT id FROM employees WHERE user_id = $1 AND company_id = $2`,
    //   [userId, companyId],
    // );
    const assignorRes = await client.query(
      `SELECT id FROM employees WHERE user_id = $1 AND company_id = $2`,
      [userId, companyId],
    );

    // const assignorEmployeeId = assignorRes.rows[0]?.id;
    const assignorEmployeeId = assignorRes.rows[0]?.id || null;

    // if (!assignorEmployeeId) {
    //   await client.query("ROLLBACK");
    //   return res.status(403).json({
    //     message:
    //       "Your user account is not linked to an employee record. Assignment denied.",
    //   });
    // }

    // 2. Confirm training exists and belongs to the company
    const trainingRes = await client.query(
      `SELECT id, title, start_date FROM trainings WHERE id = $1 AND company_id = $2`,
      [id, companyId],
    );

    if (!trainingRes.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Training not found." });
    }
    const training = trainingRes.rows[0];

    const enrolled = [];
    const skipped = [];

    // 3. Process Enrollments
    for (const empId of employeeIds) {
      const insertRes = await client.query(
        `INSERT INTO training_enrollments
           (training_id, employee_id, status, enrolled_at, assigned_by)
         VALUES ($1, $2, 'enrolled', NOW(), $3)
         ON CONFLICT (training_id, employee_id) DO NOTHING
         RETURNING employee_id`,
        [id, empId, assignorEmployeeId], // Use the Employee UUID here!
      );

      if (insertRes.rows.length) {
        enrolled.push(empId);

        // Notify the employee (Safe to keep inside loop for individual IDs)
        const empRes = await client.query(
          `SELECT user_id FROM employees WHERE id = $1`,
          [empId],
        );

        if (empRes.rows[0]?.user_id) {
          await client.query(
            `INSERT INTO notifications
               (company_id, user_id, title, message, type, link)
             VALUES ($1, $2, $3, $4, 'attendance', $5)`,
            [
              companyId,
              empRes.rows[0].user_id,
              `Training Assigned: ${training.title}`,
              `You've been enrolled in "${training.title}" starting ${training.start_date}.`,
              `/my-trainings`,
            ],
          );
        }
      } else {
        skipped.push(empId);
      }
    }

    // 4. PERFORMANCE FIX: Update the 'trainings' array once for all new enrollments
    if (enrolled.length > 0) {
      await client.query(
        `UPDATE trainings
         SET assigned_to = ARRAY(
           SELECT DISTINCT UNNEST(COALESCE(assigned_to, ARRAY[]::uuid[]) || $1::uuid[])
         )
         WHERE id = $2`,
        [enrolled, id],
      );
    }

    await client.query("COMMIT");

    return res.status(200).json({
      message: `${enrolled.length} enrolled, ${skipped.length} already assigned.`,
      enrolled,
      skipped,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("assignTraining detailed error:", err); // Log the full error to your console
    return res.status(500).json({
      message: "Server error assigning training.",
      error: err.message, // Optional: only for development
    });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════
// GET /api/trainings/:id/enrollments
// All enrollments for a training with employee details
// ══════════════════════════════════════════════════════
export async function getEnrollments(req, res) {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const check = await db.query(
      `SELECT id FROM trainings WHERE id = $1 AND company_id = $2`,
      [id, companyId],
    );
    if (!check.rows.length)
      return res.status(404).json({ message: "Training not found." });

    const result = await db.query(
      `SELECT
         te.id, te.status, te.attendance_status,
         te.enrolled_at, te.completed_at, te.certificate_issued,
         e.id AS employee_id,
         e.first_name || ' ' || e.last_name AS employee_name,
         e.employee_code, e.avatar,
         d.name AS department_name,
         jr.name AS role_name,
         u2.first_name || ' ' || u2.last_name AS assigned_by_name
       FROM training_enrollments te
       JOIN employees e ON e.id = te.employee_id
       LEFT JOIN departments d ON d.id = e.department_id
       LEFT JOIN job_roles jr ON jr.id = e.job_role_id
       LEFT JOIN employees assigner ON assigner.id = te.assigned_by
       LEFT JOIN users u2 ON u2.id = assigner.user_id
       WHERE te.training_id = $1
       ORDER BY te.enrolled_at ASC`,
      [id],
    );

    return res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error("getEnrollments error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════
// PUT /api/trainings/:id/enrollments/:employeeId/attendance
// Mark an employee attended / absent
// Body: { attendanceStatus: 'attended' | 'absent' | 'excused' }
// ══════════════════════════════════════════════════════
export async function markAttendance(req, res) {
  try {
    const { id, employeeId } = req.params;
    const { companyId } = req.user;
    const { attendanceStatus } = req.body;

    const valid = ["attended", "absent", "excused"];
    if (!valid.includes(attendanceStatus))
      return res
        .status(400)
        .json({
          message: `attendanceStatus must be one of: ${valid.join(", ")}.`,
        });

    // Verify training belongs to company
    const check = await db.query(
      `SELECT id, title FROM trainings WHERE id = $1 AND company_id = $2`,
      [id, companyId],
    );
    if (!check.rows.length)
      return res.status(404).json({ message: "Training not found." });

    const result = await db.query(
      `UPDATE training_enrollments
       SET
         attendance_status = $1,
         completed_at = CASE WHEN $1 = 'attended' THEN NOW() ELSE completed_at END,
         updated_at = NOW()
       WHERE training_id = $2 AND employee_id = $3
       RETURNING *`,
      [attendanceStatus, id, employeeId],
    );

    if (!result.rows.length)
      return res.status(404).json({ message: "Enrollment not found." });

    // If attended → notify employee that certificate can be issued
    if (attendanceStatus === "attended") {
      const empRes = await db.query(
        `SELECT user_id FROM employees WHERE id = $1`,
        [employeeId],
      );
      if (empRes.rows[0]?.user_id) {
        await db.query(
          `INSERT INTO notifications
             (company_id, user_id, title, message, type, link, created_at)
           VALUES ($1, $2, $3, $4, 'attendance', $5, NOW())`,
          [
            companyId,
            empRes.rows[0].user_id,
            `Attendance Confirmed: ${check.rows[0].title}`,
            `Your attendance for "${check.rows[0].title}" has been recorded. Your certificate will be issued shortly.`,
            `/my-trainings`,
          ],
        );
      }
    }

    return res.status(200).json({
      message: "Attendance updated.",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("markAttendance error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════
// POST /api/trainings/:id/enrollments/:employeeId/certificate
// Issue a certificate to an employee
// ══════════════════════════════════════════════════════
export async function issueCertificate(req, res) {
  try {
    const { id, employeeId } = req.params;
    const { companyId } = req.user;

    const check = await db.query(
      `SELECT id, title FROM trainings WHERE id = $1 AND company_id = $2`,
      [id, companyId],
    );
    if (!check.rows.length)
      return res.status(404).json({ message: "Training not found." });

    const enroll = await db.query(
      `SELECT attendance_status FROM training_enrollments
       WHERE training_id = $1 AND employee_id = $2`,
      [id, employeeId],
    );
    if (!enroll.rows.length)
      return res.status(404).json({ message: "Enrollment not found." });
    if (enroll.rows[0].attendance_status !== "attended")
      return res
        .status(400)
        .json({
          message: "Cannot issue certificate: employee did not attend.",
        });

    const result = await db.query(
      `UPDATE training_enrollments
       SET certificate_issued = true, updated_at = NOW()
       WHERE training_id = $1 AND employee_id = $2
       RETURNING *`,
      [id, employeeId],
    );

    // Notify employee
    const empRes = await db.query(
      `SELECT user_id FROM employees WHERE id = $1`,
      [employeeId],
    );
    if (empRes.rows[0]?.user_id) {
      await db.query(
        `INSERT INTO notifications
           (company_id, user_id, title, message, type, link, created_at)
         VALUES ($1, $2, $3, $4, 'document', $5, NOW())`,
        [
          companyId,
          empRes.rows[0].user_id,
          `Certificate Issued: ${check.rows[0].title}`,
          `Your completion certificate for "${check.rows[0].title}" has been issued. View it in your training portal.`,
          `/my-trainings`,
        ],
      );
    }

    return res.status(200).json({
      message: "Certificate issued.",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("issueCertificate error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════
// GET /api/trainings/dashboard
// Aggregated stats for the dashboard tab
// ══════════════════════════════════════════════════════
export async function getDashboard(req, res) {
  try {
    const { companyId } = req.user;

    const [statsRes, upcomingRes, budgetRes] = await Promise.all([
      db.query(
        `SELECT
           COUNT(*)                                              AS total_trainings,
           COUNT(*) FILTER (WHERE status = 'upcoming')          AS upcoming_count,
           COUNT(*) FILTER (WHERE status = 'completed')         AS completed_count,
           COALESCE(SUM(cost), 0)                               AS total_cost,
           (
             SELECT COUNT(DISTINCT employee_id)
             FROM training_enrollments te
             JOIN trainings t2 ON t2.id = te.training_id
             WHERE t2.company_id = $1
               AND te.attendance_status = 'attended'
           )                                                     AS employees_trained,
           (
             SELECT ROUND(
               COUNT(*) FILTER (WHERE attendance_status = 'attended') * 100.0
               / NULLIF(COUNT(*), 0), 1)
             FROM training_enrollments te
             JOIN trainings t2 ON t2.id = te.training_id
             WHERE t2.company_id = $1
           )                                                     AS completion_rate
         FROM trainings t
         WHERE t.company_id = $1`,
        [companyId],
      ),
      db.query(
        `SELECT id, title, type, start_date, end_date, location,
           (SELECT COUNT(*) FROM training_enrollments te WHERE te.training_id = t.id) AS enrolled_count,
           max_attendees
         FROM trainings t
         WHERE company_id = $1 AND status = 'upcoming'
         ORDER BY start_date ASC
         LIMIT 6`,
        [companyId],
      ),
      db.query(
        `SELECT
           COALESCE(SUM(cost), 0)                                               AS total_budget,
           COALESCE(SUM(cost) FILTER (WHERE status = 'completed'), 0)           AS spent
         FROM trainings WHERE company_id = $1`,
        [companyId],
      ),
    ]);

    const s = statsRes.rows[0];

    return res.status(200).json({
      data: {
        totalTrainings: parseInt(s.total_trainings),
        upcomingCount: parseInt(s.upcoming_count),
        completedCount: parseInt(s.completed_count),
        employeesTrained: parseInt(s.employees_trained),
        completionRate: parseFloat(s.completion_rate) || 0,
        totalCost: parseFloat(s.total_cost),
        budgetSpent: parseFloat(budgetRes.rows[0].spent),
        upcoming: upcomingRes.rows,
      },
    });
  } catch (err) {
    console.error("getDashboard error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════
// GET /api/trainings/my
// Employee sees only their own assigned trainings
// Requires: any authenticated user (employee role)
// ══════════════════════════════════════════════════════
export async function getMyTrainings(req, res) {
  try {
    const { userId, companyId } = req.user;

    // Get the employee record for this user
    const empRes = await db.query(
      `SELECT id FROM employees WHERE user_id = $1 AND company_id = $2`,
      [userId, companyId],
    );
    if (!empRes.rows.length)
      return res.status(404).json({ message: "Employee profile not found." });

    const employeeId = empRes.rows[0].id;

    const result = await db.query(
      `SELECT
         t.id, t.title, t.type, t.provider, t.description,
         t.start_date, t.end_date, t.location, t.link,
         t.status AS training_status,
         te.status AS enrollment_status,
         te.attendance_status,
         te.enrolled_at,
         te.completed_at,
         te.certificate_issued
       FROM training_enrollments te
       JOIN trainings t ON t.id = te.training_id
       WHERE te.employee_id = $1
         AND t.company_id = $2
       ORDER BY t.start_date ASC`,
      [employeeId, companyId],
    );

    return res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error("getMyTrainings error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════
// GET /api/trainings/certifications
// All certifications / enrollment records across company
// Used by CertificationTracker tab
// ══════════════════════════════════════════════════════
export async function getCertifications(req, res) {
  try {
    const { companyId } = req.user;

    const result = await db.query(
      `SELECT
         e.first_name || ' ' || e.last_name AS employee_name,
         e.employee_code,
         t.title AS training_title,
         t.end_date AS expiry_date,
         te.attendance_status,
         te.certificate_issued,
         te.completed_at,
         CASE
           WHEN t.end_date < NOW() THEN 'Expired'
           WHEN t.end_date < NOW() + INTERVAL '60 days' THEN 'Expiring'
           ELSE 'Valid'
         END AS cert_status
       FROM training_enrollments te
       JOIN trainings t ON t.id = te.training_id
       JOIN employees e ON e.id = te.employee_id
       WHERE t.company_id = $1
         AND te.certificate_issued = true
       ORDER BY t.end_date ASC`,
      [companyId],
    );

    const expiringCount = result.rows.filter(
      (r) => r.cert_status === "Expiring",
    ).length;

    return res.status(200).json({
      data: result.rows,
      expiringCount,
    });
  } catch (err) {
    console.error("getCertifications error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}
