// templates/company/welcome.js
// Sent to the company owner/admin right after their account is created.

import { defaultLayout } from "../layouts/default.js";

/**
 * @param {object} p
 * @param {string} p.firstName        - Admin first name
 * @param {string} p.companyName      - Company name
 * @param {string} p.loginUrl         - App login URL
 * @param {string} [p.trialDays=14]   - Trial length
 */
export function companyWelcome({
  firstName,
  companyName,
  loginUrl,
  trialDays = 14,
}) {
  const body = `
    <h1 class="title">Welcome to banntaHR, ${firstName}! 🎉</h1>
    <p class="text">
      Your company workspace for <strong>${companyName}</strong> is ready.
      You're on a <strong>${trialDays}-day free trial</strong> — no credit card required.
    </p>
    <p class="text">Here's what you can do right now:</p>
    <div class="info-box" style="margin:16px 0">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #F3F4F6">
            <span style="font-size:18px">👥</span>
            <span style="font-size:14px;color:#1E1B4B;font-weight:600;margin-left:10px">Invite your team</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #F3F4F6">
            <span style="font-size:18px">🏢</span>
            <span style="font-size:14px;color:#1E1B4B;font-weight:600;margin-left:10px">Set up departments &amp; roles</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #F3F4F6">
            <span style="font-size:18px">📅</span>
            <span style="font-size:14px;color:#1E1B4B;font-weight:600;margin-left:10px">Configure leave policies</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0">
            <span style="font-size:18px">💰</span>
            <span style="font-size:14px;color:#1E1B4B;font-weight:600;margin-left:10px">Run your first payroll</span>
          </td>
        </tr>
      </table>
    </div>
    <p class="text-muted">
      Your trial runs until <strong>${new Date(Date.now() + trialDays * 864e5).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</strong>.
      We'll remind you before it ends.
    </p>
  `;

  return defaultLayout({
    title: `Welcome to banntaHR — ${companyName}`,
    previewText: `${companyName}'s workspace is ready. Let's get started.`,
    body,
    cta: { url: loginUrl, label: "Open My Workspace" },
  });
}
