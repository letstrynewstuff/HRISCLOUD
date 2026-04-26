// src/pages/employee/Leave.jsx
// Production-ready employee leave page
// — No mock data. All data from API.
// — Uses motion (not Motion) from framer-motion
// — Colors from C imported from styles/colors
// — Wired to /auth/me, /leave/balances/me, /leave/requests/me,
//   /leave/policies, /leave/requests (POST), /leave/calendar

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SideNavbar from "../components/sideNavbar";
import {
  Plane,
  Heart,
  Baby,
  Users,
  Coffee,
  Umbrella,
  Bell,
  Search,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Upload,
  Calendar,
  FileText,
  Download,
  Filter,
  Plus,
  Info,
  Loader2,
  Eye,
  ArrowRight,
  Briefcase,
  BarChart2,
  RefreshCw,
} from "lucide-react";
import C from "../styles/colors";
import { leaveApi } from "../api/service/leaveApi";
import { authApi } from "../api/service/authApi";

/* ─── Leave-type icon + colour map (server uses leave_type string) ─── */
const LEAVE_META = {
  annual: {
    icon: Plane,
    color: C.primary,
    bg: C.primaryLight,
    label: "Annual Leave",
    desc: "General paid time off",
  },
  sick: {
    icon: Heart,
    color: C.danger,
    bg: C.dangerLight,
    label: "Sick Leave",
    desc: "Medical & health related",
  },
  maternity: {
    icon: Baby,
    color: "#EC4899",
    bg: "#FDF2F8",
    label: "Maternity Leave",
    desc: "Statutory maternity benefit",
  },
  paternity: {
    icon: Baby,
    color: "#7C3AED",
    bg: "#EDE9FE",
    label: "Paternity Leave",
    desc: "Statutory paternity benefit",
  },
  compassionate: {
    icon: Users,
    color: C.accent,
    bg: C.accentLight,
    label: "Compassionate Leave",
    desc: "Bereavement & family emergency",
  },
  study: {
    icon: Briefcase,
    color: C.warning,
    bg: C.warningLight,
    label: "Study Leave",
    desc: "Exams & professional development",
  },
  casual: {
    icon: Coffee,
    color: C.success,
    bg: C.successLight,
    label: "Casual Leave",
    desc: "Short personal matters",
  },
  unpaid: {
    icon: Umbrella,
    color: C.textMuted,
    bg: C.surfaceAlt,
    label: "Unpaid Leave",
    desc: "Time off without pay",
  },
};
const getMeta = (leaveType) =>
  LEAVE_META[leaveType?.toLowerCase()] ?? {
    icon: Calendar,
    color: C.primary,
    bg: C.primaryLight,
    label: leaveType ?? "Leave",
    desc: "",
  };

/* ─── Calendar helpers ─── */
const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDayOfMonth = (y, m) => {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1;
};
const toDateStr = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const todayStr = () => new Date().toISOString().slice(0, 10);

function countWorkdays(startStr, endStr) {
  if (!startStr || !endStr) return 0;
  const s = new Date(startStr),
    e = new Date(endStr);
  if (e < s) return 0;
  let count = 0;
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

/* ─── Animation ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Sub-components ─── */
const Skeleton = ({ className = "" }) => (
  <div
    className={`rounded-xl animate-pulse ${className}`}
    style={{ background: C.bgMid ?? "#E8EBF4" }}
  />
);

const Card = ({ children, className = "", style = {}, onClick }) => (
  <motion.div
    whileHover={
      onClick ? { y: -2, boxShadow: "0 12px 40px rgba(79,70,229,0.10)" } : {}
    }
    transition={{ duration: 0.2 }}
    onClick={onClick}
    className={`rounded-2xl bg-white border shadow-sm overflow-hidden ${onClick ? "cursor-pointer" : ""} ${className}`}
    style={{ borderColor: C.border, ...style }}
  >
    {children}
  </motion.div>
);

const StatusBadge = ({ status }) => {
  const map = {
    approved: {
      label: "Approved",
      bg: C.successLight,
      color: C.success,
      icon: CheckCircle2,
    },
    pending: {
      label: "Pending",
      bg: C.warningLight,
      color: C.warning,
      icon: Clock,
    },
    rejected: {
      label: "Rejected",
      bg: C.dangerLight,
      color: C.danger,
      icon: XCircle,
    },
    cancelled: {
      label: "Cancelled",
      bg: C.surfaceAlt,
      color: C.textMuted,
      icon: XCircle,
    },
  };
  const s = map[status] ?? map.pending;
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      <s.icon size={10} />
      {s.label}
    </span>
  );
};

function Toast({ msg, type = "success", onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl"
      style={{ background: C.navy ?? "#1E1B4B", color: "#fff", minWidth: 300 }}
    >
      {type === "error" ? (
        <AlertCircle size={15} color={C.danger} />
      ) : (
        <CheckCircle2 size={15} color={C.success} />
      )}
      <span className="text-sm font-medium flex-1">{msg}</span>
      <button onClick={onDismiss}>
        <X size={13} color="rgba(255,255,255,0.5)" />
      </button>
    </motion.div>
  );
}

/* ════════════════════ MAIN PAGE ════════════════════ */
export default function LeavePage() {
  const now = new Date();

  /* ── Auth / profile ── */
  const [profile, setProfile] = useState(null); // from /auth/me
  const [authLoading, setAuthLoading] = useState(true);

  /* ── Leave data ── */
  const [balances, setBalances] = useState([]); // /leave/balances/me
  const [policies, setPolicies] = useState([]); // /leave/policies
  const [history, setHistory] = useState([]); // /leave/requests/me
  const [calData, setCalData] = useState([]); // /leave/calendar

  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ── UI ── */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("balances");
  const [filterStatus, setFilterStatus] = useState("All");
  const [detailLeave, setDetailLeave] = useState(null);

  /* ── Calendar ── */
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedCalDay, setSelectedCalDay] = useState(null);

  /* ── Apply form ── */
  const [applyStep, setApplyStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    policyId: "",
    startDate: "",
    endDate: "",
    reason: "",
    file: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const fileRef = useRef(null);

  /* ── Toast ── */
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => setToast({ msg, type });

  /* ── Load user profile from /auth/me ── */
  useEffect(() => {
    authApi
      .getMe()
      .then((res) => setProfile(res.data ?? res))
      .catch(() => setProfile(null))
      .finally(() => setAuthLoading(false));
  }, []);

  /* ── Load leave data ── */
  const loadData = useCallback(async () => {
    setDataLoading(true);
    setError(null);
    try {
      const [balRes, polRes, histRes] = await Promise.all([
        leaveApi.getMyBalances(),
        leaveApi.getPolicies(),
        leaveApi.getMyRequests(),
      ]);
      setBalances(balRes.data ?? []);
      setPolicies(polRes.data ?? []);
      setHistory(histRes.data ?? []);
    } catch (err) {
      setError(
        err?.response?.data?.message ??
          "Failed to load leave data. Please refresh.",
      );
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ── Load calendar data whenever month changes ── */
  useEffect(() => {
    const from = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-01`;
    const lastDay = getDaysInMonth(calYear, calMonth);
    const to = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    leaveApi
      .getCalendar({ from, to })
      .then((res) => setCalData(res.data ?? []))
      .catch(() => {});
  }, [calYear, calMonth]);

  /* ─── Derived ─── */
  // Build calendar leave map from history (own leaves) + calData (team)
  const calLeaveMap = {};
  history.forEach((lv) => {
    const s = new Date(lv.start_date),
      e = new Date(lv.end_date);
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      calLeaveMap[d.toISOString().slice(0, 10)] = lv;
    }
  });

  const selectedPolicy = policies.find((p) => p.id === form.policyId);
  const selectedBalance = balances.find(
    (b) => b.leave_policy_id === form.policyId || b.id === form.policyId,
  );
  const remaining = selectedBalance?.remaining_days ?? 0;
  const workdays = countWorkdays(form.startDate, form.endDate);
  const afterBalance = remaining - workdays;

  const totalAvailable = balances.reduce(
    (s, b) => s + Number(b.remaining_days ?? 0),
    0,
  );
  const totalPending = history
    .filter((l) => l.status === "pending")
    .reduce((s, l) => s + Number(l.days ?? 0), 0);
  const totalTakenYTD = history
    .filter((l) => l.status === "approved")
    .reduce((s, l) => s + Number(l.days ?? 0), 0);

  const filteredHistory = history.filter((lv) => {
    const statusMatch =
      filterStatus === "All" || lv.status === filterStatus.toLowerCase();
    const searchMatch =
      !searchQuery ||
      (lv.policy_name ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (lv.leave_type ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lv.reason ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const monthName = new Date(calYear, calMonth, 1).toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  });
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const calCells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1,
  );
  while (calCells.length % 7 !== 0) calCells.push(null);

  /* ─── Form handlers ─── */
  const validateForm = () => {
    const errs = {};
    if (!form.policyId) errs.policyId = "Please select a leave type";
    if (!form.startDate) errs.startDate = "Start date required";
    if (!form.endDate) errs.endDate = "End date required";
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      errs.endDate = "End must be after start";
    if (form.startDate && form.startDate < todayStr())
      errs.startDate = "Start date cannot be in the past";
    if (!form.reason.trim()) errs.reason = "Please provide a reason";
    if (workdays > remaining)
      errs.balance = `Insufficient balance (${remaining} day${remaining !== 1 ? "s" : ""} remaining)`;
    if (selectedPolicy?.requires_document && !form.file)
      errs.file = "A supporting document is required for this leave type";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) setApplyStep(2);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await leaveApi.submitRequest({
        leavePolicyId: form.policyId,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
        supportingDocument: form.file ? form.file.name : undefined,
      });
      await loadData(); // refresh balances + history
      setApplyStep(3);
    } catch (err) {
      const msg =
        err?.response?.data?.message ?? "Failed to submit leave request.";
      showToast(msg, "error");
      setApplyStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({
      policyId: "",
      startDate: "",
      endDate: "",
      reason: "",
      file: null,
    });
    setFormErrors({});
    setApplyStep(1);
    setActiveTab("history");
  };

  const initials = profile
    ? (
        (profile.first_name?.[0] ?? "") + (profile.last_name?.[0] ?? "")
      ).toUpperCase()
    : "..";
  const displayName = profile
    ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
    : "Loading…";
  const displayId = profile?.employee_code ?? profile?.id?.slice(0, 8) ?? "—";
  const displayDept = profile?.department_name ?? profile?.department ?? "—";
  const displayRole = profile?.job_role_name ?? profile?.role ?? "—";

  /* ──────────────────────────────────────────────────────────────
     RENDER
  ────────────────────────────────────────────────────────────── */
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
        <SideNavbar
          sidebarOpen={sidebarOpen}
          COLORS={C}
          EMPLOYEE={{
            name: displayName,
            role: displayRole,
            department: displayDept,
            initials,
            id: displayId,
          }}
        />

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
                placeholder="Search leaves…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
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
                onClick={() => {
                  setActiveTab("apply");
                  setApplyStep(1);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                style={{
                  background: C.primary,
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
                }}
              >
                <Plus size={13} /> Apply Leave
              </motion.button>
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
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg,#6366F1,#06B6D4)",
                }}
              >
                {authLoading ? "…" : initials}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
            {/* ── HERO ── */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="relative rounded-2xl overflow-hidden p-6 md:p-8"
              style={{
                background:
                  "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
                minHeight: 140,
              }}
            >
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                  className="absolute -top-10 -right-10 w-56 h-56 rounded-full opacity-10"
                  style={{
                    background: "radial-gradient(circle,#818CF8,transparent)",
                  }}
                />
                <div
                  className="absolute -bottom-6 left-1/4 w-40 h-40 rounded-full opacity-10"
                  style={{
                    background: "radial-gradient(circle,#06B6D4,transparent)",
                  }}
                />
              </div>
              <div className="relative flex flex-col md:flex-row md:items-center gap-5">
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  >
                    <Plane size={22} color="#fff" />
                  </div>
                  <div>
                    <h1
                      className="text-white text-2xl md:text-3xl font-bold"
                      style={{ fontFamily: "Sora,sans-serif" }}
                    >
                      My Leave
                    </h1>
                    <p className="text-indigo-300 text-sm mt-0.5">
                      {authLoading
                        ? "Loading profile…"
                        : `${displayName} · ${displayId} · ${displayDept}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {[
                    {
                      label: "Days Available",
                      value: dataLoading ? "—" : totalAvailable,
                      color: "#A5F3FC",
                    },
                    {
                      label: "Days Pending",
                      value: dataLoading ? "—" : totalPending,
                      color: "#FDE68A",
                    },
                    {
                      label: "Days Taken YTD",
                      value: dataLoading ? "—" : totalTakenYTD,
                      color: "#BBF7D0",
                    },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      className="px-4 py-2.5 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.10)" }}
                    >
                      <p
                        className="text-2xl font-bold"
                        style={{ color, fontFamily: "Sora,sans-serif" }}
                      >
                        {value}
                      </p>
                      <p className="text-[11px] text-white/60">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── TABS ── */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.5}
            >
              <div
                className="flex gap-1 p-1 rounded-xl w-fit"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                {[
                  { id: "balances", label: "Balances", icon: BarChart2 },
                  { id: "apply", label: "Apply", icon: Plus },
                  { id: "history", label: "History", icon: Clock },
                  { id: "calendar", label: "Calendar", icon: Calendar },
                ].map(({ id, label, icon: Icon }) => (
                  <motion.button
                    key={id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setActiveTab(id);
                      if (id === "apply") setApplyStep(1);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: activeTab === id ? C.primary : "transparent",
                      color: activeTab === id ? "#fff" : C.textSecondary,
                    }}
                  >
                    <Icon size={14} />
                    {label}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* ── Error banner ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{
                    background: C.dangerLight,
                    border: `1px solid ${C.danger}33`,
                  }}
                >
                  <AlertCircle size={15} color={C.danger} />
                  <p className="text-sm" style={{ color: C.danger }}>
                    {error}
                  </p>
                  <button
                    onClick={loadData}
                    className="ml-auto text-xs font-semibold flex items-center gap-1"
                    style={{ color: C.danger }}
                  >
                    <RefreshCw size={12} />
                    Retry
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* ══ BALANCES TAB ══ */}
              {activeTab === "balances" && (
                <motion.div
                  key="balances"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {dataLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className="rounded-2xl border p-5"
                          style={{
                            background: C.surface,
                            borderColor: C.border,
                          }}
                        >
                          <Skeleton className="h-28" />
                        </div>
                      ))}
                    </div>
                  ) : balances.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-20">
                      <Calendar size={40} color={C.textMuted} />
                      <p
                        className="font-semibold text-sm"
                        style={{ color: C.textPrimary }}
                      >
                        No leave balances found
                      </p>
                      <p className="text-xs" style={{ color: C.textMuted }}>
                        Contact HR to set up your leave policies.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {balances.map((bal, i) => {
                        const meta = getMeta(bal.leave_type);
                        const used = Number(bal.used_days ?? 0);
                        const total = Number(bal.entitled_days ?? 0);
                        const avail = Number(bal.remaining_days ?? 0);
                        const pct = total > 0 ? (used / total) * 100 : 0;
                        const low = avail <= 2 && avail > 0;
                        const pending = history.filter(
                          (l) =>
                            l.leave_type === bal.leave_type &&
                            l.status === "pending",
                        );
                        const pendingDays = pending.reduce(
                          (s, l) => s + Number(l.days ?? 0),
                          0,
                        );

                        return (
                          <motion.div
                            key={bal.id}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            custom={i}
                          >
                            <Card className="p-5">
                              <div className="flex items-start justify-between mb-3">
                                <div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                                  style={{ background: meta.bg }}
                                >
                                  <meta.icon size={18} color={meta.color} />
                                </div>
                                {avail === 0 ? (
                                  <span
                                    className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{
                                      background: C.dangerLight,
                                      color: C.danger,
                                    }}
                                  >
                                    <XCircle size={9} /> Exhausted
                                  </span>
                                ) : low ? (
                                  <span
                                    className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{
                                      background: C.warningLight,
                                      color: C.warning,
                                    }}
                                  >
                                    <AlertCircle size={9} /> Low Balance
                                  </span>
                                ) : null}
                              </div>

                              <p
                                className="font-bold text-sm mb-0.5"
                                style={{ color: C.textPrimary }}
                              >
                                {bal.policy_name ?? meta.label}
                              </p>
                              <p
                                className="text-[11px] mb-3"
                                style={{ color: C.textMuted }}
                              >
                                {meta.desc}
                              </p>

                              {/* Progress bar */}
                              <div
                                className="h-2 rounded-full mb-2 overflow-hidden"
                                style={{ background: `${meta.color}22` }}
                              >
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{
                                    duration: 1,
                                    ease: "easeOut",
                                    delay: 0.1 * i,
                                  }}
                                  className="h-full rounded-full"
                                  style={{
                                    background:
                                      avail === 0
                                        ? C.danger
                                        : low
                                          ? C.warning
                                          : meta.color,
                                  }}
                                />
                              </div>

                              <div className="flex justify-between text-xs">
                                <span style={{ color: C.textMuted }}>
                                  {used} used
                                </span>
                                <span
                                  className="font-bold"
                                  style={{
                                    color:
                                      avail === 0
                                        ? C.danger
                                        : low
                                          ? C.warning
                                          : meta.color,
                                  }}
                                >
                                  {avail} / {total} days left
                                </span>
                              </div>

                              {pendingDays > 0 && (
                                <div
                                  className="mt-2 flex items-center gap-1.5 text-[10px]"
                                  style={{ color: C.warning }}
                                >
                                  <Clock size={10} />
                                  <span>
                                    {pendingDays} day
                                    {pendingDays !== 1 ? "s" : ""} pending
                                    approval
                                  </span>
                                </div>
                              )}

                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  setForm((f) => ({
                                    ...f,
                                    policyId: bal.id ?? bal.leave_policy_id,
                                  }));
                                  setActiveTab("apply");
                                  setApplyStep(1);
                                }}
                                disabled={avail === 0}
                                className="mt-3 w-full py-2 rounded-xl text-xs font-semibold"
                                style={{
                                  background: avail === 0 ? C.border : meta.bg,
                                  color: avail === 0 ? C.textMuted : meta.color,
                                  cursor:
                                    avail === 0 ? "not-allowed" : "pointer",
                                }}
                              >
                                {avail === 0
                                  ? "Balance Exhausted"
                                  : "Apply for this leave"}
                              </motion.button>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Policy note */}
                  {!dataLoading && (
                    <Card className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: C.primaryLight }}
                        >
                          <Info size={14} color={C.primary} />
                        </div>
                        <div>
                          <p
                            className="text-sm font-semibold mb-0.5"
                            style={{ color: C.textPrimary }}
                          >
                            Leave Policy Reminders
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: C.textSecondary }}
                          >
                            Annual leave must be applied in advance per your
                            company's policy. Sick leave beyond 2 days may
                            require a medical certificate. Contact HR for policy
                            details.
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                </motion.div>
              )}

              {/* ══ APPLY TAB ══ */}
              {activeTab === "apply" && (
                <motion.div
                  key="apply"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="max-w-2xl mx-auto">
                    {/* Step indicator */}
                    <div
                      className="px-6 pt-6 pb-4 border-b"
                      style={{ borderColor: C.border }}
                    >
                      <div className="flex items-center gap-0">
                        {[
                          { n: 1, label: "Details" },
                          { n: 2, label: "Confirm" },
                          { n: 3, label: "Done" },
                        ].map(({ n, label }, i) => (
                          <div key={n} className="flex items-center gap-0">
                            <div className="flex flex-col items-center">
                              <motion.div
                                animate={{
                                  background:
                                    applyStep >= n ? C.primary : C.border,
                                  color: applyStep >= n ? "#fff" : C.textMuted,
                                }}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                              >
                                {applyStep > n ? <Check size={13} /> : n}
                              </motion.div>
                              <span
                                className="text-[10px] mt-0.5"
                                style={{
                                  color:
                                    applyStep >= n ? C.primary : C.textMuted,
                                }}
                              >
                                {label}
                              </span>
                            </div>
                            {i < 2 && (
                              <div
                                className="w-16 h-0.5 mx-1 mb-4"
                                style={{
                                  background:
                                    applyStep > n ? C.primary : C.border,
                                }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {/* Step 1 — Form */}
                      {applyStep === 1 && (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="p-6 space-y-5"
                        >
                          <div>
                            <h2
                              className="text-lg font-bold mb-0.5"
                              style={{
                                color: C.textPrimary,
                                fontFamily: "Sora,sans-serif",
                              }}
                            >
                              Apply for Leave
                            </h2>
                            <p
                              className="text-sm"
                              style={{ color: C.textSecondary }}
                            >
                              Fill in the details below. Working days are
                              auto-calculated.
                            </p>
                          </div>

                          {/* Leave type */}
                          <div>
                            <label
                              className="block text-xs font-semibold mb-1.5"
                              style={{ color: C.textPrimary }}
                            >
                              Leave Type *
                            </label>
                            <div className="relative">
                              <select
                                value={form.policyId}
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    policyId: e.target.value,
                                  }))
                                }
                                className="w-full appearance-none px-4 py-3 rounded-xl text-sm outline-none"
                                style={{
                                  background: C.surfaceAlt,
                                  border: `1.5px solid ${formErrors.policyId ? C.danger : form.policyId ? C.primary : C.border}`,
                                  color: form.policyId
                                    ? C.textPrimary
                                    : C.textMuted,
                                }}
                              >
                                <option value="">Select leave type…</option>
                                {policies.map((p) => {
                                  const bal = balances.find(
                                    (b) => b.leave_policy_id === p.id,
                                  );
                                  const avail = Number(
                                    bal?.remaining_days ?? 0,
                                  );
                                  return (
                                    <option
                                      key={p.id}
                                      value={p.id}
                                      disabled={avail === 0}
                                    >
                                      {p.name} ({avail} day
                                      {avail !== 1 ? "s" : ""} available)
                                    </option>
                                  );
                                })}
                              </select>
                              <ChevronDown
                                size={14}
                                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                color={C.textMuted}
                              />
                            </div>
                            {formErrors.policyId && (
                              <p
                                className="text-xs mt-1"
                                style={{ color: C.danger }}
                              >
                                {formErrors.policyId}
                              </p>
                            )}

                            {/* Balance preview */}
                            {selectedPolicy && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                                style={{
                                  background: getMeta(selectedPolicy.leave_type)
                                    .bg,
                                }}
                              >
                                {(() => {
                                  const m = getMeta(selectedPolicy.leave_type);
                                  return <m.icon size={13} color={m.color} />;
                                })()}
                                <span
                                  style={{
                                    color: getMeta(selectedPolicy.leave_type)
                                      .color,
                                  }}
                                >
                                  <strong>{remaining} days</strong> available of{" "}
                                  {selectedPolicy.days_allowed} total
                                </span>
                              </motion.div>
                            )}
                          </div>

                          {/* Dates */}
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { key: "startDate", label: "Start Date" },
                              { key: "endDate", label: "End Date" },
                            ].map(({ key, label }) => (
                              <div key={key}>
                                <label
                                  className="block text-xs font-semibold mb-1.5"
                                  style={{ color: C.textPrimary }}
                                >
                                  {label} *
                                </label>
                                <input
                                  type="date"
                                  value={form[key]}
                                  onChange={(e) =>
                                    setForm((f) => ({
                                      ...f,
                                      [key]: e.target.value,
                                    }))
                                  }
                                  min={todayStr()}
                                  className="w-full px-3 py-3 rounded-xl text-sm outline-none"
                                  style={{
                                    background: C.surfaceAlt,
                                    border: `1.5px solid ${formErrors[key] ? C.danger : form[key] ? C.primary : C.border}`,
                                    color: C.textPrimary,
                                  }}
                                />
                                {formErrors[key] && (
                                  <p
                                    className="text-xs mt-1"
                                    style={{ color: C.danger }}
                                  >
                                    {formErrors[key]}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Working days preview */}
                          {form.startDate &&
                            form.endDate &&
                            form.startDate <= form.endDate && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                                style={{
                                  background:
                                    workdays > remaining
                                      ? C.dangerLight
                                      : C.successLight,
                                }}
                              >
                                <Calendar
                                  size={13}
                                  color={
                                    workdays > remaining ? C.danger : C.success
                                  }
                                />
                                <span
                                  style={{
                                    color:
                                      workdays > remaining
                                        ? C.danger
                                        : C.success,
                                  }}
                                >
                                  <strong>
                                    {workdays} working day
                                    {workdays !== 1 ? "s" : ""}
                                  </strong>
                                  {workdays > remaining
                                    ? ` — exceeds your balance of ${remaining} days`
                                    : " will be deducted"}
                                </span>
                              </motion.div>
                            )}
                          {formErrors.balance && (
                            <p className="text-xs" style={{ color: C.danger }}>
                              {formErrors.balance}
                            </p>
                          )}

                          {/* Reason */}
                          <div>
                            <label
                              className="block text-xs font-semibold mb-1.5"
                              style={{ color: C.textPrimary }}
                            >
                              Reason *
                            </label>
                            <textarea
                              value={form.reason}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  reason: e.target.value,
                                }))
                              }
                              placeholder="Briefly describe the reason for your leave…"
                              rows={3}
                              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                              style={{
                                background: C.surfaceAlt,
                                border: `1.5px solid ${formErrors.reason ? C.danger : form.reason ? C.primary : C.border}`,
                                color: C.textPrimary,
                              }}
                            />
                            {formErrors.reason && (
                              <p
                                className="text-xs mt-1"
                                style={{ color: C.danger }}
                              >
                                {formErrors.reason}
                              </p>
                            )}
                          </div>

                          {/* Document upload */}
                          {selectedPolicy?.requires_document && (
                            <div>
                              <label
                                className="block text-xs font-semibold mb-1.5"
                                style={{ color: C.textPrimary }}
                              >
                                Supporting Document *{" "}
                                <span
                                  className="font-normal text-[10px]"
                                  style={{ color: C.textMuted }}
                                >
                                  (required for this leave type)
                                </span>
                              </label>
                              <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => fileRef.current?.click()}
                                className="w-full py-3 border-2 border-dashed rounded-xl text-sm flex items-center justify-center gap-2"
                                style={{
                                  borderColor: formErrors.file
                                    ? C.danger
                                    : form.file
                                      ? C.primary
                                      : C.border,
                                  background: C.surfaceAlt,
                                  color: form.file ? C.primary : C.textMuted,
                                }}
                              >
                                <Upload size={15} />
                                {form.file
                                  ? form.file.name
                                  : "Click to upload document"}
                              </motion.button>
                              <input
                                ref={fileRef}
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) =>
                                  setForm((f) => ({
                                    ...f,
                                    file: e.target.files[0] ?? null,
                                  }))
                                }
                              />
                              {formErrors.file && (
                                <p
                                  className="text-xs mt-1"
                                  style={{ color: C.danger }}
                                >
                                  {formErrors.file}
                                </p>
                              )}
                            </div>
                          )}

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                            style={{
                              background: C.primary,
                              color: "#fff",
                              boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
                            }}
                          >
                            Review Application <ArrowRight size={16} />
                          </motion.button>
                        </motion.div>
                      )}

                      {/* Step 2 — Confirm */}
                      {applyStep === 2 && (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="p-6 space-y-5"
                        >
                          <div>
                            <h2
                              className="text-lg font-bold mb-0.5"
                              style={{
                                color: C.textPrimary,
                                fontFamily: "Sora,sans-serif",
                              }}
                            >
                              Confirm Application
                            </h2>
                            <p
                              className="text-sm"
                              style={{ color: C.textSecondary }}
                            >
                              Please review your leave request before
                              submitting.
                            </p>
                          </div>

                          <div
                            className="rounded-xl overflow-hidden border"
                            style={{ borderColor: C.border }}
                          >
                            {[
                              {
                                label: "Leave Type",
                                value: selectedPolicy?.name ?? "—",
                              },
                              {
                                label: "Start Date",
                                value: form.startDate
                                  ? new Date(form.startDate).toLocaleDateString(
                                      "en-NG",
                                      {
                                        weekday: "short",
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                      },
                                    )
                                  : "—",
                              },
                              {
                                label: "End Date",
                                value: form.endDate
                                  ? new Date(form.endDate).toLocaleDateString(
                                      "en-NG",
                                      {
                                        weekday: "short",
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                      },
                                    )
                                  : "—",
                              },
                              {
                                label: "Duration",
                                value: `${workdays} working day${workdays !== 1 ? "s" : ""}`,
                              },
                              { label: "Reason", value: form.reason },
                              {
                                label: "Document",
                                value: form.file
                                  ? form.file.name
                                  : "None attached",
                              },
                            ].map(({ label, value }, i) => (
                              <div
                                key={label}
                                className="flex items-start gap-3 px-4 py-3"
                                style={{
                                  background:
                                    i % 2 === 0 ? C.surfaceAlt : C.surface,
                                }}
                              >
                                <span
                                  className="text-xs font-semibold w-24 shrink-0 pt-0.5"
                                  style={{ color: C.textMuted }}
                                >
                                  {label}
                                </span>
                                <span
                                  className="text-sm font-medium"
                                  style={{ color: C.textPrimary }}
                                >
                                  {value}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Balance impact */}
                          <div
                            className="p-4 rounded-xl"
                            style={{
                              background:
                                afterBalance <= 2
                                  ? C.warningLight
                                  : C.successLight,
                            }}
                          >
                            <p
                              className="text-xs font-semibold mb-1"
                              style={{
                                color:
                                  afterBalance <= 2 ? C.warning : C.success,
                              }}
                            >
                              Balance Impact
                            </p>
                            <div className="flex items-center gap-3 text-sm">
                              <span style={{ color: C.textSecondary }}>
                                Available:{" "}
                                <strong style={{ color: C.textPrimary }}>
                                  {remaining} days
                                </strong>
                              </span>
                              <ArrowRight size={14} color={C.textMuted} />
                              <span style={{ color: C.textSecondary }}>
                                After:{" "}
                                <strong
                                  style={{
                                    color:
                                      afterBalance <= 2 ? C.warning : C.success,
                                  }}
                                >
                                  {afterBalance} days
                                </strong>
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setApplyStep(1)}
                              className="flex-1 py-3 rounded-xl font-semibold text-sm"
                              style={{
                                background: C.surfaceAlt,
                                color: C.textSecondary,
                                border: `1px solid ${C.border}`,
                              }}
                            >
                              ← Edit
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleConfirm}
                              disabled={submitting}
                              className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                              style={{
                                background: C.success,
                                color: "#fff",
                                boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
                                opacity: submitting ? 0.8 : 1,
                              }}
                            >
                              {submitting ? (
                                <>
                                  <Loader2 size={15} className="animate-spin" />{" "}
                                  Submitting…
                                </>
                              ) : (
                                <>
                                  <Check size={15} /> Submit
                                </>
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      )}

                      {/* Step 3 — Success */}
                      {applyStep === 3 && (
                        <motion.div
                          key="step3"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="p-8 flex flex-col items-center text-center gap-4"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 200,
                              delay: 0.1,
                            }}
                            className="w-20 h-20 rounded-full flex items-center justify-center"
                            style={{ background: C.successLight }}
                          >
                            <CheckCircle2 size={40} color={C.success} />
                          </motion.div>
                          <div>
                            <h2
                              className="text-xl font-bold mb-1"
                              style={{
                                color: C.textPrimary,
                                fontFamily: "Sora,sans-serif",
                              }}
                            >
                              Leave Applied! 🎉
                            </h2>
                            <p
                              className="text-sm"
                              style={{ color: C.textSecondary }}
                            >
                              Your request has been submitted and is pending
                              approval from your line manager.
                            </p>
                          </div>
                          <div
                            className="w-full p-4 rounded-xl text-sm"
                            style={{ background: C.successLight }}
                          >
                            <p
                              className="font-semibold"
                              style={{ color: C.success }}
                            >
                              What happens next?
                            </p>
                            <p
                              className="text-xs mt-1"
                              style={{ color: C.textSecondary }}
                            >
                              Your manager will review and approve within 1–2
                              business days. You'll be notified by email once a
                              decision is made.
                            </p>
                          </div>
                          <div className="flex gap-3 w-full">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleReset}
                              className="flex-1 py-3 rounded-xl font-semibold text-sm"
                              style={{ background: C.primary, color: "#fff" }}
                            >
                              View History
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setApplyStep(1);
                                setForm({
                                  policyId: "",
                                  startDate: "",
                                  endDate: "",
                                  reason: "",
                                  file: null,
                                });
                              }}
                              className="flex-1 py-3 rounded-xl font-semibold text-sm"
                              style={{
                                background: C.surfaceAlt,
                                color: C.textSecondary,
                                border: `1px solid ${C.border}`,
                              }}
                            >
                              Apply Another
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              )}

              {/* ══ HISTORY TAB ══ */}
              {activeTab === "history" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="p-5">
                    <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: C.primaryLight }}
                        >
                          <FileText size={15} color={C.primary} />
                        </div>
                        <span
                          className="font-semibold text-sm"
                          style={{ color: C.textPrimary }}
                        >
                          Leave History
                        </span>
                        {!dataLoading && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: C.surfaceAlt,
                              color: C.textMuted,
                            }}
                          >
                            {filteredHistory.length}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Filter size={13} color={C.textMuted} />
                        {[
                          "All",
                          "Approved",
                          "Pending",
                          "Rejected",
                          "Cancelled",
                        ].map((f) => (
                          <motion.button
                            key={f}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilterStatus(f)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold"
                            style={{
                              background:
                                filterStatus === f ? C.primary : C.surfaceAlt,
                              color:
                                filterStatus === f ? "#fff" : C.textSecondary,
                              border: `1px solid ${filterStatus === f ? C.primary : C.border}`,
                            }}
                          >
                            {f}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {dataLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-16" />
                        ))}
                      </div>
                    ) : filteredHistory.length === 0 ? (
                      <div className="py-12 flex flex-col items-center gap-3">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center"
                          style={{ background: C.surfaceAlt }}
                        >
                          <FileText size={24} color={C.textMuted} />
                        </div>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: C.textPrimary }}
                        >
                          No leave records found
                        </p>
                        <p className="text-xs" style={{ color: C.textMuted }}>
                          {filterStatus !== "All"
                            ? "Try a different filter"
                            : "Your leave history will appear here"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredHistory.map((lv, i) => {
                          const meta = getMeta(lv.leave_type);
                          return (
                            <motion.div
                              key={lv.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              whileHover={{ scale: 1.005 }}
                              onClick={() => setDetailLeave(lv)}
                              className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all group"
                              style={{
                                background: C.surfaceAlt,
                                border: `1px solid ${C.border}`,
                              }}
                            >
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: meta.bg }}
                              >
                                <meta.icon size={16} color={meta.color} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p
                                    className="font-semibold text-sm truncate"
                                    style={{ color: C.textPrimary }}
                                  >
                                    {lv.policy_name ?? meta.label}
                                  </p>
                                  <StatusBadge status={lv.status} />
                                  {lv.is_paid === false && (
                                    <span
                                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                      style={{
                                        background: C.surfaceAlt,
                                        color: C.textMuted,
                                        border: `1px solid ${C.border}`,
                                      }}
                                    >
                                      Unpaid
                                    </span>
                                  )}
                                </div>
                                <p
                                  className="text-xs mt-0.5"
                                  style={{ color: C.textMuted }}
                                >
                                  {new Date(lv.start_date).toLocaleDateString(
                                    "en-NG",
                                    { month: "short", day: "numeric" },
                                  )}
                                  {" — "}
                                  {new Date(lv.end_date).toLocaleDateString(
                                    "en-NG",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    },
                                  )}
                                  {" · "}
                                  <strong>
                                    {lv.days} day{lv.days !== 1 ? "s" : ""}
                                  </strong>
                                </p>
                              </div>
                              <div className="shrink-0 flex items-center gap-2">
                                {lv.approved_by_name &&
                                  lv.status === "approved" && (
                                    <span
                                      className="text-[10px] hidden sm:block"
                                      style={{ color: C.textMuted }}
                                    >
                                      by {lv.approved_by_name}
                                    </span>
                                  )}
                                <Eye
                                  size={14}
                                  color={C.textMuted}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              {/* ══ CALENDAR TAB ══ */}
              {activeTab === "calendar" && (
                <motion.div
                  key="calendar"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: C.primaryLight }}
                        >
                          <Calendar size={15} color={C.primary} />
                        </div>
                        <span
                          className="font-semibold text-sm"
                          style={{
                            color: C.textPrimary,
                            fontFamily: "Sora,sans-serif",
                          }}
                        >
                          {monthName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (calMonth === 0) {
                              setCalMonth(11);
                              setCalYear((y) => y - 1);
                            } else setCalMonth((m) => m - 1);
                          }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{
                            background: C.surfaceAlt,
                            border: `1px solid ${C.border}`,
                          }}
                        >
                          <ChevronLeft size={14} color={C.textSecondary} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setCalMonth(now.getMonth());
                            setCalYear(now.getFullYear());
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                          style={{
                            background: C.primaryLight,
                            color: C.primary,
                          }}
                        >
                          Today
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (calMonth === 11) {
                              setCalMonth(0);
                              setCalYear((y) => y + 1);
                            } else setCalMonth((m) => m + 1);
                          }}
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{
                            background: C.surfaceAlt,
                            border: `1px solid ${C.border}`,
                          }}
                        >
                          <ChevronRight size={14} color={C.textSecondary} />
                        </motion.button>
                      </div>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 mb-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                        (d) => (
                          <div
                            key={d}
                            className="text-center text-[11px] font-bold uppercase py-1"
                            style={{ color: C.textMuted }}
                          >
                            {d}
                          </div>
                        ),
                      )}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {calCells.map((day, i) => {
                        if (!day) return <div key={i} />;
                        const ds = toDateStr(calYear, calMonth, day);
                        const lv = calLeaveMap[ds];
                        const isToday = ds === todayStr();
                        const isWeekend = [5, 6].includes(i % 7);

                        return (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              if (lv) setSelectedCalDay({ ds, lv });
                            }}
                            className="relative flex flex-col items-center justify-center rounded-xl py-2 text-sm font-medium"
                            style={{
                              cursor: lv ? "pointer" : "default",
                              background: isToday
                                ? C.primary
                                : lv?.status === "approved"
                                  ? C.successLight
                                  : lv?.status === "pending"
                                    ? C.warningLight
                                    : isWeekend
                                      ? "#F8FAFC"
                                      : "transparent",
                              color: isToday
                                ? "#fff"
                                : lv?.status === "approved"
                                  ? C.success
                                  : lv?.status === "pending"
                                    ? C.warning
                                    : isWeekend
                                      ? C.textMuted
                                      : C.textPrimary,
                              minHeight: 42,
                            }}
                          >
                            <span className="text-xs font-bold">{day}</span>
                            {lv && (
                              <div
                                className="w-1 h-1 rounded-full mt-0.5"
                                style={{
                                  background:
                                    lv.status === "approved"
                                      ? C.success
                                      : C.warning,
                                }}
                              />
                            )}
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div
                      className="mt-4 pt-4 border-t flex flex-wrap gap-4"
                      style={{ borderColor: C.border }}
                    >
                      {[
                        {
                          color: C.success,
                          bg: C.successLight,
                          label: "Approved Leave",
                        },
                        {
                          color: C.warning,
                          bg: C.warningLight,
                          label: "Pending Leave",
                        },
                        { color: "#fff", bg: C.primary, label: "Today" },
                      ].map(({ color, bg, label }) => (
                        <div key={label} className="flex items-center gap-1.5">
                          <div
                            className="w-4 h-4 rounded"
                            style={{
                              background: bg,
                              border: `1px solid ${color}44`,
                            }}
                          />
                          <span
                            className="text-xs"
                            style={{ color: C.textMuted }}
                          >
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="h-4" />
          </main>
        </div>
      </div>

      {/* ── Leave Detail Modal ── */}
      <AnimatePresence>
        {detailLeave && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setDetailLeave(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4"
            >
              <div
                className="rounded-2xl bg-white shadow-2xl overflow-hidden"
                style={{ border: `1px solid ${C.border}` }}
              >
                {(() => {
                  const meta = getMeta(detailLeave.leave_type);
                  return (
                    <>
                      <div
                        className="p-5 flex items-start justify-between"
                        style={{ background: meta.bg }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,0.6)" }}
                          >
                            <meta.icon size={18} color={meta.color} />
                          </div>
                          <div>
                            <p
                              className="font-bold"
                              style={{
                                color: C.textPrimary,
                                fontFamily: "Sora,sans-serif",
                              }}
                            >
                              {detailLeave.policy_name ?? meta.label}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: C.textSecondary }}
                            >
                              {detailLeave.id?.slice(0, 8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setDetailLeave(null)}
                          className="p-1.5 rounded-lg"
                          style={{ background: "rgba(0,0,0,0.08)" }}
                        >
                          <X size={16} color={C.textSecondary} />
                        </button>
                      </div>
                      <div className="p-5 space-y-3">
                        <StatusBadge status={detailLeave.status} />
                        {detailLeave.rejection_reason && (
                          <div
                            className="flex items-start gap-2 p-3 rounded-xl"
                            style={{ background: C.dangerLight }}
                          >
                            <AlertCircle
                              size={13}
                              color={C.danger}
                              className="mt-0.5 shrink-0"
                            />
                            <p className="text-xs" style={{ color: C.danger }}>
                              {detailLeave.rejection_reason}
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            {
                              label: "Start Date",
                              value: new Date(
                                detailLeave.start_date,
                              ).toLocaleDateString("en-NG", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              }),
                            },
                            {
                              label: "End Date",
                              value: new Date(
                                detailLeave.end_date,
                              ).toLocaleDateString("en-NG", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              }),
                            },
                            {
                              label: "Duration",
                              value: `${detailLeave.days} day${detailLeave.days !== 1 ? "s" : ""}`,
                            },
                            {
                              label: "Approver",
                              value: detailLeave.approved_by_name ?? "—",
                            },
                            {
                              label: "Applied On",
                              value: new Date(
                                detailLeave.created_at,
                              ).toLocaleDateString("en-NG", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }),
                            },
                            {
                              label: "Reason",
                              value: detailLeave.reason ?? "—",
                            },
                          ].map(({ label, value }) => (
                            <div
                              key={label}
                              className="p-3 rounded-xl"
                              style={{ background: C.surfaceAlt }}
                            >
                              <p
                                className="text-[10px]"
                                style={{ color: C.textMuted }}
                              >
                                {label}
                              </p>
                              <p
                                className="text-sm font-semibold mt-0.5"
                                style={{ color: C.textPrimary }}
                              >
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Calendar Day Modal ── */}
      <AnimatePresence>
        {selectedCalDay && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setSelectedCalDay(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-4"
            >
              <div
                className="rounded-2xl bg-white shadow-2xl p-5"
                style={{ border: `1px solid ${C.border}` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <p
                    className="font-bold"
                    style={{
                      color: C.textPrimary,
                      fontFamily: "Sora,sans-serif",
                    }}
                  >
                    {new Date(selectedCalDay.ds).toLocaleDateString("en-NG", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <button
                    onClick={() => setSelectedCalDay(null)}
                    className="p-1.5 rounded-lg"
                    style={{ background: C.surfaceAlt }}
                  >
                    <X size={15} color={C.textMuted} />
                  </button>
                </div>
                {selectedCalDay.lv && (
                  <div className="space-y-2">
                    <StatusBadge status={selectedCalDay.lv.status} />
                    <p
                      className="text-sm font-semibold"
                      style={{ color: C.textPrimary }}
                    >
                      {selectedCalDay.lv.policy_name ??
                        getMeta(selectedCalDay.lv.leave_type).label}
                    </p>
                    <p className="text-xs" style={{ color: C.textSecondary }}>
                      {selectedCalDay.lv.reason ?? "No reason provided"}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <Toast
            msg={toast.msg}
            type={toast.type}
            onDismiss={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
