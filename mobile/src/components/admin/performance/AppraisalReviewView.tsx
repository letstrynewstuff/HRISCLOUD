// import React, { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Modal,
//   TextInput,
//   StyleSheet,
//   ActivityIndicator,
// } from "react-native";
// import {
//   RefreshCw,
//   AlertTriangle,
//   Star,
//   Shield,
//   CheckCircle2,
//   Lock,
//   ThumbsDown,
//   X,
//   ClipboardList,
// } from "lucide-react-native";
// import C from "../../../styles/colors";
// import {
//   listAppraisals,
//   hrReviewAppraisal,
//   finalizeAppraisal,
//   rejectAppraisal,
// } from "../../../api/service/appraisal.api";

// const STATUS_CFG: Record<string, { label: string; bg: string; color: string }> =
//   {
//     submitted: { label: "Submitted", bg: "#fef3c7", color: "#d97706" },
//     hr_scored: { label: "HR Scored", bg: "#f3e8ff", color: "#7c3aed" },
//     completed: { label: "Completed", bg: "#d1fae5", color: "#059669" },
//     rejected: { label: "Returned", bg: "#fee2e2", color: "#dc2626" },
//   };

// const CRITERIA_DEFAULTS = [
//   { label: "Job Knowledge", weight: 20, maxScore: 5 },
//   { label: "Quality of Work", weight: 20, maxScore: 5 },
//   { label: "Communication", weight: 15, maxScore: 5 },
//   { label: "Teamwork", weight: 15, maxScore: 5 },
//   { label: "Initiative", weight: 15, maxScore: 5 },
//   { label: "Professionalism", weight: 15, maxScore: 5 },
// ];

// function RATING_LABEL(score: number) {
//   if (score >= 90) return { label: "Outstanding", color: "#059669" };
//   if (score >= 75) return { label: "High Performer", color: "#2563eb" };
//   if (score >= 60) return { label: "Meets Expectations", color: "#d97706" };
//   if (score >= 40) return { label: "Needs Improvement", color: "#dc2626" };
//   return { label: "Underperforming", color: "#7c3aed" };
// }

// function StatusBadge({ status }: { status: string }) {
//   const cfg = STATUS_CFG[status?.toLowerCase()] ?? {
//     bg: C.surfaceAlt,
//     color: C.textMuted,
//     label: status,
//   };
//   return (
//     <View
//       style={{
//         backgroundColor: cfg.bg,
//         paddingHorizontal: 8,
//         paddingVertical: 4,
//         borderRadius: 12,
//         alignSelf: "flex-start",
//       }}
//     >
//       <Text style={{ color: cfg.color, fontSize: 10, fontWeight: "700" }}>
//         {cfg.label}
//       </Text>
//     </View>
//   );
// }

// function StarDisplay({ score, max = 5 }: { score: number; max?: number }) {
//   return (
//     <View style={{ flexDirection: "row", gap: 2 }}>
//       {Array.from({ length: max }).map((_, i) => (
//         <Star
//           key={i}
//           size={14}
//           fill={i < score ? "#f59e0b" : "none"}
//           color={i < score ? "#f59e0b" : C.border}
//         />
//       ))}
//     </View>
//   );
// }

// function StarPicker({
//   value,
//   max = 5,
//   onChange,
// }: {
//   value: number;
//   max?: number;
//   onChange: (v: number) => void;
// }) {
//   return (
//     <View style={{ flexDirection: "row", gap: 4 }}>
//       {Array.from({ length: max }).map((_, i) => (
//         <TouchableOpacity key={i} onPress={() => onChange(i + 1)}>
//           <Star
//             size={24}
//             fill={i < value ? "#f59e0b" : "none"}
//             color={i < value ? "#f59e0b" : C.border}
//           />
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
// }

// function HRReviewModal({ appraisal, onClose, onSaved }: any) {
//   const [hrRatings, setHrRatings] = useState(() => {
//     const source = appraisal.hrRatings?.length
//       ? appraisal.hrRatings
//       : appraisal.managerRatings?.length
//         ? appraisal.managerRatings
//         : CRITERIA_DEFAULTS;
//     return source.map((r: any) => ({
//       label: r.label,
//       weight: r.weight ?? 100 / source.length,
//       maxScore: r.maxScore ?? 5,
//       score: appraisal.hrRatings?.length ? (r.score ?? 0) : 0,
//       comment: appraisal.hrRatings?.length ? (r.comment ?? "") : "",
//     }));
//   });
//   const [hrFeedback, setHrFeedback] = useState(appraisal.hrFeedback ?? "");
//   const [hrScoreWeight, setHrScoreWeight] = useState(
//     appraisal.hrScoreWeight ?? 20,
//   );
//   const [skipHrRating, setSkipHrRating] = useState(false);
//   const [rejectMode, setRejectMode] = useState(false);
//   const [rejectReason, setRejectReason] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");

//   const isLocked = appraisal.status === "completed";
//   const isHrScored = appraisal.status === "hr_scored";

//   const managerOverall = Number(appraisal.managerOverall ?? 0);

//   const hrOverall = (() => {
//     if (skipHrRating) return managerOverall;
//     const rated = hrRatings.filter((r: any) => Number(r.score ?? 0) > 0);
//     if (!rated.length) return managerOverall;
//     const totalW = rated.reduce(
//       (s: number, r: any) => s + (Number(r.weight) || 1),
//       0,
//     );
//     return rated.reduce(
//       (s: number, r: any) =>
//         s +
//         (Number(r.score) / (r.maxScore ?? 5)) *
//           100 *
//           ((Number(r.weight) || 1) / totalW),
//       0,
//     );
//   })();

//   const mgrWeight = 100 - hrScoreWeight;
//   const blended = Math.round(
//     managerOverall * (mgrWeight / 100) + hrOverall * (hrScoreWeight / 100),
//   );
//   const ratingInfo = RATING_LABEL(blended);

//   const setRating = (i: number, field: string, val: any) =>
//     setHrRatings((prev: any[]) =>
//       prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)),
//     );

//   const handleSaveReview = async (andFinalize = false) => {
//     setSaving(true);
//     setError("");
//     try {
//       await hrReviewAppraisal(appraisal.id, {
//         hrFeedback: hrFeedback.trim() || undefined,
//         hrRatings: skipHrRating
//           ? []
//           : hrRatings.filter((r: any) => r.score > 0),
//         hrScoreWeight,
//       });
//       if (andFinalize) {
//         await finalizeAppraisal(appraisal.id);
//         onSaved("Appraisal finalised — performance score updated.");
//       } else {
//         onSaved("HR review saved.");
//       }
//     } catch (err: any) {
//       setError(err?.response?.data?.message ?? "Failed to save HR review.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleReject = async () => {
//     if (!rejectReason.trim()) {
//       setError("Rejection reason is required.");
//       return;
//     }
//     setSaving(true);
//     setError("");
//     try {
//       await rejectAppraisal(appraisal.id, {
//         reason: rejectReason.trim(),
//       });
//       onSaved("Appraisal returned to manager for revision.");
//     } catch (err: any) {
//       setError(err?.response?.data?.message ?? "Failed to reject.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const empName = appraisal.employee
//     ? `${appraisal.employee.firstName} ${appraisal.employee.lastName}`
//     : "Employee";
//   const mgrName = appraisal.manager
//     ? `${appraisal.manager.firstName} ${appraisal.manager.lastName}`
//     : "Manager";

//   return (
//     <Modal visible animationType="slide" onRequestClose={onClose}>
//       <View style={{ flex: 1, backgroundColor: C.bg }}>
//         <View
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             justifyContent: "space-between",
//             padding: 16,
//             borderBottomWidth: 1,
//             borderBottomColor: C.border,
//             backgroundColor: C.surface,
//           }}
//         >
//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               gap: 8,
//             }}
//           >
//             <View
//               style={{
//                 width: 32,
//                 height: 32,
//                 borderRadius: 10,
//                 backgroundColor: "#f3e8ff",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <Shield size={14} color="#7c3aed" />
//             </View>
//             <View>
//               <Text
//                 style={{
//                   fontSize: 14,
//                   fontWeight: "700",
//                   color: C.textPrimary,
//                 }}
//               >
//                 HR Review — {empName}
//               </Text>
//               <Text style={{ fontSize: 10, color: C.textMuted }}>
//                 {appraisal.period}{" "}
//                 {appraisal.cycleName ? `· ${appraisal.cycleName}` : ""}
//               </Text>
//             </View>
//           </View>
//           <TouchableOpacity onPress={onClose}>
//             <X size={20} color={C.textMuted} />
//           </TouchableOpacity>
//         </View>

//         <ScrollView
//           style={{ padding: 16 }}
//           showsVerticalScrollIndicator={false}
//         >
//           {error ? (
//             <View
//               style={{
//                 backgroundColor: "#fee2e2",
//                 padding: 10,
//                 borderRadius: 12,
//                 marginBottom: 12,
//               }}
//             >
//               <Text style={{ color: "#dc2626", fontSize: 12 }}>{error}</Text>
//             </View>
//           ) : null}

//           {/* Score Preview */}
//           <View
//             style={{
//               backgroundColor: C.surfaceAlt,
//               borderRadius: 16,
//               padding: 14,
//               borderWidth: 1,
//               borderColor: C.border,
//               marginBottom: 16,
//             }}
//           >
//             <Text
//               style={{
//                 fontSize: 12,
//                 fontWeight: "700",
//                 color: C.textPrimary,
//                 marginBottom: 10,
//               }}
//             >
//               Live Score Preview
//             </Text>
//             <View
//               style={{
//                 flexDirection: "row",
//                 gap: 8,
//                 marginBottom: 10,
//               }}
//             >
//               {[
//                 {
//                   label: "Manager",
//                   value: Math.round(managerOverall),
//                   color: C.primary,
//                   bg: C.primaryLight,
//                 },
//                 {
//                   label: "HR",
//                   value: Math.round(hrOverall),
//                   color: "#7c3aed",
//                   bg: "#f3e8ff",
//                 },
//                 {
//                   label: "Blended",
//                   value: blended,
//                   color: ratingInfo.color,
//                   bg: "#d1fae5",
//                 },
//               ].map((s) => (
//                 <View
//                   key={s.label}
//                   style={{
//                     flex: 1,
//                     backgroundColor: s.bg,
//                     borderRadius: 12,
//                     padding: 10,
//                     alignItems: "center",
//                   }}
//                 >
//                   <Text
//                     style={{
//                       fontSize: 20,
//                       fontWeight: "800",
//                       color: s.color,
//                     }}
//                   >
//                     {s.value}
//                   </Text>
//                   <Text
//                     style={{
//                       fontSize: 10,
//                       fontWeight: "600",
//                       color: s.color,
//                       marginTop: 2,
//                     }}
//                   >
//                     {s.label}
//                   </Text>
//                 </View>
//               ))}
//             </View>
//             <Text style={{ fontSize: 11, color: C.textSecondary }}>
//               Projected rating:{" "}
//               <Text
//                 style={{
//                   fontWeight: "700",
//                   color: ratingInfo.color,
//                 }}
//               >
//                 {ratingInfo.label}
//               </Text>
//             </Text>
//             <Text
//               style={{
//                 fontSize: 10,
//                 color: C.textMuted,
//                 marginTop: 4,
//               }}
//             >
//               Manager {mgrWeight}% · HR {hrScoreWeight}%
//             </Text>

//             {!isLocked && (
//               <View style={{ marginTop: 12 }}>
//                 <Text
//                   style={{
//                     fontSize: 12,
//                     fontWeight: "600",
//                     color: C.textPrimary,
//                   }}
//                 >
//                   HR Score Weight: {hrScoreWeight}%
//                 </Text>
//                 <TextInput
//                   value={String(hrScoreWeight)}
//                   onChangeText={(t) =>
//                     setHrScoreWeight(Math.min(50, Math.max(0, Number(t) || 0)))
//                   }
//                   keyboardType="numeric"
//                   style={[styles.input, { marginTop: 6 }]}
//                 />
//               </View>
//             )}
//           </View>

//           {/* Manager Ratings */}
//           {Array.isArray(appraisal.managerRatings) &&
//             appraisal.managerRatings.length > 0 && (
//               <View style={{ marginBottom: 16 }}>
//                 <Text
//                   style={{
//                     fontSize: 12,
//                     fontWeight: "700",
//                     color: C.textMuted,
//                     marginBottom: 8,
//                   }}
//                 >
//                   Manager Ratings — {mgrName}
//                 </Text>
//                 {appraisal.managerRatings.map((r: any, i: number) => (
//                   <View
//                     key={i}
//                     style={{
//                       backgroundColor: C.surfaceAlt,
//                       borderRadius: 12,
//                       padding: 12,
//                       marginBottom: 6,
//                       borderWidth: 1,
//                       borderColor: C.border,
//                     }}
//                   >
//                     <View
//                       style={{
//                         flexDirection: "row",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                       }}
//                     >
//                       <Text
//                         style={{
//                           fontSize: 12,
//                           fontWeight: "600",
//                           color: C.textPrimary,
//                         }}
//                       >
//                         {r.label}
//                       </Text>
//                       <View
//                         style={{
//                           flexDirection: "row",
//                           alignItems: "center",
//                           gap: 6,
//                         }}
//                       >
//                         <StarDisplay score={r.score} max={r.maxScore ?? 5} />
//                         <Text
//                           style={{
//                             fontSize: 12,
//                             fontWeight: "700",
//                             color: C.primary,
//                           }}
//                         >
//                           {r.score}/{r.maxScore ?? 5}
//                         </Text>
//                       </View>
//                     </View>
//                     {r.comment ? (
//                       <Text
//                         style={{
//                           fontSize: 11,
//                           color: C.textMuted,
//                           marginTop: 4,
//                         }}
//                       >
//                         {r.comment}
//                       </Text>
//                     ) : null}
//                   </View>
//                 ))}
//                 {appraisal.managerFeedback && (
//                   <View
//                     style={{
//                       backgroundColor: C.primaryLight,
//                       padding: 10,
//                       borderRadius: 12,
//                       marginTop: 6,
//                     }}
//                   >
//                     <Text
//                       style={{
//                         fontSize: 12,
//                         color: C.primary,
//                       }}
//                     >
//                       <Text style={{ fontWeight: "700" }}>
//                         Manager feedback:
//                       </Text>{" "}
//                       {appraisal.managerFeedback}
//                     </Text>
//                   </View>
//                 )}
//               </View>
//             )}

//           {/* HR Ratings */}
//           {!rejectMode && !isLocked && (
//             <View style={{ marginBottom: 16 }}>
//               <View
//                 style={{
//                   flexDirection: "row",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   marginBottom: 8,
//                 }}
//               >
//                 <Text
//                   style={{
//                     fontSize: 12,
//                     fontWeight: "700",
//                     color: C.textPrimary,
//                   }}
//                 >
//                   Your HR Ratings
//                 </Text>
//                 <TouchableOpacity
//                   onPress={() => setSkipHrRating((v) => !v)}
//                   style={{
//                     paddingHorizontal: 10,
//                     paddingVertical: 4,
//                     borderRadius: 12,
//                     backgroundColor: skipHrRating ? "#d1fae5" : C.surfaceAlt,
//                     borderWidth: 1,
//                     borderColor: skipHrRating ? "#059669" : C.border,
//                   }}
//                 >
//                   <Text
//                     style={{
//                       fontSize: 10,
//                       fontWeight: "600",
//                       color: skipHrRating ? "#059669" : C.textSecondary,
//                     }}
//                   >
//                     {skipHrRating
//                       ? "✓ Trusting manager"
//                       : "Skip — trust manager"}
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               {!skipHrRating &&
//                 hrRatings.map((r: any, i: number) => (
//                   <View
//                     key={i}
//                     style={{
//                       backgroundColor: C.surfaceAlt,
//                       borderRadius: 12,
//                       padding: 12,
//                       marginBottom: 8,
//                       borderWidth: 1,
//                       borderColor: C.border,
//                     }}
//                   >
//                     <View
//                       style={{
//                         flexDirection: "row",
//                         justifyContent: "space-between",
//                         alignItems: "flex-start",
//                       }}
//                     >
//                       <View>
//                         <Text
//                           style={{
//                             fontSize: 13,
//                             fontWeight: "600",
//                             color: C.textPrimary,
//                           }}
//                         >
//                           {r.label}
//                         </Text>
//                         <Text
//                           style={{
//                             fontSize: 10,
//                             color: C.textMuted,
//                           }}
//                         >
//                           Weight: {r.weight}%
//                         </Text>
//                       </View>
//                       <StarPicker
//                         value={r.score}
//                         max={r.maxScore ?? 5}
//                         onChange={(v) => setRating(i, "score", v)}
//                       />
//                     </View>
//                     <Text
//                       style={{
//                         fontSize: 11,
//                         color: r.score > 0 ? "#f59e0b" : C.textMuted,
//                         marginTop: 4,
//                         textAlign: "right",
//                       }}
//                     >
//                       {r.score > 0
//                         ? `${r.score}/${r.maxScore ?? 5}`
//                         : "Not rated"}
//                     </Text>
//                     <TextInput
//                       value={r.comment}
//                       onChangeText={(t) => setRating(i, "comment", t)}
//                       placeholder="Optional HR comment..."
//                       placeholderTextColor={C.textMuted}
//                       style={[styles.input, { marginTop: 6, fontSize: 12 }]}
//                     />
//                   </View>
//                 ))}
//             </View>
//           )}

//           {/* HR Feedback */}
//           {!rejectMode && (
//             <View style={{ marginBottom: 16 }}>
//               <Text
//                 style={{
//                   fontSize: 12,
//                   fontWeight: "600",
//                   color: C.textPrimary,
//                   marginBottom: 6,
//                 }}
//               >
//                 HR Overall Feedback
//               </Text>
//               <TextInput
//                 value={hrFeedback}
//                 onChangeText={setHrFeedback}
//                 multiline
//                 numberOfLines={3}
//                 placeholder="Provide your HR assessment..."
//                 placeholderTextColor={C.textMuted}
//                 style={[
//                   styles.input,
//                   {
//                     height: 80,
//                     textAlignVertical: "top",
//                   },
//                 ]}
//                 editable={!isLocked}
//               />
//             </View>
//           )}

//           {/* Reject Panel */}
//           {rejectMode && (
//             <View
//               style={{
//                 backgroundColor: "#fee2e2",
//                 padding: 14,
//                 borderRadius: 16,
//                 marginBottom: 16,
//                 borderWidth: 1,
//                 borderColor: "#fecaca",
//               }}
//             >
//               <Text
//                 style={{
//                   fontSize: 14,
//                   fontWeight: "700",
//                   color: "#dc2626",
//                 }}
//               >
//                 Return Appraisal to Manager
//               </Text>
//               <Text
//                 style={{
//                   fontSize: 12,
//                   color: C.textSecondary,
//                   marginTop: 4,
//                   marginBottom: 10,
//                 }}
//               >
//                 Explain what needs to be corrected.
//               </Text>
//               <TextInput
//                 value={rejectReason}
//                 onChangeText={setRejectReason}
//                 multiline
//                 numberOfLines={3}
//                 placeholder="e.g. Some criteria are unrated..."
//                 placeholderTextColor={C.textMuted}
//                 style={[
//                   styles.input,
//                   {
//                     height: 80,
//                     textAlignVertical: "top",
//                     borderColor: "#f87171",
//                   },
//                 ]}
//               />
//             </View>
//           )}

//           <View style={{ height: 40 }} />
//         </ScrollView>

//         {/* Footer */}
//         <View
//           style={{
//             padding: 16,
//             borderTopWidth: 1,
//             borderTopColor: C.border,
//             backgroundColor: C.surface,
//           }}
//         >
//           {isLocked ? (
//             <View
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 gap: 6,
//               }}
//             >
//               <Lock size={14} color="#059669" />
//               <Text
//                 style={{
//                   fontSize: 14,
//                   fontWeight: "600",
//                   color: "#059669",
//                 }}
//               >
//                 This appraisal is finalised and locked.
//               </Text>
//             </View>
//           ) : rejectMode ? (
//             <View style={{ flexDirection: "row", gap: 10 }}>
//               <TouchableOpacity
//                 onPress={() => setRejectMode(false)}
//                 style={{
//                   flex: 1,
//                   padding: 12,
//                   borderRadius: 12,
//                   backgroundColor: C.surfaceAlt,
//                   alignItems: "center",
//                   borderWidth: 1,
//                   borderColor: C.border,
//                 }}
//               >
//                 <Text
//                   style={{
//                     color: C.textSecondary,
//                     fontWeight: "600",
//                   }}
//                 >
//                   Cancel
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={handleReject}
//                 disabled={saving}
//                 style={{
//                   flex: 1,
//                   padding: 12,
//                   borderRadius: 12,
//                   backgroundColor: "#dc2626",
//                   alignItems: "center",
//                   opacity: saving ? 0.7 : 1,
//                 }}
//               >
//                 <Text style={{ color: "#fff", fontWeight: "600" }}>
//                   {saving ? "Returning…" : "Return to Manager"}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           ) : (
//             <View
//               style={{
//                 flexDirection: "row",
//                 gap: 8,
//                 flexWrap: "wrap",
//               }}
//             >
//               <TouchableOpacity
//                 onPress={onClose}
//                 style={{
//                   padding: 12,
//                   borderRadius: 12,
//                   backgroundColor: C.surfaceAlt,
//                   alignItems: "center",
//                   borderWidth: 1,
//                   borderColor: C.border,
//                 }}
//               >
//                 <Text
//                   style={{
//                     color: C.textSecondary,
//                     fontWeight: "600",
//                   }}
//                 >
//                   Cancel
//                 </Text>
//               </TouchableOpacity>

//               {appraisal.status === "submitted" && (
//                 <TouchableOpacity
//                   onPress={() => setRejectMode(true)}
//                   style={{
//                     padding: 12,
//                     borderRadius: 12,
//                     backgroundColor: "#fee2e2",
//                     alignItems: "center",
//                     borderWidth: 1,
//                     borderColor: "#fecaca",
//                   }}
//                 >
//                   <Text
//                     style={{
//                       color: "#dc2626",
//                       fontWeight: "600",
//                     }}
//                   >
//                     Return
//                   </Text>
//                 </TouchableOpacity>
//               )}

//               {appraisal.status === "submitted" && (
//                 <TouchableOpacity
//                   onPress={() => handleSaveReview(false)}
//                   disabled={saving}
//                   style={{
//                     flex: 1,
//                     padding: 12,
//                     borderRadius: 12,
//                     backgroundColor: C.primaryLight,
//                     alignItems: "center",
//                     borderWidth: 1,
//                     borderColor: `${C.primary}33`,
//                     opacity: saving ? 0.7 : 1,
//                   }}
//                 >
//                   <Text
//                     style={{
//                       color: C.primary,
//                       fontWeight: "600",
//                     }}
//                   >
//                     {saving ? "Saving…" : "Save HR Review"}
//                   </Text>
//                 </TouchableOpacity>
//               )}

//               <TouchableOpacity
//                 onPress={() => handleSaveReview(true)}
//                 disabled={saving}
//                 style={{
//                   flex: 1,
//                   padding: 12,
//                   borderRadius: 12,
//                   backgroundColor: "#059669",
//                   alignItems: "center",
//                   opacity: saving ? 0.7 : 1,
//                 }}
//               >
//                 <Text style={{ color: "#fff", fontWeight: "600" }}>
//                   {saving
//                     ? "Saving…"
//                     : isHrScored
//                       ? "Finalise & Lock"
//                       : "Review & Finalise"}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       </View>
//     </Modal>
//   );
// }

// export default function AppraisalReviewView({
//   searchQuery,
// }: {
//   searchQuery: string;
// }) {
//   const [appraisals, setAppraisals] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [statusFilter, setStatusFilter] = useState("");
//   const [selected, setSelected] = useState<any>(null);
//   const [toast, setToast] = useState<string | null>(null);

//   const showToast = (msg: string) => {
//     setToast(msg);
//     setTimeout(() => setToast(null), 3500);
//   };

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       let data: any[] = [];
//       if (!statusFilter) {
//         const [s1, s2] = await Promise.allSettled([
//           listAppraisals({ status: "submitted" }),
//           listAppraisals({ status: "hr_scored" }),
//         ]);
//         data = [
//           ...(s1.status === "fulfilled" ? (s1.value?.appraisals ?? []) : []),
//           ...(s2.status === "fulfilled" ? (s2.value?.appraisals ?? []) : []),
//         ];
//       } else {
//         const res = await listAppraisals({ status: statusFilter });
//         data = res?.appraisals ?? [];
//       }
//       setAppraisals(data);
//     } catch (err: any) {
//       setError(err?.response?.data?.message ?? "Failed to load appraisals.");
//     } finally {
//       setLoading(false);
//     }
//   }, [statusFilter]);

//   useEffect(() => {
//     load();
//   }, [load]);

//   const filtered = appraisals.filter((a: any) => {
//     const q = searchQuery.toLowerCase();
//     const name = a.employee
//       ? `${a.employee.firstName} ${a.employee.lastName}`.toLowerCase()
//       : "";
//     return !q || name.includes(q) || a.period?.toLowerCase().includes(q);
//   });

//   const pendingCount = appraisals.filter(
//     (a: any) => a.status === "submitted",
//   ).length;

//   const statuses = [
//     { key: "", label: "HR Inbox" },
//     { key: "submitted", label: "Submitted" },
//     { key: "hr_scored", label: "HR Scored" },
//     { key: "completed", label: "Completed" },
//     { key: "rejected", label: "Returned" },
//   ];

//   return (
//     <View>
//       <View
//         style={{
//           flexDirection: "row",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: 12,
//         }}
//       >
//         <View>
//           <Text
//             style={{
//               fontSize: 16,
//               fontWeight: "700",
//               color: C.textPrimary,
//             }}
//           >
//             Appraisal Reviews
//           </Text>
//           <Text
//             style={{
//               fontSize: 11,
//               color: C.textMuted,
//               marginTop: 2,
//             }}
//           >
//             Review and finalise manager submissions
//           </Text>
//         </View>
//         <TouchableOpacity onPress={load} style={styles.iconBtn}>
//           <RefreshCw size={14} color={C.textSecondary} />
//         </TouchableOpacity>
//       </View>

//       {!statusFilter && pendingCount > 0 && (
//         <View
//           style={{
//             backgroundColor: "#f3e8ff",
//             padding: 12,
//             borderRadius: 16,
//             marginBottom: 12,
//             borderWidth: 1,
//             borderColor: "#7c3aed22",
//             flexDirection: "row",
//             alignItems: "center",
//             gap: 10,
//           }}
//         >
//           <View
//             style={{
//               width: 36,
//               height: 36,
//               borderRadius: 12,
//               backgroundColor: "#7c3aed",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <Shield size={16} color="#fff" />
//           </View>
//           <View style={{ flex: 1 }}>
//             <Text
//               style={{
//                 fontSize: 13,
//                 fontWeight: "600",
//                 color: C.textPrimary,
//               }}
//             >
//               {pendingCount} appraisal
//               {pendingCount > 1 ? "s" : ""} awaiting HR review
//             </Text>
//             <Text
//               style={{
//                 fontSize: 11,
//                 color: C.textSecondary,
//               }}
//             >
//               Score each one to update performance records.
//             </Text>
//           </View>
//         </View>
//       )}

//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={{ gap: 8, marginBottom: 12 }}
//       >
//         {statuses.map((s) => (
//           <TouchableOpacity
//             key={s.key}
//             onPress={() => setStatusFilter(s.key)}
//             style={{
//               paddingHorizontal: 12,
//               paddingVertical: 6,
//               borderRadius: 20,
//               backgroundColor: statusFilter === s.key ? C.primary : C.surface,
//               borderWidth: 1,
//               borderColor: statusFilter === s.key ? C.primary : C.border,
//             }}
//           >
//             <Text
//               style={{
//                 fontSize: 11,
//                 fontWeight: "700",
//                 color: statusFilter === s.key ? "#fff" : C.textSecondary,
//               }}
//             >
//               {s.label}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       {loading ? (
//         <ActivityIndicator color={C.primary} style={{ marginTop: 24 }} />
//       ) : error ? (
//         <View
//           style={{
//             backgroundColor: "#fee2e2",
//             padding: 12,
//             borderRadius: 12,
//             flexDirection: "row",
//             alignItems: "center",
//             gap: 8,
//           }}
//         >
//           <AlertTriangle size={16} color="#dc2626" />
//           <Text
//             style={{
//               color: "#dc2626",
//               fontSize: 13,
//               flex: 1,
//             }}
//           >
//             {error}
//           </Text>
//         </View>
//       ) : filtered.length === 0 ? (
//         <View style={{ alignItems: "center", padding: 40 }}>
//           <ClipboardList size={32} color={C.textMuted} />
//           <Text style={{ color: C.textPrimary, marginTop: 8 }}>
//             No appraisals found
//           </Text>
//         </View>
//       ) : (
//         <View style={{ gap: 10 }}>
//           {filtered.map((app: any) => {
//             const empName = app.employee
//               ? `${app.employee.firstName} ${app.employee.lastName}`
//               : "Employee";
//             const mgrName = app.manager
//               ? `${app.manager.firstName} ${app.manager.lastName}`
//               : "—";
//             const isActionable = ["submitted", "hr_scored"].includes(
//               app.status,
//             );
//             return (
//               <TouchableOpacity
//                 key={app.id}
//                 onPress={() => setSelected(app)}
//                 activeOpacity={0.8}
//                 style={{
//                   backgroundColor: C.surface,
//                   borderRadius: 16,
//                   padding: 14,
//                   borderWidth: 1,
//                   borderColor: C.border,
//                 }}
//               >
//                 <View
//                   style={{
//                     flexDirection: "row",
//                     justifyContent: "space-between",
//                     alignItems: "flex-start",
//                     marginBottom: 8,
//                   }}
//                 >
//                   <View>
//                     <Text
//                       style={{
//                         fontSize: 14,
//                         fontWeight: "700",
//                         color: C.textPrimary,
//                       }}
//                     >
//                       {empName}
//                     </Text>
//                     <Text
//                       style={{
//                         fontSize: 11,
//                         color: C.textMuted,
//                         marginTop: 2,
//                       }}
//                     >
//                       {app.employee?.department ?? ""} · {app.period}
//                     </Text>
//                   </View>
//                   <StatusBadge status={app.status} />
//                 </View>

//                 <View
//                   style={{
//                     flexDirection: "row",
//                     gap: 16,
//                     marginTop: 4,
//                   }}
//                 >
//                   <View>
//                     <Text
//                       style={{
//                         fontSize: 10,
//                         color: C.textMuted,
//                       }}
//                     >
//                       Manager Score
//                     </Text>
//                     <Text
//                       style={{
//                         fontSize: 16,
//                         fontWeight: "700",
//                         color: C.primary,
//                       }}
//                     >
//                       {app.managerOverall != null
//                         ? Math.round(app.managerOverall)
//                         : "—"}
//                     </Text>
//                   </View>
//                   <View>
//                     <Text
//                       style={{
//                         fontSize: 10,
//                         color: C.textMuted,
//                       }}
//                     >
//                       HR Score
//                     </Text>
//                     <Text
//                       style={{
//                         fontSize: 16,
//                         fontWeight: "700",
//                         color: "#7c3aed",
//                       }}
//                     >
//                       {app.hrOverall != null ? Math.round(app.hrOverall) : "—"}
//                     </Text>
//                   </View>
//                   <View>
//                     <Text
//                       style={{
//                         fontSize: 10,
//                         color: C.textMuted,
//                       }}
//                     >
//                       Blended
//                     </Text>
//                     <Text
//                       style={{
//                         fontSize: 16,
//                         fontWeight: "700",
//                         color: "#059669",
//                       }}
//                     >
//                       {app.appraisalScore != null
//                         ? Math.round(app.appraisalScore)
//                         : "—"}
//                     </Text>
//                   </View>
//                 </View>

//                 <View
//                   style={{
//                     flexDirection: "row",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     marginTop: 10,
//                   }}
//                 >
//                   <Text
//                     style={{
//                       fontSize: 11,
//                       color: C.textSecondary,
//                     }}
//                   >
//                     Manager: {mgrName}
//                   </Text>
//                   <View
//                     style={{
//                       paddingHorizontal: 10,
//                       paddingVertical: 4,
//                       borderRadius: 8,
//                       backgroundColor: isActionable
//                         ? app.status === "hr_scored"
//                           ? "#d1fae5"
//                           : "#f3e8ff"
//                         : C.surfaceAlt,
//                     }}
//                   >
//                     <Text
//                       style={{
//                         fontSize: 11,
//                         fontWeight: "600",
//                         color: isActionable
//                           ? app.status === "hr_scored"
//                             ? "#059669"
//                             : "#7c3aed"
//                           : C.textMuted,
//                       }}
//                     >
//                       {isActionable
//                         ? app.status === "hr_scored"
//                           ? "Finalise"
//                           : "HR Review"
//                         : "Locked"}
//                     </Text>
//                   </View>
//                 </View>
//               </TouchableOpacity>
//             );
//           })}
//         </View>
//       )}

//       {selected && (
//         <HRReviewModal
//           appraisal={selected}
//           onClose={() => setSelected(null)}
//           onSaved={(msg: string) => {
//             setSelected(null);
//             showToast(msg);
//             load();
//           }}
//         />
//       )}

//       {toast && (
//         <View
//           style={{
//             position: "absolute",
//             bottom: 24,
//             left: 16,
//             right: 16,
//             backgroundColor: "#1e293b",
//             padding: 14,
//             borderRadius: 16,
//             flexDirection: "row",
//             alignItems: "center",
//             gap: 8,
//             zIndex: 50,
//           }}
//         >
//           <CheckCircle2 size={14} color="#10b981" />
//           <Text
//             style={{
//               color: "#fff",
//               fontSize: 13,
//               fontWeight: "500",
//             }}
//           >
//             {toast}
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   input: {
//     backgroundColor: C.surfaceAlt,
//     padding: 10,
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: C.border,
//     color: C.textPrimary,
//     fontSize: 14,
//   },
//   iconBtn: {
//     width: 32,
//     height: 32,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
// });



// src/components/admin/performance/AppraisalReviewView.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  RefreshCw,
  AlertTriangle,
  Star,
  Shield,
  CheckCircle2,
  Lock,
  ThumbsDown,
  X,
  ClipboardList,
} from "lucide-react-native";
import C from "../../../styles/colors";
import {
  listAppraisals,
  hrReviewAppraisal,
  finalizeAppraisal,
  rejectAppraisal,
} from "../../../api/service/appraisal.api";
import { Loader } from "../../../hooks/loaderManager";

const STATUS_CFG: Record<string, { label: string; bg: string; color: string }> =
  {
    submitted: { label: "Submitted", bg: "#fef3c7", color: "#d97706" },
    hr_scored: { label: "HR Scored", bg: "#f3e8ff", color: "#7c3aed" },
    completed: { label: "Completed", bg: "#d1fae5", color: "#059669" },
    rejected: { label: "Returned", bg: "#fee2e2", color: "#dc2626" },
  };

const CRITERIA_DEFAULTS = [
  { label: "Job Knowledge", weight: 20, maxScore: 5 },
  { label: "Quality of Work", weight: 20, maxScore: 5 },
  { label: "Communication", weight: 15, maxScore: 5 },
  { label: "Teamwork", weight: 15, maxScore: 5 },
  { label: "Initiative", weight: 15, maxScore: 5 },
  { label: "Professionalism", weight: 15, maxScore: 5 },
];

function RATING_LABEL(score: number) {
  if (score >= 90) return { label: "Outstanding", color: "#059669" };
  if (score >= 75) return { label: "High Performer", color: "#2563eb" };
  if (score >= 60) return { label: "Meets Expectations", color: "#d97706" };
  if (score >= 40) return { label: "Needs Improvement", color: "#dc2626" };
  return { label: "Underperforming", color: "#7c3aed" };
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status?.toLowerCase()] ?? {
    bg: C.surfaceAlt,
    color: C.textMuted,
    label: status,
  };
  return (
    <View
      style={{
        backgroundColor: cfg.bg,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color: cfg.color, fontSize: 10, fontWeight: "700" }}>
        {cfg.label}
      </Text>
    </View>
  );
}

function StarDisplay({ score, max = 5 }: { score: number; max?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={14}
          fill={i < score ? "#f59e0b" : "none"}
          color={i < score ? "#f59e0b" : C.border}
        />
      ))}
    </View>
  );
}

function StarPicker({
  value,
  max = 5,
  onChange,
}: {
  value: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {Array.from({ length: max }).map((_, i) => (
        <TouchableOpacity key={i} onPress={() => onChange(i + 1)}>
          <Star
            size={24}
            fill={i < value ? "#f59e0b" : "none"}
            color={i < value ? "#f59e0b" : C.border}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function HRReviewModal({ appraisal, onClose, onSaved }: any) {
  const [hrRatings, setHrRatings] = useState(() => {
    const source = appraisal.hrRatings?.length
      ? appraisal.hrRatings
      : appraisal.managerRatings?.length
        ? appraisal.managerRatings
        : CRITERIA_DEFAULTS;
    return source.map((r: any) => ({
      label: r.label,
      weight: r.weight ?? 100 / source.length,
      maxScore: r.maxScore ?? 5,
      score: appraisal.hrRatings?.length ? (r.score ?? 0) : 0,
      comment: appraisal.hrRatings?.length ? (r.comment ?? "") : "",
    }));
  });
  const [hrFeedback, setHrFeedback] = useState(appraisal.hrFeedback ?? "");
  const [hrScoreWeight, setHrScoreWeight] = useState(
    appraisal.hrScoreWeight ?? 20,
  );
  const [skipHrRating, setSkipHrRating] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isLocked = appraisal.status === "completed";
  const isHrScored = appraisal.status === "hr_scored";

  const managerOverall = Number(appraisal.managerOverall ?? 0);

  const hrOverall = (() => {
    if (skipHrRating) return managerOverall;
    const rated = hrRatings.filter((r: any) => Number(r.score ?? 0) > 0);
    if (!rated.length) return managerOverall;
    const totalW = rated.reduce(
      (s: number, r: any) => s + (Number(r.weight) || 1),
      0,
    );
    return rated.reduce(
      (s: number, r: any) =>
        s +
        (Number(r.score) / (r.maxScore ?? 5)) *
          100 *
          ((Number(r.weight) || 1) / totalW),
      0,
    );
  })();

  const mgrWeight = 100 - hrScoreWeight;
  const blended = Math.round(
    managerOverall * (mgrWeight / 100) + hrOverall * (hrScoreWeight / 100),
  );
  const ratingInfo = RATING_LABEL(blended);

  const setRating = (i: number, field: string, val: any) =>
    setHrRatings((prev: any[]) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)),
    );

  const handleSaveReview = async (andFinalize = false) => {
    setSaving(true);
    setError("");
    Loader.show();
    try {
      await hrReviewAppraisal(appraisal.id, {
        hrFeedback: hrFeedback.trim() || undefined,
        hrRatings: skipHrRating
          ? []
          : hrRatings.filter((r: any) => r.score > 0),
        hrScoreWeight,
      });
      if (andFinalize) {
        await finalizeAppraisal(appraisal.id);
        onSaved("Appraisal finalised — performance score updated.");
      } else {
        onSaved("HR review saved.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save HR review.");
    } finally {
      setSaving(false);
      Loader.hide();
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError("Rejection reason is required.");
      return;
    }
    setSaving(true);
    setError("");
    Loader.show();
    try {
      await rejectAppraisal(appraisal.id, {
        reason: rejectReason.trim(),
      });
      onSaved("Appraisal returned to manager for revision.");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to reject.");
    } finally {
      setSaving(false);
      Loader.hide();
    }
  };

  const empName = appraisal.employee
    ? `${appraisal.employee.firstName} ${appraisal.employee.lastName}`
    : "Employee";
  const mgrName = appraisal.manager
    ? `${appraisal.manager.firstName} ${appraisal.manager.lastName}`
    : "Manager";

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: C.border,
            backgroundColor: C.surface,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: "#f3e8ff",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={14} color="#7c3aed" />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: C.textPrimary,
                }}
              >
                HR Review — {empName}
              </Text>
              <Text style={{ fontSize: 10, color: C.textMuted }}>
                {appraisal.period}{" "}
                {appraisal.cycleName ? `· ${appraisal.cycleName}` : ""}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose}>
            <X size={20} color={C.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {error ? (
            <View
              style={{
                backgroundColor: "#fee2e2",
                padding: 10,
                borderRadius: 12,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: "#dc2626", fontSize: 12 }}>{error}</Text>
            </View>
          ) : null}

          {/* Score Preview */}
          <View
            style={{
              backgroundColor: C.surfaceAlt,
              borderRadius: 16,
              padding: 14,
              borderWidth: 1,
              borderColor: C.border,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: C.textPrimary,
                marginBottom: 10,
              }}
            >
              Live Score Preview
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginBottom: 10,
              }}
            >
              {[
                {
                  label: "Manager",
                  value: Math.round(managerOverall),
                  color: C.primary,
                  bg: C.primaryLight,
                },
                {
                  label: "HR",
                  value: Math.round(hrOverall),
                  color: "#7c3aed",
                  bg: "#f3e8ff",
                },
                {
                  label: "Blended",
                  value: blended,
                  color: ratingInfo.color,
                  bg: "#d1fae5",
                },
              ].map((s) => (
                <View
                  key={s.label}
                  style={{
                    flex: 1,
                    backgroundColor: s.bg,
                    borderRadius: 12,
                    padding: 10,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "800",
                      color: s.color,
                    }}
                  >
                    {s.value}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "600",
                      color: s.color,
                      marginTop: 2,
                    }}
                  >
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={{ fontSize: 11, color: C.textSecondary }}>
              Projected rating:{" "}
              <Text
                style={{
                  fontWeight: "700",
                  color: ratingInfo.color,
                }}
              >
                {ratingInfo.label}
              </Text>
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: C.textMuted,
                marginTop: 4,
              }}
            >
              Manager {mgrWeight}% · HR {hrScoreWeight}%
            </Text>

            {!isLocked && (
              <View style={{ marginTop: 12 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: C.textPrimary,
                  }}
                >
                  HR Score Weight: {hrScoreWeight}%
                </Text>
                <TextInput
                  value={String(hrScoreWeight)}
                  onChangeText={(t) =>
                    setHrScoreWeight(Math.min(50, Math.max(0, Number(t) || 0)))
                  }
                  keyboardType="numeric"
                  style={[styles.input, { marginTop: 6 }]}
                />
              </View>
            )}
          </View>

          {/* Manager Ratings */}
          {Array.isArray(appraisal.managerRatings) &&
            appraisal.managerRatings.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: C.textMuted,
                    marginBottom: 8,
                  }}
                >
                  Manager Ratings — {mgrName}
                </Text>
                {appraisal.managerRatings.map((r: any, i: number) => (
                  <View
                    key={i}
                    style={{
                      backgroundColor: C.surfaceAlt,
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 6,
                      borderWidth: 1,
                      borderColor: C.border,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "600",
                          color: C.textPrimary,
                        }}
                      >
                        {r.label}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <StarDisplay score={r.score} max={r.maxScore ?? 5} />
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "700",
                            color: C.primary,
                          }}
                        >
                          {r.score}/{r.maxScore ?? 5}
                        </Text>
                      </View>
                    </View>
                    {r.comment ? (
                      <Text
                        style={{
                          fontSize: 11,
                          color: C.textMuted,
                          marginTop: 4,
                        }}
                      >
                        {r.comment}
                      </Text>
                    ) : null}
                  </View>
                ))}
                {appraisal.managerFeedback && (
                  <View
                    style={{
                      backgroundColor: C.primaryLight,
                      padding: 10,
                      borderRadius: 12,
                      marginTop: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: C.primary,
                      }}
                    >
                      <Text style={{ fontWeight: "700" }}>
                        Manager feedback:
                      </Text>{" "}
                      {appraisal.managerFeedback}
                    </Text>
                  </View>
                )}
              </View>
            )}

          {/* HR Ratings */}
          {!rejectMode && !isLocked && (
            <View style={{ marginBottom: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: C.textPrimary,
                  }}
                >
                  Your HR Ratings
                </Text>
                <TouchableOpacity
                  onPress={() => setSkipHrRating((v) => !v)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                    backgroundColor: skipHrRating ? "#d1fae5" : C.surfaceAlt,
                    borderWidth: 1,
                    borderColor: skipHrRating ? "#059669" : C.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "600",
                      color: skipHrRating ? "#059669" : C.textSecondary,
                    }}
                  >
                    {skipHrRating
                      ? "✓ Trusting manager"
                      : "Skip — trust manager"}
                  </Text>
                </TouchableOpacity>
              </View>

              {!skipHrRating &&
                hrRatings.map((r: any, i: number) => (
                  <View
                    key={i}
                    style={{
                      backgroundColor: C.surfaceAlt,
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: C.border,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <View>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color: C.textPrimary,
                          }}
                        >
                          {r.label}
                        </Text>
                        <Text
                          style={{
                            fontSize: 10,
                            color: C.textMuted,
                          }}
                        >
                          Weight: {r.weight}%
                        </Text>
                      </View>
                      <StarPicker
                        value={r.score}
                        max={r.maxScore ?? 5}
                        onChange={(v) => setRating(i, "score", v)}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 11,
                        color: r.score > 0 ? "#f59e0b" : C.textMuted,
                        marginTop: 4,
                        textAlign: "right",
                      }}
                    >
                      {r.score > 0
                        ? `${r.score}/${r.maxScore ?? 5}`
                        : "Not rated"}
                    </Text>
                    <TextInput
                      value={r.comment}
                      onChangeText={(t) => setRating(i, "comment", t)}
                      placeholder="Optional HR comment..."
                      placeholderTextColor={C.textMuted}
                      style={[styles.input, { marginTop: 6, fontSize: 12 }]}
                    />
                  </View>
                ))}
            </View>
          )}

          {/* HR Feedback */}
          {!rejectMode && (
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: C.textPrimary,
                  marginBottom: 6,
                }}
              >
                HR Overall Feedback
              </Text>
              <TextInput
                value={hrFeedback}
                onChangeText={setHrFeedback}
                multiline
                numberOfLines={3}
                placeholder="Provide your HR assessment..."
                placeholderTextColor={C.textMuted}
                style={[
                  styles.input,
                  {
                    height: 80,
                    textAlignVertical: "top",
                  },
                ]}
                editable={!isLocked}
              />
            </View>
          )}

          {/* Reject Panel */}
          {rejectMode && (
            <View
              style={{
                backgroundColor: "#fee2e2",
                padding: 14,
                borderRadius: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "#fecaca",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#dc2626",
                }}
              >
                Return Appraisal to Manager
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: C.textSecondary,
                  marginTop: 4,
                  marginBottom: 10,
                }}
              >
                Explain what needs to be corrected.
              </Text>
              <TextInput
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
                numberOfLines={3}
                placeholder="e.g. Some criteria are unrated..."
                placeholderTextColor={C.textMuted}
                style={[
                  styles.input,
                  {
                    height: 80,
                    textAlignVertical: "top",
                    borderColor: "#f87171",
                  },
                ]}
              />
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Footer */}
        <View
          style={{
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: C.border,
            backgroundColor: C.surface,
          }}
        >
          {isLocked ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Lock size={14} color="#059669" />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#059669",
                }}
              >
                This appraisal is finalised and locked.
              </Text>
            </View>
          ) : rejectMode ? (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => setRejectMode(false)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: C.surfaceAlt,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: C.border,
                }}
              >
                <Text
                  style={{
                    color: C.textSecondary,
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleReject}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: "#dc2626",
                  alignItems: "center",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  {saving ? "Returning…" : "Return to Manager"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <TouchableOpacity
                onPress={onClose}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: C.surfaceAlt,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: C.border,
                }}
              >
                <Text
                  style={{
                    color: C.textSecondary,
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              {appraisal.status === "submitted" && (
                <TouchableOpacity
                  onPress={() => setRejectMode(true)}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor: "#fee2e2",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#fecaca",
                  }}
                >
                  <Text
                    style={{
                      color: "#dc2626",
                      fontWeight: "600",
                    }}
                  >
                    Return
                  </Text>
                </TouchableOpacity>
              )}

              {appraisal.status === "submitted" && (
                <TouchableOpacity
                  onPress={() => handleSaveReview(false)}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor: C.primaryLight,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: `${C.primary}33`,
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  <Text
                    style={{
                      color: C.primary,
                      fontWeight: "600",
                    }}
                  >
                    {saving ? "Saving…" : "Save HR Review"}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => handleSaveReview(true)}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: "#059669",
                  alignItems: "center",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  {saving
                    ? "Saving…"
                    : isHrScored
                      ? "Finalise & Lock"
                      : "Review & Finalise"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function AppraisalReviewView({
  searchQuery,
}: {
  searchQuery: string;
}) {
  const [appraisals, setAppraisals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    Loader.show();
    try {
      let data: any[] = [];
      if (!statusFilter) {
        const [s1, s2] = await Promise.allSettled([
          listAppraisals({ status: "submitted" }),
          listAppraisals({ status: "hr_scored" }),
        ]);
        data = [
          ...(s1.status === "fulfilled" ? (s1.value?.appraisals ?? []) : []),
          ...(s2.status === "fulfilled" ? (s2.value?.appraisals ?? []) : []),
        ];
      } else {
        const res = await listAppraisals({ status: statusFilter });
        data = res?.appraisals ?? [];
      }
      setAppraisals(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load appraisals.");
    } finally {
      setLoading(false);
      Loader.hide();
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = appraisals.filter((a: any) => {
    const q = searchQuery.toLowerCase();
    const name = a.employee
      ? `${a.employee.firstName} ${a.employee.lastName}`.toLowerCase()
      : "";
    return !q || name.includes(q) || a.period?.toLowerCase().includes(q);
  });

  const pendingCount = appraisals.filter(
    (a: any) => a.status === "submitted",
  ).length;

  const statuses = [
    { key: "", label: "HR Inbox" },
    { key: "submitted", label: "Submitted" },
    { key: "hr_scored", label: "HR Scored" },
    { key: "completed", label: "Completed" },
    { key: "rejected", label: "Returned" },
  ];

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: C.textPrimary,
            }}
          >
            Appraisal Reviews
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: C.textMuted,
              marginTop: 2,
            }}
          >
            Review and finalise manager submissions
          </Text>
        </View>
        <TouchableOpacity onPress={load} style={styles.iconBtn}>
          <RefreshCw size={14} color={C.textSecondary} />
        </TouchableOpacity>
      </View>

      {!statusFilter && pendingCount > 0 && (
        <View
          style={{
            backgroundColor: "#f3e8ff",
            padding: 12,
            borderRadius: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: "#7c3aed22",
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: "#7c3aed",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={16} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: C.textPrimary,
              }}
            >
              {pendingCount} appraisal
              {pendingCount > 1 ? "s" : ""} awaiting HR review
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: C.textSecondary,
              }}
            >
              Score each one to update performance records.
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, marginBottom: 12 }}
      >
        {statuses.map((s) => (
          <TouchableOpacity
            key={s.key}
            onPress={() => setStatusFilter(s.key)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: statusFilter === s.key ? C.primary : C.surface,
              borderWidth: 1,
              borderColor: statusFilter === s.key ? C.primary : C.border,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: statusFilter === s.key ? "#fff" : C.textSecondary,
              }}
            >
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={C.primary} style={{ marginTop: 24 }} />
      ) : error ? (
        <View
          style={{
            backgroundColor: "#fee2e2",
            padding: 12,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <AlertTriangle size={16} color="#dc2626" />
          <Text
            style={{
              color: "#dc2626",
              fontSize: 13,
              flex: 1,
            }}
          >
            {error}
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={{ alignItems: "center", padding: 40 }}>
          <ClipboardList size={32} color={C.textMuted} />
          <Text style={{ color: C.textPrimary, marginTop: 8 }}>
            No appraisals found
          </Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {filtered.map((app: any) => {
            const empName = app.employee
              ? `${app.employee.firstName} ${app.employee.lastName}`
              : "Employee";
            const mgrName = app.manager
              ? `${app.manager.firstName} ${app.manager.lastName}`
              : "—";
            const isActionable = ["submitted", "hr_scored"].includes(
              app.status,
            );
            return (
              <TouchableOpacity
                key={app.id}
                onPress={() => setSelected(app)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: C.surface,
                  borderRadius: 16,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: C.border,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: C.textPrimary,
                      }}
                    >
                      {empName}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: C.textMuted,
                        marginTop: 2,
                      }}
                    >
                      {app.employee?.department ?? ""} · {app.period}
                    </Text>
                  </View>
                  <StatusBadge status={app.status} />
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    gap: 16,
                    marginTop: 4,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 10,
                        color: C.textMuted,
                      }}
                    >
                      Manager Score
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: C.primary,
                      }}
                    >
                      {app.managerOverall != null
                        ? Math.round(app.managerOverall)
                        : "—"}
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 10,
                        color: C.textMuted,
                      }}
                    >
                      HR Score
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#7c3aed",
                      }}
                    >
                      {app.hrOverall != null ? Math.round(app.hrOverall) : "—"}
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 10,
                        color: C.textMuted,
                      }}
                    >
                      Blended
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#059669",
                      }}
                    >
                      {app.appraisalScore != null
                        ? Math.round(app.appraisalScore)
                        : "—"}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: C.textSecondary,
                    }}
                  >
                    Manager: {mgrName}
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                      backgroundColor: isActionable
                        ? app.status === "hr_scored"
                          ? "#d1fae5"
                          : "#f3e8ff"
                        : C.surfaceAlt,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "600",
                        color: isActionable
                          ? app.status === "hr_scored"
                            ? "#059669"
                            : "#7c3aed"
                          : C.textMuted,
                      }}
                    >
                      {isActionable
                        ? app.status === "hr_scored"
                          ? "Finalise"
                          : "HR Review"
                        : "Locked"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {selected && (
        <HRReviewModal
          appraisal={selected}
          onClose={() => setSelected(null)}
          onSaved={(msg: string) => {
            setSelected(null);
            showToast(msg);
            load();
          }}
        />
      )}

      {toast && (
        <View
          style={{
            position: "absolute",
            bottom: 24,
            left: 16,
            right: 16,
            backgroundColor: "#1e293b",
            padding: 14,
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            zIndex: 50,
          }}
        >
          <CheckCircle2 size={14} color="#10b981" />
          <Text
            style={{
              color: "#fff",
              fontSize: 13,
              fontWeight: "500",
            }}
          >
            {toast}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: C.surfaceAlt,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    color: C.textPrimary,
    fontSize: 14,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
});