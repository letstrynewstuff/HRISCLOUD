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

export default function AuditLog() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-8">Audit Log</h2>
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: C.surfaceAlt }}>
              <th className="px-6 py-4 text-left">User</th>
              <th className="px-6 py-4 text-left">Action</th>
              <th className="px-6 py-4 text-left">Module</th>
              <th className="px-6 py-4 text-left">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {SETTINGS_MOCK.auditLogs.map((log, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b"
                style={{ borderColor: C.border }}
              >
                <td className="px-6 py-4 font-medium">{log.user}</td>
                <td className="px-6 py-4">{log.action}</td>
                <td className="px-6 py-4 text-sm text-primary">{log.module}</td>
                <td className="px-6 py-4 text-xs text-slate-500">
                  {log.timestamp}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
