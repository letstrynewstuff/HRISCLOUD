import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

/**
 * Create Employee
 */
export const createEmployee = async (data) => {
  const [employee] = await sql`
    insert into employees (
      company_id,
      user_id,
      employee_code,
      first_name,
      last_name,
      middle_name,
      date_of_birth,
      gender,
      marital_status,
      phone,
      personal_email,
      address,
      state,
      nationality,
      nin,
      bvn,
      passport,
      nok_name,
      nok_relationship,
      nok_phone,
      nok_address,
      department_id,
      job_role_id,
      manager_id,
      employment_type,
      employment_status,
      start_date,
      confirmation_date,
      termination_date,
      termination_reason,
      location,
      basic_salary,
      pay_grade,
      bank_name,
      account_number,
      account_name,
      pension_pin,
      tax_id,
      avatar,
      bio,
      is_onboarded
    )
    values (
      ${data.companyId},
      ${data.userId},
      ${data.employeeId},
      ${data.firstName},
      ${data.lastName},
      ${data.middleName},
      ${data.dateOfBirth},
      ${data.gender},
      ${data.maritalStatus},
      ${data.phone},
      ${data.personalEmail},
      ${data.address},
      ${data.state},
      ${data.nationality},
      ${data.nin},
      ${data.bvn},
      ${data.passport},
      ${data.nextOfKin?.name},
      ${data.nextOfKin?.relationship},
      ${data.nextOfKin?.phone},
      ${data.nextOfKin?.address},
      ${data.departmentId},
      ${data.jobRoleId},
      ${data.managerId},
      ${data.employmentType},
      ${data.employmentStatus || "active"},
      ${data.startDate},
      ${data.confirmationDate},
      ${data.terminationDate},
      ${data.terminationReason},
      ${data.location},
      ${data.basicSalary},
      ${data.payGrade},
      ${data.bankName},
      ${data.accountNumber},
      ${data.accountName},
      ${data.pensionPin},
      ${data.taxId},
      ${data.avatar},
      ${data.bio},
      ${data.isOnboarded || false}
    )
    returning *
  `;

  return employee;
};

/**
 * Get Employee by ID
 */
export const getEmployeeById = async (id) => {
  const [employee] = await sql`
    select * from employees where id = ${id}
  `;
  return employee;
};

/**
 * Get All Employees in a Company
 */
export const getEmployeesByCompany = async (companyId) => {
  return await sql`
    select * from employees
    where company_id = ${companyId}
    order by created_at desc
  `;
};

/**
 * Update Employee
 */
export const updateEmployee = async (id, data) => {
  const [employee] = await sql`
    update employees
    set
      first_name = ${data.firstName},
      last_name = ${data.lastName},
      phone = ${data.phone},
      employment_status = ${data.employmentStatus},
      updated_at = now()
    where id = ${id}
    returning *
  `;
  return employee;
};
