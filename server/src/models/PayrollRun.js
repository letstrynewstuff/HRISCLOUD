import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL);

// Create payroll run
export const createPayrollRun = async (data) => {
  const [run] = await sql`
    insert into payroll_runs (
      company_id,
      month,
      year,
      period,
      notes
    )
    values (
      ${data.companyId},
      ${data.month},
      ${data.year},
      ${data.period},
      ${data.notes}
    )
    returning *
  `;

  return run;
};

// Approve payroll run
export const approvePayrollRun = async (id, approverId) => {
  const [run] = await sql`
    update payroll_runs
    set
      status = 'approved',
      approved_by = ${approverId},
      approved_at = now(),
      updated_at = now()
    where id = ${id}
    returning *
  `;

  return run;
};

// Mark payroll run as paid
export const markPayrollRunPaid = async (id) => {
  const [run] = await sql`
    update payroll_runs
    set
      status = 'paid',
      paid_at = now(),
      updated_at = now()
    where id = ${id}
    returning *
  `;

  return run;
};
