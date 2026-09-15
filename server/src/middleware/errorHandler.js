// src/middleware/errorHandler.js
//
// Centralized error handler — a SAFETY NET, not a replacement for your
// existing per-controller try/catch blocks. Those already catch their own
// errors and respond directly; that behavior is completely unchanged.
//
// This handler catches:
//   - `throw new AppError(...)` from new/refactored code
//   - Anything an async route handler throws that ISN'T caught locally
//     (Express 5 auto-forwards uncaught async rejections to this handler —
//     you don't need an asyncHandler wrapper on this Express version)
//   - Malformed JSON bodies (bad Content-Type / broken payloads)
//   - Stray JWT errors (jwt.verify called somewhere outside authenticate.js)
//   - Known Postgres error codes (unique/foreign key/not-null violations)
//   - Multer upload errors (file too large, wrong field, etc.)
//   - Anything else uncaught — falls back to a generic 500
//
// Must be registered LAST in app.js, after all routes, with all 4 params
// (err first) — that 4-param signature is how Express recognizes error
// middleware vs. normal middleware.

const isProd = process.env.NODE_ENV === "production";

// Common Postgres error codes we want to turn into clean 4xx responses
// instead of a raw, unhelpful 500. Full reference:
// https://www.postgresql.org/docs/current/errcodes-appendix.html
const PG_ERROR_MAP = {
  23505: { status: 409, message: "A record with this value already exists." },
  23503: { status: 409, message: "This action conflicts with related data." },
  23502: { status: 400, message: "A required field is missing." },
  "22P02": { status: 400, message: "Invalid input format." },
  22001: { status: 400, message: "One of the values provided is too long." },
};

export function errorHandler(err, req, res, next) {
  // If a response has already started streaming, hand off to Express's
  // built-in default handler instead of trying to send a second response.
  if (res.headersSent) return next(err);

  // ── Malformed JSON body (express.json() parse failure) ──────────────────
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Malformed JSON in request body.",
    });
  }

  // ── JWT errors ────────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired.",
      code: "TOKEN_EXPIRED",
    });
  }

  // ── Multer upload errors ────────────────────────────────────────────────
  if (err.name === "MulterError") {
    return res.status(400).json({ success: false, message: err.message });
  }

  // ── Known Postgres errors ───────────────────────────────────────────────
  if (err.code && PG_ERROR_MAP[err.code]) {
    const mapped = PG_ERROR_MAP[err.code];
    if (!isProd)
      console.error("PG error:", err.code, err.detail || err.message);
    return res
      .status(mapped.status)
      .json({ success: false, message: mapped.message });
  }

  // ── Our own operational errors (AppError) ───────────────────────────────
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
  }

  // ── Rate-limit errors, if ever surfaced via next(err) ───────────────────
  if (err.status === 429) {
    return res
      .status(429)
      .json({ success: false, message: err.message || "Too many requests." });
  }

  // ── Fallback: unexpected/programmer error ───────────────────────────────
  // Always logged server-side. Only shown to the client in non-production.
  console.error("Unhandled error:", err);
  return res.status(err.status || err.statusCode || 500).json({
    success: false,
    message: isProd ? "Internal server error." : err.message,
    ...(isProd ? {} : { stack: err.stack }),
  });
}

// 404 handler — same behavior as your current inline one, just moved here
// so app.js stays clean.
export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: "Route not found" });
}
