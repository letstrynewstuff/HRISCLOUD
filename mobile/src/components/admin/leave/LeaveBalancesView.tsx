// // src/components/admin/leave/LeaveBalancesView.tsx
// // "Employee Balances" tab.

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
//   Users,
//   Search,
//   ChevronLeft,
//   ChevronDown,
//   ChevronUp,
//   AlertTriangle,
//   Calendar,
//   RefreshCw,
//   AlertCircle,
// } from "lucide-react-native";

// import C from "../../../styles/colors";
// import { leaveApi } from "../../../api/service/leaveApi";
// import { LeaveAvatar, BalanceMiniBar, getTypeColor } from "./leaveShared";

// interface Props {
//   onClose: () => void;
//   onViewEmployee?: (id: string) => void;
// }

// const DEPT_COLORS = [
//   "#6366F1",
//   "#06B6D4",
//   "#10B981",
//   "#F59E0B",
//   "#EC4899",
//   "#8B5CF6",
//   "#EF4444",
//   "#F97316",
// ];
// const deptColor = (name: string, list: string[]) =>
//   DEPT_COLORS[list.indexOf(name) % DEPT_COLORS.length] ?? C.primary;

// const getInitials = (name?: string) =>
//   name
//     ?.split(" ")
//     .map((n) => n[0])
//     .filter(Boolean)
//     .join("")
//     .toUpperCase()
//     .slice(0, 2) ?? "??";

// export default function LeaveBalancesView({ onClose, onViewEmployee }: Props) {
//   const insets = useSafeAreaInsets();

//   const [balances, setBalances] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [search, setSearch] = useState("");
//   const [deptFilter, setDeptFilter] = useState("");
//   const [expandedEmp, setExpandedEmp] = useState<string | null>(null);

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await leaveApi.getAllBalances();
//       const rows = Array.isArray(res) ? res : (res?.data ?? []);
//       setBalances(rows);
//     } catch (err: any) {
//       setError(
//         err?.response?.data?.message ??
//           err?.message ??
//           "Failed to load balances.",
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

//   const employeeMap = useMemo(() => {
//     const map: Record<string, any> = {};
//     balances.forEach((b) => {
//       if (!map[b.employee_id]) {
//         map[b.employee_id] = {
//           id: b.employee_id,
//           name: b.employee_name,
//           code: b.employee_code,
//           dept: b.department_name,
//           initials: getInitials(b.employee_name),
//           balances: [] as any[],
//         };
//       }
//       map[b.employee_id].balances.push(b);
//     });
//     return map;
//   }, [balances]);

//   const employees = useMemo(() => Object.values(employeeMap), [employeeMap]);
//   const departments = useMemo(
//     () =>
//       [...new Set(employees.map((e: any) => e.dept).filter(Boolean))].sort(),
//     [employees],
//   ) as string[];

//   const lowBalanceCount = balances.filter(
//     (b) =>
//       b.leave_type === "Annual Leave" &&
//       b.entitled > 0 &&
//       (b.remaining ?? 0) / b.entitled < 0.2,
//   ).length;

//   const filtered = useMemo(
//     () =>
//       employees.filter((e: any) => {
//         const q = search.toLowerCase();
//         return (
//           (!q ||
//             e.name?.toLowerCase().includes(q) ||
//             e.code?.toLowerCase().includes(q)) &&
//           (!deptFilter || e.dept === deptFilter)
//         );
//       }),
//     [employees, search, deptFilter],
//   ) as any[];

//   const renderCard = ({ item: emp }: { item: any }) => {
//     const dc = deptColor(emp.dept, departments);
//     const expanded = expandedEmp === emp.id;
//     const annual = emp.balances.find(
//       (b: any) => b.leave_type === "Annual Leave",
//     );
//     const sick = emp.balances.find((b: any) => b.leave_type === "Sick Leave");

//     return (
//       <View style={styles.card}>
//         <Pressable
//           onPress={() => setExpandedEmp(expanded ? null : emp.id)}
//           style={styles.cardHeader}
//         >
//           <LeaveAvatar initials={emp.initials} color={dc} size={38} />
//           <View style={{ flex: 1 }}>
//             <Text style={styles.empName} numberOfLines={1}>
//               {emp.name}
//             </Text>
//             <View style={styles.deptRow}>
//               <View style={[styles.deptDot, { backgroundColor: dc }]} />
//               <Text style={styles.empDept} numberOfLines={1}>
//                 {emp.dept ?? "—"} · {emp.code}
//               </Text>
//             </View>
//           </View>
//           {expanded ? (
//             <ChevronUp size={16} color={C.textMuted} />
//           ) : (
//             <ChevronDown size={16} color={C.textMuted} />
//           )}
//         </Pressable>

//         <View style={styles.summaryRow}>
//           {annual && (
//             <View style={styles.summaryCol}>
//               <Text style={styles.summaryLabel}>Annual</Text>
//               <BalanceMiniBar
//                 remaining={annual.remaining ?? 0}
//                 entitled={annual.entitled ?? 0}
//                 color={C.primary}
//               />
//             </View>
//           )}
//           {sick && (
//             <View style={styles.summaryCol}>
//               <Text style={styles.summaryLabel}>Sick</Text>
//               <BalanceMiniBar
//                 remaining={sick.remaining ?? 0}
//                 entitled={sick.entitled ?? 0}
//                 color={C.danger}
//               />
//             </View>
//           )}
//         </View>

//         {expanded && (
//           <View style={styles.expandedWrap}>
//             {emp.balances.map((b: any) => {
//               const color = getTypeColor(b.leave_type);
//               const rem = b.remaining ?? 0;
//               const entitled = b.entitled ?? 0;
//               const used = b.taken ?? 0;
//               return (
//                 <View key={b.id} style={styles.expandedRow}>
//                   <View
//                     style={[
//                       styles.expandedIcon,
//                       { backgroundColor: `${color}18` },
//                     ]}
//                   >
//                     <Calendar size={14} color={color} />
//                   </View>
//                   <View style={{ flex: 1 }}>
//                     <Text style={styles.expandedType}>{b.leave_type}</Text>
//                     <Text style={[styles.expandedRemaining, { color }]}>
//                       {rem}{" "}
//                       <Text style={styles.expandedOf}>
//                         / {entitled} days remaining
//                       </Text>
//                     </Text>
//                     <Text style={styles.expandedMeta}>
//                       {used} used · {b.pending ?? 0} pending
//                     </Text>
//                   </View>
//                 </View>
//               );
//             })}
//             <Pressable
//               onPress={() => onViewEmployee?.(emp.id)}
//               style={styles.profileBtn}
//             >
//               <Text style={styles.profileBtnText}>View Profile</Text>
//             </Pressable>
//           </View>
//         )}
//       </View>
//     );
//   };

//   const renderHeader = () => (
//     <>
//       <View style={styles.statsRow}>
//         <View style={styles.statBox}>
//           <View style={[styles.statIcon, { backgroundColor: C.primaryLight }]}>
//             <Users size={16} color={C.primary} />
//           </View>
//           <View>
//             <Text style={styles.statValue}>{employees.length}</Text>
//             <Text style={styles.statLabel}>Total Employees</Text>
//           </View>
//         </View>
//         <View style={styles.statBox}>
//           <View style={[styles.statIcon, { backgroundColor: C.dangerLight }]}>
//             <AlertTriangle size={16} color={C.danger} />
//           </View>
//           <View>
//             <Text style={styles.statValue}>{lowBalanceCount}</Text>
//             <Text style={styles.statLabel}>Low Balance Alerts</Text>
//           </View>
//         </View>
//       </View>

//       <View style={styles.searchRow}>
//         <View style={styles.searchInputWrap}>
//           <Search size={16} color={C.textMuted} />
//           <TextInput
//             value={search}
//             onChangeText={setSearch}
//             placeholder="Search employee, code…"
//             placeholderTextColor={C.textMuted}
//             style={styles.searchInput}
//           />
//         </View>
//       </View>

//       {departments.length > 0 && (
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.deptFilterRow}
//         >
//           <Pressable
//             onPress={() => setDeptFilter("")}
//             style={[styles.deptChip, !deptFilter && styles.deptChipActive]}
//           >
//             <Text
//               style={[
//                 styles.deptChipText,
//                 !deptFilter && styles.deptChipTextActive,
//               ]}
//             >
//               All Departments
//             </Text>
//           </Pressable>
//           {departments.map((d) => (
//             <Pressable
//               key={d}
//               onPress={() => setDeptFilter(d)}
//               style={[
//                 styles.deptChip,
//                 deptFilter === d && styles.deptChipActive,
//               ]}
//             >
//               <Text
//                 style={[
//                   styles.deptChipText,
//                   deptFilter === d && styles.deptChipTextActive,
//                 ]}
//               >
//                 {d}
//               </Text>
//             </Pressable>
//           ))}
//         </ScrollView>
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
//       <Users size={44} color={C.textMuted} />
//       <Text style={styles.emptyTitle}>
//         {search
//           ? "No employees match your search"
//           : "No employee balances found"}
//       </Text>
//     </View>
//   );

//   return (
//     <View style={[styles.container, { paddingTop: insets.top }]}>
//       <View style={styles.header}>
//         <Pressable onPress={onClose} style={styles.headerBack}>
//           <ChevronLeft size={20} color={C.textSecondary} />
//         </Pressable>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.headerTitle}>Employee Balances</Text>
//           <Text style={styles.headerSubtitle}>
//             {loading ? "Loading…" : `${employees.length} employees`}
//           </Text>
//         </View>
//       </View>

//       <FlatList
//         data={filtered}
//         keyExtractor={(item: any) => item.id}
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

//       {loading && balances.length === 0 && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color={C.primary} />
//         </View>
//       )}
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

//   statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
//   statBox: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     padding: 12,
//     borderRadius: 14,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   statIcon: {
//     width: 34,
//     height: 34,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   statValue: { fontSize: 18, fontWeight: "800", color: C.textPrimary },
//   statLabel: { fontSize: 10, color: C.textMuted },

//   searchRow: { marginBottom: 10 },
//   searchInputWrap: {
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

//   deptFilterRow: { flexDirection: "row", gap: 8, paddingBottom: 12 },
//   deptChip: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   deptChipActive: { backgroundColor: C.primary, borderColor: C.primary },
//   deptChipText: { fontSize: 11, fontWeight: "600", color: C.textSecondary },
//   deptChipTextActive: { color: "#fff", fontWeight: "700" },

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
//     gap: 12,
//   },
//   cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
//   empName: { fontSize: 14, fontWeight: "700", color: C.textPrimary },
//   deptRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
//   deptDot: { width: 6, height: 6, borderRadius: 3 },
//   empDept: { fontSize: 11, color: C.textMuted, flexShrink: 1 },

//   summaryRow: { flexDirection: "row", gap: 24 },
//   summaryCol: { gap: 4 },
//   summaryLabel: { fontSize: 10, color: C.textMuted, fontWeight: "700" },

//   expandedWrap: {
//     borderTopWidth: 1,
//     borderTopColor: C.border,
//     paddingTop: 12,
//     gap: 10,
//   },
//   expandedRow: { flexDirection: "row", alignItems: "center", gap: 10 },
//   expandedIcon: {
//     width: 30,
//     height: 30,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   expandedType: { fontSize: 10, fontWeight: "700", color: C.textSecondary },
//   expandedRemaining: { fontSize: 14, fontWeight: "800" },
//   expandedOf: { fontSize: 11, fontWeight: "400", color: C.textMuted },
//   expandedMeta: { fontSize: 9, color: C.textMuted, marginTop: 1 },

//   profileBtn: {
//     alignSelf: "flex-start",
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 12,
//     backgroundColor: C.primaryLight,
//   },
//   profileBtnText: { fontSize: 11, fontWeight: "700", color: C.primary },

//   emptyState: { alignItems: "center", paddingVertical: 48, gap: 12 },
//   emptyTitle: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: C.textSecondary,
//     textAlign: "center",
//   },

//   loadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.bg + "cc",
//   },
// });


// src/components/admin/leave/LeaveBalancesView.tsx
// "Employee Balances" tab.

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
  Users,
  Search,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Calendar,
  RefreshCw,
  AlertCircle,
} from "lucide-react-native";

import C from "../../../styles/colors";
import { leaveApi } from "../../../api/service/leaveApi";
import { Loader } from "../../../hooks/loaderManager";
import { LeaveAvatar, BalanceMiniBar, getTypeColor } from "./leaveShared";

interface Props {
  onClose: () => void;
  onViewEmployee?: (id: string) => void;
}

const DEPT_COLORS = [
  "#6366F1",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#EF4444",
  "#F97316",
];
const deptColor = (name: string, list: string[]) =>
  DEPT_COLORS[list.indexOf(name) % DEPT_COLORS.length] ?? C.primary;

const getInitials = (name?: string) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "??";

export default function LeaveBalancesView({ onClose, onViewEmployee }: Props) {
  const insets = useSafeAreaInsets();

  const [balances, setBalances] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [expandedEmp, setExpandedEmp] = useState<string | null>(null);

  const load = useCallback(async () => {
    Loader.show();
    setError(null);
    try {
      const res = await leaveApi.getAllBalances();
      const rows = Array.isArray(res) ? res : (res?.data ?? []);
      setBalances(rows);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to load balances.",
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

  const employeeMap = useMemo(() => {
    const map: Record<string, any> = {};
    balances.forEach((b) => {
      if (!map[b.employee_id]) {
        map[b.employee_id] = {
          id: b.employee_id,
          name: b.employee_name,
          code: b.employee_code,
          dept: b.department_name,
          initials: getInitials(b.employee_name),
          balances: [] as any[],
        };
      }
      map[b.employee_id].balances.push(b);
    });
    return map;
  }, [balances]);

  const employees = useMemo(() => Object.values(employeeMap), [employeeMap]);
  const departments = useMemo(
    () =>
      [...new Set(employees.map((e: any) => e.dept).filter(Boolean))].sort(),
    [employees],
  ) as string[];

  const lowBalanceCount = balances.filter(
    (b) =>
      b.leave_type === "Annual Leave" &&
      b.entitled > 0 &&
      (b.remaining ?? 0) / b.entitled < 0.2,
  ).length;

  const filtered = useMemo(
    () =>
      employees.filter((e: any) => {
        const q = search.toLowerCase();
        return (
          (!q ||
            e.name?.toLowerCase().includes(q) ||
            e.code?.toLowerCase().includes(q)) &&
          (!deptFilter || e.dept === deptFilter)
        );
      }),
    [employees, search, deptFilter],
  ) as any[];

  const renderCard = ({ item: emp }: { item: any }) => {
    const dc = deptColor(emp.dept, departments);
    const expanded = expandedEmp === emp.id;
    const annual = emp.balances.find(
      (b: any) => b.leave_type === "Annual Leave",
    );
    const sick = emp.balances.find((b: any) => b.leave_type === "Sick Leave");

    return (
      <View style={styles.card}>
        <Pressable
          onPress={() => setExpandedEmp(expanded ? null : emp.id)}
          style={styles.cardHeader}
        >
          <LeaveAvatar initials={emp.initials} color={dc} size={38} />
          <View style={{ flex: 1 }}>
            <Text style={styles.empName} numberOfLines={1}>
              {emp.name}
            </Text>
            <View style={styles.deptRow}>
              <View style={[styles.deptDot, { backgroundColor: dc }]} />
              <Text style={styles.empDept} numberOfLines={1}>
                {emp.dept ?? "—"} · {emp.code}
              </Text>
            </View>
          </View>
          {expanded ? (
            <ChevronUp size={16} color={C.textMuted} />
          ) : (
            <ChevronDown size={16} color={C.textMuted} />
          )}
        </Pressable>

        <View style={styles.summaryRow}>
          {annual && (
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Annual</Text>
              <BalanceMiniBar
                remaining={annual.remaining ?? 0}
                entitled={annual.entitled ?? 0}
                color={C.primary}
              />
            </View>
          )}
          {sick && (
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Sick</Text>
              <BalanceMiniBar
                remaining={sick.remaining ?? 0}
                entitled={sick.entitled ?? 0}
                color={C.danger}
              />
            </View>
          )}
        </View>

        {expanded && (
          <View style={styles.expandedWrap}>
            {emp.balances.map((b: any) => {
              const color = getTypeColor(b.leave_type);
              const rem = b.remaining ?? 0;
              const entitled = b.entitled ?? 0;
              const used = b.taken ?? 0;
              return (
                <View key={b.id} style={styles.expandedRow}>
                  <View
                    style={[
                      styles.expandedIcon,
                      { backgroundColor: `${color}18` },
                    ]}
                  >
                    <Calendar size={14} color={color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.expandedType}>{b.leave_type}</Text>
                    <Text style={[styles.expandedRemaining, { color }]}>
                      {rem}{" "}
                      <Text style={styles.expandedOf}>
                        / {entitled} days remaining
                      </Text>
                    </Text>
                    <Text style={styles.expandedMeta}>
                      {used} used · {b.pending ?? 0} pending
                    </Text>
                  </View>
                </View>
              );
            })}
            <Pressable
              onPress={() => onViewEmployee?.(emp.id)}
              style={styles.profileBtn}
            >
              <Text style={styles.profileBtnText}>View Profile</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  const renderHeader = () => (
    <>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <View style={[styles.statIcon, { backgroundColor: C.primaryLight }]}>
            <Users size={16} color={C.primary} />
          </View>
          <View>
            <Text style={styles.statValue}>{employees.length}</Text>
            <Text style={styles.statLabel}>Total Employees</Text>
          </View>
        </View>
        <View style={styles.statBox}>
          <View style={[styles.statIcon, { backgroundColor: C.dangerLight }]}>
            <AlertTriangle size={16} color={C.danger} />
          </View>
          <View>
            <Text style={styles.statValue}>{lowBalanceCount}</Text>
            <Text style={styles.statLabel}>Low Balance Alerts</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchInputWrap}>
          <Search size={16} color={C.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search employee, code…"
            placeholderTextColor={C.textMuted}
            style={styles.searchInput}
          />
        </View>
      </View>

      {departments.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.deptFilterRow}
        >
          <Pressable
            onPress={() => setDeptFilter("")}
            style={[styles.deptChip, !deptFilter && styles.deptChipActive]}
          >
            <Text
              style={[
                styles.deptChipText,
                !deptFilter && styles.deptChipTextActive,
              ]}
            >
              All Departments
            </Text>
          </Pressable>
          {departments.map((d) => (
            <Pressable
              key={d}
              onPress={() => setDeptFilter(d)}
              style={[
                styles.deptChip,
                deptFilter === d && styles.deptChipActive,
              ]}
            >
              <Text
                style={[
                  styles.deptChipText,
                  deptFilter === d && styles.deptChipTextActive,
                ]}
              >
                {d}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
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
      <Users size={44} color={C.textMuted} />
      <Text style={styles.emptyTitle}>
        {search
          ? "No employees match your search"
          : "No employee balances found"}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Employee Balances</Text>
          <Text style={styles.headerSubtitle}>
            {`${employees.length} employees`}
          </Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item: any) => item.id}
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

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 18, fontWeight: "800", color: C.textPrimary },
  statLabel: { fontSize: 10, color: C.textMuted },

  searchRow: { marginBottom: 10 },
  searchInputWrap: {
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

  deptFilterRow: { flexDirection: "row", gap: 8, paddingBottom: 12 },
  deptChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  deptChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  deptChipText: { fontSize: 11, fontWeight: "600", color: C.textSecondary },
  deptChipTextActive: { color: "#fff", fontWeight: "700" },

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
    gap: 12,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  empName: { fontSize: 14, fontWeight: "700", color: C.textPrimary },
  deptRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  deptDot: { width: 6, height: 6, borderRadius: 3 },
  empDept: { fontSize: 11, color: C.textMuted, flexShrink: 1 },

  summaryRow: { flexDirection: "row", gap: 24 },
  summaryCol: { gap: 4 },
  summaryLabel: { fontSize: 10, color: C.textMuted, fontWeight: "700" },

  expandedWrap: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 12,
    gap: 10,
  },
  expandedRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  expandedIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  expandedType: { fontSize: 10, fontWeight: "700", color: C.textSecondary },
  expandedRemaining: { fontSize: 14, fontWeight: "800" },
  expandedOf: { fontSize: 11, fontWeight: "400", color: C.textMuted },
  expandedMeta: { fontSize: 9, color: C.textMuted, marginTop: 1 },

  profileBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
  },
  profileBtnText: { fontSize: 11, fontWeight: "700", color: C.primary },

  emptyState: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.textSecondary,
    textAlign: "center",
  },
});