// // src/routes/performance.routes.js
// import { Router } from "express";
// import { body, query, param } from "express-validator";
// import { authenticate, requireRole } from "../middleware/authenticate.js";
// import {
//   getCycles,
//   createCycle,
//   getAllReviews,
//   getMyReviews,
//   submitSelfAssessment,
//   submitManagerAssessment,
//   finalizeReview,
//   getAllGoals,
//   createGoal,
//   updateGoal,
//   getMyGoals,
// } from "../controllers/performance.controller.js";

// const router = Router();

// // All performance routes require authentication
// router.use(authenticate);

// // ─── Validation rule sets ──────────────────────────────────────

// const cycleRules = [
//   body("name")
//     .trim()
//     .notEmpty()
//     .withMessage("Cycle name is required.")
//     .isLength({ max: 100 })
//     .withMessage("Cycle name must be under 100 characters."),
//   body("periodStart")
//     .notEmpty()
//     .withMessage("Period start date is required.")
//     .isISO8601()
//     .withMessage("Period start must be a valid date (YYYY-MM-DD)."),
//   body("periodEnd")
//     .notEmpty()
//     .withMessage("Period end date is required.")
//     .isISO8601()
//     .withMessage("Period end must be a valid date (YYYY-MM-DD).")
//     .custom((end, { req }) => {
//       if (new Date(end) <= new Date(req.body.periodStart)) {
//         throw new Error("Period end must be after period start.");
//       }
//       return true;
//     }),
//   body("status")
//     .optional()
//     .isIn(["active", "closed", "draft"])
//     .withMessage("Status must be active, closed, or draft."),
// ];

// const selfAssessmentRules = [
//   param("id").isUUID().withMessage("Review ID must be a valid UUID."),
//   body().custom((body) => {
//     if (!body || typeof body !== "object" || Array.isArray(body)) {
//       throw new Error("Request body must be a JSON object.");
//     }
//     return true;
//   }),
// ];

// const managerAssessmentRules = [
//   param("id").isUUID().withMessage("Review ID must be a valid UUID."),
//   body("suggestedRating")
//     .optional()
//     .isFloat({ min: 0, max: 5 })
//     .withMessage("Rating must be between 0 and 5."),
// ];

// const finalizeRules = [
//   param("id").isUUID().withMessage("Review ID must be a valid UUID."),
//   body("finalRating")
//     .notEmpty()
//     .withMessage("Final rating is required.")
//     .isFloat({ min: 0, max: 5 })
//     .withMessage("Final rating must be between 0 and 5."),
// ];

// const createGoalRules = [
//   body("employeeId")
//     .notEmpty()
//     .withMessage("Employee ID is required.")
//     .isUUID()
//     .withMessage("Employee ID must be a valid UUID."),
//   body("title")
//     .trim()
//     .notEmpty()
//     .withMessage("Goal title is required.")
//     .isLength({ max: 200 })
//     .withMessage("Title must be under 200 characters."),
//   body("description")
//     .optional()
//     .trim()
//     .isLength({ max: 1000 })
//     .withMessage("Description must be under 1000 characters."),
//   body("dueDate")
//     .notEmpty()
//     .withMessage("Due date is required.")
//     .isISO8601()
//     .withMessage("Due date must be a valid date (YYYY-MM-DD)."),
//   body("cycle").trim().notEmpty().withMessage("Cycle is required."),
//   body("progress")
//     .optional()
//     .isInt({ min: 0, max: 100 })
//     .withMessage("Progress must be between 0 and 100."),
//   body("status")
//     .optional()
//     .isIn(["not_started", "in_progress", "completed", "at_risk"])
//     .withMessage("Invalid status value."),
// ];

// const updateGoalRules = [
//   param("id").isUUID().withMessage("Goal ID must be a valid UUID."),
//   body("progress")
//     .optional()
//     .isInt({ min: 0, max: 100 })
//     .withMessage("Progress must be between 0 and 100."),
//   body("status")
//     .optional()
//     .isIn(["not_started", "in_progress", "completed", "at_risk"])
//     .withMessage("Invalid status value."),
//   body("dueDate")
//     .optional()
//     .isISO8601()
//     .withMessage("Due date must be a valid date (YYYY-MM-DD)."),
// ];

// // ─── Routes ───────────────────────────────────────────────────

// // Cycles — HR only
// router.get("/cycles", requireRole(["hr_admin", "super_admin"]), getCycles);
// router.post(
//   "/cycles",
//   cycleRules,
//   requireRole(["hr_admin", "super_admin"]),
//   createCycle,
// );

// // Reviews
// // NOTE: /reviews/me must come BEFORE /reviews/:id to avoid "me" being treated as a UUID
// router.get("/reviews/me", getMyReviews);
// router.get("/reviews", requireRole(["hr_admin", "super_admin"]), getAllReviews);
// router.put("/reviews/:id/self", selfAssessmentRules, submitSelfAssessment);
// router.put(
//   "/reviews/:id/manager",
//   managerAssessmentRules,
//   requireRole(["hr_admin", "super_admin", "manager"]),
//   submitManagerAssessment,
// );
// router.put(
//   "/reviews/:id/finalize",
//   finalizeRules,
//   requireRole(["hr_admin", "super_admin"]),
//   finalizeReview,
// );

// // Goals
// // NOTE: /goals/me must come BEFORE /goals/:id
// router.get("/goals/me", getMyGoals);
// router.get("/goals", requireRole(["hr_admin", "super_admin"]), getAllGoals);
// router.post(
//   "/goals",
//   createGoalRules,
//   requireRole(["hr_admin", "super_admin", "manager"]),
//   createGoal,
// );
// router.put("/goals/:id", updateGoalRules, updateGoal);

// export default router;

// src/routes/performance.routes.js
//
// Mount in app.js:
//   import performanceRouter from "./routes/performance.routes.js";
//   app.use("/api/performance", performanceRouter);
//
// ROOT CAUSE OF ALL 404s:
//   The score-controller endpoints (dashboard, top-performers, pip, trends,
//   insights, scores, calculate) were never registered in this file.
//   They existed in performance.score.controller.js but had no routes.
//   This file registers ALL endpoints from BOTH controllers.
//
// Full route map:
//   GET  /cycles                         → getCycles              (HR)
//   POST /cycles                         → createCycle            (HR)
//   GET  /reviews                        → getAllReviews           (HR)
//   GET  /reviews/me                     → getMyReviews           (employee)
//   PATCH /reviews/:id/self-assessment   → submitSelfAssessment   (employee)
//   PATCH /reviews/:id/manager-assessment→ submitManagerAssessment(manager/HR)
//   PATCH /reviews/:id/finalize          → finalizeReview         (HR)
//   GET  /goals                          → getAllGoals             (HR)
//   POST /goals                          → createGoal             (HR/manager)
//   GET  /goals/me                       → getMyGoals             (employee)
//   PUT  /goals/:id                      → updateGoal             (all roles)
//   POST /calculate/:employeeId          → calculateEmployeeScore (HR)
//   GET  /scores/:employeeId             → getEmployeeScores      (HR/manager)
//   GET  /dashboard                      → getPerformanceDashboard(HR) ← was 404
//   GET  /trends/:employeeId             → getPerformanceTrends   (HR/manager)
//   GET  /insights/:employeeId           → getPerformanceInsights (HR/manager)
//   GET  /top-performers                 → getTopPerformers       (HR) ← was 404
//   POST /pip/:employeeId                → createPIP              (HR)
//   GET  /pip                            → listPIPs               (HR) ← was 404

// import { Router } from "express";
// import { authenticate, requireRole } from "../middleware/authenticate.js";
// import { validate }                  from "../middleware/validate.js";

// // ── Controllers ───────────────────────────────────────────────
// import {
//   getCycles,
//   createCycle,
//   getAllReviews,
//   getMyReviews,
//   submitSelfAssessment,
//   submitManagerAssessment,
//   finalizeReview,
//   getAllGoals,
//   createGoal,
//   updateGoal,
//   getMyGoals,
// } from "../controllers/performance.controller.js";

// import {
//   calculateEmployeeScore,
//   getEmployeeScores,
//   getPerformanceDashboard,
//   getPerformanceTrends,
//   getPerformanceInsights,
//   getTopPerformers,
//   createPIP,
//   listPIPs,
// } from "../controllers/performance.score.controller.js";

// // ── Validators ────────────────────────────────────────────────
// import {
//   cycleRules,
//   selfAssessmentRules,
//   managerAssessmentRules,
//   finalizeRules,
//   createGoalRules,
//   updateGoalRules,
//   dashboardQueryRules,
// } from "../validators/performance.validator.js";

// const router     = Router();
// const HR         = ["hr_admin", "super_admin"];
// const MANAGERS   = ["manager", "hr_admin", "super_admin"];
// const ALL_ROLES  = ["employee", "manager", "hr_admin", "super_admin"];

// // All performance routes require authentication
// router.use(authenticate);

// // ══════════════════════════════════════════════════════════════
// // CYCLES
// // ══════════════════════════════════════════════════════════════

// router.get(
//   "/cycles",
//   requireRole(HR),
//   getCycles
// );

// router.post(
//   "/cycles",
//   cycleRules,
//   validate,
//   requireRole(HR),
//   createCycle
// );

// // ══════════════════════════════════════════════════════════════
// // REVIEWS
// // ══════════════════════════════════════════════════════════════

// router.get(
//   "/reviews",
//   requireRole(HR),
//   getAllReviews
// );

// // ✅ /reviews/me MUST come before /reviews/:id to avoid "me" being
// //    treated as a UUID param
// router.get(
//   "/reviews/me",
//   getMyReviews
// );

// // ✅ Changed PUT → PATCH, renamed to /self-assessment
// router.patch(
//   "/reviews/:id/self-assessment",
//   selfAssessmentRules,
//   validate,
//   submitSelfAssessment
// );

// // ✅ Changed PUT → PATCH, renamed to /manager-assessment
// router.patch(
//   "/reviews/:id/manager-assessment",
//   managerAssessmentRules,
//   validate,
//   requireRole(MANAGERS),
//   submitManagerAssessment
// );

// // ✅ Changed PUT → PATCH
// router.patch(
//   "/reviews/:id/finalize",
//   finalizeRules,
//   validate,
//   requireRole(HR),
//   finalizeReview
// );

// // ══════════════════════════════════════════════════════════════
// // GOALS
// // ══════════════════════════════════════════════════════════════

// router.get(
//   "/goals",
//   requireRole(HR),
//   getAllGoals
// );

// router.post(
//   "/goals",
//   createGoalRules,
//   validate,
//   requireRole(MANAGERS),
//   createGoal
// );

// // ✅ /goals/me MUST come before /goals/:id
// router.get(
//   "/goals/me",
//   getMyGoals
// );

// // ✅ Secured with explicit role guard
// router.put(
//   "/goals/:id",
//   updateGoalRules,
//   validate,
//   requireRole(ALL_ROLES),
//   updateGoal
// );

// // ══════════════════════════════════════════════════════════════
// // PERFORMANCE SCORES & DASHBOARD
// // These were missing from the old routes file — root cause of 404s
// // ══════════════════════════════════════════════════════════════

// // GET /api/performance/dashboard?period=2026-04&department=uuid
// router.get(
//   "/dashboard",
//   dashboardQueryRules,
//   validate,
//   requireRole(HR),
//   getPerformanceDashboard
// );

// // GET /api/performance/top-performers?period=2026-04&limit=10
// router.get(
//   "/top-performers",
//   dashboardQueryRules,
//   validate,
//   requireRole(HR),
//   getTopPerformers
// );

// // GET /api/performance/pip?status=active
// router.get(
//   "/pip",
//   requireRole(HR),
//   listPIPs
// );

// // POST /api/performance/pip/:employeeId
// router.post(
//   "/pip/:employeeId",
//   requireRole(HR),
//   createPIP
// );

// // GET /api/performance/scores/:employeeId
// router.get(
//   "/scores/:employeeId",
//   requireRole(MANAGERS),
//   getEmployeeScores
// );

// // GET /api/performance/trends/:employeeId
// router.get(
//   "/trends/:employeeId",
//   requireRole(MANAGERS),
//   getPerformanceTrends
// );

// // GET /api/performance/insights/:employeeId
// router.get(
//   "/insights/:employeeId",
//   requireRole(MANAGERS),
//   getPerformanceInsights
// );

// // POST /api/performance/calculate/:employeeId
// router.post(
//   "/calculate/:employeeId",
//   requireRole(HR),
//   calculateEmployeeScore
// );

// export default router;

import { Router } from "express";
// ✅ 1. Import requireManagerial
import {
  authenticate,
  requireRole,
  requireManagerial,
} from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";

// ── Controllers ───────────────────────────────────────────────
import {
  getCycles,
  createCycle,
  getAllReviews,
  getMyReviews,
  submitSelfAssessment,
  submitManagerAssessment,
  finalizeReview,
  getAllGoals,
  createGoal,
  updateGoal,
  getMyGoals,
} from "../controllers/performance.controller.js";

import {
  calculateEmployeeScore,
  getEmployeeScores,
  getPerformanceDashboard,
  getPerformanceTrends,
  getPerformanceInsights,
  getTopPerformers,
  createPIP,
  listPIPs,
} from "../controllers/performance.score.controller.js";

// ── Validators ────────────────────────────────────────────────
import {
  cycleRules,
  selfAssessmentRules,
  managerAssessmentRules,
  finalizeRules,
  createGoalRules,
  updateGoalRules,
  dashboardQueryRules,
} from "../validators/performance.validator.js";

const router = Router();

// ✅ 2. Removed the MANAGERS array. "Manager" is not a role anymore!
const HR = ["hr_admin", "super_admin"];
const ALL_ROLES = ["employee", "hr_admin", "super_admin"];

// All performance routes require authentication
router.use(authenticate);

// ══════════════════════════════════════════════════════════════
// CYCLES
// ══════════════════════════════════════════════════════════════

router.get("/cycles", requireRole(HR), getCycles);

router.post("/cycles", cycleRules, validate, requireRole(HR), createCycle);

// ══════════════════════════════════════════════════════════════
// REVIEWS
// ══════════════════════════════════════════════════════════════

router.get("/reviews", requireRole(HR), getAllReviews);

router.get("/reviews/me", getMyReviews);

router.patch(
  "/reviews/:id/self-assessment",
  selfAssessmentRules,
  validate,
  submitSelfAssessment,
);

// ✅ 3. Swapped to requireManagerial
router.patch(
  "/reviews/:id/manager-assessment",
  managerAssessmentRules,
  validate,
  requireManagerial,
  submitManagerAssessment,
);

router.patch(
  "/reviews/:id/finalize",
  finalizeRules,
  validate,
  requireRole(HR),
  finalizeReview,
);

// ══════════════════════════════════════════════════════════════
// GOALS
// ══════════════════════════════════════════════════════════════

router.get("/goals", requireRole(HR), getAllGoals);

// ✅ 3. Swapped to requireManagerial
router.post("/goals", createGoalRules, validate, requireManagerial, createGoal);

router.get("/goals/me", getMyGoals);

router.put(
  "/goals/:id",
  updateGoalRules,
  validate,
  requireRole(ALL_ROLES),
  updateGoal,
);

// ══════════════════════════════════════════════════════════════
// PERFORMANCE SCORES & DASHBOARD
// ══════════════════════════════════════════════════════════════

// ✅ 4. Swapped to requireManagerial (Fixes your 403 Error!)
router.get(
  "/dashboard",
  dashboardQueryRules,
  validate,
  requireManagerial,
  getPerformanceDashboard,
);

// ✅ 5. Swapped to requireManagerial (Managers should see their top performers)
router.get(
  "/top-performers",
  dashboardQueryRules,
  validate,
  requireManagerial,
  getTopPerformers,
);

// PIPs remain HR only
router.get("/pip", requireRole(HR), listPIPs);

router.post("/pip/:employeeId", requireRole(HR), createPIP);

// ✅ 6. Swapped to requireManagerial for individual employee metrics
router.get("/scores/:employeeId", requireManagerial, getEmployeeScores);

router.get("/trends/:employeeId", requireManagerial, getPerformanceTrends);

router.get("/insights/:employeeId", requireManagerial, getPerformanceInsights);

// Score calculation remains HR only
router.post("/calculate/:employeeId", requireRole(HR), calculateEmployeeScore);

export default router;
