import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL);

// Create goal
export const createGoal = async (data) => {
  const [goal] = await sql`
    insert into goals (
      company_id,
      employee_id,
      title,
      description,
      metric,
      target,
      due_date,
      progress,
      status,
      cycle,
      created_by
    )
    values (
      ${data.companyId},
      ${data.employeeId},
      ${data.title},
      ${data.description},
      ${data.metric},
      ${data.target},
      ${data.dueDate},
      ${data.progress || 0},
      ${data.status || "not_started"},
      ${data.cycle},
      ${data.createdBy}
    )
    returning *
  `;

  return goal;
};

// Update goal progress
export const updateGoalProgress = async (id, progress) => {
  const [goal] = await sql`
    update goals
    set
      progress = ${progress},
      status = ${progress === 100 ? "completed" : "in_progress"},
      updated_at = now()
    where id = ${id}
    returning *
  `;

  return goal;
};

// Get employee goals
export const getEmployeeGoals = async (employeeId) => {
  return await sql`
    select *
    from goals
    where employee_id = ${employeeId}
    order by due_date asc
  `;
};
