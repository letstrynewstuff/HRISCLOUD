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

// export const getRun = (id) =>
//   API.get(`/payroll/runs/${id}`).then((r) => r.data);

// /** Creates a new payroll run — body: { month, year, notes? } */
// export const initRun = (payload) =>
//   API.post("/payroll/runs", payload).then((r) => r.data);

// /** Processes payroll for ALL active employees in one run */
// export const processRun = (id) =>
//   API.post(`/payroll/runs/${id}/process`).then((r) => r.data);

// /** Run / recalculate payroll for a single employee in a run */
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

// /** Live preview without saving */
// export const previewPayslip = (employeeId, payload) =>
//   API.post(`/payroll/preview/${employeeId}`, payload).then((r) => r.data);

// /** * Generates and downloads the bank payment file (CSV) for a run
//  */
// export const getPaymentFile = (id) =>
//   API.get(`/payroll/runs/${id}/payment-file`, { responseType: "blob" })
//     .then((response) => {
//       // Create a download link for the browser
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", `Payment_File_Run_${id}.csv`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     });
//     // 1. getRun — must return the raw axios response so RunPayroll can read
// //    { run, records } directly. If your API instance unwraps .data already,
// //    adjust as noted.
// //
// // export const getRun = (id) =>
// //   API.get(`/payroll/runs/${id}`).then((r) => r.data);
// //   r.data = { run: {...}, records: [...], total: N }
// //   RunPayroll reads:  const full = await getRun(id)
// //                      const run  = full.run
// //                      const recs = full.records

// // ────────────────────────────────────────────────────────────────────────────
// // 2. getPaymentFile — MUST use responseType: 'blob' so the browser can
// //    trigger a file download. Replace the old version entirely.
// //
// // export const getPaymentFile = (runId) =>
// //   API.get(`/payroll/runs/${runId}/payment-file`, {
// //     responseType: "blob",            // ← critical — returns binary CSV data
// //   }).then((r) => r.data);            // r.data is the Blob
// //

// src/api/services/payrollApi.js
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
  API.patch(`/payroll/deductions/${id}/toggle`).then((r) => r.data);

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
 * RunPayroll reads: full.run and full.records
 */
export const getRun = (id) =>
  API.get(`/payroll/runs/${id}`).then((r) => r.data);

/** POST /payroll/runs — creates a new payroll run */
export const initRun = (payload) =>
  API.post("/payroll/runs", payload).then((r) => r.data);

/** POST /payroll/runs/:id/process — processes ALL active employees */
export const processRun = (id) =>
  API.post(`/payroll/runs/${id}/process`).then((r) => r.data);

/** POST /payroll/runs/:runId/employees/:empId — single employee recalc */
export const runForEmployee = (runId, empId, payload = {}) =>
  API.post(`/payroll/runs/${runId}/employees/${empId}`, payload).then(
    (r) => r.data,
  );

export const approveRun = (id) =>
  API.post(`/payroll/runs/${id}/approve`).then((r) => r.data);

export const markPaid = (id) =>
  API.post(`/payroll/runs/${id}/mark-paid`).then((r) => r.data);

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

// ─── Payment file (CSV download) ──────────────────────────────

/**
 * GET /payroll/runs/:id/payment-file
 *
 * Returns the raw Blob so the caller controls the filename and
 * can trigger the download at the right moment.
 *
 * Usage in RunPayroll:
 *   const blob = await getPaymentFile(runId);
 *   const url  = URL.createObjectURL(blob);
 *   const a    = document.createElement("a");
 *   a.href     = url;
 *   a.download = `payroll-transfer-${year}-${month}.csv`;
 *   a.click();
 *   URL.revokeObjectURL(url);
 */
// export const getPaymentFile = (id) =>
//   API.get(`/payroll/runs/${id}/payment-file`, { responseType: "blob" }).then(
//     (r) => r.data, // r.data is the Blob when responseType is "blob"
//   );
export async function getPaymentFile(runId, format = "csv") {
  const response = await API.get(
    `/payroll/runs/${runId}/export?format=${format}`,
    { responseType: "blob" },
  );
  return response.data;
}