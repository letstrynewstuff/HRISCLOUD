// src/routes/goals.routes.js
import { Router } from "express";
import { authenticate, requireRole } from "../middleware/authenticate.js";
import {
  createGoal,
  listGoals,
  getMyGoals,
  assignGoal,
  updateGoalProgress,
  updateGoal,
} from "../controllers/goals.controller.js";

const router = Router();
const HR = ["hr_admin", "super_admin"];
const MGR = ["hr_admin", "super_admin", "manager"];

router.post("/", authenticate, requireRole(MGR), createGoal);
router.get("/", authenticate, requireRole(MGR), listGoals);
router.get("/me", authenticate, getMyGoals);
router.post("/:id/assign", authenticate, requireRole(MGR), assignGoal);
router.post("/:id/progress", authenticate, updateGoalProgress);
router.put("/:id", authenticate, requireRole(MGR), updateGoal);

export default router;
