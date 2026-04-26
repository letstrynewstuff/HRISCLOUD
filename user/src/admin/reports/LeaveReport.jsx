import { motion } from "framer-motion";
import { REPORTS_MOCK } from "./ReportsMockData";


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

export default function LeaveReport() {
  const data = REPORTS_MOCK.leave;

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl border p-6"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <h3 className="font-semibold mb-6">Leave by Type</h3>
        {data.byType.map((item, i) => (
          <div
            key={i}
            className="flex justify-between items-center py-4 border-b last:border-0"
            style={{ borderColor: C.border }}
          >
            <span className="font-medium">{item.type} Leave</span>
            <span className="font-semibold">{item.taken} days</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="rounded-2xl p-8 border text-center"
          style={{ background: C.surface, borderColor: C.border }}
        >
          <p className="text-5xl font-bold">{data.totalTaken}</p>
          <p className="text-sm mt-3 text-slate-500">Total Leave Days Taken</p>
        </div>
        <div
          className="rounded-2xl p-8 border text-center"
          style={{ background: C.surface, borderColor: C.border }}
        >
          <p className="text-5xl font-bold text-amber-600">
            {data.entitlementUsed}%
          </p>
          <p className="text-sm mt-3 text-slate-500">Entitlement Utilization</p>
        </div>
      </div>
    </div>
  );
}
