// src/config/smtp.js
// Nodemailer transporter for Zoho Mail SMTP backup.
//
// Zoho SMTP settings (SSL — port 465):
//   Host : smtp.zoho.com
//   Port : 465
//   Secure: true
//
// Zoho SMTP settings (TLS — port 587):
//   Host : smtp.zoho.com
//   Port : 587
//   Secure: false  (STARTTLS)
//
// Generate an App Password in Zoho:
//   My Account → Security → App Passwords → Generate
// Then set SMTP_PASS to that app password, NOT your main Zoho password.

import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.zoho.com",
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: process.env.SMTP_SECURE !== "false", // default true (SSL)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    pool: true, // keep connections alive
    maxConnections: 5,
    rateDelta: 1000, // 1 second between messages
    rateLimit: 5, // max 5 messages per rateDelta
  });
}

let _transporter = null;

/** Lazy-initialise and return the shared transporter */
export function getSmtpTransporter() {
  if (!_transporter) {
    _transporter = createTransporter();
  }
  return _transporter;
}

/** Verify the SMTP connection — call on server startup to catch misconfigs early */
export async function verifySmtpConnection() {
  try {
    const t = getSmtpTransporter();
    await t.verify();
    console.log("[email] SMTP (Zoho) connection verified ✓");
    return true;
  } catch (err) {
    console.warn("[email] SMTP connection failed:", err.message);
    return false;
  }
}
