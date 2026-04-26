import { motion } from "framer-motion";
import { SETTINGS_MOCK } from "./SettingsMockData";

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

export default function BillingSubscription() {
  const b = SETTINGS_MOCK.billing;

  return (
    <div className="max-w-lg">
      <h2 className="text-2xl font-bold mb-8">Billing & Subscription</h2>

      <div
        className="rounded-2xl border p-8"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-slate-500">Current Plan</p>
            <p className="text-4xl font-bold mt-1">{b.plan}</p>
          </div>
          <span className="px-5 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
            Active
          </span>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="text-slate-500">Employees</p>
            <p className="text-3xl font-semibold mt-1">
              {b.employees} / {b.maxEmployees}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Monthly Cost</p>
            <p className="text-3xl font-semibold mt-1">
              ₦{(b.monthlyCost / 1000).toFixed(0)}K
            </p>
          </div>
        </div>

        <motion.button
          className="mt-12 w-full py-4 rounded-2xl text-white font-semibold"
          style={{ background: C.primary }}
        >
          Upgrade Plan
        </motion.button>
      </div>
    </div>
  );
}
