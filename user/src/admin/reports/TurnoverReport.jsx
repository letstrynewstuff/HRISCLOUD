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

export default function TurnoverReport() {
  const data = REPORTS_MOCK.turnover;

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl p-8 border text-center"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <p className="text-7xl font-bold text-red-600">{data.rate}%</p>
        <p className="text-xl mt-4">Annual Turnover Rate</p>
        <p className="text-sm text-slate-500 mt-2">
          {data.exits} employees exited this year
        </p>
      </div>

      <div
        className="rounded-2xl border p-6"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <h3 className="font-semibold mb-6">Exits by Reason</h3>
        {data.byReason.map((item, i) => (
          <div
            key={i}
            className="flex justify-between py-4 border-b last:border-0"
            style={{ borderColor: C.border }}
          >
            <span>{item.reason}</span>
            <span className="font-semibold">{item.count}</span>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-slate-500">
        Average tenure before exit:{" "}
        <span className="font-medium text-slate-700">
          {data.avgTenure} years
        </span>
      </div>
    </div>
  );
}
