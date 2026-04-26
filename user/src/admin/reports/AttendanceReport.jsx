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

export default function AttendanceReport() {
  const data = REPORTS_MOCK.attendance;

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl border p-6"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <h3 className="font-semibold mb-4">Department Attendance Rates</h3>
        {data.departmentRates.map((dept, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="mb-5"
          >
            <div className="flex justify-between text-sm mb-1.5">
              <span>{dept.dept}</span>
              <span className="font-medium">{dept.rate}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dept.rate}%` }}
                className="h-full bg-primary"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div
        className="rounded-2xl p-8 border text-center"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <p className="text-6xl font-bold text-emerald-600">{data.rate}%</p>
        <p className="text-lg mt-2">Overall Attendance Rate</p>
        <p className="text-xs text-slate-500 mt-6">
          This month • 14 late arrivals • 23 absences
        </p>
      </div>
    </div>
  );
}
