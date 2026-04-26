// src/validators/attendance.validators.js

import { body, query } from "express-validator";

const VALID_STATUSES = [
  "present",
  "absent",
  "late",
  "half_day",
  "on_leave",
  "holiday",
];
const VALID_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const VALID_SORT_COLS = [
  "attendance_date",
  "clock_in",
  "clock_out",
  "hours_worked",
  "status",
  "created_at",
];

const timeRule = (field, opts = {}) => {
  const r = body(field);
  const base =
    opts.optional !== false
      ? r.optional({ nullable: true, checkFalsy: true })
      : r.notEmpty().withMessage(`${field} is required.`);
  return base
    .trim()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage(`${field} must be in HH:MM format (e.g. 08:30).`);
};

// ── Clock-in rules ────────────────────────────────────────────
export const clockInRules = [
  body("lat")
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("lat must be a decimal between -90 and 90."),

  body("lng")
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("lng must be a decimal between -180 and 180."),
];

// ── Correction rules ──────────────────────────────────────────
export const correctRules = [
  body("editReason")
    .trim()
    .notEmpty()
    .withMessage("editReason is required for manual corrections.")
    .isLength({ max: 500 })
    .withMessage("editReason must not exceed 500 characters."),

  body("clockIn")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("clockIn must be a valid ISO 8601 datetime."),

  body("clockOut")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("clockOut must be a valid ISO 8601 datetime."),

  body("status")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isIn(VALID_STATUSES)
    .withMessage(`status must be one of: ${VALID_STATUSES.join(", ")}.`),

  body("hoursWorked")
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 24 })
    .withMessage("hoursWorked must be between 0 and 24."),

  body("overtimeHours")
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 24 })
    .withMessage("overtimeHours must be between 0 and 24."),
];

// ── Create shift rules ────────────────────────────────────────
export const createShiftRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Shift name is required.")
    .isLength({ max: 100 })
    .withMessage("name must not exceed 100 characters."),

  body("description")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("description must not exceed 500 characters."),

  timeRule("startTime", { optional: false }),
  timeRule("endTime", { optional: false }),

  body("days")
    .isArray({ min: 1, max: 7 })
    .withMessage("days must be a non-empty array.")
    .custom((days) => {
      const invalid = days.filter((d) => !VALID_DAYS.includes(d));
      if (invalid.length)
        throw new Error(`Invalid day(s): ${invalid.join(", ")}.`);
      return true;
    }),
];

// ── Update shift rules ────────────────────────────────────────
export const updateShiftRules = [
  body("name")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("name must not exceed 100 characters."),

  body("description")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 }),

  timeRule("startTime"),
  timeRule("endTime"),

  body("days")
    .optional({ nullable: true })
    .isArray({ min: 1, max: 7 })
    .withMessage("days must be a non-empty array.")
    .custom((days) => {
      if (!days) return true;
      const invalid = days.filter((d) => !VALID_DAYS.includes(d));
      if (invalid.length)
        throw new Error(`Invalid day(s): ${invalid.join(", ")}.`);
      return true;
    }),

  body("isActive")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("isActive must be true or false."),
];

// ── List query rules ──────────────────────────────────────────
export const listQueryRules = [
  query("date").optional().isISO8601().withMessage("date must be YYYY-MM-DD."),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("startDate must be YYYY-MM-DD."),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("endDate must be YYYY-MM-DD."),
  query("status")
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`status must be one of: ${VALID_STATUSES.join(", ")}.`),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer."),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100."),
  query("sortBy")
    .optional()
    .isIn(VALID_SORT_COLS)
    .withMessage(`sortBy must be one of: ${VALID_SORT_COLS.join(", ")}.`),
  query("sortDir")
    .optional()
    .isIn(["ASC", "DESC", "asc", "desc"])
    .withMessage("sortDir must be ASC or DESC."),
];
