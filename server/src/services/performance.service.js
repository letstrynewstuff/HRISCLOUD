// // // src/services/performance.service.js
// // //
// // // Pure business logic — no req/res. Called by controllers and cron jobs.
// // // All DB calls use the shared pg pool via db.query().

// // import { db } from "../config/db.js";

// // // ─── Rating label from numeric score ──────────────────────────
// // export function getRatingLabel(score) {
// //   if (score >= 90) return "Outstanding";
// //   if (score >= 75) return "High Performer";
// //   if (score >= 60) return "Meets Expectations";
// //   if (score >= 40) return "Needs Improvement";
// //   return "Underperforming";
// // }

// // // ─── Trend arrow helper ────────────────────────────────────────
// // export function getTrend(current, previous) {
// //   if (previous === null || previous === undefined) return "new";
// //   const diff = current - previous;
// //   if (diff > 2) return "up";
// //   if (diff < -2) return "down";
// //   return "stable";
// // }

// // export async function calculatePerformance(employeeId, period, companyId) {
// //   console.log(`⚙️  Calculating: employee=${employeeId} period=${period}`);

// //   const [year, month] = period.split("-").map(Number);
// //   const periodStart = new Date(year, month - 1, 1).toISOString().split("T")[0];
// //   const periodEnd = new Date(year, month, 0).toISOString().split("T")[0];

// //   // ── 1. KPI / Goal Score ────────────────────────────────────
// //   const goalsResult = await db.query(
// //     `SELECT progress, target
// //      FROM goals
// //      WHERE employee_id = $1
// //        AND company_id  = $2
// //        AND due_date BETWEEN $3 AND $4`,
// //     [employeeId, companyId, periodStart, periodEnd],
// //   );

// //   let kpiScore = 0;
// //   if (goalsResult.rows.length > 0) {
// //     const scores = goalsResult.rows.map((g) => {
// //       const achieved = Number(g.progress) || 0;
// //       const target = Number(g.target) || 100;
// //       return Math.min((achieved / target) * 100, 100);
// //     });
// //     kpiScore = scores.reduce((a, b) => a + b, 0) / scores.length;
// //   }

// //   // ── 2. Attendance Score ────────────────────────────────────
// //   const attResult = await db.query(
// //     `SELECT
// //        COUNT(*) FILTER (WHERE status = 'absent') AS days_absent,
// //        COUNT(*) FILTER (WHERE status = 'late')   AS late_count,
// //        COUNT(*)                                   AS total_working_days
// //      FROM attendance
// //      WHERE employee_id = $1
// //        AND attendance_date BETWEEN $2 AND $3`,
// //     [employeeId, periodStart, periodEnd],
// //   );

// //   const att = attResult.rows[0];
// //   const daysAbsent = parseInt(att?.days_absent || 0, 10);
// //   const lateCount = parseInt(att?.late_count || 0, 10);
// //   const attendanceScore = Math.max(0, 100 - daysAbsent * 2 - lateCount * 1);

// //   // ── 3. Training Score ──────────────────────────────────────
// //   const trainResult = await db.query(
// //     `SELECT
// //        COUNT(*) FILTER (WHERE te.attendance_status = 'attended') AS completed,
// //        COUNT(*)                                                    AS expected
// //      FROM training_enrollments te
// //      JOIN trainings t ON t.id = te.training_id
// //      WHERE te.employee_id = $1
// //        AND t.company_id   = $2
// //        AND t.start_date BETWEEN $3 AND $4`,
// //     [employeeId, companyId, periodStart, periodEnd],
// //   );

// //   const tr = trainResult.rows[0];
// //   const completed = parseInt(tr?.completed || 0, 10);
// //   const expected = parseInt(tr?.expected || 0, 10);
// //   const trainingScore =
// //     expected > 0 ? Math.min((completed / expected) * 100, 100) : 100;

// //   // ── 4. Weighted Final Score ────────────────────────────────
// //   // NOTE: final_score is a generated column in the DB — we compute it here
// //   // only to drive the rating label, PIP logic, and logging. We do NOT insert it.
// //   const finalScore = Math.round(
// //     kpiScore * 0.5 + attendanceScore * 0.25 + trainingScore * 0.25,
// //   );
// //   const rating = getRatingLabel(finalScore);

// //   console.log(
// //     `📊 ${employeeId} → KPI:${Math.round(kpiScore)} ATT:${attendanceScore} TRN:${trainingScore} FINAL:${finalScore} (${rating})`,
// //   );

// //   // ── 5. Upsert performance_scores ──────────────────────────
// //   // final_score is a generated column → omit from INSERT and DO UPDATE.
// //   // calculated_at does not exist on the table → omit as well.
// //   const client = await db.getClient();
// //   try {
// //     await client.query("BEGIN");

// //     const upsert = await client.query(
// //       `INSERT INTO performance_scores
// //          (employee_id, company_id, period, kpi_score, attendance_score,
// //           training_score, rating)
// //        VALUES ($1, $2, $3, $4, $5, $6, $7)
// //        ON CONFLICT (employee_id, period)
// //        DO UPDATE SET
// //          kpi_score        = EXCLUDED.kpi_score,
// //          attendance_score = EXCLUDED.attendance_score,
// //          training_score   = EXCLUDED.training_score,
// //          rating           = EXCLUDED.rating
// //        RETURNING *`,
// //       [
// //         employeeId,
// //         companyId,
// //         period,
// //         Math.round(kpiScore),
// //         Math.round(attendanceScore),
// //         Math.round(trainingScore),
// //         rating,
// //       ],
// //     );

// //     const scoreRow = upsert.rows[0];

// //     // ── 6. Auto-PIP if score < 60 ──────────────────────────
// //     if (finalScore < 60) {
// //       await autoCreatePIP(
// //         client,
// //         employeeId,
// //         companyId,
// //         period,
// //         finalScore,
// //         rating,
// //       );
// //     }

// //     // ── 7. Leadership candidate check ──────────────────────
// //     await checkLeadershipCandidate(client, employeeId, companyId);

// //     await client.query("COMMIT");
// //     return scoreRow;
// //   } catch (err) {
// //     await client.query("ROLLBACK");
// //     throw err;
// //   } finally {
// //     client.release();
// //   }
// // }

// // // ─── Auto-create PIP for low performers ───────────────────────
// // // async function autoCreatePIP(
// // //   client,
// // //   employeeId,
// // //   companyId,
// // //   period,
// // //   score,
// // //   rating,
// // // ) {
// // //   // Only create if no active PIP already exists
// // //   const existing = await client.query(
// // //     `SELECT id FROM pips
// // //    WHERE employee_id = $1 AND status IN ('active','pending')`,
// // //     [employeeId],
// // //   );
// // //   if (existing.rowCount > 0) return;

// // //   const reviewDate = new Date();
// // //   reviewDate.setDate(reviewDate.getDate() + 60); // 60-day review period

// // //   await client.query(
// // //     `INSERT INTO pips
// // //        (employee_id, company_id, reason, period, score_at_creation,
// // //         review_date, status, created_at)
// // //      VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW())`,
// // //     [
// // //       employeeId,
// // //       companyId,
// // //       `Automatic PIP: ${rating} (score ${score}) for period ${period}`,
// // //       period,
// // //       score,
// // //       reviewDate.toISOString().split("T")[0],
// // //     ],
// // //   );
// // // }
// // async function autoCreatePIP(
// //   client,
// //   employeeId,
// //   companyId,
// //   period,
// //   score,
// //   rating,
// // ) {
// //   // Only create if no active PIP already exists
// //   const existing = await client.query(
// //     `SELECT id FROM pips
// //      WHERE employee_id = $1 AND status IN ('active','pending')`,
// //     [employeeId],
// //   );
// //   if (existing.rowCount > 0) return;

// //   const startDate = new Date().toISOString().split("T")[0];
// //   const endDate = new Date();
// //   endDate.setDate(endDate.getDate() + 60); // 60-day review period

// //   await client.query(
// //     `INSERT INTO pips
// //        (employee_id, company_id, reason, period, score_at_creation,
// //         start_date, end_date, status, created_at)
// //      VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', NOW())`,
// //     [
// //       employeeId,
// //       companyId,
// //       `Automatic PIP: ${rating} (score ${score}) for period ${period}`,
// //       period,
// //       score,
// //       startDate,
// //       endDate.toISOString().split("T")[0],
// //     ],
// //   );
// // }

// // // ─── Leadership candidate detection ───────────────────────────
// // async function checkLeadershipCandidate(client, employeeId, companyId) {
// //   // Get last 3 months of scores
// //   const result = await client.query(
// //     `SELECT final_score
// //      FROM performance_scores
// //      WHERE employee_id = $1 AND company_id = $2
// //      ORDER BY period DESC
// //      LIMIT 3`,
// //     [employeeId, companyId],
// //   );

// //   if (result.rowCount < 3) return;
// //   const allHigh = result.rows.every((r) => Number(r.final_score) > 85);
// //   if (!allHigh) return;

// //   await client.query(
// //     `UPDATE employees
// //      SET leadership_candidate = true, updated_at = NOW()
// //      WHERE id = $1 AND company_id = $2`,
// //     [employeeId, companyId],
// //   );
// // }

// // // ─── Generate auto insights for an employee ───────────────────
// // export async function generateInsights(employeeId, companyId) {
// //   const result = await db.query(
// //     `SELECT period, final_score, rating
// //      FROM performance_scores
// //      WHERE employee_id = $1 AND company_id = $2
// //      ORDER BY period DESC
// //      LIMIT 12`,
// //     [employeeId, companyId],
// //   );

// //   const scores = result.rows;
// //   const insights = [];

// //   if (scores.length === 0) return insights;

// //   const latest = scores[0];
// //   const previous = scores[1];

// //   if (previous) {
// //     const diff = Number(latest.final_score) - Number(previous.final_score);
// //     if (diff <= -10) {
// //       insights.push({
// //         type: "warning",
// //         message: `Performance dropped by ${Math.abs(diff).toFixed(0)}% from last month`,
// //       });
// //     } else if (diff >= 10) {
// //       insights.push({
// //         type: "positive",
// //         message: `Performance improved by ${diff.toFixed(0)}% from last month`,
// //       });
// //     }
// //   }

// //   // Consistent high performer check
// //   const highMonths = scores.filter((s) => Number(s.final_score) >= 85).length;
// //   if (highMonths >= 3) {
// //     insights.push({
// //       type: "leadership",
// //       message: `Consistent high performer for ${highMonths} months`,
// //     });
// //   }

// //   // Low performer alert
// //   if (Number(latest.final_score) < 60) {
// //     insights.push({
// //       type: "pip",
// //       message: `Score of ${latest.final_score} is below threshold — PIP may be required`,
// //     });
// //   }

// //   return insights;
// // }

// // src/services/performance.service.js
// //
// // Pure business logic — no req/res. Called by controllers and cron jobs.
// // All DB calls use the shared pg pool via db.query() / db.getClient().
// //
// // Changes from original:
// //  ✅ calculatePerformance() now reads existing appraisal_score for the
// //     period and blends it in (40/20/20/20) when present; falls back to
// //     the original three-way blend (50/25/25) when absent.
// //  ✅ Upsert preserves appraisal_score via COALESCE — re-running calculate
// //     never wipes a score that was written by hrReviewAppraisal().
// //  ✅ autoCreatePIP() targets the correct table name
// //     (performance_improvement_plans) and column set.
// //  ✅ getRatingLabel() and getTrend() exported unchanged.
// //  ✅ generateInsights() unchanged.

// import { db } from "../config/db.js";

// // ─── Rating label from numeric score ──────────────────────────
// export function getRatingLabel(score) {
//   if (score >= 90) return "Outstanding";
//   if (score >= 75) return "High Performer";
//   if (score >= 60) return "Meets Expectations";
//   if (score >= 40) return "Needs Improvement";
//   return "Underperforming";
// }

// // ─── Trend arrow helper ────────────────────────────────────────
// export function getTrend(current, previous) {
//   if (previous === null || previous === undefined) return "new";
//   const diff = current - previous;
//   if (diff > 2) return "up";
//   if (diff < -2) return "down";
//   return "stable";
// }

// // ══════════════════════════════════════════════════════════════
// // CORE CALCULATION ENGINE
// // ══════════════════════════════════════════════════════════════

// export async function calculatePerformance(employeeId, period, companyId) {
//   console.log(`⚙️  Calculating: employee=${employeeId} period=${period}`);

//   const [year, month] = period.split("-").map(Number);
//   const periodStart = new Date(year, month - 1, 1).toISOString().split("T")[0];
//   const periodEnd = new Date(year, month, 0).toISOString().split("T")[0];

//   // ── 1. KPI / Goal Score ────────────────────────────────────
//   const goalsResult = await db.query(
//     `SELECT progress, target
//      FROM goals
//      WHERE employee_id = $1
//        AND company_id  = $2
//        AND due_date BETWEEN $3 AND $4`,
//     [employeeId, companyId, periodStart, periodEnd],
//   );

//   let kpiScore = 0;
//   if (goalsResult.rows.length > 0) {
//     const scores = goalsResult.rows.map((g) => {
//       const achieved = Number(g.progress) || 0;
//       const target = Number(g.target) || 100;
//       return Math.min((achieved / target) * 100, 100);
//     });
//     kpiScore = scores.reduce((a, b) => a + b, 0) / scores.length;
//   }

//   // ── 2. Attendance Score ────────────────────────────────────
//   const attResult = await db.query(
//     `SELECT
//        COUNT(*) FILTER (WHERE status = 'absent') AS days_absent,
//        COUNT(*) FILTER (WHERE status = 'late')   AS late_count,
//        COUNT(*)                                   AS total_working_days
//      FROM attendance
//      WHERE employee_id    = $1
//        AND attendance_date BETWEEN $2 AND $3`,
//     [employeeId, periodStart, periodEnd],
//   );

//   const att = attResult.rows[0];
//   const daysAbsent = parseInt(att?.days_absent || 0, 10);
//   const lateCount = parseInt(att?.late_count || 0, 10);
//   const attendanceScore = Math.max(0, 100 - daysAbsent * 2 - lateCount * 1);

//   // ── 3. Training Score ──────────────────────────────────────
//   const trainResult = await db.query(
//     `SELECT
//        COUNT(*) FILTER (WHERE te.attendance_status = 'attended') AS completed,
//        COUNT(*)                                                    AS expected
//      FROM training_enrollments te
//      JOIN trainings t ON t.id = te.training_id
//      WHERE te.employee_id = $1
//        AND t.company_id   = $2
//        AND t.start_date BETWEEN $3 AND $4`,
//     [employeeId, companyId, periodStart, periodEnd],
//   );

//   const tr = trainResult.rows[0];
//   const completed = parseInt(tr?.completed || 0, 10);
//   const expected = parseInt(tr?.expected || 0, 10);
//   const trainingScore =
//     expected > 0 ? Math.min((completed / expected) * 100, 100) : 100;

//   // ── 4. Appraisal Score (if available for this period) ─────
//   // Written by hrReviewAppraisal() in appraisal.controller.js.
//   // We read whatever is currently stored; we never overwrite it here.
//   const appraisalRow = await db.query(
//     `SELECT appraisal_score
//      FROM performance_scores
//      WHERE employee_id = $1
//        AND company_id  = $2
//        AND period      = $3`,
//     [employeeId, companyId, period],
//   );

//   const existingAppraisalScore =
//     appraisalRow.rows[0]?.appraisal_score != null
//       ? Number(appraisalRow.rows[0].appraisal_score)
//       : null;

//   // ── 5. Weighted Final Score ────────────────────────────────
//   //
//   // When an appraisal has been HR-reviewed for this period we use
//   // a four-way blend so the appraisal carries 20% of the weight:
//   //   KPI 40% | Attendance 20% | Training 20% | Appraisal 20%
//   //
//   // Without an appraisal we fall back to the original three-way blend:
//   //   KPI 50% | Attendance 25% | Training 25%
//   //
//   // NOTE: final_score is a generated column in the DB in some setups.
//   // We compute it here to drive the rating label, PIP logic, and logging
//   // but we do NOT insert it — the DB generates it from the component cols.
//   let finalScore;
//   if (existingAppraisalScore !== null) {
//     finalScore = Math.round(
//       kpiScore * 0.4 +
//         attendanceScore * 0.2 +
//         trainingScore * 0.2 +
//         existingAppraisalScore * 0.2,
//     );
//   } else {
//     finalScore = Math.round(
//       kpiScore * 0.5 + attendanceScore * 0.25 + trainingScore * 0.25,
//     );
//   }

//   const rating = getRatingLabel(finalScore);

//   console.log(
//     `📊 ${employeeId} → ` +
//       `KPI:${Math.round(kpiScore)} ` +
//       `ATT:${Math.round(attendanceScore)} ` +
//       `TRN:${Math.round(trainingScore)} ` +
//       (existingAppraisalScore !== null
//         ? `APR:${Math.round(existingAppraisalScore)} `
//         : "") +
//       `FINAL:${finalScore} (${rating})`,
//   );

//   // ── 6. Upsert performance_scores ──────────────────────────
//   //
//   // Key rules:
//   //  • final_score is a GENERATED column → omit from INSERT + DO UPDATE.
//   //  • appraisal_score is managed by the appraisal controller, not here.
//   //    Use COALESCE so a re-run never wipes an HR-confirmed appraisal score.
//   //  • calculated_at does not exist on the table → omit.
//   const client = await db.getClient();
//   try {
//     await client.query("BEGIN");

//     const upsert = await client.query(
//       `INSERT INTO performance_scores
//          (employee_id, company_id, period,
//           kpi_score, attendance_score, training_score,
//           rating)
//        VALUES ($1, $2, $3, $4, $5, $6, $7)
//        ON CONFLICT (employee_id, period)
//        DO UPDATE SET
//          kpi_score        = EXCLUDED.kpi_score,
//          attendance_score = EXCLUDED.attendance_score,
//          training_score   = EXCLUDED.training_score,
//          rating           = EXCLUDED.rating
//          -- appraisal_score intentionally excluded:
//          -- it is owned by hrReviewAppraisal() and must not be overwritten here
//        RETURNING *`,
//       [
//         employeeId,
//         companyId,
//         period,
//         Math.round(kpiScore),
//         Math.round(attendanceScore),
//         Math.round(trainingScore),
//         rating,
//       ],
//     );

//     const scoreRow = upsert.rows[0];

//     // ── 7. Auto-PIP if finalScore < 60 ────────────────────────
//     if (finalScore < 60) {
//       await autoCreatePIP(
//         client,
//         employeeId,
//         companyId,
//         period,
//         finalScore,
//         rating,
//       );
//     }

//     // ── 8. Leadership candidate check ─────────────────────────
//     await checkLeadershipCandidate(client, employeeId, companyId);

//     await client.query("COMMIT");
//     return scoreRow;
//   } catch (err) {
//     await client.query("ROLLBACK");
//     throw err;
//   } finally {
//     client.release();
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // AUTO-PIP
// // ══════════════════════════════════════════════════════════════

// async function autoCreatePIP(
//   client,
//   employeeId,
//   companyId,
//   period,
//   score,
//   rating,
// ) {
//   // Only create if no active PIP already exists for this employee
//   const existing = await client.query(
//     `SELECT id
//      FROM performance_improvement_plans
//      WHERE employee_id = $1
//        AND company_id  = $2
//        AND status      = 'active'`,
//     [employeeId, companyId],
//   );
//   if (existing.rowCount > 0) return;

//   const reviewDate = new Date();
//   reviewDate.setDate(reviewDate.getDate() + 60); // 60-day review window

//   await client.query(
//     `INSERT INTO performance_improvement_plans
//        (company_id, employee_id, reason, period, review_date, status, progress)
//      VALUES ($1, $2, $3, $4, $5, 'active', 0)`,
//     [
//       companyId,
//       employeeId,
//       `Automatic PIP: ${rating} (score ${score}) for period ${period}`,
//       period,
//       reviewDate.toISOString().split("T")[0],
//     ],
//   );

//   console.log(
//     `🚨 Auto-PIP created for employee ${employeeId} ` +
//       `(score ${score}, period ${period})`,
//   );
// }

// // ══════════════════════════════════════════════════════════════
// // LEADERSHIP CANDIDATE CHECK
// // ══════════════════════════════════════════════════════════════

// async function checkLeadershipCandidate(client, employeeId, companyId) {
//   // Promote to leadership candidate if last 3 months all score > 85
//   const result = await client.query(
//     `SELECT final_score
//      FROM performance_scores
//      WHERE employee_id = $1
//        AND company_id  = $2
//      ORDER BY period DESC
//      LIMIT 3`,
//     [employeeId, companyId],
//   );

//   if (result.rowCount < 3) return;

//   const allHigh = result.rows.every((r) => Number(r.final_score) > 85);
//   if (!allHigh) return;

//   await client.query(
//     `UPDATE employees
//      SET leadership_candidate = true,
//          updated_at           = NOW()
//      WHERE id         = $1
//        AND company_id = $2`,
//     [employeeId, companyId],
//   );

//   console.log(`⭐ Employee ${employeeId} flagged as leadership candidate`);
// }

// // ══════════════════════════════════════════════════════════════
// // INSIGHTS GENERATOR
// // ══════════════════════════════════════════════════════════════

// export async function generateInsights(employeeId, companyId) {
//   const result = await db.query(
//     `SELECT period, final_score, rating
//      FROM performance_scores
//      WHERE employee_id = $1
//        AND company_id  = $2
//      ORDER BY period DESC
//      LIMIT 12`,
//     [employeeId, companyId],
//   );

//   const scores = result.rows;
//   const insights = [];

//   if (scores.length === 0) return insights;

//   const latest = scores[0];
//   const previous = scores[1];

//   // ── Month-over-month change ────────────────────────────────
//   if (previous) {
//     const diff = Number(latest.final_score) - Number(previous.final_score);
//     if (diff <= -10) {
//       insights.push({
//         type: "warning",
//         message: `Performance dropped by ${Math.abs(diff).toFixed(0)} points from last month`,
//       });
//     } else if (diff >= 10) {
//       insights.push({
//         type: "positive",
//         message: `Performance improved by ${diff.toFixed(0)} points from last month`,
//       });
//     }
//   }

//   // ── Consistent high performer ──────────────────────────────
//   const highMonths = scores.filter((s) => Number(s.final_score) >= 85).length;
//   if (highMonths >= 3) {
//     insights.push({
//       type: "leadership",
//       message: `Consistent high performer for ${highMonths} months`,
//     });
//   }

//   // ── Low performer / PIP threshold ─────────────────────────
//   if (Number(latest.final_score) < 60) {
//     insights.push({
//       type: "pip",
//       message: `Score of ${latest.final_score} is below threshold — PIP may be required`,
//     });
//   }

//   return insights;
// }

// src/services/performance.service.js
//
// Pure business logic — no req/res. Called by controllers and cron jobs.
//
// SCORING COMPONENTS (5-way blend when all data present):
//
//   WITHOUT appraisal:
//     KPI 40% | Attendance 25% | Training 20% | Timesheet 15%
//
//   WITH appraisal (HR has reviewed for this period):
//     KPI 35% | Attendance 20% | Training 15% | Timesheet 10% | Appraisal 20%
//
// ATTENDANCE SCORE RULES (updated):
//   • Each ABSENT day   → -2 points (unchanged)
//   • Each LATE arrival → -50 points (was -1) — late is treated as a serious flag
//   • Floor at 0
//
// TIMESHEET SCORE RULES (new):
//   • MAX_HOURS_PER_WEEK = 10 — employee at or above 10h/week = 100
//   • Score = (totalHours / MAX_HOURS_PER_WEEK) * 100, capped at 100
//   • Hours measured over the same calendar month as the performance period
//   • Only APPROVED timesheet entries count (not Draft or Submitted)

import { db } from "../config/db.js";

// ─── Constants ─────────────────────────────────────────────────
const MAX_HOURS_PER_WEEK = 10; // 10 hours/week = 100% timesheet score
const LATE_PENALTY_POINTS = 50; // each late arrival deducts 50 from attendance score
const ABSENT_PENALTY_POINTS = 2; // each absent day deducts 2 from attendance score

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
// CORE CALCULATION ENGINE
// ══════════════════════════════════════════════════════════════
export async function calculatePerformance(employeeId, period, companyId) {
  console.log(`⚙️  Calculating: employee=${employeeId} period=${period}`);

  const [year, month] = period.split("-").map(Number);
  const periodStart = new Date(year, month - 1, 1).toISOString().split("T")[0];
  const periodEnd = new Date(year, month, 0).toISOString().split("T")[0];

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
      const achieved = Number(g.progress) || 0;
      const target = Number(g.target) || 100;
      return Math.min((achieved / target) * 100, 100);
    });
    kpiScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  // ── 2. Attendance Score ─────────────────────────────────────
  //
  // UPDATED RULES:
  //   • absent → -2 points each
  //   • late   → -50 points each (major penalty — late is treated seriously)
  //   • Score floors at 0, caps at 100
  const attResult = await db.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'absent') AS days_absent,
       COUNT(*) FILTER (WHERE status = 'late')   AS late_count
     FROM attendance
     WHERE employee_id      = $1
       AND attendance_date BETWEEN $2 AND $3`,
    [employeeId, periodStart, periodEnd],
  );

  const att = attResult.rows[0];
  const daysAbsent = parseInt(att?.days_absent ?? 0, 10);
  const lateCount = parseInt(att?.late_count ?? 0, 10);

  // Each late = -50 points, each absent = -2 points
  const attendanceScore = Math.max(
    0,
    Math.min(
      100,
      100 -
        lateCount * LATE_PENALTY_POINTS -
        daysAbsent * ABSENT_PENALTY_POINTS,
    ),
  );

  console.log(
    `   Attendance → absent:${daysAbsent} late:${lateCount} ` +
      `penalty:${lateCount * LATE_PENALTY_POINTS + daysAbsent * ABSENT_PENALTY_POINTS} ` +
      `score:${attendanceScore}`,
  );

  // ── 3. Training Score ───────────────────────────────────────
  const trainResult = await db.query(
    `SELECT
       COUNT(*) FILTER (WHERE te.attendance_status = 'attended') AS completed,
       COUNT(*)                                                    AS expected
     FROM training_enrollments te
     JOIN trainings t ON t.id = te.training_id
     WHERE te.employee_id = $1
       AND t.company_id   = $2
       AND t.start_date BETWEEN $3 AND $4`,
    [employeeId, companyId, periodStart, periodEnd],
  );

  const tr = trainResult.rows[0];
  const completed = parseInt(tr?.completed ?? 0, 10);
  const expected = parseInt(tr?.expected ?? 0, 10);
  const trainingScore =
    expected > 0 ? Math.min((completed / expected) * 100, 100) : 100; // no training scheduled → not penalised

  // ── 4. Timesheet Score (NEW) ────────────────────────────────
  //
  // Rule: 10 approved hours per week = 100%.
  // We measure total approved hours for the whole month, then compare against
  // (MAX_HOURS_PER_WEEK × number of weeks in the month).
  //
  // Number of weeks = periodDays / 7 (rounded to 1 decimal for partial weeks)
  //
  // Only APPROVED entries count — Draft and Submitted don't contribute.
  const tsResult = await db.query(
    `SELECT COALESCE(SUM(duration_minutes), 0) AS total_minutes
     FROM timesheet_entries
     WHERE employee_id = $1
       AND company_id  = $2
       AND entry_date BETWEEN $3 AND $4
       AND status = 'Approved'`,
    [employeeId, companyId, periodStart, periodEnd],
  );

  const totalMinutes = Number(tsResult.rows[0]?.total_minutes ?? 0);
  const totalHours = totalMinutes / 60;

  // Calculate how many weeks are in this period
  const periodDays = new Date(year, month, 0).getDate(); // days in the month
  const weeksInPeriod = periodDays / 7;
  const targetHours = MAX_HOURS_PER_WEEK * weeksInPeriod; // e.g. ~4.3 weeks × 10h = 43h

  const timesheetScore =
    targetHours > 0
      ? Math.min(Math.round((totalHours / targetHours) * 100), 100)
      : 100; // if no target period, don't penalise

  console.log(
    `   Timesheet → approvedHours:${totalHours.toFixed(1)} ` +
      `targetHours:${targetHours.toFixed(1)} ` +
      `score:${timesheetScore}`,
  );

  // ── 5. Appraisal Score (if available for this period) ──────
  // Written by hrReviewAppraisal() in appraisal.controller.js.
  // We read whatever is stored; never overwrite it here.
  const appraisalRow = await db.query(
    `SELECT appraisal_score
     FROM performance_scores
     WHERE employee_id = $1
       AND company_id  = $2
       AND period      = $3`,
    [employeeId, companyId, period],
  );

  const existingAppraisalScore =
    appraisalRow.rows[0]?.appraisal_score != null
      ? Number(appraisalRow.rows[0].appraisal_score)
      : null;

  // ── 6. Weighted Final Score ─────────────────────────────────
  //
  // WITH appraisal (HR has scored for this period):
  //   KPI 35% | Attendance 20% | Training 15% | Timesheet 10% | Appraisal 20%
  //
  // WITHOUT appraisal:
  //   KPI 40% | Attendance 25% | Training 20% | Timesheet 15%
  //
  // NOTE: final_score may be a GENERATED column in the DB in some setups.
  // We compute it here to drive the rating label, PIP logic, and logging.
  let finalScore;
  if (existingAppraisalScore !== null) {
    finalScore = Math.round(
      kpiScore * 0.35 +
        attendanceScore * 0.2 +
        trainingScore * 0.15 +
        timesheetScore * 0.1 +
        existingAppraisalScore * 0.2,
    );
  } else {
    finalScore = Math.round(
      kpiScore * 0.4 +
        attendanceScore * 0.25 +
        trainingScore * 0.2 +
        timesheetScore * 0.15,
    );
  }

  const rating = getRatingLabel(finalScore);

  console.log(
    `📊 ${employeeId} → ` +
      `KPI:${Math.round(kpiScore)} ` +
      `ATT:${Math.round(attendanceScore)} ` +
      `TRN:${Math.round(trainingScore)} ` +
      `TS:${Math.round(timesheetScore)} ` +
      (existingAppraisalScore !== null
        ? `APR:${Math.round(existingAppraisalScore)} `
        : "") +
      `FINAL:${finalScore} (${rating})`,
  );

  // ── 7. Upsert performance_scores ───────────────────────────
  //
  // Key rules:
  //  • final_score is a GENERATED column in some setups → omit from INSERT + DO UPDATE.
  //  • appraisal_score is managed by the appraisal controller, not here.
  //    Use COALESCE so a re-run never wipes an HR-confirmed appraisal score.
  //  • timesheet_score is a new column — add it to the INSERT.
  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const upsert = await client.query(
      `INSERT INTO performance_scores
         (employee_id, company_id, period,
          kpi_score, attendance_score, training_score, timesheet_score,
          rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (employee_id, period)
       DO UPDATE SET
         kpi_score        = EXCLUDED.kpi_score,
         attendance_score = EXCLUDED.attendance_score,
         training_score   = EXCLUDED.training_score,
         timesheet_score  = EXCLUDED.timesheet_score,
         rating           = EXCLUDED.rating
         -- appraisal_score intentionally excluded:
         -- it is owned by hrReviewAppraisal() and must not be overwritten here
       RETURNING *`,
      [
        employeeId,
        companyId,
        period,
        Math.round(kpiScore),
        Math.round(attendanceScore),
        Math.round(trainingScore),
        Math.round(timesheetScore),
        rating,
      ],
    );

    const scoreRow = upsert.rows[0];

    // ── 8. Auto-PIP if finalScore < 60 ────────────────────────
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

    // ── 9. Leadership candidate check ─────────────────────────
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

// ══════════════════════════════════════════════════════════════
// AUTO-PIP
// ══════════════════════════════════════════════════════════════
async function autoCreatePIP(
  client,
  employeeId,
  companyId,
  period,
  score,
  rating,
) {
  // Only create if no active PIP already exists for this employee
  const existing = await client.query(
    `SELECT id
     FROM performance_improvement_plans
     WHERE employee_id = $1
       AND company_id  = $2
       AND status      = 'active'`,
    [employeeId, companyId],
  );
  if (existing.rowCount > 0) return;

  const reviewDate = new Date();
  reviewDate.setDate(reviewDate.getDate() + 60); // 60-day review window

  await client.query(
    `INSERT INTO performance_improvement_plans
       (company_id, employee_id, reason, period, review_date, status, progress)
     VALUES ($1, $2, $3, $4, $5, 'active', 0)`,
    [
      companyId,
      employeeId,
      `Automatic PIP: ${rating} (score ${score}) for period ${period}`,
      period,
      reviewDate.toISOString().split("T")[0],
    ],
  );

  console.log(
    `🚨 Auto-PIP created for employee ${employeeId} (score ${score}, period ${period})`,
  );
}

// ══════════════════════════════════════════════════════════════
// LEADERSHIP CANDIDATE CHECK
// ══════════════════════════════════════════════════════════════
async function checkLeadershipCandidate(client, employeeId, companyId) {
  const result = await client.query(
    `SELECT final_score
     FROM performance_scores
     WHERE employee_id = $1
       AND company_id  = $2
     ORDER BY period DESC
     LIMIT 3`,
    [employeeId, companyId],
  );

  if (result.rowCount < 3) return;

  const allHigh = result.rows.every((r) => Number(r.final_score) > 85);
  if (!allHigh) return;

  await client.query(
    `UPDATE employees
     SET leadership_candidate = true,
         updated_at           = NOW()
     WHERE id         = $1
       AND company_id = $2`,
    [employeeId, companyId],
  );

  console.log(`⭐ Employee ${employeeId} flagged as leadership candidate`);
}

// ══════════════════════════════════════════════════════════════
// INSIGHTS GENERATOR
// ══════════════════════════════════════════════════════════════
export async function generateInsights(employeeId, companyId) {
  const result = await db.query(
    `SELECT period, final_score, rating, timesheet_score, attendance_score
     FROM performance_scores
     WHERE employee_id = $1
       AND company_id  = $2
     ORDER BY period DESC
     LIMIT 12`,
    [employeeId, companyId],
  );

  const scores = result.rows;
  const insights = [];

  if (scores.length === 0) return insights;

  const latest = scores[0];
  const previous = scores[1];

  // ── Month-over-month change ────────────────────────────────
  if (previous) {
    const diff = Number(latest.final_score) - Number(previous.final_score);
    if (diff <= -10) {
      insights.push({
        type: "warning",
        message: `Performance dropped by ${Math.abs(diff).toFixed(0)} points from last month`,
      });
    } else if (diff >= 10) {
      insights.push({
        type: "positive",
        message: `Performance improved by ${diff.toFixed(0)} points from last month`,
      });
    }
  }

  // ── Timesheet insight ──────────────────────────────────────
  if (latest.timesheet_score != null) {
    const tsScore = Number(latest.timesheet_score);
    if (tsScore < 50) {
      insights.push({
        type: "warning",
        message: `Low timesheet hours logged this period (score: ${tsScore}/100) — aim for 10h/week`,
      });
    } else if (tsScore >= 90) {
      insights.push({
        type: "positive",
        message: `Excellent timesheet compliance — ${tsScore}/100 hours logged`,
      });
    }
  }

  // ── Attendance insight ─────────────────────────────────────
  if (latest.attendance_score != null && Number(latest.attendance_score) < 50) {
    insights.push({
      type: "warning",
      message: `Attendance score is low (${latest.attendance_score}/100) — late arrivals carry a 50-point penalty each`,
    });
  }

  // ── Consistent high performer ──────────────────────────────
  const highMonths = scores.filter((s) => Number(s.final_score) >= 85).length;
  if (highMonths >= 3) {
    insights.push({
      type: "leadership",
      message: `Consistent high performer for ${highMonths} months`,
    });
  }

  // ── Low performer / PIP threshold ─────────────────────────
  if (Number(latest.final_score) < 60) {
    insights.push({
      type: "pip",
      message: `Score of ${latest.final_score} is below threshold — PIP may be required`,
    });
  }

  return insights;
}
