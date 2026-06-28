// src/routes/timesheet.routes.js
//
// Mounts both employee and admin timesheet routes.
// Import this in your main app.js / server.js:
//
//   import timesheetRoutes from "./routes/timesheet.routes.js";
//   app.use("/api/timesheets", timesheetRoutes);

import { Router } from "express";
import { authenticate, requireRole } from "../middleware/authenticate.js";

// ── Employee controllers ──────────────────────────────────────
import {
  createEntry,
  updateEntry,
  deleteEntry,
  submitEntries,
  getMyEntries,
  getMySummary,
  getEntry,
} from "../controllers/timesheet.employee.controller.js";

// ── Admin controllers ─────────────────────────────────────────
import {
  getAllEntries,
  getPendingApprovals,
  getAdminEntry,
  approveEntry,
  approveBulk,
  rejectEntry,
  getCompanySummary,
  getEmployeeHistory,
  exportCSV,
} from "../controllers/timesheet.admin.controller.js";

const router = Router();

// All timesheet routes require a valid JWT
router.use(authenticate);

// ════════════════════════════════════════════════════════════════
// EMPLOYEE ROUTES  —  /api/timesheets/entries/...
// ════════════════════════════════════════════════════════════════

// NOTE: Static paths (/my, /my/summary, /submit) must come BEFORE
// the dynamic /:id route so Express matches them correctly.

router.get("/entries/my/summary", getMySummary);
router.get("/entries/my", getMyEntries);
router.post("/entries/submit", submitEntries);

router.post("/entries", createEntry);
router.put("/entries/:id", updateEntry);
router.delete("/entries/:id", deleteEntry);
router.get("/entries/:id", getEntry);

// ════════════════════════════════════════════════════════════════
// ADMIN ROUTES  —  /api/timesheets/admin/...
// Requires hr_admin or super_admin role.
// ════════════════════════════════════════════════════════════════

const adminOnly = requireRole(["hr_admin", "super_admin"]);

// NOTE: /approve-bulk must come before /:id/approve
router.post("/admin/entries/approve-bulk", adminOnly, approveBulk);

router.get("/admin/entries", adminOnly, getAllEntries);
router.get("/admin/pending", adminOnly, getPendingApprovals);
router.get("/admin/summary", adminOnly, getCompanySummary);
router.get("/admin/export", adminOnly, exportCSV);

router.get("/admin/entries/:id", adminOnly, getAdminEntry);
router.post("/admin/entries/:id/approve", adminOnly, approveEntry);
router.post("/admin/entries/:id/reject", adminOnly, rejectEntry);

router.get(
  "/admin/employees/:employeeId/entries",
  adminOnly,
  getEmployeeHistory,
);

export default router;
