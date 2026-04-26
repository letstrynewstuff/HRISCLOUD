// src/controllers/notification.controller.js
//
// Endpoints:
//   GET    /api/notifications          → my notifications (paginated)
//   GET    /api/notifications/unread-count → unread badge count
//   PUT    /api/notifications/:id/read → mark one as read
//   PUT    /api/notifications/read-all → mark all as read
//   DELETE /api/notifications/:id      → delete one notification
//   DELETE /api/notifications          → clear all notifications
//
// Admin-only:
//   POST   /api/notifications/broadcast → send notification to many users at once
//
// Stack : Express · pg (raw) · express-validator
// Auth  : authenticate injects req.user { userId, companyId, role }

import { validationResult } from "express-validator";
import { db } from "../config/db.js";

// ─── Internal helpers ──────────────────────────────────────────────────────────

function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res
      .status(422)
      .json({ message: "Validation failed.", errors: errors.array() });
    return true;
  }
  return false;
}

// ══════════════════════════════════════════════════════════════
// GET /api/notifications
// Returns the calling user's notifications, newest first.
// Query params:
//   page    — default 1
//   limit   — default 20, max 100
//   unread  — 'true' → only unread; 'false' → only read; omit → all
//   type    — leave | payroll | attendance | document |
//             announcement | performance | system
// Requires: authenticate (any role)
// ══════════════════════════════════════════════════════════════
export async function getMyNotifications(req, res) {
  try {
    const { userId, companyId } = req.user;

    const page = Math.max(1, parseInt(req.query.page ?? 1, 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit ?? 20, 10)),
    );
    const offset = (page - 1) * limit;

    const conditions = ["n.user_id = $1", "n.company_id = $2"];
    const values = [userId, companyId];
    let idx = 3;

    if (req.query.unread === "true") {
      conditions.push(`n.is_read = false`);
    } else if (req.query.unread === "false") {
      conditions.push(`n.is_read = true`);
    }

    if (req.query.type) {
      conditions.push(`n.type = $${idx}`);
      values.push(req.query.type);
      idx++;
    }

    const whereClause = conditions.join(" AND ");

    const countResult = await db.query(
      `SELECT COUNT(*) AS total FROM notifications n WHERE ${whereClause}`,
      values,
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const dataResult = await db.query(
      `SELECT id, title, message, type, is_read, link, created_at
       FROM notifications n
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset],
    );

    return res.status(200).json({
      data: dataResult.rows,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("getMyNotifications error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching notifications." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/notifications/unread-count
// Lightweight count endpoint — powers the bell badge on the frontend.
// Returns: { count: number }
// Requires: authenticate (any role)
// ══════════════════════════════════════════════════════════════
export async function getUnreadCount(req, res) {
  try {
    const { userId, companyId } = req.user;

    const result = await db.query(
      `SELECT COUNT(*) AS count
       FROM notifications
       WHERE user_id = $1 AND company_id = $2 AND is_read = false`,
      [userId, companyId],
    );

    return res.status(200).json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    console.error("getUnreadCount error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching unread count." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/notifications/:id/read
// Marks a single notification as read.
// Only the owning user can mark their own notification.
// Requires: authenticate (any role)
// ══════════════════════════════════════════════════════════════
export async function markOneRead(req, res) {
  const { id } = req.params;
  const { userId, companyId } = req.user;

  try {
    const result = await db.query(
      `UPDATE notifications
       SET is_read = true, updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND company_id = $3
       RETURNING id, is_read`,
      [id, userId, companyId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Notification not found." });
    }

    return res.status(200).json({
      message: "Notification marked as read.",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("markOneRead error:", err);
    return res
      .status(500)
      .json({ message: "Server error marking notification." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/notifications/read-all
// Marks every unread notification for the calling user as read.
// Returns how many rows were updated.
// Requires: authenticate (any role)
// ══════════════════════════════════════════════════════════════
export async function markAllRead(req, res) {
  const { userId, companyId } = req.user;

  try {
    const result = await db.query(
      `UPDATE notifications
       SET is_read = true, updated_at = NOW()
       WHERE user_id = $1 AND company_id = $2 AND is_read = false
       RETURNING id`,
      [userId, companyId],
    );

    return res.status(200).json({
      message: `${result.rows.length} notification(s) marked as read.`,
      updated: result.rows.length,
    });
  } catch (err) {
    console.error("markAllRead error:", err);
    return res
      .status(500)
      .json({ message: "Server error marking notifications." });
  }
}

// ══════════════════════════════════════════════════════════════
// DELETE /api/notifications/:id
// Deletes a single notification belonging to the calling user.
// Requires: authenticate (any role)
// ══════════════════════════════════════════════════════════════
export async function deleteOneNotification(req, res) {
  const { id } = req.params;
  const { userId, companyId } = req.user;

  try {
    const result = await db.query(
      `DELETE FROM notifications
       WHERE id = $1 AND user_id = $2 AND company_id = $3
       RETURNING id`,
      [id, userId, companyId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Notification not found." });
    }

    return res
      .status(200)
      .json({ message: "Notification deleted.", data: { id } });
  } catch (err) {
    console.error("deleteOneNotification error:", err);
    return res
      .status(500)
      .json({ message: "Server error deleting notification." });
  }
}

// ══════════════════════════════════════════════════════════════
// DELETE /api/notifications
// Clears all notifications for the calling user.
// Returns how many were deleted.
// Requires: authenticate (any role)
// ══════════════════════════════════════════════════════════════
export async function clearAllNotifications(req, res) {
  const { userId, companyId } = req.user;

  try {
    const result = await db.query(
      `DELETE FROM notifications
       WHERE user_id = $1 AND company_id = $2
       RETURNING id`,
      [userId, companyId],
    );

    return res.status(200).json({
      message: `${result.rows.length} notification(s) cleared.`,
      deleted: result.rows.length,
    });
  } catch (err) {
    console.error("clearAllNotifications error:", err);
    return res
      .status(500)
      .json({ message: "Server error clearing notifications." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/notifications/broadcast
// HR sends a notification to multiple users at once.
// Body:
//   userIds  — string[] of user UUIDs  (target specific users)
//   everyone — boolean                 (true → send to ALL company users)
//   title    — string (required)
//   message  — string
//   type     — notification type
//   link     — optional deep-link
//
// Uses a single INSERT … SELECT for efficiency when everyone = true.
// Requires: authenticate + requireRole(["hr_admin","super_admin"])
// ══════════════════════════════════════════════════════════════
export async function broadcastNotification(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { companyId } = req.user;
  const {
    userIds = [],
    everyone = false,
    title,
    message,
    type = "system",
    link,
  } = req.body;

  if (!everyone && userIds.length === 0) {
    return res.status(400).json({
      message: "Provide at least one userId or set everyone = true.",
    });
  }

  try {
    let inserted = 0;

    if (everyone) {
      // Insert a row for every active user in the company
      const result = await db.query(
        `INSERT INTO notifications (company_id, user_id, title, message, type, link, created_at)
         SELECT $1, u.id, $2, $3, $4, $5, NOW()
         FROM users u
         WHERE u.company_id = $1 AND u.is_active = true
         RETURNING id`,
        [companyId, title, message ?? null, type, link ?? null],
      );
      inserted = result.rows.length;
    } else {
      // Validate all UUIDs belong to this company before bulk insert
      const validUsers = await db.query(
        `SELECT id FROM users
         WHERE id = ANY($1::uuid[]) AND company_id = $2 AND is_active = true`,
        [userIds, companyId],
      );

      if (validUsers.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "No valid users found for the provided IDs." });
      }

      // Bulk insert using unnest for efficiency
      const ids = validUsers.rows.map((r) => r.id);
      const result = await db.query(
        `INSERT INTO notifications (company_id, user_id, title, message, type, link, created_at)
         SELECT $1, u.id, $2, $3, $4, $5, NOW()
         FROM unnest($6::uuid[]) AS u(id)
         RETURNING id`,
        [companyId, title, message ?? null, type, link ?? null, ids],
      );
      inserted = result.rows.length;
    }

    return res.status(201).json({
      message: `Notification sent to ${inserted} user(s).`,
      inserted,
    });
  } catch (err) {
    console.error("broadcastNotification error:", err);
    return res
      .status(500)
      .json({ message: "Server error broadcasting notification." });
  }
}
