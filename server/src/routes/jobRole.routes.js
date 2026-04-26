// src/routes/jobRole.routes.js
//
// Mount in app.js / server.js:
//   import jobRoleRouter from "./routes/jobRole.routes.js";
//   app.use("/api/job-roles", jobRoleRouter);

import { Router } from "express";
import { authenticate, requireRole } from "../middleware/authenticate.js";
import {
  listJobRoles,
  createJobRole,
  getJobRole,
  updateJobRole,
  deleteJobRole,
} from "../controllers/jobRole.controller.js";
import {
  createJobRoleRules,
  updateJobRoleRules,
  listJobRolesRules,
} from "../validators/jobRole.validators.js";

const router = Router();
const ADMIN_ROLES = ["hr_admin", "super_admin"];

// ── Any authenticated user ────────────────────────────────────
// Employees and managers can browse roles (e.g. for internal
// job boards or seeing their own grade). Inactive roles are
// hidden unless the caller is an admin (handled in controller).

router.get("/", authenticate, ...listJobRolesRules, listJobRoles);

router.get("/:id", authenticate, getJobRole);

// ── HR Admin / Super Admin only ───────────────────────────────

router.post(
  "/",
  authenticate,
  requireRole(ADMIN_ROLES),
  ...createJobRoleRules,
  createJobRole,
);

router.put(
  "/:id",
  authenticate,
  requireRole(ADMIN_ROLES),
  ...updateJobRoleRules,
  updateJobRole,
);

router.delete("/:id", authenticate, requireRole(ADMIN_ROLES), deleteJobRole);

export default router;
