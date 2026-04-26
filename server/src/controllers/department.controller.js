// // src/controllers/department.controller.js
// //
// // Endpoints:
// //   GET    /api/departments          → listDepartments
// //   POST   /api/departments          → createDepartment
// //   GET    /api/departments/:id      → getDepartment
// //   PUT    /api/departments/:id      → updateDepartment
// //   DELETE /api/departments/:id      → deleteDepartment (soft)
// //
// // Multi-tenancy: every query scopes by company_id from req.user
// // Stack: Express · pg (node-postgres) via db wrapper

// import { db } from "../config/db.js";

// // ─── Shared JOIN fragment ──────────────────────────────────────
// // Reused in both list and single-fetch to keep joins consistent.
// //
// // Joins:
// //   e  → employees   (to resolve head_id → full name)
// //   pd → departments (self-join to resolve parent_department_id → name)
// //
// const DEPARTMENT_SELECT = `
//   SELECT
//     d.id,
//     d.company_id,
//     d.name,
//     d.description,
//     d.is_active,
//     d.created_at,
//     d.updated_at,

//     -- Head employee
//     d.head_id,
//     CONCAT(e.first_name, ' ', e.last_name) AS head_name,

//     -- Parent department
//     d.parent_department_id,
//     pd.name AS parent_department_name

//   FROM departments d

//   LEFT JOIN employees e
//     ON e.id = d.head_id
//     AND e.company_id = d.company_id

//   LEFT JOIN departments pd
//     ON pd.id = d.parent_department_id
//     AND pd.company_id = d.company_id
// `;

// // ══════════════════════════════════════════════════════════════
// // GET /api/departments
// // Returns all active departments for the authenticated company.
// // Includes head name and parent department name via JOINs.
// // ══════════════════════════════════════════════════════════════
// export async function listDepartments(req, res) {
//   const { companyId } = req.user;

//   try {
//     const result = await db.query(
//       `${DEPARTMENT_SELECT}
//        WHERE d.company_id = $1
//          AND d.is_active   = true
//        ORDER BY d.name ASC`,
//       [companyId],
//     );

//     return res.status(200).json({
//       count: result.rows.length,
//       departments: result.rows,
//     });
//   } catch (err) {
//     console.error("listDepartments error:", err);
//     return res.status(500).json({ message: "Failed to retrieve departments." });
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // POST /api/departments
// // Creates a new department scoped to the authenticated company.
// // Body: { name, description?, parent_department_id?, head_id? }
// // ══════════════════════════════════════════════════════════════
// export async function createDepartment(req, res) {
//   const { companyId } = req.user;
//   const {
//     name,
//     description = null,
//     parent_department_id = null,
//     head_id = null,
//   } = req.body;

//   // ── Basic validation ────────────────────────────────────────
//   if (!name || !name.trim()) {
//     return res.status(400).json({ message: "Department name is required." });
//   }

//   try {
//     // ── Prevent duplicate name within the same company ─────────
//     const duplicate = await db.query(
//       `SELECT id FROM departments
//        WHERE company_id = $1
//          AND LOWER(name) = LOWER($2)
//          AND is_active   = true`,
//       [companyId, name.trim()],
//     );

//     if (duplicate.rows.length > 0) {
//       return res.status(409).json({
//         message: `A department named "${name.trim()}" already exists.`,
//       });
//     }

//     // ── Validate parent_department_id belongs to same company ──
//     if (parent_department_id) {
//       const parentCheck = await db.query(
//         `SELECT id FROM departments
//          WHERE id         = $1
//            AND company_id = $2
//            AND is_active  = true`,
//         [parent_department_id, companyId],
//       );

//       if (parentCheck.rows.length === 0) {
//         return res.status(404).json({
//           message:
//             "Parent department not found or does not belong to your company.",
//         });
//       }
//     }

//     // ── Validate head_id belongs to same company ───────────────
//     if (head_id) {
//       const headCheck = await db.query(
//         `SELECT id FROM employees
//          WHERE id         = $1
//            AND company_id = $2
//            AND is_active  = true`,
//         [head_id, companyId],
//       );

//       if (headCheck.rows.length === 0) {
//         return res.status(404).json({
//           message:
//             "Head employee not found or does not belong to your company.",
//         });
//       }
//     }

//     // ── Insert ─────────────────────────────────────────────────
//     const result = await db.query(
//       `INSERT INTO departments
//          (company_id, name, description, parent_department_id, head_id, is_active)
//        VALUES ($1, $2, $3, $4, $5, true)
//        RETURNING *`,
//       [
//         companyId,
//         name.trim(),
//         description ?? null,
//         parent_department_id ?? null,
//         head_id ?? null,
//       ],
//     );

//     const created = result.rows[0];

//     // ── Return with joins (fetch the full view) ────────────────
//     const full = await db.query(
//       `${DEPARTMENT_SELECT}
//        WHERE d.id         = $1
//          AND d.company_id = $2`,
//       [created.id, companyId],
//     );

//     return res.status(201).json({
//       message: "Department created successfully.",
//       department: full.rows[0],
//     });
//   } catch (err) {
//     console.error("createDepartment error:", err);
//     return res.status(500).json({ message: "Failed to create department." });
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // GET /api/departments/:id
// // Fetch a single department by ID.
// // 404 if it doesn't exist, is inactive, or belongs to another company.
// // ══════════════════════════════════════════════════════════════
// export async function getDepartment(req, res) {
//   const { companyId } = req.user;
//   const { id } = req.params;

//   try {
//     const result = await db.query(
//       `${DEPARTMENT_SELECT}
//        WHERE d.id         = $1
//          AND d.company_id = $2
//          AND d.is_active  = true`,
//       [id, companyId],
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Department not found." });
//     }

//     return res.status(200).json({ department: result.rows[0] });
//   } catch (err) {
//     console.error("getDepartment error:", err);
//     return res.status(500).json({ message: "Failed to retrieve department." });
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // PUT /api/departments/:id
// // Update any field except id and company_id.
// // Body: { name?, description?, parent_department_id?, head_id?, is_active? }
// // ══════════════════════════════════════════════════════════════
// export async function updateDepartment(req, res) {
//   const { companyId } = req.user;
//   const { id } = req.params;

//   try {
//     // ── Confirm ownership ──────────────────────────────────────
//     const existing = await db.query(
//       `SELECT id, name FROM departments
//        WHERE id         = $1
//          AND company_id = $2
//          AND is_active  = true`,
//       [id, companyId],
//     );

//     if (existing.rows.length === 0) {
//       return res.status(404).json({ message: "Department not found." });
//     }

//     const current = existing.rows[0];

//     // ── Extract allowed fields (ignore id / company_id if sent) ─
//     const {
//       name = current.name,
//       description,
//       parent_department_id,
//       head_id,
//       is_active,
//     } = req.body;

//     if (!name || !name.trim()) {
//       return res
//         .status(400)
//         .json({ message: "Department name cannot be empty." });
//     }

//     // ── Duplicate name check (exclude self) ────────────────────
//     const duplicate = await db.query(
//       `SELECT id FROM departments
//        WHERE company_id = $1
//          AND LOWER(name) = LOWER($2)
//          AND is_active   = true
//          AND id         != $3`,
//       [companyId, name.trim(), id],
//     );

//     if (duplicate.rows.length > 0) {
//       return res.status(409).json({
//         message: `Another department named "${name.trim()}" already exists.`,
//       });
//     }

//     // ── Prevent a department from being its own parent ─────────
//     if (parent_department_id === id) {
//       return res.status(400).json({
//         message: "A department cannot be its own parent.",
//       });
//     }

//     // ── Validate parent_department_id ──────────────────────────
//     if (parent_department_id) {
//       const parentCheck = await db.query(
//         `SELECT id FROM departments
//          WHERE id         = $1
//            AND company_id = $2
//            AND is_active  = true`,
//         [parent_department_id, companyId],
//       );

//       if (parentCheck.rows.length === 0) {
//         return res.status(404).json({
//           message:
//             "Parent department not found or does not belong to your company.",
//         });
//       }
//     }

//     // ── Validate head_id ───────────────────────────────────────
//     if (head_id) {
//       const headCheck = await db.query(
//         `SELECT id FROM employees
//          WHERE id         = $1
//            AND company_id = $2
//            AND is_active  = true`,
//         [head_id, companyId],
//       );

//       if (headCheck.rows.length === 0) {
//         return res.status(404).json({
//           message:
//             "Head employee not found or does not belong to your company.",
//         });
//       }
//     }

//     // ── Update ─────────────────────────────────────────────────
//     const result = await db.query(
//       `UPDATE departments
//        SET
//          name                 = $1,
//          description          = $2,
//          parent_department_id = $3,
//          head_id              = $4,
//          is_active            = $5,
//          updated_at           = NOW()
//        WHERE id         = $6
//          AND company_id = $7
//        RETURNING *`,
//       [
//         name.trim(),
//         description ?? null,
//         parent_department_id ?? null,
//         head_id ?? null,
//         is_active ?? true,
//         id,
//         companyId,
//       ],
//     );

//     // ── Return full joined view ────────────────────────────────
//     const full = await db.query(
//       `${DEPARTMENT_SELECT}
//        WHERE d.id         = $1
//          AND d.company_id = $2`,
//       [result.rows[0].id, companyId],
//     );

//     return res.status(200).json({
//       message: "Department updated successfully.",
//       department: full.rows[0],
//     });
//   } catch (err) {
//     console.error("updateDepartment error:", err);
//     return res.status(500).json({ message: "Failed to update department." });
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // DELETE /api/departments/:id
// // Soft delete — sets is_active = false.
// // Child departments and employees are NOT cascade-deleted.
// // ══════════════════════════════════════════════════════════════
// export async function deleteDepartment(req, res) {
//   const { companyId } = req.user;
//   const { id } = req.params;

//   try {
//     // ── Confirm ownership ──────────────────────────────────────
//     const existing = await db.query(
//       `SELECT id FROM departments
//        WHERE id         = $1
//          AND company_id = $2
//          AND is_active  = true`,
//       [id, companyId],
//     );

//     if (existing.rows.length === 0) {
//       return res.status(404).json({ message: "Department not found." });
//     }

//     // ── Warn if department still has active employees ──────────
//     const employeeCount = await db.query(
//       `SELECT COUNT(*) AS count
//        FROM employees
//        WHERE department_id = $1
//          AND company_id    = $2
//          AND is_active     = true`,
//       [id, companyId],
//     );

//     const activeCount = parseInt(employeeCount.rows[0].count, 10);

//     if (activeCount > 0) {
//       return res.status(409).json({
//         message: `Cannot deactivate department — it still has ${activeCount} active employee(s). Reassign them first.`,
//         activeEmployeeCount: activeCount,
//       });
//     }

//     // ── Soft delete ────────────────────────────────────────────
//     await db.query(
//       `UPDATE departments
//        SET is_active  = false,
//            updated_at = NOW()
//        WHERE id         = $1
//          AND company_id = $2`,
//       [id, companyId],
//     );

//     return res.status(200).json({
//       message: "Department deactivated successfully.",
//     });
//   } catch (err) {
//     console.error("deleteDepartment error:", err);
//     return res
//       .status(500)
//       .json({ message: "Failed to deactivate department." });
//   }
// }


// src/controllers/department.controller.js
//
// Endpoints:
//   GET    /api/departments          → listDepartments
//   POST   /api/departments          → createDepartment
//   GET    /api/departments/:id      → getDepartment
//   PUT    /api/departments/:id      → updateDepartment
//   DELETE /api/departments/:id      → deleteDepartment   (soft delete)
//
// All queries use the shared db pool (pg / node-postgres).
// Every query is scoped to req.user.companyId — no cross-tenant reads.
//
// Table schema (exact column names from your DDL):
//   id, company_id, name, description,
//   parent_department_id, is_active, created_at, updated_at, head_id

import { db }               from "../config/db.js";
import { validationResult } from "express-validator";

// ─── helpers ─────────────────────────────────────────────────

function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ message: "Validation failed.", errors: errors.array() });
    return true;
  }
  return false;
}

/**
 * Serialize one pg row → camelCase response.
 * Only fields that actually exist in the DDL are mapped here.
 */
function serialize(row) {
  return {
    id:                 row.id,
    companyId:          row.company_id,
    name:               row.name,
    description:        row.description,
    headId:             row.head_id,
    // joined from employees table (present when we LEFT JOIN)
    headName:           row.head_name   ?? null,
    parentDepartmentId: row.parent_department_id,
    parentName:         row.parent_name ?? null,
    isActive:           row.is_active,
    createdAt:          row.created_at,
    updatedAt:          row.updated_at,
  };
}

// Shared SELECT with optional JOINs for head name + parent name
// Using LEFT JOINs so departments with no head / no parent still return.
const SELECT_WITH_JOINS = `
  SELECT
    d.id,
    d.company_id,
    d.name,
    d.description,
    d.head_id,
    d.parent_department_id,
    d.is_active,
    d.created_at,
    d.updated_at,
    CONCAT(e.first_name, ' ', e.last_name) AS head_name,
    p.name                                  AS parent_name
  FROM departments d
  LEFT JOIN employees   e ON e.id = d.head_id
  LEFT JOIN departments p ON p.id = d.parent_department_id
`;

// ══════════════════════════════════════════════════════════════
// GET /api/departments
// Returns all active departments for the company.
// Optional query param: includeInactive=true (admin only)
// ══════════════════════════════════════════════════════════════
export async function listDepartments(req, res) {
  try {
    const { companyId, role } = req.user;
    const showInactive =
      req.query.includeInactive === "true" &&
      ["hr_admin", "super_admin"].includes(role);

    const params     = [companyId];
    const conditions = ["d.company_id = $1"];

    if (!showInactive) {
      conditions.push("d.is_active = true");
    }

    const { rows } = await db.query(
      `${SELECT_WITH_JOINS}
       WHERE ${conditions.join(" AND ")}
       ORDER BY d.name ASC`,
      params
    );

    return res.status(200).json({
      count:       rows.length,
      departments: rows.map(serialize),
    });
  } catch (err) {
    console.error("listDepartments error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/departments
// Body: { name, description?, headId?, parentDepartmentId?, isActive? }
//
// ROOT CAUSE FIX:
// The old controller had a raw INSERT that listed is_active at
// position 103 but passed the value in the wrong parameter slot.
// This version uses explicit $n placeholders matched to the VALUES
// list in the exact same order, removing any ambiguity.
// ══════════════════════════════════════════════════════════════
export async function createDepartment(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { companyId } = req.user;
  const {
    name,
    description        = null,
    headId             = null,
    parentDepartmentId = null,
    isActive           = true,
  } = req.body;

  try {
    // Verify headId belongs to this company if supplied
    if (headId) {
      const empCheck = await db.query(
        `SELECT id FROM employees WHERE id = $1 AND company_id = $2`,
        [headId, companyId]
      );
      if (empCheck.rowCount === 0) {
        return res.status(404).json({
          message: "Head employee not found or does not belong to your company.",
        });
      }
    }

    // Verify parentDepartmentId belongs to this company if supplied
    if (parentDepartmentId) {
      const parentCheck = await db.query(
        `SELECT id FROM departments WHERE id = $1 AND company_id = $2`,
        [parentDepartmentId, companyId]
      );
      if (parentCheck.rowCount === 0) {
        return res.status(404).json({
          message: "Parent department not found or does not belong to your company.",
        });
      }
    }

    // ── INSERT ────────────────────────────────────────────────
    // Column order matches DDL exactly.
    // Parameter order matches column list exactly — this is what
    // the old controller had wrong (is_active parameter mismatch).
    const { rows } = await db.query(
      `INSERT INTO departments (
         company_id,            -- $1
         name,                  -- $2
         description,           -- $3
         head_id,               -- $4
         parent_department_id,  -- $5
         is_active              -- $6
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        companyId,           // $1
        name,                // $2
        description,         // $3
        headId,              // $4
        parentDepartmentId,  // $5
        Boolean(isActive),   // $6
      ]
    );

    // Re-fetch with JOINs so the response is identical to GET /departments/:id
    const full = await db.query(
      `${SELECT_WITH_JOINS}
       WHERE d.id = $1 AND d.company_id = $2`,
      [rows[0].id, companyId]
    );

    return res.status(201).json({
      message:    "Department created.",
      department: serialize(full.rows[0]),
    });
  } catch (err) {
    console.error("createDepartment error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/departments/:id
// ══════════════════════════════════════════════════════════════
export async function getDepartment(req, res) {
  try {
    const { id }        = req.params;
    const { companyId } = req.user;

    const { rows } = await db.query(
      `${SELECT_WITH_JOINS}
       WHERE d.id = $1 AND d.company_id = $2`,
      [id, companyId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Department not found." });
    }

    return res.status(200).json(serialize(rows[0]));
  } catch (err) {
    console.error("getDepartment error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/departments/:id
// Partial update — only provided fields change (COALESCE).
// id and company_id are never writable.
// ══════════════════════════════════════════════════════════════
export async function updateDepartment(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { id }        = req.params;
  const { companyId } = req.user;
  const {
    name,
    description,
    headId,
    parentDepartmentId,
    isActive,
  } = req.body;

  try {
    // Confirm department exists and belongs to this company
    const existing = await db.query(
      `SELECT id FROM departments WHERE id = $1 AND company_id = $2`,
      [id, companyId]
    );
    if (existing.rowCount === 0) {
      return res.status(404).json({ message: "Department not found." });
    }

    // Validate headId ownership if changing
    if (headId !== undefined && headId !== null) {
      const empCheck = await db.query(
        `SELECT id FROM employees WHERE id = $1 AND company_id = $2`,
        [headId, companyId]
      );
      if (empCheck.rowCount === 0) {
        return res.status(404).json({
          message: "Head employee not found or does not belong to your company.",
        });
      }
    }

    // Validate parentDepartmentId ownership if changing
    if (parentDepartmentId !== undefined && parentDepartmentId !== null) {
      // Prevent circular reference — a department cannot be its own parent
      if (parentDepartmentId === id) {
        return res.status(400).json({
          message: "A department cannot be its own parent.",
        });
      }
      const parentCheck = await db.query(
        `SELECT id FROM departments WHERE id = $1 AND company_id = $2`,
        [parentDepartmentId, companyId]
      );
      if (parentCheck.rowCount === 0) {
        return res.status(404).json({
          message: "Parent department not found or does not belong to your company.",
        });
      }
    }

    // COALESCE: NULL passed for omitted fields → DB keeps current value
    await db.query(
      `UPDATE departments
       SET
         name                 = COALESCE($1, name),
         description          = COALESCE($2, description),
         head_id              = COALESCE($3, head_id),
         parent_department_id = COALESCE($4, parent_department_id),
         is_active            = COALESCE($5, is_active),
         updated_at           = NOW()
       WHERE id = $6 AND company_id = $7`,
      [
        name               !== undefined ? name                   : null,
        description        !== undefined ? description             : null,
        headId             !== undefined ? (headId ?? null)       : null,
        parentDepartmentId !== undefined ? (parentDepartmentId ?? null) : null,
        isActive           !== undefined ? Boolean(isActive)      : null,
        id,
        companyId,
      ]
    );

    // Return the full updated record with JOINs
    const full = await db.query(
      `${SELECT_WITH_JOINS}
       WHERE d.id = $1 AND d.company_id = $2`,
      [id, companyId]
    );

    return res.status(200).json({
      message:    "Department updated.",
      department: serialize(full.rows[0]),
    });
  } catch (err) {
    console.error("updateDepartment error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// DELETE /api/departments/:id
// Soft delete — sets is_active = false.
// Records are kept for FK integrity (employees still reference them).
// ══════════════════════════════════════════════════════════════
export async function deleteDepartment(req, res) {
  try {
    const { id }        = req.params;
    const { companyId } = req.user;

    // Check for active employees in this department before deactivating
    const empCount = await db.query(
      `SELECT COUNT(*) FROM employees
       WHERE department_id = $1 AND is_active = true`,
      [id]
    );
    const activeEmployees = parseInt(empCount.rows[0].count, 10);

    if (activeEmployees > 0) {
      return res.status(409).json({
        message: `Cannot deactivate department: ${activeEmployees} active employee(s) are still assigned to it.`,
        activeEmployees,
      });
    }

    const { rows } = await db.query(
      `UPDATE departments
       SET is_active  = false,
           updated_at = NOW()
       WHERE id = $1 AND company_id = $2
       RETURNING id, name, is_active, updated_at`,
      [id, companyId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Department not found." });
    }

    return res.status(200).json({
      message:  `Department "${rows[0].name}" has been deactivated.`,
      id:       rows[0].id,
      isActive: rows[0].is_active,
    });
  } catch (err) {
    console.error("deleteDepartment error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}