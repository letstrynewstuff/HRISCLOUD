// templates/leave/approved.js

import { defaultLayout } from "../layouts/default.js";

/**
 * @param {object} p
 * @param {string} p.firstName
 * @param {string} p.leaveType
 * @param {string} p.startDate
 * @param {string} p.endDate
 * @param {number} p.days
 * @param {string} p.approvedBy
 * @param {string} [p.note]          - Optional note from approver
 * @param {number} [p.remainingDays] - Remaining leave balance
 * @param {string} p.dashboardUrl
 */
export function leaveApproved({
  firstName,
  leaveType,
  startDate,
  endDate,
  days,
  approvedBy,
  note,
  remainingDays,
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
      <div style="display:inline-block;background:#D1FAE5;border-radius:50%;width:52px;height:52px;line-height:52px;font-size:26px">✅</div>
    </div>
    <h1 class="title">Leave request approved!</h1>
    <p class="text">Hi ${firstName},</p>
    <p class="text">
      Great news — your leave request has been approved. Enjoy your time off!
    </p>
    <div class="info-box">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Leave Type</td><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;text-align:right"><span class="badge badge-success">${leaveType}</span></td></tr>
        <tr><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">From</td><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#1E1B4B;text-align:right">${fmt(startDate)}</td></tr>
        <tr><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">To</td><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#1E1B4B;text-align:right">${fmt(endDate)}</td></tr>
        <tr><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Duration</td><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:700;color:#059669;text-align:right">${days} working ${days === 1 ? "day" : "days"}</td></tr>
        <tr><td style="padding:7px 0${remainingDays != null ? ";border-bottom:1px solid #F3F4F6" : ""};font-size:13px;color:#6B7280">Approved by</td><td style="padding:7px 0${remainingDays != null ? ";border-bottom:1px solid #F3F4F6" : ""};font-size:13px;font-weight:600;color:#1E1B4B;text-align:right">${approvedBy}</td></tr>
        ${remainingDays != null ? `<tr><td style="padding:7px 0;font-size:13px;color:#6B7280">Remaining Balance</td><td style="padding:7px 0;font-size:13px;font-weight:700;color:#4F46E5;text-align:right">${remainingDays} days</td></tr>` : ""}
      </table>
    </div>
    ${
      note
        ? `
    <div class="info-box" style="border-left:4px solid #059669;background:#F0FDF4">
      <p style="margin:0;font-size:13px;color:#6B7280">Note from ${approvedBy}:</p>
      <p style="margin:4px 0 0;font-size:14px;color:#374151">"${note}"</p>
    </div>`
        : ""
    }
    <p class="text-muted">
      A calendar reminder has been added to your team calendar. If you need to cancel, please do so as early as possible.
    </p>
  `;

  return defaultLayout({
    title: `Your ${leaveType} has been approved`,
    previewText: `✅ Your leave request was approved — ${days} days from ${fmt(startDate)}.`,
    body,
    cta: { url: dashboardUrl, label: "View Leave Details" },
  });
}
