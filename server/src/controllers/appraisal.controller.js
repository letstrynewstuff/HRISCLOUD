// // src/controllers/appraisal.controller.js
// //
// // Appraisal lifecycle:
// //   Manager creates draft  → POST   /api/appraisals/:employeeId
// //   Manager submits        → PATCH  /api/appraisals/:id/submit
// //   HR scores & completes  → PATCH  /api/appraisals/:id/hr-review
// //   HR rejects back        → PATCH  /api/appraisals/:id/reject
// //   List / get             → GET    /api/appraisals  |  /api/appraisals/:id
// //   My appraisals          → GET    /api/appraisals/me
// //   Templates CRUD         → /api/appraisals/templates/*
// //
// // When HR completes the review, the appraisal_score is written back into
// // performance_scores so it feeds the next calculatePerformance run.

// import { db } from "../config/db.js";

// // ─── helpers ──────────────────────────────────────────────────

// /** Normalise manager/hr ratings array to a 0-100 weighted score */
// function computeWeightedScore(ratings = []) {
//   if (!ratings || ratings.length === 0) return null;
//   let weightedSum = 0;
//   let totalWeight = 0;
//   for (const r of ratings) {
//     const weight = Number(r.weight ?? 1);
//     const score = Number(r.score ?? 0);
//     const max = Number(r.maxScore ?? 5);
//     weightedSum += (score / max) * 100 * weight;
//     totalWeight += weight;
//   }
//   if (totalWeight === 0) return null;
//   return Math.round((weightedSum / totalWeight) * 100) / 100;
// }

// function formatAppraisal(row) {
//   return {
//     id: row.id,
//     companyId: row.company_id,
//     employeeId: row.employee_id,
//     managerId: row.manager_id,
//     hrReviewerId: row.hr_reviewer_id,
//     templateId: row.template_id,
//     period: row.period,
//     cycleName: row.cycle_name,
//     // manager layer
//     managerFeedback: row.manager_feedback,
//     managerRatings: row.manager_ratings,
//     managerOverall:
//       row.manager_overall !== null ? Number(row.manager_overall) : null,
//     submittedAt: row.submitted_at,
//     // hr layer
//     hrFeedback: row.hr_feedback,
//     hrRatings: row.hr_ratings,
//     hrOverall: row.hr_overall !== null ? Number(row.hr_overall) : null,
//     hrScoreWeight: Number(row.hr_score_weight),
//     hrReviewedAt: row.hr_reviewed_at,
//     // resolved
//     appraisalScore:
//       row.appraisal_score !== null ? Number(row.appraisal_score) : null,
//     status: row.status,
//     createdBy: row.created_by,
//     createdAt: row.created_at,
//     updatedAt: row.updated_at,
//     // joined fields (present when queried with JOINs)
//     employee: row.employee_first_name
//       ? {
//           firstName: row.employee_first_name,
//           lastName: row.employee_last_name,
//           email: row.employee_email ?? null,
//           avatar: row.employee_avatar ?? null,
//           department: row.department_name ?? null,
//           jobRole: row.job_role_name ?? null,
//         }
//       : undefined,
//     manager: row.manager_first_name
//       ? { firstName: row.manager_first_name, lastName: row.manager_last_name }
//       : undefined,
//     hrReviewer: row.hr_first_name
//       ? { firstName: row.hr_first_name, lastName: row.hr_last_name }
//       : undefined,
//   };
// }

// /** Resolve employee record from JWT or DB fallback */
// async function resolveEmployeeId(userId, companyId, fromJwt = null) {
//   if (fromJwt) return fromJwt;
//   const r = await db.query(
//     "SELECT id FROM employees WHERE user_id = $1 AND company_id = $2",
//     [userId, companyId],
//   );
//   return r.rows[0]?.id ?? null;
// }

// // ══════════════════════════════════════════════════════════════
// // TEMPLATES
// // ══════════════════════════════════════════════════════════════

// // GET /api/appraisals/templates
// export async function listTemplates(req, res) {
//   try {
//     const { companyId } = req.user;
//     const result = await db.query(
//       `SELECT t.*, json_agg(c ORDER BY c.sort_order) AS criteria
//        FROM appraisal_templates t
//        LEFT JOIN appraisal_criteria c ON c.template_id = t.id
//        WHERE t.company_id = $1
//        GROUP BY t.id
//        ORDER BY t.created_at DESC`,
//       [companyId],
//     );
//     return res
//       .status(200)
//       .json({ templates: result.rows, total: result.rowCount });
//   } catch (err) {
//     console.error("listTemplates error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error fetching templates." });
//   }
// }

// // POST /api/appraisals/templates
// // Body: { name, description?, criteria: [{ label, weight, maxScore, sortOrder }] }
// export async function createTemplate(req, res) {
//   const { companyId } = req.user;
//   const { name, description, criteria = [] } = req.body;

//   if (!name?.trim()) {
//     return res.status(400).json({ message: "Template name is required." });
//   }

//   const client = await db.connect();
//   try {
//     await client.query("BEGIN");

//     const tmpl = await client.query(
//       `INSERT INTO appraisal_templates (company_id, name, description)
//        VALUES ($1, $2, $3) RETURNING *`,
//       [companyId, name.trim(), description ?? null],
//     );
//     const templateId = tmpl.rows[0].id;

//     const insertedCriteria = [];
//     for (const [i, c] of criteria.entries()) {
//       if (!c.label?.trim()) continue;
//       const cr = await client.query(
//         `INSERT INTO appraisal_criteria (template_id, label, weight, max_score, sort_order)
//          VALUES ($1, $2, $3, $4, $5) RETURNING *`,
//         [
//           templateId,
//           c.label.trim(),
//           c.weight ?? 100 / criteria.length,
//           c.maxScore ?? 5,
//           c.sortOrder ?? i,
//         ],
//       );
//       insertedCriteria.push(cr.rows[0]);
//     }

//     await client.query("COMMIT");

//     return res.status(201).json({
//       message: "Template created.",
//       template: { ...tmpl.rows[0], criteria: insertedCriteria },
//     });
//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error("createTemplate error:", err);
//     return res.status(500).json({ message: "Server error creating template." });
//   } finally {
//     client.release();
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // APPRAISALS — MANAGER FLOW
// // ══════════════════════════════════════════════════════════════

// // POST /api/appraisals/:employeeId
// // Body: { period, cycleName?, templateId?, managerFeedback, managerRatings, hrScoreWeight? }
// // Creates a draft appraisal. Manager can save draft before submitting.
// export async function createAppraisal(req, res) {
//   const { companyId, userId, employeeId: eid } = req.user;
//   const { employeeId } = req.params;
//   const {
//     period,
//     cycleName,
//     templateId,
//     managerFeedback,
//     managerRatings = [],
//     hrScoreWeight = 20,
//   } = req.body;

//   if (!period || !/^\d{4}-\d{2}$/.test(period)) {
//     return res.status(400).json({ message: "period must be YYYY-MM." });
//   }

//   try {
//     // Verify target employee belongs to this company
//     const empCheck = await db.query(
//       "SELECT id FROM employees WHERE id = $1 AND company_id = $2",
//       [employeeId, companyId],
//     );
//     if (empCheck.rowCount === 0) {
//       return res
//         .status(404)
//         .json({ message: "Employee not found in this company." });
//     }

//     // Resolve manager's employee record
//     const managerId = await resolveEmployeeId(userId, companyId, eid);

//     // Prevent duplicate appraisal for same employee + period
//     const dupe = await db.query(
//       "SELECT id, status FROM appraisals WHERE employee_id = $1 AND company_id = $2 AND period = $3",
//       [employeeId, companyId, period],
//     );
//     if (dupe.rowCount > 0) {
//       return res.status(409).json({
//         message: `An appraisal for this employee already exists for period ${period}.`,
//         existing: { id: dupe.rows[0].id, status: dupe.rows[0].status },
//       });
//     }

//     const managerOverall = computeWeightedScore(managerRatings);

//     const result = await db.query(
//       `INSERT INTO appraisals
//          (company_id, employee_id, manager_id, template_id, period, cycle_name,
//           manager_feedback, manager_ratings, manager_overall, hr_score_weight,
//           status, created_by)
//        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'draft',$3)
//        RETURNING *`,
//       [
//         companyId,
//         employeeId,
//         managerId,
//         templateId ?? null,
//         period,
//         cycleName ?? null,
//         managerFeedback ?? null,
//         JSON.stringify(managerRatings),
//         managerOverall,
//         hrScoreWeight,
//       ],
//     );

//     return res.status(201).json({
//       message: "Appraisal draft created.",
//       appraisal: formatAppraisal(result.rows[0]),
//     });
//   } catch (err) {
//     console.error("createAppraisal error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error creating appraisal." });
//   }
// }

// // PATCH /api/appraisals/:id
// // Manager edits a draft before submitting.
// export async function updateAppraisal(req, res) {
//   const { id } = req.params;
//   const { companyId, userId, employeeId: eid } = req.user;
//   const {
//     managerFeedback,
//     managerRatings,
//     cycleName,
//     templateId,
//     hrScoreWeight,
//   } = req.body;

//   try {
//     const existing = await db.query(
//       "SELECT * FROM appraisals WHERE id = $1 AND company_id = $2",
//       [id, companyId],
//     );
//     if (existing.rowCount === 0)
//       return res.status(404).json({ message: "Appraisal not found." });

//     const appraisal = existing.rows[0];
//     if (!["draft", "rejected"].includes(appraisal.status)) {
//       return res
//         .status(409)
//         .json({
//           message: `Cannot edit appraisal in status '${appraisal.status}'.`,
//         });
//     }

//     // Only the creating manager can edit their own draft
//     const managerId = await resolveEmployeeId(userId, companyId, eid);
//     if (
//       managerId &&
//       appraisal.manager_id !== managerId &&
//       req.user.role !== "hr_manager" &&
//       req.user.role !== "admin"
//     ) {
//       return res
//         .status(403)
//         .json({ message: "You can only edit your own appraisal drafts." });
//     }

//     const ratings = managerRatings ?? appraisal.manager_ratings;
//     const managerOverall = computeWeightedScore(ratings);

//     const updated = await db.query(
//       `UPDATE appraisals
//        SET manager_feedback  = COALESCE($1, manager_feedback),
//            manager_ratings   = COALESCE($2, manager_ratings),
//            manager_overall   = $3,
//            cycle_name        = COALESCE($4, cycle_name),
//            template_id       = COALESCE($5, template_id),
//            hr_score_weight   = COALESCE($6, hr_score_weight),
//            updated_at        = NOW()
//        WHERE id = $7
//        RETURNING *`,
//       [
//         managerFeedback ?? null,
//         managerRatings ? JSON.stringify(managerRatings) : null,
//         managerOverall,
//         cycleName ?? null,
//         templateId ?? null,
//         hrScoreWeight ?? null,
//         id,
//       ],
//     );

//     return res
//       .status(200)
//       .json({
//         message: "Appraisal updated.",
//         appraisal: formatAppraisal(updated.rows[0]),
//       });
//   } catch (err) {
//     console.error("updateAppraisal error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error updating appraisal." });
//   }
// }

// // PATCH /api/appraisals/:id/submit
// // Manager submits the appraisal → goes to HR queue (status: submitted)
// export async function submitAppraisal(req, res) {
//   const { id } = req.params;
//   const { companyId, userId, employeeId: eid } = req.user;

//   try {
//     const existing = await db.query(
//       "SELECT * FROM appraisals WHERE id = $1 AND company_id = $2",
//       [id, companyId],
//     );
//     if (existing.rowCount === 0)
//       return res.status(404).json({ message: "Appraisal not found." });

//     const appraisal = existing.rows[0];

//     if (!["draft", "rejected"].includes(appraisal.status)) {
//       return res
//         .status(409)
//         .json({
//           message: `Appraisal is already in status '${appraisal.status}'.`,
//         });
//     }

//     // Must have at least a feedback or ratings before submitting
//     if (
//       !appraisal.manager_feedback &&
//       (!appraisal.manager_ratings || appraisal.manager_ratings.length === 0)
//     ) {
//       return res
//         .status(400)
//         .json({ message: "Please add feedback or ratings before submitting." });
//     }

//     const managerId = await resolveEmployeeId(userId, companyId, eid);
//     if (
//       managerId &&
//       appraisal.manager_id !== managerId &&
//       req.user.role !== "admin"
//     ) {
//       return res
//         .status(403)
//         .json({ message: "You can only submit your own appraisals." });
//     }

//     const updated = await db.query(
//       `UPDATE appraisals
//        SET status       = 'submitted',
//            submitted_at = NOW(),
//            updated_at   = NOW()
//        WHERE id = $1
//        RETURNING *`,
//       [id],
//     );

//     return res.status(200).json({
//       message: "Appraisal submitted to HR for review.",
//       appraisal: formatAppraisal(updated.rows[0]),
//     });
//   } catch (err) {
//     console.error("submitAppraisal error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error submitting appraisal." });
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // APPRAISALS — HR FLOW
// // ══════════════════════════════════════════════════════════════

// // PATCH /api/appraisals/:id/hr-review
// // HR manager scores and finalises the appraisal.
// // Writes appraisal_score back to performance_scores if a score row exists.
// // Body: { hrFeedback, hrRatings, hrScoreWeight? }
// export async function hrReviewAppraisal(req, res) {
//   const { id } = req.params;
//   const { companyId, userId, employeeId: eid } = req.user;
//   const { hrFeedback, hrRatings = [], hrScoreWeight } = req.body;

//   if (!hrFeedback && hrRatings.length === 0) {
//     return res
//       .status(400)
//       .json({ message: "HR must provide feedback or ratings." });
//   }

//   const client = await db.connect();
//   try {
//     await client.query("BEGIN");

//     const existing = await client.query(
//       "SELECT * FROM appraisals WHERE id = $1 AND company_id = $2",
//       [id, companyId],
//     );
//     if (existing.rowCount === 0) {
//       await client.query("ROLLBACK");
//       return res.status(404).json({ message: "Appraisal not found." });
//     }

//     const appraisal = existing.rows[0];
//     if (appraisal.status !== "submitted") {
//       await client.query("ROLLBACK");
//       return res.status(409).json({
//         message: `Appraisal must be in 'submitted' status for HR review. Current: '${appraisal.status}'.`,
//       });
//     }

//     const hrReviewerId = await resolveEmployeeId(userId, companyId, eid);
//     const hrOverall = computeWeightedScore(
//       hrRatings.length > 0 ? hrRatings : null,
//     );
//     const effectiveHrWeight =
//       hrScoreWeight ?? Number(appraisal.hr_score_weight);

//     // ── Blend manager + HR scores into a single appraisal_score ──
//     // HR score carries hrScoreWeight%, manager carries the rest.
//     const managerWeight = 100 - effectiveHrWeight;
//     const managerOverall = Number(appraisal.manager_overall ?? 0);
//     const hrScore = hrOverall ?? 0;

//     const appraisalScore =
//       Math.round(
//         ((managerOverall * managerWeight + hrScore * effectiveHrWeight) / 100) *
//           100,
//       ) / 100;

//     // ── Update appraisal row ──────────────────────────────────
//     const updated = await client.query(
//       `UPDATE appraisals
//        SET hr_reviewer_id  = $1,
//            hr_feedback     = $2,
//            hr_ratings      = $3,
//            hr_overall      = $4,
//            hr_score_weight = $5,
//            appraisal_score = $6,
//            status          = 'hr_scored',
//            hr_reviewed_at  = NOW(),
//            updated_at      = NOW()
//        WHERE id = $7
//        RETURNING *`,
//       [
//         hrReviewerId,
//         hrFeedback ?? null,
//         JSON.stringify(hrRatings),
//         hrOverall,
//         effectiveHrWeight,
//         appraisalScore,
//         id,
//       ],
//     );

//     // ── Write appraisal_score → performance_scores ────────────
//     // Only update the row if it already exists (don't force-create it).
//     await client.query(
//       `UPDATE performance_scores
//        SET appraisal_score = $1,
//            updated_at      = NOW()
//        WHERE employee_id = $2
//          AND company_id  = $3
//          AND period      = $4`,
//       [appraisalScore, appraisal.employee_id, companyId, appraisal.period],
//     );

//     await client.query("COMMIT");

//     return res.status(200).json({
//       message:
//         "HR review complete. Appraisal score synced to performance record.",
//       appraisal: formatAppraisal(updated.rows[0]),
//       appraisalScore,
//     });
//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error("hrReviewAppraisal error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error completing HR review." });
//   } finally {
//     client.release();
//   }
// }

// // PATCH /api/appraisals/:id/finalize
// // HR finalises (locks) the appraisal after hr_scored.
// // Triggers re-blend of final performance score if needed.
// export async function finalizeAppraisal(req, res) {
//   const { id } = req.params;
//   const { companyId } = req.user;

//   const client = await db.connect();
//   try {
//     await client.query("BEGIN");

//     const existing = await client.query(
//       "SELECT * FROM appraisals WHERE id = $1 AND company_id = $2",
//       [id, companyId],
//     );
//     if (existing.rowCount === 0) {
//       await client.query("ROLLBACK");
//       return res.status(404).json({ message: "Appraisal not found." });
//     }

//     const appraisal = existing.rows[0];
//     if (appraisal.status !== "hr_scored") {
//       await client.query("ROLLBACK");
//       return res.status(409).json({
//         message: `Appraisal must be 'hr_scored' before finalising. Current: '${appraisal.status}'.`,
//       });
//     }

//     const updated = await client.query(
//       `UPDATE appraisals
//        SET status     = 'completed',
//            updated_at = NOW()
//        WHERE id = $1
//        RETURNING *`,
//       [id],
//     );

//     // ── Recompute final_score in performance_scores with appraisal blend ──
//     // Weights: KPI 40% | Attendance 20% | Training 20% | Appraisal 20%
//     await client.query(
//       `UPDATE performance_scores
//        SET rating     = CASE
//                           WHEN (kpi_score * 0.40 + attendance_score * 0.20 + training_score * 0.20 + COALESCE(appraisal_score, 0) * 0.20) >= 90 THEN 'Outstanding'
//                           WHEN (kpi_score * 0.40 + attendance_score * 0.20 + training_score * 0.20 + COALESCE(appraisal_score, 0) * 0.20) >= 75 THEN 'High Performer'
//                           WHEN (kpi_score * 0.40 + attendance_score * 0.20 + training_score * 0.20 + COALESCE(appraisal_score, 0) * 0.20) >= 60 THEN 'Meets Expectations'
//                           WHEN (kpi_score * 0.40 + attendance_score * 0.20 + training_score * 0.20 + COALESCE(appraisal_score, 0) * 0.20) >= 40 THEN 'Needs Improvement'
//                           ELSE 'Underperforming'
//                         END,
//            updated_at = NOW()
//        WHERE employee_id = $1
//          AND company_id  = $2
//          AND period      = $3`,
//       [appraisal.employee_id, companyId, appraisal.period],
//     );

//     await client.query("COMMIT");

//     return res.status(200).json({
//       message: "Appraisal finalised and performance record updated.",
//       appraisal: formatAppraisal(updated.rows[0]),
//     });
//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error("finalizeAppraisal error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error finalising appraisal." });
//   } finally {
//     client.release();
//   }
// }

// // PATCH /api/appraisals/:id/reject
// // HR sends appraisal back to manager with a rejection note.
// export async function rejectAppraisal(req, res) {
//   const { id } = req.params;
//   const { companyId } = req.user;
//   const { reason } = req.body;

//   if (!reason?.trim()) {
//     return res.status(400).json({ message: "A rejection reason is required." });
//   }

//   try {
//     const existing = await db.query(
//       "SELECT * FROM appraisals WHERE id = $1 AND company_id = $2",
//       [id, companyId],
//     );
//     if (existing.rowCount === 0)
//       return res.status(404).json({ message: "Appraisal not found." });

//     if (existing.rows[0].status !== "submitted") {
//       return res
//         .status(409)
//         .json({ message: "Only submitted appraisals can be rejected." });
//     }

//     const updated = await db.query(
//       `UPDATE appraisals
//        SET status          = 'rejected',
//            hr_feedback     = $1,
//            updated_at      = NOW()
//        WHERE id = $2
//        RETURNING *`,
//       [reason.trim(), id],
//     );

//     return res.status(200).json({
//       message: "Appraisal rejected and returned to manager.",
//       appraisal: formatAppraisal(updated.rows[0]),
//     });
//   } catch (err) {
//     console.error("rejectAppraisal error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error rejecting appraisal." });
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // READ — LIST / GET
// // ══════════════════════════════════════════════════════════════

// // GET /api/appraisals
// // Query: ?status=submitted&period=2025-06&employeeId=uuid&managerId=uuid
// export async function listAppraisals(req, res) {
//   try {
//     const { companyId } = req.user;
//     const { status, period, employeeId, managerId } = req.query;

//     const conditions = ["a.company_id = $1"];
//     const params = [companyId];
//     let idx = 2;

//     if (status) {
//       conditions.push(`a.status = $${idx++}`);
//       params.push(status);
//     }
//     if (period) {
//       conditions.push(`a.period = $${idx++}`);
//       params.push(period);
//     }
//     if (employeeId) {
//       conditions.push(`a.employee_id = $${idx++}`);
//       params.push(employeeId);
//     }
//     if (managerId) {
//       conditions.push(`a.manager_id = $${idx++}`);
//       params.push(managerId);
//     }

//     const result = await db.query(
//       `SELECT
//          a.*,
//          e.first_name  AS employee_first_name,
//          e.last_name   AS employee_last_name,
//          e.email       AS employee_email,
//          e.avatar      AS employee_avatar,
//          d.name        AS department_name,
//          jr.title      AS job_role_name,
//          m.first_name  AS manager_first_name,
//          m.last_name   AS manager_last_name,
//          hr.first_name AS hr_first_name,
//          hr.last_name  AS hr_last_name
//        FROM appraisals a
//        JOIN employees e          ON e.id  = a.employee_id
//        LEFT JOIN departments d   ON d.id  = e.department_id
//        LEFT JOIN job_roles   jr  ON jr.id = e.job_role_id
//        LEFT JOIN employees   m   ON m.id  = a.manager_id
//        LEFT JOIN employees   hr  ON hr.id = a.hr_reviewer_id
//        WHERE ${conditions.join(" AND ")}
//        ORDER BY a.created_at DESC`,
//       params,
//     );

//     return res.status(200).json({
//       appraisals: result.rows.map(formatAppraisal),
//       total: result.rowCount,
//     });
//   } catch (err) {
//     console.error("listAppraisals error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error fetching appraisals." });
//   }
// }

// // GET /api/appraisals/:id
// export async function getAppraisal(req, res) {
//   try {
//     const { id } = req.params;
//     const { companyId } = req.user;

//     const result = await db.query(
//       `SELECT
//          a.*,
//          e.first_name  AS employee_first_name,
//          e.last_name   AS employee_last_name,
//          e.email       AS employee_email,
//          e.avatar      AS employee_avatar,
//          d.name        AS department_name,
//          jr.title      AS job_role_name,
//          m.first_name  AS manager_first_name,
//          m.last_name   AS manager_last_name,
//          hr.first_name AS hr_first_name,
//          hr.last_name  AS hr_last_name
//        FROM appraisals a
//        JOIN employees e          ON e.id  = a.employee_id
//        LEFT JOIN departments d   ON d.id  = e.department_id
//        LEFT JOIN job_roles   jr  ON jr.id = e.job_role_id
//        LEFT JOIN employees   m   ON m.id  = a.manager_id
//        LEFT JOIN employees   hr  ON hr.id = a.hr_reviewer_id
//        WHERE a.id = $1 AND a.company_id = $2`,
//       [id, companyId],
//     );

//     if (result.rowCount === 0)
//       return res.status(404).json({ message: "Appraisal not found." });

//     return res.status(200).json({ appraisal: formatAppraisal(result.rows[0]) });
//   } catch (err) {
//     console.error("getAppraisal error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error fetching appraisal." });
//   }
// }

// // GET /api/appraisals/me
// // Employee sees their own appraisals.
// export async function getMyAppraisals(req, res) {
//   try {
//     const { userId, companyId, employeeId: eid } = req.user;
//     const employeeId = await resolveEmployeeId(userId, companyId, eid);
//     if (!employeeId)
//       return res.status(404).json({ message: "Employee profile not found." });

//     const result = await db.query(
//       `SELECT
//          a.*,
//          m.first_name AS manager_first_name,
//          m.last_name  AS manager_last_name
//        FROM appraisals a
//        LEFT JOIN employees m ON m.id = a.manager_id
//        WHERE a.employee_id = $1
//        ORDER BY a.created_at DESC`,
//       [employeeId],
//     );

//     return res.status(200).json({
//       appraisals: result.rows.map(formatAppraisal),
//       total: result.rowCount,
//     });
//   } catch (err) {
//     console.error("getMyAppraisals error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error fetching your appraisals." });
//   }
// }

// // GET /api/appraisals/pending-hr
// // HR queue: all appraisals awaiting HR review.
// export async function getPendingHRAppraisals(req, res) {
//   try {
//     const { companyId } = req.user;

//     const result = await db.query(
//       `SELECT
//          a.*,
//          e.first_name  AS employee_first_name,
//          e.last_name   AS employee_last_name,
//          e.avatar      AS employee_avatar,
//          d.name        AS department_name,
//          jr.title      AS job_role_name,
//          m.first_name  AS manager_first_name,
//          m.last_name   AS manager_last_name
//        FROM appraisals a
//        JOIN employees e          ON e.id  = a.employee_id
//        LEFT JOIN departments d   ON d.id  = e.department_id
//        LEFT JOIN job_roles   jr  ON jr.id = e.job_role_id
//        LEFT JOIN employees   m   ON m.id  = a.manager_id
//        WHERE a.company_id = $1 AND a.status = 'submitted'
//        ORDER BY a.submitted_at ASC`,
//       [companyId],
//     );

//     return res.status(200).json({
//       appraisals: result.rows.map(formatAppraisal),
//       total: result.rowCount,
//     });
//   } catch (err) {
//     console.error("getPendingHRAppraisals error:", err);
//     return res.status(500).json({ message: "Server error fetching HR queue." });
//   }
// }


// src/controllers/appraisal.controller.js

import { db } from "../config/db.js";

// ── helpers ───────────────────────────────────────────────────

function computeWeightedScore(ratings = []) {
  if (!ratings || ratings.length === 0) return null;
  let weightedSum = 0;
  let totalWeight = 0;
  for (const r of ratings) {
    const weight = Number(r.weight ?? 1);
    const score  = Number(r.score  ?? 0);
    const max    = Number(r.maxScore ?? 5);
    weightedSum += (score / max) * 100 * weight;
    totalWeight += weight;
  }
  if (totalWeight === 0) return null;
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

function formatAppraisal(row) {
  return {
    id:             row.id,
    companyId:      row.company_id,
    employeeId:     row.employee_id,
    managerId:      row.manager_id,
    hrReviewerId:   row.hr_reviewer_id,
    templateId:     row.template_id,
    period:         row.period,
    cycleName:      row.cycle_name,
    managerFeedback: row.manager_feedback,
    managerRatings:  row.manager_ratings  ?? [],
    managerOverall:  row.manager_overall  != null ? Number(row.manager_overall)  : null,
    submittedAt:    row.submitted_at,
    hrFeedback:     row.hr_feedback,
    hrRatings:      row.hr_ratings        ?? [],
    hrOverall:      row.hr_overall        != null ? Number(row.hr_overall)        : null,
    hrScoreWeight:  Number(row.hr_score_weight ?? 20),
    hrReviewedAt:   row.hr_reviewed_at,
    appraisalScore: row.appraisal_score   != null ? Number(row.appraisal_score)   : null,
    status:         row.status,
    createdBy:      row.created_by,
    createdAt:      row.created_at,
    updatedAt:      row.updated_at,
    employee: row.employee_first_name ? {
      firstName:  row.employee_first_name,
      lastName:   row.employee_last_name,
      email:      row.employee_email   ?? null,
      avatar:     row.employee_avatar  ?? null,
      department: row.department_name  ?? null,
      jobRole:    row.job_role_name    ?? null,
    } : undefined,
    manager: row.manager_first_name
      ? { firstName: row.manager_first_name, lastName: row.manager_last_name }
      : undefined,
    hrReviewer: row.hr_first_name
      ? { firstName: row.hr_first_name, lastName: row.hr_last_name }
      : undefined,
  };
}

async function resolveEmployeeId(userId, companyId, fromJwt = null) {
  if (fromJwt) return fromJwt;
  const r = await db.query(
    "SELECT id FROM employees WHERE user_id = $1 AND company_id = $2",
    [userId, companyId],
  );
  return r.rows[0]?.id ?? null;
}

// ══════════════════════════════════════════════════════════════
// TEMPLATES
// ══════════════════════════════════════════════════════════════

export async function listTemplates(req, res) {
  try {
    const { companyId } = req.user;
    const result = await db.query(
      `SELECT t.*,
         COALESCE(json_agg(c ORDER BY c.sort_order) FILTER (WHERE c.id IS NOT NULL), '[]') AS criteria
       FROM appraisal_templates t
       LEFT JOIN appraisal_criteria c ON c.template_id = t.id
       WHERE t.company_id = $1
       GROUP BY t.id
       ORDER BY t.created_at DESC`,
      [companyId],
    );
    return res.status(200).json({ templates: result.rows, total: result.rowCount });
  } catch (err) {
    console.error("listTemplates error:", err);
    return res.status(500).json({ message: "Server error fetching templates." });
  }
}

export async function createTemplate(req, res) {
  const { companyId } = req.user;
  const { name, description, criteria = [] } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Template name is required." });
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const tmpl = await client.query(
      `INSERT INTO appraisal_templates (company_id, name, description)
       VALUES ($1, $2, $3) RETURNING *`,
      [companyId, name.trim(), description ?? null],
    );
    const templateId = tmpl.rows[0].id;

    const insertedCriteria = [];
    for (const [i, c] of criteria.entries()) {
      if (!c.label?.trim()) continue;
      const cr = await client.query(
        `INSERT INTO appraisal_criteria (template_id, label, weight, max_score, sort_order)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [templateId, c.label.trim(), c.weight ?? 100 / criteria.length, c.maxScore ?? 5, c.sortOrder ?? i],
      );
      insertedCriteria.push(cr.rows[0]);
    }

    await client.query("COMMIT");
    return res.status(201).json({
      message: "Template created.",
      template: { ...tmpl.rows[0], criteria: insertedCriteria },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("createTemplate error:", err);
    return res.status(500).json({ message: "Server error creating template." });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════════════
// MANAGER FLOW
// ══════════════════════════════════════════════════════════════

export async function createAppraisal(req, res) {
  const { companyId, userId, employeeId: eid } = req.user;
  const { employeeId } = req.params;
  const {
    period,
    cycleName,
    templateId,
    managerFeedback,
    managerRatings = [],
    hrScoreWeight = 20,
  } = req.body;

  if (!period || !/^\d{4}-\d{2}$/.test(period)) {
    return res.status(400).json({ message: "period must be YYYY-MM." });
  }

  try {
    const empCheck = await db.query(
      "SELECT id FROM employees WHERE id = $1 AND company_id = $2",
      [employeeId, companyId],
    );
    if (empCheck.rowCount === 0) {
      return res.status(404).json({ message: "Employee not found in this company." });
    }

    const managerId = await resolveEmployeeId(userId, companyId, eid);

    const dupe = await db.query(
      "SELECT id, status FROM appraisals WHERE employee_id = $1 AND company_id = $2 AND period = $3",
      [employeeId, companyId, period],
    );
    if (dupe.rowCount > 0) {
      return res.status(409).json({
        message: `An appraisal for this employee already exists for period ${period}.`,
        existing: { id: dupe.rows[0].id, status: dupe.rows[0].status },
      });
    }

    const managerOverall = computeWeightedScore(managerRatings);

    const result = await db.query(
      `INSERT INTO appraisals
         (company_id, employee_id, manager_id, template_id, period, cycle_name,
          manager_feedback, manager_ratings, manager_overall, hr_score_weight,
          status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'draft',$3)
       RETURNING *`,
      [
        companyId,
        employeeId,
        managerId,
        templateId ?? null,
        period,
        cycleName  ?? null,
        managerFeedback ?? null,
        JSON.stringify(managerRatings),
        managerOverall,
        hrScoreWeight,
      ],
    );

    return res.status(201).json({
      message: "Appraisal draft created.",
      appraisal: formatAppraisal(result.rows[0]),
    });
  } catch (err) {
    console.error("createAppraisal error:", err);
    return res.status(500).json({ message: "Server error creating appraisal." });
  }
}

export async function updateAppraisal(req, res) {
  const { id } = req.params;
  const { companyId, userId, employeeId: eid } = req.user;
  const { managerFeedback, managerRatings, cycleName, templateId, hrScoreWeight } = req.body;

  try {
    const existing = await db.query(
      "SELECT * FROM appraisals WHERE id = $1 AND company_id = $2",
      [id, companyId],
    );
    if (existing.rowCount === 0)
      return res.status(404).json({ message: "Appraisal not found." });

    const appraisal = existing.rows[0];
    if (!["draft", "rejected"].includes(appraisal.status)) {
      return res.status(409).json({ message: `Cannot edit appraisal in status '${appraisal.status}'.` });
    }

    const managerId = await resolveEmployeeId(userId, companyId, eid);
    if (
      managerId &&
      appraisal.manager_id !== managerId &&
      req.user.role !== "hr_admin" &&
      req.user.role !== "super_admin"
    ) {
      return res.status(403).json({ message: "You can only edit your own appraisal drafts." });
    }

    const ratings      = managerRatings ?? appraisal.manager_ratings;
    const managerOverall = computeWeightedScore(ratings);

    const updated = await db.query(
      `UPDATE appraisals
       SET manager_feedback = COALESCE($1, manager_feedback),
           manager_ratings  = COALESCE($2, manager_ratings),
           manager_overall  = $3,
           cycle_name       = COALESCE($4, cycle_name),
           template_id      = COALESCE($5, template_id),
           hr_score_weight  = COALESCE($6, hr_score_weight),
           updated_at       = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        managerFeedback ?? null,
        managerRatings ? JSON.stringify(managerRatings) : null,
        managerOverall,
        cycleName   ?? null,
        templateId  ?? null,
        hrScoreWeight ?? null,
        id,
      ],
    );

    return res.status(200).json({ message: "Appraisal updated.", appraisal: formatAppraisal(updated.rows[0]) });
  } catch (err) {
    console.error("updateAppraisal error:", err);
    return res.status(500).json({ message: "Server error updating appraisal." });
  }
}

export async function submitAppraisal(req, res) {
  const { id } = req.params;
  const { companyId, userId, employeeId: eid } = req.user;

  try {
    const existing = await db.query(
      "SELECT * FROM appraisals WHERE id = $1 AND company_id = $2",
      [id, companyId],
    );
    if (existing.rowCount === 0)
      return res.status(404).json({ message: "Appraisal not found." });

    const appraisal = existing.rows[0];

    if (!["draft", "rejected"].includes(appraisal.status)) {
      return res.status(409).json({ message: `Appraisal is already in status '${appraisal.status}'.` });
    }

    if (
      !appraisal.manager_feedback &&
      (!appraisal.manager_ratings || appraisal.manager_ratings.length === 0)
    ) {
      return res.status(400).json({ message: "Please add feedback or ratings before submitting." });
    }

    const managerId = await resolveEmployeeId(userId, companyId, eid);
    if (
      managerId &&
      appraisal.manager_id !== managerId &&
      req.user.role !== "super_admin"
    ) {
      return res.status(403).json({ message: "You can only submit your own appraisals." });
    }

    const updated = await db.query(
      `UPDATE appraisals
       SET status       = 'submitted',
           submitted_at = NOW(),
           updated_at   = NOW()
       WHERE id = $1
       RETURNING *`,
      [id],
    );

    return res.status(200).json({
      message: "Appraisal submitted to HR for review.",
      appraisal: formatAppraisal(updated.rows[0]),
    });
  } catch (err) {
    console.error("submitAppraisal error:", err);
    return res.status(500).json({ message: "Server error submitting appraisal." });
  }
}

// ══════════════════════════════════════════════════════════════
// HR FLOW
// ══════════════════════════════════════════════════════════════

export async function hrReviewAppraisal(req, res) {
  const { id } = req.params;
  const { companyId, userId, employeeId: eid } = req.user;
  const { hrFeedback, hrRatings = [], hrScoreWeight } = req.body;

  if (!hrFeedback && hrRatings.length === 0) {
    return res.status(400).json({ message: "HR must provide feedback or ratings." });
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      "SELECT * FROM appraisals WHERE id = $1 AND company_id = $2",
      [id, companyId],
    );
    if (existing.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Appraisal not found." });
    }

    const appraisal = existing.rows[0];
    if (appraisal.status !== "submitted") {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: `Appraisal must be 'submitted' for HR review. Current: '${appraisal.status}'.`,
      });
    }

    const hrReviewerId      = await resolveEmployeeId(userId, companyId, eid);
    const hrOverall         = computeWeightedScore(hrRatings.length > 0 ? hrRatings : null);
    const effectiveHrWeight = hrScoreWeight ?? Number(appraisal.hr_score_weight ?? 20);
    const managerWeight     = 100 - effectiveHrWeight;
    const managerOverall    = Number(appraisal.manager_overall ?? 0);
    const hrScore           = hrOverall ?? managerOverall; // if no HR ratings, trust manager fully

    const appraisalScore = Math.round(
      (managerOverall * managerWeight + hrScore * effectiveHrWeight) / 100,
    );

    const updated = await client.query(
      `UPDATE appraisals
       SET hr_reviewer_id  = $1,
           hr_feedback     = $2,
           hr_ratings      = $3,
           hr_overall      = $4,
           hr_score_weight = $5,
           appraisal_score = $6,
           status          = 'hr_scored',
           hr_reviewed_at  = NOW(),
           updated_at      = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        hrReviewerId,
        hrFeedback ?? null,
        JSON.stringify(hrRatings),
        hrOverall,
        effectiveHrWeight,
        appraisalScore,
        id,
      ],
    );

    // Write appraisal_score back to performance_scores if the row exists
    await client.query(
      `UPDATE performance_scores
       SET appraisal_score = $1, updated_at = NOW()
       WHERE employee_id = $2 AND company_id = $3 AND period = $4`,
      [appraisalScore, appraisal.employee_id, companyId, appraisal.period],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: "HR review complete. Appraisal score synced to performance record.",
      appraisal: formatAppraisal(updated.rows[0]),
      appraisalScore,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("hrReviewAppraisal error:", err);
    return res.status(500).json({ message: "Server error completing HR review." });
  } finally {
    client.release();
  }
}

export async function finalizeAppraisal(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      "SELECT * FROM appraisals WHERE id = $1 AND company_id = $2",
      [id, companyId],
    );
    if (existing.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Appraisal not found." });
    }

    const appraisal = existing.rows[0];
    if (appraisal.status !== "hr_scored") {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: `Appraisal must be 'hr_scored' before finalising. Current: '${appraisal.status}'.`,
      });
    }

    const updated = await client.query(
      `UPDATE appraisals SET status = 'completed', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id],
    );

    // Re-derive rating label in performance_scores using the four-way blend
    await client.query(
      `UPDATE performance_scores
       SET rating = CASE
         WHEN (kpi_score * 0.40 + attendance_score * 0.20 + training_score * 0.20 + COALESCE(appraisal_score, 0) * 0.20) >= 90 THEN 'Outstanding'
         WHEN (kpi_score * 0.40 + attendance_score * 0.20 + training_score * 0.20 + COALESCE(appraisal_score, 0) * 0.20) >= 75 THEN 'High Performer'
         WHEN (kpi_score * 0.40 + attendance_score * 0.20 + training_score * 0.20 + COALESCE(appraisal_score, 0) * 0.20) >= 60 THEN 'Meets Expectations'
         WHEN (kpi_score * 0.40 + attendance_score * 0.20 + training_score * 0.20 + COALESCE(appraisal_score, 0) * 0.20) >= 40 THEN 'Needs Improvement'
         ELSE 'Underperforming'
       END,
       updated_at = NOW()
       WHERE employee_id = $1 AND company_id = $2 AND period = $3`,
      [appraisal.employee_id, companyId, appraisal.period],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Appraisal finalised and performance record updated.",
      appraisal: formatAppraisal(updated.rows[0]),
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("finalizeAppraisal error:", err);
    return res.status(500).json({ message: "Server error finalising appraisal." });
  } finally {
    client.release();
  }
}

export async function rejectAppraisal(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;
  const { reason } = req.body;

  if (!reason?.trim()) {
    return res.status(400).json({ message: "A rejection reason is required." });
  }

  try {
    const existing = await db.query(
      "SELECT * FROM appraisals WHERE id = $1 AND company_id = $2",
      [id, companyId],
    );
    if (existing.rowCount === 0)
      return res.status(404).json({ message: "Appraisal not found." });

    if (existing.rows[0].status !== "submitted") {
      return res.status(409).json({ message: "Only submitted appraisals can be rejected." });
    }

    const updated = await db.query(
      `UPDATE appraisals
       SET status      = 'rejected',
           hr_feedback = $1,
           updated_at  = NOW()
       WHERE id = $2
       RETURNING *`,
      [reason.trim(), id],
    );

    return res.status(200).json({
      message: "Appraisal rejected and returned to manager.",
      appraisal: formatAppraisal(updated.rows[0]),
    });
  } catch (err) {
    console.error("rejectAppraisal error:", err);
    return res.status(500).json({ message: "Server error rejecting appraisal." });
  }
}

// ══════════════════════════════════════════════════════════════
// READ
// ══════════════════════════════════════════════════════════════

export async function listAppraisals(req, res) {
  try {
    const { companyId } = req.user;
    const { status, period, employeeId, managerId } = req.query;

    const conditions = ["a.company_id = $1"];
    const params = [companyId];
    let idx = 2;

    if (status)     { conditions.push(`a.status      = $${idx++}`); params.push(status);     }
    if (period)     { conditions.push(`a.period      = $${idx++}`); params.push(period);     }
    if (employeeId) { conditions.push(`a.employee_id = $${idx++}`); params.push(employeeId); }
    if (managerId)  { conditions.push(`a.manager_id  = $${idx++}`); params.push(managerId);  }

    const result = await db.query(
      `SELECT
         a.*,
         e.first_name  AS employee_first_name,
         e.last_name   AS employee_last_name,
         e.email       AS employee_email,
         e.avatar      AS employee_avatar,
         d.name        AS department_name,
         jr.title      AS job_role_name,
         m.first_name  AS manager_first_name,
         m.last_name   AS manager_last_name,
         hr.first_name AS hr_first_name,
         hr.last_name  AS hr_last_name
       FROM appraisals a
       JOIN  employees   e  ON e.id  = a.employee_id
       LEFT JOIN departments  d  ON d.id  = e.department_id
       LEFT JOIN job_roles    jr ON jr.id = e.job_role_id
       LEFT JOIN employees   m  ON m.id  = a.manager_id
       LEFT JOIN employees   hr ON hr.id = a.hr_reviewer_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY a.created_at DESC`,
      params,
    );

    return res.status(200).json({
      appraisals: result.rows.map(formatAppraisal),
      total: result.rowCount,
    });
  } catch (err) {
    console.error("listAppraisals error:", err);
    return res.status(500).json({ message: "Server error fetching appraisals." });
  }
}

export async function getAppraisal(req, res) {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const result = await db.query(
      `SELECT
         a.*,
         e.first_name  AS employee_first_name,
         e.last_name   AS employee_last_name,
         e.email       AS employee_email,
         e.avatar      AS employee_avatar,
         d.name        AS department_name,
         jr.title      AS job_role_name,
         m.first_name  AS manager_first_name,
         m.last_name   AS manager_last_name,
         hr.first_name AS hr_first_name,
         hr.last_name  AS hr_last_name
       FROM appraisals a
       JOIN  employees   e  ON e.id  = a.employee_id
       LEFT JOIN departments  d  ON d.id  = e.department_id
       LEFT JOIN job_roles    jr ON jr.id = e.job_role_id
       LEFT JOIN employees   m  ON m.id  = a.manager_id
       LEFT JOIN employees   hr ON hr.id = a.hr_reviewer_id
       WHERE a.id = $1 AND a.company_id = $2`,
      [id, companyId],
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Appraisal not found." });

    return res.status(200).json({ appraisal: formatAppraisal(result.rows[0]) });
  } catch (err) {
    console.error("getAppraisal error:", err);
    return res.status(500).json({ message: "Server error fetching appraisal." });
  }
}

export async function getMyAppraisals(req, res) {
  try {
    const { userId, companyId, employeeId: eid } = req.user;
    const employeeId = await resolveEmployeeId(userId, companyId, eid);
    if (!employeeId)
      return res.status(404).json({ message: "Employee profile not found." });

    const result = await db.query(
      `SELECT a.*, m.first_name AS manager_first_name, m.last_name AS manager_last_name
       FROM appraisals a
       LEFT JOIN employees m ON m.id = a.manager_id
       WHERE a.employee_id = $1
       ORDER BY a.created_at DESC`,
      [employeeId],
    );

    return res.status(200).json({
      appraisals: result.rows.map(formatAppraisal),
      total: result.rowCount,
    });
  } catch (err) {
    console.error("getMyAppraisals error:", err);
    return res.status(500).json({ message: "Server error fetching your appraisals." });
  }
}

export async function getPendingHRAppraisals(req, res) {
  try {
    const { companyId } = req.user;

    const result = await db.query(
      `SELECT
         a.*,
         e.first_name  AS employee_first_name,
         e.last_name   AS employee_last_name,
         e.avatar      AS employee_avatar,
         d.name        AS department_name,
         jr.title      AS job_role_name,
         m.first_name  AS manager_first_name,
         m.last_name   AS manager_last_name
       FROM appraisals a
       JOIN  employees   e  ON e.id  = a.employee_id
       LEFT JOIN departments  d  ON d.id  = e.department_id
       LEFT JOIN job_roles    jr ON jr.id = e.job_role_id
       LEFT JOIN employees   m  ON m.id  = a.manager_id
       WHERE a.company_id = $1 AND a.status = 'submitted'
       ORDER BY a.submitted_at ASC`,
      [companyId],
    );

    return res.status(200).json({
      appraisals: result.rows.map(formatAppraisal),
      total: result.rowCount,
    });
  } catch (err) {
    console.error("getPendingHRAppraisals error:", err);
    return res.status(500).json({ message: "Server error fetching HR queue." });
  }
}