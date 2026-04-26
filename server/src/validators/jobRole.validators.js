// src/validators/jobRole.validators.js
//
// express-validator rule chains for job role endpoints.

import { body, query } from "express-validator";

// ── createJobRole rules ───────────────────────────────────────
export const createJobRoleRules = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("title is required.")
    .isLength({ max: 150 })
    .withMessage("title must not exceed 150 characters."),

  body("departmentId")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("departmentId must be a valid UUID."),

  body("grade")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("grade must not exceed 100 characters."),

  body("minSalary")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("minSalary must be a non-negative number."),

  body("maxSalary")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("maxSalary must be a non-negative number."),

  body("description")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("description must not exceed 2000 characters."),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be true or false."),
];

// ── updateJobRole rules (all fields optional) ─────────────────
export const updateJobRoleRules = [
  body("title")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage("title must be 1–150 characters."),

  body("departmentId")
    .optional({ nullable: true })
    .custom((v) => v === null || /^[0-9a-f-]{36}$/i.test(v))
    .withMessage("departmentId must be a valid UUID or null."),

  body("grade")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("grade must not exceed 100 characters."),

  body("minSalary")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("minSalary must be a non-negative number."),

  body("maxSalary")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("maxSalary must be a non-negative number."),

  body("description")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("description must not exceed 2000 characters."),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be true or false."),
];

// ── listJobRoles query rules ──────────────────────────────────
export const listJobRolesRules = [
  query("departmentId")
    .optional()
    .isUUID()
    .withMessage("departmentId query param must be a valid UUID."),

  query("includeInactive")
    .optional()
    .isIn(["true", "false"])
    .withMessage('includeInactive must be "true" or "false".'),
];
