

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  LogOut,
  Search,
  Plus,
  X,
  Check,
  ChevronLeft,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ClipboardCheck,
  ArrowRight,
  ChevronRight,
} from "lucide-react-native";

import C from "../../../styles/colors";
import {
  getOffboardingList,
  startOffboarding,
  toggleOffboardingTask,
  completeOffboarding,
  getOffboardingTasks,
  getEmployees,
  getEmployeeById,
} from "../../../api/service/employeeApi";
import { departmentApi } from "../../../api/service/departmentApi";
import { Loader } from "../../../hooks/loaderManager";

/* ─── Types ─────────────────────────────────────────────────── */
interface OffboardingEmployee {
  id: string;
  first_name?: string;
  last_name?: string;
  employee_code?: string;
  employment_status: string;
  job_role_name?: string;
  department_name?: string;
  termination_date?: string;
  total_tasks?: number;
  completed_tasks?: number;
}

interface OffboardingTask {
  id: string;
  task?: string;
  label?: string;
  status: "pending" | "completed";
  assignee?: string;
}

interface TaskData {
  tasks: OffboardingTask[];
  progress: { total: number; completed: number; percent: number };
}

interface ToastState {
  msg: string;
  type: "success" | "error";
}

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
  prefillEmployeeId?: string;
  prefillExitType?: string;
}

/* ─── Helpers ─────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    offboarding: { label: "In Progress", bg: C.warningLight, color: C.warning },
    terminated: { label: "Terminated", bg: C.dangerLight, color: C.danger },
    resigned: { label: "Resigned", bg: C.surfaceAlt, color: C.textMuted },
    retired: { label: "Retired", bg: C.successLight, color: C.success },
    completed: { label: "Completed", bg: C.successLight, color: C.success },
  };
  const s = map[status] ?? {
    label: status,
    bg: C.surfaceAlt,
    color: C.textMuted,
  };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <View style={[styles.dot, { backgroundColor: s.color }]} />
      <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

function Toast({
  msg,
  type,
  onDismiss,
}: {
  msg: string;
  type: "success" | "error";
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <View style={styles.toast}>
      {type === "error" ? (
        <AlertCircle size={15} color={C.danger} />
      ) : (
        <CheckCircle2 size={15} color={C.success} />
      )}
      <Text style={styles.toastText}>{msg}</Text>
      <Pressable onPress={onDismiss}>
        <X size={13} color="rgba(255,255,255,0.5)" />
      </Pressable>
    </View>
  );
}

/* ─── Bottom-sheet Select ───────────────────────────────────── */
function SelectModal({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: { label: string; value: string }[];
  value: string;
  onSelect: (val: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={selectStyles.overlay}>
        <View style={selectStyles.sheet}>
          <View style={selectStyles.header}>
            <Text style={selectStyles.title}>{title}</Text>
            <Pressable onPress={onClose} style={selectStyles.closeBtn}>
              <X size={18} color={C.textSecondary} />
            </Pressable>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onSelect(item.value);
                  onClose();
                }}
                style={[
                  selectStyles.option,
                  value === item.value && selectStyles.optionActive,
                ]}
              >
                <Text
                  style={[
                    selectStyles.optionText,
                    value === item.value && selectStyles.optionTextActive,
                  ]}
                >
                  {item.label}
                </Text>
                {value === item.value && <Check size={16} color={C.primary} />}
              </Pressable>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function OffboardingView({
  onClose,
  onSuccess,
  prefillEmployeeId,
  prefillExitType,
}: Props) {
  const insets = useSafeAreaInsets();

  /* ── List state ─────────────────────────────────────────── */
  const [loading, setLoading] = useState(true);
  const [offboardings, setOffboardings] = useState<OffboardingEmployee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  /* ── Checklist modal (Step 2) ───────────────────────────── */
  const [selected, setSelected] = useState<OffboardingEmployee | null>(null);
  const [taskData, setTaskData] = useState<TaskData | null>(null);
  const [taskLoading, setTaskLoading] = useState(false);
  const [checklistSaving, setChecklistSaving] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  /* ── Start modal (Step 1) ───────────────────────────────── */
  const [newModal, setNewModal] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [employeesList, setEmployeesList] = useState<any[]>([]);
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

  /* ── Select modals ──────────────────────────────────────── */
  const [showDeptSelect, setShowDeptSelect] = useState(false);
  const [showEmpSelect, setShowEmpSelect] = useState(false);
  const [showExitTypeSelect, setShowExitTypeSelect] = useState(false);

  /* ── Toast ──────────────────────────────────────────────── */
  const [toast, setToast] = useState<ToastState | null>(null);
  const showToast = useCallback(
    (msg: string, type: "success" | "error" = "success") =>
      setToast({ msg, type }),
    [],
  );

  /* ═════════════════════════════════════════════════════════
     PREFILL LOGIC — when coming from Profile actions
     ═════════════════════════════════════════════════════════ */
  // useEffect(() => {
  //   if (!prefillEmployeeId) return;
  //   const run = async () => {
  //     try {
  //       const res = await getEmployeeById(prefillEmployeeId);
  //       const employee = res.data ?? res;
  //       if (employee?.department_id) {
  //         setSelectedDept(employee.department_id);
  //         setSelectedEmployeeId(prefillEmployeeId);
  //         setNewForm((prev) => ({
  //           ...prev,
  //           exitType: prefillExitType || "terminated",
  //         }));
  //         setNewModal(true);
  //       }
  //     } catch (e) {
  //       showToast("Failed to load employee for offboarding.", "error");
  //     }
  //   };
  //   run();
  // }, [prefillEmployeeId, prefillExitType]);
useEffect(() => {
  if (!prefillEmployeeId) return;
  const run = async () => {
    Loader.show();
    try {
      const res = await getEmployeeById(prefillEmployeeId);
      const employee = res.data ?? res;
      if (employee?.department_id) {
        setSelectedDept(employee.department_id);
        setSelectedEmployeeId(prefillEmployeeId);
        setNewForm((prev) => ({
          ...prev,
          exitType: prefillExitType || "terminated",
        }));
        setNewModal(true);
      }
    } catch (e) {
      showToast("Failed to load employee for offboarding.", "error");
    } finally {
      Loader.hide();
    }
  };
  run();
}, [prefillEmployeeId, prefillExitType]);
  /* ═════════════════════════════════════════════════════════
     DATA FETCHING
     ═════════════════════════════════════════════════════════ */
  // const fetchOffboardings = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const res = await getOffboardingList();
  //     setOffboardings(res?.data ?? []);
  //   } catch (err: any) {
  //     showToast(
  //       err?.response?.data?.message ?? "Failed to load offboarding list.",
  //       "error",
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [showToast]);
const fetchOffboardings = useCallback(async () => {
  setLoading(true);
  Loader.show();
  try {
    const res = await getOffboardingList();
    setOffboardings(res?.data ?? []);
  } catch (err: any) {
    showToast(
      err?.response?.data?.message ?? "Failed to load offboarding list.",
      "error",
    );
  } finally {
    setLoading(false);
    Loader.hide();
  }
}, [showToast]);
  useEffect(() => {
    fetchOffboardings();
  }, [fetchOffboardings]);

  useEffect(() => {
    if (!newModal) return;
    departmentApi
      .list()
      .then((res) => setDepartments(res?.departments ?? []))
      .catch(() => showToast("Failed to load departments.", "error"));
  }, [newModal, showToast]);

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

  /* ═════════════════════════════════════════════════════════
     STEP 1 — Start offboarding
     ═════════════════════════════════════════════════════════ */
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
      showToast(res?.message ?? "Offboarding started. Checklist created.");
      setCreateOk(true);
      await fetchOffboardings();
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
        onSuccess?.();
      }, 1600);
    } catch (err: any) {
      showToast(
        err?.response?.data?.message ?? "Failed to start offboarding.",
        "error",
      );
    } finally {
      setCreating(false);
    }
  };

  /* ═════════════════════════════════════════════════════════
     STEP 2 — Checklist
     ═════════════════════════════════════════════════════════ */
  const openDetail = async (emp: OffboardingEmployee) => {
    setSelected(emp);
    setTaskData(null);
    setTaskLoading(true);
    try {
      const res = await getOffboardingTasks(emp.id);
      setTaskData(res?.data ?? null);
    } catch (err: any) {
      showToast(
        err?.response?.data?.message ?? "Failed to load checklist.",
        "error",
      );
    } finally {
      setTaskLoading(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!selected || checklistSaving) return;
    const snapshot = taskData;
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
    } catch (err: any) {
      setTaskData(snapshot);
      showToast(
        err?.response?.data?.message ?? "Failed to update task.",
        "error",
      );
    } finally {
      setChecklistSaving(null);
    }
  };

  /* ═════════════════════════════════════════════════════════
     STEP 3 — Complete
     ═════════════════════════════════════════════════════════ */
  const handleComplete = async (force = false) => {
    if (!selected || completing) return;
    setCompleting(true);
    try {
      const res = await completeOffboarding(selected.id, { force });
      showToast(res?.message ?? "Offboarding completed. Employee terminated.");
      setSelected(null);
      setTaskData(null);
      await fetchOffboardings();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? "Failed to complete offboarding.";
      const pend = err?.response?.data?.pendingCount;
      showToast(pend > 0 ? `${msg} (${pend} task(s) pending)` : msg, "error");
    } finally {
      setCompleting(false);
    }
  };

  /* ═════════════════════════════════════════════════════════
     DERIVED
     ═════════════════════════════════════════════════════════ */
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

  const selectedEmployeeLabel = selectedEmployeeId
    ? employeesList.find((e) => e.id === selectedEmployeeId)
    : null;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOffboardings();
    setRefreshing(false);
  }, [fetchOffboardings]);

  /* ── Render card ────────────────────────────────────────── */
  const renderItem = ({ item: emp }: { item: OffboardingEmployee }) => {
    const totalTasks = Number(emp.total_tasks) || 0;
    const doneTasks = Number(emp.completed_tasks) || 0;
    const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const isActive = emp.employment_status === "offboarding";

    return (
      <Pressable
        onPress={() => isActive && openDetail(emp)}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
      >
        <View style={styles.cardTop}>
          <View style={styles.cardHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {emp.first_name?.[0]}
                {emp.last_name?.[0]}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.cardName}>
                  {emp.first_name} {emp.last_name}
                </Text>
                <StatusBadge status={emp.employment_status} />
              </View>
              <Text style={styles.cardMeta}>
                {emp.job_role_name} · {emp.department_name} ·{" "}
                {emp.employee_code}
              </Text>
              {emp.termination_date && (
                <View style={styles.dateRow}>
                  <Calendar size={10} color={C.textMuted} />
                  <Text style={styles.dateText}>
                    Exit:{" "}
                    <Text style={styles.dateTextBold}>
                      {new Date(emp.termination_date).toLocaleDateString(
                        "en-NG",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </Text>
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.cardBottom}>
            {totalTasks > 0 && (
              <View style={styles.progressCol}>
                <Text
                  style={[
                    styles.pctText,
                    { color: pct === 100 ? C.success : C.warning },
                  ]}
                >
                  {pct}%
                </Text>
                <Text style={styles.taskText}>
                  {doneTasks}/{totalTasks} tasks
                </Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${pct}%`,
                        backgroundColor: pct === 100 ? C.success : C.warning,
                      },
                    ]}
                  />
                </View>
              </View>
            )}

            {isActive && (
              <Pressable
                onPress={() => openDetail(emp)}
                style={styles.manageBtn}
              >
                <Text style={styles.manageBtnText}>Manage</Text>
                <ArrowRight size={12} color={C.primary} />
              </Pressable>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Offboarding</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? "Loading…" : `${stats.total} total cases`}
          </Text>
        </View>
        <Pressable onPress={fetchOffboardings} style={styles.iconBtn}>
          <RefreshCw size={16} color={C.textMuted} />
        </Pressable>
      </View>

      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <>
            {/* Stats */}
            <View style={styles.statsRow}>
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
                <View
                  key={label}
                  style={[
                    styles.statCard,
                    { backgroundColor: bg, borderColor: color + "33" },
                  ]}
                >
                  <Icon size={16} color={color} />
                  <Text style={[styles.statValue, { color: C.textPrimary }]}>
                    {value}
                  </Text>
                  <Text style={styles.statLabel}>{label}</Text>
                </View>
              ))}
            </View>

            {/* Flow banner */}
            <View
              style={[
                styles.banner,
                {
                  backgroundColor: C.primaryLight,
                  borderColor: C.primary + "22",
                },
              ]}
            >
              <AlertCircle size={15} color={C.primary} />
              <Text style={styles.bannerText}>
                <Text style={{ color: C.primary, fontWeight: "800" }}>
                  How it works:{" "}
                </Text>
                Start → HR works checklist → Complete.{" "}
                <Text style={{ color: C.danger, fontWeight: "700" }}>
                  Employee is only terminated at step 3.
                </Text>
              </Text>
            </View>

            {/* Search + Start */}
            <View style={styles.searchBar}>
              <View style={styles.searchWrap}>
                <Search size={14} color={C.textMuted} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search name or code…"
                  placeholderTextColor={C.textMuted}
                  style={styles.searchInput}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery("")}>
                    <X size={14} color={C.textMuted} />
                  </Pressable>
                )}
              </View>
              <Pressable
                onPress={() => setNewModal(true)}
                style={styles.startBtn}
              >
                <Plus size={13} color="#fff" />
                <Text style={styles.startBtnText}>Start</Text>
              </Pressable>
            </View>

            {/* Filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterBar}
            >
              {[
                { val: "all", label: "All" },
                { val: "offboarding", label: "In Progress" },
                { val: "terminated", label: "Terminated" },
                { val: "resigned", label: "Resigned" },
                { val: "retired", label: "Retired" },
              ].map(({ val, label }) => (
                <Pressable
                  key={val}
                  onPress={() => setFilterStatus(val)}
                  style={[
                    styles.filterChip,
                    filterStatus === val && styles.filterChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterStatus === val && styles.filterChipTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <LogOut size={48} color={C.textMuted} />
              <Text style={styles.emptyTitle}>No offboarding cases</Text>
              <Text style={styles.emptyDesc}>
                Tap “Start Offboarding” to begin a new case.
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
          />
        }
      />

      {loading && offboardings.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      )}

      {/* ═══════════════════════════════════════════
          CHECKLIST MODAL  (Step 2)
          ═══════════════════════════════════════════ */}
      <Modal
        visible={!!selected}
        animationType="slide"
        onRequestClose={() => {
          setSelected(null);
          setTaskData(null);
        }}
      >
        <View style={[styles.modalScreen, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Pressable
              onPress={() => {
                setSelected(null);
                setTaskData(null);
              }}
              style={styles.modalHeaderBack}
            >
              <ChevronLeft size={20} color={C.textSecondary} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalHeaderTitle}>
                {selected?.first_name} {selected?.last_name}
              </Text>
              <Text style={styles.modalHeaderSubtitle}>
                {selected?.job_role_name} · {selected?.department_name}
              </Text>
            </View>
          </View>

          {taskData?.progress && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Checklist Progress</Text>
                <Text
                  style={[
                    styles.progressPct,
                    { color: allTasksDone ? C.success : C.warning },
                  ]}
                >
                  {taskData.progress.completed}/{taskData.progress.total} ·{" "}
                  {taskData.progress.percent}%
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${taskData.progress.percent}%`,
                      backgroundColor: allTasksDone ? C.success : C.warning,
                    },
                  ]}
                />
              </View>
              {selected?.termination_date && (
                <View style={styles.dateRow}>
                  <Calendar size={10} color={C.textMuted} />
                  <Text style={styles.dateText}>
                    Exit date:{" "}
                    <Text style={styles.dateTextBold}>
                      {new Date(selected.termination_date).toLocaleDateString(
                        "en-NG",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </Text>
                  </Text>
                </View>
              )}
            </View>
          )}

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.taskList}
          >
            {taskLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <View key={i} style={styles.skeletonRow} />
              ))
            ) : !taskData?.tasks?.length ? (
              <View style={styles.emptyState}>
                <ClipboardCheck size={32} color={C.textMuted} />
                <Text style={[styles.emptyDesc, { marginTop: 8 }]}>
                  No tasks found.
                </Text>
              </View>
            ) : (
              taskData.tasks.map((task) => {
                const done = task.status === "completed";
                const saving = checklistSaving === task.id;
                return (
                  <Pressable
                    key={task.id}
                    onPress={() => !saving && toggleTask(task.id)}
                    style={[
                      styles.taskRow,
                      {
                        backgroundColor: done ? C.successLight : C.surfaceAlt,
                        borderColor: done ? C.success + "44" : C.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: done ? C.success : C.surface,
                          borderColor: done ? C.success : C.border,
                        },
                      ]}
                    >
                      {saving ? (
                        <ActivityIndicator
                          size="small"
                          color={done ? "#fff" : C.textMuted}
                        />
                      ) : done ? (
                        <Check size={11} color="#fff" />
                      ) : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.taskText,
                          {
                            color: done ? C.success : C.textPrimary,
                            textDecorationLine: done ? "line-through" : "none",
                          },
                        ]}
                      >
                        {task.task ?? task.label}
                      </Text>
                      {task.assignee && (
                        <Text style={styles.taskAssignee}>
                          Assignee: {task.assignee}
                        </Text>
                      )}
                    </View>
                    {done && <CheckCircle2 size={14} color={C.success} />}
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          {selected?.employment_status === "offboarding" && (
            <View style={styles.modalFooter}>
              {!allTasksDone && taskData?.progress && (
                <View
                  style={[
                    styles.warningBox,
                    {
                      backgroundColor: C.warningLight,
                      borderColor: C.warning + "33",
                    },
                  ]}
                >
                  <AlertTriangle size={13} color={C.warning} />
                  <Text style={styles.warningText}>
                    {taskData.progress.total - taskData.progress.completed}{" "}
                    task(s) pending. Complete all before terminating, or use
                    Force Complete.
                  </Text>
                </View>
              )}

              <Pressable
                onPress={() => handleComplete(false)}
                disabled={completing || !allTasksDone}
                style={[
                  styles.completeBtn,
                  {
                    backgroundColor: allTasksDone ? C.success : C.border,
                    opacity: !allTasksDone || completing ? 0.6 : 1,
                  },
                ]}
              >
                {completing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <CheckCircle2 size={14} color="#fff" />
                    <Text style={styles.completeBtnText}>
                      Complete Offboarding & Terminate
                    </Text>
                  </>
                )}
              </Pressable>

              {!allTasksDone && taskData?.progress && (
                <Pressable
                  onPress={() => handleComplete(true)}
                  disabled={completing}
                  style={[
                    styles.forceBtn,
                    {
                      backgroundColor: C.dangerLight,
                      borderColor: C.danger + "33",
                    },
                  ]}
                >
                  <Text style={[styles.forceBtnText, { color: C.danger }]}>
                    Force Complete (skip remaining)
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </Modal>

      {/* ═══════════════════════════════════════════
          START MODAL  (Step 1)
          ═══════════════════════════════════════════ */}
      <Modal
        visible={newModal}
        animationType="slide"
        onRequestClose={() => !creating && setNewModal(false)}
      >
        <View style={[styles.modalScreen, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Pressable
              onPress={() => !creating && setNewModal(false)}
              style={styles.modalHeaderBack}
            >
              <ChevronLeft size={20} color={C.textSecondary} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalHeaderTitle}>Initiate Offboarding</Text>
            </View>
          </View>

          {createOk ? (
            <View style={styles.successCenter}>
              <View
                style={[styles.successIcon, { backgroundColor: C.success }]}
              >
                <CheckCircle2 size={32} color="#fff" />
              </View>
              <Text style={styles.successTitle}>Offboarding Initiated</Text>
              <Text style={styles.successDesc}>
                Checklist created. The employee is{" "}
                <Text style={{ color: C.danger, fontWeight: "700" }}>
                  not yet terminated
                </Text>{" "}
                — complete the checklist to finalise.
              </Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.formContent}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={[
                  styles.warningBox,
                  {
                    backgroundColor: C.warningLight,
                    borderColor: C.warning + "33",
                  },
                ]}
              >
                <AlertTriangle size={14} color={C.warning} />
                <Text style={styles.warningText}>
                  This starts the formal exit process. The employee will{" "}
                  <Text style={{ fontWeight: "700" }}>not be terminated</Text>{" "}
                  until all tasks are completed.
                </Text>
              </View>

              {/* Department */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>
                  Department <Text style={{ color: C.danger }}>*</Text>
                </Text>
                <Pressable
                  onPress={() => setShowDeptSelect(true)}
                  style={[
                    styles.selectField,
                    { borderColor: selectedDept ? C.primary + "66" : C.border },
                  ]}
                >
                  <Text
                    style={
                      selectedDept
                        ? styles.selectValue
                        : styles.selectPlaceholder
                    }
                  >
                    {selectedDept
                      ? (departments.find((d) => d.id === selectedDept)?.name ??
                        "Select department…")
                      : "Select department…"}
                  </Text>
                  <ChevronRight size={14} color={C.textMuted} />
                </Pressable>
              </View>

              <SelectModal
                visible={showDeptSelect}
                title="Select Department"
                options={departments.map((d) => ({
                  label: d.name,
                  value: d.id,
                }))}
                value={selectedDept}
                onSelect={(v) => {
                  setSelectedDept(v);
                  setSelectedEmployeeId("");
                }}
                onClose={() => setShowDeptSelect(false)}
              />

              {/* Employee */}
              {selectedDept && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>
                    Employee <Text style={{ color: C.danger }}>*</Text>
                  </Text>
                  {empLoading ? (
                    <View
                      style={[styles.selectField, { justifyContent: "center" }]}
                    >
                      <ActivityIndicator size="small" color={C.primary} />
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => setShowEmpSelect(true)}
                      style={[
                        styles.selectField,
                        {
                          borderColor: selectedEmployeeId
                            ? C.primary + "66"
                            : C.border,
                        },
                      ]}
                    >
                      <Text
                        style={
                          selectedEmployeeId
                            ? styles.selectValue
                            : styles.selectPlaceholder
                        }
                      >
                        {selectedEmployeeLabel
                          ? `${selectedEmployeeLabel.first_name} ${selectedEmployeeLabel.last_name} — ${selectedEmployeeLabel.job_role_name ?? "Employee"}`
                          : "Select employee…"}
                      </Text>
                      <ChevronRight size={14} color={C.textMuted} />
                    </Pressable>
                  )}
                </View>
              )}

              <SelectModal
                visible={showEmpSelect}
                title="Select Employee"
                options={employeesList.map((e) => ({
                  label: `${e.first_name} ${e.last_name} — ${e.job_role_name ?? "Employee"}`,
                  value: e.id,
                }))}
                value={selectedEmployeeId}
                onSelect={setSelectedEmployeeId}
                onClose={() => setShowEmpSelect(false)}
              />

              {/* Exit Type & Date */}
              <View style={styles.row}>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>
                    Exit Type <Text style={{ color: C.danger }}>*</Text>
                  </Text>
                  <Pressable
                    onPress={() => setShowExitTypeSelect(true)}
                    style={[styles.selectField, { borderColor: C.border }]}
                  >
                    <Text style={styles.selectValue}>
                      {newForm.exitType === "terminated"
                        ? "Termination"
                        : newForm.exitType === "resigned"
                          ? "Resignation"
                          : "Retirement"}
                    </Text>
                    <ChevronRight size={14} color={C.textMuted} />
                  </Pressable>
                </View>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>
                    Exit Date <Text style={{ color: C.danger }}>*</Text>
                  </Text>
                  <TextInput
                    value={newForm.terminationDate}
                    onChangeText={(t) =>
                      setNewForm((p) => ({ ...p, terminationDate: t }))
                    }
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={C.textMuted}
                    style={[
                      styles.input,
                      {
                        borderColor: newForm.terminationDate
                          ? C.primary + "66"
                          : C.border,
                      },
                    ]}
                  />
                </View>
              </View>

              <SelectModal
                visible={showExitTypeSelect}
                title="Exit Type"
                options={[
                  { label: "Termination", value: "terminated" },
                  { label: "Resignation", value: "resigned" },
                  { label: "Retirement", value: "retired" },
                ]}
                value={newForm.exitType}
                onSelect={(v) => setNewForm((p) => ({ ...p, exitType: v }))}
                onClose={() => setShowExitTypeSelect(false)}
              />

              {/* Reason */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Reason / Notes</Text>
                <TextInput
                  value={newForm.terminationReason}
                  onChangeText={(t) =>
                    setNewForm((p) => ({ ...p, terminationReason: t }))
                  }
                  placeholder="Briefly describe the reason for exit…"
                  placeholderTextColor={C.textMuted}
                  multiline
                  numberOfLines={3}
                  style={[styles.input, styles.textarea]}
                />
              </View>

              {/* Actions */}
              <View style={styles.formActions}>
                <Pressable
                  onPress={() => setNewModal(false)}
                  style={[
                    styles.cancelBtn,
                    { backgroundColor: C.surfaceAlt, borderColor: C.border },
                  ]}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleStartOffboarding}
                  disabled={
                    creating || !selectedEmployeeId || !newForm.terminationDate
                  }
                  style={[
                    styles.submitBtn,
                    {
                      opacity:
                        creating ||
                        !selectedEmployeeId ||
                        !newForm.terminationDate
                          ? 0.6
                          : 1,
                    },
                  ]}
                >
                  {creating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Start Offboarding</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Toast */}
      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </KeyboardAvoidingView>
  );
}

/* ─── Styles ────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.bg,
  },
  headerBack: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  headerTitle: { fontSize: 17, fontWeight: "800", color: C.textPrimary },
  headerSubtitle: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 11, color: C.textMuted, fontWeight: "600" },

  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  bannerText: { flex: 1, fontSize: 12, color: C.textSecondary, lineHeight: 18 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.textPrimary,
    paddingVertical: 0,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.danger,
  },
  startBtnText: { fontSize: 13, fontWeight: "800", color: "#fff" },

  filterBar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 4,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterChipActive: {
    backgroundColor: C.primaryLight,
    borderColor: C.primary + "44",
  },
  filterChipText: { fontSize: 12, color: C.textSecondary },
  filterChipTextActive: { color: C.primary, fontWeight: "700" },

  listContent: { paddingBottom: 24 },
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  cardTop: { padding: 14, gap: 12 },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
  },
  avatarText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  cardName: { fontSize: 15, fontWeight: "700", color: C.textPrimary, flex: 1 },
  cardMeta: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  dateText: { fontSize: 11, color: C.textMuted },
  dateTextBold: { fontWeight: "700", color: C.textPrimary },

  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  progressCol: { gap: 2 },
  pctText: { fontSize: 18, fontWeight: "800" },
  taskText: { fontSize: 10, color: C.textMuted },
  progressTrack: {
    width: 80,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    marginTop: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 2 },
  manageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: C.primaryLight,
  },
  manageBtnText: { fontSize: 12, fontWeight: "700", color: C.primary },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: "700" },

  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: C.textPrimary },
  emptyDesc: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: "center",
    paddingHorizontal: 32,
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg + "cc",
  },
  skeletonRow: {
    height: 48,
    borderRadius: 12,
    backgroundColor: C.surfaceAlt,
    marginBottom: 8,
  },

  modalScreen: { flex: 1, backgroundColor: C.bg },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.bg,
  },
  modalHeaderBack: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  modalHeaderTitle: { fontSize: 17, fontWeight: "800", color: C.textPrimary },
  modalHeaderSubtitle: { fontSize: 12, color: C.textMuted, marginTop: 2 },

  progressSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 8,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressTitle: { fontSize: 13, fontWeight: "800", color: C.textPrimary },
  progressPct: { fontSize: 13, fontWeight: "800" },

  taskList: { padding: 16, gap: 8, paddingBottom: 24 },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  taskText: { fontSize: 13, fontWeight: "600" },
  taskAssignee: { fontSize: 10, color: C.textMuted, marginTop: 2 },

  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: 10,
    backgroundColor: C.bg,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: C.textSecondary,
    lineHeight: 18,
  },

  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
  },
  completeBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },
  forceBtn: {
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  forceBtnText: { fontSize: 12, fontWeight: "700" },

  formContent: { padding: 16, gap: 14, paddingBottom: 32 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: C.textPrimary },
  selectField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  selectValue: { fontSize: 14, color: C.textPrimary },
  selectPlaceholder: { fontSize: 14, color: C.textMuted },
  input: {
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    fontSize: 14,
    color: C.textPrimary,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  textarea: { height: 80, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 12 },

  formActions: { flexDirection: "row", gap: 12, marginTop: 6 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  cancelBtnText: { fontSize: 14, fontWeight: "700", color: C.textSecondary },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.danger,
  },
  submitBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },

  successCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  successTitle: { fontSize: 20, fontWeight: "800", color: C.textPrimary },
  successDesc: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },

  toast: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: C.navy,
    zIndex: 100,
  },
  toastText: { flex: 1, fontSize: 13, fontWeight: "600", color: "#fff" },
});

const selectStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: "800", color: C.textPrimary },
  closeBtn: { padding: 4 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  optionActive: { backgroundColor: C.primaryLight },
  optionText: { fontSize: 14, color: C.textPrimary },
  optionTextActive: { color: C.primary, fontWeight: "700" },
});