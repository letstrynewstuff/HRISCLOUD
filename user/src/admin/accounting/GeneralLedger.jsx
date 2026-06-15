

// // src/admin/accounting/GeneralLedger.jsx

// import { useState, useEffect, useMemo, useCallback } from "react";
// import { motion as Motion, AnimatePresence } from "framer-motion";
// import {
//   Plus, X, RefreshCw, Download, CheckCircle2, AlertCircle,
//   ChevronRight, Search, Send, Save, Shield, ShieldOff, FileDown,
// } from "lucide-react";
// import { C } from "../employeemanagement/sharedData";
// import API from "../../api/axios";
// import Loader from "../../components/Loader";

// const VAT_RATE        = 0.075; // Nigeria VAT 7.5%
// const TAX_EXEMPT_CODE = "127669ED";

// const accountingApi = {
//   listAccounts: ()            => API.get("/accounting/accounts").then((r) => r.data),
//   createJournal: (payload)    => API.post("/accounting/journal-entries", payload).then((r) => r.data),
//   postJournal: (id)           => API.post(`/accounting/journal-entries/${id}/post`).then((r) => r.data),
//   getLedger: (id, params)     => API.get(`/accounting/general-ledger/${id}`, { params }).then((r) => r.data),
//   getVatAccount: (companyId)  => API.get("/accounting/accounts", { params: { search: "VAT" } }).then((r) => r.data),
// };

// const fmt = (kobo) =>
//   kobo != null && kobo !== 0
//     ? `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
//     : "—";

// const today      = () => new Date().toISOString().split("T")[0];
// const monthStart = () => {
//   const d = new Date();
//   return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
// };

// // ── Toast ─────────────────────────────────────────────────────
// function Toast({ msg, type, onDismiss }) {
//   useEffect(() => { const t = setTimeout(onDismiss, 3500); return () => clearTimeout(t); }, [onDismiss]);
//   return (
//     <Motion.div
//       initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
//       className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl"
//       style={{ background: C.navy ?? "#1E1B4B", color: "#fff", minWidth: 300 }}
//     >
//       {type === "error" ? <AlertCircle size={15} color="#EF4444" /> : <CheckCircle2 size={15} color="#10B981" />}
//       <span className="text-sm font-medium">{msg}</span>
//       <button onClick={onDismiss} className="ml-auto"><X size={13} color="rgba(255,255,255,0.5)" /></button>
//     </Motion.div>
//   );
// }

// const emptyLine = () => ({ id: crypto.randomUUID(), accountId: "", description: "", debit: "", credit: "" });

// // ── VAT Exempt Toggle ─────────────────────────────────────────
// function VatExemptToggle({ exempt, onToggle, exemptCode, onCodeChange, codeVerified, onVerify }) {
//   return (
//     <div
//       className="rounded-xl p-3 flex flex-wrap items-center gap-3"
//       style={{ background: exempt ? "#FEF3C7" : "#ECFDF5", border: `1px solid ${exempt ? "#FCD34D" : "#6EE7B7"}` }}
//     >
//       <div className="flex items-center gap-2 flex-1">
//         {exempt
//           ? <ShieldOff size={15} color="#D97706" />
//           : <Shield size={15} color="#059669" />
//         }
//         <div>
//           <p className="text-xs font-bold" style={{ color: exempt ? "#92400E" : "#065F46" }}>
//             {exempt ? "VAT Exempt" : "VAT Applicable (7.5%)"}
//           </p>
//           <p className="text-[10px]" style={{ color: exempt ? "#B45309" : "#047857" }}>
//             {exempt
//               ? "This transaction is exempt from VAT"
//               : "7.5% VAT will be auto-calculated and added as a separate line"}
//           </p>
//         </div>
//       </div>

//       <button
//         onClick={onToggle}
//         className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
//         style={{
//           background: exempt ? "#FDE68A" : C.primary,
//           color: exempt ? "#92400E" : "#fff",
//         }}
//       >
//         {exempt ? "Remove Exemption" : "Exempt from VAT"}
//       </button>

//       {/* Code input — shown when toggling to exempt */}
//       {exempt && !codeVerified && (
//         <div className="w-full flex items-center gap-2 mt-1">
//           <input
//             value={exemptCode}
//             onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
//             placeholder="Enter tax exempt code…"
//             maxLength={8}
//             className="flex-1 p-2 rounded-lg text-xs font-mono outline-none tracking-widest"
//             style={{ background: "#FEF3C7", border: "1.5px solid #FCD34D", color: "#92400E" }}
//           />
//           <button
//             onClick={onVerify}
//             className="px-3 py-2 rounded-lg text-xs font-bold text-white"
//             style={{ background: "#D97706" }}
//           >
//             Verify
//           </button>
//         </div>
//       )}
//       {exempt && codeVerified && (
//         <div className="w-full flex items-center gap-1.5 mt-1">
//           <CheckCircle2 size={13} color="#059669" />
//           <span className="text-xs font-semibold" style={{ color: "#065F46" }}>
//             Code verified — transaction exempt from VAT
//           </span>
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Journal Entry Drawer ──────────────────────────────────────
// function JournalEntryDrawer({ accounts, onClose, onSaved, showToast }) {
//   const [form, setForm]     = useState({ date: today(), description: "", reference: "" });
//   const [lines, setLines]   = useState([emptyLine(), emptyLine()]);
//   const [saving, setSaving] = useState(false);
//   const [posting, setPosting] = useState(false);
//   const [error, setError]   = useState("");

//   // VAT state
//   const [vatExempt, setVatExempt]         = useState(false);
//   const [exemptCode, setExemptCode]       = useState("");
//   const [codeVerified, setCodeVerified]   = useState(false);
//   const [showVatPreview, setShowVatPreview] = useState(false);

//   const totalDebit  = lines.reduce((s, l) => s + (parseFloat(l.debit)  || 0), 0);
//   const totalCredit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
//   const balanced    = totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.001;

//   // VAT amount on the credit side (taxable base)
//   const vatBase   = totalCredit; // VAT on the credit (revenue/liability) side
//   const vatAmount = vatExempt && codeVerified ? 0 : Math.round(vatBase * VAT_RATE * 100) / 100;

//   const setLine     = (id, field, val) => setLines((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: val } : l)));
//   const addLine     = () => setLines((p) => [...p, emptyLine()]);
//   const removeLine  = (id) => setLines((p) => p.filter((l) => l.id !== id));

//   const handleVatToggle = () => {
//     if (!vatExempt) {
//       // Turning ON exempt — show code input
//       setVatExempt(true);
//       setCodeVerified(false);
//       setExemptCode("");
//     } else {
//       // Turning OFF exempt
//       setVatExempt(false);
//       setCodeVerified(false);
//       setExemptCode("");
//     }
//   };

//   const handleVerifyCode = () => {
//     if (exemptCode === TAX_EXEMPT_CODE) {
//       setCodeVerified(true);
//       showToast("Tax exempt code verified. VAT will not be applied.");
//     } else {
//       showToast("Invalid tax exempt code. Please check and try again.", "error");
//       setCodeVerified(false);
//     }
//   };

//   // Find VAT Payable account (code 2200)
//   const vatAccount = accounts.find(
//     (a) => (a.account_code ?? a.accountCode) === "2200"
//   );

//   const buildPayload = () => {
//     const builtLines = lines
//       .filter((l) => l.accountId)
//       .map((l) => ({
//         accountId:    l.accountId,
//         description:  l.description,
//         debitAmount:  l.debit  ? Math.round(parseFloat(l.debit)  * 100) : 0,
//         creditAmount: l.credit ? Math.round(parseFloat(l.credit) * 100) : 0,
//       }));

//     // Auto-add VAT line if applicable
//     const applyVat = !vatExempt || !codeVerified;
//     if (applyVat && vatAmount > 0 && vatAccount) {
//       const vatKobo = Math.round(vatAmount * 100);
//       // VAT Payable: credit (liability increases)
//       builtLines.push({
//         accountId:    vatAccount.id,
//         description:  "VAT 7.5% (auto-calculated)",
//         debitAmount:  0,
//         creditAmount: vatKobo,
//       });
//       // Corresponding debit to balance — added to the first debit line's account
//       // The backend will validate balance; we add a VAT Input debit line
//       // Find VAT Input account (1005) or fall back to first debit line account
//       const vatInputAcct = accounts.find((a) => (a.account_code ?? a.accountCode) === "1005");
//       builtLines.push({
//         accountId:    vatInputAcct?.id ?? builtLines[0]?.accountId,
//         description:  "VAT Input (7.5%)",
//         debitAmount:  vatKobo,
//         creditAmount: 0,
//       });
//     }

//     return {
//       entryDate:   form.date,
//       description: form.description,
//       reference:   form.reference || undefined,
//       vatExempt:   vatExempt && codeVerified,
//       exemptCode:  vatExempt && codeVerified ? exemptCode : undefined,
//       lines:       builtLines,
//     };
//   };

//   const validate = () => {
//     if (!form.date || !form.description.trim()) { setError("Date and description are required."); return false; }
//     if (lines.filter((l) => l.accountId).length < 2) { setError("At least two lines required."); return false; }
//     if (!balanced) { setError("Debits must equal credits before posting."); return false; }
//     if (vatExempt && !codeVerified) { setError("Please verify your tax exempt code before posting."); return false; }
//     return true;
//   };

//   const handleSave = async () => {
//     if (!form.date || !form.description.trim()) { setError("Date and description are required."); return; }
//     setSaving(true); setError("");
//     try {
//       const res = await accountingApi.createJournal(buildPayload());
//       showToast("Draft saved.");
//       onSaved();
//     } catch (err) {
//       setError(err?.response?.data?.message ?? "Failed to save.");
//     } finally { setSaving(false); }
//   };

//   const handlePost = async () => {
//     if (!validate()) return;
//     setPosting(true); setError("");
//     try {
//       const res = await accountingApi.createJournal(buildPayload());
//       const journalId = res?.data?.id;
//       if (!journalId) throw new Error("Journal ID not returned from create endpoint");
//       await accountingApi.postJournal(journalId);
//       showToast("Journal entry posted.");
//       onSaved();
//     } catch (err) {
//       setError(err?.response?.data?.message ?? "Failed to post.");
//     } finally { setPosting(false); }
//   };

//   const applyVat   = (!vatExempt || !codeVerified) && vatAmount > 0;
//   const effectiveTotal = totalDebit + (applyVat ? vatAmount : 0);

//   return (
//     <Motion.div
//       className="fixed inset-0 z-50 flex items-center justify-end"
//       initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//     >
//       <div
//         className="absolute inset-0"
//         style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }}
//         onClick={onClose}
//       />
//       <Motion.div
//         initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
//         transition={{ type: "spring", stiffness: 300, damping: 30 }}
//         className="relative h-full w-full max-w-2xl flex flex-col"
//         style={{ background: C.bg, boxShadow: "-8px 0 40px rgba(0,0,0,0.15)" }}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
//           <h2 className="font-bold text-base" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>New Journal Entry</h2>
//           <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={15} color={C.textMuted} /></button>
//         </div>

//         <div className="flex-1 overflow-y-auto p-6 space-y-5">
//           {/* Meta fields */}
//           <div className="rounded-2xl p-5 space-y-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>
//                   Date <span style={{ color: C.danger }}>*</span>
//                 </label>
//                 <input
//                   type="date" value={form.date}
//                   onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
//                   className="w-full p-2.5 rounded-xl outline-none text-sm"
//                   style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }}
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>Reference</label>
//                 <input
//                   value={form.reference}
//                   onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
//                   placeholder="Auto-generated if blank"
//                   className="w-full p-2.5 rounded-xl outline-none text-sm"
//                   style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }}
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="block text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>
//                 Description <span style={{ color: C.danger }}>*</span>
//               </label>
//               <input
//                 value={form.description}
//                 onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
//                 placeholder="e.g. Salary payment for January 2025"
//                 className="w-full p-2.5 rounded-xl outline-none text-sm"
//                 style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }}
//               />
//             </div>
//           </div>

//           {/* VAT Exempt Toggle */}
//           <VatExemptToggle
//             exempt={vatExempt}
//             onToggle={handleVatToggle}
//             exemptCode={exemptCode}
//             onCodeChange={setExemptCode}
//             codeVerified={codeVerified}
//             onVerify={handleVerifyCode}
//           />

//           {/* Line items */}
//           <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
//             <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
//               <p className="text-xs font-bold uppercase tracking-wide" style={{ color: C.textMuted }}>Line Items</p>
//               <button
//                 onClick={addLine}
//                 className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
//                 style={{ background: C.primaryLight, color: C.primary }}
//               >
//                 <Plus size={12} /> Add Line
//               </button>
//             </div>

//             {/* Column headers */}
//             <div
//               className="grid grid-cols-12 px-4 py-2 text-xs font-bold uppercase tracking-wide"
//               style={{ background: C.surfaceAlt, borderBottom: `1px solid ${C.border}`, color: C.textMuted }}
//             >
//               <div className="col-span-4">Account</div>
//               <div className="col-span-3">Description</div>
//               <div className="col-span-2 text-right" style={{ color: "#1E1B4B" }}>Debit (₦)</div>
//               {/* ✅ Credit column more visible */}
//               <div className="col-span-2 text-right" style={{ color: "#0F766E", fontWeight: 800 }}>Credit (₦)</div>
//               <div className="col-span-1" />
//             </div>

//             {lines.map((line) => (
//               <div
//                 key={line.id}
//                 className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center"
//                 style={{ borderBottom: `1px solid ${C.border}` }}
//               >
//                 <div className="col-span-4">
//                   <select
//                     value={line.accountId}
//                     onChange={(e) => setLine(line.id, "accountId", e.target.value)}
//                     className="w-full p-2 rounded-xl text-xs outline-none appearance-none"
//                     style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, color: line.accountId ? C.textPrimary : C.textMuted }}
//                   >
//                     <option value="">Select account…</option>
//                     {accounts.map((a) => (
//                       <option key={a.id} value={a.id}>
//                         {a.accountCode ?? a.account_code} — {a.accountName ?? a.account_name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="col-span-3">
//                   <input
//                     value={line.description}
//                     onChange={(e) => setLine(line.id, "description", e.target.value)}
//                     placeholder="Note…"
//                     className="w-full p-2 rounded-xl text-xs outline-none"
//                     style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.textPrimary }}
//                   />
//                 </div>
//                 <div className="col-span-2">
//                   <input
//                     type="number" min="0" step="0.01" value={line.debit}
//                     onChange={(e) => setLine(line.id, "debit", e.target.value)}
//                     placeholder="0.00"
//                     className="w-full p-2 rounded-xl text-xs outline-none text-right font-mono"
//                     style={{ background: "#EEF2FF", border: `1px solid ${C.border}`, color: "#1E1B4B" }}
//                   />
//                 </div>
//                 {/* ✅ Credit input — more prominent teal/green styling */}
//                 <div className="col-span-2">
//                   <input
//                     type="number" min="0" step="0.01" value={line.credit}
//                     onChange={(e) => setLine(line.id, "credit", e.target.value)}
//                     placeholder="0.00"
//                     className="w-full p-2 rounded-xl text-xs outline-none text-right font-mono font-bold"
//                     style={{
//                       background: "#CCFBF1",
//                       border: `1.5px solid #0F766E`,
//                       color: "#0F766E",
//                     }}
//                   />
//                 </div>
//                 <div className="col-span-1 flex justify-center">
//                   {lines.length > 2 && (
//                     <button onClick={() => removeLine(line.id)}><X size={13} color={C.textMuted} /></button>
//                   )}
//                 </div>
//               </div>
//             ))}

//             {/* VAT preview row — shown when VAT applies */}
//             {applyVat && vatAmount > 0 && (
//               <div
//                 className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center"
//                 style={{ borderBottom: `1px solid ${C.border}`, background: "#FFFBEB" }}
//               >
//                 <div className="col-span-4">
//                   <div className="flex items-center gap-1.5">
//                     <Shield size={11} color="#D97706" />
//                     <span className="text-xs font-semibold" style={{ color: "#92400E" }}>
//                       VAT Payable (2200) — Auto
//                     </span>
//                   </div>
//                 </div>
//                 <div className="col-span-3">
//                   <span className="text-xs" style={{ color: "#B45309" }}>7.5% VAT on ₦{totalCredit.toFixed(2)}</span>
//                 </div>
//                 <div className="col-span-2 text-right">
//                   <span className="text-xs font-mono font-bold" style={{ color: "#1E1B4B" }}>
//                     ₦{vatAmount.toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="col-span-2 text-right">
//                   <span className="text-xs font-mono font-bold" style={{ color: "#0F766E" }}>
//                     ₦{vatAmount.toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="col-span-1" />
//               </div>
//             )}

//             {/* Totals */}
//             <div
//               className="grid grid-cols-12 px-4 py-3 text-sm font-bold"
//               style={{
//                 background: balanced ? "#D1FAE566" : "#FEE2E266",
//                 borderTop: `2px solid ${balanced ? "#10B981" : "#EF4444"}`,
//               }}
//             >
//               <div className="col-span-7 text-xs font-bold uppercase tracking-wide" style={{ color: C.textMuted }}>
//                 Totals {balanced ? "✓ Balanced" : "⚠ Not balanced"}
//                 {applyVat && vatAmount > 0 && (
//                   <span className="ml-2 text-[10px] font-normal" style={{ color: "#D97706" }}>
//                     (incl. ₦{vatAmount.toFixed(2)} VAT)
//                   </span>
//                 )}
//               </div>
//               <div className="col-span-2 text-right font-mono" style={{ color: "#1E1B4B" }}>
//                 ₦{totalDebit.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
//               </div>
//               <div className="col-span-2 text-right font-mono font-bold" style={{ color: "#0F766E" }}>
//                 ₦{totalCredit.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
//               </div>
//               <div className="col-span-1" />
//             </div>
//           </div>

//           {error && <p className="text-xs font-medium" style={{ color: C.danger }}>{error}</p>}
//         </div>

//         {/* Footer */}
//         <div className="px-6 py-4 shrink-0 flex gap-3" style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}>
//           <Motion.button
//             whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
//             onClick={handleSave} disabled={saving}
//             className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
//             style={{ background: C.surfaceAlt, color: C.textSecondary, border: `1px solid ${C.border}`, opacity: saving ? 0.7 : 1 }}
//           >
//             {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
//             {saving ? "Saving…" : "Save Draft"}
//           </Motion.button>
//           <Motion.button
//             whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
//             onClick={handlePost} disabled={posting || !balanced}
//             className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
//             style={{
//               background: balanced ? `linear-gradient(135deg,${C.primary},#06B6D4)` : C.border,
//               color: balanced ? "#fff" : C.textMuted,
//               opacity: posting ? 0.7 : 1,
//               cursor: !balanced ? "not-allowed" : "pointer",
//             }}
//           >
//             {posting ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
//             {posting ? "Posting…" : `Post Entry${applyVat && vatAmount > 0 ? ` (+ ₦${vatAmount.toFixed(2)} VAT)` : ""}`}
//           </Motion.button>
//         </div>
//       </Motion.div>
//     </Motion.div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════
// export default function GeneralLedger({ searchQuery }) {
//   const [accounts, setAccounts]           = useState([]);
//   const [selectedAccId, setSelectedAccId] = useState(null);
//   const [ledger, setLedger]               = useState(null);
//   const [loading, setLoading]             = useState(true);
//   const [ledgerLoading, setLedgerLoading] = useState(false);
//   const [toast, setToast]                 = useState(null);
//   const [showDrawer, setShowDrawer]       = useState(false);
//   const [dateFrom, setDateFrom]           = useState(monthStart());
//   const [dateTo, setDateTo]               = useState(today());
//   const [accSearch, setAccSearch]         = useState("");
//   const [exportingAll, setExportingAll]   = useState(false);

//   const showToast = useCallback((msg, type = "success") => setToast({ msg, type }), []);

//   const loadAccounts = async () => {
//     setLoading(true);
//     try {
//       const res = await accountingApi.listAccounts();
//       setAccounts(res.accounts ?? res.data ?? []);
//     } catch {
//       showToast("Failed to load accounts.", "error");
//     } finally { setLoading(false); }
//   };

//   const loadLedger = useCallback(async () => {
//     if (!selectedAccId) return;
//     setLedgerLoading(true);
//     try {
//       const res  = await accountingApi.getLedger(selectedAccId, { from: dateFrom, to: dateTo });
//       const data = res.data || res;
//       setLedger({
//         openingBalance: data.opening_balance || 0,
//         closingBalance: data.closing_balance || 0,
//         transactions: (data.transactions || []).map((t) => ({
//           id:             t.line_id,
//           date:           t.entry_date,
//           reference:      t.reference_number,
//           description:    t.line_description || t.entry_description || "",
//           debitAmount:    Number(t.debit_amount  || 0),
//           creditAmount:   Number(t.credit_amount || 0),
//           runningBalance: Number(t.running_balance || 0),
//         })),
//       });
//     } catch {
//       showToast("Failed to load ledger.", "error");
//     } finally { setLedgerLoading(false); }
//   }, [selectedAccId, dateFrom, dateTo, showToast]);

//   useEffect(() => { loadAccounts(); }, []);
//   useEffect(() => { loadLedger(); }, [loadLedger]);

//   const filteredAccounts = useMemo(() => {
//     const q = (accSearch || searchQuery || "").toLowerCase();
//     if (!q) return accounts;
//     return accounts.filter(
//       (a) =>
//         (a.accountName ?? a.account_name ?? "").toLowerCase().includes(q) ||
//         (a.accountCode ?? a.account_code ?? "").toLowerCase().includes(q),
//     );
//   }, [accounts, accSearch, searchQuery]);

//   // ── Export single account CSV ──────────────────────────────
//   const exportCSV = () => {
//     if (!ledger?.transactions) return;
//     const selectedAcc = accounts.find((a) => a.id === selectedAccId);
//     const accName = selectedAcc?.account_name ?? selectedAcc?.accountName ?? selectedAccId;
//     const rows = [
//       ["Account", "Date", "Reference", "Description", "Debit (₦)", "Credit (₦)", "Balance (₦)"],
//       [`${accName} (${selectedAcc?.account_code ?? ""})`, "", "", "Opening Balance", "", "", (ledger.openingBalance / 100).toFixed(2)],
//       ...ledger.transactions.map((t) => [
//         accName,
//         t.date ? new Date(t.date).toLocaleDateString("en-NG") : "—",
//         t.reference ?? "—",
//         t.description,
//         t.debitAmount  ? (t.debitAmount  / 100).toFixed(2) : "",
//         t.creditAmount ? (t.creditAmount / 100).toFixed(2) : "",
//         (t.runningBalance / 100).toFixed(2),
//       ]),
//       [accName, dateTo, "", "Closing Balance", "", "", (ledger.closingBalance / 100).toFixed(2)],
//     ];
//     downloadCSV(rows, `ledger-${accName}-${dateFrom}-to-${dateTo}.csv`);
//   };

//   // ── Export ALL accounts CSV ────────────────────────────────
//   const exportAllAccountsCSV = async () => {
//     setExportingAll(true);
//     try {
//       const rows = [["Account Code", "Account Name", "Type", "Date", "Reference", "Description", "Debit (₦)", "Credit (₦)", "Running Balance (₦)"]];

//       for (const acc of accounts) {
//         try {
//           const res  = await accountingApi.getLedger(acc.id, { from: dateFrom, to: dateTo });
//           const data = res.data || res;
//           const txns = data.transactions ?? [];
//           const accCode = acc.account_code ?? acc.accountCode ?? "";
//           const accName = acc.account_name ?? acc.accountName ?? "";
//           const accType = acc.account_type ?? acc.accountType ?? "";

//           // Opening row
//           rows.push([accCode, accName, accType, dateFrom, "", "Opening Balance", "", "", (Number(data.opening_balance || 0) / 100).toFixed(2)]);

//           for (const t of txns) {
//             rows.push([
//               accCode,
//               accName,
//               accType,
//               t.entry_date ? new Date(t.entry_date).toLocaleDateString("en-NG") : "—",
//               t.reference_number ?? "—",
//               t.line_description || t.entry_description || "—",
//               Number(t.debit_amount  || 0) > 0 ? (Number(t.debit_amount)  / 100).toFixed(2) : "",
//               Number(t.credit_amount || 0) > 0 ? (Number(t.credit_amount) / 100).toFixed(2) : "",
//               (Number(t.running_balance || 0) / 100).toFixed(2),
//             ]);
//           }

//           // Closing row
//           rows.push([accCode, accName, accType, dateTo, "", "Closing Balance", "", "", (Number(data.closing_balance || 0) / 100).toFixed(2)]);
//           rows.push([]); // blank separator between accounts
//         } catch {
//           // Skip accounts that fail silently
//         }
//       }

//       downloadCSV(rows, `all-accounts-ledger-${dateFrom}-to-${dateTo}.csv`);
//       showToast(`Exported ${accounts.length} accounts to CSV`);
//     } catch {
//       showToast("Failed to export all accounts", "error");
//     } finally { setExportingAll(false); }
//   };

//   const downloadCSV = (rows, filename) => {
//     const csv  = rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
//     const blob = new Blob([csv], { type: "text/csv" });
//     const url  = URL.createObjectURL(blob);
//     const a    = document.createElement("a");
//     a.href     = url;
//     a.download = filename;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const selectedAcc = accounts.find((a) => a.id === selectedAccId);

//   return (
//     <Motion.div
//       initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
//       className="space-y-4"
//     >
//       {/* ── Toolbar ── */}
//       <div
//         className="rounded-2xl p-4 flex flex-wrap items-center gap-3"
//         style={{ background: C.surface, border: `1px solid ${C.border}` }}
//       >
//         <div className="flex items-center gap-2">
//           <label className="text-xs font-semibold" style={{ color: C.textMuted }}>From</label>
//           <input
//             type="date" value={dateFrom}
//             onChange={(e) => setDateFrom(e.target.value)}
//             className="p-2 text-xs rounded-xl outline-none"
//             style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.textPrimary }}
//           />
//           <label className="text-xs font-semibold" style={{ color: C.textMuted }}>To</label>
//           <input
//             type="date" value={dateTo}
//             onChange={(e) => setDateTo(e.target.value)}
//             className="p-2 text-xs rounded-xl outline-none"
//             style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.textPrimary }}
//           />
//         </div>
//         <div className="flex items-center gap-2 ml-auto">
//           {/* Export selected account */}
//           {selectedAccId && (
//             <Motion.button
//               whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
//               onClick={exportCSV}
//               className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl"
//               style={{ background: C.surfaceAlt, color: C.textSecondary, border: `1px solid ${C.border}` }}
//             >
//               <Download size={13} /> Export Account CSV
//             </Motion.button>
//           )}
//           {/* ✅ Export ALL accounts */}
//           <Motion.button
//             whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
//             onClick={exportAllAccountsCSV}
//             disabled={exportingAll || accounts.length === 0}
//             className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl"
//             style={{
//               background: exportingAll ? C.surfaceAlt : "#0F766E",
//               color: exportingAll ? C.textMuted : "#fff",
//               border: `1px solid ${exportingAll ? C.border : "#0F766E"}`,
//               opacity: exportingAll ? 0.7 : 1,
//             }}
//           >
//             {exportingAll ? <RefreshCw size={13} className="animate-spin" /> : <FileDown size={13} />}
//             {exportingAll ? "Exporting…" : "Export All Accounts"}
//           </Motion.button>
//           <Motion.button
//             whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
//             onClick={() => setShowDrawer(true)}
//             className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl"
//             style={{ background: C.primary, color: "#fff" }}
//           >
//             <Plus size={14} /> New Journal Entry
//           </Motion.button>
//         </div>
//       </div>

//       {/* ── Split layout ── */}
//       <div className="flex gap-4" style={{ minHeight: 500 }}>
//         {/* Left: Account list */}
//         <div
//           className="w-72 shrink-0 rounded-2xl overflow-hidden flex flex-col"
//           style={{ background: C.surface, border: `1px solid ${C.border}` }}
//         >
//           <div className="p-3" style={{ borderBottom: `1px solid ${C.border}` }}>
//             <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
//               <Search size={12} color={C.textMuted} />
//               <input
//                 value={accSearch}
//                 onChange={(e) => setAccSearch(e.target.value)}
//                 placeholder="Search accounts…"
//                 className="flex-1 bg-transparent text-xs outline-none"
//                 style={{ color: C.textPrimary }}
//               />
//             </div>
//           </div>
//           <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
//             {loading ? (
//               <div className="flex items-center justify-center py-8"><Loader /></div>
//             ) : (
//               filteredAccounts.map((acc) => {
//                 const active = acc.id === selectedAccId;
//                 return (
//                   <button
//                     key={acc.id}
//                     onClick={() => setSelectedAccId(acc.id)}
//                     className="w-full flex items-center gap-3 px-4 py-3 text-left"
//                     style={{ background: active ? C.primaryLight : "transparent", borderBottom: `1px solid ${C.border}` }}
//                     onMouseEnter={(e) => !active && (e.currentTarget.style.background = C.surfaceAlt)}
//                     onMouseLeave={(e) => !active && (e.currentTarget.style.background = "transparent")}
//                   >
//                     <div className="flex-1 min-w-0">
//                       <p className="text-xs font-bold truncate" style={{ color: active ? C.primary : C.textPrimary }}>
//                         {acc.accountName ?? acc.account_name}
//                       </p>
//                       <p className="text-[10px] font-mono" style={{ color: C.textMuted }}>
//                         {acc.accountCode ?? acc.account_code}
//                       </p>
//                     </div>
//                     {active && <ChevronRight size={12} color={C.primary} />}
//                   </button>
//                 );
//               })
//             )}
//           </div>
//         </div>

//         {/* Right: Ledger */}
//         <div
//           className="flex-1 rounded-2xl overflow-hidden flex flex-col"
//           style={{ background: C.surface, border: `1px solid ${C.border}` }}
//         >
//           {!selectedAccId ? (
//             <div className="flex flex-col items-center justify-center flex-1 gap-3" style={{ color: C.textMuted }}>
//               <Search size={32} />
//               <p className="text-sm font-medium">Select an account to view its ledger</p>
//             </div>
//           ) : ledgerLoading ? (
//             <div className="flex items-center justify-center flex-1"><Loader /></div>
//           ) : (
//             <>
//               <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
//                 <div>
//                   <h3 className="font-bold text-sm" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>
//                     {selectedAcc?.accountName ?? selectedAcc?.account_name}
//                   </h3>
//                   <p className="text-[11px] font-mono" style={{ color: C.textMuted }}>
//                     {selectedAcc?.accountCode ?? selectedAcc?.account_code} · {dateFrom} → {dateTo}
//                   </p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-xs" style={{ color: C.textMuted }}>Closing Balance</p>
//                   <p className="text-base font-bold" style={{ color: C.primary, fontFamily: "Sora,sans-serif" }}>
//                     {fmt(ledger?.closingBalance)}
//                   </p>
//                 </div>
//               </div>

//               <div className="overflow-x-auto flex-1">
//                 <table className="w-full">
//                   <thead>
//                     <tr style={{ background: C.surfaceAlt, borderBottom: `1px solid ${C.border}` }}>
//                       {["Date", "Reference", "Description", "Debit", "Credit", "Balance"].map((h) => (
//                         <th
//                           key={h}
//                           className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
//                           style={{ color: h === "Credit" ? "#0F766E" : C.textMuted, fontWeight: h === "Credit" ? 800 : 700 }}
//                         >
//                           {h}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {/* Opening balance */}
//                     <tr style={{ borderBottom: `1px solid ${C.border}`, background: "#F7F8FC" }}>
//                       <td className="px-4 py-2.5 text-xs text-gray-400">{dateFrom}</td>
//                       <td className="px-4 py-2.5" />
//                       <td className="px-4 py-2.5 text-xs font-semibold" style={{ color: C.textMuted }}>Opening Balance</td>
//                       <td className="px-4 py-2.5" />
//                       <td className="px-4 py-2.5" />
//                       <td className="px-4 py-2.5 font-mono text-sm font-bold" style={{ color: C.primary }}>{fmt(ledger?.openingBalance)}</td>
//                     </tr>

//                     {(ledger?.transactions ?? []).length === 0 ? (
//                       <tr>
//                         <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: C.textMuted }}>
//                           No transactions in this period.
//                         </td>
//                       </tr>
//                     ) : (
//                       (ledger?.transactions ?? []).map((t, i) => (
//                         <Motion.tr
//                           key={t.id ?? i}
//                           initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
//                           className="border-b"
//                           style={{ borderColor: C.border }}
//                           onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceAlt)}
//                           onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
//                         >
//                           <td className="px-4 py-3 text-xs" style={{ color: C.textSecondary }}>
//                             {t.date ? new Date(t.date).toLocaleDateString("en-GB") : "—"}
//                           </td>
//                           <td className="px-4 py-3 font-mono text-xs" style={{ color: C.textMuted }}>{t.reference ?? "—"}</td>
//                           <td className="px-4 py-3 text-sm" style={{ color: C.textPrimary }}>{t.description}</td>
//                           <td className="px-4 py-3 font-mono text-sm font-semibold text-right" style={{ color: "#1E1B4B" }}>
//                             {t.debitAmount ? fmt(t.debitAmount) : "—"}
//                           </td>
//                           {/* ✅ Credit column — bold teal */}
//                           <td className="px-4 py-3 font-mono text-sm font-bold text-right" style={{ color: "#0F766E" }}>
//                             {t.creditAmount ? fmt(t.creditAmount) : "—"}
//                           </td>
//                           <td className="px-4 py-3 font-mono text-sm font-bold" style={{ color: C.primary }}>
//                             {fmt(t.runningBalance)}
//                           </td>
//                         </Motion.tr>
//                       ))
//                     )}

//                     {/* Closing balance */}
//                     <tr style={{ background: "#EEF2FF", borderTop: `2px solid ${C.primary}` }}>
//                       <td className="px-4 py-2.5 text-xs font-bold" style={{ color: C.primary }}>{dateTo}</td>
//                       <td className="px-4 py-2.5" />
//                       <td className="px-4 py-2.5 text-xs font-bold" style={{ color: C.primary }}>Closing Balance</td>
//                       <td className="px-4 py-2.5" />
//                       <td className="px-4 py-2.5" />
//                       <td className="px-4 py-2.5 font-mono text-sm font-bold" style={{ color: C.primary }}>{fmt(ledger?.closingBalance)}</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Journal entry drawer */}
//       <AnimatePresence>
//         {showDrawer && (
//           <JournalEntryDrawer
//             accounts={accounts}
//             onClose={() => setShowDrawer(false)}
//             onSaved={() => { setShowDrawer(false); loadLedger(); }}
//             showToast={showToast}
//           />
//         )}
//       </AnimatePresence>

//       <AnimatePresence>
//         {toast && <Toast msg={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
//       </AnimatePresence>
//     </Motion.div>
//   );
// }

// src/admin/accounting/GeneralLedger.jsx

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, RefreshCw, Download, CheckCircle2, AlertCircle,
  ChevronRight, Search, Send, Save, Shield, ShieldOff, FileDown,
  ArrowLeft,
} from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import API from "../../api/axios";
import Loader from "../../components/Loader";

const VAT_RATE        = 0.075;
const TAX_EXEMPT_CODE = "127669ED";

const accountingApi = {
  listAccounts:  ()           => API.get("/accounting/accounts").then((r) => r.data),
  createJournal: (payload)    => API.post("/accounting/journal-entries", payload).then((r) => r.data),
  postJournal:   (id)         => API.post(`/accounting/journal-entries/${id}/post`).then((r) => r.data),
  getLedger:     (id, params) => API.get(`/accounting/general-ledger/${id}`, { params }).then((r) => r.data),
};

const fmt = (kobo) =>
  kobo != null && kobo !== 0
    ? `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
    : "—";

const today      = () => new Date().toISOString().split("T")[0];
const monthStart = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

// High-contrast credit colours — dark teal on pale mint
const CREDIT_COLOR  = "#0D5C4E";
const CREDIT_BG     = "#C6F6EE";
const CREDIT_BORDER = "#0D9488";

// ── Toast ─────────────────────────────────────────────────────
function Toast({ msg, type, onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 3500); return () => clearTimeout(t); }, [onDismiss]);
  return (
    <Motion.div
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl"
      style={{ background: C.navy ?? "#1E1B4B", color: "#fff", minWidth: 300, maxWidth: "calc(100vw - 2rem)" }}
    >
      {type === "error" ? <AlertCircle size={15} color="#EF4444" /> : <CheckCircle2 size={15} color="#10B981" />}
      <span className="text-sm font-medium flex-1">{msg}</span>
      <button onClick={onDismiss}><X size={13} color="rgba(255,255,255,0.5)" /></button>
    </Motion.div>
  );
}

const emptyLine = () => ({ id: crypto.randomUUID(), accountId: "", description: "", debit: "", credit: "" });

// ── VAT Exempt Toggle ─────────────────────────────────────────
function VatExemptToggle({ exempt, onToggle, exemptCode, onCodeChange, codeVerified, onVerify }) {
  return (
    <div
      className="rounded-xl p-3 flex flex-wrap items-start gap-3"
      style={{ background: exempt ? "#FEF3C7" : "#ECFDF5", border: `1px solid ${exempt ? "#FCD34D" : "#6EE7B7"}` }}
    >
      <div className="flex items-start gap-2 flex-1 min-w-0">
        {exempt
          ? <ShieldOff size={15} color="#D97706" className="mt-0.5 shrink-0" />
          : <Shield size={15} color="#059669" className="mt-0.5 shrink-0" />}
        <div>
          <p className="text-xs font-bold" style={{ color: exempt ? "#92400E" : "#065F46" }}>
            {exempt ? "VAT Exempt" : "VAT Applicable (7.5%)"}
          </p>
          <p className="text-[10px]" style={{ color: exempt ? "#B45309" : "#047857" }}>
            {exempt ? "This transaction is exempt from VAT" : "7.5% VAT will be auto-calculated and added as a separate line"}
          </p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0"
        style={{ background: exempt ? "#FDE68A" : C.primary, color: exempt ? "#92400E" : "#fff" }}
      >
        {exempt ? "Remove Exemption" : "Exempt from VAT"}
      </button>
      {exempt && !codeVerified && (
        <div className="w-full flex items-center gap-2">
          <input
            value={exemptCode}
            onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
            placeholder="Enter tax exempt code…"
            maxLength={8}
            className="flex-1 p-2 rounded-lg text-xs font-mono outline-none tracking-widest"
            style={{ background: "#FEF3C7", border: "1.5px solid #FCD34D", color: "#92400E" }}
          />
          <button onClick={onVerify} className="px-3 py-2 rounded-lg text-xs font-bold text-white shrink-0" style={{ background: "#D97706" }}>
            Verify
          </button>
        </div>
      )}
      {exempt && codeVerified && (
        <div className="w-full flex items-center gap-1.5">
          <CheckCircle2 size={13} color="#059669" />
          <span className="text-xs font-semibold" style={{ color: "#065F46" }}>Code verified — exempt from VAT</span>
        </div>
      )}
    </div>
  );
}

// ── Journal Entry Drawer ──────────────────────────────────────
function JournalEntryDrawer({ accounts, onClose, onSaved, showToast }) {
  const [form, setForm]       = useState({ date: today(), description: "", reference: "" });
  const [lines, setLines]     = useState([emptyLine(), emptyLine()]);
  const [saving, setSaving]   = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError]     = useState("");
  const [vatExempt, setVatExempt]       = useState(false);
  const [exemptCode, setExemptCode]     = useState("");
  const [codeVerified, setCodeVerified] = useState(false);

  const totalDebit  = lines.reduce((s, l) => s + (parseFloat(l.debit)  || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const balanced    = totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.001;
  const vatAmount   = vatExempt && codeVerified ? 0 : Math.round(totalCredit * VAT_RATE * 100) / 100;
  const applyVat    = (!vatExempt || !codeVerified) && vatAmount > 0;
  const vatAccount  = accounts.find((a) => (a.account_code ?? a.accountCode) === "2200");

  const setLine    = (id, field, val) => setLines((p) => p.map((l) => (l.id === id ? { ...l, [field]: val } : l)));
  const addLine    = () => setLines((p) => [...p, emptyLine()]);
  const removeLine = (id) => setLines((p) => p.filter((l) => l.id !== id));

  const handleVatToggle = () => { setVatExempt((p) => !p); setCodeVerified(false); setExemptCode(""); };
  const handleVerify    = () => {
    if (exemptCode === TAX_EXEMPT_CODE) { setCodeVerified(true); showToast("Tax exempt code verified."); }
    else { showToast("Invalid tax exempt code.", "error"); setCodeVerified(false); }
  };

  const buildPayload = () => {
    const builtLines = lines.filter((l) => l.accountId).map((l) => ({
      accountId:    l.accountId,
      description:  l.description,
      debitAmount:  l.debit  ? Math.round(parseFloat(l.debit)  * 100) : 0,
      creditAmount: l.credit ? Math.round(parseFloat(l.credit) * 100) : 0,
    }));
    if (applyVat && vatAmount > 0 && vatAccount) {
      const vatKobo      = Math.round(vatAmount * 100);
      const vatInputAcct = accounts.find((a) => (a.account_code ?? a.accountCode) === "1005");
      builtLines.push({ accountId: vatAccount.id,                                     description: "VAT 7.5% (auto)",  debitAmount: 0,        creditAmount: vatKobo });
      builtLines.push({ accountId: vatInputAcct?.id ?? builtLines[0]?.accountId,      description: "VAT Input (7.5%)", debitAmount: vatKobo,  creditAmount: 0 });
    }
    return {
      entryDate:   form.date,
      description: form.description,
      reference:   form.reference || undefined,
      vatExempt:   vatExempt && codeVerified,
      exemptCode:  vatExempt && codeVerified ? exemptCode : undefined,
      lines:       builtLines,
    };
  };

  const validate = () => {
    if (!form.date || !form.description.trim())         { setError("Date and description are required."); return false; }
    if (lines.filter((l) => l.accountId).length < 2)   { setError("At least two lines required."); return false; }
    if (!balanced)                                      { setError("Debits must equal credits before posting."); return false; }
    if (vatExempt && !codeVerified)                     { setError("Verify your tax exempt code before posting."); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!form.date || !form.description.trim()) { setError("Date and description are required."); return; }
    setSaving(true); setError("");
    try { await accountingApi.createJournal(buildPayload()); showToast("Draft saved."); onSaved(); }
    catch (err) { setError(err?.response?.data?.message ?? "Failed to save."); }
    finally { setSaving(false); }
  };

  const handlePost = async () => {
    if (!validate()) return;
    setPosting(true); setError("");
    try {
      const res       = await accountingApi.createJournal(buildPayload());
      const journalId = res?.data?.id;
      if (!journalId) throw new Error("Journal ID not returned");
      await accountingApi.postJournal(journalId);
      showToast("Journal entry posted."); onSaved();
    } catch (err) { setError(err?.response?.data?.message ?? "Failed to post."); }
    finally { setPosting(false); }
  };

  return (
    <Motion.div
      className="fixed inset-0 z-50 flex items-center justify-end"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0" style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <Motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative h-full w-full flex flex-col"
        style={{ maxWidth: "min(680px, 100vw)", background: C.bg, boxShadow: "-8px 0 40px rgba(0,0,0,0.15)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 shrink-0" style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
          <h2 className="font-bold text-sm md:text-base" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>New Journal Entry</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={15} color={C.textMuted} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {/* Meta */}
          <div className="rounded-2xl p-4 md:p-5 space-y-3" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>
                  Date <span style={{ color: C.danger }}>*</span>
                </label>
                <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full p-2.5 rounded-xl outline-none text-sm"
                  style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>Reference</label>
                <input value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                  placeholder="Auto-generated if blank"
                  className="w-full p-2.5 rounded-xl outline-none text-sm"
                  style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>
                Description <span style={{ color: C.danger }}>*</span>
              </label>
              <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Salary payment for January 2025"
                className="w-full p-2.5 rounded-xl outline-none text-sm"
                style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }} />
            </div>
          </div>

          <VatExemptToggle
            exempt={vatExempt} onToggle={handleVatToggle}
            exemptCode={exemptCode} onCodeChange={setExemptCode}
            codeVerified={codeVerified} onVerify={handleVerify}
          />

          {/* Line items */}
          <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: C.textMuted }}>Line Items</p>
              <button onClick={addLine} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: C.primaryLight, color: C.primary }}>
                <Plus size={12} /> Add Line
              </button>
            </div>

            {/* Mobile card layout */}
            <div className="block md:hidden divide-y" style={{ borderColor: C.border }}>
              {lines.map((line, idx) => (
                <div key={line.id} className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold" style={{ color: C.textMuted }}>Line {idx + 1}</span>
                    {lines.length > 2 && (
                      <button onClick={() => removeLine(line.id)}><X size={13} color={C.textMuted} /></button>
                    )}
                  </div>
                  <select value={line.accountId} onChange={(e) => setLine(line.id, "accountId", e.target.value)}
                    className="w-full p-2 rounded-xl text-xs outline-none appearance-none"
                    style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, color: line.accountId ? C.textPrimary : C.textMuted }}>
                    <option value="">Select account…</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>{a.accountCode ?? a.account_code} — {a.accountName ?? a.account_name}</option>
                    ))}
                  </select>
                  <input value={line.description} onChange={(e) => setLine(line.id, "description", e.target.value)}
                    placeholder="Note…" className="w-full p-2 rounded-xl text-xs outline-none"
                    style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.textPrimary }} />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold mb-1" style={{ color: "#3730A3" }}>Debit (₦)</label>
                      <input type="number" min="0" step="0.01" value={line.debit}
                        onChange={(e) => setLine(line.id, "debit", e.target.value)}
                        placeholder="0.00" className="w-full p-2 rounded-xl text-xs outline-none text-right font-mono"
                        style={{ background: "#EEF2FF", border: `1.5px solid #A5B4FC`, color: "#1E1B4B" }} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold mb-1" style={{ color: CREDIT_COLOR }}>Credit (₦)</label>
                      <input type="number" min="0" step="0.01" value={line.credit}
                        onChange={(e) => setLine(line.id, "credit", e.target.value)}
                        placeholder="0.00" className="w-full p-2 rounded-xl text-xs outline-none text-right font-mono font-bold"
                        style={{ background: CREDIT_BG, border: `1.5px solid ${CREDIT_BORDER}`, color: CREDIT_COLOR }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: C.surfaceAlt, borderBottom: `1px solid ${C.border}` }}>
                    <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wide w-[35%]" style={{ color: C.textMuted }}>Account</th>
                    <th className="px-2 py-2 text-left text-xs font-bold uppercase tracking-wide w-[25%]"  style={{ color: C.textMuted }}>Description</th>
                    <th className="px-2 py-2 text-right text-xs font-bold uppercase tracking-wide w-[17%]" style={{ color: "#3730A3" }}>Debit (₦)</th>
                    <th className="px-2 py-2 text-right text-xs font-bold uppercase tracking-wide w-[17%]" style={{ color: CREDIT_COLOR }}>Credit (₦)</th>
                    <th className="w-[6%]" />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td className="px-4 py-2">
                        <select value={line.accountId} onChange={(e) => setLine(line.id, "accountId", e.target.value)}
                          className="w-full p-2 rounded-xl text-xs outline-none appearance-none"
                          style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, color: line.accountId ? C.textPrimary : C.textMuted }}>
                          <option value="">Select account…</option>
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>{a.accountCode ?? a.account_code} — {a.accountName ?? a.account_name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input value={line.description} onChange={(e) => setLine(line.id, "description", e.target.value)}
                          placeholder="Note…" className="w-full p-2 rounded-xl text-xs outline-none"
                          style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.textPrimary }} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min="0" step="0.01" value={line.debit}
                          onChange={(e) => setLine(line.id, "debit", e.target.value)}
                          placeholder="0.00" className="w-full p-2 rounded-xl text-xs outline-none text-right font-mono"
                          style={{ background: "#EEF2FF", border: `1.5px solid #A5B4FC`, color: "#1E1B4B" }} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min="0" step="0.01" value={line.credit}
                          onChange={(e) => setLine(line.id, "credit", e.target.value)}
                          placeholder="0.00" className="w-full p-2 rounded-xl text-xs outline-none text-right font-mono font-bold"
                          style={{ background: CREDIT_BG, border: `1.5px solid ${CREDIT_BORDER}`, color: CREDIT_COLOR }} />
                      </td>
                      <td className="px-2 py-2 text-center">
                        {lines.length > 2 && (
                          <button onClick={() => removeLine(line.id)}><X size={13} color={C.textMuted} /></button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* VAT auto-row */}
                  {applyVat && vatAmount > 0 && (
                    <tr style={{ background: "#FFFBEB", borderBottom: `1px solid ${C.border}` }}>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1.5">
                          <Shield size={11} color="#D97706" />
                          <span className="text-xs font-semibold" style={{ color: "#92400E" }}>VAT Payable (2200) — Auto</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-xs" style={{ color: "#B45309" }}>7.5% of ₦{totalCredit.toFixed(2)}</td>
                      <td className="px-2 py-2 text-right font-mono text-xs font-bold" style={{ color: "#1E1B4B" }}>₦{vatAmount.toFixed(2)}</td>
                      <td className="px-2 py-2 text-right font-mono text-xs font-bold" style={{ color: CREDIT_COLOR }}>₦{vatAmount.toFixed(2)}</td>
                      <td />
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals bar */}
            <div
              className="px-4 py-3 flex items-center justify-between flex-wrap gap-2"
              style={{ background: balanced ? "#D1FAE533" : "#FEE2E233", borderTop: `2px solid ${balanced ? "#10B981" : "#EF4444"}` }}
            >
              <span className="text-xs font-bold" style={{ color: balanced ? "#065F46" : "#991B1B" }}>
                {balanced ? "✓ Balanced" : "⚠ Not balanced"}
                {applyVat && vatAmount > 0 && (
                  <span className="ml-2 font-normal" style={{ color: "#D97706" }}>incl. ₦{vatAmount.toFixed(2)} VAT</span>
                )}
              </span>
              <div className="flex items-center gap-4 text-xs font-mono font-bold">
                <span style={{ color: "#3730A3" }}>Dr ₦{totalDebit.toFixed(2)}</span>
                <span style={{ color: CREDIT_COLOR }}>Cr ₦{totalCredit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {error && <p className="text-xs font-medium" style={{ color: C.danger }}>{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-4 md:px-6 py-4 shrink-0 flex gap-3" style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}>
          <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: C.surfaceAlt, color: C.textSecondary, border: `1px solid ${C.border}`, opacity: saving ? 0.7 : 1 }}>
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving…" : "Save Draft"}
          </Motion.button>
          <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePost} disabled={posting || !balanced}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: balanced ? C.primary : C.border, opacity: posting ? 0.7 : 1, cursor: !balanced ? "not-allowed" : "pointer" }}>
            {posting ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
            {posting ? "Posting…" : `Post Entry${applyVat && vatAmount > 0 ? ` (+ ₦${vatAmount.toFixed(2)} VAT)` : ""}`}
          </Motion.button>
        </div>
      </Motion.div>
    </Motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
export default function GeneralLedger({ searchQuery }) {
  const [accounts, setAccounts]                   = useState([]);
  const [selectedAccId, setSelectedAccId]         = useState(null);
  const [ledger, setLedger]                       = useState(null);
  const [loading, setLoading]                     = useState(true);
  const [ledgerLoading, setLedgerLoading]         = useState(false);
  const [toast, setToast]                         = useState(null);
  const [showDrawer, setShowDrawer]               = useState(false);
  const [dateFrom, setDateFrom]                   = useState(monthStart());
  const [dateTo, setDateTo]                       = useState(today());
  const [accSearch, setAccSearch]                 = useState("");
  const [exportingAll, setExportingAll]           = useState(false);
  // Mobile: show ledger panel instead of account list
  const [mobileShowLedger, setMobileShowLedger]   = useState(false);

  const showToast = useCallback((msg, type = "success") => setToast({ msg, type }), []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await accountingApi.listAccounts();
      setAccounts(res.accounts ?? res.data ?? []);
    } catch { showToast("Failed to load accounts.", "error"); }
    finally { setLoading(false); }
  };

  const loadLedger = useCallback(async () => {
    if (!selectedAccId) return;
    setLedgerLoading(true);
    try {
      const res  = await accountingApi.getLedger(selectedAccId, { from: dateFrom, to: dateTo });
      const data = res.data || res;
      setLedger({
        openingBalance: data.opening_balance || 0,
        closingBalance: data.closing_balance || 0,
        transactions: (data.transactions || []).map((t) => ({
          id:             t.line_id,
          date:           t.entry_date,
          reference:      t.reference_number,
          description:    t.line_description || t.entry_description || "",
          debitAmount:    Number(t.debit_amount  || 0),
          creditAmount:   Number(t.credit_amount || 0),
          runningBalance: Number(t.running_balance || 0),
        })),
      });
    } catch { showToast("Failed to load ledger.", "error"); }
    finally { setLedgerLoading(false); }
  }, [selectedAccId, dateFrom, dateTo, showToast]);

  useEffect(() => { loadAccounts(); }, []);
  useEffect(() => { loadLedger(); }, [loadLedger]);

  const filteredAccounts = useMemo(() => {
    const q = (accSearch || searchQuery || "").toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (a) => (a.accountName ?? a.account_name ?? "").toLowerCase().includes(q) ||
             (a.accountCode ?? a.account_code ?? "").toLowerCase().includes(q),
    );
  }, [accounts, accSearch, searchQuery]);

  const handleSelectAccount = (id) => {
    setSelectedAccId(id);
    setMobileShowLedger(true);
  };

  const downloadCSV = (rows, filename) => {
    const csv  = rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    if (!ledger?.transactions) return;
    const acc  = accounts.find((a) => a.id === selectedAccId);
    const name = acc?.account_name ?? acc?.accountName ?? selectedAccId;
    const rows = [
      ["Account", "Date", "Reference", "Description", "Debit (₦)", "Credit (₦)", "Balance (₦)"],
      [name, "", "", "Opening Balance", "", "", (ledger.openingBalance / 100).toFixed(2)],
      ...ledger.transactions.map((t) => [
        name,
        t.date ? new Date(t.date).toLocaleDateString("en-NG") : "—",
        t.reference ?? "—",
        t.description,
        t.debitAmount  ? (t.debitAmount  / 100).toFixed(2) : "",
        t.creditAmount ? (t.creditAmount / 100).toFixed(2) : "",
        (t.runningBalance / 100).toFixed(2),
      ]),
      [name, dateTo, "", "Closing Balance", "", "", (ledger.closingBalance / 100).toFixed(2)],
    ];
    downloadCSV(rows, `ledger-${name}-${dateFrom}-to-${dateTo}.csv`);
  };

  const exportAllAccountsCSV = async () => {
    setExportingAll(true);
    try {
      const rows = [["Account Code", "Account Name", "Type", "Date", "Reference", "Description", "Debit (₦)", "Credit (₦)", "Running Balance (₦)"]];
      for (const acc of accounts) {
        try {
          const res  = await accountingApi.getLedger(acc.id, { from: dateFrom, to: dateTo });
          const data = res.data || res;
          const code = acc.account_code ?? acc.accountCode ?? "";
          const name = acc.account_name ?? acc.accountName ?? "";
          const type = acc.account_type ?? acc.accountType ?? "";
          rows.push([code, name, type, dateFrom, "", "Opening Balance", "", "", (Number(data.opening_balance || 0) / 100).toFixed(2)]);
          for (const t of (data.transactions ?? [])) {
            rows.push([code, name, type,
              t.entry_date ? new Date(t.entry_date).toLocaleDateString("en-NG") : "—",
              t.reference_number ?? "—",
              t.line_description || t.entry_description || "—",
              Number(t.debit_amount  || 0) > 0 ? (Number(t.debit_amount)  / 100).toFixed(2) : "",
              Number(t.credit_amount || 0) > 0 ? (Number(t.credit_amount) / 100).toFixed(2) : "",
              (Number(t.running_balance || 0) / 100).toFixed(2),
            ]);
          }
          rows.push([code, name, type, dateTo, "", "Closing Balance", "", "", (Number(data.closing_balance || 0) / 100).toFixed(2)]);
          rows.push([]);
        } catch { /* skip */ }
      }
      downloadCSV(rows, `all-accounts-ledger-${dateFrom}-to-${dateTo}.csv`);
      showToast(`Exported ${accounts.length} accounts`);
    } catch { showToast("Export failed", "error"); }
    finally { setExportingAll(false); }
  };

  const selectedAcc = accounts.find((a) => a.id === selectedAccId);

  // ── Shared ledger content (desktop table + mobile cards) ────
  const LedgerContent = () => (
    <>
      {!selectedAccId ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 py-16" style={{ color: C.textMuted }}>
          <Search size={32} />
          <p className="text-sm font-medium">Select an account to view its ledger</p>
        </div>
      ) : ledgerLoading ? (
        <div className="flex items-center justify-center flex-1 py-16"><Loader /></div>
      ) : (
        <>
          {/* Ledger header */}
          <div className="px-4 md:px-5 py-3 md:py-4 flex items-start md:items-center justify-between gap-2"
            style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="min-w-0">
              <h3 className="font-bold text-sm truncate" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>
                {selectedAcc?.accountName ?? selectedAcc?.account_name}
              </h3>
              <p className="text-[11px] font-mono" style={{ color: C.textMuted }}>
                {selectedAcc?.accountCode ?? selectedAcc?.account_code} · {dateFrom} → {dateTo}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs" style={{ color: C.textMuted }}>Closing</p>
              <p className="text-base font-bold" style={{ color: C.primary, fontFamily: "Sora,sans-serif" }}>
                {fmt(ledger?.closingBalance)}
              </p>
            </div>
          </div>

          {/* ── Desktop table ── */}
          <div className="hidden md:block overflow-x-auto flex-1">
            <table className="w-full">
              <thead>
                <tr style={{ background: C.surfaceAlt, borderBottom: `1px solid ${C.border}` }}>
                  {[
                    { h: "Date",        clr: C.textMuted },
                    { h: "Reference",   clr: C.textMuted },
                    { h: "Description", clr: C.textMuted },
                    { h: "Debit",       clr: "#3730A3"   },
                    { h: "Credit",      clr: CREDIT_COLOR },
                    { h: "Balance",     clr: C.textMuted },
                  ].map(({ h, clr }) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: clr }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Opening */}
                <tr style={{ borderBottom: `1px solid ${C.border}`, background: "#F7F8FC" }}>
                  <td className="px-4 py-2.5 text-xs" style={{ color: C.textMuted }}>{dateFrom}</td>
                  <td className="px-4 py-2.5" />
                  <td className="px-4 py-2.5 text-xs font-semibold" style={{ color: C.textMuted }}>Opening Balance</td>
                  <td className="px-4 py-2.5" /><td className="px-4 py-2.5" />
                  <td className="px-4 py-2.5 font-mono text-sm font-bold" style={{ color: C.primary }}>{fmt(ledger?.openingBalance)}</td>
                </tr>

                {(ledger?.transactions ?? []).length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: C.textMuted }}>No transactions in this period.</td></tr>
                ) : (
                  (ledger?.transactions ?? []).map((t, i) => (
                    <Motion.tr key={t.id ?? i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                      className="border-b" style={{ borderColor: C.border }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceAlt)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td className="px-4 py-3 text-xs" style={{ color: C.textSecondary }}>
                        {t.date ? new Date(t.date).toLocaleDateString("en-GB") : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: C.textMuted }}>{t.reference ?? "—"}</td>
                      <td className="px-4 py-3 text-sm" style={{ color: C.textPrimary }}>{t.description}</td>
                      <td className="px-4 py-3 font-mono text-sm font-semibold text-right" style={{ color: "#3730A3" }}>
                        {t.debitAmount ? fmt(t.debitAmount) : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm font-bold text-right" style={{ color: CREDIT_COLOR }}>
                        {t.creditAmount ? fmt(t.creditAmount) : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm font-bold" style={{ color: C.primary }}>
                        {fmt(t.runningBalance)}
                      </td>
                    </Motion.tr>
                  ))
                )}

                {/* Closing */}
                <tr style={{ background: "#EEF2FF", borderTop: `2px solid ${C.primary}` }}>
                  <td className="px-4 py-2.5 text-xs font-bold" style={{ color: C.primary }}>{dateTo}</td>
                  <td className="px-4 py-2.5" /><td className="px-4 py-2.5 text-xs font-bold" style={{ color: C.primary }}>Closing Balance</td>
                  <td className="px-4 py-2.5" /><td className="px-4 py-2.5" />
                  <td className="px-4 py-2.5 font-mono text-sm font-bold" style={{ color: C.primary }}>{fmt(ledger?.closingBalance)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Mobile transaction cards ── */}
          <div className="block md:hidden flex-1 overflow-y-auto">
            {/* Opening */}
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#F7F8FC", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <p className="text-xs font-semibold" style={{ color: C.textMuted }}>Opening Balance</p>
                <p className="text-[10px]" style={{ color: C.textMuted }}>{dateFrom}</p>
              </div>
              <p className="font-mono text-sm font-bold" style={{ color: C.primary }}>{fmt(ledger?.openingBalance)}</p>
            </div>

            {(ledger?.transactions ?? []).length === 0 ? (
              <div className="px-4 py-8 text-center text-sm" style={{ color: C.textMuted }}>No transactions in this period.</div>
            ) : (
              (ledger?.transactions ?? []).map((t, i) => (
                <Motion.div key={t.id ?? i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                  className="px-4 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate" style={{ color: C.textPrimary }}>{t.description}</p>
                      <p className="text-[10px] font-mono mt-0.5" style={{ color: C.textMuted }}>
                        {t.date ? new Date(t.date).toLocaleDateString("en-GB") : "—"}
                        {t.reference ? ` · ${t.reference}` : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0 space-y-0.5">
                      {t.debitAmount  ? <p className="font-mono text-xs font-semibold" style={{ color: "#3730A3"    }}>Dr {fmt(t.debitAmount)}</p>  : null}
                      {t.creditAmount ? <p className="font-mono text-xs font-bold"    style={{ color: CREDIT_COLOR }}>Cr {fmt(t.creditAmount)}</p> : null}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                      style={{ background: C.primaryLight, color: C.primary }}>
                      Bal: {fmt(t.runningBalance)}
                    </span>
                  </div>
                </Motion.div>
              ))
            )}

            {/* Closing */}
            <div className="px-4 py-3 flex items-center justify-between"
              style={{ background: "#EEF2FF", borderTop: `2px solid ${C.primary}` }}>
              <div>
                <p className="text-xs font-bold" style={{ color: C.primary }}>Closing Balance</p>
                <p className="text-[10px]" style={{ color: C.primary }}>{dateTo}</p>
              </div>
              <p className="font-mono text-sm font-bold" style={{ color: C.primary }}>{fmt(ledger?.closingBalance)}</p>
            </div>
          </div>
        </>
      )}
    </>
  );

  return (
    <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

      {/* ── Toolbar ── */}
      <div className="rounded-2xl p-3 md:p-4 flex flex-wrap items-center gap-2 md:gap-3"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
          <label className="text-xs font-semibold" style={{ color: C.textMuted }}>From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="p-1.5 md:p-2 text-xs rounded-xl outline-none"
            style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.textPrimary }} />
          <label className="text-xs font-semibold" style={{ color: C.textMuted }}>To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="p-1.5 md:p-2 text-xs rounded-xl outline-none"
            style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.textPrimary }} />
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {selectedAccId && (
            <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={exportCSV}
              className="flex items-center gap-1.5 px-2.5 md:px-3 py-2 text-xs font-semibold rounded-xl"
              style={{ background: C.surfaceAlt, color: C.textSecondary, border: `1px solid ${C.border}` }}>
              <Download size={12} /><span className="hidden sm:inline">Export Account</span>
            </Motion.button>
          )}
          <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={exportAllAccountsCSV} disabled={exportingAll || accounts.length === 0}
            className="flex items-center gap-1.5 px-2.5 md:px-3 py-2 text-xs font-semibold rounded-xl"
            style={{ background: exportingAll ? C.surfaceAlt : CREDIT_COLOR, color: exportingAll ? C.textMuted : "#fff", opacity: exportingAll ? 0.7 : 1 }}>
            {exportingAll ? <RefreshCw size={12} className="animate-spin" /> : <FileDown size={12} />}
            <span className="hidden sm:inline">{exportingAll ? "Exporting…" : "Export All"}</span>
          </Motion.button>
          <Motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowDrawer(true)}
            className="flex items-center gap-1.5 px-3 md:px-4 py-2 text-xs md:text-sm font-semibold rounded-xl"
            style={{ background: C.primary, color: "#fff" }}>
            <Plus size={13} />
            <span className="hidden sm:inline">New Journal Entry</span>
            <span className="sm:hidden">New Entry</span>
          </Motion.button>
        </div>
      </div>

      {/* ── DESKTOP: side-by-side ── */}
      <div className="hidden md:flex gap-4" style={{ minHeight: 500 }}>
        {/* Account list */}
        <div className="w-72 shrink-0 rounded-2xl overflow-hidden flex flex-col"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <div className="p-3" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
              <Search size={12} color={C.textMuted} />
              <input value={accSearch} onChange={(e) => setAccSearch(e.target.value)}
                placeholder="Search accounts…" className="flex-1 bg-transparent text-xs outline-none"
                style={{ color: C.textPrimary }} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            {loading ? (
              <div className="flex items-center justify-center py-8"><Loader /></div>
            ) : (
              filteredAccounts.map((acc) => {
                const active = acc.id === selectedAccId;
                return (
                  <button key={acc.id} onClick={() => handleSelectAccount(acc.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                    style={{ background: active ? C.primaryLight : "transparent", borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={(e) => !active && (e.currentTarget.style.background = C.surfaceAlt)}
                    onMouseLeave={(e) => !active && (e.currentTarget.style.background = "transparent")}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: active ? C.primary : C.textPrimary }}>
                        {acc.accountName ?? acc.account_name}
                      </p>
                      <p className="text-[10px] font-mono" style={{ color: C.textMuted }}>{acc.accountCode ?? acc.account_code}</p>
                    </div>
                    {active && <ChevronRight size={12} color={C.primary} />}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Ledger */}
        <div className="flex-1 rounded-2xl overflow-hidden flex flex-col"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <LedgerContent />
        </div>
      </div>

      {/* ── MOBILE: stacked ── */}
      <div className="block md:hidden">
        {/* Account list panel */}
        {!mobileShowLedger && (
          <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <div className="p-3" style={{ borderBottom: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
                <Search size={12} color={C.textMuted} />
                <input value={accSearch} onChange={(e) => setAccSearch(e.target.value)}
                  placeholder="Search accounts…" className="flex-1 bg-transparent text-xs outline-none"
                  style={{ color: C.textPrimary }} />
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8"><Loader /></div>
            ) : (
              filteredAccounts.map((acc) => (
                <button key={acc.id} onClick={() => handleSelectAccount(acc.id)}
                  className="w-full flex items-center gap-3 px-4 py-4 text-left"
                  style={{ borderBottom: `1px solid ${C.border}` }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: C.textPrimary }}>
                      {acc.accountName ?? acc.account_name}
                    </p>
                    <p className="text-[10px] font-mono mt-0.5" style={{ color: C.textMuted }}>
                      {acc.accountCode ?? acc.account_code}
                    </p>
                  </div>
                  <ChevronRight size={14} color={C.textMuted} />
                </button>
              ))
            )}
          </div>
        )}

        {/* Ledger panel — full-width when open */}
        {mobileShowLedger && (
          <div className="rounded-2xl overflow-hidden flex flex-col"
            style={{ background: C.surface, border: `1px solid ${C.border}`, minHeight: 520 }}>
            {/* Back + export row */}
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: `1px solid ${C.border}` }}>
              <button onClick={() => { setMobileShowLedger(false); setSelectedAccId(null); }}
                className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: C.primary }}>
                <ArrowLeft size={14} /> All accounts
              </button>
              {selectedAccId && (
                <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs font-semibold"
                  style={{ color: C.textSecondary }}>
                  <Download size={12} /> Export
                </button>
              )}
            </div>
            <LedgerContent />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showDrawer && (
          <JournalEntryDrawer
            accounts={accounts}
            onClose={() => setShowDrawer(false)}
            onSaved={() => { setShowDrawer(false); loadLedger(); }}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
      </AnimatePresence>
    </Motion.div>
  );
}