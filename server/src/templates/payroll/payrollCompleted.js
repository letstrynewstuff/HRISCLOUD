// templates/payroll/payrollCompleted.js
// Sent to HR admin / payroll manager when a payroll run finishes processing.

import { defaultLayout } from "../layouts/default.js";

/**
 * @param {object} p
 * @param {string} p.adminFirstName
 * @param {string} p.companyName
 * @param {string} p.payrollPeriod    - e.g. "June 2025"
 * @param {number} p.employeeCount
 * @param {string} p.totalGross       - Formatted string e.g. "₦12,450,000.00"
 * @param {string} p.totalNet
 * @param {string} p.totalDeductions
 * @param {string} p.processedAt      - ISO date string
 * @param {string} p.payrollUrl
 */
export function payrollCompleted({
  adminFirstName,
  companyName,
  payrollPeriod,
  employeeCount,
  totalGross,
  totalNet,
  totalDeductions,
  processedAt,
  payrollUrl,
}) {
  const processedFormatted = new Date(processedAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const body = `
    <div style="text-align:center;margin-bottom:20px">
      <div style="display:inline-block;background:#D1FAE5;border-radius:50%;width:52px;height:52px;line-height:52px;font-size:26px">💰</div>
    </div>
    <h1 class="title">Payroll run complete</h1>
    <p class="text">Hi ${adminFirstName},</p>
    <p class="text">
      The <strong>${payrollPeriod}</strong> payroll for <strong>${companyName}</strong> has been
      successfully processed. Here's a summary:
    </p>
    <div class="info-box">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Pay Period</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#1E1B4B;text-align:right">${payrollPeriod}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Employees Paid</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:600;color:#1E1B4B;text-align:right">${employeeCount}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Total Gross</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:14px;font-weight:700;color:#1E1B4B;text-align:right">${totalGross}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#6B7280">Total Deductions</td><td style="padding:8px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#DC2626;text-align:right">− ${totalDeductions}</td></tr>
        <tr><td style="padding:8px 0;font-size:13px;color:#6B7280">Total Net Pay</td><td style="padding:8px 0;font-size:15px;font-weight:800;color:#059669;text-align:right">${totalNet}</td></tr>
      </table>
    </div>
    <div style="background:#F8FAFC;border-radius:8px;padding:10px 14px;margin:12px 0;font-size:12px;color:#6B7280">
      ✅ Processed at ${processedFormatted}
    </div>
    <p class="text-muted">
      Payslips have been automatically sent to all employees. You can view the full payroll report and download a summary from the payroll dashboard.
    </p>
  `;

  return defaultLayout({
    title: `${payrollPeriod} payroll processed — ${companyName}`,
    previewText: `Payroll complete: ${employeeCount} employees paid, ${totalNet} net total.`,
    body,
    cta: { url: payrollUrl, label: "View Payroll Report" },
  });
}
