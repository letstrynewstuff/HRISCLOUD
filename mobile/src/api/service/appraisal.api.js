

// src/api/service/appraisal.api.js
//
// Frontend API layer for the Appraisal system.
// Assumes an axios instance exported from "../axios" that already
// attaches the Authorization: Bearer <token> header.

import api from "../axios";

const BASE = "/appraisals";

// ══════════════════════════════════════════════════════════════
// TEMPLATES
// ══════════════════════════════════════════════════════════════

/**
 * List all appraisal templates for the company.
 * Roles: admin | hr_manager | manager
 * @returns {{ templates: Template[], total: number }}
 */
export const listTemplates = () =>
  api.get(`${BASE}/templates`).then((r) => r.data);

/**
 * Create a new appraisal template with weighted criteria.
 * Roles: admin | hr_manager
 *
 * @param {{
 *   name: string,
 *   description?: string,
 *   criteria: Array<{
 *     label: string,
 *     weight: number,
 *     maxScore?: number,
 *     sortOrder?: number
 *   }>
 * }} payload
 * @returns {{ message: string, template: Template }}
 */
export const createTemplate = (payload) =>
  api.post(`${BASE}/templates`, payload).then((r) => r.data);

// ══════════════════════════════════════════════════════════════
// MANAGER FLOW
// ══════════════════════════════════════════════════════════════

/**
 * Create a new appraisal draft for an employee.
 * Roles: admin | hr_manager | manager
 *
 * @param {string} employeeId - UUID of the employee being appraised
 * @param {{
 *   period: string,
 *   cycleName?: string,
 *   templateId?: string,
 *   managerFeedback?: string,
 *   managerRatings?: RatingItem[],
 *   hrScoreWeight?: number
 * }} payload
 * @returns {{ message: string, appraisal: Appraisal }}
 */
export const createAppraisal = (employeeId, payload) =>
  api.post(`${BASE}/${employeeId}`, payload).then((r) => r.data);

/**
 * Update a draft (or rejected) appraisal before submission.
 * Roles: admin | hr_manager | manager (own drafts only)
 *
 * @param {string} appraisalId
 * @param {{
 *   managerFeedback?: string,
 *   managerRatings?: RatingItem[],
 *   cycleName?: string,
 *   templateId?: string,
 *   hrScoreWeight?: number
 * }} payload
 * @returns {{ message: string, appraisal: Appraisal }}
 */
export const updateAppraisal = (appraisalId, payload) =>
  api.patch(`${BASE}/${appraisalId}`, payload).then((r) => r.data);

/**
 * Submit a draft appraisal to the HR queue.
 * Status: draft | rejected → submitted
 * Roles: admin | hr_manager | manager (own appraisals)
 *
 * @param {string} appraisalId
 * @returns {{ message: string, appraisal: Appraisal }}
 */
export const submitAppraisal = (appraisalId) =>
  api.patch(`${BASE}/${appraisalId}/submit`).then((r) => r.data);

// ══════════════════════════════════════════════════════════════
// HR FLOW
// ══════════════════════════════════════════════════════════════

/**
 * HR reviews and scores a submitted appraisal.
 * Status: submitted → hr_scored
 * Roles: admin | hr_manager
 *
 * @param {string} appraisalId
 * @param {{
 *   hrFeedback?: string,
 *   hrRatings?: RatingItem[],
 *   hrScoreWeight?: number
 * }} payload
 * @returns {{ message: string, appraisal: Appraisal, appraisalScore: number }}
 */
export const hrReviewAppraisal = (appraisalId, payload) =>
  api.patch(`${BASE}/${appraisalId}/hr-review`, payload).then((r) => r.data);

/**
 * Finalise (lock) an hr_scored appraisal.
 * Status: hr_scored → completed
 * Roles: admin | hr_manager
 *
 * @param {string} appraisalId
 * @returns {{ message: string, appraisal: Appraisal }}
 */
export const finalizeAppraisal = (appraisalId) =>
  api.patch(`${BASE}/${appraisalId}/finalize`).then((r) => r.data);

/**
 * Reject a submitted appraisal back to the manager for revision.
 * Status: submitted → rejected
 * Roles: admin | hr_manager
 *
 * @param {string} appraisalId
 * @param {{ reason: string }} payload
 * @returns {{ message: string, appraisal: Appraisal }}
 */
export const rejectAppraisal = (appraisalId, payload) =>
  api.patch(`${BASE}/${appraisalId}/reject`, payload).then((r) => r.data);

// ══════════════════════════════════════════════════════════════
// READ — LIST / GET
// ══════════════════════════════════════════════════════════════

/**
 * List appraisals with optional filters.
 * Roles: admin | hr_manager | manager
 *
 * @param {{
 *   status?:     "draft"|"submitted"|"hr_scored"|"completed"|"rejected",
 *   period?:     string,
 *   employeeId?: string,
 *   managerId?:  string
 * }} [filters]
 * @returns {{ appraisals: Appraisal[], total: number }}
 */
export const listAppraisals = (filters = {}) =>
  api.get(BASE, { params: filters }).then((r) => r.data);

/**
 * Get a single appraisal by ID.
 *
 * @param {string} appraisalId
 * @returns {{ appraisal: Appraisal }}
 */
export const getAppraisal = (appraisalId) =>
  api.get(`${BASE}/${appraisalId}`).then((r) => r.data);

/**
 * Get the current user's own appraisals (employee view).
 * @returns {{ appraisals: Appraisal[], total: number }}
 */
export const getMyAppraisals = () =>
  api.get(`${BASE}/me`).then((r) => r.data);

/**
 * Get all appraisals waiting for HR review (HR inbox).
 * Roles: admin | hr_manager
 * @returns {{ appraisals: Appraisal[], total: number }}
 */
export const getPendingHRAppraisals = () =>
  api.get(`${BASE}/pending-hr`).then((r) => r.data);

// ══════════════════════════════════════════════════════════════
// NAMED EXPORT BUNDLE
// ══════════════════════════════════════════════════════════════

export const appraisalApi = {
  listTemplates,
  createTemplate,
  createAppraisal,
  updateAppraisal,
  submitAppraisal,
  hrReviewAppraisal,
  finalizeAppraisal,
  rejectAppraisal,
  listAppraisals,
  getAppraisal,
  getMyAppraisals,
  getPendingHRAppraisals,
};

// ══════════════════════════════════════════════════════════════
// JSDoc type stubs
// ══════════════════════════════════════════════════════════════

/**
 * @typedef {Object} RatingItem
 * @property {string}  [criteriaId]
 * @property {string}  label
 * @property {number}  score
 * @property {number}  [maxScore]
 * @property {number}  [weight]
 * @property {string}  [comment]
 */

/**
 * @typedef {Object} Appraisal
 * @property {string}        id
 * @property {string}        companyId
 * @property {string}        employeeId
 * @property {string|null}   managerId
 * @property {string|null}   hrReviewerId
 * @property {string|null}   templateId
 * @property {string}        period
 * @property {string|null}   cycleName
 * @property {string|null}   managerFeedback
 * @property {RatingItem[]}  managerRatings
 * @property {number|null}   managerOverall
 * @property {string|null}   submittedAt
 * @property {string|null}   hrFeedback
 * @property {RatingItem[]}  hrRatings
 * @property {number|null}   hrOverall
 * @property {number}        hrScoreWeight
 * @property {string|null}   hrReviewedAt
 * @property {number|null}   appraisalScore
 * @property {"draft"|"submitted"|"hr_scored"|"completed"|"rejected"} status
 * @property {string|null}   createdBy
 * @property {string}        createdAt
 * @property {string}        updatedAt
 * @property {EmployeeSnap}  [employee]
 * @property {NameSnap}      [manager]
 * @property {NameSnap}      [hrReviewer]
 */

/**
 * @typedef {Object} EmployeeSnap
 * @property {string}      firstName
 * @property {string}      lastName
 * @property {string|null} email
 * @property {string|null} avatar
 * @property {string|null} department
 * @property {string|null} jobRole
 */

/**
 * @typedef {Object} NameSnap
 * @property {string} firstName
 * @property {string} lastName
 */

/**
 * @typedef {Object} Template
 * @property {string}     id
 * @property {string}     companyId
 * @property {string}     name
 * @property {string}     [description]
 * @property {boolean}    isActive
 * @property {Criteria[]} criteria
 * @property {string}     createdAt
 */

/**
 * @typedef {Object} Criteria
 * @property {string} id
 * @property {string} templateId
 * @property {string} label
 * @property {number} weight
 * @property {number} maxScore
 * @property {number} sortOrder
 */