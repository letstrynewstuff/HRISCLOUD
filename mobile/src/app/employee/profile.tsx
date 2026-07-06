// // src/app/employee/profile.tsx
// //
// // Manager detection:
// //   Calls GET /employees/me (own profile) then GET /employees?managerId=<id>
// //   If the second call returns any employees → this user IS a manager.
// //   If zero → regular employee.
// //
// // This matches exactly how the web version works — no `is_manager` flag
// // is relied on; having direct reports IS the definition of manager.
// //
// // Tab sets:
// //   Manager  → Overview | Team | Personal | Job & Pay | Leave | Security
// //   Employee → Personal | Job & Pay | Leave | Security
// //
// // All tab components are your exact uploaded files — not rewritten.

// import { useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   RefreshControl,
//   ActivityIndicator,
//   Pressable,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { router } from "expo-router";
// import { AlertCircle, LogOut, ChevronLeft } from "lucide-react-native";
// import C from "../../styles/colors";
// import { useAuth } from "../../hooks/useAuth";
// import { useProfileData } from "../../hooks/useProfileData";

// // ── Your uploaded components, unchanged ──────────────────────
// import ProfileHero from "../../components/profile/ProfileHero";
// import PersonalTab from "../../components/profile/PersonalTab";
// import { JobTab, PayrollTab } from "../../components/profile/JobTab";
// import {
//   LeaveProfileTab,
//   SecurityTab,
// } from "../../components/profile/LeaveSecurityTabs";
// import {
//   OverviewTab,
//   TeamTab,
// } from "../../components/profile/manager/ManagerOverviewTeam";

// // ─── Tab definitions ──────────────────────────────────────────
// type TabKey = "overview" | "team" | "personal" | "job" | "leave" | "security";

// const EMPLOYEE_TABS: { key: TabKey; label: string }[] = [
//   { key: "personal", label: "Personal" },
//   { key: "job", label: "Job & Pay" },
//   { key: "leave", label: "Leave" },
//   { key: "security", label: "Security" },
// ];

// const MANAGER_TABS: { key: TabKey; label: string }[] = [
//   //   { key: "overview", label: "Overview" },
//   { key: "personal", label: "Personal" },
//   { key: "team", label: "Team" },

//   { key: "job", label: "Job & Pay" },
//   { key: "leave", label: "Leave" },
//   { key: "security", label: "Security" },
// ];

// // ─── Scrollable pill tab bar ───────────────────────────────────
// function TabBar({
//   tabs,
//   active,
//   onChange,
// }: {
//   tabs: { key: TabKey; label: string }[];
//   active: TabKey;
//   onChange: (k: TabKey) => void;
// }) {
//   return (
//     <ScrollView
//       horizontal
//       showsHorizontalScrollIndicator={false}
//       contentContainerStyle={styles.tabBarContent}
//       style={styles.tabBar}
//     >
//       {tabs.map((t) => {
//         const isActive = t.key === active;
//         return (
//           <Pressable
//             key={t.key}
//             onPress={() => onChange(t.key)}
//             style={[styles.tabPill, isActive && styles.tabPillActive]}
//           >
//             <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
//               {t.label}
//             </Text>
//           </Pressable>
//         );
//       })}
//     </ScrollView>
//   );
// }

// // ─── Screen ───────────────────────────────────────────────────
// export default function ProfileScreen() {
//   const { logout } = useAuth();
//   const { data, loading, refreshing, error, refresh } = useProfileData();
//   const {
//     emp,
//     isManager,
//     team,
//     pendingApprovals,
//     attendanceSummary,
//     completionPct,
//   } = data;

//   // isManager comes from useProfileData — true only when
//   // GET /employees?managerId=<id> returns at least one employee.
//   const tabs = isManager ? MANAGER_TABS : EMPLOYEE_TABS;
//   const [activeTab, setActiveTab] = useState<TabKey>("personal");

//   // Keep tab valid when isManager resolves after initial render
//   const tabExists = tabs.some((t) => t.key === activeTab);
//   const safeTab: TabKey = tabExists ? activeTab : tabs[0].key;

//   // ── Loading ──────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <SafeAreaView style={styles.centered}>
//         <ActivityIndicator color={C.primary} />
//         <Text style={styles.loadingText}>Loading profile…</Text>
//       </SafeAreaView>
//     );
//   }

//   // ── Error ────────────────────────────────────────────────────
//   if (error) {
//     return (
//       <SafeAreaView style={styles.centered}>
//         <AlertCircle size={28} color={C.danger} />
//         <Text style={styles.errorTitle}>Couldn't load profile</Text>
//         <Text style={styles.errorSub}>{error}</Text>
//         <Pressable onPress={refresh} style={styles.retryBtn}>
//           <Text style={styles.retryLabel}>Try again</Text>
//         </Pressable>
//       </SafeAreaView>
//     );
//   }

//   if (!emp) return null;

//   // ── Render active tab ────────────────────────────────────────
//   function renderTab() {
//     switch (safeTab) {
//       case "overview":
//         // Manager only — shows stat tiles, team preview, pending approvals
//         return (
//           <OverviewTab
//             team={team}
//             pendingApprovals={pendingApprovals}
//             attendanceSummary={attendanceSummary}
//           />
//         );

//       case "team":
//         // Manager only — searchable list of all direct reports
//         return <TeamTab team={team} />;

//       case "personal":
//         // Personal info + NOK + "Request Change" bottom sheet
//         return <PersonalTab emp={emp!} />;

//       case "job":
//         // Employment details + bank/payroll — stacked
//         return (
//           <View style={styles.twoSectionGap}>
//             <JobTab emp={emp!} />
//             <PayrollTab emp={emp!} />
//           </View>
//         );

//       case "leave":
//         // Leave balances + recent requests — fetches own data internally
//         return <LeaveProfileTab />;

//       case "security":
//         // Change password — calls authApi.changePassword internally
//         return <SecurityTab />;

//       default:
//         return null;
//     }
//   }

//   return (
//     <SafeAreaView style={styles.safeArea} edges={["top"]}>
//       {/* Top bar */}
//       <View style={styles.header}>
//         <Pressable
//           onPress={() => router.back()}
//           style={styles.headerBack}
//           hitSlop={8}
//         >
//           <ChevronLeft size={20} color={C.textPrimary} />
//         </Pressable>

//         <View style={styles.headerCenter}>
//           <Text style={styles.headerTitle}>My Profile</Text>
//           {isManager && (
//             <View style={styles.mgrHeaderBadge}>
//               <Text style={styles.mgrHeaderBadgeText}>Manager</Text>
//             </View>
//           )}
//         </View>

//         <Pressable onPress={logout} style={styles.logoutBtn} hitSlop={8}>
//           <LogOut size={15} color={C.danger} />
//           <Text style={styles.logoutLabel}>Logout</Text>
//         </Pressable>
//       </View>

//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={refresh}
//             tintColor={C.primary}
//           />
//         }
//       >
//         {/* Hero — shared, shows MGR badge when isManager */}
//         <ProfileHero
//           firstName={emp.first_name}
//           lastName={emp.last_name}
//           jobRoleName={emp.job_role_name}
//           departmentName={emp.department_name}
//           employeeCode={emp.employee_code}
//           employmentStatus={emp.employment_status}
//           isManager={isManager}
//           completionPct={completionPct}
//         />

//         {/* Manager context banner — only shows when manager */}
//         {isManager && (
//           <View style={styles.managerBanner}>
//             <Text style={styles.managerBannerText}>
//               👥 You manage{" "}
//               <Text style={styles.managerBannerBold}>{team.length}</Text> direct{" "}
//               {team.length === 1 ? "report" : "reports"}
//             </Text>
//           </View>
//         )}

//         {/* Tab pills */}
//         <TabBar tabs={tabs} active={safeTab} onChange={setActiveTab} />

//         {/* Tab content */}
//         <View style={styles.tabContent}>{renderTab()}</View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// // ─── Styles ───────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: C.bg,
//   },
//   centered: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.bg,
//     padding: 24,
//     gap: 10,
//   },
//   loadingText: {
//     fontSize: 13,
//     color: C.textMuted,
//     marginTop: 8,
//   },
//   errorTitle: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: C.textPrimary,
//     marginTop: 4,
//   },
//   errorSub: {
//     fontSize: 12.5,
//     color: C.textMuted,
//     textAlign: "center",
//   },
//   retryBtn: {
//     marginTop: 8,
//     paddingHorizontal: 22,
//     paddingVertical: 10,
//     borderRadius: 12,
//     backgroundColor: C.primaryLight,
//   },
//   retryLabel: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: C.primary,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: C.border,
//     backgroundColor: C.surface,
//     gap: 8,
//   },
//   headerBack: {
//     width: 32,
//     height: 32,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surfaceAlt,
//   },
//   headerCenter: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//   },
//   headerTitle: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: C.textPrimary,
//   },
//   mgrHeaderBadge: {
//     backgroundColor: "#FEF3C7",
//     paddingHorizontal: 7,
//     paddingVertical: 2,
//     borderRadius: 999,
//   },
//   mgrHeaderBadgeText: {
//     fontSize: 9.5,
//     fontWeight: "700",
//     color: "#D97706",
//   },
//   logoutBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 10,
//     backgroundColor: C.dangerLight,
//   },
//   logoutLabel: {
//     fontSize: 11,
//     fontWeight: "700",
//     color: C.danger,
//   },
//   scrollContent: {
//     padding: 16,
//     paddingBottom: 48,
//     gap: 14,
//   },
//   managerBanner: {
//     backgroundColor: C.primaryLight,
//     borderRadius: 12,
//     paddingVertical: 10,
//     paddingHorizontal: 14,
//     borderLeftWidth: 3,
//     borderLeftColor: C.primary,
//   },
//   managerBannerText: {
//     fontSize: 13,
//     color: C.primary,
//   },
//   managerBannerBold: {
//     fontWeight: "800",
//   },
//   tabBar: {
//     marginTop: 2,
//   },
//   tabBarContent: {
//     gap: 6,
//     paddingVertical: 4,
//   },
//   tabPill: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 999,
//     backgroundColor: C.surface,
//     borderWidth: 1.5,
//     borderColor: C.border,
//   },
//   tabPillActive: {
//     backgroundColor: C.primary,
//     borderColor: C.primary,
//   },
//   tabLabel: {
//     fontSize: 12.5,
//     fontWeight: "600",
//     color: C.textSecondary,
//   },
//   tabLabelActive: {
//     color: "#fff",
//   },
//   tabContent: {
//     marginTop: 4,
//   },
//   twoSectionGap: {
//     gap: 14,
//   },
// });

// // src/app/employee/profile.tsx
// //
// // Manager detection:
// //   Calls GET /employees/me (own profile) then GET /employees?managerId=<id>
// //   If the second call returns any employees → this user IS a manager.
// //   If zero → regular employee.
// //
// // This matches exactly how the web version works — no `is_manager` flag
// // is relied on; having direct reports IS the definition of manager.
// //
// // Tab sets:
// //   Manager  → Overview | Team | Personal | Job & Pay | Leave | Security
// //   Employee → Personal | Job & Pay | Leave | Security
// //
// // All tab components are your exact uploaded files — not rewritten.

// import { useRef, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   RefreshControl,
//   Pressable,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { router } from "expo-router";
// import { AlertCircle, LogOut, ChevronLeft } from "lucide-react-native";
// import C from "../../styles/colors";
// import { useAuth } from "../../hooks/useAuth";
// import { useProfileData } from "../../hooks/useProfileData";
// import BantaHRLetterLoader, {
//   BantaHRLetterLoaderRef,
// } from "../../components/BantaHRLetterLoader";

// // ── Your uploaded components, unchanged ──────────────────────
// import ProfileHero from "../../components/profile/ProfileHero";
// import PersonalTab from "../../components/profile/PersonalTab";
// import { JobTab, PayrollTab } from "../../components/profile/JobTab";
// import {
//   LeaveProfileTab,
//   SecurityTab,
// } from "../../components/profile/LeaveSecurityTabs";
// import {
//   OverviewTab,
//   TeamTab,
// } from "../../components/profile/manager/ManagerOverviewTeam";

// // ─── Tab definitions ──────────────────────────────────────────
// type TabKey = "overview" | "team" | "personal" | "job" | "leave" | "security";

// const EMPLOYEE_TABS: { key: TabKey; label: string }[] = [
//   { key: "personal", label: "Personal" },
//   { key: "job", label: "Job & Pay" },
//   { key: "leave", label: "Leave" },
//   { key: "security", label: "Security" },
// ];

// const MANAGER_TABS: { key: TabKey; label: string }[] = [
//   //   { key: "overview", label: "Overview" },
//   { key: "personal", label: "Personal" },
//   { key: "team", label: "Team" },

//   { key: "job", label: "Job & Pay" },
//   { key: "leave", label: "Leave" },
//   { key: "security", label: "Security" },
// ];

// // ─── Scrollable pill tab bar ───────────────────────────────────
// function TabBar({
//   tabs,
//   active,
//   onChange,
// }: {
//   tabs: { key: TabKey; label: string }[];
//   active: TabKey;
//   onChange: (k: TabKey) => void;
// }) {
//   return (
//     <ScrollView
//       horizontal
//       showsHorizontalScrollIndicator={false}
//       contentContainerStyle={styles.tabBarContent}
//       style={styles.tabBar}
//     >
//       {tabs.map((t) => {
//         const isActive = t.key === active;
//         return (
//           <Pressable
//             key={t.key}
//             onPress={() => onChange(t.key)}
//             style={[styles.tabPill, isActive && styles.tabPillActive]}
//           >
//             <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
//               {t.label}
//             </Text>
//           </Pressable>
//         );
//       })}
//     </ScrollView>
//   );
// }

// // ─── Screen ───────────────────────────────────────────────────
// export default function ProfileScreen() {
//   const { logout } = useAuth();
//   const { data, loading, refreshing, error, refresh } = useProfileData();
//   const loaderRef = useRef<BantaHRLetterLoaderRef>(null);

//   const {
//     emp,
//     isManager,
//     team,
//     pendingApprovals,
//     attendanceSummary,
//     completionPct,
//   } = data;

//   // isManager comes from useProfileData — true only when
//   // GET /employees?managerId=<id> returns at least one employee.
//   const tabs = isManager ? MANAGER_TABS : EMPLOYEE_TABS;
//   const [activeTab, setActiveTab] = useState<TabKey>("personal");

//   // Keep tab valid when isManager resolves after initial render
//   const tabExists = tabs.some((t) => t.key === activeTab);
//   const safeTab: TabKey = tabExists ? activeTab : tabs[0].key;

//   // ── Error ────────────────────────────────────────────────────
//   if (error) {
//     return (
//       <SafeAreaView style={styles.centered}>
//         <AlertCircle size={28} color={C.danger} />
//         <Text style={styles.errorTitle}>Couldn't load profile</Text>
//         <Text style={styles.errorSub}>{error}</Text>
//         <Pressable onPress={refresh} style={styles.retryBtn}>
//           <Text style={styles.retryLabel}>Try again</Text>
//         </Pressable>
//       </SafeAreaView>
//     );
//   }

//   if (!emp) return null;

//   // ── Render active tab ────────────────────────────────────────
//   function renderTab() {
//     switch (safeTab) {
//       case "overview":
//         // Manager only — shows stat tiles, team preview, pending approvals
//         return (
//           <OverviewTab
//             team={team}
//             pendingApprovals={pendingApprovals}
//             attendanceSummary={attendanceSummary}
//           />
//         );

//       case "team":
//         // Manager only — searchable list of all direct reports
//         return <TeamTab team={team} />;

//       case "personal":
//         // Personal info + NOK + "Request Change" bottom sheet
//         return <PersonalTab emp={emp!} />;

//       case "job":
//         // Employment details + bank/payroll — stacked
//         return (
//           <View style={styles.twoSectionGap}>
//             <JobTab emp={emp!} />
//             <PayrollTab emp={emp!} />
//           </View>
//         );

//       case "leave":
//         // Leave balances + recent requests — fetches own data internally
//         return <LeaveProfileTab />;

//       case "security":
//         // Change password — calls authApi.changePassword internally
//         return <SecurityTab />;

//       default:
//         return null;
//     }
//   }

//   return (
//     <SafeAreaView style={styles.safeArea} edges={["top"]}>
//       {/* Top bar */}
//       <View style={styles.header}>
//         <Pressable
//           onPress={() => router.back()}
//           style={styles.headerBack}
//           hitSlop={8}
//         >
//           <ChevronLeft size={20} color={C.textPrimary} />
//         </Pressable>

//         <View style={styles.headerCenter}>
//           <Text style={styles.headerTitle}>My Profile</Text>
//           {isManager && (
//             <View style={styles.mgrHeaderBadge}>
//               <Text style={styles.mgrHeaderBadgeText}>Manager</Text>
//             </View>
//           )}
//         </View>

//         <Pressable onPress={logout} style={styles.logoutBtn} hitSlop={8}>
//           <LogOut size={15} color={C.danger} />
//           <Text style={styles.logoutLabel}>Logout</Text>
//         </Pressable>
//       </View>

//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={refresh}
//             tintColor={C.primary}
//           />
//         }
//       >
//         {/* Hero — shared, shows MGR badge when isManager */}
//         <ProfileHero
//           firstName={emp.first_name}
//           lastName={emp.last_name}
//           jobRoleName={emp.job_role_name}
//           departmentName={emp.department_name}
//           employeeCode={emp.employee_code}
//           employmentStatus={emp.employment_status}
//           isManager={isManager}
//           completionPct={completionPct}
//         />

//         {/* Manager context banner — only shows when manager */}
//         {isManager && (
//           <View style={styles.managerBanner}>
//             <Text style={styles.managerBannerText}>
//               👥 You manage{" "}
//               <Text style={styles.managerBannerBold}>{team.length}</Text> direct{" "}
//               {team.length === 1 ? "report" : "reports"}
//             </Text>
//           </View>
//         )}

//         {/* Tab pills */}
//         <TabBar tabs={tabs} active={safeTab} onChange={setActiveTab} />

//         {/* Tab content */}
//         <View style={styles.tabContent}>{renderTab()}</View>
//       </ScrollView>

//       {/* Global loader — the only loader in this screen */}
//       <BantaHRLetterLoader
//         ref={loaderRef}
//         overlay
//         subtitle="Loading profile..."
//       />
//     </SafeAreaView>
//   );
// }

// // ─── Styles ───────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: C.bg,
//   },
//   centered: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.bg,
//     padding: 24,
//     gap: 10,
//   },
//   loadingText: {
//     fontSize: 13,
//     color: C.textMuted,
//     marginTop: 8,
//   },
//   errorTitle: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: C.textPrimary,
//     marginTop: 4,
//   },
//   errorSub: {
//     fontSize: 12.5,
//     color: C.textMuted,
//     textAlign: "center",
//   },
//   retryBtn: {
//     marginTop: 8,
//     paddingHorizontal: 22,
//     paddingVertical: 10,
//     borderRadius: 12,
//     backgroundColor: C.primaryLight,
//   },
//   retryLabel: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: C.primary,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: C.border,
//     backgroundColor: C.surface,
//     gap: 8,
//   },
//   headerBack: {
//     width: 32,
//     height: 32,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surfaceAlt,
//   },
//   headerCenter: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//   },
//   headerTitle: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: C.textPrimary,
//   },
//   mgrHeaderBadge: {
//     backgroundColor: "#FEF3C7",
//     paddingHorizontal: 7,
//     paddingVertical: 2,
//     borderRadius: 999,
//   },
//   mgrHeaderBadgeText: {
//     fontSize: 9.5,
//     fontWeight: "700",
//     color: "#D97706",
//   },
//   logoutBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 10,
//     backgroundColor: C.dangerLight,
//   },
//   logoutLabel: {
//     fontSize: 11,
//     fontWeight: "700",
//     color: C.danger,
//   },
//   scrollContent: {
//     padding: 16,
//     paddingBottom: 48,
//     gap: 14,
//   },
//   managerBanner: {
//     backgroundColor: C.primaryLight,
//     borderRadius: 12,
//     paddingVertical: 10,
//     paddingHorizontal: 14,
//     borderLeftWidth: 3,
//     borderLeftColor: C.primary,
//   },
//   managerBannerText: {
//     fontSize: 13,
//     color: C.primary,
//   },
//   managerBannerBold: {
//     fontWeight: "800",
//   },
//   tabBar: {
//     marginTop: 2,
//   },
//   tabBarContent: {
//     gap: 6,
//     paddingVertical: 4,
//   },
//   tabPill: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 999,
//     backgroundColor: C.surface,
//     borderWidth: 1.5,
//     borderColor: C.border,
//   },
//   tabPillActive: {
//     backgroundColor: C.primary,
//     borderColor: C.primary,
//   },
//   tabLabel: {
//     fontSize: 12.5,
//     fontWeight: "600",
//     color: C.textSecondary,
//   },
//   tabLabelActive: {
//     color: "#fff",
//   },
//   tabContent: {
//     marginTop: 4,
//   },
//   twoSectionGap: {
//     gap: 14,
//   },
// });

// src/app/employee/profile.tsx
import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AlertCircle, LogOut, ChevronLeft } from "lucide-react-native";
import C from "../../styles/colors";
import { useAuth } from "../../hooks/useAuth";
import { useProfileData } from "../../hooks/useProfileData";
import BantaHRLetterLoader, {
  BantaHRLetterLoaderRef,
} from "../../components/BantaHRLetterLoader";

import ProfileHero from "../../components/profile/ProfileHero";
import PersonalTab from "../../components/profile/PersonalTab";
import { JobTab, PayrollTab } from "../../components/profile/JobTab";
import {
  LeaveProfileTab,
  SecurityTab,
} from "../../components/profile/LeaveSecurityTabs";
import {
  OverviewTab,
  TeamTab,
} from "../../components/profile/manager/ManagerOverviewTeam";

type TabKey = "overview" | "team" | "personal" | "job" | "leave" | "security";

const EMPLOYEE_TABS: { key: TabKey; label: string }[] = [
  { key: "personal", label: "Personal" },
  { key: "job", label: "Job & Pay" },
  { key: "leave", label: "Leave" },
  { key: "security", label: "Security" },
];

const MANAGER_TABS: { key: TabKey; label: string }[] = [
  { key: "personal", label: "Personal" },
  { key: "team", label: "Team" },
  { key: "job", label: "Job & Pay" },
  { key: "leave", label: "Leave" },
  { key: "security", label: "Security" },
];

function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: TabKey; label: string }[];
  active: TabKey;
  onChange: (k: TabKey) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabBarContent}
      style={styles.tabBar}
    >
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            style={[styles.tabPill, isActive && styles.tabPillActive]}
          >
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export default function ProfileScreen() {
  const { logout } = useAuth();
  const { data, loading, refreshing, error, refresh } = useProfileData();
  const loaderRef = useRef<BantaHRLetterLoaderRef>(null);

  const {
    emp,
    isManager,
    team,
    pendingApprovals,
    attendanceSummary,
    completionPct,
  } = data;

  const tabs = isManager ? MANAGER_TABS : EMPLOYEE_TABS;
  const [activeTab, setActiveTab] = useState<TabKey>("personal");

  const tabExists = tabs.some((t) => t.key === activeTab);
  const safeTab: TabKey = tabExists ? activeTab : tabs[0].key;

  // ── Drive the local loader from hook loading state ─────────
  useEffect(() => {
    if (loading) {
      loaderRef.current?.show();
    } else {
      loaderRef.current?.hide();
    }
  }, [loading]);

  // ── Error ─────────────────────────────────────────────────
  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <AlertCircle size={28} color={C.danger} />
        <Text style={styles.errorTitle}>Couldn't load profile</Text>
        <Text style={styles.errorSub}>{error}</Text>
        <Pressable onPress={refresh} style={styles.retryBtn}>
          <Text style={styles.retryLabel}>Try again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // ── Loading: blank screen while local loader is visible ─────
  if (!emp) {
    return (
      <View style={styles.blank}>
        <BantaHRLetterLoader
          ref={loaderRef}
          overlay
          subtitle="Loading profile..."
        />
      </View>
    );
  }

  function renderTab() {
    switch (safeTab) {
      case "overview":
        return (
          <OverviewTab
            team={team}
            pendingApprovals={pendingApprovals}
            attendanceSummary={attendanceSummary}
          />
        );
      case "team":
        return <TeamTab team={team} />;
      case "personal":
        return <PersonalTab emp={emp!} />;
      case "job":
        return (
          <View style={styles.twoSectionGap}>
            <JobTab emp={emp!} />
            <PayrollTab emp={emp!} />
          </View>
        );
      case "leave":
        return <LeaveProfileTab />;
      case "security":
        return <SecurityTab />;
      default:
        return null;
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.headerBack}
          hitSlop={8}
        >
          <ChevronLeft size={20} color={C.textPrimary} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Profile</Text>
          {isManager && (
            <View style={styles.mgrHeaderBadge}>
              <Text style={styles.mgrHeaderBadgeText}>Manager</Text>
            </View>
          )}
        </View>

        <Pressable onPress={logout} style={styles.logoutBtn} hitSlop={8}>
          <LogOut size={15} color={C.danger} />
          <Text style={styles.logoutLabel}>Logout</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={C.primary}
          />
        }
      >
        <ProfileHero
          firstName={emp.first_name}
          lastName={emp.last_name}
          jobRoleName={emp.job_role_name}
          departmentName={emp.department_name}
          employeeCode={emp.employee_code}
          employmentStatus={emp.employment_status}
          isManager={isManager}
          completionPct={completionPct}
        />

        {isManager && (
          <View style={styles.managerBanner}>
            <Text style={styles.managerBannerText}>
              👥 You manage{" "}
              <Text style={styles.managerBannerBold}>{team.length}</Text> direct{" "}
              {team.length === 1 ? "report" : "reports"}
            </Text>
          </View>
        )}

        <TabBar tabs={tabs} active={safeTab} onChange={setActiveTab} />
        <View style={styles.tabContent}>{renderTab()}</View>
      </ScrollView>

      {/* Local loader — same pattern as benefits.tsx */}
      <BantaHRLetterLoader
        ref={loaderRef}
        overlay
        subtitle="Loading profile..."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg,
    padding: 24,
    gap: 10,
  },
  blank: { flex: 1, backgroundColor: C.bg },
  errorTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.textPrimary,
    marginTop: 4,
  },
  errorSub: { fontSize: 12.5, color: C.textMuted, textAlign: "center" },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
  },
  retryLabel: { fontSize: 13, fontWeight: "700", color: C.primary },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.surface,
    gap: 8,
  },
  headerBack: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  headerTitle: { fontSize: 15, fontWeight: "700", color: C.textPrimary },
  mgrHeaderBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  mgrHeaderBadgeText: { fontSize: 9.5, fontWeight: "700", color: "#D97706" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: C.dangerLight,
  },
  logoutLabel: { fontSize: 11, fontWeight: "700", color: C.danger },
  scrollContent: { padding: 16, paddingBottom: 48, gap: 14 },
  managerBanner: {
    backgroundColor: C.primaryLight,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
  },
  managerBannerText: { fontSize: 13, color: C.primary },
  managerBannerBold: { fontWeight: "800" },
  tabBar: { marginTop: 2 },
  tabBarContent: { gap: 6, paddingVertical: 4 },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  tabPillActive: { backgroundColor: C.primary, borderColor: C.primary },
  tabLabel: { fontSize: 12.5, fontWeight: "600", color: C.textSecondary },
  tabLabelActive: { color: "#fff" },
  tabContent: { marginTop: 4 },
  twoSectionGap: { gap: 14 },
});
