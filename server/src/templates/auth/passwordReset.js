// templates/auth/passwordReset.js

import { minimalLayout } from "../layouts/minimal.js";

/**
 * @param {object} p
 * @param {string} p.firstName
 * @param {string} p.resetUrl
 * @param {string} [p.requestedAt]   - ISO date string
 * @param {string} [p.ipAddress]     - Requester IP for security context
 */
export function passwordReset({ firstName, resetUrl, requestedAt, ipAddress }) {
  const requestedFormatted = requestedAt
    ? new Date(requestedAt).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const body = `
    <h1 class="title">Reset your password</h1>
    <p class="text">Hi ${firstName},</p>
    <p class="text">
      We received a request to reset the password for your banntaHR account.
      Click the button below to choose a new password.
    </p>
    <p class="text-muted">This link expires in <strong>1 hour</strong>.</p>
    ${
      requestedFormatted || ipAddress
        ? `
    <div style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:8px;padding:12px 16px;margin:16px 0;font-size:12px;color:#6B7280">
      ${requestedFormatted ? `<div>Requested: <strong>${requestedFormatted}</strong></div>` : ""}
      ${ipAddress ? `<div style="margin-top:4px">From IP: <strong>${ipAddress}</strong></div>` : ""}
    </div>`
        : ""
    }
    <hr class="divider" />
    <p class="text-muted" style="font-size:12px">
      If you didn't request a password reset, your account is still safe —
      just ignore this email. If you're concerned, consider changing your password after logging in.
    </p>
    <p class="text-muted" style="font-size:12px">
      Can't click the button? Copy this link:<br>
      <span style="color:#4F46E5;word-break:break-all">${resetUrl}</span>
    </p>
  `;

  return minimalLayout({
    title: "Reset your banntaHR password",
    previewText: "Reset your password — this link expires in 1 hour.",
    body,
    cta: { url: resetUrl, label: "Reset My Password" },
  });
}
