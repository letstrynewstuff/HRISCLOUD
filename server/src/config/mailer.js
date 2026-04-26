// src/config/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ─── Transporter ───────────────────────────────────────────────
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── Helpers ───────────────────────────────────────────────────
const FROM = `"${process.env.APP_NAME ?? "HRISCloud"}" <${process.env.SMTP_FROM}>`;
const BASE = process.env.CLIENT_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(to, token) {
  if (process.env.EMAIL_ENABLED === "false") return; 
  const url = `${BASE}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Verify your HRISCloud email",
    html: `
      <p>Thanks for signing up. Click the link below to verify your email address.</p>
      <p><a href="${url}">Verify Email</a></p>
      <p>This link expires in <strong>24 hours</strong>.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    `,
  });
}

export async function sendPasswordResetEmail(to, token) {
  if (process.env.EMAIL_ENABLED === "false") return;
  const url = `${BASE}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Reset your HRISCloud password",
    html: `
      <p>We received a request to reset your password.</p>
      <p><a href="${url}">Reset Password</a></p>
      <p>This link expires in <strong>1 hour</strong>.</p>
      <p>If you didn't request a reset, no action is needed.</p>
    `,
  });
}
export async function sendInviteEmail(
  to,
  { firstName, companyName, tempPassword, loginUrl },
) {
  if (process.env.EMAIL_ENABLED === "false") return; 
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `You've been invited to ${companyName} on HRISCloud`,
    html: `
      <p>Hi ${firstName},</p>
      <p>You've been added to <strong>${companyName}</strong> on HRISCloud.</p>
      <p>Here are your login details:</p>
      <p><strong>Email:</strong> ${to}</p>
      <p><strong>Temporary Password:</strong> ${tempPassword}</p>
      <p><a href="${loginUrl ?? BASE + "/login"}">Login to HRISCloud</a></p>
      <p>Please change your password after your first login.</p>
      <p>If you weren't expecting this, please ignore this email.</p>
    `,
  });
}