// ─────────────────────────────────────────────────────────────
//  src/components/GlobalErrorProvider.jsx
//
//  Mounted once, near the root. Three jobs:
//
//   1. Renders the single <Toaster> the whole app writes into.
//   2. Catches unhandled promise rejections — an `await api.x()` with
//      no try/catch used to fail silently with only a console warning.
//   3. Surfaces expired sessions once, no matter how many parallel
//      requests failed.
// ─────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { normalizeError } from "../api/errors";
import { notifyError } from "../utils/notify";
import C from "../styles/colors";

export default function GlobalErrorProvider({ children }) {
  useEffect(() => {
    // ── Unhandled async failures ────────────────────────────
    const onRejection = (event) => {
      const reason = event.reason;
      const normalized = normalizeError(reason);

      if (normalized.isCanceled) return;

      console.error("Unhandled promise rejection:", reason);
      notifyError(reason);

      // Stop the browser's default "Uncaught (in promise)" console noise —
      // we have already reported it to the user.
      event.preventDefault();
    };

    // ── Errors thrown outside React (setTimeout, listeners) ──
    const onError = (event) => {
      console.error("Uncaught error:", event.error ?? event.message);
    };

    window.addEventListener("unhandledrejection", onRejection);
    window.addEventListener("error", onError);

    return () => {
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("error", onError);
    };
  }, []);

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        gutter={10}
        toastOptions={{
          className: "",
          style: {
            fontFamily: "Sora, sans-serif",
            fontSize: "13px",
            borderRadius: "14px",
            boxShadow: "0 8px 28px rgba(15, 23, 42, 0.12)",
            border: `1px solid ${C.border}`,
          },
        }}
      />
    </>
  );
}
