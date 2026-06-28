


// src/api/service/attendanceApi.js
import API from "../axios";

export const attendanceApi = {
  // ── Employee self-service ──────────────────────────────────
  clockIn: (payload = {}) =>
    API.post("/attendance/clock-in", payload).then((r) => r.data),

  clockOut: () =>
    API.post("/attendance/clock-out").then((r) => r.data),

  getMyAttendance: (params = {}) =>
    API.get("/attendance/me", { params }).then((r) => r.data),

  /** Start a break (pause). No body required. */
  startBreak: () =>
    API.post("/attendance/break-start").then((r) => r.data),

  /** End current break (resume). No body required. */
  endBreak: () =>
    API.post("/attendance/break-end").then((r) => r.data),

  // ── HR / Admin ─────────────────────────────────────────────
  getAll: (params = {}) =>
    API.get("/attendance", { params }).then((r) => r.data),

  getToday: () =>
    API.get("/attendance/today").then((r) => r.data),

  getByEmployee: (employeeId, params = {}) =>
    API.get(`/attendance/employee/${employeeId}`, { params }).then((r) => r.data),

  correct: (id, payload) =>
    API.put(`/attendance/${id}/correct`, payload).then((r) => r.data),

  // ── Shifts ─────────────────────────────────────────────────
  getShifts: () =>
    API.get("/attendance/shifts").then((r) => r.data),

  createShift: (payload) =>
    API.post("/attendance/shifts", payload).then((r) => r.data),

  updateShift: (id, payload) =>
    API.put(`/attendance/shifts/${id}`, payload).then((r) => r.data),
};