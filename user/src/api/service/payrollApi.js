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

export const getRun = (id) =>
  API.get(`/payroll/runs/${id}`).then((r) => r.data);

/** Creates a new payroll run — body: { month, year, notes? } */
export const initRun = (payload) =>
  API.post("/payroll/runs", payload).then((r) => r.data);

/** Processes payroll for ALL active employees in one run */
export const processRun = (id) =>
  API.post(`/payroll/runs/${id}/process`).then((r) => r.data);

/** Run / recalculate payroll for a single employee in a run */
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

/** Live preview without saving */
export const previewPayslip = (employeeId, payload) =>
  API.post(`/payroll/preview/${employeeId}`, payload).then((r) => r.data);


/** * Generates and downloads the bank payment file (CSV) for a run 
 */
export const getPaymentFile = (id) =>
  API.get(`/payroll/runs/${id}/payment-file`, { responseType: "blob" })
    .then((response) => {
      // Create a download link for the browser
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Payment_File_Run_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    });