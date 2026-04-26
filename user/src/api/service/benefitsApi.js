// src/api/service/benefitsApi.js
import API from "../axios";

export const benefitsApi = {
  // ── Company Benefits ───────────────────────────────────────
  getAll: (params = {}) => API.get("/benefits", { params }).then((r) => r.data),

  create: (payload) => API.post("/benefits", payload).then((r) => r.data),

  update: (id, payload) =>
    API.put(`/benefits/${id}`, payload).then((r) => r.data),

  remove: (id) => API.delete(`/benefits/${id}`).then((r) => r.data),

  // ── Employee Benefits ──────────────────────────────────────
  assign: (payload) =>
    API.post("/benefits/assign", payload).then((r) => r.data),

  // getForEmployee: (employeeId) =>
  //   API.get(`/employees/${employeeId}/benefits`).then((r) => r.data),
  // getForEmployee: (employeeId) =>
  //   API.get(`/benefits/employee/${employeeId}`).then((r) => r.data),
  getForEmployee: (employeeId) =>
    API.get(`/benefits/employee/${employeeId}`).then((r) => r.data),

  deactivate: (employeeBenefitId) =>
    API.put(`/benefits/employee/${employeeBenefitId}/deactivate`).then(
      (r) => r.data,
    ),
};
