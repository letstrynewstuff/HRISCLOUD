
// src/api/service/payrollApi.js
//
// All null POST bodies have been replaced with explicit {} so axios
// never serialises a null data argument to the string "null".
// The axios.js interceptor also guards this globally, but explicit
// {} here is the right thing to do regardless.

import API from "../axios";

// ─── Structures ───────────────────────────────────────────────

export const getStructures = () =>
  API.get("/payroll/structures").then((r) => r.data);

export const createStructure = (payload) =>
  API.post("/payroll/structures", payload).then((r) => r.data);

export const updateStructure = (id, payload) =>
  API.put(`/payroll/structures/${id}`, payload).then((r) => r.data);

// ─── Deductions ───────────────────────────────────────────────

export const getDeductions = (params = {}) =>
  API.get("/payroll/deductions", { params }).then((r) => r.data);

export const createDeduction = (payload) =>
  API.post("/payroll/deductions", payload).then((r) => r.data);

export const toggleDeduction = (id) =>
  // PATCH with no body — send {} not null
  API.patch(`/payroll/deductions/${id}/toggle`, {}).then((r) => r.data);

export const updateDeduction = (id, payload) =>
  API.put(`/payroll/deductions/${id}`, payload).then((r) => r.data);

export const deleteDeduction = (id) =>
  API.delete(`/payroll/deductions/${id}`).then((r) => r.data);

// ─── Dashboard & history ──────────────────────────────────────

export const getDashboard = () =>
  API.get("/payroll/dashboard").then((r) => r.data);

export const getHistory = (params = {}) =>
  API.get("/payroll/history", { params }).then((r) => r.data);

// ─── Payroll runs ─────────────────────────────────────────────

export const listRuns = (params = {}) =>
  API.get("/payroll/runs", { params }).then((r) => r.data);

/**
 * GET /payroll/runs/:id
 * Returns: { run: {...}, records: [...], total: N }
 */
export const getRun = (id) =>
  API.get(`/payroll/runs/${id}`).then((r) => r.data);

/**
 * POST /payroll/runs — initialise a new payroll run.
 *
 * Explicitly builds the body object and never passes null so axios
 * does not serialise it as the string "null".
 *
 * @param {{ month: number, year: number, notes?: string }} payload
 */
export const initRun = (payload) => {
  // Build a clean, guaranteed-non-null body
  const body = {
    month: Number(payload?.month),
    year:  Number(payload?.year),
  };
  // Only include notes when the caller provided a non-empty string
  const notes = (payload?.notes ?? "").trim();
  if (notes) body.notes = notes;

  return API.post("/payroll/runs", body).then((r) => r.data);
};

/**
 * POST /payroll/runs/:id/process — processes ALL active employees.
 *
 * Can take a while for large teams.  We extend the per-request timeout
 * to 120 s.  Even if that expires, the backend keeps running — the
 * caller can detect a timeout via `error.isTimeout` and poll getRun(id)
 * to check whether the run actually finished.
 */
export const processRun = (id) =>
  // ✅ {} not null — axios must not send the string "null"
  API.post(`/payroll/runs/${id}/process`, {}, { timeout: 120_000 }).then(
    (r) => r.data,
  );

/** POST /payroll/runs/:runId/employees/:empId — single-employee recalc */
export const runForEmployee = (runId, empId, payload = {}) =>
  API.post(`/payroll/runs/${runId}/employees/${empId}`, payload).then(
    (r) => r.data,
  );

/** POST /payroll/runs/:id/approve */
export const approveRun = (id) =>
  // ✅ {} not null/undefined
  API.post(`/payroll/runs/${id}/approve`, {}).then((r) => r.data);

/** POST /payroll/runs/:id/mark-paid */
export const markPaid = (id) =>
  // ✅ {} not null/undefined
  API.post(`/payroll/runs/${id}/mark-paid`, {}).then((r) => r.data);

// ─── Payslips ─────────────────────────────────────────────────

/** HR: get any employee's payslip */
export const getPayslip = (employeeId, month, year) =>
  API.get(`/payroll/payslip/${employeeId}/${month}/${year}`).then(
    (r) => r.data,
  );

/** Employee: get own payslip */
export const getMyPayslip = (month, year) =>
  API.get(`/payroll/payslip/me/${month}/${year}`).then((r) => r.data);

/** Live preview without saving to DB */
export const previewPayslip = (employeeId, payload) =>
  API.post(`/payroll/preview/${employeeId}`, payload).then((r) => r.data);

// ─── Payment / export file (Blob download) ────────────────────

/**
 * GET /payroll/runs/:id/export?format=csv|pdf
 *
 * Returns the raw Blob — the caller names the file and triggers the
 * download at the right moment.
 *
 * Usage:
 *   const blob = await getPaymentFile(runId, "csv");
 *   const url  = URL.createObjectURL(blob);
 *   const a    = document.createElement("a");
 *   a.href     = url;
 *   a.download = `payroll-${year}-${month}.csv`;
 *   a.click();
 *   URL.revokeObjectURL(url);
 */
export const getPaymentFile = (runId, format = "csv") =>
  API.get(`/payroll/runs/${runId}/export?format=${format}`, {
    responseType: "blob",
  }).then((r) => r.data);