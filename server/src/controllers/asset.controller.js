// // src/controllers/asset.controller.js
// //
// // Endpoints:
// //   GET    /api/assets                    → listAssets
// //   POST   /api/assets                    → createAsset
// //   GET    /api/assets/:id                → getAsset
// //   PUT    /api/assets/:id                → updateAsset
// //   DELETE /api/assets/:id                → retireAsset      (soft delete)
// //   POST   /api/assets/:id/assign         → assignAsset
// //   POST   /api/assets/:id/return         → returnAsset      (manual return,
// //                                                              outside offboarding)
// //   GET    /api/assets/:id/history        → getAssetHistory
// //
// // Stack: Express · pg (raw) · express-validator
// // Every query is scoped to req.user.companyId — no cross-tenant reads.
// //
// // NOTE: The offboarding-driven return flow (return during an employee's
// // exit checklist) lives in offboarding.controller.js, since it also has
// // to flip the linked offboarding_tasks row. This file covers assets as
// // a standalone resource — creating, assigning, and ad-hoc returns.

// import { db } from "../config/db.js";
// import { validationResult } from "express-validator";

// const VALID_STATUSES = [
//   "available",
//   "assigned",
//   "under_repair",
//   "retired",
//   "lost",
// ];
// const VALID_CONDITIONS = ["good", "fair", "damaged", "lost"];
// const VALID_CATEGORIES = [
//   "laptop",
//   "phone",
//   "monitor",
//   "access_card",
//   "vehicle",
//   "furniture",
//   "other",
// ];

// // ─── Internal helpers ──────────────────────────────────────────

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

// /** Generate the next asset tag for a company. Format: AST-0001, AST-0042, … */
// async function generateAssetTag(client, companyId) {
//   const result = await client.query(
//     `SELECT asset_tag
//      FROM assets
//      WHERE company_id = $1
//        AND asset_tag ~ '^AST-[0-9]+$'
//      ORDER BY CAST(SUBSTRING(asset_tag FROM 5) AS INTEGER) DESC
//      LIMIT 1`,
//     [companyId],
//   );

//   const last = result.rows[0]?.asset_tag;
//   const next = last ? parseInt(last.replace("AST-", ""), 10) + 1 : 1;
//   return `AST-${String(next).padStart(4, "0")}`;
// }

// function serializeAsset(row) {
//   return {
//     id: row.id,
//     companyId: row.company_id,
//     assetTag: row.asset_tag,
//     name: row.name,
//     category: row.category,
//     brand: row.brand,
//     model: row.model,
//     serialNumber: row.serial_number,
//     status: row.status,
//     condition: row.condition,
//     purchaseDate: row.purchase_date,
//     purchaseCost: row.purchase_cost,
//     warrantyExpiry: row.warranty_expiry,
//     location: row.location,
//     notes: row.notes,
//     isActive: row.is_active,
//     createdAt: row.created_at,
//     updatedAt: row.updated_at,
//     // Present only when the query joins the active assignment
//     assignedTo: row.employee_id
//       ? {
//           employeeId: row.employee_id,
//           name: `${row.emp_first_name ?? ""} ${row.emp_last_name ?? ""}`.trim(),
//           employeeCode: row.employee_code,
//           assignmentId: row.assignment_id,
//           assignedDate: row.assigned_date,
//           expectedReturnDate: row.expected_return_date,
//         }
//       : undefined,
//   };
// }

// function serializeAssignment(row) {
//   return {
//     id: row.id,
//     assetId: row.asset_id,
//     employeeId: row.employee_id,
//     employeeName: row.emp_first_name
//       ? `${row.emp_first_name} ${row.emp_last_name}`.trim()
//       : undefined,
//     employeeCode: row.employee_code,
//     assignedDate: row.assigned_date,
//     assignedBy: row.assigned_by,
//     assignedCondition: row.assigned_condition,
//     expectedReturnDate: row.expected_return_date,
//     notes: row.notes,
//     returnedDate: row.returned_date,
//     returnedCondition: row.returned_condition,
//     returnNotes: row.return_notes,
//     returnedBy: row.returned_by,
//     status: row.status,
//     createdAt: row.created_at,
//     updatedAt: row.updated_at,
//   };
// }

// // ══════════════════════════════════════════════════════════════
// // GET /api/assets
// // Query params:
// //   page, limit (default 1 / 20, max 100)
// //   search       — matches name, asset_tag, serial_number
// //   status       — available | assigned | under_repair | retired | lost
// //   category     — laptop | phone | monitor | access_card | vehicle | furniture | other
// //   employeeId   — filter to assets currently assigned to this employee
// // Requires: authenticate + requireRole(["hr_admin","super_admin"])
// // ══════════════════════════════════════════════════════════════
// export async function listAssets(req, res) {
//   try {
//     const { companyId } = req.user;

//     const page = Math.max(1, parseInt(req.query.page ?? 1, 10));
//     const limit = Math.min(
//       100,
//       Math.max(1, parseInt(req.query.limit ?? 20, 10)),
//     );
//     const offset = (page - 1) * limit;

//     const { search, status, category, employeeId } = req.query;

//     const conditions = ["a.company_id = $1"];
//     const values = [companyId];
//     let idx = 2;

//     if (search) {
//       conditions.push(
//         `(a.name ILIKE $${idx} OR a.asset_tag ILIKE $${idx} OR a.serial_number ILIKE $${idx})`,
//       );
//       values.push(`%${search}%`);
//       idx++;
//     }
//     if (status) {
//       conditions.push(`a.status = $${idx}`);
//       values.push(status);
//       idx++;
//     }
//     if (category) {
//       conditions.push(`a.category = $${idx}`);
//       values.push(category);
//       idx++;
//     }
//     if (employeeId) {
//       // Only assets with a currently ACTIVE assignment to this employee
//       conditions.push(
//         `EXISTS (
//            SELECT 1 FROM asset_assignments aa
//            WHERE aa.asset_id = a.id AND aa.employee_id = $${idx} AND aa.status = 'assigned'
//          )`,
//       );
//       values.push(employeeId);
//       idx++;
//     }

//     const whereClause = conditions.join(" AND ");

//     const countResult = await db.query(
//       `SELECT COUNT(*) AS total FROM assets a WHERE ${whereClause}`,
//       values,
//     );
//     const total = parseInt(countResult.rows[0].total, 10);

//     const dataResult = await db.query(
//       `SELECT
//          a.*,
//          aa.id            AS assignment_id,
//          aa.assigned_date,
//          aa.expected_return_date,
//          e.id             AS employee_id,
//          e.employee_code,
//          e.first_name     AS emp_first_name,
//          e.last_name      AS emp_last_name
//        FROM assets a
//        LEFT JOIN asset_assignments aa
//               ON aa.asset_id = a.id AND aa.status = 'assigned'
//        LEFT JOIN employees e ON e.id = aa.employee_id
//        WHERE ${whereClause}
//        ORDER BY a.created_at DESC
//        LIMIT $${idx} OFFSET $${idx + 1}`,
//       [...values, limit, offset],
//     );

//     return res.status(200).json({
//       data: dataResult.rows.map(serializeAsset),
//       meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
//     });
//   } catch (err) {
//     console.error("listAssets error:", err);
//     return res.status(500).json({ message: "Server error fetching assets." });
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // POST /api/assets
// // Requires: authenticate + requireRole(["hr_admin","super_admin"])
// // ══════════════════════════════════════════════════════════════
// export async function createAsset(req, res) {
//   if (handleValidationErrors(req, res)) return;

//   const { companyId } = req.user;
//   const {
//     name,
//     category = "other",
//     brand = null,
//     model = null,
//     serialNumber = null,
//     condition = "good",
//     purchaseDate = null,
//     purchaseCost = null,
//     warrantyExpiry = null,
//     location = null,
//     notes = null,
//   } = req.body;

//   if (!VALID_CATEGORIES.includes(category)) {
//     return res.status(400).json({
//       message: `category must be one of: ${VALID_CATEGORIES.join(", ")}.`,
//     });
//   }
//   if (!VALID_CONDITIONS.includes(condition)) {
//     return res.status(400).json({
//       message: `condition must be one of: ${VALID_CONDITIONS.join(", ")}.`,
//     });
//   }

//   const client = await db.getClient();
//   try {
//     await client.query("BEGIN");

//     const assetTag = await generateAssetTag(client, companyId);

//     const result = await client.query(
//       `INSERT INTO assets (
//          company_id, asset_tag, name, category, brand, model, serial_number,
//          status, condition, purchase_date, purchase_cost, warranty_expiry,
//          location, notes, is_active, created_at
//        )
//        VALUES ($1,$2,$3,$4,$5,$6,$7,'available',$8,$9,$10,$11,$12,$13,true,NOW())
//        RETURNING *`,
//       [
//         companyId,
//         assetTag,
//         name,
//         category,
//         brand,
//         model,
//         serialNumber,
//         condition,
//         purchaseDate,
//         purchaseCost,
//         warrantyExpiry,
//         location,
//         notes,
//       ],
//     );

//     await client.query("COMMIT");

//     return res.status(201).json({
//       message: `Asset ${assetTag} created.`,
//       data: serializeAsset(result.rows[0]),
//     });
//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error("createAsset error:", err);
//     return res.status(500).json({ message: "Server error creating asset." });
//   } finally {
//     client.release();
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // GET /api/assets/:id
// // Returns the asset plus its current assignee (if any).
// // Requires: authenticate + requireRole(["hr_admin","super_admin"])
// // ══════════════════════════════════════════════════════════════
// export async function getAsset(req, res) {
//   try {
//     const { id } = req.params;
//     const { companyId } = req.user;

//     const result = await db.query(
//       `SELECT
//          a.*,
//          aa.id            AS assignment_id,
//          aa.assigned_date,
//          aa.expected_return_date,
//          e.id             AS employee_id,
//          e.employee_code,
//          e.first_name     AS emp_first_name,
//          e.last_name      AS emp_last_name
//        FROM assets a
//        LEFT JOIN asset_assignments aa
//               ON aa.asset_id = a.id AND aa.status = 'assigned'
//        LEFT JOIN employees e ON e.id = aa.employee_id
//        WHERE a.id = $1 AND a.company_id = $2`,
//       [id, companyId],
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Asset not found." });
//     }

//     return res.status(200).json({ data: serializeAsset(result.rows[0]) });
//   } catch (err) {
//     console.error("getAsset error:", err);
//     return res.status(500).json({ message: "Server error fetching asset." });
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // PUT /api/assets/:id
// // Partial update. Cannot directly set status to "assigned" or
// // "available" here — that only happens via /assign and /return,
// // which keep asset_assignments in sync. HR *can* set under_repair,
// // retired, or lost directly (e.g. asset broke while sitting in storage).
// // Requires: authenticate + requireRole(["hr_admin","super_admin"])
// // ══════════════════════════════════════════════════════════════
// export async function updateAsset(req, res) {
//   if (handleValidationErrors(req, res)) return;

//   const { id } = req.params;
//   const { companyId } = req.user;

//   const allowed = [
//     "name",
//     "category",
//     "brand",
//     "model",
//     "serialNumber",
//     "condition",
//     "purchaseDate",
//     "purchaseCost",
//     "warrantyExpiry",
//     "location",
//     "notes",
//     "status", // restricted below
//   ];

//   const columnMap = {
//     name: "name",
//     category: "category",
//     brand: "brand",
//     model: "model",
//     serialNumber: "serial_number",
//     condition: "condition",
//     purchaseDate: "purchase_date",
//     purchaseCost: "purchase_cost",
//     warrantyExpiry: "warranty_expiry",
//     location: "location",
//     notes: "notes",
//     status: "status",
//   };

//   if (req.body.status !== undefined) {
//     if (["assigned", "available"].includes(req.body.status)) {
//       return res.status(400).json({
//         message:
//           "status cannot be set directly to 'assigned' or 'available' — use /assign and /return instead.",
//       });
//     }
//     if (!VALID_STATUSES.includes(req.body.status)) {
//       return res.status(400).json({
//         message: `status must be one of: ${VALID_STATUSES.join(", ")}.`,
//       });
//     }
//   }
//   if (
//     req.body.category !== undefined &&
//     !VALID_CATEGORIES.includes(req.body.category)
//   ) {
//     return res.status(400).json({
//       message: `category must be one of: ${VALID_CATEGORIES.join(", ")}.`,
//     });
//   }
//   if (
//     req.body.condition !== undefined &&
//     !VALID_CONDITIONS.includes(req.body.condition)
//   ) {
//     return res.status(400).json({
//       message: `condition must be one of: ${VALID_CONDITIONS.join(", ")}.`,
//     });
//   }

//   const setClauses = [];
//   const values = [];
//   let idx = 1;

//   for (const key of allowed) {
//     if (req.body[key] === undefined) continue;
//     setClauses.push(`${columnMap[key]} = $${idx}`);
//     values.push(req.body[key]);
//     idx++;
//   }

//   if (setClauses.length === 0) {
//     return res
//       .status(400)
//       .json({ message: "No valid fields provided for update." });
//   }

//   try {
//     // Guard: asset must belong to this company and not be currently assigned
//     // if the update tries to move it to under_repair / retired / lost.
//     const existing = await db.query(
//       `SELECT id, status FROM assets WHERE id = $1 AND company_id = $2`,
//       [id, companyId],
//     );
//     if (existing.rows.length === 0) {
//       return res.status(404).json({ message: "Asset not found." });
//     }
//     if (
//       existing.rows[0].status === "assigned" &&
//       req.body.status !== undefined &&
//       ["under_repair", "retired", "lost"].includes(req.body.status)
//     ) {
//       return res.status(409).json({
//         message:
//           "This asset is currently assigned to an employee. Return it first before changing its status.",
//       });
//     }

//     const result = await db.query(
//       `UPDATE assets
//        SET ${setClauses.join(", ")}, updated_at = NOW()
//        WHERE id = $${idx} AND company_id = $${idx + 1}
//        RETURNING *`,
//       [...values, id, companyId],
//     );

//     return res.status(200).json({
//       message: "Asset updated.",
//       data: serializeAsset(result.rows[0]),
//     });
//   } catch (err) {
//     console.error("updateAsset error:", err);
//     return res.status(500).json({ message: "Server error updating asset." });
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // DELETE /api/assets/:id
// // Soft delete — sets status = 'retired', is_active = false.
// // Blocked if the asset is currently assigned.
// // Requires: authenticate + requireRole(["hr_admin","super_admin"])
// // ══════════════════════════════════════════════════════════════
// export async function retireAsset(req, res) {
//   try {
//     const { id } = req.params;
//     const { companyId } = req.user;

//     const existing = await db.query(
//       `SELECT id, status, name FROM assets WHERE id = $1 AND company_id = $2`,
//       [id, companyId],
//     );
//     if (existing.rows.length === 0) {
//       return res.status(404).json({ message: "Asset not found." });
//     }
//     if (existing.rows[0].status === "assigned") {
//       return res.status(409).json({
//         message:
//           "Cannot retire an asset that is currently assigned. Return it first.",
//       });
//     }

//     const result = await db.query(
//       `UPDATE assets
//        SET status = 'retired', is_active = false, updated_at = NOW()
//        WHERE id = $1 AND company_id = $2
//        RETURNING id, name, status, is_active, updated_at`,
//       [id, companyId],
//     );

//     return res.status(200).json({
//       message: `Asset "${result.rows[0].name}" has been retired.`,
//       data: result.rows[0],
//     });
//   } catch (err) {
//     console.error("retireAsset error:", err);
//     return res.status(500).json({ message: "Server error retiring asset." });
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // POST /api/assets/:id/assign
// // Body: { employeeId, expectedReturnDate?, condition?, notes? }
// // Requires: authenticate + requireRole(["hr_admin","super_admin"])
// // ══════════════════════════════════════════════════════════════
// export async function assignAsset(req, res) {
//   if (handleValidationErrors(req, res)) return;

//   const { id } = req.params; // asset id
//   const { companyId, userId } = req.user;
//   const {
//     employeeId,
//     expectedReturnDate = null,
//     condition = "good",
//     notes = null,
//   } = req.body;

//   if (!employeeId) {
//     return res.status(400).json({ message: "employeeId is required." });
//   }
//   if (!VALID_CONDITIONS.includes(condition)) {
//     return res.status(400).json({
//       message: `condition must be one of: ${VALID_CONDITIONS.join(", ")}.`,
//     });
//   }

//   const client = await db.getClient();
//   try {
//     await client.query("BEGIN");

//     // ── Guard: asset must exist, belong to company, and be available ──
//     const assetResult = await client.query(
//       `SELECT id, name, status FROM assets
//        WHERE id = $1 AND company_id = $2
//        FOR UPDATE`,
//       [id, companyId],
//     );
//     if (assetResult.rows.length === 0) {
//       await client.query("ROLLBACK");
//       return res.status(404).json({ message: "Asset not found." });
//     }
//     const asset = assetResult.rows[0];
//     if (asset.status !== "available") {
//       await client.query("ROLLBACK");
//       return res.status(409).json({
//         message: `Asset is currently "${asset.status}" and cannot be assigned.`,
//       });
//     }

//     // ── Guard: employee must exist, belong to company, be active ──
//     const empResult = await client.query(
//       `SELECT id, first_name, last_name FROM employees
//        WHERE id = $1 AND company_id = $2
//          AND employment_status NOT IN ('terminated','resigned','retired')`,
//       [employeeId, companyId],
//     );
//     if (empResult.rows.length === 0) {
//       await client.query("ROLLBACK");
//       return res.status(404).json({
//         message: "Employee not found, or is not currently active.",
//       });
//     }
//     const emp = empResult.rows[0];

//     // ── Create assignment ──
//     const assignmentResult = await client.query(
//       `INSERT INTO asset_assignments (
//          company_id, asset_id, employee_id, assigned_date, assigned_by,
//          assigned_condition, expected_return_date, notes, status, created_at
//        )
//        VALUES ($1,$2,$3, CURRENT_DATE, $4, $5, $6, $7, 'assigned', NOW())
//        RETURNING *`,
//       [companyId, id, employeeId, userId, condition, expectedReturnDate, notes],
//     );

//     // ── Update asset ──
//     await client.query(
//       `UPDATE assets
//        SET status = 'assigned', condition = $1, updated_at = NOW()
//        WHERE id = $2`,
//       [condition, id],
//     );

//     await client.query("COMMIT");

//     return res.status(201).json({
//       message: `${asset.name} assigned to ${emp.first_name} ${emp.last_name}.`,
//       data: serializeAssignment(assignmentResult.rows[0]),
//     });
//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error("assignAsset error:", err);
//     return res.status(500).json({ message: "Server error assigning asset." });
//   } finally {
//     client.release();
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // POST /api/assets/:id/return
// // Manual/ad-hoc return — NOT during offboarding (that flow is in
// // offboarding.controller.js and also closes the checklist task).
// // Body: { condition, notes? }
// // Requires: authenticate + requireRole(["hr_admin","super_admin"])
// // ══════════════════════════════════════════════════════════════
// export async function returnAsset(req, res) {
//   if (handleValidationErrors(req, res)) return;

//   const { id } = req.params; // asset id
//   const { companyId, userId } = req.user;
//   const { condition, notes = null } = req.body;

//   if (!condition || !VALID_CONDITIONS.includes(condition)) {
//     return res.status(400).json({
//       message: `condition is required and must be one of: ${VALID_CONDITIONS.join(", ")}.`,
//     });
//   }

//   const client = await db.getClient();
//   try {
//     await client.query("BEGIN");

//     const assetResult = await client.query(
//       `SELECT id, name FROM assets WHERE id = $1 AND company_id = $2 FOR UPDATE`,
//       [id, companyId],
//     );
//     if (assetResult.rows.length === 0) {
//       await client.query("ROLLBACK");
//       return res.status(404).json({ message: "Asset not found." });
//     }

//     const assignmentResult = await client.query(
//       `SELECT id FROM asset_assignments
//        WHERE asset_id = $1 AND company_id = $2 AND status = 'assigned'
//        FOR UPDATE`,
//       [id, companyId],
//     );
//     if (assignmentResult.rows.length === 0) {
//       await client.query("ROLLBACK");
//       return res
//         .status(409)
//         .json({ message: "This asset has no active assignment." });
//     }
//     const assignmentId = assignmentResult.rows[0].id;

//     const newAssignmentStatus =
//       condition === "lost"
//         ? "lost"
//         : condition === "damaged"
//           ? "damaged"
//           : "returned";
//     const newAssetStatus =
//       condition === "lost"
//         ? "lost"
//         : condition === "damaged"
//           ? "under_repair"
//           : "available";

//     const updatedAssignment = await client.query(
//       `UPDATE asset_assignments
//        SET returned_date = CURRENT_DATE,
//            returned_condition = $1,
//            return_notes = $2,
//            returned_by = $3,
//            status = $4,
//            updated_at = NOW()
//        WHERE id = $5
//        RETURNING *`,
//       [condition, notes, userId, newAssignmentStatus, assignmentId],
//     );

//     await client.query(
//       `UPDATE assets
//        SET status = $1, condition = $2, updated_at = NOW()
//        WHERE id = $3`,
//       [newAssetStatus, condition, id],
//     );

//     await client.query("COMMIT");

//     return res.status(200).json({
//       message: `${assetResult.rows[0].name} marked as returned (${condition}).`,
//       data: serializeAssignment(updatedAssignment.rows[0]),
//     });
//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error("returnAsset error:", err);
//     return res.status(500).json({ message: "Server error returning asset." });
//   } finally {
//     client.release();
//   }
// }

// // ══════════════════════════════════════════════════════════════
// // GET /api/assets/:id/history
// // Full assignment history for one asset (all employees who've had it).
// // Requires: authenticate + requireRole(["hr_admin","super_admin"])
// // ══════════════════════════════════════════════════════════════
// export async function getAssetHistory(req, res) {
//   try {
//     const { id } = req.params;
//     const { companyId } = req.user;

//     const assetCheck = await db.query(
//       `SELECT id, name, asset_tag FROM assets WHERE id = $1 AND company_id = $2`,
//       [id, companyId],
//     );
//     if (assetCheck.rows.length === 0) {
//       return res.status(404).json({ message: "Asset not found." });
//     }

//     const result = await db.query(
//       `SELECT
//          aa.*,
//          e.employee_code,
//          e.first_name AS emp_first_name,
//          e.last_name  AS emp_last_name
//        FROM asset_assignments aa
//        JOIN employees e ON e.id = aa.employee_id
//        WHERE aa.asset_id = $1 AND aa.company_id = $2
//        ORDER BY aa.assigned_date DESC`,
//       [id, companyId],
//     );

//     return res.status(200).json({
//       asset: assetCheck.rows[0],
//       data: result.rows.map(serializeAssignment),
//     });
//   } catch (err) {
//     console.error("getAssetHistory error:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error fetching asset history." });
//   }
// }



// src/controllers/asset.controller.js
import { db } from "../config/db.js";
import { validationResult } from "express-validator";

const VALID_STATUSES = [
  "available",
  "assigned",
  "under_repair",
  "retired",
  "lost",
];
const VALID_CONDITIONS = ["good", "fair", "damaged", "lost"];
const VALID_CATEGORIES = [
  "laptop",
  "phone",
  "monitor",
  "access_card",
  "vehicle",
  "furniture",
  "other",
];

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

async function generateAssetTag(client, companyId) {
  const result = await client.query(
    `SELECT asset_tag
     FROM assets
     WHERE company_id = $1
       AND asset_tag ~ '^AST-[0-9]+$'
     ORDER BY CAST(SUBSTRING(asset_tag FROM 5) AS INTEGER) DESC
     LIMIT 1`,
    [companyId],
  );

  const last = result.rows[0]?.asset_tag;
  const next = last ? parseInt(last.replace("AST-", ""), 10) + 1 : 1;
  return `AST-${String(next).padStart(4, "0")}`;
}

function serializeAsset(row) {
  return {
    id: row.id,
    companyId: row.company_id,
    assetTag: row.asset_tag,
    name: row.name,
    category: row.category,
    brand: row.brand,
    model: row.model,
    serialNumber: row.serial_number,
    status: row.status,
    condition: row.condition,
    purchaseDate: row.purchase_date,
    purchaseCost: row.purchase_cost,
    warrantyExpiry: row.warranty_expiry,
    location: row.location,
    notes: row.notes,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    assignedTo: row.employee_id
      ? {
          employeeId: row.employee_id,
          name: `${row.emp_first_name ?? ""} ${row.emp_last_name ?? ""}`.trim(),
          employeeCode: row.employee_code,
          assignmentId: row.assignment_id,
          assignedDate: row.assigned_date,
          expectedReturnDate: row.expected_return_date,
        }
      : undefined,
  };
}

function serializeAssignment(row) {
  return {
    id: row.id,
    assetId: row.asset_id,
    employeeId: row.employee_id,
    employeeName: row.emp_first_name
      ? `${row.emp_first_name} ${row.emp_last_name}`.trim()
      : undefined,
    employeeCode: row.employee_code,
    assignedDate: row.assigned_date,
    assignedBy: row.assigned_by,
    assignedCondition: row.assigned_condition,
    expectedReturnDate: row.expected_return_date,
    notes: row.notes,
    returnedDate: row.returned_date,
    returnedCondition: row.returned_condition,
    returnNotes: row.return_notes,
    returnedBy: row.returned_by,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ══════════════════════════════════════════════════════════════
// GET /api/assets
// ══════════════════════════════════════════════════════════════
export async function listAssets(req, res) {
  try {
    const { companyId } = req.user;

    const page = Math.max(1, parseInt(req.query.page ?? 1, 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit ?? 20, 10)),
    );
    const offset = (page - 1) * limit;

    const { search, status, category, employeeId } = req.query;

    const conditions = ["a.company_id = $1"];
    const values = [companyId];
    let idx = 2;

    if (search) {
      conditions.push(
        `(a.name ILIKE $${idx} OR a.asset_tag ILIKE $${idx} OR a.serial_number ILIKE $${idx})`,
      );
      values.push(`%${search}%`);
      idx++;
    }
    if (status) {
      conditions.push(`a.status = $${idx}`);
      values.push(status);
      idx++;
    }
    if (category) {
      conditions.push(`a.category = $${idx}`);
      values.push(category);
      idx++;
    }
    if (employeeId) {
      conditions.push(
        `EXISTS (
           SELECT 1 FROM asset_assignments aa
           WHERE aa.asset_id = a.id AND aa.employee_id = $${idx} AND aa.status = 'assigned'
         )`,
      );
      values.push(employeeId);
      idx++;
    }

    const whereClause = conditions.join(" AND ");

    const countResult = await db.query(
      `SELECT COUNT(*) AS total FROM assets a WHERE ${whereClause}`,
      values,
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const dataResult = await db.query(
      `SELECT
         a.*,
         aa.id            AS assignment_id,
         aa.assigned_date,
         aa.expected_return_date,
         e.id             AS employee_id,
         e.employee_code,
         e.first_name     AS emp_first_name,
         e.last_name      AS emp_last_name
       FROM assets a
       LEFT JOIN asset_assignments aa
              ON aa.asset_id = a.id AND aa.status = 'assigned'
       LEFT JOIN employees e ON e.id = aa.employee_id
       WHERE ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset],
    );

    return res.status(200).json({
      data: dataResult.rows.map(serializeAsset),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("listAssets error:", err);
    return res.status(500).json({ message: "Server error fetching assets." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/assets
// ══════════════════════════════════════════════════════════════
export async function createAsset(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { companyId } = req.user;
  const {
    name,
    category = "other",
    brand = null,
    model = null,
    serialNumber = null,
    condition = "good",
    purchaseDate = null,
    purchaseCost = null,
    warrantyExpiry = null,
    location = null,
    notes = null,
  } = req.body;

  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({
      message: `category must be one of: ${VALID_CATEGORIES.join(", ")}.`,
    });
  }
  if (!VALID_CONDITIONS.includes(condition)) {
    return res.status(400).json({
      message: `condition must be one of: ${VALID_CONDITIONS.join(", ")}.`,
    });
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const assetTag = await generateAssetTag(client, companyId);

    const result = await client.query(
      `INSERT INTO assets (
         company_id, asset_tag, name, category, brand, model, serial_number,
         status, condition, purchase_date, purchase_cost, warranty_expiry,
         location, notes, is_active, created_at
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,'available',$8,$9,$10,$11,$12,$13,true,NOW())
       RETURNING *`,
      [
        companyId,
        assetTag,
        name,
        category,
        brand,
        model,
        serialNumber,
        condition,
        purchaseDate,
        purchaseCost,
        warrantyExpiry,
        location,
        notes,
      ],
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: `Asset ${assetTag} created.`,
      data: serializeAsset(result.rows[0]),
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("createAsset error:", err);
    return res.status(500).json({ message: "Server error creating asset." });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/assets/:id
// ══════════════════════════════════════════════════════════════
export async function getAsset(req, res) {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const result = await db.query(
      `SELECT
         a.*,
         aa.id            AS assignment_id,
         aa.assigned_date,
         aa.expected_return_date,
         e.id             AS employee_id,
         e.employee_code,
         e.first_name     AS emp_first_name,
         e.last_name      AS emp_last_name
       FROM assets a
       LEFT JOIN asset_assignments aa
              ON aa.asset_id = a.id AND aa.status = 'assigned'
       LEFT JOIN employees e ON e.id = aa.employee_id
       WHERE a.id = $1 AND a.company_id = $2`,
      [id, companyId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Asset not found." });
    }

    return res.status(200).json({ data: serializeAsset(result.rows[0]) });
  } catch (err) {
    console.error("getAsset error:", err);
    return res.status(500).json({ message: "Server error fetching asset." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/assets/:id
// ══════════════════════════════════════════════════════════════
export async function updateAsset(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { id } = req.params;
  const { companyId } = req.user;

  const allowed = [
    "name",
    "category",
    "brand",
    "model",
    "serialNumber",
    "condition",
    "purchaseDate",
    "purchaseCost",
    "warrantyExpiry",
    "location",
    "notes",
    "status",
  ];

  const columnMap = {
    name: "name",
    category: "category",
    brand: "brand",
    model: "model",
    serialNumber: "serial_number",
    condition: "condition",
    purchaseDate: "purchase_date",
    purchaseCost: "purchase_cost",
    warrantyExpiry: "warranty_expiry",
    location: "location",
    notes: "notes",
    status: "status",
  };

  if (req.body.status !== undefined) {
    if (["assigned", "available"].includes(req.body.status)) {
      return res.status(400).json({
        message:
          "status cannot be set directly to 'assigned' or 'available' — use /assign and /return instead.",
      });
    }
    if (!VALID_STATUSES.includes(req.body.status)) {
      return res.status(400).json({
        message: `status must be one of: ${VALID_STATUSES.join(", ")}.`,
      });
    }
  }
  if (
    req.body.category !== undefined &&
    !VALID_CATEGORIES.includes(req.body.category)
  ) {
    return res.status(400).json({
      message: `category must be one of: ${VALID_CATEGORIES.join(", ")}.`,
    });
  }
  if (
    req.body.condition !== undefined &&
    !VALID_CONDITIONS.includes(req.body.condition)
  ) {
    return res.status(400).json({
      message: `condition must be one of: ${VALID_CONDITIONS.join(", ")}.`,
    });
  }

  const setClauses = [];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (req.body[key] === undefined) continue;
    setClauses.push(`${columnMap[key]} = $${idx}`);
    values.push(req.body[key]);
    idx++;
  }

  if (setClauses.length === 0) {
    return res
      .status(400)
      .json({ message: "No valid fields provided for update." });
  }

  try {
    const existing = await db.query(
      `SELECT id, status FROM assets WHERE id = $1 AND company_id = $2`,
      [id, companyId],
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Asset not found." });
    }
    if (
      existing.rows[0].status === "assigned" &&
      req.body.status !== undefined &&
      ["under_repair", "retired", "lost"].includes(req.body.status)
    ) {
      return res.status(409).json({
        message:
          "This asset is currently assigned to an employee. Return it first before changing its status.",
      });
    }

    const result = await db.query(
      `UPDATE assets
       SET ${setClauses.join(", ")}, updated_at = NOW()
       WHERE id = $${idx} AND company_id = $${idx + 1}
       RETURNING *`,
      [...values, id, companyId],
    );

    return res.status(200).json({
      message: "Asset updated.",
      data: serializeAsset(result.rows[0]),
    });
  } catch (err) {
    console.error("updateAsset error:", err);
    return res.status(500).json({ message: "Server error updating asset." });
  }
}

// ══════════════════════════════════════════════════════════════
// DELETE /api/assets/:id
// ══════════════════════════════════════════════════════════════
export async function retireAsset(req, res) {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const existing = await db.query(
      `SELECT id, status, name FROM assets WHERE id = $1 AND company_id = $2`,
      [id, companyId],
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Asset not found." });
    }
    if (existing.rows[0].status === "assigned") {
      return res.status(409).json({
        message:
          "Cannot retire an asset that is currently assigned. Return it first.",
      });
    }

    const result = await db.query(
      `UPDATE assets
       SET status = 'retired', is_active = false, updated_at = NOW()
       WHERE id = $1 AND company_id = $2
       RETURNING id, name, status, is_active, updated_at`,
      [id, companyId],
    );

    return res.status(200).json({
      message: `Asset "${result.rows[0].name}" has been retired.`,
      data: result.rows[0],
    });
  } catch (err) {
    console.error("retireAsset error:", err);
    return res.status(500).json({ message: "Server error retiring asset." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/assets/:id/assign
// ══════════════════════════════════════════════════════════════
export async function assignAsset(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { id } = req.params;
  const { companyId, userId } = req.user;
  const {
    employeeId,
    expectedReturnDate = null,
    condition = "good",
    notes = null,
  } = req.body;

  if (!employeeId) {
    return res.status(400).json({ message: "employeeId is required." });
  }
  if (!VALID_CONDITIONS.includes(condition)) {
    return res.status(400).json({
      message: `condition must be one of: ${VALID_CONDITIONS.join(", ")}.`,
    });
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const assetResult = await client.query(
      `SELECT id, name, status FROM assets
       WHERE id = $1 AND company_id = $2
       FOR UPDATE`,
      [id, companyId],
    );
    if (assetResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Asset not found." });
    }
    const asset = assetResult.rows[0];
    if (asset.status !== "available") {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: `Asset is currently "${asset.status}" and cannot be assigned.`,
      });
    }

    const empResult = await client.query(
      `SELECT id, first_name, last_name FROM employees
       WHERE id = $1 AND company_id = $2
         AND employment_status NOT IN ('terminated','resigned','retired')`,
      [employeeId, companyId],
    );
    if (empResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Employee not found, or is not currently active.",
      });
    }
    const emp = empResult.rows[0];

    const assignmentResult = await client.query(
      `INSERT INTO asset_assignments (
         company_id, asset_id, employee_id, assigned_date, assigned_by,
         assigned_condition, expected_return_date, notes, status, created_at
       )
       VALUES ($1,$2,$3, CURRENT_DATE, $4, $5, $6, $7, 'assigned', NOW())
       RETURNING *`,
      [companyId, id, employeeId, userId, condition, expectedReturnDate, notes],
    );

    await client.query(
      `UPDATE assets
       SET status = 'assigned', condition = $1, updated_at = NOW()
       WHERE id = $2`,
      [condition, id],
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: `${asset.name} assigned to ${emp.first_name} ${emp.last_name}.`,
      data: serializeAssignment(assignmentResult.rows[0]),
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("assignAsset error:", err);
    return res.status(500).json({ message: "Server error assigning asset." });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/assets/:id/return
// ══════════════════════════════════════════════════════════════
export async function returnAsset(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { id } = req.params;
  const { companyId, userId } = req.user;
  const { condition, notes = null } = req.body;

  if (!condition || !VALID_CONDITIONS.includes(condition)) {
    return res.status(400).json({
      message: `condition is required and must be one of: ${VALID_CONDITIONS.join(", ")}.`,
    });
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const assetResult = await client.query(
      `SELECT id, name FROM assets WHERE id = $1 AND company_id = $2 FOR UPDATE`,
      [id, companyId],
    );
    if (assetResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Asset not found." });
    }

    const assignmentResult = await client.query(
      `SELECT id FROM asset_assignments
       WHERE asset_id = $1 AND company_id = $2 AND status = 'assigned'
       FOR UPDATE`,
      [id, companyId],
    );
    if (assignmentResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ message: "This asset has no active assignment." });
    }
    const assignmentId = assignmentResult.rows[0].id;

    const newAssignmentStatus =
      condition === "lost"
        ? "lost"
        : condition === "damaged"
          ? "damaged"
          : "returned";
    const newAssetStatus =
      condition === "lost"
        ? "lost"
        : condition === "damaged"
          ? "under_repair"
          : "available";

    const updatedAssignment = await client.query(
      `UPDATE asset_assignments
       SET returned_date = CURRENT_DATE,
           returned_condition = $1,
           return_notes = $2,
           returned_by = $3,
           status = $4,
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [condition, notes, userId, newAssignmentStatus, assignmentId],
    );

    await client.query(
      `UPDATE assets
       SET status = $1, condition = $2, updated_at = NOW()
       WHERE id = $3`,
      [newAssetStatus, condition, id],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: `${assetResult.rows[0].name} marked as returned (${condition}).`,
      data: serializeAssignment(updatedAssignment.rows[0]),
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("returnAsset error:", err);
    return res.status(500).json({ message: "Server error returning asset." });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/assets/:id/history
// ══════════════════════════════════════════════════════════════
export async function getAssetHistory(req, res) {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const assetCheck = await db.query(
      `SELECT id, name, asset_tag FROM assets WHERE id = $1 AND company_id = $2`,
      [id, companyId],
    );
    if (assetCheck.rows.length === 0) {
      return res.status(404).json({ message: "Asset not found." });
    }

    const result = await db.query(
      `SELECT
         aa.*,
         e.employee_code,
         e.first_name AS emp_first_name,
         e.last_name  AS emp_last_name
       FROM asset_assignments aa
       JOIN employees e ON e.id = aa.employee_id
       WHERE aa.asset_id = $1 AND aa.company_id = $2
       ORDER BY aa.assigned_date DESC`,
      [id, companyId],
    );

    return res.status(200).json({
      asset: assetCheck.rows[0],
      data: result.rows.map(serializeAssignment),
    });
  } catch (err) {
    console.error("getAssetHistory error:", err);
    return res
      .status(500)
      .json({ message: "Server error fetching asset history." });
  }
}

// ══════════════════════════════════════════════════════════════
// EMPLOYEE ENDPOINTS
// ══════════════════════════════════════════════════════════════

// // GET /api/assets/my
// export async function getMyAssets(req, res) {
//   try {
//     const { userId, companyId } = req.user;

//     const emp = await db.query(
//       "SELECT id FROM employees WHERE user_id = $1 AND company_id = $2 LIMIT 1",
//       [userId, companyId],
//     );
//     const employeeId = emp.rows[0]?.id;
//     if (!employeeId) {
//       return res.status(200).json({ data: [] });
//     }

//     const result = await db.query(
//       `SELECT
//          a.id,
//          a.name,
//          a.category,
//          a.brand,
//          a.model,
//          a.serial_number   AS "serialNumber",
//          a.condition,
//          a.location,
//          a.notes,
//          aa.assigned_at    AS "assignedAt",
//          aa.status
//        FROM asset_assignments aa
//        JOIN assets a ON a.id = aa.asset_id
//        WHERE aa.employee_id = $1
//          AND aa.status = 'active'
//          AND a.company_id   = $2
//        ORDER BY aa.assigned_at DESC`,
//       [employeeId, companyId],
//     );

//     return res.status(200).json({ data: result.rows });
//   } catch (err) {
//     console.error("getMyAssets error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// // POST /api/assets/request
// export async function requestAsset(req, res) {
//   if (handleValidationErrors(req, res)) return;

//   const { category, name, reason, priority = "normal" } = req.body;
//   const { userId, companyId } = req.user;

//   try {
//     const emp = await db.query(
//       "SELECT id FROM employees WHERE user_id = $1 AND company_id = $2 LIMIT 1",
//       [userId, companyId],
//     );
//     const employeeId = emp.rows[0]?.id;
//     if (!employeeId) {
//       return res
//         .status(400)
//         .json({ message: "Employee profile required to request assets." });
//     }

//     const result = await db.query(
//       `INSERT INTO asset_requests
//          (employee_id, user_id, company_id, category, name, reason, priority, status, created_at)
//        VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())
//        RETURNING
//          id,
//          category,
//          name            AS "assetName",
//          reason,
//          priority,
//          status,
//          rejection_reason AS "rejectionReason",
//          created_at       AS "createdAt"`,
//       [employeeId, userId, companyId, category ?? "other", name, reason, priority],
//     );

//     return res.status(201).json({
//       message: "Asset request submitted.",
//       data: result.rows[0],
//     });
//   } catch (err) {
//     console.error("requestAsset error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// // GET /api/assets/requests/my
// export async function getMyRequests(req, res) {
//   try {
//     const { userId, companyId } = req.user;

//     const emp = await db.query(
//       "SELECT id FROM employees WHERE user_id = $1 AND company_id = $2 LIMIT 1",
//       [userId, companyId],
//     );
//     const employeeId = emp.rows[0]?.id;
//     if (!employeeId) {
//       return res.status(200).json({ data: [] });
//     }

//     const result = await db.query(
//       `SELECT
//          id,
//          category,
//          name            AS "assetName",
//          reason,
//          priority,
//          status,
//          rejection_reason AS "rejectionReason",
//          created_at       AS "createdAt"
//        FROM asset_requests
//        WHERE employee_id = $1
//          AND company_id  = $2
//        ORDER BY created_at DESC`,
//       [employeeId, companyId],
//     );

//     return res.status(200).json({ data: result.rows });
//   } catch (err) {
//     console.error("getMyRequests error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// GET /api/assets/my
export async function getMyAssets(req, res) {
  try {
    const { userId, companyId } = req.user;

    const emp = await db.query(
      "SELECT id FROM employees WHERE user_id = $1 AND company_id = $2 LIMIT 1",
      [userId, companyId],
    );
    const employeeId = emp.rows[0]?.id;
    if (!employeeId) {
      return res.status(200).json({ data: [] });
    }

    const result = await db.query(
      `SELECT
         a.id,
         a.name,
         a.category,
         a.brand,
         a.model,
         a.serial_number   AS "serialNumber",
         a.condition,
         a.location,
         a.notes,
         aa.assigned_date  AS "assignedAt",
         aa.status
       FROM asset_assignments aa
       JOIN assets a ON a.id = aa.asset_id
       WHERE aa.employee_id = $1
         AND aa.status = 'assigned'
         AND a.company_id   = $2
       ORDER BY aa.assigned_date DESC`,
      [employeeId, companyId],
    );

    return res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error("getMyAssets error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// POST /api/assets/request
export async function requestAsset(req, res) {
  if (handleValidationErrors(req, res)) return;

  const { category, name, reason, priority = "normal" } = req.body;
  const { userId, companyId } = req.user;

  try {
    const emp = await db.query(
      "SELECT id FROM employees WHERE user_id = $1 AND company_id = $2 LIMIT 1",
      [userId, companyId],
    );
    const employeeId = emp.rows[0]?.id;
    if (!employeeId) {
      return res
        .status(400)
        .json({ message: "Employee profile required to request assets." });
    }

    const result = await db.query(
      `INSERT INTO asset_requests
         (employee_id, user_id, company_id, category, name, reason, priority, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())
       RETURNING
         id,
         category,
         name            AS "assetName",
         reason,
         priority,
         status,
         rejection_reason AS "rejectionReason",
         created_at       AS "createdAt"`,
      [employeeId, userId, companyId, category ?? "other", name, reason, priority],
    );

    return res.status(201).json({
      message: "Asset request submitted.",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("requestAsset error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// GET /api/assets/requests/my
export async function getMyRequests(req, res) {
  try {
    const { userId, companyId } = req.user;

    const emp = await db.query(
      "SELECT id FROM employees WHERE user_id = $1 AND company_id = $2 LIMIT 1",
      [userId, companyId],
    );
    const employeeId = emp.rows[0]?.id;
    if (!employeeId) {
      return res.status(200).json({ data: [] });
    }

    const result = await db.query(
      `SELECT
         id,
         category,
         name            AS "assetName",
         reason,
         priority,
         status,
         rejection_reason AS "rejectionReason",
         created_at       AS "createdAt"
       FROM asset_requests
       WHERE employee_id = $1
         AND company_id  = $2
       ORDER BY created_at DESC`,
      [employeeId, companyId],
    );

    return res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error("getMyRequests error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}