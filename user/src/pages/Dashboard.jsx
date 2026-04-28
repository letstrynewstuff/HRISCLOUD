// src/pages/employee/Dashboard.jsx
// Production-ready employee dashboard — zero mock data
// Wired to: /auth/me, /attendance, /leave/balances/me,
//           /leave/requests/me, /announcements/feed,
//           /payroll/payslip/me, /goals/me, /performance/scores/:id

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
// import SideNavbar from "../components/SideNavbar";
import {
  Clock,
  Calendar,
  Briefcase,
  FileText,
  Bell,
  Search,
  ChevronRight,
  Download,
  LogIn,
  LogOut,
  Zap,
  Award,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle2,
  Circle,
  DollarSign,
  Plane,
  Heart,
  Coffee,
  Star,
  ChevronDown,
  X,
  Menu,
  Activity,
  BarChart2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import C from "../styles/colors";
import { authApi } from "../api/service/authApi";
import { attendanceApi } from "../api/service/attendanceApi";
import { leaveApi } from "../api/service/leaveApi";
import { getMyPayslip } from "../api/service/payrollApi";
import { getMyGoals } from "../api/service/performanceApi";
import API from "../api/axios";

// Announcement feed helper (not in a separate api file yet)
const announcementApi = {
  feed: (params = {}) =>
    API.get("/announcements/feed", { params }).then((r) => r.data),
  markView: (id) => API.put(`/announcements/${id}/view`).then((r) => r.data),
};

/* ─── Animations ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.46, ease: [0.22, 1, 0.36, 1] },
  }),
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Skeleton ─── */
const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-xl ${className}`}
    style={{ background: "#E8EBF4" }}
  />
);

/* ─── Card ─── */
const Card = ({ children, className = "", style = {}, onClick }) => (
  <motion.div
    whileHover={{ y: -2, boxShadow: "0 12px 40px rgba(79,70,229,0.10)" }}
    transition={{ duration: 0.2 }}
    onClick={onClick}
    className={`rounded-2xl bg-white border shadow-sm overflow-hidden ${onClick ? "cursor-pointer" : ""} ${className}`}
    style={{ borderColor: C.border, ...style }}
  >
    {children}
  </motion.div>
);

/* ─── Circular progress ─── */
const CircleProgress = ({ pct, color, size = 56 }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={C.border}
        strokeWidth={5}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - Math.min(pct, 100) / 100) }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
      />
    </svg>
  );
};

/* ─── Leave icon map ─── */
const LEAVE_ICON = {
  annual: Plane,
  sick: Heart,
  casual: Coffee,
  compassionate: Users,
  maternity: Users,
  study: Briefcase,
};
const leaveIcon = (type) => LEAVE_ICON[type?.toLowerCase()] ?? Calendar;
const leaveColor = (i) =>
  [C.primary, C.success, C.accent, C.warning, C.danger, "#EC4899"][i % 6];

/* ════════════════════════ MAIN ════════════════════════ */
export default function EmployeeDashboard() {
  const now_ = new Date();

  /* ── Clock ── */
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ── Auth ── */
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* ── Data ── */
  const [attendance, setAttendance] = useState(null); // today snapshot
  const [balances, setBalances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [payslip, setPayslip] = useState(null);
  const [goals, setGoals] = useState([]);

  const [dataLoading, setDataLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);

  /* ── UI ── */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedAnnouncement, setExpandedAnnouncement] = useState(null);

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const fmtTime = (d) =>
    d.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  const fmtDate = (d) =>
    d.toLocaleDateString("en-NG", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  /* ── Load profile ── */
  useEffect(() => {
    authApi
      .getMe()
      .then((r) => setProfile(r.data ?? r))
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  /* ── Load all dashboard data ── */
  const loadData = useCallback(async () => {
    setDataLoading(true);
    const results = await Promise.allSettled([
      attendanceApi.getToday(),
      leaveApi.getMyBalances(),
      leaveApi.getMyRequests({ limit: 5 }),
      announcementApi.feed({ limit: 5 }),
    ]);

    if (results[0].status === "fulfilled")
      setAttendance(results[0].value?.data ?? results[0].value ?? null);
    if (results[1].status === "fulfilled")
      setBalances(results[1].value?.data ?? []);
    if (results[2].status === "fulfilled")
      setRequests(results[2].value?.data ?? []);
    if (results[3].status === "fulfilled")
      setAnnouncements(results[3].value?.data ?? []);

    // Load payslip and goals with current month
    const m = now_.getMonth() + 1;
    const y = now_.getFullYear();
    try {
      const ps = await getMyPayslip(m, y);
      setPayslip(ps.data ?? null);
    } catch {}
    try {
      const g = await getMyGoals({ limit: 5 });
      setGoals(g.data ?? []);
    } catch {}

    setDataLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ── Clock in/out ── */
  const isClockedIn =
    attendance?.is_clocked_in ?? attendance?.status === "present";
  const clockInTime = attendance?.clock_in;

  const handleClock = async () => {
    setClockLoading(true);
    try {
      if (!isClockedIn) {
        await attendanceApi.clockIn({});
      } else {
        await attendanceApi.clockOut();
      }
      // Refresh attendance snapshot
      const fresh = await attendanceApi.getToday();
      setAttendance(fresh?.data ?? fresh ?? null);
    } catch (err) {
      console.error("Clock error:", err);
    } finally {
      setClockLoading(false);
    }
  };

  /* ── Mark announcement viewed ── */
  const handleExpandAnnouncement = (ann) => {
    const id = ann.id;
    setExpandedAnnouncement((prev) => (prev === id ? null : id));
    if (expandedAnnouncement !== id) {
      announcementApi.markView(id).catch(() => {});
    }
  };

  /* ── Derived values ── */
  const totalAvailableLeave = balances.reduce(
    (s, b) => s + Number(b.remaining_days ?? 0),
    0,
  );
  const pendingLeaveCount = requests.filter(
    (r) => r.status === "pending",
  ).length;
  const activeGoals = goals.filter((g) => g.status !== "completed");
  const avgGoalProgress = activeGoals.length
    ? Math.round(
        activeGoals.reduce((s, g) => s + Number(g.progress ?? 0), 0) /
          activeGoals.length,
      )
    : 0;

  const initials = profile
    ? (
        (profile.first_name?.[0] ?? "") + (profile.last_name?.[0] ?? "")
      ).toUpperCase()
    : "..";
  const displayName = authLoading
    ? "Loading…"
    : `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();

  /* ─────────────────────── RENDER ─────────────────────── */
  return (
    <div
      className="min-h-screen"
      style={{
        background: C.bg,
        color: C.textPrimary,
        fontFamily: "'DM Sans','Sora',sans-serif",
      }}
    >
      <div className="flex h-screen overflow-hidden">
        {/* <SideNavbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          COLORS={C}
          EMPLOYEE={{
            name: displayName,
            role: profile?.job_role_name ?? "—",
            department: profile?.department_name ?? "—",
            initials,
            id: profile?.employee_code ?? "—",
          }}
        /> */}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* ── TOP NAV ── */}
          <header
            className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{
              background: "rgba(240,242,248,0.8)",
              backdropFilter: "blur(12px)",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen((p) => !p)}
              className="p-2 rounded-xl hidden md:flex"
              style={{ background: C.surface }}
            >
              <Menu size={16} color={C.textSecondary} />
            </motion.button>

            <motion.div
              className="flex-1 max-w-xs relative"
              animate={{ width: searchFocused ? "320px" : "240px" }}
              transition={{ duration: 0.3 }}
            >
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                color={C.textMuted}
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search anything…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none transition-all"
                style={{
                  background: C.surface,
                  border: `1.5px solid ${searchFocused ? C.primary : C.border}`,
                  color: C.textPrimary,
                  boxShadow: searchFocused
                    ? `0 0 0 3px ${C.primaryLight}`
                    : "none",
                }}
              />
            </motion.div>

            <div className="flex items-center gap-2 ml-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadData}
                className="p-2 rounded-xl"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
                title="Refresh"
              >
                <RefreshCw size={14} color={C.textSecondary} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-xl"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <Bell size={16} color={C.textSecondary} />
                {pendingLeaveCount > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                    style={{ background: C.danger }}
                  />
                )}
              </motion.button>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg,#818CF8,#06B6D4)",
                }}
              >
                {authLoading ? "…" : initials}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-5">
            {/* ── 1. HERO BANNER ── */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="relative rounded-2xl overflow-hidden p-6 md:p-8"
              style={{
                background:
                  "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
                minHeight: 160,
              }}
            >
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                  className="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-10"
                  style={{
                    background: "radial-gradient(circle,#818CF8,transparent)",
                  }}
                />
                <div
                  className="absolute -bottom-8 left-1/4 w-40 h-40 rounded-full opacity-10"
                  style={{
                    background: "radial-gradient(circle,#06B6D4,transparent)",
                  }}
                />
              </div>
              <div className="relative flex flex-col md:flex-row md:items-center gap-5">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
                  style={{
                    background: "linear-gradient(135deg,#818CF8,#06B6D4)",
                    boxShadow: "0 8px 24px rgba(129,140,248,0.4)",
                  }}
                >
                  {authLoading ? "…" : initials}
                </motion.div>
                <div className="flex-1">
                  <p className="text-indigo-200 text-sm font-medium mb-0.5">
                    {greeting()},
                  </p>
                  <h1
                    className="text-white text-2xl md:text-3xl font-bold"
                    style={{ fontFamily: "Sora,sans-serif" }}
                  >
                    {displayName} 👋
                  </h1>
                  <p className="text-indigo-300 text-sm mt-1">
                    {profile?.job_role_name ?? "—"} ·{" "}
                    {profile?.department_name ?? "—"}
                  </p>
                </div>
                <div className="md:text-right">
                  <p className="text-white text-2xl font-bold tabular-nums">
                    {fmtTime(now)}
                  </p>
                  <p className="text-indigo-200 text-xs mt-0.5">
                    {fmtDate(now)}
                  </p>
                  {/* Streak removed — would need a streak API */}
                </div>
              </div>
            </motion.div>

            {/* ── TOP ROW: Attendance + Leave ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {/* ── 2. ATTENDANCE ── */}
              <motion.div
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                custom={1}
              >
                {dataLoading ? (
                  <Card className="p-5">
                    <Skeleton className="h-36" />
                  </Card>
                ) : (
                  <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: C.primaryLight }}
                        >
                          <Clock size={15} color={C.primary} />
                        </div>
                        <span
                          className="font-semibold text-sm"
                          style={{ color: C.textPrimary }}
                        >
                          Attendance
                        </span>
                      </div>
                      <Link
                        to="/attendance"
                        className="text-xs font-medium flex items-center gap-0.5"
                        style={{ color: C.primary }}
                      >
                        View <ChevronRight size={12} />
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 animate-pulse"
                        style={{
                          background: isClockedIn ? C.success : C.danger,
                        }}
                      />
                      <div>
                        <p
                          className="text-base font-bold"
                          style={{ color: C.textPrimary }}
                        >
                          {isClockedIn ? "Clocked In" : "Not Clocked In"}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: C.textSecondary }}
                        >
                          {isClockedIn && clockInTime
                            ? `Since ${new Date(clockInTime).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}`
                            : "No check-in today"}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleClock}
                      disabled={clockLoading}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                      style={{
                        background: isClockedIn
                          ? "linear-gradient(135deg,#EF4444,#DC2626)"
                          : "linear-gradient(135deg,#4F46E5,#6366F1)",
                        boxShadow: isClockedIn
                          ? "0 4px 16px rgba(239,68,68,0.3)"
                          : "0 4px 16px rgba(79,70,229,0.3)",
                        opacity: clockLoading ? 0.7 : 1,
                      }}
                    >
                      {clockLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : isClockedIn ? (
                        <>
                          <LogOut size={14} />
                          Clock Out
                        </>
                      ) : (
                        <>
                          <LogIn size={14} />
                          Clock In
                        </>
                      )}
                    </motion.button>
                  </Card>
                )}
              </motion.div>

              {/* ── 3. LEAVE BALANCE ── */}
              <motion.div
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                custom={2}
                className="xl:col-span-2"
              >
                {dataLoading ? (
                  <Card className="p-5">
                    <Skeleton className="h-36" />
                  </Card>
                ) : (
                  <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: C.accentLight }}
                        >
                          <Plane size={15} color={C.accent} />
                        </div>
                        <span
                          className="font-semibold text-sm"
                          style={{ color: C.textPrimary }}
                        >
                          Leave Balance
                        </span>
                      </div>
                      <Link
                        to="/leave"
                        className="text-xs font-medium flex items-center gap-0.5"
                        style={{ color: C.primary }}
                      >
                        Request Leave <ChevronRight size={12} />
                      </Link>
                    </div>
                    {balances.length === 0 ? (
                      <p
                        className="text-sm text-center py-6"
                        style={{ color: C.textMuted }}
                      >
                        No leave balances. Contact HR.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {balances.slice(0, 3).map((bal, i) => {
                          const remaining = Number(bal.remaining_days ?? 0);
                          const total = Number(bal.entitled_days ?? 0);
                          const pct = total > 0 ? (remaining / total) * 100 : 0;
                          const color = leaveColor(i);
                          const Icon = leaveIcon(bal.leave_type);
                          return (
                            <div
                              key={bal.id}
                              className="flex flex-col items-center gap-2 p-3 rounded-xl"
                              style={{ background: C.surfaceAlt }}
                            >
                              <div className="relative">
                                <CircleProgress
                                  pct={pct}
                                  color={color}
                                  size={56}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Icon size={14} color={color} />
                                </div>
                              </div>
                              <div className="text-center">
                                <p
                                  className="text-base font-bold"
                                  style={{ color: C.textPrimary }}
                                >
                                  {remaining}
                                </p>
                                <p
                                  className="text-[10px] leading-tight text-center"
                                  style={{ color: C.textSecondary }}
                                >
                                  {bal.policy_name?.replace(" Leave", "") ??
                                    bal.leave_type}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                )}
              </motion.div>
            </div>

            {/* ── MIDDLE ROW: Recent Requests + Goals ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* ── 4. RECENT LEAVE REQUESTS ── */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={3}
              >
                {dataLoading ? (
                  <Card className="p-5 space-y-3">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                  </Card>
                ) : (
                  <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: C.warningLight }}
                        >
                          <FileText size={15} color={C.warning} />
                        </div>
                        <span
                          className="font-semibold text-sm"
                          style={{ color: C.textPrimary }}
                        >
                          Recent Requests
                        </span>
                        {pendingLeaveCount > 0 && (
                          <span
                            className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                            style={{ background: C.warning }}
                          >
                            {pendingLeaveCount}
                          </span>
                        )}
                      </div>
                      <Link
                        to="/requests"
                        className="text-xs font-medium flex items-center gap-0.5"
                        style={{ color: C.primary }}
                      >
                        All <ChevronRight size={12} />
                      </Link>
                    </div>
                    {requests.length === 0 ? (
                      <div className="flex flex-col items-center py-8 gap-2">
                        <CheckCircle2 size={32} color={C.success} />
                        <p
                          className="text-sm font-medium"
                          style={{ color: C.textSecondary }}
                        >
                          No requests yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {requests.slice(0, 4).map((req, i) => {
                          const statusColor =
                            req.status === "approved"
                              ? C.success
                              : req.status === "rejected"
                                ? C.danger
                                : C.warning;
                          const statusBg =
                            req.status === "approved"
                              ? C.successLight
                              : req.status === "rejected"
                                ? C.dangerLight
                                : C.warningLight;
                          return (
                            <motion.div
                              key={req.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center gap-3 p-3 rounded-xl"
                              style={{ background: C.surfaceAlt }}
                            >
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-sm font-medium truncate"
                                  style={{ color: C.textPrimary }}
                                >
                                  {req.policy_name ??
                                    req.leave_type ??
                                    "Leave Request"}
                                </p>
                                <p
                                  className="text-[10px]"
                                  style={{ color: C.textMuted }}
                                >
                                  {new Date(req.start_date).toLocaleDateString(
                                    "en-NG",
                                    { month: "short", day: "numeric" },
                                  )}
                                  {" — "}
                                  {new Date(req.end_date).toLocaleDateString(
                                    "en-NG",
                                    { month: "short", day: "numeric" },
                                  )}
                                  {" · "}
                                  {req.days} day{req.days !== 1 ? "s" : ""}
                                </p>
                              </div>
                              <span
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 capitalize"
                                style={{
                                  background: statusBg,
                                  color: statusColor,
                                }}
                              >
                                {req.status}
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                )}
              </motion.div>

              {/* ── 5. GOALS OVERVIEW ── */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={4}
              >
                {dataLoading ? (
                  <Card className="p-5 space-y-3">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                  </Card>
                ) : (
                  <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: C.successLight }}
                        >
                          <Award size={15} color={C.success} />
                        </div>
                        <span
                          className="font-semibold text-sm"
                          style={{ color: C.textPrimary }}
                        >
                          My Goals
                        </span>
                        {activeGoals.length > 0 && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: C.surfaceAlt,
                              color: C.textMuted,
                            }}
                          >
                            {activeGoals.length} active
                          </span>
                        )}
                      </div>
                      <Link
                        to="/performance"
                        className="text-xs font-medium flex items-center gap-0.5"
                        style={{ color: C.primary }}
                      >
                        View All <ChevronRight size={12} />
                      </Link>
                    </div>
                    {activeGoals.length === 0 ? (
                      <div className="flex flex-col items-center py-8 gap-2">
                        <Award size={32} color={C.textMuted} />
                        <p
                          className="text-sm font-medium"
                          style={{ color: C.textSecondary }}
                        >
                          No active goals.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeGoals.slice(0, 3).map((goal, i) => (
                          <div key={goal.id}>
                            <div className="flex items-center justify-between mb-1">
                              <p
                                className="text-xs font-medium truncate flex-1 mr-2"
                                style={{ color: C.textPrimary }}
                              >
                                {goal.title}
                              </p>
                              <span
                                className="text-xs font-bold shrink-0"
                                style={{ color: C.primary }}
                              >
                                {goal.progress ?? 0}%
                              </span>
                            </div>
                            <div
                              className="h-1.5 rounded-full"
                              style={{ background: C.border }}
                            >
                              <motion.div
                                className="h-full rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${goal.progress ?? 0}%` }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                style={{
                                  background:
                                    Number(goal.progress) >= 100
                                      ? C.success
                                      : C.primary,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                )}
              </motion.div>
            </div>

            {/* ── BOTTOM ROW: Payslip + Announcements ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              {/* ── 6. PAYSLIP ── */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={5}
                className="lg:col-span-2"
              >
                {dataLoading ? (
                  <Card className="p-5">
                    <Skeleton className="h-40" />
                  </Card>
                ) : (
                  <Card className="p-5 relative overflow-hidden">
                    <div
                      className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-5"
                      style={{ background: C.primary }}
                    />
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: C.primaryLight }}
                        >
                          <DollarSign size={15} color={C.primary} />
                        </div>
                        <span
                          className="font-semibold text-sm"
                          style={{ color: C.textPrimary }}
                        >
                          Recent Payslip
                        </span>
                      </div>
                    </div>
                    {payslip ? (
                      <>
                        <p
                          className="text-xs font-medium mb-1"
                          style={{ color: C.textMuted }}
                        >
                          {payslip.period ??
                            `${new Date(now_.getFullYear(), now_.getMonth() - 1).toLocaleString("en-NG", { month: "long", year: "numeric" })}`}{" "}
                          · Net Pay
                        </p>
                        <p
                          className="text-3xl font-bold mb-1"
                          style={{
                            color: C.textPrimary,
                            fontFamily: "Sora,sans-serif",
                          }}
                        >
                          ₦{Number(payslip.netSalary ?? 0).toLocaleString()}
                        </p>
                        <p
                          className="text-xs mb-5"
                          style={{ color: C.textSecondary }}
                        >
                          Gross: ₦
                          {Number(payslip.grossSalary ?? 0).toLocaleString()}
                        </p>
                      </>
                    ) : (
                      <div className="py-4">
                        <p className="text-sm" style={{ color: C.textMuted }}>
                          No payslip available for this period.
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Link
                        to="/payroll"
                        className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white text-center"
                        style={{ background: C.primary }}
                      >
                        View Payslip
                      </Link>
                      {payslip && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: C.primaryLight }}
                        >
                          <Download size={14} color={C.primary} />
                        </motion.button>
                      )}
                    </div>
                  </Card>
                )}
              </motion.div>

              {/* ── 7. ANNOUNCEMENTS ── */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={6}
                className="lg:col-span-3"
              >
                {dataLoading ? (
                  <Card className="p-5 space-y-3">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                  </Card>
                ) : (
                  <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: C.warningLight }}
                        >
                          <Bell size={15} color={C.warning} />
                        </div>
                        <span
                          className="font-semibold text-sm"
                          style={{ color: C.textPrimary }}
                        >
                          Announcements
                        </span>
                      </div>
                      <Link
                        to="/announcements"
                        className="text-xs font-medium flex items-center gap-0.5"
                        style={{ color: C.primary }}
                      >
                        All <ChevronRight size={12} />
                      </Link>
                    </div>
                    {announcements.length === 0 ? (
                      <p
                        className="text-sm text-center py-8"
                        style={{ color: C.textMuted }}
                      >
                        No announcements at this time.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {announcements.map((ann, i) => (
                          <motion.div
                            key={ann.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.07 }}
                            className="rounded-xl overflow-hidden"
                            style={{ background: C.surfaceAlt }}
                          >
                            <button
                              className="w-full text-left p-3 flex items-start gap-3"
                              onClick={() => handleExpandAnnouncement(ann)}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                  {ann.is_pinned && (
                                    <span
                                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                      style={{
                                        background: C.dangerLight,
                                        color: C.danger,
                                      }}
                                    >
                                      📌 Pinned
                                    </span>
                                  )}
                                  <span
                                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                    style={{
                                      background: C.primaryLight,
                                      color: C.primary,
                                    }}
                                  >
                                    {ann.audience === "department"
                                      ? (ann.department_name ?? "Dept.")
                                      : ann.audience === "all"
                                        ? "Company"
                                        : ann.audience}
                                  </span>
                                  <span
                                    className="text-[10px]"
                                    style={{ color: C.textMuted }}
                                  >
                                    {ann.publish_at
                                      ? new Date(
                                          ann.publish_at,
                                        ).toLocaleDateString("en-NG", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })
                                      : new Date(
                                          ann.created_at,
                                        ).toLocaleDateString("en-NG", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                        })}
                                  </span>
                                </div>
                                <p
                                  className="text-sm font-semibold"
                                  style={{ color: C.textPrimary }}
                                >
                                  {ann.title}
                                </p>
                                <AnimatePresence initial={false}>
                                  {expandedAnnouncement !== ann.id && (
                                    <motion.p
                                      initial={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="text-xs mt-1 line-clamp-1"
                                      style={{ color: C.textSecondary }}
                                    >
                                      {ann.body}
                                    </motion.p>
                                  )}
                                </AnimatePresence>
                              </div>
                              <motion.div
                                animate={{
                                  rotate:
                                    expandedAnnouncement === ann.id ? 180 : 0,
                                }}
                                transition={{ duration: 0.2 }}
                                className="shrink-0 mt-0.5"
                              >
                                <ChevronDown size={14} color={C.textMuted} />
                              </motion.div>
                            </button>
                            <AnimatePresence>
                              {expandedAnnouncement === ann.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden"
                                >
                                  <p
                                    className="text-xs px-3 pb-3"
                                    style={{ color: C.textSecondary }}
                                  >
                                    {ann.body}
                                  </p>
                                  <p
                                    className="text-[10px] px-3 pb-3"
                                    style={{ color: C.textMuted }}
                                  >
                                    Posted by {ann.posted_by ?? "HR"} ·{" "}
                                    {ann.views ?? 0} views
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </Card>
                )}
              </motion.div>
            </div>

            {/* ── PRODUCTIVITY OVERVIEW ── */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={7}
            >
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: C.primaryLight }}
                  >
                    <Activity size={15} color={C.primary} />
                  </div>
                  <span
                    className="font-semibold text-sm"
                    style={{ color: C.textPrimary }}
                  >
                    Productivity Overview
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Leave Available",
                      value: dataLoading ? "—" : `${totalAvailableLeave}d`,
                      icon: Plane,
                      color: C.primary,
                      sub: "Across all types",
                    },
                    {
                      label: "Pending Requests",
                      value: dataLoading ? "—" : pendingLeaveCount,
                      icon: Clock,
                      color: C.warning,
                      sub: "Awaiting approval",
                    },
                    {
                      label: "Goals Progress",
                      value: dataLoading ? "—" : `${avgGoalProgress}%`,
                      icon: Award,
                      color: C.success,
                      sub: "Active goals avg.",
                    },
                    {
                      label: "Active Goals",
                      value: dataLoading ? "—" : activeGoals.length,
                      icon: TrendingUp,
                      color: C.accent,
                      sub: "In progress",
                    },
                  ].map(({ label, value, icon: Icon, color, sub }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.07 }}
                      whileHover={{ y: -2 }}
                      className="p-4 rounded-xl flex flex-col gap-2"
                      style={{ background: C.surfaceAlt }}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: color + "22" }}
                      >
                        <Icon size={15} color={color} />
                      </div>
                      <p
                        className="text-2xl font-bold"
                        style={{
                          color: C.textPrimary,
                          fontFamily: "Sora,sans-serif",
                        }}
                      >
                        {value}
                      </p>
                      <div>
                        <p
                          className="text-xs font-semibold"
                          style={{ color: C.textPrimary }}
                        >
                          {label}
                        </p>
                        <p
                          className="text-[10px]"
                          style={{ color: C.textMuted }}
                        >
                          {sub}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            <div className="h-4" />
          </main>
        </div>
      </div>
    </div>
  );
}
