// src/admin/employeemanagement/DepartmentsPage.jsx
// Zero mock data — all state driven by the real API.

import { useState, useEffect, useCallback } from "react";
import AdminSideNavbar from "../AdminSideNavbar";
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
  TrendingUp,
  BarChart2,
  Grid3X3,
  List,
  Eye,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { C } from "./sharedData";
import { departmentApi } from "../../api/service/departmentApi";

// ─── Colour palette (no semantic meaning — purely visual) ─────
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

// Deterministically assign a palette entry from the dept id/name
// so colours are stable across re-renders without storing them in DB.
const getPalette = (dept, index) => {
  const i =
    typeof index === "number"
      ? index
      : (dept.id?.charCodeAt(0) ?? 0) % PALETTE.length;
  return PALETTE[i] ?? PALETTE[0];
};

const ADMIN = {
  name: "Ngozi Adeleke",
  initials: "NA",
  role: "HR Administrator",
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─── Shared UI primitives ──────────────────────────────────────

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
      <div
        className="h-3 w-4/5 rounded-lg animate-pulse"
        style={{ background: C.border }}
      />
    </div>
  </div>
);

const FieldError = ({ msg }) =>
  msg ? (
    <p
      className="text-[11px] mt-1 flex items-center gap-1"
      style={{ color: C.danger }}
    >
      <AlertCircle size={10} />
      {msg}
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

const SelectInput = ({ error, children, ...props }) => (
  <div className="relative">
    <select
      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none appearance-none transition-all"
      style={{
        background: C.surfaceAlt,
        border: `1.5px solid ${error ? C.danger : props.value ? C.primary + "66" : C.border}`,
        color: props.value ? C.textPrimary : C.textMuted,
      }}
      {...props}
    >
      {children}
    </select>
    <ChevronRight
      size={12}
      className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none"
      color={C.textMuted}
    />
  </div>
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

// ─── Toast ────────────────────────────────────────────────────
function Toast({ msg, type, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, []);
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

// ═══════════════════════════════════════════════════════════════
export default function DepartmentsPage() {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [departments, setDepts] = useState([]);
  const [searchQuery, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [modalMode, setModalMode] = useState(null); // null | "create" | "edit" | "view" | "delete"
  const [activeDept, setActiveDept] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toast, setToast] = useState(null);
  const [paletteIdx, setPaletteIdx] = useState(0);
  const [errors, setErrors] = useState({});

  // ─── Form mirrors the backend exactly ─────────────────────
  const EMPTY_FORM = {
    name: "",
    description: "",
    head_id: "", // UUID — matches backend field
    parent_department_id: "", // UUID — matches backend field
  };
  const [form, setForm] = useState(EMPTY_FORM);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // ─── Fetch all departments ──────────────────────────────────
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
  }, []);

  useEffect(() => {
    fetchDepts();
  }, [fetchDepts]);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // ─── Derived stats ──────────────────────────────────────────
  const totalHeadcount = departments.reduce(
    (s, d) => s + (d.employee_count ?? 0),
    0,
  );
  const largest = departments.length
    ? departments.reduce((a, b) =>
        (a.employee_count ?? 0) > (b.employee_count ?? 0) ? a : b,
      )
    : null;

  const filtered = departments.filter(
    (d) =>
      !searchQuery ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.head_name ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ─── Open modals ────────────────────────────────────────────
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
    // Find matching palette by stored index or derive from id
    const idx = departments.indexOf(dept) % PALETTE.length;
    setPaletteIdx(idx < 0 ? 0 : idx);
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
  const closeModal = () => {
    if (!saving) setModalMode(null);
  };

  // ─── Validation ─────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Department name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Create / Update ────────────────────────────────────────
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

  // ─── Soft delete ────────────────────────────────────────────
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

  // ─── Create/Edit form ───────────────────────────────────────
  const DeptForm = () => (
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

          {/* Head employee UUID */}
          <div>
            <Label>Head Employee ID (UUID)</Label>
            <Input
              value={form.head_id}
              onChange={(e) => set("head_id", e.target.value)}
              placeholder="e.g. 3f2b1c4d-..."
              error={errors.head_id}
            />
            <p className="text-[11px] mt-1" style={{ color: C.textMuted }}>
              Leave blank to assign later. Must be an active employee UUID.
            </p>
            <FieldError msg={errors.head_id} />
          </div>

          {/* Parent department */}
          <div>
            <Label>Parent Department</Label>
            <SelectInput
              value={form.parent_department_id}
              onChange={(e) => set("parent_department_id", e.target.value)}
            >
              <option value="">None (top-level)</option>
              {departments
                .filter((d) => !activeDept || d.id !== activeDept.id)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
            </SelectInput>
            <p className="text-[11px] mt-1" style={{ color: C.textMuted }}>
              Enables hierarchical org structure (e.g. Frontend under
              Engineering).
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
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
              onClick={handleSave}
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

  // ─── Dept card ──────────────────────────────────────────────
  const DeptCard = ({ dept, index }) => {
    const pal = getPalette(dept, index % PALETTE.length);
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
                className="absolute right-0 top-full mt-1 w-36 rounded-xl shadow-xl z-10 overflow-hidden
                              opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                {[
                  {
                    label: "View",
                    icon: Eye,
                    action: () => openView(dept),
                    color: C.primary,
                  },
                  {
                    label: "Edit",
                    icon: Edit2,
                    action: () => openEdit(dept),
                    color: C.accent,
                  },
                  {
                    label: "Delete",
                    icon: Trash2,
                    action: () => openDelete(dept),
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

          {/* Head */}
          <div
            className="flex items-center gap-2.5 mb-3 p-2.5 rounded-xl"
            style={{ background: C.surfaceAlt }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
              style={{
                background: `linear-gradient(135deg,${pal.color},${pal.color}cc)`,
              }}
            >
              {dept.head_name
                ? dept.head_name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "—"}
            </div>
            <div className="min-w-0">
              <p
                className="text-xs font-semibold truncate"
                style={{ color: C.textPrimary }}
              >
                {dept.head_name ?? "No head assigned"}
              </p>
              {dept.parent_department_name && (
                <p
                  className="text-[10px] truncate"
                  style={{ color: C.textMuted }}
                >
                  Under: {dept.parent_department_name}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: pal.bg }}
              >
                <Users size={11} color={pal.color} />
              </div>
              <span className="text-sm font-bold" style={{ color: pal.color }}>
                {dept.employee_count ?? 0}
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
  };

  // ─── Render ─────────────────────────────────────────────────
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
        <AdminSideNavbar
          sidebarOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          ADMIN={ADMIN}
          pendingApprovals={7}
        />

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

            <div className="flex-1 max-w-sm relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                color={C.textMuted}
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search departments…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{
                  background: C.surface,
                  border: `1.5px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              />
            </div>

            <div className="flex items-center gap-2 ml-auto">
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
                <Plus size={13} />
                New Department
              </motion.button>
              <button
                className="relative p-2 rounded-xl"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <Bell size={16} color={C.textSecondary} />
              </button>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg,#4F46E5,#06B6D4)",
                }}
              >
                {ADMIN.initials}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
            {/* Title */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="flex items-center justify-between flex-wrap gap-3"
            >
              <div>
                <h1
                  className="text-xl font-bold"
                  style={{
                    color: C.textPrimary,
                    fontFamily: "Sora,sans-serif",
                  }}
                >
                  Departments
                </h1>
                <p
                  className="text-sm mt-0.5"
                  style={{ color: C.textSecondary }}
                >
                  Manage organisational structure and department heads
                </p>
              </div>
              <div
                className="flex items-center gap-1.5 text-xs"
                style={{ color: C.textMuted }}
              >
                <span>Admin</span>
                <ChevronRight size={12} />
                <span style={{ color: C.textPrimary }}>Departments</span>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                {
                  label: "Total Departments",
                  value: departments.length,
                  icon: Building2,
                  color: C.primary,
                  bg: C.primaryLight,
                },
                {
                  label: "Total Headcount",
                  value: totalHeadcount,
                  icon: Users,
                  color: C.success,
                  bg: C.successLight,
                },
                {
                  label: "Avg Dept Size",
                  value: departments.length
                    ? Math.round(totalHeadcount / departments.length)
                    : 0,
                  icon: BarChart2,
                  color: C.accent,
                  bg: C.accentLight,
                },
                {
                  label: "Largest Dept",
                  value: largest?.name ?? "—",
                  icon: TrendingUp,
                  color: C.warning,
                  bg: C.warningLight,
                  text: true,
                },
              ].map(({ label, value, icon: Icon, color, bg, text }, i) => (
                <motion.div
                  key={label}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={i + 1}
                >
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: bg }}
                      >
                        <Icon size={16} color={color} />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`${text ? "text-base" : "text-2xl"} font-bold truncate`}
                          style={{
                            color: C.textPrimary,
                            fontFamily: "Sora,sans-serif",
                          }}
                        >
                          {value}
                        </p>
                        <p className="text-xs" style={{ color: C.textMuted }}>
                          {label}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
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

            {/* Grid */}
            {viewMode === "grid" && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={3}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              >
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
                    <DeptCard key={dept.id} dept={dept} index={i} />
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
              </motion.div>
            )}

            {/* List */}
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
                          "Parent",
                          "Headcount",
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
                                  <p
                                    className="text-xs font-medium"
                                    style={{ color: C.textPrimary }}
                                  >
                                    {dept.head_name ?? "—"}
                                  </p>
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
                                    className="text-sm font-bold"
                                    style={{ color: pal.color }}
                                  >
                                    {dept.employee_count ?? 0}
                                  </span>
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

      {/* ── CREATE / EDIT MODAL ── */}
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
                <DeptForm />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── VIEW SLIDE-OVER ── */}
      <AnimatePresence>
        {modalMode === "view" &&
          activeDept &&
          (() => {
            const pal = getPalette(
              activeDept,
              departments.indexOf(activeDept) % PALETTE.length,
            );
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
                        onClick={() => openEdit(activeDept)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: C.primaryLight, color: C.primary }}
                      >
                        <Edit2 size={12} />
                        Edit
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
                          value: `${activeDept.employee_count ?? 0} employees`,
                        },
                        { label: "Dept ID", value: activeDept.id },
                        {
                          label: "Parent",
                          value: activeDept.parent_department_name ?? "None",
                        },
                        {
                          label: "Active",
                          value: activeDept.is_active ? "Yes" : "No",
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
                            className="text-sm font-semibold mt-0.5 break-all"
                            style={{ color: C.textPrimary }}
                          >
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                    {activeDept.head_name && (
                      <div
                        className="p-4 rounded-xl"
                        style={{
                          background: pal.bg,
                          border: `1px solid ${pal.color}22`,
                        }}
                      >
                        <p
                          className="text-xs font-bold mb-2"
                          style={{ color: pal.color }}
                        >
                          Department Head
                        </p>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{
                              background: `linear-gradient(135deg,${pal.color},${pal.color}cc)`,
                            }}
                          >
                            {activeDept.head_name
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p
                              className="font-semibold text-sm"
                              style={{ color: C.textPrimary }}
                            >
                              {activeDept.head_name}
                            </p>
                            <p
                              className="text-[11px] font-mono"
                              style={{ color: C.textMuted }}
                            >
                              {activeDept.head_id}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            );
          })()}
      </AnimatePresence>

      {/* ── DELETE CONFIRM ── */}
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

      {/* ── TOAST ── */}
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
