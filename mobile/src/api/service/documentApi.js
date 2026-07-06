

// src/api/service/documentApi.js
import API from "../axios";

export const documentApi = {
  // ── Templates ──────────────────────────────────────────────────────────────
  getTemplates: () =>
    API.get("/documents/templates").then((r) => r.data),

  createTemplate: (payload) =>
    API.post("/documents/templates", payload).then((r) => r.data),

  updateTemplate: (id, payload) =>
    API.put(`/documents/templates/${id}`, payload).then((r) => r.data),

  deleteTemplate: (id) =>
    API.delete(`/documents/templates/${id}`).then((r) => r.data),

  // ── Documents (template-based) ─────────────────────────────────────────────
  // _t busts 304 Not Modified cache
  getAll: (params = {}) =>
    API.get("/documents", { params: { ...params, _t: Date.now() } }).then((r) => r.data),

  getById: (id) =>
    API.get(`/documents/${id}`).then((r) => r.data),

  send: (employeeId, templateId) =>
    API.post("/documents/send", { employeeId, templateId }).then((r) => r.data),

  sign: (id, payload = {}) =>
    API.put(`/documents/${id}/sign`, payload).then((r) => r.data),

  // ── File uploads (PDF / DOCX → Cloudinary) ────────────────────────────────

  /**
   * Step 1 — Upload a raw PDF or DOCX file to Cloudinary via the backend.
   * Uses multer memoryStorage — no disk writes on the server.
   *
   * @param {File}   file
   * @param {string} name
   * @param {string} [category]
   * @returns Promise<{ data: UploadedDocument }>
   *   data.file_url — permanent Cloudinary URL (used for download + display)
   */
  uploadFile: (file, name, category = "Other") => {
    const form = new FormData();
    form.append("file",     file);
    form.append("name",     name);
    form.append("category", category);
    return API.post("/documents/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data);
  },

  /**
   * Step 2 — Assign the uploaded document to one or more employees.
   * Triggers an in-app notification for each employee.
   *
   * @param {string}   documentId   — id from uploadFile()
   * @param {string[]} employeeIds
   * @param {string}   [message]
   */
  sendUploaded: (documentId, employeeIds, message = "") =>
    API.post("/documents/send-uploaded", {
      documentId,
      employeeIds,
      message: message || undefined,
    }).then((r) => r.data),

  // ── Employee-facing ────────────────────────────────────────────────────────

  /** Returns all documents sent to the currently authenticated employee. */
  // _t busts 304 cache
  getMyDocuments: () =>
    API.get("/documents/my", { params: { _t: Date.now() } }).then((r) => r.data),
};