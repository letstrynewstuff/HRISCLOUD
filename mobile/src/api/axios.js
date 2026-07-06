// src/api/axios.js

import axios from "axios";
import * as SecureStore from "expo-secure-store";

// ─────────────────────────────────────────────────────────────
// Base URL
//
// Development (Expo Web):
//   EXPO_PUBLIC_API_URL=http://localhost:5000/api
//
// Development (Physical Device):
//   EXPO_PUBLIC_API_URL=http://192.168.x.x:5000/api
//
// Production:
//   EXPO_PUBLIC_API_URL=https://bantahr.onrender.com/api
// ─────────────────────────────────────────────────────────────

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api";

// ─────────────────────────────────────────────────────────────
// Axios Instance
// ─────────────────────────────────────────────────────────────

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─────────────────────────────────────────────────────────────
// Request Interceptor
// ─────────────────────────────────────────────────────────────

API.interceptors.request.use(
  async (config) => {
    // Attach access token
    const token = await SecureStore.getItemAsync("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Prevent sending literal null/undefined bodies
    const methodNeedsBody = ["post", "put", "patch"].includes(
      (config.method ?? "").toLowerCase(),
    );

    if (methodNeedsBody) {
      const d = config.data;

      const isNullLike =
        d === null || d === undefined || d === "null" || d === "undefined";

      const isSpecialType =
        typeof FormData !== "undefined" && d instanceof FormData;

      if (isNullLike && !isSpecialType) {
        config.data = {};
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─────────────────────────────────────────────────────────────
// Response Interceptor
// ─────────────────────────────────────────────────────────────

API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Refresh expired access token
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token found");
        }

        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        await SecureStore.setItemAsync("accessToken", data.accessToken);

        await SecureStore.setItemAsync("refreshToken", data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return API(originalRequest);
      } catch (err) {
        console.error("Session expired:", err);

        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");

        // TODO:
        // Later we'll dispatch a Redux logout action
        // and redirect the user to /(auth)/login.

        return Promise.reject(err);
      }
    }

    // Network / timeout handling
    if (!error.response) {
      const isTimeout =
        error.code === "ECONNABORTED" || /timeout/i.test(error.message ?? "");

      error.isTimeout = isTimeout;
      error.isNetworkError = !isTimeout;
      error.message = isTimeout
        ? "The request timed out. It may still be processing on the server."
        : "Network error. Please check your internet connection.";
    }

    return Promise.reject(error);
  },
);

export default API;
