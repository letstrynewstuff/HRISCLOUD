// src/routes/super_admin.routes.js
//
// Mount in app.js:
//   import superAdminRoutes from "./routes/super_admin.routes.js";
//   app.use("/api/super-admin", superAdminRoutes);
//
// Security model:
//   • POST /auth/login  — public (credentials from .env, not DB)
//   • All other routes  — authenticate + requireRole("super_admin")
//
// Super admin JWTs have companyId: null and role: "super_admin".
// requireRole("super_admin") blocks all company-level users.

import { Router } from "express";
import { body, param, query } from "express-validator";
import { authenticate, requireRole } from "../middleware/authenticate.js";
import {
  superAdminLogin,
  // Companies
  listAllCompanies,
  createCompany,
  approveCompany,
  suspendCompany,
  deleteCompany,
  // Users
  listAllUsers,
  disableUser,
  forceResetPassword,
  // Plans
  listPlans,
  createPlan,
  assignPlanToCompany,
  // Billing
  listSubscriptions,
  listPayments,
  verifyPaystackPayment,
  // Analytics
  getAnalytics,
  // Platform settings
  getPlatformSettings,
  updatePlatformSettings,
  // System
  getSystemHealth,
  getErrorLogs,
  // Audit
  getAuditLogs,
} from "../controllers/super_admin.controller.js";

const router = Router();

// ── Guard applied to every route below (except login) ──────────────────────
const SA = [authenticate, requireRole("super_admin")];

// ════════════════════════════════════════════════════════════════════════════
// AUTH  (public — no token required)
// ════════════════════════════════════════════════════════════════════════════
router.post(
  "/auth/login",
  [
    body("username").notEmpty().withMessage("username required."),
    body("password").notEmpty().withMessage("password required."),
  ],
  superAdminLogin,
);

// ════════════════════════════════════════════════════════════════════════════
// COMPANIES
// ════════════════════════════════════════════════════════════════════════════
router.get(
  "/companies",
  ...SA,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status")
      .optional()
      .isIn(["active", "suspended", "pending", "deleted"]),
  ],
  listAllCompanies,
);

router.post(
  "/companies",
  ...SA,
  [
    body("companyName").trim().notEmpty().withMessage("companyName required."),
    body("slug")
      .trim()
      .notEmpty()
      .matches(/^[a-z0-9-]+$/)
      .withMessage("slug may only contain lowercase, numbers, hyphens."),
    body("adminEmail").isEmail().withMessage("valid adminEmail required."),
    body("adminPassword")
      .isLength({ min: 8 })
      .withMessage("adminPassword min 8 chars."),
  ],
  createCompany,
);

router.patch(
  "/companies/:id/approve",
  ...SA,
  [param("id").isUUID().withMessage("id must be a UUID.")],
  approveCompany,
);

router.patch(
  "/companies/:id/suspend",
  ...SA,
  [param("id").isUUID().withMessage("id must be a UUID.")],
  suspendCompany,
);

router.delete(
  "/companies/:id",
  ...SA,
  [param("id").isUUID().withMessage("id must be a UUID.")],
  deleteCompany,
);

// ════════════════════════════════════════════════════════════════════════════
// GLOBAL USER CONTROL
// ════════════════════════════════════════════════════════════════════════════
router.get(
  "/users",
  ...SA,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("role").optional().isIn(["hr_admin", "super_admin", "employee"]),
    query("is_active").optional().isIn(["true", "false"]),
  ],
  listAllUsers,
);

router.patch(
  "/users/:id/disable",
  ...SA,
  [param("id").isUUID().withMessage("id must be a UUID.")],
  disableUser,
);

router.patch(
  "/users/:id/reset-password",
  ...SA,
  [param("id").isUUID().withMessage("id must be a UUID.")],
  forceResetPassword,
);

// ════════════════════════════════════════════════════════════════════════════
// BILLING — PLANS
// ════════════════════════════════════════════════════════════════════════════
router.get("/plans", ...SA, listPlans);

router.post(
  "/plans",
  ...SA,
  [
    body("name").trim().notEmpty().withMessage("name required."),
    body("priceMonthly")
      .isNumeric()
      .withMessage("priceMonthly required (number)."),
  ],
  createPlan,
);

router.patch(
  "/companies/:id/plan",
  ...SA,
  [
    param("id").isUUID().withMessage("company id must be a UUID."),
    body("planId").isUUID().withMessage("planId must be a UUID."),
  ],
  assignPlanToCompany,
);

// ════════════════════════════════════════════════════════════════════════════
// BILLING — SUBSCRIPTIONS + PAYMENTS
// ════════════════════════════════════════════════════════════════════════════
router.get(
  "/subscriptions",
  ...SA,
  [
    query("page").optional().isInt({ min: 1 }),
    query("status").optional().isIn(["active", "expired", "cancelled"]),
  ],
  listSubscriptions,
);

router.get(
  "/payments",
  ...SA,
  [
    query("page").optional().isInt({ min: 1 }),
    query("status").optional().isIn(["success", "failed", "pending"]),
  ],
  listPayments,
);

router.post(
  "/payments/verify-paystack",
  ...SA,
  [
    body("reference").notEmpty().withMessage("Paystack reference required."),
    body("companyId").isUUID().withMessage("companyId required."),
  ],
  verifyPaystackPayment,
);

// ════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ════════════════════════════════════════════════════════════════════════════
router.get("/analytics", ...SA, getAnalytics);

// ════════════════════════════════════════════════════════════════════════════
// PLATFORM SETTINGS
// ════════════════════════════════════════════════════════════════════════════
router.get("/settings", ...SA, getPlatformSettings);
router.patch("/settings", ...SA, updatePlatformSettings);

// ════════════════════════════════════════════════════════════════════════════
// SYSTEM MONITORING
// ════════════════════════════════════════════════════════════════════════════
router.get("/system/health", ...SA, getSystemHealth);
router.get("/logs", ...SA, getErrorLogs);

// ════════════════════════════════════════════════════════════════════════════
// AUDIT LOGS
// ════════════════════════════════════════════════════════════════════════════
router.get(
  "/audit-logs",
  ...SA,
  [
    query("page").optional().isInt({ min: 1 }),
    query("from").optional().isISO8601(),
    query("to").optional().isISO8601(),
  ],
  getAuditLogs,
);

export default router;
