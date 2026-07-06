// // src/hooks/useDashboardData.ts
// // Fetches everything the employee dashboard needs in one parallel batch.
// // Each call is independently wrapped so one failing endpoint (e.g. no
// // payslip yet, no upcoming training) doesn't blank out the whole screen.

// import { useState, useCallback, useEffect } from "react";
// import { attendanceApi } from "../api/service/attendanceApi";
// import { leaveApi } from "../api/service/leaveApi";
// import { timesheetApi } from "../api/service/timesheetApi";
// import * as payrollApi from "../api/service/payrollApi";
// import { getAnnouncementFeed } from "../api/service/announcementApi";
// import { useAuth } from "./useAuth";

// // ─── Types ──────────────────────────────────────────────────
// export type AttendanceToday = {
//   status: "Present" | "Absent" | "On Leave" | "Not Clocked In";
//   clockedIn: boolean;
//   clockInTime: string | null;
//   clockOutTime: string | null;
//   officeName: string | null;
// };

// export type DashboardData = {
//   attendance: AttendanceToday | null;
//   leaveBalanceDays: number | null;
//   timesheetLoggedToday: string | null; // formatted "Xh Ym"
//   latestPayslipLabel: string | null; // "April 2024"
//   announcements: any[];
// };

// const EMPTY: DashboardData = {
//   attendance: null,
//   leaveBalanceDays: null,
//   timesheetLoggedToday: null,
//   latestPayslipLabel: null,
//   announcements: [],
// };

// // ─── Helpers ────────────────────────────────────────────────
// function minutesToLabel(mins: number) {
//   const h = Math.floor(mins / 60);
//   const m = Math.round(mins % 60);
//   if (h === 0) return `${m}m`;
//   if (m === 0) return `${h}h`;
//   return `${h}h ${m}m`;
// }

// function monthYearLabel(month: number, year: number) {
//   const d = new Date(year, month - 1, 1);
//   return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
// }

// // Safe wrapper — never throws, returns null on failure, logs once
// async function safe<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
//   try {
//     return await fn();
//   } catch (err: any) {
//     console.warn(`[dashboard] ${label} failed:`, err?.message ?? err);
//     return null;
//   }
// }

// export function useDashboardData() {
//   const { employee } = useAuth();
//   const [data, setData] = useState<DashboardData>(EMPTY);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const load = useCallback(
//     async (isRefresh = false) => {
//       isRefresh ? setRefreshing(true) : setLoading(true);

//       const [
//         attendanceRes,
//         leaveRes,
//         timesheetRes,
//         payslipRes,
//         announcementsRes,
//       ] = await Promise.all([
//         safe("attendance/today", () =>
//           attendanceApi.getMyAttendance({ date: "today" }),
//         ),
//         safe("leave/balances/me", () => leaveApi.getMyBalances()),
//         safe("timesheets/my/summary", () =>
//           timesheetApi.getMySummary({
//             startDate: new Date().toISOString().slice(0, 10),
//             endDate: new Date().toISOString().slice(0, 10),
//           }),
//         ),
//         safe("payroll/payslip/me", () => {
//           const now = new Date();
//           // try current month first; backend returns 404 if not yet generated —
//           // safe() swallows that and we just show nothing rather than crash.
//           return payrollApi.getMyPayslip(now.getMonth() + 1, now.getFullYear());
//         }),
//         safe("announcements/feed", () => getAnnouncementFeed({ limit: 3 })),
//       ]);

//       // ── Shape attendance ────────────────────────────────────
//       let attendance: AttendanceToday | null = null;
//       if (attendanceRes) {
//         const a =
//           attendanceRes.attendance ?? attendanceRes.data ?? attendanceRes;
//         const clockedIn = !!a?.clockInTime && !a?.clockOutTime;
//         attendance = {
//           status: a?.status ?? (clockedIn ? "Present" : "Not Clocked In"),
//           clockedIn,
//           clockInTime: a?.clockInTime
//             ? new Date(a.clockInTime).toLocaleTimeString([], {
//                 hour: "numeric",
//                 minute: "2-digit",
//               })
//             : null,
//           clockOutTime: a?.clockOutTime
//             ? new Date(a.clockOutTime).toLocaleTimeString([], {
//                 hour: "numeric",
//                 minute: "2-digit",
//               })
//             : null,
//           officeName:
//             a?.officeName ?? a?.location ?? employee?.department ?? null,
//         };
//       }

//       // ── Shape leave balance ─────────────────────────────────
//       let leaveBalanceDays: number | null = null;
//       if (leaveRes) {
//         const balances = leaveRes.balances ?? leaveRes.data ?? leaveRes;
//         if (Array.isArray(balances)) {
//           leaveBalanceDays = balances.reduce(
//             (sum: number, b: any) =>
//               sum + Number(b.remainingDays ?? b.remaining_days ?? 0),
//             0,
//           );
//         } else if (balances?.totalRemaining != null) {
//           leaveBalanceDays = Number(balances.totalRemaining);
//         }
//       }

//       // ── Shape timesheet ──────────────────────────────────────
//       let timesheetLoggedToday: string | null = null;
//       if (timesheetRes) {
//         const mins =
//           timesheetRes.totalMinutesToday ??
//           timesheetRes.summary?.totalMinutes ??
//           timesheetRes.totalMinutes ??
//           null;
//         if (mins != null) timesheetLoggedToday = minutesToLabel(Number(mins));
//       }

//       // ── Shape payslip ────────────────────────────────────────
//       let latestPayslipLabel: string | null = null;
//       if (payslipRes) {
//         const p = payslipRes.payslip ?? payslipRes.data ?? payslipRes;
//         if (p?.month && p?.year)
//           latestPayslipLabel = monthYearLabel(Number(p.month), Number(p.year));
//       }

//       // ── Shape announcements ──────────────────────────────────
//       const announcements = announcementsRes?.data ?? [];

//       setData({
//         attendance,
//         leaveBalanceDays,
//         timesheetLoggedToday,
//         latestPayslipLabel,
//         announcements,
//       });

//       isRefresh ? setRefreshing(false) : setLoading(false);
//     },
//     [employee],
//   );

//   useEffect(() => {
//     load();
//   }, [load]);

//   const refresh = useCallback(() => load(true), [load]);

//   return { data, loading, refreshing, refresh };
// }

// // src/hooks/useDashboardData.ts
// // FIXED: Correctly maps backend response shapes for attendance, leave, etc.

// import { useState, useCallback, useEffect } from "react";
// import { attendanceApi } from "../api/service/attendanceApi";
// import { leaveApi } from "../api/service/leaveApi";
// import { timesheetApi } from "../api/service/timesheetApi";
// import * as payrollApi from "../api/service/payrollApi";
// import { getAnnouncementFeed } from "../api/service/announcementApi";
// import { useAuth } from "./useAuth";

// // ─── Types ──────────────────────────────────────────────────
// export type AttendanceToday = {
//   status: "Present" | "Absent" | "On Leave" | "Not Clocked In";
//   clockedIn: boolean;
//   clockInTime: string | null;
//   clockOutTime: string | null;
//   officeName: string | null;
// };

// export type DashboardData = {
//   attendance: AttendanceToday | null;
//   leaveBalanceDays: number | null;
//   timesheetLoggedToday: string | null;
//   latestPayslipLabel: string | null;
//   announcements: any[];
// };

// const EMPTY: DashboardData = {
//   attendance: null,
//   leaveBalanceDays: null,
//   timesheetLoggedToday: null,
//   latestPayslipLabel: null,
//   announcements: [],
// };

// // ─── Helpers ────────────────────────────────────────────────
// function minutesToLabel(mins: number) {
//   const h = Math.floor(mins / 60);
//   const m = Math.round(mins % 60);
//   if (h === 0) return `${m}m`;
//   if (m === 0) return `${h}h`;
//   return `${h}h ${m}m`;
// }

// function monthYearLabel(month: number, year: number) {
//   const d = new Date(year, month - 1, 1);
//   return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
// }

// function parseDate(d: string | Date | null): Date | null {
//   if (!d) return null;
//   try {
//     const date = typeof d === "string" ? new Date(d) : d;
//     return isNaN(date.getTime()) ? null : date;
//   } catch {
//     return null;
//   }
// }

// // Safe wrapper — never throws, returns null on failure, logs once
// async function safe<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
//   try {
//     return await fn();
//   } catch (err: any) {
//     console.warn(`[dashboard] ${label} failed:`, err?.message ?? err);
//     return null;
//   }
// }

// // Extract array from various backend response shapes
// function extractArray(res: any): any[] {
//   if (!res) return [];
//   if (Array.isArray(res)) return res;
//   if (res.rows && Array.isArray(res.rows)) return res.rows;
//   if (res.data && Array.isArray(res.data)) return res.data;
//   if (res.attendance && Array.isArray(res.attendance)) return res.attendance;
//   if (res.records && Array.isArray(res.records)) return res.records;
//   if (res.entries && Array.isArray(res.entries)) return res.entries;
//   if (res.results && Array.isArray(res.results)) return res.results;
//   if (typeof res === "object" && res.id) return [res];
//   return [];
// }

// export function useDashboardData() {
//   const { employee } = useAuth();
//   const [data, setData] = useState<DashboardData>(EMPTY);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const load = useCallback(
//     async (isRefresh = false) => {
//       isRefresh ? setRefreshing(true) : setLoading(true);

//       const [
//         attendanceRes,
//         leaveRes,
//         timesheetRes,
//         payslipRes,
//         announcementsRes,
//       ] = await Promise.all([
//         safe("attendance/today", () =>
//           attendanceApi.getMyAttendance({ date: "today" }),
//         ),
//         safe("leave/balances/me", () => leaveApi.getMyBalances()),
//         safe("timesheets/my/summary", () =>
//           timesheetApi.getMySummary({
//             startDate: new Date().toISOString().slice(0, 10),
//             endDate: new Date().toISOString().slice(0, 10),
//           }),
//         ),
//         safe("payroll/payslip/me", () => {
//           const now = new Date();
//           return payrollApi.getMyPayslip(now.getMonth() + 1, now.getFullYear());
//         }),
//         safe("announcements/feed", () => getAnnouncementFeed({ limit: 3 })),
//       ]);

//       console.log(
//         "[dashboard] attendanceRes:",
//         JSON.stringify(attendanceRes, null, 2),
//       );
//       console.log("[dashboard] leaveRes:", JSON.stringify(leaveRes, null, 2));

//       // ── Shape attendance ────────────────────────────────────
//       // FIXED: Backend returns { rows: [{ clockIn, clockOut, onBreak, status, ... }] }
//       //        or the record directly. Fields are clockIn/clockOut (not clockInTime/clockOutTime).
//       let attendance: AttendanceToday | null = null;
//       const attendanceRecords = extractArray(attendanceRes);
//       const todayRecord = attendanceRecords[0] ?? null;

//       if (todayRecord) {
//         const cin = todayRecord.clockIn ?? todayRecord.clock_in;
//         const cout = todayRecord.clockOut ?? todayRecord.clock_out;
//         const clockedIn = !!cin && !cout;
//         const onBreak = todayRecord.onBreak ?? todayRecord.on_break ?? false;

//         attendance = {
//           status: todayRecord.status
//             ? String(todayRecord.status).charAt(0).toUpperCase() +
//               String(todayRecord.status).slice(1)
//             : clockedIn
//               ? "Present"
//               : "Not Clocked In",
//           clockedIn: clockedIn && !onBreak, // Don't show as "clocked in" if on break
//           clockInTime: cin
//             ? new Date(cin).toLocaleTimeString([], {
//                 hour: "numeric",
//                 minute: "2-digit",
//               })
//             : null,
//           clockOutTime: cout
//             ? new Date(cout).toLocaleTimeString([], {
//                 hour: "numeric",
//                 minute: "2-digit",
//               })
//             : null,
//           officeName:
//             todayRecord.clockInLocation?.address ??
//             todayRecord.location ??
//             employee?.department ??
//             null,
//         };
//       }

//       // ── Shape leave balance ─────────────────────────────────
//       // FIXED: Backend returns { rows: [{ remainingDays, ... }] } or { data: { ... } }
//       let leaveBalanceDays: number | null = null;
//       if (leaveRes) {
//         const leaveRows = extractArray(leaveRes);
//         if (leaveRows.length > 0) {
//           // Sum remaining days across all leave types
//           leaveBalanceDays = leaveRows.reduce(
//             (sum: number, b: any) =>
//               sum +
//               Number(b.remainingDays ?? b.remaining_days ?? b.balance ?? 0),
//             0,
//           );
//         } else {
//           // Try object shape: { totalRemaining, annualLeave, ... }
//           const balances = leaveRes.data ?? leaveRes;
//           if (balances?.totalRemaining != null) {
//             leaveBalanceDays = Number(balances.totalRemaining);
//           } else if (balances?.annualLeave != null) {
//             leaveBalanceDays = Number(balances.annualLeave);
//           } else if (balances?.balance != null) {
//             leaveBalanceDays = Number(balances.balance);
//           }
//         }
//       }

//       // ── Shape timesheet ──────────────────────────────────────
//       let timesheetLoggedToday: string | null = null;
//       if (timesheetRes) {
//         const mins =
//           timesheetRes.totalMinutesToday ??
//           timesheetRes.summary?.totalMinutes ??
//           timesheetRes.totalMinutes ??
//           null;
//         if (mins != null) timesheetLoggedToday = minutesToLabel(Number(mins));
//       }

//       // ── Shape payslip ────────────────────────────────────────
//       let latestPayslipLabel: string | null = null;
//       if (payslipRes) {
//         const p = payslipRes.payslip ?? payslipRes.data ?? payslipRes;
//         if (p?.month && p?.year)
//           latestPayslipLabel = monthYearLabel(Number(p.month), Number(p.year));
//       }

//       // ── Shape announcements ──────────────────────────────────
//       const announcements = extractArray(announcementsRes);

//       setData({
//         attendance,
//         leaveBalanceDays,
//         timesheetLoggedToday,
//         latestPayslipLabel,
//         announcements,
//       });

//       isRefresh ? setRefreshing(false) : setLoading(false);
//     },
//     [employee],
//   );

//   useEffect(() => {
//     load();
//   }, [load]);

//   const refresh = useCallback(() => load(true), [load]);

//   return { data, loading, refreshing, refresh };
// }



// src/hooks/useDashboardData.ts
// FIXED: Correctly maps backend response shapes for attendance, leave, etc.
//        Now includes onBreak state for the dashboard clock-in card.

import { useState, useCallback, useEffect } from "react";
import { attendanceApi } from "../api/service/attendanceApi";
import { leaveApi } from "../api/service/leaveApi";
import { timesheetApi } from "../api/service/timesheetApi";
import * as payrollApi from "../api/service/payrollApi";
import { getAnnouncementFeed } from "../api/service/announcementApi";
import { useAuth } from "./useAuth";

// ─── Types ──────────────────────────────────────────────────
export type AttendanceToday = {
  status: "Present" | "Absent" | "On Leave" | "Not Clocked In";
  clockedIn: boolean;
  onBreak: boolean;
  clockInTime: string | null;
  clockOutTime: string | null;
  officeName: string | null;
};

export type DashboardData = {
  attendance: AttendanceToday | null;
  leaveBalanceDays: number | null;
  timesheetLoggedToday: string | null;
  latestPayslipLabel: string | null;
  announcements: any[];
};

const EMPTY: DashboardData = {
  attendance: null,
  leaveBalanceDays: null,
  timesheetLoggedToday: null,
  latestPayslipLabel: null,
  announcements: [],
};

// ─── Helpers ────────────────────────────────────────────────
function minutesToLabel(mins: number) {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function monthYearLabel(month: number, year: number) {
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function parseDate(d: string | Date | null): Date | null {
  if (!d) return null;
  try {
    const date = typeof d === "string" ? new Date(d) : d;
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/** Get user's LOCAL date as YYYY-MM-DD string (not UTC!) */
function getLocalDateStr(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Check if a record's date matches the user's local today */
function isRecordFromToday(record: any): boolean {
  const dateField =
    record.attendanceDate ?? record.date ?? record.createdAt ?? record.created_at;
  if (!dateField) return false;
  const recordLocalStr = getLocalDateStr(new Date(dateField));
  return recordLocalStr === getLocalDateStr();
}

// Safe wrapper — never throws, returns null on failure, logs once
async function safe<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err: any) {
    console.warn(`[dashboard] ${label} failed:`, err?.message ?? err);
    return null;
  }
}

// Extract array from various backend response shapes
function extractArray(res: any): any[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.rows && Array.isArray(res.rows)) return res.rows;
  if (res.data && Array.isArray(res.data)) return res.data;
  if (res.attendance && Array.isArray(res.attendance)) return res.attendance;
  if (res.records && Array.isArray(res.records)) return res.records;
  if (res.entries && Array.isArray(res.entries)) return res.entries;
  if (res.results && Array.isArray(res.results)) return res.results;
  if (typeof res === "object" && res.id) return [res];
  return [];
}

export function useDashboardData() {
  const { employee } = useAuth();
  const [data, setData] = useState<DashboardData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);

      const [
        attendanceRes,
        leaveRes,
        timesheetRes,
        payslipRes,
        announcementsRes,
      ] = await Promise.all([
        // FIXED: Fetch recent history instead of ?date=today (UTC bug)
        safe("attendance/recent", () =>
          attendanceApi.getMyAttendance({ limit: 10 }),
        ),
        safe("leave/balances/me", () => leaveApi.getMyBalances()),
        safe("timesheets/my/summary", () =>
          timesheetApi.getMySummary({
            startDate: new Date().toISOString().slice(0, 10),
            endDate: new Date().toISOString().slice(0, 10),
          }),
        ),
        safe("payroll/payslip/me", () => {
          const now = new Date();
          return payrollApi.getMyPayslip(now.getMonth() + 1, now.getFullYear());
        }),
        safe("announcements/feed", () => getAnnouncementFeed({ limit: 3 })),
      ]);

      console.log(
        "[dashboard] attendanceRes:",
        JSON.stringify(attendanceRes, null, 2),
      );

      // ── Shape attendance ────────────────────────────────────
      let attendance: AttendanceToday | null = null;
      const attendanceRecords = extractArray(attendanceRes);

      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      // 1. Find any open session (has clockIn, no clockOut)
      const openSession = attendanceRecords.find((r: any) => {
        const cin = r.clockIn ?? r.clock_in;
        const cout = r.clockOut ?? r.clock_out;
        return cin && !cout;
      });

      // 2. Find record matching today's LOCAL date
      const todayMatch = attendanceRecords.find(isRecordFromToday);

      // 3. Most recent record within last 48h
      const recentFallback = attendanceRecords.find((r: any) => {
        const dateField = r.attendanceDate ?? r.date ?? r.createdAt ?? r.created_at;
        if (!dateField) return false;
        return now - new Date(dateField).getTime() < 2 * oneDayMs;
      });

      const todayRecord = openSession ?? todayMatch ?? recentFallback ?? null;

      if (todayRecord) {
        const cin = todayRecord.clockIn ?? todayRecord.clock_in;
        const cout = todayRecord.clockOut ?? todayRecord.clock_out;
        const clockedIn = !!cin && !cout;
        const onBreak = todayRecord.onBreak ?? todayRecord.on_break ?? false;

        attendance = {
          status: todayRecord.status
            ? String(todayRecord.status).charAt(0).toUpperCase() +
              String(todayRecord.status).slice(1)
            : clockedIn
              ? "Present"
              : "Not Clocked In",
          clockedIn: clockedIn && !onBreak,
          onBreak: onBreak,
          clockInTime: cin
            ? new Date(cin).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })
            : null,
          clockOutTime: cout
            ? new Date(cout).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })
            : null,
          officeName:
            todayRecord.clockInLocation?.address ??
            todayRecord.location ??
            employee?.department ??
            null,
        };
      }

      // ── Shape leave balance ─────────────────────────────────
      let leaveBalanceDays: number | null = null;
      if (leaveRes) {
        const leaveRows = extractArray(leaveRes);
        if (leaveRows.length > 0) {
          leaveBalanceDays = leaveRows.reduce(
            (sum: number, b: any) =>
              sum +
              Number(b.remainingDays ?? b.remaining_days ?? b.balance ?? 0),
            0,
          );
        } else {
          const balances = leaveRes.data ?? leaveRes;
          if (balances?.totalRemaining != null) {
            leaveBalanceDays = Number(balances.totalRemaining);
          } else if (balances?.annualLeave != null) {
            leaveBalanceDays = Number(balances.annualLeave);
          } else if (balances?.balance != null) {
            leaveBalanceDays = Number(balances.balance);
          }
        }
      }

      // ── Shape timesheet ──────────────────────────────────────
      let timesheetLoggedToday: string | null = null;
      if (timesheetRes) {
        const mins =
          timesheetRes.totalMinutesToday ??
          timesheetRes.summary?.totalMinutes ??
          timesheetRes.totalMinutes ??
          null;
        if (mins != null) timesheetLoggedToday = minutesToLabel(Number(mins));
      }

      // ── Shape payslip ────────────────────────────────────────
      let latestPayslipLabel: string | null = null;
      if (payslipRes) {
        const p = payslipRes.payslip ?? payslipRes.data ?? payslipRes;
        if (p?.month && p?.year)
          latestPayslipLabel = monthYearLabel(Number(p.month), Number(p.year));
      }

      // ── Shape announcements ──────────────────────────────────
      const announcements = extractArray(announcementsRes);

      setData({
        attendance,
        leaveBalanceDays,
        timesheetLoggedToday,
        latestPayslipLabel,
        announcements,
      });

      isRefresh ? setRefreshing(false) : setLoading(false);
    },
    [employee],
  );

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { data, loading, refreshing, refresh };
}