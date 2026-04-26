// src/validators/company.validators.js
//
// express-validator rule chains used in the company router.
// Import the array you need and spread it before your controller:
//
//   router.put("/", authenticate, requireRole(ADMIN_ROLES), ...updateProfileRules, updateCompanyProfileHandler);

import { body } from "express-validator";

// Roles that are allowed to mutate company data
export const ADMIN_ROLES = ["hr_admin", "super_admin"];

// ─── Allowed enum values ──────────────────────────────────────

const INDUSTRIES = [
  "technology",
  "finance",
  "healthcare",
  "education",
  "manufacturing",
  "retail",
  "logistics",
  "media",
  "legal",
  "real_estate",
  "hospitality",
  "agriculture",
  "energy",
  "ngо",
  "other",
];

const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

const PAY_FREQUENCIES = ["monthly", "bi-weekly", "weekly"];

const LEAVE_APPROVAL_FLOWS = ["manager", "hr", "both"];

const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

const CURRENCIES = ["NGN", "USD", "GBP", "EUR", "GHS", "KES", "ZAR"];

const WORKING_DAYS_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const BILLING_CYCLES = ["monthly", "annual"];

// ─── Shared field rules ───────────────────────────────────────

const phoneRule = (field) =>
  body(field)
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^\+?[0-9\s\-().]{7,20}$/)
    .withMessage(`${field} must be a valid phone number.`);

const urlRule = (field) =>
  body(field)
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL({ require_protocol: true, protocols: ["http", "https"] })
    .withMessage(`${field} must be a valid URL (include http:// or https://).`);

const timeRule = (field) =>
  body(field)
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage(`${field} must be in HH:MM format (e.g. 08:00).`);

// ══════════════════════════════════════════════════════════════
// PUT /api/company
// All fields are optional (partial update).
// ══════════════════════════════════════════════════════════════
export const updateProfileRules = [
  body("name")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage("Company name must be 2–150 characters."),

  body("rcNumber")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 4, max: 30 })
    .withMessage("RC number must be 4–30 characters."),

  body("industry")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .toLowerCase()
    .isIn(INDUSTRIES)
    .withMessage(`industry must be one of: ${INDUSTRIES.join(", ")}.`),

  body("size")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isIn(COMPANY_SIZES)
    .withMessage(`size must be one of: ${COMPANY_SIZES.join(", ")}.`),

  body("address")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 300 })
    .withMessage("Address must not exceed 300 characters."),

  body("city")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("City must not exceed 100 characters."),

  body("state")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("State must not exceed 100 characters."),

  body("country")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Country must not exceed 100 characters."),

  phoneRule("phone"),

  body("email")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Company email must be a valid email address."),

  urlRule("website"),

  body("description")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters."),
];

// ══════════════════════════════════════════════════════════════
// PUT /api/company/settings
// All fields are optional (partial upsert).
// ══════════════════════════════════════════════════════════════
export const updateSettingsRules = [
  body("workingDays")
    .optional({ nullable: true })
    .isArray({ min: 1, max: 7 })
    .withMessage("workingDays must be a non-empty array.")
    .custom((days) => {
      const invalid = days.filter((d) => !WORKING_DAYS_OPTIONS.includes(d));
      if (invalid.length) {
        throw new Error(
          `Invalid day(s): ${invalid.join(", ")}. Allowed: ${WORKING_DAYS_OPTIONS.join(", ")}.`,
        );
      }
      return true;
    }),

  timeRule("workingHoursStart"),
  timeRule("workingHoursEnd"),

  // Cross-field: end must be after start when both provided
  body("workingHoursEnd").custom((end, { req }) => {
    const start = req.body.workingHoursStart;
    if (start && end) {
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);
      if (eh * 60 + em <= sh * 60 + sm) {
        throw new Error("workingHoursEnd must be after workingHoursStart.");
      }
    }
    return true;
  }),

  body("fiscalYearStart")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isISO8601()
    .withMessage("fiscalYearStart must be a valid date (YYYY-MM-DD)."),

  body("payDay")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 31 })
    .withMessage("payDay must be an integer between 1 and 31."),

  body("payFrequency")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .toLowerCase()
    .isIn(PAY_FREQUENCIES)
    .withMessage(`payFrequency must be one of: ${PAY_FREQUENCIES.join(", ")}.`),

  body("currency")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .toUpperCase()
    .isIn(CURRENCIES)
    .withMessage(`currency must be one of: ${CURRENCIES.join(", ")}.`),

  body("timezone")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage("timezone must not be empty.")
    .isLength({ max: 60 })
    .withMessage("timezone must not exceed 60 characters."),

  body("dateFormat")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isIn(DATE_FORMATS)
    .withMessage(`dateFormat must be one of: ${DATE_FORMATS.join(", ")}.`),

  body("leaveApprovalFlow")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .toLowerCase()
    .isIn(LEAVE_APPROVAL_FLOWS)
    .withMessage(
      `leaveApprovalFlow must be one of: ${LEAVE_APPROVAL_FLOWS.join(", ")}.`,
    ),

  body("probationMonths")
    .optional({ nullable: true })
    .isInt({ min: 0, max: 12 })
    .withMessage("probationMonths must be an integer between 0 and 12."),

  body("enableBiometric")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("enableBiometric must be true or false."),

  body("enableGeofence")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("enableGeofence must be true or false."),

  body("geofenceRadiusM")
    .optional({ nullable: true })
    .isInt({ min: 50, max: 10000 })
    .withMessage(
      "geofenceRadiusM must be an integer between 50 and 10,000 metres.",
    ),
];
