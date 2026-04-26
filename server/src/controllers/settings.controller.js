// src/controllers/settings.controller.js
//
// Endpoints:
//   PUT /api/settings/security/password      → changePassword
//   PUT /api/settings/notifications          → updateNotificationPrefs
//   GET /api/settings/notifications          → getNotificationPrefs
//
// Requires: authenticate middleware on all routes.

import bcrypt from "bcryptjs";
import { db } from "../config/db.js";

// ══════════════════════════════════════════════════════════════
// PUT /api/settings/security/password
// Body: { currentPassword, newPassword }
// ══════════════════════════════════════════════════════════════
export async function changePassword(req, res) {
  const { userId } = req.user;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      message: "currentPassword and newPassword are required.",
    });
  }

  if (newPassword.length < 8) {
    return res.status(422).json({
      message: "New password must be at least 8 characters.",
    });
  }

  try {
    const result = await db.query(
      "SELECT id, password_hash FROM users WHERE id = $1",
      [userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!valid) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from your current password.",
      });
    }

    const hash = await bcrypt.hash(newPassword, 12);

    await db.query(
      "UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2",
      [hash, userId],
    );

    // Invalidate all refresh tokens so user must log in again on other devices
    await db.query("DELETE FROM refresh_tokens WHERE user_id=$1", [userId]);

    return res.status(200).json({
      message:
        "Password changed successfully. Please log in again on other devices.",
    });
  } catch (err) {
    console.error("changePassword error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/settings/notifications
// Returns the user's current notification preferences.
// Stored as a JSONB column on the users table (or user_prefs table).
// Falls back to sensible defaults if no preferences stored yet.
// ══════════════════════════════════════════════════════════════
export async function getNotificationPrefs(req, res) {
  const { userId } = req.user;

  try {
    const result = await db.query(
      "SELECT notification_prefs FROM users WHERE id=$1",
      [userId],
    );

    const stored = result.rows[0]?.notification_prefs;

    // Default preferences
    const defaults = {
      requestApproved: { email: true, inApp: true, sms: false },
      newAnnouncement: { email: true, inApp: true, sms: false },
      payslipReady: { email: true, inApp: true, sms: true },
      leaveReminder: { email: true, inApp: true, sms: false },
      trainingDue: { email: false, inApp: true, sms: false },
      teamMessage: { email: false, inApp: true, sms: false },
    };

    // Merge stored preferences with defaults
    const prefs = stored ? { ...defaults, ...stored } : defaults;

    return res.status(200).json({ preferences: prefs });
  } catch (err) {
    console.error("getNotificationPrefs error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/settings/notifications
// Body: { preferences: { requestApproved: { email, inApp, sms }, ... } }
// ══════════════════════════════════════════════════════════════
export async function updateNotificationPrefs(req, res) {
  const { userId } = req.user;
  const { preferences } = req.body;

  if (!preferences || typeof preferences !== "object") {
    return res.status(400).json({ message: "preferences object is required." });
  }

  // Whitelist allowed keys
  const ALLOWED_KEYS = [
    "requestApproved",
    "newAnnouncement",
    "payslipReady",
    "leaveReminder",
    "trainingDue",
    "teamMessage",
  ];
  const CHANNEL_KEYS = ["email", "inApp", "sms"];

  const sanitized = {};
  for (const key of ALLOWED_KEYS) {
    if (key in preferences && typeof preferences[key] === "object") {
      sanitized[key] = {};
      for (const ch of CHANNEL_KEYS) {
        if (ch in preferences[key]) {
          sanitized[key][ch] = Boolean(preferences[key][ch]);
        }
      }
    }
  }

  try {
    // Ensure the column exists; if users table doesn't have it yet, this
    // will throw — in that case run the migration below.
    await db.query(
      `UPDATE users
       SET notification_prefs = $1::jsonb,
           updated_at         = NOW()
       WHERE id = $2`,
      [JSON.stringify(sanitized), userId],
    );

    return res.status(200).json({
      message: "Notification preferences saved.",
      preferences: sanitized,
    });
  } catch (err) {
    console.error("updateNotificationPrefs error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}
