import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL);

// Create yearly leave balance
export const createLeaveBalance = async (data) => {
  const [balance] = await sql`
    insert into leave_balances (
      company_id,
      employee_id,
      leave_policy_id,
      year,
      entitled,
      taken,
      pending,
      carried_over
    )
    values (
      ${data.companyId},
      ${data.employeeId},
      ${data.leavePolicyId},
      ${data.year},
      ${data.entitled ?? 0},
      ${data.taken ?? 0},
      ${data.pending ?? 0},
      ${data.carriedOver ?? 0}
    )
    returning *
  `;

  return balance;
};

// Get employee balance for a year
export const getEmployeeLeaveBalance = async (employeeId, year) => {
  return await sql`
    select *
    from leave_balances
    where employee_id = ${employeeId}
    and year = ${year}
  `;
};

// Update balance (used after approval)
export const updateLeaveBalance = async (id, data) => {
  const [balance] = await sql`
    update leave_balances
    set
      entitled = ${data.entitled},
      taken = ${data.taken},
      pending = ${data.pending},
      carried_over = ${data.carriedOver},
      updated_at = now()
    where id = ${id}
    returning *
  `;

  return balance;
};
