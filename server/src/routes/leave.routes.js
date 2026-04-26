

// src/routes/leave.routes.js
//
// FIX: GET /requests used requireRole(["hr_admin","super_admin","manager"])
//      but "manager" is NOT a JWT role. Replaced with requireManagerial.
//
// NOTE: The getAllRequests controller already has manager-scoping logic:
//   if (role === "manager") → filter by direct reports
// But since role is never "manager", that block never executed.
// After this fix, we use req.user.isHR instead — controller patch below.
//
// Mount in app.js:
//   import leaveRoutes from "./routes/leave.routes.js";
//   app.use("/api/leave", leaveRoutes);

import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  authenticate,
  requireRole,
  requireManagerial,
} from "../middleware/authenticate.js";
import {
  getPolicies,
  createPolicy,
  updatePolicy,
  getAllBalances,
  getMyBalances,
  adjustBalance,
  getAllRequests,
  submitLeaveRequest,
  getMyRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  getLeaveCalendar,
} from "../controllers/leave.controller.js";

const router = Router();

const policyBodyValidators = [
  body("name").trim().notEmpty().withMessage("Policy name is required."),
  body("leaveType").trim().notEmpty().withMessage("leaveType is required."),
  body("daysAllowed")
    .isInt({ min: 1 })
    .withMessage("daysAllowed must be a positive integer."),
  body("carryOverDays").optional().isInt({ min: 0 }),
  body("isPaid").optional().isBoolean(),
  body("requiresApproval").optional().isBoolean(),
  body("requiresDocument").optional().isBoolean(),
  body("noticeDays").optional().isInt({ min: 0 }),
  body("minDaysPerRequest").optional().isInt({ min: 1 }),
  body("maxDaysPerRequest").optional().isInt({ min: 1 }),
  body("applicableTo").optional().isArray(),
  body("applicableTo.*")
    .optional()
    .isIn(["full_time", "part_time", "contract", "intern"]),
];

const leaveRequestValidators = [
  body("leavePolicyId")
    .isUUID()
    .withMessage("leavePolicyId must be a valid UUID."),
  body("startDate")
    .isDate()
    .withMessage("startDate must be a valid date (YYYY-MM-DD)."),
  body("endDate")
    .isDate()
    .withMessage("endDate must be a valid date (YYYY-MM-DD)."),
  body("reason").optional().trim().isLength({ max: 1000 }),
  body("supportingDocument").optional().isURL(),
];

// ── POLICIES ────────────────────────────────────────────────────────────────

router.get("/policies", authenticate, getPolicies);

router.post(
  "/policies",
  authenticate,
  requireRole(["hr_admin", "super_admin"]),
  policyBodyValidators,
  createPolicy,
);

router.put(
  "/policies/:id",
  authenticate,
  requireRole(["hr_admin", "super_admin"]),
  [
    param("id").isUUID(),
    body("daysAllowed").optional().isInt({ min: 1 }),
    body("carryOverDays").optional().isInt({ min: 0 }),
    body("isPaid").optional().isBoolean(),
    body("isActive").optional().isBoolean(),
    body("noticeDays").optional().isInt({ min: 0 }),
  ],
  updatePolicy,
);

// ── BALANCES ─────────────────────────────────────────────────────────────────

router.get(
  "/balances/me",
  authenticate,
  [query("year").optional().isInt({ min: 2020, max: 2100 })],
  getMyBalances,
);

router.get(
  "/balances",
  authenticate,
  requireRole(["hr_admin", "super_admin"]),
  [
    query("year").optional().isInt({ min: 2020, max: 2100 }),
    query("employeeId").optional().isUUID(),
  ],
  getAllBalances,
);

router.put(
  "/balances/:id",
  authenticate,
  requireRole(["hr_admin", "super_admin"]),
  [
    param("id").isUUID(),
    body("adjustment").isNumeric(),
    body("reason").trim().notEmpty(),
  ],
  adjustBalance,
);

// ── REQUESTS ─────────────────────────────────────────────────────────────────

router.get(
  "/requests/me",
  authenticate,
  [
    query("status")
      .optional()
      .isIn(["pending", "approved", "rejected", "cancelled"]),
    query("year").optional().isInt({ min: 2020, max: 2100 }),
  ],
  getMyRequests,
);

// FIX: was requireRole([..., "manager"]) — "manager" is NOT a JWT role.
// requireManagerial allows HR admins + employees with direct reports.
// The getAllRequests controller uses req.user.isHR to scope results.
router.get(
  "/requests",
  authenticate,
  requireManagerial, // ← FIX
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status")
      .optional()
      .isIn(["pending", "approved", "rejected", "cancelled"]),
    query("employeeId").optional().isUUID(),
    query("from").optional().isDate(),
    query("to").optional().isDate(),
  ],
  getAllRequests,
);

router.post(
  "/requests",
  authenticate,
  leaveRequestValidators,
  submitLeaveRequest,
);

// Approve / Reject — allow managers to action their team's requests
router.put(
  "/requests/:id/approve",
  authenticate,
  requireManagerial, // ← FIX: managers can approve their team's leave
  [
    param("id").isUUID(),
    body("comment").optional().trim().isLength({ max: 500 }),
  ],
  approveLeaveRequest,
);

router.put(
  "/requests/:id/reject",
  authenticate,
  requireManagerial, // ← FIX: managers can reject their team's leave
  [param("id").isUUID(), body("rejectionReason").trim().notEmpty()],
  rejectLeaveRequest,
);

// ── CALENDAR ─────────────────────────────────────────────────────────────────

router.get(
  "/calendar",
  authenticate,
  [
    query("from").optional().isDate(),
    query("to").optional().isDate(),
    query("department").optional().isUUID(),
  ],
  getLeaveCalendar,
);

export default router;
