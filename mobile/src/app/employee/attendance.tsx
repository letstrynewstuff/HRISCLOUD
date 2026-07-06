

// // src/app/employee/attendance.tsx
// // FIXED: Fetches recent history and finds today's record client-side using
// //        the USER'S LOCAL timezone. This fixes the UTC vs WAT mismatch.

// import { useState, useEffect, useCallback, useMemo, useRef } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   Pressable,
//   RefreshControl,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { router } from "expo-router";
// import {
//   CheckCircle2,
//   XCircle,
//   AlertTriangle,
//   Clock,
//   TrendingUp,
//   Flame,
//   Award,
//   Filter,
//   RefreshCw,
//   Coffee,
//   Play,
// } from "lucide-react-native";
// import Toast from "react-native-toast-message";
// import * as Location from "expo-location";

// import C from "../../styles/colors";
// import AttendanceHero from "../../components/attendance/AttendanceHero";
// import StatTile from "../../components/attendance/StatTile";
// import AttendanceLogRow from "../../components/attendance/AttendanceLogRow";
// import AttendanceDetailSheet from "../../components/attendance/AttendanceDetailSheet";
// import SectionHeader from "../../components/ui/SectionHeader";
// import BottomTabBar, { TabKey } from "../../components/ui/BottomTabBar";
// import BantaHRLetterLoader, {
//   BantaHRLetterLoaderRef,
// } from "../../components/BantaHRLetterLoader";

// import { attendanceApi } from "../../api/service/attendanceApi";
// import { authApi } from "../../api/service/authApi";

// const FILTERS: { key: string; label: string }[] = [
//   { key: "all", label: "All" },
//   { key: "present", label: "Present" },
//   { key: "late", label: "Late" },
//   { key: "absent", label: "Absent" },
// ];

// // ─── Helpers ──────────────────────────────────────────────
// function fmtHours(h: number) {
//   if (!h || h <= 0) return "—";
//   const hrs = Math.floor(h);
//   const mins = Math.round((h - hrs) * 60);
//   return mins ? `${hrs}h ${mins}m` : `${hrs}h`;
// }

// function fmtTime(d: string | Date | null) {
//   if (!d) return null;
//   try {
//     const date = typeof d === "string" ? new Date(d) : d;
//     if (isNaN(date.getTime())) return null;
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   } catch {
//     return null;
//   }
// }

// function fmtDate(d: string | Date) {
//   if (!d) return "—";
//   try {
//     const date = typeof d === "string" ? new Date(d) : d;
//     if (isNaN(date.getTime())) return "—";
//     return date.toLocaleDateString(undefined, {
//       weekday: "short",
//       month: "short",
//       day: "numeric",
//     });
//   } catch {
//     return "—";
//   }
// }

// function parseDate(d: string | Date | null): Date | null {
//   if (!d) return null;
//   try {
//     const date = typeof d === "string" ? new Date(d) : d;
//     return isNaN(date.getTime()) ? null : date;
//   } catch {
//     return null;
//   }
// }

// /** Get user's LOCAL date as YYYY-MM-DD string (not UTC!) */
// function getLocalDateStr(d = new Date()): string {
//   const year = d.getFullYear();
//   const month = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// }

// /** Check if a record's date matches the user's local today */
// function isRecordFromToday(record: any): boolean {
//   const dateField =
//     record.attendanceDate ??
//     record.date ??
//     record.createdAt ??
//     record.created_at;
//   if (!dateField) return false;
//   const recordLocalStr = getLocalDateStr(new Date(dateField));
//   return recordLocalStr === getLocalDateStr();
// }

// function deriveStatus(entry: any): string {
//   if (entry.status) return entry.status.toLowerCase();

//   const clockIn = entry.clockIn ?? entry.clock_in;
//   const clockOut = entry.clockOut ?? entry.clock_out;

//   if (!clockIn) return "absent";
//   if (clockOut) return "present";

//   const inTime = parseDate(clockIn);
//   if (inTime) {
//     const hour = inTime.getHours();
//     const minute = inTime.getMinutes();
//     if (hour > 9 || (hour === 9 && minute > 0)) {
//       return "late";
//     }
//   }
//   return "present";
// }

// function getHoursWorked(entry: any): number {
//   const hours =
//     entry.hoursWorked ??
//     entry.hours_worked ??
//     entry.hours ??
//     entry.duration ??
//     0;
//   if (hours) return parseFloat(String(hours));

//   const clockIn = parseDate(entry.clockIn ?? entry.clock_in);
//   const clockOut = parseDate(entry.clockOut ?? entry.clock_out);
//   if (clockIn && clockOut) {
//     const diffMs = clockOut.getTime() - clockIn.getTime();
//     return diffMs / (1000 * 60 * 60);
//   }
//   return 0;
// }

// function extractArray(res: any): any[] {
//   if (!res) return [];
//   if (Array.isArray(res)) return res;
//   if (res.rows && Array.isArray(res.rows)) return res.rows;
//   if (res.data && Array.isArray(res.data)) return res.data;
//   if (res.attendance && Array.isArray(res.attendance)) return res.attendance;
//   if (res.records && Array.isArray(res.records)) return res.records;
//   if (res.entries && Array.isArray(res.entries)) return res.entries;
//   if (res.results && Array.isArray(res.results)) return res.results;
//   if (typeof res === "object" && res.id) return [res];
//   return [];
// }

// type DayStatus = "not-started" | "active" | "on-break" | "done";

// export default function AttendanceScreen() {
//   const loaderRef = useRef<BantaHRLetterLoaderRef>(null);

//   const [employee, setEmployee] = useState<any>(null);
//   const [todayRecord, setTodayRecord] = useState<any>(null);
//   const [history, setHistory] = useState<any[]>([]);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [dayStatus, setDayStatus] = useState<DayStatus>("not-started");
//   const [clockInTime, setClockInTime] = useState<Date | null>(null);
//   const [clockOutTime, setClockOutTime] = useState<Date | null>(null);
//   const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [activeFilter, setActiveFilter] = useState("all");
//   const [detailEntry, setDetailEntry] = useState<any>(null);
//   const [activeTab, setActiveTab] = useState<TabKey>("attendance");

//   // ─── FIXED: Fetch recent history, find today's record client-side ───
//   const load = useCallback(async () => {
//     setError(null);
//     try {
//       const me = await authApi.getMe();
//       setEmployee(me);

//       // Fetch recent history (includes today + past records)
//       const historyRes = await attendanceApi.getMyAttendance({ limit: 31 });
//       console.log(
//         "[attendance] Raw response:",
//         JSON.stringify(historyRes, null, 2),
//       );

//       const allRecords = extractArray(historyRes);
//       console.log("[attendance] Extracted records:", allRecords.length);
//       setHistory(allRecords);

//       // ── CRITICAL FIX: Find today's record using USER'S LOCAL timezone ──
//       // The backend stores UTC dates, but we need to match against
//       // what day it is WHERE THE USER IS (Nigeria/WAT).
//       //
//       // Priority:
//       //  1. Any open session (clocked in, not clocked out) — most recent
//       //  2. Record whose local date matches today's local date
//       //  3. Most recent record from last 48h as fallback

//       const now = Date.now();
//       const oneDayMs = 24 * 60 * 60 * 1000;

//       // 1. Find any open session (has clockIn, no clockOut)
//       const openSession = allRecords.find((r: any) => {
//         const cin = r.clockIn ?? r.clock_in;
//         const cout = r.clockOut ?? r.clock_out;
//         return cin && !cout;
//       });

//       // 2. Find record matching today's LOCAL date
//       const todayMatch = allRecords.find(isRecordFromToday);

//       // 3. Most recent record within last 48h
//       const recentFallback = allRecords.find((r: any) => {
//         const dateField =
//           r.attendanceDate ?? r.date ?? r.createdAt ?? r.created_at;
//         if (!dateField) return false;
//         return now - new Date(dateField).getTime() < 2 * oneDayMs;
//       });

//       // Priority: open session > today's match > recent fallback
//       const today = openSession ?? todayMatch ?? recentFallback ?? null;

//       console.log("[attendance] Open session:", !!openSession);
//       console.log("[attendance] Today match:", !!todayMatch);
//       console.log("[attendance] Selected record:", today);
//       setTodayRecord(today);

//       // Derive today's status from the record
//       if (today) {
//         const cin = parseDate(today.clockIn ?? today.clock_in);
//         const cout = parseDate(today.clockOut ?? today.clock_out);
//         const breakStart = parseDate(today.breakStart ?? today.break_start);
//         const isOnBreak = today.onBreak ?? today.on_break ?? false;

//         setClockInTime(cin);
//         setClockOutTime(cout);
//         setBreakStartTime(breakStart);

//         if (cout) {
//           setDayStatus("done");
//         } else if (isOnBreak || breakStart) {
//           setDayStatus("on-break");
//         } else if (cin) {
//           setDayStatus("active");
//         } else {
//           setDayStatus("not-started");
//         }
//       } else {
//         setDayStatus("not-started");
//         setClockInTime(null);
//         setClockOutTime(null);
//         setBreakStartTime(null);
//       }
//     } catch (err: any) {
//       console.log(
//         "Attendance error:",
//         err?.response?.status,
//         err?.response?.config?.url,
//         err?.response?.data,
//       );
//       setError(
//         err?.response?.data?.message ??
//           err?.message ??
//           "Failed to load attendance.",
//       );
//     }
//   }, []);

//   useEffect(() => {
//     (async () => {
//       loaderRef.current?.show();
//       try {
//         await load();
//       } finally {
//         loaderRef.current?.hide();
//       }
//     })();
//   }, [load]);

//   // ─── Clock In with geolocation ───
//   async function handleClockIn() {
//     setActionLoading(true);
//     try {
//       let payload: any = {};
//       // Try to get geolocation
//       try {
//         const { status } = await Location.requestForegroundPermissionsAsync();
//         if (status === "granted") {
//           const location = await Location.getCurrentPositionAsync({});
//           payload = {
//             lat: location.coords.latitude,
//             lng: location.coords.longitude,
//           };
//         }
//       } catch {
//         // Location optional
//       }

//       await attendanceApi.clockIn(payload);
//       Toast.show({ type: "success", text1: "Clocked in successfully" });
//       await load();
//     } catch (err: any) {
//       const msg = err?.response?.data?.message ?? "Failed to clock in";
//       Toast.show({ type: "error", text1: msg });
//       console.error("Clock in error:", err?.response?.data ?? err);
//     } finally {
//       setActionLoading(false);
//     }
//   }

//   async function handleClockOut() {
//     setActionLoading(true);
//     try {
//       await attendanceApi.clockOut();
//       Toast.show({ type: "success", text1: "Clocked out successfully" });
//       await load();
//     } catch (err: any) {
//       Toast.show({
//         type: "error",
//         text1: err?.response?.data?.message ?? "Failed to clock out",
//       });
//     } finally {
//       setActionLoading(false);
//     }
//   }

//   async function handleStartBreak() {
//     setActionLoading(true);
//     try {
//       await attendanceApi.startBreak();
//       Toast.show({ type: "success", text1: "Break started" });
//       await load();
//     } catch (err: any) {
//       Toast.show({
//         type: "error",
//         text1: err?.response?.data?.message ?? "Failed to start break",
//       });
//     } finally {
//       setActionLoading(false);
//     }
//   }

//   async function handleEndBreak() {
//     setActionLoading(true);
//     try {
//       await attendanceApi.endBreak();
//       Toast.show({ type: "success", text1: "Break ended" });
//       await load();
//     } catch (err: any) {
//       Toast.show({
//         type: "error",
//         text1: err?.response?.data?.message ?? "Failed to end break",
//       });
//     } finally {
//       setActionLoading(false);
//     }
//   }

//   function handlePressClock() {
//     if (dayStatus === "not-started") handleClockIn();
//     else if (dayStatus === "active") handleClockOut();
//     else if (dayStatus === "on-break") handleEndBreak();
//   }

//   function handlePressBreak() {
//     if (dayStatus === "active") handleStartBreak();
//     else if (dayStatus === "on-break") handleEndBreak();
//   }

//   async function handleRefresh() {
//     setRefreshing(true);
//     await load();
//     setRefreshing(false);
//   }

//   function handleTabChange(key: TabKey) {
//     setActiveTab(key);
//     if (key === "home") router.replace("/employee/dashboard");
//     if (key === "attendance") router.replace("/employee/attendance");
//   }

//   const stats = useMemo(() => {
//     if (!history.length) {
//       return {
//         present: 0,
//         late: 0,
//         absent: 0,
//         totalHours: 0,
//         rate: 0,
//         streak: 0,
//       };
//     }

//     let present = 0;
//     let late = 0;
//     let absent = 0;
//     let totalHours = 0;
//     let workingDays = 0;

//     for (const entry of history) {
//       const status = deriveStatus(entry);
//       const hours = getHoursWorked(entry);

//       if (status === "present") present++;
//       else if (status === "late") late++;
//       else if (status === "absent") absent++;

//       totalHours += hours;

//       const date = parseDate(
//         entry.date ??
//           entry.attendanceDate ??
//           entry.createdAt ??
//           entry.created_at,
//       );
//       if (date) {
//         const dayOfWeek = date.getDay();
//         if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
//       } else {
//         workingDays++;
//       }
//     }

//     const rate =
//       workingDays > 0 ? Math.round(((present + late) / workingDays) * 100) : 0;

//     let streak = 0;
//     const sorted = [...history].sort((a, b) => {
//       const da = parseDate(
//         a.date ?? a.attendanceDate ?? a.createdAt ?? a.created_at,
//       );
//       const db = parseDate(
//         b.date ?? b.attendanceDate ?? b.createdAt ?? b.created_at,
//       );
//       return (db?.getTime() ?? 0) - (da?.getTime() ?? 0);
//     });

//     for (const entry of sorted) {
//       const status = deriveStatus(entry);
//       if (status === "present" || status === "late") streak++;
//       else if (status === "absent") break;
//     }

//     return { present, late, absent, totalHours, rate, streak };
//   }, [history]);

//   const filteredLog = useMemo(() => {
//     const mapped = history.map((e) => {
//       const status = deriveStatus(e);
//       const hours = getHoursWorked(e);
//       return {
//         id: String(e.id ?? e._id ?? Math.random()),
//         dateStr: fmtDate(
//           e.date ?? e.attendanceDate ?? e.createdAt ?? e.created_at,
//         ),
//         clockIn: fmtTime(e.clockIn ?? e.clock_in),
//         clockOut: fmtTime(e.clockOut ?? e.clock_out),
//         hoursLabel: fmtHours(hours),
//         status: status as any,
//         isManuallyEdited: e.isManuallyEdited ?? e.is_manually_edited ?? false,
//       };
//     });

//     if (activeFilter === "all") return mapped;
//     return mapped.filter((e) => e.status === activeFilter);
//   }, [history, activeFilter]);

//   return (
//     <SafeAreaView style={styles.safeArea} edges={["top"]}>
//       <View style={styles.headerBar}>
//         <Text style={styles.headerTitle}>Attendance</Text>
//       </View>

//       <ScrollView
//         style={styles.scroll}
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
//         <AttendanceHero
//           employeeFirstName={
//             employee?.firstName ?? employee?.first_name ?? "Employee"
//           }
//           dayStatus={dayStatus}
//           clockInTime={clockInTime}
//           clockOutTime={clockOutTime}
//           breakStartTime={breakStartTime}
//           actionLoading={actionLoading}
//           onPressClock={handlePressClock}
//           onPressBreak={handlePressBreak}
//         />

//         {error && (
//           <View style={styles.errorBanner}>
//             <AlertTriangle size={16} color={C.danger} />
//             <Text style={styles.errorText}>{error}</Text>
//           </View>
//         )}

//         <View style={styles.section}>
//           <SectionHeader title="This Month" showChevron={false} />
//           <View style={styles.statsGrid}>
//             <StatTile
//               label="Present"
//               value={stats.present}
//               icon={<CheckCircle2 size={15} color={C.success} />}
//               color={C.success}
//               bg={C.successBg}
//             />
//             <StatTile
//               label="Absent"
//               value={stats.absent}
//               icon={<XCircle size={15} color={C.danger} />}
//               color={C.danger}
//               bg={C.dangerBg}
//             />
//             <StatTile
//               label="Late"
//               value={stats.late}
//               icon={<AlertTriangle size={15} color={C.warning} />}
//               color={C.warning}
//               bg={C.warningBg}
//             />
//           </View>
//         </View>

//         <View style={styles.section}>
//           <View style={styles.statsGridCompact}>
//             <StatTile
//               compact
//               label="Total Hours"
//               value={fmtHours(stats.totalHours)}
//               icon={<Clock size={15} color={C.primary} />}
//               color={C.primary}
//               bg={C.infoBg}
//             />
//             <StatTile
//               compact
//               label="Attendance Rate"
//               value={`${stats.rate}%`}
//               icon={<TrendingUp size={15} color={C.accent} />}
//               color={C.accent}
//               bg={C.successBg}
//             />
//             <StatTile
//               compact
//               label="Current Streak"
//               value={`${stats.streak} days`}
//               icon={<Flame size={15} color={C.warning} />}
//               color={C.warning}
//               bg={C.warningBg}
//             />
//             <StatTile
//               compact
//               label="Punctuality"
//               value={`${stats.rate}%`}
//               icon={<Award size={15} color={C.violet} />}
//               color={C.violet}
//               bg={C.violetBg}
//             />
//           </View>
//         </View>

//         <View style={[styles.section, styles.lastSection]}>
//           <SectionHeader title="Attendance History" showChevron={false} />
//           <View style={styles.filterRow}>
//             <Filter size={13} color={C.textMuted} />
//             {FILTERS.map((f) => {
//               const active = f.key === activeFilter;
//               return (
//                 <Pressable
//                   key={f.key}
//                   onPress={() => setActiveFilter(f.key)}
//                   style={[styles.filterChip, active && styles.filterChipActive]}
//                 >
//                   <Text
//                     style={[
//                       styles.filterChipText,
//                       active && styles.filterChipTextActive,
//                     ]}
//                   >
//                     {f.label}
//                   </Text>
//                 </Pressable>
//               );
//             })}
//           </View>

//           <View style={styles.logCard}>
//             {filteredLog.length === 0 ? (
//               <View style={styles.emptyState}>
//                 <Clock size={28} color={C.textMuted} />
//                 <Text style={styles.emptyText}>
//                   No attendance records found.
//                 </Text>
//               </View>
//             ) : (
//               filteredLog.map((entry) => (
//                 <AttendanceLogRow
//                   key={entry.id}
//                   entry={entry}
//                   onPress={() => setDetailEntry(entry)}
//                 />
//               ))
//             )}
//           </View>
//         </View>
//       </ScrollView>

//       <BottomTabBar active={activeTab} onChange={handleTabChange} teamBadge />
//       <AttendanceDetailSheet
//         entry={detailEntry}
//         onClose={() => setDetailEntry(null)}
//       />

//       {/* Global loader — the only loader in this screen */}
//       <BantaHRLetterLoader
//         ref={loaderRef}
//         overlay
//         subtitle="Loading attendance..."
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: C.bg },
//   headerBar: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 12 },
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: "800",
//     color: C.textPrimary,
//     letterSpacing: -0.4,
//   },
//   scroll: { flex: 1 },
//   scrollContent: { paddingHorizontal: 18, paddingBottom: 12 },
//   section: { marginTop: 22 },
//   lastSection: { marginBottom: 8 },
//   statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
//   statsGridCompact: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
//   errorBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     borderRadius: 14,
//     padding: 14,
//     backgroundColor: C.dangerLight,
//     marginTop: 10,
//   },
//   errorText: { fontSize: 13, color: C.danger, flex: 1 },
//   filterRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     marginBottom: 12,
//   },
//   filterChip: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 999,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
//   filterChipText: { fontSize: 12, fontWeight: "600", color: C.textSecondary },
//   filterChipTextActive: { color: "#fff" },
//   logCard: {
//     backgroundColor: C.surface,
//     borderRadius: 18,
//     borderWidth: 1,
//     borderColor: C.border,
//     paddingHorizontal: 12,
//   },
//   emptyState: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 40,
//     gap: 10,
//   },
//   emptyText: { fontSize: 13, color: C.textMuted },
// });



// src/app/employee/attendance.tsx
// FIXED: Added back arrow (ArrowLeft) to header + removed duplicate BottomTabBar

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Flame,
  Award,
  Filter,
  ArrowLeft,
} from "lucide-react-native";
import Toast from "react-native-toast-message";
import * as Location from "expo-location";

import C from "../../styles/colors";
import AttendanceHero from "../../components/attendance/AttendanceHero";
import StatTile from "../../components/attendance/StatTile";
import AttendanceLogRow from "../../components/attendance/AttendanceLogRow";
import AttendanceDetailSheet from "../../components/attendance/AttendanceDetailSheet";
import SectionHeader from "../../components/ui/SectionHeader";
import BantaHRLetterLoader, {
  BantaHRLetterLoaderRef,
} from "../../components/BantaHRLetterLoader";

import { attendanceApi } from "../../api/service/attendanceApi";
import { authApi } from "../../api/service/authApi";

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "present", label: "Present" },
  { key: "late", label: "Late" },
  { key: "absent", label: "Absent" },
];

// ─── Helpers ──────────────────────────────────────────────
function fmtHours(h: number) {
  if (!h || h <= 0) return "—";
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function fmtTime(d: string | Date | null) {
  if (!d) return null;
  try {
    const date = typeof d === "string" ? new Date(d) : d;
    if (isNaN(date.getTime())) return null;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return null;
  }
}

function fmtDate(d: string | Date) {
  if (!d) return "—";
  try {
    const date = typeof d === "string" ? new Date(d) : d;
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function parseDate(d: string | Date | null): Date | null {
  if (!d) return null;
  try {
    const date = typeof d === "string" ? new Date(d) : d;
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/** Get user's LOCAL date as YYYY-MM-DD string (not UTC!) */
function getLocalDateStr(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Check if a record's date matches the user's local today */
function isRecordFromToday(record: any): boolean {
  const dateField =
    record.attendanceDate ??
    record.date ??
    record.createdAt ??
    record.created_at;
  if (!dateField) return false;
  const recordLocalStr = getLocalDateStr(new Date(dateField));
  return recordLocalStr === getLocalDateStr();
}

function deriveStatus(entry: any): string {
  if (entry.status) return entry.status.toLowerCase();

  const clockIn = entry.clockIn ?? entry.clock_in;
  const clockOut = entry.clockOut ?? entry.clock_out;

  if (!clockIn) return "absent";
  if (clockOut) return "present";

  const inTime = parseDate(clockIn);
  if (inTime) {
    const hour = inTime.getHours();
    const minute = inTime.getMinutes();
    if (hour > 9 || (hour === 9 && minute > 0)) {
      return "late";
    }
  }
  return "present";
}

function getHoursWorked(entry: any): number {
  const hours =
    entry.hoursWorked ??
    entry.hours_worked ??
    entry.hours ??
    entry.duration ??
    0;
  if (hours) return parseFloat(String(hours));

  const clockIn = parseDate(entry.clockIn ?? entry.clock_in);
  const clockOut = parseDate(entry.clockOut ?? entry.clock_out);
  if (clockIn && clockOut) {
    const diffMs = clockOut.getTime() - clockIn.getTime();
    return diffMs / (1000 * 60 * 60);
  }
  return 0;
}

function extractArray(res: any): any[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.rows && Array.isArray(res.rows)) return res.rows;
  if (res.data && Array.isArray(res.data)) return res.data;
  if (res.attendance && Array.isArray(res.attendance)) return res.attendance;
  if (res.records && Array.isArray(res.records)) return res.records;
  if (res.entries && Array.isArray(res.entries)) return res.entries;
  if (res.results && Array.isArray(res.results)) return res.results;
  if (typeof res === "object" && res.id) return [res];
  return [];
}

type DayStatus = "not-started" | "active" | "on-break" | "done";

export default function AttendanceScreen() {
  const loaderRef = useRef<BantaHRLetterLoaderRef>(null);

  const [employee, setEmployee] = useState<any>(null);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dayStatus, setDayStatus] = useState<DayStatus>("not-started");
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [clockOutTime, setClockOutTime] = useState<Date | null>(null);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [detailEntry, setDetailEntry] = useState<any>(null);

  // ─── FIXED: Fetch recent history, find today's record client-side ───
  const load = useCallback(async () => {
    setError(null);
    try {
      const me = await authApi.getMe();
      setEmployee(me);

      const historyRes = await attendanceApi.getMyAttendance({ limit: 31 });
      const allRecords = extractArray(historyRes);
      setHistory(allRecords);

      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      const openSession = allRecords.find((r: any) => {
        const cin = r.clockIn ?? r.clock_in;
        const cout = r.clockOut ?? r.clock_out;
        return cin && !cout;
      });

      const todayMatch = allRecords.find(isRecordFromToday);
      const recentFallback = allRecords.find((r: any) => {
        const dateField =
          r.attendanceDate ?? r.date ?? r.createdAt ?? r.created_at;
        if (!dateField) return false;
        return now - new Date(dateField).getTime() < 2 * oneDayMs;
      });

      const today = openSession ?? todayMatch ?? recentFallback ?? null;
      setTodayRecord(today);

      if (today) {
        const cin = parseDate(today.clockIn ?? today.clock_in);
        const cout = parseDate(today.clockOut ?? today.clock_out);
        const breakStart = parseDate(today.breakStart ?? today.break_start);
        const isOnBreak = today.onBreak ?? today.on_break ?? false;

        setClockInTime(cin);
        setClockOutTime(cout);
        setBreakStartTime(breakStart);

        if (cout) {
          setDayStatus("done");
        } else if (isOnBreak || breakStart) {
          setDayStatus("on-break");
        } else if (cin) {
          setDayStatus("active");
        } else {
          setDayStatus("not-started");
        }
      } else {
        setDayStatus("not-started");
        setClockInTime(null);
        setClockOutTime(null);
        setBreakStartTime(null);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to load attendance.",
      );
    }
  }, []);

  useEffect(() => {
    (async () => {
      loaderRef.current?.show();
      try {
        await load();
      } finally {
        loaderRef.current?.hide();
      }
    })();
  }, [load]);

  // ─── Clock In with geolocation ───
  async function handleClockIn() {
    setActionLoading(true);
    try {
      let payload: any = {};
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({});
          payload = {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          };
        }
      } catch {
        // Location optional
      }

      await attendanceApi.clockIn(payload);
      Toast.show({ type: "success", text1: "Clocked in successfully" });
      await load();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to clock in";
      Toast.show({ type: "error", text1: msg });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleClockOut() {
    setActionLoading(true);
    try {
      await attendanceApi.clockOut();
      Toast.show({ type: "success", text1: "Clocked out successfully" });
      await load();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err?.response?.data?.message ?? "Failed to clock out",
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStartBreak() {
    setActionLoading(true);
    try {
      await attendanceApi.startBreak();
      Toast.show({ type: "success", text1: "Break started" });
      await load();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err?.response?.data?.message ?? "Failed to start break",
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleEndBreak() {
    setActionLoading(true);
    try {
      await attendanceApi.endBreak();
      Toast.show({ type: "success", text1: "Break ended" });
      await load();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err?.response?.data?.message ?? "Failed to end break",
      });
    } finally {
      setActionLoading(false);
    }
  }

  function handlePressClock() {
    if (dayStatus === "not-started") handleClockIn();
    else if (dayStatus === "active") handleClockOut();
    else if (dayStatus === "on-break") handleEndBreak();
  }

  function handlePressBreak() {
    if (dayStatus === "active") handleStartBreak();
    else if (dayStatus === "on-break") handleEndBreak();
  }

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const stats = useMemo(() => {
    if (!history.length) {
      return { present: 0, late: 0, absent: 0, totalHours: 0, rate: 0, streak: 0 };
    }

    let present = 0, late = 0, absent = 0, totalHours = 0, workingDays = 0;

    for (const entry of history) {
      const status = deriveStatus(entry);
      const hours = getHoursWorked(entry);

      if (status === "present") present++;
      else if (status === "late") late++;
      else if (status === "absent") absent++;

      totalHours += hours;

      const date = parseDate(
        entry.date ?? entry.attendanceDate ?? entry.createdAt ?? entry.created_at,
      );
      if (date) {
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
      } else {
        workingDays++;
      }
    }

    const rate = workingDays > 0 ? Math.round(((present + late) / workingDays) * 100) : 0;

    let streak = 0;
    const sorted = [...history].sort((a, b) => {
      const da = parseDate(a.date ?? a.attendanceDate ?? a.createdAt ?? a.created_at);
      const db = parseDate(b.date ?? b.attendanceDate ?? b.createdAt ?? b.created_at);
      return (db?.getTime() ?? 0) - (da?.getTime() ?? 0);
    });

    for (const entry of sorted) {
      const status = deriveStatus(entry);
      if (status === "present" || status === "late") streak++;
      else if (status === "absent") break;
    }

    return { present, late, absent, totalHours, rate, streak };
  }, [history]);

  const filteredLog = useMemo(() => {
    const mapped = history.map((e) => {
      const status = deriveStatus(e);
      const hours = getHoursWorked(e);
      return {
        id: String(e.id ?? e._id ?? Math.random()),
        dateStr: fmtDate(e.date ?? e.attendanceDate ?? e.createdAt ?? e.created_at),
        clockIn: fmtTime(e.clockIn ?? e.clock_in),
        clockOut: fmtTime(e.clockOut ?? e.clock_out),
        hoursLabel: fmtHours(hours),
        status: status as any,
        isManuallyEdited: e.isManuallyEdited ?? e.is_manually_edited ?? false,
      };
    });

    if (activeFilter === "all") return mapped;
    return mapped.filter((e) => e.status === activeFilter);
  }, [history, activeFilter]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header with back arrow — matches benefits.tsx exactly */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <ArrowLeft size={18} color={C.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Attendance</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <AttendanceHero
          employeeFirstName={employee?.firstName ?? employee?.first_name ?? "Employee"}
          dayStatus={dayStatus}
          clockInTime={clockInTime}
          clockOutTime={clockOutTime}
          breakStartTime={breakStartTime}
          actionLoading={actionLoading}
          onPressClock={handlePressClock}
          onPressBreak={handlePressBreak}
        />

        {error && (
          <View style={styles.errorBanner}>
            <AlertTriangle size={16} color={C.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.section}>
          <SectionHeader title="This Month" showChevron={false} />
          <View style={styles.statsGrid}>
            <StatTile
              label="Present"
              value={stats.present}
              icon={<CheckCircle2 size={15} color={C.success} />}
              color={C.success}
              bg={C.successBg}
            />
            <StatTile
              label="Absent"
              value={stats.absent}
              icon={<XCircle size={15} color={C.danger} />}
              color={C.danger}
              bg={C.dangerBg}
            />
            <StatTile
              label="Late"
              value={stats.late}
              icon={<AlertTriangle size={15} color={C.warning} />}
              color={C.warning}
              bg={C.warningBg}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.statsGridCompact}>
            <StatTile
              compact
              label="Total Hours"
              value={fmtHours(stats.totalHours)}
              icon={<Clock size={15} color={C.primary} />}
              color={C.primary}
              bg={C.infoBg}
            />
            <StatTile
              compact
              label="Attendance Rate"
              value={`${stats.rate}%`}
              icon={<TrendingUp size={15} color={C.accent} />}
              color={C.accent}
              bg={C.successBg}
            />
            <StatTile
              compact
              label="Current Streak"
              value={`${stats.streak} days`}
              icon={<Flame size={15} color={C.warning} />}
              color={C.warning}
              bg={C.warningBg}
            />
            <StatTile
              compact
              label="Punctuality"
              value={`${stats.rate}%`}
              icon={<Award size={15} color={C.violet} />}
              color={C.violet}
              bg={C.violetBg}
            />
          </View>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <SectionHeader title="Attendance History" showChevron={false} />
          <View style={styles.filterRow}>
            <Filter size={13} color={C.textMuted} />
            {FILTERS.map((f) => {
              const active = f.key === activeFilter;
              return (
                <Pressable
                  key={f.key}
                  onPress={() => setActiveFilter(f.key)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      active && styles.filterChipTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.logCard}>
            {filteredLog.length === 0 ? (
              <View style={styles.emptyState}>
                <Clock size={28} color={C.textMuted} />
                <Text style={styles.emptyText}>No attendance records found.</Text>
              </View>
            ) : (
              filteredLog.map((entry) => (
                <AttendanceLogRow
                  key={entry.id}
                  entry={entry}
                  onPress={() => setDetailEntry(entry)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <AttendanceDetailSheet
        entry={detailEntry}
        onClose={() => setDetailEntry(null)}
      />

      <BantaHRLetterLoader
        ref={loaderRef}
        overlay
        subtitle="Loading attendance..."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  
  // ── Header with back arrow — matches benefits.tsx exactly ──
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
  
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 12 },
  section: { marginTop: 22 },
  lastSection: { marginBottom: 8 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statsGridCompact: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    padding: 14,
    backgroundColor: C.dangerLight,
    marginTop: 10,
  },
  errorText: { fontSize: 13, color: C.danger, flex: 1 },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterChipText: { fontSize: 12, fontWeight: "600", color: C.textSecondary },
  filterChipTextActive: { color: "#fff" },
  logCard: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: { fontSize: 13, color: C.textMuted },
});