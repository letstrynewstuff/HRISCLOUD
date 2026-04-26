// src/routes/benefits.routes.js
// Mount in app.js: app.use("/api/benefits", benefitsRouter);

import { Router } from "express";
import { authenticate, requireRole } from "../middleware/authenticate.js";
import {
  createBenefit,
  getBenefits,
  updateBenefit,
  deleteBenefit,
  assignBenefit,
  deactivateBenefit,
  getEmployeeBenefits,
} from "../controllers/benefits.controller.js";

const router = Router();
const ADMIN = ["hr_admin", "super_admin"];

router.post("/", authenticate, requireRole(ADMIN), createBenefit);
router.get("/", authenticate, getBenefits);
// router.get("/:id/benefits", authenticate, getEmployeeBenefits);
router.get("/employee/:id", authenticate, getEmployeeBenefits);
router.put("/:id", authenticate, requireRole(ADMIN), updateBenefit);
router.delete("/:id", authenticate, requireRole(ADMIN), deleteBenefit);
router.post("/assign", authenticate, requireRole(ADMIN), assignBenefit);
router.put(
  "/employee/:id/deactivate",
  authenticate,
  requireRole(ADMIN),
  deactivateBenefit,
);

export default router;
