// // src/app/admin/payroll.tsx
// // Payroll Management hub — mirrors src/app/admin/leave.tsx exactly.
// // All tabs (Run Payroll, History, Deductions, Salary, Reports, Payslip)
// // render as full-screen child components of this parent, switched via
// // `activeView` state — no router involved, same as the leave management hub.

// import React, { useCallback, useEffect, useState } from "react";
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
//   DollarSign,
//   Zap,
//   FileText,
//   Percent,
//   ScrollText,
//   Receipt,
//   Search,
//   ArrowUpRight,
//   ChevronLeft,
// } from "lucide-react-native";

// import C from "../../styles/colors";
// import { PayrollProvider, usePayroll } from "../../components/admin/payroll/PayrollContext";
// import { listRuns } from "../../api/service/payrollApi";

// import StatPill from "../../components/admin/employee/StatPill";
// import TabButton from "../../components/admin/employee/TabButton";
// import ModuleCard from "../../components/admin/employee/ModuleCard";

// import RunPayrollView from "../../components/admin/payroll/RunPayrollView";
// import PayrollHistoryView from "../../components/admin/payroll/PayrollHistoryView";
// import DeductionsConfigView from "../../components/admin/payroll/DeductionsConfigView";
// import SalaryConfigView from "../../components/admin/payroll/SalaryConfigView";
// import StatutoryReportsView from "../../components/admin/payroll/StatutoryReportsView";
// import PayslipLookupView from "../../components/admin/payroll/PayslipLookupView";

// // ─── Tabs config ──────────────────────────────────────────────
// const TABS = [
//   {
//     id: "run",
//     label: "Run Payroll",
//     icon: Zap,
//     desc: "Process a new payroll run — manual or assisted",
//   },
//   {
//     id: "history",
//     label: "History",
//     icon: FileText,
//     desc: "View and export past payroll runs",
//   },
//   {
//     id: "deductions",
//     label: "Deductions",
//     icon: Percent,
//     desc: "Manage statutory and custom deductions",
//   },
//   {
//     id: "salary",
//     label: "Salary Config",
//     icon: DollarSign,
//     desc: "Define salary structures and bands",
//   },
//   {
//     id: "reports",
//     label: "Statutory Reports",
//     icon: ScrollText,
//     desc: "Generate PAYE, Pension, and NHF schedules",
//   },
//   {
//     id: "payslip",
//     label: "Payslip Lookup",
//     icon: Receipt,
//     desc: "Look up an employee's payslip for any period",
//   },
// ] as const;

// // ─── Live stats ─────────────────────────────────────────────
// function usePayrollStats() {
//   const [stats, setStats] = useState({ totalRuns: 0, latestNet: 0 });
//   const [loading, setLoading] = useState(true);

//   const fetchStats = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await listRuns({ page: 1, limit: 1 });
//       const total = res?.total ?? res?.meta?.total ?? res?.data?.length ?? 0;
//       const latest = res?.data?.[0];
//       const latestNet = latest?.totalNet ?? latest?.total_net ?? 0;
//       setStats({ totalRuns: total, latestNet });
//     } catch (err) {
//       console.error("Failed to fetch payroll stats:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchStats();
//   }, [fetchStats]);

//   return { stats, loading, refresh: fetchStats };
// }

// const fmtM = (n: number) => {
//   const v = Number(n ?? 0);
//   if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(1)}M`;
//   if (v >= 1_000) return `₦${(v / 1_000).toFixed(0)}K`;
//   return `₦${v}`;
// };

// // ════════════════════ MAIN SCREEN ════════════════════
// function PayrollInner() {
//   const insets = useSafeAreaInsets();
//   const { stats, loading: statsLoading, refresh } = usePayrollStats();

//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchFocused, setSearchFocused] = useState(false);

//   const [activeView, setActiveView] = useState<
//     "hub" | "run" | "history" | "deductions" | "salary" | "reports" | "payslip"
//   >("hub");

//   const activeTabId = "run";
//   const activeTabData = TABS.find((t) => t.id === activeTabId) || TABS[0];

//   // ── Run Payroll ──
//   if (activeView === "run") {
//     return (
//       <RunPayrollView
//         onClose={() => {
//           refresh();
//           setActiveView("hub");
//         }}
//       />
//     );
//   }

//   // ── History ──
//   if (activeView === "history") {
//     return <PayrollHistoryView onClose={() => setActiveView("hub")} />;
//   }

//   // ── Deductions ──
//   if (activeView === "deductions") {
//     return <DeductionsConfigView onClose={() => setActiveView("hub")} />;
//   }

//   // ── Salary Config ──
//   if (activeView === "salary") {
//     return <SalaryConfigView onClose={() => setActiveView("hub")} />;
//   }

//   // ── Statutory Reports ──
//   if (activeView === "reports") {
//     return <StatutoryReportsView onClose={() => setActiveView("hub")} />;
//   }

//   // ── Payslip Lookup ──
//   if (activeView === "payslip") {
//     return <PayslipLookupView onClose={() => setActiveView("hub")} />;
//   }

//   // ── Hub UI ──
//   return (
//     <View style={[styles.screen, { paddingTop: insets.top }]}>
//       {/* Header — back button + title, same pattern as Leave */}
//       <View style={styles.header}>
//         <Pressable onPress={() => router.back()} style={styles.headerBack}>
//           <ChevronLeft size={20} color={C.textSecondary} />
//         </Pressable>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.headerTitle}>Payroll Management</Text>
//           <Text style={styles.headerSubtitle}>
//             Nigeria compliant · Manual & Assisted modes
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
//               <DollarSign size={24} color="#fff" />
//             </View>
//             <View>
//               <Text style={styles.heroTitle}>Payroll Management</Text>
//               <Text style={styles.heroSubtitle}>
//                 Real-time payroll & compliance visibility
//               </Text>
//             </View>
//           </View>

//           {/* Live stats */}
//           <View style={styles.statsRow}>
//             <StatPill
//               label="Total Runs"
//               value={stats.totalRuns}
//               color="#93C5FD"
//               loading={statsLoading}
//             />
//             <StatPill
//               label="Latest Net Pay"
//               value={fmtM(stats.latestNet)}
//               color="#86EFAC"
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
//             placeholder="Search payroll…"
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

// export default function AdminPayrollScreen() {
//   return (
//     <PayrollProvider>
//       <PayrollInner />
//     </PayrollProvider>
//   );
// }


// src/app/admin/payroll.tsx
// Payroll Management hub — mirrors src/app/admin/leave.tsx exactly.
// All tabs (Run Payroll, History, Deductions, Salary, Reports, Payslip)
// render as full-screen child components of this parent, switched via
// `activeView` state — no router involved, same as the leave management hub.

import React, { useCallback, useEffect, useState } from "react";
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
  DollarSign,
  Zap,
  FileText,
  Percent,
  ScrollText,
  Receipt,
  Search,
  ArrowUpRight,
  ChevronLeft,
} from "lucide-react-native";

import C from "../../styles/colors";
import { Loader } from "../../hooks/loaderManager";
import { PayrollProvider, usePayroll } from "../../components/admin/payroll/PayrollContext";
import { listRuns } from "../../api/service/payrollApi";

import StatPill from "../../components/admin/employee/StatPill";
import TabButton from "../../components/admin/employee/TabButton";
import ModuleCard from "../../components/admin/employee/ModuleCard";

import RunPayrollView from "../../components/admin/payroll/RunPayrollView";
import PayrollHistoryView from "../../components/admin/payroll/PayrollHistoryView";
import DeductionsConfigView from "../../components/admin/payroll/DeductionsConfigView";
import SalaryConfigView from "../../components/admin/payroll/SalaryConfigView";
import StatutoryReportsView from "../../components/admin/payroll/StatutoryReportsView";
import PayslipLookupView from "../../components/admin/payroll/PayslipLookupView";

// ─── Tabs config ──────────────────────────────────────────────
const TABS = [
  {
    id: "run",
    label: "Run Payroll",
    icon: Zap,
    desc: "Process a new payroll run — manual or assisted",
  },
  {
    id: "history",
    label: "History",
    icon: FileText,
    desc: "View and export past payroll runs",
  },
  {
    id: "deductions",
    label: "Deductions",
    icon: Percent,
    desc: "Manage statutory and custom deductions",
  },
  {
    id: "salary",
    label: "Salary Config",
    icon: DollarSign,
    desc: "Define salary structures and bands",
  },
  {
    id: "reports",
    label: "Statutory Reports",
    icon: ScrollText,
    desc: "Generate PAYE, Pension, and NHF schedules",
  },
  {
    id: "payslip",
    label: "Payslip Lookup",
    icon: Receipt,
    desc: "Look up an employee's payslip for any period",
  },
] as const;

// ─── Live stats ─────────────────────────────────────────────
function usePayrollStats() {
  const [stats, setStats] = useState({ totalRuns: 0, latestNet: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    Loader.show();
    try {
      const res = await listRuns({ page: 1, limit: 1 });
      const total = res?.total ?? res?.meta?.total ?? res?.data?.length ?? 0;
      const latest = res?.data?.[0];
      const latestNet = latest?.totalNet ?? latest?.total_net ?? 0;
      setStats({ totalRuns: total, latestNet });
    } catch (err) {
      console.error("Failed to fetch payroll stats:", err);
    } finally {
      setLoading(false);
      Loader.hide();
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refresh: fetchStats };
}

const fmtM = (n: number) => {
  const v = Number(n ?? 0);
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `₦${(v / 1_000).toFixed(0)}K`;
  return `₦${v}`;
};

// ════════════════════ MAIN SCREEN ════════════════════
function PayrollInner() {
  const insets = useSafeAreaInsets();
  const { stats, loading: statsLoading, refresh } = usePayrollStats();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const [activeView, setActiveView] = useState<
    "hub" | "run" | "history" | "deductions" | "salary" | "reports" | "payslip"
  >("hub");

  const activeTabId = "run";
  const activeTabData = TABS.find((t) => t.id === activeTabId) || TABS[0];

  // ── Run Payroll ──
  if (activeView === "run") {
    return (
      <RunPayrollView
        onClose={() => {
          refresh();
          setActiveView("hub");
        }}
      />
    );
  }

  // ── History ──
  if (activeView === "history") {
    return <PayrollHistoryView onClose={() => setActiveView("hub")} />;
  }

  // ── Deductions ──
  if (activeView === "deductions") {
    return <DeductionsConfigView onClose={() => setActiveView("hub")} />;
  }

  // ── Salary Config ──
  if (activeView === "salary") {
    return <SalaryConfigView onClose={() => setActiveView("hub")} />;
  }

  // ── Statutory Reports ──
  if (activeView === "reports") {
    return <StatutoryReportsView onClose={() => setActiveView("hub")} />;
  }

  // ── Payslip Lookup ──
  if (activeView === "payslip") {
    return <PayslipLookupView onClose={() => setActiveView("hub")} />;
  }

  // ── Hub UI ──
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header — back button + title, same pattern as Leave */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Payroll Management</Text>
          <Text style={styles.headerSubtitle}>
            Nigeria compliant · Manual & Assisted modes
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
              <DollarSign size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.heroTitle}>Payroll Management</Text>
              <Text style={styles.heroSubtitle}>
                Real-time payroll & compliance visibility
              </Text>
            </View>
          </View>

          {/* Live stats */}
          <View style={styles.statsRow}>
            <StatPill
              label="Total Runs"
              value={stats.totalRuns}
              color="#93C5FD"
              loading={statsLoading}
            />
            <StatPill
              label="Latest Net Pay"
              value={fmtM(stats.latestNet)}
              color="#86EFAC"
              loading={statsLoading}
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
            placeholder="Search payroll…"
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

export default function AdminPayrollScreen() {
  return (
    <PayrollProvider>
      <PayrollInner />
    </PayrollProvider>
  );
}