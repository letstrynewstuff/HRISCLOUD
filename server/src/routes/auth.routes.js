// src/routes/auth.routes.js
import { Router } from "express";
import { body } from "express-validator";
import { authenticate } from "../middleware/authenticate.js";

import {
  registerCompany,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getMe,
} from "../controllers/auth.controller.js"; 

const router = Router();

// ─── Validation rule sets ──────────────────────────────────────

const registerRules = [
  body("companyName")
    .trim()
    .notEmpty()
    .withMessage("Company name is required.")
    .isLength({ max: 100 })
    .withMessage("Company name must be under 100 characters."),

  body("companySlug")
    .trim()
    .notEmpty()
    .withMessage("Company slug is required.")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug may only contain lowercase letters, numbers, and hyphens.",
    )
    .isLength({ min: 2, max: 50 })
    .withMessage("Slug must be between 2 and 50 characters."),

  body("firstName").trim().notEmpty().withMessage("First name is required."),

  body("lastName").trim().notEmpty().withMessage("Last name is required."),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Must be a valid email address.")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number."),
];

const loginRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Must be a valid email address.")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required."),
];

const forgotPasswordRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Must be a valid email address.")
    .normalizeEmail(),
];

const resetPasswordRules = [
  body("token").notEmpty().withMessage("Reset token is required."),

  body("password")
    .notEmpty()
    .withMessage("New password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number."),
];

// ─── Routes ───────────────────────────────────────────────────

// Public
router.post("/register-company", registerRules, registerCompany);
router.post("/login", loginRules, login);
router.post("/refresh", refresh);

router.post("/logout", authenticate, logout);
router.post("/forgot-password", forgotPasswordRules, forgotPassword);
router.post("/reset-password", resetPasswordRules, resetPassword);
router.post("/verify-email", verifyEmail);

// Protected
router.get("/me", authenticate, getMe);

export default router;
