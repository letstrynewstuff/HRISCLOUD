// templates/performance/reviewCompleted.js

import { defaultLayout } from "../layouts/default.js";

/**
 * @param {object} p
 * @param {string} p.firstName
 * @param {string} p.reviewType
 * @param {string} p.reviewPeriod    - e.g. "Q2 2025", "Jan–Jun 2025"
 * @param {string} p.reviewerName
 * @param {string} [p.overallRating] - e.g. "Exceeds Expectations"
 * @param {string} [p.note]          - Short note from reviewer
 * @param {string} p.reviewUrl
 */
export function reviewCompleted({
  firstName,
  reviewType,
  reviewPeriod,
  reviewerName,
  overallRating,
  note,
  reviewUrl,
}) {
  const ratingColor =
    {
      "Exceeds Expectations": "#059669",
      "Meets Expectations": "#4F46E5",
      "Below Expectations": "#D97706",
      "Needs Improvement": "#DC2626",
    }[overallRating] ?? "#4F46E5";

  const body = `
    <div style="text-align:center;margin-bottom:20px">
      <div style="display:inline-block;background:#D1FAE5;border-radius:50%;width:52px;height:52px;line-height:52px;font-size:26px">🏅</div>
    </div>
    <h1 class="title">Your performance review is complete</h1>
    <p class="text">Hi ${firstName},</p>
    <p class="text">
      Your <strong>${reviewType} performance review</strong> for <strong>${reviewPeriod}</strong>
      has been completed and submitted by <strong>${reviewerName}</strong>.
    </p>
    <div class="info-box">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Review Period</td><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#1E1B4B;text-align:right">${reviewPeriod}</td></tr>
        <tr><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Reviewed by</td><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#1E1B4B;text-align:right">${reviewerName}</td></tr>
        ${overallRating ? `<tr><td style="padding:7px 0;font-size:13px;color:#6B7280">Overall Rating</td><td style="padding:7px 0;text-align:right"><span style="background:${ratingColor}22;color:${ratingColor};padding:3px 10px;border-radius:99px;font-size:12px;font-weight:700">${overallRating}</span></td></tr>` : ""}
      </table>
    </div>
    ${
      note
        ? `
    <div class="info-box" style="border-left:4px solid ${ratingColor};background:${ratingColor}11">
      <p style="margin:0 0 4px;font-size:12px;color:#6B7280">Note from ${reviewerName}:</p>
      <p style="margin:0;font-size:14px;color:#374151">"${note}"</p>
    </div>`
        : ""
    }
    <p class="text-muted">
      You can view the full review, including detailed feedback across all competencies, in your performance dashboard.
    </p>
  `;

  return defaultLayout({
    title: `Your ${reviewType} review is complete — ${reviewPeriod}`,
    previewText: `${reviewerName} has completed your ${reviewType} performance review. View your results.`,
    body,
    cta: { url: reviewUrl, label: "View My Review" },
  });
}
