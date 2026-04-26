// ─────────────────────────────────────────────────────────────
// src/routes/loan.routes.js
//
// Mount in app.js:
//   import loanRoutes from "./routes/loan.routes.js";
//   app.use("/api/loans", loanRoutes);
// ─────────────────────────────────────────────────────────────

import { Router } from "express";
import { body, param, query } from "express-validator";
import { authenticate, requireRole } from "../middleware/authenticate.js";
import {
  listLoans,
  submitLoanRequest,
  getMyLoans,
  getLoanSchedule,
  approveLoan,
  rejectLoan,
} from "../controllers/loan.controller.js";

const router = Router();

// ── Static named routes — must come before /:id ──────────────

// GET /api/loans/me
router.get(
  "/me",
  authenticate,
  [
    query("status")
      .optional()
      .isIn(["pending", "approved", "rejected", "active", "completed"])
      .withMessage("Invalid status filter."),
  ],
  getMyLoans,
);

// ── Collection routes ─────────────────────────────────────────

// GET /api/loans
router.get(
  "/",
  authenticate,
  requireRole(["hr_admin", "super_admin"]),
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("page must be a positive integer."),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("limit must be 1–100."),
    query("status")
      .optional()
      .isIn(["pending", "approved", "rejected", "active", "completed"])
      .withMessage("Invalid status filter."),
    query("employeeId")
      .optional()
      .isUUID()
      .withMessage("employeeId must be a valid UUID."),
  ],
  listLoans,
);

// POST /api/loans
router.post(
  "/",
  authenticate,
  [
    body("amount")
      .isFloat({ min: 1000 })
      .withMessage("amount must be at least 1000."),
    body("repaymentMonths")
      .isInt({ min: 1, max: 36 })
      .withMessage("repaymentMonths must be between 1 and 36."),
    body("reason")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("reason must be 1000 characters or fewer."),
  ],
  submitLoanRequest,
);

// ── Single resource routes ────────────────────────────────────

// GET /api/loans/:id/schedule
router.get(
  "/:id/schedule",
  authenticate,
  [param("id").isUUID().withMessage("id must be a valid UUID.")],
  getLoanSchedule,
);

// PUT /api/loans/:id/approve
router.put(
  "/:id/approve",
  authenticate,
  requireRole(["hr_admin", "super_admin"]),
  [
    param("id").isUUID().withMessage("id must be a valid UUID."),
    body("disburse")
      .optional()
      .isBoolean()
      .withMessage("disburse must be a boolean."),
  ],
  approveLoan,
);

// PUT /api/loans/:id/reject
router.put(
  "/:id/reject",
  authenticate,
  requireRole(["hr_admin", "super_admin"]),
  [
    param("id").isUUID().withMessage("id must be a valid UUID."),
    body("rejectionReason")
      .trim()
      .notEmpty()
      .withMessage("rejectionReason is required."),
  ],
  rejectLoan,
);

export default router;
