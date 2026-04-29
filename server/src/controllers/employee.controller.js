import bcrypt from "bcryptjs";
import crypto from "crypto";
import { parse } from "csv-parse/sync";
import { validationResult } from "express-validator";
import { db } from "../config/db.js";
import { signAccessToken } from "../utils/jwt.js";
import { sendInviteEmail } from "../config/mailer.js";
import {
  resolveEmployeeId,
  isDirectManager,
  wouldCreateCycle,
} from "../utils/hierarchy.js";

// ─── Internal helpers ──────────────────────────────────────────────────────────

/** Return 422 with field errors if express-validator found any. Returns true if halted. */
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

/**
 * Generate the next employee code for a company.
 * Format: EMP-0001, EMP-0042, …
 * Uses a DB sequence approach: counts existing employees in company + 1.
 */
async function generateEmployeeCode(client, companyId) {
  const result = await client.query(
    `SELECT COUNT(*) AS total FROM employees WHERE company_id = $1`,
    [companyId],
  );
  const next = parseInt(result.rows[0].total, 10) + 1;
  return `EMP-${String(next).padStart(4, "0")}`;
}

/**
 * Build a safe partial-update SET clause from a plain object.
 * Only includes keys explicitly listed in `allowed`.
 * Returns { setClauses: string, values: any[], nextIdx: number }
 *
 * Example:
 *   buildUpdateSet({ firstName: "Ada" }, ["firstName"], 1)
 *   → { setClauses: "first_name = $1", values: ["Ada"], nextIdx: 2 }
 */
function buildUpdateSet(data, allowed, startIdx = 1) {
  // Map camelCase keys → snake_case columns
  const columnMap = {
    firstName: "first_name",
    lastName: "last_name",
    middleName: "middle_name",
    dateOfBirth: "date_of_birth",
    gender: "gender",
    maritalStatus: "marital_status",
    phone: "phone",
    personalEmail: "personal_email",
    address: "address",
    state: "state",
    nationality: "nationality",
    nin: "nin",
    bvn: "bvn",
    passport: "passport",
    nokName: "nok_name",
    nokRelationship: "nok_relationship",
    nokPhone: "nok_phone",
    nokAddress: "nok_address",
    departmentId: "department_id",
    jobRoleId: "job_role_id",
    managerId: "manager_id",
    employmentType: "employment_type",
    employmentStatus: "employment_status",
    startDate: "start_date",
    confirmationDate: "confirmation_date",
    terminationDate: "termination_date",
    terminationReason: "termination_reason",
    location: "location",
    basicSalary: "basic_salary",
    payGrade: "pay_grade",
    bankName: "bank_name",
    accountNumber: "account_number",
    accountName: "account_name",
    pensionPin: "pension_pin",
    taxId: "tax_id",
    avatar: "avatar",
    bio: "bio",
    isOnboarded: "is_onboarded",
  };

  const setClauses = [];
  const values = [];
  let idx = startIdx;

  for (const key of allowed) {
    if (data[key] === undefined) continue;
    const col = columnMap[key];
    if (!col) continue;
    setClauses.push(`${col} = $${idx}`);
    values.push(data[key]);
    idx++;
  }

  return { setClauses, values, nextIdx: idx };
}

// ══════════════════════════════════════════════════════════════
// GET /api/employees
// Query params:
//   page        (default 1)
//   limit       (default 20, max 100)
//   search      — matches name, employee_code, email
//   department  — department_id UUID
//   status      — active | on_leave | suspended | terminated | resigned
//   type        — full_time | part_time | contract | intern
//   location    — text
//   sort        — field name, e.g. "last_name", "created_at"
//   order       — asc | desc  (default asc)
// Requires: authenticate + requireRole(["hr_admin","super_admin","manager"])
// ══════════════════════════════════════════════════════════════


// export async function listEmployees(req, res) {
//   try {
//     const { userId, companyId, role } = req.user;

//     const page = Math.max(1, parseInt(req.query.page ?? 1, 10));
//     const limit = Math.min(
//       100,
//       Math.max(1, parseInt(req.query.limit ?? 20, 10)),
//     );
//     const offset = (page - 1) * limit;

//     // 1. Get the caller's own employee details to know their department/manager
//     const callerResult = await db.query(
//       `SELECT id, department_id, manager_id FROM employees WHERE user_id = $1 AND company_id = $2`,
//       [userId, companyId],
//     );

//     const caller = callerResult.rows[0];
//     if (!caller) {
//       return res.status(404).json({ message: "Employee profile not found." });
//     }

//     // 2. Build the conditions
//     const conditions = ["e.company_id = $1"];
//     const values = [companyId];
//     let idx = 2;

//     // ── SCOPE FILTERING ──────────────────────────────────────────────────
//     // If the user is NOT a super admin or hr_admin, restrict the view.
//     // if (!["hr_admin", "super_admin"].includes(role)) {
//     //   // Filter: Show only people in the same department
//     //   conditions.push(`e.department_id = $${idx}`);
//     //   values.push(caller.department_id);
//     //   idx++;

//     //   // Filter: Show only people assigned to the same manager (peers)
//     //   // If the caller is a manager, they likely want to see their reports.
//     //   // If they are an employee, they see their teammates under the same boss.
//     //   conditions.push(`(e.manager_id = $${idx} OR e.id = $${idx})`);
//     //   values.push(caller.manager_id);
//     //   idx++;
//     // }
//     // ── SCOPE FILTERING ──────────────────────────────────────────────────
//     if (!["hr_admin", "super_admin"].includes(role)) {
//       // Check if caller manages anyone
//       const managesResult = await db.query(
//         `SELECT 1
//      FROM employees
//      WHERE manager_id = $1
//        AND company_id = $2
//        AND employment_status NOT IN ('terminated','resigned')
//      LIMIT 1`,
//         [caller.id, companyId],
//       );

//       const isManager = managesResult.rows.length > 0;

//       if (isManager) {
//         // Manager → see themselves + direct reports
//         conditions.push(`(e.manager_id = $${idx} OR e.id = $${idx})`);
//         values.push(caller.id);
//         idx++;
//       } else {
//         // Normal employee → see peers under same manager + self
//         conditions.push(`(e.manager_id = $${idx} OR e.id = $${idx})`);
//         values.push(caller.manager_id);
//         idx++;
//       }
//     }
//     // ─────────────────────────────────────────────────────────────────────

//     // 3. Handle additional query filters (Search, Status, etc.)
//     const { search, status } = req.query;
//     if (search) {
//       conditions.push(
//         `(e.first_name ILIKE $${idx} OR e.last_name ILIKE $${idx})`,
//       );
//       values.push(`%${search}%`);
//       idx++;
//     }
//     if (status) {
//       conditions.push(`e.employment_status = $${idx}`);
//       values.push(status);
//       idx++;
//     }

//     const whereClause = conditions.join(" AND ");

//     // 4. Execute final query
//     const countResult = await db.query(
//       `SELECT COUNT(*) AS total FROM employees e WHERE ${whereClause}`,
//       values,
//     );
//     const total = parseInt(countResult.rows[0].total, 10);

//     const dataResult = await db.query(
//       `SELECT
//          e.id, e.employee_code, e.first_name, e.last_name, e.avatar,
//          e.employment_type, e.employment_status,
//          d.name AS department_name,
//          jr.title AS job_role_name,
//          CONCAT(m.first_name, ' ', m.last_name) AS manager_name
//        FROM employees e
//        LEFT JOIN departments d ON d.id = e.department_id
//        LEFT JOIN job_roles jr ON jr.id = e.job_role_id
//        LEFT JOIN employees m ON m.id = e.manager_id
//        WHERE ${whereClause}
//        ORDER BY e.first_name ASC
//        LIMIT $${idx} OFFSET $${idx + 1}`,
//       [...values, limit, offset],
//     );

//     return res.status(200).json({
//       data: dataResult.rows,
//       meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
//     });
//   } catch (err) {
//     console.error("listEmployees error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error fetching employees." });
//   }
// }
export async function listEmployees(req, res) {
  try {
    const { userId, companyId, role } = req.user;

    const page = Math.max(1, parseInt(req.query.page ?? 1, 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit ?? 20, 10)),
    );
    const offset = (page - 1) * limit;

    const conditions = ["e.company_id = $1"];
    const values = [companyId];
    let idx = 2;

    // ── HR admins / super admins: skip employee-profile lookup entirely ──
    const isHR = ["hr_admin", "super_admin"].includes(role);

    if (!isHR) {
      // Resolve the caller's own employee record
      const callerResult = await db.query(
        `SELECT id, department_id, manager_id
         FROM employees
         WHERE user_id = $1 AND company_id = $2`,
        [userId, companyId],
      );

      const caller = callerResult.rows[0];
      if (!caller) {
        return res.status(404).json({ message: "Employee profile not found." });
      }

      // Check if this employee is a manager
      const managesResult = await db.query(
        `SELECT 1
         FROM employees
         WHERE manager_id = $1
           AND company_id = $2
           AND employment_status NOT IN ('terminated','resigned')
         LIMIT 1`,
        [caller.id, companyId],
      );

      const isManager = managesResult.rows.length > 0;

      if (isManager) {
        // Manager → see themselves + direct reports
        conditions.push(`(e.manager_id = $${idx} OR e.id = $${idx})`);
        values.push(caller.id);
        idx++;
      } else {
        // Normal employee → see peers under same manager + self
        conditions.push(`(e.manager_id = $${idx} OR e.id = $${idx})`);
        values.push(caller.manager_id);
        idx++;
      }
    }
    // HR admins: no extra conditions — they see everyone in the company

    // ── Additional query filters ──
    const { search, status, department, type, location } = req.query;

    if (search) {
      conditions.push(
        `(e.first_name ILIKE $${idx} OR e.last_name ILIKE $${idx} OR e.employee_code ILIKE $${idx})`,
      );
      values.push(`%${search}%`);
      idx++;
    }
    if (status) {
      conditions.push(`e.employment_status = $${idx}`);
      values.push(status);
      idx++;
    }
    if (department) {
      conditions.push(`e.department_id = $${idx}`);
      values.push(department);
      idx++;
    }
    if (type) {
      conditions.push(`e.employment_type = $${idx}`);
      values.push(type);
      idx++;
    }
    if (location) {
      conditions.push(`e.location ILIKE $${idx}`);
      values.push(`%${location}%`);
      idx++;
    }

    const whereClause = conditions.join(" AND ");

    // ── Count ──
    const countResult = await db.query(
      `SELECT COUNT(*) AS total FROM employees e WHERE ${whereClause}`,
      values,
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // ── Data ──
    const dataResult = await db.query(
      `SELECT
         e.id, e.employee_code, e.first_name, e.last_name, e.avatar,
         e.employment_type, e.employment_status, e.location, e.start_date,
         d.name                                  AS department_name,
         jr.title                                AS job_role_name,
         CONCAT(m.first_name, ' ', m.last_name)  AS manager_name
       FROM employees e
       LEFT JOIN departments d  ON d.id  = e.department_id
       LEFT JOIN job_roles   jr ON jr.id = e.job_role_id
       LEFT JOIN employees   m  ON m.id  = e.manager_id
       WHERE ${whereClause}
       ORDER BY e.first_name ASC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset],
    );

    return res.status(200).json({
      data: dataResult.rows,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("listEmployees error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching employees." });
  }
}
 


export async function createEmployee(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { companyId } = req.user || {};
  const {
    firstName,
    lastName,
    middleName,
    dateOfBirth,
    gender,
    maritalStatus,
    phone,
    personalEmail,
    address,
    state,
    nationality,
    nin,
    bvn,
    passport,
    nextOfKin,
    departmentId,
    jobRoleId,
    managerId,
    employmentType,
    startDate,
    confirmationDate,
    location,
    basicSalary,
    payGrade,
    bankName,
    accountNumber,
    accountName,
    pensionPin,
    taxId,
    password, // <--- This is currently plain text
    workEmail,
    sendInvite = false,
  } = req.body;

  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    // 1. Generate Employee Code
    const employeeCode = await generateEmployeeCode(client, companyId);

    // 2. Create User Account
    let newUserId = null;
    const loginEmail = (workEmail || personalEmail || "").toLowerCase();

    if (loginEmail && password) {
      // ✅ PERMANENT FIX: Hash the password before insertion
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const userResult = await client.query(
        `INSERT INTO users (company_id, first_name, last_name, email, password_hash, role, email_verified, created_at)
         VALUES ($1, $2, $3, $4, $5, 'employee', true, NOW())
         RETURNING id`,
        [
          companyId ?? null,
          firstName,
          lastName,
          loginEmail,
          hashedPassword, // ✅ Use the hashed version here
        ],
      );
      newUserId = userResult.rows[0].id;
    }

    // 3. Create Employee Record
    const empResult = await client.query(
      `INSERT INTO employees (
         company_id, user_id, manager_id, employee_code, 
         first_name, last_name, middle_name,
         date_of_birth, gender, marital_status, phone, personal_email, address,
         state, nationality, nin, bvn, passport, nok_name, nok_relationship, 
         nok_phone, nok_address, department_id, job_role_id, 
         employment_type, start_date, confirmation_date, location, 
         basic_salary, pay_grade, bank_name, account_number, account_name, 
         pension_pin, tax_id, is_onboarded, created_at
       )
       VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
         $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
         $31, $32, $33, $34, $35, false, NOW()
       ) RETURNING id`,
      [
        companyId ?? null,
        newUserId ?? null,
        managerId ?? null,
        employeeCode,
        firstName,
        lastName,
        middleName ?? null,
        dateOfBirth ?? null,
        gender ?? null,
        maritalStatus ?? null,
        phone ?? null,
        personalEmail ?? null,
        address ?? null,
        state ?? null,
        nationality ?? null,
        nin ?? null,
        bvn ?? null,
        passport ?? null,
        nextOfKin?.name ?? null,
        nextOfKin?.relationship ?? null,
        nextOfKin?.phone ?? null,
        nextOfKin?.address ?? null,
        departmentId ?? null,
        jobRoleId ?? null,
        employmentType,
        startDate ?? null,
        confirmationDate ?? null,
        location ?? null,
        basicSalary ?? null,
        payGrade ?? null,
        bankName ?? null,
        accountNumber ?? null,
        accountName ?? null,
        pensionPin ?? null,
        taxId ?? null,
      ],
    );
    const employeeId = empResult.rows[0].id;

    // 4. Update User with Employee Link
    if (newUserId) {
      await client.query(`UPDATE users SET employee_id = $1 WHERE id = $2`, [
        employeeId,
        newUserId,
      ]);
    }

    // 5. History Entry
    await client.query(
      `INSERT INTO employment_history (employee_id, event_type, notes, created_by)
       VALUES ($1, 'hired', 'Record created.', $2)`,
      [employeeId, req.user?.userId ?? null],
    );

    await client.query("COMMIT");
    return res
      .status(201)
      .json({ message: "Employee record created successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Database Error:", err);
    return res.status(500).json({
      message: "Failed to create employee.",
      error: err.message,
    });
  } finally {
    client.release();
  }
}


export async function getEmployee(req, res) {
  try {
    const { id } = req.params;
    const { companyId, role, userId } = req.user;

    // ── 1. Fetch employee (company guard in WHERE) ──
    const result = await db.query(
      `SELECT
         e.*,
         d.name                                   AS department_name,
         jr.title                                 AS job_role_name,
         jr.description                           AS job_role_description,
         CONCAT(m.first_name, ' ', m.last_name)   AS manager_name,
         m.employee_code                          AS manager_code,
         u.email                                  AS work_email,
         u.email_verified,
         u.last_login
       FROM employees e
       LEFT JOIN departments d  ON d.id  = e.department_id
       LEFT JOIN job_roles   jr ON jr.id = e.job_role_id
       LEFT JOIN employees   m  ON m.id  = e.manager_id
       LEFT JOIN users       u  ON u.id  = e.user_id
       WHERE e.id         = $1
         AND e.company_id = $2`,
      [id, companyId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const emp = result.rows[0];

    // ── 2. Authorization: hierarchy-based, not role-based ────────────────
    // HR can see everyone. Others can see themselves or their direct reports.
    if (!["hr_admin", "super_admin"].includes(role)) {
      // Resolve the caller's employee record
      const callerEmpId = await resolveEmployeeId(db, userId, companyId);

      // Allow: viewing self
      const isSelf = callerEmpId === emp.id;

      // Allow: viewing a direct report
      const manages = callerEmpId
        ? await isDirectManager(db, callerEmpId, emp.id, companyId)
        : false;

      if (!isSelf && !manages) {
        return res.status(403).json({ message: "Access denied." });
      }
    }
    // ─────────────────────────────────────────────────────────────────────

    // ── 3. Mask sensitive fields for non-HR users ──
    if (!["hr_admin", "super_admin"].includes(role)) {
      emp.bvn = undefined;
      emp.nin = undefined;
      emp.basic_salary = undefined;
      emp.account_number = undefined;
      emp.pension_pin = undefined;
      emp.tax_id = undefined;
    }

    return res.status(200).json({ data: emp });
  } catch (err) {
    console.error("getEmployee error:", err);
    return res.status(500).json({ message: "Server error fetching employee." });
  }
}


export async function updateEmployee(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { id } = req.params;
  const { companyId, userId } = req.user;

  const allowed = [
    "firstName",
    "lastName",
    "middleName",
    "dateOfBirth",
    "gender",
    "maritalStatus",
    "phone",
    "personalEmail",
    "address",
    "state",
    "nationality",
    "nin",
    "bvn",
    "passport",
    "nokName",
    "nokRelationship",
    "nokPhone",
    "nokAddress",
    "departmentId",
    "jobRoleId",
    "managerId",
    "employmentType",
    "employmentStatus",
    "startDate",
    "confirmationDate",
    "terminationDate",
    "terminationReason",
    "location",
    "basicSalary",
    "payGrade",
    "bankName",
    "accountNumber",
    "accountName",
    "pensionPin",
    "taxId",
    "avatar",
    "bio",
    "isOnboarded",
  ];

  const { setClauses, values, nextIdx } = buildUpdateSet(req.body, allowed, 1);

  if (setClauses.length === 0) {
    return res
      .status(400)
      .json({ message: "No valid fields provided for update." });
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    // ── Guard: employee must belong to this company ──
    const checkResult = await client.query(
      `SELECT id, employment_status, department_id, job_role_id, manager_id, user_id
       FROM employees
       WHERE id = $1 AND company_id = $2`,
      [id, companyId],
    );
    if (checkResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Employee not found." });
    }
    const before = checkResult.rows[0];

    // ── Manager assignment validation ──────────────────────────────────────
    if (
      req.body.managerId !== undefined &&
      req.body.managerId !== before.manager_id
    ) {
      const newManagerId = req.body.managerId;

      // Null-out is always allowed (remove manager assignment)
      if (newManagerId !== null) {
        // Prevent self-management
        if (newManagerId === id) {
          await client.query("ROLLBACK");
          return res
            .status(400)
            .json({ message: "An employee cannot be their own manager." });
        }

        // Verify proposed manager belongs to this company
        const managerCheck = await client.query(
          `SELECT id FROM employees WHERE id = $1 AND company_id = $2`,
          [newManagerId, companyId],
        );
        if (managerCheck.rows.length === 0) {
          await client.query("ROLLBACK");
          return res.status(400).json({
            message: "Proposed manager not found in this company.",
          });
        }

        // Detect circular hierarchy
        const hasCycle = await wouldCreateCycle(
          client,
          id,
          newManagerId,
          companyId,
        );
        if (hasCycle) {
          await client.query("ROLLBACK");
          return res.status(400).json({
            message:
              "This manager assignment would create a circular reporting hierarchy. " +
              "Check the existing org chart before reassigning.",
          });
        }
      }
    }
    // ─────────────────────────────────────────────────────────────────────

    // ── Apply update to employees table ──
    const updateResult = await client.query(
      `UPDATE employees
       SET ${setClauses.join(", ")}, updated_at = NOW()
       WHERE id         = $${nextIdx}
         AND company_id = $${nextIdx + 1}
       RETURNING *`,
      [...values, id, companyId],
    );
    const updated = updateResult.rows[0];

    // ── Propagate role to users table if payload contains `role` ───────────
    // Frontend EditEmployee sends { role: "manager" } when toggling the
    // manager switch. We coerce "manager" → "employee" because hierarchy
    // is determined by manager_id, not by users.role.
    if (req.body.role !== undefined && before.user_id) {
      const VALID_SYSTEM_ROLES = ["hr_admin", "super_admin", "employee"];
      const safeRole = VALID_SYSTEM_ROLES.includes(req.body.role)
        ? req.body.role
        : "employee"; // silently coerce "manager" to "employee"

      await client.query(`UPDATE users SET role = $1 WHERE id = $2`, [
        safeRole,
        before.user_id,
      ]);
    }
    // ─────────────────────────────────────────────────────────────────────

    // ── Log history for job-related field changes ──
    const jobChanged =
      req.body.departmentId !== undefined ||
      req.body.jobRoleId !== undefined ||
      req.body.managerId !== undefined ||
      req.body.employmentType !== undefined ||
      req.body.employmentStatus !== undefined;

    if (jobChanged) {
      const eventType =
        req.body.employmentStatus === "terminated"
          ? "terminated"
          : req.body.employmentStatus === "resigned"
            ? "resigned"
            : req.body.employmentStatus === "on_leave"
              ? "leave_started"
              : req.body.departmentId !== undefined &&
                  req.body.departmentId !== before.department_id
                ? "department_change"
                : req.body.managerId !== undefined &&
                    req.body.managerId !== before.manager_id
                  ? "manager_change"
                  : req.body.jobRoleId !== undefined &&
                      req.body.jobRoleId !== before.job_role_id
                    ? "role_change"
                    : "updated";

      await client.query(
        `INSERT INTO employment_history (
           employee_id, event_type, department_id, job_role_id,
           employment_type, employment_status, effective_date, notes, created_by
         )
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8)`,
        [
          id,
          eventType,
          updated.department_id,
          updated.job_role_id,
          updated.employment_type,
          updated.employment_status,
          req.body.notes ?? null,
          userId,
        ],
      );
    }

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Employee updated successfully.",
      data: updated,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("updateEmployee error:", err);
    return res.status(500).json({ message: "Server error updating employee." });
  } finally {
    client.release();
  }
}


export async function deleteEmployee(req, res) {
  const { id } = req.params;
  const { companyId, userId } = req.user;
  const { reason } = req.body;

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const result = await client.query(
      `UPDATE employees
       SET employment_status   = 'terminated',
           termination_date    = NOW(),
           termination_reason  = $1,
           updated_at          = NOW()
       WHERE id = $2 AND company_id = $3
       RETURNING id, user_id, first_name, last_name, employment_status`,
      [reason ?? null, id, companyId],
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Employee not found." });
    }

    const emp = result.rows[0];

    // Deactivate linked user account
    if (emp.user_id) {
      await client.query(`UPDATE users SET is_active = false WHERE id = $1`, [
        emp.user_id,
      ]);

      // Revoke all refresh tokens so active sessions end immediately
      await client.query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [
        emp.user_id,
      ]);
    }

    // Write termination history
    await client.query(
      `INSERT INTO employment_history (
         employee_id, event_type, employment_status, effective_date, notes, created_by
       )
       VALUES ($1, 'terminated', 'terminated', NOW(), $2, $3)`,
      [id, reason ?? "Terminated by HR.", userId],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: `${emp.first_name} ${emp.last_name} has been terminated.`,
      data: { id: emp.id, status: emp.employment_status },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("deleteEmployee error:", err);
    return res
      .status(500)
      .json({ message: "Server error terminating employee." });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/employees/bulk-import
// Body: multipart/form-data with field "file" (CSV)
// Expected CSV headers (camelCase or snake_case accepted):
//   firstName, lastName, personalEmail, employmentType,
//   departmentId, jobRoleId, startDate, location …
//
// Returns a summary: { created, failed, errors[] }
// Requires: authenticate + requireRole(["hr_admin","super_admin"])
// ══════════════════════════════════════════════════════════════
export async function bulkImportEmployees(req, res) {
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "A CSV file is required (field: file)." });
  }

  const { companyId, userId } = req.user;
  let records;

  try {
    records = parse(req.file.buffer, {
      columns: true, // first row = headers
      skip_empty_lines: true,
      trim: true,
    });
  } catch (parseErr) {
    return res
      .status(422)
      .json({ message: "Could not parse CSV file.", detail: parseErr.message });
  }

  if (records.length === 0) {
    return res.status(422).json({ message: "CSV file is empty." });
  }

  const results = { created: 0, failed: 0, errors: [] };

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    const line = i + 2; // +1 for 0-index, +1 for header row

    // Minimal required fields
    const firstName = row.firstName || row.first_name;
    const lastName = row.lastName || row.last_name;
    const personalEmail = row.personalEmail || row.personal_email;
    const employmentType = row.employmentType || row.employment_type;

    if (!firstName || !lastName || !personalEmail || !employmentType) {
      results.failed++;
      results.errors.push({
        line,
        row: i + 1,
        message:
          "Missing required fields: firstName, lastName, personalEmail, employmentType.",
      });
      continue;
    }

    const client = await db.getClient();
    try {
      await client.query("BEGIN");

      const employeeCode = await generateEmployeeCode(client, companyId);

      const tempPassword = crypto.randomBytes(10).toString("hex");
      const passwordHash = await bcrypt.hash(tempPassword, 12);
      const verifyToken = crypto.randomBytes(32).toString("hex");
      const vTokenHash = crypto
        .createHash("sha256")
        .update(verifyToken)
        .digest("hex");
      const verifyExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const userResult = await client.query(
        `INSERT INTO users (
           company_id, first_name, last_name, email, password_hash,
           role, email_verified, verify_token_hash, verify_token_expires, created_at
         )
         VALUES ($1, $2, $3, $4, $5, 'employee', false, $6, $7, NOW())
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [
          companyId,
          firstName,
          lastName,
          personalEmail.toLowerCase(),
          passwordHash,
          vTokenHash,
          verifyExpires,
        ],
      );

      if (userResult.rows.length === 0) {
        // Email already exists — skip
        await client.query("ROLLBACK");
        results.failed++;
        results.errors.push({
          line,
          row: i + 1,
          message: `Email already exists: ${personalEmail}`,
        });
        continue;
      }

      const newUserId = userResult.rows[0].id;

      const empResult = await client.query(
        `INSERT INTO employees (
           company_id, user_id, employee_code,
           first_name, last_name, middle_name,
           date_of_birth, gender, marital_status,
           phone, personal_email, address, state, nationality,
           department_id, job_role_id,
           employment_type, employment_status,
           start_date, location, is_onboarded, created_at
         )
         VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,
           $15,$16,$17,'active',$18,$19,false,NOW()
         )
         RETURNING id`,
        [
          companyId,
          newUserId,
          employeeCode,
          firstName,
          lastName,
          row.middleName || row.middle_name || null,
          row.dateOfBirth || row.date_of_birth || null,
          row.gender || null,
          row.maritalStatus || row.marital_status || null,
          row.phone || null,
          personalEmail,
          row.address || null,
          row.state || null,
          row.nationality || null,
          row.departmentId || row.department_id || null,
          row.jobRoleId || row.job_role_id || null,
          employmentType,
          row.startDate || row.start_date || null,
          row.location || null,
        ],
      );

      const newEmpId = empResult.rows[0].id;

      await client.query(`UPDATE users SET employee_id = $1 WHERE id = $2`, [
        newEmpId,
        newUserId,
      ]);

      await client.query(
        `INSERT INTO employment_history (
           employee_id, event_type, employment_type, employment_status,
           effective_date, notes, created_by
         )
         VALUES ($1, 'hired', $2, 'active', NOW(), 'Bulk import.', $3)`,
        [newEmpId, employmentType, userId],
      );

      await client.query("COMMIT");
      results.created++;

      // Non-blocking invite email
      sendInviteEmail(personalEmail, {
        firstName,
        tempPassword,
        verifyToken,
        companyId,
      }).catch((e) =>
        console.error(`Invite email failed for ${personalEmail}:`, e.message),
      );
    } catch (rowErr) {
      await client.query("ROLLBACK");
      results.failed++;
      results.errors.push({ line, row: i + 1, message: rowErr.message });
    } finally {
      client.release();
    }
  }

  return res.status(207).json({
    message: `Bulk import complete. ${results.created} created, ${results.failed} failed.`,
    ...results,
  });
}

// ══════════════════════════════════════════════════════════════
// GET /api/employees/:id/history
// Employment history log for one employee.
// Requires: authenticate + requireRole(["hr_admin","super_admin","manager"])
// ══════════════════════════════════════════════════════════════
export async function getEmployeeHistory(req, res) {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    // Ensure employee belongs to this company
    const check = await db.query(
      `SELECT id FROM employees WHERE id = $1 AND company_id = $2`,
      [id, companyId],
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const result = await db.query(
      `SELECT
         eh.*,
         d.name                                    AS department_name,
         jr.title                                  AS job_role_name,
         CONCAT(u.first_name, ' ', u.last_name)    AS recorded_by_name
       FROM employment_history eh
       LEFT JOIN departments d  ON d.id  = eh.department_id
       LEFT JOIN job_roles   jr ON jr.id = eh.job_role_id
       LEFT JOIN users       u  ON u.id  = eh.created_by
       WHERE eh.employee_id = $1
       ORDER BY eh.effective_date DESC`,
      [id],
    );

    return res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error("getEmployeeHistory error:", err);
    return res.status(500).json({ message: "Server error fetching history." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/employees/:id/offboard
// Initiates a structured offboarding workflow:
//   1. Sets status → terminated / resigned
//   2. Sets termination_date + termination_reason
//   3. Deactivates user account + revokes sessions
//   4. Creates offboarding_tasks rows (checklist)
//   5. Logs to employment_history
// Requires: authenticate + requireRole(["hr_admin","super_admin"])
// ══════════════════════════════════════════════════════════════
// export async function offboardEmployee(req, res) {
//   const { id } = req.params;
//   const { companyId, userId } = req.user;
//   const {
//     exitType = "terminated", // 'terminated' | 'resigned' | 'retired'
//     terminationDate,
//     terminationReason,
//     lastWorkingDay,
//     notes,
//   } = req.body;

//   if (!["terminated", "resigned", "retired"].includes(exitType)) {
//     return res
//       .status(400)
//       .json({ message: "exitType must be terminated, resigned, or retired." });
//   }

//   const client = await db.getClient();
//   try {
//     await client.query("BEGIN");

//     const empResult = await client.query(
//       `UPDATE employees
//        SET employment_status   = $1,
//            termination_date    = $2,
//            termination_reason  = $3,
//            updated_at          = NOW()
//        WHERE id = $4 AND company_id = $5
//        RETURNING id, user_id, first_name, last_name`,
//       [
//         exitType,
//         terminationDate ??
//           lastWorkingDay ??
//           new Date().toISOString().split("T")[0],
//         terminationReason ?? null,
//         id,
//         companyId,
//       ],
//     );

//     if (empResult.rows.length === 0) {
//       await client.query("ROLLBACK");
//       return res.status(404).json({ message: "Employee not found." });
//     }

//     const emp = empResult.rows[0];

//     // Deactivate user account + purge sessions
//     if (emp.user_id) {
//       await client.query(`UPDATE users SET is_active = false WHERE id = $1`, [
//         emp.user_id,
//       ]);
//       await client.query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [
//         emp.user_id,
//       ]);
//     }

//     // Standard offboarding checklist tasks
//     const defaultTasks = [
//       "Return company equipment",
//       "Revoke system access",
//       "Complete exit interview",
//       "Process final payroll",
//       "Update org chart",
//       "Archive employee documents",
//     ];

//     for (const task of defaultTasks) {
//       await client.query(
//         `INSERT INTO offboarding_tasks (employee_id, task, status, created_at)
//          VALUES ($1, $2, 'pending', NOW())`,
//         [id, task],
//       );
//     }

//     // History entry
//     await client.query(
//       `INSERT INTO employment_history (
//          employee_id, event_type, employment_status, effective_date, notes, created_by
//        )
//        VALUES ($1, $2, $3, $4, $5, $6)`,
//       [
//         id,
//         exitType,
//         exitType,
//         terminationDate ?? new Date().toISOString().split("T")[0],
//         notes ?? `Offboarding initiated (${exitType}).`,
//         userId,
//       ],
//     );

//     await client.query("COMMIT");

//     return res.status(200).json({
//       message: `Offboarding initiated for ${emp.first_name} ${emp.last_name}.`,
//       data: {
//         employeeId: emp.id,
//         status: exitType,
//         tasksCreated: defaultTasks.length,
//         terminationDate: terminationDate ?? lastWorkingDay,
//       },
//     });
//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error("offboardEmployee error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error initiating offboarding." });
//   } finally {
//     client.release();
//   }
// }
// export async function offboardEmployee(req, res) {
//   const { id } = req.params;
//   const { companyId, userId } = req.user;

//   const {
//     exitType = "terminated",
//     terminationDate,
//     terminationReason,
//     lastWorkingDay,
//     notes,
//   } = req.body;

//   // Validate exitType
//   if (!["terminated", "resigned", "retired"].includes(exitType)) {
//     return res.status(400).json({
//       message: "exitType must be one of: terminated, resigned, or retired.",
//     });
//   }

//   // Basic date validation
//   const effectiveDate = terminationDate || lastWorkingDay;
//   if (effectiveDate && isNaN(new Date(effectiveDate).getTime())) {
//     return res.status(400).json({
//       message: "Invalid date format for terminationDate or lastWorkingDay.",
//     });
//   }

//   const client = await db.getClient();

//   try {
//     await client.query("BEGIN");

//     // Update employee record + prevent double offboarding
//     const empResult = await client.query(
//       `UPDATE employees
//        SET employment_status = $1,
//            termination_date = $2,
//            termination_reason = $3,
//            updated_at = NOW()
//        WHERE id = $4 
//          AND company_id = $5
//          AND employment_status NOT IN ('terminated', 'resigned', 'retired')
//        RETURNING id, user_id, first_name, last_name`,
//       [
//         exitType,
//         effectiveDate || new Date().toISOString().split("T")[0],
//         terminationReason ? terminationReason.trim() : null,
//         id,
//         companyId,
//       ],
//     );

//     if (empResult.rows.length === 0) {
//       await client.query("ROLLBACK");
//       return res.status(404).json({
//         message: "Employee not found or already offboarded.",
//       });
//     }

//     const emp = empResult.rows[0];

//     // Deactivate user account + purge sessions
//     if (emp.user_id) {
//       await client.query(
//         `UPDATE users 
//          SET is_active = false, updated_at = NOW() 
//          WHERE id = $1`,
//         [emp.user_id],
//       );

//       await client.query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [
//         emp.user_id,
//       ]);
//     }

//     // Standard offboarding checklist
//     const defaultTasks = [
//       "Return company equipment",
//       "Revoke system access",
//       "Complete exit interview",
//       "Process final payroll",
//       "Update org chart",
//       "Archive employee documents",
//     ];

//     for (const task of defaultTasks) {
//       await client.query(
//         `INSERT INTO offboarding_tasks (employee_id, task, status, created_at)
//          VALUES ($1, $2, 'pending', NOW())`,
//         [id, task],
//       );
//     }

//     // Add entry to employment history
//     // await client.query(
//     //   `INSERT INTO employment_history (
//     //      employee_id, 
//     //      event_type, 
        
//     //      effective_date, 
//     //      notes, 
//     //      created_by
//     //    )
//     //    VALUES ($1, $2, $3, $4, $5, $6)`,
//     //   [
//     //     id,
//     //     "offboarded", // You can change to exitType if preferred
//     //     exitType,
//     //     effectiveDate || new Date().toISOString().split("T")[0],
//     //     notes ? notes.trim() : `Employee offboarded (${exitType}).`,
//     //     userId,
//     //   ],
//     // );
//     await client.query(
//       `INSERT INTO employment_history (
//      employee_id, 
//      event_type,
//      employment_type,
//      effective_date, 
//      notes, 
//      created_by
//    )
//    VALUES ($1, $2, $3, $4, $5, $6)`,
//       [
//         id,
//         "offboarded",
//         exitType, // now valid
//         effectiveDate || new Date().toISOString().split("T")[0],
//         notes ? notes.trim() : `Employee offboarded (${exitType}).`,
//         userId,
//       ],
//     );

//     await client.query("COMMIT");

//     return res.status(200).json({
//       message: `Offboarding successfully initiated for ${emp.first_name} ${emp.last_name}.`,
//       data: {
//         employeeId: emp.id,
//         exitType,
//         terminationDate: effectiveDate,
//         tasksCreated: defaultTasks.length,
//       },
//     });
//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error("offboardEmployee error:", err);
//     return res.status(500).json({
//       message: "Internal server error while initiating offboarding.",
//     });
//   } finally {
//     client.release();
//   }
// }

// ══════════════════════════════════════════════════════════════
// GET /api/employees/org-chart
// Returns the company's org tree as a recursive nested structure.
// Root nodes = employees with no manager (manager_id IS NULL).
// Requires: authenticate
// ══════════════════════════════════════════════════════════════
export async function getOrgChart(req, res) {
  try {
    const { companyId } = req.user;

    // Fetch every active employee with only the fields needed for the chart
    const result = await db.query(
      `SELECT
         e.id,
         e.employee_code,
         e.first_name,
         e.last_name,
         e.avatar,
         e.manager_id,
         e.employment_status,
         d.name  AS department_name,
         jr.title AS job_role_name
       FROM employees e
       LEFT JOIN departments d  ON d.id  = e.department_id
       LEFT JOIN job_roles   jr ON jr.id = e.job_role_id
       WHERE e.company_id = $1
         AND e.employment_status NOT IN ('terminated', 'resigned')
       ORDER BY e.first_name`,
      [companyId],
    );

    const employees = result.rows;

    // Build a map for O(1) lookup
    const map = {};
    employees.forEach((e) => {
      map[e.id] = { ...e, children: [] };
    });

    const roots = [];
    employees.forEach((e) => {
      if (e.manager_id && map[e.manager_id]) {
        map[e.manager_id].children.push(map[e.id]);
      } else {
        roots.push(map[e.id]);
      }
    });

    return res.status(200).json({ data: roots });
  } catch (err) {
    console.error("getOrgChart error:", err);
    return res
      .status(500)
      .json({ message: "Server error building org chart." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/employees/invite
// (Re-)sends a login invite to one or more employee work emails.
// Body: { employeeIds: string[] }
// Requires: authenticate + requireRole(["hr_admin","super_admin"])
// ══════════════════════════════════════════════════════════════
export async function inviteEmployee(req, res) {
  const { employeeIds } = req.body;
  const { companyId } = req.user;

  if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
    return res
      .status(400)
      .json({ message: "employeeIds must be a non-empty array." });
  }

  try {
    // Fetch matching employees + their linked user accounts
    const result = await db.query(
      `SELECT e.id AS employee_id, e.first_name, u.id AS user_id, u.email, u.email_verified
       FROM employees e
       JOIN users u ON u.id = e.user_id
       WHERE e.id = ANY($1::uuid[])
         AND e.company_id = $2`,
      [employeeIds, companyId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No matching employees found." });
    }

    const sent = [];
    const skipped = [];

    for (const emp of result.rows) {
      if (emp.email_verified) {
        skipped.push({
          employeeId: emp.employee_id,
          email: emp.email,
          reason: "Already verified.",
        });
        continue;
      }

      // Generate a fresh invite token
      const tempPassword = crypto.randomBytes(10).toString("hex");
      const passwordHash = await bcrypt.hash(tempPassword, 12);
      const verifyToken = crypto.randomBytes(32).toString("hex");
      const vTokenHash = crypto
        .createHash("sha256")
        .update(verifyToken)
        .digest("hex");
      const verifyExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await db.query(
        `UPDATE users
         SET password_hash = $1,
             verify_token_hash = $2,
             verify_token_expires = $3
         WHERE id = $4`,
        [passwordHash, vTokenHash, verifyExpires, emp.user_id],
      );

      try {
        await sendInviteEmail(emp.email, {
          firstName: emp.first_name,
          tempPassword,
          verifyToken,
          companyId,
        });
        sent.push({ employeeId: emp.employee_id, email: emp.email });
      } catch (mailErr) {
        console.error(`Invite failed for ${emp.email}:`, mailErr.message);
        skipped.push({
          employeeId: emp.employee_id,
          email: emp.email,
          reason: "Email delivery failed.",
        });
      }
    }

    return res.status(200).json({
      message: `Invites processed. ${sent.length} sent, ${skipped.length} skipped.`,
      sent,
      skipped,
    });
  } catch (err) {
    console.error("inviteEmployee error:", err);
    return res.status(500).json({ message: "Server error sending invites." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/employees/me
// Employee views their own full profile.
// Requires: authenticate (any role — employee looks at themselves)
// ══════════════════════════════════════════════════════════════
export async function getMyProfile(req, res) {
  try {
    const { userId, companyId } = req.user;

    const result = await db.query(
      `SELECT
         e.*,
         d.name                                   AS department_name,
         jr.title                                  AS job_role_name,
         CONCAT(m.first_name, ' ', m.last_name)   AS manager_name,
         m.employee_code                          AS manager_code,
         u.email                                  AS work_email,
         u.email_verified,
         u.last_login
       FROM employees e
       LEFT JOIN departments d  ON d.id  = e.department_id
       LEFT JOIN job_roles   jr ON jr.id = e.job_role_id
       LEFT JOIN employees   m  ON m.id  = e.manager_id
       LEFT JOIN users       u  ON u.id  = e.user_id
       WHERE e.user_id = $1
         AND e.company_id = $2`,
      [userId, companyId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Employee profile not found." });
    }

    const emp = result.rows[0];

    // Employees never see their own BVN / NIN in API response (still stored securely)
    emp.bvn = undefined;
    emp.nin = undefined;

    return res.status(200).json({ data: emp });
  } catch (err) {
    console.error("getMyProfile error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching your profile." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/employees/me
// Employee submits a change request for their own profile.
// Does NOT apply changes directly — creates a pending_change_requests
// row for HR to review and approve.
//
// Fields an employee is allowed to REQUEST changes on:
//   phone, address, state, personalEmail,
//   nokName, nokRelationship, nokPhone, nokAddress,
//   bankName, accountNumber, accountName, avatar, bio
//
// Requires: authenticate (employee role)
// ══════════════════════════════════════════════════════════════
export async function requestProfileChange(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { userId, companyId } = req.user;

  // Only these fields are self-serviceable
  const selfServiceFields = [
    "phone",
    "address",
    "state",
    "personalEmail",
    "nokName",
    "nokRelationship",
    "nokPhone",
    "nokAddress",
    "bankName",
    "accountNumber",
    "accountName",
    "avatar",
    "bio",
  ];

  // Extract only allowed keys from req.body
  const requestedChanges = {};
  for (const field of selfServiceFields) {
    if (req.body[field] !== undefined) {
      requestedChanges[field] = req.body[field];
    }
  }

  if (Object.keys(requestedChanges).length === 0) {
    return res.status(400).json({ message: "No updatable fields provided." });
  }

  try {
    // Find the employee record for this user
    const empResult = await db.query(
      `SELECT id FROM employees WHERE user_id = $1 AND company_id = $2`,
      [userId, companyId],
    );

    if (empResult.rows.length === 0) {
      return res.status(404).json({ message: "Employee profile not found." });
    }

    const employeeId = empResult.rows[0].id;

    // Check for an existing pending request — prevent duplicates
    const existing = await db.query(
      `SELECT id FROM pending_change_requests
       WHERE employee_id = $1 AND status = 'pending'`,
      [employeeId],
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        message:
          "You already have a pending change request. Please wait for HR to review it.",
      });
    }

    // Snapshot current values for the requested fields (for diff display in HR UI)
    const {
      setClauses: _s,
      values: _v,
      nextIdx: _n,
    } = buildUpdateSet(requestedChanges, selfServiceFields, 1);
    const columnMap = {
      phone: "phone",
      address: "address",
      state: "state",
      personalEmail: "personal_email",
      nokName: "nok_name",
      nokRelationship: "nok_relationship",
      nokPhone: "nok_phone",
      nokAddress: "nok_address",
      bankName: "bank_name",
      accountNumber: "account_number",
      accountName: "account_name",
      avatar: "avatar",
      bio: "bio",
    };
    const dbCols = Object.keys(requestedChanges)
      .map((k) => columnMap[k])
      .filter(Boolean);
    const currentSnap = await db.query(
      `SELECT ${dbCols.join(", ")} FROM employees WHERE id = $1`,
      [employeeId],
    );
    const before = currentSnap.rows[0] ?? {};

    // Store the change request
    const changeResult = await db.query(
      `INSERT INTO pending_change_requests (
         employee_id, requested_changes, current_snapshot, status, created_at
       )
       VALUES ($1, $2, $3, 'pending', NOW())
       RETURNING id, created_at`,
      [employeeId, JSON.stringify(requestedChanges), JSON.stringify(before)],
    );

    return res.status(202).json({
      message: "Your profile change request has been submitted for HR review.",
      data: {
        requestId: changeResult.rows[0].id,
        createdAt: changeResult.rows[0].created_at,
        changes: requestedChanges,
      },
    });
  } catch (err) {
    console.error("requestProfileChange error:", err);
    return res
      .status(500)
      .json({ message: "Server error submitting change request." });
  }
}
