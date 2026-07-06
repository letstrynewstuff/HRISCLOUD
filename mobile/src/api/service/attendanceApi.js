// // src/api/service/attendanceApi.js
// import API from "../axios";

// // Helper to get user's local date string (YYYY-MM-DD)
// function getLocalDateStr() {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, "0");
//   const day = String(now.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// }

// export const attendanceApi = {
//   clockIn: (payload = {}) =>
//     API.post("/attendance/clock-in", {
//       ...payload,
//       date: getLocalDateStr(), // Send user's local date
//     }).then((r) => r.data),

//   clockOut: () => API.post("/attendance/clock-out").then((r) => r.data),

//   getMyAttendance: (params = {}) =>
//     API.get("/attendance/me", {
//       params: {
//         ...params,
//         // If querying for today, send the user's local date
//         ...(params.date === "today" ? { date: getLocalDateStr() } : params),
//       },
//     }).then((r) => r.data),

//   startBreak: () => API.post("/attendance/break-start").then((r) => r.data),

//   endBreak: () => API.post("/attendance/break-end").then((r) => r.data),
//   // ── HR / Admin ─────────────────────────────────────────────
//   getAll: (params = {}) =>
//     API.get("/attendance", { params }).then((r) => r.data),

//   getToday: () => API.get("/attendance/today").then((r) => r.data),

//   getByEmployee: (employeeId, params = {}) =>
//     API.get(`/attendance/employee/${employeeId}`, { params }).then(
//       (r) => r.data,
//     ),

//   correct: (id, payload) =>
//     API.put(`/attendance/${id}/correct`, payload).then((r) => r.data),

//   // ── Shifts ─────────────────────────────────────────────────
//   getShifts: () => API.get("/attendance/shifts").then((r) => r.data),

//   createShift: (payload) =>
//     API.post("/attendance/shifts", payload).then((r) => r.data),

//   updateShift: (id, payload) =>
//     API.put(`/attendance/shifts/${id}`, payload).then((r) => r.data),
// };


// // src/api/service/attendanceApi.js
// import API from "../axios";

// // Helper to get user's local date string (YYYY-MM-DD)
// function getLocalDateStr() {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = String(now.getMonth() + 1).padStart(2, "0");
//   const day = String(now.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// }

// export const attendanceApi = {
//   clockIn: (payload = {}) =>
//     API.post("/attendance/clock-in", {
//       ...payload,
//       date: getLocalDateStr(), // Send user's local date
//     }).then((r) => r.data),

//   clockOut: () => API.post("/attendance/clock-out").then((r) => r.data),

//   getMyAttendance: (params = {}) =>
//     API.get("/attendance/me", {
//       params: {
//         ...params,
//         // If querying for today, send the user's local date
//         ...(params.date === "today" ? { date: getLocalDateStr() } : params),
//       },
//     }).then((r) => r.data),

//   startBreak: () => API.post("/attendance/break-start").then((r) => r.data),

//   endBreak: () => API.post("/attendance/break-end").then((r) => r.data),
//   // ── HR / Admin ─────────────────────────────────────────────
//   getAll: (params = {}) =>
//     API.get("/attendance", { params }).then((r) => r.data),

//   getToday: () => API.get("/attendance/today").then((r) => r.data),

//   getByEmployee: (employeeId, params = {}) =>
//     API.get(`/attendance/employee/${employeeId}`, { params }).then(
//       (r) => r.data,
//     ),

//   correct: (id, payload) =>
//     API.put(`/attendance/${id}/correct`, payload).then((r) => r.data),

//   // ── Shifts ─────────────────────────────────────────────────
//   getShifts: () => API.get("/attendance/shifts").then((r) => r.data),

//   createShift: (payload) =>
//     API.post("/attendance/shifts", payload).then((r) => r.data),

//   updateShift: (id, payload) =>
//     API.put(`/attendance/shifts/${id}`, payload).then((r) => r.data),

//   // ── Corrections ──────────────────────────────────────────────
//   // Matches GET/PUT /api/attendance/corrections* mounted in
//   // attendance.routes.js (handlers live in attendanceExtras.controller.js).
//   getCorrections: (params = {}) =>
//     API.get("/attendance/corrections", { params }).then((r) => r.data),

//   approveCorrection: (id) =>
//     API.put(`/attendance/corrections/${id}/approve`).then((r) => r.data),

//   rejectCorrection: (id, payload) =>
//     API.put(`/attendance/corrections/${id}/reject`, payload).then(
//       (r) => r.data,
//     ),

//   // ── Overtime ─────────────────────────────────────────────────
//   // Matches GET/PUT /api/attendance/overtime* mounted in
//   // attendance.routes.js (handlers live in attendanceExtras.controller.js).
//   getOvertime: (params = {}) =>
//     API.get("/attendance/overtime", { params }).then((r) => r.data),

//   approveOvertime: (id) =>
//     API.put(`/attendance/overtime/${id}/approve`).then((r) => r.data),

//   rejectOvertime: (id, payload) =>
//     API.put(`/attendance/overtime/${id}/reject`, payload).then(
//       (r) => r.data,
//     ),
// };


// src/api/service/attendanceApi.js
import API from "../axios";

// Helper to get user's local date string (YYYY-MM-DD)
function getLocalDateStr() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const attendanceApi = {
  clockIn: (payload = {}) =>
    API.post("/attendance/clock-in", {
      ...payload,
      date: getLocalDateStr(),
    }).then((r) => r.data),

  clockOut: () => API.post("/attendance/clock-out").then((r) => r.data),

  getMyAttendance: (params = {}) =>
    API.get("/attendance/me", {
      params: {
        ...params,
        ...(params.date === "today" ? { date: getLocalDateStr() } : params),
      },
    }).then((r) => r.data),

  startBreak: () => API.post("/attendance/break-start").then((r) => r.data),

  endBreak: () => API.post("/attendance/break-end").then((r) => r.data),

  // ── HR / Admin ─────────────────────────────────────────────
  getAll: (params = {}) =>
    API.get("/attendance", { params }).then((r) => r.data),

  getToday: () => API.get("/attendance/today").then((r) => r.data),

  getByEmployee: (employeeId, params = {}) =>
    API.get(`/attendance/employee/${employeeId}`, { params }).then(
      (r) => r.data,
    ),

  correct: (id, payload) =>
    API.put(`/attendance/${id}/correct`, payload).then((r) => r.data),

  // ── Shifts ─────────────────────────────────────────────────
  getShifts: () => API.get("/attendance/shifts").then((r) => r.data),

  createShift: (payload) =>
    API.post("/attendance/shifts", payload).then((r) => r.data),

  updateShift: (id, payload) =>
    API.put(`/attendance/shifts/${id}`, payload).then((r) => r.data),

  // deleteShift: (id) =>
  //   API.delete(`/attendance/shifts/${id}`).then((r) => r.data), // ← ADDED
  deleteShift: (id) =>
    API.delete(`/attendance/shifts/${id}`).then((r) => r.data),

  // ── Employees (for shift assignment picker) ────────────────
  getEmployees: (params = {}) =>
    API.get("/employees", { params }).then((r) => r.data), // ← ADDED

  // ── Corrections ──────────────────────────────────────────────
  getCorrections: (params = {}) =>
    API.get("/attendance/corrections", { params }).then((r) => r.data),

  approveCorrection: (id) =>
    API.put(`/attendance/corrections/${id}/approve`).then((r) => r.data),

  rejectCorrection: (id, payload) =>
    API.put(`/attendance/corrections/${id}/reject`, payload).then(
      (r) => r.data,
    ),

  // ── Overtime ─────────────────────────────────────────────────
  getOvertime: (params = {}) =>
    API.get("/attendance/overtime", { params }).then((r) => r.data),

  approveOvertime: (id) =>
    API.put(`/attendance/overtime/${id}/approve`).then((r) => r.data),

  rejectOvertime: (id, payload) =>
    API.put(`/attendance/overtime/${id}/reject`, payload).then((r) => r.data),
};