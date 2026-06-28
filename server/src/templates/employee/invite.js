// templates/employee/invite.js
// Sent when HR admin adds a new employee and triggers the invite.

import { defaultLayout } from "../layouts/default.js";

/**
 * @param {object} p
 * @param {string} p.firstName
 * @param {string} p.companyName
 * @param {string} p.inviterName     - HR admin who sent the invite
 * @param {string} p.email           - The employee's login email
 * @param {string} p.tempPassword    - Temporary password
 * @param {string} p.loginUrl
 * @param {string} [p.department]
 * @param {string} [p.jobRole]
 */
export function employeeInvite({
  firstName,
  companyName,
  inviterName,
  email,
  tempPassword,
  loginUrl,
  department,
  jobRole,
}) {
  const body = `
    <h1 class="title">You've been invited to join ${companyName} 👋</h1>
    <p class="text">
      Hi ${firstName}, <strong>${inviterName}</strong> has added you to <strong>${companyName}</strong> on banntaHR —
      your company's people operations platform.
    </p>
    ${
      department || jobRole
        ? `
    <div class="info-box">
      ${department ? `<div class="info-row"><span class="info-label">Department</span><span class="info-value">${department}</span></div>` : ""}
      ${jobRole ? `<div class="info-row" style="border:none"><span class="info-label">Role</span><span class="info-value">${jobRole}</span></div>` : ""}
    </div>`
        : ""
    }
    <p class="text">Here are your login credentials:</p>
    <div class="info-box" style="border-left:4px solid #4F46E5">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;border-bottom:1px solid #F3F4F6">
            <span class="info-label" style="font-size:13px">Email</span>
          </td>
          <td style="padding:6px 0;border-bottom:1px solid #F3F4F6;text-align:right">
            <span class="info-value" style="font-size:13px">${email}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0">
            <span class="info-label" style="font-size:13px">Temporary Password</span>
          </td>
          <td style="padding:6px 0;text-align:right">
            <code style="background:#EEF2FF;color:#4F46E5;padding:3px 8px;border-radius:6px;font-size:13px;font-weight:700">${tempPassword}</code>
          </td>
        </tr>
      </table>
    </div>
    <p class="text-muted">
      ⚠️ Please change your password immediately after your first login.
      This temporary password expires in <strong>72 hours</strong>.
    </p>
  `;

  return defaultLayout({
    title: `You're invited to join ${companyName} on banntaHR`,
    previewText: `${inviterName} has invited you to ${companyName}. Your login details are inside.`,
    body,
    cta: { url: loginUrl, label: "Accept Invite & Log In" },
  });
}
