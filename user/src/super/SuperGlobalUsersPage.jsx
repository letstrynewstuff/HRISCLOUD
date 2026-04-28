// src/superadmin/pages/GlobalUsersPage.jsx
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  Ban,
  KeyRound,
  MoreHorizontal,
  CheckSquare,
  Square,
  RefreshCw,
  X,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";
import SuperAdminLayout from "./SuperAdminLayout";
import {
  getAllUsersApi,
  disableUserApi,
  resetUserPasswordApi,
} from "../api/service/superAdminApi";
import C from "../styles/colors";

// ─── Helpers ────────────────────────────────────────────────────────
const ROLE_COLORS = {
  admin: { bg: "#EEF2FF", text: "#4F46E5", label: "Admin" },
  manager: { bg: "#F0FDF4", text: "#16A34A", label: "Manager" },
  user: { bg: "#F8FAFC", text: "#64748B", label: "User" },
  super_admin: { bg: "#FFF7ED", text: "#EA580C", label: "Super Admin" },
};

const STATUS_COLORS = {
  active: { bg: "#F0FDF4", text: "#16A34A", dot: "#22C55E" },
  inactive: { bg: "#F8FAFC", text: "#94A3B8", dot: "#CBD5E1" },
  disabled: { bg: "#FEF2F2", text: "#EF4444", dot: "#F87171" },
  pending: { bg: "#FFFBEB", text: "#D97706", dot: "#FBBF24" },
};

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarGradient(name = "") {
  const gradients = [
    "linear-gradient(135deg,#4F46E5,#7C3AED)",
    "linear-gradient(135deg,#0891B2,#0EA5E9)",
    "linear-gradient(135deg,#059669,#10B981)",
    "linear-gradient(135deg,#D97706,#F59E0B)",
    "linear-gradient(135deg,#DC2626,#EF4444)",
    "linear-gradient(135deg,#7C3AED,#A855F7)",
  ];
  const idx = name.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

// ─── Sub-components ──────────────────────────────────────────────────
function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 text-sm rounded-xl outline-none cursor-pointer"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          color: value ? C.textPrimary : C.textMuted,
          minWidth: 140,
        }}
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        color={C.textMuted}
      />
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS.inactive;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize"
      style={{ background: s.bg, color: s.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: s.dot }}
      />
      {status}
    </span>
  );
}

function RoleBadge({ role }) {
  const r = ROLE_COLORS[role] ?? ROLE_COLORS.user;
  return (
    <span
      className="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize"
      style={{ background: r.bg, color: r.text }}
    >
      {r.label}
    </span>
  );
}

function ConfirmModal({ open, title, message, onConfirm, onCancel, danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative z-10 rounded-2xl p-6 w-[380px] shadow-2xl"
        style={{ background: "#fff", border: `1px solid ${C.border}` }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
          style={{ background: danger ? "#FEF2F2" : "#EEF2FF" }}
        >
          {danger ? (
            <ShieldAlert size={20} color="#EF4444" />
          ) : (
            <KeyRound size={20} color="#4F46E5" />
          )}
        </div>
        <h3
          className="text-lg font-bold mb-1"
          style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
        >
          {title}
        </h3>
        <p className="text-sm mb-5" style={{ color: C.textSecondary }}>
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl text-sm font-medium"
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              color: C.textSecondary,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: danger ? "#EF4444" : "#4F46E5" }}
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function SuperGlobalUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [selected, setSelected] = useState(new Set());
  const [openActionId, setOpenActionId] = useState(null);
  const [modal, setModal] = useState(null); // { type, userId, userName }
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterCompany) params.company = filterCompany;
      if (filterRole) params.role = filterRole;
      if (filterStatus) params.status = filterStatus;
      if (searchQuery) params.search = searchQuery;

      const res = await getAllUsersApi(params);
      const data = res.data?.data ?? res.data?.users ?? res.data ?? [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [filterCompany, filterRole, filterStatus, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 400);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // Derived data
  const companies = [
    ...new Set(users.map((u) => u.company?.name ?? u.company).filter(Boolean)),
  ];

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      (u.name ?? `${u.first_name} ${u.last_name}`).toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const pageUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  // Selection
  const allSelected =
    pageUsers.length > 0 && pageUsers.every((u) => selected.has(u._id ?? u.id));

  const toggleAll = () => {
    const ids = pageUsers.map((u) => u._id ?? u.id);
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => new Set([...prev, ...ids]));
    }
  };

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Actions
  const handleConfirmAction = async () => {
    if (!modal) return;
    setActionLoading(modal.userId);
    try {
      if (modal.type === "disable") {
        await disableUserApi(modal.userId);
        setUsers((prev) =>
          prev.map((u) =>
            (u._id ?? u.id) === modal.userId ? { ...u, status: "disabled" } : u,
          ),
        );
        showToast(`${modal.userName} has been disabled.`, "success");
      } else if (modal.type === "reset") {
        await resetUserPasswordApi(modal.userId);
        showToast(`Password reset email sent to ${modal.userName}.`, "success");
      }
    } catch (err) {
      showToast(err.response?.data?.message ?? "Action failed.", "error");
    } finally {
      setActionLoading(null);
      setModal(null);
    }
  };

  const handleBulkDisable = async () => {
    for (const id of selected) {
      try {
        await disableUserApi(id);
        setUsers((prev) =>
          prev.map((u) =>
            (u._id ?? u.id) === id ? { ...u, status: "disabled" } : u,
          ),
        );
      } catch {}
    }
    showToast(`${selected.size} users disabled.`);
    setSelected(new Set());
  };

  return (
    <SuperAdminLayout
      title="Global Users"
      subtitle="Manage all platform users"
      loading={loading}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onRefresh={fetchUsers}
      showHeader={false}
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[400] px-4 py-3 rounded-xl text-sm font-medium text-white shadow-xl"
            style={{
              background: toast.type === "error" ? "#EF4444" : "#22C55E",
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={!!modal}
        title={modal?.type === "disable" ? "Disable User?" : "Reset Password?"}
        message={
          modal?.type === "disable"
            ? `This will immediately revoke access for ${modal?.userName}. They won't be able to log in.`
            : `A password reset email will be sent to ${modal?.userName}.`
        }
        danger={modal?.type === "disable"}
        onConfirm={handleConfirmAction}
        onCancel={() => setModal(null)}
      />

      <div className="px-5 md:px-7 pb-8 space-y-6">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-8 text-white relative overflow-hidden mt-6"
          style={{
            background:
              "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/15">
                <Users size={28} color="#fff" />
              </div>
              <div>
                <h1
                  className="text-3xl font-bold"
                  style={{ fontFamily: "Sora,sans-serif" }}
                >
                  Global Users
                </h1>
                <p className="text-indigo-200 mt-0.5">
                  Manage all platform users across companies
                </p>
              </div>
            </div>
            <div className="md:ml-auto flex flex-wrap gap-3">
              {[
                { value: users.length, label: "Total Users" },
                {
                  value: users.filter((u) => u.status === "active").length,
                  label: "Active",
                  color: "#86EFAC",
                },
                {
                  value: users.filter((u) => u.status === "disabled").length,
                  label: "Disabled",
                  color: "#FCA5A5",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm"
                >
                  <span
                    className="text-lg font-bold"
                    style={{ color: s.color ?? "#fff" }}
                  >
                    {s.value}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-medium text-white/60">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Filters & Bulk Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: C.textMuted }}
          >
            <Filter size={14} />
            <span>Filter by:</span>
          </div>

          <FilterSelect
            label="All Companies"
            value={filterCompany}
            onChange={(v) => {
              setFilterCompany(v);
              setPage(1);
            }}
            options={companies.map((c) => ({ value: c, label: c }))}
          />
          <FilterSelect
            label="All Roles"
            value={filterRole}
            onChange={(v) => {
              setFilterRole(v);
              setPage(1);
            }}
            options={[
              { value: "admin", label: "Admin" },
              { value: "manager", label: "Manager" },
              { value: "user", label: "User" },
            ]}
          />
          <FilterSelect
            label="All Statuses"
            value={filterStatus}
            onChange={(v) => {
              setFilterStatus(v);
              setPage(1);
            }}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "disabled", label: "Disabled" },
              { value: "pending", label: "Pending" },
            ]}
          />

          {(filterCompany || filterRole || filterStatus) && (
            <button
              onClick={() => {
                setFilterCompany("");
                setFilterRole("");
                setFilterStatus("");
                setPage(1);
              }}
              className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl"
              style={{ background: "#FEF2F2", color: "#EF4444" }}
            >
              <X size={12} /> Clear
            </button>
          )}

          {selected.size > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <span
                className="text-sm font-medium"
                style={{ color: C.textSecondary }}
              >
                {selected.size} selected
              </span>
              <button
                onClick={handleBulkDisable}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white"
                style={{ background: "#EF4444" }}
              >
                <Ban size={13} /> Disable All
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="text-xs px-3 py-2 rounded-xl"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  color: C.textSecondary,
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl"
            style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
          >
            <AlertCircle size={18} color="#EF4444" />
            <span className="text-sm" style={{ color: "#EF4444" }}>
              {error}
            </span>
            <button
              onClick={fetchUsers}
              className="ml-auto text-xs underline"
              style={{ color: "#EF4444" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#fff",
            border: `1px solid ${C.border}`,
            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    borderBottom: `1px solid ${C.border}`,
                    background: "#F8FAFC",
                  }}
                >
                  <th className="px-4 py-3 text-left">
                    <button onClick={toggleAll} className="flex items-center">
                      {allSelected ? (
                        <CheckSquare size={16} color="#4F46E5" />
                      ) : (
                        <Square size={16} color={C.textMuted} />
                      )}
                    </button>
                  </th>
                  {[
                    "User",
                    "Email",
                    "Company",
                    "Role",
                    "Status",
                    "Last Login",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: C.textMuted }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr
                      key={i}
                      style={{ borderBottom: `1px solid ${C.border}` }}
                    >
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-4">
                          <div
                            className="h-4 rounded animate-pulse"
                            style={{
                              background: "#F1F5F9",
                              width: j === 0 ? 20 : "80%",
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : pageUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users size={40} color={C.textMuted} />
                        <span
                          style={{ color: C.textMuted }}
                          className="text-sm"
                        >
                          No users found.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageUsers.map((user, idx) => {
                    const uid = user._id ?? user.id;
                    const name =
                      user.name ??
                      `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
                    const isSelected = selected.has(uid);
                    const isDisabled = user.status === "disabled";

                    return (
                      <motion.tr
                        key={uid}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="group"
                        style={{
                          borderBottom: `1px solid ${C.border}`,
                          background: isSelected ? "#F5F3FF" : "transparent",
                          opacity: isDisabled ? 0.65 : 1,
                        }}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3.5">
                          <button onClick={() => toggleOne(uid)}>
                            {isSelected ? (
                              <CheckSquare size={16} color="#4F46E5" />
                            ) : (
                              <Square size={16} color={C.textMuted} />
                            )}
                          </button>
                        </td>

                        {/* User */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                              style={{ background: getAvatarGradient(name) }}
                            >
                              {getInitials(name)}
                            </div>
                            <span
                              className="text-sm font-semibold"
                              style={{ color: C.textPrimary }}
                            >
                              {name || "—"}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3.5">
                          <span
                            className="text-sm"
                            style={{ color: C.textSecondary }}
                          >
                            {user.email ?? "—"}
                          </span>
                        </td>

                        {/* Company */}
                        <td className="px-4 py-3.5">
                          <span
                            className="text-sm font-medium"
                            style={{ color: C.textPrimary }}
                          >
                            {user.company?.name ?? user.company ?? "—"}
                          </span>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3.5">
                          <RoleBadge role={user.role ?? "user"} />
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <StatusBadge status={user.status ?? "inactive"} />
                        </td>

                        {/* Last Login */}
                        <td className="px-4 py-3.5">
                          <span
                            className="text-xs"
                            style={{ color: C.textMuted }}
                          >
                            {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "Never"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="relative flex items-center gap-1">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                setModal({
                                  type: "disable",
                                  userId: uid,
                                  userName: name,
                                })
                              }
                              disabled={isDisabled || actionLoading === uid}
                              title="Disable user"
                              className="p-2 rounded-lg transition-colors"
                              style={{
                                background: "#FEF2F2",
                                color: "#EF4444",
                                opacity: isDisabled ? 0.4 : 1,
                              }}
                            >
                              <Ban size={13} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                setModal({
                                  type: "reset",
                                  userId: uid,
                                  userName: name,
                                })
                              }
                              disabled={actionLoading === uid}
                              title="Reset password"
                              className="p-2 rounded-lg transition-colors"
                              style={{
                                background: "#EEF2FF",
                                color: "#4F46E5",
                              }}
                            >
                              <KeyRound size={13} />
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
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{
                borderTop: `1px solid ${C.border}`,
                background: "#F8FAFC",
              }}
            >
              <span className="text-xs" style={{ color: C.textMuted }}>
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filteredUsers.length)} of{" "}
                {filteredUsers.length} users
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: p === page ? "#4F46E5" : C.surface,
                        color: p === page ? "#fff" : C.textSecondary,
                        border: `1px solid ${p === page ? "#4F46E5" : C.border}`,
                      }}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </SuperAdminLayout>
  );
}
