// import axios from "axios";

// // ─── Base URL ────────────────────────────────────────────────
// // const BASE_URL =
// //   import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
// const BASE_URL =
//   import.meta.env.MODE === "development"
//     ? "http://localhost:5000/api"
//     : "https://bantahr.onrender.com/api";

// // ─── Axios Instance ──────────────────────────────────────────
// const API = axios.create({
//   baseURL: BASE_URL,
//   timeout: 15000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // ─── Request Interceptor ─────────────────────────────────────
// API.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("accessToken");

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// // ─── Response Interceptor ────────────────────────────────────
// API.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // ─── Handle 401 (token expired) ───────────────────────────
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = localStorage.getItem("refreshToken");

//         if (!refreshToken) {
//           throw new Error("No refresh token found");
//         }

//         // Get new tokens
//         const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
//           refreshToken,
//         });

//         // Save new tokens
//         localStorage.setItem("accessToken", data.accessToken);
//         localStorage.setItem("refreshToken", data.refreshToken);

//         // Retry original request
//         originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
//         return API(originalRequest);
//       } catch (err) {
//         console.error("Session expired, logging out...", err);

//         // ─── SAFE GLOBAL LOGOUT (NO NAVIGATION HERE) ─────────
//         localStorage.clear();
//         window.dispatchEvent(new Event("auth:logout"));

//         return Promise.reject(err);
//       }
//     }

//     // ─── Network error handling ───────────────────────────────
//     if (!error.response) {
//       return Promise.reject({
//         message: "Network error. Please check your connection.",
//       });
//     }

//     return Promise.reject(error);
//   },
// );

// export default API;

// import axios from "axios";

// // ─── Base URL ────────────────────────────────────────────────
// // const BASE_URL =
// //   import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
// const BASE_URL =
//   import.meta.env.MODE === "development"
//     ? "http://localhost:5000/api"
//     : "https://bantahr.onrender.com/api";

// // ─── Axios Instance ──────────────────────────────────────────
// const API = axios.create({
//   baseURL: BASE_URL,
//   timeout: 15000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // ─── Request Interceptor ─────────────────────────────────────
// API.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("accessToken");

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// // ─── Response Interceptor ────────────────────────────────────
// API.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // ─── Handle 401 (token expired) ───────────────────────────
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = localStorage.getItem("refreshToken");

//         if (!refreshToken) {
//           throw new Error("No refresh token found");
//         }

//         // Get new tokens
//         const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
//           refreshToken,
//         });

//         // Save new tokens
//         localStorage.setItem("accessToken", data.accessToken);
//         localStorage.setItem("refreshToken", data.refreshToken);

//         // Retry original request
//         originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
//         return API(originalRequest);
//       } catch (err) {
//         console.error("Session expired, logging out...", err);

//         // ─── SAFE GLOBAL LOGOUT (NO NAVIGATION HERE) ─────────
//         localStorage.clear();
//         window.dispatchEvent(new Event("auth:logout"));

//         return Promise.reject(err);
//       }
//     }

//     // ─── Network / timeout error handling ──────────────────────
//     // IMPORTANT: do NOT replace `error` with a bare object here.
//     // Doing so strips `error.response`, `error.code`, `error.config`,
//     // etc. — callers then can't tell a 15s client-side timeout
//     // (request may have succeeded server-side) apart from a genuine
//     // connection failure (request never reached the server).
//     //
//     // Instead, annotate the real error with a few convenience flags
//     // and a friendlier `message`, but keep it as the same error object
//     // so `error.response`, `error.code`, and `error.config` survive.
//     if (!error.response) {
//       const isTimeout =
//         error.code === "ECONNABORTED" || /timeout/i.test(error.message || "");

//       error.isTimeout = isTimeout;
//       error.isNetworkError = !isTimeout;

//       error.message = isTimeout
//         ? "The request timed out. It may still be processing on the server — please check back in a moment before retrying."
//         : "Network error. Please check your connection.";

//       return Promise.reject(error);
//     }

//     return Promise.reject(error);
//   },
// );

// export default API;



// src/api/axios.js
import axios from "axios";

// ─── Base URL ────────────────────────────────────────────────
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
    // ── Auth token ──────────────────────────────────────────
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ── NULL BODY GUARD ─────────────────────────────────────
    // Root cause of:
    //   SyntaxError: Unexpected token 'n', "null" is not valid JSON
    //
    // When a caller writes:
    //   API.post("/some/route", null)          ← axios sends literal "null"
    //   API.post("/some/route")                ← axios sends no body (fine)
    //   API.post("/some/route", undefined)     ← axios sends no body (fine)
    //
    // body-parser on the server receives the four-character string "null"
    // and throws a 400 SyntaxError because "null" is valid JSON for the
    // top-level value `null`, but express.json() rejects it since it
    // expects an object/array at the root.
    //
    // Fix: in the REQUEST interceptor (before the payload is serialised),
    // replace any null/non-object data with an empty object {} for POST,
    // PUT, and PATCH requests.  This is the right layer to fix it:
    //   • Cheaper than a server-side raw-body middleware.
    //   • Works for every API call across the entire app automatically.
    //   • Does NOT affect GET/DELETE (no body expected).
    //   • Does NOT affect FormData or Blob payloads (those are objects).
    const methodNeedsBody = ["post", "put", "patch"].includes(
      (config.method ?? "").toLowerCase(),
    );

    if (methodNeedsBody) {
      const d = config.data;
      const isNullLike =
        d === null ||
        d === undefined ||
        d === "null" ||
        d === "undefined";

      // Only coerce to {} when the data is null-like AND is not a
      // special type (FormData, Blob, ArrayBuffer, URLSearchParams).
      const isSpecialType =
        typeof FormData !== "undefined"       && d instanceof FormData       ||
        typeof Blob !== "undefined"           && d instanceof Blob           ||
        typeof ArrayBuffer !== "undefined"    && d instanceof ArrayBuffer    ||
        typeof URLSearchParams !== "undefined" && d instanceof URLSearchParams;

      if (isNullLike && !isSpecialType) {
        config.data = {}; // safe empty object — body-parser accepts this fine
      }
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

    // ── Handle 401 (token expired) ──────────────────────────
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token found");

        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem("accessToken",  data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return API(originalRequest);
      } catch (err) {
        console.error("Session expired, logging out...", err);
        localStorage.clear();
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(err);
      }
    }

    // ── Network / timeout errors ─────────────────────────────
    // IMPORTANT: annotate the original error object rather than
    // replacing it.  Replacing it with `{ message: "..." }` strips
    // error.response, error.code, and error.config — callers then
    // cannot distinguish a client-side timeout (request may have
    // succeeded server-side) from a genuine connection failure.
    if (!error.response) {
      const isTimeout =
        error.code === "ECONNABORTED" ||
        /timeout/i.test(error.message ?? "");

      error.isTimeout      = isTimeout;
      error.isNetworkError = !isTimeout;
      error.message        = isTimeout
        ? "The request timed out. It may still be processing on the server — please check back in a moment before retrying."
        : "Network error. Please check your connection.";
    }

    return Promise.reject(error);
  },
);

export default API;