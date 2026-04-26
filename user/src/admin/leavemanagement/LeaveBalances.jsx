// src/admin/leavemanagement/LeaveBalances.jsx

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Users,
  Calendar,
  TrendingDown,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import C from "../../styles/colors";
import { leaveApi } from "../../api/service/leaveApi";

const DEPT_COLORS = [
  "#6366F1",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#EF4444",
  "#F97316",
];
const deptColor = (name, list) =>
  DEPT_COLORS[list.indexOf(name) % DEPT_COLORS.length] ?? C.primary;

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  }),
};

function Avatar({ initials, color = C.primary, size = 32 }) {
  return (
    <div
      className="rounded-xl flex items-center justify-center text-white font-bold shrink-0"
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
function MiniBar({ value, total, color }) {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <div
      className="h-1.5 rounded-full overflow-hidden"
      style={{ background: C.surfaceAlt, width: 60 }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  );
}
function BalanceCell({ used, entitled, color }) {
  const remaining = entitled - used;
  const lowWarning = entitled > 0 && remaining / entitled < 0.2;
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-bold"
          style={{ color: lowWarning ? C.danger : C.textPrimary }}
        >
          {remaining}
        </span>
        <span className="text-[10px]" style={{ color: C.textMuted }}>
          / {entitled}
        </span>
        {lowWarning && <AlertTriangle size={10} color={C.danger} />}
      </div>
      <MiniBar
        value={used}
        total={entitled}
        color={lowWarning ? C.danger : color}
      />
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────
// FIX: accepts searchQuery from AdminLeavePage's top search bar
//      and onTabChange to allow cross-tab navigation
export default function LeaveBalances({ searchQuery = "", onTabChange }) {
  const navigate = useNavigate(); // kept — used only for "View Profile" link

  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localSearch, setLocalSearch] = useState(""); // local search input
  const [deptFilter, setDeptFilter] = useState("");
  const [expandedEmp, setExpandedEmp] = useState(null);

  // FIX: sync the parent's search bar into this tab's local search state
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    leaveApi
      .getAllBalances()
      .then((res) => setBalances(res.data ?? []))
      .catch(() => setError("Failed to load balances."))
      .finally(() => setLoading(false));
  }, []);

  const employeeMap = useMemo(() => {
    const map = {};
    balances.forEach((b) => {
      if (!map[b.employee_id]) {
        map[b.employee_id] = {
          id: b.employee_id,
          name: b.employee_name,
          code: b.employee_code,
          dept: b.department_name,
          initials:
            b.employee_name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) ?? "??",
          balances: [],
        };
      }
      map[b.employee_id].balances.push(b);
    });
    return map;
  }, [balances]);

  const employees = Object.values(employeeMap);
  const departments = [
    ...new Set(employees.map((e) => e.dept).filter(Boolean)),
  ].sort();

  // Merge parent search + local search (whichever is set)
  const activeSearch = localSearch;

  const filtered = useMemo(
    () =>
      employees.filter((e) => {
        const q = activeSearch.toLowerCase();
        return (
          (!q ||
            e.name?.toLowerCase().includes(q) ||
            e.code?.toLowerCase().includes(q)) &&
          (!deptFilter || e.dept === deptFilter)
        );
      }),
    [employees, activeSearch, deptFilter],
  );

  const annualBalances = balances.filter(
    (b) => b.leave_type === "Annual Leave",
  );
  const totalUsedAnnual = annualBalances.reduce(
    (a, b) => a + (b.used_days ?? 0),
    0,
  );
  const totalAvailAnnual = annualBalances.reduce(
    (a, b) => a + (b.remaining_days ?? 0),
    0,
  );
  const lowBalanceCount = annualBalances.filter(
    (b) => b.entitled_days > 0 && b.remaining_days / b.entitled_days < 0.2,
  ).length;

  const leaveTypeColors = {
    "Annual Leave": C.primary,
    "Sick Leave": C.danger,
    "Study Leave": C.success,
    "Maternity Leave": "#8B5CF6",
    "Paternity Leave": C.accent,
  };

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

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Employees",
            value: employees.length,
            color: C.primary,
            bg: C.primaryLight,
            icon: Users,
          },
          {
            label: "Annual Days Used",
            value: totalUsedAnnual,
            color: C.warning,
            bg: C.warningLight,
            icon: TrendingDown,
          },
          {
            label: "Annual Days Available",
            value: totalAvailAnnual,
            color: C.success,
            bg: C.successLight,
            icon: Calendar,
          },
          {
            label: "Low Balance Alerts",
            value: lowBalanceCount,
            color: C.danger,
            bg: C.dangerLight,
            icon: AlertTriangle,
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
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
              <p className="text-[11px]" style={{ color: C.textSecondary }}>
                {s.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search + Department filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            color={C.textMuted}
          />
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search employee, code…"
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl outline-none"
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              color: C.textPrimary,
            }}
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="text-xs px-3 py-2.5 rounded-xl outline-none"
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            color: C.textPrimary,
          }}
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}
        >
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: C.surfaceAlt,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  {[
                    "Employee",
                    "Department",
                    "Annual Leave",
                    "Sick Leave",
                    "Other",
                    "",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left">
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: C.textSecondary }}
                      >
                        {h}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm"
                      style={{ color: C.textMuted }}
                    >
                      {activeSearch
                        ? "No employees match your search"
                        : "No employee balances found"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((emp, i) => {
                    const dc = deptColor(emp.dept, departments);
                    const isExpanded = expandedEmp === emp.id;
                    const annual = emp.balances.find(
                      (b) => b.leave_type === "Annual Leave",
                    );
                    const sick = emp.balances.find(
                      (b) => b.leave_type === "Sick Leave",
                    );
                    const other = emp.balances.find(
                      (b) =>
                        b.leave_type !== "Annual Leave" &&
                        b.leave_type !== "Sick Leave",
                    );
                    return (
                      <AnimatePresence key={emp.id}>
                        <>
                          <motion.tr
                            custom={i}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            whileHover={{ background: C.surfaceAlt }}
                            className="cursor-pointer transition-colors"
                            style={{ borderBottom: `1px solid ${C.border}` }}
                            onClick={() =>
                              setExpandedEmp(isExpanded ? null : emp.id)
                            }
                          >
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <Avatar
                                  initials={emp.initials}
                                  color={dc}
                                  size={30}
                                />
                                <div>
                                  <p
                                    className="text-xs font-semibold"
                                    style={{ color: C.textPrimary }}
                                  >
                                    {emp.name}
                                  </p>
                                  <p
                                    className="text-[10px] font-mono"
                                    style={{ color: C.textMuted }}
                                  >
                                    {emp.code}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: dc }}
                                />
                                <span
                                  className="text-xs"
                                  style={{ color: C.textSecondary }}
                                >
                                  {emp.dept ?? "—"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              {annual ? (
                                <BalanceCell
                                  used={annual.used_days ?? 0}
                                  entitled={annual.entitled_days ?? 0}
                                  color={C.primary}
                                />
                              ) : (
                                <span
                                  className="text-[10px]"
                                  style={{ color: C.textMuted }}
                                >
                                  N/A
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              {sick ? (
                                <BalanceCell
                                  used={sick.used_days ?? 0}
                                  entitled={sick.entitled_days ?? 0}
                                  color={C.danger}
                                />
                              ) : (
                                <span
                                  className="text-[10px]"
                                  style={{ color: C.textMuted }}
                                >
                                  N/A
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              {other ? (
                                <BalanceCell
                                  used={other.used_days ?? 0}
                                  entitled={other.entitled_days ?? 0}
                                  color={
                                    leaveTypeColors[other.leave_type] ??
                                    C.accent
                                  }
                                />
                              ) : (
                                <span
                                  className="text-[10px]"
                                  style={{ color: C.textMuted }}
                                >
                                  N/A
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <ChevronDown
                                size={14}
                                color={C.textMuted}
                                style={{
                                  transform: isExpanded
                                    ? "rotate(180deg)"
                                    : "none",
                                  transition: "transform 0.2s",
                                }}
                              />
                            </td>
                          </motion.tr>

                          {/* Expanded row */}
                          {isExpanded && (
                            <motion.tr
                              key={`${emp.id}-exp`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <td
                                colSpan={6}
                                className="px-6 py-4"
                                style={{
                                  background: C.surfaceAlt,
                                  borderBottom: `1px solid ${C.border}`,
                                }}
                              >
                                <div className="flex flex-wrap gap-4">
                                  {emp.balances.map((b) => {
                                    const color =
                                      leaveTypeColors[b.leave_type] ??
                                      C.textMuted;
                                    const pct =
                                      b.entitled_days > 0
                                        ? Math.round(
                                            (b.remaining_days /
                                              b.entitled_days) *
                                              100,
                                          )
                                        : 0;
                                    return (
                                      <div
                                        key={b.id}
                                        className="flex items-center gap-3 rounded-xl p-3"
                                        style={{
                                          background: C.surface,
                                          border: `1px solid ${C.border}`,
                                          minWidth: 180,
                                        }}
                                      >
                                        <div
                                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                                          style={{ background: `${color}18` }}
                                        >
                                          <Calendar size={14} color={color} />
                                        </div>
                                        <div>
                                          <p
                                            className="text-[10px] font-semibold"
                                            style={{ color: C.textSecondary }}
                                          >
                                            {b.leave_type}
                                          </p>
                                          <p
                                            className="text-sm font-black"
                                            style={{ color }}
                                          >
                                            {b.remaining_days}{" "}
                                            <span
                                              className="text-xs font-normal"
                                              style={{ color: C.textMuted }}
                                            >
                                              / {b.entitled_days} days
                                            </span>
                                          </p>
                                          <div
                                            className="h-1 w-20 rounded-full overflow-hidden mt-1"
                                            style={{ background: C.border }}
                                          >
                                            <div
                                              className="h-full rounded-full"
                                              style={{
                                                width: `${100 - pct}%`,
                                                background: color,
                                              }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {/* View Profile — uses navigate, does NOT affect tab state */}
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() =>
                                      navigate(`/admin/employees/${emp.id}`)
                                    }
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold self-center"
                                    style={{
                                      background: C.primaryLight,
                                      color: C.primary,
                                    }}
                                  >
                                    View Profile <ChevronRight size={12} />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </>
                      </AnimatePresence>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
