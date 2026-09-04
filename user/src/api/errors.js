// ─────────────────────────────────────────────────────────────
//  src/api/errors.js
//  Single source of truth for turning ANY thrown error into
//  something safe and readable for a human.
//
//  Why this file exists
//  ────────────────────
//  Axios sets `error.message` to a generic string built from the
//  status line:
//
//      "Request failed with status code 401"
//
//  The real, human-written reason lives at:
//
//      error.response.data.message      → "Invalid email or password."
//      error.response.data.errors[]     → per-field validation messages
//
//  Every `catch (err) { show(err.message) }` in the app was therefore
//  showing the status-line string instead of the server's message.
//  `normalizeError()` fixes that for all of them at once.
// ─────────────────────────────────────────────────────────────

/** Coarse buckets a caller can branch on without matching status numbers. */
export const ErrorKind = {
  NETWORK: "network",
  TIMEOUT: "timeout",
  VALIDATION: "validation",
  UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",
  NOT_FOUND: "not_found",
  CONFLICT: "conflict",
  RATE_LIMIT: "rate_limit",
  SERVER: "server",
  UNKNOWN: "unknown",
};

/**
 * Fallback copy, used only when the server did not send a usable message.
 * Keep these in plain language — they are shown to end users.
 */
const STATUS_FALLBACK = {
  400: "That request wasn't quite right. Please check the details and try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  405: "That action isn't supported here.",
  408: "The request took too long. Please try again.",
  409: "That conflicts with something that already exists.",
  413: "That file is too large. Please upload a smaller one.",
  415: "That file type isn't supported.",
  422: "Please correct the highlighted fields and try again.",
  429: "Too many attempts. Please wait a moment and try again.",
  500: "Something went wrong on our end. Please try again shortly.",
  502: "We're having trouble reaching the server. Please try again shortly.",
  503: "The service is temporarily unavailable. Please try again shortly.",
  504: "The server took too long to respond. Please try again.",
};

const GENERIC = "Something went wrong. Please try again.";

/** Map an HTTP status onto an ErrorKind. */
function kindForStatus(status) {
  if (status === 401) return ErrorKind.UNAUTHORIZED;
  if (status === 403) return ErrorKind.FORBIDDEN;
  if (status === 404) return ErrorKind.NOT_FOUND;
  if (status === 409) return ErrorKind.CONFLICT;
  if (status === 422 || status === 400) return ErrorKind.VALIDATION;
  if (status === 429) return ErrorKind.RATE_LIMIT;
  if (status >= 500) return ErrorKind.SERVER;
  return ErrorKind.UNKNOWN;
}

/**
 * Pull per-field messages out of a response body.
 *
 * Handles the three shapes this backend produces:
 *   validate.js middleware  → errors: [{ field, message, value }]
 *   express-validator raw   → errors: [{ path, msg, value, location }]
 *   plain object            → errors: { email: "is required" }
 *
 * @returns {Record<string,string>} field name → message ({} if none)
 */
export function extractFieldErrors(data) {
  const raw = data?.errors ?? data?.fieldErrors ?? data?.validationErrors;
  if (!raw) return {};

  // Already keyed by field name.
  if (!Array.isArray(raw) && typeof raw === "object") {
    return Object.fromEntries(
      Object.entries(raw).map(([field, msg]) => [
        field,
        typeof msg === "string" ? msg : (msg?.message ?? msg?.msg ?? GENERIC),
      ]),
    );
  }

  if (!Array.isArray(raw)) return {};

  const out = {};
  for (const e of raw) {
    if (!e || typeof e !== "object") continue;
    const field = e.field ?? e.path ?? e.param ?? e.name;
    const message = e.message ?? e.msg ?? e.error;
    // First message per field wins — matches how forms display errors.
    if (field && message && !(field in out)) out[field] = String(message);
  }
  return out;
}

/** Server 5xx bodies can leak stack traces / SQL. Never surface those. */
function isTechnicalLeak(message) {
  return (
    /\bat\s+\w+.*\(.*:\d+:\d+\)/.test(message) || // stack frame
    /\b(ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EAI_AGAIN)\b/.test(message) ||
    /\b(relation|column|constraint|syntax error at or near)\b/i.test(message) ||
    message.length > 220
  );
}

/**
 * Normalize any error (axios, fetch, plain Error, string) into a
 * stable, user-safe shape.
 *
 * @returns {{
 *   message: string,            // safe to render directly in the UI
 *   kind: string,               // one of ErrorKind
 *   status: number|null,
 *   fieldErrors: Record<string,string>,
 *   hasFieldErrors: boolean,
 *   isNetworkError: boolean,
 *   isTimeout: boolean,
 *   isAuthError: boolean,
 *   detail: string|null,        // developer-facing original text
 *   raw: unknown,
 * }}
 */
export function normalizeError(error) {
  // ── Non-error values ────────────────────────────────────────
  if (error == null) {
    return build({ message: GENERIC, kind: ErrorKind.UNKNOWN, raw: error });
  }
  if (typeof error === "string") {
    return build({ message: error, kind: ErrorKind.UNKNOWN, raw: error });
  }

  // ── Request was cancelled — not a real failure ──────────────
  if (error.code === "ERR_CANCELED" || error.name === "CanceledError") {
    return build({
      message: "Request cancelled.",
      kind: ErrorKind.UNKNOWN,
      isCanceled: true,
      raw: error,
    });
  }

  const response = error.response;

  // ── No response: offline, DNS, CORS, or client-side timeout ─
  if (!response) {
    const isTimeout =
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT" ||
      /timeout/i.test(error.message ?? "");

    // A real axios/fetch transport failure has a code or a request object.
    // A bare `new Error("...")` thrown by our own code does not — in that
    // case the author's message is more useful than "check your connection".
    const isTransport = Boolean(error.code || error.request || error.isAxiosError);

    if (!isTransport && error.message) {
      return build({
        message: error.message,
        kind: ErrorKind.UNKNOWN,
        detail: error.message,
        raw: error,
      });
    }

    return build({
      message: isTimeout
        ? "The request timed out. It may still be processing — please check back in a moment before retrying."
        : "Can't reach the server. Check your internet connection and try again.",
      kind: isTimeout ? ErrorKind.TIMEOUT : ErrorKind.NETWORK,
      isTimeout,
      isNetworkError: !isTimeout,
      detail: error.message ?? null,
      raw: error,
    });
  }

  // ── We have an HTTP response ────────────────────────────────
  const status = response.status;
  const data = response.data;
  const kind = kindForStatus(status);
  const fieldErrors = extractFieldErrors(data);

  // The server may send a JSON body, a plain string, or HTML (proxy errors).
  const serverMessage =
    (typeof data === "string" && data.trim() && !data.trim().startsWith("<")
      ? data.trim()
      : null) ??
    data?.message ??
    data?.error ??
    data?.msg ??
    null;

  let message;
  if (status >= 500) {
    // Never echo a 5xx body straight to the user — it may be a stack trace.
    message =
      serverMessage && !isTechnicalLeak(String(serverMessage))
        ? String(serverMessage)
        : (STATUS_FALLBACK[status] ?? STATUS_FALLBACK[500]);
  } else if (serverMessage) {
    message = String(serverMessage);
  } else if (Object.keys(fieldErrors).length) {
    message = Object.values(fieldErrors)[0];
  } else {
    message = STATUS_FALLBACK[status] ?? GENERIC;
  }

  // "Validation failed." is a developer label, not something a user can act
  // on. When we have the actual field messages, lead with one of those.
  if (/^validation failed\.?$/i.test(message) && Object.keys(fieldErrors).length) {
    message = Object.values(fieldErrors)[0];
  }

  return build({
    message,
    kind,
    status,
    fieldErrors,
    isAuthError: status === 401,
    detail: serverMessage ? String(serverMessage) : null,
    raw: error,
  });
}

function build({
  message,
  kind,
  status = null,
  fieldErrors = {},
  isNetworkError = false,
  isTimeout = false,
  isAuthError = false,
  isCanceled = false,
  detail = null,
  raw = null,
}) {
  return {
    message: message || GENERIC,
    kind,
    status,
    fieldErrors,
    hasFieldErrors: Object.keys(fieldErrors).length > 0,
    isNetworkError,
    isTimeout,
    isAuthError,
    isCanceled,
    detail,
    raw,
  };
}

/**
 * Convenience for `catch` blocks that only need the text:
 *
 *   catch (err) { setError(getErrorMessage(err)) }
 */
export function getErrorMessage(error) {
  return normalizeError(error).message;
}
