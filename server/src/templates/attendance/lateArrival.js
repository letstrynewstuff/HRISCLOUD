// templates/attendance/lateArrival.js

import { notificationLayout } from "../layouts/notification.js";

/**
 * @param {object} p
 * @param {string} p.firstName
 * @param {string} p.date
 * @param {string} p.clockInTime     - Actual clock-in "HH:MM"
 * @param {string} p.expectedTime    - Expected start "HH:MM"
 * @param {number} p.minutesLate
 * @param {string} [p.policyNote]    - e.g. "3 late arrivals = 1 formal warning"
 * @param {string} p.dashboardUrl
 */
export function lateArrival({
  firstName,
  date,
  clockInTime,
  expectedTime,
  minutesLate,
  policyNote,
  dashboardUrl,
}) {
  const dateFormatted = new Date(date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const body = `
    <h1 class="title">Late arrival recorded</h1>
    <p class="text">Hi ${firstName},</p>
    <p class="text">
      Your attendance record shows a late arrival on <strong>${dateFormatted}</strong>.
    </p>
    <div class="meta-row">
      📅 &nbsp;<strong>${dateFormatted}</strong>
      &nbsp;·&nbsp; Expected: <strong>${expectedTime}</strong>
      &nbsp;·&nbsp; Clocked in: <span style="color:#D97706;font-weight:700">${clockInTime}</span>
      &nbsp;·&nbsp; <span style="color:#DC2626;font-weight:700">${minutesLate} min late</span>
    </div>
    ${
      policyNote
        ? `
    <div style="background:#FEF3C7;border-radius:8px;padding:10px 14px;margin:12px 0;font-size:13px;color:#92400E">
      📋 <strong>Attendance policy:</strong> ${policyNote}
    </div>`
        : ""
    }
    <p class="text">
      If you have a valid reason for the late arrival (e.g. traffic, medical appointment),
      please inform your manager or HR team so it can be noted on your record.
    </p>
    <p class="text-muted" style="font-size:12px">
      This notification is for your information. No immediate action is required unless
      requested by your manager.
    </p>
  `;

  return notificationLayout({
    title: `Late arrival — ${minutesLate} minutes on ${dateFormatted}`,
    previewText: `You were ${minutesLate} minutes late on ${dateFormatted}. View your attendance record.`,
    body,
    cta: { url: dashboardUrl, label: "View Attendance" },
    icon: "🕐",
  });
}
