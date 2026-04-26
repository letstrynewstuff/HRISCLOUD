import { db } from "../config/db.js";

const PROFILE_COLUMNS = `
  id,
  name,
  slug,
  logo_url,
  rc_number,
  industry,
  size,
  address,
  city,
  state,
  country,
  phone,
  email,
  website,
  description,
  is_active,
  created_at,
  updated_at
`;

export const getCompanyById = async (companyId) => {
  const result = await db.query(
    `SELECT ${PROFILE_COLUMNS}
     FROM companies
     WHERE id = $1 AND is_active = true`,
    [companyId],
  );
  return result.rows[0];
};

export const updateCompanyProfile = async (companyId, data) => {
  const result = await db.query(
    `UPDATE companies
     SET
       name        = COALESCE($1, name),
       logo_url    = COALESCE($2, logo_url),
       rc_number   = COALESCE($3, rc_number),
       industry    = COALESCE($4, industry),
       size        = COALESCE($5, size),
       address     = COALESCE($6, address),
       city        = COALESCE($7, city),
       state       = COALESCE($8, state),
       country     = COALESCE($9, country),
       phone       = COALESCE($10, phone),
       email       = COALESCE($11, email),
       website     = COALESCE($12, website),
       description = COALESCE($13, description),
       updated_at  = NOW()
     WHERE id = $14 AND is_active = true
     RETURNING ${PROFILE_COLUMNS}`,
    [
      data.name ?? null,
      data.logoUrl ?? null,
      data.rcNumber ?? null,
      data.industry ?? null,
      data.size ?? null,
      data.address ?? null,
      data.city ?? null,
      data.state ?? null,
      data.country ?? null,
      data.phone ?? null,
      data.email ?? null,
      data.website ?? null,
      data.description ?? null,
      companyId,
    ],
  );

  return result.rows[0];
};

export const updateCompanyLogo = async (companyId, logoUrl) => {
  const result = await db.query(
    `UPDATE companies
     SET logo_url = $1, updated_at = NOW()
     WHERE id = $2 AND is_active = true
     RETURNING id, logo_url, updated_at`,
    [logoUrl, companyId],
  );

  return result.rows[0];
};
