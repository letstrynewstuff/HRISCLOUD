// // src/components/admin/attendance/AttendanceCorrectionsView.tsx
// // Mobile equivalent of AttendanceCorrections.jsx — correction requests
// // (employee-submitted clock-in/out fixes) as cards with approve/reject
// // actions, mirroring the filter + card + pagination pattern used in
// // AttendanceLogView.tsx.
// //
// // NOTE: attendanceApi method names here (getCorrections / approveCorrection /
// // rejectCorrection) are inferred from the naming conventions of the rest of
// // the service (getShifts / createShift / updateShift). Rename if your
// // backend uses different endpoints.

// import { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   TextInput,
//   Modal,
//   ActivityIndicator,
// } from "react-native";
// import { CheckCircle2, XCircle, X, FileEdit } from "lucide-react-native";

// import C from "../../../styles/colors";
// import { attendanceApi } from "../../../api/service/attendanceApi";
// import { getEmployees } from "../../../api/service/employeeApi";
// import { Loader } from "../../../hooks/loaderManager";
// import StatusChip from "./StatusChip";
// import {
//   buildEmpMap,
//   fmtDate,
//   fmtTime,
//   initials,
// } from "../../../hooks/attendanceHelpers";

// const LIMIT = 20;

// const STATUS_FILTERS = ["pending", "approved", "rejected", "all"] as const;

// const CORRECTION_STATUS_CFG: Record<
//   string,
//   { bg: string; color: string; label: string }
// > = {
//   pending: { bg: "#FEF3C7", color: "#D97706", label: "Pending" },
//   approved: { bg: "#D1FAE5", color: "#059669", label: "Approved" },
//   rejected: { bg: "#FEE2E2", color: "#DC2626", label: "Rejected" },
// };

// interface Props {
//   showToast: (msg: string, type?: "success" | "error" | "info") => void;
// }

// export default function AttendanceCorrectionsView({ showToast }: Props) {
//   const [records, setRecords] = useState<any[]>([]);
//   const [employees, setEmployees] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [filterStatus, setFilterStatus] =
//     useState<(typeof STATUS_FILTERS)[number]>("pending");
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);

//   const [actioningId, setActioningId] = useState<string | null>(null);
//   const [rejectTarget, setRejectTarget] = useState<any | null>(null);
//   const [rejectReason, setRejectReason] = useState("");
//   const [rejectSaving, setRejectSaving] = useState(false);
//   const [rejectError, setRejectError] = useState("");

//   // const load = useCallback(async () => {
//   //   setLoading(true);
//   //   setError(null);
//   //   try {
//   //     const params: any = {
//   //       page,
//   //       limit: LIMIT,
//   //       ...(filterStatus !== "all" && { status: filterStatus }),
//   //     };
//   //     const [corrRes, empRes] = await Promise.all([
//   //       attendanceApi.getCorrections(params),
//   //       getEmployees({ limit: 500 }),
//   //     ]);
//   //     setRecords(corrRes.rows ?? corrRes.corrections ?? []);
//   //     setTotal(corrRes.total ?? 0);
//   //     const empData = empRes.data ?? empRes;
//   //     setEmployees(Array.isArray(empData) ? empData : []);
//   //   } catch (err) {
//   //     setError("Failed to load correction requests.");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // }, [page, filterStatus]);
// const load = useCallback(async () => {
//   setLoading(true);
//   setError(null);
//   Loader.show();
//   try {
//     const params: any = {
//       page,
//       limit: LIMIT,
//       ...(filterStatus !== "all" && { status: filterStatus }),
//     };
//     const [corrRes, empRes] = await Promise.all([
//       attendanceApi.getCorrections(params),
//       getEmployees({ limit: 500 }),
//     ]);
//     setRecords(corrRes.rows ?? corrRes.corrections ?? []);
//     setTotal(corrRes.total ?? 0);
//     const empData = empRes.data ?? empRes;
//     setEmployees(Array.isArray(empData) ? empData : []);
//   } catch (err) {
//     setError("Failed to load correction requests.");
//   } finally {
//     setLoading(false);
//     Loader.hide();
//   }
// }, [page, filterStatus]);

//   useEffect(() => {
//     load();
//   }, [load]);

//   const empMap = useMemo(() => buildEmpMap(employees), [employees]);
//   const totalPages = Math.ceil(total / LIMIT);

//   const handleApprove = async (record: any) => {
//     setActioningId(record.id);
//     try {
//       await attendanceApi.approveCorrection(record.id);
//       setRecords((prev) => prev.filter((r) => r.id !== record.id));
//       showToast("Correction approved");
//     } catch {
//       showToast("Failed to approve correction", "error");
//     } finally {
//       setActioningId(null);
//     }
//   };

//   const openReject = (record: any) => {
//     setRejectTarget(record);
//     setRejectReason("");
//     setRejectError("");
//   };

//   const handleReject = async () => {
//     if (!rejectTarget) return;
//     if (!rejectReason.trim()) {
//       setRejectError("Please provide a reason for rejection.");
//       return;
//     }
//     setRejectSaving(true);
//     setRejectError("");
//     try {
//       await attendanceApi.rejectCorrection(rejectTarget.id, {
//         reason: rejectReason.trim(),
//       });
//       setRecords((prev) => prev.filter((r) => r.id !== rejectTarget.id));
//       showToast("Correction rejected");
//       setRejectTarget(null);
//     } catch {
//       setRejectError("Failed to reject correction.");
//     } finally {
//       setRejectSaving(false);
//     }
//   };

//   return (
//     <View style={{ gap: 14 }}>
//       {/* Filters */}
//       <View style={s.filterRow}>
//         {STATUS_FILTERS.map((st) => {
//           const active = filterStatus === st;
//           return (
//             <Pressable
//               key={st}
//               onPress={() => {
//                 setFilterStatus(st);
//                 setPage(1);
//               }}
//               style={[s.statusPill, active && s.statusPillActive]}
//             >
//               <Text
//                 style={[s.statusPillText, active && s.statusPillTextActive]}
//               >
//                 {st.charAt(0).toUpperCase() + st.slice(1)}
//               </Text>
//             </Pressable>
//           );
//         })}
//       </View>

//       {/* List */}
//       {loading ? (
//         <View style={s.center}>
//           <ActivityIndicator size="large" color={C.primary} />
//         </View>
//       ) : error ? (
//         <Text style={s.errorText}>{error}</Text>
//       ) : records.length === 0 ? (
//         <View style={s.center}>
//           <FileEdit size={28} color={C.textMuted} />
//           <Text style={s.emptyText}>No correction requests found.</Text>
//         </View>
//       ) : (
//         <View style={{ gap: 10 }}>
//           {records.map((record) => {
//             const emp = empMap[record.employeeId] ?? {};
//             const name =
//               emp.name ??
//               `${record.employee?.firstName ?? ""} ${record.employee?.lastName ?? ""}`.trim();
//             const status = (record.status ?? "pending").toLowerCase();
//             const cfg =
//               CORRECTION_STATUS_CFG[status] ?? CORRECTION_STATUS_CFG.pending;
//             const isPending = status === "pending";
//             const busy = actioningId === record.id;

//             return (
//               <View key={record.id} style={s.card}>
//                 <View style={s.cardTop}>
//                   <View style={s.avatar}>
//                     <Text style={s.avatarText}>{initials(name)}</Text>
//                   </View>
//                   <View style={{ flex: 1, minWidth: 0 }}>
//                     <Text style={s.name} numberOfLines={1}>
//                       {name}
//                     </Text>
//                     <Text style={s.dateText}>
//                       {fmtDate(record.attendanceDate)}
//                     </Text>
//                   </View>
//                   <StatusChip label={cfg.label} color={cfg.color} bg={cfg.bg} />
//                 </View>

//                 <View style={s.diffRow}>
//                   <View style={s.diffBlock}>
//                     <Text style={s.diffLabel}>Original Clock In</Text>
//                     <Text style={s.diffOld}>
//                       {fmtTime(record.originalClockIn)}
//                     </Text>
//                   </View>
//                   <View style={s.diffBlock}>
//                     <Text style={s.diffLabel}>Requested Clock In</Text>
//                     <Text style={s.diffNew}>
//                       {fmtTime(record.requestedClockIn)}
//                     </Text>
//                   </View>
//                 </View>
//                 <View style={s.diffRow}>
//                   <View style={s.diffBlock}>
//                     <Text style={s.diffLabel}>Original Clock Out</Text>
//                     <Text style={s.diffOld}>
//                       {fmtTime(record.originalClockOut)}
//                     </Text>
//                   </View>
//                   <View style={s.diffBlock}>
//                     <Text style={s.diffLabel}>Requested Clock Out</Text>
//                     <Text style={s.diffNew}>
//                       {fmtTime(record.requestedClockOut)}
//                     </Text>
//                   </View>
//                 </View>

//                 {record.reason ? (
//                   <View style={s.reasonBox}>
//                     <Text style={s.reasonLabel}>Reason</Text>
//                     <Text style={s.reasonText}>{record.reason}</Text>
//                   </View>
//                 ) : null}

//                 {status === "rejected" && record.rejectionReason ? (
//                   <View style={[s.reasonBox, s.rejectionBox]}>
//                     <Text style={[s.reasonLabel, { color: "#DC2626" }]}>
//                       Rejection Reason
//                     </Text>
//                     <Text style={s.reasonText}>{record.rejectionReason}</Text>
//                   </View>
//                 ) : null}

//                 {isPending && (
//                   <View style={s.actionsRow}>
//                     <Pressable
//                       onPress={() => openReject(record)}
//                       disabled={busy}
//                       style={s.rejectBtn}
//                     >
//                       <XCircle size={14} color="#DC2626" />
//                       <Text style={s.rejectBtnText}>Reject</Text>
//                     </Pressable>
//                     <Pressable
//                       onPress={() => handleApprove(record)}
//                       disabled={busy}
//                       style={s.approveBtn}
//                     >
//                       {busy ? (
//                         <ActivityIndicator size="small" color="#fff" />
//                       ) : (
//                         <>
//                           <CheckCircle2 size={14} color="#fff" />
//                           <Text style={s.approveBtnText}>Approve</Text>
//                         </>
//                       )}
//                     </Pressable>
//                   </View>
//                 )}
//               </View>
//             );
//           })}
//         </View>
//       )}

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <View style={s.pagination}>
//           <Text style={s.pageInfo}>
//             {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
//           </Text>
//           <View style={{ flexDirection: "row", gap: 8 }}>
//             <Pressable
//               disabled={page === 1}
//               onPress={() => setPage((p) => p - 1)}
//               style={[s.pageBtn, page === 1 && s.pageBtnDisabled]}
//             >
//               <Text
//                 style={[s.pageBtnText, page === 1 && s.pageBtnTextDisabled]}
//               >
//                 Prev
//               </Text>
//             </Pressable>
//             <Pressable
//               disabled={page === totalPages}
//               onPress={() => setPage((p) => p + 1)}
//               style={[s.pageBtn, page === totalPages && s.pageBtnDisabled]}
//             >
//               <Text
//                 style={[
//                   s.pageBtnText,
//                   page === totalPages && s.pageBtnTextDisabled,
//                 ]}
//               >
//                 Next
//               </Text>
//             </Pressable>
//           </View>
//         </View>
//       )}

//       {/* Reject Modal */}
//       <Modal
//         visible={!!rejectTarget}
//         animationType="slide"
//         transparent
//         statusBarTranslucent
//         onRequestClose={() => setRejectTarget(null)}
//       >
//         <View style={s.overlay}>
//           <View style={s.sheet}>
//             <View style={s.sheetHeader}>
//               <Text style={s.sheetTitle}>Reject Correction</Text>
//               <Pressable onPress={() => setRejectTarget(null)} hitSlop={8}>
//                 <X size={18} color={C.textMuted} />
//               </Pressable>
//             </View>

//             <View>
//               <Text style={s.fieldLabel}>
//                 Reason <Text style={{ color: C.danger }}>*</Text>
//               </Text>
//               <TextInput
//                 value={rejectReason}
//                 onChangeText={setRejectReason}
//                 placeholder="Explain why this correction is being rejected…"
//                 placeholderTextColor={C.textMuted}
//                 multiline
//                 numberOfLines={3}
//                 style={[s.input, s.textarea]}
//               />
//             </View>

//             {rejectError ? (
//               <Text style={s.formError}>{rejectError}</Text>
//             ) : null}

//             <View style={s.modalActions}>
//               <Pressable
//                 onPress={() => setRejectTarget(null)}
//                 style={s.cancelBtn}
//               >
//                 <Text style={s.cancelBtnText}>Cancel</Text>
//               </Pressable>
//               <Pressable
//                 onPress={handleReject}
//                 disabled={rejectSaving}
//                 style={s.confirmRejectBtn}
//               >
//                 {rejectSaving ? (
//                   <ActivityIndicator size="small" color="#fff" />
//                 ) : (
//                   <Text style={s.confirmRejectBtnText}>Reject Request</Text>
//                 )}
//               </Pressable>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   filterRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
//   statusPill: {
//     paddingHorizontal: 12,
//     paddingVertical: 7,
//     borderRadius: 10,
//     backgroundColor: C.surfaceAlt,
//   },
//   statusPillActive: { backgroundColor: C.primary },
//   statusPillText: { fontSize: 12, fontWeight: "600", color: C.textSecondary },
//   statusPillTextActive: { color: "#fff" },

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
//   cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
//   avatar: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.primary,
//   },
//   avatarText: { color: "#fff", fontSize: 12, fontWeight: "800" },
//   name: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
//   dateText: { fontSize: 11, color: C.textMuted, marginTop: 1 },

//   diffRow: { flexDirection: "row", gap: 10 },
//   diffBlock: {
//     flex: 1,
//     backgroundColor: C.surfaceAlt,
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//   },
//   diffLabel: {
//     fontSize: 9,
//     color: C.textMuted,
//     textTransform: "uppercase",
//     marginBottom: 2,
//   },
//   diffOld: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: C.textMuted,
//     textDecorationLine: "line-through",
//   },
//   diffNew: { fontSize: 13, fontWeight: "800", color: C.primary },

//   reasonBox: {
//     backgroundColor: C.surfaceAlt,
//     borderRadius: 10,
//     padding: 10,
//   },
//   rejectionBox: { backgroundColor: "#FEF2F2" },
//   reasonLabel: {
//     fontSize: 9,
//     fontWeight: "700",
//     color: C.textMuted,
//     textTransform: "uppercase",
//     marginBottom: 3,
//   },
//   reasonText: { fontSize: 12, color: C.textSecondary, lineHeight: 17 },

//   actionsRow: { flexDirection: "row", gap: 10 },
//   rejectBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     paddingVertical: 10,
//     borderRadius: 12,
//     backgroundColor: "#FEF2F2",
//     borderWidth: 1,
//     borderColor: "#FCA5A5",
//   },
//   rejectBtnText: { fontSize: 12, fontWeight: "700", color: "#DC2626" },
//   approveBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     paddingVertical: 10,
//     borderRadius: 12,
//     backgroundColor: "#10B981",
//   },
//   approveBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },

//   pagination: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   pageInfo: { fontSize: 11, color: C.textMuted },
//   pageBtn: {
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 10,
//     backgroundColor: C.primary,
//   },
//   pageBtnDisabled: { backgroundColor: C.surfaceAlt },
//   pageBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },
//   pageBtnTextDisabled: { color: C.textMuted },

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
//   textarea: { height: 80, textAlignVertical: "top" },

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
//   confirmRejectBtn: {
//     flex: 1,
//     paddingVertical: 13,
//     borderRadius: 14,
//     alignItems: "center",
//     backgroundColor: "#DC2626",
//   },
//   confirmRejectBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },
// });



// // src/components/admin/attendance/AttendanceCorrectionsView.tsx
// // Mobile equivalent of AttendanceCorrections.jsx — correction requests
// // (employee-submitted clock-in/out fixes) as cards with approve/reject
// // actions, mirroring the filter + card + pagination pattern used in
// // AttendanceLogView.tsx.
// //
// // Backed by /api/attendance/corrections* (attendanceExtras.controller.js),
// // exposed via attendanceApi.getCorrections / approveCorrection /
// // rejectCorrection.

// import { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   TextInput,
//   Modal,
//   ActivityIndicator,
// } from "react-native";
// import { CheckCircle2, XCircle, X, FileEdit } from "lucide-react-native";

// import C from "../../../styles/colors";
// import { attendanceApi } from "../../../api/service/attendanceApi";
// import { getEmployees } from "../../../api/service/employeeApi";
// import { Loader } from "../../../hooks/loaderManager";
// import StatusChip from "./StatusChip";
// import {
//   buildEmpMap,
//   fmtDate,
//   fmtTime,
//   initials,
// } from "../../../hooks/attendanceHelpers";

// const LIMIT = 20;

// const STATUS_FILTERS = ["pending", "approved", "rejected", "all"] as const;

// const CORRECTION_STATUS_CFG: Record<
//   string,
//   { bg: string; color: string; label: string }
// > = {
//   pending: { bg: "#FEF3C7", color: "#D97706", label: "Pending" },
//   approved: { bg: "#D1FAE5", color: "#059669", label: "Approved" },
//   rejected: { bg: "#FEE2E2", color: "#DC2626", label: "Rejected" },
// };

// interface Props {
//   showToast: (msg: string, type?: "success" | "error" | "info") => void;
// }

// export default function AttendanceCorrectionsView({ showToast }: Props) {
//   const [records, setRecords] = useState<any[]>([]);
//   const [employees, setEmployees] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [filterStatus, setFilterStatus] =
//     useState<(typeof STATUS_FILTERS)[number]>("pending");
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);

//   const [actioningId, setActioningId] = useState<string | null>(null);
//   const [rejectTarget, setRejectTarget] = useState<any | null>(null);
//   const [rejectReason, setRejectReason] = useState("");
//   const [rejectSaving, setRejectSaving] = useState(false);
//   const [rejectError, setRejectError] = useState("");

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     Loader.show();
//     try {
//       const params: any = {
//         page,
//         limit: LIMIT,
//         ...(filterStatus !== "all" && { status: filterStatus }),
//       };
//       const [corrRes, empRes] = await Promise.all([
//         attendanceApi.getCorrections(params),
//         getEmployees({ limit: 500 }),
//       ]);
//       setRecords(corrRes.rows ?? corrRes.corrections ?? []);
//       setTotal(corrRes.total ?? 0);
//       const empData = empRes.data ?? empRes;
//       setEmployees(Array.isArray(empData) ? empData : []);
//     } catch (err) {
//       setError("Failed to load correction requests.");
//     } finally {
//       setLoading(false);
//       Loader.hide();
//     }
//   }, [page, filterStatus]);

//   useEffect(() => {
//     load();
//   }, [load]);

//   const empMap = useMemo(() => buildEmpMap(employees), [employees]);
//   const totalPages = Math.ceil(total / LIMIT);

//   const handleApprove = async (record: any) => {
//     setActioningId(record.id);
//     Loader.show();
//     try {
//       await attendanceApi.approveCorrection(record.id);
//       setRecords((prev) => prev.filter((r) => r.id !== record.id));
//       showToast("Correction approved");
//     } catch {
//       showToast("Failed to approve correction", "error");
//     } finally {
//       setActioningId(null);
//       Loader.hide();
//     }
//   };

//   const openReject = (record: any) => {
//     setRejectTarget(record);
//     setRejectReason("");
//     setRejectError("");
//   };

//   const handleReject = async () => {
//     if (!rejectTarget) return;
//     if (!rejectReason.trim()) {
//       setRejectError("Please provide a reason for rejection.");
//       return;
//     }
//     setRejectSaving(true);
//     setRejectError("");
//     Loader.show();
//     try {
//       await attendanceApi.rejectCorrection(rejectTarget.id, {
//         reason: rejectReason.trim(),
//       });
//       setRecords((prev) => prev.filter((r) => r.id !== rejectTarget.id));
//       showToast("Correction rejected");
//       setRejectTarget(null);
//     } catch {
//       setRejectError("Failed to reject correction.");
//     } finally {
//       setRejectSaving(false);
//       Loader.hide();
//     }
//   };

//   return (
//     <View style={{ gap: 14 }}>
//       {/* Filters */}
//       <View style={s.filterRow}>
//         {STATUS_FILTERS.map((st) => {
//           const active = filterStatus === st;
//           return (
//             <Pressable
//               key={st}
//               onPress={() => {
//                 setFilterStatus(st);
//                 setPage(1);
//               }}
//               style={[s.statusPill, active && s.statusPillActive]}
//             >
//               <Text
//                 style={[s.statusPillText, active && s.statusPillTextActive]}
//               >
//                 {st.charAt(0).toUpperCase() + st.slice(1)}
//               </Text>
//             </Pressable>
//           );
//         })}
//       </View>

//       {/* List */}
//       {loading ? (
//         <View style={s.center}>
//           <ActivityIndicator size="large" color={C.primary} />
//         </View>
//       ) : error ? (
//         <Text style={s.errorText}>{error}</Text>
//       ) : records.length === 0 ? (
//         <View style={s.center}>
//           <FileEdit size={28} color={C.textMuted} />
//           <Text style={s.emptyText}>No correction requests found.</Text>
//         </View>
//       ) : (
//         <View style={{ gap: 10 }}>
//           {records.map((record) => {
//             const emp = empMap[record.employeeId] ?? {};
//             const name =
//               emp.name ??
//               `${record.employee?.firstName ?? ""} ${record.employee?.lastName ?? ""}`.trim();
//             const status = (record.status ?? "pending").toLowerCase();
//             const cfg =
//               CORRECTION_STATUS_CFG[status] ?? CORRECTION_STATUS_CFG.pending;
//             const isPending = status === "pending";
//             const busy = actioningId === record.id;

//             return (
//               <View key={record.id} style={s.card}>
//                 <View style={s.cardTop}>
//                   <View style={s.avatar}>
//                     <Text style={s.avatarText}>{initials(name)}</Text>
//                   </View>
//                   <View style={{ flex: 1, minWidth: 0 }}>
//                     <Text style={s.name} numberOfLines={1}>
//                       {name}
//                     </Text>
//                     <Text style={s.dateText}>
//                       {fmtDate(record.attendanceDate)}
//                     </Text>
//                   </View>
//                   <StatusChip label={cfg.label} color={cfg.color} bg={cfg.bg} />
//                 </View>

//                 <View style={s.diffRow}>
//                   <View style={s.diffBlock}>
//                     <Text style={s.diffLabel}>Original Clock In</Text>
//                     <Text style={s.diffOld}>
//                       {fmtTime(record.originalClockIn)}
//                     </Text>
//                   </View>
//                   <View style={s.diffBlock}>
//                     <Text style={s.diffLabel}>Requested Clock In</Text>
//                     <Text style={s.diffNew}>
//                       {fmtTime(record.requestedClockIn)}
//                     </Text>
//                   </View>
//                 </View>
//                 <View style={s.diffRow}>
//                   <View style={s.diffBlock}>
//                     <Text style={s.diffLabel}>Original Clock Out</Text>
//                     <Text style={s.diffOld}>
//                       {fmtTime(record.originalClockOut)}
//                     </Text>
//                   </View>
//                   <View style={s.diffBlock}>
//                     <Text style={s.diffLabel}>Requested Clock Out</Text>
//                     <Text style={s.diffNew}>
//                       {fmtTime(record.requestedClockOut)}
//                     </Text>
//                   </View>
//                 </View>

//                 {record.reason ? (
//                   <View style={s.reasonBox}>
//                     <Text style={s.reasonLabel}>Reason</Text>
//                     <Text style={s.reasonText}>{record.reason}</Text>
//                   </View>
//                 ) : null}

//                 {status === "rejected" && record.rejectionReason ? (
//                   <View style={[s.reasonBox, s.rejectionBox]}>
//                     <Text style={[s.reasonLabel, { color: "#DC2626" }]}>
//                       Rejection Reason
//                     </Text>
//                     <Text style={s.reasonText}>{record.rejectionReason}</Text>
//                   </View>
//                 ) : null}

//                 {isPending && (
//                   <View style={s.actionsRow}>
//                     <Pressable
//                       onPress={() => openReject(record)}
//                       disabled={busy}
//                       style={s.rejectBtn}
//                     >
//                       <XCircle size={14} color="#DC2626" />
//                       <Text style={s.rejectBtnText}>Reject</Text>
//                     </Pressable>
//                     <Pressable
//                       onPress={() => handleApprove(record)}
//                       disabled={busy}
//                       style={s.approveBtn}
//                     >
//                       {busy ? (
//                         <ActivityIndicator size="small" color="#fff" />
//                       ) : (
//                         <>
//                           <CheckCircle2 size={14} color="#fff" />
//                           <Text style={s.approveBtnText}>Approve</Text>
//                         </>
//                       )}
//                     </Pressable>
//                   </View>
//                 )}
//               </View>
//             );
//           })}
//         </View>
//       )}

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <View style={s.pagination}>
//           <Text style={s.pageInfo}>
//             {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
//           </Text>
//           <View style={{ flexDirection: "row", gap: 8 }}>
//             <Pressable
//               disabled={page === 1}
//               onPress={() => setPage((p) => p - 1)}
//               style={[s.pageBtn, page === 1 && s.pageBtnDisabled]}
//             >
//               <Text
//                 style={[s.pageBtnText, page === 1 && s.pageBtnTextDisabled]}
//               >
//                 Prev
//               </Text>
//             </Pressable>
//             <Pressable
//               disabled={page === totalPages}
//               onPress={() => setPage((p) => p + 1)}
//               style={[s.pageBtn, page === totalPages && s.pageBtnDisabled]}
//             >
//               <Text
//                 style={[
//                   s.pageBtnText,
//                   page === totalPages && s.pageBtnTextDisabled,
//                 ]}
//               >
//                 Next
//               </Text>
//             </Pressable>
//           </View>
//         </View>
//       )}

//       {/* Reject Modal */}
//       <Modal
//         visible={!!rejectTarget}
//         animationType="slide"
//         transparent
//         statusBarTranslucent
//         onRequestClose={() => setRejectTarget(null)}
//       >
//         <View style={s.overlay}>
//           <View style={s.sheet}>
//             <View style={s.sheetHeader}>
//               <Text style={s.sheetTitle}>Reject Correction</Text>
//               <Pressable onPress={() => setRejectTarget(null)} hitSlop={8}>
//                 <X size={18} color={C.textMuted} />
//               </Pressable>
//             </View>

//             <View>
//               <Text style={s.fieldLabel}>
//                 Reason <Text style={{ color: C.danger }}>*</Text>
//               </Text>
//               <TextInput
//                 value={rejectReason}
//                 onChangeText={setRejectReason}
//                 placeholder="Explain why this correction is being rejected…"
//                 placeholderTextColor={C.textMuted}
//                 multiline
//                 numberOfLines={3}
//                 style={[s.input, s.textarea]}
//               />
//             </View>

//             {rejectError ? (
//               <Text style={s.formError}>{rejectError}</Text>
//             ) : null}

//             <View style={s.modalActions}>
//               <Pressable
//                 onPress={() => setRejectTarget(null)}
//                 style={s.cancelBtn}
//               >
//                 <Text style={s.cancelBtnText}>Cancel</Text>
//               </Pressable>
//               <Pressable
//                 onPress={handleReject}
//                 disabled={rejectSaving}
//                 style={s.confirmRejectBtn}
//               >
//                 {rejectSaving ? (
//                   <ActivityIndicator size="small" color="#fff" />
//                 ) : (
//                   <Text style={s.confirmRejectBtnText}>Reject Request</Text>
//                 )}
//               </Pressable>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   filterRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
//   statusPill: {
//     paddingHorizontal: 12,
//     paddingVertical: 7,
//     borderRadius: 10,
//     backgroundColor: C.surfaceAlt,
//   },
//   statusPillActive: { backgroundColor: C.primary },
//   statusPillText: { fontSize: 12, fontWeight: "600", color: C.textSecondary },
//   statusPillTextActive: { color: "#fff" },

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
//   cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
//   avatar: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.primary,
//   },
//   avatarText: { color: "#fff", fontSize: 12, fontWeight: "800" },
//   name: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
//   dateText: { fontSize: 11, color: C.textMuted, marginTop: 1 },

//   diffRow: { flexDirection: "row", gap: 10 },
//   diffBlock: {
//     flex: 1,
//     backgroundColor: C.surfaceAlt,
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//   },
//   diffLabel: {
//     fontSize: 9,
//     color: C.textMuted,
//     textTransform: "uppercase",
//     marginBottom: 2,
//   },
//   diffOld: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: C.textMuted,
//     textDecorationLine: "line-through",
//   },
//   diffNew: { fontSize: 13, fontWeight: "800", color: C.primary },

//   reasonBox: {
//     backgroundColor: C.surfaceAlt,
//     borderRadius: 10,
//     padding: 10,
//   },
//   rejectionBox: { backgroundColor: "#FEF2F2" },
//   reasonLabel: {
//     fontSize: 9,
//     fontWeight: "700",
//     color: C.textMuted,
//     textTransform: "uppercase",
//     marginBottom: 3,
//   },
//   reasonText: { fontSize: 12, color: C.textSecondary, lineHeight: 17 },

//   actionsRow: { flexDirection: "row", gap: 10 },
//   rejectBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     paddingVertical: 10,
//     borderRadius: 12,
//     backgroundColor: "#FEF2F2",
//     borderWidth: 1,
//     borderColor: "#FCA5A5",
//   },
//   rejectBtnText: { fontSize: 12, fontWeight: "700", color: "#DC2626" },
//   approveBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     paddingVertical: 10,
//     borderRadius: 12,
//     backgroundColor: "#10B981",
//   },
//   approveBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },

//   pagination: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   pageInfo: { fontSize: 11, color: C.textMuted },
//   pageBtn: {
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 10,
//     backgroundColor: C.primary,
//   },
//   pageBtnDisabled: { backgroundColor: C.surfaceAlt },
//   pageBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },
//   pageBtnTextDisabled: { color: C.textMuted },

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
//   textarea: { height: 80, textAlignVertical: "top" },

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
//   confirmRejectBtn: {
//     flex: 1,
//     paddingVertical: 13,
//     borderRadius: 14,
//     alignItems: "center",
//     backgroundColor: "#DC2626",
//   },
//   confirmRejectBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },
// });


// // src/components/admin/attendance/AttendanceCorrectionsView.tsx
// // Mobile equivalent of AttendanceCorrections.jsx — correction requests
// // (employee-submitted clock-in/out fixes) as cards with approve/reject
// // actions, mirroring the filter + card + pagination pattern used in
// // AttendanceLogView.tsx.
// //
// // Backed by /api/attendance/corrections* (attendanceExtras.controller.js),
// // exposed via attendanceApi.getCorrections / approveCorrection /
// // rejectCorrection. Department filtering requires the departmentId
// // support added to getCorrections (see attendanceExtras.controller.patch.js).
// //
// // Loading state: uses only the global Loader (Loader.show()/hide()) — no
// // local ActivityIndicator — so switching status/department filters doesn't
// // show two competing spinners.

// import { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   TextInput,
//   Modal,
//   ActivityIndicator,
// } from "react-native";
// import { CheckCircle2, XCircle, X, FileEdit } from "lucide-react-native";

// import C from "../../../styles/colors";
// import { attendanceApi } from "../../../api/service/attendanceApi";
// import { getEmployees } from "../../../api/service/employeeApi";
// import { departmentApi } from "../../../api/service/departmentApi";
// import { Loader } from "../../../hooks/loaderManager";
// import MobileSelect from "../employee/MobileSelect";
// import StatusChip from "./StatusChip";
// import {
//   buildEmpMap,
//   fmtDate,
//   fmtTime,
//   initials,
// } from "../../../hooks/attendanceHelpers";

// const LIMIT = 20;

// const STATUS_FILTERS = ["pending", "approved", "rejected", "all"] as const;

// const CORRECTION_STATUS_CFG: Record<
//   string,
//   { bg: string; color: string; label: string }
// > = {
//   pending: { bg: "#FEF3C7", color: "#D97706", label: "Pending" },
//   approved: { bg: "#D1FAE5", color: "#059669", label: "Approved" },
//   rejected: { bg: "#FEE2E2", color: "#DC2626", label: "Rejected" },
// };

// interface Props {
//   showToast: (msg: string, type?: "success" | "error" | "info") => void;
// }

// export default function AttendanceCorrectionsView({ showToast }: Props) {
//   const [records, setRecords] = useState<any[]>([]);
//   const [employees, setEmployees] = useState<any[]>([]);
//   const [departments, setDepartments] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [filterStatus, setFilterStatus] =
//     useState<(typeof STATUS_FILTERS)[number]>("pending");
//   const [filterDept, setFilterDept] = useState("all");
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);

//   const [actioningId, setActioningId] = useState<string | null>(null);
//   const [rejectTarget, setRejectTarget] = useState<any | null>(null);
//   const [rejectReason, setRejectReason] = useState("");
//   const [rejectSaving, setRejectSaving] = useState(false);
//   const [rejectError, setRejectError] = useState("");

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     Loader.show();
//     try {
//       const params: any = {
//         page,
//         limit: LIMIT,
//         ...(filterStatus !== "all" && { status: filterStatus }),
//         ...(filterDept !== "all" && { departmentId: filterDept }),
//       };
//       const [corrRes, empRes, deptRes] = await Promise.all([
//         attendanceApi.getCorrections(params),
//         getEmployees({ limit: 500 }),
//         departmentApi.list(),
//       ]);
//       setRecords(corrRes.rows ?? corrRes.corrections ?? []);
//       setTotal(corrRes.total ?? 0);
//       const empData = empRes.data ?? empRes;
//       setEmployees(Array.isArray(empData) ? empData : []);
//       const deptData = deptRes.data ?? deptRes;
//       setDepartments(Array.isArray(deptData) ? deptData : []);
//     } catch (err) {
//       setError("Failed to load correction requests.");
//     } finally {
//       setLoading(false);
//       Loader.hide();
//     }
//   }, [page, filterStatus, filterDept]);

//   useEffect(() => {
//     load();
//   }, [load]);

//   const empMap = useMemo(() => buildEmpMap(employees), [employees]);
//   const totalPages = Math.ceil(total / LIMIT);
//   const deptOptions = [
//     { label: "All Departments", value: "all" },
//     ...departments.map((d) => ({ label: d.name, value: d.id })),
//   ];

//   const handleApprove = async (record: any) => {
//     setActioningId(record.id);
//     Loader.show();
//     try {
//       await attendanceApi.approveCorrection(record.id);
//       setRecords((prev) => prev.filter((r) => r.id !== record.id));
//       showToast("Correction approved");
//     } catch {
//       showToast("Failed to approve correction", "error");
//     } finally {
//       setActioningId(null);
//       Loader.hide();
//     }
//   };

//   const openReject = (record: any) => {
//     setRejectTarget(record);
//     setRejectReason("");
//     setRejectError("");
//   };

//   const handleReject = async () => {
//     if (!rejectTarget) return;
//     if (!rejectReason.trim()) {
//       setRejectError("Please provide a reason for rejection.");
//       return;
//     }
//     setRejectSaving(true);
//     setRejectError("");
//     Loader.show();
//     try {
//       await attendanceApi.rejectCorrection(rejectTarget.id, {
//         reason: rejectReason.trim(),
//       });
//       setRecords((prev) => prev.filter((r) => r.id !== rejectTarget.id));
//       showToast("Correction rejected");
//       setRejectTarget(null);
//     } catch {
//       setRejectError("Failed to reject correction.");
//     } finally {
//       setRejectSaving(false);
//       Loader.hide();
//     }
//   };

//   return (
//     <View style={{ gap: 14 }}>
//       {/* Filters */}
//       <View style={s.filterCard}>
//         <View style={s.filterRow}>
//           {STATUS_FILTERS.map((st) => {
//             const active = filterStatus === st;
//             return (
//               <Pressable
//                 key={st}
//                 onPress={() => {
//                   setFilterStatus(st);
//                   setPage(1);
//                 }}
//                 style={[s.statusPill, active && s.statusPillActive]}
//               >
//                 <Text
//                   style={[s.statusPillText, active && s.statusPillTextActive]}
//                 >
//                   {st.charAt(0).toUpperCase() + st.slice(1)}
//                 </Text>
//               </Pressable>
//             );
//           })}
//         </View>

//         <MobileSelect
//           value={filterDept}
//           onChange={(v) => {
//             setFilterDept(v);
//             setPage(1);
//           }}
//           options={deptOptions}
//           placeholder="All Departments"
//         />
//       </View>

//       {/* List */}
//       {error ? (
//         <Text style={s.errorText}>{error}</Text>
//       ) : records.length === 0 && !loading ? (
//         <View style={s.center}>
//           <FileEdit size={28} color={C.textMuted} />
//           <Text style={s.emptyText}>No correction requests found.</Text>
//         </View>
//       ) : (
//         <View style={{ gap: 10 }}>
//           {records.map((record) => {
//             const emp = empMap[record.employeeId] ?? {};
//             const name =
//               emp.name ??
//               `${record.employee?.firstName ?? ""} ${record.employee?.lastName ?? ""}`.trim();
//             const dept = emp.department ?? record.employee?.department ?? "—";
//             const status = (record.status ?? "pending").toLowerCase();
//             const cfg =
//               CORRECTION_STATUS_CFG[status] ?? CORRECTION_STATUS_CFG.pending;
//             const isPending = status === "pending";
//             const busy = actioningId === record.id;

//             return (
//               <View key={record.id} style={s.card}>
//                 <View style={s.cardTop}>
//                   <View style={s.avatar}>
//                     <Text style={s.avatarText}>{initials(name)}</Text>
//                   </View>
//                   <View style={{ flex: 1, minWidth: 0 }}>
//                     <Text style={s.name} numberOfLines={1}>
//                       {name}
//                     </Text>
//                     <Text style={s.dateText} numberOfLines={1}>
//                       {dept} · {fmtDate(record.attendanceDate)}
//                     </Text>
//                   </View>
//                   <StatusChip label={cfg.label} color={cfg.color} bg={cfg.bg} />
//                 </View>

//                 <View style={s.diffRow}>
//                   <View style={s.diffBlock}>
//                     <Text style={s.diffLabel}>Original Clock In</Text>
//                     <Text style={s.diffOld}>
//                       {fmtTime(record.originalClockIn)}
//                     </Text>
//                   </View>
//                   <View style={s.diffBlock}>
//                     <Text style={s.diffLabel}>Requested Clock In</Text>
//                     <Text style={s.diffNew}>
//                       {fmtTime(record.requestedClockIn)}
//                     </Text>
//                   </View>
//                 </View>
//                 <View style={s.diffRow}>
//                   <View style={s.diffBlock}>
//                     <Text style={s.diffLabel}>Original Clock Out</Text>
//                     <Text style={s.diffOld}>
//                       {fmtTime(record.originalClockOut)}
//                     </Text>
//                   </View>
//                   <View style={s.diffBlock}>
//                     <Text style={s.diffLabel}>Requested Clock Out</Text>
//                     <Text style={s.diffNew}>
//                       {fmtTime(record.requestedClockOut)}
//                     </Text>
//                   </View>
//                 </View>

//                 {record.reason ? (
//                   <View style={s.reasonBox}>
//                     <Text style={s.reasonLabel}>Reason</Text>
//                     <Text style={s.reasonText}>{record.reason}</Text>
//                   </View>
//                 ) : null}

//                 {status === "rejected" && record.rejectionReason ? (
//                   <View style={[s.reasonBox, s.rejectionBox]}>
//                     <Text style={[s.reasonLabel, { color: "#DC2626" }]}>
//                       Rejection Reason
//                     </Text>
//                     <Text style={s.reasonText}>{record.rejectionReason}</Text>
//                   </View>
//                 ) : null}

//                 {isPending && (
//                   <View style={s.actionsRow}>
//                     <Pressable
//                       onPress={() => openReject(record)}
//                       disabled={busy}
//                       style={s.rejectBtn}
//                     >
//                       <XCircle size={14} color="#DC2626" />
//                       <Text style={s.rejectBtnText}>Reject</Text>
//                     </Pressable>
//                     <Pressable
//                       onPress={() => handleApprove(record)}
//                       disabled={busy}
//                       style={s.approveBtn}
//                     >
//                       {busy ? (
//                         <ActivityIndicator size="small" color="#fff" />
//                       ) : (
//                         <>
//                           <CheckCircle2 size={14} color="#fff" />
//                           <Text style={s.approveBtnText}>Approve</Text>
//                         </>
//                       )}
//                     </Pressable>
//                   </View>
//                 )}
//               </View>
//             );
//           })}
//         </View>
//       )}

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <View style={s.pagination}>
//           <Text style={s.pageInfo}>
//             {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
//           </Text>
//           <View style={{ flexDirection: "row", gap: 8 }}>
//             <Pressable
//               disabled={page === 1}
//               onPress={() => setPage((p) => p - 1)}
//               style={[s.pageBtn, page === 1 && s.pageBtnDisabled]}
//             >
//               <Text
//                 style={[s.pageBtnText, page === 1 && s.pageBtnTextDisabled]}
//               >
//                 Prev
//               </Text>
//             </Pressable>
//             <Pressable
//               disabled={page === totalPages}
//               onPress={() => setPage((p) => p + 1)}
//               style={[s.pageBtn, page === totalPages && s.pageBtnDisabled]}
//             >
//               <Text
//                 style={[
//                   s.pageBtnText,
//                   page === totalPages && s.pageBtnTextDisabled,
//                 ]}
//               >
//                 Next
//               </Text>
//             </Pressable>
//           </View>
//         </View>
//       )}

//       {/* Reject Modal */}
//       <Modal
//         visible={!!rejectTarget}
//         animationType="slide"
//         transparent
//         statusBarTranslucent
//         onRequestClose={() => setRejectTarget(null)}
//       >
//         <View style={s.overlay}>
//           <View style={s.sheet}>
//             <View style={s.sheetHeader}>
//               <Text style={s.sheetTitle}>Reject Correction</Text>
//               <Pressable onPress={() => setRejectTarget(null)} hitSlop={8}>
//                 <X size={18} color={C.textMuted} />
//               </Pressable>
//             </View>

//             <View>
//               <Text style={s.fieldLabel}>
//                 Reason <Text style={{ color: C.danger }}>*</Text>
//               </Text>
//               <TextInput
//                 value={rejectReason}
//                 onChangeText={setRejectReason}
//                 placeholder="Explain why this correction is being rejected…"
//                 placeholderTextColor={C.textMuted}
//                 multiline
//                 numberOfLines={3}
//                 style={[s.input, s.textarea]}
//               />
//             </View>

//             {rejectError ? (
//               <Text style={s.formError}>{rejectError}</Text>
//             ) : null}

//             <View style={s.modalActions}>
//               <Pressable
//                 onPress={() => setRejectTarget(null)}
//                 style={s.cancelBtn}
//               >
//                 <Text style={s.cancelBtnText}>Cancel</Text>
//               </Pressable>
//               <Pressable
//                 onPress={handleReject}
//                 disabled={rejectSaving}
//                 style={s.confirmRejectBtn}
//               >
//                 {rejectSaving ? (
//                   <ActivityIndicator size="small" color="#fff" />
//                 ) : (
//                   <Text style={s.confirmRejectBtnText}>Reject Request</Text>
//                 )}
//               </Pressable>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   filterCard: {
//     padding: 14,
//     borderRadius: 16,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     gap: 12,
//   },
//   filterRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
//   statusPill: {
//     paddingHorizontal: 12,
//     paddingVertical: 7,
//     borderRadius: 10,
//     backgroundColor: C.surfaceAlt,
//   },
//   statusPillActive: { backgroundColor: C.primary },
//   statusPillText: { fontSize: 12, fontWeight: "600", color: C.textSecondary },
//   statusPillTextActive: { color: "#fff" },

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
//   cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
//   avatar: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.primary,
//   },
//   avatarText: { color: "#fff", fontSize: 12, fontWeight: "800" },
//   name: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
//   dateText: { fontSize: 11, color: C.textMuted, marginTop: 1 },

//   diffRow: { flexDirection: "row", gap: 10 },
//   diffBlock: {
//     flex: 1,
//     backgroundColor: C.surfaceAlt,
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//   },
//   diffLabel: {
//     fontSize: 9,
//     color: C.textMuted,
//     textTransform: "uppercase",
//     marginBottom: 2,
//   },
//   diffOld: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: C.textMuted,
//     textDecorationLine: "line-through",
//   },
//   diffNew: { fontSize: 13, fontWeight: "800", color: C.primary },

//   reasonBox: {
//     backgroundColor: C.surfaceAlt,
//     borderRadius: 10,
//     padding: 10,
//   },
//   rejectionBox: { backgroundColor: "#FEF2F2" },
//   reasonLabel: {
//     fontSize: 9,
//     fontWeight: "700",
//     color: C.textMuted,
//     textTransform: "uppercase",
//     marginBottom: 3,
//   },
//   reasonText: { fontSize: 12, color: C.textSecondary, lineHeight: 17 },

//   actionsRow: { flexDirection: "row", gap: 10 },
//   rejectBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     paddingVertical: 10,
//     borderRadius: 12,
//     backgroundColor: "#FEF2F2",
//     borderWidth: 1,
//     borderColor: "#FCA5A5",
//   },
//   rejectBtnText: { fontSize: 12, fontWeight: "700", color: "#DC2626" },
//   approveBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     paddingVertical: 10,
//     borderRadius: 12,
//     backgroundColor: "#10B981",
//   },
//   approveBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },

//   pagination: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   pageInfo: { fontSize: 11, color: C.textMuted },
//   pageBtn: {
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 10,
//     backgroundColor: C.primary,
//   },
//   pageBtnDisabled: { backgroundColor: C.surfaceAlt },
//   pageBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },
//   pageBtnTextDisabled: { color: C.textMuted },

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
//   textarea: { height: 80, textAlignVertical: "top" },

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
//   confirmRejectBtn: {
//     flex: 1,
//     paddingVertical: 13,
//     borderRadius: 14,
//     alignItems: "center",
//     backgroundColor: "#DC2626",
//   },
//   confirmRejectBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },
// });


// src/components/admin/attendance/AttendanceCorrectionsView.tsx
// Direct attendance correction — browse ALL attendance records (same data
// source as AttendanceLogView, via attendanceApi.getAll) and let HR edit
// any entry's clock-in/out, status, or hours directly. This does not
// depend on an employee having submitted a correction request; it calls
// the existing HR-only endpoint PUT /attendance/:id/correct
// (attendanceApi.correct), which already requires an editReason.
//
// Loading state: global Loader only (Loader.show()/hide()) — no local
// ActivityIndicator — consistent with the rest of the attendance module.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Edit3, X, AlertCircle, ClipboardList } from "lucide-react-native";

import C from "../../../styles/colors";
import { attendanceApi } from "../../../api/service/attendanceApi";
import { getEmployees } from "../../../api/service/employeeApi";
import { departmentApi } from "../../../api/service/departmentApi";
import { Loader } from "../../../hooks/loaderManager";
import MobileSelect from "../employee/MobileSelect";
import StatusChip from "./StatusChip";
import {
  STATUS_CFG,
  buildEmpMap,
  fmtShortDate,
  fmtClock,
  initials,
} from "../../../hooks/attendanceHelpers";

const LIMIT = 30;

const STATUS_OPTIONS = [
  "present",
  "late",
  "absent",
  "half_day",
  "on_leave",
  "holiday",
] as const;

const STATUS_LABELS: Record<string, string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  half_day: "Half Day",
  on_leave: "On Leave",
  holiday: "Holiday",
};

interface Props {
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function AttendanceCorrectionsView({ showToast }: Props) {
  const [records, setRecords] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [correctTarget, setCorrectTarget] = useState<any | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    Loader.show();
    try {
      const params: any = {
        page,
        limit: LIMIT,
        ...(filterStatus !== "all" && { status: filterStatus }),
        ...(filterDept !== "all" && { departmentId: filterDept }),
      };
      const [attRes, empRes, deptRes] = await Promise.all([
        attendanceApi.getAll(params),
        getEmployees({ limit: 500 }),
        departmentApi.list(),
      ]);
      setRecords(attRes.rows ?? []);
      setTotal(attRes.total ?? 0);
      const empData = empRes.data ?? empRes;
      setEmployees(Array.isArray(empData) ? empData : []);
      const deptData = deptRes.data ?? deptRes;
      setDepartments(Array.isArray(deptData) ? deptData : []);
    } catch {
      setError("Failed to load attendance records.");
    } finally {
      setLoading(false);
      Loader.hide();
    }
  }, [page, filterStatus, filterDept]);

  useEffect(() => {
    load();
  }, [load]);

  const empMap = useMemo(() => buildEmpMap(employees), [employees]);
  const totalPages = Math.ceil(total / LIMIT);
  const deptOptions = [
    { label: "All Departments", value: "all" },
    ...departments.map((d) => ({ label: d.name, value: d.id })),
  ];

  const handleSaved = (msg: string) => {
    setCorrectTarget(null);
    showToast(msg);
    load();
  };

  return (
    <View style={{ gap: 14 }}>
      {/* Filters */}
      <View style={s.filterCard}>
        <View style={s.statusRow}>
          {["all", "present", "late", "absent"].map((st) => {
            const active = filterStatus === st;
            return (
              <Pressable
                key={st}
                onPress={() => {
                  setFilterStatus(st);
                  setPage(1);
                }}
                style={[s.statusPill, active && s.statusPillActive]}
              >
                <Text
                  style={[s.statusPillText, active && s.statusPillTextActive]}
                >
                  {st === "all"
                    ? "All"
                    : st.charAt(0).toUpperCase() + st.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <MobileSelect
          value={filterDept}
          onChange={(v) => {
            setFilterDept(v);
            setPage(1);
          }}
          options={deptOptions}
          placeholder="All Departments"
        />
      </View>

      {/* List */}
      {error ? (
        <View style={s.errorBox}>
          <AlertCircle size={16} color={C.danger} />
          <Text style={s.errorText}>{error}</Text>
        </View>
      ) : records.length === 0 && !loading ? (
        <View style={s.center}>
          <ClipboardList size={28} color={C.textMuted} />
          <Text style={s.emptyText}>No attendance records found.</Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {records.map((record) => {
            const emp = empMap[record.employeeId] ?? {};
            const name =
              emp.name ??
              `${record.employee?.firstName ?? ""} ${record.employee?.lastName ?? ""}`.trim();
            const dept = emp.department ?? record.employee?.department ?? "—";
            const status = (record.status ?? "absent").toLowerCase();
            const cfg = STATUS_CFG[status] ?? STATUS_CFG.absent;

            return (
              <View key={record.id} style={s.card}>
                <View style={s.cardTop}>
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>{initials(name)}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.name} numberOfLines={1}>
                      {name}
                    </Text>
                    <Text style={s.meta} numberOfLines={1}>
                      {dept} · {fmtShortDate(record.attendanceDate)}
                    </Text>
                  </View>
                  <StatusChip
                    label={STATUS_LABELS[status] ?? cfg.label}
                    color={cfg.color}
                    bg={cfg.bg}
                  />
                </View>

                <View style={s.timesRow}>
                  <View style={s.timeBlock}>
                    <Text style={s.timeLabel}>Clock In</Text>
                    <Text style={s.timeValue}>{fmtClock(record.clockIn)}</Text>
                  </View>
                  <View style={s.timeBlock}>
                    <Text style={s.timeLabel}>Clock Out</Text>
                    <Text style={s.timeValue}>
                      {fmtClock(record.clockOut)}
                    </Text>
                  </View>
                  <View style={s.timeBlock}>
                    <Text style={s.timeLabel}>Hours</Text>
                    <Text style={s.timeValue}>
                      {record.hoursWorked != null
                        ? `${Number(record.hoursWorked).toFixed(1)}h`
                        : "—"}
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => setCorrectTarget({ ...record, name })}
                  style={s.correctBtn}
                >
                  <Edit3 size={12} color={C.primary} />
                  <Text style={s.correctBtnText}>Correct</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={s.pagination}>
          <Text style={s.pageInfo}>
            {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              disabled={page === 1}
              onPress={() => setPage((p) => p - 1)}
              style={[s.pageBtn, page === 1 && s.pageBtnDisabled]}
            >
              <Text
                style={[s.pageBtnText, page === 1 && s.pageBtnTextDisabled]}
              >
                Prev
              </Text>
            </Pressable>
            <Pressable
              disabled={page === totalPages}
              onPress={() => setPage((p) => p + 1)}
              style={[s.pageBtn, page === totalPages && s.pageBtnDisabled]}
            >
              <Text
                style={[
                  s.pageBtnText,
                  page === totalPages && s.pageBtnTextDisabled,
                ]}
              >
                Next
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Correction Modal */}
      {correctTarget && (
        <CorrectModal
          record={correctTarget}
          onClose={() => setCorrectTarget(null)}
          onSaved={handleSaved}
        />
      )}
    </View>
  );
}

function toHHMM(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

function CorrectModal({
  record,
  onClose,
  onSaved,
}: {
  record: any;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const [status, setStatus] = useState<string>(
    (record.status ?? "present").toLowerCase(),
  );
  const [clockInTime, setClockInTime] = useState(toHHMM(record.clockIn));
  const [clockOutTime, setClockOutTime] = useState(toHHMM(record.clockOut));
  const [hoursWorked, setHoursWorked] = useState(
    record.hoursWorked != null ? String(record.hoursWorked) : "",
  );
  const [overtimeHours, setOvertimeHours] = useState(
    record.overtimeHours != null ? String(record.overtimeHours) : "",
  );
  const [editReason, setEditReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!editReason.trim()) {
      setError("Please explain why this record is being corrected.");
      return;
    }
    setSaving(true);
    setError("");
    Loader.show();
    try {
      const payload: any = { editReason: editReason.trim(), status };
      if (clockInTime) {
        payload.clockIn = `${record.attendanceDate}T${clockInTime}:00`;
      }
      if (clockOutTime) {
        payload.clockOut = `${record.attendanceDate}T${clockOutTime}:00`;
      }
      if (hoursWorked !== "") payload.hoursWorked = Number(hoursWorked);
      if (overtimeHours !== "") payload.overtimeHours = Number(overtimeHours);

      await attendanceApi.correct(record.id, payload);
      onSaved("Attendance record corrected.");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? "Failed to correct attendance record.",
      );
    } finally {
      setSaving(false);
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
              <Text style={s.sheetEyebrow}>Correct Attendance</Text>
              <Text style={s.sheetTitle} numberOfLines={1}>
                {record.name} · {fmtShortDate(record.attendanceDate)}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={18} color={C.textMuted} />
            </Pressable>
          </View>

          {error ? (
            <View style={s.errorBox}>
              <AlertCircle size={14} color={C.danger} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          <View>
            <Text style={s.fieldLabel}>Status</Text>
            <View style={s.statusGrid}>
              {STATUS_OPTIONS.map((st) => {
                const active = status === st;
                return (
                  <Pressable
                    key={st}
                    onPress={() => setStatus(st)}
                    style={[s.statusChip, active && s.statusChipActive]}
                  >
                    <Text
                      style={[
                        s.statusChipText,
                        active && s.statusChipTextActive,
                      ]}
                    >
                      {STATUS_LABELS[st]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={s.row2}>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Clock In</Text>
              <TextInput
                value={clockInTime}
                onChangeText={setClockInTime}
                placeholder="08:00"
                placeholderTextColor={C.textMuted}
                style={s.input}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Clock Out</Text>
              <TextInput
                value={clockOutTime}
                onChangeText={setClockOutTime}
                placeholder="17:00"
                placeholderTextColor={C.textMuted}
                style={s.input}
              />
            </View>
          </View>

          <View style={s.row2}>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Hours Worked</Text>
              <TextInput
                value={hoursWorked}
                onChangeText={setHoursWorked}
                placeholder="8"
                placeholderTextColor={C.textMuted}
                keyboardType="numeric"
                style={s.input}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>Overtime Hours</Text>
              <TextInput
                value={overtimeHours}
                onChangeText={setOvertimeHours}
                placeholder="0"
                placeholderTextColor={C.textMuted}
                keyboardType="numeric"
                style={s.input}
              />
            </View>
          </View>

          <View>
            <Text style={s.fieldLabel}>
              Reason for Correction <Text style={{ color: C.danger }}>*</Text>
            </Text>
            <TextInput
              value={editReason}
              onChangeText={setEditReason}
              placeholder="e.g. Employee forgot to clock out, adjusted per manager confirmation…"
              placeholderTextColor={C.textMuted}
              multiline
              numberOfLines={3}
              style={[s.input, s.textarea]}
            />
          </View>

          <View style={s.modalActions}>
            <Pressable onPress={onClose} style={s.cancelBtn}>
              <Text style={s.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSave} disabled={saving} style={s.saveBtn}>
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.saveBtnText}>Save Correction</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  filterCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  statusRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: C.surfaceAlt,
  },
  statusPillActive: { backgroundColor: C.primary },
  statusPillText: { fontSize: 12, fontWeight: "600", color: C.textSecondary },
  statusPillTextActive: { color: "#fff" },

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
    padding: 14,
    gap: 10,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
  },
  avatarText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  name: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  meta: { fontSize: 11, color: C.textMuted, marginTop: 1 },

  timesRow: { flexDirection: "row", justifyContent: "space-between" },
  timeBlock: { alignItems: "flex-start" },
  timeLabel: { fontSize: 9, color: C.textMuted, textTransform: "uppercase" },
  timeValue: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textPrimary,
    marginTop: 2,
  },

  correctBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: C.primaryLight,
  },
  correctBtnText: { fontSize: 12, fontWeight: "700", color: C.primary },

  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageInfo: { fontSize: 11, color: C.textMuted },
  pageBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: C.primary,
  },
  pageBtnDisabled: { backgroundColor: C.surfaceAlt },
  pageBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  pageBtnTextDisabled: { color: C.textMuted },

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
  sheetEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    marginBottom: 2,
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
  row2: { flexDirection: "row", gap: 12 },

  statusGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  statusChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  statusChipText: { fontSize: 12, fontWeight: "700", color: C.textSecondary },
  statusChipTextActive: { color: "#fff" },

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
  saveBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },
});