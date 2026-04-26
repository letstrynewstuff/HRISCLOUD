import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL);

export const createLoan = async (data) => {
  const monthly = data.amount / data.repaymentMonths;

  const [loan] = await sql`
    insert into loans (
      company_id, employee_id,
      amount, reason,
      repayment_months, monthly_deduction,
      balance
    )
    values (
      ${data.companyId},
      ${data.employeeId},
      ${data.amount},
      ${data.reason},
      ${data.repaymentMonths},
      ${monthly},
      ${data.amount}
    )
    returning *
  `;
  return loan;
};

export const addRepayment = async (loanId, repayment) => {
  const [loan] = await sql`
    update loans
    set
      repayment_history = repayment_history || ${sql.json([repayment])},
      total_repaid = total_repaid + ${repayment.amount},
      balance = balance - ${repayment.amount},
      updated_at = now()
    where id = ${loanId}
    returning *
  `;
  return loan;
};