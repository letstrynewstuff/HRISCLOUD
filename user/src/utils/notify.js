// ─────────────────────────────────────────────────────────────
//  src/utils/notify.js
//  App-wide toast helpers.
//
//  Use these instead of calling react-hot-toast directly so every
//  error in the app is passed through normalizeError() first — that
//  is what turns "Request failed with status code 401" into the
//  server's actual "Invalid email or password."
//
//    import { notifyError, notifySuccess } from "../utils/notify";
//
//    try   { await leaveApi.approve(id); notifySuccess("Leave approved"); }
//    catch (err) { notifyError(err); }
// ─────────────────────────────────────────────────────────────

import toast from "react-hot-toast";
import { normalizeError } from "../api/errors";
import C from "../styles/colors";

const base = {
  duration: 4500,
  style: {
    fontFamily: "Sora, sans-serif",
    fontSize: "13px",
    fontWeight: 500,
    borderRadius: "14px",
    padding: "12px 16px",
    maxWidth: "420px",
  },
};

/**
 * Show an error toast for any thrown value.
 *
 * @param {unknown} error   axios error, Error, or string
 * @param {object}  [opts]
 * @param {string}  [opts.fallback]  message if the error yields nothing useful
 * @param {boolean} [opts.silent]    skip the toast, just return the normalized error
 * @returns the normalized error, so callers can also set inline field errors
 */
export function notifyError(error, opts = {}) {
  const normalized = normalizeError(error);

  // Aborted requests (component unmounted, user navigated away) are not
  // failures the user needs to hear about.
  if (normalized.isCanceled) return normalized;

  // A dead session already triggers a redirect to /login via the axios
  // interceptor. A second "session expired" toast on top of that is noise.
  if (error?.isSessionExpired) {
    toast.error("Your session has expired. Please sign in again.", {
      ...base,
      id: "session-expired", // dedupe across parallel failed requests
      style: { ...base.style, background: C.warningLight, color: "#92400E" },
    });
    return normalized;
  }

  if (!opts.silent) {
    toast.error(normalized.message || opts.fallback || "Something went wrong.", {
      ...base,
      style: { ...base.style, background: C.dangerLight, color: "#991B1B" },
    });
  }

  return normalized;
}

export function notifySuccess(message) {
  return toast.success(message, {
    ...base,
    duration: 3000,
    style: { ...base.style, background: C.successLight, color: "#065F46" },
  });
}

export function notifyInfo(message) {
  return toast(message, {
    ...base,
    style: { ...base.style, background: C.primaryLight, color: "#3730A3" },
  });
}

export { toast };
