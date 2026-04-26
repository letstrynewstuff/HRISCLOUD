// src/api/service/approvalApi.js
import API from "../axios";

export const approvalApi = {
  // ── List & Detail ──────────────────────────────────────────
  getAll: (params = {}) =>
    API.get("/approvals", { params }).then((r) => r.data),

  getById: (id) => API.get(`/approvals/${id}`).then((r) => r.data),

  // ── Actions ────────────────────────────────────────────────
  approve: (id, payload = {}) =>
    API.put(`/approvals/${id}/approve`, payload).then((r) => r.data),

  reject: (id, reason) =>
    API.put(`/approvals/${id}/reject`, { reason }).then((r) => r.data),
};
