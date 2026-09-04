
// src/admin/accounting/AuditTrail.jsx

import { useState, useEffect, useMemo } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Download, RefreshCw, X, Shield } from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import API from "../../api/axios";
import BantaHRLetterLoader from "../../styles/BantaHRLetterLoader";

const auditApi = {
  list: (params) =>
    API.get("/accounting/audit-trail", { params }).then((r) => r.data),
};

const MODULE_LABELS = {
  JournalEntry:       "Journal Entry",
  ChartOfAccounts:    "Chart of Accounts",
  BankReconciliation: "Bank Reconciliation",
  BankAccount:        "Bank Account",
  ReconSession:       "Recon Session",
  TaxConfig:          "Tax Config",
  VAT:                "VAT",
  WHT:                "WHT",
  PAYE:               "PAYE",
  Statutory:          "Statutory",
};

const MODULES = ["all", ...Object.keys(MODULE_LABELS)];

const ACTION_CFG = {
  CREATE:  { bg: "#ECFEFF", color: "#06B6D4", label: "Create"  },
  UPDATE:  { bg: "#EEF2FF", color: "#4F46E5", label: "Update"  },
  POST:    { bg: "#D1FAE5", color: "#10B981", label: "Post"    },
  VOID:    { bg: "#FEF3C7", color: "#F59E0B", label: "Void"    },
  DELETE:  { bg: "#FEE2E2", color: "#EF4444", label: "Delete"  },
  REMIT:   { bg: "#F3E8FF", color: "#7C3AED", label: "Remit"   },
  FILE:    { bg: "#DBEAFE", color: "#2563EB", label: "File"    },
  CONFIRM: { bg: "#D1FAE5", color: "#059669", label: "Confirm" },
  IMPORT:  { bg: "#FEF3C7", color: "#D97706", label: "Import"  },
  MATCH:   { bg: "#ECFEFF", color: "#0891B2", label: "Match"   },
};

const ACTIONS = ["all", ...Object.keys(ACTION_CFG)];

const today = () => new Date().toISOString().split("T")[0];
const monthStart = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

function DiffDrawer({ log, onClose }) {
  const prev = log.previousValue ?? log.previous_value ?? null;
  const next = log.newValue ?? log.new_value ?? null;

  const parseSafe = (v) => {
    if (!v) return null;
    try {
      return typeof v === "string" ? JSON.parse(v) : v;
    } catch {
      return v;
    }
  };

  const prevObj = parseSafe(prev);
  const nextObj = parseSafe(next);
  const keys = Array.from(
    new Set([...Object.keys(prevObj ?? {}), ...Object.keys(nextObj ?? {})]),
  );

  return (
    <Motion.div
      className="fixed inset-0 z-50 flex items-center justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <Motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative h-full w-full max-w-xl flex flex-col"
        style={{ background: C.bg, boxShadow: "-8px 0 40px rgba(0,0,0,0.15)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}
        >
          <div>
            <h2
              className="font-bold text-sm"
              style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
            >
              Audit Detail
            </h2>
            <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
              {log.action} · {MODULE_LABELS[log.module] ?? log.module} ·{" "}
              {(log.recordId ?? log.record_id ?? "—").slice(0, 16)}…
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={15} color={C.textMuted} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Meta */}
          <div
            className="rounded-2xl p-4 space-y-2"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
          >
            {[
              {
                label: "User",
                value:
                  log.userName ?? log.user_name ?? log.user_email ?? log.userId ?? log.user_id ?? "—",
              },
              {
                label: "Timestamp",
                value: log.timestamp
                  ? new Date(log.timestamp).toLocaleString("en-NG")
                  : "—",
              },
              { label: "IP",     value: log.ipAddress ?? log.ip_address ?? "—" },
              { label: "Module", value: MODULE_LABELS[log.module] ?? log.module },
              { label: "Action", value: log.action },
              { label: "Record", value: log.recordId ?? log.record_id ?? "—" },
            ].map((d) => (
              <div key={d.label} className="flex items-center justify-between text-xs">
                <span className="font-semibold" style={{ color: C.textMuted }}>
                  {d.label}
                </span>
                <span className="font-semibold font-mono break-all text-right max-w-[260px]" style={{ color: C.textPrimary }}>
                  {d.value}
                </span>
              </div>
            ))}
          </div>

          {/* Diff */}
          {keys.length > 0 ? (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              <div
                className="grid grid-cols-2"
                style={{ borderBottom: `1px solid ${C.border}` }}
              >
                <div
                  className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-center"
                  style={{ background: "#FEE2E2", color: "#EF4444", borderRight: `1px solid ${C.border}` }}
                >
                  Previous Value
                </div>
                <div
                  className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-center"
                  style={{ background: "#D1FAE5", color: "#10B981" }}
                >
                  New Value
                </div>
              </div>
              {keys.map((key) => {
                const pVal = prevObj?.[key];
                const nVal = nextObj?.[key];
                const changed = JSON.stringify(pVal) !== JSON.stringify(nVal);
                return (
                  <div
                    key={key}
                    className="grid grid-cols-2 text-xs"
                    style={{
                      borderBottom: `1px solid ${C.border}`,
                      background: changed ? "#FFFBEB" : "transparent",
                    }}
                  >
                    <div className="px-4 py-2.5 space-y-0.5" style={{ borderRight: `1px solid ${C.border}` }}>
                      <p className="font-semibold" style={{ color: C.textMuted }}>{key}</p>
                      <p className="font-mono break-all" style={{ color: "#EF4444" }}>
                        {pVal != null ? String(pVal) : "—"}
                      </p>
                    </div>
                    <div className="px-4 py-2.5 space-y-0.5">
                      <p className="font-semibold" style={{ color: C.textMuted }}>{key}</p>
                      <p className="font-mono break-all" style={{ color: "#10B981" }}>
                        {nVal != null ? String(nVal) : "—"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="rounded-2xl p-6 text-center text-sm"
              style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textMuted }}
            >
              No value diff available for this entry.
            </div>
          )}
        </div>
      </Motion.div>
    </Motion.div>
  );
}

export default function AuditTrail({ searchQuery }) {
  const [logs, setLogs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [selected, setSelected]       = useState(null);
  const [dateFrom, setDateFrom]       = useState(monthStart());
  const [dateTo, setDateTo]           = useState(today());
  const [filterAction, setFilterAction] = useState("all");
  const [filterModule, setFilterModule] = useState("all");
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const LIMIT = 30;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: LIMIT,
        from: dateFrom,
        to: dateTo,
        ...(filterAction !== "all" && { action: filterAction }),
        ...(filterModule !== "all" && { module: filterModule }),
      };
      const res = await auditApi.list(params);
      setLogs(res.logs ?? res.data ?? []);
      setTotal(res.total ?? 0);
    } catch {
      setError("Failed to load audit trail.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, dateFrom, dateTo, filterAction, filterModule]);

  const filtered = useMemo(() => {
    if (!searchQuery) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter(
      (l) =>
        (l.userName ?? l.user_name ?? l.user_email ?? "").toLowerCase().includes(q) ||
        (MODULE_LABELS[l.module] ?? l.module ?? "").toLowerCase().includes(q) ||
        (l.action ?? "").toLowerCase().includes(q) ||
        (l.recordId ?? l.record_id ?? "").toLowerCase().includes(q) ||
        JSON.stringify(l.newValue ?? l.new_value ?? "").toLowerCase().includes(q),
    );
  }, [logs, searchQuery]);

  const exportCSV = () => {
    const rows = [
      ["Timestamp", "User", "Action", "Module", "Record ID", "Details"],
      ...filtered.map((l) => [
        l.timestamp ? new Date(l.timestamp).toLocaleString("en-NG") : "—",
        l.userName ?? l.user_name ?? l.user_email ?? "—",
        l.action,
        MODULE_LABELS[l.module] ?? l.module,
        l.recordId ?? l.record_id ?? "—",
        JSON.stringify(l.newValue ?? l.new_value ?? ""),
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "audit-trail.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* ── Toolbar ── */}
      <div
        className="rounded-2xl p-4 flex flex-wrap items-center gap-3"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs font-semibold" style={{ color: C.textMuted }}>From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="p-2 text-xs rounded-xl outline-none"
            style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.textPrimary }}
          />
          <label className="text-xs font-semibold" style={{ color: C.textMuted }}>To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="p-2 text-xs rounded-xl outline-none"
            style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.textPrimary }}
          />

          {/* Action filter */}
          <select
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
            className="p-2 text-xs rounded-xl outline-none appearance-none"
            style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.textSecondary }}
          >
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a === "all" ? "All Actions" : ACTION_CFG[a]?.label ?? a}
              </option>
            ))}
          </select>

          {/* Module filter */}
          <select
            value={filterModule}
            onChange={(e) => { setFilterModule(e.target.value); setPage(1); }}
            className="p-2 text-xs rounded-xl outline-none appearance-none"
            style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.textSecondary }}
          >
            {MODULES.map((m) => (
              <option key={m} value={m}>
                {m === "all" ? "All Modules" : MODULE_LABELS[m] ?? m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={load}
            className="p-2 rounded-xl"
            style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}
          >
            <RefreshCw size={14} color={C.textSecondary} />
          </Motion.button>
          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl"
            style={{ background: C.primary, color: "#fff" }}
          >
            <Download size={14} /> Export CSV
          </Motion.button>
        </div>
      </div>

      {/* ── Table ── */}
      <div
        className="rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        {loading ? (
          <BantaHRLetterLoader />
        ) : error ? (
          <div className="text-sm" style={{ color: C.danger }}>{error}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Shield size={32} color={C.textMuted} />
            <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
              No audit logs found
            </p>
            <p className="text-xs" style={{ color: C.textMuted }}>
              Try adjusting the filters or date range.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full">
              <thead>
                <tr style={{ background: C.surfaceAlt, borderBottom: `1px solid ${C.border}` }}>
                  {["Timestamp", "User", "Action", "Module", "Details", "Record ID", ""].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
                      style={{ color: C.textMuted }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => {
                  const ac = ACTION_CFG[log.action] ?? {
                    bg: C.surfaceAlt,
                    color: C.textMuted,
                    label: log.action,
                  };
                  // Parse new_value for a one-line summary
                  let detailSummary = "—";
                  try {
                    const nv = log.newValue ?? log.new_value;
                    if (nv) {
                      const obj = typeof nv === "string" ? JSON.parse(nv) : nv;
                      const firstKey = Object.keys(obj)[0];
                      detailSummary = firstKey
                        ? `${firstKey}: ${String(obj[firstKey]).slice(0, 30)}`
                        : "—";
                    }
                  } catch {
                    detailSummary = "—";
                  }

                  return (
                    <Motion.tr
                      key={log.id ?? i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.01 }}
                      className="border-b cursor-pointer"
                      style={{ borderColor: C.border }}
                      onClick={() => setSelected(log)}
                      onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceAlt)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-4 py-3 text-xs font-mono" style={{ color: C.textSecondary }}>
                        {log.timestamp
                          ? new Date(log.timestamp).toLocaleString("en-NG", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: C.textPrimary }}>
                        {log.userName ?? log.user_name ?? log.user_email ?? "System"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-bold"
                          style={{ background: ac.bg, color: ac.color }}
                        >
                          {ac.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: C.textSecondary }}>
                        {MODULE_LABELS[log.module] ?? log.module}
                      </td>
                      <td
                        className="px-4 py-3 text-xs max-w-[180px] truncate"
                        style={{ color: C.textMuted }}
                        title={detailSummary}
                      >
                        {detailSummary}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: C.textMuted }}>
                        {(log.recordId ?? log.record_id ?? "—").slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold" style={{ color: C.primary }}>
                          View →
                        </span>
                      </td>
                    </Motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs" style={{ color: C.textMuted }}>
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Motion.button
              whileTap={{ scale: 0.95 }}
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl"
              style={{ background: page === 1 ? C.surfaceAlt : C.primary, color: page === 1 ? C.textMuted : "#fff" }}
            >
              Prev
            </Motion.button>
            <Motion.button
              whileTap={{ scale: 0.95 }}
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl"
              style={{ background: page === totalPages ? C.surfaceAlt : C.primary, color: page === totalPages ? C.textMuted : "#fff" }}
            >
              Next
            </Motion.button>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && <DiffDrawer log={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </Motion.div>
  );
}