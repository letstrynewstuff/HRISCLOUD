// // src/controllers/jobRole.controller.js


// import { db } from "../config/db.js";
// import { validationResult } from "express-validator";





// // ─── Internal helpers ─────────────────────────────────────────

// /** Halt and return 422 if express-validator found errors. */
// function handleValidationErrors(req, res) {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     res
//       .status(422)
//       .json({ message: "Validation failed.", errors: errors.array() });
//     return true;
//   }
//   return false;
// }

// /**
//  * Serialize a raw pg row into a clean camelCase API response.
//  * The LEFT JOIN on departments adds department_name to every row;
//  * it will be null when no department is assigned.
//  */
// function serialize(row) {
//   return {
//     id: row.id,
//     companyId: row.company_id,
//     title: row.title,
//     departmentId: row.department_id,
//     departmentName: row.department_name ?? null,
//     grade: row.grade,
//     minSalary: row.min_salary !== null ? Number(row.min_salary) : null,
//     maxSalary: row.max_salary !== null ? Number(row.max_salary) : null,
//     description: row.description,
//     isActive: row.is_active,
//     createdAt: row.created_at,
//     updatedAt: row.updated_at,
//   };
// }

// // ─── Reusable SELECT fragment ─────────────────────────────────
// // Keeps the JOIN consistent across listJobRoles and getJobRole.
// const SELECT_WITH_DEPT = `
//   SELECT
//     jr.id,
//     jr.company_id,
//     jr.title,
//     jr.department_id,
//     d.name   AS department_name,
//     jr.grade,
//     jr.min_salary,
//     jr.max_salary,
//     jr.description,
//     jr.is_active,
//     jr.created_at,
//     jr.updated_at
//   FROM job_roles jr
//   LEFT JOIN departments d ON d.id = jr.department_id
// `;
// src/controllers/jobRole.controller.js
import { db } from "../config/db.js";
import { validationResult } from "express-validator";

// ─── Internal helpers ─────────────────────────────────────────

/** Halt and return 422 if express-validator found errors. */
function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ message: "Validation failed.", errors: errors.array() });
    return true;
  }
  return false;
}

/**
 * Serialize a raw pg row into a clean camelCase API response.
 * Maps data from Job Roles, Departments, and the new Grades table.
 */
function serialize(row) {
  return {
    id: row.id,
    companyId: row.company_id,
    title: row.title,
    departmentId: row.department_id,
    departmentName: row.department_name ?? null,
    
    // DYNAMIC GRADE DATA (From the Grades Table)
    gradeId: row.grade_id,
    gradeName: row.grade_name ?? null,
    gradeColor: row.grade_color ?? null,
    
    // Salary is now pulled from the Grade relationship
    minSalary: row.grade_min_salary !== null ? Number(row.grade_min_salary) : null,
    maxSalary: row.grade_max_salary !== null ? Number(row.grade_max_salary) : null,
    
    description: row.description,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Reusable SELECT fragment ─────────────────────────────────
// This JOIN is the engine that pulls the dynamic Grade and Dept info
const SELECT_WITH_DEPT_AND_GRADE = `
  SELECT
    jr.id,
    jr.company_id,
    jr.title,
    jr.department_id,
    d.name AS department_name,
    jr.grade_id,
    g.name AS grade_name,
    g.color_code AS grade_color,
    g.min_salary AS grade_min_salary,
    g.max_salary AS grade_max_salary,
    jr.description,
    jr.is_active,
    jr.created_at,
    jr.updated_at
  FROM job_roles jr
  LEFT JOIN departments d ON d.id = jr.department_id
  LEFT JOIN grades g ON g.id = jr.grade_id
`;

// ══════════════════════════════════════════════════════════════
// GET /api/job-roles
// ══════════════════════════════════════════════════════════════
export async function listJobRoles(req, res) {
  try {
    const { companyId } = req.user;
    const { departmentId, includeInactive } = req.query;

    const conditions = ["jr.company_id = $1"];
    const params = [companyId];
    let idx = 2;

    const showInactive =
      includeInactive === "true" &&
      ["hr_admin", "super_admin"].includes(req.user.role);

    if (!showInactive) {
      conditions.push("jr.is_active = true");
    }

    if (departmentId) {
      conditions.push(`jr.department_id = $${idx++}`);
      params.push(departmentId);
    }

    const { rows } = await db.query(
      `${SELECT_WITH_DEPT_AND_GRADE}
       WHERE ${conditions.join(" AND ")}
       ORDER BY jr.title ASC`,
      params,
    );

    return res.status(200).json({
      count: rows.length,
      roles: rows.map(serialize),
    });
  } catch (err) {
    console.error("listJobRoles error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/job-roles
// ══════════════════════════════════════════════════════════════
export async function createJobRole(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { companyId } = req.user;
  const {
    title,
    departmentId,
    gradeId, // Now receiving the ID from the Grades table
    description,
    isActive = true,
  } = req.body;

  try {
    // 1. Cross-tenant department check
    if (departmentId) {
      const deptCheck = await db.query(
        `SELECT id FROM departments WHERE id = $1 AND company_id = $2`,
        [departmentId, companyId],
      );
      if (deptCheck.rowCount === 0) {
        return res.status(404).json({ message: "Department not found." });
      }
    }

    // 2. Insert into job_roles (using grade_id column)
    const { rows } = await db.query(
      `INSERT INTO job_roles (
         company_id, title, department_id, grade_id,
         description, is_active
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        companyId,
        title,
        departmentId ?? null,
        gradeId ?? null,
        description ?? null,
        Boolean(isActive),
      ],
    );

    // 3. Fetch full record with JOINs for the response
    const full = await db.query(
      `${SELECT_WITH_DEPT_AND_GRADE} WHERE jr.id = $1 AND jr.company_id = $2`,
      [rows[0].id, companyId],
    );

    return res.status(201).json({
      message: "Job role created.",
      role: serialize(full.rows[0]),
    });
  } catch (err) {
    console.error("createJobRole error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/job-roles/:id
// ══════════════════════════════════════════════════════════════
export async function getJobRole(req, res) {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const { rows } = await db.query(
      `${SELECT_WITH_DEPT_AND_GRADE}
       WHERE jr.id = $1 AND jr.company_id = $2`,
      [id, companyId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Job role not found." });
    }

    return res.status(200).json(serialize(rows[0]));
  } catch (err) {
    console.error("getJobRole error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/job-roles/:id
// ══════════════════════════════════════════════════════════════
export async function updateJobRole(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { id } = req.params;
  const { companyId } = req.user;
  const {
    title,
    departmentId,
    gradeId, // Now updating the relationship ID
    description,
    isActive,
  } = req.body;

  try {
    // 1. Department verify
    if (departmentId !== undefined && departmentId !== null) {
      const deptCheck = await db.query(
        `SELECT id FROM departments WHERE id = $1 AND company_id = $2`,
        [departmentId, companyId],
      );
      if (deptCheck.rowCount === 0) {
        return res.status(404).json({ message: "Department not found." });
      }
    }

    // 2. Update with COALESCE pattern
    const { rows } = await db.query(
      `UPDATE job_roles
       SET
         title         = COALESCE($1,  title),
         department_id = COALESCE($2,  department_id),
         grade_id      = COALESCE($3,  grade_id),
         description   = COALESCE($4,  description),
         is_active     = COALESCE($5,  is_active),
         updated_at    = NOW()
       WHERE id = $6 AND company_id = $7
       RETURNING id`,
      [
        title !== undefined ? title : null,
        departmentId !== undefined ? departmentId : null,
        gradeId !== undefined ? gradeId : null,
        description !== undefined ? description : null,
        isActive !== undefined ? Boolean(isActive) : null,
        id,
        companyId,
      ],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Job role not found." });
    }

    // 3. Return full updated record
    const full = await db.query(
      `${SELECT_WITH_DEPT_AND_GRADE} WHERE jr.id = $1 AND jr.company_id = $2`,
      [id, companyId],
    );

    return res.status(200).json({
      message: "Job role updated.",
      role: serialize(full.rows[0]),
    });
  } catch (err) {
    console.error("updateJobRole error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// DELETE /api/job-roles/:id
// ══════════════════════════════════════════════════════════════
export async function deleteJobRole(req, res) {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const { rows } = await db.query(
      `UPDATE job_roles
       SET is_active = false, updated_at = NOW()
       WHERE id = $1 AND company_id = $2
       RETURNING id, title, is_active`,
      [id, companyId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Job role not found." });
    }

    return res.status(200).json({
      message: `Job role "${rows[0].title}" deactivated.`,
      id: rows[0].id,
      isActive: rows[0].is_active,
    });
  } catch (err) {
    console.error("deleteJobRole error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}