// src/controllers/company.controller.js
//
// Endpoints (all require authenticate middleware):
//
//   GET  /api/company            → getCompanyProfile   (any authenticated user)
//   PUT  /api/company            → updateCompanyProfile (hr_admin | super_admin)
//   PUT  /api/company/logo       → uploadCompanyLogo    (hr_admin | super_admin)
//   GET  /api/company/settings   → getSettings          (any authenticated user)
//   PUT  /api/company/settings   → updateSettings       (hr_admin | super_admin)
//   GET  /api/company/billing    → getBilling           (hr_admin | super_admin)
//
// Stack: Express · pg · multer (logo upload) · express-validator
// Storage: Cloudinary (swap with S3/GCS by changing the upload helper)

import { validationResult } from "express-validator";
// import {
//   getCompanyById,
//   updateCompanyProfile,
//   updateCompanyLogo,
//   getCompanySettings,
//   upsertCompanySettings,
//   getCompanyBilling,
// } from "../models/Company.js";


import {
  getCompanyById,
  updateCompanyProfile,
  updateCompanyLogo,
} from "../models/Company.js";

import {
  getCompanySettings,
  upsertCompanySettings,
} from "../models/CompanySettings.model.js";

import { getCompanyBilling } from "../models/BillingInfo.model.js";
import { uploadToCloud } from "../utils/upload.js";

// ─── Internal helpers ─────────────────────────────────────────

/** Return 422 and halt if express-validator found errors */
function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res
      .status(422)
      .json({ message: "Validation failed.", errors: errors.array() });
    return true;
  }
  return false;
}

/** Shape a raw DB company row into a clean camelCase API response */
function serializeCompany(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logo_url,
    rcNumber: row.rc_number,
    industry: row.industry,
    size: row.size,
    address: row.address,
    city: row.city,
    state: row.state,
    country: row.country,
    phone: row.phone,
    email: row.email,
    website: row.website,
    description: row.description,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Shape a raw settings row into camelCase */
function serializeSettings(row) {
  if (!row) return null;
  return {
    companyId: row.company_id,
    workingDays: row.working_days,
    workingHoursStart: row.working_hours_start,
    workingHoursEnd: row.working_hours_end,
    fiscalYearStart: row.fiscal_year_start,
    payDay: row.pay_day,
    payFrequency: row.pay_frequency,
    currency: row.currency,
    timezone: row.timezone,
    dateFormat: row.date_format,
    leaveApprovalFlow: row.leave_approval_flow,
    probationMonths: row.probation_months,
    enableBiometric: row.enable_biometric,
    enableGeofence: row.enable_geofence,
    geofenceRadiusM: row.geofence_radius_m,
    updatedAt: row.updated_at,
  };
}

/** Shape a raw billing row into camelCase */
function serializeBilling(row) {
  if (!row) return null;
  return {
    id: row.id,
    companyId: row.company_id,
    plan: row.plan,
    planStatus: row.plan_status,
    billingCycle: row.billing_cycle,
    amountKobo: row.amount_kobo,
    // Convenience: human-readable amount in major units (₦ for NGN)
    amountMajor: row.amount_kobo / 100,
    currency: row.currency,
    nextBillingDate: row.next_billing_date,
    trialEndsAt: row.trial_ends_at,
    isTrialing: row.is_trialing,
    seatsPurchased: row.seats_purchased,
    seatsUsed: row.seats_used,
    seatsAvailable: row.seats_available,
    paymentOverdue: row.payment_overdue,
    paymentProvider: row.payment_provider,
    billingEmail: row.billing_email,
    invoiceHistory: row.invoice_history ?? [],
    updatedAt: row.updated_at,
  };
}

// ══════════════════════════════════════════════════════════════
// GET /api/company
// Returns the authenticated user's company profile.
// Any authenticated employee can view this.
// ══════════════════════════════════════════════════════════════
export async function getCompanyProfile(req, res) {
  try {
    const company = await getCompanyById(req.user.companyId);

    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    return res.status(200).json(serializeCompany(company));
  } catch (err) {
    console.error("getCompanyProfile error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/company
// Update company profile fields.
// Only hr_admin and super_admin may call this.
// Accepts partial body — only supplied fields are changed.
// ══════════════════════════════════════════════════════════════
export async function updateCompanyProfileHandler(req, res) {
  if (handleValidationErrors(req, res)) return;

  const {
    name,
    rcNumber,
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
  } = req.body;

  try {
    const updated = await updateCompanyProfile(req.user.companyId, {
      name,
      rcNumber,
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
    });

    if (!updated) {
      return res.status(404).json({ message: "Company not found." });
    }

    return res.status(200).json({
      message: "Company profile updated.",
      company: serializeCompany(updated),
    });
  } catch (err) {
    console.error("updateCompanyProfile error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/company/logo
// Upload or replace the company logo.
// Expects multipart/form-data with a single field named "logo".
// The file is uploaded to cloud storage; the URL is stored in DB.
//
// Multer is configured in the router with memoryStorage so the buffer
// is available here as req.file.buffer.
// ══════════════════════════════════════════════════════════════
export async function uploadCompanyLogo(req, res) {
  try {
    // req.file is set by multer — guard against missing uploads
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No logo file provided. Use field name 'logo'." });
    }

    const { mimetype, size, buffer, originalname } = req.file;

    // Validate file type
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ];
    if (!ALLOWED_TYPES.includes(mimetype)) {
      return res.status(415).json({
        message: `Unsupported file type: ${mimetype}. Allowed: JPEG, PNG, WebP, SVG.`,
      });
    }

    // Validate file size (max 2 MB)
    const MAX_BYTES = 2 * 1024 * 1024;
    if (size > MAX_BYTES) {
      return res
        .status(413)
        .json({ message: "Logo file must not exceed 2 MB." });
    }

    // Upload to cloud storage (Cloudinary / S3 / GCS)
    // uploadToCloud returns { url, publicId }
    const { url } = await uploadToCloud(buffer, {
      folder: `hriscloud/${req.user.companyId}/logos`,
      publicId: `logo_${req.user.companyId}`,
      overwrite: true, // replace any existing logo
      resourceType: "image",
      transformation: [
        { width: 400, height: 400, crop: "limit" }, // cap dimensions
      ],
    });

    // Persist URL to DB
    const updated = await updateCompanyLogo(req.user.companyId, url);

    if (!updated) {
      return res.status(404).json({ message: "Company not found." });
    }

    return res.status(200).json({
      message: "Company logo updated.",
      logoUrl: updated.logo_url,
      updatedAt: updated.updated_at,
    });
  } catch (err) {
    console.error("uploadCompanyLogo error:", err);
    return res
      .status(500)
      .json({ message: "Server error during logo upload." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/company/settings
// Returns all operational config settings for the company.
// Any authenticated employee can view these (needed for leave
// policies, working hours display, currency formatting, etc.).
// ══════════════════════════════════════════════════════════════
export async function getSettings(req, res) {
  try {
    const settings = await getCompanySettings(req.user.companyId);

    if (!settings) {
      // Company exists but settings row hasn't been created yet —
      // return a sensible default object instead of 404
      return res.status(200).json({
        companyId: req.user.companyId,
        workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        workingHoursStart: "08:00:00",
        workingHoursEnd: "17:00:00",
        fiscalYearStart: null,
        payDay: 28,
        payFrequency: "monthly",
        currency: "NGN",
        timezone: "Africa/Lagos",
        dateFormat: "DD/MM/YYYY",
        leaveApprovalFlow: "manager",
        probationMonths: 3,
        enableBiometric: false,
        enableGeofence: false,
        geofenceRadiusM: 200,
        updatedAt: null,
        _isDefault: true, // hint for front-end to prompt setup
      });
    }

    return res.status(200).json(serializeSettings(settings));
  } catch (err) {
    console.error("getSettings error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// PUT /api/company/settings
// Upsert company settings.
// Only hr_admin / super_admin may write.
// Partial body is accepted — only provided fields are changed.
// ══════════════════════════════════════════════════════════════
export async function updateSettings(req, res) {
  if (handleValidationErrors(req, res)) return;

  const {
    workingDays,
    workingHoursStart,
    workingHoursEnd,
    fiscalYearStart,
    payDay,
    payFrequency,
    currency,
    timezone,
    dateFormat,
    leaveApprovalFlow,
    probationMonths,
    enableBiometric,
    enableGeofence,
    geofenceRadiusM,
  } = req.body;

  try {
    const saved = await upsertCompanySettings(req.user.companyId, {
      workingDays,
      workingHoursStart,
      workingHoursEnd,
      fiscalYearStart,
      payDay,
      payFrequency,
      currency,
      timezone,
      dateFormat,
      leaveApprovalFlow,
      probationMonths,
      enableBiometric,
      enableGeofence,
      geofenceRadiusM,
    });

    return res.status(200).json({
      message: "Settings updated.",
      settings: serializeSettings(saved),
    });
  } catch (err) {
    console.error("updateSettings error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

// ══════════════════════════════════════════════════════════════
// GET /api/company/billing
// Returns subscription plan, billing cycle, seat usage, and
// invoice history for the company.
// Only hr_admin / super_admin should see this — gate in router.
// ══════════════════════════════════════════════════════════════
export async function getBilling(req, res) {
  try {
    const billing = await getCompanyBilling(req.user.companyId);

    if (!billing) {
      // Company is on the free plan and no billing row exists yet
      return res.status(200).json({
        companyId: req.user.companyId,
        plan: "free",
        planStatus: "active",
        billingCycle: null,
        amountKobo: 0,
        amountMajor: 0,
        currency: "NGN",
        nextBillingDate: null,
        trialEndsAt: null,
        isTrialing: false,
        seatsPurchased: 5,
        seatsUsed: 1,
        seatsAvailable: 4,
        paymentOverdue: false,
        paymentProvider: null,
        billingEmail: null,
        invoiceHistory: [],
        updatedAt: null,
        _isDefault: true,
      });
    }

    return res.status(200).json(serializeBilling(billing));
  } catch (err) {
    console.error("getBilling error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}
