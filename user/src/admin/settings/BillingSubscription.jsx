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
//   textSecondary: "#5F6D7E",
//   textMuted: "#94A3B8",
// };

// export default function BillingSubscription() {
//   const b = SETTINGS_MOCK.billing;

//   return (
//     <div className="max-w-lg">
//       <h2 className="text-2xl mb-8">Billing & Subscription</h2>

//       <div
//         className="rounded-2xl border p-8"
//         style={{ background: C.surface, borderColor: C.border }}
//       >
//         <div className="flex justify-between items-start">
//           <div>
//             <p className="text-sm text-slate-500">Current Plan</p>
//             <p className="text-4xl font-bold mt-1">{b.plan}</p>
//           </div>
//           <span className="px-5 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
//             Active
//           </span>
//         </div>

//         <div className="mt-10 grid grid-cols-2 gap-8 text-sm">
//           <div>
//             <p className="text-slate-500">Employees</p>
//             <p className="text-3xl font-semibold mt-1">
//               {b.employees} / {b.maxEmployees}
//             </p>
//           </div>
//           <div>
//             <p className="text-slate-500">Monthly Cost</p>
//             <p className="text-3xl font-semibold mt-1">
//               ₦{(b.monthlyCost / 1000).toFixed(0)}K
//             </p>
//           </div>
//         </div>

//         <motion.button
//           className="mt-12 w-full py-4 rounded-full text-white font-semibold"
//           style={{ background: C.primary }}
//         >
//           Upgrade Plan
//         </motion.button>
//       </div>
//     </div>
//   );
// }


// src/admin/settings/BillingSubscription.jsx
import { useState, useEffect } from "react";
import C from "../../styles/colors";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, CreditCard, Users, Calendar, CheckCircle2 } from "lucide-react";
import { settingsApi } from "../../api/service/settingsApi";


const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "—";

const fmtCurrency = (n) =>
  n != null ? `₦${Number(n).toLocaleString("en-NG")}` : "—";

export default function BillingSubscription() {
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    settingsApi.getBilling()
      .then((d) => setBilling(d.billing ?? d))
      .catch((err) => setError(err?.response?.data?.message ?? "Failed to load billing info."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={26} className="animate-spin" color={C.primary} />
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: C.dangerLight, border: `1px solid ${C.danger}33` }}>
      <AlertCircle size={14} color={C.danger} />
      <p className="text-sm" style={{ color: C.danger }}>{error}</p>
    </div>
  );

  const usagePct = billing?.maxEmployees
    ? Math.min(Math.round((billing.employees / billing.maxEmployees) * 100), 100)
    : 0;

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl mb-8" style={{ color: C.textPrimary }}>
        Billing & Subscription
      </h2>

      {/* Plan card */}
      <div className="rounded-2xl p-6 mb-5"
        style={{ background: "linear-gradient(135deg,#1E1B4B,#312E81,#3730A3)", color: "#fff" }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm text-indigo-300 mb-1">Current Plan</p>
            <p className="text-3xl font-bold">
              {billing?.plan ?? "—"}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: billing?.status === "active" ? C.successLight : C.warningLight,
                     color:      billing?.status === "active" ? C.success      : C.warning }}>
            {(billing?.status ?? "active").charAt(0).toUpperCase() + (billing?.status ?? "active").slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Users,    label: "Employees", value: `${billing?.employees ?? 0} / ${billing?.maxEmployees ?? "∞"}` },
            { icon: CreditCard, label: "Monthly",  value: fmtCurrency(billing?.monthlyCost) },
            { icon: Calendar, label: "Renews",    value: fmtDate(billing?.renewsAt ?? billing?.nextBillingDate) },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-3 bg-white/10 backdrop-blur-sm">
              <s.icon size={14} color="rgba(255,255,255,0.6)" className="mb-1.5" />
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-[10px] text-indigo-300">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Employee usage bar */}
      {billing?.maxEmployees && (
        <div className="rounded-2xl p-5 mb-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: C.textMuted }}>Employee Seats Used</p>
            <span className="text-xs font-bold" style={{ color: usagePct >= 90 ? C.danger : C.primary }}>
              {usagePct}%
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: C.surfaceAlt }}>
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${usagePct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: usagePct >= 90 ? C.danger : C.primary }} />
          </div>
          <p className="text-xs mt-2" style={{ color: C.textMuted }}>
            {billing.employees} of {billing.maxEmployees} seats used
          </p>
        </div>
      )}

      {/* Features */}
      {Array.isArray(billing?.features) && billing.features.length > 0 && (
        <div className="rounded-2xl p-5 mb-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: C.textMuted }}>Plan Features</p>
          <div className="space-y-2">
            {billing.features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm" style={{ color: C.textSecondary }}>
                <CheckCircle2 size={14} color={C.success} />
                {f}
              </div>
            ))}
          </div>
        </div>
      )}

      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        className="w-full py-3.5 rounded-full text-sm font-semibold text-white"
        style={{ background: C.primary }}>
        Upgrade Plan
      </motion.button>
    </div>
  );
}