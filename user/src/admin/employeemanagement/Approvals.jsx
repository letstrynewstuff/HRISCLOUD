// // src/admin/approvals/Approvals.jsx
// // Route: /admin/approvals
// // Approval Center — all module approvals in one place.
// // Connects to approvalApi.js — zero mock data.

// import { useState, useEffect, useCallback, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import AdminSideNavbar from "../AdminSideNavbar";
// import {
//   ClipboardCheck,
//   Search,
//   Menu,
//   X,
//   CheckCircle2,
//   XCircle,
//   Clock,
//   Eye,
//   UserCog,
//   Plane,
//   CreditCard,
//   ScrollText,
//   Bell,
//   RefreshCw,
//   AlertTriangle,
//   ChevronRight,
//   Loader2,
//   History,
//   Check,
// } from "lucide-react";
// import { C } from "./sharedData";
// import { approvalApi } from "../../api/service/approvalApi";

// // ── Framer variant ────────────────────────────────────────────
// const fadeUp = {
//   hidden: { opacity: 0, y: 12 },
//   visible: (i = 0) => ({
//     opacity: 1,
//     y: 0,
//     transition: { delay: i * 0.04, duration: 0.36 },
//   }),
// };

// // ── Type config ───────────────────────────────────────────────
// const TYPE_CONFIG = {
//   leave: { label: "Leave", color: C.primary, bg: C.primaryLight, icon: Plane },
//   profile_change: {
//     label: "Profile Change",
//     color: "#7C3AED",
//     bg: "#F3E8FF",
//     icon: UserCog,
//   },
//   payroll: {
//     label: "Payroll",
//     color: C.success,
//     bg: C.successLight,
//     icon: CreditCard,
//   },
//   document: {
//     label: "Document",
//     color: C.accent,
//     bg: C.accentLight,
//     icon: ScrollText,
//   },
//   loan: {
//     label: "Loan",
//     color: C.warning,
//     bg: C.warningLight,
//     icon: CreditCard,
//   },
// };

// const STATUS_CONFIG = {
//   pending: {
//     label: "Pending",
//     bg: C.warningLight,
//     color: C.warning,
//     icon: Clock,
//   },
//   approved: {
//     label: "Approved",
//     bg: C.successLight,
//     color: C.success,
//     icon: CheckCircle2,
//   },
//   rejected: {
//     label: "Rejected",
//     bg: C.dangerLight,
//     color: C.danger,
//     icon: XCircle,
//   },
//   in_review: { label: "In Review", bg: "#DBEAFE", color: "#3B82F6", icon: Eye },
// };

// // ── Atoms ─────────────────────────────────────────────────────
// function TypeBadge({ type }) {
//   const cfg = TYPE_CONFIG[type?.toLowerCase()] ?? {
//     label: type,
//     color: C.textMuted,
//     bg: C.surfaceAlt,
//   };
//   return (
//     <span
//       className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
//       style={{ background: cfg.bg, color: cfg.color }}
//     >
//       {cfg.label}
//     </span>
//   );
// }

// function StatusBadge({ status }) {
//   const cfg = STATUS_CONFIG[status?.toLowerCase()] ?? {
//     label: status,
//     bg: C.surfaceAlt,
//     color: C.textMuted,
//     icon: Clock,
//   };
//   const Icon = cfg.icon;
//   return (
//     <span
//       className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
//       style={{ background: cfg.bg, color: cfg.color }}
//     >
//       <Icon size={9} />
//       {cfg.label}
//     </span>
//   );
// }

// function Avatar({ name, size = 36 }) {
//   const initials =
//     name
//       ?.split(" ")
//       .map((n) => n[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2) ?? "??";
//   return (
//     <div
//       className="rounded-xl flex items-center justify-center text-white font-bold shrink-0"
//       style={{
//         width: size,
//         height: size,
//         fontSize: size * 0.33,
//         background: `linear-gradient(135deg,${C.primary},#6366F1)`,
//       }}
//     >
//       {initials}
//     </div>
//   );
// }

// function Toast({ msg, type, onDone }) {
//   useEffect(() => {
//     const t = setTimeout(onDone, 3500);
//     return () => clearTimeout(t);
//   }, [onDone]);
//   const Icon = type === "success" ? CheckCircle2 : XCircle;
//   const color = type === "success" ? C.success : C.danger;
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 40, x: "-50%" }}
//       animate={{ opacity: 1, y: 0, x: "-50%" }}
//       exit={{ opacity: 0, y: 40, x: "-50%" }}
//       className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl"
//       style={{
//         background: "#1E1B4B",
//         boxShadow: "0 12px 40px rgba(15,23,42,0.35)",
//         minWidth: 260,
//       }}
//     >
//       <Icon size={16} color={color} />
//       <span className="text-white text-sm font-semibold">{msg}</span>
//     </motion.div>
//   );
// }

// // ── Detail Drawer ─────────────────────────────────────────────
// function DetailDrawer({ approval, onApprove, onReject, onClose, actioning }) {
//   const [rejectReason, setRejectReason] = useState("");
//   const [showRejectForm, setShowRejectForm] = useState(false);

//   const meta = approval.metadata ?? {};
//   const isPending = approval.status?.toLowerCase() === "pending";

//   return (
//     <div className="fixed inset-0 z-50 flex justify-end">
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//         onClick={onClose}
//       />
//       <motion.div
//         initial={{ x: "100%" }}
//         animate={{ x: 0 }}
//         exit={{ x: "100%" }}
//         transition={{ type: "spring", stiffness: 300, damping: 30 }}
//         className="relative w-full max-w-lg h-full overflow-y-auto"
//         style={{
//           background: C.surface,
//           boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
//         }}
//       >
//         {/* Header */}
//         <div
//           className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
//           style={{
//             background: C.surface,
//             borderBottom: `1px solid ${C.border}`,
//           }}
//         >
//           <div>
//             <p
//               className="text-[10px] font-semibold uppercase tracking-widest"
//               style={{ color: C.textMuted }}
//             >
//               Request ID
//             </p>
//             <p
//               className="font-mono text-sm font-bold"
//               style={{ color: C.textPrimary }}
//             >
//               {approval.id?.slice(0, 8)}…
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 rounded-xl flex items-center justify-center"
//             style={{
//               background: C.surfaceAlt,
//               border: `1px solid ${C.border}`,
//             }}
//           >
//             <X size={14} color={C.textSecondary} />
//           </button>
//         </div>

//         <div className="p-6 space-y-6">
//           {/* Employee */}
//           <div className="flex items-center gap-3">
//             <Avatar name={approval.employee_name} size={44} />
//             <div>
//               <p
//                 className="font-bold text-base"
//                 style={{ color: C.textPrimary }}
//               >
//                 {approval.employee_name ?? "—"}
//               </p>
//               <p className="text-xs" style={{ color: C.textMuted }}>
//                 {approval.department_name ?? approval.employee_code ?? "—"}
//               </p>
//             </div>
//             <div className="ml-auto flex flex-col items-end gap-1">
//               <TypeBadge type={approval.type} />
//               <StatusBadge status={approval.status} />
//             </div>
//           </div>

//           {/* Summary */}
//           <div
//             className="rounded-xl p-4"
//             style={{
//               background: C.surfaceAlt,
//               border: `1px solid ${C.border}`,
//             }}
//           >
//             <p
//               className="text-xs font-semibold mb-1"
//               style={{ color: C.textSecondary }}
//             >
//               Description
//             </p>
//             <p className="text-sm" style={{ color: C.textPrimary }}>
//               {approval.description ?? approval.summary ?? "—"}
//             </p>
//           </div>

//           {/* Timestamps */}
//           <div className="grid grid-cols-2 gap-3">
//             {[
//               {
//                 label: "Submitted",
//                 value: approval.created_at
//                   ? new Date(approval.created_at).toLocaleDateString("en-NG")
//                   : "—",
//               },
//               {
//                 label: "Last Updated",
//                 value: approval.updated_at
//                   ? new Date(approval.updated_at).toLocaleDateString("en-NG")
//                   : "—",
//               },
//               {
//                 label: "Requested By",
//                 value: approval.requested_by_name ?? "—",
//               },
//               {
//                 label: "Reviewed By",
//                 value: approval.reviewed_by_name ?? "Pending",
//               },
//             ].map((r) => (
//               <div
//                 key={r.label}
//                 className="rounded-xl p-3"
//                 style={{
//                   background: C.surfaceAlt,
//                   border: `1px solid ${C.border}`,
//                 }}
//               >
//                 <p
//                   className="text-[10px] font-semibold mb-0.5"
//                   style={{ color: C.textMuted }}
//                 >
//                   {r.label}
//                 </p>
//                 <p
//                   className="text-xs font-semibold"
//                   style={{ color: C.textPrimary }}
//                 >
//                   {r.value}
//                 </p>
//               </div>
//             ))}
//           </div>

//           {/* Metadata — show all key/value pairs from the backend */}
//           {Object.keys(meta).length > 0 && (
//             <div>
//               <p
//                 className="text-xs font-semibold mb-2"
//                 style={{ color: C.textSecondary }}
//               >
//                 Request Details
//               </p>
//               <div
//                 className="rounded-xl overflow-hidden"
//                 style={{ border: `1px solid ${C.border}` }}
//               >
//                 {Object.entries(meta).map(([k, v], i) => (
//                   <div
//                     key={k}
//                     className="flex items-center justify-between px-4 py-2.5"
//                     style={{
//                       borderBottom:
//                         i < Object.keys(meta).length - 1
//                           ? `1px solid ${C.border}`
//                           : "none",
//                       background: i % 2 === 0 ? C.surface : C.surfaceAlt,
//                     }}
//                   >
//                     <span
//                       className="text-xs font-medium capitalize"
//                       style={{ color: C.textSecondary }}
//                     >
//                       {k.replace(/_/g, " ")}
//                     </span>
//                     <span
//                       className="text-xs font-semibold"
//                       style={{ color: C.textPrimary }}
//                     >
//                       {typeof v === "object" ? JSON.stringify(v) : String(v)}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Rejection note if already rejected */}
//           {approval.rejection_reason && (
//             <div
//               className="rounded-xl p-4"
//               style={{
//                 background: C.dangerLight,
//                 border: `1px solid ${C.danger}33`,
//               }}
//             >
//               <p
//                 className="text-xs font-semibold mb-1"
//                 style={{ color: C.danger }}
//               >
//                 Rejection Reason
//               </p>
//               <p className="text-sm" style={{ color: C.textPrimary }}>
//                 {approval.rejection_reason}
//               </p>
//             </div>
//           )}

//           {/* Actions */}
//           {isPending && (
//             <div className="space-y-3 pt-2">
//               {!showRejectForm ? (
//                 <div className="flex gap-3">
//                   <motion.button
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     onClick={() => onApprove(approval.id)}
//                     disabled={actioning}
//                     className="flex-1 py-3 rounded-2xl font-semibold text-white flex items-center justify-center gap-2"
//                     style={{
//                       background: C.success,
//                       opacity: actioning ? 0.7 : 1,
//                     }}
//                   >
//                     {actioning ? (
//                       <Loader2 size={15} className="animate-spin" />
//                     ) : (
//                       <CheckCircle2 size={15} />
//                     )}
//                     Approve
//                   </motion.button>
//                   <motion.button
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     onClick={() => setShowRejectForm(true)}
//                     disabled={actioning}
//                     className="flex-1 py-3 rounded-2xl font-semibold border flex items-center justify-center gap-2"
//                     style={{
//                       borderColor: C.danger,
//                       color: C.danger,
//                       background: C.dangerLight,
//                     }}
//                   >
//                     <XCircle size={15} /> Reject
//                   </motion.button>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   <textarea
//                     value={rejectReason}
//                     onChange={(e) => setRejectReason(e.target.value)}
//                     placeholder="Provide a reason for rejection (required)..."
//                     rows={3}
//                     className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
//                     style={{
//                       background: C.surfaceAlt,
//                       border: `1.5px solid ${C.danger}`,
//                       color: C.textPrimary,
//                     }}
//                   />
//                   <div className="flex gap-3">
//                     <button
//                       onClick={() => setShowRejectForm(false)}
//                       className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
//                       style={{
//                         background: C.surfaceAlt,
//                         border: `1px solid ${C.border}`,
//                         color: C.textSecondary,
//                       }}
//                     >
//                       Cancel
//                     </button>
//                     <motion.button
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       onClick={() => {
//                         if (rejectReason.trim())
//                           onReject(approval.id, rejectReason);
//                       }}
//                       disabled={!rejectReason.trim() || actioning}
//                       className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
//                       style={{
//                         background: C.danger,
//                         opacity: !rejectReason.trim() || actioning ? 0.6 : 1,
//                       }}
//                     >
//                       {actioning ? (
//                         <Loader2 size={13} className="animate-spin" />
//                       ) : null}
//                       Confirm Rejection
//                     </motion.button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </motion.div>
//     </div>
//   );
// }

// // ── Stat Card ─────────────────────────────────────────────────
// function StatCard({ label, value, color, bg, icon: Icon, active, onClick }) {
//   return (
//     <motion.div
//       whileHover={{ y: -2 }}
//       onClick={onClick}
//       className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all"
//       style={{
//         background: active ? color : C.surface,
//         border: `1px solid ${active ? color : C.border}`,
//         boxShadow: active ? `0 4px 16px ${color}33` : "none",
//       }}
//     >
//       <div
//         className="w-9 h-9 rounded-xl flex items-center justify-center"
//         style={{ background: active ? "rgba(255,255,255,0.2)" : bg }}
//       >
//         <Icon size={16} color={active ? "#fff" : color} />
//       </div>
//       <div>
//         <p
//           className="text-xl font-black"
//           style={{ color: active ? "#fff" : C.textPrimary }}
//         >
//           {value}
//         </p>
//         <p
//           className="text-[11px] font-medium"
//           style={{ color: active ? "rgba(255,255,255,0.8)" : C.textSecondary }}
//         >
//           {label}
//         </p>
//       </div>
//     </motion.div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════
// export default function ApprovalsPage() {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [approvals, setApprovals] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [actioning, setActioning] = useState(false);
//   const [drawer, setDrawer] = useState(null);
//   const [toast, setToast] = useState(null);
//   const [search, setSearch] = useState("");
//   const [searchFocused, setSearchFocused] = useState(false);
//   const [statusTab, setStatusTab] = useState("all"); // all | pending | approved | rejected
//   const [typeFilter, setTypeFilter] = useState("all"); // all | leave | profile_change | payroll | document | loan

//   const showToast = (msg, type = "success") => {
//     setToast({ msg, type });
//   };

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await approvalApi.getAll({ limit: 100 });
//       setApprovals(res.data ?? []);
//     } catch (err) {
//       setError(err?.response?.data?.message ?? "Failed to load approvals.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     load();
//   }, [load]);

//   const handleApprove = async (id) => {
//     setActioning(true);
//     // Optimistic update
//     setApprovals((prev) =>
//       prev.map((a) => (a.id === id ? { ...a, status: "approved" } : a)),
//     );
//     setDrawer(null);
//     try {
//       await approvalApi.approve(id);
//       showToast("Request approved successfully.");
//     } catch (err) {
//       // Revert on failure
//       setApprovals((prev) =>
//         prev.map((a) => (a.id === id ? { ...a, status: "pending" } : a)),
//       );
//       showToast(err?.response?.data?.message ?? "Failed to approve.", "error");
//     } finally {
//       setActioning(false);
//     }
//   };

//   const handleReject = async (id, reason) => {
//     setActioning(true);
//     setApprovals((prev) =>
//       prev.map((a) =>
//         a.id === id
//           ? { ...a, status: "rejected", rejection_reason: reason }
//           : a,
//       ),
//     );
//     setDrawer(null);
//     try {
//       await approvalApi.reject(id, reason);
//       showToast("Request rejected.");
//     } catch (err) {
//       setApprovals((prev) =>
//         prev.map((a) => (a.id === id ? { ...a, status: "pending" } : a)),
//       );
//       showToast(err?.response?.data?.message ?? "Failed to reject.", "error");
//     } finally {
//       setActioning(false);
//     }
//   };

//   // Stats derived from live data
//   const stats = useMemo(
//     () => ({
//       all: approvals.length,
//       pending: approvals.filter((a) => a.status === "pending").length,
//       approved: approvals.filter((a) => a.status === "approved").length,
//       rejected: approvals.filter((a) => a.status === "rejected").length,
//     }),
//     [approvals],
//   );

//   // Filtered list
//   const filtered = useMemo(() => {
//     return approvals.filter((a) => {
//       const q = search.toLowerCase();
//       const matchSearch =
//         !q ||
//         a.employee_name?.toLowerCase().includes(q) ||
//         a.description?.toLowerCase().includes(q) ||
//         a.type?.toLowerCase().includes(q);
//       const matchStatus =
//         statusTab === "all" || a.status?.toLowerCase() === statusTab;
//       const matchType =
//         typeFilter === "all" || a.type?.toLowerCase() === typeFilter;
//       return matchSearch && matchStatus && matchType;
//     });
//   }, [approvals, search, statusTab, typeFilter]);

//   const STATUS_TABS = [
//     {
//       key: "all",
//       label: "All",
//       count: stats.all,
//       color: C.primary,
//       bg: C.primaryLight,
//       icon: ClipboardCheck,
//     },
//     {
//       key: "pending",
//       label: "Pending",
//       count: stats.pending,
//       color: C.warning,
//       bg: C.warningLight,
//       icon: Clock,
//     },
//     {
//       key: "approved",
//       label: "Approved",
//       count: stats.approved,
//       color: C.success,
//       bg: C.successLight,
//       icon: CheckCircle2,
//     },
//     {
//       key: "rejected",
//       label: "Rejected",
//       count: stats.rejected,
//       color: C.danger,
//       bg: C.dangerLight,
//       icon: XCircle,
//     },
//   ];

//   const TYPE_TABS = [
//     "all",
//     "leave",
//     "profile_change",
//     "payroll",
//     "document",
//     "loan",
//   ];

//   return (
//     <div
//       className="min-h-screen"
//       style={{ background: C.bg, fontFamily: "'DM Sans','Sora',sans-serif" }}
//     >
//       <div className="flex h-screen overflow-hidden">
//         <AdminSideNavbar
//           sidebarOpen={sidebarOpen}
//           collapsed={sidebarCollapsed}
//           setCollapsed={setSidebarCollapsed}
//           pendingApprovals={stats.pending}
//         />

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
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setSidebarOpen((p) => !p)}
//               className="p-2 rounded-xl hidden md:flex"
//               style={{ background: C.surface }}
//             >
//               <Menu size={16} color={C.textSecondary} />
//             </motion.button>

//             <motion.div
//               className="flex-1 max-w-xs relative"
//               animate={{ width: searchFocused ? "320px" : "240px" }}
//               transition={{ duration: 0.25 }}
//             >
//               <Search
//                 size={14}
//                 className="absolute left-3 top-1/2 -translate-y-1/2"
//                 color={C.textMuted}
//               />
//               <input
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 onFocus={() => setSearchFocused(true)}
//                 onBlur={() => setSearchFocused(false)}
//                 placeholder="Search approvals..."
//                 className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
//                 style={{
//                   background: C.surface,
//                   border: `1.5px solid ${searchFocused ? C.primary : C.border}`,
//                   color: C.textPrimary,
//                 }}
//               />
//             </motion.div>

//             <div className="ml-auto flex items-center gap-2">
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={load}
//                 className="w-8 h-8 rounded-xl flex items-center justify-center"
//                 style={{
//                   background: C.surface,
//                   border: `1px solid ${C.border}`,
//                 }}
//               >
//                 <RefreshCw size={14} color={C.textSecondary} />
//               </motion.button>
//               <div
//                 className="relative w-8 h-8 rounded-xl flex items-center justify-center"
//                 style={{
//                   background: C.surface,
//                   border: `1px solid ${C.border}`,
//                 }}
//               >
//                 <Bell size={14} color={C.textSecondary} />
//                 {stats.pending > 0 && (
//                   <span
//                     className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
//                     style={{ background: C.danger }}
//                   >
//                     {stats.pending}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </header>

//           {/* ── MAIN ── */}
//           <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
//             {/* Page title */}
//             <div>
//               <h1
//                 className="text-2xl font-bold"
//                 style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
//               >
//                 Approval Center
//               </h1>
//               <p className="text-sm mt-0.5" style={{ color: C.textMuted }}>
//                 Review and action all pending requests across modules
//               </p>
//             </div>

//             {/* Stat cards */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {STATUS_TABS.map((s) => (
//                 <StatCard
//                   key={s.key}
//                   label={s.label}
//                   value={s.count}
//                   color={s.color}
//                   bg={s.bg}
//                   icon={s.icon}
//                   active={statusTab === s.key}
//                   onClick={() => setStatusTab(s.key)}
//                 />
//               ))}
//             </div>

//             {/* Type filter pills */}
//             <div className="flex gap-2 flex-wrap">
//               {TYPE_TABS.map((t) => {
//                 const cfg = TYPE_CONFIG[t] ?? {
//                   label: "All",
//                   color: C.primary,
//                   bg: C.primaryLight,
//                 };
//                 const active = typeFilter === t;
//                 return (
//                   <button
//                     key={t}
//                     onClick={() => setTypeFilter(t)}
//                     className="text-[11px] font-bold px-3 py-1.5 rounded-full transition-all"
//                     style={{
//                       background: active
//                         ? t === "all"
//                           ? C.primary
//                           : cfg.color
//                         : C.surface,
//                       color: active ? "#fff" : C.textSecondary,
//                       border: `1px solid ${active ? (t === "all" ? C.primary : cfg.color) : C.border}`,
//                     }}
//                   >
//                     {t === "all" ? "All Types" : cfg.label}
//                   </button>
//                 );
//               })}
//             </div>

//             {/* List card */}
//             <div
//               className="rounded-2xl overflow-hidden"
//               style={{ background: C.surface, border: `1px solid ${C.border}` }}
//             >
//               <div
//                 className="px-5 py-4 flex items-center justify-between"
//                 style={{ borderBottom: `1px solid ${C.border}` }}
//               >
//                 <div className="flex items-center gap-2">
//                   <div
//                     className="w-8 h-8 rounded-xl flex items-center justify-center"
//                     style={{ background: C.primaryLight }}
//                   >
//                     <ClipboardCheck size={15} color={C.primary} />
//                   </div>
//                   <span
//                     className="font-semibold text-sm"
//                     style={{ color: C.textPrimary }}
//                   >
//                     {filtered.length} Request{filtered.length !== 1 ? "s" : ""}
//                   </span>
//                 </div>
//                 {error && (
//                   <div
//                     className="flex items-center gap-1.5 text-xs"
//                     style={{ color: C.danger }}
//                   >
//                     <AlertTriangle size={12} /> {error}
//                   </div>
//                 )}
//               </div>

//               {loading ? (
//                 <div className="p-6 space-y-3">
//                   {[1, 2, 3, 4].map((i) => (
//                     <div
//                       key={i}
//                       className="h-16 rounded-xl animate-pulse"
//                       style={{ background: C.surfaceAlt }}
//                     />
//                   ))}
//                 </div>
//               ) : filtered.length === 0 ? (
//                 <div className="py-20 flex flex-col items-center gap-3">
//                   <CheckCircle2 size={40} color={C.success} />
//                   <p
//                     className="font-semibold"
//                     style={{ color: C.textSecondary }}
//                   >
//                     {statusTab === "pending"
//                       ? "No pending approvals 🎉"
//                       : "No approvals found"}
//                   </p>
//                   <p className="text-xs" style={{ color: C.textMuted }}>
//                     {search
//                       ? `No results for "${search}"`
//                       : "Try a different filter"}
//                   </p>
//                 </div>
//               ) : (
//                 <div className="divide-y" style={{ borderColor: C.border }}>
//                   {filtered.map((req, i) => (
//                     <motion.div
//                       key={req.id}
//                       custom={i}
//                       variants={fadeUp}
//                       initial="hidden"
//                       animate="visible"
//                       onClick={() => setDrawer(req)}
//                       className="px-5 py-4 flex items-center gap-4 cursor-pointer group"
//                       onMouseEnter={(e) =>
//                         (e.currentTarget.style.background = C.surfaceAlt)
//                       }
//                       onMouseLeave={(e) =>
//                         (e.currentTarget.style.background = "transparent")
//                       }
//                     >
//                       <Avatar name={req.employee_name} size={38} />
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-center gap-2 flex-wrap">
//                           <p
//                             className="font-semibold text-sm truncate"
//                             style={{ color: C.textPrimary }}
//                           >
//                             {req.employee_name ?? "Unknown Employee"}
//                           </p>
//                           <TypeBadge type={req.type} />
//                           {req.status?.toLowerCase() === "pending" && (
//                             <span
//                               className="text-[9px] font-bold px-2 py-0.5 rounded-full"
//                               style={{
//                                 background: C.dangerLight,
//                                 color: C.danger,
//                               }}
//                             >
//                               NEEDS ACTION
//                             </span>
//                           )}
//                         </div>
//                         <p
//                           className="text-xs mt-0.5 truncate"
//                           style={{ color: C.textSecondary }}
//                         >
//                           {req.description ?? req.summary ?? "—"}
//                         </p>
//                         <p
//                           className="text-[10px] mt-0.5"
//                           style={{ color: C.textMuted }}
//                         >
//                           {req.department_name ?? req.employee_code ?? ""} •{" "}
//                           {req.created_at
//                             ? new Date(req.created_at).toLocaleDateString(
//                                 "en-NG",
//                               )
//                             : "—"}
//                         </p>
//                       </div>
//                       <div className="flex items-center gap-2 shrink-0">
//                         <StatusBadge status={req.status} />
//                         {req.status?.toLowerCase() === "pending" && (
//                           <div
//                             className="flex gap-1"
//                             onClick={(e) => e.stopPropagation()}
//                           >
//                             <motion.button
//                               whileHover={{ scale: 1.1 }}
//                               whileTap={{ scale: 0.9 }}
//                               onClick={() => handleApprove(req.id)}
//                               className="w-7 h-7 rounded-lg flex items-center justify-center"
//                               style={{ background: C.successLight }}
//                             >
//                               <Check size={12} color={C.success} />
//                             </motion.button>
//                             <motion.button
//                               whileHover={{ scale: 1.1 }}
//                               whileTap={{ scale: 0.9 }}
//                               onClick={() => setDrawer(req)}
//                               className="w-7 h-7 rounded-lg flex items-center justify-center"
//                               style={{ background: C.dangerLight }}
//                             >
//                               <X size={12} color={C.danger} />
//                             </motion.button>
//                           </div>
//                         )}
//                         <ChevronRight
//                           size={14}
//                           color={C.textMuted}
//                           className="opacity-0 group-hover:opacity-100 transition-opacity"
//                         />
//                       </div>
//                     </motion.div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </main>
//         </div>
//       </div>

//       {/* ── Detail Drawer ── */}
//       <AnimatePresence>
//         {drawer && (
//           <DetailDrawer
//             approval={drawer}
//             actioning={actioning}
//             onApprove={handleApprove}
//             onReject={handleReject}
//             onClose={() => setDrawer(null)}
//           />
//         )}
//       </AnimatePresence>

//       {/* ── Toast ── */}
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


// src/admin/approvals/Approvals.jsx
// Route: /admin/approvals

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSideNavbar from "../AdminSideNavbar";
import Header from "../../components/Header"; // ✅ IMPORT YOUR HEADER
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { C } from "./sharedData";
import { approvalApi } from "../../api/service/approvalApi";


// ─────────────────────────────────────────────────────────────
// TYPE + STATUS CONFIG (unchanged)
// ─────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  leave: { label: "Leave" },
  profile_change: { label: "Profile Change" },
  payroll: { label: "Payroll" },
  document: { label: "Document" },
  loan: { label: "Loan" },
};

const STATUS_CONFIG = {
  pending: { label: "Pending" },
  approved: { label: "Approved" },
  rejected: { label: "Rejected" },
};


// ─────────────────────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────

function Avatar({ name, size = 36 }) {
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "??";

  return (
    <div
      className="rounded-xl flex items-center justify-center text-white font-bold shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.33,
        background: `linear-gradient(135deg,${C.primary},#6366F1)`,
      }}
    >
      {initials}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function ApprovalsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("all");

  // ─────────────────────────────────────────────
  // LOAD DATA
  // ─────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await approvalApi.getAll({ limit: 100 });
      setApprovals(res.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load approvals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ─────────────────────────────────────────────
  // STATS
  // ─────────────────────────────────────────────

  const stats = useMemo(() => {
    return {
      all: approvals.length,
      pending: approvals.filter((a) => a.status === "pending").length,
      approved: approvals.filter((a) => a.status === "approved").length,
      rejected: approvals.filter((a) => a.status === "rejected").length,
    };
  }, [approvals]);

  // ─────────────────────────────────────────────
  // FILTERED DATA
  // ─────────────────────────────────────────────

  const filtered = useMemo(() => {
    return approvals.filter((a) => {
      const q = search.toLowerCase();

      const matchSearch =
        !q ||
        a.employee_name?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.type?.toLowerCase().includes(q);

      const matchStatus =
        statusTab === "all" || a.status?.toLowerCase() === statusTab;

      return matchSearch && matchStatus;
    });
  }, [approvals, search, statusTab]);

  // ─────────────────────────────────────────────
  // HEADER STATS (for Hero section)
  // ─────────────────────────────────────────────

  const headerStats = [
    {
      label: "Total",
      value: stats.all,
    },
    {
      label: "Pending",
      value: stats.pending,
      color: C.warning,
    },
    {
      label: "Approved",
      value: stats.approved,
      color: C.success,
    },
    {
      label: "Rejected",
      value: stats.rejected,
      color: C.danger,
    },
  ];

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <div
      className="min-h-screen"
      style={{ background: C.bg, fontFamily: "'DM Sans','Sora',sans-serif" }}
    >
      <div className="flex h-screen overflow-hidden">
        <AdminSideNavbar
          sidebarOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          pendingApprovals={stats.pending}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* ✅ USING YOUR HEADER COMPONENT */}
          <Header
            title="Approval Center"
            subtitle="Review and action all requests across modules"
            icon={ClipboardCheck}
            loading={loading}
            searchQuery={search}
            setSearchQuery={setSearch}
            setSidebarOpen={setSidebarOpen}
            pendingCount={stats.pending}
            stats={headerStats}
          />

          {/* ───────── MAIN CONTENT ───────── */}
          <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

            {/* Status Filter Buttons */}
            <div className="flex gap-3 flex-wrap">
              {["all", "pending", "approved", "rejected"].map((s) => {
                const active = statusTab === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusTab(s)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold"
                    style={{
                      background: active ? C.primary : C.surface,
                      color: active ? "#fff" : C.textSecondary,
                      border: `1px solid ${active ? C.primary : C.border}`,
                    }}
                  >
                    {STATUS_CONFIG[s]?.label ?? "All"}
                  </button>
                );
              })}
            </div>

            {/* Approval List */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              {loading ? (
                <div className="p-8 text-center">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="py-20 text-center">
                  <CheckCircle2 size={40} color={C.success} />
                  <p className="mt-3 font-semibold">
                    {statusTab === "pending"
                      ? "No pending approvals 🎉"
                      : "No approvals found"}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filtered.map((req) => (
                    <div
                      key={req.id}
                      className="px-5 py-4 flex items-center gap-4"
                    >
                      <Avatar name={req.employee_name} size={38} />

                      <div className="flex-1">
                        <p className="font-semibold text-sm">
                          {req.employee_name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {req.description ?? "—"}
                        </p>
                      </div>

                      <div className="text-xs font-semibold capitalize">
                        {req.status}
                      </div>

                      <ChevronRight size={16} color={C.textMuted} />
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="p-4 text-red-500 text-sm flex items-center gap-2">
                  <AlertTriangle size={14} /> {error}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}