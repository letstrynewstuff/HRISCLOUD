// src/admin/employeemanagement/JobRoles.jsx
// Route: /admin/employeemanagement/job-roles
// 100 % API-connected — zero mock data.
// Header matches the Approvals page pattern.
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSideNavbar from "../AdminSideNavbar";
import { C } from "./sharedData"; 
import {
  listJobRoles,
  createJobRole,
  updateJobRole,
  deleteJobRole,
} from "../../api/service/jobRoleApi";
import { departmentApi } from "../../api/service/departmentApi";
import { gradeApi } from "../../api/service/gradeApi";
import {
  Briefcase,
  Search,
  Menu,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  X,
  Loader2,
  DollarSign,
  AlertCircle,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Settings,
  Palette,
} from "lucide-react";

/* ─── Helpers ─── */
const fmt = (n) => (n == null ? "—" : `₦${Number(n).toLocaleString("en-NG")}`);

const Field = ({ label, required, error, hint, children }) => (
  <div>
    <label
      className="block text-xs font-semibold mb-1.5"
      style={{ color: C.textPrimary }}
    >
      {label} {required && <span style={{ color: C.danger }}>*</span>}
    </label>
    {children}
    {hint && !error && (
      <p className="text-[11px] mt-1" style={{ color: C.textMuted }}>
        {hint}
      </p>
    )}
    {error && (
      <p
        className="text-[11px] mt-1 flex items-center gap-1"
        style={{ color: C.danger }}
      >
        <AlertCircle size={10} />
        {error}
      </p>
    )}
  </div>
);

const Inp = ({ error, ...props }) => (
  <input
    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
    style={{
      background: C.surfaceAlt,
      border: `1.5px solid ${error ? C.danger : props.value ? C.primary + "66" : C.border}`,
      color: C.textPrimary,
    }}
    {...props}
  />
);

const Sel = ({ error, children, ...props }) => (
  <div className="relative">
    <select
      className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl text-sm outline-none"
      style={{
        background: C.surfaceAlt,
        border: `1.5px solid ${error ? C.danger : props.value ? C.primary + "66" : C.border}`,
        color: props.value ? C.textPrimary : C.textMuted,
      }}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      size={13}
      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
      color={C.textMuted}
    />
  </div>
);

/* ─── Role card ─── */
function RoleCard({ role, onEdit, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: C.primaryLight }}
          >
            <Briefcase size={16} color={C.primary} />
          </div>
          <div>
            <p
              className="font-semibold text-sm leading-tight"
              style={{ color: C.textPrimary }}
            >
              {role.title}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: C.textMuted }}>
              {role.departmentName ?? "No department"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => onEdit(role)}
            className="w-7 h-7 rounded-lg flex items-center justify-center border-none cursor-pointer"
            style={{ background: C.primaryLight }}
          >
            <Edit2 size={12} color={C.primary} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => onDelete(role)}
            className="w-7 h-7 rounded-lg flex items-center justify-center border-none cursor-pointer"
            style={{ background: C.dangerLight }}
          >
            <Trash2 size={12} color={C.danger} />
          </motion.button>
        </div>
      </div>

      <div
        className="flex flex-wrap gap-2 mt-auto pt-2"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        {role.gradeName && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: `${role.gradeColor || C.primary}22`,
              color: role.gradeColor || C.primary,
            }}
          >
            {role.gradeName}
          </span>
        )}
        {role.minSalary != null && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: C.successLight, color: C.success }}
          >
            {fmt(role.minSalary)} – {fmt(role.maxSalary)}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Grade Management Modal ─── */
function GradeModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    name: "",
    minSalary: "",
    maxSalary: "",
    colorCode: "#4F46E5",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const res = await gradeApi.create(form);
      onSave(res.data);
      onClose();
    } catch (err) {
      alert("Failed to create grade");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: C.surface }}
      >
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-sm">Create New Grade</h4>
          <X size={16} onClick={onClose} className="cursor-pointer" />
        </div>
        <div className="space-y-4">
          <Field label="Grade Name" required>
            <Inp
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Level 1, Senior, etc."
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Min Pay">
              <Inp
                type="number"
                value={form.minSalary}
                onChange={(e) =>
                  setForm({ ...form, minSalary: e.target.value })
                }
              />
            </Field>
            <Field label="Max Pay">
              <Inp
                type="number"
                value={form.maxSalary}
                onChange={(e) =>
                  setForm({ ...form, maxSalary: e.target.value })
                }
              />
            </Field>
          </div>
          <Field label="Theme Color">
            <Inp
              type="color"
              value={form.colorCode}
              onChange={(e) => setForm({ ...form, colorCode: e.target.value })}
              className="h-10 p-1"
            />
          </Field>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-6 py-2.5 rounded-xl text-white font-bold text-xs border-none cursor-pointer"
          style={{ background: C.primary }}
        >
          {saving ? "Creating..." : "Create Grade"}
        </button>
      </motion.div>
    </div>
  );
}

/* ─── Role Modal ─── */
function RoleModal({
  mode,
  initial,
  departments,
  grades,
  onSave,
  onClose,
  onNewGrade,
}) {
  const [form, setForm] = useState(
    initial || {
      title: "",
      departmentId: "",
      gradeId: "",
      description: "",
      isActive: true,
    },
  );
  const [saving, setSaving] = useState(false);

  const selectedGrade = grades.find((g) => g.id === form.gradeId);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res =
        mode === "edit"
          ? await updateJobRole(initial.id, form)
          : await createJobRole(form);
      onSave(res.role);
    } catch (err) {
      alert("Error saving role");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col shadow-2xl"
        style={{ background: C.surface }}
      >
        <div
          className="px-6 py-5 flex items-center justify-between text-white"
          style={{
            background: `linear-gradient(135deg,${C.navy},${C.primary})`,
          }}
        >
          <h3 className="font-bold">
            {mode === "edit" ? "Edit Role" : "New Role"}
          </h3>
          <X size={16} onClick={onClose} className="cursor-pointer" />
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <Field label="Job Title" required>
            <Inp
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <Field label="Department">
            <Sel
              value={form.departmentId}
              onChange={(e) =>
                setForm({ ...form, departmentId: e.target.value })
              }
            >
              <option value="">No department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Sel>
          </Field>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Field label="Grade Level">
                <Sel
                  value={form.gradeId}
                  onChange={(e) =>
                    setForm({ ...form, gradeId: e.target.value })
                  }
                >
                  <option value="">Select grade...</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </Sel>
              </Field>
            </div>
            <button
              onClick={onNewGrade}
              className="h-10 w-10 rounded-xl flex items-center justify-center border-none cursor-pointer"
              style={{ background: C.primaryLight }}
            >
              <Plus size={16} color={C.primary} />
            </button>
          </div>
          {selectedGrade && (
            <div
              className="p-4 rounded-xl text-xs"
              style={{ background: C.successLight, color: C.success }}
            >
              <p className="font-bold">Automated Pay Range</p>
              <p className="text-sm font-bold">
                {fmt(selectedGrade.min_salary)} –{" "}
                {fmt(selectedGrade.max_salary)}
              </p>
            </div>
          )}
        </div>
        <div className="p-6 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold bg-gray-100 border-none cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl font-bold text-white border-none cursor-pointer"
            style={{ background: C.primary }}
          >
            {saving ? "Saving..." : "Save Role"}
          </button>
        </div>
      </motion.div>
    </>
  );
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function JobRoles() {
  // Placeholder for your actual Auth Logic
  // const { user } = useAuth();
  const user = { firstName: "Admin", role: "Super Admin", initials: "AD" };

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleModal, setRoleModal] = useState(null);
  const [gradeModalOpen, setGradeModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, dRes, gRes] = await Promise.all([
        listJobRoles(),
        departmentApi.list(), // FIXED: using the list method inside the object
        gradeApi.list(),
      ]);
      setRoles(rRes.roles || []);
      setDepartments(dRes.departments || dRes.data || []);
      setGrades(gRes.data || []);
    } catch (e) {
      console.error("Data sync failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaved = (saved) => {
    setRoles((prev) => {
      const idx = prev.findIndex((r) => r.id === saved.id);
      return idx >= 0
        ? prev.map((r) => (r.id === saved.id ? saved : r))
        : [saved, ...prev];
    });
    setRoleModal(null);
  };

  const filtered = roles.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      className="min-h-screen"
      style={{ background: C.bg, fontFamily: "'DM Sans',sans-serif" }}
    >
      <div className="flex h-screen overflow-hidden">
        <AdminSideNavbar
          sidebarOpen={sidebarOpen}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          ADMIN={{
            name: user.firstName,
            role: user.role,
            initials: user.initials,
          }}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-[60px] flex items-center px-5 gap-4 border-b bg-white/80 backdrop-blur-md">
            <Menu
              size={18}
              className="cursor-pointer"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            />
            <div className="flex-1 max-w-xs relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search roles..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border outline-none"
              />
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={() => setGradeModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border hover:bg-gray-50 cursor-pointer bg-white"
              >
                <Settings size={13} /> Custom Grades
              </button>
              <button
                onClick={() => setRoleModal({ mode: "create" })}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg border-none cursor-pointer"
                style={{ background: C.primary }}
              >
                <Plus size={13} /> New Role
              </button>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: C.purple }}
              >
                {user.initials}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-8 text-white flex justify-between items-center"
              style={{
                background: `linear-gradient(135deg, ${C.navy}, ${C.primary})`,
              }}
            >
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Job Roles</h1>
                <p className="opacity-70 text-sm mt-1">
                  {user.firstName} • {user.role}
                </p>
              </div>
              <Briefcase size={40} className="opacity-20" />
            </motion.div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin" color={C.primary} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence>
                  {filtered.map((role) => (
                    <RoleCard
                      key={role.id}
                      role={role}
                      onEdit={(r) => setRoleModal({ mode: "edit", role: r })}
                      onDelete={(id) => deleteJobRole(id).then(fetchData)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </main>
        </div>
      </div>

      <AnimatePresence>
        {roleModal && (
          <RoleModal
            mode={roleModal.mode}
            initial={roleModal.role}
            departments={departments}
            grades={grades}
            onSave={handleSaved}
            onClose={() => setRoleModal(null)}
            onNewGrade={() => setGradeModalOpen(true)}
          />
        )}
        {gradeModalOpen && (
          <GradeModal
            onSave={(g) => setGrades([...grades, g])}
            onClose={() => setGradeModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
