// // src/api/service/reportApi.js
// // Matches src/controllers/report.controller.js exactly.

// import API from "../axios";

// export const reportApi = {
//   // ── Employee-facing ──────────────────────────────────────────
//   create: (payload) => API.post("/reports", payload).then((r) => r.data),
//   getMyReports: () => API.get("/reports/me").then((r) => r.data),
//   getReport: (id) => API.get(`/reports/${id}`).then((r) => r.data),

//   // ── HR-facing ─────────────────────────────────────────────────
//   list: (params = {}) => API.get("/reports", { params }).then((r) => r.data),
//   getStats: () => API.get("/reports/stats/summary").then((r) => r.data),

//   updateStatus: (id, payload) =>
//     API.put(`/reports/${id}/status`, payload).then((r) => r.data),

//   assign: (id, payload) =>
//     API.put(`/reports/${id}/assign`, payload).then((r) => r.data),

//   addNote: (id, payload) =>
//     API.post(`/reports/${id}/notes`, payload).then((r) => r.data),

//   revealIdentity: (id, payload) =>
//     API.post(`/reports/${id}/reveal`, payload).then((r) => r.data),
// };

// export default reportApi;


// src/api/service/reportApi.js
import API from "../axios";

export const reportApi = {
  // ── Employee-facing ──────────────────────────────────────────
  create: (payload) => API.post("/reports", payload).then((r) => r.data),

  // ✅ now accepts pagination params
  getMyReports: (params = {}) =>
    API.get("/reports/me", { params }).then((r) => r.data),

  getReport: (id) => API.get(`/reports/${id}`).then((r) => r.data),

  // ── HR-facing ─────────────────────────────────────────────────
  list: (params = {}) => API.get("/reports", { params }).then((r) => r.data),
  getStats: () => API.get("/reports/stats/summary").then((r) => r.data),

  updateStatus: (id, payload) =>
    API.put(`/reports/${id}/status`, payload).then((r) => r.data),

  assign: (id, payload) =>
    API.put(`/reports/${id}/assign`, payload).then((r) => r.data),

  addNote: (id, payload) =>
    API.post(`/reports/${id}/notes`, payload).then((r) => r.data),

  revealIdentity: (id, payload) =>
    API.post(`/reports/${id}/reveal`, payload).then((r) => r.data),
};

export default reportApi;