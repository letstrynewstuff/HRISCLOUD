

// src/api/axios.js
import axios from "axios";

// ✅ Smart baseURL
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "development"
    ? "http://localhost:5000/api"
    : "https://your-production-api.com/api");

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ────────────────────────────────────────────────
// Attaches the accessToken to every outgoing request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ───────────────────────────────────────────────
// Handles 401 errors by attempting to refresh the token silently
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Check if error is 401 (Unauthorized) and we haven't retried this request yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark to avoid infinite loops

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // 2. Attempt to get a new accessToken
        // We use a fresh axios instance here to avoid circular dependency loops
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        // 3. Store the shiny new tokens
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        // 4. Update the original request with the new token and retry it
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return API(originalRequest);

      } catch (refreshError) {
        // 5. If refresh fails, the user's session is truly dead
        console.error("Refresh token expired or invalid", refreshError);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Handle Network errors
    if (!error.response) {
      return Promise.reject({
        message: "Network error. Please check your connection.",
        originalError: error,
      });
    }

    return Promise.reject(error);
  }
);

export default API;