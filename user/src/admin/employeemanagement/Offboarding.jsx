// src/admin/employeemanagement/Offboarding.jsx
//
// All data comes from the service layer — zero raw API calls inside
// this component. Every function maps 1-to-1 to a named export in
// employeeApi.js or departmentApi.js.
//
// 3-step flow
// ──────────────────────────────────────────────────────
//  Step 1  →  "Start Offboarding"  modal
//             calls startOffboarding(id, payload)
//             → POST /api/employees/:id/offboard
//             → sets employment_status = "offboarding"
//             → creates the default 9-task checklist
//             ⚠️  Employee is NOT terminated yet
//
//  Step 2  →  "Manage" slide-over — HR works the checklist
//             calls toggleOffboardingTask(empId, taskId)
//             → PATCH /api/employees/:id/offboard/tasks/:taskId
//             → flips task status: pending ↔ completed
//
//  Step 3  →  "Complete Offboarding" button
//             calls completeOffboarding(id, { force })
//             → POST /api/employees/:id/offboard/complete
//             → validates all tasks done (unless force=true)
//             → THEN sets employment_status = "terminated" | "resigned" | etc.
// ──────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
// import AdminSideNavbar from "../AdminSideNavbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Bell,
  Search,
  Menu,
  Plus,
  ChevronRight,
  X,
  Check,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Archive,
  ClipboardCheck,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { C } from "./sharedData";

// ── Service layer (the only source of API calls) ──────────────
import {
  getOffboardingList,
  startOffboarding,
  toggleOffboardingTask,
  completeOffboarding,
  getOffboardingTasks,
  getEmployees,
} from "../../api/service/employeeApi";

import { departmentApi } from "../../api/service/departmentApi";

// ─────────────────────────────────────────────────────────────
// Shared animation variant
// ─────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

const Card = ({ children, className = "", style = {}, onClick }) => (
  <motion.div
    whileHover={
      onClick ? { y: -2, boxShadow: "0 8px 30px rgba(79,70,229,0.10)" } : {}
    }
    transition={{ duration: 0.18 }}
    onClick={onClick}
    className={`rounded-2xl bg-white border shadow-sm overflow-hidden ${onClick ? "cursor-pointer" : ""} ${className}`}
    style={{ borderColor: C.border, ...style }}
  >
    {children}
  </motion.div>
);

/** Maps employment_status → badge colour + label */
function StatusBadge({ status }) {
  const map = {
    offboarding: {
      label: "In Progress",
      bg: C.warningLight,
      color: C.warning,
      icon: Clock,
    },
    terminated: {
      label: "Terminated",
      bg: C.dangerLight,
      color: C.danger,
      icon: LogOut,
    },
    resigned: {
      label: "Resigned",
      bg: C.purpleLight,
      color: C.purple,
      icon: LogOut,
    },
    retired: {
      label: "Retired",
      bg: C.accentLight,
      color: C.accent,
      icon: CheckCircle2,
    },
    completed: {
      label: "Completed",
      bg: C.successLight,
      color: C.success,
      icon: CheckCircle2,
    },
  };
  const s = map[status] ?? {
    label: status,
    bg: C.surfaceAlt,
    color: C.textMuted,
    icon: Clock,
  };
  const Icon = s.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      <Icon size={10} />
      {s.label}
    </span>
  );
}

/** Bottom toast — auto-dismisses after 3.5 s */
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
      style={{ background: C.navy, color: "#fff", minWidth: 320 }}
    >
      {type === "error" ? (
        <AlertCircle size={15} color={C.danger} />
      ) : (
        <CheckCircle2 size={15} color={C.success} />
      )}
      <span className="text-sm font-medium flex-1">{msg}</span>
      <button onClick={onDismiss}>
        <X size={13} color="rgba(255,255,255,0.5)" />
      </button>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ══════════════════════════════════════════════════════════════
export default function OffboardingPage() {
  const ADMIN = {
    name: "Ngozi Adeleke",
    initials: "NA",
    role: "HR Administrator",
  };

  // ── Layout state ──────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ── List state ────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [offboardings, setOffboardings] = useState([]); // data from GET /employees/offboarding
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // ── Slide-over (checklist) ────────────────────────────────
  const [selected, setSelected] = useState(null); // selected employee row
  const [taskData, setTaskData] = useState(null); // { tasks, progress }
  const [taskLoading, setTaskLoading] = useState(false);
  const [checklistSaving, setChecklistSaving] = useState(null); // taskId being saved
  const [completing, setCompleting] = useState(false);

  // ── "Start offboarding" modal ─────────────────────────────
  const [newModal, setNewModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [employeesList, setEmployeesList] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [newForm, setNewForm] = useState({
    exitType: "terminated",
    terminationDate: "",
    terminationReason: "",
    notes: "",
  });
  const [creating, setCreating] = useState(false);
  const [createOk, setCreateOk] = useState(false);

  // ── Toast ─────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = useCallback(
    (msg, type = "success") => setToast({ msg, type }),
    [],
  );

  // ══════════════════════════════════════════════════════════
  // DATA FETCHING
  // ══════════════════════════════════════════════════════════

  /**
   * Fetch the full offboarding list.
   * Calls: getOffboardingList() → GET /api/employees/offboarding
   * Returns { data: Employee[] }
   */
  const fetchOffboardings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOffboardingList();
      // API returns { data: [...] }
      setOffboardings(res?.data ?? []);
    } catch (err) {
      showToast(
        err?.response?.data?.message ?? "Failed to load offboarding list.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOffboardings();
  }, [fetchOffboardings]);

  /**
   * Fetch departments for the "Start" modal dropdown.
   * Calls: departmentApi.list() → GET /api/departments
   * Returns { departments: [...] }
   */
  useEffect(() => {
    if (!newModal) return;
    departmentApi
      .list()
      .then((res) => setDepartments(res?.departments ?? []))
      .catch(() => showToast("Failed to load departments.", "error"));
  }, [newModal, showToast]);

  /**
   * When a department is selected, load its active employees.
   * Calls: getEmployees({ department_id, status: "active" })
   *        → GET /api/employees?department_id=X&status=active
   * Returns { data: Employee[] }
   */
  useEffect(() => {
    if (!selectedDept) {
      setEmployeesList([]);
      return;
    }
    setEmpLoading(true);
    getEmployees({ department_id: selectedDept, status: "active", limit: 100 })
      .then((res) => setEmployeesList(res?.data ?? []))
      .catch(() => showToast("Failed to load employees.", "error"))
      .finally(() => setEmpLoading(false));
  }, [selectedDept, showToast]);

  // ══════════════════════════════════════════════════════════
  // STEP 1 — Start offboarding
  // ══════════════════════════════════════════════════════════

  /**
   * Calls: startOffboarding(employeeId, payload)
   *        → POST /api/employees/:id/offboard
   *
   * Backend sets employment_status = "offboarding" and
   * creates the default checklist. Employee is NOT terminated.
   */
  const handleStartOffboarding = async () => {
    if (!selectedEmployeeId || !newForm.terminationDate) return;

    setCreating(true);
    try {
      const res = await startOffboarding(selectedEmployeeId, {
        exitType: newForm.exitType,
        terminationDate: newForm.terminationDate,
        terminationReason: newForm.terminationReason || null,
        notes: newForm.notes || null,
      });

      showToast(
        res?.message ?? "Offboarding started. Checklist has been created.",
      );
      setCreateOk(true);
      await fetchOffboardings();

      // Auto-close modal after success animation
      setTimeout(() => {
        setCreateOk(false);
        setNewModal(false);
        setSelectedDept("");
        setSelectedEmployeeId("");
        setNewForm({
          exitType: "terminated",
          terminationDate: "",
          terminationReason: "",
          notes: "",
        });
      }, 1600);
    } catch (err) {
      showToast(
        err?.response?.data?.message ?? "Failed to start offboarding.",
        "error",
      );
    } finally {
      setCreating(false);
    }
  };

  // ══════════════════════════════════════════════════════════
  // STEP 2 — Load checklist & toggle tasks
  // ══════════════════════════════════════════════════════════

  /**
   * Open the slide-over for a specific employee and load their tasks.
   * Calls: getOffboardingTasks(id)
   *        → GET /api/employees/:id/offboard/tasks
   * Returns { data: { tasks, progress: { total, completed, percent } } }
   */
  const openDetail = async (emp) => {
    setSelected(emp);
    setTaskData(null);
    setTaskLoading(true);
    try {
      const res = await getOffboardingTasks(emp.id);
      setTaskData(res?.data ?? null);
    } catch (err) {
      showToast(
        err?.response?.data?.message ?? "Failed to load checklist.",
        "error",
      );
    } finally {
      setTaskLoading(false);
    }
  };

  /**
   * Toggle one checklist task done ↔ pending.
   * Calls: toggleOffboardingTask(employeeId, taskId)
   *        → PATCH /api/employees/:id/offboard/tasks/:taskId
   *
   * Uses optimistic UI: update local state immediately,
   * then if the server call fails, revert.
   */
  const toggleTask = async (taskId) => {
    if (!selected || checklistSaving) return;

    // Snapshot for rollback
    const snapshot = taskData;

    // Optimistic update
    setChecklistSaving(taskId);
    setTaskData((prev) => {
      if (!prev) return prev;
      const updated = prev.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === "completed" ? "pending" : "completed" }
          : t,
      );
      const doneCount = updated.filter((t) => t.status === "completed").length;
      return {
        ...prev,
        tasks: updated,
        progress: {
          total: updated.length,
          completed: doneCount,
          percent: Math.round((doneCount / updated.length) * 100),
        },
      };
    });

    try {
      await toggleOffboardingTask(selected.id, taskId);
      // Server confirmed — optimistic state is correct, nothing else to do
    } catch (err) {
      // Roll back on failure
      setTaskData(snapshot);
      showToast(
        err?.response?.data?.message ?? "Failed to update task.",
        "error",
      );
    } finally {
      setChecklistSaving(null);
    }
  };

  // ══════════════════════════════════════════════════════════
  // STEP 3 — Complete offboarding (terminates employee)
  // ══════════════════════════════════════════════════════════

  /**
   * Calls: completeOffboarding(id, { force })
   *        → POST /api/employees/:id/offboard/complete
   *
   * Backend validates all tasks are done (unless force = true),
   * THEN sets employment_status = exitType (terminated/resigned/retired).
   *
   * @param {boolean} force  - skip task completion check
   */
  const handleComplete = async (force = false) => {
    if (!selected || completing) return;

    setCompleting(true);
    try {
      const res = await completeOffboarding(selected.id, { force });
      showToast(
        res?.message ?? "Offboarding completed. Employee has been terminated.",
      );
      // Close panel and refresh list
      setSelected(null);
      setTaskData(null);
      await fetchOffboardings();
    } catch (err) {
      const msg =
        err?.response?.data?.message ?? "Failed to complete offboarding.";
      const pend = err?.response?.data?.pendingCount;
      showToast(
        pend > 0 ? `${msg} (${pend} task(s) still pending)` : msg,
        "error",
      );
    } finally {
      setCompleting(false);
    }
  };

  // ══════════════════════════════════════════════════════════
  // DERIVED DATA
  // ══════════════════════════════════════════════════════════

  const filteredList = offboardings.filter((e) => {
    const fullName = `${e.first_name ?? ""} ${e.last_name ?? ""}`.toLowerCase();
    const code = (e.employee_code ?? "").toLowerCase();
    const matchSearch =
      !searchQuery ||
      fullName.includes(searchQuery.toLowerCase()) ||
      code.includes(searchQuery.toLowerCase());
    const matchStatus =
      filterStatus === "all" || e.employment_status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: offboardings.length,
    inProgress: offboardings.filter(
      (e) => e.employment_status === "offboarding",
    ).length,
    completed: offboardings.filter((e) =>
      ["terminated", "resigned", "retired"].includes(e.employment_status),
    ).length,
  };

  const allTasksDone = taskData?.progress?.percent === 100;

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
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
        {/* <AdminSideNavbar
          sidebarOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          ADMIN={ADMIN}
          pendingApprovals={7}
        /> */}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* ── Top bar ── */}
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employee name or code…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{
                  background: C.surface,
                  border: `1.5px solid ${searchQuery ? C.primary + "66" : C.border}`,
                  color: C.textPrimary,
                }}
              />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setNewModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                style={{
                  background: C.danger,
                  color: "#fff",
                  boxShadow: `0 4px 12px ${C.danger}44`,
                }}
              >
                <Plus size={13} /> Start Offboarding
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

          {/* ── Main scrollable area ── */}
          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-5">
            {/* Page title + refresh */}
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
                  Offboarding
                </h1>
                <p
                  className="text-sm mt-0.5"
                  style={{ color: C.textSecondary }}
                >
                  Manage structured employee exits — checklist → verify →
                  terminate
                </p>
              </div>
              <button
                onClick={fetchOffboardings}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl"
                style={{
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                  color: C.textSecondary,
                }}
              >
                <RefreshCw size={12} /> Refresh
              </button>
            </motion.div>

            {/* Stat cards */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="grid grid-cols-3 gap-4"
            >
              {[
                {
                  label: "Total Cases",
                  value: stats.total,
                  color: C.primary,
                  bg: C.primaryLight,
                  icon: LogOut,
                },
                {
                  label: "In Progress",
                  value: stats.inProgress,
                  color: C.warning,
                  bg: C.warningLight,
                  icon: Clock,
                },
                {
                  label: "Completed",
                  value: stats.completed,
                  color: C.success,
                  bg: C.successLight,
                  icon: CheckCircle2,
                },
              ].map(({ label, value, color, bg, icon: Icon }) => (
                <Card key={label} className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: bg }}
                    >
                      <Icon size={16} color={color} />
                    </div>
                    <div>
                      <p
                        className="text-2xl font-bold"
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
              ))}
            </motion.div>

            {/* Flow banner */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="flex items-center gap-3 p-4 rounded-2xl"
              style={{
                background: C.primaryLight,
                border: `1px solid ${C.primary}22`,
              }}
            >
              <AlertCircle size={15} color={C.primary} className="shrink-0" />
              <p className="text-xs" style={{ color: C.textSecondary }}>
                <strong style={{ color: C.primary }}>How it works: </strong>
                Start offboarding → HR works the checklist → Click "Complete
                Offboarding" →{" "}
                <strong style={{ color: C.danger }}>
                  Employee is only terminated at step 3.
                </strong>
              </p>
            </motion.div>

            {/* Status filter */}
            <Card className="p-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-xs font-semibold"
                  style={{ color: C.textMuted }}
                >
                  Status:
                </span>
                {[
                  { val: "all", label: "All" },
                  { val: "offboarding", label: "In Progress" },
                  { val: "terminated", label: "Terminated" },
                  { val: "resigned", label: "Resigned" },
                  { val: "retired", label: "Retired" },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    onClick={() => setFilterStatus(val)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background:
                        filterStatus === val ? C.primary : C.surfaceAlt,
                      color: filterStatus === val ? "#fff" : C.textSecondary,
                      border: `1px solid ${filterStatus === val ? C.primary : C.border}`,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Card>

            {/* List */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="space-y-3"
            >
              {loading ? (
                // Skeleton rows
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 rounded-2xl animate-pulse"
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                    }}
                  />
                ))
              ) : filteredList.length === 0 ? (
                <div className="flex flex-col items-center py-20">
                  <LogOut size={36} color={C.textMuted} className="mb-3" />
                  <p className="font-semibold" style={{ color: C.textPrimary }}>
                    No offboarding cases
                  </p>
                  <p className="text-sm mt-1" style={{ color: C.textMuted }}>
                    Click "Start Offboarding" to begin a new case.
                  </p>
                </div>
              ) : (
                filteredList.map((emp, i) => {
                  // The backend may return task counts directly on the list row
                  // for performance (avoids N+1). Fall back to 0 if not present.
                  const totalTasks = Number(emp.total_tasks) || 0;
                  const doneTasks = Number(emp.completed_tasks) || 0;
                  const pct =
                    totalTasks > 0
                      ? Math.round((doneTasks / totalTasks) * 100)
                      : 0;
                  const isActive = emp.employment_status === "offboarding";

                  return (
                    <motion.div
                      key={emp.id}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      custom={i}
                      whileHover={{
                        y: -2,
                        boxShadow: "0 8px 30px rgba(79,70,229,0.10)",
                      }}
                      className="rounded-2xl bg-white overflow-hidden"
                      style={{ border: `1px solid ${C.border}` }}
                    >
                      {/* Status stripe */}
                      <div
                        className="h-1"
                        style={{ background: isActive ? C.warning : C.success }}
                      />

                      <div className="p-5 flex items-start gap-4">
                        {/* Avatar */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{
                            background: `linear-gradient(135deg,${C.primary},${C.accent})`,
                          }}
                        >
                          {emp.first_name?.[0]}
                          {emp.last_name?.[0]}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p
                              className="font-bold text-sm"
                              style={{ color: C.textPrimary }}
                            >
                              {emp.first_name} {emp.last_name}
                            </p>
                            <StatusBadge status={emp.employment_status} />
                          </div>
                          <p className="text-xs" style={{ color: C.textMuted }}>
                            {emp.job_role_name} · {emp.department_name} ·{" "}
                            {emp.employee_code}
                          </p>
                          {emp.termination_date && (
                            <p
                              className="text-xs mt-1 flex items-center gap-1"
                              style={{ color: C.textMuted }}
                            >
                              <Calendar size={10} />
                              Exit:{" "}
                              <strong style={{ color: C.textPrimary }}>
                                {new Date(
                                  emp.termination_date,
                                ).toLocaleDateString("en-NG", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </strong>
                            </p>
                          )}
                        </div>

                        {/* Progress ring + CTA */}
                        <div className="flex items-center gap-5 shrink-0">
                          {totalTasks > 0 && (
                            <div className="text-center">
                              <p
                                className="text-xl font-bold"
                                style={{
                                  color: pct === 100 ? C.success : C.warning,
                                  fontFamily: "Sora,sans-serif",
                                }}
                              >
                                {pct}%
                              </p>
                              <p
                                className="text-[10px]"
                                style={{ color: C.textMuted }}
                              >
                                {doneTasks}/{totalTasks} tasks
                              </p>
                              <div
                                className="w-20 h-1.5 rounded-full mt-1 overflow-hidden"
                                style={{ background: C.border }}
                              >
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{
                                    duration: 0.8,
                                    ease: "easeOut",
                                  }}
                                  className="h-full rounded-full"
                                  style={{
                                    background:
                                      pct === 100 ? C.success : C.warning,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {isActive && (
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => openDetail(emp)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                              style={{
                                background: C.primaryLight,
                                color: C.primary,
                              }}
                            >
                              Manage <ArrowRight size={12} />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </main>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          STEP 2 — CHECKLIST SLIDE-OVER
      ════════════════════════════════════════════ */}
      <AnimatePresence>
        {selected && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => {
                setSelected(null);
                setTaskData(null);
              }}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col shadow-2xl"
              style={{
                background: C.surface,
                borderLeft: `1px solid ${C.border}`,
              }}
            >
              {/* Panel header */}
              <div
                className="flex items-center justify-between px-5 py-4 shrink-0"
                style={{ borderBottom: `1px solid ${C.border}` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                    style={{
                      background: `linear-gradient(135deg,${C.primary},${C.accent})`,
                    }}
                  >
                    {selected.first_name?.[0]}
                    {selected.last_name?.[0]}
                  </div>
                  <div>
                    <p
                      className="font-bold text-sm"
                      style={{ color: C.textPrimary }}
                    >
                      {selected.first_name} {selected.last_name}
                    </p>
                    <p className="text-xs" style={{ color: C.textMuted }}>
                      {selected.job_role_name} · {selected.department_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelected(null);
                    setTaskData(null);
                  }}
                  className="p-1.5 rounded-lg"
                  style={{ background: C.surfaceAlt }}
                >
                  <X size={15} color={C.textSecondary} />
                </button>
              </div>

              {/* Progress bar */}
              {taskData?.progress && (
                <div
                  className="px-5 py-3 shrink-0"
                  style={{ borderBottom: `1px solid ${C.border}` }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: C.textPrimary }}
                    >
                      Checklist Progress
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: allTasksDone ? C.success : C.warning }}
                    >
                      {taskData.progress.completed}/{taskData.progress.total}{" "}
                      tasks · {taskData.progress.percent}%
                    </span>
                  </div>
                  <div
                    className="w-full h-2 rounded-full"
                    style={{ background: C.border }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${taskData.progress.percent}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      style={{
                        background: allTasksDone ? C.success : C.warning,
                      }}
                    />
                  </div>
                  {selected.termination_date && (
                    <p
                      className="text-[11px] mt-1.5 flex items-center gap-1"
                      style={{ color: C.textMuted }}
                    >
                      <Calendar size={10} />
                      Exit date:{" "}
                      <strong style={{ color: C.textPrimary }}>
                        {new Date(selected.termination_date).toLocaleDateString(
                          "en-NG",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </strong>
                    </p>
                  )}
                </div>
              )}

              {/* Tasks list */}
              <div className="flex-1 overflow-y-auto p-5 space-y-2">
                {taskLoading ? (
                  Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-12 rounded-xl animate-pulse"
                      style={{ background: C.surfaceAlt }}
                    />
                  ))
                ) : !taskData?.tasks?.length ? (
                  <div className="text-center py-14">
                    <ClipboardCheck
                      size={32}
                      color={C.textMuted}
                      className="mx-auto mb-2"
                    />
                    <p className="text-sm" style={{ color: C.textMuted }}>
                      No tasks found.
                    </p>
                  </div>
                ) : (
                  taskData.tasks.map((task) => {
                    const done = task.status === "completed";
                    const saving = checklistSaving === task.id;

                    return (
                      <motion.div
                        key={task.id}
                        whileHover={{ scale: 1.005 }}
                        onClick={() => !saving && toggleTask(task.id)}
                        className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all"
                        style={{
                          background: done ? C.successLight : C.surfaceAlt,
                          border: `1px solid ${done ? C.success + "44" : C.border}`,
                        }}
                      >
                        {/* Checkbox */}
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                          style={{
                            background: done ? C.success : C.surface,
                            border: `2px solid ${done ? C.success : C.border}`,
                          }}
                        >
                          {saving ? (
                            <Loader2
                              size={10}
                              color={done ? "#fff" : C.textMuted}
                              className="animate-spin"
                            />
                          ) : (
                            done && <Check size={11} color="#fff" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className="text-xs font-medium"
                            style={{
                              color: done ? C.success : C.textPrimary,
                              textDecoration: done ? "line-through" : "none",
                            }}
                          >
                            {/* Backend may use `task` or `label` */}
                            {task.task ?? task.label}
                          </p>
                          {task.assignee && (
                            <p
                              className="text-[10px] mt-0.5"
                              style={{ color: C.textMuted }}
                            >
                              Assignee: {task.assignee}
                            </p>
                          )}
                        </div>

                        {done && (
                          <CheckCircle2
                            size={14}
                            color={C.success}
                            className="shrink-0"
                          />
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Step 3 footer — only shown while employee is in offboarding */}
              {selected.employment_status === "offboarding" && (
                <div
                  className="p-5 shrink-0 space-y-2"
                  style={{ borderTop: `1px solid ${C.border}` }}
                >
                  {/* Pending warning */}
                  {taskData?.progress && !allTasksDone && (
                    <div
                      className="flex items-start gap-2 p-3 rounded-xl"
                      style={{
                        background: C.warningLight,
                        border: `1px solid ${C.warning}33`,
                      }}
                    >
                      <AlertTriangle
                        size={13}
                        color={C.warning}
                        className="shrink-0 mt-0.5"
                      />
                      <p className="text-xs" style={{ color: C.textSecondary }}>
                        {taskData.progress.total - taskData.progress.completed}{" "}
                        task(s) still pending. Complete all tasks before
                        terminating, or use Force Complete.
                      </p>
                    </div>
                  )}

                  {/* Complete button — disabled until all tasks done */}
                  <motion.button
                    whileHover={{ scale: allTasksDone ? 1.01 : 1 }}
                    whileTap={{ scale: allTasksDone ? 0.98 : 1 }}
                    onClick={() => handleComplete(false)}
                    disabled={completing || !allTasksDone}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                    style={{
                      background: allTasksDone ? C.success : C.border,
                      boxShadow: allTasksDone
                        ? `0 4px 12px ${C.success}44`
                        : "none",
                      opacity: !allTasksDone || completing ? 0.6 : 1,
                      cursor:
                        !allTasksDone || completing ? "not-allowed" : "pointer",
                    }}
                  >
                    {completing ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />{" "}
                        Completing…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} /> Complete Offboarding &
                        Terminate
                      </>
                    )}
                  </motion.button>

                  {/* Force complete — only visible while tasks are pending */}
                  {taskData?.progress && !allTasksDone && (
                    <button
                      onClick={() => handleComplete(true)}
                      disabled={completing}
                      className="w-full py-2 rounded-xl text-xs font-semibold"
                      style={{
                        background: C.dangerLight,
                        color: C.danger,
                        border: `1px solid ${C.danger}33`,
                      }}
                    >
                      Force Complete (skip remaining tasks)
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════
          STEP 1 — START OFFBOARDING MODAL
      ════════════════════════════════════════════ */}
      <AnimatePresence>
        {newModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => !creating && setNewModal(false)}
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
                {/* Modal header */}
                <div
                  className="px-5 py-4 border-b flex items-center justify-between"
                  style={{ borderColor: C.border }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: C.dangerLight }}
                    >
                      <LogOut size={15} color={C.danger} />
                    </div>
                    <p
                      className="font-bold text-sm"
                      style={{ color: C.textPrimary }}
                    >
                      Initiate Offboarding
                    </p>
                  </div>
                  <button
                    onClick={() => !creating && setNewModal(false)}
                    className="p-1.5 rounded-lg"
                    style={{ background: C.surfaceAlt }}
                  >
                    <X size={15} color={C.textSecondary} />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {/* ── Success state ── */}
                  {createOk ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-10 flex flex-col items-center gap-3 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <CheckCircle2 size={52} color={C.success} />
                      </motion.div>
                      <p
                        className="font-bold text-lg"
                        style={{ color: C.textPrimary }}
                      >
                        Offboarding Initiated
                      </p>
                      <p className="text-sm" style={{ color: C.textSecondary }}>
                        Checklist created. The employee is{" "}
                        <strong style={{ color: C.danger }}>
                          not yet terminated
                        </strong>{" "}
                        — complete the checklist to finalise.
                      </p>
                    </motion.div>
                  ) : (
                    /* ── Form ── */
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-5 space-y-4"
                    >
                      {/* Warning banner */}
                      <div
                        className="p-3.5 rounded-xl flex items-start gap-2"
                        style={{
                          background: C.warningLight,
                          border: `1px solid ${C.warning}33`,
                        }}
                      >
                        <AlertTriangle
                          size={14}
                          color={C.warning}
                          className="mt-0.5 shrink-0"
                        />
                        <p
                          className="text-xs"
                          style={{ color: C.textSecondary }}
                        >
                          This starts the formal exit process and creates an
                          offboarding checklist. The employee will{" "}
                          <strong>not be terminated</strong> until all tasks are
                          completed.
                        </p>
                      </div>

                      {/* Department select — from departmentApi.list() */}
                      <div>
                        <label
                          className="block text-xs font-semibold mb-1.5"
                          style={{ color: C.textPrimary }}
                        >
                          Department <span style={{ color: C.danger }}>*</span>
                        </label>
                        <select
                          value={selectedDept}
                          onChange={(e) => {
                            setSelectedDept(e.target.value);
                            setSelectedEmployeeId("");
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                          style={{
                            background: C.surfaceAlt,
                            border: `1.5px solid ${selectedDept ? C.primary + "66" : C.border}`,
                            color: C.textPrimary,
                          }}
                        >
                          <option value="">Select department…</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Employee select — from getEmployees({ department_id }) */}
                      {selectedDept && (
                        <div>
                          <label
                            className="block text-xs font-semibold mb-1.5"
                            style={{ color: C.textPrimary }}
                          >
                            Employee <span style={{ color: C.danger }}>*</span>
                          </label>
                          {empLoading ? (
                            <div
                              className="h-10 rounded-xl animate-pulse"
                              style={{ background: C.surfaceAlt }}
                            />
                          ) : (
                            <select
                              value={selectedEmployeeId}
                              onChange={(e) =>
                                setSelectedEmployeeId(e.target.value)
                              }
                              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                              style={{
                                background: C.surfaceAlt,
                                border: `1.5px solid ${selectedEmployeeId ? C.primary + "66" : C.border}`,
                                color: C.textPrimary,
                              }}
                            >
                              <option value="">Select employee…</option>
                              {employeesList.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                  {emp.first_name} {emp.last_name} —{" "}
                                  {emp.job_role_name ?? "Employee"}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}

                      {/* Exit type + date */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            className="block text-xs font-semibold mb-1.5"
                            style={{ color: C.textPrimary }}
                          >
                            Exit Type <span style={{ color: C.danger }}>*</span>
                          </label>
                          <select
                            value={newForm.exitType}
                            onChange={(e) =>
                              setNewForm((p) => ({
                                ...p,
                                exitType: e.target.value,
                              }))
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                            style={{
                              background: C.surfaceAlt,
                              border: `1.5px solid ${C.border}`,
                              color: C.textPrimary,
                            }}
                          >
                            <option value="terminated">Termination</option>
                            <option value="resigned">Resignation</option>
                            <option value="retired">Retirement</option>
                          </select>
                        </div>

                        <div>
                          <label
                            className="block text-xs font-semibold mb-1.5"
                            style={{ color: C.textPrimary }}
                          >
                            Exit Date <span style={{ color: C.danger }}>*</span>
                          </label>
                          <input
                            type="date"
                            value={newForm.terminationDate}
                            onChange={(e) =>
                              setNewForm((p) => ({
                                ...p,
                                terminationDate: e.target.value,
                              }))
                            }
                            min={new Date().toISOString().slice(0, 10)}
                            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                            style={{
                              background: C.surfaceAlt,
                              border: `1.5px solid ${newForm.terminationDate ? C.primary + "66" : C.border}`,
                              color: C.textPrimary,
                            }}
                          />
                        </div>
                      </div>

                      {/* Reason */}
                      <div>
                        <label
                          className="block text-xs font-semibold mb-1.5"
                          style={{ color: C.textPrimary }}
                        >
                          Reason / Notes
                        </label>
                        <textarea
                          value={newForm.terminationReason}
                          rows={2}
                          onChange={(e) =>
                            setNewForm((p) => ({
                              ...p,
                              terminationReason: e.target.value,
                            }))
                          }
                          placeholder="Briefly describe the reason for exit…"
                          className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
                          style={{
                            background: C.surfaceAlt,
                            border: `1.5px solid ${C.border}`,
                            color: C.textPrimary,
                          }}
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3 pt-1">
                        <button
                          onClick={() => setNewModal(false)}
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
                          onClick={handleStartOffboarding}
                          disabled={
                            creating ||
                            !selectedEmployeeId ||
                            !newForm.terminationDate
                          }
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                          style={{
                            background: C.danger,
                            color: "#fff",
                            opacity:
                              creating ||
                              !selectedEmployeeId ||
                              !newForm.terminationDate
                                ? 0.6
                                : 1,
                            cursor:
                              creating ||
                              !selectedEmployeeId ||
                              !newForm.terminationDate
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          {creating ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />{" "}
                              Starting…
                            </>
                          ) : (
                            "Start Offboarding"
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Toast notification ── */}
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
