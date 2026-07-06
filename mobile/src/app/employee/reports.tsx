// // src/app/employee/reports.tsx
// // Employee Reports screen — submit a new HR report and track the status of
// // reports already filed. Mirrors the mobile conventions used across the
// // employee/admin screens (header + back button, MobileFormField/MobileSelect,
// // success modal, pull-to-refresh) and reuses the shared report primitives
// // from src/components/admin/reports/reportShared.tsx (badges, formatters,
// // category/severity options) since that file is explicitly designed to be
// // shared between the admin and employee report screens.
// //
// // Assumed reportApi surface (in addition to the admin methods already used
// // by ReportsListView/ReportDetailView):
// //   reportApi.myReports({ page, limit })  -> { data, meta }
// //   reportApi.create(payload)             -> { data }
// //   reportApi.getReport(id)               -> { data }   (already used on admin side)

// import { useCallback, useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   Pressable,
//   TextInput,
//   Switch,
//   ActivityIndicator,
//   RefreshControl,
//   Modal,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { router } from "expo-router";
// import {
//   ChevronLeft,
//   Plus,
//   ShieldAlert,
//   RefreshCw,
//   Send,
//   Lock,
//   AlertCircle,
//   CheckCircle2,
//   X,
//   Calendar,
//   MapPin,
//   Users,
//   Target,
//   FileText,
//   MessageSquarePlus,
//   ChevronRight,
// } from "lucide-react-native";

// import C from "../../styles/colors";
// import { reportApi } from "../../api/service/reportApi";
// import MobileFormField from "../../components/admin/employee/MobileFormField";
// import MobileSelect from "../../components/admin/employee/MobileSelect";
// import {
//   CATEGORY_OPTIONS,
//   SEVERITY_OPTIONS,
//   CategoryPill,
//   SeverityBadge,
//   StatusBadge,
//   ReportAvatar,
//   getInitials,
//   fmtDate,
//   fmtDateTime,
// } from "../../components/admin/reports/reportShared";

// type ViewMode = "list" | "new" | "detail";

// const EMPTY_FORM = {
//   category: "",
//   severity: "medium",
//   subject: "",
//   description: "",
//   incidentDate: "",
//   location: "",
//   involvedParties: "",
//   witnesses: "",
//   desiredOutcome: "",
//   isAnonymous: false,
// };

// const PAGE_SIZE = 15;

// export default function EmployeeReportsScreen() {
//   const insets = useSafeAreaInsets();

//   const [view, setView] = useState<ViewMode>("list");
//   const [selectedId, setSelectedId] = useState<string | null>(null);

//   // ── list state ──
//   const [reports, setReports] = useState<any[]>([]);
//   const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [page, setPage] = useState(1);

//   // ── detail state ──
//   const [detail, setDetail] = useState<any | null>(null);
//   const [detailLoading, setDetailLoading] = useState(false);
//   const [detailError, setDetailError] = useState<string | null>(null);

//   // ── form state ──
//   const [form, setForm] = useState(EMPTY_FORM);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [submitting, setSubmitting] = useState(false);
//   const [submitError, setSubmitError] = useState<string | null>(null);
//   const [successModal, setSuccessModal] = useState(false);
//   const [createdRef, setCreatedRef] = useState<string | null>(null);

//   const [toast, setToast] = useState<{
//     msg: string;
//     type?: "success" | "error";
//   } | null>(null);
//   const showToast = useCallback(
//     (msg: string, type: "success" | "error" = "success") => {
//       setToast({ msg, type });
//       setTimeout(() => setToast(null), 3200);
//     },
//     [],
//   );

//   const loadList = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await reportApi.myReports({ page, limit: PAGE_SIZE });
//       setReports(res.data ?? []);
//       setMeta(res.meta ?? { total: 0, totalPages: 1 });
//     } catch (err: any) {
//       setError(err?.response?.data?.message ?? "Failed to load your reports.");
//     } finally {
//       setLoading(false);
//     }
//   }, [page]);

//   useEffect(() => {
//     if (view === "list") loadList();
//   }, [view, loadList]);

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await loadList();
//     setRefreshing(false);
//   }, [loadList]);

//   const openDetail = async (id: string) => {
//     setSelectedId(id);
//     setView("detail");
//     setDetail(null);
//     setDetailLoading(true);
//     setDetailError(null);
//     try {
//       const res = await reportApi.getReport(id);
//       setDetail(res.data ?? res);
//     } catch {
//       setDetailError("Failed to load this report.");
//     } finally {
//       setDetailLoading(false);
//     }
//   };

//   const set = (k: keyof typeof EMPTY_FORM, v: any) =>
//     setForm((f) => ({ ...f, [k]: v }));

//   const validate = () => {
//     const e: Record<string, string> = {};
//     if (!form.category) e.category = "Please select a category";
//     if (!form.severity) e.severity = "Please select a severity";
//     if (!form.subject.trim()) e.subject = "Subject is required";
//     if (!form.description.trim())
//       e.description = "Please describe what happened";
//     else if (form.description.trim().length < 20)
//       e.description = "Please provide a bit more detail (min 20 characters)";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleSubmit = async () => {
//     if (!validate()) return;
//     setSubmitting(true);
//     setSubmitError(null);
//     try {
//       const payload = {
//         category: form.category,
//         severity: form.severity,
//         subject: form.subject.trim(),
//         description: form.description.trim(),
//         incidentDate: form.incidentDate.trim() || undefined,
//         location: form.location.trim() || undefined,
//         involvedParties: form.involvedParties.trim() || undefined,
//         witnesses: form.witnesses.trim() || undefined,
//         desiredOutcome: form.desiredOutcome.trim() || undefined,
//         isAnonymous: form.isAnonymous,
//       };
//       const res = await reportApi.create(payload);
//       setCreatedRef(res?.data?.referenceCode ?? res?.referenceCode ?? null);
//       setSuccessModal(true);
//     } catch (err: any) {
//       setSubmitError(
//         err?.response?.data?.message ||
//           err?.message ||
//           "Failed to submit report. Please try again.",
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const resetForm = () => {
//     setForm(EMPTY_FORM);
//     setErrors({});
//     setSubmitError(null);
//   };

//   // ════════════════════ NEW REPORT ════════════════════
//   if (view === "new") {
//     return (
//       <KeyboardAvoidingView
//         style={[s.screen, { paddingTop: insets.top }]}
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//       >
//         <View style={s.header}>
//           <Pressable
//             onPress={() => {
//               resetForm();
//               setView("list");
//             }}
//             style={s.headerBack}
//           >
//             <ChevronLeft size={20} color={C.textSecondary} />
//           </Pressable>
//           <View style={{ flex: 1 }}>
//             <Text style={s.headerTitle}>New Report</Text>
//             <Text style={s.headerSubtitle}>
//               Your report is handled confidentially
//             </Text>
//           </View>
//           <View style={s.headerIconWrap}>
//             <ShieldAlert size={16} color={C.primary} />
//           </View>
//         </View>

//         <ScrollView
//           style={{ flex: 1 }}
//           contentContainerStyle={s.scrollContent}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//         >
//           {submitError && (
//             <View style={s.errorBanner}>
//               <AlertCircle size={16} color={C.danger} />
//               <Text style={s.errorBannerText}>{submitError}</Text>
//               <Pressable onPress={() => setSubmitError(null)}>
//                 <X size={14} color={C.danger} />
//               </Pressable>
//             </View>
//           )}

//           <View style={s.formGroup}>
//             <MobileFormField label="Category" required error={errors.category}>
//               <MobileSelect
//                 value={form.category}
//                 onChange={(v: string) => set("category", v)}
//                 options={CATEGORY_OPTIONS}
//                 placeholder="Select a category…"
//                 error={errors.category}
//               />
//             </MobileFormField>

//             <MobileFormField label="Severity" required error={errors.severity}>
//               <MobileSelect
//                 value={form.severity}
//                 onChange={(v: string) => set("severity", v)}
//                 options={SEVERITY_OPTIONS}
//                 placeholder="Select severity…"
//                 error={errors.severity}
//               />
//             </MobileFormField>

//             <MobileFormField label="Subject" required error={errors.subject}>
//               <TextInput
//                 value={form.subject}
//                 onChangeText={(t) => set("subject", t)}
//                 placeholder="Brief summary of the issue"
//                 placeholderTextColor={C.textMuted}
//                 style={[s.input, errors.subject && s.inputError]}
//               />
//             </MobileFormField>

//             <MobileFormField
//               label="Description"
//               required
//               error={errors.description}
//               hint="What happened? Be as specific as you can."
//             >
//               <TextInput
//                 value={form.description}
//                 onChangeText={(t) => set("description", t)}
//                 placeholder="Describe the incident in detail…"
//                 placeholderTextColor={C.textMuted}
//                 multiline
//                 numberOfLines={5}
//                 style={[
//                   s.input,
//                   s.textarea,
//                   errors.description && s.inputError,
//                 ]}
//               />
//             </MobileFormField>
//           </View>

//           <Text style={s.sectionHeader}>Incident Details (optional)</Text>
//           <View style={s.formGroup}>
//             <MobileFormField label="Incident Date">
//               <TextInput
//                 value={form.incidentDate}
//                 onChangeText={(t) => set("incidentDate", t)}
//                 placeholder="YYYY-MM-DD"
//                 placeholderTextColor={C.textMuted}
//                 style={s.input}
//               />
//             </MobileFormField>

//             <MobileFormField label="Location">
//               <TextInput
//                 value={form.location}
//                 onChangeText={(t) => set("location", t)}
//                 placeholder="e.g. 3rd floor office, Lagos HQ"
//                 placeholderTextColor={C.textMuted}
//                 style={s.input}
//               />
//             </MobileFormField>

//             <MobileFormField label="Involved Parties">
//               <TextInput
//                 value={form.involvedParties}
//                 onChangeText={(t) => set("involvedParties", t)}
//                 placeholder="Who was involved?"
//                 placeholderTextColor={C.textMuted}
//                 multiline
//                 numberOfLines={2}
//                 style={[s.input, s.textareaSm]}
//               />
//             </MobileFormField>

//             <MobileFormField label="Witnesses">
//               <TextInput
//                 value={form.witnesses}
//                 onChangeText={(t) => set("witnesses", t)}
//                 placeholder="Anyone who saw what happened?"
//                 placeholderTextColor={C.textMuted}
//                 multiline
//                 numberOfLines={2}
//                 style={[s.input, s.textareaSm]}
//               />
//             </MobileFormField>

//             <MobileFormField label="Desired Outcome">
//               <TextInput
//                 value={form.desiredOutcome}
//                 onChangeText={(t) => set("desiredOutcome", t)}
//                 placeholder="What would you like to see happen?"
//                 placeholderTextColor={C.textMuted}
//                 multiline
//                 numberOfLines={2}
//                 style={[s.input, s.textareaSm]}
//               />
//             </MobileFormField>
//           </View>

//           <View style={s.anonRow}>
//             <Lock size={16} color={C.textSecondary} />
//             <View style={{ flex: 1 }}>
//               <Text style={s.anonTitle}>Submit anonymously</Text>
//               <Text style={s.anonDesc}>
//                 Your name will be hidden from HR. Only a super admin can reveal
//                 it, and only for serious cases — every reveal is logged.
//               </Text>
//             </View>
//             <Switch
//               value={form.isAnonymous}
//               onValueChange={(v) => set("isAnonymous", v)}
//               trackColor={{ false: C.border, true: C.primary }}
//               thumbColor="#fff"
//             />
//           </View>

//           <Pressable
//             onPress={handleSubmit}
//             disabled={submitting}
//             style={s.submitBtn}
//           >
//             {submitting ? (
//               <ActivityIndicator size="small" color="#fff" />
//             ) : (
//               <>
//                 <Send size={15} color="#fff" />
//                 <Text style={s.submitBtnText}>Submit Report</Text>
//               </>
//             )}
//           </Pressable>
//           <View style={{ height: 24 }} />
//         </ScrollView>

//         <Modal
//           visible={successModal}
//           animationType="fade"
//           transparent
//           statusBarTranslucent
//         >
//           <View style={s.modalOverlay}>
//             <View style={s.modalSheet}>
//               <View style={s.modalIconWrap}>
//                 <CheckCircle2 size={32} color="#fff" />
//               </View>
//               <Text style={s.modalTitle}>Report Submitted</Text>
//               {createdRef && (
//                 <Text style={s.modalRef}>Reference: {createdRef}</Text>
//               )}
//               <Text style={s.modalDesc}>
//                 HR has been notified and will review your report. You can track
//                 its status from "My Reports".
//               </Text>
//               <Pressable
//                 onPress={() => {
//                   setSuccessModal(false);
//                   resetForm();
//                   setView("list");
//                 }}
//                 style={s.modalBtn}
//               >
//                 <Text style={s.modalBtnText}>Done</Text>
//               </Pressable>
//             </View>
//           </View>
//         </Modal>
//       </KeyboardAvoidingView>
//     );
//   }

//   // ════════════════════ DETAIL (read-only) ════════════════════
//   if (view === "detail" && selectedId) {
//     return (
//       <View style={[s.screen, { paddingTop: insets.top }]}>
//         <View style={s.header}>
//           <Pressable onPress={() => setView("list")} style={s.headerBack}>
//             <ChevronLeft size={20} color={C.textSecondary} />
//           </Pressable>
//           <View style={{ flex: 1 }}>
//             <Text style={s.headerTitle}>
//               {detail?.referenceCode ?? "Report"}
//             </Text>
//             <Text style={s.headerSubtitle}>Report Details</Text>
//           </View>
//           <Pressable
//             onPress={() => openDetail(selectedId)}
//             style={s.headerBack}
//           >
//             <RefreshCw size={15} color={C.textSecondary} />
//           </Pressable>
//         </View>

//         {detailLoading ? (
//           <View style={s.center}>
//             <ActivityIndicator size="large" color={C.primary} />
//           </View>
//         ) : detailError || !detail ? (
//           <View style={s.center}>
//             <AlertCircle size={28} color={C.danger} />
//             <Text style={{ color: C.danger, marginTop: 8 }}>
//               {detailError ?? "Report not found."}
//             </Text>
//           </View>
//         ) : (
//           <ScrollView
//             contentContainerStyle={s.detailBody}
//             showsVerticalScrollIndicator={false}
//           >
//             <View style={s.card}>
//               <View style={s.badgeRow}>
//                 <CategoryPill category={detail.category} />
//                 <SeverityBadge severity={detail.severity} />
//                 <StatusBadge status={detail.status} />
//               </View>
//               <Text style={s.subject}>{detail.subject}</Text>
//               <Text style={s.description}>{detail.description}</Text>
//               <View style={s.metaFooter}>
//                 <Text style={s.metaFooterText}>
//                   Submitted {fmtDate(detail.createdAt)}
//                 </Text>
//                 {detail.isAnonymous && (
//                   <View style={s.anonBadge}>
//                     <Lock size={9} color={C.textMuted} />
//                     <Text style={s.anonBadgeText}>Submitted anonymously</Text>
//                   </View>
//                 )}
//               </View>
//             </View>

//             {(detail.incidentDate ||
//               detail.location ||
//               detail.involvedParties ||
//               detail.witnesses ||
//               detail.desiredOutcome) && (
//               <View style={s.card}>
//                 <Text style={s.cardTitle}>Incident Details</Text>
//                 {detail.incidentDate && (
//                   <View style={s.infoBlock}>
//                     <Calendar size={13} color={C.textMuted} />
//                     <View style={{ flex: 1 }}>
//                       <Text style={s.infoLabel}>Incident Date</Text>
//                       <Text style={s.infoValue}>{detail.incidentDate}</Text>
//                     </View>
//                   </View>
//                 )}
//                 {detail.location && (
//                   <View style={s.infoBlock}>
//                     <MapPin size={13} color={C.textMuted} />
//                     <View style={{ flex: 1 }}>
//                       <Text style={s.infoLabel}>Location</Text>
//                       <Text style={s.infoValue}>{detail.location}</Text>
//                     </View>
//                   </View>
//                 )}
//                 {detail.involvedParties && (
//                   <View style={s.infoBlock}>
//                     <Users size={13} color={C.textMuted} />
//                     <View style={{ flex: 1 }}>
//                       <Text style={s.infoLabel}>Involved Parties</Text>
//                       <Text style={s.infoValue}>{detail.involvedParties}</Text>
//                     </View>
//                   </View>
//                 )}
//                 {detail.witnesses && (
//                   <View style={s.infoBlock}>
//                     <FileText size={13} color={C.textMuted} />
//                     <View style={{ flex: 1 }}>
//                       <Text style={s.infoLabel}>Witnesses</Text>
//                       <Text style={s.infoValue}>{detail.witnesses}</Text>
//                     </View>
//                   </View>
//                 )}
//                 {detail.desiredOutcome && (
//                   <View style={s.infoBlock}>
//                     <Target size={13} color={C.textMuted} />
//                     <View style={{ flex: 1 }}>
//                       <Text style={s.infoLabel}>Desired Outcome</Text>
//                       <Text style={s.infoValue}>{detail.desiredOutcome}</Text>
//                     </View>
//                   </View>
//                 )}
//               </View>
//             )}

//             {detail.assignedTo && (
//               <View style={s.card}>
//                 <Text style={s.cardTitle}>Handled By</Text>
//                 <View style={s.reporterRow}>
//                   <ReportAvatar
//                     initials={getInitials(detail.assignedTo.name)}
//                     size={34}
//                   />
//                   <Text style={s.reporterName}>{detail.assignedTo.name}</Text>
//                 </View>
//               </View>
//             )}

//             <View style={s.card}>
//               <Text style={s.cardTitle}>Updates</Text>
//               {(detail.notes ?? []).length === 0 ? (
//                 <Text style={s.mutedText}>
//                   No updates yet. HR will post updates here as your report is
//                   reviewed.
//                 </Text>
//               ) : (
//                 <View style={{ gap: 12 }}>
//                   {detail.notes.map((n: any) => (
//                     <View key={n.id} style={s.noteRow}>
//                       <View
//                         style={[
//                           s.noteIcon,
//                           {
//                             backgroundColor: n.isStatusChange
//                               ? C.primaryLight
//                               : C.surfaceAlt,
//                           },
//                         ]}
//                       >
//                         <MessageSquarePlus
//                           size={12}
//                           color={n.isStatusChange ? C.primary : C.textMuted}
//                         />
//                       </View>
//                       <View style={{ flex: 1 }}>
//                         <Text style={s.noteText}>{n.note}</Text>
//                         <Text style={s.noteMeta}>
//                           {fmtDateTime(n.createdAt)}
//                         </Text>
//                       </View>
//                     </View>
//                   ))}
//                 </View>
//               )}
//             </View>
//             <View style={{ height: 24 }} />
//           </ScrollView>
//         )}
//       </View>
//     );
//   }

//   // ════════════════════ LIST (default) ════════════════════
//   return (
//     <View style={[s.screen, { paddingTop: insets.top }]}>
//       <View style={s.header}>
//         <Pressable onPress={() => router.back()} style={s.headerBack}>
//           <ChevronLeft size={20} color={C.textSecondary} />
//         </Pressable>
//         <View style={{ flex: 1 }}>
//           <Text style={s.headerTitle}>My Reports</Text>
//           <Text style={s.headerSubtitle}>
//             {loading ? "Loading…" : `${meta.total} submitted`}
//           </Text>
//         </View>
//         <Pressable onPress={() => setView("new")} style={s.newBtn}>
//           <Plus size={15} color="#fff" />
//         </Pressable>
//       </View>

//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={s.listContent}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             tintColor={C.primary}
//           />
//         }
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={s.introCard}>
//           <ShieldAlert size={18} color={C.primary} />
//           <Text style={s.introText}>
//             Reports are reviewed by HR in confidence. You can submit anonymously
//             and track progress here at any time.
//           </Text>
//         </View>

//         {error && (
//           <View style={s.errorBanner}>
//             <AlertCircle size={16} color={C.danger} />
//             <Text style={s.errorBannerText}>{error}</Text>
//             <Pressable onPress={loadList}>
//               <RefreshCw size={14} color={C.danger} />
//             </Pressable>
//           </View>
//         )}

//         {loading ? (
//           <View style={s.center}>
//             <ActivityIndicator size="large" color={C.primary} />
//           </View>
//         ) : reports.length === 0 ? (
//           <View style={s.center}>
//             <ShieldAlert size={40} color={C.textMuted} />
//             <Text style={s.emptyTitle}>No reports yet</Text>
//             <Text style={s.emptyDesc}>
//               Anything you submit will show up here.
//             </Text>
//             <Pressable onPress={() => setView("new")} style={s.emptyBtn}>
//               <Plus size={13} color="#fff" />
//               <Text style={s.emptyBtnText}>Submit a Report</Text>
//             </Pressable>
//           </View>
//         ) : (
//           <View style={{ gap: 10 }}>
//             {reports.map((r) => (
//               <Pressable
//                 key={r.id}
//                 onPress={() => openDetail(r.id)}
//                 style={s.reportCard}
//               >
//                 <View style={s.reportCardTop}>
//                   <CategoryPill category={r.category} />
//                   <View
//                     style={{ marginLeft: "auto", flexDirection: "row", gap: 6 }}
//                   >
//                     <SeverityBadge severity={r.severity} />
//                     <StatusBadge status={r.status} />
//                   </View>
//                 </View>
//                 <Text style={s.reportSubject} numberOfLines={1}>
//                   {r.subject}
//                 </Text>
//                 <Text style={s.reportDesc} numberOfLines={2}>
//                   {r.description}
//                 </Text>
//                 <View style={s.reportFooter}>
//                   <Text style={s.refCode}>{r.referenceCode}</Text>
//                   <View style={s.footerRight}>
//                     <Text style={s.dateText}>{fmtDate(r.createdAt)}</Text>
//                     <ChevronRight size={14} color={C.textMuted} />
//                   </View>
//                 </View>
//               </Pressable>
//             ))}
//           </View>
//         )}

//         {meta.totalPages > 1 && (
//           <View style={s.pagination}>
//             <Pressable
//               disabled={page === 1}
//               onPress={() => setPage((p) => p - 1)}
//               style={[s.pageBtn, page === 1 && s.pageBtnDisabled]}
//             >
//               <Text
//                 style={[s.pageBtnText, page === 1 && s.pageBtnTextDisabled]}
//               >
//                 Prev
//               </Text>
//             </Pressable>
//             <Text style={s.pageIndicator}>
//               {page} / {meta.totalPages}
//             </Text>
//             <Pressable
//               disabled={page === meta.totalPages}
//               onPress={() => setPage((p) => p + 1)}
//               style={[s.pageBtn, page === meta.totalPages && s.pageBtnDisabled]}
//             >
//               <Text
//                 style={[
//                   s.pageBtnText,
//                   page === meta.totalPages && s.pageBtnTextDisabled,
//                 ]}
//               >
//                 Next
//               </Text>
//             </Pressable>
//           </View>
//         )}
//         <View style={{ height: 24 }} />
//       </ScrollView>

//       {toast && (
//         <View
//           style={[
//             s.toast,
//             toast.type === "error" && { backgroundColor: "#FEE2E2" },
//           ]}
//         >
//           <Text
//             style={[s.toastText, toast.type === "error" && { color: C.danger }]}
//           >
//             {toast.msg}
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   screen: { flex: 1, backgroundColor: C.bg },
//   center: { alignItems: "center", gap: 10, paddingVertical: 48 },

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
//   headerSubtitle: { fontSize: 12, color: C.textMuted, marginTop: 2 },
//   headerIconWrap: {
//     width: 34,
//     height: 34,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.primaryLight,
//   },
//   newBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.primary,
//   },

//   // ── list ──
//   listContent: { padding: 16, gap: 14 },
//   introCard: {
//     flexDirection: "row",
//     gap: 10,
//     padding: 14,
//     borderRadius: 16,
//     backgroundColor: C.primaryLight,
//     alignItems: "flex-start",
//   },
//   introText: {
//     flex: 1,
//     fontSize: 12,
//     color: C.primary,
//     lineHeight: 17,
//     fontWeight: "600",
//   },

//   reportCard: {
//     padding: 14,
//     borderRadius: 16,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     gap: 8,
//   },
//   reportCardTop: { flexDirection: "row", alignItems: "center" },
//   reportSubject: { fontSize: 13, fontWeight: "800", color: C.textPrimary },
//   reportDesc: { fontSize: 11, color: C.textSecondary, lineHeight: 16 },
//   reportFooter: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingTop: 8,
//     borderTopWidth: 1,
//     borderTopColor: C.border,
//   },
//   refCode: { fontSize: 10, color: C.textMuted, fontFamily: "monospace" },
//   footerRight: { flexDirection: "row", alignItems: "center", gap: 4 },
//   dateText: { fontSize: 10, color: C.textMuted },

//   emptyTitle: { fontSize: 15, fontWeight: "700", color: C.textPrimary },
//   emptyDesc: { fontSize: 12, color: C.textMuted, textAlign: "center" },
//   emptyBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     marginTop: 8,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 12,
//     backgroundColor: C.primary,
//   },
//   emptyBtnText: { fontSize: 12, fontWeight: "800", color: "#fff" },

//   pagination: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 14,
//   },
//   pageBtn: {
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 10,
//     backgroundColor: C.primary,
//   },
//   pageBtnDisabled: { backgroundColor: C.surfaceAlt },
//   pageBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },
//   pageBtnTextDisabled: { color: C.textMuted },
//   pageIndicator: { fontSize: 12, fontWeight: "700", color: C.textSecondary },

//   errorBanner: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     padding: 12,
//     borderRadius: 14,
//     backgroundColor: C.dangerLight,
//     borderWidth: 1,
//     borderColor: C.danger + "33",
//   },
//   errorBannerText: {
//     flex: 1,
//     fontSize: 13,
//     fontWeight: "600",
//     color: C.danger,
//   },

//   toast: {
//     position: "absolute",
//     bottom: 20,
//     left: 16,
//     right: 16,
//     padding: 14,
//     borderRadius: 14,
//     backgroundColor: C.navy,
//     alignItems: "center",
//   },
//   toastText: { fontSize: 13, fontWeight: "700", color: "#fff" },

//   // ── new report form ──
//   scrollContent: { padding: 16, paddingBottom: 24, gap: 16 },
//   formGroup: { gap: 14 },
//   sectionHeader: {
//     fontSize: 11,
//     fontWeight: "800",
//     color: C.textMuted,
//     textTransform: "uppercase",
//     letterSpacing: 0.6,
//   },
//   input: {
//     width: "100%",
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     borderRadius: 14,
//     fontSize: 14,
//     color: C.textPrimary,
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1.5,
//     borderColor: C.border,
//   },
//   inputError: { borderColor: C.danger },
//   textarea: { height: 110, textAlignVertical: "top" },
//   textareaSm: { height: 64, textAlignVertical: "top" },

//   anonRow: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     gap: 12,
//     padding: 14,
//     borderRadius: 16,
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   anonTitle: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
//   anonDesc: { fontSize: 11, color: C.textMuted, marginTop: 3, lineHeight: 15 },

//   submitBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     paddingVertical: 14,
//     borderRadius: 14,
//     backgroundColor: C.primary,
//   },
//   submitBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.45)",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 24,
//   },
//   modalSheet: {
//     width: "100%",
//     maxWidth: 340,
//     borderRadius: 24,
//     backgroundColor: C.surface,
//     padding: 26,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   modalIconWrap: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.success,
//     marginBottom: 12,
//   },
//   modalTitle: {
//     fontSize: 16,
//     fontWeight: "800",
//     color: C.textPrimary,
//     textAlign: "center",
//   },
//   modalRef: {
//     fontSize: 12,
//     fontWeight: "700",
//     color: C.primary,
//     marginTop: 6,
//     fontFamily: "monospace",
//   },
//   modalDesc: {
//     fontSize: 12,
//     color: C.textMuted,
//     textAlign: "center",
//     marginTop: 10,
//     lineHeight: 17,
//   },
//   modalBtn: {
//     marginTop: 18,
//     width: "100%",
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//     backgroundColor: C.primary,
//   },
//   modalBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },

//   // ── detail ──
//   detailBody: { padding: 16, gap: 14, paddingBottom: 24 },
//   card: {
//     padding: 16,
//     borderRadius: 18,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     gap: 12,
//   },
//   cardTitle: { fontSize: 13, fontWeight: "800", color: C.textPrimary },
//   badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
//   subject: { fontSize: 16, fontWeight: "800", color: C.textPrimary },
//   description: { fontSize: 13, lineHeight: 20, color: C.textSecondary },
//   metaFooter: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingTop: 8,
//     borderTopWidth: 1,
//     borderTopColor: C.border,
//   },
//   metaFooterText: { fontSize: 11, color: C.textMuted },
//   anonBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 20,
//     backgroundColor: C.surfaceAlt,
//   },
//   anonBadgeText: { fontSize: 9, fontWeight: "700", color: C.textMuted },

//   infoBlock: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
//   infoLabel: { fontSize: 10, color: C.textMuted },
//   infoValue: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: C.textPrimary,
//     marginTop: 2,
//     lineHeight: 17,
//   },

//   reporterRow: { flexDirection: "row", alignItems: "center", gap: 10 },
//   reporterName: { fontSize: 13, fontWeight: "800", color: C.textPrimary },

//   mutedText: { fontSize: 12, color: C.textMuted, lineHeight: 17 },
//   noteRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
//   noteIcon: {
//     width: 26,
//     height: 26,
//     borderRadius: 13,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   noteText: { fontSize: 12, color: C.textPrimary, lineHeight: 17 },
//   noteMeta: { fontSize: 10, color: C.textMuted, marginTop: 4 },
// });


// src/app/employee/reports.tsx
// Employee Reports screen — submit a new HR report and track the status of
// reports already filed. Mirrors the mobile conventions used across the
// employee/admin screens (header + back button, MobileFormField/MobileSelect,
// success modal, pull-to-refresh) and reuses the shared report primitives
// from src/components/admin/reports/reportShared.tsx (badges, formatters,
// category/severity options) since that file is explicitly designed to be
// shared between the admin and employee report screens.
//
// Assumed reportApi surface (in addition to the admin methods already used
// by ReportsListView/ReportDetailView):
//   reportApi.getMyReports({ page, limit })  -> { data, meta }
//   reportApi.create(payload)              -> { data }
//   reportApi.getReport(id)                -> { data }   (already used on admin side)

import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Switch,
  ActivityIndicator,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  Plus,
  ShieldAlert,
  RefreshCw,
  Send,
  Lock,
  AlertCircle,
  CheckCircle2,
  X,
  Calendar,
  MapPin,
  Users,
  Target,
  FileText,
  MessageSquarePlus,
  ChevronRight,
} from "lucide-react-native";

import C from "../../styles/colors";
import { reportApi } from "../../api/service/reportApi";
import MobileFormField from "../../components/admin/employee/MobileFormField";
import MobileSelect from "../../components/admin/employee/MobileSelect";
import {
  CATEGORY_OPTIONS,
  SEVERITY_OPTIONS,
  CategoryPill,
  SeverityBadge,
  StatusBadge,
  ReportAvatar,
  getInitials,
  fmtDate,
  fmtDateTime,
} from "../../components/admin/reports/reportShared";

type ViewMode = "list" | "new" | "detail";

const EMPTY_FORM = {
  category: "",
  severity: "medium",
  subject: "",
  description: "",
  incidentDate: "",
  location: "",
  involvedParties: "",
  witnesses: "",
  desiredOutcome: "",
  isAnonymous: false,
};

const PAGE_SIZE = 15;

export default function EmployeeReportsScreen() {
  const insets = useSafeAreaInsets();

  const [view, setView] = useState<ViewMode>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ── list state ──
  const [reports, setReports] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  // ── detail state ──
  const [detail, setDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // ── form state ──
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState(false);
  const [createdRef, setCreatedRef] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    msg: string;
    type?: "success" | "error";
  } | null>(null);
  const showToast = useCallback(
    (msg: string, type: "success" | "error" = "success") => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3200);
    },
    [],
  );

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportApi.getMyReports({ page, limit: PAGE_SIZE });
      setReports(res.data ?? []);
      setMeta(res.meta ?? { total: 0, totalPages: 1 });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load your reports.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (view === "list") loadList();
  }, [view, loadList]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadList();
    setRefreshing(false);
  }, [loadList]);

  const openDetail = async (id: string) => {
    setSelectedId(id);
    setView("detail");
    setDetail(null);
    setDetailLoading(true);
    setDetailError(null);
    try {
      const res = await reportApi.getReport(id);
      setDetail(res.data ?? res);
    } catch {
      setDetailError("Failed to load this report.");
    } finally {
      setDetailLoading(false);
    }
  };

  const set = (k: keyof typeof EMPTY_FORM, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.category) e.category = "Please select a category";
    if (!form.severity) e.severity = "Please select a severity";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.description.trim())
      e.description = "Please describe what happened";
    else if (form.description.trim().length < 20)
      e.description = "Please provide a bit more detail (min 20 characters)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        category: form.category,
        severity: form.severity,
        subject: form.subject.trim(),
        description: form.description.trim(),
        incidentDate: form.incidentDate.trim() || undefined,
        location: form.location.trim() || undefined,
        involvedParties: form.involvedParties.trim() || undefined,
        witnesses: form.witnesses.trim() || undefined,
        desiredOutcome: form.desiredOutcome.trim() || undefined,
        isAnonymous: form.isAnonymous,
      };
      const res = await reportApi.create(payload);
      setCreatedRef(res?.data?.referenceCode ?? res?.referenceCode ?? null);
      setSuccessModal(true);
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit report. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitError(null);
  };

  // ════════════════════ NEW REPORT ════════════════════
  if (view === "new") {
    return (
      <KeyboardAvoidingView
        style={[s.screen, { paddingTop: insets.top }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.header}>
          <Pressable
            onPress={() => {
              resetForm();
              setView("list");
            }}
            style={s.headerBack}
          >
            <ChevronLeft size={20} color={C.textSecondary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>New Report</Text>
            <Text style={s.headerSubtitle}>
              Your report is handled confidentially
            </Text>
          </View>
          <View style={s.headerIconWrap}>
            <ShieldAlert size={16} color={C.primary} />
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {submitError && (
            <View style={s.errorBanner}>
              <AlertCircle size={16} color={C.danger} />
              <Text style={s.errorBannerText}>{submitError}</Text>
              <Pressable onPress={() => setSubmitError(null)}>
                <X size={14} color={C.danger} />
              </Pressable>
            </View>
          )}

          <View style={s.formGroup}>
            <MobileFormField label="Category" required error={errors.category}>
              <MobileSelect
                value={form.category}
                onChange={(v: string) => set("category", v)}
                options={CATEGORY_OPTIONS}
                placeholder="Select a category…"
                error={errors.category}
              />
            </MobileFormField>

            <MobileFormField label="Severity" required error={errors.severity}>
              <MobileSelect
                value={form.severity}
                onChange={(v: string) => set("severity", v)}
                options={SEVERITY_OPTIONS}
                placeholder="Select severity…"
                error={errors.severity}
              />
            </MobileFormField>

            <MobileFormField label="Subject" required error={errors.subject}>
              <TextInput
                value={form.subject}
                onChangeText={(t) => set("subject", t)}
                placeholder="Brief summary of the issue"
                placeholderTextColor={C.textMuted}
                style={[s.input, errors.subject && s.inputError]}
              />
            </MobileFormField>

            <MobileFormField
              label="Description"
              required
              error={errors.description}
              hint="What happened? Be as specific as you can."
            >
              <TextInput
                value={form.description}
                onChangeText={(t) => set("description", t)}
                placeholder="Describe the incident in detail…"
                placeholderTextColor={C.textMuted}
                multiline
                numberOfLines={5}
                style={[
                  s.input,
                  s.textarea,
                  errors.description && s.inputError,
                ]}
              />
            </MobileFormField>
          </View>

          <Text style={s.sectionHeader}>Incident Details (optional)</Text>
          <View style={s.formGroup}>
            <MobileFormField label="Incident Date">
              <TextInput
                value={form.incidentDate}
                onChangeText={(t) => set("incidentDate", t)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={C.textMuted}
                style={s.input}
              />
            </MobileFormField>

            <MobileFormField label="Location">
              <TextInput
                value={form.location}
                onChangeText={(t) => set("location", t)}
                placeholder="e.g. 3rd floor office, Lagos HQ"
                placeholderTextColor={C.textMuted}
                style={s.input}
              />
            </MobileFormField>

            <MobileFormField label="Involved Parties">
              <TextInput
                value={form.involvedParties}
                onChangeText={(t) => set("involvedParties", t)}
                placeholder="Who was involved?"
                placeholderTextColor={C.textMuted}
                multiline
                numberOfLines={2}
                style={[s.input, s.textareaSm]}
              />
            </MobileFormField>

            <MobileFormField label="Witnesses">
              <TextInput
                value={form.witnesses}
                onChangeText={(t) => set("witnesses", t)}
                placeholder="Anyone who saw what happened?"
                placeholderTextColor={C.textMuted}
                multiline
                numberOfLines={2}
                style={[s.input, s.textareaSm]}
              />
            </MobileFormField>

            <MobileFormField label="Desired Outcome">
              <TextInput
                value={form.desiredOutcome}
                onChangeText={(t) => set("desiredOutcome", t)}
                placeholder="What would you like to see happen?"
                placeholderTextColor={C.textMuted}
                multiline
                numberOfLines={2}
                style={[s.input, s.textareaSm]}
              />
            </MobileFormField>
          </View>

          <View style={s.anonRow}>
            <Lock size={16} color={C.textSecondary} />
            <View style={{ flex: 1 }}>
              <Text style={s.anonTitle}>Submit anonymously</Text>
              <Text style={s.anonDesc}>
                Your name will be hidden from HR. Only a super admin can reveal
                it, and only for serious cases — every reveal is logged.
              </Text>
            </View>
            <Switch
              value={form.isAnonymous}
              onValueChange={(v) => set("isAnonymous", v)}
              trackColor={{ false: C.border, true: C.primary }}
              thumbColor="#fff"
            />
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={s.submitBtn}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Send size={15} color="#fff" />
                <Text style={s.submitBtnText}>Submit Report</Text>
              </>
            )}
          </Pressable>
          <View style={{ height: 24 }} />
        </ScrollView>

        <Modal
          visible={successModal}
          animationType="fade"
          transparent
          statusBarTranslucent
        >
          <View style={s.modalOverlay}>
            <View style={s.modalSheet}>
              <View style={s.modalIconWrap}>
                <CheckCircle2 size={32} color="#fff" />
              </View>
              <Text style={s.modalTitle}>Report Submitted</Text>
              {createdRef && (
                <Text style={s.modalRef}>Reference: {createdRef}</Text>
              )}
              <Text style={s.modalDesc}>
                HR has been notified and will review your report. You can track
                its status from "My Reports".
              </Text>
              <Pressable
                onPress={() => {
                  setSuccessModal(false);
                  resetForm();
                  setView("list");
                }}
                style={s.modalBtn}
              >
                <Text style={s.modalBtnText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    );
  }

  // ════════════════════ DETAIL (read-only) ════════════════════
  if (view === "detail" && selectedId) {
    return (
      <View style={[s.screen, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <Pressable onPress={() => setView("list")} style={s.headerBack}>
            <ChevronLeft size={20} color={C.textSecondary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>
              {detail?.referenceCode ?? "Report"}
            </Text>
            <Text style={s.headerSubtitle}>Report Details</Text>
          </View>
          <Pressable
            onPress={() => openDetail(selectedId)}
            style={s.headerBack}
          >
            <RefreshCw size={15} color={C.textSecondary} />
          </Pressable>
        </View>

        {detailLoading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={C.primary} />
          </View>
        ) : detailError || !detail ? (
          <View style={s.center}>
            <AlertCircle size={28} color={C.danger} />
            <Text style={{ color: C.danger, marginTop: 8 }}>
              {detailError ?? "Report not found."}
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={s.detailBody}
            showsVerticalScrollIndicator={false}
          >
            <View style={s.card}>
              <View style={s.badgeRow}>
                <CategoryPill category={detail.category} />
                <SeverityBadge severity={detail.severity} />
                <StatusBadge status={detail.status} />
              </View>
              <Text style={s.subject}>{detail.subject}</Text>
              <Text style={s.description}>{detail.description}</Text>
              <View style={s.metaFooter}>
                <Text style={s.metaFooterText}>
                  Submitted {fmtDate(detail.createdAt)}
                </Text>
                {detail.isAnonymous && (
                  <View style={s.anonBadge}>
                    <Lock size={9} color={C.textMuted} />
                    <Text style={s.anonBadgeText}>Submitted anonymously</Text>
                  </View>
                )}
              </View>
            </View>

            {(detail.incidentDate ||
              detail.location ||
              detail.involvedParties ||
              detail.witnesses ||
              detail.desiredOutcome) && (
              <View style={s.card}>
                <Text style={s.cardTitle}>Incident Details</Text>
                {detail.incidentDate && (
                  <View style={s.infoBlock}>
                    <Calendar size={13} color={C.textMuted} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.infoLabel}>Incident Date</Text>
                      <Text style={s.infoValue}>{detail.incidentDate}</Text>
                    </View>
                  </View>
                )}
                {detail.location && (
                  <View style={s.infoBlock}>
                    <MapPin size={13} color={C.textMuted} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.infoLabel}>Location</Text>
                      <Text style={s.infoValue}>{detail.location}</Text>
                    </View>
                  </View>
                )}
                {detail.involvedParties && (
                  <View style={s.infoBlock}>
                    <Users size={13} color={C.textMuted} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.infoLabel}>Involved Parties</Text>
                      <Text style={s.infoValue}>{detail.involvedParties}</Text>
                    </View>
                  </View>
                )}
                {detail.witnesses && (
                  <View style={s.infoBlock}>
                    <FileText size={13} color={C.textMuted} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.infoLabel}>Witnesses</Text>
                      <Text style={s.infoValue}>{detail.witnesses}</Text>
                    </View>
                  </View>
                )}
                {detail.desiredOutcome && (
                  <View style={s.infoBlock}>
                    <Target size={13} color={C.textMuted} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.infoLabel}>Desired Outcome</Text>
                      <Text style={s.infoValue}>{detail.desiredOutcome}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {detail.assignedTo && (
              <View style={s.card}>
                <Text style={s.cardTitle}>Handled By</Text>
                <View style={s.reporterRow}>
                  <ReportAvatar
                    initials={getInitials(detail.assignedTo.name)}
                    size={34}
                  />
                  <Text style={s.reporterName}>{detail.assignedTo.name}</Text>
                </View>
              </View>
            )}

            <View style={s.card}>
              <Text style={s.cardTitle}>Updates</Text>
              {(detail.notes ?? []).length === 0 ? (
                <Text style={s.mutedText}>
                  No updates yet. HR will post updates here as your report is
                  reviewed.
                </Text>
              ) : (
                <View style={{ gap: 12 }}>
                  {detail.notes.map((n: any) => (
                    <View key={n.id} style={s.noteRow}>
                      <View
                        style={[
                          s.noteIcon,
                          {
                            backgroundColor: n.isStatusChange
                              ? C.primaryLight
                              : C.surfaceAlt,
                          },
                        ]}
                      >
                        <MessageSquarePlus
                          size={12}
                          color={n.isStatusChange ? C.primary : C.textMuted}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.noteText}>{n.note}</Text>
                        <Text style={s.noteMeta}>
                          {fmtDateTime(n.createdAt)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <View style={{ height: 24 }} />
          </ScrollView>
        )}
      </View>
    );
  }

  // ════════════════════ LIST (default) ════════════════════
  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>My Reports</Text>
          <Text style={s.headerSubtitle}>
            {loading ? "Loading…" : `${meta.total} submitted`}
          </Text>
        </View>
        <Pressable onPress={() => setView("new")} style={s.newBtn}>
          <Plus size={15} color="#fff" />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroTopRow}>
            <View style={s.heroIconWrap}>
              <ShieldAlert size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.heroTitle}>My Reports</Text>
              <Text style={s.heroSubtitle}>
                {loading
                  ? "Loading…"
                  : `${meta.total} submitted report${meta.total !== 1 ? "s" : ""}`}
              </Text>
            </View>
          </View>

          <View style={s.heroStatsRow}>
            {[
              {
                label: "Submitted",
                value: meta.total,
                color: "#A5F3FC",
              },
              {
                label: "Pending",
                value: reports.filter((r) =>
                  ["pending", "open", "in-review"].includes(r.status)
                ).length,
                color: "#FDE68A",
              },
              {
                label: "Resolved",
                value: reports.filter((r) =>
                  ["resolved", "closed"].includes(r.status)
                ).length,
                color: "#BBF7D0",
              },
            ].map((st) => (
              <View key={st.label} style={s.heroStatTile}>
                <Text style={[s.heroStatValue, { color: st.color }]}>
                  {st.value}
                </Text>
                <Text style={s.heroStatLabel}>{st.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {error && (
          <View style={s.errorBanner}>
            <AlertCircle size={16} color={C.danger} />
            <Text style={s.errorBannerText}>{error}</Text>
            <Pressable onPress={loadList}>
              <RefreshCw size={14} color={C.danger} />
            </Pressable>
          </View>
        )}

        {loading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={C.primary} />
          </View>
        ) : reports.length === 0 ? (
          <View style={s.center}>
            <ShieldAlert size={40} color={C.textMuted} />
            <Text style={s.emptyTitle}>No reports yet</Text>
            <Text style={s.emptyDesc}>
              Anything you submit will show up here.
            </Text>
            <Pressable onPress={() => setView("new")} style={s.emptyBtn}>
              <Plus size={13} color="#fff" />
              <Text style={s.emptyBtnText}>Submit a Report</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {reports.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => openDetail(r.id)}
                style={s.reportCard}
              >
                <View style={s.reportCardTop}>
                  <CategoryPill category={r.category} />
                  <View
                    style={{ marginLeft: "auto", flexDirection: "row", gap: 6 }}
                  >
                    <SeverityBadge severity={r.severity} />
                    <StatusBadge status={r.status} />
                  </View>
                </View>
                <Text style={s.reportSubject} numberOfLines={1}>
                  {r.subject}
                </Text>
                <Text style={s.reportDesc} numberOfLines={2}>
                  {r.description}
                </Text>
                <View style={s.reportFooter}>
                  <Text style={s.refCode}>{r.referenceCode}</Text>
                  <View style={s.footerRight}>
                    <Text style={s.dateText}>{fmtDate(r.createdAt)}</Text>
                    <ChevronRight size={14} color={C.textMuted} />
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {meta.totalPages > 1 && (
          <View style={s.pagination}>
            <Pressable
              disabled={page === 1}
              onPress={() => setPage((p) => p - 1)}
              style={[s.pageBtn, page === 1 && s.pageBtnDisabled]}
            >
              <Text
                style={[s.pageBtnText, page === 1 && s.pageBtnTextDisabled]}
              >
                Prev
              </Text>
            </Pressable>
            <Text style={s.pageIndicator}>
              {page} / {meta.totalPages}
            </Text>
            <Pressable
              disabled={page === meta.totalPages}
              onPress={() => setPage((p) => p + 1)}
              style={[s.pageBtn, page === meta.totalPages && s.pageBtnDisabled]}
            >
              <Text
                style={[
                  s.pageBtnText,
                  page === meta.totalPages && s.pageBtnTextDisabled,
                ]}
              >
                Next
              </Text>
            </Pressable>
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      {toast && (
        <View
          style={[
            s.toast,
            toast.type === "error" && { backgroundColor: "#FEE2E2" },
          ]}
        >
          <Text
            style={[s.toastText, toast.type === "error" && { color: C.danger }]}
          >
            {toast.msg}
          </Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  center: { alignItems: "center", gap: 10, paddingVertical: 48 },

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
  headerSubtitle: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  headerIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  newBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
  },

  // ── list ──
  listContent: { padding: 16, gap: 14 },

  // ── hero ──
  hero: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: C.navy,
    marginBottom: 4,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  heroSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },
  heroStatsRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 10,
  },
  heroStatTile: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  heroStatValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  heroStatLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.65)",
    marginTop: 4,
    fontWeight: "600",
  },

  reportCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    gap: 8,
  },
  reportCardTop: { flexDirection: "row", alignItems: "center" },
  reportSubject: { fontSize: 13, fontWeight: "800", color: C.textPrimary },
  reportDesc: { fontSize: 11, color: C.textSecondary, lineHeight: 16 },
  reportFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  refCode: { fontSize: 10, color: C.textMuted, fontFamily: "monospace" },
  footerRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  dateText: { fontSize: 10, color: C.textMuted },

  emptyTitle: { fontSize: 15, fontWeight: "700", color: C.textPrimary },
  emptyDesc: { fontSize: 12, color: C.textMuted, textAlign: "center" },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.primary,
  },
  emptyBtnText: { fontSize: 12, fontWeight: "800", color: "#fff" },

  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  pageBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: C.primary,
  },
  pageBtnDisabled: { backgroundColor: C.surfaceAlt },
  pageBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  pageBtnTextDisabled: { color: C.textMuted },
  pageIndicator: { fontSize: 12, fontWeight: "700", color: C.textSecondary },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.dangerLight,
    borderWidth: 1,
    borderColor: C.danger + "33",
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: C.danger,
  },

  toast: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: C.navy,
    alignItems: "center",
  },
  toastText: { fontSize: 13, fontWeight: "700", color: "#fff" },

  // ── new report form ──
  scrollContent: { padding: 16, paddingBottom: 24, gap: 16 },
  formGroup: { gap: 14 },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  input: {
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    fontSize: 14,
    color: C.textPrimary,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  inputError: { borderColor: C.danger },
  textarea: { height: 110, textAlignVertical: "top" },
  textareaSm: { height: 64, textAlignVertical: "top" },

  anonRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  anonTitle: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  anonDesc: { fontSize: 11, color: C.textMuted, marginTop: 3, lineHeight: 15 },

  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  submitBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalSheet: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    backgroundColor: C.surface,
    padding: 26,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  modalIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.success,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.textPrimary,
    textAlign: "center",
  },
  modalRef: {
    fontSize: 12,
    fontWeight: "700",
    color: C.primary,
    marginTop: 6,
    fontFamily: "monospace",
  },
  modalDesc: {
    fontSize: 12,
    color: C.textMuted,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 17,
  },
  modalBtn: {
    marginTop: 18,
    width: "100%",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.primary,
  },
  modalBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },

  // ── detail ──
  detailBody: { padding: 16, gap: 14, paddingBottom: 24 },
  card: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  cardTitle: { fontSize: 13, fontWeight: "800", color: C.textPrimary },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  subject: { fontSize: 16, fontWeight: "800", color: C.textPrimary },
  description: { fontSize: 13, lineHeight: 20, color: C.textSecondary },
  metaFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  metaFooterText: { fontSize: 11, color: C.textMuted },
  anonBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: C.surfaceAlt,
  },
  anonBadgeText: { fontSize: 9, fontWeight: "700", color: C.textMuted },

  infoBlock: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  infoLabel: { fontSize: 10, color: C.textMuted },
  infoValue: {
    fontSize: 12,
    fontWeight: "600",
    color: C.textPrimary,
    marginTop: 2,
    lineHeight: 17,
  },

  reporterRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  reporterName: { fontSize: 13, fontWeight: "800", color: C.textPrimary },

  mutedText: { fontSize: 12, color: C.textMuted, lineHeight: 17 },
  noteRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  noteIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  noteText: { fontSize: 12, color: C.textPrimary, lineHeight: 17 },
  noteMeta: { fontSize: 10, color: C.textMuted, marginTop: 4 },
});