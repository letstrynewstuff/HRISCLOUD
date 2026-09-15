

// src/controllers/chat.controller.js
//
// Multi-tenant SaaS — every query is scoped by company_id.
// req.user = { userId, companyId, role }
//
// Tenant isolation strategy:
//   • getEmployeeId()       — resolves userId → employeeId, verifies company ownership
//   • assertChannelAccess() — verifies channel belongs to company AND caller is active member
//   • assertSameCompany()   — prevents cross-company DM targeting
//   • All INSERT statements include company_id
//   • All SELECT / UPDATE / DELETE include company_id in WHERE
//   • Socket.io rooms keyed as `${companyId}:${channelId}`

import { db }            from "../config/db.js";
import { uploadToCloud } from "../utils/upload.js";
import { io }            from "../server.js";

// ═══════════════════════════════════════════════════════════════════════════════
// INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Resolves userId → employeeId, scoped to company.
 * Throws a typed 403 if the user has no employee record in this company.
 */
async function getEmployeeId(userId, companyId) {
  const { rows } = await db.query(
    `SELECT id FROM employees
     WHERE user_id   = $1
       AND company_id = $2
     LIMIT 1`,
    [userId, companyId],
  );
  if (!rows.length) {
    const err  = new Error("Employee profile not found for this company.");
    err.status = 403;
    throw err;
  }
  return rows[0].id;
}

/**
 * Verifies in ONE query:
 *   1. The channel exists and belongs to this company.
 *   2. The caller (employeeId) is an active member.
 * Returns the channel row.
 * Throws a typed 403 on any failure (intentionally vague to avoid enumeration).
 */
async function assertChannelAccess(channelId, employeeId, companyId) {
  const { rows } = await db.query(
    `SELECT tc.id, tc.name, tc.type, tc.is_active,
            tc.created_by, tc.company_id, tc.description, tc.created_at
     FROM team_channels tc
     JOIN channel_members cm
       ON  cm.channel_id  = tc.id
       AND cm.employee_id = $2
       AND cm.is_active   = true
       AND cm.company_id  = $3
     WHERE tc.id         = $1
       AND tc.company_id = $3
     LIMIT 1`,
    [channelId, employeeId, companyId],
  );
  if (!rows.length) {
    const err  = new Error("Not a member of this channel.");
    err.status = 403;
    throw err;
  }
  return rows[0];
}

/**
 * Verifies a target employee exists in the same company.
 * Returns the employee + user row on success, throws typed 403 on failure.
 */
async function assertSameCompanyEmployee(employeeId, companyId) {
  const { rows } = await db.query(
    `SELECT e.id, u.first_name, u.last_name, jr.title AS role
     FROM employees e
     JOIN users u ON u.id = e.user_id
     LEFT JOIN job_roles jr ON jr.id = e.job_role_id
     WHERE e.id         = $1
       AND e.company_id = $2
     LIMIT 1`,
    [employeeId, companyId],
  );
  if (!rows.length) {
    const err  = new Error("Target employee not found in this company.");
    err.status = 403;
    throw err;
  }
  return rows[0];
}

/** Socket.io room — always namespaced by company to prevent cross-tenant leakage. */
const room = (companyId, channelId) => `${companyId}:${channelId}`;

// ── Response formatters ────────────────────────────────────────────────────────

function formatChannel(row, memberCount = 0) {
  return {
    id:          row.id,
    name:        row.name,
    description: row.description ?? "",
    type:        row.type,
    createdBy:   row.created_by,
    isActive:    row.is_active,
    createdAt:   row.created_at,
    memberCount: Number(memberCount ?? 0),
  };
}

function formatMessage(row) {
  return {
    id:          row.id,
    channelId:   row.channel_id,
    senderId:    row.sender_id,
    senderName:  row.sender_name ?? "Unknown",
    contentType: row.content_type,
    body:        row.is_deleted ? null : (row.body     ?? ""),
    fileUrl:     row.is_deleted ? null : (row.file_url ?? null),
    fileName:    row.file_name  ?? null,
    fileSize:    row.file_size  ? Number(row.file_size) : null,
    fileMime:    row.file_mime  ?? null,
    isDeleted:   row.is_deleted ?? false,
    createdAt:   row.created_at,
  };
}

// ── Shared error responder ─────────────────────────────────────────────────────
function handleError(err, res, next) {
  if (err.status) return res.status(err.status).json({ message: err.message });
  next(err);
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUP CHANNELS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/chat/channels
export async function listChannels(req, res, next) {
  try {
    const { userId, companyId } = req.user;
    const employeeId = await getEmployeeId(userId, companyId);

    const { rows } = await db.query(
      `SELECT
         tc.*,
         (
           SELECT COUNT(*)::int
           FROM   channel_members cnt
           WHERE  cnt.channel_id = tc.id
             AND  cnt.is_active  = true
             AND  cnt.company_id = $2
         ) AS member_count
       FROM team_channels tc
       JOIN channel_members my_mem
         ON  my_mem.channel_id  = tc.id
         AND my_mem.employee_id = $1
         AND my_mem.is_active   = true
         AND my_mem.company_id  = $2
       WHERE tc.type       = 'group'
         AND tc.company_id = $2
       ORDER BY tc.created_at DESC`,
      [employeeId, companyId],
    );

    return res.json({
      channels: rows.map((r) => formatChannel(r, r.member_count)),
    });
  } catch (err) {
    handleError(err, res, next);
  }
}

// POST /api/chat/channels  (manager only — enforced in route middleware)
export async function createChannel(req, res, next) {
  const client = await db.getClient();
  try {
    const { userId, companyId } = req.user;
    const employeeId = await getEmployeeId(userId, companyId);
    const { name, description, memberIds = [] } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Channel name required." });
    }

    // Validate all memberIds belong to the same company before any writes
    if (memberIds.length) {
      const { rows: validEmps } = await db.query(
        `SELECT id FROM employees
         WHERE id = ANY($1::uuid[])
           AND company_id = $2`,
        [memberIds, companyId],
      );
      if (validEmps.length !== memberIds.length) {
        return res.status(400).json({
          message: "One or more selected employees do not belong to this company.",
        });
      }
    }

    await client.query("BEGIN");

    const { rows: chanRows } = await client.query(
      `INSERT INTO team_channels
         (name, description, type, created_by, company_id, is_active)
       VALUES ($1, $2, 'group', $3, $4, true)
       RETURNING *`,
      [name.trim(), description?.trim() ?? "", employeeId, companyId],
    );

    const channel    = chanRows[0];
    const allMembers = [...new Set([employeeId, ...memberIds])];

    for (const empId of allMembers) {
      await client.query(
        `INSERT INTO channel_members (channel_id, employee_id, company_id, is_active)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (channel_id, employee_id) DO UPDATE SET is_active = true`,
        [channel.id, empId, companyId],
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      channel: formatChannel(channel, allMembers.length),
    });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    handleError(err, res, next);
  } finally {
    client.release();
  }
}

// GET /api/chat/channels/:id
export async function getChannel(req, res, next) {
  try {
    const { id }              = req.params;
    const { userId, companyId } = req.user;
    const employeeId = await getEmployeeId(userId, companyId);

    // Single query: verifies company ownership + membership
    const channel = await assertChannelAccess(id, employeeId, companyId);

    const { rows: members } = await db.query(
      `SELECT
         u.id          AS user_id,
         e.id          AS employee_id,
         u.first_name,
         u.last_name,
         jr.title      AS role
       FROM channel_members cm
       JOIN employees e ON e.id = cm.employee_id AND e.company_id = $2
       JOIN users     u ON u.id = e.user_id
       LEFT JOIN job_roles jr ON jr.id = e.job_role_id
       WHERE cm.channel_id = $1
         AND cm.is_active  = true
         AND cm.company_id = $2
       ORDER BY u.first_name, u.last_name`,
      [id, companyId],
    );

    return res.json({
      channel: formatChannel(channel),
      members: members.map((m) => ({
        userId:     m.user_id,
        employeeId: m.employee_id,
        name:       `${m.first_name} ${m.last_name}`,
        role:       m.role ?? "Employee",
      })),
    });
  } catch (err) {
    handleError(err, res, next);
  }
}

// PUT /api/chat/channels/:id/close  (manager only — enforced in route)
export async function closeChannel(req, res, next) {
  try {
    const { id }        = req.params;
    const { companyId } = req.user;

    const { rowCount } = await db.query(
      `UPDATE team_channels
       SET is_active = false
       WHERE id = $1 AND company_id = $2`,
      [id, companyId],
    );

    if (!rowCount) {
      return res.status(404).json({ message: "Channel not found." });
    }

    io.to(room(companyId, id)).emit("channel_closed", { channelId: id });
    return res.json({ message: "Channel closed." });
  } catch (err) {
    handleError(err, res, next);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEMBERS  (manager only — enforced in route middleware)
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/chat/channels/:id/members
// Body: { employeeIds: uuid[] }
export async function addMembers(req, res, next) {
  try {
    const { id }               = req.params;
    const { companyId }        = req.user;
    const { employeeIds = [] } = req.body;

    if (!employeeIds.length) {
      return res.status(400).json({ message: "No employees provided." });
    }

    // Verify channel belongs to this company
    const { rows: chanRows } = await db.query(
      `SELECT id FROM team_channels
       WHERE id = $1 AND company_id = $2 LIMIT 1`,
      [id, companyId],
    );
    if (!chanRows.length) {
      return res.status(404).json({ message: "Channel not found." });
    }

    // Validate every employee belongs to the same company
    const { rows: validEmps } = await db.query(
      `SELECT id FROM employees
       WHERE id = ANY($1::uuid[]) AND company_id = $2`,
      [employeeIds, companyId],
    );
    if (validEmps.length !== employeeIds.length) {
      return res.status(400).json({
        message: "One or more employees do not belong to this company.",
      });
    }

    for (const empId of employeeIds) {
      await db.query(
        `INSERT INTO channel_members (channel_id, employee_id, company_id, is_active)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (channel_id, employee_id) DO UPDATE SET is_active = true`,
        [id, empId, companyId],
      );
    }

    io.to(room(companyId, id)).emit("members_updated", { channelId: id });
    return res.json({ message: `${employeeIds.length} member(s) added.` });
  } catch (err) {
    handleError(err, res, next);
  }
}

// DELETE /api/chat/channels/:id/members/:empId  (manager only)
export async function removeMember(req, res, next) {
  try {
    const { id, empId } = req.params;
    const { companyId } = req.user;

    // Update scoped by company via JOIN — prevents removing members from another tenant's channel
    const { rowCount } = await db.query(
      `UPDATE channel_members cm
       SET    is_active = false
       FROM   team_channels tc
       WHERE  tc.id         = cm.channel_id
         AND  tc.company_id = $3
         AND  cm.channel_id = $1
         AND  cm.employee_id = $2`,
      [id, empId, companyId],
    );

    if (!rowCount) {
      return res.status(404).json({ message: "Member not found in this channel." });
    }

    io.to(room(companyId, id)).emit("members_updated", { channelId: id });
    return res.json({ message: "Member removed." });
  } catch (err) {
    handleError(err, res, next);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DIRECT MESSAGES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/chat/dm/list
export async function listDMs(req, res, next) {
  try {
    const { userId, companyId } = req.user;
    const employeeId = await getEmployeeId(userId, companyId);

    const { rows } = await db.query(
      `SELECT
         tc.id,
         other_e.id         AS other_employee_id,
         other_u.first_name,
         other_u.last_name,
         jr.title           AS other_role,
         (
           SELECT msg.body
           FROM   channel_messages msg
           WHERE  msg.channel_id = tc.id
             AND  msg.is_deleted = false
             AND  msg.company_id = $2
           ORDER BY msg.created_at DESC
           LIMIT 1
         ) AS last_message,
         (
           SELECT msg2.created_at
           FROM   channel_messages msg2
           WHERE  msg2.channel_id = tc.id
             AND  msg2.company_id = $2
           ORDER BY msg2.created_at DESC
           LIMIT 1
         ) AS last_at
       FROM team_channels tc
       JOIN channel_members my_dm
         ON  my_dm.channel_id  = tc.id
         AND my_dm.employee_id = $1
         AND my_dm.is_active   = true
         AND my_dm.company_id  = $2
       JOIN channel_members other_dm
         ON  other_dm.channel_id  = tc.id
         AND other_dm.employee_id != $1
         AND other_dm.is_active   = true
         AND other_dm.company_id  = $2
       JOIN employees other_e
         ON  other_e.id         = other_dm.employee_id
         AND other_e.company_id = $2
       JOIN users other_u
         ON  other_u.id = other_e.user_id
       LEFT JOIN job_roles jr ON jr.id = other_e.job_role_id
       WHERE tc.type       = 'direct'
         AND tc.company_id = $2
       ORDER BY last_at DESC NULLS LAST`,
      [employeeId, companyId],
    );

    return res.json({
      dms: rows.map((r) => ({
        id:              r.id,
        otherEmployeeId: r.other_employee_id,
        otherName:       `${r.first_name} ${r.last_name}`,
        otherRole:       r.other_role   ?? "Employee",
        lastMessage:     r.last_message ?? null,
        lastAt:          r.last_at      ?? null,
      })),
    });
  } catch (err) {
    handleError(err, res, next);
  }
}

// POST /api/chat/dm/:targetEmployeeId
// Opens or creates a 1-on-1 DM channel.
// Returns { channel: { id, type, isActive }, targetEmployee, messages }
//
// CRITICAL: Response uses `channel: { id }` — NOT `channelId` — so the frontend
// correctly sets active.channelId via `res.channel.id`, fixing the 403 on sendMessage.
export async function openOrCreateDM(req, res, next) {
  const client = await db.getClient();
  try {
    const { userId, companyId }  = req.user;
    // Route param may be :targetEmployeeId or legacy :targetUserId
    const targetEmployeeId = req.params.targetEmployeeId ?? req.params.targetUserId;

    const employeeId = await getEmployeeId(userId, companyId);

    if (targetEmployeeId === employeeId) {
      return res.status(400).json({ message: "You cannot DM yourself." });
    }

    // Cross-company protection — throws 403 if target is in another company
    const targetEmpRow = await assertSameCompanyEmployee(targetEmployeeId, companyId);

    // Find existing DM channel between these two employees, scoped to company
    const { rows: existing } = await client.query(
      `SELECT tc.id
       FROM team_channels tc
       JOIN channel_members cm_me
         ON  cm_me.channel_id  = tc.id
         AND cm_me.employee_id = $1
         AND cm_me.is_active   = true
         AND cm_me.company_id  = $3
       JOIN channel_members cm_other
         ON  cm_other.channel_id  = tc.id
         AND cm_other.employee_id = $2
         AND cm_other.is_active   = true
         AND cm_other.company_id  = $3
       WHERE tc.type       = 'direct'
         AND tc.company_id = $3
       LIMIT 1`,
      [employeeId, targetEmployeeId, companyId],
    );

    let channelId = existing[0]?.id ?? null;

    if (!channelId) {
      // Create new DM channel within a transaction
      await client.query("BEGIN");

      const { rows: chanRows } = await client.query(
        `INSERT INTO team_channels
           (name, type, created_by, company_id, is_active)
         VALUES ($1, 'direct', $2, $3, true)
         RETURNING id`,
        [`DM:${employeeId}:${targetEmployeeId}`, employeeId, companyId],
      );

      channelId = chanRows[0].id;

      // Both membership rows carry company_id
      await client.query(
        `INSERT INTO channel_members (channel_id, employee_id, company_id, is_active)
         VALUES ($1, $2, $4, true),
                ($1, $3, $4, true)
         ON CONFLICT (channel_id, employee_id) DO UPDATE SET is_active = true`,
        [channelId, employeeId, targetEmployeeId, companyId],
      );

      await client.query("COMMIT");
    }

    // Fetch last 50 messages, scoped to company
    const { rows: msgRows } = await db.query(
      `SELECT m.*, CONCAT(u.first_name, ' ', u.last_name) AS sender_name
       FROM channel_messages m
       JOIN employees e ON e.id = m.sender_id AND e.company_id = $2
       JOIN users     u ON u.id = e.user_id
       WHERE m.channel_id = $1
         AND m.company_id = $2
       ORDER BY m.created_at DESC
       LIMIT 50`,
      [channelId, companyId],
    );

    return res.json({
      // channel.id is what the frontend reads as active.channelId
      channel: {
        id:       channelId,
        type:     "direct",
        isActive: true,
      },
      targetEmployee: {
        id:         targetEmployeeId,
        employeeId: targetEmployeeId,
        name:       `${targetEmpRow.first_name} ${targetEmpRow.last_name}`,
        role:       targetEmpRow.role ?? "Employee",
      },
      messages: msgRows.reverse().map(formatMessage),
    });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    handleError(err, res, next);
  } finally {
    client.release();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/chat/channels/:id/messages
export async function getMessages(req, res, next) {
  try {
    const { id }              = req.params;
    const { userId, companyId } = req.user;
    const limit = Math.min(100, parseInt(req.query.limit ?? "50", 10));

    const employeeId = await getEmployeeId(userId, companyId);

    // Verifies company ownership + active membership in one query
    await assertChannelAccess(id, employeeId, companyId);

    const { rows } = await db.query(
      `SELECT m.*, CONCAT(u.first_name, ' ', u.last_name) AS sender_name
       FROM channel_messages m
       JOIN employees e ON e.id = m.sender_id AND e.company_id = $2
       JOIN users     u ON u.id = e.user_id
       WHERE m.channel_id = $1
         AND m.company_id = $2
       ORDER BY m.created_at DESC
       LIMIT $3`,
      [id, companyId, limit],
    );

    return res.json({ messages: rows.reverse().map(formatMessage) });
  } catch (err) {
    handleError(err, res, next);
  }
}

// POST /api/chat/channels/:id/messages
// Handles plain text and optional file upload (multer applied in route)
export async function sendMessage(req, res, next) {
  try {
    const { id }              = req.params;
    const { userId, companyId } = req.user;
    const body = req.body?.body?.trim() ?? "";

    if (!body && !req.file) {
      return res.status(400).json({ message: "Message body or file is required." });
    }

    const employeeId = await getEmployeeId(userId, companyId);

    // Verifies company ownership + active membership — throws typed 403 on failure
    const channel = await assertChannelAccess(id, employeeId, companyId);

    if (!channel.is_active) {
      return res.status(403).json({ message: "This channel is closed." });
    }

    // Handle optional file upload
    let fileUrl = null, fileName = null, fileSize = null, fileMime = null;
    if (req.file) {
      const upload = await uploadToCloud(req.file.path ?? req.file.buffer, "chat");
      fileUrl  = upload.url;
      fileName = req.file.originalname;
      fileSize = req.file.size;
      fileMime = req.file.mimetype;
    }

    const { rows: msgRows } = await db.query(
      `INSERT INTO channel_messages
         (channel_id, sender_id, company_id, content_type, body,
          file_url, file_name, file_size, file_mime)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        id,
        employeeId,
        companyId,
        req.file ? "document" : "text",
        body || null,
        fileUrl,
        fileName,
        fileSize,
        fileMime,
      ],
    );

    const { rows: senderRows } = await db.query(
      `SELECT u.first_name, u.last_name
       FROM employees e
       JOIN users u ON u.id = e.user_id
       WHERE e.id = $1 AND e.company_id = $2
       LIMIT 1`,
      [employeeId, companyId],
    );

    const formatted = {
      ...formatMessage(msgRows[0]),
      senderName: senderRows[0]
        ? `${senderRows[0].first_name} ${senderRows[0].last_name}`
        : "Unknown",
    };

    // Broadcast only to this company's channel room
    io.to(room(companyId, id)).emit("new_message", formatted);

    return res.status(201).json({ message: formatted });
  } catch (err) {
    handleError(err, res, next);
  }
}

// DELETE /api/chat/messages/:id
export async function deleteMessage(req, res, next) {
  try {
    const { id }                      = req.params;
    const { userId, companyId, role } = req.user;
    const employeeId = await getEmployeeId(userId, companyId);

    // Scoped to company — prevents cross-tenant message visibility
    const { rows: msgRows } = await db.query(
      `SELECT sender_id, channel_id
       FROM channel_messages
       WHERE id = $1 AND company_id = $2
       LIMIT 1`,
      [id, companyId],
    );

    if (!msgRows.length) {
      return res.status(404).json({ message: "Message not found." });
    }

    const { sender_id, channel_id } = msgRows[0];

    const canDelete =
      sender_id === employeeId ||
      ["hr_admin", "super_admin"].includes(role);

    if (!canDelete) {
      return res.status(403).json({ message: "Not allowed to delete this message." });
    }

    await db.query(
      `UPDATE channel_messages
       SET is_deleted = true
       WHERE id = $1 AND company_id = $2`,
      [id, companyId],
    );

    io.to(room(companyId, channel_id)).emit("message_deleted", {
      messageId: id,
      channelId: channel_id,
    });

    return res.json({ message: "Deleted." });
  } catch (err) {
    handleError(err, res, next);
  }
}