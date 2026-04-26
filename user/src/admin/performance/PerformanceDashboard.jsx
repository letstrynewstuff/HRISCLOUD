// src/admin/performance/PerformanceDashboard.jsx
// Fully connected — no mock data. Reads from performanceApi.js

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Award,
  AlertTriangle,
  Crown,
  Zap,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Filter,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import {
  getDashboard,
  getTopPerformers,
  listPIPs,
  createPIP,
} from "../../api/service/performanceApi";
import { departmentApi } from "../../api/service/departmentApi";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─── Rating badge ──────────────────────────────────────────────
function RatingBadge({ rating }) {
  const map = {
    Outstanding: { bg: "#D1FAE5", color: "#059669" },
    "High Performer": { bg: "#DBEAFE", color: "#2563EB" },
    "Meets Expectations": { bg: "#FEF3C7", color: "#D97706" },
    "Needs Improvement": { bg: "#FEE2E2", color: "#DC2626" },
    Underperforming: { bg: "#F3E8FF", color: "#7C3AED" },
  };
  const s = map[rating] ?? { bg: C.surfaceAlt, color: C.textMuted };
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {rating}
    </span>
  );
}

// ─── Trend arrow ───────────────────────────────────────────────
function TrendArrow({ trend }) {
  if (trend === "up") return <ArrowUpRight size={14} color="#10B981" />;
  if (trend === "down") return <ArrowDownRight size={14} color="#EF4444" />;
  if (trend === "new") return <Zap size={14} color="#F59E0B" />;
  return <Minus size={14} color="#94A3B8" />;
}

// ─── Score gauge bar ───────────────────────────────────────────
function ScoreBar({ score }) {
  const color =
    score >= 85
      ? "#10B981"
      : score >= 60
        ? "#4F46E5"
        : score >= 40
          ? "#F59E0B"
          : "#EF4444";
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 h-1.5 rounded-full"
        style={{ background: C.border }}
      >
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ background: color }}
        />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

// ─── Bar chart (department comparison) ────────────────────────
function DeptBarChart({ data }) {
  if (!data?.length)
    return (
      <div
        className="h-32 flex items-center justify-center"
        style={{ color: C.textMuted }}
      >
        <p className="text-sm">No department data</p>
      </div>
    );
  const max = Math.max(...data.map((d) => d.avgScore), 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((dept, i) => {
        const height = Math.round((dept.avgScore / max) * 100);
        const color =
          dept.avgScore >= 85
            ? "#10B981"
            : dept.avgScore >= 60
              ? "#4F46E5"
              : "#F59E0B";
        return (
          <div
            key={dept.name}
            className="flex-1 flex flex-col items-center gap-1.5"
          >
            <span className="text-[10px] font-bold" style={{ color }}>
              {dept.avgScore}
            </span>
            <motion.div
              className="w-full rounded-t"
              style={{ background: color, minHeight: 4 }}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: "easeOut" }}
            />
            <span
              className="text-[9px] text-center truncate w-full"
              style={{ color: C.textMuted }}
            >
              {dept.name?.slice(0, 6)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── PIP modal ─────────────────────────────────────────────────
function PIPModal({ employee, onClose, onCreated }) {
  const [form, setForm] = useState({
    reason: "",
    reviewDate: "",
    goals: [{ title: "", target: 100 }],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.reason || !form.reviewDate) {
      setError("Reason and review date are required.");
      return;
    }
    setSaving(true);
    try {
      await createPIP(employee.employeeId, {
        reason: form.reason,
        reviewDate: form.reviewDate,
        goals: form.goals.filter((g) => g.title.trim()),
      });
      onCreated();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create PIP.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: C.dangerLight }}
            >
              <AlertTriangle size={15} color={C.danger} />
            </div>
            <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
              Start Improvement Plan — {employee.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg"
            style={{ background: C.surfaceAlt }}
          >
            <X size={14} color={C.textMuted} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: C.dangerLight }}
            >
              <AlertCircle size={13} color={C.danger} />
              <p className="text-xs" style={{ color: C.danger }}>
                {error}
              </p>
            </div>
          )}
          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: C.textPrimary }}
            >
              Reason <span style={{ color: C.danger }}>*</span>
            </label>
            <textarea
              value={form.reason}
              onChange={(e) =>
                setForm((p) => ({ ...p, reason: e.target.value }))
              }
              rows={3}
              placeholder="Describe the performance issues..."
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
                color: C.textPrimary,
              }}
            />
          </div>
          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: C.textPrimary }}
            >
              Review Date <span style={{ color: C.danger }}>*</span>
            </label>
            <input
              type="date"
              value={form.reviewDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, reviewDate: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
                color: C.textPrimary,
              }}
            />
          </div>
          <div>
            <p
              className="text-xs font-semibold mb-2"
              style={{ color: C.textPrimary }}
            >
              Improvement Goals (optional)
            </p>
            {form.goals.map((g, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={g.title}
                  onChange={(e) => {
                    const next = [...form.goals];
                    next[i] = { ...next[i], title: e.target.value };
                    setForm((p) => ({ ...p, goals: next }));
                  }}
                  placeholder={`Goal ${i + 1}`}
                  className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                  style={{
                    background: C.surfaceAlt,
                    border: `1.5px solid ${C.border}`,
                    color: C.textPrimary,
                  }}
                />
              </div>
            ))}
            <button
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  goals: [...p.goals, { title: "", target: 100 }],
                }))
              }
              className="text-xs font-semibold"
              style={{ color: C.primary }}
            >
              + Add goal
            </button>
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: C.surfaceAlt,
              color: C.textSecondary,
              border: `1px solid ${C.border}`,
            }}
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: C.danger, opacity: saving ? 0.8 : 1 }}
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Creating…
              </>
            ) : (
              "Create PIP"
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
export default function PerformanceDashboard() {
  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [period, setPeriod] = useState(currentPeriod);
  const [deptFilter, setDeptFilter] = useState("");
  const [departments, setDepartments] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [topData, setTopData] = useState([]);
  const [pips, setPips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pipModal, setPipModal] = useState(null); // employee object
  const [toast, setToast] = useState(null);
  const [searchEmp, setSearchEmp] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, top, pipList, depts] = await Promise.all([
        getDashboard({
          period,
          ...(deptFilter ? { department: deptFilter } : {}),
        }),
        getTopPerformers({ period, limit: 10 }),
        listPIPs({ status: "active" }),
        departmentApi.list(),
      ]);
      setDashboard(dash);
      setTopData(top.data ?? []);
      setPips(pipList.data ?? []);
      setDepartments(depts.departments ?? []);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load performance data.",
      );
    } finally {
      setLoading(false);
    }
  }, [period, deptFilter]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredEmployees = (dashboard?.employees ?? []).filter((e) => {
    if (!searchEmp) return true;
    const q = searchEmp.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      (e.department ?? "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-2xl animate-pulse"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-16 gap-3">
        <AlertCircle size={36} color={C.danger} />
        <p className="font-semibold" style={{ color: C.textPrimary }}>
          {error}
        </p>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl"
          style={{ background: C.primaryLight, color: C.primary }}
        >
          <RefreshCw size={13} />
          Retry
        </button>
      </div>
    );
  }

  const d = dashboard;

  return (
    <div className="space-y-5">
      {/* ── Filter bar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={13} color={C.textMuted} />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl outline-none"
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              color: C.textPrimary,
            }}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
              const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
              return (
                <option key={val} value={val}>
                  {d.toLocaleDateString("en-NG", {
                    month: "short",
                    year: "numeric",
                  })}
                </option>
              );
            })}
          </select>
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-xl outline-none"
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            color: C.textPrimary,
          }}
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
        <button
          onClick={fetchAll}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl"
          style={{
            background: C.surfaceAlt,
            border: `1px solid ${C.border}`,
            color: C.textSecondary,
          }}
        >
          <RefreshCw size={12} />
          Refresh
        </button>
        <span className="text-xs ml-auto" style={{ color: C.textMuted }}>
          {d?.totalEmployees ?? 0} employees · Period: {period}
        </span>
      </div>

      {/* ── KPI cards ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          {
            label: "Avg Company Score",
            value: d?.averageScore ?? 0,
            icon: Target,
            color: C.primary,
            bg: C.primaryLight,
          },
          {
            label: "Top Performer",
            value: d?.topPerformer?.name ?? "—",
            icon: Crown,
            color: "#D97706",
            bg: "#FEF3C7",
            text: true,
          },
          {
            label: "Underperformers",
            value: d?.underperformerCount ?? 0,
            icon: AlertTriangle,
            color: C.danger,
            bg: C.dangerLight,
          },
          {
            label: "On PIPs",
            value: pips.length,
            icon: AlertCircle,
            color: C.purple,
            bg: "#EDE9FE",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            custom={i}
            variants={fadeUp}
            whileHover={{ y: -3 }}
          >
            <div
              className="rounded-2xl p-5 border shadow-sm"
              style={{ background: C.surface, borderColor: C.border }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: s.bg }}
                >
                  <s.icon size={19} color={s.color} />
                </div>
                <div className="min-w-0">
                  <p
                    className={`font-bold truncate ${s.text ? "text-sm" : "text-3xl"}`}
                    style={{
                      color: C.textPrimary,
                      fontFamily: "Sora,sans-serif",
                    }}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                    {s.label}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Department comparison */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: C.surface, borderColor: C.border }}
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={15} color={C.primary} />
            <h3
              className="font-semibold text-sm"
              style={{ color: C.textPrimary }}
            >
              Department Comparison
            </h3>
          </div>
          <DeptBarChart data={d?.departmentComparison ?? []} />
        </div>

        {/* Top performers mini list */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: C.surface, borderColor: C.border }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Award size={15} color="#D97706" />
            <h3
              className="font-semibold text-sm"
              style={{ color: C.textPrimary }}
            >
              Top Performers
            </h3>
          </div>
          <div className="space-y-2.5">
            {topData.slice(0, 5).map((emp, i) => (
              <div key={emp.employeeId} className="flex items-center gap-3">
                <span
                  className="w-5 text-xs font-bold text-center"
                  style={{ color: C.textMuted }}
                >
                  {i + 1}
                </span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{ background: `hsl(${i * 40},65%,52%)` }}
                >
                  {emp.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-semibold truncate"
                    style={{ color: C.textPrimary }}
                  >
                    {emp.name}
                  </p>
                  <p
                    className="text-[10px] truncate"
                    style={{ color: C.textMuted }}
                  >
                    {emp.department}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {emp.leadershipCandidate && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: "#FEF3C7", color: "#D97706" }}
                    >
                      🏅 Leader
                    </span>
                  )}
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#10B981" }}
                  >
                    {emp.finalScore}
                  </span>
                </div>
              </div>
            ))}
            {topData.length === 0 && (
              <p
                className="text-sm text-center py-6"
                style={{ color: C.textMuted }}
              >
                No scores calculated for this period yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Insights panel ── */}
      {(d?.underperformers?.length > 0 || d?.highPerformers?.length > 0) && (
        <div
          className="rounded-2xl p-5 border"
          style={{ background: C.surface, borderColor: C.border }}
        >
          <h3
            className="font-semibold text-sm mb-3"
            style={{ color: C.textPrimary }}
          >
            ⚡ Auto Insights
          </h3>
          <div className="space-y-2">
            {d?.highPerformers?.slice(0, 2).map((e) => (
              <div
                key={e.employeeId}
                className="flex items-center gap-2.5 p-3 rounded-xl"
                style={{ background: C.successLight }}
              >
                <CheckCircle2 size={14} color="#10B981" />
                <p className="text-xs" style={{ color: "#065F46" }}>
                  <strong>{e.name}</strong> is a top performer this period with
                  a score of {e.finalScore}
                  {e.leadershiCandidate && " — Leadership candidate 🏅"}
                </p>
              </div>
            ))}
            {d?.underperformers?.slice(0, 3).map((e) => (
              <div
                key={e.employeeId}
                className="flex items-center justify-between gap-2.5 p-3 rounded-xl"
                style={{ background: C.dangerLight }}
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle size={14} color={C.danger} />
                  <p className="text-xs" style={{ color: "#7F1D1D" }}>
                    <strong>{e.name}</strong> is underperforming with a score of{" "}
                    {e.finalScore} — {e.rating}
                  </p>
                </div>
                <button
                  onClick={() => setPipModal(e)}
                  className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: C.danger, color: "#fff" }}
                >
                  Start PIP
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Employee table ── */}
      <div
        className="rounded-2xl overflow-hidden border"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{
            borderBottom: `1px solid ${C.border}`,
            background: C.surfaceAlt,
          }}
        >
          <h3
            className="font-semibold text-sm"
            style={{ color: C.textPrimary }}
          >
            All Employees
          </h3>
          <input
            value={searchEmp}
            onChange={(e) => setSearchEmp(e.target.value)}
            placeholder="Search employee…"
            className="text-xs px-3 py-1.5 rounded-xl outline-none"
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              color: C.textPrimary,
              width: 180,
            }}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 680 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {[
                  "Employee",
                  "Department",
                  "Score",
                  "KPI",
                  "Attendance",
                  "Training",
                  "Rating",
                  "Trend",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide"
                    style={{ color: C.textMuted }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <p className="text-sm" style={{ color: C.textMuted }}>
                      {searchEmp
                        ? "No results match your search."
                        : "No performance data for this period. Calculate scores to populate this table."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, i) => (
                  <motion.tr
                    key={emp.employeeId}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="group transition-colors"
                    style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = C.surfaceAlt)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0"
                          style={{ background: `hsl(${i * 37},65%,52%)` }}
                        >
                          {emp.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p
                            className="text-xs font-semibold truncate"
                            style={{ color: C.textPrimary }}
                          >
                            {emp.name}
                          </p>
                          {emp.leadershiCandidate && (
                            <span
                              className="text-[9px] font-bold"
                              style={{ color: "#D97706" }}
                            >
                              🏅 Leadership
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="text-xs"
                        style={{ color: C.textSecondary }}
                      >
                        {emp.department ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 min-w-[100px]">
                      <ScoreBar score={emp.finalScore} />
                    </td>
                    <td
                      className="px-4 py-3.5 text-xs font-semibold"
                      style={{ color: C.textPrimary }}
                    >
                      {emp.kpiScore}
                    </td>
                    <td
                      className="px-4 py-3.5 text-xs font-semibold"
                      style={{ color: C.textPrimary }}
                    >
                      {emp.attendanceScore}
                    </td>
                    <td
                      className="px-4 py-3.5 text-xs font-semibold"
                      style={{ color: C.textPrimary }}
                    >
                      {emp.trainingScore}
                    </td>
                    <td className="px-4 py-3.5">
                      <RatingBadge rating={emp.rating} />
                    </td>
                    <td className="px-4 py-3.5">
                      <TrendArrow trend={emp.trend} />
                    </td>
                    <td className="px-4 py-3.5">
                      {emp.finalScore < 60 && (
                        <button
                          onClick={() => setPipModal(emp)}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: C.dangerLight, color: C.danger }}
                        >
                          Start PIP
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Active PIPs ── */}
      {pips.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden border"
          style={{ background: C.surface, borderColor: C.border }}
        >
          <div
            className="px-5 py-3.5"
            style={{
              borderBottom: `1px solid ${C.border}`,
              background: C.surfaceAlt,
            }}
          >
            <h3
              className="font-semibold text-sm"
              style={{ color: C.textPrimary }}
            >
              Active Improvement Plans ({pips.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {[
                    "Employee",
                    "Department",
                    "Score",
                    "Review Date",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide"
                      style={{ color: C.textMuted }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pips.map((pip, i) => (
                  <tr
                    key={pip.id}
                    style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = C.surfaceAlt)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td
                      className="px-4 py-3 font-medium text-sm"
                      style={{ color: C.textPrimary }}
                    >
                      {pip.name}
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{ color: C.textSecondary }}
                    >
                      {pip.department ?? "—"}
                    </td>
                    <td
                      className="px-4 py-3 text-xs font-bold"
                      style={{ color: C.danger }}
                    >
                      {pip.score}
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{ color: C.textSecondary }}
                    >
                      {new Date(pip.reviewDate).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                        style={{ background: "#FEF3C7", color: "#D97706" }}
                      >
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PIP modal ── */}
      <AnimatePresence>
        {pipModal && (
          <PIPModal
            employee={pipModal}
            onClose={() => setPipModal(null)}
            onCreated={() => {
              setPipModal(null);
              showToast("PIP created successfully");
              fetchAll();
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl z-50"
            style={{
              background: "#1E1B4B",
              color: "#fff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              minWidth: 280,
            }}
          >
            <CheckCircle2 size={14} color="#10B981" />
            <span className="text-sm font-medium">{toast.msg}</span>
            <button onClick={() => setToast(null)} className="ml-auto">
              <X size={12} color="rgba(255,255,255,0.5)" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
