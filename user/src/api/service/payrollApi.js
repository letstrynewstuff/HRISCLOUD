

// // src/api/services/payrollApi.js
// import API from "../axios";

// // ─── Structures ───────────────────────────────────────────────

// export const getStructures = () =>
//   API.get("/payroll/structures").then((r) => r.data);

// export const createStructure = (payload) =>
//   API.post("/payroll/structures", payload).then((r) => r.data);

// export const updateStructure = (id, payload) =>
//   API.put(`/payroll/structures/${id}`, payload).then((r) => r.data);

// // ─── Deductions ───────────────────────────────────────────────

// export const getDeductions = (params = {}) =>
//   API.get("/payroll/deductions", { params }).then((r) => r.data);

// export const createDeduction = (payload) =>
//   API.post("/payroll/deductions", payload).then((r) => r.data);

// export const toggleDeduction = (id) =>
//   API.patch(`/payroll/deductions/${id}/toggle`).then((r) => r.data);

// export const updateDeduction = (id, payload) =>
//   API.put(`/payroll/deductions/${id}`, payload).then((r) => r.data);

// export const deleteDeduction = (id) =>
//   API.delete(`/payroll/deductions/${id}`).then((r) => r.data);

// // ─── Dashboard & history ──────────────────────────────────────

// export const getDashboard = () =>
//   API.get("/payroll/dashboard").then((r) => r.data);

// export const getHistory = (params = {}) =>
//   API.get("/payroll/history", { params }).then((r) => r.data);

// // ─── Payroll runs ─────────────────────────────────────────────

// export const listRuns = (params = {}) =>
//   API.get("/payroll/runs", { params }).then((r) => r.data);

// /**
//  * GET /payroll/runs/:id
//  * Returns: { run: {...}, records: [...], total: N }
//  * RunPayroll reads: full.run and full.records
//  */
// export const getRun = (id) =>
//   API.get(`/payroll/runs/${id}`).then((r) => r.data);

// /** POST /payroll/runs — creates a new payroll run */
// export const initRun = (payload) =>
//   API.post("/payroll/runs", payload).then((r) => r.data);

// /** POST /payroll/runs/:id/process — processes ALL active employees */
// export const processRun = (id) =>
//   API.post(`/payroll/runs/${id}/process`).then((r) => r.data);

// /** POST /payroll/runs/:runId/employees/:empId — single employee recalc */
// export const runForEmployee = (runId, empId, payload = {}) =>
//   API.post(`/payroll/runs/${runId}/employees/${empId}`, payload).then(
//     (r) => r.data,
//   );

// export const approveRun = (id) =>
//   API.post(`/payroll/runs/${id}/approve`).then((r) => r.data);

// export const markPaid = (id) =>
//   API.post(`/payroll/runs/${id}/mark-paid`).then((r) => r.data);

// // ─── Payslips ─────────────────────────────────────────────────

// /** HR: get any employee's payslip */
// export const getPayslip = (employeeId, month, year) =>
//   API.get(`/payroll/payslip/${employeeId}/${month}/${year}`).then(
//     (r) => r.data,
//   );

// /** Employee: get own payslip */
// export const getMyPayslip = (month, year) =>
//   API.get(`/payroll/payslip/me/${month}/${year}`).then((r) => r.data);

// /** Live preview without saving to DB */
// export const previewPayslip = (employeeId, payload) =>
//   API.post(`/payroll/preview/${employeeId}`, payload).then((r) => r.data);

// // ─── Payment file (CSV download) ──────────────────────────────

// /**
//  * GET /payroll/runs/:id/payment-file
//  *
//  * Returns the raw Blob so the caller controls the filename and
//  * can trigger the download at the right moment.
//  *
//  * Usage in RunPayroll:
//  *   const blob = await getPaymentFile(runId);
//  *   const url  = URL.createObjectURL(blob);
//  *   const a    = document.createElement("a");
//  *   a.href     = url;
//  *   a.download = `payroll-transfer-${year}-${month}.csv`;
//  *   a.click();
//  *   URL.revokeObjectURL(url);
//  */
// // export const getPaymentFile = (id) =>
// //   API.get(`/payroll/runs/${id}/payment-file`, { responseType: "blob" }).then(
// //     (r) => r.data, // r.data is the Blob when responseType is "blob"
// //   );
// export async function getPaymentFile(runId, format = "csv") {
//   const response = await API.get(
//     `/payroll/runs/${runId}/export?format=${format}`,
//     { responseType: "blob" },
//   );
//   return response.data;
// }


// // src/api/services/payrollApi.js
// import API from "../axios";

// // ─── Structures ───────────────────────────────────────────────

// export const getStructures = () =>
//   API.get("/payroll/structures").then((r) => r.data);

// export const createStructure = (payload) =>
//   API.post("/payroll/structures", payload).then((r) => r.data);

// export const updateStructure = (id, payload) =>
//   API.put(`/payroll/structures/${id}`, payload).then((r) => r.data);

// // ─── Deductions ───────────────────────────────────────────────

// export const getDeductions = (params = {}) =>
//   API.get("/payroll/deductions", { params }).then((r) => r.data);

// export const createDeduction = (payload) =>
//   API.post("/payroll/deductions", payload).then((r) => r.data);

// export const toggleDeduction = (id) =>
//   API.patch(`/payroll/deductions/${id}/toggle`).then((r) => r.data);

// export const updateDeduction = (id, payload) =>
//   API.put(`/payroll/deductions/${id}`, payload).then((r) => r.data);

// export const deleteDeduction = (id) =>
//   API.delete(`/payroll/deductions/${id}`).then((r) => r.data);

// // ─── Dashboard & history ──────────────────────────────────────

// export const getDashboard = () =>
//   API.get("/payroll/dashboard").then((r) => r.data);

// export const getHistory = (params = {}) =>
//   API.get("/payroll/history", { params }).then((r) => r.data);

// // ─── Payroll runs ─────────────────────────────────────────────

// export const listRuns = (params = {}) =>
//   API.get("/payroll/runs", { params }).then((r) => r.data);

// /**
//  * GET /payroll/runs/:id
//  * Returns: { run: {...}, records: [...], total: N }
//  * RunPayroll reads: full.run and full.records
//  */
// export const getRun = (id) =>
//   API.get(`/payroll/runs/${id}`).then((r) => r.data);

// /** POST /payroll/runs — creates a new payroll run */
// export const initRun = (payload) =>
//   API.post("/payroll/runs", payload).then((r) => r.data);

// /**
//  * POST /payroll/runs/:id/process — processes ALL active employees
//  *
//  * This can take a while for larger companies (each employee requires
//  * several DB round trips). The global axios instance times out after
//  * 15s, which is too short for this endpoint — override it here with a
//  * generous 120s timeout so the request has a real chance to complete
//  * before the client gives up.
//  *
//  * Even if this 120s timeout is hit, the backend keeps running (it does
//  * not abort the in-flight transaction), so the run may still complete
//  * server-side — the caller can detect this via `error.isTimeout` and
//  * poll getRun(id) to check the actual status.
//  */
// export const processRun = (id) =>
//   API.post(`/payroll/runs/${id}/process`, null, { timeout: 120000 }).then(
//     (r) => r.data,
//   );

// /** POST /payroll/runs/:runId/employees/:empId — single employee recalc */
// export const runForEmployee = (runId, empId, payload = {}) =>
//   API.post(`/payroll/runs/${runId}/employees/${empId}`, payload).then(
//     (r) => r.data,
//   );

// export const approveRun = (id) =>
//   API.post(`/payroll/runs/${id}/approve`).then((r) => r.data);

// export const markPaid = (id) =>
//   API.post(`/payroll/runs/${id}/mark-paid`).then((r) => r.data);

// // ─── Payslips ─────────────────────────────────────────────────

// /** HR: get any employee's payslip */
// export const getPayslip = (employeeId, month, year) =>
//   API.get(`/payroll/payslip/${employeeId}/${month}/${year}`).then(
//     (r) => r.data,
//   );

// /** Employee: get own payslip */
// export const getMyPayslip = (month, year) =>
//   API.get(`/payroll/payslip/me/${month}/${year}`).then((r) => r.data);

// /** Live preview without saving to DB */
// export const previewPayslip = (employeeId, payload) =>
//   API.post(`/payroll/preview/${employeeId}`, payload).then((r) => r.data);

// // ─── Payment file (CSV download) ──────────────────────────────

// /**
//  * GET /payroll/runs/:id/payment-file
//  *
//  * Returns the raw Blob so the caller controls the filename and
//  * can trigger the download at the right moment.
//  *
//  * Usage in RunPayroll:
//  *   const blob = await getPaymentFile(runId);
//  *   const url  = URL.createObjectURL(blob);
//  *   const a    = document.createElement("a");
//  *   a.href     = url;
//  *   a.download = `payroll-transfer-${year}-${month}.csv`;
//  *   a.click();
//  *   URL.revokeObjectURL(url);
//  */
// // export const getPaymentFile = (id) =>
// //   API.get(`/payroll/runs/${id}/payment-file`, { responseType: "blob" }).then(
// //     (r) => r.data, // r.data is the Blob when responseType is "blob"
// //   );
// export async function getPaymentFile(runId, format = "csv") {
//   const response = await API.get(
//     `/payroll/runs/${runId}/export?format=${format}`,
//     { responseType: "blob" },
//   );
//   return response.data;
// }


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