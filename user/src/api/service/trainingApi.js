// src/api/services/trainingApi.js
import API from "../axios";

/* ─── Catalog / CRUD ─── */

// GET /api/trainings  — query: { type, status, search, page, limit }
export const listTrainings = (params = {}) =>
  API.get("/trainings", { params }).then((r) => r.data);

// GET /api/trainings/:id  (includes enrollments array)
export const getTraining = (id) =>
  API.get(`/trainings/${id}`).then((r) => r.data);

// POST /api/trainings
export const createTraining = (payload) =>
  API.post("/trainings", payload).then((r) => r.data);

// PUT /api/trainings/:id
export const updateTraining = (id, payload) =>
  API.put(`/trainings/${id}`, payload).then((r) => r.data);

// DELETE /api/trainings/:id  (soft-delete → cancelled)
export const deleteTraining = (id) =>
  API.delete(`/trainings/${id}`).then((r) => r.data);

/* ─── Assignment ─── */

// POST /api/trainings/:id/assign   body: { employeeIds: string[] }
// Enrolls employees AND sends them notifications
export const assignTraining = (id, employeeIds) =>
  API.post(`/trainings/${id}/assign`, { employeeIds }).then((r) => r.data);

/* ─── Enrollments / Attendance ─── */

// GET /api/trainings/:id/enrollments
export const getEnrollments = (id) =>
  API.get(`/trainings/${id}/enrollments`).then((r) => r.data);

// PUT /api/trainings/:id/enrollments/:employeeId/attendance
// body: { attendanceStatus: 'attended' | 'absent' | 'excused' }
export const markAttendance = (trainingId, employeeId, attendanceStatus) =>
  API.put(`/trainings/${trainingId}/enrollments/${employeeId}/attendance`, {
    attendanceStatus,
  }).then((r) => r.data);

// POST /api/trainings/:id/enrollments/:employeeId/certificate
export const issueCertificate = (trainingId, employeeId) =>
  API.post(
    `/trainings/${trainingId}/enrollments/${employeeId}/certificate`,
  ).then((r) => r.data);

/* ─── Dashboard & reporting ─── */

// GET /api/trainings/dashboard
export const getTrainingDashboard = () =>
  API.get("/trainings/dashboard").then((r) => r.data);

// GET /api/trainings/certifications
export const getCertifications = () =>
  API.get("/trainings/certifications").then((r) => r.data);

/* ─── Employee self-service ─── */

// GET /api/trainings/my  — employee sees only their own
export const getMyTrainings = () =>
  API.get("/trainings/my").then((r) => r.data);
