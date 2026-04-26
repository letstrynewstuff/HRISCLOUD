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

export default function Integrations() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-8">Integrations</h2>
      {SETTINGS_MOCK.integrations.map((int, i) => (
        <motion.div
          key={i}
          whileHover={{ y: -2 }}
          className="rounded-2xl border p-6 flex justify-between items-center"
          style={{ background: C.surface, borderColor: C.border }}
        >
          <div>
            <p className="font-semibold">{int.name}</p>
            <p className="text-xs text-slate-500">
              Last synced: {int.lastSync || "Never"}
            </p>
          </div>
          <motion.button
            className={`px-6 py-2.5 rounded-xl text-sm font-medium ${int.status === "Connected" ? "bg-emerald-100 text-emerald-700" : "bg-primary text-white"}`}
          >
            {int.status === "Connected" ? "Disconnect" : "Connect"}
          </motion.button>
        </motion.div>
      ))}
    </div>
  );
}
