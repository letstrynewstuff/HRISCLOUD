// templates/auth/verifyEmail.js

import { minimalLayout } from "../layouts/minimal.js";

/**
 * @param {object} p
 * @param {string} p.firstName
 * @param {string} p.verifyUrl
 */
export function verifyEmail({ firstName, verifyUrl }) {
  const body = `
    <h1 class="title">Verify your email address</h1>
    <p class="text">Hi ${firstName},</p>
    <p class="text">
      Thanks for signing up for banntaHR. To complete your registration and activate your account,
      please verify your email address by clicking the button below.
    </p>
    <p class="text-muted">This link is valid for <strong>24 hours</strong>.</p>
    <hr class="divider" />
    <p class="text-muted" style="font-size:12px">
      If the button above doesn't work, copy and paste this URL into your browser:<br>
      <span style="color:#4F46E5;word-break:break-all">${verifyUrl}</span>
    </p>
    <p class="text-muted" style="font-size:12px;margin-top:12px">
      If you didn't create a banntaHR account, you can safely ignore this email.
    </p>
  `;

  return minimalLayout({
    title: "Verify your banntaHR email",
    previewText: "Please verify your email address to activate your account.",
    body,
    cta: { url: verifyUrl, label: "Verify Email Address" },
  });
}
