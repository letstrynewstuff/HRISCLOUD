// src/admin/payroll/SalaryConfiguration.jsx
import { useState, useEffect, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import {
  getStructures,
  createStructure,
  updateStructure,
} from "../../api/service/payrollApi";
import { gradeApi } from "../../api/service/gradeApi"; // Adjust path as necessary
import { C } from "../employeemanagement/sharedData";

const fmt = (n) => (n ? `₦${Number(n).toLocaleString()}` : "—");

export default function SalaryConfiguration() {
  const [structures, setStructures] = useState([]);
  const [grades, setGrades] = useState([]); // Grades now managed via state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    grade: "",
    basic_salary: "",
    housing_allowance: "",
    transport_allowance: "",
    medical_allowance: "",
    other_allowances: "",
  });
  const [formErr, setFormErr] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetching both structures and grades from API
      const [structRes, gradeRes] = await Promise.all([
        getStructures(),
        gradeApi.list(),
      ]);

      setStructures(structRes.data ?? []);
      // Handling potential Axios response wrapping or direct data return
      setGrades(gradeRes.data ?? gradeRes ?? []);
    } catch (e) {
      setError(
        e?.response?.data?.message ??
          "Failed to load salary configuration data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const gross = (f) =>
    [
      "basic_salary",
      "housing_allowance",
      "transport_allowance",
      "medical_allowance",
      "other_allowances",
    ].reduce((s, k) => s + (Number(f[k]) || 0), 0);

  const openCreate = () => {
    setEditTarget(null);
    setForm({
      name: "",
      grade: "",
      basic_salary: "",
      housing_allowance: "",
      transport_allowance: "",
      medical_allowance: "",
      other_allowances: "",
    });
    setFormErr({});
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditTarget(s);
    setForm({
      name: s.name,
      grade: s.grade ?? "",
      basic_salary: String(s.basic_salary ?? ""),
      housing_allowance: String(s.housing_allowance ?? ""),
      transport_allowance: String(s.transport_allowance ?? ""),
      medical_allowance: String(s.medical_allowance ?? ""),
      other_allowances: String(s.other_allowances ?? ""),
    });
    setFormErr({});
    setShowModal(true);
  };

  const handleSave = async () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!form.basic_salary) errs.basic_salary = "Required";
    setFormErr(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        grade: form.grade || undefined,
        basic_salary: Number(form.basic_salary),
        housing_allowance: Number(form.housing_allowance) || 0,
        transport_allowance: Number(form.transport_allowance) || 0,
        medical_allowance: Number(form.medical_allowance) || 0,
        other_allowances: Number(form.other_allowances) || 0,
      };
      if (editTarget) {
        const res = await updateStructure(editTarget.id, payload);
        const updatedData = res.data ?? res;
        setStructures((prev) =>
          prev.map((s) => (s.id === editTarget.id ? updatedData : s)),
        );
      } else {
        const res = await createStructure(payload);
        const newData = res.data ?? res;
        setStructures((prev) => [newData, ...prev]);
      }
      setShowModal(false);
    } catch (e) {
      setFormErr({ api: e?.response?.data?.message ?? "Save failed." });
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: "housing_allowance", label: "Housing Allowance (₦)" },
    { key: "transport_allowance", label: "Transport Allowance (₦)" },
    { key: "medical_allowance", label: "Medical Allowance (₦)" },
    { key: "other_allowances", label: "Other Allowances (₦)" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="font-semibold text-lg"
            style={{ color: C.textPrimary }}
          >
            Salary Structures
          </h2>
          <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
            Define salary bands applied during payroll calculation.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="px-3 py-2 rounded-xl"
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={12} color={C.textMuted} />
          </button>
          <Motion.button
            whileHover={{ scale: 1.02 }}
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white"
            style={{ background: C.primary, border: "none", cursor: "pointer" }}
          >
            <Plus size={14} /> New Structure
          </Motion.button>
        </div>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 p-3 rounded-xl"
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
      ) : structures.length === 0 ? (
        <div
          className="py-16 text-center rounded-2xl"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}
        >
          <DollarSign size={40} color={C.textMuted} className="mx-auto mb-3" />
          <p className="font-bold" style={{ color: C.textSecondary }}>
            No salary structures yet
          </p>
          <p className="text-sm mt-1" style={{ color: C.textMuted }}>
            Create a structure to define salary bands.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {structures.map((s) => {
            // Finding grade level details from the API-fetched grades list
            const gradeInfo = grades.find((g) => g.name === s.grade);
            const grossVal =
              (s.basic_salary ?? 0) +
              (s.housing_allowance ?? 0) +
              (s.transport_allowance ?? 0) +
              (s.medical_allowance ?? 0) +
              (s.other_allowances ?? 0);

            return (
              <Motion.div
                key={s.id}
                whileHover={{ y: -3 }}
                className="rounded-2xl p-5 border"
                style={{
                  background: C.surface,
                  borderColor: C.border,
                  boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: C.textPrimary }}
                    >
                      {s.name}
                    </p>
                    {gradeInfo && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block"
                        style={{
                          background: gradeInfo.bg || C.border,
                          color: gradeInfo.color || C.textPrimary,
                        }}
                      >
                        {gradeInfo.name}
                      </span>
                    )}
                  </div>
                  <Motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => openEdit(s)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{
                      background: C.primaryLight,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <Edit2 size={11} color={C.primary} />
                  </Motion.button>
                </div>
                <div
                  className="space-y-1.5 text-xs"
                  style={{ color: C.textSecondary }}
                >
                  {[
                    ["Basic Salary", s.basic_salary],
                    ["Housing", s.housing_allowance],
                    ["Transport", s.transport_allowance],
                    ["Medical", s.medical_allowance],
                  ]
                    .filter(([, v]) => v > 0)
                    .map(([l, v]) => (
                      <div key={l} className="flex justify-between">
                        <span>{l}</span>
                        <span
                          className="font-medium"
                          style={{ color: C.textPrimary }}
                        >
                          {fmt(v)}
                        </span>
                      </div>
                    ))}
                </div>
                <div
                  className="mt-3 pt-3 flex justify-between"
                  style={{ borderTop: `1px solid ${C.border}` }}
                >
                  <span
                    className="text-xs font-bold"
                    style={{ color: C.primary }}
                  >
                    Gross
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: C.primary }}
                  >
                    {fmt(grossVal)}
                  </span>
                </div>
              </Motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setShowModal(false)}
            />
            <Motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col"
              style={{
                background: C.surface,
                borderLeft: `1px solid ${C.border}`,
                boxShadow: "-8px 0 40px rgba(15,23,42,0.14)",
              }}
            >
              <div
                className="px-6 py-5 flex items-center justify-between shrink-0"
                style={{
                  background: `linear-gradient(135deg,${C.navy},${C.primary})`,
                }}
              >
                <div>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">
                    {editTarget ? "Edit Structure" : "New Structure"}
                  </p>
                  <h3
                    className="text-white font-bold mt-0.5"
                    style={{ fontFamily: "Sora,sans-serif" }}
                  >
                    {editTarget ? editTarget.name : "Create Salary Structure"}
                  </h3>
                </div>
                <Motion.button
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
                </Motion.button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                    Structure Name *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g. Mid-Level Engineer"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{
                      background: C.surfaceAlt,
                      border: `1.5px solid ${formErr.name ? C.danger : C.border}`,
                      color: C.textPrimary,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: C.textPrimary }}
                  >
                    Grade Level
                  </label>
                  <select
                    value={form.grade}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, grade: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none"
                    style={{
                      background: C.surfaceAlt,
                      border: `1.5px solid ${C.border}`,
                      color: C.textPrimary,
                    }}
                  >
                    <option value="">No grade</option>
                    {grades.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: C.textPrimary }}
                  >
                    Basic Salary (₦) *
                  </label>
                  <input
                    type="number"
                    value={form.basic_salary}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, basic_salary: e.target.value }))
                    }
                    placeholder="e.g. 750000"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{
                      background: C.surfaceAlt,
                      border: `1.5px solid ${formErr.basic_salary ? C.danger : C.border}`,
                      color: C.textPrimary,
                    }}
                  />
                </div>

                {fields.map(({ key, label }) => (
                  <div key={key}>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: C.textPrimary }}
                    >
                      {label}
                    </label>
                    <input
                      type="number"
                      value={form[key]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{
                        background: C.surfaceAlt,
                        border: `1.5px solid ${C.border}`,
                        color: C.textPrimary,
                      }}
                    />
                  </div>
                ))}

                {gross(form) > 0 && (
                  <div
                    className="p-4 rounded-xl"
                    style={{ background: C.primaryLight }}
                  >
                    <div className="flex justify-between">
                      <span
                        className="text-sm font-bold"
                        style={{ color: C.primary }}
                      >
                        Gross Total
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: C.primary }}
                      >
                        ₦{gross(form).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div
                className="px-6 py-4 flex gap-3 shrink-0"
                style={{ borderTop: `1px solid ${C.border}` }}
              >
                <Motion.button
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
                </Motion.button>
                <Motion.button
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
                    "Save Changes"
                  ) : (
                    "Create Structure"
                  )}
                </Motion.button>
              </div>
            </Motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
