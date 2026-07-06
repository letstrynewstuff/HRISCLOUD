// src/api/services/announcementApi.js
//
// Mirrors the REST surface defined in:
//   GET    /api/announcements          → listAnnouncements   (HR)
//   POST   /api/announcements          → createAnnouncement  (HR)
//   PUT    /api/announcements/:id      → updateAnnouncement  (HR)
//   DELETE /api/announcements/:id      → deleteAnnouncement  (HR)
//   GET    /api/announcements/feed     → getAnnouncementFeed (any auth user)
//   PUT    /api/announcements/:id/view → incrementViewCount  (any auth user)

import API from "../axios";

// ─── Normalizers ──────────────────────────────────────────────
// The controller stores / returns snake_case column names from postgres.
// We map them to camelCase for consistent JS usage in the frontend,
// then convert back to camelCase body fields on write (the controller
// accepts camelCase from express-validator / body()).

/** Map a raw DB row → camelCase announcement object */
function normalizeAnnouncement(a) {
  if (!a) return a;
  return {
    id: a.id,
    companyId: a.company_id ?? a.companyId,
    title: a.title,
    body: a.body,
    audience: a.audience, // 'all' | 'department' | 'role'
    departmentId: a.department_id ?? a.departmentId ?? null,
    departmentName: a.department_name ?? a.departmentName ?? null,
    isPinned: a.is_pinned ?? a.isPinned ?? false,
    publishAt: a.publish_at ?? a.publishAt ?? null,
    expiresAt: a.expires_at ?? a.expiresAt ?? null,
    views: a.views ?? 0,
    createdAt: a.created_at ?? a.createdAt,
    updatedAt: a.updated_at ?? a.updatedAt ?? null,
    // HR list extras
    createdById: a.created_by_id ?? a.createdById ?? null,
    createdByName: a.created_by_name ?? a.createdByName ?? null,
    // Feed extras
    postedBy: a.posted_by ?? a.postedBy ?? null,
  };
}

/** Build the camelCase request body the controller expects */
function toRequestBody(payload) {
  return {
    title: payload.title,
    body: payload.body,
    audience: payload.audience,
    departmentId: payload.departmentId ?? null,
    isPinned: payload.isPinned ?? false,
    publishAt: payload.publishAt ?? null,
    expiresAt: payload.expiresAt ?? null,
  };
}

// ─── HR Admin API ─────────────────────────────────────────────

export const announcementApi = {
  /**
   * GET /api/announcements
   * HR view — paginated list with optional filters.
   *
   * @param {object} params
   * @param {number}  [params.page]       default 1
   * @param {number}  [params.limit]      default 20
   * @param {string}  [params.audience]   'all' | 'department' | 'role'
   * @param {string}  [params.department] UUID
   * @param {string}  [params.pinned]     'true' | 'false'
   * @param {string}  [params.status]     'active' | 'scheduled' | 'expired'
   * @returns {{ data: Announcement[], meta: PaginationMeta }}
   */
  list: async (params = {}) => {
    const { data } = await API.get("/announcements", { params });
    return {
      ...data,
      data: (data.data ?? []).map(normalizeAnnouncement),
    };
  },

  /**
   * GET /api/announcements/:id
   * Fetch a single announcement by id (HR context).
   * NOTE: The controller does not expose a GET /:id route by default,
   * but this helper is included so future implementations can use it.
   * Remove if not needed.
   */
  get: async (id) => {
    const { data } = await API.get(`/announcements/${id}`);
    return normalizeAnnouncement(data);
  },

  /**
   * POST /api/announcements
   * Create a new announcement.
   *
   * @param {object} payload
   * @param {string}  payload.title
   * @param {string}  payload.body
   * @param {string}  payload.audience         'all' | 'department' | 'role'
   * @param {string}  [payload.departmentId]   required when audience='department'
   * @param {boolean} [payload.isPinned]
   * @param {string}  [payload.publishAt]      ISO 8601 or null (publish immediately)
   * @param {string}  [payload.expiresAt]      ISO 8601 or null (never expires)
   * @returns {{ message: string, data: Announcement }}
   */
  create: async (payload) => {
    const { data } = await API.post("/announcements", toRequestBody(payload));
    return {
      ...data,
      data: normalizeAnnouncement(data.data),
    };
  },

  /**
   * PUT /api/announcements/:id
   * Partial update — only send the fields you want to change.
   * Cannot edit an expired announcement (returns 409).
   *
   * @param {string} id   UUID of the announcement
   * @param {object} payload   Any subset of the create payload fields
   * @returns {{ message: string, data: Announcement }}
   */
  update: async (id, payload) => {
    const { data } = await API.put(
      `/announcements/${id}`,
      toRequestBody(payload),
    );
    return {
      ...data,
      data: normalizeAnnouncement(data.data),
    };
  },

  /**
   * DELETE /api/announcements/:id
   * Hard-delete an announcement.
   *
   * @param {string} id UUID
   * @returns {{ message: string, data: { id: string } }}
   */
  remove: async (id) => {
    const { data } = await API.delete(`/announcements/${id}`);
    return data;
  },
};

// ─── Employee / Feed API ──────────────────────────────────────

/**
 * GET /api/announcements/feed
 * Returns only the announcements the calling employee is entitled to see
 * (audience-scoped: 'all' always shows; 'department' only if employee is in that dept).
 *
 * @param {object} params
 * @param {number}  [params.page]  default 1
 * @param {number}  [params.limit] default 10, max 50
 * @returns {{ data: Announcement[], meta: PaginationMeta }}
 */
export const getAnnouncementFeed = async (params = {}) => {
  const { data } = await API.get("/announcements/feed", { params });
  return {
    ...data,
    data: (data.data ?? []).map(normalizeAnnouncement),
  };
};

/**
 * PUT /api/announcements/:id/view
 * Atomically increment the view count for an announcement the employee can see.
 * Safe to call fire-and-forget; errors are swallowed silently.
 *
 * @param {string} id UUID of the announcement
 * @returns {{ message: string, data: { id: string, views: number } }}
 */
export const recordAnnouncementView = async (id) => {
  const { data } = await API.put(`/announcements/${id}/view`);
  return data;
};
