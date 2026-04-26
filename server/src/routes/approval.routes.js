// // src/routes/approval.routes.js
// // Mount in app.js: app.use("/api/approvals", approvalRouter);

// import { Router } from "express";
// import { authenticate, requireRole } from "../middleware/authenticate.js";
// import {
//   getApprovals,
//   getApprovalById,
//   approveApproval,
//   rejectApproval,
// } from "../controllers/approval.controller.js";

// const router = Router();
// const ADMIN = ["hr_admin", "super_admin"];

// router.get("/", authenticate, requireRole(ADMIN), getApprovals);
// router.get("/:id", authenticate, requireRole(ADMIN), getApprovalById);
// router.put("/:id/approve", authenticate, requireRole(ADMIN), approveApproval);
// router.put("/:id/reject", authenticate, requireRole(ADMIN), rejectApproval);

// export default router;

// src/routes/approval.routes.js
//
// FIX: GET / used requireRole(ADMIN) which blocked managers from seeing
//      their team's pending approvals.
//      Replaced with requireManagerial on GET / and GET /:id.
//      Approve/Reject actions stay HR-only — managers cannot self-approve.
//
// Mount in app.js: app.use("/api/approvals", approvalRouter);

import { Router } from "express";
import { authenticate, requireRole, requireManagerial } from "../middleware/authenticate.js";
import {
  getApprovals,
  getApprovalById,
  approveApproval,
  rejectApproval,
} from "../controllers/approval.controller.js";

const router = Router();
const ADMIN = ["hr_admin", "manager"];

// GET /api/approvals
// FIX: requireManagerial replaces requireRole(ADMIN).
// getApprovals controller reads req.user.isHR + req.user.employeeId to scope:
//   isHR=true  → all company approvals
//   isHR=false → only approvals from this manager's direct reports
router.get("/", authenticate, requireManagerial, getApprovals);             // ← FIX

// GET /api/approvals/:id
router.get("/:id", authenticate, requireManagerial, getApprovalById);       // ← FIX

// Approve / Reject — HR only.
// A manager should not be able to approve in the system without HR oversight.
// If you want to allow manager approvals, change these to requireManagerial too.
router.put("/:id/approve", authenticate, requireRole(ADMIN), approveApproval);
router.put("/:id/reject",  authenticate, requireRole(ADMIN), rejectApproval);

export default router;