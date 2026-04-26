// src/routes/training.routes.js
import { Router } from "express";
import { authenticate, requireRole } from "../middleware/authenticate.js";
import {
  listTrainings,
  getTraining,
  createTraining,
  updateTraining,
  deleteTraining,
  assignTraining,
  getEnrollments,
  markAttendance,
  issueCertificate,
  getDashboard,
  getMyTrainings,
  getCertifications,
} from "../controllers/training.controller.js";
import { body, query } from "express-validator";

const router = Router();
const ADMIN_ROLES = ["hr_admin", "super_admin"];

// ── Validators ────────────────────────────────────────
const createRules = [
  body("title").trim().notEmpty().withMessage("Title is required."),
  body("type")
    .isIn(["Internal", "External"])
    .withMessage("type must be Internal or External."),
  body("provider").trim().notEmpty().withMessage("Provider is required."),
  body("startDate").isISO8601().withMessage("startDate must be a valid date."),
  body("cost").optional().isNumeric().withMessage("cost must be a number."),
  body("maxAttendees")
    .optional()
    .isInt({ min: 1 })
    .withMessage("maxAttendees must be a positive integer."),
  body("assignedTo")
    .optional()
    .isArray()
    .withMessage("assignedTo must be an array of employee UUIDs."),
];

const updateRules = [
  body("type").optional().isIn(["Internal", "External"]),
  body("status")
    .optional()
    .isIn(["upcoming", "ongoing", "completed", "cancelled"]),
  body("cost").optional().isNumeric(),
  body("maxAttendees").optional().isInt({ min: 1 }),
];

const assignRules = [
  body("employeeIds")
    .isArray({ min: 1 })
    .withMessage("employeeIds must be a non-empty array."),
];

// ── Routes ordered from specific → parametric ────────

// Dashboard — must come before /:id
router.get("/dashboard", authenticate, getDashboard);

// My trainings — employee self-service
router.get("/my", authenticate, getMyTrainings);

// Certifications overview
router.get(
  "/certifications",
  authenticate,
  requireRole(ADMIN_ROLES),
  getCertifications,
);

// CRUD
router.get("/", authenticate, listTrainings);
router.get("/:id", authenticate, getTraining);

router.post(
  "/",
  authenticate,
  requireRole(ADMIN_ROLES),
  ...createRules,
  createTraining,
);

router.put(
  "/:id",
  authenticate,
  requireRole(ADMIN_ROLES),
  ...updateRules,
  updateTraining,
);

router.delete("/:id", authenticate, requireRole(ADMIN_ROLES), deleteTraining);

// ── Assignment & attendance ───────────────────────────
router.post(
  "/:id/assign",
  authenticate,
  requireRole(ADMIN_ROLES),
  ...assignRules,
  assignTraining,
);

router.get(
  "/:id/enrollments",
  authenticate,
  requireRole(ADMIN_ROLES),
  getEnrollments,
);

router.put(
  "/:id/enrollments/:employeeId/attendance",
  authenticate,
  requireRole(ADMIN_ROLES),
  markAttendance,
);

router.post(
  "/:id/enrollments/:employeeId/certificate",
  authenticate,
  requireRole(ADMIN_ROLES),
  issueCertificate,
);

export default router;
