// src/controllers/benefits.controller.js
//
// Endpoints:
//   POST   /api/benefits           → create benefit
//   GET    /api/benefits           → list company benefits
//   PUT    /api/benefits/:id       → update benefit
//   DELETE /api/benefits/:id       → delete benefit
//   POST   /api/benefits/assign    → assign benefit to employee(s)
//   GET    /api/employees/:id/benefits → employee's benefits
//   PUT    /api/benefits/employee/:id/deactivate → deactivate assignment

import { db } from "../config/db.js";

// ══════════════════════════════════════════════════════════════
// POST /api/benefits
// Body: { name, type, provider?, description?, isInsurance? }
// ══════════════════════════════════════════════════════════════
export async function createBenefit(req, res) {
  const { companyId } = req.user;
  const {
    name,
    type = "custom",
    provider,
    description,
    isInsurance = false,
  } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Benefit name is required." });
  }

  try {
    const result = await db.query(
      `INSERT INTO benefits (company_id, name, type, provider, description, is_insurance, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [
        companyId,
        name.trim(),
        type,
        provider ?? null,
        description ?? null,
        isInsurance,
      ],
    );
    return res
      .status(201)
      .json({ message: "Benefit created.", data: result.rows[0] });
  } catch (err) {
    console.error("createBenefit error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/benefits
// Query: ?type=
// ══════════════════════════════════════════════════════════════
export async function getBenefits(req, res) {
  const { companyId } = req.user;
  const { type } = req.query;

  const conditions = ["company_id = $1"];
  const params = [companyId];

  if (type) {
    conditions.push("type = $2");
    params.push(type);
  }

  try {
    const result = await db.query(
      `SELECT * FROM benefits WHERE ${conditions.join(" AND ")} ORDER BY name ASC`,
      params,
    );
    return res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error("getBenefits error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/benefits/:id
// ══════════════════════════════════════════════════════════════
export async function updateBenefit(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;
  const { name, type, provider, description, isInsurance } = req.body;

  try {
    const existing = await db.query(
      "SELECT * FROM benefits WHERE id = $1 AND company_id = $2",
      [id, companyId],
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Benefit not found." });
    }
    const b = existing.rows[0];

    const updated = await db.query(
      `UPDATE benefits
       SET
         name         = $1,
         type         = $2,
         provider     = $3,
         description  = $4,
         is_insurance = $5,
         updated_at   = NOW()
       WHERE id = $6 AND company_id = $7
       RETURNING *`,
      [
        name ?? b.name,
        type ?? b.type,
        provider ?? b.provider,
        description ?? b.description,
        isInsurance ?? b.is_insurance,
        id,
        companyId,
      ],
    );
    return res
      .status(200)
      .json({ message: "Benefit updated.", data: updated.rows[0] });
  } catch (err) {
    console.error("updateBenefit error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// DELETE /api/benefits/:id
// ══════════════════════════════════════════════════════════════
export async function deleteBenefit(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    const result = await db.query(
      "DELETE FROM benefits WHERE id = $1 AND company_id = $2 RETURNING id",
      [id, companyId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Benefit not found." });
    }
    return res.status(200).json({ message: "Benefit deleted." });
  } catch (err) {
    console.error("deleteBenefit error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/benefits/assign
// Body: { employeeId, benefitId, startDate?, endDate? }
// ══════════════════════════════════════════════════════════════
export async function assignBenefit(req, res) {
  const { companyId } = req.user;
  const { employeeId, benefitId, startDate, endDate } = req.body;

  if (!employeeId || !benefitId) {
    return res
      .status(400)
      .json({ message: "employeeId and benefitId are required." });
  }

  try {
    // Verify benefit belongs to company
    const benefitCheck = await db.query(
      "SELECT id FROM benefits WHERE id = $1 AND company_id = $2",
      [benefitId, companyId],
    );
    if (benefitCheck.rows.length === 0) {
      return res.status(404).json({ message: "Benefit not found." });
    }

    // Verify employee belongs to company
    const empCheck = await db.query(
      "SELECT id FROM employees WHERE id = $1 AND company_id = $2",
      [employeeId, companyId],
    );
    if (empCheck.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found." });
    }

    // Prevent duplicate active assignment
    const dup = await db.query(
      `SELECT id FROM employee_benefits
       WHERE employee_id = $1 AND benefit_id = $2 AND status = 'active'`,
      [employeeId, benefitId],
    );
    if (dup.rows.length > 0) {
      return res
        .status(409)
        .json({
          message: "Benefit already actively assigned to this employee.",
        });
    }

    const result = await db.query(
      `INSERT INTO employee_benefits (employee_id, benefit_id, status, start_date, end_date, created_at)
       VALUES ($1, $2, 'active', $3, $4, NOW())
       RETURNING *`,
      [
        employeeId,
        benefitId,
        startDate ?? new Date().toISOString().split("T")[0],
        endDate ?? null,
      ],
    );
    return res
      .status(201)
      .json({ message: "Benefit assigned.", data: result.rows[0] });
  } catch (err) {
    console.error("assignBenefit error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/employees/:id/benefits
// ══════════════════════════════════════════════════════════════
export async function getEmployeeBenefits(req, res) {
  const { id: employeeId } = req.params;
  const { companyId } = req.user;

  try {
    // Guard: employee must belong to company
    const empCheck = await db.query(
      "SELECT id FROM employees WHERE id = $1 AND company_id = $2",
      [employeeId, companyId],
    );
    if (empCheck.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const result = await db.query(
      `SELECT
         eb.*,
         b.name         AS benefit_name,
         b.type,
         b.provider,
         b.description,
         b.is_insurance
       FROM employee_benefits eb
       JOIN benefits b ON b.id = eb.benefit_id
       WHERE eb.employee_id = $1
       ORDER BY eb.created_at DESC`,
      [employeeId],
    );

    return res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error("getEmployeeBenefits error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/benefits/employee/:id/deactivate
// ══════════════════════════════════════════════════════════════
export async function deactivateBenefit(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    // Verify via join that this assignment belongs to this company
    const result = await db.query(
      `UPDATE employee_benefits eb
       SET status = 'inactive', end_date = COALESCE(eb.end_date, NOW()::date), updated_at = NOW()
       FROM employees e
       WHERE eb.id = $1 AND eb.employee_id = e.id AND e.company_id = $2
       RETURNING eb.*`,
      [id, companyId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Benefit assignment not found." });
    }
    return res
      .status(200)
      .json({ message: "Benefit deactivated.", data: result.rows[0] });
  } catch (err) {
    console.error("deactivateBenefit error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}
