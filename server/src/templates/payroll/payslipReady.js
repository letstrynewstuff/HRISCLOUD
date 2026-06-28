// templates/payroll/payslipReady.js
// Sent to each employee when their payslip is available.

import { defaultLayout } from "../layouts/default.js";

/**
 * @param {object} p
 * @param {string} p.firstName
 * @param {string} p.payrollPeriod    - e.g. "June 2025"
 * @param {string} p.grossPay
 * @param {string} p.netPay
 * @param {string} p.totalDeductions
 * @param {string} [p.paymentDate]    - ISO date string, when funds are transferred
 * @param {string} p.payslipUrl       - Link to view/download payslip
 */
export function payslipReady({
  firstName,
  payrollPeriod,
  grossPay,
  netPay,
  totalDeductions,
  paymentDate,
  payslipUrl,
}) {
  const paymentFormatted = paymentDate
    ? new Date(paymentDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const body = `
    <div style="text-align:center;margin-bottom:20px">
      <div style="display:inline-block;background:#EEF2FF;border-radius:50%;width:52px;height:52px;line-height:52px;font-size:26px">📄</div>
    </div>
    <h1 class="title">Your payslip is ready</h1>
    <p class="text">Hi ${firstName},</p>
    <p class="text">
      Your payslip for <strong>${payrollPeriod}</strong> is now available. Here's a quick summary:
    </p>
    <div class="info-box">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Pay Period</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#1E1B4B;text-align:right">${payrollPeriod}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Gross Pay</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#1E1B4B;text-align:right">${grossPay}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Deductions</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#DC2626;text-align:right">− ${totalDeductions}</td></tr>
        <tr><td style="padding:8px 0${paymentFormatted ? ";border-bottom:1px solid #F3F4F6" : ""};font-size:14px;font-weight:700;color:#1E1B4B">Net Pay</td><td style="padding:8px 0${paymentFormatted ? ";border-bottom:1px solid #F3F4F6" : ""};font-size:18px;font-weight:800;color:#059669;text-align:right">${netPay}</td></tr>
        ${paymentFormatted ? `<tr><td style="padding:8px 0;font-size:13px;color:#6B7280">Payment Date</td><td style="padding:8px 0;font-size:13px;font-weight:600;color:#4F46E5;text-align:right">${paymentFormatted}</td></tr>` : ""}
      </table>
    </div>
    <p class="text-muted">
      You can view the full breakdown including allowances, taxes, and deductions in your payslip.
      Contact HR if you have any questions about your pay.
    </p>
  `;

  return defaultLayout({
    title: `Your ${payrollPeriod} payslip is ready`,
    previewText: `${payrollPeriod} payslip: ${netPay} net pay. View your full breakdown.`,
    body,
    cta: { url: payslipUrl, label: "View & Download Payslip" },
  });
}
