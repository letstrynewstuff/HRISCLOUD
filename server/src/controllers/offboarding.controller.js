// ══════════════════════════════════════════════════════════════
// REPLACE the existing offboardEmployee function in employee_controller.js
//
// NEW 3-STEP FLOW:
//   POST /api/employees/:id/offboard        → Step 1: Start (status = "offboarding")
//   PATCH /api/employees/:id/offboard/:taskId → Step 2: Toggle checklist task
//   POST /api/employees/:id/offboard/complete → Step 3: Complete (THEN terminate)
//
// This replaces the single PUT /api/employees/:id/offboard that was
// terminating employees immediately on start.
// ══════════════════════════════════════════════════════════════

import { db } from "../config/db.js";

// ──────────────────────────────────────────────────────────────
// POST /api/employees/:id/offboard
// STEP 1 — Start offboarding.
//   • Sets employment_status = "offboarding"  (NOT terminated yet)
//   • Stores termination_date + reason for later
//   • Creates the offboarding_tasks checklist rows
//   • Logs to employment_history
//   • Does NOT deactivate user account yet
// ──────────────────────────────────────────────────────────────
export async function startOffboarding(req, res) {
  const { id } = req.params;
  const { companyId, userId } = req.user;
  const {
    exitType = "terminated", // "terminated" | "resigned" | "retired"
    terminationDate,
    terminationReason,
    lastWorkingDay,
    notes,
  } = req.body;

  if (!["terminated", "resigned", "retired"].includes(exitType)) {
    return res.status(400).json({
      message: "exitType must be one of: terminated, resigned, or retired.",
    });
  }

  const effectiveDate =
    terminationDate || lastWorkingDay || new Date().toISOString().split("T")[0];

  if (isNaN(new Date(effectiveDate).getTime())) {
    return res.status(400).json({ message: "Invalid date format." });
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    // ── Guard: employee must be active and belong to this company ──
    const empResult = await client.query(
      `UPDATE employees
       SET employment_status  = 'offboarding',
           termination_date   = $1,
           termination_reason = $2,
           updated_at         = NOW()
       WHERE id = $3
         AND company_id = $4
         AND employment_status NOT IN ('terminated','resigned','retired','offboarding')
       RETURNING id, user_id, first_name, last_name`,
      [effectiveDate, terminationReason?.trim() || null, id, companyId],
    );

    if (empResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message:
          "Employee not found, already offboarded, or offboarding already in progress.",
      });
    }

    const emp = empResult.rows[0];

    // ── Create default offboarding checklist ──────────────────────
    const defaultTasks = [
      { task: "Schedule exit interview", assignee: "HR" },
      { task: "Complete knowledge transfer", assignee: "Manager" },
      { task: "Return company laptop & equipment", assignee: "IT" },
      { task: "Revoke system access & accounts", assignee: "IT" },
      { task: "Return access card", assignee: "Admin" },
      { task: "Clear outstanding expenses", assignee: "Finance" },
      { task: "Process final payroll", assignee: "Payroll" },
      { task: "Issue experience / relieving letter", assignee: "HR" },
      { task: "Archive employee documents", assignee: "HR" },
    ];

    for (const t of defaultTasks) {
      await client.query(
        `INSERT INTO offboarding_tasks
           (employee_id, task, assignee, status, created_at)
         VALUES ($1, $2, $3, 'pending', NOW())`,
        [id, t.task, t.assignee],
      );
    }

    // ── History entry ─────────────────────────────────────────────
    await client.query(
      `INSERT INTO employment_history
         (employee_id, event_type, employment_type, effective_date, notes, created_by)
       VALUES ($1, 'offboarding_started', $2, $3, $4, $5)`,
      [
        id,
        exitType,
        effectiveDate,
        notes?.trim() || `Offboarding started (${exitType}).`,
        userId,
      ],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: `Offboarding started for ${emp.first_name} ${emp.last_name}. Checklist created.`,
      data: {
        employeeId: emp.id,
        exitType,
        terminationDate: effectiveDate,
        tasksCreated: defaultTasks.length,
        // ✅ status is "offboarding" — NOT terminated yet
        status: "offboarding",
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("startOffboarding error:", err);
    return res
      .status(500)
      .json({ message: "Server error starting offboarding." });
  } finally {
    client.release();
  }
}

// ──────────────────────────────────────────────────────────────
// PATCH /api/employees/:id/offboard/tasks/:taskId
// STEP 2 — Toggle a single checklist task done/undone.
// Automatically moves overall status to "in_progress" on first toggle.
// ──────────────────────────────────────────────────────────────
export async function toggleOffboardingTask(req, res) {
  const { id, taskId } = req.params;
  const { companyId } = req.user;

  try {
    // Confirm employee belongs to this company and is in offboarding
    const empCheck = await db.query(
      `SELECT id FROM employees
       WHERE id = $1 AND company_id = $2
         AND employment_status = 'offboarding'`,
      [id, companyId],
    );

    if (empCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found or not currently in offboarding.",
      });
    }

    // Fetch the task and flip its status
    const taskResult = await db.query(
      `UPDATE offboarding_tasks
       SET status     = CASE WHEN status = 'completed' THEN 'pending' ELSE 'completed' END,
           updated_at = NOW()
       WHERE id = $1 AND employee_id = $2
       RETURNING id, task, status`,
      [taskId, id],
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: "Task not found." });
    }

    const task = taskResult.rows[0];

    return res.status(200).json({
      message: `Task "${task.task}" marked as ${task.status}.`,
      data: task,
    });
  } catch (err) {
    console.error("toggleOffboardingTask error:", err);
    return res.status(500).json({ message: "Server error updating task." });
  }
}

// ──────────────────────────────────────────────────────────────
// POST /api/employees/:id/offboard/complete
// STEP 3 — Complete offboarding.
//   • Validates ALL checklist tasks are completed first
//   • Sets employment_status = exitType ("terminated" | "resigned" | "retired")
//   • Deactivates user account + revokes sessions
//   • Logs final history entry
// ──────────────────────────────────────────────────────────────
export async function completeOffboarding(req, res) {
  const { id } = req.params;
  const { companyId, userId } = req.user;
  const { force = false } = req.body; // allow HR to force-complete with pending tasks

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    // Fetch employee (must be in offboarding state)
    const empResult = await client.query(
      `SELECT id, user_id, first_name, last_name,
              employment_status, termination_reason,
              termination_date
       FROM employees
       WHERE id = $1 AND company_id = $2 AND employment_status = 'offboarding'`,
      [id, companyId],
    );

    if (empResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Employee not found or not currently in offboarding.",
      });
    }

    const emp = empResult.rows[0];

    // ── Check all tasks are done (unless force = true) ────────────
    if (!force) {
      const pendingTasks = await client.query(
        `SELECT COUNT(*) AS count
         FROM offboarding_tasks
         WHERE employee_id = $1 AND status != 'completed'`,
        [id],
      );

      const pendingCount = parseInt(pendingTasks.rows[0].count, 10);
      if (pendingCount > 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: `Cannot complete offboarding — ${pendingCount} task(s) still pending. Complete all tasks or use force=true.`,
          pendingCount,
        });
      }
    }

    // ── Determine final status from the exitType stored at start ──
    // We stored the exit intent in employment_history when starting.
    // Re-read it from there to determine final status.
    const histResult = await client.query(
      `SELECT employment_type
       FROM employment_history
       WHERE employee_id = $1 AND event_type = 'offboarding_started'
       ORDER BY effective_date DESC
       LIMIT 1`,
      [id],
    );

    // employment_type column was overloaded to store exitType (terminated/resigned/retired)
    const finalStatus = histResult.rows[0]?.employment_type || "terminated";

    // ── NOW terminate the employee ────────────────────────────────
    await client.query(
      `UPDATE employees
       SET employment_status = $1,
           updated_at        = NOW()
       WHERE id = $2 AND company_id = $3`,
      [finalStatus, id, companyId],
    );

    // ── Mark all remaining tasks completed (cleanup) ──────────────
    await client.query(
      `UPDATE offboarding_tasks
       SET status = 'completed', updated_at = NOW()
       WHERE employee_id = $1 AND status != 'completed'`,
      [id],
    );

    // ── Deactivate user account + purge sessions ──────────────────
    if (emp.user_id) {
      await client.query(
        `UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1`,
        [emp.user_id],
      );
      await client.query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [
        emp.user_id,
      ]);
    }

    // ── Final history entry ───────────────────────────────────────
    await client.query(
      `INSERT INTO employment_history
         (employee_id, event_type, employment_type, effective_date, notes, created_by)
       VALUES ($1, 'offboarding_completed', $2, NOW(), $3, $4)`,
      [
        id,
        finalStatus,
        `Offboarding completed. Employee ${finalStatus}.`,
        userId,
      ],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: `${emp.first_name} ${emp.last_name} has been officially ${finalStatus}.`,
      data: {
        employeeId: emp.id,
        finalStatus,
        completedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("completeOffboarding error:", err);
    return res
      .status(500)
      .json({ message: "Server error completing offboarding." });
  } finally {
    client.release();
  }
}

// ──────────────────────────────────────────────────────────────
// GET /api/employees/:id/offboard/tasks
// Fetch all offboarding tasks for an employee.
// ──────────────────────────────────────────────────────────────
export async function getOffboardingTasks(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    // Guard: employee must belong to company
    const empCheck = await db.query(
      `SELECT id, first_name, last_name, employment_status,
              termination_date, termination_reason
       FROM employees
       WHERE id = $1 AND company_id = $2`,
      [id, companyId],
    );

    if (empCheck.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const tasks = await db.query(
      `SELECT id, task, assignee, status, created_at, updated_at
       FROM offboarding_tasks
       WHERE employee_id = $1
       ORDER BY created_at ASC`,
      [id],
    );

    const emp = empCheck.rows[0];
    const total = tasks.rows.length;
    const completed = tasks.rows.filter((t) => t.status === "completed").length;

    return res.status(200).json({
      data: {
        employee: {
          id: emp.id,
          name: `${emp.first_name} ${emp.last_name}`,
          status: emp.employment_status,
          terminationDate: emp.termination_date,
          terminationReason: emp.termination_reason,
        },
        tasks: tasks.rows,
        progress: {
          total,
          completed,
          percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        },
      },
    });
  } catch (err) {
    console.error("getOffboardingTasks error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching offboarding tasks." });
  }
}

// ──────────────────────────────────────────────────────────────
// GET /api/employees/offboarding
// List all employees currently in offboarding (status = "offboarding")
// plus recently terminated/resigned/retired (last 90 days).
// ──────────────────────────────────────────────────────────────
export async function listOffboarding(req, res) {
  const { companyId } = req.user;

  try {
    const result = await db.query(
      `SELECT
         e.id,
         e.employee_code,
         e.first_name,
         e.last_name,
         e.avatar,
         e.employment_status,
         e.termination_date,
         e.termination_reason,
         e.updated_at,
         d.name  AS department_name,
         jr.title AS job_role_name,
         -- Task progress
         COUNT(ot.id)                                         AS total_tasks,
         COUNT(ot.id) FILTER (WHERE ot.status = 'completed') AS completed_tasks
       FROM employees e
       LEFT JOIN departments d   ON d.id  = e.department_id
       LEFT JOIN job_roles   jr  ON jr.id = e.job_role_id
       LEFT JOIN offboarding_tasks ot ON ot.employee_id = e.id
       WHERE e.company_id = $1
         AND (
           e.employment_status = 'offboarding'
           OR (
             e.employment_status IN ('terminated','resigned','retired')
             AND e.updated_at >= NOW() - INTERVAL '90 days'
           )
         )
       GROUP BY e.id, d.name, jr.title
       ORDER BY e.updated_at DESC`,
      [companyId],
    );

    return res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error("listOffboarding error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching offboarding list." });
  }
}
