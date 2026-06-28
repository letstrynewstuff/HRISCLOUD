// templates/performance/reviewReminder.js

import { defaultLayout } from "../layouts/default.js";

/**
 * @param {object} p
 * @param {string} p.firstName
 * @param {string} p.reviewType      - e.g. "Quarterly", "Annual", "Probation"
 * @param {string} p.dueDate         - ISO date string
 * @param {string} [p.revieweeName]  - If the recipient is the reviewer
 * @param {string} p.reviewUrl
 */
export function reviewReminder({
  firstName,
  reviewType,
  dueDate,
  revieweeName,
  reviewUrl,
}) {
  const dueFormatted = new Date(dueDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const isReviewer = !!revieweeName;

  const body = `
    <div style="text-align:center;margin-bottom:20px">
      <div style="display:inline-block;background:#EDE9FE;border-radius:50%;width:52px;height:52px;line-height:52px;font-size:26px">📊</div>
    </div>
    <h1 class="title">${reviewType} Performance Review Due</h1>
    <p class="text">Hi ${firstName},</p>
    ${
      isReviewer
        ? `
    <p class="text">
      A reminder that you have a pending <strong>${reviewType} performance review</strong>
      to complete for <strong>${revieweeName}</strong>.
    </p>`
        : `
    <p class="text">
      Your <strong>${reviewType} performance review</strong> is coming up.
      Please complete your self-assessment before the deadline.
    </p>`
    }
    <div class="info-box" style="border-left:4px solid #7C3AED;background:#F5F3FF">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;border-bottom:1px solid #EDE9FE;font-size:13px;color:#6B7280">Review Type</td><td style="padding:6px 0;border-bottom:1px solid #EDE9FE;font-size:13px;font-weight:600;color:#1E1B4B;text-align:right">${reviewType}</td></tr>
        ${isReviewer ? `<tr><td style="padding:6px 0;border-bottom:1px solid #EDE9FE;font-size:13px;color:#6B7280">Reviewee</td><td style="padding:6px 0;border-bottom:1px solid #EDE9FE;font-size:13px;font-weight:600;color:#1E1B4B;text-align:right">${revieweeName}</td></tr>` : ""}
        <tr><td style="padding:6px 0;font-size:13px;color:#6B7280">Due Date</td><td style="padding:6px 0;font-size:13px;font-weight:700;color:#DC2626;text-align:right">${dueFormatted}</td></tr>
      </table>
    </div>
    <p class="text-muted">
      Completing reviews on time helps ensure everyone gets timely, meaningful feedback.
      Please don't wait until the last minute.
    </p>
  `;

  return defaultLayout({
    title: `Action required: ${reviewType} performance review due ${dueFormatted}`,
    previewText: `Your ${reviewType} review is due ${dueFormatted}. Please complete it now.`,
    body,
    cta: { url: reviewUrl, label: "Complete Review Now" },
  });
}
