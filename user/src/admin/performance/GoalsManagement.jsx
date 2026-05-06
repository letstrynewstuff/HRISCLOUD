// src/admin/performance/GoalsManagement.jsx
// Full Goals system: list, create, edit, assign (employee dropdown), progress update

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  RefreshCw,
  AlertTriangle,
  Target,
  X,
  Loader2,
  ChevronDown,
  Edit2,
  User,
  Calendar,
  BarChart2,
  Check,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Circle,
  AlertCircle,
  Trash2,
  Users,
} from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import {
  listGoals,
  createGoal,
  updateGoal,
  updateGoalProgress,
  assignGoal,
} from "../../api/service/performanceApi";
import { getEmployees } from "../../api/service/employeeApi";

// ─── Animations ───────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  }),
};

const modalAnim = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.18 } },
};

// ─── Status config ────────────────────────────────────────────
const STATUS_CFG = {
  completed: {
    bg: "#d1fae5",
    color: "#059669",
    icon: CheckCircle2,
    label: "Completed",
  },
  in_progress: {
    bg: "#dbeafe",
    color: "#2563eb",
    icon: Clock,
    label: "In Progress",
  },
  not_started: {
    bg: "#f1f5f9",
    color: "#64748b",
    icon: Circle,
    label: "Not Started",
  },
  overdue: {
    bg: "#fee2e2",
    color: "#dc2626",
    icon: AlertCircle,
    label: "Overdue",
  },
};

// ─── Small reusable components ────────────────────────────────

function StatusPill({ status }) {
  const cfg = STATUS_CFG[status?.toLowerCase()] ?? STATUS_CFG.not_started;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon size={10} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

function ProgressBar({ progress = 0 }) {
  const color =
    progress >= 100
      ? "#059669"
      : progress >= 60
        ? "#2563eb"
        : progress >= 30
          ? "#f59e0b"
          : "#ef4444";
  return (
    <div className="flex items-center gap-2 w-full">
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: "#e2e8f0" }}
      >
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{ background: color }}
        />
      </div>
      <span
        className="text-xs font-bold w-8 text-right tabular-nums"
        style={{ color }}
      >
        {progress}%
      </span>
    </div>
  );
}

// Employee select dropdown with search
function EmployeeSelect({
  employees,
  value,
  onChange,
  placeholder = "Select employee…",
  loading,
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      employees.filter(
        (e) =>
          !q ||
          `${e.first_name} ${e.last_name}`
            .toLowerCase()
            .includes(q.toLowerCase()) ||
          e.email?.toLowerCase().includes(q.toLowerCase()) ||
          e.department?.toLowerCase().includes(q.toLowerCase()),
      ),
    [employees, q],
  );

  const selected = employees.find((e) => e.id === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm outline-none"
        style={{
          background: C.surfaceAlt,
          border: `1.5px solid ${open ? C.primary : C.border}`,
          color: C.textPrimary,
        }}
      >
        <span className="flex items-center gap-2 truncate">
          {loading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : selected ? (
            <>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                style={{ background: C.primary }}
              >
                {selected.first_name?.[0]}
                {selected.last_name?.[0]}
              </div>
              <span>
                {selected.first_name} {selected.last_name}
              </span>
              <span className="text-xs" style={{ color: C.textMuted }}>
                · {selected.department ?? ""}
              </span>
            </>
          ) : (
            <span style={{ color: C.textMuted }}>{placeholder}</span>
          )}
        </span>
        <ChevronDown
          size={14}
          color={C.textMuted}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden"
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
          >
            <div className="p-2 border-b" style={{ borderColor: C.border }}>
              <div
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                style={{ background: C.surfaceAlt }}
              >
                <Search size={12} color={C.textMuted} />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search employees…"
                  className="flex-1 text-xs outline-none bg-transparent"
                  style={{ color: C.textPrimary }}
                />
              </div>
            </div>
            <div className="max-h-44 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                  setQ("");
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-opacity-60 text-left"
                style={{
                  color: C.textMuted,
                  background: !value ? C.surfaceAlt : "transparent",
                }}
              >
                <Users size={12} /> Company-wide (no specific employee)
              </button>
              {filtered.length === 0 && (
                <p
                  className="px-3 py-3 text-xs text-center"
                  style={{ color: C.textMuted }}
                >
                  No employees found
                </p>
              )}
              {filtered.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => {
                    onChange(e.id);
                    setOpen(false);
                    setQ("");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors"
                  style={{
                    background: value === e.id ? C.primaryLight : "transparent",
                    color: C.textPrimary,
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ background: C.primary }}
                  >
                    {e.first_name?.[0]}
                    {e.last_name?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-xs truncate">
                      {e.first_name} {e.last_name}
                    </p>
                    <p
                      className="text-[10px] truncate"
                      style={{ color: C.textMuted }}
                    >
                      {e.department ?? e.email ?? ""}
                    </p>
                  </div>
                  {value === e.id && (
                    <Check
                      size={12}
                      color={C.primary}
                      className="ml-auto flex-shrink-0"
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── GOAL MODAL (Create / Edit) ───────────────────────────────
function GoalModal({ goal, employees, loadingEmployees, onClose, onSaved }) {
  const isEdit = !!goal;

  const [form, setForm] = useState({
    title: goal?.title ?? "",
    description: goal?.description ?? "",
    metric: goal?.metric ?? "",
    target: goal?.target ?? "",
    dueDate: goal?.due_date ? goal.due_date.slice(0, 10) : "",
    cycle: goal?.cycle ?? "",
    employeeId: goal?.employee_id ?? "",
    status: goal?.status ?? "not_started",
    progress: goal?.progress ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError("Goal title is required.");
      return;
    }
    if (!form.dueDate) {
      setError("Due date is required.");
      return;
    }
    if (!form.cycle.trim()) {
      setError("Cycle is required (e.g. 2025-Q1).");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        metric: form.metric.trim() || undefined,
        target: form.target.trim() || undefined,
        dueDate: form.dueDate,
        cycle: form.cycle.trim(),
        employeeId: form.employeeId || undefined,
        status: form.status,
        progress: Number(form.progress),
      };
      if (isEdit) {
        await updateGoal(goal.id, payload);
      } else {
        await createGoal(payload);
      }
      onSaved();
    } catch (err) {
      setError(
        err?.response?.data?.message ??
          `Failed to ${isEdit ? "update" : "create"} goal.`,
      );
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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        variants={modalAnim}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: C.primaryLight }}
            >
              <Target size={15} color={C.primary} />
            </div>
            <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
              {isEdit ? "Edit Goal" : "Create New Goal"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
            style={{ background: C.surfaceAlt }}
          >
            <X size={14} color={C.textMuted} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: "#fee2e2" }}
            >
              <AlertTriangle size={13} color="#dc2626" />
              <p className="text-xs" style={{ color: "#dc2626" }}>
                {error}
              </p>
            </div>
          )}

          {/* Title */}
          <div>
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: C.textPrimary }}
            >
              Goal Title <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Increase customer satisfaction score"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
                color: C.textPrimary,
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: C.textPrimary }}
            >
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional detail about this goal…"
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
                color: C.textPrimary,
              }}
            />
          </div>

          {/* Metric + Target */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="block text-xs font-semibold mb-1.5"
                style={{ color: C.textPrimary }}
              >
                Metric
              </label>
              <input
                value={form.metric}
                onChange={(e) => set("metric", e.target.value)}
                placeholder="e.g. NPS score"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1.5px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              />
            </div>
            <div>
              <label
                className="block text-xs font-semibold mb-1.5"
                style={{ color: C.textPrimary }}
              >
                Target Value
              </label>
              <input
                value={form.target}
                onChange={(e) => set("target", e.target.value)}
                placeholder="e.g. 4.5 / ₦5M"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1.5px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              />
            </div>
          </div>

          {/* Cycle + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="block text-xs font-semibold mb-1.5"
                style={{ color: C.textPrimary }}
              >
                Cycle <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                value={form.cycle}
                onChange={(e) => set("cycle", e.target.value)}
                placeholder="e.g. 2025-Q1"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1.5px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              />
            </div>
            <div>
              <label
                className="block text-xs font-semibold mb-1.5"
                style={{ color: C.textPrimary }}
              >
                Due Date <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1.5px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              />
            </div>
          </div>

          {/* Assign Employee */}
          <div>
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: C.textPrimary }}
            >
              Assign To
            </label>
            <EmployeeSelect
              employees={employees}
              value={form.employeeId}
              onChange={(v) => set("employeeId", v)}
              loading={loadingEmployees}
            />
          </div>

          {/* Status + Progress (edit only) */}
          {isEdit && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: C.textPrimary }}
                >
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: C.surfaceAlt,
                    border: `1.5px solid ${C.border}`,
                    color: C.textPrimary,
                  }}
                >
                  {Object.entries(STATUS_CFG).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: C.textPrimary }}
                >
                  Progress ({form.progress}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={form.progress}
                  onChange={(e) => set("progress", Number(e.target.value))}
                  className="w-full mt-1"
                  style={{ accentColor: C.primary }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 px-5 pb-5 pt-3 flex-shrink-0"
          style={{ borderTop: `1px solid ${C.border}` }}
        >
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
            style={{ background: C.primary, opacity: saving ? 0.75 : 1 }}
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Saving…
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Goal"
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── PROGRESS UPDATE MODAL ────────────────────────────────────
function ProgressModal({ goal, onClose, onSaved }) {
  const [progress, setProgress] = useState(goal.progress ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateGoalProgress(goal.id, progress);
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to update progress.");
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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        variants={modalAnim}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          boxShadow: "0 32px 80px rgba(0,0,0,0.22)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2">
            <BarChart2 size={15} color={C.primary} />
            <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
              Update Progress
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

        <div className="p-5 space-y-4">
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: "#fee2e2" }}
            >
              <AlertTriangle size={13} color="#dc2626" />
              <p className="text-xs" style={{ color: "#dc2626" }}>
                {error}
              </p>
            </div>
          )}
          <p
            className="text-sm font-medium truncate"
            style={{ color: C.textPrimary }}
          >
            {goal.title}
          </p>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs" style={{ color: C.textMuted }}>
                Progress
              </span>
              <span className="text-sm font-bold" style={{ color: C.primary }}>
                {progress}%
              </span>
            </div>
            <ProgressBar progress={progress} />
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full mt-3"
              style={{ accentColor: C.primary }}
            />
          </div>
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
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: C.primary, opacity: saving ? 0.75 : 1 }}
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Saving…
              </>
            ) : (
              "Update"
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── GOAL ROW ─────────────────────────────────────────────────
function GoalRow({ goal, index, onEdit, onUpdateProgress }) {
  const dueDate = goal.due_date ? new Date(goal.due_date) : null;
  const isOverdue =
    dueDate && dueDate < new Date() && goal.status !== "completed";

  return (
    <motion.tr
      key={goal.id}
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="group border-b"
      style={{ borderColor: C.border }}
    >
      {/* Employee */}
      <td className="px-5 py-4">
        {goal.employee_first_name ? (
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
              style={{ background: C.primary }}
            >
              {goal.employee_first_name?.[0]}
              {goal.employee_last_name?.[0]}
            </div>
            <div>
              <p
                className="text-xs font-semibold"
                style={{ color: C.textPrimary }}
              >
                {goal.employee_first_name} {goal.employee_last_name}
              </p>
              <p className="text-[10px]" style={{ color: C.textMuted }}>
                {goal.department_name ?? ""}
              </p>
            </div>
          </div>
        ) : (
          <span
            className="text-xs flex items-center gap-1.5"
            style={{ color: C.textMuted }}
          >
            <Users size={12} /> Company-wide
          </span>
        )}
      </td>

      {/* Goal */}
      <td className="px-5 py-4 max-w-[220px]">
        <p
          className="text-sm font-medium truncate"
          style={{ color: C.textPrimary }}
        >
          {goal.title}
        </p>
        {goal.metric && (
          <p
            className="text-[10px] mt-0.5 truncate"
            style={{ color: C.textMuted }}
          >
            Metric: {goal.metric}
            {goal.target ? ` · Target: ${goal.target}` : ""}
          </p>
        )}
        {goal.cycle && (
          <span
            className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: C.primaryLight, color: C.primary }}
          >
            {goal.cycle}
          </span>
        )}
      </td>

      {/* Progress */}
      <td className="px-5 py-4 w-40">
        <ProgressBar progress={goal.progress ?? 0} />
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <StatusPill
          status={
            isOverdue && goal.status !== "completed" ? "overdue" : goal.status
          }
        />
      </td>

      {/* Due Date */}
      <td className="px-5 py-4">
        <span
          className={`text-xs flex items-center gap-1 ${isOverdue ? "font-semibold" : ""}`}
          style={{ color: isOverdue ? "#dc2626" : C.textSecondary }}
        >
          <Calendar size={11} />
          {dueDate
            ? dueDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onUpdateProgress(goal)}
            className="p-1.5 rounded-lg"
            title="Update progress"
            style={{ background: C.primaryLight, color: C.primary }}
          >
            <BarChart2 size={13} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(goal)}
            className="p-1.5 rounded-lg"
            title="Edit goal"
            style={{ background: C.surfaceAlt, color: C.textSecondary }}
          >
            <Edit2 size={13} />
          </motion.button>
        </div>
      </td>
    </motion.tr>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function GoalsManagement({ searchQuery }) {
  const [goals, setGoals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("due_date");
  const [sortDir, setSortDir] = useState("asc");
  const [modal, setModal] = useState(null); // null | "create" | "edit" | "progress"
  const [selected, setSelected] = useState(null); // goal being edited/progressed

  // ── Fetch goals ──
  const loadGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listGoals({ limit: 200 });
      // API may return { goals } or { data } or array
      const list = res?.goals ?? res?.data ?? (Array.isArray(res) ? res : []);
      setGoals(list);
    } catch {
      setError("Failed to load goals. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch employees for dropdown ──
  const loadEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    try {
      const res = await getEmployees({ limit: 500 });
      const list =
        res?.employees ?? res?.data ?? (Array.isArray(res) ? res : []);
      setEmployees(list);
    } catch {
      // non-fatal
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
    loadEmployees();
  }, []);

  // ── Filter + sort ──
  const processed = useMemo(() => {
    const q = (searchQuery ?? "").toLowerCase();
    let list = goals.filter((g) => {
      const name =
        `${g.employee_first_name ?? ""} ${g.employee_last_name ?? ""}`.toLowerCase();
      const matchQ =
        !q ||
        name.includes(q) ||
        g.title?.toLowerCase().includes(q) ||
        g.cycle?.toLowerCase().includes(q);
      const matchS = !statusFilter || g.status?.toLowerCase() === statusFilter;
      return matchQ && matchS;
    });

    list = [...list].sort((a, b) => {
      let av = a[sortField] ?? "",
        bv = b[sortField] ?? "";
      if (sortField === "due_date") {
        av = new Date(av || 0);
        bv = new Date(bv || 0);
      }
      if (sortField === "progress") {
        av = Number(av);
        bv = Number(bv);
      }
      return sortDir === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
    });

    return list;
  }, [goals, searchQuery, statusFilter, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // ── Stats ──
  const stats = useMemo(
    () => ({
      total: goals.length,
      completed: goals.filter((g) => g.status === "completed").length,
      in_progress: goals.filter((g) => g.status === "in_progress").length,
      overdue: goals.filter(
        (g) =>
          g.status === "overdue" ||
          (g.due_date &&
            new Date(g.due_date) < new Date() &&
            g.status !== "completed"),
      ).length,
    }),
    [goals],
  );

  const handleSaved = () => {
    setModal(null);
    setSelected(null);
    loadGoals();
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
        <div>
          <h2 className="font-bold text-lg" style={{ color: C.textPrimary }}>
            Goals & KPIs
          </h2>
          <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
            {stats.total} total · {stats.in_progress} in progress ·{" "}
            {stats.completed} completed
            {stats.overdue > 0 && (
              <span style={{ color: "#dc2626" }}>
                {" "}
                · {stats.overdue} overdue
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <motion.button
            whileHover={{ scale: 1.04 }}
            onClick={loadGoals}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
              color: C.textSecondary,
            }}
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setSelected(null);
              setModal("create");
            }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: C.primary }}
          >
            <Plus size={14} /> New Goal
          </motion.button>
        </div>
      </div>

      {/* ── Status filters ── */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "", label: "All" },
          { key: "in_progress", label: "In Progress" },
          { key: "completed", label: "Completed" },
          { key: "not_started", label: "Not Started" },
          { key: "overdue", label: "Overdue" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className="text-[11px] font-bold px-3 py-1.5 rounded-full transition-all"
            style={{
              background: statusFilter === key ? C.primary : C.surface,
              color: statusFilter === key ? "#fff" : C.textSecondary,
              border: `1px solid ${statusFilter === key ? C.primary : C.border}`,
            }}
          >
            {label}
            {key === "" && ` (${stats.total})`}
            {key === "in_progress" && ` (${stats.in_progress})`}
            {key === "completed" && ` (${stats.completed})`}
            {key === "overdue" && stats.overdue > 0 && ` (${stats.overdue})`}
          </button>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "#fee2e2" }}
        >
          <AlertTriangle size={16} color="#dc2626" />
          <p className="text-sm" style={{ color: "#dc2626" }}>
            {error}
          </p>
          <button
            onClick={loadGoals}
            className="ml-auto text-xs font-semibold underline"
            style={{ color: "#dc2626" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr style={{ background: C.surfaceAlt }}>
                {[
                  { label: "Employee", field: null },
                  { label: "Goal", field: "title" },
                  { label: "Progress", field: "progress" },
                  { label: "Status", field: "status" },
                  { label: "Due Date", field: "due_date" },
                  { label: "", field: null },
                ].map(({ label, field }) => (
                  <th
                    key={label}
                    className={`px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide ${field ? "cursor-pointer select-none hover:opacity-70" : ""}`}
                    style={{ color: C.textMuted }}
                    onClick={() => field && toggleSort(field)}
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      {field && sortField === field && (
                        <ArrowUpDown size={10} style={{ color: C.primary }} />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr
                    key={i}
                    className="border-b"
                    style={{ borderColor: C.border }}
                  >
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div
                          className="h-4 rounded-lg animate-pulse"
                          style={{
                            background: C.surfaceAlt,
                            width: j === 1 ? "80%" : "60%",
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : processed.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: C.primaryLight }}
                      >
                        <Target size={22} color={C.primary} />
                      </div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: C.textPrimary }}
                      >
                        {searchQuery || statusFilter
                          ? "No goals match your filter."
                          : "No goals yet."}
                      </p>
                      {!searchQuery && !statusFilter && (
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setModal("create")}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                          style={{ background: C.primary }}
                        >
                          <Plus size={13} /> Create First Goal
                        </motion.button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                processed.map((goal, i) => (
                  <GoalRow
                    key={goal.id}
                    goal={goal}
                    index={i}
                    onEdit={(g) => {
                      setSelected(g);
                      setModal("edit");
                    }}
                    onUpdateProgress={(g) => {
                      setSelected(g);
                      setModal("progress");
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!loading && processed.length > 0 && (
          <div
            className="px-5 py-3 border-t flex items-center justify-between"
            style={{ borderColor: C.border }}
          >
            <p className="text-xs" style={{ color: C.textMuted }}>
              Showing {processed.length} of {goals.length} goals
            </p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {(modal === "create" || modal === "edit") && (
          <GoalModal
            key="goal-modal"
            goal={modal === "edit" ? selected : null}
            employees={employees}
            loadingEmployees={loadingEmployees}
            onClose={() => {
              setModal(null);
              setSelected(null);
            }}
            onSaved={handleSaved}
          />
        )}
        {modal === "progress" && selected && (
          <ProgressModal
            key="progress-modal"
            goal={selected}
            onClose={() => {
              setModal(null);
              setSelected(null);
            }}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
