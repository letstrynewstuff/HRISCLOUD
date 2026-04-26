// src/controllers/grade.controller.js
import { db } from "../config/db.js";

/**
 * The $1, $2, etc. are PostgreSQL placeholders, NOT dollar signs.
 * They safely inject your variables (Naira, Rand, Cedis, etc.) into the query.
 */

export const listGrades = async (req, res) => {
  try {
    const { companyId } = req.user;
    const result = await db.query(
      "SELECT * FROM grades WHERE company_id = $1 ORDER BY name ASC",
      [companyId],
    );
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch grades." });
  }
};

export const createGrade = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { name, minSalary, maxSalary, colorCode, description } = req.body;

    const result = await db.query(
      `INSERT INTO grades (company_id, name, min_salary, max_salary, color_code, description)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [companyId, name, minSalary, maxSalary, colorCode, description],
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    console.error("createGrade error:", err);
    res.status(500).json({ message: "Failed to create grade." });
  }
};

export const updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;
    const { name, minSalary, maxSalary, colorCode, description } = req.body;

    const result = await db.query(
      `UPDATE grades 
       SET name = $1, min_salary = $2, max_salary = $3, color_code = $4, description = $5, updated_at = NOW()
       WHERE id = $6 AND company_id = $7 RETURNING *`,
      [name, minSalary, maxSalary, colorCode, description, id, companyId],
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Grade not found." });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Failed to update grade." });
  }
};

export const deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    // Safety check: You might want to check if any Job Roles are using this grade
    // before deleting, but this will perform the deletion:
    const result = await db.query(
      "DELETE FROM grades WHERE id = $1 AND company_id = $2 RETURNING id",
      [id, companyId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Grade not found." });
    }

    res.json({ message: "Grade deleted successfully." });
  } catch (err) {
    console.error("deleteGrade error:", err);
    res.status(500).json({ message: "Failed to delete grade." });
  }
};