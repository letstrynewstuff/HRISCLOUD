// templates/notifications/mention.js

import { notificationLayout } from "../layouts/notification.js";

/**
 * @param {object} p
 * @param {string} p.firstName
 * @param {string} p.mentionedBy
 * @param {string} p.context         - e.g. "a comment on John's leave request"
 * @param {string} p.preview         - The message containing the mention
 * @param {string} p.actionUrl
 */
export function mention({
  firstName,
  mentionedBy,
  context,
  preview,
  actionUrl,
}) {
  const body = `
    <h1 class="title"><strong>${mentionedBy}</strong> mentioned you</h1>
    <p class="text">Hi ${firstName},</p>
    <p class="text">
      <strong>${mentionedBy}</strong> mentioned you in ${context}:
    </p>
    <div style="background:#EEF2FF;border-left:4px solid #4F46E5;border-radius:0 8px 8px 0;
                padding:12px 16px;margin:12px 0;font-size:14px;color:#374151">
      "${preview}"
    </div>
    <p class="text-muted" style="font-size:12px">
      Tap the button below to view the full context and reply.
    </p>
  `;

  return notificationLayout({
    title: `${mentionedBy} mentioned you`,
    previewText: `${mentionedBy} mentioned you: "${preview.slice(0, 80)}…"`,
    body,
    cta: { url: actionUrl, label: "View & Reply" },
    icon: "@",
  });
}
