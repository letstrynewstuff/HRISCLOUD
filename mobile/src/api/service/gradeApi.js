import API from "../axios";

/**
 * All Grade HTTP calls.
 * HR uses these to manage the levels that Job Roles point to.
 */
export const gradeApi = {
  // GET /api/grades
  list: () => API.get("/grades").then((r) => r.data),

  // POST /api/grades
  create: (payload) => API.post("/grades", payload).then((r) => r.data),

  // PUT /api/grades/:id
  update: (id, payload) =>
    API.put(`/grades/${id}`, payload).then((r) => r.data),

  // DELETE /api/grades/:id
  remove: (id) => API.delete(`/grades/${id}`).then((r) => r.data),
};
