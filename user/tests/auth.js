import { test as base, expect } from "@playwright/test";

/**
 * Authenticated fixtures.
 *
 * The app bootstraps from `localStorage.accessToken` → `GET /auth/me`
 * (see src/components/AuthContext.jsx). There is no backend in CI, so we seed
 * the token and fulfil `/auth/me` at the network layer. Every other API call
 * is stubbed with an empty-but-valid envelope, which is what an account with
 * no data would return — so pages must render their chrome, empty states and
 * headers without throwing.
 *
 * That is exactly the coverage the rebrand needs: it asserts on presentation,
 * not on business data.
 */

export const USERS = {
  admin: {
    id: "u-admin-1",
    employeeId: "e-admin-1",
    firstName: "Tunde",
    lastName: "Adeyemi",
    email: "tunde.adeyemi@bantahr.test",
    role: "hr_admin",
    jobTitle: "HR Administrator",
    department: "People Operations",
    employeeCode: "BH-0001",
    companyId: "c-1",
  },
  employee: {
    id: "u-emp-1",
    employeeId: "e-emp-1",
    firstName: "Ngozi",
    lastName: "Madu",
    email: "ngozi.madu@bantahr.test",
    role: "employee",
    jobTitle: "Customer Success Specialist",
    department: "Customer Success",
    employeeCode: "BH-0042",
    companyId: "c-1",
  },
  manager: {
    id: "u-mgr-1",
    employeeId: "e-mgr-1",
    firstName: "Adaeze",
    lastName: "Okonkwo",
    email: "adaeze.okonkwo@bantahr.test",
    role: "manager",
    jobTitle: "Head of People Operations",
    department: "People Operations",
    employeeCode: "BH-0007",
    companyId: "c-1",
    isManager: true,
  },
};

/**
 * An empty-but-well-formed response. Endpoints in this app variously return a
 * bare array, `{data: []}`, or `{results: []}` — returning a superset keeps
 * every consumer's destructuring happy without knowing which shape it wants.
 */
const EMPTY = {
  success: true,
  data: [],
  results: [],
  items: [],
  rows: [],
  count: 0,
  total: 0,
  totalPages: 0,
  page: 1,
  meta: { total: 0, page: 1, pages: 0 },
};

export async function installApiMocks(context, user) {
  // /auth/me is the only call whose shape actually matters
  await context.route("**/api/auth/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user }),
    }),
  );

  // Everything else: a valid empty envelope, so pages render their zero state
  await context.route("**/api/**", (route) => {
    if (route.request().url().includes("/auth/me")) return route.fallback();
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(EMPTY),
    });
  });

  await context.addInitScript(() => {
    localStorage.setItem("accessToken", "e2e-test-token");
    localStorage.setItem("refreshToken", "e2e-refresh-token");
  });
}

/** `test` with an `as` helper: `await as("admin")` then navigate. */
export const test = base.extend({
  as: async ({ context, page }, use) => {
    await use(async (who) => {
      const user = USERS[who];
      if (!user) throw new Error(`unknown fixture user: ${who}`);
      await installApiMocks(context, user);
      return { user, page };
    });
  },
});

export { expect };

/** Routes behind ProtectedRoute (employee) and AdminRoute (hr_admin/manager). */
export const EMPLOYEE_ROUTES = [
  "/dashboard",
  "/leave",
  "/payslips",
  "/attendance",
  "/documents",
  "/team",
  "/benefits",
  "/requests",
  "/announcements",
  "/settings",
  "/employeeprofile",
];

export const ADMIN_ROUTES = [
  "/admin/dashboard",
  "/admin/employeemanagement/admin-employees",
  "/admin/employeemanagement/admin-departments",
  "/admin/employeemanagement/admin-jobroles",
  "/admin/payroll/admin-payroll",
  "/admin/attendance/admin-attendance",
  "/admin/leave-management",
  "/admin/performance/admin-performance",
  "/admin/documents/admin-documents",
  "/admin/benefits/admin-benefits",
  "/admin/announcements",
  "/admin/reports/admin-reports",
  "/admin/settings/admin-settings",
];
