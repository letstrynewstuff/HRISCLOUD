import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL);

export const createTraining = async (data) => {
  const [training] = await sql`
    insert into trainings (
      company_id, title, type, provider, description,
      start_date, end_date, location, link,
      cost, max_attendees, assigned_to,
      certificate_template, created_by
    )
    values (
      ${data.companyId},
      ${data.title},
      ${data.type},
      ${data.provider},
      ${data.description},
      ${data.startDate},
      ${data.endDate},
      ${data.location},
      ${data.link},
      ${data.cost},
      ${data.maxAttendees},
      ${data.assignedTo || []},
      ${data.certificateTemplate},
      ${data.createdBy}
    )
    returning *
  `;
  return training;
};