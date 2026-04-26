
// src/admin/training/TrainingBudget.jsx
// Derives budget data from real training costs in DB.
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import {
  getTrainingDashboard,
  listTrainings,
} from "../../api/service/trainingApi";
import { C } from "../employeemanagement/sharedData";

export default function TrainingBudget() {
  const [summary, setSummary] = useState(null);
  const [byType, setByType] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getTrainingDashboard(), listTrainings({ limit: 200 })])
      .then(([dash, all]) => {
        setSummary({
          totalBudget: dash.data.totalCost,
          spent: dash.data.budgetSpent,
        });

        // Group by type for breakdown cards
        const trainings = all.data ?? [];
        const grouped = {};
        trainings.forEach((t) => {
          if (!grouped[t.type])
            grouped[t.type] = { name: t.type, budget: 0, spent: 0 };
          grouped[t.type].budget += t.cost ?? 0;
          if (t.status === "completed") grouped[t.type].spent += t.cost ?? 0;
        });
        setByType(Object.values(grouped));
      })
      .catch((e) =>
        setError(e?.response?.data?.message ?? "Failed to load budget data."),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={28} color={C.primary} className="animate-spin" />
      </div>
    );

  if (error)
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

  const utilization =
    summary.totalBudget > 0
      ? Math.round((summary.spent / summary.totalBudget) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div
        className="rounded-2xl p-7 border"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <div className="flex justify-between mb-2 flex-wrap gap-4">
          <div>
            <p className="text-sm" style={{ color: C.textMuted }}>
              Total Training Cost (All Time)
            </p>
            <p
              className="text-4xl font-bold"
              style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
            >
              ₦{(summary.totalBudget / 1_000_000).toFixed(1)}M
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: C.textMuted }}>
              Spent (Completed)
            </p>
            <p
              className="text-4xl font-bold"
              style={{ color: C.warning, fontFamily: "Sora,sans-serif" }}
            >
              ₦{(summary.spent / 1_000_000).toFixed(1)}M
            </p>
          </div>
        </div>

        <div
          className="h-3 rounded-full mt-6 overflow-hidden"
          style={{ background: "#F1F5F9" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${utilization}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: C.warning }}
          />
        </div>
        <p className="text-xs mt-2 text-right" style={{ color: C.textMuted }}>
          {utilization}% utilization
        </p>
      </div>

      {/* By type */}
      {byType.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {byType.map((dept, i) => {
            const pct =
              dept.budget > 0
                ? Math.round((dept.spent / dept.budget) * 100)
                : 0;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -3 }}
                className="rounded-2xl p-6 border"
                style={{ background: C.surface, borderColor: C.border }}
              >
                <p className="font-semibold" style={{ color: C.textPrimary }}>
                  {dept.name}
                </p>
                <div className="mt-4 flex justify-between text-sm">
                  <span style={{ color: C.textSecondary }}>Total</span>
                  <span
                    className="font-medium"
                    style={{ color: C.textPrimary }}
                  >
                    ₦{(dept.budget / 1_000_000).toFixed(2)}M
                  </span>
                </div>
                <div className="mt-1 flex justify-between text-sm">
                  <span style={{ color: C.textSecondary }}>Spent</span>
                  <span className="font-medium" style={{ color: C.warning }}>
                    ₦{(dept.spent / 1_000_000).toFixed(2)}M
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full mt-4 overflow-hidden"
                  style={{ background: "#F1F5F9" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: C.primary }}
                  />
                </div>
                <p
                  className="text-[11px] mt-1 text-right"
                  style={{ color: C.textMuted }}
                >
                  {pct}%
                </p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
