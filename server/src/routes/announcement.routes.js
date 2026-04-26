// src/routes/announcement.routes.js
//
// Mount in app.js:
//   import announcementRoutes from "./routes/announcement.routes.js";
//   app.use("/api/announcements", announcementRoutes);

import { Router } from "express";
import { body, param, query } from "express-validator";
import { authenticate, requireRole } from "../middleware/authenticate.js";
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementFeed,
  incrementViewCount,
} from "../controllers/announcement.controller.js";


const router = Router();

// ── Reusable validators ─────────────────────────────────────────────────────

const announcementBodyValidators = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("title is required.")
    .isLength({ max: 255 })
    .withMessage("title must be 255 characters or fewer."),
  body("body").trim().notEmpty().withMessage("body is required."),
  body("audience")
    .isIn(["all", "department", "role"])
    .withMessage("audience must be 'all', 'department', or 'role'."),
  body("departmentId")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("departmentId must be a valid UUID."),
  body("isPinned")
    .optional()
    .isBoolean()
    .withMessage("isPinned must be a boolean."),
  body("publishAt")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("publishAt must be a valid ISO 8601 datetime."),
  body("expiresAt")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("expiresAt must be a valid ISO 8601 datetime."),
];

// ── STATIC NAMED ROUTES — must come before /:id ─────────────────────────────

// GET /api/announcements/feed
router.get(
  "/feed",
  authenticate,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("page must be a positive integer."),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("limit must be between 1 and 50."),
  ],
  getAnnouncementFeed,
);

// ── COLLECTION ROUTES ────────────────────────────────────────────────────────

// GET /api/announcements
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
      .withMessage("limit must be between 1 and 100."),
    query("audience")
      .optional()
      .isIn(["all", "department", "role"])
      .withMessage("audience must be 'all', 'department', or 'role'."),
    query("department")
      .optional()
      .isUUID()
      .withMessage("department must be a valid UUID."),
    query("pinned")
      .optional()
      .isIn(["true", "false"])
      .withMessage("pinned must be 'true' or 'false'."),
    query("status")
      .optional()
      .isIn(["active", "scheduled", "expired"])
      .withMessage("status must be 'active', 'scheduled', or 'expired'."),
  ],
  listAnnouncements,
);

// POST /api/announcements
router.post(
  "/",
  authenticate,
  requireRole(["hr_admin", "super_admin"]),
  announcementBodyValidators,
  createAnnouncement,
);

// ── SINGLE RESOURCE ROUTES ───────────────────────────────────────────────────

// PUT /api/announcements/:id
router.put(
  "/:id",
  authenticate,
  requireRole(["hr_admin", "super_admin"]),
  [
    param("id").isUUID().withMessage("id must be a valid UUID."),
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("title cannot be blank.")
      .isLength({ max: 255 })
      .withMessage("title must be 255 characters or fewer."),
    body("body")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("body cannot be blank."),
    body("audience")
      .optional()
      .isIn(["all", "department", "role"])
      .withMessage("audience must be 'all', 'department', or 'role'."),
    body("departmentId")
      .optional({ nullable: true })
      .isUUID()
      .withMessage("departmentId must be a valid UUID."),
    body("isPinned")
      .optional()
      .isBoolean()
      .withMessage("isPinned must be a boolean."),
    body("publishAt")
      .optional({ nullable: true })
      .isISO8601()
      .withMessage("publishAt must be a valid ISO 8601 datetime."),
    body("expiresAt")
      .optional({ nullable: true })
      .isISO8601()
      .withMessage("expiresAt must be a valid ISO 8601 datetime."),
  ],
  updateAnnouncement,
);

// DELETE /api/announcements/:id
router.delete(
  "/:id",
  authenticate,
  requireRole(["hr_admin", "super_admin"]),
  [param("id").isUUID().withMessage("id must be a valid UUID.")],
  deleteAnnouncement,
);

// PUT /api/announcements/:id/view
router.put(
  "/:id/view",
  authenticate,
  [param("id").isUUID().withMessage("id must be a valid UUID.")],
  incrementViewCount,
);

export default router;
