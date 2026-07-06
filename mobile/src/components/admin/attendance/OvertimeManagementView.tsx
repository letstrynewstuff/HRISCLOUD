// // src/components/admin/attendance/OvertimeManagementView.tsx
// // Mobile equivalent of OvertimeManagement.jsx — overtime entries as cards
// // with department filter, status filter, and approve/reject actions.
// //
// // NOTE: attendanceApi method names here (getOvertime / approveOvertime /
// // rejectOvertime) are inferred from the naming conventions used elsewhere
// // in the service. Rename if your backend uses different endpoints.

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
// import { CheckCircle2, XCircle, X, TrendingUp } from "lucide-react-native";

// import C from "../../../styles/colors";
// import { attendanceApi } from "../../../api/service/attendanceApi";
// import { getEmployees } from "../../../api/service/employeeApi";
// import { departmentApi } from "../../../api/service/departmentApi";
// import MobileSelect from "../employee/MobileSelect";
// import StatusChip from "./StatusChip";
// import {
//   buildEmpMap,
//   fmtDate,
//   fmtHours,
//   initials,
// } from "../../../hooks/attendanceHelpers";
// import { Loader } from "../../../hooks/loaderManager";          

// const LIMIT = 20;

// const STATUS_FILTERS = ["pending", "approved", "rejected", "all"] as const;

// const OT_STATUS_CFG: Record<
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

// export default function OvertimeManagementView({ showToast }: Props) {
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

//   // const load = useCallback(async () => {
//   //   setLoading(true);
//   //   setError(null);
//   //   try {
//   //     const params: any = {
//   //       page,
//   //       limit: LIMIT,
//   //       ...(filterStatus !== "all" && { status: filterStatus }),
//   //       ...(filterDept !== "all" && { departmentId: filterDept }),
//   //     };
//   //     const [otRes, empRes, deptRes] = await Promise.all([
//   //       attendanceApi.getOvertime(params),
//   //       getEmployees({ limit: 500 }),
//   //       departmentApi.list(),
//   //     ]);
//   //     setRecords(otRes.rows ?? otRes.overtime ?? []);
//   //     setTotal(otRes.total ?? 0);
//   //     const empData = empRes.data ?? empRes;
//   //     setEmployees(Array.isArray(empData) ? empData : []);
//   //     const deptData = deptRes.data ?? deptRes;
//   //     setDepartments(Array.isArray(deptData) ? deptData : []);
//   //   } catch (err) {
//   //     setError("Failed to load overtime records.");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // }, [page, filterStatus, filterDept]);
// const load = useCallback(async () => {
//   setLoading(true);
//   setError(null);
//   Loader.show();
//   try {
//     const params: any = {
//       page,
//       limit: LIMIT,
//       ...(filterStatus !== "all" && { status: filterStatus }),
//       ...(filterDept !== "all" && { departmentId: filterDept }),
//     };
//     const [otRes, empRes, deptRes] = await Promise.all([
//       attendanceApi.getOvertime(params),
//       getEmployees({ limit: 500 }),
//       departmentApi.list(),
//     ]);
//     setRecords(otRes.rows ?? otRes.overtime ?? []);
//     setTotal(otRes.total ?? 0);
//     const empData = empRes.data ?? empRes;
//     setEmployees(Array.isArray(empData) ? empData : []);
//     const deptData = deptRes.data ?? deptRes;
//     setDepartments(Array.isArray(deptData) ? deptData : []);
//   } catch (err) {
//     setError("Failed to load overtime records.");
//   } finally {
//     setLoading(false);
//     Loader.hide();
//   }
// }, [page, filterStatus, filterDept]);
//   useEffect(() => {
//     load();
//   }, [load]);

//   const empMap = useMemo(() => buildEmpMap(employees), [employees]);
//   const totalPages = Math.ceil(total / LIMIT);
//   const deptOptions = [
//     { label: "All Departments", value: "all" },
//     ...departments.map((d) => ({ label: d.name, value: d.id })),
//   ];

//   const totalOvertimeHours = useMemo(
//     () => records.reduce((sum, r) => sum + Number(r.hours ?? 0), 0),
//     [records],
//   );

//   const handleApprove = async (record: any) => {
//     setActioningId(record.id);
//     try {
//       await attendanceApi.approveOvertime(record.id);
//       setRecords((prev) => prev.filter((r) => r.id !== record.id));
//       showToast("Overtime approved");
//     } catch {
//       showToast("Failed to approve overtime", "error");
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
//       await attendanceApi.rejectOvertime(rejectTarget.id, {
//         reason: rejectReason.trim(),
//       });
//       setRecords((prev) => prev.filter((r) => r.id !== rejectTarget.id));
//       showToast("Overtime rejected");
//       setRejectTarget(null);
//     } catch {
//       setRejectError("Failed to reject overtime.");
//     } finally {
//       setRejectSaving(false);
//     }
//   };

//   return (
//     <View style={{ gap: 14 }}>
//       {/* Summary */}
//       <View style={s.summaryCard}>
//         <View style={s.summaryIconWrap}>
//           <TrendingUp size={18} color={C.primary} />
//         </View>
//         <View>
//           <Text style={s.summaryValue}>{fmtHours(totalOvertimeHours)}</Text>
//           <Text style={s.summaryLabel}>Total overtime this page</Text>
//         </View>
//       </View>

//       {/* Filters */}
//       <View style={s.filterCard}>
//         <View style={s.statusRow}>
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
//       {loading ? (
//         <View style={s.center}>
//           <ActivityIndicator size="large" color={C.primary} />
//         </View>
//       ) : error ? (
//         <Text style={s.errorText}>{error}</Text>
//       ) : records.length === 0 ? (
//         <View style={s.center}>
//           <TrendingUp size={28} color={C.textMuted} />
//           <Text style={s.emptyText}>No overtime records found.</Text>
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
//             const cfg = OT_STATUS_CFG[status] ?? OT_STATUS_CFG.pending;
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
//                     <Text style={s.dept} numberOfLines={1}>
//                       {dept}
//                     </Text>
//                   </View>
//                   <StatusChip label={cfg.label} color={cfg.color} bg={cfg.bg} />
//                 </View>

//                 <View style={s.metaRow}>
//                   <Text style={s.dateText}>{fmtDate(record.date)}</Text>
//                   <View style={s.hoursPill}>
//                     <Text style={s.hoursPillText}>
//                       {fmtHours(record.hours)}
//                     </Text>
//                   </View>
//                 </View>

//                 {record.reason ? (
//                   <Text style={s.reasonText}>{record.reason}</Text>
//                 ) : null}

//                 {status === "rejected" && record.rejectionReason ? (
//                   <View style={s.rejectionBox}>
//                     <Text style={s.rejectionLabel}>Rejection Reason</Text>
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
//               <Text style={s.sheetTitle}>Reject Overtime</Text>
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
//                 placeholder="Explain why this overtime is being rejected…"
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
//   summaryCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     padding: 14,
//     borderRadius: 16,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   summaryIconWrap: {
//     width: 40,
//     height: 40,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.primaryLight,
//   },
//   summaryValue: { fontSize: 16, fontWeight: "800", color: C.textPrimary },
//   summaryLabel: { fontSize: 11, color: C.textMuted, marginTop: 1 },

//   filterCard: {
//     padding: 14,
//     borderRadius: 16,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     gap: 12,
//   },
//   statusRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
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
//   dept: { fontSize: 11, color: C.textMuted, marginTop: 1 },

//   metaRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   dateText: { fontSize: 12, color: C.textSecondary },
//   hoursPill: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 999,
//     backgroundColor: "#EDE9FE",
//   },
//   hoursPillText: { fontSize: 12, fontWeight: "800", color: "#8B5CF6" },

//   reasonText: { fontSize: 12, color: C.textSecondary, lineHeight: 17 },
//   rejectionBox: {
//     backgroundColor: "#FEF2F2",
//     borderRadius: 10,
//     padding: 10,
//   },
//   rejectionLabel: {
//     fontSize: 9,
//     fontWeight: "700",
//     color: "#DC2626",
//     textTransform: "uppercase",
//     marginBottom: 3,
//   },

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





// src/components/admin/attendance/OvertimeManagementView.tsx
// Mobile equivalent of OvertimeManagement.jsx — overtime entries as cards
// with department filter, status filter, and approve/reject actions.
//
// No local spinners — Loader.show()/Loader.hide() (the global loader) is
// the only loading indicator, wrapping the fetch, approve, and reject
// actions.
//
// NOTE: attendanceApi method names here (getOvertime / approveOvertime /
// rejectOvertime) are inferred from the naming conventions used elsewhere
// in the service. Rename if your backend uses different endpoints.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
} from "react-native";
import { CheckCircle2, XCircle, X, TrendingUp } from "lucide-react-native";

import C from "../../../styles/colors";
import { attendanceApi } from "../../../api/service/attendanceApi";
import { getEmployees } from "../../../api/service/employeeApi";
import { departmentApi } from "../../../api/service/departmentApi";
import MobileSelect from "../employee/MobileSelect";
import StatusChip from "./StatusChip";
import {
  buildEmpMap,
  fmtDate,
  fmtHours,
  initials,
} from "../../../hooks/attendanceHelpers";
import { Loader } from "../../../hooks/loaderManager";

const LIMIT = 20;

const STATUS_FILTERS = ["pending", "approved", "rejected", "all"] as const;

const OT_STATUS_CFG: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  pending: { bg: "#FEF3C7", color: "#D97706", label: "Pending" },
  approved: { bg: "#D1FAE5", color: "#059669", label: "Approved" },
  rejected: { bg: "#FEE2E2", color: "#DC2626", label: "Rejected" },
};

interface Props {
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function OvertimeManagementView({ showToast }: Props) {
  const [records, setRecords] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] =
    useState<(typeof STATUS_FILTERS)[number]>("pending");
  const [filterDept, setFilterDept] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [actioningId, setActioningId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSaving, setRejectSaving] = useState(false);
  const [rejectError, setRejectError] = useState("");

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
      const [otRes, empRes, deptRes] = await Promise.all([
        attendanceApi.getOvertime(params),
        getEmployees({ limit: 500 }),
        departmentApi.list(),
      ]);
      setRecords(otRes.rows ?? otRes.overtime ?? []);
      setTotal(otRes.total ?? 0);
      const empData = empRes.data ?? empRes;
      setEmployees(Array.isArray(empData) ? empData : []);
      const deptData = deptRes.data ?? deptRes;
      setDepartments(Array.isArray(deptData) ? deptData : []);
    } catch (err) {
      setError("Failed to load overtime records.");
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

  const totalOvertimeHours = useMemo(
    () => records.reduce((sum, r) => sum + Number(r.hours ?? 0), 0),
    [records],
  );

  const handleApprove = async (record: any) => {
    setActioningId(record.id);
    Loader.show();
    try {
      await attendanceApi.approveOvertime(record.id);
      setRecords((prev) => prev.filter((r) => r.id !== record.id));
      showToast("Overtime approved");
    } catch {
      showToast("Failed to approve overtime", "error");
    } finally {
      setActioningId(null);
      Loader.hide();
    }
  };

  const openReject = (record: any) => {
    setRejectTarget(record);
    setRejectReason("");
    setRejectError("");
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      setRejectError("Please provide a reason for rejection.");
      return;
    }
    setRejectSaving(true);
    setRejectError("");
    Loader.show();
    try {
      await attendanceApi.rejectOvertime(rejectTarget.id, {
        reason: rejectReason.trim(),
      });
      setRecords((prev) => prev.filter((r) => r.id !== rejectTarget.id));
      showToast("Overtime rejected");
      setRejectTarget(null);
    } catch {
      setRejectError("Failed to reject overtime.");
    } finally {
      setRejectSaving(false);
      Loader.hide();
    }
  };

  return (
    <View style={{ gap: 14 }}>
      {/* Summary */}
      <View style={s.summaryCard}>
        <View style={s.summaryIconWrap}>
          <TrendingUp size={18} color={C.primary} />
        </View>
        <View>
          <Text style={s.summaryValue}>{fmtHours(totalOvertimeHours)}</Text>
          <Text style={s.summaryLabel}>Total overtime this page</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={s.filterCard}>
        <View style={s.statusRow}>
          {STATUS_FILTERS.map((st) => {
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
                  {st.charAt(0).toUpperCase() + st.slice(1)}
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
        <Text style={s.errorText}>{error}</Text>
      ) : loading ? null : records.length === 0 ? (
        <View style={s.center}>
          <TrendingUp size={28} color={C.textMuted} />
          <Text style={s.emptyText}>No overtime records found.</Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {records.map((record) => {
            const emp = empMap[record.employeeId] ?? {};
            const name =
              emp.name ??
              `${record.employee?.firstName ?? ""} ${record.employee?.lastName ?? ""}`.trim();
            const dept = emp.department ?? record.employee?.department ?? "—";
            const status = (record.status ?? "pending").toLowerCase();
            const cfg = OT_STATUS_CFG[status] ?? OT_STATUS_CFG.pending;
            const isPending = status === "pending";
            const busy = actioningId === record.id;

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
                    <Text style={s.dept} numberOfLines={1}>
                      {dept}
                    </Text>
                  </View>
                  <StatusChip label={cfg.label} color={cfg.color} bg={cfg.bg} />
                </View>

                <View style={s.metaRow}>
                  <Text style={s.dateText}>{fmtDate(record.date)}</Text>
                  <View style={s.hoursPill}>
                    <Text style={s.hoursPillText}>
                      {fmtHours(record.hours)}
                    </Text>
                  </View>
                </View>

                {record.reason ? (
                  <Text style={s.reasonText}>{record.reason}</Text>
                ) : null}

                {status === "rejected" && record.rejectionReason ? (
                  <View style={s.rejectionBox}>
                    <Text style={s.rejectionLabel}>Rejection Reason</Text>
                    <Text style={s.reasonText}>{record.rejectionReason}</Text>
                  </View>
                ) : null}

                {isPending && (
                  <View style={s.actionsRow}>
                    <Pressable
                      onPress={() => openReject(record)}
                      disabled={busy}
                      style={s.rejectBtn}
                    >
                      <XCircle size={14} color="#DC2626" />
                      <Text style={s.rejectBtnText}>Reject</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleApprove(record)}
                      disabled={busy}
                      style={[s.approveBtn, busy && s.approveBtnDisabled]}
                    >
                      <CheckCircle2 size={14} color="#fff" />
                      <Text style={s.approveBtnText}>
                        {busy ? "Approving…" : "Approve"}
                      </Text>
                    </Pressable>
                  </View>
                )}
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

      {/* Reject Modal */}
      <Modal
        visible={!!rejectTarget}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setRejectTarget(null)}
      >
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Reject Overtime</Text>
              <Pressable onPress={() => setRejectTarget(null)} hitSlop={8}>
                <X size={18} color={C.textMuted} />
              </Pressable>
            </View>

            <View>
              <Text style={s.fieldLabel}>
                Reason <Text style={{ color: C.danger }}>*</Text>
              </Text>
              <TextInput
                value={rejectReason}
                onChangeText={setRejectReason}
                placeholder="Explain why this overtime is being rejected…"
                placeholderTextColor={C.textMuted}
                multiline
                numberOfLines={3}
                style={[s.input, s.textarea]}
              />
            </View>

            {rejectError ? (
              <Text style={s.formError}>{rejectError}</Text>
            ) : null}

            <View style={s.modalActions}>
              <Pressable
                onPress={() => setRejectTarget(null)}
                style={s.cancelBtn}
              >
                <Text style={s.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleReject}
                disabled={rejectSaving}
                style={[s.confirmRejectBtn, rejectSaving && s.confirmRejectBtnDisabled]}
              >
                <Text style={s.confirmRejectBtnText}>
                  {rejectSaving ? "Rejecting…" : "Reject Request"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  summaryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  summaryValue: { fontSize: 16, fontWeight: "800", color: C.textPrimary },
  summaryLabel: { fontSize: 11, color: C.textMuted, marginTop: 1 },

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
  dept: { fontSize: 11, color: C.textMuted, marginTop: 1 },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: { fontSize: 12, color: C.textSecondary },
  hoursPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#EDE9FE",
  },
  hoursPillText: { fontSize: 12, fontWeight: "800", color: "#8B5CF6" },

  reasonText: { fontSize: 12, color: C.textSecondary, lineHeight: 17 },
  rejectionBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 10,
  },
  rejectionLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#DC2626",
    textTransform: "uppercase",
    marginBottom: 3,
  },

  actionsRow: { flexDirection: "row", gap: 10 },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  rejectBtnText: { fontSize: 12, fontWeight: "700", color: "#DC2626" },
  approveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#10B981",
  },
  approveBtnDisabled: { opacity: 0.6 },
  approveBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },

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
  textarea: { height: 80, textAlignVertical: "top" },

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
  confirmRejectBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#DC2626",
  },
  confirmRejectBtnDisabled: { opacity: 0.6 },
  confirmRejectBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },
});