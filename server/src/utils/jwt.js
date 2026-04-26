// src/utils/jwt.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error(
    "JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in .env",
  );
}

// ─── Access token (short-lived) ────────────────────────────────
// Payload: { sub: userId, companyId, role }
export function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES ?? "15m",
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET); // throws on invalid/expired
}

// ─── Refresh token (long-lived) ────────────────────────────────
// We store the token's jti (JWT ID) in the DB so we can invalidate it.
export function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES ?? "7d",
  });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}
