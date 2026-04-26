// src/admin/training/TrainingCatalog.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Save,
  GraduationCap,
  Users,
  Loader2,
  AlertCircle,
  UserPlus,
  Check,
  Search as SearchIcon,
} from "lucide-react";
import {
  listTrainings,
  createTraining,
  assignTraining,
  getEnrollments,
} from "../../api/service/trainingApi";
import { getEmployees } from "../../api/service/employeeApi";
import { C } from "../employeemanagement/sharedData";

/* ─── Field helper ─── */
const Inp = ({ label, required, error, children }) => (
  <div>
    <label
      className="block text-xs font-semibold mb-1.5"
      style={{ color: C.textPrimary }}
    >
      {label} {required && <span style={{ color: C.danger }}>*</span>}
    </label>
    {children}
    {error && (
      <p className="text-[11px] mt-1" style={{ color: C.danger }}>
        {error}
      </p>
    )}
  </div>
);

const inputStyle = (hasValue) => ({
  background: C.surfaceAlt,
  border: `1.5px solid ${hasValue ? C.primary + "66" : C.border}`,
  color: C.textPrimary,
});

/* ─── Assign Modal ─── */
function AssignModal({ training, onClose, onAssigned }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [apiErr, setApiErr] = useState(null);

  useEffect(() => {
    getEmployees({ limit: 100, status: "active" })
      .then((r) => setEmployees(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      !q ||
      `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
      e.employee_code.toLowerCase().includes(q)
    );
  });

  const toggle = (id) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const handleAssign = async () => {
    if (!selected.size) return;
    setSaving(true);
    setApiErr(null);
    try {
      await assignTraining(training.id, [...selected]);
      onAssigned([...selected].length);
    } catch (e) {
      setApiErr(e?.response?.data?.message ?? "Assignment failed.");
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg px-4"
      >
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}
        >
          {/* Header */}
          <div
            className="px-6 py-5 flex items-center justify-between"
            style={{
              background: `linear-gradient(135deg,#1E1B4B,${C.primary})`,
            }}
          >
            <div>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">
                Assign Training
              </p>
              <h3
                className="text-white font-bold mt-0.5"
                style={{ fontFamily: "Sora,sans-serif" }}
              >
                {training.title}
              </h3>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              onClick={onClose}
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

          {/* Search */}
          <div className="px-6 pt-4">
            <div className="relative">
              <SearchIcon
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                color={C.textMuted}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employees…"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl outline-none"
                style={inputStyle(search)}
              />
            </div>
            {selected.size > 0 && (
              <p
                className="text-xs mt-2 font-semibold"
                style={{ color: C.primary }}
              >
                {selected.size} selected
              </p>
            )}
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto px-6 py-3 space-y-1">
            {loading ? (
              <div className="py-8 text-center">
                <Loader2
                  size={20}
                  color={C.primary}
                  className="animate-spin mx-auto"
                />
              </div>
            ) : (
              filtered.map((emp) => {
                const isSelected = selected.has(emp.id);
                const name = `${emp.first_name} ${emp.last_name}`;
                return (
                  <motion.div
                    key={emp.id}
                    whileHover={{ x: 2 }}
                    onClick={() => toggle(emp.id)}
                    className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer"
                    style={{
                      background: isSelected ? C.primaryLight : "transparent",
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                      style={{
                        background: isSelected ? C.primary : C.surface,
                        border: `1.5px solid ${isSelected ? C.primary : C.border}`,
                      }}
                    >
                      {isSelected && <Check size={10} color="#fff" />}
                    </div>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: C.primary }}
                    >
                      {name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: C.textPrimary }}
                      >
                        {name}
                      </p>
                      <p className="text-[11px]" style={{ color: C.textMuted }}>
                        {emp.employee_code} · {emp.department_name ?? "—"}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {apiErr && (
            <p className="px-6 text-xs" style={{ color: C.danger }}>
              {apiErr}
            </p>
          )}

          {/* Footer */}
          <div
            className="px-6 py-4 flex gap-3"
            style={{ borderTop: `1px solid ${C.border}` }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={onClose}
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
              onClick={handleAssign}
              disabled={saving || !selected.size}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-white"
              style={{
                background: C.primary,
                cursor: saving || !selected.size ? "not-allowed" : "pointer",
                opacity: selected.size ? 1 : 0.5,
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Assigning…
                </>
              ) : (
                <>
                  <UserPlus size={13} />
                  Assign {selected.size > 0 ? `(${selected.size})` : ""}
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Main ─── */
export default function TrainingCatalog({ searchQuery }) {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState({});
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    title: "",
    type: "Internal",
    provider: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    link: "",
    cost: "",
    maxAttendees: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const fetchTrainings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterType !== "All") params.type = filterType;
      if (searchQuery) params.search = searchQuery;
      const res = await listTrainings(params);
      setTrainings(res.data ?? []);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load trainings.");
    } finally {
      setLoading(false);
    }
  }, [filterType, searchQuery]);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreate = async () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Required";
    if (!form.provider.trim()) errs.provider = "Required";
    if (!form.startDate) errs.startDate = "Required";
    setFormErr(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        type: form.type,
        provider: form.provider.trim(),
        description: form.description || undefined,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        location: form.location || undefined,
        link: form.link || undefined,
        cost: form.cost ? Number(form.cost) : undefined,
        maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : undefined,
      };
      const res = await createTraining(payload);
      setTrainings((prev) => [res.data, ...prev]);
      setShowCreate(false);
      setForm({
        title: "",
        type: "Internal",
        provider: "",
        description: "",
        startDate: "",
        endDate: "",
        location: "",
        link: "",
        cost: "",
        maxAttendees: "",
      });
      showToast("Training created successfully.");
    } catch (e) {
      setFormErr({
        api: e?.response?.data?.message ?? "Failed to create training.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAssigned = (count) => {
    setAssignTarget(null);
    showToast(
      `${count} employee${count !== 1 ? "s" : ""} assigned successfully.`,
    );
    fetchTrainings();
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2"
            style={{ background: C.success, color: "#fff" }}
          >
            <Check size={14} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & New Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {["All", "Internal", "External"].map((t) => (
            <motion.button
              key={t}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterType(t)}
              className="px-4 py-1.5 text-xs rounded-xl font-medium transition-all"
              style={{
                background: filterType === t ? C.primary : C.surface,
                color: filterType === t ? "#fff" : C.textSecondary,
                border: `1px solid ${filterType !== t ? C.border : "transparent"}`,
                cursor: "pointer",
              }}
            >
              {t}
            </motion.button>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl shadow-sm text-white"
          style={{ background: C.primary, border: "none", cursor: "pointer" }}
        >
          <Plus size={16} /> New Training Program
        </motion.button>
      </div>

      {error && (
        <div
          className="flex items-center gap-3 p-4 rounded-2xl"
          style={{
            background: C.dangerLight,
            border: `1px solid ${C.danger}33`,
          }}
        >
          <AlertCircle size={16} color={C.danger} />
          <p
            className="text-sm font-semibold flex-1"
            style={{ color: C.danger }}
          >
            {error}
          </p>
          <button
            onClick={fetchTrainings}
            className="text-xs font-bold px-3 py-1 rounded-lg"
            style={{
              background: C.danger,
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-2xl animate-pulse"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            />
          ))}
        </div>
      ) : trainings.length === 0 ? (
        <div className="py-16 text-center">
          <GraduationCap
            size={44}
            color={C.textMuted}
            className="mx-auto mb-3"
          />
          <p className="font-bold" style={{ color: C.textSecondary }}>
            No trainings found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trainings.map((training, i) => (
            <motion.div
              key={training.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{
                y: -4,
                boxShadow: "0 20px 40px rgba(79,70,229,0.12)",
              }}
              className="rounded-2xl border overflow-hidden"
              style={{ background: C.surface, borderColor: C.border }}
            >
              <div
                className="h-1.5"
                style={{
                  background:
                    training.type === "Internal" ? C.primary : "#06B6D4",
                }}
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3
                    className="font-semibold text-[15px] leading-tight pr-2"
                    style={{ color: C.textPrimary }}
                  >
                    {training.title}
                  </h3>
                  <span
                    className="text-[10px] px-3 py-0.5 rounded-full font-medium shrink-0"
                    style={{
                      background:
                        training.type === "Internal"
                          ? C.primaryLight
                          : "#ECFEFF",
                      color:
                        training.type === "Internal" ? C.primary : "#06B6D4",
                    }}
                  >
                    {training.type}
                  </span>
                </div>
                <p
                  className="text-xs mb-4 line-clamp-1"
                  style={{ color: C.textSecondary }}
                >
                  {training.provider}
                </p>

                <div
                  className="flex justify-between text-xs pt-4"
                  style={{ borderTop: `1px solid ${C.border}` }}
                >
                  <div>
                    {training.cost && (
                      <span
                        className="font-medium"
                        style={{ color: C.textPrimary }}
                      >
                        ₦{(training.cost / 1000).toFixed(0)}K
                      </span>
                    )}
                    {training.start_date && (
                      <span className="ml-2" style={{ color: C.textMuted }}>
                        {new Date(training.start_date).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short" },
                        )}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: C.textMuted }}>
                      <Users size={11} className="inline mr-1" />
                      {training.enrolled_count ?? 0}/
                      {training.max_attendees ?? "∞"}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAssignTarget(training)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold"
                      style={{
                        background: C.primaryLight,
                        color: C.primary,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <UserPlus size={10} /> Assign
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => !saving && setShowCreate(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg px-4 max-h-[90vh] overflow-y-auto"
            >
              <div
                className="rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                {/* Header */}
                <div
                  className="px-6 py-5 flex items-center justify-between"
                  style={{
                    background: `linear-gradient(135deg,#1E1B4B,${C.primary})`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.15)" }}
                    >
                      <GraduationCap size={20} color="#fff" />
                    </div>
                    <div>
                      <p className="text-white font-bold">
                        Create New Training Program
                      </p>
                      <p className="text-white/60 text-xs">Add to catalog</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    onClick={() => setShowCreate(false)}
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

                  <Inp label="Training Title" required error={formErr.title}>
                    <input
                      value={form.title}
                      onChange={(e) => set("title", e.target.value)}
                      placeholder="e.g. Advanced Python for Data Science"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={inputStyle(form.title)}
                    />
                  </Inp>

                  <div className="grid grid-cols-2 gap-4">
                    <Inp label="Type">
                      <select
                        value={form.type}
                        onChange={(e) => set("type", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none"
                        style={inputStyle(true)}
                      >
                        <option>Internal</option>
                        <option>External</option>
                      </select>
                    </Inp>
                    <Inp label="Provider" required error={formErr.provider}>
                      <input
                        value={form.provider}
                        onChange={(e) => set("provider", e.target.value)}
                        placeholder="e.g. Coursera"
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                        style={inputStyle(form.provider)}
                      />
                    </Inp>
                  </div>

                  <Inp label="Description">
                    <textarea
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      rows={2}
                      placeholder="Brief overview of training objectives…"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                      style={inputStyle(form.description)}
                    />
                  </Inp>

                  <div className="grid grid-cols-2 gap-4">
                    <Inp label="Start Date" required error={formErr.startDate}>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => set("startDate", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                        style={inputStyle(form.startDate)}
                      />
                    </Inp>
                    <Inp label="End Date">
                      <input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => set("endDate", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                        style={inputStyle(form.endDate)}
                      />
                    </Inp>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Inp label="Cost (₦)">
                      <input
                        type="number"
                        value={form.cost}
                        onChange={(e) => set("cost", e.target.value)}
                        placeholder="450000"
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                        style={inputStyle(form.cost)}
                      />
                    </Inp>
                    <Inp label="Max Attendees">
                      <input
                        type="number"
                        value={form.maxAttendees}
                        onChange={(e) => set("maxAttendees", e.target.value)}
                        placeholder="25"
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                        style={inputStyle(form.maxAttendees)}
                      />
                    </Inp>
                  </div>

                  <Inp label="Location / Virtual Link">
                    <input
                      value={form.location}
                      onChange={(e) => set("location", e.target.value)}
                      placeholder="Lagos Office or https://zoom.us/…"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={inputStyle(form.location)}
                    />
                  </Inp>
                </div>

                <div
                  className="p-6 flex gap-3"
                  style={{ borderTop: `1px solid ${C.border}` }}
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm"
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
                    onClick={handleCreate}
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 text-white"
                    style={{
                      background: C.primary,
                      cursor: saving ? "not-allowed" : "pointer",
                      opacity: saving ? 0.8 : 1,
                    }}
                  >
                    {saving ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        Create Training
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Assign Modal */}
      <AnimatePresence>
        {assignTarget && (
          <AssignModal
            key="assign"
            training={assignTarget}
            onClose={() => setAssignTarget(null)}
            onAssigned={handleAssigned}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
