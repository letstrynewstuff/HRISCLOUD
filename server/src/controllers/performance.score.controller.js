// src/controllers/performance.score.controller.js
//
// NEW endpoints that extend the existing performance.controller.js:
//
//   POST /api/performance/calculate/:employeeId   → calculate + store score
//   GET  /api/performance/scores/:employeeId      → employee score history
//   GET  /api/performance/dashboard               → company-wide dashboard
//   GET  /api/performance/trends/:employeeId      → month-over-month trend
//   GET  /api/performance/insights/:employeeId    → auto insights
//   GET  /api/performance/top-performers          → ranked employees
//   POST /api/performance/pip/:employeeId         → manual PIP creation
//   GET  /api/performance/pip                     → list all PIPs
//
// Mount these alongside performance.controller.js in performance.routes.js

import { db } from "../config/db.js";
import {
  calculatePerformance,
  generateInsights,
  getRatingLabel,
  getTrend,
} from "../services/performance.service.js";

// ══════════════════════════════════════════════════════════════
// POST /api/performance/calculate/:employeeId
// Body: { period: "2025-01" }
// Triggers full calculation engine and stores result.
// ══════════════════════════════════════════════════════════════
export async function calculateEmployeeScore(req, res) {
  const { employeeId } = req.params;
  const { companyId } = req.user;
  const { period } = req.body;

  if (!period || !/^\d{4}-\d{2}$/.test(period)) {
    return res
      .status(400)
      .json({ message: "period must be in YYYY-MM format (e.g. 2025-01)" });
  }

  try {
    // Verify employee belongs to this company
    const empCheck = await db.query(
      "SELECT id FROM employees WHERE id = $1 AND company_id = $2",
      [employeeId, companyId],
    );
    if (empCheck.rowCount === 0) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const scoreRow = await calculatePerformance(employeeId, period, companyId);

    return res.status(200).json({
      message: "Score calculated and stored.",
      data: scoreRow,
    });
  } catch (err) {
    console.error("calculateEmployeeScore error:", err);
    return res.status(500).json({ message: "Error calculating score." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/performance/scores/:employeeId
// Returns full score history for one employee.
// ══════════════════════════════════════════════════════════════
export async function getEmployeeScores(req, res) {
  const { employeeId } = req.params;
  const { companyId } = req.user;

  try {
    const result = await db.query(
      `SELECT
         ps.*,
         e.first_name, e.last_name, e.avatar,
         d.name AS department_name,
         jr.title AS job_role_name
       FROM performance_scores ps
       JOIN employees e ON e.id = ps.employee_id
       LEFT JOIN departments d  ON d.id  = e.department_id
       LEFT JOIN job_roles   jr ON jr.id = e.job_role_id
       WHERE ps.employee_id = $1 AND ps.company_id = $2
       ORDER BY ps.period DESC`,
      [employeeId, companyId],
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ data: [], total: 0 });
    }

    // Attach trend direction to each row
    const rows = result.rows.map((row, i) => ({
      ...row,
      trend: getTrend(
        Number(row.final_score),
        result.rows[i + 1] ? Number(result.rows[i + 1].final_score) : null,
      ),
    }));

    return res.status(200).json({ data: rows, total: result.rowCount });
  } catch (err) {
    console.error("getEmployeeScores error:", err);
    return res.status(500).json({ message: "Error fetching scores." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/performance/dashboard
// Query params: ?period=2025-01 &department=uuid
// Returns company-wide summary:
//   average_score, top_performer, underperformers,
//   department_comparison, employee_table
// ══════════════════════════════════════════════════════════════
export async function getPerformanceDashboard(req, res) {
  const { companyId } = req.user;

  // Default period = current month
  const now = new Date();
  const period =
    req.query.period ||
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const deptFilter = req.query.department;

  try {
    // ── Base conditions ──────────────────────────────────────
    const conditions = ["ps.company_id = $1", "ps.period = $2"];
    const params = [companyId, period];
    let idx = 3;

    if (deptFilter) {
      conditions.push(`e.department_id = $${idx++}`);
      params.push(deptFilter);
    }

    const whereClause = conditions.join(" AND ");

    // ── Employee table with score + trend ────────────────────
    const empTable = await db.query(
      `SELECT
         ps.employee_id,
         ps.final_score,
         ps.kpi_score,
         ps.attendance_score,
         ps.training_score,
         ps.rating,
         ps.period,
         e.first_name,
         e.last_name,
         e.avatar,
         e.leadership_candidate,
         d.name  AS department_name,
         d.id    AS department_id,
         jr.title AS job_role_name,
         -- Previous month score for trend
         prev.final_score AS prev_score
       FROM performance_scores ps
       JOIN employees e ON e.id = ps.employee_id
       LEFT JOIN departments d  ON d.id  = e.department_id
       LEFT JOIN job_roles   jr ON jr.id = e.job_role_id
       -- Self-join for previous period
       LEFT JOIN performance_scores prev
         ON prev.employee_id = ps.employee_id
         AND prev.period = TO_CHAR(
               (TO_DATE(ps.period, 'YYYY-MM') - INTERVAL '1 month'),
               'YYYY-MM'
             )
       WHERE ${whereClause}
       ORDER BY ps.final_score DESC`,
      params,
    );

    const employees = empTable.rows.map((r) => ({
      employeeId: r.employee_id,
      name: `${r.first_name} ${r.last_name}`,
      firstName: r.first_name,
      lastName: r.last_name,
      avatar: r.avatar,
      department: r.department_name,
      departmentId: r.department_id,
      jobRole: r.job_role_name,
      finalScore: Number(r.final_score),
      kpiScore: Number(r.kpi_score),
      attendanceScore: Number(r.attendance_score),
      trainingScore: Number(r.training_score),
      rating: r.rating,
      trend: getTrend(
        Number(r.final_score),
        r.prev_score ? Number(r.prev_score) : null,
      ),
      leadershiCandidate: r.leadership_candidate,
    }));

    // ── Aggregates ───────────────────────────────────────────
    const totalScores = employees.map((e) => e.finalScore);
    const averageScore = totalScores.length
      ? Math.round(totalScores.reduce((a, b) => a + b, 0) / totalScores.length)
      : 0;

    const topPerformer = employees[0] ?? null;
    const underperformers = employees.filter((e) => e.finalScore < 60);
    const highPerformers = employees.filter((e) => e.finalScore >= 85);

    // ── Department comparison ────────────────────────────────
    const deptMap = {};
    employees.forEach((e) => {
      if (!e.department) return;
      if (!deptMap[e.department]) {
        deptMap[e.department] = { scores: [], id: e.departmentId };
      }
      deptMap[e.department].scores.push(e.finalScore);
    });

    const departmentComparison = Object.entries(deptMap)
      .map(([name, val]) => ({
        name,
        id: val.id,
        avgScore: Math.round(
          val.scores.reduce((a, b) => a + b, 0) / val.scores.length,
        ),
        count: val.scores.length,
      }))
      .sort((a, b) => b.avgScore - a.avgScore);

    return res.status(200).json({
      period,
      averageScore,
      totalEmployees: employees.length,
      topPerformer,
      underperformerCount: underperformers.length,
      underperformers,
      highPerformerCount: highPerformers.length,
      highPerformers,
      departmentComparison,
      employees,
    });
  } catch (err) {
    console.error("getPerformanceDashboard error:", err);
    return res.status(500).json({ message: "Error fetching dashboard." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/performance/trends/:employeeId
// Returns last 12 months of scores for line chart.
// ══════════════════════════════════════════════════════════════
export async function getPerformanceTrends(req, res) {
  const { employeeId } = req.params;
  const { companyId } = req.user;

  try {
    const result = await db.query(
      `SELECT period, final_score, kpi_score, attendance_score, training_score, rating
       FROM performance_scores
       WHERE employee_id = $1 AND company_id = $2
       ORDER BY period ASC
       LIMIT 12`,
      [employeeId, companyId],
    );

    // Fill in month labels even if some months have no data
    const trends = result.rows.map((r) => ({
      period: r.period,
      month: new Date(r.period + "-01").toLocaleDateString("en-NG", {
        month: "short",
        year: "2-digit",
      }),
      finalScore: Number(r.final_score),
      kpiScore: Number(r.kpi_score),
      attendanceScore: Number(r.attendance_score),
      trainingScore: Number(r.training_score),
      rating: r.rating,
    }));

    return res.status(200).json({ data: trends, total: result.rowCount });
  } catch (err) {
    console.error("getPerformanceTrends error:", err);
    return res.status(500).json({ message: "Error fetching trends." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/performance/insights/:employeeId
// Returns auto-generated insights array.
// ══════════════════════════════════════════════════════════════
export async function getPerformanceInsights(req, res) {
  const { employeeId } = req.params;
  const { companyId } = req.user;

  try {
    const insights = await generateInsights(employeeId, companyId);
    return res.status(200).json({ data: insights });
  } catch (err) {
    console.error("getPerformanceInsights error:", err);
    return res.status(500).json({ message: "Error generating insights." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/performance/top-performers
// Query: ?period=2025-01 &limit=10
// Returns employees ranked by final_score, leadership_candidate flagged.
// ══════════════════════════════════════════════════════════════
// export async function getTopPerformers(req, res) {
//   const { companyId } = req.user;
//   const now = new Date();
//   const period =
//     req.query.period ||
//     `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
//   const limit = Math.min(parseInt(req.query.limit || 10, 10), 50);

//   try {
//     const result = await db.query(
//       `SELECT
//          ps.employee_id,
//          ps.final_score,
//          ps.rating,
//          ps.period,
//          e.first_name,
//          e.last_name,
//          e.avatar,
//          e.leadership_candidate,
//          d.name  AS department_name,
//          jr.title AS job_role_name,
//          -- Count consecutive high-performer months
//          (SELECT COUNT(*)
//           FROM performance_scores ps2
//           WHERE ps2.employee_id = ps.employee_id
//             AND ps2.final_score > 85
//             AND ps2.period <= $2
//           ORDER BY ps2.period DESC
//          ) AS high_performer_streak
//        FROM performance_scores ps
//        JOIN employees e ON e.id = ps.employee_id
//        LEFT JOIN departments d  ON d.id  = e.department_id
//        LEFT JOIN job_roles   jr ON jr.id = e.job_role_id
//        WHERE ps.company_id = $1 AND ps.period = $2
//        ORDER BY ps.final_score DESC
//        LIMIT $3`,
//       [companyId, period, limit],
//     );

//     return res.status(200).json({
//       period,
//       data: result.rows.map((r, i) => ({
//         rank: i + 1,
//         employeeId: r.employee_id,
//         name: `${r.first_name} ${r.last_name}`,
//         avatar: r.avatar,
//         department: r.department_name,
//         jobRole: r.job_role_name,
//         finalScore: Number(r.final_score),
//         rating: r.rating,
//         leadershipCandidate: r.leadership_candidate,
//         highPerformerStreak: Number(r.high_performer_streak || 0),
//       })),
//     });
//   } catch (err) {
//     console.error("getTopPerformers error:", err);
//     return res.status(500).json({ message: "Error fetching top performers." });
//   }
// }
export async function getTopPerformers(req, res) {
  const { companyId } = req.user;
  const now = new Date();
  const period =
    req.query.period ||
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const limit = Math.min(parseInt(req.query.limit || 10, 10), 50);

  try {
    const result = await db.query(
      `SELECT
         ps.employee_id,
         ps.final_score,
         ps.rating,
         ps.period,
         e.first_name,
         e.last_name,
         e.avatar,
         e.leadership_candidate,
         d.name  AS department_name,
         jr.title AS job_role_name,
         -- Fixed Streak Logic using a Subquery that won't trigger Grouping errors
         (SELECT COUNT(*)::int
          FROM performance_scores ps2
          WHERE ps2.employee_id = ps.employee_id
            AND ps2.final_score >= 85
            AND ps2.period <= $2
         ) AS high_performer_streak
       FROM performance_scores ps
       JOIN employees e ON e.id = ps.employee_id
       LEFT JOIN departments d  ON d.id  = e.department_id
       LEFT JOIN job_roles   jr ON jr.id = e.job_role_id
       WHERE ps.company_id = $1 
         AND ps.period = $2 
         AND ps.status = 'published'
       ORDER BY ps.final_score DESC
       LIMIT $3`,
      [companyId, period, limit],
    );

    return res.status(200).json({
      period,
      data: result.rows.map((r, i) => ({
        rank: i + 1,
        employeeId: r.employee_id,
        name: `${r.first_name} ${r.last_name}`,
        avatar: r.avatar,
        department: r.department_name,
        jobRole: r.job_role_name,
        finalScore: Number(r.final_score),
        rating: r.rating,
        leadershipCandidate: r.leadership_candidate,
        highPerformerStreak: r.high_performer_streak,
      })),
    });
  } catch (err) {
    console.error("getTopPerformers error:", err);
    return res.status(500).json({ message: "Error fetching top performers." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/performance/pip/:employeeId
// Manual PIP creation by HR.
// Body: { reason, reviewDate, period }
// ══════════════════════════════════════════════════════════════
export async function createPIP(req, res) {
  const { employeeId } = req.params;
  const { companyId, userId } = req.user;
  const { reason, reviewDate, period, goals = [] } = req.body;

  if (!reason || !reviewDate) {
    return res
      .status(400)
      .json({ message: "reason and reviewDate are required." });
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    // Guard: employee must belong to company
    const empCheck = await client.query(
      "SELECT id, first_name, last_name FROM employees WHERE id = $1 AND company_id = $2",
      [employeeId, companyId],
    );
    if (empCheck.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Employee not found." });
    }

    // Prevent duplicate active PIP
    const existing = await client.query(
      "SELECT id FROM pips WHERE employee_id = $1 AND status IN ('active','pending')",
      [employeeId],
    );
    if (existing.rowCount > 0) {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ message: "An active PIP already exists for this employee." });
    }

    // Fetch latest score for context
    const latestScore = await client.query(
      `SELECT final_score, rating FROM performance_scores
       WHERE employee_id = $1 ORDER BY period DESC LIMIT 1`,
      [employeeId],
    );
    const score = latestScore.rows[0]?.final_score || 0;

    const pip = await client.query(
      `INSERT INTO pips
         (employee_id, company_id, reason, period, score_at_creation,
          review_date, status, created_by, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,'active',$7,NOW())
       RETURNING *`,
      [
        employeeId,
        companyId,
        reason,
        period || null,
        score,
        reviewDate,
        userId,
      ],
    );

    const pipId = pip.rows[0].id;

    // Create improvement goals if provided
    for (const goal of goals) {
      await client.query(
        `INSERT INTO goals
           (company_id, employee_id, title, description, target,
            due_date, progress, status, cycle, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,0,'not_started','PIP',$7)`,
        [
          companyId,
          employeeId,
          goal.title,
          goal.description || null,
          goal.target || 100,
          reviewDate,
          userId,
        ],
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: "PIP created successfully.",
      data: pip.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("createPIP error:", err);
    return res.status(500).json({ message: "Error creating PIP." });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/performance/pip
// Lists all PIPs for the company. Query: ?status=active
// ══════════════════════════════════════════════════════════════
export async function listPIPs(req, res) {
  const { companyId } = req.user;
  const { status } = req.query;

  try {
    const conditions = ["p.company_id = $1"];
    const params = [companyId];
    if (status) {
      conditions.push(`p.status = $${params.length + 1}`);
      params.push(status);
    }

    const result = await db.query(
      `SELECT
         p.*,
         e.first_name, e.last_name, e.avatar,
         d.name AS department_name,
         jr.title AS job_role_name
       FROM pips p
       JOIN employees e ON e.id = p.employee_id
       LEFT JOIN departments d  ON d.id  = e.department_id
       LEFT JOIN job_roles   jr ON jr.id = e.job_role_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY p.created_at DESC`,
      params,
    );

    return res.status(200).json({
      data: result.rows.map((r) => ({
        id: r.id,
        employeeId: r.employee_id,
        name: `${r.first_name} ${r.last_name}`,
        avatar: r.avatar,
        department: r.department_name,
        jobRole: r.job_role_name,
        reason: r.reason,
        period: r.period,
        score: Number(r.score_at_creation || 0),
        reviewDate: r.review_date,
        status: r.status,
        progress: Number(r.progress || 0),
        createdAt: r.created_at,
      })),
      total: result.rowCount,
    });
  } catch (err) {
    console.error("listPIPs error:", err);
    return res.status(500).json({ message: "Error fetching PIPs." });
  }
}
