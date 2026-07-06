// // src/components/admin/leave/LeaveRequestsView.tsx
// // "Leave Requests" tab — mirrors EmployeeListView.tsx structure.

// import { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   TextInput,
//   ActivityIndicator,
//   RefreshControl,
//   FlatList,
//   ScrollView,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import {
//   FileText,
//   Search,
//   ChevronRight,
//   ChevronLeft,
//   Check,
//   X,
//   Eye,
//   SlidersHorizontal,
//   RefreshCw,
//   AlertCircle,
// } from "lucide-react-native";

// import C from "../../../styles/colors";
// import { leaveApi } from "../../../api/service/leaveApi";
// import {
//   LeaveAvatar,
//   LeaveStatusBadge,
//   LeaveTypePill,
//   getTypeColor,
//   getInitials,
//   fmtDate,
// } from "./leaveShared";
// import ActionModal from "./ActionModal";

// interface Props {
//   onClose: () => void;
//   onViewRequest?: (id: string) => void;
// }

// const STATUS_PILLS = ["", "pending", "approved", "rejected"];
// const PAGE_SIZE = 10;

// export default function LeaveRequestsView({ onClose, onViewRequest }: Props) {
//   const insets = useSafeAreaInsets();

//   const [requests, setRequests] = useState<any[]>([]);
//   const [policies, setPolicies] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);

//   const [search, setSearch] = useState("");
//   const [status, setStatus] = useState("");
//   const [leaveTypeFilter, setLeaveTypeFilter] = useState("");
//   const [filterOpen, setFilterOpen] = useState(false);
//   const [page, setPage] = useState(1);

//   const [modal, setModal] = useState<{
//     request: any;
//     action: "approve" | "reject";
//   } | null>(null);
//   const [actionLoading, setActionLoading] = useState(false);

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const [reqRes, polRes] = await Promise.all([
//         leaveApi.getAllRequests({ limit: 200 }),
//         leaveApi.getPolicies(),
//       ]);
//       setRequests(reqRes.data ?? []);
//       setPolicies(polRes.data ?? []);
//     } catch (err: any) {
//       setError(
//         err?.response?.data?.message ??
//           err?.message ??
//           "Failed to load requests.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     load();
//   }, [load]);

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await load();
//     setRefreshing(false);
//   }, [load]);

//   useEffect(() => {
//     setPage(1);
//   }, [search, status, leaveTypeFilter]);

//   const leaveTypes = useMemo(
//     () => [...new Set(policies.map((p) => p.leave_type).filter(Boolean))],
//     [policies],
//   );

//   const filtered = useMemo(() => {
//     let list = [...requests];
//     if (search) {
//       const q = search.toLowerCase();
//       list = list.filter(
//         (r) =>
//           r.employee_name?.toLowerCase().includes(q) ||
//           r.id?.toLowerCase().includes(q) ||
//           r.leave_type?.toLowerCase().includes(q) ||
//           r.department_name?.toLowerCase().includes(q),
//       );
//     }
//     if (status) list = list.filter((r) => r.status?.toLowerCase() === status);
//     if (leaveTypeFilter)
//       list = list.filter((r) => r.leave_type === leaveTypeFilter);
//     list.sort(
//       (a, b) =>
//         new Date(b.created_at ?? 0).getTime() -
//         new Date(a.created_at ?? 0).getTime(),
//     );
//     return list;
//   }, [requests, search, status, leaveTypeFilter]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
//   const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
//   const activeFilterCount = [status, leaveTypeFilter].filter(Boolean).length;

//   const handleConfirm = async (comment: string) => {
//     if (!modal) return;
//     setActionLoading(true);
//     try {
//       if (modal.action === "approve") {
//         await leaveApi.approveRequest(modal.request.id, { comment });
//         setRequests((prev) =>
//           prev.map((r) =>
//             r.id === modal.request.id ? { ...r, status: "approved" } : r,
//           ),
//         );
//       } else {
//         await leaveApi.rejectRequest(modal.request.id, {
//           rejectionReason: comment,
//         });
//         setRequests((prev) =>
//           prev.map((r) =>
//             r.id === modal.request.id ? { ...r, status: "rejected" } : r,
//           ),
//         );
//       }
//     } catch (err) {
//       // swallow — surfaced via error banner pattern would go here
//     } finally {
//       setActionLoading(false);
//       setModal(null);
//     }
//   };

//   const renderCard = ({ item: r }: { item: any }) => (
//     <Pressable
//       onPress={() => onViewRequest?.(r.id)}
//       style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
//     >
//       <View style={styles.cardHeader}>
//         <LeaveAvatar
//           initials={getInitials(r.employee_name)}
//           color={getTypeColor(r.leave_type)}
//           size={40}
//         />
//         <View style={{ flex: 1 }}>
//           <Text style={styles.cardName} numberOfLines={1}>
//             {r.employee_name}
//           </Text>
//           <Text style={styles.cardMeta} numberOfLines={1}>
//             {r.department_name ?? "—"} · {r.employee_code ?? "—"}
//           </Text>
//         </View>
//         <LeaveStatusBadge status={r.status} />
//       </View>

//       <View style={styles.cardBody}>
//         <LeaveTypePill type={r.leave_type} />
//         <Text style={styles.cardDates}>
//           {r.start_date} → {r.end_date}
//         </Text>
//         <Text style={styles.cardDays}>{r.days}d</Text>
//       </View>

//       <View style={styles.cardFooter}>
//         <Text style={styles.cardApplied}>Applied {fmtDate(r.created_at)}</Text>
//         <View style={styles.cardActions}>
//           {r.status?.toLowerCase() === "pending" && (
//             <>
//               <Pressable
//                 onPress={(e) => {
//                   e.stopPropagation();
//                   setModal({ request: r, action: "approve" });
//                 }}
//                 style={[styles.actionBtn, { backgroundColor: C.successLight }]}
//               >
//                 <Check size={13} color={C.success} />
//               </Pressable>
//               <Pressable
//                 onPress={(e) => {
//                   e.stopPropagation();
//                   setModal({ request: r, action: "reject" });
//                 }}
//                 style={[styles.actionBtn, { backgroundColor: C.dangerLight }]}
//               >
//                 <X size={13} color={C.danger} />
//               </Pressable>
//             </>
//           )}
//           <Pressable
//             onPress={() => onViewRequest?.(r.id)}
//             style={[styles.actionBtn, { backgroundColor: C.primaryLight }]}
//           >
//             <Eye size={13} color={C.primary} />
//           </Pressable>
//         </View>
//       </View>
//     </Pressable>
//   );

//   const renderHeader = () => (
//     <>
//       <View style={styles.searchBar}>
//         <View style={styles.searchInputWrap}>
//           <Search size={16} color={C.textMuted} />
//           <TextInput
//             value={search}
//             onChangeText={setSearch}
//             placeholder="Search name, ID, leave type…"
//             placeholderTextColor={C.textMuted}
//             style={styles.searchInput}
//           />
//           {search.length > 0 && (
//             <Pressable onPress={() => setSearch("")}>
//               <X size={16} color={C.textMuted} />
//             </Pressable>
//           )}
//         </View>
//         <Pressable
//           onPress={() => setFilterOpen((p) => !p)}
//           style={[
//             styles.iconBtn,
//             filterOpen && {
//               backgroundColor: C.primaryLight,
//               borderColor: C.primary + "44",
//             },
//           ]}
//         >
//           <SlidersHorizontal
//             size={17}
//             color={filterOpen ? C.primary : C.textSecondary}
//           />
//           {activeFilterCount > 0 && (
//             <View style={styles.filterBadge}>
//               <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
//             </View>
//           )}
//         </Pressable>
//         <Pressable onPress={load} style={styles.iconBtn}>
//           <RefreshCw size={16} color={C.textMuted} />
//         </Pressable>
//       </View>

//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.statusRow}
//       >
//         {STATUS_PILLS.map((st) => (
//           <Pressable
//             key={st}
//             onPress={() => setStatus(st)}
//             style={[
//               styles.statusChip,
//               status === st && styles.statusChipActive,
//             ]}
//           >
//             <Text
//               style={[
//                 styles.statusChipText,
//                 status === st && styles.statusChipTextActive,
//               ]}
//             >
//               {st || "All"}
//             </Text>
//           </Pressable>
//         ))}
//       </ScrollView>

//       {filterOpen && (
//         <View style={styles.filterSheet}>
//           <Text style={styles.filterGroupLabel}>Leave Type</Text>
//           <View style={styles.filterOptions}>
//             <Pressable
//               onPress={() => setLeaveTypeFilter("")}
//               style={[
//                 styles.filterChip,
//                 !leaveTypeFilter && styles.filterChipActive,
//               ]}
//             >
//               <Text
//                 style={[
//                   styles.filterChipText,
//                   !leaveTypeFilter && styles.filterChipTextActive,
//                 ]}
//               >
//                 All
//               </Text>
//             </Pressable>
//             {leaveTypes.map((t) => (
//               <Pressable
//                 key={t}
//                 onPress={() => setLeaveTypeFilter(t)}
//                 style={[
//                   styles.filterChip,
//                   leaveTypeFilter === t && styles.filterChipActive,
//                 ]}
//               >
//                 <Text
//                   style={[
//                     styles.filterChipText,
//                     leaveTypeFilter === t && styles.filterChipTextActive,
//                   ]}
//                 >
//                   {t}
//                 </Text>
//               </Pressable>
//             ))}
//           </View>
//         </View>
//       )}

//       {error && (
//         <View style={styles.errorBanner}>
//           <AlertCircle size={16} color={C.danger} />
//           <Text style={styles.errorBannerText}>{error}</Text>
//           <Pressable onPress={load}>
//             <RefreshCw size={14} color={C.danger} />
//           </Pressable>
//         </View>
//       )}
//     </>
//   );

//   const renderEmpty = () => (
//     <View style={styles.emptyState}>
//       <FileText size={44} color={C.textMuted} />
//       <Text style={styles.emptyTitle}>No requests found</Text>
//       <Text style={styles.emptyDesc}>
//         {search || activeFilterCount > 0
//           ? "Try a different search or filter"
//           : "Leave requests will appear here"}
//       </Text>
//     </View>
//   );

//   const renderFooter = () => {
//     if (loading || totalPages <= 1) return null;
//     return (
//       <View style={styles.pagination}>
//         <Pressable
//           onPress={() => setPage((p) => Math.max(1, p - 1))}
//           disabled={page === 1}
//           style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
//         >
//           <ChevronLeft
//             size={16}
//             color={page === 1 ? C.textMuted : C.textPrimary}
//           />
//         </Pressable>
//         <Text style={styles.pageIndicator}>
//           {page} / {totalPages}
//         </Text>
//         <Pressable
//           onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
//           disabled={page === totalPages}
//           style={[
//             styles.pageBtn,
//             page === totalPages && styles.pageBtnDisabled,
//           ]}
//         >
//           <ChevronRight
//             size={16}
//             color={page === totalPages ? C.textMuted : C.textPrimary}
//           />
//         </Pressable>
//       </View>
//     );
//   };

//   return (
//     <View style={[styles.container, { paddingTop: insets.top }]}>
//       <View style={styles.header}>
//         <Pressable onPress={onClose} style={styles.headerBack}>
//           <ChevronLeft size={20} color={C.textSecondary} />
//         </Pressable>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.headerTitle}>Leave Requests</Text>
//           <Text style={styles.headerSubtitle}>
//             {loading ? "Loading…" : `${filtered.length} requests`}
//           </Text>
//         </View>
//       </View>

//       <FlatList
//         data={paginated}
//         keyExtractor={(item) => item.id}
//         renderItem={renderCard}
//         ListHeaderComponent={renderHeader}
//         ListEmptyComponent={!loading ? renderEmpty : null}
//         ListFooterComponent={renderFooter}
//         contentContainerStyle={styles.listContent}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             tintColor={C.primary}
//           />
//         }
//       />

//       {loading && requests.length === 0 && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color={C.primary} />
//         </View>
//       )}

//       <ActionModal
//         visible={!!modal}
//         action={modal?.action ?? null}
//         request={modal?.request}
//         loading={actionLoading}
//         onConfirm={handleConfirm}
//         onClose={() => setModal(null)}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: C.bg },
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
//   headerTitle: { fontSize: 17, fontWeight: "800", color: C.textPrimary },
//   headerSubtitle: { fontSize: 12, color: C.textMuted, marginTop: 2 },

//   listContent: { padding: 16, paddingBottom: 24 },

//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     marginBottom: 12,
//   },
//   searchInputWrap: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderRadius: 14,
//     backgroundColor: C.surface,
//     borderWidth: 1.5,
//     borderColor: C.border,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 14,
//     color: C.textPrimary,
//     paddingVertical: 0,
//   },
//   iconBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   filterBadge: {
//     position: "absolute",
//     top: -4,
//     right: -4,
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     backgroundColor: C.primary,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   filterBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },

//   statusRow: { flexDirection: "row", gap: 8, paddingBottom: 12 },
//   statusChip: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   statusChipActive: { backgroundColor: C.primary, borderColor: C.primary },
//   statusChipText: {
//     fontSize: 11,
//     fontWeight: "700",
//     color: C.textSecondary,
//     textTransform: "capitalize",
//   },
//   statusChipTextActive: { color: "#fff" },

//   filterSheet: {
//     padding: 14,
//     borderRadius: 16,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     marginBottom: 12,
//     gap: 8,
//   },
//   filterGroupLabel: {
//     fontSize: 11,
//     fontWeight: "700",
//     color: C.textMuted,
//     textTransform: "uppercase",
//     letterSpacing: 0.6,
//   },
//   filterOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
//   filterChip: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 10,
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   filterChipActive: {
//     backgroundColor: C.primaryLight,
//     borderColor: C.primary + "44",
//   },
//   filterChipText: { fontSize: 12, color: C.textSecondary },
//   filterChipTextActive: { color: C.primary, fontWeight: "700" },

//   errorBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     padding: 12,
//     borderRadius: 14,
//     backgroundColor: C.dangerLight,
//     borderWidth: 1,
//     borderColor: C.danger + "33",
//     marginBottom: 12,
//   },
//   errorBannerText: {
//     flex: 1,
//     fontSize: 13,
//     fontWeight: "600",
//     color: C.danger,
//   },

//   card: {
//     padding: 14,
//     borderRadius: 16,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     marginBottom: 10,
//     gap: 10,
//   },
//   cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
//   cardName: { fontSize: 14, fontWeight: "700", color: C.textPrimary },
//   cardMeta: { fontSize: 11, color: C.textMuted, marginTop: 2 },
//   cardBody: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     flexWrap: "wrap",
//   },
//   cardDates: { fontSize: 12, color: C.textSecondary },
//   cardDays: {
//     fontSize: 12,
//     fontWeight: "800",
//     color: C.textPrimary,
//     marginLeft: "auto",
//   },
//   cardFooter: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: C.border,
//   },
//   cardApplied: { fontSize: 11, color: C.textMuted },
//   cardActions: { flexDirection: "row", gap: 8 },
//   actionBtn: {
//     width: 30,
//     height: 30,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   emptyState: { alignItems: "center", paddingVertical: 48, gap: 12 },
//   emptyTitle: { fontSize: 16, fontWeight: "700", color: C.textPrimary },
//   emptyDesc: { fontSize: 13, color: C.textMuted, textAlign: "center" },

//   pagination: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 14,
//     marginTop: 16,
//   },
//   pageBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   pageBtnDisabled: { opacity: 0.4 },
//   pageIndicator: { fontSize: 12, fontWeight: "700", color: C.textSecondary },

//   loadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.bg + "cc",
//   },
// });




// src/components/admin/leave/LeaveRequestsView.tsx
// "Leave Requests" tab — mirrors EmployeeListView.tsx structure.

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  RefreshControl,
  FlatList,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FileText,
  Search,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Eye,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
} from "lucide-react-native";

import C from "../../../styles/colors";
import { leaveApi } from "../../../api/service/leaveApi";
import { Loader } from "../../../hooks/loaderManager";
import {
  LeaveAvatar,
  LeaveStatusBadge,
  LeaveTypePill,
  getTypeColor,
  getInitials,
  fmtDate,
} from "./leaveShared";
import ActionModal from "./ActionModal";

interface Props {
  onClose: () => void;
  onViewRequest?: (id: string) => void;
}

const STATUS_PILLS = ["", "pending", "approved", "rejected"];
const PAGE_SIZE = 10;

export default function LeaveRequestsView({ onClose, onViewRequest }: Props) {
  const insets = useSafeAreaInsets();

  const [requests, setRequests] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState<{
    request: any;
    action: "approve" | "reject";
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    Loader.show();
    setError(null);
    try {
      const [reqRes, polRes] = await Promise.all([
        leaveApi.getAllRequests({ limit: 200 }),
        leaveApi.getPolicies(),
      ]);
      setRequests(reqRes.data ?? []);
      setPolicies(polRes.data ?? []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to load requests.",
      );
    } finally {
      Loader.hide();
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, status, leaveTypeFilter]);

  const leaveTypes = useMemo(
    () => [...new Set(policies.map((p) => p.leave_type).filter(Boolean))],
    [policies],
  );

  const filtered = useMemo(() => {
    let list = [...requests];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.employee_name?.toLowerCase().includes(q) ||
          r.id?.toLowerCase().includes(q) ||
          r.leave_type?.toLowerCase().includes(q) ||
          r.department_name?.toLowerCase().includes(q),
      );
    }
    if (status) list = list.filter((r) => r.status?.toLowerCase() === status);
    if (leaveTypeFilter)
      list = list.filter((r) => r.leave_type === leaveTypeFilter);
    list.sort(
      (a, b) =>
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime(),
    );
    return list;
  }, [requests, search, status, leaveTypeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeFilterCount = [status, leaveTypeFilter].filter(Boolean).length;

  const handleConfirm = async (comment: string) => {
    if (!modal) return;
    setActionLoading(true);
    try {
      if (modal.action === "approve") {
        await leaveApi.approveRequest(modal.request.id, { comment });
        setRequests((prev) =>
          prev.map((r) =>
            r.id === modal.request.id ? { ...r, status: "approved" } : r,
          ),
        );
      } else {
        await leaveApi.rejectRequest(modal.request.id, {
          rejectionReason: comment,
        });
        setRequests((prev) =>
          prev.map((r) =>
            r.id === modal.request.id ? { ...r, status: "rejected" } : r,
          ),
        );
      }
    } catch (err) {
      // swallow — surfaced via error banner pattern would go here
    } finally {
      setActionLoading(false);
      setModal(null);
    }
  };

  const renderCard = ({ item: r }: { item: any }) => (
    <Pressable
      onPress={() => onViewRequest?.(r.id)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.cardHeader}>
        <LeaveAvatar
          initials={getInitials(r.employee_name)}
          color={getTypeColor(r.leave_type)}
          size={40}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.cardName} numberOfLines={1}>
            {r.employee_name}
          </Text>
          <Text style={styles.cardMeta} numberOfLines={1}>
            {r.department_name ?? "—"} · {r.employee_code ?? "—"}
          </Text>
        </View>
        <LeaveStatusBadge status={r.status} />
      </View>

      <View style={styles.cardBody}>
        <LeaveTypePill type={r.leave_type} />
        <Text style={styles.cardDates}>
          {r.start_date} → {r.end_date}
        </Text>
        <Text style={styles.cardDays}>{r.days}d</Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.cardApplied}>Applied {fmtDate(r.created_at)}</Text>
        <View style={styles.cardActions}>
          {r.status?.toLowerCase() === "pending" && (
            <>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  setModal({ request: r, action: "approve" });
                }}
                style={[styles.actionBtn, { backgroundColor: C.successLight }]}
              >
                <Check size={13} color={C.success} />
              </Pressable>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  setModal({ request: r, action: "reject" });
                }}
                style={[styles.actionBtn, { backgroundColor: C.dangerLight }]}
              >
                <X size={13} color={C.danger} />
              </Pressable>
            </>
          )}
          <Pressable
            onPress={() => onViewRequest?.(r.id)}
            style={[styles.actionBtn, { backgroundColor: C.primaryLight }]}
          >
            <Eye size={13} color={C.primary} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  const renderHeader = () => (
    <>
      <View style={styles.searchBar}>
        <View style={styles.searchInputWrap}>
          <Search size={16} color={C.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search name, ID, leave type…"
            placeholderTextColor={C.textMuted}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <X size={16} color={C.textMuted} />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={() => setFilterOpen((p) => !p)}
          style={[
            styles.iconBtn,
            filterOpen && {
              backgroundColor: C.primaryLight,
              borderColor: C.primary + "44",
            },
          ]}
        >
          <SlidersHorizontal
            size={17}
            color={filterOpen ? C.primary : C.textSecondary}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
        <Pressable onPress={load} style={styles.iconBtn}>
          <RefreshCw size={16} color={C.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statusRow}
      >
        {STATUS_PILLS.map((st) => (
          <Pressable
            key={st}
            onPress={() => setStatus(st)}
            style={[
              styles.statusChip,
              status === st && styles.statusChipActive,
            ]}
          >
            <Text
              style={[
                styles.statusChipText,
                status === st && styles.statusChipTextActive,
              ]}
            >
              {st || "All"}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {filterOpen && (
        <View style={styles.filterSheet}>
          <Text style={styles.filterGroupLabel}>Leave Type</Text>
          <View style={styles.filterOptions}>
            <Pressable
              onPress={() => setLeaveTypeFilter("")}
              style={[
                styles.filterChip,
                !leaveTypeFilter && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  !leaveTypeFilter && styles.filterChipTextActive,
                ]}
              >
                All
              </Text>
            </Pressable>
            {leaveTypes.map((t) => (
              <Pressable
                key={t}
                onPress={() => setLeaveTypeFilter(t)}
                style={[
                  styles.filterChip,
                  leaveTypeFilter === t && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    leaveTypeFilter === t && styles.filterChipTextActive,
                  ]}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <AlertCircle size={16} color={C.danger} />
          <Text style={styles.errorBannerText}>{error}</Text>
          <Pressable onPress={load}>
            <RefreshCw size={14} color={C.danger} />
          </Pressable>
        </View>
      )}
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <FileText size={44} color={C.textMuted} />
      <Text style={styles.emptyTitle}>No requests found</Text>
      <Text style={styles.emptyDesc}>
        {search || activeFilterCount > 0
          ? "Try a different search or filter"
          : "Leave requests will appear here"}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (totalPages <= 1) return null;
    return (
      <View style={styles.pagination}>
        <Pressable
          onPress={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
        >
          <ChevronLeft
            size={16}
            color={page === 1 ? C.textMuted : C.textPrimary}
          />
        </Pressable>
        <Text style={styles.pageIndicator}>
          {page} / {totalPages}
        </Text>
        <Pressable
          onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          style={[
            styles.pageBtn,
            page === totalPages && styles.pageBtnDisabled,
          ]}
        >
          <ChevronRight
            size={16}
            color={page === totalPages ? C.textMuted : C.textPrimary}
          />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Leave Requests</Text>
          <Text style={styles.headerSubtitle}>
            {`${filtered.length} requests`}
          </Text>
        </View>
      </View>

      <FlatList
        data={paginated}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
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

      <ActionModal
        visible={!!modal}
        action={modal?.action ?? null}
        request={modal?.request}
        loading={actionLoading}
        onConfirm={handleConfirm}
        onClose={() => setModal(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
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

  listContent: { padding: 16, paddingBottom: 24 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  searchInputWrap: {
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
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },

  statusRow: { flexDirection: "row", gap: 8, paddingBottom: 12 },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  statusChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  statusChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textSecondary,
    textTransform: "capitalize",
  },
  statusChipTextActive: { color: "#fff" },

  filterSheet: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 12,
    gap: 8,
  },
  filterGroupLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  filterOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
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

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.dangerLight,
    borderWidth: 1,
    borderColor: C.danger + "33",
    marginBottom: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: C.danger,
  },

  card: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
    gap: 10,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardName: { fontSize: 14, fontWeight: "700", color: C.textPrimary },
  cardMeta: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  cardDates: { fontSize: 12, color: C.textSecondary },
  cardDays: {
    fontSize: 12,
    fontWeight: "800",
    color: C.textPrimary,
    marginLeft: "auto",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  cardApplied: { fontSize: 11, color: C.textMuted },
  cardActions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyState: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: C.textPrimary },
  emptyDesc: { fontSize: 13, color: C.textMuted, textAlign: "center" },

  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginTop: 16,
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageIndicator: { fontSize: 12, fontWeight: "700", color: C.textSecondary },
});