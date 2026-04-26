import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL);

// Create announcement
export const createAnnouncement = async (data) => {
  const [announcement] = await sql`
    insert into announcements (
      company_id,
      title,
      body,
      audience,
      department_id,
      is_pinned,
      publish_at,
      expires_at,
      created_by
    )
    values (
      ${data.companyId},
      ${data.title},
      ${data.body},
      ${data.audience},
      ${data.departmentId || null},
      ${data.isPinned || false},
      ${data.publishAt || null},
      ${data.expiresAt || null},
      ${data.createdBy}
    )
    returning *
  `;

  return announcement;
};

// Get active announcements
export const getActiveAnnouncements = async (companyId) => {
  return await sql`
    select *
    from announcements
    where company_id = ${companyId}
    and (publish_at is null or publish_at <= now())
    and (expires_at is null or expires_at > now())
    order by is_pinned desc, created_at desc
  `;
};

// Increment views
export const incrementAnnouncementViews = async (id) => {
  await sql`
    update announcements
    set views = views + 1
    where id = ${id}
  `;
};
