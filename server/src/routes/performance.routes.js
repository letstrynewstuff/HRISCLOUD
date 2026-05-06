import { Router } from "express";

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
  updatePIPStatus,
  updatePIPProgress,
  updatePIP,
  deletePIP,
  getPIP,
  createPIP,
  listPIPs,
} from "../controllers/performance.controller.js";

import {
  calculateEmployeeScore,
  getEmployeeScores,
  getPerformanceDashboard,
  getPerformanceTrends,
  getPerformanceInsights,
  getTopPerformers,
  calculateAllScores,
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

router.post("/calculate-all", requireRole(HR), calculateAllScores);

// ══════════════════════════════════════════════════════════════
// PIPs  (all HR only)
// ══════════════════════════════════════════════════════════════

// router.get("/pip", requireRole(HR), listPIPs);
router.post("/pip/:employeeId", requireRole(HR), createPIP);
router.get("/pip/:pipId", requireRole(HR), getPIP);
router.put("/pip/:pipId", requireRole(HR), updatePIP);
router.patch("/pip/:pipId/status", requireRole(HR), updatePIPStatus);
router.patch("/pip/:pipId/progress", requireRole(HR), updatePIPProgress);
router.delete("/pip/:pipId", requireRole(HR), deletePIP);

export default router;
