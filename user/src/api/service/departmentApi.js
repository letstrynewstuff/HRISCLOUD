// // src/api/services/departmentApi.js


import API from "../axios";

/**
 * All routes are mounted at /api/departments
 * Axios interceptor in axios.js automatically handles the Bearer Token.
 */

export const departmentApi = {
  // GET /api/departments
  list: async () => {
    const { data } = await API.get("/departments");
    return data;
  },

  // GET /api/departments/:id
  get: async (id) => {
    const { data } = await API.get(`/departments/${id}`);
    return data;
  },

  // POST /api/departments
  // Body: { name, description, head_id, parent_department_id }
  create: async (payload) => {
    const { data } = await API.post("/departments", payload);
    return data;
  },

  // PUT /api/departments/:id
  update: async (id, payload) => {
    const { data } = await API.put(`/departments/${id}`, payload);
    return data;
  },

  // DELETE /api/departments/:id (soft delete)
  remove: async (id) => {
    const { data } = await API.delete(`/departments/${id}`);
    return data;
  },
};