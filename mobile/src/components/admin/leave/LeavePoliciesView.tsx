// // src/components/admin/leave/LeavePoliciesView.tsx
// // "Leave Policies" tab.

// import { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   ActivityIndicator,
//   RefreshControl,
//   FlatList,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import {
//   ScrollText,
//   Plus,
//   Edit3,
//   ChevronLeft,
//   ChevronDown,
//   ChevronUp,
//   RefreshCw,
//   AlertCircle,
// } from "lucide-react-native";

// import C from "../../../styles/colors";
// import { leaveApi } from "../../../api/service/leaveApi";
// import {
//   LEAVE_TYPE_UI,
//   getTypeColor,
//   getTypeLight,
//   getTypeIcon,
// } from "./leaveShared";
// import PolicyModal, { PolicyForm } from "./PolicyModal";

// interface Props {
//   onClose: () => void;
// }

// export default function LeavePoliciesView({ onClose }: Props) {
//   const insets = useSafeAreaInsets();

//   const [policies, setPolicies] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [modal, setModal] = useState<"new" | { policy: any } | null>(null);
//   const [expandedId, setExpandedId] = useState<string | null>(null);

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await leaveApi.getPolicies();
//       setPolicies(res.data ?? []);
//     } catch (err: any) {
//       setError(
//         err?.response?.data?.message ??
//           err?.message ??
//           "Failed to load policies.",
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

//   const handleSave = async (form: PolicyForm) => {
//     setSaving(true);
//     try {
//       const payload = {
//         name: form.name,
//         leaveType: form.leaveType,
//         daysAllowed: form.daysAllowed,
//         carryOverDays: form.carryOverDays,
//         noticeDays: form.noticeDays,
//         requiresApproval: form.requiresApproval,
//         isPaid: form.isPaid,
//         requiresDocument: form.requiresDocument,
//         minDaysPerRequest: form.minDaysPerRequest,
//         maxDaysPerRequest: form.maxDaysPerRequest,
//         description: form.description,
//       };
//       if (modal === "new") {
//         const res = await leaveApi.createPolicy(payload);
//         setPolicies((prev) => [...prev, res.data]);
//       } else if (modal) {
//         const res = await leaveApi.updatePolicy(modal.policy.id, payload);
//         setPolicies((prev) =>
//           prev.map((p) => (p.id === modal.policy.id ? res.data : p)),
//         );
//       }
//       setModal(null);
//     } catch (err) {
//       // could surface a toast here
//     } finally {
//       setSaving(false);
//     }
//   };

//   const renderCard = ({ item: policy }: { item: any }) => {
//     const color = getTypeColor(policy.leave_type);
//     const light = getTypeLight(policy.leave_type);
//     const icon = getTypeIcon(policy.leave_type);
//     const expanded = expandedId === policy.id;
//     const isActive = policy.is_active !== false;

//     return (
//       <View style={styles.card}>
//         <View style={[styles.stripe, { backgroundColor: color }]} />
//         <View style={styles.cardBody}>
//           <View style={styles.cardTop}>
//             <View style={styles.cardTopLeft}>
//               <View style={[styles.typeIcon, { backgroundColor: light }]}>
//                 <Text style={{ fontSize: 16 }}>{icon}</Text>
//               </View>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.policyName} numberOfLines={1}>
//                   {policy.name}
//                 </Text>
//                 <View style={[styles.typeBadge, { backgroundColor: light }]}>
//                   <Text style={[styles.typeBadgeText, { color }]}>
//                     {policy.leave_type}
//                   </Text>
//                 </View>
//               </View>
//             </View>
//             <View style={styles.cardTopRight}>
//               <View
//                 style={[
//                   styles.activeBadge,
//                   { backgroundColor: isActive ? C.successLight : C.surfaceAlt },
//                 ]}
//               >
//                 <Text
//                   style={[
//                     styles.activeBadgeText,
//                     { color: isActive ? C.success : C.textMuted },
//                   ]}
//                 >
//                   {isActive ? "Active" : "Inactive"}
//                 </Text>
//               </View>
//               <Pressable
//                 onPress={() => setModal({ policy })}
//                 style={styles.editBtn}
//               >
//                 <Edit3 size={12} color={C.textSecondary} />
//               </Pressable>
//             </View>
//           </View>

//           <View style={styles.statsGrid}>
//             {[
//               { label: "Days", value: policy.days_allowed, icon: "📅" },
//               {
//                 label: "Notice",
//                 value: `${policy.notice_days ?? 0}d`,
//                 icon: "⏰",
//               },
//               {
//                 label: "Paid",
//                 value: policy.is_paid ? "Yes" : "No",
//                 icon: "💰",
//               },
//               {
//                 label: "Carry Over",
//                 value:
//                   (policy.carry_over_days ?? 0) > 0
//                     ? `${policy.carry_over_days}d`
//                     : "No",
//                 icon: "🔄",
//               },
//             ].map((st) => (
//               <View key={st.label} style={styles.statBox}>
//                 <Text style={{ fontSize: 13 }}>{st.icon}</Text>
//                 <View>
//                   <Text style={styles.statLabel}>{st.label}</Text>
//                   <Text style={styles.statValue}>{st.value}</Text>
//                 </View>
//               </View>
//             ))}
//           </View>

//           {policy.description ? (
//             <>
//               <Pressable
//                 onPress={() => setExpandedId(expanded ? null : policy.id)}
//                 style={styles.descToggle}
//               >
//                 <Text style={[styles.descToggleText, { color }]}>
//                   Description
//                 </Text>
//                 {expanded ? (
//                   <ChevronUp size={13} color={color} />
//                 ) : (
//                   <ChevronDown size={13} color={color} />
//                 )}
//               </Pressable>
//               {expanded && (
//                 <Text style={styles.descText}>{policy.description}</Text>
//               )}
//             </>
//           ) : null}
//         </View>
//       </View>
//     );
//   };

//   const renderHeader = () => (
//     <View style={styles.toolbar}>
//       <View>
//         <Text style={styles.toolbarTitle}>Leave Policies</Text>
//         <Text style={styles.toolbarSubtitle}>
//           {policies.length} policies configured
//         </Text>
//       </View>
//       <Pressable onPress={() => setModal("new")} style={styles.newBtn}>
//         <Plus size={14} color="#fff" />
//         <Text style={styles.newBtnText}>New</Text>
//       </Pressable>
//     </View>
//   );

//   const renderEmpty = () => (
//     <View style={styles.emptyState}>
//       <ScrollText size={44} color={C.textMuted} />
//       <Text style={styles.emptyTitle}>No policies yet</Text>
//       <Pressable onPress={() => setModal("new")} style={styles.newBtn}>
//         <Plus size={14} color="#fff" />
//         <Text style={styles.newBtnText}>Create First Policy</Text>
//       </Pressable>
//     </View>
//   );

//   return (
//     <View style={[styles.container, { paddingTop: insets.top }]}>
//       <View style={styles.header}>
//         <Pressable onPress={onClose} style={styles.headerBack}>
//           <ChevronLeft size={20} color={C.textSecondary} />
//         </Pressable>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.headerTitle}>Policies</Text>
//           <Text style={styles.headerSubtitle}>
//             {loading ? "Loading…" : `${policies.length} configured`}
//           </Text>
//         </View>
//       </View>

//       {error && (
//         <View style={styles.errorBanner}>
//           <AlertCircle size={16} color={C.danger} />
//           <Text style={styles.errorBannerText}>{error}</Text>
//           <Pressable onPress={load}>
//             <RefreshCw size={14} color={C.danger} />
//           </Pressable>
//         </View>
//       )}

//       <FlatList
//         data={policies}
//         keyExtractor={(item) => item.id}
//         renderItem={renderCard}
//         ListHeaderComponent={renderHeader}
//         ListEmptyComponent={!loading ? renderEmpty : null}
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

//       {loading && policies.length === 0 && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color={C.primary} />
//         </View>
//       )}

//       <PolicyModal
//         visible={!!modal}
//         policy={modal === "new" ? null : (modal?.policy ?? null)}
//         saving={saving}
//         onSave={handleSave}
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

//   errorBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     padding: 12,
//     margin: 16,
//     marginBottom: 0,
//     borderRadius: 14,
//     backgroundColor: C.dangerLight,
//     borderWidth: 1,
//     borderColor: C.danger + "33",
//   },
//   errorBannerText: {
//     flex: 1,
//     fontSize: 13,
//     fontWeight: "600",
//     color: C.danger,
//   },

//   listContent: { padding: 16, paddingBottom: 24 },

//   toolbar: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 14,
//   },
//   toolbarTitle: { fontSize: 14, fontWeight: "800", color: C.textPrimary },
//   toolbarSubtitle: { fontSize: 12, color: C.textMuted, marginTop: 2 },
//   newBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 12,
//     backgroundColor: C.primary,
//   },
//   newBtnText: { fontSize: 12, fontWeight: "800", color: "#fff" },

//   card: {
//     borderRadius: 18,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     overflow: "hidden",
//     marginBottom: 12,
//   },
//   stripe: { height: 5, width: "100%" },
//   cardBody: { padding: 14, gap: 10 },
//   cardTop: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     justifyContent: "space-between",
//   },
//   cardTopLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
//   typeIcon: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   policyName: { fontSize: 13, fontWeight: "800", color: C.textPrimary },
//   typeBadge: {
//     alignSelf: "flex-start",
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 20,
//     marginTop: 3,
//   },
//   typeBadgeText: { fontSize: 10, fontWeight: "700" },
//   cardTopRight: { alignItems: "flex-end", gap: 6 },
//   activeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
//   activeBadgeText: { fontSize: 10, fontWeight: "800" },
//   editBtn: {
//     width: 26,
//     height: 26,
//     borderRadius: 9,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },

//   statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
//   statBox: {
//     width: "47%",
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     padding: 10,
//     borderRadius: 12,
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   statLabel: { fontSize: 9, color: C.textMuted },
//   statValue: { fontSize: 12, fontWeight: "800", color: C.textPrimary },

//   descToggle: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 4,
//   },
//   descToggleText: { fontSize: 11, fontWeight: "700" },
//   descText: { fontSize: 11, lineHeight: 17, color: C.textSecondary },

//   emptyState: { alignItems: "center", paddingVertical: 48, gap: 12 },
//   emptyTitle: { fontSize: 16, fontWeight: "700", color: C.textPrimary },

//   loadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.bg + "cc",
//   },
// });


// src/components/admin/leave/LeavePoliciesView.tsx
// "Leave Policies" tab.

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  RefreshControl,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ScrollText,
  Plus,
  Edit3,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react-native";

import C from "../../../styles/colors";
import { leaveApi } from "../../../api/service/leaveApi";
import { Loader } from "../../../hooks/loaderManager";
import {
  LEAVE_TYPE_UI,
  getTypeColor,
  getTypeLight,
  getTypeIcon,
} from "./leaveShared";
import PolicyModal, { PolicyForm } from "./PolicyModal";

interface Props {
  onClose: () => void;
}

export default function LeavePoliciesView({ onClose }: Props) {
  const insets = useSafeAreaInsets();

  const [policies, setPolicies] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<"new" | { policy: any } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    Loader.show();
    setError(null);
    try {
      const res = await leaveApi.getPolicies();
      setPolicies(res.data ?? []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to load policies.",
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

  const handleSave = async (form: PolicyForm) => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        leaveType: form.leaveType,
        daysAllowed: form.daysAllowed,
        carryOverDays: form.carryOverDays,
        noticeDays: form.noticeDays,
        requiresApproval: form.requiresApproval,
        isPaid: form.isPaid,
        requiresDocument: form.requiresDocument,
        minDaysPerRequest: form.minDaysPerRequest,
        maxDaysPerRequest: form.maxDaysPerRequest,
        description: form.description,
      };
      if (modal === "new") {
        const res = await leaveApi.createPolicy(payload);
        setPolicies((prev) => [...prev, res.data]);
      } else if (modal) {
        const res = await leaveApi.updatePolicy(modal.policy.id, payload);
        setPolicies((prev) =>
          prev.map((p) => (p.id === modal.policy.id ? res.data : p)),
        );
      }
      setModal(null);
    } catch (err) {
      // could surface a toast here
    } finally {
      setSaving(false);
    }
  };

  const renderCard = ({ item: policy }: { item: any }) => {
    const color = getTypeColor(policy.leave_type);
    const light = getTypeLight(policy.leave_type);
    const icon = getTypeIcon(policy.leave_type);
    const expanded = expandedId === policy.id;
    const isActive = policy.is_active !== false;

    return (
      <View style={styles.card}>
        <View style={[styles.stripe, { backgroundColor: color }]} />
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <View style={styles.cardTopLeft}>
              <View style={[styles.typeIcon, { backgroundColor: light }]}>
                <Text style={{ fontSize: 16 }}>{icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.policyName} numberOfLines={1}>
                  {policy.name}
                </Text>
                <View style={[styles.typeBadge, { backgroundColor: light }]}>
                  <Text style={[styles.typeBadgeText, { color }]}>
                    {policy.leave_type}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.cardTopRight}>
              <View
                style={[
                  styles.activeBadge,
                  { backgroundColor: isActive ? C.successLight : C.surfaceAlt },
                ]}
              >
                <Text
                  style={[
                    styles.activeBadgeText,
                    { color: isActive ? C.success : C.textMuted },
                  ]}
                >
                  {isActive ? "Active" : "Inactive"}
                </Text>
              </View>
              <Pressable
                onPress={() => setModal({ policy })}
                style={styles.editBtn}
              >
                <Edit3 size={12} color={C.textSecondary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.statsGrid}>
            {[
              { label: "Days", value: policy.days_allowed, icon: "📅" },
              {
                label: "Notice",
                value: `${policy.notice_days ?? 0}d`,
                icon: "⏰",
              },
              {
                label: "Paid",
                value: policy.is_paid ? "Yes" : "No",
                icon: "💰",
              },
              {
                label: "Carry Over",
                value:
                  (policy.carry_over_days ?? 0) > 0
                    ? `${policy.carry_over_days}d`
                    : "No",
                icon: "🔄",
              },
            ].map((st) => (
              <View key={st.label} style={styles.statBox}>
                <Text style={{ fontSize: 13 }}>{st.icon}</Text>
                <View>
                  <Text style={styles.statLabel}>{st.label}</Text>
                  <Text style={styles.statValue}>{st.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {policy.description ? (
            <>
              <Pressable
                onPress={() => setExpandedId(expanded ? null : policy.id)}
                style={styles.descToggle}
              >
                <Text style={[styles.descToggleText, { color }]}>
                  Description
                </Text>
                {expanded ? (
                  <ChevronUp size={13} color={color} />
                ) : (
                  <ChevronDown size={13} color={color} />
                )}
              </Pressable>
              {expanded && (
                <Text style={styles.descText}>{policy.description}</Text>
              )}
            </>
          ) : null}
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.toolbar}>
      <View>
        <Text style={styles.toolbarTitle}>Leave Policies</Text>
        <Text style={styles.toolbarSubtitle}>
          {policies.length} policies configured
        </Text>
      </View>
      <Pressable onPress={() => setModal("new")} style={styles.newBtn}>
        <Plus size={14} color="#fff" />
        <Text style={styles.newBtnText}>New</Text>
      </Pressable>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <ScrollText size={44} color={C.textMuted} />
      <Text style={styles.emptyTitle}>No policies yet</Text>
      <Pressable onPress={() => setModal("new")} style={styles.newBtn}>
        <Plus size={14} color="#fff" />
        <Text style={styles.newBtnText}>Create First Policy</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Policies</Text>
          <Text style={styles.headerSubtitle}>
            {`${policies.length} configured`}
          </Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <AlertCircle size={16} color={C.danger} />
          <Text style={styles.errorBannerText}>{error}</Text>
          <Pressable onPress={load}>
            <RefreshCw size={14} color={C.danger} />
          </Pressable>
        </View>
      )}

      <FlatList
        data={policies}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
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

      <PolicyModal
        visible={!!modal}
        policy={modal === "new" ? null : (modal?.policy ?? null)}
        saving={saving}
        onSave={handleSave}
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

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    margin: 16,
    marginBottom: 0,
    borderRadius: 14,
    backgroundColor: C.dangerLight,
    borderWidth: 1,
    borderColor: C.danger + "33",
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: C.danger,
  },

  listContent: { padding: 16, paddingBottom: 24 },

  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  toolbarTitle: { fontSize: 14, fontWeight: "800", color: C.textPrimary },
  toolbarSubtitle: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.primary,
  },
  newBtnText: { fontSize: 12, fontWeight: "800", color: "#fff" },

  card: {
    borderRadius: 18,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    marginBottom: 12,
  },
  stripe: { height: 5, width: "100%" },
  cardBody: { padding: 14, gap: 10 },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cardTopLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  policyName: { fontSize: 13, fontWeight: "800", color: C.textPrimary },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 20,
    marginTop: 3,
  },
  typeBadgeText: { fontSize: 10, fontWeight: "700" },
  cardTopRight: { alignItems: "flex-end", gap: 6 },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  activeBadgeText: { fontSize: 10, fontWeight: "800" },
  editBtn: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statBox: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  statLabel: { fontSize: 9, color: C.textMuted },
  statValue: { fontSize: 12, fontWeight: "800", color: C.textPrimary },

  descToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  descToggleText: { fontSize: 11, fontWeight: "700" },
  descText: { fontSize: 11, lineHeight: 17, color: C.textSecondary },

  emptyState: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: C.textPrimary },
});