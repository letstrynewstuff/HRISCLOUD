// templates/leave/rejected.js

import { defaultLayout } from "../layouts/default.js";

/**
 * @param {object} p
 * @param {string} p.firstName
 * @param {string} p.leaveType
 * @param {string} p.startDate
 * @param {string} p.endDate
 * @param {number} p.days
 * @param {string} p.rejectedBy
 * @param {string} p.reason          - Required reason for rejection
 * @param {string} p.dashboardUrl
 */
export function leaveRejected({
  firstName,
  leaveType,
  startDate,
  endDate,
  days,
  rejectedBy,
  reason,
  dashboardUrl,
}) {
  const fmt = (d) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const body = `
    <div style="text-align:center;margin-bottom:20px">
      <div style="display:inline-block;background:#FEE2E2;border-radius:50%;width:52px;height:52px;line-height:52px;font-size:26px">❌</div>
    </div>
    <h1 class="title">Leave request not approved</h1>
    <p class="text">Hi ${firstName},</p>
    <p class="text">
      Unfortunately, your recent leave request could not be approved at this time.
      Please see the details and reason below.
    </p>
    <div class="info-box">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Leave Type</td><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;text-align:right"><span class="badge badge-danger">${leaveType}</span></td></tr>
        <tr><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">From</td><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#1E1B4B;text-align:right">${fmt(startDate)}</td></tr>
        <tr><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">To</td><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#1E1B4B;text-align:right">${fmt(endDate)}</td></tr>
        <tr><td style="padding:7px 0;font-size:13px;color:#6B7280">Duration</td><td style="padding:7px 0;font-size:13px;color:#1E1B4B;text-align:right">${days} working ${days === 1 ? "day" : "days"}</td></tr>
      </table>
    </div>
    <div class="info-box" style="border-left:4px solid #DC2626;background:#FEF2F2">
      <p style="margin:0 0 4px;font-size:12px;color:#6B7280">Reason from ${rejectedBy}:</p>
      <p style="margin:0;font-size:14px;color:#7F1D1D">"${reason}"</p>
    </div>
    <p class="text">
      You're welcome to submit a new request for different dates or speak with your manager directly to discuss alternatives.
    </p>
    <p class="text-muted">
      If you believe this decision was made in error, please contact your HR department.
    </p>
  `;

  return defaultLayout({
    title: `Your ${leaveType} request was not approved`,
    previewText: `Your leave request for ${days} days was not approved. See reason inside.`,
    body,
    cta: { url: dashboardUrl, label: "View My Leave" },
  });
}
