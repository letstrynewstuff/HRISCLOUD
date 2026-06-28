
// // src/routes/appraisal.routes.js
// //
// // Mount in app.js:
// //   import appraisalRoutes from "./routes/appraisal.routes.js";
// //   app.use("/api/appraisals", appraisalRoutes);

// import { Router } from "express";
// import { authenticate, requireRole } from "../middleware/authenticate.js";
// import {
//   // Templates
//   listTemplates,
//   createTemplate,
//   // Manager flow
//   createAppraisal,
//   updateAppraisal,
//   submitAppraisal,
//   // HR flow
//   hrReviewAppraisal,
//   finalizeAppraisal,
//   rejectAppraisal,
//   // Read
//   listAppraisals,
//   getAppraisal,
//   getMyAppraisals,
//   getPendingHRAppraisals,
// } from "../controllers/appraisal.controller.js";

// const router = Router();

// // All routes require a valid JWT
// router.use(authenticate);

// // ── Templates ─────────────────────────────────────────────────
// router.get(
//   "/templates",
//   requireRole(["admin", "hr_manager", "manager"]),
//   listTemplates,
// );
// router.post(
//   "/templates",
//   requireRole(["admin", "hr_manager"]),
//   createTemplate,
// );

// // ── Employee: view own appraisals ─────────────────────────────
// // NOTE: /me and /pending-hr must come BEFORE /:id to avoid
// // Express matching "me" or "pending-hr" as a UUID param.
// router.get("/me", getMyAppraisals);

// // ── HR queue ──────────────────────────────────────────────────
// router.get(
//   "/pending-hr",
//   requireRole(["admin", "hr_manager"]),
//   getPendingHRAppraisals,
// );

// // ── List all ──────────────────────────────────────────────────
// router.get(
//   "/",
//   requireRole(["admin", "hr_manager", "manager"]),
//   listAppraisals,
// );

// // ── Single appraisal (by id) ──────────────────────────────────
// router.get("/:id", getAppraisal);

// // ── Manager: create + edit + submit ──────────────────────────
// router.post(
//   "/:employeeId",
//   requireRole(["admin", "hr_manager", "manager"]),
//   createAppraisal,
// );
// router.patch(
//   "/:id/submit",
//   requireRole(["admin", "hr_manager", "manager"]),
//   submitAppraisal,
// );
// router.patch(
//   "/:id",
//   requireRole(["admin", "hr_manager", "manager"]),
//   updateAppraisal,
// );

// // ── HR: review + finalize + reject ────────────────────────────
// router.patch(
//   "/:id/hr-review",
//   requireRole(["admin", "hr_manager"]),
//   hrReviewAppraisal,
// );
// router.patch(
//   "/:id/finalize",
//   requireRole(["admin", "hr_manager"]),
//   finalizeAppraisal,
// );
// router.patch(
//   "/:id/reject",
//   requireRole(["admin", "hr_manager"]),
//   rejectAppraisal,
// );

// export default router;


// src/routes/appraisal.routes.js
//
// Mount in app.js:
//   import appraisalRoutes from "./routes/appraisal.routes.js";
//   app.use("/api/appraisals", appraisalRoutes);

import { Router } from "express";
import { authenticate, requireRole, requireManagerial } from "../middleware/authenticate.js";
import {
  listTemplates,
  createTemplate,
  createAppraisal,
  updateAppraisal,
  submitAppraisal,
  hrReviewAppraisal,
  finalizeAppraisal,
  rejectAppraisal,
  listAppraisals,
  getAppraisal,
  getMyAppraisals,
  getPendingHRAppraisals,
} from "../controllers/appraisal.controller.js";

const router = Router();

// All routes require a valid JWT
router.use(authenticate);

// ── Templates ─────────────────────────────────────────────────
router.get("/templates",  requireManagerial, listTemplates);
router.post("/templates", requireRole(["hr_admin", "super_admin"]), createTemplate);

// ── Employee: own appraisals ──────────────────────────────────
// /me and /pending-hr MUST come before /:id
router.get("/me",         getMyAppraisals);

// ── HR queue ──────────────────────────────────────────────────
router.get("/pending-hr", requireRole(["hr_admin", "super_admin"]), getPendingHRAppraisals);

// ── List all ──────────────────────────────────────────────────
router.get("/",           requireManagerial, listAppraisals);

// ── Single appraisal ─────────────────────────────────────────
router.get("/:id",        getAppraisal);

// ── Manager: create + edit + submit ──────────────────────────
// /:id/submit MUST come before /:id
router.post("/:employeeId",  requireManagerial, createAppraisal);
router.patch("/:id/submit",  requireManagerial, submitAppraisal);
router.patch("/:id",         requireManagerial, updateAppraisal);

// ── HR: review + finalize + reject ────────────────────────────
router.patch("/:id/hr-review", requireRole(["hr_admin", "super_admin"]), hrReviewAppraisal);
router.patch("/:id/finalize",  requireRole(["hr_admin", "super_admin"]), finalizeAppraisal);
router.patch("/:id/reject",    requireRole(["hr_admin", "super_admin"]), rejectAppraisal);

export default router;