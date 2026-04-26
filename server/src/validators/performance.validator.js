// src/validators/performance.validator.js
//
// All express-validator rule chains for the performance module.
// Import whichever set you need in performance.routes.js.

import { body, query } from "express-validator";

// ── Cycle ─────────────────────────────────────────────────────
export const cycleRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("name is required.")
    .isLength({ max: 150 })
    .withMessage("name must not exceed 150 characters."),

  body("periodStart")
    .notEmpty()
    .withMessage("periodStart is required.")
    .isISO8601()
    .withMessage("periodStart must be a valid date (YYYY-MM-DD)."),

  body("periodEnd")
    .notEmpty()
    .withMessage("periodEnd is required.")
    .isISO8601()
    .withMessage("periodEnd must be a valid date (YYYY-MM-DD).")
    .custom((end, { req }) => {
      if (req.body.periodStart && end <= req.body.periodStart) {
        throw new Error("periodEnd must be after periodStart.");
      }
      return true;
    }),

  body("status")
    .optional()
    .isIn(["active", "closed", "draft"])
    .withMessage("status must be active, closed, or draft."),
];

// ── Self-assessment ───────────────────────────────────────────
export const selfAssessmentRules = [
  body("sections")
    .notEmpty()
    .withMessage("sections is required.")
    .isArray({ min: 1 })
    .withMessage("sections must be a non-empty array."),

  body("sections.*.title")
    .notEmpty()
    .withMessage("Each section must have a title."),

  body("sections.*.rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Section rating must be 1–5."),

  body("overallComment")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .isLength({ max: 2000 })
    .withMessage("overallComment must not exceed 2000 characters."),
];

// ── Manager assessment ────────────────────────────────────────
export const managerAssessmentRules = [
  body("sections")
    .notEmpty()
    .withMessage("sections is required.")
    .isArray({ min: 1 })
    .withMessage("sections must be a non-empty array."),

  body("sections.*.title")
    .notEmpty()
    .withMessage("Each section must have a title."),

  body("sections.*.rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Section rating must be 1–5."),

  body("finalRating")
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 5 })
    .withMessage("finalRating must be a number between 0 and 5."),

  body("overallComment")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .isLength({ max: 2000 })
    .withMessage("overallComment must not exceed 2000 characters."),
];

// ── Finalize review ───────────────────────────────────────────
export const finalizeRules = [
  body("finalRating")
    .notEmpty()
    .withMessage("finalRating is required.")
    .isFloat({ min: 0, max: 5 })
    .withMessage("finalRating must be between 0 and 5."),
];

// ── Create goal ───────────────────────────────────────────────
export const createGoalRules = [
  body("employeeId")
    .notEmpty()
    .withMessage("employeeId is required.")
    .isUUID()
    .withMessage("employeeId must be a valid UUID."),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("title is required.")
    .isLength({ max: 200 })
    .withMessage("title must not exceed 200 characters."),

  body("dueDate")
    .notEmpty()
    .withMessage("dueDate is required.")
    .isISO8601()
    .withMessage("dueDate must be a valid date (YYYY-MM-DD)."),

  body("cycle").trim().notEmpty().withMessage("cycle is required."),

  body("description")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .isLength({ max: 1000 })
    .withMessage("description must not exceed 1000 characters."),

  body("metric")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .isLength({ max: 200 }),

  body("target")
    .optional({ nullable: true })
    .isNumeric()
    .withMessage("target must be a number."),

  body("progress")
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage("progress must be between 0 and 100."),

  body("status")
    .optional()
    .isIn(["not_started", "in_progress", "completed", "cancelled"])
    .withMessage("Invalid status value."),
];

// ── Update goal ───────────────────────────────────────────────
export const updateGoalRules = [
  body("title")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage("title must not exceed 200 characters."),

  body("dueDate")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("dueDate must be a valid date."),

  body("progress")
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage("progress must be between 0 and 100."),

  body("status")
    .optional()
    .isIn(["not_started", "in_progress", "completed", "cancelled"])
    .withMessage("Invalid status value."),

  body("description")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .isLength({ max: 1000 }),

  body("metric")
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .isLength({ max: 200 }),

  body("target")
    .optional({ nullable: true })
    .isNumeric()
    .withMessage("target must be a number."),
];

// ── Dashboard / list query params ─────────────────────────────
export const dashboardQueryRules = [
  query("period")
    .optional()
    .matches(/^\d{4}-\d{2}$/)
    .withMessage("period must be in YYYY-MM format."),

  query("department")
    .optional()
    .isUUID()
    .withMessage("department must be a valid UUID."),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("limit must be between 1 and 50."),
];
