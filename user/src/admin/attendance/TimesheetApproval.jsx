

// src/admin/attendance/TimesheetApproval.jsx
// HR Admin — full timesheet management hub.
// Sub-tabs: Pending Approvals · All Entries · Reports

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, Clock, Users, FileText, BarChart2,
  ChevronDown, ChevronUp, Search, Download, Filter,
  RefreshCw, AlertCircle, X, TrendingUp, Calendar,
  ArrowUpDown, AlertTriangle, Inbox, CheckSquare, Square,
} from "lucide-react";
import { timesheetAdminApi } from "../../api/service/timesheetApi";
import { C } from "../employeemanagement/sharedData";
import Loader from "../../components/Loader";

// ─── helpers ───────────────────────────────────────────────────
const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const fmtTime = (t) => {
  if (!t) return "—";
  // "HH:MM:SS" string — render directly, no Date parse needed
  if (typeof t === "string" && /^\d{2}:\d{2}/.test(t)) return t.slice(0, 5);
  const d = new Date(t);
  return isNaN(d)
    ? t
    : d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
};

const fmtHours = (h) => {
  const n = Number(h ?? 0);
  return `${n.toFixed(1)}h`;
};

const initials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

// ─── micro-components ──────────────────────────────────────────
const Skeleton = ({ h = 16, w = "100%" }) => (
  <div
    style={{
      height: h,
      width: w,
      borderRadius: 8,
      background:
        "linear-gradient(90deg,#E2E8F4 25%,#EFF6FF 50%,#E2E8F4 75%)",
      backgroundSize: "200% 100%",
      animation: "ts-shimmer 1.4s infinite linear",
    }}
  />
);

const Avatar = ({ name, avatar, size = 36 }) =>
  avatar ? (
    <img
      src={avatar}
      alt={name}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        objectFit: "cover",
        flexShrink: 0,
      }}
    />
  ) : (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        flexShrink: 0,
        background: `linear-gradient(135deg,${C.primary},${C.accent ?? "#6366F1"})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.33,
        fontFamily: "Sora,sans-serif",
      }}
    >
      {initials(name)}
    </div>
  );

const StatusBadge = ({ status }) => {
  const map = {
    Draft: { bg: C.surfaceAlt ?? "#F1F5F9", color: C.textMuted },
    Submitted: { bg: "#FEF3C7", color: "#D97706" },
    Approved: { bg: "#D1FAE5", color: "#059669" },
    Rejected: { bg: "#FEE2E2", color: "#DC2626" },
  };
  const s = map[status] ?? map.Draft;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: 10,
        fontWeight: 700,
        padding: "3px 9px",
        borderRadius: 99,
        whiteSpace: "nowrap",
      }}
    >
      {status ?? "—"}
    </span>
  );
};

const Toast = ({ toasts }) => (
  <div
    style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}
  >
    <AnimatePresence>
      {toasts.map((t) => (
        <Motion.div
          key={t.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          style={{
            padding: "12px 18px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            background:
              t.type === "success"
                ? "#D1FAE5"
                : t.type === "error"
                  ? "#FEE2E2"
                  : "#EFF6FF",
            color:
              t.type === "success"
                ? "#059669"
                : t.type === "error"
                  ? "#DC2626"
                  : C.primary,
            border: `1px solid ${
              t.type === "success"
                ? "#6EE7B7"
                : t.type === "error"
                  ? "#FCA5A5"
                  : "#BFDBFE"
            }`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            maxWidth: 340,
          }}
        >
          {t.type === "success" ? (
            <CheckCircle2 size={14} />
          ) : t.type === "error" ? (
            <XCircle size={14} />
          ) : (
            <Clock size={14} />
          )}
          {t.message}
        </Motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// ─── Rejection modal ───────────────────────────────────────────
const RejectionModal = ({ entry, onConfirm, onCancel, loading }) => {
  const [reason, setReason] = useState("");
  return (
    <>
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,23,42,0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 100,
        }}
      />
      <Motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 101,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <div
          style={{
            background: C.surface,
            borderRadius: 20,
            padding: 28,
            width: "100%",
            maxWidth: 420,
            boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.textPrimary,
                  fontFamily: "Sora,sans-serif",
                }}
              >
                Reject Entry
              </h3>
              <p style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>
                {entry?.employeeName} ·{" "}
                {fmt(entry?.entryDate ?? entry?.attendanceDate)}
              </p>
            </div>
            <button
              onClick={onCancel}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <X size={16} color={C.textMuted} />
            </button>
          </div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: C.textMuted,
              marginBottom: 6,
            }}
          >
            Reason for rejection{" "}
            <span style={{ color: "#DC2626" }}>*</span>
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain what needs to be corrected so the employee can resubmit accurately…"
            rows={4}
            style={{
              width: "100%",
              borderRadius: 10,
              border: `1.5px solid ${C.border}`,
              background: C.surfaceAlt ?? "#F8FAFC",
              padding: "10px 12px",
              fontSize: 13,
              color: C.textPrimary,
              outline: "none",
              resize: "vertical",
              fontFamily: "'DM Sans',sans-serif",
            }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              style={{
                flex: 1,
                padding: "9px",
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                background: C.surfaceAlt,
                fontSize: 12,
                fontWeight: 600,
                color: C.textSecondary,
                cursor: "pointer",
              }}
            >
              Cancel
            </Motion.button>
            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => reason.trim() && onConfirm(reason.trim())}
              disabled={!reason.trim() || loading}
              style={{
                flex: 2,
                padding: "9px",
                borderRadius: 10,
                border: "none",
                background: !reason.trim() || loading ? "#FCA5A5" : "#DC2626",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                cursor: !reason.trim() || loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={12} className="animate-spin" /> Rejecting…
                </>
              ) : (
                <>
                  <XCircle size={12} /> Confirm Rejection
                </>
              )}
            </Motion.button>
          </div>
        </div>
      </Motion.div>
    </>
  );
};

// ─── Entry detail drawer ───────────────────────────────────────
// FIX 1: removed invalid `group` reference — uses `entry` throughout
const EntryDrawer = ({ entry, onClose }) => {
  if (!entry) return null;
  const rows = [
    { label: "Employee",    value: entry.employeeName },
    { label: "Department",  value: entry.department },
    { label: "Job Role",    value: entry.jobTitle },
    { label: "Date",        value: fmt(entry.entryDate ?? entry.attendanceDate) },
    { label: "Start Time",  value: fmtTime(entry.startTime) },
    { label: "End Time",    value: fmtTime(entry.endTime) },
    { label: "Duration",    value: fmtHours(entry.durationHours ?? entry.durationMinutes / 60) },
    { label: "Project",     value: entry.projectTag ?? "—" },
    { label: "Status",      value: entry.status },
    { label: "Approved By", value: entry.approvedByName ?? entry.approvedBy ?? "—" },
    { label: "Submitted",   value: fmt(entry.submittedAt ?? entry.createdAt) },
  ];
  return (
    <>
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,23,42,0.35)",
          backdropFilter: "blur(4px)",
          zIndex: 50,
        }}
      />
      <Motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          width: "100%",
          maxWidth: 420,
          background: C.surface,
          zIndex: 51,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 40px rgba(15,23,42,0.14)",
        }}
      >
        <div
          style={{
            padding: "20px 24px 16px",
            background: "linear-gradient(135deg,#1E1B4B,#1E40AF)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 12,
            }}
          >
            <Motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "rgba(255,255,255,0.15)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={14} color="#fff" />
            </Motion.button>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <Avatar
              name={entry.employeeName ?? ""}
              avatar={entry.avatar}
              size={52}
            />
            <div>
              <h2
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: "#fff",
                  fontFamily: "Sora,sans-serif",
                }}
              >
                {entry.employeeName ?? "—"}
              </h2>
              {/* FIX 1: was referencing undefined `group`, now uses `entry` */}
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.65)",
                  marginTop: 2,
                }}
              >
                {entry.department ?? "—"} · {entry.jobTitle ?? "—"}
              </p>
              <div style={{ marginTop: 6 }}>
                <StatusBadge status={entry.status} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 10,
              }}
            >
              Entry Details
            </p>
            {rows.map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "9px 0",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <span style={{ fontSize: 12, color: C.textMuted }}>{label}</span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color:
                      value && value !== "—" ? C.textPrimary : C.textMuted,
                  }}
                >
                  {label === "Status" ? (
                    <StatusBadge status={value} />
                  ) : (
                    (value ?? "—")
                  )}
                </span>
              </div>
            ))}
          </div>

          {entry.description && (
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 8,
                }}
              >
                Description
              </p>
              <div
                style={{
                  background: C.surfaceAlt ?? "#F8FAFC",
                  borderRadius: 10,
                  padding: "12px 14px",
                  fontSize: 13,
                  color: C.textPrimary,
                  lineHeight: 1.6,
                  border: `1px solid ${C.border}`,
                }}
              >
                {entry.description}
              </div>
            </div>
          )}

          {entry.rejectionReason && (
            <div
              style={{
                marginTop: 16,
                background: "#FEF2F2",
                borderRadius: 10,
                padding: "12px 14px",
                border: "1px solid #FECACA",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#DC2626",
                  marginBottom: 4,
                }}
              >
                Rejection Reason
              </p>
              <p style={{ fontSize: 13, color: "#7F1D1D" }}>
                {entry.rejectionReason}
              </p>
            </div>
          )}
        </div>
      </Motion.div>
    </>
  );
};

// ════════════════════ PENDING APPROVALS TAB ════════════════════
function PendingApprovalsTab({ addToast }) {
  const [groups,        setGroups]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [expanded,      setExpanded]      = useState({});
  const [selected,      setSelected]      = useState(new Set());
  const [actioning,     setActioning]     = useState(null);
  const [rejectModal,   setRejectModal]   = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await timesheetAdminApi.getPendingApprovals();
      // Backend returns { employees: [...], totalPending: N }
      const raw = res.employees ?? res.groups ?? res.data ?? [];
      setGroups(Array.isArray(raw) ? raw : []);
    } catch {
      setError("Failed to load pending timesheets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const allEntries = useMemo(
    () => groups.flatMap((g) => g.entries ?? []),
    [groups],
  );

  // pending hours come from durationHours on each formatted entry
  const totalHours = useMemo(
    () =>
      allEntries.reduce(
        (s, e) => s + Number(e.durationHours ?? e.durationMinutes / 60 ?? 0),
        0,
      ),
    [allEntries],
  );

  const empCount = groups.length;

  const toggleSelect = (id) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleAll = () => {
    if (selected.size === allEntries.length) setSelected(new Set());
    else setSelected(new Set(allEntries.map((e) => e.id)));
  };

  const toggleEmployee = (empId) => {
    const empEntries =
      groups.find((g) => g.employeeId === empId)?.entries ?? [];
    const ids = empEntries.map((e) => e.id);
    const allSelected = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const n = new Set(prev);
      if (allSelected) ids.forEach((id) => n.delete(id));
      else ids.forEach((id) => n.add(id));
      return n;
    });
  };

  const handleApprove = async (entryId) => {
    setActioning(entryId);
    try {
      await timesheetAdminApi.approveEntry(entryId);
      setGroups((prev) =>
        prev
          .map((g) => ({
            ...g,
            entries: (g.entries ?? []).filter((e) => e.id !== entryId),
          }))
          .filter((g) => (g.entries ?? []).length > 0),
      );
      addToast("Entry approved.", "success");
    } catch (err) {
      addToast(err?.response?.data?.message ?? "Approval failed.", "error");
    } finally {
      setActioning(null);
    }
  };

  const handleApproveAll = async (empId) => {
    const entries =
      groups.find((g) => g.employeeId === empId)?.entries ?? [];
    const ids = entries.map((e) => e.id);
    setActioning(`all_${empId}`);
    try {
      await timesheetAdminApi.approveBulk(ids);
      setGroups((prev) => prev.filter((g) => g.employeeId !== empId));
      addToast(
        `Approved all entries for ${
          groups.find((g) => g.employeeId === empId)?.employeeName ?? "employee"
        }.`,
        "success",
      );
    } catch (err) {
      addToast(
        err?.response?.data?.message ?? "Bulk approval failed.",
        "error",
      );
    } finally {
      setActioning(null);
    }
  };

  const handleBulkApprove = async () => {
    const ids = [...selected];
    setActioning("bulk");
    try {
      await timesheetAdminApi.approveBulk(ids);
      setGroups((prev) =>
        prev
          .map((g) => ({
            ...g,
            entries: (g.entries ?? []).filter((e) => !ids.includes(e.id)),
          }))
          .filter((g) => (g.entries ?? []).length > 0),
      );
      setSelected(new Set());
      addToast(`${ids.length} entries approved.`, "success");
    } catch (err) {
      addToast(
        err?.response?.data?.message ?? "Bulk approval failed.",
        "error",
      );
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (reason) => {
    if (!rejectModal) return;
    setRejectLoading(true);
    try {
      await timesheetAdminApi.rejectEntry(rejectModal.id, reason);
      setGroups((prev) =>
        prev
          .map((g) => ({
            ...g,
            entries: (g.entries ?? []).filter((e) => e.id !== rejectModal.id),
          }))
          .filter((g) => (g.entries ?? []).length > 0),
      );
      addToast("Entry rejected. Employee has been notified.", "error");
      setRejectModal(null);
    } catch (err) {
      addToast(err?.response?.data?.message ?? "Rejection failed.", "error");
    } finally {
      setRejectLoading(false);
    }
  };

  if (loading)
    return (
      <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
        <Loader />
      </div>
    );
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (allEntries.length === 0)
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <Inbox size={40} style={{ color: C.textMuted, margin: "0 auto 12px" }} />
        <p
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: C.textPrimary,
            marginBottom: 4,
          }}
        >
          All caught up
        </p>
        <p style={{ fontSize: 13, color: C.textMuted }}>
          No timesheet entries pending review.
        </p>
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Summary bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
          gap: 10,
        }}
      >
        {[
          {
            label: "Entries Pending",
            value: allEntries.length,
            icon: Clock,
            color: "#D97706",
            bg: "#FEF3C7",
          },
          {
            label: "Hours Pending",
            value: fmtHours(totalHours),
            icon: TrendingUp,
            color: C.primary,
            bg: C.primaryLight,
          },
          {
            label: "Employees",
            value: empCount,
            icon: Users,
            color: "#059669",
            bg: "#D1FAE5",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: C.surface,
              borderRadius: 14,
              border: `1px solid ${C.border}`,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: s.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <s.icon size={16} color={s.color} />
            </div>
            <div>
              <p
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: C.textPrimary,
                  fontFamily: "Sora,sans-serif",
                }}
              >
                {s.value}
              </p>
              <p style={{ fontSize: 10, color: s.color, fontWeight: 600 }}>
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Select-all + Bulk bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleAll}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            color: C.textSecondary,
            padding: "4px 0",
          }}
        >
          {selected.size === allEntries.length && allEntries.length > 0 ? (
            <CheckSquare size={15} color={C.primary} />
          ) : (
            <Square size={15} color={C.textMuted} />
          )}
          Select all {allEntries.length} entries
        </Motion.button>
        <AnimatePresence>
          {selected.size > 0 && (
            <Motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <Motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleBulkApprove}
                disabled={actioning === "bulk"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: "#059669",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {actioning === "bulk" ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" /> Approving…
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={12} /> Approve Selected ({selected.size})
                  </>
                )}
              </Motion.button>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Employee groups */}
      {groups.map((group) => {
        const isExp = expanded[group.employeeId] ?? true;
        const empEntries = group.entries ?? [];
        const empHours = empEntries.reduce(
          (s, e) =>
            s + Number(e.durationHours ?? e.durationMinutes / 60 ?? 0),
          0,
        );
        const empAllSelected = empEntries.every((e) => selected.has(e.id));
        const actAll = actioning === `all_${group.employeeId}`;

        return (
          <div
            key={group.employeeId}
            style={{
              background: C.surface,
              borderRadius: 16,
              border: `1px solid ${C.border}`,
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
            }}
          >
            {/* Group header */}
            <div
              style={{
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                borderBottom: isExp ? `1px solid ${C.border}` : "none",
                background: isExp ? (C.surfaceAlt ?? "#F8FAFC") : "transparent",
              }}
              onClick={() =>
                setExpanded((p) => ({ ...p, [group.employeeId]: !isExp }))
              }
            >
              <Motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleEmployee(group.employeeId);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 2,
                  flexShrink: 0,
                }}
              >
                {empAllSelected ? (
                  <CheckSquare size={15} color={C.primary} />
                ) : (
                  <Square size={15} color={C.textMuted} />
                )}
              </Motion.button>

              <Avatar
                name={group.employeeName ?? ""}
                avatar={group.avatar}
                size={38}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: C.textPrimary,
                  }}
                >
                  {group.employeeName ?? "—"}
                </p>
                {/* backend returns `department` not `departmentName` */}
                <p style={{ fontSize: 11, color: C.textMuted }}>
                  {group.department ?? "—"}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexShrink: 0,
                }}
              >
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: C.primary,
                      fontFamily: "Sora,sans-serif",
                    }}
                  >
                    {fmtHours(empHours)}
                  </p>
                  <p style={{ fontSize: 10, color: C.textMuted }}>
                    {empEntries.length}{" "}
                    {empEntries.length === 1 ? "entry" : "entries"}
                  </p>
                </div>
                <Motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApproveAll(group.employeeId);
                  }}
                  disabled={actAll}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "6px 12px",
                    borderRadius: 10,
                    border: "none",
                    background: "#D1FAE5",
                    color: "#059669",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: actAll ? "not-allowed" : "pointer",
                  }}
                >
                  {actAll ? (
                    <RefreshCw size={11} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={11} />
                  )}
                  {actAll ? "Approving…" : "Approve All"}
                </Motion.button>
                {isExp ? (
                  <ChevronUp size={14} color={C.textMuted} />
                ) : (
                  <ChevronDown size={14} color={C.textMuted} />
                )}
              </div>
            </div>

            {/* Entries */}
            <AnimatePresence>
              {isExp && (
                <Motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {empEntries.map((entry, idx) => {
                    const isSel = selected.has(entry.id);
                    const isAct = actioning === entry.id;
                    return (
                      <div
                        key={entry.id}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          padding: "14px 20px",
                          borderBottom:
                            idx < empEntries.length - 1
                              ? `1px solid ${C.border}`
                              : "none",
                          background: isSel
                            ? (C.primaryLight ?? "#EEF2FF")
                            : "transparent",
                          transition: "background 0.15s",
                        }}
                      >
                        <Motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleSelect(entry.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "2px 0",
                            marginTop: 2,
                            flexShrink: 0,
                          }}
                        >
                          {isSel ? (
                            <CheckSquare size={14} color={C.primary} />
                          ) : (
                            <Square size={14} color={C.textMuted} />
                          )}
                        </Motion.button>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              flexWrap: "wrap",
                              marginBottom: 4,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: C.textPrimary,
                              }}
                            >
                              {fmt(entry.entryDate ?? entry.attendanceDate)}
                            </span>
                            <span style={{ fontSize: 12, color: C.textMuted }}>
                              {fmtTime(entry.startTime)} —{" "}
                              {fmtTime(entry.endTime)}
                            </span>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: C.primary,
                              }}
                            >
                              {fmtHours(entry.durationHours ?? entry.durationMinutes / 60)}
                            </span>
                            {entry.projectTag && (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  padding: "2px 8px",
                                  borderRadius: 99,
                                  background: C.primaryLight,
                                  color: C.primary,
                                }}
                              >
                                {entry.projectTag}
                              </span>
                            )}
                          </div>
                          {entry.description && (
                            <p
                              style={{
                                fontSize: 12,
                                color: C.textSecondary,
                                lineHeight: 1.5,
                                marginTop: 2,
                              }}
                            >
                              {entry.description}
                            </p>
                          )}
                        </div>

                        <div
                          style={{ display: "flex", gap: 6, flexShrink: 0 }}
                        >
                          <Motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handleApprove(entry.id)}
                            disabled={!!actioning}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "5px 10px",
                              borderRadius: 8,
                              border: "none",
                              background: "#D1FAE5",
                              color: "#059669",
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: actioning ? "not-allowed" : "pointer",
                              opacity: actioning && !isAct ? 0.6 : 1,
                            }}
                          >
                            {isAct ? (
                              <RefreshCw size={11} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={11} />
                            )}
                            {isAct ? "…" : "Approve"}
                          </Motion.button>
                          <Motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setRejectModal(entry)}
                            disabled={!!actioning}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "5px 10px",
                              borderRadius: 8,
                              border: "1.5px solid #FCA5A5",
                              background: "transparent",
                              color: "#DC2626",
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: actioning ? "not-allowed" : "pointer",
                              opacity: actioning ? 0.6 : 1,
                            }}
                          >
                            <XCircle size={11} /> Reject
                          </Motion.button>
                        </div>
                      </div>
                    );
                  })}
                </Motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      <AnimatePresence>
        {rejectModal && (
          <RejectionModal
            entry={rejectModal}
            onConfirm={handleReject}
            onCancel={() => setRejectModal(null)}
            loading={rejectLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ════════════════════════ ALL ENTRIES TAB ═════════════════════
const PAGE_SIZE = 50;

function AllEntriesTab({ addToast }) {
  const [entries,     setEntries]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [page,        setPage]        = useState(1);
  const [total,       setTotal]       = useState(0);
  const [exporting,   setExporting]   = useState(false);
  const [drawerEntry, setDrawerEntry] = useState(null);

  const [filters, setFilters] = useState({
    startDate: "", endDate: "", employeeId: "", departmentId: "",
    status: "", search: "",
  });

  const load = useCallback(
    async (f = filters, p = page) => {
      setLoading(true);
      setError(null);
      try {
        const params = { ...f, page: p, limit: PAGE_SIZE };
        Object.keys(params).forEach((k) => !params[k] && delete params[k]);
        const res = await timesheetAdminApi.getAllEntries(params);
        // FIX 2: backend returns { entries: [...], meta: { total } }
        setEntries(res.entries ?? []);
        setTotal(res.meta?.total ?? res.total ?? 0);
      } catch {
        setError("Failed to load entries.");
      } finally {
        setLoading(false);
      }
    },
    [filters, page],
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleFilter = (key, val) => {
    const next = { ...filters, [key]: val };
    setFilters(next);
    setPage(1);
    load(next, 1);
  };

  const handleExport = async () => {
    setExporting(true);
    addToast(`Exporting ${total} entries…`, "info");
    try {
      const params = { ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const blob = await timesheetAdminApi.exportCSV(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `timesheets-export-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      addToast("Export downloaded.", "success");
    } catch {
      addToast("Export failed.", "error");
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Filter bar */}
      <div
        style={{
          background: C.surface,
          borderRadius: 16,
          border: `1px solid ${C.border}`,
          padding: "14px 18px",
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "flex-end",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Filter size={13} color={C.textMuted} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.textMuted }}>
            Filters
          </span>
        </div>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => handleFilter("startDate", e.target.value)}
          style={inputStyle}
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => handleFilter("endDate", e.target.value)}
          style={inputStyle}
        />

        <select
          value={filters.status}
          onChange={(e) => handleFilter("status", e.target.value)}
          style={inputStyle}
        >
          <option value="">All Statuses</option>
          {["Draft", "Submitted", "Approved", "Rejected"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <Search
            size={12}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: C.textMuted,
              pointerEvents: "none",
            }}
          />
          <input
            value={filters.search}
            onChange={(e) => handleFilter("search", e.target.value)}
            placeholder="Search description…"
            style={{ ...inputStyle, paddingLeft: 30, width: "100%" }}
          />
        </div>

        <button
          onClick={() => {
            const blank = {
              startDate: "", endDate: "", employeeId: "",
              departmentId: "", status: "", search: "",
            };
            setFilters(blank);
            setPage(1);
            load(blank, 1);
          }}
          style={{
            ...inputStyle,
            cursor: "pointer",
            color: C.textMuted,
            background: C.surfaceAlt ?? "#F8FAFC",
          }}
        >
          Clear
        </button>

        <Motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleExport}
          disabled={exporting}
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 10,
            border: "none",
            background: C.primary,
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            cursor: exporting ? "not-allowed" : "pointer",
            opacity: exporting ? 0.7 : 1,
          }}
        >
          {exporting ? (
            <RefreshCw size={12} className="animate-spin" />
          ) : (
            <Download size={12} />
          )}
          Export CSV
        </Motion.button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} h={48} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => load()} />
      ) : entries.length === 0 ? (
        <EmptyState message="No entries match your filters." />
      ) : (
        <>
          <div
            style={{
              background: C.surface,
              borderRadius: 16,
              border: `1px solid ${C.border}`,
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      background: C.surfaceAlt ?? "#F8FAFC",
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    {[
                      "Employee", "Date", "Time", "Duration",
                      "Description", "Project", "Status", "Approved By",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "11px 16px",
                          textAlign: "left",
                          fontSize: 10,
                          fontWeight: 700,
                          color: C.textMuted,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <Motion.tr
                      key={entry.id}
                      whileHover={{ background: C.surfaceAlt ?? "#F8FAFC" }}
                      onClick={() => setDrawerEntry(entry)}
                      style={{
                        borderBottom: `1px solid ${C.border}`,
                        cursor: "pointer",
                      }}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Avatar
                            name={entry.employeeName ?? ""}
                            avatar={entry.avatar}
                            size={28}
                          />
                          <div>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: C.textPrimary,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {entry.employeeName ?? "—"}
                            </p>
                            {/* FIX 3 (all entries table): `entry.department` is correct */}
                            <p style={{ fontSize: 10, color: C.textMuted }}>
                              {entry.department ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 12,
                          color: C.textPrimary,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fmt(entry.entryDate ?? entry.attendanceDate)}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 12,
                          color: C.textSecondary,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fmtTime(entry.startTime)} – {fmtTime(entry.endTime)}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          fontWeight: 700,
                          color: C.primary,
                        }}
                      >
                        {fmtHours(entry.durationHours ?? entry.durationMinutes / 60)}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 12,
                          color: C.textSecondary,
                          maxWidth: 200,
                        }}
                      >
                        <span
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {entry.description ?? "—"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {entry.projectTag ? (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: 99,
                              background: C.primaryLight,
                              color: C.primary,
                            }}
                          >
                            {entry.projectTag}
                          </span>
                        ) : (
                          <span style={{ color: C.textMuted, fontSize: 12 }}>
                            —
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <StatusBadge status={entry.status} />
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 12,
                          color: C.textMuted,
                        }}
                      >
                        {entry.approvedByName ?? entry.approvedBy ?? "—"}
                      </td>
                    </Motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 0",
              }}
            >
              <p style={{ fontSize: 12, color: C.textMuted }}>
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, total)} of {total} entries
              </p>
              <div style={{ display: "flex", gap: 6 }}>
                {Array.from(
                  { length: Math.min(totalPages, 7) },
                  (_, i) => i + 1,
                ).map((p) => (
                  <Motion.button
                    key={p}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setPage(p);
                      load(filters, p);
                    }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: page === p ? C.primary : C.surface,
                      color: page === p ? "#fff" : C.textSecondary,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: `1px solid ${page === p ? C.primary : C.border}`,
                    }}
                  >
                    {p}
                  </Motion.button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {drawerEntry && (
          <EntryDrawer
            entry={drawerEntry}
            onClose={() => setDrawerEntry(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ════════════════════════════ REPORTS TAB ════════════════════════════
function ReportsTab({ addToast }) {
  const [period,      setPeriod]      = useState("month");
  const [startDate,   setStartDate]   = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [endDate,     setEndDate]     = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [summary,     setSummary]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [sortDept,    setSortDept]    = useState({ key: "totalHours", dir: "desc" });
  const [sortEmp,     setSortEmp]     = useState({ key: "totalHours", dir: "desc" });
  const [histEmpId,   setHistEmpId]   = useState(null);
  const [histEntries, setHistEntries] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [histName,    setHistName]    = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await timesheetAdminApi.getCompanySummary({ startDate, endDate });
      setSummary(res);
    } catch {
      setError("Failed to load report data.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const now = new Date();
    if (period === "week") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const mon = new Date(now);
      mon.setDate(diff);
      setStartDate(mon.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
    } else if (period === "month") {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(first.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
    }
  }, [period]);

  // FIX 5: backend returns `byDepartment` not `departments`
  const deptRows = useMemo(() => {
    const rows = summary?.byDepartment ?? [];
    return [...rows].sort((a, b) => {
      const av = a[sortDept.key] ?? 0,
        bv = b[sortDept.key] ?? 0;
      return sortDept.dir === "asc" ? av - bv : bv - av;
    });
  }, [summary, sortDept]);

  // FIX 5: backend returns `byEmployee` not `employees`
  const empRows = useMemo(() => {
    const rows = summary?.byEmployee ?? [];
    return [...rows].sort((a, b) => {
      const av = a[sortEmp.key] ?? 0,
        bv = b[sortEmp.key] ?? 0;
      return sortEmp.dir === "asc" ? av - bv : bv - av;
    });
  }, [summary, sortEmp]);

  const openHistory = async (emp) => {
    setHistEmpId(emp.employeeId ?? emp.id);
    setHistName(emp.employeeName ?? emp.name ?? "Employee");
    setHistLoading(true);
    try {
      const res = await timesheetAdminApi.getEmployeeHistory(
        emp.employeeId ?? emp.id,
        { startDate, endDate },
      );
      // FIX 6: backend returns { entries: [...], total, employeeId }
      setHistEntries(res.entries ?? []);
    } catch {
      addToast("Failed to load history.", "error");
    } finally {
      setHistLoading(false);
    }
  };

  const SortTh = ({ label, col, sort, setSort }) => (
    <th
      style={{
        padding: "11px 16px",
        textAlign: "left",
        fontSize: 10,
        fontWeight: 700,
        color: C.textMuted,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        cursor: "pointer",
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
      onClick={() =>
        setSort((s) => ({
          key: col,
          dir: s.key === col && s.dir === "desc" ? "asc" : "desc",
        }))
      }
    >
      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {label}
        <ArrowUpDown
          size={10}
          color={sort.key === col ? C.primary : C.textMuted}
        />
      </span>
    </th>
  );

  if (histEmpId)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Motion.button
            whileHover={{ scale: 1.03 }}
            onClick={() => setHistEmpId(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: C.surface,
              fontSize: 12,
              fontWeight: 600,
              color: C.textSecondary,
              cursor: "pointer",
            }}
          >
            ← Back to Reports
          </Motion.button>
          <h2
            style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}
          >
            {histName} — Timesheet History
          </h2>
        </div>

        {histLoading ? (
          <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
            <Loader />
          </div>
        ) : histEntries.length === 0 ? (
          <EmptyState message="No entries found for this period." />
        ) : (
          <div
            style={{
              background: C.surface,
              borderRadius: 16,
              border: `1px solid ${C.border}`,
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      background: C.surfaceAlt ?? "#F8FAFC",
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    {[
                      "Date", "Time", "Duration",
                      "Description", "Project", "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "11px 16px",
                          textAlign: "left",
                          fontSize: 10,
                          fontWeight: 700,
                          color: C.textMuted,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {histEntries.map((e) => (
                    <tr
                      key={e.id}
                      style={{ borderBottom: `1px solid ${C.border}` }}
                    >
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          color: C.textPrimary,
                        }}
                      >
                        {fmt(e.entryDate ?? e.attendanceDate)}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 12,
                          color: C.textSecondary,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fmtTime(e.startTime)} – {fmtTime(e.endTime)}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          fontWeight: 700,
                          color: C.primary,
                        }}
                      >
                        {fmtHours(e.durationHours ?? e.durationMinutes / 60)}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 12,
                          color: C.textSecondary,
                          maxWidth: 260,
                        }}
                      >
                        <span
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {e.description ?? "—"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {e.projectTag ? (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: 99,
                              background: C.primaryLight,
                              color: C.primary,
                            }}
                          >
                            {e.projectTag}
                          </span>
                        ) : (
                          <span style={{ color: C.textMuted, fontSize: 12 }}>
                            —
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <StatusBadge status={e.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Period selector */}
      <div
        style={{
          background: C.surface,
          borderRadius: 14,
          border: `1px solid ${C.border}`,
          padding: "12px 16px",
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
        }}
      >
        <Calendar size={14} color={C.textMuted} />
        <div style={{ display: "flex", gap: 4 }}>
          {["week", "month", "custom"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: "5px 12px",
                borderRadius: 8,
                border: "none",
                background: period === p ? C.primary : "transparent",
                color: period === p ? "#fff" : C.textSecondary,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        {period === "custom" && (
          <>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={inputStyle}
            />
            <span style={{ fontSize: 12, color: C.textMuted }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={inputStyle}
            />
          </>
        )}
        <Motion.button
          whileHover={{ scale: 1.03 }}
          onClick={load}
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 12px",
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: C.surface,
            fontSize: 12,
            fontWeight: 600,
            color: C.textSecondary,
            cursor: "pointer",
          }}
        >
          <RefreshCw size={12} /> Refresh
        </Motion.button>
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} h={60} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !summary ? null : (
        <>
          {/* Summary cards */}
          {/* FIX 4: backend returns summary.totals.hours, not summary.totalHours */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
              gap: 10,
            }}
          >
            {[
              {
                label: "Total Hours Logged",
                value: fmtHours(summary.totals?.hours ?? 0),
                icon: Clock,
                color: C.primary,
                bg: C.primaryLight,
              },
              {
                label: "Approved Entries",
                value: summary.totals?.byStatus?.Approved ?? 0,
                icon: CheckCircle2,
                color: "#059669",
                bg: "#D1FAE5",
              },
              {
                label: "Avg Hours / Employee",
                value: fmtHours(
                  empRows.length > 0
                    ? (summary.totals?.hours ?? 0) / empRows.length
                    : 0,
                ),
                icon: TrendingUp,
                color: "#7C3AED",
                bg: "#EDE9FE",
              },
              {
                label: "Employees with No Entries",
                value: summary.zeroEntryEmployees?.length ?? 0,
                icon: AlertTriangle,
                color: "#D97706",
                bg: "#FEF3C7",
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: C.surface,
                  borderRadius: 14,
                  border: `1px solid ${C.border}`,
                  padding: "16px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: s.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <s.icon size={16} color={s.color} />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color:
                        s.label === "Employees with No Entries" &&
                        (summary.zeroEntryEmployees?.length ?? 0) > 0
                          ? "#D97706"
                          : C.textPrimary,
                      fontFamily: "Sora,sans-serif",
                    }}
                  >
                    {s.value}
                  </p>
                  <p
                    style={{ fontSize: 10, color: s.color, fontWeight: 600 }}
                  >
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Department breakdown */}
          <div
            style={{
              background: C.surface,
              borderRadius: 16,
              border: `1px solid ${C.border}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 20px",
                borderBottom: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: C.primaryLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BarChart2 size={14} color={C.primary} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.textPrimary,
                  }}
                >
                  Department Breakdown
                </p>
                <p style={{ fontSize: 10, color: C.textMuted }}>
                  Sorted by total hours
                </p>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      background: C.surfaceAlt ?? "#F8FAFC",
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    <th
                      style={{
                        padding: "11px 16px",
                        textAlign: "left",
                        fontSize: 10,
                        fontWeight: 700,
                        color: C.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Department
                    </th>
                    <SortTh
                      label="Total Hours"
                      col="totalHours"
                      sort={sortDept}
                      setSort={setSortDept}
                    />
                    <SortTh
                      label="Employees"
                      col="employeeCount"
                      sort={sortDept}
                      setSort={setSortDept}
                    />
                    <SortTh
                      label="Avg / Person"
                      col="avgHoursPerEmployee"
                      sort={sortDept}
                      setSort={setSortDept}
                    />
                  </tr>
                </thead>
                <tbody>
                  {deptRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          padding: 24,
                          textAlign: "center",
                          color: C.textMuted,
                          fontSize: 13,
                        }}
                      >
                        No department data available.
                      </td>
                    </tr>
                  ) : (
                    deptRows.map((d) => (
                      <tr
                        key={d.departmentId ?? d.department}
                        style={{ borderBottom: `1px solid ${C.border}` }}
                      >
                        <td style={{ padding: "12px 16px" }}>
                          {/* FIX 3: was `entry.department`, now correctly `d.department` */}
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: C.textPrimary,
                            }}
                          >
                            {d.departmentName ?? d.department ?? "—"}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: 13,
                            fontWeight: 700,
                            color: C.primary,
                          }}
                        >
                          {fmtHours(d.totalHours)}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: 13,
                            color: C.textPrimary,
                          }}
                        >
                          {d.employeeCount ?? "—"}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: 13,
                            color: C.textSecondary,
                          }}
                        >
                          {fmtHours(d.avgHoursPerEmployee)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Employee breakdown */}
          <div
            style={{
              background: C.surface,
              borderRadius: 16,
              border: `1px solid ${C.border}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 20px",
                borderBottom: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "#EDE9FE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Users size={14} color="#7C3AED" />
              </div>
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.textPrimary,
                  }}
                >
                  Employee Breakdown
                </p>
                <p style={{ fontSize: 10, color: C.textMuted }}>
                  Click any row to view full history
                </p>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      background: C.surfaceAlt ?? "#F8FAFC",
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    <th
                      style={{
                        padding: "11px 16px",
                        textAlign: "left",
                        fontSize: 10,
                        fontWeight: 700,
                        color: C.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Employee
                    </th>
                    <SortTh
                      label="Total Hours"
                      col="totalHours"
                      sort={sortEmp}
                      setSort={setSortEmp}
                    />
                    <SortTh
                      label="Entries"
                      col="entryCount"
                      sort={sortEmp}
                      setSort={setSortEmp}
                    />
                    <SortTh
                      label="Approval Rate"
                      col="approvalRate"
                      sort={sortEmp}
                      setSort={setSortEmp}
                    />
                    <th
                      style={{
                        padding: "11px 16px",
                        textAlign: "left",
                        fontSize: 10,
                        fontWeight: 700,
                        color: C.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Last Entry
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {empRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          padding: 24,
                          textAlign: "center",
                          color: C.textMuted,
                          fontSize: 13,
                        }}
                      >
                        No employee data available.
                      </td>
                    </tr>
                  ) : (
                    empRows.map((emp) => {
                      const hasNoActivity =
                        !emp.totalHours || emp.totalHours === 0;
                      return (
                        <Motion.tr
                          key={emp.employeeId ?? emp.id}
                          whileHover={{ background: C.surfaceAlt ?? "#F8FAFC" }}
                          onClick={() => openHistory(emp)}
                          style={{
                            borderBottom: `1px solid ${C.border}`,
                            cursor: "pointer",
                            borderLeft: hasNoActivity
                              ? "3px solid #F59E0B"
                              : "3px solid transparent",
                          }}
                        >
                          <td style={{ padding: "12px 16px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <Avatar
                                name={emp.employeeName ?? emp.name ?? ""}
                                avatar={emp.avatar}
                                size={30}
                              />
                              <div>
                                <p
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: C.textPrimary,
                                  }}
                                >
                                  {emp.employeeName ?? emp.name ?? "—"}
                                </p>
                                {/* backend returns `department` not `departmentName` on byEmployee */}
                                <p
                                  style={{ fontSize: 10, color: C.textMuted }}
                                >
                                  {emp.department ?? "—"}
                                </p>
                              </div>
                              {hasNoActivity && (
                                <span
                                  style={{
                                    fontSize: 9,
                                    fontWeight: 700,
                                    padding: "2px 6px",
                                    borderRadius: 6,
                                    background: "#FEF3C7",
                                    color: "#D97706",
                                    marginLeft: 4,
                                  }}
                                >
                                  No activity
                                </span>
                              )}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              fontSize: 13,
                              fontWeight: 700,
                              color: hasNoActivity ? C.textMuted : C.primary,
                            }}
                          >
                            {fmtHours(emp.totalHours)}
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              fontSize: 13,
                              color: C.textPrimary,
                            }}
                          >
                            {emp.entryCount ?? 0}
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              fontSize: 13,
                              color: C.textPrimary,
                            }}
                          >
                            {emp.approvalRate != null
                              ? `${emp.approvalRate}%`
                              : "—"}
                          </td>
                          <td
                            style={{
                              padding: "12px 16px",
                              fontSize: 12,
                              color: C.textMuted,
                            }}
                          >
                            {fmt(emp.lastEntryDate)}
                          </td>
                        </Motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── shared UI ────────────────────────────────────────────────
const ErrorState = ({ message, onRetry }) => (
  <div style={{ padding: 48, textAlign: "center" }}>
    <AlertCircle
      size={32}
      style={{ color: "#DC2626", margin: "0 auto 10px" }}
    />
    <p
      style={{
        fontSize: 14,
        fontWeight: 600,
        color: C.textPrimary,
        marginBottom: 4,
      }}
    >
      {message}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          fontSize: 12,
          color: C.primary,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        Try again
      </button>
    )}
  </div>
);

const EmptyState = ({ message }) => (
  <div style={{ padding: 48, textAlign: "center" }}>
    <Inbox size={32} style={{ color: C.textMuted, margin: "0 auto 10px" }} />
    <p style={{ fontSize: 13, color: C.textMuted }}>{message}</p>
  </div>
);

const inputStyle = {
  padding: "7px 12px",
  borderRadius: 9,
  border: `1.5px solid ${C.border}`,
  background: C.surface,
  fontSize: 12,
  color: C.textPrimary,
  outline: "none",
};

// ════════════════════════════ MAIN EXPORT ════════════════════════════
const SUB_TABS = [
  { id: "pending", label: "Pending Approvals", icon: Clock },
  { id: "all",     label: "All Entries",        icon: FileText },
  { id: "reports", label: "Reports",            icon: BarChart2 },
];

let toastId = 0;

export default function TimesheetApproval() {
  const [activeTab, setActiveTab] = useState("pending");
  const [toasts,    setToasts]    = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = ++toastId;
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(
      () => setToasts((p) => p.filter((t) => t.id !== id)),
      3800,
    );
  }, []);

  return (
    <Motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <style>{`@keyframes ts-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* Sub-tab bar */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: 4,
          borderRadius: 14,
          background: C.surface,
          border: `1px solid ${C.border}`,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {SUB_TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <Motion.button
              key={id}
              whileHover={{ scale: active ? 1 : 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 16px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
                flexShrink: 0,
                background: active ? C.primary : "transparent",
                color: active ? "#fff" : C.textSecondary,
                boxShadow: active ? "0 2px 8px rgba(79,70,229,0.25)" : "none",
                transition: "all 0.16s",
              }}
            >
              <Icon size={13} />
              {label}
            </Motion.button>
          );
        })}
      </div>

      {/* Tab panels */}
      <AnimatePresence mode="wait">
        <Motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "pending" && (
            <PendingApprovalsTab addToast={addToast} />
          )}
          {activeTab === "all" && <AllEntriesTab addToast={addToast} />}
          {activeTab === "reports" && <ReportsTab addToast={addToast} />}
        </Motion.div>
      </AnimatePresence>

      <Toast toasts={toasts} />
    </Motion.div>
  );
}