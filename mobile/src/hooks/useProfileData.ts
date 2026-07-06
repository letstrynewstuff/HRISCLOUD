// // src/hooks/useProfileData.ts
// // Determines manager vs employee by actually checking if the logged-in
// // employee has any direct reports — same detection as the web version.
// //
// // Step 1: GET /employees/me         → own full profile
// // Step 2: GET /employees?managerId=<own id>  → direct reports
// //         If result.length > 0 → this user IS a manager
// //         Parallel: GET /attendance/today → team attendance summary
// //
// // No `is_manager` field needed — the presence of direct reports IS the signal.

// import { useState, useEffect, useCallback, useRef } from "react";
// import { getMyProfile, getEmployees } from "../api/service/employeeApi";
// import { attendanceApi } from "../api/service/attendanceApi";

// export type AttendanceSummary = {
//   present: number;
//   absent: number;
//   late: number;
// };

// export type ProfileData = {
//   emp: Record<string, any> | null;
//   isManager: boolean;
//   team: any[];
//   pendingApprovals: any[];
//   attendanceSummary: AttendanceSummary | null;
//   completionPct: number;
// };

// const EMPTY: ProfileData = {
//   emp: null,
//   isManager: false,
//   team: [],
//   pendingApprovals: [],
//   attendanceSummary: null,
//   completionPct: 0,
// };

// // Fields counted toward profile completion %
// const COMPLETION_FIELDS = [
//   "first_name",
//   "last_name",
//   "phone",
//   "personal_email",
//   "address",
//   "date_of_birth",
//   "gender",
//   "nationality",
//   "nok_name",
//   "nok_phone",
//   "bank_name",
//   "account_number",
// ];

// function calcCompletion(emp: Record<string, any>): number {
//   const filled = COMPLETION_FIELDS.filter((f) => !!emp[f]).length;
//   return Math.round((filled / COMPLETION_FIELDS.length) * 100);
// }

// async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
//   try {
//     return await fn();
//   } catch (e: any) {
//     console.warn("[profile]", e?.message ?? e);
//     return null;
//   }
// }

// export function useProfileData() {
//   const [data, setData] = useState<ProfileData>(EMPTY);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const loaderRef = useRef<any>(null);

//   const load = useCallback(async (isRefresh = false) => {
//     isRefresh ? setRefreshing(true) : setLoading(true);
//     setError(null);

//     try {
//       // ── Step 1: own profile ────────────────────────────────
//       const profileRes = await getMyProfile();
//       const emp: Record<string, any> =
//         profileRes.employee ?? profileRes.data ?? profileRes;
//       const completionPct = calcCompletion(emp);

//       // ── Step 2: check for direct reports ──────────────────
//       // We pass the employee's own id as managerId to get their team.
//       // An empty result means regular employee; any result means manager.
//       const teamRes = await safe(() =>
//         getEmployees({ managerId: emp.id, limit: 200 }),
//       );

//       const team: any[] = teamRes?.employees ?? teamRes?.data ?? [];

//       const isManager = team.length > 0;

//       if (!isManager) {
//         // Regular employee — no extra fetches needed
//         setData({
//           emp,
//           isManager: false,
//           team: [],
//           pendingApprovals: [],
//           attendanceSummary: null,
//           completionPct,
//         });
//         return;
//       }

//       // ── Step 3 (manager only): attendance summary ──────────
//       const attendanceRes = await safe(() => attendanceApi.getToday());

//       let attendanceSummary: AttendanceSummary | null = null;

//       if (attendanceRes) {
//         const records: any[] =
//           attendanceRes.data ??
//           attendanceRes.attendance ??
//           attendanceRes.records ??
//           [];

//         // Filter to only this manager's team members
//         const teamIdSet = new Set(team.map((t: any) => t.id));

//         const teamRecords = Array.isArray(records)
//           ? records.filter((r: any) =>
//               teamIdSet.has(r.employee_id ?? r.employeeId),
//             )
//           : [];

//         attendanceSummary = {
//           present: teamRecords.filter(
//             (r: any) =>
//               r.status === "present" ||
//               (r.clock_in_time && !r.clock_out_time) ||
//               r.clockInTime,
//           ).length,
//           absent: teamRecords.filter((r: any) => r.status === "absent").length,
//           late: teamRecords.filter((r: any) => r.status === "late").length,
//         };
//       }

//       setData({
//         emp,
//         isManager: true,
//         team,
//         pendingApprovals: [], // extend later: leaveApi.getAllRequests({ managerId: emp.id, status: 'pending' })
//         attendanceSummary,
//         completionPct,
//       });
//     } catch (err: any) {
//       setError(err?.response?.data?.message ?? "Failed to load profile.");
//     } finally {
//       isRefresh ? setRefreshing(false) : setLoading(false);
//     }
//   }, []);

//   // useEffect(() => {
//   //   load();
//   // }, [load]);
//   useEffect(() => {
//     if (loading) {
//       loaderRef.current?.show();
//     } else {
//       loaderRef.current?.hide();
//     }
//   }, [loading]);

//   const refresh = useCallback(() => load(true), [load]);

//   return { data, loading, refreshing, error, refresh };
// }


// src/hooks/useProfileData.ts
// Determines manager vs employee by actually checking if the logged-in
// employee has any direct reports — same detection as the web version.
//
// Step 1: GET /employees/me         → own full profile
// Step 2: GET /employees?managerId=<own id>  → direct reports
//         If result.length > 0 → this user IS a manager
//         Parallel: GET /attendance/today → team attendance summary
//
// No `is_manager` field needed — the presence of direct reports IS the signal.

import { useState, useEffect, useCallback } from "react";
import { getMyProfile, getEmployees } from "../api/service/employeeApi";
import { attendanceApi } from "../api/service/attendanceApi";

export type AttendanceSummary = {
  present: number;
  absent: number;
  late: number;
};

export type ProfileData = {
  emp: Record<string, any> | null;
  isManager: boolean;
  team: any[];
  pendingApprovals: any[];
  attendanceSummary: AttendanceSummary | null;
  completionPct: number;
};

const EMPTY: ProfileData = {
  emp: null,
  isManager: false,
  team: [],
  pendingApprovals: [],
  attendanceSummary: null,
  completionPct: 0,
};

// Fields counted toward profile completion %
const COMPLETION_FIELDS = [
  "first_name",
  "last_name",
  "phone",
  "personal_email",
  "address",
  "date_of_birth",
  "gender",
  "nationality",
  "nok_name",
  "nok_phone",
  "bank_name",
  "account_number",
];

function calcCompletion(emp: Record<string, any>): number {
  const filled = COMPLETION_FIELDS.filter((f) => !!emp[f]).length;
  return Math.round((filled / COMPLETION_FIELDS.length) * 100);
}

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (e: any) {
    console.warn("[profile]", e?.message ?? e);
    return null;
  }
}

export function useProfileData() {
  const [data, setData] = useState<ProfileData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      // ── Step 1: own profile ────────────────────────────────
      const profileRes = await getMyProfile();
      const emp: Record<string, any> =
        profileRes.employee ?? profileRes.data ?? profileRes;
      const completionPct = calcCompletion(emp);

      // ── Step 2: check for direct reports ──────────────────
      const teamRes = await safe(() =>
        getEmployees({ managerId: emp.id, limit: 200 }),
      );

      const team: any[] = teamRes?.employees ?? teamRes?.data ?? [];
      const isManager = team.length > 0;

      if (!isManager) {
        setData({
          emp,
          isManager: false,
          team: [],
          pendingApprovals: [],
          attendanceSummary: null,
          completionPct,
        });
        return;
      }

      // ── Step 3 (manager only): attendance summary ──────────
      const attendanceRes = await safe(() => attendanceApi.getToday());

      let attendanceSummary: AttendanceSummary | null = null;

      if (attendanceRes) {
        const records: any[] =
          attendanceRes.data ??
          attendanceRes.attendance ??
          attendanceRes.records ??
          [];

        const teamIdSet = new Set(team.map((t: any) => t.id));

        const teamRecords = Array.isArray(records)
          ? records.filter((r: any) =>
              teamIdSet.has(r.employee_id ?? r.employeeId),
            )
          : [];

        attendanceSummary = {
          present: teamRecords.filter(
            (r: any) =>
              r.status === "present" ||
              (r.clock_in_time && !r.clock_out_time) ||
              r.clockInTime,
          ).length,
          absent: teamRecords.filter((r: any) => r.status === "absent").length,
          late: teamRecords.filter((r: any) => r.status === "late").length,
        };
      }

      setData({
        emp,
        isManager: true,
        team,
        pendingApprovals: [],
        attendanceSummary,
        completionPct,
      });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load profile.");
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  // ✅ THIS WAS COMMENTED OUT — that's why it loaded forever
  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { data, loading, refreshing, error, refresh };
}