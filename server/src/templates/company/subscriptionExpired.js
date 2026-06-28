// templates/company/subscriptionExpired.js
// Sent when a subscription/trial lapses with no renewal.

import { defaultLayout } from "../layouts/default.js";

/**
 * @param {object} p
 * @param {string} p.firstName
 * @param {string} p.companyName
 * @param {string} p.reactivateUrl
 * @param {number} [p.graceDays=30]  - Days before data deletion
 */
export function subscriptionExpired({
  firstName,
  companyName,
  reactivateUrl,
  graceDays = 30,
}) {
  const body = `
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-size:48px">🔒</div>
    </div>
    <h1 class="title" style="text-align:center">Your subscription has expired</h1>
    <p class="text">Hi ${firstName},</p>
    <p class="text">
      The banntaHR subscription for <strong>${companyName}</strong> has expired and your workspace is currently paused.
      Your team members can no longer log in.
    </p>
    <div class="info-box" style="border-left:4px solid #DC2626;background:#FEF2F2">
      <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#DC2626">Your data is safe — for now.</p>
      <p style="margin:0;font-size:13px;color:#7F1D1D">
        We keep your data securely for <strong>${graceDays} days</strong> after expiry.
        After that, it will be permanently deleted and cannot be recovered.
      </p>
    </div>
    <p class="text">
      Reactivating your account takes under 2 minutes and restores full access immediately —
      all your employee records, payroll history, and settings will be exactly as you left them.
    </p>
    <p class="text-muted">
      If you believe this is a mistake or need help, reply to this email and we'll sort it out right away.
    </p>
  `;

  return defaultLayout({
    title: "Your banntaHR subscription has expired",
    previewText: "Your workspace is paused. Reactivate to restore access.",
    body,
    cta: { url: reactivateUrl, label: "Reactivate My Account" },
  });
}
