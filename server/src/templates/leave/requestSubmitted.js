// templates/leave/requestSubmitted.js
// Sent to the employee confirming their leave request was submitted.

import { defaultLayout } from "../layouts/default.js";

/**
 * @param {object} p
 * @param {string} p.firstName
 * @param {string} p.leaveType       - e.g. "Annual Leave", "Sick Leave"
 * @param {string} p.startDate       - ISO date string
 * @param {string} p.endDate         - ISO date string
 * @param {number} p.days            - Total working days
 * @param {string} [p.reason]
 * @param {string} p.trackUrl        - Link to leave request in app
 */
export function leaveRequestSubmitted({
  firstName,
  leaveType,
  startDate,
  endDate,
  days,
  reason,
  trackUrl,
}) {
  const fmt = (d) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const body = `
    <div style="text-align:center;margin-bottom:20px">
      <div style="display:inline-block;background:#EEF2FF;border-radius:50%;width:52px;height:52px;line-height:52px;font-size:26px">📋</div>
    </div>
    <h1 class="title">Leave request submitted</h1>
    <p class="text">Hi ${firstName},</p>
    <p class="text">
      Your leave request has been submitted and is currently awaiting approval from your manager.
      You'll receive an email as soon as it's reviewed.
    </p>
    <div class="info-box">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Leave Type</td><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#1E1B4B;text-align:right"><span class="badge badge-info">${leaveType}</span></td></tr>
        <tr><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">From</td><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#1E1B4B;text-align:right">${fmt(startDate)}</td></tr>
        <tr><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">To</td><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#1E1B4B;text-align:right">${fmt(endDate)}</td></tr>
        <tr><td style="padding:7px 0${reason ? ";border-bottom:1px solid #F3F4F6" : ""};font-size:13px;color:#6B7280">Duration</td><td style="padding:7px 0${reason ? ";border-bottom:1px solid #F3F4F6" : ""};font-size:13px;font-weight:700;color:#4F46E5;text-align:right">${days} working ${days === 1 ? "day" : "days"}</td></tr>
        ${reason ? `<tr><td colspan="2" style="padding:7px 0;font-size:13px;color:#6B7280">Reason: <span style="color:#374151">${reason}</span></td></tr>` : ""}
      </table>
    </div>
    <div style="background:#FEF3C7;border-radius:8px;padding:12px 16px;margin:12px 0">
      <p style="margin:0;font-size:13px;color:#92400E">
        ⏳ <strong>Status: Pending Approval</strong> — your manager has been notified.
      </p>
    </div>
    <p class="text-muted">You can track or cancel your request at any time from the app.</p>
  `;

  return defaultLayout({
    title: "Leave request submitted — pending approval",
    previewText: `Your ${leaveType} request (${days} days) is awaiting approval.`,
    body,
    cta: { url: trackUrl, label: "Track My Request" },
  });
}
