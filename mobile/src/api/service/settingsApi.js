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


// // src/api/service/settingsApi.js
// import API from "../axios";

// export const settingsApi = {
//   // ── Company Profile ───────────────────────────────────────
//   getCompany: () => API.get("/settings/company").then((r) => r.data),

//   updateCompany: (payload) =>
//     API.put("/settings/company", payload).then((r) => r.data),

//   uploadLogo: (file) => {
//     const form = new FormData();
//     form.append("logo", file);
//     return API.post("/settings/company/logo", form, {
//       headers: { "Content-Type": "multipart/form-data" },
//     }).then((r) => r.data);
//   },

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

//   // ── Users / Invites ───────────────────────────────────────
//   getUsers: () => API.get("/settings/users").then((r) => r.data),

//   inviteUser: (email, role) =>
//     API.post("/settings/users/invite", { email, role }).then((r) => r.data),

//   updateUserRole: (userId, role) =>
//     API.put(`/settings/users/${userId}/role`, { role }).then((r) => r.data),

//   removeUser: (userId) =>
//     API.delete(`/settings/users/${userId}`).then((r) => r.data),

//   // ── Roles & Permissions ───────────────────────────────────
//   getRoles: () => API.get("/settings/roles").then((r) => r.data),

//   updateRolePermissions: (roleId, permissions) =>
//     API.put(`/settings/roles/${roleId}`, { permissions }).then((r) => r.data),

//   // ── Audit Log ─────────────────────────────────────────────
//   getAuditLogs: (params = {}) =>
//     API.get("/settings/audit", { params }).then((r) => r.data),

//   // ── Billing ───────────────────────────────────────────────
//   getBilling: () => API.get("/settings/billing").then((r) => r.data),

//   // ── Integrations ──────────────────────────────────────────
//   getIntegrations: () => API.get("/settings/integrations").then((r) => r.data),

//   toggleIntegration: (id, enabled) =>
//     API.put(`/settings/integrations/${id}`, { enabled }).then((r) => r.data),
//   // ── My Profile ─────────────────────────────────────────────
//   getMyProfile: () => API.get("/settings/me").then((r) => r.data),

//   updateMyProfile: (payload) =>
//     API.put("/settings/me", payload).then((r) => r.data),

//   // ── Two-Factor Auth ────────────────────────────────────────
//   toggleTwoFactor: (enabled) =>
//     API.put("/settings/security/2fa", { enabled }).then((r) => r.data),

//   // ── Team members (lightweight, for pickers e.g. assign-report) ──
//   getTeamMembers: () => API.get("/settings/users/team").then((r) => r.data),
// };



// // src/api/service/settingsApi.js
// import API from "../axios";

// export const settingsApi = {
//   // ── Company Profile ───────────────────────────────────────
//   getCompany: () => API.get("/settings/company").then((r) => r.data),

//   updateCompany: (payload) =>
//     API.put("/settings/company", payload).then((r) => r.data),

//   uploadLogo: (file) => {
//     const form = new FormData();
//     form.append("logo", file);
//     return API.post("/settings/company/logo", form, {
//       headers: { "Content-Type": "multipart/form-data" },
//     }).then((r) => r.data);
//   },

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

//   // ── Users / Invites ───────────────────────────────────────
//   getUsers: () => API.get("/settings/users").then((r) => r.data),

//   inviteUser: (email, role) =>
//     API.post("/settings/users/invite", { email, role }).then((r) => r.data),

//   updateUserRole: (userId, role) =>
//     API.put(`/settings/users/${userId}/role`, { role }).then((r) => r.data),

//   removeUser: (userId) =>
//     API.delete(`/settings/users/${userId}`).then((r) => r.data),

//   // ── Roles & Permissions ───────────────────────────────────
//   getRoles: () => API.get("/settings/roles").then((r) => r.data),

//   updateRolePermissions: (roleId, permissions) =>
//     API.put(`/settings/roles/${roleId}`, { permissions }).then((r) => r.data),

//   // ── Audit Log ─────────────────────────────────────────────
//   getAuditLogs: (params = {}) =>
//     API.get("/settings/audit", { params }).then((r) => r.data),

//   // ── Billing ───────────────────────────────────────────────
//   getBilling: () => API.get("/settings/billing").then((r) => r.data),

//   // ── Integrations ──────────────────────────────────────────
//   getIntegrations: () => API.get("/settings/integrations").then((r) => r.data),

//   toggleIntegration: (id, enabled) =>
//     API.put(`/settings/integrations/${id}`, { enabled }).then((r) => r.data),

//   // ── My Profile ─────────────────────────────────────────────
//   getMyProfile: () => API.get("/settings/me").then((r) => r.data),

//   updateMyProfile: (payload) =>
//     API.put("/settings/me", payload).then((r) => r.data),

//   // ── Two-Factor Auth ────────────────────────────────────────
//   toggleTwoFactor: (enabled) =>
//     API.put("/settings/security/2fa", { enabled }).then((r) => r.data),

//   // ── Team members (lightweight, for pickers e.g. assign-report) ──
//   getTeamMembers: () => API.get("/settings/users/team").then((r) => r.data),
// };

// // Named exports for direct import (e.g. import { changePassword } from "...")
// export const changePassword = settingsApi.changePassword;
// export const toggleTwoFactor = settingsApi.toggleTwoFactor;
// export const getNotificationPrefs = settingsApi.getNotificationPrefs;
// export const updateNotificationPrefs = settingsApi.updateNotificationPrefs;
// export const getMyProfile = settingsApi.getMyProfile;
// export const updateMyProfile = settingsApi.updateMyProfile;
// export const getCompany = settingsApi.getCompany;
// export const updateCompany = settingsApi.updateCompany;
// export const uploadLogo = settingsApi.uploadLogo;
// export const getUsers = settingsApi.getUsers;
// export const getTeamMembers = settingsApi.getTeamMembers;
// export const inviteUser = settingsApi.inviteUser;
// export const updateUserRole = settingsApi.updateUserRole;
// export const removeUser = settingsApi.removeUser;
// export const getRoles = settingsApi.getRoles;
// export const updateRolePermissions = settingsApi.updateRolePermissions;
// export const getAuditLogs = settingsApi.getAuditLogs;
// export const getBilling = settingsApi.getBilling;
// export const getIntegrations = settingsApi.getIntegrations;
// export const toggleIntegration = settingsApi.toggleIntegration;

// export default settingsApi;


// src/api/service/settingsApi.js
// Matches src/controllers/settings.controller.js exactly.

import API from "../axios";

// ── Security ─────────────────────────────────────────────────
export const changePassword = (payload) =>
  API.put("/settings/security/password", payload).then((r) => r.data);

export const toggleTwoFactor = (enabled) =>
  API.put("/settings/security/2fa", { enabled }).then((r) => r.data);

// ── Notifications ────────────────────────────────────────────
export const getNotificationPrefs = () =>
  API.get("/settings/notifications").then((r) => r.data);

export const updateNotificationPrefs = (preferences) =>
  API.put("/settings/notifications", { preferences }).then((r) => r.data);

// ── My Profile ───────────────────────────────────────────────
export const getMyProfile = () =>
  API.get("/settings/me").then((r) => r.data);

export const updateMyProfile = (payload) =>
  API.put("/settings/me", payload).then((r) => r.data);

/**
 * Upload the current user's profile photo.
 * `fileUri` is the local URI returned by expo-image-picker
 * (result.assets[0].uri).
 */
export const uploadAvatar = (fileUri) => {
  const filename = fileUri.split("/").pop() || `avatar-${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1].toLowerCase()}` : "image/jpeg";

  const formData = new FormData();
  // React Native's fetch/FormData accepts this { uri, name, type } shape
  // directly — no need to read the file into memory first.
  formData.append("avatar", {
    uri: fileUri,
    name: filename,
    type,
  });

  return API.post("/settings/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};

// ── Company Profile ──────────────────────────────────────────
export const getCompany = () =>
  API.get("/settings/company").then((r) => r.data);

export const updateCompany = (payload) =>
  API.put("/settings/company", payload).then((r) => r.data);

export const uploadLogo = (fileUri) => {
  const filename = fileUri.split("/").pop() || `logo-${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1].toLowerCase()}` : "image/jpeg";

  const formData = new FormData();
  formData.append("logo", { uri: fileUri, name: filename, type });

  return API.post("/settings/company/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};

// ── Users / Team ─────────────────────────────────────────────
export const getUsers = () => API.get("/settings/users").then((r) => r.data);

export const getTeamMembers = () =>
  API.get("/settings/users/team").then((r) => r.data);

export const inviteUser = (payload) =>
  API.post("/settings/users/invite", payload).then((r) => r.data);

export const updateUserRole = (userId, role) =>
  API.put(`/settings/users/${userId}/role`, { role }).then((r) => r.data);

export const removeUser = (userId) =>
  API.delete(`/settings/users/${userId}`).then((r) => r.data);

// ── Roles & Permissions ──────────────────────────────────────
export const getRoles = () => API.get("/settings/roles").then((r) => r.data);

export const updateRolePermissions = (roleId, permissions) =>
  API.put(`/settings/roles/${roleId}`, { permissions }).then((r) => r.data);

// ── Audit Log ────────────────────────────────────────────────
export const getAuditLogs = (params = {}) =>
  API.get("/settings/audit", { params }).then((r) => r.data);

// ── Billing ──────────────────────────────────────────────────
export const getBilling = () =>
  API.get("/settings/billing").then((r) => r.data);

// ── Integrations ─────────────────────────────────────────────
export const getIntegrations = () =>
  API.get("/settings/integrations").then((r) => r.data);

export const toggleIntegration = (id, enabled) =>
  API.put(`/settings/integrations/${id}`, { enabled }).then((r) => r.data);