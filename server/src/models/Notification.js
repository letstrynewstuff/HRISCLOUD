import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL);

export const createNotification = async (data) => {
  const [notification] = await sql`
    insert into notifications (
      company_id, user_id, title,
      message, type, link
    )
    values (
      ${data.companyId},
      ${data.userId},
      ${data.title},
      ${data.message},
      ${data.type},
      ${data.link}
    )
    returning *
  `;
  return notification;
};

export const markAsRead = async (id) => {
  await sql`
    update notifications
    set is_read = true,
        updated_at = now()
    where id = ${id}
  `;
};