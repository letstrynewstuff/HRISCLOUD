// src/api/services/performanceApi.js
//
// All performance, goals, and PIP API calls.
// Uses same axios instance (with Bearer token interceptor) as other APIs.

import API from "../axios";

// ─── Performance Scores ───────────────────────────────────────

/**
 * Calculate and store performance score for one employee.
 * POST /api/performance/calculate/:employeeId
 * Body: { period: "2025-01" }
 */
export const calculateScore = (employeeId, period) =>
  API.post(`/performance/calculate/${employeeId}`, { period }).then(
    (r) => r.data,
  );

/**
 * Get full score history for one employee.
 * GET /api/performance/scores/:employeeId
 */
export const getEmployeeScores = (employeeId) =>
  API.get(`/performance/scores/${employeeId}`).then((r) => r.data);

// ─── Dashboard ────────────────────────────────────────────────

/**
 * Get company-wide performance dashboard.
 * GET /api/performance/dashboard?period=2025-01&department=uuid
 */
export const getDashboard = (params = {}) =>
  API.get("/performance/dashboard", { params }).then((r) => r.data);

// ─── Trends ───────────────────────────────────────────────────

/**
 * Get month-over-month trend for one employee.
 * GET /api/performance/trends/:employeeId
 */
export const getTrends = (employeeId) =>
  API.get(`/performance/trends/${employeeId}`).then((r) => r.data);

// ─── Insights ─────────────────────────────────────────────────

/**
 * Get auto-generated insights for one employee.
 * GET /api/performance/insights/:employeeId
 */
export const getInsights = (employeeId) =>
  API.get(`/performance/insights/${employeeId}`).then((r) => r.data);

// ─── Top Performers ───────────────────────────────────────────

/**
 * Get ranked top performers.
 * GET /api/performance/top-performers?period=2025-01&limit=10
 */
export const getTopPerformers = (params = {}) =>
  API.get("/performance/top-performers", { params }).then((r) => r.data);

// ─── Review Cycles ────────────────────────────────────────────

/**
 * GET /api/performance/cycles
 */
export const getCycles = () =>
  API.get("/performance/cycles").then((r) => r.data);

/**
 * POST /api/performance/cycles
 * Body: { name, periodStart, periodEnd, status }
 */
export const createCycle = (payload) =>
  API.post("/performance/cycles", payload).then((r) => r.data);

// ─── Reviews ─────────────────────────────────────────────────

/**
 * GET /api/performance/reviews?cycle=&status=&employeeId=
 */
export const getAllReviews = (params = {}) =>
  API.get("/performance/reviews", { params }).then((r) => r.data);

/**
 * GET /api/performance/reviews/me
 */
export const getMyReviews = () =>
  API.get("/performance/reviews/me").then((r) => r.data);

/**
 * PUT /api/performance/reviews/:id/self
 * Body: { sections, overallComment }
 */
export const submitSelfAssessment = (id, payload) =>
  API.put(`/performance/reviews/${id}/self`, payload).then((r) => r.data);

/**
 * PUT /api/performance/reviews/:id/manager
 * Body: { sections, managerComment, finalRating }
 */
export const submitManagerAssessment = (id, payload) =>
  API.put(`/performance/reviews/${id}/manager`, payload).then((r) => r.data);

/**
 * PUT /api/performance/reviews/:id/finalize
 */
export const finalizeReview = (id, payload) =>
  API.put(`/performance/reviews/${id}/finalize`, payload).then((r) => r.data);

// ─── Goals / KPIs ─────────────────────────────────────────────

/**
 * GET /api/goals?employeeId=&cycle=&status=&department=
 */
export const listGoals = (params = {}) =>
  API.get("/goals", { params }).then((r) => r.data);

/**
 * GET /api/goals/me?cycle=&status=
 */
export const getMyGoals = (params = {}) =>
  API.get("/goals/me", { params }).then((r) => r.data);

/**
 * POST /api/goals
 * Body: { title, description, metric, target, dueDate, cycle, employeeId? }
 */
export const createGoal = (payload) =>
  API.post("/goals", payload).then((r) => r.data);

/**
 * PUT /api/goals/:id
 */
export const updateGoal = (id, payload) =>
  API.put(`/goals/${id}`, payload).then((r) => r.data);

/**
 * POST /api/goals/:id/assign
 * Body: { employeeIds: string[] }
 */
export const assignGoal = (id, employeeIds) =>
  API.post(`/goals/${id}/assign`, { employeeIds }).then((r) => r.data);

/**
 * POST /api/goals/:id/progress
 * Body: { progress: 0–100, achievedValue? }
 */
export const updateGoalProgress = (id, progress, achievedValue) =>
  API.post(`/goals/${id}/progress`, { progress, achievedValue }).then(
    (r) => r.data,
  );

// ─── PIP ─────────────────────────────────────────────────────

/**
 * GET /api/performance/pip?status=active
 */
export const listPIPs = (params = {}) =>
  API.get("/performance/pip", { params }).then((r) => r.data);

/**
 * POST /api/performance/pip/:employeeId
 * Body: { reason, reviewDate, period, goals[] }
 */
export const createPIP = (employeeId, payload) =>
  API.post(`/performance/pip/${employeeId}`, payload).then((r) => r.data);

// // src/api/service/performanceApi.js
// import API from "../axios";

// export const performanceApi = {
//   // ─── Performance Scores ───────────────────────────────────────
//   calculateScore: (employeeId, period) =>
//     API.post(`/performance/calculate/${employeeId}`, { period }).then((r) => r.data),

//   getEmployeeScores: (employeeId) =>
//     API.get(`/performance/scores/${employeeId}`).then((r) => r.data),

//   // ─── Dashboard ────────────────────────────────────────────────
//   getDashboard: (params = {}) =>
//     API.get("/performance/dashboard", { params }).then((r) => r.data),

//   // ─── Trends ───────────────────────────────────────────────────
//   getTrends: (employeeId) =>
//     API.get(`/performance/trends/${employeeId}`).then((r) => r.data),

//   // ─── Insights ─────────────────────────────────────────────────
//   getInsights: (employeeId) =>
//     API.get(`/performance/insights/${employeeId}`).then((r) => r.data),

//   // ─── Top Performers ───────────────────────────────────────────
//   getTopPerformers: (params = {}) =>
//     API.get("/performance/top-performers", { params }).then((r) => r.data),

//   // ─── Review Cycles ────────────────────────────────────────────
//   getCycles: () =>
//     API.get("/performance/cycles").then((r) => r.data),

//   createCycle: (payload) =>
//     API.post("/performance/cycles", payload).then((r) => r.data),

//   // ─── Reviews ─────────────────────────────────────────────────
//   getAllReviews: (params = {}) =>
//     API.get("/performance/reviews", { params }).then((r) => r.data),

//   getMyReviews: () =>
//     API.get("/performance/reviews/me").then((r) => r.data),

//   submitSelfAssessment: (id, payload) =>
//     API.put(`/performance/reviews/${id}/self`, payload).then((r) => r.data),

//   submitManagerAssessment: (id, payload) =>
//     API.put(`/performance/reviews/${id}/manager`, payload).then((r) => r.data),

//   finalizeReview: (id, payload) =>
//     API.put(`/performance/reviews/${id}/finalize`, payload).then((r) => r.data),

//   // ─── Goals / KPIs ─────────────────────────────────────────────
//   listGoals: (params = {}) =>
//     API.get("/goals", { params }).then((r) => r.data),

//   getMyGoals: (params = {}) =>
//     API.get("/goals/me", { params }).then((r) => r.data),

//   createGoal: (payload) =>
//     API.post("/goals", payload).then((r) => r.data),

//   updateGoal: (id, payload) =>
//     API.put(`/goals/${id}`, payload).then((r) => r.data),

//   assignGoal: (id, employeeIds) =>
//     API.post(`/goals/${id}/assign`, { employeeIds }).then((r) => r.data),

//   updateGoalProgress: (id, progress, achievedValue) =>
//     API.post(`/goals/${id}/progress`, { progress, achievedValue }).then((r) => r.data),

//   // ─── PIP ─────────────────────────────────────────────────────
//   listPIPs: (params = {}) =>
//     API.get("/performance/pip", { params }).then((r) => r.data),

//   createPIP: (employeeId, payload) =>
//     API.post(`/performance/pip/${employeeId}`, payload).then((r) => r.data),
// };