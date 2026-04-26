import { motion } from "framer-motion";
import { Users, DollarSign, TrendingUp, Clock, Award } from "lucide-react";
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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5 },
  }),
};

export default function ReportsDashboard() {
  const d = REPORTS_MOCK.dashboard;

  return (
    <div className="space-y-6">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        {[
          {
            label: "Total Headcount",
            value: d.totalHeadcount,
            icon: Users,
            color: C.primary,
            bg: C.primaryLight,
            trend: "+12 this month",
          },
          {
            label: "Payroll Cost",
            value: `₦${(d.payrollCost / 1000000).toFixed(1)}M`,
            icon: DollarSign,
            color: C.warning,
            bg: C.warningLight,
            trend: "↑ 3.2%",
          },
          {
            label: "Turnover Rate",
            value: `${d.turnoverRate}%`,
            icon: TrendingUp,
            color: C.danger,
            bg: C.dangerLight,
            trend: "↓ 1.1%",
          },
          {
            label: "Attendance Rate",
            value: `${d.attendanceRate}%`,
            icon: Clock,
            color: C.success,
            bg: C.successLight,
            trend: "↑ 0.8%",
          },
          {
            label: "Leave Utilization",
            value: `${d.leaveUtilization}%`,
            icon: Award,
            color: C.accent,
            bg: C.accentLight,
            trend: "On track",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            custom={i}
            whileHover={{ y: -4 }}
          >
            <div
              className="rounded-2xl p-6 border shadow-sm"
              style={{ background: C.surface, borderColor: C.border }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: stat.bg }}
                >
                  <stat.icon size={22} color={stat.color} />
                </div>
                <div>
                  <p
                    className="text-3xl font-bold"
                    style={{
                      color: C.textPrimary,
                      fontFamily: "Sora,sans-serif",
                    }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-sm mt-1" style={{ color: C.textMuted }}>
                    {stat.label}
                  </p>
                  <p className="text-xs mt-2" style={{ color: stat.color }}>
                    {stat.trend}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="rounded-2xl p-6 border"
          style={{ background: C.surface, borderColor: C.border }}
        >
          <h3 className="font-semibold mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              "Headcount Report",
              "Payroll Cost Analysis",
              "Attendance Trends",
              "Statutory Compliance",
            ].map((link, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border hover:border-primary cursor-pointer transition-all"
                style={{ borderColor: C.border }}
              >
                <p className="font-medium text-sm">{link}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="rounded-2xl p-6 border"
          style={{ background: C.surface, borderColor: C.border }}
        >
          <h3 className="font-semibold mb-4">Key Insights</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3">
              <span className="text-emerald-600">↑</span> Engineering department
              grew by 12 new hires this quarter
            </li>
            <li className="flex gap-3">
              <span className="text-amber-600">⚠️</span> Sales turnover rate
              increased to 13.7%
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-600">✓</span> Payroll processed
              successfully for March 2026
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
