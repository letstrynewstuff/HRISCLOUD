// templates/auth/twoFactorCode.js
// OTP / 2FA code email — needs to be fast and dead simple.

import { minimalLayout } from "../layouts/minimal.js";

/**
 * @param {object} p
 * @param {string} p.firstName
 * @param {string} p.code            - 6-digit OTP
 * @param {number} [p.expiresIn=10]  - Minutes until expiry
 * @param {string} [p.ipAddress]
 */
export function twoFactorCode({ firstName, code, expiresIn = 10, ipAddress }) {
  const body = `
    <h1 class="title">Your login code</h1>
    <p class="text">Hi ${firstName},</p>
    <p class="text">
      Use the code below to complete your sign-in to banntaHR.
    </p>
    <div class="otp-box">
      <div class="otp-code">${code}</div>
    </div>
    <p class="text-muted" style="text-align:center">
      This code expires in <strong>${expiresIn} minutes</strong>. Do not share it with anyone.
    </p>
    <hr class="divider" />
    ${
      ipAddress
        ? `
    <p class="text-muted" style="font-size:12px">
      Sign-in attempted from IP: <strong>${ipAddress}</strong><br>
      If this wasn't you, change your password immediately.
    </p>`
        : `
    <p class="text-muted" style="font-size:12px">
      If you didn't attempt to sign in, you can ignore this email — your account remains secure.
    </p>`
    }
  `;

  return minimalLayout({
    title: "Your banntaHR login code",
    previewText: `Your verification code is ${code} — expires in ${expiresIn} minutes.`,
    body,
  });
}
