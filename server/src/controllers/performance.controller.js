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
    id: r.id,
    companyId: r.company_id,
    employeeId: r.employee_id,
    reviewerId: r.reviewer_id,
    cycle: r.cycle,
    periodStart: r.period_start,
    periodEnd: r.period_end,
    selfAssessment: r.self_assessment,
    managerAssessment: r.manager_assessment,
    finalRating: r.final_rating,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function formatGoal(g) {
  return {
    id: g.id,
    companyId: g.company_id,
    employeeId: g.employee_id,
    title: g.title,
    description: g.description,
    metric: g.metric,
    target: g.target,
    dueDate: g.due_date,
    progress: g.progress,
    status: g.status,
    cycle: g.cycle,
    createdBy: g.created_by,
    createdAt: g.created_at,
    updatedAt: g.updated_at,
  };
}

function formatCycle(c) {
  return {
    id: c.id,
    companyId: c.company_id,
    name: c.name,
    periodStart: c.period_start,
    periodEnd: c.period_end,
    status: c.status,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

// ── Helper: format a PIP row from DB ─────────────────────────────────────────
function formatPIP(row) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName:
      row.employee_first_name && row.employee_last_name
        ? `${row.employee_first_name} ${row.employee_last_name}`
        : (row.employee_name ?? null),
    firstName: row.employee_first_name ?? null,
    lastName: row.employee_last_name ?? null,
    departmentName: row.department_name ?? null,
    reason: row.reason,
    reviewDate: row.review_date,
    period: row.period ?? null,
    status: row.status,
    progress: row.progress ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    goals: [], // populated separately when needed
  };
}

// ─── Resolve employee ID from user ─────────────────────────────
// If JWT was built with employeeId (after auth.controller.js update),
// use it directly. Otherwise fall back to a DB lookup.
async function resolveEmployeeId(userId, companyId, employeeIdFromJwt = null) {
  if (employeeIdFromJwt) return employeeIdFromJwt;
  const result = await db.query(
    "SELECT id FROM employees WHERE user_id = $1 AND company_id = $2",
    [userId, companyId],
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
      [companyId],
    );
    return res.status(200).json({
      cycles: result.rows.map(formatCycle),
      total: result.rowCount,
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
      [companyId, name],
    );
    if (dupe.rowCount > 0) {
      return res
        .status(409)
        .json({ message: "A cycle with this name already exists." });
    }

    const result = await db.query(
      `INSERT INTO performance_cycles (company_id, name, period_start, period_end, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [companyId, name, periodStart, periodEnd, status],
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
    const params = [companyId];
    let idx = 2;

    if (cycle) {
      conditions.push(`pr.cycle = $${idx++}`);
      params.push(cycle);
    }
    if (status) {
      conditions.push(`pr.status = $${idx++}`);
      params.push(status);
    }
    if (employeeId) {
      conditions.push(`pr.employee_id = $${idx++}`);
      params.push(employeeId);
    }

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
      params,
    );

    const reviews = result.rows.map((row) => ({
      ...formatReview(row),
      employee: {
        firstName: row.employee_first_name,
        lastName: row.employee_last_name,
        email: row.employee_email,
      },
      reviewer: row.reviewer_first_name
        ? {
            firstName: row.reviewer_first_name,
            lastName: row.reviewer_last_name,
          }
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
      [employeeId],
    );

    return res.status(200).json({
      reviews: result.rows.map(formatReview),
      total: result.rowCount,
    });
  } catch (err) {
    console.error("getMyReviews error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching your reviews." });
  }
}

// PATCH /api/performance/reviews/:id/self-assessment
export async function submitSelfAssessment(req, res) {
  // Validation already handled by validate middleware
  const { id } = req.params;
  const { userId, companyId, employeeId: eid } = req.user;

  try {
    const employeeId = await resolveEmployeeId(userId, companyId, eid);
    if (!employeeId) {
      return res.status(404).json({ message: "Employee profile not found." });
    }

    const reviewResult = await db.query(
      "SELECT id, status, employee_id FROM performance_reviews WHERE id = $1 AND company_id = $2",
      [id, companyId],
    );
    if (reviewResult.rowCount === 0) {
      return res.status(404).json({ message: "Review not found." });
    }

    const review = reviewResult.rows[0];
    if (review.employee_id !== employeeId) {
      return res
        .status(403)
        .json({ message: "This review does not belong to you." });
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
      [req.body, id],
    );

    return res.status(200).json({
      message: "Self-assessment submitted.",
      review: formatReview(updated.rows[0]),
    });
  } catch (err) {
    console.error("submitSelfAssessment error:", err);
    return res
      .status(500)
      .json({ message: "Server error submitting self-assessment." });
  }
}

// PATCH /api/performance/reviews/:id/manager-assessment
// ✅ FIX: status now advances to 'hr_review' (not 'completed')
// ✅ FIX: final_rating uses COALESCE to prevent overwriting an existing value
export async function submitManagerAssessment(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const reviewResult = await client.query(
      "SELECT id, status, final_rating FROM performance_reviews WHERE id = $1 AND company_id = $2",
      [id, companyId],
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
      [assessment, finalRating ?? null, id],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message:
        "Manager assessment submitted. Review is now awaiting HR finalization.",
      review: formatReview(updated.rows[0]),
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("submitManagerAssessment error:", err);
    return res
      .status(500)
      .json({ message: "Server error submitting manager assessment." });
  } finally {
    client.release();
  }
}

// PATCH /api/performance/reviews/:id/finalize
export async function finalizeReview(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const reviewResult = await client.query(
      "SELECT id, status FROM performance_reviews WHERE id = $1 AND company_id = $2",
      [id, companyId],
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
      [finalRating, id],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Review finalized and locked.",
      review: formatReview(updated.rows[0]),
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
    const params = [companyId];
    let idx = 2;

    if (employeeId) {
      conditions.push(`g.employee_id = $${idx++}`);
      params.push(employeeId);
    }
    if (cycle) {
      conditions.push(`g.cycle = $${idx++}`);
      params.push(cycle);
    }
    if (status) {
      conditions.push(`g.status = $${idx++}`);
      params.push(status);
    }

    const result = await db.query(
      `SELECT g.*, e.first_name AS employee_first_name, e.last_name AS employee_last_name
       FROM goals g
       JOIN employees e ON e.id = g.employee_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY g.due_date ASC`,
      params,
    );

    const goals = result.rows.map((row) => ({
      ...formatGoal(row),
      employee: {
        firstName: row.employee_first_name,
        lastName: row.employee_last_name,
      },
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
    employeeId,
    title,
    description,
    metric,
    target,
    dueDate,
    cycle,
    progress = 0,
    status = "not_started",
  } = req.body;

  try {
    // ✅ Validate cycle exists for this company
    const cycleCheck = await db.query(
      "SELECT id FROM performance_cycles WHERE name = $1 AND company_id = $2",
      [cycle, companyId],
    );
    if (cycleCheck.rowCount === 0) {
      return res
        .status(404)
        .json({
          message: `Cycle '${cycle}' not found. Create the cycle first.`,
        });
    }

    // Verify target employee belongs to this company
    const empCheck = await db.query(
      "SELECT id FROM employees WHERE id = $1 AND company_id = $2",
      [employeeId, companyId],
    );
    if (empCheck.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Employee not found in this company." });
    }

    // Resolve the creator's employee record
    const creatorResult = await db.query(
      "SELECT id FROM employees WHERE user_id = $1 AND company_id = $2",
      [userId, companyId],
    );
    const createdBy = creatorResult.rows[0]?.id ?? null;

    const result = await db.query(
      `INSERT INTO goals
         (company_id, employee_id, title, description, metric,
          target, due_date, progress, status, cycle, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        companyId,
        employeeId,
        title,
        description ?? null,
        metric ?? null,
        target ?? null,
        dueDate,
        progress,
        status,
        cycle,
        createdBy,
      ],
    );

    return res.status(201).json({
      message: "Goal created successfully.",
      goal: formatGoal(result.rows[0]),
    });
  } catch (err) {
    console.error("createGoal error:", err);
    return res.status(500).json({ message: "Server error creating goal." });
  }
}

export async function updateGoal(req, res) {
  // Validation already handled by validate middleware
  const { id } = req.params;
  const { companyId, userId, employeeId: eid } = req.user;

  try {
    const existing = await db.query(
      "SELECT * FROM goals WHERE id = $1 AND company_id = $2",
      [id, companyId],
    );
    if (existing.rowCount === 0) {
      return res.status(404).json({ message: "Goal not found." });
    }

    const goal = existing.rows[0];

    // Employees can only update their own goals
    if (req.user.role === "employee") {
      const employeeId = await resolveEmployeeId(userId, companyId, eid);
      if (!employeeId || employeeId !== goal.employee_id) {
        return res
          .status(403)
          .json({ message: "You can only update your own goals." });
      }
    }

    const {
      title = goal.title,
      description = goal.description,
      metric = goal.metric,
      target = goal.target,
      dueDate = goal.due_date,
      cycle = goal.cycle,
      progress,
      status,
    } = req.body;

    const newProgress =
      progress !== undefined ? Number(progress) : Number(goal.progress);
    const newStatus =
      status !== undefined
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
      [
        title,
        description,
        metric,
        target,
        dueDate,
        cycle,
        newProgress,
        newStatus,
        id,
      ],
    );

    return res
      .status(200)
      .json({ message: "Goal updated.", goal: formatGoal(updated.rows[0]) });
  } catch (err) {
    console.error("updateGoal error:", err);
    return res.status(500).json({ message: "Server error updating goal." });
  }
}
// export async function updateGoalProgress(req, res) {
//   const { id } = req.params;
//   const { companyId, userId, employeeId: eid } = req.user;
//   const { progress } = req.body;

//   // Basic validation
//   if (progress === undefined) {
//     return res.status(400).json({ message: "Progress value is required." });
//   }

//   try {
//     // 1. Find the goal and ensure it belongs to the right company
//     const existing = await db.query(
//       "SELECT * FROM goals WHERE id = $1 AND company_id = $2",
//       [id, companyId],
//     );

//     if (existing.rowCount === 0) {
//       return res.status(404).json({ message: "Goal not found." });
//     }

//     const goal = existing.rows[0];

//     // 2. Permission Check: Employees can only update their own goals
//     if (req.user.role === "employee") {
//       const employeeId = await resolveEmployeeId(userId, companyId, eid);
//       if (!employeeId || employeeId !== goal.employee_id) {
//         return res
//           .status(403)
//           .json({
//             message: "You can only update progress for your own goals.",
//           });
//       }
//     }

//     // 3. Calculate new status based on progress
//     const newProgress = Number(progress);
//     let newStatus = goal.status;

//     if (newProgress >= 100) {
//       newStatus = "completed";
//     } else if (newProgress > 0) {
//       newStatus = "in_progress";
//     } else if (newProgress === 0) {
//       newStatus = "not_started";
//     }

//     // 4. Update the database using the correct 'progress' column
//     const updated = await db.query(
//       `UPDATE goals
//        SET progress = $1,
//            status = $2,
//            updated_at = NOW()
//        WHERE id = $3
//        RETURNING *`,
//       [newProgress, newStatus, id],
//     );

//     return res.status(200).json({
//       message: "Goal progress updated.",
//       goal: formatGoal(updated.rows[0]),
//     });
//   } catch (err) {
//     console.error("updateGoalProgress error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error updating goal progress." });
//   }
// }

export async function updateGoalProgress(req, res) {
  const { id } = req.params;
  const { companyId, userId, employeeId: eid } = req.user;
  const { progress } = req.body;

  if (progress === undefined || progress === null) {
    return res.status(400).json({ message: "Progress value is required." });
  }

  const newProgress = Number(progress);
  if (isNaN(newProgress) || newProgress < 0 || newProgress > 100) {
    return res
      .status(400)
      .json({ message: "Progress must be a number between 0 and 100." });
  }

  try {
    // 1. Find goal and verify it belongs to this company
    const existing = await db.query(
      "SELECT * FROM goals WHERE id = $1 AND company_id = $2",
      [id, companyId],
    );

    if (existing.rowCount === 0) {
      return res.status(404).json({ message: "Goal not found." });
    }

    const goal = existing.rows[0];

    // 2. Employees can only update their own goals
    if (req.user.role === "employee") {
      const employeeId = await resolveEmployeeId(userId, companyId, eid);
      if (!employeeId || employeeId !== goal.employee_id) {
        return res.status(403).json({
          message: "You can only update progress for your own goals.",
        });
      }
    }

    // 3. Derive new status from progress value
    let newStatus;
    if (newProgress >= 100) {
      newStatus = "completed";
    } else if (newProgress > 0) {
      newStatus = "in_progress";
    } else {
      newStatus = "not_started";
    }

    // 4. Update — only columns that actually exist in your DB
    const updated = await db.query(
      `UPDATE goals
       SET progress   = $1,
           status     = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [newProgress, newStatus, id],
    );

    return res.status(200).json({
      message: "Goal progress updated.",
      goal: formatGoal(updated.rows[0]),
    });
  } catch (err) {
    console.error("updateGoalProgress error:", err);
    return res
      .status(500)
      .json({ message: "Server error updating goal progress." });
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
    const params = [employeeId];
    let idx = 2;

    if (cycle) {
      conditions.push(`cycle = $${idx++}`);
      params.push(cycle);
    }
    if (status) {
      conditions.push(`status = $${idx++}`);
      params.push(status);
    }

    const result = await db.query(
      `SELECT * FROM goals WHERE ${conditions.join(" AND ")} ORDER BY due_date ASC`,
      params,
    );

    return res
      .status(200)
      .json({ goals: result.rows.map(formatGoal), total: result.rowCount });
  } catch (err) {
    console.error("getMyGoals error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching your goals." });
  }
}

// ── LIST PIPs ─────────────────────────────────────────────────────────────────
// GET /api/performance/pip?status=active&employeeId=uuid
export async function listPIPs(req, res) {
  try {
    const { companyId } = req.user;
    const { status, employeeId } = req.query;

    const conditions = ["p.company_id = $1"];
    const params = [companyId];
    let idx = 2;

    if (status) {
      conditions.push(`p.status = $${idx++}`);
      params.push(status);
    }
    if (employeeId) {
      conditions.push(`p.employee_id = $${idx++}`);
      params.push(employeeId);
    }

    const result = await db.query(
      `SELECT
         p.*,
         e.first_name  AS employee_first_name,
         e.last_name   AS employee_last_name,
         d.name        AS department_name
       FROM performance_improvement_plans p
       JOIN employees   e ON e.id = p.employee_id
       LEFT JOIN departments d ON d.id = e.department_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY p.created_at DESC`,
      params,
    );

    // Fetch goals for each PIP in one query
    if (result.rowCount > 0) {
      const pipIds = result.rows.map((r) => r.id);
      const goalsResult = await db.query(
        `SELECT * FROM pip_goals WHERE pip_id = ANY($1::uuid[])`,
        [pipIds],
      );
      const goalsByPip = {};
      goalsResult.rows.forEach((g) => {
        if (!goalsByPip[g.pip_id]) goalsByPip[g.pip_id] = [];
        goalsByPip[g.pip_id].push({
          id: g.id,
          title: g.title,
          target: g.target,
        });
      });

      const pips = result.rows.map((row) => ({
        ...formatPIP(row),
        goals: goalsByPip[row.id] ?? [],
      }));

      return res.status(200).json({ pips, total: result.rowCount });
    }

    return res.status(200).json({ pips: [], total: 0 });
  } catch (err) {
    console.error("listPIPs error:", err);
    return res.status(500).json({ message: "Server error fetching PIPs." });
  }
}

// ── GET SINGLE PIP ────────────────────────────────────────────────────────────
// GET /api/performance/pip/:pipId
export async function getPIP(req, res) {
  try {
    const { companyId } = req.user;
    const { pipId } = req.params;

    const result = await db.query(
      `SELECT
         p.*,
         e.first_name  AS employee_first_name,
         e.last_name   AS employee_last_name,
         d.name        AS department_name
       FROM performance_improvement_plans p
       JOIN employees   e ON e.id = p.employee_id
       LEFT JOIN departments d ON d.id = e.department_id
       WHERE p.id = $1 AND p.company_id = $2`,
      [pipId, companyId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "PIP not found." });
    }

    const goalsResult = await db.query(
      `SELECT * FROM pip_goals WHERE pip_id = $1`,
      [pipId],
    );

    const pip = {
      ...formatPIP(result.rows[0]),
      goals: goalsResult.rows.map((g) => ({
        id: g.id,
        title: g.title,
        target: g.target,
      })),
    };

    return res.status(200).json({ pip });
  } catch (err) {
    console.error("getPIP error:", err);
    return res.status(500).json({ message: "Server error fetching PIP." });
  }
}

// ── CREATE PIP ────────────────────────────────────────────────────────────────
// POST /api/performance/pip/:employeeId
// Body: { reason, reviewDate, period?, goals: [{ title, target }] }
export async function createPIP(req, res) {
  try {
    const { companyId, userId } = req.user;
    const { employeeId } = req.params;
    const { reason, reviewDate, period, goals = [] } = req.body;

    if (!reason || !reviewDate) {
      return res
        .status(400)
        .json({ message: "reason and reviewDate are required." });
    }

    // Verify employee belongs to company
    const empCheck = await db.query(
      "SELECT id FROM employees WHERE id = $1 AND company_id = $2",
      [employeeId, companyId],
    );
    if (empCheck.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Employee not found in this company." });
    }

    // Check if employee already has an active PIP
    const existing = await db.query(
      "SELECT id FROM performance_improvement_plans WHERE employee_id = $1 AND company_id = $2 AND status = 'active'",
      [employeeId, companyId],
    );
    if (existing.rowCount > 0) {
      return res
        .status(409)
        .json({ message: "This employee already has an active PIP." });
    }

    // Resolve creator
    const creatorResult = await db.query(
      "SELECT id FROM employees WHERE user_id = $1 AND company_id = $2",
      [userId, companyId],
    );
    const createdBy = creatorResult.rows[0]?.id ?? null;

    // Insert PIP
    const pipResult = await db.query(
      `INSERT INTO performance_improvement_plans
         (company_id, employee_id, reason, review_date, period, status, progress, created_by)
       VALUES ($1, $2, $3, $4, $5, 'active', 0, $6)
       RETURNING *`,
      [companyId, employeeId, reason, reviewDate, period ?? null, createdBy],
    );

    const pip = pipResult.rows[0];

    // Insert goals
    const insertedGoals = [];
    for (const g of goals.filter((g) => g.title?.trim())) {
      const gr = await db.query(
        "INSERT INTO pip_goals (pip_id, title, target) VALUES ($1, $2, $3) RETURNING *",
        [pip.id, g.title.trim(), g.target ?? 100],
      );
      insertedGoals.push({
        id: gr.rows[0].id,
        title: gr.rows[0].title,
        target: gr.rows[0].target,
      });
    }

    return res.status(201).json({
      message: "PIP created successfully.",
      pip: { ...formatPIP(pip), goals: insertedGoals },
    });
  } catch (err) {
    console.error("createPIP error:", err);
    return res.status(500).json({ message: "Server error creating PIP." });
  }
}

// ── UPDATE PIP STATUS ─────────────────────────────────────────────────────────
// PATCH /api/performance/pip/:pipId/status
// Body: { status: "active" | "completed" | "failed" }
export async function updatePIPStatus(req, res) {
  try {
    const { companyId } = req.user;
    const { pipId } = req.params;
    const { status } = req.body;

    const allowed = ["active", "completed", "failed"];
    if (!allowed.includes(status)) {
      return res
        .status(400)
        .json({ message: `status must be one of: ${allowed.join(", ")}` });
    }

    const result = await db.query(
      `UPDATE performance_improvement_plans
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND company_id = $3
       RETURNING *`,
      [status, pipId, companyId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "PIP not found." });
    }

    return res.status(200).json({
      message: `PIP marked as ${status}.`,
      pip: formatPIP(result.rows[0]),
    });
  } catch (err) {
    console.error("updatePIPStatus error:", err);
    return res
      .status(500)
      .json({ message: "Server error updating PIP status." });
  }
}

// ── UPDATE PIP PROGRESS ───────────────────────────────────────────────────────
// PATCH /api/performance/pip/:pipId/progress
// Body: { progress: 0–100 }
export async function updatePIPProgress(req, res) {
  try {
    const { companyId } = req.user;
    const { pipId } = req.params;
    const progress = Number(req.body.progress);

    if (isNaN(progress) || progress < 0 || progress > 100) {
      return res
        .status(400)
        .json({ message: "progress must be a number between 0 and 100." });
    }

    // Auto-complete if 100%
    const newStatus = progress === 100 ? "completed" : undefined;

    const result = await db.query(
      `UPDATE performance_improvement_plans
       SET progress   = $1,
           status     = COALESCE($2, status),
           updated_at = NOW()
       WHERE id = $3 AND company_id = $4
       RETURNING *`,
      [progress, newStatus ?? null, pipId, companyId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "PIP not found." });
    }

    return res.status(200).json({
      message: "PIP progress updated.",
      pip: formatPIP(result.rows[0]),
    });
  } catch (err) {
    console.error("updatePIPProgress error:", err);
    return res
      .status(500)
      .json({ message: "Server error updating PIP progress." });
  }
}

// ── UPDATE PIP (reason, reviewDate, period, goals) ────────────────────────────
// PUT /api/performance/pip/:pipId
// Body: { reason?, reviewDate?, period?, goals?: [{ title, target }] }
export async function updatePIP(req, res) {
  try {
    const { companyId } = req.user;
    const { pipId } = req.params;
    const { reason, reviewDate, period, goals } = req.body;

    const existing = await db.query(
      "SELECT * FROM performance_improvement_plans WHERE id = $1 AND company_id = $2",
      [pipId, companyId],
    );
    if (existing.rowCount === 0) {
      return res.status(404).json({ message: "PIP not found." });
    }

    const pip = existing.rows[0];

    const result = await db.query(
      `UPDATE performance_improvement_plans
       SET reason      = $1,
           review_date = $2,
           period      = $3,
           updated_at  = NOW()
       WHERE id = $4
       RETURNING *`,
      [
        reason ?? pip.reason,
        reviewDate ?? pip.review_date,
        period ?? pip.period,
        pipId,
      ],
    );

    // Replace goals if provided
    if (Array.isArray(goals)) {
      await db.query("DELETE FROM pip_goals WHERE pip_id = $1", [pipId]);
      for (const g of goals.filter((g) => g.title?.trim())) {
        await db.query(
          "INSERT INTO pip_goals (pip_id, title, target) VALUES ($1, $2, $3)",
          [pipId, g.title.trim(), g.target ?? 100],
        );
      }
    }

    const goalsResult = await db.query(
      "SELECT * FROM pip_goals WHERE pip_id = $1",
      [pipId],
    );

    return res.status(200).json({
      message: "PIP updated.",
      pip: {
        ...formatPIP(result.rows[0]),
        goals: goalsResult.rows.map((g) => ({
          id: g.id,
          title: g.title,
          target: g.target,
        })),
      },
    });
  } catch (err) {
    console.error("updatePIP error:", err);
    return res.status(500).json({ message: "Server error updating PIP." });
  }
}

// ── DELETE PIP ────────────────────────────────────────────────────────────────
// DELETE /api/performance/pip/:pipId
export async function deletePIP(req, res) {
  try {
    const { companyId } = req.user;
    const { pipId } = req.params;

    const result = await db.query(
      "DELETE FROM performance_improvement_plans WHERE id = $1 AND company_id = $2 RETURNING id",
      [pipId, companyId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "PIP not found." });
    }

    return res.status(200).json({ message: "PIP deleted." });
  } catch (err) {
    console.error("deletePIP error:", err);
    return res.status(500).json({ message: "Server error deleting PIP." });
  }
}
