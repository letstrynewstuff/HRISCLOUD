

// import { useState, useEffect, useContext, createContext, useCallback, useMemo } from "react";
// import { motion as Motion, AnimatePresence } from "framer-motion";
// import {
//   User, Briefcase, CreditCard, FileText, Shield, Activity,
//   ChevronRight, Download, Eye, Upload, Lock,
//   Users, CheckCircle2, Clock, XCircle, Edit3, X,
//   Key, Smartphone, LogIn, Award, Bell,
//   Home, BarChart2, Menu, Plane,
//   DollarSign, ExternalLink, Info, Copy, Check, Layers,
//   UserCheck, Shield as ShieldIcon,
// } from "lucide-react";

// import {
//   T,
//   EMPLOYEES,
//   MOCK_REQUESTS,
//   ACTIVITY_LOG,
//   UPDATABLE_FIELDS,
//   NAV_ITEMS,
//   GRADE_CONFIG,
// } from "../components/data/mockData";
// import SideNavbar from "../components/sideNavbar";

// // ─────────────────────────────────────────
// // CONTEXT  (lives here so ProfilePage is self-contained;
// //            import { HRISContext, useHRIS } from "./ProfilePage"
// //            if you need to share state with other pages)
// // ─────────────────────────────────────────
// export const HRISContext = createContext(null);

// export function HRISProvider({ children, initialUserId = "EMP-001" }) {
//   const [currentUserId, setCurrentUserId] = useState(initialUserId);
//   const [employees]  = useState(EMPLOYEES);
//   const [viewingId, setViewingId] = useState(null); // null → viewing self

//   const currentUser = useMemo(
//     () => employees.find(e => e.id === currentUserId),
//     [employees, currentUserId]
//   );

//   const viewingEmployee = useMemo(
//     () => (viewingId ? employees.find(e => e.id === viewingId) : currentUser),
//     [viewingId, employees, currentUser]
//   );

//   const team = useMemo(
//     () => employees.filter(e => e.managerId === currentUserId && e.id !== currentUserId),
//     [employees, currentUserId]
//   );

//   const isManager = team.length > 0;

//   const getManager = useCallback(
//     (emp) => (emp?.managerId ? employees.find(e => e.id === emp.managerId) : null),
//     [employees]
//   );

//   return (
//     <HRISContext.Provider
//       value={{
//         currentUser, employees, team, isManager,
//         viewingEmployee, setViewingId,
//         getManager, currentUserId, setCurrentUserId,
//       }}
//     >
//       {children}
//     </HRISContext.Provider>
//   );
// }

// export const useHRIS = () => useContext(HRISContext);

// // ─────────────────────────────────────────
// // ICON MAP  (activity log stores icon names as strings)
// // ─────────────────────────────────────────
// const ICON_MAP = {
//   User, Download, Edit3, Shield, LogIn, CheckCircle2,
//   XCircle, BarChart2, Bell, Activity, Clock,
// };

// // ─────────────────────────────────────────
// // FRAMER VARIANTS
// // ─────────────────────────────────────────
// const fadeUp = {
//   hidden: { opacity: 0, y: 20 },
//   visible: (i = 0) => ({
//     opacity: 1, y: 0,
//     transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
//   }),
// };
// const tabContent = {
//   hidden:  { opacity: 0, x: 10 },
//   visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
// };
// const scaleIn = {
//   hidden:  { opacity: 0, scale: 0.95 },
//   visible: (i = 0) => ({
//     opacity: 1, scale: 1,
//     transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
//   }),
// };

// // ─────────────────────────────────────────
// // SHARED UI ATOMS
// // ─────────────────────────────────────────
// const Skeleton = ({ w = "100%", h = 16, rounded = "8px" }) => (
//   <div
//     style={{
//       width: w, height: h, borderRadius: rounded,
//       background: "linear-gradient(90deg,#E2E8F4 25%,#EFF6FF 50%,#E2E8F4 75%)",
//       backgroundSize: "200% 100%",
//       animation: "prof-shimmer 1.4s infinite linear",
//     }}
//   />
// );

// const AvatarEl = ({ initials, size = 48, gradient = `linear-gradient(135deg,${T.primary},${T.accent})`, style: extra = {} }) => (
//   <div
//     style={{
//       width: size, height: size, borderRadius: size * 0.28,
//       background: gradient, display: "flex", alignItems: "center",
//       justifyContent: "center", color: "#fff", fontWeight: 700,
//       fontSize: size * 0.32, fontFamily: "Sora,sans-serif",
//       flexShrink: 0, ...extra,
//     }}
//   >
//     {initials}
//   </div>
// );

// const Chip = ({ label, color = T.primary, bg = T.primaryLight, dot = false }) => (
//   <span
//     style={{
//       background: bg, color, fontSize: 10, fontWeight: 700,
//       padding: "3px 10px", borderRadius: 99,
//       display: "inline-flex", alignItems: "center", gap: 5,
//     }}
//   >
//     {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />}
//     {label}
//   </span>
// );
// /* ─── Dummy Data ─── */
// const EMPLOYEE = {
//   name: "Amara Johnson",
//   role: "Senior Product Designer",
//   department: "Product & Design",
//   avatar: null,
//   initials: "AJ",
//   id: "EMP-2041",
//   streak: 14,
// };

// const COLORS = {
//   bg: "#F0F2F8",
//   surface: "#FFFFFF",
//   surfaceAlt: "#F7F8FC",
//   border: "#E4E7F0",
//   primary: "#4F46E5",
//   primaryLight: "#EEF2FF",
//   primaryDark: "#3730A3",
//   accent: "#06B6D4",
//   accentLight: "#ECFEFF",
//   success: "#10B981",
//   successLight: "#D1FAE5",
//   warning: "#F59E0B",
//   warningLight: "#FEF3C7",
//   danger: "#EF4444",
//   dangerLight: "#FEE2E2",
//   textPrimary: "#0F172A",
//   textSecondary: "#64748B",
//   textMuted: "#94A3B8",
//   navy: "#1E1B4B",
// };

// const InfoRow = ({ label, value, masked = false, tooltip, mono = false }) => {
//   const [copied,  setCopied]  = useState(false);
//   const [showTip, setShowTip] = useState(false);
//   const displayVal = masked ? value?.replace(/(\d{4})\d{4}(\d{4})/, "$1••••$2") : value;

//   return (
//     <div
//       style={{
//         padding: "10px 0", borderBottom: `1px solid ${T.border}`,
//         display: "flex", alignItems: "flex-start",
//         justifyContent: "space-between", gap: 16,
//       }}
//     >
//       <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 140 }}>
//         <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 500 }}>{label}</span>
//         {tooltip && (
//           <div style={{ position: "relative" }}>
//             <Info size={11} color={T.textMuted} style={{ cursor: "help" }}
//               onMouseEnter={() => setShowTip(true)}
//               onMouseLeave={() => setShowTip(false)}
//             />
//             <AnimatePresence>
//               {showTip && (
//                 <Motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
//                   style={{
//                     position: "absolute", left: 16, top: -4,
//                     background: T.navy, color: "#fff", fontSize: 10,
//                     padding: "4px 8px", borderRadius: 6, whiteSpace: "nowrap",
//                     zIndex: 99, pointerEvents: "none",
//                   }}
//                 >
//                   {tooltip}
//                 </Motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         )}
//       </div>

//       <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//         <span
//           style={{
//             fontSize: 13, color: value ? T.textPrimary : T.textMuted,
//             fontFamily: mono ? "monospace" : "inherit",
//             fontWeight: value ? 500 : 400,
//           }}
//         >
//           {displayVal || "—"}
//         </span>
//         {masked && value && (
//           <Motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
//             onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
//             style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
//           >
//             {copied ? <Check size={12} color={T.success} /> : <Copy size={12} color={T.textMuted} />}
//           </Motion.button>
//         )}
//       </div>
//     </div>
//   );
// };

// const Card = ({ children, style = {}, onClick, hover = true }) => (
//   <Motion.div
//     whileHover={hover ? { y: -1, boxShadow: "0 8px 32px rgba(37,99,235,0.08)" } : {}}
//     transition={{ duration: 0.2 }}
//     onClick={onClick}
//     style={{
//       background: T.surface, borderRadius: 16,
//       border: `1px solid ${T.border}`,
//       boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
//       overflow: "hidden",
//       cursor: onClick ? "pointer" : "default",
//       ...style,
//     }}
//   >
//     {children}
//   </Motion.div>
// );

// const CardHeader = ({ icon: Icon, title, action, color = T.primary, bg = T.primaryLight }) => (
//   <div
//     style={{
//       padding: "16px 20px", borderBottom: `1px solid ${T.border}`,
//       display: "flex", alignItems: "center", justifyContent: "space-between",
//     }}
//   >
//     <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//       <div style={{ width: 32, height: 32, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
//         <Icon size={15} color={color} />
//       </div>
//       <span style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{title}</span>
//     </div>
//     {action}
//   </div>
// );

// const SectionBody = ({ children }) => (
//   <div style={{ padding: "4px 20px 16px" }}>{children}</div>
// );

// const StatusBadge = ({ status }) => {
//   const map = {
//     Active:     [T.success, T.successLight],
//     "On Leave": [T.warning, T.warningLight],
//     Suspended:  [T.danger,  T.dangerLight ],
//   };
//   const [c, b] = map[status] || [T.textMuted, T.surfaceAlt];
//   return <Chip label={status} color={c} bg={b} dot />;
// };

// const ReqStatusChip = ({ status }) => {
//   const map = {
//     pending:  { icon: Clock,         color: T.warning, bg: T.warningLight, label: "Pending"  },
//     approved: { icon: CheckCircle2,  color: T.success, bg: T.successLight, label: "Approved" },
//     rejected: { icon: XCircle,       color: T.danger,  bg: T.dangerLight,  label: "Rejected" },
//   };
//   const { icon: Icon, color, bg, label } = map[status] || map.pending;
//   return (
//     <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color, background: bg, padding: "3px 8px", borderRadius: 99 }}>
//       <Icon size={10} />{label}
//     </span>
//   );
// };

// const CompletionBar = ({ score }) => {
//   const color = score >= 90 ? T.success : score >= 70 ? T.warning : T.danger;
//   return (
//     <div>
//       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
//         <span style={{ fontSize: 11, color: T.textSecondary, fontWeight: 600 }}>Profile Completion</span>
//         <span style={{ fontSize: 11, fontWeight: 700, color }}>{score}%</span>
//       </div>
//       <div style={{ height: 6, background: T.border, borderRadius: 99, overflow: "hidden" }}>
//         <Motion.div
//           initial={{ width: 0 }}
//           animate={{ width: `${score}%` }}
//           transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
//           style={{ height: "100%", borderRadius: 99, background: color }}
//         />
//       </div>
//     </div>
//   );
// };

// // ─────────────────────────────────────────
// // REQUEST UPDATE MODAL
// // ─────────────────────────────────────────
// function RequestModal({ onClose }) {
//   const [field,     setField]     = useState(UPDATABLE_FIELDS[0]);
//   const [newVal,    setNewVal]    = useState("");
//   const [reason,    setReason]    = useState("");
//   const [submitted, setSubmitted] = useState(false);

//   const handleSubmit = () => {
//     if (!newVal.trim() || !reason.trim()) return;
//     setSubmitted(true);
//     setTimeout(() => { setSubmitted(false); onClose(); }, 2000);
//   };

//   return (
//     <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//       style={{
//         position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
//         zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
//         padding: 20, backdropFilter: "blur(4px)",
//       }}
//       onClick={onClose}
//     >
//       <Motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
//         transition={{ type: "spring", stiffness: 260, damping: 24 }}
//         style={{
//           background: T.surface, borderRadius: 20, width: "100%", maxWidth: 480,
//           boxShadow: "0 24px 64px rgba(15,23,42,0.18)", overflow: "hidden",
//         }}
//         onClick={e => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div style={{ background: `linear-gradient(135deg,${T.primary},${T.accent})`, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <div>
//             <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Profile Update</p>
//             <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 700, fontFamily: "Sora,sans-serif", marginTop: 2 }}>Request a Change</h3>
//           </div>
//           <Motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose}
//             style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
//             <X size={15} color="#fff" />
//           </Motion.button>
//         </div>

//         <div style={{ padding: 24 }}>
//           {submitted ? (
//             <Motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
//               style={{ textAlign: "center", padding: "20px 0" }}>
//               <CheckCircle2 size={48} color={T.success} style={{ margin: "0 auto 12px" }} />
//               <p style={{ fontWeight: 700, color: T.textPrimary, fontSize: 15 }}>Request Submitted!</p>
//               <p style={{ color: T.textSecondary, fontSize: 13, marginTop: 4 }}>
//                 HR will review your request within 2 business days.
//               </p>
//             </Motion.div>
//           ) : (
//             <>
//               {[
//                 { label: "Field to Update", el: (
//                   <select value={field} onChange={e => setField(e.target.value)}
//                     style={{ width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.textPrimary, outline: "none", background: T.surface }}>
//                     {UPDATABLE_FIELDS.map(f => <option key={f}>{f}</option>)}
//                   </select>
//                 )},
//                 { label: "New Value", el: (
//                   <input value={newVal} onChange={e => setNewVal(e.target.value)} placeholder="Enter the correct value..."
//                     style={{ width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${newVal ? T.primary : T.border}`, fontSize: 13, color: T.textPrimary, outline: "none", boxShadow: newVal ? `0 0 0 3px ${T.primaryLight}` : "none", transition: "all 0.2s" }} />
//                 )},
//                 { label: "Reason for Change", el: (
//                   <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Briefly explain why..." rows={3}
//                     style={{ width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${reason ? T.primary : T.border}`, fontSize: 13, color: T.textPrimary, outline: "none", resize: "vertical", fontFamily: "inherit", boxShadow: reason ? `0 0 0 3px ${T.primaryLight}` : "none", transition: "all 0.2s" }} />
//                 )},
//               ].map(({ label, el }) => (
//                 <div key={label} style={{ marginBottom: 16 }}>
//                   <label style={{ fontSize: 11, fontWeight: 700, color: T.textSecondary, textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>
//                   {el}
//                 </div>
//               ))}

//               <div style={{ display: "flex", gap: 10 }}>
//                 <button onClick={onClose}
//                   style={{ flex: 1, padding: 11, borderRadius: 10, border: `1.5px solid ${T.border}`, background: "transparent", fontSize: 13, fontWeight: 600, color: T.textSecondary, cursor: "pointer" }}>
//                   Cancel
//                 </button>
//                 <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit}
//                   style={{ flex: 2, padding: 11, borderRadius: 10, border: "none", background: `linear-gradient(135deg,${T.primary},${T.accent})`, fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}>
//                   Submit Request
//                 </Motion.button>
//               </div>
//             </>
//           )}
//         </div>
//       </Motion.div>
//     </Motion.div>
//   );
// }

// // ─────────────────────────────────────────
// // TAB DEFINITIONS
// // ─────────────────────────────────────────
// const TABS = [
//   { id: "personal",  label: "Personal",    icon: User          },
//   { id: "job",       label: "Job Details", icon: Briefcase     },
//   { id: "payroll",   label: "Payroll",     icon: CreditCard    },
//   { id: "documents", label: "Documents",   icon: FileText      },
//   { id: "requests",  label: "Requests",    icon: Edit3         },
//   { id: "security",  label: "Security",    icon: Shield        },
//   { id: "activity",  label: "Activity",    icon: Activity      },
// ];

// // ─────────────────────────────────────────
// // TAB PANELS
// // ─────────────────────────────────────────
// function PersonalTab({ emp }) {
//   return (
//     <Motion.div variants={tabContent} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//       <Card>
//         <CardHeader icon={User} title="Personal Information" />
//         <SectionBody>
//           <InfoRow label="Full Name"    value={emp.name} />
//           <InfoRow label="Date of Birth" value={new Date(emp.dob).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
//           <InfoRow label="Gender"       value={emp.gender} />
//           <InfoRow label="Phone"        value={emp.phone} />
//           <InfoRow label="Email"        value={emp.email} />
//           <InfoRow label="Address"      value={emp.address} />
//         </SectionBody>
//       </Card>
//       <Card>
//         <CardHeader icon={UserCheck} title="Next of Kin" color={T.accent} bg={T.accentLight} />
//         <SectionBody>
//           <InfoRow label="Name"         value={emp.nextOfKin?.name} />
//           <InfoRow label="Relationship" value={emp.nextOfKin?.relationship} />
//           <InfoRow label="Phone"        value={emp.nextOfKin?.phone} />
//         </SectionBody>
//       </Card>
//     </Motion.div>
//   );
// }

// function JobTab({ emp, manager, onViewManager }) {
//   const grade = GRADE_CONFIG[emp.grade] || {};
//   return (
//     <Motion.div variants={tabContent} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//       <Card>
//         <CardHeader icon={Briefcase} title="Employment Details" />
//         <SectionBody>
//           <InfoRow label="Employee ID"      value={emp.id} mono />
//           <InfoRow label="Department"       value={emp.department} />
//           <InfoRow label="Role / Position"  value={emp.role} />
//           <InfoRow label="Employment Date"  value={new Date(emp.employmentDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
//           <InfoRow label="Work Location"    value={emp.location} />
//           <div style={{ paddingTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
//             <Chip label={`Grade ${emp.grade}`} color={grade.color} bg={grade.bg} />
//             <StatusBadge status={emp.status} />
//           </div>
//         </SectionBody>
//       </Card>

//       {manager && (
//         <Card>
//           <CardHeader icon={Users} title="Line Manager" color={T.secondary} bg="#E0F2FE" />
//           <div style={{ padding: "16px 20px" }}>
//             <Motion.button whileHover={{ x: 4, background: T.primaryLight }}
//               onClick={() => onViewManager(manager.id)}
//               style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, width: "100%", background: T.surfaceAlt, border: `1px solid ${T.border}`, cursor: "pointer", transition: "background 0.2s" }}>
//               <AvatarEl initials={manager.initials} size={40} />
//               <div style={{ textAlign: "left" }}>
//                 <p style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary }}>{manager.name}</p>
//                 <p style={{ fontSize: 11, color: T.textSecondary, marginTop: 2 }}>{manager.role}</p>
//               </div>
//               <ExternalLink size={13} color={T.primary} style={{ marginLeft: "auto" }} />
//             </Motion.button>
//           </div>
//         </Card>
//       )}
//     </Motion.div>
//   );
// }

// function PayrollTab({ emp }) {
//   return (
//     <Motion.div variants={tabContent} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//       <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: T.warningLight, borderRadius: 12, border: "1px solid #FDE68A" }}>
//         <ShieldIcon size={16} color={T.warning} />
//         <p style={{ fontSize: 12, color: T.warning, fontWeight: 500 }}>Sensitive information. Partial masking applied for security.</p>
//       </div>
//       <Card>
//         <CardHeader icon={CreditCard} title="Bank & Payroll Information" color={T.success} bg={T.successLight} />
//         <SectionBody>
//           <InfoRow label="Bank Name"      value={emp.bank?.name} />
//           <InfoRow label="Account Number" value={emp.bank?.account} masked mono tooltip="Only first 4 and last 4 digits are visible" />
//           <InfoRow label="Account Name"   value={emp.bank?.accountName} />
//         </SectionBody>
//       </Card>
//     </Motion.div>
//   );
// }

// function DocumentsTab({ emp }) {
//   const catColors = {
//     "Government ID": [T.primary, T.primaryLight],
//     "Certificate":   [T.accent,  T.accentLight ],
//     "Contract":      [T.success, T.successLight],
//   };
//   return (
//     <Motion.div variants={tabContent} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//       <Card>
//         <CardHeader icon={FileText} title="Documents"
//           action={
//             <Motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
//               style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: T.primary, background: T.primaryLight, border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}>
//               <Upload size={11} /> Upload
//             </Motion.button>
//           }
//         />
//         <div style={{ padding: "8px 20px 16px" }}>
//           {emp.documents.length === 0 ? (
//             <div style={{ textAlign: "center", padding: "40px 0" }}>
//               <FileText size={40} color={T.textMuted} style={{ margin: "0 auto 10px" }} />
//               <p style={{ fontWeight: 600, color: T.textSecondary }}>No documents uploaded</p>
//               <p style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>Upload government ID, certificates, or contracts.</p>
//             </div>
//           ) : (
//             <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//               {emp.documents.map((doc, i) => {
//                 const [c, b] = catColors[doc.category] || [T.textMuted, T.surfaceAlt];
//                 return (
//                   <Motion.div key={doc.id}
//                     initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
//                     whileHover={{ x: 2, background: T.surfaceAlt }}
//                     style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, border: `1px solid ${T.border}`, cursor: "pointer", transition: "background 0.2s" }}>
//                     <div style={{ width: 38, height: 38, borderRadius: 10, background: b, display: "flex", alignItems: "center", justifyContent: "center" }}>
//                       <FileText size={16} color={c} />
//                     </div>
//                     <div style={{ flex: 1, minWidth: 0 }}>
//                       <p style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</p>
//                       <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
//                         <Chip label={doc.category} color={c} bg={b} />
//                         <span style={{ fontSize: 10, color: T.textMuted }}>{doc.size} · {doc.date}</span>
//                       </div>
//                     </div>
//                     <div style={{ display: "flex", gap: 6 }}>
//                       <Motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
//                         style={{ padding: 6, borderRadius: 8, background: T.primaryLight, border: "none", cursor: "pointer" }}>
//                         <Eye size={12} color={T.primary} />
//                       </Motion.button>
//                       <Motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
//                         style={{ padding: 6, borderRadius: 8, background: T.successLight, border: "none", cursor: "pointer" }}>
//                         <Download size={12} color={T.success} />
//                       </Motion.button>
//                     </div>
//                   </Motion.div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </Card>
//     </Motion.div>
//   );
// }

// function RequestsTab({ isSelf }) {
//   const [showModal, setShowModal] = useState(false);
//   if (!isSelf) return (
//     <Card style={{ padding: 40, textAlign: "center" }} hover={false}>
//       <Lock size={36} color={T.textMuted} style={{ margin: "0 auto 10px" }} />
//       <p style={{ color: T.textSecondary, fontWeight: 600 }}>Request history is private</p>
//     </Card>
//   );
//   return (
//     <Motion.div variants={tabContent} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//       <AnimatePresence>{showModal && <RequestModal onClose={() => setShowModal(false)} />}</AnimatePresence>
//       <div style={{ display: "flex", justifyContent: "flex-end" }}>
//         <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setShowModal(true)}
//           style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", background: `linear-gradient(135deg,${T.primary},${T.accent})`, border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(37,99,235,0.25)" }}>
//           <Edit3 size={13} /> New Request
//         </Motion.button>
//       </div>
//       <Card>
//         <CardHeader icon={Clock} title="Request History" color={T.warning} bg={T.warningLight} />
//         <div style={{ padding: "8px 20px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
//           {MOCK_REQUESTS.map((req, i) => (
//             <Motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
//               style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.surfaceAlt }}>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
//                 <div>
//                   <span style={{ fontSize: 11, color: T.textMuted, fontFamily: "monospace" }}>{req.id}</span>
//                   <p style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, marginTop: 2 }}>{req.field}</p>
//                 </div>
//                 <ReqStatusChip status={req.status} />
//               </div>
//               <p style={{ fontSize: 11, color: T.textSecondary }}>
//                 <span style={{ color: T.textMuted }}>Old:</span> {req.oldVal} →{" "}
//                 <span style={{ color: T.primary, fontWeight: 600 }}>{req.newVal}</span>
//               </p>
//               <p style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>
//                 Reason: {req.reason} · {req.date}
//               </p>
//               {req.comment && (
//                 <p style={{ fontSize: 11, color: T.textMuted, marginTop: 3, fontStyle: "italic" }}>
//                   HR note: {req.comment}
//                 </p>
//               )}
//             </Motion.div>
//           ))}
//         </div>
//       </Card>
//     </Motion.div>
//   );
// }

// function SecurityTab({ emp, isSelf }) {
//   const [twoFA, setTwoFA] = useState(emp.twoFA);
//   if (!isSelf) return (
//     <Card style={{ padding: 40, textAlign: "center" }} hover={false}>
//       <Shield size={36} color={T.textMuted} style={{ margin: "0 auto 10px" }} />
//       <p style={{ color: T.textSecondary, fontWeight: 600 }}>Security settings are private</p>
//     </Card>
//   );
//   return (
//     <Motion.div variants={tabContent} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//       <Card>
//         <CardHeader icon={Key} title="Password" color={T.danger} bg={T.dangerLight} />
//         <div style={{ padding: "16px 20px" }}>
//           <p style={{ fontSize: 12, color: T.textSecondary, marginBottom: 12 }}>
//             Your password was last changed 90 days ago. We recommend updating it regularly.
//           </p>
//           <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
//             style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", border: `1.5px solid ${T.border}`, borderRadius: 10, background: "transparent", fontSize: 13, fontWeight: 600, color: T.textPrimary, cursor: "pointer" }}>
//             <Lock size={13} /> Change Password
//           </Motion.button>
//         </div>
//       </Card>
//       <Card>
//         <CardHeader icon={Smartphone} title="Two-Factor Authentication" color={T.accent} bg={T.accentLight} />
//         <div style={{ padding: "16px 20px" }}>
//           <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
//             <div>
//               <p style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>Authenticator App (TOTP)</p>
//               <p style={{ fontSize: 11, color: T.textSecondary, marginTop: 2 }}>Time-based one-time password.</p>
//             </div>
//             <Motion.button whileTap={{ scale: 0.95 }} onClick={() => setTwoFA(p => !p)}
//               style={{ width: 44, height: 24, borderRadius: 99, background: twoFA ? T.success : T.border, border: "none", cursor: "pointer", position: "relative", transition: "background 0.25s" }}>
//               <Motion.div animate={{ x: twoFA ? 20 : 2 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}
//                 style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
//             </Motion.button>
//           </div>
//           <p style={{ fontSize: 11, fontWeight: 600, color: twoFA ? T.success : T.textMuted }}>
//             {twoFA ? "✓ 2FA is enabled" : "2FA is disabled — your account is less secure"}
//           </p>
//         </div>
//       </Card>
//       <Card>
//         <CardHeader icon={LogIn} title="Login Activity" color={T.secondary} bg="#E0F2FE" />
//         <SectionBody>
//           <InfoRow label="Last Login"   value={emp.lastLogin} />
//           <InfoRow label="Login Method" value="Email + Password" />
//           <InfoRow label="Device"       value="Chrome on macOS" />
//           <InfoRow label="Location"     value="Lagos, Nigeria" />
//         </SectionBody>
//       </Card>
//     </Motion.div>
//   );
// }

// function ActivityTab() {
//   return (
//     <Motion.div variants={tabContent} initial="hidden" animate="visible">
//       <Card>
//         <CardHeader icon={Activity} title="Recent Activity" />
//         <div style={{ padding: "8px 20px 16px" }}>
//           {ACTIVITY_LOG.map((item, i) => {
//             const Icon = ICON_MAP[item.iconName] || Activity;
//             return (
//               <Motion.div key={item.id}
//                 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
//                 style={{
//                   display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0",
//                   borderBottom: i < ACTIVITY_LOG.length - 1 ? `1px solid ${T.border}` : "none",
//                 }}>
//                 <div style={{ width: 32, height: 32, borderRadius: 10, background: item.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//                   <Icon size={14} color={item.color} />
//                 </div>
//                 <div>
//                   <p style={{ fontSize: 13, fontWeight: 500, color: T.textPrimary }}>{item.action}</p>
//                   <p style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{item.date}</p>
//                 </div>
//               </Motion.div>
//             );
//           })}
//         </div>
//       </Card>
//     </Motion.div>
//   );
// }

// // ─────────────────────────────────────────
// // SIDEBAR
// // ─────────────────────────────────────────
// // const NAV_ICON_MAP = { Home, Clock, Plane, DollarSign, Users, BarChart2 };

// // function Sidebar({ open, currentUser, isManager, team }) {
// //   return (
// //     <AnimatePresence>
// //       {open && (
// //         <Motion.aside
// //           initial={{ x: -220 }} animate={{ x: 0 }} exit={{ x: -220 }}
// //           transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
// //           style={{
// //             width: 210, flexShrink: 0, background: T.navy,
// //             display: "flex", flexDirection: "column",
// //             height: "100%", zIndex: 20,
// //             boxShadow: "4px 0 28px rgba(15,23,75,0.18)",
// //           }}
// //         >
// //           <div style={{ padding: "22px 18px 14px", display: "flex", alignItems: "center", gap: 10 }}>
// //             <div style={{ width: 30, height: 30, borderRadius: 10, background: T.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
// //               <Layers size={14} color="#fff" />
// //             </div>
// //             <span style={{ color: "#fff", fontWeight: 800, fontSize: 14, fontFamily: "Sora,sans-serif" }}>HRISCloud</span>
// //           </div>

// //           <div style={{ padding: "0 14px 8px" }}>
// //             <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: 2 }}>Navigation</span>
// //           </div>

// //           <nav style={{ flex: 1, padding: "0 10px", display: "flex", flexDirection: "column", gap: 2 }}>
// //             {NAV_ITEMS.map(({ iconName, label, managerOnly }) => {
// //               if (managerOnly && !isManager) return null;
// //               const Icon = NAV_ICON_MAP[iconName] || Home;
// //               const active = label === "Home";
// //               return (
// //                 <Motion.button key={label} whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}
// //                   style={{
// //                     display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
// //                     borderRadius: 10, border: "none", cursor: "pointer",
// //                     background: active ? "rgba(37,99,235,0.28)" : "transparent",
// //                     color: active ? "#fff" : "rgba(255,255,255,0.42)",
// //                     fontSize: 13, fontWeight: 500,
// //                   }}
// //                 >
// //                   <Icon size={15} />{label}
// //                   {managerOnly && isManager && (
// //                     <span style={{ marginLeft: "auto", fontSize: 8, fontWeight: 800, background: T.gold, color: T.navy, padding: "1px 5px", borderRadius: 99 }}>MGR</span>
// //                   )}
// //                 </Motion.button>
// //               );
// //             })}
// //           </nav>

// //           {isManager && (
// //             <div style={{ margin: "0 10px 10px", padding: "10px 12px", borderRadius: 12, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)" }}>
// //               <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
// //                 <Award size={11} color={T.gold} />
// //                 <span style={{ fontSize: 10, fontWeight: 700, color: T.gold }}>Manager</span>
// //               </div>
// //               <p style={{ fontSize: 9, color: "rgba(255,255,255,0.36)" }}>
// //                 {team.length} direct report{team.length !== 1 ? "s" : ""}
// //               </p>
// //             </div>
// //           )}

// //           <div style={{ margin: 10, padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
// //             <AvatarEl initials={currentUser?.initials} size={32} />
// //             <div style={{ minWidth: 0 }}>
// //               <p style={{ color: "#fff", fontSize: 11, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser?.name}</p>
// //               <p style={{ fontSize: 9, color: "rgba(255,255,255,0.32)", marginTop: 1 }}>{currentUser?.id}</p>
// //             </div>
// //           </div>
// //         </Motion.aside>
// //       )}
// //     </AnimatePresence>
// //   );
// // }

// // ═══════════════════════════════════════════════════════════════
// //  INNER PAGE  (uses context — must be inside HRISProvider)
// // ═══════════════════════════════════════════════════════════════
// function ProfilePageInner({ onNavigateToManager }) {
//   const { currentUser, isManager, viewingEmployee, setViewingId, getManager, team } = useHRIS();

//   const [loading,      setLoading]      = useState(true);
//   const [activeTab,    setActiveTab]    = useState("personal");
//   const [showModal,    setShowModal]    = useState(false);
//   const [sidebarOpen,  setSidebarOpen]  = useState(true);

//   const emp    = viewingEmployee || currentUser;
//   const manager = getManager(emp);
//   const isSelf  = emp?.id === currentUser?.id;

//   useEffect(() => { const t = setTimeout(() => setLoading(false), 1500); return () => clearTimeout(t); }, []);
//   useEffect(() => { setActiveTab("personal"); }, [emp?.id]);

//   const handleViewManager = useCallback((id) => {
//     if (onNavigateToManager) { onNavigateToManager(id); return; }
//     setViewingId(id);
//     setActiveTab("job");
//   }, [onNavigateToManager, setViewingId]);

//   return (
//     // <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
//     //   <Sidebar open={sidebarOpen} currentUser={currentUser} isManager={isManager} team={team} />
//     <div className="flex h-screen overflow-hidden">
//       <SideNavbar
//         sidebarOpen={sidebarOpen}
//         setSidebarOpen={setSidebarOpen}
//         COLORS={COLORS}
//         EMPLOYEE={EMPLOYEE}
//         icons={{
//           Home,
//           Clock,
//           Plane,
//           DollarSign,
//           BarChart2,
//           Users,
//         }}
//       />

//       <div
//         style={{
//           flex: 1,
//           display: "flex",
//           flexDirection: "column",
//           overflow: "hidden",
//           minWidth: 0,
//         }}
//       >
//         {/* Top Nav */}
//         <header
//           style={{
//             height: 58,
//             display: "flex",
//             alignItems: "center",
//             padding: "0 20px",
//             gap: 12,
//             background: "rgba(241,244,250,0.92)",
//             backdropFilter: "blur(10px)",
//             borderBottom: `1px solid ${T.border}`,
//             flexShrink: 0,
//             zIndex: 10,
//           }}
//         >
//           <Motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => setSidebarOpen((p) => !p)}
//             className="p-2 rounded-xl hidden md:flex"
//             style={{ background: COLORS.surface }}
//           >
//             <Menu size={15} color={COLORS.textSecondary} />
//           </Motion.button>

//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 6,
//               fontSize: 12,
//               color: T.textSecondary,
//             }}
//           >
//             <span>Home</span>
//             <ChevronRight size={12} />
//             {!isSelf && (
//               <>
//                 <Motion.button
//                   whileHover={{ color: T.primary }}
//                   onClick={() => setViewingId(null)}
//                   style={{
//                     background: "none",
//                     border: "none",
//                     cursor: "pointer",
//                     fontSize: 12,
//                     color: T.primary,
//                     fontWeight: 600,
//                   }}
//                 >
//                   My Profile
//                 </Motion.button>
//                 <ChevronRight size={12} />
//               </>
//             )}
//             <span style={{ color: T.textPrimary, fontWeight: 700 }}>
//               {isSelf ? "My Profile" : emp?.name}
//             </span>
//           </div>

//           <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
//             {isSelf && (
//               <Motion.button
//                 whileHover={{ scale: 1.03 }}
//                 whileTap={{ scale: 0.97 }}
//                 onClick={() => setShowModal(true)}
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 6,
//                   padding: "7px 14px",
//                   background: `linear-gradient(135deg,${T.primary},${T.accent})`,
//                   border: "none",
//                   borderRadius: 10,
//                   color: "#fff",
//                   fontSize: 12,
//                   fontWeight: 700,
//                   cursor: "pointer",
//                   boxShadow: "0 3px 10px rgba(37,99,235,0.25)",
//                 }}
//               >
//                 <Edit3 size={12} /> Request Update
//               </Motion.button>
//             )}
//           </div>
//         </header>

//         {/* Scrollable content */}
//         <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
//           {/* ── Profile Header ── */}
//           {loading ? (
//             <div
//               style={{ borderRadius: 20, overflow: "hidden", marginBottom: 20 }}
//             >
//               <Skeleton w="100%" h={200} rounded="20px" />
//             </div>
//           ) : (
//             <Motion.div
//               variants={fadeUp}
//               initial="hidden"
//               animate="visible"
//               custom={0}
//               style={{
//                 borderRadius: 20,
//                 overflow: "hidden",
//                 marginBottom: 20,
//                 position: "relative",
//               }}
//             >
//               {/* Banner */}
//               <div
//                 style={{
//                   height: 80,
//                   background:
//                     "linear-gradient(135deg,#0F1729 0%,#1E3A8A 50%,#1E40AF 100%)",
//                   position: "relative",
//                   overflow: "hidden",
//                 }}
//               >
//                 <div
//                   style={{
//                     position: "absolute",
//                     right: -20,
//                     top: -30,
//                     width: 160,
//                     height: 160,
//                     borderRadius: "50%",
//                     background: "rgba(139,92,246,0.12)",
//                   }}
//                 />
//                 <div
//                   style={{
//                     position: "absolute",
//                     left: "30%",
//                     bottom: -20,
//                     width: 80,
//                     height: 80,
//                     borderRadius: "50%",
//                     background: "rgba(14,165,233,0.1)",
//                   }}
//                 />
//               </div>

//               <div
//                 style={{
//                   background: T.surface,
//                   padding: "0 24px 20px",
//                   position: "relative",
//                 }}
//               >
//                 <div
//                   style={{
//                     display: "flex",
//                     alignItems: "flex-end",
//                     gap: 16,
//                     marginTop: -32,
//                   }}
//                 >
//                   <AvatarEl
//                     initials={emp.initials}
//                     size={72}
//                     extra={{
//                       border: "3px solid #fff",
//                       boxShadow: "0 4px 20px rgba(37,99,235,0.25)",
//                     }}
//                   />
//                   <div style={{ paddingBottom: 4, flex: 1, minWidth: 0 }}>
//                     <div
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 8,
//                         flexWrap: "wrap",
//                       }}
//                     >
//                       <h1
//                         style={{
//                           fontSize: 20,
//                           fontWeight: 800,
//                           color: T.textPrimary,
//                           fontFamily: "Sora,sans-serif",
//                         }}
//                       >
//                         {emp.name}
//                       </h1>
//                       {isManager && isSelf && (
//                         <Chip label="Manager" color={T.gold} bg="#FFFBEB" />
//                       )}
//                       <StatusBadge status={emp.status} />
//                     </div>
//                     <p
//                       style={{
//                         fontSize: 13,
//                         color: T.textSecondary,
//                         marginTop: 2,
//                       }}
//                     >
//                       {emp.role} · {emp.department}
//                     </p>
//                     <p
//                       style={{
//                         fontSize: 11,
//                         color: T.textMuted,
//                         marginTop: 2,
//                         fontFamily: "monospace",
//                       }}
//                     >
//                       {emp.id}
//                     </p>
//                   </div>
//                   <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
//                     <Motion.button
//                       whileHover={{ scale: 1.03 }}
//                       whileTap={{ scale: 0.97 }}
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 6,
//                         padding: "8px 14px",
//                         background: T.surfaceAlt,
//                         border: `1px solid ${T.border}`,
//                         borderRadius: 10,
//                         color: T.textSecondary,
//                         fontSize: 12,
//                         fontWeight: 600,
//                         cursor: "pointer",
//                       }}
//                     >
//                       <Download size={12} /> Download
//                     </Motion.button>
//                   </div>
//                 </div>

//                 {isSelf && (
//                   <div
//                     style={{
//                       marginTop: 16,
//                       padding: "12px 16px",
//                       background: T.surfaceAlt,
//                       borderRadius: 12,
//                     }}
//                   >
//                     <CompletionBar score={emp.completionScore} />
//                   </div>
//                 )}
//               </div>
//             </Motion.div>
//           )}

//           {/* ── Tabs ── */}
//           {loading ? (
//             <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
//               {[80, 90, 70, 90, 80, 70, 80].map((w, i) => (
//                 <Skeleton key={i} w={w} h={34} rounded="10px" />
//               ))}
//             </div>
//           ) : (
//             <Motion.div
//               variants={fadeUp}
//               initial="hidden"
//               animate="visible"
//               custom={1}
//               style={{
//                 display: "flex",
//                 gap: 4,
//                 marginBottom: 16,
//                 background: T.surface,
//                 padding: 4,
//                 borderRadius: 14,
//                 border: `1px solid ${T.border}`,
//                 overflowX: "auto",
//               }}
//             >
//               {TABS.map(({ id, label, icon: Icon }) => {
//                 const active = activeTab === id;
//                 return (
//                   <Motion.button
//                     key={id}
//                     whileHover={{ scale: active ? 1 : 1.02 }}
//                     whileTap={{ scale: 0.97 }}
//                     onClick={() => setActiveTab(id)}
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: 6,
//                       padding: "7px 14px",
//                       borderRadius: 10,
//                       border: "none",
//                       cursor: "pointer",
//                       fontSize: 12,
//                       fontWeight: 600,
//                       whiteSpace: "nowrap",
//                       flexShrink: 0,
//                       background: active ? T.primary : "transparent",
//                       color: active ? "#fff" : T.textSecondary,
//                       boxShadow: active
//                         ? "0 2px 8px rgba(37,99,235,0.25)"
//                         : "none",
//                       transition: "all 0.18s",
//                     }}
//                   >
//                     <Icon size={12} />
//                     {label}
//                   </Motion.button>
//                 );
//               })}
//             </Motion.div>
//           )}

//           {/* ── Tab panel ── */}
//           {loading ? (
//             <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//               {[140, 100, 80].map((h, i) => (
//                 <Skeleton key={i} w="100%" h={h} rounded="16px" />
//               ))}
//             </div>
//           ) : (
//             <AnimatePresence mode="wait">
//               <div key={`${emp.id}-${activeTab}`}>
//                 {activeTab === "personal" && <PersonalTab emp={emp} />}
//                 {activeTab === "job" && (
//                   <JobTab
//                     emp={emp}
//                     manager={manager}
//                     onViewManager={handleViewManager}
//                   />
//                 )}
//                 {activeTab === "payroll" && <PayrollTab emp={emp} />}
//                 {activeTab === "documents" && <DocumentsTab emp={emp} />}
//                 {activeTab === "requests" && <RequestsTab isSelf={isSelf} />}
//                 {activeTab === "security" && (
//                   <SecurityTab emp={emp} isSelf={isSelf} />
//                 )}
//                 {activeTab === "activity" && <ActivityTab />}
//               </div>
//             </AnimatePresence>
//           )}

//           <div style={{ height: 24 }} />
//         </div>
//       </div>

//       <AnimatePresence>
//         {showModal && <RequestModal onClose={() => setShowModal(false)} />}
//       </AnimatePresence>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════
// //  MAIN EXPORT
// // ═══════════════════════════════════════════════════════════════
// /**
//  * ProfilePage
//  *
//  * Standalone — wraps itself in HRISProvider.
//  * If you need to share the HRIS context with other pages, wrap your
//  * entire app in <HRISProvider> and import { useHRIS } instead.
//  *
//  * Props:
//  *   initialUserId        (string)   — which employee to show as "self". Default: "EMP-001"
//  *   viewEmployeeId       (string)   — immediately open another employee's profile (e.g. from router param)
//  *   onNavigateToManager  (function) — called with managerId when user clicks a manager link.
//  *                                    Wire to your router if needed.
//  */
// export default function ProfilePage({ initialUserId = "EMP-001", viewEmployeeId, onNavigateToManager }) {
//   return (
//     <HRISProvider initialUserId={initialUserId}>
//       <_ProfilePageWithContext viewEmployeeId={viewEmployeeId} onNavigateToManager={onNavigateToManager} />
//     </HRISProvider>
//   );
// }

// // Inner bridge — sets viewingId from the router param before rendering
// function _ProfilePageWithContext({ viewEmployeeId, onNavigateToManager }) {
//   const { setViewingId } = useHRIS();

//   useEffect(() => {
//     if (viewEmployeeId) setViewingId(viewEmployeeId);
//   }, [viewEmployeeId, setViewingId]);

//   return (
//     <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans','Sora',sans-serif", color: T.textPrimary }}>
//       {/* <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@600;700;800&display=swap');
//         @keyframes prof-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
//         * { box-sizing:border-box; margin:0; padding:0; }
//         button,input,select,textarea { font-family:inherit; }
//         ::-webkit-scrollbar { width:4px; height:4px; }
//         ::-webkit-scrollbar-track { background:transparent; }
//         ::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:99px; }
//       `}</style> */}
//       <ProfilePageInner onNavigateToManager={onNavigateToManager} />
//     </div>
//   );
// }


// src/pages/ProfilePage.jsx
// Employee self-service profile page.
// — Real data from AuthContext + employeeApi + leaveApi + documentApi
// — Role-aware: if employee is a manager, shows a "Manager Dashboard" link
// — No mock data, no hardcoded constants
// — motion as Motion throughout

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SideNavbar from "../components/sideNavbar";
import { useAuth } from "../components/AuthContext";
import {
  getMyProfile,
  requestProfileChange,
} from "../api/service/employeeApi";
import { leaveApi } from "../api/service/leaveApi";
import { documentApi } from "../api/service/documentApi";
import { authApi } from "../api/service/authApi";
import C from "../styles/colors";
import {
  User, Briefcase, CreditCard, FileText, Shield, Activity,
  ChevronRight, Download, Eye, Upload, Lock,
  Users, CheckCircle2, Clock, XCircle, Edit3, X,
  Key, LogIn, Award, Bell, Home, BarChart2, Menu,
  Plane, DollarSign, Info, Copy, Check, UserCheck,
  Loader2, AlertCircle, RefreshCw, Save, ArrowRight,
} from "lucide-react";

// ── Framer variants ──
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};
const tabAnim = {
  hidden:  { opacity: 0, x: 10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

// ── Micro-components ──
const Skeleton = ({ w = "100%", h = 16 }) => (
  <div style={{
    width: w, height: h, borderRadius: 8,
    background: "linear-gradient(90deg,#E2E8F4 25%,#EFF6FF 50%,#E2E8F4 75%)",
    backgroundSize: "200% 100%",
    animation: "prof-shimmer 1.4s infinite linear",
  }} />
);

const AvatarEl = ({ initials, avatar, size = 48 }) => {
  if (avatar) return <img src={avatar} alt={initials} style={{ width: size, height: size, borderRadius: size * 0.28, objectFit: "cover", flexShrink: 0 }} />;
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: `linear-gradient(135deg,${C.primary},${C.accent})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 700, fontSize: size * 0.32,
      fontFamily: "Sora,sans-serif", flexShrink: 0,
    }}>{initials}</div>
  );
};

const Chip = ({ label, color = C.primary, bg = C.primaryLight, dot = false }) => (
  <span style={{
    background: bg, color, fontSize: 10, fontWeight: 700,
    padding: "3px 10px", borderRadius: 99,
    display: "inline-flex", alignItems: "center", gap: 5,
  }}>
    {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />}
    {label}
  </span>
);

const StatusBadge = ({ status }) => {
  const map = {
    active:     { label: "Active",     color: C.success, bg: C.successLight },
    on_leave:   { label: "On Leave",   color: C.warning, bg: C.warningLight },
    suspended:  { label: "Suspended",  color: C.danger,  bg: C.dangerLight },
    terminated: { label: "Terminated", color: C.textMuted, bg: C.surfaceAlt },
  };
  const s = map[status] || map.active;
  return <Chip label={s.label} color={s.color} bg={s.bg} dot />;
};

const InfoRow = ({ label, value, masked = false, mono = false }) => {
  const [copied, setCopied] = useState(false);
  const display = masked && value ? value.replace(/(\d{4})\d+(\d{4})/, "$1••••$2") : value;
  return (
    <div style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
      <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 500, minWidth: 140 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, color: value ? C.textPrimary : C.textMuted, fontFamily: mono ? "monospace" : "inherit", fontWeight: value ? 500 : 400 }}>
          {display || "—"}
        </span>
        {masked && value && (
          <Motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
          >
            {copied ? <Check size={12} color={C.success} /> : <Copy size={12} color={C.textMuted} />}
          </Motion.button>
        )}
      </div>
    </div>
  );
};

const SectionCard = ({ children, style = {} }) => (
  <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,0.04)", ...style }}>
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, title, sub, color = C.primary, bg = C.primaryLight, action }) => (
  <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={15} color={color} />
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{title}</p>
        {sub && <p style={{ fontSize: 10, color: C.textMuted, marginTop: 1 }}>{sub}</p>}
      </div>
    </div>
    {action}
  </div>
);

// ── Tab definitions ──
const TABS = [
  { id: "personal",  label: "Personal",  icon: User },
  { id: "job",       label: "Job",        icon: Briefcase },
  { id: "payroll",   label: "Payroll",    icon: CreditCard },
  { id: "documents", label: "Documents",  icon: FileText },
  { id: "leave",     label: "Leave",      icon: Plane },
  { id: "security",  label: "Security",   icon: Shield },
  { id: "activity",  label: "Activity",   icon: Activity },
];

// ════════════════════════════ TAB PANELS ════════════════════════════

function PersonalTab({ emp, onRequestChange }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState(null);

  const editableFields = [
    { key: "phone",            label: "Phone Number" },
    { key: "personalEmail",    label: "Personal Email" },
    { key: "address",          label: "Residential Address" },
    { key: "nokName",          label: "Next of Kin Name" },
    { key: "nokRelationship",  label: "NOK Relationship" },
    { key: "nokPhone",         label: "NOK Phone" },
  ];

  const handleSubmit = async () => {
    setSaving(true);
    setErr(null);
    try {
      await requestProfileChange(form);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setErr(e?.response?.data?.message ?? "Failed to submit change request.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Motion.div variants={tabAnim} initial="hidden" animate="visible" className="space-y-4">
      {saved && (
        <div style={{ background: C.successLight, border: `1px solid ${C.success}33`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle2 size={14} color={C.success} />
          <p style={{ fontSize: 13, color: C.success, fontWeight: 600 }}>Change request submitted. HR will review shortly.</p>
        </div>
      )}
      {err && (
        <div style={{ background: C.dangerLight, border: `1px solid ${C.danger}33`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
          <AlertCircle size={14} color={C.danger} />
          <p style={{ fontSize: 13, color: C.danger }}>{err}</p>
        </div>
      )}

      <SectionCard>
        <SectionHeader icon={User} title="Personal Information" sub="Contact and identity details"
          action={
            <Motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setEditing(!editing); setForm({}); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: editing ? C.dangerLight : C.primaryLight, border: "none", borderRadius: 8, fontSize: 11, fontWeight: 700, color: editing ? C.danger : C.primary, cursor: "pointer" }}
            >
              {editing ? <><X size={11} /> Cancel</> : <><Edit3 size={11} /> Request Change</>}
            </Motion.button>
          }
        />
        <div style={{ padding: "4px 20px 12px" }}>
          {[
            { label: "First Name",         value: emp.first_name },
            { label: "Last Name",          value: emp.last_name },
            { label: "Date of Birth",      value: emp.date_of_birth ? new Date(emp.date_of_birth).toLocaleDateString() : null },
            { label: "Gender",             value: emp.gender },
            { label: "Nationality",        value: emp.nationality },
            { label: "Marital Status",     value: emp.marital_status },
            { label: "Personal Email",     value: emp.personal_email },
            { label: "Phone",              value: emp.phone },
            { label: "Address",            value: emp.address },
          ].map(({ label, value }) => (
            editing && editableFields.find(f => f.label === label) ? (
              <div key={label} style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                <p style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{label}</p>
                <input
                  defaultValue={value || ""}
                  onChange={(e) => setForm(f => ({ ...f, [editableFields.find(x => x.label === label)?.key]: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${C.primary}66`, background: C.surfaceAlt, fontSize: 13, outline: "none", color: C.textPrimary }}
                />
              </div>
            ) : (
              <InfoRow key={label} label={label} value={value} />
            )
          ))}
        </div>
        {editing && (
          <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
            <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setEditing(false)}
              style={{ flex: 1, padding: "9px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surfaceAlt, fontSize: 12, fontWeight: 600, color: C.textSecondary, cursor: "pointer" }}
            >Cancel</Motion.button>
            <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={saving}
              style={{ flex: 2, padding: "9px", borderRadius: 10, border: "none", background: C.primary, color: "#fff", fontSize: 12, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              {saving ? <><Loader2 size={12} className="animate-spin" /> Submitting…</> : <><Save size={12} /> Submit Change Request</>}
            </Motion.button>
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <SectionHeader icon={UserCheck} title="Next of Kin" color={C.accent} bg={C.accentLight} />
        <div style={{ padding: "4px 20px 12px" }}>
          <InfoRow label="Name"         value={emp.nok_name} />
          <InfoRow label="Relationship" value={emp.nok_relationship} />
          <InfoRow label="Phone"        value={emp.nok_phone} />
          <InfoRow label="Address"      value={emp.nok_address} />
        </div>
      </SectionCard>
    </Motion.div>
  );
}

function JobTab({ emp }) {
  return (
    <Motion.div variants={tabAnim} initial="hidden" animate="visible" className="space-y-4">
      <SectionCard>
        <SectionHeader icon={Briefcase} title="Employment Details" sub="Role, department, and employment info" />
        <div style={{ padding: "4px 20px 12px" }}>
          <InfoRow label="Employee Code"    value={emp.employee_code} mono />
          <InfoRow label="Department"       value={emp.department_name} />
          <InfoRow label="Job Role"         value={emp.job_role_name} />
          <InfoRow label="Manager"          value={emp.manager_name} />
          <InfoRow label="Employment Type"  value={emp.employment_type?.replace("_", " ")} />
          <InfoRow label="Start Date"       value={emp.start_date ? new Date(emp.start_date).toLocaleDateString() : null} />
          <InfoRow label="Confirmation"     value={emp.confirmation_date ? new Date(emp.confirmation_date).toLocaleDateString() : null} />
          <InfoRow label="Location"         value={emp.location} />
          <InfoRow label="Status"           value={emp.employment_status} />
          <InfoRow label="Pay Grade"        value={emp.pay_grade} />
        </div>
      </SectionCard>
    </Motion.div>
  );
}

function PayrollTab({ emp }) {
  return (
    <Motion.div variants={tabAnim} initial="hidden" animate="visible" className="space-y-4">
      <SectionCard>
        <SectionHeader icon={CreditCard} title="Bank & Payroll Details" sub="Salary and banking information" color={C.success} bg={C.successLight} />
        <div style={{ padding: "4px 20px 12px" }}>
          <InfoRow label="Basic Salary"    value={emp.basic_salary ? `₦${Number(emp.basic_salary).toLocaleString()}` : null} />
          <InfoRow label="Pay Grade"       value={emp.pay_grade} />
          <InfoRow label="Bank Name"       value={emp.bank_name} />
          <InfoRow label="Account Number"  value={emp.account_number} masked mono />
          <InfoRow label="Account Name"    value={emp.account_name} />
          <InfoRow label="Pension PIN"     value={emp.pension_pin} mono />
          <InfoRow label="Tax ID"          value={emp.tax_id} mono />
        </div>
      </SectionCard>
    </Motion.div>
  );
}

function DocumentsTab() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    documentApi.getAll()
      .then(r => setDocs(r.data ?? r.documents ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Motion.div variants={tabAnim} initial="hidden" animate="visible" className="space-y-4">
      <SectionCard>
        <SectionHeader icon={FileText} title="My Documents" sub="Signed and pending documents" />
        {loading ? (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} h={44} />)}
          </div>
        ) : docs.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: C.textMuted, fontSize: 13 }}>No documents found.</div>
        ) : (
          <div style={{ padding: "4px 20px 12px" }}>
            {docs.map(doc => (
              <div key={doc.id} style={{ padding: "12px 0", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FileText size={14} color={C.primary} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{doc.title ?? doc.name}</p>
                    <p style={{ fontSize: 11, color: C.textMuted }}>{doc.status ?? "—"} · {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : ""}</p>
                  </div>
                </div>
                <Chip label={doc.status === "signed" ? "Signed" : "Pending"} color={doc.status === "signed" ? C.success : C.warning} bg={doc.status === "signed" ? C.successLight : C.warningLight} dot />
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </Motion.div>
  );
}

function LeaveTab({ empId }) {
  const [balances, setBalances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([leaveApi.getMyBalances(), leaveApi.getMyRequests({ limit: 10 })])
      .then(([bal, req]) => {
        setBalances(bal.data ?? bal.balances ?? []);
        setRequests(req.data ?? req.requests ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Motion.div variants={tabAnim} initial="hidden" animate="visible" className="space-y-4">
      <SectionCard>
        <SectionHeader icon={Plane} title="Leave Balances" color={C.accent} bg={C.accentLight} />
        {loading ? (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>{[1,2,3].map(i => <Skeleton key={i} h={36} />)}</div>
        ) : balances.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: C.textMuted, fontSize: 13 }}>No leave balances found.</div>
        ) : (
          <div style={{ padding: "4px 20px 12px" }}>
            {balances.map(b => (
              <div key={b.id} style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{b.leave_type ?? b.policy_name}</p>
                  <p style={{ fontSize: 11, color: C.textMuted }}>{b.entitled_days} days entitled</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: C.primary, fontFamily: "Sora,sans-serif" }}>{b.remaining_days ?? b.balance}</p>
                  <p style={{ fontSize: 10, color: C.textMuted }}>days left</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <SectionHeader icon={Clock} title="Recent Leave Requests" />
        {loading ? (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>{[1,2].map(i => <Skeleton key={i} h={44} />)}</div>
        ) : requests.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: C.textMuted, fontSize: 13 }}>No leave requests found.</div>
        ) : (
          <div style={{ padding: "4px 20px 12px" }}>
            {requests.map(r => (
              <div key={r.id} style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{r.leave_type ?? r.type}</p>
                  <p style={{ fontSize: 11, color: C.textMuted }}>{r.start_date ? new Date(r.start_date).toLocaleDateString() : ""} — {r.end_date ? new Date(r.end_date).toLocaleDateString() : ""}</p>
                </div>
                <Chip
                  label={r.status}
                  color={r.status === "approved" ? C.success : r.status === "rejected" ? C.danger : C.warning}
                  bg={r.status === "approved" ? C.successLight : r.status === "rejected" ? C.dangerLight : C.warningLight}
                  dot
                />
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </Motion.div>
  );
}

function SecurityTab({ isSelf }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleChange = async () => {
    if (form.newPassword !== form.confirmPassword) { setMsg({ type: "error", text: "Passwords do not match." }); return; }
    if (form.newPassword.length < 8) { setMsg({ type: "error", text: "Password must be at least 8 characters." }); return; }
    setSaving(true);
    setMsg(null);
    try {
      await authApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setMsg({ type: "success", text: "Password changed successfully." });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      setMsg({ type: "error", text: e?.response?.data?.message ?? "Password change failed." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Motion.div variants={tabAnim} initial="hidden" animate="visible" className="space-y-4">
      {isSelf && (
        <SectionCard>
          <SectionHeader icon={Key} title="Change Password" color={C.warning} bg={C.warningLight} />
          <div style={{ padding: 20 }}>
            {msg && (
              <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: msg.type === "success" ? C.successLight : C.dangerLight, border: `1px solid ${msg.type === "success" ? C.success : C.danger}33`, color: msg.type === "success" ? C.success : C.danger, fontSize: 13 }}>
                {msg.text}
              </div>
            )}
            {[
              { key: "currentPassword", label: "Current Password" },
              { key: "newPassword",     label: "New Password" },
              { key: "confirmPassword", label: "Confirm New Password" },
            ].map(({ key, label }) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 4 }}>{label}</p>
                <input
                  type="password"
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.surfaceAlt, fontSize: 13, outline: "none", color: C.textPrimary }}
                />
              </div>
            ))}
            <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleChange} disabled={saving}
              style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: C.primary, color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {saving ? <><Loader2 size={14} className="animate-spin" /> Changing…</> : <><Lock size={13} /> Change Password</>}
            </Motion.button>
          </div>
        </SectionCard>
      )}
    </Motion.div>
  );
}

function ActivityTab() {
  return (
    <Motion.div variants={tabAnim} initial="hidden" animate="visible">
      <SectionCard>
        <SectionHeader icon={Activity} title="Recent Activity" />
        <div style={{ padding: 32, textAlign: "center", color: C.textMuted, fontSize: 13 }}>Activity log coming soon.</div>
      </SectionCard>
    </Motion.div>
  );
}

// ════════════════════════════ MAIN COMPONENT ════════════════════════════
export default function ProfilePage() {
  const navigate = useNavigate();
  const { employee: authEmployee, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isManager, setIsManager] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyProfile();
      const profile = res.data ?? res;
      setEmp(profile);
      // Manager detection: backend returns role or team count
      setIsManager(
        profile.role === "manager" ||
        authEmployee?.role === "manager" ||
        profile.employment_status === "active" && profile.manages_team === true
      );
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [authEmployee]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const initials = useMemo(() => {
    if (!emp) return authEmployee?.initials ?? "?";
    return `${emp.first_name?.[0] ?? ""}${emp.last_name?.[0] ?? ""}`.toUpperCase() || "?";
  }, [emp, authEmployee]);

  const name = emp ? `${emp.first_name} ${emp.last_name}` : authEmployee?.name ?? "—";

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans','Sora',sans-serif", color: C.textPrimary }}>
      <style>{`@keyframes prof-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <SideNavbar sidebarOpen={sidebarOpen} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
          {/* Header */}
          <header className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10" style={{ background: "rgba(240,242,248,0.85)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}` }}>
            <Motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSidebarOpen(p => !p)} className="p-2 rounded-xl hidden md:flex" style={{ background: C.surface, border: `1px solid ${C.border}`, cursor: "pointer" }}>
              <Menu size={15} color={C.textSecondary} />
            </Motion.button>

            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textSecondary }}>
              <span>Home</span><ChevronRight size={11} />
              <span style={{ fontWeight: 700, color: C.textPrimary }}>My Profile</span>
            </div>

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              {isManager && (
                <Motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/managerprofile")}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: C.primaryLight, border: `1px solid ${C.primary}33`, borderRadius: 8, fontSize: 11, fontWeight: 700, color: C.primary, cursor: "pointer" }}
                >
                  <Users size={12} /> Manager Dashboard <ArrowRight size={11} />
                </Motion.button>
              )}
              <Motion.button whileHover={{ scale: 1.05 }} onClick={fetchProfile} style={{ width: 32, height: 32, borderRadius: 8, background: C.surface, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <RefreshCw size={13} color={C.textMuted} />
              </Motion.button>
              <AvatarEl initials={initials} avatar={emp?.avatar} size={32} />
            </div>
          </header>

          <main style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
            {error && (
              <div style={{ marginBottom: 16, background: C.dangerLight, border: `1px solid ${C.danger}33`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle size={14} color={C.danger} />
                <p style={{ fontSize: 13, color: C.danger, flex: 1 }}>{error}</p>
                <button onClick={fetchProfile} style={{ fontSize: 11, color: C.danger, background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>Retry</button>
              </div>
            )}

            {/* Profile Hero */}
            {loading ? (
              <div style={{ marginBottom: 20 }}><Skeleton h={120} /></div>
            ) : emp && (
              <Motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                <SectionCard style={{ marginBottom: 20 }}>
                  <div style={{ background: `linear-gradient(135deg,${C.navy},${C.primary})`, padding: "24px 24px 0" }}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ position: "relative" }}>
                        <AvatarEl initials={initials} avatar={emp.avatar} size={72} />
                        {isManager && (
                          <div style={{ position: "absolute", bottom: -6, right: -6, background: "#F59E0B", borderRadius: 6, padding: "2px 7px", fontSize: 8, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 3 }}>
                            <Award size={8} /> MGR
                          </div>
                        )}
                      </div>
                      <div style={{ paddingBottom: 16, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "Sora,sans-serif" }}>{name}</h1>
                          {isManager && <Chip label="Manager" color="#F59E0B" bg="rgba(245,158,11,0.18)" />}
                          <StatusBadge status={emp.employment_status} />
                        </div>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
                          {emp.job_role_name} · {emp.department_name}
                        </p>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2, fontFamily: "monospace" }}>
                          {emp.employee_code}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Profile completion bar */}
                  <div style={{ padding: "12px 24px", background: C.surfaceAlt }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: C.textMuted }}>Profile completion</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.primary }}>
                        {[emp.phone, emp.address, emp.nok_name, emp.bank_name, emp.avatar].filter(Boolean).length * 20}%
                      </span>
                    </div>
                    <div style={{ height: 4, borderRadius: 99, background: C.border, overflow: "hidden" }}>
                      <div style={{ width: `${[emp.phone, emp.address, emp.nok_name, emp.bank_name, emp.avatar].filter(Boolean).length * 20}%`, height: "100%", background: `linear-gradient(90deg,${C.primary},${C.accent})`, borderRadius: 99 }} />
                    </div>
                  </div>
                </SectionCard>
              </Motion.div>
            )}

            {/* Tabs */}
            {loading ? (
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {[80, 60, 70, 90, 60, 70, 70].map((w, i) => <Skeleton key={i} w={w} h={34} />)}
              </div>
            ) : (
              <Motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}
                style={{ display: "flex", gap: 4, marginBottom: 16, background: C.surface, padding: 4, borderRadius: 14, border: `1px solid ${C.border}`, overflowX: "auto" }}
              >
                {TABS.map(({ id, label, icon: Icon }) => {
                  const active = activeTab === id;
                  return (
                    <Motion.button key={id} whileHover={{ scale: active ? 1 : 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveTab(id)}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0, background: active ? C.primary : "transparent", color: active ? "#fff" : C.textSecondary, boxShadow: active ? "0 2px 8px rgba(79,70,229,0.25)" : "none", transition: "all 0.18s" }}
                    >
                      <Icon size={12} />{label}
                    </Motion.button>
                  );
                })}
              </Motion.div>
            )}

            {/* Tab content */}
            {!loading && emp && (
              <AnimatePresence mode="wait">
                <div key={activeTab}>
                  {activeTab === "personal"  && <PersonalTab emp={emp} />}
                  {activeTab === "job"       && <JobTab emp={emp} />}
                  {activeTab === "payroll"   && <PayrollTab emp={emp} />}
                  {activeTab === "documents" && <DocumentsTab />}
                  {activeTab === "leave"     && <LeaveTab empId={emp.id} />}
                  {activeTab === "security"  && <SecurityTab isSelf />}
                  {activeTab === "activity"  && <ActivityTab />}
                </div>
              </AnimatePresence>
            )}

            <div style={{ height: 28 }} />
          </main>
        </div>
      </div>
    </div>
  );
}