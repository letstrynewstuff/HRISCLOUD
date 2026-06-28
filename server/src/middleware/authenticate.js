

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