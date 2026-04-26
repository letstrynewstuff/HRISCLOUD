// src/api/services/jobRoleApi.js
import API from "../axios";

// GET /api/job-roles  — optional query: { departmentId, includeInactive }
export const listJobRoles = (params = {}) =>
  API.get("/job-roles", { params }).then((r) => r.data);

// GET /api/job-roles/:id
export const getJobRole = (id) =>
  API.get(`/job-roles/${id}`).then((r) => r.data);

// POST /api/job-roles
export const createJobRole = (payload) =>
  API.post("/job-roles", payload).then((r) => r.data);

// PUT /api/job-roles/:id
export const updateJobRole = (id, payload) =>
  API.put(`/job-roles/${id}`, payload).then((r) => r.data);

// DELETE /api/job-roles/:id  (soft-delete → is_active = false)
export const deleteJobRole = (id) =>
  API.delete(`/job-roles/${id}`).then((r) => r.data);
