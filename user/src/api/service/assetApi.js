// src/api/services/assetApi.js
import API from "../axios";

/**
 * The backend's serializeAsset()/serializeAssignment() already return
 * camelCase, so no normalization layer is needed here (unlike
 * departmentApi, which talks to a controller returning mixed casing).
 */

export const assetApi = {
  // GET /api/assets
  // params: { page, limit, search, status, category, employeeId }
  getAll: async (params = {}) => {
    const { data } = await API.get("/assets", { params });
    return data; // { data: [...assets], meta: { total, page, limit, totalPages } }
  },

  // GET /api/assets/:id
  get: async (id) => {
    const { data } = await API.get(`/assets/${id}`);
    return data; // { data: asset }
  },

  // POST /api/assets
  create: async (payload) => {
    const { data } = await API.post("/assets", {
      name: payload.name,
      category: payload.category ?? "other",
      brand: payload.brand ?? null,
      model: payload.model ?? null,
      serialNumber: payload.serialNumber ?? null,
      condition: payload.condition ?? "good",
      purchaseDate: payload.purchaseDate || null,
      purchaseCost: payload.purchaseCost || null,
      warrantyExpiry: payload.warrantyExpiry || null,
      location: payload.location ?? null,
      notes: payload.notes ?? null,
    });
    return data; // { message, data: asset }
  },

  // PUT /api/assets/:id
  // Partial update. Cannot set status to "assigned"/"available" here —
  // the backend rejects that; use assign()/returnAsset() instead.
  update: async (id, payload) => {
    const { data } = await API.put(`/assets/${id}`, payload);
    return data; // { message, data: asset }
  },

  // DELETE /api/assets/:id  (soft delete → status = retired)
  retire: async (id) => {
    const { data } = await API.delete(`/assets/${id}`);
    return data; // { message, data: asset }
  },

  // POST /api/assets/:id/assign — HR gives an available asset to an employee
  assign: async (
    id,
    { employeeId, condition, expectedReturnDate, notes } = {},
  ) => {
    const { data } = await API.post(`/assets/${id}/assign`, {
      employeeId,
      condition: condition ?? "good",
      expectedReturnDate: expectedReturnDate || null,
      notes: notes ?? null,
    });
    return data; // { message, data: assignment }
  },

  // POST /api/assets/:id/return — manual/ad-hoc return (outside offboarding)
  returnAsset: async (id, { condition, notes } = {}) => {
    const { data } = await API.post(`/assets/${id}/return`, {
      condition,
      notes: notes ?? null,
    });
    return data; // { message, data: assignment }
  },

  // GET /api/assets/:id/history — full assignment history for one asset
  getHistory: async (id) => {
    const { data } = await API.get(`/assets/${id}/history`);
    return data; // { asset, data: [...assignments] }
  },
  /* ── Employee endpoints ─────────────────────────────── */

  // GET /api/assets/my
  // Returns assets currently assigned to the logged-in employee
  getMyAssets: async () => {
    const { data } = await API.get("/assets/my");
    return data; // { data: [...assets] }
  },

  // POST /api/assets/request
  // Employee submits an asset request
  requestAsset: async (payload) => {
    const { data } = await API.post("/assets/request", payload);
    return data; // { message, data: request }
  },

  // GET /api/assets/requests/my
  // Returns the employee's own request history
  getMyRequests: async () => {
    const { data } = await API.get("/assets/requests/my");
    return data; // { data: [...requests] }
  },
};


