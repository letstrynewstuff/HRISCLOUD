// ─────────────────────────────────────────────────────────────
// src/routes/notification.routes.js
//
// Mount in app.js:
//   import notificationRoutes from "./routes/notification.routes.js";
//   app.use("/api/notifications", notificationRoutes);
// ─────────────────────────────────────────────────────────────

import { Router as NRouter } from "express";
import {
  body as nbody,
  param as nparam,
  query as nquery,
} from "express-validator";
import {
  authenticate as nauth,
  requireRole as nrole,
} from "../middleware/authenticate.js";
import {
  getMyNotifications,
  getUnreadCount,
  markOneRead,
  markAllRead,
  deleteOneNotification,
  clearAllNotifications,
  broadcastNotification,
} from "../controllers/notification.controller.js";


const nRouter = NRouter();

const VALID_TYPES = [
  "leave",
  "payroll",
  "attendance",
  "document",
  "announcement",
  "performance",
  "system",
];

// GET /api/notifications/unread-count  ← before /:id
nRouter.get("/unread-count", nauth, getUnreadCount);

// PUT /api/notifications/read-all      ← before /:id
nRouter.put("/read-all", nauth, markAllRead);

// DELETE /api/notifications (clear all)
nRouter.delete("/", nauth, clearAllNotifications);

// POST /api/notifications/broadcast
nRouter.post(
  "/broadcast",
  nauth,
  nrole(["hr_admin", "super_admin"]),
  [
    nbody("title").trim().notEmpty().withMessage("title is required."),
    nbody("message").optional().trim(),
    nbody("type")
      .optional()
      .isIn(VALID_TYPES)
      .withMessage(`type must be one of: ${VALID_TYPES.join(", ")}.`),
    nbody("everyone")
      .optional()
      .isBoolean()
      .withMessage("everyone must be a boolean."),
    nbody("userIds")
      .optional()
      .isArray()
      .withMessage("userIds must be an array."),
    nbody("userIds.*")
      .optional()
      .isUUID()
      .withMessage("Each userId must be a valid UUID."),
    nbody("link").optional().isString(),
  ],
  broadcastNotification,
);

// GET /api/notifications
nRouter.get(
  "/",
  nauth,
  [
    nquery("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("page must be a positive integer."),
    nquery("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("limit must be 1–100."),
    nquery("unread")
      .optional()
      .isIn(["true", "false"])
      .withMessage("unread must be 'true' or 'false'."),
    nquery("type")
      .optional()
      .isIn(VALID_TYPES)
      .withMessage(`type must be one of: ${VALID_TYPES.join(", ")}.`),
  ],
  getMyNotifications,
);

// PUT /api/notifications/:id/read
nRouter.put(
  "/:id/read",
  nauth,
  [nparam("id").isUUID().withMessage("id must be a valid UUID.")],
  markOneRead,
);

// DELETE /api/notifications/:id
nRouter.delete(
  "/:id",
  nauth,
  [nparam("id").isUUID().withMessage("id must be a valid UUID.")],
  deleteOneNotification,
);

export { nRouter as notificationRouter };
