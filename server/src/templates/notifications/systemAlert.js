// templates/notifications/systemAlert.js

import { notificationLayout } from "../layouts/notification.js";

/**
 * @param {object} p
 * @param {string} p.title
 * @param {string} p.message
 * @param {"info"|"warning"|"critical"} [p.severity="info"]
 * @param {string} [p.actionLabel]
 * @param {string} [p.actionUrl]
 * @param {string} [p.affectedArea]   - e.g. "Payroll", "Attendance", "Leave"
 */
export function systemAlert({
  title,
  message,
  severity = "info",
  actionLabel,
  actionUrl,
  affectedArea,
}) {
  const palette = {
    info: { color: "#4F46E5", bg: "#EEF2FF", icon: "ℹ️", label: "Information" },
    warning: { color: "#D97706", bg: "#FFFBEB", icon: "⚠️", label: "Warning" },
    critical: {
      color: "#DC2626",
      bg: "#FEF2F2",
      icon: "🚨",
      label: "Critical Alert",
    },
  }[severity] ?? {
    color: "#4F46E5",
    bg: "#EEF2FF",
    icon: "ℹ️",
    label: "Information",
  };

  const body = `
    <div style="background:${palette.bg};border:1px solid ${palette.color}33;border-radius:8px;
                padding:10px 14px;margin-bottom:16px;display:inline-block">
      <span style="font-size:12px;font-weight:700;color:${palette.color}">${palette.label}${affectedArea ? ` · ${affectedArea}` : ""}</span>
    </div>
    <h1 class="title">${title}</h1>
    <p class="text">${message}</p>
    <p class="text-muted" style="font-size:12px">
      This is an automated system notification from banntaHR.
      ${severity === "critical" ? "Please take immediate action." : "No immediate action may be required."}
    </p>
  `;

  return notificationLayout({
    title,
    previewText: `${palette.label}: ${title}`,
    body,
    cta:
      actionLabel && actionUrl ? { url: actionUrl, label: actionLabel } : null,
    icon: palette.icon,
  });
}
