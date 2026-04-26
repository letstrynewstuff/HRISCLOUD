import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

/**
 * Create User
 */
export const createUser = async (data) => {
  const [user] = await sql`
    insert into users (
      company_id,
      employee_id,
      first_name,
      last_name,
      email,
      password,
      role
    )
    values (
      ${data.companyId},
      ${data.employeeId},
      ${data.firstName},
      ${data.lastName},
      ${data.email},
      ${data.password},
      ${data.role}
    )
    returning id, first_name, last_name, email, role, created_at
  `;

  return user;
};

/**
 * Find user by email
 */
export const findUserByEmail = async (email) => {
  const [user] = await sql`
    select * from users where email = ${email}
  `;
  return user;
};

/**
 * Update last login
 */
export const updateLastLogin = async (userId) => {
  await sql`
    update users
    set last_login = now()
    where id = ${userId}
  `;
};

/**
 * Save refresh token
 */
export const saveRefreshToken = async (userId, token) => {
  await sql`
    update users
    set refresh_token = ${token}
    where id = ${userId}
  `;
};
