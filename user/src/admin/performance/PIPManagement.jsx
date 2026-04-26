// src/admin/performance/PIPManagement.jsx
// Fully API-connected — no mock data. C from shared colors.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  AlertTriangle,
  Plus,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import { listPIPs, createPIP } from "../../api/service/performanceApi";

const fadeUp = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({ opacity: 1, transition: { delay: i * 0.04 } }),
};

function StatusPill({ status }) {
  const cfg = {
    active: { bg: C.warningLight, color: C.warning },
    completed: { bg: C.successLight, color: C.success },
    failed: { bg: C.dangerLight, color: C.danger },
  }[status?.toLowerCase()] ?? { bg: C.surfaceAlt, color: C.textMuted };
  return (
    <span
      className="px-3 py-1 text-xs rounded-full font-semibold capitalize"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {status}
    </span>
  );
}

function ProgressBar({ progress }) {
  const color =
    progress >= 80 ? C.success : progress >= 40 ? C.warning : "#F97316";
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
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{ background: color }}
        />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color }}>
        {progress}%
      </span>
    </div>
  );
}

function CreatePIPModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    employeeId: "",
    reason: "",
    reviewDate: "",
    goals: [{ title: "", target: 100 }],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.employeeId || !form.reason || !form.reviewDate) {
      setError("Employee ID, reason, and review date are required.");
      return;
    }
    setSaving(true);
    try {
      await createPIP(form.employeeId, {
        reason: form.reason,
        reviewDate: form.reviewDate,
        goals: form.goals.filter((g) => g.title.trim()),
      });
      onCreated();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create PIP.");
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
        className="relative w-full max-w-md rounded-2xl overflow-y-auto max-h-[90vh]"
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
          <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
            Create Performance Improvement Plan
          </p>
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
              style={{ background: C.dangerLight }}
            >
              <AlertTriangle size={13} color={C.danger} />
              <p className="text-xs" style={{ color: C.danger }}>
                {error}
              </p>
            </div>
          )}
          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: C.textPrimary }}
            >
              Employee ID <span style={{ color: C.danger }}>*</span>
            </label>
            <input
              value={form.employeeId}
              onChange={(e) => set("employeeId", e.target.value)}
              placeholder="UUID from employee records"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
                color: C.textPrimary,
              }}
            />
          </div>
          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: C.textPrimary }}
            >
              Reason <span style={{ color: C.danger }}>*</span>
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => set("reason", e.target.value)}
              rows={3}
              placeholder="Describe the performance issues requiring a PIP..."
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
                color: C.textPrimary,
              }}
            />
          </div>
          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: C.textPrimary }}
            >
              Review Date <span style={{ color: C.danger }}>*</span>
            </label>
            <input
              type="date"
              value={form.reviewDate}
              onChange={(e) => set("reviewDate", e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
                color: C.textPrimary,
              }}
            />
          </div>
          <div>
            <p
              className="text-xs font-semibold mb-2"
              style={{ color: C.textPrimary }}
            >
              Improvement Goals
            </p>
            {form.goals.map((g, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={g.title}
                  onChange={(e) => {
                    const next = [...form.goals];
                    next[i] = { ...next[i], title: e.target.value };
                    set("goals", next);
                  }}
                  placeholder={`Goal ${i + 1}`}
                  className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                  style={{
                    background: C.surfaceAlt,
                    border: `1.5px solid ${C.border}`,
                    color: C.textPrimary,
                  }}
                />
                {form.goals.length > 1 && (
                  <button
                    onClick={() =>
                      set(
                        "goals",
                        form.goals.filter((_, j) => j !== i),
                      )
                    }
                    className="p-2 rounded-xl"
                    style={{ background: C.dangerLight }}
                  >
                    <X size={12} color={C.danger} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() =>
                set("goals", [...form.goals, { title: "", target: 100 }])
              }
              className="text-xs font-semibold"
              style={{ color: C.primary }}
            >
              + Add goal
            </button>
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
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: C.danger, opacity: saving ? 0.8 : 1 }}
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Creating…
              </>
            ) : (
              "Create PIP"
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PIPManagement() {
  const [pips, setPips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listPIPs({
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      setPips(res.data ?? []);
    } catch {
      setError("Failed to load PIPs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="font-semibold text-lg" style={{ color: C.textPrimary }}>
          Performance Improvement Plans
        </h2>
        <div className="flex gap-2 flex-wrap items-center">
          {["", "active", "completed", "failed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="text-[10px] font-bold px-3 py-1.5 rounded-full"
              style={{
                background: statusFilter === s ? C.danger : C.surface,
                color: statusFilter === s ? "#fff" : C.textSecondary,
                border: `1px solid ${statusFilter === s ? C.danger : C.border}`,
              }}
            >
              {s || "All"}
            </button>
          ))}
          <motion.button
            whileHover={{ scale: 1.04 }}
            onClick={load}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold"
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: C.danger }}
          >
            <Plus size={14} /> Create New PIP
          </motion.button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
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
                  "Start Date",
                  "Review Date",
                  "Progress",
                  "Status",
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
              {pips.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm"
                    style={{ color: C.textMuted }}
                  >
                    No performance improvement plans{" "}
                    {statusFilter ? `with status "${statusFilter}"` : "found"}.
                  </td>
                </tr>
              ) : (
                pips.map((pip, i) => (
                  <motion.tr
                    key={pip.id ?? i}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="border-b"
                    style={{ borderColor: C.border }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = C.surfaceAlt)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td
                      className="px-5 py-4 font-medium text-sm"
                      style={{ color: C.textPrimary }}
                    >
                      {pip.name ?? pip.employee_name ?? pip.employee}
                    </td>
                    <td
                      className="px-5 py-4 text-xs"
                      style={{ color: C.textSecondary }}
                    >
                      {pip.department_name ?? pip.department ?? pip.dept ?? "—"}
                    </td>
                    <td
                      className="px-5 py-4 text-sm"
                      style={{ color: C.textSecondary }}
                    >
                      {pip.created_at
                        ? new Date(pip.created_at).toLocaleDateString("en-NG")
                        : (pip.start ?? "—")}
                    </td>
                    <td
                      className="px-5 py-4 text-sm"
                      style={{ color: C.textSecondary }}
                    >
                      {pip.review_date
                        ? new Date(pip.review_date).toLocaleDateString("en-NG")
                        : (pip.reviewDate ?? "—")}
                    </td>
                    <td className="px-5 py-4">
                      <ProgressBar progress={pip.progress ?? 0} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={pip.status ?? "active"} />
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
          <CreatePIPModal
            onClose={() => setShowCreate(false)}
            onCreated={() => {
              setShowCreate(false);
              showToast("PIP created successfully.");
              load();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl z-50"
            style={{
              background: "#1E1B4B",
              color: "#fff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              minWidth: 260,
            }}
          >
            <CheckCircle2 size={14} color="#10B981" />
            <span className="text-sm font-medium">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
