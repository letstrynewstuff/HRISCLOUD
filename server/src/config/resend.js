// src/config/resend.js
// Resend client singleton + daily usage counter.
//
// The counter lives in memory (resets on server restart).
// For multi-instance deployments, swap the in-memory counter
// for a Redis INCR with a TTL of 86400s.

import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

// ─── Client ──────────────────────────────────────────────────
export const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Daily usage counter ──────────────────────────────────────
let _count = 0;
let _resetAt = _nextMidnightUTC();

function _nextMidnightUTC() {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d;
}

function _tickIfNewDay() {
  if (new Date() >= _resetAt) {
    _count = 0;
    _resetAt = _nextMidnightUTC();
    console.log("[email] Resend counter reset for new UTC day.");
  }
}

export const resendCounter = {
  /** Current send count for today */
  get value() {
    _tickIfNewDay();
    return _count;
  },

  /** Increment after a successful Resend send */
  increment() {
    _tickIfNewDay();
    _count += 1;
    return _count;
  },

  /** Threshold at which we switch to SMTP (default 90) */
  get threshold() {
    return Number(process.env.RESEND_FAILOVER_THRESHOLD ?? 90);
  },

  /** Hard cap (default 100) */
  get limit() {
    return Number(process.env.RESEND_DAILY_LIMIT ?? 100);
  },

  /** True when Resend is still safe to use */
  get canUse() {
    return this.value < this.threshold;
  },

  /** Resets to 0 — useful for testing */
  reset() {
    _count = 0;
  },
};
