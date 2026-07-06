// src/routes/reportss.routes.js
//
// Mount in app.js:
//   import reportRoutes from "./routes/report.routes.js";
//   app.use("/api/reports", reportRoutes);
//
// Adjust the middleware import paths below to match wherever your
// `authenticate` / `requireRole` middleware actually live in this repo.

import { Router } from "express";
import { body } from "express-validator";
import { authenticate, requireRole } from "../middleware/authenticate.js";

import {
  createReport,
  getMyReports,
  getReport,
  listReports,
  updateReportStatus,
  assignReport,
  addReportNote,
  getReportStats,
  revealReporterIdentity,
  REPORT_CATEGORIES,
  REPORT_SEVERITIES,
  REPORT_STATUSES,
} from "../controllers/report.controller.js";

const router = Router();

router.use(authenticate);

// ── Employee-facing ──────────────────────────────────────────
router.post(
  "/",
  [
    body("category").isIn(REPORT_CATEGORIES),
    body("severity").optional().isIn(REPORT_SEVERITIES),
    body("subject").trim().notEmpty().withMessage("Subject is required."),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),
    body("isAnonymous").optional().isBoolean(),
    body("incidentDate").optional({ nullable: true }).isISO8601(),
    body("attachments").optional().isArray(),
  ],
  createReport,
);

router.get("/me", getMyReports);

// ── HR-facing (order matters: specific paths before "/:id") ──
router.get(
  "/stats/summary",
  requireRole(["hr_admin", "super_admin"]),
  getReportStats,
);

router.get("/", requireRole(["hr_admin", "super_admin"]), listReports);

router.get("/:id", getReport); // owner OR HR — authorization handled inside controller

router.put(
  "/:id/status",
  requireRole(["hr_admin", "super_admin"]),
  [body("status").isIn(REPORT_STATUSES)],
  updateReportStatus,
);

router.put(
  "/:id/assign",
  requireRole(["hr_admin", "super_admin"]),
  assignReport,
);

router.post(
  "/:id/notes",
  requireRole(["hr_admin", "super_admin"]),
  [body("note").trim().notEmpty()],
  addReportNote,
);

router.post(
  "/:id/reveal",
  requireRole(["super_admin"]),
  [body("reason").trim().notEmpty()],
  revealReporterIdentity,
);

export default router;
