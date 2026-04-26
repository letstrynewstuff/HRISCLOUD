// src/controllers/goals.controller.js
//
// Endpoints:
//   POST  /api/goals                    → create KPI/goal
//   GET   /api/goals                    → list all goals (HR)
//   GET   /api/goals/me                 → my goals (employee)
//   GET   /api/goals/:id                → single goal
//   PUT   /api/goals/:id                → update goal
//   POST  /api/goals/:id/assign         → assign goal to employees[]
//   POST  /api/goals/:id/progress       → update progress
//   DELETE /api/goals/:id               → soft delete

import { db } from "../config/db.js";

function fmt(g) {
  return {
    id: g.id,
    companyId: g.company_id,
    employeeId: g.employee_id,
    title: g.title,
    description: g.description,
    metric: g.metric,
    target: Number(g.target || 100),
    achievedValue: Number(g.achieved_value || 0),
    dueDate: g.due_date,
    progress: Number(g.progress || 0),
    status: g.status,
    cycle: g.cycle,
    createdBy: g.created_by,
    createdAt: g.created_at,
    updatedAt: g.updated_at,
  };
}

// ══════════════════════════════════════════════════════════════
// POST /api/goals
// Body: { title, description, metric, target, dueDate, cycle,
//         employeeId (optional — assign immediately) }
// ══════════════════════════════════════════════════════════════
export async function createGoal(req, res) {
  const { companyId, userId } = req.user;
  const {
    title,
    description,
    metric,
    target,
    dueDate,
    cycle,
    employeeId,
    progress = 0,
    status = "not_started",
  } = req.body;

  if (!title || !dueDate || !cycle) {
    return res
      .status(400)
      .json({ message: "title, dueDate and cycle are required." });
  }

  try {
    const creatorResult = await db.query(
      "SELECT id FROM employees WHERE user_id = $1 AND company_id = $2",
      [userId, companyId],
    );
    const createdBy = creatorResult.rows[0]?.id ?? null;

    // If employeeId provided, verify it belongs to this company
    if (employeeId) {
      const check = await db.query(
        "SELECT id FROM employees WHERE id = $1 AND company_id = $2",
        [employeeId, companyId],
      );
      if (check.rowCount === 0) {
        return res
          .status(404)
          .json({ message: "Employee not found in this company." });
      }
    }

    const result = await db.query(
      `INSERT INTO goals
         (company_id, employee_id, title, description, metric, target,
          due_date, progress, status, cycle, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        companyId,
        employeeId ?? null,
        title,
        description ?? null,
        metric ?? null,
        target ?? 100,
        dueDate,
        progress,
        status,
        cycle,
        createdBy,
      ],
    );

    return res.status(201).json({
      message: "Goal created.",
      data: fmt(result.rows[0]),
    });
  } catch (err) {
    console.error("createGoal error:", err);
    return res.status(500).json({ message: "Error creating goal." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/goals
// Query: ?employeeId= &cycle= &status= &department=
// ══════════════════════════════════════════════════════════════
export async function listGoals(req, res) {
  const { companyId } = req.user;
  const { employeeId, cycle, status, department } = req.query;

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
  if (department) {
    conditions.push(`e.department_id = $${idx++}`);
    params.push(department);
  }

  try {
    const result = await db.query(
      `SELECT
         g.*,
         e.first_name, e.last_name,
         d.name AS department_name
       FROM goals g
       LEFT JOIN employees e ON e.id = g.employee_id
       LEFT JOIN departments d ON d.id = e.department_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY g.due_date ASC`,
      params,
    );

    return res.status(200).json({
      data: result.rows.map((r) => ({
        ...fmt(r),
        employee: r.first_name
          ? {
              firstName: r.first_name,
              lastName: r.last_name,
              department: r.department_name,
            }
          : null,
      })),
      total: result.rowCount,
    });
  } catch (err) {
    console.error("listGoals error:", err);
    return res.status(500).json({ message: "Error fetching goals." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/goals/me
// ══════════════════════════════════════════════════════════════
export async function getMyGoals(req, res) {
  const { userId, companyId } = req.user;
  const { cycle, status } = req.query;

  try {
    const empResult = await db.query(
      "SELECT id FROM employees WHERE user_id = $1 AND company_id = $2",
      [userId, companyId],
    );
    if (empResult.rowCount === 0) {
      return res.status(404).json({ message: "Employee profile not found." });
    }

    const employeeId = empResult.rows[0].id;
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
      .json({ data: result.rows.map(fmt), total: result.rowCount });
  } catch (err) {
    console.error("getMyGoals error:", err);
    return res.status(500).json({ message: "Error fetching your goals." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/goals/:id/assign
// Body: { employeeIds: string[] }
// Duplicates the goal template and assigns it to each employee.
// ══════════════════════════════════════════════════════════════
export async function assignGoal(req, res) {
  const { id } = req.params;
  const { companyId, userId } = req.user;
  const { employeeIds } = req.body;

  if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
    return res
      .status(400)
      .json({ message: "employeeIds must be a non-empty array." });
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    // Fetch the template goal
    const template = await client.query(
      "SELECT * FROM goals WHERE id = $1 AND company_id = $2",
      [id, companyId],
    );
    if (template.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Goal template not found." });
    }

    const g = template.rows[0];
    const creatorResult = await client.query(
      "SELECT id FROM employees WHERE user_id = $1 AND company_id = $2",
      [userId, companyId],
    );
    const createdBy = creatorResult.rows[0]?.id ?? null;

    const assigned = [];
    const skipped = [];

    for (const empId of employeeIds) {
      // Verify employee belongs to company
      const empCheck = await client.query(
        "SELECT id FROM employees WHERE id = $1 AND company_id = $2",
        [empId, companyId],
      );
      if (empCheck.rowCount === 0) {
        skipped.push({ employeeId: empId, reason: "Not found in company." });
        continue;
      }

      // Prevent duplicate assignment in same cycle
      const dup = await client.query(
        "SELECT id FROM goals WHERE employee_id=$1 AND title=$2 AND cycle=$3 AND company_id=$4",
        [empId, g.title, g.cycle, companyId],
      );
      if (dup.rowCount > 0) {
        skipped.push({
          employeeId: empId,
          reason: "Already assigned for this cycle.",
        });
        continue;
      }

      await client.query(
        `INSERT INTO goals
           (company_id, employee_id, title, description, metric, target,
            due_date, progress, status, cycle, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,0,'not_started',$8,$9)`,
        [
          companyId,
          empId,
          g.title,
          g.description,
          g.metric,
          g.target,
          g.due_date,
          g.cycle,
          createdBy,
        ],
      );
      assigned.push(empId);
    }

    await client.query("COMMIT");

    return res.status(200).json({
      message: `Goal assigned to ${assigned.length} employee(s). ${skipped.length} skipped.`,
      assigned,
      skipped,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("assignGoal error:", err);
    return res.status(500).json({ message: "Error assigning goal." });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/goals/:id/progress
// Body: { progress: 0–100, achievedValue?, notes? }
// ══════════════════════════════════════════════════════════════
export async function updateGoalProgress(req, res) {
  const { id } = req.params;
  const { companyId, userId, role } = req.user;
  const { progress, achievedValue, notes } = req.body;

  if (progress === undefined || progress < 0 || progress > 100) {
    return res
      .status(400)
      .json({ message: "progress must be a number between 0 and 100." });
  }

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
    if (role === "employee") {
      const emp = await db.query(
        "SELECT id FROM employees WHERE user_id=$1 AND company_id=$2",
        [userId, companyId],
      );
      if (emp.rowCount === 0 || emp.rows[0].id !== goal.employee_id) {
        return res
          .status(403)
          .json({ message: "You can only update your own goals." });
      }
    }

    const newProgress = Number(progress);
    const newStatus =
      newProgress >= 100
        ? "completed"
        : newProgress > 0
          ? "in_progress"
          : "not_started";

    const updated = await db.query(
      `UPDATE goals
       SET
         progress       = $1,
         achieved_value = COALESCE($2, achieved_value),
         status         = $3,
         updated_at     = NOW()
       WHERE id = $4
       RETURNING *`,
      [newProgress, achievedValue ?? null, newStatus, id],
    );

    return res.status(200).json({
      message: "Progress updated.",
      data: fmt(updated.rows[0]),
    });
  } catch (err) {
    console.error("updateGoalProgress error:", err);
    return res.status(500).json({ message: "Error updating progress." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/goals/:id  (full update)
// ══════════════════════════════════════════════════════════════
export async function updateGoal(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    const existing = await db.query(
      "SELECT * FROM goals WHERE id = $1 AND company_id = $2",
      [id, companyId],
    );
    if (existing.rowCount === 0) {
      return res.status(404).json({ message: "Goal not found." });
    }

    const g = existing.rows[0];
    const {
      title = g.title,
      description = g.description,
      metric = g.metric,
      target = g.target,
      dueDate = g.due_date,
      cycle = g.cycle,
      progress = g.progress,
      status = g.status,
    } = req.body;

    const newProgress = Number(progress);
    const newStatus =
      status ||
      (newProgress >= 100
        ? "completed"
        : newProgress > 0
          ? "in_progress"
          : "not_started");

    const updated = await db.query(
      `UPDATE goals
       SET title=$1, description=$2, metric=$3, target=$4,
           due_date=$5, cycle=$6, progress=$7, status=$8, updated_at=NOW()
       WHERE id = $9 RETURNING *`,
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

    return res.status(200).json({ data: fmt(updated.rows[0]) });
  } catch (err) {
    console.error("updateGoal error:", err);
    return res.status(500).json({ message: "Error updating goal." });
  }
}
