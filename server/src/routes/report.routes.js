

// src/routes/performance.routes.js
//
// Mount in server.js:
//   import performanceRoutes from "./routes/performance.routes.js";
//   app.use("/api/performance", performanceRoutes);
//
// And goals separately:
//   import goalsRoutes from "./routes/goals.routes.js";
//   app.use("/api/goals", goalsRoutes);

import { Router } from "express";
import { authenticate, requireRole } from "../middleware/authenticate.js";

// ─── Existing controller (cycles, reviews, existing goals) ────
import {
  getCycles,
  createCycle,
  getAllReviews,
  getMyReviews,
  submitSelfAssessment,
  submitManagerAssessment,
  finalizeReview,
} from "../controllers/performance.controller.js";

// ─── New scoring/dashboard/PIP controller ─────────────────────
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

const router = Router();
const HR   = ["hr_admin", "super_admin"];
const MGR  = ["hr_admin", "super_admin", "manager"];

// ── Cycles ────────────────────────────────────────────────────
router.get ("/cycles",     authenticate, requireRole(HR),  getCycles);
router.post("/cycles",     authenticate, requireRole(HR),  createCycle);

// ── Reviews ───────────────────────────────────────────────────
router.get ("/reviews",             authenticate, requireRole(MGR), getAllReviews);
router.get ("/reviews/me",          authenticate,                   getMyReviews);
router.put ("/reviews/:id/self",    authenticate,                   submitSelfAssessment);
router.put ("/reviews/:id/manager", authenticate, requireRole(MGR), submitManagerAssessment);
router.put ("/reviews/:id/finalize",authenticate, requireRole(HR),  finalizeReview);

// ── Score calculation ─────────────────────────────────────────
router.post("/calculate/:employeeId", authenticate, requireRole(HR), calculateEmployeeScore);

// ── Score history ─────────────────────────────────────────────
router.get ("/scores/:employeeId",    authenticate, requireRole(MGR), getEmployeeScores);

// ── Dashboard ─────────────────────────────────────────────────
router.get ("/dashboard",             authenticate, requireRole(MGR), getPerformanceDashboard);

// ── Trends & Insights ─────────────────────────────────────────
router.get ("/trends/:employeeId",    authenticate, requireRole(MGR), getPerformanceTrends);
router.get ("/insights/:employeeId",  authenticate, requireRole(MGR), getPerformanceInsights);

// ── Top performers ────────────────────────────────────────────
router.get ("/top-performers",        authenticate, requireRole(MGR), getTopPerformers);

// ── PIP ───────────────────────────────────────────────────────
router.get ("/pip",                   authenticate, requireRole(HR),  listPIPs);
router.post("/pip/:employeeId",       authenticate, requireRole(HR),  createPIP);

export default router;
 