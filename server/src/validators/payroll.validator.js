// src/validators/payroll.validator.js
import { body, param, query } from "express-validator";

// ── Structure ──────────────────────────────────────────────────
export const createStructureRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Structure name is required.")
    .isLength({ max: 120 })
    .withMessage("Name must be under 120 characters."),
  body("basicPercent")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("basicPercent must be 0–100."),
  body("housingPercent")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("housingPercent must be 0–100."),
  body("transportPercent")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("transportPercent must be 0–100."),
  body("utilityPercent")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("utilityPercent must be 0–100."),
  body("mealPercent")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("mealPercent must be 0–100."),
];

// ── Deductions ────────────────────────────────────────────────
export const createDeductionRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Deduction name is required.")
    .isLength({ max: 120 })
    .withMessage("Name must be under 120 characters."),
  body("category")
    .optional()
    .isIn(["tax", "pension", "housing", "health", "loan", "custom"])
    .withMessage(
      "category must be tax | pension | housing | health | loan | custom.",
    ),
  body("type")
    .notEmpty()
    .withMessage("type is required.")
    .isIn(["fixed", "percentage", "formula"])
    .withMessage("type must be fixed | percentage | formula."),
  body("value")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("value must be a positive number."),
  body("calculationBase")
    .optional()
    .isIn(["basic", "gross", "taxable", "fixed"])
    .withMessage("calculationBase must be basic | gross | taxable | fixed."),
  body("isStatutory").optional().isBoolean(),
  body("isActive").optional().isBoolean(),
  body("appliesToAll").optional().isBoolean(),
];

// ── Payroll runs ──────────────────────────────────────────────
export const initRunRules = [
  body("month")
    .notEmpty()
    .isInt({ min: 1, max: 12 })
    .withMessage("month must be 1–12."),
  body("year")
    .notEmpty()
    .isInt({ min: 2000, max: 2100 })
    .withMessage("year must be a valid year."),
  body("notes").optional().isLength({ max: 500 }),
];

// ── Payslip param ─────────────────────────────────────────────
export const payslipParamRules = [
  param("month").isInt({ min: 1, max: 12 }).withMessage("month must be 1–12."),
  param("year")
    .isInt({ min: 2000, max: 2100 })
    .withMessage("year must be a valid year."),
];
