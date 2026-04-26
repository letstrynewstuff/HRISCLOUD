// // // ─────────────────────────────────────────────────────────────
// // //  src/admin/employeemanagement/ProfileChangeRequests.jsx
// // //
// // //  Route:  /admin/approvals/profile
// // //  Part of the Employee Management module.
// // //
// // //  Features:
// // //    • Full table: employee name/avatar, field, old→new values,
// // //      status, submitted date, reviewed by
// // //    • Live search by employee name or field
// // //    • Filter by status (Pending / Approved / Rejected) and dept
// // //    • Column sort
// // //    • Approve action → updates employee profile in state +
// // //      logs audit entry + success toast
// // //    • Reject action → modal to enter reason + logs audit entry
// // //    • Detail drawer / expandable row for full context
// // //    • Stats cards: total / pending / approved / rejected
// // //    • Empty state per filter
// // //    • Matches AdminDashboard colour palette exactly
// // // ─────────────────────────────────────────────────────────────

// // import { useState, useEffect, useMemo, useCallback } from "react";
// // import { motion, AnimatePresence } from "framer-motion";
// // import { useNavigate } from "react-router-dom";
// // import AdminSideNavbar from "../AdminSideNavbar";
// // import {
// //   ClipboardList,
// //   Search,
// //   Filter,
// //   Check,
// //   X,
// //   ChevronRight,
// //   ChevronDown,
// //   ChevronUp,
// //   ChevronLeft,
// //   Menu,
// //   Bell,
// //   CheckCircle2,
// //   XCircle,
// //   Clock,
// //   AlertCircle,
// //   Eye,
// //   ArrowUpDown,
// //   ArrowUp,
// //   ArrowDown,
// //   RefreshCw,
// //   UserCog,
// //   Edit3,
// //   History,
// //   Send,
// //   Building2,
// //   SlidersHorizontal,
// //   CalendarDays,
// //   User,
// //   Info,
// // } from "lucide-react";

// // import {
// //   C,
// //   ADMIN,
// //   DEPT_COLORS,
// //   DEPARTMENTS,
// //   fadeUp,
// //   INITIAL_REQUESTS,
// //   INITIAL_EMPLOYEES,
// // } from "./sharedData";

// // /* ─────────────────────────────────────────
// //    SMALL ATOMS
// // ───────────────────────────────────────── */
// // function Card({ children, className = "", style = {} }) {
// //   return (
// //     <div
// //       className={`rounded-2xl ${className}`}
// //       style={{
// //         background: C.surface,
// //         border: `1px solid ${C.border}`,
// //         boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
// //         ...style,
// //       }}
// //     >
// //       {children}
// //     </div>
// //   );
// // }

// // function Av({ initials, dept, size = 36 }) {
// //   const color = DEPT_COLORS[dept] || C.primary;
// //   return (
// //     <div
// //       className="flex items-center justify-center text-white font-bold shrink-0"
// //       style={{
// //         width: size,
// //         height: size,
// //         borderRadius: size * 0.3,
// //         background: `linear-gradient(135deg,${color},${color}bb)`,
// //         fontSize: size * 0.34,
// //         fontFamily: "Sora,sans-serif",
// //         boxShadow: `0 2px 8px ${color}33`,
// //       }}
// //     >
// //       {initials}
// //     </div>
// //   );
// // }

// // function StatusChip({ status }) {
// //   const map = {
// //     pending: {
// //       color: C.warning,
// //       bg: C.warningLight,
// //       icon: Clock,
// //       label: "Pending",
// //     },
// //     approved: {
// //       color: C.success,
// //       bg: C.successLight,
// //       icon: CheckCircle2,
// //       label: "Approved",
// //     },
// //     rejected: {
// //       color: C.danger,
// //       bg: C.dangerLight,
// //       icon: XCircle,
// //       label: "Rejected",
// //     },
// //   };
// //   const { color, bg, icon: Icon, label } = map[status] || map.pending;
// //   return (
// //     <span
// //       className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
// //       style={{ background: bg, color }}
// //     >
// //       <Icon size={10} />
// //       {label}
// //     </span>
// //   );
// // }

// // function FieldChip({ field }) {
// //   const map = {
// //     "Phone Number": { color: C.primary, bg: C.primaryLight },
// //     "Email Address": { color: C.accent, bg: C.accentLight },
// //     "Residential Address": { color: C.purple, bg: C.purpleLight },
// //     "Bank Account Number": { color: C.success, bg: C.successLight },
// //     "Bank Name": { color: C.success, bg: C.successLight },
// //     "Next of Kin Name": { color: C.warning, bg: C.warningLight },
// //     "Date of Birth": { color: C.pink, bg: C.pinkLight },
// //     "Next of Kin": { color: C.warning, bg: C.warningLight },
// //   };
// //   const { color, bg } = map[field] || { color: C.textMuted, bg: C.surfaceAlt };
// //   return (
// //     <span
// //       className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold"
// //       style={{ background: bg, color }}
// //     >
// //       {field}
// //     </span>
// //   );
// // }

// // function Skel({ h = 14, w = "100%", rounded = "6px" }) {
// //   return (
// //     <div
// //       style={{
// //         height: h,
// //         width: w,
// //         borderRadius: rounded,
// //         background:
// //           "linear-gradient(90deg,#E4E7F0 25%,#F0F2F8 50%,#E4E7F0 75%)",
// //         backgroundSize: "200% 100%",
// //         animation: "shimmer 1.4s infinite linear",
// //       }}
// //     />
// //   );
// // }

// // function SortIcon({ col, sortCol, sortDir }) {
// //   if (sortCol !== col) return <ArrowUpDown size={11} color={C.textMuted} />;
// //   return sortDir === "asc" ? (
// //     <ArrowUp size={11} color={C.primary} />
// //   ) : (
// //     <ArrowDown size={11} color={C.primary} />
// //   );
// // }

// // /* Toast */
// // function Toast({ msg, type = "success", onDone }) {
// //   useEffect(() => {
// //     const t = setTimeout(onDone, 3500);
// //     return () => clearTimeout(t);
// //   }, [onDone]);
// //   const color = type === "success" ? C.success : C.danger;
// //   const Icon = type === "success" ? CheckCircle2 : XCircle;
// //   return (
// //     <motion.div
// //       initial={{ opacity: 0, y: 40, x: "-50%" }}
// //       animate={{ opacity: 1, y: 0, x: "-50%" }}
// //       exit={{ opacity: 0, y: 40, x: "-50%" }}
// //       className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl"
// //       style={{
// //         background: C.navy,
// //         boxShadow: "0 12px 40px rgba(15,23,42,0.35)",
// //       }}
// //     >
// //       <Icon size={18} color={color} />
// //       <span className="text-white text-sm font-semibold">{msg}</span>
// //     </motion.div>
// //   );
// // }

// // /* ─────────────────────────────────────────
// //    REJECT MODAL
// // ───────────────────────────────────────── */
// // function RejectModal({ request, onConfirm, onClose }) {
// //   const [reason, setReason] = useState("");

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0 }}
// //       animate={{ opacity: 1 }}
// //       exit={{ opacity: 0 }}
// //       className="fixed inset-0 z-50 flex items-center justify-center p-5"
// //       style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
// //       onClick={onClose}
// //     >
// //       <motion.div
// //         initial={{ scale: 0.93, y: 20 }}
// //         animate={{ scale: 1, y: 0 }}
// //         exit={{ scale: 0.93, y: 20 }}
// //         transition={{ type: "spring", stiffness: 260, damping: 24 }}
// //         className="w-full max-w-md rounded-2xl overflow-hidden"
// //         style={{
// //           background: C.surface,
// //           boxShadow: "0 24px 64px rgba(15,23,42,0.2)",
// //         }}
// //         onClick={(e) => e.stopPropagation()}
// //       >
// //         <div
// //           className="px-6 py-5 flex items-center justify-between"
// //           style={{ background: `linear-gradient(135deg,${C.danger},#B91C1C)` }}
// //         >
// //           <div>
// //             <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">
// //               Request Action
// //             </p>
// //             <h3
// //               className="text-white text-lg font-bold mt-0.5"
// //               style={{ fontFamily: "Sora,sans-serif" }}
// //             >
// //               Reject Request
// //             </h3>
// //             <p className="text-white/70 text-xs mt-1">
// //               {request?.field} · {request?.employeeName}
// //             </p>
// //           </div>
// //           <motion.button
// //             whileHover={{ scale: 1.1, rotate: 90 }}
// //             onClick={onClose}
// //             style={{
// //               background: "rgba(255,255,255,0.15)",
// //               border: "none",
// //               borderRadius: 8,
// //               width: 32,
// //               height: 32,
// //               display: "flex",
// //               alignItems: "center",
// //               justifyContent: "center",
// //               cursor: "pointer",
// //             }}
// //           >
// //             <X size={14} color="#fff" />
// //           </motion.button>
// //         </div>

// //         <div className="p-5">
// //           {/* Request summary */}
// //           <div
// //             className="p-3 rounded-xl mb-4"
// //             style={{
// //               background: C.surfaceAlt,
// //               border: `1px solid ${C.border}`,
// //             }}
// //           >
// //             <div className="flex items-center gap-2 mb-2">
// //               <Av
// //                 initials={request?.employeeInitials}
// //                 dept={request?.dept}
// //                 size={28}
// //               />
// //               <div>
// //                 <p
// //                   className="text-xs font-bold"
// //                   style={{ color: C.textPrimary }}
// //                 >
// //                   {request?.employeeName}
// //                 </p>
// //                 <FieldChip field={request?.field} />
// //               </div>
// //             </div>
// //             <div className="flex items-center gap-2 text-[11px]">
// //               <span className="line-through" style={{ color: C.danger }}>
// //                 {request?.oldValue}
// //               </span>
// //               <ChevronRight size={9} color={C.textMuted} />
// //               <span className="font-semibold" style={{ color: C.textPrimary }}>
// //                 {request?.newValue}
// //               </span>
// //             </div>
// //           </div>

// //           <label
// //             className="block text-xs font-bold uppercase tracking-wider mb-2"
// //             style={{ color: C.textSecondary }}
// //           >
// //             Rejection Reason <span style={{ color: C.danger }}>*</span>
// //           </label>
// //           <textarea
// //             value={reason}
// //             onChange={(e) => setReason(e.target.value)}
// //             placeholder="Explain why this request is being rejected…"
// //             rows={4}
// //             className="w-full resize-none rounded-xl text-sm outline-none p-3"
// //             style={{
// //               border: `1.5px solid ${reason ? C.danger : C.border}`,
// //               color: C.textPrimary,
// //               fontFamily: "inherit",
// //               boxShadow: reason ? `0 0 0 3px ${C.dangerLight}` : "none",
// //               transition: "all 0.2s",
// //             }}
// //           />

// //           <div className="flex gap-3 mt-4">
// //             <button
// //               onClick={onClose}
// //               className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
// //               style={{
// //                 border: `1.5px solid ${C.border}`,
// //                 background: "transparent",
// //                 color: C.textSecondary,
// //                 cursor: "pointer",
// //               }}
// //             >
// //               Cancel
// //             </button>
// //             <motion.button
// //               whileHover={{ scale: 1.02 }}
// //               whileTap={{ scale: 0.97 }}
// //               onClick={() => reason.trim() && onConfirm(reason)}
// //               className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
// //               style={{
// //                 background: C.danger,
// //                 border: "none",
// //                 cursor: "pointer",
// //                 opacity: reason.trim() ? 1 : 0.5,
// //                 boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
// //               }}
// //             >
// //               Confirm Rejection
// //             </motion.button>
// //           </div>
// //         </div>
// //       </motion.div>
// //     </motion.div>
// //   );
// // }

// // /* ─────────────────────────────────────────
// //    DETAIL DRAWER
// // ───────────────────────────────────────── */
// // function DetailDrawer({ request, onApprove, onReject, onClose }) {
// //   if (!request) return null;
// //   const isPending = request.status === "pending";

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0 }}
// //       animate={{ opacity: 1 }}
// //       exit={{ opacity: 0 }}
// //       className="fixed inset-0 z-40 flex justify-end"
// //       style={{ background: "rgba(15,23,42,0.3)", backdropFilter: "blur(2px)" }}
// //       onClick={onClose}
// //     >
// //       <motion.div
// //         initial={{ x: "100%" }}
// //         animate={{ x: 0 }}
// //         exit={{ x: "100%" }}
// //         transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
// //         className="h-full w-full max-w-sm overflow-y-auto"
// //         style={{
// //           background: C.surface,
// //           boxShadow: "-8px 0 40px rgba(15,23,42,0.12)",
// //         }}
// //         onClick={(e) => e.stopPropagation()}
// //       >
// //         {/* Header */}
// //         <div
// //           className="sticky top-0 flex items-center justify-between px-5 py-4 z-10"
// //           style={{
// //             background: C.surface,
// //             borderBottom: `1px solid ${C.border}`,
// //           }}
// //         >
// //           <div className="flex items-center gap-2">
// //             <div
// //               className="w-7 h-7 rounded-lg flex items-center justify-center"
// //               style={{ background: C.primaryLight }}
// //             >
// //               <ClipboardList size={13} color={C.primary} />
// //             </div>
// //             <span
// //               className="text-sm font-bold"
// //               style={{ color: C.textPrimary }}
// //             >
// //               Request Details
// //             </span>
// //           </div>
// //           <motion.button
// //             whileHover={{ scale: 1.1, rotate: 90 }}
// //             onClick={onClose}
// //             style={{ background: "none", border: "none", cursor: "pointer" }}
// //           >
// //             <X size={16} color={C.textMuted} />
// //           </motion.button>
// //         </div>

// //         <div className="p-5 space-y-5">
// //           {/* Employee */}
// //           <div
// //             className="flex items-center gap-3 p-4 rounded-xl"
// //             style={{
// //               background: C.surfaceAlt,
// //               border: `1px solid ${C.border}`,
// //             }}
// //           >
// //             <Av
// //               initials={request.employeeInitials}
// //               dept={request.dept}
// //               size={44}
// //             />
// //             <div>
// //               <p className="text-sm font-bold" style={{ color: C.textPrimary }}>
// //                 {request.employeeName}
// //               </p>
// //               <p className="text-xs" style={{ color: C.textSecondary }}>
// //                 {request.dept}
// //               </p>
// //               <p
// //                 className="text-[10px] mt-1 font-mono"
// //                 style={{ color: C.textMuted }}
// //               >
// //                 {request.employeeId}
// //               </p>
// //             </div>
// //           </div>

// //           {/* Request meta */}
// //           <div className="space-y-3">
// //             <div>
// //               <p
// //                 className="text-[10px] font-bold uppercase tracking-wider mb-1"
// //                 style={{ color: C.textMuted }}
// //               >
// //                 Field Requested
// //               </p>
// //               <FieldChip field={request.field} />
// //             </div>
// //             <div>
// //               <p
// //                 className="text-[10px] font-bold uppercase tracking-wider mb-1"
// //                 style={{ color: C.textMuted }}
// //               >
// //                 Current Value
// //               </p>
// //               <p
// //                 className="text-sm font-medium"
// //                 style={{ color: C.textPrimary }}
// //               >
// //                 {request.oldValue}
// //               </p>
// //             </div>
// //             <div>
// //               <p
// //                 className="text-[10px] font-bold uppercase tracking-wider mb-1"
// //                 style={{ color: C.textMuted }}
// //               >
// //                 Requested New Value
// //               </p>
// //               <p className="text-sm font-bold" style={{ color: C.primary }}>
// //                 {request.newValue}
// //               </p>
// //             </div>
// //             <div>
// //               <p
// //                 className="text-[10px] font-bold uppercase tracking-wider mb-1"
// //                 style={{ color: C.textMuted }}
// //               >
// //                 Reason
// //               </p>
// //               <p
// //                 className="text-sm leading-relaxed"
// //                 style={{ color: C.textSecondary }}
// //               >
// //                 {request.reason}
// //               </p>
// //             </div>
// //           </div>

// //           {/* Dates */}
// //           <div className="grid grid-cols-2 gap-3">
// //             <div
// //               className="p-3 rounded-xl"
// //               style={{ background: C.surfaceAlt }}
// //             >
// //               <p
// //                 className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
// //                 style={{ color: C.textMuted }}
// //               >
// //                 Submitted
// //               </p>
// //               <p
// //                 className="text-xs font-semibold"
// //                 style={{ color: C.textPrimary }}
// //               >
// //                 {request.submittedDate}
// //               </p>
// //             </div>
// //             {request.reviewedDate && (
// //               <div
// //                 className="p-3 rounded-xl"
// //                 style={{ background: C.surfaceAlt }}
// //               >
// //                 <p
// //                   className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
// //                   style={{ color: C.textMuted }}
// //                 >
// //                   Reviewed
// //                 </p>
// //                 <p
// //                   className="text-xs font-semibold"
// //                   style={{ color: C.textPrimary }}
// //                 >
// //                   {request.reviewedDate}
// //                 </p>
// //               </div>
// //             )}
// //           </div>

// //           {/* Status */}
// //           <div
// //             className="flex items-center justify-between p-3 rounded-xl"
// //             style={{
// //               background: C.surfaceAlt,
// //               border: `1px solid ${C.border}`,
// //             }}
// //           >
// //             <span
// //               className="text-xs font-semibold"
// //               style={{ color: C.textSecondary }}
// //             >
// //               Status
// //             </span>
// //             <StatusChip status={request.status} />
// //           </div>

// //           {/* Rejection reason */}
// //           {request.status === "rejected" && request.rejectReason && (
// //             <div
// //               className="p-3 rounded-xl"
// //               style={{
// //                 background: C.dangerLight,
// //                 border: `1px solid ${C.danger}22`,
// //               }}
// //             >
// //               <p
// //                 className="text-[10px] font-bold uppercase tracking-wider mb-1"
// //                 style={{ color: C.danger }}
// //               >
// //                 Rejection Reason
// //               </p>
// //               <p className="text-xs" style={{ color: C.danger }}>
// //                 {request.rejectReason}
// //               </p>
// //               {request.reviewedBy && (
// //                 <p className="text-[10px] mt-1" style={{ color: C.textMuted }}>
// //                   — {request.reviewedBy}
// //                 </p>
// //               )}
// //             </div>
// //           )}

// //           {/* Actions */}
// //           {isPending && (
// //             <div className="space-y-2 pt-2">
// //               <motion.button
// //                 whileHover={{ scale: 1.02, y: -1 }}
// //                 whileTap={{ scale: 0.97 }}
// //                 onClick={() => {
// //                   onApprove(request.id);
// //                   onClose();
// //                 }}
// //                 className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
// //                 style={{
// //                   background: `linear-gradient(135deg,${C.success},#059669)`,
// //                   border: "none",
// //                   cursor: "pointer",
// //                   boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
// //                 }}
// //               >
// //                 <Check size={14} /> Approve & Update Profile
// //               </motion.button>
// //               <motion.button
// //                 whileHover={{ scale: 1.02 }}
// //                 whileTap={{ scale: 0.97 }}
// //                 onClick={() => {
// //                   onReject(request);
// //                   onClose();
// //                 }}
// //                 className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
// //                 style={{
// //                   background: C.dangerLight,
// //                   border: `1px solid ${C.danger}33`,
// //                   color: C.danger,
// //                   cursor: "pointer",
// //                 }}
// //               >
// //                 <X size={14} /> Reject Request
// //               </motion.button>
// //             </div>
// //           )}
// //         </div>
// //       </motion.div>
// //     </motion.div>
// //   );
// // }

// // /* ═══════════════════════════════════════════════════════════
// //    MAIN PAGE
// // ═══════════════════════════════════════════════════════════ */
// // export default function ProfileChangeRequests() {
// //   const navigate = useNavigate();

// //   const [sidebarOpen, setSidebarOpen] = useState(true);
// //   const [collapsed, setCollapsed] = useState(false);
// //   const [loading, setLoading] = useState(true);

// //   /* ── Data state (mutates on approve/reject) ── */
// //   const [requests, setRequests] = useState(INITIAL_REQUESTS);
// //   const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
// //   const [auditLog, setAuditLog] = useState([]);

// //   /* ── UI state ── */
// //   const [search, setSearch] = useState("");
// //   const [filterStatus, setFilterStatus] = useState("all");
// //   const [filterDept, setFilterDept] = useState("");
// //   const [sortCol, setSortCol] = useState("submittedDate");
// //   const [sortDir, setSortDir] = useState("desc");
// //   const [drawer, setDrawer] = useState(null); // selected request
// //   const [rejectTarget, setRejectTarget] = useState(null);
// //   const [toast, setToast] = useState(null);

// //   useEffect(() => {
// //     const t = setTimeout(() => setLoading(false), 1000);
// //     return () => clearTimeout(t);
// //   }, []);

// //   /* ── Filtered + sorted ── */
// //   const filtered = useMemo(() => {
// //     let list = requests;
// //     if (search) {
// //       const q = search.toLowerCase();
// //       list = list.filter(
// //         (r) =>
// //           r.employeeName.toLowerCase().includes(q) ||
// //           r.field.toLowerCase().includes(q) ||
// //           r.reason.toLowerCase().includes(q),
// //       );
// //     }
// //     if (filterStatus !== "all")
// //       list = list.filter((r) => r.status === filterStatus);
// //     if (filterDept) list = list.filter((r) => r.dept === filterDept);

// //     return [...list].sort((a, b) => {
// //       const av = a[sortCol] || "",
// //         bv = b[sortCol] || "";
// //       return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
// //     });
// //   }, [requests, search, filterStatus, filterDept, sortCol, sortDir]);

// //   const handleSort = (col) => {
// //     if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
// //     else {
// //       setSortCol(col);
// //       setSortDir("desc");
// //     }
// //   };

// //   /* ── Stats ── */
// //   const stats = useMemo(
// //     () => ({
// //       total: requests.length,
// //       pending: requests.filter((r) => r.status === "pending").length,
// //       approved: requests.filter((r) => r.status === "approved").length,
// //       rejected: requests.filter((r) => r.status === "rejected").length,
// //     }),
// //     [requests],
// //   );

// //   /* ── APPROVE ── */
// //   const handleApprove = useCallback(
// //     (reqId) => {
// //       const req = requests.find((r) => r.id === reqId);
// //       if (!req) return;

// //       const now = new Date();
// //       const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

// //       // 1. Update the request status
// //       setRequests((prev) =>
// //         prev.map((r) =>
// //           r.id === reqId
// //             ? {
// //                 ...r,
// //                 status: "approved",
// //                 reviewedBy: ADMIN.name,
// //                 reviewedDate: ts,
// //                 rejectReason: null,
// //               }
// //             : r,
// //         ),
// //       );

// //       // 2. Apply change to employee profile
// //       setEmployees((prev) =>
// //         prev.map((e) => {
// //           if (e.id !== req.employeeId) return e;
// //           return { ...e, [req.fieldKey]: req.newValue };
// //         }),
// //       );

// //       // 3. Append to audit log
// //       const entry = {
// //         id: `AUD-${Date.now()}`,
// //         action: `Profile change approved — ${req.field}`,
// //         actor: ADMIN.name,
// //         actorId: ADMIN.id,
// //         entityId: req.employeeId,
// //         entityName: req.employeeName,
// //         timestamp: ts,
// //         field: req.fieldKey,
// //         from: req.oldValue,
// //         to: req.newValue,
// //       };
// //       setAuditLog((prev) => [entry, ...prev]);

// //       setToast({
// //         msg: `${req.field} updated for ${req.employeeName}`,
// //         type: "success",
// //       });
// //       setDrawer(null);
// //     },
// //     [requests],
// //   );

// //   /* ── REJECT ── */
// //   const handleRejectConfirm = useCallback(
// //     (reason) => {
// //       const req = rejectTarget;
// //       if (!req) return;

// //       const now = new Date();
// //       const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

// //       setRequests((prev) =>
// //         prev.map((r) =>
// //           r.id === req.id
// //             ? {
// //                 ...r,
// //                 status: "rejected",
// //                 reviewedBy: ADMIN.name,
// //                 reviewedDate: ts,
// //                 rejectReason: reason,
// //               }
// //             : r,
// //         ),
// //       );

// //       const entry = {
// //         id: `AUD-${Date.now()}`,
// //         action: `Profile change rejected — ${req.field}`,
// //         actor: ADMIN.name,
// //         actorId: ADMIN.id,
// //         entityId: req.employeeId,
// //         entityName: req.employeeName,
// //         timestamp: ts,
// //         field: req.fieldKey,
// //         from: req.oldValue,
// //         to: req.newValue,
// //       };
// //       setAuditLog((prev) => [entry, ...prev]);

// //       setToast({
// //         msg: `Request rejected for ${req.employeeName}`,
// //         type: "error",
// //       });
// //       setRejectTarget(null);
// //     },
// //     [rejectTarget],
// //   );

// //   const COLS = [
// //     { key: "employeeName", label: "Employee", sortable: true },
// //     { key: "field", label: "Field Requested", sortable: true },
// //     { key: "oldValue", label: "Current Value", sortable: false },
// //     { key: "newValue", label: "New Value", sortable: false },
// //     { key: "reason", label: "Reason", sortable: false },
// //     { key: "submittedDate", label: "Submitted", sortable: true },
// //     { key: "status", label: "Status", sortable: true },
// //     { key: "actions", label: "", sortable: false },
// //   ];

// //   const STATUS_FILTERS = [
// //     { key: "all", label: "All", count: stats.total },
// //     { key: "pending", label: "Pending", count: stats.pending },
// //     { key: "approved", label: "Approved", count: stats.approved },
// //     { key: "rejected", label: "Rejected", count: stats.rejected },
// //   ];

// //   /* ════ RENDER ════ */
// //   return (
// //     <div
// //       className="min-h-screen"
// //       style={{
// //         background: C.bg,
// //         fontFamily: "'DM Sans',sans-serif",
// //         color: C.textPrimary,
// //       }}
// //     >
// //       <div className="flex h-screen overflow-hidden">
// //         {/* Sidebar */}
// //         <AdminSideNavbar
// //           sidebarOpen={sidebarOpen}
// //           collapsed={collapsed}
// //           setCollapsed={setCollapsed}
// //           ADMIN={ADMIN}
// //           pendingApprovals={stats.pending}
// //         />

// //         {/* Main */}
// //         <div className="flex-1 flex flex-col overflow-hidden min-w-0">
// //           {/* Top nav */}
// //           <header
// //             className="shrink-0 h-[58px] flex items-center px-5 gap-3 z-10"
// //             style={{
// //               background: "rgba(240,242,248,0.9)",
// //               backdropFilter: "blur(12px)",
// //               borderBottom: `1px solid ${C.border}`,
// //             }}
// //           >
// //             <motion.button
// //               whileHover={{ scale: 1.05 }}
// //               whileTap={{ scale: 0.95 }}
// //               onClick={() => setSidebarOpen((p) => !p)}
// //               className="w-9 h-9 rounded-xl hidden md:flex items-center justify-center"
// //               style={{
// //                 background: C.surface,
// //                 border: `1px solid ${C.border}`,
// //                 cursor: "pointer",
// //               }}
// //             >
// //               <Menu size={15} color={C.textSecondary} />
// //             </motion.button>

// //             <div
// //               className="flex items-center gap-1.5 text-xs"
// //               style={{ color: C.textSecondary }}
// //             >
// //               <span>Admin</span>
// //               <ChevronRight size={11} />
// //               <span>Approvals</span>
// //               <ChevronRight size={11} />
// //               <span className="font-semibold" style={{ color: C.textPrimary }}>
// //                 Profile Changes
// //               </span>
// //             </div>

// //             <div className="ml-auto flex items-center gap-2.5">
// //               {stats.pending > 0 && (
// //                 <motion.div
// //                   initial={{ scale: 0 }}
// //                   animate={{ scale: 1 }}
// //                   className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold"
// //                   style={{ background: C.warningLight, color: C.warning }}
// //                 >
// //                   <Clock size={11} /> {stats.pending} Pending
// //                 </motion.div>
// //               )}
// //               <div
// //                 className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
// //                 style={{
// //                   background: "linear-gradient(135deg,#6366F1,#06B6D4)",
// //                 }}
// //               >
// //                 {ADMIN.initials}
// //               </div>
// //             </div>
// //           </header>

// //           {/* Content */}
// //           <main className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
// //             {/* ── Page header ── */}
// //             <motion.div
// //               variants={fadeUp}
// //               initial="hidden"
// //               animate="visible"
// //               custom={0}
// //               className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
// //             >
// //               <div>
// //                 <h1
// //                   className="text-2xl font-bold"
// //                   style={{
// //                     color: C.textPrimary,
// //                     fontFamily: "Sora,sans-serif",
// //                   }}
// //                 >
// //                   Profile Change Requests
// //                 </h1>
// //                 <p
// //                   className="text-sm mt-0.5"
// //                   style={{ color: C.textSecondary }}
// //                 >
// //                   Review and action employee-submitted profile update requests
// //                 </p>
// //               </div>
// //               <motion.button
// //                 whileHover={{ scale: 1.02 }}
// //                 whileTap={{ scale: 0.97 }}
// //                 onClick={() => {
// //                   setSearch("");
// //                   setFilterStatus("all");
// //                   setFilterDept("");
// //                 }}
// //                 className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
// //                 style={{
// //                   background: C.surface,
// //                   border: `1px solid ${C.border}`,
// //                   color: C.textSecondary,
// //                   cursor: "pointer",
// //                 }}
// //               >
// //                 <RefreshCw size={11} /> Reset Filters
// //               </motion.button>
// //             </motion.div>

// //             {/* ── Stat cards ── */}
// //             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
// //               {[
// //                 {
// //                   label: "Total Requests",
// //                   value: stats.total,
// //                   color: C.primary,
// //                   bg: C.primaryLight,
// //                   icon: ClipboardList,
// //                 },
// //                 {
// //                   label: "Pending",
// //                   value: stats.pending,
// //                   color: C.warning,
// //                   bg: C.warningLight,
// //                   icon: Clock,
// //                 },
// //                 {
// //                   label: "Approved",
// //                   value: stats.approved,
// //                   color: C.success,
// //                   bg: C.successLight,
// //                   icon: CheckCircle2,
// //                 },
// //                 {
// //                   label: "Rejected",
// //                   value: stats.rejected,
// //                   color: C.danger,
// //                   bg: C.dangerLight,
// //                   icon: XCircle,
// //                 },
// //               ].map(({ label, value, color, bg, icon: Icon }, i) => (
// //                 <motion.div
// //                   key={label}
// //                   variants={fadeUp}
// //                   initial="hidden"
// //                   animate="visible"
// //                   custom={i + 1}
// //                 >
// //                   <Card>
// //                     <div className="p-4">
// //                       <div className="flex items-center justify-between mb-2">
// //                         <div
// //                           className="w-8 h-8 rounded-xl flex items-center justify-center"
// //                           style={{ background: bg }}
// //                         >
// //                           <Icon size={15} color={color} />
// //                         </div>
// //                       </div>
// //                       <p
// //                         className="text-2xl font-bold"
// //                         style={{ color, fontFamily: "Sora,sans-serif" }}
// //                       >
// //                         {value}
// //                       </p>
// //                       <p
// //                         className="text-xs mt-0.5 font-medium"
// //                         style={{ color: C.textSecondary }}
// //                       >
// //                         {label}
// //                       </p>
// //                     </div>
// //                   </Card>
// //                 </motion.div>
// //               ))}
// //             </div>

// //             {/* ── Filter bar ── */}
// //             <motion.div
// //               variants={fadeUp}
// //               initial="hidden"
// //               animate="visible"
// //               custom={5}
// //             >
// //               <Card className="p-4">
// //                 <div className="flex flex-wrap items-center gap-3">
// //                   {/* Search */}
// //                   <div className="relative flex-1 min-w-[200px]">
// //                     <Search
// //                       size={13}
// //                       className="absolute left-3 top-1/2 -translate-y-1/2"
// //                       color={C.textMuted}
// //                     />
// //                     <input
// //                       value={search}
// //                       onChange={(e) => setSearch(e.target.value)}
// //                       placeholder="Search by employee name or field…"
// //                       className="w-full pl-9 pr-3 py-2 text-xs rounded-xl outline-none"
// //                       style={{
// //                         background: C.surfaceAlt,
// //                         border: `1.5px solid ${search ? C.primary : C.border}`,
// //                         color: C.textPrimary,
// //                         boxShadow: search
// //                           ? `0 0 0 3px ${C.primaryLight}`
// //                           : "none",
// //                         transition: "all 0.2s",
// //                       }}
// //                     />
// //                   </div>

// //                   {/* Status tabs */}
// //                   <div
// //                     className="flex gap-1 p-1 rounded-xl"
// //                     style={{
// //                       background: C.surfaceAlt,
// //                       border: `1px solid ${C.border}`,
// //                     }}
// //                   >
// //                     {STATUS_FILTERS.map(({ key, label, count }) => (
// //                       <button
// //                         key={key}
// //                         onClick={() => setFilterStatus(key)}
// //                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
// //                         style={{
// //                           background:
// //                             filterStatus === key ? C.primary : "transparent",
// //                           color:
// //                             filterStatus === key ? "#fff" : C.textSecondary,
// //                           border: "none",
// //                           cursor: "pointer",
// //                           boxShadow:
// //                             filterStatus === key
// //                               ? "0 2px 6px rgba(79,70,229,0.25)"
// //                               : "none",
// //                         }}
// //                       >
// //                         {label}
// //                         <span
// //                           className="px-1 py-0.5 rounded-md text-[9px] font-bold"
// //                           style={{
// //                             background:
// //                               filterStatus === key
// //                                 ? "rgba(255,255,255,0.2)"
// //                                 : C.border,
// //                             color: filterStatus === key ? "#fff" : C.textMuted,
// //                           }}
// //                         >
// //                           {count}
// //                         </span>
// //                       </button>
// //                     ))}
// //                   </div>

// //                   {/* Dept filter */}
// //                   <select
// //                     value={filterDept}
// //                     onChange={(e) => setFilterDept(e.target.value)}
// //                     className="px-3 py-2 rounded-xl text-xs font-semibold outline-none"
// //                     style={{
// //                       background: filterDept ? C.primaryLight : C.surface,
// //                       border: `1.5px solid ${filterDept ? C.primary : C.border}`,
// //                       color: filterDept ? C.primary : C.textSecondary,
// //                       cursor: "pointer",
// //                     }}
// //                   >
// //                     <option value="">All Departments</option>
// //                     {DEPARTMENTS.map((d) => (
// //                       <option key={d} value={d}>
// //                         {d}
// //                       </option>
// //                     ))}
// //                   </select>
// //                 </div>
// //               </Card>
// //             </motion.div>

// //             {/* ── TABLE ── */}
// //             <motion.div
// //               variants={fadeUp}
// //               initial="hidden"
// //               animate="visible"
// //               custom={6}
// //             >
// //               <Card>
// //                 <div className="overflow-x-auto">
// //                   <table
// //                     className="w-full"
// //                     style={{ borderCollapse: "collapse" }}
// //                   >
// //                     <thead>
// //                       <tr
// //                         style={{
// //                           background: C.surfaceAlt,
// //                           borderBottom: `2px solid ${C.border}`,
// //                         }}
// //                       >
// //                         {COLS.map((col) => (
// //                           <th
// //                             key={col.key}
// //                             className="px-4 py-3.5 text-left"
// //                             style={{
// //                               color: C.textMuted,
// //                               fontSize: 10,
// //                               fontWeight: 700,
// //                               textTransform: "uppercase",
// //                               letterSpacing: "0.06em",
// //                               whiteSpace: "nowrap",
// //                             }}
// //                           >
// //                             {col.sortable ? (
// //                               <button
// //                                 onClick={() => handleSort(col.key)}
// //                                 className="flex items-center gap-1.5"
// //                                 style={{
// //                                   background: "none",
// //                                   border: "none",
// //                                   cursor: "pointer",
// //                                   color:
// //                                     sortCol === col.key
// //                                       ? C.primary
// //                                       : C.textMuted,
// //                                   fontWeight: 700,
// //                                   fontSize: 10,
// //                                   textTransform: "uppercase",
// //                                   letterSpacing: "0.06em",
// //                                 }}
// //                               >
// //                                 {col.label}{" "}
// //                                 <SortIcon
// //                                   col={col.key}
// //                                   sortCol={sortCol}
// //                                   sortDir={sortDir}
// //                                 />
// //                               </button>
// //                             ) : (
// //                               col.label
// //                             )}
// //                           </th>
// //                         ))}
// //                       </tr>
// //                     </thead>

// //                     <tbody>
// //                       {loading ? (
// //                         Array.from({ length: 6 }).map((_, i) => (
// //                           <tr key={i}>
// //                             {[160, 140, 120, 120, 180, 90, 80, 80].map(
// //                               (w, j) => (
// //                                 <td key={j} className="px-4 py-4">
// //                                   <Skel w={w} h={14} />
// //                                 </td>
// //                               ),
// //                             )}
// //                           </tr>
// //                         ))
// //                       ) : filtered.length === 0 ? (
// //                         <tr>
// //                           <td colSpan={8} className="py-20 text-center">
// //                             <ClipboardList
// //                               size={44}
// //                               color={C.textMuted}
// //                               className="mx-auto mb-3"
// //                             />
// //                             <p
// //                               className="font-bold text-base"
// //                               style={{ color: C.textSecondary }}
// //                             >
// //                               No requests found
// //                             </p>
// //                             <p
// //                               className="text-sm mt-1"
// //                               style={{ color: C.textMuted }}
// //                             >
// //                               Try adjusting your search or filters.
// //                             </p>
// //                           </td>
// //                         </tr>
// //                       ) : (
// //                         filtered.map((req, i) => {
// //                           const isPending = req.status === "pending";
// //                           return (
// //                             <motion.tr
// //                               key={req.id}
// //                               initial={{ opacity: 0, y: 4 }}
// //                               animate={{ opacity: 1, y: 0 }}
// //                               transition={{ delay: i * 0.025, duration: 0.26 }}
// //                               onClick={() => setDrawer(req)}
// //                               style={{
// //                                 borderBottom: `1px solid ${C.border}`,
// //                                 cursor: "pointer",
// //                                 transition: "background 0.12s",
// //                               }}
// //                               onMouseEnter={(e) =>
// //                                 (e.currentTarget.style.background =
// //                                   C.surfaceHover)
// //                               }
// //                               onMouseLeave={(e) =>
// //                                 (e.currentTarget.style.background =
// //                                   "transparent")
// //                               }
// //                             >
// //                               {/* Employee */}
// //                               <td className="px-4 py-3.5">
// //                                 <div className="flex items-center gap-3">
// //                                   <Av
// //                                     initials={req.employeeInitials}
// //                                     dept={req.dept}
// //                                     size={34}
// //                                   />
// //                                   <div>
// //                                     <p
// //                                       className="text-sm font-semibold"
// //                                       style={{ color: C.textPrimary }}
// //                                     >
// //                                       {req.employeeName}
// //                                     </p>
// //                                     <p
// //                                       className="text-[10px]"
// //                                       style={{ color: C.textMuted }}
// //                                     >
// //                                       {req.dept}
// //                                     </p>
// //                                   </div>
// //                                 </div>
// //                               </td>

// //                               {/* Field */}
// //                               <td className="px-4 py-3.5">
// //                                 <FieldChip field={req.field} />
// //                               </td>

// //                               {/* Old value */}
// //                               <td className="px-4 py-3.5">
// //                                 <p
// //                                   className="text-xs max-w-[120px] truncate"
// //                                   style={{ color: C.textSecondary }}
// //                                 >
// //                                   {req.oldValue}
// //                                 </p>
// //                               </td>

// //                               {/* New value */}
// //                               <td className="px-4 py-3.5">
// //                                 <p
// //                                   className="text-xs font-semibold max-w-[120px] truncate"
// //                                   style={{ color: C.primary }}
// //                                 >
// //                                   {req.newValue}
// //                                 </p>
// //                               </td>

// //                               {/* Reason */}
// //                               <td className="px-4 py-3.5">
// //                                 <p
// //                                   className="text-xs max-w-[180px] truncate"
// //                                   style={{ color: C.textSecondary }}
// //                                 >
// //                                   {req.reason}
// //                                 </p>
// //                               </td>

// //                               {/* Submitted date */}
// //                               <td className="px-4 py-3.5">
// //                                 <p
// //                                   className="text-xs"
// //                                   style={{ color: C.textMuted }}
// //                                 >
// //                                   {req.submittedDate}
// //                                 </p>
// //                               </td>

// //                               {/* Status */}
// //                               <td className="px-4 py-3.5">
// //                                 <StatusChip status={req.status} />
// //                               </td>

// //                               {/* Actions */}
// //                               <td
// //                                 className="px-4 py-3.5"
// //                                 onClick={(e) => e.stopPropagation()}
// //                               >
// //                                 {isPending ? (
// //                                   <div className="flex items-center gap-1.5">
// //                                     <motion.button
// //                                       whileHover={{ scale: 1.08 }}
// //                                       whileTap={{ scale: 0.92 }}
// //                                       onClick={() => handleApprove(req.id)}
// //                                       className="w-7 h-7 rounded-lg flex items-center justify-center"
// //                                       style={{
// //                                         background: C.successLight,
// //                                         border: `1px solid ${C.success}33`,
// //                                         cursor: "pointer",
// //                                       }}
// //                                       title="Approve"
// //                                     >
// //                                       <Check size={12} color={C.success} />
// //                                     </motion.button>
// //                                     <motion.button
// //                                       whileHover={{ scale: 1.08 }}
// //                                       whileTap={{ scale: 0.92 }}
// //                                       onClick={() => setRejectTarget(req)}
// //                                       className="w-7 h-7 rounded-lg flex items-center justify-center"
// //                                       style={{
// //                                         background: C.dangerLight,
// //                                         border: `1px solid ${C.danger}33`,
// //                                         cursor: "pointer",
// //                                       }}
// //                                       title="Reject"
// //                                     >
// //                                       <X size={12} color={C.danger} />
// //                                     </motion.button>
// //                                     <motion.button
// //                                       whileHover={{ scale: 1.08 }}
// //                                       whileTap={{ scale: 0.92 }}
// //                                       onClick={() => setDrawer(req)}
// //                                       className="w-7 h-7 rounded-lg flex items-center justify-center"
// //                                       style={{
// //                                         background: C.primaryLight,
// //                                         border: `1px solid ${C.primary}22`,
// //                                         cursor: "pointer",
// //                                       }}
// //                                       title="View details"
// //                                     >
// //                                       <Eye size={12} color={C.primary} />
// //                                     </motion.button>
// //                                   </div>
// //                                 ) : (
// //                                   <motion.button
// //                                     whileHover={{ scale: 1.08 }}
// //                                     whileTap={{ scale: 0.92 }}
// //                                     onClick={() => setDrawer(req)}
// //                                     className="w-7 h-7 rounded-lg flex items-center justify-center"
// //                                     style={{
// //                                       background: C.primaryLight,
// //                                       border: `1px solid ${C.primary}22`,
// //                                       cursor: "pointer",
// //                                     }}
// //                                   >
// //                                     <Eye size={12} color={C.primary} />
// //                                   </motion.button>
// //                                 )}
// //                               </td>
// //                             </motion.tr>
// //                           );
// //                         })
// //                       )}
// //                     </tbody>
// //                   </table>
// //                 </div>

// //                 {/* Footer */}
// //                 {!loading && filtered.length > 0 && (
// //                   <div
// //                     className="px-5 py-3 flex items-center justify-between"
// //                     style={{ borderTop: `1px solid ${C.border}` }}
// //                   >
// //                     <p className="text-xs" style={{ color: C.textMuted }}>
// //                       Showing{" "}
// //                       <span
// //                         className="font-semibold"
// //                         style={{ color: C.textPrimary }}
// //                       >
// //                         {filtered.length}
// //                       </span>{" "}
// //                       of{" "}
// //                       <span
// //                         className="font-semibold"
// //                         style={{ color: C.textPrimary }}
// //                       >
// //                         {stats.total}
// //                       </span>{" "}
// //                       requests
// //                     </p>
// //                     {stats.pending > 0 && (
// //                       <p
// //                         className="text-xs font-semibold"
// //                         style={{ color: C.warning }}
// //                       >
// //                         {stats.pending} pending action
// //                         {stats.pending !== 1 ? "s" : ""}
// //                       </p>
// //                     )}
// //                   </div>
// //                 )}
// //               </Card>
// //             </motion.div>

// //             {/* ── Recent audit log ── */}
// //             {auditLog.length > 0 && (
// //               <motion.div
// //                 variants={fadeUp}
// //                 initial="hidden"
// //                 animate="visible"
// //                 custom={7}
// //               >
// //                 <Card>
// //                   <div
// //                     className="flex items-center gap-2 px-5 py-4"
// //                     style={{ borderBottom: `1px solid ${C.border}` }}
// //                   >
// //                     <div
// //                       className="w-7 h-7 rounded-lg flex items-center justify-center"
// //                       style={{ background: C.primaryLight }}
// //                     >
// //                       <History size={13} color={C.primary} />
// //                     </div>
// //                     <span
// //                       className="text-sm font-bold"
// //                       style={{ color: C.textPrimary }}
// //                     >
// //                       Recent Actions (this session)
// //                     </span>
// //                   </div>
// //                   <div className="p-4 space-y-3">
// //                     {auditLog.slice(0, 5).map((entry, i) => (
// //                       <motion.div
// //                         key={entry.id}
// //                         initial={{ opacity: 0, x: -8 }}
// //                         animate={{ opacity: 1, x: 0 }}
// //                         transition={{ delay: i * 0.05 }}
// //                         className="flex items-start gap-3 pb-3"
// //                         style={{
// //                           borderBottom:
// //                             i < Math.min(auditLog.length, 5) - 1
// //                               ? `1px solid ${C.border}`
// //                               : "none",
// //                         }}
// //                       >
// //                         <div
// //                           className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
// //                           style={{
// //                             background: entry.action.includes("approved")
// //                               ? C.successLight
// //                               : C.dangerLight,
// //                           }}
// //                         >
// //                           {entry.action.includes("approved") ? (
// //                             <Check size={10} color={C.success} />
// //                           ) : (
// //                             <X size={10} color={C.danger} />
// //                           )}
// //                         </div>
// //                         <div className="flex-1 min-w-0">
// //                           <p
// //                             className="text-xs font-semibold"
// //                             style={{ color: C.textPrimary }}
// //                           >
// //                             {entry.action}
// //                           </p>
// //                           <p
// //                             className="text-[10px] mt-0.5"
// //                             style={{ color: C.textSecondary }}
// //                           >
// //                             {entry.entityName} ·{" "}
// //                             <span style={{ color: C.textMuted }}>
// //                               {entry.timestamp}
// //                             </span>
// //                           </p>
// //                           {entry.field && (
// //                             <p
// //                               className="text-[10px] mt-0.5"
// //                               style={{ color: C.textSecondary }}
// //                             >
// //                               <span style={{ color: C.danger }}>
// //                                 {entry.from}
// //                               </span>
// //                               {" → "}
// //                               <span style={{ color: C.success }}>
// //                                 {entry.to}
// //                               </span>
// //                             </p>
// //                           )}
// //                         </div>
// //                       </motion.div>
// //                     ))}
// //                   </div>
// //                 </Card>
// //               </motion.div>
// //             )}

// //             <div className="h-4" />
// //           </main>
// //         </div>
// //       </div>

// //       {/* ── DETAIL DRAWER ── */}
// //       <AnimatePresence>
// //         {drawer && (
// //           <DetailDrawer
// //             request={drawer}
// //             onApprove={handleApprove}
// //             onReject={(req) => {
// //               setRejectTarget(req);
// //               setDrawer(null);
// //             }}
// //             onClose={() => setDrawer(null)}
// //           />
// //         )}
// //       </AnimatePresence>

// //       {/* ── REJECT MODAL ── */}
// //       <AnimatePresence>
// //         {rejectTarget && (
// //           <RejectModal
// //             request={rejectTarget}
// //             onConfirm={handleRejectConfirm}
// //             onClose={() => setRejectTarget(null)}
// //           />
// //         )}
// //       </AnimatePresence>

// //       {/* ── TOAST ── */}
// //       <AnimatePresence>
// //         {toast && (
// //           <Toast
// //             msg={toast.msg}
// //             type={toast.type}
// //             onDone={() => setToast(null)}
// //           />
// //         )}
// //       </AnimatePresence>
// //     </div>
// //   );
// // }


// // src/admin/approvals/ProfileChangeRequests.jsx
// // Route: /admin/approvals/profile
// // Fully API-connected — reads from approvalApi filtering type=profile_change.

// import { useState, useEffect, useMemo, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import AdminSideNavbar from "../AdminSideNavbar";
// import {
//   ClipboardList, Search, Check, X, ChevronRight, Menu, Bell,
//   CheckCircle2, XCircle, Clock, Eye, ArrowUpDown, ArrowUp, ArrowDown,
//   RefreshCw, UserCog, History, SlidersHorizontal, AlertTriangle, Loader2,
// } from "lucide-react";
// import C from "../../styles/colors";
// import { approvalApi } from "../../api/service/approvalApi";

// // ── Shared dept colors for avatars ────────────────────────────
// const DEPT_COLORS = {
//   "Engineering":      "#6366F1",
//   "Product & Design": "#06B6D4",
//   "Finance":          "#10B981",
//   "Human Resources":  "#F59E0B",
//   "Operations":       "#EC4899",
//   "Marketing":        "#8B5CF6",
//   "Legal":            "#EF4444",
//   "Sales":            "#F97316",
// };

// const fadeUp = {
//   hidden:  { opacity: 0, y: 12 },
//   visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.36 } }),
// };

// // ── Atoms ─────────────────────────────────────────────────────
// function Card({ children, className = "", style = {} }) {
//   return (
//     <div className={`rounded-2xl ${className}`}
//       style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(15,23,42,0.04)", ...style }}>
//       {children}
//     </div>
//   );
// }

// function Av({ name, dept, size = 36 }) {
//   const color = DEPT_COLORS[dept] ?? C.primary;
//   const initials = name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "??";
//   return (
//     <div className="flex items-center justify-center text-white font-bold shrink-0"
//       style={{ width: size, height: size, borderRadius: size * 0.28, fontSize: size * 0.34,
//         background: `linear-gradient(135deg,${color},${color}bb)`, boxShadow: `0 2px 8px ${color}33` }}>
//       {initials}
//     </div>
//   );
// }

// function StatusChip({ status }) {
//   const map = {
//     pending:  { color: C.warning, bg: C.warningLight, icon: Clock,        label: "Pending"  },
//     approved: { color: C.success, bg: C.successLight, icon: CheckCircle2, label: "Approved" },
//     rejected: { color: C.danger,  bg: C.dangerLight,  icon: XCircle,      label: "Rejected" },
//   };
//   const { color, bg, icon: Icon, label } = map[status?.toLowerCase()] ?? map.pending;
//   return (
//     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
//       style={{ background: bg, color }}>
//       <Icon size={10} />{label}
//     </span>
//   );
// }

// function Toast({ msg, type, onDone }) {
//   useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
//   const Icon = type === "success" ? CheckCircle2 : XCircle;
//   const color = type === "success" ? C.success : C.danger;
//   return (
//     <motion.div initial={{ opacity: 0, y: 40, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }}
//       exit={{ opacity: 0, y: 40, x: "-50%" }}
//       className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl"
//       style={{ background: C.navy, boxShadow: "0 12px 40px rgba(15,23,42,0.35)", minWidth: 260 }}>
//       <Icon size={16} color={color} />
//       <span className="text-white text-sm font-semibold">{msg}</span>
//     </motion.div>
//   );
// }

// // ── Reject Modal ──────────────────────────────────────────────
// function RejectModal({ request, onConfirm, onClose }) {
//   const [reason, setReason] = useState("");
//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//       className="fixed inset-0 z-50 flex items-center justify-center p-5"
//       style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
//       onClick={onClose}>
//       <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
//         transition={{ type: "spring", stiffness: 260, damping: 24 }}
//         className="w-full max-w-md rounded-2xl overflow-hidden"
//         style={{ background: C.surface, boxShadow: "0 24px 64px rgba(15,23,42,0.2)" }}
//         onClick={(e) => e.stopPropagation()}>
//         <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
//           <div className="flex items-center gap-2">
//             <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: C.dangerLight }}>
//               <XCircle size={15} color={C.danger} />
//             </div>
//             <p className="font-bold text-sm" style={{ color: C.textPrimary }}>Reject Profile Change</p>
//           </div>
//           <button onClick={onClose} className="p-1.5 rounded-lg" style={{ background: C.surfaceAlt }}>
//             <X size={13} color={C.textMuted} />
//           </button>
//         </div>
//         <div className="p-5 space-y-4">
//           <p className="text-xs" style={{ color: C.textSecondary }}>
//             Rejecting change request for <strong>{request?.employee_name}</strong>
//           </p>
//           <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4}
//             placeholder="Provide a reason for rejection (required)..."
//             className="w-full rounded-xl border px-3 py-2 text-sm outline-none resize-none"
//             style={{ borderColor: C.border, background: C.surfaceAlt, color: C.textPrimary }} />
//           <div className="flex gap-3">
//             <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
//               style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.textSecondary }}>Cancel</button>
//             <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
//               onClick={() => { if (reason.trim()) onConfirm(reason); }}
//               disabled={!reason.trim()}
//               className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
//               style={{ background: C.danger, opacity: reason.trim() ? 1 : 0.5 }}>
//               Confirm Rejection
//             </motion.button>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ── Detail Drawer ─────────────────────────────────────────────
// function DetailDrawer({ request, onApprove, onReject, onClose, actioning }) {
//   const meta     = request.metadata ?? request.requested_changes ?? {};
//   const isPending = request.status?.toLowerCase() === "pending";

//   return (
//     <div className="fixed inset-0 z-50 flex justify-end">
//       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//         className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
//       <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
//         transition={{ type: "spring", stiffness: 300, damping: 30 }}
//         className="relative w-full max-w-lg h-full overflow-y-auto"
//         style={{ background: C.surface, boxShadow: "-8px 0 40px rgba(0,0,0,0.15)" }}>

//         <div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
//           style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: C.primaryLight }}>
//               <UserCog size={15} color={C.primary} />
//             </div>
//             <div>
//               <p className="font-bold text-sm" style={{ color: C.textPrimary }}>Profile Change Request</p>
//               <p className="text-[10px] font-mono" style={{ color: C.textMuted }}>{request.id?.slice(0, 8)}…</p>
//             </div>
//           </div>
//           <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
//             style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
//             <X size={14} color={C.textSecondary} />
//           </button>
//         </div>

//         <div className="p-6 space-y-5">
//           {/* Employee */}
//           <div className="flex items-center gap-3">
//             <Av name={request.employee_name} dept={request.department_name} size={44} />
//             <div>
//               <p className="font-bold" style={{ color: C.textPrimary }}>{request.employee_name}</p>
//               <p className="text-xs" style={{ color: C.textMuted }}>{request.department_name} · {request.employee_code}</p>
//             </div>
//             <div className="ml-auto"><StatusChip status={request.status} /></div>
//           </div>

//           {/* Changed fields */}
//           {Object.keys(meta).length > 0 && (
//             <div>
//               <p className="text-xs font-semibold mb-2" style={{ color: C.textSecondary }}>Requested Changes</p>
//               <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
//                 {Object.entries(meta).map(([field, val], i) => {
//                   const current = request.current_snapshot?.[field];
//                   return (
//                     <div key={field}
//                       style={{ borderBottom: i < Object.keys(meta).length - 1 ? `1px solid ${C.border}` : "none", background: i % 2 === 0 ? C.surface : C.surfaceAlt }}>
//                       <div className="px-4 py-2.5">
//                         <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: C.textMuted }}>
//                           {field.replace(/_/g, " ")}
//                         </p>
//                         <div className="flex items-center gap-2 flex-wrap">
//                           {current !== undefined && (
//                             <span className="text-[11px] px-2 py-0.5 rounded-md line-through"
//                               style={{ background: C.dangerLight, color: C.danger }}>{String(current)}</span>
//                           )}
//                           {current !== undefined && <span style={{ color: C.textMuted }}>→</span>}
//                           <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold"
//                             style={{ background: C.successLight, color: C.success }}>{String(val)}</span>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {/* Timestamps */}
//           <div className="grid grid-cols-2 gap-3">
//             {[
//               { label: "Submitted",   value: request.created_at ? new Date(request.created_at).toLocaleDateString("en-NG") : "—" },
//               { label: "Reviewed By", value: request.reviewed_by_name ?? "Pending" },
//             ].map((r) => (
//               <div key={r.label} className="rounded-xl p-3"
//                 style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
//                 <p className="text-[10px] font-semibold mb-0.5" style={{ color: C.textMuted }}>{r.label}</p>
//                 <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>{r.value}</p>
//               </div>
//             ))}
//           </div>

//           {request.rejection_reason && (
//             <div className="rounded-xl p-4" style={{ background: C.dangerLight, border: `1px solid ${C.danger}33` }}>
//               <p className="text-xs font-semibold mb-1" style={{ color: C.danger }}>Rejection Reason</p>
//               <p className="text-sm" style={{ color: C.textPrimary }}>{request.rejection_reason}</p>
//             </div>
//           )}

//           {/* Actions */}
//           {isPending && (
//             <div className="flex gap-3 pt-2">
//               <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
//                 onClick={() => onApprove(request.id)} disabled={actioning}
//                 className="flex-1 py-3 rounded-2xl font-semibold text-white flex items-center justify-center gap-2"
//                 style={{ background: C.success, opacity: actioning ? 0.7 : 1 }}>
//                 {actioning ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
//                 Approve Change
//               </motion.button>
//               <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
//                 onClick={() => onReject(request)}
//                 className="flex-1 py-3 rounded-2xl font-semibold border flex items-center justify-center gap-2"
//                 style={{ borderColor: C.danger, color: C.danger, background: C.dangerLight }}>
//                 <XCircle size={14} /> Reject
//               </motion.button>
//             </div>
//           )}
//         </div>
//       </motion.div>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════
// export default function ProfileChangeRequests() {
//   const [sidebarOpen,      setSidebarOpen]      = useState(true);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [requests,         setRequests]         = useState([]);
//   const [loading,          setLoading]          = useState(true);
//   const [error,            setError]            = useState(null);
//   const [actioning,        setActioning]        = useState(false);
//   const [search,           setSearch]           = useState("");
//   const [statusFilter,     setStatusFilter]     = useState("all");
//   const [drawer,           setDrawer]           = useState(null);
//   const [rejectTarget,     setRejectTarget]     = useState(null);
//   const [toast,            setToast]            = useState(null);
//   const [sort,             setSort]             = useState({ col: "created_at", dir: "desc" });

//   const showToast = (msg, type = "success") => setToast({ msg, type });

//   const load = useCallback(async () => {
//     setLoading(true); setError(null);
//     try {
//       const res = await approvalApi.getAll({ type: "profile_change", limit: 100 });
//       setRequests(res.data ?? []);
//     } catch (err) {
//       setError(err?.response?.data?.message ?? "Failed to load profile change requests.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { load(); }, [load]);

//   const handleApprove = async (id) => {
//     setActioning(true);
//     setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved" } : r));
//     setDrawer(null);
//     try {
//       await approvalApi.approve(id);
//       showToast("Profile change approved. Employee record updated.");
//     } catch (err) {
//       setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "pending" } : r));
//       showToast(err?.response?.data?.message ?? "Failed to approve.", "error");
//     } finally {
//       setActioning(false);
//     }
//   };

//   const handleRejectConfirm = async (reason) => {
//     if (!rejectTarget) return;
//     const id = rejectTarget.id;
//     setActioning(true);
//     setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected", rejection_reason: reason } : r));
//     setRejectTarget(null);
//     setDrawer(null);
//     try {
//       await approvalApi.reject(id, reason);
//       showToast("Profile change rejected.");
//     } catch (err) {
//       setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "pending" } : r));
//       showToast(err?.response?.data?.message ?? "Failed to reject.", "error");
//     } finally {
//       setActioning(false);
//     }
//   };

//   const toggleSort = (col) =>
//     setSort((s) => s.col === col ? { col, dir: s.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" });

//   const stats = useMemo(() => ({
//     total:    requests.length,
//     pending:  requests.filter((r) => r.status === "pending").length,
//     approved: requests.filter((r) => r.status === "approved").length,
//     rejected: requests.filter((r) => r.status === "rejected").length,
//   }), [requests]);

//   const filtered = useMemo(() => {
//     let list = requests.filter((r) => {
//       const q = search.toLowerCase();
//       const matchS = !q || r.employee_name?.toLowerCase().includes(q) || r.department_name?.toLowerCase().includes(q);
//       const matchF = statusFilter === "all" || r.status?.toLowerCase() === statusFilter;
//       return matchS && matchF;
//     });
//     list.sort((a, b) => {
//       const va = a[sort.col] ?? ""; const vb = b[sort.col] ?? "";
//       return sort.dir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
//     });
//     return list;
//   }, [requests, search, statusFilter, sort]);

//   const STAT_PILLS = [
//     { key: "all",      label: "All",      count: stats.total,    color: C.primary, bg: C.primaryLight  },
//     { key: "pending",  label: "Pending",  count: stats.pending,  color: C.warning, bg: C.warningLight  },
//     { key: "approved", label: "Approved", count: stats.approved, color: C.success, bg: C.successLight  },
//     { key: "rejected", label: "Rejected", count: stats.rejected, color: C.danger,  bg: C.dangerLight   },
//   ];

//   const SortIcon = ({ col }) => {
//     if (sort.col !== col) return <ArrowUpDown size={11} color={C.textMuted} />;
//     return sort.dir === "asc" ? <ArrowUp size={11} color={C.primary} /> : <ArrowDown size={11} color={C.primary} />;
//   };

//   return (
//     <div className="min-h-screen" style={{ background: C.bg, fontFamily: "'DM Sans','Sora',sans-serif" }}>
//       <div className="flex h-screen overflow-hidden">
//         <AdminSideNavbar sidebarOpen={sidebarOpen} collapsed={sidebarCollapsed}
//           setCollapsed={setSidebarCollapsed} pendingApprovals={stats.pending} />

//         <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
//           {/* TOPBAR */}
//           <header className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
//             style={{ background: "rgba(240,242,248,0.9)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}` }}>
//             <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//               onClick={() => setSidebarOpen((p) => !p)} className="p-2 rounded-xl hidden md:flex"
//               style={{ background: C.surface }}>
//               <Menu size={16} color={C.textSecondary} />
//             </motion.button>
//             <div className="relative flex-1 max-w-xs">
//               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" color={C.textMuted} />
//               <input value={search} onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search by employee or department..."
//                 className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
//                 style={{ background: C.surface, border: `1.5px solid ${C.border}`, color: C.textPrimary }} />
//             </div>
//             <div className="ml-auto flex items-center gap-2">
//               <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//                 onClick={load} className="w-8 h-8 rounded-xl flex items-center justify-center"
//                 style={{ background: C.surface, border: `1px solid ${C.border}` }}>
//                 <RefreshCw size={14} color={C.textSecondary} />
//               </motion.button>
//             </div>
//           </header>

//           <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
//             <div>
//               <h1 className="text-2xl font-bold" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>
//                 Profile Change Requests
//               </h1>
//               <p className="text-sm mt-0.5" style={{ color: C.textMuted }}>
//                 Employee-submitted profile update requests pending HR review
//               </p>
//             </div>

//             {/* Stat pills */}
//             <div className="flex gap-2 flex-wrap">
//               {STAT_PILLS.map((s) => (
//                 <motion.button key={s.key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
//                   onClick={() => setStatusFilter(s.key)}
//                   className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
//                   style={{
//                     background: statusFilter === s.key ? s.color : C.surface,
//                     color:      statusFilter === s.key ? "#fff"   : C.textSecondary,
//                     border:     `1px solid ${statusFilter === s.key ? s.color : C.border}`,
//                   }}>
//                   {s.label}
//                   <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
//                     style={{ background: statusFilter === s.key ? "rgba(255,255,255,0.25)" : s.bg, color: statusFilter === s.key ? "#fff" : s.color }}>
//                     {s.count}
//                   </span>
//                 </motion.button>
//               ))}
//             </div>

//             {error && (
//               <div className="rounded-xl p-4 flex items-center gap-2" style={{ background: C.dangerLight }}>
//                 <AlertTriangle size={15} color={C.danger} />
//                 <p className="text-sm" style={{ color: C.danger }}>{error}</p>
//               </div>
//             )}

//             {/* Table */}
//             <Card>
//               <div className="overflow-x-auto">
//                 <table className="w-full" style={{ borderCollapse: "collapse" }}>
//                   <thead>
//                     <tr style={{ background: C.surfaceAlt, borderBottom: `1px solid ${C.border}` }}>
//                       {[
//                         { key: "employee_name", label: "Employee"   },
//                         { key: "department_name", label: "Department" },
//                         { key: "_fields",        label: "Fields Changed" },
//                         { key: "created_at",     label: "Submitted" },
//                         { key: "status",         label: "Status"    },
//                         { key: "_actions",       label: "Actions"   },
//                       ].map((col) => (
//                         <th key={col.key}
//                           className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide cursor-pointer"
//                           style={{ color: C.textMuted }}
//                           onClick={() => !["_fields", "_actions"].includes(col.key) && toggleSort(col.key)}>
//                           <div className="flex items-center gap-1.5">
//                             {col.label}
//                             {!["_fields", "_actions"].includes(col.key) && <SortIcon col={col.key} />}
//                           </div>
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {loading ? (
//                       [...Array(4)].map((_, i) => (
//                         <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
//                           {[...Array(6)].map((_, j) => (
//                             <td key={j} className="px-4 py-3">
//                               <div className="h-5 rounded animate-pulse" style={{ background: C.surfaceAlt }} />
//                             </td>
//                           ))}
//                         </tr>
//                       ))
//                     ) : filtered.length === 0 ? (
//                       <tr><td colSpan={6} className="px-4 py-16 text-center">
//                         <CheckCircle2 size={36} color={C.success} className="mx-auto mb-3" />
//                         <p className="font-semibold text-sm" style={{ color: C.textSecondary }}>
//                           {statusFilter === "pending" ? "No pending profile changes 🎉" : "No requests found"}
//                         </p>
//                       </td></tr>
//                     ) : filtered.map((req, i) => {
//                       const meta = req.metadata ?? req.requested_changes ?? {};
//                       const fieldCount = Object.keys(meta).length;
//                       return (
//                         <motion.tr key={req.id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
//                           className="transition-colors" style={{ borderBottom: `1px solid ${C.border}` }}
//                           onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceAlt)}
//                           onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
//                           {/* Employee */}
//                           <td className="px-4 py-3.5">
//                             <div className="flex items-center gap-2">
//                               <Av name={req.employee_name} dept={req.department_name} size={30} />
//                               <div>
//                                 <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>{req.employee_name}</p>
//                                 <p className="text-[10px] font-mono" style={{ color: C.textMuted }}>{req.employee_code}</p>
//                               </div>
//                             </div>
//                           </td>
//                           {/* Department */}
//                           <td className="px-4 py-3.5">
//                             <span className="text-xs" style={{ color: C.textSecondary }}>{req.department_name ?? "—"}</span>
//                           </td>
//                           {/* Fields changed */}
//                           <td className="px-4 py-3.5">
//                             <div className="flex flex-wrap gap-1">
//                               {Object.keys(meta).slice(0, 2).map((f) => (
//                                 <span key={f} className="text-[10px] font-bold px-2 py-0.5 rounded-md capitalize"
//                                   style={{ background: C.primaryLight, color: C.primary }}>
//                                   {f.replace(/_/g, " ")}
//                                 </span>
//                               ))}
//                               {fieldCount > 2 && (
//                                 <span className="text-[10px] font-bold px-2 py-0.5 rounded-md"
//                                   style={{ background: C.surfaceAlt, color: C.textMuted }}>
//                                   +{fieldCount - 2}
//                                 </span>
//                               )}
//                               {fieldCount === 0 && <span className="text-[10px]" style={{ color: C.textMuted }}>—</span>}
//                             </div>
//                           </td>
//                           {/* Submitted */}
//                           <td className="px-4 py-3.5">
//                             <span className="text-xs" style={{ color: C.textSecondary }}>
//                               {req.created_at ? new Date(req.created_at).toLocaleDateString("en-NG") : "—"}
//                             </span>
//                           </td>
//                           {/* Status */}
//                           <td className="px-4 py-3.5"><StatusChip status={req.status} /></td>
//                           {/* Actions */}
//                           <td className="px-4 py-3.5">
//                             <div className="flex items-center gap-1">
//                               {req.status?.toLowerCase() === "pending" && (
//                                 <>
//                                   <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
//                                     onClick={() => handleApprove(req.id)}
//                                     className="w-7 h-7 rounded-lg flex items-center justify-center"
//                                     style={{ background: C.successLight, border: `1px solid ${C.success}33` }}>
//                                     <Check size={12} color={C.success} />
//                                   </motion.button>
//                                   <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
//                                     onClick={() => setRejectTarget(req)}
//                                     className="w-7 h-7 rounded-lg flex items-center justify-center"
//                                     style={{ background: C.dangerLight, border: `1px solid ${C.danger}33` }}>
//                                     <X size={12} color={C.danger} />
//                                   </motion.button>
//                                 </>
//                               )}
//                               <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
//                                 onClick={() => setDrawer(req)}
//                                 className="w-7 h-7 rounded-lg flex items-center justify-center"
//                                 style={{ background: C.primaryLight, border: `1px solid ${C.primary}22` }}>
//                                 <Eye size={12} color={C.primary} />
//                               </motion.button>
//                             </div>
//                           </td>
//                         </motion.tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//               {!loading && filtered.length > 0 && (
//                 <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: `1px solid ${C.border}` }}>
//                   <p className="text-xs" style={{ color: C.textMuted }}>
//                     Showing <span className="font-semibold" style={{ color: C.textPrimary }}>{filtered.length}</span>{" "}
//                     of <span className="font-semibold" style={{ color: C.textPrimary }}>{stats.total}</span> requests
//                   </p>
//                   {stats.pending > 0 && (
//                     <p className="text-xs font-semibold" style={{ color: C.warning }}>
//                       {stats.pending} pending action{stats.pending !== 1 ? "s" : ""}
//                     </p>
//                   )}
//                 </div>
//               )}
//             </Card>
//           </main>
//         </div>
//       </div>

//       <AnimatePresence>
//         {drawer && (
//           <DetailDrawer request={drawer} actioning={actioning}
//             onApprove={handleApprove}
//             onReject={(req) => { setRejectTarget(req); setDrawer(null); }}
//             onClose={() => setDrawer(null)} />
//         )}
//       </AnimatePresence>
//       <AnimatePresence>
//         {rejectTarget && (
//           <RejectModal request={rejectTarget}
//             onConfirm={handleRejectConfirm}
//             onClose={() => setRejectTarget(null)} />
//         )}
//       </AnimatePresence>
//       <AnimatePresence>
//         {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
//       </AnimatePresence>
//     </div>
//   );
// }


// src/admin/employeemanagement/ProfileChangeRequests.jsx
// Route: /admin/employeemanagement/admin-profilechangerequests
// HR can see all pending profile change requests from employees,
// view the diff (old vs new), and approve or reject them.

import { useState, useEffect, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AdminSideNavbar from "../AdminSideNavbar";
import { useAuth } from "../../components/AuthContext";
import C from "../../styles/colors";
import API from "../../api/axios";
import {
  ChevronRight, Menu, RefreshCw, Check, X, Eye,
  AlertCircle, Loader2, CheckCircle2, XCircle, Clock,
  User, Edit3, ArrowRight, Info,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.055, duration: 0.42, ease: [0.22, 1, 0.36, 1] } }),
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtTime = (d) => d ? new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

// ── API calls ──
const changeRequestsApi = {
  getAll: (params = {}) => API.get("/employees/change-requests", { params }).then(r => r.data),
  approve: (id) => API.put(`/employees/change-requests/${id}/approve`).then(r => r.data),
  reject: (id, reason) => API.put(`/employees/change-requests/${id}/reject`, { reason }).then(r => r.data),
};

// ── Atoms ──
function Card({ children, className = "", style = {} }) {
  return <div className={`rounded-2xl ${className}`} style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(15,23,42,0.04)", ...style }}>{children}</div>;
}

const Chip = ({ label, color, bg, dot = false }) => (
  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: bg, color }}>
    {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />}{label}
  </span>
);

// ── Change Diff row ──
function DiffRow({ field, oldVal, newVal }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2.5 border-b last:border-0" style={{ borderColor: C.border }}>
      <p className="text-xs font-semibold" style={{ color: C.textMuted }}>{field}</p>
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 rounded" style={{ background: C.dangerLight, color: C.danger }}>{oldVal || "—"}</span>
        <ArrowRight size={10} color={C.textMuted} />
        <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background: C.successLight, color: C.success }}>{newVal || "—"}</span>
      </div>
    </div>
  );
}

// ── Detail Modal ──
function DetailModal({ req, onApprove, onReject, onClose }) {
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState(null);
  const [err, setErr] = useState(null);

  const changes = req.requested_changes ?? {};
  const snapshot = req.current_snapshot ?? {};

  // Pretty-print field names
  const FIELD_LABELS = {
    phone: "Phone", address: "Address", state: "State",
    personalEmail: "Personal Email", nokName: "Next of Kin Name",
    nokRelationship: "NOK Relationship", nokPhone: "NOK Phone",
    nokAddress: "NOK Address", bankName: "Bank Name",
    accountNumber: "Account Number", accountName: "Account Name",
    avatar: "Profile Photo", bio: "Bio",
    phone: "Phone",
  };

  const handleApprove = async () => {
    setLoading("approve");
    setErr(null);
    try { await onApprove(req.id); } catch (e) { setErr(e?.response?.data?.message ?? "Approve failed."); setLoading(null); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { setErr("Please provide a rejection reason."); return; }
    setLoading("reject");
    setErr(null);
    try { await onReject(req.id, rejectReason); } catch (e) { setErr(e?.response?.data?.message ?? "Reject failed."); setLoading(null); }
  };

  return (
    <>
      <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <Motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 280, damping: 30 }} className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg flex flex-col" style={{ background: C.surface, borderLeft: `1px solid ${C.border}`, boxShadow: "-8px 0 40px rgba(15,23,42,0.14)" }}>
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between shrink-0" style={{ background: `linear-gradient(135deg,${C.navy},${C.primary})` }}>
          <div>
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Profile Change Request</p>
            <h3 className="text-white font-bold mt-0.5" style={{ fontFamily: "Sora,sans-serif" }}>{req.employee_name ?? "Employee"}</h3>
            <p className="text-white/50 text-xs mt-0.5">{fmtTime(req.created_at)}</p>
          </div>
          <Motion.button whileHover={{ scale: 1.1, rotate: 90 }} onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer" }}>
            <X size={14} color="#fff" />
          </Motion.button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {err && <div className="p-3 rounded-xl text-xs" style={{ background: C.dangerLight, color: C.danger }}>{err}</div>}

          {/* Employee info */}
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: C.surfaceAlt }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: C.primary }}>
              {(req.employee_name ?? "?").split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: C.textPrimary }}>{req.employee_name ?? "—"}</p>
              <p className="text-xs" style={{ color: C.textMuted }}>{req.employee_code ?? ""} · Submitted {fmtDate(req.created_at)}</p>
            </div>
            <Chip label={req.status ?? "pending"} color={req.status === "approved" ? C.success : req.status === "rejected" ? C.danger : C.warning} bg={req.status === "approved" ? C.successLight : req.status === "rejected" ? C.dangerLight : C.warningLight} dot />
          </div>

          {/* Diff */}
          <Card>
            <div className="flex items-center gap-3 p-4" style={{ borderBottom: `1px solid ${C.border}` }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: C.primaryLight }}>
                <Edit3 size={13} color={C.primary} />
              </div>
              <p className="text-sm font-bold" style={{ color: C.textPrimary }}>Requested Changes</p>
            </div>
            <div className="px-5 py-2">
              {/* Column headers */}
              <div className="grid grid-cols-3 gap-3 pb-2 mb-1 border-b" style={{ borderColor: C.border }}>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.textMuted }}>Field</p>
                <p className="text-[10px] font-bold uppercase tracking-wider col-span-2" style={{ color: C.textMuted }}>Old → New</p>
              </div>
              {Object.entries(changes).map(([key, newVal]) => (
                <DiffRow key={key} field={FIELD_LABELS[key] ?? key} oldVal={snapshot[key] ?? "—"} newVal={newVal} />
              ))}
            </div>
          </Card>

          {/* Rejection reason */}
          {req.status === "pending" && (
            <>
              {!showReject ? (
                <button onClick={() => setShowReject(true)} className="text-xs font-semibold w-full text-center p-2" style={{ color: C.danger, background: "none", border: "none", cursor: "pointer" }}>
                  Reject with reason ▾
                </button>
              ) : (
                <div>
                  <p className="text-xs font-bold mb-1.5" style={{ color: C.textMuted }}>Rejection Reason</p>
                  <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="Explain why this request is being rejected…" className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ border: `1.5px solid ${rejectReason ? C.danger + "66" : C.border}`, background: C.surfaceAlt, color: C.textPrimary }} />
                </div>
              )}
            </>
          )}

          {req.status !== "pending" && (
            <div className="p-4 rounded-xl" style={{ background: req.status === "approved" ? C.successLight : C.dangerLight }}>
              <p className="text-xs font-bold" style={{ color: req.status === "approved" ? C.success : C.danger }}>
                {req.status === "approved" ? "✓ Approved" : "✗ Rejected"} by {req.reviewed_by_name ?? "HR"} on {fmtDate(req.reviewed_at)}
              </p>
              {req.rejection_reason && <p className="text-xs mt-1" style={{ color: C.textSecondary }}>{req.rejection_reason}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        {req.status === "pending" && (
          <div className="px-6 py-4 flex gap-3 shrink-0" style={{ borderTop: `1px solid ${C.border}` }}>
            <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleReject} disabled={loading === "reject"} className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2" style={{ background: C.dangerLight, color: C.danger, border: `1px solid ${C.danger}33`, cursor: loading === "reject" ? "not-allowed" : "pointer" }}>
              {loading === "reject" ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />} Reject
            </Motion.button>
            <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleApprove} disabled={loading === "approve"} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2" style={{ background: C.success, border: "none", cursor: loading === "approve" ? "not-allowed" : "pointer" }}>
              {loading === "approve" ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Approve & Apply
            </Motion.button>
          </div>
        )}
      </Motion.div>
    </>
  );
}

// ════════════════════════════ MAIN ════════════════════════════
export default function ProfileChangeRequests() {
  const navigate = useNavigate();
  const { employee: adminUser } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsed, setCollapsed]     = useState(false);
  const [requests, setRequests]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [selected, setSelected]       = useState(null);
  const [toast, setToast]             = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await changeRequestsApi.getAll({ status: filterStatus !== "all" ? filterStatus : undefined });
      setRequests(res.data ?? res.requests ?? []);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load change requests.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleApprove = async (id) => {
    await changeRequestsApi.approve(id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "approved" } : r));
    setSelected(null);
    showToast("Profile change approved and applied.");
    fetchRequests();
  };

  const handleReject = async (id, reason) => {
    await changeRequestsApi.reject(id, reason);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "rejected", rejection_reason: reason } : r));
    setSelected(null);
    showToast("Profile change rejected.");
    fetchRequests();
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;

  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: "'DM Sans','Sora',sans-serif", color: C.textPrimary }}>
      <div className="flex h-screen overflow-hidden">
        <AdminSideNavbar sidebarOpen={sidebarOpen} collapsed={collapsed} setCollapsed={setCollapsed} ADMIN={adminUser} pendingApprovals={pendingCount} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10" style={{ background: "rgba(240,242,248,0.85)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}` }}>
            <Motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSidebarOpen(p => !p)} className="p-2 rounded-xl hidden md:flex" style={{ background: C.surface, border: `1px solid ${C.border}`, cursor: "pointer" }}>
              <Menu size={15} color={C.textSecondary} />
            </Motion.button>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: C.textSecondary }}>
              <span>Admin</span><ChevronRight size={11} />
              <span className="font-bold" style={{ color: C.textPrimary }}>Profile Change Requests</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {pendingCount > 0 && (
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: C.warningLight, color: C.warning }}>
                  {pendingCount} pending
                </span>
              )}
              <Motion.button whileHover={{ scale: 1.05 }} onClick={fetchRequests} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: C.surface, border: `1px solid ${C.border}`, cursor: "pointer" }}>
                <RefreshCw size={13} color={C.textMuted} />
              </Motion.button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
            {/* Hero */}
            <Motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="rounded-2xl p-8" style={{ background: "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)" }}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <Edit3 size={28} color="#fff" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "Sora,sans-serif" }}>Profile Change Requests</h1>
                  <p className="text-indigo-300 text-sm mt-1">Review and apply employee-submitted profile update requests</p>
                </div>
              </div>
            </Motion.div>

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: C.dangerLight, border: `1px solid ${C.danger}33` }}>
                <AlertCircle size={16} color={C.danger} />
                <p className="text-sm flex-1" style={{ color: C.danger }}>{error}</p>
                <button onClick={fetchRequests} className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: C.danger, color: "#fff", border: "none", cursor: "pointer" }}>Retry</button>
              </div>
            )}

            {/* Filter tabs */}
            <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              {["all", "pending", "approved", "rejected"].map(s => {
                const active = filterStatus === s;
                return (
                  <Motion.button key={s} whileTap={{ scale: 0.97 }} onClick={() => setFilterStatus(s)} className="px-4 py-2 rounded-xl text-sm font-medium capitalize" style={{ background: active ? C.primary : "transparent", color: active ? "#fff" : C.textSecondary, border: "none", cursor: "pointer", transition: "all 0.18s" }}>
                    {s}
                  </Motion.button>
                );
              })}
            </div>

            {/* Table */}
            <Motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
              <Card>
                {loading ? (
                  <div className="p-8 space-y-3">
                    {[1,2,3,4].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: C.surfaceAlt }} />)}
                  </div>
                ) : requests.length === 0 ? (
                  <div className="py-20 text-center">
                    <CheckCircle2 size={44} color={C.success} className="mx-auto mb-3" />
                    <p className="font-bold text-base" style={{ color: C.textSecondary }}>No {filterStatus !== "all" ? filterStatus : ""} requests</p>
                    <p className="text-sm mt-1" style={{ color: C.textMuted }}>All profile change requests will appear here.</p>
                  </div>
                ) : (
                  <div className="divide-y" style={{ borderColor: C.border }}>
                    {requests.map((req, i) => (
                      <Motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        onClick={() => setSelected(req)}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 cursor-pointer group transition-colors"
                      >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: C.primary }}>
                          {(req.employee_name ?? "?").split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>{req.employee_name ?? "—"}</p>
                            <p className="text-xs" style={{ color: C.textMuted }}>{req.employee_code ?? ""}</p>
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>
                            {Object.keys(req.requested_changes ?? {}).length} field{Object.keys(req.requested_changes ?? {}).length !== 1 ? "s" : ""} requested ·{" "}
                            {fmtDate(req.created_at)}
                          </p>
                        </div>

                        <Chip
                          label={req.status ?? "pending"}
                          color={req.status === "approved" ? C.success : req.status === "rejected" ? C.danger : C.warning}
                          bg={req.status === "approved" ? C.successLight : req.status === "rejected" ? C.dangerLight : C.warningLight}
                          dot
                        />

                        <Eye size={15} color={C.textMuted} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </Motion.div>
          </main>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <DetailModal
            key={selected.id}
            req={selected}
            onApprove={handleApprove}
            onReject={handleReject}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl z-50" style={{ background: toast.type === "error" ? C.danger : C.navy, color: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", minWidth: 300 }}>
            {toast.type === "error" ? <AlertCircle size={15} color="#fff" /> : <CheckCircle2 size={15} color={C.success} />}
            <span className="text-sm">{toast.msg}</span>
            <button onClick={() => setToast(null)} style={{ background: "none", border: "none", cursor: "pointer", marginLeft: "auto" }}><X size={13} color="rgba(255,255,255,0.5)" /></button>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}