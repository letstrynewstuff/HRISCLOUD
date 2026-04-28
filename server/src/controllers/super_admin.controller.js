// src/controllers/super_admin.controller.js
//
// Centralised control layer for the Super Admin.
// req.user is injected by authenticate() and has shape:
//   { userId, companyId: null, role: "super_admin" }
//
// Super admin has NO company_id — they sit above all tenants.
// Every query that touches company data must be explicitly scoped
// by the target company, never by req.user.companyId.
//
// Paystack integration uses the PAYSTACK_SECRET_KEY env var.

import bcrypt from "bcryptjs";
import crypto from "crypto";
import os from "os";
import { db } from "../config/db.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Write one row to audit_logs. Fire-and-forget — never throws. */
async function audit(action, performedBy, meta = {}) {
  try {
    await db.query(
      `INSERT INTO audit_logs (action, performed_by, meta, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [action, performedBy, JSON.stringify(meta)],
    );
  } catch (e) {
    console.error("audit write failed:", e.message);
  }
}

/** Standard pagination from query string */
function paginate(query) {
  const page = Math.max(1, parseInt(query.page ?? 1, 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? 20, 10)));
  return { page, limit, offset: (page - 1) * limit };
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH — Super Admin Login
// POST /api/super-admin/auth/login
// Reads SUPER_ADMIN_NAME and SUPER_ADMIN_PASS from env.
// Returns a JWT with role: "super_admin" and companyId: null.
// ═══════════════════════════════════════════════════════════════════════════════
// export async function superAdminLogin(req, res) {
//   try {
//     // const { username, password } = req.body;

//     // if (!username || !password) {
//     //   return res
//     //     .status(400)
//     //     .json({ message: "username and password required." });
//     // }
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({
//         message: "email and password required.",
//       });
//     }

//     const validName = process.env.SUPER_ADMIN_NAME;
//     const validPass = process.env.SUPER_ADMIN_PASS;

//     if (!validName || !validPass) {
//       console.error("SUPER_ADMIN_NAME / SUPER_ADMIN_PASS not set in .env");
//       return res.status(500).json({ message: "Super admin not configured." });
//     }

//     // Constant-time comparison to prevent timing attacks
//     const nameMatch = crypto.timingSafeEqual(
//       Buffer.from(username),
//       Buffer.from(validName),
//     );
//     const passMatch = crypto.timingSafeEqual(
//       Buffer.from(password),
//       Buffer.from(validPass),
//     );

//     if (!nameMatch || !passMatch) {
//       await audit("SUPER_ADMIN_LOGIN_FAIL", "system", { username });
//       return res.status(401).json({ message: "Invalid credentials." });
//     }

//     // Issue a JWT that looks like a normal user JWT but with no companyId
//     const accessToken = signAccessToken({
//       sub: "super_admin",
//       companyId: null,
//       role: "super_admin",
//     });
//     const refreshToken = signRefreshToken({
//       sub: "super_admin",
//       companyId: null,
//     });

//     await audit("SUPER_ADMIN_LOGIN", "super_admin", { ip: req.ip });

//     return res.json({
//       accessToken,
//       refreshToken,
//       user: { id: "super_admin", role: "super_admin", name: validName },
//     });
//   } catch (err) {
//     console.error("superAdminLogin:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

export async function superAdminLogin(req, res) {
  try {
    const { email, password } = req.body;

    console.log("LOGIN BODY:", req.body); // DEBUG

    if (!email || !password) {
      return res.status(400).json({
        message: "email and password required.",
      });
    }

    const validEmail = process.env.SUPER_ADMIN_EMAIL;
    const validPass = process.env.SUPER_ADMIN_PASS;

    if (!validEmail || !validPass) {
      console.error("SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASS not set in .env");
      return res.status(500).json({
        message: "Super admin not configured.",
      });
    }

    const emailMatch = crypto.timingSafeEqual(
      Buffer.from(email),
      Buffer.from(validEmail),
    );

    const passMatch = crypto.timingSafeEqual(
      Buffer.from(password),
      Buffer.from(validPass),
    );

    if (!emailMatch || !passMatch) {
      await audit("SUPER_ADMIN_LOGIN_FAIL", "system", { email });

      return res.status(401).json({
        message: "Invalid credentials.",
      });
    }

    const accessToken = signAccessToken({
      sub: "super_admin",
      companyId: null,
      role: "super_admin",
    });

    const refreshToken = signRefreshToken({
      sub: "super_admin",
      companyId: null,
    });

    await audit("SUPER_ADMIN_LOGIN", "super_admin", {
      ip: req.ip,
    });

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id: "super_admin",
        role: "super_admin",
        email: validEmail,
      },
    });
  } catch (err) {
    console.error("superAdminLogin ERROR:", err);
    return res.status(500).json({
      message: "Server error.",
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPANIES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/super-admin/companies
export async function listAllCompanies(req, res) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const search = req.query.search ?? "";
    const status = req.query.status ?? ""; // active | suspended | pending
    const planId = req.query.plan_id ?? "";

    const conditions = ["c.deleted_at IS NULL"];
    const values = [];
    let idx = 1;

    if (search) {
      conditions.push(`(c.name ILIKE $${idx} OR c.slug ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }
    if (status) {
      conditions.push(`c.status = $${idx}`);
      values.push(status);
      idx++;
    }
    if (planId) {
      conditions.push(`c.plan_id = $${idx}`);
      values.push(planId);
      idx++;
    }

    const where = conditions.join(" AND ");

    const [countRes, dataRes] = await Promise.all([
      db.query(
        `SELECT COUNT(*) AS total FROM companies c WHERE ${where}`,
        values,
      ),
      db.query(
        `SELECT
           c.id, c.name, c.slug, c.status, c.created_at, c.approved_at,
           c.plan_id, p.name AS plan_name,
           (SELECT COUNT(*) FROM users u WHERE u.company_id = c.id AND u.deleted_at IS NULL) AS user_count
         FROM companies c
         LEFT JOIN plans p ON p.id = c.plan_id
         WHERE ${where}
         ORDER BY c.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...values, limit, offset],
      ),
    ]);

    const total = parseInt(countRes.rows[0].total, 10);

    return res.json({
      data: dataRes.rows,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("listAllCompanies:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// POST /api/super-admin/companies
// Manually create a company + its first HR admin user
export async function createCompany(req, res) {
  const client = await db.getClient();
  try {
    const {
      companyName,
      slug,
      planId,
      adminFirstName,
      adminLastName,
      adminEmail,
      adminPassword,
    } = req.body;

    if (!companyName || !slug || !adminEmail || !adminPassword) {
      return res
        .status(400)
        .json({
          message: "companyName, slug, adminEmail, adminPassword required.",
        });
    }

    await client.query("BEGIN");

    // Slug uniqueness
    const slugCheck = await client.query(
      "SELECT id FROM companies WHERE slug = $1",
      [slug.toLowerCase()],
    );
    if (slugCheck.rows.length) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Slug already taken." });
    }

    // Email uniqueness
    const emailCheck = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [adminEmail.toLowerCase()],
    );
    if (emailCheck.rows.length) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Admin email already exists." });
    }

    const companyRes = await client.query(
      `INSERT INTO companies (name, slug, status, plan_id, approved_at, created_at)
       VALUES ($1, $2, 'active', $3, NOW(), NOW())
       RETURNING *`,
      [companyName, slug.toLowerCase(), planId ?? null],
    );
    const company = companyRes.rows[0];

    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const userRes = await client.query(
      `INSERT INTO users
         (company_id, first_name, last_name, email, password_hash,
          role, email_verified, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, 'hr_admin', true, true, NOW())
       RETURNING id, email, first_name, last_name, role`,
      [
        company.id,
        adminFirstName ?? "Admin",
        adminLastName ?? "User",
        adminEmail.toLowerCase(),
        passwordHash,
      ],
    );

    await client.query("COMMIT");
    await audit("COMPANY_CREATED", "super_admin", {
      companyId: company.id,
      slug,
    });

    return res.status(201).json({
      message: "Company created.",
      company,
      adminUser: userRes.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("createCompany:", err);
    return res.status(500).json({ message: "Server error." });
  } finally {
    client.release();
  }
}

// PATCH /api/super-admin/companies/:id/approve
export async function approveCompany(req, res) {
  try {
    const { id } = req.params;
    const { rowCount } = await db.query(
      `UPDATE companies SET status = 'active', approved_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    if (!rowCount)
      return res.status(404).json({ message: "Company not found." });
    await audit("COMPANY_APPROVED", "super_admin", { companyId: id });
    return res.json({ message: "Company approved." });
  } catch (err) {
    console.error("approveCompany:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// PATCH /api/super-admin/companies/:id/suspend
export async function suspendCompany(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const { rowCount } = await db.query(
      `UPDATE companies SET status = 'suspended' WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    if (!rowCount)
      return res.status(404).json({ message: "Company not found." });
    await audit("COMPANY_SUSPENDED", "super_admin", { companyId: id, reason });
    return res.json({ message: "Company suspended." });
  } catch (err) {
    console.error("suspendCompany:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// DELETE /api/super-admin/companies/:id  (soft delete)
export async function deleteCompany(req, res) {
  try {
    const { id } = req.params;
    const { rowCount } = await db.query(
      `UPDATE companies SET deleted_at = NOW(), status = 'deleted'
       WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    if (!rowCount)
      return res
        .status(404)
        .json({ message: "Company not found or already deleted." });
    await audit("COMPANY_DELETED", "super_admin", { companyId: id });
    return res.json({ message: "Company soft-deleted." });
  } catch (err) {
    console.error("deleteCompany:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL USER CONTROL
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/super-admin/users
export async function listAllUsers(req, res) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const search = req.query.search ?? "";
    const companyId = req.query.company_id ?? "";
    const role = req.query.role ?? "";
    const active = req.query.is_active;

    const conditions = ["u.deleted_at IS NULL"];
    const values = [];
    let idx = 1;

    if (search) {
      conditions.push(
        `(u.email ILIKE $${idx} OR u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx})`,
      );
      values.push(`%${search}%`);
      idx++;
    }
    if (companyId) {
      conditions.push(`u.company_id = $${idx}`);
      values.push(companyId);
      idx++;
    }
    if (role) {
      conditions.push(`u.role = $${idx}`);
      values.push(role);
      idx++;
    }
    if (active !== undefined) {
      conditions.push(`u.is_active = $${idx}`);
      values.push(active === "true");
      idx++;
    }

    const where = conditions.join(" AND ");

    const [countRes, dataRes] = await Promise.all([
      db.query(`SELECT COUNT(*) AS total FROM users u WHERE ${where}`, values),
      db.query(
        `SELECT
           u.id, u.email, u.first_name, u.last_name, u.role,
           u.is_active, u.email_verified, u.last_login, u.created_at,
           c.name AS company_name, c.id AS company_id
         FROM users u
         LEFT JOIN companies c ON c.id = u.company_id
         WHERE ${where}
         ORDER BY u.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...values, limit, offset],
      ),
    ]);

    return res.json({
      data: dataRes.rows,
      meta: { total: parseInt(countRes.rows[0].total, 10), page, limit },
    });
  } catch (err) {
    console.error("listAllUsers:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// PATCH /api/super-admin/users/:id/disable
export async function disableUser(req, res) {
  try {
    const { id } = req.params;
    const { rowCount } = await db.query(
      `UPDATE users SET is_active = false WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    if (!rowCount) return res.status(404).json({ message: "User not found." });

    // Revoke all refresh tokens so they're immediately logged out
    await db.query("DELETE FROM refresh_tokens WHERE user_id = $1", [id]);

    await audit("USER_DISABLED", "super_admin", { targetUserId: id });
    return res.json({ message: "User disabled and sessions revoked." });
  } catch (err) {
    console.error("disableUser:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// PATCH /api/super-admin/users/:id/reset-password
// Generates a temporary password, hashes it, and stores it.
// In production you'd email it — here we return it once for the admin to relay.
export async function forceResetPassword(req, res) {
  try {
    const { id } = req.params;

    // Check user exists
    const { rows } = await db.query(
      "SELECT id, email FROM users WHERE id = $1 AND deleted_at IS NULL",
      [id],
    );
    if (!rows.length)
      return res.status(404).json({ message: "User not found." });

    // Generate a secure temp password
    const tempPassword = crypto
      .randomBytes(10)
      .toString("base64url")
      .slice(0, 14);
    const hash = await bcrypt.hash(tempPassword, 12);

    await db.query(
      `UPDATE users SET password_hash = $1, password_reset_required = true WHERE id = $2`,
      [hash, id],
    );

    // Revoke existing refresh tokens
    await db.query("DELETE FROM refresh_tokens WHERE user_id = $1", [id]);

    await audit("USER_PASSWORD_RESET", "super_admin", {
      targetUserId: id,
      email: rows[0].email,
    });

    return res.json({
      message: "Password reset. Relay the temporary password to the user.",
      tempPassword, // Only returned here — not stored in plain text anywhere
      email: rows[0].email,
    });
  } catch (err) {
    console.error("forceResetPassword:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BILLING — PLANS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/super-admin/plans
export async function listPlans(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT * FROM plans WHERE deleted_at IS NULL ORDER BY price_monthly ASC`,
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error("listPlans:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// POST /api/super-admin/plans
export async function createPlan(req, res) {
  try {
    const {
      name,
      description,
      priceMonthly,
      priceYearly,
      maxEmployees,
      maxDepartments,
      features, // JSON object e.g. { enableChat: true, enablePayroll: false }
      paystackPlanCode, // Paystack plan code if pre-created in Paystack dashboard
    } = req.body;

    if (!name || priceMonthly === undefined) {
      return res
        .status(400)
        .json({ message: "name and priceMonthly required." });
    }

    const { rows } = await db.query(
      `INSERT INTO plans
         (name, description, price_monthly, price_yearly,
          max_employees, max_departments, features, paystack_plan_code, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
       RETURNING *`,
      [
        name,
        description ?? null,
        priceMonthly,
        priceYearly ?? null,
        maxEmployees ?? null,
        maxDepartments ?? null,
        JSON.stringify(features ?? {}),
        paystackPlanCode ?? null,
      ],
    );

    await audit("PLAN_CREATED", "super_admin", { planId: rows[0].id, name });
    return res.status(201).json({ data: rows[0] });
  } catch (err) {
    console.error("createPlan:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// PATCH /api/super-admin/companies/:id/plan
// Assign a plan to a company
export async function assignPlanToCompany(req, res) {
  try {
    const { id } = req.params;
    const { planId } = req.body;

    if (!planId) return res.status(400).json({ message: "planId required." });

    // Verify plan exists
    const planCheck = await db.query(
      "SELECT id, name FROM plans WHERE id = $1 AND deleted_at IS NULL",
      [planId],
    );
    if (!planCheck.rows.length) {
      return res.status(404).json({ message: "Plan not found." });
    }

    const { rowCount } = await db.query(
      `UPDATE companies SET plan_id = $1 WHERE id = $2 AND deleted_at IS NULL`,
      [planId, id],
    );
    if (!rowCount)
      return res.status(404).json({ message: "Company not found." });

    // Log subscription change
    await db.query(
      `INSERT INTO subscriptions (company_id, plan_id, status, started_at, created_at)
       VALUES ($1, $2, 'active', NOW(), NOW())
       ON CONFLICT (company_id) DO UPDATE
         SET plan_id = $2, status = 'active', started_at = NOW()`,
      [id, planId],
    );

    await audit("PLAN_ASSIGNED", "super_admin", {
      companyId: id,
      planId,
      planName: planCheck.rows[0].name,
    });

    return res.json({ message: "Plan assigned." });
  } catch (err) {
    console.error("assignPlanToCompany:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BILLING — SUBSCRIPTIONS + PAYMENTS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/super-admin/subscriptions
export async function listSubscriptions(req, res) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const status = req.query.status ?? "";

    const conditions = ["s.deleted_at IS NULL"];
    const values = [];
    let idx = 1;

    if (status) {
      conditions.push(`s.status = $${idx}`);
      values.push(status);
      idx++;
    }

    const where = conditions.join(" AND ");

    const [countRes, dataRes] = await Promise.all([
      db.query(
        `SELECT COUNT(*) AS total FROM subscriptions s WHERE ${where}`,
        values,
      ),
      db.query(
        `SELECT
           s.id, s.status, s.started_at, s.ends_at, s.paystack_subscription_code,
           c.id AS company_id, c.name AS company_name,
           p.id AS plan_id, p.name AS plan_name, p.price_monthly
         FROM subscriptions s
         JOIN companies c ON c.id = s.company_id
         JOIN plans     p ON p.id = s.plan_id
         WHERE ${where}
         ORDER BY s.started_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...values, limit, offset],
      ),
    ]);

    return res.json({
      data: dataRes.rows,
      meta: { total: parseInt(countRes.rows[0].total, 10), page, limit },
    });
  } catch (err) {
    console.error("listSubscriptions:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// GET /api/super-admin/payments
export async function listPayments(req, res) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const companyId = req.query.company_id ?? "";
    const status = req.query.status ?? ""; // success | failed | pending

    const conditions = [];
    const values = [];
    let idx = 1;

    if (companyId) {
      conditions.push(`p.company_id = $${idx}`);
      values.push(companyId);
      idx++;
    }
    if (status) {
      conditions.push(`p.status = $${idx}`);
      values.push(status);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [countRes, dataRes] = await Promise.all([
      db.query(`SELECT COUNT(*) AS total FROM payments p ${where}`, values),
      db.query(
        `SELECT
           p.id, p.amount, p.currency, p.status, p.paystack_reference,
           p.paid_at, p.created_at,
           c.name AS company_name, c.id AS company_id,
           pl.name AS plan_name
         FROM payments p
         LEFT JOIN companies c ON c.id = p.company_id
         LEFT JOIN plans     pl ON pl.id = p.plan_id
         ${where}
         ORDER BY p.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...values, limit, offset],
      ),
    ]);

    return res.json({
      data: dataRes.rows,
      meta: { total: parseInt(countRes.rows[0].total, 10), page, limit },
    });
  } catch (err) {
    console.error("listPayments:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// POST /api/super-admin/payments/verify-paystack
// Verify a Paystack transaction by reference and record it
export async function verifyPaystackPayment(req, res) {
  try {
    const { reference, companyId, planId } = req.body;
    if (!reference || !companyId) {
      return res
        .status(400)
        .json({ message: "reference and companyId required." });
    }

    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!paystackRes.ok) {
      return res.status(502).json({ message: "Paystack verification failed." });
    }

    const paystackData = await paystackRes.json();
    const txn = paystackData.data;

    if (txn.status !== "success") {
      return res.status(400).json({
        message: `Payment not successful. Status: ${txn.status}`,
      });
    }

    // Idempotent insert — same reference won't double-record
    const { rows } = await db.query(
      `INSERT INTO payments
         (company_id, plan_id, amount, currency, status,
          paystack_reference, paid_at, created_at)
       VALUES ($1, $2, $3, $4, 'success', $5, $6, NOW())
       ON CONFLICT (paystack_reference) DO UPDATE SET status = 'success'
       RETURNING *`,
      [
        companyId,
        planId ?? null,
        txn.amount / 100, // Paystack returns kobo
        txn.currency ?? "NGN",
        reference,
        new Date(txn.paid_at),
      ],
    );

    await audit("PAYMENT_VERIFIED", "super_admin", { reference, companyId });
    return res.json({
      message: "Payment verified and recorded.",
      data: rows[0],
    });
  } catch (err) {
    console.error("verifyPaystackPayment:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// GET /api/super-admin/analytics
// ═══════════════════════════════════════════════════════════════════════════════
export async function getAnalytics(req, res) {
  try {
    const [
      companiesRes,
      usersRes,
      subsRes,
      revenueRes,
      newCompaniesRes,
      newUsersRes,
    ] = await Promise.all([
      // Total companies by status
      db.query(
        `SELECT status, COUNT(*) AS count
         FROM companies WHERE deleted_at IS NULL
         GROUP BY status`,
      ),
      // Total users
      db.query(
        `SELECT COUNT(*) AS total,
                COUNT(*) FILTER (WHERE is_active = true)  AS active,
                COUNT(*) FILTER (WHERE is_active = false) AS inactive
         FROM users WHERE deleted_at IS NULL`,
      ),
      // Active subscriptions
      db.query(
        `SELECT COUNT(*) AS total FROM subscriptions WHERE status = 'active'`,
      ),
      // Revenue summary (last 30 days vs all-time)
      db.query(
        `SELECT
           COALESCE(SUM(amount), 0)                                            AS total_revenue,
           COALESCE(SUM(amount) FILTER (WHERE paid_at >= NOW() - INTERVAL '30 days'), 0) AS revenue_30d,
           COUNT(*)                                                             AS total_payments,
           COUNT(*) FILTER (WHERE paid_at >= NOW() - INTERVAL '30 days')      AS payments_30d
         FROM payments WHERE status = 'success'`,
      ),
      // New companies last 30 days
      db.query(
        `SELECT COUNT(*) AS count FROM companies
         WHERE created_at >= NOW() - INTERVAL '30 days' AND deleted_at IS NULL`,
      ),
      // New users last 30 days
      db.query(
        `SELECT COUNT(*) AS count FROM users
         WHERE created_at >= NOW() - INTERVAL '30 days' AND deleted_at IS NULL`,
      ),
    ]);

    const companyByStatus = {};
    for (const row of companiesRes.rows) {
      companyByStatus[row.status] = parseInt(row.count, 10);
    }

    return res.json({
      companies: {
        total: Object.values(companyByStatus).reduce((a, b) => a + b, 0),
        byStatus: companyByStatus,
        newLast30: parseInt(newCompaniesRes.rows[0].count, 10),
      },
      users: {
        total: parseInt(usersRes.rows[0].total, 10),
        active: parseInt(usersRes.rows[0].active, 10),
        inactive: parseInt(usersRes.rows[0].inactive, 10),
        newLast30: parseInt(newUsersRes.rows[0].count, 10),
      },
      subscriptions: {
        active: parseInt(subsRes.rows[0].total, 10),
      },
      revenue: {
        totalAllTime: parseFloat(revenueRes.rows[0].total_revenue),
        totalLast30d: parseFloat(revenueRes.rows[0].revenue_30d),
        paymentsTotal: parseInt(revenueRes.rows[0].total_payments, 10),
        payments30d: parseInt(revenueRes.rows[0].payments_30d, 10),
      },
    });
  } catch (err) {
    console.error("getAnalytics:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PLATFORM SETTINGS (feature toggles, global config)
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/super-admin/settings
export async function getPlatformSettings(req, res) {
  try {
    const { rows } = await db.query(
      `SELECT key, value, updated_at FROM platform_settings ORDER BY key ASC`,
    );
    // Reduce to a flat object
    const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return res.json({ data: settings });
  } catch (err) {
    console.error("getPlatformSettings:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// PATCH /api/super-admin/settings
// Body: { enableAttendance: true, enablePayroll: false, enableChat: true, ... }
export async function updatePlatformSettings(req, res) {
  const client = await db.getClient();
  try {
    const updates = req.body;
    if (
      !updates ||
      typeof updates !== "object" ||
      !Object.keys(updates).length
    ) {
      return res
        .status(400)
        .json({ message: "At least one setting key required." });
    }

    const ALLOWED_KEYS = new Set([
      "enableAttendance",
      "enablePayroll",
      "enableChat",
      "enableDocuments",
      "enableAnnouncements",
      "enableOffboarding",
      "maintenanceMode",
      "allowSelfRegistration",
    ]);

    const invalid = Object.keys(updates).filter((k) => !ALLOWED_KEYS.has(k));
    if (invalid.length) {
      return res.status(400).json({
        message: `Unknown setting keys: ${invalid.join(", ")}`,
      });
    }

    await client.query("BEGIN");
    for (const [key, value] of Object.entries(updates)) {
      await client.query(
        `INSERT INTO platform_settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, String(value)],
      );
    }
    await client.query("COMMIT");

    await audit("PLATFORM_SETTINGS_UPDATED", "super_admin", updates);
    return res.json({ message: "Settings updated.", data: updates });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("updatePlatformSettings:", err);
    return res.status(500).json({ message: "Server error." });
  } finally {
    client.release();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM MONITORING
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/super-admin/system/health
export async function getSystemHealth(req, res) {
  try {
    const startTime = process.hrtime.bigint();
    await db.query("SELECT 1");
    const dbMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPct = ((usedMem / totalMem) * 100).toFixed(1);

    const load = os.loadavg();

    return res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(process.uptime()),
        human: formatUptime(process.uptime()),
      },
      database: {
        status: "ok",
        latencyMs: parseFloat(dbMs.toFixed(2)),
      },
      memory: {
        totalMB: (totalMem / 1024 / 1024).toFixed(0),
        usedMB: (usedMem / 1024 / 1024).toFixed(0),
        freeMB: (freeMem / 1024 / 1024).toFixed(0),
        usedPct: parseFloat(memPct),
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0]?.model ?? "unknown",
        loadAvg1m: load[0].toFixed(2),
        loadAvg5m: load[1].toFixed(2),
        loadAvg15m: load[2].toFixed(2),
      },
      node: {
        version: process.version,
        platform: process.platform,
      },
    });
  } catch (err) {
    console.error("getSystemHealth:", err);
    return res.status(503).json({
      status: "degraded",
      database: { status: "error", error: err.message },
      timestamp: new Date().toISOString(),
    });
  }
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

// GET /api/super-admin/logs
// Reads the last N lines of logs from the database error_logs table.
// (Assumes you have a log table — see SQL migration for schema.)
export async function getErrorLogs(req, res) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const level = req.query.level ?? ""; // error | warn | info
    const from = req.query.from ?? ""; // ISO date
    const to = req.query.to ?? "";

    const conditions = [];
    const values = [];
    let idx = 1;

    if (level) {
      conditions.push(`level = $${idx}`);
      values.push(level);
      idx++;
    }
    if (from) {
      conditions.push(`created_at >= $${idx}`);
      values.push(new Date(from));
      idx++;
    }
    if (to) {
      conditions.push(`created_at <= $${idx}`);
      values.push(new Date(to));
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [countRes, dataRes] = await Promise.all([
      db.query(`SELECT COUNT(*) AS total FROM error_logs ${where}`, values),
      db.query(
        `SELECT id, level, message, stack, context, created_at
         FROM error_logs ${where}
         ORDER BY created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...values, limit, offset],
      ),
    ]);

    return res.json({
      data: dataRes.rows,
      meta: { total: parseInt(countRes.rows[0].total, 10), page, limit },
    });
  } catch (err) {
    console.error("getErrorLogs:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT LOGS
// GET /api/super-admin/audit-logs
// ═══════════════════════════════════════════════════════════════════════════════
export async function getAuditLogs(req, res) {
  try {
    const { page, limit, offset } = paginate(req.query);
    const action = req.query.action ?? "";
    const performedBy = req.query.performed_by ?? "";
    const from = req.query.from ?? "";
    const to = req.query.to ?? "";

    const conditions = [];
    const values = [];
    let idx = 1;

    if (action) {
      conditions.push(`action ILIKE $${idx}`);
      values.push(`%${action}%`);
      idx++;
    }
    if (performedBy) {
      conditions.push(`performed_by = $${idx}`);
      values.push(performedBy);
      idx++;
    }
    if (from) {
      conditions.push(`created_at >= $${idx}`);
      values.push(new Date(from));
      idx++;
    }
    if (to) {
      conditions.push(`created_at <= $${idx}`);
      values.push(new Date(to));
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [countRes, dataRes] = await Promise.all([
      db.query(`SELECT COUNT(*) AS total FROM audit_logs ${where}`, values),
      db.query(
        `SELECT id, action, performed_by, meta, created_at
         FROM audit_logs ${where}
         ORDER BY created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...values, limit, offset],
      ),
    ]);

    return res.json({
      data: dataRes.rows,
      meta: { total: parseInt(countRes.rows[0].total, 10), page, limit },
    });
  } catch (err) {
    console.error("getAuditLogs:", err);
    return res.status(500).json({ message: "Server error." });
  }
}
