

// // src/app/employee/leave.tsx
// // Employee Leave screen — wired to real backend (leaveApi).
// // No mock data. Mirrors web LeavePage data flow.

// import { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   Pressable,
//   StyleSheet,
//   RefreshControl,
//   ActivityIndicator,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { router } from "expo-router";
// import {
//   ArrowLeft,
//   Plus,
//   Plane,
//   BarChart2,
//   Clock,
//   Calendar,
//   FileText,
//   Filter,
//   AlertCircle,
//   RefreshCw,
// } from "lucide-react-native";
// import Toast from "react-native-toast-message";

// import C from "../../styles/colors";
// import Card from "../../components/ui/Card";
// import SectionHeader from "../../components/ui/SectionHeader";

// import LeaveBalanceCard, {
//   LeaveBalance,
// } from "../../components/leave/LeaveBalanceCard";
// import LeaveHistoryRow from "../../components/leave/LeaveHistoryRow";
// import LeaveDetailModal from "../../components/leave/LeaveDetailModal";
// import ApplyLeaveModal from "../../components/leave/ApplyLeaveModal";
// import LeaveSuccessModal from "../../components/leave/LeaveSuccessModal";
// import LeaveCalendar from "../../components/leave/LeaveCalendar";

// import { leaveApi } from "../../api/service/leaveApi";
// import { LeavePolicy, LeaveRequest } from "../../types/leave";

// type TabKey = "balances" | "apply" | "history" | "calendar";

// const TABS: { id: TabKey; label: string; Icon: typeof BarChart2 }[] = [
//   { id: "balances", label: "Balances", Icon: BarChart2 },
//   { id: "apply", label: "Apply", Icon: Plus },
//   { id: "history", label: "History", Icon: Clock },
//   { id: "calendar", label: "Calendar", Icon: Calendar },
// ];

// const STATUS_FILTERS = [
//   "All",
//   "Approved",
//   "Pending",
//   "Rejected",
//   "Cancelled",
// ] as const;

// // ── API → app-shape mappers ──────────────────────────────────
// // The API returns snake_case fields. Existing components
// // (LeaveBalanceCard, LeaveHistoryRow, LeaveDetailModal, LeaveCalendar,
// // ApplyLeaveModal) were built against camelCase props, so we normalize
// // here rather than touching every leaf component.

// function mapPolicy(p: any): LeavePolicy {
//   return {
//     id: p.id,
//     name: p.name,
//     leaveType: p.leave_type,
//     daysAllowed: p.days_allowed,
//     requiresDocument: !!p.requires_document,
//   } as LeavePolicy;
// }

// function mapBalance(b: any, pendingDays: number): LeaveBalance {
//   return {
//     id: b.id ?? b.leave_policy_id,
//     leaveType: b.leave_type,
//     policyName: b.policy_name,
//     taken: Number(b.taken ?? 0),
//     entitled: Number(b.entitled ?? 0),
//     remaining: Number(b.remaining ?? b.remaining_days ?? 0),
//     pendingDays,
//   };
// }

// function mapHistory(lv: any): LeaveRequest {
//   return {
//     id: lv.id,
//     leaveType: lv.leave_type,
//     policyName: lv.policy_name,
//     startDate: lv.start_date,
//     endDate: lv.end_date,
//     days: Number(lv.days ?? 0),
//     status: (lv.status ?? "pending") as
//       | "approved"
//       | "pending"
//       | "rejected"
//       | "cancelled",
//     reason: lv.reason,
//     createdAt: lv.created_at,
//     isPaid: lv.is_paid !== false,
//     approvedByName: lv.approved_by_name,
//     rejectionReason: lv.rejection_reason,
//   } as LeaveRequest;
// }

// function countWorkdays(startStr: string, endStr: string) {
//   if (!startStr || !endStr) return 0;
//   const s = new Date(startStr);
//   const e = new Date(endStr);
//   if (e < s) return 0;
//   let count = 0;
//   for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
//     const dow = d.getDay();
//     if (dow !== 0 && dow !== 6) count++;
//   }
//   return count;
// }

// export default function LeaveScreen() {
//   const insets = useSafeAreaInsets();

//   const [policies, setPolicies] = useState<LeavePolicy[]>([]);
//   const [rawBalances, setRawBalances] = useState<any[]>([]);
//   const [history, setHistory] = useState<LeaveRequest[]>([]);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);

//   const [activeTab, setActiveTab] = useState<TabKey>("balances");
//   const [filterStatus, setFilterStatus] =
//     useState<(typeof STATUS_FILTERS)[number]>("All");

//   const [applyOpen, setApplyOpen] = useState(false);
//   const [applyInitialPolicyId, setApplyInitialPolicyId] = useState<
//     string | undefined
//   >(undefined);
//   const [submitting, setSubmitting] = useState(false);
//   const [successOpen, setSuccessOpen] = useState(false);

//   const [detailLeave, setDetailLeave] = useState<LeaveRequest | null>(null);

//   // ── Derive balances with pendingDays computed from history,
//   // matching web's logic exactly ──
//   const balances: LeaveBalance[] = useMemo(() => {
//     return rawBalances.map((b) => {
//       const pendingDays = history
//         .filter((l) => l.leaveType === b.leave_type && l.status === "pending")
//         .reduce((s, l) => s + l.days, 0);
//       return mapBalance(b, pendingDays);
//     });
//   }, [rawBalances, history]);

//   const loadData = useCallback(async () => {
//     setError(null);
//     try {
//       const [balRes, polRes, histRes] = await Promise.all([
//         leaveApi.getMyBalances(),
//         leaveApi.getPolicies(),
//         leaveApi.getMyRequests(),
//       ]);

//       setRawBalances(balRes?.data ?? []);
//       setPolicies((polRes?.data ?? []).map(mapPolicy));
//       setHistory((histRes?.data ?? []).map(mapHistory));
//     } catch (err: any) {
//       setError(
//         err?.response?.data?.message ??
//           (err?.isNetworkError || err?.isTimeout
//             ? err.message
//             : "Failed to load leave data. Please try again."),
//       );
//     }
//   }, []);

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       await loadData();
//       setLoading(false);
//     })();
//   }, [loadData]);

//   const totalAvailable = useMemo(
//     () => balances.reduce((s, b) => s + b.remaining, 0),
//     [balances],
//   );
//   const totalPending = useMemo(
//     () =>
//       history
//         .filter((l) => l.status === "pending")
//         .reduce((s, l) => s + l.days, 0),
//     [history],
//   );
//   const totalTakenYTD = useMemo(
//     () =>
//       history
//         .filter((l) => l.status === "approved")
//         .reduce((s, l) => s + l.days, 0),
//     [history],
//   );

//   const filteredHistory = useMemo(() => {
//     if (filterStatus === "All") return history;
//     return history.filter((l) => l.status === filterStatus.toLowerCase());
//   }, [history, filterStatus]);

//   function handleOpenApply(balance?: LeaveBalance) {
//     // Resolve the policy id matching this balance (balance.id may already
//     // be the leave_policy_id, but fall back to leaveType match).
//     const matched = policies.find(
//       (p) => p.id === balance?.id || p.leaveType === balance?.leaveType,
//     );
//     setApplyInitialPolicyId(matched?.id ?? balance?.id);
//     setApplyOpen(true);
//   }

//   async function handleSubmitApply(form: {
//     policyId: string;
//     startDate: string;
//     endDate: string;
//     reason: string;
//   }) {
//     setSubmitting(true);
//     try {
//       await leaveApi.submitRequest({
//         leavePolicyId: form.policyId,
//         startDate: form.startDate,
//         endDate: form.endDate,
//         reason: form.reason,
//       });
//       await loadData();
//       setApplyOpen(false);
//       setSuccessOpen(true);
//       Toast.show({ type: "success", text1: "Leave request submitted" });
//     } catch (err: any) {
//       const msg =
//         err?.response?.data?.message ?? "Failed to submit leave request.";
//       Toast.show({ type: "error", text1: msg });
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   async function handleRefresh() {
//     setRefreshing(true);
//     await loadData();
//     setRefreshing(false);
//   }

//   if (loading) {
//     return (
//       <View
//         style={[styles.screen, styles.centerFull, { paddingTop: insets.top }]}
//       >
//         <ActivityIndicator size="small" color={C.primary} />
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.screen, { paddingTop: insets.top }]}>
//       {/* ── Header ── */}
//       <View style={styles.header}>
//         <Pressable
//           onPress={() => router.back()}
//           hitSlop={8}
//           style={styles.backBtn}
//         >
//           <ArrowLeft size={18} color={C.textSecondary} />
//         </Pressable>
//         <Text style={styles.headerTitle}>My Leave</Text>
//         <Pressable
//           onPress={() => handleOpenApply()}
//           hitSlop={8}
//           style={styles.addBtn}
//         >
//           <Plus size={18} color="#fff" />
//         </Pressable>
//       </View>

//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={styles.scrollContent}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={handleRefresh}
//             tintColor={C.primary}
//           />
//         }
//         showsVerticalScrollIndicator={false}
//       >
//         {/* ── Hero ── */}
//         <View style={styles.hero}>
//           <View style={styles.heroTopRow}>
//             <View style={styles.heroIconWrap}>
//               <Plane size={20} color="#fff" />
//             </View>
//             <Text style={styles.heroTitle}>My Leave</Text>
//           </View>

//           <View style={styles.heroStatsRow}>
//             {[
//               { label: "Available", value: totalAvailable, color: "#A5F3FC" },
//               { label: "Pending", value: totalPending, color: "#FDE68A" },
//               { label: "Taken YTD", value: totalTakenYTD, color: "#BBF7D0" },
//             ].map((s) => (
//               <View key={s.label} style={styles.heroStatTile}>
//                 <Text style={[styles.heroStatValue, { color: s.color }]}>
//                   {s.value}
//                 </Text>
//                 <Text style={styles.heroStatLabel}>{s.label}</Text>
//               </View>
//             ))}
//           </View>
//         </View>

//         {/* ── Error banner ── */}
//         {error ? (
//           <View style={styles.errorBanner}>
//             <AlertCircle size={15} color={C.danger} />
//             <Text style={styles.errorText}>{error}</Text>
//             <Pressable onPress={loadData} hitSlop={8}>
//               <RefreshCw size={14} color={C.danger} />
//             </Pressable>
//           </View>
//         ) : null}

//         {/* ── Tabs ── */}
//         <View style={styles.tabsRow}>
//           {TABS.map((t) => {
//             const active = activeTab === t.id;
//             return (
//               <Pressable
//                 key={t.id}
//                 onPress={() => setActiveTab(t.id)}
//                 style={[styles.tabBtn, active && styles.tabBtnActive]}
//               >
//                 <t.Icon size={13} color={active ? "#fff" : C.textSecondary} />
//                 <Text
//                   style={[
//                     styles.tabLabel,
//                     { color: active ? "#fff" : C.textSecondary },
//                   ]}
//                 >
//                   {t.label}
//                 </Text>
//               </Pressable>
//             );
//           })}
//         </View>

//         {/* ── Balances tab ── */}
//         {activeTab === "balances" && (
//           <>
//             {balances.length === 0 && !error ? (
//               <Card padded style={styles.emptyCard}>
//                 <Calendar size={28} color={C.textMuted} />
//                 <Text style={styles.emptyTitle}>No leave balances found</Text>
//                 <Text style={styles.emptySubtitle}>
//                   Contact HR to set up your leave policies.
//                 </Text>
//               </Card>
//             ) : (
//               <View style={styles.balancesGrid}>
//                 {balances.map((b) => (
//                   <LeaveBalanceCard
//                     key={b.id}
//                     balance={b}
//                     onApply={handleOpenApply}
//                   />
//                 ))}
//               </View>
//             )}
//           </>
//         )}

//         {/* ── Apply tab (shortcut card → opens modal) ── */}
//         {activeTab === "apply" && (
//           <Card padded style={styles.applyPromptCard}>
//             <View style={styles.applyPromptIconWrap}>
//               <Plus size={22} color={C.primary} />
//             </View>
//             <Text style={styles.applyPromptTitle}>Apply for Leave</Text>
//             <Text style={styles.applyPromptSubtitle}>
//               Pick a leave type, choose your dates, and submit for approval.
//             </Text>
//             <Pressable
//               onPress={() => handleOpenApply()}
//               style={({ pressed }) => [
//                 styles.applyPromptBtn,
//                 pressed && { opacity: 0.88 },
//               ]}
//             >
//               <Text style={styles.applyPromptBtnLabel}>Start Application</Text>
//             </Pressable>
//           </Card>
//         )}

//         {/* ── History tab ── */}
//         {activeTab === "history" && (
//           <Card padded style={styles.historyCard}>
//             <View style={styles.historyHeaderRow}>
//               <SectionHeader title="Leave History" showChevron={false} />
//               <Text style={styles.historyCount}>{filteredHistory.length}</Text>
//             </View>

//             <View style={styles.filterRow}>
//               <Filter size={12} color={C.textMuted} />
//               <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                 <View style={{ flexDirection: "row", gap: 6 }}>
//                   {STATUS_FILTERS.map((f) => {
//                     const active = filterStatus === f;
//                     return (
//                       <Pressable
//                         key={f}
//                         onPress={() => setFilterStatus(f)}
//                         style={[
//                           styles.filterChip,
//                           active && styles.filterChipActive,
//                         ]}
//                       >
//                         <Text
//                           style={[
//                             styles.filterChipLabel,
//                             { color: active ? "#fff" : C.textSecondary },
//                           ]}
//                         >
//                           {f}
//                         </Text>
//                       </Pressable>
//                     );
//                   })}
//                 </View>
//               </ScrollView>
//             </View>

//             {filteredHistory.length === 0 ? (
//               <View style={styles.emptyState}>
//                 <View style={styles.emptyIconWrap}>
//                   <FileText size={22} color={C.textMuted} />
//                 </View>
//                 <Text style={styles.emptyTitle}>No leave records found</Text>
//                 <Text style={styles.emptySubtitle}>
//                   {filterStatus !== "All"
//                     ? "Try a different filter"
//                     : "Your leave history will appear here"}
//                 </Text>
//               </View>
//             ) : (
//               <View style={styles.historyList}>
//                 {filteredHistory.map((lv) => (
//                   <LeaveHistoryRow
//                     key={lv.id}
//                     leave={lv}
//                     onPress={(leave) => setDetailLeave(leave)}
//                   />
//                 ))}
//               </View>
//             )}
//           </Card>
//         )}

//         {/* ── Calendar tab ── */}
//         {activeTab === "calendar" && <LeaveCalendar history={history} />}

//         <View style={{ height: 24 }} />
//       </ScrollView>

//       {/* ── Modals ── */}
//       <ApplyLeaveModal
//         open={applyOpen}
//         policies={policies}
//         balances={balances}
//         initialPolicyId={applyInitialPolicyId}
//         onClose={() => setApplyOpen(false)}
//         onSubmit={handleSubmitApply}
//         submitting={submitting}
//       />

//       <LeaveSuccessModal
//         open={successOpen}
//         onViewHistory={() => {
//           setSuccessOpen(false);
//           setActiveTab("history");
//         }}
//         onApplyAnother={() => {
//           setSuccessOpen(false);
//           handleOpenApply();
//         }}
//       />

//       <LeaveDetailModal
//         leave={detailLeave}
//         onClose={() => setDetailLeave(null)}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1, backgroundColor: C.bg },
//   centerFull: { alignItems: "center", justifyContent: "center" },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     gap: 12,
//   },
//   backBtn: {
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
//     flex: 1,
//     fontSize: 17,
//     fontWeight: "700",
//     color: C.textPrimary,
//   },
//   addBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.primary,
//   },
//   scrollContent: { paddingHorizontal: 16, gap: 14, paddingBottom: 12 },
//   hero: { borderRadius: 20, padding: 18, backgroundColor: C.navy, gap: 16 },
//   heroTopRow: { flexDirection: "row", alignItems: "center", gap: 12 },
//   heroIconWrap: {
//     width: 42,
//     height: 42,
//     borderRadius: 14,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(255,255,255,0.15)",
//   },
//   heroTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
//   heroStatsRow: { flexDirection: "row", gap: 10 },
//   heroStatTile: {
//     flex: 1,
//     borderRadius: 14,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     backgroundColor: "rgba(255,255,255,0.10)",
//   },
//   heroStatValue: { fontSize: 20, fontWeight: "700" },
//   heroStatLabel: {
//     fontSize: 10.5,
//     color: "rgba(255,255,255,0.6)",
//     marginTop: 2,
//   },
//   errorBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     padding: 12,
//     borderRadius: 14,
//     backgroundColor: C.dangerLight,
//   },
//   errorText: { flex: 1, fontSize: 12, color: C.danger, fontWeight: "600" },
//   tabsRow: {
//     flexDirection: "row",
//     gap: 4,
//     padding: 4,
//     borderRadius: 14,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   tabBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 5,
//     paddingVertical: 9,
//     borderRadius: 10,
//   },
//   tabBtnActive: { backgroundColor: C.primary },
//   tabLabel: { fontSize: 11.5, fontWeight: "700" },
//   balancesGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 10,
//     justifyContent: "space-between",
//   },
//   emptyCard: { alignItems: "center", gap: 6, paddingVertical: 28 },
//   applyPromptCard: { alignItems: "center", gap: 6, paddingVertical: 28 },
//   applyPromptIconWrap: {
//     width: 52,
//     height: 52,
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.primaryLight,
//     marginBottom: 4,
//   },
//   applyPromptTitle: { fontSize: 15.5, fontWeight: "700", color: C.textPrimary },
//   applyPromptSubtitle: {
//     fontSize: 12.5,
//     color: C.textMuted,
//     textAlign: "center",
//     paddingHorizontal: 16,
//     marginBottom: 10,
//   },
//   applyPromptBtn: {
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 14,
//     backgroundColor: C.primary,
//   },
//   applyPromptBtnLabel: { fontSize: 13.5, fontWeight: "700", color: "#fff" },
//   historyCard: { gap: 10 },
//   historyHeaderRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   historyCount: {
//     fontSize: 11,
//     fontWeight: "700",
//     color: C.textMuted,
//     backgroundColor: C.surfaceAlt,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 999,
//     marginTop: -12,
//   },
//   filterRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     marginBottom: 4,
//   },
//   filterChip: {
//     paddingVertical: 6,
//     paddingHorizontal: 11,
//     borderRadius: 999,
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
//   filterChipLabel: { fontSize: 11, fontWeight: "700" },
//   historyList: { gap: 8 },
//   emptyState: { alignItems: "center", gap: 8, paddingVertical: 28 },
//   emptyIconWrap: {
//     width: 50,
//     height: 50,
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surfaceAlt,
//   },
//   emptyTitle: { fontSize: 13.5, fontWeight: "700", color: C.textSecondary },
//   emptySubtitle: { fontSize: 12, color: C.textMuted },
// });



// src/app/employee/leave.tsx
// Employee Leave screen — wired to real backend (leaveApi).
// No mock data. Mirrors web LeavePage data flow.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ArrowLeft,
  Plus,
  Plane,
  BarChart2,
  Clock,
  Calendar,
  FileText,
  Filter,
  AlertCircle,
  RefreshCw,
} from "lucide-react-native";
import Toast from "react-native-toast-message";

import C from "../../styles/colors";
import Card from "../../components/ui/Card";
import SectionHeader from "../../components/ui/SectionHeader";

import LeaveBalanceCard, {
  LeaveBalance,
} from "../../components/leave/LeaveBalanceCard";
import LeaveHistoryRow from "../../components/leave/LeaveHistoryRow";
import LeaveDetailModal from "../../components/leave/LeaveDetailModal";
import ApplyLeaveModal from "../../components/leave/ApplyLeaveModal";
import LeaveSuccessModal from "../../components/leave/LeaveSuccessModal";
import LeaveCalendar from "../../components/leave/LeaveCalendar";
import BantaHRLetterLoader, {
  BantaHRLetterLoaderRef,
} from "../../components/BantaHRLetterLoader";

import { leaveApi } from "../../api/service/leaveApi";
import { LeavePolicy, LeaveRequest } from "../../types/leave";

type TabKey = "balances" | "apply" | "history" | "calendar";

const TABS: { id: TabKey; label: string; Icon: typeof BarChart2 }[] = [
  { id: "balances", label: "Balances", Icon: BarChart2 },
  { id: "apply", label: "Apply", Icon: Plus },
  { id: "history", label: "History", Icon: Clock },
  { id: "calendar", label: "Calendar", Icon: Calendar },
];

const STATUS_FILTERS = [
  "All",
  "Approved",
  "Pending",
  "Rejected",
  "Cancelled",
] as const;

// ── API → app-shape mappers ──────────────────────────────────
// The API returns snake_case fields. Existing components
// (LeaveBalanceCard, LeaveHistoryRow, LeaveDetailModal, LeaveCalendar,
// ApplyLeaveModal) were built against camelCase props, so we normalize
// here rather than touching every leaf component.

function mapPolicy(p: any): LeavePolicy {
  return {
    id: p.id,
    name: p.name,
    leaveType: p.leave_type,
    daysAllowed: p.days_allowed,
    requiresDocument: !!p.requires_document,
  } as LeavePolicy;
}

function mapBalance(b: any, pendingDays: number): LeaveBalance {
  return {
    id: b.id ?? b.leave_policy_id,
    leaveType: b.leave_type,
    policyName: b.policy_name,
    taken: Number(b.taken ?? 0),
    entitled: Number(b.entitled ?? 0),
    remaining: Number(b.remaining ?? b.remaining_days ?? 0),
    pendingDays,
  };
}

function mapHistory(lv: any): LeaveRequest {
  return {
    id: lv.id,
    leaveType: lv.leave_type,
    policyName: lv.policy_name,
    startDate: lv.start_date,
    endDate: lv.end_date,
    days: Number(lv.days ?? 0),
    status: (lv.status ?? "pending") as
      | "approved"
      | "pending"
      | "rejected"
      | "cancelled",
    reason: lv.reason,
    createdAt: lv.created_at,
    isPaid: lv.is_paid !== false,
    approvedByName: lv.approved_by_name,
    rejectionReason: lv.rejection_reason,
  } as LeaveRequest;
}

function countWorkdays(startStr: string, endStr: string) {
  if (!startStr || !endStr) return 0;
  const s = new Date(startStr);
  const e = new Date(endStr);
  if (e < s) return 0;
  let count = 0;
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

export default function LeaveScreen() {
  const insets = useSafeAreaInsets();
  const loaderRef = useRef<BantaHRLetterLoaderRef>(null);

  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [rawBalances, setRawBalances] = useState<any[]>([]);
  const [history, setHistory] = useState<LeaveRequest[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState<TabKey>("balances");
  const [filterStatus, setFilterStatus] =
    useState<(typeof STATUS_FILTERS)[number]>("All");

  const [applyOpen, setApplyOpen] = useState(false);
  const [applyInitialPolicyId, setApplyInitialPolicyId] = useState<
    string | undefined
  >(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const [detailLeave, setDetailLeave] = useState<LeaveRequest | null>(null);

  // ── Derive balances with pendingDays computed from history,
  // matching web's logic exactly ──
  const balances: LeaveBalance[] = useMemo(() => {
    return rawBalances.map((b) => {
      const pendingDays = history
        .filter((l) => l.leaveType === b.leave_type && l.status === "pending")
        .reduce((s, l) => s + l.days, 0);
      return mapBalance(b, pendingDays);
    });
  }, [rawBalances, history]);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [balRes, polRes, histRes] = await Promise.all([
        leaveApi.getMyBalances(),
        leaveApi.getPolicies(),
        leaveApi.getMyRequests(),
      ]);

      setRawBalances(balRes?.data ?? []);
      setPolicies((polRes?.data ?? []).map(mapPolicy));
      setHistory((histRes?.data ?? []).map(mapHistory));
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          (err?.isNetworkError || err?.isTimeout
            ? err.message
            : "Failed to load leave data. Please try again."),
      );
    }
  }, []);

  useEffect(() => {
    (async () => {
      loaderRef.current?.show();
      try {
        await loadData();
      } finally {
        loaderRef.current?.hide();
      }
    })();
  }, [loadData]);

  const totalAvailable = useMemo(
    () => balances.reduce((s, b) => s + b.remaining, 0),
    [balances],
  );
  const totalPending = useMemo(
    () =>
      history
        .filter((l) => l.status === "pending")
        .reduce((s, l) => s + l.days, 0),
    [history],
  );
  const totalTakenYTD = useMemo(
    () =>
      history
        .filter((l) => l.status === "approved")
        .reduce((s, l) => s + l.days, 0),
    [history],
  );

  const filteredHistory = useMemo(() => {
    if (filterStatus === "All") return history;
    return history.filter((l) => l.status === filterStatus.toLowerCase());
  }, [history, filterStatus]);

  function handleOpenApply(balance?: LeaveBalance) {
    // Resolve the policy id matching this balance (balance.id may already
    // be the leave_policy_id, but fall back to leaveType match).
    const matched = policies.find(
      (p) => p.id === balance?.id || p.leaveType === balance?.leaveType,
    );
    setApplyInitialPolicyId(matched?.id ?? balance?.id);
    setApplyOpen(true);
  }

  async function handleSubmitApply(form: {
    policyId: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) {
    setSubmitting(true);
    try {
      await leaveApi.submitRequest({
        leavePolicyId: form.policyId,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
      });
      await loadData();
      setApplyOpen(false);
      setSuccessOpen(true);
      Toast.show({ type: "success", text1: "Leave request submitted" });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? "Failed to submit leave request.";
      Toast.show({ type: "error", text1: msg });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backBtn}
        >
          <ArrowLeft size={18} color={C.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>My Leave</Text>
        <Pressable
          onPress={() => handleOpenApply()}
          hitSlop={8}
          style={styles.addBtn}
        >
          <Plus size={18} color="#fff" />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={C.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconWrap}>
              <Plane size={20} color="#fff" />
            </View>
            <Text style={styles.heroTitle}>My Leave</Text>
          </View>

          <View style={styles.heroStatsRow}>
            {[
              { label: "Available", value: totalAvailable, color: "#A5F3FC" },
              { label: "Pending", value: totalPending, color: "#FDE68A" },
              { label: "Taken YTD", value: totalTakenYTD, color: "#BBF7D0" },
            ].map((s) => (
              <View key={s.label} style={styles.heroStatTile}>
                <Text style={[styles.heroStatValue, { color: s.color }]}>
                  {s.value}
                </Text>
                <Text style={styles.heroStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Error banner ── */}
        {error ? (
          <View style={styles.errorBanner}>
            <AlertCircle size={15} color={C.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={loadData} hitSlop={8}>
              <RefreshCw size={14} color={C.danger} />
            </Pressable>
          </View>
        ) : null}

        {/* ── Tabs ── */}
        <View style={styles.tabsRow}>
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setActiveTab(t.id)}
                style={[styles.tabBtn, active && styles.tabBtnActive]}
              >
                <t.Icon size={13} color={active ? "#fff" : C.textSecondary} />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: active ? "#fff" : C.textSecondary },
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── Balances tab ── */}
        {activeTab === "balances" && (
          <>
            {balances.length === 0 && !error ? (
              <Card padded style={styles.emptyCard}>
                <Calendar size={28} color={C.textMuted} />
                <Text style={styles.emptyTitle}>No leave balances found</Text>
                <Text style={styles.emptySubtitle}>
                  Contact HR to set up your leave policies.
                </Text>
              </Card>
            ) : (
              <View style={styles.balancesGrid}>
                {balances.map((b) => (
                  <LeaveBalanceCard
                    key={b.id}
                    balance={b}
                    onApply={handleOpenApply}
                  />
                ))}
              </View>
            )}
          </>
        )}

        {/* ── Apply tab (shortcut card → opens modal) ── */}
        {activeTab === "apply" && (
          <Card padded style={styles.applyPromptCard}>
            <View style={styles.applyPromptIconWrap}>
              <Plus size={22} color={C.primary} />
            </View>
            <Text style={styles.applyPromptTitle}>Apply for Leave</Text>
            <Text style={styles.applyPromptSubtitle}>
              Pick a leave type, choose your dates, and submit for approval.
            </Text>
            <Pressable
              onPress={() => handleOpenApply()}
              style={({ pressed }) => [
                styles.applyPromptBtn,
                pressed && { opacity: 0.88 },
              ]}
            >
              <Text style={styles.applyPromptBtnLabel}>Start Application</Text>
            </Pressable>
          </Card>
        )}

        {/* ── History tab ── */}
        {activeTab === "history" && (
          <Card padded style={styles.historyCard}>
            <View style={styles.historyHeaderRow}>
              <SectionHeader title="Leave History" showChevron={false} />
              <Text style={styles.historyCount}>{filteredHistory.length}</Text>
            </View>

            <View style={styles.filterRow}>
              <Filter size={12} color={C.textMuted} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {STATUS_FILTERS.map((f) => {
                    const active = filterStatus === f;
                    return (
                      <Pressable
                        key={f}
                        onPress={() => setFilterStatus(f)}
                        style={[
                          styles.filterChip,
                          active && styles.filterChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterChipLabel,
                            { color: active ? "#fff" : C.textSecondary },
                          ]}
                        >
                          {f}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {filteredHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <FileText size={22} color={C.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>No leave records found</Text>
                <Text style={styles.emptySubtitle}>
                  {filterStatus !== "All"
                    ? "Try a different filter"
                    : "Your leave history will appear here"}
                </Text>
              </View>
            ) : (
              <View style={styles.historyList}>
                {filteredHistory.map((lv) => (
                  <LeaveHistoryRow
                    key={lv.id}
                    leave={lv}
                    onPress={(leave) => setDetailLeave(leave)}
                  />
                ))}
              </View>
            )}
          </Card>
        )}

        {/* ── Calendar tab ── */}
        {activeTab === "calendar" && <LeaveCalendar history={history} />}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── Modals ── */}
      <ApplyLeaveModal
        open={applyOpen}
        policies={policies}
        balances={balances}
        initialPolicyId={applyInitialPolicyId}
        onClose={() => setApplyOpen(false)}
        onSubmit={handleSubmitApply}
        submitting={submitting}
      />

      <LeaveSuccessModal
        open={successOpen}
        onViewHistory={() => {
          setSuccessOpen(false);
          setActiveTab("history");
        }}
        onApplyAnother={() => {
          setSuccessOpen(false);
          handleOpenApply();
        }}
      />

      <LeaveDetailModal
        leave={detailLeave}
        onClose={() => setDetailLeave(null)}
      />

      {/* Global loader — the only loader in this screen */}
      <BantaHRLetterLoader
        ref={loaderRef}
        overlay
        subtitle="Loading leave data..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  centerFull: { alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
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
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: C.textPrimary,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
  },
  scrollContent: { paddingHorizontal: 16, gap: 14, paddingBottom: 12 },
  hero: { borderRadius: 20, padding: 18, backgroundColor: C.navy, gap: 16 },
  heroTopRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  heroTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  heroStatsRow: { flexDirection: "row", gap: 10 },
  heroStatTile: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  heroStatValue: { fontSize: 20, fontWeight: "700" },
  heroStatLabel: {
    fontSize: 10.5,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.dangerLight,
  },
  errorText: { flex: 1, fontSize: 12, color: C.danger, fontWeight: "600" },
  tabsRow: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
    borderRadius: 10,
  },
  tabBtnActive: { backgroundColor: C.primary },
  tabLabel: { fontSize: 11.5, fontWeight: "700" },
  balancesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  emptyCard: { alignItems: "center", gap: 6, paddingVertical: 28 },
  applyPromptCard: { alignItems: "center", gap: 6, paddingVertical: 28 },
  applyPromptIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
    marginBottom: 4,
  },
  applyPromptTitle: { fontSize: 15.5, fontWeight: "700", color: C.textPrimary },
  applyPromptSubtitle: {
    fontSize: 12.5,
    color: C.textMuted,
    textAlign: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  applyPromptBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  applyPromptBtnLabel: { fontSize: 13.5, fontWeight: "700", color: "#fff" },
  historyCard: { gap: 10 },
  historyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  historyCount: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    backgroundColor: C.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: -12,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 999,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterChipLabel: { fontSize: 11, fontWeight: "700" },
  historyList: { gap: 8 },
  emptyState: { alignItems: "center", gap: 8, paddingVertical: 28 },
  emptyIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
  },
  emptyTitle: { fontSize: 13.5, fontWeight: "700", color: C.textSecondary },
  emptySubtitle: { fontSize: 12, color: C.textMuted },
});