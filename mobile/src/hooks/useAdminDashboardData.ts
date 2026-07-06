// src/hooks/useAdminDashboardData.ts
// Fetches all data the admin dashboard needs in parallel.
// Mirrors useDashboardData shape so components stay consistent.

import { useState, useCallback, useEffect } from "react";
import { getEmployees } from "../api/service/employeeApi";
import { getAnnouncementFeed } from "../api/service/announcementApi";
import { leaveApi } from "../api/service/leaveApi";

type AdminDashboardData = {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaveCount: number;
  pendingLeaveRequests: any[];
  announcements: any[];
  recentEmployees: any[];
};

const empty: AdminDashboardData = {
  totalEmployees: 0,
  activeEmployees: 0,
  pendingLeaveCount: 0,
  pendingLeaveRequests: [],
  announcements: [],
  recentEmployees: [],
};

export function useAdminDashboardData() {
  const [data, setData] = useState<AdminDashboardData>(empty);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [empRes, annRes, leaveRes] = await Promise.allSettled([
        getEmployees({ limit: 100 }),
        getAnnouncementFeed({ limit: 5 }),
        leaveApi.getAllRequests({ status: "pending", limit: 50 }),
      ]);

      const employees: any[] =
        empRes.status === "fulfilled"
          ? (empRes.value?.data ??
            empRes.value?.employees ??
            empRes.value ??
            [])
          : [];

      const announcements: any[] =
        annRes.status === "fulfilled" ? (annRes.value?.data ?? []) : [];

      const leaveRequests: any[] =
        leaveRes.status === "fulfilled"
          ? (leaveRes.value?.data ?? leaveRes.value?.requests ?? [])
          : [];

      const active = employees.filter(
        (e: any) =>
          (e.status ?? e.employment_status ?? "active").toLowerCase() ===
          "active",
      );

      setData({
        totalEmployees: employees.length,
        activeEmployees: active.length,
        pendingLeaveCount: leaveRequests.length,
        pendingLeaveRequests: leaveRequests.slice(0, 5),
        announcements,
        recentEmployees: employees.slice(0, 5),
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? "Failed to load dashboard data.",
      );
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return { data, loading, refreshing, error, refresh };
}
