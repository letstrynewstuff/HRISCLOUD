// // src/components/admin/payroll/RunPayrollView.tsx
// // RN port of RunPayroll.jsx — 4-step payroll wizard (Manual / Assisted).
// // Rendered as a full-screen child of the Payroll hub, same pattern as
// // LeaveRequestsView etc. in leave.tsx.

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   Pressable,
//   TextInput,
//   StyleSheet,
//   ActivityIndicator,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import {
//   ArrowRight,
//   ArrowLeft,
//   ChevronLeft,
//   CheckCircle2,
//   Download,
//   AlertCircle,
//   Users,
//   Zap,
//   ClipboardList,
//   Lock,
// } from "lucide-react-native";

// import C from "../../../styles/colors";
// import { usePayroll } from "./PayrollContext";
// import {
//   getRun,
//   getPaymentFile,
//   getDeductions,
// } from "../../../api/service/payrollApi";
// import SelectField from "./SelectField";
// import ModeCard from "./ModeCard";
// import FormatPicker from "./FormatPicker";
// import ApprovalGate from "./ApprovalGate";
// import { downloadBlobOrText } from "./downloadFile";

// const STEPS = [
//   "Mode & Period",
//   "Earnings Review",
//   "Deductions",
//   "Summary & Approve",
// ];
// const MONTHS = [
//   "January",
//   "February",
//   "March",
//   "April",
//   "May",
//   "June",
//   "July",
//   "August",
//   "September",
//   "October",
//   "November",
//   "December",
// ];
// const MONTH_OPTIONS = MONTHS.map((m, i) => ({ label: m, value: i + 1 }));

// const fmt = (n: any) => `₦${Number(n ?? 0).toLocaleString("en-NG")}`;
// const fmtM = (n: any) => {
//   const v = Number(n ?? 0);
//   return v >= 1_000_000 ? `₦${(v / 1_000_000).toFixed(2)}M` : fmt(v);
// };

// type Props = { onClose: () => void };

// export default function RunPayrollView({ onClose }: Props) {
//   const insets = useSafeAreaInsets();
//   const { startRun, runProcess, runApprove, runMarkPaid, mode, setMode } =
//     usePayroll();

//   const [currentStep, setCurrentStep] = useState(0);
//   const [selectedMode, setSelectedMode] = useState<"manual" | "assisted">(
//     mode ?? "manual",
//   );
//   const now = new Date();
//   const currentYear = now.getFullYear();
//   const [period, setPeriod] = useState({
//     month: now.getMonth() + 1,
//     year: currentYear,
//   });
//   const [notes, setNotes] = useState("");
//   const [activeRun, setActiveRun] = useState<any>(null);
//   const [runItems, setRunItems] = useState<any[]>([]);
//   const [deductions, setDeductions] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [downloadingCSV, setDownloadingCSV] = useState(false);
//   const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv");
//   const [approvals, setApprovals] = useState({
//     ceo: false,
//     finance: false,
//     hr: false,
//   });
//   const allApproved = Object.values(approvals).every(Boolean);

//   const YEAR_OPTIONS = [currentYear - 1, currentYear, currentYear + 1].map(
//     (y) => ({ label: String(y), value: y }),
//   );

//   useEffect(() => {
//     getDeductions()
//       .then((r: any) => setDeductions(r.data ?? []))
//       .catch(() => {});
//   }, []);

//   const totalGross = runItems.reduce(
//     (s, e) => s + Number(e.grossSalary ?? e.gross_salary ?? 0),
//     0,
//   );
//   const totalDeductions = runItems.reduce(
//     (s, e) => s + Number(e.totalDeductions ?? e.total_deductions ?? 0),
//     0,
//   );
//   const totalNet = runItems.reduce(
//     (s, e) => s + Number(e.netSalary ?? e.net_salary ?? 0),
//     0,
//   );

//   // ── STEP 0 → init run ──
//   const handleInit = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       setMode(selectedMode);
//       const run = await startRun({
//         month: period.month,
//         year: period.year,
//         mode: selectedMode,
//         notes,
//       });
//       setActiveRun(run);
//       setCurrentStep(1);
//     } catch (e: any) {
//       const status = e?.response?.status;
//       const body = e?.response?.data;
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

//   // ── STEP 1 → process ──
//   const handleProcess = async () => {
//     if (!activeRun?.id) {
//       setError("No active run — please go back to step 1.");
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       await runProcess(activeRun.id);
//       const full = await getRun(activeRun.id);
//       const run = full.run ?? full.data ?? full;
//       const recs = full.records ?? [];
//       setActiveRun(run);
//       setRunItems(recs);
//       setCurrentStep(2);
//     } catch (e: any) {
//       if (e?.isTimeout) {
//         try {
//           const full = await getRun(activeRun.id);
//           const run = full.run ?? full.data ?? full;
//           const recs = full.records ?? [];
//           if (run?.status && !["draft", "processing"].includes(run.status)) {
//             setActiveRun(run);
//             setRunItems(recs);
//             setCurrentStep(2);
//             return;
//           }
//           setError(
//             run?.status === "processing"
//               ? 'Still processing on the server — this can take a little longer for larger teams. Please wait, then tap "Process Payroll" again.'
//               : 'The request timed out before the server finished. Please tap "Process Payroll" again.',
//           );
//         } catch {
//           setError(e.message ?? "Processing failed.");
//         }
//       } else {
//         setError(e?.response?.data?.message ?? "Processing failed.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── STEP 2 → approve ──
//   const handleApprove = async () => {
//     if (!activeRun?.id) return;
//     setLoading(true);
//     setError(null);
//     try {
//       await runApprove(activeRun.id);
//       setCurrentStep(3);
//     } catch (e: any) {
//       setError(e?.response?.data?.message ?? "Approval failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── STEP 3 → mark paid ──
//   const handleMarkPaid = async () => {
//     if (!activeRun?.id) return;
//     if (!allApproved) {
//       setError("Please confirm all three approvals before finalising.");
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       await runMarkPaid(activeRun.id);
//       setShowSuccess(true);
//     } catch (e: any) {
//       setError(e?.response?.data?.message ?? "Mark paid failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Export download ──
//   const handleDownload = async () => {
//     if (!activeRun?.id) {
//       setError("No active run to export.");
//       return;
//     }
//     setDownloadingCSV(true);
//     setError(null);
//     try {
//       const data = await getPaymentFile(activeRun.id, exportFormat);
//       const ext = exportFormat === "pdf" ? "html" : "csv";
//       const filename = `payroll-${period.year}-${String(period.month).padStart(2, "0")}.${ext}`;
//       await downloadBlobOrText(data, filename);
//     } catch (e) {
//       setError("Download failed. Make sure the run has been processed first.");
//     } finally {
//       setDownloadingCSV(false);
//     }
//   };

//   const resetAndClose = () => {
//     setCurrentStep(0);
//     setActiveRun(null);
//     setRunItems([]);
//     setApprovals({ ceo: false, finance: false, hr: false });
//     setShowSuccess(false);
//     onClose();
//   };

//   // ── Success screen ──
//   if (showSuccess) {
//     return (
//       <View style={[styles.screen, { paddingTop: insets.top }]}>
//         <Header title="Payroll Finalised" onBack={resetAndClose} />
//         <ScrollView contentContainerStyle={styles.successWrap}>
//           <View style={styles.successIcon}>
//             <CheckCircle2 size={44} color={C.success} />
//           </View>
//           <Text style={styles.successTitle}>Payroll Finalised!</Text>
//           <Text style={styles.successSub}>
//             {MONTHS[period.month - 1]} {period.year} payroll —{" "}
//             {selectedMode === "assisted"
//               ? "payment file ready for bank upload"
//               : "marked as paid"}
//             .
//           </Text>
//           <Text style={styles.successMeta}>
//             {runItems.length} payslips generated · Net pay: {fmtM(totalNet)}
//           </Text>

//           {selectedMode === "assisted" && (
//             <View style={styles.exportCard}>
//               <FormatPicker value={exportFormat} onChange={setExportFormat} />
//               <Pressable
//                 onPress={handleDownload}
//                 disabled={downloadingCSV}
//                 style={[
//                   styles.primaryBtn,
//                   { opacity: downloadingCSV ? 0.7 : 1, marginTop: 12 },
//                 ]}
//               >
//                 {downloadingCSV ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <Download size={14} color="#fff" />
//                 )}
//                 <Text style={styles.primaryBtnText}>
//                   Download{" "}
//                   {exportFormat === "pdf" ? "PDF Report" : "Bank Transfer CSV"}
//                 </Text>
//               </Pressable>
//             </View>
//           )}

//           <Pressable onPress={resetAndClose} style={styles.secondaryBtn}>
//             <Text style={styles.secondaryBtnText}>Done</Text>
//           </Pressable>
//         </ScrollView>
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.screen, { paddingTop: insets.top }]}>
//       <Header title="Run Payroll" onBack={onClose} />

//       {/* Step progress */}
//       <View style={styles.progressRow}>
//         {STEPS.map((step, i) => (
//           <View key={step} style={{ flex: 1 }}>
//             <View
//               style={[
//                 styles.progressBar,
//                 { backgroundColor: i <= currentStep ? C.primary : "#E2E8F0" },
//               ]}
//             />
//           </View>
//         ))}
//       </View>
//       <Text style={styles.progressLabel}>{STEPS[currentStep]}</Text>

//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         {error && (
//           <View style={styles.errorBanner}>
//             <AlertCircle size={14} color={C.danger} />
//             <Text style={styles.errorText}>{error}</Text>
//             <Pressable onPress={() => setError(null)}>
//               <Text style={{ color: C.danger, fontWeight: "800" }}>✕</Text>
//             </Pressable>
//           </View>
//         )}

//         {/* ══ STEP 0 ══ */}
//         {currentStep === 0 && (
//           <View style={{ gap: 16 }}>
//             <View>
//               <Text style={styles.h2}>Select Payroll Mode</Text>
//               <Text style={styles.muted}>
//                 Choose how you'd like to process this payroll run.
//               </Text>
//             </View>

//             <View style={{ gap: 12 }}>
//               <ModeCard
//                 icon={ClipboardList}
//                 title="Manual Payroll"
//                 description="System calculates salaries. You pay staff directly via your bank. No file export needed."
//                 selected={selectedMode === "manual"}
//                 onPress={() => setSelectedMode("manual")}
//               />
//               <ModeCard
//                 icon={Zap}
//                 title="Assisted Payroll"
//                 badge="Recommended"
//                 description="System calculates payroll and generates a CSV bank transfer list or full PDF report."
//                 selected={selectedMode === "assisted"}
//                 onPress={() => setSelectedMode("assisted")}
//               />
//             </View>

//             <View style={styles.card}>
//               <Text style={styles.cardTitle}>Pay Period</Text>
//               <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
//                 <SelectField
//                   label="Month"
//                   value={period.month}
//                   options={MONTH_OPTIONS}
//                   onChange={(v) =>
//                     setPeriod((p) => ({ ...p, month: Number(v) }))
//                   }
//                 />
//                 <SelectField
//                   label="Year"
//                   value={period.year}
//                   options={YEAR_OPTIONS}
//                   onChange={(v) =>
//                     setPeriod((p) => ({ ...p, year: Number(v) }))
//                   }
//                 />
//               </View>
//               <View style={{ marginTop: 12 }}>
//                 <Text style={styles.label}>Notes (optional)</Text>
//                 <TextInput
//                   value={notes}
//                   onChangeText={setNotes}
//                   placeholder="e.g. Includes Q1 bonus"
//                   placeholderTextColor={C.textMuted}
//                   style={styles.input}
//                 />
//               </View>
//             </View>

//             <Pressable
//               onPress={handleInit}
//               disabled={loading}
//               style={[styles.primaryBtn, { opacity: loading ? 0.7 : 1 }]}
//             >
//               {loading ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <>
//                   <Text style={styles.primaryBtnText}>
//                     Start {selectedMode === "assisted" ? "Assisted" : "Manual"}{" "}
//                     Payroll Run
//                   </Text>
//                   <ArrowRight size={16} color="#fff" />
//                 </>
//               )}
//             </Pressable>
//           </View>
//         )}

//         {/* ══ STEP 1 ══ */}
//         {currentStep === 1 && (
//           <View style={{ gap: 16 }}>
//             <View>
//               <Text style={styles.h2}>Earnings Review</Text>
//               <Text style={styles.muted}>
//                 Tap "Process Payroll" to calculate all active employees.
//               </Text>
//             </View>

//             <View style={styles.infoBanner}>
//               <View style={styles.infoIcon}>
//                 <Users size={18} color="#fff" />
//               </View>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.infoTitle}>
//                   Run{" "}
//                   {activeRun?.status === "draft"
//                     ? "Ready"
//                     : (activeRun?.status ?? "Initiated")}{" "}
//                   — {MONTHS[period.month - 1]} {period.year}
//                 </Text>
//                 <Text style={styles.infoSub}>
//                   Mode: {selectedMode} · Run ID: {activeRun?.id?.slice(0, 8)}…
//                 </Text>
//               </View>
//             </View>

//             {runItems.length > 0 ? (
//               <View style={styles.card}>
//                 {runItems.slice(0, 10).map((emp, i) => (
//                   <View
//                     key={i}
//                     style={[styles.listRow, i > 0 && styles.listRowBorder]}
//                   >
//                     <Text style={styles.listName} numberOfLines={1}>
//                       {emp.employeeName ??
//                         emp.employee_name ??
//                         emp.employeeId ??
//                         "—"}
//                     </Text>
//                     <Text style={styles.listSub}>
//                       Basic {fmt(emp.basicSalary ?? emp.basic_salary)} · Housing{" "}
//                       {fmt(emp.housingAllowance ?? emp.housing_allowance)}
//                     </Text>
//                     <Text style={styles.listGross}>
//                       {fmt(emp.grossSalary ?? emp.gross_salary)}
//                     </Text>
//                   </View>
//                 ))}
//                 {runItems.length > 10 && (
//                   <Text style={styles.moreText}>
//                     …and {runItems.length - 10} more employees
//                   </Text>
//                 )}
//               </View>
//             ) : (
//               <View style={styles.emptyCard}>
//                 <Text style={styles.muted}>
//                   Tap "Process Payroll" to calculate all employee earnings.
//                 </Text>
//               </View>
//             )}

//             <View style={styles.btnRow}>
//               <Pressable
//                 onPress={() => setCurrentStep(0)}
//                 style={styles.secondaryBtnFlex}
//               >
//                 <ArrowLeft size={14} color={C.textSecondary} />
//                 <Text style={styles.secondaryBtnText}>Back</Text>
//               </Pressable>
//               <Pressable
//                 onPress={handleProcess}
//                 disabled={loading}
//                 style={[
//                   styles.primaryBtn,
//                   { flex: 2, opacity: loading ? 0.7 : 1 },
//                 ]}
//               >
//                 {loading ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <>
//                     <Text style={styles.primaryBtnText}>Process Payroll</Text>
//                     <ArrowRight size={14} color="#fff" />
//                   </>
//                 )}
//               </Pressable>
//             </View>
//           </View>
//         )}

//         {/* ══ STEP 2 ══ */}
//         {currentStep === 2 && (
//           <View style={{ gap: 16 }}>
//             <View>
//               <Text style={styles.h2}>Deductions Review</Text>
//               <Text style={styles.muted}>
//                 Active deductions applied to this run.
//               </Text>
//             </View>

//             <View style={styles.card}>
//               <Text style={styles.cardTitle}>Deductions Applied</Text>
//               {deductions.filter((d) => d.isActive ?? d.is_active).length ===
//               0 ? (
//                 <Text
//                   style={[styles.muted, { textAlign: "center", marginTop: 12 }]}
//                 >
//                   No active deductions configured.
//                 </Text>
//               ) : (
//                 deductions
//                   .filter((d) => d.isActive ?? d.is_active)
//                   .map((ded, i) => (
//                     <View
//                       key={i}
//                       style={[styles.listRow, i > 0 && styles.listRowBorder]}
//                     >
//                       <Text style={styles.listName}>{ded.name}</Text>
//                       <Text style={styles.listGross}>
//                         {ded.type === "percent"
//                           ? `${ded.value}%`
//                           : ded.type === "formula"
//                             ? "Auto"
//                             : fmt(ded.value)}
//                       </Text>
//                     </View>
//                   ))
//               )}
//             </View>

//             {runItems.length > 0 && (
//               <View style={styles.card}>
//                 <Text style={styles.cardTitle}>Employee Deduction Summary</Text>
//                 {runItems.slice(0, 8).map((emp, i) => (
//                   <View
//                     key={i}
//                     style={[styles.listRow, i > 0 && styles.listRowBorder]}
//                   >
//                     <Text style={styles.listName} numberOfLines={1}>
//                       {emp.employeeName ?? emp.employee_name ?? "—"}
//                     </Text>
//                     <Text style={styles.listSub}>
//                       Gross {fmt(emp.grossSalary ?? emp.gross_salary)}
//                     </Text>
//                     <Text style={[styles.listGross, { color: C.success }]}>
//                       {fmt(emp.netSalary ?? emp.net_salary)}
//                     </Text>
//                   </View>
//                 ))}
//               </View>
//             )}

//             <View style={styles.btnRow}>
//               <Pressable
//                 onPress={() => setCurrentStep(1)}
//                 style={styles.secondaryBtnFlex}
//               >
//                 <ArrowLeft size={14} color={C.textSecondary} />
//                 <Text style={styles.secondaryBtnText}>Back</Text>
//               </Pressable>
//               <Pressable
//                 onPress={handleApprove}
//                 disabled={loading}
//                 style={[
//                   styles.primaryBtn,
//                   { flex: 2, opacity: loading ? 0.7 : 1 },
//                 ]}
//               >
//                 {loading ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <>
//                     <Text style={styles.primaryBtnText}>
//                       Approve & Continue
//                     </Text>
//                     <ArrowRight size={14} color="#fff" />
//                   </>
//                 )}
//               </Pressable>
//             </View>
//           </View>
//         )}

//         {/* ══ STEP 3 ══ */}
//         {currentStep === 3 && (
//           <View style={{ gap: 16 }}>
//             <View>
//               <Text style={styles.h2}>Payroll Summary & Approval</Text>
//               <Text style={styles.muted}>
//                 Download the summary, get sign-off, then finalise.
//               </Text>
//             </View>

//             <View style={{ gap: 10 }}>
//               {[
//                 {
//                   label: "Gross Payroll",
//                   value: fmtM(activeRun?.totalGross ?? totalGross),
//                   color: C.primary,
//                   bg: C.primaryLight,
//                 },
//                 {
//                   label: "Total Deductions",
//                   value: fmtM(activeRun?.totalDeductions ?? totalDeductions),
//                   color: C.danger,
//                   bg: C.dangerLight,
//                 },
//                 {
//                   label: "Net Pay",
//                   value: fmtM(activeRun?.totalNet ?? totalNet),
//                   color: C.success,
//                   bg: C.successLight,
//                 },
//               ].map((kpi) => (
//                 <View
//                   key={kpi.label}
//                   style={[styles.kpiCard, { backgroundColor: kpi.bg }]}
//                 >
//                   <Text style={[styles.kpiLabel, { color: kpi.color }]}>
//                     {kpi.label}
//                   </Text>
//                   <Text style={[styles.kpiValue, { color: kpi.color }]}>
//                     {kpi.value}
//                   </Text>
//                 </View>
//               ))}
//             </View>

//             <Text style={[styles.muted, { textAlign: "center" }]}>
//               {runItems.length} employees · {MONTHS[period.month - 1]}{" "}
//               {period.year}
//             </Text>

//             <View style={styles.card}>
//               <Text style={styles.cardTitle}>
//                 Download payroll summary for approvers
//               </Text>
//               <Text style={[styles.muted, { marginBottom: 12 }]}>
//                 Share this file with CEO, Finance, and HR so they can review
//                 totals before signing off.
//               </Text>
//               <FormatPicker value={exportFormat} onChange={setExportFormat} />
//               <Pressable
//                 onPress={handleDownload}
//                 disabled={downloadingCSV}
//                 style={[
//                   styles.outlineBtn,
//                   { opacity: downloadingCSV ? 0.7 : 1, marginTop: 12 },
//                 ]}
//               >
//                 {downloadingCSV ? (
//                   <ActivityIndicator color={C.primary} />
//                 ) : (
//                   <Download size={14} color={C.primary} />
//                 )}
//                 <Text style={styles.outlineBtnText}>
//                   Download{" "}
//                   {exportFormat === "pdf" ? "PDF Report" : "Bank Transfer CSV"}{" "}
//                   for Review
//                 </Text>
//               </Pressable>
//             </View>

//             <ApprovalGate
//               checked={approvals}
//               onChange={(id, val) =>
//                 setApprovals((prev) => ({ ...prev, [id]: val }))
//               }
//             />

//             <View style={styles.noteCard}>
//               <Text style={styles.noteTitle}>After finalising:</Text>
//               {selectedMode === "assisted" ? (
//                 <>
//                   <Text style={styles.noteText}>
//                     For CSV — log into your bank portal and upload the transfer
//                     file.
//                   </Text>
//                   <Text style={styles.noteText}>
//                     Return and tap "Mark as Paid" after the bank confirms
//                     transfers.
//                   </Text>
//                 </>
//               ) : (
//                 <Text style={styles.noteText}>
//                   Transfer salaries individually via your bank, then tap "Mark
//                   as Paid".
//                 </Text>
//               )}
//             </View>

//             <Pressable
//               onPress={handleMarkPaid}
//               disabled={loading || !allApproved}
//               style={[
//                 styles.primaryBtn,
//                 {
//                   backgroundColor: allApproved ? C.success : C.border,
//                   opacity: loading ? 0.8 : 1,
//                 },
//               ]}
//             >
//               {loading ? (
//                 <ActivityIndicator color="#fff" />
//               ) : allApproved ? (
//                 <>
//                   <CheckCircle2 size={18} color="#fff" />
//                   <Text style={styles.primaryBtnText}>
//                     Finalise & Generate Payslips
//                   </Text>
//                 </>
//               ) : (
//                 <>
//                   <Lock size={16} color={C.textMuted} />
//                   <Text style={[styles.primaryBtnText, { color: C.textMuted }]}>
//                     Confirm all approvals to finalise
//                   </Text>
//                 </>
//               )}
//             </Pressable>
//           </View>
//         )}

//         <View style={{ height: 32 }} />
//       </ScrollView>
//     </View>
//   );
// }

// function Header({ title, onBack }: { title: string; onBack: () => void }) {
//   return (
//     <View style={styles.header}>
//       <Pressable onPress={onBack} style={styles.headerBack}>
//         <ChevronLeft size={20} color={C.textSecondary} />
//       </Pressable>
//       <Text style={styles.headerTitle}>{title}</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1, backgroundColor: C.bg },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: C.border,
//     backgroundColor: C.bg,
//   },
//   headerBack: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   headerTitle: { fontSize: 17, fontWeight: "800", color: C.textPrimary },
//   progressRow: {
//     flexDirection: "row",
//     gap: 6,
//     paddingHorizontal: 16,
//     paddingTop: 14,
//   },
//   progressBar: { height: 5, borderRadius: 999 },
//   progressLabel: {
//     fontSize: 11,
//     fontWeight: "700",
//     color: C.primary,
//     paddingHorizontal: 16,
//     marginTop: 6,
//   },
//   scrollContent: { padding: 16, paddingBottom: 32 },
//   h2: {
//     fontSize: 19,
//     fontWeight: "800",
//     color: C.textPrimary,
//     marginBottom: 2,
//   },
//   muted: { fontSize: 12, color: C.textMuted },
//   label: {
//     fontSize: 12,
//     fontWeight: "700",
//     color: C.textPrimary,
//     marginBottom: 6,
//   },
//   input: {
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1.5,
//     borderColor: C.border,
//     borderRadius: 12,
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     fontSize: 14,
//     color: C.textPrimary,
//   },
//   card: {
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     borderRadius: 18,
//     padding: 16,
//   },
//   cardTitle: { fontSize: 13, fontWeight: "800", color: C.textPrimary },
//   emptyCard: {
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     borderRadius: 18,
//     padding: 28,
//     alignItems: "center",
//   },
//   errorBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     padding: 12,
//     borderRadius: 14,
//     backgroundColor: C.dangerLight,
//     borderWidth: 1,
//     borderColor: `${C.danger}33`,
//     marginBottom: 14,
//   },
//   errorText: { flex: 1, fontSize: 12, color: C.danger },
//   infoBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     padding: 16,
//     borderRadius: 18,
//     backgroundColor: C.primaryLight,
//     borderWidth: 1,
//     borderColor: `${C.primary}22`,
//   },
//   infoIcon: {
//     width: 38,
//     height: 38,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.primary,
//   },
//   infoTitle: { fontSize: 13, fontWeight: "700", color: C.primary },
//   infoSub: { fontSize: 11, color: C.textMuted, marginTop: 2 },
//   listRow: { paddingVertical: 10 },
//   listRowBorder: { borderTopWidth: 1, borderTopColor: C.border },
//   listName: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
//   listSub: { fontSize: 11, color: C.textMuted, marginTop: 2 },
//   listGross: {
//     fontSize: 13,
//     fontWeight: "800",
//     color: C.primary,
//     marginTop: 2,
//   },
//   moreText: {
//     fontSize: 11,
//     color: C.textMuted,
//     marginTop: 8,
//     textAlign: "center",
//   },
//   btnRow: { flexDirection: "row", gap: 10 },
//   primaryBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     backgroundColor: C.primary,
//     paddingVertical: 15,
//     borderRadius: 14,
//   },
//   primaryBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
//   secondaryBtn: {
//     alignSelf: "center",
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 14,
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//     marginTop: 20,
//   },
//   secondaryBtnFlex: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     paddingVertical: 15,
//     borderRadius: 14,
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   secondaryBtnText: { fontSize: 13, fontWeight: "700", color: C.textSecondary },
//   outlineBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     paddingVertical: 14,
//     borderRadius: 14,
//     borderWidth: 2,
//     borderColor: C.primary,
//   },
//   outlineBtnText: { fontSize: 13, fontWeight: "800", color: C.primary },
//   kpiCard: { borderRadius: 18, padding: 18, alignItems: "center" },
//   kpiLabel: { fontSize: 12, fontWeight: "600" },
//   kpiValue: { fontSize: 24, fontWeight: "800", marginTop: 4 },
//   noteCard: {
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//     borderRadius: 14,
//     padding: 14,
//     gap: 4,
//   },
//   noteTitle: {
//     fontSize: 12,
//     fontWeight: "800",
//     color: C.textPrimary,
//     marginBottom: 2,
//   },
//   noteText: { fontSize: 11, color: C.textSecondary, lineHeight: 16 },
//   successWrap: { alignItems: "center", padding: 24, paddingTop: 40 },
//   successIcon: {
//     width: 84,
//     height: 84,
//     borderRadius: 42,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.successLight,
//   },
//   successTitle: {
//     fontSize: 22,
//     fontWeight: "800",
//     color: C.textPrimary,
//     marginTop: 16,
//   },
//   successSub: {
//     fontSize: 13,
//     color: C.textSecondary,
//     marginTop: 6,
//     textAlign: "center",
//   },
//   successMeta: { fontSize: 11, color: C.textMuted, marginTop: 4 },
//   exportCard: {
//     width: "100%",
//     maxWidth: 380,
//     marginTop: 20,
//     padding: 18,
//     borderRadius: 18,
//     borderWidth: 1,
//     borderColor: C.border,
//     backgroundColor: C.surface,
//   },
// });



// src/components/admin/payroll/RunPayrollView.tsx
// RN port of RunPayroll.jsx — 4-step payroll wizard (Manual / Assisted).
// Rendered as a full-screen child of the Payroll hub, same pattern as
// LeaveRequestsView etc. in leave.tsx.

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  CheckCircle2,
  Download,
  AlertCircle,
  Users,
  Zap,
  ClipboardList,
  Lock,
} from "lucide-react-native";

import C from "../../../styles/colors";
import { Loader } from "../../../hooks/loaderManager";
import { usePayroll } from "./PayrollContext";
import {
  getRun,
  getPaymentFile,
  getDeductions,
} from "../../../api/service/payrollApi";
import SelectField from "./SelectField";
import ModeCard from "./ModeCard";
import FormatPicker from "./FormatPicker";
import ApprovalGate from "./ApprovalGate";
import { downloadBlobOrText } from "./downloadFile";

const STEPS = [
  "Mode & Period",
  "Earnings Review",
  "Deductions",
  "Summary & Approve",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTH_OPTIONS = MONTHS.map((m, i) => ({ label: m, value: i + 1 }));

const fmt = (n: any) => `₦${Number(n ?? 0).toLocaleString("en-NG")}`;
const fmtM = (n: any) => {
  const v = Number(n ?? 0);
  return v >= 1_000_000 ? `₦${(v / 1_000_000).toFixed(2)}M` : fmt(v);
};

type Props = { onClose: () => void };

export default function RunPayrollView({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { startRun, runProcess, runApprove, runMarkPaid, mode, setMode } =
    usePayroll();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState<"manual" | "assisted">(
    mode ?? "manual",
  );
  const now = new Date();
  const currentYear = now.getFullYear();
  const [period, setPeriod] = useState({
    month: now.getMonth() + 1,
    year: currentYear,
  });
  const [notes, setNotes] = useState("");
  const [activeRun, setActiveRun] = useState<any>(null);
  const [runItems, setRunItems] = useState<any[]>([]);
  const [deductions, setDeductions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv");
  const [approvals, setApprovals] = useState({
    ceo: false,
    finance: false,
    hr: false,
  });
  const allApproved = Object.values(approvals).every(Boolean);

  const YEAR_OPTIONS = [currentYear - 1, currentYear, currentYear + 1].map(
    (y) => ({ label: String(y), value: y }),
  );

  useEffect(() => {
    Loader.show();
    getDeductions()
      .then((r: any) => setDeductions(r.data ?? []))
      .catch(() => {})
      .finally(() => Loader.hide());
  }, []);

  const totalGross = runItems.reduce(
    (s, e) => s + Number(e.grossSalary ?? e.gross_salary ?? 0),
    0,
  );
  const totalDeductions = runItems.reduce(
    (s, e) => s + Number(e.totalDeductions ?? e.total_deductions ?? 0),
    0,
  );
  const totalNet = runItems.reduce(
    (s, e) => s + Number(e.netSalary ?? e.net_salary ?? 0),
    0,
  );

  // ── STEP 0 → init run ──
  const handleInit = async () => {
    setLoading(true);
    setError(null);
    Loader.show();
    try {
      setMode(selectedMode);
      const run = await startRun({
        month: period.month,
        year: period.year,
        mode: selectedMode,
        notes,
      });
      setActiveRun(run);
      setCurrentStep(1);
    } catch (e: any) {
      const status = e?.response?.status;
      const body = e?.response?.data;
      if (status === 409 && body?.data?.id) {
        setActiveRun(body.data);
        setError(null);
        setCurrentStep(1);
      } else {
        setError(body?.message ?? "Failed to initialise run.");
      }
    } finally {
      setLoading(false);
      Loader.hide();
    }
  };

  // ── STEP 1 → process ──
  const handleProcess = async () => {
    if (!activeRun?.id) {
      setError("No active run — please go back to step 1.");
      return;
    }
    setLoading(true);
    setError(null);
    Loader.show();
    try {
      await runProcess(activeRun.id);
      const full = await getRun(activeRun.id);
      const run = full.run ?? full.data ?? full;
      const recs = full.records ?? [];
      setActiveRun(run);
      setRunItems(recs);
      setCurrentStep(2);
    } catch (e: any) {
      if (e?.isTimeout) {
        try {
          const full = await getRun(activeRun.id);
          const run = full.run ?? full.data ?? full;
          const recs = full.records ?? [];
          if (run?.status && !["draft", "processing"].includes(run.status)) {
            setActiveRun(run);
            setRunItems(recs);
            setCurrentStep(2);
            return;
          }
          setError(
            run?.status === "processing"
              ? 'Still processing on the server — this can take a little longer for larger teams. Please wait, then tap "Process Payroll" again.'
              : 'The request timed out before the server finished. Please tap "Process Payroll" again.',
          );
        } catch {
          setError(e.message ?? "Processing failed.");
        }
      } else {
        setError(e?.response?.data?.message ?? "Processing failed.");
      }
    } finally {
      setLoading(false);
      Loader.hide();
    }
  };

  // ── STEP 2 → approve ──
  const handleApprove = async () => {
    if (!activeRun?.id) return;
    setLoading(true);
    setError(null);
    Loader.show();
    try {
      await runApprove(activeRun.id);
      setCurrentStep(3);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Approval failed.");
    } finally {
      setLoading(false);
      Loader.hide();
    }
  };

  // ── STEP 3 → mark paid ──
  const handleMarkPaid = async () => {
    if (!activeRun?.id) return;
    if (!allApproved) {
      setError("Please confirm all three approvals before finalising.");
      return;
    }
    setLoading(true);
    setError(null);
    Loader.show();
    try {
      await runMarkPaid(activeRun.id);
      setShowSuccess(true);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Mark paid failed.");
    } finally {
      setLoading(false);
      Loader.hide();
    }
  };

  // ── Export download ──
  const handleDownload = async () => {
    if (!activeRun?.id) {
      setError("No active run to export.");
      return;
    }
    setDownloadingCSV(true);
    setError(null);
    Loader.show();
    try {
      const data = await getPaymentFile(activeRun.id, exportFormat);
      const ext = exportFormat === "pdf" ? "html" : "csv";
      const filename = `payroll-${period.year}-${String(period.month).padStart(2, "0")}.${ext}`;
      await downloadBlobOrText(data, filename);
    } catch (e) {
      setError("Download failed. Make sure the run has been processed first.");
    } finally {
      setDownloadingCSV(false);
      Loader.hide();
    }
  };

  const resetAndClose = () => {
    setCurrentStep(0);
    setActiveRun(null);
    setRunItems([]);
    setApprovals({ ceo: false, finance: false, hr: false });
    setShowSuccess(false);
    onClose();
  };

  // ── Success screen ──
  if (showSuccess) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Header title="Payroll Finalised" onBack={resetAndClose} />
        <ScrollView contentContainerStyle={styles.successWrap}>
          <View style={styles.successIcon}>
            <CheckCircle2 size={44} color={C.success} />
          </View>
          <Text style={styles.successTitle}>Payroll Finalised!</Text>
          <Text style={styles.successSub}>
            {MONTHS[period.month - 1]} {period.year} payroll —{" "}
            {selectedMode === "assisted"
              ? "payment file ready for bank upload"
              : "marked as paid"}
            .
          </Text>
          <Text style={styles.successMeta}>
            {runItems.length} payslips generated · Net pay: {fmtM(totalNet)}
          </Text>

          {selectedMode === "assisted" && (
            <View style={styles.exportCard}>
              <FormatPicker value={exportFormat} onChange={setExportFormat} />
              <Pressable
                onPress={handleDownload}
                disabled={downloadingCSV}
                style={[
                  styles.primaryBtn,
                  { opacity: downloadingCSV ? 0.7 : 1, marginTop: 12 },
                ]}
              >
                {downloadingCSV ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Download size={14} color="#fff" />
                )}
                <Text style={styles.primaryBtnText}>
                  Download{" "}
                  {exportFormat === "pdf" ? "PDF Report" : "Bank Transfer CSV"}
                </Text>
              </Pressable>
            </View>
          )}

          <Pressable onPress={resetAndClose} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Done</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="Run Payroll" onBack={onClose} />

      {/* Step progress */}
      <View style={styles.progressRow}>
        {STEPS.map((step, i) => (
          <View key={step} style={{ flex: 1 }}>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: i <= currentStep ? C.primary : "#E2E8F0" },
              ]}
            />
          </View>
        ))}
      </View>
      <Text style={styles.progressLabel}>{STEPS[currentStep]}</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {error && (
          <View style={styles.errorBanner}>
            <AlertCircle size={14} color={C.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => setError(null)}>
              <Text style={{ color: C.danger, fontWeight: "800" }}>✕</Text>
            </Pressable>
          </View>
        )}

        {/* ══ STEP 0 ══ */}
        {currentStep === 0 && (
          <View style={{ gap: 16 }}>
            <View>
              <Text style={styles.h2}>Select Payroll Mode</Text>
              <Text style={styles.muted}>
                Choose how you'd like to process this payroll run.
              </Text>
            </View>

            <View style={{ gap: 12 }}>
              <ModeCard
                icon={ClipboardList}
                title="Manual Payroll"
                description="System calculates salaries. You pay staff directly via your bank. No file export needed."
                selected={selectedMode === "manual"}
                onPress={() => setSelectedMode("manual")}
              />
              <ModeCard
                icon={Zap}
                title="Assisted Payroll"
                badge="Recommended"
                description="System calculates payroll and generates a CSV bank transfer list or full PDF report."
                selected={selectedMode === "assisted"}
                onPress={() => setSelectedMode("assisted")}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Pay Period</Text>
              <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
                <SelectField
                  label="Month"
                  value={period.month}
                  options={MONTH_OPTIONS}
                  onChange={(v) =>
                    setPeriod((p) => ({ ...p, month: Number(v) }))
                  }
                />
                <SelectField
                  label="Year"
                  value={period.year}
                  options={YEAR_OPTIONS}
                  onChange={(v) =>
                    setPeriod((p) => ({ ...p, year: Number(v) }))
                  }
                />
              </View>
              <View style={{ marginTop: 12 }}>
                <Text style={styles.label}>Notes (optional)</Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="e.g. Includes Q1 bonus"
                  placeholderTextColor={C.textMuted}
                  style={styles.input}
                />
              </View>
            </View>

            <Pressable
              onPress={handleInit}
              disabled={loading}
              style={[styles.primaryBtn, { opacity: loading ? 0.7 : 1 }]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>
                    Start {selectedMode === "assisted" ? "Assisted" : "Manual"}{" "}
                    Payroll Run
                  </Text>
                  <ArrowRight size={16} color="#fff" />
                </>
              )}
            </Pressable>
          </View>
        )}

        {/* ══ STEP 1 ══ */}
        {currentStep === 1 && (
          <View style={{ gap: 16 }}>
            <View>
              <Text style={styles.h2}>Earnings Review</Text>
              <Text style={styles.muted}>
                Tap "Process Payroll" to calculate all active employees.
              </Text>
            </View>

            <View style={styles.infoBanner}>
              <View style={styles.infoIcon}>
                <Users size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>
                  Run{" "}
                  {activeRun?.status === "draft"
                    ? "Ready"
                    : (activeRun?.status ?? "Initiated")}{" "}
                  — {MONTHS[period.month - 1]} {period.year}
                </Text>
                <Text style={styles.infoSub}>
                  Mode: {selectedMode} · Run ID: {activeRun?.id?.slice(0, 8)}…
                </Text>
              </View>
            </View>

            {runItems.length > 0 ? (
              <View style={styles.card}>
                {runItems.slice(0, 10).map((emp, i) => (
                  <View
                    key={i}
                    style={[styles.listRow, i > 0 && styles.listRowBorder]}
                  >
                    <Text style={styles.listName} numberOfLines={1}>
                      {emp.employeeName ??
                        emp.employee_name ??
                        emp.employeeId ??
                        "—"}
                    </Text>
                    <Text style={styles.listSub}>
                      Basic {fmt(emp.basicSalary ?? emp.basic_salary)} · Housing{" "}
                      {fmt(emp.housingAllowance ?? emp.housing_allowance)}
                    </Text>
                    <Text style={styles.listGross}>
                      {fmt(emp.grossSalary ?? emp.gross_salary)}
                    </Text>
                  </View>
                ))}
                {runItems.length > 10 && (
                  <Text style={styles.moreText}>
                    …and {runItems.length - 10} more employees
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.muted}>
                  Tap "Process Payroll" to calculate all employee earnings.
                </Text>
              </View>
            )}

            <View style={styles.btnRow}>
              <Pressable
                onPress={() => setCurrentStep(0)}
                style={styles.secondaryBtnFlex}
              >
                <ArrowLeft size={14} color={C.textSecondary} />
                <Text style={styles.secondaryBtnText}>Back</Text>
              </Pressable>
              <Pressable
                onPress={handleProcess}
                disabled={loading}
                style={[
                  styles.primaryBtn,
                  { flex: 2, opacity: loading ? 0.7 : 1 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Process Payroll</Text>
                    <ArrowRight size={14} color="#fff" />
                  </>
                )}
              </Pressable>
            </View>
          </View>
        )}

        {/* ══ STEP 2 ══ */}
        {currentStep === 2 && (
          <View style={{ gap: 16 }}>
            <View>
              <Text style={styles.h2}>Deductions Review</Text>
              <Text style={styles.muted}>
                Active deductions applied to this run.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Deductions Applied</Text>
              {deductions.filter((d) => d.isActive ?? d.is_active).length ===
              0 ? (
                <Text
                  style={[styles.muted, { textAlign: "center", marginTop: 12 }]}
                >
                  No active deductions configured.
                </Text>
              ) : (
                deductions
                  .filter((d) => d.isActive ?? d.is_active)
                  .map((ded, i) => (
                    <View
                      key={i}
                      style={[styles.listRow, i > 0 && styles.listRowBorder]}
                    >
                      <Text style={styles.listName}>{ded.name}</Text>
                      <Text style={styles.listGross}>
                        {ded.type === "percent"
                          ? `${ded.value}%`
                          : ded.type === "formula"
                            ? "Auto"
                            : fmt(ded.value)}
                      </Text>
                    </View>
                  ))
              )}
            </View>

            {runItems.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Employee Deduction Summary</Text>
                {runItems.slice(0, 8).map((emp, i) => (
                  <View
                    key={i}
                    style={[styles.listRow, i > 0 && styles.listRowBorder]}
                  >
                    <Text style={styles.listName} numberOfLines={1}>
                      {emp.employeeName ?? emp.employee_name ?? "—"}
                    </Text>
                    <Text style={styles.listSub}>
                      Gross {fmt(emp.grossSalary ?? emp.gross_salary)}
                    </Text>
                    <Text style={[styles.listGross, { color: C.success }]}>
                      {fmt(emp.netSalary ?? emp.net_salary)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.btnRow}>
              <Pressable
                onPress={() => setCurrentStep(1)}
                style={styles.secondaryBtnFlex}
              >
                <ArrowLeft size={14} color={C.textSecondary} />
                <Text style={styles.secondaryBtnText}>Back</Text>
              </Pressable>
              <Pressable
                onPress={handleApprove}
                disabled={loading}
                style={[
                  styles.primaryBtn,
                  { flex: 2, opacity: loading ? 0.7 : 1 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>
                      Approve & Continue
                    </Text>
                    <ArrowRight size={14} color="#fff" />
                  </>
                )}
              </Pressable>
            </View>
          </View>
        )}

        {/* ══ STEP 3 ══ */}
        {currentStep === 3 && (
          <View style={{ gap: 16 }}>
            <View>
              <Text style={styles.h2}>Payroll Summary & Approval</Text>
              <Text style={styles.muted}>
                Download the summary, get sign-off, then finalise.
              </Text>
            </View>

            <View style={{ gap: 10 }}>
              {[
                {
                  label: "Gross Payroll",
                  value: fmtM(activeRun?.totalGross ?? totalGross),
                  color: C.primary,
                  bg: C.primaryLight,
                },
                {
                  label: "Total Deductions",
                  value: fmtM(activeRun?.totalDeductions ?? totalDeductions),
                  color: C.danger,
                  bg: C.dangerLight,
                },
                {
                  label: "Net Pay",
                  value: fmtM(activeRun?.totalNet ?? totalNet),
                  color: C.success,
                  bg: C.successLight,
                },
              ].map((kpi) => (
                <View
                  key={kpi.label}
                  style={[styles.kpiCard, { backgroundColor: kpi.bg }]}
                >
                  <Text style={[styles.kpiLabel, { color: kpi.color }]}>
                    {kpi.label}
                  </Text>
                  <Text style={[styles.kpiValue, { color: kpi.color }]}>
                    {kpi.value}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={[styles.muted, { textAlign: "center" }]}>
              {runItems.length} employees · {MONTHS[period.month - 1]}{" "}
              {period.year}
            </Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Download payroll summary for approvers
              </Text>
              <Text style={[styles.muted, { marginBottom: 12 }]}>
                Share this file with CEO, Finance, and HR so they can review
                totals before signing off.
              </Text>
              <FormatPicker value={exportFormat} onChange={setExportFormat} />
              <Pressable
                onPress={handleDownload}
                disabled={downloadingCSV}
                style={[
                  styles.outlineBtn,
                  { opacity: downloadingCSV ? 0.7 : 1, marginTop: 12 },
                ]}
              >
                {downloadingCSV ? (
                  <ActivityIndicator color={C.primary} />
                ) : (
                  <Download size={14} color={C.primary} />
                )}
                <Text style={styles.outlineBtnText}>
                  Download{" "}
                  {exportFormat === "pdf" ? "PDF Report" : "Bank Transfer CSV"}{" "}
                  for Review
                </Text>
              </Pressable>
            </View>

            <ApprovalGate
              checked={approvals}
              onChange={(id, val) =>
                setApprovals((prev) => ({ ...prev, [id]: val }))
              }
            />

            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>After finalising:</Text>
              {selectedMode === "assisted" ? (
                <>
                  <Text style={styles.noteText}>
                    For CSV — log into your bank portal and upload the transfer
                    file.
                  </Text>
                  <Text style={styles.noteText}>
                    Return and tap "Mark as Paid" after the bank confirms
                    transfers.
                  </Text>
                </>
              ) : (
                <Text style={styles.noteText}>
                  Transfer salaries individually via your bank, then tap "Mark
                  as Paid".
                </Text>
              )}
            </View>

            <Pressable
              onPress={handleMarkPaid}
              disabled={loading || !allApproved}
              style={[
                styles.primaryBtn,
                {
                  backgroundColor: allApproved ? C.success : C.border,
                  opacity: loading ? 0.8 : 1,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : allApproved ? (
                <>
                  <CheckCircle2 size={18} color="#fff" />
                  <Text style={styles.primaryBtnText}>
                    Finalise & Generate Payslips
                  </Text>
                </>
              ) : (
                <>
                  <Lock size={16} color={C.textMuted} />
                  <Text style={[styles.primaryBtnText, { color: C.textMuted }]}>
                    Confirm all approvals to finalise
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.headerBack}>
        <ChevronLeft size={20} color={C.textSecondary} />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.bg,
  },
  headerBack: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  headerTitle: { fontSize: 17, fontWeight: "800", color: C.textPrimary },
  progressRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  progressBar: { height: 5, borderRadius: 999 },
  progressLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.primary,
    paddingHorizontal: 16,
    marginTop: 6,
  },
  scrollContent: { padding: 16, paddingBottom: 32 },
  h2: {
    fontSize: 19,
    fontWeight: "800",
    color: C.textPrimary,
    marginBottom: 2,
  },
  muted: { fontSize: 12, color: C.textMuted },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: C.textPrimary,
  },
  card: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: 16,
  },
  cardTitle: { fontSize: 13, fontWeight: "800", color: C.textPrimary },
  emptyCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.dangerLight,
    borderWidth: 1,
    borderColor: `${C.danger}33`,
    marginBottom: 14,
  },
  errorText: { flex: 1, fontSize: 12, color: C.danger },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: `${C.primary}22`,
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
  },
  infoTitle: { fontSize: 13, fontWeight: "700", color: C.primary },
  infoSub: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  listRow: { paddingVertical: 10 },
  listRowBorder: { borderTopWidth: 1, borderTopColor: C.border },
  listName: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  listSub: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  listGross: {
    fontSize: 13,
    fontWeight: "800",
    color: C.primary,
    marginTop: 2,
  },
  moreText: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 8,
    textAlign: "center",
  },
  btnRow: { flexDirection: "row", gap: 10 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.primary,
    paddingVertical: 15,
    borderRadius: 14,
  },
  primaryBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  secondaryBtn: {
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
    marginTop: 20,
  },
  secondaryBtnFlex: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  secondaryBtnText: { fontSize: 13, fontWeight: "700", color: C.textSecondary },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: C.primary,
  },
  outlineBtnText: { fontSize: 13, fontWeight: "800", color: C.primary },
  kpiCard: { borderRadius: 18, padding: 18, alignItems: "center" },
  kpiLabel: { fontSize: 12, fontWeight: "600" },
  kpiValue: { fontSize: 24, fontWeight: "800", marginTop: 4 },
  noteCard: {
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  noteTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: C.textPrimary,
    marginBottom: 2,
  },
  noteText: { fontSize: 11, color: C.textSecondary, lineHeight: 16 },
  successWrap: { alignItems: "center", padding: 24, paddingTop: 40 },
  successIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.successLight,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: C.textPrimary,
    marginTop: 16,
  },
  successSub: {
    fontSize: 13,
    color: C.textSecondary,
    marginTop: 6,
    textAlign: "center",
  },
  successMeta: { fontSize: 11, color: C.textMuted, marginTop: 4 },
  exportCard: {
    width: "100%",
    maxWidth: 380,
    marginTop: 20,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
});