// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Modal,
//   TextInput,
//   StyleSheet,
//   ActivityIndicator,
// } from "react-native";
// import {
//   Target,
//   Plus,
//   RefreshCw,
//   Edit2,
//   BarChart2,
//   ChevronDown,
//   X,
//   AlertCircle,
//   Calendar,
// } from "lucide-react-native";
// import C from "../../../styles/colors";
// import {
//   listGoals,
//   createGoal,
//   updateGoal,
//   updateGoalProgress,
// } from "../../../api/service/performanceApi";
// import { getEmployees } from "../../../api/service/employeeApi";

// const STATUS_CFG: Record<string, { bg: string; color: string; label: string }> =
//   {
//     completed: { bg: "#d1fae5", color: "#059669", label: "Completed" },
//     in_progress: { bg: "#dbeafe", color: "#2563eb", label: "In Progress" },
//     not_started: { bg: "#f1f5f9", color: "#64748b", label: "Not Started" },
//     overdue: { bg: "#fee2e2", color: "#dc2626", label: "Overdue" },
//   };

// function ProgressBar({ progress = 0 }: { progress?: number }) {
//   const color =
//     progress >= 100
//       ? "#059669"
//       : progress >= 60
//         ? "#2563eb"
//         : progress >= 30
//           ? "#f59e0b"
//           : "#ef4444";
//   return (
//     <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
//       <View
//         style={{
//           flex: 1,
//           height: 6,
//           backgroundColor: "#e2e8f0",
//           borderRadius: 3,
//           overflow: "hidden",
//         }}
//       >
//         <View
//           style={{
//             width: `${Math.min(progress, 100)}%`,
//             height: "100%",
//             backgroundColor: color,
//             borderRadius: 3,
//           }}
//         />
//       </View>
//       <Text
//         style={{
//           fontSize: 12,
//           fontWeight: "700",
//           color,
//           width: 36,
//           textAlign: "right",
//         }}
//       >
//         {progress}%
//       </Text>
//     </View>
//   );
// }

// function StatusPill({ status }: { status: string }) {
//   const cfg = STATUS_CFG[status?.toLowerCase()] ?? STATUS_CFG.not_started;
//   return (
//     <View
//       style={{
//         backgroundColor: cfg.bg,
//         paddingHorizontal: 8,
//         paddingVertical: 4,
//         borderRadius: 12,
//         alignSelf: "flex-start",
//       }}
//     >
//       <Text style={{ color: cfg.color, fontSize: 10, fontWeight: "700" }}>
//         {cfg.label}
//       </Text>
//     </View>
//   );
// }

// function EmployeeSelect({ employees, value, onChange, loading }: any) {
//   const [open, setOpen] = useState(false);
//   const [q, setQ] = useState("");
//   const selected = employees.find((e: any) => e.id === value);

//   const filtered = useMemo(
//     () =>
//       employees.filter(
//         (e: any) =>
//           !q ||
//           `${e.first_name} ${e.last_name}`
//             .toLowerCase()
//             .includes(q.toLowerCase()),
//       ),
//     [employees, q],
//   );

//   return (
//     <>
//       <TouchableOpacity
//         onPress={() => setOpen(true)}
//         style={styles.selectTrigger}
//       >
//         <Text
//           style={{
//             color: selected ? C.textPrimary : C.textMuted,
//             fontSize: 14,
//           }}
//         >
//           {selected
//             ? `${selected.first_name} ${selected.last_name}`
//             : "Select employee…"}
//         </Text>
//         <ChevronDown size={14} color={C.textMuted} />
//       </TouchableOpacity>

//       <Modal
//         visible={open}
//         animationType="slide"
//         transparent
//         onRequestClose={() => setOpen(false)}
//       >
//         <View
//           style={{
//             flex: 1,
//             backgroundColor: "rgba(0,0,0,0.5)",
//             justifyContent: "flex-end",
//           }}
//         >
//           <View style={styles.modalContainer}>
//             <View
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 marginBottom: 12,
//               }}
//             >
//               <Text
//                 style={{
//                   fontSize: 16,
//                   fontWeight: "700",
//                   color: C.textPrimary,
//                 }}
//               >
//                 Select Employee
//               </Text>
//               <TouchableOpacity onPress={() => setOpen(false)}>
//                 <X size={20} color={C.textMuted} />
//               </TouchableOpacity>
//             </View>
//             <TextInput
//               value={q}
//               onChangeText={setQ}
//               placeholder="Search..."
//               placeholderTextColor={C.textMuted}
//               style={styles.searchInput}
//             />
//             <ScrollView>
//               <TouchableOpacity
//                 onPress={() => {
//                   onChange("");
//                   setOpen(false);
//                   setQ("");
//                 }}
//                 style={[
//                   styles.empRow,
//                   {
//                     backgroundColor: !value ? C.surfaceAlt : "transparent",
//                   },
//                 ]}
//               >
//                 <Text style={{ color: C.textMuted, fontSize: 13 }}>
//                   Company-wide (no specific employee)
//                 </Text>
//               </TouchableOpacity>
//               {filtered.map((e: any) => (
//                 <TouchableOpacity
//                   key={e.id}
//                   onPress={() => {
//                     onChange(e.id);
//                     setOpen(false);
//                     setQ("");
//                   }}
//                   style={[
//                     styles.empRow,
//                     {
//                       backgroundColor:
//                         value === e.id ? C.primaryLight : "transparent",
//                     },
//                   ]}
//                 >
//                   <Text
//                     style={{
//                       color: C.textPrimary,
//                       fontWeight: "600",
//                       fontSize: 13,
//                     }}
//                   >
//                     {e.first_name} {e.last_name}
//                   </Text>
//                   <Text style={{ color: C.textMuted, fontSize: 11 }}>
//                     {e.department ?? e.email}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </>
//   );
// }

// function GoalModal({
//   goal,
//   employees,
//   loadingEmployees,
//   onClose,
//   onSaved,
// }: any) {
//   const isEdit = !!goal;
//   const [form, setForm] = useState({
//     title: goal?.title ?? "",
//     description: goal?.description ?? "",
//     metric: goal?.metric ?? "",
//     target: goal?.target ?? "",
//     dueDate: goal?.due_date ? goal.due_date.slice(0, 10) : "",
//     cycle: goal?.cycle ?? "",
//     employeeId: goal?.employee_id ?? "",
//     status: goal?.status ?? "not_started",
//     progress: goal?.progress ?? 0,
//   });
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

//   const handleSubmit = async () => {
//     if (!form.title.trim()) {
//       setError("Goal title is required.");
//       return;
//     }
//     if (!form.dueDate) {
//       setError("Due date is required.");
//       return;
//     }
//     if (!form.cycle.trim()) {
//       setError("Cycle is required (e.g. 2025-Q1).");
//       return;
//     }

//     setSaving(true);
//     setError("");
//     try {
//       const payload = {
//         title: form.title.trim(),
//         description: form.description.trim() || undefined,
//         metric: form.metric.trim() || undefined,
//         target: form.target.trim() || undefined,
//         dueDate: form.dueDate,
//         cycle: form.cycle.trim(),
//         employeeId: form.employeeId || undefined,
//         status: form.status,
//         progress: Number(form.progress),
//       };
//       if (isEdit) await updateGoal(goal.id, payload);
//       else await createGoal(payload);
//       onSaved();
//     } catch (err: any) {
//       setError(
//         err?.response?.data?.message ??
//           `Failed to ${isEdit ? "update" : "create"} goal.`,
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Modal visible animationType="slide" transparent onRequestClose={onClose}>
//       <View
//         style={{
//           flex: 1,
//           backgroundColor: "rgba(0,0,0,0.5)",
//           justifyContent: "flex-end",
//         }}
//       >
//         <View style={[styles.modalContainer, { maxHeight: "90%" }]}>
//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "space-between",
//               alignItems: "center",
//               marginBottom: 12,
//             }}
//           >
//             <Text
//               style={{
//                 fontSize: 16,
//                 fontWeight: "700",
//                 color: C.textPrimary,
//               }}
//             >
//               {isEdit ? "Edit Goal" : "Create New Goal"}
//             </Text>
//             <TouchableOpacity onPress={onClose}>
//               <X size={20} color={C.textMuted} />
//             </TouchableOpacity>
//           </View>

//           <ScrollView showsVerticalScrollIndicator={false}>
//             {error ? (
//               <View
//                 style={{
//                   backgroundColor: "#fee2e2",
//                   padding: 10,
//                   borderRadius: 12,
//                   marginBottom: 12,
//                 }}
//               >
//                 <Text style={{ color: "#dc2626", fontSize: 12 }}>{error}</Text>
//               </View>
//             ) : null}

//             <Text style={styles.label}>
//               Goal Title <Text style={{ color: "#ef4444" }}>*</Text>
//             </Text>
//             <TextInput
//               value={form.title}
//               onChangeText={(t) => set("title", t)}
//               placeholder="e.g. Increase customer satisfaction"
//               placeholderTextColor={C.textMuted}
//               style={styles.input}
//             />

//             <Text style={styles.label}>Description</Text>
//             <TextInput
//               value={form.description}
//               onChangeText={(t) => set("description", t)}
//               placeholder="Optional detail..."
//               multiline
//               numberOfLines={2}
//               placeholderTextColor={C.textMuted}
//               style={[styles.input, { height: 60, textAlignVertical: "top" }]}
//             />

//             <View style={{ flexDirection: "row", gap: 10 }}>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.label}>Metric</Text>
//                 <TextInput
//                   value={form.metric}
//                   onChangeText={(t) => set("metric", t)}
//                   placeholder="e.g. NPS score"
//                   placeholderTextColor={C.textMuted}
//                   style={styles.input}
//                 />
//               </View>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.label}>Target</Text>
//                 <TextInput
//                   value={form.target}
//                   onChangeText={(t) => set("target", t)}
//                   placeholder="e.g. 4.5"
//                   placeholderTextColor={C.textMuted}
//                   style={styles.input}
//                 />
//               </View>
//             </View>

//             <View style={{ flexDirection: "row", gap: 10 }}>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.label}>
//                   Cycle <Text style={{ color: "#ef4444" }}>*</Text>
//                 </Text>
//                 <TextInput
//                   value={form.cycle}
//                   onChangeText={(t) => set("cycle", t)}
//                   placeholder="e.g. 2025-Q1"
//                   placeholderTextColor={C.textMuted}
//                   style={styles.input}
//                 />
//               </View>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.label}>
//                   Due Date <Text style={{ color: "#ef4444" }}>*</Text>
//                 </Text>
//                 <TextInput
//                   value={form.dueDate}
//                   onChangeText={(t) => set("dueDate", t)}
//                   placeholder="YYYY-MM-DD"
//                   placeholderTextColor={C.textMuted}
//                   style={styles.input}
//                 />
//               </View>
//             </View>

//             <Text style={styles.label}>Assign To</Text>
//             <EmployeeSelect
//               employees={employees}
//               value={form.employeeId}
//               onChange={(v: string) => set("employeeId", v)}
//               loading={loadingEmployees}
//             />

//             {isEdit && (
//               <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.label}>Status</Text>
//                   <View style={styles.input}>
//                     <Text style={{ color: C.textPrimary }}>
//                       {STATUS_CFG[form.status]?.label ?? form.status}
//                     </Text>
//                   </View>
//                 </View>
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.label}>Progress ({form.progress}%)</Text>
//                   <View
//                     style={{
//                       flexDirection: "row",
//                       alignItems: "center",
//                       gap: 8,
//                     }}
//                   >
//                     <View
//                       style={{
//                         flex: 1,
//                         height: 6,
//                         backgroundColor: "#e2e8f0",
//                         borderRadius: 3,
//                       }}
//                     >
//                       <View
//                         style={{
//                           width: `${form.progress}%`,
//                           height: "100%",
//                           backgroundColor: C.primary,
//                           borderRadius: 3,
//                         }}
//                       />
//                     </View>
//                     <TextInput
//                       value={String(form.progress)}
//                       onChangeText={(t) => set("progress", Number(t) || 0)}
//                       keyboardType="numeric"
//                       style={[styles.input, { width: 50, textAlign: "center" }]}
//                     />
//                   </View>
//                 </View>
//               </View>
//             )}
//             <View style={{ height: 20 }} />
//           </ScrollView>

//           <View
//             style={{
//               flexDirection: "row",
//               gap: 12,
//               paddingTop: 12,
//               borderTopWidth: 1,
//               borderTopColor: C.border,
//             }}
//           >
//             <TouchableOpacity
//               onPress={onClose}
//               style={{
//                 flex: 1,
//                 padding: 12,
//                 borderRadius: 12,
//                 backgroundColor: C.surfaceAlt,
//                 alignItems: "center",
//               }}
//             >
//               <Text style={{ color: C.textSecondary, fontWeight: "600" }}>
//                 Cancel
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={handleSubmit}
//               disabled={saving}
//               style={{
//                 flex: 1,
//                 padding: 12,
//                 borderRadius: 12,
//                 backgroundColor: C.primary,
//                 alignItems: "center",
//                 opacity: saving ? 0.7 : 1,
//               }}
//             >
//               <Text style={{ color: "#fff", fontWeight: "600" }}>
//                 {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Goal"}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// function ProgressModal({ goal, onClose, onSaved }: any) {
//   const [progress, setProgress] = useState(goal.progress ?? 0);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   const handleSave = async () => {
//     setSaving(true);
//     setError("");
//     try {
//       await updateGoalProgress(goal.id, progress);
//       onSaved();
//     } catch (err: any) {
//       setError(err?.response?.data?.message ?? "Failed to update progress.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Modal visible animationType="slide" transparent onRequestClose={onClose}>
//       <View
//         style={{
//           flex: 1,
//           backgroundColor: "rgba(0,0,0,0.5)",
//           justifyContent: "center",
//           padding: 16,
//         }}
//       >
//         <View style={[styles.modalContainer, { maxHeight: 400 }]}>
//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "space-between",
//               alignItems: "center",
//               marginBottom: 12,
//             }}
//           >
//             <Text
//               style={{
//                 fontSize: 16,
//                 fontWeight: "700",
//                 color: C.textPrimary,
//               }}
//             >
//               Update Progress
//             </Text>
//             <TouchableOpacity onPress={onClose}>
//               <X size={20} color={C.textMuted} />
//             </TouchableOpacity>
//           </View>

//           <Text
//             style={{
//               fontSize: 14,
//               fontWeight: "600",
//               color: C.textPrimary,
//               marginBottom: 12,
//             }}
//           >
//             {goal.title}
//           </Text>

//           <View style={{ alignItems: "center", marginVertical: 16 }}>
//             <Text
//               style={{
//                 fontSize: 32,
//                 fontWeight: "800",
//                 color: C.primary,
//               }}
//             >
//               {progress}%
//             </Text>
//           </View>

//           <View
//             style={{
//               height: 8,
//               backgroundColor: "#e2e8f0",
//               borderRadius: 4,
//               marginBottom: 16,
//             }}
//           >
//             <View
//               style={{
//                 width: `${progress}%`,
//                 height: "100%",
//                 backgroundColor: C.primary,
//                 borderRadius: 4,
//               }}
//             />
//           </View>

//           <TextInput
//             value={String(progress)}
//             onChangeText={(t) => setProgress(Math.min(100, Number(t) || 0))}
//             keyboardType="numeric"
//             style={[styles.input, { textAlign: "center", fontSize: 18 }]}
//           />

//           {error ? (
//             <Text
//               style={{
//                 color: "#dc2626",
//                 fontSize: 12,
//                 marginTop: 8,
//               }}
//             >
//               {error}
//             </Text>
//           ) : null}

//           <View
//             style={{
//               flexDirection: "row",
//               gap: 12,
//               marginTop: 16,
//             }}
//           >
//             <TouchableOpacity
//               onPress={onClose}
//               style={{
//                 flex: 1,
//                 padding: 12,
//                 borderRadius: 12,
//                 backgroundColor: C.surfaceAlt,
//                 alignItems: "center",
//                 borderWidth: 1,
//                 borderColor: C.border,
//               }}
//             >
//               <Text
//                 style={{
//                   color: C.textSecondary,
//                   fontWeight: "600",
//                 }}
//               >
//                 Cancel
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={handleSave}
//               disabled={saving}
//               style={{
//                 flex: 1,
//                 padding: 12,
//                 borderRadius: 12,
//                 backgroundColor: C.primary,
//                 alignItems: "center",
//                 opacity: saving ? 0.7 : 1,
//               }}
//             >
//               <Text style={{ color: "#fff", fontWeight: "600" }}>
//                 {saving ? "Saving…" : "Update"}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// export default function GoalsManagementView({
//   searchQuery,
// }: {
//   searchQuery: string;
// }) {
//   const [goals, setGoals] = useState<any[]>([]);
//   const [employees, setEmployees] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingEmployees, setLoadingEmployees] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [statusFilter, setStatusFilter] = useState("");
//   const [modal, setModal] = useState<null | "create" | "edit" | "progress">(
//     null,
//   );
//   const [selected, setSelected] = useState<any>(null);

//   const loadGoals = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await listGoals({ limit: 200 });
//       const list = res?.goals ?? res?.data ?? (Array.isArray(res) ? res : []);
//       setGoals(list);
//     } catch {
//       setError("Failed to load goals. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const loadEmployees = useCallback(async () => {
//     setLoadingEmployees(true);
//     try {
//       const res = await getEmployees({ limit: 500 });
//       const list =
//         res?.employees ?? res?.data ?? (Array.isArray(res) ? res : []);
//       setEmployees(list);
//     } catch {
//       /* non-fatal */
//     } finally {
//       setLoadingEmployees(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadGoals();
//     loadEmployees();
//   }, []);

//   const processed = useMemo(() => {
//     const q = (searchQuery ?? "").toLowerCase();
//     let list = goals.filter((g: any) => {
//       const name =
//         `${g.employee_first_name ?? ""} ${g.employee_last_name ?? ""}`.toLowerCase();
//       const matchQ =
//         !q ||
//         name.includes(q) ||
//         g.title?.toLowerCase().includes(q) ||
//         g.cycle?.toLowerCase().includes(q);
//       const matchS = !statusFilter || g.status?.toLowerCase() === statusFilter;
//       return matchQ && matchS;
//     });
//     return list;
//   }, [goals, searchQuery, statusFilter]);

//   const stats = useMemo(
//     () => ({
//       total: goals.length,
//       completed: goals.filter((g: any) => g.status === "completed").length,
//       in_progress: goals.filter((g: any) => g.status === "in_progress").length,
//       overdue: goals.filter(
//         (g: any) =>
//           g.status === "overdue" ||
//           (g.due_date &&
//             new Date(g.due_date) < new Date() &&
//             g.status !== "completed"),
//       ).length,
//     }),
//     [goals],
//   );

//   const handleSaved = () => {
//     setModal(null);
//     setSelected(null);
//     loadGoals();
//   };

//   const filters = [
//     { key: "", label: "All", count: stats.total },
//     {
//       key: "in_progress",
//       label: "In Progress",
//       count: stats.in_progress,
//     },
//     { key: "completed", label: "Completed", count: stats.completed },
//     { key: "overdue", label: "Overdue", count: stats.overdue },
//   ];

//   return (
//     <View>
//       {/* Header */}
//       <View
//         style={{
//           flexDirection: "row",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: 12,
//         }}
//       >
//         <View>
//           <Text
//             style={{
//               fontSize: 16,
//               fontWeight: "700",
//               color: C.textPrimary,
//             }}
//           >
//             Goals & KPIs
//           </Text>
//           <Text
//             style={{
//               fontSize: 11,
//               color: C.textMuted,
//               marginTop: 2,
//             }}
//           >
//             {stats.total} total · {stats.in_progress} in progress ·{" "}
//             {stats.completed} completed
//             {stats.overdue > 0 && (
//               <Text style={{ color: "#dc2626" }}>
//                 {" "}
//                 · {stats.overdue} overdue
//               </Text>
//             )}
//           </Text>
//         </View>
//         <View style={{ flexDirection: "row", gap: 8 }}>
//           <TouchableOpacity onPress={loadGoals} style={styles.iconBtn}>
//             <RefreshCw size={14} color={C.textSecondary} />
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={() => {
//               setSelected(null);
//               setModal("create");
//             }}
//             style={[styles.iconBtn, { backgroundColor: C.primary }]}
//           >
//             <Plus size={14} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Filters */}
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={{ gap: 8, marginBottom: 12 }}
//       >
//         {filters.map((f) => (
//           <TouchableOpacity
//             key={f.key}
//             onPress={() => setStatusFilter(f.key)}
//             style={{
//               paddingHorizontal: 12,
//               paddingVertical: 6,
//               borderRadius: 20,
//               backgroundColor: statusFilter === f.key ? C.primary : C.surface,
//               borderWidth: 1,
//               borderColor: statusFilter === f.key ? C.primary : C.border,
//             }}
//           >
//             <Text
//               style={{
//                 fontSize: 11,
//                 fontWeight: "700",
//                 color: statusFilter === f.key ? "#fff" : C.textSecondary,
//               }}
//             >
//               {f.label} ({f.count})
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       {error && (
//         <View
//           style={{
//             backgroundColor: "#fee2e2",
//             padding: 12,
//             borderRadius: 12,
//             marginBottom: 12,
//             flexDirection: "row",
//             alignItems: "center",
//             gap: 8,
//           }}
//         >
//           <AlertCircle size={16} color="#dc2626" />
//           <Text
//             style={{
//               color: "#dc2626",
//               fontSize: 13,
//               flex: 1,
//             }}
//           >
//             {error}
//           </Text>
//           <TouchableOpacity onPress={loadGoals}>
//             <Text
//               style={{
//                 color: "#dc2626",
//                 fontWeight: "700",
//                 fontSize: 12,
//               }}
//             >
//               Retry
//             </Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* List */}
//       {loading ? (
//         <ActivityIndicator color={C.primary} style={{ marginTop: 24 }} />
//       ) : processed.length === 0 ? (
//         <View
//           style={{
//             alignItems: "center",
//             padding: 40,
//             gap: 12,
//           }}
//         >
//           <Target size={32} color={C.textMuted} />
//           <Text style={{ color: C.textPrimary, fontWeight: "600" }}>
//             No goals found
//           </Text>
//           <TouchableOpacity
//             onPress={() => setModal("create")}
//             style={{
//               backgroundColor: C.primary,
//               paddingHorizontal: 16,
//               paddingVertical: 8,
//               borderRadius: 12,
//             }}
//           >
//             <Text style={{ color: "#fff", fontWeight: "600" }}>
//               Create First Goal
//             </Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <View style={{ gap: 10 }}>
//           {processed.map((goal: any) => {
//             const dueDate = goal.due_date ? new Date(goal.due_date) : null;
//             const isOverdue =
//               dueDate && dueDate < new Date() && goal.status !== "completed";
//             return (
//               <View
//                 key={goal.id}
//                 style={{
//                   backgroundColor: C.surface,
//                   borderRadius: 16,
//                   padding: 14,
//                   borderWidth: 1,
//                   borderColor: C.border,
//                 }}
//               >
//                 <View
//                   style={{
//                     flexDirection: "row",
//                     justifyContent: "space-between",
//                     alignItems: "flex-start",
//                     marginBottom: 8,
//                   }}
//                 >
//                   <View style={{ flex: 1 }}>
//                     <Text
//                       style={{
//                         fontSize: 14,
//                         fontWeight: "700",
//                         color: C.textPrimary,
//                       }}
//                     >
//                       {goal.title}
//                     </Text>
//                     {goal.metric && (
//                       <Text
//                         style={{
//                           fontSize: 11,
//                           color: C.textMuted,
//                           marginTop: 2,
//                         }}
//                       >
//                         Metric: {goal.metric}
//                         {goal.target ? ` · Target: ${goal.target}` : ""}
//                       </Text>
//                     )}
//                     {goal.cycle && (
//                       <View
//                         style={{
//                           backgroundColor: C.primaryLight,
//                           paddingHorizontal: 6,
//                           paddingVertical: 2,
//                           borderRadius: 6,
//                           alignSelf: "flex-start",
//                           marginTop: 4,
//                         }}
//                       >
//                         <Text
//                           style={{
//                             color: C.primary,
//                             fontSize: 9,
//                             fontWeight: "700",
//                           }}
//                         >
//                           {goal.cycle}
//                         </Text>
//                       </View>
//                     )}
//                   </View>
//                   <StatusPill status={isOverdue ? "overdue" : goal.status} />
//                 </View>

//                 <ProgressBar progress={goal.progress ?? 0} />

//                 <View
//                   style={{
//                     flexDirection: "row",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     marginTop: 10,
//                   }}
//                 >
//                   <View>
//                     {goal.employee_first_name ? (
//                       <Text
//                         style={{
//                           fontSize: 11,
//                           color: C.textSecondary,
//                         }}
//                       >
//                         {goal.employee_first_name} {goal.employee_last_name} ·{" "}
//                         {goal.department_name ?? ""}
//                       </Text>
//                     ) : (
//                       <Text
//                         style={{
//                           fontSize: 11,
//                           color: C.textMuted,
//                         }}
//                       >
//                         Company-wide
//                       </Text>
//                     )}
//                     {dueDate && (
//                       <Text
//                         style={{
//                           fontSize: 11,
//                           color: isOverdue ? "#dc2626" : C.textMuted,
//                           marginTop: 2,
//                         }}
//                       >
//                         Due: {dueDate.toLocaleDateString("en-GB")}
//                       </Text>
//                     )}
//                   </View>
//                   <View style={{ flexDirection: "row", gap: 6 }}>
//                     <TouchableOpacity
//                       onPress={() => {
//                         setSelected(goal);
//                         setModal("progress");
//                       }}
//                       style={[
//                         styles.actionBtn,
//                         {
//                           backgroundColor: C.primaryLight,
//                         },
//                       ]}
//                     >
//                       <BarChart2 size={13} color={C.primary} />
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       onPress={() => {
//                         setSelected(goal);
//                         setModal("edit");
//                       }}
//                       style={[
//                         styles.actionBtn,
//                         {
//                           backgroundColor: C.surfaceAlt,
//                         },
//                       ]}
//                     >
//                       <Edit2 size={13} color={C.textSecondary} />
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               </View>
//             );
//           })}
//         </View>
//       )}

//       {/* Modals */}
//       {(modal === "create" || modal === "edit") && (
//         <GoalModal
//           goal={modal === "edit" ? selected : null}
//           employees={employees}
//           loadingEmployees={loadingEmployees}
//           onClose={() => {
//             setModal(null);
//             setSelected(null);
//           }}
//           onSaved={handleSaved}
//         />
//       )}
//       {modal === "progress" && selected && (
//         <ProgressModal
//           goal={selected}
//           onClose={() => {
//             setModal(null);
//             setSelected(null);
//           }}
//           onSaved={handleSaved}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   selectTrigger: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: 12,
//     borderRadius: 12,
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1.5,
//     borderColor: C.border,
//   },
//   modalContainer: {
//     backgroundColor: C.surface,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 16,
//     maxHeight: "80%",
//   },
//   searchInput: {
//     backgroundColor: C.surfaceAlt,
//     padding: 10,
//     borderRadius: 12,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: C.border,
//     color: C.textPrimary,
//   },
//   empRow: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: C.border,
//   },
//   label: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: C.textPrimary,
//     marginBottom: 4,
//     marginTop: 10,
//   },
//   input: {
//     backgroundColor: C.surfaceAlt,
//     padding: 10,
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: C.border,
//     color: C.textPrimary,
//     fontSize: 14,
//   },
//   iconBtn: {
//     width: 32,
//     height: 32,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   actionBtn: {
//     width: 28,
//     height: 28,
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });


// src/components/admin/performance/GoalsManagementView.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  Target,
  Plus,
  RefreshCw,
  Edit2,
  BarChart2,
  ChevronDown,
  X,
  AlertCircle,
  Calendar,
} from "lucide-react-native";
import C from "../../../styles/colors";
import {
  listGoals,
  createGoal,
  updateGoal,
  updateGoalProgress,
} from "../../../api/service/performanceApi";
import { getEmployees } from "../../../api/service/employeeApi";
import { Loader } from "../../../hooks/loaderManager";

const STATUS_CFG: Record<string, { bg: string; color: string; label: string }> =
  {
    completed: { bg: "#d1fae5", color: "#059669", label: "Completed" },
    in_progress: { bg: "#dbeafe", color: "#2563eb", label: "In Progress" },
    not_started: { bg: "#f1f5f9", color: "#64748b", label: "Not Started" },
    overdue: { bg: "#fee2e2", color: "#dc2626", label: "Overdue" },
  };

function ProgressBar({ progress = 0 }: { progress?: number }) {
  const color =
    progress >= 100
      ? "#059669"
      : progress >= 60
        ? "#2563eb"
        : progress >= 30
          ? "#f59e0b"
          : "#ef4444";
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View
        style={{
          flex: 1,
          height: 6,
          backgroundColor: "#e2e8f0",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${Math.min(progress, 100)}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: 3,
          }}
        />
      </View>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color,
          width: 36,
          textAlign: "right",
        }}
      >
        {progress}%
      </Text>
    </View>
  );
}

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CFG[status?.toLowerCase()] ?? STATUS_CFG.not_started;
  return (
    <View
      style={{
        backgroundColor: cfg.bg,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color: cfg.color, fontSize: 10, fontWeight: "700" }}>
        {cfg.label}
      </Text>
    </View>
  );
}

function EmployeeSelect({ employees, value, onChange, loading }: any) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const selected = employees.find((e: any) => e.id === value);

  const filtered = useMemo(
    () =>
      employees.filter(
        (e: any) =>
          !q ||
          `${e.first_name} ${e.last_name}`
            .toLowerCase()
            .includes(q.toLowerCase()),
      ),
    [employees, q],
  );

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={styles.selectTrigger}
      >
        <Text
          style={{
            color: selected ? C.textPrimary : C.textMuted,
            fontSize: 14,
          }}
        >
          {selected
            ? `${selected.first_name} ${selected.last_name}`
            : "Select employee…"}
        </Text>
        <ChevronDown size={14} color={C.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View style={styles.modalContainer}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: C.textPrimary,
                }}
              >
                Select Employee
              </Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <X size={20} color={C.textMuted} />
              </TouchableOpacity>
            </View>
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search..."
              placeholderTextColor={C.textMuted}
              style={styles.searchInput}
            />
            <ScrollView>
              <TouchableOpacity
                onPress={() => {
                  onChange("");
                  setOpen(false);
                  setQ("");
                }}
                style={[
                  styles.empRow,
                  {
                    backgroundColor: !value ? C.surfaceAlt : "transparent",
                  },
                ]}
              >
                <Text style={{ color: C.textMuted, fontSize: 13 }}>
                  Company-wide (no specific employee)
                </Text>
              </TouchableOpacity>
              {filtered.map((e: any) => (
                <TouchableOpacity
                  key={e.id}
                  onPress={() => {
                    onChange(e.id);
                    setOpen(false);
                    setQ("");
                  }}
                  style={[
                    styles.empRow,
                    {
                      backgroundColor:
                        value === e.id ? C.primaryLight : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: C.textPrimary,
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    {e.first_name} {e.last_name}
                  </Text>
                  <Text style={{ color: C.textMuted, fontSize: 11 }}>
                    {e.department ?? e.email}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

function GoalModal({
  goal,
  employees,
  loadingEmployees,
  onClose,
  onSaved,
}: any) {
  const isEdit = !!goal;
  const [form, setForm] = useState({
    title: goal?.title ?? "",
    description: goal?.description ?? "",
    metric: goal?.metric ?? "",
    target: goal?.target ?? "",
    dueDate: goal?.due_date ? goal.due_date.slice(0, 10) : "",
    cycle: goal?.cycle ?? "",
    employeeId: goal?.employee_id ?? "",
    status: goal?.status ?? "not_started",
    progress: goal?.progress ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError("Goal title is required.");
      return;
    }
    if (!form.dueDate) {
      setError("Due date is required.");
      return;
    }
    if (!form.cycle.trim()) {
      setError("Cycle is required (e.g. 2025-Q1).");
      return;
    }

    setSaving(true);
    setError("");
    Loader.show();
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        metric: form.metric.trim() || undefined,
        target: form.target.trim() || undefined,
        dueDate: form.dueDate,
        cycle: form.cycle.trim(),
        employeeId: form.employeeId || undefined,
        status: form.status,
        progress: Number(form.progress),
      };
      if (isEdit) await updateGoal(goal.id, payload);
      else await createGoal(payload);
      onSaved();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          `Failed to ${isEdit ? "update" : "create"} goal.`,
      );
    } finally {
      setSaving(false);
      Loader.hide();
    }
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View style={[styles.modalContainer, { maxHeight: "90%" }]}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: C.textPrimary,
              }}
            >
              {isEdit ? "Edit Goal" : "Create New Goal"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={C.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {error ? (
              <View
                style={{
                  backgroundColor: "#fee2e2",
                  padding: 10,
                  borderRadius: 12,
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: "#dc2626", fontSize: 12 }}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>
              Goal Title <Text style={{ color: "#ef4444" }}>*</Text>
            </Text>
            <TextInput
              value={form.title}
              onChangeText={(t) => set("title", t)}
              placeholder="e.g. Increase customer satisfaction"
              placeholderTextColor={C.textMuted}
              style={styles.input}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              value={form.description}
              onChangeText={(t) => set("description", t)}
              placeholder="Optional detail..."
              multiline
              numberOfLines={2}
              placeholderTextColor={C.textMuted}
              style={[styles.input, { height: 60, textAlignVertical: "top" }]}
            />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Metric</Text>
                <TextInput
                  value={form.metric}
                  onChangeText={(t) => set("metric", t)}
                  placeholder="e.g. NPS score"
                  placeholderTextColor={C.textMuted}
                  style={styles.input}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Target</Text>
                <TextInput
                  value={form.target}
                  onChangeText={(t) => set("target", t)}
                  placeholder="e.g. 4.5"
                  placeholderTextColor={C.textMuted}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>
                  Cycle <Text style={{ color: "#ef4444" }}>*</Text>
                </Text>
                <TextInput
                  value={form.cycle}
                  onChangeText={(t) => set("cycle", t)}
                  placeholder="e.g. 2025-Q1"
                  placeholderTextColor={C.textMuted}
                  style={styles.input}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>
                  Due Date <Text style={{ color: "#ef4444" }}>*</Text>
                </Text>
                <TextInput
                  value={form.dueDate}
                  onChangeText={(t) => set("dueDate", t)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={C.textMuted}
                  style={styles.input}
                />
              </View>
            </View>

            <Text style={styles.label}>Assign To</Text>
            <EmployeeSelect
              employees={employees}
              value={form.employeeId}
              onChange={(v: string) => set("employeeId", v)}
              loading={loadingEmployees}
            />

            {isEdit && (
              <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.input}>
                    <Text style={{ color: C.textPrimary }}>
                      {STATUS_CFG[form.status]?.label ?? form.status}
                    </Text>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Progress ({form.progress}%)</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        height: 6,
                        backgroundColor: "#e2e8f0",
                        borderRadius: 3,
                      }}
                    >
                      <View
                        style={{
                          width: `${form.progress}%`,
                          height: "100%",
                          backgroundColor: C.primary,
                          borderRadius: 3,
                        }}
                      />
                    </View>
                    <TextInput
                      value={String(form.progress)}
                      onChangeText={(t) => set("progress", Number(t) || 0)}
                      keyboardType="numeric"
                      style={[styles.input, { width: 50, textAlign: "center" }]}
                    />
                  </View>
                </View>
              </View>
            )}
            <View style={{ height: 20 }} />
          </ScrollView>

          <View
            style={{
              flexDirection: "row",
              gap: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: C.border,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 12,
                backgroundColor: C.surfaceAlt,
                alignItems: "center",
              }}
            >
              <Text style={{ color: C.textSecondary, fontWeight: "600" }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={saving}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 12,
                backgroundColor: C.primary,
                alignItems: "center",
                opacity: saving ? 0.7 : 1,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Goal"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ProgressModal({ goal, onClose, onSaved }: any) {
  const [progress, setProgress] = useState(goal.progress ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    Loader.show();
    try {
      await updateGoalProgress(goal.id, progress);
      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to update progress.");
    } finally {
      setSaving(false);
      Loader.hide();
    }
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <View style={[styles.modalContainer, { maxHeight: 400 }]}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: C.textPrimary,
              }}
            >
              Update Progress
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={C.textMuted} />
            </TouchableOpacity>
          </View>

          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: C.textPrimary,
              marginBottom: 12,
            }}
          >
            {goal.title}
          </Text>

          <View style={{ alignItems: "center", marginVertical: 16 }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "800",
                color: C.primary,
              }}
            >
              {progress}%
            </Text>
          </View>

          <View
            style={{
              height: 8,
              backgroundColor: "#e2e8f0",
              borderRadius: 4,
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: C.primary,
                borderRadius: 4,
              }}
            />
          </View>

          <TextInput
            value={String(progress)}
            onChangeText={(t) => setProgress(Math.min(100, Number(t) || 0))}
            keyboardType="numeric"
            style={[styles.input, { textAlign: "center", fontSize: 18 }]}
          />

          {error ? (
            <Text
              style={{
                color: "#dc2626",
                fontSize: 12,
                marginTop: 8,
              }}
            >
              {error}
            </Text>
          ) : null}

          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginTop: 16,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 12,
                backgroundColor: C.surfaceAlt,
                alignItems: "center",
                borderWidth: 1,
                borderColor: C.border,
              }}
            >
              <Text
                style={{
                  color: C.textSecondary,
                  fontWeight: "600",
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 12,
                backgroundColor: C.primary,
                alignItems: "center",
                opacity: saving ? 0.7 : 1,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                {saving ? "Saving…" : "Update"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function GoalsManagementView({
  searchQuery,
}: {
  searchQuery: string;
}) {
  const [goals, setGoals] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState<null | "create" | "edit" | "progress">(
    null,
  );
  const [selected, setSelected] = useState<any>(null);

  const loadGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    Loader.show();
    try {
      const res = await listGoals({ limit: 200 });
      const list = res?.goals ?? res?.data ?? (Array.isArray(res) ? res : []);
      setGoals(list);
    } catch {
      setError("Failed to load goals. Please try again.");
    } finally {
      setLoading(false);
      Loader.hide();
    }
  }, []);

  const loadEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    Loader.show();
    try {
      const res = await getEmployees({ limit: 500 });
      const list =
        res?.employees ?? res?.data ?? (Array.isArray(res) ? res : []);
      setEmployees(list);
    } catch {
      /* non-fatal */
    } finally {
      setLoadingEmployees(false);
      Loader.hide();
    }
  }, []);

  useEffect(() => {
    loadGoals();
    loadEmployees();
  }, []);

  const processed = useMemo(() => {
    const q = (searchQuery ?? "").toLowerCase();
    let list = goals.filter((g: any) => {
      const name =
        `${g.employee_first_name ?? ""} ${g.employee_last_name ?? ""}`.toLowerCase();
      const matchQ =
        !q ||
        name.includes(q) ||
        g.title?.toLowerCase().includes(q) ||
        g.cycle?.toLowerCase().includes(q);
      const matchS = !statusFilter || g.status?.toLowerCase() === statusFilter;
      return matchQ && matchS;
    });
    return list;
  }, [goals, searchQuery, statusFilter]);

  const stats = useMemo(
    () => ({
      total: goals.length,
      completed: goals.filter((g: any) => g.status === "completed").length,
      in_progress: goals.filter((g: any) => g.status === "in_progress").length,
      overdue: goals.filter(
        (g: any) =>
          g.status === "overdue" ||
          (g.due_date &&
            new Date(g.due_date) < new Date() &&
            g.status !== "completed"),
      ).length,
    }),
    [goals],
  );

  const handleSaved = () => {
    setModal(null);
    setSelected(null);
    loadGoals();
  };

  const filters = [
    { key: "", label: "All", count: stats.total },
    {
      key: "in_progress",
      label: "In Progress",
      count: stats.in_progress,
    },
    { key: "completed", label: "Completed", count: stats.completed },
    { key: "overdue", label: "Overdue", count: stats.overdue },
  ];

  return (
    <View>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: C.textPrimary,
            }}
          >
            Goals & KPIs
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: C.textMuted,
              marginTop: 2,
            }}
          >
            {stats.total} total · {stats.in_progress} in progress ·{" "}
            {stats.completed} completed
            {stats.overdue > 0 && (
              <Text style={{ color: "#dc2626" }}>
                {" "}
                · {stats.overdue} overdue
              </Text>
            )}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity onPress={loadGoals} style={styles.iconBtn}>
            <RefreshCw size={14} color={C.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSelected(null);
              setModal("create");
            }}
            style={[styles.iconBtn, { backgroundColor: C.primary }]}
          >
            <Plus size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, marginBottom: 12 }}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setStatusFilter(f.key)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: statusFilter === f.key ? C.primary : C.surface,
              borderWidth: 1,
              borderColor: statusFilter === f.key ? C.primary : C.border,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: statusFilter === f.key ? "#fff" : C.textSecondary,
              }}
            >
              {f.label} ({f.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {error && (
        <View
          style={{
            backgroundColor: "#fee2e2",
            padding: 12,
            borderRadius: 12,
            marginBottom: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <AlertCircle size={16} color="#dc2626" />
          <Text
            style={{
              color: "#dc2626",
              fontSize: 13,
              flex: 1,
            }}
          >
            {error}
          </Text>
          <TouchableOpacity onPress={loadGoals}>
            <Text
              style={{
                color: "#dc2626",
                fontWeight: "700",
                fontSize: 12,
              }}
            >
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      {loading ? (
        <ActivityIndicator color={C.primary} style={{ marginTop: 24 }} />
      ) : processed.length === 0 ? (
        <View
          style={{
            alignItems: "center",
            padding: 40,
            gap: 12,
          }}
        >
          <Target size={32} color={C.textMuted} />
          <Text style={{ color: C.textPrimary, fontWeight: "600" }}>
            No goals found
          </Text>
          <TouchableOpacity
            onPress={() => setModal("create")}
            style={{
              backgroundColor: C.primary,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              Create First Goal
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {processed.map((goal: any) => {
            const dueDate = goal.due_date ? new Date(goal.due_date) : null;
            const isOverdue =
              dueDate && dueDate < new Date() && goal.status !== "completed";
            return (
              <View
                key={goal.id}
                style={{
                  backgroundColor: C.surface,
                  borderRadius: 16,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: C.border,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: C.textPrimary,
                      }}
                    >
                      {goal.title}
                    </Text>
                    {goal.metric && (
                      <Text
                        style={{
                          fontSize: 11,
                          color: C.textMuted,
                          marginTop: 2,
                        }}
                      >
                        Metric: {goal.metric}
                        {goal.target ? ` · Target: ${goal.target}` : ""}
                      </Text>
                    )}
                    {goal.cycle && (
                      <View
                        style={{
                          backgroundColor: C.primaryLight,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 6,
                          alignSelf: "flex-start",
                          marginTop: 4,
                        }}
                      >
                        <Text
                          style={{
                            color: C.primary,
                            fontSize: 9,
                            fontWeight: "700",
                          }}
                        >
                          {goal.cycle}
                        </Text>
                      </View>
                    )}
                  </View>
                  <StatusPill status={isOverdue ? "overdue" : goal.status} />
                </View>

                <ProgressBar progress={goal.progress ?? 0} />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <View>
                    {goal.employee_first_name ? (
                      <Text
                        style={{
                          fontSize: 11,
                          color: C.textSecondary,
                        }}
                      >
                        {goal.employee_first_name} {goal.employee_last_name} ·{" "}
                        {goal.department_name ?? ""}
                      </Text>
                    ) : (
                      <Text
                        style={{
                          fontSize: 11,
                          color: C.textMuted,
                        }}
                      >
                        Company-wide
                      </Text>
                    )}
                    {dueDate && (
                      <Text
                        style={{
                          fontSize: 11,
                          color: isOverdue ? "#dc2626" : C.textMuted,
                          marginTop: 2,
                        }}
                      >
                        Due: {dueDate.toLocaleDateString("en-GB")}
                      </Text>
                    )}
                  </View>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <TouchableOpacity
                      onPress={() => {
                        setSelected(goal);
                        setModal("progress");
                      }}
                      style={[
                        styles.actionBtn,
                        {
                          backgroundColor: C.primaryLight,
                        },
                      ]}
                    >
                      <BarChart2 size={13} color={C.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setSelected(goal);
                        setModal("edit");
                      }}
                      style={[
                        styles.actionBtn,
                        {
                          backgroundColor: C.surfaceAlt,
                        },
                      ]}
                    >
                      <Edit2 size={13} color={C.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Modals */}
      {(modal === "create" || modal === "edit") && (
        <GoalModal
          goal={modal === "edit" ? selected : null}
          employees={employees}
          loadingEmployees={loadingEmployees}
          onClose={() => {
            setModal(null);
            setSelected(null);
          }}
          onSaved={handleSaved}
        />
      )}
      {modal === "progress" && selected && (
        <ProgressModal
          goal={selected}
          onClose={() => {
            setModal(null);
            setSelected(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  selectTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  modalContainer: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: "80%",
  },
  searchInput: {
    backgroundColor: C.surfaceAlt,
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    color: C.textPrimary,
  },
  empRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: C.textPrimary,
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    backgroundColor: C.surfaceAlt,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    color: C.textPrimary,
    fontSize: 14,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});