
// // src/components/admin/attendance/ShiftManagementView.tsx
// // Mobile equivalent of ShiftManagement.jsx.
// //
// // CHANGES:
// //  • Delete shift with Alert confirmation.
// //  • "Applies To" toggle: organization-wide OR specific employees.
// //  • Employee multi-select with search inside the create/edit modal.
// //  • Payload now sends assignmentType + employeeIds when applicable.

// import { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   TextInput,
//   Modal,
//   Alert,
//   ScrollView,
// } from "react-native";
// import { Plus, Edit2, Trash2, X, CalendarClock, Clock, Timer, Search } from "lucide-react-native";
// import { getEmployees } from "../../../api/service/employeeApi"; 
// import C from "../../../styles/colors";
// import { attendanceApi } from "../../../api/service/attendanceApi";
// import StatusChip from "./StatusChip";
// import { fmtTime, fmtHours, initials } from "../../../hooks/attendanceHelpers";
// import { Loader } from "../../../hooks/loaderManager";

// const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// const SCHEDULE_TYPES = [
//   { value: "fixed", label: "Fixed Hours" },
//   { value: "hours_target", label: "Hours-Based" },
// ] as const;

// const ASSIGNMENT_TYPES = [
//   { value: "organization", label: "Organization-wide" },
//   { value: "employees", label: "Specific Employees" },
// ] as const;

// const EMPTY_FORM = {
//   name: "",
//   description: "",
//   scheduleType: "fixed" as "fixed" | "hours_target",
//   startTime: "",
//   endTime: "",
//   targetHoursPerDay: "",
//   graceMinutesBefore: "30",
//   lateGraceMinutes: "15",
//   days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
//   assignmentType: "organization" as "organization" | "employees",
//   selectedEmployees: [] as string[],
// };

// function getScheduleType(shift: any): "fixed" | "hours_target" {
//   return shift.schedule_type ?? shift.scheduleType ?? "fixed";
// }

// function shiftType(shift: any) {
//   if (getScheduleType(shift) === "hours_target") {
//     return { label: "Hours-Based", bg: "#EDE9FE", color: "#8B5CF6" };
//   }
//   const h = parseInt(
//     (shift.start_time ?? shift.startTime ?? "08:00").split(":")[0],
//     10,
//   );
//   if (h < 6) return { label: "Night", bg: "#FEE2E2", color: "#EF4444" };
//   if (h < 12) return { label: "Morning", bg: "#D1FAE5", color: "#10B981" };
//   if (h < 17) return { label: "Afternoon", bg: "#FEF3C7", color: "#F59E0B" };
//   return { label: "Evening", bg: "#EDE9FE", color: "#8B5CF6" };
// }

// interface Props {
//   showToast: (msg: string, type?: "success" | "error" | "info") => void;
// }

// export default function ShiftManagementView({ showToast }: Props) {
//   const [shifts, setShifts] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const [showModal, setShowModal] = useState(false);
//   const [editing, setEditing] = useState<any | null>(null);
//   const [form, setForm] = useState(EMPTY_FORM);
//   const [saving, setSaving] = useState(false);
//   const [formError, setFormError] = useState("");

//   // Employee picker state
//   const [employees, setEmployees] = useState<any[]>([]);
//   const [employeeSearch, setEmployeeSearch] = useState("");
//   const [employeesLoading, setEmployeesLoading] = useState(false);

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     Loader.show();
//     try {
//       const res = await attendanceApi.getShifts();
//       setShifts(res.shifts ?? []);
//     } catch {
//       setError("Failed to load shifts.");
//     } finally {
//       setLoading(false);
//       Loader.hide();
//     }
//   }, []);
//   useEffect(() => {
//     load();
//   }, [load]);

//   // Fetch employees once for the picker
//   // const loadEmployees = useCallback(async () => {
//   //   setEmployeesLoading(true);
//   //   try {
//   //     // TODO: wire this to your employee API if not in attendanceApi
//   //     const res = await attendanceApi.getEmployees?.();
//   //     setEmployees(res?.employees ?? res?.data ?? []);
//   //   } catch {
//   //     // silent — picker will just be empty
//   //   } finally {
//   //     setEmployeesLoading(false);
//   //   }
//   // }, []);

//     const loadEmployees = useCallback(async () => {
//       setEmployeesLoading(true);
//       try {
//         const res = await getEmployees(); // ← CHANGED from attendanceApi.getEmployees?.()
//         setEmployees(res?.data ?? res?.employees ?? []);
//       } catch {
//         // silent — picker will just be empty
//       } finally {
//         setEmployeesLoading(false);
//       }
//     }, []);

//   useEffect(() => {
//     loadEmployees();
//   }, [loadEmployees]);

//   const openCreate = () => {
//     setEditing(null);
//     setForm(EMPTY_FORM);
//     setEmployeeSearch("");
//     setFormError("");
//     setShowModal(true);
//   };

//   const openEdit = (shift: any) => {
//     setEditing(shift);
//     setForm({
//       name: shift.name ?? "",
//       description: shift.description ?? "",
//       scheduleType: getScheduleType(shift),
//       startTime: shift.start_time ?? shift.startTime ?? "",
//       endTime: shift.end_time ?? shift.endTime ?? "",
//       targetHoursPerDay: String(
//         shift.target_hours_per_day ?? shift.targetHoursPerDay ?? "",
//       ),
//       graceMinutesBefore: String(
//         shift.grace_minutes_before ?? shift.graceMinutesBefore ?? "30",
//       ),
//       lateGraceMinutes: String(
//         shift.late_grace_minutes ?? shift.lateGraceMinutes ?? "15",
//       ),
//       days: shift.days ?? [],
//       assignmentType:
//         shift.assignment_type ?? shift.assignmentType ?? "organization",
//       selectedEmployees: shift.employee_ids ?? shift.employeeIds ?? [],
//     });
//     setEmployeeSearch("");
//     setFormError("");
//     setShowModal(true);
//   };

//   const toggleDay = (day: string) =>
//     setForm((f) => ({
//       ...f,
//       days: f.days.includes(day)
//         ? f.days.filter((d) => d !== day)
//         : [...f.days, day],
//     }));

//   const toggleEmployee = (id: string) =>
//     setForm((f) => ({
//       ...f,
//       selectedEmployees: f.selectedEmployees.includes(id)
//         ? f.selectedEmployees.filter((e) => e !== id)
//         : [...f.selectedEmployees, id],
//     }));

//   const filteredEmployees = useMemo(() => {
//     const q = employeeSearch.trim().toLowerCase();
//     if (!q) return employees;
//     return employees.filter((e) =>
//       `${e.first_name ?? ""} ${e.last_name ?? ""} ${e.email ?? ""}`
//         .toLowerCase()
//         .includes(q),
//     );
//   }, [employees, employeeSearch]);

//   const handleSave = async () => {
//     if (!form.name.trim()) {
//       setFormError("Shift name is required.");
//       return;
//     }
//     if (form.days.length === 0) {
//       setFormError("Select at least one working day.");
//       return;
//     }

//     if (form.scheduleType === "fixed") {
//       if (!form.startTime || !form.endTime) {
//         setFormError("Start time and end time are required for a fixed shift.");
//         return;
//       }
//     } else {
//       const target = Number(form.targetHoursPerDay);
//       if (!form.targetHoursPerDay || Number.isNaN(target) || target <= 0) {
//         setFormError("Enter a valid target hours per day (e.g. 10).");
//         return;
//       }
//     }

//     if (
//       form.assignmentType === "employees" &&
//       form.selectedEmployees.length === 0
//     ) {
//       setFormError("Select at least one employee.");
//       return;
//     }

//     setSaving(true);
//     setFormError("");
//     Loader.show();

//     const basePayload =
//       form.scheduleType === "fixed"
//         ? {
//             name: form.name,
//             description: form.description,
//             scheduleType: "fixed",
//             startTime: form.startTime,
//             endTime: form.endTime,
//             graceMinutesBefore: Number(form.graceMinutesBefore || 30),
//             lateGraceMinutes: Number(form.lateGraceMinutes || 15),
//             days: form.days,
//           }
//         : {
//             name: form.name,
//             description: form.description,
//             scheduleType: "hours_target",
//             targetHoursPerDay: Number(form.targetHoursPerDay),
//             days: form.days,
//           };

//     const payload = {
//       ...basePayload,
//       assignmentType: form.assignmentType,
//       employeeIds:
//         form.assignmentType === "employees" ? form.selectedEmployees : undefined,
//     };

//     try {
//       if (editing) {
//         const res = await attendanceApi.updateShift(editing.id, payload);
//         setShifts((prev) =>
//           prev.map((s) =>
//             s.id === editing.id ? (res.shift ?? { ...s, ...payload }) : s,
//           ),
//         );
//         showToast("Shift updated");
//       } else {
//         const res = await attendanceApi.createShift(payload);
//         setShifts((prev) => [...prev, res.shift]);
//         showToast("Shift created");
//       }
//       setShowModal(false);
//     } catch (err: any) {
//       setFormError(err?.response?.data?.message ?? "Failed to save shift.");
//     } finally {
//       setSaving(false);
//       Loader.hide();
//     }
//   };

//   const confirmDelete = (shift: any) => {
//     Alert.alert(
//       "Delete Shift",
//       `Are you sure you want to delete "${shift.name}"? This cannot be undone.`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: () => handleDelete(shift.id),
//         },
//       ],
//     );
//   };

//   const handleDelete = async (id: string) => {
//     Loader.show();
//     try {
//       await attendanceApi.deleteShift(id);
//       setShifts((prev) => prev.filter((s) => s.id !== id));
//       showToast("Shift deleted", "success");
//     } catch (err: any) {
//       showToast(
//         err?.response?.data?.message ?? "Failed to delete shift.",
//         "error",
//       );
//     } finally {
//       Loader.hide();
//     }
//   };

//   return (
//     <View style={{ gap: 12 }}>
//       <View style={s.headerRow}>
//         <Text style={s.headerTitle}>Shift Patterns</Text>
//         <Pressable onPress={openCreate} style={s.newBtn}>
//           <Plus size={14} color="#fff" />
//           <Text style={s.newBtnText}>New Shift</Text>
//         </Pressable>
//       </View>

//       {error ? (
//         <Text style={s.errorText}>{error}</Text>
//       ) : loading ? null : shifts.length === 0 ? (
//         <View style={s.center}>
//           <CalendarClock size={28} color={C.textMuted} />
//           <Text style={s.emptyText}>No shifts created yet.</Text>
//         </View>
//       ) : (
//         <View style={{ gap: 10 }}>
//           {shifts.map((shift) => {
//             const type = shiftType(shift);
//             const isHoursBased = getScheduleType(shift) === "hours_target";
//             const assignedCount = shift.employee_count ?? shift.employeeIds?.length ?? 0;
//             return (
//               <View key={shift.id} style={s.card}>
//                 <View style={s.cardTop}>
//                   <View style={{ flex: 1, minWidth: 0 }}>
//                     <Text style={s.shiftName} numberOfLines={1}>
//                       {shift.name}
//                     </Text>
//                     {isHoursBased ? (
//                       <Text style={s.shiftTime}>
//                         {fmtHours(
//                           shift.target_hours_per_day ?? shift.targetHoursPerDay,
//                         )}{" "}
//                         / day — no fixed clock-in window
//                       </Text>
//                     ) : (
//                       <Text style={s.shiftTime}>
//                         {shift.start_time ?? shift.startTime} —{" "}
//                         {shift.end_time ?? shift.endTime}
//                       </Text>
//                     )}
//                     <Text style={s.shiftMeta}>
//                       {(shift.days ?? []).join(", ")} · {" "}
//                       {shift.assignment_type === "employees" || shift.assignmentType === "employees"
//                         ? `${assignedCount} employee${assignedCount === 1 ? "" : "s"}`
//                         : "Organization-wide"}
//                     </Text>
//                   </View>
//                   <StatusChip
//                     label={type.label}
//                     color={type.color}
//                     bg={type.bg}
//                   />
//                 </View>

//                 <View style={s.cardActions}>
//                   <Pressable onPress={() => openEdit(shift)} style={s.editBtn}>
//                     <Edit2 size={12} color={C.primary} />
//                     <Text style={s.editBtnText}>Edit</Text>
//                   </Pressable>
//                   <Pressable
//                     onPress={() => confirmDelete(shift)}
//                     style={s.deleteBtn}
//                   >
//                     <Trash2 size={12} color={C.danger} />
//                     <Text style={s.deleteBtnText}>Delete</Text>
//                   </Pressable>
//                 </View>
//               </View>
//             );
//           })}
//         </View>
//       )}

//       {/* Create/Edit Modal */}
//       <Modal
//         visible={showModal}
//         animationType="slide"
//         transparent
//         statusBarTranslucent
//         onRequestClose={() => setShowModal(false)}
//       >
//         <View style={s.overlay}>
//           <View style={s.sheet}>
//             <View style={s.sheetHeader}>
//               <Text style={s.sheetTitle}>
//                 {editing ? "Edit Shift" : "New Shift"}
//               </Text>
//               <Pressable onPress={() => setShowModal(false)} hitSlop={8}>
//                 <X size={18} color={C.textMuted} />
//               </Pressable>
//             </View>

//             {/* Name */}
//             <View>
//               <Text style={s.fieldLabel}>
//                 Shift Name <Text style={{ color: C.danger }}>*</Text>
//               </Text>
//               <TextInput
//                 value={form.name}
//                 onChangeText={(t) => setForm((f) => ({ ...f, name: t }))}
//                 placeholder="e.g. Morning Shift"
//                 placeholderTextColor={C.textMuted}
//                 style={s.input}
//               />
//             </View>

//             {/* Schedule type toggle */}
//             <View>
//               <Text style={s.fieldLabel}>Schedule Type</Text>
//               <View style={s.typeToggleRow}>
//                 {SCHEDULE_TYPES.map((t) => {
//                   const active = form.scheduleType === t.value;
//                   const Icon = t.value === "fixed" ? Clock : Timer;
//                   return (
//                     <Pressable
//                       key={t.value}
//                       onPress={() =>
//                         setForm((f) => ({ ...f, scheduleType: t.value }))
//                       }
//                       style={[s.typeToggleBtn, active && s.typeToggleBtnActive]}
//                     >
//                       <Icon
//                         size={14}
//                         color={active ? "#fff" : C.textSecondary}
//                       />
//                       <Text
//                         style={[
//                           s.typeToggleText,
//                           active && s.typeToggleTextActive,
//                         ]}
//                       >
//                         {t.label}
//                       </Text>
//                     </Pressable>
//                   );
//                 })}
//               </View>
//             </View>

//             {/* Fixed / Hours-based fields */}
//             {form.scheduleType === "fixed" ? (
//               <>
//                 <View style={s.timeInputsRow}>
//                   <View style={{ flex: 1 }}>
//                     <Text style={s.fieldLabel}>
//                       Start Time <Text style={{ color: C.danger }}>*</Text>
//                     </Text>
//                     <TextInput
//                       value={form.startTime}
//                       onChangeText={(t) =>
//                         setForm((f) => ({ ...f, startTime: t }))
//                       }
//                       placeholder="09:00"
//                       placeholderTextColor={C.textMuted}
//                       style={s.input}
//                     />
//                   </View>
//                   <View style={{ flex: 1 }}>
//                     <Text style={s.fieldLabel}>
//                       End Time <Text style={{ color: C.danger }}>*</Text>
//                     </Text>
//                     <TextInput
//                       value={form.endTime}
//                       onChangeText={(t) =>
//                         setForm((f) => ({ ...f, endTime: t }))
//                       }
//                       placeholder="17:00"
//                       placeholderTextColor={C.textMuted}
//                       style={s.input}
//                     />
//                   </View>
//                 </View>

//                 <View style={s.timeInputsRow}>
//                   <View style={{ flex: 1 }}>
//                     <Text style={s.fieldLabel}>Grace Before (min)</Text>
//                     <TextInput
//                       value={form.graceMinutesBefore}
//                       onChangeText={(t) =>
//                         setForm((f) => ({
//                           ...f,
//                           graceMinutesBefore: t.replace(/[^0-9]/g, ""),
//                         }))
//                       }
//                       placeholder="30"
//                       placeholderTextColor={C.textMuted}
//                       keyboardType="number-pad"
//                       style={s.input}
//                     />
//                   </View>
//                   <View style={{ flex: 1 }}>
//                     <Text style={s.fieldLabel}>Late Grace (min)</Text>
//                     <TextInput
//                       value={form.lateGraceMinutes}
//                       onChangeText={(t) =>
//                         setForm((f) => ({
//                           ...f,
//                           lateGraceMinutes: t.replace(/[^0-9]/g, ""),
//                         }))
//                       }
//                       placeholder="15"
//                       placeholderTextColor={C.textMuted}
//                       keyboardType="number-pad"
//                       style={s.input}
//                     />
//                   </View>
//                 </View>
//                 <Text style={s.helperText}>
//                   Clock-in opens {form.graceMinutesBefore || 30} min before start
//                   time. Clocking in more than {form.lateGraceMinutes || 15} min
//                   after start time is marked "late".
//                 </Text>
//               </>
//             ) : (
//               <>
//                 <View>
//                   <Text style={s.fieldLabel}>
//                     Target Hours / Day <Text style={{ color: C.danger }}>*</Text>
//                   </Text>
//                   <TextInput
//                     value={form.targetHoursPerDay}
//                     onChangeText={(t) =>
//                       setForm((f) => ({
//                         ...f,
//                         targetHoursPerDay: t.replace(/[^0-9.]/g, ""),
//                       }))
//                     }
//                     placeholder="e.g. 10"
//                     placeholderTextColor={C.textMuted}
//                     keyboardType="decimal-pad"
//                     style={s.input}
//                   />
//                 </View>
//                 <Text style={s.helperText}>
//                   No fixed clock-in window — employees on this shift can clock
//                   in any time on a working day. Overtime is calculated against
//                   this daily target instead of a start/end time.
//                 </Text>
//               </>
//             )}

//             {/* Working Days */}
//             <View>
//               <Text style={s.fieldLabel}>Working Days</Text>
//               <View style={s.daysRow}>
//                 {DAYS.map((day) => {
//                   const active = form.days.includes(day);
//                   return (
//                     <Pressable
//                       key={day}
//                       onPress={() => toggleDay(day)}
//                       style={[s.dayChip, active && s.dayChipActive]}
//                     >
//                       <Text
//                         style={[s.dayChipText, active && s.dayChipTextActive]}
//                       >
//                         {day}
//                       </Text>
//                     </Pressable>
//                   );
//                 })}
//               </View>
//             </View>

//             {/* ── NEW: Applies To toggle ── */}
//             <View>
//               <Text style={s.fieldLabel}>Applies To</Text>
//               <View style={s.typeToggleRow}>
//                 {ASSIGNMENT_TYPES.map((t) => {
//                   const active = form.assignmentType === t.value;
//                   return (
//                     <Pressable
//                       key={t.value}
//                       onPress={() =>
//                         setForm((f) => ({ ...f, assignmentType: t.value }))
//                       }
//                       style={[s.typeToggleBtn, active && s.typeToggleBtnActive]}
//                     >
//                       <Text
//                         style={[
//                           s.typeToggleText,
//                           active && s.typeToggleTextActive,
//                         ]}
//                       >
//                         {t.label}
//                       </Text>
//                     </Pressable>
//                   );
//                 })}
//               </View>
//             </View>

//             {/* ── NEW: Employee picker (only when "Specific Employees") ── */}
//             {form.assignmentType === "employees" && (
//               <View style={s.employeeSection}>
//                 <Text style={s.fieldLabel}>
//                   Selected Employees ({form.selectedEmployees.length})
//                 </Text>
//                 <View style={s.searchWrap}>
//                   <Search size={14} color={C.textMuted} />
//                   <TextInput
//                     style={s.searchInput}
//                     placeholder="Search by name or email…"
//                     placeholderTextColor={C.textMuted}
//                     value={employeeSearch}
//                     onChangeText={setEmployeeSearch}
//                   />
//                 </View>

//                 <View style={s.employeeList}>
//                   {employeesLoading ? (
//                     <Text style={s.emptyPickerText}>Loading employees…</Text>
//                   ) : filteredEmployees.length === 0 ? (
//                     <Text style={s.emptyPickerText}>No employees found.</Text>
//                   ) : (
//                     filteredEmployees.map((emp) => {
//                       const selected = form.selectedEmployees.includes(emp.id);
//                       return (
//                         <Pressable
//                           key={emp.id}
//                           onPress={() => toggleEmployee(emp.id)}
//                           style={[
//                             s.employeeRow,
//                             selected && s.employeeRowSelected,
//                           ]}
//                         >
//                           <View style={s.employeeAvatar}>
//                             <Text style={s.employeeAvatarText}>
//                               {initials(emp)}
//                             </Text>
//                           </View>
//                           <View style={{ flex: 1, minWidth: 0 }}>
//                             <Text style={s.employeeName} numberOfLines={1}>
//                               {emp.first_name} {emp.last_name}
//                             </Text>
//                             <Text style={s.employeeEmail} numberOfLines={1}>
//                               {emp.email}
//                             </Text>
//                           </View>
//                           <View
//                             style={[
//                               s.checkCircle,
//                               selected && s.checkCircleActive,
//                             ]}
//                           >
//                             {selected && (
//                               <Text style={s.checkCircleText}>✓</Text>
//                             )}
//                           </View>
//                         </Pressable>
//                       );
//                     })
//                   )}
//                 </View>
//               </View>
//             )}

//             {/* Description */}
//             <View>
//               <Text style={s.fieldLabel}>Description</Text>
//               <TextInput
//                 value={form.description}
//                 onChangeText={(t) => setForm((f) => ({ ...f, description: t }))}
//                 placeholder="Optional description…"
//                 placeholderTextColor={C.textMuted}
//                 multiline
//                 numberOfLines={2}
//                 style={[s.input, s.textarea]}
//               />
//             </View>

//             {formError ? <Text style={s.formError}>{formError}</Text> : null}

//             <View style={s.modalActions}>
//               <Pressable
//                 onPress={() => setShowModal(false)}
//                 style={s.cancelBtn}
//               >
//                 <Text style={s.cancelBtnText}>Cancel</Text>
//               </Pressable>
//               <Pressable
//                 onPress={handleSave}
//                 disabled={saving}
//                 style={[s.saveBtn, saving && s.saveBtnDisabled]}
//               >
//                 <Text style={s.saveBtnText}>
//                   {saving
//                     ? "Saving…"
//                     : editing
//                       ? "Update Shift"
//                       : "Create Shift"}
//                 </Text>
//               </Pressable>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   headerRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   headerTitle: { fontSize: 14, fontWeight: "800", color: C.textPrimary },
//   newBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     paddingHorizontal: 14,
//     paddingVertical: 9,
//     borderRadius: 12,
//     backgroundColor: C.primary,
//   },
//   newBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },

//   center: { alignItems: "center", gap: 10, paddingVertical: 48 },
//   errorText: {
//     fontSize: 13,
//     color: C.danger,
//     textAlign: "center",
//     paddingVertical: 24,
//   },
//   emptyText: { fontSize: 13, color: C.textMuted },

//   card: {
//     borderRadius: 16,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     padding: 14,
//     gap: 10,
//   },
//   cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
//   shiftName: { fontSize: 14, fontWeight: "800", color: C.textPrimary },
//   shiftTime: {
//     fontSize: 12,
//     color: C.textSecondary,
//     marginTop: 2,
//     fontFamily: "monospace",
//   },
//   shiftMeta: { fontSize: 11, color: C.textMuted, marginTop: 4 },

//   cardActions: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     marginTop: 2,
//   },
//   editBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     paddingHorizontal: 12,
//     paddingVertical: 7,
//     borderRadius: 10,
//     backgroundColor: C.primaryLight,
//   },
//   editBtnText: { fontSize: 12, fontWeight: "700", color: C.primary },
//   deleteBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     paddingHorizontal: 12,
//     paddingVertical: 7,
//     borderRadius: 10,
//     backgroundColor: "#FEE2E2",
//   },
//   deleteBtnText: { fontSize: 12, fontWeight: "700", color: "#DC2626" },

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
//   },
//   sheetTitle: { fontSize: 16, fontWeight: "800", color: C.textPrimary },

//   fieldLabel: {
//     fontSize: 11,
//     fontWeight: "700",
//     color: C.textPrimary,
//     marginBottom: 6,
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
//   textarea: { height: 70, textAlignVertical: "top" },
//   timeInputsRow: { flexDirection: "row", gap: 12 },

//   typeToggleRow: { flexDirection: "row", gap: 8 },
//   typeToggleBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     paddingVertical: 11,
//     borderRadius: 12,
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1.5,
//     borderColor: C.border,
//   },
//   typeToggleBtnActive: {
//     backgroundColor: C.primary,
//     borderColor: C.primary,
//   },
//   typeToggleText: { fontSize: 12, fontWeight: "700", color: C.textSecondary },
//   typeToggleTextActive: { color: "#fff" },

//   helperText: {
//     fontSize: 11,
//     color: C.textMuted,
//     lineHeight: 15,
//     marginTop: -4,
//   },

//   daysRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
//   dayChip: {
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 12,
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   dayChipActive: { backgroundColor: C.primary, borderColor: C.primary },
//   dayChipText: { fontSize: 12, fontWeight: "700", color: C.textSecondary },
//   dayChipTextActive: { color: "#fff" },

//   formError: { fontSize: 12, fontWeight: "600", color: C.danger },

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
//     paddingVertical: 13,
//     borderRadius: 14,
//     alignItems: "center",
//     backgroundColor: C.primary,
//   },
//   saveBtnDisabled: { opacity: 0.6 },
//   saveBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },

//   // ── Employee picker styles ──
//   employeeSection: { gap: 8 },
//   searchWrap: {
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
//   searchInput: {
//     flex: 1,
//     fontSize: 14,
//     color: C.textPrimary,
//     padding: 0,
//   },
//   employeeList: {
//     maxHeight: 220,
//     gap: 6,
//   },
//   employeeRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderRadius: 12,
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   employeeRowSelected: {
//     backgroundColor: C.primaryLight,
//     borderColor: C.primary,
//   },
//   employeeAvatar: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: C.border,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   employeeAvatarText: {
//     fontSize: 12,
//     fontWeight: "700",
//     color: C.textSecondary,
//   },
//   employeeName: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
//   employeeEmail: { fontSize: 11, color: C.textMuted },

//   checkCircle: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     borderWidth: 1.5,
//     borderColor: C.border,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   checkCircleActive: {
//     backgroundColor: C.primary,
//     borderColor: C.primary,
//   },
//   checkCircleText: { fontSize: 11, fontWeight: "800", color: "#fff" },

//   emptyPickerText: {
//     fontSize: 12,
//     color: C.textMuted,
//     textAlign: "center",
//     paddingVertical: 12,
//   },
// });

// src/components/admin/attendance/ShiftManagementView.tsx
// Mobile equivalent of ShiftManagement.jsx.
//
// CHANGES:
//  • Delete shift with Alert confirmation.
//  • "Applies To" toggle: organization-wide OR specific employees.
//  • Employee multi-select with search inside the create/edit modal.
//  • Payload now sends assignmentType + employeeIds when applicable.
//  • Employee list wrapped in ScrollView for proper scrolling.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import { Plus, Edit2, Trash2, X, CalendarClock, Clock, Timer, Search } from "lucide-react-native";
import { getEmployees } from "../../../api/service/employeeApi"; 
import C from "../../../styles/colors";
import { attendanceApi } from "../../../api/service/attendanceApi";
import StatusChip from "./StatusChip";
import { fmtTime, fmtHours, initials } from "../../../hooks/attendanceHelpers";
import { Loader } from "../../../hooks/loaderManager";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SCHEDULE_TYPES = [
  { value: "fixed", label: "Fixed Hours" },
  { value: "hours_target", label: "Hours-Based" },
] as const;

const ASSIGNMENT_TYPES = [
  { value: "organization", label: "Organization-wide" },
  { value: "employees", label: "Specific Employees" },
] as const;

const EMPTY_FORM = {
  name: "",
  description: "",
  scheduleType: "fixed" as "fixed" | "hours_target",
  startTime: "",
  endTime: "",
  targetHoursPerDay: "",
  graceMinutesBefore: "30",
  lateGraceMinutes: "15",
  days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  assignmentType: "organization" as "organization" | "employees",
  selectedEmployees: [] as string[],
};

function getScheduleType(shift: any): "fixed" | "hours_target" {
  return shift.schedule_type ?? shift.scheduleType ?? "fixed";
}

function shiftType(shift: any) {
  if (getScheduleType(shift) === "hours_target") {
    return { label: "Hours-Based", bg: "#EDE9FE", color: "#8B5CF6" };
  }
  const h = parseInt(
    (shift.start_time ?? shift.startTime ?? "08:00").split(":")[0],
    10,
  );
  if (h < 6) return { label: "Night", bg: "#FEE2E2", color: "#EF4444" };
  if (h < 12) return { label: "Morning", bg: "#D1FAE5", color: "#10B981" };
  if (h < 17) return { label: "Afternoon", bg: "#FEF3C7", color: "#F59E0B" };
  return { label: "Evening", bg: "#EDE9FE", color: "#8B5CF6" };
}

interface Props {
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function ShiftManagementView({ showToast }: Props) {
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Employee picker state
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeesLoading, setEmployeesLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    Loader.show();
    try {
      const res = await attendanceApi.getShifts();
      setShifts(res.shifts ?? []);
    } catch {
      setError("Failed to load shifts.");
    } finally {
      setLoading(false);
      Loader.hide();
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const loadEmployees = useCallback(async () => {
    setEmployeesLoading(true);
    try {
      const res = await getEmployees();
      setEmployees(res?.data ?? res?.employees ?? []);
    } catch {
      // silent — picker will just be empty
    } finally {
      setEmployeesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setEmployeeSearch("");
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (shift: any) => {
    setEditing(shift);
    setForm({
      name: shift.name ?? "",
      description: shift.description ?? "",
      scheduleType: getScheduleType(shift),
      startTime: shift.start_time ?? shift.startTime ?? "",
      endTime: shift.end_time ?? shift.endTime ?? "",
      targetHoursPerDay: String(
        shift.target_hours_per_day ?? shift.targetHoursPerDay ?? "",
      ),
      graceMinutesBefore: String(
        shift.grace_minutes_before ?? shift.graceMinutesBefore ?? "30",
      ),
      lateGraceMinutes: String(
        shift.late_grace_minutes ?? shift.lateGraceMinutes ?? "15",
      ),
      days: shift.days ?? [],
      assignmentType:
        shift.assignment_type ?? shift.assignmentType ?? "organization",
      selectedEmployees: shift.employee_ids ?? shift.employeeIds ?? [],
    });
    setEmployeeSearch("");
    setFormError("");
    setShowModal(true);
  };

  const toggleDay = (day: string) =>
    setForm((f) => ({
      ...f,
      days: f.days.includes(day)
        ? f.days.filter((d) => d !== day)
        : [...f.days, day],
    }));

  const toggleEmployee = (id: string) =>
    setForm((f) => ({
      ...f,
      selectedEmployees: f.selectedEmployees.includes(id)
        ? f.selectedEmployees.filter((e) => e !== id)
        : [...f.selectedEmployees, id],
    }));

  const filteredEmployees = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      `${e.first_name ?? ""} ${e.last_name ?? ""} ${e.email ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [employees, employeeSearch]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError("Shift name is required.");
      return;
    }
    if (form.days.length === 0) {
      setFormError("Select at least one working day.");
      return;
    }

    if (form.scheduleType === "fixed") {
      if (!form.startTime || !form.endTime) {
        setFormError("Start time and end time are required for a fixed shift.");
        return;
      }
    } else {
      const target = Number(form.targetHoursPerDay);
      if (!form.targetHoursPerDay || Number.isNaN(target) || target <= 0) {
        setFormError("Enter a valid target hours per day (e.g. 10).");
        return;
      }
    }

    if (
      form.assignmentType === "employees" &&
      form.selectedEmployees.length === 0
    ) {
      setFormError("Select at least one employee.");
      return;
    }

    setSaving(true);
    setFormError("");
    Loader.show();

    const basePayload =
      form.scheduleType === "fixed"
        ? {
            name: form.name,
            description: form.description,
            scheduleType: "fixed",
            startTime: form.startTime,
            endTime: form.endTime,
            graceMinutesBefore: Number(form.graceMinutesBefore || 30),
            lateGraceMinutes: Number(form.lateGraceMinutes || 15),
            days: form.days,
          }
        : {
            name: form.name,
            description: form.description,
            scheduleType: "hours_target",
            targetHoursPerDay: Number(form.targetHoursPerDay),
            days: form.days,
          };

    const payload = {
      ...basePayload,
      assignmentType: form.assignmentType,
      employeeIds:
        form.assignmentType === "employees" ? form.selectedEmployees : undefined,
    };

    try {
      if (editing) {
        const res = await attendanceApi.updateShift(editing.id, payload);
        setShifts((prev) =>
          prev.map((s) =>
            s.id === editing.id ? (res.shift ?? { ...s, ...payload }) : s,
          ),
        );
        showToast("Shift updated");
      } else {
        const res = await attendanceApi.createShift(payload);
        setShifts((prev) => [...prev, res.shift]);
        showToast("Shift created");
      }
      setShowModal(false);
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? "Failed to save shift.");
    } finally {
      setSaving(false);
      Loader.hide();
    }
  };

  const confirmDelete = (shift: any) => {
    Alert.alert(
      "Delete Shift",
      `Are you sure you want to delete "${shift.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDelete(shift.id),
        },
      ],
    );
  };

  const handleDelete = async (id: string) => {
    Loader.show();
    try {
      await attendanceApi.deleteShift(id);
      setShifts((prev) => prev.filter((s) => s.id !== id));
      showToast("Shift deleted", "success");
    } catch (err: any) {
      showToast(
        err?.response?.data?.message ?? "Failed to delete shift.",
        "error",
      );
    } finally {
      Loader.hide();
    }
  };

  return (
    <View style={{ gap: 12 }}>
      <View style={s.headerRow}>
        <Text style={s.headerTitle}>Shift Patterns</Text>
        <Pressable onPress={openCreate} style={s.newBtn}>
          <Plus size={14} color="#fff" />
          <Text style={s.newBtnText}>New Shift</Text>
        </Pressable>
      </View>

      {error ? (
        <Text style={s.errorText}>{error}</Text>
      ) : loading ? null : shifts.length === 0 ? (
        <View style={s.center}>
          <CalendarClock size={28} color={C.textMuted} />
          <Text style={s.emptyText}>No shifts created yet.</Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {shifts.map((shift) => {
            const type = shiftType(shift);
            const isHoursBased = getScheduleType(shift) === "hours_target";
            const assignedCount = shift.employee_count ?? shift.employeeIds?.length ?? 0;
            return (
              <View key={shift.id} style={s.card}>
                <View style={s.cardTop}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.shiftName} numberOfLines={1}>
                      {shift.name}
                    </Text>
                    {isHoursBased ? (
                      <Text style={s.shiftTime}>
                        {fmtHours(
                          shift.target_hours_per_day ?? shift.targetHoursPerDay,
                        )}{" "}
                        / day — no fixed clock-in window
                      </Text>
                    ) : (
                      <Text style={s.shiftTime}>
                        {shift.start_time ?? shift.startTime} —{" "}
                        {shift.end_time ?? shift.endTime}
                      </Text>
                    )}
                    <Text style={s.shiftMeta}>
                      {(shift.days ?? []).join(", ")} · {" "}
                      {shift.assignment_type === "employees" || shift.assignmentType === "employees"
                        ? `${assignedCount} employee${assignedCount === 1 ? "" : "s"}`
                        : "Organization-wide"}
                    </Text>
                  </View>
                  <StatusChip
                    label={type.label}
                    color={type.color}
                    bg={type.bg}
                  />
                </View>

                <View style={s.cardActions}>
                  <Pressable onPress={() => openEdit(shift)} style={s.editBtn}>
                    <Edit2 size={12} color={C.primary} />
                    <Text style={s.editBtnText}>Edit</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => confirmDelete(shift)}
                    style={s.deleteBtn}
                  >
                    <Trash2 size={12} color={C.danger} />
                    <Text style={s.deleteBtnText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Create/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={s.overlay}>
          <View style={s.sheet}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ gap: 14 }}
            >
              <View style={s.sheetHeader}>
                <Text style={s.sheetTitle}>
                  {editing ? "Edit Shift" : "New Shift"}
                </Text>
                <Pressable onPress={() => setShowModal(false)} hitSlop={8}>
                  <X size={18} color={C.textMuted} />
                </Pressable>
              </View>

              {/* Name */}
              <View>
                <Text style={s.fieldLabel}>
                  Shift Name <Text style={{ color: C.danger }}>*</Text>
                </Text>
                <TextInput
                  value={form.name}
                  onChangeText={(t) => setForm((f) => ({ ...f, name: t }))}
                  placeholder="e.g. Morning Shift"
                  placeholderTextColor={C.textMuted}
                  style={s.input}
                />
              </View>

              {/* Schedule type toggle */}
              <View>
                <Text style={s.fieldLabel}>Schedule Type</Text>
                <View style={s.typeToggleRow}>
                  {SCHEDULE_TYPES.map((t) => {
                    const active = form.scheduleType === t.value;
                    const Icon = t.value === "fixed" ? Clock : Timer;
                    return (
                      <Pressable
                        key={t.value}
                        onPress={() =>
                          setForm((f) => ({ ...f, scheduleType: t.value }))
                        }
                        style={[s.typeToggleBtn, active && s.typeToggleBtnActive]}
                      >
                        <Icon
                          size={14}
                          color={active ? "#fff" : C.textSecondary}
                        />
                        <Text
                          style={[
                            s.typeToggleText,
                            active && s.typeToggleTextActive,
                          ]}
                        >
                          {t.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Fixed / Hours-based fields */}
              {form.scheduleType === "fixed" ? (
                <>
                  <View style={s.timeInputsRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.fieldLabel}>
                        Start Time <Text style={{ color: C.danger }}>*</Text>
                      </Text>
                      <TextInput
                        value={form.startTime}
                        onChangeText={(t) =>
                          setForm((f) => ({ ...f, startTime: t }))
                        }
                        placeholder="09:00"
                        placeholderTextColor={C.textMuted}
                        style={s.input}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.fieldLabel}>
                        End Time <Text style={{ color: C.danger }}>*</Text>
                      </Text>
                      <TextInput
                        value={form.endTime}
                        onChangeText={(t) =>
                          setForm((f) => ({ ...f, endTime: t }))
                        }
                        placeholder="17:00"
                        placeholderTextColor={C.textMuted}
                        style={s.input}
                      />
                    </View>
                  </View>

                  <View style={s.timeInputsRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.fieldLabel}>Grace Before (min)</Text>
                      <TextInput
                        value={form.graceMinutesBefore}
                        onChangeText={(t) =>
                          setForm((f) => ({
                            ...f,
                            graceMinutesBefore: t.replace(/[^0-9]/g, ""),
                          }))
                        }
                        placeholder="30"
                        placeholderTextColor={C.textMuted}
                        keyboardType="number-pad"
                        style={s.input}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.fieldLabel}>Late Grace (min)</Text>
                      <TextInput
                        value={form.lateGraceMinutes}
                        onChangeText={(t) =>
                          setForm((f) => ({
                            ...f,
                            lateGraceMinutes: t.replace(/[^0-9]/g, ""),
                          }))
                        }
                        placeholder="15"
                        placeholderTextColor={C.textMuted}
                        keyboardType="number-pad"
                        style={s.input}
                      />
                    </View>
                  </View>
                  <Text style={s.helperText}>
                    Clock-in opens {form.graceMinutesBefore || 30} min before start
                    time. Clocking in more than {form.lateGraceMinutes || 15} min
                    after start time is marked "late".
                  </Text>
                </>
              ) : (
                <>
                  <View>
                    <Text style={s.fieldLabel}>
                      Target Hours / Day <Text style={{ color: C.danger }}>*</Text>
                    </Text>
                    <TextInput
                      value={form.targetHoursPerDay}
                      onChangeText={(t) =>
                        setForm((f) => ({
                          ...f,
                          targetHoursPerDay: t.replace(/[^0-9.]/g, ""),
                        }))
                      }
                      placeholder="e.g. 10"
                      placeholderTextColor={C.textMuted}
                      keyboardType="decimal-pad"
                      style={s.input}
                    />
                  </View>
                  <Text style={s.helperText}>
                    No fixed clock-in window — employees on this shift can clock
                    in any time on a working day. Overtime is calculated against
                    this daily target instead of a start/end time.
                  </Text>
                </>
              )}

              {/* Working Days */}
              <View>
                <Text style={s.fieldLabel}>Working Days</Text>
                <View style={s.daysRow}>
                  {DAYS.map((day) => {
                    const active = form.days.includes(day);
                    return (
                      <Pressable
                        key={day}
                        onPress={() => toggleDay(day)}
                        style={[s.dayChip, active && s.dayChipActive]}
                      >
                        <Text
                          style={[s.dayChipText, active && s.dayChipTextActive]}
                        >
                          {day}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Applies To toggle */}
              <View>
                <Text style={s.fieldLabel}>Applies To</Text>
                <View style={s.typeToggleRow}>
                  {ASSIGNMENT_TYPES.map((t) => {
                    const active = form.assignmentType === t.value;
                    return (
                      <Pressable
                        key={t.value}
                        onPress={() =>
                          setForm((f) => ({ ...f, assignmentType: t.value }))
                        }
                        style={[s.typeToggleBtn, active && s.typeToggleBtnActive]}
                      >
                        <Text
                          style={[
                            s.typeToggleText,
                            active && s.typeToggleTextActive,
                          ]}
                        >
                          {t.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Employee picker (only when "Specific Employees") */}
              {form.assignmentType === "employees" && (
                <View style={s.employeeSection}>
                  <Text style={s.fieldLabel}>
                    Selected Employees ({form.selectedEmployees.length})
                  </Text>
                  <View style={s.searchWrap}>
                    <Search size={14} color={C.textMuted} />
                    <TextInput
                      style={s.searchInput}
                      placeholder="Search by name or email…"
                      placeholderTextColor={C.textMuted}
                      value={employeeSearch}
                      onChangeText={setEmployeeSearch}
                    />
                  </View>

                  <ScrollView
                    style={s.employeeList}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                  >
                    {employeesLoading ? (
                      <Text style={s.emptyPickerText}>Loading employees…</Text>
                    ) : filteredEmployees.length === 0 ? (
                      <Text style={s.emptyPickerText}>No employees found.</Text>
                    ) : (
                      filteredEmployees.map((emp) => {
                        const selected = form.selectedEmployees.includes(emp.id);
                        return (
                          <Pressable
                            key={emp.id}
                            onPress={() => toggleEmployee(emp.id)}
                            style={[
                              s.employeeRow,
                              selected && s.employeeRowSelected,
                            ]}
                          >
                            <View style={s.employeeAvatar}>
                              <Text style={s.employeeAvatarText}>
                                {initials(`${emp.first_name ?? ""} ${emp.last_name ?? ""}`)}
                              </Text>
                            </View>
                            <View style={{ flex: 1, minWidth: 0 }}>
                              <Text style={s.employeeName} numberOfLines={1}>
                                {emp.first_name} {emp.last_name}
                              </Text>
                              <Text style={s.employeeEmail} numberOfLines={1}>
                                {emp.email}
                              </Text>
                            </View>
                            <View
                              style={[
                                s.checkCircle,
                                selected && s.checkCircleActive,
                              ]}
                            >
                              {selected && (
                                <Text style={s.checkCircleText}>✓</Text>
                              )}
                            </View>
                          </Pressable>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
              )}

              {/* Description */}
              <View>
                <Text style={s.fieldLabel}>Description</Text>
                <TextInput
                  value={form.description}
                  onChangeText={(t) => setForm((f) => ({ ...f, description: t }))}
                  placeholder="Optional description…"
                  placeholderTextColor={C.textMuted}
                  multiline
                  numberOfLines={2}
                  style={[s.input, s.textarea]}
                />
              </View>

              {formError ? <Text style={s.formError}>{formError}</Text> : null}

              <View style={s.modalActions}>
                <Pressable
                  onPress={() => setShowModal(false)}
                  style={s.cancelBtn}
                >
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  disabled={saving}
                  style={[s.saveBtn, saving && s.saveBtnDisabled]}
                >
                  <Text style={s.saveBtnText}>
                    {saving
                      ? "Saving…"
                      : editing
                        ? "Update Shift"
                        : "Create Shift"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 14, fontWeight: "800", color: C.textPrimary },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: C.primary,
  },
  newBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },

  center: { alignItems: "center", gap: 10, paddingVertical: 48 },
  errorText: {
    fontSize: 13,
    color: C.danger,
    textAlign: "center",
    paddingVertical: 24,
  },
  emptyText: { fontSize: 13, color: C.textMuted },

  card: {
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 10,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  shiftName: { fontSize: 14, fontWeight: "800", color: C.textPrimary },
  shiftTime: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 2,
    fontFamily: "monospace",
  },
  shiftMeta: { fontSize: 11, color: C.textMuted, marginTop: 4 },

  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 2,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: C.primaryLight,
  },
  editBtnText: { fontSize: 12, fontWeight: "700", color: C.primary },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
  },
  deleteBtnText: { fontSize: 12, fontWeight: "700", color: "#DC2626" },

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
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: { fontSize: 16, fontWeight: "800", color: C.textPrimary },

  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textPrimary,
    marginBottom: 6,
  },
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
  textarea: { height: 70, textAlignVertical: "top" },
  timeInputsRow: { flexDirection: "row", gap: 12 },

  typeToggleRow: { flexDirection: "row", gap: 8 },
  typeToggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  typeToggleBtnActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  typeToggleText: { fontSize: 12, fontWeight: "700", color: C.textSecondary },
  typeToggleTextActive: { color: "#fff" },

  helperText: {
    fontSize: 11,
    color: C.textMuted,
    lineHeight: 15,
    marginTop: -4,
  },

  daysRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  dayChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  dayChipText: { fontSize: 12, fontWeight: "700", color: C.textSecondary },
  dayChipTextActive: { color: "#fff" },

  formError: { fontSize: 12, fontWeight: "600", color: C.danger },

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
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.primary,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },

  employeeSection: { gap: 8 },
  searchWrap: {
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
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.textPrimary,
    padding: 0,
  },
  employeeList: {
    maxHeight: 220,
  },
  employeeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 6,
  },
  employeeRowSelected: {
    backgroundColor: C.primaryLight,
    borderColor: C.primary,
  },
  employeeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  employeeAvatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textSecondary,
  },
  employeeName: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  employeeEmail: { fontSize: 11, color: C.textMuted },

  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircleActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  checkCircleText: { fontSize: 11, fontWeight: "800", color: "#fff" },

  emptyPickerText: {
    fontSize: 12,
    color: C.textMuted,
    textAlign: "center",
    paddingVertical: 12,
  },
});