// src/controllers/document.controller.js
//
// Endpoints:
//   POST /api/documents/templates       → createTemplate
//   GET  /api/documents/templates       → getTemplates
//   PUT  /api/documents/templates/:id   → updateTemplate
//   DELETE /api/documents/templates/:id → deleteTemplate
//   POST /api/documents/send            → sendDocument (creates approval)
//   GET  /api/documents                 → getAllDocuments
//   GET  /api/documents/:id             → getDocumentById
//   PUT  /api/documents/:id/sign        → signDocument

import { db } from "../config/db.js";
import { createApproval } from "./approval.controller.js";

// ─── Placeholder engine ────────────────────────────────────────
function fillTemplate(content, employee) {
  const map = {
    "{{firstName}}": employee.first_name ?? "",
    "{{lastName}}": employee.last_name ?? "",
    "{{fullName}}":
      `${employee.first_name ?? ""} ${employee.last_name ?? ""}`.trim(),
    "{{email}}": employee.email ?? "",
    "{{position}}": employee.job_title ?? employee.position ?? "",
    "{{department}}": employee.department ?? "",
    "{{employeeId}}": employee.employee_code ?? employee.id ?? "",
    "{{startDate}}": employee.start_date ?? "",
    "{{salary}}": employee.basic_salary ?? "",
    "{{phone}}": employee.phone ?? "",
    "{{address}}": employee.address ?? "",
    "{{companyName}}": employee.company_name ?? "",
    "{{today}}": new Date().toLocaleDateString("en-NG", { dateStyle: "long" }),
  };

  let result = content;
  for (const [placeholder, value] of Object.entries(map)) {
    result = result.replaceAll(placeholder, value);
  }
  return result;
}

// ══════════════════════════════════════════════════════════════
// POST /api/documents/templates
// Body: { name, category, content }
// ══════════════════════════════════════════════════════════════
export async function createTemplate(req, res) {
  const { companyId, userId } = req.user;
  const { name, category = "custom", content } = req.body;

  if (!name?.trim() || !content?.trim()) {
    return res.status(400).json({ message: "name and content are required." });
  }

  try {
    const result = await db.query(
      `INSERT INTO document_templates (company_id, name, category, content, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [companyId, name.trim(), category, content.trim(), userId],
    );
    return res
      .status(201)
      .json({ message: "Template created.", data: result.rows[0] });
  } catch (err) {
    console.error("createTemplate error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/documents/templates
// ══════════════════════════════════════════════════════════════
export async function getTemplates(req, res) {
  const { companyId } = req.user;
  const { category } = req.query;

  const conditions = ["company_id = $1"];
  const params = [companyId];

  if (category) {
    conditions.push("category = $2");
    params.push(category);
  }

  try {
    const result = await db.query(
      `SELECT * FROM document_templates WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC`,
      params,
    );
    return res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error("getTemplates error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/documents/templates/:id
// ══════════════════════════════════════════════════════════════
export async function updateTemplate(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;
  const { name, category, content } = req.body;

  try {
    const existing = await db.query(
      "SELECT * FROM document_templates WHERE id = $1 AND company_id = $2",
      [id, companyId],
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Template not found." });
    }

    const t = existing.rows[0];
    const updated = await db.query(
      `UPDATE document_templates
       SET name = $1, category = $2, content = $3, updated_at = NOW()
       WHERE id = $4 AND company_id = $5
       RETURNING *`,
      [
        name ?? t.name,
        category ?? t.category,
        content ?? t.content,
        id,
        companyId,
      ],
    );
    return res
      .status(200)
      .json({ message: "Template updated.", data: updated.rows[0] });
  } catch (err) {
    console.error("updateTemplate error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// DELETE /api/documents/templates/:id
// ══════════════════════════════════════════════════════════════
export async function deleteTemplate(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    const result = await db.query(
      "DELETE FROM document_templates WHERE id = $1 AND company_id = $2 RETURNING id",
      [id, companyId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Template not found." });
    }
    return res.status(200).json({ message: "Template deleted." });
  } catch (err) {
    console.error("deleteTemplate error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// POST /api/documents/send
// Body: { employeeId, templateId }
// Creates approval — document is only sent after approval.
// ══════════════════════════════════════════════════════════════
export async function sendDocument(req, res) {
  const { companyId, userId } = req.user;
  const { employeeId, templateId } = req.body;

  if (!employeeId || !templateId) {
    return res
      .status(400)
      .json({ message: "employeeId and templateId are required." });
  }

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    // Fetch template
    const tmplRes = await client.query(
      "SELECT * FROM document_templates WHERE id = $1 AND company_id = $2",
      [templateId, companyId],
    );
    if (tmplRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Template not found." });
    }
    const template = tmplRes.rows[0];

    // Fetch employee with department + company name
    const empRes = await client.query(
      `SELECT e.*, d.name AS department, c.name AS company_name
       FROM employees e
       LEFT JOIN departments d ON d.id = e.department_id
       LEFT JOIN companies   c ON c.id = e.company_id
       WHERE e.id = $1 AND e.company_id = $2`,
      [employeeId, companyId],
    );
    if (empRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Employee not found." });
    }
    const employee = empRes.rows[0];

    // Fill placeholders
    const finalContent = fillTemplate(template.content, employee);

    // Create document row (status = pending until approved)
    const docRes = await client.query(
      `INSERT INTO documents
         (company_id, employee_id, template_id, final_content, status, created_by, created_at)
       VALUES ($1, $2, $3, $4, 'pending', $5, NOW())
       RETURNING *`,
      [companyId, employeeId, templateId, finalContent, userId],
    );
    const doc = docRes.rows[0];

    // Create approval
    await createApproval(client, {
      companyId,
      type: "document",
      entityId: doc.id,
      requestedBy: userId,
      metadata: {
        templateName: template.name,
        employeeName: `${employee.first_name} ${employee.last_name}`,
      },
    });

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Document created and pending approval before sending.",
      data: doc,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("sendDocument error:", err);
    return res.status(500).json({ message: "Server error." });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/documents
// Query: ?employeeId= &status= &page= &limit=
// ══════════════════════════════════════════════════════════════
export async function getAllDocuments(req, res) {
  const { companyId } = req.user;
  const { employeeId, status, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const conditions = ["d.company_id = $1"];
  const params = [companyId];
  let idx = 2;

  if (employeeId) {
    conditions.push(`d.employee_id = $${idx++}`);
    params.push(employeeId);
  }
  if (status) {
    conditions.push(`d.status = $${idx++}`);
    params.push(status);
  }

  try {
    const result = await db.query(
      `SELECT
         d.*,
         dt.name AS template_name,
         dt.category,
         CONCAT(e.first_name,' ',e.last_name) AS employee_name
       FROM documents d
       LEFT JOIN document_templates dt ON dt.id = d.template_id
       LEFT JOIN employees          e  ON e.id  = d.employee_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY d.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit, 10), offset],
    );

    const countRes = await db.query(
      `SELECT COUNT(*) FROM documents d WHERE ${conditions.join(" AND ")}`,
      params,
    );

    return res.status(200).json({
      data: result.rows,
      total: parseInt(countRes.rows[0].count, 10),
    });
  } catch (err) {
    console.error("getAllDocuments error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/documents/:id
// ══════════════════════════════════════════════════════════════
export async function getDocumentById(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    const result = await db.query(
      `SELECT d.*, dt.name AS template_name, dt.category,
              CONCAT(e.first_name,' ',e.last_name) AS employee_name
       FROM documents d
       LEFT JOIN document_templates dt ON dt.id = d.template_id
       LEFT JOIN employees          e  ON e.id  = d.employee_id
       WHERE d.id = $1 AND d.company_id = $2`,
      [id, companyId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Document not found." });
    }

    return res.status(200).json({ data: result.rows[0] });
  } catch (err) {
    console.error("getDocumentById error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/documents/:id/sign
// Body: { signature? }   Employee signs document
// ══════════════════════════════════════════════════════════════
export async function signDocument(req, res) {
  const { id } = req.params;
  const { companyId, userId } = req.user;
  const { signature } = req.body;

  try {
    // Confirm document belongs to this company and is in sent status
    const existing = await db.query(
      "SELECT * FROM documents WHERE id = $1 AND company_id = $2",
      [id, companyId],
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Document not found." });
    }

    const doc = existing.rows[0];

    if (doc.status === "signed") {
      return res.status(409).json({ message: "Document is already signed." });
    }

    if (doc.status !== "sent") {
      return res.status(409).json({
        message: `Document must be in 'sent' status to sign. Current: ${doc.status}.`,
      });
    }

    const updated = await db.query(
      `UPDATE documents
       SET
         status    = 'signed',
         signed_at = NOW(),
         signature = $1,
         updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [signature ?? null, id],
    );

    return res
      .status(200)
      .json({ message: "Document signed.", data: updated.rows[0] });
  } catch (err) {
    console.error("signDocument error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}
