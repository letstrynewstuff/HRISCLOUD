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

export default function HeadcountReport() {
  const data = REPORTS_MOCK.headcount;

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl border p-6"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <h3 className="font-semibold mb-6">Headcount by Department</h3>
        <div className="space-y-4">
          {data.byDepartment.map((dept, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: C.surfaceAlt }}
            >
              <div className="font-medium">{dept.dept}</div>
              <div className="flex items-center gap-8">
                <div>
                  <span className="font-semibold">{dept.count}</span>{" "}
                  <span className="text-xs text-slate-500">employees</span>
                </div>
                <div className="text-emerald-600">+{dept.newHires} new</div>
                <div className="text-red-600">-{dept.exits} exits</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="rounded-2xl border p-6"
          style={{ background: C.surface, borderColor: C.border }}
        >
          <h3 className="font-semibold mb-4">Gender Distribution</h3>
          <div className="flex justify-center gap-12 mt-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600">
                {data.gender.male}
              </div>
              <p className="text-sm mt-2">Male</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-pink-600">
                {data.gender.female}
              </div>
              <p className="text-sm mt-2">Female</p>
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl border p-6"
          style={{ background: C.surface, borderColor: C.border }}
        >
          <h3 className="font-semibold mb-4">Movement This Quarter</h3>
          <div className="text-center py-10">
            <div className="text-6xl font-bold text-emerald-600">+29</div>
            <p className="text-slate-500 mt-2">Net headcount growth</p>
          </div>
        </div>
      </div>
    </div>
  );
}
