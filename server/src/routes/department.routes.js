// src/routes/department.routes.js
//
// Mount in server.js:
//   import departmentRoutes from "./routes/department.routes.js";
//   app.use("/api/departments", departmentRoutes);
//
// All routes require a valid Bearer token (authenticate middleware).
// Role-gated writes require hr_admin or admin.

import { Router } from "express";
import { body, param } from "express-validator";
import { authenticate, requireRole } from "../middleware/authenticate.js";
import {
  listDepartments,
  createDepartment,
  getDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.controller.js";

const router = Router();

// ── All department routes require a logged-in user ─────────────
router.use(authenticate);

// ─── Validation rules ─────────────────────────────────────────

const uuidParam = param("id")
  .isUUID()
  .withMessage("Department ID must be a valid UUID.");

const createRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Department name is required.")
    .isLength({ max: 100 })
    .withMessage("Name must be under 100 characters."),

  body("description")
    .optional({ nullable: true })
    .isLength({ max: 500 })
    .withMessage("Description must be under 500 characters."),

  body("parent_department_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("parent_department_id must be a valid UUID."),

  body("head_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("head_id must be a valid UUID."),
];

const updateRules = [
  uuidParam,

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be blank.")
    .isLength({ max: 100 })
    .withMessage("Name must be under 100 characters."),

  body("description")
    .optional({ nullable: true })
    .isLength({ max: 500 })
    .withMessage("Description must be under 500 characters."),

  body("parent_department_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("parent_department_id must be a valid UUID."),

  body("head_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("head_id must be a valid UUID."),

  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active must be true or false."),
];

// ─── Validation error handler ──────────────────────────────────
import { validationResult } from "express-validator";

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed.",
      errors: errors.array(),
    });
  }
  next();
}

// ─── Routes ───────────────────────────────────────────────────

// GET /api/departments
// Any authenticated user can list departments (employees need to see this)
router.get("/", listDepartments);

// POST /api/departments
// Only HR admins can create departments
router.post(
  "/",
  requireRole(["hr_admin", "admin"]),
  createRules,
  validate,
  createDepartment,
);

// GET /api/departments/:id
// Any authenticated user can view a single department
router.get("/:id", uuidParam, validate, getDepartment);

// PUT /api/departments/:id
// Only HR admins can update departments
router.put(
  "/:id",
  requireRole(["hr_admin", "admin"]),
  updateRules,
  validate,
  updateDepartment,
);

// DELETE /api/departments/:id  (soft delete)
// Only HR admins can deactivate departments
router.delete(
  "/:id",
  requireRole(["hr_admin", "admin"]),
  uuidParam,
  validate,
  deleteDepartment,
);

export default router;
