// // src/api/service/settingsApi.js
// import API from "../axios";

// export const settingsApi = {
//   // ── Security ──────────────────────────────────────────────
//   changePassword: (currentPassword, newPassword) =>
//     API.put("/settings/security/password", {
//       currentPassword,
//       newPassword,
//     }).then((r) => r.data),

//   // ── Notifications ─────────────────────────────────────────
//   getNotificationPrefs: () =>
//     API.get("/settings/notifications").then((r) => r.data),

//   updateNotificationPrefs: (preferences) =>
//     API.put("/settings/notifications", { preferences }).then((r) => r.data),
// };


// src/api/service/settingsApi.js
import API from "../axios";

export const settingsApi = {
  // ── Company Profile ───────────────────────────────────────
  getCompany: () =>
    API.get("/settings/company").then((r) => r.data),

  updateCompany: (payload) =>
    API.put("/settings/company", payload).then((r) => r.data),

  uploadLogo: (file) => {
    const form = new FormData();
    form.append("logo", file);
    return API.post("/settings/company/logo", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },

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

  // ── Users / Invites ───────────────────────────────────────
  getUsers: () =>
    API.get("/settings/users").then((r) => r.data),

  inviteUser: (email, role) =>
    API.post("/settings/users/invite", { email, role }).then((r) => r.data),

  updateUserRole: (userId, role) =>
    API.put(`/settings/users/${userId}/role`, { role }).then((r) => r.data),

  removeUser: (userId) =>
    API.delete(`/settings/users/${userId}`).then((r) => r.data),

  // ── Roles & Permissions ───────────────────────────────────
  getRoles: () =>
    API.get("/settings/roles").then((r) => r.data),

  updateRolePermissions: (roleId, permissions) =>
    API.put(`/settings/roles/${roleId}`, { permissions }).then((r) => r.data),

  // ── Audit Log ─────────────────────────────────────────────
  getAuditLogs: (params = {}) =>
    API.get("/settings/audit", { params }).then((r) => r.data),

  // ── Billing ───────────────────────────────────────────────
  getBilling: () =>
    API.get("/settings/billing").then((r) => r.data),

  // ── Integrations ──────────────────────────────────────────
  getIntegrations: () =>
    API.get("/settings/integrations").then((r) => r.data),

  toggleIntegration: (id, enabled) =>
    API.put(`/settings/integrations/${id}`, { enabled }).then((r) => r.data),
};