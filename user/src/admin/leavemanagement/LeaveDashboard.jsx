// src/admin/leavemanagement/LeaveDashboard.jsx
// Pure tab-panel — no sidebar, no page header.
// Rendered inside AdminLeavePage's AnimatePresence tab zone.

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plane,
  Clock,
  CheckCircle2,
  Users,
  Calendar,
  ChevronRight,
  Bell,
  TrendingUp,
  BarChart2,
  CalendarDays,
  UserCheck,
  FileText,
  Loader2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import C from "../../styles/colors";
import { leaveApi } from "../../api/service/leaveApi";

// ── UI-only leave type config ──────────────────────────────────
const LEAVE_TYPE_UI = {
  "Annual Leave": { color: "#4F46E5", light: "#EEF2FF" },
  "Sick Leave": { color: "#EF4444", light: "#FEE2E2" },
  "Maternity Leave": { color: "#EC4899", light: "#FDF2F8" },
  "Paternity Leave": { color: "#06B6D4", light: "#ECFEFF" },
  Compassionate: { color: "#8B5CF6", light: "#EDE9FE" },
  "Study Leave": { color: "#10B981", light: "#D1FAE5" },
  "Unpaid Leave": { color: "#F59E0B", light: "#FEF3C7" },
};
const getTypeColor = (type) => LEAVE_TYPE_UI[type]?.color ?? C.primary;
const getTypeLight = (type) => LEAVE_TYPE_UI[type]?.light ?? C.primaryLight;
const getInitials = (name) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "??";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  }),
};

function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  lightColor,
  onTabChange,
  tab,
  index,
}) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -3, boxShadow: `0 12px 32px rgba(79,70,229,0.12)` }}
      onClick={() => tab && onTabChange?.(tab)}
      className="rounded-2xl p-5 flex flex-col gap-3 cursor-pointer"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: lightColor }}
        >
          <Icon size={18} color={color} />
        </div>
        <ChevronRight size={14} color={C.textMuted} />
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color: C.textPrimary }}>
          {value}
        </div>
        <div
          className="text-xs font-semibold mt-0.5"
          style={{ color: C.textSecondary }}
        >
          {label}
        </div>
        {sub && (
          <div className="text-[11px] mt-1" style={{ color: C.textMuted }}>
            {sub}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Avatar({ initials, color = C.primary, size = 32 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.3,
        background: `linear-gradient(135deg,${color},${color}cc)`,
      }}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    approved: { bg: C.successLight, color: C.success, label: "Approved" },
    pending: { bg: C.warningLight, color: C.warning, label: "Pending" },
    rejected: { bg: C.dangerLight, color: C.danger, label: "Rejected" },
  }[status?.toLowerCase()] || {
    bg: C.surfaceAlt,
    color: C.textMuted,
    label: status,
  };
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

function LeaveTypePill({ type }) {
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: getTypeLight(type), color: getTypeColor(type) }}
    >
      {type}
    </span>
  );
}

function MonthlyBar({ requests }) {
  const thisMonth = new Date().toISOString().slice(0, 7);
  const typeCount = {};
  requests
    .filter(
      (r) => r.status === "approved" && r.start_date?.startsWith(thisMonth),
    )
    .forEach((r) => {
      const t = r.leave_type ?? "Other";
      typeCount[t] = (typeCount[t] || 0) + (r.days ?? 0);
    });
  const total = Object.values(typeCount).reduce((a, b) => a + b, 0) || 1;
  const entries = Object.entries(typeCount).sort((a, b) => b[1] - a[1]);
  if (!entries.length)
    return (
      <p className="text-xs text-center py-4" style={{ color: C.textMuted }}>
        No approved leave this month.
      </p>
    );
  return (
    <div className="space-y-3">
      {entries.slice(0, 5).map(([type, days]) => {
        const pct = Math.round((days / total) * 100);
        return (
          <div key={type}>
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-xs font-medium"
                style={{ color: C.textSecondary }}
              >
                {type}
              </span>
              <span
                className="text-xs font-bold"
                style={{ color: C.textPrimary }}
              >
                {days}d
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: C.surfaceAlt }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                className="h-full rounded-full"
                style={{ background: getTypeColor(type) }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────
// `onTabChange` is injected by AdminLeavePage so quick-links can switch tabs
export default function LeaveDashboard({ onTabChange }) {
  const [requests, setRequests] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [reqRes, calRes, polRes] = await Promise.all([
          leaveApi.getAllRequests({ limit: 100 }),
          leaveApi.getCalendar(),
          leaveApi.getPolicies(),
        ]);
        setRequests(reqRes.data ?? []);
        setCalendar(calRes.data ?? []);
        setPolicies(polRes.data ?? []);
      } catch {
        setError("Failed to load leave data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2
          size={28}
          className="animate-spin"
          style={{ color: C.primary }}
        />
      </div>
    );
  if (error)
    return (
      <div
        className="flex items-center gap-3 p-5 rounded-2xl"
        style={{ background: C.dangerLight }}
      >
        <AlertTriangle size={18} color={C.danger} />
        <p className="text-sm" style={{ color: C.danger }}>
          {error}
        </p>
      </div>
    );

  const TODAY = new Date().toISOString().split("T")[0];
  const onLeaveToday = calendar.filter(
    (r) => r.start_date <= TODAY && r.end_date >= TODAY,
  );
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const upcomingLeaves = requests.filter((r) => {
    const diff = (new Date(r.start_date) - new Date(TODAY)) / 86400000;
    return r.status === "approved" && diff > 0 && diff <= 14;
  });
  const totalDaysThisMonth = requests
    .filter(
      (r) =>
        r.status === "approved" && r.start_date?.startsWith(TODAY.slice(0, 7)),
    )
    .reduce((acc, r) => acc + (r.days ?? 0), 0);

  const stats = [
    {
      icon: Clock,
      label: "Pending Requests",
      value: pendingRequests.length,
      sub: "Awaiting review",
      color: C.warning,
      lightColor: C.warningLight,
      tab: "requests",
      index: 0,
    },
    {
      icon: UserCheck,
      label: "On Leave Today",
      value: onLeaveToday.length,
      sub: "Approved absences",
      color: C.danger,
      lightColor: C.dangerLight,
      tab: "requests",
      index: 1,
    },
    {
      icon: CalendarDays,
      label: "Days Taken This Month",
      value: totalDaysThisMonth,
      sub: new Date().toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),
      color: C.primary,
      lightColor: C.primaryLight,
      tab: "balances",
      index: 2,
    },
    {
      icon: Plane,
      label: "Upcoming Leaves",
      value: upcomingLeaves.length,
      sub: "Next 14 days",
      color: C.accent,
      lightColor: C.accentLight,
      tab: "requests",
      index: 3,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} onTabChange={onTabChange} />
        ))}
      </div>

      {/* On Leave Today + Pending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* On Leave Today */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <Card>
            <div
              className="px-5 pt-4 pb-3 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: C.dangerLight }}
                >
                  <UserCheck size={14} color={C.danger} />
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: C.textPrimary }}
                >
                  On Leave Today
                </span>
                {onLeaveToday.length > 0 && (
                  <span
                    className="w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                    style={{ background: C.danger }}
                  >
                    {onLeaveToday.length}
                  </span>
                )}
              </div>
              <button
                className="text-[11px] font-semibold flex items-center gap-1"
                style={{ color: C.primary }}
                onClick={() => onTabChange?.("requests")}
              >
                View all <ChevronRight size={11} />
              </button>
            </div>
            <div className="divide-y" style={{ borderColor: C.border }}>
              {onLeaveToday.length === 0 ? (
                <div className="py-8 flex flex-col items-center gap-2">
                  <CheckCircle2 size={24} color={C.success} />
                  <p className="text-xs" style={{ color: C.textMuted }}>
                    No one is on leave today
                  </p>
                </div>
              ) : (
                onLeaveToday.map((r) => (
                  <motion.div
                    key={r.id}
                    whileHover={{ background: C.surfaceAlt }}
                    className="px-5 py-3.5 flex items-center gap-3 cursor-pointer transition-colors"
                  >
                    <Avatar
                      initials={getInitials(r.employee_name)}
                      color={getTypeColor(r.leave_type)}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold truncate"
                        style={{ color: C.textPrimary }}
                      >
                        {r.employee_name}
                      </p>
                      <p
                        className="text-[11px] truncate"
                        style={{ color: C.textMuted }}
                      >
                        {r.department_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <LeaveTypePill type={r.leave_type} />
                      <p
                        className="text-[10px] mt-1"
                        style={{ color: C.textMuted }}
                      >
                        Until {r.end_date}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* Pending Approvals */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <Card>
            <div
              className="px-5 pt-4 pb-3 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: C.warningLight }}
                >
                  <Clock size={14} color={C.warning} />
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: C.textPrimary }}
                >
                  Pending Approvals
                </span>
                {pendingRequests.length > 0 && (
                  <span
                    className="w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                    style={{ background: C.warning }}
                  >
                    {pendingRequests.length}
                  </span>
                )}
              </div>
              <button
                className="text-[11px] font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg"
                style={{ background: C.primaryLight, color: C.primary }}
                onClick={() => onTabChange?.("requests")}
              >
                Review all <ChevronRight size={11} />
              </button>
            </div>
            <div className="divide-y" style={{ borderColor: C.border }}>
              {pendingRequests.length === 0 ? (
                <div className="py-8 flex flex-col items-center gap-2">
                  <CheckCircle2 size={24} color={C.success} />
                  <p className="text-xs" style={{ color: C.textMuted }}>
                    No pending requests
                  </p>
                </div>
              ) : (
                pendingRequests.slice(0, 5).map((r) => (
                  <motion.div
                    key={r.id}
                    whileHover={{ background: C.surfaceAlt }}
                    className="px-5 py-3.5 flex items-center gap-3 cursor-pointer transition-colors"
                  >
                    <Avatar
                      initials={getInitials(r.employee_name)}
                      color={getTypeColor(r.leave_type)}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold truncate"
                        style={{ color: C.textPrimary }}
                      >
                        {r.employee_name}
                      </p>
                      <p
                        className="text-[11px] truncate"
                        style={{ color: C.textMuted }}
                      >
                        {r.leave_type} · {r.days}d
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.status} />
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: C.primaryLight }}
                      >
                        <ArrowRight size={11} color={C.primary} />
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upcoming */}
        <motion.div
          custom={6}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <Card>
            <div
              className="px-5 pt-4 pb-3 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: C.accentLight }}
                >
                  <Calendar size={14} color={C.accent} />
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: C.textPrimary }}
                >
                  Upcoming Leave
                </span>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: C.accentLight, color: C.accent }}
                >
                  Next 14 days
                </span>
              </div>
            </div>
            <div className="divide-y" style={{ borderColor: C.border }}>
              {upcomingLeaves.length === 0 ? (
                <div className="py-8 flex flex-col items-center gap-2">
                  <Calendar size={24} color={C.textMuted} />
                  <p className="text-xs" style={{ color: C.textMuted }}>
                    No upcoming leaves
                  </p>
                </div>
              ) : (
                upcomingLeaves.map((r) => {
                  const daysUntil = Math.ceil(
                    (new Date(r.start_date) - new Date(TODAY)) / 86400000,
                  );
                  return (
                    <motion.div
                      key={r.id}
                      whileHover={{ background: C.surfaceAlt }}
                      className="px-5 py-3.5 flex items-center gap-3 cursor-pointer"
                    >
                      <Avatar
                        initials={getInitials(r.employee_name)}
                        color={getTypeColor(r.leave_type)}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-semibold truncate"
                          style={{ color: C.textPrimary }}
                        >
                          {r.employee_name}
                        </p>
                        <p
                          className="text-[11px]"
                          style={{ color: C.textMuted }}
                        >
                          {r.start_date} → {r.end_date}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                          style={{ background: C.accentLight, color: C.accent }}
                        >
                          In {daysUntil}d
                        </span>
                        <p
                          className="text-[10px] mt-1 font-medium"
                          style={{ color: getTypeColor(r.leave_type) }}
                        >
                          {r.leave_type}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </Card>
        </motion.div>

        {/* Monthly Distribution */}
        <motion.div
          custom={7}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <Card>
            <div
              className="px-5 pt-4 pb-3 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: C.primaryLight }}
                >
                  <BarChart2 size={14} color={C.primary} />
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: C.textPrimary }}
                >
                  Leave Distribution
                </span>
              </div>
              <span
                className="text-[11px] font-medium"
                style={{ color: C.textMuted }}
              >
                {new Date().toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="px-5 py-4">
              <MonthlyBar requests={requests} />
            </div>
            <div className="px-5 pb-4 flex flex-wrap gap-2">
              {policies.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: getTypeColor(p.leave_type) }}
                  />
                  <span className="text-[10px]" style={{ color: C.textMuted }}>
                    {p.leave_type}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick links */}
      <motion.div
        custom={8}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "All Requests",
              icon: FileText,
              color: C.primary,
              tab: "requests",
            },
            {
              label: "Leave Policies",
              icon: TrendingUp,
              color: C.purple,
              tab: "policies",
            },
            {
              label: "Leave Balances",
              icon: Users,
              color: C.success,
              tab: "balances",
            },
            {
              label: "Leave Calendar",
              icon: CalendarDays,
              color: C.accent,
              tab: null,
            },
          ].map((q) => (
            <motion.div
              key={q.label}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
              onClick={() => q.tab && onTabChange?.(q.tab)}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${q.color}18` }}
              >
                <q.icon size={15} color={q.color} />
              </div>
              <span
                className="text-xs font-semibold"
                style={{ color: C.textPrimary }}
              >
                {q.label}
              </span>
              <ChevronRight size={12} color={C.textMuted} className="ml-auto" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
