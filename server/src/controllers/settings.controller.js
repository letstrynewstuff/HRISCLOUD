// // src/controllers/settings.controller.js
// //
// // Endpoints:
// //   Security
// //     PUT  /api/settings/security/password
// //     PUT  /api/settings/security/2fa
// //   Notifications
// //     GET  /api/settings/notifications
// //     PUT  /api/settings/notifications
// //   My Profile
// //     GET  /api/settings/me
// //     PUT  /api/settings/me
// //   Company Profile
// //     GET  /api/settings/company
// //     PUT  /api/settings/company
// //     POST /api/settings/company/logo
// //   Users / Team
// //     GET    /api/settings/users
// //     POST   /api/settings/users/invite
// //     PUT    /api/settings/users/:userId/role
// //     DELETE /api/settings/users/:userId
// //   Roles & Permissions
// //     GET /api/settings/roles
// //     PUT /api/settings/roles/:roleId
// //   Audit Log
// //     GET /api/settings/audit
// //   Billing
// //     GET /api/settings/billing
// //   Integrations
// //     GET /api/settings/integrations
// //     PUT /api/settings/integrations/:id
// //
// // Requires: authenticate middleware on all routes (sets req.user with
// // { userId, companyId, role }).

// import bcrypt from "bcryptjs";
// import { db } from "../config/db.js";
// // import { cloudinary } from "../utils/upload.js";
// import { uploadToCloud } from "../utils/upload.js";

// const ADMIN_ROLES = ["owner", "hr_admin", "super_admin"];

// function isAdmin(req) {
//   return ADMIN_ROLES.includes(req.user?.role);
// }

// function logAudit(
//   companyId,
//   actorId,
//   action,
//   entityType,
//   entityId,
//   metadata = {},
// ) {
//   // Fire-and-forget — an audit log failure should never block the request
//   // that triggered it.
//   db.query(
//     `INSERT INTO audit_logs (company_id, actor_id, action, entity_type, entity_id, metadata, created_at)
//      VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW())`,
//     [
//       companyId,
//       actorId,
//       action,
//       entityType,
//       entityId,
//       JSON.stringify(metadata),
//     ],
//   ).catch((err) => console.error("logAudit failed:", err));
// }

// /* ══════════════════════════════════════════════════════════════
//    SECURITY
//    ══════════════════════════════════════════════════════════════ */

// // PUT /api/settings/security/password
// // Body: { currentPassword, newPassword }
// export async function changePassword(req, res) {
//   const { userId } = req.user;
//   const { currentPassword, newPassword } = req.body;

//   if (!currentPassword || !newPassword) {
//     return res.status(400).json({
//       message: "currentPassword and newPassword are required.",
//     });
//   }

//   if (newPassword.length < 8) {
//     return res.status(422).json({
//       message: "New password must be at least 8 characters.",
//     });
//   }

//   try {
//     const result = await db.query(
//       "SELECT id, password_hash FROM users WHERE id = $1",
//       [userId],
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     const user = result.rows[0];
//     const valid = await bcrypt.compare(currentPassword, user.password_hash);

//     if (!valid) {
//       return res
//         .status(401)
//         .json({ message: "Current password is incorrect." });
//     }

//     if (currentPassword === newPassword) {
//       return res.status(400).json({
//         message: "New password must be different from your current password.",
//       });
//     }

//     const hash = await bcrypt.hash(newPassword, 12);

//     await db.query(
//       "UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2",
//       [hash, userId],
//     );

//     // Invalidate all refresh tokens so user must log in again on other devices
//     await db.query("DELETE FROM refresh_tokens WHERE user_id=$1", [userId]);

//     logAudit(req.user.companyId, userId, "password_changed", "user", userId);

//     return res.status(200).json({
//       message:
//         "Password changed successfully. Please log in again on other devices.",
//     });
//   } catch (err) {
//     console.error("changePassword error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// // PUT /api/settings/security/2fa
// // Body: { enabled: boolean }
// export async function toggleTwoFactor(req, res) {
//   const { userId } = req.user;
//   const { enabled } = req.body;

//   if (typeof enabled !== "boolean") {
//     return res.status(400).json({ message: "enabled (boolean) is required." });
//   }

//   try {
//     await db.query(
//       "UPDATE users SET two_factor_enabled=$1, updated_at=NOW() WHERE id=$2",
//       [enabled, userId],
//     );

//     logAudit(
//       req.user.companyId,
//       userId,
//       enabled ? "2fa_enabled" : "2fa_disabled",
//       "user",
//       userId,
//     );

//     return res.status(200).json({
//       message: enabled
//         ? "Two-factor authentication enabled."
//         : "Two-factor authentication disabled.",
//       twoFactorEnabled: enabled,
//     });
//   } catch (err) {
//     console.error("toggleTwoFactor error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// /* ══════════════════════════════════════════════════════════════
//    NOTIFICATIONS
//    ══════════════════════════════════════════════════════════════ */

// // GET /api/settings/notifications
// export async function getNotificationPrefs(req, res) {
//   const { userId } = req.user;

//   try {
//     const result = await db.query(
//       "SELECT notification_prefs FROM users WHERE id=$1",
//       [userId],
//     );

//     const stored = result.rows[0]?.notification_prefs;

//     const defaults = {
//       requestApproved: { email: true, inApp: true, sms: false },
//       newAnnouncement: { email: true, inApp: true, sms: false },
//       payslipReady: { email: true, inApp: true, sms: true },
//       leaveReminder: { email: true, inApp: true, sms: false },
//       trainingDue: { email: false, inApp: true, sms: false },
//       teamMessage: { email: false, inApp: true, sms: false },
//     };

//     const prefs = stored ? { ...defaults, ...stored } : defaults;

//     return res.status(200).json({ preferences: prefs });
//   } catch (err) {
//     console.error("getNotificationPrefs error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// // PUT /api/settings/notifications
// // Body: { preferences: { requestApproved: { email, inApp, sms }, ... } }
// export async function updateNotificationPrefs(req, res) {
//   const { userId } = req.user;
//   const { preferences } = req.body;

//   if (!preferences || typeof preferences !== "object") {
//     return res.status(400).json({ message: "preferences object is required." });
//   }

//   const ALLOWED_KEYS = [
//     "requestApproved",
//     "newAnnouncement",
//     "payslipReady",
//     "leaveReminder",
//     "trainingDue",
//     "teamMessage",
//   ];
//   const CHANNEL_KEYS = ["email", "inApp", "sms"];

//   const sanitized = {};
//   for (const key of ALLOWED_KEYS) {
//     if (key in preferences && typeof preferences[key] === "object") {
//       sanitized[key] = {};
//       for (const ch of CHANNEL_KEYS) {
//         if (ch in preferences[key]) {
//           sanitized[key][ch] = Boolean(preferences[key][ch]);
//         }
//       }
//     }
//   }

//   try {
//     await db.query(
//       `UPDATE users
//        SET notification_prefs = $1::jsonb,
//            updated_at         = NOW()
//        WHERE id = $2`,
//       [JSON.stringify(sanitized), userId],
//     );

//     return res.status(200).json({
//       message: "Notification preferences saved.",
//       preferences: sanitized,
//     });
//   } catch (err) {
//     console.error("updateNotificationPrefs error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// /* ══════════════════════════════════════════════════════════════
//    MY PROFILE (the logged-in admin's own account)
//    ══════════════════════════════════════════════════════════════ */

// // GET /api/settings/me
// export async function getMyProfile(req, res) {
//   const { userId } = req.user;

//   try {
//     const result = await db.query(
//       `SELECT id, first_name, last_name, email, phone, avatar_url, role,
//               two_factor_enabled
//        FROM users WHERE id=$1`,
//       [userId],
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     const u = result.rows[0];
//     return res.status(200).json({
//       data: {
//         id: u.id,
//         name: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim(),
//         email: u.email,
//         phone: u.phone,
//         avatar_url: u.avatar_url,
//         role: u.role,
//         twoFactorEnabled: u.two_factor_enabled ?? false,
//       },
//     });
//   } catch (err) {
//     console.error("getMyProfile error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// // PUT /api/settings/me
// // Body: { name, email, phone }
// export async function updateMyProfile(req, res) {
//   const { userId } = req.user;
//   const { name, email, phone } = req.body;

//   if (!name?.trim() || !email?.trim()) {
//     return res.status(400).json({ message: "name and email are required." });
//   }

//   const [firstName, ...rest] = name.trim().split(" ");
//   const lastName = rest.join(" ");

//   try {
//     // Prevent duplicate emails across other users
//     const dupe = await db.query(
//       "SELECT id FROM users WHERE email=$1 AND id != $2",
//       [email.trim(), userId],
//     );
//     if (dupe.rowCount > 0) {
//       return res.status(409).json({ message: "Email is already in use." });
//     }

//     await db.query(
//       `UPDATE users
//        SET first_name=$1, last_name=$2, email=$3, phone=$4, updated_at=NOW()
//        WHERE id=$5`,
//       [
//         firstName,
//         lastName || null,
//         email.trim(),
//         phone?.trim() || null,
//         userId,
//       ],
//     );

//     logAudit(req.user.companyId, userId, "profile_updated", "user", userId);

//     return res.status(200).json({ message: "Profile updated." });
//   } catch (err) {
//     console.error("updateMyProfile error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// /* ══════════════════════════════════════════════════════════════
//    COMPANY PROFILE
//    ══════════════════════════════════════════════════════════════ */

// // GET /api/settings/company
// export async function getCompany(req, res) {
//   const { companyId } = req.user;

//   try {
//     const result = await db.query(
//       "SELECT id, name, logo_url, address, timezone, currency FROM companies WHERE id=$1",
//       [companyId],
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ message: "Company not found." });
//     }

//     return res.status(200).json({ data: result.rows[0] });
//   } catch (err) {
//     console.error("getCompany error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// // PUT /api/settings/company
// // Body: { name, address, timezone, currency }
// export async function updateCompany(req, res) {
//   if (!isAdmin(req)) {
//     return res.status(403).json({ message: "Not authorized." });
//   }

//   const { companyId, userId } = req.user;
//   const { name, address, timezone, currency } = req.body;

//   if (!name?.trim()) {
//     return res.status(400).json({ message: "Company name is required." });
//   }

//   try {
//     await db.query(
//       `UPDATE companies
//        SET name=$1, address=$2, timezone=$3, currency=$4, updated_at=NOW()
//        WHERE id=$5`,
//       [
//         name.trim(),
//         address ?? null,
//         timezone ?? null,
//         currency ?? null,
//         companyId,
//       ],
//     );

//     logAudit(
//       companyId,
//       userId,
//       "company_profile_updated",
//       "company",
//       companyId,
//     );

//     return res.status(200).json({ message: "Company profile updated." });
//   } catch (err) {
//     console.error("updateCompany error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// // POST /api/settings/company/logo
// // multipart/form-data, field name "logo" (handled by multer upstream,
// // req.file.buffer available in memory storage mode)
// export async function uploadLogo(req, res) {
//   if (!isAdmin(req)) {
//     return res.status(403).json({ message: "Not authorized." });
//   }

//   const { companyId, userId } = req.user;

//   if (!req.file) {
//     return res.status(400).json({ message: "No logo file provided." });
//   }

//   try {
//     const uploadResult = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { folder: `bantahr/companies/${companyId}/logo`, overwrite: true },
//         (err, result) => (err ? reject(err) : resolve(result)),
//       );
//       stream.end(req.file.buffer);
//     });

//     await db.query(
//       "UPDATE companies SET logo_url=$1, updated_at=NOW() WHERE id=$2",
//       [uploadResult.secure_url, companyId],
//     );

//     logAudit(companyId, userId, "company_logo_updated", "company", companyId);

//     return res.status(200).json({
//       message: "Logo uploaded.",
//       logo_url: uploadResult.secure_url,
//     });
//   } catch (err) {
//     console.error("uploadLogo error:", err);
//     return res.status(500).json({ message: "Failed to upload logo." });
//   }
// }

// /* ══════════════════════════════════════════════════════════════
//    USERS / TEAM
//    ══════════════════════════════════════════════════════════════ */

// // GET /api/settings/users
// export async function getUsers(req, res) {
//   const { companyId } = req.user;

//   try {
//     const result = await db.query(
//       `SELECT id, first_name, last_name, email, role, status, created_at
//        FROM users WHERE company_id=$1 ORDER BY created_at DESC`,
//       [companyId],
//     );

//     return res.status(200).json({
//       data: result.rows.map((u) => ({
//         id: u.id,
//         name: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim(),
//         email: u.email,
//         role: u.role,
//         status: u.status,
//         createdAt: u.created_at,
//       })),
//     });
//   } catch (err) {
//     console.error("getUsers error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// // GET /api/settings/users/team  (lightweight list for pickers, e.g. "assign
// // report to an HR admin" — id/name/email/role only, no pagination)
// export async function getTeamMembers(req, res) {
//   const { companyId } = req.user;

//   try {
//     const result = await db.query(
//       `SELECT id, first_name, last_name, email, role
//        FROM users
//        WHERE company_id=$1 AND role = ANY($2::text[])
//        ORDER BY first_name ASC`,
//       [companyId, ADMIN_ROLES],
//     );

//     return res.status(200).json({
//       data: result.rows.map((u) => ({
//         id: u.id,
//         firstName: u.first_name,
//         lastName: u.last_name,
//         email: u.email,
//         role: u.role,
//       })),
//     });
//   } catch (err) {
//     console.error("getTeamMembers error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// // POST /api/settings/users/invite
// // Body: { email, role }
// export async function inviteUser(req, res) {
//   if (!isAdmin(req)) {
//     return res.status(403).json({ message: "Not authorized." });
//   }

//   const { companyId, userId } = req.user;
//   const { email, role } = req.body;

//   if (!email?.trim() || !role?.trim()) {
//     return res.status(400).json({ message: "email and role are required." });
//   }

//   try {
//     const existing = await db.query(
//       "SELECT id FROM users WHERE email=$1 AND company_id=$2",
//       [email.trim(), companyId],
//     );
//     if (existing.rowCount > 0) {
//       return res.status(409).json({ message: "User already exists." });
//     }

//     const result = await db.query(
//       `INSERT INTO users (company_id, email, role, status, created_at)
//        VALUES ($1, $2, $3, 'invited', NOW())
//        RETURNING id, email, role, status`,
//       [companyId, email.trim(), role.trim()],
//     );

//     // TODO: wire up actual email delivery (e.g. via your existing mailer
//     // service / SendGrid) with a signup link containing an invite token.

//     logAudit(companyId, userId, "user_invited", "user", result.rows[0].id, {
//       email: email.trim(),
//       role: role.trim(),
//     });

//     return res.status(201).json({
//       message: "Invitation sent.",
//       data: result.rows[0],
//     });
//   } catch (err) {
//     console.error("inviteUser error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// // PUT /api/settings/users/:userId/role
// // Body: { role }
// export async function updateUserRole(req, res) {
//   if (!isAdmin(req)) {
//     return res.status(403).json({ message: "Not authorized." });
//   }

//   const { companyId, userId: actorId } = req.user;
//   const { userId } = req.params;
//   const { role } = req.body;

//   if (!role?.trim()) {
//     return res.status(400).json({ message: "role is required." });
//   }

//   if (userId === actorId) {
//     return res
//       .status(400)
//       .json({ message: "You can't change your own role here." });
//   }

//   try {
//     const result = await db.query(
//       "UPDATE users SET role=$1, updated_at=NOW() WHERE id=$2 AND company_id=$3 RETURNING id, role",
//       [role.trim(), userId, companyId],
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     logAudit(companyId, actorId, "user_role_changed", "user", userId, {
//       newRole: role.trim(),
//     });

//     return res
//       .status(200)
//       .json({ message: "Role updated.", data: result.rows[0] });
//   } catch (err) {
//     console.error("updateUserRole error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// // DELETE /api/settings/users/:userId
// export async function removeUser(req, res) {
//   if (!isAdmin(req)) {
//     return res.status(403).json({ message: "Not authorized." });
//   }

//   const { companyId, userId: actorId } = req.user;
//   const { userId } = req.params;

//   if (userId === actorId) {
//     return res.status(400).json({ message: "You can't remove yourself." });
//   }

//   try {
//     const result = await db.query(
//       "DELETE FROM users WHERE id=$1 AND company_id=$2 RETURNING id",
//       [userId, companyId],
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     await db.query("DELETE FROM refresh_tokens WHERE user_id=$1", [userId]);

//     logAudit(companyId, actorId, "user_removed", "user", userId);

//     return res.status(200).json({ message: "User removed." });
//   } catch (err) {
//     console.error("removeUser error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// /* ══════════════════════════════════════════════════════════════
//    ROLES & PERMISSIONS
//    ══════════════════════════════════════════════════════════════ */

// // GET /api/settings/roles
// export async function getRoles(req, res) {
//   const { companyId } = req.user;

//   try {
//     const result = await db.query(
//       `SELECT r.id, r.name, r.permissions, r.editable,
//               COUNT(u.id) AS member_count
//        FROM roles r
//        LEFT JOIN users u ON u.role = r.name AND u.company_id = r.company_id
//        WHERE r.company_id = $1
//        GROUP BY r.id
//        ORDER BY r.editable ASC, r.name ASC`,
//       [companyId],
//     );

//     return res.status(200).json({
//       data: result.rows.map((r) => ({
//         id: r.id,
//         name: r.name,
//         permissions: r.permissions ?? {},
//         editable: r.editable,
//         memberCount: Number(r.member_count) || 0,
//       })),
//     });
//   } catch (err) {
//     console.error("getRoles error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// // PUT /api/settings/roles/:roleId
// // Body: { permissions: { employees: ["view","edit"], payroll: [...], ... } }
// export async function updateRolePermissions(req, res) {
//   if (!isAdmin(req)) {
//     return res.status(403).json({ message: "Not authorized." });
//   }

//   const { companyId, userId } = req.user;
//   const { roleId } = req.params;
//   const { permissions } = req.body;

//   if (!permissions || typeof permissions !== "object") {
//     return res.status(400).json({ message: "permissions object is required." });
//   }

//   try {
//     const roleCheck = await db.query(
//       "SELECT id, editable FROM roles WHERE id=$1 AND company_id=$2",
//       [roleId, companyId],
//     );

//     if (roleCheck.rowCount === 0) {
//       return res.status(404).json({ message: "Role not found." });
//     }

//     if (!roleCheck.rows[0].editable) {
//       return res.status(403).json({ message: "This role cannot be edited." });
//     }

//     await db.query(
//       "UPDATE roles SET permissions=$1::jsonb, updated_at=NOW() WHERE id=$2",
//       [JSON.stringify(permissions), roleId],
//     );

//     logAudit(companyId, userId, "role_permissions_updated", "role", roleId, {
//       permissions,
//     });

//     return res.status(200).json({ message: "Permissions updated." });
//   } catch (err) {
//     console.error("updateRolePermissions error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// /* ══════════════════════════════════════════════════════════════
//    AUDIT LOG
//    ══════════════════════════════════════════════════════════════ */

// // GET /api/settings/audit?page=1&limit=20
// export async function getAuditLogs(req, res) {
//   if (!isAdmin(req)) {
//     return res.status(403).json({ message: "Not authorized." });
//   }

//   const { companyId } = req.user;
//   const page = Math.max(1, parseInt(req.query.page, 10) || 1);
//   const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
//   const offset = (page - 1) * limit;

//   try {
//     const [rows, count] = await Promise.all([
//       db.query(
//         `SELECT a.id, a.action, a.entity_type, a.entity_id, a.metadata, a.created_at,
//                 u.first_name, u.last_name
//          FROM audit_logs a
//          LEFT JOIN users u ON u.id = a.actor_id
//          WHERE a.company_id = $1
//          ORDER BY a.created_at DESC
//          LIMIT $2 OFFSET $3`,
//         [companyId, limit, offset],
//       ),
//       db.query("SELECT COUNT(*) FROM audit_logs WHERE company_id=$1", [
//         companyId,
//       ]),
//     ]);

//     return res.status(200).json({
//       data: rows.rows.map((r) => ({
//         id: r.id,
//         action: r.action,
//         entityType: r.entity_type,
//         entityId: r.entity_id,
//         metadata: r.metadata,
//         createdAt: r.created_at,
//         actorName:
//           `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() || "System",
//       })),
//       meta: {
//         total: Number(count.rows[0].count),
//         page,
//         limit,
//         totalPages: Math.ceil(Number(count.rows[0].count) / limit),
//       },
//     });
//   } catch (err) {
//     console.error("getAuditLogs error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// /* ══════════════════════════════════════════════════════════════
//    BILLING
//    ══════════════════════════════════════════════════════════════ */

// // GET /api/settings/billing
// // NOTE: stubbed until a real payment processor (Paystack/Stripe) is wired
// // up for subscriptions — this returns whatever's on the companies row
// // today, with safe fallbacks, so the UI has something sensible to render.
// export async function getBilling(req, res) {
//   if (!isAdmin(req)) {
//     return res.status(403).json({ message: "Not authorized." });
//   }

//   const { companyId } = req.user;

//   try {
//     const result = await db.query(
//       `SELECT plan, billing_email, subscription_status, renews_at, seats_used, seats_limit
//        FROM companies WHERE id=$1`,
//       [companyId],
//     );

//     const c = result.rows[0] ?? {};

//     return res.status(200).json({
//       data: {
//         plan: c.plan ?? "free",
//         billingEmail: c.billing_email ?? null,
//         status: c.subscription_status ?? "active",
//         renewsAt: c.renews_at ?? null,
//         seatsUsed: c.seats_used ?? null,
//         seatsLimit: c.seats_limit ?? null,
//       },
//     });
//   } catch (err) {
//     console.error("getBilling error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// /* ══════════════════════════════════════════════════════════════
//    INTEGRATIONS
//    ══════════════════════════════════════════════════════════════ */

// // GET /api/settings/integrations
// export async function getIntegrations(req, res) {
//   const { companyId } = req.user;

//   try {
//     const result = await db.query(
//       "SELECT id, name, key, enabled FROM integrations WHERE company_id=$1 ORDER BY name ASC",
//       [companyId],
//     );

//     return res.status(200).json({ data: result.rows });
//   } catch (err) {
//     console.error("getIntegrations error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// // PUT /api/settings/integrations/:id
// // Body: { enabled: boolean }
// export async function toggleIntegration(req, res) {
//   if (!isAdmin(req)) {
//     return res.status(403).json({ message: "Not authorized." });
//   }

//   const { companyId, userId } = req.user;
//   const { id } = req.params;
//   const { enabled } = req.body;

//   if (typeof enabled !== "boolean") {
//     return res.status(400).json({ message: "enabled (boolean) is required." });
//   }

//   try {
//     const result = await db.query(
//       "UPDATE integrations SET enabled=$1, updated_at=NOW() WHERE id=$2 AND company_id=$3 RETURNING id, name, enabled",
//       [enabled, id, companyId],
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ message: "Integration not found." });
//     }

//     logAudit(
//       companyId,
//       userId,
//       enabled ? "integration_enabled" : "integration_disabled",
//       "integration",
//       id,
//     );

//     return res
//       .status(200)
//       .json({ message: "Integration updated.", data: result.rows[0] });
//   } catch (err) {
//     console.error("toggleIntegration error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }


// src/controllers/settings.controller.js
//
// Endpoints:
//   Security
//     PUT  /api/settings/security/password
//     PUT  /api/settings/security/2fa
//   Notifications
//     GET  /api/settings/notifications
//     PUT  /api/settings/notifications
//   My Profile
//     GET  /api/settings/me
//     PUT  /api/settings/me
//     POST /api/settings/me/avatar
//   Company Profile
//     GET  /api/settings/company
//     PUT  /api/settings/company
//     POST /api/settings/company/logo
//   Users / Team
//     GET    /api/settings/users
//     POST   /api/settings/users/invite
//     PUT    /api/settings/users/:userId/role
//     DELETE /api/settings/users/:userId
//   Roles & Permissions
//     GET /api/settings/roles
//     PUT /api/settings/roles/:roleId
//   Audit Log
//     GET /api/settings/audit
//   Billing
//     GET /api/settings/billing
//   Integrations
//     GET /api/settings/integrations
//     PUT /api/settings/integrations/:id
//
// Requires: authenticate middleware on all routes (sets req.user with
// { userId, companyId, role }).

import bcrypt from "bcryptjs";
import { db } from "../config/db.js";
import { uploadToCloud } from "../utils/upload.js";

const ADMIN_ROLES = ["owner", "hr_admin", "super_admin"];

function isAdmin(req) {
  return ADMIN_ROLES.includes(req.user?.role);
}

function logAudit(
  companyId,
  actorId,
  action,
  entityType,
  entityId,
  metadata = {},
) {
  // Fire-and-forget — an audit log failure should never block the request
  // that triggered it.
  db.query(
    `INSERT INTO audit_logs (company_id, actor_id, action, entity_type, entity_id, metadata, created_at)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW())`,
    [
      companyId,
      actorId,
      action,
      entityType,
      entityId,
      JSON.stringify(metadata),
    ],
  ).catch((err) => console.error("logAudit failed:", err));
}

/* ══════════════════════════════════════════════════════════════
   SECURITY
   ══════════════════════════════════════════════════════════════ */

// PUT /api/settings/security/password
// Body: { currentPassword, newPassword }
export async function changePassword(req, res) {
  const { userId } = req.user;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      message: "currentPassword and newPassword are required.",
    });
  }

  if (newPassword.length < 8) {
    return res.status(422).json({
      message: "New password must be at least 8 characters.",
    });
  }

  try {
    const result = await db.query(
      "SELECT id, password_hash FROM users WHERE id = $1",
      [userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!valid) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from your current password.",
      });
    }

    const hash = await bcrypt.hash(newPassword, 12);

    await db.query(
      "UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2",
      [hash, userId],
    );

    // Invalidate all refresh tokens so user must log in again on other devices
    await db.query("DELETE FROM refresh_tokens WHERE user_id=$1", [userId]);

    logAudit(req.user.companyId, userId, "password_changed", "user", userId);

    return res.status(200).json({
      message:
        "Password changed successfully. Please log in again on other devices.",
    });
  } catch (err) {
    console.error("changePassword error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// PUT /api/settings/security/2fa
// Body: { enabled: boolean }
export async function toggleTwoFactor(req, res) {
  const { userId } = req.user;
  const { enabled } = req.body;

  if (typeof enabled !== "boolean") {
    return res.status(400).json({ message: "enabled (boolean) is required." });
  }

  try {
    await db.query(
      "UPDATE users SET two_factor_enabled=$1, updated_at=NOW() WHERE id=$2",
      [enabled, userId],
    );

    logAudit(
      req.user.companyId,
      userId,
      enabled ? "2fa_enabled" : "2fa_disabled",
      "user",
      userId,
    );

    return res.status(200).json({
      message: enabled
        ? "Two-factor authentication enabled."
        : "Two-factor authentication disabled.",
      twoFactorEnabled: enabled,
    });
  } catch (err) {
    console.error("toggleTwoFactor error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

/* ══════════════════════════════════════════════════════════════
   NOTIFICATIONS
   ══════════════════════════════════════════════════════════════ */

// GET /api/settings/notifications
export async function getNotificationPrefs(req, res) {
  const { userId } = req.user;

  try {
    const result = await db.query(
      "SELECT notification_prefs FROM users WHERE id=$1",
      [userId],
    );

    const stored = result.rows[0]?.notification_prefs;

    const defaults = {
      requestApproved: { email: true, inApp: true, sms: false },
      newAnnouncement: { email: true, inApp: true, sms: false },
      payslipReady: { email: true, inApp: true, sms: true },
      leaveReminder: { email: true, inApp: true, sms: false },
      trainingDue: { email: false, inApp: true, sms: false },
      teamMessage: { email: false, inApp: true, sms: false },
    };

    const prefs = stored ? { ...defaults, ...stored } : defaults;

    return res.status(200).json({ preferences: prefs });
  } catch (err) {
    console.error("getNotificationPrefs error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// PUT /api/settings/notifications
// Body: { preferences: { requestApproved: { email, inApp, sms }, ... } }
export async function updateNotificationPrefs(req, res) {
  const { userId } = req.user;
  const { preferences } = req.body;

  if (!preferences || typeof preferences !== "object") {
    return res.status(400).json({ message: "preferences object is required." });
  }

  const ALLOWED_KEYS = [
    "requestApproved",
    "newAnnouncement",
    "payslipReady",
    "leaveReminder",
    "trainingDue",
    "teamMessage",
  ];
  const CHANNEL_KEYS = ["email", "inApp", "sms"];

  const sanitized = {};
  for (const key of ALLOWED_KEYS) {
    if (key in preferences && typeof preferences[key] === "object") {
      sanitized[key] = {};
      for (const ch of CHANNEL_KEYS) {
        if (ch in preferences[key]) {
          sanitized[key][ch] = Boolean(preferences[key][ch]);
        }
      }
    }
  }

  try {
    await db.query(
      `UPDATE users
       SET notification_prefs = $1::jsonb,
           updated_at         = NOW()
       WHERE id = $2`,
      [JSON.stringify(sanitized), userId],
    );

    return res.status(200).json({
      message: "Notification preferences saved.",
      preferences: sanitized,
    });
  } catch (err) {
    console.error("updateNotificationPrefs error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

/* ══════════════════════════════════════════════════════════════
   MY PROFILE (the logged-in admin's own account)
   ══════════════════════════════════════════════════════════════ */

// GET /api/settings/me
export async function getMyProfile(req, res) {
  const { userId } = req.user;

  try {
    const result = await db.query(
      `SELECT id, first_name, last_name, email, phone, avatar_url, role,
              two_factor_enabled
       FROM users WHERE id=$1`,
      [userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const u = result.rows[0];
    return res.status(200).json({
      data: {
        id: u.id,
        name: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim(),
        email: u.email,
        phone: u.phone,
        avatar_url: u.avatar_url,
        role: u.role,
        twoFactorEnabled: u.two_factor_enabled ?? false,
      },
    });
  } catch (err) {
    console.error("getMyProfile error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// PUT /api/settings/me
// Body: { name, email, phone }
export async function updateMyProfile(req, res) {
  const { userId } = req.user;
  const { name, email, phone } = req.body;

  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({ message: "name and email are required." });
  }

  const [firstName, ...rest] = name.trim().split(" ");
  const lastName = rest.join(" ");

  try {
    // Prevent duplicate emails across other users
    const dupe = await db.query(
      "SELECT id FROM users WHERE email=$1 AND id != $2",
      [email.trim(), userId],
    );
    if (dupe.rowCount > 0) {
      return res.status(409).json({ message: "Email is already in use." });
    }

    await db.query(
      `UPDATE users
       SET first_name=$1, last_name=$2, email=$3, phone=$4, updated_at=NOW()
       WHERE id=$5`,
      [
        firstName,
        lastName || null,
        email.trim(),
        phone?.trim() || null,
        userId,
      ],
    );

    logAudit(req.user.companyId, userId, "profile_updated", "user", userId);

    return res.status(200).json({ message: "Profile updated." });
  } catch (err) {
    console.error("updateMyProfile error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// POST /api/settings/me/avatar
// multipart/form-data, field name "avatar" (handled by multer upstream,
// req.file.buffer available in memory storage mode).
// Any authenticated user can update their own profile photo — no admin
// check here, unlike the company logo which is admin-only.
export async function uploadAvatar(req, res) {
  const { userId, companyId } = req.user;

  if (!req.file) {
    return res.status(400).json({ message: "No image file provided." });
  }

  try {
    const uploadResult = await uploadToCloud(req.file.buffer, {
      folder: `hriscloud/users/${userId}/avatar`,
      resourceType: "image",
      overwrite: true,
    });

    await db.query(
      "UPDATE users SET avatar_url=$1, updated_at=NOW() WHERE id=$2",
      [uploadResult.url, userId],
    );

    logAudit(companyId, userId, "avatar_updated", "user", userId);

    return res.status(200).json({
      message: "Profile photo updated.",
      avatar_url: uploadResult.url,
    });
  } catch (err) {
    console.error("uploadAvatar error:", err);
    return res
      .status(500)
      .json({ message: "Failed to upload profile photo." });
  }
}

/* ══════════════════════════════════════════════════════════════
   COMPANY PROFILE
   ══════════════════════════════════════════════════════════════ */

// GET /api/settings/company
export async function getCompany(req, res) {
  const { companyId } = req.user;

  try {
    const result = await db.query(
      "SELECT id, name, logo_url, address, timezone, currency FROM companies WHERE id=$1",
      [companyId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Company not found." });
    }

    return res.status(200).json({ data: result.rows[0] });
  } catch (err) {
    console.error("getCompany error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// PUT /api/settings/company
// Body: { name, address, timezone, currency }
export async function updateCompany(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Not authorized." });
  }

  const { companyId, userId } = req.user;
  const { name, address, timezone, currency } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Company name is required." });
  }

  try {
    await db.query(
      `UPDATE companies
       SET name=$1, address=$2, timezone=$3, currency=$4, updated_at=NOW()
       WHERE id=$5`,
      [
        name.trim(),
        address ?? null,
        timezone ?? null,
        currency ?? null,
        companyId,
      ],
    );

    logAudit(
      companyId,
      userId,
      "company_profile_updated",
      "company",
      companyId,
    );

    return res.status(200).json({ message: "Company profile updated." });
  } catch (err) {
    console.error("updateCompany error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// POST /api/settings/company/logo
// multipart/form-data, field name "logo" (handled by multer upstream,
// req.file.buffer available in memory storage mode)
export async function uploadLogo(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Not authorized." });
  }

  const { companyId, userId } = req.user;

  if (!req.file) {
    return res.status(400).json({ message: "No logo file provided." });
  }

  try {
    const uploadResult = await uploadToCloud(req.file.buffer, {
      folder: `hriscloud/companies/${companyId}/logo`,
      resourceType: "image",
      overwrite: true,
    });

    await db.query(
      "UPDATE companies SET logo_url=$1, updated_at=NOW() WHERE id=$2",
      [uploadResult.url, companyId],
    );

    logAudit(companyId, userId, "company_logo_updated", "company", companyId);

    return res.status(200).json({
      message: "Logo uploaded.",
      logo_url: uploadResult.url,
    });
  } catch (err) {
    console.error("uploadLogo error:", err);
    return res.status(500).json({ message: "Failed to upload logo." });
  }
}

/* ══════════════════════════════════════════════════════════════
   USERS / TEAM
   ══════════════════════════════════════════════════════════════ */

// GET /api/settings/users
export async function getUsers(req, res) {
  const { companyId } = req.user;

  try {
    const result = await db.query(
      `SELECT id, first_name, last_name, email, role, status, created_at
       FROM users WHERE company_id=$1 ORDER BY created_at DESC`,
      [companyId],
    );

    return res.status(200).json({
      data: result.rows.map((u) => ({
        id: u.id,
        name: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim(),
        email: u.email,
        role: u.role,
        status: u.status,
        createdAt: u.created_at,
      })),
    });
  } catch (err) {
    console.error("getUsers error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// GET /api/settings/users/team  (lightweight list for pickers, e.g. "assign
// report to an HR admin" — id/name/email/role only, no pagination)
export async function getTeamMembers(req, res) {
  const { companyId } = req.user;

  try {
    const result = await db.query(
      `SELECT id, first_name, last_name, email, role
       FROM users
       WHERE company_id=$1 AND role = ANY($2::text[])
       ORDER BY first_name ASC`,
      [companyId, ADMIN_ROLES],
    );

    return res.status(200).json({
      data: result.rows.map((u) => ({
        id: u.id,
        firstName: u.first_name,
        lastName: u.last_name,
        email: u.email,
        role: u.role,
      })),
    });
  } catch (err) {
    console.error("getTeamMembers error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// POST /api/settings/users/invite
// Body: { email, role }
export async function inviteUser(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Not authorized." });
  }

  const { companyId, userId } = req.user;
  const { email, role } = req.body;

  if (!email?.trim() || !role?.trim()) {
    return res.status(400).json({ message: "email and role are required." });
  }

  try {
    const existing = await db.query(
      "SELECT id FROM users WHERE email=$1 AND company_id=$2",
      [email.trim(), companyId],
    );
    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "User already exists." });
    }

    const result = await db.query(
      `INSERT INTO users (company_id, email, role, status, created_at)
       VALUES ($1, $2, $3, 'invited', NOW())
       RETURNING id, email, role, status`,
      [companyId, email.trim(), role.trim()],
    );

    // TODO: wire up actual email delivery (e.g. via your existing mailer
    // service / SendGrid) with a signup link containing an invite token.

    logAudit(companyId, userId, "user_invited", "user", result.rows[0].id, {
      email: email.trim(),
      role: role.trim(),
    });

    return res.status(201).json({
      message: "Invitation sent.",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("inviteUser error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// PUT /api/settings/users/:userId/role
// Body: { role }
export async function updateUserRole(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Not authorized." });
  }

  const { companyId, userId: actorId } = req.user;
  const { userId } = req.params;
  const { role } = req.body;

  if (!role?.trim()) {
    return res.status(400).json({ message: "role is required." });
  }

  if (userId === actorId) {
    return res
      .status(400)
      .json({ message: "You can't change your own role here." });
  }

  try {
    const result = await db.query(
      "UPDATE users SET role=$1, updated_at=NOW() WHERE id=$2 AND company_id=$3 RETURNING id, role",
      [role.trim(), userId, companyId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    logAudit(companyId, actorId, "user_role_changed", "user", userId, {
      newRole: role.trim(),
    });

    return res
      .status(200)
      .json({ message: "Role updated.", data: result.rows[0] });
  } catch (err) {
    console.error("updateUserRole error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// DELETE /api/settings/users/:userId
export async function removeUser(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Not authorized." });
  }

  const { companyId, userId: actorId } = req.user;
  const { userId } = req.params;

  if (userId === actorId) {
    return res.status(400).json({ message: "You can't remove yourself." });
  }

  try {
    const result = await db.query(
      "DELETE FROM users WHERE id=$1 AND company_id=$2 RETURNING id",
      [userId, companyId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    await db.query("DELETE FROM refresh_tokens WHERE user_id=$1", [userId]);

    logAudit(companyId, actorId, "user_removed", "user", userId);

    return res.status(200).json({ message: "User removed." });
  } catch (err) {
    console.error("removeUser error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

/* ══════════════════════════════════════════════════════════════
   ROLES & PERMISSIONS
   ══════════════════════════════════════════════════════════════ */

// GET /api/settings/roles
export async function getRoles(req, res) {
  const { companyId } = req.user;

  try {
    const result = await db.query(
      `SELECT r.id, r.name, r.permissions, r.editable,
              COUNT(u.id) AS member_count
       FROM roles r
       LEFT JOIN users u ON u.role = r.name AND u.company_id = r.company_id
       WHERE r.company_id = $1
       GROUP BY r.id
       ORDER BY r.editable ASC, r.name ASC`,
      [companyId],
    );

    return res.status(200).json({
      data: result.rows.map((r) => ({
        id: r.id,
        name: r.name,
        permissions: r.permissions ?? {},
        editable: r.editable,
        memberCount: Number(r.member_count) || 0,
      })),
    });
  } catch (err) {
    console.error("getRoles error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// PUT /api/settings/roles/:roleId
// Body: { permissions: { employees: ["view","edit"], payroll: [...], ... } }
export async function updateRolePermissions(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Not authorized." });
  }

  const { companyId, userId } = req.user;
  const { roleId } = req.params;
  const { permissions } = req.body;

  if (!permissions || typeof permissions !== "object") {
    return res.status(400).json({ message: "permissions object is required." });
  }

  try {
    const roleCheck = await db.query(
      "SELECT id, editable FROM roles WHERE id=$1 AND company_id=$2",
      [roleId, companyId],
    );

    if (roleCheck.rowCount === 0) {
      return res.status(404).json({ message: "Role not found." });
    }

    if (!roleCheck.rows[0].editable) {
      return res.status(403).json({ message: "This role cannot be edited." });
    }

    await db.query(
      "UPDATE roles SET permissions=$1::jsonb, updated_at=NOW() WHERE id=$2",
      [JSON.stringify(permissions), roleId],
    );

    logAudit(companyId, userId, "role_permissions_updated", "role", roleId, {
      permissions,
    });

    return res.status(200).json({ message: "Permissions updated." });
  } catch (err) {
    console.error("updateRolePermissions error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

/* ══════════════════════════════════════════════════════════════
   AUDIT LOG
   ══════════════════════════════════════════════════════════════ */

// GET /api/settings/audit?page=1&limit=20
export async function getAuditLogs(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Not authorized." });
  }

  const { companyId } = req.user;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
  const offset = (page - 1) * limit;

  try {
    const [rows, count] = await Promise.all([
      db.query(
        `SELECT a.id, a.action, a.entity_type, a.entity_id, a.metadata, a.created_at,
                u.first_name, u.last_name
         FROM audit_logs a
         LEFT JOIN users u ON u.id = a.actor_id
         WHERE a.company_id = $1
         ORDER BY a.created_at DESC
         LIMIT $2 OFFSET $3`,
        [companyId, limit, offset],
      ),
      db.query("SELECT COUNT(*) FROM audit_logs WHERE company_id=$1", [
        companyId,
      ]),
    ]);

    return res.status(200).json({
      data: rows.rows.map((r) => ({
        id: r.id,
        action: r.action,
        entityType: r.entity_type,
        entityId: r.entity_id,
        metadata: r.metadata,
        createdAt: r.created_at,
        actorName:
          `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() || "System",
      })),
      meta: {
        total: Number(count.rows[0].count),
        page,
        limit,
        totalPages: Math.ceil(Number(count.rows[0].count) / limit),
      },
    });
  } catch (err) {
    console.error("getAuditLogs error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

/* ══════════════════════════════════════════════════════════════
   BILLING
   ══════════════════════════════════════════════════════════════ */

// GET /api/settings/billing
// NOTE: stubbed until a real payment processor (Paystack/Stripe) is wired
// up for subscriptions — this returns whatever's on the companies row
// today, with safe fallbacks, so the UI has something sensible to render.
export async function getBilling(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Not authorized." });
  }

  const { companyId } = req.user;

  try {
    const result = await db.query(
      `SELECT plan, billing_email, subscription_status, renews_at, seats_used, seats_limit
       FROM companies WHERE id=$1`,
      [companyId],
    );

    const c = result.rows[0] ?? {};

    return res.status(200).json({
      data: {
        plan: c.plan ?? "free",
        billingEmail: c.billing_email ?? null,
        status: c.subscription_status ?? "active",
        renewsAt: c.renews_at ?? null,
        seatsUsed: c.seats_used ?? null,
        seatsLimit: c.seats_limit ?? null,
      },
    });
  } catch (err) {
    console.error("getBilling error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

/* ══════════════════════════════════════════════════════════════
   INTEGRATIONS
   ══════════════════════════════════════════════════════════════ */

// GET /api/settings/integrations
export async function getIntegrations(req, res) {
  const { companyId } = req.user;

  try {
    const result = await db.query(
      "SELECT id, name, key, enabled FROM integrations WHERE company_id=$1 ORDER BY name ASC",
      [companyId],
    );

    return res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error("getIntegrations error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// PUT /api/settings/integrations/:id
// Body: { enabled: boolean }
export async function toggleIntegration(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Not authorized." });
  }

  const { companyId, userId } = req.user;
  const { id } = req.params;
  const { enabled } = req.body;

  if (typeof enabled !== "boolean") {
    return res.status(400).json({ message: "enabled (boolean) is required." });
  }

  try {
    const result = await db.query(
      "UPDATE integrations SET enabled=$1, updated_at=NOW() WHERE id=$2 AND company_id=$3 RETURNING id, name, enabled",
      [enabled, id, companyId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Integration not found." });
    }

    logAudit(
      companyId,
      userId,
      enabled ? "integration_enabled" : "integration_disabled",
      "integration",
      id,
    );

    return res
      .status(200)
      .json({ message: "Integration updated.", data: result.rows[0] });
  } catch (err) {
    console.error("toggleIntegration error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}