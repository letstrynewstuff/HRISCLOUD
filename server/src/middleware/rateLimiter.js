// src/middleware/rateLimiter.js
//
// Tiered rate limiting using express-rate-limit (already in your package.json,
// just wasn't wired up anywhere yet).
//
// ⚠️ REQUIRES `app.set("trust proxy", 1)` in app.js. Render sits your app
// behind a reverse proxy, so without that setting every request appears to
// come from the same IP (the proxy's), and express-rate-limit will either
// lock out ALL users at once or throw an ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
// validation error on startup. This is already added in the app.js changes.
//
// Tune the numbers below once you see real traffic — these are sane
// starting points, not measured against your actual usage patterns
// (e.g. chat/notification polling could need the general limiter loosened).

import rateLimit from "express-rate-limit";

const isProd = process.env.NODE_ENV === "production";

function jsonHandler(_req, res, _next, options) {
  res.status(options.statusCode).json({
    success: false,
    message: options.message,
  });
}

// ── General API limiter ─────────────────────────────────────────────────
// Mounted globally on /api/* in app.js. A generous backstop against
// scraping/abuse — not meant to be noticeable during normal use.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  limit: isProd ? 1000 : 100000, // effectively unlimited outside prod
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) =>
    jsonHandler(req, res, next, {
      statusCode: 429,
      message: "Too many requests. Please try again later.",
    }),
});

// ── Strict auth limiter (login, register) ───────────────────────────────
// Classic brute-force / credential-stuffing targets. Keyed by IP + email so:
//   - one attacker can't lock out other people's accounts from one IP
//   - one attacker can't dodge the limit by cycling through emails
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProd ? 10 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${req.ip}:${(req.body?.email || "").toLowerCase()}`,
  handler: (req, res, next) =>
    jsonHandler(req, res, next, {
      statusCode: 429,
      message: "Too many attempts. Please wait a few minutes and try again.",
    }),
});

// ── Password reset limiter (forgot-password, reset-password) ───────────
// Looser than login (legitimate users retry), still capped so the
// email-sending endpoint can't be hammered.
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: isProd ? 5 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${req.ip}:${(req.body?.email || "").toLowerCase()}`,
  handler: (req, res, next) =>
    jsonHandler(req, res, next, {
      statusCode: 429,
      message: "Too many password reset requests. Please try again later.",
    }),
});

// ── Refresh token limiter ───────────────────────────────────────────────
// Loose — legitimate clients call this automatically and often — but still
// bounded so a broken/compromised client can't hammer the DB in a loop.
export const refreshLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: isProd ? 60 : 5000,
  standardHeaders: true,
  legacyHeaders: false,
});
