// templates/employee/workAnniversary.js
// Sent on the employee's employment anniversary date.

import { defaultLayout } from "../layouts/default.js";

/**
 * @param {object} p
 * @param {string} p.firstName
 * @param {string} p.companyName
 * @param {number} p.years           - Number of years completed
 * @param {string} [p.message]       - Optional HR message
 * @param {string} [p.dashboardUrl]
 */
export function workAnniversary({
  firstName,
  companyName,
  years,
  message,
  dashboardUrl,
}) {
  const milestoneColor =
    years >= 10 ? "#D97706" : years >= 5 ? "#7C3AED" : "#4F46E5";
  const milestoneBg =
    years >= 10 ? "#FEF3C7" : years >= 5 ? "#EDE9FE" : "#EEF2FF";
  const trophy = years >= 10 ? "🏆" : years >= 5 ? "🥇" : "⭐";

  const body = `
    <div style="text-align:center;padding:8px 0 20px">
      <div style="font-size:52px">${trophy}</div>
      <div style="display:inline-block;background:${milestoneBg};color:${milestoneColor};
                  font-size:13px;font-weight:700;padding:4px 14px;border-radius:99px;margin-top:8px">
        ${years} ${years === 1 ? "Year" : "Years"} at ${companyName}
      </div>
    </div>
    <h1 class="title" style="text-align:center">
      Happy Work Anniversary, ${firstName}!
    </h1>
    <p class="text" style="text-align:center">
      Today marks <strong>${years} ${years === 1 ? "year" : "years"}</strong> since you joined
      <strong>${companyName}</strong>. Thank you for your dedication, hard work, and the
      positive impact you bring every single day.
    </p>
    ${
      message
        ? `
    <div class="info-box" style="border-left:4px solid ${milestoneColor};background:${milestoneBg};text-align:center;font-style:italic">
      <p style="margin:0;font-size:15px;color:#374151">"${message}"</p>
      <p style="margin:8px 0 0;font-size:12px;color:#6B7280">— The ${companyName} Team</p>
    </div>`
        : ""
    }
    <p class="text" style="text-align:center">
      ${
        years >= 5
          ? "Five or more years is a real milestone — we're incredibly grateful to have you as part of our journey."
          : "We're glad you're part of the team and look forward to achieving great things together."
      }
    </p>
    <p class="text-muted" style="text-align:center">Here's to many more years of success! 🥂</p>
  `;

  return defaultLayout({
    title: `Happy ${years}-Year Anniversary, ${firstName}! ${trophy}`,
    previewText: `${years} ${years === 1 ? "year" : "years"} at ${companyName} — thank you for everything.`,
    body,
    cta: dashboardUrl ? { url: dashboardUrl, label: "Open banntaHR" } : null,
  });
}
