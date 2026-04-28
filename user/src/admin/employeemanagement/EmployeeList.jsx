// src/admin/employeemanagement/EmployeeList.jsx
// Route: /admin/employees
// Fixed: field names now match the backend response exactly

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
// import AdminSideNavbar from "../AdminSideNavbar";
import { getEmployees } from "../../api/service/employeeApi";
import { C } from "./sharedData";
import {
  Users,
  UserPlus,
  Search,
  Bell,
  ChevronRight,
  ChevronLeft,
  Menu,
  Eye,
  Edit3,
  Building2,
  MapPin,
  RefreshCw,
  AlertCircle,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  X,
  Download,
} from "lucide-react";

/* ─── Helpers ─────────────────────────────────────────────── */
function stringToColor(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360},65%,52%)`;
}

function fullName(emp) {
  return [emp.first_name, emp.middle_name, emp.last_name]
    .filter(Boolean)
    .join(" ");
}

function initials(emp) {
  return (
    [emp.first_name?.[0], emp.last_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "??"
  );
}

/* ─── Sub-components ──────────────────────────────────────── */
function Avatar({ emp, size = 34 }) {
  const name = fullName(emp);
  const color = stringToColor(name);
  if (emp.avatar) {
    return (
      <img
        src={emp.avatar}
        alt={name}
        className="rounded-xl object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center text-white font-bold shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        background: `linear-gradient(135deg, ${color}, ${C.primary})`,
        fontSize: size * 0.33,
      }}
    >
      {initials(emp)}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    active: { label: "Active", color: C.success, bg: C.successLight },
    on_leave: { label: "On Leave", color: C.warning, bg: C.warningLight },
    suspended: { label: "Suspended", color: C.danger, bg: C.dangerLight },
    terminated: { label: "Terminated", color: C.textMuted, bg: C.surfaceAlt },
    resigned: { label: "Resigned", color: C.textMuted, bg: C.surfaceAlt },
  };
  const s = map[status] ?? {
    label: status ?? "—",
    color: C.textMuted,
    bg: C.surfaceAlt,
  };
  return (
    <span
      className="px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full inline-block mr-1"
        style={{ background: s.color }}
      />
      {s.label}
    </span>
  );
}

function TypeBadge({ type }) {
  const map = {
    full_time: { label: "Full-Time", color: C.primary, bg: C.primaryLight },
    part_time: { label: "Part-Time", color: C.accent, bg: C.accentLight },
    contract: { label: "Contract", color: C.warning, bg: C.warningLight },
    intern: { label: "Intern", color: C.purple, bg: C.purpleLight },
  };
  const t = map[type] ?? {
    label: type ?? "—",
    color: C.textMuted,
    bg: C.surfaceAlt,
  };
  return (
    <span
      className="px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap"
      style={{ background: t.bg, color: t.color }}
    >
      {t.label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
      {[44, 130, 110, 120, 80, 80, 60].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div
            className="h-4 rounded-lg animate-pulse"
            style={{ width: w, background: C.bgMid }}
          />
        </td>
      ))}
    </tr>
  );
}

function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return <ArrowUpDown size={12} color={C.textMuted} />;
  return sortDir === "asc" ? (
    <ArrowUp size={12} color={C.primary} />
  ) : (
    <ArrowDown size={12} color={C.primary} />
  );
}

const SORT_COLS = [
  { key: "created_at", label: "Employee" },
  { key: "last_name", label: "Name" },
  { key: "created_at", label: "Department" },
  { key: "job_role_name", label: "Role" },
  { key: "employment_type", label: "Type" },
  { key: "employment_status", label: "Status" },
  { key: null, label: "Actions" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ═══════════════════════════════════════════════════════════ */
export default function EmployeeList({ ADMIN }) {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortCol, setSortCol] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    department: "",
  });

  // Debounce search — resets to page 1
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getEmployees({
        page,
        limit: pageSize,
        sort: sortCol,
        order: sortDir,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.department ? { department: filters.department } : {}),
      });
      // API returns { data: [...], meta: { total, page, limit, totalPages } }
      setEmployees(result.data ?? []);
      setMeta(
        result.meta ?? { total: 0, page: 1, limit: pageSize, totalPages: 1 },
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to load employees.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortCol, sortDir, debouncedSearch, filters]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const toggleSort = (col) => {
    if (!col) return;
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  /* ─── Render ──────────────────────────────────────────── */
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: C.bg,
        fontFamily: "'DM Sans','Sora',sans-serif",
        color: C.textPrimary,
      }}
    >
      {/* Sidebar */}
      {/* <AdminSideNavbar
        ADMIN={ADMIN}
        sidebarOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        pendingApprovals={0}
      /> */}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="shrink-0 h-[60px] flex items-center px-5 gap-3 z-10"
          style={{
            background: C.surface,
            borderBottom: `1px solid ${C.border}`,
            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
          }}
        >
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="p-2 rounded-xl"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
            }}
          >
            <Menu size={16} color={C.textSecondary} />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              color={C.textMuted}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, email…"
              className="w-full pl-8 pr-4 py-2 text-sm rounded-xl outline-none"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${search ? C.primary + "66" : C.border}`,
                color: C.textPrimary,
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X size={13} color={C.textMuted} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setFilterOpen((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold relative"
            style={{
              background: filterOpen ? C.primaryLight : C.surfaceAlt,
              color: filterOpen ? C.primary : C.textSecondary,
              border: `1px solid ${filterOpen ? C.primary + "44" : C.border}`,
            }}
          >
            <SlidersHorizontal size={13} />
            Filters
            {activeFilterCount > 0 && (
              <span
                className="w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center absolute -top-1 -right-1"
                style={{ background: C.primary }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={fetchEmployees}
              className="p-2 rounded-xl"
              style={{
                background: C.surfaceAlt,
                border: `1px solid ${C.border}`,
              }}
              title="Refresh"
            >
              <RefreshCw size={14} color={C.textMuted} />
            </button>
            <button
              className="p-2 rounded-xl"
              style={{
                background: C.surfaceAlt,
                border: `1px solid ${C.border}`,
              }}
              title="Export"
            >
              <Download size={14} color={C.textMuted} />
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/admin/employees/new")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white"
              style={{
                background: C.primary,
                boxShadow: `0 4px 12px ${C.primary}44`,
              }}
            >
              <UserPlus size={13} />
              Add Employee
            </motion.button>
            <button
              className="relative p-2 rounded-xl"
              style={{
                background: C.surfaceAlt,
                border: `1px solid ${C.border}`,
              }}
            >
              <Bell size={15} color={C.textSecondary} />
            </button>
          </div>
        </header>

        {/* Filter bar */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="shrink-0 overflow-hidden"
              style={{
                background: C.surface,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div className="flex items-center gap-3 px-5 py-3 flex-wrap">
                {[
                  {
                    key: "status",
                    label: "Status",
                    options: [
                      ["", "All Status"],
                      ["active", "Active"],
                      ["on_leave", "On Leave"],
                      ["suspended", "Suspended"],
                      ["terminated", "Terminated"],
                    ],
                  },
                  {
                    key: "type",
                    label: "Type",
                    options: [
                      ["", "All Types"],
                      ["full_time", "Full-Time"],
                      ["part_time", "Part-Time"],
                      ["contract", "Contract"],
                      ["intern", "Intern"],
                    ],
                  },
                ].map((f) => (
                  <div key={f.key} className="flex items-center gap-2">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: C.textMuted }}
                    >
                      {f.label}:
                    </span>
                    <select
                      value={filters[f.key]}
                      onChange={(e) => {
                        setFilters((p) => ({ ...p, [f.key]: e.target.value }));
                        setPage(1);
                      }}
                      className="text-xs px-2.5 py-1.5 rounded-lg outline-none"
                      style={{
                        background: C.surfaceAlt,
                        border: `1px solid ${C.border}`,
                        color: C.textPrimary,
                      }}
                    >
                      {f.options.map(([val, label]) => (
                        <option key={val} value={val}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      setFilters({ status: "", type: "", department: "" });
                      setPage(1);
                    }}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                    style={{ background: C.dangerLight, color: C.danger }}
                  >
                    Clear all
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4">
          {/* Page header */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="flex items-center justify-between flex-wrap gap-2"
          >
            <div>
              <h1
                className="text-xl font-bold"
                style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
              >
                Employees
              </h1>
              <p className="text-sm mt-0.5" style={{ color: C.textSecondary }}>
                {loading
                  ? "Loading…"
                  : `${meta.total} total employee${meta.total !== 1 ? "s" : ""}`}
              </p>
            </div>
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: C.textMuted }}
            >
              <span>Admin</span>
              <ChevronRight size={12} />
              <span style={{ color: C.textPrimary }}>Employees</span>
            </div>
          </motion.div>

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{
                  background: C.dangerLight,
                  border: `1px solid ${C.danger}33`,
                }}
              >
                <AlertCircle size={16} color={C.danger} />
                <p className="text-sm font-medium" style={{ color: C.danger }}>
                  {error}
                </p>
                <button
                  onClick={fetchEmployees}
                  className="ml-auto text-xs font-semibold flex items-center gap-1"
                  style={{ color: C.danger }}
                >
                  <RefreshCw size={12} />
                  Retry
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table card */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="rounded-2xl overflow-hidden"
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: 720 }}>
                <thead>
                  <tr
                    style={{
                      background: C.surfaceAlt,
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    {[
                      { key: "created_at", label: "Employee" },
                      { key: "department_name", label: "Department" },
                      { key: "job_role_name", label: "Role" },
                      { key: "employment_type", label: "Type" },
                      { key: "employment_status", label: "Status" },
                      { key: "location", label: "Location" },
                      { key: null, label: "Actions" },
                    ].map((col) => (
                      <th
                        key={col.label}
                        onClick={() => toggleSort(col.key)}
                        className={`px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide select-none ${col.key ? "cursor-pointer" : ""}`}
                        style={{
                          color: sortCol === col.key ? C.primary : C.textMuted,
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          {col.label}
                          {col.key && (
                            <SortIcon
                              col={col.key}
                              sortCol={sortCol}
                              sortDir={sortDir}
                            />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: pageSize }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))
                  ) : employees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Users size={36} color={C.textMuted} />
                          <p
                            className="text-sm font-semibold"
                            style={{ color: C.textPrimary }}
                          >
                            No employees found
                          </p>
                          <p className="text-xs" style={{ color: C.textMuted }}>
                            {debouncedSearch
                              ? "Try a different search term"
                              : "Add your first employee to get started"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp, i) => (
                      <motion.tr
                        key={emp.id}
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
                        {/* Employee column */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar emp={emp} size={34} />
                            <div className="min-w-0">
                              <p
                                className="text-sm font-semibold truncate"
                                style={{ color: C.textPrimary }}
                              >
                                {/* ✅ Correct field names from backend */}
                                {emp.first_name} {emp.last_name}
                              </p>
                              <p
                                className="text-[11px] font-mono"
                                style={{ color: C.textMuted }}
                              >
                                {emp.employee_code ?? "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Department — backend returns department_name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Building2 size={12} color={C.textMuted} />
                            <span
                              className="text-xs"
                              style={{ color: C.textSecondary }}
                            >
                              {emp.department_name ?? "—"}
                            </span>
                          </div>
                        </td>

                        {/* Role — backend returns job_role_name */}
                        <td className="px-4 py-3.5">
                          <span
                            className="text-xs"
                            style={{ color: C.textPrimary }}
                          >
                            {emp.job_role_name ?? "—"}
                          </span>
                        </td>

                        {/* Type — backend returns employment_type */}
                        <td className="px-4 py-3.5">
                          <TypeBadge type={emp.employment_type} />
                        </td>

                        {/* Status — backend returns employment_status */}
                        <td className="px-4 py-3.5">
                          <StatusBadge status={emp.employment_status} />
                        </td>

                        {/* Location */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={11} color={C.textMuted} />
                            <span
                              className="text-xs"
                              style={{ color: C.textSecondary }}
                            >
                              {emp.location ?? "—"}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                navigate(`/admin/employees/${emp.id}`)
                              }
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{ background: C.primaryLight }}
                              title="View profile"
                            >
                              <Eye size={12} color={C.primary} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                navigate(`/admin/employees/${emp.id}/edit`)
                              }
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{
                                background: C.surfaceAlt,
                                border: `1px solid ${C.border}`,
                              }}
                              title="Edit"
                            >
                              <Edit3 size={12} color={C.textSecondary} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && meta.totalPages > 1 && (
              <div
                className="flex items-center justify-between px-5 py-3.5"
                style={{ borderTop: `1px solid ${C.border}` }}
              >
                <p className="text-xs" style={{ color: C.textMuted }}>
                  Showing{" "}
                  <strong style={{ color: C.textPrimary }}>
                    {(meta.page - 1) * meta.limit + 1}–
                    {Math.min(meta.page * meta.limit, meta.total)}
                  </strong>{" "}
                  of{" "}
                  <strong style={{ color: C.textPrimary }}>{meta.total}</strong>
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={meta.page === 1}
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{
                      background: C.surfaceAlt,
                      border: `1px solid ${C.border}`,
                      opacity: meta.page === 1 ? 0.4 : 1,
                    }}
                  >
                    <ChevronLeft size={13} color={C.textSecondary} />
                  </button>
                  {Array.from(
                    { length: Math.min(meta.totalPages, 5) },
                    (_, i) => {
                      const p =
                        meta.totalPages <= 5
                          ? i + 1
                          : meta.page <= 3
                            ? i + 1
                            : meta.page >= meta.totalPages - 2
                              ? meta.totalPages - 4 + i
                              : meta.page - 2 + i;
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className="w-8 h-8 rounded-xl text-xs font-bold"
                          style={{
                            background: p === meta.page ? C.primary : C.surface,
                            color: p === meta.page ? "#fff" : C.textSecondary,
                            border: `1px solid ${p === meta.page ? C.primary : C.border}`,
                            boxShadow:
                              p === meta.page
                                ? `0 2px 8px ${C.primary}44`
                                : "none",
                          }}
                        >
                          {p}
                        </button>
                      );
                    },
                  )}
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(meta.totalPages, p + 1))
                    }
                    disabled={meta.page === meta.totalPages}
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{
                      background: C.surfaceAlt,
                      border: `1px solid ${C.border}`,
                      opacity: meta.page === meta.totalPages ? 0.4 : 1,
                    }}
                  >
                    <ChevronRight size={13} color={C.textSecondary} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
