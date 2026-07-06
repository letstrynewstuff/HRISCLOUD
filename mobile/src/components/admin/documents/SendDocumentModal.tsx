// // src/components/admin/documents/SendDocumentModal.tsx
// // 3-step wizard: pick file (expo-document-picker) → select employees → message & send.

// import { useState, useEffect, useCallback } from "react";
// import {
//   Modal,
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   TextInput,
//   ScrollView,
//   ActivityIndicator,
// } from "react-native";
// import * as DocumentPicker from "expo-document-picker";
// import {
//   X,
//   Upload,
//   FileText,
//   FileType2,
//   ChevronLeft,
//   ChevronRight,
//   Send,
//   AlertTriangle,
//   CheckCircle2,
// } from "lucide-react-native";

// import C from "../../../styles/colors";
// import { documentApi } from "../../../api/service/documentApi";
// import { getEmployees } from "../../../api/service/employeeApi";
// import { CATEGORIES, getInitials } from "./documentsShared";
// import StepIndicator from "./StepIndicator";
// import EmployeePickerList from "./EmployeePickerList";

// interface Props {
//   visible: boolean;
//   onClose: () => void;
//   onSuccess: (count: number) => void;
// }

// const NEXT_STEPS_INFO = [
//   "Each employee receives an in-app notification",
//   "The document appears in their Documents page",
//   "They can open, read and electronically sign it",
//   "You'll see the status update to Signed here instantly",
// ];

// export default function SendDocumentModal({
//   visible,
//   onClose,
//   onSuccess,
// }: Props) {
//   const [step, setStep] = useState(1);

//   // Step 1
//   const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
//     null,
//   );
//   const [docName, setDocName] = useState("");
//   const [category, setCategory] = useState("Contract");
//   const [uploading, setUploading] = useState(false);
//   const [uploadedDoc, setUploadedDoc] = useState<any | null>(null);
//   const [err1, setErr1] = useState("");

//   // Step 2
//   const [employees, setEmployees] = useState<any[]>([]);
//   const [empLoading, setEmpLoading] = useState(false);
//   const [empSearch, setEmpSearch] = useState("");
//   const [selected, setSelected] = useState<string[]>([]);
//   const [err2, setErr2] = useState("");

//   // Step 3
//   const [message, setMessage] = useState("");
//   const [sending, setSending] = useState(false);
//   const [err3, setErr3] = useState("");

//   const reset = () => {
//     setStep(1);
//     setFile(null);
//     setDocName("");
//     setCategory("Contract");
//     setUploadedDoc(null);
//     setErr1("");
//     setEmployees([]);
//     setEmpSearch("");
//     setSelected([]);
//     setErr2("");
//     setMessage("");
//     setErr3("");
//   };

//   const handleClose = () => {
//     reset();
//     onClose();
//   };

//   // Load employees on entering step 2
//   const loadEmployees = useCallback(() => {
//     setEmpLoading(true);
//     getEmployees({ limit: 200 })
//       .then((res: any) => {
//         const list = res?.data ?? res ?? [];
//         setEmployees(Array.isArray(list) ? list : []);
//       })
//       .catch(() => setErr2("Could not load employees. Please try again."))
//       .finally(() => setEmpLoading(false));
//   }, []);

//   useEffect(() => {
//     if (step === 2 && employees.length === 0) loadEmployees();
//   }, [step, employees.length, loadEmployees]);

//   const handlePickFile = async () => {
//     setErr1("");
//     const res = await DocumentPicker.getDocumentAsync({
//       type: [
//         "application/pdf",
//         "application/msword",
//         "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       ],
//       copyToCacheDirectory: true,
//     });
//     if (res.canceled || !res.assets?.length) return;
//     const picked = res.assets[0];
//     setFile(picked);
//     if (!docName) setDocName(picked.name.replace(/\.[^.]+$/, ""));
//   };

//   const handleUpload = async () => {
//     if (!file) return setErr1("Please select a file first.");
//     if (!docName.trim()) return setErr1("Please enter a document name.");
//     setUploading(true);
//     setErr1("");
//     try {
//       // RN-style file object for FormData — same documentApi.uploadFile()
//       // used on web works here too since FormData accepts { uri, name, type }.
//       const fileForUpload: any = {
//         uri: file.uri,
//         name: file.name,
//         type: file.mimeType ?? "application/octet-stream",
//       };
//       const res = await documentApi.uploadFile(
//         fileForUpload,
//         docName.trim(),
//         category,
//       );
//       const doc = res?.data ?? res;
//       if (!doc?.id)
//         throw new Error("Upload succeeded but server returned no document ID.");
//       setUploadedDoc(doc);
//       setStep(2);
//     } catch (e: any) {
//       setErr1(
//         e?.response?.data?.message ??
//           e?.message ??
//           "Upload failed. Please try again.",
//       );
//     } finally {
//       setUploading(false);
//     }
//   };

//   const toggleEmployee = (id: string) =>
//     setSelected((p) =>
//       p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
//     );

//   const filteredForSelectAll = employees.filter((e) => {
//     const q = empSearch.toLowerCase();
//     return (
//       !q ||
//       `${e.first_name ?? ""} ${e.last_name ?? ""}`.toLowerCase().includes(q) ||
//       e.email?.toLowerCase().includes(q) ||
//       e.department?.toLowerCase().includes(q)
//     );
//   });

//   const toggleAll = () =>
//     setSelected(
//       selected.length === filteredForSelectAll.length
//         ? []
//         : filteredForSelectAll.map((e) => e.id),
//     );

//   const goToStep3 = () => {
//     if (selected.length === 0) {
//       setErr2("Please select at least one employee.");
//       return;
//     }
//     setErr2("");
//     setStep(3);
//   };

//   const handleSend = async () => {
//     if (selected.length === 0) return setErr3("Select at least one employee.");
//     setSending(true);
//     setErr3("");
//     try {
//       await documentApi.sendUploaded(uploadedDoc.id, selected, message.trim());
//       onSuccess(selected.length);
//       reset();
//     } catch (e: any) {
//       setErr3(
//         e?.response?.data?.message ??
//           e?.message ??
//           "Send failed. Please try again.",
//       );
//     } finally {
//       setSending(false);
//     }
//   };

//   const selectedEmployees = employees.filter((e) => selected.includes(e.id));

//   return (
//     <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
//       <View style={styles.container}>
//         {/* Header */}
//         <View style={styles.header}>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.headerTitle}>Send Document for Signature</Text>
//             <Text style={styles.headerSubtitle}>
//               Upload → choose employees → send for e-signature
//             </Text>
//           </View>
//           <Pressable onPress={handleClose} style={styles.closeBtn}>
//             <X size={16} color="#fff" />
//           </Pressable>
//         </View>

//         <View style={styles.stepWrap}>
//           <StepIndicator current={step} />
//         </View>

//         <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body}>
//           {/* STEP 1 */}
//           {step === 1 && (
//             <>
//               <Pressable
//                 onPress={handlePickFile}
//                 style={[styles.dropZone, file && styles.dropZoneActive]}
//               >
//                 {file ? (
//                   <>
//                     {file.mimeType === "application/pdf" ? (
//                       <FileType2 size={36} color="#DC2626" />
//                     ) : (
//                       <FileText size={36} color={C.primary} />
//                     )}
//                     <Text style={styles.fileName} numberOfLines={1}>
//                       {file.name}
//                     </Text>
//                     <Text style={styles.fileMeta}>
//                       {file.size
//                         ? `${(file.size / 1024 / 1024).toFixed(2)} MB · `
//                         : ""}
//                       {file.mimeType?.includes("pdf") ? "PDF" : "DOCX"}
//                     </Text>
//                     <Pressable
//                       onPress={(e) => {
//                         e.stopPropagation();
//                         setFile(null);
//                         setDocName("");
//                       }}
//                       style={styles.removeFileBtn}
//                     >
//                       <Text style={styles.removeFileBtnText}>
//                         Remove & choose another
//                       </Text>
//                     </Pressable>
//                   </>
//                 ) : (
//                   <>
//                     <View style={styles.uploadIconWrap}>
//                       <Upload size={26} color={C.primary} />
//                     </View>
//                     <Text style={styles.dropTitle}>
//                       Tap to choose a document
//                     </Text>
//                     <Text style={styles.dropSub}>
//                       PDF · DOCX · DOC · Max 20 MB
//                     </Text>
//                   </>
//                 )}
//               </Pressable>

//               <Text style={styles.label}>
//                 Document Name <Text style={{ color: C.danger }}>*</Text>
//               </Text>
//               <TextInput
//                 value={docName}
//                 onChangeText={setDocName}
//                 placeholder="e.g. Employment Contract · Q1 2025"
//                 placeholderTextColor={C.textMuted}
//                 style={styles.input}
//               />

//               <Text style={styles.label}>Category</Text>
//               <View style={styles.chipGrid}>
//                 {CATEGORIES.map((c) => {
//                   const active = category === c;
//                   return (
//                     <Pressable
//                       key={c}
//                       onPress={() => setCategory(c)}
//                       style={[styles.chip, active && styles.chipActive]}
//                     >
//                       <Text
//                         style={[styles.chipText, active && { color: "#fff" }]}
//                       >
//                         {c}
//                       </Text>
//                     </Pressable>
//                   );
//                 })}
//               </View>

//               {err1 ? (
//                 <View style={styles.errorBox}>
//                   <AlertTriangle size={13} color={C.danger} />
//                   <Text style={styles.errorText}>{err1}</Text>
//                 </View>
//               ) : null}
//             </>
//           )}

//           {/* STEP 2 */}
//           {step === 2 && (
//             <>
//               <Text style={styles.sectionTitle}>
//                 Who should receive and sign this document?
//               </Text>
//               <Text style={styles.sectionDesc}>
//                 Each selected employee will receive a notification and a sign
//                 request.
//               </Text>

//               <View style={{ marginTop: 12 }}>
//                 <EmployeePickerList
//                   employees={employees}
//                   loading={empLoading}
//                   search={empSearch}
//                   onSearchChange={setEmpSearch}
//                   selected={selected}
//                   onToggle={toggleEmployee}
//                   onToggleAll={toggleAll}
//                 />
//               </View>

//               {err2 ? (
//                 <View style={styles.errorBox}>
//                   <AlertTriangle size={13} color={C.danger} />
//                   <Text style={styles.errorText}>{err2}</Text>
//                 </View>
//               ) : null}
//             </>
//           )}

//           {/* STEP 3 */}
//           {step === 3 && (
//             <>
//               <View style={styles.summaryCard}>
//                 <Text style={styles.summaryLabel}>Ready to Send</Text>
//                 <View style={styles.summaryTop}>
//                   <View style={styles.summaryIconWrap}>
//                     <FileText size={16} color={C.primary} />
//                   </View>
//                   <View style={{ flex: 1 }}>
//                     <Text style={styles.summaryDocName} numberOfLines={1}>
//                       {uploadedDoc?.name ?? docName}
//                     </Text>
//                     <Text style={styles.summaryDocMeta}>
//                       {category} · {selected.length} recipient
//                       {selected.length !== 1 ? "s" : ""}
//                     </Text>
//                   </View>
//                 </View>
//                 <View style={styles.summaryTags}>
//                   {selectedEmployees.slice(0, 6).map((e) => (
//                     <View key={e.id} style={styles.summaryTag}>
//                       <Text style={styles.summaryTagText}>
//                         {e.first_name} {e.last_name}
//                       </Text>
//                     </View>
//                   ))}
//                   {selected.length > 6 && (
//                     <View
//                       style={[
//                         styles.summaryTag,
//                         { backgroundColor: "#E2E8F0" },
//                       ]}
//                     >
//                       <Text
//                         style={[styles.summaryTagText, { color: C.textMuted }]}
//                       >
//                         +{selected.length - 6} more
//                       </Text>
//                     </View>
//                   )}
//                 </View>
//               </View>

//               <Text style={styles.label}>
//                 Message to recipient(s){" "}
//                 <Text style={{ color: C.textMuted, fontWeight: "500" }}>
//                   (optional)
//                 </Text>
//               </Text>
//               <TextInput
//                 value={message}
//                 onChangeText={setMessage}
//                 placeholder="e.g. Please review and sign this document at your earliest convenience."
//                 placeholderTextColor={C.textMuted}
//                 style={[styles.input, styles.textarea]}
//                 multiline
//                 textAlignVertical="top"
//               />

//               <View style={styles.infoBox}>
//                 <Text style={styles.infoTitle}>
//                   What happens when you click Send?
//                 </Text>
//                 {NEXT_STEPS_INFO.map((t, i) => (
//                   <View key={i} style={styles.infoRow}>
//                     <CheckCircle2 size={12} color="#16A34A" />
//                     <Text style={styles.infoText}>{t}</Text>
//                   </View>
//                 ))}
//               </View>

//               {err3 ? (
//                 <View style={styles.errorBox}>
//                   <AlertTriangle size={13} color={C.danger} />
//                   <Text style={styles.errorText}>{err3}</Text>
//                 </View>
//               ) : null}
//             </>
//           )}
//         </ScrollView>

//         {/* Footer nav */}
//         <View style={styles.footer}>
//           <Pressable
//             onPress={() => (step > 1 ? setStep(step - 1) : handleClose())}
//             style={styles.backBtn}
//           >
//             <ChevronLeft size={14} color={C.textSecondary} />
//             <Text style={styles.backBtnText}>
//               {step === 1 ? "Cancel" : "Back"}
//             </Text>
//           </Pressable>

//           {step === 1 && (
//             <Pressable
//               onPress={handleUpload}
//               disabled={uploading || !file}
//               style={[
//                 styles.primaryBtn,
//                 (uploading || !file) && { opacity: 0.5 },
//               ]}
//             >
//               {uploading ? (
//                 <ActivityIndicator size="small" color="#fff" />
//               ) : (
//                 <>
//                   <Upload size={14} color="#fff" />
//                   <Text style={styles.primaryBtnText}>Upload & Continue</Text>
//                   <ChevronRight size={14} color="#fff" />
//                 </>
//               )}
//             </Pressable>
//           )}

//           {step === 2 && (
//             <Pressable onPress={goToStep3} style={styles.primaryBtn}>
//               <Text style={styles.primaryBtnText}>Continue to Message</Text>
//               <ChevronRight size={14} color="#fff" />
//             </Pressable>
//           )}

//           {step === 3 && (
//             <Pressable
//               onPress={handleSend}
//               disabled={sending}
//               style={[styles.sendBtn, sending && { opacity: 0.6 }]}
//             >
//               {sending ? (
//                 <ActivityIndicator size="small" color="#fff" />
//               ) : (
//                 <>
//                   <Send size={14} color="#fff" />
//                   <Text style={styles.primaryBtnText}>
//                     Send for E-Signature
//                   </Text>
//                 </>
//               )}
//             </Pressable>
//           )}
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: C.bg },
//   header: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     gap: 12,
//     padding: 18,
//     paddingTop: 50,
//     backgroundColor: C.primary,
//   },
//   headerTitle: { fontSize: 16, fontWeight: "800", color: "#fff" },
//   headerSubtitle: {
//     fontSize: 11,
//     color: "rgba(255,255,255,0.75)",
//     marginTop: 3,
//   },
//   closeBtn: {
//     width: 30,
//     height: 30,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(255,255,255,0.2)",
//   },

//   stepWrap: { paddingHorizontal: 18, paddingTop: 18 },

//   body: { padding: 18, paddingTop: 4, paddingBottom: 32 },

//   dropZone: {
//     borderWidth: 2,
//     borderStyle: "dashed",
//     borderColor: C.border,
//     borderRadius: 18,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 40,
//     gap: 10,
//     backgroundColor: C.surfaceAlt,
//     marginBottom: 16,
//   },
//   dropZoneActive: { borderColor: C.primary, backgroundColor: C.primaryLight },
//   uploadIconWrap: {
//     width: 56,
//     height: 56,
//     borderRadius: 18,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.primaryLight,
//   },
//   dropTitle: { fontSize: 13, fontWeight: "800", color: C.textPrimary },
//   dropSub: { fontSize: 11, fontWeight: "700", color: C.primary },
//   fileName: {
//     fontSize: 13,
//     fontWeight: "800",
//     color: C.textPrimary,
//     maxWidth: 260,
//   },
//   fileMeta: { fontSize: 11, color: C.textMuted },
//   removeFileBtn: {
//     paddingHorizontal: 14,
//     paddingVertical: 6,
//     borderRadius: 12,
//     backgroundColor: C.dangerLight,
//     marginTop: 4,
//   },
//   removeFileBtnText: { fontSize: 11, fontWeight: "700", color: C.danger },

//   label: {
//     fontSize: 11,
//     fontWeight: "800",
//     color: C.textSecondary,
//     marginBottom: 6,
//     marginTop: 6,
//   },
//   input: {
//     borderWidth: 1.5,
//     borderColor: C.border,
//     borderRadius: 14,
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     fontSize: 14,
//     color: C.textPrimary,
//     backgroundColor: C.surfaceAlt,
//     marginBottom: 14,
//   },
//   textarea: { minHeight: 110 },

//   chipGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 8,
//     marginBottom: 14,
//   },
//   chip: {
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 12,
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1.5,
//     borderColor: C.border,
//   },
//   chipActive: { backgroundColor: C.primary, borderColor: C.primary },
//   chipText: { fontSize: 12, fontWeight: "700", color: C.textSecondary },

//   errorBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     padding: 12,
//     borderRadius: 14,
//     backgroundColor: C.dangerLight,
//     marginTop: 4,
//   },
//   errorText: { fontSize: 12, fontWeight: "600", color: C.danger, flex: 1 },

//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: "800",
//     color: C.textPrimary,
//     marginBottom: 4,
//   },
//   sectionDesc: { fontSize: 12, color: C.textMuted, lineHeight: 17 },

//   summaryCard: {
//     borderRadius: 18,
//     padding: 16,
//     backgroundColor: C.primaryLight,
//     borderWidth: 1,
//     borderColor: "#C7D2FE",
//     gap: 10,
//     marginBottom: 16,
//   },
//   summaryLabel: {
//     fontSize: 10,
//     fontWeight: "800",
//     color: "#6366F1",
//     textTransform: "uppercase",
//   },
//   summaryTop: { flexDirection: "row", alignItems: "center", gap: 10 },
//   summaryIconWrap: {
//     width: 38,
//     height: 38,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#fff",
//   },
//   summaryDocName: { fontSize: 13, fontWeight: "800", color: C.textPrimary },
//   summaryDocMeta: { fontSize: 11, color: C.textMuted, marginTop: 1 },
//   summaryTags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
//   summaryTag: {
//     paddingHorizontal: 9,
//     paddingVertical: 3,
//     borderRadius: 20,
//     backgroundColor: "#C7D2FE",
//   },
//   summaryTagText: { fontSize: 10, fontWeight: "700", color: "#3730A3" },

//   infoBox: {
//     borderRadius: 16,
//     padding: 14,
//     backgroundColor: "#F0FDF4",
//     borderWidth: 1,
//     borderColor: "#BBF7D0",
//     gap: 6,
//     marginTop: 4,
//   },
//   infoTitle: {
//     fontSize: 12,
//     fontWeight: "800",
//     color: "#15803D",
//     marginBottom: 2,
//   },
//   infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
//   infoText: { fontSize: 11, color: "#166534", flex: 1, lineHeight: 16 },

//   footer: {
//     flexDirection: "row",
//     gap: 10,
//     padding: 16,
//     borderTopWidth: 1,
//     borderTopColor: C.border,
//     backgroundColor: C.bg,
//   },
//   backBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     paddingHorizontal: 16,
//     paddingVertical: 13,
//     borderRadius: 14,
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   backBtnText: { fontSize: 13, fontWeight: "700", color: C.textSecondary },
//   primaryBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     paddingVertical: 13,
//     borderRadius: 14,
//     backgroundColor: C.primary,
//   },
//   primaryBtnText: { fontSize: 13, fontWeight: "800", color: "#fff" },
//   sendBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     paddingVertical: 13,
//     borderRadius: 14,
//     backgroundColor: "#16A34A",
//   },
// });


// src/components/admin/documents/SendDocumentModal.tsx
// 3-step wizard: pick file (expo-document-picker) → select employees → message & send.

import { useState, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import {
  X,
  Upload,
  FileText,
  FileType2,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react-native";

import C from "../../../styles/colors";
import { documentApi } from "../../../api/service/documentApi";
import { getEmployees } from "../../../api/service/employeeApi";
import { Loader } from "../../../hooks/loaderManager";
import { CATEGORIES, getInitials } from "./documentsShared";
import StepIndicator from "./StepIndicator";
import EmployeePickerList from "./EmployeePickerList";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

const NEXT_STEPS_INFO = [
  "Each employee receives an in-app notification",
  "The document appears in their Documents page",
  "They can open, read and electronically sign it",
  "You'll see the status update to Signed here instantly",
];

export default function SendDocumentModal({
  visible,
  onClose,
  onSuccess,
}: Props) {
  const [step, setStep] = useState(1);

  // Step 1
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null,
  );
  const [docName, setDocName] = useState("");
  const [category, setCategory] = useState("Contract");
  const [uploadedDoc, setUploadedDoc] = useState<any | null>(null);
  const [err1, setErr1] = useState("");

  // Step 2
  const [employees, setEmployees] = useState<any[]>([]);
  const [empSearch, setEmpSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [err2, setErr2] = useState("");

  // Step 3
  const [message, setMessage] = useState("");
  const [err3, setErr3] = useState("");

  const reset = () => {
    setStep(1);
    setFile(null);
    setDocName("");
    setCategory("Contract");
    setUploadedDoc(null);
    setErr1("");
    setEmployees([]);
    setEmpSearch("");
    setSelected([]);
    setErr2("");
    setMessage("");
    setErr3("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Load employees on entering step 2
  const loadEmployees = useCallback(() => {
    Loader.show();
    getEmployees({ limit: 200 })
      .then((res: any) => {
        const list = res?.data ?? res ?? [];
        setEmployees(Array.isArray(list) ? list : []);
      })
      .catch(() => setErr2("Could not load employees. Please try again."))
      .finally(() => Loader.hide());
  }, []);

  useEffect(() => {
    if (step === 2 && employees.length === 0) loadEmployees();
  }, [step, employees.length, loadEmployees]);

  const handlePickFile = async () => {
    setErr1("");
    const res = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      copyToCacheDirectory: true,
    });
    if (res.canceled || !res.assets?.length) return;
    const picked = res.assets[0];
    setFile(picked);
    if (!docName) setDocName(picked.name.replace(/\.[^.]+$/, ""));
  };

  const handleUpload = async () => {
    if (!file) return setErr1("Please select a file first.");
    if (!docName.trim()) return setErr1("Please enter a document name.");
    Loader.show();
    setErr1("");
    try {
      // RN-style file object for FormData — same documentApi.uploadFile()
      // used on web works here too since FormData accepts { uri, name, type }.
      const fileForUpload: any = {
        uri: file.uri,
        name: file.name,
        type: file.mimeType ?? "application/octet-stream",
      };
      const res = await documentApi.uploadFile(
        fileForUpload,
        docName.trim(),
        category,
      );
      const doc = res?.data ?? res;
      if (!doc?.id)
        throw new Error("Upload succeeded but server returned no document ID.");
      setUploadedDoc(doc);
      setStep(2);
    } catch (e: any) {
      setErr1(
        e?.response?.data?.message ??
          e?.message ??
          "Upload failed. Please try again.",
      );
    } finally {
      Loader.hide();
    }
  };

  const toggleEmployee = (id: string) =>
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );

  const filteredForSelectAll = employees.filter((e) => {
    const q = empSearch.toLowerCase();
    return (
      !q ||
      `${e.first_name ?? ""} ${e.last_name ?? ""}`.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.department?.toLowerCase().includes(q)
    );
  });

  const toggleAll = () =>
    setSelected(
      selected.length === filteredForSelectAll.length
        ? []
        : filteredForSelectAll.map((e) => e.id),
    );

  const goToStep3 = () => {
    if (selected.length === 0) {
      setErr2("Please select at least one employee.");
      return;
    }
    setErr2("");
    setStep(3);
  };

  const handleSend = async () => {
    if (selected.length === 0) return setErr3("Select at least one employee.");
    Loader.show();
    setErr3("");
    try {
      await documentApi.sendUploaded(uploadedDoc.id, selected, message.trim());
      onSuccess(selected.length);
      reset();
    } catch (e: any) {
      setErr3(
        e?.response?.data?.message ??
          e?.message ??
          "Send failed. Please try again.",
      );
    } finally {
      Loader.hide();
    }
  };

  const selectedEmployees = employees.filter((e) => selected.includes(e.id));

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Send Document for Signature</Text>
            <Text style={styles.headerSubtitle}>
              Upload → choose employees → send for e-signature
            </Text>
          </View>
          <Pressable onPress={handleClose} style={styles.closeBtn}>
            <X size={16} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.stepWrap}>
          <StepIndicator current={step} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body}>
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <Pressable
                onPress={handlePickFile}
                style={[styles.dropZone, file && styles.dropZoneActive]}
              >
                {file ? (
                  <>
                    {file.mimeType === "application/pdf" ? (
                      <FileType2 size={36} color="#DC2626" />
                    ) : (
                      <FileText size={36} color={C.primary} />
                    )}
                    <Text style={styles.fileName} numberOfLines={1}>
                      {file.name}
                    </Text>
                    <Text style={styles.fileMeta}>
                      {file.size
                        ? `${(file.size / 1024 / 1024).toFixed(2)} MB · `
                        : ""}
                      {file.mimeType?.includes("pdf") ? "PDF" : "DOCX"}
                    </Text>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setDocName("");
                      }}
                      style={styles.removeFileBtn}
                    >
                      <Text style={styles.removeFileBtnText}>
                        Remove & choose another
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <View style={styles.uploadIconWrap}>
                      <Upload size={26} color={C.primary} />
                    </View>
                    <Text style={styles.dropTitle}>
                      Tap to choose a document
                    </Text>
                    <Text style={styles.dropSub}>
                      PDF · DOCX · DOC · Max 20 MB
                    </Text>
                  </>
                )}
              </Pressable>

              <Text style={styles.label}>
                Document Name <Text style={{ color: C.danger }}>*</Text>
              </Text>
              <TextInput
                value={docName}
                onChangeText={setDocName}
                placeholder="e.g. Employment Contract · Q1 2025"
                placeholderTextColor={C.textMuted}
                style={styles.input}
              />

              <Text style={styles.label}>Category</Text>
              <View style={styles.chipGrid}>
                {CATEGORIES.map((c) => {
                  const active = category === c;
                  return (
                    <Pressable
                      key={c}
                      onPress={() => setCategory(c)}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text
                        style={[styles.chipText, active && { color: "#fff" }]}
                      >
                        {c}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {err1 ? (
                <View style={styles.errorBox}>
                  <AlertTriangle size={13} color={C.danger} />
                  <Text style={styles.errorText}>{err1}</Text>
                </View>
              ) : null}
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <Text style={styles.sectionTitle}>
                Who should receive and sign this document?
              </Text>
              <Text style={styles.sectionDesc}>
                Each selected employee will receive a notification and a sign
                request.
              </Text>

              <View style={{ marginTop: 12 }}>
                <EmployeePickerList
                  employees={employees}
                  loading={false}
                  search={empSearch}
                  onSearchChange={setEmpSearch}
                  selected={selected}
                  onToggle={toggleEmployee}
                  onToggleAll={toggleAll}
                />
              </View>

              {err2 ? (
                <View style={styles.errorBox}>
                  <AlertTriangle size={13} color={C.danger} />
                  <Text style={styles.errorText}>{err2}</Text>
                </View>
              ) : null}
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Ready to Send</Text>
                <View style={styles.summaryTop}>
                  <View style={styles.summaryIconWrap}>
                    <FileText size={16} color={C.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.summaryDocName} numberOfLines={1}>
                      {uploadedDoc?.name ?? docName}
                    </Text>
                    <Text style={styles.summaryDocMeta}>
                      {category} · {selected.length} recipient
                      {selected.length !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
                <View style={styles.summaryTags}>
                  {selectedEmployees.slice(0, 6).map((e) => (
                    <View key={e.id} style={styles.summaryTag}>
                      <Text style={styles.summaryTagText}>
                        {e.first_name} {e.last_name}
                      </Text>
                    </View>
                  ))}
                  {selected.length > 6 && (
                    <View
                      style={[
                        styles.summaryTag,
                        { backgroundColor: "#E2E8F0" },
                      ]}
                    >
                      <Text
                        style={[styles.summaryTagText, { color: C.textMuted }]}
                      >
                        +{selected.length - 6} more
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={styles.label}>
                Message to recipient(s){" "}
                <Text style={{ color: C.textMuted, fontWeight: "500" }}>
                  (optional)
                </Text>
              </Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="e.g. Please review and sign this document at your earliest convenience."
                placeholderTextColor={C.textMuted}
                style={[styles.input, styles.textarea]}
                multiline
                textAlignVertical="top"
              />

              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>
                  What happens when you click Send?
                </Text>
                {NEXT_STEPS_INFO.map((t, i) => (
                  <View key={i} style={styles.infoRow}>
                    <CheckCircle2 size={12} color="#16A34A" />
                    <Text style={styles.infoText}>{t}</Text>
                  </View>
                ))}
              </View>

              {err3 ? (
                <View style={styles.errorBox}>
                  <AlertTriangle size={13} color={C.danger} />
                  <Text style={styles.errorText}>{err3}</Text>
                </View>
              ) : null}
            </>
          )}
        </ScrollView>

        {/* Footer nav */}
        <View style={styles.footer}>
          <Pressable
            onPress={() => (step > 1 ? setStep(step - 1) : handleClose())}
            style={styles.backBtn}
          >
            <ChevronLeft size={14} color={C.textSecondary} />
            <Text style={styles.backBtnText}>
              {step === 1 ? "Cancel" : "Back"}
            </Text>
          </Pressable>

          {step === 1 && (
            <Pressable
              onPress={handleUpload}
              disabled={!file}
              style={[
                styles.primaryBtn,
                !file && { opacity: 0.5 },
              ]}
            >
              <Upload size={14} color="#fff" />
              <Text style={styles.primaryBtnText}>Upload & Continue</Text>
              <ChevronRight size={14} color="#fff" />
            </Pressable>
          )}

          {step === 2 && (
            <Pressable onPress={goToStep3} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Continue to Message</Text>
              <ChevronRight size={14} color="#fff" />
            </Pressable>
          )}

          {step === 3 && (
            <Pressable onPress={handleSend} style={styles.sendBtn}>
              <Send size={14} color="#fff" />
              <Text style={styles.primaryBtnText}>
                Send for E-Signature
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 18,
    paddingTop: 50,
    backgroundColor: C.primary,
  },
  headerTitle: { fontSize: 16, fontWeight: "800", color: "#fff" },
  headerSubtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    marginTop: 3,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  stepWrap: { paddingHorizontal: 18, paddingTop: 18 },

  body: { padding: 18, paddingTop: 4, paddingBottom: 32 },

  dropZone: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: C.border,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 10,
    backgroundColor: C.surfaceAlt,
    marginBottom: 16,
  },
  dropZoneActive: { borderColor: C.primary, backgroundColor: C.primaryLight },
  uploadIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  dropTitle: { fontSize: 13, fontWeight: "800", color: C.textPrimary },
  dropSub: { fontSize: 11, fontWeight: "700", color: C.primary },
  fileName: {
    fontSize: 13,
    fontWeight: "800",
    color: C.textPrimary,
    maxWidth: 260,
  },
  fileMeta: { fontSize: 11, color: C.textMuted },
  removeFileBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: C.dangerLight,
    marginTop: 4,
  },
  removeFileBtnText: { fontSize: 11, fontWeight: "700", color: C.danger },

  label: {
    fontSize: 11,
    fontWeight: "800",
    color: C.textSecondary,
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: C.textPrimary,
    backgroundColor: C.surfaceAlt,
    marginBottom: 14,
  },
  textarea: { minHeight: 110 },

  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontSize: 12, fontWeight: "700", color: C.textSecondary },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.dangerLight,
    marginTop: 4,
  },
  errorText: { fontSize: 12, fontWeight: "600", color: C.danger, flex: 1 },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: C.textPrimary,
    marginBottom: 4,
  },
  sectionDesc: { fontSize: 12, color: C.textMuted, lineHeight: 17 },

  summaryCard: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: "#C7D2FE",
    gap: 10,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6366F1",
    textTransform: "uppercase",
  },
  summaryTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  summaryIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  summaryDocName: { fontSize: 13, fontWeight: "800", color: C.textPrimary },
  summaryDocMeta: { fontSize: 11, color: C.textMuted, marginTop: 1 },
  summaryTags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  summaryTag: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: "#C7D2FE",
  },
  summaryTagText: { fontSize: 10, fontWeight: "700", color: "#3730A3" },

  infoBox: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    gap: 6,
    marginTop: 4,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#15803D",
    marginBottom: 2,
  },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  infoText: { fontSize: 11, color: "#166534", flex: 1, lineHeight: 16 },

  footer: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.bg,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  backBtnText: { fontSize: 13, fontWeight: "700", color: C.textSecondary },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  primaryBtnText: { fontSize: 13, fontWeight: "800", color: "#fff" },
  sendBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: "#16A34A",
  },
});