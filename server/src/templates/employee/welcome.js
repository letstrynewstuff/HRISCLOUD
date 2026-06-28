// templates/employee/welcome.js
// Sent after the employee completes their first login / sets their own password.

import { defaultLayout } from "../layouts/default.js";

/**
 * @param {object} p
 * @param {string} p.firstName
 * @param {string} p.companyName
 * @param {string} p.dashboardUrl
 * @param {string} [p.department]
 * @param {string} [p.managerName]
 */
export function employeeWelcome({
  firstName,
  companyName,
  dashboardUrl,
  department,
  managerName,
}) {
  const body = `
    <h1 class="title">Welcome aboard, ${firstName}! 🚀</h1>
    <p class="text">
      You're now set up on banntaHR as part of <strong>${companyName}</strong>.
      This is where you'll manage your leaves, view your payslips, log attendance, and stay connected with your team.
    </p>
    ${
      department || managerName
        ? `
    <div class="info-box">
      ${department ? `<div class="info-row"><span class="info-label">Your department</span><span class="info-value">${department}</span></div>` : ""}
      ${managerName ? `<div class="info-row" style="border:none"><span class="info-label">Reports to</span><span class="info-value">${managerName}</span></div>` : ""}
    </div>`
        : ""
    }
    <p class="text">A few things to do first:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px">
      ${[
        [
          "✅",
          "Complete your profile",
          "Add your phone number, emergency contact, and bank details",
        ],
        [
          "📋",
          "Review your leave balance",
          "See what annual, sick, and other leave you have available",
        ],
        [
          "🕐",
          "Set up your timesheet",
          "Start logging your daily work activity",
        ],
      ]
        .map(
          ([icon, step, detail]) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #F3F4F6;vertical-align:top;width:32px">
          <span style="font-size:18px">${icon}</span>
        </td>
        <td style="padding:8px 0 8px 10px;border-bottom:1px solid #F3F4F6">
          <p style="margin:0;font-size:14px;font-weight:600;color:#1E1B4B">${step}</p>
          <p style="margin:2px 0 0;font-size:12px;color:#6B7280">${detail}</p>
        </td>
      </tr>`,
        )
        .join("")}
    </table>
    <p class="text-muted">Need help? Reach out to your HR team or browse the Help Center inside the app.</p>
  `;

  return defaultLayout({
    title: `Welcome to banntaHR — ${companyName}`,
    previewText: `You're all set! Welcome to ${companyName} on banntaHR.`,
    body,
    cta: { url: dashboardUrl, label: "Go to My Dashboard" },
  });
}
