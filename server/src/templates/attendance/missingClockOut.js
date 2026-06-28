// templates/attendance/missingClockOut.js

import { notificationLayout } from "../layouts/notification.js";

/**
 * @param {object} p
 * @param {string} p.firstName
 * @param {string} p.date            - ISO date string
 * @param {string} p.clockInTime     - "HH:MM"
 * @param {string} p.dashboardUrl
 */
export function missingClockOut({
  firstName,
  date,
  clockInTime,
  dashboardUrl,
}) {
  const dateFormatted = new Date(date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const body = `
    <h1 class="title">Missing clock-out detected</h1>
    <p class="text">Hi ${firstName},</p>
    <p class="text">
      We noticed you clocked in at <strong>${clockInTime}</strong> on <strong>${dateFormatted}</strong>
      but there's no corresponding clock-out recorded for that day.
    </p>
    <div class="meta-row">
      📅 &nbsp;<strong>${dateFormatted}</strong> &nbsp;·&nbsp; 🕐 Clocked in: <strong>${clockInTime}</strong> &nbsp;·&nbsp; Clock-out: <span style="color:#DC2626;font-weight:700">Missing</span>
    </div>
    <p class="text">
      Please log into banntaHR and update your attendance record as soon as possible.
      Missing entries may affect your payroll and leave calculations.
    </p>
    <p class="text-muted" style="font-size:12px">
      If you believe this is an error, please contact your HR team.
    </p>
  `;

  return notificationLayout({
    title: "Missing clock-out — action required",
    previewText: `You forgot to clock out on ${dateFormatted}. Please update your attendance.`,
    body,
    cta: { url: dashboardUrl, label: "Update Attendance" },
    icon: "⚠️",
  });
}
