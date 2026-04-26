// src/pages/employee/Payroll.jsx
// Employee payroll overview — salary breakdown, recent runs, YTD summary
// Connects to: GET /api/payroll/dashboard  +  GET /api/auth/me

import { useState, useEffect } from "react";
import { Motion, AnimatePresence } from "framer-motion";
import SideNavbar from "../components/sideNavbar";
import {
  DollarSign,
  TrendingUp,
  BarChart2,
  Menu,
  Search,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Calendar,
  Banknote,
  Shield,
  ArrowUpRight,
} from "lucide-react";
import { getDashboard } from "../../api/service/payrollApi";
import { authApi } from "../../api/service/authApi";
import C from "../../styles/colors";

/* ─── Helpers ─── */
const fmt = (n) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n ?? 0);

const fmtShort = (n) => {
  if (!n) return "₦0";
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n}`;
};

const STATUS_CFG = {
  draft: { bg: "#F1F5F9", color: "#64748B", label: "Draft" },
  processing: { bg: "#FEF3C7", color: "#F59E0B", label: "Processing" },
  approved: { bg: "#DBEAFE", color: "#2563EB", label: "Approved" },
  paid: { bg: "#D1FAE5", color: "#10B981", label: "Paid" },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  }),
};

function StatCard({ icon: Icon, label, value, sub, color, light, index }) {
  return (
    <Motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: light }}
        >
          <Icon size={18} color={color} />
        </div>
      </div>
      <div>
        <p className="text-xl font-bold" style={{ color: C.textPrimary }}>
          {value}
        </p>
        <p
          className="text-xs font-semibold mt-0.5"
          style={{ color: C.textSecondary }}
        >
          {label}
        </p>
        {sub && (
          <p className="text-[11px] mt-1" style={{ color: C.textMuted }}>
            {sub}
          </p>
        )}
      </div>
    </Motion.div>
  );
}

export default function Payroll() {
  const [dashboard, setDashboard] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [dash, me] = await Promise.all([getDashboard(), authApi.getMe()]);
        setDashboard(dash);
        setEmployee(me);
      } catch {
        setError("Failed to load payroll data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const latest = dashboard?.latestRun;
  const history = dashboard?.recentRuns ?? [];
  const deptBreakdown = dashboard?.departmentBreakdown ?? [];

  const initials = (me) => {
    if (!me) return "?";
    return `${me.firstName?.[0] ?? ""}${me.lastName?.[0] ?? ""}`.toUpperCase();
  };

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: C.bg }}
      >
        <RefreshCw
          size={26}
          className="animate-spin"
          style={{ color: C.primary }}
        />
      </div>
    );

  if (error)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: C.bg }}
      >
        <div className="text-center space-y-3">
          <AlertCircle
            size={32}
            style={{ color: C.danger, margin: "0 auto" }}
          />
          <p className="text-sm font-medium" style={{ color: C.danger }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm underline"
            style={{ color: C.primary }}
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-screen"
      style={{ background: C.bg, fontFamily: "'DM Sans','Sora',sans-serif" }}
    >
      <div className="flex h-screen overflow-hidden">
        <SideNavbar sidebarOpen={sidebarOpen} employee={employee} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
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
              className="p-2 rounded-xl"
              style={{ background: C.surface }}
            >
              <Menu size={16} color={C.textSecondary} />
            </Motion.button>

            <div className="ml-auto flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg,#4F46E5,#06B6D4)",
                }}
              >
                {initials(employee)}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
            {/* Hero */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-8 text-white"
              style={{
                background:
                  "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/15">
                  <DollarSign size={28} />
                </div>
                <div>
                  <h1
                    className="text-3xl font-bold"
                    style={{ fontFamily: "Sora,sans-serif" }}
                  >
                    Payroll Overview
                  </h1>
                  <p className="text-indigo-200">
                    {employee
                      ? `${employee.firstName} ${employee.lastName} · ${employee.company?.name ?? ""}`
                      : "Loading..."}
                  </p>
                </div>
              </div>

              {/* Latest run stats */}
              {latest && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Period", value: latest.period },
                    {
                      label: "Total Gross",
                      value: fmtShort(latest.totalGross),
                    },
                    { label: "Total Net", value: fmtShort(latest.totalNet) },
                    {
                      label: "Status",
                      value: STATUS_CFG[latest.status]?.label ?? latest.status,
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl px-4 py-3 bg-white/10 backdrop-blur-sm"
                    >
                      <p className="text-xl font-bold">{s.value}</p>
                      <p className="text-xs text-indigo-200">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </Motion.div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                index={0}
                icon={DollarSign}
                label="Latest Net Pay"
                value={latest ? fmtShort(latest.totalNet) : "—"}
                sub={latest?.period}
                color={C.primary}
                light={C.primaryLight}
              />
              <StatCard
                index={1}
                icon={BarChart2}
                label="Total Deductions"
                value={latest ? fmtShort(latest.totalDeductions) : "—"}
                sub="This pay period"
                color={C.danger}
                light="#FEE2E2"
              />
              <StatCard
                index={2}
                icon={TrendingUp}
                label="Employees on Run"
                value={latest?.employeeCount ?? "—"}
                sub="Active employees"
                color={C.success}
                light={C.successLight}
              />
              <StatCard
                index={3}
                icon={Shield}
                label="Run Status"
                value={STATUS_CFG[latest?.status]?.label ?? "—"}
                sub={
                  latest
                    ? `Updated ${new Date(latest.createdAt).toLocaleDateString("en-GB")}`
                    : ""
                }
                color="#8B5CF6"
                light="#EDE9FE"
              />
            </div>

            {/* Recent runs */}
            {history.length > 0 && (
              <Motion.div
                custom={4}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="rounded-2xl overflow-hidden"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  className="px-5 py-4 flex items-center justify-between"
                  style={{ borderBottom: `1px solid ${C.border}` }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center"
                      style={{ background: C.primaryLight }}
                    >
                      <Calendar size={14} color={C.primary} />
                    </div>
                    <span
                      className="font-bold text-sm"
                      style={{ color: C.textPrimary }}
                    >
                      Recent Payroll Runs
                    </span>
                  </div>
                </div>
                <div className="divide-y" style={{ borderColor: C.border }}>
                  {history.map((run, i) => {
                    const cfg = STATUS_CFG[run.status] ?? STATUS_CFG.draft;
                    return (
                      <Motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="px-5 py-3.5 flex items-center gap-4"
                      >
                        <div className="flex-1">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: C.textPrimary }}
                          >
                            {run.period}
                          </p>
                          <p className="text-xs" style={{ color: C.textMuted }}>
                            Gross: {fmtShort(run.gross)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className="text-sm font-bold"
                            style={{ color: C.primary }}
                          >
                            {fmtShort(run.net)}
                          </p>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                        </div>
                      </Motion.div>
                    );
                  })}
                </div>
              </Motion.div>
            )}

            {/* Department breakdown */}
            {deptBreakdown.length > 0 && (
              <Motion.div
                custom={5}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="rounded-2xl overflow-hidden"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  className="px-5 py-4"
                  style={{ borderBottom: `1px solid ${C.border}` }}
                >
                  <span
                    className="font-bold text-sm"
                    style={{ color: C.textPrimary }}
                  >
                    Department Breakdown
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: C.surfaceAlt }}>
                        {["Department", "Employees", "Gross", "Net"].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-5 py-3 text-left text-xs font-bold uppercase"
                              style={{ color: C.textMuted }}
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {deptBreakdown.map((d, i) => (
                        <tr
                          key={i}
                          className="border-b"
                          style={{ borderColor: C.border }}
                        >
                          <td
                            className="px-5 py-3 font-medium text-sm"
                            style={{ color: C.textPrimary }}
                          >
                            {d.department}
                          </td>
                          <td
                            className="px-5 py-3 text-sm"
                            style={{ color: C.textSecondary }}
                          >
                            {d.employees}
                          </td>
                          <td
                            className="px-5 py-3 text-sm font-semibold"
                            style={{ color: C.textPrimary }}
                          >
                            {fmtShort(d.gross)}
                          </td>
                          <td
                            className="px-5 py-3 text-sm font-semibold"
                            style={{ color: C.success }}
                          >
                            {fmtShort(d.net)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Motion.div>
            )}

            {!latest && (
              <div className="py-16 flex flex-col items-center gap-3">
                <Banknote size={36} style={{ color: C.textMuted }} />
                <p className="text-sm" style={{ color: C.textMuted }}>
                  No payroll runs yet for your company.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
