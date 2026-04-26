// src/api/service/leaveApi.js
import API from "../axios";

export const leaveApi = {
  // ── Policies ────────────────────────────────────────────────
  getPolicies: () => API.get("/leave/policies").then((r) => r.data),

  createPolicy: (payload) =>
    API.post("/leave/policies", payload).then((r) => r.data),

  updatePolicy: (id, payload) =>
    API.put(`/leave/policies/${id}`, payload).then((r) => r.data),

  // ── Balances ────────────────────────────────────────────────
  getAllBalances: (params = {}) =>
    API.get("/leave/balances", { params }).then((r) => r.data),

  getMyBalances: (params = {}) =>
    API.get("/leave/balances/me", { params }).then((r) => r.data),

  adjustBalance: (id, payload) =>
    API.put(`/leave/balances/${id}`, payload).then((r) => r.data),

  // ── Requests ────────────────────────────────────────────────
  getAllRequests: (params = {}) =>
    API.get("/leave/requests", { params }).then((r) => r.data),

  getMyRequests: (params = {}) =>
    API.get("/leave/requests/me", { params }).then((r) => r.data),

  submitRequest: (payload) =>
    API.post("/leave/requests", payload).then((r) => r.data),

  approveRequest: (id, payload = {}) =>
    API.put(`/leave/requests/${id}/approve`, payload).then((r) => r.data),

  rejectRequest: (id, payload) =>
    API.put(`/leave/requests/${id}/reject`, payload).then((r) => r.data),

  // ── Calendar ────────────────────────────────────────────────
  getCalendar: (params = {}) =>
    API.get("/leave/calendar", { params }).then((r) => r.data),
};
