// // src/pages/Performance.jsx
// // Employee self-service performance page.
// // All data from API — zero mock data.
// // motion aliased as Motion throughout.

// import { useState, useEffect, useCallback, useMemo } from "react";
// import { motion as Motion, AnimatePresence } from "framer-motion";
// // import SideNavbar from "../components/SideNavbar";
// import {
//   BarChart2,
//   Target,
//   Star,
//   MessageSquare,
//   ChevronDown,
//   ChevronRight,
//   TrendingUp,
//   Award,
//   Users,
//   Clock,
//   CheckCircle2,
//   AlertCircle,
//   Zap,
//   Flame,
//   Eye,
//   ArrowUpRight,
//   Calendar,
//   Menu,
//   Bell,
//   Search,
//   Shield,
//   Sparkles,
//   Trophy,
//   RotateCcw,
//   Send,
//   X,
//   Info,
//   RefreshCw,
//   AlertTriangle,
//   Loader2,
//   Minus,
//   ArrowDownRight,
// } from "lucide-react";
// import C from "../styles/colors";
// import { authApi } from "../api/service/authApi";
// import {
//   getEmployeeScores,
//   getMyGoals,
//   getMyReviews,
//   getTrends,
//   getInsights,
//   submitSelfAssessment,
//   updateGoalProgress,
// } from "../api/service/performanceApi";

// // ── Constants ─────────────────────────────────────────────────
// const TABS = [
//   { id: "overview", label: "Overview" },
//   { id: "goals", label: "Goals" },
//   { id: "appraisals", label: "Appraisals" },
//   { id: "feedback", label: "Feedback" },
//   { id: "history", label: "History" },
// ];

// const PRIORITY_MAP = {
//   high: { color: C.danger, bg: C.dangerLight },
//   medium: { color: C.warning, bg: C.warningLight },
//   low: { color: C.success, bg: C.successLight },
// };

// const RATING_MAP = {
//   Outstanding: { color: "#059669", bg: "#D1FAE5" },
//   "High Performer": { color: "#2563EB", bg: "#DBEAFE" },
//   "Meets Expectations": { color: C.warning, bg: C.warningLight },
//   "Needs Improvement": { color: C.danger, bg: C.dangerLight },
//   Underperforming: { color: "#7C3AED", bg: "#F3E8FF" },
// };

// // ── Animations ────────────────────────────────────────────────
// const fadeUp = {
//   hidden: { opacity: 0, y: 16 },
//   visible: (i = 0) => ({
//     opacity: 1,
//     y: 0,
//     transition: { delay: i * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
//   }),
// };

// // ── Atoms ─────────────────────────────────────────────────────
// function Chip({ label, color, bg }) {
//   return (
//     <span
//       className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
//       style={{ background: bg ?? C.primaryLight, color: color ?? C.primary }}
//     >
//       {label}
//     </span>
//   );
// }

// function Card({ children, className = "" }) {
//   return (
//     <div
//       className={`rounded-2xl ${className}`}
//       style={{
//         background: C.surface,
//         border: `1px solid ${C.border}`,
//         boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
//       }}
//     >
//       {children}
//     </div>
//   );
// }

// function CardHead({ icon: Icon, title, sub, color, bg, action }) {
//   return (
//     <div
//       className="flex items-center gap-3 px-5 py-4"
//       style={{ borderBottom: `1px solid ${C.border}` }}
//     >
//       <div
//         className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
//         style={{ background: bg ?? C.primaryLight }}
//       >
//         <Icon size={15} color={color ?? C.primary} />
//       </div>
//       <div className="flex-1 min-w-0">
//         <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
//           {title}
//         </p>
//         {sub && (
//           <p className="text-[11px]" style={{ color: C.textMuted }}>
//             {sub}
//           </p>
//         )}
//       </div>
//       {action && <div className="shrink-0">{action}</div>}
//     </div>
//   );
// }

// function Skeleton({ h = 14, w = "100%" }) {
//   return (
//     <div
//       style={{
//         height: h,
//         width: w,
//         borderRadius: 8,
//         background:
//           "linear-gradient(90deg,#E4E7F0 25%,#F0F2F8 50%,#E4E7F0 75%)",
//         backgroundSize: "200% 100%",
//         animation: "shimmer 1.4s infinite linear",
//       }}
//     />
//   );
// }

// function Toast({ msg, type, onDone }) {
//   useEffect(() => {
//     const t = setTimeout(onDone, 3500);
//     return () => clearTimeout(t);
//   }, [onDone]);
//   const Icon = type === "success" ? CheckCircle2 : AlertCircle;
//   const color = type === "success" ? C.success : C.danger;
//   return (
//     <Motion.div
//       initial={{ opacity: 0, y: 40, x: "-50%" }}
//       animate={{ opacity: 1, y: 0, x: "-50%" }}
//       exit={{ opacity: 0, y: 40, x: "-50%" }}
//       className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl"
//       style={{
//         background: C.navy,
//         boxShadow: "0 12px 40px rgba(15,23,42,0.35)",
//         minWidth: 260,
//       }}
//     >
//       <Icon size={16} color={color} />
//       <span className="text-white text-sm font-semibold">{msg}</span>
//     </Motion.div>
//   );
// }

// // ── Score ring (SVG) ──────────────────────────────────────────
// function ScoreRing({ score, size = 120 }) {
//   const r = (size - 12) / 2;
//   const circ = 2 * Math.PI * r;
//   const dash = ((score ?? 0) / 100) * circ;
//   const color =
//     score >= 85
//       ? C.success
//       : score >= 60
//         ? C.primary
//         : score >= 40
//           ? C.warning
//           : C.danger;
//   return (
//     <div
//       className="relative flex items-center justify-center"
//       style={{ width: size, height: size }}
//     >
//       <svg width={size} height={size}>
//         <circle
//           cx={size / 2}
//           cy={size / 2}
//           r={r}
//           fill="none"
//           strokeWidth={10}
//           stroke={C.border}
//         />
//         <Motion.circle
//           cx={size / 2}
//           cy={size / 2}
//           r={r}
//           fill="none"
//           strokeWidth={10}
//           stroke={color}
//           strokeLinecap="round"
//           strokeDasharray={`${circ}`}
//           initial={{ strokeDashoffset: circ }}
//           animate={{ strokeDashoffset: circ - dash }}
//           transition={{ duration: 1.2, ease: "easeOut" }}
//           style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
//         />
//       </svg>
//       <div className="absolute flex flex-col items-center">
//         <span
//           className="text-3xl font-black"
//           style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
//         >
//           {score ?? "—"}
//         </span>
//         <span
//           className="text-[10px] font-semibold"
//           style={{ color: C.textMuted }}
//         >
//           / 100
//         </span>
//       </div>
//     </div>
//   );
// }

// // ── Mini trend chart (SVG) ────────────────────────────────────
// function TrendLine({ data }) {
//   if (!data?.length) return null;
//   const W = 220;
//   const H = 60;
//   const PAD = 8;
//   const scores = data.map((d) => d.score ?? d.final_score ?? 0);
//   const min = Math.min(...scores);
//   const max = Math.max(...scores, min + 1);
//   const pts = scores
//     .map((s, i) => {
//       const x = PAD + (i / Math.max(scores.length - 1, 1)) * (W - PAD * 2);
//       const y = H - PAD - ((s - min) / (max - min + 0.01)) * (H - PAD * 2);
//       return `${x},${y}`;
//     })
//     .join(" ");
//   const last = scores.at(-1);
//   const prev = scores.at(-2);
//   const trend =
//     prev == null
//       ? "new"
//       : last > prev + 2
//         ? "up"
//         : last < prev - 2
//           ? "down"
//           : "stable";
//   const color =
//     trend === "up" ? C.success : trend === "down" ? C.danger : C.primary;
//   return (
//     <div className="flex items-center gap-3">
//       <svg width={W} height={H} style={{ overflow: "visible" }}>
//         <polyline
//           points={pts}
//           fill="none"
//           stroke={color}
//           strokeWidth={2.5}
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />
//         {scores.map((s, i) => {
//           const x = PAD + (i / Math.max(scores.length - 1, 1)) * (W - PAD * 2);
//           const y = H - PAD - ((s - min) / (max - min + 0.01)) * (H - PAD * 2);
//           return (
//             <g key={i}>
//               <circle cx={x} cy={y} r={4} fill={color} />
//               <text
//                 x={x}
//                 y={y - 8}
//                 textAnchor="middle"
//                 fontSize={8}
//                 fill={C.textMuted}
//               >
//                 {s}
//               </text>
//             </g>
//           );
//         })}
//       </svg>
//       <div className="flex items-center gap-1">
//         {trend === "up" && <ArrowUpRight size={16} color={C.success} />}
//         {trend === "down" && <ArrowDownRight size={16} color={C.danger} />}
//         {trend === "stable" && <Minus size={16} color={C.textMuted} />}
//         <span className="text-xs font-semibold" style={{ color }}>
//           {trend === "new"
//             ? "First score"
//             : trend === "stable"
//               ? "Stable"
//               : `${trend === "up" ? "+" : ""}${(last - (prev ?? last)).toFixed(0)}`}
//         </span>
//       </div>
//     </div>
//   );
// }

// // ── Goal progress bar ─────────────────────────────────────────
// function GoalBar({ progress, label }) {
//   const color =
//     progress >= 100
//       ? C.success
//       : progress >= 60
//         ? C.primary
//         : progress >= 30
//           ? C.warning
//           : C.danger;
//   return (
//     <div>
//       <div className="flex items-center justify-between mb-1">
//         <span
//           className="text-xs font-medium"
//           style={{ color: C.textSecondary }}
//         >
//           {label}
//         </span>
//         <span className="text-xs font-bold" style={{ color }}>
//           {progress}%
//         </span>
//       </div>
//       <div
//         className="h-2 rounded-full overflow-hidden"
//         style={{ background: C.surfaceAlt }}
//       >
//         <Motion.div
//           className="h-full rounded-full"
//           initial={{ width: 0 }}
//           animate={{ width: `${progress}%` }}
//           transition={{ duration: 0.8, ease: "easeOut" }}
//           style={{ background: color }}
//         />
//       </div>
//     </div>
//   );
// }

// // ── Self Assessment Modal ─────────────────────────────────────
// function AssessmentModal({ review, onClose, onSubmitted }) {
//   const [answers, setAnswers] = useState({});
//   const [comment, setComment] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async () => {
//     setSaving(true);
//     try {
//       await submitSelfAssessment(review.id, {
//         sections: answers,
//         overallComment: comment,
//       });
//       onSubmitted();
//     } catch (err) {
//       setError(err?.response?.data?.message ?? "Failed to submit assessment.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-50 flex items-center justify-center p-5"
//       style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
//       onClick={onClose}
//     >
//       <Motion.div
//         initial={{ scale: 0.93, y: 20 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.93, y: 20 }}
//         transition={{ type: "spring", stiffness: 260, damping: 24 }}
//         className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
//         style={{
//           background: C.surface,
//           boxShadow: "0 24px 64px rgba(15,23,42,0.2)",
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div
//           className="px-5 py-4 flex items-center justify-between shrink-0"
//           style={{ borderBottom: `1px solid ${C.border}` }}
//         >
//           <div className="flex items-center gap-2">
//             <div
//               className="w-8 h-8 rounded-xl flex items-center justify-center"
//               style={{ background: C.primaryLight }}
//             >
//               <Star size={14} color={C.primary} />
//             </div>
//             <div>
//               <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
//                 Self Assessment
//               </p>
//               <p className="text-[10px]" style={{ color: C.textMuted }}>
//                 {review.cycle_name ?? review.cycle ?? "Current Cycle"}
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="w-7 h-7 rounded-xl flex items-center justify-center"
//             style={{ background: C.surfaceAlt }}
//           >
//             <X size={13} color={C.textMuted} />
//           </button>
//         </div>

//         <div className="flex-1 overflow-y-auto p-5 space-y-4">
//           {error && (
//             <div
//               className="flex items-center gap-2 p-3 rounded-xl"
//               style={{ background: C.dangerLight }}
//             >
//               <AlertTriangle size={13} color={C.danger} />
//               <p className="text-xs" style={{ color: C.danger }}>
//                 {error}
//               </p>
//             </div>
//           )}

//           {/* Dynamic sections from review */}
//           {(
//             review.sections ?? [
//               { key: "achievements", label: "Key Achievements this period" },
//               {
//                 key: "challenges",
//                 label: "Challenges faced & how you overcame them",
//               },
//               { key: "goals_progress", label: "Progress on assigned goals" },
//               {
//                 key: "development",
//                 label: "Skills developed / training completed",
//               },
//               { key: "next_period", label: "Goals & focus for next period" },
//             ]
//           ).map((section) => (
//             <div key={section.key ?? section.id}>
//               <label
//                 className="block text-xs font-semibold mb-1"
//                 style={{ color: C.textPrimary }}
//               >
//                 {section.label ?? section.title}
//               </label>
//               <textarea
//                 rows={3}
//                 value={answers[section.key ?? section.id] ?? ""}
//                 onChange={(e) =>
//                   setAnswers((p) => ({
//                     ...p,
//                     [section.key ?? section.id]: e.target.value,
//                   }))
//                 }
//                 placeholder="Write your response here..."
//                 className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
//                 style={{
//                   background: C.surfaceAlt,
//                   border: `1.5px solid ${C.border}`,
//                   color: C.textPrimary,
//                 }}
//               />
//             </div>
//           ))}

//           <div>
//             <label
//               className="block text-xs font-semibold mb-1"
//               style={{ color: C.textPrimary }}
//             >
//               Overall Comments
//             </label>
//             <textarea
//               rows={3}
//               value={comment}
//               onChange={(e) => setComment(e.target.value)}
//               placeholder="Any additional comments for your reviewer..."
//               className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
//               style={{
//                 background: C.surfaceAlt,
//                 border: `1.5px solid ${C.border}`,
//                 color: C.textPrimary,
//               }}
//             />
//           </div>
//         </div>

//         <div className="flex gap-3 px-5 pb-5 shrink-0">
//           <button
//             onClick={onClose}
//             className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
//             style={{
//               background: C.surfaceAlt,
//               border: `1px solid ${C.border}`,
//               color: C.textSecondary,
//             }}
//           >
//             Cancel
//           </button>
//           <Motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={handleSubmit}
//             disabled={saving}
//             className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
//             style={{ background: C.primary, opacity: saving ? 0.8 : 1 }}
//           >
//             {saving ? (
//               <Loader2 size={13} className="animate-spin" />
//             ) : (
//               <Send size={13} />
//             )}
//             Submit Assessment
//           </Motion.button>
//         </div>
//       </Motion.div>
//     </Motion.div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════
// export default function PerformancePage() {
//   const [user, setUser] = useState(null);
//   const [employee, setEmployee] = useState(null);
//   const [scores, setScores] = useState([]); // history
//   const [latestScore, setLatestScore] = useState(null);
//   const [trends, setTrends] = useState([]);
//   const [goals, setGoals] = useState([]);
//   const [reviews, setReviews] = useState([]);
//   const [insights, setInsights] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchFocused, setSearchFocused] = useState(false);
//   const [activeTab, setActiveTab] = useState("overview");
//   const [expandedGoal, setExpandedGoal] = useState(null);
//   const [assessModal, setAssessModal] = useState(null);
//   const [toast, setToast] = useState(null);

//   const showToast = (msg, type = "success") => setToast({ msg, type });

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       // 1. Fetch current user
//       const me = await authApi.getMe();
//       setUser(me);
//       const empId = me.employee_id ?? me.employeeId;
//       if (!empId)
//         throw new Error("No employee profile linked to this account.");

//       const emp = {
//         id: empId,
//         name: `${me.firstName ?? me.first_name} ${me.lastName ?? me.last_name}`,
//         initials:
//           `${(me.firstName ?? me.first_name ?? "?")[0]}${(me.lastName ?? me.last_name ?? "?")[0]}`.toUpperCase(),
//         role: me.role,
//         department: me.company?.name ?? "",
//         email: me.email,
//       };
//       setEmployee(emp);

//       // 2. Parallel fetch
//       const [scoresRes, goalsRes, reviewsRes, trendsRes, insightsRes] =
//         await Promise.allSettled([
//           getEmployeeScores(empId),
//           getMyGoals(),
//           getMyReviews(),
//           getTrends(empId),
//           getInsights(empId),
//         ]);

//       const scoreData =
//         scoresRes.status === "fulfilled" ? (scoresRes.value?.data ?? []) : [];
//       const goalsData =
//         goalsRes.status === "fulfilled" ? (goalsRes.value?.data ?? []) : [];
//       const reviewsData =
//         reviewsRes.status === "fulfilled" ? (reviewsRes.value?.data ?? []) : [];
//       const trendsData =
//         trendsRes.status === "fulfilled"
//           ? (trendsRes.value?.data ?? trendsRes.value?.trends ?? [])
//           : [];
//       const insightData =
//         insightsRes.status === "fulfilled" ? (insightsRes.value ?? []) : [];

//       setScores(scoreData);
//       setLatestScore(scoreData[0] ?? null);
//       setTrends(trendsData);
//       setGoals(goalsData);
//       setReviews(reviewsData);
//       setInsights(insightData);
//     } catch (err) {
//       setError(
//         err?.response?.data?.message ??
//           err.message ??
//           "Failed to load performance data.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     load();
//   }, [load]);

//   // Derived counts
//   const pendingReviews = reviews.filter(
//     (r) => r.status?.toLowerCase() === "pending",
//   );
//   const completedGoals = goals.filter(
//     (g) => g.status?.toLowerCase() === "completed" || g.progress >= 100,
//   );
//   const inProgressGoals = goals.filter(
//     (g) => g.status?.toLowerCase() === "in_progress" && g.progress < 100,
//   );

//   // Filtered goals by search
//   const filteredGoals = useMemo(() => {
//     const q = searchQuery.toLowerCase();
//     return goals.filter(
//       (g) =>
//         !q ||
//         g.title?.toLowerCase().includes(q) ||
//         g.description?.toLowerCase().includes(q),
//     );
//   }, [goals, searchQuery]);

//   const ratingCfg = RATING_MAP[latestScore?.rating] ?? {
//     color: C.textMuted,
//     bg: C.surfaceAlt,
//   };

//   if (loading)
//     return (
//       <div
//         className="min-h-screen flex items-center justify-center"
//         style={{ background: C.bg }}
//       >
//         <Loader2
//           size={28}
//           className="animate-spin"
//           style={{ color: C.primary }}
//         />
//       </div>
//     );

//   return (
//     <div
//       className="min-h-screen"
//       style={{
//         background: C.bg,
//         color: C.textPrimary,
//         fontFamily: "'DM Sans','Sora',sans-serif",
//       }}
//     >
//       <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>

//       <div className="flex h-screen overflow-hidden">
//         {/* <SideNavbar
//           sidebarOpen={sidebarOpen}
//           COLORS={C}
//           EMPLOYEE={employee ?? {}}
//         /> */}

//         <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
//           {/* TOPBAR */}
//           <header
//             className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
//             style={{
//               background: "rgba(240,242,248,0.9)",
//               backdropFilter: "blur(12px)",
//               borderBottom: `1px solid ${C.border}`,
//             }}
//           >
//             <Motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setSidebarOpen((p) => !p)}
//               className="p-2 rounded-xl hidden md:flex"
//               style={{ background: C.surface }}
//             >
//               <Menu size={16} color={C.textSecondary} />
//             </Motion.button>

//             <Motion.div
//               className="flex-1 max-w-xs relative"
//               animate={{ width: searchFocused ? "320px" : "240px" }}
//             >
//               <Search
//                 size={14}
//                 className="absolute left-3 top-1/2 -translate-y-1/2"
//                 color={C.textMuted}
//               />
//               <input
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 onFocus={() => setSearchFocused(true)}
//                 onBlur={() => setSearchFocused(false)}
//                 placeholder="Search goals..."
//                 className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
//                 style={{
//                   background: C.surface,
//                   border: `1.5px solid ${searchFocused ? C.primary : C.border}`,
//                   color: C.textPrimary,
//                 }}
//               />
//             </Motion.div>

//             <div className="flex items-center gap-2 ml-auto">
//               <Motion.button
//                 whileHover={{ scale: 1.05 }}
//                 onClick={load}
//                 className="w-8 h-8 rounded-xl flex items-center justify-center"
//                 style={{
//                   background: C.surface,
//                   border: `1px solid ${C.border}`,
//                 }}
//               >
//                 <RefreshCw size={14} color={C.textSecondary} />
//               </Motion.button>
//               <div className="relative">
//                 <Motion.button
//                   className="p-2 rounded-xl"
//                   style={{
//                     background: C.surface,
//                     border: `1px solid ${C.border}`,
//                   }}
//                 >
//                   <Bell size={16} color={C.textSecondary} />
//                 </Motion.button>
//                 {pendingReviews.length > 0 && (
//                   <span
//                     className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
//                     style={{ background: C.warning }}
//                   >
//                     {pendingReviews.length}
//                   </span>
//                 )}
//               </div>
//               {employee && (
//                 <div
//                   className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
//                   style={{
//                     background: "linear-gradient(135deg,#4F46E5,#06B6D4)",
//                   }}
//                 >
//                   {employee.initials}
//                 </div>
//               )}
//             </div>
//           </header>

//           <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
//             {/* Hero banner */}
//             <Motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="rounded-2xl p-6 text-white relative overflow-hidden"
//               style={{
//                 background:
//                   "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
//               }}
//             >
//               <div className="absolute inset-0 opacity-5">
//                 <div
//                   className="absolute top-0 right-0 w-72 h-72 rounded-full"
//                   style={{
//                     background:
//                       "radial-gradient(circle,#fff 0%,transparent 70%)",
//                     transform: "translate(30%,-30%)",
//                   }}
//                 />
//               </div>
//               <div className="relative flex items-center gap-5">
//                 <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/15 shrink-0">
//                   <BarChart2 size={30} />
//                 </div>
//                 <div className="flex-1">
//                   <h1
//                     className="text-2xl font-bold"
//                     style={{ fontFamily: "Sora,sans-serif" }}
//                   >
//                     Performance
//                   </h1>
//                   <p className="text-indigo-200 text-sm mt-0.5">
//                     {employee?.name ?? "Employee"} ·{" "}
//                     {latestScore ? (
//                       <span>
//                         Current Score:{" "}
//                         <strong>{latestScore.final_score}</strong> —{" "}
//                         {latestScore.rating}
//                       </span>
//                     ) : (
//                       "No score data yet"
//                     )}
//                   </p>
//                 </div>
//                 {latestScore && (
//                   <div className="shrink-0">
//                     <Chip
//                       label={latestScore.rating}
//                       color={ratingCfg.color}
//                       bg={ratingCfg.bg}
//                     />
//                   </div>
//                 )}
//               </div>
//             </Motion.div>

//             {/* Error */}
//             {error && (
//               <div
//                 className="rounded-xl p-4 flex items-center gap-3"
//                 style={{ background: C.dangerLight }}
//               >
//                 <AlertTriangle size={16} color={C.danger} />
//                 <p className="text-sm" style={{ color: C.danger }}>
//                   {error}
//                 </p>
//               </div>
//             )}

//             {/* Pending review alert */}
//             {pendingReviews.length > 0 && (
//               <Motion.div
//                 initial={{ opacity: 0, y: -8 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="rounded-2xl p-4 flex items-center gap-3"
//                 style={{
//                   background: C.warningLight,
//                   border: `1px solid ${C.warning}44`,
//                 }}
//               >
//                 <div
//                   className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
//                   style={{ background: C.warning }}
//                 >
//                   <Star size={15} color="#fff" />
//                 </div>
//                 <div className="flex-1">
//                   <p
//                     className="font-semibold text-sm"
//                     style={{ color: C.textPrimary }}
//                   >
//                     {pendingReviews.length} appraisal
//                     {pendingReviews.length > 1 ? "s" : ""} pending your
//                     self-assessment
//                   </p>
//                   <p
//                     className="text-xs mt-0.5"
//                     style={{ color: C.textSecondary }}
//                   >
//                     Complete your self-assessment to keep the review cycle on
//                     track.
//                   </p>
//                 </div>
//                 <Motion.button
//                   whileHover={{ scale: 1.04 }}
//                   whileTap={{ scale: 0.97 }}
//                   onClick={() => setActiveTab("appraisals")}
//                   className="text-xs font-bold px-3 py-1.5 rounded-xl shrink-0"
//                   style={{ background: C.warning, color: "#fff" }}
//                 >
//                   Review Now
//                 </Motion.button>
//               </Motion.div>
//             )}

//             {/* Tabs */}
//             <div
//               className="flex gap-1 p-1 rounded-2xl overflow-x-auto"
//               style={{
//                 background: C.surface,
//                 border: `1px solid ${C.border}`,
//                 scrollbarWidth: "none",
//               }}
//             >
//               {TABS.map((t) => {
//                 const active = activeTab === t.id;
//                 return (
//                   <Motion.button
//                     key={t.id}
//                     whileTap={{ scale: 0.97 }}
//                     onClick={() => setActiveTab(t.id)}
//                     className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0"
//                     style={{
//                       background: active ? C.primary : "transparent",
//                       color: active ? "#fff" : C.textSecondary,
//                       boxShadow: active
//                         ? "0 2px 8px rgba(79,70,229,0.25)"
//                         : "none",
//                     }}
//                   >
//                     {t.label}
//                   </Motion.button>
//                 );
//               })}
//             </div>

//             {/* ─── TAB CONTENT ─── */}
//             <AnimatePresence mode="wait">
//               {/* OVERVIEW */}
//               {activeTab === "overview" && (
//                 <Motion.div
//                   key="overview"
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="space-y-5"
//                 >
//                   {/* Score + stats row */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                     {/* Score ring */}
//                     <Card className="p-6 flex items-center gap-6">
//                       <ScoreRing score={latestScore?.final_score} />
//                       <div className="flex-1 space-y-3">
//                         <div>
//                           <p
//                             className="text-xs"
//                             style={{ color: C.textSecondary }}
//                           >
//                             Current Rating
//                           </p>
//                           {latestScore?.rating ? (
//                             <Chip
//                               label={latestScore.rating}
//                               color={ratingCfg.color}
//                               bg={ratingCfg.bg}
//                             />
//                           ) : (
//                             <p
//                               className="text-sm font-semibold"
//                               style={{ color: C.textMuted }}
//                             >
//                               No data
//                             </p>
//                           )}
//                         </div>
//                         <div>
//                           <p
//                             className="text-xs"
//                             style={{ color: C.textSecondary }}
//                           >
//                             Period
//                           </p>
//                           <p
//                             className="font-semibold text-sm"
//                             style={{ color: C.textPrimary }}
//                           >
//                             {latestScore?.period ?? "—"}
//                           </p>
//                         </div>
//                         <div className="grid grid-cols-3 gap-2">
//                           {[
//                             {
//                               label: "KPI",
//                               value: latestScore?.kpi_score ?? "—",
//                             },
//                             {
//                               label: "Attendance",
//                               value: latestScore?.attendance_score ?? "—",
//                             },
//                             {
//                               label: "Training",
//                               value: latestScore?.training_score ?? "—",
//                             },
//                           ].map((s) => (
//                             <div
//                               key={s.label}
//                               className="rounded-xl p-2 text-center"
//                               style={{ background: C.surfaceAlt }}
//                             >
//                               <p
//                                 className="text-sm font-black"
//                                 style={{ color: C.textPrimary }}
//                               >
//                                 {s.value}
//                               </p>
//                               <p
//                                 className="text-[9px] font-semibold"
//                                 style={{ color: C.textMuted }}
//                               >
//                                 {s.label}
//                               </p>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </Card>

//                     {/* Trend */}
//                     <Card className="p-6">
//                       <CardHead
//                         icon={TrendingUp}
//                         title="Score Trend"
//                         sub="Monthly performance history"
//                         color={C.success}
//                         bg={C.successLight}
//                       />
//                       <div className="p-4">
//                         {trends.length === 0 ? (
//                           <p
//                             className="text-sm text-center py-6"
//                             style={{ color: C.textMuted }}
//                           >
//                             No trend data yet
//                           </p>
//                         ) : (
//                           <>
//                             <TrendLine data={trends.slice(-6)} />
//                             <div className="flex gap-2 mt-3 overflow-x-auto">
//                               {trends.slice(-6).map((t, i) => (
//                                 <div key={i} className="text-center shrink-0">
//                                   <p
//                                     className="text-[10px]"
//                                     style={{ color: C.textMuted }}
//                                   >
//                                     {t.period?.slice(-5)}
//                                   </p>
//                                   <p
//                                     className="text-xs font-bold"
//                                     style={{ color: C.textPrimary }}
//                                   >
//                                     {t.score ?? t.final_score}
//                                   </p>
//                                 </div>
//                               ))}
//                             </div>
//                           </>
//                         )}
//                       </div>
//                     </Card>
//                   </div>

//                   {/* Insights */}
//                   {insights.length > 0 && (
//                     <Card>
//                       <CardHead
//                         icon={Sparkles}
//                         title="Performance Insights"
//                         sub="Auto-generated analysis"
//                         color="#7C3AED"
//                         bg="#F3E8FF"
//                       />
//                       <div className="p-4 space-y-2">
//                         {insights.map((ins, i) => {
//                           const cfg = {
//                             positive: {
//                               color: C.success,
//                               bg: C.successLight,
//                               icon: TrendingUp,
//                             },
//                             warning: {
//                               color: C.danger,
//                               bg: C.dangerLight,
//                               icon: AlertCircle,
//                             },
//                             leadership: {
//                               color: "#7C3AED",
//                               bg: "#F3E8FF",
//                               icon: Trophy,
//                             },
//                             pip: {
//                               color: C.danger,
//                               bg: C.dangerLight,
//                               icon: AlertTriangle,
//                             },
//                           }[ins.type] ?? {
//                             color: C.primary,
//                             bg: C.primaryLight,
//                             icon: Info,
//                           };
//                           const Icon = cfg.icon;
//                           return (
//                             <Motion.div
//                               key={i}
//                               custom={i}
//                               variants={fadeUp}
//                               initial="hidden"
//                               animate="visible"
//                               className="flex items-center gap-3 p-3 rounded-xl"
//                               style={{
//                                 background: cfg.bg,
//                                 border: `1px solid ${cfg.color}22`,
//                               }}
//                             >
//                               <Icon
//                                 size={14}
//                                 color={cfg.color}
//                                 className="shrink-0"
//                               />
//                               <p
//                                 className="text-xs font-medium"
//                                 style={{ color: cfg.color }}
//                               >
//                                 {ins.message}
//                               </p>
//                             </Motion.div>
//                           );
//                         })}
//                       </div>
//                     </Card>
//                   )}

//                   {/* Quick stats */}
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     {[
//                       {
//                         label: "Goals In Progress",
//                         value: inProgressGoals.length,
//                         icon: Target,
//                         color: C.primary,
//                         bg: C.primaryLight,
//                       },
//                       {
//                         label: "Goals Completed",
//                         value: completedGoals.length,
//                         icon: CheckCircle2,
//                         color: C.success,
//                         bg: C.successLight,
//                       },
//                       {
//                         label: "Pending Reviews",
//                         value: pendingReviews.length,
//                         icon: Clock,
//                         color: C.warning,
//                         bg: C.warningLight,
//                       },
//                       {
//                         label: "Total Reviews",
//                         value: reviews.length,
//                         icon: Award,
//                         color: "#7C3AED",
//                         bg: "#F3E8FF",
//                       },
//                     ].map((s, i) => (
//                       <Motion.div
//                         key={s.label}
//                         custom={i}
//                         variants={fadeUp}
//                         initial="hidden"
//                         animate="visible"
//                         whileHover={{ y: -2 }}
//                         className="rounded-2xl p-4 flex items-center gap-3"
//                         style={{
//                           background: C.surface,
//                           border: `1px solid ${C.border}`,
//                         }}
//                       >
//                         <div
//                           className="w-9 h-9 rounded-xl flex items-center justify-center"
//                           style={{ background: s.bg }}
//                         >
//                           <s.icon size={16} color={s.color} />
//                         </div>
//                         <div>
//                           <p
//                             className="text-xl font-black"
//                             style={{ color: C.textPrimary }}
//                           >
//                             {s.value}
//                           </p>
//                           <p
//                             className="text-[11px]"
//                             style={{ color: C.textSecondary }}
//                           >
//                             {s.label}
//                           </p>
//                         </div>
//                       </Motion.div>
//                     ))}
//                   </div>
//                 </Motion.div>
//               )}

//               {/* GOALS */}
//               {activeTab === "goals" && (
//                 <Motion.div
//                   key="goals"
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="space-y-4"
//                 >
//                   <Card>
//                     <CardHead
//                       icon={Target}
//                       title="My Goals & KPIs"
//                       sub={`${goals.length} goals · ${completedGoals.length} completed`}
//                       action={
//                         <Chip label={`${inProgressGoals.length} active`} />
//                       }
//                     />
//                     <div className="p-4 space-y-3">
//                       {filteredGoals.length === 0 ? (
//                         <div className="py-12 text-center">
//                           <Target
//                             size={36}
//                             color={C.textMuted}
//                             className="mx-auto mb-2"
//                           />
//                           <p
//                             className="font-semibold text-sm"
//                             style={{ color: C.textSecondary }}
//                           >
//                             {searchQuery
//                               ? "No goals match your search"
//                               : "No goals assigned yet"}
//                           </p>
//                         </div>
//                       ) : (
//                         filteredGoals.map((goal, i) => {
//                           const isExpanded = expandedGoal === goal.id;
//                           const priorityCfg =
//                             PRIORITY_MAP[goal.priority?.toLowerCase()] ??
//                             PRIORITY_MAP.medium;
//                           const isCompleted =
//                             goal.status?.toLowerCase() === "completed" ||
//                             goal.progress >= 100;

//                           return (
//                             <Motion.div
//                               key={goal.id}
//                               custom={i}
//                               variants={fadeUp}
//                               initial="hidden"
//                               animate="visible"
//                               className="rounded-2xl border overflow-hidden"
//                               style={{
//                                 borderColor: C.border,
//                                 background: C.surface,
//                               }}
//                             >
//                               <button
//                                 onClick={() =>
//                                   setExpandedGoal(isExpanded ? null : goal.id)
//                                 }
//                                 className="w-full flex items-center gap-4 p-4 text-left"
//                                 onMouseEnter={(e) =>
//                                   (e.currentTarget.style.background =
//                                     C.surfaceAlt)
//                                 }
//                                 onMouseLeave={(e) =>
//                                   (e.currentTarget.style.background =
//                                     "transparent")
//                                 }
//                               >
//                                 <div
//                                   className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
//                                   style={{
//                                     background: isCompleted
//                                       ? C.successLight
//                                       : C.primaryLight,
//                                   }}
//                                 >
//                                   {isCompleted ? (
//                                     <CheckCircle2 size={16} color={C.success} />
//                                   ) : (
//                                     <Target size={16} color={C.primary} />
//                                   )}
//                                 </div>
//                                 <div className="flex-1 min-w-0">
//                                   <div className="flex items-center gap-2 flex-wrap mb-1.5">
//                                     <p
//                                       className="font-semibold text-sm truncate"
//                                       style={{ color: C.textPrimary }}
//                                     >
//                                       {goal.title}
//                                     </p>
//                                     <Chip
//                                       label={goal.priority ?? "medium"}
//                                       color={priorityCfg.color}
//                                       bg={priorityCfg.bg}
//                                     />
//                                     {isCompleted && (
//                                       <Chip
//                                         label="✓ Complete"
//                                         color={C.success}
//                                         bg={C.successLight}
//                                       />
//                                     )}
//                                   </div>
//                                   <GoalBar
//                                     progress={goal.progress ?? 0}
//                                     label={`${goal.progress ?? 0}% complete`}
//                                   />
//                                 </div>
//                                 <div className="shrink-0 flex items-center gap-2">
//                                   <p
//                                     className="text-[11px]"
//                                     style={{ color: C.textMuted }}
//                                   >
//                                     {goal.due_date ?? goal.dueDate ?? "—"}
//                                   </p>
//                                   <Motion.div
//                                     animate={{ rotate: isExpanded ? 180 : 0 }}
//                                   >
//                                     <ChevronDown
//                                       size={14}
//                                       color={C.textMuted}
//                                     />
//                                   </Motion.div>
//                                 </div>
//                               </button>

//                               <AnimatePresence>
//                                 {isExpanded && (
//                                   <Motion.div
//                                     initial={{ height: 0, opacity: 0 }}
//                                     animate={{ height: "auto", opacity: 1 }}
//                                     exit={{ height: 0, opacity: 0 }}
//                                     transition={{ duration: 0.22 }}
//                                     className="overflow-hidden"
//                                   >
//                                     <div
//                                       className="px-4 pb-4 pt-0 space-y-3"
//                                       style={{
//                                         borderTop: `1px solid ${C.border}`,
//                                       }}
//                                     >
//                                       {goal.description && (
//                                         <p
//                                           className="text-xs leading-relaxed pt-3"
//                                           style={{ color: C.textSecondary }}
//                                         >
//                                           {goal.description}
//                                         </p>
//                                       )}
//                                       {(goal.kpis ?? []).length > 0 && (
//                                         <div>
//                                           <p
//                                             className="text-[10px] font-bold mb-1.5"
//                                             style={{ color: C.textMuted }}
//                                           >
//                                             KPIs
//                                           </p>
//                                           <div className="space-y-1">
//                                             {goal.kpis.map((kpi, j) => (
//                                               <div
//                                                 key={j}
//                                                 className="flex items-center gap-2"
//                                               >
//                                                 <CheckCircle2
//                                                   size={11}
//                                                   color={C.success}
//                                                 />
//                                                 <span
//                                                   className="text-xs"
//                                                   style={{
//                                                     color: C.textSecondary,
//                                                   }}
//                                                 >
//                                                   {kpi}
//                                                 </span>
//                                               </div>
//                                             ))}
//                                           </div>
//                                         </div>
//                                       )}
//                                       <div
//                                         className="flex items-center gap-2 text-xs"
//                                         style={{ color: C.textMuted }}
//                                       >
//                                         <Calendar size={11} />
//                                         <span>
//                                           Due:{" "}
//                                           {goal.due_date ?? goal.dueDate ?? "—"}
//                                         </span>
//                                         {goal.metric && (
//                                           <>
//                                             <span>·</span>
//                                             <span>Metric: {goal.metric}</span>
//                                           </>
//                                         )}
//                                       </div>
//                                     </div>
//                                   </Motion.div>
//                                 )}
//                               </AnimatePresence>
//                             </Motion.div>
//                           );
//                         })
//                       )}
//                     </div>
//                   </Card>
//                 </Motion.div>
//               )}

//               {/* APPRAISALS */}
//               {activeTab === "appraisals" && (
//                 <Motion.div
//                   key="appraisals"
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="space-y-4"
//                 >
//                   <Card>
//                     <CardHead
//                       icon={Star}
//                       title="My Appraisals"
//                       sub="Self-assessments and review cycles"
//                       action={
//                         pendingReviews.length > 0 ? (
//                           <Chip
//                             label={`${pendingReviews.length} pending`}
//                             color={C.warning}
//                             bg={C.warningLight}
//                           />
//                         ) : null
//                       }
//                     />
//                     <div className="p-4 space-y-3">
//                       {reviews.length === 0 ? (
//                         <div className="py-12 text-center">
//                           <Star
//                             size={36}
//                             color={C.textMuted}
//                             className="mx-auto mb-2"
//                           />
//                           <p
//                             className="font-semibold text-sm"
//                             style={{ color: C.textSecondary }}
//                           >
//                             No appraisals yet
//                           </p>
//                         </div>
//                       ) : (
//                         reviews.map((rev, i) => {
//                           const isPending =
//                             rev.status?.toLowerCase() === "pending";
//                           const isSelf =
//                             rev.status?.toLowerCase() === "self_completed";
//                           const isDone =
//                             rev.status?.toLowerCase() === "finalized";
//                           return (
//                             <Motion.div
//                               key={rev.id}
//                               custom={i}
//                               variants={fadeUp}
//                               initial="hidden"
//                               animate="visible"
//                               className="flex items-center gap-4 p-4 rounded-2xl"
//                               style={{
//                                 background: C.surfaceAlt,
//                                 border: `1px solid ${C.border}`,
//                               }}
//                             >
//                               <div
//                                 className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
//                                 style={{
//                                   background: isDone
//                                     ? C.successLight
//                                     : isPending
//                                       ? C.warningLight
//                                       : C.primaryLight,
//                                 }}
//                               >
//                                 {isDone ? (
//                                   <CheckCircle2 size={18} color={C.success} />
//                                 ) : isPending ? (
//                                   <Clock size={18} color={C.warning} />
//                                 ) : (
//                                   <Star size={18} color={C.primary} />
//                                 )}
//                               </div>
//                               <div className="flex-1 min-w-0">
//                                 <div className="flex items-center gap-2 flex-wrap mb-1">
//                                   <p
//                                     className="font-semibold text-sm"
//                                     style={{ color: C.textPrimary }}
//                                   >
//                                     {rev.cycle_name ??
//                                       rev.cycle ??
//                                       "Review Cycle"}
//                                   </p>
//                                   <Chip
//                                     label={
//                                       isDone
//                                         ? "Finalized"
//                                         : isPending
//                                           ? "Pending"
//                                           : isSelf
//                                             ? "Self Done"
//                                             : rev.status
//                                     }
//                                     color={
//                                       isDone
//                                         ? C.success
//                                         : isPending
//                                           ? C.warning
//                                           : C.primary
//                                     }
//                                     bg={
//                                       isDone
//                                         ? C.successLight
//                                         : isPending
//                                           ? C.warningLight
//                                           : C.primaryLight
//                                     }
//                                   />
//                                 </div>
//                                 {rev.created_at && (
//                                   <p
//                                     className="text-[11px]"
//                                     style={{ color: C.textMuted }}
//                                   >
//                                     Created{" "}
//                                     {new Date(
//                                       rev.created_at,
//                                     ).toLocaleDateString("en-NG")}
//                                   </p>
//                                 )}
//                               </div>
//                               {isPending && (
//                                 <Motion.button
//                                   whileHover={{ scale: 1.04 }}
//                                   whileTap={{ scale: 0.97 }}
//                                   onClick={() => setAssessModal(rev)}
//                                   className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white shrink-0"
//                                   style={{
//                                     background: `linear-gradient(135deg,${C.primary},#6366F1)`,
//                                   }}
//                                 >
//                                   <Send size={11} /> Start Assessment
//                                 </Motion.button>
//                               )}
//                             </Motion.div>
//                           );
//                         })
//                       )}
//                     </div>
//                   </Card>
//                 </Motion.div>
//               )}

//               {/* FEEDBACK */}
//               {activeTab === "feedback" && (
//                 <Motion.div
//                   key="feedback"
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="space-y-4"
//                 >
//                   <Card>
//                     <CardHead
//                       icon={MessageSquare}
//                       title="Manager Feedback"
//                       sub="Comments from your performance reviews"
//                     />
//                     <div className="p-4 space-y-4">
//                       {scores.length === 0 ? (
//                         <div className="py-12 text-center">
//                           <MessageSquare
//                             size={36}
//                             color={C.textMuted}
//                             className="mx-auto mb-2"
//                           />
//                           <p
//                             className="font-semibold text-sm"
//                             style={{ color: C.textSecondary }}
//                           >
//                             No feedback yet
//                           </p>
//                         </div>
//                       ) : (
//                         reviews
//                           .filter((r) => r.manager_comment)
//                           .map((rev, i) => (
//                             <Motion.div
//                               key={rev.id}
//                               custom={i}
//                               variants={fadeUp}
//                               initial="hidden"
//                               animate="visible"
//                               className="p-4 rounded-2xl"
//                               style={{
//                                 background: C.surfaceAlt,
//                                 border: `1px solid ${C.border}`,
//                               }}
//                             >
//                               <div className="flex items-center gap-2 mb-2">
//                                 <div
//                                   className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
//                                   style={{
//                                     background:
//                                       "linear-gradient(135deg,#6366F1,#8B5CF6)",
//                                   }}
//                                 >
//                                   {rev.reviewed_by_name
//                                     ?.split(" ")
//                                     .map((n) => n[0])
//                                     .join("")
//                                     .slice(0, 2) ?? "HR"}
//                                 </div>
//                                 <div>
//                                   <p
//                                     className="text-xs font-semibold"
//                                     style={{ color: C.textPrimary }}
//                                   >
//                                     {rev.reviewed_by_name ?? "HR"}
//                                   </p>
//                                   <p
//                                     className="text-[10px]"
//                                     style={{ color: C.textMuted }}
//                                   >
//                                     {rev.cycle_name ?? rev.cycle} ·{" "}
//                                     {rev.approved_at
//                                       ? new Date(
//                                           rev.approved_at,
//                                         ).toLocaleDateString("en-NG")
//                                       : "—"}
//                                   </p>
//                                 </div>
//                               </div>
//                               <p
//                                 className="text-sm leading-relaxed"
//                                 style={{ color: C.textSecondary }}
//                               >
//                                 {rev.manager_comment}
//                               </p>
//                             </Motion.div>
//                           ))
//                       )}
//                     </div>
//                   </Card>
//                 </Motion.div>
//               )}

//               {/* HISTORY */}
//               {activeTab === "history" && (
//                 <Motion.div
//                   key="history"
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="space-y-4"
//                 >
//                   <Card>
//                     <CardHead
//                       icon={RotateCcw}
//                       title="Score History"
//                       sub="All recorded performance scores"
//                     />
//                     <div className="p-4 space-y-3">
//                       {scores.length === 0 ? (
//                         <div className="py-12 text-center">
//                           <BarChart2
//                             size={36}
//                             color={C.textMuted}
//                             className="mx-auto mb-2"
//                           />
//                           <p
//                             className="font-semibold text-sm"
//                             style={{ color: C.textSecondary }}
//                           >
//                             No score history yet
//                           </p>
//                         </div>
//                       ) : (
//                         scores.map((sc, i) => {
//                           const rCfg = RATING_MAP[sc.rating] ?? {
//                             color: C.textMuted,
//                             bg: C.surfaceAlt,
//                           };
//                           return (
//                             <Motion.div
//                               key={sc.id ?? i}
//                               custom={i}
//                               variants={fadeUp}
//                               initial="hidden"
//                               animate="visible"
//                               className="flex items-center gap-4 p-4 rounded-2xl"
//                               style={{
//                                 background: C.surfaceAlt,
//                                 border: `1px solid ${C.border}`,
//                               }}
//                             >
//                               <div
//                                 className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-black text-lg"
//                                 style={{
//                                   background: rCfg.bg,
//                                   color: rCfg.color,
//                                   fontFamily: "Sora,sans-serif",
//                                 }}
//                               >
//                                 {sc.final_score}
//                               </div>
//                               <div className="flex-1">
//                                 <div className="flex items-center gap-2 flex-wrap mb-1">
//                                   <p
//                                     className="font-semibold text-sm"
//                                     style={{ color: C.textPrimary }}
//                                   >
//                                     {sc.period}
//                                   </p>
//                                   <Chip
//                                     label={sc.rating}
//                                     color={rCfg.color}
//                                     bg={rCfg.bg}
//                                   />
//                                 </div>
//                                 <div
//                                   className="flex gap-3 text-[11px]"
//                                   style={{ color: C.textMuted }}
//                                 >
//                                   <span>KPI: {sc.kpi_score}</span>
//                                   <span>·</span>
//                                   <span>Attendance: {sc.attendance_score}</span>
//                                   <span>·</span>
//                                   <span>Training: {sc.training_score}</span>
//                                 </div>
//                               </div>
//                               <p
//                                 className="text-[11px] shrink-0"
//                                 style={{ color: C.textMuted }}
//                               >
//                                 {sc.calculated_at
//                                   ? new Date(
//                                       sc.calculated_at,
//                                     ).toLocaleDateString("en-NG")
//                                   : "—"}
//                               </p>
//                             </Motion.div>
//                           );
//                         })
//                       )}
//                     </div>
//                   </Card>
//                 </Motion.div>
//               )}
//             </AnimatePresence>

//             <div className="h-6" />
//           </main>
//         </div>
//       </div>

//       {/* Assessment Modal */}
//       <AnimatePresence>
//         {assessModal && (
//           <AssessmentModal
//             review={assessModal}
//             onClose={() => setAssessModal(null)}
//             onSubmitted={() => {
//               setReviews((prev) =>
//                 prev.map((r) =>
//                   r.id === assessModal.id
//                     ? { ...r, status: "self_completed" }
//                     : r,
//                 ),
//               );
//               setAssessModal(null);
//               showToast("Self-assessment submitted successfully.");
//             }}
//           />
//         )}
//       </AnimatePresence>

//       {/* Toast */}
//       <AnimatePresence>
//         {toast && (
//           <Toast
//             msg={toast.msg}
//             type={toast.type}
//             onDone={() => setToast(null)}
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// // tiny alias for Overview tab
// const ClipboardCheck = CheckCircle2;

// // src/pages/Performance.jsx
// // Employee self-service performance page.
// // Appraisals tab now shows real data from /api/appraisals/me
// // and is read-only for the employee — they can only submit self-assessment
// // on performance_reviews (the existing flow). The appraisal card shows
// // what the manager + HR have scored once released.

// import { useState, useEffect, useCallback, useMemo } from "react";
// import { motion as Motion, AnimatePresence } from "framer-motion";
// import {
//   BarChart2,
//   Target,
//   Star,
//   MessageSquare,
//   ChevronDown,
//   TrendingUp,
//   Award,
//   Users,
//   Clock,
//   CheckCircle2,
//   AlertCircle,
//   Zap,
//   Flame,
//   Eye,
//   ArrowUpRight,
//   Calendar,
//   Menu,
//   Bell,
//   Search,
//   Shield,
//   Sparkles,
//   Trophy,
//   RotateCcw,
//   Send,
//   X,
//   Info,
//   RefreshCw,
//   AlertTriangle,
//   Loader2,
//   Minus,
//   ArrowDownRight,
//   FileText,
//   ThumbsUp,
//   ThumbsDown,
//   ClipboardList,
// } from "lucide-react";
// import C from "../styles/colors";
// import { authApi } from "../api/service/authApi";
// import {
//   getEmployeeScores,
//   getMyGoals,
//   getMyReviews,
//   getTrends,
//   getInsights,
//   submitSelfAssessment,
//   updateGoalProgress,
// } from "../api/service/performanceApi";
// import { getMyAppraisals } from "../api/service/appraisal.api";

// // ── Constants ─────────────────────────────────────────────────
// const TABS = [
//   { id: "overview", label: "Overview" },
//   { id: "goals", label: "Goals" },
//   { id: "appraisals", label: "Appraisals" },
//   { id: "feedback", label: "Feedback" },
//   { id: "history", label: "History" },
// ];

// const PRIORITY_MAP = {
//   high: { color: C.danger, bg: C.dangerLight },
//   medium: { color: C.warning, bg: C.warningLight },
//   low: { color: C.success, bg: C.successLight },
// };

// const RATING_MAP = {
//   Outstanding: { color: "#059669", bg: "#D1FAE5" },
//   "High Performer": { color: "#2563EB", bg: "#DBEAFE" },
//   "Meets Expectations": { color: C.warning, bg: C.warningLight },
//   "Needs Improvement": { color: C.danger, bg: C.dangerLight },
//   Underperforming: { color: "#7C3AED", bg: "#F3E8FF" },
// };

// // Appraisal status display config
// const APPRAISAL_STATUS = {
//   draft: { label: "Draft", color: C.textMuted, bg: C.surfaceAlt },
//   submitted: { label: "Under Review", color: C.warning, bg: C.warningLight },
//   hr_scored: { label: "HR Scored", color: "#7C3AED", bg: "#F3E8FF" },
//   completed: { label: "Completed", color: C.success, bg: C.successLight },
//   rejected: { label: "Returned", color: C.danger, bg: C.dangerLight },
// };

// // ── Animations ────────────────────────────────────────────────
// const fadeUp = {
//   hidden: { opacity: 0, y: 16 },
//   visible: (i = 0) => ({
//     opacity: 1,
//     y: 0,
//     transition: { delay: i * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
//   }),
// };

// // ── Atoms ─────────────────────────────────────────────────────
// function Chip({ label, color, bg }) {
//   return (
//     <span
//       className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
//       style={{ background: bg ?? C.primaryLight, color: color ?? C.primary }}
//     >
//       {label}
//     </span>
//   );
// }

// function Card({ children, className = "" }) {
//   return (
//     <div
//       className={`rounded-2xl ${className}`}
//       style={{
//         background: C.surface,
//         border: `1px solid ${C.border}`,
//         boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
//       }}
//     >
//       {children}
//     </div>
//   );
// }

// function CardHead({ icon: Icon, title, sub, color, bg, action }) {
//   return (
//     <div
//       className="flex items-center gap-3 px-5 py-4"
//       style={{ borderBottom: `1px solid ${C.border}` }}
//     >
//       <div
//         className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
//         style={{ background: bg ?? C.primaryLight }}
//       >
//         <Icon size={15} color={color ?? C.primary} />
//       </div>
//       <div className="flex-1 min-w-0">
//         <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
//           {title}
//         </p>
//         {sub && (
//           <p className="text-[11px]" style={{ color: C.textMuted }}>
//             {sub}
//           </p>
//         )}
//       </div>
//       {action && <div className="shrink-0">{action}</div>}
//     </div>
//   );
// }

// function Toast({ msg, type, onDone }) {
//   useEffect(() => {
//     const t = setTimeout(onDone, 3500);
//     return () => clearTimeout(t);
//   }, [onDone]);
//   const Icon = type === "success" ? CheckCircle2 : AlertCircle;
//   const color = type === "success" ? C.success : C.danger;
//   return (
//     <Motion.div
//       initial={{ opacity: 0, y: 40, x: "-50%" }}
//       animate={{ opacity: 1, y: 0, x: "-50%" }}
//       exit={{ opacity: 0, y: 40, x: "-50%" }}
//       className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl"
//       style={{
//         background: C.navy,
//         boxShadow: "0 12px 40px rgba(15,23,42,0.35)",
//         minWidth: 260,
//       }}
//     >
//       <Icon size={16} color={color} />
//       <span className="text-white text-sm font-semibold">{msg}</span>
//     </Motion.div>
//   );
// }

// // ── Score ring ────────────────────────────────────────────────
// function ScoreRing({ score, size = 120 }) {
//   const r = (size - 12) / 2;
//   const circ = 2 * Math.PI * r;
//   const dash = ((score ?? 0) / 100) * circ;
//   const color =
//     score >= 85
//       ? C.success
//       : score >= 60
//         ? C.primary
//         : score >= 40
//           ? C.warning
//           : C.danger;
//   return (
//     <div
//       className="relative flex items-center justify-center"
//       style={{ width: size, height: size }}
//     >
//       <svg width={size} height={size}>
//         <circle
//           cx={size / 2}
//           cy={size / 2}
//           r={r}
//           fill="none"
//           strokeWidth={10}
//           stroke={C.border}
//         />
//         <Motion.circle
//           cx={size / 2}
//           cy={size / 2}
//           r={r}
//           fill="none"
//           strokeWidth={10}
//           stroke={color}
//           strokeLinecap="round"
//           strokeDasharray={`${circ}`}
//           initial={{ strokeDashoffset: circ }}
//           animate={{ strokeDashoffset: circ - dash }}
//           transition={{ duration: 1.2, ease: "easeOut" }}
//           style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
//         />
//       </svg>
//       <div className="absolute flex flex-col items-center">
//         <span
//           className="text-3xl font-black"
//           style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
//         >
//           {score ?? "—"}
//         </span>
//         <span
//           className="text-[10px] font-semibold"
//           style={{ color: C.textMuted }}
//         >
//           / 100
//         </span>
//       </div>
//     </div>
//   );
// }

// // ── Mini trend chart ──────────────────────────────────────────
// function TrendLine({ data }) {
//   if (!data?.length) return null;
//   const W = 220;
//   const H = 60;
//   const PAD = 8;
//   const scores = data.map((d) => d.score ?? d.final_score ?? 0);
//   const min = Math.min(...scores);
//   const max = Math.max(...scores, min + 1);
//   const pts = scores
//     .map((s, i) => {
//       const x = PAD + (i / Math.max(scores.length - 1, 1)) * (W - PAD * 2);
//       const y = H - PAD - ((s - min) / (max - min + 0.01)) * (H - PAD * 2);
//       return `${x},${y}`;
//     })
//     .join(" ");
//   const last = scores.at(-1);
//   const prev = scores.at(-2);
//   const trend =
//     prev == null
//       ? "new"
//       : last > prev + 2
//         ? "up"
//         : last < prev - 2
//           ? "down"
//           : "stable";
//   const color =
//     trend === "up" ? C.success : trend === "down" ? C.danger : C.primary;
//   return (
//     <div className="flex items-center gap-3">
//       <svg width={W} height={H} style={{ overflow: "visible" }}>
//         <polyline
//           points={pts}
//           fill="none"
//           stroke={color}
//           strokeWidth={2.5}
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />
//         {scores.map((s, i) => {
//           const x = PAD + (i / Math.max(scores.length - 1, 1)) * (W - PAD * 2);
//           const y = H - PAD - ((s - min) / (max - min + 0.01)) * (H - PAD * 2);
//           return (
//             <g key={i}>
//               <circle cx={x} cy={y} r={4} fill={color} />
//               <text
//                 x={x}
//                 y={y - 8}
//                 textAnchor="middle"
//                 fontSize={8}
//                 fill={C.textMuted}
//               >
//                 {s}
//               </text>
//             </g>
//           );
//         })}
//       </svg>
//       <div className="flex items-center gap-1">
//         {trend === "up" && <ArrowUpRight size={16} color={C.success} />}
//         {trend === "down" && <ArrowDownRight size={16} color={C.danger} />}
//         {trend === "stable" && <Minus size={16} color={C.textMuted} />}
//         <span className="text-xs font-semibold" style={{ color }}>
//           {trend === "new"
//             ? "First score"
//             : trend === "stable"
//               ? "Stable"
//               : `${trend === "up" ? "+" : ""}${(last - (prev ?? last)).toFixed(0)}`}
//         </span>
//       </div>
//     </div>
//   );
// }

// // ── Goal bar ──────────────────────────────────────────────────
// function GoalBar({ progress, label }) {
//   const color =
//     progress >= 100
//       ? C.success
//       : progress >= 60
//         ? C.primary
//         : progress >= 30
//           ? C.warning
//           : C.danger;
//   return (
//     <div>
//       <div className="flex items-center justify-between mb-1">
//         <span
//           className="text-xs font-medium"
//           style={{ color: C.textSecondary }}
//         >
//           {label}
//         </span>
//         <span className="text-xs font-bold" style={{ color }}>
//           {progress}%
//         </span>
//       </div>
//       <div
//         className="h-2 rounded-full overflow-hidden"
//         style={{ background: C.surfaceAlt }}
//       >
//         <Motion.div
//           className="h-full rounded-full"
//           initial={{ width: 0 }}
//           animate={{ width: `${progress}%` }}
//           transition={{ duration: 0.8, ease: "easeOut" }}
//           style={{ background: color }}
//         />
//       </div>
//     </div>
//   );
// }

// // ── Star rating display (read-only) ───────────────────────────
// function StarRating({ score, max = 5 }) {
//   const filled = Math.round((score / max) * 5);
//   return (
//     <div className="flex gap-0.5">
//       {[1, 2, 3, 4, 5].map((s) => (
//         <Star
//           key={s}
//           size={12}
//           fill={s <= filled ? C.warning : "none"}
//           color={s <= filled ? C.warning : C.border}
//         />
//       ))}
//     </div>
//   );
// }

// // ── Appraisal Detail Modal (read-only for employee) ───────────
// function AppraisalDetailModal({ appraisal, onClose }) {
//   const statusCfg =
//     APPRAISAL_STATUS[appraisal.status] ?? APPRAISAL_STATUS.draft;
//   const managerName = appraisal.manager
//     ? `${appraisal.manager.firstName} ${appraisal.manager.lastName}`
//     : "Your Manager";
//   const hrName = appraisal.hrReviewer
//     ? `${appraisal.hrReviewer.firstName} ${appraisal.hrReviewer.lastName}`
//     : "HR";

//   return (
//     <Motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-50 flex items-center justify-center p-5"
//       style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
//       onClick={onClose}
//     >
//       <Motion.div
//         initial={{ scale: 0.93, y: 20 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.93, y: 20 }}
//         transition={{ type: "spring", stiffness: 260, damping: 24 }}
//         className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[88vh] flex flex-col"
//         style={{
//           background: C.surface,
//           boxShadow: "0 24px 64px rgba(15,23,42,0.2)",
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div
//           className="px-5 py-4 flex items-center justify-between shrink-0"
//           style={{ borderBottom: `1px solid ${C.border}` }}
//         >
//           <div className="flex items-center gap-2">
//             <div
//               className="w-8 h-8 rounded-xl flex items-center justify-center"
//               style={{ background: C.primaryLight }}
//             >
//               <ClipboardList size={14} color={C.primary} />
//             </div>
//             <div>
//               <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
//                 Appraisal — {appraisal.cycleName ?? appraisal.period}
//               </p>
//               <p className="text-[10px]" style={{ color: C.textMuted }}>
//                 Period: {appraisal.period}
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <Chip
//               label={statusCfg.label}
//               color={statusCfg.color}
//               bg={statusCfg.bg}
//             />
//             <button
//               onClick={onClose}
//               className="w-7 h-7 rounded-xl flex items-center justify-center"
//               style={{ background: C.surfaceAlt }}
//             >
//               <X size={13} color={C.textMuted} />
//             </button>
//           </div>
//         </div>

//         <div className="flex-1 overflow-y-auto p-5 space-y-5">
//           {/* Score summary */}
//           {(appraisal.appraisalScore != null ||
//             appraisal.managerOverall != null) && (
//             <div className="grid grid-cols-3 gap-3">
//               {[
//                 {
//                   label: "Manager Score",
//                   value:
//                     appraisal.managerOverall != null
//                       ? `${Math.round(appraisal.managerOverall)}`
//                       : "—",
//                   color: C.primary,
//                   bg: C.primaryLight,
//                 },
//                 {
//                   label: "HR Score",
//                   value:
//                     appraisal.hrOverall != null
//                       ? `${Math.round(appraisal.hrOverall)}`
//                       : "—",
//                   color: "#7C3AED",
//                   bg: "#F3E8FF",
//                 },
//                 {
//                   label: "Final Score",
//                   value:
//                     appraisal.appraisalScore != null
//                       ? `${Math.round(appraisal.appraisalScore)}`
//                       : "—",
//                   color: C.success,
//                   bg: C.successLight,
//                 },
//               ].map((s) => (
//                 <div
//                   key={s.label}
//                   className="rounded-xl p-3 text-center"
//                   style={{ background: s.bg }}
//                 >
//                   <p
//                     className="text-xl font-black"
//                     style={{ color: s.color, fontFamily: "Sora,sans-serif" }}
//                   >
//                     {s.value}
//                   </p>
//                   <p
//                     className="text-[10px] font-semibold mt-0.5"
//                     style={{ color: s.color }}
//                   >
//                     {s.label}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Manager ratings breakdown */}
//           {Array.isArray(appraisal.managerRatings) &&
//             appraisal.managerRatings.length > 0 && (
//               <div>
//                 <p
//                   className="text-xs font-bold mb-2"
//                   style={{ color: C.textMuted }}
//                 >
//                   Manager Ratings
//                 </p>
//                 <div
//                   className="rounded-xl overflow-hidden divide-y"
//                   style={{
//                     border: `1px solid ${C.border}`,
//                     divideColor: C.border,
//                   }}
//                 >
//                   {appraisal.managerRatings.map((r, i) => (
//                     <div
//                       key={i}
//                       className="flex items-center justify-between px-4 py-3"
//                       style={{
//                         background: i % 2 === 0 ? C.surface : C.surfaceAlt,
//                       }}
//                     >
//                       <div>
//                         <p
//                           className="text-xs font-semibold"
//                           style={{ color: C.textPrimary }}
//                         >
//                           {r.label}
//                         </p>
//                         {r.comment && (
//                           <p
//                             className="text-[10px] mt-0.5"
//                             style={{ color: C.textMuted }}
//                           >
//                             {r.comment}
//                           </p>
//                         )}
//                       </div>
//                       <div className="flex items-center gap-2 shrink-0">
//                         <StarRating score={r.score} max={r.maxScore ?? 5} />
//                         <span
//                           className="text-xs font-bold w-8 text-right"
//                           style={{ color: C.primary }}
//                         >
//                           {r.score}/{r.maxScore ?? 5}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//           {/* Manager feedback */}
//           {appraisal.managerFeedback && (
//             <div
//               className="rounded-xl p-4"
//               style={{
//                 background: C.primaryLight,
//                 border: `1px solid ${C.primary}22`,
//               }}
//             >
//               <div className="flex items-center gap-2 mb-2">
//                 <div
//                   className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
//                   style={{
//                     background: "linear-gradient(135deg,#4F46E5,#6366F1)",
//                   }}
//                 >
//                   {managerName
//                     .split(" ")
//                     .map((n) => n[0])
//                     .join("")
//                     .slice(0, 2)}
//                 </div>
//                 <div>
//                   <p className="text-xs font-bold" style={{ color: C.primary }}>
//                     {managerName}
//                   </p>
//                   <p className="text-[10px]" style={{ color: C.textMuted }}>
//                     {appraisal.submittedAt
//                       ? new Date(appraisal.submittedAt).toLocaleDateString(
//                           "en-NG",
//                         )
//                       : "Manager"}
//                   </p>
//                 </div>
//               </div>
//               <p
//                 className="text-xs leading-relaxed"
//                 style={{ color: C.textPrimary }}
//               >
//                 {appraisal.managerFeedback}
//               </p>
//             </div>
//           )}

//           {/* HR ratings (only shown once completed) */}
//           {appraisal.status === "completed" &&
//             Array.isArray(appraisal.hrRatings) &&
//             appraisal.hrRatings.length > 0 && (
//               <div>
//                 <p
//                   className="text-xs font-bold mb-2"
//                   style={{ color: C.textMuted }}
//                 >
//                   HR Ratings
//                 </p>
//                 <div
//                   className="rounded-xl overflow-hidden divide-y"
//                   style={{ border: `1px solid ${C.border}` }}
//                 >
//                   {appraisal.hrRatings.map((r, i) => (
//                     <div
//                       key={i}
//                       className="flex items-center justify-between px-4 py-3"
//                       style={{
//                         background: i % 2 === 0 ? C.surface : C.surfaceAlt,
//                       }}
//                     >
//                       <div>
//                         <p
//                           className="text-xs font-semibold"
//                           style={{ color: C.textPrimary }}
//                         >
//                           {r.label}
//                         </p>
//                         {r.comment && (
//                           <p
//                             className="text-[10px] mt-0.5"
//                             style={{ color: C.textMuted }}
//                           >
//                             {r.comment}
//                           </p>
//                         )}
//                       </div>
//                       <div className="flex items-center gap-2 shrink-0">
//                         <StarRating score={r.score} max={r.maxScore ?? 5} />
//                         <span
//                           className="text-xs font-bold w-8 text-right"
//                           style={{ color: "#7C3AED" }}
//                         >
//                           {r.score}/{r.maxScore ?? 5}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//           {/* HR feedback (only shown once completed) */}
//           {appraisal.status === "completed" && appraisal.hrFeedback && (
//             <div
//               className="rounded-xl p-4"
//               style={{ background: "#F3E8FF", border: "1px solid #7C3AED22" }}
//             >
//               <div className="flex items-center gap-2 mb-2">
//                 <div
//                   className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
//                   style={{
//                     background: "linear-gradient(135deg,#7C3AED,#9333EA)",
//                   }}
//                 >
//                   {hrName
//                     .split(" ")
//                     .map((n) => n[0])
//                     .join("")
//                     .slice(0, 2)}
//                 </div>
//                 <div>
//                   <p className="text-xs font-bold" style={{ color: "#7C3AED" }}>
//                     {hrName} · HR Review
//                   </p>
//                   <p className="text-[10px]" style={{ color: C.textMuted }}>
//                     {appraisal.hrReviewedAt
//                       ? new Date(appraisal.hrReviewedAt).toLocaleDateString(
//                           "en-NG",
//                         )
//                       : "HR"}
//                   </p>
//                 </div>
//               </div>
//               <p
//                 className="text-xs leading-relaxed"
//                 style={{ color: C.textPrimary }}
//               >
//                 {appraisal.hrFeedback}
//               </p>
//             </div>
//           )}

//           {/* Rejected — reason shown as hr_feedback */}
//           {appraisal.status === "rejected" && appraisal.hrFeedback && (
//             <div
//               className="rounded-xl p-4"
//               style={{
//                 background: C.dangerLight,
//                 border: `1px solid ${C.danger}22`,
//               }}
//             >
//               <p className="text-xs font-bold mb-1" style={{ color: C.danger }}>
//                 Returned to Manager
//               </p>
//               <p
//                 className="text-xs leading-relaxed"
//                 style={{ color: C.textPrimary }}
//               >
//                 {appraisal.hrFeedback}
//               </p>
//             </div>
//           )}

//           {/* Status pending message */}
//           {["submitted", "hr_scored"].includes(appraisal.status) && (
//             <div
//               className="rounded-xl p-4 flex items-center gap-3"
//               style={{
//                 background: C.warningLight,
//                 border: `1px solid ${C.warning}22`,
//               }}
//             >
//               <Clock size={14} color={C.warning} className="shrink-0" />
//               <p className="text-xs" style={{ color: C.textPrimary }}>
//                 {appraisal.status === "submitted"
//                   ? "Your appraisal has been submitted by your manager and is now in the HR review queue."
//                   : "HR has completed their review. The appraisal is pending final sign-off."}
//               </p>
//             </div>
//           )}
//         </div>

//         <div className="px-5 pb-5 shrink-0">
//           <button
//             onClick={onClose}
//             className="w-full py-2.5 rounded-xl text-sm font-semibold"
//             style={{
//               background: C.surfaceAlt,
//               border: `1px solid ${C.border}`,
//               color: C.textSecondary,
//             }}
//           >
//             Close
//           </button>
//         </div>
//       </Motion.div>
//     </Motion.div>
//   );
// }

// // ── Self Assessment Modal ─────────────────────────────────────
// function AssessmentModal({ review, onClose, onSubmitted }) {
//   const [answers, setAnswers] = useState({});
//   const [comment, setComment] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async () => {
//     setSaving(true);
//     try {
//       await submitSelfAssessment(review.id, {
//         sections: answers,
//         overallComment: comment,
//       });
//       onSubmitted();
//     } catch (err) {
//       setError(err?.response?.data?.message ?? "Failed to submit assessment.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const sections = review.sections ?? [
//     { key: "achievements", label: "Key Achievements this period" },
//     { key: "challenges", label: "Challenges faced & how you overcame them" },
//     { key: "goals_progress", label: "Progress on assigned goals" },
//     { key: "development", label: "Skills developed / training completed" },
//     { key: "next_period", label: "Goals & focus for next period" },
//   ];

//   return (
//     <Motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-50 flex items-center justify-center p-5"
//       style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
//       onClick={onClose}
//     >
//       <Motion.div
//         initial={{ scale: 0.93, y: 20 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.93, y: 20 }}
//         transition={{ type: "spring", stiffness: 260, damping: 24 }}
//         className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
//         style={{
//           background: C.surface,
//           boxShadow: "0 24px 64px rgba(15,23,42,0.2)",
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div
//           className="px-5 py-4 flex items-center justify-between shrink-0"
//           style={{ borderBottom: `1px solid ${C.border}` }}
//         >
//           <div className="flex items-center gap-2">
//             <div
//               className="w-8 h-8 rounded-xl flex items-center justify-center"
//               style={{ background: C.primaryLight }}
//             >
//               <Star size={14} color={C.primary} />
//             </div>
//             <div>
//               <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
//                 Self Assessment
//               </p>
//               <p className="text-[10px]" style={{ color: C.textMuted }}>
//                 {review.cycle_name ?? review.cycle ?? "Current Cycle"}
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="w-7 h-7 rounded-xl flex items-center justify-center"
//             style={{ background: C.surfaceAlt }}
//           >
//             <X size={13} color={C.textMuted} />
//           </button>
//         </div>

//         <div className="flex-1 overflow-y-auto p-5 space-y-4">
//           {error && (
//             <div
//               className="flex items-center gap-2 p-3 rounded-xl"
//               style={{ background: C.dangerLight }}
//             >
//               <AlertTriangle size={13} color={C.danger} />
//               <p className="text-xs" style={{ color: C.danger }}>
//                 {error}
//               </p>
//             </div>
//           )}
//           {sections.map((section) => (
//             <div key={section.key ?? section.id}>
//               <label
//                 className="block text-xs font-semibold mb-1"
//                 style={{ color: C.textPrimary }}
//               >
//                 {section.label ?? section.title}
//               </label>
//               <textarea
//                 rows={3}
//                 value={answers[section.key ?? section.id] ?? ""}
//                 onChange={(e) =>
//                   setAnswers((p) => ({
//                     ...p,
//                     [section.key ?? section.id]: e.target.value,
//                   }))
//                 }
//                 placeholder="Write your response here..."
//                 className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
//                 style={{
//                   background: C.surfaceAlt,
//                   border: `1.5px solid ${C.border}`,
//                   color: C.textPrimary,
//                 }}
//               />
//             </div>
//           ))}
//           <div>
//             <label
//               className="block text-xs font-semibold mb-1"
//               style={{ color: C.textPrimary }}
//             >
//               Overall Comments
//             </label>
//             <textarea
//               rows={3}
//               value={comment}
//               onChange={(e) => setComment(e.target.value)}
//               placeholder="Any additional comments for your reviewer..."
//               className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
//               style={{
//                 background: C.surfaceAlt,
//                 border: `1.5px solid ${C.border}`,
//                 color: C.textPrimary,
//               }}
//             />
//           </div>
//         </div>

//         <div className="flex gap-3 px-5 pb-5 shrink-0">
//           <button
//             onClick={onClose}
//             className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
//             style={{
//               background: C.surfaceAlt,
//               border: `1px solid ${C.border}`,
//               color: C.textSecondary,
//             }}
//           >
//             Cancel
//           </button>
//           <Motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={handleSubmit}
//             disabled={saving}
//             className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
//             style={{ background: C.primary, opacity: saving ? 0.8 : 1 }}
//           >
//             {saving ? (
//               <Loader2 size={13} className="animate-spin" />
//             ) : (
//               <Send size={13} />
//             )}
//             Submit Assessment
//           </Motion.button>
//         </div>
//       </Motion.div>
//     </Motion.div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════
// export default function PerformancePage() {
//   const [user, setUser] = useState(null);
//   const [employee, setEmployee] = useState(null);
//   const [scores, setScores] = useState([]);
//   const [latestScore, setLatestScore] = useState(null);
//   const [trends, setTrends] = useState([]);
//   const [goals, setGoals] = useState([]);
//   const [reviews, setReviews] = useState([]);
//   const [appraisals, setAppraisals] = useState([]); // ← new
//   const [insights, setInsights] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchFocused, setSearchFocused] = useState(false);
//   const [activeTab, setActiveTab] = useState("overview");
//   const [expandedGoal, setExpandedGoal] = useState(null);
//   const [assessModal, setAssessModal] = useState(null);
//   const [detailAppraisal, setDetailAppraisal] = useState(null); // ← new
//   const [toast, setToast] = useState(null);

//   const showToast = (msg, type = "success") => setToast({ msg, type });

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const me = await authApi.getMe();
//       setUser(me);
//       const empId = me.employee_id ?? me.employeeId;
//       if (!empId)
//         throw new Error("No employee profile linked to this account.");

//       setEmployee({
//         id: empId,
//         name: `${me.firstName ?? me.first_name} ${me.lastName ?? me.last_name}`,
//         initials:
//           `${(me.firstName ?? me.first_name ?? "?")[0]}${(me.lastName ?? me.last_name ?? "?")[0]}`.toUpperCase(),
//         role: me.role,
//         department: me.company?.name ?? "",
//         email: me.email,
//       });

//       const [
//         scoresRes,
//         goalsRes,
//         reviewsRes,
//         trendsRes,
//         insightsRes,
//         appraisalsRes,
//       ] = await Promise.allSettled([
//         getEmployeeScores(empId),
//         getMyGoals(),
//         getMyReviews(),
//         getTrends(empId),
//         getInsights(empId),
//         getMyAppraisals(), // ← new
//       ]);

//       const scoreData =
//         scoresRes.status === "fulfilled" ? (scoresRes.value?.data ?? []) : [];
//       const goalsData =
//         goalsRes.status === "fulfilled"
//           ? (goalsRes.value?.data ?? goalsRes.value?.goals ?? [])
//           : [];
//       const reviewsData =
//         reviewsRes.status === "fulfilled"
//           ? (reviewsRes.value?.data ?? reviewsRes.value?.reviews ?? [])
//           : [];
//       const trendsData =
//         trendsRes.status === "fulfilled"
//           ? (trendsRes.value?.data ?? trendsRes.value?.trends ?? [])
//           : [];
//       const insightData =
//         insightsRes.status === "fulfilled"
//           ? (insightsRes.value?.data ?? insightsRes.value ?? [])
//           : [];
//       const appraisalData =
//         appraisalsRes.status === "fulfilled"
//           ? (appraisalsRes.value?.appraisals ?? [])
//           : [];

//       setScores(scoreData);
//       setLatestScore(scoreData[0] ?? null);
//       setTrends(trendsData);
//       setGoals(goalsData);
//       setReviews(reviewsData);
//       setInsights(insightData);
//       setAppraisals(appraisalData);
//     } catch (err) {
//       setError(
//         err?.response?.data?.message ??
//           err.message ??
//           "Failed to load performance data.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     load();
//   }, [load]);

//   const pendingReviews = reviews.filter(
//     (r) => r.status?.toLowerCase() === "pending",
//   );
//   const completedGoals = goals.filter(
//     (g) => g.status?.toLowerCase() === "completed" || g.progress >= 100,
//   );
//   const inProgressGoals = goals.filter(
//     (g) => g.status?.toLowerCase() === "in_progress" && g.progress < 100,
//   );
//   const completedAppraisals = appraisals.filter(
//     (a) => a.status === "completed",
//   );
//   const pendingAppraisals = appraisals.filter((a) =>
//     ["submitted", "hr_scored"].includes(a.status),
//   );

//   const filteredGoals = useMemo(() => {
//     const q = searchQuery.toLowerCase();
//     return goals.filter(
//       (g) =>
//         !q ||
//         g.title?.toLowerCase().includes(q) ||
//         g.description?.toLowerCase().includes(q),
//     );
//   }, [goals, searchQuery]);

//   const ratingCfg = RATING_MAP[latestScore?.rating] ?? {
//     color: C.textMuted,
//     bg: C.surfaceAlt,
//   };

//   if (loading)
//     return (
//       <div
//         className="min-h-screen flex items-center justify-center"
//         style={{ background: C.bg }}
//       >
//         <Loader2
//           size={28}
//           className="animate-spin"
//           style={{ color: C.primary }}
//         />
//       </div>
//     );

//   return (
//     <div
//       className="min-h-screen"
//       style={{
//         background: C.bg,
//         color: C.textPrimary,
//         fontFamily: "'DM Sans','Sora',sans-serif",
//       }}
//     >
//       <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>

//       <div className="flex h-screen overflow-hidden">
//         <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
//           {/* TOPBAR */}
//           <header
//             className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
//             style={{
//               background: "rgba(240,242,248,0.9)",
//               backdropFilter: "blur(12px)",
//               borderBottom: `1px solid ${C.border}`,
//             }}
//           >
//             <Motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setSidebarOpen((p) => !p)}
//               className="p-2 rounded-xl hidden md:flex"
//               style={{ background: C.surface }}
//             >
//               <Menu size={16} color={C.textSecondary} />
//             </Motion.button>

//             <Motion.div
//               className="flex-1 max-w-xs relative"
//               animate={{ width: searchFocused ? "320px" : "240px" }}
//             >
//               <Search
//                 size={14}
//                 className="absolute left-3 top-1/2 -translate-y-1/2"
//                 color={C.textMuted}
//               />
//               <input
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 onFocus={() => setSearchFocused(true)}
//                 onBlur={() => setSearchFocused(false)}
//                 placeholder="Search goals..."
//                 className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
//                 style={{
//                   background: C.surface,
//                   border: `1.5px solid ${searchFocused ? C.primary : C.border}`,
//                   color: C.textPrimary,
//                 }}
//               />
//             </Motion.div>

//             <div className="flex items-center gap-2 ml-auto">
//               <Motion.button
//                 whileHover={{ scale: 1.05 }}
//                 onClick={load}
//                 className="w-8 h-8 rounded-xl flex items-center justify-center"
//                 style={{
//                   background: C.surface,
//                   border: `1px solid ${C.border}`,
//                 }}
//               >
//                 <RefreshCw size={14} color={C.textSecondary} />
//               </Motion.button>
//               <div className="relative">
//                 <Motion.button
//                   className="p-2 rounded-xl"
//                   style={{
//                     background: C.surface,
//                     border: `1px solid ${C.border}`,
//                   }}
//                 >
//                   <Bell size={16} color={C.textSecondary} />
//                 </Motion.button>
//                 {pendingReviews.length > 0 && (
//                   <span
//                     className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
//                     style={{ background: C.warning }}
//                   >
//                     {pendingReviews.length}
//                   </span>
//                 )}
//               </div>
//               {employee && (
//                 <div
//                   className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
//                   style={{
//                     background: "linear-gradient(135deg,#4F46E5,#06B6D4)",
//                   }}
//                 >
//                   {employee.initials}
//                 </div>
//               )}
//             </div>
//           </header>

//           <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
//             {/* Hero */}
//             <Motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="rounded-2xl p-6 text-white relative overflow-hidden"
//               style={{
//                 background:
//                   "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
//               }}
//             >
//               <div className="absolute inset-0 opacity-5">
//                 <div
//                   className="absolute top-0 right-0 w-72 h-72 rounded-full"
//                   style={{
//                     background:
//                       "radial-gradient(circle,#fff 0%,transparent 70%)",
//                     transform: "translate(30%,-30%)",
//                   }}
//                 />
//               </div>
//               <div className="relative flex items-center gap-5">
//                 <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/15 shrink-0">
//                   <BarChart2 size={30} />
//                 </div>
//                 <div className="flex-1">
//                   <h1
//                     className="text-2xl font-bold"
//                     style={{ fontFamily: "Sora,sans-serif" }}
//                   >
//                     Performance
//                   </h1>
//                   <p className="text-indigo-200 text-sm mt-0.5">
//                     {employee?.name ?? "Employee"} ·{" "}
//                     {latestScore ? (
//                       <span>
//                         Current Score:{" "}
//                         <strong>{latestScore.final_score}</strong> —{" "}
//                         {latestScore.rating}
//                       </span>
//                     ) : (
//                       "No score data yet"
//                     )}
//                   </p>
//                 </div>
//                 {latestScore && (
//                   <div className="shrink-0">
//                     <Chip
//                       label={latestScore.rating}
//                       color={ratingCfg.color}
//                       bg={ratingCfg.bg}
//                     />
//                   </div>
//                 )}
//               </div>
//             </Motion.div>

//             {/* Error */}
//             {error && (
//               <div
//                 className="rounded-xl p-4 flex items-center gap-3"
//                 style={{ background: C.dangerLight }}
//               >
//                 <AlertTriangle size={16} color={C.danger} />
//                 <p className="text-sm" style={{ color: C.danger }}>
//                   {error}
//                 </p>
//               </div>
//             )}

//             {/* Pending self-assessment alert */}
//             {pendingReviews.length > 0 && (
//               <Motion.div
//                 initial={{ opacity: 0, y: -8 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="rounded-2xl p-4 flex items-center gap-3"
//                 style={{
//                   background: C.warningLight,
//                   border: `1px solid ${C.warning}44`,
//                 }}
//               >
//                 <div
//                   className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
//                   style={{ background: C.warning }}
//                 >
//                   <Star size={15} color="#fff" />
//                 </div>
//                 <div className="flex-1">
//                   <p
//                     className="font-semibold text-sm"
//                     style={{ color: C.textPrimary }}
//                   >
//                     {pendingReviews.length} appraisal
//                     {pendingReviews.length > 1 ? "s" : ""} pending your
//                     self-assessment
//                   </p>
//                   <p
//                     className="text-xs mt-0.5"
//                     style={{ color: C.textSecondary }}
//                   >
//                     Complete your self-assessment to keep the review cycle on
//                     track.
//                   </p>
//                 </div>
//                 <Motion.button
//                   whileHover={{ scale: 1.04 }}
//                   whileTap={{ scale: 0.97 }}
//                   onClick={() => setActiveTab("appraisals")}
//                   className="text-xs font-bold px-3 py-1.5 rounded-xl shrink-0"
//                   style={{ background: C.warning, color: "#fff" }}
//                 >
//                   Review Now
//                 </Motion.button>
//               </Motion.div>
//             )}

//             {/* Tabs */}
//             <div
//               className="flex gap-1 p-1 rounded-2xl overflow-x-auto"
//               style={{
//                 background: C.surface,
//                 border: `1px solid ${C.border}`,
//                 scrollbarWidth: "none",
//               }}
//             >
//               {TABS.map((t) => {
//                 const active = activeTab === t.id;
//                 const badge =
//                   t.id === "appraisals"
//                     ? completedAppraisals.length + pendingAppraisals.length
//                     : null;
//                 return (
//                   <Motion.button
//                     key={t.id}
//                     whileTap={{ scale: 0.97 }}
//                     onClick={() => setActiveTab(t.id)}
//                     className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 flex items-center gap-1.5"
//                     style={{
//                       background: active ? C.primary : "transparent",
//                       color: active ? "#fff" : C.textSecondary,
//                       boxShadow: active
//                         ? "0 2px 8px rgba(79,70,229,0.25)"
//                         : "none",
//                     }}
//                   >
//                     {t.label}
//                     {badge > 0 && (
//                       <span
//                         className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
//                         style={{
//                           background: active
//                             ? "rgba(255,255,255,0.25)"
//                             : C.primaryLight,
//                           color: active ? "#fff" : C.primary,
//                         }}
//                       >
//                         {badge}
//                       </span>
//                     )}
//                   </Motion.button>
//                 );
//               })}
//             </div>

//             {/* ─── TAB CONTENT ─── */}
//             <AnimatePresence mode="wait">
//               {/* OVERVIEW */}
//               {activeTab === "overview" && (
//                 <Motion.div
//                   key="overview"
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="space-y-5"
//                 >
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                     <Card className="p-6 flex items-center gap-6">
//                       <ScoreRing score={latestScore?.final_score} />
//                       <div className="flex-1 space-y-3">
//                         <div>
//                           <p
//                             className="text-xs"
//                             style={{ color: C.textSecondary }}
//                           >
//                             Current Rating
//                           </p>
//                           {latestScore?.rating ? (
//                             <Chip
//                               label={latestScore.rating}
//                               color={ratingCfg.color}
//                               bg={ratingCfg.bg}
//                             />
//                           ) : (
//                             <p
//                               className="text-sm font-semibold"
//                               style={{ color: C.textMuted }}
//                             >
//                               No data
//                             </p>
//                           )}
//                         </div>
//                         <div>
//                           <p
//                             className="text-xs"
//                             style={{ color: C.textSecondary }}
//                           >
//                             Period
//                           </p>
//                           <p
//                             className="font-semibold text-sm"
//                             style={{ color: C.textPrimary }}
//                           >
//                             {latestScore?.period ?? "—"}
//                           </p>
//                         </div>
//                         <div className="grid grid-cols-3 gap-2">
//                           {[
//                             {
//                               label: "KPI",
//                               value: latestScore?.kpi_score ?? "—",
//                             },
//                             {
//                               label: "Attendance",
//                               value: latestScore?.attendance_score ?? "—",
//                             },
//                             {
//                               label: "Training",
//                               value: latestScore?.training_score ?? "—",
//                             },
//                           ].map((s) => (
//                             <div
//                               key={s.label}
//                               className="rounded-xl p-2 text-center"
//                               style={{ background: C.surfaceAlt }}
//                             >
//                               <p
//                                 className="text-sm font-black"
//                                 style={{ color: C.textPrimary }}
//                               >
//                                 {s.value}
//                               </p>
//                               <p
//                                 className="text-[9px] font-semibold"
//                                 style={{ color: C.textMuted }}
//                               >
//                                 {s.label}
//                               </p>
//                             </div>
//                           ))}
//                         </div>
//                         {latestScore?.appraisal_score != null && (
//                           <div
//                             className="rounded-xl p-2 text-center"
//                             style={{ background: "#F3E8FF" }}
//                           >
//                             <p
//                               className="text-sm font-black"
//                               style={{ color: "#7C3AED" }}
//                             >
//                               {Math.round(latestScore.appraisal_score)}
//                             </p>
//                             <p
//                               className="text-[9px] font-semibold"
//                               style={{ color: "#7C3AED" }}
//                             >
//                               Appraisal
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     </Card>

//                     <Card className="p-6">
//                       <CardHead
//                         icon={TrendingUp}
//                         title="Score Trend"
//                         sub="Monthly performance history"
//                         color={C.success}
//                         bg={C.successLight}
//                       />
//                       <div className="p-4">
//                         {trends.length === 0 ? (
//                           <p
//                             className="text-sm text-center py-6"
//                             style={{ color: C.textMuted }}
//                           >
//                             No trend data yet
//                           </p>
//                         ) : (
//                           <>
//                             <TrendLine data={trends.slice(-6)} />
//                             <div className="flex gap-2 mt-3 overflow-x-auto">
//                               {trends.slice(-6).map((t, i) => (
//                                 <div key={i} className="text-center shrink-0">
//                                   <p
//                                     className="text-[10px]"
//                                     style={{ color: C.textMuted }}
//                                   >
//                                     {t.period?.slice(-5)}
//                                   </p>
//                                   <p
//                                     className="text-xs font-bold"
//                                     style={{ color: C.textPrimary }}
//                                   >
//                                     {t.score ?? t.final_score}
//                                   </p>
//                                 </div>
//                               ))}
//                             </div>
//                           </>
//                         )}
//                       </div>
//                     </Card>
//                   </div>

//                   {insights.length > 0 && (
//                     <Card>
//                       <CardHead
//                         icon={Sparkles}
//                         title="Performance Insights"
//                         sub="Auto-generated analysis"
//                         color="#7C3AED"
//                         bg="#F3E8FF"
//                       />
//                       <div className="p-4 space-y-2">
//                         {insights.map((ins, i) => {
//                           const cfg = {
//                             positive: {
//                               color: C.success,
//                               bg: C.successLight,
//                               icon: TrendingUp,
//                             },
//                             warning: {
//                               color: C.danger,
//                               bg: C.dangerLight,
//                               icon: AlertCircle,
//                             },
//                             leadership: {
//                               color: "#7C3AED",
//                               bg: "#F3E8FF",
//                               icon: Trophy,
//                             },
//                             pip: {
//                               color: C.danger,
//                               bg: C.dangerLight,
//                               icon: AlertTriangle,
//                             },
//                           }[ins.type] ?? {
//                             color: C.primary,
//                             bg: C.primaryLight,
//                             icon: Info,
//                           };
//                           const Icon = cfg.icon;
//                           return (
//                             <Motion.div
//                               key={i}
//                               custom={i}
//                               variants={fadeUp}
//                               initial="hidden"
//                               animate="visible"
//                               className="flex items-center gap-3 p-3 rounded-xl"
//                               style={{
//                                 background: cfg.bg,
//                                 border: `1px solid ${cfg.color}22`,
//                               }}
//                             >
//                               <Icon
//                                 size={14}
//                                 color={cfg.color}
//                                 className="shrink-0"
//                               />
//                               <p
//                                 className="text-xs font-medium"
//                                 style={{ color: cfg.color }}
//                               >
//                                 {ins.message}
//                               </p>
//                             </Motion.div>
//                           );
//                         })}
//                       </div>
//                     </Card>
//                   )}

//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     {[
//                       {
//                         label: "Goals In Progress",
//                         value: inProgressGoals.length,
//                         icon: Target,
//                         color: C.primary,
//                         bg: C.primaryLight,
//                       },
//                       {
//                         label: "Goals Completed",
//                         value: completedGoals.length,
//                         icon: CheckCircle2,
//                         color: C.success,
//                         bg: C.successLight,
//                       },
//                       {
//                         label: "Pending Reviews",
//                         value: pendingReviews.length,
//                         icon: Clock,
//                         color: C.warning,
//                         bg: C.warningLight,
//                       },
//                       {
//                         label: "My Appraisals",
//                         value: appraisals.length,
//                         icon: ClipboardList,
//                         color: "#7C3AED",
//                         bg: "#F3E8FF",
//                       },
//                     ].map((s, i) => (
//                       <Motion.div
//                         key={s.label}
//                         custom={i}
//                         variants={fadeUp}
//                         initial="hidden"
//                         animate="visible"
//                         whileHover={{ y: -2 }}
//                         className="rounded-2xl p-4 flex items-center gap-3"
//                         style={{
//                           background: C.surface,
//                           border: `1px solid ${C.border}`,
//                         }}
//                       >
//                         <div
//                           className="w-9 h-9 rounded-xl flex items-center justify-center"
//                           style={{ background: s.bg }}
//                         >
//                           <s.icon size={16} color={s.color} />
//                         </div>
//                         <div>
//                           <p
//                             className="text-xl font-black"
//                             style={{ color: C.textPrimary }}
//                           >
//                             {s.value}
//                           </p>
//                           <p
//                             className="text-[11px]"
//                             style={{ color: C.textSecondary }}
//                           >
//                             {s.label}
//                           </p>
//                         </div>
//                       </Motion.div>
//                     ))}
//                   </div>
//                 </Motion.div>
//               )}

//               {/* GOALS */}
//               {activeTab === "goals" && (
//                 <Motion.div
//                   key="goals"
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="space-y-4"
//                 >
//                   <Card>
//                     <CardHead
//                       icon={Target}
//                       title="My Goals & KPIs"
//                       sub={`${goals.length} goals · ${completedGoals.length} completed`}
//                       action={
//                         <Chip label={`${inProgressGoals.length} active`} />
//                       }
//                     />
//                     <div className="p-4 space-y-3">
//                       {filteredGoals.length === 0 ? (
//                         <div className="py-12 text-center">
//                           <Target
//                             size={36}
//                             color={C.textMuted}
//                             className="mx-auto mb-2"
//                           />
//                           <p
//                             className="font-semibold text-sm"
//                             style={{ color: C.textSecondary }}
//                           >
//                             {searchQuery
//                               ? "No goals match your search"
//                               : "No goals assigned yet"}
//                           </p>
//                         </div>
//                       ) : (
//                         filteredGoals.map((goal, i) => {
//                           const isExpanded = expandedGoal === goal.id;
//                           const priorityCfg =
//                             PRIORITY_MAP[goal.priority?.toLowerCase()] ??
//                             PRIORITY_MAP.medium;
//                           const isCompleted =
//                             goal.status?.toLowerCase() === "completed" ||
//                             goal.progress >= 100;
//                           return (
//                             <Motion.div
//                               key={goal.id}
//                               custom={i}
//                               variants={fadeUp}
//                               initial="hidden"
//                               animate="visible"
//                               className="rounded-2xl border overflow-hidden"
//                               style={{
//                                 borderColor: C.border,
//                                 background: C.surface,
//                               }}
//                             >
//                               <button
//                                 onClick={() =>
//                                   setExpandedGoal(isExpanded ? null : goal.id)
//                                 }
//                                 className="w-full flex items-center gap-4 p-4 text-left"
//                                 onMouseEnter={(e) =>
//                                   (e.currentTarget.style.background =
//                                     C.surfaceAlt)
//                                 }
//                                 onMouseLeave={(e) =>
//                                   (e.currentTarget.style.background =
//                                     "transparent")
//                                 }
//                               >
//                                 <div
//                                   className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
//                                   style={{
//                                     background: isCompleted
//                                       ? C.successLight
//                                       : C.primaryLight,
//                                   }}
//                                 >
//                                   {isCompleted ? (
//                                     <CheckCircle2 size={16} color={C.success} />
//                                   ) : (
//                                     <Target size={16} color={C.primary} />
//                                   )}
//                                 </div>
//                                 <div className="flex-1 min-w-0">
//                                   <div className="flex items-center gap-2 flex-wrap mb-1.5">
//                                     <p
//                                       className="font-semibold text-sm truncate"
//                                       style={{ color: C.textPrimary }}
//                                     >
//                                       {goal.title}
//                                     </p>
//                                     <Chip
//                                       label={goal.priority ?? "medium"}
//                                       color={priorityCfg.color}
//                                       bg={priorityCfg.bg}
//                                     />
//                                     {isCompleted && (
//                                       <Chip
//                                         label="✓ Complete"
//                                         color={C.success}
//                                         bg={C.successLight}
//                                       />
//                                     )}
//                                   </div>
//                                   <GoalBar
//                                     progress={goal.progress ?? 0}
//                                     label={`${goal.progress ?? 0}% complete`}
//                                   />
//                                 </div>
//                                 <div className="shrink-0 flex items-center gap-2">
//                                   <p
//                                     className="text-[11px]"
//                                     style={{ color: C.textMuted }}
//                                   >
//                                     {goal.due_date ?? goal.dueDate ?? "—"}
//                                   </p>
//                                   <Motion.div
//                                     animate={{ rotate: isExpanded ? 180 : 0 }}
//                                   >
//                                     <ChevronDown
//                                       size={14}
//                                       color={C.textMuted}
//                                     />
//                                   </Motion.div>
//                                 </div>
//                               </button>
//                               <AnimatePresence>
//                                 {isExpanded && (
//                                   <Motion.div
//                                     initial={{ height: 0, opacity: 0 }}
//                                     animate={{ height: "auto", opacity: 1 }}
//                                     exit={{ height: 0, opacity: 0 }}
//                                     transition={{ duration: 0.22 }}
//                                     className="overflow-hidden"
//                                   >
//                                     <div
//                                       className="px-4 pb-4 pt-0 space-y-3"
//                                       style={{
//                                         borderTop: `1px solid ${C.border}`,
//                                       }}
//                                     >
//                                       {goal.description && (
//                                         <p
//                                           className="text-xs leading-relaxed pt-3"
//                                           style={{ color: C.textSecondary }}
//                                         >
//                                           {goal.description}
//                                         </p>
//                                       )}
//                                       <div
//                                         className="flex items-center gap-2 text-xs"
//                                         style={{ color: C.textMuted }}
//                                       >
//                                         <Calendar size={11} />
//                                         <span>
//                                           Due:{" "}
//                                           {goal.due_date ?? goal.dueDate ?? "—"}
//                                         </span>
//                                         {goal.metric && (
//                                           <>
//                                             <span>·</span>
//                                             <span>Metric: {goal.metric}</span>
//                                           </>
//                                         )}
//                                       </div>
//                                     </div>
//                                   </Motion.div>
//                                 )}
//                               </AnimatePresence>
//                             </Motion.div>
//                           );
//                         })
//                       )}
//                     </div>
//                   </Card>
//                 </Motion.div>
//               )}

//               {/* ── APPRAISALS TAB (new) ── */}
//               {activeTab === "appraisals" && (
//                 <Motion.div
//                   key="appraisals"
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="space-y-4"
//                 >
//                   {/* Self-assessments from performance_reviews */}
//                   {pendingReviews.length > 0 && (
//                     <Card>
//                       <CardHead
//                         icon={Star}
//                         title="Pending Self-Assessments"
//                         sub="Complete these to move your review forward"
//                         color={C.warning}
//                         bg={C.warningLight}
//                         action={
//                           <Chip
//                             label={`${pendingReviews.length} pending`}
//                             color={C.warning}
//                             bg={C.warningLight}
//                           />
//                         }
//                       />
//                       <div className="p-4 space-y-3">
//                         {pendingReviews.map((rev, i) => (
//                           <Motion.div
//                             key={rev.id}
//                             custom={i}
//                             variants={fadeUp}
//                             initial="hidden"
//                             animate="visible"
//                             className="flex items-center gap-4 p-4 rounded-2xl"
//                             style={{
//                               background: C.warningLight,
//                               border: `1px solid ${C.warning}33`,
//                             }}
//                           >
//                             <div
//                               className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
//                               style={{ background: C.warning }}
//                             >
//                               <Star size={18} color="#fff" />
//                             </div>
//                             <div className="flex-1 min-w-0">
//                               <p
//                                 className="font-semibold text-sm"
//                                 style={{ color: C.textPrimary }}
//                               >
//                                 {rev.cycle_name ?? rev.cycle ?? "Review Cycle"}
//                               </p>
//                               <p
//                                 className="text-[11px] mt-0.5"
//                                 style={{ color: C.textMuted }}
//                               >
//                                 {rev.created_at
//                                   ? `Issued ${new Date(rev.created_at).toLocaleDateString("en-NG")}`
//                                   : "Awaiting your self-assessment"}
//                               </p>
//                             </div>
//                             <Motion.button
//                               whileHover={{ scale: 1.04 }}
//                               whileTap={{ scale: 0.97 }}
//                               onClick={() => setAssessModal(rev)}
//                               className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white shrink-0"
//                               style={{
//                                 background: `linear-gradient(135deg,${C.primary},#6366F1)`,
//                               }}
//                             >
//                               <Send size={11} /> Start Assessment
//                             </Motion.button>
//                           </Motion.div>
//                         ))}
//                       </div>
//                     </Card>
//                   )}

//                   {/* Manager appraisals */}
//                   <Card>
//                     <CardHead
//                       icon={ClipboardList}
//                       title="My Appraisals"
//                       sub="Manager & HR appraisals for your profile"
//                       action={
//                         appraisals.length > 0 ? (
//                           <Chip label={`${appraisals.length} total`} />
//                         ) : null
//                       }
//                     />
//                     <div className="p-4 space-y-3">
//                       {appraisals.length === 0 ? (
//                         <div className="py-12 text-center">
//                           <ClipboardList
//                             size={36}
//                             color={C.textMuted}
//                             className="mx-auto mb-2"
//                           />
//                           <p
//                             className="font-semibold text-sm"
//                             style={{ color: C.textSecondary }}
//                           >
//                             No appraisals yet
//                           </p>
//                           <p
//                             className="text-xs mt-1"
//                             style={{ color: C.textMuted }}
//                           >
//                             Your manager will create an appraisal for you.
//                           </p>
//                         </div>
//                       ) : (
//                         appraisals.map((apr, i) => {
//                           const statusCfg =
//                             APPRAISAL_STATUS[apr.status] ??
//                             APPRAISAL_STATUS.draft;
//                           const managerName = apr.manager
//                             ? `${apr.manager.firstName} ${apr.manager.lastName}`
//                             : "Manager";
//                           const isCompleted = apr.status === "completed";
//                           const isRejected = apr.status === "rejected";

//                           return (
//                             <Motion.div
//                               key={apr.id}
//                               custom={i}
//                               variants={fadeUp}
//                               initial="hidden"
//                               animate="visible"
//                               className="rounded-2xl border overflow-hidden"
//                               style={{
//                                 borderColor: isRejected
//                                   ? `${C.danger}55`
//                                   : C.border,
//                                 background: C.surface,
//                               }}
//                             >
//                               <div className="flex items-center gap-4 p-4">
//                                 <div
//                                   className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
//                                   style={{ background: statusCfg.bg }}
//                                 >
//                                   {isCompleted ? (
//                                     <CheckCircle2
//                                       size={18}
//                                       color={statusCfg.color}
//                                     />
//                                   ) : isRejected ? (
//                                     <AlertTriangle
//                                       size={18}
//                                       color={statusCfg.color}
//                                     />
//                                   ) : (
//                                     <ClipboardList
//                                       size={18}
//                                       color={statusCfg.color}
//                                     />
//                                   )}
//                                 </div>
//                                 <div className="flex-1 min-w-0">
//                                   <div className="flex items-center gap-2 flex-wrap mb-1">
//                                     <p
//                                       className="font-semibold text-sm"
//                                       style={{ color: C.textPrimary }}
//                                     >
//                                       {apr.cycleName ??
//                                         `Appraisal — ${apr.period}`}
//                                     </p>
//                                     <Chip
//                                       label={statusCfg.label}
//                                       color={statusCfg.color}
//                                       bg={statusCfg.bg}
//                                     />
//                                   </div>
//                                   <div className="flex items-center gap-3 flex-wrap">
//                                     <p
//                                       className="text-[11px]"
//                                       style={{ color: C.textMuted }}
//                                     >
//                                       By {managerName} · Period {apr.period}
//                                     </p>
//                                     {isCompleted &&
//                                       apr.appraisalScore != null && (
//                                         <span
//                                           className="text-[11px] font-bold"
//                                           style={{ color: C.success }}
//                                         >
//                                           Score:{" "}
//                                           {Math.round(apr.appraisalScore)}/100
//                                         </span>
//                                       )}
//                                   </div>
//                                 </div>

//                                 {/* Score pill when completed */}
//                                 {isCompleted && apr.appraisalScore != null && (
//                                   <div
//                                     className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg"
//                                     style={{
//                                       background: C.successLight,
//                                       color: C.success,
//                                       fontFamily: "Sora,sans-serif",
//                                     }}
//                                   >
//                                     {Math.round(apr.appraisalScore)}
//                                   </div>
//                                 )}

//                                 <Motion.button
//                                   whileHover={{ scale: 1.04 }}
//                                   whileTap={{ scale: 0.97 }}
//                                   onClick={() => setDetailAppraisal(apr)}
//                                   className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0"
//                                   style={{
//                                     background: C.primaryLight,
//                                     color: C.primary,
//                                   }}
//                                 >
//                                   <Eye size={12} /> View
//                                 </Motion.button>
//                               </div>

//                               {/* Progress bar for in-flight appraisals */}
//                               {!isCompleted && !isRejected && (
//                                 <div className="px-4 pb-4">
//                                   <div
//                                     className="flex justify-between text-[10px] mb-1"
//                                     style={{ color: C.textMuted }}
//                                   >
//                                     <span>Review Progress</span>
//                                     <span>
//                                       {apr.status === "submitted"
//                                         ? "50%"
//                                         : apr.status === "hr_scored"
//                                           ? "80%"
//                                           : "25%"}
//                                     </span>
//                                   </div>
//                                   <div
//                                     className="h-1.5 rounded-full overflow-hidden"
//                                     style={{ background: C.surfaceAlt }}
//                                   >
//                                     <div
//                                       className="h-full rounded-full transition-all duration-500"
//                                       style={{
//                                         width:
//                                           apr.status === "submitted"
//                                             ? "50%"
//                                             : apr.status === "hr_scored"
//                                               ? "80%"
//                                               : "25%",
//                                         background: statusCfg.color,
//                                       }}
//                                     />
//                                   </div>
//                                   <div className="flex justify-between mt-1.5">
//                                     {[
//                                       "Draft",
//                                       "Submitted",
//                                       "HR Review",
//                                       "Complete",
//                                     ].map((step, si) => {
//                                       const stepStatus = [
//                                         "draft",
//                                         "submitted",
//                                         "hr_scored",
//                                         "completed",
//                                       ];
//                                       const stepIdx = stepStatus.indexOf(
//                                         apr.status,
//                                       );
//                                       const done = si <= stepIdx;
//                                       return (
//                                         <span
//                                           key={step}
//                                           className="text-[9px] font-semibold"
//                                           style={{
//                                             color: done
//                                               ? statusCfg.color
//                                               : C.textMuted,
//                                           }}
//                                         >
//                                           {step}
//                                         </span>
//                                       );
//                                     })}
//                                   </div>
//                                 </div>
//                               )}

//                               {/* Rejected — show reason excerpt */}
//                               {isRejected && apr.hrFeedback && (
//                                 <div className="px-4 pb-4">
//                                   <div
//                                     className="p-3 rounded-xl text-xs"
//                                     style={{
//                                       background: C.dangerLight,
//                                       color: C.danger,
//                                     }}
//                                   >
//                                     <span className="font-bold">
//                                       Returned:{" "}
//                                     </span>
//                                     {apr.hrFeedback.slice(0, 120)}
//                                     {apr.hrFeedback.length > 120 ? "…" : ""}
//                                   </div>
//                                 </div>
//                               )}
//                             </Motion.div>
//                           );
//                         })
//                       )}
//                     </div>
//                   </Card>
//                 </Motion.div>
//               )}

//               {/* FEEDBACK */}
//               {activeTab === "feedback" && (
//                 <Motion.div
//                   key="feedback"
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="space-y-4"
//                 >
//                   <Card>
//                     <CardHead
//                       icon={MessageSquare}
//                       title="Manager Feedback"
//                       sub="Comments from your performance reviews"
//                     />
//                     <div className="p-4 space-y-4">
//                       {reviews.filter((r) => r.manager_comment).length === 0 &&
//                       appraisals.filter(
//                         (a) => a.managerFeedback && a.status === "completed",
//                       ).length === 0 ? (
//                         <div className="py-12 text-center">
//                           <MessageSquare
//                             size={36}
//                             color={C.textMuted}
//                             className="mx-auto mb-2"
//                           />
//                           <p
//                             className="font-semibold text-sm"
//                             style={{ color: C.textSecondary }}
//                           >
//                             No feedback yet
//                           </p>
//                         </div>
//                       ) : (
//                         <>
//                           {reviews
//                             .filter((r) => r.manager_comment)
//                             .map((rev, i) => (
//                               <Motion.div
//                                 key={rev.id}
//                                 custom={i}
//                                 variants={fadeUp}
//                                 initial="hidden"
//                                 animate="visible"
//                                 className="p-4 rounded-2xl"
//                                 style={{
//                                   background: C.surfaceAlt,
//                                   border: `1px solid ${C.border}`,
//                                 }}
//                               >
//                                 <div className="flex items-center gap-2 mb-2">
//                                   <div
//                                     className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
//                                     style={{
//                                       background:
//                                         "linear-gradient(135deg,#6366F1,#8B5CF6)",
//                                     }}
//                                   >
//                                     {rev.reviewed_by_name
//                                       ?.split(" ")
//                                       .map((n) => n[0])
//                                       .join("")
//                                       .slice(0, 2) ?? "HR"}
//                                   </div>
//                                   <div>
//                                     <p
//                                       className="text-xs font-semibold"
//                                       style={{ color: C.textPrimary }}
//                                     >
//                                       {rev.reviewed_by_name ?? "HR"}
//                                     </p>
//                                     <p
//                                       className="text-[10px]"
//                                       style={{ color: C.textMuted }}
//                                     >
//                                       {rev.cycle_name ?? rev.cycle}
//                                     </p>
//                                   </div>
//                                 </div>
//                                 <p
//                                   className="text-sm leading-relaxed"
//                                   style={{ color: C.textSecondary }}
//                                 >
//                                   {rev.manager_comment}
//                                 </p>
//                               </Motion.div>
//                             ))}
//                           {appraisals
//                             .filter(
//                               (a) =>
//                                 a.managerFeedback && a.status === "completed",
//                             )
//                             .map((apr, i) => {
//                               const managerName = apr.manager
//                                 ? `${apr.manager.firstName} ${apr.manager.lastName}`
//                                 : "Manager";
//                               return (
//                                 <Motion.div
//                                   key={apr.id}
//                                   custom={i}
//                                   variants={fadeUp}
//                                   initial="hidden"
//                                   animate="visible"
//                                   className="p-4 rounded-2xl"
//                                   style={{
//                                     background: C.primaryLight,
//                                     border: `1px solid ${C.primary}22`,
//                                   }}
//                                 >
//                                   <div className="flex items-center gap-2 mb-2">
//                                     <div
//                                       className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
//                                       style={{
//                                         background:
//                                           "linear-gradient(135deg,#4F46E5,#6366F1)",
//                                       }}
//                                     >
//                                       {managerName
//                                         .split(" ")
//                                         .map((n) => n[0])
//                                         .join("")
//                                         .slice(0, 2)}
//                                     </div>
//                                     <div>
//                                       <p
//                                         className="text-xs font-semibold"
//                                         style={{ color: C.primary }}
//                                       >
//                                         {managerName}
//                                       </p>
//                                       <p
//                                         className="text-[10px]"
//                                         style={{ color: C.textMuted }}
//                                       >
//                                         Appraisal —{" "}
//                                         {apr.cycleName ?? apr.period}
//                                         {apr.managerOverall != null &&
//                                           ` · Score: ${Math.round(apr.managerOverall)}/100`}
//                                       </p>
//                                     </div>
//                                   </div>
//                                   <p
//                                     className="text-sm leading-relaxed"
//                                     style={{ color: C.textPrimary }}
//                                   >
//                                     {apr.managerFeedback}
//                                   </p>
//                                   {apr.hrFeedback && (
//                                     <div
//                                       className="mt-3 pt-3"
//                                       style={{
//                                         borderTop: `1px solid ${C.primary}22`,
//                                       }}
//                                     >
//                                       <p
//                                         className="text-[10px] font-bold mb-1"
//                                         style={{ color: "#7C3AED" }}
//                                       >
//                                         HR Comment
//                                       </p>
//                                       <p
//                                         className="text-xs leading-relaxed"
//                                         style={{ color: C.textSecondary }}
//                                       >
//                                         {apr.hrFeedback}
//                                       </p>
//                                     </div>
//                                   )}
//                                 </Motion.div>
//                               );
//                             })}
//                         </>
//                       )}
//                     </div>
//                   </Card>
//                 </Motion.div>
//               )}

//               {/* HISTORY */}
//               {activeTab === "history" && (
//                 <Motion.div
//                   key="history"
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="space-y-4"
//                 >
//                   <Card>
//                     <CardHead
//                       icon={RotateCcw}
//                       title="Score History"
//                       sub="All recorded performance scores"
//                     />
//                     <div className="p-4 space-y-3">
//                       {scores.length === 0 ? (
//                         <div className="py-12 text-center">
//                           <BarChart2
//                             size={36}
//                             color={C.textMuted}
//                             className="mx-auto mb-2"
//                           />
//                           <p
//                             className="font-semibold text-sm"
//                             style={{ color: C.textSecondary }}
//                           >
//                             No score history yet
//                           </p>
//                         </div>
//                       ) : (
//                         scores.map((sc, i) => {
//                           const rCfg = RATING_MAP[sc.rating] ?? {
//                             color: C.textMuted,
//                             bg: C.surfaceAlt,
//                           };
//                           return (
//                             <Motion.div
//                               key={sc.id ?? i}
//                               custom={i}
//                               variants={fadeUp}
//                               initial="hidden"
//                               animate="visible"
//                               className="flex items-center gap-4 p-4 rounded-2xl"
//                               style={{
//                                 background: C.surfaceAlt,
//                                 border: `1px solid ${C.border}`,
//                               }}
//                             >
//                               <div
//                                 className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-black text-lg"
//                                 style={{
//                                   background: rCfg.bg,
//                                   color: rCfg.color,
//                                   fontFamily: "Sora,sans-serif",
//                                 }}
//                               >
//                                 {sc.final_score}
//                               </div>
//                               <div className="flex-1">
//                                 <div className="flex items-center gap-2 flex-wrap mb-1">
//                                   <p
//                                     className="font-semibold text-sm"
//                                     style={{ color: C.textPrimary }}
//                                   >
//                                     {sc.period}
//                                   </p>
//                                   <Chip
//                                     label={sc.rating}
//                                     color={rCfg.color}
//                                     bg={rCfg.bg}
//                                   />
//                                 </div>
//                                 <div
//                                   className="flex gap-3 text-[11px]"
//                                   style={{ color: C.textMuted }}
//                                 >
//                                   <span>KPI: {sc.kpi_score}</span>
//                                   <span>·</span>
//                                   <span>Attendance: {sc.attendance_score}</span>
//                                   <span>·</span>
//                                   <span>Training: {sc.training_score}</span>
//                                   {sc.appraisal_score != null && (
//                                     <>
//                                       <span>·</span>
//                                       <span
//                                         style={{
//                                           color: "#7C3AED",
//                                           fontWeight: 700,
//                                         }}
//                                       >
//                                         Appraisal:{" "}
//                                         {Math.round(sc.appraisal_score)}
//                                       </span>
//                                     </>
//                                   )}
//                                 </div>
//                               </div>
//                             </Motion.div>
//                           );
//                         })
//                       )}
//                     </div>
//                   </Card>
//                 </Motion.div>
//               )}
//             </AnimatePresence>

//             <div className="h-6" />
//           </main>
//         </div>
//       </div>

//       {/* Self-assessment modal */}
//       <AnimatePresence>
//         {assessModal && (
//           <AssessmentModal
//             review={assessModal}
//             onClose={() => setAssessModal(null)}
//             onSubmitted={() => {
//               setReviews((prev) =>
//                 prev.map((r) =>
//                   r.id === assessModal.id
//                     ? { ...r, status: "self_completed" }
//                     : r,
//                 ),
//               );
//               setAssessModal(null);
//               showToast("Self-assessment submitted successfully.");
//             }}
//           />
//         )}
//       </AnimatePresence>

//       {/* Appraisal detail modal (read-only) */}
//       <AnimatePresence>
//         {detailAppraisal && (
//           <AppraisalDetailModal
//             appraisal={detailAppraisal}
//             onClose={() => setDetailAppraisal(null)}
//           />
//         )}
//       </AnimatePresence>

//       {/* Toast */}
//       <AnimatePresence>
//         {toast && (
//           <Toast
//             msg={toast.msg}
//             type={toast.type}
//             onDone={() => setToast(null)}
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// // src/pages/Performance.jsx
// //
// // Shared page for ALL employees including managers.
// // Appraisals tab is ROLE-AWARE:
// //   • role === "employee"  → read-only list of appraisals received + self-assessment
// //   • role === "manager"   → same read-only view PLUS ability to create/edit/submit
// //                            appraisals for employees in their own department only
// //
// // No separate manager page needed — everything lives here.

// import { useState, useEffect, useCallback, useMemo } from "react";
// import { motion as Motion, AnimatePresence } from "framer-motion";
// import {
//   BarChart2,
//   Target,
//   Star,
//   MessageSquare,
//   ChevronDown,
//   TrendingUp,
//   Award,
//   Clock,
//   CheckCircle2,
//   AlertCircle,
//   Eye,
//   ArrowUpRight,
//   Calendar,
//   Menu,
//   Bell,
//   Search,
//   Shield,
//   Sparkles,
//   Trophy,
//   RotateCcw,
//   Send,
//   X,
//   Info,
//   RefreshCw,
//   AlertTriangle,
//   Loader2,
//   Minus,
//   ArrowDownRight,
//   ClipboardList,
//   Plus,
//   Users,
//   Lock,
// } from "lucide-react";
// import C from "../styles/colors";
// import { authApi } from "../api/service/authApi";
// import {
//   getEmployeeScores,
//   getMyGoals,
//   getMyReviews,
//   getTrends,
//   getInsights,
//   submitSelfAssessment,
// } from "../api/service/performanceApi";
// import {
//   getMyAppraisals,
//   listAppraisals,
//   createAppraisal,
//   updateAppraisal,
//   submitAppraisal,
//   listTemplates,
// } from "../api/service/appraisal.api";

// // ── Constants ─────────────────────────────────────────────────
// const TABS = [
//   { id: "overview", label: "Overview" },
//   { id: "goals", label: "Goals" },
//   { id: "appraisals", label: "Appraisals" },
//   { id: "feedback", label: "Feedback" },
//   { id: "history", label: "History" },
// ];

// const PRIORITY_MAP = {
//   high: { color: C.danger, bg: C.dangerLight },
//   medium: { color: C.warning, bg: C.warningLight },
//   low: { color: C.success, bg: C.successLight },
// };

// const RATING_MAP = {
//   Outstanding: { color: "#059669", bg: "#D1FAE5" },
//   "High Performer": { color: "#2563EB", bg: "#DBEAFE" },
//   "Meets Expectations": { color: C.warning, bg: C.warningLight },
//   "Needs Improvement": { color: C.danger, bg: C.dangerLight },
//   Underperforming: { color: "#7C3AED", bg: "#F3E8FF" },
// };

// const APPRAISAL_STATUS = {
//   draft: { label: "Draft", color: C.textMuted, bg: C.surfaceAlt },
//   submitted: { label: "Under Review", color: C.warning, bg: C.warningLight },
//   hr_scored: { label: "HR Scored", color: "#7C3AED", bg: "#F3E8FF" },
//   completed: { label: "Completed", color: C.success, bg: C.successLight },
//   rejected: { label: "Returned", color: C.danger, bg: C.dangerLight },
// };

// const CRITERIA_DEFAULTS = [
//   { label: "Job Knowledge", weight: 20, maxScore: 5 },
//   { label: "Quality of Work", weight: 20, maxScore: 5 },
//   { label: "Communication", weight: 15, maxScore: 5 },
//   { label: "Teamwork", weight: 15, maxScore: 5 },
//   { label: "Initiative", weight: 15, maxScore: 5 },
//   { label: "Professionalism", weight: 15, maxScore: 5 },
// ];

// // ── Animations ────────────────────────────────────────────────
// const fadeUp = {
//   hidden: { opacity: 0, y: 16 },
//   visible: (i = 0) => ({
//     opacity: 1,
//     y: 0,
//     transition: { delay: i * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
//   }),
// };

// // ══════════════════════════════════════════════════════════════
// // SHARED ATOMS
// // ══════════════════════════════════════════════════════════════
// function Chip({ label, color, bg }) {
//   return (
//     <span
//       className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
//       style={{ background: bg ?? C.primaryLight, color: color ?? C.primary }}
//     >
//       {label}
//     </span>
//   );
// }

// function Card({ children, className = "" }) {
//   return (
//     <div
//       className={`rounded-2xl ${className}`}
//       style={{
//         background: C.surface,
//         border: `1px solid ${C.border}`,
//         boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
//       }}
//     >
//       {children}
//     </div>
//   );
// }

// function CardHead({ icon: Icon, title, sub, color, bg, action }) {
//   return (
//     <div
//       className="flex items-center gap-3 px-5 py-4"
//       style={{ borderBottom: `1px solid ${C.border}` }}
//     >
//       <div
//         className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
//         style={{ background: bg ?? C.primaryLight }}
//       >
//         <Icon size={15} color={color ?? C.primary} />
//       </div>
//       <div className="flex-1 min-w-0">
//         <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
//           {title}
//         </p>
//         {sub && (
//           <p className="text-[11px]" style={{ color: C.textMuted }}>
//             {sub}
//           </p>
//         )}
//       </div>
//       {action && <div className="shrink-0">{action}</div>}
//     </div>
//   );
// }

// function Toast({ msg, type, onDone }) {
//   useEffect(() => {
//     const t = setTimeout(onDone, 3500);
//     return () => clearTimeout(t);
//   }, [onDone]);
//   const Icon = type === "success" ? CheckCircle2 : AlertCircle;
//   const color = type === "success" ? C.success : C.danger;
//   return (
//     <Motion.div
//       initial={{ opacity: 0, y: 40, x: "-50%" }}
//       animate={{ opacity: 1, y: 0, x: "-50%" }}
//       exit={{ opacity: 0, y: 40, x: "-50%" }}
//       className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl"
//       style={{
//         background: C.navy,
//         boxShadow: "0 12px 40px rgba(15,23,42,0.35)",
//         minWidth: 260,
//       }}
//     >
//       <Icon size={16} color={color} />
//       <span className="text-white text-sm font-semibold">{msg}</span>
//     </Motion.div>
//   );
// }

// // ── Score ring ────────────────────────────────────────────────
// function ScoreRing({ score, size = 120 }) {
//   const r = (size - 12) / 2;
//   const circ = 2 * Math.PI * r;
//   const dash = ((score ?? 0) / 100) * circ;
//   const color =
//     score >= 85
//       ? C.success
//       : score >= 60
//         ? C.primary
//         : score >= 40
//           ? C.warning
//           : C.danger;
//   return (
//     <div
//       className="relative flex items-center justify-center"
//       style={{ width: size, height: size }}
//     >
//       <svg width={size} height={size}>
//         <circle
//           cx={size / 2}
//           cy={size / 2}
//           r={r}
//           fill="none"
//           strokeWidth={10}
//           stroke={C.border}
//         />
//         <Motion.circle
//           cx={size / 2}
//           cy={size / 2}
//           r={r}
//           fill="none"
//           strokeWidth={10}
//           stroke={color}
//           strokeLinecap="round"
//           strokeDasharray={`${circ}`}
//           initial={{ strokeDashoffset: circ }}
//           animate={{ strokeDashoffset: circ - dash }}
//           transition={{ duration: 1.2, ease: "easeOut" }}
//           style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
//         />
//       </svg>
//       <div className="absolute flex flex-col items-center">
//         <span
//           className="text-3xl font-black"
//           style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
//         >
//           {score ?? "—"}
//         </span>
//         <span
//           className="text-[10px] font-semibold"
//           style={{ color: C.textMuted }}
//         >
//           / 100
//         </span>
//       </div>
//     </div>
//   );
// }

// // ── Mini trend chart ──────────────────────────────────────────
// function TrendLine({ data }) {
//   if (!data?.length) return null;
//   const W = 220;
//   const H = 60;
//   const PAD = 8;
//   const scores = data.map((d) => d.score ?? d.final_score ?? 0);
//   const min = Math.min(...scores);
//   const max = Math.max(...scores, min + 1);
//   const pts = scores
//     .map((s, i) => {
//       const x = PAD + (i / Math.max(scores.length - 1, 1)) * (W - PAD * 2);
//       const y = H - PAD - ((s - min) / (max - min + 0.01)) * (H - PAD * 2);
//       return `${x},${y}`;
//     })
//     .join(" ");
//   const last = scores.at(-1);
//   const prev = scores.at(-2);
//   const trend =
//     prev == null
//       ? "new"
//       : last > prev + 2
//         ? "up"
//         : last < prev - 2
//           ? "down"
//           : "stable";
//   const color =
//     trend === "up" ? C.success : trend === "down" ? C.danger : C.primary;
//   return (
//     <div className="flex items-center gap-3">
//       <svg width={W} height={H} style={{ overflow: "visible" }}>
//         <polyline
//           points={pts}
//           fill="none"
//           stroke={color}
//           strokeWidth={2.5}
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />
//         {scores.map((s, i) => {
//           const x = PAD + (i / Math.max(scores.length - 1, 1)) * (W - PAD * 2);
//           const y = H - PAD - ((s - min) / (max - min + 0.01)) * (H - PAD * 2);
//           return (
//             <g key={i}>
//               <circle cx={x} cy={y} r={4} fill={color} />
//               <text
//                 x={x}
//                 y={y - 8}
//                 textAnchor="middle"
//                 fontSize={8}
//                 fill={C.textMuted}
//               >
//                 {s}
//               </text>
//             </g>
//           );
//         })}
//       </svg>
//       <div className="flex items-center gap-1">
//         {trend === "up" && <ArrowUpRight size={16} color={C.success} />}
//         {trend === "down" && <ArrowDownRight size={16} color={C.danger} />}
//         {trend === "stable" && <Minus size={16} color={C.textMuted} />}
//         <span className="text-xs font-semibold" style={{ color }}>
//           {trend === "new"
//             ? "First score"
//             : trend === "stable"
//               ? "Stable"
//               : `${trend === "up" ? "+" : ""}${(last - (prev ?? last)).toFixed(0)}`}
//         </span>
//       </div>
//     </div>
//   );
// }

// // ── Goal bar ──────────────────────────────────────────────────
// function GoalBar({ progress, label }) {
//   const color =
//     progress >= 100
//       ? C.success
//       : progress >= 60
//         ? C.primary
//         : progress >= 30
//           ? C.warning
//           : C.danger;
//   return (
//     <div>
//       <div className="flex items-center justify-between mb-1">
//         <span
//           className="text-xs font-medium"
//           style={{ color: C.textSecondary }}
//         >
//           {label}
//         </span>
//         <span className="text-xs font-bold" style={{ color }}>
//           {progress}%
//         </span>
//       </div>
//       <div
//         className="h-2 rounded-full overflow-hidden"
//         style={{ background: C.surfaceAlt }}
//       >
//         <Motion.div
//           className="h-full rounded-full"
//           initial={{ width: 0 }}
//           animate={{ width: `${progress}%` }}
//           transition={{ duration: 0.8, ease: "easeOut" }}
//           style={{ background: color }}
//         />
//       </div>
//     </div>
//   );
// }

// // ── Star rating (read-only) ───────────────────────────────────
// function StarRating({ score, max = 5 }) {
//   const filled = Math.round((score / max) * 5);
//   return (
//     <div className="flex gap-0.5">
//       {[1, 2, 3, 4, 5].map((s) => (
//         <Star
//           key={s}
//           size={12}
//           fill={s <= filled ? C.warning : "none"}
//           color={s <= filled ? C.warning : C.border}
//         />
//       ))}
//     </div>
//   );
// }

// // ── Interactive star picker (for manager) ─────────────────────
// function StarPicker({ value, max = 5, onChange }) {
//   return (
//     <div className="flex gap-1">
//       {Array.from({ length: max }).map((_, i) => (
//         <button
//           key={i}
//           type="button"
//           onClick={() => onChange(i + 1)}
//           className="transition-transform hover:scale-110"
//         >
//           <Star
//             size={20}
//             fill={i < value ? C.warning : "none"}
//             color={i < value ? C.warning : C.border}
//           />
//         </button>
//       ))}
//     </div>
//   );
// }

// // ══════════════════════════════════════════════════════════════
// // APPRAISAL DETAIL MODAL  (read-only — employee & manager view
// //  of a received/created appraisal)
// // ══════════════════════════════════════════════════════════════
// function AppraisalDetailModal({ appraisal, onClose }) {
//   const statusCfg =
//     APPRAISAL_STATUS[appraisal.status] ?? APPRAISAL_STATUS.draft;
//   const managerName = appraisal.manager
//     ? `${appraisal.manager.firstName} ${appraisal.manager.lastName}`
//     : "Your Manager";
//   const hrName = appraisal.hrReviewer
//     ? `${appraisal.hrReviewer.firstName} ${appraisal.hrReviewer.lastName}`
//     : "HR";

//   return (
//     <Motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-50 flex items-center justify-center p-5"
//       style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
//       onClick={onClose}
//     >
//       <Motion.div
//         initial={{ scale: 0.93, y: 20 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.93, y: 20 }}
//         transition={{ type: "spring", stiffness: 260, damping: 24 }}
//         className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[88vh] flex flex-col"
//         style={{
//           background: C.surface,
//           boxShadow: "0 24px 64px rgba(15,23,42,0.2)",
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div
//           className="px-5 py-4 flex items-center justify-between shrink-0"
//           style={{ borderBottom: `1px solid ${C.border}` }}
//         >
//           <div className="flex items-center gap-2">
//             <div
//               className="w-8 h-8 rounded-xl flex items-center justify-center"
//               style={{ background: C.primaryLight }}
//             >
//               <ClipboardList size={14} color={C.primary} />
//             </div>
//             <div>
//               <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
//                 Appraisal — {appraisal.cycleName ?? appraisal.period}
//               </p>
//               <p className="text-[10px]" style={{ color: C.textMuted }}>
//                 Period: {appraisal.period}
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <Chip
//               label={statusCfg.label}
//               color={statusCfg.color}
//               bg={statusCfg.bg}
//             />
//             <button
//               onClick={onClose}
//               className="w-7 h-7 rounded-xl flex items-center justify-center"
//               style={{ background: C.surfaceAlt }}
//             >
//               <X size={13} color={C.textMuted} />
//             </button>
//           </div>
//         </div>

//         <div className="flex-1 overflow-y-auto p-5 space-y-5">
//           {/* Score summary — shown when any score exists */}
//           {(appraisal.appraisalScore != null ||
//             appraisal.managerOverall != null) && (
//             <div className="grid grid-cols-3 gap-3">
//               {[
//                 {
//                   label: "Manager Score",
//                   value:
//                     appraisal.managerOverall != null
//                       ? Math.round(appraisal.managerOverall)
//                       : "—",
//                   color: C.primary,
//                   bg: C.primaryLight,
//                 },
//                 {
//                   label: "HR Score",
//                   value:
//                     appraisal.hrOverall != null
//                       ? Math.round(appraisal.hrOverall)
//                       : "—",
//                   color: "#7C3AED",
//                   bg: "#F3E8FF",
//                 },
//                 {
//                   label: "Final Score",
//                   value:
//                     appraisal.appraisalScore != null
//                       ? Math.round(appraisal.appraisalScore)
//                       : "—",
//                   color: C.success,
//                   bg: C.successLight,
//                 },
//               ].map((s) => (
//                 <div
//                   key={s.label}
//                   className="rounded-xl p-3 text-center"
//                   style={{ background: s.bg }}
//                 >
//                   <p
//                     className="text-xl font-black"
//                     style={{ color: s.color, fontFamily: "Sora,sans-serif" }}
//                   >
//                     {s.value}
//                   </p>
//                   <p
//                     className="text-[10px] font-semibold mt-0.5"
//                     style={{ color: s.color }}
//                   >
//                     {s.label}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Manager ratings */}
//           {Array.isArray(appraisal.managerRatings) &&
//             appraisal.managerRatings.length > 0 && (
//               <div>
//                 <p
//                   className="text-xs font-bold mb-2"
//                   style={{ color: C.textMuted }}
//                 >
//                   Manager Ratings
//                 </p>
//                 <div
//                   className="rounded-xl overflow-hidden"
//                   style={{ border: `1px solid ${C.border}` }}
//                 >
//                   {appraisal.managerRatings.map((r, i) => (
//                     <div
//                       key={i}
//                       className="flex items-center justify-between px-4 py-3"
//                       style={{
//                         background: i % 2 === 0 ? C.surface : C.surfaceAlt,
//                         borderBottom:
//                           i < appraisal.managerRatings.length - 1
//                             ? `1px solid ${C.border}`
//                             : "none",
//                       }}
//                     >
//                       <div>
//                         <p
//                           className="text-xs font-semibold"
//                           style={{ color: C.textPrimary }}
//                         >
//                           {r.label}
//                         </p>
//                         {r.comment && (
//                           <p
//                             className="text-[10px] mt-0.5"
//                             style={{ color: C.textMuted }}
//                           >
//                             {r.comment}
//                           </p>
//                         )}
//                       </div>
//                       <div className="flex items-center gap-2 shrink-0">
//                         <StarRating score={r.score} max={r.maxScore ?? 5} />
//                         <span
//                           className="text-xs font-bold w-8 text-right"
//                           style={{ color: C.primary }}
//                         >
//                           {r.score}/{r.maxScore ?? 5}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//           {/* Manager feedback */}
//           {appraisal.managerFeedback && (
//             <div
//               className="rounded-xl p-4"
//               style={{
//                 background: C.primaryLight,
//                 border: `1px solid ${C.primary}22`,
//               }}
//             >
//               <div className="flex items-center gap-2 mb-2">
//                 <div
//                   className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
//                   style={{
//                     background: "linear-gradient(135deg,#4F46E5,#6366F1)",
//                   }}
//                 >
//                   {managerName
//                     .split(" ")
//                     .map((n) => n[0])
//                     .join("")
//                     .slice(0, 2)}
//                 </div>
//                 <div>
//                   <p className="text-xs font-bold" style={{ color: C.primary }}>
//                     {managerName}
//                   </p>
//                   <p className="text-[10px]" style={{ color: C.textMuted }}>
//                     {appraisal.submittedAt
//                       ? new Date(appraisal.submittedAt).toLocaleDateString(
//                           "en-NG",
//                         )
//                       : "Manager"}
//                   </p>
//                 </div>
//               </div>
//               <p
//                 className="text-xs leading-relaxed"
//                 style={{ color: C.textPrimary }}
//               >
//                 {appraisal.managerFeedback}
//               </p>
//             </div>
//           )}

//           {/* HR ratings — only after completed */}
//           {appraisal.status === "completed" &&
//             Array.isArray(appraisal.hrRatings) &&
//             appraisal.hrRatings.length > 0 && (
//               <div>
//                 <p
//                   className="text-xs font-bold mb-2"
//                   style={{ color: C.textMuted }}
//                 >
//                   HR Ratings
//                 </p>
//                 <div
//                   className="rounded-xl overflow-hidden"
//                   style={{ border: `1px solid ${C.border}` }}
//                 >
//                   {appraisal.hrRatings.map((r, i) => (
//                     <div
//                       key={i}
//                       className="flex items-center justify-between px-4 py-3"
//                       style={{
//                         background: i % 2 === 0 ? C.surface : C.surfaceAlt,
//                         borderBottom:
//                           i < appraisal.hrRatings.length - 1
//                             ? `1px solid ${C.border}`
//                             : "none",
//                       }}
//                     >
//                       <div>
//                         <p
//                           className="text-xs font-semibold"
//                           style={{ color: C.textPrimary }}
//                         >
//                           {r.label}
//                         </p>
//                         {r.comment && (
//                           <p
//                             className="text-[10px] mt-0.5"
//                             style={{ color: C.textMuted }}
//                           >
//                             {r.comment}
//                           </p>
//                         )}
//                       </div>
//                       <div className="flex items-center gap-2 shrink-0">
//                         <StarRating score={r.score} max={r.maxScore ?? 5} />
//                         <span
//                           className="text-xs font-bold w-8 text-right"
//                           style={{ color: "#7C3AED" }}
//                         >
//                           {r.score}/{r.maxScore ?? 5}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//           {/* HR feedback — only after completed */}
//           {appraisal.status === "completed" && appraisal.hrFeedback && (
//             <div
//               className="rounded-xl p-4"
//               style={{ background: "#F3E8FF", border: "1px solid #7C3AED22" }}
//             >
//               <div className="flex items-center gap-2 mb-2">
//                 <div
//                   className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
//                   style={{
//                     background: "linear-gradient(135deg,#7C3AED,#9333EA)",
//                   }}
//                 >
//                   {hrName
//                     .split(" ")
//                     .map((n) => n[0])
//                     .join("")
//                     .slice(0, 2)}
//                 </div>
//                 <div>
//                   <p className="text-xs font-bold" style={{ color: "#7C3AED" }}>
//                     {hrName} · HR Review
//                   </p>
//                   <p className="text-[10px]" style={{ color: C.textMuted }}>
//                     {appraisal.hrReviewedAt
//                       ? new Date(appraisal.hrReviewedAt).toLocaleDateString(
//                           "en-NG",
//                         )
//                       : "HR"}
//                   </p>
//                 </div>
//               </div>
//               <p
//                 className="text-xs leading-relaxed"
//                 style={{ color: C.textPrimary }}
//               >
//                 {appraisal.hrFeedback}
//               </p>
//             </div>
//           )}

//           {/* Rejected note */}
//           {appraisal.status === "rejected" && appraisal.hrFeedback && (
//             <div
//               className="rounded-xl p-4"
//               style={{
//                 background: C.dangerLight,
//                 border: `1px solid ${C.danger}22`,
//               }}
//             >
//               <p className="text-xs font-bold mb-1" style={{ color: C.danger }}>
//                 Returned to Manager
//               </p>
//               <p
//                 className="text-xs leading-relaxed"
//                 style={{ color: C.textPrimary }}
//               >
//                 {appraisal.hrFeedback}
//               </p>
//             </div>
//           )}

//           {/* In-progress status note */}
//           {["submitted", "hr_scored"].includes(appraisal.status) && (
//             <div
//               className="rounded-xl p-4 flex items-center gap-3"
//               style={{
//                 background: C.warningLight,
//                 border: `1px solid ${C.warning}22`,
//               }}
//             >
//               <Clock size={14} color={C.warning} className="shrink-0" />
//               <p className="text-xs" style={{ color: C.textPrimary }}>
//                 {appraisal.status === "submitted"
//                   ? "Submitted by your manager and now in the HR review queue."
//                   : "HR has scored this. Pending final sign-off."}
//               </p>
//             </div>
//           )}
//         </div>

//         <div className="px-5 pb-5 shrink-0">
//           <button
//             onClick={onClose}
//             className="w-full py-2.5 rounded-xl text-sm font-semibold"
//             style={{
//               background: C.surfaceAlt,
//               border: `1px solid ${C.border}`,
//               color: C.textSecondary,
//             }}
//           >
//             Close
//           </button>
//         </div>
//       </Motion.div>
//     </Motion.div>
//   );
// }

// // ══════════════════════════════════════════════════════════════
// // CREATE / EDIT APPRAISAL MODAL  (manager-only)
// // Department guard: only shows employees in the manager's dept.
// // ══════════════════════════════════════════════════════════════
// function CreateAppraisalModal({
//   deptEmployees,
//   templates,
//   editAppraisal,
//   onClose,
//   onSaved,
// }) {
//   const isEdit = !!editAppraisal;

//   const [employeeId, setEmployeeId] = useState(editAppraisal?.employeeId ?? "");
//   const [period, setPeriod] = useState(
//     editAppraisal?.period ?? new Date().toISOString().slice(0, 7),
//   );
//   const [cycleName, setCycleName] = useState(editAppraisal?.cycleName ?? "");
//   const [templateId, setTemplateId] = useState(editAppraisal?.templateId ?? "");
//   const [feedback, setFeedback] = useState(
//     editAppraisal?.managerFeedback ?? "",
//   );
//   const [ratings, setRatings] = useState(() =>
//     editAppraisal?.managerRatings?.length
//       ? editAppraisal.managerRatings.map((r) => ({
//           ...r,
//           score: r.score ?? 0,
//           comment: r.comment ?? "",
//         }))
//       : CRITERIA_DEFAULTS.map((c) => ({ ...c, score: 0, comment: "" })),
//   );
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   // When template changes swap out criteria
//   useEffect(() => {
//     if (!templateId) {
//       setRatings(
//         CRITERIA_DEFAULTS.map((c) => ({ ...c, score: 0, comment: "" })),
//       );
//       return;
//     }
//     const tmpl = templates.find((t) => t.id === templateId);
//     if (tmpl?.criteria?.length) {
//       setRatings(
//         tmpl.criteria
//           .filter((c) => c?.label)
//           .map((c) => ({
//             label: c.label,
//             weight: c.weight ?? 100 / tmpl.criteria.length,
//             maxScore: c.max_score ?? 5,
//             score: 0,
//             comment: "",
//           })),
//       );
//     }
//   }, [templateId, templates]);

//   const setRating = (i, field, val) =>
//     setRatings((prev) =>
//       prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)),
//     );

//   const handleSave = async (andSubmit = false) => {
//     if (!employeeId) {
//       setError("Select an employee.");
//       return;
//     }
//     if (!period) {
//       setError("Period is required.");
//       return;
//     }
//     setSaving(true);
//     setError("");
//     try {
//       const payload = {
//         period,
//         cycleName: cycleName || undefined,
//         templateId: templateId || undefined,
//         managerFeedback: feedback || undefined,
//         managerRatings: ratings.filter((r) => r.score > 0),
//       };
//       let appraisal;
//       if (isEdit) {
//         const res = await updateAppraisal(editAppraisal.id, payload);
//         appraisal = res.appraisal;
//       } else {
//         const res = await createAppraisal(employeeId, payload);
//         appraisal = res.appraisal;
//       }
//       if (andSubmit && appraisal?.id) {
//         await submitAppraisal(appraisal.id);
//       }
//       onSaved(
//         andSubmit
//           ? "Appraisal submitted to HR."
//           : isEdit
//             ? "Draft updated."
//             : "Draft saved.",
//       );
//     } catch (err) {
//       setError(err?.response?.data?.message ?? "Failed to save appraisal.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-50 flex items-center justify-center p-4"
//       style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
//       onClick={onClose}
//     >
//       <Motion.div
//         initial={{ scale: 0.95, y: 20 }}
//         animate={{ scale: 1, y: 0 }}
//         transition={{ type: "spring", stiffness: 260, damping: 24 }}
//         className="relative w-full max-w-2xl rounded-2xl overflow-hidden max-h-[92vh] flex flex-col"
//         style={{
//           background: C.surface,
//           border: `1px solid ${C.border}`,
//           boxShadow: "0 24px 64px rgba(15,23,42,0.25)",
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div
//           className="flex items-center justify-between px-5 py-4 shrink-0"
//           style={{ borderBottom: `1px solid ${C.border}` }}
//         >
//           <div className="flex items-center gap-2">
//             <div
//               className="w-8 h-8 rounded-xl flex items-center justify-center"
//               style={{ background: C.primaryLight }}
//             >
//               <ClipboardList size={14} color={C.primary} />
//             </div>
//             <div>
//               <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
//                 {isEdit ? "Edit Draft Appraisal" : "New Appraisal"}
//               </p>
//               <p className="text-[10px]" style={{ color: C.textMuted }}>
//                 Scores submitted to HR for final review
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="w-7 h-7 rounded-xl flex items-center justify-center"
//             style={{ background: C.surfaceAlt }}
//           >
//             <X size={13} color={C.textMuted} />
//           </button>
//         </div>

//         <div className="flex-1 overflow-y-auto p-5 space-y-5">
//           {error && (
//             <div
//               className="flex items-center gap-2 p-3 rounded-xl"
//               style={{ background: C.dangerLight }}
//             >
//               <AlertTriangle size={13} color={C.danger} />
//               <p className="text-xs" style={{ color: C.danger }}>
//                 {error}
//               </p>
//             </div>
//           )}

//           {/* Department scope notice */}
//           <div
//             className="flex items-center gap-2 p-3 rounded-xl"
//             style={{
//               background: C.primaryLight,
//               border: `1px solid ${C.primary}22`,
//             }}
//           >
//             <Shield size={13} color={C.primary} className="shrink-0" />
//             <p className="text-xs" style={{ color: C.primary }}>
//               You can only appraise employees in your own department.
//             </p>
//           </div>

//           {/* Top fields */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <label
//                 className="block text-xs font-semibold mb-1"
//                 style={{ color: C.textPrimary }}
//               >
//                 Employee <span style={{ color: C.danger }}>*</span>
//               </label>
//               <select
//                 value={employeeId}
//                 onChange={(e) => setEmployeeId(e.target.value)}
//                 disabled={isEdit}
//                 className="w-full px-3 py-2 rounded-xl text-sm outline-none"
//                 style={{
//                   background: C.surfaceAlt,
//                   border: `1.5px solid ${C.border}`,
//                   color: C.textPrimary,
//                   opacity: isEdit ? 0.6 : 1,
//                 }}
//               >
//                 <option value="">— Select employee —</option>
//                 {deptEmployees.map((e) => (
//                   <option key={e.id} value={e.id}>
//                     {e.first_name ?? e.firstName} {e.last_name ?? e.lastName}
//                     {(e.job_role_name ?? e.jobRole)
//                       ? ` · ${e.job_role_name ?? e.jobRole}`
//                       : ""}
//                   </option>
//                 ))}
//               </select>
//               {deptEmployees.length === 0 && (
//                 <p className="text-[10px] mt-1" style={{ color: C.textMuted }}>
//                   No employees found in your department.
//                 </p>
//               )}
//             </div>
//             <div>
//               <label
//                 className="block text-xs font-semibold mb-1"
//                 style={{ color: C.textPrimary }}
//               >
//                 Period <span style={{ color: C.danger }}>*</span>
//               </label>
//               <input
//                 type="month"
//                 value={period}
//                 onChange={(e) => setPeriod(e.target.value)}
//                 className="w-full px-3 py-2 rounded-xl text-sm outline-none"
//                 style={{
//                   background: C.surfaceAlt,
//                   border: `1.5px solid ${C.border}`,
//                   color: C.textPrimary,
//                 }}
//               />
//             </div>
//             <div>
//               <label
//                 className="block text-xs font-semibold mb-1"
//                 style={{ color: C.textPrimary }}
//               >
//                 Cycle Name (optional)
//               </label>
//               <input
//                 value={cycleName}
//                 onChange={(e) => setCycleName(e.target.value)}
//                 placeholder="e.g. H1 2025 Review"
//                 className="w-full px-3 py-2 rounded-xl text-sm outline-none"
//                 style={{
//                   background: C.surfaceAlt,
//                   border: `1.5px solid ${C.border}`,
//                   color: C.textPrimary,
//                 }}
//               />
//             </div>
//             <div>
//               <label
//                 className="block text-xs font-semibold mb-1"
//                 style={{ color: C.textPrimary }}
//               >
//                 Template (optional)
//               </label>
//               <select
//                 value={templateId}
//                 onChange={(e) => setTemplateId(e.target.value)}
//                 className="w-full px-3 py-2 rounded-xl text-sm outline-none"
//                 style={{
//                   background: C.surfaceAlt,
//                   border: `1.5px solid ${C.border}`,
//                   color: C.textPrimary,
//                 }}
//               >
//                 <option value="">— Default criteria —</option>
//                 {templates.map((t) => (
//                   <option key={t.id} value={t.id}>
//                     {t.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Criteria ratings */}
//           <div>
//             <p
//               className="text-xs font-bold mb-3"
//               style={{ color: C.textPrimary }}
//             >
//               Performance Criteria
//             </p>
//             <div className="space-y-3">
//               {ratings.map((r, i) => (
//                 <div
//                   key={i}
//                   className="rounded-xl p-4"
//                   style={{
//                     background: C.surfaceAlt,
//                     border: `1px solid ${C.border}`,
//                   }}
//                 >
//                   <div className="flex items-start justify-between gap-4">
//                     <div className="flex-1">
//                       <p
//                         className="text-sm font-semibold"
//                         style={{ color: C.textPrimary }}
//                       >
//                         {r.label}
//                       </p>
//                       <p className="text-[10px]" style={{ color: C.textMuted }}>
//                         Weight: {r.weight}%
//                       </p>
//                     </div>
//                     <div className="shrink-0">
//                       <StarPicker
//                         value={r.score}
//                         max={r.maxScore ?? 5}
//                         onChange={(v) => setRating(i, "score", v)}
//                       />
//                       <p
//                         className="text-[10px] text-right mt-1"
//                         style={{ color: r.score > 0 ? C.warning : C.textMuted }}
//                       >
//                         {r.score > 0
//                           ? `${r.score} / ${r.maxScore ?? 5}`
//                           : "Not rated"}
//                       </p>
//                     </div>
//                   </div>
//                   <input
//                     value={r.comment}
//                     onChange={(e) => setRating(i, "comment", e.target.value)}
//                     placeholder="Optional comment…"
//                     className="mt-2 w-full px-3 py-1.5 rounded-lg text-xs outline-none"
//                     style={{
//                       background: C.surface,
//                       border: `1px solid ${C.border}`,
//                       color: C.textPrimary,
//                     }}
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Overall feedback */}
//           <div>
//             <label
//               className="block text-xs font-semibold mb-1"
//               style={{ color: C.textPrimary }}
//             >
//               Overall Feedback
//             </label>
//             <textarea
//               rows={4}
//               value={feedback}
//               onChange={(e) => setFeedback(e.target.value)}
//               placeholder="Provide overall performance feedback for this employee…"
//               className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
//               style={{
//                 background: C.surfaceAlt,
//                 border: `1.5px solid ${C.border}`,
//                 color: C.textPrimary,
//               }}
//             />
//           </div>
//         </div>

//         {/* Footer */}
//         <div
//           className="flex gap-3 px-5 pb-5 shrink-0"
//           style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}
//         >
//           <button
//             onClick={onClose}
//             className="py-2.5 px-4 rounded-xl text-sm font-semibold"
//             style={{
//               background: C.surfaceAlt,
//               color: C.textSecondary,
//               border: `1px solid ${C.border}`,
//             }}
//           >
//             Cancel
//           </button>
//           <Motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={() => handleSave(false)}
//             disabled={saving}
//             className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
//             style={{
//               background: C.surfaceAlt,
//               color: C.textPrimary,
//               border: `1px solid ${C.border}`,
//               opacity: saving ? 0.7 : 1,
//             }}
//           >
//             {saving ? <Loader2 size={13} className="animate-spin" /> : null}
//             Save Draft
//           </Motion.button>
//           <Motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={() => handleSave(true)}
//             disabled={saving}
//             className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
//             style={{ background: C.primary, opacity: saving ? 0.8 : 1 }}
//           >
//             {saving ? (
//               <Loader2 size={13} className="animate-spin" />
//             ) : (
//               <Send size={13} />
//             )}
//             Submit to HR
//           </Motion.button>
//         </div>
//       </Motion.div>
//     </Motion.div>
//   );
// }

// // ══════════════════════════════════════════════════════════════
// // SELF-ASSESSMENT MODAL
// // ══════════════════════════════════════════════════════════════
// function AssessmentModal({ review, onClose, onSubmitted }) {
//   const [answers, setAnswers] = useState({});
//   const [comment, setComment] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async () => {
//     setSaving(true);
//     try {
//       await submitSelfAssessment(review.id, {
//         sections: answers,
//         overallComment: comment,
//       });
//       onSubmitted();
//     } catch (err) {
//       setError(err?.response?.data?.message ?? "Failed to submit assessment.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const sections = review.sections ?? [
//     { key: "achievements", label: "Key Achievements this period" },
//     { key: "challenges", label: "Challenges faced & how you overcame them" },
//     { key: "goals_progress", label: "Progress on assigned goals" },
//     { key: "development", label: "Skills developed / training completed" },
//     { key: "next_period", label: "Goals & focus for next period" },
//   ];

//   return (
//     <Motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-50 flex items-center justify-center p-5"
//       style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
//       onClick={onClose}
//     >
//       <Motion.div
//         initial={{ scale: 0.93, y: 20 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.93, y: 20 }}
//         transition={{ type: "spring", stiffness: 260, damping: 24 }}
//         className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
//         style={{
//           background: C.surface,
//           boxShadow: "0 24px 64px rgba(15,23,42,0.2)",
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div
//           className="px-5 py-4 flex items-center justify-between shrink-0"
//           style={{ borderBottom: `1px solid ${C.border}` }}
//         >
//           <div className="flex items-center gap-2">
//             <div
//               className="w-8 h-8 rounded-xl flex items-center justify-center"
//               style={{ background: C.primaryLight }}
//             >
//               <Star size={14} color={C.primary} />
//             </div>
//             <div>
//               <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
//                 Self Assessment
//               </p>
//               <p className="text-[10px]" style={{ color: C.textMuted }}>
//                 {review.cycle_name ?? review.cycle ?? "Current Cycle"}
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="w-7 h-7 rounded-xl flex items-center justify-center"
//             style={{ background: C.surfaceAlt }}
//           >
//             <X size={13} color={C.textMuted} />
//           </button>
//         </div>

//         <div className="flex-1 overflow-y-auto p-5 space-y-4">
//           {error && (
//             <div
//               className="flex items-center gap-2 p-3 rounded-xl"
//               style={{ background: C.dangerLight }}
//             >
//               <AlertTriangle size={13} color={C.danger} />
//               <p className="text-xs" style={{ color: C.danger }}>
//                 {error}
//               </p>
//             </div>
//           )}
//           {sections.map((section) => (
//             <div key={section.key ?? section.id}>
//               <label
//                 className="block text-xs font-semibold mb-1"
//                 style={{ color: C.textPrimary }}
//               >
//                 {section.label ?? section.title}
//               </label>
//               <textarea
//                 rows={3}
//                 value={answers[section.key ?? section.id] ?? ""}
//                 onChange={(e) =>
//                   setAnswers((p) => ({
//                     ...p,
//                     [section.key ?? section.id]: e.target.value,
//                   }))
//                 }
//                 placeholder="Write your response here..."
//                 className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
//                 style={{
//                   background: C.surfaceAlt,
//                   border: `1.5px solid ${C.border}`,
//                   color: C.textPrimary,
//                 }}
//               />
//             </div>
//           ))}
//           <div>
//             <label
//               className="block text-xs font-semibold mb-1"
//               style={{ color: C.textPrimary }}
//             >
//               Overall Comments
//             </label>
//             <textarea
//               rows={3}
//               value={comment}
//               onChange={(e) => setComment(e.target.value)}
//               placeholder="Any additional comments for your reviewer..."
//               className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
//               style={{
//                 background: C.surfaceAlt,
//                 border: `1.5px solid ${C.border}`,
//                 color: C.textPrimary,
//               }}
//             />
//           </div>
//         </div>

//         <div className="flex gap-3 px-5 pb-5 shrink-0">
//           <button
//             onClick={onClose}
//             className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
//             style={{
//               background: C.surfaceAlt,
//               border: `1px solid ${C.border}`,
//               color: C.textSecondary,
//             }}
//           >
//             Cancel
//           </button>
//           <Motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={handleSubmit}
//             disabled={saving}
//             className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
//             style={{ background: C.primary, opacity: saving ? 0.8 : 1 }}
//           >
//             {saving ? (
//               <Loader2 size={13} className="animate-spin" />
//             ) : (
//               <Send size={13} />
//             )}
//             Submit Assessment
//           </Motion.button>
//         </div>
//       </Motion.div>
//     </Motion.div>
//   );
// }

// // ══════════════════════════════════════════════════════════════
// // MAIN PAGE
// // ══════════════════════════════════════════════════════════════
// export default function PerformancePage() {
//   const [employee, setEmployee] = useState(null);
//   const [scores, setScores] = useState([]);
//   const [latestScore, setLatestScore] = useState(null);
//   const [trends, setTrends] = useState([]);
//   const [goals, setGoals] = useState([]);
//   const [reviews, setReviews] = useState([]);
//   // Appraisals I RECEIVED (all roles)
//   const [myAppraisals, setMyAppraisals] = useState([]);
//   // Appraisals I CREATED as manager (manager-only)
//   const [mgrAppraisals, setMgrAppraisals] = useState([]);
//   // Department employees for the create modal (manager-only)
//   const [deptEmployees, setDeptEmployees] = useState([]);
//   const [templates, setTemplates] = useState([]);
//   const [insights, setInsights] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchFocused, setSearchFocused] = useState(false);
//   const [activeTab, setActiveTab] = useState("overview");
//   const [expandedGoal, setExpandedGoal] = useState(null);
//   // Modals
//   const [assessModal, setAssessModal] = useState(null); // self-assessment
//   const [detailModal, setDetailModal] = useState(null); // read-only appraisal view
//   const [createModal, setCreateModal] = useState(null); // null | "new" | appraisal obj
//   const [toast, setToast] = useState(null);

//   const showToast = (msg, type = "success") => setToast({ msg, type });

//   const isManager = ["manager", "admin"].includes(employee?.role);

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const me = await authApi.getMe();
//       const empId = me.employee_id ?? me.employeeId;
//       if (!empId)
//         throw new Error("No employee profile linked to this account.");

//       const emp = {
//         id: empId,
//         name: `${me.firstName ?? me.first_name} ${me.lastName ?? me.last_name}`,
//         initials:
//           `${(me.firstName ?? me.first_name ?? "?")[0]}${(me.lastName ?? me.last_name ?? "?")[0]}`.toUpperCase(),
//         role: me.role,
//         departmentId: me.department_id ?? me.departmentId,
//         department: me.department_name ?? me.department ?? "",
//         email: me.email,
//       };
//       setEmployee(emp);

//       const isManagerRole = ["manager", "admin"].includes(me.role);

//       // Base parallel fetches
//       const fetches = [
//         getEmployeeScores(empId),
//         getMyGoals(),
//         getMyReviews(),
//         getTrends(empId),
//         getInsights(empId),
//         getMyAppraisals(),
//       ];

//       // Manager-only additional fetches
//       if (isManagerRole) {
//         fetches.push(
//           listAppraisals({ managerId: empId }), // appraisals I created
//           listTemplates(), // for create modal
//         );
//         // Fetch dept employees from the employees API if available
//         try {
//           const empMod = await import("../api/service/performanceApi");
//           if (empMod.getEmployees)
//             fetches.push(
//               empMod.getEmployees({
//                 departmentId: me.department_id ?? me.departmentId,
//               }),
//             );
//           else if (empMod.getAllEmployees)
//             fetches.push(empMod.getAllEmployees());
//           else fetches.push(Promise.resolve(null));
//         } catch {
//           fetches.push(Promise.resolve(null));
//         }
//       }

//       const results = await Promise.allSettled(fetches);

//       const g = (i) =>
//         results[i]?.status === "fulfilled" ? results[i].value : null;

//       setScores(g(0)?.data ?? []);
//       setLatestScore((g(0)?.data ?? [])[0] ?? null);
//       setGoals(g(1)?.data ?? g(1)?.goals ?? []);
//       setReviews(g(2)?.data ?? g(2)?.reviews ?? []);
//       setTrends(g(3)?.data ?? g(3)?.trends ?? []);
//       setInsights(g(4)?.data ?? g(4) ?? []);
//       setMyAppraisals(g(5)?.appraisals ?? []);

//       if (isManagerRole) {
//         setMgrAppraisals(g(6)?.appraisals ?? []);
//         setTemplates(g(7)?.templates ?? []);

//         // Department employees: filter to own dept if not admin
//         const rawEmps = g(8)?.data ?? g(8)?.employees ?? [];
//         const deptId = me.department_id ?? me.departmentId;
//         const filtered =
//           me.role === "admin" || !deptId
//             ? rawEmps
//             : rawEmps.filter(
//                 (e) => (e.department_id ?? e.departmentId) === deptId,
//               );
//         // Exclude self from the list
//         setDeptEmployees(filtered.filter((e) => e.id !== empId));
//       }
//     } catch (err) {
//       setError(
//         err?.response?.data?.message ??
//           err.message ??
//           "Failed to load performance data.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     load();
//   }, [load]);

//   // Derived
//   const pendingReviews = reviews.filter(
//     (r) => r.status?.toLowerCase() === "pending",
//   );
//   const completedGoals = goals.filter(
//     (g) => g.status?.toLowerCase() === "completed" || g.progress >= 100,
//   );
//   const inProgressGoals = goals.filter(
//     (g) => g.status?.toLowerCase() === "in_progress" && g.progress < 100,
//   );
//   const pendingMgrDrafts = mgrAppraisals.filter((a) =>
//     ["draft", "rejected"].includes(a.status),
//   );

//   const filteredGoals = useMemo(() => {
//     const q = searchQuery.toLowerCase();
//     return goals.filter(
//       (g) =>
//         !q ||
//         g.title?.toLowerCase().includes(q) ||
//         g.description?.toLowerCase().includes(q),
//     );
//   }, [goals, searchQuery]);

//   const ratingCfg = RATING_MAP[latestScore?.rating] ?? {
//     color: C.textMuted,
//     bg: C.surfaceAlt,
//   };

//   // Appraisal tab badge: received appraisals + manager pending drafts
//   const appraisalBadge =
//     myAppraisals.length + (isManager ? pendingMgrDrafts.length : 0);

//   // Quick submit draft helper
//   const handleSubmitDraft = async (appraisal) => {
//     try {
//       await submitAppraisal(appraisal.id);
//       showToast("Appraisal submitted to HR.");
//       load();
//     } catch (err) {
//       showToast(err?.response?.data?.message ?? "Submit failed.", "error");
//     }
//   };

//   if (loading)
//     return (
//       <div
//         className="min-h-screen flex items-center justify-center"
//         style={{ background: C.bg }}
//       >
//         <Loader2
//           size={28}
//           className="animate-spin"
//           style={{ color: C.primary }}
//         />
//       </div>
//     );

//   return (
//     <div
//       className="min-h-screen"
//       style={{
//         background: C.bg,
//         color: C.textPrimary,
//         fontFamily: "'DM Sans','Sora',sans-serif",
//       }}
//     >
//       <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>

//       <div className="flex h-screen overflow-hidden">
//         <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
//           {/* ── TOPBAR ── */}
//           <header
//             className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
//             style={{
//               background: "rgba(240,242,248,0.9)",
//               backdropFilter: "blur(12px)",
//               borderBottom: `1px solid ${C.border}`,
//             }}
//           >
//             <Motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setSidebarOpen((p) => !p)}
//               className="p-2 rounded-xl hidden md:flex"
//               style={{ background: C.surface }}
//             >
//               <Menu size={16} color={C.textSecondary} />
//             </Motion.button>

//             <Motion.div
//               className="flex-1 max-w-xs relative"
//               animate={{ width: searchFocused ? "320px" : "240px" }}
//             >
//               <Search
//                 size={14}
//                 className="absolute left-3 top-1/2 -translate-y-1/2"
//                 color={C.textMuted}
//               />
//               <input
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 onFocus={() => setSearchFocused(true)}
//                 onBlur={() => setSearchFocused(false)}
//                 placeholder="Search goals..."
//                 className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
//                 style={{
//                   background: C.surface,
//                   border: `1.5px solid ${searchFocused ? C.primary : C.border}`,
//                   color: C.textPrimary,
//                 }}
//               />
//             </Motion.div>

//             <div className="flex items-center gap-2 ml-auto">
//               <Motion.button
//                 whileHover={{ scale: 1.05 }}
//                 onClick={load}
//                 className="w-8 h-8 rounded-xl flex items-center justify-center"
//                 style={{
//                   background: C.surface,
//                   border: `1px solid ${C.border}`,
//                 }}
//               >
//                 <RefreshCw size={14} color={C.textSecondary} />
//               </Motion.button>
//               <div className="relative">
//                 <Motion.button
//                   className="p-2 rounded-xl"
//                   style={{
//                     background: C.surface,
//                     border: `1px solid ${C.border}`,
//                   }}
//                 >
//                   <Bell size={16} color={C.textSecondary} />
//                 </Motion.button>
//                 {pendingReviews.length + pendingMgrDrafts.length > 0 && (
//                   <span
//                     className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
//                     style={{ background: C.warning }}
//                   >
//                     {pendingReviews.length + pendingMgrDrafts.length}
//                   </span>
//                 )}
//               </div>
//               {employee && (
//                 <div
//                   className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
//                   style={{
//                     background: "linear-gradient(135deg,#4F46E5,#06B6D4)",
//                   }}
//                 >
//                   {employee.initials}
//                 </div>
//               )}
//             </div>
//           </header>

//           <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
//             {/* ── HERO ── */}
//             <Motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="rounded-2xl p-6 text-white relative overflow-hidden"
//               style={{
//                 background:
//                   "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
//               }}
//             >
//               <div className="absolute inset-0 opacity-5">
//                 <div
//                   className="absolute top-0 right-0 w-72 h-72 rounded-full"
//                   style={{
//                     background:
//                       "radial-gradient(circle,#fff 0%,transparent 70%)",
//                     transform: "translate(30%,-30%)",
//                   }}
//                 />
//               </div>
//               <div className="relative flex items-center gap-5">
//                 <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/15 shrink-0">
//                   <BarChart2 size={30} />
//                 </div>
//                 <div className="flex-1">
//                   <h1
//                     className="text-2xl font-bold"
//                     style={{ fontFamily: "Sora,sans-serif" }}
//                   >
//                     Performance
//                   </h1>
//                   <p className="text-indigo-200 text-sm mt-0.5">
//                     {employee?.name ?? "Employee"}
//                     {isManager && (
//                       <span className="ml-2 text-indigo-300 text-xs font-semibold">
//                         · Manager
//                       </span>
//                     )}
//                     {latestScore ? (
//                       <span>
//                         {" "}
//                         · Score: <strong>
//                           {latestScore.final_score}
//                         </strong> — {latestScore.rating}
//                       </span>
//                     ) : (
//                       " · No score data yet"
//                     )}
//                   </p>
//                 </div>
//                 {latestScore && (
//                   <div className="shrink-0">
//                     <Chip
//                       label={latestScore.rating}
//                       color={ratingCfg.color}
//                       bg={ratingCfg.bg}
//                     />
//                   </div>
//                 )}
//               </div>
//             </Motion.div>

//             {error && (
//               <div
//                 className="rounded-xl p-4 flex items-center gap-3"
//                 style={{ background: C.dangerLight }}
//               >
//                 <AlertTriangle size={16} color={C.danger} />
//                 <p className="text-sm" style={{ color: C.danger }}>
//                   {error}
//                 </p>
//               </div>
//             )}

//             {/* ── PENDING SELF-ASSESSMENT ALERT ── */}
//             {pendingReviews.length > 0 && (
//               <Motion.div
//                 initial={{ opacity: 0, y: -8 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="rounded-2xl p-4 flex items-center gap-3"
//                 style={{
//                   background: C.warningLight,
//                   border: `1px solid ${C.warning}44`,
//                 }}
//               >
//                 <div
//                   className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
//                   style={{ background: C.warning }}
//                 >
//                   <Star size={15} color="#fff" />
//                 </div>
//                 <div className="flex-1">
//                   <p
//                     className="font-semibold text-sm"
//                     style={{ color: C.textPrimary }}
//                   >
//                     {pendingReviews.length} appraisal
//                     {pendingReviews.length > 1 ? "s" : ""} pending your
//                     self-assessment
//                   </p>
//                   <p
//                     className="text-xs mt-0.5"
//                     style={{ color: C.textSecondary }}
//                   >
//                     Complete your self-assessment to keep the review cycle on
//                     track.
//                   </p>
//                 </div>
//                 <Motion.button
//                   whileHover={{ scale: 1.04 }}
//                   whileTap={{ scale: 0.97 }}
//                   onClick={() => setActiveTab("appraisals")}
//                   className="text-xs font-bold px-3 py-1.5 rounded-xl shrink-0"
//                   style={{ background: C.warning, color: "#fff" }}
//                 >
//                   Review Now
//                 </Motion.button>
//               </Motion.div>
//             )}

//             {/* ── MANAGER DRAFT ALERT ── */}
//             {isManager && pendingMgrDrafts.length > 0 && (
//               <Motion.div
//                 initial={{ opacity: 0, y: -8 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="rounded-2xl p-4 flex items-center gap-3"
//                 style={{
//                   background: C.primaryLight,
//                   border: `1px solid ${C.primary}44`,
//                 }}
//               >
//                 <div
//                   className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
//                   style={{ background: C.primary }}
//                 >
//                   <ClipboardList size={15} color="#fff" />
//                 </div>
//                 <div className="flex-1">
//                   <p
//                     className="font-semibold text-sm"
//                     style={{ color: C.textPrimary }}
//                   >
//                     {pendingMgrDrafts.length} appraisal draft
//                     {pendingMgrDrafts.length > 1 ? "s" : ""} awaiting submission
//                   </p>
//                   <p
//                     className="text-xs mt-0.5"
//                     style={{ color: C.textSecondary }}
//                   >
//                     Submit to HR to complete the review cycle.
//                   </p>
//                 </div>
//                 <Motion.button
//                   whileHover={{ scale: 1.04 }}
//                   whileTap={{ scale: 0.97 }}
//                   onClick={() => setActiveTab("appraisals")}
//                   className="text-xs font-bold px-3 py-1.5 rounded-xl shrink-0"
//                   style={{ background: C.primary, color: "#fff" }}
//                 >
//                   View Drafts
//                 </Motion.button>
//               </Motion.div>
//             )}

//             {/* ── TABS ── */}
//             <div
//               className="flex gap-1 p-1 rounded-2xl overflow-x-auto"
//               style={{
//                 background: C.surface,
//                 border: `1px solid ${C.border}`,
//                 scrollbarWidth: "none",
//               }}
//             >
//               {TABS.map((t) => {
//                 const active = activeTab === t.id;
//                 const badge = t.id === "appraisals" ? appraisalBadge : null;
//                 return (
//                   <Motion.button
//                     key={t.id}
//                     whileTap={{ scale: 0.97 }}
//                     onClick={() => setActiveTab(t.id)}
//                     className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 flex items-center gap-1.5"
//                     style={{
//                       background: active ? C.primary : "transparent",
//                       color: active ? "#fff" : C.textSecondary,
//                       boxShadow: active
//                         ? "0 2px 8px rgba(79,70,229,0.25)"
//                         : "none",
//                     }}
//                   >
//                     {t.label}
//                     {badge > 0 && (
//                       <span
//                         className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
//                         style={{
//                           background: active
//                             ? "rgba(255,255,255,0.25)"
//                             : C.primaryLight,
//                           color: active ? "#fff" : C.primary,
//                         }}
//                       >
//                         {badge}
//                       </span>
//                     )}
//                   </Motion.button>
//                 );
//               })}
//             </div>

//             {/* ══════════════════════════════════════════════════════
//                 TAB CONTENT
//             ══════════════════════════════════════════════════════ */}
//             <AnimatePresence mode="wait">
//               {/* ── OVERVIEW ── */}
//               {activeTab === "overview" && (
//                 <Motion.div
//                   key="overview"
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="space-y-5"
//                 >
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                     <Card className="p-6 flex items-center gap-6">
//                       <ScoreRing score={latestScore?.final_score} />
//                       <div className="flex-1 space-y-3">
//                         <div>
//                           <p
//                             className="text-xs"
//                             style={{ color: C.textSecondary }}
//                           >
//                             Current Rating
//                           </p>
//                           {latestScore?.rating ? (
//                             <Chip
//                               label={latestScore.rating}
//                               color={ratingCfg.color}
//                               bg={ratingCfg.bg}
//                             />
//                           ) : (
//                             <p
//                               className="text-sm font-semibold"
//                               style={{ color: C.textMuted }}
//                             >
//                               No data
//                             </p>
//                           )}
//                         </div>
//                         <div>
//                           <p
//                             className="text-xs"
//                             style={{ color: C.textSecondary }}
//                           >
//                             Period
//                           </p>
//                           <p
//                             className="font-semibold text-sm"
//                             style={{ color: C.textPrimary }}
//                           >
//                             {latestScore?.period ?? "—"}
//                           </p>
//                         </div>
//                         <div className="grid grid-cols-3 gap-2">
//                           {[
//                             {
//                               label: "KPI",
//                               value: latestScore?.kpi_score ?? "—",
//                             },
//                             {
//                               label: "Attendance",
//                               value: latestScore?.attendance_score ?? "—",
//                             },
//                             {
//                               label: "Training",
//                               value: latestScore?.training_score ?? "—",
//                             },
//                           ].map((s) => (
//                             <div
//                               key={s.label}
//                               className="rounded-xl p-2 text-center"
//                               style={{ background: C.surfaceAlt }}
//                             >
//                               <p
//                                 className="text-sm font-black"
//                                 style={{ color: C.textPrimary }}
//                               >
//                                 {s.value}
//                               </p>
//                               <p
//                                 className="text-[9px] font-semibold"
//                                 style={{ color: C.textMuted }}
//                               >
//                                 {s.label}
//                               </p>
//                             </div>
//                           ))}
//                         </div>
//                         {latestScore?.appraisal_score != null && (
//                           <div
//                             className="rounded-xl p-2 text-center"
//                             style={{ background: "#F3E8FF" }}
//                           >
//                             <p
//                               className="text-sm font-black"
//                               style={{ color: "#7C3AED" }}
//                             >
//                               {Math.round(latestScore.appraisal_score)}
//                             </p>
//                             <p
//                               className="text-[9px] font-semibold"
//                               style={{ color: "#7C3AED" }}
//                             >
//                               Appraisal
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     </Card>

//                     <Card className="p-6">
//                       <CardHead
//                         icon={TrendingUp}
//                         title="Score Trend"
//                         sub="Monthly performance history"
//                         color={C.success}
//                         bg={C.successLight}
//                       />
//                       <div className="p-4">
//                         {trends.length === 0 ? (
//                           <p
//                             className="text-sm text-center py-6"
//                             style={{ color: C.textMuted }}
//                           >
//                             No trend data yet
//                           </p>
//                         ) : (
//                           <>
//                             <TrendLine data={trends.slice(-6)} />
//                             <div className="flex gap-2 mt-3 overflow-x-auto">
//                               {trends.slice(-6).map((t, i) => (
//                                 <div key={i} className="text-center shrink-0">
//                                   <p
//                                     className="text-[10px]"
//                                     style={{ color: C.textMuted }}
//                                   >
//                                     {t.period?.slice(-5)}
//                                   </p>
//                                   <p
//                                     className="text-xs font-bold"
//                                     style={{ color: C.textPrimary }}
//                                   >
//                                     {t.score ?? t.final_score}
//                                   </p>
//                                 </div>
//                               ))}
//                             </div>
//                           </>
//                         )}
//                       </div>
//                     </Card>
//                   </div>

//                   {insights.length > 0 && (
//                     <Card>
//                       <CardHead
//                         icon={Sparkles}
//                         title="Performance Insights"
//                         sub="Auto-generated analysis"
//                         color="#7C3AED"
//                         bg="#F3E8FF"
//                       />
//                       <div className="p-4 space-y-2">
//                         {insights.map((ins, i) => {
//                           const cfg = {
//                             positive: {
//                               color: C.success,
//                               bg: C.successLight,
//                               icon: TrendingUp,
//                             },
//                             warning: {
//                               color: C.danger,
//                               bg: C.dangerLight,
//                               icon: AlertCircle,
//                             },
//                             leadership: {
//                               color: "#7C3AED",
//                               bg: "#F3E8FF",
//                               icon: Trophy,
//                             },
//                             pip: {
//                               color: C.danger,
//                               bg: C.dangerLight,
//                               icon: AlertTriangle,
//                             },
//                           }[ins.type] ?? {
//                             color: C.primary,
//                             bg: C.primaryLight,
//                             icon: Info,
//                           };
//                           const Icon = cfg.icon;
//                           return (
//                             <Motion.div
//                               key={i}
//                               custom={i}
//                               variants={fadeUp}
//                               initial="hidden"
//                               animate="visible"
//                               className="flex items-center gap-3 p-3 rounded-xl"
//                               style={{
//                                 background: cfg.bg,
//                                 border: `1px solid ${cfg.color}22`,
//                               }}
//                             >
//                               <Icon
//                                 size={14}
//                                 color={cfg.color}
//                                 className="shrink-0"
//                               />
//                               <p
//                                 className="text-xs font-medium"
//                                 style={{ color: cfg.color }}
//                               >
//                                 {ins.message}
//                               </p>
//                             </Motion.div>
//                           );
//                         })}
//                       </div>
//                     </Card>
//                   )}

//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     {[
//                       {
//                         label: "Goals In Progress",
//                         value: inProgressGoals.length,
//                         icon: Target,
//                         color: C.primary,
//                         bg: C.primaryLight,
//                       },
//                       {
//                         label: "Goals Completed",
//                         value: completedGoals.length,
//                         icon: CheckCircle2,
//                         color: C.success,
//                         bg: C.successLight,
//                       },
//                       {
//                         label: "Pending Reviews",
//                         value: pendingReviews.length,
//                         icon: Clock,
//                         color: C.warning,
//                         bg: C.warningLight,
//                       },
//                       {
//                         label: isManager
//                           ? "My Team Appraisals"
//                           : "My Appraisals",
//                         value: isManager
//                           ? mgrAppraisals.length
//                           : myAppraisals.length,
//                         icon: ClipboardList,
//                         color: "#7C3AED",
//                         bg: "#F3E8FF",
//                       },
//                     ].map((s, i) => (
//                       <Motion.div
//                         key={s.label}
//                         custom={i}
//                         variants={fadeUp}
//                         initial="hidden"
//                         animate="visible"
//                         whileHover={{ y: -2 }}
//                         className="rounded-2xl p-4 flex items-center gap-3"
//                         style={{
//                           background: C.surface,
//                           border: `1px solid ${C.border}`,
//                         }}
//                       >
//                         <div
//                           className="w-9 h-9 rounded-xl flex items-center justify-center"
//                           style={{ background: s.bg }}
//                         >
//                           <s.icon size={16} color={s.color} />
//                         </div>
//                         <div>
//                           <p
//                             className="text-xl font-black"
//                             style={{ color: C.textPrimary }}
//                           >
//                             {s.value}
//                           </p>
//                           <p
//                             className="text-[11px]"
//                             style={{ color: C.textSecondary }}
//                           >
//                             {s.label}
//                           </p>
//                         </div>
//                       </Motion.div>
//                     ))}
//                   </div>
//                 </Motion.div>
//               )}

//               {/* ── GOALS ── */}
//               {activeTab === "goals" && (
//                 <Motion.div
//                   key="goals"
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="space-y-4"
//                 >
//                   <Card>
//                     <CardHead
//                       icon={Target}
//                       title="My Goals & KPIs"
//                       sub={`${goals.length} goals · ${completedGoals.length} completed`}
//                       action={
//                         <Chip label={`${inProgressGoals.length} active`} />
//                       }
//                     />
//                     <div className="p-4 space-y-3">
//                       {filteredGoals.length === 0 ? (
//                         <div className="py-12 text-center">
//                           <Target
//                             size={36}
//                             color={C.textMuted}
//                             className="mx-auto mb-2"
//                           />
//                           <p
//                             className="font-semibold text-sm"
//                             style={{ color: C.textSecondary }}
//                           >
//                             {searchQuery
//                               ? "No goals match your search"
//                               : "No goals assigned yet"}
//                           </p>
//                         </div>
//                       ) : (
//                         filteredGoals.map((goal, i) => {
//                           const isExpanded = expandedGoal === goal.id;
//                           const priorityCfg =
//                             PRIORITY_MAP[goal.priority?.toLowerCase()] ??
//                             PRIORITY_MAP.medium;
//                           const isCompleted =
//                             goal.status?.toLowerCase() === "completed" ||
//                             goal.progress >= 100;
//                           return (
//                             <Motion.div
//                               key={goal.id}
//                               custom={i}
//                               variants={fadeUp}
//                               initial="hidden"
//                               animate="visible"
//                               className="rounded-2xl border overflow-hidden"
//                               style={{
//                                 borderColor: C.border,
//                                 background: C.surface,
//                               }}
//                             >
//                               <button
//                                 onClick={() =>
//                                   setExpandedGoal(isExpanded ? null : goal.id)
//                                 }
//                                 className="w-full flex items-center gap-4 p-4 text-left"
//                                 onMouseEnter={(e) =>
//                                   (e.currentTarget.style.background =
//                                     C.surfaceAlt)
//                                 }
//                                 onMouseLeave={(e) =>
//                                   (e.currentTarget.style.background =
//                                     "transparent")
//                                 }
//                               >
//                                 <div
//                                   className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
//                                   style={{
//                                     background: isCompleted
//                                       ? C.successLight
//                                       : C.primaryLight,
//                                   }}
//                                 >
//                                   {isCompleted ? (
//                                     <CheckCircle2 size={16} color={C.success} />
//                                   ) : (
//                                     <Target size={16} color={C.primary} />
//                                   )}
//                                 </div>
//                                 <div className="flex-1 min-w-0">
//                                   <div className="flex items-center gap-2 flex-wrap mb-1.5">
//                                     <p
//                                       className="font-semibold text-sm truncate"
//                                       style={{ color: C.textPrimary }}
//                                     >
//                                       {goal.title}
//                                     </p>
//                                     <Chip
//                                       label={goal.priority ?? "medium"}
//                                       color={priorityCfg.color}
//                                       bg={priorityCfg.bg}
//                                     />
//                                     {isCompleted && (
//                                       <Chip
//                                         label="✓ Complete"
//                                         color={C.success}
//                                         bg={C.successLight}
//                                       />
//                                     )}
//                                   </div>
//                                   <GoalBar
//                                     progress={goal.progress ?? 0}
//                                     label={`${goal.progress ?? 0}% complete`}
//                                   />
//                                 </div>
//                                 <div className="shrink-0 flex items-center gap-2">
//                                   <p
//                                     className="text-[11px]"
//                                     style={{ color: C.textMuted }}
//                                   >
//                                     {goal.due_date ?? goal.dueDate ?? "—"}
//                                   </p>
//                                   <Motion.div
//                                     animate={{ rotate: isExpanded ? 180 : 0 }}
//                                   >
//                                     <ChevronDown
//                                       size={14}
//                                       color={C.textMuted}
//                                     />
//                                   </Motion.div>
//                                 </div>
//                               </button>
//                               <AnimatePresence>
//                                 {isExpanded && (
//                                   <Motion.div
//                                     initial={{ height: 0, opacity: 0 }}
//                                     animate={{ height: "auto", opacity: 1 }}
//                                     exit={{ height: 0, opacity: 0 }}
//                                     transition={{ duration: 0.22 }}
//                                     className="overflow-hidden"
//                                   >
//                                     <div
//                                       className="px-4 pb-4 pt-0 space-y-3"
//                                       style={{
//                                         borderTop: `1px solid ${C.border}`,
//                                       }}
//                                     >
//                                       {goal.description && (
//                                         <p
//                                           className="text-xs leading-relaxed pt-3"
//                                           style={{ color: C.textSecondary }}
//                                         >
//                                           {goal.description}
//                                         </p>
//                                       )}
//                                       <div
//                                         className="flex items-center gap-2 text-xs"
//                                         style={{ color: C.textMuted }}
//                                       >
//                                         <Calendar size={11} />
//                                         <span>
//                                           Due:{" "}
//                                           {goal.due_date ?? goal.dueDate ?? "—"}
//                                         </span>
//                                         {goal.metric && (
//                                           <>
//                                             <span>·</span>
//                                             <span>Metric: {goal.metric}</span>
//                                           </>
//                                         )}
//                                       </div>
//                                     </div>
//                                   </Motion.div>
//                                 )}
//                               </AnimatePresence>
//                             </Motion.div>
//                           );
//                         })
//                       )}
//                     </div>
//                   </Card>
//                 </Motion.div>
//               )}

//               {/* ── APPRAISALS ── role-aware ── */}
//               {activeTab === "appraisals" && (
//                 <Motion.div
//                   key="appraisals"
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="space-y-5"
//                 >
//                   {/* ┌─ MANAGER SECTION (only visible to managers) ──────────┐ */}
//                   {isManager && (
//                     <Card>
//                       <CardHead
//                         icon={Users}
//                         title="My Team Appraisals"
//                         sub={`Appraisals you've created for your department · ${employee?.department ?? ""}`}
//                         color={C.primary}
//                         bg={C.primaryLight}
//                         action={
//                           <Motion.button
//                             whileHover={{ scale: 1.04 }}
//                             whileTap={{ scale: 0.97 }}
//                             onClick={() => setCreateModal("new")}
//                             className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
//                             style={{ background: C.primary }}
//                           >
//                             <Plus size={13} /> New Appraisal
//                           </Motion.button>
//                         }
//                       />
//                       <div className="p-4 space-y-3">
//                         {mgrAppraisals.length === 0 ? (
//                           <div className="py-10 text-center">
//                             <Users
//                               size={32}
//                               color={C.textMuted}
//                               className="mx-auto mb-2"
//                             />
//                             <p
//                               className="font-semibold text-sm"
//                               style={{ color: C.textSecondary }}
//                             >
//                               No appraisals created yet
//                             </p>
//                             <p
//                               className="text-xs mt-1 mb-4"
//                               style={{ color: C.textMuted }}
//                             >
//                               Create an appraisal for an employee in your
//                               department.
//                             </p>
//                             <Motion.button
//                               whileHover={{ scale: 1.03 }}
//                               whileTap={{ scale: 0.97 }}
//                               onClick={() => setCreateModal("new")}
//                               className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
//                               style={{ background: C.primary }}
//                             >
//                               <Plus size={15} /> Create First Appraisal
//                             </Motion.button>
//                           </div>
//                         ) : (
//                           mgrAppraisals.map((apr, i) => {
//                             const statusCfg =
//                               APPRAISAL_STATUS[apr.status] ??
//                               APPRAISAL_STATUS.draft;
//                             const empName = apr.employee
//                               ? `${apr.employee.firstName} ${apr.employee.lastName}`
//                               : apr.employeeId;
//                             const isEditable = ["draft", "rejected"].includes(
//                               apr.status,
//                             );
//                             const isLocked = apr.status === "completed";
//                             const isSubmitted = apr.status === "submitted";

//                             return (
//                               <Motion.div
//                                 key={apr.id}
//                                 custom={i}
//                                 variants={fadeUp}
//                                 initial="hidden"
//                                 animate="visible"
//                                 className="rounded-2xl border overflow-hidden"
//                                 style={{
//                                   borderColor:
//                                     apr.status === "rejected"
//                                       ? `${C.danger}55`
//                                       : C.border,
//                                   background: C.surface,
//                                 }}
//                               >
//                                 <div className="flex items-center gap-4 p-4">
//                                   {/* Avatar / icon */}
//                                   <div
//                                     className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm text-white"
//                                     style={{
//                                       background: isLocked
//                                         ? C.success
//                                         : isSubmitted
//                                           ? C.warning
//                                           : C.primary,
//                                     }}
//                                   >
//                                     {empName
//                                       .split(" ")
//                                       .map((n) => n[0])
//                                       .join("")
//                                       .slice(0, 2)
//                                       .toUpperCase()}
//                                   </div>
//                                   <div className="flex-1 min-w-0">
//                                     <div className="flex items-center gap-2 flex-wrap mb-0.5">
//                                       <p
//                                         className="font-semibold text-sm"
//                                         style={{ color: C.textPrimary }}
//                                       >
//                                         {empName}
//                                       </p>
//                                       <Chip
//                                         label={statusCfg.label}
//                                         color={statusCfg.color}
//                                         bg={statusCfg.bg}
//                                       />
//                                     </div>
//                                     <div
//                                       className="flex items-center gap-3 text-[11px] flex-wrap"
//                                       style={{ color: C.textMuted }}
//                                     >
//                                       <span>
//                                         {apr.cycleName ??
//                                           `Period ${apr.period}`}
//                                       </span>
//                                       {apr.employee?.department && (
//                                         <>
//                                           <span>·</span>
//                                           <span>{apr.employee.department}</span>
//                                         </>
//                                       )}
//                                       {isLocked &&
//                                         apr.appraisalScore != null && (
//                                           <span
//                                             className="font-bold"
//                                             style={{ color: C.success }}
//                                           >
//                                             Final:{" "}
//                                             {Math.round(apr.appraisalScore)}/100
//                                           </span>
//                                         )}
//                                     </div>
//                                   </div>

//                                   {/* Action buttons */}
//                                   <div className="flex gap-2 shrink-0">
//                                     {isLocked && (
//                                       <span
//                                         className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl"
//                                         style={{
//                                           background: C.surfaceAlt,
//                                           color: C.textMuted,
//                                         }}
//                                       >
//                                         <Lock size={11} /> Locked
//                                       </span>
//                                     )}
//                                     {isEditable && (
//                                       <>
//                                         <Motion.button
//                                           whileHover={{ scale: 1.04 }}
//                                           whileTap={{ scale: 0.97 }}
//                                           onClick={() => setCreateModal(apr)}
//                                           className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl"
//                                           style={{
//                                             background: C.primaryLight,
//                                             color: C.primary,
//                                           }}
//                                         >
//                                           <Eye size={12} /> Edit
//                                         </Motion.button>
//                                         <Motion.button
//                                           whileHover={{ scale: 1.04 }}
//                                           whileTap={{ scale: 0.97 }}
//                                           onClick={() => handleSubmitDraft(apr)}
//                                           className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl text-white"
//                                           style={{ background: C.primary }}
//                                         >
//                                           <Send size={11} /> Submit
//                                         </Motion.button>
//                                       </>
//                                     )}
//                                     {!isEditable && !isLocked && (
//                                       <Motion.button
//                                         whileHover={{ scale: 1.04 }}
//                                         whileTap={{ scale: 0.97 }}
//                                         onClick={() => setDetailModal(apr)}
//                                         className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl"
//                                         style={{
//                                           background: C.primaryLight,
//                                           color: C.primary,
//                                         }}
//                                       >
//                                         <Eye size={12} /> View
//                                       </Motion.button>
//                                     )}
//                                     {isLocked && (
//                                       <Motion.button
//                                         whileHover={{ scale: 1.04 }}
//                                         whileTap={{ scale: 0.97 }}
//                                         onClick={() => setDetailModal(apr)}
//                                         className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl"
//                                         style={{
//                                           background: C.primaryLight,
//                                           color: C.primary,
//                                         }}
//                                       >
//                                         <Eye size={12} /> View
//                                       </Motion.button>
//                                     )}
//                                   </div>
//                                 </div>

//                                 {/* Rejected reason */}
//                                 {apr.status === "rejected" &&
//                                   apr.hrFeedback && (
//                                     <div className="px-4 pb-4">
//                                       <div
//                                         className="p-3 rounded-xl text-xs"
//                                         style={{
//                                           background: C.dangerLight,
//                                           color: C.danger,
//                                         }}
//                                       >
//                                         <span className="font-bold">
//                                           HR returned:{" "}
//                                         </span>
//                                         {apr.hrFeedback.slice(0, 160)}
//                                         {apr.hrFeedback.length > 160 ? "…" : ""}
//                                       </div>
//                                     </div>
//                                   )}

//                                 {/* Submitted progress stepper */}
//                                 {["submitted", "hr_scored"].includes(
//                                   apr.status,
//                                 ) && (
//                                   <div className="px-4 pb-4">
//                                     <div
//                                       className="h-1.5 rounded-full overflow-hidden"
//                                       style={{ background: C.surfaceAlt }}
//                                     >
//                                       <div
//                                         className="h-full rounded-full transition-all duration-500"
//                                         style={{
//                                           width:
//                                             apr.status === "submitted"
//                                               ? "60%"
//                                               : "85%",
//                                           background: statusCfg.color,
//                                         }}
//                                       />
//                                     </div>
//                                     <div className="flex justify-between mt-1.5 text-[9px] font-semibold">
//                                       {[
//                                         "Draft",
//                                         "Submitted",
//                                         "HR Review",
//                                         "Complete",
//                                       ].map((step, si) => {
//                                         const stepIdx = [
//                                           "draft",
//                                           "submitted",
//                                           "hr_scored",
//                                           "completed",
//                                         ].indexOf(apr.status);
//                                         return (
//                                           <span
//                                             key={step}
//                                             style={{
//                                               color:
//                                                 si <= stepIdx
//                                                   ? statusCfg.color
//                                                   : C.textMuted,
//                                             }}
//                                           >
//                                             {step}
//                                           </span>
//                                         );
//                                       })}
//                                     </div>
//                                   </div>
//                                 )}
//                               </Motion.div>
//                             );
//                           })
//                         )}
//                       </div>
//                     </Card>
//                   )}
//                   {/* └─────────────────────────────────────────────────────┘ */}

//                   {/* ── SELF-ASSESSMENTS (pending performance_reviews) ── */}
//                   {pendingReviews.length > 0 && (
//                     <Card>
//                       <CardHead
//                         icon={Star}
//                         title="Pending Self-Assessments"
//                         sub="Complete these to move your review forward"
//                         color={C.warning}
//                         bg={C.warningLight}
//                         action={
//                           <Chip
//                             label={`${pendingReviews.length} pending`}
//                             color={C.warning}
//                             bg={C.warningLight}
//                           />
//                         }
//                       />
//                       <div className="p-4 space-y-3">
//                         {pendingReviews.map((rev, i) => (
//                           <Motion.div
//                             key={rev.id}
//                             custom={i}
//                             variants={fadeUp}
//                             initial="hidden"
//                             animate="visible"
//                             className="flex items-center gap-4 p-4 rounded-2xl"
//                             style={{
//                               background: C.warningLight,
//                               border: `1px solid ${C.warning}33`,
//                             }}
//                           >
//                             <div
//                               className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
//                               style={{ background: C.warning }}
//                             >
//                               <Star size={18} color="#fff" />
//                             </div>
//                             <div className="flex-1 min-w-0">
//                               <p
//                                 className="font-semibold text-sm"
//                                 style={{ color: C.textPrimary }}
//                               >
//                                 {rev.cycle_name ?? rev.cycle ?? "Review Cycle"}
//                               </p>
//                               <p
//                                 className="text-[11px] mt-0.5"
//                                 style={{ color: C.textMuted }}
//                               >
//                                 {rev.created_at
//                                   ? `Issued ${new Date(rev.created_at).toLocaleDateString("en-NG")}`
//                                   : "Awaiting your self-assessment"}
//                               </p>
//                             </div>
//                             <Motion.button
//                               whileHover={{ scale: 1.04 }}
//                               whileTap={{ scale: 0.97 }}
//                               onClick={() => setAssessModal(rev)}
//                               className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white shrink-0"
//                               style={{
//                                 background: `linear-gradient(135deg,${C.primary},#6366F1)`,
//                               }}
//                             >
//                               <Send size={11} /> Start Assessment
//                             </Motion.button>
//                           </Motion.div>
//                         ))}
//                       </div>
//                     </Card>
//                   )}

//                   {/* ── MY RECEIVED APPRAISALS (all roles) ── */}
//                   <Card>
//                     <CardHead
//                       icon={ClipboardList}
//                       title="My Appraisals"
//                       sub="Appraisals received from your manager"
//                       action={
//                         myAppraisals.length > 0 ? (
//                           <Chip label={`${myAppraisals.length} total`} />
//                         ) : null
//                       }
//                     />
//                     <div className="p-4 space-y-3">
//                       {myAppraisals.length === 0 ? (
//                         <div className="py-12 text-center">
//                           <ClipboardList
//                             size={36}
//                             color={C.textMuted}
//                             className="mx-auto mb-2"
//                           />
//                           <p
//                             className="font-semibold text-sm"
//                             style={{ color: C.textSecondary }}
//                           >
//                             No appraisals yet
//                           </p>
//                           <p
//                             className="text-xs mt-1"
//                             style={{ color: C.textMuted }}
//                           >
//                             Your manager will create an appraisal for you.
//                           </p>
//                         </div>
//                       ) : (
//                         myAppraisals.map((apr, i) => {
//                           const statusCfg =
//                             APPRAISAL_STATUS[apr.status] ??
//                             APPRAISAL_STATUS.draft;
//                           const managerName = apr.manager
//                             ? `${apr.manager.firstName} ${apr.manager.lastName}`
//                             : "Manager";
//                           const isCompleted = apr.status === "completed";
//                           const isRejected = apr.status === "rejected";

//                           return (
//                             <Motion.div
//                               key={apr.id}
//                               custom={i}
//                               variants={fadeUp}
//                               initial="hidden"
//                               animate="visible"
//                               className="rounded-2xl border overflow-hidden"
//                               style={{
//                                 borderColor: isRejected
//                                   ? `${C.danger}55`
//                                   : C.border,
//                                 background: C.surface,
//                               }}
//                             >
//                               <div className="flex items-center gap-4 p-4">
//                                 <div
//                                   className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
//                                   style={{ background: statusCfg.bg }}
//                                 >
//                                   {isCompleted ? (
//                                     <CheckCircle2
//                                       size={18}
//                                       color={statusCfg.color}
//                                     />
//                                   ) : isRejected ? (
//                                     <AlertTriangle
//                                       size={18}
//                                       color={statusCfg.color}
//                                     />
//                                   ) : (
//                                     <ClipboardList
//                                       size={18}
//                                       color={statusCfg.color}
//                                     />
//                                   )}
//                                 </div>
//                                 <div className="flex-1 min-w-0">
//                                   <div className="flex items-center gap-2 flex-wrap mb-1">
//                                     <p
//                                       className="font-semibold text-sm"
//                                       style={{ color: C.textPrimary }}
//                                     >
//                                       {apr.cycleName ??
//                                         `Appraisal — ${apr.period}`}
//                                     </p>
//                                     <Chip
//                                       label={statusCfg.label}
//                                       color={statusCfg.color}
//                                       bg={statusCfg.bg}
//                                     />
//                                   </div>
//                                   <div className="flex items-center gap-3 flex-wrap">
//                                     <p
//                                       className="text-[11px]"
//                                       style={{ color: C.textMuted }}
//                                     >
//                                       By {managerName} · Period {apr.period}
//                                     </p>
//                                     {isCompleted &&
//                                       apr.appraisalScore != null && (
//                                         <span
//                                           className="text-[11px] font-bold"
//                                           style={{ color: C.success }}
//                                         >
//                                           Score:{" "}
//                                           {Math.round(apr.appraisalScore)}/100
//                                         </span>
//                                       )}
//                                   </div>
//                                 </div>

//                                 {isCompleted && apr.appraisalScore != null && (
//                                   <div
//                                     className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg"
//                                     style={{
//                                       background: C.successLight,
//                                       color: C.success,
//                                       fontFamily: "Sora,sans-serif",
//                                     }}
//                                   >
//                                     {Math.round(apr.appraisalScore)}
//                                   </div>
//                                 )}

//                                 <Motion.button
//                                   whileHover={{ scale: 1.04 }}
//                                   whileTap={{ scale: 0.97 }}
//                                   onClick={() => setDetailModal(apr)}
//                                   className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0"
//                                   style={{
//                                     background: C.primaryLight,
//                                     color: C.primary,
//                                   }}
//                                 >
//                                   <Eye size={12} /> View
//                                 </Motion.button>
//                               </div>

//                               {/* Progress stepper */}
//                               {!isCompleted && !isRejected && (
//                                 <div className="px-4 pb-4">
//                                   <div
//                                     className="flex justify-between text-[10px] mb-1"
//                                     style={{ color: C.textMuted }}
//                                   >
//                                     <span>Review Progress</span>
//                                     <span>
//                                       {apr.status === "submitted"
//                                         ? "50%"
//                                         : apr.status === "hr_scored"
//                                           ? "80%"
//                                           : "25%"}
//                                     </span>
//                                   </div>
//                                   <div
//                                     className="h-1.5 rounded-full overflow-hidden"
//                                     style={{ background: C.surfaceAlt }}
//                                   >
//                                     <div
//                                       className="h-full rounded-full transition-all duration-500"
//                                       style={{
//                                         width:
//                                           apr.status === "submitted"
//                                             ? "50%"
//                                             : apr.status === "hr_scored"
//                                               ? "80%"
//                                               : "25%",
//                                         background: statusCfg.color,
//                                       }}
//                                     />
//                                   </div>
//                                   <div className="flex justify-between mt-1.5">
//                                     {[
//                                       "Draft",
//                                       "Submitted",
//                                       "HR Review",
//                                       "Complete",
//                                     ].map((step, si) => {
//                                       const stepIdx = [
//                                         "draft",
//                                         "submitted",
//                                         "hr_scored",
//                                         "completed",
//                                       ].indexOf(apr.status);
//                                       return (
//                                         <span
//                                           key={step}
//                                           className="text-[9px] font-semibold"
//                                           style={{
//                                             color:
//                                               si <= stepIdx
//                                                 ? statusCfg.color
//                                                 : C.textMuted,
//                                           }}
//                                         >
//                                           {step}
//                                         </span>
//                                       );
//                                     })}
//                                   </div>
//                                 </div>
//                               )}

//                               {isRejected && apr.hrFeedback && (
//                                 <div className="px-4 pb-4">
//                                   <div
//                                     className="p-3 rounded-xl text-xs"
//                                     style={{
//                                       background: C.dangerLight,
//                                       color: C.danger,
//                                     }}
//                                   >
//                                     <span className="font-bold">
//                                       Returned:{" "}
//                                     </span>
//                                     {apr.hrFeedback.slice(0, 120)}
//                                     {apr.hrFeedback.length > 120 ? "…" : ""}
//                                   </div>
//                                 </div>
//                               )}
//                             </Motion.div>
//                           );
//                         })
//                       )}
//                     </div>
//                   </Card>
//                 </Motion.div>
//               )}

//               {/* ── FEEDBACK ── */}
//               {activeTab === "feedback" && (
//                 <Motion.div
//                   key="feedback"
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="space-y-4"
//                 >
//                   <Card>
//                     <CardHead
//                       icon={MessageSquare}
//                       title="Manager Feedback"
//                       sub="Comments from your performance reviews"
//                     />
//                     <div className="p-4 space-y-4">
//                       {reviews.filter((r) => r.manager_comment).length === 0 &&
//                       myAppraisals.filter(
//                         (a) => a.managerFeedback && a.status === "completed",
//                       ).length === 0 ? (
//                         <div className="py-12 text-center">
//                           <MessageSquare
//                             size={36}
//                             color={C.textMuted}
//                             className="mx-auto mb-2"
//                           />
//                           <p
//                             className="font-semibold text-sm"
//                             style={{ color: C.textSecondary }}
//                           >
//                             No feedback yet
//                           </p>
//                         </div>
//                       ) : (
//                         <>
//                           {reviews
//                             .filter((r) => r.manager_comment)
//                             .map((rev, i) => (
//                               <Motion.div
//                                 key={rev.id}
//                                 custom={i}
//                                 variants={fadeUp}
//                                 initial="hidden"
//                                 animate="visible"
//                                 className="p-4 rounded-2xl"
//                                 style={{
//                                   background: C.surfaceAlt,
//                                   border: `1px solid ${C.border}`,
//                                 }}
//                               >
//                                 <div className="flex items-center gap-2 mb-2">
//                                   <div
//                                     className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
//                                     style={{
//                                       background:
//                                         "linear-gradient(135deg,#6366F1,#8B5CF6)",
//                                     }}
//                                   >
//                                     {rev.reviewed_by_name
//                                       ?.split(" ")
//                                       .map((n) => n[0])
//                                       .join("")
//                                       .slice(0, 2) ?? "HR"}
//                                   </div>
//                                   <div>
//                                     <p
//                                       className="text-xs font-semibold"
//                                       style={{ color: C.textPrimary }}
//                                     >
//                                       {rev.reviewed_by_name ?? "HR"}
//                                     </p>
//                                     <p
//                                       className="text-[10px]"
//                                       style={{ color: C.textMuted }}
//                                     >
//                                       {rev.cycle_name ?? rev.cycle}
//                                     </p>
//                                   </div>
//                                 </div>
//                                 <p
//                                   className="text-sm leading-relaxed"
//                                   style={{ color: C.textSecondary }}
//                                 >
//                                   {rev.manager_comment}
//                                 </p>
//                               </Motion.div>
//                             ))}
//                           {myAppraisals
//                             .filter(
//                               (a) =>
//                                 a.managerFeedback && a.status === "completed",
//                             )
//                             .map((apr, i) => {
//                               const managerName = apr.manager
//                                 ? `${apr.manager.firstName} ${apr.manager.lastName}`
//                                 : "Manager";
//                               return (
//                                 <Motion.div
//                                   key={apr.id}
//                                   custom={i}
//                                   variants={fadeUp}
//                                   initial="hidden"
//                                   animate="visible"
//                                   className="p-4 rounded-2xl"
//                                   style={{
//                                     background: C.primaryLight,
//                                     border: `1px solid ${C.primary}22`,
//                                   }}
//                                 >
//                                   <div className="flex items-center gap-2 mb-2">
//                                     <div
//                                       className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
//                                       style={{
//                                         background:
//                                           "linear-gradient(135deg,#4F46E5,#6366F1)",
//                                       }}
//                                     >
//                                       {managerName
//                                         .split(" ")
//                                         .map((n) => n[0])
//                                         .join("")
//                                         .slice(0, 2)}
//                                     </div>
//                                     <div>
//                                       <p
//                                         className="text-xs font-semibold"
//                                         style={{ color: C.primary }}
//                                       >
//                                         {managerName}
//                                       </p>
//                                       <p
//                                         className="text-[10px]"
//                                         style={{ color: C.textMuted }}
//                                       >
//                                         Appraisal —{" "}
//                                         {apr.cycleName ?? apr.period}
//                                         {apr.managerOverall != null &&
//                                           ` · Score: ${Math.round(apr.managerOverall)}/100`}
//                                       </p>
//                                     </div>
//                                   </div>
//                                   <p
//                                     className="text-sm leading-relaxed"
//                                     style={{ color: C.textPrimary }}
//                                   >
//                                     {apr.managerFeedback}
//                                   </p>
//                                   {apr.hrFeedback && (
//                                     <div
//                                       className="mt-3 pt-3"
//                                       style={{
//                                         borderTop: `1px solid ${C.primary}22`,
//                                       }}
//                                     >
//                                       <p
//                                         className="text-[10px] font-bold mb-1"
//                                         style={{ color: "#7C3AED" }}
//                                       >
//                                         HR Comment
//                                       </p>
//                                       <p
//                                         className="text-xs leading-relaxed"
//                                         style={{ color: C.textSecondary }}
//                                       >
//                                         {apr.hrFeedback}
//                                       </p>
//                                     </div>
//                                   )}
//                                 </Motion.div>
//                               );
//                             })}
//                         </>
//                       )}
//                     </div>
//                   </Card>
//                 </Motion.div>
//               )}

//               {/* ── HISTORY ── */}
//               {activeTab === "history" && (
//                 <Motion.div
//                   key="history"
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0 }}
//                   className="space-y-4"
//                 >
//                   <Card>
//                     <CardHead
//                       icon={RotateCcw}
//                       title="Score History"
//                       sub="All recorded performance scores"
//                     />
//                     <div className="p-4 space-y-3">
//                       {scores.length === 0 ? (
//                         <div className="py-12 text-center">
//                           <BarChart2
//                             size={36}
//                             color={C.textMuted}
//                             className="mx-auto mb-2"
//                           />
//                           <p
//                             className="font-semibold text-sm"
//                             style={{ color: C.textSecondary }}
//                           >
//                             No score history yet
//                           </p>
//                         </div>
//                       ) : (
//                         scores.map((sc, i) => {
//                           const rCfg = RATING_MAP[sc.rating] ?? {
//                             color: C.textMuted,
//                             bg: C.surfaceAlt,
//                           };
//                           return (
//                             <Motion.div
//                               key={sc.id ?? i}
//                               custom={i}
//                               variants={fadeUp}
//                               initial="hidden"
//                               animate="visible"
//                               className="flex items-center gap-4 p-4 rounded-2xl"
//                               style={{
//                                 background: C.surfaceAlt,
//                                 border: `1px solid ${C.border}`,
//                               }}
//                             >
//                               <div
//                                 className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-black text-lg"
//                                 style={{
//                                   background: rCfg.bg,
//                                   color: rCfg.color,
//                                   fontFamily: "Sora,sans-serif",
//                                 }}
//                               >
//                                 {sc.final_score}
//                               </div>
//                               <div className="flex-1">
//                                 <div className="flex items-center gap-2 flex-wrap mb-1">
//                                   <p
//                                     className="font-semibold text-sm"
//                                     style={{ color: C.textPrimary }}
//                                   >
//                                     {sc.period}
//                                   </p>
//                                   <Chip
//                                     label={sc.rating}
//                                     color={rCfg.color}
//                                     bg={rCfg.bg}
//                                   />
//                                 </div>
//                                 <div
//                                   className="flex gap-3 text-[11px] flex-wrap"
//                                   style={{ color: C.textMuted }}
//                                 >
//                                   <span>KPI: {sc.kpi_score}</span>
//                                   <span>·</span>
//                                   <span>Attendance: {sc.attendance_score}</span>
//                                   <span>·</span>
//                                   <span>Training: {sc.training_score}</span>
//                                   {sc.appraisal_score != null && (
//                                     <>
//                                       <span>·</span>
//                                       <span
//                                         style={{
//                                           color: "#7C3AED",
//                                           fontWeight: 700,
//                                         }}
//                                       >
//                                         Appraisal:{" "}
//                                         {Math.round(sc.appraisal_score)}
//                                       </span>
//                                     </>
//                                   )}
//                                 </div>
//                               </div>
//                             </Motion.div>
//                           );
//                         })
//                       )}
//                     </div>
//                   </Card>
//                 </Motion.div>
//               )}
//             </AnimatePresence>
//             <div className="h-6" />
//           </main>
//         </div>
//       </div>

//       {/* ── MODALS ── */}

//       {/* Self-assessment */}
//       <AnimatePresence>
//         {assessModal && (
//           <AssessmentModal
//             review={assessModal}
//             onClose={() => setAssessModal(null)}
//             onSubmitted={() => {
//               setReviews((prev) =>
//                 prev.map((r) =>
//                   r.id === assessModal.id
//                     ? { ...r, status: "self_completed" }
//                     : r,
//                 ),
//               );
//               setAssessModal(null);
//               showToast("Self-assessment submitted successfully.");
//             }}
//           />
//         )}
//       </AnimatePresence>

//       {/* Read-only appraisal detail */}
//       <AnimatePresence>
//         {detailModal && (
//           <AppraisalDetailModal
//             appraisal={detailModal}
//             onClose={() => setDetailModal(null)}
//           />
//         )}
//       </AnimatePresence>

//       {/* Create / Edit appraisal (manager-only) */}
//       <AnimatePresence>
//         {createModal && isManager && (
//           <CreateAppraisalModal
//             deptEmployees={deptEmployees}
//             templates={templates}
//             editAppraisal={createModal === "new" ? null : createModal}
//             onClose={() => setCreateModal(null)}
//             onSaved={(msg) => {
//               setCreateModal(null);
//               showToast(msg);
//               load();
//             }}
//           />
//         )}
//       </AnimatePresence>

//       {/* Toast */}
//       <AnimatePresence>
//         {toast && (
//           <Toast
//             msg={toast.msg}
//             type={toast.type}
//             onDone={() => setToast(null)}
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// src/pages/Performance.jsx
//
// Shared page for ALL employees including managers.
// Appraisals tab is ROLE-AWARE:
//   • role === "employee"  → read-only list of appraisals received + self-assessment
//   • role === "manager"   → same read-only view PLUS ability to create/edit/submit
//                            appraisals for employees in their own department only
//
// No separate manager page needed — everything lives here.
//
// FIX (role detection): authApi.getMe() doesn't reliably return `role` in
// all shapes, which silently broke the manager-only "Create Appraisal" UI.
// We now also fall back to useAuth()'s authEmployee.role — the same source
// ManagerProfile.jsx already relies on successfully — so isManager never
// goes false just because getMe() omitted/nested the role differently.

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  BarChart2,
  Target,
  Star,
  MessageSquare,
  ChevronDown,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowUpRight,
  Calendar,
  Menu,
  Bell,
  Search,
  Shield,
  Sparkles,
  Trophy,
  RotateCcw,
  Send,
  X,
  Info,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Minus,
  ArrowDownRight,
  ClipboardList,
  Plus,
  Users,
  Lock,
} from "lucide-react";
import C from "../styles/colors";
import { useAuth } from "../components/useAuth";
import { authApi } from "../api/service/authApi";
import {
  getEmployeeScores,
  getMyGoals,
  getMyReviews,
  getTrends,
  getInsights,
  submitSelfAssessment,
} from "../api/service/performanceApi";
import {
  getMyAppraisals,
  listAppraisals,
  createAppraisal,
  updateAppraisal,
  submitAppraisal,
  listTemplates,
} from "../api/service/appraisal.api";

// ── Constants ─────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview" },
  { id: "goals", label: "Goals" },
  { id: "appraisals", label: "Appraisals" },
  { id: "feedback", label: "Feedback" },
  { id: "history", label: "History" },
];

const PRIORITY_MAP = {
  high: { color: C.danger, bg: C.dangerLight },
  medium: { color: C.warning, bg: C.warningLight },
  low: { color: C.success, bg: C.successLight },
};

const RATING_MAP = {
  Outstanding: { color: "#059669", bg: "#D1FAE5" },
  "High Performer": { color: "#2563EB", bg: "#DBEAFE" },
  "Meets Expectations": { color: C.warning, bg: C.warningLight },
  "Needs Improvement": { color: C.danger, bg: C.dangerLight },
  Underperforming: { color: "#7C3AED", bg: "#F3E8FF" },
};

const APPRAISAL_STATUS = {
  draft: { label: "Draft", color: C.textMuted, bg: C.surfaceAlt },
  submitted: { label: "Under Review", color: C.warning, bg: C.warningLight },
  hr_scored: { label: "HR Scored", color: "#7C3AED", bg: "#F3E8FF" },
  completed: { label: "Completed", color: C.success, bg: C.successLight },
  rejected: { label: "Returned", color: C.danger, bg: C.dangerLight },
};

const CRITERIA_DEFAULTS = [
  { label: "Job Knowledge", weight: 20, maxScore: 5 },
  { label: "Quality of Work", weight: 20, maxScore: 5 },
  { label: "Communication", weight: 15, maxScore: 5 },
  { label: "Teamwork", weight: 15, maxScore: 5 },
  { label: "Initiative", weight: 15, maxScore: 5 },
  { label: "Professionalism", weight: 15, maxScore: 5 },
];

// ── Animations ────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ══════════════════════════════════════════════════════════════
// SHARED ATOMS
// ══════════════════════════════════════════════════════════════
function Chip({ label, color, bg }) {
  return (
    <span
      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
      style={{ background: bg ?? C.primaryLight, color: color ?? C.primary }}
    >
      {label}
    </span>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
      }}
    >
      {children}
    </div>
  );
}

function CardHead({ icon: Icon, title, sub, color, bg, action }) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-4"
      style={{ borderBottom: `1px solid ${C.border}` }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: bg ?? C.primaryLight }}
      >
        <Icon size={15} color={color ?? C.primary} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
          {title}
        </p>
        {sub && (
          <p className="text-[11px]" style={{ color: C.textMuted }}>
            {sub}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  const color = type === "success" ? C.success : C.danger;
  return (
    <Motion.div
      initial={{ opacity: 0, y: 40, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: 40, x: "-50%" }}
      className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl"
      style={{
        background: C.navy,
        boxShadow: "0 12px 40px rgba(15,23,42,0.35)",
        minWidth: 260,
      }}
    >
      <Icon size={16} color={color} />
      <span className="text-white text-sm font-semibold">{msg}</span>
    </Motion.div>
  );
}

// ── Score ring ────────────────────────────────────────────────
function ScoreRing({ score, size = 120 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = ((score ?? 0) / 100) * circ;
  const color =
    score >= 85
      ? C.success
      : score >= 60
        ? C.primary
        : score >= 40
          ? C.warning
          : C.danger;
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={10}
          stroke={C.border}
        />
        <Motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={10}
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className="text-3xl font-black"
          style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
        >
          {score ?? "—"}
        </span>
        <span
          className="text-[10px] font-semibold"
          style={{ color: C.textMuted }}
        >
          / 100
        </span>
      </div>
    </div>
  );
}

// ── Mini trend chart ──────────────────────────────────────────
function TrendLine({ data }) {
  if (!data?.length) return null;
  const W = 220;
  const H = 60;
  const PAD = 8;
  const scores = data.map((d) => d.score ?? d.final_score ?? 0);
  const min = Math.min(...scores);
  const max = Math.max(...scores, min + 1);
  const pts = scores
    .map((s, i) => {
      const x = PAD + (i / Math.max(scores.length - 1, 1)) * (W - PAD * 2);
      const y = H - PAD - ((s - min) / (max - min + 0.01)) * (H - PAD * 2);
      return `${x},${y}`;
    })
    .join(" ");
  const last = scores.at(-1);
  const prev = scores.at(-2);
  const trend =
    prev == null
      ? "new"
      : last > prev + 2
        ? "up"
        : last < prev - 2
          ? "down"
          : "stable";
  const color =
    trend === "up" ? C.success : trend === "down" ? C.danger : C.primary;
  return (
    <div className="flex items-center gap-3">
      <svg width={W} height={H} style={{ overflow: "visible" }}>
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {scores.map((s, i) => {
          const x = PAD + (i / Math.max(scores.length - 1, 1)) * (W - PAD * 2);
          const y = H - PAD - ((s - min) / (max - min + 0.01)) * (H - PAD * 2);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={4} fill={color} />
              <text
                x={x}
                y={y - 8}
                textAnchor="middle"
                fontSize={8}
                fill={C.textMuted}
              >
                {s}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-1">
        {trend === "up" && <ArrowUpRight size={16} color={C.success} />}
        {trend === "down" && <ArrowDownRight size={16} color={C.danger} />}
        {trend === "stable" && <Minus size={16} color={C.textMuted} />}
        <span className="text-xs font-semibold" style={{ color }}>
          {trend === "new"
            ? "First score"
            : trend === "stable"
              ? "Stable"
              : `${trend === "up" ? "+" : ""}${(last - (prev ?? last)).toFixed(0)}`}
        </span>
      </div>
    </div>
  );
}

// ── Goal bar ──────────────────────────────────────────────────
function GoalBar({ progress, label }) {
  const color =
    progress >= 100
      ? C.success
      : progress >= 60
        ? C.primary
        : progress >= 30
          ? C.warning
          : C.danger;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span
          className="text-xs font-medium"
          style={{ color: C.textSecondary }}
        >
          {label}
        </span>
        <span className="text-xs font-bold" style={{ color }}>
          {progress}%
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: C.surfaceAlt }}
      >
        <Motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

// ── Star rating (read-only) ───────────────────────────────────
function StarRating({ score, max = 5 }) {
  const filled = Math.round((score / max) * 5);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          fill={s <= filled ? C.warning : "none"}
          color={s <= filled ? C.warning : C.border}
        />
      ))}
    </div>
  );
}

// ── Interactive star picker (for manager) ─────────────────────
function StarPicker({ value, max = 5, onChange }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={20}
            fill={i < value ? C.warning : "none"}
            color={i < value ? C.warning : C.border}
          />
        </button>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// APPRAISAL DETAIL MODAL  (read-only — employee & manager view
//  of a received/created appraisal)
// ══════════════════════════════════════════════════════════════
function AppraisalDetailModal({ appraisal, onClose }) {
  const statusCfg =
    APPRAISAL_STATUS[appraisal.status] ?? APPRAISAL_STATUS.draft;
  const managerName = appraisal.manager
    ? `${appraisal.manager.firstName} ${appraisal.manager.lastName}`
    : "Your Manager";
  const hrName = appraisal.hrReviewer
    ? `${appraisal.hrReviewer.firstName} ${appraisal.hrReviewer.lastName}`
    : "HR";

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <Motion.div
        initial={{ scale: 0.93, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 20 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[88vh] flex flex-col"
        style={{
          background: C.surface,
          boxShadow: "0 24px 64px rgba(15,23,42,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: C.primaryLight }}
            >
              <ClipboardList size={14} color={C.primary} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
                Appraisal — {appraisal.cycleName ?? appraisal.period}
              </p>
              <p className="text-[10px]" style={{ color: C.textMuted }}>
                Period: {appraisal.period}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Chip
              label={statusCfg.label}
              color={statusCfg.color}
              bg={statusCfg.bg}
            />
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: C.surfaceAlt }}
            >
              <X size={13} color={C.textMuted} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Score summary — shown when any score exists */}
          {(appraisal.appraisalScore != null ||
            appraisal.managerOverall != null) && (
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Manager Score",
                  value:
                    appraisal.managerOverall != null
                      ? Math.round(appraisal.managerOverall)
                      : "—",
                  color: C.primary,
                  bg: C.primaryLight,
                },
                {
                  label: "HR Score",
                  value:
                    appraisal.hrOverall != null
                      ? Math.round(appraisal.hrOverall)
                      : "—",
                  color: "#7C3AED",
                  bg: "#F3E8FF",
                },
                {
                  label: "Final Score",
                  value:
                    appraisal.appraisalScore != null
                      ? Math.round(appraisal.appraisalScore)
                      : "—",
                  color: C.success,
                  bg: C.successLight,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-3 text-center"
                  style={{ background: s.bg }}
                >
                  <p
                    className="text-xl font-black"
                    style={{ color: s.color, fontFamily: "Sora,sans-serif" }}
                  >
                    {s.value}
                  </p>
                  <p
                    className="text-[10px] font-semibold mt-0.5"
                    style={{ color: s.color }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Manager ratings */}
          {Array.isArray(appraisal.managerRatings) &&
            appraisal.managerRatings.length > 0 && (
              <div>
                <p
                  className="text-xs font-bold mb-2"
                  style={{ color: C.textMuted }}
                >
                  Manager Ratings
                </p>
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: `1px solid ${C.border}` }}
                >
                  {appraisal.managerRatings.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-3"
                      style={{
                        background: i % 2 === 0 ? C.surface : C.surfaceAlt,
                        borderBottom:
                          i < appraisal.managerRatings.length - 1
                            ? `1px solid ${C.border}`
                            : "none",
                      }}
                    >
                      <div>
                        <p
                          className="text-xs font-semibold"
                          style={{ color: C.textPrimary }}
                        >
                          {r.label}
                        </p>
                        {r.comment && (
                          <p
                            className="text-[10px] mt-0.5"
                            style={{ color: C.textMuted }}
                          >
                            {r.comment}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StarRating score={r.score} max={r.maxScore ?? 5} />
                        <span
                          className="text-xs font-bold w-8 text-right"
                          style={{ color: C.primary }}
                        >
                          {r.score}/{r.maxScore ?? 5}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Manager feedback */}
          {appraisal.managerFeedback && (
            <div
              className="rounded-xl p-4"
              style={{
                background: C.primaryLight,
                border: `1px solid ${C.primary}22`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                  style={{
                    background: "linear-gradient(135deg,#4F46E5,#6366F1)",
                  }}
                >
                  {managerName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: C.primary }}>
                    {managerName}
                  </p>
                  <p className="text-[10px]" style={{ color: C.textMuted }}>
                    {appraisal.submittedAt
                      ? new Date(appraisal.submittedAt).toLocaleDateString(
                          "en-NG",
                        )
                      : "Manager"}
                  </p>
                </div>
              </div>
              <p
                className="text-xs leading-relaxed"
                style={{ color: C.textPrimary }}
              >
                {appraisal.managerFeedback}
              </p>
            </div>
          )}

          {/* HR ratings — only after completed */}
          {appraisal.status === "completed" &&
            Array.isArray(appraisal.hrRatings) &&
            appraisal.hrRatings.length > 0 && (
              <div>
                <p
                  className="text-xs font-bold mb-2"
                  style={{ color: C.textMuted }}
                >
                  HR Ratings
                </p>
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: `1px solid ${C.border}` }}
                >
                  {appraisal.hrRatings.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-3"
                      style={{
                        background: i % 2 === 0 ? C.surface : C.surfaceAlt,
                        borderBottom:
                          i < appraisal.hrRatings.length - 1
                            ? `1px solid ${C.border}`
                            : "none",
                      }}
                    >
                      <div>
                        <p
                          className="text-xs font-semibold"
                          style={{ color: C.textPrimary }}
                        >
                          {r.label}
                        </p>
                        {r.comment && (
                          <p
                            className="text-[10px] mt-0.5"
                            style={{ color: C.textMuted }}
                          >
                            {r.comment}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StarRating score={r.score} max={r.maxScore ?? 5} />
                        <span
                          className="text-xs font-bold w-8 text-right"
                          style={{ color: "#7C3AED" }}
                        >
                          {r.score}/{r.maxScore ?? 5}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* HR feedback — only after completed */}
          {appraisal.status === "completed" && appraisal.hrFeedback && (
            <div
              className="rounded-xl p-4"
              style={{ background: "#F3E8FF", border: "1px solid #7C3AED22" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                  style={{
                    background: "linear-gradient(135deg,#7C3AED,#9333EA)",
                  }}
                >
                  {hrName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: "#7C3AED" }}>
                    {hrName} · HR Review
                  </p>
                  <p className="text-[10px]" style={{ color: C.textMuted }}>
                    {appraisal.hrReviewedAt
                      ? new Date(appraisal.hrReviewedAt).toLocaleDateString(
                          "en-NG",
                        )
                      : "HR"}
                  </p>
                </div>
              </div>
              <p
                className="text-xs leading-relaxed"
                style={{ color: C.textPrimary }}
              >
                {appraisal.hrFeedback}
              </p>
            </div>
          )}

          {/* Rejected note */}
          {appraisal.status === "rejected" && appraisal.hrFeedback && (
            <div
              className="rounded-xl p-4"
              style={{
                background: C.dangerLight,
                border: `1px solid ${C.danger}22`,
              }}
            >
              <p className="text-xs font-bold mb-1" style={{ color: C.danger }}>
                Returned to Manager
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: C.textPrimary }}
              >
                {appraisal.hrFeedback}
              </p>
            </div>
          )}

          {/* In-progress status note */}
          {["submitted", "hr_scored"].includes(appraisal.status) && (
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{
                background: C.warningLight,
                border: `1px solid ${C.warning}22`,
              }}
            >
              <Clock size={14} color={C.warning} className="shrink-0" />
              <p className="text-xs" style={{ color: C.textPrimary }}>
                {appraisal.status === "submitted"
                  ? "Submitted by your manager and now in the HR review queue."
                  : "HR has scored this. Pending final sign-off."}
              </p>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
              color: C.textSecondary,
            }}
          >
            Close
          </button>
        </div>
      </Motion.div>
    </Motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// CREATE / EDIT APPRAISAL MODAL  (manager-only)
// Department guard: only shows employees in the manager's dept.
// ══════════════════════════════════════════════════════════════
function CreateAppraisalModal({
  deptEmployees,
  templates,
  editAppraisal,
  onClose,
  onSaved,
}) {
  const isEdit = !!editAppraisal;

  const [employeeId, setEmployeeId] = useState(editAppraisal?.employeeId ?? "");
  const [period, setPeriod] = useState(
    editAppraisal?.period ?? new Date().toISOString().slice(0, 7),
  );
  const [cycleName, setCycleName] = useState(editAppraisal?.cycleName ?? "");
  const [templateId, setTemplateId] = useState(editAppraisal?.templateId ?? "");
  const [feedback, setFeedback] = useState(
    editAppraisal?.managerFeedback ?? "",
  );
  const [ratings, setRatings] = useState(() =>
    editAppraisal?.managerRatings?.length
      ? editAppraisal.managerRatings.map((r) => ({
          ...r,
          score: r.score ?? 0,
          comment: r.comment ?? "",
        }))
      : CRITERIA_DEFAULTS.map((c) => ({ ...c, score: 0, comment: "" })),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // When template changes swap out criteria
  useEffect(() => {
    if (!templateId) {
      setRatings(
        CRITERIA_DEFAULTS.map((c) => ({ ...c, score: 0, comment: "" })),
      );
      return;
    }
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl?.criteria?.length) {
      setRatings(
        tmpl.criteria
          .filter((c) => c?.label)
          .map((c) => ({
            label: c.label,
            weight: c.weight ?? 100 / tmpl.criteria.length,
            maxScore: c.max_score ?? 5,
            score: 0,
            comment: "",
          })),
      );
    }
  }, [templateId, templates]);

  const setRating = (i, field, val) =>
    setRatings((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)),
    );

  const handleSave = async (andSubmit = false) => {
    if (!employeeId) {
      setError("Select an employee.");
      return;
    }
    if (!period) {
      setError("Period is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        period,
        cycleName: cycleName || undefined,
        templateId: templateId || undefined,
        managerFeedback: feedback || undefined,
        managerRatings: ratings.filter((r) => r.score > 0),
      };
      let appraisal;
      if (isEdit) {
        const res = await updateAppraisal(editAppraisal.id, payload);
        appraisal = res.appraisal;
      } else {
        const res = await createAppraisal(employeeId, payload);
        appraisal = res.appraisal;
      }
      if (andSubmit && appraisal?.id) {
        await submitAppraisal(appraisal.id);
      }
      onSaved(
        andSubmit
          ? "Appraisal submitted to HR."
          : isEdit
            ? "Draft updated."
            : "Draft saved.",
      );
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to save appraisal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <Motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden max-h-[92vh] flex flex-col"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          boxShadow: "0 24px 64px rgba(15,23,42,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: C.primaryLight }}
            >
              <ClipboardList size={14} color={C.primary} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
                {isEdit ? "Edit Draft Appraisal" : "New Appraisal"}
              </p>
              <p className="text-[10px]" style={{ color: C.textMuted }}>
                Scores submitted to HR for final review
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: C.surfaceAlt }}
          >
            <X size={13} color={C.textMuted} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: C.dangerLight }}
            >
              <AlertTriangle size={13} color={C.danger} />
              <p className="text-xs" style={{ color: C.danger }}>
                {error}
              </p>
            </div>
          )}

          {/* Department scope notice */}
          <div
            className="flex items-center gap-2 p-3 rounded-xl"
            style={{
              background: C.primaryLight,
              border: `1px solid ${C.primary}22`,
            }}
          >
            <Shield size={13} color={C.primary} className="shrink-0" />
            <p className="text-xs" style={{ color: C.primary }}>
              You can only appraise employees in your own department.
            </p>
          </div>

          {/* Top fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-semibold mb-1"
                style={{ color: C.textPrimary }}
              >
                Employee <span style={{ color: C.danger }}>*</span>
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                disabled={isEdit}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1.5px solid ${C.border}`,
                  color: C.textPrimary,
                  opacity: isEdit ? 0.6 : 1,
                }}
              >
                <option value="">— Select employee —</option>
                {deptEmployees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.first_name ?? e.firstName} {e.last_name ?? e.lastName}
                    {(e.job_role_name ?? e.jobRole)
                      ? ` · ${e.job_role_name ?? e.jobRole}`
                      : ""}
                  </option>
                ))}
              </select>
              {deptEmployees.length === 0 && (
                <p className="text-[10px] mt-1" style={{ color: C.textMuted }}>
                  No employees found in your department.
                </p>
              )}
            </div>
            <div>
              <label
                className="block text-xs font-semibold mb-1"
                style={{ color: C.textPrimary }}
              >
                Period <span style={{ color: C.danger }}>*</span>
              </label>
              <input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1.5px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              />
            </div>
            <div>
              <label
                className="block text-xs font-semibold mb-1"
                style={{ color: C.textPrimary }}
              >
                Cycle Name (optional)
              </label>
              <input
                value={cycleName}
                onChange={(e) => setCycleName(e.target.value)}
                placeholder="e.g. H1 2025 Review"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1.5px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              />
            </div>
            <div>
              <label
                className="block text-xs font-semibold mb-1"
                style={{ color: C.textPrimary }}
              >
                Template (optional)
              </label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1.5px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              >
                <option value="">— Default criteria —</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Criteria ratings */}
          <div>
            <p
              className="text-xs font-bold mb-3"
              style={{ color: C.textPrimary }}
            >
              Performance Criteria
            </p>
            <div className="space-y-3">
              {ratings.map((r, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{
                    background: C.surfaceAlt,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: C.textPrimary }}
                      >
                        {r.label}
                      </p>
                      <p className="text-[10px]" style={{ color: C.textMuted }}>
                        Weight: {r.weight}%
                      </p>
                    </div>
                    <div className="shrink-0">
                      <StarPicker
                        value={r.score}
                        max={r.maxScore ?? 5}
                        onChange={(v) => setRating(i, "score", v)}
                      />
                      <p
                        className="text-[10px] text-right mt-1"
                        style={{ color: r.score > 0 ? C.warning : C.textMuted }}
                      >
                        {r.score > 0
                          ? `${r.score} / ${r.maxScore ?? 5}`
                          : "Not rated"}
                      </p>
                    </div>
                  </div>
                  <input
                    value={r.comment}
                    onChange={(e) => setRating(i, "comment", e.target.value)}
                    placeholder="Optional comment…"
                    className="mt-2 w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                      color: C.textPrimary,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Overall feedback */}
          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: C.textPrimary }}
            >
              Overall Feedback
            </label>
            <textarea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide overall performance feedback for this employee…"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
                color: C.textPrimary,
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 px-5 pb-5 shrink-0"
          style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}
        >
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl text-sm font-semibold"
            style={{
              background: C.surfaceAlt,
              color: C.textSecondary,
              border: `1px solid ${C.border}`,
            }}
          >
            Cancel
          </button>
          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{
              background: C.surfaceAlt,
              color: C.textPrimary,
              border: `1px solid ${C.border}`,
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : null}
            Save Draft
          </Motion.button>
          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: C.primary, opacity: saving ? 0.8 : 1 }}
          >
            {saving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Send size={13} />
            )}
            Submit to HR
          </Motion.button>
        </div>
      </Motion.div>
    </Motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// SELF-ASSESSMENT MODAL
// ══════════════════════════════════════════════════════════════
function AssessmentModal({ review, onClose, onSubmitted }) {
  const [answers, setAnswers] = useState({});
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await submitSelfAssessment(review.id, {
        sections: answers,
        overallComment: comment,
      });
      onSubmitted();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to submit assessment.");
    } finally {
      setSaving(false);
    }
  };

  const sections = review.sections ?? [
    { key: "achievements", label: "Key Achievements this period" },
    { key: "challenges", label: "Challenges faced & how you overcame them" },
    { key: "goals_progress", label: "Progress on assigned goals" },
    { key: "development", label: "Skills developed / training completed" },
    { key: "next_period", label: "Goals & focus for next period" },
  ];

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <Motion.div
        initial={{ scale: 0.93, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 20 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
        style={{
          background: C.surface,
          boxShadow: "0 24px 64px rgba(15,23,42,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-5 py-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: C.primaryLight }}
            >
              <Star size={14} color={C.primary} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
                Self Assessment
              </p>
              <p className="text-[10px]" style={{ color: C.textMuted }}>
                {review.cycle_name ?? review.cycle ?? "Current Cycle"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: C.surfaceAlt }}
          >
            <X size={13} color={C.textMuted} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: C.dangerLight }}
            >
              <AlertTriangle size={13} color={C.danger} />
              <p className="text-xs" style={{ color: C.danger }}>
                {error}
              </p>
            </div>
          )}
          {sections.map((section) => (
            <div key={section.key ?? section.id}>
              <label
                className="block text-xs font-semibold mb-1"
                style={{ color: C.textPrimary }}
              >
                {section.label ?? section.title}
              </label>
              <textarea
                rows={3}
                value={answers[section.key ?? section.id] ?? ""}
                onChange={(e) =>
                  setAnswers((p) => ({
                    ...p,
                    [section.key ?? section.id]: e.target.value,
                  }))
                }
                placeholder="Write your response here..."
                className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1.5px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              />
            </div>
          ))}
          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: C.textPrimary }}
            >
              Overall Comments
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Any additional comments for your reviewer..."
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
                color: C.textPrimary,
              }}
            />
          </div>
        </div>

        <div className="flex gap-3 px-5 pb-5 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
              color: C.textSecondary,
            }}
          >
            Cancel
          </button>
          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: C.primary, opacity: saving ? 0.8 : 1 }}
          >
            {saving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Send size={13} />
            )}
            Submit Assessment
          </Motion.button>
        </div>
      </Motion.div>
    </Motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function PerformancePage() {
  // FIX: read role from useAuth() (same source ManagerProfile.jsx relies
  // on) so we have a reliable fallback if authApi.getMe() omits/nests role
  // differently and silently breaks the manager-only "Create Appraisal" UI.
  const { employee: authEmployee } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [scores, setScores] = useState([]);
  const [latestScore, setLatestScore] = useState(null);
  const [trends, setTrends] = useState([]);
  const [goals, setGoals] = useState([]);
  const [reviews, setReviews] = useState([]);
  // Appraisals I RECEIVED (all roles)
  const [myAppraisals, setMyAppraisals] = useState([]);
  // Appraisals I CREATED as manager (manager-only)
  const [mgrAppraisals, setMgrAppraisals] = useState([]);
  // Department employees for the create modal (manager-only)
  const [deptEmployees, setDeptEmployees] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedGoal, setExpandedGoal] = useState(null);
  // Modals
  const [assessModal, setAssessModal] = useState(null); // self-assessment
  const [detailModal, setDetailModal] = useState(null); // read-only appraisal view
  const [createModal, setCreateModal] = useState(null); // null | "new" | appraisal obj
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // FIX: fall back to authEmployee.role if employee.role (from getMe())
  // is missing/undefined.
  const isManager = ["manager", "admin"].includes(
    employee?.role ?? authEmployee?.role,
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await authApi.getMe();
      const empId = me.employee_id ?? me.employeeId;
      if (!empId)
        throw new Error("No employee profile linked to this account.");

      // FIX: some getMe() responses don't return role at the top level
      // (or nest it under .employee/.user). Fall back to the auth context,
      // which ManagerProfile.jsx already proves is reliable for this.
      const resolvedRole =
        me.role ?? me.employee?.role ?? me.user?.role ?? authEmployee?.role;

      const emp = {
        id: empId,
        name: `${me.firstName ?? me.first_name} ${me.lastName ?? me.last_name}`,
        initials:
          `${(me.firstName ?? me.first_name ?? "?")[0]}${(me.lastName ?? me.last_name ?? "?")[0]}`.toUpperCase(),
        role: resolvedRole,
        departmentId: me.department_id ?? me.departmentId,
        department: me.department_name ?? me.department ?? "",
        email: me.email,
      };
      setEmployee(emp);

      const isManagerRole = ["manager", "admin"].includes(resolvedRole);

      // Base parallel fetches
      const fetches = [
        getEmployeeScores(empId),
        getMyGoals(),
        getMyReviews(),
        getTrends(empId),
        getInsights(empId),
        getMyAppraisals(),
      ];

      // Manager-only additional fetches
      if (isManagerRole) {
        fetches.push(
          listAppraisals({ managerId: empId }), // appraisals I created
          listTemplates(), // for create modal
        );
        // Fetch dept employees from the employees API if available
        try {
          const empMod = await import("../api/service/performanceApi");
          if (empMod.getEmployees)
            fetches.push(
              empMod.getEmployees({
                departmentId: me.department_id ?? me.departmentId,
              }),
            );
          else if (empMod.getAllEmployees)
            fetches.push(empMod.getAllEmployees());
          else fetches.push(Promise.resolve(null));
        } catch {
          fetches.push(Promise.resolve(null));
        }
      }

      const results = await Promise.allSettled(fetches);

      const g = (i) =>
        results[i]?.status === "fulfilled" ? results[i].value : null;

      setScores(g(0)?.data ?? []);
      setLatestScore((g(0)?.data ?? [])[0] ?? null);
      setGoals(g(1)?.data ?? g(1)?.goals ?? []);
      setReviews(g(2)?.data ?? g(2)?.reviews ?? []);
      setTrends(g(3)?.data ?? g(3)?.trends ?? []);
      setInsights(g(4)?.data ?? g(4) ?? []);
      setMyAppraisals(g(5)?.appraisals ?? []);

      if (isManagerRole) {
        setMgrAppraisals(g(6)?.appraisals ?? []);
        setTemplates(g(7)?.templates ?? []);

        // Department employees: filter to own dept if not admin
        const rawEmps = g(8)?.data ?? g(8)?.employees ?? [];
        const deptId = me.department_id ?? me.departmentId;
        const filtered =
          resolvedRole === "admin" || !deptId
            ? rawEmps
            : rawEmps.filter(
                (e) => (e.department_id ?? e.departmentId) === deptId,
              );
        // Exclude self from the list
        setDeptEmployees(filtered.filter((e) => e.id !== empId));
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ??
          err.message ??
          "Failed to load performance data.",
      );
    } finally {
      setLoading(false);
    }
  }, [authEmployee?.role]);

  useEffect(() => {
    load();
  }, [load]);

  // Derived
  const pendingReviews = reviews.filter(
    (r) => r.status?.toLowerCase() === "pending",
  );
  const completedGoals = goals.filter(
    (g) => g.status?.toLowerCase() === "completed" || g.progress >= 100,
  );
  const inProgressGoals = goals.filter(
    (g) => g.status?.toLowerCase() === "in_progress" && g.progress < 100,
  );
  const pendingMgrDrafts = mgrAppraisals.filter((a) =>
    ["draft", "rejected"].includes(a.status),
  );

  const filteredGoals = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return goals.filter(
      (g) =>
        !q ||
        g.title?.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q),
    );
  }, [goals, searchQuery]);

  const ratingCfg = RATING_MAP[latestScore?.rating] ?? {
    color: C.textMuted,
    bg: C.surfaceAlt,
  };

  // Appraisal tab badge: received appraisals + manager pending drafts
  const appraisalBadge =
    myAppraisals.length + (isManager ? pendingMgrDrafts.length : 0);

  // Quick submit draft helper
  const handleSubmitDraft = async (appraisal) => {
    try {
      await submitAppraisal(appraisal.id);
      showToast("Appraisal submitted to HR.");
      load();
    } catch (err) {
      showToast(err?.response?.data?.message ?? "Submit failed.", "error");
    }
  };

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: C.bg }}
      >
        <Loader2
          size={28}
          className="animate-spin"
          style={{ color: C.primary }}
        />
      </div>
    );

  return (
    <div
      className="min-h-screen"
      style={{
        background: C.bg,
        color: C.textPrimary,
        fontFamily: "'DM Sans','Sora',sans-serif",
      }}
    >
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>

      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* ── TOPBAR ── */}
          <header
            className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{
              background: "rgba(240,242,248,0.9)",
              backdropFilter: "blur(12px)",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen((p) => !p)}
              className="p-2 rounded-xl hidden md:flex"
              style={{ background: C.surface }}
            >
              <Menu size={16} color={C.textSecondary} />
            </Motion.button>

            <Motion.div
              className="flex-1 max-w-xs relative"
              animate={{ width: searchFocused ? "320px" : "240px" }}
            >
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                color={C.textMuted}
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search goals..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{
                  background: C.surface,
                  border: `1.5px solid ${searchFocused ? C.primary : C.border}`,
                  color: C.textPrimary,
                }}
              />
            </Motion.div>

            <div className="flex items-center gap-2 ml-auto">
              <Motion.button
                whileHover={{ scale: 1.05 }}
                onClick={load}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <RefreshCw size={14} color={C.textSecondary} />
              </Motion.button>
              <div className="relative">
                <Motion.button
                  className="p-2 rounded-xl"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <Bell size={16} color={C.textSecondary} />
                </Motion.button>
                {pendingReviews.length + pendingMgrDrafts.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                    style={{ background: C.warning }}
                  >
                    {pendingReviews.length + pendingMgrDrafts.length}
                  </span>
                )}
              </div>
              {employee && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    background: "linear-gradient(135deg,#4F46E5,#06B6D4)",
                  }}
                >
                  {employee.initials}
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {/* ── HERO ── */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-6 text-white relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
              }}
            >
              <div className="absolute inset-0 opacity-5">
                <div
                  className="absolute top-0 right-0 w-72 h-72 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle,#fff 0%,transparent 70%)",
                    transform: "translate(30%,-30%)",
                  }}
                />
              </div>
              <div className="relative flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/15 shrink-0">
                  <BarChart2 size={30} />
                </div>
                <div className="flex-1">
                  <h1
                    className="text-2xl font-bold"
                    style={{ fontFamily: "Sora,sans-serif" }}
                  >
                    Performance
                  </h1>
                  <p className="text-indigo-200 text-sm mt-0.5">
                    {employee?.name ?? "Employee"}
                    {isManager && (
                      <span className="ml-2 text-indigo-300 text-xs font-semibold">
                        · Manager
                      </span>
                    )}
                    {latestScore ? (
                      <span>
                        {" "}
                        · Score: <strong>
                          {latestScore.final_score}
                        </strong> — {latestScore.rating}
                      </span>
                    ) : (
                      " · No score data yet"
                    )}
                  </p>
                </div>
                {latestScore && (
                  <div className="shrink-0">
                    <Chip
                      label={latestScore.rating}
                      color={ratingCfg.color}
                      bg={ratingCfg.bg}
                    />
                  </div>
                )}
              </div>
            </Motion.div>

            {error && (
              <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{ background: C.dangerLight }}
              >
                <AlertTriangle size={16} color={C.danger} />
                <p className="text-sm" style={{ color: C.danger }}>
                  {error}
                </p>
              </div>
            )}

            {/* ── PENDING SELF-ASSESSMENT ALERT ── */}
            {pendingReviews.length > 0 && (
              <Motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{
                  background: C.warningLight,
                  border: `1px solid ${C.warning}44`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: C.warning }}
                >
                  <Star size={15} color="#fff" />
                </div>
                <div className="flex-1">
                  <p
                    className="font-semibold text-sm"
                    style={{ color: C.textPrimary }}
                  >
                    {pendingReviews.length} appraisal
                    {pendingReviews.length > 1 ? "s" : ""} pending your
                    self-assessment
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: C.textSecondary }}
                  >
                    Complete your self-assessment to keep the review cycle on
                    track.
                  </p>
                </div>
                <Motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab("appraisals")}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl shrink-0"
                  style={{ background: C.warning, color: "#fff" }}
                >
                  Review Now
                </Motion.button>
              </Motion.div>
            )}

            {/* ── MANAGER DRAFT ALERT ── */}
            {isManager && pendingMgrDrafts.length > 0 && (
              <Motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{
                  background: C.primaryLight,
                  border: `1px solid ${C.primary}44`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: C.primary }}
                >
                  <ClipboardList size={15} color="#fff" />
                </div>
                <div className="flex-1">
                  <p
                    className="font-semibold text-sm"
                    style={{ color: C.textPrimary }}
                  >
                    {pendingMgrDrafts.length} appraisal draft
                    {pendingMgrDrafts.length > 1 ? "s" : ""} awaiting submission
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: C.textSecondary }}
                  >
                    Submit to HR to complete the review cycle.
                  </p>
                </div>
                <Motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab("appraisals")}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl shrink-0"
                  style={{ background: C.primary, color: "#fff" }}
                >
                  View Drafts
                </Motion.button>
              </Motion.div>
            )}

            {/* ── TABS ── */}
            <div
              className="flex gap-1 p-1 rounded-2xl overflow-x-auto"
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                scrollbarWidth: "none",
              }}
            >
              {TABS.map((t) => {
                const active = activeTab === t.id;
                const badge = t.id === "appraisals" ? appraisalBadge : null;
                return (
                  <Motion.button
                    key={t.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab(t.id)}
                    className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 flex items-center gap-1.5"
                    style={{
                      background: active ? C.primary : "transparent",
                      color: active ? "#fff" : C.textSecondary,
                      boxShadow: active
                        ? "0 2px 8px rgba(79,70,229,0.25)"
                        : "none",
                    }}
                  >
                    {t.label}
                    {badge > 0 && (
                      <span
                        className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                        style={{
                          background: active
                            ? "rgba(255,255,255,0.25)"
                            : C.primaryLight,
                          color: active ? "#fff" : C.primary,
                        }}
                      >
                        {badge}
                      </span>
                    )}
                  </Motion.button>
                );
              })}
            </div>

            {/* ══════════════════════════════════════════════════════
                TAB CONTENT
            ══════════════════════════════════════════════════════ */}
            <AnimatePresence mode="wait">
              {/* ── OVERVIEW ── */}
              {activeTab === "overview" && (
                <Motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Card className="p-6 flex items-center gap-6">
                      <ScoreRing score={latestScore?.final_score} />
                      <div className="flex-1 space-y-3">
                        <div>
                          <p
                            className="text-xs"
                            style={{ color: C.textSecondary }}
                          >
                            Current Rating
                          </p>
                          {latestScore?.rating ? (
                            <Chip
                              label={latestScore.rating}
                              color={ratingCfg.color}
                              bg={ratingCfg.bg}
                            />
                          ) : (
                            <p
                              className="text-sm font-semibold"
                              style={{ color: C.textMuted }}
                            >
                              No data
                            </p>
                          )}
                        </div>
                        <div>
                          <p
                            className="text-xs"
                            style={{ color: C.textSecondary }}
                          >
                            Period
                          </p>
                          <p
                            className="font-semibold text-sm"
                            style={{ color: C.textPrimary }}
                          >
                            {latestScore?.period ?? "—"}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            {
                              label: "KPI",
                              value: latestScore?.kpi_score ?? "—",
                            },
                            {
                              label: "Attendance",
                              value: latestScore?.attendance_score ?? "—",
                            },
                            {
                              label: "Training",
                              value: latestScore?.training_score ?? "—",
                            },
                          ].map((s) => (
                            <div
                              key={s.label}
                              className="rounded-xl p-2 text-center"
                              style={{ background: C.surfaceAlt }}
                            >
                              <p
                                className="text-sm font-black"
                                style={{ color: C.textPrimary }}
                              >
                                {s.value}
                              </p>
                              <p
                                className="text-[9px] font-semibold"
                                style={{ color: C.textMuted }}
                              >
                                {s.label}
                              </p>
                            </div>
                          ))}
                        </div>
                        {latestScore?.appraisal_score != null && (
                          <div
                            className="rounded-xl p-2 text-center"
                            style={{ background: "#F3E8FF" }}
                          >
                            <p
                              className="text-sm font-black"
                              style={{ color: "#7C3AED" }}
                            >
                              {Math.round(latestScore.appraisal_score)}
                            </p>
                            <p
                              className="text-[9px] font-semibold"
                              style={{ color: "#7C3AED" }}
                            >
                              Appraisal
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>

                    <Card className="p-6">
                      <CardHead
                        icon={TrendingUp}
                        title="Score Trend"
                        sub="Monthly performance history"
                        color={C.success}
                        bg={C.successLight}
                      />
                      <div className="p-4">
                        {trends.length === 0 ? (
                          <p
                            className="text-sm text-center py-6"
                            style={{ color: C.textMuted }}
                          >
                            No trend data yet
                          </p>
                        ) : (
                          <>
                            <TrendLine data={trends.slice(-6)} />
                            <div className="flex gap-2 mt-3 overflow-x-auto">
                              {trends.slice(-6).map((t, i) => (
                                <div key={i} className="text-center shrink-0">
                                  <p
                                    className="text-[10px]"
                                    style={{ color: C.textMuted }}
                                  >
                                    {t.period?.slice(-5)}
                                  </p>
                                  <p
                                    className="text-xs font-bold"
                                    style={{ color: C.textPrimary }}
                                  >
                                    {t.score ?? t.final_score}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </Card>
                  </div>

                  {insights.length > 0 && (
                    <Card>
                      <CardHead
                        icon={Sparkles}
                        title="Performance Insights"
                        sub="Auto-generated analysis"
                        color="#7C3AED"
                        bg="#F3E8FF"
                      />
                      <div className="p-4 space-y-2">
                        {insights.map((ins, i) => {
                          const cfg = {
                            positive: {
                              color: C.success,
                              bg: C.successLight,
                              icon: TrendingUp,
                            },
                            warning: {
                              color: C.danger,
                              bg: C.dangerLight,
                              icon: AlertCircle,
                            },
                            leadership: {
                              color: "#7C3AED",
                              bg: "#F3E8FF",
                              icon: Trophy,
                            },
                            pip: {
                              color: C.danger,
                              bg: C.dangerLight,
                              icon: AlertTriangle,
                            },
                          }[ins.type] ?? {
                            color: C.primary,
                            bg: C.primaryLight,
                            icon: Info,
                          };
                          const Icon = cfg.icon;
                          return (
                            <Motion.div
                              key={i}
                              custom={i}
                              variants={fadeUp}
                              initial="hidden"
                              animate="visible"
                              className="flex items-center gap-3 p-3 rounded-xl"
                              style={{
                                background: cfg.bg,
                                border: `1px solid ${cfg.color}22`,
                              }}
                            >
                              <Icon
                                size={14}
                                color={cfg.color}
                                className="shrink-0"
                              />
                              <p
                                className="text-xs font-medium"
                                style={{ color: cfg.color }}
                              >
                                {ins.message}
                              </p>
                            </Motion.div>
                          );
                        })}
                      </div>
                    </Card>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Goals In Progress",
                        value: inProgressGoals.length,
                        icon: Target,
                        color: C.primary,
                        bg: C.primaryLight,
                      },
                      {
                        label: "Goals Completed",
                        value: completedGoals.length,
                        icon: CheckCircle2,
                        color: C.success,
                        bg: C.successLight,
                      },
                      {
                        label: "Pending Reviews",
                        value: pendingReviews.length,
                        icon: Clock,
                        color: C.warning,
                        bg: C.warningLight,
                      },
                      {
                        label: isManager
                          ? "My Team Appraisals"
                          : "My Appraisals",
                        value: isManager
                          ? mgrAppraisals.length
                          : myAppraisals.length,
                        icon: ClipboardList,
                        color: "#7C3AED",
                        bg: "#F3E8FF",
                      },
                    ].map((s, i) => (
                      <Motion.div
                        key={s.label}
                        custom={i}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ y: -2 }}
                        className="rounded-2xl p-4 flex items-center gap-3"
                        style={{
                          background: C.surface,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: s.bg }}
                        >
                          <s.icon size={16} color={s.color} />
                        </div>
                        <div>
                          <p
                            className="text-xl font-black"
                            style={{ color: C.textPrimary }}
                          >
                            {s.value}
                          </p>
                          <p
                            className="text-[11px]"
                            style={{ color: C.textSecondary }}
                          >
                            {s.label}
                          </p>
                        </div>
                      </Motion.div>
                    ))}
                  </div>
                </Motion.div>
              )}

              {/* ── GOALS ── */}
              {activeTab === "goals" && (
                <Motion.div
                  key="goals"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Card>
                    <CardHead
                      icon={Target}
                      title="My Goals & KPIs"
                      sub={`${goals.length} goals · ${completedGoals.length} completed`}
                      action={
                        <Chip label={`${inProgressGoals.length} active`} />
                      }
                    />
                    <div className="p-4 space-y-3">
                      {filteredGoals.length === 0 ? (
                        <div className="py-12 text-center">
                          <Target
                            size={36}
                            color={C.textMuted}
                            className="mx-auto mb-2"
                          />
                          <p
                            className="font-semibold text-sm"
                            style={{ color: C.textSecondary }}
                          >
                            {searchQuery
                              ? "No goals match your search"
                              : "No goals assigned yet"}
                          </p>
                        </div>
                      ) : (
                        filteredGoals.map((goal, i) => {
                          const isExpanded = expandedGoal === goal.id;
                          const priorityCfg =
                            PRIORITY_MAP[goal.priority?.toLowerCase()] ??
                            PRIORITY_MAP.medium;
                          const isCompleted =
                            goal.status?.toLowerCase() === "completed" ||
                            goal.progress >= 100;
                          return (
                            <Motion.div
                              key={goal.id}
                              custom={i}
                              variants={fadeUp}
                              initial="hidden"
                              animate="visible"
                              className="rounded-2xl border overflow-hidden"
                              style={{
                                borderColor: C.border,
                                background: C.surface,
                              }}
                            >
                              <button
                                onClick={() =>
                                  setExpandedGoal(isExpanded ? null : goal.id)
                                }
                                className="w-full flex items-center gap-4 p-4 text-left"
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background =
                                    C.surfaceAlt)
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background =
                                    "transparent")
                                }
                              >
                                <div
                                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                  style={{
                                    background: isCompleted
                                      ? C.successLight
                                      : C.primaryLight,
                                  }}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 size={16} color={C.success} />
                                  ) : (
                                    <Target size={16} color={C.primary} />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                    <p
                                      className="font-semibold text-sm truncate"
                                      style={{ color: C.textPrimary }}
                                    >
                                      {goal.title}
                                    </p>
                                    <Chip
                                      label={goal.priority ?? "medium"}
                                      color={priorityCfg.color}
                                      bg={priorityCfg.bg}
                                    />
                                    {isCompleted && (
                                      <Chip
                                        label="✓ Complete"
                                        color={C.success}
                                        bg={C.successLight}
                                      />
                                    )}
                                  </div>
                                  <GoalBar
                                    progress={goal.progress ?? 0}
                                    label={`${goal.progress ?? 0}% complete`}
                                  />
                                </div>
                                <div className="shrink-0 flex items-center gap-2">
                                  <p
                                    className="text-[11px]"
                                    style={{ color: C.textMuted }}
                                  >
                                    {goal.due_date ?? goal.dueDate ?? "—"}
                                  </p>
                                  <Motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                  >
                                    <ChevronDown
                                      size={14}
                                      color={C.textMuted}
                                    />
                                  </Motion.div>
                                </div>
                              </button>
                              <AnimatePresence>
                                {isExpanded && (
                                  <Motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.22 }}
                                    className="overflow-hidden"
                                  >
                                    <div
                                      className="px-4 pb-4 pt-0 space-y-3"
                                      style={{
                                        borderTop: `1px solid ${C.border}`,
                                      }}
                                    >
                                      {goal.description && (
                                        <p
                                          className="text-xs leading-relaxed pt-3"
                                          style={{ color: C.textSecondary }}
                                        >
                                          {goal.description}
                                        </p>
                                      )}
                                      <div
                                        className="flex items-center gap-2 text-xs"
                                        style={{ color: C.textMuted }}
                                      >
                                        <Calendar size={11} />
                                        <span>
                                          Due:{" "}
                                          {goal.due_date ?? goal.dueDate ?? "—"}
                                        </span>
                                        {goal.metric && (
                                          <>
                                            <span>·</span>
                                            <span>Metric: {goal.metric}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </Motion.div>
                                )}
                              </AnimatePresence>
                            </Motion.div>
                          );
                        })
                      )}
                    </div>
                  </Card>
                </Motion.div>
              )}

              {/* ── APPRAISALS ── role-aware ── */}
              {activeTab === "appraisals" && (
                <Motion.div
                  key="appraisals"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* ┌─ MANAGER SECTION (only visible to managers) ──────────┐ */}
                  {isManager && (
                    <Card>
                      <CardHead
                        icon={Users}
                        title="My Team Appraisals"
                        sub={`Appraisals you've created for your department · ${employee?.department ?? ""}`}
                        color={C.primary}
                        bg={C.primaryLight}
                        action={
                          <Motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setCreateModal("new")}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                            style={{ background: C.primary }}
                          >
                            <Plus size={13} /> New Appraisal
                          </Motion.button>
                        }
                      />
                      <div className="p-4 space-y-3">
                        {mgrAppraisals.length === 0 ? (
                          <div className="py-10 text-center">
                            <Users
                              size={32}
                              color={C.textMuted}
                              className="mx-auto mb-2"
                            />
                            <p
                              className="font-semibold text-sm"
                              style={{ color: C.textSecondary }}
                            >
                              No appraisals created yet
                            </p>
                            <p
                              className="text-xs mt-1 mb-4"
                              style={{ color: C.textMuted }}
                            >
                              Create an appraisal for an employee in your
                              department.
                            </p>
                            <Motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setCreateModal("new")}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                              style={{ background: C.primary }}
                            >
                              <Plus size={15} /> Create First Appraisal
                            </Motion.button>
                          </div>
                        ) : (
                          mgrAppraisals.map((apr, i) => {
                            const statusCfg =
                              APPRAISAL_STATUS[apr.status] ??
                              APPRAISAL_STATUS.draft;
                            const empName = apr.employee
                              ? `${apr.employee.firstName} ${apr.employee.lastName}`
                              : apr.employeeId;
                            const isEditable = ["draft", "rejected"].includes(
                              apr.status,
                            );
                            const isLocked = apr.status === "completed";
                            const isSubmitted = apr.status === "submitted";

                            return (
                              <Motion.div
                                key={apr.id}
                                custom={i}
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                                className="rounded-2xl border overflow-hidden"
                                style={{
                                  borderColor:
                                    apr.status === "rejected"
                                      ? `${C.danger}55`
                                      : C.border,
                                  background: C.surface,
                                }}
                              >
                                <div className="flex items-center gap-4 p-4">
                                  {/* Avatar / icon */}
                                  <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm text-white"
                                    style={{
                                      background: isLocked
                                        ? C.success
                                        : isSubmitted
                                          ? C.warning
                                          : C.primary,
                                    }}
                                  >
                                    {empName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .slice(0, 2)
                                      .toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                      <p
                                        className="font-semibold text-sm"
                                        style={{ color: C.textPrimary }}
                                      >
                                        {empName}
                                      </p>
                                      <Chip
                                        label={statusCfg.label}
                                        color={statusCfg.color}
                                        bg={statusCfg.bg}
                                      />
                                    </div>
                                    <div
                                      className="flex items-center gap-3 text-[11px] flex-wrap"
                                      style={{ color: C.textMuted }}
                                    >
                                      <span>
                                        {apr.cycleName ??
                                          `Period ${apr.period}`}
                                      </span>
                                      {apr.employee?.department && (
                                        <>
                                          <span>·</span>
                                          <span>{apr.employee.department}</span>
                                        </>
                                      )}
                                      {isLocked &&
                                        apr.appraisalScore != null && (
                                          <span
                                            className="font-bold"
                                            style={{ color: C.success }}
                                          >
                                            Final:{" "}
                                            {Math.round(apr.appraisalScore)}/100
                                          </span>
                                        )}
                                    </div>
                                  </div>

                                  {/* Action buttons */}
                                  <div className="flex gap-2 shrink-0">
                                    {isLocked && (
                                      <span
                                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl"
                                        style={{
                                          background: C.surfaceAlt,
                                          color: C.textMuted,
                                        }}
                                      >
                                        <Lock size={11} /> Locked
                                      </span>
                                    )}
                                    {isEditable && (
                                      <>
                                        <Motion.button
                                          whileHover={{ scale: 1.04 }}
                                          whileTap={{ scale: 0.97 }}
                                          onClick={() => setCreateModal(apr)}
                                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl"
                                          style={{
                                            background: C.primaryLight,
                                            color: C.primary,
                                          }}
                                        >
                                          <Eye size={12} /> Edit
                                        </Motion.button>
                                        <Motion.button
                                          whileHover={{ scale: 1.04 }}
                                          whileTap={{ scale: 0.97 }}
                                          onClick={() => handleSubmitDraft(apr)}
                                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl text-white"
                                          style={{ background: C.primary }}
                                        >
                                          <Send size={11} /> Submit
                                        </Motion.button>
                                      </>
                                    )}
                                    {!isEditable && !isLocked && (
                                      <Motion.button
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setDetailModal(apr)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl"
                                        style={{
                                          background: C.primaryLight,
                                          color: C.primary,
                                        }}
                                      >
                                        <Eye size={12} /> View
                                      </Motion.button>
                                    )}
                                    {isLocked && (
                                      <Motion.button
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setDetailModal(apr)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl"
                                        style={{
                                          background: C.primaryLight,
                                          color: C.primary,
                                        }}
                                      >
                                        <Eye size={12} /> View
                                      </Motion.button>
                                    )}
                                  </div>
                                </div>

                                {/* Rejected reason */}
                                {apr.status === "rejected" &&
                                  apr.hrFeedback && (
                                    <div className="px-4 pb-4">
                                      <div
                                        className="p-3 rounded-xl text-xs"
                                        style={{
                                          background: C.dangerLight,
                                          color: C.danger,
                                        }}
                                      >
                                        <span className="font-bold">
                                          HR returned:{" "}
                                        </span>
                                        {apr.hrFeedback.slice(0, 160)}
                                        {apr.hrFeedback.length > 160 ? "…" : ""}
                                      </div>
                                    </div>
                                  )}

                                {/* Submitted progress stepper */}
                                {["submitted", "hr_scored"].includes(
                                  apr.status,
                                ) && (
                                  <div className="px-4 pb-4">
                                    <div
                                      className="h-1.5 rounded-full overflow-hidden"
                                      style={{ background: C.surfaceAlt }}
                                    >
                                      <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                          width:
                                            apr.status === "submitted"
                                              ? "60%"
                                              : "85%",
                                          background: statusCfg.color,
                                        }}
                                      />
                                    </div>
                                    <div className="flex justify-between mt-1.5 text-[9px] font-semibold">
                                      {[
                                        "Draft",
                                        "Submitted",
                                        "HR Review",
                                        "Complete",
                                      ].map((step, si) => {
                                        const stepIdx = [
                                          "draft",
                                          "submitted",
                                          "hr_scored",
                                          "completed",
                                        ].indexOf(apr.status);
                                        return (
                                          <span
                                            key={step}
                                            style={{
                                              color:
                                                si <= stepIdx
                                                  ? statusCfg.color
                                                  : C.textMuted,
                                            }}
                                          >
                                            {step}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </Motion.div>
                            );
                          })
                        )}
                      </div>
                    </Card>
                  )}
                  {/* └─────────────────────────────────────────────────────┘ */}

                  {/* ── SELF-ASSESSMENTS (pending performance_reviews) ── */}
                  {pendingReviews.length > 0 && (
                    <Card>
                      <CardHead
                        icon={Star}
                        title="Pending Self-Assessments"
                        sub="Complete these to move your review forward"
                        color={C.warning}
                        bg={C.warningLight}
                        action={
                          <Chip
                            label={`${pendingReviews.length} pending`}
                            color={C.warning}
                            bg={C.warningLight}
                          />
                        }
                      />
                      <div className="p-4 space-y-3">
                        {pendingReviews.map((rev, i) => (
                          <Motion.div
                            key={rev.id}
                            custom={i}
                            variants={fadeUp}
                            initial="hidden"
                            animate="visible"
                            className="flex items-center gap-4 p-4 rounded-2xl"
                            style={{
                              background: C.warningLight,
                              border: `1px solid ${C.warning}33`,
                            }}
                          >
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: C.warning }}
                            >
                              <Star size={18} color="#fff" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-semibold text-sm"
                                style={{ color: C.textPrimary }}
                              >
                                {rev.cycle_name ?? rev.cycle ?? "Review Cycle"}
                              </p>
                              <p
                                className="text-[11px] mt-0.5"
                                style={{ color: C.textMuted }}
                              >
                                {rev.created_at
                                  ? `Issued ${new Date(rev.created_at).toLocaleDateString("en-NG")}`
                                  : "Awaiting your self-assessment"}
                              </p>
                            </div>
                            <Motion.button
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setAssessModal(rev)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white shrink-0"
                              style={{
                                background: `linear-gradient(135deg,${C.primary},#6366F1)`,
                              }}
                            >
                              <Send size={11} /> Start Assessment
                            </Motion.button>
                          </Motion.div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* ── MY RECEIVED APPRAISALS (all roles) ── */}
                  <Card>
                    <CardHead
                      icon={ClipboardList}
                      title="My Appraisals"
                      sub="Appraisals received from your manager"
                      action={
                        myAppraisals.length > 0 ? (
                          <Chip label={`${myAppraisals.length} total`} />
                        ) : null
                      }
                    />
                    <div className="p-4 space-y-3">
                      {myAppraisals.length === 0 ? (
                        <div className="py-12 text-center">
                          <ClipboardList
                            size={36}
                            color={C.textMuted}
                            className="mx-auto mb-2"
                          />
                          <p
                            className="font-semibold text-sm"
                            style={{ color: C.textSecondary }}
                          >
                            No appraisals yet
                          </p>
                          <p
                            className="text-xs mt-1"
                            style={{ color: C.textMuted }}
                          >
                            Your manager will create an appraisal for you.
                          </p>
                        </div>
                      ) : (
                        myAppraisals.map((apr, i) => {
                          const statusCfg =
                            APPRAISAL_STATUS[apr.status] ??
                            APPRAISAL_STATUS.draft;
                          const managerName = apr.manager
                            ? `${apr.manager.firstName} ${apr.manager.lastName}`
                            : "Manager";
                          const isCompleted = apr.status === "completed";
                          const isRejected = apr.status === "rejected";

                          return (
                            <Motion.div
                              key={apr.id}
                              custom={i}
                              variants={fadeUp}
                              initial="hidden"
                              animate="visible"
                              className="rounded-2xl border overflow-hidden"
                              style={{
                                borderColor: isRejected
                                  ? `${C.danger}55`
                                  : C.border,
                                background: C.surface,
                              }}
                            >
                              <div className="flex items-center gap-4 p-4">
                                <div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                  style={{ background: statusCfg.bg }}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2
                                      size={18}
                                      color={statusCfg.color}
                                    />
                                  ) : isRejected ? (
                                    <AlertTriangle
                                      size={18}
                                      color={statusCfg.color}
                                    />
                                  ) : (
                                    <ClipboardList
                                      size={18}
                                      color={statusCfg.color}
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <p
                                      className="font-semibold text-sm"
                                      style={{ color: C.textPrimary }}
                                    >
                                      {apr.cycleName ??
                                        `Appraisal — ${apr.period}`}
                                    </p>
                                    <Chip
                                      label={statusCfg.label}
                                      color={statusCfg.color}
                                      bg={statusCfg.bg}
                                    />
                                  </div>
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <p
                                      className="text-[11px]"
                                      style={{ color: C.textMuted }}
                                    >
                                      By {managerName} · Period {apr.period}
                                    </p>
                                    {isCompleted &&
                                      apr.appraisalScore != null && (
                                        <span
                                          className="text-[11px] font-bold"
                                          style={{ color: C.success }}
                                        >
                                          Score:{" "}
                                          {Math.round(apr.appraisalScore)}/100
                                        </span>
                                      )}
                                  </div>
                                </div>

                                {isCompleted && apr.appraisalScore != null && (
                                  <div
                                    className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg"
                                    style={{
                                      background: C.successLight,
                                      color: C.success,
                                      fontFamily: "Sora,sans-serif",
                                    }}
                                  >
                                    {Math.round(apr.appraisalScore)}
                                  </div>
                                )}

                                <Motion.button
                                  whileHover={{ scale: 1.04 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => setDetailModal(apr)}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0"
                                  style={{
                                    background: C.primaryLight,
                                    color: C.primary,
                                  }}
                                >
                                  <Eye size={12} /> View
                                </Motion.button>
                              </div>

                              {/* Progress stepper */}
                              {!isCompleted && !isRejected && (
                                <div className="px-4 pb-4">
                                  <div
                                    className="flex justify-between text-[10px] mb-1"
                                    style={{ color: C.textMuted }}
                                  >
                                    <span>Review Progress</span>
                                    <span>
                                      {apr.status === "submitted"
                                        ? "50%"
                                        : apr.status === "hr_scored"
                                          ? "80%"
                                          : "25%"}
                                    </span>
                                  </div>
                                  <div
                                    className="h-1.5 rounded-full overflow-hidden"
                                    style={{ background: C.surfaceAlt }}
                                  >
                                    <div
                                      className="h-full rounded-full transition-all duration-500"
                                      style={{
                                        width:
                                          apr.status === "submitted"
                                            ? "50%"
                                            : apr.status === "hr_scored"
                                              ? "80%"
                                              : "25%",
                                        background: statusCfg.color,
                                      }}
                                    />
                                  </div>
                                  <div className="flex justify-between mt-1.5">
                                    {[
                                      "Draft",
                                      "Submitted",
                                      "HR Review",
                                      "Complete",
                                    ].map((step, si) => {
                                      const stepIdx = [
                                        "draft",
                                        "submitted",
                                        "hr_scored",
                                        "completed",
                                      ].indexOf(apr.status);
                                      return (
                                        <span
                                          key={step}
                                          className="text-[9px] font-semibold"
                                          style={{
                                            color:
                                              si <= stepIdx
                                                ? statusCfg.color
                                                : C.textMuted,
                                          }}
                                        >
                                          {step}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {isRejected && apr.hrFeedback && (
                                <div className="px-4 pb-4">
                                  <div
                                    className="p-3 rounded-xl text-xs"
                                    style={{
                                      background: C.dangerLight,
                                      color: C.danger,
                                    }}
                                  >
                                    <span className="font-bold">
                                      Returned:{" "}
                                    </span>
                                    {apr.hrFeedback.slice(0, 120)}
                                    {apr.hrFeedback.length > 120 ? "…" : ""}
                                  </div>
                                </div>
                              )}
                            </Motion.div>
                          );
                        })
                      )}
                    </div>
                  </Card>
                </Motion.div>
              )}

              {/* ── FEEDBACK ── */}
              {activeTab === "feedback" && (
                <Motion.div
                  key="feedback"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Card>
                    <CardHead
                      icon={MessageSquare}
                      title="Manager Feedback"
                      sub="Comments from your performance reviews"
                    />
                    <div className="p-4 space-y-4">
                      {reviews.filter((r) => r.manager_comment).length === 0 &&
                      myAppraisals.filter(
                        (a) => a.managerFeedback && a.status === "completed",
                      ).length === 0 ? (
                        <div className="py-12 text-center">
                          <MessageSquare
                            size={36}
                            color={C.textMuted}
                            className="mx-auto mb-2"
                          />
                          <p
                            className="font-semibold text-sm"
                            style={{ color: C.textSecondary }}
                          >
                            No feedback yet
                          </p>
                        </div>
                      ) : (
                        <>
                          {reviews
                            .filter((r) => r.manager_comment)
                            .map((rev, i) => (
                              <Motion.div
                                key={rev.id}
                                custom={i}
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                                className="p-4 rounded-2xl"
                                style={{
                                  background: C.surfaceAlt,
                                  border: `1px solid ${C.border}`,
                                }}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                                    style={{
                                      background:
                                        "linear-gradient(135deg,#6366F1,#8B5CF6)",
                                    }}
                                  >
                                    {rev.reviewed_by_name
                                      ?.split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .slice(0, 2) ?? "HR"}
                                  </div>
                                  <div>
                                    <p
                                      className="text-xs font-semibold"
                                      style={{ color: C.textPrimary }}
                                    >
                                      {rev.reviewed_by_name ?? "HR"}
                                    </p>
                                    <p
                                      className="text-[10px]"
                                      style={{ color: C.textMuted }}
                                    >
                                      {rev.cycle_name ?? rev.cycle}
                                    </p>
                                  </div>
                                </div>
                                <p
                                  className="text-sm leading-relaxed"
                                  style={{ color: C.textSecondary }}
                                >
                                  {rev.manager_comment}
                                </p>
                              </Motion.div>
                            ))}
                          {myAppraisals
                            .filter(
                              (a) =>
                                a.managerFeedback && a.status === "completed",
                            )
                            .map((apr, i) => {
                              const managerName = apr.manager
                                ? `${apr.manager.firstName} ${apr.manager.lastName}`
                                : "Manager";
                              return (
                                <Motion.div
                                  key={apr.id}
                                  custom={i}
                                  variants={fadeUp}
                                  initial="hidden"
                                  animate="visible"
                                  className="p-4 rounded-2xl"
                                  style={{
                                    background: C.primaryLight,
                                    border: `1px solid ${C.primary}22`,
                                  }}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <div
                                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                                      style={{
                                        background:
                                          "linear-gradient(135deg,#4F46E5,#6366F1)",
                                      }}
                                    >
                                      {managerName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .slice(0, 2)}
                                    </div>
                                    <div>
                                      <p
                                        className="text-xs font-semibold"
                                        style={{ color: C.primary }}
                                      >
                                        {managerName}
                                      </p>
                                      <p
                                        className="text-[10px]"
                                        style={{ color: C.textMuted }}
                                      >
                                        Appraisal —{" "}
                                        {apr.cycleName ?? apr.period}
                                        {apr.managerOverall != null &&
                                          ` · Score: ${Math.round(apr.managerOverall)}/100`}
                                      </p>
                                    </div>
                                  </div>
                                  <p
                                    className="text-sm leading-relaxed"
                                    style={{ color: C.textPrimary }}
                                  >
                                    {apr.managerFeedback}
                                  </p>
                                  {apr.hrFeedback && (
                                    <div
                                      className="mt-3 pt-3"
                                      style={{
                                        borderTop: `1px solid ${C.primary}22`,
                                      }}
                                    >
                                      <p
                                        className="text-[10px] font-bold mb-1"
                                        style={{ color: "#7C3AED" }}
                                      >
                                        HR Comment
                                      </p>
                                      <p
                                        className="text-xs leading-relaxed"
                                        style={{ color: C.textSecondary }}
                                      >
                                        {apr.hrFeedback}
                                      </p>
                                    </div>
                                  )}
                                </Motion.div>
                              );
                            })}
                        </>
                      )}
                    </div>
                  </Card>
                </Motion.div>
              )}

              {/* ── HISTORY ── */}
              {activeTab === "history" && (
                <Motion.div
                  key="history"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Card>
                    <CardHead
                      icon={RotateCcw}
                      title="Score History"
                      sub="All recorded performance scores"
                    />
                    <div className="p-4 space-y-3">
                      {scores.length === 0 ? (
                        <div className="py-12 text-center">
                          <BarChart2
                            size={36}
                            color={C.textMuted}
                            className="mx-auto mb-2"
                          />
                          <p
                            className="font-semibold text-sm"
                            style={{ color: C.textSecondary }}
                          >
                            No score history yet
                          </p>
                        </div>
                      ) : (
                        scores.map((sc, i) => {
                          const rCfg = RATING_MAP[sc.rating] ?? {
                            color: C.textMuted,
                            bg: C.surfaceAlt,
                          };
                          return (
                            <Motion.div
                              key={sc.id ?? i}
                              custom={i}
                              variants={fadeUp}
                              initial="hidden"
                              animate="visible"
                              className="flex items-center gap-4 p-4 rounded-2xl"
                              style={{
                                background: C.surfaceAlt,
                                border: `1px solid ${C.border}`,
                              }}
                            >
                              <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-black text-lg"
                                style={{
                                  background: rCfg.bg,
                                  color: rCfg.color,
                                  fontFamily: "Sora,sans-serif",
                                }}
                              >
                                {sc.final_score}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <p
                                    className="font-semibold text-sm"
                                    style={{ color: C.textPrimary }}
                                  >
                                    {sc.period}
                                  </p>
                                  <Chip
                                    label={sc.rating}
                                    color={rCfg.color}
                                    bg={rCfg.bg}
                                  />
                                </div>
                                <div
                                  className="flex gap-3 text-[11px] flex-wrap"
                                  style={{ color: C.textMuted }}
                                >
                                  <span>KPI: {sc.kpi_score}</span>
                                  <span>·</span>
                                  <span>Attendance: {sc.attendance_score}</span>
                                  <span>·</span>
                                  <span>Training: {sc.training_score}</span>
                                  {sc.appraisal_score != null && (
                                    <>
                                      <span>·</span>
                                      <span
                                        style={{
                                          color: "#7C3AED",
                                          fontWeight: 700,
                                        }}
                                      >
                                        Appraisal:{" "}
                                        {Math.round(sc.appraisal_score)}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </Motion.div>
                          );
                        })
                      )}
                    </div>
                  </Card>
                </Motion.div>
              )}
            </AnimatePresence>
            <div className="h-6" />
          </main>
        </div>
      </div>

      {/* ── MODALS ── */}

      {/* Self-assessment */}
      <AnimatePresence>
        {assessModal && (
          <AssessmentModal
            review={assessModal}
            onClose={() => setAssessModal(null)}
            onSubmitted={() => {
              setReviews((prev) =>
                prev.map((r) =>
                  r.id === assessModal.id
                    ? { ...r, status: "self_completed" }
                    : r,
                ),
              );
              setAssessModal(null);
              showToast("Self-assessment submitted successfully.");
            }}
          />
        )}
      </AnimatePresence>

      {/* Read-only appraisal detail */}
      <AnimatePresence>
        {detailModal && (
          <AppraisalDetailModal
            appraisal={detailModal}
            onClose={() => setDetailModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Create / Edit appraisal (manager-only) */}
      <AnimatePresence>
        {createModal && isManager && (
          <CreateAppraisalModal
            deptEmployees={deptEmployees}
            templates={templates}
            editAppraisal={createModal === "new" ? null : createModal}
            onClose={() => setCreateModal(null)}
            onSaved={(msg) => {
              setCreateModal(null);
              showToast(msg);
              load();
            }}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            msg={toast.msg}
            type={toast.type}
            onDone={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
