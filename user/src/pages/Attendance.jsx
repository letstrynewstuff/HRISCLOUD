

// src/pages/AttendancePage.jsx
// Employee-side attendance page.
// — Real user from AuthContext (no hard-coded EMPLOYEE constant)
// — Clock In/Out wired to backend via attendanceApi
// — Break/Pause tracking with start/end break endpoints
// — GET /attendance/me populates all stats + log
// — Geolocation captured on clock-in and displayed
// — No mock data
//
// FIX: "today's record" was being found via strict calendar-date
//      string matching (`r.date.toDateString() === todayStr`). This
//      silently failed in the same way the backend's old
//      `attendance_date = CURRENT_DATE` check did — right after
//      starting a break, fetchAttendance() would re-run, fail to
//      match "today", fall into the else-branch, and reset
//      onBreak/breakStartTime back to false/null, instantly undoing
//      the optimistic break-start UI update (no Resume button, no
//      running break timer).
//
//      Now "today's record" = the most recent OPEN session
//      (has clockIn, no clockOut) — consistent with the backend's
//      getTodayRecord fix. This is robust regardless of which
//      calendar date the session technically started on.

import { useState, useEffect, useCallback } from "react";
import C from "../styles/colors";
import { motion as Motion, AnimatePresence } from "framer-motion";
// import SideNavbar from "../components/SideNavbar";
import { useAuth } from "../components/useAuth";
import { attendanceApi } from "../api/service/attendanceApi";
import {
  Clock,
  Bell,
  Search,
  Menu,
  LogIn,
  LogOut,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Timer,
  MapPin,
  Activity,
  Flame,
  Award,
  Minus,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Play,
  Pause,
} from "lucide-react";

/* ─── Palette ─── */

/* ─── Helpers ─── */
const fmtHours = (h) => {
  if (!h && h !== 0) return "—";
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins ? `${hrs}h ${mins}m` : `${hrs}h`;
};

const fmtMinutes = (mins) => {
  if (!mins && mins !== 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
};

const pad = (n) => String(n).padStart(2, "0");

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Micro-components ─── */
const Card = ({ children, className = "", style = {}, onClick }) => (
  <Motion.div
    whileHover={
      onClick ? { y: -2, boxShadow: C.shadow.lift } : {}
    }
    onClick={onClick}
    className={`rounded-2xl bg-white border shadow-sm overflow-hidden ${onClick ? "cursor-pointer" : ""} ${className}`}
    style={{ borderColor: C.border, ...style }}
  >
    {children}
  </Motion.div>
);

const StatusBadge = ({ status }) => {
  const map = {
    present: {
      label: "Present",
      bg: C.successLight,
      color: C.success,
      icon: CheckCircle2,
    },
    absent: {
      label: "Absent",
      bg: C.dangerLight,
      color: C.danger,
      icon: XCircle,
    },
    late: {
      label: "Late",
      bg: C.warningLight,
      color: C.warning,
      icon: AlertTriangle,
    },
    holiday: {
      label: "Holiday",
      bg: C.accentLight,
      color: C.accent,
      icon: Calendar,
    },
    weekend: {
      label: "Weekend",
      bg: C.bgMid,
      color: C.textMuted,
      icon: Minus,
    },
  };
  const {
    label,
    bg,
    color,
    icon: Icon,
  } = map[status?.toLowerCase()] ?? map.present;
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: bg, color }}
    >
      <Icon size={10} /> {label}
    </span>
  );
};

const LiveTimer = ({ startTime, pausedAt, totalPausedMs = 0 }) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const tick = () => {
      const pauseOffset = pausedAt
        ? totalPausedMs + (Date.now() - pausedAt.getTime())
        : totalPausedMs;
      setElapsed(
        Math.max(
          0,
          Math.floor((Date.now() - startTime.getTime() - pauseOffset) / 1000)
        )
      );
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [startTime, pausedAt, totalPausedMs]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  return (
    <span className="tabular-nums font-bold font-mono">
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
};

const LiveBreakTimer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const tick = () => {
      setElapsed(
        Math.max(0, Math.floor((Date.now() - startTime.getTime()) / 1000))
      );
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [startTime]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  return (
    <span className="tabular-nums font-bold font-mono">
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
};

/* ─── Location display helper ─── */
const LocationBadge = ({ location }) => {
  if (!location) return null;
  const { lat, lng, address } = location;

  const displayText = address
    ? address
    : lat != null && lng != null
    ? `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`
    : null;

  if (!displayText) return null;

  return (
    <a
      href={`https://maps.google.com/?q=${lat},${lng}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
      style={{ textDecoration: "none" }}
      title="View on Google Maps"
    >
      <MapPin size={13} color="rgba(255,255,255,0.7)" />
      <span className="text-white/80 text-xs truncate max-w-[160px]">
        <strong className="text-white">{displayText}</strong>
      </span>
    </a>
  );
};

/* ════════════════════════════════════════════ MAIN COMPONENT ══ */
export default function AttendancePage() {
  const { employee } = useAuth();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [now, setNow] = useState(new Date());

  // Data
  const [attendanceLog, setAttendanceLog] = useState([]);
  const [streak, setStreak] = useState(0);

  // Clock state
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);
  const [clockInLocation, setClockInLocation] = useState(null);
  const [clockConfirm, setClockConfirm] = useState(null); // 'in' | 'out' | 'break-start' | 'break-end'
  const [todayStatus, setTodayStatus] = useState("not-started");
  const [clockError, setClockError] = useState(null);

  // Break state
  const [onBreak, setOnBreak] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState(null); // Date when current break started
  const [totalBreakMinutes, setTotalBreakMinutes] = useState(0); // accumulated break from backend
  const [totalPausedMs, setTotalPausedMs] = useState(0); // ms offset for LiveTimer

  // Final hours worked once the day is done (frozen, from backend hours_worked)
  const [finalHoursWorked, setFinalHoursWorked] = useState(null);

  // Filters & view
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState("All");
  const [detailEntry, setDetailEntry] = useState(null);

  // Live clock tick
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ─── Fetch attendance from backend ─── */
  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setClockError(null);

      const res = await attendanceApi.getMyAttendance({ limit: 100 });

      const formattedLog = (res.rows || []).map((r) => ({
        id: r.id,
        date: new Date(r.attendanceDate),
        dateStr: new Date(r.attendanceDate).toLocaleDateString("en-NG", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        clockIn: r.clockIn
          ? new Date(r.clockIn).toLocaleTimeString("en-NG", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : null,
        clockOut: r.clockOut
          ? new Date(r.clockOut).toLocaleTimeString("en-NG", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : null,
        rawClockIn: r.clockIn ? new Date(r.clockIn) : null,
        rawClockOut: r.clockOut ? new Date(r.clockOut) : null,
        hours: r.hoursWorked || 0,
        status: r.status,
        overtime: r.overtimeHours || 0,
        location: r.clockInLocation,
        breakMinutes: r.totalBreakMinutes || 0,
        onBreak: r.onBreak || false,
        breakStartedAt: r.breakStartedAt ? new Date(r.breakStartedAt) : null,
        isManuallyEdited: r.isManuallyEdited,
      }));

      setAttendanceLog(formattedLog);

      // ── Determine today's state ──
      // FIX: Previously matched by exact calendar-date string
      // (`r.date.toDateString() === new Date().toDateString()`), which
      // could fail to find the active session (e.g. a late-night
      // clock-in whose attendance_date no longer equals "today"),
      // silently resetting break/clock state right after a successful
      // break-start/clock-in. Now we find the most recent OPEN session
      // — clocked in, not yet clocked out — same approach as the
      // backend's getTodayRecord.
      const todayRec =
        formattedLog.find((r) => r.rawClockIn && !r.rawClockOut) ?? null;

      if (todayRec) {
        setClockInTime(todayRec.rawClockIn);
        setClockInLocation(todayRec.location);
        setTotalBreakMinutes(todayRec.breakMinutes || 0);

        if (todayRec.onBreak && todayRec.breakStartedAt) {
          setOnBreak(true);
          setBreakStartTime(todayRec.breakStartedAt);
          // ms already accumulated before this break
          setTotalPausedMs((todayRec.breakMinutes || 0) * 60 * 1000);
        } else {
          setOnBreak(false);
          setBreakStartTime(null);
          setTotalPausedMs((todayRec.breakMinutes || 0) * 60 * 1000);
        }

        setClockedIn(true);
        setTodayStatus("active");
        setClockOutTime(null);
        setFinalHoursWorked(null);
      } else {
        // No open session — check if there's a *closed* session that
        // belongs to today (so we can still show "Day Complete").
        const todayStr = new Date().toDateString();
        const closedToday = formattedLog.find(
          (r) => r.rawClockOut && r.date.toDateString() === todayStr
        );

        if (closedToday) {
          setClockedIn(false);
          setClockOutTime(closedToday.rawClockOut);
          setClockInTime(closedToday.rawClockIn);
          setClockInLocation(closedToday.location);
          setTotalBreakMinutes(closedToday.breakMinutes || 0);
          setTotalPausedMs((closedToday.breakMinutes || 0) * 60 * 1000);
          setOnBreak(false);
          setBreakStartTime(null);
          setTodayStatus("done");
          setFinalHoursWorked(closedToday.hours || 0);
        } else {
          setClockedIn(false);
          setTodayStatus("not-started");
          setClockInTime(null);
          setClockOutTime(null);
          setClockInLocation(null);
          setTotalBreakMinutes(0);
          setTotalPausedMs(0);
          setOnBreak(false);
          setBreakStartTime(null);
          setFinalHoursWorked(null);
        }
      }

      // ── Streak ──
      let s = 0;
      for (const r of formattedLog) {
        if (r.status === "present" || r.status === "late") s++;
        else if (r.status === "absent") break;
      }
      setStreak(s);
    } catch (err) {
      console.error("fetchAttendance error:", err);
      setClockError(
        err?.response?.data?.message ?? "Failed to load attendance."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  /* ─── Clock In ─── */
  const handleClockIn = () => {
    if (clockedIn || todayStatus === "done" || actionLoading) return;
    setActionLoading(true);
    setClockError(null);

    const doClockIn = async (coords) => {
      try {
        await attendanceApi.clockIn(coords);
        await fetchAttendance();
        showConfirm("in");
      } catch (err) {
        setClockError(
          err?.response?.data?.message ?? "Clock-in failed. Please try again."
        );
      } finally {
        setActionLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          doClockIn({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => doClockIn({}),
        { timeout: 5000 }
      );
    } else {
      doClockIn({});
    }
  };

  /* ─── Clock Out ─── */
  const handleClockOut = async () => {
    if (!clockedIn || actionLoading) return;
    // End break first if on break
    if (onBreak) {
      await handleBreakEnd(true);
    }
    setActionLoading(true);
    setClockError(null);
    try {
      await attendanceApi.clockOut();
      await fetchAttendance();
      showConfirm("out");
    } catch (err) {
      setClockError(
        err?.response?.data?.message ?? "Clock-out failed. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ─── Break Start ─── */
  const handleBreakStart = async () => {
    if (!clockedIn || onBreak || actionLoading || todayStatus === "done")
      return;
    setActionLoading(true);
    setClockError(null);
    try {
      await attendanceApi.startBreak();
      // Optimistic local update
      const now = new Date();
      setOnBreak(true);
      setBreakStartTime(now);
      setTotalPausedMs(totalBreakMinutes * 60 * 1000);
      await fetchAttendance();
      showConfirm("break-start");
    } catch (err) {
      setClockError(
        err?.response?.data?.message ?? "Break start failed. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ─── Break End ─── */
  const handleBreakEnd = async (silent = false) => {
    if (!onBreak || actionLoading) return;
    if (!silent) setActionLoading(true);
    setClockError(null);
    try {
      await attendanceApi.endBreak();
      setOnBreak(false);
      setBreakStartTime(null);
      if (!silent) {
        await fetchAttendance();
        showConfirm("break-end");
      }
    } catch (err) {
      if (!silent) {
        setClockError(
          err?.response?.data?.message ?? "Break end failed. Please try again."
        );
      }
    } finally {
      if (!silent) setActionLoading(false);
    }
  };

  const showConfirm = (type) => {
    setClockConfirm(type);
    setTimeout(() => setClockConfirm(null), 3000);
  };

  /* ─── Derived stats (current month) ─── */
  const monthEntries = attendanceLog.filter(
    (e) =>
      e.date.getMonth() === selectedMonth &&
      e.date.getFullYear() === selectedYear
  );
  const daysPresent = monthEntries.filter((e) => e.status === "present").length;
  const daysLate = monthEntries.filter((e) => e.status === "late").length;
  const daysAbsent = monthEntries.filter((e) => e.status === "absent").length;
  const totalHours = monthEntries.reduce((s, e) => s + (e.hours || 0), 0);
  const totalOvertime = monthEntries.reduce((s, e) => s + (e.overtime || 0), 0);
  const totalBreakMins = monthEntries.reduce(
    (s, e) => s + (e.breakMinutes || 0),
    0
  );
  const workingDays = monthEntries.length;
  const attendanceRate = workingDays
    ? (((daysPresent + daysLate) / workingDays) * 100).toFixed(0)
    : 0;

  const filteredLog = attendanceLog.filter((e) => {
    const statusMatch =
      filterStatus === "All" || e.status === filterStatus.toLowerCase();
    const searchMatch =
      !searchQuery ||
      e.dateStr.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const clockStatusColor = onBreak
    ? C.warning
    : clockedIn
    ? C.success
    : todayStatus === "done"
    ? C.accent
    : C.danger;

  const clockStatusLabel = onBreak
    ? "On Break"
    : clockedIn
    ? "Clocked In"
    : todayStatus === "done"
    ? "Day Complete"
    : "Not Clocked In";

  /* ─────────────────────────── RENDER ─── */
  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: C.bg, color: C.textPrimary }}
    >
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div className="flex h-screen overflow-hidden">
        {/* <SideNavbar sidebarOpen={sidebarOpen} /> */}

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
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen((p) => !p)}
              className="p-2 rounded-full hidden md:flex"
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                cursor: "pointer",
              }}
            >
              <Menu size={16} color={C.textSecondary} />
            </Motion.button>

            <Motion.div className="flex-1 max-w-xs relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                color={C.textMuted}
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search attendance…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{
                  background: C.surface,
                  border: `1.5px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              />
            </Motion.div>

            <div className="flex items-center gap-2 ml-auto">
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchAttendance}
                className="p-2 rounded-full"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  cursor: "pointer",
                }}
                title="Refresh"
              >
                <RefreshCw size={14} color={C.textMuted} />
              </Motion.button>
              {employee?.avatar ? (
                <img
                  src={employee.avatar}
                  alt={employee.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    background: "linear-gradient(135deg,#6366F1,#4338CA)",
                  }}
                >
                  {employee?.initials ?? "?"}
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
            {/* ── Error banner ── */}
            {clockError && (
              <Motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: C.dangerLight,
                  border: `1px solid ${C.danger}33`,
                }}
              >
                <AlertTriangle size={14} color={C.danger} />
                <p className="text-sm flex-1" style={{ color: C.danger }}>
                  {clockError}
                </p>
                <button
                  onClick={() => setClockError(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <X size={13} color={C.danger} />
                </button>
              </Motion.div>
            )}

            {/* ── HERO — TODAY'S ATTENDANCE ── */}
            <Motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="relative rounded-2xl overflow-hidden"
              style={{
                background:
                  C.gradient.hero,
                minHeight: 220,
              }}
            >
              {/* Break overlay tint */}
              <AnimatePresence>
                {onBreak && (
                  <Motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(135deg,rgba(245,158,11,0.18) 0%,transparent 100%)",
                    }}
                  />
                )}
              </AnimatePresence>

              <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                {/* Left */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 rounded-full"
                      style={{ background: clockStatusColor }}
                    />
                    <span
                      className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: clockStatusColor }}
                    >
                      {clockStatusLabel}
                    </span>
                  </div>
                  <h1 className="text-white text-2xl md:text-3xl mb-1">
                    {now.toDateString()}
                  </h1>
                  <p className="text-indigo-300 text-sm">
                    {employee
                      ? `Welcome back, ${employee.name.split(" ")[0]}`
                      : "Track your daily working hours"}
                  </p>

                  {/* Info chips */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {clockInTime && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10">
                        <LogIn size={13} color="rgba(255,255,255,0.7)" />
                        <span className="text-white/80 text-xs">
                          In:{" "}
                          <strong className="text-white">
                            {clockInTime.toLocaleTimeString("en-NG", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </strong>
                        </span>
                      </div>
                    )}
                    {clockOutTime && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10">
                        <LogOut size={13} color="rgba(255,255,255,0.7)" />
                        <span className="text-white/80 text-xs">
                          Out:{" "}
                          <strong className="text-white">
                            {clockOutTime.toLocaleTimeString("en-NG", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </strong>
                        </span>
                      </div>
                    )}
                    {clockedIn && clockInTime && !onBreak && (
                      <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                        style={{
                          background: "rgba(16,185,129,0.20)",
                          border: "1px solid rgba(16,185,129,0.3)",
                        }}
                      >
                        <Timer size={13} color={C.success} />
                        <span className="text-xs text-[#10B981]">
                          <LiveTimer
                            startTime={clockInTime}
                            pausedAt={breakStartTime}
                            totalPausedMs={totalPausedMs}
                          />
                        </span>
                      </div>
                    )}
                    {onBreak && breakStartTime && (
                      <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                        style={{
                          background: "rgba(245,158,11,0.22)",
                          border: "1px solid rgba(245,158,11,0.35)",
                        }}
                      >
                        <Coffee size={13} color={C.warning} />
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "#F59E0B" }}
                        >
                          On break — <LiveBreakTimer startTime={breakStartTime} />
                        </span>
                      </div>
                    )}
                    {/* ── LOCATION CHIP ── */}
                    {clockInLocation && (
                      <LocationBadge location={clockInLocation} />
                    )}
                    {/* Break total chip */}
                    {(totalBreakMinutes > 0 || onBreak) && clockedIn && (
                      <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                        style={{
                          background: "rgba(139,92,246,0.20)",
                          border: "1px solid rgba(139,92,246,0.3)",
                        }}
                      >
                        <Coffee size={13} color="#A5B4FC" />
                        <span className="text-white/80 text-xs">
                          Break:{" "}
                          <strong className="text-white">
                            {fmtMinutes(totalBreakMinutes)}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right — Clock + Break buttons */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="text-white text-3xl font-bold tabular-nums">
                    {now.toLocaleTimeString()}
                  </div>

                  {/* Main clock button */}
                  <Motion.button
                    whileHover={{ scale: todayStatus === "done" ? 1 : 1.04 }}
                    whileTap={{ scale: todayStatus === "done" ? 1 : 0.96 }}
                    onClick={clockedIn ? handleClockOut : handleClockIn}
                    disabled={todayStatus === "done" || actionLoading}
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm w-full justify-center"
                    style={{
                      background:
                        todayStatus === "done"
                          ? "rgba(255,255,255,0.12)"
                          : clockedIn
                          ? `linear-gradient(135deg,${C.danger},#B91C1C)`
                          : `linear-gradient(135deg,${C.success},#047857)`,
                      color: "#fff",
                      opacity:
                        todayStatus === "done" || actionLoading ? 0.6 : 1,
                      cursor:
                        todayStatus === "done" || actionLoading
                          ? "not-allowed"
                          : "pointer",
                      border: "none",
                    }}
                  >
                    {actionLoading ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : todayStatus === "done" ? (
                      <CheckCircle2 size={16} />
                    ) : clockedIn ? (
                      <LogOut size={16} />
                    ) : (
                      <LogIn size={16} />
                    )}
                    {todayStatus === "done"
                      ? "Day Complete"
                      : clockedIn
                      ? "Clock Out"
                      : "Clock In"}
                  </Motion.button>

                  {/* Break button — only shown while clocked in */}
                  {clockedIn && todayStatus !== "done" && (
                    <Motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={onBreak ? handleBreakEnd : handleBreakStart}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm w-full justify-center"
                      style={{
                        background: onBreak
                          ? "rgba(16,185,129,0.25)"
                          : "rgba(245,158,11,0.22)",
                        border: onBreak
                          ? "1.5px solid rgba(16,185,129,0.5)"
                          : "1.5px solid rgba(245,158,11,0.5)",
                        color: onBreak ? "#10B981" : "#F59E0B",
                        cursor: actionLoading ? "not-allowed" : "pointer",
                        opacity: actionLoading ? 0.6 : 1,
                      }}
                    >
                      {onBreak ? (
                        <>
                          <Play size={14} /> Resume Work
                        </>
                      ) : (
                        <>
                          <Pause size={14} /> Take a Break
                        </>
                      )}
                    </Motion.button>
                  )}
                </div>
              </div>
            </Motion.div>

            {/* ── MONTHLY SUMMARY STATS ── */}
            <Motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="grid grid-cols-2 md:grid-cols-5 gap-4"
            >
              {[
                {
                  label: "Days Present",
                  value: loading ? "—" : daysPresent,
                  icon: CheckCircle2,
                  color: C.success,
                  bg: C.successLight,
                },
                {
                  label: "Days Absent",
                  value: loading ? "—" : daysAbsent,
                  icon: XCircle,
                  color: C.danger,
                  bg: C.dangerLight,
                },
                {
                  label: "Late Arrivals",
                  value: loading ? "—" : daysLate,
                  icon: AlertTriangle,
                  color: C.warning,
                  bg: C.warningLight,
                },
                {
                  label: "Total Hours",
                  value: loading ? "—" : fmtHours(totalHours),
                  icon: Clock,
                  color: C.primary,
                  bg: C.primaryLight,
                  isText: true,
                },
                {
                  label: "Attendance Rate",
                  value: loading ? "—" : `${attendanceRate}%`,
                  icon: TrendingUp,
                  color: C.accent,
                  bg: C.accentLight,
                  isText: true,
                },
              ].map((s, i) => (
                <Card key={i} className="p-4">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: s.bg }}
                  >
                    <s.icon size={15} color={s.color} />
                  </div>
                  <p
                    className={`${s.isText ? "text-xl" : "text-3xl"} font-bold mb-0.5`}
                  >
                    {s.value}
                  </p>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: s.color }}
                  >
                    {s.label}
                  </p>
                </Card>
              ))}
            </Motion.div>

            {/* ── OVERTIME & STREAK ── */}
            <Motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              {[
                {
                  title: "Overtime This Month",
                  value: fmtHours(totalOvertime),
                  icon: Timer,
                  color: C.accent,
                  bg: C.accentLight,
                },
                {
                  title: "Attendance Streak",
                  value: `${streak} days`,
                  icon: Flame,
                  color: C.warning,
                  bg: C.warningLight,
                },
                {
                  title: "Punctuality Score",
                  value: `${attendanceRate}%`,
                  icon: Award,
                  color: C.primary,
                  bg: C.primaryLight,
                },
                {
                  title: "Break Time This Month",
                  value: fmtMinutes(totalBreakMins),
                  icon: Coffee,
                  color: C.purple,
                  bg: C.purpleLight,
                },
              ].map((s, i) => (
                <Card key={i} className="p-5 flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: s.bg }}
                  >
                    <s.icon size={18} color={s.color} />
                  </div>
                  <div>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: C.textPrimary }}
                    >
                      {loading ? "—" : s.value}
                    </p>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: s.color }}
                    >
                      {s.title}
                    </p>
                  </div>
                </Card>
              ))}
            </Motion.div>

            {/* ── ATTENDANCE LOG TABLE ── */}
            <Motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
            >
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <h3
                    className="text-sm"
                    style={{ color: C.textPrimary }}
                  >
                    Attendance History
                  </h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="text-xs p-2 rounded-xl outline-none"
                      style={{
                        border: `1px solid ${C.border}`,
                        background: C.surface,
                        color: C.textSecondary,
                      }}
                    >
                      <option value="All">All Statuses</option>
                      <option value="present">Present</option>
                      <option value="late">Late</option>
                      <option value="absent">Absent</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-12 rounded-xl animate-pulse"
                        style={{ background: C.border }}
                      />
                    ))}
                  </div>
                ) : filteredLog.length === 0 ? (
                  <div className="py-10 text-center">
                    <Clock
                      size={36}
                      color={C.textMuted}
                      className="mx-auto mb-2"
                    />
                    <p className="text-sm" style={{ color: C.textMuted }}>
                      No attendance records found.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {/* Table header */}
                    <div
                      className="grid gap-4 px-4 py-2 text-[10px] font-bold uppercase tracking-wide"
                      style={{
                        color: C.textMuted,
                        gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr",
                      }}
                    >
                      <span>Date</span>
                      <span className="hidden md:block">In</span>
                      <span className="hidden md:block">Out</span>
                      <span>Hours</span>
                      <span>Break</span>
                      <span className="text-right">Status</span>
                    </div>
                    {filteredLog.map((entry) => (
                      <Motion.div
                        key={entry.id}
                        whileHover={{ x: 2 }}
                        onClick={() => setDetailEntry(entry)}
                        className="grid gap-4 px-4 py-3 rounded-xl cursor-pointer transition-colors items-center"
                        style={{
                          gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = C.surfaceAlt;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <div>
                          <p
                            className="text-xs font-semibold"
                            style={{ color: C.textPrimary }}
                          >
                            {entry.dateStr}
                          </p>
                          {entry.isManuallyEdited && (
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                              style={{
                                background: C.warningLight,
                                color: C.warning,
                              }}
                            >
                              Edited
                            </span>
                          )}
                        </div>
                        <div className="hidden md:flex flex-col">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: C.textPrimary }}
                          >
                            {entry.clockIn || "—"}
                          </span>
                        </div>
                        <div className="hidden md:flex flex-col">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: C.textPrimary }}
                          >
                            {entry.clockOut || "—"}
                          </span>
                        </div>
                        <div>
                          <span
                            className="text-sm font-bold"
                            style={{ color: C.textPrimary }}
                          >
                            {fmtHours(entry.hours)}
                          </span>
                        </div>
                        <div>
                          {entry.breakMinutes > 0 ? (
                            <span
                              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                background: C.purpleLight,
                                color: C.purple,
                              }}
                            >
                              <Coffee size={9} />
                              {fmtMinutes(entry.breakMinutes)}
                            </span>
                          ) : (
                            <span style={{ color: C.textMuted, fontSize: 12 }}>
                              —
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <StatusBadge status={entry.status} />
                        </div>
                      </Motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </Motion.div>
          </main>
        </div>
      </div>

      {/* ── DETAIL MODAL ── */}
      <AnimatePresence>
        {detailEntry && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setDetailEntry(null)}
          >
            <Motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl"
              style={{ border: `1px solid ${C.border}` }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-base"
                  style={{ color: C.textPrimary }}
                >
                  {detailEntry.dateStr}
                </h3>
                <button
                  onClick={() => setDetailEntry(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <X size={18} color={C.textMuted} />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  {
                    label: "Status",
                    value: <StatusBadge status={detailEntry.status} />,
                  },
                  { label: "Clock In", value: detailEntry.clockIn || "—" },
                  { label: "Clock Out", value: detailEntry.clockOut || "—" },
                  { label: "Hours Worked", value: fmtHours(detailEntry.hours) },
                  {
                    label: "Break Time",
                    value:
                      detailEntry.breakMinutes > 0
                        ? fmtMinutes(detailEntry.breakMinutes)
                        : "No breaks",
                  },
                  ...(detailEntry.overtime > 0
                    ? [
                        {
                          label: "Overtime",
                          value: fmtHours(detailEntry.overtime),
                        },
                      ]
                    : []),
                  ...(detailEntry.location?.lat != null
                    ? [
                        {
                          label: "Clock-in Location",
                          value: (
                            <a
                              href={`https://maps.google.com/?q=${detailEntry.location.lat},${detailEntry.location.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm font-semibold"
                              style={{ color: C.primary }}
                            >
                              <MapPin size={12} />
                              {detailEntry.location.address
                                ? detailEntry.location.address
                                : `${Number(detailEntry.location.lat).toFixed(5)}, ${Number(detailEntry.location.lng).toFixed(5)}`}
                            </a>
                          ),
                        },
                      ]
                    : []),
                  ...(detailEntry.isManuallyEdited
                    ? [
                        {
                          label: "Note",
                          value: (
                            <span className="text-xs text-amber-600">
                              This record was manually corrected by HR
                            </span>
                          ),
                        },
                      ]
                    : []),
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                    style={{ borderColor: C.border }}
                  >
                    <span
                      className="text-sm"
                      style={{ color: C.textSecondary }}
                    >
                      {label}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: C.textPrimary }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setDetailEntry(null)}
                className="w-full mt-5 py-2.5 rounded-full font-bold text-sm text-white"
                style={{
                  background: C.primary,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* ── CLOCK CONFIRM TOAST ── */}
      <AnimatePresence>
        {clockConfirm && (
          <Motion.div
            initial={{ opacity: 0, y: 12, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 12, x: "-50%" }}
            className="fixed bottom-6 left-1/2 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-xl z-50"
            style={{
              background:
                clockConfirm === "in"
                  ? C.success
                  : clockConfirm === "out"
                  ? C.accent
                  : clockConfirm === "break-start"
                  ? C.warning
                  : C.success,
            }}
          >
            {clockConfirm === "break-start" ? (
              <Coffee size={16} />
            ) : clockConfirm === "break-end" ? (
              <Play size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {clockConfirm === "in" && "Successfully clocked in!"}
            {clockConfirm === "out" && "Successfully clocked out!"}
            {clockConfirm === "break-start" && "Break started — enjoy!"}
            {clockConfirm === "break-end" && "Welcome back!"}
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}