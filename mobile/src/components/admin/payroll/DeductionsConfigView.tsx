// // src/components/admin/payroll/DeductionsConfigView.tsx
// // RN port of DeductionsConfiguration.jsx.

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
//   Alert,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import {
//   ChevronLeft,
//   Plus,
//   Edit2,
//   Trash2,
//   X,
//   AlertCircle,
//   ToggleLeft,
//   ToggleRight,
//   RefreshCw,
// } from "lucide-react-native";

// import C from "../../../styles/colors";
// import {
//   getDeductions,
//   createDeduction,
//   updateDeduction,
//   toggleDeduction,
//   deleteDeduction,
// } from "../../../api/service/payrollApi";

// const STATUTORY = [
//   {
//     name: "PAYE Tax",
//     type: "progressive",
//     note: "Computed per FIRS tax table",
//   },
//   {
//     name: "Pension (Employee 8%)",
//     type: "percent",
//     value: 8,
//     note: "PENCOM — on basic + housing + transport",
//   },
//   {
//     name: "NHF (2.5%)",
//     type: "percent",
//     value: 2.5,
//     note: "National Housing Fund",
//   },
// ];

// type Props = { onClose: () => void };

// export default function DeductionsConfigView({ onClose }: Props) {
//   const insets = useSafeAreaInsets();
//   const [deductions, setDeductions] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showModal, setShowModal] = useState(false);
//   const [editTarget, setEditTarget] = useState<any>(null);
//   const [saving, setSaving] = useState(false);
//   const [form, setForm] = useState({
//     name: "",
//     type: "percent",
//     value: "",
//     is_active: true,
//   });
//   const [formErr, setFormErr] = useState<any>({});

//   const fetchDeductions = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await getDeductions();
//       setDeductions(res.data ?? []);
//     } catch (e: any) {
//       setError(e?.response?.data?.message ?? "Failed to load deductions.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchDeductions();
//   }, [fetchDeductions]);

//   const openCreate = () => {
//     setEditTarget(null);
//     setForm({ name: "", type: "percent", value: "", is_active: true });
//     setFormErr({});
//     setShowModal(true);
//   };

//   const openEdit = (d: any) => {
//     setEditTarget(d);
//     setForm({
//       name: d.name,
//       type: d.type,
//       value: String(d.value),
//       is_active: d.is_active,
//     });
//     setFormErr({});
//     setShowModal(true);
//   };

//   const handleSave = async () => {
//     const errs: any = {};
//     if (!form.name.trim()) errs.name = "Required";
//     if (!form.value) errs.value = "Required";
//     else if (isNaN(Number(form.value))) errs.value = "Must be a number";
//     setFormErr(errs);
//     if (Object.keys(errs).length) return;

//     setSaving(true);
//     try {
//       const payload = {
//         name: form.name.trim(),
//         type: form.type,
//         value: Number(form.value),
//         is_active: form.is_active,
//       };
//       if (editTarget) {
//         const res = await updateDeduction(editTarget.id, payload);
//         setDeductions((prev) =>
//           prev.map((d) => (d.id === editTarget.id ? (res.data ?? res) : d)),
//         );
//       } else {
//         const res = await createDeduction(payload);
//         setDeductions((prev) => [res.data ?? res, ...prev]);
//       }
//       setShowModal(false);
//     } catch (e: any) {
//       setFormErr({ api: e?.response?.data?.message ?? "Save failed." });
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleToggle = async (ded: any) => {
//     try {
//       await toggleDeduction(ded.id);
//       setDeductions((prev) =>
//         prev.map((d) =>
//           d.id === ded.id ? { ...d, is_active: !d.is_active } : d,
//         ),
//       );
//     } catch {
//       setError("Toggle failed.");
//     }
//   };

//   const handleDelete = (ded: any) => {
//     Alert.alert("Delete deduction", `Delete "${ded.name}"?`, [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             await deleteDeduction(ded.id);
//             setDeductions((prev) => prev.filter((d) => d.id !== ded.id));
//           } catch {
//             setError("Delete failed.");
//           }
//         },
//       },
//     ]);
//   };

//   return (
//     <View style={[styles.screen, { paddingTop: insets.top }]}>
//       <View style={styles.header}>
//         <Pressable onPress={onClose} style={styles.headerBack}>
//           <ChevronLeft size={20} color={C.textSecondary} />
//         </Pressable>
//         <Text style={styles.headerTitle}>Deductions</Text>
//         <Pressable onPress={fetchDeductions} style={styles.refreshBtn}>
//           <RefreshCw size={13} color={C.textSecondary} />
//         </Pressable>
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         {/* Statutory — fixed, informational */}
//         <Text style={styles.sectionLabel}>Statutory Deductions (Nigeria)</Text>
//         <View style={styles.card}>
//           {STATUTORY.map((ded, i) => (
//             <View
//               key={ded.name}
//               style={[styles.statRow, i > 0 && styles.rowBorder]}
//             >
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.rowTitle}>{ded.name}</Text>
//                 <Text style={styles.rowSub}>{ded.note}</Text>
//               </View>
//               <View style={styles.activeBadge}>
//                 <Text style={styles.activeBadgeText}>Always Active</Text>
//               </View>
//             </View>
//           ))}
//         </View>

//         {/* Custom deductions */}
//         <View style={styles.sectionHeaderRow}>
//           <Text style={styles.sectionLabel}>Custom Deductions</Text>
//           <Pressable onPress={openCreate} style={styles.addBtn}>
//             <Plus size={14} color="#fff" />
//             <Text style={styles.addBtnText}>Add</Text>
//           </Pressable>
//         </View>

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
//         ) : deductions.length === 0 ? (
//           <View style={styles.emptyCard}>
//             <Text style={styles.muted}>
//               No custom deductions yet. Add one above.
//             </Text>
//           </View>
//         ) : (
//           <View style={styles.card}>
//             {deductions.map((ded, i) => (
//               <View
//                 key={ded.id}
//                 style={[styles.dedRow, i > 0 && styles.rowBorder]}
//               >
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.rowTitle}>{ded.name}</Text>
//                   <Text style={styles.rowSub}>
//                     {ded.type === "percent"
//                       ? `${ded.value}%`
//                       : `₦${Number(ded.value).toLocaleString()}`}
//                   </Text>
//                 </View>
//                 <Pressable
//                   onPress={() => handleToggle(ded)}
//                   style={styles.toggleWrap}
//                 >
//                   {ded.is_active ? (
//                     <ToggleRight size={22} color={C.success} />
//                   ) : (
//                     <ToggleLeft size={22} color={C.textMuted} />
//                   )}
//                 </Pressable>
//                 <Pressable onPress={() => openEdit(ded)} style={styles.iconBtn}>
//                   <Edit2 size={13} color={C.primary} />
//                 </Pressable>
//                 <Pressable
//                   onPress={() => handleDelete(ded)}
//                   style={[styles.iconBtn, { backgroundColor: C.dangerLight }]}
//                 >
//                   <Trash2 size={13} color={C.danger} />
//                 </Pressable>
//               </View>
//             ))}
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
//                 {editTarget ? "Edit Deduction" : "Add Custom Deduction"}
//               </Text>
//               <Pressable
//                 onPress={() => setShowModal(false)}
//                 style={styles.modalClose}
//               >
//                 <X size={14} color="#fff" />
//               </Pressable>
//             </View>

//             <ScrollView
//               style={{ maxHeight: 420 }}
//               contentContainerStyle={{ padding: 20, gap: 16 }}
//             >
//               {formErr.api && (
//                 <View style={styles.errorBanner}>
//                   <Text style={styles.errorText}>{formErr.api}</Text>
//                 </View>
//               )}

//               <View>
//                 <Text style={styles.label}>Deduction Name *</Text>
//                 <TextInput
//                   value={form.name}
//                   onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
//                   placeholder="e.g. Cooperative Contribution"
//                   placeholderTextColor={C.textMuted}
//                   style={[
//                     styles.input,
//                     { borderColor: formErr.name ? C.danger : C.border },
//                   ]}
//                 />
//                 {formErr.name && (
//                   <Text style={styles.fieldErr}>{formErr.name}</Text>
//                 )}
//               </View>

//               <View>
//                 <Text style={styles.label}>Type</Text>
//                 <View style={{ flexDirection: "row", gap: 10 }}>
//                   {[
//                     ["percent", "Percentage (%)"],
//                     ["fixed", "Fixed Amount (₦)"],
//                   ].map(([val, lbl]) => {
//                     const active = form.type === val;
//                     return (
//                       <Pressable
//                         key={val}
//                         onPress={() => setForm((f) => ({ ...f, type: val }))}
//                         style={[
//                           styles.typeBtn,
//                           {
//                             backgroundColor: active ? C.primary : C.surfaceAlt,
//                             borderColor: active ? C.primary : C.border,
//                           },
//                         ]}
//                       >
//                         <Text
//                           style={{
//                             color: active ? "#fff" : C.textSecondary,
//                             fontWeight: "700",
//                             fontSize: 12,
//                           }}
//                         >
//                           {lbl}
//                         </Text>
//                       </Pressable>
//                     );
//                   })}
//                 </View>
//               </View>

//               <View>
//                 <Text style={styles.label}>
//                   Value {form.type === "percent" ? "(%)" : "(₦)"} *
//                 </Text>
//                 <TextInput
//                   keyboardType="numeric"
//                   value={form.value}
//                   onChangeText={(v) => setForm((f) => ({ ...f, value: v }))}
//                   placeholder={form.type === "percent" ? "5" : "85000"}
//                   placeholderTextColor={C.textMuted}
//                   style={[
//                     styles.input,
//                     { borderColor: formErr.value ? C.danger : C.border },
//                   ]}
//                 />
//                 {formErr.value && (
//                   <Text style={styles.fieldErr}>{formErr.value}</Text>
//                 )}
//               </View>

//               <Pressable
//                 onPress={() =>
//                   setForm((f) => ({ ...f, is_active: !f.is_active }))
//                 }
//                 style={styles.activeRow}
//               >
//                 {form.is_active ? (
//                   <ToggleRight size={26} color={C.primary} />
//                 ) : (
//                   <ToggleLeft size={26} color={C.textMuted} />
//                 )}
//                 <Text style={{ fontSize: 13, color: C.textSecondary }}>
//                   Active by default
//                 </Text>
//               </Pressable>
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
//                     {editTarget ? "Update" : "Add Deduction"}
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
//   headerTitle: {
//     fontSize: 17,
//     fontWeight: "800",
//     color: C.textPrimary,
//     flex: 1,
//   },
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
//   sectionLabel: {
//     fontSize: 14,
//     fontWeight: "800",
//     color: C.textPrimary,
//     marginBottom: 10,
//     marginTop: 4,
//   },
//   sectionHeaderRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: 22,
//   },
//   card: {
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     borderRadius: 18,
//     overflow: "hidden",
//   },
//   statRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
//   dedRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 8 },
//   rowBorder: { borderTopWidth: 1, borderTopColor: C.border },
//   rowTitle: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
//   rowSub: { fontSize: 11, color: C.textMuted, marginTop: 2 },
//   activeBadge: {
//     backgroundColor: "#D1FAE5",
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 999,
//   },
//   activeBadgeText: { fontSize: 10, fontWeight: "800", color: "#065F46" },
//   toggleWrap: { padding: 4 },
//   iconBtn: {
//     width: 30,
//     height: 30,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.primaryLight,
//   },
//   addBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     backgroundColor: C.primary,
//     paddingHorizontal: 14,
//     paddingVertical: 9,
//     borderRadius: 12,
//   },
//   addBtnText: { color: "#fff", fontSize: 12, fontWeight: "800" },
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
//     marginTop: 12,
//   },
//   errorText: { flex: 1, fontSize: 12, color: C.danger },
//   center: { paddingVertical: 40, alignItems: "center" },
//   emptyCard: {
//     alignItems: "center",
//     paddingVertical: 40,
//     borderRadius: 18,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     marginTop: 12,
//   },
//   muted: { fontSize: 12, color: C.textMuted },
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
//   fieldErr: { fontSize: 11, color: C.danger, marginTop: 4 },
//   typeBtn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 12,
//     borderWidth: 1.5,
//     alignItems: "center",
//   },
//   activeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
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


// src/components/admin/payroll/DeductionsConfigView.tsx
// RN port of DeductionsConfiguration.jsx.

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
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
} from "lucide-react-native";

import C from "../../../styles/colors";
import { Loader } from "../../../hooks/loaderManager";
import {
  getDeductions,
  createDeduction,
  updateDeduction,
  toggleDeduction,
  deleteDeduction,
} from "../../../api/service/payrollApi";

const STATUTORY = [
  {
    name: "PAYE Tax",
    type: "progressive",
    note: "Computed per FIRS tax table",
  },
  {
    name: "Pension (Employee 8%)",
    type: "percent",
    value: 8,
    note: "PENCOM — on basic + housing + transport",
  },
  {
    name: "NHF (2.5%)",
    type: "percent",
    value: 2.5,
    note: "National Housing Fund",
  },
];

type Props = { onClose: () => void };

export default function DeductionsConfigView({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [deductions, setDeductions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "percent",
    value: "",
    is_active: true,
  });
  const [formErr, setFormErr] = useState<any>({});

  const fetchDeductions = useCallback(async () => {
    setLoading(true);
    setError(null);
    Loader.show();
    try {
      const res = await getDeductions();
      setDeductions(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load deductions.");
    } finally {
      setLoading(false);
      Loader.hide();
    }
  }, []);

  useEffect(() => {
    fetchDeductions();
  }, [fetchDeductions]);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ name: "", type: "percent", value: "", is_active: true });
    setFormErr({});
    setShowModal(true);
  };

  const openEdit = (d: any) => {
    setEditTarget(d);
    setForm({
      name: d.name,
      type: d.type,
      value: String(d.value),
      is_active: d.is_active,
    });
    setFormErr({});
    setShowModal(true);
  };

  const handleSave = async () => {
    const errs: any = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!form.value) errs.value = "Required";
    else if (isNaN(Number(form.value))) errs.value = "Must be a number";
    setFormErr(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    Loader.show();
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        value: Number(form.value),
        is_active: form.is_active,
      };
      if (editTarget) {
        const res = await updateDeduction(editTarget.id, payload);
        setDeductions((prev) =>
          prev.map((d) => (d.id === editTarget.id ? (res.data ?? res) : d)),
        );
      } else {
        const res = await createDeduction(payload);
        setDeductions((prev) => [res.data ?? res, ...prev]);
      }
      setShowModal(false);
    } catch (e: any) {
      setFormErr({ api: e?.response?.data?.message ?? "Save failed." });
    } finally {
      setSaving(false);
      Loader.hide();
    }
  };

  const handleToggle = async (ded: any) => {
    Loader.show();
    try {
      await toggleDeduction(ded.id);
      setDeductions((prev) =>
        prev.map((d) =>
          d.id === ded.id ? { ...d, is_active: !d.is_active } : d,
        ),
      );
    } catch {
      setError("Toggle failed.");
    } finally {
      Loader.hide();
    }
  };

  const handleDelete = (ded: any) => {
    Alert.alert("Delete deduction", `Delete "${ded.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          Loader.show();
          try {
            await deleteDeduction(ded.id);
            setDeductions((prev) => prev.filter((d) => d.id !== ded.id));
          } catch {
            setError("Delete failed.");
          } finally {
            Loader.hide();
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Deductions</Text>
        <Pressable onPress={fetchDeductions} style={styles.refreshBtn}>
          <RefreshCw size={13} color={C.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Statutory — fixed, informational */}
        <Text style={styles.sectionLabel}>Statutory Deductions (Nigeria)</Text>
        <View style={styles.card}>
          {STATUTORY.map((ded, i) => (
            <View
              key={ded.name}
              style={[styles.statRow, i > 0 && styles.rowBorder]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{ded.name}</Text>
                <Text style={styles.rowSub}>{ded.note}</Text>
              </View>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Always Active</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Custom deductions */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Custom Deductions</Text>
          <Pressable onPress={openCreate} style={styles.addBtn}>
            <Plus size={14} color="#fff" />
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>

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
        ) : deductions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.muted}>
              No custom deductions yet. Add one above.
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            {deductions.map((ded, i) => (
              <View
                key={ded.id}
                style={[styles.dedRow, i > 0 && styles.rowBorder]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{ded.name}</Text>
                  <Text style={styles.rowSub}>
                    {ded.type === "percent"
                      ? `${ded.value}%`
                      : `₦${Number(ded.value).toLocaleString()}`}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleToggle(ded)}
                  style={styles.toggleWrap}
                >
                  {ded.is_active ? (
                    <ToggleRight size={22} color={C.success} />
                  ) : (
                    <ToggleLeft size={22} color={C.textMuted} />
                  )}
                </Pressable>
                <Pressable onPress={() => openEdit(ded)} style={styles.iconBtn}>
                  <Edit2 size={13} color={C.primary} />
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(ded)}
                  style={[styles.iconBtn, { backgroundColor: C.dangerLight }]}
                >
                  <Trash2 size={13} color={C.danger} />
                </Pressable>
              </View>
            ))}
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
                {editTarget ? "Edit Deduction" : "Add Custom Deduction"}
              </Text>
              <Pressable
                onPress={() => setShowModal(false)}
                style={styles.modalClose}
              >
                <X size={14} color="#fff" />
              </Pressable>
            </View>

            <ScrollView
              style={{ maxHeight: 420 }}
              contentContainerStyle={{ padding: 20, gap: 16 }}
            >
              {formErr.api && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{formErr.api}</Text>
                </View>
              )}

              <View>
                <Text style={styles.label}>Deduction Name *</Text>
                <TextInput
                  value={form.name}
                  onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                  placeholder="e.g. Cooperative Contribution"
                  placeholderTextColor={C.textMuted}
                  style={[
                    styles.input,
                    { borderColor: formErr.name ? C.danger : C.border },
                  ]}
                />
                {formErr.name && (
                  <Text style={styles.fieldErr}>{formErr.name}</Text>
                )}
              </View>

              <View>
                <Text style={styles.label}>Type</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {[
                    ["percent", "Percentage (%)"],
                    ["fixed", "Fixed Amount (₦)"],
                  ].map(([val, lbl]) => {
                    const active = form.type === val;
                    return (
                      <Pressable
                        key={val}
                        onPress={() => setForm((f) => ({ ...f, type: val }))}
                        style={[
                          styles.typeBtn,
                          {
                            backgroundColor: active ? C.primary : C.surfaceAlt,
                            borderColor: active ? C.primary : C.border,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: active ? "#fff" : C.textSecondary,
                            fontWeight: "700",
                            fontSize: 12,
                          }}
                        >
                          {lbl}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text style={styles.label}>
                  Value {form.type === "percent" ? "(%)" : "(₦)"} *
                </Text>
                <TextInput
                  keyboardType="numeric"
                  value={form.value}
                  onChangeText={(v) => setForm((f) => ({ ...f, value: v }))}
                  placeholder={form.type === "percent" ? "5" : "85000"}
                  placeholderTextColor={C.textMuted}
                  style={[
                    styles.input,
                    { borderColor: formErr.value ? C.danger : C.border },
                  ]}
                />
                {formErr.value && (
                  <Text style={styles.fieldErr}>{formErr.value}</Text>
                )}
              </View>

              <Pressable
                onPress={() =>
                  setForm((f) => ({ ...f, is_active: !f.is_active }))
                }
                style={styles.activeRow}
              >
                {form.is_active ? (
                  <ToggleRight size={26} color={C.primary} />
                ) : (
                  <ToggleLeft size={26} color={C.textMuted} />
                )}
                <Text style={{ fontSize: 13, color: C.textSecondary }}>
                  Active by default
                </Text>
              </Pressable>
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
                    {editTarget ? "Update" : "Add Deduction"}
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
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: C.textPrimary,
    flex: 1,
  },
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
  sectionLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: C.textPrimary,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 22,
  },
  card: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    overflow: "hidden",
  },
  statRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  dedRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 8 },
  rowBorder: { borderTopWidth: 1, borderTopColor: C.border },
  rowTitle: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  rowSub: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  activeBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  activeBadgeText: { fontSize: 10, fontWeight: "800", color: "#065F46" },
  toggleWrap: { padding: 4 },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  addBtnText: { color: "#fff", fontSize: 12, fontWeight: "800" },
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
    marginTop: 12,
  },
  errorText: { flex: 1, fontSize: 12, color: C.danger },
  center: { paddingVertical: 40, alignItems: "center" },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 40,
    borderRadius: 18,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    marginTop: 12,
  },
  muted: { fontSize: 12, color: C.textMuted },
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
  fieldErr: { fontSize: 11, color: C.danger, marginTop: 4 },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
  },
  activeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
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