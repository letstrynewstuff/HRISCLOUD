// templates/employee/onboardingCompleted.js
// Sent to HR admin when a new employee completes all onboarding tasks.

import { defaultLayout } from "../layouts/default.js";

/**
 * @param {object} p
 * @param {string} p.hrFirstName       - HR admin receiving the notification
 * @param {string} p.employeeName      - Full name of the employee
 * @param {string} p.employeeEmail
 * @param {string} p.department
 * @param {string} p.jobRole
 * @param {string} p.startDate
 * @param {string} p.profileUrl        - Link to employee profile in admin
 */
export function onboardingCompleted({
  hrFirstName,
  employeeName,
  employeeEmail,
  department,
  jobRole,
  startDate,
  profileUrl,
}) {
  const startFormatted = new Date(startDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const body = `
    <div style="text-align:center;margin-bottom:20px">
      <div style="display:inline-block;background:#D1FAE5;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px">✅</div>
    </div>
    <h1 class="title" style="text-align:center">Onboarding Complete</h1>
    <p class="text">Hi ${hrFirstName},</p>
    <p class="text">
      <strong>${employeeName}</strong> has completed all onboarding tasks and their profile is fully set up on banntaHR.
    </p>
    <div class="info-box">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;border-bottom:1px solid #F3F4F6"><span style="font-size:13px;color:#6B7280">Employee</span></td><td style="padding:6px 0;border-bottom:1px solid #F3F4F6;text-align:right"><span style="font-size:13px;font-weight:600;color:#1E1B4B">${employeeName}</span></td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #F3F4F6"><span style="font-size:13px;color:#6B7280">Email</span></td><td style="padding:6px 0;border-bottom:1px solid #F3F4F6;text-align:right"><span style="font-size:13px;color:#4F46E5">${employeeEmail}</span></td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #F3F4F6"><span style="font-size:13px;color:#6B7280">Department</span></td><td style="padding:6px 0;border-bottom:1px solid #F3F4F6;text-align:right"><span style="font-size:13px;font-weight:600;color:#1E1B4B">${department}</span></td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #F3F4F6"><span style="font-size:13px;color:#6B7280">Role</span></td><td style="padding:6px 0;border-bottom:1px solid #F3F4F6;text-align:right"><span style="font-size:13px;font-weight:600;color:#1E1B4B">${jobRole}</span></td></tr>
        <tr><td style="padding:6px 0"><span style="font-size:13px;color:#6B7280">Start Date</span></td><td style="padding:6px 0;text-align:right"><span style="font-size:13px;font-weight:600;color:#1E1B4B">${startFormatted}</span></td></tr>
      </table>
    </div>
    <p class="text-muted">
      You can review their full profile, assign them to a payroll group, or update their details from the admin panel.
    </p>
  `;

  return defaultLayout({
    title: `${employeeName} has completed onboarding`,
    previewText: `${employeeName} is all set — their profile is fully complete.`,
    body,
    cta: { url: profileUrl, label: "View Employee Profile" },
  });
}
