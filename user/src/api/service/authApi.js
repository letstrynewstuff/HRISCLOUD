// src/api/service/authApi.js
import API from "../axios";

export const authApi = {
  login: (email, password) =>
    API.post("/auth/login", { email, password }).then((r) => r.data),

  registerCompany: (payload) =>
    API.post("/auth/register-company", payload).then((r) => r.data),

  forgotPassword: (email) =>
    API.post("/auth/forgot-password", { email }).then((r) => r.data),

  resetPassword: (token, password) =>
    API.post("/auth/reset-password", { token, password }).then((r) => r.data),

  verifyEmail: (token) =>
    API.post("/auth/verify-email", { token }).then((r) => r.data),

  refresh: (refreshToken) =>
    API.post("/auth/refresh", { refreshToken }).then((r) => r.data),

  logout: (refreshToken) =>
    API.post("/auth/logout", { refreshToken }).then((r) => r.data),

  getMe: () => API.get("/auth/me").then((r) => r.data),
  // PUT /api/auth/change-password
  changePassword: (payload) =>
    API.put("/auth/change-password", payload).then((r) => r.data),
};



