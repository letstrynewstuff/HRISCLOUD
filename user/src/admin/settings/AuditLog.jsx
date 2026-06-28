// import { motion } from "framer-motion";
// import { SETTINGS_MOCK } from "./SettingsMockData";

// const C = {
//   bg: "#F0F2F8",
//   surface: "#FFFFFF",
//   surfaceAlt: "#F7F8FC",
//   border: "#E4E7F0",
//   primary: "#4F46E5",
//   primaryLight: "#EEF2FF",
//   success: "#10B981",
//   successLight: "#D1FAE5",
//   warning: "#F59E0B",
//   warningLight: "#FEF3C7",
//   danger: "#EF4444",
//   dangerLight: "#FEE2E2",
//   textPrimary: "#0F172A",
//   textSecondary: "#64748B",
//   textMuted: "#94A3B8",
// };

// export default function AuditLog() {
//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-8">Audit Log</h2>
//       <div
//         className="rounded-2xl border overflow-hidden"
//         style={{ background: C.surface, borderColor: C.border }}
//       >
//         <table className="w-full">
//           <thead>
//             <tr style={{ background: C.surfaceAlt }}>
//               <th className="px-6 py-4 text-left">User</th>
//               <th className="px-6 py-4 text-left">Action</th>
//               <th className="px-6 py-4 text-left">Module</th>
//               <th className="px-6 py-4 text-left">Timestamp</th>
//             </tr>
//           </thead>
//           <tbody>
//             {SETTINGS_MOCK.auditLogs.map((log, i) => (
//               <motion.tr
//                 key={i}
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 className="border-b"
//                 style={{ borderColor: C.border }}
//               >
//                 <td className="px-6 py-4 font-medium">{log.user}</td>
//                 <td className="px-6 py-4">{log.action}</td>
//                 <td className="px-6 py-4 text-sm text-primary">{log.module}</td>
//                 <td className="px-6 py-4 text-xs text-slate-500">
//                   {log.timestamp}
//                 </td>
//               </motion.tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }


// src/admin/settings/AuditLog.jsx
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { settingsApi } from "../../api/service/settingsApi";

const C = {
  bg: "#F0F2F8",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F8FC",
  border: "#E4E7F0",
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
};

const MODULE_COLORS = {
  employees:     { color: "#4F46E5", bg: "#EEF2FF" },
  payroll:       { color: "#10B981", bg: "#D1FAE5" },
  attendance:    { color: "#F59E0B", bg: "#FEF3C7" },
  settings:      { color: "#8B5CF6", bg: "#EDE9FE" },
  announcements: { color: "#06B6D4", bg: "#ECFEFF" },
  documents:     { color: "#EF4444", bg: "#FEE2E2" },
};

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }) : "—";

export default function AuditLog() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState("");
  const [page,    setPage]    = useState(1);
  const [meta,    setMeta]    = useState({ total: 0, totalPages: 1 });

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await settingsApi.getAuditLogs({ page, limit: 20, search: search || undefined });
      setLogs(res.logs ?? res.data ?? []);
      setMeta(res.meta ?? { total: 0, totalPages: 1 });
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>Audit Log</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" color={C.textMuted} />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search actions..."
              className="pl-8 pr-4 py-2 rounded-xl text-sm outline-none w-52"
              style={{ background: C.surface, border: `1.5px solid ${C.border}`, color: C.textPrimary }} />
          </div>
          <motion.button whileHover={{ scale: 1.04 }} onClick={load}
            className="p-2 rounded-xl" style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
            <RefreshCw size={14} color={C.textSecondary} className={loading ? "animate-spin" : ""} />
          </motion.button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
          style={{ background: C.dangerLight, border: `1px solid ${C.danger}33` }}>
          <AlertCircle size={14} color={C.danger} />
          <p className="text-sm" style={{ color: C.danger }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={26} className="animate-spin" color={C.primary} />
        </div>
      ) : (
        <>
          <div className="rounded-2xl border overflow-hidden" style={{ background: C.surface, borderColor: C.border }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: C.surfaceAlt }}>
                  {["User", "Action", "Module", "IP Address", "Timestamp"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide"
                      style={{ color: C.textMuted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm" style={{ color: C.textMuted }}>
                      No audit logs found.
                    </td>
                  </tr>
                ) : logs.map((log, i) => {
                  const mod = log.module?.toLowerCase();
                  const mc  = MODULE_COLORS[mod] ?? { color: C.textSecondary, bg: C.surfaceAlt };
                  return (
                    <motion.tr key={log.id ?? i}
                      initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: i * 0.02 } }}
                      style={{ borderBottom: `1px solid ${C.border}` }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceAlt)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ background: "linear-gradient(135deg,#6366F1,#06B6D4)" }}>
                            {(log.user ?? log.userName ?? "?")[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-medium" style={{ color: C.textPrimary }}>
                            {log.user ?? log.userName ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: C.textSecondary }}>{log.action ?? "—"}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
                          style={{ background: mc.bg, color: mc.color }}>
                          {log.module ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono" style={{ color: C.textMuted }}>
                        {log.ipAddress ?? log.ip ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: C.textMuted }}>
                        {fmtDateTime(log.createdAt ?? log.timestamp)}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-5">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold disabled:opacity-40"
                style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textSecondary }}>
                <ChevronLeft size={12} /> Previous
              </button>
              <span className="text-xs" style={{ color: C.textMuted }}>{page} / {meta.totalPages}</span>
              <button disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold disabled:opacity-40"
                style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textSecondary }}>
                Next <ChevronRight size={12} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}