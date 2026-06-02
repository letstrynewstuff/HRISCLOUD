// src/admin/employeemanagement/DepartmentsPage.jsx
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Bell,
  Search,
  Menu,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  Users,
  MoreHorizontal,
  X,
  Check,
  Loader2,
  AlertTriangle,
  Grid3X3,
  List,
  Eye,
  CheckCircle2,
  AlertCircle,
  UserCircle2,
  Crown,
  UserCheck,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { C } from "./sharedData";
import { departmentApi } from "../../api/service/departmentApi";
import { getEmployees, updateEmployee } from "../../api/service/employeeApi";

// ─── Colour palette ───────────────────────────────────────────
const PALETTE = [
  { color: C.primary, bg: C.primaryLight },
  { color: C.accent, bg: C.accentLight },
  { color: C.success, bg: C.successLight },
  { color: C.purple, bg: C.purpleLight },
  { color: C.warning, bg: C.warningLight },
  { color: C.pink, bg: C.pinkLight },
  { color: C.orange, bg: C.orangeLight },
  { color: C.sky, bg: C.skyLight },
];

const getPalette = (dept, index) => {
  const i =
    typeof index === "number"
      ? index
      : (dept.id?.charCodeAt(0) ?? 0) % PALETTE.length;
  return PALETTE[i] ?? PALETTE[0];
};

const EMPTY_FORM = {
  name: "",
  description: "",
  head_id: "",
  parent_department_id: "",
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─── helpers ─────────────────────────────────────────────────
const empFullName = (emp) =>
  emp?.full_name?.trim() ||
  `${emp?.first_name ?? ""} ${emp?.last_name ?? ""}`.trim() ||
  "Unknown";

const empInitials = (emp) => {
  const name = empFullName(emp);
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

// ─── Shared UI primitives ─────────────────────────────────────
const Card = ({ children, className = "", style = {}, onClick }) => (
  <motion.div
    whileHover={
      onClick ? { y: -3, boxShadow: "0 12px 40px rgba(79,70,229,0.10)" } : {}
    }
    transition={{ duration: 0.18 }}
    onClick={onClick}
    className={`rounded-2xl bg-white border shadow-sm overflow-hidden ${onClick ? "cursor-pointer" : ""} ${className}`}
    style={{ borderColor: C.border, ...style }}
  >
    {children}
  </motion.div>
);

const Skeleton = () => (
  <div
    className="rounded-2xl overflow-hidden border"
    style={{ borderColor: C.border }}
  >
    <div className="h-1.5 w-full" style={{ background: C.border }} />
    <div className="p-5 space-y-3">
      <div
        className="h-9 w-9 rounded-xl animate-pulse"
        style={{ background: C.border }}
      />
      <div
        className="h-4 w-2/3 rounded-lg animate-pulse"
        style={{ background: C.border }}
      />
      <div
        className="h-3 w-full rounded-lg animate-pulse"
        style={{ background: C.border }}
      />
      <div className="flex gap-1.5 mt-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-7 h-7 rounded-full animate-pulse"
            style={{ background: C.border }}
          />
        ))}
      </div>
    </div>
  </div>
);

const FieldError = ({ msg }) =>
  msg ? (
    <p
      className="text-[11px] mt-1 flex items-center gap-1"
      style={{ color: C.danger }}
    >
      <AlertCircle size={10} /> {msg}
    </p>
  ) : null;

const Input = ({ error, ...props }) => (
  <input
    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
    style={{
      background: C.surfaceAlt,
      border: `1.5px solid ${error ? C.danger : props.value ? C.primary + "66" : C.border}`,
      color: C.textPrimary,
      boxShadow: props.value && !error ? `0 0 0 3px ${C.primaryLight}` : "none",
    }}
    {...props}
  />
);

const Label = ({ children, required }) => (
  <label
    className="block text-xs font-semibold mb-1.5"
    style={{ color: C.textPrimary }}
  >
    {children}
    {required && <span style={{ color: C.danger }}> *</span>}
  </label>
);

// ─── Employee search dropdown (same style as document page) ───
function EmployeeSearchDropdown({
  label,
  value,
  onChange,
  employees,
  placeholder = "Search employees…",
  error,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef();

  const selected = employees.find((e) => e.id === value);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return !q
      ? employees
      : employees.filter(
          (e) =>
            empFullName(e).toLowerCase().includes(q) ||
            e.email?.toLowerCase().includes(q) ||
            (e.job_title ?? e.position ?? "").toLowerCase().includes(q),
        );
  }, [employees, search]);

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pick = (emp) => {
    onChange(emp.id);
    setSearch("");
    setOpen(false);
  };
  const clear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  return (
    <div ref={ref} className="relative">
      {label && <Label>{label}</Label>}
      {/* Trigger */}
      <div
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all"
        style={{
          background: C.surfaceAlt,
          border: `1.5px solid ${error ? C.danger : open || value ? C.primary + "66" : C.border}`,
          color: C.textPrimary,
        }}
      >
        {selected ? (
          <>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
              style={{ background: C.primary }}
            >
              {empInitials(selected)}
            </div>
            <span className="flex-1 text-sm truncate">
              {empFullName(selected)}
            </span>
            <button onClick={clear} className="ml-auto flex-shrink-0">
              <X size={12} color={C.textMuted} />
            </button>
          </>
        ) : (
          <>
            <Search size={13} color={C.textMuted} />
            <span className="flex-1 text-sm" style={{ color: C.textMuted }}>
              {placeholder}
            </span>
            <ChevronRight
              size={12}
              color={C.textMuted}
              className={`transition-transform ${open ? "rotate-90" : ""}`}
            />
          </>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full rounded-xl overflow-hidden shadow-xl"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
          >
            {/* Search input inside dropdown */}
            <div
              className="flex items-center gap-2 px-3 py-2.5"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <Search size={12} color={C.textMuted} />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to filter…"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: C.textPrimary }}
                onClick={(e) => e.stopPropagation()}
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X size={11} color={C.textMuted} />
                </button>
              )}
            </div>

            {/* List */}
            <div style={{ maxHeight: 260, overflowY: "auto" }}>
              {filtered.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs" style={{ color: C.textMuted }}>
                    No employees found
                  </p>
                </div>
              ) : (
                filtered.map((emp) => {
                  const isSel = emp.id === value;
                  return (
                    <div
                      key={emp.id}
                      onClick={() => pick(emp)}
                      className="flex items-center gap-3 px-3 py-2.5 cursor-pointer select-none"
                      style={{
                        background: isSel ? C.primaryLight : "transparent",
                        borderBottom: `1px solid ${C.border}`,
                      }}
                      onMouseEnter={(e) =>
                        !isSel &&
                        (e.currentTarget.style.background = C.surfaceAlt)
                      }
                      onMouseLeave={(e) =>
                        !isSel &&
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                        style={{ background: isSel ? C.primary : "#64748B" }}
                      >
                        {empInitials(emp)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: C.textPrimary }}
                        >
                          {empFullName(emp)}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: C.textMuted }}
                        >
                          {emp.job_title ?? emp.position ?? "—"}
                          {emp.department && ` · ${emp.department}`}
                        </p>
                      </div>
                      {isSel && <Check size={13} color={C.primary} />}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <FieldError msg={error} />
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────
function Toast({ msg, type, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl"
      style={{ background: C.navy, color: "#fff", minWidth: 300 }}
    >
      {type === "error" ? (
        <AlertCircle size={15} color={C.danger} />
      ) : (
        <CheckCircle2 size={15} color={C.success} />
      )}
      <span className="text-sm font-medium">{msg}</span>
      <button onClick={onDismiss} className="ml-auto">
        <X size={13} color="rgba(255,255,255,0.5)" />
      </button>
    </motion.div>
  );
}

// ─── DeptForm ─────────────────────────────────────────────────
function DeptForm({
  saveSuccess,
  modalMode,
  form,
  setForm,
  errors,
  paletteIdx,
  setPaletteIdx,
  saving,
  departments,
  activeDept,
  employees,
  onSave,
  onClose,
}) {
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <AnimatePresence mode="wait">
      {saveSuccess ? (
        <motion.div
          key="ok"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-10 flex flex-col items-center gap-3 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <CheckCircle2 size={48} color={C.success} />
          </motion.div>
          <p className="font-bold text-base" style={{ color: C.textPrimary }}>
            {modalMode === "create"
              ? "Department Created!"
              : "Department Updated!"}
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-5 space-y-4"
        >
          {/* Colour */}
          <div>
            <Label>Accent Colour</Label>
            <div className="flex gap-2">
              {PALETTE.map((p, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setPaletteIdx(i)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: p.color,
                    boxShadow:
                      paletteIdx === i
                        ? `0 0 0 3px #fff, 0 0 0 5px ${p.color}`
                        : "none",
                  }}
                >
                  {paletteIdx === i && <Check size={12} color="#fff" />}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <Label required>Department Name</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Engineering"
              error={errors.name}
            />
            <FieldError msg={errors.name} />
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Briefly describe what this department does…"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${form.description ? C.primary + "66" : C.border}`,
                color: C.textPrimary,
              }}
            />
          </div>

          {/* Head employee — searchable dropdown */}
          <EmployeeSearchDropdown
            label="Department Head"
            value={form.head_id}
            onChange={(v) => set("head_id", v)}
            employees={employees}
            placeholder="Search and select head employee…"
            error={errors.head_id}
          />

          {/* Parent department */}
          <div>
            <Label>Parent Department</Label>
            <div className="relative">
              <select
                value={form.parent_department_id}
                onChange={(e) => set("parent_department_id", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none appearance-none transition-all"
                style={{
                  background: C.surfaceAlt,
                  border: `1.5px solid ${form.parent_department_id ? C.primary + "66" : C.border}`,
                  color: form.parent_department_id
                    ? C.textPrimary
                    : C.textMuted,
                }}
              >
                <option value="">None (top-level)</option>
                {departments
                  .filter((d) => !activeDept || d.id !== activeDept.id)
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
              </select>
              <ChevronRight
                size={12}
                className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none"
                color={C.textMuted}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                background: C.surfaceAlt,
                color: C.textSecondary,
                border: `1px solid ${C.border}`,
              }}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-white"
              style={{
                background: C.primary,
                boxShadow: `0 4px 12px ${C.primary}44`,
                opacity: saving ? 0.8 : 1,
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving…
                </>
              ) : modalMode === "create" ? (
                "Create Department"
              ) : (
                "Save Changes"
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Assign Employees Modal ───────────────────────────────────
function AssignEmployeesModal({
  dept,
  employees,
  onClose,
  onSuccess,
  showToast,
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  // Employees NOT already in this department
  const available = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter((e) => {
      const notInDept =
        e.department_id !== dept.id && e.department !== dept.name;
      const matchesSearch =
        !q ||
        empFullName(e).toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        (e.job_title ?? "").toLowerCase().includes(q);
      return notInDept && matchesSearch;
    });
  }, [employees, dept, search]);

  const toggle = (id) =>
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );

  const toggleAll = () =>
    setSelected(
      selected.length === available.length ? [] : available.map((e) => e.id),
    );

  // const handleAssign = async () => {
  //   if (selected.length === 0) return;
  //   setSaving(true);
  //   try {
  //     await Promise.all(
  //       selected.map(id => updateEmployee(id, { department_id: dept.id }))
  //     );
  //     showToast(`${selected.length} employee${selected.length > 1 ? "s" : ""} assigned to ${dept.name}`);
  //     onSuccess();
  //   } catch (err) {
  //     showToast(err.message || "Failed to assign employees", "error");
  //   } finally {
  //     setSaving(false);
  //   }
  // };
  const handleAssign = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    try {
      await Promise.all(
        // Send camelCase `departmentId` — matches express-validator rules
        // in employee controller (same convention as department controller).
        selected.map((id) => updateEmployee(id, { departmentId: dept.id })),
      );
      showToast(
        `${selected.length} employee${selected.length > 1 ? "s" : ""} assigned to ${dept.name}`,
      );
      onSuccess();
    } catch (err) {
      showToast(err.message || "Failed to assign employees", "error");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 24 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="w-full max-w-xl rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          maxHeight: "88vh",
          boxShadow: "0 32px 80px rgba(15,23,42,0.3)",
        }}
      >
        {/* Header */}
        <div
          className="px-7 py-5 flex items-center justify-between"
          style={{
            borderBottom: `1px solid ${C.border}`,
            background: "linear-gradient(135deg,#4F46E5,#6366F1)",
          }}
        >
          <div>
            <p className="font-bold text-lg text-white">Assign Employees</p>
            <p className="text-indigo-200 text-xs mt-0.5">
              Add members to <strong>{dept.name}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X size={15} color="#fff" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-4">
          {/* Search + select all */}
          <div className="flex gap-2">
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 flex-1"
              style={{
                background: C.surfaceAlt,
                border: `1px solid ${C.border}`,
              }}
            >
              <Search size={13} color={C.textMuted} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or title…"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: C.textPrimary }}
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X size={12} color={C.textMuted} />
                </button>
              )}
            </div>
            {available.length > 0 && (
              <button
                onClick={toggleAll}
                className="px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap"
                style={{
                  background:
                    selected.length === available.length
                      ? "#4F46E5"
                      : C.surfaceAlt,
                  color:
                    selected.length === available.length
                      ? "#fff"
                      : C.textSecondary,
                  border: `1px solid ${selected.length === available.length ? "#4F46E5" : C.border}`,
                }}
              >
                {selected.length === available.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            )}
          </div>

          {/* Selection pill */}
          {selected.length > 0 && (
            <div
              className="rounded-xl px-4 py-2.5 flex items-center gap-2"
              style={{ background: "#EEF2FF", border: "1px solid #C7D2FE" }}
            >
              <UserCheck size={14} color="#4F46E5" />
              <p className="text-xs font-bold" style={{ color: "#4F46E5" }}>
                {selected.length} employee{selected.length > 1 ? "s" : ""}{" "}
                selected
              </p>
              <button
                onClick={() => setSelected([])}
                className="ml-auto text-xs underline font-semibold"
                style={{ color: "#4F46E5" }}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Employee list */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              border: `1px solid ${C.border}`,
              maxHeight: 340,
              overflowY: "auto",
            }}
          >
            {available.length === 0 ? (
              <div className="py-12 text-center">
                <Users size={28} color={C.textMuted} className="mx-auto mb-2" />
                <p
                  className="text-sm font-medium"
                  style={{ color: C.textMuted }}
                >
                  {employees.length === 0
                    ? "No employees found"
                    : search
                      ? "No employees match your search"
                      : "All employees are already in this department"}
                </p>
              </div>
            ) : (
              available.map((emp) => {
                const isSel = selected.includes(emp.id);
                return (
                  <div
                    key={emp.id}
                    onClick={() => toggle(emp.id)}
                    className="flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all select-none"
                    style={{
                      background: isSel ? "#EEF2FF" : "transparent",
                      borderBottom: `1px solid ${C.border}`,
                    }}
                    onMouseEnter={(e) =>
                      !isSel &&
                      (e.currentTarget.style.background = C.surfaceAlt)
                    }
                    onMouseLeave={(e) =>
                      !isSel &&
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: isSel ? "#4F46E5" : "#64748B" }}
                    >
                      {empInitials(emp)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: C.textPrimary }}
                      >
                        {empFullName(emp)}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: C.textMuted }}
                      >
                        {emp.job_title ?? emp.position ?? "—"}
                        {emp.department && ` · Currently: ${emp.department}`}
                      </p>
                    </div>
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isSel ? "#4F46E5" : C.surfaceAlt,
                        border: `2px solid ${isSel ? "#4F46E5" : C.border}`,
                      }}
                    >
                      {isSel && <Check size={11} color="#fff" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-7 py-5 gap-3"
          style={{ borderTop: `1px solid ${C.border}` }}
        >
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
              color: C.textSecondary,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={saving || selected.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold"
            style={{
              background:
                saving || selected.length === 0 ? "#C7D2FE" : "#4F46E5",
              color: saving || selected.length === 0 ? "#818CF8" : "#fff",
              cursor:
                saving || selected.length === 0 ? "not-allowed" : "pointer",
              boxShadow:
                saving || selected.length === 0
                  ? "none"
                  : "0 4px 14px rgba(79,70,229,0.4)",
            }}
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Assigning…
              </>
            ) : (
              <>
                <UserPlus size={14} />
                Assign{" "}
                {selected.length > 0
                  ? `${selected.length} Employee${selected.length > 1 ? "s" : ""}`
                  : "Employees"}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── DeptCard ─────────────────────────────────────────────────
function DeptCard({
  dept,
  index,
  deptEmployees,
  headEmployee,
  onView,
  onEdit,
  onDelete,
  onAssign,
}) {
  const pal = getPalette(dept, index % PALETTE.length);
  const MAX_SHOWN = 5;
  const shown = deptEmployees.slice(0, MAX_SHOWN);
  const overflow = deptEmployees.length - MAX_SHOWN;

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ y: -4, boxShadow: "0 16px 48px rgba(79,70,229,0.12)" }}
      className="rounded-2xl bg-white overflow-hidden"
      style={{ border: `1px solid ${C.border}` }}
    >
      <div
        className="h-1.5"
        style={{
          background: `linear-gradient(90deg,${pal.color},${pal.color}88)`,
        }}
      />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: pal.bg }}
          >
            <Building2 size={20} color={pal.color} />
          </div>
          <div className="relative group">
            <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-all">
              <MoreHorizontal size={15} color={C.textMuted} />
            </button>
            <div
              className="absolute right-0 top-full mt-1 w-40 rounded-xl shadow-xl z-10 overflow-hidden opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              {[
                { label: "View", icon: Eye, action: onView, color: C.primary },
                { label: "Edit", icon: Edit2, action: onEdit, color: C.accent },
                {
                  label: "Assign Members",
                  icon: UserPlus,
                  action: onAssign,
                  color: C.success,
                },
                {
                  label: "Delete",
                  icon: Trash2,
                  action: onDelete,
                  color: C.danger,
                },
              ].map(({ label, icon: Icon, action, color }) => (
                <button
                  key={label}
                  onClick={action}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium hover:bg-slate-50 transition-all"
                  style={{ color }}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <h3
          className="font-bold text-base mb-1"
          style={{ color: C.textPrimary }}
        >
          {dept.name}
        </h3>
        <p
          className="text-xs leading-relaxed mb-4 line-clamp-2"
          style={{ color: C.textMuted }}
        >
          {dept.description || "No description provided."}
        </p>

        {/* Department Head */}
        <div
          className="flex items-center gap-2.5 mb-3 p-2.5 rounded-xl"
          style={{ background: pal.bg + "66" }}
        >
          <div className="relative shrink-0">
            {headEmployee ? (
              <>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{
                    background: `linear-gradient(135deg,${pal.color},${pal.color}cc)`,
                    border: `2px solid ${pal.color}`,
                  }}
                >
                  {empInitials(headEmployee)}
                </div>
                <Crown
                  size={9}
                  color="#F59E0B"
                  className="absolute -top-1 -right-1"
                  style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}
                />
              </>
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: C.border }}
              >
                <UserCircle2 size={16} color={C.textMuted} />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p
              className="text-xs font-semibold truncate"
              style={{ color: C.textPrimary }}
            >
              {headEmployee
                ? empFullName(headEmployee)
                : (dept.head_name ?? "No head assigned")}
            </p>
            <p className="text-[10px] truncate" style={{ color: C.textMuted }}>
              {headEmployee?.job_title ??
                headEmployee?.position ??
                "Department Head"}
            </p>
          </div>
        </div>

        {/* Employee avatars */}
        {deptEmployees.length > 0 ? (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {shown.map((emp, idx) => (
                <div
                  key={emp.id}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                  style={{
                    background: `linear-gradient(135deg,${pal.color},${pal.color}cc)`,
                    border: "2px solid white",
                    marginLeft: idx > 0 ? "-8px" : 0,
                    zIndex: shown.length - idx,
                  }}
                  title={empFullName(emp)}
                >
                  {empInitials(emp)}
                </div>
              ))}
              {overflow > 0 && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: C.surfaceAlt,
                    border: "2px solid white",
                    color: C.textMuted,
                    marginLeft: "-8px",
                    zIndex: 0,
                  }}
                >
                  +{overflow}
                </div>
              )}
            </div>
            <span className="text-[11px]" style={{ color: C.textMuted }}>
              {deptEmployees.length} member
              {deptEmployees.length !== 1 ? "s" : ""}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={onAssign}
              className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all"
              style={{ background: pal.bg, color: pal.color }}
            >
              <UserPlus size={11} /> Add members
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: pal.bg }}
            >
              <Users size={11} color={pal.color} />
            </div>
            <span className="text-sm font-bold" style={{ color: pal.color }}>
              {deptEmployees.length}
            </span>
            <span className="text-xs" style={{ color: C.textMuted }}>
              employees
            </span>
          </div>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: pal.bg, color: pal.color }}
          >
            {dept.created_at
              ? new Date(dept.created_at).toLocaleDateString("en-NG", {
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
export default function DepartmentsPage() {
  const [loading, setLoading] = useState(true);
  const [empLoading, setEmpLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [departments, setDepts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [modalMode, setModalMode] = useState(null);
  const [activeDept, setActiveDept] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toast, setToast] = useState(null);
  const [paletteIdx, setPaletteIdx] = useState(0);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(EMPTY_FORM);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignDept, setAssignDept] = useState(null);

  const showToast = useCallback(
    (msg, type = "success") => setToast({ msg, type }),
    [],
  );

  // ─── Fetch departments ──────────────────────────────────────
  const fetchDepts = useCallback(async () => {
    setLoading(true);
    try {
      const { departments: data } = await departmentApi.list();
      setDepts(data ?? []);
    } catch (err) {
      showToast(err.message || "Failed to load departments", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // ─── Fetch employees — same pattern as document page ───────

  const fetchEmployees = useCallback(async () => {
    setEmpLoading(true);
    getEmployees({ limit: 200 })
      .then((res) => {
        const raw = res?.data ?? res?.employees ?? res ?? [];
        const list = Array.isArray(raw) ? raw : [];

        // Normalize employee keys — API may return camelCase
        const normalized = list.map((emp) => ({
          ...emp,
         
          id: emp.id,
          department_id: emp.departmentId ?? emp.department_id ?? null,

          department:
            emp.departmentName ?? emp.department_name ?? emp.department ?? null,
          job_title: emp.jobTitle ?? emp.job_role_name ?? emp.job_title ?? null,
          first_name: emp.firstName ?? emp.first_name ?? null,
          last_name: emp.lastName ?? emp.last_name ?? null,
          full_name: emp.fullName ?? emp.full_name ?? null,
        }));

        setEmployees(normalized);
      })
      .catch((err) =>
        showToast(err.message || "Failed to load employees", "error"),
      )
      .finally(() => setEmpLoading(false));
  }, [showToast]);

  useEffect(() => {
    fetchDepts();
    fetchEmployees();
  }, [fetchDepts, fetchEmployees]);

  // ─── Match employees to department ─────────────────────────
  // Handles both `department_id` UUID and `department` string name
  const getEmployeesForDept = useCallback(
    (deptId, deptName) =>
      employees.filter(
        (emp) =>
          emp.department_id === deptId ||
          emp.department_id === String(deptId) ||
          (deptName &&
            emp.department?.toLowerCase() === deptName.toLowerCase()),
      ),
    [employees],
  );

  const getHeadEmployee = useCallback(
    (dept) => {
      if (!dept.head_id) return null;
      return employees.find((e) => e.id === dept.head_id) ?? null;
    },
    [employees],
  );

  // ─── Stats ─────────────────────────────────────────────────
  const largest = departments.length
    ? departments.reduce((a, b) =>
        getEmployeesForDept(a.id, a.name).length >=
        getEmployeesForDept(b.id, b.name).length
          ? a
          : b,
      )
    : null;

  const filtered = departments.filter(
    (d) =>
      !searchQuery ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.head_name ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ─── Modal helpers ─────────────────────────────────────────
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setPaletteIdx(0);
    setErrors({});
    setSaveSuccess(false);
    setModalMode("create");
  };
  const openEdit = (dept) => {
    setForm({
      name: dept.name ?? "",
      description: dept.description ?? "",
      head_id: dept.head_id ?? "",
      parent_department_id: dept.parent_department_id ?? "",
    });
    setPaletteIdx(departments.indexOf(dept) % PALETTE.length);
    setActiveDept(dept);
    setErrors({});
    setSaveSuccess(false);
    setModalMode("edit");
  };
  const openView = (dept) => {
    setActiveDept(dept);
    setModalMode("view");
  };
  const openDelete = (dept) => {
    setActiveDept(dept);
    setModalMode("delete");
  };
  const openAssign = (dept) => {
    setAssignDept(dept);
    setShowAssignModal(true);
  };
  const closeModal = () => {
    if (!saving) setModalMode(null);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Department name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      head_id: form.head_id || null,
      parent_department_id: form.parent_department_id || null,
    };
    try {
      if (modalMode === "create") {
        await departmentApi.create(payload);
        showToast("Department created successfully");
      } else {
        await departmentApi.update(activeDept.id, payload);
        showToast("Department updated successfully");
      }
      setSaveSuccess(true);
      await fetchDepts();
      setTimeout(() => {
        setSaveSuccess(false);
        setModalMode(null);
      }, 1400);
    } catch (err) {
      showToast(err.message || "Failed to save department", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await departmentApi.remove(activeDept.id);
      showToast(`"${activeDept.name}" deactivated`);
      setModalMode(null);
      await fetchDepts();
    } catch (err) {
      showToast(err.message || "Failed to deactivate department", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignSuccess = () => {
    setShowAssignModal(false);
    fetchEmployees();
    fetchDepts();
  };

  // ─── Render ────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{
        background: C.bg,
        color: C.textPrimary,
        fontFamily: "'DM Sans','Sora',sans-serif",
      }}
    >
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* TOP BAR */}
          <header
            className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{
              background: "rgba(240,242,248,0.9)",
              backdropFilter: "blur(12px)",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen((p) => !p)}
              className="p-2 rounded-xl"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              <Menu size={16} color={C.textSecondary} />
            </motion.button>

            {/* Search — same style as document page */}
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 flex-1 max-w-sm"
              style={{
                background: C.surface,
                border: `1.5px solid ${C.border}`,
              }}
            >
              <Search size={13} color={C.textMuted} />
              <input
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search departments…"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: C.textPrimary }}
              />
              {searchQuery && (
                <button onClick={() => setSearch("")}>
                  <X size={12} color={C.textMuted} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={fetchEmployees}
                className="p-2 rounded-xl"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
                title="Refresh employees"
              >
                <RefreshCw
                  size={14}
                  color={C.textSecondary}
                  className={empLoading ? "animate-spin" : ""}
                />
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openCreate}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                style={{
                  background: C.primary,
                  color: "#fff",
                  boxShadow: `0 4px 12px ${C.primary}44`,
                }}
              >
                <Plus size={13} /> New Department
              </motion.button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-6 text-white relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/15 shrink-0">
                    <Building2 size={28} color="#fff" />
                  </div>
                  <div>
                    <h1
                      className="text-2xl font-bold"
                      style={{ fontFamily: "Sora,sans-serif" }}
                    >
                      Departments
                    </h1>
                    <p className="text-indigo-200 text-sm mt-0.5">
                      {departments.length} departments · {employees.length}{" "}
                      total employees
                    </p>
                  </div>
                </div>
                <div className="md:ml-auto flex flex-wrap gap-3">
                  {[
                    { label: "Total Departments", value: departments.length },
                    { label: "Total Employees", value: employees.length },
                    {
                      label: "Avg Dept Size",
                      value: departments.length
                        ? Math.round(employees.length / departments.length)
                        : 0,
                    },
                    { label: "Largest Dept", value: largest?.name ?? "—" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl"
                      style={{
                        background: "rgba(255,255,255,0.10)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <span
                        className="text-lg font-bold"
                        style={{ color: "#fff", fontFamily: "Sora,sans-serif" }}
                      >
                        {s.value}
                      </span>
                      <span
                        className="text-[10px] uppercase tracking-wider font-medium"
                        style={{ color: "rgba(255,255,255,0.55)" }}
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Toolbar */}
            <Card className="p-3.5">
              <div className="flex items-center justify-between gap-3">
                <p
                  className="text-sm font-semibold"
                  style={{ color: C.textSecondary }}
                >
                  {loading
                    ? "Loading…"
                    : `Showing ${filtered.length} of ${departments.length} departments`}
                  {empLoading && (
                    <span
                      className="ml-2 inline-flex items-center gap-1 text-xs"
                      style={{ color: C.textMuted }}
                    >
                      <Loader2 size={10} className="animate-spin" /> loading
                      employees…
                    </span>
                  )}
                </p>
                <div
                  className="flex rounded-lg overflow-hidden"
                  style={{ border: `1px solid ${C.border}` }}
                >
                  {[
                    { id: "grid", icon: Grid3X3 },
                    { id: "list", icon: List },
                  ].map(({ id, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setViewMode(id)}
                      className="p-2"
                      style={{
                        background:
                          viewMode === id ? C.primaryLight : C.surface,
                        color: viewMode === id ? C.primary : C.textMuted,
                      }}
                    >
                      <Icon size={14} />
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* GRID */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)
                ) : filtered.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center py-24 text-center">
                    <Building2 size={40} color={C.textMuted} className="mb-3" />
                    <p
                      className="font-semibold"
                      style={{ color: C.textPrimary }}
                    >
                      No departments yet
                    </p>
                    <p className="text-sm mt-1" style={{ color: C.textMuted }}>
                      Create your first department to get started.
                    </p>
                  </div>
                ) : (
                  filtered.map((dept, i) => (
                    <DeptCard
                      key={dept.id}
                      dept={dept}
                      index={i}
                      deptEmployees={getEmployeesForDept(dept.id, dept.name)}
                      headEmployee={getHeadEmployee(dept)}
                      onView={() => openView(dept)}
                      onEdit={() => openEdit(dept)}
                      onDelete={() => openDelete(dept)}
                      onAssign={() => openAssign(dept)}
                    />
                  ))
                )}
                {!loading && (
                  <motion.div
                    whileHover={{ y: -4 }}
                    onClick={openCreate}
                    className="rounded-2xl flex flex-col items-center justify-center gap-3 p-8 cursor-pointer"
                    style={{ border: `2px dashed ${C.border}`, minHeight: 200 }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: C.primaryLight }}
                    >
                      <Plus size={20} color={C.primary} />
                    </div>
                    <div className="text-center">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: C.textPrimary }}
                      >
                        New Department
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: C.textMuted }}
                      >
                        Add a new organisational unit
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* LIST */}
            {viewMode === "list" && (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr
                        style={{
                          background: C.surfaceAlt,
                          borderBottom: `1px solid ${C.border}`,
                        }}
                      >
                        {[
                          "Department",
                          "Head",
                          "Members",
                          "Parent",
                          "Created",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide"
                            style={{ color: C.textMuted }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading
                        ? Array.from({ length: 5 }).map((_, i) => (
                            <tr
                              key={i}
                              style={{ borderBottom: `1px solid ${C.border}` }}
                            >
                              {Array.from({ length: 6 }).map((_, j) => (
                                <td key={j} className="px-4 py-4">
                                  <div
                                    className="h-4 rounded animate-pulse"
                                    style={{
                                      background: C.border,
                                      width: "70%",
                                    }}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))
                        : filtered.map((dept, i) => {
                            const pal = getPalette(dept, i % PALETTE.length);
                            const deptEmps = getEmployeesForDept(
                              dept.id,
                              dept.name,
                            );
                            const headEmp = getHeadEmployee(dept);
                            const shown4 = deptEmps.slice(0, 4);
                            const ovf = deptEmps.length - 4;
                            return (
                              <motion.tr
                                key={dept.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.04 * i }}
                                className="group transition-all"
                                style={{
                                  borderBottom: `1px solid ${C.border}`,
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background =
                                    C.surfaceAlt)
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background =
                                    "transparent")
                                }
                              >
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                      style={{ background: pal.bg }}
                                    >
                                      <Building2 size={16} color={pal.color} />
                                    </div>
                                    <div>
                                      <p
                                        className="text-sm font-semibold"
                                        style={{ color: C.textPrimary }}
                                      >
                                        {dept.name}
                                      </p>
                                      <p
                                        className="text-[11px] line-clamp-1 max-w-[180px]"
                                        style={{ color: C.textMuted }}
                                      >
                                        {dept.description}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  {headEmp ? (
                                    <div className="flex items-center gap-2">
                                      <div className="relative shrink-0">
                                        <div
                                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                                          style={{
                                            background: `linear-gradient(135deg,${pal.color},${pal.color}cc)`,
                                          }}
                                        >
                                          {empInitials(headEmp)}
                                        </div>
                                        <Crown
                                          size={8}
                                          color="#F59E0B"
                                          className="absolute -top-1 -right-1"
                                        />
                                      </div>
                                      <div>
                                        <p
                                          className="text-xs font-semibold"
                                          style={{ color: C.textPrimary }}
                                        >
                                          {empFullName(headEmp)}
                                        </p>
                                        {headEmp.job_title && (
                                          <p
                                            className="text-[10px]"
                                            style={{ color: C.textMuted }}
                                          >
                                            {headEmp.job_title}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <p
                                      className="text-xs"
                                      style={{ color: C.textMuted }}
                                    >
                                      {dept.head_name ?? "—"}
                                    </p>
                                  )}
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center">
                                    {shown4.map((emp, idx) => (
                                      <div
                                        key={emp.id}
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                                        style={{
                                          background: `linear-gradient(135deg,${pal.color},${pal.color}cc)`,
                                          border: "2px solid white",
                                          marginLeft: idx > 0 ? "-6px" : 0,
                                        }}
                                        title={empFullName(emp)}
                                      >
                                        {empInitials(emp)}
                                      </div>
                                    ))}
                                    {ovf > 0 && (
                                      <div
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                                        style={{
                                          background: C.border,
                                          border: "2px solid white",
                                          color: C.textMuted,
                                          marginLeft: "-6px",
                                        }}
                                      >
                                        +{ovf}
                                      </div>
                                    )}
                                    {deptEmps.length === 0 && (
                                      <span
                                        className="text-xs"
                                        style={{ color: C.textMuted }}
                                      >
                                        None
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <p
                                    className="text-xs"
                                    style={{ color: C.textSecondary }}
                                  >
                                    {dept.parent_department_name ?? "—"}
                                  </p>
                                </td>
                                <td className="px-4 py-4">
                                  <span
                                    className="text-xs"
                                    style={{ color: C.textMuted }}
                                  >
                                    {dept.created_at
                                      ? new Date(
                                          dept.created_at,
                                        ).toLocaleDateString("en-NG", {
                                          month: "short",
                                          year: "numeric",
                                        })
                                      : "—"}
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                    {[
                                      {
                                        icon: Eye,
                                        action: () => openView(dept),
                                        bg: C.primaryLight,
                                        color: C.primary,
                                      },
                                      {
                                        icon: Edit2,
                                        action: () => openEdit(dept),
                                        bg: C.accentLight,
                                        color: C.accent,
                                      },
                                      {
                                        icon: UserPlus,
                                        action: () => openAssign(dept),
                                        bg: C.successLight,
                                        color: C.success,
                                      },
                                      {
                                        icon: Trash2,
                                        action: () => openDelete(dept),
                                        bg: C.dangerLight,
                                        color: C.danger,
                                      },
                                    ].map(
                                      ({ icon: Icon, action, bg, color }) => (
                                        <motion.button
                                          key={color}
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={action}
                                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                                          style={{ background: bg }}
                                        >
                                          <Icon size={12} color={color} />
                                        </motion.button>
                                      ),
                                    )}
                                  </div>
                                </td>
                              </motion.tr>
                            );
                          })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </main>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {(modalMode === "create" || modalMode === "edit") && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg px-4"
            >
              <div
                className="rounded-2xl bg-white shadow-2xl overflow-hidden"
                style={{ border: `1px solid ${C.border}` }}
              >
                <div
                  className="px-5 py-4 border-b flex items-center justify-between"
                  style={{ borderColor: C.border }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: C.primaryLight }}
                    >
                      <Building2 size={15} color={C.primary} />
                    </div>
                    <p
                      className="font-bold text-sm"
                      style={{ color: C.textPrimary }}
                    >
                      {modalMode === "create"
                        ? "New Department"
                        : `Edit — ${activeDept?.name}`}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-1.5 rounded-lg"
                    style={{ background: C.surfaceAlt }}
                  >
                    <X size={15} color={C.textSecondary} />
                  </button>
                </div>
                <DeptForm
                  saveSuccess={saveSuccess}
                  modalMode={modalMode}
                  form={form}
                  setForm={setForm}
                  errors={errors}
                  paletteIdx={paletteIdx}
                  setPaletteIdx={setPaletteIdx}
                  saving={saving}
                  departments={departments}
                  activeDept={activeDept}
                  employees={employees}
                  onSave={handleSave}
                  onClose={closeModal}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* VIEW SLIDE-OVER */}
      <AnimatePresence>
        {modalMode === "view" &&
          activeDept &&
          (() => {
            const pal = getPalette(
              activeDept,
              departments.indexOf(activeDept) % PALETTE.length,
            );
            const deptEmps = getEmployeesForDept(
              activeDept.id,
              activeDept.name,
            );
            const headEmp = getHeadEmployee(activeDept);
            return (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                  onClick={closeModal}
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md overflow-y-auto shadow-2xl"
                  style={{
                    background: C.surface,
                    borderLeft: `1px solid ${C.border}`,
                  }}
                >
                  <div
                    className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
                    style={{
                      background: C.surface,
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    <p
                      className="font-bold text-sm"
                      style={{ color: C.textPrimary }}
                    >
                      Department Details
                    </p>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          closeModal();
                          openAssign(activeDept);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: C.successLight, color: C.success }}
                      >
                        <UserPlus size={12} /> Assign
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEdit(activeDept)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: C.primaryLight, color: C.primary }}
                      >
                        <Edit2 size={12} /> Edit
                      </motion.button>
                      <button
                        onClick={closeModal}
                        className="p-1.5 rounded-lg"
                        style={{ background: C.surfaceAlt }}
                      >
                        <X size={15} color={C.textSecondary} />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        background: `linear-gradient(90deg,${pal.color},${pal.color}55)`,
                      }}
                    />
                    <div className="flex items-center gap-3">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: pal.bg }}
                      >
                        <Building2 size={26} color={pal.color} />
                      </div>
                      <div>
                        <h2
                          className="text-xl font-bold"
                          style={{
                            color: C.textPrimary,
                            fontFamily: "Sora,sans-serif",
                          }}
                        >
                          {activeDept.name}
                        </h2>
                        <p className="text-xs" style={{ color: C.textMuted }}>
                          {activeDept.created_at
                            ? new Date(
                                activeDept.created_at,
                              ).toLocaleDateString("en-NG", {
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </p>
                      </div>
                    </div>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: C.textSecondary }}
                    >
                      {activeDept.description || "No description provided."}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          label: "Headcount",
                          value: `${deptEmps.length} employees`,
                        },
                        {
                          label: "Parent",
                          value: activeDept.parent_department_name ?? "None",
                        },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="p-3 rounded-xl"
                          style={{ background: C.surfaceAlt }}
                        >
                          <p
                            className="text-[10px]"
                            style={{ color: C.textMuted }}
                          >
                            {label}
                          </p>
                          <p
                            className="text-sm font-semibold mt-0.5"
                            style={{ color: C.textPrimary }}
                          >
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {(headEmp || activeDept.head_name) && (
                      <div
                        className="p-4 rounded-xl"
                        style={{
                          background: pal.bg,
                          border: `1px solid ${pal.color}22`,
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <Crown size={11} color="#F59E0B" />
                          <p
                            className="text-xs font-bold"
                            style={{ color: pal.color }}
                          >
                            Department Head
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold"
                            style={{
                              background: `linear-gradient(135deg,${pal.color},${pal.color}cc)`,
                            }}
                          >
                            {empInitials(
                              headEmp ?? { first_name: activeDept.head_name },
                            )}
                          </div>
                          <div>
                            <p
                              className="font-semibold text-sm"
                              style={{ color: C.textPrimary }}
                            >
                              {headEmp
                                ? empFullName(headEmp)
                                : activeDept.head_name}
                            </p>
                            {headEmp?.job_title && (
                              <p
                                className="text-xs"
                                style={{ color: C.textSecondary }}
                              >
                                {headEmp.job_title}
                              </p>
                            )}
                            {headEmp?.email && (
                              <p
                                className="text-[11px] font-mono"
                                style={{ color: C.textMuted }}
                              >
                                {headEmp.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Team members */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p
                          className="text-xs font-bold"
                          style={{ color: C.textPrimary }}
                        >
                          Team Members
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: pal.bg, color: pal.color }}
                          >
                            {deptEmps.length}
                          </span>
                          <button
                            onClick={() => {
                              closeModal();
                              openAssign(activeDept);
                            }}
                            className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg"
                            style={{
                              background: C.primaryLight,
                              color: C.primary,
                            }}
                          >
                            <UserPlus size={10} /> Add
                          </button>
                        </div>
                      </div>
                      {empLoading ? (
                        <div className="flex items-center gap-2 py-3">
                          <Loader2
                            size={14}
                            className="animate-spin"
                            color={C.textMuted}
                          />
                          <span
                            className="text-xs"
                            style={{ color: C.textMuted }}
                          >
                            Loading employees…
                          </span>
                        </div>
                      ) : deptEmps.length === 0 ? (
                        <div
                          className="flex flex-col items-center py-6 rounded-xl gap-2"
                          style={{ background: C.surfaceAlt }}
                        >
                          <Users size={24} color={C.textMuted} />
                          <p className="text-xs" style={{ color: C.textMuted }}>
                            No employees assigned yet
                          </p>
                          <button
                            onClick={() => {
                              closeModal();
                              openAssign(activeDept);
                            }}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                            style={{
                              background: C.primaryLight,
                              color: C.primary,
                            }}
                          >
                            <UserPlus size={12} /> Assign employees
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {deptEmps.map((emp) => (
                            <div
                              key={emp.id}
                              className="flex items-center gap-3 p-2.5 rounded-xl"
                              style={{ background: C.surfaceAlt }}
                            >
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                                style={{
                                  background: `linear-gradient(135deg,${pal.color},${pal.color}cc)`,
                                }}
                              >
                                {empInitials(emp)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <p
                                    className="text-xs font-semibold truncate"
                                    style={{ color: C.textPrimary }}
                                  >
                                    {empFullName(emp)}
                                  </p>
                                  {emp.id === activeDept.head_id && (
                                    <Crown size={10} color="#F59E0B" />
                                  )}
                                </div>
                                {(emp.job_title ?? emp.position) && (
                                  <p
                                    className="text-[10px] truncate"
                                    style={{ color: C.textMuted }}
                                  >
                                    {emp.job_title ?? emp.position}
                                  </p>
                                )}
                              </div>
                              <div
                                className="shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-semibold capitalize"
                                style={{
                                  background:
                                    emp.status === "active"
                                      ? C.successLight
                                      : C.border,
                                  color:
                                    emp.status === "active"
                                      ? C.success
                                      : C.textMuted,
                                }}
                              >
                                {emp.status ?? "active"}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </>
            );
          })()}
      </AnimatePresence>

      {/* DELETE CONFIRM */}
      <AnimatePresence>
        {modalMode === "delete" && activeDept && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-4"
            >
              <div
                className="rounded-2xl p-6 text-center shadow-2xl"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: C.dangerLight }}
                >
                  <AlertTriangle size={24} color={C.danger} />
                </div>
                <p
                  className="font-bold text-base mb-1"
                  style={{ color: C.textPrimary }}
                >
                  Deactivate Department?
                </p>
                <p className="text-sm mb-1" style={{ color: C.textSecondary }}>
                  Are you sure you want to deactivate{" "}
                  <strong>{activeDept.name}</strong>?
                </p>
                <p className="text-xs mb-5" style={{ color: C.danger }}>
                  This will fail if the department still has active employees.
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closeModal}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{
                      background: C.surfaceAlt,
                      color: C.textSecondary,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDelete}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                    style={{
                      background: C.danger,
                      color: "#fff",
                      opacity: saving ? 0.8 : 1,
                    }}
                  >
                    {saving ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Deactivating…
                      </>
                    ) : (
                      "Deactivate"
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ASSIGN EMPLOYEES MODAL */}
      <AnimatePresence>
        {showAssignModal && assignDept && (
          <AssignEmployeesModal
            dept={assignDept}
            employees={employees}
            onClose={() => setShowAssignModal(false)}
            onSuccess={handleAssignSuccess}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <Toast
            msg={toast.msg}
            type={toast.type}
            onDismiss={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
