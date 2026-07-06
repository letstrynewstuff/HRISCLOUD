// // src/components/admin/payroll/SalaryConfigView.tsx
// // RN port of SalaryConfiguration.jsx.

// import React, { useCallback, useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   Pressable,
//   TextInput,
//   Modal,
//   StyleSheet,
//   ActivityIndicator,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import {
//   ChevronLeft,
//   Plus,
//   Edit2,
//   X,
//   AlertCircle,
//   RefreshCw,
//   DollarSign,
// } from "lucide-react-native";

// import C from "../../../styles/colors";
// import {
//   getStructures,
//   createStructure,
//   updateStructure,
// } from "../../../api/service/payrollApi";
// import { gradeApi } from "../../../api/service/gradeApi";
// import SelectField from "./SelectField";

// const fmt = (n: any) => (n ? `₦${Number(n).toLocaleString()}` : "—");

// const FIELDS = [
//   { key: "housing_allowance", label: "Housing Allowance (₦)" },
//   { key: "transport_allowance", label: "Transport Allowance (₦)" },
//   { key: "medical_allowance", label: "Medical Allowance (₦)" },
//   { key: "other_allowances", label: "Other Allowances (₦)" },
// ];

// const EMPTY_FORM = {
//   name: "",
//   grade: "",
//   basic_salary: "",
//   housing_allowance: "",
//   transport_allowance: "",
//   medical_allowance: "",
//   other_allowances: "",
// };

// type Props = { onClose: () => void };

// export default function SalaryConfigView({ onClose }: Props) {
//   const insets = useSafeAreaInsets();
//   const [structures, setStructures] = useState<any[]>([]);
//   const [grades, setGrades] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showModal, setShowModal] = useState(false);
//   const [editTarget, setEditTarget] = useState<any>(null);
//   const [saving, setSaving] = useState(false);
//   const [form, setForm] = useState<any>(EMPTY_FORM);
//   const [formErr, setFormErr] = useState<any>({});

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const [structRes, gradeRes]: any = await Promise.all([
//         getStructures(),
//         gradeApi.list(),
//       ]);
//       setStructures(structRes.data ?? []);
//       setGrades(gradeRes.data ?? gradeRes ?? []);
//     } catch (e: any) {
//       setError(
//         e?.response?.data?.message ??
//           "Failed to load salary configuration data.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const gross = (f: any) =>
//     [
//       "basic_salary",
//       "housing_allowance",
//       "transport_allowance",
//       "medical_allowance",
//       "other_allowances",
//     ].reduce((s, k) => s + (Number(f[k]) || 0), 0);

//   const openCreate = () => {
//     setEditTarget(null);
//     setForm(EMPTY_FORM);
//     setFormErr({});
//     setShowModal(true);
//   };

//   const openEdit = (s: any) => {
//     setEditTarget(s);
//     setForm({
//       name: s.name,
//       grade: s.grade ?? "",
//       basic_salary: String(s.basic_salary ?? ""),
//       housing_allowance: String(s.housing_allowance ?? ""),
//       transport_allowance: String(s.transport_allowance ?? ""),
//       medical_allowance: String(s.medical_allowance ?? ""),
//       other_allowances: String(s.other_allowances ?? ""),
//     });
//     setFormErr({});
//     setShowModal(true);
//   };

//   const handleSave = async () => {
//     const errs: any = {};
//     if (!form.name.trim()) errs.name = "Required";
//     if (!form.basic_salary) errs.basic_salary = "Required";
//     setFormErr(errs);
//     if (Object.keys(errs).length) return;

//     setSaving(true);
//     try {
//       const payload = {
//         name: form.name.trim(),
//         grade: form.grade || undefined,
//         basic_salary: Number(form.basic_salary),
//         housing_allowance: Number(form.housing_allowance) || 0,
//         transport_allowance: Number(form.transport_allowance) || 0,
//         medical_allowance: Number(form.medical_allowance) || 0,
//         other_allowances: Number(form.other_allowances) || 0,
//       };
//       if (editTarget) {
//         const res = await updateStructure(editTarget.id, payload);
//         const updated = res.data ?? res;
//         setStructures((prev) =>
//           prev.map((s) => (s.id === editTarget.id ? updated : s)),
//         );
//       } else {
//         const res = await createStructure(payload);
//         const created = res.data ?? res;
//         setStructures((prev) => [created, ...prev]);
//       }
//       setShowModal(false);
//     } catch (e: any) {
//       setFormErr({ api: e?.response?.data?.message ?? "Save failed." });
//     } finally {
//       setSaving(false);
//     }
//   };

//   const gradeOptions = [
//     { label: "No grade", value: "" },
//     ...grades.map((g) => ({ label: g.name, value: g.name })),
//   ];

//   return (
//     <View style={[styles.screen, { paddingTop: insets.top }]}>
//       <View style={styles.header}>
//         <Pressable onPress={onClose} style={styles.headerBack}>
//           <ChevronLeft size={20} color={C.textSecondary} />
//         </Pressable>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.headerTitle}>Salary Structures</Text>
//           <Text style={styles.headerSub}>Salary bands used during payroll</Text>
//         </View>
//         <Pressable onPress={fetchData} style={styles.refreshBtn}>
//           <RefreshCw size={13} color={C.textSecondary} />
//         </Pressable>
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <Pressable onPress={openCreate} style={styles.addBtn}>
//           <Plus size={14} color="#fff" />
//           <Text style={styles.addBtnText}>New Structure</Text>
//         </Pressable>

//         {error && (
//           <View style={styles.errorBanner}>
//             <AlertCircle size={14} color={C.danger} />
//             <Text style={styles.errorText}>{error}</Text>
//           </View>
//         )}

//         {loading ? (
//           <View style={styles.center}>
//             <ActivityIndicator size="large" color={C.primary} />
//           </View>
//         ) : structures.length === 0 ? (
//           <View style={styles.emptyCard}>
//             <DollarSign size={36} color={C.textMuted} />
//             <Text style={styles.emptyTitle}>No salary structures yet</Text>
//             <Text style={styles.muted}>
//               Create a structure to define salary bands.
//             </Text>
//           </View>
//         ) : (
//           <View style={{ gap: 12 }}>
//             {structures.map((s) => {
//               const gradeInfo = grades.find((g) => g.name === s.grade);
//               const grossVal =
//                 (s.basic_salary ?? 0) +
//                 (s.housing_allowance ?? 0) +
//                 (s.transport_allowance ?? 0) +
//                 (s.medical_allowance ?? 0) +
//                 (s.other_allowances ?? 0);
//               const rows = [
//                 ["Basic Salary", s.basic_salary],
//                 ["Housing", s.housing_allowance],
//                 ["Transport", s.transport_allowance],
//                 ["Medical", s.medical_allowance],
//               ].filter(([, v]) => Number(v) > 0);

//               return (
//                 <View key={s.id} style={styles.structCard}>
//                   <View style={styles.structHeader}>
//                     <View style={{ flex: 1 }}>
//                       <Text style={styles.rowTitle}>{s.name}</Text>
//                       {gradeInfo && (
//                         <View
//                           style={[
//                             styles.gradeBadge,
//                             { backgroundColor: gradeInfo.bg || C.border },
//                           ]}
//                         >
//                           <Text
//                             style={[
//                               styles.gradeBadgeText,
//                               { color: gradeInfo.color || C.textPrimary },
//                             ]}
//                           >
//                             {gradeInfo.name}
//                           </Text>
//                         </View>
//                       )}
//                     </View>
//                     <Pressable
//                       onPress={() => openEdit(s)}
//                       style={styles.iconBtn}
//                     >
//                       <Edit2 size={12} color={C.primary} />
//                     </Pressable>
//                   </View>

//                   {rows.map(([l, v]) => (
//                     <View key={l as string} style={styles.structRow}>
//                       <Text style={styles.structLabel}>{l}</Text>
//                       <Text style={styles.structValue}>{fmt(v)}</Text>
//                     </View>
//                   ))}

//                   <View style={styles.grossRow}>
//                     <Text style={styles.grossLabel}>Gross</Text>
//                     <Text style={styles.grossValue}>{fmt(grossVal)}</Text>
//                   </View>
//                 </View>
//               );
//             })}
//           </View>
//         )}
//         <View style={{ height: 24 }} />
//       </ScrollView>

//       {/* Modal */}
//       <Modal
//         visible={showModal}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setShowModal(false)}
//       >
//         <View style={styles.modalBackdrop}>
//           <View style={styles.modalCard}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>
//                 {editTarget ? "Edit Structure" : "Create Salary Structure"}
//               </Text>
//               <Pressable
//                 onPress={() => setShowModal(false)}
//                 style={styles.modalClose}
//               >
//                 <X size={14} color="#fff" />
//               </Pressable>
//             </View>

//             <ScrollView
//               style={{ maxHeight: 460 }}
//               contentContainerStyle={{ padding: 20, gap: 16 }}
//             >
//               {formErr.api && (
//                 <View style={styles.errorBanner}>
//                   <Text style={styles.errorText}>{formErr.api}</Text>
//                 </View>
//               )}

//               <View>
//                 <Text style={styles.label}>Structure Name *</Text>
//                 <TextInput
//                   value={form.name}
//                   onChangeText={(v) => setForm((f: any) => ({ ...f, name: v }))}
//                   placeholder="e.g. Mid-Level Engineer"
//                   placeholderTextColor={C.textMuted}
//                   style={[
//                     styles.input,
//                     { borderColor: formErr.name ? C.danger : C.border },
//                   ]}
//                 />
//               </View>

//               <SelectField
//                 label="Grade Level"
//                 value={form.grade}
//                 options={gradeOptions}
//                 onChange={(v) => setForm((f: any) => ({ ...f, grade: v }))}
//               />

//               <View>
//                 <Text style={styles.label}>Basic Salary (₦) *</Text>
//                 <TextInput
//                   keyboardType="numeric"
//                   value={form.basic_salary}
//                   onChangeText={(v) =>
//                     setForm((f: any) => ({ ...f, basic_salary: v }))
//                   }
//                   placeholder="e.g. 750000"
//                   placeholderTextColor={C.textMuted}
//                   style={[
//                     styles.input,
//                     { borderColor: formErr.basic_salary ? C.danger : C.border },
//                   ]}
//                 />
//               </View>

//               {FIELDS.map(({ key, label }) => (
//                 <View key={key}>
//                   <Text style={styles.label}>{label}</Text>
//                   <TextInput
//                     keyboardType="numeric"
//                     value={form[key]}
//                     onChangeText={(v) =>
//                       setForm((f: any) => ({ ...f, [key]: v }))
//                     }
//                     placeholder="0"
//                     placeholderTextColor={C.textMuted}
//                     style={[styles.input, { borderColor: C.border }]}
//                   />
//                 </View>
//               ))}

//               {gross(form) > 0 && (
//                 <View style={styles.grossTotalCard}>
//                   <Text style={styles.grossTotalLabel}>Gross Total</Text>
//                   <Text style={styles.grossTotalValue}>
//                     ₦{gross(form).toLocaleString()}
//                   </Text>
//                 </View>
//               )}
//             </ScrollView>

//             <View style={styles.modalFooter}>
//               <Pressable
//                 onPress={() => setShowModal(false)}
//                 style={styles.secondaryBtnFlex}
//               >
//                 <Text style={styles.secondaryBtnText}>Cancel</Text>
//               </Pressable>
//               <Pressable
//                 onPress={handleSave}
//                 disabled={saving}
//                 style={[styles.primaryBtnFlex, { opacity: saving ? 0.7 : 1 }]}
//               >
//                 {saving ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <Text style={styles.primaryBtnText}>
//                     {editTarget ? "Save Changes" : "Create Structure"}
//                   </Text>
//                 )}
//               </Pressable>
//             </View>
//           </View>
//         </View>
//       </Modal>
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
//   headerSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
//   refreshBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   scrollContent: { padding: 16 },
//   addBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 8,
//     backgroundColor: C.primary,
//     paddingVertical: 13,
//     borderRadius: 14,
//     marginBottom: 16,
//   },
//   addBtnText: { color: "#fff", fontSize: 13, fontWeight: "800" },
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
//   center: { paddingVertical: 40, alignItems: "center" },
//   emptyCard: {
//     alignItems: "center",
//     gap: 4,
//     paddingVertical: 44,
//     borderRadius: 18,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   emptyTitle: {
//     fontSize: 14,
//     fontWeight: "800",
//     color: C.textSecondary,
//     marginTop: 8,
//   },
//   muted: { fontSize: 12, color: C.textMuted },
//   structCard: {
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     borderRadius: 18,
//     padding: 16,
//   },
//   structHeader: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     justifyContent: "space-between",
//     marginBottom: 10,
//   },
//   rowTitle: { fontSize: 14, fontWeight: "800", color: C.textPrimary },
//   gradeBadge: {
//     alignSelf: "flex-start",
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 999,
//     marginTop: 4,
//   },
//   gradeBadgeText: { fontSize: 10, fontWeight: "800" },
//   iconBtn: {
//     width: 30,
//     height: 30,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.primaryLight,
//   },
//   structRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 4,
//   },
//   structLabel: { fontSize: 12, color: C.textSecondary },
//   structValue: { fontSize: 12, fontWeight: "700", color: C.textPrimary },
//   grossRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 10,
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: C.border,
//   },
//   grossLabel: { fontSize: 12, fontWeight: "800", color: C.primary },
//   grossValue: { fontSize: 14, fontWeight: "800", color: C.primary },
//   modalBackdrop: {
//     flex: 1,
//     backgroundColor: "rgba(15,23,42,0.45)",
//     justifyContent: "flex-end",
//   },
//   modalCard: {
//     backgroundColor: C.surface,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     overflow: "hidden",
//   },
//   modalHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//     paddingVertical: 18,
//     backgroundColor: C.navy,
//   },
//   modalTitle: { color: "#fff", fontWeight: "800", fontSize: 15 },
//   modalClose: {
//     width: 30,
//     height: 30,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(255,255,255,0.15)",
//   },
//   label: {
//     fontSize: 12,
//     fontWeight: "700",
//     color: C.textPrimary,
//     marginBottom: 6,
//   },
//   input: {
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1.5,
//     borderRadius: 12,
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     fontSize: 14,
//     color: C.textPrimary,
//   },
//   grossTotalCard: {
//     backgroundColor: C.primaryLight,
//     borderRadius: 14,
//     padding: 14,
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   grossTotalLabel: { fontSize: 13, fontWeight: "800", color: C.primary },
//   grossTotalValue: { fontSize: 13, fontWeight: "800", color: C.primary },
//   modalFooter: {
//     flexDirection: "row",
//     gap: 10,
//     padding: 20,
//     borderTopWidth: 1,
//     borderTopColor: C.border,
//   },
//   secondaryBtnFlex: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 14,
//     borderRadius: 14,
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   secondaryBtnText: { fontSize: 13, fontWeight: "700", color: C.textSecondary },
//   primaryBtnFlex: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 14,
//     borderRadius: 14,
//     backgroundColor: C.primary,
//   },
//   primaryBtnText: { color: "#fff", fontSize: 13, fontWeight: "800" },
// });


// src/components/admin/payroll/SalaryConfigView.tsx
// RN port of SalaryConfiguration.jsx.

import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Plus,
  Edit2,
  X,
  AlertCircle,
  RefreshCw,
  DollarSign,
} from "lucide-react-native";

import C from "../../../styles/colors";
import { Loader } from "../../../hooks/loaderManager";
import {
  getStructures,
  createStructure,
  updateStructure,
} from "../../../api/service/payrollApi";
import { gradeApi } from "../../../api/service/gradeApi";
import SelectField from "./SelectField";

const fmt = (n: any) => (n ? `₦${Number(n).toLocaleString()}` : "—");

const FIELDS = [
  { key: "housing_allowance", label: "Housing Allowance (₦)" },
  { key: "transport_allowance", label: "Transport Allowance (₦)" },
  { key: "medical_allowance", label: "Medical Allowance (₦)" },
  { key: "other_allowances", label: "Other Allowances (₦)" },
];

const EMPTY_FORM = {
  name: "",
  grade: "",
  basic_salary: "",
  housing_allowance: "",
  transport_allowance: "",
  medical_allowance: "",
  other_allowances: "",
};

type Props = { onClose: () => void };

export default function SalaryConfigView({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [structures, setStructures] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [formErr, setFormErr] = useState<any>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    Loader.show();
    try {
      const [structRes, gradeRes]: any = await Promise.all([
        getStructures(),
        gradeApi.list(),
      ]);
      setStructures(structRes.data ?? []);
      setGrades(gradeRes.data ?? gradeRes ?? []);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ??
          "Failed to load salary configuration data.",
      );
    } finally {
      setLoading(false);
      Loader.hide();
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const gross = (f: any) =>
    [
      "basic_salary",
      "housing_allowance",
      "transport_allowance",
      "medical_allowance",
      "other_allowances",
    ].reduce((s, k) => s + (Number(f[k]) || 0), 0);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErr({});
    setShowModal(true);
  };

  const openEdit = (s: any) => {
    setEditTarget(s);
    setForm({
      name: s.name,
      grade: s.grade ?? "",
      basic_salary: String(s.basic_salary ?? ""),
      housing_allowance: String(s.housing_allowance ?? ""),
      transport_allowance: String(s.transport_allowance ?? ""),
      medical_allowance: String(s.medical_allowance ?? ""),
      other_allowances: String(s.other_allowances ?? ""),
    });
    setFormErr({});
    setShowModal(true);
  };

  const handleSave = async () => {
    const errs: any = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!form.basic_salary) errs.basic_salary = "Required";
    setFormErr(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    Loader.show();
    try {
      const payload = {
        name: form.name.trim(),
        grade: form.grade || undefined,
        basic_salary: Number(form.basic_salary),
        housing_allowance: Number(form.housing_allowance) || 0,
        transport_allowance: Number(form.transport_allowance) || 0,
        medical_allowance: Number(form.medical_allowance) || 0,
        other_allowances: Number(form.other_allowances) || 0,
      };
      if (editTarget) {
        const res = await updateStructure(editTarget.id, payload);
        const updated = res.data ?? res;
        setStructures((prev) =>
          prev.map((s) => (s.id === editTarget.id ? updated : s)),
        );
      } else {
        const res = await createStructure(payload);
        const created = res.data ?? res;
        setStructures((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch (e: any) {
      setFormErr({ api: e?.response?.data?.message ?? "Save failed." });
    } finally {
      setSaving(false);
      Loader.hide();
    }
  };

  const gradeOptions = [
    { label: "No grade", value: "" },
    ...grades.map((g) => ({ label: g.name, value: g.name })),
  ];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Salary Structures</Text>
          <Text style={styles.headerSub}>Salary bands used during payroll</Text>
        </View>
        <Pressable onPress={fetchData} style={styles.refreshBtn}>
          <RefreshCw size={13} color={C.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Pressable onPress={openCreate} style={styles.addBtn}>
          <Plus size={14} color="#fff" />
          <Text style={styles.addBtnText}>New Structure</Text>
        </Pressable>

        {error && (
          <View style={styles.errorBanner}>
            <AlertCircle size={14} color={C.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={C.primary} />
          </View>
        ) : structures.length === 0 ? (
          <View style={styles.emptyCard}>
            <DollarSign size={36} color={C.textMuted} />
            <Text style={styles.emptyTitle}>No salary structures yet</Text>
            <Text style={styles.muted}>
              Create a structure to define salary bands.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {structures.map((s) => {
              const gradeInfo = grades.find((g) => g.name === s.grade);
              const grossVal =
                (s.basic_salary ?? 0) +
                (s.housing_allowance ?? 0) +
                (s.transport_allowance ?? 0) +
                (s.medical_allowance ?? 0) +
                (s.other_allowances ?? 0);
              const rows = [
                ["Basic Salary", s.basic_salary],
                ["Housing", s.housing_allowance],
                ["Transport", s.transport_allowance],
                ["Medical", s.medical_allowance],
              ].filter(([, v]) => Number(v) > 0);

              return (
                <View key={s.id} style={styles.structCard}>
                  <View style={styles.structHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>{s.name}</Text>
                      {gradeInfo && (
                        <View
                          style={[
                            styles.gradeBadge,
                            { backgroundColor: gradeInfo.bg || C.border },
                          ]}
                        >
                          <Text
                            style={[
                              styles.gradeBadgeText,
                              { color: gradeInfo.color || C.textPrimary },
                            ]}
                          >
                            {gradeInfo.name}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Pressable
                      onPress={() => openEdit(s)}
                      style={styles.iconBtn}
                    >
                      <Edit2 size={12} color={C.primary} />
                    </Pressable>
                  </View>

                  {rows.map(([l, v]) => (
                    <View key={l as string} style={styles.structRow}>
                      <Text style={styles.structLabel}>{l}</Text>
                      <Text style={styles.structValue}>{fmt(v)}</Text>
                    </View>
                  ))}

                  <View style={styles.grossRow}>
                    <Text style={styles.grossLabel}>Gross</Text>
                    <Text style={styles.grossValue}>{fmt(grossVal)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editTarget ? "Edit Structure" : "Create Salary Structure"}
              </Text>
              <Pressable
                onPress={() => setShowModal(false)}
                style={styles.modalClose}
              >
                <X size={14} color="#fff" />
              </Pressable>
            </View>

            <ScrollView
              style={{ maxHeight: 460 }}
              contentContainerStyle={{ padding: 20, gap: 16 }}
            >
              {formErr.api && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{formErr.api}</Text>
                </View>
              )}

              <View>
                <Text style={styles.label}>Structure Name *</Text>
                <TextInput
                  value={form.name}
                  onChangeText={(v) => setForm((f: any) => ({ ...f, name: v }))}
                  placeholder="e.g. Mid-Level Engineer"
                  placeholderTextColor={C.textMuted}
                  style={[
                    styles.input,
                    { borderColor: formErr.name ? C.danger : C.border },
                  ]}
                />
              </View>

              <SelectField
                label="Grade Level"
                value={form.grade}
                options={gradeOptions}
                onChange={(v) => setForm((f: any) => ({ ...f, grade: v }))}
              />

              <View>
                <Text style={styles.label}>Basic Salary (₦) *</Text>
                <TextInput
                  keyboardType="numeric"
                  value={form.basic_salary}
                  onChangeText={(v) =>
                    setForm((f: any) => ({ ...f, basic_salary: v }))
                  }
                  placeholder="e.g. 750000"
                  placeholderTextColor={C.textMuted}
                  style={[
                    styles.input,
                    { borderColor: formErr.basic_salary ? C.danger : C.border },
                  ]}
                />
              </View>

              {FIELDS.map(({ key, label }) => (
                <View key={key}>
                  <Text style={styles.label}>{label}</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={form[key]}
                    onChangeText={(v) =>
                      setForm((f: any) => ({ ...f, [key]: v }))
                    }
                    placeholder="0"
                    placeholderTextColor={C.textMuted}
                    style={[styles.input, { borderColor: C.border }]}
                  />
                </View>
              ))}

              {gross(form) > 0 && (
                <View style={styles.grossTotalCard}>
                  <Text style={styles.grossTotalLabel}>Gross Total</Text>
                  <Text style={styles.grossTotalValue}>
                    ₦{gross(form).toLocaleString()}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                onPress={() => setShowModal(false)}
                style={styles.secondaryBtnFlex}
              >
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={saving}
                style={[styles.primaryBtnFlex, { opacity: saving ? 0.7 : 1 }]}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>
                    {editTarget ? "Save Changes" : "Create Structure"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  headerSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  scrollContent: { padding: 16 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.primary,
    paddingVertical: 13,
    borderRadius: 14,
    marginBottom: 16,
  },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "800" },
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
  center: { paddingVertical: 40, alignItems: "center" },
  emptyCard: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 44,
    borderRadius: 18,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: C.textSecondary,
    marginTop: 8,
  },
  muted: { fontSize: 12, color: C.textMuted },
  structCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: 16,
  },
  structHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  rowTitle: { fontSize: 14, fontWeight: "800", color: C.textPrimary },
  gradeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginTop: 4,
  },
  gradeBadgeText: { fontSize: 10, fontWeight: "800" },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  structRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  structLabel: { fontSize: 12, color: C.textSecondary },
  structValue: { fontSize: 12, fontWeight: "700", color: C.textPrimary },
  grossRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  grossLabel: { fontSize: 12, fontWeight: "800", color: C.primary },
  grossValue: { fontSize: 14, fontWeight: "800", color: C.primary },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: C.navy,
  },
  modalTitle: { color: "#fff", fontWeight: "800", fontSize: 15 },
  modalClose: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: C.textPrimary,
  },
  grossTotalCard: {
    backgroundColor: C.primaryLight,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  grossTotalLabel: { fontSize: 13, fontWeight: "800", color: C.primary },
  grossTotalValue: { fontSize: 13, fontWeight: "800", color: C.primary },
  modalFooter: {
    flexDirection: "row",
    gap: 10,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  secondaryBtnFlex: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  secondaryBtnText: { fontSize: 13, fontWeight: "700", color: C.textSecondary },
  primaryBtnFlex: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  primaryBtnText: { color: "#fff", fontSize: 13, fontWeight: "800" },
});