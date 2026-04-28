// // src/superadmin/SuperAdminDashboard.jsx
// // Overview — matches all 7 sections from the design image.

// import { useState, useEffect, useCallback } from "react";
// import { Link } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import SuperAdminLayout from "./SuperAdminLayout";
// import { superAdminApi } from "../../api/service/superAdminApi";
// import C from "../styles/colors";
// import {
//   Building2,
//   Users,
//   CreditCard,
//   TrendingUp,
//   TrendingDown,
//   Activity,
//   Server,
//   Database,
//   Mail,
//   Zap,
//   ChevronRight,
//   CheckCircle2,
//   AlertTriangle,
//   XCircle,
//   RefreshCw,
//   Crown,
//   BarChart2,
//   ScrollText,
//   Settings,
//   Shield,
//   ArrowUpRight,
// } from "lucide-react";

// const fadeUp = {
//   hidden: { opacity: 0, y: 18 },
//   visible: (i = 0) => ({
//     opacity: 1,
//     y: 0,
//     transition: { delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
//   }),
// };

// const Skeleton = ({ className = "" }) => (
//   <div
//     className={`rounded-xl animate-pulse ${className}`}
//     style={{ background: "#E8EBF4" }}
//   />
// );

// function Card({ children, className = "", style = {}, hover = true }) {
//   return (
//     <motion.div
//       whileHover={
//         hover ? { y: -2, boxShadow: "0 12px 40px rgba(79,70,229,0.10)" } : {}
//       }
//       transition={{ duration: 0.2 }}
//       className={`rounded-2xl bg-white border shadow-sm ${className}`}
//       style={{ borderColor: C.border, ...style }}
//     >
//       {children}
//     </motion.div>
//   );
// }

// function StatCard({ label, value, sub, icon: Icon, color, bg, trend }) {
//   return (
//     <Card className="p-5">
//       <div className="flex items-start justify-between mb-3">
//         <div
//           className="w-10 h-10 rounded-xl flex items-center justify-center"
//           style={{ background: bg }}
//         >
//           <Icon size={18} color={color} />
//         </div>
//         {trend !== undefined && (
//           <span
//             className="flex items-center gap-1 text-[11px] font-semibold"
//             style={{ color: trend >= 0 ? C.success : C.danger }}
//           >
//             {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
//             {Math.abs(trend)}%
//           </span>
//         )}
//       </div>
//       <p
//         className="text-2xl font-black mb-0.5"
//         style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
//       >
//         {value}
//       </p>
//       <p className="text-xs font-semibold" style={{ color }}>
//         {label}
//       </p>
//       {sub && (
//         <p className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>
//           {sub}
//         </p>
//       )}
//     </Card>
//   );
// }

// function StatusBadge({ status }) {
//   const map = {
//     active: { bg: C.successLight, color: C.success, label: "Active" },
//     pending: { bg: C.warningLight, color: C.warning, label: "Pending" },
//     suspended: { bg: C.dangerLight, color: C.danger, label: "Suspended" },
//     disabled: { bg: C.surfaceAlt, color: C.textMuted, label: "Disabled" },
//     paid: { bg: C.successLight, color: C.success, label: "Paid" },
//   };
//   const s = map[status?.toLowerCase()] ?? map.pending;
//   return (
//     <span
//       className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full"
//       style={{ background: s.bg, color: s.color }}
//     >
//       {s.label}
//     </span>
//   );
// }

// export default function SuperAdminDashboard() {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");

//   const loadData = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await superAdminApi.getDashboard();
//       setData(res.data ?? res);
//     } catch {
//       /* show skeleton */
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadData();
//   }, [loadData]);

//   const d = data ?? {};
//   const companies = d.recentCompanies ?? [];
//   const users = d.recentUsers ?? [];
//   const subscriptions = d.recentPayments ?? [];
//   const auditLogs = d.recentAuditLogs ?? [];
//   const systemHealth = d.systemHealth ?? [];
//   const analytics = d.analytics ?? {};

//   return (
//     <SuperAdminLayout
//       title="Dashboard"
//       subtitle="Platform overview"
//       loading={loading}
//       searchQuery={search}
//       setSearchQuery={setSearch}
//       onRefresh={loadData}
//     >
//       <div className="px-5 md:px-7 py-6 space-y-6">
//         {/* ── Hero banner ── */}
//         <motion.div
//           variants={fadeUp}
//           initial="hidden"
//           animate="visible"
//           custom={0}
//           className="relative rounded-2xl overflow-hidden p-7 text-white"
//           style={{
//             background:
//               "linear-gradient(135deg,#0F0C29 0%,#302B63 50%,#24243E 100%)",
//           }}
//         >
//           <div className="absolute inset-0 overflow-hidden pointer-events-none">
//             <div
//               className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10"
//               style={{
//                 background: "radial-gradient(circle,#818CF8,transparent)",
//               }}
//             />
//           </div>
//           <div className="relative flex flex-col md:flex-row md:items-center gap-5">
//             <div className="flex items-center gap-4 flex-1">
//               <div
//                 className="w-14 h-14 rounded-2xl flex items-center justify-center"
//                 style={{ background: "rgba(255,255,255,0.12)" }}
//               >
//                 <Crown size={26} color="#fff" />
//               </div>
//               <div>
//                 <p className="text-purple-200 text-sm font-medium mb-0.5">
//                   Welcome back, Super Admin
//                 </p>
//                 <h1
//                   className="text-2xl md:text-3xl font-bold"
//                   style={{ fontFamily: "Sora,sans-serif" }}
//                 >
//                   HRIS Cloud Platform
//                 </h1>
//                 <p className="text-purple-300 text-sm mt-0.5">
//                   Platform owner dashboard — manage the entire SaaS across all
//                   companies.
//                 </p>
//               </div>
//             </div>
//             <div className="flex gap-3 flex-wrap">
//               {[
//                 {
//                   label: "Companies",
//                   value: loading ? "—" : (d.totalCompanies ?? 0),
//                   color: "#A5B4FC",
//                 },
//                 {
//                   label: "Total Users",
//                   value: loading ? "—" : (d.totalUsers ?? 0),
//                   color: "#A5F3FC",
//                 },
//                 {
//                   label: "Revenue MRR",
//                   value: loading
//                     ? "—"
//                     : `₦${((d.mrr ?? 0) / 1_000_000).toFixed(1)}M`,
//                   color: "#BBF7D0",
//                 },
//               ].map(({ label, value, color }) => (
//                 <div
//                   key={label}
//                   className="px-4 py-2.5 rounded-xl"
//                   style={{ background: "rgba(255,255,255,0.10)" }}
//                 >
//                   <p
//                     className="text-2xl font-bold"
//                     style={{ color, fontFamily: "Sora,sans-serif" }}
//                   >
//                     {value}
//                   </p>
//                   <p className="text-[11px] text-white/60">{label}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </motion.div>

//         {/* ── KPI Cards ── */}
//         {loading ? (
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//             {[1, 2, 3, 4].map((i) => (
//               <Card key={i} className="p-5">
//                 <Skeleton className="h-24" />
//               </Card>
//             ))}
//           </div>
//         ) : (
//           <motion.div
//             variants={fadeUp}
//             initial="hidden"
//             animate="visible"
//             custom={1}
//             className="grid grid-cols-2 lg:grid-cols-4 gap-4"
//           >
//             {[
//               {
//                 label: "Total Companies",
//                 value: d.totalCompanies ?? 0,
//                 icon: Building2,
//                 color: C.primary,
//                 bg: C.primaryLight,
//                 sub: `${d.activeCompanies ?? 0} active`,
//                 trend: d.companiesGrowth,
//               },
//               {
//                 label: "Active Companies",
//                 value: d.activeCompanies ?? 0,
//                 icon: CheckCircle2,
//                 color: C.success,
//                 bg: C.successLight,
//                 sub: `${d.pendingCompanies ?? 0} pending`,
//               },
//               {
//                 label: "Pending Approval",
//                 value: d.pendingCompanies ?? 0,
//                 icon: AlertTriangle,
//                 color: C.warning,
//                 bg: C.warningLight,
//                 sub: "Awaiting review",
//               },
//               {
//                 label: "Suspended",
//                 value: d.suspendedCompanies ?? 0,
//                 icon: XCircle,
//                 color: C.danger,
//                 bg: C.dangerLight,
//                 sub: "Inactive accounts",
//               },
//             ].map((s, i) => (
//               <motion.div
//                 key={s.label}
//                 custom={i + 1}
//                 variants={fadeUp}
//                 initial="hidden"
//                 animate="visible"
//               >
//                 <StatCard {...s} />
//               </motion.div>
//             ))}
//           </motion.div>
//         )}

//         {/* ── Row 2: Companies + Users ── */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//           {/* Recent Companies */}
//           <motion.div
//             variants={fadeUp}
//             initial="hidden"
//             animate="visible"
//             custom={2}
//           >
//             <Card className="overflow-hidden h-full">
//               <div
//                 className="px-5 py-4 flex items-center justify-between"
//                 style={{ borderBottom: `1px solid ${C.border}` }}
//               >
//                 <div className="flex items-center gap-2">
//                   <div
//                     className="w-8 h-8 rounded-xl flex items-center justify-center"
//                     style={{ background: C.primaryLight }}
//                   >
//                     <Building2 size={15} color={C.primary} />
//                   </div>
//                   <p
//                     className="font-bold text-sm"
//                     style={{ color: C.textPrimary }}
//                   >
//                     Companies
//                   </p>
//                 </div>
//                 <Link
//                   to="/super-admin/companies"
//                   className="text-xs font-semibold flex items-center gap-0.5"
//                   style={{ color: C.primary }}
//                 >
//                   View All <ChevronRight size={12} />
//                 </Link>
//               </div>
//               {loading ? (
//                 <div className="p-4 space-y-3">
//                   {[1, 2, 3, 4].map((i) => (
//                     <Skeleton key={i} className="h-10" />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table
//                     className="w-full"
//                     style={{ borderCollapse: "collapse" }}
//                   >
//                     <thead>
//                       <tr
//                         style={{
//                           background: C.surfaceAlt,
//                           borderBottom: `1px solid ${C.border}`,
//                         }}
//                       >
//                         {["Company", "Plan", "Status", "Users", "Actions"].map(
//                           (h) => (
//                             <th
//                               key={h}
//                               className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider"
//                               style={{ color: C.textMuted }}
//                             >
//                               {h}
//                             </th>
//                           ),
//                         )}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {companies.slice(0, 5).map((co, i) => (
//                         <tr
//                           key={co.id}
//                           style={{ borderBottom: `1px solid ${C.border}` }}
//                         >
//                           <td className="px-4 py-2.5">
//                             <p
//                               className="text-xs font-semibold"
//                               style={{ color: C.textPrimary }}
//                             >
//                               {co.name}
//                             </p>
//                             <p
//                               className="text-[10px]"
//                               style={{ color: C.textMuted }}
//                             >
//                               {co.slug}
//                             </p>
//                           </td>
//                           <td className="px-4 py-2.5">
//                             <span
//                               className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
//                               style={{
//                                 background: C.primaryLight,
//                                 color: C.primary,
//                               }}
//                             >
//                               {co.plan ?? "Free"}
//                             </span>
//                           </td>
//                           <td className="px-4 py-2.5">
//                             <StatusBadge status={co.status} />
//                           </td>
//                           <td
//                             className="px-4 py-2.5 text-xs font-medium"
//                             style={{ color: C.textPrimary }}
//                           >
//                             {co.user_count ?? 0}
//                           </td>
//                           <td className="px-4 py-2.5">
//                             <Link
//                               to={`/super-admin/companies`}
//                               className="text-[10px] font-semibold px-2 py-1 rounded-lg"
//                               style={{
//                                 background: C.primaryLight,
//                                 color: C.primary,
//                               }}
//                             >
//                               View
//                             </Link>
//                           </td>
//                         </tr>
//                       ))}
//                       {companies.length === 0 && (
//                         <tr>
//                           <td
//                             colSpan={5}
//                             className="px-4 py-8 text-center text-xs"
//                             style={{ color: C.textMuted }}
//                           >
//                             No companies yet
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </Card>
//           </motion.div>

//           {/* Global Users */}
//           <motion.div
//             variants={fadeUp}
//             initial="hidden"
//             animate="visible"
//             custom={3}
//           >
//             <Card className="overflow-hidden h-full">
//               <div
//                 className="px-5 py-4 flex items-center justify-between"
//                 style={{ borderBottom: `1px solid ${C.border}` }}
//               >
//                 <div className="flex items-center gap-2">
//                   <div
//                     className="w-8 h-8 rounded-xl flex items-center justify-center"
//                     style={{ background: "#ECFEFF" }}
//                   >
//                     <Users size={15} color="#06B6D4" />
//                   </div>
//                   <p
//                     className="font-bold text-sm"
//                     style={{ color: C.textPrimary }}
//                   >
//                     All Users
//                   </p>
//                 </div>
//                 <Link
//                   to="/super-admin/users"
//                   className="text-xs font-semibold flex items-center gap-0.5"
//                   style={{ color: C.primary }}
//                 >
//                   View All <ChevronRight size={12} />
//                 </Link>
//               </div>
//               {loading ? (
//                 <div className="p-4 space-y-3">
//                   {[1, 2, 3, 4].map((i) => (
//                     <Skeleton key={i} className="h-10" />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table
//                     className="w-full"
//                     style={{ borderCollapse: "collapse" }}
//                   >
//                     <thead>
//                       <tr
//                         style={{
//                           background: C.surfaceAlt,
//                           borderBottom: `1px solid ${C.border}`,
//                         }}
//                       >
//                         {["User", "Company", "Role", "Status", "Actions"].map(
//                           (h) => (
//                             <th
//                               key={h}
//                               className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider"
//                               style={{ color: C.textMuted }}
//                             >
//                               {h}
//                             </th>
//                           ),
//                         )}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {users.slice(0, 5).map((u) => (
//                         <tr
//                           key={u.id}
//                           style={{ borderBottom: `1px solid ${C.border}` }}
//                         >
//                           <td className="px-4 py-2.5">
//                             <p
//                               className="text-xs font-semibold"
//                               style={{ color: C.textPrimary }}
//                             >
//                               {u.name ??
//                                 `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim()}
//                             </p>
//                             <p
//                               className="text-[10px]"
//                               style={{ color: C.textMuted }}
//                             >
//                               {u.email}
//                             </p>
//                           </td>
//                           <td
//                             className="px-4 py-2.5 text-xs"
//                             style={{ color: C.textSecondary }}
//                           >
//                             {u.company_name ?? "—"}
//                           </td>
//                           <td className="px-4 py-2.5">
//                             <span
//                               className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
//                               style={{
//                                 background: C.primaryLight,
//                                 color: C.primary,
//                               }}
//                             >
//                               {(u.role ?? "employee").replace(/_/g, " ")}
//                             </span>
//                           </td>
//                           <td className="px-4 py-2.5">
//                             <StatusBadge status={u.status ?? "active"} />
//                           </td>
//                           <td
//                             className="px-4 py-2.5 text-[10px] font-semibold"
//                             style={{ color: C.primary }}
//                           >
//                             Manage
//                           </td>
//                         </tr>
//                       ))}
//                       {users.length === 0 && (
//                         <tr>
//                           <td
//                             colSpan={5}
//                             className="px-4 py-8 text-center text-xs"
//                             style={{ color: C.textMuted }}
//                           >
//                             No users found
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </Card>
//           </motion.div>
//         </div>

//         {/* ── Row 3: Analytics + Config + Audit ── */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
//           {/* Analytics mini */}
//           <motion.div
//             variants={fadeUp}
//             initial="hidden"
//             animate="visible"
//             custom={4}
//           >
//             <Card className="p-5 h-full">
//               <div className="flex items-center gap-2 mb-4">
//                 <div
//                   className="w-8 h-8 rounded-xl flex items-center justify-center"
//                   style={{ background: "#FEF3C7" }}
//                 >
//                   <BarChart2 size={15} color={C.warning} />
//                 </div>
//                 <p
//                   className="font-bold text-sm"
//                   style={{ color: C.textPrimary }}
//                 >
//                   System Analytics
//                 </p>
//               </div>
//               {loading ? (
//                 <Skeleton className="h-36" />
//               ) : (
//                 <div className="space-y-3">
//                   {[
//                     {
//                       label: "Total Users",
//                       value: d.totalUsers ?? 0,
//                       color: C.primary,
//                     },
//                     {
//                       label: "Total Companies",
//                       value: d.totalCompanies ?? 0,
//                       color: "#06B6D4",
//                     },
//                     {
//                       label: "Active Users",
//                       value: d.activeUsers ?? 0,
//                       color: C.success,
//                     },
//                     {
//                       label: "MRR Revenue",
//                       value: `₦${((d.mrr ?? 0) / 1e6).toFixed(1)}M`,
//                       color: C.warning,
//                     },
//                   ].map(({ label, value, color }) => (
//                     <div
//                       key={label}
//                       className="flex items-center justify-between p-2.5 rounded-xl"
//                       style={{ background: C.surfaceAlt }}
//                     >
//                       <span
//                         className="text-xs"
//                         style={{ color: C.textSecondary }}
//                       >
//                         {label}
//                       </span>
//                       <span className="text-sm font-bold" style={{ color }}>
//                         {value}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//               <Link to="/super-admin/analytics">
//                 <button
//                   className="mt-4 w-full py-2 rounded-xl text-xs font-semibold"
//                   style={{ background: C.primaryLight, color: C.primary }}
//                 >
//                   Full Analytics →
//                 </button>
//               </Link>
//             </Card>
//           </motion.div>

//           {/* Configuration */}
//           <motion.div
//             variants={fadeUp}
//             initial="hidden"
//             animate="visible"
//             custom={5}
//           >
//             <Card className="p-5 h-full">
//               <div className="flex items-center gap-2 mb-4">
//                 <div
//                   className="w-8 h-8 rounded-xl flex items-center justify-center"
//                   style={{ background: "#EDE9FE" }}
//                 >
//                   <Settings size={15} color="#8B5CF6" />
//                 </div>
//                 <p
//                   className="font-bold text-sm"
//                   style={{ color: C.textPrimary }}
//                 >
//                   Platform Config
//                 </p>
//               </div>
//               <div className="space-y-2">
//                 {[
//                   { label: "Attendance Module", enabled: true },
//                   { label: "Leave Module", enabled: true },
//                   { label: "Payroll Module", enabled: true },
//                   { label: "Chat Module", enabled: true },
//                   { label: "Performance Module", enabled: false },
//                   { label: "API Access", enabled: false },
//                 ].map(({ label, enabled }) => (
//                   <div
//                     key={label}
//                     className="flex items-center justify-between px-3 py-2 rounded-xl"
//                     style={{ background: C.surfaceAlt }}
//                   >
//                     <span
//                       className="text-xs"
//                       style={{ color: C.textSecondary }}
//                     >
//                       {label}
//                     </span>
//                     <div
//                       className="w-9 h-5 rounded-full flex items-center transition-all"
//                       style={{
//                         background: enabled ? C.primary : C.border,
//                         padding: "2px",
//                       }}
//                     >
//                       <div
//                         className="w-4 h-4 rounded-full bg-white transition-all"
//                         style={{ marginLeft: enabled ? "auto" : 0 }}
//                       />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <Link to="/super-admin/configuration">
//                 <button
//                   className="mt-4 w-full py-2 rounded-xl text-xs font-semibold"
//                   style={{ background: "#EDE9FE", color: "#8B5CF6" }}
//                 >
//                   Manage Config →
//                 </button>
//               </Link>
//             </Card>
//           </motion.div>

//           {/* Audit Logs */}
//           <motion.div
//             variants={fadeUp}
//             initial="hidden"
//             animate="visible"
//             custom={6}
//           >
//             <Card className="p-5 h-full">
//               <div className="flex items-center gap-2 mb-4">
//                 <div
//                   className="w-8 h-8 rounded-xl flex items-center justify-center"
//                   style={{ background: C.successLight }}
//                 >
//                   <ScrollText size={15} color={C.success} />
//                 </div>
//                 <p
//                   className="font-bold text-sm"
//                   style={{ color: C.textPrimary }}
//                 >
//                   Audit Logs
//                 </p>
//               </div>
//               {loading ? (
//                 <div className="space-y-2">
//                   {[1, 2, 3, 4].map((i) => (
//                     <Skeleton key={i} className="h-10" />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="space-y-2">
//                   {auditLogs.slice(0, 5).map((log, i) => (
//                     <div
//                       key={log.id ?? i}
//                       className="p-2.5 rounded-xl"
//                       style={{ background: C.surfaceAlt }}
//                     >
//                       <div className="flex items-center gap-1.5 mb-0.5">
//                         <span
//                           className="text-[10px] font-bold"
//                           style={{ color: C.primary }}
//                         >
//                           {log.actor ?? "Super Admin"}
//                         </span>
//                         <span
//                           className="text-[10px]"
//                           style={{ color: C.textMuted }}
//                         >
//                           · {log.action}
//                         </span>
//                       </div>
//                       <p
//                         className="text-[10px]"
//                         style={{ color: C.textSecondary }}
//                       >
//                         {log.details}
//                       </p>
//                     </div>
//                   ))}
//                   {auditLogs.length === 0 && (
//                     <p
//                       className="text-xs text-center py-4"
//                       style={{ color: C.textMuted }}
//                     >
//                       No logs yet
//                     </p>
//                   )}
//                 </div>
//               )}
//               <Link to="/super-admin/audit-logs">
//                 <button
//                   className="mt-4 w-full py-2 rounded-xl text-xs font-semibold"
//                   style={{ background: C.successLight, color: C.success }}
//                 >
//                   View All Logs →
//                 </button>
//               </Link>
//             </Card>
//           </motion.div>
//         </div>

//         {/* ── Row 4: System Monitoring ── */}
//         <motion.div
//           variants={fadeUp}
//           initial="hidden"
//           animate="visible"
//           custom={7}
//         >
//           <Card className="p-5">
//             <div className="flex items-center gap-2 mb-5">
//               <div
//                 className="w-8 h-8 rounded-xl flex items-center justify-center"
//                 style={{ background: "#ECFEFF" }}
//               >
//                 <Activity size={15} color="#06B6D4" />
//               </div>
//               <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
//                 System Monitoring
//               </p>
//               <Link
//                 to="/super-admin/system-monitoring"
//                 className="ml-auto text-xs font-semibold flex items-center gap-0.5"
//                 style={{ color: C.primary }}
//               >
//                 Details <ChevronRight size={12} />
//               </Link>
//             </div>
//             {loading ? (
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <Skeleton className="h-20" />
//                 <Skeleton className="h-20" />
//                 <Skeleton className="h-20" />
//                 <Skeleton className="h-20" />
//               </div>
//             ) : (
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 {[
//                   {
//                     label: "API Server",
//                     status: "Operational",
//                     icon: Zap,
//                     color: C.success,
//                   },
//                   {
//                     label: "Database",
//                     status: "Operational",
//                     icon: Database,
//                     color: C.success,
//                   },
//                   {
//                     label: "Email Service",
//                     status: "Operational",
//                     icon: Mail,
//                     color: C.success,
//                   },
//                   {
//                     label: "Storage",
//                     status: "Operational",
//                     icon: Server,
//                     color: C.success,
//                   },
//                 ].map(({ label, status, icon: Icon, color }) => (
//                   <div
//                     key={label}
//                     className="flex items-center gap-3 p-3.5 rounded-xl"
//                     style={{
//                       background: C.surfaceAlt,
//                       border: `1px solid ${C.border}`,
//                     }}
//                   >
//                     <div
//                       className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
//                       style={{ background: C.successLight }}
//                     >
//                       <Icon size={16} color={color} />
//                     </div>
//                     <div>
//                       <p
//                         className="text-xs font-semibold"
//                         style={{ color: C.textPrimary }}
//                       >
//                         {label}
//                       </p>
//                       <p
//                         className="text-[10px] font-semibold"
//                         style={{ color }}
//                       >
//                         {status}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </Card>
//         </motion.div>

//         <div className="h-4" />
//       </div>
//     </SuperAdminLayout>
//   );
// }

// src/superadmin/SuperAdminDashboard.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SuperAdminLayout from "./SuperAdminLayout";
import {
  getAnalyticsApi,
  getAllCompaniesApi,
  getAllUsersApi,
  getAuditLogsApi,
  getSystemHealthApi,
  getPlatformSettingsApi,
} from "../api/service/superAdminApi";
import C from "../styles/colors";
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Activity,
  Server,
  Database,
  Mail,
  Zap,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Crown,
  BarChart2,
  ScrollText,
  Settings,
  Shield,
  ArrowUpRight,
  Globe,
  Clock,
  Briefcase,
  FileText,
  Lock,
} from "lucide-react";

// ── Animation Variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};
// const didRun = useRef(false);


// useEffect(() => {
//   if (didRun.current) return;
//   didRun.current = true;

//   loadData();
// }, []);
// ── Sub-components ──────────────────────────────────────────────────────────
const Skeleton = ({ className = "" }) => (
  <div
    className={`rounded-xl animate-pulse ${className}`}
    style={{ background: "#E8EBF4" }}
  />
);

function Card({ children, className = "", style = {}, hover = true }) {
  return (
    <motion.div
      whileHover={
        hover ? { y: -3, boxShadow: "0 15px 45px rgba(15,12,41,0.08)" } : {}
      }
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`rounded-2xl bg-white border shadow-sm ${className}`}
      style={{ borderColor: C.border, ...style }}
    >
      {children}
    </motion.div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color, bg, trend }) {
  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
            style={{ background: bg }}
          >
            <Icon size={22} color={color} />
          </div>
          {trend !== undefined && (
            <div
              className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg"
              style={{
                background: trend >= 0 ? C.successLight : C.dangerLight,
                color: trend >= 0 ? C.success : C.danger,
              }}
            >
              {trend >= 0 ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p
          className="text-3xl font-black mb-1 tracking-tight"
          style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
        >
          {value}
        </p>
        <p
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: C.textMuted }}
        >
          {label}
        </p>
        {sub && (
          <p
            className="text-[11px] mt-2 font-medium flex items-center gap-1.5"
            style={{ color: C.textSecondary }}
          >
            <Clock size={10} /> {sub}
          </p>
        )}
      </div>
      <div className="absolute -bottom-6 -right-6 opacity-[0.03] rotate-12">
        <Icon size={100} color={color} />
      </div>
    </Card>
  );
}

function StatusBadge({ status }) {
  const map = {
    active: { bg: C.successLight, color: C.success, label: "Active" },
    pending: { bg: C.warningLight, color: C.warning, label: "Pending" },
    suspended: { bg: C.dangerLight, color: C.danger, label: "Suspended" },
    disabled: { bg: C.surfaceAlt, color: C.textMuted, label: "Disabled" },
    paid: { bg: C.successLight, color: C.success, label: "Paid" },
  };
  const s = map[status?.toLowerCase()] ?? map.pending;
  return (
    <span
      className="inline-flex items-center text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter"
      style={{ background: s.bg, color: s.color }}
    >
      <span
        className="w-1 h-1 rounded-full mr-1.5"
        style={{ background: s.color }}
      />
      {s.label}
    </span>
  );
}

// ── Main Dashboard Component ───────────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({});
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [config, setConfig] = useState([]);

  //   const loadData = useCallback(async () => {
  //     setLoading(true);
  //     console.log("📊 analytics:", analyticsRes.data);
  //     console.log("🏢 companies:", companiesRes.data);
  //     console.log("👤 users:", usersRes.data);
  //     console.log("📜 logs:", auditRes.data);
  //     console.log("⚙️ settings:", settingsRes.data);
  //     try {
  //       const [
  //         analyticsRes,
  //         companiesRes,
  //         usersRes,
  //         auditRes,
  //         healthRes,
  //         settingsRes,
  //       ] = await Promise.all([
  //         getAnalyticsApi(),
  //         getAllCompaniesApi({ limit: 5 }),
  //         getAllUsersApi({ limit: 5 }),
  //         getAuditLogsApi({ limit: 5 }),
  //         getSystemHealthApi(),
  //         getPlatformSettingsApi(),
  //       ]);

  //       //   setStats(analyticsRes.data || {});
  //       //   setCompanies(companiesRes.data?.companies || []);
  //       //   setUsers(usersRes.data?.users || []);
  //       //   setAuditLogs(auditRes.data?.logs || []);
  //       //   setSystemHealth(healthRes.data || {});
  //       setStats(analyticsRes.data?.data || {});
  //       setCompanies(companiesRes.data?.data?.companies || []);
  //       setUsers(usersRes.data?.data?.users || []);
  //       setAuditLogs(auditRes.data?.data?.logs || []);
  //       setSystemHealth(healthRes.data?.data || {});

  //       // Mocking config based on platform settings response if needed
  //       const platformModules = settingsRes.data?.modules || [
  //         { label: "Attendance Module", enabled: true },
  //         { label: "Leave Module", enabled: true },
  //         { label: "Payroll Module", enabled: true },
  //         { label: "Chat Module", enabled: true },
  //         { label: "Performance Module", enabled: false },
  //         { label: "API Access", enabled: false },
  //       ];
  //       setConfig(platformModules);
  //     } catch (err) {
  //       console.error("Dashboard data load failed", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }, []);
  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      console.log("🚀 Loading dashboard step-by-step...");

      // 1. Analytics (core stats)
      const analyticsRes = await getAnalyticsApi();
      console.log("📊 analytics:", analyticsRes.data);
      setStats(analyticsRes.data?.data || analyticsRes.data || {});

      // 2. Companies
      const companiesRes = await getAllCompaniesApi({ limit: 5 });
      console.log("🏢 companies:", companiesRes.data);
      setCompanies(
        companiesRes.data?.companies ||
          companiesRes.data?.data?.companies ||
          [],
      );

      // 3. Users
      const usersRes = await getAllUsersApi({ limit: 5 });
      console.log("👤 users:", usersRes.data);
      setUsers(usersRes.data?.users || usersRes.data?.data?.users || []);

      // 4. Audit logs
      const auditRes = await getAuditLogsApi({ limit: 5 });
      setAuditLogs(auditRes.data?.logs || auditRes.data?.data?.logs || []);

      // 5. System health (can fail safely)
      try {
        const healthRes = await getSystemHealthApi();
        setSystemHealth(healthRes.data?.data || healthRes.data || {});
      } catch (err) {
        console.warn("⚠️ System health failed (non-blocking)");
        setSystemHealth({});
      }

      // 6. Settings (fallback safe)
      try {
        const settingsRes = await getPlatformSettingsApi();
        const modules =
          settingsRes.data?.modules || settingsRes.data?.data?.modules || [];

        setConfig(
          modules.length
            ? modules
            : [
                { label: "Attendance Module", enabled: true },
                { label: "Leave Module", enabled: true },
                { label: "Payroll Module", enabled: true },
              ],
        );
      } catch (err) {
        console.warn("⚠️ Settings failed (using defaults)");
        setConfig([]);
      }
    } catch (err) {
      console.error("❌ Dashboard load failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <SuperAdminLayout
      title="Dashboard"
      subtitle="Platform overview"
      loading={loading}
      searchQuery={search}
      setSearchQuery={setSearch}
      onRefresh={loadData}
      showHeader={false}
    >
      <div className="px-5 md:px-8 py-8 space-y-8">
        {/* ── Section 1: Hero Banner ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="relative rounded-3xl overflow-hidden p-8 md:p-10 text-white shadow-2xl"
          style={{
            background:
              "linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)",
          }}
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute -top-32 -right-32 w-96 h-96 rounded-full"
              style={{
                background: "radial-gradient(circle, #818CF8, transparent)",
              }}
            />
            <div className="absolute top-1/2 left-1/4 w-px h-64 bg-gradient-to-b from-transparent via-white/10 to-transparent rotate-45" />
          </div>

          <div className="relative flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="flex items-center gap-6 flex-1">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Crown size={38} color="#fff" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 text-[10px] font-bold uppercase tracking-widest border border-indigo-400/20">
                    System Master
                  </span>
                  <p className="text-purple-200/80 text-xs font-semibold">
                    Verified Administrator
                  </p>
                </div>
                <h1
                  className="text-3xl md:text-4xl font-black tracking-tight"
                  style={{ fontFamily: "Sora, sans-serif" }}
                >
                  BantaHR Management
                </h1>
                <p className="text-purple-200/60 text-sm max-w-md font-medium leading-relaxed">
                  Platform owner console. You are currently overseeing{" "}
                  {stats.totalCompanies || 0} organizations and{" "}
                  {stats.totalUsers || 0} active users.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-6">
              {[
                {
                  label: "Growth",
                  value: loading ? "—" : `+${stats.companiesGrowth || 0}%`,
                  color: "#A5B4FC",
                  icon: TrendingUp,
                },
                {
                  label: "Platform Revenue",
                  value: loading
                    ? "—"
                    : `₦${((stats.mrr ?? 0) / 1_000_000).toFixed(1)}M`,
                  color: "#BBF7D0",
                  icon: CreditCard,
                },
                {
                  label: "Health Index",
                  value: "99.9%",
                  color: "#A5F3FC",
                  icon: Activity,
                },
              ].map(({ label, value, color, icon: Icon }) => (
                <div
                  key={label}
                  className="px-5 py-4 rounded-2xl border border-white/5 transition-colors hover:bg-white/5"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={14} color={color} />
                    <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">
                      {label}
                    </p>
                  </div>
                  <p
                    className="text-xl md:text-2xl font-bold"
                    style={{ color, fontFamily: "Sora, sans-serif" }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Section 2: KPIs ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-32" />
              </Card>
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {[
              {
                label: "Registered Companies",
                value: stats.totalCompanies ?? 0,
                icon: Building2,
                color: C.primary,
                bg: C.primaryLight,
                sub: `${stats.activeCompanies ?? 0} active accounts`,
                trend: stats.companiesGrowth,
              },
              {
                label: "System Wide Users",
                value: stats.totalUsers ?? 0,
                icon: Users,
                color: "#06B6D4",
                bg: "#ECFEFF",
                sub: `${stats.activeUsers ?? 0} users online`,
                trend: 14,
              },
              {
                label: "Approval Queue",
                value: stats.pendingCompanies ?? 0,
                icon: AlertTriangle,
                color: C.warning,
                bg: C.warningLight,
                sub: "Requires manual review",
              },
              {
                label: "Revoked Access",
                value: stats.suspendedCompanies ?? 0,
                icon: XCircle,
                color: C.danger,
                bg: C.dangerLight,
                sub: "Security/Payment blocks",
              },
            ].map((s, i) => (
              <motion.div key={s.label} variants={fadeUp} custom={i}>
                <StatCard {...s} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── Section 3: Data Lists ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Companies Table */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            <Card className="h-full overflow-hidden border-none shadow-xl">
              <div
                className="px-6 py-5 flex items-center justify-between"
                style={{ borderBottom: `1px solid ${C.border}` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: C.primaryLight }}
                  >
                    <Building2 size={20} color={C.primary} />
                  </div>
                  <div>
                    <p
                      className="font-black text-sm uppercase tracking-tight"
                      style={{ color: C.textPrimary }}
                    >
                      Companies
                    </p>
                    <p className="text-[10px] font-bold text-slate-400">
                      Newly onboarded organizations
                    </p>
                  </div>
                </div>
                <Link
                  to="/super-admin/companies"
                  className="p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight size={20} color={C.textMuted} />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr style={{ background: C.surfaceAlt }}>
                      {["Organization", "Subscription", "Status", "Action"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading
                      ? [1, 2, 3, 4, 5].map((i) => (
                          <tr key={i}>
                            <td colSpan={4} className="px-6 py-4">
                              <Skeleton className="h-10" />
                            </td>
                          </tr>
                        ))
                      : companies.map((co) => (
                          <tr
                            key={co.id}
                            className="hover:bg-slate-50/50 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                  {co.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-800">
                                    {co.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-medium">
                                    {co.slug}.hris.cloud
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Crown size={12} className="text-amber-400" />
                                <span className="text-[11px] font-black text-slate-600 uppercase">
                                  {co.plan || "Startup"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={co.status} />
                            </td>
                            <td className="px-6 py-4">
                              <Link to={`/super-admin/companies`}>
                                <div className="w-8 h-8 rounded-lg border flex items-center justify-center group-hover:border-indigo-200 group-hover:bg-white transition-all">
                                  <ArrowUpRight
                                    size={14}
                                    className="text-slate-300 group-hover:text-indigo-600"
                                  />
                                </div>
                              </Link>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
                {companies.length === 0 && !loading && (
                  <div className="py-20 text-center space-y-3">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                      <Building2 size={30} />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      No companies found
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Users Table */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            <Card className="h-full overflow-hidden border-none shadow-xl">
              <div
                className="px-6 py-5 flex items-center justify-between"
                style={{ borderBottom: `1px solid ${C.border}` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: "#ECFEFF" }}
                  >
                    <Users size={20} color="#06B6D4" />
                  </div>
                  <div>
                    <p
                      className="font-black text-sm uppercase tracking-tight"
                      style={{ color: C.textPrimary }}
                    >
                      Platform Users
                    </p>
                    <p className="text-[10px] font-bold text-slate-400">
                      Global account distribution
                    </p>
                  </div>
                </div>
                <Link
                  to="/super-admin/users"
                  className="p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight size={20} color={C.textMuted} />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr style={{ background: C.surfaceAlt }}>
                      {["User Identity", "Role", "Last Active", "Access"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading
                      ? [1, 2, 3, 4, 5].map((i) => (
                          <tr key={i}>
                            <td colSpan={4} className="px-6 py-4">
                              <Skeleton className="h-10" />
                            </td>
                          </tr>
                        ))
                      : users.map((u) => (
                          <tr
                            key={u.id}
                            className="hover:bg-slate-50/50 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white text-[10px] font-black uppercase ring-2 ring-slate-100">
                                  {(u.first_name || "U")[0]}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-800">
                                    {u.first_name} {u.last_name}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-medium lowercase italic">
                                    {u.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                                  {u.role?.replace(/_/g, " ") || "EMPLOYEE"}
                                </span>
                                <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">
                                  {u.company_name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Clock size={12} />
                                <span className="text-[10px] font-bold uppercase">
                                  Today
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">
                                Manage
                              </button>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ── Section 4: Tools & Logs ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Detailed Analytics */}
          <motion.div variants={fadeUp} custom={4}>
            <Card className="p-7 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: "#FEF3C7" }}
                  >
                    <BarChart2 size={20} color={C.warning} />
                  </div>
                  <p
                    className="font-black text-sm uppercase tracking-tight"
                    style={{ color: C.textPrimary }}
                  >
                    Platform Pulse
                  </p>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {[
                  {
                    label: "Active Subscriptions",
                    value: stats.activeSubscriptions ?? 0,
                    color: C.primary,
                    icon: Crown,
                  },
                  {
                    label: "Pending Verification",
                    value: stats.pendingCompanies ?? 0,
                    color: C.warning,
                    icon: Shield,
                  },
                  {
                    label: "System Uptime",
                    value: "99.98%",
                    color: C.success,
                    icon: Zap,
                  },
                  {
                    label: "Global Load",
                    value: "Low",
                    color: "#06B6D4",
                    icon: Globe,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-4 rounded-2xl flex items-center justify-between transition-transform hover:scale-[1.02]"
                    style={{ background: C.surfaceAlt }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        <item.icon size={14} color={item.color} />
                      </div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                        {item.label}
                      </span>
                    </div>
                    <span
                      className="text-sm font-black"
                      style={{ color: item.color }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <Link to="/super-admin/analytics" className="mt-8">
                <button
                  className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:shadow-lg active:scale-95"
                  style={{ background: C.primary, color: "#fff" }}
                >
                  Detailed Reports
                </button>
              </Link>
            </Card>
          </motion.div>

          {/* Module Controls */}
          <motion.div variants={fadeUp} custom={5}>
            <Card className="p-7 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: "#EDE9FE" }}
                  >
                    <Settings size={20} color="#8B5CF6" />
                  </div>
                  <p
                    className="font-black text-sm uppercase tracking-tight"
                    style={{ color: C.textPrimary }}
                  >
                    Platform Logic
                  </p>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                {config.map((module) => (
                  <div
                    key={module.label}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-50 hover:border-indigo-100 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${module.enabled ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-slate-300"}`}
                      />
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                        {module.label}
                      </span>
                    </div>
                    <div
                      className="w-10 h-6 rounded-full flex items-center transition-all cursor-pointer p-1"
                      style={{
                        background: module.enabled ? C.primary : C.border,
                      }}
                    >
                      <motion.div
                        animate={{ x: module.enabled ? 16 : 0 }}
                        className="w-4 h-4 rounded-full bg-white shadow-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/super-admin/configuration" className="mt-8">
                <button
                  className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-slate-800"
                  style={{ background: "#2D3748", color: "#fff" }}
                >
                  Edit System Configuration
                </button>
              </Link>
            </Card>
          </motion.div>

          {/* Audit Trail */}
          <motion.div variants={fadeUp} custom={6}>
            <Card
              className="p-7 h-full flex flex-col shadow-2xl"
              style={{ border: `1px solid ${C.successLight}` }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: C.successLight }}
                  >
                    <ScrollText size={20} color={C.success} />
                  </div>
                  <p
                    className="font-black text-sm uppercase tracking-tight"
                    style={{ color: C.textPrimary }}
                  >
                    Security Audit
                  </p>
                </div>
              </div>

              <div className="space-y-4 flex-1 relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-100" />
                {auditLogs.length > 0 ? (
                  auditLogs.map((log, i) => (
                    <div
                      key={log.id || i}
                      className="relative pl-10 group cursor-default"
                    >
                      <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 border-white bg-slate-200 group-hover:bg-indigo-500 transition-colors z-10" />
                      <p className="text-[11px] font-black text-slate-800 uppercase tracking-tighter mb-0.5">
                        {log.action || "Administrative Change"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold mb-1 leading-tight">
                        {log.details || "Performed system update"}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-indigo-500 uppercase">
                          {log.actor || "System"}
                        </span>
                        <span className="text-[9px] font-bold text-slate-300">
                          ·{" "}
                          {log.created_at
                            ? new Date(log.created_at).toLocaleTimeString()
                            : "Just now"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-10 opacity-20">
                    <Lock size={40} />
                    <p className="text-[10px] font-black uppercase mt-4">
                      Encrypted Logs Empty
                    </p>
                  </div>
                )}
              </div>

              <Link to="/super-admin/audit-logs" className="mt-8">
                <button
                  className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all hover:bg-emerald-50"
                  style={{ borderColor: C.success, color: C.success }}
                >
                  View Complete Logs
                </button>
              </Link>
            </Card>
          </motion.div>
        </div>

        {/* ── Section 5: Real-time Monitoring ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={7}
        >
          <Card className="p-8 border-none bg-slate-900 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-500/20 ring-1 ring-indigo-500/30">
                  <Activity size={24} color="#818CF8" />
                </div>
                <div>
                  <p className="font-black text-lg text-white tracking-tight">
                    Cloud Infrastructure Status
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                    Real-time API monitoring across all regions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-xl ring-1 ring-emerald-500/30">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                  Global Operations Stable
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: "API Gateway",
                  status: systemHealth.api ?? "Operational",
                  icon: Zap,
                  color: "#10B981",
                },
                {
                  label: "Core Database",
                  status: systemHealth.db ?? "Operational",
                  icon: Database,
                  color: "#F59E0B",
                },
                {
                  label: "Mail Engine",
                  status: systemHealth.email ?? "Operational",
                  icon: Mail,
                  color: "#818CF8",
                },
                {
                  label: "Storage Clusters",
                  status: systemHealth.storage ?? "Operational",
                  icon: Server,
                  color: "#EC4899",
                },
              ].map(({ label, status, icon: Icon, color }) => (
                <div
                  key={label}
                  className="group p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/[0.08] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ background: `${color}20` }}
                    >
                      <Icon size={20} color={color} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-300 uppercase tracking-tight mb-1">
                        {label}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[11px] font-bold"
                          style={{
                            color:
                              status === "Operational" ? "#10B981" : "#F59E0B",
                          }}
                        >
                          {status}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Mock health mini-chart */}
                  <div className="mt-5 flex gap-1 items-end h-8">
                    {[...Array(15)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: "20%" }}
                        animate={{
                          height: [
                            `${20 + Math.random() * 60}%`,
                            `${40 + Math.random() * 50}%`,
                            `${30 + Math.random() * 40}%`,
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                        className="flex-1 rounded-sm bg-white/10 group-hover:bg-indigo-400/30 transition-colors"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-400 uppercase"
                    >
                      US
                    </div>
                  ))}
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Global Instance Distribution
                </p>
              </div>
              <Link to="/super-admin/system-monitoring">
                <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-indigo-400 transition-colors">
                  Access Infrastructure <ArrowUpRight size={14} />
                </button>
              </Link>
            </div>
          </Card>
        </motion.div>

        <div className="h-10" />
      </div>
    </SuperAdminLayout>
  );
}
