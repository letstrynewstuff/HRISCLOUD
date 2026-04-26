import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

/**
 * Create Leave Policy
 */
export const createLeavePolicy = async (data) => {
  const [policy] = await sql`
    insert into leave_policies (
      company_id,
      name,
      type,
      days_allowed,
      gender,
      requires_documentation,
      document_label,
      is_carry_over_allowed,
      max_carry_over_days,
      min_notice_days,
      is_active
    )
    values (
      ${data.companyId},
      ${data.name},
      ${data.type},
      ${data.daysAllowed},
      ${data.gender ?? "all"},
      ${data.requiresDocumentation ?? false},
      ${data.documentLabel},
      ${data.isCarryOverAllowed ?? false},
      ${data.maxCarryOverDays ?? 0},
      ${data.minNoticeDays ?? 0},
      ${data.isActive ?? true}
    )
    returning *
  `;

  return policy;
};

/**
 * Get All Policies For Company
 */
export const getCompanyLeavePolicies = async (companyId) => {
  return await sql`
    select *
    from leave_policies
    where company_id = ${companyId}
    order by created_at desc
  `;
};

/**
 * Get Single Policy
 */
export const getLeavePolicyById = async (id) => {
  const [policy] = await sql`
    select *
    from leave_policies
    where id = ${id}
  `;

  return policy;
};

/**
 * Update Leave Policy
 */
export const updateLeavePolicy = async (id, data) => {
  const [policy] = await sql`
    update leave_policies
    set
      name = ${data.name},
      type = ${data.type},
      days_allowed = ${data.daysAllowed},
      gender = ${data.gender},
      requires_documentation = ${data.requiresDocumentation},
      document_label = ${data.documentLabel},
      is_carry_over_allowed = ${data.isCarryOverAllowed},
      max_carry_over_days = ${data.maxCarryOverDays},
      min_notice_days = ${data.minNoticeDays},
      is_active = ${data.isActive},
      updated_at = now()
    where id = ${id}
    returning *
  `;

  return policy;
};

/**
 * Delete Policy
 */
export const deleteLeavePolicy = async (id) => {
  await sql`
    delete from leave_policies
    where id = ${id}
  `;
};
