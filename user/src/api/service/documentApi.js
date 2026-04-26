// src/api/service/documentApi.js
import API from "../axios";

export const documentApi = {
  // ── Templates ──────────────────────────────────────────────
  getTemplates: () => API.get("/documents/templates").then((r) => r.data),

  createTemplate: (payload) =>
    API.post("/documents/templates", payload).then((r) => r.data),

  updateTemplate: (id, payload) =>
    API.put(`/documents/templates/${id}`, payload).then((r) => r.data),

  deleteTemplate: (id) =>
    API.delete(`/documents/templates/${id}`).then((r) => r.data),

  // ── Documents ──────────────────────────────────────────────
  getAll: (params = {}) =>
    API.get("/documents", { params }).then((r) => r.data),

  getById: (id) => API.get(`/documents/${id}`).then((r) => r.data),

  send: (employeeId, templateId) =>
    API.post("/documents/send", { employeeId, templateId }).then((r) => r.data),

  sign: (id, payload = {}) =>
    API.put(`/documents/${id}/sign`, payload).then((r) => r.data),
};
