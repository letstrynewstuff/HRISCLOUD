// src/admin/leavemanagement/LeaveRequests.jsx
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  FileText,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import C from "../../styles/colors";
import { leaveApi } from "../../api/service/leaveApi";

// ── Leave type UI ──────────────────────────────────────────────
const LEAVE_TYPE_UI = {
  "Annual Leave": { color: "#4F46E5", light: "#EEF2FF" },
  "Sick Leave": { color: "#EF4444", light: "#FEE2E2" },
  "Maternity Leave": { color: "#EC4899", light: "#FDF2F8" },
  "Paternity Leave": { color: "#06B6D4", light: "#ECFEFF" },
  Compassionate: { color: "#8B5CF6", light: "#EDE9FE" },
  "Study Leave": { color: "#10B981", light: "#D1FAE5" },
  "Unpaid Leave": { color: "#F59E0B", light: "#FEF3C7" },
};
const getTypeColor = (t) => LEAVE_TYPE_UI[t]?.color ?? C.primary;
const getTypeLight = (t) => LEAVE_TYPE_UI[t]?.light ?? C.primaryLight;
const getInitials = (n) =>
  n
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "??";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

function Card({ children, style = {} }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
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
    approved: { bg: C.successLight, color: C.success, icon: CheckCircle2 },
    pending: { bg: C.warningLight, color: C.warning, icon: Clock },
    rejected: { bg: C.dangerLight, color: C.danger, icon: XCircle },
  }[status?.toLowerCase()] || {
    bg: C.surfaceAlt,
    color: C.textMuted,
    icon: Clock,
  };
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon size={10} />
      {status}
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

// ── Approve / Reject modal ─────────────────────────────────────
function ActionModal({ request, action, onConfirm, onClose, loading }) {
  const [comment, setComment] = useState("");
  const isApprove = action === "approve";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md rounded-2xl p-6"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: isApprove ? C.successLight : C.dangerLight }}
          >
            {isApprove ? (
              <CheckCircle2 size={20} color={C.success} />
            ) : (
              <XCircle size={20} color={C.danger} />
            )}
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: C.textPrimary }}>
              {isApprove ? "Approve Leave Request" : "Reject Leave Request"}
            </h3>
            <p className="text-[11px]" style={{ color: C.textMuted }}>
              {request?.employee_name} · {request?.leave_type}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto w-7 h-7 rounded-xl flex items-center justify-center"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
            }}
          >
            <X size={13} color={C.textSecondary} />
          </button>
        </div>
        <div
          className="rounded-xl p-3 mb-4"
          style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}
        >
          <div className="flex justify-between text-[11px] mb-1">
            <span style={{ color: C.textMuted }}>Duration</span>
            <span className="font-semibold" style={{ color: C.textPrimary }}>
              {request?.days} days
            </span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span style={{ color: C.textMuted }}>Dates</span>
            <span className="font-semibold" style={{ color: C.textPrimary }}>
              {request?.start_date} → {request?.end_date}
            </span>
          </div>
        </div>
        <label
          className="block text-xs font-semibold mb-1.5"
          style={{ color: C.textSecondary }}
        >
          {isApprove ? "Comment (optional)" : "Rejection Reason (required)"}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            isApprove ? "Add a note..." : "State reason for rejection..."
          }
          className="w-full text-xs p-3 rounded-xl resize-none outline-none"
          style={{
            background: C.surfaceAlt,
            border: `1px solid ${C.border}`,
            color: C.textPrimary,
            minHeight: 80,
          }}
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
              color: C.textSecondary,
            }}
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onConfirm(comment)}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2"
            style={{
              background: isApprove ? C.success : C.danger,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading && <Loader2 size={12} className="animate-spin" />}
            {isApprove ? "Approve" : "Reject"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main export ────────────────────────────────────────────────
// FIX: accepts searchQuery from AdminLeavePage's top search bar
//      and onTabChange for cross-tab navigation
export default function LeaveRequests({ searchQuery = "", onTabChange }) {
  const [requests, setRequests] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // FIX: local search starts from parent searchQuery, stays local after that
  const [search, setSearch] = useState(searchQuery);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    leaveType: "",
    dept: "",
    dateFrom: "",
    dateTo: "",
  });
  const [sort, setSort] = useState({ col: "created_at", dir: "desc" });
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const pageSize = 10;

  // FIX: Sync parent's search bar into local search state whenever it changes
  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const load = async () => {
      try {
        const [reqRes, polRes] = await Promise.all([
          leaveApi.getAllRequests({ limit: 100 }),
          leaveApi.getPolicies(),
        ]);
        setRequests(reqRes.data ?? []);
        setPolicies(polRes.data ?? []);
      } catch {
        setError("Failed to load requests.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const departments = [
    ...new Set(requests.map((r) => r.department_name).filter(Boolean)),
  ];
  const leaveTypes = policies.map((p) => p.leave_type).filter(Boolean);

  const toggleSort = (col) =>
    setSort((s) =>
      s.col === col
        ? { col, dir: s.dir === "asc" ? "desc" : "asc" }
        : { col, dir: "asc" },
    );

  const SortIcon = ({ col }) => {
    if (sort.col !== col) return <ArrowUpDown size={11} color={C.textMuted} />;
    return sort.dir === "asc" ? (
      <ArrowUp size={11} color={C.primary} />
    ) : (
      <ArrowDown size={11} color={C.primary} />
    );
  };

  const filtered = useMemo(() => {
    let list = [...requests];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.employee_name?.toLowerCase().includes(q) ||
          r.id?.toLowerCase().includes(q) ||
          r.leave_type?.toLowerCase().includes(q) ||
          r.department_name?.toLowerCase().includes(q),
      );
    }
    if (filters.status)
      list = list.filter(
        (r) => r.status?.toLowerCase() === filters.status.toLowerCase(),
      );
    if (filters.leaveType)
      list = list.filter((r) => r.leave_type === filters.leaveType);
    if (filters.dept)
      list = list.filter((r) => r.department_name === filters.dept);
    if (filters.dateFrom)
      list = list.filter((r) => r.start_date >= filters.dateFrom);
    if (filters.dateTo) list = list.filter((r) => r.end_date <= filters.dateTo);
    list.sort((a, b) => {
      let va = a[sort.col],
        vb = b[sort.col];
      if (typeof va === "string") {
        va = va.toLowerCase();
        vb = vb?.toLowerCase();
      }
      return sort.dir === "asc" ? (va > vb ? 1 : -1) : va < vb ? 1 : -1;
    });
    return list;
  }, [requests, search, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Reset to page 1 whenever filters/search change
  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  const handleApprove = async (id, comment) => {
    setActionLoading(true);
    try {
      await leaveApi.approveRequest(id, { comment });
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)),
      );
    } catch (err) {
      alert(err?.response?.data?.message ?? "Failed to approve.");
    } finally {
      setActionLoading(false);
      setModal(null);
    }
  };

  const handleReject = async (id, rejectionReason) => {
    setActionLoading(true);
    try {
      await leaveApi.rejectRequest(id, { rejectionReason });
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)),
      );
    } catch (err) {
      alert(err?.response?.data?.message ?? "Failed to reject.");
    } finally {
      setActionLoading(false);
      setModal(null);
    }
  };

  const handleModalConfirm = (comment) => {
    if (!modal) return;
    modal.action === "approve"
      ? handleApprove(modal.request.id, comment)
      : handleReject(modal.request.id, comment);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const COLS = [
    { key: "id", label: "Request ID", w: "min-w-[110px]" },
    { key: "employee_name", label: "Employee", w: "min-w-[160px]" },
    { key: "department_name", label: "Department", w: "min-w-[130px]" },
    { key: "leave_type", label: "Leave Type", w: "min-w-[120px]" },
    { key: "start_date", label: "Start", w: "min-w-[90px]" },
    { key: "end_date", label: "End", w: "min-w-[90px]" },
    { key: "days", label: "Days", w: "min-w-[55px]" },
    { key: "created_at", label: "Applied On", w: "min-w-[95px]" },
    { key: "status", label: "Status", w: "min-w-[95px]" },
    { key: "_actions", label: "Actions", w: "min-w-[90px]" },
  ];

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
    <motion.div
      custom={0}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* ── Search + Filter bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
        {/* Local search input (also driven by parent's search bar) */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            color={C.textMuted}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, ID, leave type…"
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl outline-none"
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              color: C.textPrimary,
            }}
          />
        </div>
        {/* Filters toggle */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setFilterOpen((p) => !p)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold"
          style={{
            background: filterOpen ? C.primaryLight : C.surface,
            border: `1px solid ${filterOpen ? C.primary : C.border}`,
            color: filterOpen ? C.primary : C.textSecondary,
          }}
        >
          <SlidersHorizontal size={13} /> Filters
          {activeFiltersCount > 0 && (
            <span
              className="w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
              style={{ background: C.primary }}
            >
              {activeFiltersCount}
            </span>
          )}
        </motion.button>
        {/* Quick status pills */}
        <div className="flex gap-1.5 flex-wrap">
          {["", "pending", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setFilters((f) => ({ ...f, status: s }))}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full transition-all"
              style={{
                background: filters.status === s ? C.primary : C.surface,
                color: filters.status === s ? "#fff" : C.textSecondary,
                border: `1px solid ${filters.status === s ? C.primary : C.border}`,
              }}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Expanded filter panel ── */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              {[
                { label: "Leave Type", key: "leaveType", opts: leaveTypes },
                { label: "Department", key: "dept", opts: departments },
              ].map((f) => (
                <div key={f.key}>
                  <label
                    className="text-[10px] font-semibold mb-1 block"
                    style={{ color: C.textSecondary }}
                  >
                    {f.label}
                  </label>
                  <select
                    value={filters[f.key]}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, [f.key]: e.target.value }))
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl outline-none"
                    style={{
                      background: C.surfaceAlt,
                      border: `1px solid ${C.border}`,
                      color: C.textPrimary,
                    }}
                  >
                    <option value="">All</option>
                    {f.opts.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              {[
                { label: "From", key: "dateFrom" },
                { label: "To", key: "dateTo" },
              ].map((f) => (
                <div key={f.key}>
                  <label
                    className="text-[10px] font-semibold mb-1 block"
                    style={{ color: C.textSecondary }}
                  >
                    {f.label}
                  </label>
                  <input
                    type="date"
                    value={filters[f.key]}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, [f.key]: e.target.value }))
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl outline-none"
                    style={{
                      background: C.surfaceAlt,
                      border: `1px solid ${C.border}`,
                      color: C.textPrimary,
                    }}
                  />
                </div>
              ))}
              <div className="col-span-2 sm:col-span-4 flex justify-end">
                <button
                  onClick={() =>
                    setFilters({
                      status: "",
                      leaveType: "",
                      dept: "",
                      dateFrom: "",
                      dateTo: "",
                    })
                  }
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                  style={{ color: C.danger, background: C.dangerLight }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table ── */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: C.surfaceAlt,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                {COLS.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left ${col.w}`}
                    onClick={() =>
                      col.key !== "_actions" && toggleSort(col.key)
                    }
                    style={{
                      cursor: col.key !== "_actions" ? "pointer" : "default",
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: C.textSecondary }}
                      >
                        {col.label}
                      </span>
                      {col.key !== "_actions" && <SortIcon col={col.key} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={COLS.length} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText size={28} color={C.textMuted} />
                      <p
                        className="text-sm font-semibold"
                        style={{ color: C.textSecondary }}
                      >
                        {search || activeFiltersCount > 0
                          ? "No requests match your filters"
                          : "No requests found"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((r, i) => {
                  const appliedOn = r.created_at
                    ? new Date(r.created_at).toLocaleDateString("en-NG")
                    : "—";
                  return (
                    <motion.tr
                      key={r.id}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ background: C.surfaceAlt }}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: `1px solid ${C.border}` }}
                    >
                      <td className="px-4 py-3.5">
                        <span
                          className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-lg"
                          style={{
                            background: C.surfaceAlt,
                            color: C.textSecondary,
                          }}
                        >
                          {r.id?.slice(0, 8)}…
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Avatar
                            initials={getInitials(r.employee_name)}
                            color={getTypeColor(r.leave_type)}
                            size={28}
                          />
                          <div>
                            <p
                              className="text-xs font-semibold"
                              style={{ color: C.textPrimary }}
                            >
                              {r.employee_name}
                            </p>
                            <p
                              className="text-[10px]"
                              style={{ color: C.textMuted }}
                            >
                              {r.employee_code}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="text-xs"
                          style={{ color: C.textSecondary }}
                        >
                          {r.department_name ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <LeaveTypePill type={r.leave_type} />
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="text-xs"
                          style={{ color: C.textPrimary }}
                        >
                          {r.start_date}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="text-xs"
                          style={{ color: C.textPrimary }}
                        >
                          {r.end_date}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="text-xs font-bold"
                          style={{ color: C.textPrimary }}
                        >
                          {r.days}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="text-xs"
                          style={{ color: C.textSecondary }}
                        >
                          {appliedOn}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={r.status} />
                      </td>
                      <td
                        className="px-4 py-3.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1">
                          {r.status?.toLowerCase() === "pending" && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  setModal({ request: r, action: "approve" })
                                }
                                className="w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{ background: C.successLight }}
                              >
                                <Check size={12} color={C.success} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  setModal({ request: r, action: "reject" })
                                }
                                className="w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{ background: C.dangerLight }}
                              >
                                <X size={12} color={C.danger} />
                              </motion.button>
                            </>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: C.primaryLight }}
                          >
                            <Eye size={12} color={C.primary} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > pageSize && (
          <div
            className="px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderTop: `1px solid ${C.border}` }}
          >
            <p className="text-xs" style={{ color: C.textMuted }}>
              Showing{" "}
              <span className="font-semibold" style={{ color: C.textPrimary }}>
                {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold" style={{ color: C.textPrimary }}>
                {filtered.length}
              </span>{" "}
              requests
            </p>
            <div className="flex items-center gap-1.5">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  opacity: page === 1 ? 0.4 : 1,
                }}
              >
                <ChevronLeft size={13} color={C.textSecondary} />
              </motion.button>
              {Array.from(
                { length: Math.min(totalPages, 5) },
                (_, i) => i + 1,
              ).map((p) => (
                <motion.button
                  key={p}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(p)}
                  className="w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center"
                  style={{
                    background: p === page ? C.primary : C.surface,
                    color: p === page ? "#fff" : C.textSecondary,
                    border: `1px solid ${p === page ? C.primary : C.border}`,
                    boxShadow:
                      p === page ? "0 2px 8px rgba(79,70,229,0.3)" : "none",
                  }}
                >
                  {p}
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  opacity: page === totalPages ? 0.4 : 1,
                }}
              >
                <ChevronRight size={13} color={C.textSecondary} />
              </motion.button>
            </div>
          </div>
        )}
      </Card>

      {/* Action modal */}
      <AnimatePresence>
        {modal && (
          <ActionModal
            request={modal.request}
            action={modal.action}
            onConfirm={handleModalConfirm}
            onClose={() => setModal(null)}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
