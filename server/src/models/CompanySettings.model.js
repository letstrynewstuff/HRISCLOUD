import { db } from "../config/db.js";

export const getCompanySettings = async (companyId) => {
  const result = await db.query(
    `SELECT *
     FROM company_settings
     WHERE company_id = $1`,
    [companyId],
  );

  return result.rows[0] ?? null;
};

export const upsertCompanySettings = async (companyId, data) => {
  const result = await db.query(
    `INSERT INTO company_settings (
       company_id,
       working_days,
       working_hours_start,
       working_hours_end,
       fiscal_year_start,
       pay_day,
       pay_frequency,
       currency,
       timezone,
       date_format,
       leave_approval_flow,
       probation_months,
       enable_biometric,
       enable_geofence,
       geofence_radius_m
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     ON CONFLICT (company_id) DO UPDATE SET
       working_days        = COALESCE($2, company_settings.working_days),
       working_hours_start = COALESCE($3, company_settings.working_hours_start),
       working_hours_end   = COALESCE($4, company_settings.working_hours_end),
       fiscal_year_start   = COALESCE($5, company_settings.fiscal_year_start),
       pay_day             = COALESCE($6, company_settings.pay_day),
       pay_frequency       = COALESCE($7, company_settings.pay_frequency),
       currency            = COALESCE($8, company_settings.currency),
       timezone            = COALESCE($9, company_settings.timezone),
       date_format         = COALESCE($10, company_settings.date_format),
       leave_approval_flow = COALESCE($11, company_settings.leave_approval_flow),
       probation_months    = COALESCE($12, company_settings.probation_months),
       enable_biometric    = COALESCE($13, company_settings.enable_biometric),
       enable_geofence     = COALESCE($14, company_settings.enable_geofence),
       geofence_radius_m   = COALESCE($15, company_settings.geofence_radius_m),
       updated_at          = NOW()
     RETURNING *`,
    [
      companyId,
      data.workingDays ?? null,
      data.workingHoursStart ?? null,
      data.workingHoursEnd ?? null,
      data.fiscalYearStart ?? null,
      data.payDay ?? null,
      data.payFrequency ?? null,
      data.currency ?? null,
      data.timezone ?? null,
      data.dateFormat ?? null,
      data.leaveApprovalFlow ?? null,
      data.probationMonths ?? null,
      data.enableBiometric ?? null,
      data.enableGeofence ?? null,
      data.geofenceRadiusM ?? null,
    ],
  );

  return result.rows[0];
};
