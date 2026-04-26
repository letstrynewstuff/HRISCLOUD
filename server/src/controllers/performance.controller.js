// src/controllers/performance.controller.js
//
// All endpoints use the shared pg Pool via db.query() — no secondary
// DB client. Matches the db.js already in your project.
//
// Endpoints:
//   GET  /api/performance/cycles          → list all review cycles      (HR)
//   POST /api/performance/cycles          → create a cycle              (HR)
//   GET  /api/performance/reviews         → all reviews, all employees  (HR)
//   GET  /api/performance/reviews/me      → current user's reviews      (employee)
//   PUT  /api/performance/reviews/:id/self       → submit self-assessment
//   PUT  /api/performance/reviews/:id/manager    → submit manager assessment
//   PUT  /api/performance/reviews/:id/finalize   → lock & finalize review   (HR/manager)
//   GET  /api/performance/goals           → all goals in company        (HR)
//   POST /api/performance/goals           → create a goal               (HR/manager)
//   PUT  /api/performance/goals/:id       → update goal / progress
//   GET  /api/performance/goals/me        → current user's goals        (employee)
//
// req.user is set by the authenticate middleware:
//   { userId, companyId, role }

// import { db } from "../config/db.js";
// import { validationResult } from "express-validator";

// // ─── helper ───────────────────────────────────────────────────
// function validationFailed(req, res) {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     res
//       .status(422)
//       .json({ message: "Validation failed.", errors: errors.array() });
//     return true;
//   }
//   return false;
// }

// // ─── Map DB row → camelCase response object ────────────────────
// function formatReview(r) {
//   return {
//     id: r.id,
//     companyId: r.company_id,
//     employeeId: r.employee_id,
//     reviewerId: r.reviewer_id,
//     cycle: r.cycle,
//     periodStart: r.period_start,
//     periodEnd: r.period_end,
//     selfAssessment: r.self_assessment,
//     managerAssessment: r.manager_assessment,
//     finalRating: r.final_rating,
//     status: r.status,
//     createdAt: r.created_at,
//     updatedAt: r.updated_at,
//   };
// }

// function formatGoal(g) {
//   return {
//     id: g.id,
//     companyId: g.company_id,
//     employeeId: g.employee_id,
//     title: g.title,
//     description: g.description,
//     metric: g.metric,
//     target: g.target,
//     dueDate: g.due_date,
//     progress: g.progress,
//     status: g.status,
//     cycle: g.cycle,
//     createdBy: g.created_by,
//     createdAt: g.created_at,
//     updatedAt: g.updated_at,
//   };
// }

// function formatCycle(c) {
//   return {
//     id: c.id,
//     companyId: c.company_id,
//     name: c.name,
//     periodStart: c.period_start,
//     periodEnd: c.period_end,
//     status: c.status,
//     createdAt: c.created_at,
//     updatedAt: c.updated_at,
//   };
// }

// // ══════════════════════════════════════════════════════════════
// // CYCLES
// // ══════════════════════════════════════════════════════════════

// // GET /api/performance/cycles
// // HR only — lists all cycles for the company
// export async function getCycles(req, res) {
//   try {
//     const { companyId } = req.user;

//     const result = await db.query(
//       `SELECT *
//        FROM performance_cycles
//        WHERE company_id = $1
//        ORDER BY period_start DESC`,
//       [companyId],
//     );

//     return res.status(200).json({
//       cycles: result.rows.map(formatCycle),
//       total: result.rowCount,
//     });
//   } catch (err) {
//     console.error("getCycles error:", err);
//     return res.status(500).json({ message: "Server error fetching cycles." });
//   }
// }

// // POST /api/performance/cycles
// // HR only — create a new review cycle
// export async function createCycle(req, res) {
//   if (validationFailed(req, res)) return;

//   const { companyId } = req.user;
//   const { name, periodStart, periodEnd, status = "active" } = req.body;

//   try {
//     // Check for duplicate cycle name within company
//     const dupe = await db.query(
//       "SELECT id FROM performance_cycles WHERE company_id = $1 AND name = $2",
//       [companyId, name],
//     );
//     if (dupe.rowCount > 0) {
//       return res
//         .status(409)
//         .json({ message: "A cycle with this name already exists." });
//     }

//     const result = await db.query(
//       `INSERT INTO performance_cycles
//          (company_id, name, period_start, period_end, status)
//        VALUES ($1, $2, $3, $4, $5)
//        RETURNING *`,
//       [companyId, name, periodStart, periodEnd, status],
//     );

//     return res.status(201).json({ cycle: formatCycle(result.rows[0]) });
//   } catch (err) {
//     console.error("createCycle error:", err);
//     return res.status(500).json({ message: "Server error creating cycle." });
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // REVIEWS
// // ══════════════════════════════════════════════════════════════

// // GET /api/performance/reviews
// // HR — all reviews for the company, with optional filters
// // Query params: ?cycle=Q1+2026 &status=pending &employeeId=uuid
// export async function getAllReviews(req, res) {
//   try {
//     const { companyId } = req.user;
//     const { cycle, status, employeeId } = req.query;

//     // Build dynamic WHERE clauses
//     const conditions = ["pr.company_id = $1"];
//     const params = [companyId];
//     let idx = 2;

//     if (cycle) {
//       conditions.push(`pr.cycle = $${idx++}`);
//       params.push(cycle);
//     }
//     if (status) {
//       conditions.push(`pr.status = $${idx++}`);
//       params.push(status);
//     }
//     if (employeeId) {
//       conditions.push(`pr.employee_id = $${idx++}`);
//       params.push(employeeId);
//     }

//     const result = await db.query(
//       `SELECT
//          pr.*,
//          e.first_name  AS employee_first_name,
//          e.last_name   AS employee_last_name,
//          e.email       AS employee_email,
//          r.first_name  AS reviewer_first_name,
//          r.last_name   AS reviewer_last_name
//        FROM performance_reviews pr
//        JOIN employees e ON e.id = pr.employee_id
//        LEFT JOIN employees r ON r.id = pr.reviewer_id
//        WHERE ${conditions.join(" AND ")}
//        ORDER BY pr.created_at DESC`,
//       params,
//     );

//     const reviews = result.rows.map((row) => ({
//       ...formatReview(row),
//       employee: {
//         firstName: row.employee_first_name,
//         lastName: row.employee_last_name,
//         email: row.employee_email,
//       },
//       reviewer: row.reviewer_first_name
//         ? {
//             firstName: row.reviewer_first_name,
//             lastName: row.reviewer_last_name,
//           }
//         : null,
//     }));

//     return res.status(200).json({ reviews, total: result.rowCount });
//   } catch (err) {
//     console.error("getAllReviews error:", err);
//     return res.status(500).json({ message: "Server error fetching reviews." });
//   }
// }

// // GET /api/performance/reviews/me
// // Employee — own reviews only
// export async function getMyReviews(req, res) {
//   try {
//     const { userId, companyId } = req.user;

//     // userId in JWT = users.id — need to map to employees.id
//     const empResult = await db.query(
//       "SELECT id FROM employees WHERE user_id = $1 AND company_id = $2",
//       [userId, companyId],
//     );

//     if (empResult.rowCount === 0) {
//       return res.status(404).json({ message: "Employee profile not found." });
//     }

//     const employeeId = empResult.rows[0].id;

//     const result = await db.query(
//       `SELECT *
//        FROM performance_reviews
//        WHERE employee_id = $1
//        ORDER BY created_at DESC`,
//       [employeeId],
//     );

//     return res.status(200).json({
//       reviews: result.rows.map(formatReview),
//       total: result.rowCount,
//     });
//   } catch (err) {
//     console.error("getMyReviews error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error fetching your reviews." });
//   }
// }

// // PUT /api/performance/reviews/:id/self
// // Employee — submit self-assessment
// // Body: { sections: [...], overallComment: "..." }
// export async function submitSelfAssessment(req, res) {
//   if (validationFailed(req, res)) return;

//   const { id } = req.params;
//   const { userId, companyId } = req.user;

//   try {
//     // Verify the review belongs to this employee
//     const empResult = await db.query(
//       "SELECT id FROM employees WHERE user_id = $1 AND company_id = $2",
//       [userId, companyId],
//     );
//     if (empResult.rowCount === 0) {
//       return res.status(404).json({ message: "Employee profile not found." });
//     }
//     const employeeId = empResult.rows[0].id;

//     const reviewResult = await db.query(
//       "SELECT id, status, employee_id FROM performance_reviews WHERE id = $1 AND company_id = $2",
//       [id, companyId],
//     );

//     if (reviewResult.rowCount === 0) {
//       return res.status(404).json({ message: "Review not found." });
//     }

//     const review = reviewResult.rows[0];

//     if (review.employee_id !== employeeId) {
//       return res
//         .status(403)
//         .json({ message: "This review does not belong to you." });
//     }

//     // Can only submit if review is pending or self_assessment stage
//     if (!["pending", "self_assessment"].includes(review.status)) {
//       return res.status(409).json({
//         message: `Cannot submit self-assessment at this stage. Current status: ${review.status}.`,
//       });
//     }

//     const updated = await db.query(
//       `UPDATE performance_reviews
//        SET
//          self_assessment = $1::jsonb,
//          status          = 'manager_review',
//          updated_at      = NOW()
//        WHERE id = $2
//        RETURNING *`,
//       [JSON.stringify(req.body), id],
//     );

//     return res.status(200).json({
//       message: "Self-assessment submitted successfully.",
//       review: formatReview(updated.rows[0]),
//     });
//   } catch (err) {
//     console.error("submitSelfAssessment error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error submitting self-assessment." });
//   }
// }

// // PUT /api/performance/reviews/:id/manager
// // Manager / HR — submit manager assessment
// // Body: { sections: [...], overallComment: "...", suggestedRating: 4.2 }
// export async function submitManagerAssessment(req, res) {
//   if (validationFailed(req, res)) return;

//   const { id } = req.params;
//   const { companyId } = req.user;

//   try {
//     const reviewResult = await db.query(
//       "SELECT id, status FROM performance_reviews WHERE id = $1 AND company_id = $2",
//       [id, companyId],
//     );

//     if (reviewResult.rowCount === 0) {
//       return res.status(404).json({ message: "Review not found." });
//     }

//     if (reviewResult.rows[0].status !== "manager_review") {
//       return res.status(409).json({
//         message: "Review is not in the manager_review stage.",
//         currentStatus: reviewResult.rows[0].status,
//       });
//     }

//     const { suggestedRating, ...assessmentBody } = req.body;

//     const updated = await db.query(
//       `UPDATE performance_reviews
//        SET
//          manager_assessment = $1::jsonb,
//          final_rating       = $2,
//          status             = 'completed',
//          updated_at         = NOW()
//        WHERE id = $3
//        RETURNING *`,
//       [JSON.stringify(assessmentBody), suggestedRating ?? null, id],
//     );

//     return res.status(200).json({
//       message: "Manager assessment submitted.",
//       review: formatReview(updated.rows[0]),
//     });
//   } catch (err) {
//     console.error("submitManagerAssessment error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error submitting manager assessment." });
//   }
// }

// // PUT /api/performance/reviews/:id/finalize
// // HR only — lock the review and set final_rating explicitly
// // Body: { finalRating: 4.5 }
// export async function finalizeReview(req, res) {
//   if (validationFailed(req, res)) return;

//   const { id } = req.params;
//   const { companyId } = req.user;
//   const { finalRating } = req.body;

//   try {
//     const reviewResult = await db.query(
//       "SELECT id, status FROM performance_reviews WHERE id = $1 AND company_id = $2",
//       [id, companyId],
//     );

//     if (reviewResult.rowCount === 0) {
//       return res.status(404).json({ message: "Review not found." });
//     }

//     const current = reviewResult.rows[0];

//     if (current.status === "finalized") {
//       return res
//         .status(409)
//         .json({ message: "Review has already been finalized." });
//     }

//     if (current.status === "pending" || current.status === "self_assessment") {
//       return res.status(409).json({
//         message:
//           "Review cannot be finalized before self-assessment and manager review are complete.",
//       });
//     }

//     const updated = await db.query(
//       `UPDATE performance_reviews
//        SET
//          final_rating = $1,
//          status       = 'finalized',
//          updated_at   = NOW()
//        WHERE id = $2
//        RETURNING *`,
//       [finalRating, id],
//     );

//     return res.status(200).json({
//       message: "Review finalized and locked.",
//       review: formatReview(updated.rows[0]),
//     });
//   } catch (err) {
//     console.error("finalizeReview error:", err);
//     return res.status(500).json({ message: "Server error finalizing review." });
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // GOALS
// // ══════════════════════════════════════════════════════════════

// // GET /api/performance/goals
// // HR — all goals in company. Optional filters: ?employeeId=uuid &cycle=... &status=...
// export async function getAllGoals(req, res) {
//   try {
//     const { companyId } = req.user;
//     const { employeeId, cycle, status } = req.query;

//     const conditions = ["g.company_id = $1"];
//     const params = [companyId];
//     let idx = 2;

//     if (employeeId) {
//       conditions.push(`g.employee_id = $${idx++}`);
//       params.push(employeeId);
//     }
//     if (cycle) {
//       conditions.push(`g.cycle = $${idx++}`);
//       params.push(cycle);
//     }
//     if (status) {
//       conditions.push(`g.status = $${idx++}`);
//       params.push(status);
//     }

//     const result = await db.query(
//       `SELECT
//          g.*,
//          e.first_name AS employee_first_name,
//          e.last_name  AS employee_last_name
//        FROM goals g
//        JOIN employees e ON e.id = g.employee_id
//        WHERE ${conditions.join(" AND ")}
//        ORDER BY g.due_date ASC`,
//       params,
//     );

//     const goals = result.rows.map((row) => ({
//       ...formatGoal(row),
//       employee: {
//         firstName: row.employee_first_name,
//         lastName: row.employee_last_name,
//       },
//     }));

//     return res.status(200).json({ goals, total: result.rowCount });
//   } catch (err) {
//     console.error("getAllGoals error:", err);
//     return res.status(500).json({ message: "Server error fetching goals." });
//   }
// }

// // POST /api/performance/goals
// // HR / Manager — create a goal for an employee
// export async function createGoal(req, res) {
//   if (validationFailed(req, res)) return;

//   const { companyId, userId } = req.user;
//   const {
//     employeeId,
//     title,
//     description,
//     metric,
//     target,
//     dueDate,
//     cycle,
//     progress = 0,
//     status = "not_started",
//   } = req.body;

//   try {
//     // Verify the target employee belongs to this company
//     const empCheck = await db.query(
//       "SELECT id FROM employees WHERE id = $1 AND company_id = $2",
//       [employeeId, companyId],
//     );
//     if (empCheck.rowCount === 0) {
//       return res
//         .status(404)
//         .json({ message: "Employee not found in this company." });
//     }

//     // Resolve createdBy to the HR admin's employee record (if exists)
//     const creatorResult = await db.query(
//       "SELECT id FROM employees WHERE user_id = $1 AND company_id = $2",
//       [userId, companyId],
//     );
//     const createdBy = creatorResult.rows[0]?.id ?? null;

//     const result = await db.query(
//       `INSERT INTO goals
//          (company_id, employee_id, title, description, metric,
//           target, due_date, progress, status, cycle, created_by)
//        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
//        RETURNING *`,
//       [
//         companyId,
//         employeeId,
//         title,
//         description ?? null,
//         metric ?? null,
//         target ?? null,
//         dueDate,
//         progress,
//         status,
//         cycle,
//         createdBy,
//       ],
//     );

//     return res.status(201).json({
//       message: "Goal created successfully.",
//       goal: formatGoal(result.rows[0]),
//     });
//   } catch (err) {
//     console.error("createGoal error:", err);
//     return res.status(500).json({ message: "Server error creating goal." });
//   }
// }

// // PUT /api/performance/goals/:id
// // Employee / Manager / HR — update goal fields or progress
// // Body (all optional): { title, description, metric, target, dueDate, progress, status }
// export async function updateGoal(req, res) {
//   if (validationFailed(req, res)) return;

//   const { id } = req.params;
//   const { companyId, userId } = req.user;

//   try {
//     // Fetch existing goal
//     const existing = await db.query(
//       "SELECT * FROM goals WHERE id = $1 AND company_id = $2",
//       [id, companyId],
//     );

//     if (existing.rowCount === 0) {
//       return res.status(404).json({ message: "Goal not found." });
//     }

//     const goal = existing.rows[0];

//     // If employee role, verify the goal belongs to them
//     if (req.user.role === "employee") {
//       const empResult = await db.query(
//         "SELECT id FROM employees WHERE user_id = $1 AND company_id = $2",
//         [userId, companyId],
//       );
//       if (
//         empResult.rowCount === 0 ||
//         empResult.rows[0].id !== goal.employee_id
//       ) {
//         return res
//           .status(403)
//           .json({ message: "You can only update your own goals." });
//       }
//     }

//     const {
//       title = goal.title,
//       description = goal.description,
//       metric = goal.metric,
//       target = goal.target,
//       dueDate = goal.due_date,
//       cycle = goal.cycle,
//       progress,
//       status,
//     } = req.body;

//     // Derive status from progress if progress was explicitly provided
//     const newProgress =
//       progress !== undefined ? Number(progress) : goal.progress;
//     const newStatus =
//       status !== undefined
//         ? status
//         : newProgress === 100
//           ? "completed"
//           : newProgress > 0
//             ? "in_progress"
//             : goal.status;

//     const updated = await db.query(
//       `UPDATE goals
//        SET
//          title       = $1,
//          description = $2,
//          metric      = $3,
//          target      = $4,
//          due_date    = $5,
//          cycle       = $6,
//          progress    = $7,
//          status      = $8,
//          updated_at  = NOW()
//        WHERE id = $9
//        RETURNING *`,
//       [
//         title,
//         description,
//         metric,
//         target,
//         dueDate,
//         cycle,
//         newProgress,
//         newStatus,
//         id,
//       ],
//     );

//     return res.status(200).json({
//       message: "Goal updated.",
//       goal: formatGoal(updated.rows[0]),
//     });
//   } catch (err) {
//     console.error("updateGoal error:", err);
//     return res.status(500).json({ message: "Server error updating goal." });
//   }
// }

// // GET /api/performance/goals/me
// // Employee — own goals only
// export async function getMyGoals(req, res) {
//   try {
//     const { userId, companyId } = req.user;
//     const { cycle, status } = req.query;

//     const empResult = await db.query(
//       "SELECT id FROM employees WHERE user_id = $1 AND company_id = $2",
//       [userId, companyId],
//     );

//     if (empResult.rowCount === 0) {
//       return res.status(404).json({ message: "Employee profile not found." });
//     }

//     const employeeId = empResult.rows[0].id;

//     const conditions = ["employee_id = $1"];
//     const params = [employeeId];
//     let idx = 2;

//     if (cycle) {
//       conditions.push(`cycle = $${idx++}`);
//       params.push(cycle);
//     }
//     if (status) {
//       conditions.push(`status = $${idx++}`);
//       params.push(status);
//     }

//     const result = await db.query(
//       `SELECT *
//        FROM goals
//        WHERE ${conditions.join(" AND ")}
//        ORDER BY due_date ASC`,
//       params,
//     );

//     return res.status(200).json({
//       goals: result.rows.map(formatGoal),
//       total: result.rowCount,
//     });
//   } catch (err) {
//     console.error("getMyGoals error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error fetching your goals." });
//   }
// }

// src/controllers/performance.controller.js
//
// Changes from original:
//  ✅ Removed validationFailed() — validation now handled by validate middleware
//  ✅ submitManagerAssessment status fixed: completed → hr_review
//  ✅ submitManagerAssessment final_rating uses COALESCE to prevent overwrite
//  ✅ createGoal now validates that the cycle exists before inserting
//  ✅ submitManagerAssessment and finalizeReview wrapped in DB transactions
//  ✅ employeeId resolved via req.user.employeeId when available (JWT optimization)

import { db } from "../config/db.js";

// ─── Serializers ───────────────────────────────────────────────
function formatReview(r) {
  return {
    id:                r.id,
    companyId:         r.company_id,
    employeeId:        r.employee_id,
    reviewerId:        r.reviewer_id,
    cycle:             r.cycle,
    periodStart:       r.period_start,
    periodEnd:         r.period_end,
    selfAssessment:    r.self_assessment,
    managerAssessment: r.manager_assessment,
    finalRating:       r.final_rating,
    status:            r.status,
    createdAt:         r.created_at,
    updatedAt:         r.updated_at,
  };
}

function formatGoal(g) {
  return {
    id:          g.id,
    companyId:   g.company_id,
    employeeId:  g.employee_id,
    title:       g.title,
    description: g.description,
    metric:      g.metric,
    target:      g.target,
    dueDate:     g.due_date,
    progress:    g.progress,
    status:      g.status,
    cycle:       g.cycle,
    createdBy:   g.created_by,
    createdAt:   g.created_at,
    updatedAt:   g.updated_at,
  };
}

function formatCycle(c) {
  return {
    id:          c.id,
    companyId:   c.company_id,
    name:        c.name,
    periodStart: c.period_start,
    periodEnd:   c.period_end,
    status:      c.status,
    createdAt:   c.created_at,
    updatedAt:   c.updated_at,
  };
}

// ─── Resolve employee ID from user ─────────────────────────────
// If JWT was built with employeeId (after auth.controller.js update),
// use it directly. Otherwise fall back to a DB lookup.
async function resolveEmployeeId(userId, companyId, employeeIdFromJwt = null) {
  if (employeeIdFromJwt) return employeeIdFromJwt;
  const result = await db.query(
    "SELECT id FROM employees WHERE user_id = $1 AND company_id = $2",
    [userId, companyId]
  );
  if (result.rowCount === 0) return null;
  return result.rows[0].id;
}

// ══════════════════════════════════════════════════════════════
// CYCLES
// ══════════════════════════════════════════════════════════════

export async function getCycles(req, res) {
  try {
    const { companyId } = req.user;
    const result = await db.query(
      `SELECT * FROM performance_cycles
       WHERE company_id = $1
       ORDER BY period_start DESC`,
      [companyId]
    );
    return res.status(200).json({
      cycles: result.rows.map(formatCycle),
      total:  result.rowCount,
    });
  } catch (err) {
    console.error("getCycles error:", err);
    return res.status(500).json({ message: "Server error fetching cycles." });
  }
}

export async function createCycle(req, res) {
  // Validation already handled by validate middleware
  const { companyId } = req.user;
  const { name, periodStart, periodEnd, status = "active" } = req.body;

  try {
    const dupe = await db.query(
      "SELECT id FROM performance_cycles WHERE company_id = $1 AND name = $2",
      [companyId, name]
    );
    if (dupe.rowCount > 0) {
      return res.status(409).json({ message: "A cycle with this name already exists." });
    }

    const result = await db.query(
      `INSERT INTO performance_cycles (company_id, name, period_start, period_end, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [companyId, name, periodStart, periodEnd, status]
    );
    return res.status(201).json({ cycle: formatCycle(result.rows[0]) });
  } catch (err) {
    console.error("createCycle error:", err);
    return res.status(500).json({ message: "Server error creating cycle." });
  }
}

// ══════════════════════════════════════════════════════════════
// REVIEWS
// ══════════════════════════════════════════════════════════════

export async function getAllReviews(req, res) {
  try {
    const { companyId } = req.user;
    const { cycle, status, employeeId } = req.query;

    const conditions = ["pr.company_id = $1"];
    const params     = [companyId];
    let   idx        = 2;

    if (cycle)      { conditions.push(`pr.cycle = $${idx++}`);       params.push(cycle); }
    if (status)     { conditions.push(`pr.status = $${idx++}`);      params.push(status); }
    if (employeeId) { conditions.push(`pr.employee_id = $${idx++}`); params.push(employeeId); }

    const result = await db.query(
      `SELECT
         pr.*,
         e.first_name AS employee_first_name,
         e.last_name  AS employee_last_name,
         e.email      AS employee_email,
         r.first_name AS reviewer_first_name,
         r.last_name  AS reviewer_last_name
       FROM performance_reviews pr
       JOIN employees e ON e.id = pr.employee_id
       LEFT JOIN employees r ON r.id = pr.reviewer_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY pr.created_at DESC`,
      params
    );

    const reviews = result.rows.map((row) => ({
      ...formatReview(row),
      employee: {
        firstName: row.employee_first_name,
        lastName:  row.employee_last_name,
        email:     row.employee_email,
      },
      reviewer: row.reviewer_first_name
        ? { firstName: row.reviewer_first_name, lastName: row.reviewer_last_name }
        : null,
    }));

    return res.status(200).json({ reviews, total: result.rowCount });
  } catch (err) {
    console.error("getAllReviews error:", err);
    return res.status(500).json({ message: "Server error fetching reviews." });
  }
}

export async function getMyReviews(req, res) {
  try {
    const { userId, companyId, employeeId: empFromJwt } = req.user;
    const employeeId = await resolveEmployeeId(userId, companyId, empFromJwt);

    if (!employeeId) {
      return res.status(404).json({ message: "Employee profile not found." });
    }

    const result = await db.query(
      `SELECT * FROM performance_reviews
       WHERE employee_id = $1
       ORDER BY created_at DESC`,
      [employeeId]
    );

    return res.status(200).json({
      reviews: result.rows.map(formatReview),
      total:   result.rowCount,
    });
  } catch (err) {
    console.error("getMyReviews error:", err);
    return res.status(500).json({ message: "Server error fetching your reviews." });
  }
}

// PATCH /api/performance/reviews/:id/self-assessment
export async function submitSelfAssessment(req, res) {
  // Validation already handled by validate middleware
  const { id }                                 = req.params;
  const { userId, companyId, employeeId: eid } = req.user;

  try {
    const employeeId = await resolveEmployeeId(userId, companyId, eid);
    if (!employeeId) {
      return res.status(404).json({ message: "Employee profile not found." });
    }

    const reviewResult = await db.query(
      "SELECT id, status, employee_id FROM performance_reviews WHERE id = $1 AND company_id = $2",
      [id, companyId]
    );
    if (reviewResult.rowCount === 0) {
      return res.status(404).json({ message: "Review not found." });
    }

    const review = reviewResult.rows[0];
    if (review.employee_id !== employeeId) {
      return res.status(403).json({ message: "This review does not belong to you." });
    }
    if (review.status !== "pending") {
      return res.status(409).json({
        message: `Self-assessment cannot be submitted when review status is '${review.status}'.`,
      });
    }

    const updated = await db.query(
      `UPDATE performance_reviews
       SET self_assessment = $1,
           status          = 'self_completed',
           updated_at      = NOW()
       WHERE id = $2
       RETURNING *`,
      [req.body, id]
    );

    return res.status(200).json({
      message: "Self-assessment submitted.",
      review:  formatReview(updated.rows[0]),
    });
  } catch (err) {
    console.error("submitSelfAssessment error:", err);
    return res.status(500).json({ message: "Server error submitting self-assessment." });
  }
}

// PATCH /api/performance/reviews/:id/manager-assessment
// ✅ FIX: status now advances to 'hr_review' (not 'completed')
// ✅ FIX: final_rating uses COALESCE to prevent overwriting an existing value
export async function submitManagerAssessment(req, res) {
  const { id }        = req.params;
  const { companyId } = req.user;

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const reviewResult = await client.query(
      "SELECT id, status, final_rating FROM performance_reviews WHERE id = $1 AND company_id = $2",
      [id, companyId]
    );
    if (reviewResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Review not found." });
    }

    const review = reviewResult.rows[0];
    if (review.status !== "self_completed") {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: `Manager assessment can only be submitted when status is 'self_completed'. Current: '${review.status}'.`,
      });
    }

    const { sections, overallComment, finalRating } = req.body;
    const assessment = { sections, overallComment };

    // ✅ COALESCE: only update final_rating if $2 is provided AND no rating exists yet
    const updated = await client.query(
      `UPDATE performance_reviews
       SET manager_assessment = $1,
           final_rating       = COALESCE($2, final_rating),
           status             = 'hr_review',
           updated_at         = NOW()
       WHERE id = $3
       RETURNING *`,
      [assessment, finalRating ?? null, id]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Manager assessment submitted. Review is now awaiting HR finalization.",
      review:  formatReview(updated.rows[0]),
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("submitManagerAssessment error:", err);
    return res.status(500).json({ message: "Server error submitting manager assessment." });
  } finally {
    client.release();
  }
}

// PATCH /api/performance/reviews/:id/finalize
export async function finalizeReview(req, res) {
  const { id }        = req.params;
  const { companyId } = req.user;

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const reviewResult = await client.query(
      "SELECT id, status FROM performance_reviews WHERE id = $1 AND company_id = $2",
      [id, companyId]
    );
    if (reviewResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Review not found." });
    }

    const review = reviewResult.rows[0];
    if (!["hr_review", "self_completed"].includes(review.status)) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: `Review cannot be finalized from status '${review.status}'.`,
      });
    }

    const { finalRating } = req.body;

    const updated = await client.query(
      `UPDATE performance_reviews
       SET final_rating = $1,
           status       = 'completed',
           updated_at   = NOW()
       WHERE id = $2
       RETURNING *`,
      [finalRating, id]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Review finalized and locked.",
      review:  formatReview(updated.rows[0]),
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("finalizeReview error:", err);
    return res.status(500).json({ message: "Server error finalizing review." });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════════════
// GOALS
// ══════════════════════════════════════════════════════════════

export async function getAllGoals(req, res) {
  try {
    const { companyId } = req.user;
    const { employeeId, cycle, status } = req.query;

    const conditions = ["g.company_id = $1"];
    const params     = [companyId];
    let   idx        = 2;

    if (employeeId) { conditions.push(`g.employee_id = $${idx++}`); params.push(employeeId); }
    if (cycle)      { conditions.push(`g.cycle = $${idx++}`);       params.push(cycle); }
    if (status)     { conditions.push(`g.status = $${idx++}`);      params.push(status); }

    const result = await db.query(
      `SELECT g.*, e.first_name AS employee_first_name, e.last_name AS employee_last_name
       FROM goals g
       JOIN employees e ON e.id = g.employee_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY g.due_date ASC`,
      params
    );

    const goals = result.rows.map((row) => ({
      ...formatGoal(row),
      employee: { firstName: row.employee_first_name, lastName: row.employee_last_name },
    }));

    return res.status(200).json({ goals, total: result.rowCount });
  } catch (err) {
    console.error("getAllGoals error:", err);
    return res.status(500).json({ message: "Server error fetching goals." });
  }
}

export async function createGoal(req, res) {
  // Validation already handled by validate middleware
  const { companyId, userId } = req.user;
  const {
    employeeId, title, description, metric, target,
    dueDate, cycle, progress = 0, status = "not_started",
  } = req.body;

  try {
    // ✅ Validate cycle exists for this company
    const cycleCheck = await db.query(
      "SELECT id FROM performance_cycles WHERE name = $1 AND company_id = $2",
      [cycle, companyId]
    );
    if (cycleCheck.rowCount === 0) {
      return res.status(404).json({ message: `Cycle '${cycle}' not found. Create the cycle first.` });
    }

    // Verify target employee belongs to this company
    const empCheck = await db.query(
      "SELECT id FROM employees WHERE id = $1 AND company_id = $2",
      [employeeId, companyId]
    );
    if (empCheck.rowCount === 0) {
      return res.status(404).json({ message: "Employee not found in this company." });
    }

    // Resolve the creator's employee record
    const creatorResult = await db.query(
      "SELECT id FROM employees WHERE user_id = $1 AND company_id = $2",
      [userId, companyId]
    );
    const createdBy = creatorResult.rows[0]?.id ?? null;

    const result = await db.query(
      `INSERT INTO goals
         (company_id, employee_id, title, description, metric,
          target, due_date, progress, status, cycle, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        companyId, employeeId, title,
        description ?? null, metric ?? null, target ?? null,
        dueDate, progress, status, cycle, createdBy,
      ]
    );

    return res.status(201).json({
      message: "Goal created successfully.",
      goal:    formatGoal(result.rows[0]),
    });
  } catch (err) {
    console.error("createGoal error:", err);
    return res.status(500).json({ message: "Server error creating goal." });
  }
}

export async function updateGoal(req, res) {
  // Validation already handled by validate middleware
  const { id }                                  = req.params;
  const { companyId, userId, employeeId: eid }  = req.user;

  try {
    const existing = await db.query(
      "SELECT * FROM goals WHERE id = $1 AND company_id = $2",
      [id, companyId]
    );
    if (existing.rowCount === 0) {
      return res.status(404).json({ message: "Goal not found." });
    }

    const goal = existing.rows[0];

    // Employees can only update their own goals
    if (req.user.role === "employee") {
      const employeeId = await resolveEmployeeId(userId, companyId, eid);
      if (!employeeId || employeeId !== goal.employee_id) {
        return res.status(403).json({ message: "You can only update your own goals." });
      }
    }

    const {
      title       = goal.title,
      description = goal.description,
      metric      = goal.metric,
      target      = goal.target,
      dueDate     = goal.due_date,
      cycle       = goal.cycle,
      progress,
      status,
    } = req.body;

    const newProgress = progress !== undefined ? Number(progress) : Number(goal.progress);
    const newStatus   = status !== undefined
      ? status
      : newProgress === 100
        ? "completed"
        : newProgress > 0
          ? "in_progress"
          : goal.status;

    const updated = await db.query(
      `UPDATE goals
       SET title       = $1, description = $2, metric = $3, target = $4,
           due_date    = $5, cycle       = $6, progress = $7,
           status      = $8, updated_at  = NOW()
       WHERE id = $9
       RETURNING *`,
      [title, description, metric, target, dueDate, cycle, newProgress, newStatus, id]
    );

    return res.status(200).json({ message: "Goal updated.", goal: formatGoal(updated.rows[0]) });
  } catch (err) {
    console.error("updateGoal error:", err);
    return res.status(500).json({ message: "Server error updating goal." });
  }
}

export async function getMyGoals(req, res) {
  try {
    const { userId, companyId, employeeId: eid } = req.user;
    const { cycle, status } = req.query;

    const employeeId = await resolveEmployeeId(userId, companyId, eid);
    if (!employeeId) {
      return res.status(404).json({ message: "Employee profile not found." });
    }

    const conditions = ["employee_id = $1"];
    const params     = [employeeId];
    let   idx        = 2;

    if (cycle)  { conditions.push(`cycle = $${idx++}`);  params.push(cycle); }
    if (status) { conditions.push(`status = $${idx++}`); params.push(status); }

    const result = await db.query(
      `SELECT * FROM goals WHERE ${conditions.join(" AND ")} ORDER BY due_date ASC`,
      params
    );

    return res.status(200).json({ goals: result.rows.map(formatGoal), total: result.rowCount });
  } catch (err) {
    console.error("getMyGoals error:", err);
    return res.status(500).json({ message: "Server error fetching your goals." });
  }
}