// ─────────────────────────────────────────────────────────────
//  src/middleware/errorHandler.js
//
//  The last middleware in the stack. Everything that throws — a bad
//  JSON body, an oversized upload, an expired JWT, a unique-constraint
//  violation, an unhandled bug — lands here and leaves as ONE shape:
//
//      { success: false, message: string, errors?: [{field, message}] }
//
//  The client (user/src/api/errors.js) is written against exactly that
//  shape, so anything reported here renders correctly in the UI.
//
//  Rule: `message` is written for a human. Stack traces and driver
//  internals go to the server log, never to the response.
// ─────────────────────────────────────────────────────────────

const isProd = process.env.NODE_ENV === "production";

/**
 * Throw this from a controller when you want a specific status + message
 * to reach the user:
 *
 *   throw new AppError("That leave request was already approved.", 409);
 */
export class AppError extends Error {
  constructor(message, status = 400, errors = null) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.expose = true; // message is safe to show the user
    if (errors) this.errors = errors;
  }
}

/** Wrap an async controller so a rejected promise reaches this handler. */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/** Postgres SQLSTATE codes worth translating into plain language. */
function fromPostgres(err) {
  switch (err.code) {
    case "23505": // unique_violation
      return {
        status: 409,
        message: "That record already exists.",
        errors: err.constraint
          ? [{ field: guessField(err), message: "Already in use." }]
          : undefined,
      };
    case "23503": // foreign_key_violation
      return {
        status: 409,
        message:
          "That item is still linked to other records and can't be changed.",
      };
    case "23502": // not_null_violation
      return {
        status: 422,
        message: `${humanize(err.column)} is required.`,
        errors: err.column
          ? [{ field: err.column, message: "This field is required." }]
          : undefined,
      };
    case "22P02": // invalid_text_representation
      return { status: 400, message: "One of the values sent isn't valid." };
    case "23514": // check_violation
      return { status: 422, message: "One of the values sent isn't allowed." };
    case "ECONNREFUSED":
    case "57P01": // admin_shutdown
      return {
        status: 503,
        message: "The database is unavailable. Please try again shortly.",
      };
    default:
      return null;
  }
}

function guessField(err) {
  // Constraint names are conventionally "<table>_<column>_key".
  const m = /^[a-z0-9]+_(.+)_key$/i.exec(err.constraint ?? "");
  return m ? m[1] : (err.column ?? "field");
}

function humanize(column) {
  if (!column) return "A required field";
  return column.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

/** Translate a known error into { status, message, errors }. */
function classify(err) {
  // ── Errors WE raised deliberately ──────────────────────────
  // Checked first, and only for our own class — body-parser also sets
  // `expose: true` on its errors, so keying off `expose` alone here
  // would leak raw parser text like
  //   "Expected property name or '}' in JSON at position 1"
  // straight to the user. The generic `expose` case is handled further
  // down, after every library-specific error has had its turn.
  if (err instanceof AppError) {
    return {
      status: err.status ?? 400,
      message: err.message,
      errors: err.errors,
    };
  }

  // ── Malformed JSON body (thrown by express.json) ───────────
  if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return {
      status: 400,
      message: "The request body wasn't valid JSON.",
    };
  }

  // ── Body larger than the configured limit ──────────────────
  if (err.type === "entity.too.large") {
    return { status: 413, message: "That request is too large." };
  }

  // ── Multer upload errors ───────────────────────────────────
  if (err.name === "MulterError") {
    const map = {
      LIMIT_FILE_SIZE: "That file is too large.",
      LIMIT_FILE_COUNT: "Too many files were uploaded at once.",
      LIMIT_UNEXPECTED_FILE: "Unexpected file field in the upload.",
    };
    return { status: 413, message: map[err.code] ?? "That upload was rejected." };
  }

  // ── JWT ────────────────────────────────────────────────────
  if (err.name === "TokenExpiredError") {
    return { status: 401, message: "Your session has expired. Please sign in again." };
  }
  if (err.name === "JsonWebTokenError" || err.name === "NotBeforeError") {
    return { status: 401, message: "Your session is no longer valid. Please sign in again." };
  }

  // ── Postgres ───────────────────────────────────────────────
  const pg = fromPostgres(err);
  if (pg) return pg;

  // ── Anything with a deliberate 4xx status still gets through ─
  const status = err.status ?? err.statusCode;
  if (status && status >= 400 && status < 500) {
    return { status, message: err.message || "That request could not be completed." };
  }

  // ── Genuinely unexpected: log it, tell the user nothing ─────
  return {
    status: 500,
    message: "Something went wrong on our end. Please try again shortly.",
  };
}

// ─── 404 for unmatched routes ────────────────────────────────
export function notFoundHandler(req, res) {
  // The client renders `message` verbatim, so it has to read like English.
  // The route itself is only useful to a developer — keep it out of prod.
  const body = {
    success: false,
    message: "We couldn't find what you were looking for.",
  };
  if (!isProd) body.detail = `Cannot ${req.method} ${req.originalUrl}`;

  console.warn(`[404] ${req.method} ${req.originalUrl}`);
  res.status(404).json(body);
}

// ─── The global error handler ────────────────────────────────
export function errorHandler(err, req, res, next) {
  // Headers already flushed (e.g. a stream failed mid-send) — Express's
  // default handler must close the connection.
  if (res.headersSent) return next(err);

  const { status, message, errors } = classify(err);

  // Always log the real thing, with enough context to find it again.
  const log = status >= 500 ? console.error : console.warn;
  log(
    `[${status}] ${req.method} ${req.originalUrl}`,
    status >= 500 ? err : err.message,
  );

  const body = { success: false, message };
  if (errors) body.errors = errors;

  // Outside production, include the original text so developers aren't
  // debugging against the sanitized copy.
  if (!isProd && status >= 500) {
    body.detail = err.message;
    body.stack = err.stack;
  }

  res.status(status).json(body);
}
