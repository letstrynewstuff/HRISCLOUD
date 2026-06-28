// src/services/email.service.js
//
// Single entry point for ALL outbound email in banntaHR.
//
// Routing logic:
//   EMAIL_ENABLED=false  → drop silently (dev/test mode)
//   Resend count < threshold  → send via Resend API
//   Resend count >= threshold → failover to Zoho SMTP
//   Resend send fails          → auto-retry via SMTP
//
// Usage:
//   import { emailService } from "./services/email.service.js";
//   await emailService.send({ to, subject, html });
//
// Template helpers re-export from the bottom of this file for convenience:
//   import { sendVerificationEmail, sendInviteEmail } from "./email.service.js";

import dotenv from "dotenv";
dotenv.config();

import { resend, resendCounter } from "../config/resend.js";
import { getSmtpTransporter } from "../config/smtp.js";

// ─── Constants ────────────────────────────────────────────────
const APP_NAME = process.env.APP_NAME ?? "banntaHR";
const FROM_RESEND =
  process.env.EMAIL_FROM_RESEND ??
  process.env.EMAIL_FROM ??
  "support@bantahr.com";
const FROM_SMTP =
  process.env.EMAIL_FROM_SMTP ?? process.env.SMTP_USER ?? "support@bantahr.com";
const FROM_NAME = APP_NAME;

// ─── Internal senders ─────────────────────────────────────────

async function _sendViaResend({ to, subject, html, replyTo }) {
  const { data, error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_RESEND}>`,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    reply_to: replyTo,
  });

  if (error) throw new Error(`Resend: ${error.message}`);

  resendCounter.increment();
  return { provider: "resend", id: data?.id };
}

async function _sendViaSmtp({ to, subject, html, replyTo }) {
  const transporter = getSmtpTransporter();

  const info = await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_SMTP}>`,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject,
    html,
    replyTo: replyTo ?? FROM_SMTP,
  });

  return { provider: "smtp", id: info.messageId };
}

// ─── Core send function ───────────────────────────────────────

/**
 * Send a single email through the active provider.
 *
 * @param {object}          opts
 * @param {string|string[]} opts.to        Recipient(s)
 * @param {string}          opts.subject
 * @param {string}          opts.html      Full HTML string (use a layout template)
 * @param {string}          [opts.replyTo]
 * @param {boolean}         [opts.forceSmtp=false]  Skip Resend, go straight to SMTP
 * @returns {Promise<{ provider: string, id: string }>}
 */
async function send({ to, subject, html, replyTo, forceSmtp = false }) {
  // ── Guard: email disabled ──────────────────────────────────
  if (process.env.EMAIL_ENABLED === "false") {
    console.log(`[email] DISABLED — would have sent "${subject}" to ${to}`);
    return { provider: "disabled", id: null };
  }

  // ── Validate required fields ───────────────────────────────
  if (!to || !subject || !html) {
    throw new Error("[email] send() requires to, subject, and html.");
  }

  const useSmtp = forceSmtp || !resendCounter.canUse;

  if (!useSmtp) {
    // ── Path A: Resend ─────────────────────────────────────
    try {
      const result = await _sendViaResend({ to, subject, html, replyTo });
      console.log(
        `[email] ✓ Resend (${resendCounter.value}/${resendCounter.threshold}) → "${subject}" → ${to}`,
      );
      return result;
    } catch (err) {
      // Resend failed — warn and fall through to SMTP
      console.warn(
        `[email] Resend failed, falling back to SMTP: ${err.message}`,
      );
    }
  } else {
    console.log(
      `[email] Resend threshold reached (${resendCounter.value}/${resendCounter.threshold}) — routing to SMTP.`,
    );
  }

  // ── Path B: SMTP (Zoho) ────────────────────────────────────
  try {
    const result = await _sendViaSmtp({ to, subject, html, replyTo });
    console.log(`[email] ✓ SMTP → "${subject}" → ${to}`);
    return result;
  } catch (smtpErr) {
    console.error(`[email] SMTP also failed: ${smtpErr.message}`);
    throw new Error(
      `Email delivery failed (both providers): ${smtpErr.message}`,
    );
  }
}

// ─── Status helper ────────────────────────────────────────────

function status() {
  return {
    resendCount: resendCounter.value,
    resendThreshold: resendCounter.threshold,
    resendLimit: resendCounter.limit,
    activeProvider: resendCounter.canUse ? "resend" : "smtp",
    emailEnabled: process.env.EMAIL_ENABLED !== "false",
  };
}

// ─── Public service object ────────────────────────────────────
export const emailService = { send, status };

// ═══════════════════════════════════════════════════════════════
// NAMED EMAIL HELPERS
// These replace the old mailer.js functions.
// Import them directly: import { sendVerificationEmail } from "./email.service.js"
// ═══════════════════════════════════════════════════════════════

const BASE = process.env.CLIENT_URL ?? "http://localhost:3000";

// ── Auth ──────────────────────────────────────────────────────

export async function sendVerificationEmail(to, token) {
  const { verifyEmail } = await import("../templates/auth/verifyEmail.js");
  return send({
    to,
    subject: "Verify your banntaHR email address",
    html: verifyEmail({
      firstName: "", // caller can pass firstName if they have it
      verifyUrl: `${BASE}/verify-email?token=${token}`,
    }),
  });
}

/**
 * Extended version — pass firstName so the template can personalise.
 */
export async function sendVerificationEmailFull(to, { token, firstName = "" }) {
  const { verifyEmail } = await import("../templates/auth/verifyEmail.js");
  return send({
    to,
    subject: "Verify your banntaHR email address",
    html: verifyEmail({
      firstName,
      verifyUrl: `${BASE}/verify-email?token=${token}`,
    }),
  });
}

export async function sendPasswordResetEmail(
  to,
  { token, firstName = "", ipAddress },
) {
  const { passwordReset } = await import("../templates/auth/passwordReset.js");
  return send({
    to,
    subject: "Reset your banntaHR password",
    html: passwordReset({
      firstName,
      resetUrl: `${BASE}/reset-password?token=${token}`,
      requestedAt: new Date().toISOString(),
      ipAddress,
    }),
  });
}

export async function sendPasswordChangedEmail(
  to,
  { firstName = "", ipAddress },
) {
  const { changePassword } =
    await import("../templates/auth/changePassword.js");
  return send({
    to,
    subject: "Your banntaHR password was changed",
    html: changePassword({
      firstName,
      changedAt: new Date().toISOString(),
      ipAddress,
      supportUrl: `${BASE}/support`,
    }),
  });
}

export async function sendTwoFactorCodeEmail(
  to,
  { firstName = "", code, ipAddress },
) {
  const { twoFactorCode } = await import("../templates/auth/twoFactorCode.js");
  return send({
    to,
    subject: `${code} is your banntaHR login code`,
    html: twoFactorCode({ firstName, code, expiresIn: 10, ipAddress }),
  });
}

// ── Employee ──────────────────────────────────────────────────

export async function sendInviteEmail(
  to,
  {
    firstName,
    companyName,
    inviterName = "Your HR Team",
    email,
    tempPassword,
    loginUrl,
    department,
    jobRole,
  },
) {
  const { employeeInvite } = await import("../templates/employee/invite.js");
  return send({
    to,
    subject: `You've been invited to join ${companyName} on banntaHR`,
    html: employeeInvite({
      firstName,
      companyName,
      inviterName,
      email: email ?? to,
      tempPassword,
      loginUrl: loginUrl ?? `${BASE}/login`,
      department,
      jobRole,
    }),
  });
}

export async function sendEmployeeWelcomeEmail(
  to,
  { firstName, companyName, department, managerName },
) {
  const { employeeWelcome } = await import("../templates/employee/welcome.js");
  return send({
    to,
    subject: `Welcome to ${companyName} on banntaHR!`,
    html: employeeWelcome({
      firstName,
      companyName,
      dashboardUrl: `${BASE}/dashboard`,
      department,
      managerName,
    }),
  });
}

export async function sendBirthdayEmail(
  to,
  { firstName, companyName, message },
) {
  const { birthdayGreeting } =
    await import("../templates/employee/birthdayGreeting.js");
  return send({
    to,
    subject: `Happy Birthday, ${firstName}! 🎂`,
    html: birthdayGreeting({
      firstName,
      companyName,
      message,
      dashboardUrl: `${BASE}/dashboard`,
    }),
  });
}

export async function sendAnniversaryEmail(
  to,
  { firstName, companyName, years, message },
) {
  const { workAnniversary } =
    await import("../templates/employee/workAnniversary.js");
  return send({
    to,
    subject: `Happy ${years}-Year Work Anniversary, ${firstName}! ⭐`,
    html: workAnniversary({
      firstName,
      companyName,
      years,
      message,
      dashboardUrl: `${BASE}/dashboard`,
    }),
  });
}

export async function sendProfileChangeApprovedEmail(
  to,
  { firstName, changedFields, approvedBy },
) {
  const { profileChangeApproved } =
    await import("../templates/employee/profileChangeApproved.js");
  return send({
    to,
    subject: "Your profile update has been approved",
    html: profileChangeApproved({
      firstName,
      changedFields,
      approvedBy,
      approvedAt: new Date().toISOString(),
      profileUrl: `${BASE}/profile`,
    }),
  });
}

export async function sendOnboardingCompletedEmail(
  to,
  {
    hrFirstName,
    employeeName,
    employeeEmail,
    department,
    jobRole,
    startDate,
    profileUrl,
  },
) {
  const { onboardingCompleted } =
    await import("../templates/employee/onboardingCompleted.js");
  return send({
    to,
    subject: `${employeeName} has completed onboarding`,
    html: onboardingCompleted({
      hrFirstName,
      employeeName,
      employeeEmail,
      department,
      jobRole,
      startDate,
      profileUrl,
    }),
  });
}

// ── Company ───────────────────────────────────────────────────

export async function sendCompanyWelcomeEmail(
  to,
  { firstName, companyName, trialDays },
) {
  const { companyWelcome } = await import("../templates/company/welcome.js");
  return send({
    to,
    subject: `Welcome to banntaHR — your ${companyName} workspace is ready`,
    html: companyWelcome({
      firstName,
      companyName,
      loginUrl: `${BASE}/login`,
      trialDays,
    }),
  });
}

export async function sendTrialEndingEmail(
  to,
  { firstName, companyName, daysLeft, expiryDate },
) {
  const { trialEnding } = await import("../templates/company/trialEnding.js");
  return send({
    to,
    subject: `Your banntaHR trial ${daysLeft === 1 ? "ends tomorrow" : `ends in ${daysLeft} days`}`,
    html: trialEnding({
      firstName,
      companyName,
      daysLeft,
      upgradeUrl: `${BASE}/billing`,
      expiryDate,
    }),
  });
}

export async function sendSubscriptionExpiredEmail(
  to,
  { firstName, companyName },
) {
  const { subscriptionExpired } =
    await import("../templates/company/subscriptionExpired.js");
  return send({
    to,
    subject: "Your banntaHR subscription has expired",
    html: subscriptionExpired({
      firstName,
      companyName,
      reactivateUrl: `${BASE}/billing`,
    }),
  });
}

export async function sendAnnouncementEmail(
  recipients,
  { companyName, senderName, subject, message, category, ctaLabel, ctaUrl },
) {
  const { companyAnnouncement } =
    await import("../templates/company/companyAnnouncement.js");
  const html = companyAnnouncement({
    companyName,
    senderName,
    subject,
    message,
    category,
    ctaLabel,
    ctaUrl,
  });
  // Send individually so each recipient doesn't see others' emails
  const results = await Promise.allSettled(
    recipients.map((to) => send({ to, subject, html })),
  );
  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;
  console.log(`[email] Announcement sent: ${sent} ok, ${failed} failed`);
  return { sent, failed };
}

// ── Leave ─────────────────────────────────────────────────────

export async function sendLeaveSubmittedEmail(to, opts) {
  const { leaveRequestSubmitted } =
    await import("../templates/leave/requestSubmitted.js");
  return send({
    to,
    subject: `Leave request submitted — ${opts.leaveType}`,
    html: leaveRequestSubmitted({ ...opts, trackUrl: `${BASE}/leaves` }),
  });
}

export async function sendLeaveApprovedEmail(to, opts) {
  const { leaveApproved } = await import("../templates/leave/approved.js");
  return send({
    to,
    subject: `✅ Your ${opts.leaveType} has been approved`,
    html: leaveApproved({ ...opts, dashboardUrl: `${BASE}/leaves` }),
  });
}

export async function sendLeaveRejectedEmail(to, opts) {
  const { leaveRejected } = await import("../templates/leave/rejected.js");
  return send({
    to,
    subject: `Your ${opts.leaveType} request was not approved`,
    html: leaveRejected({ ...opts, dashboardUrl: `${BASE}/leaves` }),
  });
}

export async function sendLeaveReminderEmail(to, opts) {
  const { leaveReminder } = await import("../templates/leave/reminder.js");
  return send({
    to,
    subject: `Reminder: Your ${opts.leaveType} starts tomorrow`,
    html: leaveReminder({ ...opts, dashboardUrl: `${BASE}/leaves` }),
  });
}

// ── Payroll ───────────────────────────────────────────────────

export async function sendPayrollCompletedEmail(to, opts) {
  const { payrollCompleted } =
    await import("../templates/payroll/payrollCompleted.js");
  return send({
    to,
    subject: `${opts.payrollPeriod} payroll processed — ${opts.companyName}`,
    html: payrollCompleted({ ...opts, payrollUrl: `${BASE}/payroll` }),
  });
}

export async function sendPayslipReadyEmail(to, opts) {
  const { payslipReady } = await import("../templates/payroll/payslipReady.js");
  return send({
    to,
    subject: `Your ${opts.payrollPeriod} payslip is ready`,
    html: payslipReady({ ...opts, payslipUrl: `${BASE}/payslips` }),
  });
}
