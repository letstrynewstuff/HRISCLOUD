// // src/employee/timesheets/EmployeeTimesheetsPage.jsx
// //
// // Main employee timesheet view — layout matches AttendancePage:
// // full-screen flex shell, sticky top nav, scrollable <main>.

// import { useState, useEffect, useCallback, useMemo } from "react";
// import { motion as Motion, AnimatePresence } from "framer-motion";
// import {
//   ChevronLeft,
//   ChevronRight,
//   Plus,
//   Send,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   FileText,
//   Menu,
//   Search,
//   RefreshCw,
// } from "lucide-react";
// import toast from "react-hot-toast";

// import { timesheetApi } from "../../api/service/timesheetApi";
// import { useAuth } from "../../components/useAuth";
// import { C } from "../../admin/employeemanagement/sharedData";

// import EntryCard from "./EntryCard";
// import EntryFormModal from "./EntryFormModal";
// import ConfirmSubmitModal from "./ConfirmSubmitModal";
// import StatusBadge from "./StatusBadge";

// // ─── Date helpers ─────────────────────────────────────────────
// const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// function getMondayOf(date) {
//   const d = new Date(date);
//   const day = d.getDay();
//   const diff = day === 0 ? -6 : 1 - day;
//   d.setDate(d.getDate() + diff);
//   d.setHours(0, 0, 0, 0);
//   return d;
// }

// function addDays(date, n) {
//   const d = new Date(date);
//   d.setDate(d.getDate() + n);
//   return d;
// }

// function toISO(date) {
//   return date.toISOString().slice(0, 10);
// }

// function fmtWeekLabel(monday) {
//   const sunday = addDays(monday, 6);
//   const opts = { month: "short", day: "numeric" };
//   return `${monday.toLocaleDateString("en-GB", opts)} – ${sunday.toLocaleDateString("en-GB", opts)}`;
// }

// function isToday(date) {
//   return toISO(date) === toISO(new Date());
// }

// // ─── Skeleton ──────────────────────────────────────────────────
// function Skeleton({ h = 80, r = 12 }) {
//   return (
//     <div
//       className="animate-pulse rounded-xl"
//       style={{ height: h, background: C.border ?? "#E5E7EB", borderRadius: r }}
//     />
//   );
// }

// // ─── Weekly Summary Cards ──────────────────────────────────────
// function WeeklySummary({ summary, loading }) {
//   if (loading) {
//     return (
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//         {[...Array(4)].map((_, i) => (
//           <Skeleton key={i} h={78} />
//         ))}
//       </div>
//     );
//   }
//   if (!summary) return null;

//   const stats = [
//     {
//       label: "Total hours",
//       value: `${summary.totalHours}h`,
//       icon: <Clock size={16} />,
//       color: C.primary,
//       bg: "#EEF2FF",
//     },
//     {
//       label: "Approved",
//       value: `${summary.byStatus?.Approved ?? 0} entries`,
//       icon: <CheckCircle size={16} />,
//       color: "#059669",
//       bg: "#D1FAE5",
//     },
//     {
//       label: "Pending",
//       value: `${summary.byStatus?.Submitted ?? 0} entries`,
//       icon: <Send size={16} />,
//       color: "#3B82F6",
//       bg: "#EFF6FF",
//     },
//     {
//       label: "Drafts",
//       value: `${summary.byStatus?.Draft ?? 0} entries`,
//       icon: <FileText size={16} />,
//       color: "#6B7280",
//       bg: "#F3F4F6",
//     },
//   ];

//   return (
//     <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//       {stats.map((s) => (
//         <div
//           key={s.label}
//           className="rounded-xl px-4 py-3 flex items-center gap-3"
//           style={{ background: s.bg, border: `1px solid ${s.color}22` }}
//         >
//           <div
//             className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
//             style={{ background: `${s.color}22`, color: s.color }}
//           >
//             {s.icon}
//           </div>
//           <div>
//             <div className="font-bold text-sm" style={{ color: s.color }}>
//               {s.value}
//             </div>
//             <div className="text-xs" style={{ color: C.textMuted }}>
//               {s.label}
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ─── Main Page ─────────────────────────────────────────────────
// export default function EmployeeTimesheetsPage() {
//   const { employee } = useAuth();

//   const [weekStart, setWeekStart] = useState(() => getMondayOf(new Date()));
//   const [activeDay, setActiveDay] = useState(0);
//   const [entries, setEntries] = useState([]);
//   const [summary, setSummary] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [sumLoading, setSumLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");

//   // Selection
//   const [selected, setSelected] = useState(new Set());

//   // Modals
//   const [formOpen, setFormOpen] = useState(false);
//   const [editEntry, setEditEntry] = useState(null);
//   const [formLoading, setFormLoading] = useState(false);
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [submitLoading, setSubmitLoading] = useState(false);
//   const [submitMode, setSubmitMode] = useState("selected");

//   const weekDates = useMemo(
//     () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
//     [weekStart],
//   );

//   const startDate = toISO(weekStart);
//   const endDate = toISO(addDays(weekStart, 6));

//   // ── Data fetch ──────────────────────────────────────────────
//   const fetchEntries = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await timesheetApi.getMyEntries({ startDate, endDate });
//       setEntries(res.entries ?? []);
//     } catch {
//       toast.error("Failed to load entries.");
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

//   // ── Entries grouped by day ───────────────────────────────────
//   const dayEntries = useMemo(() => {
//     const map = {};
//     weekDates.forEach((d) => {
//       map[toISO(d)] = [];
//     });
//     entries.forEach((e) => {
//       const key = toISO(new Date(e.entryDate));
//       if (map[key]) map[key].push(e);
//     });
//     return map;
//   }, [entries, weekDates]);

//   const activeDateStr = toISO(weekDates[activeDay]);
//   const activeDayList = dayEntries[activeDateStr] ?? [];
//   const draftIds = entries.filter((e) => e.status === "Draft").map((e) => e.id);
//   const selectedDrafts = [...selected].filter((id) => draftIds.includes(id));

//   // Filtered list for search (across full week)
//   const filteredActiveDayList = useMemo(() => {
//     if (!searchQuery.trim()) return activeDayList;
//     const q = searchQuery.toLowerCase();
//     return activeDayList.filter(
//       (e) =>
//         e.description?.toLowerCase().includes(q) ||
//         e.projectTag?.toLowerCase().includes(q),
//     );
//   }, [activeDayList, searchQuery]);

//   // ── Handlers ────────────────────────────────────────────────
//   function toggleSelect(id) {
//     setSelected((prev) => {
//       const next = new Set(prev);
//       next.has(id) ? next.delete(id) : next.add(id);
//       return next;
//     });
//   }

//   async function handleSave(form, mode) {
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
//         toast.success("Entry updated.");
//       } else {
//         await timesheetApi.createEntry(payload);
//         toast.success("Entry saved.");
//       }

//       if (mode === "submit" && !editEntry) {
//         const res = await timesheetApi.getMyEntries({
//           startDate,
//           endDate,
//           status: "Draft",
//         });
//         const newest = (res.entries ?? []).sort(
//           (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
//         )[0];
//         if (newest) {
//           await timesheetApi.submitEntries({ entryIds: [newest.id] });
//           toast.success("Entry submitted for approval.");
//         }
//       } else if (mode === "submit" && editEntry) {
//         await timesheetApi.submitEntries({ entryIds: [editEntry.id] });
//         toast.success("Entry submitted for approval.");
//       }

//       setFormOpen(false);
//       setEditEntry(null);
//       fetchEntries();
//       fetchSummary();
//     } catch (err) {
//       toast.error(err?.response?.data?.message ?? "Failed to save entry.");
//     } finally {
//       setFormLoading(false);
//     }
//   }

//   async function handleDelete(id) {
//     if (!window.confirm("Delete this draft entry?")) return;
//     try {
//       await timesheetApi.deleteEntry(id);
//       toast.success("Entry deleted.");
//       fetchEntries();
//       fetchSummary();
//     } catch (err) {
//       toast.error(err?.response?.data?.message ?? "Failed to delete entry.");
//     }
//   }

//   function openSubmit(mode) {
//     setSubmitMode(mode);
//     setConfirmOpen(true);
//   }

//   async function handleConfirmSubmit() {
//     setSubmitLoading(true);
//     try {
//       const ids = submitMode === "week" ? draftIds : selectedDrafts;
//       if (ids.length === 0) {
//         toast.error("No draft entries to submit.");
//         return;
//       }
//       await timesheetApi.submitEntries({ entryIds: ids });
//       toast.success(
//         `${ids.length} ${ids.length === 1 ? "entry" : "entries"} submitted.`,
//       );
//       setSelected(new Set());
//       setConfirmOpen(false);
//       fetchEntries();
//       fetchSummary();
//     } catch (err) {
//       toast.error(err?.response?.data?.message ?? "Failed to submit entries.");
//     } finally {
//       setSubmitLoading(false);
//     }
//   }

//   const submitCount =
//     submitMode === "week" ? draftIds.length : selectedDrafts.length;

//   // ─── RENDER ─────────────────────────────────────────────────
//   return (
//     <div
//       className="min-h-screen font-sans"
//       style={{ background: C.bg ?? "#F0F2F8", color: C.textPrimary }}
//     >
//       <div className="flex h-screen overflow-hidden">
//         {/* Sidebar slot — rendered by parent router/shell, same as AttendancePage */}

//         <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
//           {/* ── TOP NAV ── */}
//           <header
//             className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
//             style={{
//               background: "rgba(240,242,248,0.85)",
//               backdropFilter: "blur(12px)",
//               borderBottom: `1px solid ${C.border}`,
//             }}
//           >
//             <Motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setSidebarOpen((p) => !p)}
//               className="p-2 rounded-xl hidden md:flex"
//               style={{
//                 background: C.surface,
//                 border: `1px solid ${C.border}`,
//                 cursor: "pointer",
//               }}
//             >
//               <Menu size={16} color={C.textSecondary} />
//             </Motion.button>

//             {/* Search bar */}
//             <Motion.div className="flex-1 max-w-xs relative">
//               <Search
//                 size={14}
//                 className="absolute left-3 top-1/2 -translate-y-1/2"
//                 color={C.textMuted}
//               />
//               <input
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 placeholder="Search entries…"
//                 className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
//                 style={{
//                   background: C.surface,
//                   border: `1.5px solid ${C.border}`,
//                   color: C.textPrimary,
//                 }}
//               />
//             </Motion.div>

//             {/* Right-side actions */}
//             <div className="flex items-center gap-2 ml-auto">
//               <Motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => {
//                   fetchEntries();
//                   fetchSummary();
//                 }}
//                 className="p-2 rounded-xl"
//                 style={{
//                   background: C.surface,
//                   border: `1px solid ${C.border}`,
//                   cursor: "pointer",
//                 }}
//                 title="Refresh"
//               >
//                 <RefreshCw size={14} color={C.textMuted} />
//               </Motion.button>

//               <Motion.button
//                 whileHover={{ scale: 1.04 }}
//                 whileTap={{ scale: 0.97 }}
//                 onClick={() => {
//                   setEditEntry(null);
//                   setFormOpen(true);
//                 }}
//                 className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white"
//                 style={{ background: C.primary }}
//               >
//                 <Plus size={14} />
//                 Add Entry
//               </Motion.button>

//               {employee?.avatar ? (
//                 <img
//                   src={employee.avatar}
//                   alt={employee.name}
//                   className="w-8 h-8 rounded-full object-cover"
//                 />
//               ) : (
//                 <div
//                   className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
//                   style={{
//                     background: "linear-gradient(135deg,#6366F1,#06B6D4)",
//                   }}
//                 >
//                   {employee?.initials ?? "?"}
//                 </div>
//               )}
//             </div>
//           </header>

//           {/* ── SCROLLABLE MAIN ── */}
//           <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
//             {/* ── HERO BANNER ── */}
//             <Motion.div
//               initial={{ opacity: 0, y: 16 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="relative rounded-2xl overflow-hidden"
//               style={{
//                 background:
//                   "linear-gradient(135deg,#1E1B4B 0%,#312E81 55%,#1E40AF 100%)",
//                 minHeight: 140,
//               }}
//             >
//               <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-3 mb-1">
//                     <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/15">
//                       <Clock size={20} color="white" />
//                     </div>
//                     <div>
//                       <h1
//                         className="text-white text-2xl font-bold"
//                         style={{ fontFamily: "Sora,sans-serif" }}
//                       >
//                         My Timesheets
//                       </h1>
//                       <p className="text-indigo-200 text-sm">
//                         {employee
//                           ? `Welcome back, ${employee.name.split(" ")[0]} — log your daily work activity`
//                           : "Log your daily work activity"}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Quick chips */}
//                   <div className="flex flex-wrap gap-2 mt-4">
//                     {summary && (
//                       <>
//                         <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10">
//                           <Clock size={12} color="rgba(255,255,255,0.7)" />
//                           <span className="text-white/80 text-xs">
//                             This week:{" "}
//                             <strong className="text-white">
//                               {summary.totalHours}h
//                             </strong>
//                           </span>
//                         </div>
//                         {draftIds.length > 0 && (
//                           <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10">
//                             <FileText size={12} color="rgba(255,255,255,0.7)" />
//                             <span className="text-white/80 text-xs">
//                               <strong className="text-white">
//                                 {draftIds.length}
//                               </strong>{" "}
//                               draft{draftIds.length !== 1 ? "s" : ""} pending
//                             </span>
//                           </div>
//                         )}
//                       </>
//                     )}
//                   </div>
//                 </div>

//                 {/* Mobile add button */}
//                 <Motion.button
//                   whileHover={{ scale: 1.04 }}
//                   whileTap={{ scale: 0.97 }}
//                   onClick={() => {
//                     setEditEntry(null);
//                     setFormOpen(true);
//                   }}
//                   className="sm:hidden flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-white/20 hover:bg-white/30 text-white self-start"
//                 >
//                   <Plus size={16} />
//                   Add Entry
//                 </Motion.button>
//               </div>
//             </Motion.div>

//             {/* ── WEEKLY SUMMARY ── */}
//             <WeeklySummary summary={summary} loading={sumLoading} />

//             {/* ── WEEK NAVIGATOR ── */}
//             <div
//               className="rounded-2xl p-4 flex flex-col gap-4"
//               style={{ background: C.surface, border: `1px solid ${C.border}` }}
//             >
//               {/* Week arrows + label */}
//               <div className="flex items-center justify-between">
//                 <Motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => setWeekStart((d) => addDays(d, -7))}
//                   className="w-9 h-9 rounded-xl flex items-center justify-center"
//                   style={{
//                     background: C.surfaceAlt ?? "#F3F4F6",
//                     border: `1px solid ${C.border}`,
//                   }}
//                 >
//                   <ChevronLeft size={16} color={C.textSecondary} />
//                 </Motion.button>

//                 <div className="text-center">
//                   <div
//                     className="font-bold text-sm"
//                     style={{ color: C.textPrimary }}
//                   >
//                     {fmtWeekLabel(weekStart)}
//                   </div>
//                   {toISO(weekStart) === toISO(getMondayOf(new Date())) && (
//                     <span className="text-xs" style={{ color: C.primary }}>
//                       This week
//                     </span>
//                   )}
//                 </div>

//                 <Motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => setWeekStart((d) => addDays(d, 7))}
//                   className="w-9 h-9 rounded-xl flex items-center justify-center"
//                   style={{
//                     background: C.surfaceAlt ?? "#F3F4F6",
//                     border: `1px solid ${C.border}`,
//                   }}
//                 >
//                   <ChevronRight size={16} color={C.textSecondary} />
//                 </Motion.button>
//               </div>

//               {/* Day tabs */}
//               <div className="grid grid-cols-7 gap-1">
//                 {weekDates.map((d, i) => {
//                   const iso = toISO(d);
//                   const cnt = (dayEntries[iso] ?? []).length;
//                   const active = i === activeDay;
//                   const today = isToday(d);
//                   return (
//                     <Motion.button
//                       key={iso}
//                       whileTap={{ scale: 0.96 }}
//                       onClick={() => setActiveDay(i)}
//                       className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs"
//                       style={{
//                         background: active
//                           ? C.primary
//                           : today
//                             ? "#EEF2FF"
//                             : "transparent",
//                         color: active
//                           ? "#fff"
//                           : today
//                             ? C.primary
//                             : C.textSecondary,
//                         border: active
//                           ? "none"
//                           : today
//                             ? `1.5px solid ${C.primary}44`
//                             : "1.5px solid transparent",
//                         cursor: "pointer",
//                         transition: "all 0.15s",
//                       }}
//                     >
//                       <span className="font-medium">{DAY_NAMES[i]}</span>
//                       <span className="font-bold text-sm">{d.getDate()}</span>
//                       {cnt > 0 && (
//                         <span
//                           className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
//                           style={{
//                             background: active
//                               ? "rgba(255,255,255,0.25)"
//                               : C.primary,
//                             color: "#fff",
//                           }}
//                         >
//                           {cnt}
//                         </span>
//                       )}
//                     </Motion.button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* ── BULK ACTION BAR ── */}
//             <AnimatePresence>
//               {selectedDrafts.length > 0 && (
//                 <Motion.div
//                   initial={{ opacity: 0, y: -8 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -8 }}
//                   className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
//                   style={{
//                     background: "#EEF2FF",
//                     border: `1.5px solid ${C.primary}44`,
//                   }}
//                 >
//                   <span
//                     className="text-sm font-semibold"
//                     style={{ color: C.primary }}
//                   >
//                     {selectedDrafts.length} draft
//                     {selectedDrafts.length !== 1 ? "s" : ""} selected
//                   </span>
//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={() => setSelected(new Set())}
//                       className="text-xs px-3 py-1.5 rounded-lg"
//                       style={{
//                         color: C.textSecondary,
//                         background: "white",
//                         border: `1px solid ${C.border}`,
//                       }}
//                     >
//                       Clear
//                     </button>
//                     <Motion.button
//                       whileHover={{ scale: 1.03 }}
//                       whileTap={{ scale: 0.97 }}
//                       onClick={() => openSubmit("selected")}
//                       className="flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-lg text-white"
//                       style={{ background: C.primary }}
//                     >
//                       <Send size={13} />
//                       Submit Selected
//                     </Motion.button>
//                   </div>
//                 </Motion.div>
//               )}
//             </AnimatePresence>

//             {/* ── DAY ENTRIES PANEL ── */}
//             <div
//               className="rounded-2xl p-5"
//               style={{ background: C.surface, border: `1px solid ${C.border}` }}
//             >
//               <div className="flex items-center justify-between mb-4">
//                 <div>
//                   <h2
//                     className="font-bold text-base"
//                     style={{
//                       color: C.textPrimary,
//                       fontFamily: "Sora,sans-serif",
//                     }}
//                   >
//                     {weekDates[activeDay].toLocaleDateString("en-GB", {
//                       weekday: "long",
//                       day: "numeric",
//                       month: "long",
//                     })}
//                   </h2>
//                   {activeDayList.length > 0 && (
//                     <p
//                       className="text-xs mt-0.5"
//                       style={{ color: C.textMuted }}
//                     >
//                       {activeDayList.length}{" "}
//                       {activeDayList.length === 1 ? "entry" : "entries"} ·{" "}
//                       {activeDayList.reduce(
//                         (s, e) => s + (e.durationMinutes ?? 0),
//                         0,
//                       )}{" "}
//                       mins total
//                     </p>
//                   )}
//                 </div>
//                 <div className="flex items-center gap-2">
//                   {draftIds.length > 0 && (
//                     <Motion.button
//                       whileHover={{ scale: 1.03 }}
//                       whileTap={{ scale: 0.97 }}
//                       onClick={() => openSubmit("week")}
//                       className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
//                       style={{
//                         background: "#EEF2FF",
//                         color: C.primary,
//                         border: `1px solid ${C.primary}33`,
//                       }}
//                     >
//                       <Send size={12} />
//                       Submit Week ({draftIds.length})
//                     </Motion.button>
//                   )}
//                   <Motion.button
//                     whileHover={{ scale: 1.04 }}
//                     whileTap={{ scale: 0.97 }}
//                     onClick={() => {
//                       setEditEntry(null);
//                       setFormOpen(true);
//                     }}
//                     className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-white"
//                     style={{ background: C.primary }}
//                   >
//                     <Plus size={12} />
//                     Add Entry
//                   </Motion.button>
//                 </div>
//               </div>

//               {loading ? (
//                 <div className="space-y-3">
//                   <Skeleton h={90} />
//                   <Skeleton h={90} />
//                   <Skeleton h={90} />
//                 </div>
//               ) : filteredActiveDayList.length === 0 ? (
//                 <Motion.div
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   className="py-14 flex flex-col items-center gap-3 text-center"
//                 >
//                   <div
//                     className="w-14 h-14 rounded-2xl flex items-center justify-center"
//                     style={{ background: "#F3F4F6" }}
//                   >
//                     <FileText size={24} color={C.textMuted} />
//                   </div>
//                   <p
//                     className="font-semibold text-sm"
//                     style={{ color: C.textSecondary }}
//                   >
//                     {searchQuery
//                       ? "No entries match your search"
//                       : "No entries logged for this day yet"}
//                   </p>
//                   {!searchQuery && (
//                     <>
//                       <p className="text-xs" style={{ color: C.textMuted }}>
//                         What did you work on? Add your first entry below.
//                       </p>
//                       <Motion.button
//                         whileHover={{ scale: 1.04 }}
//                         whileTap={{ scale: 0.97 }}
//                         onClick={() => {
//                           setEditEntry(null);
//                           setFormOpen(true);
//                         }}
//                         className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white mt-1"
//                         style={{
//                           background: C.primary,
//                           boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
//                         }}
//                       >
//                         <Plus size={15} />
//                         Add Entry
//                       </Motion.button>
//                     </>
//                   )}
//                 </Motion.div>
//               ) : (
//                 <AnimatePresence>
//                   <div className="space-y-3">
//                     {filteredActiveDayList.map((e) => (
//                       <EntryCard
//                         key={e.id}
//                         entry={e}
//                         selected={selected.has(e.id)}
//                         onSelect={toggleSelect}
//                         onEdit={(entry) => {
//                           setEditEntry(entry);
//                           setFormOpen(true);
//                         }}
//                         onDelete={handleDelete}
//                       />
//                     ))}
//                   </div>
//                 </AnimatePresence>
//               )}
//             </div>
//           </main>
//         </div>
//       </div>

//       {/* ── MODALS ── */}
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
//     </div>
//   );
// }



// src/employee/timesheets/EmployeeTimesheetsPage.jsx

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Plus, Send, Clock,
  CheckCircle, AlertCircle, FileText, Menu, Search, RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

import { timesheetApi } from "../../api/service/timesheetApi";
import { useAuth } from "../../components/useAuth";
import { C } from "../../admin/employeemanagement/sharedData";

import EntryCard from "./EntryCard";
import EntryFormModal from "./EntryFormModal";
import ConfirmSubmitModal from "./ConfirmSubmitModal";

// ─── Date helpers ─────────────────────────────────────────────
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ✅ FIX 1: Use local date parts instead of toISOString() (which converts to UTC
// and can shift the date by ±1 day depending on the user's timezone)
function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function fmtWeekLabel(monday) {
  const sunday = addDays(monday, 6);
  const opts = { month: "short", day: "numeric" };
  return `${monday.toLocaleDateString("en-GB", opts)} – ${sunday.toLocaleDateString("en-GB", opts)}`;
}

function isToday(date) {
  return toISO(date) === toISO(new Date());
}

// ─── Skeleton ─────────────────────────────────────────────────
function Skeleton({ h = 80, r = 12 }) {
  return (
    <div
      className="animate-pulse rounded-xl"
      style={{ height: h, background: C.border ?? "#E5E7EB", borderRadius: r }}
    />
  );
}

// ─── Weekly Summary Cards ──────────────────────────────────────
function WeeklySummary({ summary, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} h={78} />)}
      </div>
    );
  }
  if (!summary) return null;

  const stats = [
    {
      label: "Total hours",
      value: `${summary.totalHours ?? 0}h`,
      icon: <Clock size={16} />,
      color: C.primary,
      bg: "#EEF2FF",
    },
    {
      label: "Approved",
      value: `${summary.byStatus?.Approved ?? 0} entries`,
      icon: <CheckCircle size={16} />,
      color: "#059669",
      bg: "#D1FAE5",
    },
    {
      label: "Pending review",
      value: `${summary.byStatus?.Submitted ?? 0} entries`,
      icon: <Send size={16} />,
      color: "#3B82F6",
      bg: "#EFF6FF",
    },
    {
      label: "Drafts",
      value: `${summary.byStatus?.Draft ?? 0} entries`,
      icon: <FileText size={16} />,
      color: "#6B7280",
      bg: "#F3F4F6",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: s.bg, border: `1px solid ${s.color}22` }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${s.color}22`, color: s.color }}
          >
            {s.icon}
          </div>
          <div>
            <div className="font-bold text-sm" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs" style={{ color: C.textMuted }}>
              {s.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function EmployeeTimesheetsPage() {
  const { employee } = useAuth();

  const [weekStart, setWeekStart]   = useState(() => getMondayOf(new Date()));
  const [activeDay, setActiveDay]   = useState(0);
  const [entries, setEntries]       = useState([]);
  const [summary, setSummary]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [sumLoading, setSumLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected]     = useState(new Set());

  const [formOpen, setFormOpen]         = useState(false);
  const [editEntry, setEditEntry]       = useState(null);
  const [formLoading, setFormLoading]   = useState(false);
  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMode, setSubmitMode]     = useState("selected");

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const startDate = toISO(weekStart);
  const endDate   = toISO(addDays(weekStart, 6));

  // ── Data fetch ──────────────────────────────────────────────
  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await timesheetApi.getMyEntries({ startDate, endDate });
      setEntries(res.entries ?? []);
    } catch {
      toast.error("Failed to load entries.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  const fetchSummary = useCallback(async () => {
    setSumLoading(true);
    try {
      const res = await timesheetApi.getMySummary({ startDate, endDate });
      setSummary(res);
    } catch {
      // non-fatal
    } finally {
      setSumLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchEntries();
    fetchSummary();
    setSelected(new Set());
  }, [fetchEntries, fetchSummary]);

  // ── Entries grouped by day ───────────────────────────────────
  const dayEntries = useMemo(() => {
    const map = {};
    weekDates.forEach((d) => { map[toISO(d)] = []; });

    entries.forEach((e) => {
      // ✅ FIX 2: Slice the string directly instead of parsing through Date()
      // Parsing "2026-06-27" with new Date() gives June 26 at 23:00 in UTC+1
      // which then converts back to "2026-06-26" — entries disappear
      const key = typeof e.entryDate === "string"
        ? e.entryDate.slice(0, 10)
        : toISO(new Date(e.entryDate));

      if (map[key]) map[key].push(e);
    });

    return map;
  }, [entries, weekDates]);

  const activeDateStr   = toISO(weekDates[activeDay]);
  const activeDayList   = dayEntries[activeDateStr] ?? [];
  const draftIds        = entries.filter((e) => e.status === "Draft").map((e) => e.id);
  const selectedDrafts  = [...selected].filter((id) => draftIds.includes(id));

  const filteredActiveDayList = useMemo(() => {
    if (!searchQuery.trim()) return activeDayList;
    const q = searchQuery.toLowerCase();
    return activeDayList.filter(
      (e) =>
        e.description?.toLowerCase().includes(q) ||
        e.projectTag?.toLowerCase().includes(q),
    );
  }, [activeDayList, searchQuery]);

  // ── Handlers ────────────────────────────────────────────────
  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSave(form, mode) {
    setFormLoading(mode);
    try {
      const payload = {
        entryDate:   form.entryDate,
        startTime:   form.startTime,
        endTime:     form.endTime,
        description: form.description,
        projectTag:  form.projectTag || undefined,
      };

      if (editEntry) {
        await timesheetApi.updateEntry(editEntry.id, payload);
        toast.success("Entry updated.");

        if (mode === "submit") {
          await timesheetApi.submitEntries({ entryIds: [editEntry.id] });
          toast.success("Entry submitted for approval.");
        }
      } else {
        const createRes = await timesheetApi.createEntry(payload);
        toast.success("Entry saved.");

        // ✅ FIX 3: Use the returned entry ID directly instead of re-fetching
        // to find the newest draft (which was fragile and race-prone)
        if (mode === "submit") {
          const newId = createRes.entry?.id ?? createRes.id;
          if (newId) {
            await timesheetApi.submitEntries({ entryIds: [newId] });
            toast.success("Entry submitted for approval.");
          }
        }
      }

      setFormOpen(false);
      setEditEntry(null);
      fetchEntries();
      fetchSummary();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to save entry.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this draft entry?")) return;
    try {
      await timesheetApi.deleteEntry(id);
      toast.success("Entry deleted.");
      fetchEntries();
      fetchSummary();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to delete entry.");
    }
  }

  // ✅ FIX 4: Inline single-entry submit from EntryCard
  async function handleSubmitSingle(id) {
    try {
      await timesheetApi.submitEntries({ entryIds: [id] });
      toast.success("Entry submitted for approval.");
      fetchEntries();
      fetchSummary();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Submit failed.");
    }
  }

  function openSubmit(mode) {
    setSubmitMode(mode);
    setConfirmOpen(true);
  }

  async function handleConfirmSubmit() {
    setSubmitLoading(true);
    try {
      const ids = submitMode === "week" ? draftIds : selectedDrafts;
      if (ids.length === 0) {
        toast.error("No draft entries to submit.");
        return;
      }
      await timesheetApi.submitEntries({ entryIds: ids });
      toast.success(
        `${ids.length} ${ids.length === 1 ? "entry" : "entries"} submitted for approval.`,
      );
      setSelected(new Set());
      setConfirmOpen(false);
      fetchEntries();
      fetchSummary();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to submit entries.");
    } finally {
      setSubmitLoading(false);
    }
  }

  const submitCount = submitMode === "week" ? draftIds.length : selectedDrafts.length;

  // ─── RENDER ─────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: C.bg ?? "#F0F2F8", color: C.textPrimary }}
    >
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* ── TOP NAV ── */}
          <header
            className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{
              background: "rgba(240,242,248,0.85)",
              backdropFilter: "blur(12px)",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen((p) => !p)}
              className="p-2 rounded-xl hidden md:flex"
              style={{ background: C.surface, border: `1px solid ${C.border}`, cursor: "pointer" }}
            >
              <Menu size={16} color={C.textSecondary} />
            </Motion.button>

            <Motion.div className="flex-1 max-w-xs relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" color={C.textMuted} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search entries…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{
                  background: C.surface,
                  border: `1.5px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              />
            </Motion.div>

            <div className="flex items-center gap-2 ml-auto">
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { fetchEntries(); fetchSummary(); }}
                className="p-2 rounded-xl"
                style={{ background: C.surface, border: `1px solid ${C.border}`, cursor: "pointer" }}
                title="Refresh"
              >
                <RefreshCw size={14} color={C.textMuted} />
              </Motion.button>

              <Motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setEditEntry(null); setFormOpen(true); }}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white"
                style={{ background: C.primary }}
              >
                <Plus size={14} />
                Add Entry
              </Motion.button>

              {employee?.avatar ? (
                <img src={employee.avatar} alt={employee.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: "linear-gradient(135deg,#6366F1,#06B6D4)" }}
                >
                  {employee?.initials ?? "?"}
                </div>
              )}
            </div>
          </header>

          {/* ── SCROLLABLE MAIN ── */}
          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">

            {/* ── HERO BANNER ── */}
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg,#1E1B4B 0%,#312E81 55%,#1E40AF 100%)",
                minHeight: 140,
              }}
            >
              <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/15">
                      <Clock size={20} color="white" />
                    </div>
                    <div>
                      <h1
                        className="text-white text-2xl font-bold"
                        style={{ fontFamily: "Sora,sans-serif" }}
                      >
                        My Timesheets
                      </h1>
                      <p className="text-indigo-200 text-sm">
                        {employee
                          ? `Welcome back, ${employee.name.split(" ")[0]} — log your daily work activity`
                          : "Log your daily work activity"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {summary && (
                      <>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10">
                          <Clock size={12} color="rgba(255,255,255,0.7)" />
                          <span className="text-white/80 text-xs">
                            This week:{" "}
                            <strong className="text-white">{summary.totalHours ?? 0}h</strong>
                          </span>
                        </div>
                        {draftIds.length > 0 && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 border border-amber-300/30">
                            <FileText size={12} color="rgba(255,255,255,0.7)" />
                            <span className="text-white/80 text-xs">
                              <strong className="text-white">{draftIds.length}</strong>{" "}
                              draft{draftIds.length !== 1 ? "s" : ""} — submit for approval
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <Motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setEditEntry(null); setFormOpen(true); }}
                  className="sm:hidden flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-white/20 hover:bg-white/30 text-white self-start"
                >
                  <Plus size={16} />
                  Add Entry
                </Motion.button>
              </div>
            </Motion.div>

            {/* ── WEEKLY SUMMARY ── */}
            <WeeklySummary summary={summary} loading={sumLoading} />

            {/* ── WEEK NAVIGATOR ── */}
            <div
              className="rounded-2xl p-4 flex flex-col gap-4"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              <div className="flex items-center justify-between">
                <Motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setWeekStart((d) => addDays(d, -7))}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: C.surfaceAlt ?? "#F3F4F6", border: `1px solid ${C.border}` }}
                >
                  <ChevronLeft size={16} color={C.textSecondary} />
                </Motion.button>

                <div className="text-center">
                  <div className="font-bold text-sm" style={{ color: C.textPrimary }}>
                    {fmtWeekLabel(weekStart)}
                  </div>
                  {toISO(weekStart) === toISO(getMondayOf(new Date())) && (
                    <span className="text-xs" style={{ color: C.primary }}>This week</span>
                  )}
                </div>

                <Motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setWeekStart((d) => addDays(d, 7))}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: C.surfaceAlt ?? "#F3F4F6", border: `1px solid ${C.border}` }}
                >
                  <ChevronRight size={16} color={C.textSecondary} />
                </Motion.button>
              </div>

              {/* Day tabs */}
              <div className="grid grid-cols-7 gap-1">
                {weekDates.map((d, i) => {
                  const iso   = toISO(d);
                  const cnt   = (dayEntries[iso] ?? []).length;
                  const active = i === activeDay;
                  const today  = isToday(d);
                  return (
                    <Motion.button
                      key={iso}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setActiveDay(i)}
                      className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs"
                      style={{
                        background: active ? C.primary : today ? "#EEF2FF" : "transparent",
                        color: active ? "#fff" : today ? C.primary : C.textSecondary,
                        border: active ? "none" : today ? `1.5px solid ${C.primary}44` : "1.5px solid transparent",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <span className="font-medium">{DAY_NAMES[i]}</span>
                      <span className="font-bold text-sm">{d.getDate()}</span>
                      {cnt > 0 && (
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                          style={{
                            background: active ? "rgba(255,255,255,0.25)" : C.primary,
                            color: "#fff",
                          }}
                        >
                          {cnt}
                        </span>
                      )}
                    </Motion.button>
                  );
                })}
              </div>
            </div>

            {/* ── BULK ACTION BAR ── */}
            <AnimatePresence>
              {selectedDrafts.length > 0 && (
                <Motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                  style={{ background: "#EEF2FF", border: `1.5px solid ${C.primary}44` }}
                >
                  <span className="text-sm font-semibold" style={{ color: C.primary }}>
                    {selectedDrafts.length} draft{selectedDrafts.length !== 1 ? "s" : ""} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelected(new Set())}
                      className="text-xs px-3 py-1.5 rounded-lg"
                      style={{ color: C.textSecondary, background: "white", border: `1px solid ${C.border}` }}
                    >
                      Clear
                    </button>
                    <Motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => openSubmit("selected")}
                      className="flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-lg text-white"
                      style={{ background: C.primary }}
                    >
                      <Send size={13} />
                      Submit Selected
                    </Motion.button>
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>

            {/* ── DAY ENTRIES PANEL ── */}
            <div
              className="rounded-2xl p-5"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2
                    className="font-bold text-base"
                    style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
                  >
                    {weekDates[activeDay].toLocaleDateString("en-GB", {
                      weekday: "long", day: "numeric", month: "long",
                    })}
                  </h2>
                  {activeDayList.length > 0 && (
                    <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                      {activeDayList.length} {activeDayList.length === 1 ? "entry" : "entries"} ·{" "}
                      {activeDayList.reduce((s, e) => s + (e.durationMinutes ?? 0), 0)} mins total
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {draftIds.length > 0 && (
                    <Motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => openSubmit("week")}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
                      style={{ background: "#EEF2FF", color: C.primary, border: `1px solid ${C.primary}33` }}
                    >
                      <Send size={12} />
                      Submit Week ({draftIds.length})
                    </Motion.button>
                  )}
                  <Motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setEditEntry(null); setFormOpen(true); }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-white"
                    style={{ background: C.primary }}
                  >
                    <Plus size={12} />
                    Add Entry
                  </Motion.button>
                </div>
              </div>

              {loading ? (
                <div className="space-y-3">
                  <Skeleton h={90} />
                  <Skeleton h={90} />
                  <Skeleton h={90} />
                </div>
              ) : filteredActiveDayList.length === 0 ? (
                <Motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-14 flex flex-col items-center gap-3 text-center"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: "#F3F4F6" }}
                  >
                    <FileText size={24} color={C.textMuted} />
                  </div>
                  <p className="font-semibold text-sm" style={{ color: C.textSecondary }}>
                    {searchQuery ? "No entries match your search" : "No entries logged for this day yet"}
                  </p>
                  {!searchQuery && (
                    <>
                      <p className="text-xs" style={{ color: C.textMuted }}>
                        What did you work on? Add your first entry below.
                      </p>
                      <Motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setEditEntry(null); setFormOpen(true); }}
                        className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white mt-1"
                        style={{ background: C.primary, boxShadow: "0 2px 8px rgba(79,70,229,0.3)" }}
                      >
                        <Plus size={15} />
                        Add Entry
                      </Motion.button>
                    </>
                  )}
                </Motion.div>
              ) : (
                <AnimatePresence>
                  <div className="space-y-3">
                    {filteredActiveDayList.map((e) => (
                      <EntryCard
                        key={e.id}
                        entry={e}
                        selected={selected.has(e.id)}
                        onSelect={toggleSelect}
                        onEdit={(entry) => { setEditEntry(entry); setFormOpen(true); }}
                        onDelete={handleDelete}
                        onSubmit={handleSubmitSingle}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* ── MODALS ── */}
      <EntryFormModal
        open={formOpen}
        entry={editEntry}
        defaultDate={activeDateStr}
        onSave={handleSave}
        onClose={() => { setFormOpen(false); setEditEntry(null); }}
        loading={formLoading}
      />

      <ConfirmSubmitModal
        open={confirmOpen}
        count={submitCount}
        onConfirm={handleConfirmSubmit}
        onClose={() => setConfirmOpen(false)}
        loading={submitLoading}
      />
    </div>
  );
}