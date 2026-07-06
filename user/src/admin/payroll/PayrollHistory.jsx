

// src/admin/payroll/PayrollHistory.jsx
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, AlertCircle, Download, RefreshCw,
  FileText, CheckCircle2, Clock, XCircle, ChevronLeft, ChevronRight,
} from "lucide-react";
import { listRuns, getPaymentFile } from "../../api/service/payrollApi";
import { C } from "../employeemanagement/sharedData";

// ─── Status config — covers every possible DB value ───────────
const STATUS = {
  paid:       { bg: "#D1FAE5", color: "#065F46",  label: "Paid",       icon: CheckCircle2 },
  approved:   { bg: "#EDE9FE", color: "#5B21B6",  label: "Approved",   icon: CheckCircle2 },
  processed:  { bg: "#DBEAFE", color: "#1D4ED8",  label: "Processed",  icon: CheckCircle2 },
  processing: { bg: "#FEF3C7", color: "#92400E",  label: "Processing", icon: Clock        },
  draft:      { bg: "#F1F5F9", color: "#475569",  label: "Draft",      icon: Clock        },
  cancelled:  { bg: "#FEE2E2", color: "#991B1B",  label: "Cancelled",  icon: XCircle      },
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Safely format a number as ₦ — handles null/undefined/string
const fmt = (n) => {
  const v = Number(n ?? 0);
  if (v === 0) return "₦0";
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000)     return `₦${(v / 1_000).toFixed(1)}K`;
  return `₦${v.toLocaleString("en-NG")}`;
};

// Read a field that might be camelCase or snake_case
const field = (obj, camel, snake) => obj?.[camel] ?? obj?.[snake] ?? 0;

const PAGE_SIZE = 20;

export default function PayrollHistory() {
  const [runs,        setRuns]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [downloading, setDownloading] = useState(null); // run.id being downloaded
  const [page,        setPage]        = useState(1);
  const [total,       setTotal]       = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listRuns({ page, limit: PAGE_SIZE });
      // listRuns returns { data: [...], total: N } or { data: [...], meta: { total } }
      setRuns(res.data ?? []);
      setTotal(res.total ?? res.meta?.total ?? res.data?.length ?? 0);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load payroll history.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleDownload = async (run) => {
    setDownloading(run.id);
    setError(null);
    try {
      const blob = await getPaymentFile(run.id);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      // Use period string from DB if available, otherwise build from month/year
      const periodSlug = run.period
        ? run.period.replace(/\s+/g, "-")
        : `${run.year}-${String(field(run, "month", "month")).padStart(2, "0")}`;
      a.download = `Payroll-${periodSlug}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(`Download failed for this run. Ensure the run has been processed.`);
    } finally {
      setDownloading(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">

      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-base" style={{ color: C.textPrimary }}>Payroll History</h2>
          <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
            {total} total run{total !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
          style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textSecondary, cursor: "pointer" }}
        >
          <RefreshCw size={11} /> Refresh
        </button>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl"
            style={{ background: C.dangerLight, border: `1px solid ${C.danger}33` }}
          >
            <AlertCircle size={14} color={C.danger} />
            <p className="text-xs flex-1" style={{ color: C.danger }}>{error}</p>
            <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: C.surface, borderColor: C.border }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 700 }}>
            <thead>
              <tr style={{ background: C.surfaceAlt }}>
                {["Period", "Employees", "Gross Payroll", "Total Deductions", "Net Pay", "Status", "Date", "Export"].map((h) => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide"
                    style={{ color: C.textMuted }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Loader2 size={22} color={C.primary} className="animate-spin mx-auto" />
                  </td>
                </tr>
              ) : runs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <FileText size={32} color={C.textMuted} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm" style={{ color: C.textMuted }}>No payroll runs found.</p>
                    <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                      Run your first payroll to see it here.
                    </p>
                  </td>
                </tr>
              ) : (
                runs.map((run, i) => {
                  const st = STATUS[run.status] ?? STATUS.draft;
                  const StatusIcon = st.icon;

                  // Read totals — backend returns snake_case from fmtRun camelCase
                  const gross      = field(run, "totalGross",      "total_gross");
                  const deductions = field(run, "totalDeductions",  "total_deductions");
                  const net        = field(run, "totalNet",         "total_net");
                  const empCount   = field(run, "employeeCount",    "employee_count");
                  const month      = run.month ?? 1;
                  const year       = run.year  ?? new Date().getFullYear();

                  // Runs are downloadable once processed/approved/paid
                  const canDownload = ["processed", "approved", "paid"].includes(run.status);

                  return (
                    <motion.tr key={run.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b"
                      style={{ borderColor: C.border }}
                      onMouseEnter={(e) => e.currentTarget.style.background = C.surfaceAlt}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      {/* Period */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-sm" style={{ color: C.textPrimary }}>
                          {run.period ?? `${MONTHS[month - 1]} ${year}`}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>
                          {run.notes ? run.notes.slice(0, 30) + (run.notes.length > 30 ? "…" : "") : "No notes"}
                        </p>
                      </td>

                      {/* Employees */}
                      <td className="px-5 py-4 text-sm" style={{ color: C.textSecondary }}>
                        {empCount > 0 ? `${empCount} emp.` : "—"}
                      </td>

                      {/* Gross */}
                      <td className="px-5 py-4 text-sm font-semibold" style={{ color: C.textPrimary }}>
                        {gross > 0 ? fmt(gross) : (
                          <span className="text-xs" style={{ color: C.textMuted }}>Not processed</span>
                        )}
                      </td>

                      {/* Deductions */}
                      <td className="px-5 py-4 text-sm" style={{ color: C.danger }}>
                        {deductions > 0 ? fmt(deductions) : "—"}
                      </td>

                      {/* Net Pay */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold" style={{ color: net > 0 ? C.success : C.textMuted }}>
                          {net > 0 ? fmt(net) : "—"}
                        </p>
                      </td>

                      {/* Status badge */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full"
                          style={{ background: st.bg, color: st.color }}>
                          <StatusIcon size={10} />
                          {st.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-xs" style={{ color: C.textMuted }}>
                        {run.created_at
                          ? new Date(run.created_at).toLocaleDateString("en-GB", {
                              day: "numeric", month: "short", year: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Export button — available once processed */}
                      <td className="px-5 py-4">
                        {canDownload ? (
                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => handleDownload(run)}
                            disabled={downloading === run.id}
                            title="Download bank transfer CSV"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                            style={{
                              background: C.primaryLight,
                              color: C.primary,
                              border: `1px solid ${C.primary}30`,
                              cursor: downloading === run.id ? "wait" : "pointer",
                              opacity: downloading === run.id ? 0.7 : 1,
                            }}
                          >
                            {downloading === run.id
                              ? <Loader2 size={11} className="animate-spin" />
                              : <Download size={11} />
                            }
                            CSV
                          </motion.button>
                        ) : (
                          <span className="text-[11px]" style={{ color: C.textMuted }}>
                            {run.status === "draft" ? "Process first" : "—"}
                          </span>
                        )}
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
          <div className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: `1px solid ${C.border}`, background: C.surfaceAlt }}>
            <p className="text-xs" style={{ color: C.textMuted }}>
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: page === 1 ? C.border : C.surface,
                  border: `1px solid ${C.border}`,
                  cursor: page === 1 ? "not-allowed" : "pointer",
                  color: C.textSecondary,
                }}
              >
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: page === totalPages ? C.border : C.surface,
                  border: `1px solid ${C.border}`,
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                  color: C.textSecondary,
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(STATUS).map(([key, s]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            <span className="text-[11px]" style={{ color: C.textMuted }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}