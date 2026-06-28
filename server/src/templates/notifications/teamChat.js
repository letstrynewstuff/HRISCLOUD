// templates/notifications/teamChat.js

import { notificationLayout } from "../layouts/notification.js";

/**
 * @param {object} p
 * @param {string} p.firstName
 * @param {string} p.senderName
 * @param {string} p.channelName     - e.g. "Engineering", "General"
 * @param {string} p.preview         - Short message preview (max ~120 chars)
 * @param {string} p.chatUrl
 */
export function teamChat({
  firstName,
  senderName,
  channelName,
  preview,
  chatUrl,
}) {
  const body = `
    <h1 class="title">New message in #${channelName}</h1>
    <p class="text">Hi ${firstName},</p>
    <p class="text">
      <strong>${senderName}</strong> sent a message in <strong>#${channelName}</strong>:
    </p>
    <div style="background:#F8FAFC;border-left:4px solid #4F46E5;border-radius:0 8px 8px 0;
                padding:12px 16px;margin:12px 0;font-size:14px;color:#374151;font-style:italic">
      "${preview}"
    </div>
    <p class="text-muted" style="font-size:12px">
      Reply directly in banntaHR to keep your conversation in one place.
    </p>
  `;

  return notificationLayout({
    title: `New message from ${senderName} in #${channelName}`,
    previewText: `${senderName}: ${preview}`,
    body,
    cta: { url: chatUrl, label: `Open #${channelName}` },
    icon: "💬",
  });
}
