// src/routes/settings.routes.js
//
// Mount in app.js:
//   import settingsRouter from "./routes/settings.routes.js";
//   app.use("/api/settings", settingsRouter);

import { Router } from "express";
import { body } from "express-validator";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import {
  changePassword,
  getNotificationPrefs,
  updateNotificationPrefs,
} from "../controllers/settings.controller.js";

const router = Router();

router.use(authenticate);

// ── Security ──────────────────────────────────────────────────
router.put(
  "/security/password",
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("currentPassword is required."),
    body("newPassword")
      .notEmpty()
      .withMessage("newPassword is required.")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters.")
      .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must include uppercase, lowercase, and a number."),
  ],
  validate,
  changePassword,
);

// ── Notification preferences ──────────────────────────────────
router.get("/notifications", getNotificationPrefs);
router.put("/notifications", updateNotificationPrefs);

export default router;
