// src/pages/Performance.jsx
// Employee self-service performance page.
// All data from API — zero mock data.
// motion aliased as Motion throughout.

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import SideNavbar from "../components/sideNavbar";
import {
  BarChart2,
  Target,
  Star,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Award,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  Flame,
  Eye,
  ArrowUpRight,
  Calendar,
  Menu,
  Bell,
  Search,
  Shield,
  Sparkles,
  Trophy,
  RotateCcw,
  Send,
  X,
  Info,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Minus,
  ArrowDownRight,
} from "lucide-react";
import C from "../styles/colors";
import { authApi } from "../api/service/authApi";
import {
  getEmployeeScores,
  getMyGoals,
  getMyReviews,
  getTrends,
  getInsights,
  submitSelfAssessment,
  updateGoalProgress,
} from "../api/service/performanceApi";

// ── Constants ─────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview" },
  { id: "goals", label: "Goals" },
  { id: "appraisals", label: "Appraisals" },
  { id: "feedback", label: "Feedback" },
  { id: "history", label: "History" },
];

const PRIORITY_MAP = {
  high: { color: C.danger, bg: C.dangerLight },
  medium: { color: C.warning, bg: C.warningLight },
  low: { color: C.success, bg: C.successLight },
};

const RATING_MAP = {
  Outstanding: { color: "#059669", bg: "#D1FAE5" },
  "High Performer": { color: "#2563EB", bg: "#DBEAFE" },
  "Meets Expectations": { color: C.warning, bg: C.warningLight },
  "Needs Improvement": { color: C.danger, bg: C.dangerLight },
  Underperforming: { color: "#7C3AED", bg: "#F3E8FF" },
};

// ── Animations ────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ── Atoms ─────────────────────────────────────────────────────
function Chip({ label, color, bg }) {
  return (
    <span
      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
      style={{ background: bg ?? C.primaryLight, color: color ?? C.primary }}
    >
      {label}
    </span>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
      }}
    >
      {children}
    </div>
  );
}

function CardHead({ icon: Icon, title, sub, color, bg, action }) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-4"
      style={{ borderBottom: `1px solid ${C.border}` }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: bg ?? C.primaryLight }}
      >
        <Icon size={15} color={color ?? C.primary} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
          {title}
        </p>
        {sub && (
          <p className="text-[11px]" style={{ color: C.textMuted }}>
            {sub}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function Skeleton({ h = 14, w = "100%" }) {
  return (
    <div
      style={{
        height: h,
        width: w,
        borderRadius: 8,
        background:
          "linear-gradient(90deg,#E4E7F0 25%,#F0F2F8 50%,#E4E7F0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite linear",
      }}
    />
  );
}

function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  const color = type === "success" ? C.success : C.danger;
  return (
    <Motion.div
      initial={{ opacity: 0, y: 40, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: 40, x: "-50%" }}
      className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl"
      style={{
        background: C.navy,
        boxShadow: "0 12px 40px rgba(15,23,42,0.35)",
        minWidth: 260,
      }}
    >
      <Icon size={16} color={color} />
      <span className="text-white text-sm font-semibold">{msg}</span>
    </Motion.div>
  );
}

// ── Score ring (SVG) ──────────────────────────────────────────
function ScoreRing({ score, size = 120 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = ((score ?? 0) / 100) * circ;
  const color =
    score >= 85
      ? C.success
      : score >= 60
        ? C.primary
        : score >= 40
          ? C.warning
          : C.danger;
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={10}
          stroke={C.border}
        />
        <Motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={10}
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className="text-3xl font-black"
          style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
        >
          {score ?? "—"}
        </span>
        <span
          className="text-[10px] font-semibold"
          style={{ color: C.textMuted }}
        >
          / 100
        </span>
      </div>
    </div>
  );
}

// ── Mini trend chart (SVG) ────────────────────────────────────
function TrendLine({ data }) {
  if (!data?.length) return null;
  const W = 220;
  const H = 60;
  const PAD = 8;
  const scores = data.map((d) => d.score ?? d.final_score ?? 0);
  const min = Math.min(...scores);
  const max = Math.max(...scores, min + 1);
  const pts = scores
    .map((s, i) => {
      const x = PAD + (i / Math.max(scores.length - 1, 1)) * (W - PAD * 2);
      const y = H - PAD - ((s - min) / (max - min + 0.01)) * (H - PAD * 2);
      return `${x},${y}`;
    })
    .join(" ");
  const last = scores.at(-1);
  const prev = scores.at(-2);
  const trend =
    prev == null
      ? "new"
      : last > prev + 2
        ? "up"
        : last < prev - 2
          ? "down"
          : "stable";
  const color =
    trend === "up" ? C.success : trend === "down" ? C.danger : C.primary;
  return (
    <div className="flex items-center gap-3">
      <svg width={W} height={H} style={{ overflow: "visible" }}>
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {scores.map((s, i) => {
          const x = PAD + (i / Math.max(scores.length - 1, 1)) * (W - PAD * 2);
          const y = H - PAD - ((s - min) / (max - min + 0.01)) * (H - PAD * 2);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={4} fill={color} />
              <text
                x={x}
                y={y - 8}
                textAnchor="middle"
                fontSize={8}
                fill={C.textMuted}
              >
                {s}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-1">
        {trend === "up" && <ArrowUpRight size={16} color={C.success} />}
        {trend === "down" && <ArrowDownRight size={16} color={C.danger} />}
        {trend === "stable" && <Minus size={16} color={C.textMuted} />}
        <span className="text-xs font-semibold" style={{ color }}>
          {trend === "new"
            ? "First score"
            : trend === "stable"
              ? "Stable"
              : `${trend === "up" ? "+" : ""}${(last - (prev ?? last)).toFixed(0)}`}
        </span>
      </div>
    </div>
  );
}

// ── Goal progress bar ─────────────────────────────────────────
function GoalBar({ progress, label }) {
  const color =
    progress >= 100
      ? C.success
      : progress >= 60
        ? C.primary
        : progress >= 30
          ? C.warning
          : C.danger;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-xs font-medium"
          style={{ color: C.textSecondary }}
        >
          {label}
        </span>
        <span className="text-xs font-bold" style={{ color }}>
          {progress}%
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: C.surfaceAlt }}
      >
        <Motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

// ── Self Assessment Modal ─────────────────────────────────────
function AssessmentModal({ review, onClose, onSubmitted }) {
  const [answers, setAnswers] = useState({});
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await submitSelfAssessment(review.id, {
        sections: answers,
        overallComment: comment,
      });
      onSubmitted();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to submit assessment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <Motion.div
        initial={{ scale: 0.93, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 20 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
        style={{
          background: C.surface,
          boxShadow: "0 24px 64px rgba(15,23,42,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-5 py-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: C.primaryLight }}
            >
              <Star size={14} color={C.primary} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
                Self Assessment
              </p>
              <p className="text-[10px]" style={{ color: C.textMuted }}>
                {review.cycle_name ?? review.cycle ?? "Current Cycle"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: C.surfaceAlt }}
          >
            <X size={13} color={C.textMuted} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: C.dangerLight }}
            >
              <AlertTriangle size={13} color={C.danger} />
              <p className="text-xs" style={{ color: C.danger }}>
                {error}
              </p>
            </div>
          )}

          {/* Dynamic sections from review */}
          {(
            review.sections ?? [
              { key: "achievements", label: "Key Achievements this period" },
              {
                key: "challenges",
                label: "Challenges faced & how you overcame them",
              },
              { key: "goals_progress", label: "Progress on assigned goals" },
              {
                key: "development",
                label: "Skills developed / training completed",
              },
              { key: "next_period", label: "Goals & focus for next period" },
            ]
          ).map((section) => (
            <div key={section.key ?? section.id}>
              <label
                className="block text-xs font-semibold mb-1"
                style={{ color: C.textPrimary }}
              >
                {section.label ?? section.title}
              </label>
              <textarea
                rows={3}
                value={answers[section.key ?? section.id] ?? ""}
                onChange={(e) =>
                  setAnswers((p) => ({
                    ...p,
                    [section.key ?? section.id]: e.target.value,
                  }))
                }
                placeholder="Write your response here..."
                className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1.5px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              />
            </div>
          ))}

          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: C.textPrimary }}
            >
              Overall Comments
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Any additional comments for your reviewer..."
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
                color: C.textPrimary,
              }}
            />
          </div>
        </div>

        <div className="flex gap-3 px-5 pb-5 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
              color: C.textSecondary,
            }}
          >
            Cancel
          </button>
          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: C.primary, opacity: saving ? 0.8 : 1 }}
          >
            {saving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Send size={13} />
            )}
            Submit Assessment
          </Motion.button>
        </div>
      </Motion.div>
    </Motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
export default function PerformancePage() {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [scores, setScores] = useState([]); // history
  const [latestScore, setLatestScore] = useState(null);
  const [trends, setTrends] = useState([]);
  const [goals, setGoals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedGoal, setExpandedGoal] = useState(null);
  const [assessModal, setAssessModal] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch current user
      const me = await authApi.getMe();
      setUser(me);
      const empId = me.employee_id ?? me.employeeId;
      if (!empId)
        throw new Error("No employee profile linked to this account.");

      const emp = {
        id: empId,
        name: `${me.firstName ?? me.first_name} ${me.lastName ?? me.last_name}`,
        initials:
          `${(me.firstName ?? me.first_name ?? "?")[0]}${(me.lastName ?? me.last_name ?? "?")[0]}`.toUpperCase(),
        role: me.role,
        department: me.company?.name ?? "",
        email: me.email,
      };
      setEmployee(emp);

      // 2. Parallel fetch
      const [scoresRes, goalsRes, reviewsRes, trendsRes, insightsRes] =
        await Promise.allSettled([
          getEmployeeScores(empId),
          getMyGoals(),
          getMyReviews(),
          getTrends(empId),
          getInsights(empId),
        ]);

      const scoreData =
        scoresRes.status === "fulfilled" ? (scoresRes.value?.data ?? []) : [];
      const goalsData =
        goalsRes.status === "fulfilled" ? (goalsRes.value?.data ?? []) : [];
      const reviewsData =
        reviewsRes.status === "fulfilled" ? (reviewsRes.value?.data ?? []) : [];
      const trendsData =
        trendsRes.status === "fulfilled"
          ? (trendsRes.value?.data ?? trendsRes.value?.trends ?? [])
          : [];
      const insightData =
        insightsRes.status === "fulfilled" ? (insightsRes.value ?? []) : [];

      setScores(scoreData);
      setLatestScore(scoreData[0] ?? null);
      setTrends(trendsData);
      setGoals(goalsData);
      setReviews(reviewsData);
      setInsights(insightData);
    } catch (err) {
      setError(
        err?.response?.data?.message ??
          err.message ??
          "Failed to load performance data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Derived counts
  const pendingReviews = reviews.filter(
    (r) => r.status?.toLowerCase() === "pending",
  );
  const completedGoals = goals.filter(
    (g) => g.status?.toLowerCase() === "completed" || g.progress >= 100,
  );
  const inProgressGoals = goals.filter(
    (g) => g.status?.toLowerCase() === "in_progress" && g.progress < 100,
  );

  // Filtered goals by search
  const filteredGoals = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return goals.filter(
      (g) =>
        !q ||
        g.title?.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q),
    );
  }, [goals, searchQuery]);

  const ratingCfg = RATING_MAP[latestScore?.rating] ?? {
    color: C.textMuted,
    bg: C.surfaceAlt,
  };

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: C.bg }}
      >
        <Loader2
          size={28}
          className="animate-spin"
          style={{ color: C.primary }}
        />
      </div>
    );

  return (
    <div
      className="min-h-screen"
      style={{
        background: C.bg,
        color: C.textPrimary,
        fontFamily: "'DM Sans','Sora',sans-serif",
      }}
    >
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>

      <div className="flex h-screen overflow-hidden">
        <SideNavbar
          sidebarOpen={sidebarOpen}
          COLORS={C}
          EMPLOYEE={employee ?? {}}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* TOPBAR */}
          <header
            className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{
              background: "rgba(240,242,248,0.9)",
              backdropFilter: "blur(12px)",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen((p) => !p)}
              className="p-2 rounded-xl hidden md:flex"
              style={{ background: C.surface }}
            >
              <Menu size={16} color={C.textSecondary} />
            </Motion.button>

            <Motion.div
              className="flex-1 max-w-xs relative"
              animate={{ width: searchFocused ? "320px" : "240px" }}
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
                placeholder="Search goals..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{
                  background: C.surface,
                  border: `1.5px solid ${searchFocused ? C.primary : C.border}`,
                  color: C.textPrimary,
                }}
              />
            </Motion.div>

            <div className="flex items-center gap-2 ml-auto">
              <Motion.button
                whileHover={{ scale: 1.05 }}
                onClick={load}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <RefreshCw size={14} color={C.textSecondary} />
              </Motion.button>
              <div className="relative">
                <Motion.button
                  className="p-2 rounded-xl"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <Bell size={16} color={C.textSecondary} />
                </Motion.button>
                {pendingReviews.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                    style={{ background: C.warning }}
                  >
                    {pendingReviews.length}
                  </span>
                )}
              </div>
              {employee && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    background: "linear-gradient(135deg,#4F46E5,#06B6D4)",
                  }}
                >
                  {employee.initials}
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {/* Hero banner */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-6 text-white relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
              }}
            >
              <div className="absolute inset-0 opacity-5">
                <div
                  className="absolute top-0 right-0 w-72 h-72 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle,#fff 0%,transparent 70%)",
                    transform: "translate(30%,-30%)",
                  }}
                />
              </div>
              <div className="relative flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/15 shrink-0">
                  <BarChart2 size={30} />
                </div>
                <div className="flex-1">
                  <h1
                    className="text-2xl font-bold"
                    style={{ fontFamily: "Sora,sans-serif" }}
                  >
                    Performance
                  </h1>
                  <p className="text-indigo-200 text-sm mt-0.5">
                    {employee?.name ?? "Employee"} ·{" "}
                    {latestScore ? (
                      <span>
                        Current Score:{" "}
                        <strong>{latestScore.final_score}</strong> —{" "}
                        {latestScore.rating}
                      </span>
                    ) : (
                      "No score data yet"
                    )}
                  </p>
                </div>
                {latestScore && (
                  <div className="shrink-0">
                    <Chip
                      label={latestScore.rating}
                      color={ratingCfg.color}
                      bg={ratingCfg.bg}
                    />
                  </div>
                )}
              </div>
            </Motion.div>

            {/* Error */}
            {error && (
              <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{ background: C.dangerLight }}
              >
                <AlertTriangle size={16} color={C.danger} />
                <p className="text-sm" style={{ color: C.danger }}>
                  {error}
                </p>
              </div>
            )}

            {/* Pending review alert */}
            {pendingReviews.length > 0 && (
              <Motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{
                  background: C.warningLight,
                  border: `1px solid ${C.warning}44`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: C.warning }}
                >
                  <Star size={15} color="#fff" />
                </div>
                <div className="flex-1">
                  <p
                    className="font-semibold text-sm"
                    style={{ color: C.textPrimary }}
                  >
                    {pendingReviews.length} appraisal
                    {pendingReviews.length > 1 ? "s" : ""} pending your
                    self-assessment
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: C.textSecondary }}
                  >
                    Complete your self-assessment to keep the review cycle on
                    track.
                  </p>
                </div>
                <Motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab("appraisals")}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl shrink-0"
                  style={{ background: C.warning, color: "#fff" }}
                >
                  Review Now
                </Motion.button>
              </Motion.div>
            )}

            {/* Tabs */}
            <div
              className="flex gap-1 p-1 rounded-2xl overflow-x-auto"
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                scrollbarWidth: "none",
              }}
            >
              {TABS.map((t) => {
                const active = activeTab === t.id;
                return (
                  <Motion.button
                    key={t.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab(t.id)}
                    className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0"
                    style={{
                      background: active ? C.primary : "transparent",
                      color: active ? "#fff" : C.textSecondary,
                      boxShadow: active
                        ? "0 2px 8px rgba(79,70,229,0.25)"
                        : "none",
                    }}
                  >
                    {t.label}
                  </Motion.button>
                );
              })}
            </div>

            {/* ─── TAB CONTENT ─── */}
            <AnimatePresence mode="wait">
              {/* OVERVIEW */}
              {activeTab === "overview" && (
                <Motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* Score + stats row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Score ring */}
                    <Card className="p-6 flex items-center gap-6">
                      <ScoreRing score={latestScore?.final_score} />
                      <div className="flex-1 space-y-3">
                        <div>
                          <p
                            className="text-xs"
                            style={{ color: C.textSecondary }}
                          >
                            Current Rating
                          </p>
                          {latestScore?.rating ? (
                            <Chip
                              label={latestScore.rating}
                              color={ratingCfg.color}
                              bg={ratingCfg.bg}
                            />
                          ) : (
                            <p
                              className="text-sm font-semibold"
                              style={{ color: C.textMuted }}
                            >
                              No data
                            </p>
                          )}
                        </div>
                        <div>
                          <p
                            className="text-xs"
                            style={{ color: C.textSecondary }}
                          >
                            Period
                          </p>
                          <p
                            className="font-semibold text-sm"
                            style={{ color: C.textPrimary }}
                          >
                            {latestScore?.period ?? "—"}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            {
                              label: "KPI",
                              value: latestScore?.kpi_score ?? "—",
                            },
                            {
                              label: "Attendance",
                              value: latestScore?.attendance_score ?? "—",
                            },
                            {
                              label: "Training",
                              value: latestScore?.training_score ?? "—",
                            },
                          ].map((s) => (
                            <div
                              key={s.label}
                              className="rounded-xl p-2 text-center"
                              style={{ background: C.surfaceAlt }}
                            >
                              <p
                                className="text-sm font-black"
                                style={{ color: C.textPrimary }}
                              >
                                {s.value}
                              </p>
                              <p
                                className="text-[9px] font-semibold"
                                style={{ color: C.textMuted }}
                              >
                                {s.label}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>

                    {/* Trend */}
                    <Card className="p-6">
                      <CardHead
                        icon={TrendingUp}
                        title="Score Trend"
                        sub="Monthly performance history"
                        color={C.success}
                        bg={C.successLight}
                      />
                      <div className="p-4">
                        {trends.length === 0 ? (
                          <p
                            className="text-sm text-center py-6"
                            style={{ color: C.textMuted }}
                          >
                            No trend data yet
                          </p>
                        ) : (
                          <>
                            <TrendLine data={trends.slice(-6)} />
                            <div className="flex gap-2 mt-3 overflow-x-auto">
                              {trends.slice(-6).map((t, i) => (
                                <div key={i} className="text-center shrink-0">
                                  <p
                                    className="text-[10px]"
                                    style={{ color: C.textMuted }}
                                  >
                                    {t.period?.slice(-5)}
                                  </p>
                                  <p
                                    className="text-xs font-bold"
                                    style={{ color: C.textPrimary }}
                                  >
                                    {t.score ?? t.final_score}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </Card>
                  </div>

                  {/* Insights */}
                  {insights.length > 0 && (
                    <Card>
                      <CardHead
                        icon={Sparkles}
                        title="Performance Insights"
                        sub="Auto-generated analysis"
                        color="#7C3AED"
                        bg="#F3E8FF"
                      />
                      <div className="p-4 space-y-2">
                        {insights.map((ins, i) => {
                          const cfg = {
                            positive: {
                              color: C.success,
                              bg: C.successLight,
                              icon: TrendingUp,
                            },
                            warning: {
                              color: C.danger,
                              bg: C.dangerLight,
                              icon: AlertCircle,
                            },
                            leadership: {
                              color: "#7C3AED",
                              bg: "#F3E8FF",
                              icon: Trophy,
                            },
                            pip: {
                              color: C.danger,
                              bg: C.dangerLight,
                              icon: AlertTriangle,
                            },
                          }[ins.type] ?? {
                            color: C.primary,
                            bg: C.primaryLight,
                            icon: Info,
                          };
                          const Icon = cfg.icon;
                          return (
                            <Motion.div
                              key={i}
                              custom={i}
                              variants={fadeUp}
                              initial="hidden"
                              animate="visible"
                              className="flex items-center gap-3 p-3 rounded-xl"
                              style={{
                                background: cfg.bg,
                                border: `1px solid ${cfg.color}22`,
                              }}
                            >
                              <Icon
                                size={14}
                                color={cfg.color}
                                className="shrink-0"
                              />
                              <p
                                className="text-xs font-medium"
                                style={{ color: cfg.color }}
                              >
                                {ins.message}
                              </p>
                            </Motion.div>
                          );
                        })}
                      </div>
                    </Card>
                  )}

                  {/* Quick stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Goals In Progress",
                        value: inProgressGoals.length,
                        icon: Target,
                        color: C.primary,
                        bg: C.primaryLight,
                      },
                      {
                        label: "Goals Completed",
                        value: completedGoals.length,
                        icon: CheckCircle2,
                        color: C.success,
                        bg: C.successLight,
                      },
                      {
                        label: "Pending Reviews",
                        value: pendingReviews.length,
                        icon: Clock,
                        color: C.warning,
                        bg: C.warningLight,
                      },
                      {
                        label: "Total Reviews",
                        value: reviews.length,
                        icon: Award,
                        color: "#7C3AED",
                        bg: "#F3E8FF",
                      },
                    ].map((s, i) => (
                      <Motion.div
                        key={s.label}
                        custom={i}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ y: -2 }}
                        className="rounded-2xl p-4 flex items-center gap-3"
                        style={{
                          background: C.surface,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: s.bg }}
                        >
                          <s.icon size={16} color={s.color} />
                        </div>
                        <div>
                          <p
                            className="text-xl font-black"
                            style={{ color: C.textPrimary }}
                          >
                            {s.value}
                          </p>
                          <p
                            className="text-[11px]"
                            style={{ color: C.textSecondary }}
                          >
                            {s.label}
                          </p>
                        </div>
                      </Motion.div>
                    ))}
                  </div>
                </Motion.div>
              )}

              {/* GOALS */}
              {activeTab === "goals" && (
                <Motion.div
                  key="goals"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Card>
                    <CardHead
                      icon={Target}
                      title="My Goals & KPIs"
                      sub={`${goals.length} goals · ${completedGoals.length} completed`}
                      action={
                        <Chip label={`${inProgressGoals.length} active`} />
                      }
                    />
                    <div className="p-4 space-y-3">
                      {filteredGoals.length === 0 ? (
                        <div className="py-12 text-center">
                          <Target
                            size={36}
                            color={C.textMuted}
                            className="mx-auto mb-2"
                          />
                          <p
                            className="font-semibold text-sm"
                            style={{ color: C.textSecondary }}
                          >
                            {searchQuery
                              ? "No goals match your search"
                              : "No goals assigned yet"}
                          </p>
                        </div>
                      ) : (
                        filteredGoals.map((goal, i) => {
                          const isExpanded = expandedGoal === goal.id;
                          const priorityCfg =
                            PRIORITY_MAP[goal.priority?.toLowerCase()] ??
                            PRIORITY_MAP.medium;
                          const isCompleted =
                            goal.status?.toLowerCase() === "completed" ||
                            goal.progress >= 100;

                          return (
                            <Motion.div
                              key={goal.id}
                              custom={i}
                              variants={fadeUp}
                              initial="hidden"
                              animate="visible"
                              className="rounded-2xl border overflow-hidden"
                              style={{
                                borderColor: C.border,
                                background: C.surface,
                              }}
                            >
                              <button
                                onClick={() =>
                                  setExpandedGoal(isExpanded ? null : goal.id)
                                }
                                className="w-full flex items-center gap-4 p-4 text-left"
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background =
                                    C.surfaceAlt)
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background =
                                    "transparent")
                                }
                              >
                                <div
                                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                  style={{
                                    background: isCompleted
                                      ? C.successLight
                                      : C.primaryLight,
                                  }}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 size={16} color={C.success} />
                                  ) : (
                                    <Target size={16} color={C.primary} />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                    <p
                                      className="font-semibold text-sm truncate"
                                      style={{ color: C.textPrimary }}
                                    >
                                      {goal.title}
                                    </p>
                                    <Chip
                                      label={goal.priority ?? "medium"}
                                      color={priorityCfg.color}
                                      bg={priorityCfg.bg}
                                    />
                                    {isCompleted && (
                                      <Chip
                                        label="✓ Complete"
                                        color={C.success}
                                        bg={C.successLight}
                                      />
                                    )}
                                  </div>
                                  <GoalBar
                                    progress={goal.progress ?? 0}
                                    label={`${goal.progress ?? 0}% complete`}
                                  />
                                </div>
                                <div className="shrink-0 flex items-center gap-2">
                                  <p
                                    className="text-[11px]"
                                    style={{ color: C.textMuted }}
                                  >
                                    {goal.due_date ?? goal.dueDate ?? "—"}
                                  </p>
                                  <Motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                  >
                                    <ChevronDown
                                      size={14}
                                      color={C.textMuted}
                                    />
                                  </Motion.div>
                                </div>
                              </button>

                              <AnimatePresence>
                                {isExpanded && (
                                  <Motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.22 }}
                                    className="overflow-hidden"
                                  >
                                    <div
                                      className="px-4 pb-4 pt-0 space-y-3"
                                      style={{
                                        borderTop: `1px solid ${C.border}`,
                                      }}
                                    >
                                      {goal.description && (
                                        <p
                                          className="text-xs leading-relaxed pt-3"
                                          style={{ color: C.textSecondary }}
                                        >
                                          {goal.description}
                                        </p>
                                      )}
                                      {(goal.kpis ?? []).length > 0 && (
                                        <div>
                                          <p
                                            className="text-[10px] font-bold mb-1.5"
                                            style={{ color: C.textMuted }}
                                          >
                                            KPIs
                                          </p>
                                          <div className="space-y-1">
                                            {goal.kpis.map((kpi, j) => (
                                              <div
                                                key={j}
                                                className="flex items-center gap-2"
                                              >
                                                <CheckCircle2
                                                  size={11}
                                                  color={C.success}
                                                />
                                                <span
                                                  className="text-xs"
                                                  style={{
                                                    color: C.textSecondary,
                                                  }}
                                                >
                                                  {kpi}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      <div
                                        className="flex items-center gap-2 text-xs"
                                        style={{ color: C.textMuted }}
                                      >
                                        <Calendar size={11} />
                                        <span>
                                          Due:{" "}
                                          {goal.due_date ?? goal.dueDate ?? "—"}
                                        </span>
                                        {goal.metric && (
                                          <>
                                            <span>·</span>
                                            <span>Metric: {goal.metric}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </Motion.div>
                                )}
                              </AnimatePresence>
                            </Motion.div>
                          );
                        })
                      )}
                    </div>
                  </Card>
                </Motion.div>
              )}

              {/* APPRAISALS */}
              {activeTab === "appraisals" && (
                <Motion.div
                  key="appraisals"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Card>
                    <CardHead
                      icon={Star}
                      title="My Appraisals"
                      sub="Self-assessments and review cycles"
                      action={
                        pendingReviews.length > 0 ? (
                          <Chip
                            label={`${pendingReviews.length} pending`}
                            color={C.warning}
                            bg={C.warningLight}
                          />
                        ) : null
                      }
                    />
                    <div className="p-4 space-y-3">
                      {reviews.length === 0 ? (
                        <div className="py-12 text-center">
                          <Star
                            size={36}
                            color={C.textMuted}
                            className="mx-auto mb-2"
                          />
                          <p
                            className="font-semibold text-sm"
                            style={{ color: C.textSecondary }}
                          >
                            No appraisals yet
                          </p>
                        </div>
                      ) : (
                        reviews.map((rev, i) => {
                          const isPending =
                            rev.status?.toLowerCase() === "pending";
                          const isSelf =
                            rev.status?.toLowerCase() === "self_completed";
                          const isDone =
                            rev.status?.toLowerCase() === "finalized";
                          return (
                            <Motion.div
                              key={rev.id}
                              custom={i}
                              variants={fadeUp}
                              initial="hidden"
                              animate="visible"
                              className="flex items-center gap-4 p-4 rounded-2xl"
                              style={{
                                background: C.surfaceAlt,
                                border: `1px solid ${C.border}`,
                              }}
                            >
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{
                                  background: isDone
                                    ? C.successLight
                                    : isPending
                                      ? C.warningLight
                                      : C.primaryLight,
                                }}
                              >
                                {isDone ? (
                                  <CheckCircle2 size={18} color={C.success} />
                                ) : isPending ? (
                                  <Clock size={18} color={C.warning} />
                                ) : (
                                  <Star size={18} color={C.primary} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <p
                                    className="font-semibold text-sm"
                                    style={{ color: C.textPrimary }}
                                  >
                                    {rev.cycle_name ??
                                      rev.cycle ??
                                      "Review Cycle"}
                                  </p>
                                  <Chip
                                    label={
                                      isDone
                                        ? "Finalized"
                                        : isPending
                                          ? "Pending"
                                          : isSelf
                                            ? "Self Done"
                                            : rev.status
                                    }
                                    color={
                                      isDone
                                        ? C.success
                                        : isPending
                                          ? C.warning
                                          : C.primary
                                    }
                                    bg={
                                      isDone
                                        ? C.successLight
                                        : isPending
                                          ? C.warningLight
                                          : C.primaryLight
                                    }
                                  />
                                </div>
                                {rev.created_at && (
                                  <p
                                    className="text-[11px]"
                                    style={{ color: C.textMuted }}
                                  >
                                    Created{" "}
                                    {new Date(
                                      rev.created_at,
                                    ).toLocaleDateString("en-NG")}
                                  </p>
                                )}
                              </div>
                              {isPending && (
                                <Motion.button
                                  whileHover={{ scale: 1.04 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => setAssessModal(rev)}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white shrink-0"
                                  style={{
                                    background: `linear-gradient(135deg,${C.primary},#6366F1)`,
                                  }}
                                >
                                  <Send size={11} /> Start Assessment
                                </Motion.button>
                              )}
                            </Motion.div>
                          );
                        })
                      )}
                    </div>
                  </Card>
                </Motion.div>
              )}

              {/* FEEDBACK */}
              {activeTab === "feedback" && (
                <Motion.div
                  key="feedback"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Card>
                    <CardHead
                      icon={MessageSquare}
                      title="Manager Feedback"
                      sub="Comments from your performance reviews"
                    />
                    <div className="p-4 space-y-4">
                      {scores.length === 0 ? (
                        <div className="py-12 text-center">
                          <MessageSquare
                            size={36}
                            color={C.textMuted}
                            className="mx-auto mb-2"
                          />
                          <p
                            className="font-semibold text-sm"
                            style={{ color: C.textSecondary }}
                          >
                            No feedback yet
                          </p>
                        </div>
                      ) : (
                        reviews
                          .filter((r) => r.manager_comment)
                          .map((rev, i) => (
                            <Motion.div
                              key={rev.id}
                              custom={i}
                              variants={fadeUp}
                              initial="hidden"
                              animate="visible"
                              className="p-4 rounded-2xl"
                              style={{
                                background: C.surfaceAlt,
                                border: `1px solid ${C.border}`,
                              }}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                                  style={{
                                    background:
                                      "linear-gradient(135deg,#6366F1,#8B5CF6)",
                                  }}
                                >
                                  {rev.reviewed_by_name
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2) ?? "HR"}
                                </div>
                                <div>
                                  <p
                                    className="text-xs font-semibold"
                                    style={{ color: C.textPrimary }}
                                  >
                                    {rev.reviewed_by_name ?? "HR"}
                                  </p>
                                  <p
                                    className="text-[10px]"
                                    style={{ color: C.textMuted }}
                                  >
                                    {rev.cycle_name ?? rev.cycle} ·{" "}
                                    {rev.approved_at
                                      ? new Date(
                                          rev.approved_at,
                                        ).toLocaleDateString("en-NG")
                                      : "—"}
                                  </p>
                                </div>
                              </div>
                              <p
                                className="text-sm leading-relaxed"
                                style={{ color: C.textSecondary }}
                              >
                                {rev.manager_comment}
                              </p>
                            </Motion.div>
                          ))
                      )}
                    </div>
                  </Card>
                </Motion.div>
              )}

              {/* HISTORY */}
              {activeTab === "history" && (
                <Motion.div
                  key="history"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Card>
                    <CardHead
                      icon={RotateCcw}
                      title="Score History"
                      sub="All recorded performance scores"
                    />
                    <div className="p-4 space-y-3">
                      {scores.length === 0 ? (
                        <div className="py-12 text-center">
                          <BarChart2
                            size={36}
                            color={C.textMuted}
                            className="mx-auto mb-2"
                          />
                          <p
                            className="font-semibold text-sm"
                            style={{ color: C.textSecondary }}
                          >
                            No score history yet
                          </p>
                        </div>
                      ) : (
                        scores.map((sc, i) => {
                          const rCfg = RATING_MAP[sc.rating] ?? {
                            color: C.textMuted,
                            bg: C.surfaceAlt,
                          };
                          return (
                            <Motion.div
                              key={sc.id ?? i}
                              custom={i}
                              variants={fadeUp}
                              initial="hidden"
                              animate="visible"
                              className="flex items-center gap-4 p-4 rounded-2xl"
                              style={{
                                background: C.surfaceAlt,
                                border: `1px solid ${C.border}`,
                              }}
                            >
                              <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-black text-lg"
                                style={{
                                  background: rCfg.bg,
                                  color: rCfg.color,
                                  fontFamily: "Sora,sans-serif",
                                }}
                              >
                                {sc.final_score}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <p
                                    className="font-semibold text-sm"
                                    style={{ color: C.textPrimary }}
                                  >
                                    {sc.period}
                                  </p>
                                  <Chip
                                    label={sc.rating}
                                    color={rCfg.color}
                                    bg={rCfg.bg}
                                  />
                                </div>
                                <div
                                  className="flex gap-3 text-[11px]"
                                  style={{ color: C.textMuted }}
                                >
                                  <span>KPI: {sc.kpi_score}</span>
                                  <span>·</span>
                                  <span>Attendance: {sc.attendance_score}</span>
                                  <span>·</span>
                                  <span>Training: {sc.training_score}</span>
                                </div>
                              </div>
                              <p
                                className="text-[11px] shrink-0"
                                style={{ color: C.textMuted }}
                              >
                                {sc.calculated_at
                                  ? new Date(
                                      sc.calculated_at,
                                    ).toLocaleDateString("en-NG")
                                  : "—"}
                              </p>
                            </Motion.div>
                          );
                        })
                      )}
                    </div>
                  </Card>
                </Motion.div>
              )}
            </AnimatePresence>

            <div className="h-6" />
          </main>
        </div>
      </div>

      {/* Assessment Modal */}
      <AnimatePresence>
        {assessModal && (
          <AssessmentModal
            review={assessModal}
            onClose={() => setAssessModal(null)}
            onSubmitted={() => {
              setReviews((prev) =>
                prev.map((r) =>
                  r.id === assessModal.id
                    ? { ...r, status: "self_completed" }
                    : r,
                ),
              );
              setAssessModal(null);
              showToast("Self-assessment submitted successfully.");
            }}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            msg={toast.msg}
            type={toast.type}
            onDone={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// tiny alias for Overview tab
const ClipboardCheck = CheckCircle2;
