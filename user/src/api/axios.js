

import axios from "axios";

// ─── Base URL ────────────────────────────────────────────────
// const BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api"
    : "https://bantahr.onrender.com/api";

// ─── Axios Instance ──────────────────────────────────────────
const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ─────────────────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ────────────────────────────────────
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ─── Handle 401 (token expired) ───────────────────────────
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token found");
        }

        // Get new tokens
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        // Save new tokens
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return API(originalRequest);
      } catch (err) {
        console.error("Session expired, logging out...", err);

        // ─── SAFE GLOBAL LOGOUT (NO NAVIGATION HERE) ─────────
        localStorage.clear();
        window.dispatchEvent(new Event("auth:logout"));

        return Promise.reject(err);
      }
    }

    // ─── Network error handling ───────────────────────────────
    if (!error.response) {
      return Promise.reject({
        message: "Network error. Please check your connection.",
      });
    }

    return Promise.reject(error);
  },
);

export default API;
