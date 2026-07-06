// // src/app/admin/leave.tsx
// // Leave Management hub — mirrors src/app/admin/employees.tsx.
// // All tabs (Requests, Policies, Balances) are rendered as full-screen
// // child components of this parent, switched via `activeView` state —
// // no router involved, exactly like the employee management hub.

// import { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   Pressable,
//   TextInput,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { router } from "expo-router";
// import {
//   Plane,
//   FileText,
//   ScrollText,
//   Users,
//   Search,
//   ArrowUpRight,
//   ChevronLeft,
// } from "lucide-react-native";

// import C from "../../styles/colors";
// import { leaveApi } from "../../api/service/leaveApi";

// import StatPill from "../../components/admin/employee/StatPill";
// import TabButton from "../../components/admin/employee/TabButton";
// import ModuleCard from "../../components/admin/employee/ModuleCard";

// import LeaveRequestsView from "../../components/admin/leave/LeaveRequestsView";
// import LeavePoliciesView from "../../components/admin/leave/LeavePoliciesView";
// import LeaveBalancesView from "../../components/admin/leave/LeaveBalancesView";
// import LeaveRequestDetailView from "../../components/admin/leave/LeaveRequestDetailView";
// import { Loader } from "../../hooks/loaderManager";

// // ─── Tabs config ──────────────────────────────────────────────
// const TABS = [
//   {
//     id: "requests",
//     label: "Leave Requests",
//     icon: FileText,
//     desc: "Review, approve, and reject employee leave requests",
//   },
//   {
//     id: "policies",
//     label: "Policies",
//     icon: ScrollText,
//     desc: "Configure leave entitlements and rules by leave type",
//   },
//   {
//     id: "balances",
//     label: "Employee Balances",
//     icon: Users,
//     desc: "See remaining, used, and pending leave per employee",
//   },
// ] as const;

// // ─── Live stats ─────────────────────────────────────────────
// function useLeaveStats() {
//   const [stats, setStats] = useState({
//     pending: 0,
//     onLeaveToday: 0,
//   });
//   const [loading, setLoading] = useState(true);

//   const fetchStats = useCallback(async () => {
//     setLoading(true);
//     try {
//       const [reqRes, calRes] = await Promise.all([
//         leaveApi.getAllRequests({ status: "pending", limit: 1 }),
//         leaveApi.getCalendar(),
//       ]);
//       const pending = reqRes?.meta?.total ?? reqRes?.data?.length ?? 0;
//       const TODAY = new Date().toISOString().split("T")[0];
//       const calendar = calRes?.data ?? [];
//       const onLeaveToday = calendar.filter(
//         (r: any) => r.start_date <= TODAY && r.end_date >= TODAY,
//       ).length;
//       setStats({ pending, onLeaveToday });
//     } catch (err) {
//       console.error("Failed to fetch leave stats:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchStats();
//   }, [fetchStats]);

//   return { stats, loading, refresh: fetchStats };
// }

// // ════════════════════ MAIN SCREEN ════════════════════
// export default function AdminLeaveManagementScreen() {
//   const insets = useSafeAreaInsets();
//   const { stats, loading: statsLoading, refresh } = useLeaveStats();

//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchFocused, setSearchFocused] = useState(false);
//   const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
//     null,
//   );

//   const [activeView, setActiveView] = useState<
//     "hub" | "requests" | "policies" | "balances" | "requestDetail"
//   >("hub");

//   const activeTabId = "requests";
//   const activeTabData = TABS.find((t) => t.id === activeTabId) || TABS[0];

//   // ── Leave Requests ──
//   if (activeView === "requests") {
//     return (
//       <LeaveRequestsView
//         onClose={() => {
//           refresh();
//           setActiveView("hub");
//         }}
//         onViewRequest={(id) => {
//           setSelectedRequestId(id);
//           setActiveView("requestDetail");
//         }}
//       />
//     );
//   }

//   // ── Request Detail ──
//   if (activeView === "requestDetail" && selectedRequestId) {
//     return (
//       <LeaveRequestDetailView
//         requestId={selectedRequestId}
//         onClose={() => {
//           setSelectedRequestId(null);
//           setActiveView("requests");
//         }}
//         onViewEmployee={(id) => {
//           router.push(`/admin/employees/${id}` as any);
//         }}
//       />
//     );
//   }

//   // ── Policies ──
//   if (activeView === "policies") {
//     return (
//       <LeavePoliciesView
//         onClose={() => {
//           refresh();
//           setActiveView("hub");
//         }}
//       />
//     );
//   }

//   // ── Balances ──
//   if (activeView === "balances") {
//     return (
//       <LeaveBalancesView
//         onClose={() => setActiveView("hub")}
//         onViewEmployee={(id) => {
//           router.push(`/admin/employees/${id}` as any);
//         }}
//       />
//     );
//   }

//   // ── Hub UI ──
//   return (
//     <View style={[styles.screen, { paddingTop: insets.top }]}>
//       {/* Header — back button + title, same pattern as Departments */}
//       <View style={styles.header}>
//         <Pressable onPress={() => router.back()} style={styles.headerBack}>
//           <ChevronLeft size={20} color={C.textSecondary} />
//         </Pressable>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.headerTitle}>Leave Management</Text>
//           <Text style={styles.headerSubtitle}>
//             Requests, policies & balances
//           </Text>
//         </View>
//       </View>

//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* ── Hero Banner ── */}
//         <View style={styles.hero}>
//           <View style={styles.heroTop}>
//             <View style={styles.heroIconWrap}>
//               <Plane size={24} color="#fff" />
//             </View>
//             <View>
//               <Text style={styles.heroTitle}>Leave Management</Text>
//               <Text style={styles.heroSubtitle}>
//                 Real-time workforce visibility
//               </Text>
//             </View>
//           </View>

//           {/* Live stats */}
//           <View style={styles.statsRow}>
//             <StatPill
//               label="Pending"
//               value={stats.pending}
//               color="#FCD34D"
//               loading={statsLoading}
//             />
//             <StatPill
//               label="On Leave Today"
//               value={stats.onLeaveToday}
//               color="#FCA5A5"
//               loading={statsLoading}
//             />
//           </View>
//         </View>

//         {/* ── Search ── */}
//         <View
//           style={[styles.searchRow, searchFocused && styles.searchRowFocused]}
//         >
//           <Search size={14} color={searchFocused ? C.primary : C.textMuted} />
//           <TextInput
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             onFocus={() => setSearchFocused(true)}
//             onBlur={() => setSearchFocused(false)}
//             placeholder="Search employees, leave type…"
//             placeholderTextColor={C.textMuted}
//             style={styles.searchInput}
//           />
//         </View>

//         {/* ── Tab Strip ── */}
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.tabStrip}
//         >
//           {TABS.map((tab) => {
//             const Icon = tab.icon;
//             const active = activeTabId === tab.id;
//             return (
//               <TabButton
//                 key={tab.id}
//                 label={tab.label}
//                 icon={
//                   <Icon size={14} color={active ? "#fff" : C.textSecondary} />
//                 }
//                 active={active}
//                 onPress={() => setActiveView(tab.id as any)}
//               />
//             );
//           })}
//         </ScrollView>

//         {/* ── Active Tab Card ── */}
//         <View style={styles.activeTabCard}>
//           <View style={styles.activeTabLeft}>
//             <View
//               style={[
//                 styles.activeTabIcon,
//                 { backgroundColor: C.primaryLight },
//               ]}
//             >
//               <activeTabData.icon size={16} color={C.primary} />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.activeTabTitle}>{activeTabData.label}</Text>
//               <Text style={styles.activeTabDesc}>{activeTabData.desc}</Text>
//             </View>
//           </View>
//           <Pressable
//             onPress={() => setActiveView(activeTabData.id as any)}
//             style={({ pressed }) => [
//               styles.openBtn,
//               pressed && { opacity: 0.85 },
//             ]}
//           >
//             <Text style={styles.openBtnText}>Open</Text>
//             <ArrowUpRight size={12} color="#fff" />
//           </Pressable>
//         </View>

//         {/* ── All Modules Grid ── */}
//         <Text style={styles.sectionLabel}>All Modules</Text>
//         <View style={styles.modulesGrid}>
//           {TABS.map((tab) => (
//             <ModuleCard
//               key={tab.id}
//               label={tab.label}
//               desc={tab.desc}
//               icon={<tab.icon size={18} color={C.primary} />}
//               onPress={() => setActiveView(tab.id as any)}
//             />
//           ))}
//         </View>

//         <View style={{ height: 24 }} />
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1, backgroundColor: C.bg },

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

//   scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },

//   // Hero
//   hero: {
//     borderRadius: 20,
//     padding: 18,
//     backgroundColor: C.navy,
//     gap: 16,
//   },
//   heroTop: { flexDirection: "row", alignItems: "center", gap: 12 },
//   heroIconWrap: {
//     width: 48,
//     height: 48,
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(255,255,255,0.15)",
//   },
//   heroTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
//   heroSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 },
//   statsRow: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 8,
//   },

//   // Search
//   searchRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     marginTop: 16,
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     backgroundColor: C.surface,
//     borderRadius: 16,
//     borderWidth: 1.5,
//     borderColor: C.border,
//   },
//   searchRowFocused: {
//     borderColor: C.primary,
//     shadowColor: C.primary,
//     shadowOpacity: 0.12,
//     shadowRadius: 8,
//     shadowOffset: { width: 0, height: 0 },
//     elevation: 2,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 14,
//     color: C.textPrimary,
//     paddingVertical: 0,
//   },

//   // Tab strip
//   tabStrip: {
//     flexDirection: "row",
//     gap: 8,
//     paddingVertical: 4,
//     marginTop: 14,
//   },

//   // Active tab card
//   activeTabCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     marginTop: 16,
//     padding: 14,
//     backgroundColor: C.surface,
//     borderRadius: 18,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   activeTabLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     flex: 1,
//   },
//   activeTabIcon: {
//     width: 38,
//     height: 38,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   activeTabTitle: { fontSize: 14, fontWeight: "700", color: C.textPrimary },
//   activeTabDesc: {
//     fontSize: 11,
//     color: C.textMuted,
//     marginTop: 2,
//     lineHeight: 15,
//   },
//   openBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 12,
//     backgroundColor: C.primary,
//   },
//   openBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },

//   // Section
//   sectionLabel: {
//     fontSize: 11,
//     fontWeight: "700",
//     color: C.textMuted,
//     textTransform: "uppercase",
//     letterSpacing: 0.8,
//     marginTop: 22,
//     marginBottom: 10,
//   },

//   // Modules grid
//   modulesGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 10,
//   },
// });


// src/app/admin/leave.tsx
// Leave Management hub — mirrors src/app/admin/employees.tsx.
// All tabs (Requests, Policies, Balances) are rendered as full-screen
// child components of this parent, switched via `activeView` state —
// no router involved, exactly like the employee management hub.

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Plane,
  FileText,
  ScrollText,
  Users,
  Search,
  ArrowUpRight,
  ChevronLeft,
} from "lucide-react-native";

import C from "../../styles/colors";
import { leaveApi } from "../../api/service/leaveApi";
import { Loader } from "../../hooks/loaderManager";

import StatPill from "../../components/admin/employee/StatPill";
import TabButton from "../../components/admin/employee/TabButton";
import ModuleCard from "../../components/admin/employee/ModuleCard";

import LeaveRequestsView from "../../components/admin/leave/LeaveRequestsView";
import LeavePoliciesView from "../../components/admin/leave/LeavePoliciesView";
import LeaveBalancesView from "../../components/admin/leave/LeaveBalancesView";
import LeaveRequestDetailView from "../../components/admin/leave/LeaveRequestDetailView";

// ─── Tabs config ──────────────────────────────────────────────
const TABS = [
  {
    id: "requests",
    label: "Leave Requests",
    icon: FileText,
    desc: "Review, approve, and reject employee leave requests",
  },
  {
    id: "policies",
    label: "Policies",
    icon: ScrollText,
    desc: "Configure leave entitlements and rules by leave type",
  },
  {
    id: "balances",
    label: "Employee Balances",
    icon: Users,
    desc: "See remaining, used, and pending leave per employee",
  },
] as const;

// ─── Live stats ─────────────────────────────────────────────
function useLeaveStats() {
  const [stats, setStats] = useState({
    pending: 0,
    onLeaveToday: 0,
  });

  const fetchStats = useCallback(async () => {
    Loader.show(); // ← global loader
    try {
      const [reqRes, calRes] = await Promise.all([
        leaveApi.getAllRequests({ status: "pending", limit: 1 }),
        leaveApi.getCalendar(),
      ]);
      const pending = reqRes?.meta?.total ?? reqRes?.data?.length ?? 0;
      const TODAY = new Date().toISOString().split("T")[0];
      const calendar = calRes?.data ?? [];
      const onLeaveToday = calendar.filter(
        (r: any) => r.start_date <= TODAY && r.end_date >= TODAY,
      ).length;
      setStats({ pending, onLeaveToday });
    } catch (err) {
      console.error("Failed to fetch leave stats:", err);
    } finally {
      Loader.hide(); // ← hide global loader
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, refresh: fetchStats };
}

// ════════════════════ MAIN SCREEN ════════════════════
export default function AdminLeaveManagementScreen() {
  const insets = useSafeAreaInsets();
  const { stats, refresh } = useLeaveStats();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );

  const [activeView, setActiveView] = useState<
    "hub" | "requests" | "policies" | "balances" | "requestDetail"
  >("hub");

  const activeTabId = "requests";
  const activeTabData = TABS.find((t) => t.id === activeTabId) || TABS[0];

  // ── Leave Requests ──
  if (activeView === "requests") {
    return (
      <LeaveRequestsView
        onClose={() => {
          refresh();
          setActiveView("hub");
        }}
        onViewRequest={(id) => {
          setSelectedRequestId(id);
          setActiveView("requestDetail");
        }}
      />
    );
  }

  // ── Request Detail ──
  if (activeView === "requestDetail" && selectedRequestId) {
    return (
      <LeaveRequestDetailView
        requestId={selectedRequestId}
        onClose={() => {
          setSelectedRequestId(null);
          setActiveView("requests");
        }}
        onViewEmployee={(id) => {
          router.push(`/admin/employees/${id}` as any);
        }}
      />
    );
  }

  // ── Policies ──
  if (activeView === "policies") {
    return (
      <LeavePoliciesView
        onClose={() => {
          refresh();
          setActiveView("hub");
        }}
      />
    );
  }

  // ── Balances ──
  if (activeView === "balances") {
    return (
      <LeaveBalancesView
        onClose={() => setActiveView("hub")}
        onViewEmployee={(id) => {
          router.push(`/admin/employees/${id}` as any);
        }}
      />
    );
  }

  // ── Hub UI ──
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header — back button + title, same pattern as Departments */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Leave Management</Text>
          <Text style={styles.headerSubtitle}>
            Requests, policies & balances
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Banner ── */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroIconWrap}>
              <Plane size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.heroTitle}>Leave Management</Text>
              <Text style={styles.heroSubtitle}>
                Real-time workforce visibility
              </Text>
            </View>
          </View>

          {/* Live stats — no local loading prop, global loader handles it */}
          <View style={styles.statsRow}>
            <StatPill
              label="Pending"
              value={stats.pending}
              color="#FCD34D"
            />
            <StatPill
              label="On Leave Today"
              value={stats.onLeaveToday}
              color="#FCA5A5"
            />
          </View>
        </View>

        {/* ── Search ── */}
        <View
          style={[styles.searchRow, searchFocused && styles.searchRowFocused]}
        >
          <Search size={14} color={searchFocused ? C.primary : C.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search employees, leave type…"
            placeholderTextColor={C.textMuted}
            style={styles.searchInput}
          />
        </View>

        {/* ── Tab Strip ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabStrip}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTabId === tab.id;
            return (
              <TabButton
                key={tab.id}
                label={tab.label}
                icon={
                  <Icon size={14} color={active ? "#fff" : C.textSecondary} />
                }
                active={active}
                onPress={() => setActiveView(tab.id as any)}
              />
            );
          })}
        </ScrollView>

        {/* ── Active Tab Card ── */}
        <View style={styles.activeTabCard}>
          <View style={styles.activeTabLeft}>
            <View
              style={[
                styles.activeTabIcon,
                { backgroundColor: C.primaryLight },
              ]}
            >
              <activeTabData.icon size={16} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.activeTabTitle}>{activeTabData.label}</Text>
              <Text style={styles.activeTabDesc}>{activeTabData.desc}</Text>
            </View>
          </View>
          <Pressable
            onPress={() => setActiveView(activeTabData.id as any)}
            style={({ pressed }) => [
              styles.openBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.openBtnText}>Open</Text>
            <ArrowUpRight size={12} color="#fff" />
          </Pressable>
        </View>

        {/* ── All Modules Grid ── */}
        <Text style={styles.sectionLabel}>All Modules</Text>
        <View style={styles.modulesGrid}>
          {TABS.map((tab) => (
            <ModuleCard
              key={tab.id}
              label={tab.label}
              desc={tab.desc}
              icon={<tab.icon size={18} color={C.primary} />}
              onPress={() => setActiveView(tab.id as any)}
            />
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

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

  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },

  // Hero
  hero: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: C.navy,
    gap: 16,
  },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  heroTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  heroSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  // Search
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  searchRowFocused: {
    borderColor: C.primary,
    shadowColor: C.primary,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.textPrimary,
    paddingVertical: 0,
  },

  // Tab strip
  tabStrip: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
    marginTop: 14,
  },

  // Active tab card
  activeTabCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    padding: 14,
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  activeTabLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  activeTabIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTabTitle: { fontSize: 14, fontWeight: "700", color: C.textPrimary },
  activeTabDesc: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  openBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: C.primary,
  },
  openBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },

  // Section
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 22,
    marginBottom: 10,
  },

  // Modules grid
  modulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});