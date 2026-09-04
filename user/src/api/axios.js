// src/api/axios.js
import axios from "axios";
import { normalizeError } from "./errors";

// ─── Base URL ────────────────────────────────────────────────
const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000/api"
    : "https://hriscloud.onrender.com/api";

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
        d === null || d === undefined || d === "null" || d === "undefined";

      // Only coerce to {} when the data is null-like AND is not a
      // special type (FormData, Blob, ArrayBuffer, URLSearchParams).
      const isSpecialType =
        (typeof FormData !== "undefined" && d instanceof FormData) ||
        (typeof Blob !== "undefined" && d instanceof Blob) ||
        (typeof ArrayBuffer !== "undefined" && d instanceof ArrayBuffer) ||
        (typeof URLSearchParams !== "undefined" && d instanceof URLSearchParams);

      if (isNullLike && !isSpecialType) {
        config.data = {}; // safe empty object — body-parser accepts this fine
      }
    }

    return config;
  },
  (error) => Promise.reject(decorate(error)),
);

// ─────────────────────────────────────────────────────────────
//  Endpoints where a 401 means "those credentials are wrong",
//  NOT "your access token expired".
//
//  This distinction is the whole bug. Previously EVERY 401 —
//  including a failed login — was treated as an expired session,
//  so signing in with a wrong password would:
//     1. fire a pointless /auth/refresh call,
//     2. have that call fail with its own 401,
//     3. reject with the REFRESH error, whose message is the
//        axios status-line string "Request failed with status
//        code 401",
//     4. wipe localStorage on the way out.
//  The server's actual "Invalid email or password." never reached
//  the form.
// ─────────────────────────────────────────────────────────────
const CREDENTIAL_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/register-company",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/refresh",
  "/auth/logout",
];

function isCredentialRequest(config) {
  const url = config?.url ?? "";
  return CREDENTIAL_PATHS.some((p) => url.includes(p));
}

/**
 * Attach the normalized, user-safe fields onto the error object.
 *
 * `error.message` is overwritten with the friendly text so that the
 * dozens of existing `catch (err) { ...err.message }` call sites across
 * the app immediately show the server's real message instead of
 * "Request failed with status code 401". The original axios string is
 * preserved on `error.originalMessage` for debugging, and `error.response`
 * is left untouched so callers reading `err.response.data` still work.
 */
function decorate(error) {
  if (!error || typeof error !== "object") return error;

  const normalized = normalizeError(error);

  error.originalMessage = error.message;
  error.message = normalized.message;
  error.normalized = normalized;
  error.fieldErrors = normalized.fieldErrors;
  error.kind = normalized.kind;
  error.isTimeout = normalized.isTimeout;
  error.isNetworkError = normalized.isNetworkError;

  return error;
}

// ─── Single-flight refresh ───────────────────────────────────
// If several requests 401 at the same time (a dashboard firing six
// parallel calls, say), each one used to POST /auth/refresh. With
// refresh-token rotation the first call invalidates the token the
// others are holding, so the rest fail and log the user out. Sharing
// one in-flight promise makes all of them wait on a single refresh.
let refreshPromise = null;

async function runRefresh() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token");

  const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
    refreshToken,
  });

  if (!data?.accessToken) throw new Error("Refresh returned no access token");

  localStorage.setItem("accessToken", data.accessToken);
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }
  return data.accessToken;
}

function forceLogout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.dispatchEvent(new Event("auth:logout"));
}

// ─── Response Interceptor ────────────────────────────────────
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // ── Session refresh: ONLY for a 401 on a normal API call ──
    const shouldTryRefresh =
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isCredentialRequest(originalRequest) &&
      Boolean(localStorage.getItem("refreshToken"));

    if (shouldTryRefresh) {
      originalRequest._retry = true;

      try {
        refreshPromise = refreshPromise ?? runRefresh();
        const accessToken = await refreshPromise;

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return API(originalRequest);
      } catch {
        // The refresh genuinely failed — the session is over.
        // Reject with the ORIGINAL error, not the refresh error, so the
        // caller sees what its own request actually returned.
        forceLogout();
        error.isSessionExpired = true;
        return Promise.reject(decorate(error));
      } finally {
        refreshPromise = null;
      }
    }

    // A 401 on a protected route with no refresh token at all means the
    // user was never signed in (or was already logged out elsewhere).
    if (
      status === 401 &&
      originalRequest &&
      !isCredentialRequest(originalRequest) &&
      !localStorage.getItem("refreshToken")
    ) {
      forceLogout();
      error.isSessionExpired = true;
    }

    // Everything else — including a failed login — falls through with the
    // server's own message intact.
    return Promise.reject(decorate(error));
  },
);

export default API;
