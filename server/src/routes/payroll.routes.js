// src/routes/payroll.routes.js
import { Router } from "express";
import { authenticate, requireRole } from "../middleware/authenticate.js";
import {
  createStructureRules,
  createDeductionRules,
  initRunRules,
  payslipParamRules,
} from "../validators/payroll.validator.js";
import {
  createPayrollStructure,
  getPayrollStructures,
  updatePayrollStructure,
  getDeductions,
  createDeduction,
  toggleDeduction,
  updateDeduction,
  deleteDeduction,
  initPayrollRun,
  listPayrollRuns,
  getPayrollRun,
  runPayrollForCompany,
  runPayrollForEmployee,
  approvePayrollRun,
  markPayrollPaid,
  getPaymentFile, //
  getPayslip,
  getMyPayslip,
  previewPayslip,
  getDashboard,
  getHistory,
} from "../controllers/payroll.controller.js";

const router = Router();
const HR = ["hr_admin", "super_admin"];
const MGR = ["hr_admin", "super_admin", "manager"];

// ── Payroll structures ────────────────────────────────────────
router.get("/structures", authenticate, requireRole(HR), getPayrollStructures);
router.post(
  "/structures",
  authenticate,
  requireRole(HR),
  createStructureRules,
  createPayrollStructure,
);
router.put(
  "/structures/:id",
  authenticate,
  requireRole(HR),
  createStructureRules,
  updatePayrollStructure,
);

// ── Deductions ────────────────────────────────────────────────
router.get("/deductions", authenticate, requireRole(MGR), getDeductions);
router.post(
  "/deductions",
  authenticate,
  requireRole(HR),
  createDeductionRules,
  createDeduction,
);
router.patch(
  "/deductions/:id/toggle",
  authenticate,
  requireRole(HR),
  toggleDeduction,
);
router.put(
  "/deductions/:id",
  authenticate,
  requireRole(HR),
  createDeductionRules,
  updateDeduction,
);
router.delete(
  "/deductions/:id",
  authenticate,
  requireRole(HR),
  deleteDeduction,
);

// ── Dashboard & history ───────────────────────────────────────
router.get("/dashboard", authenticate, requireRole(MGR), getDashboard);
router.get("/history", authenticate, requireRole(MGR), getHistory);

// ── Payroll runs ──────────────────────────────────────────────
router.get("/runs", authenticate, requireRole(MGR), listPayrollRuns);
router.post(
  "/runs",
  authenticate,
  requireRole(HR),
  initRunRules,
  initPayrollRun,
);
router.get("/runs/:id", authenticate, requireRole(MGR), getPayrollRun);

// 2. Register the payment file download route
router.get(
  "/runs/:id/payment-file",
  authenticate,
  requireRole(HR),
  getPaymentFile,
);

router.post(
  "/runs/:id/process",
  authenticate,
  requireRole(HR),
  runPayrollForCompany,
);
router.post(
  "/runs/:id/employees/:empId",
  authenticate,
  requireRole(HR),
  runPayrollForEmployee,
);
router.post(
  "/runs/:id/approve",
  authenticate,
  requireRole(HR),
  approvePayrollRun,
);
router.post(
  "/runs/:id/mark-paid",
  authenticate,
  requireRole(HR),
  markPayrollPaid,
);

// ── Preview (no DB write) ─────────────────────────────────────
router.post(
  "/preview/:employeeId",
  authenticate,
  requireRole(MGR),
  previewPayslip,
);

// ── Payslips ──────────────────────────────────────────────────
router.get(
  "/payslip/me/:month/:year",
  authenticate,
  payslipParamRules,
  getMyPayslip,
);
router.get(
  "/payslip/:employeeId/:month/:year",
  authenticate,
  requireRole(MGR),
  payslipParamRules,
  getPayslip,
);

export default router;
