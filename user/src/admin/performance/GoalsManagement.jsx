// src/admin/performance/GoalsManagement.jsx
// Fully API-connected — no mock data. C from shared colors.

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  RefreshCw,
  AlertTriangle,
  Target,
  X,
  Loader2,
} from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import {
  listGoals,
  createGoal,
  updateGoalProgress,
} from "../../api/service/performanceApi";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.35 },
  }),
};

function StatusPill({ status }) {
  const cfg = {
    completed: { bg: C.successLight, color: C.success },
    in_progress: { bg: C.primaryLight, color: C.primary },
    not_started: { bg: C.surfaceAlt, color: C.textMuted },
    overdue: { bg: C.dangerLight, color: C.danger },
  }[status?.toLowerCase()] ?? { bg: C.surfaceAlt, color: C.textMuted };
  return (
    <span
      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {status?.replace("_", " ")}
    </span>
  );
}

function ProgressBar({ progress, goalId, onUpdate }) {
  const color =
    progress >= 100
      ? C.success
      : progress >= 60
        ? C.primary
        : progress >= 30
          ? C.warning
          : C.danger;
  return (
    <div className="flex items-center gap-3 min-w-[140px]">
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ background: C.surfaceAlt }}
      >
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ background: color }}
        />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color }}>
        {progress}%
      </span>
    </div>
  );
}

function CreateGoalModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    metric: "",
    target: "",
    dueDate: "",
    employeeId: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title || !form.dueDate) {
      setError("Title and due date are required.");
      return;
    }
    setSaving(true);
    try {
      await createGoal(form);
      onCreated();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create goal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: C.primaryLight }}
            >
              <Target size={15} color={C.primary} />
            </div>
            <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
              Create New Goal
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg"
            style={{ background: C.surfaceAlt }}
          >
            <X size={14} color={C.textMuted} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: C.dangerLight }}
            >
              <AlertTriangle size={13} color={C.danger} />
              <p className="text-xs" style={{ color: C.danger }}>
                {error}
              </p>
            </div>
          )}
          {[
            {
              label: "Goal Title",
              key: "title",
              type: "text",
              placeholder: "e.g. Increase customer satisfaction score",
            },
            {
              label: "Description",
              key: "description",
              type: "text",
              placeholder: "Optional detail",
            },
            {
              label: "Metric",
              key: "metric",
              type: "text",
              placeholder: "e.g. NPS score, revenue ₦",
            },
            {
              label: "Target Value",
              key: "target",
              type: "text",
              placeholder: "e.g. 4.5 / 100 / ₦5M",
            },
            { label: "Due Date", key: "dueDate", type: "date" },
            {
              label: "Employee ID (optional)",
              key: "employeeId",
              type: "text",
              placeholder: "UUID — leave blank for company-wide",
            },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label
                className="block text-xs font-semibold mb-1"
                style={{ color: C.textPrimary }}
              >
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                placeholder={placeholder}
                onChange={(e) => set(key, e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1.5px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: C.surfaceAlt,
              color: C.textSecondary,
              border: `1px solid ${C.border}`,
            }}
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: C.primary, opacity: saving ? 0.8 : 1 }}
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Creating…
              </>
            ) : (
              "Create Goal"
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function GoalsManagement({ searchQuery }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listGoals({ limit: 100 });
      setGoals(res.data ?? []);
    } catch {
      setError("Failed to load goals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return goals.filter((g) => {
      const q = (searchQuery ?? "").toLowerCase();
      const matchSearch =
        !q ||
        g.employee_name?.toLowerCase().includes(q) ||
        g.title?.toLowerCase().includes(q);
      const matchStatus =
        !statusFilter || g.status?.toLowerCase() === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [goals, searchQuery, statusFilter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
        <h2 className="font-semibold text-lg" style={{ color: C.textPrimary }}>
          Goals & KPIs
        </h2>
        <div className="flex gap-2 flex-wrap">
          {["", "in_progress", "completed", "overdue", "not_started"].map(
            (s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="text-[10px] font-bold px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: statusFilter === s ? C.primary : C.surface,
                  color: statusFilter === s ? "#fff" : C.textSecondary,
                  border: `1px solid ${statusFilter === s ? C.primary : C.border}`,
                }}
              >
                {s ? s.replace("_", " ") : "All"}
              </button>
            ),
          )}
          <motion.button
            whileHover={{ scale: 1.04 }}
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
              color: C.textSecondary,
            }}
          >
            <RefreshCw size={12} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: C.primary }}
          >
            <Plus size={14} /> New Goal
          </motion.button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-14 rounded-2xl animate-pulse"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            />
          ))}
        </div>
      ) : error ? (
        <div
          className="rounded-2xl p-6 flex items-center gap-3"
          style={{ background: C.dangerLight }}
        >
          <AlertTriangle size={18} color={C.danger} />
          <p className="text-sm" style={{ color: C.danger }}>
            {error}
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: C.surface, borderColor: C.border }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ background: C.surfaceAlt }}>
                {[
                  "Employee",
                  "Department",
                  "Goal",
                  "Progress",
                  "Status",
                  "Due Date",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-left text-xs font-bold uppercase"
                    style={{ color: C.textMuted }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm"
                    style={{ color: C.textMuted }}
                  >
                    {searchQuery
                      ? "No goals match your search."
                      : "No goals yet. Create one to get started."}
                  </td>
                </tr>
              ) : (
                filtered.map((goal, i) => (
                  <motion.tr
                    key={goal.id}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="border-b"
                    style={{ borderColor: C.border }}
                  >
                    <td
                      className="px-5 py-4 font-medium text-sm"
                      style={{ color: C.textPrimary }}
                    >
                      {goal.employee_name ?? goal.employee ?? "Company-wide"}
                    </td>
                    <td className="px-5 py-4">
                      {goal.department_name || goal.dept ? (
                        <span
                          className="text-xs px-3 py-1 rounded-full"
                          style={{
                            background: C.primaryLight,
                            color: C.primary,
                          }}
                        >
                          {goal.department_name ?? goal.dept}
                        </span>
                      ) : (
                        <span
                          className="text-xs"
                          style={{ color: C.textMuted }}
                        >
                          —
                        </span>
                      )}
                    </td>
                    <td
                      className="px-5 py-4 text-sm"
                      style={{ color: C.textPrimary }}
                    >
                      <p className="font-medium">{goal.title}</p>
                      {goal.metric && (
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: C.textMuted }}
                        >
                          Metric: {goal.metric}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <ProgressBar
                        progress={goal.progress ?? 0}
                        goalId={goal.id}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={goal.status} />
                    </td>
                    <td
                      className="px-5 py-4 text-sm"
                      style={{ color: C.textSecondary }}
                    >
                      {goal.due_date ?? goal.due ?? "—"}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <CreateGoalModal
            onClose={() => setShowCreate(false)}
            onCreated={() => {
              setShowCreate(false);
              load();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
