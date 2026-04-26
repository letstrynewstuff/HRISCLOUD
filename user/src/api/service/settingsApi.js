// src/api/service/settingsApi.js
import API from "../axios";

export const settingsApi = {
  // ── Security ──────────────────────────────────────────────
  changePassword: (currentPassword, newPassword) =>
    API.put("/settings/security/password", {
      currentPassword,
      newPassword,
    }).then((r) => r.data),

  // ── Notifications ─────────────────────────────────────────
  getNotificationPrefs: () =>
    API.get("/settings/notifications").then((r) => r.data),

  updateNotificationPrefs: (preferences) =>
    API.put("/settings/notifications", { preferences }).then((r) => r.data),
};
