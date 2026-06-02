// src/controllers/document.controller.js
//
// Endpoints:
//   POST   /api/documents/templates       → createTemplate
//   GET    /api/documents/templates       → getTemplates
//   PUT    /api/documents/templates/:id   → updateTemplate
//   DELETE /api/documents/templates/:id   → deleteTemplate
//   POST   /api/documents/send            → sendDocument (template-based, creates approval)
//   POST   /api/documents/upload          → uploadDocument   (PDF/DOCX → Cloudinary)
//   POST   /api/documents/send-uploaded   → sendUploadedDocument (assign + notify)
//   GET    /api/documents/my              → getEmployeeDocuments
//   GET    /api/documents                 → getAllDocuments
//   GET    /api/documents/:id             → getDocumentById
//   PUT    /api/documents/:id/sign        → signDocument

import { db } from "../config/db.js";
import { createApproval } from "./approval.controller.js";
import { uploadToCloud } from "../utils/upload.js";

// ─────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────

/** Fill {{placeholder}} tokens in a template string with employee data. */
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

/**
 * Insert a notification row — non-fatal; errors are only logged.
 * @param {import('pg').PoolClient} client
 */
// Cached column map for notifications table — discovered at first call.
// Maps our logical field names to whatever column names exist in YOUR schema.
let _notifCols = null;

async function discoverNotifCols(client) {
  if (_notifCols) return _notifCols;
  const res = await client.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'notifications'`,
  );
  const cols = res.rows.map((r) => r.column_name);
  // Map logical name → actual column name (handles body/message/content, etc.)
  _notifCols = {
    company_id: cols.find((c) => c === "company_id") ?? null,
    user_id: cols.find((c) => c === "user_id") ?? null,
    type: cols.find((c) => c === "type") ?? null,
    // title: try "title" then "subject" then "name"
    title: cols.find((c) => ["title", "subject", "name"].includes(c)) ?? null,
    // body: try "body" then "message" then "content" then "description"
    body:
      cols.find((c) =>
        ["body", "message", "content", "description"].includes(c),
      ) ?? null,
    entity_type:
      cols.find((c) =>
        ["entity_type", "reference_type", "ref_type"].includes(c),
      ) ?? null,
    entity_id:
      cols.find((c) => ["entity_id", "reference_id", "ref_id"].includes(c)) ??
      null,
  };
  console.log("[notifications] resolved column map:", _notifCols);
  return _notifCols;
}

async function pushNotification(
  client,
  { companyId, userId, type, title, body, entityType, entityId },
) {
  try {
    const cols = await discoverNotifCols(client);

    // Build INSERT only from columns that actually exist in the table
    const fields = [];
    const values = [];
    const params = [];
    let idx = 1;

    const add = (col, val) => {
      if (!col) return; // column doesn't exist in this schema — skip
      fields.push(col);
      params.push(`$${idx++}`);
      values.push(val ?? null);
    };

    add(cols.company_id, companyId);
    add(cols.user_id, userId);
    add(cols.type, type);
    add(cols.title, title);
    add(cols.body, body);
    add(cols.entity_type, entityType);
    add(cols.entity_id, entityId);

    if (fields.length === 0) {
      console.warn("[pushNotification] No matching columns found — skipping.");
      return;
    }

    await client.query(
      `INSERT INTO notifications (${fields.join(",")}) VALUES (${params.join(",")})`,
      values,
    );
  } catch (err) {
    // Non-fatal: log but never crash the parent transaction
    console.error("pushNotification error:", err.message);
  }
}

// ─────────────────────────────────────────────────────────────
// TEMPLATES
// ─────────────────────────────────────────────────────────────

// POST /api/documents/templates

// await pushNotification(client, {
//   companyId,
//   userId: emp.user_id,
//   type: "document", // ← was "document_received", now matches constraint
//   title: `New document: ${uploadedDoc.name}`,
//   body: message
//     ? `You have received a document with a message: "${message}". Please review and sign.`
//     : `You have received a document that requires your review and signature.`,
//   entityType: "document",
//   entityId: insertRes.rows[0].id,
// });

export async function createTemplate(req, res) {
  const { companyId, userId } = req.user;
  const { name, category = "custom", content } = req.body;

  if (!name?.trim() || !content?.trim()) {
    return res.status(400).json({ message: "name and content are required." });
  }
  try {
    const result = await db.query(
      `INSERT INTO document_templates (company_id, name, category, content, created_by, created_at)
       VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING *`,
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

// GET /api/documents/templates
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

// PUT /api/documents/templates/:id
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
       SET name=$1, category=$2, content=$3, updated_at=NOW()
       WHERE id=$4 AND company_id=$5 RETURNING *`,
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

// DELETE /api/documents/templates/:id
export async function deleteTemplate(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;
  try {
    const result = await db.query(
      "DELETE FROM document_templates WHERE id=$1 AND company_id=$2 RETURNING id",
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

// ─────────────────────────────────────────────────────────────
// TEMPLATE-BASED SEND  (existing flow — unchanged)
// ─────────────────────────────────────────────────────────────

// POST /api/documents/send
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

    const tmplRes = await client.query(
      "SELECT * FROM document_templates WHERE id=$1 AND company_id=$2",
      [templateId, companyId],
    );
    if (tmplRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Template not found." });
    }

    const empRes = await client.query(
      `SELECT e.*, d.name AS department, c.name AS company_name
       FROM employees e
       LEFT JOIN departments d ON d.id = e.department_id
       LEFT JOIN companies   c ON c.id = e.company_id
       WHERE e.id=$1 AND e.company_id=$2`,
      [employeeId, companyId],
    );
    if (empRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Employee not found." });
    }

    const template = tmplRes.rows[0];
    const employee = empRes.rows[0];
    const finalContent = fillTemplate(template.content, employee);

    const docRes = await client.query(
      `INSERT INTO documents
         (company_id, employee_id, template_id, final_content, status, created_by, created_at)
       VALUES ($1,$2,$3,$4,'pending',$5,NOW()) RETURNING *`,
      [companyId, employeeId, templateId, finalContent, userId],
    );
    const doc = docRes.rows[0];

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

// ─────────────────────────────────────────────────────────────
// RAW FILE UPLOAD  (PDF / DOCX → Cloudinary)
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/documents/upload
 * multipart/form-data: file (PDF or DOCX) + body { name, category? }
 *
 * multer memoryStorage puts the raw bytes in req.file.buffer.
 * We stream that buffer to Cloudinary with resource_type "raw" so the
 * original file is preserved as-is (no image transforms).
 *
 * Returns the uploaded_documents row — frontend uses the id in step 2.
 */
// export async function uploadDocument(req, res) {
//   const { companyId, userId } = req.user;

//   if (!req.file) {
//     return res.status(400).json({ message: "A PDF or DOCX file is required." });
//   }

//   const { name, category = "Other" } = req.body;
//   if (!name?.trim()) {
//     return res.status(400).json({ message: "Document name is required." });
//   }

//   try {
//     // ── Upload buffer → Cloudinary ────────────────────────────────────────
//     const cloudResult = await uploadToCloud(req.file.buffer, {
//       folder:       "hriscloud/documents",
//       resourceType: "raw",   // preserves PDF/DOCX — never transcode
//       overwrite:    false,
//     });
//     // cloudResult: { url, publicId, format, bytes }

//     // ── Persist metadata ──────────────────────────────────────────────────
//     const result = await db.query(
//       `INSERT INTO uploaded_documents
//          (company_id, name, category, file_url, file_public_id,
//           file_name, mime_type, file_size, created_by)
//        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
//        RETURNING *`,
//       [
//         companyId,
//         name.trim(),
//         category,
//         cloudResult.url,        // permanent Cloudinary URL
//         cloudResult.publicId,   // needed for future deletions
//         req.file.originalname,
//         req.file.mimetype,
//         req.file.size,
//         userId,
//       ],
//     );

//     return res.status(201).json({
//       message: "Document uploaded successfully.",
//       data: result.rows[0],
//     });
//   } catch (err) {
//     console.error("uploadDocument error:", err);
//     return res.status(500).json({ message: "Server error uploading document." });
//   }
// }

// ─────────────────────────────────────────────────────────────
// SEND UPLOADED DOC TO EMPLOYEES
// ─────────────────────────────────────────────────────────────

export async function uploadDocument(req, res) {
  const { companyId, userId } = req.user;

  if (!req.file) {
    return res.status(400).json({ message: "A PDF or DOCX file is required." });
  }

  const { name, category = "Other" } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ message: "Document name is required." });
  }

  // ── Sanitize category ─────────────────────────────────────────────────────
  const ALLOWED_CATEGORIES = [
    "Contract",
    "NDA",
    "Offer Letter",
    "Policy",
    "Onboarding",
    "Compliance",
    "Promotion Letter",
    "Disciplinary Notice",
    "Exit Letter",
    "Other",
  ];
  const safeCategory = ALLOWED_CATEGORIES.includes(category)
    ? category
    : "Other";
  // ─────────────────────────────────────────────────────────────────────────

  try {
    const cloudResult = await uploadToCloud(req.file.buffer, {
      folder: "hriscloud/documents",
      resourceType: "raw",
      overwrite: false,
    });

    const result = await db.query(
      `INSERT INTO uploaded_documents
         (company_id, name, category, file_url, file_public_id,
          file_name, mime_type, file_size, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        companyId,
        name.trim(),
        safeCategory, // ← was: category (raw from req.body)
        cloudResult.url,
        cloudResult.publicId,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        userId,
      ],
    );

    return res.status(201).json({
      message: "Document uploaded successfully.",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("uploadDocument error:", err);
    return res
      .status(500)
      .json({ message: "Server error uploading document." });
  }
}
/**
 * POST /api/documents/send-uploaded
 * Body: { documentId, employeeIds: string[], message? }
 *
 * For each employee:
 *   1. Insert a documents row (status = 'sent', file_url copied from uploaded_documents)
 *   2. Push a notification to their user account
 */

export async function sendUploadedDocument(req, res) {
  const { companyId, userId } = req.user;
  const { documentId, employeeIds, message } = req.body;

  if (!documentId) {
    return res.status(400).json({ message: "documentId is required." });
  }
  if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
    return res
      .status(400)
      .json({ message: "employeeIds must be a non-empty array." });
  }

  // ── Step 1: verify the uploaded doc exists ──────────────────────────────
  const docRes = await db.query(
    `SELECT * FROM uploaded_documents WHERE id=$1 AND company_id=$2`,
    [documentId, companyId],
  );
  if (docRes.rows.length === 0) {
    return res.status(404).json({ message: "Uploaded document not found." });
  }
  const uploadedDoc = docRes.rows[0];

  // ── Step 2: verify employees exist ──────────────────────────────────────
  const empRes = await db.query(
    `SELECT id, first_name, last_name, user_id
     FROM employees
     WHERE id = ANY($1) AND company_id = $2`,
    [employeeIds, companyId],
  );
  if (empRes.rows.length === 0) {
    return res.status(404).json({ message: "No matching employees found." });
  }

  // ── Step 3: insert a documents row for each employee ────────────────────
  // NO transaction, NO notifications — just plain inserts that cannot be
  // rolled back by an unrelated notification failure
  const createdDocs = [];
  for (const emp of empRes.rows) {
    try {
      const insertRes = await db.query(
        `INSERT INTO documents
           (company_id, employee_id, uploaded_doc_id, final_content,
            status, message, file_url, file_name, mime_type,
            created_by, sent_at, created_at)
         VALUES ($1,$2,$3,'',$4,$5,$6,$7,$8,$9,NOW(),NOW())
         RETURNING *`,
        [
          companyId,
          emp.id,
          documentId,
          "sent",
          message ?? null,
          uploadedDoc.file_url,
          uploadedDoc.file_name,
          uploadedDoc.mime_type,
          userId,
        ],
      );
      createdDocs.push(insertRes.rows[0]);
      console.log(
        "[sendUploadedDocument] inserted doc:",
        insertRes.rows[0].id,
        "for employee:",
        emp.id,
      );
    } catch (insertErr) {
      console.error(
        "[sendUploadedDocument] INSERT failed for employee:",
        emp.id,
        {
          message: insertErr.message,
          detail: insertErr.detail,
          code: insertErr.code,
        },
      );
      // continue — try the remaining employees even if one fails
    }
  }

  if (createdDocs.length === 0) {
    return res
      .status(500)
      .json({ message: "Failed to create any document assignments." });
  }

  // ── Step 4: send notifications AFTER commit, completely separate ─────────
  // These are fire-and-forget — a notification failure never affects the docs
  for (const emp of empRes.rows) {
    const doc = createdDocs.find((d) => d.employee_id === emp.id);
    if (!doc || !emp.user_id) continue;

    // Use a fresh connection from the pool — no transaction
    db.query(
      `INSERT INTO notifications (company_id, user_id, type, title, message)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT DO NOTHING`,
      [
        companyId,
        emp.user_id,
        "document",
        `New document: ${uploadedDoc.name}`,
        message
          ? `You have received a document: "${message}". Please review and sign.`
          : `You have received a document that requires your review and signature.`,
      ],
    ).catch((err) =>
      console.warn(
        "[sendUploadedDocument] notification failed (non-fatal):",
        err.message,
      ),
    );
  }

  return res.status(201).json({
    message: `Document sent to ${createdDocs.length} employee(s).`,
    data: createdDocs,
  });
}

export async function getEmployeeDocuments(req, res) {
  const { userId, companyId } = req.user;

  try {
    const empRes = await db.query(
      `SELECT id FROM employees WHERE user_id=$1 AND company_id=$2`,
      [userId, companyId],
    );
    if (empRes.rows.length === 0) {
      return res.status(404).json({ message: "Employee record not found." });
    }
    const employeeId = empRes.rows[0].id;

    const result = await db.query(
      `SELECT
         d.id,
         d.status,
         d.message,
         d.file_name,
         d.mime_type,
         d.file_url,
         d.sent_at,
         d.signed_at,
         d.created_at,
         COALESCE(ud.name, dt.name)         AS document_name,
         COALESCE(ud.category, dt.category) AS category,
         CONCAT(u.first_name,' ',u.last_name) AS sent_by
       FROM documents d
       LEFT JOIN uploaded_documents ud ON ud.id = d.uploaded_doc_id
       LEFT JOIN document_templates dt ON dt.id = d.template_id
       LEFT JOIN users              u  ON u.id  = d.created_by
       WHERE d.employee_id=$1 AND d.company_id=$2
       ORDER BY d.created_at DESC`,
      [employeeId, companyId],
    );

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error("getEmployeeDocuments error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ─────────────────────────────────────────────────────────────
// ADMIN — LIST / GET / SIGN
// ─────────────────────────────────────────────────────────────

// GET /api/documents
// export async function getAllDocuments(req, res) {
//   const { companyId } = req.user;
//   const { employeeId, status, page = 1, limit = 20 } = req.query;
//   const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

//   const conditions = ["d.company_id = $1"];
//   const params     = [companyId];
//   let idx = 2;

//   if (employeeId) { conditions.push(`d.employee_id = $${idx++}`); params.push(employeeId); }
//   if (status)     { conditions.push(`d.status = $${idx++}`);      params.push(status);     }

//   try {
//     const result = await db.query(
//       `SELECT
//          d.*,
//          COALESCE(ud.name, dt.name)         AS template_name,
//          COALESCE(ud.category, dt.category) AS category,
//          CONCAT(e.first_name,' ',e.last_name) AS employee_name
//        FROM documents d
//        LEFT JOIN uploaded_documents ud ON ud.id = d.uploaded_doc_id
//        LEFT JOIN document_templates dt ON dt.id = d.template_id
//        LEFT JOIN employees          e  ON e.id  = d.employee_id
//        WHERE ${conditions.join(" AND ")}
//        ORDER BY d.created_at DESC
//        LIMIT $${idx} OFFSET $${idx + 1}`,
//       [...params, parseInt(limit, 10), offset],
//     );

//     const countRes = await db.query(
//       `SELECT COUNT(*) FROM documents d WHERE ${conditions.join(" AND ")}`,
//       params,
//     );

//     res.setHeader("Cache-Control", "no-store");
//     return res.status(200).json({
//       data:  result.rows,
//       total: parseInt(countRes.rows[0].count, 10),
//     });
//   } catch (err) {
//     console.error("getAllDocuments error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

export async function getAllDocuments(req, res) {
  const { companyId } = req.user;

  // TEMPORARY DEBUG — remove after fixing
  console.log("[getAllDocuments] companyId from token:", companyId);
  const check = await db.query(
    `SELECT id, company_id, status FROM documents ORDER BY created_at DESC LIMIT 5`,
  );
  console.log(
    "[getAllDocuments] latest 5 rows in documents table:",
    JSON.stringify(check.rows, null, 2),
  );

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
         COALESCE(ud.name, dt.name)         AS template_name,
         COALESCE(ud.category, dt.category) AS category,
         CONCAT(e.first_name,' ',e.last_name) AS employee_name
       FROM documents d
       LEFT JOIN uploaded_documents ud ON ud.id = d.uploaded_doc_id
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

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      data: result.rows,
      total: parseInt(countRes.rows[0].count, 10),
    });
  } catch (err) {
    console.error("getAllDocuments error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// GET /api/documents/:id
export async function getDocumentById(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;

  try {
    const result = await db.query(
      `SELECT d.*,
              COALESCE(ud.name, dt.name)         AS template_name,
              COALESCE(ud.category, dt.category) AS category,
              CONCAT(e.first_name,' ',e.last_name) AS employee_name
       FROM documents d
       LEFT JOIN uploaded_documents ud ON ud.id = d.uploaded_doc_id
       LEFT JOIN document_templates dt ON dt.id = d.template_id
       LEFT JOIN employees          e  ON e.id  = d.employee_id
       WHERE d.id=$1 AND d.company_id=$2`,
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

// PUT /api/documents/:id/sign
export async function signDocument(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;
  const { signature } = req.body;

  try {
    const existing = await db.query(
      "SELECT * FROM documents WHERE id=$1 AND company_id=$2",
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
       SET status='signed', signed_at=NOW(), signature=$1, updated_at=NOW()
       WHERE id=$2 RETURNING *`,
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
