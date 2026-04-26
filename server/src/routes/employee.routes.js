

// src/routes/employee.routes.js
//
// FIX: Replaced requireRole(["hr_admin","super_admin","manager"]) on GET /
//      with requireManagerial — because "manager" is NEVER a JWT role.
//      requireManagerial allows HR admins AND employees who are actual managers.

import { Router } from "express";
import { body, query, param } from "express-validator";
import multer from "multer";
import { authenticate, requireRole, requireManagerial } from "../middleware/authenticate.js";

import {
  listEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  bulkImportEmployees,
  getEmployeeHistory,
  getOrgChart,
  inviteEmployee,
  getMyProfile,
  requestProfileChange,
} from "../controllers/employee.controller.js";

import {
  startOffboarding,
  toggleOffboardingTask,
  completeOffboarding,
  getOffboardingTasks,
  listOffboarding,
} from "../controllers/offboarding.controller.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are accepted."));
    }
  },
});

const createEmployeeValidators = [
  body("firstName").trim().notEmpty(),
  body("lastName").trim().notEmpty(),
  body("employmentType").isIn(["full_time", "part_time", "contract", "intern"]),
];

const updateEmployeeValidators = [
  body("employmentStatus")
    .optional()
    .isIn(["active", "on_leave", "suspended", "terminated", "resigned"]),
];

/* ── SELF ── */
router.get("/me", authenticate, getMyProfile);
router.put("/me", authenticate, requestProfileChange);

/* ── ORG ── */
router.get("/org-chart", authenticate, getOrgChart);

/* ── INVITE ── */
router.post("/invite", authenticate, requireRole(["hr_admin", "super_admin"]), inviteEmployee);

/* ── BULK IMPORT ── */
router.post(
  "/bulk-import",
  authenticate,
  requireRole(["hr_admin", "super_admin"]),
  upload.single("file"),
  bulkImportEmployees,
);

/* ── EMPLOYEE LIST ──────────────────────────────────────────────────────────
   FIX: requireManagerial replaces requireRole([..., "manager"]).
   "manager" is NOT a JWT role. requireManagerial does a live DB check.
   listEmployees controller reads req.user.isHR to decide scope:
     isHR=true  → all employees in company
     isHR=false → only this manager's direct reports
 ─────────────────────────────────────────────────────────────────────────── */
router.get(
  "/",
  authenticate,
  // requireManagerial,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  listEmployees,
);

router.post(
  "/",
  authenticate,
  requireRole(["hr_admin", "super_admin"]),
  createEmployeeValidators,
  createEmployee,
);

/* ── OFFBOARDING (must come before /:id) ── */
router.get("/offboarding", authenticate, requireRole(["hr_admin", "super_admin"]), listOffboarding);

router.get(
  "/:id/offboard/tasks",
  authenticate,
  requireRole(["hr_admin", "super_admin"]),
  [param("id").isUUID()],
  getOffboardingTasks,
);

router.post(
  "/:id/offboard",
  authenticate,
  requireRole(["hr_admin", "super_admin"]),
  [param("id").isUUID()],
  startOffboarding,
);

router.patch(
  "/:id/offboard/tasks/:taskId",
  authenticate,
  requireRole(["hr_admin", "super_admin"]),
  [param("id").isUUID(), param("taskId").isUUID()],
  toggleOffboardingTask,
);

router.post(
  "/:id/offboard/complete",
  authenticate,
  requireRole(["hr_admin", "super_admin"]),
  [
    param("id").isUUID(),
    body("exitType").isIn(["terminated", "resigned", "retired"]),
    body("reason").optional().trim(),
    body("terminationDate").optional().isDate(),
  ],
  completeOffboarding,
);

/* ── SINGLE EMPLOYEE (last) ── */
router.get("/:id", authenticate, getEmployee);

router.put(
  "/:id",
  authenticate,
  requireRole(["hr_admin", "super_admin"]),
  [param("id").isUUID(), ...updateEmployeeValidators],
  updateEmployee,
);

router.delete(
  "/:id",
  authenticate,
  requireRole(["hr_admin", "super_admin"]),
  [param("id").isUUID()],
  deleteEmployee,
);

router.get(
  "/:id/history",
  authenticate,
  requireManagerial,
  [param("id").isUUID()],
  getEmployeeHistory,
);

export default router;