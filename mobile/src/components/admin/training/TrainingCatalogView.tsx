// // src/components/admin/training/TrainingCatalogView.tsx
// // Mobile equivalent of TrainingCatalog.jsx — training programs as cards,
// // with a create-training bottom sheet and an assign-employees bottom sheet.

// import { useCallback, useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   TextInput,
//   Modal,
//   ActivityIndicator,
// } from "react-native";
// import {
//   Plus,
//   X,
//   Save,
//   GraduationCap,
//   Users,
//   UserPlus,
//   Check,
//   Search as SearchIcon,
//   AlertCircle,
// } from "lucide-react-native";

// import C from "../../../styles/colors";
// import {
//   listTrainings,
//   createTraining,
//   assignTraining,
// } from "../../../api/service/trainingApi";
// import { getEmployees } from "../../../api/service/employeeApi";
// import StatusChip from "../attendance/StatusChip";
// import {
//   TRAINING_TYPE_CFG,
//   fmtNairaCompact,
//   fmtShortDate,
//   initials,
// } from "../../../hooks/trainingHelpers";

// const EMPTY_FORM = {
//   title: "",
//   type: "Internal" as "Internal" | "External",
//   provider: "",
//   description: "",
//   startDate: "",
//   endDate: "",
//   location: "",
//   link: "",
//   cost: "",
//   maxAttendees: "",
// };

// interface Props {
//   searchQuery: string;
//   showToast: (msg: string, type?: "success" | "error" | "info") => void;
// }

// export default function TrainingCatalogView({ searchQuery, showToast }: Props) {
//   const [trainings, setTrainings] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [filterType, setFilterType] = useState<"All" | "Internal" | "External">(
//     "All",
//   );

//   // Create modal
//   const [showCreate, setShowCreate] = useState(false);
//   const [form, setForm] = useState(EMPTY_FORM);
//   const [saving, setSaving] = useState(false);
//   const [formErr, setFormErr] = useState<Record<string, string>>({});
//   const set = (k: keyof typeof EMPTY_FORM, v: string) =>
//     setForm((f) => ({ ...f, [k]: v }));

//   // Assign modal
//   const [assignTarget, setAssignTarget] = useState<any | null>(null);

//   const fetchTrainings = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const params: any = {};
//       if (filterType !== "All") params.type = filterType;
//       if (searchQuery) params.search = searchQuery;
//       const res = await listTrainings(params);
//       setTrainings(res.data ?? []);
//     } catch (e: any) {
//       setError(e?.response?.data?.message ?? "Failed to load trainings.");
//     } finally {
//       setLoading(false);
//     }
//   }, [filterType, searchQuery]);

//   useEffect(() => {
//     fetchTrainings();
//   }, [fetchTrainings]);

//   const handleCreate = async () => {
//     const errs: Record<string, string> = {};
//     if (!form.title.trim()) errs.title = "Required";
//     if (!form.provider.trim()) errs.provider = "Required";
//     if (!form.startDate) errs.startDate = "Required";
//     setFormErr(errs);
//     if (Object.keys(errs).length) return;

//     setSaving(true);
//     try {
//       const payload = {
//         title: form.title.trim(),
//         type: form.type,
//         provider: form.provider.trim(),
//         description: form.description || undefined,
//         startDate: form.startDate,
//         endDate: form.endDate || undefined,
//         location: form.location || undefined,
//         link: form.link || undefined,
//         cost: form.cost ? Number(form.cost) : undefined,
//         maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : undefined,
//       };
//       const res = await createTraining(payload);
//       setTrainings((prev) => [res.data, ...prev]);
//       setShowCreate(false);
//       setForm(EMPTY_FORM);
//       setFormErr({});
//       showToast("Training created successfully.");
//     } catch (e: any) {
//       setFormErr({
//         api: e?.response?.data?.message ?? "Failed to create training.",
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <View style={{ gap: 14 }}>
//       {/* Filters + New button */}
//       <View style={s.filterRow}>
//         {(["All", "Internal", "External"] as const).map((t) => {
//           const active = filterType === t;
//           return (
//             <Pressable
//               key={t}
//               onPress={() => setFilterType(t)}
//               style={[s.filterPill, active && s.filterPillActive]}
//             >
//               <Text
//                 style={[s.filterPillText, active && s.filterPillTextActive]}
//               >
//                 {t}
//               </Text>
//             </Pressable>
//           );
//         })}
//       </View>

//       <Pressable onPress={() => setShowCreate(true)} style={s.newBtn}>
//         <Plus size={14} color="#fff" />
//         <Text style={s.newBtnText}>New Training Program</Text>
//       </Pressable>

//       {/* List */}
//       {loading ? (
//         <View style={s.center}>
//           <ActivityIndicator size="large" color={C.primary} />
//         </View>
//       ) : error ? (
//         <View style={s.errorBox}>
//           <AlertCircle size={16} color={C.danger} />
//           <Text style={s.errorText}>{error}</Text>
//         </View>
//       ) : trainings.length === 0 ? (
//         <View style={s.center}>
//           <GraduationCap size={28} color={C.textMuted} />
//           <Text style={s.emptyText}>No trainings found.</Text>
//         </View>
//       ) : (
//         <View style={{ gap: 10 }}>
//           {trainings.map((training) => {
//             const typeCfg =
//               TRAINING_TYPE_CFG[training.type] ?? TRAINING_TYPE_CFG.Internal;
//             return (
//               <View key={training.id} style={s.card}>
//                 <View style={[s.cardBar, { backgroundColor: typeCfg.color }]} />
//                 <View style={s.cardBody}>
//                   <View style={s.cardTop}>
//                     <Text style={s.title} numberOfLines={2}>
//                       {training.title}
//                     </Text>
//                     <StatusChip
//                       label={training.type}
//                       color={typeCfg.color}
//                       bg={typeCfg.bg}
//                     />
//                   </View>
//                   <Text style={s.provider} numberOfLines={1}>
//                     {training.provider}
//                   </Text>

//                   <View style={s.metaRow}>
//                     <View style={{ flexDirection: "row", gap: 10 }}>
//                       {training.cost ? (
//                         <Text style={s.metaText}>
//                           {fmtNairaCompact(training.cost)}
//                         </Text>
//                       ) : null}
//                       {training.start_date ? (
//                         <Text style={[s.metaText, { color: C.textMuted }]}>
//                           {fmtShortDate(training.start_date)}
//                         </Text>
//                       ) : null}
//                     </View>
//                     <View style={s.enrolledRow}>
//                       <Users size={11} color={C.textMuted} />
//                       <Text style={s.enrolledText}>
//                         {training.enrolled_count ?? 0}/
//                         {training.max_attendees ?? "∞"}
//                       </Text>
//                     </View>
//                   </View>

//                   <Pressable
//                     onPress={() => setAssignTarget(training)}
//                     style={s.assignBtn}
//                   >
//                     <UserPlus size={12} color={C.primary} />
//                     <Text style={s.assignBtnText}>Assign</Text>
//                   </Pressable>
//                 </View>
//               </View>
//             );
//           })}
//         </View>
//       )}

//       {/* Create Modal */}
//       <Modal
//         visible={showCreate}
//         animationType="slide"
//         transparent
//         statusBarTranslucent
//         onRequestClose={() => !saving && setShowCreate(false)}
//       >
//         <View style={s.overlay}>
//           <View style={s.sheet}>
//             <View style={s.sheetHeader}>
//               <Text style={s.sheetTitle}>New Training Program</Text>
//               <Pressable
//                 onPress={() => !saving && setShowCreate(false)}
//                 hitSlop={8}
//               >
//                 <X size={18} color={C.textMuted} />
//               </Pressable>
//             </View>

//             {formErr.api ? (
//               <View style={s.errorBox}>
//                 <AlertCircle size={14} color={C.danger} />
//                 <Text style={s.errorText}>{formErr.api}</Text>
//               </View>
//             ) : null}

//             <Field label="Training Title" required error={formErr.title}>
//               <TextInput
//                 value={form.title}
//                 onChangeText={(t) => set("title", t)}
//                 placeholder="e.g. Advanced Python for Data Science"
//                 placeholderTextColor={C.textMuted}
//                 style={s.input}
//               />
//             </Field>

//             <View style={s.row2}>
//               <View style={{ flex: 1 }}>
//                 <Text style={s.fieldLabel}>Type</Text>
//                 <View style={s.typeToggle}>
//                   {(["Internal", "External"] as const).map((t) => {
//                     const active = form.type === t;
//                     return (
//                       <Pressable
//                         key={t}
//                         onPress={() => set("type", t)}
//                         style={[
//                           s.typeToggleBtn,
//                           active && { backgroundColor: C.primary },
//                         ]}
//                       >
//                         <Text
//                           style={[
//                             s.typeToggleText,
//                             active && { color: "#fff" },
//                           ]}
//                         >
//                           {t}
//                         </Text>
//                       </Pressable>
//                     );
//                   })}
//                 </View>
//               </View>
//               <View style={{ flex: 1 }}>
//                 <Field label="Provider" required error={formErr.provider}>
//                   <TextInput
//                     value={form.provider}
//                     onChangeText={(t) => set("provider", t)}
//                     placeholder="e.g. Coursera"
//                     placeholderTextColor={C.textMuted}
//                     style={s.input}
//                   />
//                 </Field>
//               </View>
//             </View>

//             <Field label="Description">
//               <TextInput
//                 value={form.description}
//                 onChangeText={(t) => set("description", t)}
//                 placeholder="Brief overview of training objectives…"
//                 placeholderTextColor={C.textMuted}
//                 multiline
//                 numberOfLines={2}
//                 style={[s.input, s.textarea]}
//               />
//             </Field>

//             <View style={s.row2}>
//               <View style={{ flex: 1 }}>
//                 <Field label="Start Date" required error={formErr.startDate}>
//                   <TextInput
//                     value={form.startDate}
//                     onChangeText={(t) => set("startDate", t)}
//                     placeholder="YYYY-MM-DD"
//                     placeholderTextColor={C.textMuted}
//                     style={s.input}
//                   />
//                 </Field>
//               </View>
//               <View style={{ flex: 1 }}>
//                 <Field label="End Date">
//                   <TextInput
//                     value={form.endDate}
//                     onChangeText={(t) => set("endDate", t)}
//                     placeholder="YYYY-MM-DD"
//                     placeholderTextColor={C.textMuted}
//                     style={s.input}
//                   />
//                 </Field>
//               </View>
//             </View>

//             <View style={s.row2}>
//               <View style={{ flex: 1 }}>
//                 <Field label="Cost (₦)">
//                   <TextInput
//                     value={form.cost}
//                     onChangeText={(t) => set("cost", t)}
//                     placeholder="450000"
//                     placeholderTextColor={C.textMuted}
//                     keyboardType="numeric"
//                     style={s.input}
//                   />
//                 </Field>
//               </View>
//               <View style={{ flex: 1 }}>
//                 <Field label="Max Attendees">
//                   <TextInput
//                     value={form.maxAttendees}
//                     onChangeText={(t) => set("maxAttendees", t)}
//                     placeholder="25"
//                     placeholderTextColor={C.textMuted}
//                     keyboardType="numeric"
//                     style={s.input}
//                   />
//                 </Field>
//               </View>
//             </View>

//             <Field label="Location / Virtual Link">
//               <TextInput
//                 value={form.location}
//                 onChangeText={(t) => set("location", t)}
//                 placeholder="Lagos Office or https://zoom.us/…"
//                 placeholderTextColor={C.textMuted}
//                 style={s.input}
//               />
//             </Field>

//             <View style={s.modalActions}>
//               <Pressable
//                 onPress={() => setShowCreate(false)}
//                 style={s.cancelBtn}
//               >
//                 <Text style={s.cancelBtnText}>Cancel</Text>
//               </Pressable>
//               <Pressable
//                 onPress={handleCreate}
//                 disabled={saving}
//                 style={s.saveBtn}
//               >
//                 {saving ? (
//                   <ActivityIndicator size="small" color="#fff" />
//                 ) : (
//                   <>
//                     <Save size={13} color="#fff" />
//                     <Text style={s.saveBtnText}>Create Training</Text>
//                   </>
//                 )}
//               </Pressable>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Assign Modal */}
//       {assignTarget && (
//         <AssignModal
//           training={assignTarget}
//           onClose={() => setAssignTarget(null)}
//           onAssigned={(count) => {
//             setAssignTarget(null);
//             showToast(
//               `${count} employee${count !== 1 ? "s" : ""} assigned successfully.`,
//             );
//             fetchTrainings();
//           }}
//         />
//       )}
//     </View>
//   );
// }

// function Field({
//   label,
//   required,
//   error,
//   children,
// }: {
//   label: string;
//   required?: boolean;
//   error?: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <View>
//       <Text style={s.fieldLabel}>
//         {label} {required && <Text style={{ color: C.danger }}>*</Text>}
//       </Text>
//       {children}
//       {error ? <Text style={s.fieldError}>{error}</Text> : null}
//     </View>
//   );
// }

// function AssignModal({
//   training,
//   onClose,
//   onAssigned,
// }: {
//   training: any;
//   onClose: () => void;
//   onAssigned: (count: number) => void;
// }) {
//   const [employees, setEmployees] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [selected, setSelected] = useState<Set<string>>(new Set());
//   const [saving, setSaving] = useState(false);
//   const [apiErr, setApiErr] = useState<string | null>(null);

//   useEffect(() => {
//     getEmployees({ limit: 100, status: "active" })
//       .then((r: any) => setEmployees(r.data ?? []))
//       .catch(() => {})
//       .finally(() => setLoading(false));
//   }, []);

//   const filtered = employees.filter((e) => {
//     const q = search.toLowerCase();
//     return (
//       !q ||
//       `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
//       (e.employee_code ?? "").toLowerCase().includes(q)
//     );
//   });

//   const toggle = (id: string) =>
//     setSelected((prev) => {
//       const n = new Set(prev);
//       n.has(id) ? n.delete(id) : n.add(id);
//       return n;
//     });

//   const handleAssign = async () => {
//     if (!selected.size) return;
//     setSaving(true);
//     setApiErr(null);
//     try {
//       await assignTraining(training.id, [...selected]);
//       onAssigned(selected.size);
//     } catch (e: any) {
//       setApiErr(e?.response?.data?.message ?? "Assignment failed.");
//       setSaving(false);
//     }
//   };

//   return (
//     <Modal
//       visible
//       animationType="slide"
//       transparent
//       statusBarTranslucent
//       onRequestClose={onClose}
//     >
//       <View style={s.overlay}>
//         <View style={s.sheet}>
//           <View style={s.sheetHeader}>
//             <View style={{ flex: 1 }}>
//               <Text style={s.assignEyebrow}>Assign Training</Text>
//               <Text style={s.sheetTitle} numberOfLines={1}>
//                 {training.title}
//               </Text>
//             </View>
//             <Pressable onPress={onClose} hitSlop={8}>
//               <X size={18} color={C.textMuted} />
//             </Pressable>
//           </View>

//           <View style={s.searchRow}>
//             <SearchIcon size={14} color={C.textMuted} />
//             <TextInput
//               value={search}
//               onChangeText={setSearch}
//               placeholder="Search employees…"
//               placeholderTextColor={C.textMuted}
//               style={s.searchInput}
//             />
//           </View>
//           {selected.size > 0 && (
//             <Text style={s.selectedCount}>{selected.size} selected</Text>
//           )}

//           <View style={{ maxHeight: 320 }}>
//             {loading ? (
//               <View style={{ paddingVertical: 24 }}>
//                 <ActivityIndicator size="small" color={C.primary} />
//               </View>
//             ) : (
//               <View style={{ gap: 2 }}>
//                 {filtered.map((emp) => {
//                   const isSelected = selected.has(emp.id);
//                   const name = `${emp.first_name} ${emp.last_name}`;
//                   return (
//                     <Pressable
//                       key={emp.id}
//                       onPress={() => toggle(emp.id)}
//                       style={[
//                         s.empRow,
//                         isSelected && { backgroundColor: C.primaryLight },
//                       ]}
//                     >
//                       <View
//                         style={[
//                           s.checkbox,
//                           isSelected && {
//                             backgroundColor: C.primary,
//                             borderColor: C.primary,
//                           },
//                         ]}
//                       >
//                         {isSelected && <Check size={10} color="#fff" />}
//                       </View>
//                       <View style={s.empAvatar}>
//                         <Text style={s.empAvatarText}>{initials(name)}</Text>
//                       </View>
//                       <View style={{ flex: 1, minWidth: 0 }}>
//                         <Text style={s.empName} numberOfLines={1}>
//                           {name}
//                         </Text>
//                         <Text style={s.empMeta} numberOfLines={1}>
//                           {emp.employee_code} · {emp.department_name ?? "—"}
//                         </Text>
//                       </View>
//                     </Pressable>
//                   );
//                 })}
//               </View>
//             )}
//           </View>

//           {apiErr ? <Text style={s.fieldError}>{apiErr}</Text> : null}

//           <View style={s.modalActions}>
//             <Pressable onPress={onClose} style={s.cancelBtn}>
//               <Text style={s.cancelBtnText}>Cancel</Text>
//             </Pressable>
//             <Pressable
//               onPress={handleAssign}
//               disabled={saving || !selected.size}
//               style={[s.saveBtn, !selected.size && { opacity: 0.5 }]}
//             >
//               {saving ? (
//                 <ActivityIndicator size="small" color="#fff" />
//               ) : (
//                 <>
//                   <UserPlus size={13} color="#fff" />
//                   <Text style={s.saveBtnText}>
//                     Assign {selected.size > 0 ? `(${selected.size})` : ""}
//                   </Text>
//                 </>
//               )}
//             </Pressable>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const s = StyleSheet.create({
//   filterRow: { flexDirection: "row", gap: 6 },
//   filterPill: {
//     paddingHorizontal: 14,
//     paddingVertical: 7,
//     borderRadius: 10,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   filterPillActive: { backgroundColor: C.primary, borderColor: C.primary },
//   filterPillText: { fontSize: 12, fontWeight: "600", color: C.textSecondary },
//   filterPillTextActive: { color: "#fff" },

//   newBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     paddingVertical: 12,
//     borderRadius: 14,
//     backgroundColor: C.primary,
//   },
//   newBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },

//   center: { alignItems: "center", gap: 10, paddingVertical: 48 },
//   emptyText: { fontSize: 13, color: C.textMuted },
//   errorBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     padding: 12,
//     borderRadius: 12,
//     backgroundColor: "#FEF2F2",
//   },
//   errorText: { fontSize: 12, color: C.danger, flex: 1 },

//   card: {
//     borderRadius: 16,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     overflow: "hidden",
//   },
//   cardBar: { height: 4, width: "100%" },
//   cardBody: { padding: 14, gap: 8 },
//   cardTop: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
//   title: { flex: 1, fontSize: 14, fontWeight: "700", color: C.textPrimary },
//   provider: { fontSize: 12, color: C.textSecondary },

//   metaRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingTop: 8,
//     borderTopWidth: 1,
//     borderTopColor: C.border,
//   },
//   metaText: { fontSize: 12, fontWeight: "600", color: C.textPrimary },
//   enrolledRow: { flexDirection: "row", alignItems: "center", gap: 4 },
//   enrolledText: { fontSize: 11, color: C.textMuted },

//   assignBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 5,
//     alignSelf: "flex-start",
//     paddingHorizontal: 12,
//     paddingVertical: 7,
//     borderRadius: 10,
//     backgroundColor: C.primaryLight,
//   },
//   assignBtnText: { fontSize: 11, fontWeight: "700", color: C.primary },

//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.4)",
//     justifyContent: "flex-end",
//   },
//   sheet: {
//     maxHeight: "92%",
//     backgroundColor: C.surface,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 20,
//     gap: 14,
//   },
//   sheetHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     gap: 10,
//   },
//   sheetTitle: { fontSize: 16, fontWeight: "800", color: C.textPrimary },
//   assignEyebrow: {
//     fontSize: 10,
//     fontWeight: "700",
//     color: C.textMuted,
//     textTransform: "uppercase",
//     marginBottom: 2,
//   },

//   fieldLabel: {
//     fontSize: 11,
//     fontWeight: "700",
//     color: C.textPrimary,
//     marginBottom: 6,
//   },
//   fieldError: {
//     fontSize: 11,
//     fontWeight: "600",
//     color: C.danger,
//     marginTop: 4,
//   },
//   input: {
//     paddingHorizontal: 14,
//     paddingVertical: 11,
//     borderRadius: 12,
//     fontSize: 14,
//     color: C.textPrimary,
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1.5,
//     borderColor: C.border,
//   },
//   textarea: { height: 64, textAlignVertical: "top" },
//   row2: { flexDirection: "row", gap: 12 },

//   typeToggle: {
//     flexDirection: "row",
//     backgroundColor: C.surfaceAlt,
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: C.border,
//     padding: 3,
//   },
//   typeToggleBtn: {
//     flex: 1,
//     paddingVertical: 8,
//     borderRadius: 9,
//     alignItems: "center",
//   },
//   typeToggleText: { fontSize: 12, fontWeight: "700", color: C.textSecondary },

//   searchRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderRadius: 12,
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1.5,
//     borderColor: C.border,
//   },
//   searchInput: { flex: 1, fontSize: 13, color: C.textPrimary, padding: 0 },
//   selectedCount: { fontSize: 12, fontWeight: "700", color: C.primary },

//   empRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     padding: 8,
//     borderRadius: 12,
//   },
//   checkbox: {
//     width: 20,
//     height: 20,
//     borderRadius: 6,
//     borderWidth: 1.5,
//     borderColor: C.border,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   empAvatar: {
//     width: 32,
//     height: 32,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.primary,
//   },
//   empAvatarText: { color: "#fff", fontSize: 11, fontWeight: "800" },
//   empName: { fontSize: 13, fontWeight: "600", color: C.textPrimary },
//   empMeta: { fontSize: 10, color: C.textMuted, marginTop: 1 },

//   modalActions: { flexDirection: "row", gap: 10 },
//   cancelBtn: {
//     flex: 1,
//     paddingVertical: 13,
//     borderRadius: 14,
//     alignItems: "center",
//     backgroundColor: C.surfaceAlt,
//   },
//   cancelBtnText: { fontSize: 14, fontWeight: "700", color: C.textSecondary },
//   saveBtn: {
//     flex: 1,
//     flexDirection: "row",
//     gap: 6,
//     paddingVertical: 13,
//     borderRadius: 14,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.primary,
//   },
//   saveBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },
// });


// src/components/admin/training/TrainingCatalogView.tsx
// Mobile equivalent of TrainingCatalog.jsx — training programs as cards,
// with a create-training bottom sheet and an assign-employees bottom sheet.

import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import {
  Plus,
  X,
  Save,
  GraduationCap,
  Users,
  UserPlus,
  Check,
  Search as SearchIcon,
  AlertCircle,
} from "lucide-react-native";

import C from "../../../styles/colors";
import {
  listTrainings,
  createTraining,
  assignTraining,
} from "../../../api/service/trainingApi";
import { getEmployees } from "../../../api/service/employeeApi";
import StatusChip from "../attendance/StatusChip";
import {
  TRAINING_TYPE_CFG,
  fmtNairaCompact,
  fmtShortDate,
  initials,
} from "../../../hooks/trainingHelpers";
import { Loader } from "../../../hooks/loaderManager";

const EMPTY_FORM = {
  title: "",
  type: "Internal" as "Internal" | "External",
  provider: "",
  description: "",
  startDate: "",
  endDate: "",
  location: "",
  link: "",
  cost: "",
  maxAttendees: "",
};

interface Props {
  searchQuery: string;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function TrainingCatalogView({ searchQuery, showToast }: Props) {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"All" | "Internal" | "External">(
    "All",
  );

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState<Record<string, string>>({});
  const set = (k: keyof typeof EMPTY_FORM, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Assign modal
  const [assignTarget, setAssignTarget] = useState<any | null>(null);

  const fetchTrainings = useCallback(async () => {
    setLoading(true);
    setError(null);
    Loader.show();
    try {
      const params: any = {};
      if (filterType !== "All") params.type = filterType;
      if (searchQuery) params.search = searchQuery;
      const res = await listTrainings(params);
      setTrainings(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load trainings.");
    } finally {
      setLoading(false);
      Loader.hide();
    }
  }, [filterType, searchQuery]);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  const handleCreate = async () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Required";
    if (!form.provider.trim()) errs.provider = "Required";
    if (!form.startDate) errs.startDate = "Required";
    setFormErr(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    Loader.show();
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
      setForm(EMPTY_FORM);
      setFormErr({});
      showToast("Training created successfully.");
    } catch (e: any) {
      setFormErr({
        api: e?.response?.data?.message ?? "Failed to create training.",
      });
    } finally {
      setSaving(false);
      Loader.hide();
    }
  };

  return (
    <View style={{ gap: 14 }}>
      {/* Filters + New button */}
      <View style={s.filterRow}>
        {(["All", "Internal", "External"] as const).map((t) => {
          const active = filterType === t;
          return (
            <Pressable
              key={t}
              onPress={() => setFilterType(t)}
              style={[s.filterPill, active && s.filterPillActive]}
            >
              <Text
                style={[s.filterPillText, active && s.filterPillTextActive]}
              >
                {t}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable onPress={() => setShowCreate(true)} style={s.newBtn}>
        <Plus size={14} color="#fff" />
        <Text style={s.newBtnText}>New Training Program</Text>
      </Pressable>

      {/* List */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : error ? (
        <View style={s.errorBox}>
          <AlertCircle size={16} color={C.danger} />
          <Text style={s.errorText}>{error}</Text>
        </View>
      ) : trainings.length === 0 ? (
        <View style={s.center}>
          <GraduationCap size={28} color={C.textMuted} />
          <Text style={s.emptyText}>No trainings found.</Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {trainings.map((training) => {
            const typeCfg =
              TRAINING_TYPE_CFG[training.type] ?? TRAINING_TYPE_CFG.Internal;
            return (
              <View key={training.id} style={s.card}>
                <View
                  style={[
                    s.cardBar,
                    { backgroundColor: typeCfg.color },
                  ]}
                />
                <View style={s.cardBody}>
                  <View style={s.cardTop}>
                    <Text style={s.title} numberOfLines={2}>
                      {training.title}
                    </Text>
                    <StatusChip
                      label={training.type}
                      color={typeCfg.color}
                      bg={typeCfg.bg}
                    />
                  </View>
                  <Text style={s.provider} numberOfLines={1}>
                    {training.provider}
                  </Text>

                  <View style={s.metaRow}>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      {training.cost ? (
                        <Text style={s.metaText}>
                          {fmtNairaCompact(training.cost)}
                        </Text>
                      ) : null}
                      {training.start_date ? (
                        <Text style={[s.metaText, { color: C.textMuted }]}>
                          {fmtShortDate(training.start_date)}
                        </Text>
                      ) : null}
                    </View>
                    <View style={s.enrolledRow}>
                      <Users size={11} color={C.textMuted} />
                      <Text style={s.enrolledText}>
                        {training.enrolled_count ?? 0}/
                        {training.max_attendees ?? "∞"}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => setAssignTarget(training)}
                    style={s.assignBtn}
                  >
                    <UserPlus size={12} color={C.primary} />
                    <Text style={s.assignBtnText}>Assign</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Create Modal */}
      <Modal
        visible={showCreate}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => !saving && setShowCreate(false)}
      >
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>New Training Program</Text>
              <Pressable
                onPress={() => !saving && setShowCreate(false)}
                hitSlop={8}
              >
                <X size={18} color={C.textMuted} />
              </Pressable>
            </View>

            {formErr.api ? (
              <View style={s.errorBox}>
                <AlertCircle size={14} color={C.danger} />
                <Text style={s.errorText}>{formErr.api}</Text>
              </View>
            ) : null}

            <Field label="Training Title" required error={formErr.title}>
              <TextInput
                value={form.title}
                onChangeText={(t) => set("title", t)}
                placeholder="e.g. Advanced Python for Data Science"
                placeholderTextColor={C.textMuted}
                style={s.input}
              />
            </Field>

            <View style={s.row2}>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>Type</Text>
                <View style={s.typeToggle}>
                  {(["Internal", "External"] as const).map((t) => {
                    const active = form.type === t;
                    return (
                      <Pressable
                        key={t}
                        onPress={() => set("type", t)}
                        style={[
                          s.typeToggleBtn,
                          active && { backgroundColor: C.primary },
                        ]}
                      >
                        <Text
                          style={[
                            s.typeToggleText,
                            active && { color: "#fff" },
                          ]}
                        >
                          {t}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Provider" required error={formErr.provider}>
                  <TextInput
                    value={form.provider}
                    onChangeText={(t) => set("provider", t)}
                    placeholder="e.g. Coursera"
                    placeholderTextColor={C.textMuted}
                    style={s.input}
                  />
                </Field>
              </View>
            </View>

            <Field label="Description">
              <TextInput
                value={form.description}
                onChangeText={(t) => set("description", t)}
                placeholder="Brief overview of training objectives…"
                placeholderTextColor={C.textMuted}
                multiline
                numberOfLines={2}
                style={[s.input, s.textarea]}
              />
            </Field>

            <View style={s.row2}>
              <View style={{ flex: 1 }}>
                <Field label="Start Date" required error={formErr.startDate}>
                  <TextInput
                    value={form.startDate}
                    onChangeText={(t) => set("startDate", t)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={C.textMuted}
                    style={s.input}
                  />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="End Date">
                  <TextInput
                    value={form.endDate}
                    onChangeText={(t) => set("endDate", t)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={C.textMuted}
                    style={s.input}
                  />
                </Field>
              </View>
            </View>

            <View style={s.row2}>
              <View style={{ flex: 1 }}>
                <Field label="Cost (₦)">
                  <TextInput
                    value={form.cost}
                    onChangeText={(t) => set("cost", t)}
                    placeholder="450000"
                    placeholderTextColor={C.textMuted}
                    keyboardType="numeric"
                    style={s.input}
                  />
                </Field>
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Max Attendees">
                  <TextInput
                    value={form.maxAttendees}
                    onChangeText={(t) => set("maxAttendees", t)}
                    placeholder="25"
                    placeholderTextColor={C.textMuted}
                    keyboardType="numeric"
                    style={s.input}
                  />
                </Field>
              </View>
            </View>

            <Field label="Location / Virtual Link">
              <TextInput
                value={form.location}
                onChangeText={(t) => set("location", t)}
                placeholder="Lagos Office or https://zoom.us/…"
                placeholderTextColor={C.textMuted}
                style={s.input}
              />
            </Field>

            <View style={s.modalActions}>
              <Pressable
                onPress={() => setShowCreate(false)}
                style={s.cancelBtn}
              >
                <Text style={s.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleCreate}
                disabled={saving}
                style={s.saveBtn}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Save size={13} color="#fff" />
                    <Text style={s.saveBtnText}>Create Training</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Assign Modal */}
      {assignTarget && (
        <AssignModal
          training={assignTarget}
          onClose={() => setAssignTarget(null)}
          onAssigned={(count) => {
            setAssignTarget(null);
            showToast(
              `${count} employee${count !== 1 ? "s" : ""} assigned successfully.`,
            );
            fetchTrainings();
          }}
        />
      )}
    </View>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View>
      <Text style={s.fieldLabel}>
        {label} {required && <Text style={{ color: C.danger }}>*</Text>}
      </Text>
      {children}
      {error ? <Text style={s.fieldError}>{error}</Text> : null}
    </View>
  );
}

function AssignModal({
  training,
  onClose,
  onAssigned,
}: {
  training: any;
  onClose: () => void;
  onAssigned: (count: number) => void;
}) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [apiErr, setApiErr] = useState<string | null>(null);

  useEffect(() => {
    Loader.show();
    getEmployees({ limit: 100, status: "active" })
      .then((r: any) => setEmployees(r.data ?? []))
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        Loader.hide();
      });
  }, []);

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      !q ||
      `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
      (e.employee_code ?? "").toLowerCase().includes(q)
    );
  });

  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const handleAssign = async () => {
    if (!selected.size) return;
    setSaving(true);
    setApiErr(null);
    Loader.show();
    try {
      await assignTraining(training.id, [...selected]);
      onAssigned(selected.size);
    } catch (e: any) {
      setApiErr(e?.response?.data?.message ?? "Assignment failed.");
      setSaving(false);
    } finally {
      Loader.hide();
    }
  };

  return (
    <Modal
      visible
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.sheetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={s.assignEyebrow}>Assign Training</Text>
              <Text style={s.sheetTitle} numberOfLines={1}>
                {training.title}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={18} color={C.textMuted} />
            </Pressable>
          </View>

          <View style={s.searchRow}>
            <SearchIcon size={14} color={C.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search employees…"
              placeholderTextColor={C.textMuted}
              style={s.searchInput}
            />
          </View>
          {selected.size > 0 && (
            <Text style={s.selectedCount}>{selected.size} selected</Text>
          )}

          <View style={{ maxHeight: 320 }}>
            {loading ? (
              <View style={{ paddingVertical: 24 }}>
                <ActivityIndicator size="small" color={C.primary} />
              </View>
            ) : (
              <View style={{ gap: 2 }}>
                {filtered.map((emp) => {
                  const isSelected = selected.has(emp.id);
                  const name = `${emp.first_name} ${emp.last_name}`;
                  return (
                    <Pressable
                      key={emp.id}
                      onPress={() => toggle(emp.id)}
                      style={[
                        s.empRow,
                        isSelected && { backgroundColor: C.primaryLight },
                      ]}
                    >
                      <View
                        style={[
                          s.checkbox,
                          isSelected && {
                            backgroundColor: C.primary,
                            borderColor: C.primary,
                          },
                        ]}
                      >
                        {isSelected && <Check size={10} color="#fff" />}
                      </View>
                      <View style={s.empAvatar}>
                        <Text style={s.empAvatarText}>{initials(name)}</Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={s.empName} numberOfLines={1}>
                          {name}
                        </Text>
                        <Text style={s.empMeta} numberOfLines={1}>
                          {emp.employee_code} · {emp.department_name ?? "—"}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {apiErr ? <Text style={s.fieldError}>{apiErr}</Text> : null}

          <View style={s.modalActions}>
            <Pressable onPress={onClose} style={s.cancelBtn}>
              <Text style={s.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleAssign}
              disabled={saving || !selected.size}
              style={[s.saveBtn, !selected.size && { opacity: 0.5 }]}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <UserPlus size={13} color="#fff" />
                  <Text style={s.saveBtnText}>
                    Assign {selected.size > 0 ? `(${selected.size})` : ""}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  filterRow: { flexDirection: "row", gap: 6 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterPillActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterPillText: { fontSize: 12, fontWeight: "600", color: C.textSecondary },
  filterPillTextActive: { color: "#fff" },

  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  newBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },

  center: { alignItems: "center", gap: 10, paddingVertical: 48 },
  emptyText: { fontSize: 13, color: C.textMuted },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
  },
  errorText: { fontSize: 12, color: C.danger, flex: 1 },

  card: {
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  cardBar: { height: 4, width: "100%" },
  cardBody: { padding: 14, gap: 8 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  title: { flex: 1, fontSize: 14, fontWeight: "700", color: C.textPrimary },
  provider: { fontSize: 12, color: C.textSecondary },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  metaText: { fontSize: 12, fontWeight: "600", color: C.textPrimary },
  enrolledRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  enrolledText: { fontSize: 11, color: C.textMuted },

  assignBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: C.primaryLight,
  },
  assignBtnText: { fontSize: 11, fontWeight: "700", color: C.primary },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "92%",
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 14,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  sheetTitle: { fontSize: 16, fontWeight: "800", color: C.textPrimary },
  assignEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    marginBottom: 2,
  },

  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textPrimary,
    marginBottom: 6,
  },
  fieldError: { fontSize: 11, fontWeight: "600", color: C.danger, marginTop: 4 },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    fontSize: 14,
    color: C.textPrimary,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  textarea: { height: 64, textAlignVertical: "top" },
  row2: { flexDirection: "row", gap: 12 },

  typeToggle: {
    flexDirection: "row",
    backgroundColor: C.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 3,
  },
  typeToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: "center",
  },
  typeToggleText: { fontSize: 12, fontWeight: "700", color: C.textSecondary },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  searchInput: { flex: 1, fontSize: 13, color: C.textPrimary, padding: 0 },
  selectedCount: { fontSize: 12, fontWeight: "700", color: C.primary },

  empRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 8,
    borderRadius: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  empAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
  },
  empAvatarText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  empName: { fontSize: 13, fontWeight: "600", color: C.textPrimary },
  empMeta: { fontSize: 10, color: C.textMuted, marginTop: 1 },

  modalActions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.surfaceAlt,
  },
  cancelBtnText: { fontSize: 14, fontWeight: "700", color: C.textSecondary },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
  },
  saveBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },
});