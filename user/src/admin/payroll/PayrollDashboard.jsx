// import { motion } from "framer-motion";
// import { DollarSign, TrendingUp, Users, Calendar } from "lucide-react";
// import { PAYROLL_MOCK } from "./PayrollMockData";

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

// const fadeUp = {
//   hidden: { opacity: 0, y: 20 },
//   visible: (i = 0) => ({
//     opacity: 1,
//     y: 0,
//     transition: { delay: i * 0.06, duration: 0.5 },
//   }),
// };

// export default function PayrollDashboard() {
//   const d = PAYROLL_MOCK.dashboard;
//   const netPay = d.totalNet;
//   const grossPay = d.totalGross;

//   return (
//     <div className="space-y-6">
//       <motion.div
//         variants={fadeUp}
//         initial="hidden"
//         animate="visible"
//         className="grid grid-cols-2 md:grid-cols-4 gap-4"
//       >
//         {[
//           {
//             label: "Total Gross Payroll",
//             value: `₦${(grossPay / 1000000).toFixed(1)}M`,
//             icon: DollarSign,
//             color: C.primary,
//             bg: C.primaryLight,
//           },
//           {
//             label: "Total Deductions",
//             value: `₦${(d.totalDeductions / 1000000).toFixed(1)}M`,
//             icon: TrendingUp,
//             color: C.danger,
//             bg: C.dangerLight,
//           },
//           {
//             label: "Total Net Pay",
//             value: `₦${(netPay / 1000000).toFixed(1)}M`,
//             icon: DollarSign,
//             color: C.success,
//             bg: C.successLight,
//           },
//           {
//             label: "Employees Paid",
//             value: d.employees,
//             icon: Users,
//             color: C.accent,
//             bg: C.accentLight,
//           },
//         ].map((stat, i) => (
//           <motion.div
//             key={i}
//             variants={fadeUp}
//             custom={i}
//             whileHover={{ y: -4 }}
//           >
//             <div
//               className="rounded-2xl p-6 border shadow-sm"
//               style={{ background: C.surface, borderColor: C.border }}
//             >
//               <div className="flex items-center gap-4">
//                 <div
//                   className="w-11 h-11 rounded-xl flex items-center justify-center"
//                   style={{ background: stat.bg }}
//                 >
//                   <stat.icon size={22} color={stat.color} />
//                 </div>
//                 <div>
//                   <p
//                     className="text-3xl font-bold"
//                     style={{
//                       color: C.textPrimary,
//                       fontFamily: "Sora,sans-serif",
//                     }}
//                   >
//                     {stat.value}
//                   </p>
//                   <p className="text-sm mt-1" style={{ color: C.textMuted }}>
//                     {stat.label}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         ))}
//       </motion.div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <motion.div
//           variants={fadeUp}
//           initial="hidden"
//           animate="visible"
//           custom={1}
//           className="rounded-2xl p-6 border"
//           style={{ background: C.surface, borderColor: C.border }}
//         >
//           <h3 className="font-semibold mb-4">Recent Payroll Runs</h3>
//           {PAYROLL_MOCK.recentRuns.map((run, i) => (
//             <div
//               key={i}
//               className="flex justify-between items-center py-3 border-b last:border-0"
//               style={{ borderColor: C.border }}
//             >
//               <div>
//                 <p className="font-medium">{run.period}</p>
//                 <p className="text-xs" style={{ color: C.textMuted }}>
//                   {run.date}
//                 </p>
//               </div>
//               <div className="text-right">
//                 <p className="font-semibold">
//                   ₦{(run.gross / 1000000).toFixed(1)}M
//                 </p>
//                 <span
//                   className={`text-xs px-3 py-0.5 rounded-full ${run.status === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
//                 >
//                   {run.status}
//                 </span>
//               </div>
//             </div>
//           ))}
//         </motion.div>

//         <motion.div
//           variants={fadeUp}
//           initial="hidden"
//           animate="visible"
//           custom={2}
//           className="rounded-2xl p-6 border"
//           style={{ background: C.surface, borderColor: C.border }}
//         >
//           <div className="flex justify-between mb-6">
//             <h3 className="font-semibold">Current Cycle Status</h3>
//             <span className="px-4 py-1 text-xs rounded-full bg-amber-100 text-amber-700">
//               Draft
//             </span>
//           </div>
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             className="w-full py-4 rounded-xl text-lg font-semibold text-white"
//             style={{ background: C.primary }}
//           >
//             Run March 2026 Payroll
//           </motion.button>
//         </motion.div>
//       </div>
//     </div>
//   );
// }


// src/admin/payroll/PayrollDashboard.jsx
// Full API-connected dashboard with KPIs, recent runs, and payroll notifications.
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, Users, AlertCircle,
  Clock, CheckCircle2, Bell, RefreshCw, Loader2, ArrowRight,
} from "lucide-react";
import { usePayroll } from "../../components/PayrollContext";
import { C } from "../employeemanagement/sharedData";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5 } }),
};

const STATUS_STYLE = {
  paid:       { bg: "#D1FAE5", color: "#065F46", label: "Paid" },
  approved:   { bg: "#EDE9FE", color: "#5B21B6", label: "Approved" },
  processing: { bg: "#FEF3C7", color: "#92400E", label: "Processing" },
  draft:      { bg: "#F1F5F9", color: "#475569", label: "Draft" },
  cancelled:  { bg: "#FEE2E2", color: "#991B1B", label: "Cancelled" },
};

const N_ICON = {
  pending_run: <Clock size={14} />,
  approved:    <CheckCircle2 size={14} />,
  error:       <AlertCircle size={14} />,
  info:        <Bell size={14} />,
};

export default function PayrollDashboard({ onRunPayroll }) {
  const { dashboard, loadingDash, error, fetchDashboard } = usePayroll();

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loadingDash) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={30} color={C.primary} className="animate-spin" />
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: C.dangerLight, border: `1px solid ${C.danger}33` }}>
        <AlertCircle size={16} color={C.danger} />
        <p className="text-sm font-semibold flex-1" style={{ color: C.danger }}>{error}</p>
        <button onClick={fetchDashboard} className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg" style={{ background: C.danger, color: "#fff", border: "none", cursor: "pointer" }}>
          <RefreshCw size={11} /> Retry
        </button>
      </div>
    );
  }

  const d = dashboard ?? {};
  const kpis = [
    { label: "Total Gross Payroll", value: `₦${((d.totalGross ?? 0) / 1_000_000).toFixed(1)}M`, icon: DollarSign, color: C.primary, bg: C.primaryLight },
    { label: "Total Deductions",    value: `₦${((d.totalDeductions ?? 0) / 1_000_000).toFixed(1)}M`, icon: TrendingUp, color: C.danger, bg: C.dangerLight },
    { label: "Total Net Pay",       value: `₦${((d.totalNet ?? 0) / 1_000_000).toFixed(1)}M`, icon: DollarSign, color: C.success, bg: C.successLight },
    { label: "Employees Paid",      value: d.employeeCount ?? 0, icon: Users, color: "#06B6D4", bg: "#ECFEFF" },
  ];

  const notifications = d.notifications ?? [];
  const recentRuns = d.recentRuns ?? [];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((stat, i) => (
          <motion.div key={i} variants={fadeUp} custom={i} whileHover={{ y: -4 }}>
            <div className="rounded-2xl p-6 border shadow-sm" style={{ background: C.surface, borderColor: C.border }}>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                  <stat.icon size={22} color={stat.color} />
                </div>
                <div>
                  <p className="text-3xl font-bold" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>{stat.value}</p>
                  <p className="text-sm mt-1" style={{ color: C.textMuted }}>{stat.label}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Runs */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="lg:col-span-2 rounded-2xl p-6 border" style={{ background: C.surface, borderColor: C.border }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-base" style={{ color: C.textPrimary }}>Recent Payroll Runs</h3>
            <button onClick={fetchDashboard} className="flex items-center gap-1 text-xs" style={{ color: C.textMuted, background: "none", border: "none", cursor: "pointer" }}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {recentRuns.length === 0 ? (
            <div className="py-10 text-center">
              <DollarSign size={32} color={C.textMuted} className="mx-auto mb-2" />
              <p className="text-sm" style={{ color: C.textMuted }}>No payroll runs yet.</p>
              <motion.button whileHover={{ scale: 1.02 }} onClick={onRunPayroll} className="mt-4 flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl mx-auto" style={{ background: C.primary, border: "none", cursor: "pointer" }}>
                <ArrowRight size={14} /> Run First Payroll
              </motion.button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRuns.map((run, i) => {
                const st = STATUS_STYLE[run.status] ?? STATUS_STYLE.draft;
                const period = run.period ?? `${run.month}/${run.year}`;
                return (
                  <div key={i} className="flex justify-between items-center py-3 border-b last:border-0" style={{ borderColor: C.border }}>
                    <div>
                      <p className="font-medium text-sm" style={{ color: C.textPrimary }}>{period}</p>
                      <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                        {run.mode === "assisted" ? "Assisted" : "Manual"} · {run.employee_count ?? 0} employees
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm" style={{ color: C.textPrimary }}>
                        ₦{((run.total_gross ?? 0) / 1_000_000).toFixed(1)}M
                      </p>
                      <span className="text-[11px] px-3 py-0.5 rounded-full font-semibold" style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Notifications + Pending Run */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="space-y-4">
          {/* Pending Run Card */}
          {d.pendingRun ? (
            <div className="rounded-2xl p-5 border" style={{ background: C.warningLight, borderColor: `${C.warning}44` }}>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} color={C.warning} />
                <p className="font-semibold text-sm" style={{ color: C.textPrimary }}>Pending Run</p>
              </div>
              <p className="text-sm mb-1" style={{ color: C.textSecondary }}>
                {d.pendingRun.period} payroll is in <strong>{d.pendingRun.status}</strong> state.
              </p>
              <motion.button whileHover={{ scale: 1.02 }} onClick={onRunPayroll} className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2" style={{ background: C.warning, border: "none", cursor: "pointer" }}>
                Continue Run <ArrowRight size={13} />
              </motion.button>
            </div>
          ) : (
            <div className="rounded-2xl p-5 border" style={{ background: C.surface, borderColor: C.border }}>
              <p className="font-semibold text-sm mb-1" style={{ color: C.textPrimary }}>Current Cycle</p>
              <p className="text-xs mb-3" style={{ color: C.textMuted }}>No payroll run in progress.</p>
              <motion.button whileHover={{ scale: 1.02 }} onClick={onRunPayroll} className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2" style={{ background: C.primary, border: "none", cursor: "pointer" }}>
                <ArrowRight size={13} /> Start Payroll Run
              </motion.button>
            </div>
          )}

          {/* Notifications */}
          <div className="rounded-2xl p-5 border" style={{ background: C.surface, borderColor: C.border }}>
            <div className="flex items-center gap-2 mb-4">
              <Bell size={15} color={C.primary} />
              <p className="font-semibold text-sm" style={{ color: C.textPrimary }}>Payroll Alerts</p>
              {notifications.length > 0 && (
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: C.danger, color: "#fff" }}>
                  {notifications.length}
                </span>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: C.textMuted }}>All clear — no alerts.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: C.surfaceAlt }}>
                    <span style={{ color: n.type === "error" ? C.danger : n.type === "approved" ? C.success : C.warning }}>
                      {N_ICON[n.type] ?? N_ICON.info}
                    </span>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>{n.title}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}