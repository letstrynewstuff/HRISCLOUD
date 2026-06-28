// templates/auth/changePassword.js
// Security confirmation sent after a successful password change.

import { minimalLayout } from "../layouts/minimal.js";

/**
 * @param {object} p
 * @param {string} p.firstName
 * @param {string} p.changedAt       - ISO date string
 * @param {string} [p.ipAddress]
 * @param {string} p.supportUrl
 */
export function changePassword({
  firstName,
  changedAt,
  ipAddress,
  supportUrl,
}) {
  const changedFormatted = new Date(changedAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const body = `
    <div style="text-align:center;margin-bottom:20px">
      <div style="display:inline-block;background:#D1FAE5;border-radius:50%;width:48px;height:48px;line-height:48px;font-size:24px">🔐</div>
    </div>
    <h1 class="title">Your password was changed</h1>
    <p class="text">Hi ${firstName},</p>
    <p class="text">
      This is a confirmation that the password for your banntaHR account was successfully changed.
    </p>
    <div style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:8px;padding:12px 16px;margin:16px 0;font-size:13px;color:#374151">
      <div>🕐 &nbsp;<strong>${changedFormatted}</strong></div>
      ${ipAddress ? `<div style="margin-top:6px">📍 &nbsp;From IP: <strong>${ipAddress}</strong></div>` : ""}
    </div>
    <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:12px 16px;margin:16px 0">
      <p style="margin:0;font-size:13px;font-weight:700;color:#DC2626">⚠️ Wasn't you?</p>
      <p style="margin:6px 0 0;font-size:13px;color:#7F1D1D">
        If you didn't make this change, your account may be compromised.
        Please contact support immediately.
      </p>
    </div>
  `;

  return minimalLayout({
    title: "Your banntaHR password was changed",
    previewText:
      "Your password was successfully updated. If this wasn't you, act now.",
    body,
    cta: { url: supportUrl, label: "Contact Support" },
  });
}
