// src/components/admin/department/deptHelpers.ts
// Shared helpers for the mobile Departments module.
// Mirrors the palette / name-formatting logic used on the web DepartmentsPage.

import C from "../styles/colors";

export const PALETTE = [
  { color: C.primary, bg: C.primaryLight },
  { color: C.accent, bg: C.accentLight },
  { color: C.success, bg: C.successLight },
  { color: C.purple, bg: C.purpleLight },
  { color: C.warning, bg: C.warningLight },
  { color: C.pink ?? C.accent, bg: C.pinkLight ?? C.accentLight },
  { color: C.orange ?? C.warning, bg: C.orangeLight ?? C.warningLight },
  { color: C.sky ?? C.primary, bg: C.skyLight ?? C.primaryLight },
];

export function getPalette(dept: any, index?: number) {
  const i =
    typeof index === "number"
      ? index
      : (dept?.id?.toString()?.charCodeAt(0) ?? 0) % PALETTE.length;
  return PALETTE[((i % PALETTE.length) + PALETTE.length) % PALETTE.length];
}

export const empFullName = (emp: any) =>
  emp?.full_name?.trim?.() ||
  `${emp?.first_name ?? ""} ${emp?.last_name ?? ""}`.trim() ||
  "Unknown";

export const empInitials = (emp: any) => {
  const name = empFullName(emp);
  return name
    .split(" ")
    .filter(Boolean)
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export const deptFmtDate = (d: string | null | undefined) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        month: "short",
        year: "numeric",
      })
    : "—";

// Normalizes employee records the same way the mobile employee screens do —
// API responses can be snake_case or camelCase depending on endpoint.
export function normalizeEmployee(emp: any) {
  return {
    ...emp,
    id: emp.id,
    department_id: emp.departmentId ?? emp.department_id ?? null,
    department:
      emp.departmentName ?? emp.department_name ?? emp.department ?? null,
    job_title: emp.jobTitle ?? emp.job_role_name ?? emp.job_title ?? null,
    first_name: emp.firstName ?? emp.first_name ?? null,
    last_name: emp.lastName ?? emp.last_name ?? null,
    full_name: emp.fullName ?? emp.full_name ?? null,
    status: emp.employment_status ?? emp.status ?? "active",
  };
}

export type DeptEmptyForm = {
  name: string;
  description: string;
  head_id: string;
  parent_department_id: string;
};

export const EMPTY_DEPT_FORM: DeptEmptyForm = {
  name: "",
  description: "",
  head_id: "",
  parent_department_id: "",
};
