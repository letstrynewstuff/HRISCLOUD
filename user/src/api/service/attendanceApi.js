// import API from "../axios";

// /**
//  * ─── EMPLOYEE ACTIONS ───
//  */

// /**
//  * Clock In
//  * @param {Object} data - { lat, lng, selfie (File) }
//  * Since this contains a file (selfie), we use FormData
//  */
// export const clockIn = async (data) => {
//   const formData = new FormData();
//   if (data.lat) formData.append("lat", data.lat);
//   if (data.lng) formData.append("lng", data.lng);
//   if (data.selfie) formData.append("selfie", data.selfie);

//   const response = await API.post("/attendance/clock-in", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
//   return response.data;
// };

// /**
//  * Clock Out
//  * No body required as the backend identifies the user via JWT
//  */
// export const clockOut = async () => {
//   const response = await API.post("/attendance/clock-out");
//   return response.data;
// };

// /**
//  * Get current employee's attendance history
//  * @param {Object} params - { startDate, endDate, status, page, limit }
//  */
// export const getMyAttendance = async (params) => {
//   const response = await API.get("/attendance/me", { params });
//   return response.data;
// };

// /**
//  * ─── HR / ADMIN ACTIONS ──────────────────────────
//  */

// /**
//  * Get real-time snapshot for today (present/late/absent counts)
//  */
// export const getTodaySnapshot = async () => {
//   const response = await API.get("/attendance/today");
//   return response.data;
// };

// /**
//  * Get all attendance records (with filtering)
//  * @param {Object} params - { date, status, departmentId, search, page, etc. }
//  */
// export const getAllAttendance = async (params) => {
//   const response = await API.get("/attendance", { params });
//   return response.data;
// };

// /**
//  * Get specific employee's history (HR View)
//  */
// export const getEmployeeAttendanceById = async (employeeId, params) => {
//   const response = await API.get(`/attendance/employee/${employeeId}`, {
//     params,
//   });
//   return response.data;
// };

// /**
//  * Correct an attendance record
//  * @param {string} id - Attendance record ID
//  * @param {Object} data - { clockIn, clockOut, status, editReason, etc. }
//  */
// export const correctAttendance = async (id, data) => {
//   const response = await API.put(`/attendance/${id}/correct`, data);
//   return response.data;
// };

// /**
//  * ─── SHIFT MANAGEMENT ──────────────────────────
//  */

// export const getShifts = async () => {
//   const response = await API.get("/attendance/shifts");
//   return response.data;
// };

// export const createShift = async (data) => {
//   const response = await API.post("/attendance/shifts", data);
//   return response.data;
// };

// export const updateShift = async (id, data) => {
//   const response = await API.put(`/attendance/shifts/${id}`, data);
//   return response.data;
// };

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