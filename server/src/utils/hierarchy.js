// src/utils/hierarchy.js
// ─────────────────────────────────────────────────────────────────────────────
// Shared hierarchy utilities for the HRIS system.
//
// Core Principle:
//   "Manager" is a BUSINESS RELATIONSHIP derived from employees.manager_id.
//   It is NOT a platform role. Never authorize using role === "manager".
//
// Every function here:
//   1. Accepts `db` (pool or client) so it works inside and outside transactions.
//   2. Is always scoped by company_id — multi-tenant isolation is mandatory.
//   3. Queries the live DB state, so stale JWTs are harmless.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve the employee record ID for a given user.
 * Returns null if the user has no linked employee record in this company.
 *
 * Use this whenever you need to go from req.user.userId → employees.id.
 *
 * @param {import('pg').Pool|import('pg').PoolClient} db
 * @param {string} userId     — users.id (from JWT sub)
 * @param {string} companyId  — companies.id (from JWT)
 * @returns {Promise<string|null>}
 */
export async function resolveEmployeeId(db, userId, companyId) {
  const result = await db.query(
    `SELECT id
     FROM employees
     WHERE user_id    = $1
       AND company_id = $2
     LIMIT 1`,
    [userId, companyId],
  );
  return result.rows[0]?.id ?? null;
}

/**
 * Check whether `approverEmpId` is the **direct** line manager of `targetEmpId`.
 *
 * A user is the direct manager of another employee if and only if:
 *   employees.manager_id = approverEmpId   (for the target row)
 *
 * Both employees must belong to the same company (multi-tenant guard).
 *
 * This is the core authorization check for:
 *   - Approving / rejecting leave
 *   - Viewing a specific employee profile
 *   - Any future "manager-scoped" action
 *
 * @param {import('pg').Pool|import('pg').PoolClient} db
 * @param {string} approverEmpId  — employees.id of the person attempting the action
 * @param {string} targetEmpId    — employees.id of the person being acted upon
 * @param {string} companyId      — must match both sides
 * @returns {Promise<boolean>}
 */
export async function isDirectManager(
  db,
  approverEmpId,
  targetEmpId,
  companyId,
) {
  if (!approverEmpId || !targetEmpId) return false;
  if (approverEmpId === targetEmpId) return false; // can't manage yourself for approval

  const result = await db.query(
    `SELECT 1
     FROM employees
     WHERE id         = $1   -- this is the target employee's row
       AND manager_id = $2   -- their manager_id points to the approver
       AND company_id = $3   -- both must be in the same company
     LIMIT 1`,
    [targetEmpId, approverEmpId, companyId],
  );
  return result.rows.length > 0;
}

/**
 * Determine whether a user manages at least one active employee.
 * Used exclusively by getMe() to populate the `isManager` flag.
 *
 * "Active" here means not terminated or resigned — we don't count
 * inactive reports because the user would have no real team to manage.
 *
 * @param {import('pg').Pool|import('pg').PoolClient} db
 * @param {string|null} employeeId  — the employee record of the user (may be null for pure admin accounts)
 * @param {string}      companyId
 * @returns {Promise<boolean>}
 */
export async function computeIsManager(db, employeeId, companyId) {
  if (!employeeId) return false;

  const result = await db.query(
    `SELECT 1
     FROM employees
     WHERE manager_id        = $1
       AND company_id        = $2
       AND employment_status NOT IN ('terminated', 'resigned')
     LIMIT 1`,
    [employeeId, companyId],
  );
  return result.rows.length > 0;
}

/**
 * Detect whether setting `newManagerId` as the manager of `targetEmpId`
 * would create a circular reporting hierarchy.
 *
 * Algorithm: Walk up the ancestry chain of `newManagerId` using a recursive
 * CTE. If `targetEmpId` appears anywhere in that chain, it means:
 *   targetEmpId → ... → newManagerId → would report back to → targetEmpId
 * which is a cycle.
 *
 * Edge cases handled:
 *   - targetEmpId === newManagerId (self-management) → always a cycle
 *   - newManagerId not in DB → not a cycle (handled by caller validation)
 *
 * @param {import('pg').Pool|import('pg').PoolClient} db
 * @param {string} targetEmpId   — the employee whose manager_id is being changed
 * @param {string} newManagerId  — the proposed new manager
 * @param {string} companyId     — must scope the ancestry walk
 * @returns {Promise<boolean>}   true = cycle detected, BLOCK the update
 */
export async function wouldCreateCycle(
  db,
  targetEmpId,
  newManagerId,
  companyId,
) {
  // Immediate self-reference is always a cycle
  if (targetEmpId === newManagerId) return true;

  // Walk up the proposed new manager's ancestry chain.
  // If targetEmpId appears anywhere in that chain → cycle.
  const result = await db.query(
    `WITH RECURSIVE ancestry AS (
       -- Seed: the proposed new manager
       SELECT id, manager_id
       FROM   employees
       WHERE  id          = $1
         AND  company_id  = $3

       UNION ALL

       -- Walk up: each iteration follows manager_id upward
       SELECT e.id, e.manager_id
       FROM   employees e
       JOIN   ancestry   a ON e.id = a.manager_id
       WHERE  e.company_id = $3
         AND  e.manager_id IS NOT NULL   -- stop at root nodes
     )
     SELECT 1
     FROM   ancestry
     WHERE  id = $2   -- does targetEmpId appear in newManager's ancestry?
     LIMIT  1`,
    [newManagerId, targetEmpId, companyId],
  );

  return result.rows.length > 0;
}

/**
 * Get all direct reports for a given employee.
 * Useful for the manager dashboard team-member list.
 *
 * @param {import('pg').Pool|import('pg').PoolClient} db
 * @param {string} managerEmpId
 * @param {string} companyId
 * @returns {Promise<Array>} array of employee rows
 */
export async function getDirectReports(db, managerEmpId, companyId) {
  const result = await db.query(
    `SELECT
       e.id,
       e.employee_code,
       e.first_name,
       e.last_name,
       e.avatar,
       e.employment_status,
       e.employment_type,
       e.location,
       d.name  AS department_name,
       jr.title AS job_role_name
     FROM employees e
     LEFT JOIN departments d  ON d.id  = e.department_id
     LEFT JOIN job_roles   jr ON jr.id = e.job_role_id
     WHERE e.manager_id        = $1
       AND e.company_id        = $2
       AND e.employment_status NOT IN ('terminated', 'resigned')
     ORDER BY e.first_name, e.last_name`,
    [managerEmpId, companyId],
  );
  return result.rows;
}
