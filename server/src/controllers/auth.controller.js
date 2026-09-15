



// src/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { validationResult } from "express-validator";
import { db } from "../config/db.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../config/mailer.js";

// ─── Cookie config ─────────────────────────────────────────────
const isProd = process.env.NODE_ENV === "production";

const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ─── Internal helpers ──────────────────────────────────────────

function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res
      .status(422)
      .json({ message: "Validation failed.", errors: errors.array() });
    return true;
  }
  return false;
}

async function issueTokenPair(user) {
  const accessPayload = {
    sub: user.id,
    companyId: user.company_id,
    role: user.role,
  };

  const refreshPayload = {
    sub: user.id,
    companyId: user.company_id,
  };

  const accessToken = signAccessToken(accessPayload);
  const refreshToken = signRefreshToken(refreshPayload);

  const tokenHash = await bcrypt.hash(refreshToken, 10);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, tokenHash, expiresAt],
  );

  return { accessToken, refreshToken };
}

// ══════════════════════════════════════════════════════════════
// POST /api/auth/register-company
// ══════════════════════════════════════════════════════════════
export async function registerCompany(req, res) {
  if (handleValidationErrors(req, res)) return;

  const {
    companyName,
    companySlug,
    firstName,
    lastName,
    email,
    password,
  } = req.body;

  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    const existing = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()],
    );
    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    const slugCheck = await client.query(
      "SELECT id FROM companies WHERE slug = $1",
      [companySlug.toLowerCase()],
    );
    if (slugCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ message: "Company slug is already taken." });
    }

    const companyResult = await client.query(
      `INSERT INTO companies (name, slug, created_at)
       VALUES ($1, $2, NOW())
       RETURNING id`,
      [companyName, companySlug.toLowerCase()],
    );
    const companyId = companyResult.rows[0].id;

    const passwordHash = await bcrypt.hash(password, 12);

    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyTokenHash = crypto
      .createHash("sha256")
      .update(verifyToken)
      .digest("hex");
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const userResult = await client.query(
      `INSERT INTO users
         (company_id, first_name, last_name, email, password_hash,
          role, email_verified, verify_token_hash, verify_token_expires, created_at)
       VALUES ($1, $2, $3, $4, $5, 'hr_admin', false, $6, $7, NOW())
       RETURNING id, email, first_name, last_name, role, company_id`,
      [
        companyId,
        firstName,
        lastName,
        email.toLowerCase(),
        passwordHash,
        verifyTokenHash,
        verifyExpires,
      ],
    );
    const user = userResult.rows[0];

    await client.query("COMMIT");

    try {
      await sendVerificationEmail(user.email, verifyToken);
    } catch (mailErr) {
      console.error("Verification email failed:", mailErr.message);
    }

    const { accessToken, refreshToken } = await issueTokenPair(user);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTS);

    return res.status(201).json({
      message: "Company registered. Please verify your email.",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        companyId: user.company_id,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("registerCompany error:", err);
    return res
      .status(500)
      .json({ message: "Server error during registration." });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/auth/login
// ══════════════════════════════════════════════════════════════
export async function login(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { email, password } = req.body;

  try {
    const result = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.password_hash,
              u.role, u.company_id, u.email_verified, u.is_active
       FROM users u
       WHERE u.email = $1`,
      [email.toLowerCase().trim()],
    );

    const user = result.rows[0];

    const dummyHash = "$2a$12$invalidhashtopreventtimingattacks.....";
    const passwordToCheck = user ? user.password_hash : dummyHash;
    const passwordMatch = await bcrypt.compare(password, passwordToCheck);

    if (!user || !passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.is_active) {
      return res
        .status(403)
        .json({ message: "Your account has been deactivated. Contact HR." });
    }

    const { accessToken, refreshToken } = await issueTokenPair(user);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTS);

    await db.query("UPDATE users SET last_login = NOW() WHERE id = $1", [
      user.id,
    ]);

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        companyId: user.company_id,
        emailVerified: user.email_verified,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Server error during login." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/auth/refresh
// ══════════════════════════════════════════════════════════════
export async function refresh(req, res) {


  console.log("========== REFRESH ==========");
  console.log("Authorization:", req.headers.authorization);
  console.log("Cookies:", req.cookies);
  console.log("Refresh Cookie:", req.cookies?.refreshToken);
  console.log("Body:", req.body);
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required." });
  }

  try {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
      });
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token." });
    }

    const userId = decoded.sub;

    const storedTokens = await db.query(
      `SELECT id, token_hash
       FROM refresh_tokens
       WHERE user_id = $1 AND expires_at > NOW()`,
      [userId],
    );

    let matchedTokenId = null;
    for (const row of storedTokens.rows) {
      const match = await bcrypt.compare(refreshToken, row.token_hash);
      if (match) {
        matchedTokenId = row.id;
        break;
      }
    }

    if (!matchedTokenId) {
      await db.query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
      });
      return res
        .status(401)
        .json({ message: "Refresh token has been revoked." });
    }

    await db.query("DELETE FROM refresh_tokens WHERE id = $1", [
      matchedTokenId,
    ]);

    const userResult = await db.query(
      "SELECT id, email, first_name, last_name, role, company_id, is_active FROM users WHERE id = $1",
      [userId],
    );
    const user = userResult.rows[0];

    if (!user || !user.is_active) {
      return res.status(403).json({ message: "Account is inactive." });
    }

    const tokens = await issueTokenPair(user);
    res.cookie("refreshToken", tokens.refreshToken, REFRESH_COOKIE_OPTS);

    return res.status(200).json(tokens);
  } catch (err) {
    console.error("refresh error:", err);
    return res
      .status(500)
      .json({ message: "Server error during token refresh." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/auth/logout
// ══════════════════════════════════════════════════════════════
export async function logout(req, res) {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });
    return res.status(200).json({ message: "Logged out." });
  }

  try {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
      });
      return res.status(200).json({ message: "Logged out." });
    }

    const userId = decoded.sub;

    const storedTokens = await db.query(
      "SELECT id, token_hash FROM refresh_tokens WHERE user_id = $1 AND expires_at > NOW()",
      [userId],
    );

    for (const row of storedTokens.rows) {
      const match = await bcrypt.compare(refreshToken, row.token_hash);
      if (match) {
        await db.query("DELETE FROM refresh_tokens WHERE id = $1", [row.id]);
        break;
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    return res.status(200).json({ message: "Logged out successfully." });
  } catch (err) {
    console.error("logout error:", err);
    return res.status(500).json({ message: "Server error during logout." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/auth/forgot-password
// ══════════════════════════════════════════════════════════════
export async function forgotPassword(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { email } = req.body;
  const GENERIC =
    "If an account with that email exists, a reset link has been sent.";

  try {
    const result = await db.query(
      "SELECT id, email FROM users WHERE email = $1",
      [email.toLowerCase()],
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ message: GENERIC });
    }

    const user = result.rows[0];

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await db.query(
      `UPDATE users
       SET reset_token_hash = $1, reset_token_expires = $2
       WHERE id = $3`,
      [resetTokenHash, resetExpires, user.id],
    );

    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (mailErr) {
      console.error("Password reset email failed:", mailErr.message);
    }

    return res.status(200).json({ message: GENERIC });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/auth/reset-password
// ══════════════════════════════════════════════════════════════
export async function resetPassword(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { token, password } = req.body;

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const result = await db.query(
      `SELECT id FROM users
       WHERE reset_token_hash = $1
         AND reset_token_expires > NOW()`,
      [tokenHash],
    );

    if (result.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Reset token is invalid or has expired." });
    }

    const userId = result.rows[0].id;
    const passwordHash = await bcrypt.hash(password, 12);

    await db.query(
      `UPDATE users
       SET password_hash = $1,
           reset_token_hash = NULL,
           reset_token_expires = NULL
       WHERE id = $2`,
      [passwordHash, userId],
    );

    await db.query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);

    return res
      .status(200)
      .json({ message: "Password has been reset. You can now log in." });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/auth/verify-email
// ══════════════════════════════════════════════════════════════
export async function verifyEmail(req, res) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Verification token is required." });
  }

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const result = await db.query(
      `SELECT id, email_verified
       FROM users
       WHERE verify_token_hash = $1
         AND verify_token_expires > NOW()`,
      [tokenHash],
    );

    if (result.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Verification link is invalid or has expired." });
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return res.status(200).json({ message: "Email is already verified." });
    }

    await db.query(
      `UPDATE users
       SET email_verified = true,
           verify_token_hash = NULL,
           verify_token_expires = NULL
       WHERE id = $1`,
      [user.id],
    );

    return res.status(200).json({ message: "Email verified successfully." });
  } catch (err) {
    console.error("verifyEmail error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/auth/me
// ══════════════════════════════════════════════════════════════
export async function getMe(req, res) {
  try {
    const { userId, companyId } = req.user;

    const result = await db.query(
      `SELECT
         u.id,
         u.email,
         u.role,
         u.email_verified,
         u.last_login,
         u.created_at,
         c.id   AS "companyId",
         c.name AS "companyName",
         c.slug AS "companySlug",
         e.id            AS "employeeId",
         e.employee_code AS "employeeCode",
         e.first_name    AS "firstName",
         e.last_name     AS "lastName",
         e.avatar,
         e.manager_id    AS "managerId",
         jr.id    AS "jobRoleId",
         jr.title AS "jobTitle",
         d.id   AS "departmentId",
         d.name AS "department",
         EXISTS (
           SELECT 1
           FROM   employees sub
           WHERE  sub.manager_id        = e.id
             AND  sub.company_id        = $2
             AND  sub.employment_status NOT IN ('terminated', 'resigned')
         ) AS "isManager"
       FROM users u
       JOIN companies   c  ON c.id  = u.company_id
       LEFT JOIN employees  e  ON e.user_id = u.id AND e.company_id = $2
       LEFT JOIN job_roles  jr ON jr.id = e.job_role_id
       LEFT JOIN departments d  ON d.id  = e.department_id
       WHERE u.id = $1
       LIMIT 1`,
      [userId, companyId],
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: "User not found." });
    }

    const u = result.rows[0];

    return res.status(200).json({
      id:            u.id,
      email:         u.email,
      role:          u.role,
      isManager:     u.isManager,
      emailVerified: u.email_verified,
      lastLogin:     u.last_login,
      createdAt:     u.created_at,
      firstName:     u.firstName,
      lastName:      u.lastName,
      avatar:        u.avatar,
      employeeId:    u.employeeId,
      employeeCode:  u.employeeCode,
      managerId:     u.managerId,
      jobTitle:      u.jobTitle,
      jobRoleId:     u.jobRoleId,
      department:    u.department,
      departmentId:  u.departmentId,
      company: {
        id:   u.companyId,
        name: u.companyName,
        slug: u.companySlug,
      },
    });
  } catch (err) {
    console.error("getMe error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}