

// // src/app/employee/training.tsx
// // Employee Training screen — connected to backend API.
// // Mirrors the web TrainingPage pattern: useState + useEffect + trainingApi.

// import { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   Pressable,
//   StyleSheet,
//   RefreshControl,
//   TextInput,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { router } from "expo-router";
// import {
//   ArrowLeft,
//   GraduationCap,
//   Search,
//   Award,
//   Trophy,
//   BookOpen,
//   TrendingUp,
//   Target,
//   Timer,
//   RefreshCw,
//   AlertCircle,
// } from "lucide-react-native";
// import Toast from "react-native-toast-message";

// import C from "../../styles/colors";
// import Card from "../../components/ui/Card";
// import SectionHeader from "../../components/ui/SectionHeader";
// import TrainingCard from "../../components/training/TrainingCard";
// import TrainingDetailModal from "../../components/training/TrainingDetailModal";
// // import { getStatusMeta, getTypeMeta } from "../../components/training/trainingMeta";

// import {
//   getMyTrainings,
//   getTrainingDashboard,
// } from "../../api/service/trainingApi";
// import { authApi } from "../../api/service/authApi";

// type TabKey = "my" | "certificates" | "overview";

// const TABS: { id: TabKey; label: string }[] = [
//   { id: "my", label: "My Trainings" },
//   { id: "certificates", label: "Certificates" },
//   { id: "overview", label: "Overview" },
// ];

// const FILTERS: { id: string; label: string }[] = [
//   { id: "all", label: "All" },
//   { id: "completed", label: "Completed" },
//   { id: "in progress", label: "In Progress" },
//   { id: "upcoming", label: "Upcoming" },
//   { id: "cancelled", label: "Cancelled" },
// ];

// // ─── Status config that matches web's statusConfig() ─────────
// function statusConfig(training: any) {
//   const enrollment = training.enrollment_status ?? training.enrollmentStatus;
//   const attendance = training.attendance_status ?? training.attendanceStatus;
//   const trainingStatus = training.training_status ?? training.status;

//   if (attendance === "attended" || enrollment === "completed" || trainingStatus === "completed") {
//     return { label: "Completed", bg: C.successLight, color: C.success, icon: "CheckCircle2" };
//   }
//   if (trainingStatus === "ongoing" || enrollment === "enrolled") {
//     return { label: "In Progress", bg: C.primaryLight, color: C.primary, icon: "Clock" };
//   }
//   if (trainingStatus === "upcoming") {
//     return { label: "Upcoming", bg: "#FEF3C7", color: "#F59E0B", icon: "Timer" };
//   }
//   if (trainingStatus === "cancelled") {
//     return { label: "Cancelled", bg: "#FEE2E2", color: "#EF4444", icon: "X" };
//   }
//   return { label: enrollment ?? trainingStatus ?? "Enrolled", bg: C.surfaceAlt, color: C.textMuted, icon: "BookOpen" };
// }

// // ─── Type color that matches web's typeColor() ───────────────
// function typeColor(type: string) {
//   return type === "Internal"
//     ? { bg: "#EDE9FE", color: "#7C3AED" }
//     : { bg: "#ECFEFF", color: "#0891B2" };
// }

// export default function TrainingScreen() {
//   const insets = useSafeAreaInsets();

//   // ── Data state (same pattern as web) ──────────────────────
//   const [employee, setEmployee] = useState<any>(null);
//   const [trainings, setTrainings] = useState<any[]>([]);
//   const [dashboard, setDashboard] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // ── UI state ────────────────────────────────────────────────
//   const [activeTab, setActiveTab] = useState<TabKey>("my");
//   const [filterStatus, setFilterStatus] = useState<string>("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selected, setSelected] = useState<any>(null);

//   // ── Data fetch (same pattern as web's useEffect) ────────────
//   const loadData = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const [me, myRes, dashRes] = await Promise.all([
//         authApi.getMe(),
//         getMyTrainings(),
//         getTrainingDashboard(),
//       ]);
//       setEmployee(me);
//       setTrainings(myRes.data ?? []);
//       setDashboard(dashRes.data ?? null);
//     } catch (err: any) {
//       setError(err?.response?.data?.message ?? "Failed to load training data.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadData();
//   }, [loadData]);

//   // ── Derived (same as web) ─────────────────────────────────
//   const completed = useMemo(
//     () => trainings.filter((t) => statusConfig(t).label === "Completed"),
//     [trainings],
//   );
//   const inProgress = useMemo(
//     () => trainings.filter((t) => statusConfig(t).label === "In Progress"),
//     [trainings],
//   );
//   const upcoming = useMemo(
//     () => trainings.filter((t) => statusConfig(t).label === "Upcoming"),
//     [trainings],
//   );
//   const withCerts = useMemo(
//     () => trainings.filter((t) => t.certificate_issued ?? t.certificateIssued),
//     [trainings],
//   );

//   const filtered = useMemo(() => {
//     const q = searchQuery.toLowerCase();
//     return trainings.filter((t) => {
//       const matchQ =
//         !q ||
//         (t.title ?? "").toLowerCase().includes(q) ||
//         (t.provider ?? "").toLowerCase().includes(q);
//       const matchS =
//         filterStatus === "all" ||
//         statusConfig(t).label.toLowerCase() === filterStatus;
//       return matchQ && matchS;
//     });
//   }, [trainings, searchQuery, filterStatus]);

//   // ── Handlers ────────────────────────────────────────────────
//   async function handleRefresh() {
//     setRefreshing(true);
//     await loadData();
//     setRefreshing(false);
//   }

//   // ── Loading state ───────────────────────────────────────────
//   if (loading) {
//     return (
//       <View style={[styles.screen, { paddingTop: insets.top, justifyContent: "center", alignItems: "center" }]}>
//         <RefreshCw size={26} color={C.primary} style={{ transform: [{ rotate: "45deg" }] }} />
//         <Text style={{ color: C.textMuted, marginTop: 12 }}>Loading trainings…</Text>
//       </View>
//     );
//   }

//   // ── Error state ─────────────────────────────────────────────
//   if (error) {
//     return (
//       <View style={[styles.screen, { paddingTop: insets.top, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 }]}>
//         <AlertCircle size={32} color={C.danger} />
//         <Text style={{ color: C.danger, marginTop: 12, textAlign: "center" }}>{error}</Text>
//         <Pressable onPress={loadData} style={styles.retryBtn}>
//           <Text style={styles.retryLabel}>Retry</Text>
//         </Pressable>
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.screen, { paddingTop: insets.top }]}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
//           <ArrowLeft size={18} color={C.textSecondary} />
//         </Pressable>
//         <Text style={styles.headerTitle}>Training</Text>
//         <View style={{ width: 36 }} />
//       </View>

//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={styles.scrollContent}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.primary} />
//         }
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Hero */}
//         <View style={styles.hero}>
//           <View style={styles.heroTopRow}>
//             <View style={styles.heroIconWrap}>
//               <GraduationCap size={20} color="#fff" />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.heroTitle}>My Training Portal</Text>
//               <Text style={styles.heroSubtitle}>
//                 {employee ? `${employee.firstName} ${employee.lastName}` : ""}
//               </Text>
//             </View>
//           </View>

//           <View style={styles.heroStatsRow}>
//             {[
//               { label: "Assigned", value: trainings.length },
//               { label: "Completed", value: completed.length },
//               { label: "In Progress", value: inProgress.length },
//               { label: "Certificates", value: withCerts.length },
//             ].map((s) => (
//               <View key={s.label} style={styles.heroStatTile}>
//                 <Text style={styles.heroStatValue}>{s.value}</Text>
//                 <Text style={styles.heroStatLabel}>{s.label}</Text>
//               </View>
//             ))}
//           </View>
//         </View>

//         {/* Tabs */}
//         <View style={styles.tabsRow}>
//           {TABS.map((t) => {
//             const active = activeTab === t.id;
//             return (
//               <Pressable
//                 key={t.id}
//                 onPress={() => setActiveTab(t.id)}
//                 style={[styles.tabBtn, active && styles.tabBtnActive]}
//               >
//                 <Text
//                   style={[
//                     styles.tabLabel,
//                     { color: active ? "#fff" : C.textSecondary },
//                   ]}
//                   numberOfLines={1}
//                 >
//                   {t.label}
//                 </Text>
//               </Pressable>
//             );
//           })}
//         </View>

//         {/* ── My Trainings tab ── */}
//         {activeTab === "my" && (
//           <>
//             <View style={styles.searchRow}>
//               <Search size={14} color={C.textMuted} />
//               <TextInput
//                 value={searchQuery}
//                 onChangeText={setSearchQuery}
//                 placeholder="Search trainings…"
//                 placeholderTextColor={C.textMuted}
//                 style={styles.searchInput}
//               />
//             </View>

//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               style={{ flexGrow: 0 }}
//             >
//               <View style={{ flexDirection: "row", gap: 6 }}>
//                 {FILTERS.map((f) => {
//                   const active = filterStatus === f.id;
//                   return (
//                     <Pressable
//                       key={f.id}
//                       onPress={() => setFilterStatus(f.id)}
//                       style={[
//                         styles.filterChip,
//                         active && styles.filterChipActive,
//                       ]}
//                     >
//                       <Text
//                         style={[
//                           styles.filterChipLabel,
//                           { color: active ? "#fff" : C.textSecondary },
//                         ]}
//                       >
//                         {f.label}
//                       </Text>
//                     </Pressable>
//                   );
//                 })}
//               </View>
//             </ScrollView>

//             {filtered.length === 0 ? (
//               <View style={styles.emptyState}>
//                 <View style={styles.emptyIconWrap}>
//                   <BookOpen size={22} color={C.textMuted} />
//                 </View>
//                 <Text style={styles.emptyTitle}>
//                   {searchQuery
//                     ? "No trainings match your search"
//                     : "No trainings assigned yet"}
//                 </Text>
//               </View>
//             ) : (
//               <View style={styles.grid}>
//                 {filtered.map((t, i) => (
//                   <TrainingCard
//                     key={t.id}
//                     training={t}
//                     onPress={setSelected}
//                   />
//                 ))}
//               </View>
//             )}
//           </>
//         )}

//         {/* ── Certificates tab ── */}
//         {activeTab === "certificates" && (
//           <Card padded style={styles.certCard}>
//             <View style={styles.certHeaderRow}>
//               <Award size={15} color="#D97706" />
//               <Text style={styles.certHeaderTitle}>
//                 My Certificates ({withCerts.length})
//               </Text>
//             </View>

//             {withCerts.length === 0 ? (
//               <View style={styles.emptyState}>
//                 <View style={styles.emptyIconWrap}>
//                   <Trophy size={22} color={C.textMuted} />
//                 </View>
//                 <Text style={styles.emptyTitle}>
//                   No certificates issued yet
//                 </Text>
//                 <Text style={styles.emptySubtitle}>
//                   Complete a training to earn your certificate.
//                 </Text>
//               </View>
//             ) : (
//               <View style={styles.certList}>
//                 {withCerts.map((t) => (
//                   <Pressable
//                     key={t.id}
//                     onPress={() => setSelected(t)}
//                     style={({ pressed }) => [
//                       styles.certRow,
//                       pressed && { opacity: 0.85 },
//                     ]}
//                   >
//                     <View style={styles.certIconWrap}>
//                       <Award size={18} color="#D97706" />
//                     </View>
//                     <View style={{ flex: 1 }}>
//                       <Text style={styles.certRowTitle} numberOfLines={1}>
//                         {t.title}
//                       </Text>
//                       <Text style={styles.certRowSub}>
//                         {t.provider ?? "—"} ·{" "}
//                         {t.completed_at
//                           ? new Date(t.completed_at).toLocaleDateString(
//                               "en-GB",
//                               {
//                                 day: "2-digit",
//                                 month: "short",
//                                 year: "numeric",
//                               },
//                             )
//                           : "Date unknown"}
//                       </Text>
//                     </View>
//                     <View style={styles.certBadge}>
//                       <Text style={styles.certBadgeLabel}>Certified</Text>
//                     </View>
//                   </Pressable>
//                 ))}
//               </View>
//             )}
//           </Card>
//         )}

//         {/* ── Overview tab ── */}
//         {activeTab === "overview" && dashboard && (
//           <View style={{ gap: 14 }}>
//             <View style={styles.overviewGrid}>
//               {[
//                 {
//                   label: "Total Trainings",
//                   value: dashboard.totalTrainings,
//                   color: C.primary,
//                   light: C.primaryLight,
//                   Icon: BookOpen,
//                 },
//                 {
//                   label: "Employees Trained",
//                   value: dashboard.employeesTrained,
//                   color: C.success,
//                   light: C.successLight,
//                   Icon: TrendingUp,
//                 },
//                 {
//                   label: "Completion Rate",
//                   value: `${dashboard.completionRate}%`,
//                   color: "#8B5CF6",
//                   light: "#EDE9FE",
//                   Icon: Target,
//                 },
//                 {
//                   label: "Upcoming",
//                   value: dashboard.upcomingCount,
//                   color: "#F59E0B",
//                   light: "#FEF3C7",
//                   Icon: Timer,
//                 },
//               ].map((s) => (
//                 <View key={s.label} style={styles.overviewTile}>
//                   <View
//                     style={[
//                       styles.overviewIconWrap,
//                       { backgroundColor: s.light },
//                     ]}
//                   >
//                     <s.Icon size={16} color={s.color} />
//                   </View>
//                   <Text style={styles.overviewValue}>{s.value}</Text>
//                   <Text style={styles.overviewLabel}>{s.label}</Text>
//                 </View>
//               ))}
//             </View>

//             {dashboard.upcoming && dashboard.upcoming.length > 0 && (
//               <Card padded style={{ gap: 4 }}>
//                 <SectionHeader
//                   title="Upcoming Company Trainings"
//                   showChevron={false}
//                 />
//                 <View style={{ gap: 4 }}>
//                   {dashboard.upcoming.map((t: any) => (
//                     <View key={t.id} style={styles.upcomingRow}>
//                       <View style={styles.upcomingIconWrap}>
//                         <BookOpen size={14} color={C.primary} />
//                       </View>
//                       <View style={{ flex: 1 }}>
//                         <Text style={styles.upcomingTitle} numberOfLines={1}>
//                           {t.title}
//                         </Text>
//                         <Text style={styles.upcomingSub}>
//                           {t.start_date
//                             ? new Date(t.start_date).toLocaleDateString("en-GB")
//                             : "TBD"}{" "}
//                           · {t.enrolled_count ?? 0}/{t.max_attendees ?? "∞"}{" "}
//                           enrolled
//                         </Text>
//                       </View>
//                       <View style={styles.upcomingTypeBadge}>
//                         <Text style={styles.upcomingTypeLabel}>{t.type}</Text>
//                       </View>
//                     </View>
//                   ))}
//                 </View>
//               </Card>
//             )}
//           </View>
//         )}

//         <View style={{ height: 24 }} />
//       </ScrollView>

//       <TrainingDetailModal
//         training={selected}
//         onClose={() => setSelected(null)}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//     backgroundColor: C.bg,
//   },
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
//   retryBtn: {
//     marginTop: 16,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 12,
//     backgroundColor: C.primary,
//   },
//   retryLabel: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: "#fff",
//   },
//   scrollContent: {
//     paddingHorizontal: 16,
//     gap: 14,
//     paddingBottom: 12,
//   },
//   hero: {
//     borderRadius: 20,
//     padding: 18,
//     backgroundColor: C.navy,
//     gap: 16,
//   },
//   heroTopRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   heroIconWrap: {
//     width: 42,
//     height: 42,
//     borderRadius: 14,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(255,255,255,0.15)",
//   },
//   heroTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#fff",
//   },
//   heroSubtitle: {
//     fontSize: 12.5,
//     color: "rgba(224,225,255,0.85)",
//     marginTop: 2,
//   },
//   heroStatsRow: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 10,
//   },
//   heroStatTile: {
//     flexBasis: "47%",
//     flexGrow: 1,
//     borderRadius: 14,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     backgroundColor: "rgba(255,255,255,0.10)",
//   },
//   heroStatValue: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#fff",
//   },
//   heroStatLabel: {
//     fontSize: 10.5,
//     color: "rgba(255,255,255,0.6)",
//     marginTop: 2,
//   },
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
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 9,
//     borderRadius: 10,
//   },
//   tabBtnActive: {
//     backgroundColor: C.primary,
//   },
//   tabLabel: {
//     fontSize: 11,
//     fontWeight: "700",
//   },
//   searchRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     backgroundColor: C.surface,
//     borderWidth: 1.5,
//     borderColor: C.border,
//     borderRadius: 14,
//     paddingHorizontal: 13,
//     paddingVertical: 11,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 13.5,
//     color: C.textPrimary,
//     padding: 0,
//   },
//   filterChip: {
//     paddingVertical: 7,
//     paddingHorizontal: 12,
//     borderRadius: 999,
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   filterChipActive: {
//     backgroundColor: C.primary,
//     borderColor: C.primary,
//   },
//   filterChipLabel: {
//     fontSize: 11.5,
//     fontWeight: "700",
//   },
//   grid: {
//     gap: 10,
//   },
//   emptyState: {
//     alignItems: "center",
//     gap: 8,
//     paddingVertical: 32,
//   },
//   emptyIconWrap: {
//     width: 50,
//     height: 50,
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surfaceAlt,
//   },
//   emptyTitle: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: C.textSecondary,
//     textAlign: "center",
//     paddingHorizontal: 24,
//   },
//   emptySubtitle: {
//     fontSize: 11.5,
//     color: C.textMuted,
//     textAlign: "center",
//   },
//   certCard: {
//     gap: 10,
//   },
//   certHeaderRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 7,
//     marginBottom: 2,
//   },
//   certHeaderTitle: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: C.textPrimary,
//   },
//   certList: {
//     gap: 8,
//   },
//   certRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     padding: 12,
//     borderRadius: 14,
//     backgroundColor: C.surfaceAlt,
//   },
//   certIconWrap: {
//     width: 38,
//     height: 38,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#FEF3C7",
//   },
//   certRowTitle: {
//     fontSize: 12.5,
//     fontWeight: "700",
//     color: C.textPrimary,
//   },
//   certRowSub: {
//     fontSize: 10.5,
//     color: C.textMuted,
//     marginTop: 1,
//   },
//   certBadge: {
//     paddingHorizontal: 9,
//     paddingVertical: 4,
//     borderRadius: 999,
//     backgroundColor: "#FEF3C7",
//   },
//   certBadgeLabel: {
//     fontSize: 9.5,
//     fontWeight: "700",
//     color: "#D97706",
//   },
//   overviewGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 10,
//   },
//   overviewTile: {
//     width: "47%",
//     backgroundColor: C.surface,
//     borderRadius: 18,
//     borderWidth: 1,
//     borderColor: C.border,
//     padding: 14,
//   },
//   overviewIconWrap: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 10,
//   },
//   overviewValue: {
//     fontSize: 17,
//     fontWeight: "700",
//     color: C.textPrimary,
//   },
//   overviewLabel: {
//     fontSize: 11,
//     color: C.textSecondary,
//     marginTop: 2,
//   },
//   upcomingRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     paddingVertical: 9,
//   },
//   upcomingIconWrap: {
//     width: 32,
//     height: 32,
//     borderRadius: 11,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.primaryLight,
//   },
//   upcomingTitle: {
//     fontSize: 12.5,
//     fontWeight: "700",
//     color: C.textPrimary,
//   },
//   upcomingSub: {
//     fontSize: 10.5,
//     color: C.textMuted,
//     marginTop: 1,
//   },
//   upcomingTypeBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 999,
//     backgroundColor: "#FEF3C7",
//   },
//   upcomingTypeLabel: {
//     fontSize: 9.5,
//     fontWeight: "700",
//     color: "#F59E0B",
//   },
// });




// src/app/employee/training.tsx
// Employee Training screen — connected to backend API.
// Mirrors the web TrainingPage pattern: useState + useEffect + trainingApi.

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ArrowLeft,
  GraduationCap,
  Search,
  Award,
  Trophy,
  BookOpen,
  TrendingUp,
  Target,
  Timer,
  RefreshCw,
  AlertCircle,
} from "lucide-react-native";
import Toast from "react-native-toast-message";

import C from "../../styles/colors";
import Card from "../../components/ui/Card";
import SectionHeader from "../../components/ui/SectionHeader";
import TrainingCard from "../../components/training/TrainingCard";
import TrainingDetailModal from "../../components/training/TrainingDetailModal";
import BantaHRLetterLoader, {
  BantaHRLetterLoaderRef,
} from "../../components/BantaHRLetterLoader";
// import { getStatusMeta, getTypeMeta } from "../../components/training/trainingMeta";

import {
  getMyTrainings,
  getTrainingDashboard,
} from "../../api/service/trainingApi";
import { authApi } from "../../api/service/authApi";

type TabKey = "my" | "certificates" | "overview";

const TABS: { id: TabKey; label: string }[] = [
  { id: "my", label: "My Trainings" },
  { id: "certificates", label: "Certificates" },
  { id: "overview", label: "Overview" },
];

const FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "in progress", label: "In Progress" },
  { id: "upcoming", label: "Upcoming" },
  { id: "cancelled", label: "Cancelled" },
];

// ─── Status config that matches web's statusConfig() ─────────
function statusConfig(training: any) {
  const enrollment = training.enrollment_status ?? training.enrollmentStatus;
  const attendance = training.attendance_status ?? training.attendanceStatus;
  const trainingStatus = training.training_status ?? training.status;

  if (attendance === "attended" || enrollment === "completed" || trainingStatus === "completed") {
    return { label: "Completed", bg: C.successLight, color: C.success, icon: "CheckCircle2" };
  }
  if (trainingStatus === "ongoing" || enrollment === "enrolled") {
    return { label: "In Progress", bg: C.primaryLight, color: C.primary, icon: "Clock" };
  }
  if (trainingStatus === "upcoming") {
    return { label: "Upcoming", bg: "#FEF3C7", color: "#F59E0B", icon: "Timer" };
  }
  if (trainingStatus === "cancelled") {
    return { label: "Cancelled", bg: "#FEE2E2", color: "#EF4444", icon: "X" };
  }
  return { label: enrollment ?? trainingStatus ?? "Enrolled", bg: C.surfaceAlt, color: C.textMuted, icon: "BookOpen" };
}

// ─── Type color that matches web's typeColor() ───────────────
function typeColor(type: string) {
  return type === "Internal"
    ? { bg: "#EDE9FE", color: "#7C3AED" }
    : { bg: "#ECFEFF", color: "#0891B2" };
}

export default function TrainingScreen() {
  const insets = useSafeAreaInsets();
  const loaderRef = useRef<BantaHRLetterLoaderRef>(null);

  // ── Data state (same pattern as web) ──────────────────────
  const [employee, setEmployee] = useState<any>(null);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── UI state ────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabKey>("my");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<any>(null);

  // ── Data fetch (same pattern as web's useEffect) ────────────
  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [me, myRes, dashRes] = await Promise.all([
        authApi.getMe(),
        getMyTrainings(),
        getTrainingDashboard(),
      ]);
      setEmployee(me);
      setTrainings(myRes.data ?? []);
      setDashboard(dashRes.data ?? null);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load training data.");
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

  // ── Derived (same as web) ─────────────────────────────────
  const completed = useMemo(
    () => trainings.filter((t) => statusConfig(t).label === "Completed"),
    [trainings],
  );
  const inProgress = useMemo(
    () => trainings.filter((t) => statusConfig(t).label === "In Progress"),
    [trainings],
  );
  const upcoming = useMemo(
    () => trainings.filter((t) => statusConfig(t).label === "Upcoming"),
    [trainings],
  );
  const withCerts = useMemo(
    () => trainings.filter((t) => t.certificate_issued ?? t.certificateIssued),
    [trainings],
  );

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return trainings.filter((t) => {
      const matchQ =
        !q ||
        (t.title ?? "").toLowerCase().includes(q) ||
        (t.provider ?? "").toLowerCase().includes(q);
      const matchS =
        filterStatus === "all" ||
        statusConfig(t).label.toLowerCase() === filterStatus;
      return matchQ && matchS;
    });
  }, [trainings, searchQuery, filterStatus]);

  // ── Handlers ────────────────────────────────────────────────
  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  // ── Error state ─────────────────────────────────────────────
  if (error) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 }]}>
        <AlertCircle size={32} color={C.danger} />
        <Text style={{ color: C.danger, marginTop: 12, textAlign: "center" }}>{error}</Text>
        <Pressable onPress={loadData} style={styles.retryBtn}>
          <Text style={styles.retryLabel}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <ArrowLeft size={18} color={C.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Training</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconWrap}>
              <GraduationCap size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>My Training Portal</Text>
              <Text style={styles.heroSubtitle}>
                {employee ? `${employee.firstName} ${employee.lastName}` : ""}
              </Text>
            </View>
          </View>

          <View style={styles.heroStatsRow}>
            {[
              { label: "Assigned", value: trainings.length },
              { label: "Completed", value: completed.length },
              { label: "In Progress", value: inProgress.length },
              { label: "Certificates", value: withCerts.length },
            ].map((s) => (
              <View key={s.label} style={styles.heroStatTile}>
                <Text style={styles.heroStatValue}>{s.value}</Text>
                <Text style={styles.heroStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setActiveTab(t.id)}
                style={[styles.tabBtn, active && styles.tabBtnActive]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    { color: active ? "#fff" : C.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── My Trainings tab ── */}
        {activeTab === "my" && (
          <>
            <View style={styles.searchRow}>
              <Search size={14} color={C.textMuted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search trainings…"
                placeholderTextColor={C.textMuted}
                style={styles.searchInput}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
            >
              <View style={{ flexDirection: "row", gap: 6 }}>
                {FILTERS.map((f) => {
                  const active = filterStatus === f.id;
                  return (
                    <Pressable
                      key={f.id}
                      onPress={() => setFilterStatus(f.id)}
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
                        {f.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <BookOpen size={22} color={C.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>
                  {searchQuery
                    ? "No trainings match your search"
                    : "No trainings assigned yet"}
                </Text>
              </View>
            ) : (
              <View style={styles.grid}>
                {filtered.map((t, i) => (
                  <TrainingCard
                    key={t.id}
                    training={t}
                    onPress={setSelected}
                  />
                ))}
              </View>
            )}
          </>
        )}

        {/* ── Certificates tab ── */}
        {activeTab === "certificates" && (
          <Card padded style={styles.certCard}>
            <View style={styles.certHeaderRow}>
              <Award size={15} color="#D97706" />
              <Text style={styles.certHeaderTitle}>
                My Certificates ({withCerts.length})
              </Text>
            </View>

            {withCerts.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <Trophy size={22} color={C.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>
                  No certificates issued yet
                </Text>
                <Text style={styles.emptySubtitle}>
                  Complete a training to earn your certificate.
                </Text>
              </View>
            ) : (
              <View style={styles.certList}>
                {withCerts.map((t) => (
                  <Pressable
                    key={t.id}
                    onPress={() => setSelected(t)}
                    style={({ pressed }) => [
                      styles.certRow,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <View style={styles.certIconWrap}>
                      <Award size={18} color="#D97706" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.certRowTitle} numberOfLines={1}>
                        {t.title}
                      </Text>
                      <Text style={styles.certRowSub}>
                        {t.provider ?? "—"} ·{" "}
                        {t.completed_at
                          ? new Date(t.completed_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "Date unknown"}
                      </Text>
                    </View>
                    <View style={styles.certBadge}>
                      <Text style={styles.certBadgeLabel}>Certified</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* ── Overview tab ── */}
        {activeTab === "overview" && dashboard && (
          <View style={{ gap: 14 }}>
            <View style={styles.overviewGrid}>
              {[
                {
                  label: "Total Trainings",
                  value: dashboard.totalTrainings,
                  color: C.primary,
                  light: C.primaryLight,
                  Icon: BookOpen,
                },
                {
                  label: "Employees Trained",
                  value: dashboard.employeesTrained,
                  color: C.success,
                  light: C.successLight,
                  Icon: TrendingUp,
                },
                {
                  label: "Completion Rate",
                  value: `${dashboard.completionRate}%`,
                  color: "#8B5CF6",
                  light: "#EDE9FE",
                  Icon: Target,
                },
                {
                  label: "Upcoming",
                  value: dashboard.upcomingCount,
                  color: "#F59E0B",
                  light: "#FEF3C7",
                  Icon: Timer,
                },
              ].map((s) => (
                <View key={s.label} style={styles.overviewTile}>
                  <View
                    style={[
                      styles.overviewIconWrap,
                      { backgroundColor: s.light },
                    ]}
                  >
                    <s.Icon size={16} color={s.color} />
                  </View>
                  <Text style={styles.overviewValue}>{s.value}</Text>
                  <Text style={styles.overviewLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {dashboard.upcoming && dashboard.upcoming.length > 0 && (
              <Card padded style={{ gap: 4 }}>
                <SectionHeader
                  title="Upcoming Company Trainings"
                  showChevron={false}
                />
                <View style={{ gap: 4 }}>
                  {dashboard.upcoming.map((t: any) => (
                    <View key={t.id} style={styles.upcomingRow}>
                      <View style={styles.upcomingIconWrap}>
                        <BookOpen size={14} color={C.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.upcomingTitle} numberOfLines={1}>
                          {t.title}
                        </Text>
                        <Text style={styles.upcomingSub}>
                          {t.start_date
                            ? new Date(t.start_date).toLocaleDateString("en-GB")
                            : "TBD"}{" "}
                          · {t.enrolled_count ?? 0}/{t.max_attendees ?? "∞"}{" "}
                          enrolled
                        </Text>
                      </View>
                      <View style={styles.upcomingTypeBadge}>
                        <Text style={styles.upcomingTypeLabel}>{t.type}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </Card>
            )}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      <TrainingDetailModal
        training={selected}
        onClose={() => setSelected(null)}
      />

      {/* Global loader — the only loader in this screen */}
      <BantaHRLetterLoader
        ref={loaderRef}
        overlay
        subtitle="Loading training data..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
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
  retryBtn: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: C.primary,
  },
  retryLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 14,
    paddingBottom: 12,
  },
  hero: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: C.navy,
    gap: 16,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: "rgba(224,225,255,0.85)",
    marginTop: 2,
  },
  heroStatsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  heroStatTile: {
    flexBasis: "47%",
    flexGrow: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  heroStatValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  heroStatLabel: {
    fontSize: 10.5,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
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
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: C.primary,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: C.textPrimary,
    padding: 0,
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterChipActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  filterChipLabel: {
    fontSize: 11.5,
    fontWeight: "700",
  },
  grid: {
    gap: 10,
  },
  emptyState: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 32,
  },
  emptyIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textSecondary,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  emptySubtitle: {
    fontSize: 11.5,
    color: C.textMuted,
    textAlign: "center",
  },
  certCard: {
    gap: 10,
  },
  certHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 2,
  },
  certHeaderTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.textPrimary,
  },
  certList: {
    gap: 8,
  },
  certRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
  },
  certIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF3C7",
  },
  certRowTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: C.textPrimary,
  },
  certRowSub: {
    fontSize: 10.5,
    color: C.textMuted,
    marginTop: 1,
  },
  certBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#FEF3C7",
  },
  certBadgeLabel: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#D97706",
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  overviewTile: {
    width: "47%",
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  overviewIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  overviewValue: {
    fontSize: 17,
    fontWeight: "700",
    color: C.textPrimary,
  },
  overviewLabel: {
    fontSize: 11,
    color: C.textSecondary,
    marginTop: 2,
  },
  upcomingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
  },
  upcomingIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  upcomingTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: C.textPrimary,
  },
  upcomingSub: {
    fontSize: 10.5,
    color: C.textMuted,
    marginTop: 1,
  },
  upcomingTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#FEF3C7",
  },
  upcomingTypeLabel: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#F59E0B",
  },
});