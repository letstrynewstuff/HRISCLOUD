// // src/app/employee/performance.tsx
// // Performance screen — role-aware.
// // Employee: score ring, goals, received appraisals, insights.
// // Manager: everything above + team appraisals (create / edit / submit to HR).
// // Zero mock data — all from performanceApi, appraisalApi, employeeApi.

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
//   BarChart2,
//   Target,
//   ClipboardList,
//   Plus,
//   AlertCircle,
//   RefreshCw,
//   Lightbulb,
//   Users,
//   TrendingUp,
//   Send,
// } from "lucide-react-native";
// import Toast from "react-native-toast-message";

// import C from "../../styles/colors";
// import { useAuth } from "../../hooks/useAuth";
// import ScoreRing from "../../components/performance/ScoreRing";
// import GoalCard from "../../components/performance/GoalCard";
// import AppraisalCard from "../../components/performance/AppraisalCard";
// import AppraisalDetailModal from "../../components/performance/AppraisalDetailModal";
// import CreateAppraisalModal from "../../components/performance/CreateAppraisalModal";

// import {
//   getMyGoals,
//   getInsights,
//   getEmployeeScores,
// } from "../../api/service/performanceApi";

// import {
//   getMyAppraisals,
//   listAppraisals,
//   listTemplates,
//   submitAppraisal,
// } from "../../api/service/appraisal.api";

// import { getEmployees } from "../../api/service/employeeApi";

// type TabKey = "overview" | "goals" | "appraisals";

// const TABS: { id: TabKey; label: string; Icon: typeof BarChart2 }[] = [
//   { id: "overview", label: "Overview", Icon: BarChart2 },
//   { id: "goals", label: "Goals", Icon: Target },
//   { id: "appraisals", label: "Appraisals", Icon: ClipboardList },
// ];

// export default function PerformanceScreen() {
//   const insets = useSafeAreaInsets();
//   const { employee } = useAuth();
//   const isManager = employee?.isManager ?? false;
//   const employeeId = employee?.id ?? "";

//   // ── Data ─────────────────────────────────────────────────────
//   const [latestScore, setLatestScore] = useState<number | null>(null);
//   const [goals, setGoals] = useState<any[]>([]);
//   const [insights, setInsights] = useState<any[]>([]);
//   const [myAppraisals, setMyAppraisals] = useState<any[]>([]);
//   const [teamAppraisals, setTeamAppraisals] = useState<any[]>([]);
//   const [employees, setEmployees] = useState<any[]>([]);
//   const [templates, setTemplates] = useState<any[]>([]);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);

//   // ── UI ───────────────────────────────────────────────────────
//   const [activeTab, setActiveTab] = useState<TabKey>("overview");
//   const [detailAppraisal, setDetailAppraisal] = useState<Record<
//     string,
//     any
//   > | null>(null);
//   const [detailPerspective, setDetailPerspective] = useState<
//     "received" | "created"
//   >("received");
//   const [createOpen, setCreateOpen] = useState(false);
//   const [editingAppraisal, setEditingAppraisal] = useState<Record<
//     string,
//     any
//   > | null>(null);
//   const [submittingId, setSubmittingId] = useState<string | null>(null);

//   // ── Load ─────────────────────────────────────────────────────
//   const loadData = useCallback(async () => {
//     if (!employeeId) return;
//     setError(null);
//     try {
//       const baseRequests = [
//         getMyGoals(),
//         getInsights(employeeId),
//         getEmployeeScores(employeeId),
//         getMyAppraisals(),
//       ];
//       const managerRequests = isManager
//         ? [
//             listAppraisals({ managerId: employeeId }),
//             getEmployees(),
//             listTemplates(),
//           ]
//         : [];

//       const results = await Promise.all([...baseRequests, ...managerRequests]);

//       const [goalsRes, insightsRes, scoresRes, myAppRes, ...managerRes] =
//         results;

//       // Goals
//       const goalsArr = goalsRes?.data ?? goalsRes?.goals ?? goalsRes ?? [];
//       setGoals(Array.isArray(goalsArr) ? goalsArr : []);

//       // Insights
//       const insightsArr =
//         insightsRes?.data ?? insightsRes?.insights ?? insightsRes ?? [];
//       setInsights(Array.isArray(insightsArr) ? insightsArr : []);

//       // Latest score — take the most recent entry
//       const scoresArr = scoresRes?.data ?? scoresRes?.scores ?? scoresRes ?? [];
//       if (Array.isArray(scoresArr) && scoresArr.length > 0) {
//         const sorted = [...scoresArr].sort(
//           (a, b) =>
//             new Date(b.createdAt ?? b.period ?? 0).getTime() -
//             new Date(a.createdAt ?? a.period ?? 0).getTime(),
//         );
//         setLatestScore(sorted[0]?.score ?? sorted[0]?.totalScore ?? null);
//       } else {
//         setLatestScore(null);
//       }

//       // My received appraisals
//       const myAppArr = myAppRes?.appraisals ?? myAppRes?.data ?? myAppRes ?? [];
//       setMyAppraisals(Array.isArray(myAppArr) ? myAppArr : []);

//       // Manager extras
//       if (isManager && managerRes.length >= 3) {
//         const [teamRes, empRes, tplRes] = managerRes;
//         const teamArr = teamRes?.appraisals ?? teamRes?.data ?? teamRes ?? [];
//         setTeamAppraisals(Array.isArray(teamArr) ? teamArr : []);
//         const empArr = empRes?.data ?? empRes?.employees ?? empRes ?? [];
//         setEmployees(Array.isArray(empArr) ? empArr : []);
//         const tplArr = tplRes?.templates ?? tplRes?.data ?? tplRes ?? [];
//         setTemplates(Array.isArray(tplArr) ? tplArr : []);
//       }
//     } catch (err: any) {
//       setError(
//         err?.response?.data?.message ??
//           (err?.isNetworkError || err?.isTimeout
//             ? err.message
//             : "Failed to load performance data."),
//       );
//     }
//   }, [employeeId, isManager]);

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       await loadData();
//       setLoading(false);
//     })();
//   }, [loadData]);

//   async function handleRefresh() {
//     setRefreshing(true);
//     await loadData();
//     setRefreshing(false);
//   }

//   // ── Submit appraisal (manager) ───────────────────────────────
//   async function handleSubmitAppraisal(appraisalId: string) {
//     setSubmittingId(appraisalId);
//     try {
//       await submitAppraisal(appraisalId);
//       Toast.show({ type: "success", text1: "Appraisal submitted to HR" });
//       setDetailAppraisal(null);
//       await loadData();
//     } catch (err: any) {
//       Toast.show({
//         type: "error",
//         text1: err?.response?.data?.message ?? "Failed to submit appraisal.",
//       });
//     } finally {
//       setSubmittingId(null);
//     }
//   }

//   // ── Derived stats ────────────────────────────────────────────
//   const completedGoals = useMemo(
//     () =>
//       goals.filter(
//         (g) =>
//           (g.progress ?? 0) >= 100 || g.status?.toLowerCase() === "completed",
//       ).length,
//     [goals],
//   );
//   const pendingAppraisals = useMemo(
//     () =>
//       [...myAppraisals, ...teamAppraisals].filter((a) =>
//         ["draft", "submitted", "rejected"].includes(a.status),
//       ).length,
//     [myAppraisals, teamAppraisals],
//   );

//   if (loading) {
//     return (
//       <View style={[styles.screen, styles.center, { paddingTop: insets.top }]}>
//         <ActivityIndicator size="small" color={C.primary} />
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.screen, { paddingTop: insets.top }]}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Pressable
//           onPress={() => router.back()}
//           hitSlop={8}
//           style={styles.backBtn}
//         >
//           <ArrowLeft size={18} color={C.textSecondary} />
//         </Pressable>
//         <Text style={styles.headerTitle}>Performance</Text>
//         {isManager ? (
//           <Pressable
//             onPress={() => {
//               setEditingAppraisal(null);
//               setCreateOpen(true);
//             }}
//             hitSlop={8}
//             style={styles.addBtn}
//           >
//             <Plus size={18} color="#fff" />
//           </Pressable>
//         ) : (
//           <View style={{ width: 36 }} />
//         )}
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
//         {/* Hero */}
//         <View style={styles.hero}>
//           <View style={styles.heroLeft}>
//             <View style={styles.heroIconWrap}>
//               <TrendingUp size={20} color="#fff" />
//             </View>
//             <View>
//               <Text style={styles.heroTitle}>My Performance</Text>
//               <Text style={styles.heroSubtitle}>
//                 {employee?.name ?? "Employee"}
//                 {isManager ? " · Manager" : ""}
//               </Text>
//             </View>
//           </View>

//           <View style={styles.heroBody}>
//             {/* Score ring */}
//             <View style={styles.ringWrap}>
//               <ScoreRing score={latestScore} size={120} />
//               <Text style={styles.ringLabel}>Latest Score</Text>
//             </View>

//             {/* Quick stats */}
//             <View style={styles.heroStats}>
//               {[
//                 {
//                   label: "Goals",
//                   value: goals.length,
//                   sub: `${completedGoals} done`,
//                 },
//                 {
//                   label: "Appraisals",
//                   value: myAppraisals.length,
//                   sub: `${pendingAppraisals} pending`,
//                 },
//                 ...(isManager
//                   ? [
//                       {
//                         label: "Team",
//                         value: teamAppraisals.length,
//                         sub: "created",
//                       },
//                     ]
//                   : []),
//               ].map((s) => (
//                 <View key={s.label} style={styles.heroStatTile}>
//                   <Text style={styles.heroStatValue}>{s.value}</Text>
//                   <Text style={styles.heroStatLabel}>{s.label}</Text>
//                   <Text style={styles.heroStatSub}>{s.sub}</Text>
//                 </View>
//               ))}
//             </View>
//           </View>
//         </View>

//         {/* Error banner */}
//         {error ? (
//           <View style={styles.errorBanner}>
//             <AlertCircle size={15} color={C.danger} />
//             <Text style={styles.errorText}>{error}</Text>
//             <Pressable onPress={loadData} hitSlop={8}>
//               <RefreshCw size={14} color={C.danger} />
//             </Pressable>
//           </View>
//         ) : null}

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

//         {/* ══ OVERVIEW TAB ══ */}
//         {activeTab === "overview" && (
//           <View style={{ gap: 12 }}>
//             {insights.length === 0 ? (
//               <View style={styles.emptyState}>
//                 <Lightbulb size={24} color={C.textMuted} />
//                 <Text style={styles.emptyTitle}>No insights yet</Text>
//                 <Text style={styles.emptySubtitle}>
//                   Insights appear once performance data has been calculated.
//                 </Text>
//               </View>
//             ) : (
//               <>
//                 <Text style={styles.sectionTitle}>Performance Insights</Text>
//                 {insights.map((ins: any, i: number) => (
//                   <View
//                     key={ins.id ?? i}
//                     style={[
//                       styles.insightCard,
//                       {
//                         borderLeftColor:
//                           ins.type === "strength"
//                             ? C.success
//                             : ins.type === "improvement"
//                               ? C.warning
//                               : ins.type === "risk"
//                                 ? C.danger
//                                 : C.primary,
//                       },
//                     ]}
//                   >
//                     <Text style={styles.insightType}>
//                       {ins.type === "strength"
//                         ? "💪 Strength"
//                         : ins.type === "improvement"
//                           ? "📈 Improve"
//                           : ins.type === "risk"
//                             ? "⚠️ Risk"
//                             : "💡 Insight"}
//                     </Text>
//                     <Text style={styles.insightText}>
//                       {ins.message ?? ins.text ?? ins.insight}
//                     </Text>
//                     {ins.metric && (
//                       <Text style={styles.insightMeta}>{ins.metric}</Text>
//                     )}
//                   </View>
//                 ))}
//               </>
//             )}

//             {/* Manager quick stats */}
//             {isManager && teamAppraisals.length > 0 && (
//               <View style={styles.managerSummaryCard}>
//                 <View style={styles.managerSummaryHeader}>
//                   <Users size={15} color={C.primary} />
//                   <Text style={styles.managerSummaryTitle}>
//                     Team Appraisal Summary
//                   </Text>
//                 </View>
//                 {(
//                   [
//                     "draft",
//                     "submitted",
//                     "hr_scored",
//                     "completed",
//                     "rejected",
//                   ] as const
//                 ).map((s) => {
//                   const count = teamAppraisals.filter(
//                     (a) => a.status === s,
//                   ).length;
//                   if (count === 0) return null;
//                   return (
//                     <View key={s} style={styles.summaryRow}>
//                       <Text style={styles.summaryLabel}>
//                         {s === "draft"
//                           ? "Draft"
//                           : s === "submitted"
//                             ? "Under Review"
//                             : s === "hr_scored"
//                               ? "HR Scored"
//                               : s === "completed"
//                                 ? "Completed"
//                                 : "Returned"}
//                       </Text>
//                       <Text style={styles.summaryCount}>{count}</Text>
//                     </View>
//                   );
//                 })}
//               </View>
//             )}
//           </View>
//         )}

//         {/* ══ GOALS TAB ══ */}
//         {activeTab === "goals" && (
//           <View>
//             {goals.length === 0 ? (
//               <View style={styles.emptyState}>
//                 <Target size={24} color={C.textMuted} />
//                 <Text style={styles.emptyTitle}>No goals assigned</Text>
//                 <Text style={styles.emptySubtitle}>
//                   Goals assigned by your manager will appear here.
//                 </Text>
//               </View>
//             ) : (
//               <>
//                 <View style={styles.sectionHeaderRow}>
//                   <Text style={styles.sectionTitle}>My Goals</Text>
//                   <Text style={styles.sectionCount}>{goals.length}</Text>
//                 </View>
//                 {goals.map((g: any) => (
//                   <GoalCard key={g.id} goal={g} />
//                 ))}
//               </>
//             )}
//           </View>
//         )}

//         {/* ══ APPRAISALS TAB ══ */}
//         {activeTab === "appraisals" && (
//           <View style={{ gap: 16 }}>
//             {/* My received appraisals */}
//             <View>
//               <View style={styles.sectionHeaderRow}>
//                 <Text style={styles.sectionTitle}>My Appraisals</Text>
//                 <Text style={styles.sectionCount}>{myAppraisals.length}</Text>
//               </View>

//               {myAppraisals.length === 0 ? (
//                 <View style={styles.emptyState}>
//                   <ClipboardList size={22} color={C.textMuted} />
//                   <Text style={styles.emptyTitle}>No appraisals yet</Text>
//                   <Text style={styles.emptySubtitle}>
//                     Appraisals from your manager will appear here once created.
//                   </Text>
//                 </View>
//               ) : (
//                 myAppraisals.map((a: any) => (
//                   <AppraisalCard
//                     key={a.id}
//                     appraisal={a}
//                     perspective="received"
//                     onView={() => {
//                       setDetailPerspective("received");
//                       setDetailAppraisal(a);
//                     }}
//                   />
//                 ))
//               )}
//             </View>

//             {/* Manager: Team appraisals */}
//             {isManager && (
//               <View>
//                 <View style={styles.sectionHeaderRow}>
//                   <View
//                     style={{
//                       flexDirection: "row",
//                       alignItems: "center",
//                       gap: 6,
//                     }}
//                   >
//                     <Users size={14} color={C.primary} />
//                     <Text style={styles.sectionTitle}>Team Appraisals</Text>
//                   </View>
//                   <View
//                     style={{
//                       flexDirection: "row",
//                       alignItems: "center",
//                       gap: 8,
//                     }}
//                   >
//                     <Text style={styles.sectionCount}>
//                       {teamAppraisals.length}
//                     </Text>
//                     <Pressable
//                       onPress={() => {
//                         setEditingAppraisal(null);
//                         setCreateOpen(true);
//                       }}
//                       style={styles.newAppraisalBtn}
//                     >
//                       <Plus size={12} color={C.primary} />
//                       <Text style={styles.newAppraisalLabel}>New</Text>
//                     </Pressable>
//                   </View>
//                 </View>

//                 {teamAppraisals.length === 0 ? (
//                   <Pressable
//                     onPress={() => {
//                       setEditingAppraisal(null);
//                       setCreateOpen(true);
//                     }}
//                     style={({ pressed }) => [
//                       styles.createFirstCard,
//                       pressed && { opacity: 0.85 },
//                     ]}
//                   >
//                     <Plus size={20} color={C.primary} />
//                     <Text style={styles.createFirstTitle}>
//                       Create your first appraisal
//                     </Text>
//                     <Text style={styles.createFirstSub}>
//                       Tap to start an appraisal for a team member.
//                     </Text>
//                   </Pressable>
//                 ) : (
//                   teamAppraisals.map((a: any) => (
//                     <AppraisalCard
//                       key={a.id}
//                       appraisal={a}
//                       perspective="created"
//                       onView={() => {
//                         setDetailPerspective("created");
//                         setDetailAppraisal(a);
//                       }}
//                       onEdit={() => {
//                         setEditingAppraisal(a);
//                         setCreateOpen(true);
//                       }}
//                       onSubmit={() => handleSubmitAppraisal(a.id)}
//                     />
//                   ))
//                 )}
//               </View>
//             )}
//           </View>
//         )}

//         <View style={{ height: 24 }} />
//       </ScrollView>

//       {/* Appraisal detail modal */}
//       <AppraisalDetailModal
//         appraisal={detailAppraisal}
//         perspective={detailPerspective}
//         onClose={() => setDetailAppraisal(null)}
//         onEdit={
//           detailPerspective === "created" && detailAppraisal
//             ? () => {
//                 setEditingAppraisal(detailAppraisal);
//                 setDetailAppraisal(null);
//                 setCreateOpen(true);
//               }
//             : undefined
//         }
//         onSubmit={
//           detailPerspective === "created" && detailAppraisal
//             ? () => handleSubmitAppraisal(detailAppraisal.id)
//             : undefined
//         }
//         submitting={submittingId === detailAppraisal?.id}
//       />

//       {/* Manager: create / edit appraisal modal */}
//       {isManager && (
//         <CreateAppraisalModal
//           open={createOpen}
//           onClose={() => {
//             setCreateOpen(false);
//             setEditingAppraisal(null);
//           }}
//           onSaved={async () => {
//             setCreateOpen(false);
//             setEditingAppraisal(null);
//             Toast.show({
//               type: "success",
//               text1: editingAppraisal
//                 ? "Appraisal updated"
//                 : "Appraisal created",
//             });
//             await loadData();
//           }}
//           employees={employees}
//           templates={templates}
//           editing={editingAppraisal}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1, backgroundColor: C.bg },
//   center: { alignItems: "center", justifyContent: "center" },
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

//   // Hero
//   hero: { borderRadius: 20, padding: 18, backgroundColor: C.navy, gap: 16 },
//   heroLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
//   heroIconWrap: {
//     width: 42,
//     height: 42,
//     borderRadius: 14,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(255,255,255,0.15)",
//   },
//   heroTitle: { fontSize: 17, fontWeight: "700", color: "#fff" },
//   heroSubtitle: {
//     fontSize: 11.5,
//     color: "rgba(255,255,255,0.65)",
//     marginTop: 1,
//   },
//   heroBody: { flexDirection: "row", alignItems: "center", gap: 16 },
//   ringWrap: { alignItems: "center", gap: 4 },
//   ringLabel: {
//     fontSize: 10,
//     color: "rgba(255,255,255,0.6)",
//     fontWeight: "600",
//   },
//   heroStats: { flex: 1, gap: 8 },
//   heroStatTile: {
//     backgroundColor: "rgba(255,255,255,0.10)",
//     borderRadius: 12,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//   },
//   heroStatValue: { fontSize: 18, fontWeight: "800", color: "#fff" },
//   heroStatLabel: {
//     fontSize: 10,
//     color: "rgba(255,255,255,0.7)",
//     fontWeight: "600",
//   },
//   heroStatSub: { fontSize: 9.5, color: "rgba(255,255,255,0.5)", marginTop: 1 },

//   // Error
//   errorBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     padding: 12,
//     borderRadius: 14,
//     backgroundColor: C.dangerLight,
//   },
//   errorText: { flex: 1, fontSize: 12, color: C.danger, fontWeight: "600" },

//   // Tabs
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

//   // Section headers
//   sectionHeaderRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 10,
//   },
//   sectionTitle: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
//   sectionCount: {
//     fontSize: 11,
//     fontWeight: "700",
//     color: C.textMuted,
//     backgroundColor: C.surfaceAlt,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 999,
//   },

//   // Insights
//   insightCard: {
//     backgroundColor: C.surface,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: C.border,
//     padding: 13,
//     borderLeftWidth: 3,
//   },
//   insightType: {
//     fontSize: 10.5,
//     fontWeight: "700",
//     color: C.textSecondary,
//     marginBottom: 4,
//   },
//   insightText: { fontSize: 12.5, color: C.textPrimary, lineHeight: 18 },
//   insightMeta: { fontSize: 10.5, color: C.textMuted, marginTop: 4 },

//   // Manager summary card
//   managerSummaryCard: {
//     backgroundColor: C.surface,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: C.border,
//     padding: 14,
//     gap: 8,
//   },
//   managerSummaryHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 7,
//     marginBottom: 4,
//   },
//   managerSummaryTitle: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: C.textPrimary,
//   },
//   summaryRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   summaryLabel: { fontSize: 12, color: C.textSecondary },
//   summaryCount: { fontSize: 12, fontWeight: "700", color: C.textPrimary },

//   // New appraisal button
//   newAppraisalBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 10,
//     backgroundColor: C.primaryLight,
//   },
//   newAppraisalLabel: { fontSize: 11, fontWeight: "700", color: C.primary },

//   // Create first card
//   createFirstCard: {
//     alignItems: "center",
//     gap: 6,
//     padding: 24,
//     borderRadius: 16,
//     backgroundColor: C.surface,
//     borderWidth: 1.5,
//     borderStyle: "dashed",
//     borderColor: C.primary,
//   },
//   createFirstTitle: { fontSize: 14, fontWeight: "700", color: C.primary },
//   createFirstSub: { fontSize: 12, color: C.textMuted, textAlign: "center" },

//   // Empty state
//   emptyState: { alignItems: "center", gap: 6, paddingVertical: 32 },
//   emptyTitle: { fontSize: 13.5, fontWeight: "700", color: C.textSecondary },
//   emptySubtitle: {
//     fontSize: 12,
//     color: C.textMuted,
//     textAlign: "center",
//     paddingHorizontal: 24,
//   },
// });



// src/app/employee/performance.tsx
// Performance screen — role-aware.
// Employee: score ring, goals, received appraisals, insights.
// Manager: everything above + team appraisals (create / edit / submit to HR).
// Zero mock data — all from performanceApi, appraisalApi, employeeApi.

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
  BarChart2,
  Target,
  ClipboardList,
  Plus,
  AlertCircle,
  RefreshCw,
  Lightbulb,
  Users,
  TrendingUp,
  Send,
} from "lucide-react-native";
import Toast from "react-native-toast-message";

import C from "../../styles/colors";
import { useAuth } from "../../hooks/useAuth";
import ScoreRing from "../../components/performance/ScoreRing";
import GoalCard from "../../components/performance/GoalCard";
import AppraisalCard from "../../components/performance/AppraisalCard";
import AppraisalDetailModal from "../../components/performance/AppraisalDetailModal";
import CreateAppraisalModal from "../../components/performance/CreateAppraisalModal";
import BantaHRLetterLoader, {
  BantaHRLetterLoaderRef,
} from "../../components/BantaHRLetterLoader";

import {
  getMyGoals,
  getInsights,
  getEmployeeScores,
} from "../../api/service/performanceApi";

import {
  getMyAppraisals,
  listAppraisals,
  listTemplates,
  submitAppraisal,
} from "../../api/service/appraisal.api";

import { getEmployees } from "../../api/service/employeeApi";

type TabKey = "overview" | "goals" | "appraisals";

const TABS: { id: TabKey; label: string; Icon: typeof BarChart2 }[] = [
  { id: "overview", label: "Overview", Icon: BarChart2 },
  { id: "goals", label: "Goals", Icon: Target },
  { id: "appraisals", label: "Appraisals", Icon: ClipboardList },
];

export default function PerformanceScreen() {
  const insets = useSafeAreaInsets();
  const { employee } = useAuth();
  const isManager = employee?.isManager ?? false;
  const employeeId = employee?.id ?? "";
  const loaderRef = useRef<BantaHRLetterLoaderRef>(null);

  // ── Data ─────────────────────────────────────────────────────
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [myAppraisals, setMyAppraisals] = useState<any[]>([]);
  const [teamAppraisals, setTeamAppraisals] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ── UI ───────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [detailAppraisal, setDetailAppraisal] = useState<Record<
    string,
    any
  > | null>(null);
  const [detailPerspective, setDetailPerspective] = useState<
    "received" | "created"
  >("received");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingAppraisal, setEditingAppraisal] = useState<Record<
    string,
    any
  > | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // ── Load ─────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!employeeId) return;
    setError(null);
    try {
      const baseRequests = [
        getMyGoals(),
        getInsights(employeeId),
        getEmployeeScores(employeeId),
        getMyAppraisals(),
      ];
      const managerRequests = isManager
        ? [
            listAppraisals({ managerId: employeeId }),
            getEmployees(),
            listTemplates(),
          ]
        : [];

      const results = await Promise.all([...baseRequests, ...managerRequests]);

      const [goalsRes, insightsRes, scoresRes, myAppRes, ...managerRes] =
        results;

      // Goals
      const goalsArr = goalsRes?.data ?? goalsRes?.goals ?? goalsRes ?? [];
      setGoals(Array.isArray(goalsArr) ? goalsArr : []);

      // Insights
      const insightsArr =
        insightsRes?.data ?? insightsRes?.insights ?? insightsRes ?? [];
      setInsights(Array.isArray(insightsArr) ? insightsArr : []);

      // Latest score — take the most recent entry
      const scoresArr = scoresRes?.data ?? scoresRes?.scores ?? scoresRes ?? [];
      if (Array.isArray(scoresArr) && scoresArr.length > 0) {
        const sorted = [...scoresArr].sort(
          (a, b) =>
            new Date(b.createdAt ?? b.period ?? 0).getTime() -
            new Date(a.createdAt ?? a.period ?? 0).getTime(),
        );
        setLatestScore(sorted[0]?.score ?? sorted[0]?.totalScore ?? null);
      } else {
        setLatestScore(null);
      }

      // My received appraisals
      const myAppArr = myAppRes?.appraisals ?? myAppRes?.data ?? myAppRes ?? [];
      setMyAppraisals(Array.isArray(myAppArr) ? myAppArr : []);

      // Manager extras
      if (isManager && managerRes.length >= 3) {
        const [teamRes, empRes, tplRes] = managerRes;
        const teamArr = teamRes?.appraisals ?? teamRes?.data ?? teamRes ?? [];
        setTeamAppraisals(Array.isArray(teamArr) ? teamArr : []);
        const empArr = empRes?.data ?? empRes?.employees ?? empRes ?? [];
        setEmployees(Array.isArray(empArr) ? empArr : []);
        const tplArr = tplRes?.templates ?? tplRes?.data ?? tplRes ?? [];
        setTemplates(Array.isArray(tplArr) ? tplArr : []);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          (err?.isNetworkError || err?.isTimeout
            ? err.message
            : "Failed to load performance data."),
      );
    }
  }, [employeeId, isManager]);

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

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  // ── Submit appraisal (manager) ───────────────────────────────
  async function handleSubmitAppraisal(appraisalId: string) {
    setSubmittingId(appraisalId);
    try {
      await submitAppraisal(appraisalId);
      Toast.show({ type: "success", text1: "Appraisal submitted to HR" });
      setDetailAppraisal(null);
      await loadData();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err?.response?.data?.message ?? "Failed to submit appraisal.",
      });
    } finally {
      setSubmittingId(null);
    }
  }

  // ── Derived stats ────────────────────────────────────────────
  const completedGoals = useMemo(
    () =>
      goals.filter(
        (g) =>
          (g.progress ?? 0) >= 100 || g.status?.toLowerCase() === "completed",
      ).length,
    [goals],
  );
  const pendingAppraisals = useMemo(
    () =>
      [...myAppraisals, ...teamAppraisals].filter((a) =>
        ["draft", "submitted", "rejected"].includes(a.status),
      ).length,
    [myAppraisals, teamAppraisals],
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backBtn}
        >
          <ArrowLeft size={18} color={C.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Performance</Text>
        {isManager ? (
          <Pressable
            onPress={() => {
              setEditingAppraisal(null);
              setCreateOpen(true);
            }}
            hitSlop={8}
            style={styles.addBtn}
          >
            <Plus size={18} color="#fff" />
          </Pressable>
        ) : (
          <View style={{ width: 36 }} />
        )}
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
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroLeft}>
            <View style={styles.heroIconWrap}>
              <TrendingUp size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.heroTitle}>My Performance</Text>
              <Text style={styles.heroSubtitle}>
                {employee?.name ?? "Employee"}
                {isManager ? " · Manager" : ""}
              </Text>
            </View>
          </View>

          <View style={styles.heroBody}>
            {/* Score ring */}
            <View style={styles.ringWrap}>
              <ScoreRing score={latestScore} size={120} />
              <Text style={styles.ringLabel}>Latest Score</Text>
            </View>

            {/* Quick stats */}
            <View style={styles.heroStats}>
              {[
                {
                  label: "Goals",
                  value: goals.length,
                  sub: `${completedGoals} done`,
                },
                {
                  label: "Appraisals",
                  value: myAppraisals.length,
                  sub: `${pendingAppraisals} pending`,
                },
                ...(isManager
                  ? [
                      {
                        label: "Team",
                        value: teamAppraisals.length,
                        sub: "created",
                      },
                    ]
                  : []),
              ].map((s) => (
                <View key={s.label} style={styles.heroStatTile}>
                  <Text style={styles.heroStatValue}>{s.value}</Text>
                  <Text style={styles.heroStatLabel}>{s.label}</Text>
                  <Text style={styles.heroStatSub}>{s.sub}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Error banner */}
        {error ? (
          <View style={styles.errorBanner}>
            <AlertCircle size={15} color={C.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={loadData} hitSlop={8}>
              <RefreshCw size={14} color={C.danger} />
            </Pressable>
          </View>
        ) : null}

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

        {/* ══ OVERVIEW TAB ══ */}
        {activeTab === "overview" && (
          <View style={{ gap: 12 }}>
            {insights.length === 0 ? (
              <View style={styles.emptyState}>
                <Lightbulb size={24} color={C.textMuted} />
                <Text style={styles.emptyTitle}>No insights yet</Text>
                <Text style={styles.emptySubtitle}>
                  Insights appear once performance data has been calculated.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Performance Insights</Text>
                {insights.map((ins: any, i: number) => (
                  <View
                    key={ins.id ?? i}
                    style={[
                      styles.insightCard,
                      {
                        borderLeftColor:
                          ins.type === "strength"
                            ? C.success
                            : ins.type === "improvement"
                              ? C.warning
                              : ins.type === "risk"
                                ? C.danger
                                : C.primary,
                      },
                    ]}
                  >
                    <Text style={styles.insightType}>
                      {ins.type === "strength"
                        ? "💪 Strength"
                        : ins.type === "improvement"
                          ? "📈 Improve"
                          : ins.type === "risk"
                            ? "⚠️ Risk"
                            : "💡 Insight"}
                    </Text>
                    <Text style={styles.insightText}>
                      {ins.message ?? ins.text ?? ins.insight}
                    </Text>
                    {ins.metric && (
                      <Text style={styles.insightMeta}>{ins.metric}</Text>
                    )}
                  </View>
                ))}
              </>
            )}

            {/* Manager quick stats */}
            {isManager && teamAppraisals.length > 0 && (
              <View style={styles.managerSummaryCard}>
                <View style={styles.managerSummaryHeader}>
                  <Users size={15} color={C.primary} />
                  <Text style={styles.managerSummaryTitle}>
                    Team Appraisal Summary
                  </Text>
                </View>
                {(
                  [
                    "draft",
                    "submitted",
                    "hr_scored",
                    "completed",
                    "rejected",
                  ] as const
                ).map((s) => {
                  const count = teamAppraisals.filter(
                    (a) => a.status === s,
                  ).length;
                  if (count === 0) return null;
                  return (
                    <View key={s} style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>
                        {s === "draft"
                          ? "Draft"
                          : s === "submitted"
                            ? "Under Review"
                            : s === "hr_scored"
                              ? "HR Scored"
                              : s === "completed"
                                ? "Completed"
                                : "Returned"}
                      </Text>
                      <Text style={styles.summaryCount}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ══ GOALS TAB ══ */}
        {activeTab === "goals" && (
          <View>
            {goals.length === 0 ? (
              <View style={styles.emptyState}>
                <Target size={24} color={C.textMuted} />
                <Text style={styles.emptyTitle}>No goals assigned</Text>
                <Text style={styles.emptySubtitle}>
                  Goals assigned by your manager will appear here.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>My Goals</Text>
                  <Text style={styles.sectionCount}>{goals.length}</Text>
                </View>
                {goals.map((g: any) => (
                  <GoalCard key={g.id} goal={g} />
                ))}
              </>
            )}
          </View>
        )}

        {/* ══ APPRAISALS TAB ══ */}
        {activeTab === "appraisals" && (
          <View style={{ gap: 16 }}>
            {/* My received appraisals */}
            <View>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>My Appraisals</Text>
                <Text style={styles.sectionCount}>{myAppraisals.length}</Text>
              </View>

              {myAppraisals.length === 0 ? (
                <View style={styles.emptyState}>
                  <ClipboardList size={22} color={C.textMuted} />
                  <Text style={styles.emptyTitle}>No appraisals yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Appraisals from your manager will appear here once created.
                  </Text>
                </View>
              ) : (
                myAppraisals.map((a: any) => (
                  <AppraisalCard
                    key={a.id}
                    appraisal={a}
                    perspective="received"
                    onView={() => {
                      setDetailPerspective("received");
                      setDetailAppraisal(a);
                    }}
                  />
                ))
              )}
            </View>

            {/* Manager: Team appraisals */}
            {isManager && (
              <View>
                <View style={styles.sectionHeaderRow}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Users size={14} color={C.primary} />
                    <Text style={styles.sectionTitle}>Team Appraisals</Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Text style={styles.sectionCount}>
                      {teamAppraisals.length}
                    </Text>
                    <Pressable
                      onPress={() => {
                        setEditingAppraisal(null);
                        setCreateOpen(true);
                      }}
                      style={styles.newAppraisalBtn}
                    >
                      <Plus size={12} color={C.primary} />
                      <Text style={styles.newAppraisalLabel}>New</Text>
                    </Pressable>
                  </View>
                </View>

                {teamAppraisals.length === 0 ? (
                  <Pressable
                    onPress={() => {
                      setEditingAppraisal(null);
                      setCreateOpen(true);
                    }}
                    style={({ pressed }) => [
                      styles.createFirstCard,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Plus size={20} color={C.primary} />
                    <Text style={styles.createFirstTitle}>
                      Create your first appraisal
                    </Text>
                    <Text style={styles.createFirstSub}>
                      Tap to start an appraisal for a team member.
                    </Text>
                  </Pressable>
                ) : (
                  teamAppraisals.map((a: any) => (
                    <AppraisalCard
                      key={a.id}
                      appraisal={a}
                      perspective="created"
                      onView={() => {
                        setDetailPerspective("created");
                        setDetailAppraisal(a);
                      }}
                      onEdit={() => {
                        setEditingAppraisal(a);
                        setCreateOpen(true);
                      }}
                      onSubmit={() => handleSubmitAppraisal(a.id)}
                    />
                  ))
                )}
              </View>
            )}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Appraisal detail modal */}
      <AppraisalDetailModal
        appraisal={detailAppraisal}
        perspective={detailPerspective}
        onClose={() => setDetailAppraisal(null)}
        onEdit={
          detailPerspective === "created" && detailAppraisal
            ? () => {
                setEditingAppraisal(detailAppraisal);
                setDetailAppraisal(null);
                setCreateOpen(true);
              }
            : undefined
        }
        onSubmit={
          detailPerspective === "created" && detailAppraisal
            ? () => handleSubmitAppraisal(detailAppraisal.id)
            : undefined
        }
        submitting={submittingId === detailAppraisal?.id}
      />

      {/* Manager: create / edit appraisal modal */}
      {isManager && (
        <CreateAppraisalModal
          open={createOpen}
          onClose={() => {
            setCreateOpen(false);
            setEditingAppraisal(null);
          }}
          onSaved={async () => {
            setCreateOpen(false);
            setEditingAppraisal(null);
            Toast.show({
              type: "success",
              text1: editingAppraisal
                ? "Appraisal updated"
                : "Appraisal created",
            });
            await loadData();
          }}
          employees={employees}
          templates={templates}
          editing={editingAppraisal}
        />
      )}

      {/* Global loader — the only loader in this screen */}
      <BantaHRLetterLoader
        ref={loaderRef}
        overlay
        subtitle="Loading performance data..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  center: { alignItems: "center", justifyContent: "center" },
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

  // Hero
  hero: { borderRadius: 20, padding: 18, backgroundColor: C.navy, gap: 16 },
  heroLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  heroTitle: { fontSize: 17, fontWeight: "700", color: "#fff" },
  heroSubtitle: {
    fontSize: 11.5,
    color: "rgba(255,255,255,0.65)",
    marginTop: 1,
  },
  heroBody: { flexDirection: "row", alignItems: "center", gap: 16 },
  ringWrap: { alignItems: "center", gap: 4 },
  ringLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
  },
  heroStats: { flex: 1, gap: 8 },
  heroStatTile: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  heroStatValue: { fontSize: 18, fontWeight: "800", color: "#fff" },
  heroStatLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  heroStatSub: { fontSize: 9.5, color: "rgba(255,255,255,0.5)", marginTop: 1 },

  // Error
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.dangerLight,
  },
  errorText: { flex: 1, fontSize: 12, color: C.danger, fontWeight: "600" },

  // Tabs
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

  // Section headers
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  sectionCount: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    backgroundColor: C.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },

  // Insights
  insightCard: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 13,
    borderLeftWidth: 3,
  },
  insightType: {
    fontSize: 10.5,
    fontWeight: "700",
    color: C.textSecondary,
    marginBottom: 4,
  },
  insightText: { fontSize: 12.5, color: C.textPrimary, lineHeight: 18 },
  insightMeta: { fontSize: 10.5, color: C.textMuted, marginTop: 4 },

  // Manager summary card
  managerSummaryCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 8,
  },
  managerSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 4,
  },
  managerSummaryTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textPrimary,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: { fontSize: 12, color: C.textSecondary },
  summaryCount: { fontSize: 12, fontWeight: "700", color: C.textPrimary },

  // New appraisal button
  newAppraisalBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: C.primaryLight,
  },
  newAppraisalLabel: { fontSize: 11, fontWeight: "700", color: C.primary },

  // Create first card
  createFirstCard: {
    alignItems: "center",
    gap: 6,
    padding: 24,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: C.primary,
  },
  createFirstTitle: { fontSize: 14, fontWeight: "700", color: C.primary },
  createFirstSub: { fontSize: 12, color: C.textMuted, textAlign: "center" },

  // Empty state
  emptyState: { alignItems: "center", gap: 6, paddingVertical: 32 },
  emptyTitle: { fontSize: 13.5, fontWeight: "700", color: C.textSecondary },
  emptySubtitle: {
    fontSize: 12,
    color: C.textMuted,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});