// src/admin/leavemanagement/LeaveRequestDetail.jsx
//  Route: /admin/leave-management/requests/:requestId

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import AdminSideNavbar from "../AdminSideNavbar";
import {
  ChevronRight,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Menu,
  Calendar,
  User,
  Briefcase,
  MapPin,
  FileText,
  MessageSquare,
  AlertTriangle,
  ArrowLeft,
  UserCheck,
  Building2,
  RefreshCw,
} from "lucide-react";
import {C} from "../employeemanagement/sharedData";
import { leaveApi } from "../../api/service/leaveApi";

const LEAVE_TYPE_UI = {
  "Annual Leave": { color: "#4F46E5", light: "#EEF2FF", icon: "☀️" },
  "Sick Leave": { color: "#EF4444", light: "#FEE2E2", icon: "🏥" },
  "Maternity Leave": { color: "#EC4899", light: "#FDF2F8", icon: "🤱" },
  "Paternity Leave": { color: "#06B6D4", light: "#ECFEFF", icon: "👨‍👩‍👧" },
  Compassionate: { color: "#8B5CF6", light: "#EDE9FE", icon: "🕊️" },
  "Study Leave": { color: "#10B981", light: "#D1FAE5", icon: "📚" },
  "Unpaid Leave": { color: "#F59E0B", light: "#FEF3C7", icon: "⏸️" },
};
const getTypeColor = (type) => LEAVE_TYPE_UI[type]?.color ?? C.primary;
const getTypeLight = (type) => LEAVE_TYPE_UI[type]?.light ?? C.primaryLight;
const getTypeIcon = (type) => LEAVE_TYPE_UI[type]?.icon ?? "📋";
const getInitials = (name) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "??";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

function Avatar({ initials, color = C.primary, size = 40 }) {
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

function Card({ children, style = {} }) {
  return (
    <div
      className="rounded-2xl p-5"
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

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div
      className="flex items-center justify-between py-2.5"
      style={{ borderBottom: `1px solid ${C.border}` }}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon size={13} color={C.textMuted} />}
        <span className="text-xs" style={{ color: C.textSecondary }}>
          {label}
        </span>
      </div>
      <span className="text-xs font-semibold" style={{ color: C.textPrimary }}>
        {value ?? "—"}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    approved: {
      bg: C.successLight,
      color: C.success,
      icon: CheckCircle2,
      label: "Approved",
    },
    pending: {
      bg: C.warningLight,
      color: C.warning,
      icon: Clock,
      label: "Pending",
    },
    rejected: {
      bg: C.dangerLight,
      color: C.danger,
      icon: XCircle,
      label: "Rejected",
    },
  }[status?.toLowerCase()] || {
    bg: C.surfaceAlt,
    color: C.textMuted,
    icon: Clock,
    label: status,
  };
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon size={13} />
      {cfg.label}
    </span>
  );
}

function BalanceBar({ label, used, total, color }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const remaining = total - used;
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-xs font-medium"
          style={{ color: C.textSecondary }}
        >
          {label}
        </span>
        <span className="text-xs font-bold" style={{ color: C.textPrimary }}>
          {remaining} / {total} days left
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: C.surfaceAlt }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function ConfirmModal({ action, request, onConfirm, onClose, loading }) {
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
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
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
              {isApprove ? "Approve Leave" : "Reject Leave"}
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
            isApprove ? "Add an approval note…" : "Reason for rejection…"
          }
          className="w-full text-xs p-3 rounded-xl resize-none outline-none"
          style={{
            background: C.surfaceAlt,
            border: `1px solid ${C.border}`,
            color: C.textPrimary,
            minHeight: 72,
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
            {loading && <RefreshCw size={12} className="animate-spin" />}
            {isApprove ? "Approve" : "Reject"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LeaveRequestDetail() {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [request, setRequest] = useState(null);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch all requests and find the one matching requestId
        const [reqRes, balRes] = await Promise.all([
          leaveApi.getAllRequests({ limit: 200 }),
          leaveApi.getAllBalances(),
        ]);
        const all = reqRes.data ?? [];
        const found = all.find((r) => r.id === requestId);
        if (!found) {
          setError("Request not found.");
          return;
        }
        setRequest(found);

        // Filter balances for this employee
        const empBalances = (balRes.data ?? []).filter(
          (b) => b.employee_id === found.employee_id,
        );
        setBalances(empBalances);
      } catch {
        setError("Failed to load request details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [requestId]);

  const handleAction = async (comment) => {
    if (!modal || !request) return;
    setActionLoading(true);
    try {
      if (modal.action === "approve") {
        await leaveApi.approveRequest(request.id, { comment });
        setRequest((r) => ({
          ...r,
          status: "approved",
          approved_by_name: "You",
          approved_at: new Date().toISOString(),
        }));
      } else {
        await leaveApi.rejectRequest(request.id, { rejectionReason: comment });
        setRequest((r) => ({
          ...r,
          status: "rejected",
          rejection_reason: comment,
          approved_at: new Date().toISOString(),
        }));
      }
    } catch (err) {
      alert(err?.response?.data?.message ?? "Action failed.");
    } finally {
      setActionLoading(false);
      setModal(null);
    }
  };

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: C.bg }}
      >
        <RefreshCw
          size={24}
          className="animate-spin"
          style={{ color: C.primary }}
        />
      </div>
    );
  if (error || !request)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: C.bg }}
      >
        <p style={{ color: C.danger }}>{error ?? "Request not found."}</p>
      </div>
    );

  const typeColor = getTypeColor(request.leave_type);
  const typeLight = getTypeLight(request.leave_type);
  const TODAY = new Date().toISOString().split("T")[0];

  const timeline = [
    {
      label: "Request Submitted",
      date: request.created_at
        ? new Date(request.created_at).toLocaleDateString()
        : "—",
      done: true,
      icon: FileText,
    },
    {
      label: "Under Review",
      date: request.created_at
        ? new Date(request.created_at).toLocaleDateString()
        : "—",
      done: true,
      icon: Clock,
    },
    {
      label:
        request.status === "approved"
          ? "Approved"
          : request.status === "rejected"
            ? "Rejected"
            : "Awaiting Decision",
      date: request.approved_at
        ? new Date(request.approved_at).toLocaleDateString()
        : "—",
      done: request.status !== "pending",
      icon:
        request.status === "approved"
          ? CheckCircle2
          : request.status === "rejected"
            ? XCircle
            : AlertTriangle,
      color:
        request.status === "approved"
          ? C.success
          : request.status === "rejected"
            ? C.danger
            : C.warning,
    },
    {
      label: "Leave Start",
      date: request.start_date,
      done: request.start_date <= TODAY && request.status === "approved",
      icon: Calendar,
    },
    {
      label: "Leave End",
      date: request.end_date,
      done: request.end_date < TODAY && request.status === "approved",
      icon: UserCheck,
    },
  ];

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: C.bg, fontFamily: "Inter,sans-serif" }}
    >
      <AdminSideNavbar
        sidebarOpen={sidebarOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOPBAR */}
        <header
          className="h-14 flex items-center justify-between px-6 shrink-0"
          style={{
            background: C.surface,
            borderBottom: `1px solid ${C.border}`,
            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((p) => !p)}
              className="w-8 h-8 rounded-xl flex items-center justify-center md:hidden"
              style={{
                background: C.surfaceAlt,
                border: `1px solid ${C.border}`,
              }}
            >
              <Menu size={15} color={C.textSecondary} />
            </button>
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: C.textMuted }}
            >
              <button
                onClick={() => navigate("/admin/leave-management")}
                className="hover:underline"
              >
                Leave Mgmt
              </button>
              <ChevronRight size={11} />
              <button
                onClick={() => navigate("/admin/leave-management/requests")}
                className="hover:underline"
              >
                Requests
              </button>
              <ChevronRight size={11} />
              <span className="font-bold" style={{ color: C.textPrimary }}>
                {request.id?.slice(0, 8)}…
              </span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/admin/leave-management/requests")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
              color: C.textSecondary,
            }}
          >
            <ArrowLeft size={13} /> Back
          </motion.button>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-5">
              {/* Header Card */}
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                <Card>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        initials={getInitials(request.employee_name)}
                        color={typeColor}
                        size={48}
                      />
                      <div>
                        <h2
                          className="font-bold text-base"
                          style={{ color: C.textPrimary }}
                        >
                          {request.employee_name}
                        </h2>
                        <p className="text-xs" style={{ color: C.textMuted }}>
                          {request.job_role_name} · {request.department_name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <StatusBadge status={request.status} />
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded-lg"
                            style={{
                              background: C.surfaceAlt,
                              color: C.textSecondary,
                            }}
                          >
                            {request.employee_code}
                          </span>
                        </div>
                      </div>
                    </div>
                    {request.status?.toLowerCase() === "pending" && (
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setModal({ action: "approve" })}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                          style={{ background: C.success }}
                        >
                          <Check size={13} /> Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setModal({ action: "reject" })}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                          style={{ background: C.dangerLight, color: C.danger }}
                        >
                          <X size={13} /> Reject
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {/* Leave type banner */}
                  <div
                    className="rounded-xl p-4 flex items-center gap-4 mb-4"
                    style={{
                      background: typeLight,
                      border: `1px solid ${typeColor}30`,
                    }}
                  >
                    <div className="text-2xl">
                      {getTypeIcon(request.leave_type)}
                    </div>
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: typeColor }}
                      >
                        {request.leave_type}
                      </p>
                      <p className="text-xs" style={{ color: C.textSecondary }}>
                        {request.start_date} → {request.end_date}
                      </p>
                    </div>
                    <div className="ml-auto text-right">
                      <p
                        className="text-2xl font-black"
                        style={{ color: typeColor }}
                      >
                        {request.days}
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: C.textSecondary }}
                      >
                        days requested
                      </p>
                    </div>
                  </div>

                  {/* Reason */}
                  {request.reason && (
                    <div className="mb-3">
                      <p
                        className="text-xs font-semibold mb-2 flex items-center gap-1.5"
                        style={{ color: C.textSecondary }}
                      >
                        <MessageSquare size={12} /> Reason
                      </p>
                      <p
                        className="text-xs leading-relaxed p-3 rounded-xl"
                        style={{
                          background: C.surfaceAlt,
                          color: C.textPrimary,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        {request.reason}
                      </p>
                    </div>
                  )}

                  {/* HR comment / rejection reason */}
                  {(request.comment || request.rejection_reason) && (
                    <div>
                      <p
                        className="text-xs font-semibold mb-2 flex items-center gap-1.5"
                        style={{ color: C.textSecondary }}
                      >
                        <MessageSquare size={12} /> HR Comment
                      </p>
                      <p
                        className="text-xs leading-relaxed p-3 rounded-xl"
                        style={{
                          background:
                            request.status === "approved"
                              ? C.successLight
                              : C.dangerLight,
                          color: C.textPrimary,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        {request.comment ?? request.rejection_reason}
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>

              {/* Request Details */}
              <motion.div
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                <Card>
                  <h3
                    className="text-sm font-bold mb-3"
                    style={{ color: C.textPrimary }}
                  >
                    Request Details
                  </h3>
                  <InfoRow
                    label="Request ID"
                    value={request.id}
                    icon={FileText}
                  />
                  <InfoRow
                    label="Applied On"
                    value={
                      request.created_at
                        ? new Date(request.created_at).toLocaleDateString(
                            "en-NG",
                          )
                        : "—"
                    }
                    icon={Calendar}
                  />
                  <InfoRow
                    label="Paid Leave"
                    value={request.is_paid ? "Yes ✅" : "No ❌"}
                    icon={FileText}
                  />
                  {request.approved_by_name && (
                    <InfoRow
                      label="Reviewed By"
                      value={request.approved_by_name}
                      icon={User}
                    />
                  )}
                  {request.approved_at && (
                    <InfoRow
                      label="Decision Date"
                      value={new Date(request.approved_at).toLocaleDateString(
                        "en-NG",
                      )}
                      icon={Calendar}
                    />
                  )}
                  {request.rejection_reason && (
                    <InfoRow
                      label="Rejection Note"
                      value={request.rejection_reason}
                      icon={AlertTriangle}
                    />
                  )}
                </Card>
              </motion.div>

              {/* Timeline */}
              <motion.div
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                <Card>
                  <h3
                    className="text-sm font-bold mb-4"
                    style={{ color: C.textPrimary }}
                  >
                    Request Timeline
                  </h3>
                  <div className="relative">
                    <div
                      className="absolute left-3.5 top-3 bottom-3 w-0.5"
                      style={{ background: C.border }}
                    />
                    <div className="space-y-4">
                      {timeline.map((t, i) => {
                        const Icon = t.icon;
                        const color = t.done
                          ? t.color || C.success
                          : C.textMuted;
                        return (
                          <div
                            key={i}
                            className="flex items-start gap-3 relative"
                          >
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center z-10 shrink-0"
                              style={{
                                background: t.done
                                  ? `${color}20`
                                  : C.surfaceAlt,
                                border: `2px solid ${t.done ? color : C.border}`,
                              }}
                            >
                              <Icon size={12} color={color} />
                            </div>
                            <div className="flex-1 pt-0.5">
                              <p
                                className="text-xs font-semibold"
                                style={{
                                  color: t.done ? C.textPrimary : C.textMuted,
                                }}
                              >
                                {t.label}
                              </p>
                              <p
                                className="text-[11px]"
                                style={{ color: C.textMuted }}
                              >
                                {t.date}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-5">
              {/* Employee Info */}
              <motion.div
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                <Card>
                  <h3
                    className="text-sm font-bold mb-3"
                    style={{ color: C.textPrimary }}
                  >
                    Employee Info
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <Avatar
                      initials={getInitials(request.employee_name)}
                      color={typeColor}
                      size={36}
                    />
                    <div>
                      <p
                        className="text-xs font-bold"
                        style={{ color: C.textPrimary }}
                      >
                        {request.employee_name}
                      </p>
                      <p className="text-[11px]" style={{ color: C.textMuted }}>
                        {request.employee_code}
                      </p>
                    </div>
                  </div>
                  <InfoRow
                    label="Role"
                    value={request.job_role_name}
                    icon={Briefcase}
                  />
                  <InfoRow
                    label="Department"
                    value={request.department_name}
                    icon={Building2}
                  />
                  <div className="mt-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() =>
                        navigate(`/admin/employees/${request.employee_id}`)
                      }
                      className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                      style={{
                        background: C.primaryLight,
                        color: C.primary,
                        border: `1px solid ${C.primaryLight}`,
                      }}
                    >
                      View Full Profile <ChevronRight size={12} />
                    </motion.button>
                  </div>
                </Card>
              </motion.div>

              {/* Leave Balance — from API */}
              <motion.div
                custom={4}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                <Card>
                  <h3
                    className="text-sm font-bold mb-4"
                    style={{ color: C.textPrimary }}
                  >
                    Leave Balance
                  </h3>
                  {balances.length === 0 ? (
                    <p className="text-xs" style={{ color: C.textMuted }}>
                      No balance data available.
                    </p>
                  ) : (
                    balances.map((b) => {
                      const balColors = {
                        "Annual Leave": C.primary,
                        "Sick Leave": C.danger,
                        "Study Leave": C.success,
                        "Maternity Leave": C.purple,
                        "Paternity Leave": C.accent,
                      };
                      const barColor = balColors[b.leave_type] ?? C.textMuted;
                      return (
                        <BalanceBar
                          key={b.id}
                          label={b.leave_type}
                          used={b.used_days ?? 0}
                          total={b.entitled_days ?? 0}
                          color={barColor}
                        />
                      );
                    })
                  )}
                </Card>
              </motion.div>
            </div>
          </div>
          <div className="h-4" />
        </main>
      </div>

      <AnimatePresence>
        {modal && (
          <ConfirmModal
            action={modal.action}
            request={request}
            onConfirm={handleAction}
            onClose={() => setModal(null)}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
