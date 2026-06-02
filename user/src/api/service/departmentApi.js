

// src/api/services/departmentApi.js

import API from "../axios";

/**
 * Normalize a department object from the API's camelCase response
 * to the snake_case shape the frontend components expect.
 *
 * API returns:  { headId, parentDepartmentId, parentName, headName, ... }
 * Frontend uses: { head_id, parent_department_id, parent_department_name, head_name, ... }
 */
function normalizeDept(d) {
  if (!d) return d;
  return {
    // identity
    id:                     d.id,
    company_id:             d.companyId            ?? d.company_id,
    // core fields
    name:                   d.name,
    description:            d.description,
    is_active:              d.isActive             ?? d.is_active,
    created_at:             d.createdAt            ?? d.created_at,
    updated_at:             d.updatedAt            ?? d.updated_at,
    // head
    head_id:                d.headId               ?? d.head_id               ?? null,
    head_name:              d.headName             ?? d.head_name             ?? null,
    // parent
    parent_department_id:   d.parentDepartmentId   ?? d.parent_department_id   ?? null,
    parent_department_name: d.parentName           ?? d.parent_department_name ?? null,
  };
}

export const departmentApi = {
  // GET /api/departments
  list: async () => {
    const { data } = await API.get("/departments");
    return {
      ...data,
      departments: (data.departments ?? []).map(normalizeDept),
    };
  },

  // GET /api/departments/:id
  get: async (id) => {
    const { data } = await API.get(`/departments/${id}`);
    return normalizeDept(data);
  },

  // POST /api/departments
  // The controller accepts camelCase body fields, so we send camelCase
  create: async (payload) => {
    const { data } = await API.post("/departments", {
      name:               payload.name,
      description:        payload.description        ?? null,
      headId:             payload.head_id            ?? null,
      parentDepartmentId: payload.parent_department_id ?? null,
    });
    return {
      ...data,
      department: normalizeDept(data.department),
    };
  },

  // PUT /api/departments/:id
  update: async (id, payload) => {
    const { data } = await API.put(`/departments/${id}`, {
      name:               payload.name,
      description:        payload.description        ?? null,
      headId:             payload.head_id            ?? null,
      parentDepartmentId: payload.parent_department_id ?? null,
    });
    return {
      ...data,
      department: normalizeDept(data.department),
    };
  },

  // DELETE /api/departments/:id (soft delete)
  remove: async (id) => {
    const { data } = await API.delete(`/departments/${id}`);
    return data;
  },
};