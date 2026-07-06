// src/api/services/employeeApi.js
import API from "../axios";

/* ───────────────── EMPLOYEES ───────────────── */

export const getEmployees = async (params = {}) => {
  const { data } = await API.get("/employees", { params });
  return data;
};

export const getEmployeeById = async (id) => {
  const { data } = await API.get(`/employees/${id}`);
  return data;
};

export const getEmployeeHistory = async (id) => {
  const { data } = await API.get(`/employees/${id}/history`);
  return data;
};

export const createEmployee = async (payload) => {
  const { data } = await API.post("/employees", payload);
  return data;
};

export const updateEmployee = async (id, payload) => {
  const { data } = await API.put(`/employees/${id}`, payload);
  return data;
};

export const deleteEmployee = async (id, reason) => {
  const { data } = await API.delete(`/employees/${id}`, {
    data: { reason },
  });
  return data;
};

/* ───────────────── OFFBOARDING (FIXED FLOW) ───────────────── */

// ✅ STEP 1
export const startOffboarding = async (id, payload) => {
  const { data } = await API.post(`/employees/${id}/offboard`, payload);
  return data;
};

// ✅ STEP 2
export const toggleOffboardingTask = async (employeeId, taskId) => {
  const { data } = await API.patch(
    `/employees/${employeeId}/offboard/tasks/${taskId}`,
  );
  return data;
};

// ✅ STEP 3
export const completeOffboarding = async (id, payload = {}) => {
  const { data } = await API.post(
    `/employees/${id}/offboard/complete`,
    payload,
  );
  return data;
};

// ✅ fetch checklist
export const getOffboardingTasks = async (id) => {
  const { data } = await API.get(`/employees/${id}/offboard/tasks`);
  return data;
};

// ✅ list offboarding employees
export const getOffboardingList = async () => {
  const { data } = await API.get(`/employees/offboarding`);
  return data;
};

/* ───────────────── BULK IMPORT ───────────────── */

export const bulkImportEmployees = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await API.post("/employees/bulk-import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};

/* ───────────────── INVITES ───────────────── */

export const inviteEmployees = async (employeeIds) => {
  const { data } = await API.post("/employees/invite", {
    employeeIds,
  });
  return data;
};

/* ───────────────── SELF ───────────────── */

export const getMyProfile = async () => {
  const { data } = await API.get("/employees/me");
  return data;
};

export const requestProfileChange = async (payload) => {
  const { data } = await API.put("/employees/me", payload);
  return data;
};

/* ───────────────── ORG ───────────────── */

export const getOrgChart = async () => {
  const { data } = await API.get("/employees/org-chart");
  return data;
};
