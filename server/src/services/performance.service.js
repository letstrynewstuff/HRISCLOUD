// src/services/performance.service.js
//
// Pure business logic — no req/res. Called by controllers and cron jobs.
// All DB calls use the shared pg pool via db.query().

import { db } from "../config/db.js";

// ─── Rating label from numeric score ──────────────────────────
export function getRatingLabel(score) {
  if (score >= 90) return "Outstanding";
  if (score >= 75) return "High Performer";
  if (score >= 60) return "Meets Expectations";
  if (score >= 40) return "Needs Improvement";
  return "Underperforming";
}

// ─── Trend arrow helper ────────────────────────────────────────
export function getTrend(current, previous) {
  if (previous === null || previous === undefined) return "new";
  const diff = current - previous;
  if (diff > 2) return "up";
  if (diff < -2) return "down";
  return "stable";
}

// ══════════════════════════════════════════════════════════════
// calculatePerformance(employeeId, period, companyId)
//
// period format: "2025-01" (YYYY-MM)
//
// Formula:
//   KPI Score        = avg( (goal.progress / 100) * 100 ) for goals due in period
//   Attendance Score = 100 - (days_absent * 2) - (late_count * 1)
//   Training Score   = (completed_trainings / expected_trainings) * 100
//   Final Score      = (KPI × 0.50) + (Attendance × 0.25) + (Training × 0.25)
//
// Returns the stored performance_scores row.
// ══════════════════════════════════════════════════════════════
export async function calculatePerformance(employeeId, period, companyId) {
  // Derive date range from period string
  const [year, month] = period.split("-").map(Number);
  const periodStart = new Date(year, month - 1, 1).toISOString().split("T")[0];
  const periodEnd = new Date(year, month, 0).toISOString().split("T")[0]; // last day

  // ── 1. KPI / Goal Score ────────────────────────────────────
  const goalsResult = await db.query(
    `SELECT progress, target
     FROM goals
     WHERE employee_id = $1
       AND company_id  = $2
       AND due_date BETWEEN $3 AND $4`,
    [employeeId, companyId, periodStart, periodEnd],
  );

  let kpiScore = 0;
  if (goalsResult.rows.length > 0) {
    const scores = goalsResult.rows.map((g) => {
      // If target is stored as a number, use it; otherwise treat progress as %
      const achieved = Number(g.progress) || 0;
      const target = Number(g.target) || 100;
      return Math.min((achieved / target) * 100, 100);
    });
    kpiScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  // ── 2. Attendance Score ────────────────────────────────────
  const attResult = await db.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'absent') AS days_absent,
       COUNT(*) FILTER (WHERE is_late = true)    AS late_count,
       COUNT(*) AS total_working_days
     FROM attendance
     WHERE employee_id = $1
       AND date BETWEEN $2 AND $3`,
    [employeeId, periodStart, periodEnd],
  );

  const att = attResult.rows[0];
  const daysAbsent = parseInt(att?.days_absent || 0, 10);
  const lateCount = parseInt(att?.late_count || 0, 10);
  const attendanceScore = Math.max(0, 100 - daysAbsent * 2 - lateCount * 1);

  // ── 3. Training Score ──────────────────────────────────────
  const trainResult = await db.query(
    `SELECT
       COUNT(*) FILTER (WHERE attendance_status = 'attended') AS completed,
       COUNT(*) AS expected
     FROM training_enrollments te
     JOIN trainings t ON t.id = te.training_id
     WHERE te.employee_id = $1
       AND t.company_id   = $2
       AND t.start_date BETWEEN $3 AND $4`,
    [employeeId, companyId, periodStart, periodEnd],
  );

  const tr = trainResult.rows[0];
  const completed = parseInt(tr?.completed || 0, 10);
  const expected = parseInt(tr?.expected || 0, 10);
  const trainingScore =
    expected > 0 ? Math.min((completed / expected) * 100, 100) : 100; // no training expected = full score

  // ── 4. Weighted Final Score ────────────────────────────────
  const finalScore = Math.round(
    kpiScore * 0.5 + attendanceScore * 0.25 + trainingScore * 0.25,
  );

  const rating = getRatingLabel(finalScore);

  // ── 5. Upsert into performance_scores ─────────────────────
  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const upsert = await client.query(
      `INSERT INTO performance_scores
         (employee_id, company_id, period, kpi_score, attendance_score,
          training_score, final_score, rating, calculated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (employee_id, period)
       DO UPDATE SET
         kpi_score        = EXCLUDED.kpi_score,
         attendance_score = EXCLUDED.attendance_score,
         training_score   = EXCLUDED.training_score,
         final_score      = EXCLUDED.final_score,
         rating           = EXCLUDED.rating,
         calculated_at    = NOW()
       RETURNING *`,
      [
        employeeId,
        companyId,
        period,
        Math.round(kpiScore),
        Math.round(attendanceScore),
        Math.round(trainingScore),
        finalScore,
        rating,
      ],
    );

    const scoreRow = upsert.rows[0];

    // ── 6. Auto-PIP if score < 60 ──────────────────────────
    if (finalScore < 60) {
      await autoCreatePIP(
        client,
        employeeId,
        companyId,
        period,
        finalScore,
        rating,
      );
    }

    // ── 7. Leadership detection if score > 85 for 3 months ─
    await checkLeadershipCandidate(client, employeeId, companyId);

    await client.query("COMMIT");
    return scoreRow;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// ─── Auto-create PIP for low performers ───────────────────────
async function autoCreatePIP(
  client,
  employeeId,
  companyId,
  period,
  score,
  rating,
) {
  // Only create if no active PIP already exists
  const existing = await client.query(
    `SELECT id FROM pips
     WHERE employee_id = $1 AND status IN ('active','pending')`,
    [employeeId],
  );
  if (existing.rowCount > 0) return;

  const reviewDate = new Date();
  reviewDate.setDate(reviewDate.getDate() + 60); // 60-day review period

  await client.query(
    `INSERT INTO pips
       (employee_id, company_id, reason, period, score_at_creation,
        review_date, status, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW())`,
    [
      employeeId,
      companyId,
      `Automatic PIP: ${rating} (score ${score}) for period ${period}`,
      period,
      score,
      reviewDate.toISOString().split("T")[0],
    ],
  );
}

// ─── Leadership candidate detection ───────────────────────────
async function checkLeadershipCandidate(client, employeeId, companyId) {
  // Get last 3 months of scores
  const result = await client.query(
    `SELECT final_score
     FROM performance_scores
     WHERE employee_id = $1 AND company_id = $2
     ORDER BY period DESC
     LIMIT 3`,
    [employeeId, companyId],
  );

  if (result.rowCount < 3) return;
  const allHigh = result.rows.every((r) => Number(r.final_score) > 85);
  if (!allHigh) return;

  await client.query(
    `UPDATE employees
     SET leadership_candidate = true, updated_at = NOW()
     WHERE id = $1 AND company_id = $2`,
    [employeeId, companyId],
  );
}

// ─── Generate auto insights for an employee ───────────────────
export async function generateInsights(employeeId, companyId) {
  const result = await db.query(
    `SELECT period, final_score, rating
     FROM performance_scores
     WHERE employee_id = $1 AND company_id = $2
     ORDER BY period DESC
     LIMIT 12`,
    [employeeId, companyId],
  );

  const scores = result.rows;
  const insights = [];

  if (scores.length === 0) return insights;

  const latest = scores[0];
  const previous = scores[1];

  if (previous) {
    const diff = Number(latest.final_score) - Number(previous.final_score);
    if (diff <= -10) {
      insights.push({
        type: "warning",
        message: `Performance dropped by ${Math.abs(diff).toFixed(0)}% from last month`,
      });
    } else if (diff >= 10) {
      insights.push({
        type: "positive",
        message: `Performance improved by ${diff.toFixed(0)}% from last month`,
      });
    }
  }

  // Consistent high performer check
  const highMonths = scores.filter((s) => Number(s.final_score) >= 85).length;
  if (highMonths >= 3) {
    insights.push({
      type: "leadership",
      message: `Consistent high performer for ${highMonths} months`,
    });
  }

  // Low performer alert
  if (Number(latest.final_score) < 60) {
    insights.push({
      type: "pip",
      message: `Score of ${latest.final_score} is below threshold — PIP may be required`,
    });
  }

  return insights;
}
