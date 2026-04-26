// import { useState, useEffect, useRef } from "react";
// import AdminSideNavbar from "./AdminSideNavbar";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Users,
//   UserPlus,
//   UserCheck,
//   UserX,
//   DollarSign,
//   Bell,
//   Search,
//   Menu,
//   ChevronRight,
//   ChevronDown,
//   Clock,
//   Plane,
//   FileText,
//   AlertTriangle,
//   CheckCircle2,
//   XCircle,
//   TrendingUp,
//   TrendingDown,
//   ArrowUpRight,
//   ArrowDownRight,
//   Calendar,
//   Gift,
//   Cake,
//   Star,
//   Activity,
//   Shield,
//   Briefcase,
//   Building2,
//   BarChart2,
//   PieChart,
//   Settings,
//   Zap,
//   Eye,
//   RefreshCw,
//   Plus,
//   ClipboardCheck,
//   AlertCircle,
//   Loader2,
//   ScrollText,
//   UserCog,
//   Timer,
//   Flame,
//   Target,
//   BookOpen,
//   Award,
//   PartyPopper,
//   Heart,
//   X,
//   Megaphone,
//   Play,
// } from "lucide-react";

// /* ─── Admin colour palette — distinct from employee UI ─── */
// // const C = {
// //   bg: "#0D1117",
// //   bgMid: "#161B27",
// //   surface: "#1C2333",
// //   surfaceHover: "#232D42",
// //   surfaceAlt: "#1A2236",
// //   border: "rgba(255,255,255,0.07)",
// //   borderHover: "rgba(99,102,241,0.4)",
// //   primary: "#6366F1",
// //   primaryLight: "rgba(99,102,241,0.15)",
// //   primaryGlow: "rgba(99,102,241,0.35)",
// //   accent: "#06B6D4",
// //   accentLight: "rgba(6,182,212,0.12)",
// //   success: "#10B981",
// //   successLight: "rgba(16,185,129,0.12)",
// //   warning: "#F59E0B",
// //   warningLight: "rgba(245,158,11,0.12)",
// //   danger: "#EF4444",
// //   dangerLight: "rgba(239,68,68,0.12)",
// //   purple: "#8B5CF6",
// //   purpleLight: "rgba(139,92,246,0.12)",
// //   pink: "#EC4899",
// //   pinkLight: "rgba(236,72,153,0.12)",
// //   textPrimary: "#F1F5F9",
// //   textSecondary: "#94A3B8",
// //   textMuted: "#475569",
// //   navy: "#0F1623",
// // };
// const C = {
//   bg: "#F0F2F8",
//   bgMid: "#E8EBF4",
//   surface: "#FFFFFF",
//   surfaceHover: "#F7F8FC",
//   surfaceAlt: "#F7F8FC",
//   border: "#E4E7F0",
//   borderHover: "rgba(79,70,229,0.35)",
//   primary: "#4F46E5",
//   primaryLight: "#EEF2FF",
//   primaryGlow: "rgba(79,70,229,0.20)",
//   accent: "#06B6D4",
//   accentLight: "#ECFEFF",
//   success: "#10B981",
//   successLight: "#D1FAE5",
//   warning: "#F59E0B",
//   warningLight: "#FEF3C7",
//   danger: "#EF4444",
//   dangerLight: "#FEE2E2",
//   purple: "#8B5CF6",
//   purpleLight: "#EDE9FE",
//   pink: "#EC4899",
//   pinkLight: "#FDF2F8",
//   textPrimary: "#0F172A",
//   textSecondary: "#64748B",
//   textMuted: "#94A3B8",
//   navy: "#1E1B4B",
// };
// /* ─── Admin user ─── */
// const ADMIN = {
//   name: "Ngozi Adeleke",
//   initials: "NA",
//   role: "HR Administrator",
//   id: "ADM-001",
// };

// /* ─── Mock data ─── */
// const RECENT_HIRES = [
//   {
//     id: "EMP-2058",
//     name: "Tunde Bakare",
//     role: "Backend Engineer",
//     dept: "Engineering",
//     avatar: "TB",
//     joined: "Mar 20, 2026",
//     color: "#6366F1",
//   },
//   {
//     id: "EMP-2059",
//     name: "Sade Okonkwo",
//     role: "UX Researcher",
//     dept: "Product",
//     avatar: "SO",
//     joined: "Mar 18, 2026",
//     color: "#10B981",
//   },
//   {
//     id: "EMP-2060",
//     name: "Emeka Eze",
//     role: "Financial Analyst",
//     dept: "Finance",
//     avatar: "EE",
//     joined: "Mar 15, 2026",
//     color: "#F59E0B",
//   },
//   {
//     id: "EMP-2061",
//     name: "Fatima Bello",
//     role: "DevOps Engineer",
//     dept: "Engineering",
//     avatar: "FB",
//     joined: "Mar 12, 2026",
//     color: "#EC4899",
//   },
// ];

// const PENDING_APPROVALS = [
//   {
//     type: "leave",
//     label: "Leave Requests",
//     count: 4,
//     urgent: 2,
//     icon: Plane,
//     color: C.primary,
//     path: "/admin/approvals/leave",
//   },
//   {
//     type: "loan",
//     label: "Loan Requests",
//     count: 3,
//     urgent: 1,
//     icon: DollarSign,
//     color: C.warning,
//     path: "/admin/approvals/loans",
//   },
//   {
//     type: "profile",
//     label: "Profile Changes",
//     count: 2,
//     urgent: 0,
//     icon: UserCog,
//     color: C.accent,
//     path: "/admin/approvals/profile",
//   },
//   {
//     type: "signature",
//     label: "Doc Signatures",
//     count: 5,
//     urgent: 3,
//     icon: ScrollText,
//     color: C.danger,
//     path: "/admin/approvals/documents",
//   },
// ];

// const ATTENDANCE_TODAY = {
//   present: 187,
//   absent: 23,
//   late: 14,
//   total: 224,
//   lateEmployees: [
//     {
//       name: "Chidi Nwachukwu",
//       dept: "Engineering",
//       time: "09:22 AM",
//       avatar: "CN",
//     },
//     { name: "Adaeze Obi", dept: "Finance", time: "09:34 AM", avatar: "AO" },
//     { name: "Kola Adeyemi", dept: "HR", time: "09:48 AM", avatar: "KA" },
//   ],
// };

// const COMPLIANCE_ALERTS = [
//   {
//     id: 1,
//     employee: "Ibrahim Musa",
//     issue: "Work permit expires in 5 days",
//     severity: "critical",
//     dept: "Operations",
//   },
//   {
//     id: 2,
//     employee: "Chidinma Okafor",
//     issue: "Missing emergency contact info",
//     severity: "warning",
//     dept: "Finance",
//   },
//   {
//     id: 3,
//     employee: "Akin Adebayo",
//     issue: "Professional cert expires Jun 2026",
//     severity: "warning",
//     dept: "Engineering",
//   },
//   {
//     id: 4,
//     employee: "Ngozi Eze",
//     issue: "NIN document not uploaded",
//     severity: "warning",
//     dept: "HR",
//   },
// ];

// const CELEBRATIONS = [
//   {
//     type: "birthday",
//     name: "Chukwuemeka Obi",
//     date: "Today",
//     dept: "Finance",
//     avatar: "CO",
//     color: C.pink,
//   },
//   {
//     type: "birthday",
//     name: "Amaka Nwosu",
//     date: "Tomorrow",
//     dept: "Engineering",
//     avatar: "AN",
//     color: C.purple,
//   },
//   {
//     type: "anniversary",
//     name: "Seun Afolabi",
//     date: "Mar 28",
//     dept: "HR",
//     avatar: "SA",
//     years: 3,
//     color: C.warning,
//   },
//   {
//     type: "anniversary",
//     name: "Bola Ogunleye",
//     date: "Mar 30",
//     dept: "Product",
//     avatar: "BO",
//     years: 5,
//     color: C.success,
//   },
// ];

// const ACTIVITY_FEED = [
//   {
//     id: 1,
//     action: "Applied for Annual Leave",
//     user: "Amara Johnson",
//     time: "2 min ago",
//     type: "leave",
//     icon: Plane,
//     color: C.primary,
//   },
//   {
//     id: 2,
//     action: "Payroll processed for March",
//     user: "System",
//     time: "1 hr ago",
//     type: "payroll",
//     icon: DollarSign,
//     color: C.success,
//   },
//   {
//     id: 3,
//     action: "New employee onboarded",
//     user: "Tunde Bakare",
//     time: "3 hrs ago",
//     type: "hire",
//     icon: UserPlus,
//     color: C.accent,
//   },
//   {
//     id: 4,
//     action: "Signed NDA Agreement",
//     user: "Fatima Bello",
//     time: "4 hrs ago",
//     type: "document",
//     icon: ScrollText,
//     color: C.purple,
//   },
//   {
//     id: 5,
//     action: "Rejected loan request",
//     user: "Ngozi Adeleke",
//     time: "5 hrs ago",
//     type: "approval",
//     icon: XCircle,
//     color: C.danger,
//   },
//   {
//     id: 6,
//     action: "Performance review submitted",
//     user: "Emeka Eze",
//     time: "6 hrs ago",
//     type: "perf",
//     icon: TrendingUp,
//     color: C.warning,
//   },
//   {
//     id: 7,
//     action: "Attendance report exported",
//     user: "Ngozi Adeleke",
//     time: "8 hrs ago",
//     type: "report",
//     icon: BarChart2,
//     color: C.textSecondary,
//   },
// ];

// /* ─── Framer variants ─── */
// const fadeUp = {
//   hidden: { opacity: 0, y: 18 },
//   visible: (i = 0) => ({
//     opacity: 1,
//     y: 0,
//     transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
//   }),
// };

// /* ─── Helpers ─── */
// const Skeleton = ({ className = "" }) => (
//   <div
//     className={`rounded-xl ${className}`}
//     style={{
//       background:
//         "linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%)",
//       backgroundSize: "200% 100%",
//       animation: "shimmer 1.5s infinite linear",
//     }}
//   />
// );

// const Card = ({ children, className = "", style = {}, onClick }) => (
//   <motion.div
//     whileHover={onClick ? { y: -2, borderColor: C.borderHover } : {}}
//     transition={{ duration: 0.18 }}
//     onClick={onClick}
//     className={`rounded-2xl overflow-hidden ${onClick ? "cursor-pointer" : ""} ${className}`}
//     style={{
//       background: C.surface,
//       border: `1px solid ${C.border}`,
//       boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
//       ...style,
//     }}
//   >
//     {children}
//   </motion.div>
// );

// /* ─── Donut chart (SVG) ─── */
// const DonutChart = ({ present, absent, late, total }) => {
//   const r = 42;
//   const circ = 2 * Math.PI * r;
//   const stroke = 9;
//   const pPct = present / total;
//   const aPct = absent / total;
//   const lPct = late / total;
//   const pDash = circ * pPct;
//   const aDash = circ * aPct;
//   const lDash = circ * lPct;
//   const pOff = 0;
//   const aOff = -(circ * pPct);
//   const lOff = -(circ * (pPct + aPct));
//   const cx = 52;
//   const cy = 52;
//   return (
//     <svg width={104} height={104} className="-rotate-90">
//       <circle
//         cx={cx}
//         cy={cy}
//         r={r}
//         fill="none"
//         stroke="rgba(255,255,255,0.05)"
//         strokeWidth={stroke}
//       />
//       <motion.circle
//         cx={cx}
//         cy={cy}
//         r={r}
//         fill="none"
//         stroke={C.success}
//         strokeWidth={stroke}
//         strokeLinecap="butt"
//         strokeDasharray={circ}
//         initial={{ strokeDashoffset: circ }}
//         animate={{ strokeDashoffset: circ - pDash }}
//         transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
//       />
//       <motion.circle
//         cx={cx}
//         cy={cy}
//         r={r}
//         fill="none"
//         stroke={C.danger}
//         strokeWidth={stroke}
//         strokeLinecap="butt"
//         strokeDasharray={circ}
//         initial={{ strokeDashoffset: circ }}
//         animate={{ strokeDashoffset: circ - aDash + aOff }}
//         style={{ strokeDashoffset: circ - aDash }}
//         transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
//       >
//         <animateTransform
//           attributeName="transform"
//           type="rotate"
//           from={`${pPct * 360} ${cx} ${cy}`}
//           to={`${pPct * 360} ${cx} ${cy}`}
//         />
//       </motion.circle>
//     </svg>
//   );
// };

// /* ─── Mini bar sparkline ─── */
// const Sparkbar = ({ data, color }) => {
//   const mx = Math.max(...data);
//   return (
//     <div className="flex items-end gap-0.5 h-8">
//       {data.map((v, i) => (
//         <motion.div
//           key={i}
//           initial={{ height: 0 }}
//           animate={{ height: `${(v / mx) * 100}%` }}
//           transition={{ delay: 0.4 + i * 0.04, duration: 0.5, ease: "easeOut" }}
//           className="flex-1 rounded-sm min-h-[2px]"
//           style={{ background: i === data.length - 1 ? color : color + "55" }}
//         />
//       ))}
//     </div>
//   );
// };

// /* ─── Payroll countdown ─── */
// const useCountdown = (targetDate) => {
//   const [time, setTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
//   useEffect(() => {
//     const tick = () => {
//       const diff = new Date(targetDate) - new Date();
//       if (diff <= 0) return;
//       setTime({
//         days: Math.floor(diff / 86400000),
//         hours: Math.floor((diff % 86400000) / 3600000),
//         mins: Math.floor((diff % 3600000) / 60000),
//         secs: Math.floor((diff % 60000) / 1000),
//       });
//     };
//     tick();
//     const t = setInterval(tick, 1000);
//     return () => clearInterval(t);
//   }, [targetDate]);
//   return time;
// };

// /* ════════════════════════════════════ MAIN COMPONENT ══ */
// export default function AdminDashboard() {
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [searchFocused, setSearchFocused] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [notifOpen, setNotifOpen] = useState(false);
//   const [runningPayroll, setRunningPayroll] = useState(false);
//   const [payrollSuccess, setPayrollSuccess] = useState(false);
//   const [quickAction, setQuickAction] = useState(null);
//   const [announcementOpen, setAnnouncementOpen] = useState(false);

//   const payrollDate = "2026-03-31T08:00:00";
//   const countdown = useCountdown(payrollDate);

//   useEffect(() => {
//     const t = setTimeout(() => setLoading(false), 1600);
//     return () => clearTimeout(t);
//   }, []);

//   const totalApprovals = PENDING_APPROVALS.reduce((s, p) => s + p.count, 0);
//   const urgentApprovals = PENDING_APPROVALS.reduce((s, p) => s + p.urgent, 0);

//   const handleRunPayroll = () => {
//     setRunningPayroll(true);
//     setTimeout(() => {
//       setRunningPayroll(false);
//       setPayrollSuccess(true);
//       setTimeout(() => setPayrollSuccess(false), 3500);
//     }, 2500);
//   };

//   const attendancePct = Math.round(
//     (ATTENDANCE_TODAY.present / ATTENDANCE_TODAY.total) * 100,
//   );
//   const sparkData = [78, 85, 82, 88, 91, 87, attendancePct];

//   return (
//     <div
//       className="min-h-screen"
//       style={{
//         background: C.bg,
//         color: C.textPrimary,
//         fontFamily: "'DM Sans','Sora',sans-serif",
//       }}
//     >
//       <div className="flex h-screen overflow-hidden">
//         {/* ═══ ADMIN SIDEBAR ═══ */}
//         <AdminSideNavbar
//           sidebarOpen={sidebarOpen}
//           collapsed={sidebarCollapsed}
//           setCollapsed={setSidebarCollapsed}
//           ADMIN={ADMIN}
//           pendingApprovals={totalApprovals}
//         />

//         {/* ═══ MAIN ═══ */}
//         <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
//           {/* ── TOP BAR ── */}
//           <header
//             className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
//             style={{
//               background: "rgba(13,17,23,0.85)",
//               backdropFilter: "blur(16px)",
//               borderBottom: `1px solid ${C.border}`,
//             }}
//           >
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setSidebarOpen((p) => !p)}
//               className="p-2 rounded-xl"
//               style={{ background: C.surface, border: `1px solid ${C.border}` }}
//             >
//               <Menu size={16} color={C.textSecondary} />
//             </motion.button>

//             {/* Global search */}
//             <motion.div
//               className="flex-1 max-w-sm relative"
//               animate={{ width: searchFocused ? "360px" : "280px" }}
//               transition={{ duration: 0.3 }}
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
//                 placeholder="Search employees, documents, reports…"
//                 className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
//                 style={{
//                   background: C.surface,
//                   border: `1.5px solid ${searchFocused ? C.primary : C.border}`,
//                   color: C.textPrimary,
//                   boxShadow: searchFocused
//                     ? `0 0 0 3px ${C.primaryLight}`
//                     : "none",
//                 }}
//               />
//             </motion.div>

//             <div className="flex items-center gap-2 ml-auto">
//               {/* Quick actions */}
//               {[
//                 {
//                   icon: UserPlus,
//                   label: "Add Employee",
//                   color: C.primary,
//                   action: "add-employee",
//                 },
//                 {
//                   icon: Megaphone,
//                   label: "Announce",
//                   color: C.warning,
//                   action: "announce",
//                 },
//               ].map(({ icon: Icon, label, color, action }) => (
//                 <motion.button
//                   key={action}
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => setQuickAction(action)}
//                   className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
//                   style={{
//                     background: color + "20",
//                     color,
//                     border: `1px solid ${color}33`,
//                   }}
//                 >
//                   <Icon size={13} />
//                   {label}
//                 </motion.button>
//               ))}

//               {/* Notifications */}
//               <div className="relative">
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => setNotifOpen((p) => !p)}
//                   className="relative p-2 rounded-xl"
//                   style={{
//                     background: C.surface,
//                     border: `1px solid ${C.border}`,
//                   }}
//                 >
//                   <Bell size={16} color={C.textSecondary} />
//                   <motion.span
//                     animate={{ scale: [1, 1.2, 1] }}
//                     transition={{ duration: 2, repeat: Infinity }}
//                     className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
//                     style={{ background: C.danger }}
//                   >
//                     {urgentApprovals}
//                   </motion.span>
//                 </motion.button>

//                 <AnimatePresence>
//                   {notifOpen && (
//                     <motion.div
//                       initial={{ opacity: 0, y: 8, scale: 0.97 }}
//                       animate={{ opacity: 1, y: 0, scale: 1 }}
//                       exit={{ opacity: 0, y: 8, scale: 0.97 }}
//                       transition={{ duration: 0.2 }}
//                       className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50 shadow-2xl"
//                       style={{
//                         background: C.surface,
//                         border: `1px solid ${C.border}`,
//                       }}
//                     >
//                       <div
//                         className="p-4 border-b"
//                         style={{ borderColor: C.border }}
//                       >
//                         <p
//                           className="font-semibold text-sm"
//                           style={{ color: C.textPrimary }}
//                         >
//                           Notifications
//                         </p>
//                       </div>
//                       {ACTIVITY_FEED.slice(0, 5).map((item, i) => (
//                         <div
//                           key={item.id}
//                           className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-all cursor-pointer"
//                           style={{
//                             borderBottom:
//                               i < 4 ? `1px solid ${C.border}` : "none",
//                           }}
//                         >
//                           <div
//                             className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
//                             style={{ background: item.color + "22" }}
//                           >
//                             <item.icon size={13} color={item.color} />
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <p
//                               className="text-xs font-medium"
//                               style={{ color: C.textPrimary }}
//                             >
//                               {item.action}
//                             </p>
//                             <p
//                               className="text-[10px] mt-0.5"
//                               style={{ color: C.textMuted }}
//                             >
//                               {item.user} · {item.time}
//                             </p>
//                           </div>
//                         </div>
//                       ))}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>

//               {/* Admin avatar */}
//               <div
//                 className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
//                 style={{
//                   background: "linear-gradient(135deg,#6366F1,#06B6D4)",
//                 }}
//               >
//                 {ADMIN.initials}
//               </div>
//             </div>
//           </header>

//           {/* ── SCROLLABLE DASHBOARD ── */}
//           <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
//             {/* ══ PAGE TITLE ══ */}
//             <motion.div
//               variants={fadeUp}
//               initial="hidden"
//               animate="visible"
//               custom={0}
//               className="flex items-center justify-between"
//             >
//               <div>
//                 <h1
//                   className="text-xl font-bold"
//                   style={{
//                     color: C.textPrimary,
//                     fontFamily: "Sora,sans-serif",
//                   }}
//                 >
//                   HR Command Centre
//                 </h1>
//                 <p
//                   className="text-sm mt-0.5"
//                   style={{ color: C.textSecondary }}
//                 >
//                   Friday, March 27, 2026 · Good morning,{" "}
//                   {ADMIN.name.split(" ")[0]} 👋
//                 </p>
//               </div>
//               <div className="flex items-center gap-2">
//                 <motion.div
//                   animate={{ opacity: [1, 0.5, 1] }}
//                   transition={{ duration: 2, repeat: Infinity }}
//                   className="w-2 h-2 rounded-full"
//                   style={{ background: C.success }}
//                 />
//                 <span
//                   className="text-xs font-medium"
//                   style={{ color: C.success }}
//                 >
//                   Live
//                 </span>
//               </div>
//             </motion.div>

//             {/* ══ KPI STAT CARDS ══ */}
//             {loading ? (
//               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//                 {[1, 2, 3, 4].map((i) => (
//                   <Card key={i} className="p-5">
//                     <Skeleton className="h-24" />
//                   </Card>
//                 ))}
//               </div>
//             ) : (
//               <motion.div
//                 variants={fadeUp}
//                 initial="hidden"
//                 animate="visible"
//                 custom={1}
//                 className="grid grid-cols-2 lg:grid-cols-4 gap-4"
//               >
//                 {[
//                   {
//                     label: "Total Headcount",
//                     value: 224,
//                     icon: Users,
//                     color: C.primary,
//                     bg: C.primaryLight,
//                     trend: +5,
//                     trendPct: "+2.3%",
//                     sparkData: [210, 214, 218, 219, 221, 222, 224],
//                     sub: "vs last month",
//                   },
//                   {
//                     label: "New Hires",
//                     value: 4,
//                     icon: UserPlus,
//                     color: C.success,
//                     bg: C.successLight,
//                     trend: +1,
//                     trendPct: "+33%",
//                     sparkData: [1, 2, 3, 2, 4, 3, 4],
//                     sub: "This month",
//                   },
//                   {
//                     label: "Active Staff",
//                     value: 201,
//                     icon: UserCheck,
//                     color: C.accent,
//                     bg: C.accentLight,
//                     trend: +2,
//                     trendPct: "+1.0%",
//                     sparkData: [195, 197, 198, 200, 200, 201, 201],
//                     sub: "Currently employed",
//                   },
//                   {
//                     label: "On Leave Today",
//                     value: 14,
//                     icon: Plane,
//                     color: C.warning,
//                     bg: C.warningLight,
//                     trend: -3,
//                     trendPct: "-17%",
//                     sparkData: [20, 18, 17, 16, 17, 15, 14],
//                     sub: "Approved absences",
//                   },
//                 ].map(
//                   (
//                     {
//                       label,
//                       value,
//                       icon: Icon,
//                       color,
//                       bg,
//                       trend,
//                       trendPct,
//                       sparkData: sd,
//                       sub,
//                     },
//                     i,
//                   ) => (
//                     <motion.div
//                       key={label}
//                       variants={fadeUp}
//                       initial="hidden"
//                       animate="visible"
//                       custom={i + 1}
//                     >
//                       <Card className="p-5" onClick={() => {}}>
//                         <div className="flex items-start justify-between mb-3">
//                           <div
//                             className="w-9 h-9 rounded-xl flex items-center justify-center"
//                             style={{ background: bg }}
//                           >
//                             <Icon size={16} color={color} />
//                           </div>
//                           <div
//                             className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
//                             style={{
//                               background:
//                                 trend > 0 ? C.successLight : C.dangerLight,
//                               color: trend > 0 ? C.success : C.danger,
//                             }}
//                           >
//                             {trend > 0 ? (
//                               <ArrowUpRight size={10} />
//                             ) : (
//                               <ArrowDownRight size={10} />
//                             )}
//                             {trendPct}
//                           </div>
//                         </div>
//                         <p
//                           className="text-3xl font-bold mb-0.5"
//                           style={{
//                             color: C.textPrimary,
//                             fontFamily: "Sora,sans-serif",
//                           }}
//                         >
//                           {value}
//                         </p>
//                         <p
//                           className="text-xs font-semibold mb-0.5"
//                           style={{ color }}
//                         >
//                           {label}
//                         </p>
//                         <p
//                           className="text-[10px] mb-3"
//                           style={{ color: C.textMuted }}
//                         >
//                           {sub}
//                         </p>
//                         <Sparkbar data={sd} color={color} />
//                       </Card>
//                     </motion.div>
//                   ),
//                 )}
//               </motion.div>
//             )}

//             {/* ══ ROW 2: Payroll + Approvals ══ */}
//             <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
//               {/* Payroll countdown */}
//               <motion.div
//                 variants={fadeUp}
//                 initial="hidden"
//                 animate="visible"
//                 custom={2}
//                 className="lg:col-span-2"
//               >
//                 <Card className="h-full p-5 relative overflow-hidden">
//                   {/* Glow */}
//                   <div className="absolute inset-0 pointer-events-none overflow-hidden">
//                     <div
//                       className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-10"
//                       style={{
//                         background: `radial-gradient(circle,${C.warning},transparent)`,
//                       }}
//                     />
//                   </div>

//                   <div className="relative">
//                     <div className="flex items-center gap-2 mb-4">
//                       <div
//                         className="w-8 h-8 rounded-xl flex items-center justify-center"
//                         style={{ background: C.warningLight }}
//                       >
//                         <DollarSign size={15} color={C.warning} />
//                       </div>
//                       <span
//                         className="font-semibold text-sm"
//                         style={{ color: C.textPrimary }}
//                       >
//                         Next Payroll Run
//                       </span>
//                       <span
//                         className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
//                         style={{
//                           background:
//                             countdown.days <= 3
//                               ? C.dangerLight
//                               : C.warningLight,
//                           color: countdown.days <= 3 ? C.danger : C.warning,
//                         }}
//                       >
//                         <Timer size={9} />
//                         {countdown.days <= 3 ? "Urgent" : "Upcoming"}
//                       </span>
//                     </div>

//                     <p
//                       className="text-sm mb-4"
//                       style={{ color: C.textSecondary }}
//                     >
//                       March 31, 2026 · 224 employees · Estimated ₦87.4M
//                     </p>

//                     {/* Countdown tiles */}
//                     <div className="grid grid-cols-4 gap-2 mb-5">
//                       {[
//                         { label: "Days", value: countdown.days },
//                         { label: "Hours", value: countdown.hours },
//                         { label: "Mins", value: countdown.mins },
//                         { label: "Secs", value: countdown.secs },
//                       ].map(({ label, value }) => (
//                         <div
//                           key={label}
//                           className="flex flex-col items-center p-2.5 rounded-xl"
//                           style={{
//                             background: C.surfaceAlt,
//                             border: `1px solid ${C.border}`,
//                           }}
//                         >
//                           <AnimatePresence mode="wait">
//                             <motion.span
//                               key={value}
//                               initial={{ y: -8, opacity: 0 }}
//                               animate={{ y: 0, opacity: 1 }}
//                               exit={{ y: 8, opacity: 0 }}
//                               transition={{ duration: 0.15 }}
//                               className="text-xl font-bold tabular-nums"
//                               style={{
//                                 color: C.warning,
//                                 fontFamily: "Sora,sans-serif",
//                               }}
//                             >
//                               {String(value).padStart(2, "0")}
//                             </motion.span>
//                           </AnimatePresence>
//                           <span
//                             className="text-[9px] uppercase tracking-wide mt-0.5"
//                             style={{ color: C.textMuted }}
//                           >
//                             {label}
//                           </span>
//                         </div>
//                       ))}
//                     </div>

//                     <motion.button
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       onClick={handleRunPayroll}
//                       disabled={runningPayroll || payrollSuccess}
//                       className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
//                       style={{
//                         background: payrollSuccess
//                           ? C.success
//                           : `linear-gradient(135deg,${C.warning},#D97706)`,
//                         color: "#fff",
//                         boxShadow: payrollSuccess
//                           ? `0 4px 14px ${C.success}55`
//                           : `0 4px 14px ${C.warning}55`,
//                       }}
//                     >
//                       {runningPayroll ? (
//                         <>
//                           <Loader2 size={15} className="animate-spin" />{" "}
//                           Processing…
//                         </>
//                       ) : payrollSuccess ? (
//                         <>
//                           <CheckCircle2 size={15} /> Payroll Initiated!
//                         </>
//                       ) : (
//                         <>
//                           <Play size={15} /> Run Payroll
//                         </>
//                       )}
//                     </motion.button>
//                   </div>
//                 </Card>
//               </motion.div>

//               {/* Pending approvals */}
//               <motion.div
//                 variants={fadeUp}
//                 initial="hidden"
//                 animate="visible"
//                 custom={3}
//                 className="lg:col-span-3"
//               >
//                 <Card className="h-full p-5">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-2">
//                       <div
//                         className="w-8 h-8 rounded-xl flex items-center justify-center"
//                         style={{ background: C.dangerLight }}
//                       >
//                         <ClipboardCheck size={15} color={C.danger} />
//                       </div>
//                       <span
//                         className="font-semibold text-sm"
//                         style={{ color: C.textPrimary }}
//                       >
//                         Pending Approvals
//                       </span>
//                       <span
//                         className="text-xs font-bold px-2 py-0.5 rounded-full"
//                         style={{ background: C.dangerLight, color: C.danger }}
//                       >
//                         {totalApprovals} total
//                       </span>
//                     </div>
//                     <button
//                       className="text-xs font-semibold flex items-center gap-0.5"
//                       style={{ color: C.primary }}
//                     >
//                       View All <ChevronRight size={12} />
//                     </button>
//                   </div>

//                   <div className="grid grid-cols-2 gap-3">
//                     {PENDING_APPROVALS.map((ap) => (
//                       <motion.div
//                         key={ap.type}
//                         whileHover={{ y: -2, borderColor: ap.color + "44" }}
//                         transition={{ duration: 0.18 }}
//                         onClick={() => {}}
//                         className="p-4 rounded-xl cursor-pointer"
//                         style={{
//                           background: C.surfaceAlt,
//                           border: `1px solid ${C.border}`,
//                         }}
//                       >
//                         <div className="flex items-center justify-between mb-2">
//                           <div
//                             className="w-8 h-8 rounded-xl flex items-center justify-center"
//                             style={{ background: ap.color + "20" }}
//                           >
//                             <ap.icon size={15} color={ap.color} />
//                           </div>
//                           {ap.urgent > 0 && (
//                             <span
//                               className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
//                               style={{
//                                 background: C.dangerLight,
//                                 color: C.danger,
//                               }}
//                             >
//                               <AlertCircle size={7} /> {ap.urgent} urgent
//                             </span>
//                           )}
//                         </div>
//                         <p
//                           className="text-2xl font-bold mb-0.5"
//                           style={{
//                             color: ap.color,
//                             fontFamily: "Sora,sans-serif",
//                           }}
//                         >
//                           {ap.count}
//                         </p>
//                         <p
//                           className="text-xs font-medium"
//                           style={{ color: C.textSecondary }}
//                         >
//                           {ap.label}
//                         </p>
//                       </motion.div>
//                     ))}
//                   </div>
//                 </Card>
//               </motion.div>
//             </div>

//             {/* ══ ROW 3: Attendance + New Hires ══ */}
//             <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
//               {/* Attendance snapshot */}
//               <motion.div
//                 variants={fadeUp}
//                 initial="hidden"
//                 animate="visible"
//                 custom={4}
//                 className="lg:col-span-2"
//               >
//                 <Card className="p-5 h-full">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-2">
//                       <div
//                         className="w-8 h-8 rounded-xl flex items-center justify-center"
//                         style={{ background: C.accentLight }}
//                       >
//                         <Clock size={15} color={C.accent} />
//                       </div>
//                       <span
//                         className="font-semibold text-sm"
//                         style={{ color: C.textPrimary }}
//                       >
//                         Attendance Today
//                       </span>
//                     </div>
//                     <span className="text-xs" style={{ color: C.textMuted }}>
//                       Mar 27, 2026
//                     </span>
//                   </div>

//                   <div className="flex items-center gap-4 mb-4">
//                     {/* Donut */}
//                     <div className="relative shrink-0">
//                       <DonutChart {...ATTENDANCE_TODAY} />
//                       <div className="absolute inset-0 flex flex-col items-center justify-center">
//                         <span
//                           className="text-lg font-bold"
//                           style={{
//                             color: C.textPrimary,
//                             fontFamily: "Sora,sans-serif",
//                           }}
//                         >
//                           {attendancePct}%
//                         </span>
//                         <span
//                           className="text-[9px]"
//                           style={{ color: C.textMuted }}
//                         >
//                           present
//                         </span>
//                       </div>
//                     </div>
//                     {/* Stats */}
//                     <div className="flex-1 space-y-2">
//                       {[
//                         {
//                           label: "Present",
//                           value: ATTENDANCE_TODAY.present,
//                           color: C.success,
//                         },
//                         {
//                           label: "Absent",
//                           value: ATTENDANCE_TODAY.absent,
//                           color: C.danger,
//                         },
//                         {
//                           label: "Late",
//                           value: ATTENDANCE_TODAY.late,
//                           color: C.warning,
//                         },
//                       ].map(({ label, value, color }) => (
//                         <div
//                           key={label}
//                           className="flex items-center justify-between"
//                         >
//                           <div className="flex items-center gap-1.5">
//                             <div
//                               className="w-2 h-2 rounded-full"
//                               style={{ background: color }}
//                             />
//                             <span
//                               className="text-xs"
//                               style={{ color: C.textSecondary }}
//                             >
//                               {label}
//                             </span>
//                           </div>
//                           <span
//                             className="text-sm font-bold"
//                             style={{ color, fontFamily: "Sora,sans-serif" }}
//                           >
//                             {value}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Late employees */}
//                   <div>
//                     <p
//                       className="text-[10px] font-bold uppercase tracking-wide mb-2"
//                       style={{ color: C.textMuted }}
//                     >
//                       Late Arrivals
//                     </p>
//                     <div className="space-y-1.5">
//                       {ATTENDANCE_TODAY.lateEmployees.map((emp) => (
//                         <div
//                           key={emp.name}
//                           className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
//                           style={{ background: C.surfaceAlt }}
//                         >
//                           <div
//                             className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
//                             style={{ background: C.warning + "88" }}
//                           >
//                             {emp.avatar}
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <p
//                               className="text-xs font-medium truncate"
//                               style={{ color: C.textPrimary }}
//                             >
//                               {emp.name}
//                             </p>
//                             <p
//                               className="text-[10px]"
//                               style={{ color: C.textMuted }}
//                             >
//                               {emp.dept}
//                             </p>
//                           </div>
//                           <span
//                             className="text-[10px] font-semibold"
//                             style={{ color: C.warning }}
//                           >
//                             {emp.time}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </Card>
//               </motion.div>

//               {/* New hires */}
//               <motion.div
//                 variants={fadeUp}
//                 initial="hidden"
//                 animate="visible"
//                 custom={5}
//                 className="lg:col-span-3"
//               >
//                 <Card className="p-5 h-full">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-2">
//                       <div
//                         className="w-8 h-8 rounded-xl flex items-center justify-center"
//                         style={{ background: C.successLight }}
//                       >
//                         <UserPlus size={15} color={C.success} />
//                       </div>
//                       <div>
//                         <span
//                           className="font-semibold text-sm"
//                           style={{ color: C.textPrimary }}
//                         >
//                           New Hires
//                         </span>
//                         <p
//                           className="text-[10px]"
//                           style={{ color: C.textMuted }}
//                         >
//                           March 2026 · {RECENT_HIRES.length} employees
//                         </p>
//                       </div>
//                     </div>
//                     <button
//                       className="text-xs font-semibold flex items-center gap-0.5"
//                       style={{ color: C.primary }}
//                     >
//                       View All <ChevronRight size={12} />
//                     </button>
//                   </div>

//                   <div className="space-y-2">
//                     {RECENT_HIRES.map((hire, i) => (
//                       <motion.div
//                         key={hire.id}
//                         initial={{ opacity: 0, x: -10 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: 0.1 * i }}
//                         whileHover={{ backgroundColor: C.surfaceHover }}
//                         className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
//                         style={{ background: C.surfaceAlt }}
//                       >
//                         <div
//                           className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
//                           style={{ background: hire.color }}
//                         >
//                           {hire.avatar}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p
//                             className="text-sm font-semibold truncate"
//                             style={{ color: C.textPrimary }}
//                           >
//                             {hire.name}
//                           </p>
//                           <p
//                             className="text-[11px]"
//                             style={{ color: C.textMuted }}
//                           >
//                             {hire.role} · {hire.dept}
//                           </p>
//                         </div>
//                         <div className="text-right shrink-0">
//                           <p
//                             className="text-[10px]"
//                             style={{ color: C.textMuted }}
//                           >
//                             {hire.joined}
//                           </p>
//                           <span
//                             className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
//                             style={{
//                               background: C.successLight,
//                               color: C.success,
//                             }}
//                           >
//                             New
//                           </span>
//                         </div>
//                       </motion.div>
//                     ))}
//                   </div>

//                   {/* Onboarding progress note */}
//                   <div
//                     className="mt-4 p-3 rounded-xl flex items-center gap-2"
//                     style={{
//                       background: C.primaryLight,
//                       border: `1px solid ${C.primary}22`,
//                     }}
//                   >
//                     <Target size={13} color={C.primary} />
//                     <span className="text-xs" style={{ color: C.primary }}>
//                       3 of 4 new hires have completed onboarding.{" "}
//                       <strong>Tunde Bakare</strong> is 60% through.
//                     </span>
//                   </div>
//                 </Card>
//               </motion.div>
//             </div>

//             {/* ══ ROW 4: Compliance + Celebrations + Activity ══ */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
//               {/* Compliance alerts */}
//               <motion.div
//                 variants={fadeUp}
//                 initial="hidden"
//                 animate="visible"
//                 custom={6}
//               >
//                 <Card className="p-5 h-full">
//                   <div className="flex items-center gap-2 mb-4">
//                     <motion.div
//                       animate={{ scale: [1, 1.1, 1] }}
//                       transition={{ duration: 2, repeat: Infinity }}
//                       className="w-8 h-8 rounded-xl flex items-center justify-center"
//                       style={{ background: C.dangerLight }}
//                     >
//                       <AlertTriangle size={15} color={C.danger} />
//                     </motion.div>
//                     <span
//                       className="font-semibold text-sm"
//                       style={{ color: C.textPrimary }}
//                     >
//                       Compliance Alerts
//                     </span>
//                     <span
//                       className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
//                       style={{ background: C.dangerLight, color: C.danger }}
//                     >
//                       {COMPLIANCE_ALERTS.length}
//                     </span>
//                   </div>

//                   <div className="space-y-2">
//                     {COMPLIANCE_ALERTS.map((alert, i) => (
//                       <motion.div
//                         key={alert.id}
//                         initial={{ opacity: 0, y: 5 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: 0.1 * i }}
//                         className="p-3 rounded-xl"
//                         style={{
//                           background:
//                             alert.severity === "critical"
//                               ? C.dangerLight
//                               : C.warningLight,
//                           border: `1px solid ${alert.severity === "critical" ? C.danger : C.warning}33`,
//                         }}
//                       >
//                         <div className="flex items-start gap-2">
//                           <div
//                             className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0 mt-0.5"
//                             style={{
//                               background:
//                                 alert.severity === "critical"
//                                   ? C.danger
//                                   : C.warning,
//                             }}
//                           >
//                             {alert.severity === "critical" ? "!" : "⚠"}
//                           </div>
//                           <div>
//                             <p
//                               className="text-xs font-semibold"
//                               style={{ color: C.textPrimary }}
//                             >
//                               {alert.employee}
//                             </p>
//                             <p
//                               className="text-[10px]"
//                               style={{ color: C.textSecondary }}
//                             >
//                               {alert.issue}
//                             </p>
//                             <p
//                               className="text-[10px] mt-0.5"
//                               style={{ color: C.textMuted }}
//                             >
//                               {alert.dept}
//                             </p>
//                           </div>
//                         </div>
//                       </motion.div>
//                     ))}
//                   </div>

//                   <button
//                     className="mt-3 w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
//                     style={{
//                       background: C.surfaceAlt,
//                       color: C.textSecondary,
//                       border: `1px solid ${C.border}`,
//                     }}
//                   >
//                     <Eye size={12} /> View All Compliance Issues
//                   </button>
//                 </Card>
//               </motion.div>

//               {/* Birthdays & Anniversaries */}
//               <motion.div
//                 variants={fadeUp}
//                 initial="hidden"
//                 animate="visible"
//                 custom={7}
//               >
//                 <Card className="p-5 h-full">
//                   <div className="flex items-center gap-2 mb-4">
//                     <div
//                       className="w-8 h-8 rounded-xl flex items-center justify-center"
//                       style={{ background: C.pinkLight }}
//                     >
//                       <Gift size={15} color={C.pink} />
//                     </div>
//                     <span
//                       className="font-semibold text-sm"
//                       style={{ color: C.textPrimary }}
//                     >
//                       Celebrations
//                     </span>
//                   </div>

//                   <div className="space-y-2.5">
//                     {CELEBRATIONS.map((cel, i) => (
//                       <motion.div
//                         key={cel.name}
//                         initial={{ opacity: 0, x: -5 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: 0.1 * i }}
//                         className="flex items-center gap-3 p-3 rounded-xl"
//                         style={{
//                           background: cel.color + "15",
//                           border: `1px solid ${cel.color}22`,
//                         }}
//                       >
//                         <div
//                           className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
//                           style={{ background: cel.color }}
//                         >
//                           {cel.avatar}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p
//                             className="text-xs font-semibold truncate"
//                             style={{ color: C.textPrimary }}
//                           >
//                             {cel.name}
//                           </p>
//                           <p
//                             className="text-[10px]"
//                             style={{ color: C.textMuted }}
//                           >
//                             {cel.dept}
//                           </p>
//                         </div>
//                         <div className="text-right shrink-0">
//                           <div className="flex items-center gap-1 justify-end mb-0.5">
//                             {cel.type === "birthday" ? (
//                               <Cake size={11} color={cel.color} />
//                             ) : (
//                               <Star size={11} color={cel.color} />
//                             )}
//                             <span
//                               className="text-[10px] font-bold"
//                               style={{ color: cel.color }}
//                             >
//                               {cel.type === "birthday"
//                                 ? "🎂"
//                                 : `🎉 ${cel.years}yr`}
//                             </span>
//                           </div>
//                           <span
//                             className="text-[10px]"
//                             style={{ color: C.textMuted }}
//                           >
//                             {cel.date}
//                           </span>
//                         </div>
//                       </motion.div>
//                     ))}
//                   </div>

//                   <div
//                     className="mt-3 p-3 rounded-xl flex items-center gap-2"
//                     style={{
//                       background: C.purpleLight,
//                       border: `1px solid ${C.purple}22`,
//                     }}
//                   >
//                     <PartyPopper size={13} color={C.purple} />
//                     <span className="text-[11px]" style={{ color: C.purple }}>
//                       2 birthdays and 2 work anniversaries this week!
//                     </span>
//                   </div>
//                 </Card>
//               </motion.div>

//               {/* Recent activity feed */}
//               <motion.div
//                 variants={fadeUp}
//                 initial="hidden"
//                 animate="visible"
//                 custom={8}
//               >
//                 <Card className="p-5 h-full">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-2">
//                       <div
//                         className="w-8 h-8 rounded-xl flex items-center justify-center"
//                         style={{ background: C.primaryLight }}
//                       >
//                         <Activity size={15} color={C.primary} />
//                       </div>
//                       <span
//                         className="font-semibold text-sm"
//                         style={{ color: C.textPrimary }}
//                       >
//                         Activity Feed
//                       </span>
//                     </div>
//                     <motion.div
//                       animate={{ opacity: [1, 0.4, 1] }}
//                       transition={{ duration: 2, repeat: Infinity }}
//                       className="flex items-center gap-1.5"
//                     >
//                       <div
//                         className="w-1.5 h-1.5 rounded-full"
//                         style={{ background: C.success }}
//                       />
//                       <span
//                         className="text-[10px]"
//                         style={{ color: C.success }}
//                       >
//                         Live
//                       </span>
//                     </motion.div>
//                   </div>

//                   {/* Timeline */}
//                   <div className="relative space-y-3">
//                     <div
//                       className="absolute left-3.5 top-0 bottom-0 w-px"
//                       style={{ background: C.border }}
//                     />
//                     {ACTIVITY_FEED.map((item, i) => (
//                       <motion.div
//                         key={item.id}
//                         initial={{ opacity: 0, x: -8 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: 0.06 * i }}
//                         className="flex items-start gap-3 pl-2"
//                       >
//                         <motion.div
//                           initial={{ scale: 0 }}
//                           animate={{ scale: 1 }}
//                           transition={{ delay: 0.06 * i + 0.1, type: "spring" }}
//                           className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10"
//                           style={{
//                             background: item.color + "25",
//                             border: `1.5px solid ${item.color}`,
//                           }}
//                         >
//                           <item.icon size={9} color={item.color} />
//                         </motion.div>
//                         <div
//                           className="flex-1 min-w-0 pb-2.5"
//                           style={{
//                             borderBottom:
//                               i < ACTIVITY_FEED.length - 1
//                                 ? `1px solid ${C.border}`
//                                 : "none",
//                           }}
//                         >
//                           <p
//                             className="text-xs font-medium leading-tight"
//                             style={{ color: C.textPrimary }}
//                           >
//                             {item.action}
//                           </p>
//                           <div className="flex items-center gap-1.5 mt-0.5">
//                             <span
//                               className="text-[10px]"
//                               style={{ color: C.textMuted }}
//                             >
//                               {item.user}
//                             </span>
//                             <span
//                               className="text-[10px]"
//                               style={{ color: C.textMuted }}
//                             >
//                               ·
//                             </span>
//                             <span
//                               className="text-[10px]"
//                               style={{ color: C.textMuted }}
//                             >
//                               {item.time}
//                             </span>
//                           </div>
//                         </div>
//                       </motion.div>
//                     ))}
//                   </div>
//                 </Card>
//               </motion.div>
//             </div>

//             <div className="h-4" />
//           </main>
//         </div>
//       </div>

//       {/* ── CLICK OUTSIDE CLOSE NOTIF ── */}
//       {notifOpen && (
//         <div
//           className="fixed inset-0 z-30"
//           onClick={() => setNotifOpen(false)}
//         />
//       )}
//     </div>
//   );
// }

// /* ─── Inline icon alias ─── */
// // function Activity(props) {
// //   return <BarChart2 {...props} />;
// // }
// // function Cake(props) {
// //   return <Gift {...props} />;
// // }
// // function PartyPopper(props) {
// //   return <Star {...props} />;
// // }



// src/admin/AdminDashboard.jsx
// Production-ready — zero mock data
// Wired to: /auth/me, /employees, /attendance/today, /leave/requests,
//           /payroll/dashboard, /payroll/runs, /performance/dashboard,
//           /approvals, /announcements, /trainings/dashboard

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import AdminSideNavbar from "./AdminSideNavbar";
import Loader from "../components/Loader";
import C from "../styles/colors";
import {
  Users, UserPlus, UserCheck, UserX, DollarSign, Bell, Search,
  Menu, ChevronRight, ChevronDown, Clock, Plane, FileText,
  AlertTriangle, CheckCircle2, XCircle, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, Calendar, Gift, Cake, Star,
  Activity, Briefcase, BarChart2, Settings, Zap, Eye, RefreshCw,
  Plus, ClipboardCheck, AlertCircle, Loader2, ScrollText, UserCog,
  Target, BookOpen, Award, PartyPopper, Heart, X, Megaphone, Play,
  LogOut, Shield,
} from "lucide-react";

// ─── API imports ───────────────────────────────────────────────
import { getEmployees }          from "../api/service/employeeApi";
import { attendanceApi }         from "../api/service/attendanceApi";
import { leaveApi }              from "../api/service/leaveApi";
import { getDashboard as getPayrollDashboard, initRun, processRun, approveRun } from "../api/service/payrollApi";
import { getDashboard as getPerfDashboard }  from "../api/service/performanceApi";
import { approvalApi }           from "../api/service/approvalApi";
import { listTrainings }         from "../api/service/trainingApi";
import API                       from "../api/axios";

// Auth helpers
const authApi = {
  getMe:  ()              => API.get("/auth/me").then(r => r.data),
  logout: (refreshToken)  => API.post("/auth/logout", { refreshToken }).then(r => r.data),
};
const announcementApi = {
  feed: (params = {}) => API.get("/announcements/feed", { params }).then(r => r.data),
};

/* ─── Framer variants ─── */
const fadeUp = {
  hidden:  { opacity: 0, y: 18 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: [0.22,1,0.36,1] } }),
};

/* ─── Skeleton ─── */
const Skeleton = ({ className = "" }) => (
  <div className={`rounded-xl animate-pulse ${className}`} style={{ background: C.bgMid ?? "#E8EBF4" }} />
);

/* ─── Card ─── */
const Card = ({ children, className = "", style = {}, onClick }) => (
  <motion.div
    whileHover={onClick ? { y: -2, borderColor: C.primary + "44" } : {}}
    transition={{ duration: 0.18 }}
    onClick={onClick}
    className={`rounded-2xl overflow-hidden ${onClick ? "cursor-pointer" : ""} ${className}`}
    style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", ...style }}>
    {children}
  </motion.div>
);

/* ─── Donut chart ─── */
const DonutChart = ({ present = 0, absent = 0, late = 0, total = 1 }) => {
  const r = 42, cx = 52, cy = 52, stroke = 9;
  const circ = 2 * Math.PI * r;
  const pPct = present / total, aPct = absent / total;
  return (
    <svg width={104} height={104} className="-rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={stroke} />
      <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke={C.success} strokeWidth={stroke}
        strokeLinecap="butt" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - pPct) }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }} />
      <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke={C.danger} strokeWidth={stroke}
        strokeLinecap="butt" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ * (1 - aPct) }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
        style={{ transform: `rotate(${pPct * 360}deg)`, transformOrigin: `${cx}px ${cy}px` }} />
    </svg>
  );
};

/* ─── Sparkbar ─── */
const Sparkbar = ({ data, color }) => {
  const mx = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((v, i) => (
        <motion.div key={i} initial={{ height: 0 }}
          animate={{ height: `${(v / mx) * 100}%` }}
          transition={{ delay: 0.4 + i * 0.04, duration: 0.5, ease: "easeOut" }}
          className="flex-1 rounded-sm min-h-[2px]"
          style={{ background: i === data.length - 1 ? color : color + "55" }} />
      ))}
    </div>
  );
};

/* ─── Payroll countdown ─── */
const useCountdown = (targetDate) => {
  const [time, setTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) { setTime({ days: 0, hours: 0, mins: 0, secs: 0 }); return; }
      setTime({ days: Math.floor(diff/86400000), hours: Math.floor((diff%86400000)/3600000),
        mins: Math.floor((diff%3600000)/60000), secs: Math.floor((diff%60000)/1000) });
    };
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, [targetDate]);
  return time;
};

/* ─── String to gradient color ─── */
function strColor(str = "") {
  let h = 0; for (let c of str) h = c.charCodeAt(0) + ((h << 5) - h);
  return `hsl(${Math.abs(h) % 360},65%,52%)`;
}

/* ════════════════════════ MAIN ════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const now_ = new Date();

  /* ── Auth ── */
  const [admin,       setAdmin]       = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* ── Data ── */
  const [employees,      setEmployees]      = useState([]);
  const [attendance,     setAttendance]     = useState(null);
  const [leaveRequests,  setLeaveRequests]  = useState([]);
  const [payrollData,    setPayrollData]    = useState(null);
  const [payrollRuns,    setPayrollRuns]    = useState([]);
  const [approvals,      setApprovals]      = useState([]);
  const [announcements,  setAnnouncements]  = useState([]);
  const [trainings,      setTrainings]      = useState([]);
  const [perfData,       setPerfData]       = useState(null);

  const [dataLoading, setDataLoading] = useState(true);
  const [error,       setError]       = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  /* ── UI ── */
  const [sidebarOpen,      setSidebarOpen]      = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchFocused,    setSearchFocused]    = useState(false);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [notifOpen,        setNotifOpen]        = useState(false);
  const [quickAction,      setQuickAction]      = useState(null);

  /* ── Payroll run state ── */
  const [runningPayroll,  setRunningPayroll]  = useState(false);
  const [payrollSuccess,  setPayrollSuccess]  = useState(false);
  const [payrollError,    setPayrollError]    = useState(null);

  /* ── Greeting ── */
  const hour = now_.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now_.toLocaleDateString("en-NG", { weekday:"long", month:"long", day:"numeric", year:"numeric" });

  /* ── Next payroll date (last day of current month) ── */
  const payrollTarget = new Date(now_.getFullYear(), now_.getMonth() + 1, 0, 17, 0, 0).toISOString();
  const countdown = useCountdown(payrollTarget);

  /* ── Load profile ── */
  useEffect(() => {
    authApi.getMe()
      .then(r => setAdmin(r.data ?? r))
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  /* ── Load all dashboard data ── */
  const loadData = useCallback(async () => {
    setDataLoading(true); setError(null);
    const results = await Promise.allSettled([
      getEmployees({ limit: 100 }),
      attendanceApi.getToday(),
      leaveApi.getAllRequests({ status: "pending", limit: 50 }),
      getPayrollDashboard(),
      approvalApi.getAll({ status: "pending", limit: 20 }),
      announcementApi.feed({ limit: 8 }),
      listTrainings({ status: "upcoming", limit: 10 }),
    ]);

    if (results[0].status === "fulfilled") setEmployees(results[0].value?.data ?? []);
    if (results[1].status === "fulfilled") setAttendance(results[1].value?.data ?? results[1].value ?? null);
    if (results[2].status === "fulfilled") setLeaveRequests(results[2].value?.data ?? []);
    if (results[3].status === "fulfilled") {
      const pd = results[3].value;
      setPayrollData(pd);
      setPayrollRuns(pd?.recentRuns ?? pd?.data?.recentRuns ?? []);
    }
    if (results[4].status === "fulfilled") setApprovals(results[4].value?.data ?? []);
    if (results[5].status === "fulfilled") setAnnouncements(results[5].value?.data ?? []);
    if (results[6].status === "fulfilled") setTrainings(results[6].value?.data ?? []);

    // Performance dashboard (may fail if no data)
    try {
      const period = `${now_.getFullYear()}-${String(now_.getMonth() + 1).padStart(2, "0")}`;
      const perf = await getPerfDashboard({ period });
      setPerfData(perf);
    } catch {}

    setDataLoading(false);
    setLastRefresh(new Date());
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Logout ── */
  const handleLogout = async () => {
    try {
      const rt = localStorage.getItem("refreshToken");
      if (rt) await authApi.logout(rt);
    } catch {}
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  /* ── Run payroll ── */
  const handleRunPayroll = async () => {
    setRunningPayroll(true); setPayrollError(null);
    try {
      const month = now_.getMonth() + 1;
      const year  = now_.getFullYear();
      // 1. Create run if none exists for this period
      let run;
      try {
        const initRes = await initRun({ month, year });
        run = initRes.data ?? initRes;
      } catch (e) {
        // Might already exist — fetch existing
        const existing = payrollRuns.find(r => r.month === month && r.year === year);
        if (existing) run = existing;
        else throw e;
      }
      // 2. Process
      await processRun(run.id);
      // 3. Approve
      await approveRun(run.id);
      setPayrollSuccess(true);
      setTimeout(() => setPayrollSuccess(false), 4000);
      loadData(); // refresh
    } catch (err) {
      setPayrollError(err?.response?.data?.message ?? "Failed to process payroll.");
      setTimeout(() => setPayrollError(null), 5000);
    } finally {
      setRunningPayroll(false);
    }
  };

  /* ── Derived stats ── */
  const totalEmployees  = employees.length || 0;
  const activeEmployees = employees.filter(e => e.employment_status === "active").length;
  const onLeaveToday    = employees.filter(e => e.employment_status === "on_leave").length;
  const newHiresMonth   = employees.filter(e => {
    if (!e.created_at) return false;
    const d = new Date(e.created_at);
    return d.getMonth() === now_.getMonth() && d.getFullYear() === now_.getFullYear();
  });

  const attendPresent  = Number(attendance?.present  ?? attendance?.present_count  ?? 0);
  const attendAbsent   = Number(attendance?.absent   ?? attendance?.absent_count   ?? 0);
  const attendLate     = Number(attendance?.late     ?? attendance?.late_count     ?? 0);
  const attendTotal    = attendPresent + attendAbsent + attendLate || totalEmployees || 1;
  const attendancePct  = Math.round((attendPresent / attendTotal) * 100) || 0;
  const lateEmployees  = attendance?.late_employees ?? attendance?.lateEmployees ?? [];

  const pendingLeave   = leaveRequests.length;
  const pendingApprovals = approvals.length;
  const urgentApprovals  = approvals.filter(a => a.priority === "urgent" || a.urgent).length;

  const adminInitials = admin
    ? ((admin.first_name?.[0] ?? "") + (admin.last_name?.[0] ?? "")).toUpperCase()
    : "AD";
  const adminName = admin ? `${admin.first_name ?? ""} ${admin.last_name ?? ""}`.trim() : "Admin";

  const recentHires = newHiresMonth.slice(0, 5);

  // Activity feed from leave requests + approvals
  const activityFeed = [
    ...leaveRequests.slice(0, 3).map(r => ({
      id: r.id, action: `Leave request — ${r.policy_name ?? r.leave_type ?? "Leave"}`,
      user: r.employee_name ?? "Employee", time: new Date(r.created_at).toLocaleTimeString("en-NG", { hour:"2-digit", minute:"2-digit" }),
      icon: Plane, color: C.primary,
    })),
    ...approvals.slice(0, 3).map(a => ({
      id: a.id, action: a.description ?? `Pending: ${a.type ?? "Approval"}`,
      user: a.requester_name ?? "Employee", time: new Date(a.created_at ?? Date.now()).toLocaleTimeString("en-NG", { hour:"2-digit", minute:"2-digit" }),
      icon: ClipboardCheck, color: C.warning,
    })),
    ...announcements.slice(0, 2).map(a => ({
      id: a.id, action: `Announcement: ${a.title}`,
      user: a.posted_by ?? "HR", time: new Date(a.created_at).toLocaleTimeString("en-NG", { hour:"2-digit", minute:"2-digit" }),
      icon: Megaphone, color: C.accent,
    })),
  ].slice(0, 8);

  /* ─────────────────────── FULL-SCREEN LOADER ─────────────────────── */
  if (authLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: C.bg }}>
        <Loader />
      </div>
    );
  }

  /* ─────────────────────── RENDER ─────────────────────── */
  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.textPrimary, fontFamily: "'DM Sans','Sora',sans-serif" }}>
      <div className="flex h-screen overflow-hidden">

        {/* ═══ SIDEBAR ═══ */}
        <AdminSideNavbar
          sidebarOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          admin={admin}
          pendingApprovals={pendingApprovals}
          onLogout={handleLogout}
        />

        {/* ═══ MAIN ═══ */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* ── TOP BAR ── */}
          <header className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{ background: "rgba(240,242,248,0.9)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${C.border}` }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(p => !p)}
              className="p-2 rounded-xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <Menu size={16} color={C.textSecondary} />
            </motion.button>

            <motion.div className="flex-1 max-w-sm relative"
              animate={{ width: searchFocused ? "360px" : "280px" }} transition={{ duration: 0.3 }}>
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" color={C.textMuted} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
                placeholder="Search employees, reports…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{ background: C.surface, border: `1.5px solid ${searchFocused ? C.primary : C.border}`, color: C.textPrimary,
                  boxShadow: searchFocused ? `0 0 0 3px ${C.primaryLight}` : "none" }} />
            </motion.div>

            <div className="flex items-center gap-2 ml-auto">
              {/* Quick actions */}
              {[
                { icon: UserPlus, label: "Add Employee", color: C.primary, to: "/admin/employeemanagement/admin-employees?new=1" },
                { icon: Megaphone, label: "Announce",    color: C.warning, to: "/admin/announcements?new=1" },
              ].map(({ icon: Icon, label, color, to }) => (
                <motion.div key={label} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to={to}
                    className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: color + "20", color, border: `1px solid ${color}33` }}>
                    <Icon size={13} />{label}
                  </Link>
                </motion.div>
              ))}

              {/* Refresh */}
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={loadData} title="Refresh data"
                className="p-2 rounded-xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <RefreshCw size={14} color={dataLoading ? C.primary : C.textSecondary}
                  className={dataLoading ? "animate-spin" : ""} />
              </motion.button>

              {/* Notifications */}
              <div className="relative">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setNotifOpen(p => !p)}
                  className="relative p-2 rounded-xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                  <Bell size={16} color={C.textSecondary} />
                  {pendingApprovals > 0 && (
                    <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ background: C.danger }}>
                      {pendingApprovals > 9 ? "9+" : pendingApprovals}
                    </motion.span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }} transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50 shadow-2xl"
                      style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
                        <p className="font-semibold text-sm" style={{ color: C.textPrimary }}>Notifications</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: C.dangerLight, color: C.danger }}>
                          {pendingApprovals} pending
                        </span>
                      </div>
                      {activityFeed.slice(0, 5).map((item, i) => (
                        <div key={item.id} className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-all hover:opacity-80"
                          style={{ borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
                          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: item.color + "22" }}>
                            <item.icon size={13} color={item.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: C.textPrimary }}>{item.action}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>{item.user} · {item.time}</p>
                          </div>
                        </div>
                      ))}
                      {activityFeed.length === 0 && (
                        <p className="text-xs text-center py-6" style={{ color: C.textMuted }}>No recent activity.</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Admin avatar + name */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: "linear-gradient(135deg,#6366F1,#06B6D4)" }}>
                  {adminInitials}
                </div>
                <span className="hidden md:block text-xs font-semibold" style={{ color: C.textPrimary }}>
                  {adminName.split(" ")[0]}
                </span>
              </div>
            </div>
          </header>

          {/* ── SCROLLABLE CONTENT ── */}
          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">

            {/* ── PAGE TITLE ── */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
              className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>
                  HR Command Centre
                </h1>
                <p className="text-sm mt-0.5" style={{ color: C.textSecondary }}>
                  {dateStr} · {greeting}, {adminName.split(" ")[0]} 👋
                </p>
              </div>
              <div className="flex items-center gap-2">
                {lastRefresh && (
                  <span className="text-[10px]" style={{ color: C.textMuted }}>
                    Updated {lastRefresh.toLocaleTimeString("en-NG", { hour:"2-digit", minute:"2-digit" })}
                  </span>
                )}
                <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full" style={{ background: C.success }} />
                <span className="text-xs font-medium" style={{ color: C.success }}>Live</span>
              </div>
            </motion.div>

            {/* ── KPI CARDS ── */}
            {dataLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <Card key={i} className="p-5"><Skeleton className="h-24" /></Card>)}
              </div>
            ) : (
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Headcount",  value: totalEmployees,  icon: Users,     color: C.primary,  bg: C.primaryLight, sub: "All employees" },
                  { label: "New Hires",         value: recentHires.length, icon: UserPlus, color: C.success,  bg: C.successLight, sub: "This month" },
                  { label: "Active Staff",      value: activeEmployees, icon: UserCheck, color: "#06B6D4",  bg: "#ECFEFF",      sub: "Currently active" },
                  { label: "On Leave Today",    value: onLeaveToday,    icon: Plane,     color: C.warning,  bg: C.warningLight, sub: "Approved absences" },
                ].map(({ label, value, icon: Icon, color, bg, sub }, i) => (
                  <motion.div key={label} variants={fadeUp} initial="hidden" animate="visible" custom={i + 1}>
                    <Card className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                          <Icon size={16} color={color} />
                        </div>
                      </div>
                      <p className="text-3xl font-bold mb-0.5" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>
                        {value}
                      </p>
                      <p className="text-xs font-semibold mb-0.5" style={{ color }}>{label}</p>
                      <p className="text-[10px]" style={{ color: C.textMuted }}>{sub}</p>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ── ROW 2: Payroll + Approvals ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

              {/* Payroll countdown */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="lg:col-span-2">
                <Card className="h-full p-5 relative overflow-hidden">
                  <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-10 pointer-events-none"
                    style={{ background: `radial-gradient(circle,${C.warning},transparent)` }} />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: C.warningLight }}>
                        <DollarSign size={15} color={C.warning} />
                      </div>
                      <span className="font-semibold text-sm" style={{ color: C.textPrimary }}>Next Payroll Run</span>
                      <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{ background: C.warningLight, color: C.warning }}>
                        <Clock size={9} />Scheduled
                      </span>
                    </div>

                    {/* Payroll stats from API */}
                    {payrollData?.latestRun && (
                      <div className="mb-3 p-3 rounded-xl" style={{ background: C.surfaceAlt }}>
                        <p className="text-xs" style={{ color: C.textMuted }}>Last run: <strong style={{ color: C.textPrimary }}>{payrollData.latestRun.period}</strong></p>
                        <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                          Total net: <strong style={{ color: C.success }}>
                            ₦{(Number(payrollData.latestRun.totalNet ?? 0) / 1_000_000).toFixed(1)}M
                          </strong>
                        </p>
                      </div>
                    )}

                    {/* Countdown */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {[{ label: "Days", val: countdown.days }, { label: "Hours", val: countdown.hours },
                        { label: "Mins", val: countdown.mins }, { label: "Secs", val: countdown.secs }].map(({ label, val }) => (
                        <div key={label} className="rounded-xl p-2 text-center" style={{ background: C.surfaceAlt }}>
                          <p className="text-xl font-bold tabular-nums" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>
                            {String(val).padStart(2, "0")}
                          </p>
                          <span className="text-[9px] uppercase tracking-wide mt-0.5" style={{ color: C.textMuted }}>{label}</span>
                        </div>
                      ))}
                    </div>

                    {payrollError && (
                      <p className="text-xs mb-2 text-center" style={{ color: C.danger }}>{payrollError}</p>
                    )}

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleRunPayroll} disabled={runningPayroll || payrollSuccess}
                      className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                      style={{ background: payrollSuccess ? C.success : `linear-gradient(135deg,${C.warning},#D97706)`,
                        color: "#fff", boxShadow: `0 4px 14px ${payrollSuccess ? C.success : C.warning}55`,
                        opacity: runningPayroll ? 0.8 : 1 }}>
                      {runningPayroll ? <><Loader2 size={15} className="animate-spin" />Processing…</>
                        : payrollSuccess ? <><CheckCircle2 size={15} />Payroll Initiated!</>
                        : <><Play size={15} />Run Payroll</>}
                    </motion.button>
                  </div>
                </Card>
              </motion.div>

              {/* Pending approvals */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="lg:col-span-3">
                <Card className="h-full p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: C.dangerLight }}>
                        <ClipboardCheck size={15} color={C.danger} />
                      </div>
                      <span className="font-semibold text-sm" style={{ color: C.textPrimary }}>Pending Approvals</span>
                      {pendingApprovals > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: C.dangerLight, color: C.danger }}>
                          {pendingApprovals} total
                        </span>
                      )}
                    </div>
                    <Link to="/admin/employeemanagement/admin-approvals" className="text-xs font-semibold flex items-center gap-0.5" style={{ color: C.primary }}>
                      View All <ChevronRight size={12} />
                    </Link>
                  </div>

                  {dataLoading ? <Skeleton className="h-32" /> : (
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { type: "leave",   label: "Leave Requests",  icon: Plane,       color: C.primary, count: pendingLeave },
                        { type: "all",     label: "All Approvals",   icon: ClipboardCheck, color: C.warning, count: pendingApprovals },
                        { type: "doc",     label: "Doc Signatures",  icon: ScrollText,  color: C.danger,  count: approvals.filter(a => a.type === "document").length },
                        { type: "profile", label: "Profile Changes", icon: UserCog,     color: C.accent,  count: approvals.filter(a => a.type === "profile_change").length },
                      ].map(ap => (
                        <Link key={ap.type} to="/admin/employeemanagement/admin-approvals">
                          <motion.div whileHover={{ y: -2, borderColor: ap.color + "44" }} transition={{ duration: 0.18 }}
                            className="p-4 rounded-xl cursor-pointer" style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: ap.color + "20" }}>
                                <ap.icon size={15} color={ap.color} />
                              </div>
                            </div>
                            <p className="text-2xl font-bold mb-0.5" style={{ color: ap.color, fontFamily: "Sora,sans-serif" }}>{ap.count}</p>
                            <p className="text-xs font-medium" style={{ color: C.textSecondary }}>{ap.label}</p>
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>

            {/* ── ROW 3: Attendance + New Hires ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

              {/* Attendance */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} className="lg:col-span-2">
                <Card className="p-5 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#ECFEFF" }}>
                        <Clock size={15} color="#06B6D4" />
                      </div>
                      <span className="font-semibold text-sm" style={{ color: C.textPrimary }}>Attendance Today</span>
                    </div>
                    <span className="text-xs" style={{ color: C.textMuted }}>
                      {now_.toLocaleDateString("en-NG", { month:"short", day:"numeric", year:"numeric" })}
                    </span>
                  </div>

                  {dataLoading ? <Skeleton className="h-36" /> : (
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative shrink-0">
                          <DonutChart present={attendPresent} absent={attendAbsent} late={attendLate} total={attendTotal} />
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-bold" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>{attendancePct}%</span>
                            <span className="text-[9px]" style={{ color: C.textMuted }}>present</span>
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          {[{ label: "Present", value: attendPresent, color: C.success },
                            { label: "Absent",  value: attendAbsent,  color: C.danger  },
                            { label: "Late",    value: attendLate,    color: C.warning }].map(({ label, value, color }) => (
                            <div key={label} className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                                <span className="text-xs" style={{ color: C.textSecondary }}>{label}</span>
                              </div>
                              <span className="text-sm font-bold" style={{ color, fontFamily: "Sora,sans-serif" }}>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {lateEmployees.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: C.textMuted }}>Late Arrivals</p>
                          <div className="space-y-1.5">
                            {lateEmployees.slice(0, 3).map((emp, i) => (
                              <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: C.surfaceAlt }}>
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                                  style={{ background: C.warning + "88" }}>
                                  {(emp.first_name?.[0] ?? "") + (emp.last_name?.[0] ?? emp.name?.[0] ?? "?")}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate" style={{ color: C.textPrimary }}>
                                    {emp.first_name ? `${emp.first_name} ${emp.last_name}` : emp.name}
                                  </p>
                                  <p className="text-[10px]" style={{ color: C.textMuted }}>{emp.department_name ?? emp.dept}</p>
                                </div>
                                <span className="text-[10px] font-semibold" style={{ color: C.warning }}>
                                  {emp.clock_in ? new Date(emp.clock_in).toLocaleTimeString("en-NG", { hour:"2-digit", minute:"2-digit" }) : emp.time}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {attendance === null && !dataLoading && (
                        <p className="text-xs text-center py-4" style={{ color: C.textMuted }}>No attendance data available today.</p>
                      )}
                    </>
                  )}
                </Card>
              </motion.div>

              {/* New hires */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5} className="lg:col-span-3">
                <Card className="p-5 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: C.successLight }}>
                        <UserPlus size={15} color={C.success} />
                      </div>
                      <div>
                        <span className="font-semibold text-sm" style={{ color: C.textPrimary }}>New Hires</span>
                        <p className="text-[10px]" style={{ color: C.textMuted }}>
                          {now_.toLocaleDateString("en-NG", { month:"long", year:"numeric" })} · {recentHires.length} employees
                        </p>
                      </div>
                    </div>
                    <Link to="/admin/employeemanagement/admin-employees" className="text-xs font-semibold flex items-center gap-0.5" style={{ color: C.primary }}>
                      View All <ChevronRight size={12} />
                    </Link>
                  </div>

                  {dataLoading ? <Skeleton className="h-40" /> : recentHires.length === 0 ? (
                    <div className="flex flex-col items-center py-10 gap-2">
                      <UserPlus size={32} color={C.textMuted} />
                      <p className="text-sm" style={{ color: C.textMuted }}>No new hires this month.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentHires.map((hire, i) => {
                        const initials = ((hire.first_name?.[0] ?? "") + (hire.last_name?.[0] ?? "")).toUpperCase();
                        const color    = strColor(hire.first_name + hire.last_name);
                        return (
                          <Link to={`/admin/employeemanagement/admin-employees/${hire.id}`} key={hire.id}>
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * i }} whileHover={{ backgroundColor: C.surfaceAlt }}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
                              style={{ background: C.surfaceAlt }}>
                              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                style={{ background: color }}>
                                {initials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate" style={{ color: C.textPrimary }}>
                                  {hire.first_name} {hire.last_name}
                                </p>
                                <p className="text-[11px]" style={{ color: C.textMuted }}>
                                  {hire.job_role_name ?? "—"} · {hire.department_name ?? "—"}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-[10px]" style={{ color: C.textMuted }}>
                                  {hire.created_at ? new Date(hire.created_at).toLocaleDateString("en-NG", { month:"short", day:"numeric" }) : "—"}
                                </p>
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: C.successLight, color: C.success }}>New</span>
                              </div>
                            </motion.div>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {perfData?.averageScore !== undefined && (
                    <div className="mt-4 p-3 rounded-xl flex items-center gap-2"
                      style={{ background: C.primaryLight, border: `1px solid ${C.primary}22` }}>
                      <Target size={13} color={C.primary} />
                      <span className="text-xs" style={{ color: C.primary }}>
                        Company average performance score this period: <strong>{perfData.averageScore}</strong>
                      </span>
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>

            {/* ── ROW 4: Leave Requests + Announcements + Activity ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Pending leave requests */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={6}>
                <Card className="p-5 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: C.primaryLight }}>
                        <Plane size={15} color={C.primary} />
                      </div>
                      <span className="font-semibold text-sm" style={{ color: C.textPrimary }}>Leave Requests</span>
                      {pendingLeave > 0 && (
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: C.dangerLight, color: C.danger }}>
                          {pendingLeave}
                        </span>
                      )}
                    </div>
                    <Link to="/admin/leave-management" className="text-xs font-semibold flex items-center gap-0.5" style={{ color: C.primary }}>
                      Review <ChevronRight size={12} />
                    </Link>
                  </div>

                  {dataLoading ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>
                    : leaveRequests.length === 0 ? (
                      <div className="flex flex-col items-center py-10 gap-2">
                        <CheckCircle2 size={32} color={C.success} />
                        <p className="text-sm" style={{ color: C.textMuted }}>All caught up! 🎉</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {leaveRequests.slice(0, 5).map((req, i) => (
                          <motion.div key={req.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center gap-3 p-3 rounded-xl" style={{ background: C.surfaceAlt }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                              style={{ background: strColor(req.employee_name ?? "") }}>
                              {(req.employee_name ?? "?").split(" ").map(n => n[0]).join("").slice(0,2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold truncate" style={{ color: C.textPrimary }}>{req.employee_name ?? "—"}</p>
                              <p className="text-[10px]" style={{ color: C.textMuted }}>
                                {req.policy_name ?? req.leave_type} · {req.days} day{req.days !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                              style={{ background: C.warningLight, color: C.warning }}>Pending</span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                </Card>
              </motion.div>

              {/* Announcements */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={7}>
                <Card className="p-5 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: C.warningLight }}>
                        <Megaphone size={15} color={C.warning} />
                      </div>
                      <span className="font-semibold text-sm" style={{ color: C.textPrimary }}>Announcements</span>
                    </div>
                    <Link to="/admin/announcements" className="text-xs font-semibold flex items-center gap-0.5" style={{ color: C.primary }}>
                      Manage <ChevronRight size={12} />
                    </Link>
                  </div>

                  {dataLoading ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
                    : announcements.length === 0 ? (
                      <p className="text-sm text-center py-8" style={{ color: C.textMuted }}>No announcements.</p>
                    ) : (
                      <div className="space-y-2">
                        {announcements.slice(0, 4).map((ann, i) => (
                          <div key={ann.id} className="p-3 rounded-xl" style={{ background: C.surfaceAlt }}>
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              {ann.is_pinned && <span className="text-[9px] font-bold" style={{ color: C.warning }}>📌</span>}
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                style={{ background: C.primaryLight, color: C.primary }}>
                                {ann.audience === "all" ? "Company-wide" : ann.department_name ?? "Dept."}
                              </span>
                            </div>
                            <p className="text-xs font-semibold line-clamp-2" style={{ color: C.textPrimary }}>{ann.title}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>
                              {new Date(ann.created_at).toLocaleDateString("en-NG", { month:"short", day:"numeric" })} · {ann.views ?? 0} views
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                </Card>
              </motion.div>

              {/* Activity Feed */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={8}>
                <Card className="p-5 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: C.primaryLight }}>
                        <Activity size={15} color={C.primary} />
                      </div>
                      <span className="font-semibold text-sm" style={{ color: C.textPrimary }}>Activity Feed</span>
                    </div>
                    <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
                      className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.success }} />
                      <span className="text-[10px]" style={{ color: C.success }}>Live</span>
                    </motion.div>
                  </div>

                  {activityFeed.length === 0 && !dataLoading ? (
                    <p className="text-sm text-center py-8" style={{ color: C.textMuted }}>No recent activity.</p>
                  ) : dataLoading ? (
                    <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-10" />)}</div>
                  ) : (
                    <div className="relative space-y-3">
                      <div className="absolute left-3.5 top-0 bottom-0 w-px" style={{ background: C.border }} />
                      {activityFeed.map((item, i) => (
                        <motion.div key={item.id ?? i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.06 * i }}
                          className="flex items-start gap-3 pl-2">
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ delay: 0.06 * i + 0.1, type: "spring" }}
                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10"
                            style={{ background: item.color + "25", border: `1.5px solid ${item.color}` }}>
                            <item.icon size={9} color={item.color} />
                          </motion.div>
                          <div className="flex-1 min-w-0 pb-2.5" style={{ borderBottom: i < activityFeed.length - 1 ? `1px solid ${C.border}` : "none" }}>
                            <p className="text-xs font-medium leading-tight line-clamp-1" style={{ color: C.textPrimary }}>{item.action}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px]" style={{ color: C.textMuted }}>{item.user}</span>
                              <span className="text-[10px]" style={{ color: C.textMuted }}>·</span>
                              <span className="text-[10px]" style={{ color: C.textMuted }}>{item.time}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>

            {/* ── Training + Performance row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Upcoming trainings */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={9}>
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#EDE9FE" }}>
                        <BookOpen size={15} color="#8B5CF6" />
                      </div>
                      <span className="font-semibold text-sm" style={{ color: C.textPrimary }}>Upcoming Trainings</span>
                    </div>
                    <Link to="/admin/training/admin-training" className="text-xs font-semibold flex items-center gap-0.5" style={{ color: C.primary }}>
                      Manage <ChevronRight size={12} />
                    </Link>
                  </div>
                  {dataLoading ? <Skeleton className="h-24" /> : trainings.length === 0 ? (
                    <p className="text-sm text-center py-6" style={{ color: C.textMuted }}>No upcoming trainings.</p>
                  ) : (
                    <div className="space-y-2">
                      {trainings.slice(0, 3).map((t, i) => (
                        <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: C.surfaceAlt }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EDE9FE" }}>
                            <BookOpen size={14} color="#8B5CF6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate" style={{ color: C.textPrimary }}>{t.title}</p>
                            <p className="text-[10px]" style={{ color: C.textMuted }}>
                              {t.start_date ? new Date(t.start_date).toLocaleDateString("en-NG", { month:"short", day:"numeric" }) : "—"}
                              {t.provider ? ` · ${t.provider}` : ""}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                            style={{ background: "#EDE9FE", color: "#8B5CF6" }}>
                            {t.enrolled_count ?? 0} enrolled
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>

              {/* Performance snapshot */}
              <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={10}>
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: C.successLight }}>
                        <TrendingUp size={15} color={C.success} />
                      </div>
                      <span className="font-semibold text-sm" style={{ color: C.textPrimary }}>Performance Snapshot</span>
                    </div>
                    <Link to="/admin/performance/admin-performance" className="text-xs font-semibold flex items-center gap-0.5" style={{ color: C.primary }}>
                      View <ChevronRight size={12} />
                    </Link>
                  </div>
                  {dataLoading ? <Skeleton className="h-24" /> : !perfData ? (
                    <p className="text-sm text-center py-6" style={{ color: C.textMuted }}>No performance data this period.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Avg Score",       value: perfData.averageScore ?? "—",         color: C.primary },
                        { label: "Top Performer",   value: perfData.topPerformer?.name?.split(" ")[0] ?? "—", color: C.success },
                        { label: "Underperformers", value: perfData.underperformerCount ?? 0,    color: C.danger  },
                        { label: "High Performers", value: perfData.highPerformerCount ?? 0,     color: C.warning },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="p-3 rounded-xl" style={{ background: C.surfaceAlt }}>
                          <p className="text-xl font-bold" style={{ color, fontFamily: "Sora,sans-serif" }}>{value}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>{label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>

            <div className="h-4" />
          </main>
        </div>
      </div>

      {/* ── Click outside to close notifications ── */}
      {notifOpen && <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />}
    </div>
  );
}
