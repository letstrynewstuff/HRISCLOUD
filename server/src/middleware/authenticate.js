// // src/middleware/authenticate.js
// //
// // FIX SUMMARY (403 errors):
// // ─────────────────────────────────────────────────────────────────────────────
// // Root cause: routes were using requireRole(["hr_admin","super_admin","manager"])
// // but "manager" is NEVER a JWT role. The users.role column only contains:
// //   hr_admin | super_admin | employee
// //
// // "Manager" is a business-hierarchy relationship (employees.manager_id),
// // NOT a platform permission role. It is exposed as `isManager: true` on
// // GET /auth/me. It is NEVER stored in the JWT.
// //
// // Fix: add requireManagerial() — allows access when:
// //   • role is hr_admin or super_admin  (full access)
// //   • OR the employee has at least one active direct report  (manager access)
// //
// // The function hits the DB live so it can never be spoofed via a stale token.
// // ─────────────────────────────────────────────────────────────────────────────

// import { verifyAccessToken } from "../utils/jwt.js";
// import { db } from "../config/db.js";

// // ══════════════════════════════════════════════════════════════
// // authenticate
// // Validates Bearer token and attaches req.user.
// // req.user shape: { userId, companyId, role }
// // ══════════════════════════════════════════════════════════════
// export function authenticate(req, res, next) {
//   const authHeader = req.headers.authorization;

//   if (!authHeader?.startsWith("Bearer ")) {
//     return res
//       .status(401)
//       .json({ message: "Missing or malformed Authorization header." });
//   }

//   const token = authHeader.slice(7);

//   try {
//     const decoded = verifyAccessToken(token);
//     req.user = {
//       userId: decoded.sub,
//       companyId: decoded.companyId,
//       role: decoded.role,
//     };
//     next();
//   } catch (err) {
//     if (err.name === "TokenExpiredError") {
//       return res
//         .status(401)
//         .json({ message: "Access token expired.", code: "TOKEN_EXPIRED" });
//     }
//     return res.status(401).json({ message: "Invalid access token." });
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // requireRole
// // Standard role guard — checks req.user.role (the JWT claim).
// // Use AFTER authenticate for HR-only routes.
// //
// // Usage: requireRole("hr_admin") | requireRole(["hr_admin","super_admin"])
// // ══════════════════════════════════════════════════════════════
// export function requireRole(roles) {
//   const allowed = Array.isArray(roles) ? roles : [roles];
//   return (req, res, next) => {
//     if (!allowed.includes(req.user?.role)) {
//       return res.status(403).json({
//         message: "You do not have permission to access this resource.",
//       });
//     }
//     next();
//   };
// }

// // ══════════════════════════════════════════════════════════════
// // requireManagerial
// // Allows access when the caller is:
// //   1. An HR admin / super admin  (full company access)
// //   2. OR a regular employee who manages at least one active direct report
// //      (scoped access — controllers must further filter by their team)
// //
// // This replaces the incorrect requireRole([..., "manager"]) pattern.
// // "manager" is NEVER a role value in the JWT.
// //
// // After this middleware runs, req.user is enriched with:
// //   req.user.isManagerial  — true  (always, because we only call next() then)
// //   req.user.isHR          — true if hr_admin or super_admin
// //   req.user.employeeId    — the employees.id for this user (may be null for pure admins)
// //
// // Controllers can check req.user.isHR to decide whether to return full-company
// // data or team-scoped data.
// // ══════════════════════════════════════════════════════════════
// // export async function requireManagerial(req, res, next) {
// //   const { userId, companyId, role } = req.user;

// //   // HR admins always pass — no DB query needed
// //   const isHR = role === "hr_admin" || role === "super_admin";
// //   if (isHR) {
// //     req.user.isHR         = true;
// //     req.user.isManagerial = true;
// //     req.user.employeeId   = null; // will be resolved lazily if needed by controller
// //     return next();
// //   }

// //   // For employees: resolve their employee record and check if they manage anyone
// //   try {
// //     const empResult = await db.query(
// //       `SELECT
// //          e.id,
// //          EXISTS (
// //            SELECT 1
// //            FROM   employees sub
// //            WHERE  sub.manager_id        = e.id
// //              AND  sub.company_id        = $2
// //              AND  sub.employment_status NOT IN ('terminated', 'resigned')
// //          ) AS "isManager"
// //        FROM employees e
// //        WHERE e.user_id    = $1
// //          AND e.company_id = $2
// //        LIMIT 1`,
// //       [userId, companyId],
// //     );

// //     const emp = empResult.rows[0];

// //     if (!emp) {
// //       return res.status(403).json({
// //         message: "No employee profile found for your account.",
// //       });
// //     }

// //     if (!emp.isManager) {
// //       return res.status(403).json({
// //         message:
// //           "Access denied. You must be a manager or HR administrator to access this resource.",
// //       });
// //     }

// //     // Enrich req.user so controllers can scope queries
// //     req.user.isHR         = false;
// //     req.user.isManagerial = true;
// //     req.user.employeeId   = emp.id;
// //     next();
// //   } catch (err) {
// //     console.error("requireManagerial error:", err);
// //     return res.status(500).json({ message: "Server error during authorization." });
// //   }
// // }

// export async function requireManagerial(req, res, next) {
//   try {
//     const { userId, companyId, role } = req.user;

//     const isHR = role === "hr_admin" || role === "super_admin";
//     if (isHR) {
//       req.user.isHR = true;
//       req.user.isManagerial = true;
//       return next();
//     }

//     // Optimization: Check for manager status
//     const empResult = await db.query(
//       `SELECT id, EXISTS (
//          SELECT 1 FROM employees
//          WHERE manager_id = e.id
//          AND employment_status NOT IN ('terminated', 'resigned')
//        ) AS "isManager"
//        FROM employees e
//        WHERE user_id = $1 AND company_id = $2`,
//       [userId, companyId],
//     );

//     const emp = empResult.rows[0];
//     if (!emp?.isManager) {
//       return res.status(403).json({
//         message: "Access denied. Managerial privileges required.",
//       });
//     }

//     req.user.isHR = false;
//     req.user.isManagerial = true;
//     req.user.employeeId = emp.id;
//     next();
//   } catch (err) {
//     // If it's a timeout, return a 503 so the frontend knows to retry
//     const isTimeout = err.message.includes("timeout");
//     res.status(isTimeout ? 503 : 500).json({
//       message: isTimeout ? "Database busy, try again." : "Authorization error.",
//     });
//   }
// }

import { verifyAccessToken } from "../utils/jwt.js";
import { db } from "../config/db.js";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Missing or malformed Authorization header." });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      userId: decoded.sub,
      companyId: decoded.companyId,
      role: decoded.role,
    };
    next();
  } catch (err) {
    const status = err.name === "TokenExpiredError" ? 401 : 401;
    return res.status(status).json({
      message:
        err.name === "TokenExpiredError"
          ? "Access token expired."
          : "Invalid access token.",
      code: err.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : undefined,
    });
  }
}

export function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!allowed.includes(req.user?.role)) {
      return res
        .status(403)
        .json({ message: "Access denied: Insufficient role." });
    }
    next();
  };
}

/**
 * requireManagerial
 * Used only for ADMIN/MANAGER specific routes (e.g., viewing salary history).
 */
export async function requireManagerial(req, res, next) {
  const { userId, companyId, role } = req.user;
  const isHR = role === "hr_admin" || role === "super_admin";

  if (isHR) {
    req.user.isHR = true;
    req.user.isManagerial = true;
    return next();
  }

  try {
    const empResult = await db.query(
      `SELECT id FROM employees 
       WHERE user_id = $1 AND company_id = $2 
       AND EXISTS (
         SELECT 1 FROM employees sub 
         WHERE sub.manager_id = employees.id 
         AND sub.employment_status NOT IN ('terminated', 'resigned')
       ) LIMIT 1`,
      [userId, companyId],
    );

    if (empResult.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "Managerial privileges required." });
    }

    req.user.isHR = false;
    req.user.isManagerial = true;
    req.user.employeeId = empResult.rows[0].id;
    next();
  } catch (err) {
    console.error("Auth Timeout/Error:", err);
    res.status(500).json({ message: "Authorization server timeout." });
  }
}