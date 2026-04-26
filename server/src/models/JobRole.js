import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

/**
 * Create Job Role
 */
export const createJobRole = async (data) => {
  const [jobRole] = await sql`
    insert into job_roles (
      company_id,
      title,
      department_id,
      grade,
      min_salary,
      max_salary,
      description,
      is_active
    )
    values (
      ${data.companyId},
      ${data.title},
      ${data.departmentId},
      ${data.grade},
      ${data.minSalary},
      ${data.maxSalary},
      ${data.description},
      ${data.isActive ?? true}
    )
    returning *
  `;

  return jobRole;
};

/**
 * Get Job Role by ID
 */
export const getJobRoleById = async (id) => {
  const [jobRole] = await sql`
    select * from job_roles where id = ${id}
  `;
  return jobRole;
};

/**
 * Get All Job Roles for Company
 */
export const getJobRolesByCompany = async (companyId) => {
  return await sql`
    select * from job_roles
    where company_id = ${companyId}
    order by created_at desc
  `;
};

/**
 * Update Job Role
 */
export const updateJobRole = async (id, data) => {
  const [jobRole] = await sql`
    update job_roles
    set
      title = ${data.title},
      department_id = ${data.departmentId},
      grade = ${data.grade},
      min_salary = ${data.minSalary},
      max_salary = ${data.maxSalary},
      description = ${data.description},
      is_active = ${data.isActive},
      updated_at = now()
    where id = ${id}
    returning *
  `;

  return jobRole;
};

/**
 * Soft Delete Job Role
 */
export const deactivateJobRole = async (id) => {
  const [jobRole] = await sql`
    update job_roles
    set is_active = false,
        updated_at = now()
    where id = ${id}
    returning *
  `;

  return jobRole;
};
