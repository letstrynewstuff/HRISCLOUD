// import API from "../axios";

// // AUTH
// export const superAdminLoginApi = (data) =>
//   API.post("/super-admin/auth/login", data);

// // COMPANIES
// export const getAllCompaniesApi = (params) =>
//   API.get("/super-admin/companies", { params });

// export const createCompanyApi = (data) =>
//   API.post("/super-admin/companies", data);

// export const approveCompanyApi = (id) =>
//   API.patch(`/super-admin/companies/${id}/approve`);

// export const suspendCompanyApi = (id) =>
//   API.patch(`/super-admin/companies/${id}/suspend`);

// export const deleteCompanyApi = (id) =>
//   API.delete(`/super-admin/companies/${id}`);

// // USERS
// export const getAllUsersApi = (params) =>
//   API.get("/super-admin/users", { params });

// export const disableUserApi = (id) =>
//   API.patch(`/super-admin/users/${id}/disable`);

// export const resetUserPasswordApi = (id) =>
//   API.patch(`/super-admin/users/${id}/reset-password`);

// // PLANS
// export const getPlansApi = () => API.get("/super-admin/plans");

// export const createPlanApi = (data) => API.post("/super-admin/plans", data);

// export const assignPlanApi = (companyId, planId) =>
//   API.patch(`/super-admin/companies/${companyId}/plan`, { planId });

// // BILLING
// export const getSubscriptionsApi = (params) =>
//   API.get("/super-admin/subscriptions", { params });

// export const getPaymentsApi = (params) =>
//   API.get("/super-admin/payments", { params });

// export const verifyPaymentApi = (data) =>
//   API.post("/super-admin/payments/verify-paystack", data);

// // ANALYTICS
// export const getAnalyticsApi = () => API.get("/super-admin/analytics");

// // SETTINGS
// export const getPlatformSettingsApi = () => API.get("/super-admin/settings");

// export const updatePlatformSettingsApi = (data) =>
//   API.patch("/super-admin/settings", data);

// // SYSTEM
// export const getSystemHealthApi = () => API.get("/super-admin/system/health");

// export const getErrorLogsApi = () => API.get("/super-admin/logs");

// // AUDIT
// export const getAuditLogsApi = (params) =>
//   API.get("/super-admin/audit-logs", { params });

// // import API from "../axios";

// // // AUTH
// // export const superAdminLoginApi = (data) =>
// //   API.post("/super-admin/auth/login", data);

// // // COMPANIES
// // export const getAllCompaniesApi = (params) =>
// //   API.get("/super-admin/companies", { params });

// // export const createCompanyApi = (data) =>
// //   API.post("/super-admin/companies", data);

// // export const approveCompanyApi = (id) =>
// //   API.patch(`/super-admin/companies/${id}/approve`);

// // export const suspendCompanyApi = (id) =>
// //   API.patch(`/super-admin/companies/${id}/suspend`);

// // export const deleteCompanyApi = (id) =>
// //   API.delete(`/super-admin/companies/${id}`);

// // // USERS
// // export const getAllUsersApi = (params) =>
// //   API.get("/super-admin/users", { params });

// // export const disableUserApi = (id) =>
// //   API.patch(`/super-admin/users/${id}/disable`);

// // export const resetUserPasswordApi = (id) =>
// //   API.patch(`/super-admin/users/${id}/reset-password`);

// // // PLANS
// // export const getPlansApi = () => API.get("/super-admin/plans");

// // export const createPlanApi = (data) => API.post("/super-admin/plans", data);

// // export const assignPlanApi = (companyId, planId) =>
// //   API.patch(`/super-admin/companies/${companyId}/plan`, { planId });

// // // BILLING
// // export const getSubscriptionsApi = (params) =>
// //   API.get("/super-admin/subscriptions", { params });

// // export const getPaymentsApi = (params) =>
// //   API.get("/super-admin/payments", { params });

// // export const verifyPaymentApi = (data) =>
// //   API.post("/super-admin/payments/verify-paystack", data);

// // // ANALYTICS & DASHBOARD
// // export const getAnalyticsApi = () => API.get("/super-admin/analytics");

// // // SETTINGS
// // export const getPlatformSettingsApi = () => API.get("/super-admin/settings");

// // export const updatePlatformSettingsApi = (data) =>
// //   API.patch("/super-admin/settings", data);

// // // SYSTEM
// // export const getSystemHealthApi = () => API.get("/super-admin/system/health");



// src/api/service/superAdminApi.js
import axios from "axios";

// ─── 1. Setup Dedicated Super Admin Instance ─────────────────────────
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "development"
    ? "http://localhost:5000/api"
    : "https://your-production-api.com/api");

const superAdminAPI = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── 2. Super Admin Request Interceptor ──────────────────────────────
// Attaches the superAdminToken (NOT the regular accessToken)
superAdminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("superAdminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── 3. Super Admin Response Interceptor ─────────────────────────────
// Handles 401s by kicking the user back to the super admin login
superAdminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Super Admin session expired or invalid.");
      localStorage.removeItem("superAdminToken");
      localStorage.removeItem("userRole");
      window.location.href = "/super-admin/login";
    }
    return Promise.reject(error);
  }
);


// ─── 4. API Endpoints ────────────────────────────────────────────────

// AUTH
export const superAdminLoginApi = (data) =>
  superAdminAPI.post("/super-admin/auth/login", data);

// COMPANIES
export const getAllCompaniesApi = (params) =>
  superAdminAPI.get("/super-admin/companies", { params });

export const createCompanyApi = (data) =>
  superAdminAPI.post("/super-admin/companies", data);

export const approveCompanyApi = (id) =>
  superAdminAPI.patch(`/super-admin/companies/${id}/approve`);

export const suspendCompanyApi = (id) =>
  superAdminAPI.patch(`/super-admin/companies/${id}/suspend`);

export const deleteCompanyApi = (id) =>
  superAdminAPI.delete(`/super-admin/companies/${id}`);

// USERS
export const getAllUsersApi = (params) =>
  superAdminAPI.get("/super-admin/users", { params });

export const disableUserApi = (id) =>
  superAdminAPI.patch(`/super-admin/users/${id}/disable`);

export const resetUserPasswordApi = (id) =>
  superAdminAPI.patch(`/super-admin/users/${id}/reset-password`);

// PLANS
export const getPlansApi = () => 
  superAdminAPI.get("/super-admin/plans");

export const createPlanApi = (data) => 
  superAdminAPI.post("/super-admin/plans", data);

export const assignPlanApi = (companyId, planId) =>
  superAdminAPI.patch(`/super-admin/companies/${companyId}/plan`, { planId });

// BILLING
export const getSubscriptionsApi = (params) =>
  superAdminAPI.get("/super-admin/subscriptions", { params });

export const getPaymentsApi = (params) =>
  superAdminAPI.get("/super-admin/payments", { params });

export const verifyPaymentApi = (data) =>
  superAdminAPI.post("/super-admin/payments/verify-paystack", data);

// ANALYTICS
export const getAnalyticsApi = () => 
  superAdminAPI.get("/super-admin/analytics");

// SETTINGS
export const getPlatformSettingsApi = () => 
  superAdminAPI.get("/super-admin/settings");

export const updatePlatformSettingsApi = (data) =>
  superAdminAPI.patch("/super-admin/settings", data);

// SYSTEM
export const getSystemHealthApi = () => 
  superAdminAPI.get("/super-admin/system/health");

export const getErrorLogsApi = () => 
  superAdminAPI.get("/super-admin/logs");

// AUDIT
export const getAuditLogsApi = (params) =>
  superAdminAPI.get("/super-admin/audit-logs", { params });