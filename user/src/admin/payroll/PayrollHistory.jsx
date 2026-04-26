// src/admin/payroll/PayrollHistory.jsx
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, Download, Eye, RefreshCw } from "lucide-react";
import { listRuns, getPaymentFile } from "../../api/service/payrollApi";
import { C } from "../employeemanagement/sharedData";

const STATUS = {
  paid: { bg: "#D1FAE5", color: "#065F46", label: "Paid" },
  approved: { bg: "#EDE9FE", color: "#5B21B6", label: "Approved" },
  processing: { bg: "#FEF3C7", color: "#92400E", label: "Processing" },
  draft: { bg: "#F1F5F9", color: "#475569", label: "Draft" },
  cancelled: { bg: "#FEE2E2", color: "#991B1B", label: "Cancelled" },
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function PayrollHistory() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listRuns({ page, limit: 20 });
      setRuns(res.data ?? []);
      setTotal(res.meta?.total ?? 0);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load history.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleDownload = async (run) => {
    setDownloading(run.id);
    try {
      const blob = await getPaymentFile(run.id, "csv");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payroll-${run.year}-${String(run.month).padStart(2, "0")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError("Download failed.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: C.textMuted }}>
          {total} payroll runs total
        </p>
        <button
          onClick={fetch}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs"
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            color: C.textSecondary,
            cursor: "pointer",
          }}
        >
          <RefreshCw size={11} /> Refresh
        </button>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 p-3 rounded-xl"
          style={{
            background: C.dangerLight,
            border: `1px solid ${C.danger}33`,
          }}
        >
          <AlertCircle size={14} color={C.danger} />
          <p className="text-xs flex-1" style={{ color: C.danger }}>
            {error}
          </p>
        </div>
      )}

      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: C.surfaceAlt }}>
              {[
                "Period",
                "Mode",
                "Employees",
                "Gross",
                "Net Pay",
                "Status",
                "Date",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-4 text-left text-xs font-bold uppercase"
                  style={{ color: C.textMuted }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <Loader2
                    size={22}
                    color={C.primary}
                    className="animate-spin mx-auto"
                  />
                </td>
              </tr>
            ) : runs.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 text-center text-sm"
                  style={{ color: C.textMuted }}
                >
                  No payroll runs found.
                </td>
              </tr>
            ) : (
              runs.map((run, i) => {
                const st = STATUS[run.status] ?? STATUS.draft;
                return (
                  <motion.tr
                    key={run.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b hover:bg-slate-50"
                    style={{ borderColor: C.border }}
                  >
                    <td
                      className="px-5 py-4 font-medium text-sm"
                      style={{ color: C.textPrimary }}
                    >
                      {MONTHS[(run.month ?? 1) - 1]} {run.year}
                    </td>
                    <td
                      className="px-5 py-4 text-xs capitalize"
                      style={{ color: C.textSecondary }}
                    >
                      {run.mode}
                    </td>
                    <td
                      className="px-5 py-4 text-sm"
                      style={{ color: C.textSecondary }}
                    >
                      {run.employee_count ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      ₦{((run.total_gross ?? 0) / 1_000_000).toFixed(1)}M
                    </td>
                    <td
                      className="px-5 py-4 text-sm font-semibold"
                      style={{ color: C.success }}
                    >
                      ₦{((run.total_net ?? 0) / 1_000_000).toFixed(1)}M
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="px-3 py-1 text-[11px] font-bold rounded-full"
                        style={{ background: st.bg, color: st.color }}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td
                      className="px-5 py-4 text-xs"
                      style={{ color: C.textMuted }}
                    >
                      {run.created_at
                        ? new Date(run.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      {run.mode === "assisted" && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleDownload(run)}
                          disabled={downloading === run.id}
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{
                            background: C.primaryLight,
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          {downloading === run.id ? (
                            <Loader2
                              size={11}
                              className="animate-spin"
                              color={C.primary}
                            />
                          ) : (
                            <Download size={11} color={C.primary} />
                          )}
                        </motion.button>
                      )}
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
