import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL);

export const createAuditLog = async (data) => {
  await sql`
    insert into audit_logs (
      company_id,
      user_id,
      action,
      entity,
      entity_id,
      before,
      after,
      ip_address,
      user_agent
    )
    values (
      ${data.companyId},
      ${data.userId},
      ${data.action},
      ${data.entity},
      ${data.entityId},
      ${sql.json(data.before || null)},
      ${sql.json(data.after || null)},
      ${data.ipAddress},
      ${data.userAgent}
    )
  `;
};