import { db } from "../config/db.js";

export const getCompanyBilling = async (companyId) => {
  const result = await db.query(
    `SELECT
       b.*,
       (b.seats_purchased - b.seats_used) AS seats_available,
       CASE WHEN b.trial_ends_at > NOW() THEN true ELSE false END AS is_trialing,
       CASE
         WHEN b.next_billing_date < NOW()::date
              AND b.plan_status = 'active'
         THEN true ELSE false
       END AS payment_overdue
     FROM billing_info b
     WHERE b.company_id = $1`,
    [companyId],
  );

  return result.rows[0] ?? null;
};
