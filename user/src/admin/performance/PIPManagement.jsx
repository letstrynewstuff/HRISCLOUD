


// src/admin/performance/PIPManagement.jsx
// Full PIP system: list, create, edit, update progress, update status
// Employee chosen via searchable dropdown (same pattern as GoalsManagement)

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, AlertTriangle, Plus, X, Loader2, CheckCircle2,
  Edit2, BarChart2, ChevronDown, Search, Users, Check,
  AlertCircle, Clock, TrendingUp, Calendar, Trash2,
  Shield, ArrowUpDown,
} from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import {
  listPIPs, createPIP, updatePIP, updatePIPStatus, updatePIPProgress, deletePIP,
} from "../../api/service/performanceApi";
import { getEmployees } from "../../api/service/employeeApi";

// ─── Animations ───────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 10 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  }),
};
const modalAnim = {
  hidden:  { opacity: 0, scale: 0.95, y: 16 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, scale: 0.95, y: 8,  transition: { duration: 0.18 } },
};

// ─── Status config ────────────────────────────────────────────
const STATUS_CFG = {
  active:    { bg: "#fef3c7", color: "#92400E", icon: Clock,        label: "Active" },
  completed: { bg: "#d1fae5", color: "#047857", icon: CheckCircle2, label: "Completed" },
  failed:    { bg: "#fee2e2", color: "#B91C1C", icon: AlertCircle,  label: "Failed" },
};

// ─── Reusable: Employee Dropdown ──────────────────────────────
function EmployeeSelect({ employees, value, onChange, loading, disabled }) {
  const [open, setOpen] = useState(false);
  const [q,    setQ]    = useState("");

  const filtered = useMemo(() =>
    employees.filter(e =>
      !q ||
      `${e.first_name} ${e.last_name}`.toLowerCase().includes(q.toLowerCase()) ||
      e.email?.toLowerCase().includes(q.toLowerCase()) ||
      e.department?.toLowerCase().includes(q.toLowerCase())
    ), [employees, q]);

  const selected = employees.find(e => e.id === value);

  return (
    <div className="relative">
      <button type="button" disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-full text-sm outline-none"
        style={{
          background: C.surfaceAlt,
          border: `1.5px solid ${open ? C.danger : C.border}`,
          color: C.textPrimary,
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}>
        <span className="flex items-center gap-2 truncate min-w-0">
          {loading ? <Loader2 size={13} className="animate-spin" color={C.textMuted} /> :
            selected ? (
              <>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                  style={{ background: C.danger }}>
                  {selected.first_name?.[0]}{selected.last_name?.[0]}
                </div>
                <span className="truncate">{selected.first_name} {selected.last_name}</span>
                {selected.department && (
                  <span className="text-xs flex-shrink-0" style={{ color: C.textMuted }}>· {selected.department}</span>
                )}
              </>
            ) : (
              <span style={{ color: C.textMuted }}>Select employee…</span>
            )
          }
        </span>
        <ChevronDown size={14} color={C.textMuted}
          className={`flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden"
              style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: C.shadow.lift }}>
              <div className="p-2" style={{ borderBottom: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: C.surfaceAlt }}>
                  <Search size={12} color={C.textMuted} />
                  <input autoFocus value={q} onChange={e => setQ(e.target.value)}
                    placeholder="Search employees…"
                    className="flex-1 text-xs outline-none bg-transparent"
                    style={{ color: C.textPrimary }} />
                  {q && (
                    <button onClick={() => setQ("")} className="flex-shrink-0">
                      <X size={10} color={C.textMuted} />
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {loading && (
                  <div className="flex items-center justify-center py-4 gap-2">
                    <Loader2 size={14} className="animate-spin" color={C.textMuted} />
                    <span className="text-xs" style={{ color: C.textMuted }}>Loading…</span>
                  </div>
                )}
                {!loading && filtered.length === 0 && (
                  <p className="px-3 py-4 text-xs text-center" style={{ color: C.textMuted }}>No employees found</p>
                )}
                {!loading && filtered.map(e => (
                  <button key={e.id} type="button"
                    onClick={() => { onChange(e.id); setOpen(false); setQ(""); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors"
                    style={{
                      background: value === e.id ? "#FEE2E2" : "transparent",
                      color: C.textPrimary,
                    }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                      style={{ background: C.danger }}>
                      {e.first_name?.[0]}{e.last_name?.[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs truncate">{e.first_name} {e.last_name}</p>
                      <p className="text-[10px] truncate" style={{ color: C.textMuted }}>
                        {e.department ?? e.job_title ?? e.email ?? ""}
                      </p>
                    </div>
                    {value === e.id && <Check size={12} color={C.danger} className="flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Status Pill ──────────────────────────────────────────────
function StatusPill({ status }) {
  const cfg  = STATUS_CFG[status?.toLowerCase()] ?? STATUS_CFG.active;
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
      style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={10} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────
function ProgressBar({ progress = 0 }) {
  const color = progress >= 80 ? "#047857" : progress >= 40 ? "#92400E" : "#B91C1C";
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#E4E7F0" }}>
        <motion.div className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{ background: color }}
        />
      </div>
      <span className="text-xs font-bold w-8 text-right tabular-nums" style={{ color }}>{progress}%</span>
    </div>
  );
}

// ─── CREATE / EDIT MODAL ──────────────────────────────────────
function PIPModal({ pip, employees, loadingEmployees, onClose, onSaved }) {
  const isEdit = !!pip;

  const [form, setForm] = useState({
    employeeId: pip?.employeeId ?? "",
    reason:     pip?.reason     ?? "",
    reviewDate: pip?.reviewDate ? pip.reviewDate.slice(0, 10) : "",
    period:     pip?.period     ?? "",
    goals:      pip?.goals?.length ? pip.goals : [{ title: "", target: 100 }],
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.employeeId) { setError("Please select an employee."); return; }
    if (!form.reason.trim()) { setError("Reason is required."); return; }
    if (!form.reviewDate)    { setError("Review date is required."); return; }

    setSaving(true); setError("");
    try {
      const validGoals = form.goals.filter(g => g.title.trim());
      if (isEdit) {
        await updatePIP(pip.id, {
          reason:     form.reason.trim(),
          reviewDate: form.reviewDate,
          period:     form.period.trim() || undefined,
          goals:      validGoals,
        });
      } else {
        await createPIP(form.employeeId, {
          reason:     form.reason.trim(),
          reviewDate: form.reviewDate,
          period:     form.period.trim() || undefined,
          goals:      validGoals,
        });
      }
      onSaved(`PIP ${isEdit ? "updated" : "created"} successfully.`);
    } catch (err) {
      setError(err?.response?.data?.message ?? `Failed to ${isEdit ? "update" : "create"} PIP.`);
    } finally {
      setSaving(false);
    }
  };

  const addGoal    = () => set("goals", [...form.goals, { title: "", target: 100 }]);
  const removeGoal = (i) => set("goals", form.goals.filter((_, j) => j !== i));
  const setGoal    = (i, k, v) => {
    const next = [...form.goals];
    next[i] = { ...next[i], [k]: v };
    set("goals", next);
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit"
        className="relative w-full max-w-lg rounded-2xl flex flex-col"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          boxShadow: C.shadow.lift,
          maxHeight: "90vh",
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "#fee2e2" }}>
              <Shield size={15} color={C.danger} />
            </div>
            <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
              {isEdit ? "Edit PIP" : "Create Performance Improvement Plan"}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:opacity-70 transition-opacity"
            style={{ background: C.surfaceAlt }}>
            <X size={14} color={C.textMuted} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "#fee2e2" }}>
              <AlertTriangle size={13} color="#B91C1C" />
              <p className="text-xs" style={{ color: "#B91C1C" }}>{error}</p>
            </div>
          )}

          {/* Employee */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textPrimary }}>
              Employee <span style={{ color: C.danger }}>*</span>
            </label>
            <EmployeeSelect
              employees={employees}
              value={form.employeeId}
              onChange={v => set("employeeId", v)}
              loading={loadingEmployees}
              disabled={isEdit} // can't change employee on edit
            />
            {isEdit && (
              <p className="text-[10px] mt-1" style={{ color: C.textMuted }}>
                Employee cannot be changed after creation.
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textPrimary }}>
              Reason for PIP <span style={{ color: C.danger }}>*</span>
            </label>
            <textarea value={form.reason} onChange={e => set("reason", e.target.value)}
              rows={3} placeholder="Describe the performance issues requiring a PIP…"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }} />
          </div>

          {/* Review Date + Period */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textPrimary }}>
                Review Date <span style={{ color: C.danger }}>*</span>
              </label>
              <input type="date" value={form.reviewDate} onChange={e => set("reviewDate", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textPrimary }}>
                Period <span style={{ color: C.textMuted, fontWeight: 400 }}>(optional)</span>
              </label>
              <input value={form.period} onChange={e => set("period", e.target.value)}
                placeholder="e.g. 90 days"
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }} />
            </div>
          </div>

          {/* Goals */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold" style={{ color: C.textPrimary }}>
                Improvement Goals
              </label>
              <button onClick={addGoal} className="text-xs font-semibold flex items-center gap-1"
                style={{ color: C.danger }}>
                <Plus size={11} /> Add goal
              </button>
            </div>
            <div className="space-y-2">
              {form.goals.map((g, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={g.title} onChange={e => setGoal(i, "title", e.target.value)}
                    placeholder={`Goal ${i + 1} — e.g. Improve attendance rate`}
                    className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }} />
                  <input type="number" min={1} max={100} value={g.target}
                    onChange={e => setGoal(i, "target", Number(e.target.value))}
                    title="Target %"
                    className="w-16 px-2 py-2 rounded-xl text-sm outline-none text-center"
                    style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }} />
                  <span className="text-xs" style={{ color: C.textMuted }}>%</span>
                  {form.goals.length > 1 && (
                    <button onClick={() => removeGoal(i)}
                      className="p-1.5 rounded-full flex-shrink-0"
                      style={{ background: "#fee2e2" }}>
                      <X size={11} color="#B91C1C" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 pb-5 pt-3 flex-shrink-0"
          style={{ borderTop: `1px solid ${C.border}` }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold"
            style={{ background: C.surfaceAlt, color: C.textSecondary, border: `1px solid ${C.border}` }}>
            Cancel
          </button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSubmit} disabled={saving}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: C.danger, opacity: saving ? 0.75 : 1 }}>
            {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : isEdit ? "Save Changes" : "Create PIP"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── PROGRESS MODAL ───────────────────────────────────────────
function ProgressModal({ pip, onClose, onSaved }) {
  const [progress, setProgress] = useState(pip.progress ?? 0);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      await updatePIPProgress(pip.id, progress);
      onSaved("Progress updated successfully.");
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to update progress.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit"
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: C.shadow.lift }}>

        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-2">
            <BarChart2 size={15} color={C.danger} />
            <p className="font-bold text-sm" style={{ color: C.textPrimary }}>Update Progress</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full" style={{ background: C.surfaceAlt }}>
            <X size={14} color={C.textMuted} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "#fee2e2" }}>
              <AlertTriangle size={13} color="#B91C1C" />
              <p className="text-xs" style={{ color: "#B91C1C" }}>{error}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-semibold truncate mb-0.5" style={{ color: C.textPrimary }}>
              {pip.employeeName}
            </p>
            <p className="text-xs line-clamp-2" style={{ color: C.textMuted }}>{pip.reason}</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold" style={{ color: C.textPrimary }}>Progress</span>
              <span className="text-lg font-black tabular-nums" style={{ color: C.danger }}>{progress}%</span>
            </div>
            <ProgressBar progress={progress} />
            <input type="range" min={0} max={100} value={progress}
              onChange={e => setProgress(Number(e.target.value))}
              className="w-full mt-3" style={{ accentColor: C.danger }} />
            {progress === 100 && (
              <p className="text-xs mt-2 text-center font-semibold" style={{ color: "#047857" }}>
 Will be automatically marked as Completed
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold"
            style={{ background: C.surfaceAlt, color: C.textSecondary, border: `1px solid ${C.border}` }}>
            Cancel
          </button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: C.danger, opacity: saving ? 0.75 : 1 }}>
            {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : "Update"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── STATUS MODAL ─────────────────────────────────────────────
function StatusModal({ pip, onClose, onSaved }) {
  const [status,  setStatus]  = useState(pip.status ?? "active");
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const handleSave = async () => {
    if (status === pip.status) { onClose(); return; }
    setSaving(true); setError("");
    try {
      await updatePIPStatus(pip.id, status);
      onSaved(`PIP marked as ${status}.`);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to update status.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div variants={modalAnim} initial="hidden" animate="visible" exit="exit"
        className="relative w-full max-w-xs rounded-2xl overflow-hidden"
        style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: C.shadow.lift }}>

        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <p className="font-bold text-sm" style={{ color: C.textPrimary }}>Change Status</p>
          <button onClick={onClose} className="p-1.5 rounded-full" style={{ background: C.surfaceAlt }}>
            <X size={14} color={C.textMuted} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "#fee2e2" }}>
              <AlertTriangle size={13} color="#B91C1C" />
              <p className="text-xs" style={{ color: "#B91C1C" }}>{error}</p>
            </div>
          )}
          {Object.entries(STATUS_CFG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button key={key} onClick={() => setStatus(key)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-left transition-all"
                style={{
                  background: status === key ? cfg.bg : C.surfaceAlt,
                  border: `2px solid ${status === key ? cfg.color : C.border}`,
                }}>
                <Icon size={15} color={cfg.color} />
                <span className="font-semibold text-sm" style={{ color: status === key ? cfg.color : C.textPrimary }}>
                  {cfg.label}
                </span>
                {status === key && <Check size={13} color={cfg.color} className="ml-auto" />}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold"
            style={{ background: C.surfaceAlt, color: C.textSecondary, border: `1px solid ${C.border}` }}>
            Cancel
          </button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: C.danger, opacity: saving ? 0.75 : 1 }}>
            {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : "Apply"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── PIP ROW ──────────────────────────────────────────────────
function PIPRow({ pip, index, onEdit, onProgress, onStatus }) {
  const reviewDate = pip.reviewDate ? new Date(pip.reviewDate) : null;
  const isOverdue  = reviewDate && reviewDate < new Date() && pip.status === "active";

  return (
    <motion.tr custom={index} variants={fadeUp} initial="hidden" animate="visible"
      className="group border-b" style={{ borderColor: C.border }}>

      {/* Employee */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
            style={{ background: C.danger }}>
            {pip.firstName?.[0]}{pip.lastName?.[0]}
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>{pip.employeeName}</p>
            <p className="text-[10px]" style={{ color: C.textMuted }}>{pip.departmentName ?? ""}</p>
          </div>
        </div>
      </td>

      {/* Reason */}
      <td className="px-5 py-4 max-w-[200px]">
        <p className="text-xs line-clamp-2" style={{ color: C.textSecondary }}>{pip.reason}</p>
      </td>

      {/* Progress */}
      <td className="px-5 py-4 w-36">
        <ProgressBar progress={pip.progress ?? 0} />
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <StatusPill status={pip.status} />
        {isOverdue && (
          <p className="text-[10px] mt-0.5 font-semibold" style={{ color: "#B91C1C" }}>Overdue</p>
        )}
      </td>

      {/* Review Date */}
      <td className="px-5 py-4">
        <span className={`text-xs flex items-center gap-1 ${isOverdue ? "font-semibold" : ""}`}
          style={{ color: isOverdue ? "#B91C1C" : C.textSecondary }}>
          <Calendar size={11} />
          {reviewDate
            ? reviewDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
            : "—"}
        </span>
        {pip.period && (
          <p className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>{pip.period}</p>
        )}
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            onClick={() => onProgress(pip)} title="Update progress"
            className="p-1.5 rounded-full" style={{ background: "#fee2e2", color: C.danger }}>
            <BarChart2 size={13} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            onClick={() => onStatus(pip)} title="Change status"
            className="p-1.5 rounded-full" style={{ background: "#fef3c7", color: "#92400E" }}>
            <TrendingUp size={13} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(pip)} title="Edit PIP"
            className="p-1.5 rounded-full" style={{ background: C.surfaceAlt, color: C.textSecondary }}>
            <Edit2 size={13} />
          </motion.button>
        </div>
      </td>
    </motion.tr>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function PIPManagement() {
  const [pips,             setPips]            = useState([]);
  const [employees,        setEmployees]        = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [error,            setError]            = useState(null);
  const [statusFilter,     setStatusFilter]     = useState("");
  const [modal,            setModal]            = useState(null); // "create"|"edit"|"progress"|"status"
  const [selected,         setSelected]         = useState(null);
  const [toast,            setToast]            = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const loadPIPs = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await listPIPs(statusFilter ? { status: statusFilter } : {});
      const list = res?.pips ?? res?.data ?? (Array.isArray(res) ? res : []);
      setPips(list);
    } catch {
      setError("Failed to load PIPs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const loadEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    try {
      const res  = await getEmployees({ limit: 500 });
      const list = res?.employees ?? res?.data ?? (Array.isArray(res) ? res : []);
      setEmployees(list);
    } catch { /* non-fatal */ } finally {
      setLoadingEmployees(false);
    }
  }, []);

  useEffect(() => { loadPIPs(); },    [loadPIPs]);
  useEffect(() => { loadEmployees(); }, [loadEmployees]);

  const handleSaved = (msg) => { setModal(null); setSelected(null); loadPIPs(); showToast(msg); };

  // Stats
  const stats = useMemo(() => ({
    total:     pips.length,
    active:    pips.filter(p => p.status === "active").length,
    completed: pips.filter(p => p.status === "completed").length,
    failed:    pips.filter(p => p.status === "failed").length,
  }), [pips]);

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg" style={{ color: C.textPrimary }}>
            Performance Improvement Plans
          </h2>
          <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
            {stats.total} total · {stats.active} active · {stats.completed} completed
            {stats.failed > 0 && <span style={{ color: "#B91C1C" }}> · {stats.failed} failed</span>}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <motion.button whileHover={{ scale: 1.04 }} onClick={loadPIPs}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.textSecondary }}>
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => { setSelected(null); setModal("create"); }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold text-white"
            style={{ background: C.danger }}>
            <Plus size={14} /> Create New PIP
          </motion.button>
        </div>
      </div>

      {/* ── Status filters ── */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "",          label: "All" },
          { key: "active",    label: "Active" },
          { key: "completed", label: "Completed" },
          { key: "failed",    label: "Failed" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setStatusFilter(key)}
            className="text-[11px] font-bold px-3 py-1.5 rounded-full transition-all"
            style={{
              background: statusFilter === key ? C.danger : C.surface,
              color:      statusFilter === key ? "#fff" : C.textSecondary,
              border:    `1px solid ${statusFilter === key ? C.danger : C.border}`,
            }}>
            {label}
            {key === ""          && ` (${stats.total})`}
            {key === "active"    && ` (${stats.active})`}
            {key === "completed" && ` (${stats.completed})`}
            {key === "failed"    && stats.failed > 0 && ` (${stats.failed})`}
          </button>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "#fee2e2" }}>
          <AlertTriangle size={16} color="#B91C1C" />
          <p className="text-sm" style={{ color: "#B91C1C" }}>{error}</p>
          <button onClick={loadPIPs} className="ml-auto text-xs font-semibold underline"
            style={{ color: "#B91C1C" }}>Retry</button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: C.surface, borderColor: C.border }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr style={{ background: C.surfaceAlt }}>
                {["Employee", "Reason", "Progress", "Status", "Review Date", ""].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wide"
                    style={{ color: C.textMuted }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b" style={{ borderColor: C.border }}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 rounded-lg animate-pulse"
                          style={{ background: C.surfaceAlt, width: j === 1 ? "75%" : "55%" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pips.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: "#fee2e2" }}>
                        <Shield size={22} color={C.danger} />
                      </div>
                      <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                        {statusFilter ? `No PIPs with status "${statusFilter}".` : "No PIPs found."}
                      </p>
                      {!statusFilter && (
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                          onClick={() => setModal("create")}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white"
                          style={{ background: C.danger }}>
                          <Plus size={13} /> Create First PIP
                        </motion.button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                pips.map((pip, i) => (
                  <PIPRow key={pip.id ?? i} pip={pip} index={i}
                    onEdit={p    => { setSelected(p); setModal("edit"); }}
                    onProgress={p => { setSelected(p); setModal("progress"); }}
                    onStatus={p  => { setSelected(p); setModal("status"); }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && pips.length > 0 && (
          <div className="px-5 py-3 border-t" style={{ borderColor: C.border }}>
            <p className="text-xs" style={{ color: C.textMuted }}>
              Showing {pips.length} PIP{pips.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {(modal === "create" || modal === "edit") && (
          <PIPModal key="pip-modal"
            pip={modal === "edit" ? selected : null}
            employees={employees}
            loadingEmployees={loadingEmployees}
            onClose={() => { setModal(null); setSelected(null); }}
            onSaved={handleSaved}
          />
        )}
        {modal === "progress" && selected && (
          <ProgressModal key="progress-modal" pip={selected}
            onClose={() => { setModal(null); setSelected(null); }}
            onSaved={handleSaved}
          />
        )}
        {modal === "status" && selected && (
          <StatusModal key="status-modal" pip={selected}
            onClose={() => { setModal(null); setSelected(null); }}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl z-50"
            style={{ background: "#334155", color: "#fff", boxShadow: C.shadow.lift, minWidth: 260 }}>
            <CheckCircle2 size={14} color="#10b981" />
            <span className="text-sm font-medium">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}