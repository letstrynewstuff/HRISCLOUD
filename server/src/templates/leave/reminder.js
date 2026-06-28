// templates/leave/reminder.js
// Sent the day before an approved leave starts.

import { defaultLayout } from "../layouts/default.js";

/**
 * @param {object} p
 * @param {string} p.firstName
 * @param {string} p.leaveType
 * @param {string} p.startDate
 * @param {string} p.endDate
 * @param {number} p.days
 * @param {string} [p.handoverNote]  - Optional handover instructions
 * @param {string} p.dashboardUrl
 */
export function leaveReminder({
  firstName,
  leaveType,
  startDate,
  endDate,
  days,
  handoverNote,
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
      <div style="display:inline-block;background:#EEF2FF;border-radius:50%;width:52px;height:52px;line-height:52px;font-size:26px">🗓️</div>
    </div>
    <h1 class="title">Your leave starts tomorrow</h1>
    <p class="text">Hi ${firstName},</p>
    <p class="text">
      This is a friendly reminder that your approved <strong>${leaveType}</strong> begins <strong>tomorrow</strong>.
    </p>
    <div class="info-box">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Leave Type</td><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;text-align:right"><span class="badge badge-info">${leaveType}</span></td></tr>
        <tr><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Starts</td><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#4F46E5;text-align:right">${fmt(startDate)}</td></tr>
        <tr><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Returns</td><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#1E1B4B;text-align:right">${fmt(endDate)}</td></tr>
        <tr><td style="padding:7px 0;font-size:13px;color:#6B7280">Duration</td><td style="padding:7px 0;font-size:13px;font-weight:700;color:#059669;text-align:right">${days} working ${days === 1 ? "day" : "days"}</td></tr>
      </table>
    </div>
    ${
      handoverNote
        ? `
    <div class="info-box" style="border-left:4px solid #D97706;background:#FFFBEB">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#D97706">📋 Handover Note</p>
      <p style="margin:0;font-size:13px;color:#374151">${handoverNote}</p>
    </div>`
        : `
    <div class="info-box" style="border-left:4px solid #D97706;background:#FFFBEB">
      <p style="margin:0;font-size:13px;color:#92400E">
        💡 <strong>Remember:</strong> Ensure any pending tasks are handed over to your team before your leave begins.
      </p>
    </div>`
    }
    <p class="text-muted">Enjoy your time off, ${firstName}! See you when you're back. 😊</p>
  `;

  return defaultLayout({
    title: `Reminder: Your ${leaveType} starts tomorrow`,
    previewText: `Your leave starts tomorrow — ${fmt(startDate)} to ${fmt(endDate)}.`,
    body,
    cta: { url: dashboardUrl, label: "View Leave Details" },
  });
}
