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
//   Target,
//   Search,
//   ChevronLeft,
//   FileText,
//   Shield,
//   Award,
//   BarChart2,
// } from "lucide-react-native";

// import C from "../../styles/colors";

// import { listGoals, listPIPs } from "../../api/service/performanceApi";

// import StatPill from "../../components/admin/employee/StatPill";
// import TabButton from "../../components/admin/employee/TabButton";

// import PerformanceDashboardView from "../../components/admin/performance/PerformanceDashboardView";
// import GoalsManagementView from "../../components/admin/performance/GoalsManagementView";
// import AppraisalReviewView from "../../components/admin/performance/AppraisalReviewView";
// import PIPManagementView from "../../components/admin/performance/PIPManagementView";
// import AppraisalFormsView from "../../components/admin/performance/AppraisalFormsView";

// // ─── Tabs config ──────────────────────────────────────────────
// const TABS = [
//   {
//     id: "dashboard",
//     label: "Dashboard",
//     icon: Award,
//     desc: "Overview of performance metrics and activity",
//   },
//   {
//     id: "goals",
//     label: "Goals",
//     icon: Target,
//     desc: "Track and manage employee goals & KPIs",
//   },
//   {
//     id: "reviews",
//     label: "Appraisals",
//     icon: FileText,
//     desc: "Review, score and finalise submitted appraisals",
//   },
//   {
//     id: "pip",
//     label: "PIP",
//     icon: Shield,
//     desc: "Manage Performance Improvement Plans",
//   },
//   {
//     id: "forms",
//     label: "Forms",
//     icon: BarChart2,
//     desc: "Build and manage appraisal form templates",
//   },
// ] as const;

// type TabId = (typeof TABS)[number]["id"];

// // ─── Live stats ───────────────────────────────────────────────
// // function usePerformanceStats() {
// //   const [stats, setStats] = useState({
// //     totalGoals: 0,
// //     pendingReviews: 0,
// //     activePIPs: 0,
// //     completedReviews: 0,
// //   });
// //   const [loading, setLoading] = useState(true);

// //   const fetchStats = useCallback(async () => {
// //     setLoading(true);
// //     try {
// //       const [gRes, pRes] = await Promise.allSettled([
// //         performanceApi.listGoals
// //           ? performanceApi.listGoals({ limit: 1 })
// //           : Promise.resolve({ data: [] }),
// //         performanceApi.listPIPs
// //           ? performanceApi.listPIPs({})
// //           : Promise.resolve({ pips: [] }),
// //       ]);
// //       const goals = gRes.status === "fulfilled" ? (gRes.value?.data ?? []) : [];
// //       const pips = pRes.status === "fulfilled" ? (pRes.value?.pips ?? []) : [];

// //       setStats({
// //         totalGoals: goals.length,
// //         pendingReviews: 0,
// //         activePIPs: pips.filter((p: any) => p.status === "active").length,
// //         completedReviews: 0,
// //       });
// //     } catch (err) {
// //       console.error("Failed to fetch performance stats:", err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   useEffect(() => {
// //     fetchStats();
// //   }, [fetchStats]);

// //   return { stats, loading, refresh: fetchStats };
// // }

// // ─── Live stats ───────────────────────────────────────────────
// function usePerformanceStats() {
//   const [stats, setStats] = useState({
//     totalGoals: 0,
//     pendingReviews: 0,
//     activePIPs: 0,
//     completedReviews: 0,
//   });
//   const [loading, setLoading] = useState(true);

//   const fetchStats = useCallback(async () => {
//     setLoading(true);
//     try {
//       const [gRes, pRes] = await Promise.allSettled([
//         listGoals({ limit: 1 }),
//         listPIPs({}),
//       ]);
//       const goals = gRes.status === "fulfilled" ? (gRes.value?.data ?? []) : [];
//       const pips = pRes.status === "fulfilled" ? (pRes.value?.pips ?? []) : [];

//       setStats({
//         totalGoals: goals.length,
//         pendingReviews: 0,
//         activePIPs: pips.filter((p: any) => p.status === "active").length,
//         completedReviews: 0,
//       });
//     } catch (err) {
//       console.error("Failed to fetch performance stats:", err);
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
// export default function AdminPerformanceScreen() {
//   const insets = useSafeAreaInsets();
//   const { stats, loading: statsLoading, refresh } = usePerformanceStats();

//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchFocused, setSearchFocused] = useState(false);
//   const [activeTab, setActiveTab] = useState<TabId>("dashboard");

//   const activeTabData = TABS.find((t) => t.id === activeTab) ?? TABS[0];

//   return (
//     <View style={[styles.screen, { paddingTop: insets.top }]}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Pressable onPress={() => router.back()} style={styles.headerBack}>
//           <ChevronLeft size={20} color={C.textSecondary} />
//         </Pressable>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.headerTitle}>Performance</Text>
//           <Text style={styles.headerSubtitle}>
//             Drive growth & track performance
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
//               <Target size={24} color="#fff" />
//             </View>
//             <View>
//               <Text style={styles.heroTitle}>Performance Management</Text>
//               <Text style={styles.heroSubtitle}>
//                 Drive growth • Track performance • Align goals
//               </Text>
//             </View>
//           </View>

//           <View style={styles.statsRow}>
//             <StatPill
//               label="Goals"
//               value={stats.totalGoals}
//               color="#6EE7B7"
//               loading={statsLoading}
//             />
//             <StatPill
//               label="Pending"
//               value={stats.pendingReviews}
//               color="#FCD34D"
//               loading={statsLoading}
//             />
//             <StatPill
//               label="Active PIPs"
//               value={stats.activePIPs}
//               color="#FCA5A5"
//               loading={statsLoading}
//             />
//             <StatPill
//               label="Completed"
//               value={stats.completedReviews}
//               color="#93C5FD"
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
//             placeholder="Search performance..."
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
//             const active = activeTab === tab.id;
//             return (
//               <TabButton
//                 key={tab.id}
//                 label={tab.label}
//                 icon={
//                   <Icon size={14} color={active ? "#fff" : C.textSecondary} />
//                 }
//                 active={active}
//                 onPress={() => setActiveTab(tab.id)}
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
//         </View>

//         {/* ── Tab Content ── */}
//         <View style={styles.tabContent}>
//           {activeTab === "dashboard" && (
//             <PerformanceDashboardView searchQuery={searchQuery} />
//           )}
//           {activeTab === "goals" && (
//             <GoalsManagementView searchQuery={searchQuery} />
//           )}
//           {activeTab === "reviews" && (
//             <AppraisalReviewView searchQuery={searchQuery} />
//           )}
//           {activeTab === "pip" && (
//             <PIPManagementView searchQuery={searchQuery} />
//           )}
//           {activeTab === "forms" && (
//             <AppraisalFormsView searchQuery={searchQuery} />
//           )}
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

//   scrollContent: {
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 24,
//   },

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
//   heroSubtitle: {
//     fontSize: 12,
//     color: "rgba(255,255,255,0.6)",
//     marginTop: 2,
//   },
//   statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

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

//   tabStrip: {
//     flexDirection: "row",
//     gap: 8,
//     paddingVertical: 4,
//     marginTop: 14,
//   },

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
//   activeTabTitle: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: C.textPrimary,
//   },
//   activeTabDesc: {
//     fontSize: 11,
//     color: C.textMuted,
//     marginTop: 2,
//     lineHeight: 15,
//   },

//   tabContent: { marginTop: 16 },
// });


import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import {
  Target,
  Search,
  ChevronLeft,
  FileText,
  Shield,
  Award,
  BarChart2,
} from "lucide-react-native";

import C from "../../styles/colors";
import { Loader } from "../../hooks/loaderManager";

import { listGoals, listPIPs } from "../../api/service/performanceApi";

import StatPill from "../../components/admin/employee/StatPill";
import TabButton from "../../components/admin/employee/TabButton";

import PerformanceDashboardView from "../../components/admin/performance/PerformanceDashboardView";
import GoalsManagementView from "../../components/admin/performance/GoalsManagementView";
import AppraisalReviewView from "../../components/admin/performance/AppraisalReviewView";
import PIPManagementView from "../../components/admin/performance/PIPManagementView";
import AppraisalFormsView from "../../components/admin/performance/AppraisalFormsView";

// ─── Tabs config ──────────────────────────────────────────────
const TABS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Award,
    desc: "Overview of performance metrics and activity",
  },
  {
    id: "goals",
    label: "Goals",
    icon: Target,
    desc: "Track and manage employee goals & KPIs",
  },
  {
    id: "reviews",
    label: "Appraisals",
    icon: FileText,
    desc: "Review, score and finalise submitted appraisals",
  },
  {
    id: "pip",
    label: "PIP",
    icon: Shield,
    desc: "Manage Performance Improvement Plans",
  },
  {
    id: "forms",
    label: "Forms",
    icon: BarChart2,
    desc: "Build and manage appraisal form templates",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Live stats ───────────────────────────────────────────────
function usePerformanceStats() {
  const [stats, setStats] = useState({
    totalGoals: 0,
    pendingReviews: 0,
    activePIPs: 0,
    completedReviews: 0,
  });

  const fetchStats = useCallback(async () => {
    Loader.show();
    try {
      const [gRes, pRes] = await Promise.allSettled([
        listGoals({ limit: 1 }),
        listPIPs({}),
      ]);
      const goals = gRes.status === "fulfilled" ? (gRes.value?.data ?? []) : [];
      const pips = pRes.status === "fulfilled" ? (pRes.value?.pips ?? []) : [];

      setStats({
        totalGoals: goals.length,
        pendingReviews: 0,
        activePIPs: pips.filter((p: any) => p.status === "active").length,
        completedReviews: 0,
      });
    } catch (err) {
      console.error("Failed to fetch performance stats:", err);
    } finally {
      Loader.hide();
    }
  }, []);

  // useFocusEffect ensures loader shows every time the screen is accessed
  useFocusEffect(
    useCallback(() => {
      fetchStats();
      // Safety: hide loader if user navigates away mid-request
      return () => Loader.hide();
    }, [fetchStats]),
  );

  return { stats, refresh: fetchStats };
}

// ════════════════════ MAIN SCREEN ════════════════════
export default function AdminPerformanceScreen() {
  const insets = useSafeAreaInsets();
  const { stats, refresh } = usePerformanceStats();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  const activeTabData = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Performance</Text>
          <Text style={styles.headerSubtitle}>
            Drive growth & track performance
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
              <Target size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.heroTitle}>Performance Management</Text>
              <Text style={styles.heroSubtitle}>
                Drive growth • Track performance • Align goals
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatPill label="Goals" value={stats.totalGoals} color="#6EE7B7" />
            <StatPill
              label="Pending"
              value={stats.pendingReviews}
              color="#FCD34D"
            />
            <StatPill
              label="Active PIPs"
              value={stats.activePIPs}
              color="#FCA5A5"
            />
            <StatPill
              label="Completed"
              value={stats.completedReviews}
              color="#93C5FD"
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
            placeholder="Search performance..."
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
            const active = activeTab === tab.id;
            return (
              <TabButton
                key={tab.id}
                label={tab.label}
                icon={
                  <Icon size={14} color={active ? "#fff" : C.textSecondary} />
                }
                active={active}
                onPress={() => setActiveTab(tab.id)}
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
        </View>

        {/* ── Tab Content ── */}
        <View style={styles.tabContent}>
          {activeTab === "dashboard" && (
            <PerformanceDashboardView searchQuery={searchQuery} />
          )}
          {activeTab === "goals" && (
            <GoalsManagementView searchQuery={searchQuery} />
          )}
          {activeTab === "reviews" && (
            <AppraisalReviewView searchQuery={searchQuery} />
          )}
          {activeTab === "pip" && (
            <PIPManagementView searchQuery={searchQuery} />
          )}
          {activeTab === "forms" && (
            <AppraisalFormsView searchQuery={searchQuery} />
          )}
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

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },

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
  heroSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

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

  tabStrip: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
    marginTop: 14,
  },

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
  activeTabTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.textPrimary,
  },
  activeTabDesc: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },

  tabContent: { marginTop: 16 },
});