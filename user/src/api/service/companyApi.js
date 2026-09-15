// src/api/service/companyApi.js
// NOTE: only the piece needed for report assignment is included here.
// Adjust the endpoint path if your company.routes.js exposes admins
// differently (e.g. "/company/hr-admins" or via a query param on /company/users).

import API from "../axios";

export const companyApi = {
  listAdmins: () => API.get("/company/admins").then((r) => r.data),
};

export default companyApi;
