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
//   Shield,
//   Plus,
//   RefreshCw,
//   AlertTriangle,
//   CheckCircle2,
//   Clock,
//   AlertCircle,
//   BarChart2,
//   Edit2,
//   TrendingUp,
//   ChevronDown,
//   X,
//   Calendar,
// } from "lucide-react-native";
// import C from "../../../styles/colors";
// import {
//   listPIPs,
//   createPIP,
//   updatePIP,
//   updatePIPStatus,
//   updatePIPProgress,
// } from "../../../api/service/performanceApi";
// import { getEmployees } from "../../../api/service/employeeApi";

// const STATUS_CFG: Record<string, { bg: string; color: string; label: string }> =
//   {
//     active: { bg: "#fef3c7", color: "#d97706", label: "Active" },
//     completed: { bg: "#d1fae5", color: "#059669", label: "Completed" },
//     failed: { bg: "#fee2e2", color: "#dc2626", label: "Failed" },
//   };

// function StatusPill({ status }: { status: string }) {
//   const cfg = STATUS_CFG[status?.toLowerCase()] ?? STATUS_CFG.active;
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

// function ProgressBar({ progress = 0 }: { progress?: number }) {
//   const color =
//     progress >= 80 ? "#059669" : progress >= 40 ? "#d97706" : "#dc2626";
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
//                         value === e.id ? "#fef2f2" : "transparent",
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

// function PIPModal({ pip, employees, loadingEmployees, onClose, onSaved }: any) {
//   const isEdit = !!pip;
//   const [form, setForm] = useState({
//     employeeId: pip?.employeeId ?? "",
//     reason: pip?.reason ?? "",
//     reviewDate: pip?.reviewDate ? pip.reviewDate.slice(0, 10) : "",
//     period: pip?.period ?? "",
//     goals: pip?.goals?.length ? pip.goals : [{ title: "", target: 100 }],
//   });
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));
//   const addGoal = () =>
//     set("goals", [...form.goals, { title: "", target: 100 }]);
//   const removeGoal = (i: number) =>
//     set(
//       "goals",
//       form.goals.filter((_: any, j: number) => j !== i),
//     );
//   const setGoal = (i: number, k: string, v: any) => {
//     const next = [...form.goals];
//     next[i] = { ...next[i], [k]: v };
//     set("goals", next);
//   };

//   const handleSubmit = async () => {
//     if (!form.employeeId) {
//       setError("Please select an employee.");
//       return;
//     }
//     if (!form.reason.trim()) {
//       setError("Reason is required.");
//       return;
//     }
//     if (!form.reviewDate) {
//       setError("Review date is required.");
//       return;
//     }

//     setSaving(true);
//     setError("");
//     try {
//       const validGoals = form.goals.filter((g: any) => g.title.trim());
//       if (isEdit) {
//         await updatePIP(pip.id, {
//           reason: form.reason.trim(),
//           reviewDate: form.reviewDate,
//           period: form.period.trim() || undefined,
//           goals: validGoals,
//         });
//       } else {
//         await createPIP(form.employeeId, {
//           reason: form.reason.trim(),
//           reviewDate: form.reviewDate,
//           period: form.period.trim() || undefined,
//           goals: validGoals,
//         });
//       }
//       onSaved(`PIP ${isEdit ? "updated" : "created"} successfully.`);
//     } catch (err: any) {
//       setError(
//         err?.response?.data?.message ??
//           `Failed to ${isEdit ? "update" : "create"} PIP.`,
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
//               {isEdit ? "Edit PIP" : "Create Performance Improvement Plan"}
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
//               Employee <Text style={{ color: "#ef4444" }}>*</Text>
//             </Text>
//             <EmployeeSelect
//               employees={employees}
//               value={form.employeeId}
//               onChange={(v: string) => set("employeeId", v)}
//               loading={loadingEmployees}
//             />
//             {isEdit && (
//               <Text
//                 style={{
//                   fontSize: 10,
//                   color: C.textMuted,
//                   marginTop: 4,
//                 }}
//               >
//                 Employee cannot be changed after creation.
//               </Text>
//             )}

//             <Text style={styles.label}>
//               Reason for PIP <Text style={{ color: "#ef4444" }}>*</Text>
//             </Text>
//             <TextInput
//               value={form.reason}
//               onChangeText={(t) => set("reason", t)}
//               multiline
//               numberOfLines={3}
//               placeholder="Describe performance issues..."
//               placeholderTextColor={C.textMuted}
//               style={[styles.input, { height: 80, textAlignVertical: "top" }]}
//             />

//             <View style={{ flexDirection: "row", gap: 10 }}>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.label}>
//                   Review Date <Text style={{ color: "#ef4444" }}>*</Text>
//                 </Text>
//                 <TextInput
//                   value={form.reviewDate}
//                   onChangeText={(t) => set("reviewDate", t)}
//                   placeholder="YYYY-MM-DD"
//                   placeholderTextColor={C.textMuted}
//                   style={styles.input}
//                 />
//               </View>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.label}>
//                   Period{" "}
//                   <Text style={{ color: C.textMuted, fontWeight: "400" }}>
//                     (optional)
//                   </Text>
//                 </Text>
//                 <TextInput
//                   value={form.period}
//                   onChangeText={(t) => set("period", t)}
//                   placeholder="e.g. 90 days"
//                   placeholderTextColor={C.textMuted}
//                   style={styles.input}
//                 />
//               </View>
//             </View>

//             <View
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 marginTop: 10,
//                 marginBottom: 6,
//               }}
//             >
//               <Text style={styles.label}>Improvement Goals</Text>
//               <TouchableOpacity
//                 onPress={addGoal}
//                 style={{
//                   flexDirection: "row",
//                   alignItems: "center",
//                   gap: 4,
//                 }}
//               >
//                 <Plus size={12} color="#dc2626" />
//                 <Text
//                   style={{
//                     fontSize: 12,
//                     fontWeight: "600",
//                     color: "#dc2626",
//                   }}
//                 >
//                   Add goal
//                 </Text>
//               </TouchableOpacity>
//             </View>
//             {form.goals.map((g: any, i: number) => (
//               <View
//                 key={i}
//                 style={{
//                   flexDirection: "row",
//                   gap: 8,
//                   alignItems: "center",
//                   marginBottom: 8,
//                 }}
//               >
//                 <TextInput
//                   value={g.title}
//                   onChangeText={(t) => setGoal(i, "title", t)}
//                   placeholder={`Goal ${i + 1}`}
//                   placeholderTextColor={C.textMuted}
//                   style={[styles.input, { flex: 1 }]}
//                 />
//                 <TextInput
//                   value={String(g.target)}
//                   onChangeText={(t) => setGoal(i, "target", Number(t) || 0)}
//                   keyboardType="numeric"
//                   style={[styles.input, { width: 50, textAlign: "center" }]}
//                 />
//                 <Text style={{ color: C.textMuted, fontSize: 12 }}>%</Text>
//                 {form.goals.length > 1 && (
//                   <TouchableOpacity
//                     onPress={() => removeGoal(i)}
//                     style={{
//                       padding: 6,
//                       backgroundColor: "#fee2e2",
//                       borderRadius: 8,
//                     }}
//                   >
//                     <X size={12} color="#dc2626" />
//                   </TouchableOpacity>
//                 )}
//               </View>
//             ))}
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
//                 borderWidth: 1,
//                 borderColor: C.border,
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
//                 backgroundColor: "#dc2626",
//                 alignItems: "center",
//                 opacity: saving ? 0.7 : 1,
//               }}
//             >
//               <Text style={{ color: "#fff", fontWeight: "600" }}>
//                 {saving ? "Saving…" : isEdit ? "Save Changes" : "Create PIP"}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// function ProgressModal({ pip, onClose, onSaved }: any) {
//   const [progress, setProgress] = useState(pip.progress ?? 0);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   const handleSave = async () => {
//     setSaving(true);
//     setError("");
//     try {
//       await updatePIPProgress(pip.id, progress);
//       onSaved("Progress updated successfully.");
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
//             {pip.employeeName}
//           </Text>
//           <View style={{ alignItems: "center", marginVertical: 16 }}>
//             <Text
//               style={{
//                 fontSize: 32,
//                 fontWeight: "800",
//                 color: "#dc2626",
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
//                 backgroundColor: "#dc2626",
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
//           {progress === 100 && (
//             <Text
//               style={{
//                 fontSize: 12,
//                 color: "#059669",
//                 textAlign: "center",
//                 marginTop: 8,
//                 fontWeight: "600",
//               }}
//             >
//               ✓ Will be automatically marked as Completed
//             </Text>
//           )}
//           {error ? (
//             <Text style={{ color: "#dc2626", fontSize: 12, marginTop: 8 }}>
//               {error}
//             </Text>
//           ) : null}
//           <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
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
//               <Text style={{ color: C.textSecondary, fontWeight: "600" }}>
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
//                 backgroundColor: "#dc2626",
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

// function StatusModal({ pip, onClose, onSaved }: any) {
//   const [status, setStatus] = useState(pip.status ?? "active");
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   const handleSave = async () => {
//     if (status === pip.status) {
//       onClose();
//       return;
//     }
//     setSaving(true);
//     setError("");
//     try {
//       await updatePIPStatus(pip.id, status);
//       onSaved(`PIP marked as ${status}.`);
//     } catch (err: any) {
//       setError(err?.response?.data?.message ?? "Failed to update status.");
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
//               Change Status
//             </Text>
//             <TouchableOpacity onPress={onClose}>
//               <X size={20} color={C.textMuted} />
//             </TouchableOpacity>
//           </View>
//           {error ? (
//             <View
//               style={{
//                 backgroundColor: "#fee2e2",
//                 padding: 10,
//                 borderRadius: 12,
//                 marginBottom: 12,
//               }}
//             >
//               <Text style={{ color: "#dc2626", fontSize: 12 }}>{error}</Text>
//             </View>
//           ) : null}
//           {Object.entries(STATUS_CFG).map(([key, cfg]) => (
//             <TouchableOpacity
//               key={key}
//               onPress={() => setStatus(key)}
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 gap: 12,
//                 padding: 14,
//                 borderRadius: 12,
//                 marginBottom: 8,
//                 backgroundColor: status === key ? cfg.bg : C.surfaceAlt,
//                 borderWidth: 2,
//                 borderColor: status === key ? cfg.color : C.border,
//               }}
//             >
//               {key === "active" ? (
//                 <Clock size={16} color={cfg.color} />
//               ) : key === "completed" ? (
//                 <CheckCircle2 size={16} color={cfg.color} />
//               ) : (
//                 <AlertCircle size={16} color={cfg.color} />
//               )}
//               <Text
//                 style={{
//                   fontSize: 14,
//                   fontWeight: "600",
//                   color: status === key ? cfg.color : C.textPrimary,
//                 }}
//               >
//                 {cfg.label}
//               </Text>
//               {status === key && (
//                 <View style={{ marginLeft: "auto" }}>
//                   <CheckCircle2 size={16} color={cfg.color} />
//                 </View>
//               )}
//             </TouchableOpacity>
//           ))}
//           <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
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
//               <Text style={{ color: C.textSecondary, fontWeight: "600" }}>
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
//                 backgroundColor: "#dc2626",
//                 alignItems: "center",
//                 opacity: saving ? 0.7 : 1,
//               }}
//             >
//               <Text style={{ color: "#fff", fontWeight: "600" }}>
//                 {saving ? "Saving…" : "Apply"}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// export default function PIPManagementView({
//   searchQuery,
// }: {
//   searchQuery: string;
// }) {
//   const [pips, setPips] = useState<any[]>([]);
//   const [employees, setEmployees] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingEmployees, setLoadingEmployees] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [statusFilter, setStatusFilter] = useState("");
//   const [modal, setModal] = useState<
//     null | "create" | "edit" | "progress" | "status"
//   >(null);
//   const [selected, setSelected] = useState<any>(null);
//   const [toast, setToast] = useState<string | null>(null);

//   const showToast = (msg: string) => {
//     setToast(msg);
//     setTimeout(() => setToast(null), 3500);
//   };

//   const loadPIPs = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await listPIPs(statusFilter ? { status: statusFilter } : {});
//       const list = res?.pips ?? res?.data ?? (Array.isArray(res) ? res : []);
//       setPips(list);
//     } catch {
//       setError("Failed to load PIPs. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   }, [statusFilter]);

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
//     loadPIPs();
//   }, [loadPIPs]);
//   useEffect(() => {
//     loadEmployees();
//   }, []);

//   const handleSaved = (msg: string) => {
//     setModal(null);
//     setSelected(null);
//     loadPIPs();
//     showToast(msg);
//   };

//   const stats = useMemo(
//     () => ({
//       total: pips.length,
//       active: pips.filter((p: any) => p.status === "active").length,
//       completed: pips.filter((p: any) => p.status === "completed").length,
//       failed: pips.filter((p: any) => p.status === "failed").length,
//     }),
//     [pips],
//   );

//   const filtered = pips.filter((p: any) => {
//     const q = searchQuery.toLowerCase();
//     const name = p.employeeName?.toLowerCase() ?? "";
//     return !q || name.includes(q) || p.reason?.toLowerCase().includes(q);
//   });

//   const filters = [
//     { key: "", label: "All", count: stats.total },
//     { key: "active", label: "Active", count: stats.active },
//     { key: "completed", label: "Completed", count: stats.completed },
//     { key: "failed", label: "Failed", count: stats.failed },
//   ];

//   return (
//     <View>
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
//             Performance Improvement Plans
//           </Text>
//           <Text
//             style={{
//               fontSize: 11,
//               color: C.textMuted,
//               marginTop: 2,
//             }}
//           >
//             {stats.total} total · {stats.active} active · {stats.completed}{" "}
//             completed
//             {stats.failed > 0 && (
//               <Text style={{ color: "#dc2626" }}> · {stats.failed} failed</Text>
//             )}
//           </Text>
//         </View>
//         <View style={{ flexDirection: "row", gap: 8 }}>
//           <TouchableOpacity onPress={loadPIPs} style={styles.iconBtn}>
//             <RefreshCw size={14} color={C.textSecondary} />
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={() => {
//               setSelected(null);
//               setModal("create");
//             }}
//             style={[styles.iconBtn, { backgroundColor: "#dc2626" }]}
//           >
//             <Plus size={14} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </View>

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
//               backgroundColor: statusFilter === f.key ? "#dc2626" : C.surface,
//               borderWidth: 1,
//               borderColor: statusFilter === f.key ? "#dc2626" : C.border,
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
//           <AlertTriangle size={16} color="#dc2626" />
//           <Text style={{ color: "#dc2626", fontSize: 13, flex: 1 }}>
//             {error}
//           </Text>
//           <TouchableOpacity onPress={loadPIPs}>
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

//       {loading ? (
//         <ActivityIndicator color={C.primary} style={{ marginTop: 24 }} />
//       ) : filtered.length === 0 ? (
//         <View style={{ alignItems: "center", padding: 40, gap: 12 }}>
//           <Shield size={32} color={C.textMuted} />
//           <Text style={{ color: C.textPrimary, fontWeight: "600" }}>
//             No PIPs found
//           </Text>
//           <TouchableOpacity
//             onPress={() => setModal("create")}
//             style={{
//               backgroundColor: "#dc2626",
//               paddingHorizontal: 16,
//               paddingVertical: 8,
//               borderRadius: 12,
//             }}
//           >
//             <Text style={{ color: "#fff", fontWeight: "600" }}>
//               Create First PIP
//             </Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <View style={{ gap: 10 }}>
//           {filtered.map((pip: any) => {
//             const reviewDate = pip.reviewDate ? new Date(pip.reviewDate) : null;
//             const isOverdue =
//               reviewDate && reviewDate < new Date() && pip.status === "active";
//             return (
//               <View
//                 key={pip.id}
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
//                   <View>
//                     <Text
//                       style={{
//                         fontSize: 14,
//                         fontWeight: "700",
//                         color: C.textPrimary,
//                       }}
//                     >
//                       {pip.employeeName}
//                     </Text>
//                     <Text
//                       style={{
//                         fontSize: 11,
//                         color: C.textMuted,
//                         marginTop: 2,
//                       }}
//                     >
//                       {pip.departmentName ?? ""}
//                     </Text>
//                   </View>
//                   <StatusPill status={pip.status} />
//                 </View>

//                 <Text
//                   style={{
//                     fontSize: 12,
//                     color: C.textSecondary,
//                     marginBottom: 10,
//                   }}
//                   numberOfLines={2}
//                 >
//                   {pip.reason}
//                 </Text>

//                 <ProgressBar progress={pip.progress ?? 0} />

//                 <View
//                   style={{
//                     flexDirection: "row",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     marginTop: 10,
//                   }}
//                 >
//                   <View>
//                     <Text
//                       style={{
//                         fontSize: 11,
//                         color: isOverdue ? "#dc2626" : C.textSecondary,
//                       }}
//                     >
//                       <Calendar
//                         size={11}
//                         color={isOverdue ? "#dc2626" : C.textSecondary}
//                       />{" "}
//                       {reviewDate
//                         ? reviewDate.toLocaleDateString("en-GB")
//                         : "—"}
//                     </Text>
//                     {pip.period && (
//                       <Text
//                         style={{
//                           fontSize: 10,
//                           color: C.textMuted,
//                           marginTop: 2,
//                         }}
//                       >
//                         {pip.period}
//                       </Text>
//                     )}
//                     {isOverdue && (
//                       <Text
//                         style={{
//                           fontSize: 10,
//                           color: "#dc2626",
//                           fontWeight: "600",
//                         }}
//                       >
//                         Overdue
//                       </Text>
//                     )}
//                   </View>
//                   <View style={{ flexDirection: "row", gap: 6 }}>
//                     <TouchableOpacity
//                       onPress={() => {
//                         setSelected(pip);
//                         setModal("progress");
//                       }}
//                       style={[styles.actionBtn, { backgroundColor: "#fee2e2" }]}
//                     >
//                       <BarChart2 size={13} color="#dc2626" />
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       onPress={() => {
//                         setSelected(pip);
//                         setModal("status");
//                       }}
//                       style={[styles.actionBtn, { backgroundColor: "#fef3c7" }]}
//                     >
//                       <TrendingUp size={13} color="#d97706" />
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       onPress={() => {
//                         setSelected(pip);
//                         setModal("edit");
//                       }}
//                       style={[
//                         styles.actionBtn,
//                         { backgroundColor: C.surfaceAlt },
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

//       {(modal === "create" || modal === "edit") && (
//         <PIPModal
//           pip={modal === "edit" ? selected : null}
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
//           pip={selected}
//           onClose={() => {
//             setModal(null);
//             setSelected(null);
//           }}
//           onSaved={handleSaved}
//         />
//       )}
//       {modal === "status" && selected && (
//         <StatusModal
//           pip={selected}
//           onClose={() => {
//             setModal(null);
//             setSelected(null);
//           }}
//           onSaved={handleSaved}
//         />
//       )}

//       {toast && (
//         <View
//           style={{
//             position: "absolute",
//             bottom: 24,
//             left: 16,
//             right: 16,
//             backgroundColor: "#1e293b",
//             padding: 14,
//             borderRadius: 16,
//             flexDirection: "row",
//             alignItems: "center",
//             gap: 8,
//             zIndex: 50,
//           }}
//         >
//           <CheckCircle2 size={14} color="#10b981" />
//           <Text style={{ color: "#fff", fontSize: 13, fontWeight: "500" }}>
//             {toast}
//           </Text>
//         </View>
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


// src/components/admin/performance/PIPManagementView.tsx
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
  Shield,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart2,
  Edit2,
  TrendingUp,
  ChevronDown,
  X,
  Calendar,
} from "lucide-react-native";
import C from "../../../styles/colors";
import {
  listPIPs,
  createPIP,
  updatePIP,
  updatePIPStatus,
  updatePIPProgress,
} from "../../../api/service/performanceApi";
import { getEmployees } from "../../../api/service/employeeApi";
import { Loader } from "../../../hooks/loaderManager";

const STATUS_CFG: Record<string, { bg: string; color: string; label: string }> =
  {
    active: { bg: "#fef3c7", color: "#d97706", label: "Active" },
    completed: { bg: "#d1fae5", color: "#059669", label: "Completed" },
    failed: { bg: "#fee2e2", color: "#dc2626", label: "Failed" },
  };

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CFG[status?.toLowerCase()] ?? STATUS_CFG.active;
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

function ProgressBar({ progress = 0 }: { progress?: number }) {
  const color =
    progress >= 80 ? "#059669" : progress >= 40 ? "#d97706" : "#dc2626";
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
                        value === e.id ? "#fef2f2" : "transparent",
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

function PIPModal({ pip, employees, loadingEmployees, onClose, onSaved }: any) {
  const isEdit = !!pip;
  const [form, setForm] = useState({
    employeeId: pip?.employeeId ?? "",
    reason: pip?.reason ?? "",
    reviewDate: pip?.reviewDate ? pip.reviewDate.slice(0, 10) : "",
    period: pip?.period ?? "",
    goals: pip?.goals?.length ? pip.goals : [{ title: "", target: 100 }],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));
  const addGoal = () =>
    set("goals", [...form.goals, { title: "", target: 100 }]);
  const removeGoal = (i: number) =>
    set(
      "goals",
      form.goals.filter((_: any, j: number) => j !== i),
    );
  const setGoal = (i: number, k: string, v: any) => {
    const next = [...form.goals];
    next[i] = { ...next[i], [k]: v };
    set("goals", next);
  };

  const handleSubmit = async () => {
    if (!form.employeeId) {
      setError("Please select an employee.");
      return;
    }
    if (!form.reason.trim()) {
      setError("Reason is required.");
      return;
    }
    if (!form.reviewDate) {
      setError("Review date is required.");
      return;
    }

    setSaving(true);
    setError("");
    Loader.show();
    try {
      const validGoals = form.goals.filter((g: any) => g.title.trim());
      if (isEdit) {
        await updatePIP(pip.id, {
          reason: form.reason.trim(),
          reviewDate: form.reviewDate,
          period: form.period.trim() || undefined,
          goals: validGoals,
        });
      } else {
        await createPIP(form.employeeId, {
          reason: form.reason.trim(),
          reviewDate: form.reviewDate,
          period: form.period.trim() || undefined,
          goals: validGoals,
        });
      }
      onSaved(`PIP ${isEdit ? "updated" : "created"} successfully.`);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          `Failed to ${isEdit ? "update" : "create"} PIP.`,
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
              {isEdit ? "Edit PIP" : "Create Performance Improvement Plan"}
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
              Employee <Text style={{ color: "#ef4444" }}>*</Text>
            </Text>
            <EmployeeSelect
              employees={employees}
              value={form.employeeId}
              onChange={(v: string) => set("employeeId", v)}
              loading={loadingEmployees}
            />
            {isEdit && (
              <Text
                style={{
                  fontSize: 10,
                  color: C.textMuted,
                  marginTop: 4,
                }}
              >
                Employee cannot be changed after creation.
              </Text>
            )}

            <Text style={styles.label}>
              Reason for PIP <Text style={{ color: "#ef4444" }}>*</Text>
            </Text>
            <TextInput
              value={form.reason}
              onChangeText={(t) => set("reason", t)}
              multiline
              numberOfLines={3}
              placeholder="Describe performance issues..."
              placeholderTextColor={C.textMuted}
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>
                  Review Date <Text style={{ color: "#ef4444" }}>*</Text>
                </Text>
                <TextInput
                  value={form.reviewDate}
                  onChangeText={(t) => set("reviewDate", t)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={C.textMuted}
                  style={styles.input}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>
                  Period{" "}
                  <Text style={{ color: C.textMuted, fontWeight: "400" }}>
                    (optional)
                  </Text>
                </Text>
                <TextInput
                  value={form.period}
                  onChangeText={(t) => set("period", t)}
                  placeholder="e.g. 90 days"
                  placeholderTextColor={C.textMuted}
                  style={styles.input}
                />
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 10,
                marginBottom: 6,
              }}
            >
              <Text style={styles.label}>Improvement Goals</Text>
              <TouchableOpacity
                onPress={addGoal}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Plus size={12} color="#dc2626" />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#dc2626",
                  }}
                >
                  Add goal
                </Text>
              </TouchableOpacity>
            </View>
            {form.goals.map((g: any, i: number) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <TextInput
                  value={g.title}
                  onChangeText={(t) => setGoal(i, "title", t)}
                  placeholder={`Goal ${i + 1}`}
                  placeholderTextColor={C.textMuted}
                  style={[styles.input, { flex: 1 }]}
                />
                <TextInput
                  value={String(g.target)}
                  onChangeText={(t) => setGoal(i, "target", Number(t) || 0)}
                  keyboardType="numeric"
                  style={[styles.input, { width: 50, textAlign: "center" }]}
                />
                <Text style={{ color: C.textMuted, fontSize: 12 }}>%</Text>
                {form.goals.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeGoal(i)}
                    style={{
                      padding: 6,
                      backgroundColor: "#fee2e2",
                      borderRadius: 8,
                    }}
                  >
                    <X size={12} color="#dc2626" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
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
                borderWidth: 1,
                borderColor: C.border,
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
                backgroundColor: "#dc2626",
                alignItems: "center",
                opacity: saving ? 0.7 : 1,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                {saving ? "Saving…" : isEdit ? "Save Changes" : "Create PIP"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ProgressModal({ pip, onClose, onSaved }: any) {
  const [progress, setProgress] = useState(pip.progress ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    Loader.show();
    try {
      await updatePIPProgress(pip.id, progress);
      onSaved("Progress updated successfully.");
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
            {pip.employeeName}
          </Text>
          <View style={{ alignItems: "center", marginVertical: 16 }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "800",
                color: "#dc2626",
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
                backgroundColor: "#dc2626",
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
          {progress === 100 && (
            <Text
              style={{
                fontSize: 12,
                color: "#059669",
                textAlign: "center",
                marginTop: 8,
                fontWeight: "600",
              }}
            >
              ✓ Will be automatically marked as Completed
            </Text>
          )}
          {error ? (
            <Text style={{ color: "#dc2626", fontSize: 12, marginTop: 8 }}>
              {error}
            </Text>
          ) : null}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
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
              <Text style={{ color: C.textSecondary, fontWeight: "600" }}>
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
                backgroundColor: "#dc2626",
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

function StatusModal({ pip, onClose, onSaved }: any) {
  const [status, setStatus] = useState(pip.status ?? "active");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (status === pip.status) {
      onClose();
      return;
    }
    setSaving(true);
    setError("");
    Loader.show();
    try {
      await updatePIPStatus(pip.id, status);
      onSaved(`PIP marked as ${status}.`);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to update status.");
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
              Change Status
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={C.textMuted} />
            </TouchableOpacity>
          </View>
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
          {Object.entries(STATUS_CFG).map(([key, cfg]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setStatus(key)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 14,
                borderRadius: 12,
                marginBottom: 8,
                backgroundColor: status === key ? cfg.bg : C.surfaceAlt,
                borderWidth: 2,
                borderColor: status === key ? cfg.color : C.border,
              }}
            >
              {key === "active" ? (
                <Clock size={16} color={cfg.color} />
              ) : key === "completed" ? (
                <CheckCircle2 size={16} color={cfg.color} />
              ) : (
                <AlertCircle size={16} color={cfg.color} />
              )}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: status === key ? cfg.color : C.textPrimary,
                }}
              >
                {cfg.label}
              </Text>
              {status === key && (
                <View style={{ marginLeft: "auto" }}>
                  <CheckCircle2 size={16} color={cfg.color} />
                </View>
              )}
            </TouchableOpacity>
          ))}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
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
              <Text style={{ color: C.textSecondary, fontWeight: "600" }}>
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
                backgroundColor: "#dc2626",
                alignItems: "center",
                opacity: saving ? 0.7 : 1,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                {saving ? "Saving…" : "Apply"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function PIPManagementView({
  searchQuery,
}: {
  searchQuery: string;
}) {
  const [pips, setPips] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState<
    null | "create" | "edit" | "progress" | "status"
  >(null);
  const [selected, setSelected] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadPIPs = useCallback(async () => {
    setLoading(true);
    setError(null);
    Loader.show();
    try {
      const res = await listPIPs(statusFilter ? { status: statusFilter } : {});
      const list = res?.pips ?? res?.data ?? (Array.isArray(res) ? res : []);
      setPips(list);
    } catch {
      setError("Failed to load PIPs. Please try again.");
    } finally {
      setLoading(false);
      Loader.hide();
    }
  }, [statusFilter]);

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
    loadPIPs();
  }, [loadPIPs]);
  useEffect(() => {
    loadEmployees();
  }, []);

  const handleSaved = (msg: string) => {
    setModal(null);
    setSelected(null);
    loadPIPs();
    showToast(msg);
  };

  const stats = useMemo(
    () => ({
      total: pips.length,
      active: pips.filter((p: any) => p.status === "active").length,
      completed: pips.filter((p: any) => p.status === "completed").length,
      failed: pips.filter((p: any) => p.status === "failed").length,
    }),
    [pips],
  );

  const filtered = pips.filter((p: any) => {
    const q = searchQuery.toLowerCase();
    const name = p.employeeName?.toLowerCase() ?? "";
    return !q || name.includes(q) || p.reason?.toLowerCase().includes(q);
  });

  const filters = [
    { key: "", label: "All", count: stats.total },
    { key: "active", label: "Active", count: stats.active },
    { key: "completed", label: "Completed", count: stats.completed },
    { key: "failed", label: "Failed", count: stats.failed },
  ];

  return (
    <View>
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
            Performance Improvement Plans
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: C.textMuted,
              marginTop: 2,
            }}
          >
            {stats.total} total · {stats.active} active · {stats.completed}{" "}
            completed
            {stats.failed > 0 && (
              <Text style={{ color: "#dc2626" }}> · {stats.failed} failed</Text>
            )}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity onPress={loadPIPs} style={styles.iconBtn}>
            <RefreshCw size={14} color={C.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSelected(null);
              setModal("create");
            }}
            style={[styles.iconBtn, { backgroundColor: "#dc2626" }]}
          >
            <Plus size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

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
              backgroundColor: statusFilter === f.key ? "#dc2626" : C.surface,
              borderWidth: 1,
              borderColor: statusFilter === f.key ? "#dc2626" : C.border,
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
          <AlertTriangle size={16} color="#dc2626" />
          <Text style={{ color: "#dc2626", fontSize: 13, flex: 1 }}>
            {error}
          </Text>
          <TouchableOpacity onPress={loadPIPs}>
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

      {loading ? (
        <ActivityIndicator color={C.primary} style={{ marginTop: 24 }} />
      ) : filtered.length === 0 ? (
        <View style={{ alignItems: "center", padding: 40, gap: 12 }}>
          <Shield size={32} color={C.textMuted} />
          <Text style={{ color: C.textPrimary, fontWeight: "600" }}>
            No PIPs found
          </Text>
          <TouchableOpacity
            onPress={() => setModal("create")}
            style={{
              backgroundColor: "#dc2626",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              Create First PIP
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {filtered.map((pip: any) => {
            const reviewDate = pip.reviewDate ? new Date(pip.reviewDate) : null;
            const isOverdue =
              reviewDate && reviewDate < new Date() && pip.status === "active";
            return (
              <View
                key={pip.id}
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
                  <View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: C.textPrimary,
                      }}
                    >
                      {pip.employeeName}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: C.textMuted,
                        marginTop: 2,
                      }}
                    >
                      {pip.departmentName ?? ""}
                    </Text>
                  </View>
                  <StatusPill status={pip.status} />
                </View>

                <Text
                  style={{
                    fontSize: 12,
                    color: C.textSecondary,
                    marginBottom: 10,
                  }}
                  numberOfLines={2}
                >
                  {pip.reason}
                </Text>

                <ProgressBar progress={pip.progress ?? 0} />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 11,
                        color: isOverdue ? "#dc2626" : C.textSecondary,
                      }}
                    >
                      <Calendar
                        size={11}
                        color={isOverdue ? "#dc2626" : C.textSecondary}
                      />{" "}
                      {reviewDate
                        ? reviewDate.toLocaleDateString("en-GB")
                        : "—"}
                    </Text>
                    {pip.period && (
                      <Text
                        style={{
                          fontSize: 10,
                          color: C.textMuted,
                          marginTop: 2,
                        }}
                      >
                        {pip.period}
                      </Text>
                    )}
                    {isOverdue && (
                      <Text
                        style={{
                          fontSize: 10,
                          color: "#dc2626",
                          fontWeight: "600",
                        }}
                      >
                        Overdue
                      </Text>
                    )}
                  </View>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <TouchableOpacity
                      onPress={() => {
                        setSelected(pip);
                        setModal("progress");
                      }}
                      style={[styles.actionBtn, { backgroundColor: "#fee2e2" }]}
                    >
                      <BarChart2 size={13} color="#dc2626" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setSelected(pip);
                        setModal("status");
                      }}
                      style={[styles.actionBtn, { backgroundColor: "#fef3c7" }]}
                    >
                      <TrendingUp size={13} color="#d97706" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setSelected(pip);
                        setModal("edit");
                      }}
                      style={[
                        styles.actionBtn,
                        { backgroundColor: C.surfaceAlt },
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

      {(modal === "create" || modal === "edit") && (
        <PIPModal
          pip={modal === "edit" ? selected : null}
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
          pip={selected}
          onClose={() => {
            setModal(null);
            setSelected(null);
          }}
          onSaved={handleSaved}
        />
      )}
      {modal === "status" && selected && (
        <StatusModal
          pip={selected}
          onClose={() => {
            setModal(null);
            setSelected(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {toast && (
        <View
          style={{
            position: "absolute",
            bottom: 24,
            left: 16,
            right: 16,
            backgroundColor: "#1e293b",
            padding: 14,
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            zIndex: 50,
          }}
        >
          <CheckCircle2 size={14} color="#10b981" />
          <Text style={{ color: "#fff", fontSize: 13, fontWeight: "500" }}>
            {toast}
          </Text>
        </View>
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