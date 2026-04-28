// src/admin/employeemanagement/ProfileChangeRequests.jsx
// Route: /admin/employeemanagement/admin-profilechangerequests
// HR can see all pending profile change requests from employees,
// view the diff (old vs new), and approve or reject them.

import { useState, useEffect, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import AdminSideNavbar from "../AdminSideNavbar";
// import { useAuth } from "../../components/AuthContext";
import C from "../../styles/colors";
import API from "../../api/axios";
import {
  ChevronRight,
  Menu,
  RefreshCw,
  Check,
  X,
  Eye,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Edit3,
  ArrowRight,
  Info,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.055, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
const fmtTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

// ── API calls ──
const changeRequestsApi = {
  getAll: (params = {}) =>
    API.get("/employees/change-requests", { params }).then((r) => r.data),
  approve: (id) =>
    API.put(`/employees/change-requests/${id}/approve`).then((r) => r.data),
  reject: (id, reason) =>
    API.put(`/employees/change-requests/${id}/reject`, { reason }).then(
      (r) => r.data,
    ),
};

// ── Atoms ──
function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const Chip = ({ label, color, bg, dot = false }) => (
  <span
    className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
    style={{ background: bg, color }}
  >
    {dot && (
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: color }}
      />
    )}
    {label}
  </span>
);

// ── Change Diff row ──
function DiffRow({ field, oldVal, newVal }) {
  return (
    <div
      className="grid grid-cols-3 gap-3 py-2.5 border-b last:border-0"
      style={{ borderColor: C.border }}
    >
      <p className="text-xs font-semibold" style={{ color: C.textMuted }}>
        {field}
      </p>
      <div className="flex items-center gap-2">
        <span
          className="text-xs px-2 py-0.5 rounded"
          style={{ background: C.dangerLight, color: C.danger }}
        >
          {oldVal || "—"}
        </span>
        <ArrowRight size={10} color={C.textMuted} />
        <span
          className="text-xs px-2 py-0.5 rounded font-semibold"
          style={{ background: C.successLight, color: C.success }}
        >
          {newVal || "—"}
        </span>
      </div>
    </div>
  );
}

// ── Detail Modal ──
function DetailModal({ req, onApprove, onReject, onClose }) {
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState(null);
  const [err, setErr] = useState(null);

  const changes = req.requested_changes ?? {};
  const snapshot = req.current_snapshot ?? {};

  // Pretty-print field names
  const FIELD_LABELS = {
    phone: "Phone",
    address: "Address",
    state: "State",
    personalEmail: "Personal Email",
    nokName: "Next of Kin Name",
    nokRelationship: "NOK Relationship",
    nokPhone: "NOK Phone",
    nokAddress: "NOK Address",
    bankName: "Bank Name",
    accountNumber: "Account Number",
    accountName: "Account Name",
    avatar: "Profile Photo",
    bio: "Bio",
    // phone: "Phone",
  };

  const handleApprove = async () => {
    setLoading("approve");
    setErr(null);
    try {
      await onApprove(req.id);
    } catch (e) {
      setErr(e?.response?.data?.message ?? "Approve failed.");
      setLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setErr("Please provide a rejection reason.");
      return;
    }
    setLoading("reject");
    setErr(null);
    try {
      await onReject(req.id, rejectReason);
    } catch (e) {
      setErr(e?.response?.data?.message ?? "Reject failed.");
      setLoading(null);
    }
  };

  return (
    <>
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <Motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg flex flex-col"
        style={{
          background: C.surface,
          borderLeft: `1px solid ${C.border}`,
          boxShadow: "-8px 0 40px rgba(15,23,42,0.14)",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between shrink-0"
          style={{
            background: `linear-gradient(135deg,${C.navy},${C.primary})`,
          }}
        >
          <div>
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">
              Profile Change Request
            </p>
            <h3
              className="text-white font-bold mt-0.5"
              style={{ fontFamily: "Sora,sans-serif" }}
            >
              {req.employee_name ?? "Employee"}
            </h3>
            <p className="text-white/50 text-xs mt-0.5">
              {fmtTime(req.created_at)}
            </p>
          </div>
          <Motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={14} color="#fff" />
          </Motion.button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {err && (
            <div
              className="p-3 rounded-xl text-xs"
              style={{ background: C.dangerLight, color: C.danger }}
            >
              {err}
            </div>
          )}

          {/* Employee info */}
          <div
            className="flex items-center gap-3 p-4 rounded-xl"
            style={{ background: C.surfaceAlt }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: C.primary }}
            >
              {(req.employee_name ?? "?")
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: C.textPrimary }}>
                {req.employee_name ?? "—"}
              </p>
              <p className="text-xs" style={{ color: C.textMuted }}>
                {req.employee_code ?? ""} · Submitted {fmtDate(req.created_at)}
              </p>
            </div>
            <Chip
              label={req.status ?? "pending"}
              color={
                req.status === "approved"
                  ? C.success
                  : req.status === "rejected"
                    ? C.danger
                    : C.warning
              }
              bg={
                req.status === "approved"
                  ? C.successLight
                  : req.status === "rejected"
                    ? C.dangerLight
                    : C.warningLight
              }
              dot
            />
          </div>

          {/* Diff */}
          <Card>
            <div
              className="flex items-center gap-3 p-4"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: C.primaryLight }}
              >
                <Edit3 size={13} color={C.primary} />
              </div>
              <p className="text-sm font-bold" style={{ color: C.textPrimary }}>
                Requested Changes
              </p>
            </div>
            <div className="px-5 py-2">
              {/* Column headers */}
              <div
                className="grid grid-cols-3 gap-3 pb-2 mb-1 border-b"
                style={{ borderColor: C.border }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: C.textMuted }}
                >
                  Field
                </p>
                <p
                  className="text-[10px] font-bold uppercase tracking-wider col-span-2"
                  style={{ color: C.textMuted }}
                >
                  Old → New
                </p>
              </div>
              {Object.entries(changes).map(([key, newVal]) => (
                <DiffRow
                  key={key}
                  field={FIELD_LABELS[key] ?? key}
                  oldVal={snapshot[key] ?? "—"}
                  newVal={newVal}
                />
              ))}
            </div>
          </Card>

          {/* Rejection reason */}
          {req.status === "pending" && (
            <>
              {!showReject ? (
                <button
                  onClick={() => setShowReject(true)}
                  className="text-xs font-semibold w-full text-center p-2"
                  style={{
                    color: C.danger,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Reject with reason ▾
                </button>
              ) : (
                <div>
                  <p
                    className="text-xs font-bold mb-1.5"
                    style={{ color: C.textMuted }}
                  >
                    Rejection Reason
                  </p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    placeholder="Explain why this request is being rejected…"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={{
                      border: `1.5px solid ${rejectReason ? C.danger + "66" : C.border}`,
                      background: C.surfaceAlt,
                      color: C.textPrimary,
                    }}
                  />
                </div>
              )}
            </>
          )}

          {req.status !== "pending" && (
            <div
              className="p-4 rounded-xl"
              style={{
                background:
                  req.status === "approved" ? C.successLight : C.dangerLight,
              }}
            >
              <p
                className="text-xs font-bold"
                style={{
                  color: req.status === "approved" ? C.success : C.danger,
                }}
              >
                {req.status === "approved" ? "✓ Approved" : "✗ Rejected"} by{" "}
                {req.reviewed_by_name ?? "HR"} on {fmtDate(req.reviewed_at)}
              </p>
              {req.rejection_reason && (
                <p className="text-xs mt-1" style={{ color: C.textSecondary }}>
                  {req.rejection_reason}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {req.status === "pending" && (
          <div
            className="px-6 py-4 flex gap-3 shrink-0"
            style={{ borderTop: `1px solid ${C.border}` }}
          >
            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReject}
              disabled={loading === "reject"}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              style={{
                background: C.dangerLight,
                color: C.danger,
                border: `1px solid ${C.danger}33`,
                cursor: loading === "reject" ? "not-allowed" : "pointer",
              }}
            >
              {loading === "reject" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <XCircle size={13} />
              )}{" "}
              Reject
            </Motion.button>
            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleApprove}
              disabled={loading === "approve"}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
              style={{
                background: C.success,
                border: "none",
                cursor: loading === "approve" ? "not-allowed" : "pointer",
              }}
            >
              {loading === "approve" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Check size={13} />
              )}{" "}
              Approve & Apply
            </Motion.button>
          </div>
        )}
      </Motion.div>
    </>
  );
}

// ════════════════════════════ MAIN ════════════════════════════
export default function ProfileChangeRequests() {
  // const navigate = useNavigate();
  // const { employee: adminUser } = useAuth();

  // const [sidebarOpen, setSidebarOpen] = useState(true);
  // const [collapsed, setCollapsed] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await changeRequestsApi.getAll({
        status: filterStatus !== "all" ? filterStatus : undefined,
      });
      setRequests(res.data ?? res.requests ?? []);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load change requests.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id) => {
    await changeRequestsApi.approve(id);
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)),
    );
    setSelected(null);
    showToast("Profile change approved and applied.");
    fetchRequests();
  };

  const handleReject = async (id, reason) => {
    await changeRequestsApi.reject(id, reason);
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "rejected", rejection_reason: reason }
          : r,
      ),
    );
    setSelected(null);
    showToast("Profile change rejected.");
    fetchRequests();
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div
      className="min-h-screen"
      style={{
        background: C.bg,
        fontFamily: "'DM Sans','Sora',sans-serif",
        color: C.textPrimary,
      }}
    >
      <div className="flex h-screen overflow-hidden">
        {/* <AdminSideNavbar
          sidebarOpen={sidebarOpen}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          ADMIN={adminUser}
          pendingApprovals={pendingCount}
        /> */}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header
            className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{
              background: "rgba(240,242,248,0.85)",
              backdropFilter: "blur(12px)",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              // onClick={() => setSidebarOpen((p) => !p)}
              className="p-2 rounded-xl hidden md:flex"
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                cursor: "pointer",
              }}
            >
              <Menu size={15} color={C.textSecondary} />
            </Motion.button>
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: C.textSecondary }}
            >
              <span>Admin</span>
              <ChevronRight size={11} />
              <span className="font-bold" style={{ color: C.textPrimary }}>
                Profile Change Requests
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {pendingCount > 0 && (
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: C.warningLight, color: C.warning }}
                >
                  {pendingCount} pending
                </span>
              )}
              <Motion.button
                whileHover={{ scale: 1.05 }}
                onClick={fetchRequests}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={13} color={C.textMuted} />
              </Motion.button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
            {/* Hero */}
            <Motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="rounded-2xl p-8"
              style={{
                background:
                  "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <Edit3 size={28} color="#fff" />
                </div>
                <div>
                  <h1
                    className="text-3xl font-bold text-white"
                    style={{ fontFamily: "Sora,sans-serif" }}
                  >
                    Profile Change Requests
                  </h1>
                  <p className="text-indigo-300 text-sm mt-1">
                    Review and apply employee-submitted profile update requests
                  </p>
                </div>
              </div>
            </Motion.div>

            {error && (
              <div
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{
                  background: C.dangerLight,
                  border: `1px solid ${C.danger}33`,
                }}
              >
                <AlertCircle size={16} color={C.danger} />
                <p className="text-sm flex-1" style={{ color: C.danger }}>
                  {error}
                </p>
                <button
                  onClick={fetchRequests}
                  className="text-xs font-bold px-3 py-1 rounded-lg"
                  style={{
                    background: C.danger,
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Filter tabs */}
            <div
              className="flex gap-1 p-1 rounded-2xl w-fit"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              {["all", "pending", "approved", "rejected"].map((s) => {
                const active = filterStatus === s;
                return (
                  <Motion.button
                    key={s}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setFilterStatus(s)}
                    className="px-4 py-2 rounded-xl text-sm font-medium capitalize"
                    style={{
                      background: active ? C.primary : "transparent",
                      color: active ? "#fff" : C.textSecondary,
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.18s",
                    }}
                  >
                    {s}
                  </Motion.button>
                );
              })}
            </div>

            {/* Table */}
            <Motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              <Card>
                {loading ? (
                  <div className="p-8 space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-14 rounded-xl animate-pulse"
                        style={{ background: C.surfaceAlt }}
                      />
                    ))}
                  </div>
                ) : requests.length === 0 ? (
                  <div className="py-20 text-center">
                    <CheckCircle2
                      size={44}
                      color={C.success}
                      className="mx-auto mb-3"
                    />
                    <p
                      className="font-bold text-base"
                      style={{ color: C.textSecondary }}
                    >
                      No {filterStatus !== "all" ? filterStatus : ""} requests
                    </p>
                    <p className="text-sm mt-1" style={{ color: C.textMuted }}>
                      All profile change requests will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y" style={{ borderColor: C.border }}>
                    {requests.map((req, i) => (
                      <Motion.div
                        key={req.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => setSelected(req)}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 cursor-pointer group transition-colors"
                      >
                        {/* Avatar */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ background: C.primary }}
                        >
                          {(req.employee_name ?? "?")
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p
                              className="text-sm font-semibold"
                              style={{ color: C.textPrimary }}
                            >
                              {req.employee_name ?? "—"}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: C.textMuted }}
                            >
                              {req.employee_code ?? ""}
                            </p>
                          </div>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: C.textSecondary }}
                          >
                            {Object.keys(req.requested_changes ?? {}).length}{" "}
                            field
                            {Object.keys(req.requested_changes ?? {}).length !==
                            1
                              ? "s"
                              : ""}{" "}
                            requested · {fmtDate(req.created_at)}
                          </p>
                        </div>

                        <Chip
                          label={req.status ?? "pending"}
                          color={
                            req.status === "approved"
                              ? C.success
                              : req.status === "rejected"
                                ? C.danger
                                : C.warning
                          }
                          bg={
                            req.status === "approved"
                              ? C.successLight
                              : req.status === "rejected"
                                ? C.dangerLight
                                : C.warningLight
                          }
                          dot
                        />

                        <Eye
                          size={15}
                          color={C.textMuted}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </Motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </Motion.div>
          </main>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <DetailModal
            key={selected.id}
            req={selected}
            onApprove={handleApprove}
            onReject={handleReject}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl z-50"
            style={{
              background: toast.type === "error" ? C.danger : C.navy,
              color: "#fff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              minWidth: 300,
            }}
          >
            {toast.type === "error" ? (
              <AlertCircle size={15} color="#fff" />
            ) : (
              <CheckCircle2 size={15} color={C.success} />
            )}
            <span className="text-sm">{toast.msg}</span>
            <button
              onClick={() => setToast(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                marginLeft: "auto",
              }}
            >
              <X size={13} color="rgba(255,255,255,0.5)" />
            </button>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
