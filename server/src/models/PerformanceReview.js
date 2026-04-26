import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL);

// Create performance review
export const createPerformanceReview = async (data) => {
  const [review] = await sql`
    insert into performance_reviews (
      company_id,
      employee_id,
      reviewer_id,
      cycle,
      period_start,
      period_end,
      status
    )
    values (
      ${data.companyId},
      ${data.employeeId},
      ${data.reviewerId || null},
      ${data.cycle},
      ${data.periodStart},
      ${data.periodEnd},
      'pending'
    )
    returning *
  `;

  return review;
};

// Submit self assessment
export const submitSelfAssessment = async (id, selfAssessment) => {
  const [review] = await sql`
    update performance_reviews
    set
      self_assessment = ${sql.json(selfAssessment)},
      status = 'manager_review',
      updated_at = now()
    where id = ${id}
    returning *
  `;

  return review;
};

// Submit manager assessment
export const submitManagerAssessment = async (
  id,
  managerAssessment,
  finalRating,
) => {
  const [review] = await sql`
    update performance_reviews
    set
      manager_assessment = ${sql.json(managerAssessment)},
      final_rating = ${finalRating},
      status = 'completed',
      updated_at = now()
    where id = ${id}
    returning *
  `;

  return review;
};

// Get reviews for employee
export const getEmployeeReviews = async (employeeId) => {
  return await sql`
    select *
    from performance_reviews
    where employee_id = ${employeeId}
    order by created_at desc
  `;
};
