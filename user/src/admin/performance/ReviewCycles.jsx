// src/admin/performance/ReviewCycles.jsx
// Fully API-connected — no mock data. C from shared colors.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Play,
  Pause,
  X,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import { getCycles, createCycle } from "../../api/service/performanceApi";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.35 },
  }),
};

function StatusPill({ status }) {
  const cfg = {
    Active: { bg: "#D1FAE5", color: "#059669" },
    Upcoming: { bg: "#FEF3C7", color: "#D97706" },
    Completed: { bg: "#F1F5F9", color: "#64748B" },
  }[status] ?? { bg: C.surfaceAlt, color: C.textMuted };
  return (
    <span
      className="px-3 py-1 text-xs rounded-full font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {status}
    </span>
  );
}

function CreateCycleModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    periodStart: "",
    periodEnd: "",
    status: "Upcoming",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.periodStart || !form.periodEnd) {
      setError("Name, start date and end date are required.");
      return;
    }
    setSaving(true);
    try {
      await createCycle(form);
      onCreated();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create cycle.");
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
          <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
            New Review Cycle
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
          {[
            {
              label: "Cycle Name",
              key: "name",
              type: "text",
              placeholder: "e.g. Q2 2026 Review",
            },
            { label: "Start Date", key: "periodStart", type: "date" },
            { label: "End Date", key: "periodEnd", type: "date" },
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
          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: C.textPrimary }}
            >
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
                color: C.textPrimary,
              }}
            >
              <option>Upcoming</option>
              <option>Active</option>
            </select>
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
            style={{ background: C.primary, opacity: saving ? 0.8 : 1 }}
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Creating…
              </>
            ) : (
              "Create Cycle"
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ReviewCycles() {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCycles();
      setCycles(res.data ?? []);
    } catch {
      setError("Failed to load review cycles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleStatus = (id) => {
    setCycles((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "Active" ? "Completed" : "Active" }
          : c,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-lg" style={{ color: C.textPrimary }}>
          Review Cycles
        </h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
              color: C.textSecondary,
            }}
          >
            <RefreshCw size={12} /> Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: C.primary }}
          >
            <Plus size={16} /> New Cycle
          </motion.button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
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
                  "Cycle Name",
                  "Period",
                  "Participants",
                  "Status",
                  "Actions",
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
              {cycles.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm"
                    style={{ color: C.textMuted }}
                  >
                    No review cycles yet. Create one to get started.
                  </td>
                </tr>
              ) : (
                cycles.map((cycle, i) => (
                  <motion.tr
                    key={cycle.id}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="border-b"
                    style={{ borderColor: C.border }}
                  >
                    <td
                      className="px-5 py-4 font-medium"
                      style={{ color: C.textPrimary }}
                    >
                      {cycle.name}
                    </td>
                    <td
                      className="px-5 py-4 text-sm"
                      style={{ color: C.textSecondary }}
                    >
                      {cycle.period_start ?? cycle.start} —{" "}
                      {cycle.period_end ?? cycle.end}
                    </td>
                    <td
                      className="px-5 py-4 text-sm"
                      style={{ color: C.textPrimary }}
                    >
                      {cycle.participants ?? cycle.participant_count ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={cycle.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleStatus(cycle.id)}
                          className="p-2 rounded-lg"
                          style={{
                            background: C.primaryLight,
                            color: C.primary,
                          }}
                        >
                          {cycle.status === "Active" ? (
                            <Pause size={15} />
                          ) : (
                            <Play size={15} />
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg"
                          style={{
                            background: C.surfaceAlt,
                            color: C.textSecondary,
                            border: `1px solid ${C.border}`,
                          }}
                        >
                          <Edit2 size={15} />
                        </motion.button>
                      </div>
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
          <CreateCycleModal
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
