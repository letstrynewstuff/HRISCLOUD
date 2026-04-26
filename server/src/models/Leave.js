import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL);


// Create leave request
export const createLeaveRequest = async (data) => {
  const [leave] = await sql`
    insert into leaves (
      company_id,
      employee_id,
      leave_policy_id,
      start_date,
      end_date,
      days,
      reason,
      supporting_document
    )
    values (
      ${data.companyId},
      ${data.employeeId},
      ${data.leavePolicyId},
      ${data.startDate},
      ${data.endDate},
      ${data.days},
      ${data.reason},
      ${data.supportingDocument}
    )
    returning *
  `;

  return leave;
};


// Get employee leaves
export const getEmployeeLeaves = async (employeeId) => {
  return await sql`
    select *
    from leaves
    where employee_id = ${employeeId}
    order by created_at desc
  `;
};


// Approve leave
export const approveLeave = async (id, approverId) => {
  const [leave] = await sql`
    update leaves
    set
      status = 'approved',
      approved_by = ${approverId},
      approved_at = now(),
      updated_at = now()
    where id = ${id}
    returning *
  `;

  return leave;
};


// Reject leave
export const rejectLeave = async (id, approverId, reason) => {
  const [leave] = await sql`
    update leaves
    set
      status = 'rejected',
      approved_by = ${approverId},
      approved_at = now(),
      rejection_reason = ${reason},
      updated_at = now()
    where id = ${id}
    returning *
  `;

  return leave;
};