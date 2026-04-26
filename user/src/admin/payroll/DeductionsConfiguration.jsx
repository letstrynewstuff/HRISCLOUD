// src/admin/payroll/DeductionsConfiguration.jsx
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
} from "lucide-react";
import {
  getDeductions,
  createDeduction,
  updateDeduction,
  toggleDeduction,
  deleteDeduction,
} from "../../api/service/payrollApi";
import { C } from "../employeemanagement/sharedData";

const STATUTORY = [
  {
    name: "PAYE Tax",
    type: "progressive",
    note: "Computed per FIRS tax table",
  },
  {
    name: "Pension (Employee 8%)",
    type: "percent",
    value: 8,
    note: "PENCOM — on basic + housing + transport",
  },
  {
    name: "NHF (2.5%)",
    type: "percent",
    value: 2.5,
    note: "National Housing Fund",
  },
];

export default function DeductionsConfiguration() {
  const [deductions, setDeductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "percent",
    value: "",
    is_active: true,
  });
  const [formErr, setFormErr] = useState({});

  const fetchDeductions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDeductions();
      setDeductions(res.data ?? []);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load deductions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeductions();
  }, [fetchDeductions]);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ name: "", type: "percent", value: "", is_active: true });
    setFormErr({});
    setShowModal(true);
  };
  const openEdit = (d) => {
    setEditTarget(d);
    setForm({
      name: d.name,
      type: d.type,
      value: String(d.value),
      is_active: d.is_active,
    });
    setFormErr({});
    setShowModal(true);
  };

  const handleSave = async () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!form.value) errs.value = "Required";
    else if (isNaN(Number(form.value))) errs.value = "Must be a number";
    setFormErr(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        value: Number(form.value),
        is_active: form.is_active,
      };
      if (editTarget) {
        const res = await updateDeduction(editTarget.id, payload);
        setDeductions((prev) =>
          prev.map((d) => (d.id === editTarget.id ? (res.data ?? res) : d)),
        );
      } else {
        const res = await createDeduction(payload);
        setDeductions((prev) => [res.data ?? res, ...prev]);
      }
      setShowModal(false);
    } catch (e) {
      setFormErr({ api: e?.response?.data?.message ?? "Save failed." });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (ded) => {
    try {
      await toggleDeduction(ded.id);
      setDeductions((prev) =>
        prev.map((d) =>
          d.id === ded.id ? { ...d, is_active: !d.is_active } : d,
        ),
      );
    } catch (e) {
      setError("Toggle failed.");
    }
  };

  const handleDelete = async (ded) => {
    if (!window.confirm(`Delete "${ded.name}"?`)) return;
    try {
      await deleteDeduction(ded.id);
      setDeductions((prev) => prev.filter((d) => d.id !== ded.id));
    } catch (e) {
      setError("Delete failed.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Statutory — fixed, informational */}
      <div>
        <h2
          className="font-semibold text-lg mb-4"
          style={{ color: C.textPrimary }}
        >
          Statutory Deductions (Nigeria)
        </h2>
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: C.surface, borderColor: C.border }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ background: C.surfaceAlt }}>
                {["Deduction", "Calculation", "Rate / Note", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-bold uppercase"
                      style={{ color: C.textMuted }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {STATUTORY.map((ded, i) => (
                <tr
                  key={i}
                  className="border-b"
                  style={{ borderColor: C.border }}
                >
                  <td
                    className="px-6 py-4 font-medium text-sm"
                    style={{ color: C.textPrimary }}
                  >
                    {ded.name}
                  </td>
                  <td
                    className="px-6 py-4 text-xs capitalize"
                    style={{ color: C.textSecondary }}
                  >
                    {ded.type}
                  </td>
                  <td
                    className="px-6 py-4 text-xs"
                    style={{ color: C.textSecondary }}
                  >
                    {ded.note}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs rounded-full font-semibold bg-emerald-100 text-emerald-700">
                      Always Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom deductions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="font-semibold text-lg"
            style={{ color: C.textPrimary }}
          >
            Custom Deductions
          </h2>
          <div className="flex gap-2">
            <button
              onClick={fetchDeductions}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs"
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                color: C.textSecondary,
                cursor: "pointer",
              }}
            >
              <RefreshCw size={11} />
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCreate}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white"
              style={{
                background: C.primary,
                border: "none",
                cursor: "pointer",
              }}
            >
              <Plus size={15} /> Add Deduction
            </motion.button>
          </div>
        </div>

        {error && (
          <div
            className="flex items-center gap-2 p-3 rounded-xl mb-4"
            style={{
              background: C.dangerLight,
              border: `1px solid ${C.danger}33`,
            }}
          >
            <AlertCircle size={14} color={C.danger} />
            <p className="text-xs" style={{ color: C.danger }}>
              {error}
            </p>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center">
            <Loader2
              size={24}
              color={C.primary}
              className="animate-spin mx-auto"
            />
          </div>
        ) : deductions.length === 0 ? (
          <div
            className="rounded-2xl border p-12 text-center"
            style={{ background: C.surface, borderColor: C.border }}
          >
            <p className="text-sm" style={{ color: C.textMuted }}>
              No custom deductions yet. Add one above.
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
                  {["Name", "Type", "Value", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-bold uppercase"
                      style={{ color: C.textMuted }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deductions.map((ded) => (
                  <motion.tr
                    key={ded.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b group"
                    style={{ borderColor: C.border }}
                  >
                    <td
                      className="px-6 py-4 font-medium text-sm"
                      style={{ color: C.textPrimary }}
                    >
                      {ded.name}
                    </td>
                    <td
                      className="px-6 py-4 text-xs capitalize"
                      style={{ color: C.textSecondary }}
                    >
                      {ded.type}
                    </td>
                    <td
                      className="px-6 py-4 font-semibold text-sm"
                      style={{ color: C.textPrimary }}
                    >
                      {ded.type === "percent"
                        ? `${ded.value}%`
                        : `₦${Number(ded.value).toLocaleString()}`}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(ded)}
                        className="flex items-center gap-1.5 text-xs font-semibold"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        {ded.is_active ? (
                          <ToggleRight size={20} color={C.success} />
                        ) : (
                          <ToggleLeft size={20} color={C.textMuted} />
                        )}
                        <span
                          style={{
                            color: ded.is_active ? C.success : C.textMuted,
                          }}
                        >
                          {ded.is_active ? "Active" : "Inactive"}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => openEdit(ded)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{
                            background: C.primaryLight,
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <Edit2 size={12} color={C.primary} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => handleDelete(ded)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{
                            background: C.dangerLight,
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={12} color={C.danger} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4"
            >
              <div
                className="rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  className="px-6 py-5 flex items-center justify-between"
                  style={{
                    background: `linear-gradient(135deg,${C.navy},${C.primary})`,
                  }}
                >
                  <h3
                    className="text-white font-bold"
                    style={{ fontFamily: "Sora,sans-serif" }}
                  >
                    {editTarget ? "Edit Deduction" : "Add Custom Deduction"}
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    onClick={() => setShowModal(false)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <X size={14} color="#fff" />
                  </motion.button>
                </div>
                <div className="p-6 space-y-4">
                  {formErr.api && (
                    <p
                      className="text-xs p-3 rounded-xl"
                      style={{ background: C.dangerLight, color: C.danger }}
                    >
                      {formErr.api}
                    </p>
                  )}
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: C.textPrimary }}
                    >
                      Deduction Name *
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="e.g. Cooperative Contribution"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{
                        background: C.surfaceAlt,
                        border: `1.5px solid ${formErr.name ? C.danger : form.name ? C.primary + "66" : C.border}`,
                        color: C.textPrimary,
                      }}
                    />
                    {formErr.name && (
                      <p
                        className="text-[11px] mt-1"
                        style={{ color: C.danger }}
                      >
                        {formErr.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: C.textPrimary }}
                    >
                      Type
                    </label>
                    <div className="flex gap-3">
                      {[
                        ["percent", "Percentage (%)"],
                        ["fixed", "Fixed Amount (₦)"],
                      ].map(([val, label]) => (
                        <button
                          key={val}
                          onClick={() => setForm((f) => ({ ...f, type: val }))}
                          className="flex-1 py-3 rounded-xl text-sm font-medium"
                          style={{
                            background:
                              form.type === val ? C.primary : C.surfaceAlt,
                            color: form.type === val ? "#fff" : C.textSecondary,
                            border: `1.5px solid ${form.type === val ? C.primary : C.border}`,
                            cursor: "pointer",
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: C.textPrimary }}
                    >
                      Value {form.type === "percent" ? "(%)" : "(₦)"} *
                    </label>
                    <input
                      type="number"
                      value={form.value}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, value: e.target.value }))
                      }
                      placeholder={form.type === "percent" ? "5" : "85000"}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{
                        background: C.surfaceAlt,
                        border: `1.5px solid ${formErr.value ? C.danger : C.border}`,
                        color: C.textPrimary,
                      }}
                    />
                    {formErr.value && (
                      <p
                        className="text-[11px] mt-1"
                        style={{ color: C.danger }}
                      >
                        {formErr.value}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setForm((f) => ({ ...f, is_active: !f.is_active }))
                      }
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {form.is_active ? (
                        <ToggleRight size={26} color={C.primary} />
                      ) : (
                        <ToggleLeft size={26} color={C.textMuted} />
                      )}
                    </button>
                    <span
                      className="text-sm"
                      style={{ color: C.textSecondary }}
                    >
                      Active by default
                    </span>
                  </div>
                </div>
                <div
                  className="p-6 flex gap-3"
                  style={{ borderTop: `1px solid ${C.border}` }}
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{
                      background: C.surfaceAlt,
                      color: C.textSecondary,
                      border: `1px solid ${C.border}`,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                    style={{
                      background: C.primary,
                      border: "none",
                      cursor: saving ? "not-allowed" : "pointer",
                    }}
                  >
                    {saving ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Saving…
                      </>
                    ) : editTarget ? (
                      "Update"
                    ) : (
                      "Add Deduction"
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
