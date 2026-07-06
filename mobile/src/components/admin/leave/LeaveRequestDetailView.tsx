// // src/components/admin/leave/LeaveRequestDetailView.tsx
// // Detail screen for a single leave request — opened from Requests or Dashboard.

// import { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   Pressable,
//   ActivityIndicator,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import {
//   ChevronLeft,
//   Check,
//   X,
//   Clock,
//   CheckCircle2,
//   XCircle,
//   Calendar,
//   Briefcase,
//   Building2,
//   FileText,
//   MessageSquare,
//   AlertTriangle,
//   UserCheck,
// } from "lucide-react-native";

// import C from "../../../styles/colors";
// import { leaveApi } from "../../../api/service/leaveApi";
// import {
//   LeaveAvatar,
//   LeaveStatusBadge,
//   getTypeColor,
//   getTypeLight,
//   getTypeIcon,
//   getInitials,
//   fmtDate,
// } from "./leaveShared";
// import ActionModal from "./ActionModal";

// interface Props {
//   requestId: string;
//   onClose: () => void;
//   onViewEmployee?: (id: string) => void;
// }

// function InfoRow({ label, value }: { label: string; value?: string | null }) {
//   return (
//     <View style={s.infoRow}>
//       <Text style={s.infoLabel}>{label}</Text>
//       <Text style={s.infoValue} numberOfLines={1}>
//         {value ?? "—"}
//       </Text>
//     </View>
//   );
// }

// function BalanceBar({
//   label,
//   used,
//   total,
//   color,
// }: {
//   label: string;
//   used: number;
//   total: number;
//   color: string;
// }) {
//   const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
//   const remaining = total - used;
//   return (
//     <View style={{ marginBottom: 12 }}>
//       <View style={s.balanceHead}>
//         <Text style={s.balanceLabel}>{label}</Text>
//         <Text style={s.balanceValue}>
//           {remaining} / {total} days left
//         </Text>
//       </View>
//       <View style={s.balanceTrack}>
//         <View
//           style={[s.balanceFill, { width: `${pct}%`, backgroundColor: color }]}
//         />
//       </View>
//     </View>
//   );
// }

// export default function LeaveRequestDetailView({
//   requestId,
//   onClose,
//   onViewEmployee,
// }: Props) {
//   const insets = useSafeAreaInsets();

//   const [request, setRequest] = useState<any>(null);
//   const [balances, setBalances] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [modal, setModal] = useState<"approve" | "reject" | null>(null);
//   const [actionLoading, setActionLoading] = useState(false);

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const [reqRes, balRes] = await Promise.all([
//         leaveApi.getAllRequests({ limit: 200 }),
//         leaveApi.getAllBalances(),
//       ]);
//       const all = reqRes.data ?? [];
//       const found = all.find((r: any) => r.id === requestId);
//       if (!found) {
//         setError("Request not found.");
//         return;
//       }
//       setRequest(found);
//       const empBalances = (balRes.data ?? []).filter(
//         (b: any) => b.employee_id === found.employee_id,
//       );
//       setBalances(empBalances);
//     } catch {
//       setError("Failed to load request details.");
//     } finally {
//       setLoading(false);
//     }
//   }, [requestId]);

//   useEffect(() => {
//     load();
//   }, [load]);

//   const handleConfirm = async (comment: string) => {
//     if (!modal || !request) return;
//     setActionLoading(true);
//     try {
//       if (modal === "approve") {
//         await leaveApi.approveRequest(request.id, { comment });
//         setRequest((r: any) => ({
//           ...r,
//           status: "approved",
//           approved_by_name: "You",
//           approved_at: new Date().toISOString(),
//         }));
//       } else {
//         await leaveApi.rejectRequest(request.id, { rejectionReason: comment });
//         setRequest((r: any) => ({
//           ...r,
//           status: "rejected",
//           rejection_reason: comment,
//           approved_at: new Date().toISOString(),
//         }));
//       }
//     } catch {
//       // could surface a toast
//     } finally {
//       setActionLoading(false);
//       setModal(null);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={[s.center, { paddingTop: insets.top }]}>
//         <ActivityIndicator size="large" color={C.primary} />
//       </View>
//     );
//   }

//   if (error || !request) {
//     return (
//       <View style={[s.center, { paddingTop: insets.top }]}>
//         <AlertTriangle size={32} color={C.danger} />
//         <Text style={{ color: C.danger, marginTop: 10 }}>
//           {error ?? "Request not found."}
//         </Text>
//         <Pressable onPress={onClose} style={[s.profileBtn, { marginTop: 14 }]}>
//           <Text style={s.profileBtnText}>Go Back</Text>
//         </Pressable>
//       </View>
//     );
//   }

//   const typeColor = getTypeColor(request.leave_type);
//   const typeLight = getTypeLight(request.leave_type);
//   const TODAY = new Date().toISOString().split("T")[0];

//   const timeline = [
//     {
//       label: "Request Submitted",
//       date: fmtDate(request.created_at),
//       done: true,
//       Icon: FileText,
//     },
//     {
//       label:
//         request.status === "approved"
//           ? "Approved"
//           : request.status === "rejected"
//             ? "Rejected"
//             : "Awaiting Decision",
//       date: fmtDate(request.approved_at),
//       done: request.status !== "pending",
//       Icon:
//         request.status === "approved"
//           ? CheckCircle2
//           : request.status === "rejected"
//             ? XCircle
//             : Clock,
//       color:
//         request.status === "approved"
//           ? C.success
//           : request.status === "rejected"
//             ? C.danger
//             : C.warning,
//     },
//     {
//       label: "Leave Start",
//       date: request.start_date,
//       done: request.start_date <= TODAY && request.status === "approved",
//       Icon: Calendar,
//     },
//     {
//       label: "Leave End",
//       date: request.end_date,
//       done: request.end_date < TODAY && request.status === "approved",
//       Icon: UserCheck,
//     },
//   ];

//   const balColors: Record<string, string> = {
//     "Annual Leave": C.primary,
//     "Sick Leave": C.danger,
//     "Study Leave": C.success,
//     "Maternity Leave": C.purple,
//     "Paternity Leave": C.accent,
//   };

//   return (
//     <View style={[s.container, { paddingTop: insets.top }]}>
//       <View style={s.header}>
//         <Pressable onPress={onClose} style={s.headerBack}>
//           <ChevronLeft size={20} color={C.textSecondary} />
//         </Pressable>
//         <View style={{ flex: 1 }}>
//           <Text style={s.headerTitle} numberOfLines={1}>
//             {request.id?.slice(0, 8)}…
//           </Text>
//           <Text style={s.headerSubtitle}>Leave Request</Text>
//         </View>
//       </View>

//       <ScrollView
//         contentContainerStyle={s.body}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Header card */}
//         <View style={s.card}>
//           <View style={s.identityRow}>
//             <LeaveAvatar
//               initials={getInitials(request.employee_name)}
//               color={typeColor}
//               size={48}
//             />
//             <View style={{ flex: 1 }}>
//               <Text style={s.employeeName}>{request.employee_name}</Text>
//               <Text style={s.employeeMeta} numberOfLines={1}>
//                 {request.job_role_name} · {request.department_name}
//               </Text>
//               <View style={s.badgeRow}>
//                 <LeaveStatusBadge status={request.status} />
//                 <View style={s.codeChip}>
//                   <Text style={s.codeChipText}>{request.employee_code}</Text>
//                 </View>
//               </View>
//             </View>
//           </View>

//           <View style={[s.typeBanner, { backgroundColor: typeLight }]}>
//             <Text style={{ fontSize: 22 }}>
//               {getTypeIcon(request.leave_type)}
//             </Text>
//             <View style={{ flex: 1 }}>
//               <Text style={[s.typeBannerTitle, { color: typeColor }]}>
//                 {request.leave_type}
//               </Text>
//               <Text style={s.typeBannerDates}>
//                 {request.start_date} → {request.end_date}
//               </Text>
//             </View>
//             <View style={{ alignItems: "flex-end" }}>
//               <Text style={[s.typeBannerDays, { color: typeColor }]}>
//                 {request.days}
//               </Text>
//               <Text style={s.typeBannerDaysLabel}>days</Text>
//             </View>
//           </View>

//           {request.reason ? (
//             <View>
//               <View style={s.sectionLabelRow}>
//                 <MessageSquare size={12} color={C.textSecondary} />
//                 <Text style={s.sectionLabel}>Reason</Text>
//               </View>
//               <Text style={s.reasonText}>{request.reason}</Text>
//             </View>
//           ) : null}

//           {(request.comment || request.rejection_reason) && (
//             <View>
//               <View style={s.sectionLabelRow}>
//                 <MessageSquare size={12} color={C.textSecondary} />
//                 <Text style={s.sectionLabel}>HR Comment</Text>
//               </View>
//               <Text
//                 style={[
//                   s.reasonText,
//                   {
//                     backgroundColor:
//                       request.status === "approved"
//                         ? C.successLight
//                         : C.dangerLight,
//                   },
//                 ]}
//               >
//                 {request.comment ?? request.rejection_reason}
//               </Text>
//             </View>
//           )}

//           {request.status?.toLowerCase() === "pending" && (
//             <View style={s.actionRow}>
//               <Pressable
//                 onPress={() => setModal("approve")}
//                 style={[s.approveBtn]}
//               >
//                 <Check size={14} color="#fff" />
//                 <Text style={s.approveBtnText}>Approve</Text>
//               </Pressable>
//               <Pressable onPress={() => setModal("reject")} style={s.rejectBtn}>
//                 <X size={14} color={C.danger} />
//                 <Text style={s.rejectBtnText}>Reject</Text>
//               </Pressable>
//             </View>
//           )}
//         </View>

//         {/* Request details */}
//         <View style={s.card}>
//           <Text style={s.cardTitle}>Request Details</Text>
//           <InfoRow label="Request ID" value={request.id} />
//           <InfoRow label="Applied On" value={fmtDate(request.created_at)} />
//           <InfoRow label="Paid Leave" value={request.is_paid ? "Yes" : "No"} />
//           {request.approved_by_name && (
//             <InfoRow label="Reviewed By" value={request.approved_by_name} />
//           )}
//           {request.approved_at && (
//             <InfoRow
//               label="Decision Date"
//               value={fmtDate(request.approved_at)}
//             />
//           )}
//         </View>

//         {/* Timeline */}
//         <View style={s.card}>
//           <Text style={s.cardTitle}>Request Timeline</Text>
//           <View style={{ gap: 14 }}>
//             {timeline.map((t, i) => {
//               const { Icon } = t;
//               const color = t.done ? t.color || C.success : C.textMuted;
//               return (
//                 <View key={i} style={s.timelineRow}>
//                   <View
//                     style={[
//                       s.timelineIcon,
//                       {
//                         backgroundColor: t.done ? `${color}20` : C.surfaceAlt,
//                         borderColor: t.done ? color : C.border,
//                       },
//                     ]}
//                   >
//                     <Icon size={12} color={color} />
//                   </View>
//                   <View style={{ flex: 1 }}>
//                     <Text
//                       style={[
//                         s.timelineLabel,
//                         { color: t.done ? C.textPrimary : C.textMuted },
//                       ]}
//                     >
//                       {t.label}
//                     </Text>
//                     <Text style={s.timelineDate}>{t.date}</Text>
//                   </View>
//                 </View>
//               );
//             })}
//           </View>
//         </View>

//         {/* Employee info */}
//         <View style={s.card}>
//           <Text style={s.cardTitle}>Employee Info</Text>
//           <View style={s.identityRowSmall}>
//             <LeaveAvatar
//               initials={getInitials(request.employee_name)}
//               color={typeColor}
//               size={36}
//             />
//             <View>
//               <Text style={s.employeeNameSmall}>{request.employee_name}</Text>
//               <Text style={s.employeeMetaSmall}>{request.employee_code}</Text>
//             </View>
//           </View>
//           <InfoRow label="Role" value={request.job_role_name} />
//           <InfoRow label="Department" value={request.department_name} />
//           <Pressable
//             onPress={() => onViewEmployee?.(request.employee_id)}
//             style={s.profileBtn}
//           >
//             <Text style={s.profileBtnText}>View Full Profile</Text>
//           </Pressable>
//         </View>

//         {/* Leave balance */}
//         <View style={s.card}>
//           <Text style={s.cardTitle}>Leave Balance</Text>
//           {balances.length === 0 ? (
//             <Text style={{ fontSize: 12, color: C.textMuted }}>
//               No balance data available.
//             </Text>
//           ) : (
//             balances.map((b) => (
//               <BalanceBar
//                 key={b.id}
//                 label={b.leave_type}
//                 used={b.used_days ?? 0}
//                 total={b.entitled_days ?? 0}
//                 color={balColors[b.leave_type] ?? C.textMuted}
//               />
//             ))
//           )}
//         </View>

//         <View style={{ height: 8 }} />
//       </ScrollView>

//       <ActionModal
//         visible={!!modal}
//         action={modal}
//         request={request}
//         loading={actionLoading}
//         onConfirm={handleConfirm}
//         onClose={() => setModal(null)}
//       />
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   container: { flex: 1, backgroundColor: C.bg },
//   center: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.bg,
//     padding: 24,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: C.border,
//     backgroundColor: C.bg,
//   },
//   headerBack: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   headerTitle: {
//     fontSize: 15,
//     fontWeight: "800",
//     color: C.textPrimary,
//     fontFamily: "monospace",
//   },
//   headerSubtitle: { fontSize: 11, color: C.textMuted, marginTop: 2 },

//   body: { padding: 16, gap: 14, paddingBottom: 24 },
//   card: {
//     padding: 16,
//     borderRadius: 18,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     gap: 14,
//   },
//   cardTitle: { fontSize: 13, fontWeight: "800", color: C.textPrimary },

//   identityRow: { flexDirection: "row", gap: 12 },
//   identityRowSmall: { flexDirection: "row", alignItems: "center", gap: 10 },
//   employeeName: { fontSize: 16, fontWeight: "800", color: C.textPrimary },
//   employeeNameSmall: { fontSize: 13, fontWeight: "800", color: C.textPrimary },
//   employeeMeta: { fontSize: 12, color: C.textMuted, marginTop: 2 },
//   employeeMetaSmall: { fontSize: 11, color: C.textMuted, marginTop: 1 },
//   badgeRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     marginTop: 8,
//   },
//   codeChip: {
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 8,
//     backgroundColor: C.surfaceAlt,
//   },
//   codeChipText: {
//     fontSize: 10,
//     color: C.textSecondary,
//     fontFamily: "monospace",
//   },

//   typeBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 14,
//     padding: 14,
//     borderRadius: 16,
//   },
//   typeBannerTitle: { fontSize: 14, fontWeight: "800" },
//   typeBannerDates: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
//   typeBannerDays: { fontSize: 22, fontWeight: "900" },
//   typeBannerDaysLabel: { fontSize: 10, color: C.textSecondary },

//   sectionLabelRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     marginBottom: 8,
//   },
//   sectionLabel: { fontSize: 12, fontWeight: "700", color: C.textSecondary },
//   reasonText: {
//     fontSize: 12,
//     lineHeight: 18,
//     padding: 12,
//     borderRadius: 12,
//     backgroundColor: C.surfaceAlt,
//     color: C.textPrimary,
//   },

//   actionRow: { flexDirection: "row", gap: 10 },
//   approveBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     paddingVertical: 12,
//     borderRadius: 14,
//     backgroundColor: C.success,
//   },
//   approveBtnText: { fontSize: 13, fontWeight: "800", color: "#fff" },
//   rejectBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     paddingVertical: 12,
//     borderRadius: 14,
//     backgroundColor: C.dangerLight,
//   },
//   rejectBtnText: { fontSize: 13, fontWeight: "800", color: C.danger },

//   infoRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 9,
//     borderBottomWidth: 1,
//     borderBottomColor: C.border,
//   },
//   infoLabel: { fontSize: 12, color: C.textSecondary },
//   infoValue: {
//     fontSize: 12,
//     fontWeight: "700",
//     color: C.textPrimary,
//     flexShrink: 1,
//     marginLeft: 12,
//   },

//   timelineRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
//   timelineIcon: {
//     width: 26,
//     height: 26,
//     borderRadius: 13,
//     borderWidth: 2,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   timelineLabel: { fontSize: 12, fontWeight: "700" },
//   timelineDate: { fontSize: 11, color: C.textMuted, marginTop: 1 },

//   profileBtn: {
//     paddingVertical: 11,
//     borderRadius: 14,
//     alignItems: "center",
//     backgroundColor: C.primaryLight,
//   },
//   profileBtnText: { fontSize: 12, fontWeight: "700", color: C.primary },

//   balanceHead: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 6,
//   },
//   balanceLabel: { fontSize: 12, color: C.textSecondary },
//   balanceValue: { fontSize: 12, fontWeight: "800", color: C.textPrimary },
//   balanceTrack: {
//     height: 7,
//     borderRadius: 4,
//     backgroundColor: C.surfaceAlt,
//     overflow: "hidden",
//   },
//   balanceFill: { height: "100%", borderRadius: 4 },
// });



// src/components/admin/leave/LeaveRequestDetailView.tsx
// Detail screen for a single leave request — opened from Requests or Dashboard.

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Briefcase,
  Building2,
  FileText,
  MessageSquare,
  AlertTriangle,
  UserCheck,
} from "lucide-react-native";

import C from "../../../styles/colors";
import { leaveApi } from "../../../api/service/leaveApi";
import { Loader } from "../../../hooks/loaderManager";
import {
  LeaveAvatar,
  LeaveStatusBadge,
  getTypeColor,
  getTypeLight,
  getTypeIcon,
  getInitials,
  fmtDate,
} from "./leaveShared";
import ActionModal from "./ActionModal";

interface Props {
  requestId: string;
  onClose: () => void;
  onViewEmployee?: (id: string) => void;
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue} numberOfLines={1}>
        {value ?? "—"}
      </Text>
    </View>
  );
}

function BalanceBar({
  label,
  used,
  total,
  color,
}: {
  label: string;
  used: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const remaining = total - used;
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={s.balanceHead}>
        <Text style={s.balanceLabel}>{label}</Text>
        <Text style={s.balanceValue}>
          {remaining} / {total} days left
        </Text>
      </View>
      <View style={s.balanceTrack}>
        <View
          style={[s.balanceFill, { width: `${pct}%`, backgroundColor: color }]}
        />
      </View>
    </View>
  );
}

export default function LeaveRequestDetailView({
  requestId,
  onClose,
  onViewEmployee,
}: Props) {
  const insets = useSafeAreaInsets();

  const [request, setRequest] = useState<any>(null);
  const [balances, setBalances] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<"approve" | "reject" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    Loader.show();
    setError(null);
    try {
      const [reqRes, balRes] = await Promise.all([
        leaveApi.getAllRequests({ limit: 200 }),
        leaveApi.getAllBalances(),
      ]);
      const all = reqRes.data ?? [];
      const found = all.find((r: any) => r.id === requestId);
      if (!found) {
        setError("Request not found.");
        return;
      }
      setRequest(found);
      const empBalances = (balRes.data ?? []).filter(
        (b: any) => b.employee_id === found.employee_id,
      );
      setBalances(empBalances);
    } catch {
      setError("Failed to load request details.");
    } finally {
      Loader.hide();
    }
  }, [requestId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleConfirm = async (comment: string) => {
    if (!modal || !request) return;
    setActionLoading(true);
    try {
      if (modal === "approve") {
        await leaveApi.approveRequest(request.id, { comment });
        setRequest((r: any) => ({
          ...r,
          status: "approved",
          approved_by_name: "You",
          approved_at: new Date().toISOString(),
        }));
      } else {
        await leaveApi.rejectRequest(request.id, { rejectionReason: comment });
        setRequest((r: any) => ({
          ...r,
          status: "rejected",
          rejection_reason: comment,
          approved_at: new Date().toISOString(),
        }));
      }
    } catch {
      // could surface a toast
    } finally {
      setActionLoading(false);
      setModal(null);
    }
  };

  if (error || !request) {
    return (
      <View style={[s.center, { paddingTop: insets.top }]}>
        <AlertTriangle size={32} color={C.danger} />
        <Text style={{ color: C.danger, marginTop: 10 }}>
          {error ?? "Request not found."}
        </Text>
        <Pressable onPress={onClose} style={[s.profileBtn, { marginTop: 14 }]}>
          <Text style={s.profileBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const typeColor = getTypeColor(request.leave_type);
  const typeLight = getTypeLight(request.leave_type);
  const TODAY = new Date().toISOString().split("T")[0];

  const timeline = [
    {
      label: "Request Submitted",
      date: fmtDate(request.created_at),
      done: true,
      Icon: FileText,
    },
    {
      label:
        request.status === "approved"
          ? "Approved"
          : request.status === "rejected"
            ? "Rejected"
            : "Awaiting Decision",
      date: fmtDate(request.approved_at),
      done: request.status !== "pending",
      Icon:
        request.status === "approved"
          ? CheckCircle2
          : request.status === "rejected"
            ? XCircle
            : Clock,
      color:
        request.status === "approved"
          ? C.success
          : request.status === "rejected"
            ? C.danger
            : C.warning,
    },
    {
      label: "Leave Start",
      date: request.start_date,
      done: request.start_date <= TODAY && request.status === "approved",
      Icon: Calendar,
    },
    {
      label: "Leave End",
      date: request.end_date,
      done: request.end_date < TODAY && request.status === "approved",
      Icon: UserCheck,
    },
  ];

  const balColors: Record<string, string> = {
    "Annual Leave": C.primary,
    "Sick Leave": C.danger,
    "Study Leave": C.success,
    "Maternity Leave": C.purple,
    "Paternity Leave": C.accent,
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={onClose} style={s.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle} numberOfLines={1}>
            {request.id?.slice(0, 8)}…
          </Text>
          <Text style={s.headerSubtitle}>Leave Request</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Header card */}
        <View style={s.card}>
          <View style={s.identityRow}>
            <LeaveAvatar
              initials={getInitials(request.employee_name)}
              color={typeColor}
              size={48}
            />
            <View style={{ flex: 1 }}>
              <Text style={s.employeeName}>{request.employee_name}</Text>
              <Text style={s.employeeMeta} numberOfLines={1}>
                {request.job_role_name} · {request.department_name}
              </Text>
              <View style={s.badgeRow}>
                <LeaveStatusBadge status={request.status} />
                <View style={s.codeChip}>
                  <Text style={s.codeChipText}>{request.employee_code}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[s.typeBanner, { backgroundColor: typeLight }]}>
            <Text style={{ fontSize: 22 }}>
              {getTypeIcon(request.leave_type)}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.typeBannerTitle, { color: typeColor }]}>
                {request.leave_type}
              </Text>
              <Text style={s.typeBannerDates}>
                {request.start_date} → {request.end_date}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[s.typeBannerDays, { color: typeColor }]}>
                {request.days}
              </Text>
              <Text style={s.typeBannerDaysLabel}>days</Text>
            </View>
          </View>

          {request.reason ? (
            <View>
              <View style={s.sectionLabelRow}>
                <MessageSquare size={12} color={C.textSecondary} />
                <Text style={s.sectionLabel}>Reason</Text>
              </View>
              <Text style={s.reasonText}>{request.reason}</Text>
            </View>
          ) : null}

          {(request.comment || request.rejection_reason) && (
            <View>
              <View style={s.sectionLabelRow}>
                <MessageSquare size={12} color={C.textSecondary} />
                <Text style={s.sectionLabel}>HR Comment</Text>
              </View>
              <Text
                style={[
                  s.reasonText,
                  {
                    backgroundColor:
                      request.status === "approved"
                        ? C.successLight
                        : C.dangerLight,
                  },
                ]}
              >
                {request.comment ?? request.rejection_reason}
              </Text>
            </View>
          )}

          {request.status?.toLowerCase() === "pending" && (
            <View style={s.actionRow}>
              <Pressable
                onPress={() => setModal("approve")}
                style={[s.approveBtn]}
              >
                <Check size={14} color="#fff" />
                <Text style={s.approveBtnText}>Approve</Text>
              </Pressable>
              <Pressable onPress={() => setModal("reject")} style={s.rejectBtn}>
                <X size={14} color={C.danger} />
                <Text style={s.rejectBtnText}>Reject</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Request details */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Request Details</Text>
          <InfoRow label="Request ID" value={request.id} />
          <InfoRow label="Applied On" value={fmtDate(request.created_at)} />
          <InfoRow label="Paid Leave" value={request.is_paid ? "Yes" : "No"} />
          {request.approved_by_name && (
            <InfoRow label="Reviewed By" value={request.approved_by_name} />
          )}
          {request.approved_at && (
            <InfoRow
              label="Decision Date"
              value={fmtDate(request.approved_at)}
            />
          )}
        </View>

        {/* Timeline */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Request Timeline</Text>
          <View style={{ gap: 14 }}>
            {timeline.map((t, i) => {
              const { Icon } = t;
              const color = t.done ? t.color || C.success : C.textMuted;
              return (
                <View key={i} style={s.timelineRow}>
                  <View
                    style={[
                      s.timelineIcon,
                      {
                        backgroundColor: t.done ? `${color}20` : C.surfaceAlt,
                        borderColor: t.done ? color : C.border,
                      },
                    ]}
                  >
                    <Icon size={12} color={color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        s.timelineLabel,
                        { color: t.done ? C.textPrimary : C.textMuted },
                      ]}
                    >
                      {t.label}
                    </Text>
                    <Text style={s.timelineDate}>{t.date}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Employee info */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Employee Info</Text>
          <View style={s.identityRowSmall}>
            <LeaveAvatar
              initials={getInitials(request.employee_name)}
              color={typeColor}
              size={36}
            />
            <View>
              <Text style={s.employeeNameSmall}>{request.employee_name}</Text>
              <Text style={s.employeeMetaSmall}>{request.employee_code}</Text>
            </View>
          </View>
          <InfoRow label="Role" value={request.job_role_name} />
          <InfoRow label="Department" value={request.department_name} />
          <Pressable
            onPress={() => onViewEmployee?.(request.employee_id)}
            style={s.profileBtn}
          >
            <Text style={s.profileBtnText}>View Full Profile</Text>
          </Pressable>
        </View>

        {/* Leave balance */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Leave Balance</Text>
          {balances.length === 0 ? (
            <Text style={{ fontSize: 12, color: C.textMuted }}>
              No balance data available.
            </Text>
          ) : (
            balances.map((b) => (
              <BalanceBar
                key={b.id}
                label={b.leave_type}
                used={b.used_days ?? 0}
                total={b.entitled_days ?? 0}
                color={balColors[b.leave_type] ?? C.textMuted}
              />
            ))
          )}
        </View>

        <View style={{ height: 8 }} />
      </ScrollView>

      <ActionModal
        visible={!!modal}
        action={modal}
        request={request}
        loading={actionLoading}
        onConfirm={handleConfirm}
        onClose={() => setModal(null)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg,
    padding: 24,
  },
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
  headerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: C.textPrimary,
    fontFamily: "monospace",
  },
  headerSubtitle: { fontSize: 11, color: C.textMuted, marginTop: 2 },

  body: { padding: 16, gap: 14, paddingBottom: 24 },
  card: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    gap: 14,
  },
  cardTitle: { fontSize: 13, fontWeight: "800", color: C.textPrimary },

  identityRow: { flexDirection: "row", gap: 12 },
  identityRowSmall: { flexDirection: "row", alignItems: "center", gap: 10 },
  employeeName: { fontSize: 16, fontWeight: "800", color: C.textPrimary },
  employeeNameSmall: { fontSize: 13, fontWeight: "800", color: C.textPrimary },
  employeeMeta: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  employeeMetaSmall: { fontSize: 11, color: C.textMuted, marginTop: 1 },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  codeChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: C.surfaceAlt,
  },
  codeChipText: {
    fontSize: 10,
    color: C.textSecondary,
    fontFamily: "monospace",
  },

  typeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 16,
  },
  typeBannerTitle: { fontSize: 14, fontWeight: "800" },
  typeBannerDates: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
  typeBannerDays: { fontSize: 22, fontWeight: "900" },
  typeBannerDaysLabel: { fontSize: 10, color: C.textSecondary },

  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: C.textSecondary },
  reasonText: {
    fontSize: 12,
    lineHeight: 18,
    padding: 12,
    borderRadius: 12,
    backgroundColor: C.surfaceAlt,
    color: C.textPrimary,
  },

  actionRow: { flexDirection: "row", gap: 10 },
  approveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: C.success,
  },
  approveBtnText: { fontSize: 13, fontWeight: "800", color: "#fff" },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: C.dangerLight,
  },
  rejectBtnText: { fontSize: 13, fontWeight: "800", color: C.danger },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  infoLabel: { fontSize: 12, color: C.textSecondary },
  infoValue: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textPrimary,
    flexShrink: 1,
    marginLeft: 12,
  },

  timelineRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  timelineIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineLabel: { fontSize: 12, fontWeight: "700" },
  timelineDate: { fontSize: 11, color: C.textMuted, marginTop: 1 },

  profileBtn: {
    paddingVertical: 11,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.primaryLight,
  },
  profileBtnText: { fontSize: 12, fontWeight: "700", color: C.primary },

  balanceHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  balanceLabel: { fontSize: 12, color: C.textSecondary },
  balanceValue: { fontSize: 12, fontWeight: "800", color: C.textPrimary },
  balanceTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: C.surfaceAlt,
    overflow: "hidden",
  },
  balanceFill: { height: "100%", borderRadius: 4 },
});