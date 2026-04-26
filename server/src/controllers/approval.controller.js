// src/controllers/approval.controller.js
//
// Endpoints:
//   GET  /api/approvals          → list (HR)
//   GET  /api/approvals/:id      → detail (HR)
//   PUT  /api/approvals/:id/approve
//   PUT  /api/approvals/:id/reject
//
// Approval types handled:
//   profile_update  → patch employees row
//   leave_request   → approve via leave flow
//   payroll         → mark payroll approved
//   document        → allow document to be sent
//   goal_update     → patch goals row
//   custom          → no automatic action

import { db } from "../config/db.js";

// ─── Helper: apply the change for a given type ────────────────
async function applyApproval(client, approval) {
  const { type, entity_id, metadata } = approval;

  switch (type) {
    case "profile_update": {
      // metadata.changes is an object of snake_case column → value
      const changes = metadata?.changes ?? {};
      const keys = Object.keys(changes);
      if (keys.length === 0) break;

      const setClauses = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
      const values = [entity_id, ...keys.map((k) => changes[k])];

      await client.query(
        `UPDATE employees SET ${setClauses}, updated_at = NOW() WHERE id = $1`,
        values,
      );
      break;
    }

    case "leave_request": {
      await client.query(
        `UPDATE leaves
         SET status = 'approved', approved_at = NOW()
         WHERE id = $1`,
        [entity_id],
      );
      break;
    }

    case "payroll": {
      await client.query(
        `UPDATE payroll_runs
         SET status = 'approved', approved_at = NOW()
         WHERE id = $1`,
        [entity_id],
      );
      break;
    }

    case "document": {
      await client.query(
        `UPDATE documents SET status = 'approved', updated_at = NOW() WHERE id = $1`,
        [entity_id],
      );
      break;
    }

    case "goal_update": {
      const changes = metadata?.changes ?? {};
      const keys = Object.keys(changes);
      if (keys.length === 0) break;

      const setClauses = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
      const values = [entity_id, ...keys.map((k) => changes[k])];

      await client.query(
        `UPDATE goals SET ${setClauses}, updated_at = NOW() WHERE id = $1`,
        values,
      );
      break;
    }

    default:
      // custom — no automatic DB action
      break;
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/approvals
// Query: ?status=pending&type=leave_request&page=1&limit=20
// ══════════════════════════════════════════════════════════════
// export async function getApprovals(req, res) {
//   const { companyId } = req.user;
//   const { status = "pending", type, page = 1, limit = 20 } = req.query;

//   const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
//   const conditions = ["a.company_id = $1"];
//   const params = [companyId];
//   let idx = 2;

//   if (status) {
//     conditions.push(`a.status = $${idx++}`);
//     params.push(status);
//   }
//   if (type) {
//     conditions.push(`a.type = $${idx++}`);
//     params.push(type);
//   }

//   try {
//     const [rows, countRes] = await Promise.all([
//       db.query(
//         `SELECT
//            a.*,
//            u.email          AS requester_email,
//            CONCAT(e.first_name,' ',e.last_name) AS requester_name
//          FROM approvals a
//          LEFT JOIN users     u ON u.id = a.requested_by
//          LEFT JOIN employees e ON e.user_id = a.requested_by
//                                AND e.company_id = a.company_id
//          WHERE ${conditions.join(" AND ")}
//          ORDER BY a.created_at DESC
//          LIMIT $${idx} OFFSET $${idx + 1}`,
//         [...params, parseInt(limit, 10), offset],
//       ),
//       db.query(
//         `SELECT COUNT(*) FROM approvals a WHERE ${conditions.join(" AND ")}`,
//         params,
//       ),
//     ]);

//     return res.status(200).json({
//       data: rows.rows,
//       total: parseInt(countRes.rows[0].count, 10),
//       page: parseInt(page, 10),
//       limit: parseInt(limit, 10),
//     });
//   } catch (err) {
//     console.error("getApprovals error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

export async function getApprovals(req, res) {
  const { companyId, isHR, employeeId: managerEmpId } = req.user;
  const { status = "pending", type, page = 1, limit = 20 } = req.query;

  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const conditions = ["a.company_id = $1"];
  const params = [companyId];
  let idx = 2;

  if (status) {
    conditions.push(`a.status = $${idx++}`);
    params.push(status);
  }
  if (type) {
    conditions.push(`a.type = $${idx++}`);
    params.push(type);
  }

  // ── MANAGER SCOPE ─────────────────────────────────────────────────────────
  // If the caller is a manager (not HR), restrict to approvals from their
  // direct reports only. We join employees to check manager_id.
  if (!isHR && managerEmpId) {
    conditions.push(`
      EXISTS (
        SELECT 1 FROM employees emp_check
        WHERE emp_check.user_id    = a.requested_by
          AND emp_check.company_id = a.company_id
          AND emp_check.manager_id = $${idx}
      )
    `);
    params.push(managerEmpId);
    idx++;
  }
  // ──────────────────────────────────────────────────────────────────────────

  try {
    const [rows, countRes] = await Promise.all([
      db.query(
        `SELECT
           a.*,
           u.email          AS requester_email,
           CONCAT(e.first_name,' ',e.last_name) AS requester_name
         FROM approvals a
         LEFT JOIN users     u ON u.id = a.requested_by
         LEFT JOIN employees e ON e.user_id = a.requested_by
                               AND e.company_id = a.company_id
         WHERE ${conditions.join(" AND ")}
         ORDER BY a.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, parseInt(limit, 10), offset],
      ),
      db.query(
        `SELECT COUNT(*) FROM approvals a WHERE ${conditions.join(" AND ")}`,
        params,
      ),
    ]);

    return res.status(200).json({
      data: rows.rows,
      total: parseInt(countRes.rows[0].count, 10),
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  } catch (err) {
    console.error("getApprovals error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/approvals/:id
// FIX: managers can only view approvals from their direct reports
// ══════════════════════════════════════════════════════════════
export async function getApprovalById(req, res) {
  const { id } = req.params;
  const { companyId, isHR, employeeId: managerEmpId } = req.user;

  try {
    const result = await db.query(
      `SELECT
         a.*,
         u.email          AS requester_email,
         CONCAT(e.first_name,' ',e.last_name) AS requester_name,
         rv.email         AS reviewer_email
       FROM approvals a
       LEFT JOIN users     u  ON u.id  = a.requested_by
       LEFT JOIN employees e  ON e.user_id = a.requested_by AND e.company_id = a.company_id
       LEFT JOIN users     rv ON rv.id = a.reviewed_by
       WHERE a.id = $1 AND a.company_id = $2`,
      [id, companyId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Approval not found." });
    }

    const approval = result.rows[0];

    // Manager guard: verify the requester is one of their direct reports
    if (!isHR && managerEmpId) {
      const ownerCheck = await db.query(
        `SELECT 1 FROM employees
         WHERE user_id    = $1
           AND company_id = $2
           AND manager_id = $3
         LIMIT 1`,
        [approval.requested_by, companyId, managerEmpId],
      );
      if (ownerCheck.rows.length === 0) {
        return res.status(403).json({
          message: "You do not have access to this approval.",
        });
      }
    }

    return res.status(200).json({ data: approval });
  } catch (err) {
    console.error("getApprovalById error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}
 

// ══════════════════════════════════════════════════════════════
// GET /api/approvals/:id
// ══════════════════════════════════════════════════════════════
// export async function getApprovalById(req, res) {
//   const { id } = req.params;
//   const { companyId } = req.user;

//   try {
//     const result = await db.query(
//       `SELECT
//          a.*,
//          u.email          AS requester_email,
//          CONCAT(e.first_name,' ',e.last_name) AS requester_name,
//          rv.email         AS reviewer_email
//        FROM approvals a
//        LEFT JOIN users     u  ON u.id  = a.requested_by
//        LEFT JOIN employees e  ON e.user_id = a.requested_by AND e.company_id = a.company_id
//        LEFT JOIN users     rv ON rv.id = a.reviewed_by
//        WHERE a.id = $1 AND a.company_id = $2`,
//       [id, companyId],
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Approval not found." });
//     }

//     return res.status(200).json({ data: result.rows[0] });
//   } catch (err) {
//     console.error("getApprovalById error:", err);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

// ══════════════════════════════════════════════════════════════
// PUT /api/approvals/:id/approve
// ══════════════════════════════════════════════════════════════
export async function approveApproval(req, res) {
  const { id } = req.params;
  const { companyId, userId } = req.user;

  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    const result = await client.query(
      `SELECT * FROM approvals WHERE id = $1 AND company_id = $2 FOR UPDATE`,
      [id, companyId],
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Approval not found." });
    }

    const approval = result.rows[0];

    if (approval.status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: `Cannot approve — current status is "${approval.status}".`,
      });
    }

    // Apply the underlying change
    await applyApproval(client, approval);

    // Mark approval as approved
    const updated = await client.query(
      `UPDATE approvals
       SET status = 'approved', reviewed_by = $1, reviewed_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [userId, id],
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Approved successfully.",
      data: updated.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("approveApproval error:", err);
    return res.status(500).json({ message: "Server error during approval." });
  } finally {
    client.release();
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/approvals/:id/reject
// Body: { reason }
// ══════════════════════════════════════════════════════════════
export async function rejectApproval(req, res) {
  const { id } = req.params;
  const { companyId, userId } = req.user;
  const { reason } = req.body;

  if (!reason?.trim()) {
    return res.status(400).json({ message: "A rejection reason is required." });
  }

  try {
    const result = await db.query(
      `SELECT * FROM approvals WHERE id = $1 AND company_id = $2`,
      [id, companyId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Approval not found." });
    }

    if (result.rows[0].status !== "pending") {
      return res.status(409).json({
        message: `Cannot reject — current status is "${result.rows[0].status}".`,
      });
    }

    const updated = await db.query(
      `UPDATE approvals
       SET
         status      = 'rejected',
         reviewed_by = $1,
         reviewed_at = NOW(),
         metadata    = metadata || $2::jsonb
       WHERE id = $3
       RETURNING *`,
      [userId, JSON.stringify({ rejectionReason: reason }), id],
    );

    return res.status(200).json({
      message: "Rejected.",
      data: updated.rows[0],
    });
  } catch (err) {
    console.error("rejectApproval error:", err);
    return res.status(500).json({ message: "Server error during rejection." });
  }
}

// ══════════════════════════════════════════════════════════════
// Utility: createApproval (used internally by other controllers)
// ══════════════════════════════════════════════════════════════
export async function createApproval(
  client,
  { companyId, type, entityId, requestedBy, metadata = {} },
) {
  const result = await client.query(
    `INSERT INTO approvals
       (company_id, type, entity_id, requested_by, status, metadata, created_at)
     VALUES ($1, $2, $3, $4, 'pending', $5, NOW())
     RETURNING id`,
    [companyId, type, entityId, requestedBy, JSON.stringify(metadata)],
  );
  return result.rows[0];
}
