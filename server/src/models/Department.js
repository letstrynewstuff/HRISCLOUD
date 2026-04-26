import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

/**
 * Create Department
 */
export const createDepartment = async (data) => {
  const [department] = await sql`
    insert into departments (
      company_id,
      name,
      description,
      head_id,
      parent_department_id,
      is_active
    )
    values (
      ${data.companyId},
      ${data.name},
      ${data.description},
      ${data.headId},
      ${data.parentDepartmentId},
      ${data.isActive ?? true}
    )
    returning *
  `;

  return department;
};

/**
 * Get Department by ID
 */
export const getDepartmentById = async (id) => {
  const [department] = await sql`
    select * from departments where id = ${id}
  `;
  return department;
};

/**
 * Get All Departments for Company
 */
export const getDepartmentsByCompany = async (companyId) => {
  return await sql`
    select * from departments
    where company_id = ${companyId}
    order by created_at desc
  `;
};

/**
 * Update Department
 */
export const updateDepartment = async (id, data) => {
  const [department] = await sql`
    update departments
    set
      name = ${data.name},
      description = ${data.description},
      head_id = ${data.headId},
      parent_department_id = ${data.parentDepartmentId},
      is_active = ${data.isActive},
      updated_at = now()
    where id = ${id}
    returning *
  `;

  return department;
};

/**
 * Soft Delete Department
 */
export const deactivateDepartment = async (id) => {
  const [department] = await sql`
    update departments
    set is_active = false,
        updated_at = now()
    where id = ${id}
    returning *
  `;

  return department;
};
