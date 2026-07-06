

// src/config/mailer.js
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = `${process.env.APP_NAME ?? "banntaHR"} <${process.env.EMAIL_FROM ?? "onboarding@resend.dev"}>`;
const BASE = process.env.CLIENT_URL ?? "http://localhost:3000";

// ─── Shared send wrapper ───────────────────────────────────────
async function send({ to, subject, html }) {
  if (process.env.EMAIL_ENABLED === "false") return;
  const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) throw new Error(`Resend error: ${error.message}`);
  return data;
}

// ─── Email functions ───────────────────────────────────────────
export async function sendVerificationEmail(to, token) {
  const url = `${BASE}/verify-email?token=${token}`;
  return send({
    to,
    subject: "Verify your banntaHR email",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1E1B4B">Verify your email</h2>
        <p>Thanks for signing up. Click the button below to verify your email address.</p>
        <a href="${url}"
           style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Verify Email
        </a>
        <p style="color:#6B7280;font-size:13px">This link expires in <strong>24 hours</strong>.<br>
        If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to, token) {
  const url = `${BASE}/reset-password?token=${token}`;
  return send({
    to,
    subject: "Reset your banntaHR password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1E1B4B">Reset your password</h2>
        <p>We received a request to reset your password.</p>
        <a href="${url}"
           style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Reset Password
        </a>
        <p style="color:#6B7280;font-size:13px">This link expires in <strong>1 hour</strong>.<br>
        If you didn't request a reset, no action is needed.</p>
      </div>
    `,
  });
}

export async function sendInviteEmail(to, { firstName, companyName, tempPassword, loginUrl }) {
  return send({
    to,
    subject: `You've been invited to ${companyName} on banntaHR`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1E1B4B">Welcome to ${companyName}!</h2>
        <p>Hi ${firstName},</p>
        <p>You've been added to <strong>${companyName}</strong> on banntaHR. Here are your login details:</p>
        <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:4px 0"><strong>Email:</strong> ${to}</p>
          <p style="margin:4px 0"><strong>Temporary Password:</strong> <code style="background:#EEF2FF;padding:2px 6px;border-radius:4px">${tempPassword}</code></p>
        </div>
        <a href="${loginUrl ?? BASE + "/login"}"
           style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin:8px 0">
          Login to banntaHR
        </a>
        <p style="color:#6B7280;font-size:13px">Please change your password after your first login.<br>
        If you weren't expecting this invite, you can safely ignore this email.</p>
      </div>
    `,
  });
}