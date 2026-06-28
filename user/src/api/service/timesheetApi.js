// src/api/service/timesheetApi.js
//
// Covers all timesheet endpoints — employee side + HR admin side.
// Follows the same pattern as authApi.js: named method objects,
// every method returns r.data (unwrapped), params passed as objects.

import API from "../axios";

// ════════════════════════════════════════════════════════════════
// EMPLOYEE API
// All scoped to the authenticated user's own entries.
// ════════════════════════════════════════════════════════════════
export const timesheetApi = {
  // ── POST /timesheets/entries ──────────────────────────────
  // Create a new Draft entry.
  // payload: { entryDate, startTime, endTime, description, projectTag? }
  createEntry: (payload) =>
    API.post("/timesheets/entries", payload).then((r) => r.data),

  // ── PUT /timesheets/entries/:id ───────────────────────────
  // Update a Draft or Rejected entry.
  // payload: { entryDate, startTime, endTime, description, projectTag? }
  updateEntry: (id, payload) =>
    API.put(`/timesheets/entries/${id}`, payload).then((r) => r.data),

  // ── DELETE /timesheets/entries/:id ────────────────────────
  // Delete a Draft entry only.
  deleteEntry: (id) =>
    API.delete(`/timesheets/entries/${id}`).then((r) => r.data),

  // ── POST /timesheets/entries/submit ───────────────────────
  // Submit one or more Draft entries for approval.
  //
  // Option A — by IDs:
  //   submitEntries({ entryIds: [1, 2, 3] })
  //
  // Option B — by date range (submits all Drafts in range):
  //   submitEntries({ startDate: "2024-03-11", endDate: "2024-03-15" })
  submitEntries: (payload) =>
    API.post("/timesheets/entries/submit", payload).then((r) => r.data),

  // ── GET /timesheets/entries/my ────────────────────────────
  // Returns the logged-in employee's entries.
  // params: { startDate?, endDate?, status? }
  // Default range: current week (applied server-side when omitted).
  getMyEntries: (params = {}) =>
    API.get("/timesheets/entries/my", { params }).then((r) => r.data),

  // ── GET /timesheets/entries/my/summary ────────────────────
  // Returns total hours + status counts + daily breakdown.
  // params: { startDate?, endDate? }
  getMySummary: (params = {}) =>
    API.get("/timesheets/entries/my/summary", { params }).then((r) => r.data),

  // ── GET /timesheets/entries/:id ───────────────────────────
  // Returns a single entry. 403 if not the owner.
  getEntry: (id) => API.get(`/timesheets/entries/${id}`).then((r) => r.data),
};

// ════════════════════════════════════════════════════════════════
// ADMIN API
// Requires hr_admin or super_admin role.
// ════════════════════════════════════════════════════════════════
export const timesheetAdminApi = {
  // ── GET /timesheets/admin/entries ─────────────────────────
  // All entries company-wide with pagination + filters.
  // params: { startDate?, endDate?, employeeId?, departmentId?,
  //           status?, search?, page?, limit? }
  getAllEntries: (params = {}) =>
    API.get("/timesheets/admin/entries", { params }).then((r) => r.data),

  // ── GET /timesheets/admin/pending ─────────────────────────
  // Submitted entries grouped by employee.
  getPendingApprovals: () =>
    API.get("/timesheets/admin/pending").then((r) => r.data),

  // ── GET /timesheets/admin/entries/:id ─────────────────────
  // Full entry detail including employee name, department, job title.
  getEntry: (id) =>
    API.get(`/timesheets/admin/entries/${id}`).then((r) => r.data),

  // ── POST /timesheets/admin/entries/:id/approve ────────────
  // Approve a single Submitted entry.
  approveEntry: (id) =>
    API.post(`/timesheets/admin/entries/${id}/approve`).then((r) => r.data),

  // ── POST /timesheets/admin/entries/approve-bulk ───────────
  // Approve multiple entries in one transaction.
  // payload: { entryIds: [1, 2, 3] }
  // Returns: { approved: [...], skipped: [{ id, reason }] }
  approveBulk: (entryIds) =>
    API.post("/timesheets/admin/entries/approve-bulk", { entryIds }).then(
      (r) => r.data,
    ),

  // ── POST /timesheets/admin/entries/:id/reject ─────────────
  // Reject a Submitted entry. Employee can then edit and resubmit.
  // payload: { rejectionReason: "..." }
  rejectEntry: (id, rejectionReason) =>
    API.post(`/timesheets/admin/entries/${id}/reject`, {
      rejectionReason,
    }).then((r) => r.data),

  // ── GET /timesheets/admin/summary ─────────────────────────
  // Company-wide hours summary: totals, per-department, per-employee,
  // zero-entry employees (visibility gap flag).
  // params: { startDate?, endDate? }
  getCompanySummary: (params = {}) =>
    API.get("/timesheets/admin/summary", { params }).then((r) => r.data),

  // ── GET /timesheets/admin/employees/:employeeId/entries ───
  // Full timesheet history for one employee (performance review context).
  // params: { startDate?, endDate?, status? }
  getEmployeeHistory: (employeeId, params = {}) =>
    API.get(`/timesheets/admin/employees/${employeeId}/entries`, {
      params,
    }).then((r) => r.data),

  // ── GET /timesheets/admin/export ─────────────────────────
  // Triggers a CSV file download. Uses responseType: "blob" so axios
  // receives the raw binary and the caller can create an object URL.
  //
  // Usage:
  //   const blob = await timesheetAdminApi.exportCSV({ startDate, endDate });
  //   const url  = URL.createObjectURL(blob);
  //   const a    = document.createElement("a");
  //   a.href     = url;
  //   a.download = `timesheets-${startDate}-to-${endDate}.csv`;
  //   a.click();
  //   URL.revokeObjectURL(url);
  //
  // params: { startDate, endDate, employeeId?, departmentId? }
  exportCSV: (params = {}) =>
    API.get("/timesheets/admin/export", {
      params,
      responseType: "blob",
    }).then((r) => r.data),
};
