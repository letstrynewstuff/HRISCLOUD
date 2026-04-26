// src/admin/training/TrainingDashboard.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { getTrainingDashboard } from "../../api/service/trainingApi";
import { C } from "../employeemanagement/sharedData";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function TrainingDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTrainingDashboard()
      .then((res) => setData(res.data))
      .catch((e) =>
        setError(e?.response?.data?.message ?? "Failed to load dashboard."),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} color={C.primary} className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-center gap-3 p-4 rounded-2xl"
        style={{ background: C.dangerLight, border: `1px solid ${C.danger}33` }}
      >
        <AlertCircle size={16} color={C.danger} />
        <p className="text-sm font-semibold" style={{ color: C.danger }}>
          {error}
        </p>
      </div>
    );
  }

  const kpis = [
    {
      label: "Completion Rate",
      value: `${data.completionRate}%`,
      icon: TrendingUp,
      color: C.success,
      bg: C.successLight,
    },
    {
      label: "Upcoming Trainings",
      value: data.upcomingCount,
      icon: Calendar,
      color: C.primary,
      bg: C.primaryLight,
    },
    {
      label: "Employees Trained",
      value: data.employeesTrained,
      icon: Users,
      color: "#06B6D4",
      bg: "#ECFEFF",
    },
    {
      label: "Total Spend (YTD)",
      value: `₦${(data.budgetSpent / 1_000_000).toFixed(1)}M`,
      icon: DollarSign,
      color: C.warning,
      bg: C.warningLight,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {kpis.map((stat, i) => (
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
                  <p className="text-sm" style={{ color: C.textMuted }}>
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Upcoming Trainings */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={2}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className="font-semibold text-lg"
            style={{ color: C.textPrimary }}
          >
            Upcoming Trainings
          </h3>
          <span
            className="text-xs px-3 py-1 rounded-full"
            style={{ background: C.primaryLight, color: C.primary }}
          >
            Next 30 days
          </span>
        </div>

        {data.upcoming.length === 0 ? (
          <div
            className="py-10 text-center rounded-2xl"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
          >
            <GraduationCap
              size={36}
              color={C.textMuted}
              className="mx-auto mb-2"
            />
            <p className="text-sm" style={{ color: C.textMuted }}>
              No upcoming trainings scheduled.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.upcoming.map((item, i) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -3 }}
                className="rounded-2xl p-6 border"
                style={{ background: C.surface, borderColor: C.border }}
              >
                <div className="flex justify-between">
                  <div>
                    <p
                      className="font-semibold"
                      style={{ color: C.textPrimary }}
                    >
                      {item.title}
                    </p>
                    <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                      {new Date(item.start_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {item.type}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: C.textMuted }}
                    >
                      {item.enrolled_count}/{item.max_attendees ?? "∞"} enrolled
                    </p>
                  </div>
                  <span
                    className="text-xs px-3 py-1 rounded-full h-fit"
                    style={{ background: "#ECFEFF", color: "#06B6D4" }}
                  >
                    {item.type}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
