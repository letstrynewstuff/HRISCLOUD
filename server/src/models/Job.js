import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL);

// Create job
export const createJob = async (data) => {
  const [job] = await sql`
    insert into jobs (
      company_id,
      title,
      department_id,
      type,
      location,
      is_remote,
      min_salary,
      max_salary,
      description,
      requirements,
      deadline,
      status,
      created_by
    )
    values (
      ${data.companyId},
      ${data.title},
      ${data.departmentId || null},
      ${data.type},
      ${data.location},
      ${data.isRemote || false},
      ${data.minSalary || null},
      ${data.maxSalary || null},
      ${data.description},
      ${data.requirements},
      ${data.deadline || null},
      ${data.status || "draft"},
      ${data.createdBy}
    )
    returning *
  `;

  return job;
};

// Get open jobs
export const getOpenJobs = async (companyId) => {
  return await sql`
    select *
    from jobs
    where company_id = ${companyId}
    and status = 'open'
    and (deadline is null or deadline >= current_date)
    order by created_at desc
  `;
};

// Update job status
export const updateJobStatus = async (id, status) => {
  const [job] = await sql`
    update jobs
    set status = ${status},
        updated_at = now()
    where id = ${id}
    returning *
  `;

  return job;
};
