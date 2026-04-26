// // src/admin/documents/DocumentTemplates.jsx
// // Route: /admin/documents
// // Document templates management + send flow. No mock data.

// import { useState, useEffect, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import AdminSideNavbar from "../AdminSideNavbar";
// import {
//   FileText,
//   Plus,
//   Eye,
//   Send,
//   Upload,
//   X,
//   Loader2,
//   RefreshCw,
//   CheckCircle2,
//   XCircle,
//   Menu,
//   Search,
//   AlertTriangle,
//   Trash2,
//   BookOpen,
//   Users,
// } from "lucide-react";
// import {C} from "../employeemanagement/sharedData";
// import { documentApi } from "../../api/service/documentApi";
// import { getEmployees } from "../../api/service/employeeApi";

// const fadeUp = {
//   hidden: { opacity: 0, y: 12 },
//   visible: (i = 0) => ({
//     opacity: 1,
//     y: 0,
//     transition: { delay: i * 0.05, duration: 0.36 },
//   }),
// };

// const CATEGORIES = [
//   "Contract",
//   "NDA",
//   "Offer Letter",
//   "Policy",
//   "Onboarding",
//   "Compliance",
//   "Other",
// ];

// const PLACEHOLDERS = [
//   "{{firstName}}",
//   "{{lastName}}",
//   "{{email}}",
//   "{{position}}",
//   "{{department}}",
//   "{{startDate}}",
//   "{{salary}}",
//   "{{employeeCode}}",
// ];

// // ── Atoms ─────────────────────────────────────────────────────
// function Toast({ msg, type, onDone }) {
//   useEffect(() => {
//     const t = setTimeout(onDone, 3500);
//     return () => clearTimeout(t);
//   }, [onDone]);
//   const Icon = type === "success" ? CheckCircle2 : XCircle;
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
//       <Icon size={16} color={type === "success" ? C.success : C.danger} />
//       <span className="text-white text-sm font-semibold">{msg}</span>
//     </motion.div>
//   );
// }

// // ── Upload / Create Template Modal ───────────────────────────
// function TemplateModal({ template, onClose, onSaved }) {
//   const isEdit = !!template;
//   const [form, setForm] = useState({
//     name: template?.name ?? "",
//     category: template?.category ?? "Contract",
//     content: template?.content ?? "",
//   });
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

//   const insertPlaceholder = (ph) => set("content", form.content + ph);

//   const handleSubmit = async () => {
//     if (!form.name.trim()) {
//       setError("Template name is required.");
//       return;
//     }
//     if (!form.content.trim()) {
//       setError("Template content is required.");
//       return;
//     }
//     setSaving(true);
//     try {
//       const res = isEdit
//         ? await documentApi.updateTemplate(template.id, form)
//         : await documentApi.createTemplate(form);
//       onSaved(res.data ?? res, isEdit ? "updated" : "created");
//     } catch (err) {
//       setError(err?.response?.data?.message ?? "Failed to save template.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-50 flex items-center justify-center p-5"
//       style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ scale: 0.93, y: 20 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.93, y: 20 }}
//         transition={{ type: "spring", stiffness: 260, damping: 24 }}
//         className="w-full max-w-2xl rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
//         style={{
//           background: C.surface,
//           boxShadow: "0 24px 64px rgba(15,23,42,0.2)",
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div
//           className="px-6 pt-5 pb-4 flex items-center justify-between shrink-0"
//           style={{ borderBottom: `1px solid ${C.border}` }}
//         >
//           <div className="flex items-center gap-2">
//             <div
//               className="w-9 h-9 rounded-xl flex items-center justify-center"
//               style={{ background: C.primaryLight }}
//             >
//               <FileText size={16} color={C.primary} />
//             </div>
//             <div>
//               <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
//                 {isEdit ? "Edit Template" : "Upload Template"}
//               </p>
//               <p className="text-[10px]" style={{ color: C.textMuted }}>
//                 Use placeholders to auto-fill employee data
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 rounded-xl flex items-center justify-center"
//             style={{ background: C.surfaceAlt }}
//           >
//             <X size={13} color={C.textMuted} />
//           </button>
//         </div>

//         <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
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

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label
//                 className="block text-xs font-semibold mb-1"
//                 style={{ color: C.textPrimary }}
//               >
//                 Template Name *
//               </label>
//               <input
//                 value={form.name}
//                 onChange={(e) => set("name", e.target.value)}
//                 placeholder="e.g. Employment Contract 2026"
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
//                 Category
//               </label>
//               <select
//                 value={form.category}
//                 onChange={(e) => set("category", e.target.value)}
//                 className="w-full px-3 py-2 rounded-xl text-sm outline-none"
//                 style={{
//                   background: C.surfaceAlt,
//                   border: `1.5px solid ${C.border}`,
//                   color: C.textPrimary,
//                 }}
//               >
//                 {CATEGORIES.map((c) => (
//                   <option key={c}>{c}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Placeholder helpers */}
//           <div>
//             <p
//               className="text-xs font-semibold mb-2"
//               style={{ color: C.textSecondary }}
//             >
//               Available Placeholders — click to insert:
//             </p>
//             <div className="flex flex-wrap gap-1.5">
//               {PLACEHOLDERS.map((ph) => (
//                 <button
//                   key={ph}
//                   onClick={() => insertPlaceholder(ph)}
//                   className="text-[10px] font-mono font-bold px-2 py-1 rounded-md"
//                   style={{ background: C.primaryLight, color: C.primary }}
//                 >
//                   {ph}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div>
//             <label
//               className="block text-xs font-semibold mb-1"
//               style={{ color: C.textPrimary }}
//             >
//               Template Content *
//             </label>
//             <textarea
//               value={form.content}
//               onChange={(e) => set("content", e.target.value)}
//               rows={12}
//               placeholder="Write your template here. Use {{placeholders}} to auto-fill employee data..."
//               className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-y font-mono"
//               style={{
//                 background: C.surfaceAlt,
//                 border: `1.5px solid ${C.border}`,
//                 color: C.textPrimary,
//                 minHeight: 200,
//               }}
//             />
//           </div>
//         </div>

//         <div className="flex gap-3 px-6 pb-5 shrink-0">
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
//           <motion.button
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
//               <Upload size={13} />
//             )}
//             {isEdit ? "Save Changes" : "Upload Template"}
//           </motion.button>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ── Preview Modal ─────────────────────────────────────────────
// function PreviewModal({ template, onClose }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-50 flex items-center justify-center p-5"
//       style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ scale: 0.95 }}
//         animate={{ scale: 1 }}
//         exit={{ scale: 0.95 }}
//         className="w-full max-w-2xl rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
//         style={{
//           background: C.surface,
//           boxShadow: "0 24px 64px rgba(15,23,42,0.2)",
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div
//           className="px-6 py-4 flex items-center justify-between shrink-0"
//           style={{ borderBottom: `1px solid ${C.border}` }}
//         >
//           <div>
//             <p className="font-bold" style={{ color: C.textPrimary }}>
//               {template.name}
//             </p>
//             <p className="text-xs" style={{ color: C.textMuted }}>
//               {template.category} Template
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 rounded-xl flex items-center justify-center"
//             style={{ background: C.surfaceAlt }}
//           >
//             <X size={13} color={C.textMuted} />
//           </button>
//         </div>
//         <div className="flex-1 overflow-y-auto p-6">
//           <pre
//             className="text-sm whitespace-pre-wrap leading-relaxed font-sans"
//             style={{ color: C.textPrimary }}
//           >
//             {template.content}
//           </pre>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ── Send Document Modal ───────────────────────────────────────
// function SendModal({ templates, onClose, onSent }) {
//   const [employees, setEmployees] = useState([]);
//   const [form, setForm] = useState({ employeeId: "", templateId: "" });
//   const [sending, setSending] = useState(false);
//   const [error, setError] = useState("");
//   const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

//   useEffect(() => {
//     getEmployees({ limit: 200 })
//       .then((res) => setEmployees(res.data ?? []))
//       .catch(() => {});
//   }, []);

//   const selectedTemplate = templates.find((t) => t.id === form.templateId);

//   const handleSend = async () => {
//     if (!form.employeeId || !form.templateId) {
//       setError("Please select both an employee and a template.");
//       return;
//     }
//     setSending(true);
//     try {
//       await documentApi.send(form.employeeId, form.templateId);
//       onSent();
//     } catch (err) {
//       setError(err?.response?.data?.message ?? "Failed to send document.");
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-50 flex items-center justify-center p-5"
//       style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
//       onClick={onClose}
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
//           className="px-5 py-4 flex items-center justify-between"
//           style={{ borderBottom: `1px solid ${C.border}` }}
//         >
//           <div className="flex items-center gap-2">
//             <div
//               className="w-8 h-8 rounded-xl flex items-center justify-center"
//               style={{ background: "#ECFEFF" }}
//             >
//               <Send size={14} color={C.accent} />
//             </div>
//             <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
//               Send Document
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="w-7 h-7 rounded-xl flex items-center justify-center"
//             style={{ background: C.surfaceAlt }}
//           >
//             <X size={13} color={C.textMuted} />
//           </button>
//         </div>

//         <div className="p-5 space-y-4">
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

//           <div>
//             <label
//               className="block text-xs font-semibold mb-1"
//               style={{ color: C.textPrimary }}
//             >
//               Select Employee *
//             </label>
//             <select
//               value={form.employeeId}
//               onChange={(e) => set("employeeId", e.target.value)}
//               className="w-full px-3 py-2 rounded-xl text-sm outline-none"
//               style={{
//                 background: C.surfaceAlt,
//                 border: `1.5px solid ${C.border}`,
//                 color: C.textPrimary,
//               }}
//             >
//               <option value="">— Choose employee —</option>
//               {employees.map((e) => (
//                 <option key={e.id} value={e.id}>
//                   {e.first_name} {e.last_name} ({e.employee_code})
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label
//               className="block text-xs font-semibold mb-1"
//               style={{ color: C.textPrimary }}
//             >
//               Select Template *
//             </label>
//             <select
//               value={form.templateId}
//               onChange={(e) => set("templateId", e.target.value)}
//               className="w-full px-3 py-2 rounded-xl text-sm outline-none"
//               style={{
//                 background: C.surfaceAlt,
//                 border: `1.5px solid ${C.border}`,
//                 color: C.textPrimary,
//               }}
//             >
//               <option value="">— Choose template —</option>
//               {templates.map((t) => (
//                 <option key={t.id} value={t.id}>
//                   {t.name} ({t.category})
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Preview snippet */}
//           {selectedTemplate && (
//             <div
//               className="rounded-xl p-3"
//               style={{
//                 background: C.surfaceAlt,
//                 border: `1px solid ${C.border}`,
//               }}
//             >
//               <p
//                 className="text-[10px] font-semibold mb-1"
//                 style={{ color: C.textMuted }}
//               >
//                 Template Preview
//               </p>
//               <p
//                 className="text-xs leading-relaxed font-mono"
//                 style={{ color: C.textSecondary }}
//               >
//                 {selectedTemplate.content?.slice(0, 200)}
//                 {selectedTemplate.content?.length > 200 ? "…" : ""}
//               </p>
//             </div>
//           )}

//           {/* Pending approval notice */}
//           <div
//             className="rounded-xl p-3 flex items-start gap-2"
//             style={{
//               background: C.warningLight,
//               border: `1px solid ${C.warning}33`,
//             }}
//           >
//             <AlertTriangle
//               size={13}
//               color={C.warning}
//               className="shrink-0 mt-0.5"
//             />
//             <p className="text-xs" style={{ color: C.warning }}>
//               After sending, the document will show{" "}
//               <strong>Pending Approval</strong> status until reviewed.
//             </p>
//           </div>
//         </div>

//         <div className="flex gap-3 px-5 pb-5">
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
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={handleSend}
//             disabled={sending}
//             className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
//             style={{ background: C.accent, opacity: sending ? 0.8 : 1 }}
//           >
//             {sending ? (
//               <Loader2 size={13} className="animate-spin" />
//             ) : (
//               <Send size={13} />
//             )}
//             Send Document
//           </motion.button>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════
// export default function DocumentTemplates() {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [templates, setTemplates] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [search, setSearch] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("all");
//   const [uploadModal, setUploadModal] = useState(null); // null | "new" | { template }
//   const [previewTarget, setPreviewTarget] = useState(null);
//   const [sendModal, setSendModal] = useState(false);
//   const [toast, setToast] = useState(null);

//   const showToast = (msg, type = "success") => setToast({ msg, type });

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await documentApi.getTemplates();
//       setTemplates(res.data ?? []);
//     } catch (err) {
//       setError(err?.response?.data?.message ?? "Failed to load templates.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     load();
//   }, [load]);

//   const handleSaved = (template, action) => {
//     if (action === "created") {
//       setTemplates((prev) => [template, ...prev]);
//     } else {
//       setTemplates((prev) =>
//         prev.map((t) => (t.id === template.id ? template : t)),
//       );
//     }
//     setUploadModal(null);
//     showToast(`Template ${action} successfully.`);
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Delete this template? This cannot be undone.")) return;
//     try {
//       await documentApi.deleteTemplate(id);
//       setTemplates((prev) => prev.filter((t) => t.id !== id));
//       showToast("Template deleted.");
//     } catch {
//       showToast("Failed to delete template.", "error");
//     }
//   };

//   const filtered = templates.filter((t) => {
//     const q = search.toLowerCase();
//     const matchS =
//       !q ||
//       t.name?.toLowerCase().includes(q) ||
//       t.category?.toLowerCase().includes(q);
//     const matchC = categoryFilter === "all" || t.category === categoryFilter;
//     return matchS && matchC;
//   });

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
//         />

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
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setSidebarOpen((p) => !p)}
//               className="p-2 rounded-xl hidden md:flex"
//               style={{ background: C.surface }}
//             >
//               <Menu size={16} color={C.textSecondary} />
//             </motion.button>
//             <div className="relative flex-1 max-w-xs">
//               <Search
//                 size={14}
//                 className="absolute left-3 top-1/2 -translate-y-1/2"
//                 color={C.textMuted}
//               />
//               <input
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search templates..."
//                 className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
//                 style={{
//                   background: C.surface,
//                   border: `1.5px solid ${C.border}`,
//                   color: C.textPrimary,
//                 }}
//               />
//             </div>
//             <div className="ml-auto flex items-center gap-2">
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => setSendModal(true)}
//                 className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold"
//                 style={{
//                   background: C.accentLight,
//                   color: C.accent,
//                   border: `1px solid ${C.accent}33`,
//                 }}
//               >
//                 <Send size={14} /> Send Document
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => setUploadModal("new")}
//                 className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-white"
//                 style={{ background: C.primary }}
//               >
//                 <Plus size={14} /> Upload Template
//               </motion.button>
//             </div>
//           </header>

//           <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
//             <div>
//               <h1
//                 className="text-2xl font-bold"
//                 style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
//               >
//                 Document Templates
//               </h1>
//               <p className="text-sm mt-0.5" style={{ color: C.textMuted }}>
//                 Create templates with placeholders · Send to employees · Track
//                 signatures
//               </p>
//             </div>

//             {/* Category filter */}
//             <div className="flex gap-2 flex-wrap">
//               {["all", ...CATEGORIES].map((c) => (
//                 <button
//                   key={c}
//                   onClick={() => setCategoryFilter(c)}
//                   className="text-[11px] font-bold px-3 py-1.5 rounded-full"
//                   style={{
//                     background: categoryFilter === c ? C.primary : C.surface,
//                     color: categoryFilter === c ? "#fff" : C.textSecondary,
//                     border: `1px solid ${categoryFilter === c ? C.primary : C.border}`,
//                   }}
//                 >
//                   {c === "all" ? "All Categories" : c}
//                 </button>
//               ))}
//             </div>

//             {error && (
//               <div
//                 className="rounded-xl p-4 flex items-center gap-2"
//                 style={{ background: C.dangerLight }}
//               >
//                 <AlertTriangle size={15} color={C.danger} />
//                 <p className="text-sm" style={{ color: C.danger }}>
//                   {error}
//                 </p>
//               </div>
//             )}

//             {loading ? (
//               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//                 {[1, 2, 3, 4, 5, 6].map((i) => (
//                   <div
//                     key={i}
//                     className="h-36 rounded-2xl animate-pulse"
//                     style={{
//                       background: C.surface,
//                       border: `1px solid ${C.border}`,
//                     }}
//                   />
//                 ))}
//               </div>
//             ) : filtered.length === 0 ? (
//               <div
//                 className="rounded-2xl p-16 flex flex-col items-center gap-3"
//                 style={{
//                   background: C.surface,
//                   border: `1px solid ${C.border}`,
//                 }}
//               >
//                 <BookOpen size={36} color={C.textMuted} />
//                 <p className="font-semibold" style={{ color: C.textSecondary }}>
//                   No templates found
//                 </p>
//                 <motion.button
//                   whileHover={{ scale: 1.04 }}
//                   whileTap={{ scale: 0.97 }}
//                   onClick={() => setUploadModal("new")}
//                   className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
//                   style={{ background: C.primary }}
//                 >
//                   <Plus size={14} /> Upload First Template
//                 </motion.button>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//                 {filtered.map((t, i) => (
//                   <motion.div
//                     key={t.id}
//                     custom={i}
//                     variants={fadeUp}
//                     initial="hidden"
//                     animate="visible"
//                     whileHover={{
//                       y: -3,
//                       boxShadow: `0 8px 24px rgba(79,70,229,0.12)`,
//                     }}
//                     className="rounded-2xl p-5 flex flex-col gap-3"
//                     style={{
//                       background: C.surface,
//                       border: `1px solid ${C.border}`,
//                     }}
//                   >
//                     <div className="flex items-start justify-between">
//                       <div className="flex items-center gap-2">
//                         <div
//                           className="w-9 h-9 rounded-xl flex items-center justify-center"
//                           style={{ background: C.primaryLight }}
//                         >
//                           <FileText size={16} color={C.primary} />
//                         </div>
//                         <div>
//                           <p
//                             className="font-bold text-sm leading-tight"
//                             style={{ color: C.textPrimary }}
//                           >
//                             {t.name}
//                           </p>
//                           <span
//                             className="text-[10px] font-bold px-2 py-0.5 rounded-full"
//                             style={{
//                               background: C.accentLight,
//                               color: C.accent,
//                             }}
//                           >
//                             {t.category}
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     {t.content && (
//                       <p
//                         className="text-xs leading-relaxed line-clamp-2 font-mono"
//                         style={{ color: C.textSecondary }}
//                       >
//                         {t.content.slice(0, 120)}…
//                       </p>
//                     )}

//                     <p className="text-[10px]" style={{ color: C.textMuted }}>
//                       Updated{" "}
//                       {t.updated_at
//                         ? new Date(t.updated_at).toLocaleDateString("en-NG")
//                         : "—"}
//                     </p>

//                     <div className="flex gap-2 mt-auto">
//                       <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={() => setPreviewTarget(t)}
//                         className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
//                         style={{
//                           background: C.surfaceAlt,
//                           border: `1px solid ${C.border}`,
//                           color: C.textSecondary,
//                         }}
//                       >
//                         <Eye size={12} /> Preview
//                       </motion.button>
//                       <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={() => setUploadModal({ template: t })}
//                         className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
//                         style={{ background: C.primaryLight, color: C.primary }}
//                       >
//                         <Plus size={12} /> Edit
//                       </motion.button>
//                       <motion.button
//                         whileHover={{ scale: 1.1 }}
//                         whileTap={{ scale: 0.9 }}
//                         onClick={() => handleDelete(t.id)}
//                         className="w-8 h-8 rounded-xl flex items-center justify-center"
//                         style={{ background: C.dangerLight }}
//                       >
//                         <Trash2 size={12} color={C.danger} />
//                       </motion.button>
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
//             )}
//           </main>
//         </div>
//       </div>

//       <AnimatePresence>
//         {uploadModal && (
//           <TemplateModal
//             template={uploadModal === "new" ? null : uploadModal.template}
//             onClose={() => setUploadModal(null)}
//             onSaved={handleSaved}
//           />
//         )}
//       </AnimatePresence>
//       <AnimatePresence>
//         {previewTarget && (
//           <PreviewModal
//             template={previewTarget}
//             onClose={() => setPreviewTarget(null)}
//           />
//         )}
//       </AnimatePresence>
//       <AnimatePresence>
//         {sendModal && (
//           <SendModal
//             templates={templates}
//             onClose={() => setSendModal(false)}
//             onSent={() => {
//               setSendModal(false);
//               showToast(
//                 "Document submitted for approval. Status: Pending Approval 🟡",
//               );
//             }}
//           />
//         )}
//       </AnimatePresence>
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

// src/admin/documents/DocumentTemplates.jsx
// Route: /admin/documents
// Production-ready version with Header + Loader integrated

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSideNavbar from "../AdminSideNavbar";
import Header from "../../components/Header"; // ✅ IMPORT HEADER
import {
  FileText,
  Plus,
  Eye,
  Send,
  Upload,
  X,
  Loader2,
  AlertTriangle,
  Trash2,
  BookOpen,
} from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import { documentApi } from "../../api/service/documentApi";


// ─────────────────────────────────────────────
// CATEGORY OPTIONS
// ─────────────────────────────────────────────
const CATEGORIES = [
  "Contract",
  "NDA",
  "Offer Letter",
  "Policy",
  "Onboarding",
  "Compliance",
  "Other",
];


// ═════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════

export default function DocumentTemplates() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // ─────────────────────────────────────────
  // LOAD TEMPLATES
  // ─────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await documentApi.getTemplates();
      setTemplates(res.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ─────────────────────────────────────────
  // FILTERED DATA
  // ─────────────────────────────────────────
  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const q = search.toLowerCase();

      const matchSearch =
        !q ||
        t.name?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q);

      const matchCategory =
        categoryFilter === "all" || t.category === categoryFilter;

      return matchSearch && matchCategory;
    });
  }, [templates, search, categoryFilter]);

  // ─────────────────────────────────────────
  // HEADER STATS
  // ─────────────────────────────────────────
  const headerStats = [
    { label: "Total Templates", value: templates.length },
    {
      label: "Categories",
      value: [...new Set(templates.map((t) => t.category))].length,
      color: C.accent,
    },
  ];

  // ─────────────────────────────────────────
  // DELETE TEMPLATE
  // ─────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this template? This cannot be undone."))
      return;

    try {
      await documentApi.deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Failed to delete template.");
    }
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────

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
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* ✅ HEADER WITH LOADER */}
          <Header
            title="Document Templates"
            subtitle="Create templates · Send to employees · Track approvals"
            icon={FileText}
            loading={loading}
            searchQuery={search}
            setSearchQuery={setSearch}
            setSidebarOpen={setSidebarOpen}
            stats={headerStats}
          />

          {/* MAIN CONTENT */}
          <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

            {/* CATEGORY FILTER */}
            <div className="flex gap-2 flex-wrap">
              {["all", ...CATEGORIES].map((c) => {
                const active = categoryFilter === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(c)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold"
                    style={{
                      background: active ? C.primary : C.surface,
                      color: active ? "#fff" : C.textSecondary,
                      border: `1px solid ${
                        active ? C.primary : C.border
                      }`,
                    }}
                  >
                    {c === "all" ? "All Categories" : c}
                  </button>
                );
              })}
            </div>

            {/* ERROR */}
            {error && (
              <div
                className="rounded-xl p-4 flex items-center gap-2"
                style={{ background: C.dangerLight }}
              >
                <AlertTriangle size={15} color={C.danger} />
                <p className="text-sm" style={{ color: C.danger }}>
                  {error}
                </p>
              </div>
            )}

            {/* EMPTY STATE */}
            {!loading && filtered.length === 0 && (
              <div
                className="rounded-2xl p-16 flex flex-col items-center gap-3"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <BookOpen size={36} color={C.textMuted} />
                <p className="font-semibold" style={{ color: C.textSecondary }}>
                  No templates found
                </p>
              </div>
            )}

            {/* TEMPLATE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((t) => (
                <motion.div
                  key={t.id}
                  whileHover={{
                    y: -4,
                    boxShadow: "0 12px 28px rgba(79,70,229,0.12)",
                  }}
                  className="rounded-2xl p-5 flex flex-col gap-3"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: C.primaryLight }}
                    >
                      <FileText size={16} color={C.primary} />
                    </div>
                    <div>
                      <p
                        className="font-bold text-sm"
                        style={{ color: C.textPrimary }}
                      >
                        {t.name}
                      </p>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: C.accentLight,
                          color: C.accent,
                        }}
                      >
                        {t.category}
                      </span>
                    </div>
                  </div>

                  {t.content && (
                    <p
                      className="text-xs line-clamp-2 font-mono"
                      style={{ color: C.textSecondary }}
                    >
                      {t.content.slice(0, 120)}…
                    </p>
                  )}

                  <div className="flex gap-2 mt-auto">
                    <button
                      className="flex-1 py-2 rounded-xl text-xs font-semibold"
                      style={{
                        background: C.surfaceAlt,
                        border: `1px solid ${C.border}`,
                        color: C.textSecondary,
                      }}
                    >
                      <Eye size={12} className="inline mr-1" />
                      Preview
                    </button>

                    <button
                      onClick={() => handleDelete(t.id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: C.dangerLight }}
                    >
                      <Trash2 size={12} color={C.danger} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}

