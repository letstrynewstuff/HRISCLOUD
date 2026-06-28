// templates/attendance/overtimeApproval.js

import { notificationLayout } from "../layouts/notification.js";

/**
 * @param {object} p
 * @param {string} p.firstName
 * @param {string} p.date
 * @param {number} p.overtimeHours
 * @param {string} p.approvedBy
 * @param {string} [p.compensationType] - "pay" | "time-off-in-lieu" | "none"
 * @param {string} [p.note]
 * @param {string} p.dashboardUrl
 */
export function overtimeApproval({
  firstName,
  date,
  overtimeHours,
  approvedBy,
  compensationType = "pay",
  note,
  dashboardUrl,
}) {
  const dateFormatted = new Date(date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const compLabel =
    {
      pay: "Overtime Pay",
      "time-off-in-lieu": "Time Off in Lieu (TOIL)",
      none: "No additional compensation",
    }[compensationType] ?? compensationType;

  const body = `
    <h1 class="title">Overtime approved ✅</h1>
    <p class="text">Hi ${firstName},</p>
    <p class="text">
      Your overtime for <strong>${dateFormatted}</strong> has been reviewed and approved.
    </p>
    <div class="meta-row">
      📅 &nbsp;<strong>${dateFormatted}</strong>
      &nbsp;·&nbsp; Overtime: <strong style="color:#059669">${overtimeHours}h</strong>
      &nbsp;·&nbsp; Approved by: <strong>${approvedBy}</strong>
    </div>
    <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:10px 14px;margin:12px 0">
      <p style="margin:0;font-size:13px;color:#065F46">
        💼 <strong>Compensation:</strong> ${compLabel}
      </p>
    </div>
    ${
      note
        ? `
    <div style="background:#F8FAFC;border-radius:8px;padding:10px 14px;margin:12px 0;font-size:13px;color:#374151">
      📝 <strong>Note from ${approvedBy}:</strong> "${note}"
    </div>`
        : ""
    }
    <p class="text-muted" style="font-size:12px">
      This overtime record has been added to your attendance history and will be reflected in your next payroll run.
    </p>
  `;

  return notificationLayout({
    title: `Overtime approved — ${overtimeHours}h on ${dateFormatted}`,
    previewText: `Your ${overtimeHours}h overtime on ${dateFormatted} has been approved.`,
    body,
    cta: { url: dashboardUrl, label: "View Attendance" },
    icon: "⏱️",
  });
}
