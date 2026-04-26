// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { ArrowRight, Save, CheckCircle2 } from "lucide-react";
// import { PAYROLL_MOCK } from "./PayrollMockData";

// const C = {
//   bg: "#F0F2F8",
//   surface: "#FFFFFF",
//   surfaceAlt: "#F7F8FC",
//   border: "#E4E7F0",
//   primary: "#4F46E5",
//   primaryLight: "#EEF2FF",
//   success: "#10B981",
//   successLight: "#D1FAE5",
//   warning: "#F59E0B",
//   warningLight: "#FEF3C7",
//   danger: "#EF4444",
//   dangerLight: "#FEE2E2",
//   textPrimary: "#0F172A",
//   textSecondary: "#64748B",
//   textMuted: "#94A3B8",
// };

// const steps = [
//   "Select Period",
//   "Earnings Review",
//   "Deductions",
//   "Summary & Approval",
// ];

// export default function RunPayroll() {
//   const [currentStep, setCurrentStep] = useState(0);
//   const [employees] = useState(PAYROLL_MOCK.employees);
//   const [customDeductions, setCustomDeductions] = useState(
//     PAYROLL_MOCK.customDeductions,
//   );
//   const [showSuccess, setShowSuccess] = useState(false);

//   const totalGross = employees.reduce((sum, emp) => sum + emp.gross, 0);
//   const totalDeductions = employees.reduce(
//     (sum, emp) => sum + emp.deductions,
//     0,
//   );
//   const totalNet = totalGross - totalDeductions;

//   const nextStep = () =>
//     setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
//   const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

//   const handleFinalize = () => {
//     setShowSuccess(true);
//     setTimeout(() => {
//       setShowSuccess(false);
//       setCurrentStep(0);
//     }, 2000);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Step Progress */}
//       <div className="flex gap-2">
//         {steps.map((step, i) => (
//           <div
//             key={i}
//             className={`flex-1 h-2 rounded-full ${i <= currentStep ? "bg-primary" : "bg-slate-200"}`}
//           />
//         ))}
//       </div>

//       <AnimatePresence mode="wait">
//         {currentStep === 0 && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <h2 className="font-semibold text-xl mb-6">Select Pay Period</h2>
//             <div
//               className="bg-white rounded-2xl p-8 border"
//               style={{ borderColor: C.border }}
//             >
//               <p className="text-lg">March 2026</p>
//               <p className="text-sm text-slate-500 mt-1">
//                 21 working days • 224 employees
//               </p>
//             </div>
//             <motion.button
//               onClick={nextStep}
//               className="mt-8 w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
//               style={{ background: C.primary }}
//             >
//               Continue to Earnings Review <ArrowRight size={18} />
//             </motion.button>
//           </motion.div>
//         )}

//         {currentStep === 1 && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <h2 className="font-semibold text-xl mb-4">Earnings Review</h2>
//             <div
//               className="rounded-2xl border overflow-hidden"
//               style={{ background: C.surface, borderColor: C.border }}
//             >
//               <table className="w-full">
//                 <thead>
//                   <tr style={{ background: C.surfaceAlt }}>
//                     <th className="px-5 py-4 text-left">Employee</th>
//                     <th className="px-5 py-4 text-left">Basic</th>
//                     <th className="px-5 py-4 text-left">Allowances</th>
//                     <th className="px-5 py-4 text-left">Overtime</th>
//                     <th className="px-5 py-4 text-left">Gross</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {employees.map((emp, i) => (
//                     <tr
//                       key={i}
//                       className="border-b"
//                       style={{ borderColor: C.border }}
//                     >
//                       <td className="px-5 py-4 font-medium">{emp.name}</td>
//                       <td className="px-5 py-4">
//                         ₦{emp.basic.toLocaleString()}
//                       </td>
//                       <td className="px-5 py-4">
//                         ₦{emp.allowances.toLocaleString()}
//                       </td>
//                       <td className="px-5 py-4">
//                         ₦{emp.overtime.toLocaleString()}
//                       </td>
//                       <td className="px-5 py-4 font-semibold">
//                         ₦{emp.gross.toLocaleString()}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             <div className="flex gap-3 mt-6">
//               <motion.button
//                 onClick={prevStep}
//                 className="flex-1 py-3 rounded-xl font-semibold"
//                 style={{ background: C.surfaceAlt }}
//               >
//                 Back
//               </motion.button>
//               <motion.button
//                 onClick={nextStep}
//                 className="flex-1 py-3 rounded-xl font-semibold text-white"
//                 style={{ background: C.primary }}
//               >
//                 Continue to Deductions
//               </motion.button>
//             </div>
//           </motion.div>
//         )}

//         {currentStep === 2 && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <h2 className="font-semibold text-xl mb-4">Deductions Review</h2>
//             <div
//               className="rounded-2xl border p-6"
//               style={{ background: C.surface, borderColor: C.border }}
//             >
//               <p className="font-medium mb-4">Statutory Deductions (Nigeria)</p>
//               <div className="space-y-4">
//                 {PAYROLL_MOCK.deductionsConfig.map((ded, i) => (
//                   <div
//                     key={i}
//                     className="flex justify-between items-center p-4 rounded-xl"
//                     style={{ background: C.surfaceAlt }}
//                   >
//                     <div>
//                       <p className="font-medium">{ded.name}</p>
//                       <p className="text-xs text-slate-500">
//                         {ded.type === "percent" ? `${ded.value}%` : "Auto"}
//                       </p>
//                     </div>
//                     <input
//                       type="checkbox"
//                       defaultChecked={ded.active}
//                       className="w-5 h-5 accent-primary"
//                     />
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="flex gap-3 mt-8">
//               <motion.button
//                 onClick={prevStep}
//                 className="flex-1 py-3 rounded-xl font-semibold"
//                 style={{ background: C.surfaceAlt }}
//               >
//                 Back
//               </motion.button>
//               <motion.button
//                 onClick={nextStep}
//                 className="flex-1 py-3 rounded-xl font-semibold text-white"
//                 style={{ background: C.primary }}
//               >
//                 Review Summary
//               </motion.button>
//             </div>
//           </motion.div>
//         )}

//         {currentStep === 3 && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <h2 className="font-semibold text-xl mb-6">
//               Payroll Summary & Approval
//             </h2>
//             <div className="grid grid-cols-3 gap-4">
//               <div
//                 className="rounded-2xl p-6 border text-center"
//                 style={{ background: C.surface, borderColor: C.border }}
//               >
//                 <p className="text-sm text-slate-500">Gross Payroll</p>
//                 <p className="text-3xl font-bold mt-2">
//                   ₦{(totalGross / 1000000).toFixed(1)}M
//                 </p>
//               </div>
//               <div
//                 className="rounded-2xl p-6 border text-center"
//                 style={{ background: C.surface, borderColor: C.border }}
//               >
//                 <p className="text-sm text-slate-500">Total Deductions</p>
//                 <p className="text-3xl font-bold mt-2 text-red-600">
//                   ₦{(totalDeductions / 1000000).toFixed(1)}M
//                 </p>
//               </div>
//               <div
//                 className="rounded-2xl p-6 border text-center"
//                 style={{ background: C.surface, borderColor: C.border }}
//               >
//                 <p className="text-sm text-slate-500">Net Pay</p>
//                 <p className="text-3xl font-bold mt-2 text-emerald-600">
//                   ₦{(totalNet / 1000000).toFixed(1)}M
//                 </p>
//               </div>
//             </div>

//             <motion.button
//               onClick={handleFinalize}
//               className="mt-10 w-full py-5 rounded-2xl text-lg font-semibold text-white"
//               style={{ background: C.success }}
//             >
//               Finalize & Generate Payslips
//             </motion.button>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Success Modal */}
//       <AnimatePresence>
//         {showSuccess && (
//           <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
//             <motion.div
//               initial={{ scale: 0.8 }}
//               animate={{ scale: 1 }}
//               className="bg-white rounded-2xl p-10 text-center max-w-sm"
//             >
//               <CheckCircle2
//                 size={64}
//                 className="mx-auto mb-6"
//                 color={C.success}
//               />
//               <p className="text-2xl font-bold">Payroll Finalized!</p>
//               <p className="text-slate-500 mt-2">
//                 March 2026 payroll has been processed successfully.
//               </p>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }



// src/admin/payroll/RunPayroll.jsx
// 4-step payroll wizard with Manual and Assisted modes.
// Manual  → HR calculates, pays manually via bank.
// Assisted → System generates a CSV bank transfer list for HR to upload.
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowLeft, CheckCircle2, Download, Loader2,
  AlertCircle, Users, DollarSign, Zap, ClipboardList,
} from "lucide-react";
import { usePayroll } from "../../components/PayrollContext";
import { getRun, getPaymentFile } from "../../api/service/payrollApi";
import { getDeductions } from "../../api/service/payrollApi";
import { C } from "../employeemanagement/sharedData";

const STEPS = ["Mode & Period", "Earnings Review", "Deductions", "Summary & Approve"];

const fmt = (n) => `₦${Number(n ?? 0).toLocaleString("en-NG")}`;
const fmtM = (n) => `₦${((n ?? 0) / 1_000_000).toFixed(1)}M`;

/* ─── Mode selector ─── */
function ModeCard({ icon: Icon, title, description, badge, selected, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      onClick={onClick}
      className="cursor-pointer rounded-2xl p-6 border-2 transition-all"
      style={{
        background: selected ? C.primaryLight : C.surface,
        borderColor: selected ? C.primary : C.border,
        boxShadow: selected ? `0 0 0 3px ${C.primaryLight}` : "none",
      }}
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: selected ? C.primary : C.surfaceAlt }}>
          <Icon size={20} color={selected ? "#fff" : C.textMuted} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm" style={{ color: C.textPrimary }}>{title}</p>
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: C.successLight, color: C.success }}>{badge}</span>
            )}
          </div>
          <p className="text-xs mt-1" style={{ color: C.textSecondary }}>{description}</p>
        </div>
        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5" style={{ borderColor: selected ? C.primary : C.border, background: selected ? C.primary : "transparent" }}>
          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>
    </motion.div>
  );
}

export default function RunPayroll({ onComplete }) {
  const { startRun, runProcess, runApprove, runMarkPaid, mode, setMode } = usePayroll();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState(mode ?? "manual");
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  });
  const [notes, setNotes] = useState("");
  const [activeRun, setActiveRun] = useState(null);
  const [runItems, setRunItems] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [downloadingCSV, setDownloadingCSV] = useState(false);

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const currentYear = new Date().getFullYear();

  /* ── Load deductions for step 2 ── */
  useEffect(() => {
    getDeductions()
      .then((r) => setDeductions(r.data ?? []))
      .catch(() => {});
  }, []);

  const totalGross = runItems.reduce((s, e) => s + (e.gross_pay ?? 0), 0);
  const totalDeductions = runItems.reduce((s, e) => s + (e.total_deductions ?? 0), 0);
  const totalNet = runItems.reduce((s, e) => s + (e.net_pay ?? 0), 0);

  /* ─── Step handlers ─── */
  const handleInit = async () => {
    setLoading(true);
    setError(null);
    try {
      setMode(selectedMode);
      const run = await startRun({ month: period.month, year: period.year, mode: selectedMode, notes });
      setActiveRun(run);
      setCurrentStep(1);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to initialise run.");
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await runProcess(activeRun.id);
      // Reload full run with items
      const full = await getRun(res.id ?? activeRun.id);
      setActiveRun(full.data);
      setRunItems(full.data?.items ?? []);
      setCurrentStep(2);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Processing failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
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

  const handleMarkPaid = async () => {
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

  const handleDownloadCSV = async () => {
    setDownloadingCSV(true);
    try {
      const blob = await getPaymentFile(activeRun.id, "csv");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payroll-transfer-${period.year}-${String(period.month).padStart(2, "0")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError("Failed to download payment file.");
    } finally {
      setDownloadingCSV(false);
    }
  };

  if (showSuccess) {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-16 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: C.successLight }}>
          <CheckCircle2 size={44} color={C.success} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>Payroll Finalised!</h2>
        <p className="text-sm mb-1" style={{ color: C.textSecondary }}>
          {MONTHS[period.month - 1]} {period.year} payroll — {selectedMode === "assisted" ? "payment file ready for bank upload" : "marked as paid"}.
        </p>
        <p className="text-xs" style={{ color: C.textMuted }}>{runItems.length} payslips generated · Net pay: {fmtM(totalNet)}</p>

        {selectedMode === "assisted" && (
          <motion.button whileHover={{ scale: 1.02 }} onClick={handleDownloadCSV} disabled={downloadingCSV} className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold mx-auto" style={{ background: C.primary, color: "#fff", border: "none", cursor: "pointer" }}>
            {downloadingCSV ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Download Bank Transfer CSV
          </motion.button>
        )}

        <motion.button whileHover={{ scale: 1.02 }} onClick={() => { setCurrentStep(0); setActiveRun(null); setRunItems([]); setShowSuccess(false); if (onComplete) onComplete(); }} className="mt-3 px-6 py-2.5 rounded-xl text-sm font-semibold mx-auto flex" style={{ background: C.surfaceAlt, color: C.textSecondary, border: `1px solid ${C.border}`, cursor: "pointer" }}>
          Done
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-center flex-1 gap-2">
            <div className="flex flex-col items-center flex-1">
              <div className="w-full h-1.5 rounded-full" style={{ background: i <= currentStep ? C.primary : "#E2E8F0" }} />
              <span className="text-[10px] mt-1 font-semibold hidden sm:block" style={{ color: i <= currentStep ? C.primary : C.textMuted }}>{step}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: C.dangerLight, border: `1px solid ${C.danger}33` }}>
          <AlertCircle size={14} color={C.danger} />
          <p className="text-sm flex-1" style={{ color: C.danger }}>{error}</p>
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>✕</button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ── STEP 0: Mode & Period ── */}
        {currentStep === 0 && (
          <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div>
              <h2 className="font-bold text-xl mb-1" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>Select Payroll Mode</h2>
              <p className="text-sm" style={{ color: C.textMuted }}>Choose how you'd like to process this payroll run.</p>
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
                description="System calculates payroll and generates a CSV bank transfer list. You upload it to your bank portal (Access, GTBank, UBA, etc.)."
                selected={selectedMode === "assisted"}
                onClick={() => setSelectedMode("assisted")}
              />
            </div>

            <div className="rounded-2xl p-5 border" style={{ background: C.surface, borderColor: C.border }}>
              <p className="text-sm font-semibold mb-3" style={{ color: C.textPrimary }}>Pay Period</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textMuted }}>Month</label>
                  <select value={period.month} onChange={(e) => setPeriod((p) => ({ ...p, month: Number(e.target.value) }))} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none appearance-none" style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }}>
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textMuted }}>Year</label>
                  <select value={period.year} onChange={(e) => setPeriod((p) => ({ ...p, year: Number(e.target.value) }))} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none appearance-none" style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }}>
                    {[currentYear - 1, currentYear, currentYear + 1].map((y) => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textMuted }}>Notes (optional)</label>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Includes Q1 bonus" className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }} />
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleInit} disabled={loading} className="w-full py-4 rounded-xl text-base font-bold text-white flex items-center justify-center gap-2" style={{ background: C.primary, border: "none", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? <><Loader2 size={18} className="animate-spin" />Initialising…</> : <>Start {selectedMode === "assisted" ? "Assisted" : "Manual"} Payroll Run <ArrowRight size={18} /></>}
            </motion.button>
          </motion.div>
        )}

        {/* ── STEP 1: Earnings Review ── */}
        {currentStep === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div>
              <h2 className="font-bold text-xl mb-1" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>Earnings Review</h2>
              <p className="text-sm" style={{ color: C.textMuted }}>System will calculate all active employees. Click Process to compute.</p>
            </div>

            {/* Run summary */}
            <div className="p-5 rounded-2xl" style={{ background: C.primaryLight, border: `1px solid ${C.primary}22` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: C.primary }}>
                  <Users size={18} color="#fff" />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: C.primary }}>Run Initiated — {MONTHS[period.month - 1]} {period.year}</p>
                  <p className="text-xs" style={{ color: C.textMuted }}>Mode: {selectedMode} · Run ID: {activeRun?.id?.slice(0, 8)}…</p>
                </div>
              </div>
            </div>

            {runItems.length > 0 ? (
              <div className="rounded-2xl border overflow-hidden" style={{ background: C.surface, borderColor: C.border }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: C.surfaceAlt }}>
                        {["Employee", "Basic", "Allowances", "Gross"].map((h) => (
                          <th key={h} className="px-5 py-4 text-left text-xs font-bold uppercase" style={{ color: C.textMuted }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {runItems.slice(0, 10).map((emp, i) => (
                        <tr key={i} className="border-b" style={{ borderColor: C.border }}>
                          <td className="px-5 py-3.5 font-medium text-sm" style={{ color: C.textPrimary }}>{emp.employee_name ?? emp.employee_id}</td>
                          <td className="px-5 py-3.5 text-sm">{fmt(emp.basic_salary)}</td>
                          <td className="px-5 py-3.5 text-sm">{fmt(emp.total_allowances)}</td>
                          <td className="px-5 py-3.5 font-semibold text-sm">{fmt(emp.gross_pay)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {runItems.length > 10 && <p className="px-5 py-3 text-xs" style={{ color: C.textMuted }}>…and {runItems.length - 10} more employees</p>}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <p className="text-sm" style={{ color: C.textMuted }}>Click "Process Payroll" to calculate all employee earnings.</p>
              </div>
            )}

            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.02 }} onClick={() => setCurrentStep(0)} className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold" style={{ background: C.surfaceAlt, color: C.textSecondary, border: `1px solid ${C.border}`, cursor: "pointer" }}>
                <ArrowLeft size={14} /> Back
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleProcess} disabled={loading} className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2" style={{ background: C.primary, border: "none", cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? <><Loader2 size={14} className="animate-spin" />Processing…</> : <>Process Payroll <ArrowRight size={14} /></>}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Deductions ── */}
        {currentStep === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div>
              <h2 className="font-bold text-xl mb-1" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>Deductions Review</h2>
              <p className="text-sm" style={{ color: C.textMuted }}>Active deductions applied to this run. Manage in the Deductions tab.</p>
            </div>

            <div className="rounded-2xl border" style={{ background: C.surface, borderColor: C.border }}>
              <div className="px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                <p className="font-semibold text-sm" style={{ color: C.textPrimary }}>Deductions Applied</p>
              </div>
              {deductions.length === 0 ? (
                <p className="px-6 py-8 text-sm text-center" style={{ color: C.textMuted }}>No deductions configured.</p>
              ) : (
                <div className="divide-y" style={{ borderColor: C.border }}>
                  {deductions.filter((d) => d.is_active).map((ded, i) => (
                    <div key={i} className="flex justify-between items-center px-6 py-4">
                      <div>
                        <p className="font-medium text-sm" style={{ color: C.textPrimary }}>{ded.name}</p>
                        <p className="text-xs" style={{ color: C.textMuted }}>{ded.category ?? "Custom"}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                          {ded.type === "percent" ? `${ded.value}%` : fmt(ded.value)}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: C.successLight, color: C.success }}>Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Per-employee deduction totals */}
            {runItems.length > 0 && (
              <div className="rounded-2xl border overflow-hidden" style={{ background: C.surface, borderColor: C.border }}>
                <div className="px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <p className="font-semibold text-sm" style={{ color: C.textPrimary }}>Employee Deduction Summary</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: C.surfaceAlt }}>
                        {["Employee", "Gross", "PAYE", "Pension", "NHF", "Other", "Net Pay"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase" style={{ color: C.textMuted }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {runItems.slice(0, 8).map((emp, i) => (
                        <tr key={i} className="border-b" style={{ borderColor: C.border }}>
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: C.textPrimary }}>{emp.employee_name ?? "—"}</td>
                          <td className="px-4 py-3 text-sm">{fmt(emp.gross_pay)}</td>
                          <td className="px-4 py-3 text-sm">{fmt(emp.paye_tax)}</td>
                          <td className="px-4 py-3 text-sm">{fmt(emp.pension)}</td>
                          <td className="px-4 py-3 text-sm">{fmt(emp.nhf)}</td>
                          <td className="px-4 py-3 text-sm">{fmt(emp.other_deductions)}</td>
                          <td className="px-4 py-3 text-sm font-bold" style={{ color: C.success }}>{fmt(emp.net_pay)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.02 }} onClick={() => setCurrentStep(1)} className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold" style={{ background: C.surfaceAlt, color: C.textSecondary, border: `1px solid ${C.border}`, cursor: "pointer" }}>
                <ArrowLeft size={14} /> Back
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleApprove} disabled={loading} className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2" style={{ background: C.primary, border: "none", cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? <><Loader2 size={14} className="animate-spin" />Approving…</> : <>Approve & Continue <ArrowRight size={14} /></>}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Summary & Finalise ── */}
        {currentStep === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div>
              <h2 className="font-bold text-xl mb-1" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>Payroll Summary & Approval</h2>
              <p className="text-sm" style={{ color: C.textMuted }}>Review totals before finalising. This action generates all payslips.</p>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Gross Payroll", value: fmtM(totalGross), color: C.primary, bg: C.primaryLight },
                { label: "Total Deductions", value: fmtM(totalDeductions), color: C.danger, bg: C.dangerLight },
                { label: "Net Pay", value: fmtM(totalNet), color: C.success, bg: C.successLight },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className="rounded-2xl p-6 border text-center" style={{ background: bg, borderColor: `${color}33` }}>
                  <p className="text-sm font-medium" style={{ color }}>{label}</p>
                  <p className="text-3xl font-bold mt-2" style={{ color, fontFamily: "Sora,sans-serif" }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Mode-specific info */}
            {selectedMode === "assisted" ? (
              <div className="p-5 rounded-2xl" style={{ background: C.primaryLight, border: `1px solid ${C.primary}22` }}>
                <p className="font-semibold text-sm mb-1" style={{ color: C.primary }}>Assisted Mode: Next Steps</p>
                <ol className="text-xs space-y-1.5 mt-2" style={{ color: C.textSecondary }}>
                  <li>1. Click "Finalise & Generate Payslips" below.</li>
                  <li>2. Download the bank transfer CSV file.</li>
                  <li>3. Log into your bank portal (Access, GTBank, UBA…).</li>
                  <li>4. Upload the CSV for bulk payment.</li>
                  <li>5. Return here and click "Mark as Paid" once bank confirms.</li>
                </ol>
              </div>
            ) : (
              <div className="p-5 rounded-2xl" style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
                <p className="font-semibold text-sm mb-1" style={{ color: C.textPrimary }}>Manual Mode: Next Steps</p>
                <ol className="text-xs space-y-1.5 mt-2" style={{ color: C.textSecondary }}>
                  <li>1. Click "Finalise & Generate Payslips" below.</li>
                  <li>2. Transfer salaries individually via your bank.</li>
                  <li>3. Click "Mark as Paid" once all transfers are complete.</li>
                </ol>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {selectedMode === "assisted" && (
                <motion.button whileHover={{ scale: 1.02 }} onClick={handleDownloadCSV} disabled={downloadingCSV} className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2" style={{ background: C.surface, color: C.primary, border: `2px solid ${C.primary}`, cursor: "pointer" }}>
                  {downloadingCSV ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  Download Bank Transfer CSV
                </motion.button>
              )}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleMarkPaid} disabled={loading} className="w-full py-4 rounded-xl text-base font-bold text-white flex items-center justify-center gap-2" style={{ background: C.success, border: "none", cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? <><Loader2 size={16} className="animate-spin" />Processing…</> : <><CheckCircle2 size={18} />Finalise & Generate Payslips</>}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}