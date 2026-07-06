

// // src/app/employee/timesheets.tsx
// // Employee Timesheets screen — connected directly to backend API.
// // Mirrors the web EmployeeTimesheetsPage pattern: useState + useEffect + timesheetApi.

// import { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   Pressable,
//   StyleSheet,
//   RefreshControl,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { router } from "expo-router";
// import {
//   ArrowLeft,
//   Plus,
//   Send,
//   Clock,
//   FileText,
//   Search,
//   RefreshCw,
// } from "lucide-react-native";
// import Toast from "react-native-toast-message";

// import C from "../../styles/colors";
// import Card from "../../components/ui/Card";
// import SectionHeader from "../../components/ui/SectionHeader";
// import EntryCard, {
//   TimesheetEntry,
// } from "../../components/timesheets/EntryCard";
// import EntryFormModal from "../../components/timesheets/EntryFormModal";
// import ConfirmSubmitModal from "../../components/timesheets/ConfirmSubmitModal";
// import WeekNavigator from "../../components/timesheets/WeekNavigator";
// import WeeklySummaryCards, {
//   WeeklySummary,
// } from "../../components/timesheets/WeeklySummaryCards";
// import { timesheetApi } from "../../api/service/timesheetApi";

// // ─── Date helpers (same as web) ─────────────────────────────────
// function toISO(date: Date): string {
//   const y = date.getFullYear();
//   const m = String(date.getMonth() + 1).padStart(2, "0");
//   const d = String(date.getDate()).padStart(2, "0");
//   return `${y}-${m}-${d}`;
// }

// function getMondayOf(date: Date): Date {
//   const d = new Date(date);
//   const day = d.getDay();
//   const diff = day === 0 ? -6 : 1 - day;
//   d.setDate(d.getDate() + diff);
//   d.setHours(0, 0, 0, 0);
//   return d;
// }

// function addDays(date: Date, n: number): Date {
//   const d = new Date(date);
//   d.setDate(d.getDate() + n);
//   return d;
// }

// function fmtWeekLabel(monday: Date): string {
//   const sunday = addDays(monday, 6);
//   const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
//   return `${monday.toLocaleDateString("en-GB", opts)} – ${sunday.toLocaleDateString("en-GB", opts)}`;
// }

// function isToday(date: Date): boolean {
//   return toISO(date) === toISO(new Date());
// }

// // ─── Main Screen ──────────────────────────────────────────────
// export default function TimesheetsScreen() {
//   const insets = useSafeAreaInsets();

//   // ── Week navigation ─────────────────────────────────────────
//   const [weekStart, setWeekStart] = useState(() => getMondayOf(new Date()));
//   const [activeDay, setActiveDay] = useState(() => {
//     const today = new Date();
//     const monday = getMondayOf(today);
//     const diff = Math.round((today.getTime() - monday.getTime()) / 86400000);
//     return diff >= 0 && diff <= 6 ? diff : 0;
//   });

//   const weekDates = useMemo(
//     () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
//     [weekStart],
//   );

//   const startDate = toISO(weekStart);
//   const endDate = toISO(addDays(weekStart, 6));

//   // ── Data state (same pattern as web) ──────────────────────
//   const [entries, setEntries] = useState<any[]>([]);
//   const [summary, setSummary] = useState<WeeklySummary | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [sumLoading, setSumLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   // ── UI state ────────────────────────────────────────────────
//   const [selected, setSelected] = useState<Set<string>>(new Set());
//   const [searchQuery, setSearchQuery] = useState("");

//   const [formOpen, setFormOpen] = useState(false);
//   const [editEntry, setEditEntry] = useState<TimesheetEntry | null>(null);
//   const [formLoading, setFormLoading] = useState<"draft" | "submit" | false>(
//     false,
//   );

//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [submitLoading, setSubmitLoading] = useState(false);
//   const [submitMode, setSubmitMode] = useState<"week" | "selected">("selected");

//   // ── Data fetch (same pattern as web) ───────────────────────
//   const fetchEntries = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await timesheetApi.getMyEntries({ startDate, endDate });
//       setEntries(res.entries ?? []);
//     } catch (err: any) {
//       Toast.show({ type: "error", text1: "Failed to load entries." });
//     } finally {
//       setLoading(false);
//     }
//   }, [startDate, endDate]);

//   const fetchSummary = useCallback(async () => {
//     setSumLoading(true);
//     try {
//       const res = await timesheetApi.getMySummary({ startDate, endDate });
//       setSummary(res);
//     } catch {
//       // non-fatal
//     } finally {
//       setSumLoading(false);
//     }
//   }, [startDate, endDate]);

//   useEffect(() => {
//     fetchEntries();
//     fetchSummary();
//     setSelected(new Set());
//   }, [fetchEntries, fetchSummary]);

//   // ── Entries grouped by day (same as web) ───────────────────
//   const dayEntries = useMemo(() => {
//     const map: Record<string, any[]> = {};
//     weekDates.forEach((d) => {
//       map[toISO(d)] = [];
//     });

//     entries.forEach((e) => {
//       const key =
//         typeof e.entryDate === "string"
//           ? e.entryDate.slice(0, 10)
//           : toISO(new Date(e.entryDate));
//       if (map[key]) map[key].push(e);
//     });

//     return map;
//   }, [entries, weekDates]);

//   const activeDateStr = toISO(weekDates[activeDay]);
//   const activeDayList = dayEntries[activeDateStr] ?? [];
//   const draftIds = entries
//     .filter((e) => e.status === "Draft")
//     .map((e) => String(e.id));
//   const selectedDrafts = [...selected].filter((id) => draftIds.includes(id));

//   const filteredActiveDayList = useMemo(() => {
//     if (!searchQuery.trim()) return activeDayList;
//     const q = searchQuery.toLowerCase();
//     return activeDayList.filter(
//       (e) =>
//         e.description?.toLowerCase().includes(q) ||
//         e.projectTag?.toLowerCase().includes(q),
//     );
//   }, [activeDayList, searchQuery]);

//   // ── Handlers (same as web) ─────────────────────────────────
//   function toggleSelect(id: string) {
//     setSelected((prev) => {
//       const next = new Set(prev);
//       next.has(id) ? next.delete(id) : next.add(id);
//       return next;
//     });
//   }

//   async function handleSave(
//     form: {
//       entryDate: string;
//       startTime: string;
//       endTime: string;
//       description: string;
//       projectTag: string;
//     },
//     mode: "draft" | "submit",
//   ) {
//     setFormLoading(mode);
//     try {
//       const payload = {
//         entryDate: form.entryDate,
//         startTime: form.startTime,
//         endTime: form.endTime,
//         description: form.description,
//         projectTag: form.projectTag || undefined,
//       };

//       if (editEntry) {
//         await timesheetApi.updateEntry(editEntry.id, payload);
//         Toast.show({ type: "success", text1: "Entry updated." });

//         if (mode === "submit") {
//           await timesheetApi.submitEntries({ entryIds: [editEntry.id] });
//           Toast.show({
//             type: "success",
//             text1: "Entry submitted for approval.",
//           });
//         }
//       } else {
//         const createRes = await timesheetApi.createEntry(payload);
//         Toast.show({ type: "success", text1: "Entry saved." });

//         if (mode === "submit") {
//           const newId = createRes.entry?.id ?? createRes.id;
//           if (newId) {
//             await timesheetApi.submitEntries({ entryIds: [String(newId)] });
//             Toast.show({
//               type: "success",
//               text1: "Entry submitted for approval.",
//             });
//           }
//         }
//       }

//       setFormOpen(false);
//       setEditEntry(null);
//       fetchEntries();
//       fetchSummary();
//     } catch (err: any) {
//       Toast.show({
//         type: "error",
//         text1: err?.response?.data?.message ?? "Failed to save entry.",
//       });
//     } finally {
//       setFormLoading(false);
//     }
//   }

//   async function handleDelete(id: string) {
//     try {
//       await timesheetApi.deleteEntry(id);
//       Toast.show({ type: "success", text1: "Entry deleted." });
//       fetchEntries();
//       fetchSummary();
//     } catch (err: any) {
//       Toast.show({
//         type: "error",
//         text1: err?.response?.data?.message ?? "Failed to delete entry.",
//       });
//     }
//   }

//   async function handleSubmitSingle(id: string) {
//     try {
//       await timesheetApi.submitEntries({ entryIds: [id] });
//       Toast.show({ type: "success", text1: "Entry submitted for approval." });
//       fetchEntries();
//       fetchSummary();
//     } catch (err: any) {
//       Toast.show({
//         type: "error",
//         text1: err?.response?.data?.message ?? "Submit failed.",
//       });
//     }
//   }

//   function openSubmit(mode: "week" | "selected") {
//     setSubmitMode(mode);
//     setConfirmOpen(true);
//   }

//   async function handleConfirmSubmit() {
//     setSubmitLoading(true);
//     try {
//       const ids = submitMode === "week" ? draftIds : selectedDrafts;
//       if (ids.length === 0) {
//         Toast.show({ type: "error", text1: "No draft entries to submit." });
//         return;
//       }
//       await timesheetApi.submitEntries({ entryIds: ids });
//       Toast.show({
//         type: "success",
//         text1: `${ids.length} ${ids.length === 1 ? "entry" : "entries"} submitted for approval.`,
//       });
//       setSelected(new Set());
//       setConfirmOpen(false);
//       fetchEntries();
//       fetchSummary();
//     } catch (err: any) {
//       Toast.show({
//         type: "error",
//         text1: err?.response?.data?.message ?? "Failed to submit entries.",
//       });
//     } finally {
//       setSubmitLoading(false);
//     }
//   }

//   async function handleRefresh() {
//     setRefreshing(true);
//     setSelected(new Set());
//     await fetchEntries();
//     await fetchSummary();
//     setRefreshing(false);
//   }

//   const submitCount =
//     submitMode === "week" ? draftIds.length : selectedDrafts.length;

//   const isCurrentWeek = toISO(weekStart) === toISO(getMondayOf(new Date()));
//   const weekLabel = fmtWeekLabel(weekStart);
//   const todayIndex = weekDates.findIndex((d) => isToday(d));
//   const countsByDay = weekDates.map((d) => (dayEntries[toISO(d)] ?? []).length);

//   // ─── RENDER ─────────────────────────────────────────────────
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
//         <Text style={styles.headerTitle}>My Timesheets</Text>
//         <Pressable
//           onPress={() => {
//             setEditEntry(null);
//             setFormOpen(true);
//           }}
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
//         {/* ── Hero banner ── */}
//         <View style={styles.hero}>
//           <View style={styles.heroIconWrap}>
//             <Clock size={20} color="#fff" />
//           </View>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.heroTitle}>Track your work hours</Text>
//             <Text style={styles.heroSubtitle}>
//               Log entries daily and submit for approval at the end of the week.
//             </Text>
//           </View>
//         </View>

//         {/* ── Search bar ── */}
//         <View style={styles.searchWrap}>
//           <Search size={14} color={C.textMuted} style={{ marginLeft: 12 }} />
//           <Text
//             style={styles.searchInput}
//             // Use TextInput in real implementation:
//             // <TextInput
//             //   value={searchQuery}
//             //   onChangeText={setSearchQuery}
//             //   placeholder="Search entries…"
//             //   placeholderTextColor={C.textMuted}
//             //   style={styles.searchInput}
//             // />
//           >
//             {searchQuery || "Search entries…"}
//           </Text>
//         </View>

//         {/* ── Weekly summary ── */}
//         <WeeklySummaryCards summary={sumLoading ? null : summary} />

//         {/* ── Week navigator ── */}
//         <WeekNavigator
//           weekLabel={weekLabel}
//           isCurrentWeek={isCurrentWeek}
//           weekDates={weekDates}
//           activeDay={activeDay}
//           onChangeDay={setActiveDay}
//           onPrevWeek={() => setWeekStart((d) => addDays(d, -7))}
//           onNextWeek={() => setWeekStart((d) => addDays(d, 7))}
//           countsByDay={countsByDay}
//           todayIndex={todayIndex}
//         />

//         {/* ── Bulk action bar ── */}
//         {selectedDrafts.length > 0 && (
//           <View style={styles.bulkBar}>
//             <Text style={styles.bulkText}>
//               {selectedDrafts.length} draft
//               {selectedDrafts.length !== 1 ? "s" : ""} selected
//             </Text>
//             <View style={styles.bulkActions}>
//               <Pressable
//                 onPress={() => setSelected(new Set())}
//                 style={({ pressed }) => [
//                   styles.clearBtn,
//                   pressed && { opacity: 0.7 },
//                 ]}
//               >
//                 <Text style={styles.clearLabel}>Clear</Text>
//               </Pressable>
//               <Pressable
//                 onPress={() => openSubmit("selected")}
//                 disabled={submitLoading}
//                 style={({ pressed }) => [
//                   styles.bulkSubmitBtn,
//                   pressed && { opacity: 0.85 },
//                   submitLoading && { opacity: 0.6 },
//                 ]}
//               >
//                 <Send size={12} color="#fff" />
//                 <Text style={styles.bulkSubmitLabel}>Submit Selected</Text>
//               </Pressable>
//             </View>
//           </View>
//         )}

//         {/* ── Day entries ── */}
//         <Card padded style={styles.entriesCard}>
//           <View style={styles.entriesHeaderRow}>
//             <View style={{ flex: 1 }}>
//               <SectionHeader
//                 title={weekDates[activeDay].toLocaleDateString("en-GB", {
//                   weekday: "long",
//                   day: "numeric",
//                   month: "long",
//                 })}
//                 showChevron={false}
//               />
//               {activeDayList.length > 0 && (
//                 <Text style={styles.entriesSubtext}>
//                   {activeDayList.length}{" "}
//                   {activeDayList.length === 1 ? "entry" : "entries"} ·{" "}
//                   {activeDayList.reduce(
//                     (s, e) => s + (e.durationMinutes ?? 0),
//                     0,
//                   )}{" "}
//                   mins total
//                 </Text>
//               )}
//             </View>
//           </View>

//           <View style={styles.entriesActionsRow}>
//             {draftIds.length > 0 && (
//               <Pressable
//                 onPress={() => openSubmit("week")}
//                 disabled={submitLoading}
//                 style={({ pressed }) => [
//                   styles.weekSubmitBtn,
//                   pressed && { opacity: 0.85 },
//                   submitLoading && { opacity: 0.6 },
//                 ]}
//               >
//                 <Send size={12} color={C.primary} />
//                 <Text style={styles.weekSubmitLabel}>
//                   Submit Week ({draftIds.length})
//                 </Text>
//               </Pressable>
//             )}
//             <Pressable
//               onPress={() => {
//                 setEditEntry(null);
//                 setFormOpen(true);
//               }}
//               style={({ pressed }) => [
//                 styles.addEntryBtn,
//                 pressed && { opacity: 0.85 },
//               ]}
//             >
//               <Plus size={12} color="#fff" />
//               <Text style={styles.addEntryLabel}>Add Entry</Text>
//             </Pressable>
//           </View>

//           {loading ? (
//             <View style={{ gap: 10, paddingVertical: 10 }}>
//               {[1, 2, 3].map((i) => (
//                 <View key={i} style={styles.skeleton} />
//               ))}
//             </View>
//           ) : filteredActiveDayList.length === 0 ? (
//             <View style={styles.emptyState}>
//               <View style={styles.emptyIconWrap}>
//                 <FileText size={22} color={C.textMuted} />
//               </View>
//               <Text style={styles.emptyTitle}>
//                 {searchQuery
//                   ? "No entries match your search"
//                   : "No entries logged for this day yet"}
//               </Text>
//               {!searchQuery && (
//                 <>
//                   <Text style={styles.emptySubtitle}>
//                     What did you work on? Add your first entry below.
//                   </Text>
//                   <Pressable
//                     onPress={() => {
//                       setEditEntry(null);
//                       setFormOpen(true);
//                     }}
//                     style={({ pressed }) => [
//                       styles.emptyAddBtn,
//                       pressed && { opacity: 0.85 },
//                     ]}
//                   >
//                     <Plus size={15} color="#fff" />
//                     <Text style={styles.emptyAddLabel}>Add Entry</Text>
//                   </Pressable>
//                 </>
//               )}
//             </View>
//           ) : (
//             <View style={styles.entryList}>
//               {filteredActiveDayList.map((e) => (
//                 <EntryCard
//                   key={e.id}
//                   entry={{
//                     id: String(e.id),
//                     entryDate: e.entryDate,
//                     startTime: e.startTime,
//                     endTime: e.endTime,
//                     description: e.description,
//                     projectTag: e.projectTag,
//                     status: e.status,
//                     durationMinutes: e.durationMinutes ?? 0,
//                   }}
//                   selected={selected.has(String(e.id))}
//                   onSelect={toggleSelect}
//                   onEdit={(entry) => {
//                     setEditEntry(entry);
//                     setFormOpen(true);
//                   }}
//                   onDelete={handleDelete}
//                   onSubmit={handleSubmitSingle}
//                 />
//               ))}
//             </View>
//           )}
//         </Card>

//         <View style={{ height: 24 }} />
//       </ScrollView>

//       {/* ── Modals ── */}
//       <EntryFormModal
//         open={formOpen}
//         entry={editEntry}
//         defaultDate={activeDateStr}
//         onSave={handleSave}
//         onClose={() => {
//           setFormOpen(false);
//           setEditEntry(null);
//         }}
//         loading={formLoading}
//       />

//       <ConfirmSubmitModal
//         open={confirmOpen}
//         count={submitCount}
//         onConfirm={handleConfirmSubmit}
//         onClose={() => setConfirmOpen(false)}
//         loading={submitLoading}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1, backgroundColor: C.bg },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     gap: 12,
//     backgroundColor: C.bg,
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
//   hero: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     borderRadius: 20,
//     padding: 16,
//     backgroundColor: C.navy,
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
//     fontSize: 15.5,
//     fontWeight: "700",
//     color: "#fff",
//     marginBottom: 2,
//   },
//   heroSubtitle: {
//     fontSize: 12.5,
//     color: "rgba(224,225,255,0.85)",
//     lineHeight: 17,
//   },
//   searchWrap: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     borderRadius: 14,
//     backgroundColor: C.surface,
//     borderWidth: 1.5,
//     borderColor: C.border,
//     height: 44,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 14,
//     color: C.textPrimary,
//     paddingRight: 12,
//   },
//   bulkBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     gap: 10,
//     borderRadius: 14,
//     paddingVertical: 10,
//     paddingHorizontal: 14,
//     backgroundColor: C.primaryLight,
//     borderWidth: 1.5,
//     borderColor: `${C.primary}44`,
//   },
//   bulkText: { fontSize: 12.5, fontWeight: "700", color: C.primary },
//   bulkActions: { flexDirection: "row", alignItems: "center", gap: 8 },
//   clearBtn: {
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     borderRadius: 10,
//     backgroundColor: "#fff",
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   clearLabel: { fontSize: 11.5, fontWeight: "700", color: C.textSecondary },
//   bulkSubmitBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     paddingVertical: 7,
//     paddingHorizontal: 12,
//     borderRadius: 10,
//     backgroundColor: C.primary,
//   },
//   bulkSubmitLabel: { fontSize: 11.5, fontWeight: "700", color: "#fff" },
//   entriesCard: { gap: 12 },
//   entriesHeaderRow: { flexDirection: "row" },
//   entriesSubtext: { fontSize: 11.5, color: C.textMuted, marginTop: -8 },
//   entriesActionsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
//   weekSubmitBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 12,
//     backgroundColor: C.primaryLight,
//     borderWidth: 1,
//     borderColor: `${C.primary}33`,
//   },
//   weekSubmitLabel: { fontSize: 11.5, fontWeight: "700", color: C.primary },
//   addEntryBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 12,
//     backgroundColor: C.primary,
//   },
//   addEntryLabel: { fontSize: 11.5, fontWeight: "700", color: "#fff" },
//   entryList: { gap: 10 },
//   skeleton: {
//     height: 90,
//     borderRadius: 16,
//     backgroundColor: C.border,
//   },
//   emptyState: { alignItems: "center", gap: 8, paddingVertical: 30 },
//   emptyIconWrap: {
//     width: 52,
//     height: 52,
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#F3F4F6",
//   },
//   emptyTitle: {
//     fontSize: 13.5,
//     fontWeight: "700",
//     color: C.textSecondary,
//     textAlign: "center",
//   },
//   emptySubtitle: { fontSize: 12, color: C.textMuted, textAlign: "center" },
//   emptyAddBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 7,
//     marginTop: 6,
//     paddingVertical: 10,
//     paddingHorizontal: 18,
//     borderRadius: 14,
//     backgroundColor: C.primary,
//   },
//   emptyAddLabel: { fontSize: 13.5, fontWeight: "700", color: "#fff" },
// });


// src/app/employee/timesheets.tsx
// Employee Timesheets screen — connected directly to backend API.
// Mirrors the web EmployeeTimesheetsPage pattern: useState + useEffect + timesheetApi.

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  Send,
  Clock,
  FileText,
  Search,
  RefreshCw,
} from "lucide-react-native";
import Toast from "react-native-toast-message";

import C from "../../styles/colors";
import Card from "../../components/ui/Card";
import SectionHeader from "../../components/ui/SectionHeader";
import EntryCard, {
  TimesheetEntry,
} from "../../components/timesheets/EntryCard";
import EntryFormModal from "../../components/timesheets/EntryFormModal";
import ConfirmSubmitModal from "../../components/timesheets/ConfirmSubmitModal";
import WeekNavigator from "../../components/timesheets/WeekNavigator";
import WeeklySummaryCards, {
  WeeklySummary,
} from "../../components/timesheets/WeeklySummaryCards";
import BantaHRLetterLoader, {
  BantaHRLetterLoaderRef,
} from "../../components/BantaHRLetterLoader";
import { timesheetApi } from "../../api/service/timesheetApi";

// ─── Date helpers (same as web) ─────────────────────────────────
function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function fmtWeekLabel(monday: Date): string {
  const sunday = addDays(monday, 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${monday.toLocaleDateString("en-GB", opts)} – ${sunday.toLocaleDateString("en-GB", opts)}`;
}

function isToday(date: Date): boolean {
  return toISO(date) === toISO(new Date());
}

// ─── Main Screen ──────────────────────────────────────────────
export default function TimesheetsScreen() {
  const insets = useSafeAreaInsets();
  const loaderRef = useRef<BantaHRLetterLoaderRef>(null);

  // ── Week navigation ─────────────────────────────────────────
  const [weekStart, setWeekStart] = useState(() => getMondayOf(new Date()));
  const [activeDay, setActiveDay] = useState(() => {
    const today = new Date();
    const monday = getMondayOf(today);
    const diff = Math.round((today.getTime() - monday.getTime()) / 86400000);
    return diff >= 0 && diff <= 6 ? diff : 0;
  });

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const startDate = toISO(weekStart);
  const endDate = toISO(addDays(weekStart, 6));

  // ── Data state (same pattern as web) ──────────────────────
  const [entries, setEntries] = useState<any[]>([]);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ── UI state ────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<TimesheetEntry | null>(null);
  const [formLoading, setFormLoading] = useState<"draft" | "submit" | false>(
    false,
  );

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMode, setSubmitMode] = useState<"week" | "selected">("selected");

  // ── Data fetch (same pattern as web) ───────────────────────
  const fetchEntries = useCallback(async () => {
    try {
      const res = await timesheetApi.getMyEntries({ startDate, endDate });
      setEntries(res.entries ?? []);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Failed to load entries." });
    }
  }, [startDate, endDate]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await timesheetApi.getMySummary({ startDate, endDate });
      setSummary(res);
    } catch {
      // non-fatal
    }
  }, [startDate, endDate]);

  useEffect(() => {
    (async () => {
      loaderRef.current?.show();
      try {
        await Promise.all([fetchEntries(), fetchSummary()]);
      } finally {
        loaderRef.current?.hide();
      }
    })();
    setSelected(new Set());
  }, [fetchEntries, fetchSummary]);

  // ── Entries grouped by day (same as web) ───────────────────
  const dayEntries = useMemo(() => {
    const map: Record<string, any[]> = {};
    weekDates.forEach((d) => {
      map[toISO(d)] = [];
    });

    entries.forEach((e) => {
      const key =
        typeof e.entryDate === "string"
          ? e.entryDate.slice(0, 10)
          : toISO(new Date(e.entryDate));
      if (map[key]) map[key].push(e);
    });

    return map;
  }, [entries, weekDates]);

  const activeDateStr = toISO(weekDates[activeDay]);
  const activeDayList = dayEntries[activeDateStr] ?? [];
  const draftIds = entries
    .filter((e) => e.status === "Draft")
    .map((e) => String(e.id));
  const selectedDrafts = [...selected].filter((id) => draftIds.includes(id));

  const filteredActiveDayList = useMemo(() => {
    if (!searchQuery.trim()) return activeDayList;
    const q = searchQuery.toLowerCase();
    return activeDayList.filter(
      (e) =>
        e.description?.toLowerCase().includes(q) ||
        e.projectTag?.toLowerCase().includes(q),
    );
  }, [activeDayList, searchQuery]);

  // ── Handlers (same as web) ─────────────────────────────────
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSave(
    form: {
      entryDate: string;
      startTime: string;
      endTime: string;
      description: string;
      projectTag: string;
    },
    mode: "draft" | "submit",
  ) {
    setFormLoading(mode);
    try {
      const payload = {
        entryDate: form.entryDate,
        startTime: form.startTime,
        endTime: form.endTime,
        description: form.description,
        projectTag: form.projectTag || undefined,
      };

      if (editEntry) {
        await timesheetApi.updateEntry(editEntry.id, payload);
        Toast.show({ type: "success", text1: "Entry updated." });

        if (mode === "submit") {
          await timesheetApi.submitEntries({ entryIds: [editEntry.id] });
          Toast.show({
            type: "success",
            text1: "Entry submitted for approval.",
          });
        }
      } else {
        const createRes = await timesheetApi.createEntry(payload);
        Toast.show({ type: "success", text1: "Entry saved." });

        if (mode === "submit") {
          const newId = createRes.entry?.id ?? createRes.id;
          if (newId) {
            await timesheetApi.submitEntries({ entryIds: [String(newId)] });
            Toast.show({
              type: "success",
              text1: "Entry submitted for approval.",
            });
          }
        }
      }

      setFormOpen(false);
      setEditEntry(null);
      fetchEntries();
      fetchSummary();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err?.response?.data?.message ?? "Failed to save entry.",
      });
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await timesheetApi.deleteEntry(id);
      Toast.show({ type: "success", text1: "Entry deleted." });
      fetchEntries();
      fetchSummary();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err?.response?.data?.message ?? "Failed to delete entry.",
      });
    }
  }

  async function handleSubmitSingle(id: string) {
    try {
      await timesheetApi.submitEntries({ entryIds: [id] });
      Toast.show({ type: "success", text1: "Entry submitted for approval." });
      fetchEntries();
      fetchSummary();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err?.response?.data?.message ?? "Submit failed.",
      });
    }
  }

  function openSubmit(mode: "week" | "selected") {
    setSubmitMode(mode);
    setConfirmOpen(true);
  }

  async function handleConfirmSubmit() {
    setSubmitLoading(true);
    try {
      const ids = submitMode === "week" ? draftIds : selectedDrafts;
      if (ids.length === 0) {
        Toast.show({ type: "error", text1: "No draft entries to submit." });
        return;
      }
      await timesheetApi.submitEntries({ entryIds: ids });
      Toast.show({
        type: "success",
        text1: `${ids.length} ${ids.length === 1 ? "entry" : "entries"} submitted for approval.`,
      });
      setSelected(new Set());
      setConfirmOpen(false);
      fetchEntries();
      fetchSummary();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err?.response?.data?.message ?? "Failed to submit entries.",
      });
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    setSelected(new Set());
    await Promise.all([fetchEntries(), fetchSummary()]);
    setRefreshing(false);
  }

  const submitCount =
    submitMode === "week" ? draftIds.length : selectedDrafts.length;

  const isCurrentWeek = toISO(weekStart) === toISO(getMondayOf(new Date()));
  const weekLabel = fmtWeekLabel(weekStart);
  const todayIndex = weekDates.findIndex((d) => isToday(d));
  const countsByDay = weekDates.map((d) => (dayEntries[toISO(d)] ?? []).length);

  // ─── RENDER ─────────────────────────────────────────────────
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
        <Text style={styles.headerTitle}>My Timesheets</Text>
        <Pressable
          onPress={() => {
            setEditEntry(null);
            setFormOpen(true);
          }}
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
        {/* ── Hero banner ── */}
        <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <Clock size={20} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Track your work hours</Text>
            <Text style={styles.heroSubtitle}>
              Log entries daily and submit for approval at the end of the week.
            </Text>
          </View>
        </View>

        {/* ── Search bar ── */}
        <View style={styles.searchWrap}>
          <Search size={14} color={C.textMuted} style={{ marginLeft: 12 }} />
          <Text
            style={styles.searchInput}
            // Use TextInput in real implementation:
            // <TextInput
            //   value={searchQuery}
            //   onChangeText={setSearchQuery}
            //   placeholder="Search entries…"
            //   placeholderTextColor={C.textMuted}
            //   style={styles.searchInput}
            // />
          >
            {searchQuery || "Search entries…"}
          </Text>
        </View>

        {/* ── Weekly summary ── */}
        <WeeklySummaryCards summary={summary} />

        {/* ── Week navigator ── */}
        <WeekNavigator
          weekLabel={weekLabel}
          isCurrentWeek={isCurrentWeek}
          weekDates={weekDates}
          activeDay={activeDay}
          onChangeDay={setActiveDay}
          onPrevWeek={() => setWeekStart((d) => addDays(d, -7))}
          onNextWeek={() => setWeekStart((d) => addDays(d, 7))}
          countsByDay={countsByDay}
          todayIndex={todayIndex}
        />

        {/* ── Bulk action bar ── */}
        {selectedDrafts.length > 0 && (
          <View style={styles.bulkBar}>
            <Text style={styles.bulkText}>
              {selectedDrafts.length} draft
              {selectedDrafts.length !== 1 ? "s" : ""} selected
            </Text>
            <View style={styles.bulkActions}>
              <Pressable
                onPress={() => setSelected(new Set())}
                style={({ pressed }) => [
                  styles.clearBtn,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.clearLabel}>Clear</Text>
              </Pressable>
              <Pressable
                onPress={() => openSubmit("selected")}
                disabled={submitLoading}
                style={({ pressed }) => [
                  styles.bulkSubmitBtn,
                  pressed && { opacity: 0.85 },
                  submitLoading && { opacity: 0.6 },
                ]}
              >
                <Send size={12} color="#fff" />
                <Text style={styles.bulkSubmitLabel}>Submit Selected</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── Day entries ── */}
        <Card padded style={styles.entriesCard}>
          <View style={styles.entriesHeaderRow}>
            <View style={{ flex: 1 }}>
              <SectionHeader
                title={weekDates[activeDay].toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
                showChevron={false}
              />
              {activeDayList.length > 0 && (
                <Text style={styles.entriesSubtext}>
                  {activeDayList.length}{" "}
                  {activeDayList.length === 1 ? "entry" : "entries"} ·{" "}
                  {activeDayList.reduce(
                    (s, e) => s + (e.durationMinutes ?? 0),
                    0,
                  )}{" "}
                  mins total
                </Text>
              )}
            </View>
          </View>

          <View style={styles.entriesActionsRow}>
            {draftIds.length > 0 && (
              <Pressable
                onPress={() => openSubmit("week")}
                disabled={submitLoading}
                style={({ pressed }) => [
                  styles.weekSubmitBtn,
                  pressed && { opacity: 0.85 },
                  submitLoading && { opacity: 0.6 },
                ]}
              >
                <Send size={12} color={C.primary} />
                <Text style={styles.weekSubmitLabel}>
                  Submit Week ({draftIds.length})
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => {
                setEditEntry(null);
                setFormOpen(true);
              }}
              style={({ pressed }) => [
                styles.addEntryBtn,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Plus size={12} color="#fff" />
              <Text style={styles.addEntryLabel}>Add Entry</Text>
            </Pressable>
          </View>

          {filteredActiveDayList.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <FileText size={22} color={C.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>
                {searchQuery
                  ? "No entries match your search"
                  : "No entries logged for this day yet"}
              </Text>
              {!searchQuery && (
                <>
                  <Text style={styles.emptySubtitle}>
                    What did you work on? Add your first entry below.
                  </Text>
                  <Pressable
                    onPress={() => {
                      setEditEntry(null);
                      setFormOpen(true);
                    }}
                    style={({ pressed }) => [
                      styles.emptyAddBtn,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Plus size={15} color="#fff" />
                    <Text style={styles.emptyAddLabel}>Add Entry</Text>
                  </Pressable>
                </>
              )}
            </View>
          ) : (
            <View style={styles.entryList}>
              {filteredActiveDayList.map((e) => (
                <EntryCard
                  key={e.id}
                  entry={{
                    id: String(e.id),
                    entryDate: e.entryDate,
                    startTime: e.startTime,
                    endTime: e.endTime,
                    description: e.description,
                    projectTag: e.projectTag,
                    status: e.status,
                    durationMinutes: e.durationMinutes ?? 0,
                  }}
                  selected={selected.has(String(e.id))}
                  onSelect={toggleSelect}
                  onEdit={(entry) => {
                    setEditEntry(entry);
                    setFormOpen(true);
                  }}
                  onDelete={handleDelete}
                  onSubmit={handleSubmitSingle}
                />
              ))}
            </View>
          )}
        </Card>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── Modals ── */}
      <EntryFormModal
        open={formOpen}
        entry={editEntry}
        defaultDate={activeDateStr}
        onSave={handleSave}
        onClose={() => {
          setFormOpen(false);
          setEditEntry(null);
        }}
        loading={formLoading}
      />

      <ConfirmSubmitModal
        open={confirmOpen}
        count={submitCount}
        onConfirm={handleConfirmSubmit}
        onClose={() => setConfirmOpen(false)}
        loading={submitLoading}
      />

      {/* Global loader — the only loader in this screen */}
      <BantaHRLetterLoader
        ref={loaderRef}
        overlay
        subtitle="Loading timesheets..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: C.bg,
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
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 20,
    padding: 16,
    backgroundColor: C.navy,
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
    fontSize: 15.5,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: "rgba(224,225,255,0.85)",
    lineHeight: 17,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.textPrimary,
    paddingRight: 12,
  },
  bulkBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: C.primaryLight,
    borderWidth: 1.5,
    borderColor: `${C.primary}44`,
  },
  bulkText: { fontSize: 12.5, fontWeight: "700", color: C.primary },
  bulkActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  clearBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: C.border,
  },
  clearLabel: { fontSize: 11.5, fontWeight: "700", color: C.textSecondary },
  bulkSubmitBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: C.primary,
  },
  bulkSubmitLabel: { fontSize: 11.5, fontWeight: "700", color: "#fff" },
  entriesCard: { gap: 12 },
  entriesHeaderRow: { flexDirection: "row" },
  entriesSubtext: { fontSize: 11.5, color: C.textMuted, marginTop: -8 },
  entriesActionsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  weekSubmitBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: `${C.primary}33`,
  },
  weekSubmitLabel: { fontSize: 11.5, fontWeight: "700", color: C.primary },
  addEntryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: C.primary,
  },
  addEntryLabel: { fontSize: 11.5, fontWeight: "700", color: "#fff" },
  entryList: { gap: 10 },
  emptyState: { alignItems: "center", gap: 8, paddingVertical: 30 },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  emptyTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: C.textSecondary,
    textAlign: "center",
  },
  emptySubtitle: { fontSize: 12, color: C.textMuted, textAlign: "center" },
  emptyAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  emptyAddLabel: { fontSize: 13.5, fontWeight: "700", color: "#fff" },
});