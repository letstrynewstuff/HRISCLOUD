// templates/company/companyAnnouncement.js
// Sent by HR admin to all staff or a subset.

import { defaultLayout } from "../layouts/default.js";

/**
 * @param {object} p
 * @param {string} p.companyName
 * @param {string} p.senderName      - "From the desk of …"
 * @param {string} p.subject         - Announcement headline
 * @param {string} p.message         - HTML-safe body text
 * @param {string} [p.ctaLabel]      - Optional button label
 * @param {string} [p.ctaUrl]        - Optional button URL
 * @param {string} [p.category]      - e.g. "Policy Update", "Town Hall", "Event"
 */
export function companyAnnouncement({
  companyName,
  senderName,
  subject,
  message,
  ctaLabel,
  ctaUrl,
  category = "Announcement",
}) {
  const body = `
    <div style="margin-bottom:8px">
      <span class="badge badge-info">${category}</span>
    </div>
    <h1 class="title">${subject}</h1>
    <p class="text-muted" style="margin-bottom:20px">From <strong>${senderName}</strong> · ${companyName}</p>
    <hr class="divider" />
    <div class="text" style="white-space:pre-line">${message}</div>
    <hr class="divider" />
    <p class="text-muted">
      This announcement was sent on behalf of <strong>${companyName}</strong> via banntaHR.
      If you have questions, please reach out to your HR team directly.
    </p>
  `;

  return defaultLayout({
    title: `${subject} — ${companyName}`,
    previewText: `${senderName}: ${subject}`,
    body,
    cta: ctaLabel && ctaUrl ? { url: ctaUrl, label: ctaLabel } : null,
  });
}
