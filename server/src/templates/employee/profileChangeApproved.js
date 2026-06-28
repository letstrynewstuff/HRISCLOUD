// templates/employee/profileChangeApproved.js
// Sent when HR approves an employee-initiated profile update.

import { defaultLayout } from "../layouts/default.js";

/**
 * @param {object} p
 * @param {string} p.firstName
 * @param {string[]} p.changedFields   - e.g. ["Bank Account", "Address", "Emergency Contact"]
 * @param {string} p.approvedBy        - HR admin name
 * @param {string} p.approvedAt        - ISO date string
 * @param {string} p.profileUrl
 */
export function profileChangeApproved({
  firstName,
  changedFields,
  approvedBy,
  approvedAt,
  profileUrl,
}) {
  const approvedFormatted = new Date(approvedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const body = `
    <div style="text-align:center;margin-bottom:20px">
      <div style="display:inline-block;background:#D1FAE5;border-radius:50%;width:52px;height:52px;line-height:52px;font-size:26px">✅</div>
    </div>
    <h1 class="title">Profile update approved</h1>
    <p class="text">Hi ${firstName},</p>
    <p class="text">
      Your recent profile update request has been reviewed and approved by HR.
      The following changes are now live on your account:
    </p>
    <div class="info-box">
      ${changedFields
        .map(
          (field) => `
      <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #F3F4F6">
        <span style="color:#059669;font-size:16px">✓</span>
        <span style="font-size:14px;font-weight:600;color:#1E1B4B">${field}</span>
      </div>`,
        )
        .join("")}
    </div>
    <div class="info-box" style="margin-top:12px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:5px 0;font-size:13px;color:#6B7280">Approved by</td>
          <td style="padding:5px 0;font-size:13px;font-weight:600;color:#1E1B4B;text-align:right">${approvedBy}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;font-size:13px;color:#6B7280">Approved at</td>
          <td style="padding:5px 0;font-size:13px;color:#1E1B4B;text-align:right">${approvedFormatted}</td>
        </tr>
      </table>
    </div>
    <p class="text-muted">
      If you did not request these changes or believe this is an error, please contact your HR team immediately.
    </p>
  `;

  return defaultLayout({
    title: "Your profile update has been approved",
    previewText: "Your profile changes are now live on banntaHR.",
    body,
    cta: { url: profileUrl, label: "View My Profile" },
  });
}
