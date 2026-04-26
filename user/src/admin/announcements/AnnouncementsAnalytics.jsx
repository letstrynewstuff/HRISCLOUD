// ─────────────────────────────────────────────────────────────
//  src/admin/announcements/AnnouncementsAnalytics.jsx
//  Route: /admin/announcements/analytics
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSideNavbar from "../AdminSideNavbar";
import {
  BarChart2,
  Bell,
  Menu,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  CheckCircle2,
  Clock,
  Building2,
  Globe,
  Megaphone,
  FileText,
  Zap,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  Info,
  Target,
  Award,
  Activity,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";

const C = {
  bg: "#F0F2F8",
  bgMid: "#E8EBF4",
  surface: "#FFFFFF",
  surfaceHover: "#F7F8FC",
  surfaceAlt: "#F7F8FC",
  border: "#E4E7F0",
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  primaryDark: "#3730A3",
  accent: "#06B6D4",
  accentLight: "#ECFEFF",
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  purple: "#8B5CF6",
  purpleLight: "#EDE9FE",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  navy: "#1E1B4B",
};

const ADMIN = {
  name: "Ngozi Adeleke",
  initials: "NA",
  role: "HR Administrator",
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Mock analytics data ─── */
const MONTHLY_VIEWS = [
  { month: "Aug", views: 312, acks: 210, sent: 3 },
  { month: "Sep", views: 428, acks: 301, sent: 4 },
  { month: "Oct", views: 389, acks: 278, sent: 3 },
  { month: "Nov", views: 512, acks: 388, sent: 5 },
  { month: "Dec", views: 467, acks: 343, sent: 4 },
  { month: "Jan", views: 635, acks: 488, sent: 6 },
];

const TYPE_BREAKDOWN = [
  {
    type: "General",
    count: 12,
    views: 1240,
    acks: 980,
    color: C.primary,
    pct: 40,
  },
  { type: "Urgent", count: 5, views: 610, acks: 540, color: C.danger, pct: 17 },
  { type: "Policy", count: 6, views: 720, acks: 680, color: C.purple, pct: 20 },
  { type: "Event", count: 4, views: 310, acks: 180, color: C.warning, pct: 13 },
  {
    type: "Reminder",
    count: 3,
    views: 220,
    acks: 140,
    color: C.accent,
    pct: 10,
  },
];

const DEPT_ENGAGEMENT = [
  { dept: "Engineering", rate: 94, views: 342, acks: 321, employees: 38 },
  { dept: "HR", rate: 92, views: 127, acks: 117, employees: 14 },
  { dept: "Finance", rate: 88, views: 198, acks: 174, employees: 22 },
  { dept: "Product", rate: 85, views: 215, acks: 183, employees: 25 },
  { dept: "Operations", rate: 79, views: 168, acks: 133, employees: 19 },
  { dept: "Marketing", rate: 74, views: 143, acks: 106, employees: 17 },
  { dept: "Sales", rate: 68, views: 132, acks: 90, employees: 16 },
  { dept: "Legal", rate: 62, views: 56, acks: 35, employees: 9 },
];

const TOP_ANNOUNCEMENTS = [
  {
    id: "ANN-003",
    emoji: "📋",
    title: "Updated Remote Work Policy — Effective March 1",
    views: 127,
    acks: 121,
    rate: 95,
    type: "policy",
  },
  {
    id: "ANN-001",
    emoji: "🎉",
    title: "Q1 2025 Performance Bonuses Announced",
    views: 124,
    acks: 98,
    rate: 77,
    type: "general",
  },
  {
    id: "ANN-008",
    emoji: "🏆",
    title: "Employee of the Quarter — Emeka Okonkwo",
    views: 127,
    acks: 110,
    rate: 87,
    type: "general",
  },
  {
    id: "ANN-002",
    emoji: "⚠️",
    title: "Mandatory Cybersecurity Training — Deadline Feb 14",
    views: 119,
    acks: 87,
    rate: 73,
    type: "urgent",
  },
  {
    id: "ANN-005",
    emoji: "🔔",
    title: "Leave Application Deadline — End of Month",
    views: 98,
    acks: 71,
    rate: 72,
    type: "reminder",
  },
];

const RECENT_ACTIVITY = [
  {
    event: "ANN-001 viewed",
    actor: "Emeka Okonkwo",
    dept: "Engineering",
    time: "2 min ago",
    type: "view",
  },
  {
    event: "ANN-002 acknowledged",
    actor: "Adaeze Nwosu",
    dept: "Engineering",
    time: "5 min ago",
    type: "ack",
  },
  {
    event: "ANN-003 acknowledged",
    actor: "Kemi Oladele",
    dept: "Finance",
    time: "12 min ago",
    type: "ack",
  },
  {
    event: "ANN-001 viewed",
    actor: "Seun Adebayo",
    dept: "Marketing",
    time: "18 min ago",
    type: "view",
  },
  {
    event: "ANN-005 viewed",
    actor: "Dami Osei",
    dept: "Marketing",
    time: "25 min ago",
    type: "view",
  },
  {
    event: "ANN-002 acknowledged",
    actor: "Tolu Ogunsanya",
    dept: "HR",
    time: "31 min ago",
    type: "ack",
  },
];

const TYPE_COLORS = {
  policy: C.purple,
  general: C.primary,
  urgent: C.danger,
  event: C.warning,
  reminder: C.accent,
};

/* ─── Mini bar chart ─── */
function BarChart({ data, valueKey, color, maxVal }) {
  const max = maxVal || Math.max(...data.map((d) => d[valueKey]));
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d, i) => (
        <div
          key={d.month || d.dept || i}
          className="flex-1 flex flex-col items-center gap-1"
        >
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{
              delay: i * 0.05,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              width: "100%",
              height: `${(d[valueKey] / max) * 100}%`,
              minHeight: 4,
              background: color,
              borderRadius: "4px 4px 0 0",
              transformOrigin: "bottom",
            }}
          />
          <span
            className="text-[9px] font-semibold truncate w-full text-center"
            style={{ color: C.textMuted }}
          >
            {d.month || d.dept?.slice(0, 3) || ""}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Dual bar chart ─── */
function DualBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.views));
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <motion.div
          key={d.month}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex items-center gap-3"
        >
          <span
            className="text-xs font-semibold w-8 shrink-0"
            style={{ color: C.textMuted }}
          >
            {d.month}
          </span>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <div
                className="flex-1 h-2.5 rounded-full"
                style={{ background: C.border }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(d.views / max) * 100}%` }}
                  transition={{
                    delay: i * 0.04,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="h-full rounded-full"
                  style={{ background: C.primary }}
                />
              </div>
              <span
                className="text-xs font-bold w-10 text-right"
                style={{ color: C.primary }}
              >
                {d.views}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="flex-1 h-2.5 rounded-full"
                style={{ background: C.border }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(d.acks / max) * 100}%` }}
                  transition={{
                    delay: i * 0.04 + 0.05,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="h-full rounded-full"
                  style={{ background: C.success }}
                />
              </div>
              <span
                className="text-xs font-bold w-10 text-right"
                style={{ color: C.success }}
              >
                {d.acks}
              </span>
            </div>
          </div>
          <span
            className="text-[10px] w-8 text-right shrink-0"
            style={{ color: C.textMuted }}
          >
            {d.sent}📢
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Donut chart (CSS) ─── */
function DonutChart({ segments }) {
  const total = segments.reduce((s, seg) => s + seg.pct, 0);
  let cumulative = 0;
  const size = 140;
  const r = 50;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg, i) => {
        const dashArray = (seg.pct / 100) * circumference;
        const dashOffset = -((cumulative / 100) * circumference);
        cumulative += seg.pct;
        return (
          <motion.circle
            key={seg.type}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            strokeWidth={20}
            stroke={seg.color}
            strokeDasharray={`${dashArray} ${circumference}`}
            strokeDashoffset={dashOffset}
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${dashArray} ${circumference}` }}
            transition={{
              delay: i * 0.1,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
      })}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        className="text-xl font-bold"
        style={{
          fill: C.textPrimary,
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "Sora, sans-serif",
        }}
      >
        {segments.reduce((s, seg) => s + seg.count, 0)}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        style={{ fill: C.textMuted, fontSize: 9, fontWeight: 600 }}
      >
        Total
      </text>
    </svg>
  );
}

/* ─── Stat card ─── */
function StatCard({ label, value, change, color, bg, icon: Icon, sub, index }) {
  const positive = change >= 0;
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="rounded-2xl p-5"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: bg }}
        >
          <Icon size={18} color={color} />
        </div>
        <div
          className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full`}
          style={{
            background: positive ? C.successLight : C.dangerLight,
            color: positive ? C.success : C.danger,
          }}
        >
          {positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {Math.abs(change)}%
        </div>
      </div>
      <p
        className="text-2xl font-bold mb-0.5"
        style={{ color, fontFamily: "Sora, sans-serif" }}
      >
        {value}
      </p>
      <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>
        {label}
      </p>
      <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>
        {sub}
      </p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════ */
export default function AnnouncementsAnalytics() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [period, setPeriod] = useState("6m");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const overallEngRate = Math.round(
    (MONTHLY_VIEWS.reduce((s, m) => s + m.acks, 0) /
      MONTHLY_VIEWS.reduce((s, m) => s + m.views, 0)) *
      100,
  );
  const totalViews = MONTHLY_VIEWS.reduce((s, m) => s + m.views, 0);
  const totalAcks = MONTHLY_VIEWS.reduce((s, m) => s + m.acks, 0);
  const totalSent = MONTHLY_VIEWS.reduce((s, m) => s + m.sent, 0);
  const avgReadTime = "1m 42s";

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: C.bg, fontFamily: "Sora, sans-serif" }}
    >
      <AdminSideNavbar
        sidebarOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        ADMIN={ADMIN}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="h-14 flex items-center px-5 gap-4 shrink-0"
          style={{
            background: C.surface,
            borderBottom: `1px solid ${C.border}`,
            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
          }}
        >
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
          >
            <Menu size={18} color={C.textSecondary} />
          </button>
          <div
            className="flex items-center gap-1.5 text-xs"
            style={{ color: C.textMuted }}
          >
            <span>Announcements</span>
            <ChevronRight size={12} />
            <span style={{ color: C.primary, fontWeight: 600 }}>Analytics</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* Period selector */}
            <div
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl"
              style={{
                background: C.surfaceAlt,
                border: `1px solid ${C.border}`,
              }}
            >
              {["1m", "3m", "6m", "1y"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: period === p ? C.primary : "transparent",
                    color: period === p ? "#fff" : C.textMuted,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                color: C.textSecondary,
              }}
            >
              <Download size={13} />
              Export
            </button>
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell size={16} color={C.textSecondary} />
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ background: C.danger }}
              />
            </button>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg,#6366F1,#06B6D4)" }}
            >
              {ADMIN.initials}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <main className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex items-center gap-3 mb-6"
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${C.purple}, ${C.primary})`,
                  boxShadow: `0 4px 16px ${C.purple}44`,
                }}
              >
                <BarChart2 size={18} color="#fff" />
              </div>
              <div>
                <h1
                  className="text-xl font-bold"
                  style={{
                    color: C.textPrimary,
                    fontFamily: "Sora, sans-serif",
                  }}
                >
                  Announcement Analytics
                </h1>
                <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                  Last 6 months · Updated just now
                </p>
              </div>
            </motion.div>

            {/* KPI cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Total Views"
                value={totalViews.toLocaleString()}
                change={18}
                color={C.primary}
                bg={C.primaryLight}
                icon={Eye}
                sub="Across all announcements"
                index={0}
              />
              <StatCard
                label="Acknowledgments"
                value={totalAcks.toLocaleString()}
                change={12}
                color={C.success}
                bg={C.successLight}
                icon={CheckCircle2}
                sub="Employees confirmed reading"
                index={1}
              />
              <StatCard
                label="Engagement Rate"
                value={`${overallEngRate}%`}
                change={-3}
                color={C.purple}
                bg={C.purpleLight}
                icon={Target}
                sub="Acks / Total Recipients"
                index={2}
              />
              <StatCard
                label="Announcements Sent"
                value={totalSent}
                change={20}
                color={C.accent}
                bg={C.accentLight}
                icon={Megaphone}
                sub="In the last 6 months"
                index={3}
              />
            </div>

            {/* Row 2: Charts */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Views vs Acks over time */}
              <motion.div
                custom={0}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="col-span-2 rounded-2xl p-5"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p
                      className="text-sm font-bold"
                      style={{
                        color: C.textPrimary,
                        fontFamily: "Sora, sans-serif",
                      }}
                    >
                      Views & Acknowledgments Over Time
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: C.textMuted }}
                    >
                      Monthly breakdown for the past 6 months
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-1.5 rounded-full inline-block"
                        style={{ background: C.primary }}
                      />
                      Views
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-1.5 rounded-full inline-block"
                        style={{ background: C.success }}
                      />
                      Acknowledged
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span>📢</span>Sent
                    </span>
                  </div>
                </div>
                <DualBarChart data={MONTHLY_VIEWS} />
              </motion.div>

              {/* Type breakdown donut */}
              <motion.div
                custom={1}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="rounded-2xl p-5"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <p
                  className="text-sm font-bold mb-1"
                  style={{
                    color: C.textPrimary,
                    fontFamily: "Sora, sans-serif",
                  }}
                >
                  By Type
                </p>
                <p className="text-xs mb-4" style={{ color: C.textMuted }}>
                  Distribution of announcement types
                </p>
                <div className="flex justify-center mb-4">
                  <DonutChart segments={TYPE_BREAKDOWN} />
                </div>
                <div className="space-y-1.5">
                  {TYPE_BREAKDOWN.map((s) => (
                    <div key={s.type} className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: s.color }}
                      />
                      <span
                        className="text-xs flex-1"
                        style={{ color: C.textSecondary }}
                      >
                        {s.type}
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: s.color }}
                      >
                        {s.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Row 3: Dept engagement + Top announcements */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Department engagement */}
              <motion.div
                custom={0}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="rounded-2xl p-5"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p
                      className="text-sm font-bold"
                      style={{
                        color: C.textPrimary,
                        fontFamily: "Sora, sans-serif",
                      }}
                    >
                      Department Engagement
                    </p>
                    <p className="text-xs" style={{ color: C.textMuted }}>
                      Acknowledgment rate by department
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {DEPT_ENGAGEMENT.map((d, i) => (
                    <motion.div
                      key={d.dept}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      className="flex items-center gap-3"
                    >
                      <span
                        className="text-xs font-semibold w-20 shrink-0 truncate"
                        style={{ color: C.textSecondary }}
                      >
                        {d.dept}
                      </span>
                      <div
                        className="flex-1 h-2.5 rounded-full"
                        style={{ background: C.border }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${d.rate}%` }}
                          transition={{
                            delay: i * 0.04,
                            duration: 0.6,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="h-full rounded-full"
                          style={{
                            background:
                              d.rate >= 90
                                ? C.success
                                : d.rate >= 75
                                  ? C.primary
                                  : d.rate >= 60
                                    ? C.warning
                                    : C.danger,
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-bold w-10 text-right shrink-0"
                        style={{
                          color:
                            d.rate >= 90
                              ? C.success
                              : d.rate >= 75
                                ? C.primary
                                : d.rate >= 60
                                  ? C.warning
                                  : C.danger,
                        }}
                      >
                        {d.rate}%
                      </span>
                      <span
                        className="text-[10px] w-8 text-right shrink-0"
                        style={{ color: C.textMuted }}
                      >
                        {d.employees}👤
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Top performing announcements */}
              <motion.div
                custom={1}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="rounded-2xl p-5"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p
                      className="text-sm font-bold"
                      style={{
                        color: C.textPrimary,
                        fontFamily: "Sora, sans-serif",
                      }}
                    >
                      Top Performing
                    </p>
                    <p className="text-xs" style={{ color: C.textMuted }}>
                      By acknowledgment rate
                    </p>
                  </div>
                  <Award size={16} color={C.warning} />
                </div>
                <div className="space-y-3">
                  {TOP_ANNOUNCEMENTS.map((ann, i) => (
                    <motion.div
                      key={ann.id}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: C.surfaceAlt }}
                    >
                      <span className="text-sm shrink-0">{ann.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-semibold truncate"
                          style={{ color: C.textPrimary }}
                        >
                          {ann.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-[10px]"
                            style={{ color: C.textMuted }}
                          >
                            {ann.views} views
                          </span>
                          <span
                            className="text-[10px]"
                            style={{ color: C.textMuted }}
                          >
                            ·
                          </span>
                          <span
                            className="text-[10px]"
                            style={{ color: C.textMuted }}
                          >
                            {ann.acks} acks
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className="text-sm font-bold"
                          style={{
                            color:
                              ann.rate >= 90
                                ? C.success
                                : ann.rate >= 75
                                  ? C.primary
                                  : C.warning,
                          }}
                        >
                          {ann.rate}%
                        </p>
                        <p
                          className="text-[9px]"
                          style={{ color: C.textMuted }}
                        >
                          eng. rate
                        </p>
                      </div>
                      {i === 0 && (
                        <Award
                          size={14}
                          color={C.warning}
                          className="shrink-0"
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Row 4: Type performance table + live activity */}
            <div className="grid grid-cols-3 gap-4">
              {/* Type performance table */}
              <motion.div
                custom={0}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="col-span-2 rounded-2xl p-5"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <p
                  className="text-sm font-bold mb-4"
                  style={{
                    color: C.textPrimary,
                    fontFamily: "Sora, sans-serif",
                  }}
                >
                  Performance by Type
                </p>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {[
                        "Type",
                        "Count",
                        "Total Views",
                        "Acknowledged",
                        "Avg Eng. Rate",
                      ].map((h) => (
                        <th
                          key={h}
                          className="pb-3 text-left font-bold uppercase tracking-wide"
                          style={{ color: C.textMuted }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TYPE_BREAKDOWN.map((t, i) => {
                      const rate = Math.round((t.acks / t.views) * 100);
                      return (
                        <motion.tr
                          key={t.type}
                          custom={i}
                          initial="hidden"
                          animate="visible"
                          variants={fadeUp}
                          className="hover:bg-gray-50 transition-colors"
                          style={{ borderBottom: `1px solid ${C.border}` }}
                        >
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ background: t.color }}
                              />
                              <span
                                className="font-semibold"
                                style={{ color: C.textPrimary }}
                              >
                                {t.type}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className="font-bold px-2 py-0.5 rounded-full text-[11px]"
                              style={{
                                background: t.color + "18",
                                color: t.color,
                              }}
                            >
                              {t.count}
                            </span>
                          </td>
                          <td
                            className="py-3 pr-4 font-semibold"
                            style={{ color: C.textPrimary }}
                          >
                            {t.views.toLocaleString()}
                          </td>
                          <td
                            className="py-3 pr-4 font-semibold"
                            style={{ color: C.success }}
                          >
                            {t.acks.toLocaleString()}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="flex-1 h-1.5 rounded-full"
                                style={{ background: C.border }}
                              >
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${rate}%`,
                                    background: t.color,
                                  }}
                                />
                              </div>
                              <span
                                className="font-bold w-9"
                                style={{ color: t.color }}
                              >
                                {rate}%
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </motion.div>

              {/* Live activity feed */}
              <motion.div
                custom={1}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="rounded-2xl p-5"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <p
                    className="text-sm font-bold"
                    style={{
                      color: C.textPrimary,
                      fontFamily: "Sora, sans-serif",
                    }}
                  >
                    Live Activity
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ background: C.success }}
                    />
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: C.success }}
                    >
                      Live
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {RECENT_ACTIVITY.map((a, i) => (
                    <motion.div
                      key={i}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      className="flex items-start gap-2.5"
                    >
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background:
                            a.type === "ack" ? C.successLight : C.primaryLight,
                        }}
                      >
                        {a.type === "ack" ? (
                          <CheckCircle2 size={13} color={C.success} />
                        ) : (
                          <Eye size={13} color={C.primary} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-semibold truncate"
                          style={{ color: C.textPrimary }}
                        >
                          {a.actor}
                        </p>
                        <p
                          className="text-[10px] truncate"
                          style={{ color: C.textMuted }}
                        >
                          {a.type === "ack" ? "acknowledged" : "viewed"} ·{" "}
                          {a.dept}
                        </p>
                      </div>
                      <span
                        className="text-[10px] shrink-0"
                        style={{ color: C.textMuted }}
                      >
                        {a.time}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <div
                  className="mt-4 pt-4"
                  style={{ borderTop: `1px solid ${C.border}` }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: C.textMuted }}>Avg. read time</span>
                    <span
                      className="font-bold"
                      style={{ color: C.textPrimary }}
                    >
                      {avgReadTime}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
