import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL);

// Create payroll record for employee
export const createPayroll = async (data) => {
  const [payroll] = await sql`
    insert into payrolls (
      company_id,
      employee_id,
      payroll_run_id,
      month,
      year,
      basic_salary,
      allowances,
      overtime,
      bonus,
      gross_earnings,
      paye,
      pension,
      nhf,
      loans,
      other_deductions,
      total_deductions,
      net_pay
    )
    values (
      ${data.companyId},
      ${data.employeeId},
      ${data.payrollRunId},
      ${data.month},
      ${data.year},
      ${data.basicSalary},
      ${JSON.stringify(data.allowances || [])},
      ${data.overtime || 0},
      ${data.bonus || 0},
      ${data.grossEarnings},
      ${data.paye || 0},
      ${data.pension || 0},
      ${data.nhf || 0},
      ${data.loans || 0},
      ${JSON.stringify(data.otherDeductions || [])},
      ${data.totalDeductions},
      ${data.netPay}
    )
    returning *
  `;

  return payroll;
};

// Get payroll for employee (single month)
export const getEmployeePayroll = async (employeeId, month, year) => {
  const [record] = await sql`
    select *
    from payrolls
    where employee_id = ${employeeId}
    and month = ${month}
    and year = ${year}
  `;

  return record;
};

// Update payroll status
export const updatePayrollStatus = async (id, status) => {
  const [record] = await sql`
    update payrolls
    set
      status = ${status},
      updated_at = now()
    where id = ${id}
    returning *
  `;

  return record;
};
