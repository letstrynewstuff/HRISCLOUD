// src/pages/AttendancePage.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion as Motion } from "framer-motion";
import { useAuth } from "../components/useAuth";
import { attendanceApi } from "../api/service/attendanceApi";
import {
  Clock,
  Search,
  Menu,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Flame,
  Award,
  Filter,
  RefreshCw,
} from "lucide-react";

import AttendanceHero from "../components/attendance/AttendanceHero";
import StatTile from "../components/attendance/StatTile";
import AttendanceLogRow from "../components/attendance/AttendanceLogRow";
import AttendanceDetailSheet from "../components/attendance/AttendanceDetailSheet";
import { C } from "../admin/employeemanagement/sharedData";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "present", label: "Present" },
  { key: "late", label: "Late" },
  { key: "absent", label: "Absent" },
];

/* ─── Helpers (ported from mobile's attendance.tsx) ─── */
function fmtHours(h) {
  if (!h || h <= 0) return "—";
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function fmtTime(d) {
  if (!d) return null;
  try {
    const date = typeof d === "string" ? new Date(d) : d;
    if (isNaN(date.getTime())) return null;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return null;
  }
}

function fmtDate(d) {
  if (!d) return "—";
  try {
    const date = typeof d === "string" ? new Date(d) : d;
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function parseDate(d) {
  if (!d) return null;
  try {
    const date = typeof d === "string" ? new Date(d) : d;
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/** Get the user's LOCAL date as YYYY-MM-DD (not UTC) */
function getLocalDateStr(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isRecordFromToday(record) {
  const dateField = record.attendanceDate ?? record.date;
  if (!dateField) return false;
  return getLocalDateStr(new Date(dateField)) === getLocalDateStr();
}

function deriveStatus(entry) {
  if (entry.status) return entry.status.toLowerCase();

  const clockIn = entry.clockIn;
  const clockOut = entry.clockOut;

  if (!clockIn) return "absent";
  if (clockOut) return "present";

  const inTime = parseDate(clockIn);
  if (inTime) {
    const hour = inTime.getHours();
    const minute = inTime.getMinutes();
    if (hour > 9 || (hour === 9 && minute > 0)) return "late";
  }
  return "present";
}

function getHoursWorked(entry) {
  const hours = entry.hoursWorked ?? 0;
  if (hours) return parseFloat(String(hours));

  const clockIn = parseDate(entry.clockIn);
  const clockOut = parseDate(entry.clockOut);
  if (clockIn && clockOut) {
    return (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
  }
  return 0;
}

/* ════════════════════════════════════════════ MAIN COMPONENT ══ */
export default function AttendancePage() {
  const { employee } = useAuth();

  const [history, setHistory] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [dayStatus, setDayStatus] = useState("not-started"); // 'not-started' | 'active' | 'on-break' | 'done'
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);
  const [breakStartTime, setBreakStartTime] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [detailEntry, setDetailEntry] = useState(null);

  /* ─── Fetch attendance — mirrors mobile's load() ─── */
  const load = useCallback(async () => {
    setError(null);
    try {
      setLoading(true);
      const res = await attendanceApi.getMyAttendance({ limit: 31 });
      const allRecords = res.rows ?? [];
      setHistory(allRecords);

      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      const openSession = allRecords.find((r) => r.clockIn && !r.clockOut);
      const todayMatch = allRecords.find(isRecordFromToday);
      const recentFallback = allRecords.find((r) => {
        const dateField = r.attendanceDate ?? r.date;
        if (!dateField) return false;
        return now - new Date(dateField).getTime() < 2 * oneDayMs;
      });

      const today = openSession ?? todayMatch ?? recentFallback ?? null;
      setTodayRecord(today);

      if (today) {
        const cin = parseDate(today.clockIn);
        const cout = parseDate(today.clockOut);
        const bStart = parseDate(today.breakStartedAt);
        const isOnBreak = today.onBreak ?? false;

        setClockInTime(cin);
        setClockOutTime(cout);
        setBreakStartTime(bStart);

        if (cout) setDayStatus("done");
        else if (isOnBreak || bStart) setDayStatus("on-break");
        else if (cin) setDayStatus("active");
        else setDayStatus("not-started");
      } else {
        setDayStatus("not-started");
        setClockInTime(null);
        setClockOutTime(null);
        setBreakStartTime(null);
      }
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ─── Actions ─── */
  const handleClockIn = () => {
    if (actionLoading) return;
    setActionLoading(true);
    setError(null);

    const doClockIn = async (coords) => {
      try {
        await attendanceApi.clockIn(coords);
        await load();
      } catch (err) {
        setError(err?.response?.data?.message ?? "Failed to clock in.");
      } finally {
        setActionLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => doClockIn({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => doClockIn({}),
        { timeout: 5000 }
      );
    } else {
      doClockIn({});
    }
  };

  const handleClockOut = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    setError(null);
    try {
      await attendanceApi.clockOut();
      await load();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to clock out.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartBreak = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    setError(null);
    try {
      await attendanceApi.startBreak();
      await load();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to start break.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndBreak = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    setError(null);
    try {
      await attendanceApi.endBreak();
      await load();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to end break.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePressClock = () => {
    if (dayStatus === "not-started") handleClockIn();
    else if (dayStatus === "active") handleClockOut();
    else if (dayStatus === "on-break") handleEndBreak();
  };

  const handlePressBreak = () => {
    if (dayStatus === "active") handleStartBreak();
    else if (dayStatus === "on-break") handleEndBreak();
  };

  /* ─── Stats — mirrors mobile's useMemo exactly (see file header note) ─── */
  const stats = useMemo(() => {
    if (!history.length) {
      return { present: 0, late: 0, absent: 0, totalHours: 0, rate: 0, streak: 0 };
    }

    let present = 0,
      late = 0,
      absent = 0,
      totalHours = 0,
      workingDays = 0;

    for (const entry of history) {
      const status = deriveStatus(entry);
      const hours = getHoursWorked(entry);

      if (status === "present") present++;
      else if (status === "late") late++;
      else if (status === "absent") absent++;

      totalHours += hours;

      const date = parseDate(entry.attendanceDate ?? entry.date);
      if (date) {
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
      } else {
        workingDays++;
      }
    }

    const rate = workingDays > 0 ? Math.round(((present + late) / workingDays) * 100) : 0;

    let streak = 0;
    const sorted = [...history].sort((a, b) => {
      const da = parseDate(a.attendanceDate ?? a.date);
      const db = parseDate(b.attendanceDate ?? b.date);
      return (db?.getTime() ?? 0) - (da?.getTime() ?? 0);
    });

    for (const entry of sorted) {
      const status = deriveStatus(entry);
      if (status === "present" || status === "late") streak++;
      else if (status === "absent") break;
    }

    return { present, late, absent, totalHours, rate, streak };
  }, [history]);

  /* ─── Filtered log ─── */
  const filteredLog = useMemo(() => {
    const mapped = history.map((e) => {
      const status = deriveStatus(e);
      const hours = getHoursWorked(e);
      return {
        id: String(e.id ?? Math.random()),
        dateStr: fmtDate(e.attendanceDate ?? e.date),
        clockIn: fmtTime(e.clockIn),
        clockOut: fmtTime(e.clockOut),
        hoursLabel: fmtHours(hours),
        status,
        isManuallyEdited: e.isManuallyEdited ?? false,
      };
    });

    const bySearch = searchQuery
      ? mapped.filter((e) => e.dateStr.toLowerCase().includes(searchQuery.toLowerCase()))
      : mapped;

    if (activeFilter === "all") return bySearch;
    return bySearch.filter((e) => e.status === activeFilter);
  }, [history, activeFilter, searchQuery]);

  const breakCount = todayRecord?.breakCount ?? 0;

  /* ─────────────────────────── RENDER ─── */
  return (
    <div className="min-h-screen font-sans" style={{ background: C.bg, color: C.textPrimary }}>
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* ── TOP NAV ── */}
          <header
            className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{
              background: "rgba(240,242,248,0.85)",
              backdropFilter: "blur(12px)",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <button
              onClick={() => setSidebarOpen((p) => !p)}
              className="p-2 rounded-xl hidden md:flex"
              style={{ background: C.surface, border: `1px solid ${C.border}`, cursor: "pointer" }}
            >
              <Menu size={16} color={C.textSecondary} />
            </button>

            <div className="flex-1 max-w-xs relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" color={C.textMuted} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search attendance…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{ background: C.surface, border: `1.5px solid ${C.border}`, color: C.textPrimary }}
              />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={load}
                className="p-2 rounded-xl"
                style={{ background: C.surface, border: `1px solid ${C.border}`, cursor: "pointer" }}
                title="Refresh"
              >
                <RefreshCw size={14} color={C.textMuted} />
              </button>
              {employee?.avatar ? (
                <img src={employee.avatar} alt={employee.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: "linear-gradient(135deg,#6366F1,#06B6D4)" }}
                >
                  {employee?.initials ?? "?"}
                </div>
              )}
            </div>
          </header>

          {/* ── MAIN CONTENT: full-width web, responsive padding ── */}
          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6 w-full">
            {error && (
              <Motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: C.dangerLight, border: `1px solid ${C.danger}33` }}
              >
                <AlertTriangle size={14} color={C.danger} />
                <p className="text-sm flex-1" style={{ color: C.danger }}>
                  {error}
                </p>
              </Motion.div>
            )}

            {/* ── HERO ── */}
            <AttendanceHero
              employeeFirstName={employee?.firstName ?? employee?.name?.split(" ")[0]}
              dayStatus={dayStatus}
              clockInTime={clockInTime}
              clockOutTime={clockOutTime}
              breakStartTime={breakStartTime}
              breakCount={breakCount}
              actionLoading={actionLoading}
              onPressClock={handlePressClock}
              onPressBreak={handlePressBreak}
            />

            {/* ── THIS MONTH ── */}
            <div>
              <h3 className="text-sm font-bold mb-3" style={{ color: C.textPrimary }}>
                This Month
              </h3>
              <div className="flex flex-wrap gap-2.5">
                <StatTile
                  label="Present"
                  value={loading ? "—" : stats.present}
                  icon={<CheckCircle2 size={15} color={C.success} />}
                  color={C.success}
                  bg={C.successLight}
                />
                <StatTile
                  label="Absent"
                  value={loading ? "—" : stats.absent}
                  icon={<XCircle size={15} color={C.danger} />}
                  color={C.danger}
                  bg={C.dangerLight}
                />
                <StatTile
                  label="Late"
                  value={loading ? "—" : stats.late}
                  icon={<AlertTriangle size={15} color={C.warning} />}
                  color={C.warning}
                  bg={C.warningLight}
                />
              </div>
            </div>

            {/* ── SECONDARY STATS ── */}
            <div className="flex flex-wrap gap-2.5">
              <StatTile
                compact
                label="Total Hours"
                value={loading ? "—" : fmtHours(stats.totalHours)}
                icon={<Clock size={15} color={C.primary} />}
                color={C.primary}
                bg={C.primaryLight}
              />
              <StatTile
                compact
                label="Attendance Rate"
                value={loading ? "—" : `${stats.rate}%`}
                icon={<TrendingUp size={15} color={C.accent} />}
                color={C.accent}
                bg={C.successLight}
              />
              <StatTile
                compact
                label="Current Streak"
                value={loading ? "—" : `${stats.streak} days`}
                icon={<Flame size={15} color={C.warning} />}
                color={C.warning}
                bg={C.warningLight}
              />
              <StatTile
                compact
                label="Punctuality"
                value={loading ? "—" : `${stats.rate}%`}
                icon={<Award size={15} color={C.purple} />}
                color={C.purple}
                bg={C.purpleLight}
              />
            </div>

            {/* ── ATTENDANCE HISTORY ── */}
            <div>
              <h3 className="text-sm font-bold mb-3" style={{ color: C.textPrimary }}>
                Attendance History
              </h3>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Filter size={13} color={C.textMuted} />
                {FILTERS.map((f) => {
                  const active = f.key === activeFilter;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setActiveFilter(f.key)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{
                        background: active ? C.primary : C.surface,
                        color: active ? "#fff" : C.textSecondary,
                        border: `1px solid ${active ? C.primary : C.border}`,
                        cursor: "pointer",
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-2xl border px-3" style={{ background: C.surface, borderColor: C.border }}>
                {loading ? (
                  <div className="py-10 space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: "#E2E8F0" }} />
                    ))}
                  </div>
                ) : filteredLog.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-10">
                    <Clock size={28} color={C.textMuted} />
                    <p className="text-sm" style={{ color: C.textMuted }}>
                      No attendance records found.
                    </p>
                  </div>
                ) : (
                  filteredLog.map((entry) => (
                    <AttendanceLogRow key={entry.id} entry={entry} onPress={() => setDetailEntry(entry)} />
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      <AttendanceDetailSheet entry={detailEntry} onClose={() => setDetailEntry(null)} />
    </div>
  );
}