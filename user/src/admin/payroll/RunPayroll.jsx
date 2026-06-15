

// // src/admin/payroll/RunPayroll.jsx
// // 4-step payroll wizard with Manual and Assisted modes.
// // Manual  → HR calculates, pays manually via bank.
// // Assisted → System generates a CSV or PDF export for HR.
// //
// // FIXES applied:
// //  1. handleInit — recovers gracefully from 409 (existing run).
// //  2. handleProcess — getRun returns { run, records } not { data.items }.
// //  3. handleDownloadCSV — passes exportFormat ("csv" | "pdf") to getPaymentFile.
// //  4. Summary totals — read from activeRun after process.
// //  5. Format toggle — CSV (bank upload) or PDF (full report) picker added to
// //     Step 3 and the success screen.
// //  6. CSV section order — bank transfer rows come first in the downloaded file.

// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   ArrowRight,
//   ArrowLeft,
//   CheckCircle2,
//   Download,
//   Loader2,
//   AlertCircle,
//   Users,
//   Zap,
//   ClipboardList,
//   FileText,
//   Table2,
// } from "lucide-react";
// import { usePayroll } from "../../components/PayrollContext";
// import { getRun, getPaymentFile, getDeductions } from "../../api/service/payrollApi";
// import { C } from "../employeemanagement/sharedData";

// const STEPS = ["Mode & Period", "Earnings Review", "Deductions", "Summary & Approve"];
// const MONTHS = [
//   "January","February","March","April","May","June",
//   "July","August","September","October","November","December",
// ];

// const fmt  = (n) => `₦${Number(n ?? 0).toLocaleString("en-NG")}`;
// const fmtM = (n) => {
//   const v = Number(n ?? 0);
//   return v >= 1_000_000 ? `₦${(v / 1_000_000).toFixed(2)}M` : fmt(v);
// };

// // ─── Mode selector card ────────────────────────────────────────
// function ModeCard({ icon: Icon, title, description, badge, selected, onClick }) {
//   return (
//     <motion.div
//       whileHover={{ y: -3 }}
//       onClick={onClick}
//       className="cursor-pointer rounded-2xl p-6 border-2 transition-all"
//       style={{
//         background:  selected ? C.primaryLight : C.surface,
//         borderColor: selected ? C.primary : C.border,
//         boxShadow:   selected ? `0 0 0 3px ${C.primaryLight}` : "none",
//       }}
//     >
//       <div className="flex items-start gap-4">
//         <div
//           className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
//           style={{ background: selected ? C.primary : C.surfaceAlt }}
//         >
//           <Icon size={20} color={selected ? "#fff" : C.textMuted} />
//         </div>
//         <div className="flex-1">
//           <div className="flex items-center gap-2">
//             <p className="font-bold text-sm" style={{ color: C.textPrimary }}>{title}</p>
//             {badge && (
//               <span
//                 className="text-[10px] font-bold px-2 py-0.5 rounded-full"
//                 style={{ background: C.successLight, color: C.success }}
//               >
//                 {badge}
//               </span>
//             )}
//           </div>
//           <p className="text-xs mt-1" style={{ color: C.textSecondary }}>{description}</p>
//         </div>
//         <div
//           className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
//           style={{
//             borderColor: selected ? C.primary : C.border,
//             background:  selected ? C.primary : "transparent",
//           }}
//         >
//           {selected && <div className="w-2 h-2 rounded-full bg-white" />}
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// // ─── Format picker (CSV / PDF) ─────────────────────────────────
// function FormatPicker({ value, onChange }) {
//   const options = [
//     {
//       id:    "csv",
//       icon:  Table2,
//       label: "CSV",
//       sub:   "Bank portal upload",
//     },
//     {
//       id:    "pdf",
//       icon:  FileText,
//       label: "PDF / HTML",
//       sub:   "Full payroll report",
//     },
//   ];

//   return (
//     <div>
//       <p className="text-xs font-semibold mb-2" style={{ color: C.textMuted }}>
//         Export Format
//       </p>
//       <div className="flex gap-2">
//         {options.map((f) => {
//           const active = value === f.id;
//           return (
//             <button
//               key={f.id}
//               onClick={() => onChange(f.id)}
//               className="flex-1 py-3 px-4 rounded-xl border-2 text-left transition-all flex items-center gap-3"
//               style={{
//                 background:  active ? C.primaryLight : C.surface,
//                 borderColor: active ? C.primary      : C.border,
//                 cursor:      "pointer",
//               }}
//             >
//               <f.icon size={16} color={active ? C.primary : C.textMuted} />
//               <div>
//                 <p
//                   className="text-sm font-bold leading-tight"
//                   style={{ color: active ? C.primary : C.textPrimary }}
//                 >
//                   {f.label}
//                 </p>
//                 <p className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>
//                   {f.sub}
//                 </p>
//               </div>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// // ─── Main wizard ───────────────────────────────────────────────
// export default function RunPayroll({ onComplete }) {
//   const { startRun, runProcess, runApprove, runMarkPaid, mode, setMode } = usePayroll();

//   const [currentStep,    setCurrentStep]    = useState(0);
//   const [selectedMode,   setSelectedMode]   = useState(mode ?? "manual");
//   const [period,         setPeriod]         = useState(() => {
//     const now = new Date();
//     return { month: now.getMonth() + 1, year: now.getFullYear() };
//   });
//   const [notes,          setNotes]          = useState("");
//   const [activeRun,      setActiveRun]      = useState(null);
//   const [runItems,       setRunItems]       = useState([]);
//   const [deductions,     setDeductions]     = useState([]);
//   const [loading,        setLoading]        = useState(false);
//   const [error,          setError]          = useState(null);
//   const [showSuccess,    setShowSuccess]    = useState(false);
//   const [downloadingCSV, setDownloadingCSV] = useState(false);
//   // "csv" → bank upload sheet | "pdf" → full HTML payroll report
//   const [exportFormat,   setExportFormat]   = useState("csv");

//   const currentYear = new Date().getFullYear();

//   // Load deductions for step 2
//   useEffect(() => {
//     getDeductions()
//       .then((r) => setDeductions(r.data ?? []))
//       .catch(() => {});
//   }, []);

//   // Derive totals from runItems (supports both camelCase and snake_case keys)
//   const totalGross      = runItems.reduce((s, e) => s + Number(e.grossSalary     ?? e.gross_salary      ?? 0), 0);
//   const totalDeductions = runItems.reduce((s, e) => s + Number(e.totalDeductions ?? e.total_deductions  ?? 0), 0);
//   const totalNet        = runItems.reduce((s, e) => s + Number(e.netSalary       ?? e.net_salary        ?? 0), 0);

//   // ── STEP 0 → init run ──────────────────────────────────────
//   const handleInit = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       setMode(selectedMode);
//       const run = await startRun({
//         month: period.month,
//         year:  period.year,
//         mode:  selectedMode,
//         notes,
//       });
//       setActiveRun(run);
//       setCurrentStep(1);
//     } catch (e) {
//       const status = e?.response?.status;
//       const body   = e?.response?.data;
//       // 409 = run for this month already exists — recover and continue
//       if (status === 409 && body?.data?.id) {
//         setActiveRun(body.data);
//         setError(null);
//         setCurrentStep(1);
//       } else {
//         setError(body?.message ?? "Failed to initialise run.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── STEP 1 → process ──────────────────────────────────────
//   const handleProcess = async () => {
//     if (!activeRun?.id) {
//       setError("No active run — please go back to step 1.");
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       await runProcess(activeRun.id);

//       // getRun returns { run, records, total }
//       const full = await getRun(activeRun.id);
//       const run  = full.run ?? full.data ?? full;
//       const recs = full.records ?? [];

//       setActiveRun(run);
//       setRunItems(recs);
//       setCurrentStep(2);
//     } catch (e) {
//       setError(e?.response?.data?.message ?? "Processing failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── STEP 2 → approve ──────────────────────────────────────
//   const handleApprove = async () => {
//     if (!activeRun?.id) return;
//     setLoading(true);
//     setError(null);
//     try {
//       await runApprove(activeRun.id);
//       setCurrentStep(3);
//     } catch (e) {
//       setError(e?.response?.data?.message ?? "Approval failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── STEP 3 → mark paid ────────────────────────────────────
//   const handleMarkPaid = async () => {
//     if (!activeRun?.id) return;
//     setLoading(true);
//     setError(null);
//     try {
//       await runMarkPaid(activeRun.id);
//       setShowSuccess(true);
//     } catch (e) {
//       setError(e?.response?.data?.message ?? "Mark paid failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Export download (CSV or PDF) ───────────────────────────
//   const handleDownload = async () => {
//     if (!activeRun?.id) {
//       setError("No active run to export.");
//       return;
//     }
//     setDownloadingCSV(true);
//     setError(null);
//     try {
//       const blob = await getPaymentFile(activeRun.id, exportFormat);
//       const url  = URL.createObjectURL(blob);
//       const a    = document.createElement("a");
//       a.href     = url;
//       // CSV → .csv | PDF/HTML report → .html (backend sends HTML for print)
//       const ext  = exportFormat === "pdf" ? "html" : "csv";
//       a.download = `payroll-${period.year}-${String(period.month).padStart(2, "0")}.${ext}`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url);
//     } catch (e) {
//       setError("Download failed. Make sure the run has been processed first.");
//     } finally {
//       setDownloadingCSV(false);
//     }
//   };

//   // ── Success screen ────────────────────────────────────────
//   if (showSuccess) {
//     return (
//       <motion.div
//         initial={{ scale: 0.9, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         className="py-12 text-center space-y-5"
//       >
//         <div
//           className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
//           style={{ background: C.successLight }}
//         >
//           <CheckCircle2 size={44} color={C.success} />
//         </div>

//         <div>
//           <h2
//             className="text-2xl font-bold mb-1"
//             style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
//           >
//             Payroll Finalised!
//           </h2>
//           <p className="text-sm" style={{ color: C.textSecondary }}>
//             {MONTHS[period.month - 1]} {period.year} payroll —{" "}
//             {selectedMode === "assisted"
//               ? "payment file ready for bank upload"
//               : "marked as paid"}
//             .
//           </p>
//           <p className="text-xs mt-1" style={{ color: C.textMuted }}>
//             {runItems.length} payslips generated · Net pay: {fmtM(totalNet)}
//           </p>
//         </div>

//         {/* Export section — assisted mode only */}
//         {selectedMode === "assisted" && (
//           <div
//             className="mx-auto max-w-sm space-y-3 p-5 rounded-2xl border"
//             style={{ background: C.surface, borderColor: C.border }}
//           >
//             <FormatPicker value={exportFormat} onChange={setExportFormat} />
//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               onClick={handleDownload}
//               disabled={downloadingCSV}
//               className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold"
//               style={{
//                 background: C.primary,
//                 color:      "#fff",
//                 border:     "none",
//                 cursor:     downloadingCSV ? "not-allowed" : "pointer",
//                 opacity:    downloadingCSV ? 0.8 : 1,
//               }}
//             >
//               {downloadingCSV
//                 ? <Loader2 size={14} className="animate-spin" />
//                 : <Download size={14} />
//               }
//               Download {exportFormat === "pdf" ? "PDF Report" : "Bank Transfer CSV"}
//             </motion.button>
//           </div>
//         )}

//         <motion.button
//           whileHover={{ scale: 1.02 }}
//           onClick={() => {
//             setCurrentStep(0);
//             setActiveRun(null);
//             setRunItems([]);
//             setShowSuccess(false);
//             if (onComplete) onComplete();
//           }}
//           className="mx-auto flex px-6 py-2.5 rounded-xl text-sm font-semibold"
//           style={{
//             background: C.surfaceAlt,
//             color:      C.textSecondary,
//             border:     `1px solid ${C.border}`,
//             cursor:     "pointer",
//           }}
//         >
//           Done
//         </motion.button>
//       </motion.div>
//     );
//   }

//   // ── Wizard ────────────────────────────────────────────────
//   return (
//     <div className="space-y-6">
//       {/* Step progress bar */}
//       <div className="flex items-center gap-2">
//         {STEPS.map((step, i) => (
//           <div key={i} className="flex items-center flex-1 gap-2">
//             <div className="flex flex-col items-center flex-1">
//               <div
//                 className="w-full h-1.5 rounded-full"
//                 style={{ background: i <= currentStep ? C.primary : "#E2E8F0" }}
//               />
//               <span
//                 className="text-[10px] mt-1 font-semibold hidden sm:block"
//                 style={{ color: i <= currentStep ? C.primary : C.textMuted }}
//               >
//                 {step}
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Error banner */}
//       <AnimatePresence>
//         {error && (
//           <motion.div
//             initial={{ opacity: 0, y: -8 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0 }}
//             className="flex items-center gap-3 p-3 rounded-xl"
//             style={{ background: C.dangerLight, border: `1px solid ${C.danger}33` }}
//           >
//             <AlertCircle size={14} color={C.danger} />
//             <p className="text-sm flex-1" style={{ color: C.danger }}>{error}</p>
//             <button
//               onClick={() => setError(null)}
//               style={{ background: "none", border: "none", cursor: "pointer", color: C.danger }}
//             >
//               ✕
//             </button>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <AnimatePresence mode="wait">

//         {/* ══ STEP 0: Mode & Period ══════════════════════════════ */}
//         {currentStep === 0 && (
//           <motion.div
//             key="s0"
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -20 }}
//             className="space-y-6"
//           >
//             <div>
//               <h2
//                 className="font-bold text-xl mb-1"
//                 style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
//               >
//                 Select Payroll Mode
//               </h2>
//               <p className="text-sm" style={{ color: C.textMuted }}>
//                 Choose how you'd like to process this payroll run.
//               </p>
//             </div>

//             <div className="space-y-3">
//               <ModeCard
//                 icon={ClipboardList}
//                 title="Manual Payroll"
//                 description="System calculates salaries. You pay staff directly via your bank. No file export needed."
//                 selected={selectedMode === "manual"}
//                 onClick={() => setSelectedMode("manual")}
//               />
//               <ModeCard
//                 icon={Zap}
//                 title="Assisted Payroll"
//                 badge="Recommended"
//                 description="System calculates payroll and generates a CSV bank transfer list or full PDF report."
//                 selected={selectedMode === "assisted"}
//                 onClick={() => setSelectedMode("assisted")}
//               />
//             </div>

//             <div
//               className="rounded-2xl p-5 border"
//               style={{ background: C.surface, borderColor: C.border }}
//             >
//               <p className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>
//                 Pay Period
//               </p>
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label
//                     className="block text-xs font-semibold mb-1.5"
//                     style={{ color: C.textMuted }}
//                   >
//                     Month
//                   </label>
//                   <select
//                     value={period.month}
//                     onChange={(e) => setPeriod((p) => ({ ...p, month: Number(e.target.value) }))}
//                     className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none appearance-none"
//                     style={{
//                       background: C.surfaceAlt,
//                       border:     `1.5px solid ${C.border}`,
//                       color:      C.textPrimary,
//                     }}
//                   >
//                     {MONTHS.map((m, i) => (
//                       <option key={m} value={i + 1}>{m}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label
//                     className="block text-xs font-semibold mb-1.5"
//                     style={{ color: C.textMuted }}
//                   >
//                     Year
//                   </label>
//                   <select
//                     value={period.year}
//                     onChange={(e) => setPeriod((p) => ({ ...p, year: Number(e.target.value) }))}
//                     className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none appearance-none"
//                     style={{
//                       background: C.surfaceAlt,
//                       border:     `1.5px solid ${C.border}`,
//                       color:      C.textPrimary,
//                     }}
//                   >
//                     {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
//                       <option key={y}>{y}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//               <div className="mt-3">
//                 <label
//                   className="block text-xs font-semibold mb-1.5"
//                   style={{ color: C.textMuted }}
//                 >
//                   Notes (optional)
//                 </label>
//                 <input
//                   value={notes}
//                   onChange={(e) => setNotes(e.target.value)}
//                   placeholder="e.g. Includes Q1 bonus"
//                   className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
//                   style={{
//                     background: C.surfaceAlt,
//                     border:     `1.5px solid ${C.border}`,
//                     color:      C.textPrimary,
//                   }}
//                 />
//               </div>
//             </div>

//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               onClick={handleInit}
//               disabled={loading}
//               className="w-full py-4 rounded-xl text-base font-bold text-white flex items-center justify-center gap-2"
//               style={{
//                 background: C.primary,
//                 border:     "none",
//                 cursor:     loading ? "not-allowed" : "pointer",
//               }}
//             >
//               {loading ? (
//                 <><Loader2 size={18} className="animate-spin" /> Initialising…</>
//               ) : (
//                 <>Start {selectedMode === "assisted" ? "Assisted" : "Manual"} Payroll Run <ArrowRight size={18} /></>
//               )}
//             </motion.button>
//           </motion.div>
//         )}

//         {/* ══ STEP 1: Earnings Review ════════════════════════════ */}
//         {currentStep === 1 && (
//           <motion.div
//             key="s1"
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -20 }}
//             className="space-y-5"
//           >
//             <div>
//               <h2
//                 className="font-bold text-xl mb-1"
//                 style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
//               >
//                 Earnings Review
//               </h2>
//               <p className="text-sm" style={{ color: C.textMuted }}>
//                 Click "Process Payroll" to calculate all active employees.
//               </p>
//             </div>

//             {/* Run banner */}
//             <div
//               className="p-5 rounded-2xl"
//               style={{ background: C.primaryLight, border: `1px solid ${C.primary}22` }}
//             >
//               <div className="flex items-center gap-3">
//                 <div
//                   className="w-10 h-10 rounded-xl flex items-center justify-center"
//                   style={{ background: C.primary }}
//                 >
//                   <Users size={18} color="#fff" />
//                 </div>
//                 <div>
//                   <p className="font-semibold text-sm" style={{ color: C.primary }}>
//                     Run {activeRun?.status === "draft" ? "Ready" : activeRun?.status ?? "Initiated"}{" "}
//                     — {MONTHS[period.month - 1]} {period.year}
//                   </p>
//                   <p className="text-xs" style={{ color: C.textMuted }}>
//                     Mode: {selectedMode} · Run ID: {activeRun?.id?.slice(0, 8)}…
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Earnings table — populated after processing */}
//             {runItems.length > 0 ? (
//               <div
//                 className="rounded-2xl border overflow-hidden"
//                 style={{ background: C.surface, borderColor: C.border }}
//               >
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead>
//                       <tr style={{ background: C.surfaceAlt }}>
//                         {["Employee", "Basic", "Housing", "Transport", "Gross"].map((h) => (
//                           <th
//                             key={h}
//                             className="px-5 py-4 text-left text-xs font-bold uppercase"
//                             style={{ color: C.textMuted }}
//                           >
//                             {h}
//                           </th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {runItems.slice(0, 10).map((emp, i) => (
//                         <tr key={i} className="border-b" style={{ borderColor: C.border }}>
//                           <td
//                             className="px-5 py-3.5 font-medium text-sm"
//                             style={{ color: C.textPrimary }}
//                           >
//                             {emp.employeeName ?? emp.employee_name ?? emp.employeeId ?? "—"}
//                           </td>
//                           <td className="px-5 py-3.5 text-sm">
//                             {fmt(emp.basicSalary ?? emp.basic_salary)}
//                           </td>
//                           <td className="px-5 py-3.5 text-sm">
//                             {fmt(emp.housingAllowance ?? emp.housing_allowance)}
//                           </td>
//                           <td className="px-5 py-3.5 text-sm">
//                             {fmt(emp.transportAllowance ?? emp.transport_allowance)}
//                           </td>
//                           <td
//                             className="px-5 py-3.5 font-semibold text-sm"
//                             style={{ color: C.primary }}
//                           >
//                             {fmt(emp.grossSalary ?? emp.gross_salary)}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//                 {runItems.length > 10 && (
//                   <p className="px-5 py-3 text-xs" style={{ color: C.textMuted }}>
//                     …and {runItems.length - 10} more employees
//                   </p>
//                 )}
//               </div>
//             ) : (
//               <div
//                 className="p-8 text-center rounded-2xl"
//                 style={{ background: C.surface, border: `1px solid ${C.border}` }}
//               >
//                 <p className="text-sm" style={{ color: C.textMuted }}>
//                   Click "Process Payroll" to calculate all employee earnings.
//                 </p>
//               </div>
//             )}

//             <div className="flex gap-3">
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 onClick={() => setCurrentStep(0)}
//                 className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
//                 style={{
//                   background: C.surfaceAlt,
//                   color:      C.textSecondary,
//                   border:     `1px solid ${C.border}`,
//                   cursor:     "pointer",
//                 }}
//               >
//                 <ArrowLeft size={14} /> Back
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={handleProcess}
//                 disabled={loading}
//                 className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
//                 style={{
//                   background: C.primary,
//                   border:     "none",
//                   cursor:     loading ? "not-allowed" : "pointer",
//                 }}
//               >
//                 {loading ? (
//                   <><Loader2 size={14} className="animate-spin" /> Processing…</>
//                 ) : (
//                   <>Process Payroll <ArrowRight size={14} /></>
//                 )}
//               </motion.button>
//             </div>
//           </motion.div>
//         )}

//         {/* ══ STEP 2: Deductions Review ══════════════════════════ */}
//         {currentStep === 2 && (
//           <motion.div
//             key="s2"
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -20 }}
//             className="space-y-5"
//           >
//             <div>
//               <h2
//                 className="font-bold text-xl mb-1"
//                 style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
//               >
//                 Deductions Review
//               </h2>
//               <p className="text-sm" style={{ color: C.textMuted }}>
//                 Active deductions applied to this run. Manage in the Deductions tab.
//               </p>
//             </div>

//             {/* Active deductions list */}
//             <div
//               className="rounded-2xl border"
//               style={{ background: C.surface, borderColor: C.border }}
//             >
//               <div className="px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
//                 <p className="font-semibold text-sm" style={{ color: C.textPrimary }}>
//                   Deductions Applied
//                 </p>
//               </div>
//               {deductions.filter((d) => d.isActive ?? d.is_active).length === 0 ? (
//                 <p
//                   className="px-6 py-8 text-sm text-center"
//                   style={{ color: C.textMuted }}
//                 >
//                   No active deductions configured.
//                 </p>
//               ) : (
//                 <div className="divide-y" style={{ borderColor: C.border }}>
//                   {deductions
//                     .filter((d) => d.isActive ?? d.is_active)
//                     .map((ded, i) => (
//                       <div key={i} className="flex justify-between items-center px-6 py-4">
//                         <div>
//                           <p className="font-medium text-sm" style={{ color: C.textPrimary }}>
//                             {ded.name}
//                           </p>
//                           <p className="text-xs" style={{ color: C.textMuted }}>
//                             {ded.category ?? "Custom"}
//                           </p>
//                         </div>
//                         <div className="flex items-center gap-3">
//                           <span
//                             className="text-sm font-semibold"
//                             style={{ color: C.textPrimary }}
//                           >
//                             {ded.type === "percent"
//                               ? `${ded.value}%`
//                               : ded.type === "formula"
//                               ? "Auto"
//                               : fmt(ded.value)}
//                           </span>
//                           <span
//                             className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
//                             style={{
//                               background: (ded.isStatutory ?? ded.is_statutory)
//                                 ? C.primaryLight
//                                 : C.successLight,
//                               color: (ded.isStatutory ?? ded.is_statutory)
//                                 ? C.primary
//                                 : C.success,
//                             }}
//                           >
//                             {(ded.isStatutory ?? ded.is_statutory) ? "Statutory" : "Custom"}
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                 </div>
//               )}
//             </div>

//             {/* Per-employee breakdown table */}
//             {runItems.length > 0 && (
//               <div
//                 className="rounded-2xl border overflow-hidden"
//                 style={{ background: C.surface, borderColor: C.border }}
//               >
//                 <div className="px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
//                   <p className="font-semibold text-sm" style={{ color: C.textPrimary }}>
//                     Employee Deduction Summary
//                   </p>
//                 </div>
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead>
//                       <tr style={{ background: C.surfaceAlt }}>
//                         {["Employee", "Gross", "PAYE", "Pension", "NHF", "Other", "Net Pay"].map(
//                           (h) => (
//                             <th
//                               key={h}
//                               className="px-4 py-3 text-left text-xs font-bold uppercase"
//                               style={{ color: C.textMuted }}
//                             >
//                               {h}
//                             </th>
//                           ),
//                         )}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {runItems.slice(0, 8).map((emp, i) => (
//                         <tr key={i} className="border-b" style={{ borderColor: C.border }}>
//                           <td
//                             className="px-4 py-3 text-sm font-medium"
//                             style={{ color: C.textPrimary }}
//                           >
//                             {emp.employeeName ?? emp.employee_name ?? "—"}
//                           </td>
//                           <td className="px-4 py-3 text-sm">
//                             {fmt(emp.grossSalary ?? emp.gross_salary)}
//                           </td>
//                           <td className="px-4 py-3 text-sm">
//                             {fmt(emp.payeTax ?? emp.paye_tax)}
//                           </td>
//                           <td className="px-4 py-3 text-sm">
//                             {fmt(emp.pensionEmployee ?? emp.pension_employee)}
//                           </td>
//                           <td className="px-4 py-3 text-sm">
//                             {fmt(emp.nhfDeduction ?? emp.nhf_deduction)}
//                           </td>
//                           <td className="px-4 py-3 text-sm">
//                             {fmt(emp.otherDeductions ?? emp.other_deductions)}
//                           </td>
//                           <td
//                             className="px-4 py-3 text-sm font-bold"
//                             style={{ color: C.success }}
//                           >
//                             {fmt(emp.netSalary ?? emp.net_salary)}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             <div className="flex gap-3">
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 onClick={() => setCurrentStep(1)}
//                 className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
//                 style={{
//                   background: C.surfaceAlt,
//                   color:      C.textSecondary,
//                   border:     `1px solid ${C.border}`,
//                   cursor:     "pointer",
//                 }}
//               >
//                 <ArrowLeft size={14} /> Back
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={handleApprove}
//                 disabled={loading}
//                 className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
//                 style={{
//                   background: C.primary,
//                   border:     "none",
//                   cursor:     loading ? "not-allowed" : "pointer",
//                 }}
//               >
//                 {loading ? (
//                   <><Loader2 size={14} className="animate-spin" /> Approving…</>
//                 ) : (
//                   <>Approve & Continue <ArrowRight size={14} /></>
//                 )}
//               </motion.button>
//             </div>
//           </motion.div>
//         )}

//         {/* ══ STEP 3: Summary & Finalise ═════════════════════════ */}
//         {currentStep === 3 && (
//           <motion.div
//             key="s3"
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -20 }}
//             className="space-y-6"
//           >
//             <div>
//               <h2
//                 className="font-bold text-xl mb-1"
//                 style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
//               >
//                 Payroll Summary & Approval
//               </h2>
//               <p className="text-sm" style={{ color: C.textMuted }}>
//                 Review totals before finalising. This generates all payslips.
//               </p>
//             </div>

//             {/* KPI totals */}
//             <div className="grid grid-cols-3 gap-4">
//               {[
//                 {
//                   label: "Gross Payroll",
//                   value: fmtM(activeRun?.totalGross      ?? totalGross),
//                   color: C.primary,
//                   bg:    C.primaryLight,
//                 },
//                 {
//                   label: "Total Deductions",
//                   value: fmtM(activeRun?.totalDeductions ?? totalDeductions),
//                   color: C.danger,
//                   bg:    C.dangerLight,
//                 },
//                 {
//                   label: "Net Pay",
//                   value: fmtM(activeRun?.totalNet        ?? totalNet),
//                   color: C.success,
//                   bg:    C.successLight,
//                 },
//               ].map(({ label, value, color, bg }) => (
//                 <div
//                   key={label}
//                   className="rounded-2xl p-6 border text-center"
//                   style={{ background: bg, borderColor: `${color}33` }}
//                 >
//                   <p className="text-sm font-medium" style={{ color }}>{label}</p>
//                   <p
//                     className="text-3xl font-bold mt-2"
//                     style={{ color, fontFamily: "Sora,sans-serif" }}
//                   >
//                     {value}
//                   </p>
//                 </div>
//               ))}
//             </div>

//             <p className="text-xs text-center" style={{ color: C.textMuted }}>
//               {runItems.length} employees · {MONTHS[period.month - 1]} {period.year}
//             </p>

//             {/* Mode-specific instructions */}
//             {selectedMode === "assisted" ? (
//               <div
//                 className="p-5 rounded-2xl"
//                 style={{ background: C.primaryLight, border: `1px solid ${C.primary}22` }}
//               >
//                 <p className="font-semibold text-sm mb-2" style={{ color: C.primary }}>
//                   Assisted Mode: Next Steps
//                 </p>
//                 <ol className="text-xs space-y-1.5" style={{ color: C.textSecondary }}>
//                   <li>1. Choose your export format below (CSV for bank upload, PDF for records).</li>
//                   <li>2. Click "Download" to save the file.</li>
//                   <li>3. For CSV — log into your bank portal (Access, GTBank, UBA…) and upload.</li>
//                   <li>4. Click "Finalise & Generate Payslips" once ready.</li>
//                   <li>5. Return and click "Mark as Paid" after bank confirms.</li>
//                 </ol>
//               </div>
//             ) : (
//               <div
//                 className="p-5 rounded-2xl"
//                 style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}
//               >
//                 <p className="font-semibold text-sm mb-2" style={{ color: C.textPrimary }}>
//                   Manual Mode: Next Steps
//                 </p>
//                 <ol className="text-xs space-y-1.5" style={{ color: C.textSecondary }}>
//                   <li>1. Click "Finalise & Generate Payslips" below.</li>
//                   <li>2. Transfer salaries individually via your bank.</li>
//                   <li>3. Click "Mark as Paid" once all transfers are complete.</li>
//                 </ol>
//               </div>
//             )}

//             <div className="flex flex-col gap-3">
//               {/* Export section — assisted mode only */}
//               {selectedMode === "assisted" && (
//                 <div
//                   className="p-4 rounded-2xl border space-y-3"
//                   style={{ background: C.surface, borderColor: C.border }}
//                 >
//                   <FormatPicker value={exportFormat} onChange={setExportFormat} />
//                   <motion.button
//                     whileHover={{ scale: 1.02 }}
//                     onClick={handleDownload}
//                     disabled={downloadingCSV}
//                     className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
//                     style={{
//                       background: C.surface,
//                       color:      C.primary,
//                       border:     `2px solid ${C.primary}`,
//                       cursor:     downloadingCSV ? "not-allowed" : "pointer",
//                       opacity:    downloadingCSV ? 0.7 : 1,
//                     }}
//                   >
//                     {downloadingCSV
//                       ? <Loader2 size={14} className="animate-spin" />
//                       : <Download size={14} />
//                     }
//                     Download {exportFormat === "pdf" ? "PDF Report" : "Bank Transfer CSV"}
//                   </motion.button>
//                 </div>
//               )}

//               {/* Finalise button */}
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={handleMarkPaid}
//                 disabled={loading}
//                 className="w-full py-4 rounded-xl text-base font-bold text-white flex items-center justify-center gap-2"
//                 style={{
//                   background: C.success,
//                   border:     "none",
//                   cursor:     loading ? "not-allowed" : "pointer",
//                 }}
//               >
//                 {loading ? (
//                   <><Loader2 size={16} className="animate-spin" /> Processing…</>
//                 ) : (
//                   <><CheckCircle2 size={18} /> Finalise &amp; Generate Payslips</>
//                 )}
//               </motion.button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }


// src/admin/payroll/RunPayroll.jsx
// 4-step payroll wizard with Manual and Assisted modes.
// Manual  → HR calculates, pays manually via bank.
// Assisted → System generates a CSV or PDF export for HR.
//
// FIXES applied:
//  1. handleInit — recovers gracefully from 409 (existing run).
//  2. handleProcess — getRun returns { run, records } not { data.items }.
//  3. handleDownloadCSV — passes exportFormat ("csv" | "pdf") to getPaymentFile.
//  4. Summary totals — read from activeRun after process.
//  5. Format toggle — CSV (bank upload) or PDF (full report) picker added to
//     Step 3 and the success screen.
//  6. CSV section order — bank transfer rows come first in the downloaded file.
//  7. handleProcess — a client-side timeout on /process no longer reports
//     "Processing failed" outright. The backend may still complete the run
//     after the request times out, so on timeout we re-fetch the run and
//     proceed if it actually finished.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Download,
  Loader2,
  AlertCircle,
  Users,
  Zap,
  ClipboardList,
  FileText,
  Table2,
} from "lucide-react";
import { usePayroll } from "../../components/PayrollContext";
import { getRun, getPaymentFile, getDeductions } from "../../api/service/payrollApi";
import { C } from "../employeemanagement/sharedData";

const STEPS = ["Mode & Period", "Earnings Review", "Deductions", "Summary & Approve"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const fmt  = (n) => `₦${Number(n ?? 0).toLocaleString("en-NG")}`;
const fmtM = (n) => {
  const v = Number(n ?? 0);
  return v >= 1_000_000 ? `₦${(v / 1_000_000).toFixed(2)}M` : fmt(v);
};

// ─── Mode selector card ────────────────────────────────────────
function ModeCard({ icon: Icon, title, description, badge, selected, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      onClick={onClick}
      className="cursor-pointer rounded-2xl p-6 border-2 transition-all"
      style={{
        background:  selected ? C.primaryLight : C.surface,
        borderColor: selected ? C.primary : C.border,
        boxShadow:   selected ? `0 0 0 3px ${C.primaryLight}` : "none",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: selected ? C.primary : C.surfaceAlt }}
        >
          <Icon size={20} color={selected ? "#fff" : C.textMuted} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm" style={{ color: C.textPrimary }}>{title}</p>
            {badge && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: C.successLight, color: C.success }}
              >
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs mt-1" style={{ color: C.textSecondary }}>{description}</p>
        </div>
        <div
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
          style={{
            borderColor: selected ? C.primary : C.border,
            background:  selected ? C.primary : "transparent",
          }}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Format picker (CSV / PDF) ─────────────────────────────────
function FormatPicker({ value, onChange }) {
  const options = [
    {
      id:    "csv",
      icon:  Table2,
      label: "CSV",
      sub:   "Bank portal upload",
    },
    {
      id:    "pdf",
      icon:  FileText,
      label: "PDF / HTML",
      sub:   "Full payroll report",
    },
  ];

  return (
    <div>
      <p className="text-xs font-semibold mb-2" style={{ color: C.textMuted }}>
        Export Format
      </p>
      <div className="flex gap-2">
        {options.map((f) => {
          const active = value === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onChange(f.id)}
              className="flex-1 py-3 px-4 rounded-xl border-2 text-left transition-all flex items-center gap-3"
              style={{
                background:  active ? C.primaryLight : C.surface,
                borderColor: active ? C.primary      : C.border,
                cursor:      "pointer",
              }}
            >
              <f.icon size={16} color={active ? C.primary : C.textMuted} />
              <div>
                <p
                  className="text-sm font-bold leading-tight"
                  style={{ color: active ? C.primary : C.textPrimary }}
                >
                  {f.label}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>
                  {f.sub}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main wizard ───────────────────────────────────────────────
export default function RunPayroll({ onComplete }) {
  const { startRun, runProcess, runApprove, runMarkPaid, mode, setMode } = usePayroll();

  const [currentStep,    setCurrentStep]    = useState(0);
  const [selectedMode,   setSelectedMode]   = useState(mode ?? "manual");
  const [period,         setPeriod]         = useState(() => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  });
  const [notes,          setNotes]          = useState("");
  const [activeRun,      setActiveRun]      = useState(null);
  const [runItems,       setRunItems]       = useState([]);
  const [deductions,     setDeductions]     = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);
  const [showSuccess,    setShowSuccess]    = useState(false);
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  // "csv" → bank upload sheet | "pdf" → full HTML payroll report
  const [exportFormat,   setExportFormat]   = useState("csv");

  const currentYear = new Date().getFullYear();

  // Load deductions for step 2
  useEffect(() => {
    getDeductions()
      .then((r) => setDeductions(r.data ?? []))
      .catch(() => {});
  }, []);

  // Derive totals from runItems (supports both camelCase and snake_case keys)
  const totalGross      = runItems.reduce((s, e) => s + Number(e.grossSalary     ?? e.gross_salary      ?? 0), 0);
  const totalDeductions = runItems.reduce((s, e) => s + Number(e.totalDeductions ?? e.total_deductions  ?? 0), 0);
  const totalNet        = runItems.reduce((s, e) => s + Number(e.netSalary       ?? e.net_salary        ?? 0), 0);

  // ── STEP 0 → init run ──────────────────────────────────────
  const handleInit = async () => {
    setLoading(true);
    setError(null);
    try {
      setMode(selectedMode);
      const run = await startRun({
        month: period.month,
        year:  period.year,
        mode:  selectedMode,
        notes,
      });
      setActiveRun(run);
      setCurrentStep(1);
    } catch (e) {
      const status = e?.response?.status;
      const body   = e?.response?.data;
      // 409 = run for this month already exists — recover and continue
      if (status === 409 && body?.data?.id) {
        setActiveRun(body.data);
        setError(null);
        setCurrentStep(1);
      } else {
        setError(body?.message ?? "Failed to initialise run.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 1 → process ──────────────────────────────────────
  const handleProcess = async () => {
    if (!activeRun?.id) {
      setError("No active run — please go back to step 1.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await runProcess(activeRun.id);

      // getRun returns { run, records, total }
      const full = await getRun(activeRun.id);
      const run  = full.run ?? full.data ?? full;
      const recs = full.records ?? [];

      setActiveRun(run);
      setRunItems(recs);
      setCurrentStep(2);
    } catch (e) {
      // A client-side timeout doesn't necessarily mean the backend failed —
      // /process can legitimately take longer than our (generous) timeout
      // for large teams, and the server keeps working after we give up.
      // Check the run's real status before reporting failure.
      if (e?.isTimeout) {
        try {
          const full = await getRun(activeRun.id);
          const run  = full.run ?? full.data ?? full;
          const recs = full.records ?? [];

          if (run?.status && !["draft", "processing"].includes(run.status)) {
            // It actually finished — proceed as if the request had succeeded.
            setActiveRun(run);
            setRunItems(recs);
            setCurrentStep(2);
            return;
          }

          if (run?.status === "processing") {
            setError(
              "Still processing on the server — this can take a little longer for larger teams. " +
              "Please wait a moment, then click \"Process Payroll\" again to check progress.",
            );
          } else {
            setError(
              "The request timed out before the server finished. Please click \"Process Payroll\" again.",
            );
          }
        } catch {
          setError(e.message ?? "Processing failed.");
        }
      } else {
        setError(e?.response?.data?.message ?? "Processing failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2 → approve ──────────────────────────────────────
  const handleApprove = async () => {
    if (!activeRun?.id) return;
    setLoading(true);
    setError(null);
    try {
      await runApprove(activeRun.id);
      setCurrentStep(3);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Approval failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 3 → mark paid ────────────────────────────────────
  const handleMarkPaid = async () => {
    if (!activeRun?.id) return;
    setLoading(true);
    setError(null);
    try {
      await runMarkPaid(activeRun.id);
      setShowSuccess(true);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Mark paid failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── Export download (CSV or PDF) ───────────────────────────
  const handleDownload = async () => {
    if (!activeRun?.id) {
      setError("No active run to export.");
      return;
    }
    setDownloadingCSV(true);
    setError(null);
    try {
      const blob = await getPaymentFile(activeRun.id, exportFormat);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      // CSV → .csv | PDF/HTML report → .html (backend sends HTML for print)
      const ext  = exportFormat === "pdf" ? "html" : "csv";
      a.download = `payroll-${period.year}-${String(period.month).padStart(2, "0")}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError("Download failed. Make sure the run has been processed first.");
    } finally {
      setDownloadingCSV(false);
    }
  };

  // ── Success screen ────────────────────────────────────────
  if (showSuccess) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="py-12 text-center space-y-5"
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
          style={{ background: C.successLight }}
        >
          <CheckCircle2 size={44} color={C.success} />
        </div>

        <div>
          <h2
            className="text-2xl font-bold mb-1"
            style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
          >
            Payroll Finalised!
          </h2>
          <p className="text-sm" style={{ color: C.textSecondary }}>
            {MONTHS[period.month - 1]} {period.year} payroll —{" "}
            {selectedMode === "assisted"
              ? "payment file ready for bank upload"
              : "marked as paid"}
            .
          </p>
          <p className="text-xs mt-1" style={{ color: C.textMuted }}>
            {runItems.length} payslips generated · Net pay: {fmtM(totalNet)}
          </p>
        </div>

        {/* Export section — assisted mode only */}
        {selectedMode === "assisted" && (
          <div
            className="mx-auto max-w-sm space-y-3 p-5 rounded-2xl border"
            style={{ background: C.surface, borderColor: C.border }}
          >
            <FormatPicker value={exportFormat} onChange={setExportFormat} />
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={handleDownload}
              disabled={downloadingCSV}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold"
              style={{
                background: C.primary,
                color:      "#fff",
                border:     "none",
                cursor:     downloadingCSV ? "not-allowed" : "pointer",
                opacity:    downloadingCSV ? 0.8 : 1,
              }}
            >
              {downloadingCSV
                ? <Loader2 size={14} className="animate-spin" />
                : <Download size={14} />
              }
              Download {exportFormat === "pdf" ? "PDF Report" : "Bank Transfer CSV"}
            </motion.button>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => {
            setCurrentStep(0);
            setActiveRun(null);
            setRunItems([]);
            setShowSuccess(false);
            if (onComplete) onComplete();
          }}
          className="mx-auto flex px-6 py-2.5 rounded-xl text-sm font-semibold"
          style={{
            background: C.surfaceAlt,
            color:      C.textSecondary,
            border:     `1px solid ${C.border}`,
            cursor:     "pointer",
          }}
        >
          Done
        </motion.button>
      </motion.div>
    );
  }

  // ── Wizard ────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Step progress bar */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-center flex-1 gap-2">
            <div className="flex flex-col items-center flex-1">
              <div
                className="w-full h-1.5 rounded-full"
                style={{ background: i <= currentStep ? C.primary : "#E2E8F0" }}
              />
              <span
                className="text-[10px] mt-1 font-semibold hidden sm:block"
                style={{ color: i <= currentStep ? C.primary : C.textMuted }}
              >
                {step}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: C.dangerLight, border: `1px solid ${C.danger}33` }}
          >
            <AlertCircle size={14} color={C.danger} />
            <p className="text-sm flex-1" style={{ color: C.danger }}>{error}</p>
            <button
              onClick={() => setError(null)}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.danger }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">

        {/* ══ STEP 0: Mode & Period ══════════════════════════════ */}
        {currentStep === 0 && (
          <motion.div
            key="s0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2
                className="font-bold text-xl mb-1"
                style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
              >
                Select Payroll Mode
              </h2>
              <p className="text-sm" style={{ color: C.textMuted }}>
                Choose how you'd like to process this payroll run.
              </p>
            </div>

            <div className="space-y-3">
              <ModeCard
                icon={ClipboardList}
                title="Manual Payroll"
                description="System calculates salaries. You pay staff directly via your bank. No file export needed."
                selected={selectedMode === "manual"}
                onClick={() => setSelectedMode("manual")}
              />
              <ModeCard
                icon={Zap}
                title="Assisted Payroll"
                badge="Recommended"
                description="System calculates payroll and generates a CSV bank transfer list or full PDF report."
                selected={selectedMode === "assisted"}
                onClick={() => setSelectedMode("assisted")}
              />
            </div>

            <div
              className="rounded-2xl p-5 border"
              style={{ background: C.surface, borderColor: C.border }}
            >
              <p className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>
                Pay Period
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: C.textMuted }}
                  >
                    Month
                  </label>
                  <select
                    value={period.month}
                    onChange={(e) => setPeriod((p) => ({ ...p, month: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none appearance-none"
                    style={{
                      background: C.surfaceAlt,
                      border:     `1.5px solid ${C.border}`,
                      color:      C.textPrimary,
                    }}
                  >
                    {MONTHS.map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: C.textMuted }}
                  >
                    Year
                  </label>
                  <select
                    value={period.year}
                    onChange={(e) => setPeriod((p) => ({ ...p, year: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none appearance-none"
                    style={{
                      background: C.surfaceAlt,
                      border:     `1.5px solid ${C.border}`,
                      color:      C.textPrimary,
                    }}
                  >
                    {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: C.textMuted }}
                >
                  Notes (optional)
                </label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Includes Q1 bonus"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: C.surfaceAlt,
                    border:     `1.5px solid ${C.border}`,
                    color:      C.textPrimary,
                  }}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleInit}
              disabled={loading}
              className="w-full py-4 rounded-xl text-base font-bold text-white flex items-center justify-center gap-2"
              style={{
                background: C.primary,
                border:     "none",
                cursor:     loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Initialising…</>
              ) : (
                <>Start {selectedMode === "assisted" ? "Assisted" : "Manual"} Payroll Run <ArrowRight size={18} /></>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* ══ STEP 1: Earnings Review ════════════════════════════ */}
        {currentStep === 1 && (
          <motion.div
            key="s1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div>
              <h2
                className="font-bold text-xl mb-1"
                style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
              >
                Earnings Review
              </h2>
              <p className="text-sm" style={{ color: C.textMuted }}>
                Click "Process Payroll" to calculate all active employees.
              </p>
            </div>

            {/* Run banner */}
            <div
              className="p-5 rounded-2xl"
              style={{ background: C.primaryLight, border: `1px solid ${C.primary}22` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: C.primary }}
                >
                  <Users size={18} color="#fff" />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: C.primary }}>
                    Run {activeRun?.status === "draft" ? "Ready" : activeRun?.status ?? "Initiated"}{" "}
                    — {MONTHS[period.month - 1]} {period.year}
                  </p>
                  <p className="text-xs" style={{ color: C.textMuted }}>
                    Mode: {selectedMode} · Run ID: {activeRun?.id?.slice(0, 8)}…
                  </p>
                </div>
              </div>
            </div>

            {/* Earnings table — populated after processing */}
            {runItems.length > 0 ? (
              <div
                className="rounded-2xl border overflow-hidden"
                style={{ background: C.surface, borderColor: C.border }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: C.surfaceAlt }}>
                        {["Employee", "Basic", "Housing", "Transport", "Gross"].map((h) => (
                          <th
                            key={h}
                            className="px-5 py-4 text-left text-xs font-bold uppercase"
                            style={{ color: C.textMuted }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {runItems.slice(0, 10).map((emp, i) => (
                        <tr key={i} className="border-b" style={{ borderColor: C.border }}>
                          <td
                            className="px-5 py-3.5 font-medium text-sm"
                            style={{ color: C.textPrimary }}
                          >
                            {emp.employeeName ?? emp.employee_name ?? emp.employeeId ?? "—"}
                          </td>
                          <td className="px-5 py-3.5 text-sm">
                            {fmt(emp.basicSalary ?? emp.basic_salary)}
                          </td>
                          <td className="px-5 py-3.5 text-sm">
                            {fmt(emp.housingAllowance ?? emp.housing_allowance)}
                          </td>
                          <td className="px-5 py-3.5 text-sm">
                            {fmt(emp.transportAllowance ?? emp.transport_allowance)}
                          </td>
                          <td
                            className="px-5 py-3.5 font-semibold text-sm"
                            style={{ color: C.primary }}
                          >
                            {fmt(emp.grossSalary ?? emp.gross_salary)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {runItems.length > 10 && (
                  <p className="px-5 py-3 text-xs" style={{ color: C.textMuted }}>
                    …and {runItems.length - 10} more employees
                  </p>
                )}
              </div>
            ) : (
              <div
                className="p-8 text-center rounded-2xl"
                style={{ background: C.surface, border: `1px solid ${C.border}` }}
              >
                <p className="text-sm" style={{ color: C.textMuted }}>
                  Click "Process Payroll" to calculate all employee earnings.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setCurrentStep(0)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
                style={{
                  background: C.surfaceAlt,
                  color:      C.textSecondary,
                  border:     `1px solid ${C.border}`,
                  cursor:     "pointer",
                }}
              >
                <ArrowLeft size={14} /> Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleProcess}
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: C.primary,
                  border:     "none",
                  cursor:     loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <><Loader2 size={14} className="animate-spin" /> Processing…</>
                ) : (
                  <>Process Payroll <ArrowRight size={14} /></>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ══ STEP 2: Deductions Review ══════════════════════════ */}
        {currentStep === 2 && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div>
              <h2
                className="font-bold text-xl mb-1"
                style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
              >
                Deductions Review
              </h2>
              <p className="text-sm" style={{ color: C.textMuted }}>
                Active deductions applied to this run. Manage in the Deductions tab.
              </p>
            </div>

            {/* Active deductions list */}
            <div
              className="rounded-2xl border"
              style={{ background: C.surface, borderColor: C.border }}
            >
              <div className="px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                <p className="font-semibold text-sm" style={{ color: C.textPrimary }}>
                  Deductions Applied
                </p>
              </div>
              {deductions.filter((d) => d.isActive ?? d.is_active).length === 0 ? (
                <p
                  className="px-6 py-8 text-sm text-center"
                  style={{ color: C.textMuted }}
                >
                  No active deductions configured.
                </p>
              ) : (
                <div className="divide-y" style={{ borderColor: C.border }}>
                  {deductions
                    .filter((d) => d.isActive ?? d.is_active)
                    .map((ded, i) => (
                      <div key={i} className="flex justify-between items-center px-6 py-4">
                        <div>
                          <p className="font-medium text-sm" style={{ color: C.textPrimary }}>
                            {ded.name}
                          </p>
                          <p className="text-xs" style={{ color: C.textMuted }}>
                            {ded.category ?? "Custom"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: C.textPrimary }}
                          >
                            {ded.type === "percent"
                              ? `${ded.value}%`
                              : ded.type === "formula"
                              ? "Auto"
                              : fmt(ded.value)}
                          </span>
                          <span
                            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                            style={{
                              background: (ded.isStatutory ?? ded.is_statutory)
                                ? C.primaryLight
                                : C.successLight,
                              color: (ded.isStatutory ?? ded.is_statutory)
                                ? C.primary
                                : C.success,
                            }}
                          >
                            {(ded.isStatutory ?? ded.is_statutory) ? "Statutory" : "Custom"}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Per-employee breakdown table */}
            {runItems.length > 0 && (
              <div
                className="rounded-2xl border overflow-hidden"
                style={{ background: C.surface, borderColor: C.border }}
              >
                <div className="px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <p className="font-semibold text-sm" style={{ color: C.textPrimary }}>
                    Employee Deduction Summary
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: C.surfaceAlt }}>
                        {["Employee", "Gross", "PAYE", "Pension", "NHF", "Other", "Net Pay"].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left text-xs font-bold uppercase"
                              style={{ color: C.textMuted }}
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {runItems.slice(0, 8).map((emp, i) => (
                        <tr key={i} className="border-b" style={{ borderColor: C.border }}>
                          <td
                            className="px-4 py-3 text-sm font-medium"
                            style={{ color: C.textPrimary }}
                          >
                            {emp.employeeName ?? emp.employee_name ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {fmt(emp.grossSalary ?? emp.gross_salary)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {fmt(emp.payeTax ?? emp.paye_tax)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {fmt(emp.pensionEmployee ?? emp.pension_employee)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {fmt(emp.nhfDeduction ?? emp.nhf_deduction)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {fmt(emp.otherDeductions ?? emp.other_deductions)}
                          </td>
                          <td
                            className="px-4 py-3 text-sm font-bold"
                            style={{ color: C.success }}
                          >
                            {fmt(emp.netSalary ?? emp.net_salary)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
                style={{
                  background: C.surfaceAlt,
                  color:      C.textSecondary,
                  border:     `1px solid ${C.border}`,
                  cursor:     "pointer",
                }}
              >
                <ArrowLeft size={14} /> Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApprove}
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: C.primary,
                  border:     "none",
                  cursor:     loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <><Loader2 size={14} className="animate-spin" /> Approving…</>
                ) : (
                  <>Approve & Continue <ArrowRight size={14} /></>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ══ STEP 3: Summary & Finalise ═════════════════════════ */}
        {currentStep === 3 && (
          <motion.div
            key="s3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2
                className="font-bold text-xl mb-1"
                style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
              >
                Payroll Summary & Approval
              </h2>
              <p className="text-sm" style={{ color: C.textMuted }}>
                Review totals before finalising. This generates all payslips.
              </p>
            </div>

            {/* KPI totals */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Gross Payroll",
                  value: fmtM(activeRun?.totalGross      ?? totalGross),
                  color: C.primary,
                  bg:    C.primaryLight,
                },
                {
                  label: "Total Deductions",
                  value: fmtM(activeRun?.totalDeductions ?? totalDeductions),
                  color: C.danger,
                  bg:    C.dangerLight,
                },
                {
                  label: "Net Pay",
                  value: fmtM(activeRun?.totalNet        ?? totalNet),
                  color: C.success,
                  bg:    C.successLight,
                },
              ].map(({ label, value, color, bg }) => (
                <div
                  key={label}
                  className="rounded-2xl p-6 border text-center"
                  style={{ background: bg, borderColor: `${color}33` }}
                >
                  <p className="text-sm font-medium" style={{ color }}>{label}</p>
                  <p
                    className="text-3xl font-bold mt-2"
                    style={{ color, fontFamily: "Sora,sans-serif" }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-xs text-center" style={{ color: C.textMuted }}>
              {runItems.length} employees · {MONTHS[period.month - 1]} {period.year}
            </p>

            {/* Mode-specific instructions */}
            {selectedMode === "assisted" ? (
              <div
                className="p-5 rounded-2xl"
                style={{ background: C.primaryLight, border: `1px solid ${C.primary}22` }}
              >
                <p className="font-semibold text-sm mb-2" style={{ color: C.primary }}>
                  Assisted Mode: Next Steps
                </p>
                <ol className="text-xs space-y-1.5" style={{ color: C.textSecondary }}>
                  <li>1. Choose your export format below (CSV for bank upload, PDF for records).</li>
                  <li>2. Click "Download" to save the file.</li>
                  <li>3. For CSV — log into your bank portal (Access, GTBank, UBA…) and upload.</li>
                  <li>4. Click "Finalise & Generate Payslips" once ready.</li>
                  <li>5. Return and click "Mark as Paid" after bank confirms.</li>
                </ol>
              </div>
            ) : (
              <div
                className="p-5 rounded-2xl"
                style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}
              >
                <p className="font-semibold text-sm mb-2" style={{ color: C.textPrimary }}>
                  Manual Mode: Next Steps
                </p>
                <ol className="text-xs space-y-1.5" style={{ color: C.textSecondary }}>
                  <li>1. Click "Finalise & Generate Payslips" below.</li>
                  <li>2. Transfer salaries individually via your bank.</li>
                  <li>3. Click "Mark as Paid" once all transfers are complete.</li>
                </ol>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {/* Export section — assisted mode only */}
              {selectedMode === "assisted" && (
                <div
                  className="p-4 rounded-2xl border space-y-3"
                  style={{ background: C.surface, borderColor: C.border }}
                >
                  <FormatPicker value={exportFormat} onChange={setExportFormat} />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={handleDownload}
                    disabled={downloadingCSV}
                    className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                    style={{
                      background: C.surface,
                      color:      C.primary,
                      border:     `2px solid ${C.primary}`,
                      cursor:     downloadingCSV ? "not-allowed" : "pointer",
                      opacity:    downloadingCSV ? 0.7 : 1,
                    }}
                  >
                    {downloadingCSV
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Download size={14} />
                    }
                    Download {exportFormat === "pdf" ? "PDF Report" : "Bank Transfer CSV"}
                  </motion.button>
                </div>
              )}

              {/* Finalise button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMarkPaid}
                disabled={loading}
                className="w-full py-4 rounded-xl text-base font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: C.success,
                  border:     "none",
                  cursor:     loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Processing…</>
                ) : (
                  <><CheckCircle2 size={18} /> Finalise &amp; Generate Payslips</>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}