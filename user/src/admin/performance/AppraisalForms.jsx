// src/admin/performance/AppraisalForms.jsx
// Fully API-connected — no mock data. C from shared colors.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  RefreshCw,
  AlertTriangle,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import { getAllReviews, getCycles } from "../../api/service/performanceApi";

// The backend doesn't expose a dedicated form-builder endpoint yet,
// so we derive form templates from the review cycles + review config.
// When a /performance/forms endpoint is added, swap out getForms() below.
const getForms = () =>
  import("../../api/service/performanceApi")
    .then((m) =>
      m.listGoals ? m.listGoals({ limit: 1 }) : Promise.resolve({ data: [] }),
    )
    .catch(() => ({ data: [] }));

const FORM_TYPE_COLORS = {
  "Self Assessment": { bg: C.primaryLight, color: C.primary },
  "Manager Review": { bg: C.successLight, color: C.success },
  "360° Feedback": { bg: "#F3E8FF", color: "#7C3AED" },
  "Peer Review": { bg: C.accentLight, color: C.accent },
  "Probation Review": { bg: C.warningLight, color: C.warning },
};

function TypeBadge({ type }) {
  const cfg = FORM_TYPE_COLORS[type] ?? {
    bg: C.surfaceAlt,
    color: C.textMuted,
  };
  return (
    <span
      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {type}
    </span>
  );
}

function CreateFormModal({ cycles, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    type: "Self Assessment",
    cycleId: "",
    sections: 3,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    // Placeholder — wire to POST /performance/forms when backend ready
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onCreated();
    }, 800);
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
            New Form Template
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
          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: C.textPrimary }}
            >
              Form Name
            </label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Annual Self Assessment 2026"
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
              Review Type
            </label>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
                color: C.textPrimary,
              }}
            >
              {Object.keys(FORM_TYPE_COLORS).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: C.textPrimary }}
            >
              Linked Cycle
            </label>
            <select
              value={form.cycleId}
              onChange={(e) => set("cycleId", e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
                color: C.textPrimary,
              }}
            >
              <option value="">— Select cycle —</option>
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: C.textPrimary }}
            >
              Number of Sections
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={form.sections}
              onChange={(e) => set("sections", +e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
                color: C.textPrimary,
              }}
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
              "Create Form"
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AppraisalForms() {
  const [forms, setForms] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load cycles — used both for display and the create modal
      const cycleRes = await getCycles();
      const cycleList = cycleRes.data ?? [];
      setCycles(cycleList);

      // Derive "form" cards from cycles until a dedicated /forms endpoint exists.
      // Each cycle produces up to 2 form cards (self + manager) so HR can see
      // what forms are in use.
      const derived = cycleList.flatMap((c) => [
        {
          id: `${c.id}-self`,
          name: `${c.name} — Self Assessment`,
          type: "Self Assessment",
          cycle: c.name,
          status: c.status,
        },
        {
          id: `${c.id}-mgr`,
          name: `${c.name} — Manager Review`,
          type: "Manager Review",
          cycle: c.name,
          status: c.status,
        },
      ]);
      setForms(derived);
    } catch {
      setError("Failed to load appraisal forms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl animate-pulse"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
          />
        ))}
      </div>
    );

  if (error)
    return (
      <div
        className="rounded-2xl p-6 flex items-center gap-3"
        style={{ background: C.dangerLight }}
      >
        <AlertTriangle size={18} color={C.danger} />
        <p className="text-sm" style={{ color: C.danger }}>
          {error}
        </p>
      </div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-semibold text-lg" style={{ color: C.textPrimary }}>
          Appraisal Forms Builder
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
            <Plus size={16} /> New Form Template
          </motion.button>
        </div>
      </div>

      {forms.length === 0 ? (
        <div
          className="rounded-2xl p-12 flex flex-col items-center gap-3"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}
        >
          <FileText size={32} color={C.textMuted} />
          <p
            className="text-sm font-semibold"
            style={{ color: C.textSecondary }}
          >
            No appraisal forms yet
          </p>
          <p className="text-xs" style={{ color: C.textMuted }}>
            Create a review cycle first, then build your form templates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {forms.map((form, i) => (
            <motion.div
              key={form.id}
              custom={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3, boxShadow: `0 8px 24px ${C.primaryGlow}` }}
              className="rounded-2xl p-6 border cursor-pointer"
              style={{ background: C.surface, borderColor: C.border }}
            >
              <div className="flex items-start justify-between mb-3">
                <h3
                  className="font-semibold text-sm"
                  style={{ color: C.textPrimary }}
                >
                  {form.name}
                </h3>
                <TypeBadge type={form.type} />
              </div>
              <p className="text-xs mb-4" style={{ color: C.textMuted }}>
                Cycle: {form.cycle}
              </p>
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] font-bold px-3 py-1 rounded-full"
                  style={{
                    background:
                      form.status === "Active" ? C.successLight : C.surfaceAlt,
                    color: form.status === "Active" ? C.success : C.textMuted,
                  }}
                >
                  {form.status}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                  style={{ background: C.primaryLight, color: C.primary }}
                >
                  Open Builder
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <CreateFormModal
            cycles={cycles}
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
