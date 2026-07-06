// src/components/admin/attendance/attendanceHelpers.ts
// Shared helpers for the mobile Attendance module — mirrors the
// formatting utilities scattered across the web attendance pages.

import C from "../styles/colors";

export const STATUS_CFG: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  present: { bg: "#D1FAE5", color: "#10B981", label: "Present" },
  late: { bg: "#FEF3C7", color: "#F59E0B", label: "Late" },
  absent: { bg: "#FEE2E2", color: "#EF4444", label: "Absent" },
};

export const TIMESHEET_STATUS_CFG: Record<
  string,
  { bg: string; color: string }
> = {
  Draft: { bg: C.surfaceAlt, color: C.textMuted },
  Submitted: { bg: "#FEF3C7", color: "#D97706" },
  Approved: { bg: "#D1FAE5", color: "#059669" },
  Rejected: { bg: "#FEE2E2", color: "#DC2626" },
};

// export function initials(name = "") {
//   return name
//     .split(" ")
//     .filter(Boolean)
//     .map((n) => n[0])
//     .join("")
//     .toUpperCase()
//     .slice(0, 2);
// }
// src/components/admin/attendance/attendanceHelpers.ts

export function initials(input: any = "") {
  let name = "";
  if (typeof input === "string") {
    name = input;
  } else if (input && typeof input === "object") {
    // Handle employee objects (snake_case or camelCase)
    const first = input.first_name ?? input.firstName ?? "";
    const last = input.last_name ?? input.lastName ?? "";
    name = `${first} ${last}`;
  }
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
export function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fmtShortDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB");
}

export function fmtClock(t?: string | null) {
  if (!t) return "—";
  const d = new Date(t);
  if (isNaN(d.getTime())) return t;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function fmtTime(t?: string | null) {
  if (!t) return "—";
  if (typeof t === "string" && /^\d{2}:\d{2}/.test(t)) return t.slice(0, 5);
  const d = new Date(t);
  return isNaN(d.getTime())
    ? t
    : d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}

export function fmtMinutes(mins?: number | null) {
  if (!mins || mins <= 0) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
}

export function fmtHours(h?: number | null) {
  const n = Number(h ?? 0);
  return `${n.toFixed(1)}h`;
}

// Normalizes employee records into a lookup map keyed by id — used by
// AttendanceLog / Corrections / Overtime, mirroring the web `empMap` pattern.
export function buildEmpMap(employees: any[]) {
  const map: Record<
    string,
    { name: string; department: string; jobTitle: string }
  > = {};
  (employees ?? []).forEach((e) => {
    map[e.id] = {
      name: `${e.first_name ?? e.firstName ?? ""} ${e.last_name ?? e.lastName ?? ""}`.trim(),
      department: e.department_name ?? e.department ?? "—",
      jobTitle: e.job_title ?? e.jobTitle ?? "—",
    };
  });
  return map;
}
