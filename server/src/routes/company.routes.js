// src/routes/company.routes.js
//
// Mounts under /api/company in your main Express app:
//
//   import companyRouter from "./routes/company.routes.js";
//   app.use("/api/company", companyRouter);
//
// All routes require a valid Bearer access token (authenticate).
// Mutating routes additionally require hr_admin or super_admin role.

import { Router } from "express";
import multer from "multer";
import { authenticate, requireRole } from "../middleware/authenticate.js";
import {
  getCompanyProfile,
  updateCompanyProfileHandler,
  uploadCompanyLogo,
  getSettings,
  updateSettings,
  getBilling,
} from "../controllers/company.controller.js";
import {
  ADMIN_ROLES,
  updateProfileRules,
  updateSettingsRules,
} from "../validators/company.validators.js";

const router = Router();

// ─── Multer — logo upload (memory storage, 2 MB cap) ─────────
// Files larger than 2 MB are rejected before reaching the controller.
const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (ALLOWED.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new multer.MulterError(
          "LIMIT_UNEXPECTED_FILE",
          "Only JPEG, PNG, WebP, and SVG images are allowed.",
        ),
      );
    }
  },
});

// ─── Multer error handler ─────────────────────────────────────
function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(413)
        .json({ message: "Logo file must not exceed 2 MB." });
    }
    return res.status(400).json({ message: err.message });
  }
  next(err);
}

// ══════════════════════════════════════════════════════════════
// GET /api/company
// Any authenticated user can view their company's profile.
// ══════════════════════════════════════════════════════════════
router.get("/", authenticate, getCompanyProfile);

// ══════════════════════════════════════════════════════════════
// PUT /api/company
// Partial update of company profile fields.
// Restricted to HR admins and super admins.
// ══════════════════════════════════════════════════════════════
router.put(
  "/",
  authenticate,
  requireRole(ADMIN_ROLES),
  ...updateProfileRules,
  updateCompanyProfileHandler,
);

// ══════════════════════════════════════════════════════════════
// PUT /api/company/logo
// Multipart upload — field name must be "logo".
// Restricted to HR admins and super admins.
// ══════════════════════════════════════════════════════════════
router.put(
  "/logo",
  authenticate,
  requireRole(ADMIN_ROLES),
  logoUpload.single("logo"),
  handleMulterError,
  uploadCompanyLogo,
);

// ══════════════════════════════════════════════════════════════
// GET /api/company/settings
// Any authenticated user can read settings
// (needed client-side for currency, timezone, working days, etc.)
// ══════════════════════════════════════════════════════════════
router.get("/settings", authenticate, getSettings);

// ══════════════════════════════════════════════════════════════
// PUT /api/company/settings
// Upsert operational settings.
// Restricted to HR admins and super admins.
// ══════════════════════════════════════════════════════════════
router.put(
  "/settings",
  authenticate,
  requireRole(ADMIN_ROLES),
  ...updateSettingsRules,
  updateSettings,
);

// ══════════════════════════════════════════════════════════════
// GET /api/company/billing
// Subscription plan, seat usage, and invoice history.
// Restricted to HR admins and super admins — employees should
// not see billing details.
// ══════════════════════════════════════════════════════════════
router.get("/billing", authenticate, requireRole(ADMIN_ROLES), getBilling);

export default router;
