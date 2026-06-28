// templates/payroll/taxDocuments.js
// Sent when annual tax documents (P60 / WHT certificate etc.) are ready.

import { defaultLayout } from "../layouts/default.js";

/**
 * @param {object} p
 * @param {string} p.firstName
 * @param {string} p.taxYear         - e.g. "2024/2025"
 * @param {string} p.documentType    - e.g. "P60", "WHT Certificate", "Annual Tax Summary"
 * @param {string} p.documentsUrl
 */
export function taxDocuments({
  firstName,
  taxYear,
  documentType,
  documentsUrl,
}) {
  const body = `
    <div style="text-align:center;margin-bottom:20px">
      <div style="display:inline-block;background:#EDE9FE;border-radius:50%;width:52px;height:52px;line-height:52px;font-size:26px">📑</div>
    </div>
    <h1 class="title">Your tax documents are ready</h1>
    <p class="text">Hi ${firstName},</p>
    <p class="text">
      Your <strong>${documentType}</strong> for the <strong>${taxYear}</strong> tax year
      is now available for download on banntaHR.
    </p>
    <div class="info-box">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Document</td><td style="padding:7px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#1E1B4B;text-align:right">${documentType}</td></tr>
        <tr><td style="padding:7px 0;font-size:13px;color:#6B7280">Tax Year</td><td style="padding:7px 0;font-size:13px;font-weight:600;color:#7C3AED;text-align:right">${taxYear}</td></tr>
      </table>
    </div>
    <p class="text-muted">
      Please keep a copy of this document for your records. You may need it for filing your personal tax return.
      If you believe there are any errors, please contact your HR or payroll team.
    </p>
  `;

  return defaultLayout({
    title: `Your ${documentType} for ${taxYear} is ready`,
    previewText: `Your ${documentType} (${taxYear}) is available for download.`,
    body,
    cta: { url: documentsUrl, label: "Download My Documents" },
  });
}
