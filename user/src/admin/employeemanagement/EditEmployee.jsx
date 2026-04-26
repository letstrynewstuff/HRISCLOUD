// // ─────────────────────────────────────────────────────────────
// //  src/admin/employeemanagement/EditEmployee.jsx
// //
// //  Route:  /admin/employees/:id/edit
// //  Part of the Employee Management module.
// //
// //  Features:
// //    • Pre-fills all fields from mock employee data
// //    • Tabbed sections: Personal · Job · Bank · Emergency · Access
// //    • Field-level dirty tracking (only changed fields shown in
// //      confirmation summary)
// //    • Inline validation with live error messages
// //    • Success toast with audit trail entry on save
// //    • "Last modified by" banner
// //    • Unsaved-changes guard (warns before navigating away)
// //    • Full audit trail sidebar (chronological change log)
// //    • Matches AdminDashboard colour palette exactly
// // ─────────────────────────────────────────────────────────────

// import { useState, useEffect, useMemo, useCallback, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useNavigate, useParams } from "react-router-dom";
// import AdminSideNavbar from "../AdminSideNavbar";
// import {
//   ChevronRight,
//   ChevronLeft,
//   Save,
//   X,
//   Check,
//   AlertCircle,
//   User,
//   Briefcase,
//   CreditCard,
//   Shield,
//   Phone,
//   Menu,
//   Eye,
//   EyeOff,
//   Clock,
//   Edit3,
//   History,
//   ArrowLeft,
//   CheckCircle2,
//   XCircle,
//   Info,
//   Bell,
//   RefreshCw,
//   Building2,
//   MapPin,
//   Hash,
//   Calendar,
//   Mail,
//   Users,
//   AlertTriangle,
//   Lock,
//   Unlock,
//   UserCog,
// } from "lucide-react";

// import {
//   C,
//   ADMIN,
//   DEPT_COLORS,
//   DEPARTMENTS,
//   ROLES_BY_DEPT,
//   LOCATIONS,
//   EMP_TYPES,
//   STATUSES,
//   GRADES,
//   INITIAL_EMPLOYEES,
//   SEED_AUDIT,
//   fadeUp,
// } from "./sharedData";

// /* ─── Section tab config ─── */
// const TABS = [
//   { id: "personal", label: "Personal Info", icon: User },
//   { id: "job", label: "Job Details", icon: Briefcase },
//   { id: "bank", label: "Bank & Payroll", icon: CreditCard },
//   { id: "emergency", label: "Emergency", icon: Phone },
//   { id: "access", label: "Access & Status", icon: Shield },
// ];

// /* ─── Field-level validation ─── */
// const VALIDATORS = {
//   name: (v) => (!v?.trim() ? "Full name is required" : null),
//   email: (v) =>
//     !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "") ? "Enter a valid email" : null,
//   phone: (v) => (!v?.trim() ? "Phone is required" : null),
//   dept: (v) => (!v ? "Department is required" : null),
//   role: (v) => (!v ? "Role is required" : null),
//   grade: (v) => (!v ? "Grade is required" : null),
//   type: (v) => (!v ? "Employment type is required" : null),
//   status: (v) => (!v ? "Status is required" : null),
//   location: (v) => (!v ? "Location is required" : null),
//   accountNo: (v) =>
//     v && !/^\d{10}$/.test(v) ? "Account number must be 10 digits" : null,
// };

// /* ─────────────────────────────────────────
//    SHARED ATOMS
// ───────────────────────────────────────── */
// function Card({ children, className = "", style = {} }) {
//   return (
//     <div
//       className={`rounded-2xl ${className}`}
//       style={{
//         background: C.surface,
//         border: `1px solid ${C.border}`,
//         boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
//         ...style,
//       }}
//     >
//       {children}
//     </div>
//   );
// }

// function Av({ initials, dept, size = 40 }) {
//   const color = DEPT_COLORS[dept] || C.primary;
//   return (
//     <div
//       className="flex items-center justify-center text-white font-bold shrink-0"
//       style={{
//         width: size,
//         height: size,
//         borderRadius: size * 0.28,
//         background: `linear-gradient(135deg,${color},${color}bb)`,
//         fontSize: size * 0.32,
//         fontFamily: "Sora,sans-serif",
//         boxShadow: `0 2px 8px ${color}44`,
//       }}
//     >
//       {initials}
//     </div>
//   );
// }

// function FieldError({ msg }) {
//   if (!msg) return null;
//   return (
//     <motion.p
//       initial={{ opacity: 0, y: -4 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="flex items-center gap-1 mt-1 text-[11px] font-medium"
//       style={{ color: C.danger }}
//     >
//       <AlertCircle size={10} />
//       {msg}
//     </motion.p>
//   );
// }

// function Label({ children, required }) {
//   return (
//     <label
//       className="block text-xs font-bold uppercase tracking-wider mb-1.5"
//       style={{ color: C.textSecondary }}
//     >
//       {children}
//       {required && (
//         <span className="ml-0.5" style={{ color: C.danger }}>
//           *
//         </span>
//       )}
//     </label>
//   );
// }

// function Input({
//   value,
//   onChange,
//   placeholder,
//   error,
//   type = "text",
//   disabled = false,
//   mono = false,
// }) {
//   return (
//     <input
//       type={type}
//       value={value}
//       onChange={onChange}
//       placeholder={placeholder}
//       disabled={disabled}
//       className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
//       style={{
//         border: `1.5px solid ${error ? C.danger : value ? C.primary : C.border}`,
//         background: disabled ? C.surfaceAlt : C.surface,
//         color: disabled ? C.textMuted : C.textPrimary,
//         boxShadow: error
//           ? `0 0 0 3px ${C.dangerLight}`
//           : value && !disabled
//             ? `0 0 0 3px ${C.primaryLight}`
//             : "none",
//         fontFamily: mono ? "monospace" : "inherit",
//         cursor: disabled ? "not-allowed" : "text",
//       }}
//     />
//   );
// }

// function Select({ value, onChange, options, error, disabled = false }) {
//   return (
//     <select
//       value={value}
//       onChange={onChange}
//       disabled={disabled}
//       className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
//       style={{
//         border: `1.5px solid ${error ? C.danger : value ? C.primary : C.border}`,
//         background: disabled ? C.surfaceAlt : C.surface,
//         color: value ? C.textPrimary : C.textMuted,
//         boxShadow: error
//           ? `0 0 0 3px ${C.dangerLight}`
//           : value && !disabled
//             ? `0 0 0 3px ${C.primaryLight}`
//             : "none",
//         cursor: disabled ? "not-allowed" : "pointer",
//       }}
//     >
//       <option value="">Select…</option>
//       {options.map((o) => (
//         <option key={o} value={o}>
//           {o}
//         </option>
//       ))}
//     </select>
//   );
// }

// /* Audit trail entry */
// function AuditRow({ entry, i }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, x: 8 }}
//       animate={{ opacity: 1, x: 0 }}
//       transition={{ delay: i * 0.04 }}
//       className="flex gap-3 pb-4"
//       style={{ borderBottom: `1px solid ${C.border}` }}
//     >
//       <div
//         className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
//         style={{
//           background: C.primaryLight,
//           border: `1.5px solid ${C.primary}`,
//         }}
//       >
//         <Edit3 size={9} color={C.primary} />
//       </div>
//       <div className="flex-1 min-w-0">
//         <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>
//           {entry.action}
//         </p>
//         {entry.field && (
//           <p className="text-[10px] mt-0.5" style={{ color: C.textSecondary }}>
//             <span style={{ color: C.danger }}>{entry.from}</span>
//             {" → "}
//             <span style={{ color: C.success }}>{entry.to}</span>
//           </p>
//         )}
//         <div className="flex items-center gap-1.5 mt-1">
//           <span
//             className="text-[10px] font-semibold"
//             style={{ color: C.primary }}
//           >
//             {entry.actor}
//           </span>
//           <span className="text-[10px]" style={{ color: C.textMuted }}>
//             · {entry.timestamp}
//           </span>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// /* Confirm modal */
// function ConfirmModal({ changes, onConfirm, onCancel }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-50 flex items-center justify-center p-5"
//       style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
//       onClick={onCancel}
//     >
//       <motion.div
//         initial={{ scale: 0.93, y: 20 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.93, y: 20 }}
//         transition={{ type: "spring", stiffness: 260, damping: 24 }}
//         className="w-full max-w-md rounded-2xl overflow-hidden"
//         style={{
//           background: C.surface,
//           boxShadow: "0 24px 64px rgba(15,23,42,0.2)",
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div
//           className="px-6 py-5 flex items-center justify-between"
//           style={{
//             background: `linear-gradient(135deg,${C.navy},${C.primary})`,
//           }}
//         >
//           <div>
//             <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">
//               Review Changes
//             </p>
//             <h3
//               className="text-white text-lg font-bold mt-0.5"
//               style={{ fontFamily: "Sora,sans-serif" }}
//             >
//               Confirm Employee Update
//             </h3>
//           </div>
//           <motion.button
//             whileHover={{ scale: 1.1, rotate: 90 }}
//             onClick={onCancel}
//             style={{
//               background: "rgba(255,255,255,0.15)",
//               border: "none",
//               borderRadius: 8,
//               width: 32,
//               height: 32,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               cursor: "pointer",
//             }}
//           >
//             <X size={14} color="#fff" />
//           </motion.button>
//         </div>

//         <div className="p-5">
//           <p
//             className="text-xs font-semibold uppercase tracking-wider mb-3"
//             style={{ color: C.textMuted }}
//           >
//             {changes.length} field{changes.length !== 1 ? "s" : ""} will be
//             updated:
//           </p>
//           <div className="space-y-2 max-h-56 overflow-y-auto mb-5">
//             {changes.map((ch) => (
//               <div
//                 key={ch.key}
//                 className="p-3 rounded-xl"
//                 style={{
//                   background: C.surfaceAlt,
//                   border: `1px solid ${C.border}`,
//                 }}
//               >
//                 <p
//                   className="text-xs font-bold mb-1"
//                   style={{ color: C.textPrimary }}
//                 >
//                   {ch.label}
//                 </p>
//                 <div className="flex items-center gap-2 text-[11px]">
//                   <span className="line-through" style={{ color: C.danger }}>
//                     {ch.old || "—"}
//                   </span>
//                   <ChevronRight size={10} color={C.textMuted} />
//                   <span className="font-semibold" style={{ color: C.success }}>
//                     {ch.new || "—"}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//           <p
//             className="text-[11px] mb-4 p-3 rounded-xl flex items-start gap-2"
//             style={{ background: C.warningLight, color: C.warning }}
//           >
//             <AlertTriangle size={13} className="shrink-0 mt-0.5" />
//             This action will be logged in the audit trail and visible to other
//             admins.
//           </p>
//           <div className="flex gap-3">
//             <button
//               onClick={onCancel}
//               className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
//               style={{
//                 border: `1.5px solid ${C.border}`,
//                 background: "transparent",
//                 color: C.textSecondary,
//                 cursor: "pointer",
//               }}
//             >
//               Cancel
//             </button>
//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.97 }}
//               onClick={onConfirm}
//               className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
//               style={{
//                 background: `linear-gradient(135deg,${C.primary},${C.purple})`,
//                 border: "none",
//                 cursor: "pointer",
//                 boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
//               }}
//             >
//               <Save size={13} /> Save Changes
//             </motion.button>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// /* Unsaved-changes guard modal */
// function UnsavedModal({ onStay, onLeave }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-50 flex items-center justify-center p-5"
//       style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
//     >
//       <motion.div
//         initial={{ scale: 0.93 }}
//         animate={{ scale: 1 }}
//         exit={{ scale: 0.93 }}
//         transition={{ type: "spring", stiffness: 260, damping: 24 }}
//         className="w-full max-w-sm rounded-2xl p-6"
//         style={{
//           background: C.surface,
//           boxShadow: "0 24px 64px rgba(15,23,42,0.2)",
//         }}
//       >
//         <div
//           className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
//           style={{ background: C.warningLight }}
//         >
//           <AlertTriangle size={22} color={C.warning} />
//         </div>
//         <h3
//           className="text-base font-bold mb-1"
//           style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
//         >
//           Unsaved Changes
//         </h3>
//         <p className="text-sm mb-6" style={{ color: C.textSecondary }}>
//           You have unsaved changes. If you leave now, your edits will be lost.
//         </p>
//         <div className="flex gap-3">
//           <button
//             onClick={onStay}
//             className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
//             style={{
//               border: `1.5px solid ${C.border}`,
//               background: "transparent",
//               color: C.textSecondary,
//               cursor: "pointer",
//             }}
//           >
//             Stay
//           </button>
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.97 }}
//             onClick={onLeave}
//             className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
//             style={{ background: C.danger, border: "none", cursor: "pointer" }}
//           >
//             Leave Anyway
//           </motion.button>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// /* Success toast */
// function Toast({ msg, onDone }) {
//   useEffect(() => {
//     const t = setTimeout(onDone, 3000);
//     return () => clearTimeout(t);
//   }, [onDone]);
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 40, x: "-50%" }}
//       animate={{ opacity: 1, y: 0, x: "-50%" }}
//       exit={{ opacity: 0, y: 40, x: "-50%" }}
//       className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl"
//       style={{
//         background: C.navy,
//         boxShadow: "0 12px 40px rgba(15,23,42,0.35)",
//       }}
//     >
//       <CheckCircle2 size={18} color={C.success} />
//       <span className="text-white text-sm font-semibold">{msg}</span>
//     </motion.div>
//   );
// }

// /* ═══════════════════════════════════════════════════════════
//    MAIN PAGE
// ═══════════════════════════════════════════════════════════ */
// export default function EditEmployee() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [collapsed, setCollapsed] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("personal");
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [showUnsaved, setShowUnsaved] = useState(false);
//   const [pendingNav, setPendingNav] = useState(null);
//   const [toast, setToast] = useState(null);
//   const [showAudit, setShowAudit] = useState(false);
//   const [showAccNo, setShowAccNo] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [audit, setAudit] = useState(() =>
//     [...SEED_AUDIT].filter((a) => a.entityId === id).reverse(),
//   );

//   /* ── Find employee ── */
//   const original = useMemo(
//     () => INITIAL_EMPLOYEES.find((e) => e.id === id) || INITIAL_EMPLOYEES[0],
//     [id],
//   );

//   /* ── Form state ── */
//   const [form, setForm] = useState(() => ({
//     name: original.name,
//     email: original.email,
//     phone: original.phone,
//     gender: original.gender,
//     dob: original.dob,
//     dept: original.dept,
//     role: original.role,
//     grade: original.grade,
//     type: original.type,
//     status: original.status,
//     location: original.location,
//     manager: original.manager,
//     bankName: original.bankName,
//     accountNo: original.accountNo,
//     // Emergency contact (seeded)
//     ekName: "Kwame Johnson",
//     ekRelation: "Spouse",
//     ekPhone: "+234 802 345 6789",
//     ekEmail: "kwame.johnson@email.com",
//     // Access
//     systemRole: "Employee",
//     twoFA: false,
//   }));

//   useEffect(() => {
//     const t = setTimeout(() => setLoading(false), 900);
//     return () => clearTimeout(t);
//   }, []);

//   /* ── Dirty detection ── */
//   const FIELD_LABELS = {
//     name: "Full Name",
//     email: "Email Address",
//     phone: "Phone Number",
//     gender: "Gender",
//     dob: "Date of Birth",
//     dept: "Department",
//     role: "Role",
//     grade: "Grade",
//     type: "Employment Type",
//     status: "Status",
//     location: "Location",
//     manager: "Line Manager",
//     bankName: "Bank Name",
//     accountNo: "Account Number",
//     ekName: "Emergency Contact Name",
//     ekRelation: "Relationship",
//     ekPhone: "Emergency Phone",
//     ekEmail: "Emergency Email",
//     systemRole: "System Role",
//   };

//   const originalFlat = useMemo(
//     () => ({
//       name: original.name,
//       email: original.email,
//       phone: original.phone,
//       gender: original.gender,
//       dob: original.dob,
//       dept: original.dept,
//       role: original.role,
//       grade: original.grade,
//       type: original.type,
//       status: original.status,
//       location: original.location,
//       manager: original.manager,
//       bankName: original.bankName,
//       accountNo: original.accountNo,
//       ekName: "Kwame Johnson",
//       ekRelation: "Spouse",
//       ekPhone: "+234 802 345 6789",
//       ekEmail: "kwame.johnson@email.com",
//       systemRole: "Employee",
//     }),
//     [original],
//   );

//   const dirtyFields = useMemo(
//     () => Object.keys(FIELD_LABELS).filter((k) => form[k] !== originalFlat[k]),
//     [form, originalFlat],
//   );

//   const isDirty = dirtyFields.length > 0;

//   const changedRows = useMemo(
//     () =>
//       dirtyFields.map((k) => ({
//         key: k,
//         label: FIELD_LABELS[k],
//         old: originalFlat[k],
//         new: form[k],
//       })),
//     [dirtyFields, form, originalFlat],
//   );

//   /* ── Field update helper ── */
//   const set = useCallback((key, val) => {
//     setForm((p) => ({ ...p, [key]: val }));
//     setErrors((p) => ({ ...p, [key]: null }));
//   }, []);

//   /* ── Validate only touched required fields ── */
//   const validate = () => {
//     const errs = {};
//     [
//       "name",
//       "email",
//       "phone",
//       "dept",
//       "role",
//       "grade",
//       "type",
//       "status",
//       "location",
//     ].forEach((k) => {
//       const v = VALIDATORS[k]?.(form[k]);
//       if (v) errs[k] = v;
//     });
//     if (form.accountNo) {
//       const v = VALIDATORS.accountNo(form.accountNo);
//       if (v) errs.accountNo = v;
//     }
//     setErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   /* ── Save flow ── */
//   const handleSave = () => {
//     if (!validate()) {
//       // Scroll to first error tab
//       const errorFields = Object.keys(errors);
//       const personalFields = ["name", "email", "phone", "gender", "dob"];
//       const jobFields = [
//         "dept",
//         "role",
//         "grade",
//         "type",
//         "status",
//         "location",
//         "manager",
//       ];
//       const bankFields = ["bankName", "accountNo"];
//       if (errorFields.some((f) => personalFields.includes(f)))
//         setActiveTab("personal");
//       else if (errorFields.some((f) => jobFields.includes(f)))
//         setActiveTab("job");
//       else if (errorFields.some((f) => bankFields.includes(f)))
//         setActiveTab("bank");
//       return;
//     }
//     if (dirtyFields.length === 0) {
//       setToast("No changes to save.");
//       return;
//     }
//     setShowConfirm(true);
//   };

//   const confirmSave = () => {
//     setShowConfirm(false);
//     // Append to audit trail
//     const now = new Date();
//     const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
//     const newEntries = changedRows.map((ch, i) => ({
//       id: `AUD-NEW-${Date.now()}-${i}`,
//       action: `${ch.label} updated`,
//       actor: ADMIN.name,
//       actorId: ADMIN.id,
//       entityId: original.id,
//       entityName: original.name,
//       timestamp: ts,
//       field: ch.key,
//       from: ch.old,
//       to: ch.new,
//     }));
//     setAudit((p) => [...newEntries.reverse(), ...p]);
//     setToast(`${original.name}'s profile updated successfully.`);
//   };

//   /* ── Navigation guard ── */
//   const safeNavigate = (path) => {
//     if (isDirty) {
//       setPendingNav(path);
//       setShowUnsaved(true);
//     } else navigate(path);
//   };

//   /* ── Available roles ── */
//   const availableRoles = useMemo(
//     () => ROLES_BY_DEPT[form.dept] || [],
//     [form.dept],
//   );

//   /* ── Tab error indicators ── */
//   const tabHasError = (tabId) => {
//     const map = {
//       personal: ["name", "email", "phone", "gender", "dob"],
//       job: ["dept", "role", "grade", "type", "status", "location"],
//       bank: ["accountNo"],
//     };
//     return (map[tabId] || []).some((f) => errors[f]);
//   };

//   /* ════════════════════ RENDER ════════════════════ */
//   return (
//     <div
//       className="min-h-screen"
//       style={{
//         background: C.bg,
//         fontFamily: "'DM Sans',sans-serif",
//         color: C.textPrimary,
//       }}
//     >
//       <div className="flex h-screen overflow-hidden">
//         {/* Sidebar */}
//         <AdminSideNavbar
//           sidebarOpen={sidebarOpen}
//           collapsed={collapsed}
//           setCollapsed={setCollapsed}
//           ADMIN={ADMIN}
//           pendingApprovals={7}
//         />

//         {/* Main */}
//         <div className="flex-1 flex flex-col overflow-hidden min-w-0">
//           {/* Top Nav */}
//           <header
//             className="shrink-0 h-[58px] flex items-center px-5 gap-3 z-10"
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
//               className="w-9 h-9 rounded-xl hidden md:flex items-center justify-center"
//               style={{
//                 background: C.surface,
//                 border: `1px solid ${C.border}`,
//                 cursor: "pointer",
//               }}
//             >
//               <Menu size={15} color={C.textSecondary} />
//             </motion.button>

//             {/* Breadcrumb */}
//             <div
//               className="flex items-center gap-1.5 text-xs"
//               style={{ color: C.textSecondary }}
//             >
//               <button
//                 onClick={() => safeNavigate("/admin/employees")}
//                 className="hover:underline"
//                 style={{
//                   background: "none",
//                   border: "none",
//                   cursor: "pointer",
//                   color: C.primary,
//                   fontSize: 12,
//                   fontWeight: 600,
//                 }}
//               >
//                 All Employees
//               </button>
//               <ChevronRight size={11} />
//               <span style={{ color: C.textSecondary }}>{original.name}</span>
//               <ChevronRight size={11} />
//               <span className="font-semibold" style={{ color: C.textPrimary }}>
//                 Edit
//               </span>
//             </div>

//             <div className="ml-auto flex items-center gap-2.5">
//               {isDirty && (
//                 <motion.div
//                   initial={{ scale: 0 }}
//                   animate={{ scale: 1 }}
//                   className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold"
//                   style={{ background: C.warningLight, color: C.warning }}
//                 >
//                   <AlertCircle size={11} /> {dirtyFields.length} unsaved change
//                   {dirtyFields.length > 1 ? "s" : ""}
//                 </motion.div>
//               )}
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 onClick={() => setShowAudit((p) => !p)}
//                 className="w-9 h-9 rounded-xl flex items-center justify-center"
//                 style={{
//                   background: showAudit ? C.primaryLight : C.surface,
//                   border: `1px solid ${showAudit ? C.primary : C.border}`,
//                   cursor: "pointer",
//                 }}
//               >
//                 <History
//                   size={14}
//                   color={showAudit ? C.primary : C.textSecondary}
//                 />
//               </motion.button>
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

//           {/* Content */}
//           <main className="flex-1 overflow-y-auto p-5 md:p-6">
//             {/* ── Page header ── */}
//             <motion.div
//               variants={fadeUp}
//               initial="hidden"
//               animate="visible"
//               custom={0}
//               className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5"
//             >
//               <div className="flex items-center gap-4">
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() =>
//                     safeNavigate(`/admin/employees/${original.id}`)
//                   }
//                   className="w-9 h-9 rounded-xl flex items-center justify-center"
//                   style={{
//                     background: C.surface,
//                     border: `1px solid ${C.border}`,
//                     cursor: "pointer",
//                   }}
//                 >
//                   <ArrowLeft size={15} color={C.textSecondary} />
//                 </motion.button>
//                 <div className="flex items-center gap-3">
//                   {loading ? (
//                     <div
//                       className="w-12 h-12 rounded-2xl"
//                       style={{ background: C.border }}
//                     />
//                   ) : (
//                     <Av
//                       initials={original.initials}
//                       dept={original.dept}
//                       size={48}
//                     />
//                   )}
//                   <div>
//                     <h1
//                       className="text-xl font-bold"
//                       style={{
//                         color: C.textPrimary,
//                         fontFamily: "Sora,sans-serif",
//                       }}
//                     >
//                       {loading ? "Loading…" : `Edit: ${original.name}`}
//                     </h1>
//                     <p
//                       className="text-xs mt-0.5"
//                       style={{ color: C.textSecondary }}
//                     >
//                       {original.id} · {original.dept}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-center gap-2">
//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.97 }}
//                   onClick={() => safeNavigate("/admin/employees")}
//                   className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
//                   style={{
//                     background: C.surface,
//                     border: `1px solid ${C.border}`,
//                     color: C.textSecondary,
//                     cursor: "pointer",
//                   }}
//                 >
//                   <X size={12} /> Discard
//                 </motion.button>
//                 <motion.button
//                   whileHover={{ scale: 1.02, y: -1 }}
//                   whileTap={{ scale: 0.97 }}
//                   onClick={handleSave}
//                   className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white"
//                   style={{
//                     background: `linear-gradient(135deg,${C.primary},${C.purple})`,
//                     border: "none",
//                     cursor: "pointer",
//                     boxShadow: `0 3px 12px ${C.primaryGlow}`,
//                   }}
//                 >
//                   <Save size={12} /> Save Changes
//                 </motion.button>
//               </div>
//             </motion.div>

//             {/* ── Last modified banner ── */}
//             {!loading && audit.length > 0 && (
//               <motion.div
//                 variants={fadeUp}
//                 initial="hidden"
//                 animate="visible"
//                 custom={1}
//                 className="flex items-center gap-3 px-4 py-2.5 rounded-xl mb-5"
//                 style={{
//                   background: C.primaryLight,
//                   border: `1px solid ${C.primary}22`,
//                 }}
//               >
//                 <Clock size={13} color={C.primary} />
//                 <p className="text-xs" style={{ color: C.textSecondary }}>
//                   Last modified by{" "}
//                   <span className="font-bold" style={{ color: C.primary }}>
//                     {audit[0].actor}
//                   </span>{" "}
//                   on{" "}
//                   <span
//                     className="font-semibold"
//                     style={{ color: C.textPrimary }}
//                   >
//                     {audit[0].timestamp}
//                   </span>
//                 </p>
//               </motion.div>
//             )}

//             <div className="flex gap-5">
//               {/* ── LEFT: Form ── */}
//               <div className="flex-1 min-w-0 space-y-5">
//                 {/* Tabs */}
//                 <motion.div
//                   variants={fadeUp}
//                   initial="hidden"
//                   animate="visible"
//                   custom={2}
//                   className="flex gap-1 p-1 rounded-2xl border overflow-x-auto"
//                   style={{ background: C.surface, borderColor: C.border }}
//                 >
//                   {TABS.map(({ id: tid, label, icon: Icon }) => {
//                     const active = activeTab === tid;
//                     const hasErr = tabHasError(tid);
//                     return (
//                       <motion.button
//                         key={tid}
//                         whileHover={{ scale: active ? 1 : 1.02 }}
//                         whileTap={{ scale: 0.97 }}
//                         onClick={() => setActiveTab(tid)}
//                         className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0"
//                         style={{
//                           background: active ? C.primary : "transparent",
//                           color: active ? "#fff" : C.textSecondary,
//                           boxShadow: active
//                             ? "0 2px 8px rgba(79,70,229,0.25)"
//                             : "none",
//                           border: "none",
//                           cursor: "pointer",
//                           transition: "all 0.18s",
//                         }}
//                       >
//                         <Icon size={12} />
//                         {label}
//                         {hasErr && (
//                           <span
//                             className="w-1.5 h-1.5 rounded-full absolute top-1.5 right-1.5"
//                             style={{ background: C.danger }}
//                           />
//                         )}
//                       </motion.button>
//                     );
//                   })}
//                 </motion.div>

//                 {/* ── PERSONAL TAB ── */}
//                 <AnimatePresence mode="wait">
//                   {activeTab === "personal" && !loading && (
//                     <motion.div
//                       key="personal"
//                       initial={{ opacity: 0, y: 8 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0 }}
//                       className="space-y-4"
//                     >
//                       <Card>
//                         <div className="p-5 pb-2">
//                           <div className="flex items-center gap-2 mb-5">
//                             <div
//                               className="w-7 h-7 rounded-lg flex items-center justify-center"
//                               style={{ background: C.primaryLight }}
//                             >
//                               <User size={13} color={C.primary} />
//                             </div>
//                             <span
//                               className="text-sm font-bold"
//                               style={{ color: C.textPrimary }}
//                             >
//                               Personal Information
//                             </span>
//                           </div>

//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
//                             <div>
//                               <Label required>Full Name</Label>
//                               <Input
//                                 value={form.name}
//                                 onChange={(e) => set("name", e.target.value)}
//                                 placeholder="e.g. Amara Johnson"
//                                 error={errors.name}
//                               />
//                               <FieldError msg={errors.name} />
//                             </div>

//                             <div>
//                               <Label required>Email Address</Label>
//                               <Input
//                                 value={form.email}
//                                 onChange={(e) => set("email", e.target.value)}
//                                 placeholder="amara@hriscloud.com"
//                                 type="email"
//                                 error={errors.email}
//                               />
//                               <FieldError msg={errors.email} />
//                             </div>

//                             <div>
//                               <Label required>Phone Number</Label>
//                               <Input
//                                 value={form.phone}
//                                 onChange={(e) => set("phone", e.target.value)}
//                                 placeholder="+234 800 000 0000"
//                                 error={errors.phone}
//                               />
//                               <FieldError msg={errors.phone} />
//                             </div>

//                             <div>
//                               <Label>Gender</Label>
//                               <Select
//                                 value={form.gender}
//                                 onChange={(e) => set("gender", e.target.value)}
//                                 options={[
//                                   "Male",
//                                   "Female",
//                                   "Prefer not to say",
//                                 ]}
//                               />
//                             </div>

//                             <div>
//                               <Label>Date of Birth</Label>
//                               <Input
//                                 value={form.dob}
//                                 onChange={(e) => set("dob", e.target.value)}
//                                 type="date"
//                               />
//                             </div>
//                           </div>
//                         </div>

//                         {/* Dirty field summary */}
//                         <AnimatePresence>
//                           {dirtyFields.filter((f) =>
//                             [
//                               "name",
//                               "email",
//                               "phone",
//                               "gender",
//                               "dob",
//                             ].includes(f),
//                           ).length > 0 && (
//                             <motion.div
//                               initial={{ height: 0, opacity: 0 }}
//                               animate={{ height: "auto", opacity: 1 }}
//                               exit={{ height: 0, opacity: 0 }}
//                               className="mx-5 mb-4 p-3 rounded-xl overflow-hidden"
//                               style={{
//                                 background: C.warningLight,
//                                 border: `1px solid ${C.warning}33`,
//                               }}
//                             >
//                               <p
//                                 className="text-[11px] font-semibold"
//                                 style={{ color: C.warning }}
//                               >
//                                 ⚠ Unsaved changes:{" "}
//                                 {dirtyFields
//                                   .filter((f) =>
//                                     [
//                                       "name",
//                                       "email",
//                                       "phone",
//                                       "gender",
//                                       "dob",
//                                     ].includes(f),
//                                   )
//                                   .map((f) => FIELD_LABELS[f])
//                                   .join(", ")}
//                               </p>
//                             </motion.div>
//                           )}
//                         </AnimatePresence>
//                       </Card>
//                     </motion.div>
//                   )}

//                   {/* ── JOB TAB ── */}
//                   {activeTab === "job" && !loading && (
//                     <motion.div
//                       key="job"
//                       initial={{ opacity: 0, y: 8 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0 }}
//                     >
//                       <Card>
//                         <div className="p-5">
//                           <div className="flex items-center gap-2 mb-5">
//                             <div
//                               className="w-7 h-7 rounded-lg flex items-center justify-center"
//                               style={{ background: C.purpleLight }}
//                             >
//                               <Briefcase size={13} color={C.purple} />
//                             </div>
//                             <span
//                               className="text-sm font-bold"
//                               style={{ color: C.textPrimary }}
//                             >
//                               Job Details
//                             </span>
//                           </div>

//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
//                             <div>
//                               <Label required>Department</Label>
//                               <Select
//                                 value={form.dept}
//                                 onChange={(e) => {
//                                   set("dept", e.target.value);
//                                   set("role", "");
//                                 }}
//                                 options={DEPARTMENTS}
//                                 error={errors.dept}
//                               />
//                               <FieldError msg={errors.dept} />
//                             </div>

//                             <div>
//                               <Label required>Role / Position</Label>
//                               <Select
//                                 value={form.role}
//                                 onChange={(e) => set("role", e.target.value)}
//                                 options={availableRoles}
//                                 error={errors.role}
//                                 disabled={!form.dept}
//                               />
//                               <FieldError msg={errors.role} />
//                             </div>

//                             <div>
//                               <Label required>Grade</Label>
//                               <Select
//                                 value={form.grade}
//                                 onChange={(e) => set("grade", e.target.value)}
//                                 options={GRADES}
//                                 error={errors.grade}
//                               />
//                               <FieldError msg={errors.grade} />
//                             </div>

//                             <div>
//                               <Label required>Employment Type</Label>
//                               <Select
//                                 value={form.type}
//                                 onChange={(e) => set("type", e.target.value)}
//                                 options={EMP_TYPES}
//                                 error={errors.type}
//                               />
//                               <FieldError msg={errors.type} />
//                             </div>

//                             <div>
//                               <Label required>Work Location</Label>
//                               <Select
//                                 value={form.location}
//                                 onChange={(e) =>
//                                   set("location", e.target.value)
//                                 }
//                                 options={LOCATIONS}
//                                 error={errors.location}
//                               />
//                               <FieldError msg={errors.location} />
//                             </div>

//                             <div>
//                               <Label>Line Manager</Label>
//                               <Input
//                                 value={form.manager}
//                                 onChange={(e) => set("manager", e.target.value)}
//                                 placeholder="Manager name"
//                               />
//                             </div>

//                             <div>
//                               <Label>Employee ID</Label>
//                               <Input value={original.id} disabled mono />
//                               <p
//                                 className="text-[10px] mt-1 flex items-center gap-1"
//                                 style={{ color: C.textMuted }}
//                               >
//                                 <Info size={9} /> Employee ID cannot be changed
//                               </p>
//                             </div>

//                             <div>
//                               <Label>Join Date</Label>
//                               <Input value={original.joined} disabled />
//                               <p
//                                 className="text-[10px] mt-1 flex items-center gap-1"
//                                 style={{ color: C.textMuted }}
//                               >
//                                 <Info size={9} /> Join date cannot be changed
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       </Card>
//                     </motion.div>
//                   )}

//                   {/* ── BANK TAB ── */}
//                   {activeTab === "bank" && !loading && (
//                     <motion.div
//                       key="bank"
//                       initial={{ opacity: 0, y: 8 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0 }}
//                       className="space-y-4"
//                     >
//                       <div
//                         className="flex items-center gap-3 p-3 rounded-xl"
//                         style={{
//                           background: C.warningLight,
//                           border: `1px solid ${C.warning}33`,
//                         }}
//                       >
//                         <AlertTriangle
//                           size={14}
//                           color={C.warning}
//                           className="shrink-0"
//                         />
//                         <p
//                           className="text-xs font-medium"
//                           style={{ color: C.warning }}
//                         >
//                           Bank details are sensitive. All changes are logged and
//                           require HR verification.
//                         </p>
//                       </div>

//                       <Card>
//                         <div className="p-5">
//                           <div className="flex items-center gap-2 mb-5">
//                             <div
//                               className="w-7 h-7 rounded-lg flex items-center justify-center"
//                               style={{ background: C.successLight }}
//                             >
//                               <CreditCard size={13} color={C.success} />
//                             </div>
//                             <span
//                               className="text-sm font-bold"
//                               style={{ color: C.textPrimary }}
//                             >
//                               Bank & Payroll Information
//                             </span>
//                           </div>

//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
//                             <div>
//                               <Label>Bank Name</Label>
//                               <Select
//                                 value={form.bankName}
//                                 onChange={(e) =>
//                                   set("bankName", e.target.value)
//                                 }
//                                 options={[
//                                   "Access Bank",
//                                   "Zenith Bank",
//                                   "GTBank",
//                                   "First Bank",
//                                   "UBA",
//                                   "Fidelity Bank",
//                                   "Stanbic IBTC",
//                                   "FCMB",
//                                 ]}
//                               />
//                             </div>

//                             <div>
//                               <Label>Account Number</Label>
//                               <div className="relative">
//                                 <Input
//                                   value={
//                                     showAccNo
//                                       ? form.accountNo
//                                       : form.accountNo.replace(/./g, "•")
//                                   }
//                                   onChange={(e) =>
//                                     set(
//                                       "accountNo",
//                                       e.target.value
//                                         .replace(/\D/g, "")
//                                         .slice(0, 10),
//                                     )
//                                   }
//                                   placeholder="10-digit account number"
//                                   error={errors.accountNo}
//                                   mono
//                                 />
//                                 <button
//                                   type="button"
//                                   onClick={() => setShowAccNo((p) => !p)}
//                                   className="absolute right-3 top-1/2 -translate-y-1/2"
//                                   style={{
//                                     background: "none",
//                                     border: "none",
//                                     cursor: "pointer",
//                                   }}
//                                 >
//                                   {showAccNo ? (
//                                     <EyeOff size={14} color={C.textMuted} />
//                                   ) : (
//                                     <Eye size={14} color={C.textMuted} />
//                                   )}
//                                 </button>
//                               </div>
//                               <FieldError msg={errors.accountNo} />
//                             </div>

//                             <div>
//                               <Label>Account Name</Label>
//                               <Input value={form.name} disabled />
//                               <p
//                                 className="text-[10px] mt-1 flex items-center gap-1"
//                                 style={{ color: C.textMuted }}
//                               >
//                                 <Info size={9} /> Must match employee full name
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       </Card>
//                     </motion.div>
//                   )}

//                   {/* ── EMERGENCY TAB ── */}
//                   {activeTab === "emergency" && !loading && (
//                     <motion.div
//                       key="emergency"
//                       initial={{ opacity: 0, y: 8 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0 }}
//                     >
//                       <Card>
//                         <div className="p-5">
//                           <div className="flex items-center gap-2 mb-5">
//                             <div
//                               className="w-7 h-7 rounded-lg flex items-center justify-center"
//                               style={{ background: C.dangerLight }}
//                             >
//                               <Phone size={13} color={C.danger} />
//                             </div>
//                             <span
//                               className="text-sm font-bold"
//                               style={{ color: C.textPrimary }}
//                             >
//                               Emergency Contact
//                             </span>
//                           </div>

//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
//                             <div>
//                               <Label>Contact Name</Label>
//                               <Input
//                                 value={form.ekName}
//                                 onChange={(e) => set("ekName", e.target.value)}
//                                 placeholder="Full name"
//                               />
//                             </div>
//                             <div>
//                               <Label>Relationship</Label>
//                               <Select
//                                 value={form.ekRelation}
//                                 onChange={(e) =>
//                                   set("ekRelation", e.target.value)
//                                 }
//                                 options={[
//                                   "Spouse",
//                                   "Parent",
//                                   "Sibling",
//                                   "Child",
//                                   "Friend",
//                                   "Other",
//                                 ]}
//                               />
//                             </div>
//                             <div>
//                               <Label>Phone Number</Label>
//                               <Input
//                                 value={form.ekPhone}
//                                 onChange={(e) => set("ekPhone", e.target.value)}
//                                 placeholder="+234 800 000 0000"
//                               />
//                             </div>
//                             <div>
//                               <Label>Email Address</Label>
//                               <Input
//                                 value={form.ekEmail}
//                                 onChange={(e) => set("ekEmail", e.target.value)}
//                                 placeholder="contact@email.com"
//                                 type="email"
//                               />
//                             </div>
//                           </div>
//                         </div>
//                       </Card>
//                     </motion.div>
//                   )}

//                   {/* ── ACCESS TAB ── */}
//                   {activeTab === "access" && !loading && (
//                     <motion.div
//                       key="access"
//                       initial={{ opacity: 0, y: 8 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0 }}
//                       className="space-y-4"
//                     >
//                       <Card>
//                         <div className="p-5">
//                           <div className="flex items-center gap-2 mb-5">
//                             <div
//                               className="w-7 h-7 rounded-lg flex items-center justify-center"
//                               style={{ background: C.accentLight }}
//                             >
//                               <Shield size={13} color={C.accent} />
//                             </div>
//                             <span
//                               className="text-sm font-bold"
//                               style={{ color: C.textPrimary }}
//                             >
//                               Account Status & Access
//                             </span>
//                           </div>

//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-5">
//                             <div>
//                               <Label required>Employment Status</Label>
//                               <Select
//                                 value={form.status}
//                                 onChange={(e) => set("status", e.target.value)}
//                                 options={STATUSES}
//                                 error={errors.status}
//                               />
//                               <FieldError msg={errors.status} />
//                             </div>
//                             <div>
//                               <Label>System Role</Label>
//                               <Select
//                                 value={form.systemRole}
//                                 onChange={(e) =>
//                                   set("systemRole", e.target.value)
//                                 }
//                                 options={[
//                                   "Employee",
//                                   "Manager",
//                                   "Department Head",
//                                   "HR Admin",
//                                   "Super Admin",
//                                 ]}
//                               />
//                             </div>
//                           </div>

//                           {/* 2FA toggle */}
//                           <div
//                             className="flex items-center justify-between p-4 rounded-xl"
//                             style={{
//                               background: C.surfaceAlt,
//                               border: `1px solid ${C.border}`,
//                             }}
//                           >
//                             <div>
//                               <p
//                                 className="text-sm font-semibold"
//                                 style={{ color: C.textPrimary }}
//                               >
//                                 Two-Factor Authentication
//                               </p>
//                               <p
//                                 className="text-xs mt-0.5"
//                                 style={{ color: C.textSecondary }}
//                               >
//                                 {form.twoFA
//                                   ? "Enabled — account is more secure"
//                                   : "Disabled — recommend enabling"}
//                               </p>
//                             </div>
//                             <motion.button
//                               whileTap={{ scale: 0.95 }}
//                               onClick={() => set("twoFA", !form.twoFA)}
//                               style={{
//                                 width: 44,
//                                 height: 24,
//                                 borderRadius: 99,
//                                 background: form.twoFA ? C.success : C.border,
//                                 border: "none",
//                                 cursor: "pointer",
//                                 position: "relative",
//                                 transition: "background 0.25s",
//                               }}
//                             >
//                               <motion.div
//                                 animate={{ x: form.twoFA ? 20 : 2 }}
//                                 transition={{
//                                   type: "spring",
//                                   stiffness: 300,
//                                   damping: 22,
//                                 }}
//                                 style={{
//                                   width: 18,
//                                   height: 18,
//                                   borderRadius: "50%",
//                                   background: "#fff",
//                                   position: "absolute",
//                                   top: 3,
//                                   boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
//                                 }}
//                               />
//                             </motion.button>
//                           </div>

//                           {/* Status warning */}
//                           {form.status === "Inactive" && (
//                             <motion.div
//                               initial={{ opacity: 0, y: -4 }}
//                               animate={{ opacity: 1, y: 0 }}
//                               className="mt-4 p-3 rounded-xl flex items-center gap-2"
//                               style={{
//                                 background: C.dangerLight,
//                                 border: `1px solid ${C.danger}22`,
//                               }}
//                             >
//                               <Lock size={13} color={C.danger} />
//                               <p
//                                 className="text-xs font-medium"
//                                 style={{ color: C.danger }}
//                               >
//                                 Setting status to Inactive will revoke system
//                                 access immediately.
//                               </p>
//                             </motion.div>
//                           )}
//                         </div>
//                       </Card>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//                 {/* Bottom save bar */}
//                 {!loading && (
//                   <motion.div
//                     variants={fadeUp}
//                     initial="hidden"
//                     animate="visible"
//                     custom={3}
//                     className="flex items-center justify-between p-4 rounded-2xl"
//                     style={{
//                       background: C.surface,
//                       border: `1px solid ${C.border}`,
//                     }}
//                   >
//                     <p className="text-xs" style={{ color: C.textMuted }}>
//                       {isDirty ? (
//                         <>
//                           <span
//                             className="font-semibold"
//                             style={{ color: C.warning }}
//                           >
//                             {dirtyFields.length} change
//                             {dirtyFields.length > 1 ? "s" : ""}
//                           </span>{" "}
//                           pending save
//                         </>
//                       ) : (
//                         "All changes saved"
//                       )}
//                     </p>
//                     <div className="flex gap-2">
//                       <motion.button
//                         whileHover={{ scale: 1.02 }}
//                         whileTap={{ scale: 0.97 }}
//                         onClick={() => setForm(originalFlat)}
//                         className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
//                         style={{
//                           background: C.surfaceAlt,
//                           border: `1px solid ${C.border}`,
//                           color: C.textSecondary,
//                           cursor: "pointer",
//                         }}
//                       >
//                         <RefreshCw size={11} /> Reset
//                       </motion.button>
//                       <motion.button
//                         whileHover={{ scale: 1.02, y: -1 }}
//                         whileTap={{ scale: 0.97 }}
//                         onClick={handleSave}
//                         className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white"
//                         style={{
//                           background: `linear-gradient(135deg,${C.primary},${C.purple})`,
//                           border: "none",
//                           cursor: "pointer",
//                           boxShadow: `0 3px 12px ${C.primaryGlow}`,
//                         }}
//                       >
//                         <Save size={12} /> Save Changes
//                       </motion.button>
//                     </div>
//                   </motion.div>
//                 )}
//               </div>

//               {/* ── RIGHT: Audit Trail ── */}
//               <AnimatePresence>
//                 {showAudit && (
//                   <motion.div
//                     initial={{ opacity: 0, x: 20, width: 0 }}
//                     animate={{ opacity: 1, x: 0, width: 300 }}
//                     exit={{ opacity: 0, x: 20, width: 0 }}
//                     transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
//                     className="shrink-0 overflow-hidden"
//                   >
//                     <Card className="h-full" style={{ width: 300 }}>
//                       <div
//                         className="p-4"
//                         style={{ borderBottom: `1px solid ${C.border}` }}
//                       >
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-2">
//                             <div
//                               className="w-7 h-7 rounded-lg flex items-center justify-center"
//                               style={{ background: C.primaryLight }}
//                             >
//                               <History size={13} color={C.primary} />
//                             </div>
//                             <span
//                               className="text-sm font-bold"
//                               style={{ color: C.textPrimary }}
//                             >
//                               Audit Trail
//                             </span>
//                           </div>
//                           <button
//                             onClick={() => setShowAudit(false)}
//                             style={{
//                               background: "none",
//                               border: "none",
//                               cursor: "pointer",
//                             }}
//                           >
//                             <X size={13} color={C.textMuted} />
//                           </button>
//                         </div>
//                       </div>
//                       <div
//                         className="p-4 space-y-4 overflow-y-auto"
//                         style={{ maxHeight: "calc(100vh - 200px)" }}
//                       >
//                         {audit.length === 0 ? (
//                           <div className="text-center py-8">
//                             <History
//                               size={32}
//                               color={C.textMuted}
//                               className="mx-auto mb-2"
//                             />
//                             <p
//                               className="text-xs"
//                               style={{ color: C.textMuted }}
//                             >
//                               No audit history yet
//                             </p>
//                           </div>
//                         ) : (
//                           audit.map((entry, i) => (
//                             <AuditRow key={entry.id} entry={entry} i={i} />
//                           ))
//                         )}
//                       </div>
//                     </Card>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           </main>
//         </div>
//       </div>

//       {/* ── MODALS ── */}
//       <AnimatePresence>
//         {showConfirm && (
//           <ConfirmModal
//             changes={changedRows}
//             onConfirm={confirmSave}
//             onCancel={() => setShowConfirm(false)}
//           />
//         )}
//         {showUnsaved && (
//           <UnsavedModal
//             onStay={() => {
//               setShowUnsaved(false);
//               setPendingNav(null);
//             }}
//             onLeave={() => {
//               setShowUnsaved(false);
//               navigate(pendingNav);
//             }}
//           />
//         )}
//         {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
//       </AnimatePresence>
//     </div>
//   );
// }


// src/admin/employeemanagement/EditEmployee.jsx
// Route: /admin/employeemanagement/admin-editemployee/:id
// Features:
//  • Full profile edit (Personal, Job, Bank, Emergency, Access)
//  • Assign Manager / Line Manager role (sets role = "manager" on the user)
//  • Move department
//  • Field-level dirty tracking
//  • Audit trail sidebar
//  • No mock data — 100% API connected
//  • motion → Motion throughout

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import AdminSideNavbar from "../AdminSideNavbar";
import { useAuth } from "../../components/AuthContext";
import {
  getEmployeeById,
  updateEmployee,
  getEmployeeHistory,
} from "../../api/service/employeeApi";
import { getEmployees } from "../../api/service/employeeApi";
import { departmentApi } from "../../api/service/departmentApi";
import { listJobRoles } from "../../api/service/jobRoleApi";
import C from "../../styles/colors";
import {
  ChevronRight, Save, X, Check, AlertCircle, User,
  Briefcase, CreditCard, Shield, Phone, Menu, History,
  ArrowLeft, CheckCircle2, RefreshCw, Building2, MapPin,
  Hash, Calendar, Mail, Users, Lock, Unlock, UserCog,
  Loader2, Award,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] } }),
};

const TABS = [
  { id: "personal",   label: "Personal Info",  icon: User },
  { id: "job",        label: "Job & Role",      icon: Briefcase },
  { id: "bank",       label: "Bank & Payroll",  icon: CreditCard },
  { id: "emergency",  label: "Emergency",       icon: Phone },
  { id: "access",     label: "Access & Role",   icon: Shield },
];

const EMP_TYPES = ["full_time", "part_time", "contract", "intern"];
const STATUSES  = ["active", "on_leave", "suspended", "terminated", "resigned"];
const GENDERS   = ["male", "female", "other"];
const MARITAL   = ["single", "married", "divorced", "widowed"];
const BANKS     = ["Access Bank","GTBank","Zenith Bank","First Bank","UBA","Stanbic IBTC","FCMB","Fidelity Bank","Polaris Bank","Wema Bank"];
const LOCATIONS = ["Lagos","Abuja","Port Harcourt","Ibadan","Kano","Enugu","Remote"];

// ── Shared atoms ──
function Card({ children, className = "", style = {} }) {
  return <div className={`rounded-2xl ${className}`} style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(15,23,42,0.04)", ...style }}>{children}</div>;
}

function Label({ children, required }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: C.textSecondary }}>
      {children}{required && <span style={{ color: C.danger }}>*</span>}
    </label>
  );
}

function Inp({ value, onChange, placeholder, error, type = "text", disabled = false, mono = false }) {
  return (
    <input type={type} value={value ?? ""} onChange={onChange} placeholder={placeholder} disabled={disabled}
      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
      style={{ border: `1.5px solid ${error ? C.danger : value ? C.primary : C.border}`, background: disabled ? C.surfaceAlt : C.surface, color: disabled ? C.textMuted : C.textPrimary, cursor: disabled ? "not-allowed" : "text", fontFamily: mono ? "monospace" : "inherit" }}
    />
  );
}

function Sel({ value, onChange, options, error, disabled = false, labelKey = null, valueKey = null }) {
  return (
    <select value={value ?? ""} onChange={onChange} disabled={disabled}
      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all appearance-none"
      style={{ border: `1.5px solid ${error ? C.danger : value ? C.primary : C.border}`, background: disabled ? C.surfaceAlt : C.surface, color: value ? C.textPrimary : C.textMuted, cursor: disabled ? "not-allowed" : "pointer" }}
    >
      <option value="">Select…</option>
      {options.map(o => (
        <option key={valueKey ? o[valueKey] : o} value={valueKey ? o[valueKey] : o}>
          {labelKey ? o[labelKey] : o}
        </option>
      ))}
    </select>
  );
}

function FieldErr({ msg }) {
  if (!msg) return null;
  return <Motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1 mt-1 text-[11px] font-medium" style={{ color: C.danger }}><AlertCircle size={10} />{msg}</Motion.p>;
}

function Toggle({ on, onToggle, label, sub }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
      <div>
        <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>{sub}</p>}
      </div>
      <Motion.button whileTap={{ scale: 0.95 }} onClick={onToggle}
        style={{ width: 44, height: 24, borderRadius: 99, background: on ? C.success : C.border, border: "none", cursor: "pointer", position: "relative", transition: "background 0.25s" }}
      >
        <Motion.div animate={{ x: on ? 20 : 2 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}
          style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
        />
      </Motion.button>
    </div>
  );
}

// ── Section wrappers ──
function SectionCard({ icon: Icon, title, color = C.primary, bg = C.primaryLight, children }) {
  return (
    <Card>
      <div className="flex items-center gap-3 p-4" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <Icon size={15} color={color} />
        </div>
        <p className="text-sm font-bold" style={{ color: C.textPrimary }}>{title}</p>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </Card>
  );
}

function Row({ label, required, error, children }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
      <FieldErr msg={error} />
    </div>
  );
}

const Grid2 = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;

// ════════════════════════════ MAIN ════════════════════════════
export default function EditEmployee() {
  const { id: employeeId } = useParams();
  const navigate = useNavigate();
  const { employee: adminUser } = useAuth();

  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [collapsed, setCollapsed]       = useState(false);
  const [activeTab, setActiveTab]       = useState("personal");
  const [emp, setEmp]                   = useState(null);
  const [form, setForm]                 = useState({});
  const [originalForm, setOriginalForm] = useState({});
  const [errors, setErrors]             = useState({});
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState(null);
  const [toast, setToast]               = useState(null);
  const [showAudit, setShowAudit]       = useState(false);
  const [audit, setAudit]               = useState([]);
  const [showConfirm, setShowConfirm]   = useState(false);

  // Reference data
  const [departments, setDepartments]   = useState([]);
  const [jobRoles, setJobRoles]         = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  // Flatten employee → form shape
  const flatten = (e) => ({
    firstName: e.first_name ?? "",
    lastName:  e.last_name  ?? "",
    middleName: e.middle_name ?? "",
    personalEmail: e.personal_email ?? "",
    phone: e.phone ?? "",
    gender: e.gender ?? "",
    dateOfBirth: e.date_of_birth ? e.date_of_birth.split("T")[0] : "",
    maritalStatus: e.marital_status ?? "",
    nationality: e.nationality ?? "",
    address: e.address ?? "",
    state: e.state ?? "",
    // Job
    departmentId: e.department_id ?? "",
    jobRoleId:    e.job_role_id    ?? "",
    managerId:    e.manager_id     ?? "",
    employmentType:   e.employment_type   ?? "",
    employmentStatus: e.employment_status ?? "",
    startDate:     e.start_date         ? e.start_date.split("T")[0] : "",
    confirmationDate: e.confirmation_date ? e.confirmation_date.split("T")[0] : "",
    location: e.location ?? "",
    payGrade: e.pay_grade ?? "",
    // Bank
    basicSalary: e.basic_salary ?? "",
    housingAllowance: e.housing_allowance ?? "",
    transportAllowance: e.transport_allowance ?? "",
    medicalAllowance: e.medical_allowance ?? "",
    otherAllowances: e.other_allowances ?? "",
    bankName: e.bank_name ?? "",
    accountNumber: e.account_number ?? "",
    accountName: e.account_name ?? "",
    pensionPin: e.pension_pin ?? "",
    taxId: e.tax_id ?? "",
    // Emergency
    nokName:         e.nok_name         ?? "",
    nokRelationship: e.nok_relationship ?? "",
    nokPhone:        e.nok_phone        ?? "",
    nokAddress:      e.nok_address      ?? "",
    // Access
    isManager: e.role === "manager" || e.employment_role === "manager",
    isActive:  e.employment_status === "active",
    bio: e.bio ?? "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [empRes, auditRes, deptsRes, rolesRes, empsRes] = await Promise.all([
        getEmployeeById(employeeId),
        getEmployeeHistory(employeeId).catch(() => ({ data: [] })),
        departmentApi.list().catch(() => ({ departments: [] })),
        listJobRoles().catch(() => ({ roles: [] })),
        getEmployees({ limit: 200 }).catch(() => ({ data: [] })),
      ]);
      const e = empRes.data ?? empRes;
      setEmp(e);
      const f = flatten(e);
      setForm(f);
      setOriginalForm(f);
      setAudit(auditRes.data ?? auditRes.rows ?? []);
      setDepartments(deptsRes.departments ?? deptsRes.data ?? []);
      setJobRoles(rolesRes.roles ?? rolesRes.data ?? []);
      setAllEmployees((empsRes.data ?? []).filter(x => x.id !== employeeId));
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load employee.");
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => { load(); }, [load]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Dirty tracking
  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(originalForm), [form, originalForm]);
  const dirtyFields = useMemo(() => Object.keys(form).filter(k => form[k] !== originalForm[k]), [form, originalForm]);

  // Validate
  const validate = () => {
    const e = {};
    if (!form.firstName?.trim()) e.firstName = "Required";
    if (!form.lastName?.trim())  e.lastName  = "Required";
    if (!form.employmentType)    e.employmentType = "Required";
    if (!form.employmentStatus)  e.employmentStatus = "Required";
    if (form.accountNumber && !/^\d{10}$/.test(form.accountNumber)) e.accountNumber = "Must be 10 digits";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = () => {
    if (!validate()) return;
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    setShowConfirm(false);
    setSaving(true);
    try {
      const payload = {
        firstName:         form.firstName,
        lastName:          form.lastName,
        middleName:        form.middleName || undefined,
        personalEmail:     form.personalEmail || undefined,
        phone:             form.phone || undefined,
        gender:            form.gender || undefined,
        dateOfBirth:       form.dateOfBirth || undefined,
        maritalStatus:     form.maritalStatus || undefined,
        nationality:       form.nationality || undefined,
        address:           form.address || undefined,
        state:             form.state || undefined,
        departmentId:      form.departmentId || undefined,
        jobRoleId:         form.jobRoleId || undefined,
        managerId:         form.managerId || undefined,
        employmentType:    form.employmentType,
        employmentStatus:  form.employmentStatus,
        startDate:         form.startDate || undefined,
        confirmationDate:  form.confirmationDate || undefined,
        location:          form.location || undefined,
        payGrade:          form.payGrade || undefined,
        basicSalary:       form.basicSalary ? Number(form.basicSalary) : undefined,
        housingAllowance:  form.housingAllowance ? Number(form.housingAllowance) : undefined,
        transportAllowance: form.transportAllowance ? Number(form.transportAllowance) : undefined,
        medicalAllowance:  form.medicalAllowance ? Number(form.medicalAllowance) : undefined,
        otherAllowances:   form.otherAllowances ? Number(form.otherAllowances) : undefined,
        bankName:          form.bankName || undefined,
        accountNumber:     form.accountNumber || undefined,
        accountName:       form.accountName || undefined,
        pensionPin:        form.pensionPin || undefined,
        taxId:             form.taxId || undefined,
        nokName:           form.nokName || undefined,
        nokRelationship:   form.nokRelationship || undefined,
        nokPhone:          form.nokPhone || undefined,
        nokAddress:        form.nokAddress || undefined,
        bio:               form.bio || undefined,
        // Manager role assignment — sets the user's role on the backend
        role:              form.isManager ? "manager" : "employee",
        notes:             dirtyFields.join(", "),
      };

      await updateEmployee(employeeId, payload);
      const refreshed = await getEmployeeById(employeeId);
      const e = refreshed.data ?? refreshed;
      setEmp(e);
      const f = flatten(e);
      setForm(f);
      setOriginalForm(f);
      showToast("Employee profile updated successfully.");
    } catch (e) {
      showToast(e?.response?.data?.message ?? "Save failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const filteredRoles = useMemo(() =>
    form.departmentId ? jobRoles.filter(r => r.departmentId === form.departmentId || !r.departmentId) : jobRoles,
    [jobRoles, form.departmentId]
  );

  const name = emp ? `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim() : "Employee";

  // ── Tab panels ──
  const renderTab = () => {
    switch (activeTab) {
      case "personal": return (
        <div className="space-y-4">
          <SectionCard icon={User} title="Personal Information">
            <Grid2>
              <Row label="First Name" required error={errors.firstName}><Inp value={form.firstName} onChange={e => set("firstName", e.target.value)} error={errors.firstName} /></Row>
              <Row label="Middle Name"><Inp value={form.middleName} onChange={e => set("middleName", e.target.value)} /></Row>
              <Row label="Last Name" required error={errors.lastName}><Inp value={form.lastName} onChange={e => set("lastName", e.target.value)} error={errors.lastName} /></Row>
              <Row label="Date of Birth"><Inp type="date" value={form.dateOfBirth} onChange={e => set("dateOfBirth", e.target.value)} /></Row>
              <Row label="Gender"><Sel value={form.gender} onChange={e => set("gender", e.target.value)} options={GENDERS} /></Row>
              <Row label="Marital Status"><Sel value={form.maritalStatus} onChange={e => set("maritalStatus", e.target.value)} options={MARITAL} /></Row>
              <Row label="Nationality"><Inp value={form.nationality} onChange={e => set("nationality", e.target.value)} /></Row>
              <Row label="Personal Email"><Inp type="email" value={form.personalEmail} onChange={e => set("personalEmail", e.target.value)} /></Row>
              <Row label="Phone"><Inp type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} /></Row>
              <Row label="Location"><Sel value={form.location} onChange={e => set("location", e.target.value)} options={LOCATIONS} /></Row>
            </Grid2>
            <Row label="Residential Address"><Inp value={form.address} onChange={e => set("address", e.target.value)} /></Row>
            <Row label="Bio"><textarea value={form.bio} onChange={e => set("bio", e.target.value)} rows={3} placeholder="Brief bio…" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ border: `1.5px solid ${form.bio ? C.primary : C.border}`, background: C.surface, color: C.textPrimary }} /></Row>
          </SectionCard>
        </div>
      );

      case "job": return (
        <div className="space-y-4">
          <SectionCard icon={Briefcase} title="Job Details" color={C.accent} bg={C.accentLight}>
            <Grid2>
              <Row label="Department">
                <Sel value={form.departmentId} onChange={e => { set("departmentId", e.target.value); set("jobRoleId", ""); }} options={departments} valueKey="id" labelKey="name" />
              </Row>
              <Row label="Job Role">
                <Sel value={form.jobRoleId} onChange={e => set("jobRoleId", e.target.value)} options={filteredRoles} valueKey="id" labelKey="title" disabled={!form.departmentId} />
              </Row>
              <Row label="Line Manager">
                <Sel value={form.managerId} onChange={e => set("managerId", e.target.value)} options={allEmployees} valueKey="id" labelKey={null}>
                  {allEmployees.map(e => (
                    <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.employee_code})</option>
                  ))}
                </Sel>
              </Row>
              <Row label="Employment Type" required error={errors.employmentType}><Sel value={form.employmentType} onChange={e => set("employmentType", e.target.value)} options={EMP_TYPES} error={errors.employmentType} /></Row>
              <Row label="Start Date"><Inp type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} /></Row>
              <Row label="Confirmation Date"><Inp type="date" value={form.confirmationDate} onChange={e => set("confirmationDate", e.target.value)} /></Row>
              <Row label="Pay Grade"><Inp value={form.payGrade} onChange={e => set("payGrade", e.target.value)} placeholder="e.g. Grade 4 – Senior" /></Row>
            </Grid2>
          </SectionCard>

          {/* Department Transfer notice */}
          {form.departmentId !== originalForm.departmentId && (
            <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: C.warningLight, border: `1px solid ${C.warning}33` }}>
              <Building2 size={16} color={C.warning} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold" style={{ color: C.warning }}>Department Transfer</p>
                <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>
                  This will log a department_change event in the employee's history and notify the employee.
                </p>
              </div>
            </div>
          )}
        </div>
      );

      case "bank": return (
        <div className="space-y-4">
          <SectionCard icon={CreditCard} title="Compensation" color={C.success} bg={C.successLight}>
            <Grid2>
              <Row label="Basic Salary (₦)"><Inp type="number" value={form.basicSalary} onChange={e => set("basicSalary", e.target.value)} placeholder="0" /></Row>
              <Row label="Housing Allowance (₦)"><Inp type="number" value={form.housingAllowance} onChange={e => set("housingAllowance", e.target.value)} placeholder="0" /></Row>
              <Row label="Transport Allowance (₦)"><Inp type="number" value={form.transportAllowance} onChange={e => set("transportAllowance", e.target.value)} placeholder="0" /></Row>
              <Row label="Medical Allowance (₦)"><Inp type="number" value={form.medicalAllowance} onChange={e => set("medicalAllowance", e.target.value)} placeholder="0" /></Row>
            </Grid2>
          </SectionCard>
          <SectionCard icon={Hash} title="Bank Details" color={C.warning} bg={C.warningLight}>
            <Grid2>
              <Row label="Bank Name"><Sel value={form.bankName} onChange={e => set("bankName", e.target.value)} options={BANKS} /></Row>
              <Row label="Account Name"><Inp value={form.accountName} onChange={e => set("accountName", e.target.value)} /></Row>
              <Row label="Account Number (NUBAN)" error={errors.accountNumber}>
                <Inp value={form.accountNumber} onChange={e => set("accountNumber", e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="0123456789" mono error={errors.accountNumber} />
              </Row>
              <Row label="Pension PIN"><Inp value={form.pensionPin} onChange={e => set("pensionPin", e.target.value)} mono /></Row>
              <Row label="Tax ID"><Inp value={form.taxId} onChange={e => set("taxId", e.target.value)} mono /></Row>
            </Grid2>
          </SectionCard>
        </div>
      );

      case "emergency": return (
        <SectionCard icon={Phone} title="Emergency Contact / Next of Kin" color={C.danger} bg={C.dangerLight}>
          <Grid2>
            <Row label="Full Name"><Inp value={form.nokName} onChange={e => set("nokName", e.target.value)} /></Row>
            <Row label="Relationship"><Inp value={form.nokRelationship} onChange={e => set("nokRelationship", e.target.value)} placeholder="e.g. Spouse" /></Row>
            <Row label="Phone"><Inp type="tel" value={form.nokPhone} onChange={e => set("nokPhone", e.target.value)} /></Row>
            <Row label="Address"><Inp value={form.nokAddress} onChange={e => set("nokAddress", e.target.value)} /></Row>
          </Grid2>
        </SectionCard>
      );

      case "access": return (
        <div className="space-y-4">
          <SectionCard icon={Shield} title="System Access & Status">
            <Row label="Employment Status" required error={errors.employmentStatus}>
              <Sel value={form.employmentStatus} onChange={e => set("employmentStatus", e.target.value)} options={STATUSES} error={errors.employmentStatus} />
            </Row>
            {form.employmentStatus === "terminated" || form.employmentStatus === "suspended" ? (
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: C.dangerLight, border: `1px solid ${C.danger}22` }}>
                <Lock size={13} color={C.danger} />
                <p className="text-xs" style={{ color: C.danger }}>Setting status to {form.employmentStatus} will revoke system access immediately.</p>
              </div>
            ) : null}
          </SectionCard>

          {/* Manager Assignment */}
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#FEF3C7" }}>
                <Award size={15} color="#D97706" />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: C.textPrimary }}>Manager / Team Lead Assignment</p>
                <p className="text-xs" style={{ color: C.textMuted }}>Assigning as manager grants team management access and the manager dashboard.</p>
              </div>
            </div>

            <Toggle
              on={form.isManager}
              onToggle={() => set("isManager", !form.isManager)}
              label="Assign as Manager / Line Manager"
              sub={form.isManager ? `${name} will have manager role and can manage their direct reports.` : "Employee has standard access."}
            />

            {form.isManager && !originalForm.isManager && (
              <Motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-4 rounded-xl" style={{ background: C.primaryLight, border: `1px solid ${C.primary}33` }}>
                <p className="text-xs font-bold" style={{ color: C.primary }}>What happens when you save:</p>
                <ul className="mt-2 space-y-1">
                  {[
                    `${name}'s system role will be set to "manager"`,
                    "They will see the Manager Dashboard in the sidebar",
                    "They can view and manage their direct reports",
                    "They can approve leave requests from their team",
                    "They gain access to team attendance monitoring",
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2 text-xs" style={{ color: C.textSecondary }}>
                      <Check size={10} color={C.primary} />{item}
                    </li>
                  ))}
                </ul>
              </Motion.div>
            )}

            {!form.isManager && originalForm.isManager && (
              <Motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 rounded-xl" style={{ background: C.warningLight, border: `1px solid ${C.warning}33` }}>
                <p className="text-xs" style={{ color: C.warning }}>Saving will remove manager role. {name} will lose access to the Manager Dashboard.</p>
              </Motion.div>
            )}
          </Card>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: "'DM Sans','Sora',sans-serif", color: C.textPrimary }}>
      <div className="flex h-screen overflow-hidden">
        <AdminSideNavbar sidebarOpen={sidebarOpen} collapsed={collapsed} setCollapsed={setCollapsed} ADMIN={adminUser} pendingApprovals={0} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10" style={{ background: "rgba(240,242,248,0.85)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}` }}>
            <Motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSidebarOpen(p => !p)} className="p-2 rounded-xl hidden md:flex" style={{ background: C.surface, border: `1px solid ${C.border}`, cursor: "pointer" }}>
              <Menu size={15} color={C.textSecondary} />
            </Motion.button>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: C.textSecondary }}>
              <button onClick={() => navigate(`/admin/employeemanagement/admin-viewemployeesprofile/${employeeId}`)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, display: "flex", alignItems: "center", gap: 4 }}>
                <ArrowLeft size={11} /> {loading ? "Loading…" : name}
              </button>
              <ChevronRight size={11} />
              <span className="font-bold" style={{ color: C.textPrimary }}>Edit Profile</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setShowAudit(p => !p)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textSecondary, cursor: "pointer" }}>
                <History size={12} /> Audit Trail
              </Motion.button>
              {isDirty && (
                <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: C.warningLight, color: C.warning }}>
                  {dirtyFields.length} unsaved change{dirtyFields.length > 1 ? "s" : ""}
                </span>
              )}
              <Motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving || !isDirty} className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white" style={{ background: isDirty ? `linear-gradient(135deg,${C.primary},#8B5CF6)` : C.border, border: "none", cursor: isDirty ? "pointer" : "not-allowed", boxShadow: isDirty ? `0 3px 12px ${C.primary}44` : "none" }}>
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                {saving ? "Saving…" : "Save Changes"}
              </Motion.button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-6">
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-2xl mb-4" style={{ background: C.dangerLight, border: `1px solid ${C.danger}33` }}>
                <AlertCircle size={16} color={C.danger} />
                <p className="text-sm flex-1" style={{ color: C.danger }}>{error}</p>
                <button onClick={load} className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: C.danger, color: "#fff", border: "none", cursor: "pointer" }}>Retry</button>
              </div>
            )}

            <div className="flex gap-5">
              {/* Left: Tabs + Content */}
              <div className="flex-1 min-w-0 space-y-4">
                {/* Tab bar */}
                <Motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                  {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all" style={{ background: isActive ? C.primary : C.surface, color: isActive ? "#fff" : C.textSecondary, border: `1px solid ${isActive ? "transparent" : C.border}`, boxShadow: isActive ? `0 4px 12px ${C.primary}44` : "none", cursor: "pointer" }}>
                        <Icon size={12} />{tab.label}
                      </button>
                    );
                  })}
                </Motion.div>

                {loading ? (
                  <div className="space-y-3">
                    {[80, 160, 80].map((h, i) => <div key={i} style={{ height: h, borderRadius: 16, background: "#E2E8F4", animation: "shimmer 1.4s infinite linear", backgroundSize: "200%" }} />)}
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <Motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.25 }}>
                      {renderTab()}
                    </Motion.div>
                  </AnimatePresence>
                )}

                {/* Save bar */}
                {!loading && (
                  <Motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="flex items-center justify-between p-4 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <p className="text-xs" style={{ color: C.textMuted }}>
                      {isDirty ? <><span className="font-semibold" style={{ color: C.warning }}>{dirtyFields.length} change{dirtyFields.length > 1 ? "s" : ""}</span> pending save</> : "All changes saved"}
                    </p>
                    <div className="flex gap-2">
                      <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setForm(originalForm)} disabled={!isDirty} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold" style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.textSecondary, cursor: isDirty ? "pointer" : "not-allowed" }}>
                        <RefreshCw size={11} /> Reset
                      </Motion.button>
                      <Motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving || !isDirty} className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white" style={{ background: isDirty ? `linear-gradient(135deg,${C.primary},#8B5CF6)` : C.border, border: "none", cursor: isDirty ? "pointer" : "not-allowed" }}>
                        {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                        {saving ? "Saving…" : "Save Changes"}
                      </Motion.button>
                    </div>
                  </Motion.div>
                )}
              </div>

              {/* Right: Audit Trail */}
              <AnimatePresence>
                {showAudit && (
                  <Motion.div initial={{ opacity: 0, x: 20, width: 0 }} animate={{ opacity: 1, x: 0, width: 280 }} exit={{ opacity: 0, x: 20, width: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="shrink-0 overflow-hidden">
                    <Card style={{ width: 280 }}>
                      <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: C.primaryLight }}>
                            <History size={13} color={C.primary} />
                          </div>
                          <span className="text-sm font-bold" style={{ color: C.textPrimary }}>Audit Trail</span>
                        </div>
                        <button onClick={() => setShowAudit(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={13} color={C.textMuted} /></button>
                      </div>
                      <div className="p-4 space-y-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 180px)" }}>
                        {audit.length === 0 ? (
                          <div className="text-center py-8"><History size={28} color={C.textMuted} className="mx-auto mb-2" /><p className="text-xs" style={{ color: C.textMuted }}>No audit history</p></div>
                        ) : audit.map((e, i) => (
                          <div key={e.id ?? i} className="flex gap-3">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: C.primary }}>
                              {(e.recorded_by_name ?? "?")[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>{e.event_type ?? "Update"}</p>
                              {e.notes && <p className="text-[11px] mt-0.5" style={{ color: C.textSecondary }}>{e.notes}</p>}
                              <p className="text-[10px] mt-1" style={{ color: C.textMuted }}>{e.effective_date ? new Date(e.effective_date).toLocaleDateString() : ""} · {e.recorded_by_name ?? "—"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>

      {/* Confirm modal */}
      <AnimatePresence>
        {showConfirm && (
          <>
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
            <Motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-4">
              <div className="rounded-2xl p-6 shadow-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <h3 className="text-base font-bold mb-2" style={{ color: C.textPrimary }}>Confirm Changes</h3>
                <p className="text-sm mb-4" style={{ color: C.textSecondary }}>{dirtyFields.length} field{dirtyFields.length > 1 ? "s" : ""} will be updated for <strong>{name}</strong>.</p>
                {form.isManager !== originalForm.isManager && (
                  <div className="p-3 rounded-xl mb-4" style={{ background: C.primaryLight }}>
                    <p className="text-xs font-bold" style={{ color: C.primary }}>
                      {form.isManager ? `✓ ${name} will be assigned Manager role` : `✓ ${name}'s Manager role will be removed`}
                    </p>
                  </div>
                )}
                {form.departmentId !== originalForm.departmentId && (
                  <div className="p-3 rounded-xl mb-4" style={{ background: C.warningLight }}>
                    <p className="text-xs font-bold" style={{ color: C.warning }}>✓ Department transfer will be logged</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: C.surfaceAlt, color: C.textSecondary, border: `1px solid ${C.border}`, cursor: "pointer" }}>Cancel</Motion.button>
                  <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={confirmSave} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg,${C.primary},#8B5CF6)`, border: "none", cursor: "pointer" }}>
                    <Save size={13} /> Save Changes
                  </Motion.button>
                </div>
              </div>
            </Motion.div>
          </>
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
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}