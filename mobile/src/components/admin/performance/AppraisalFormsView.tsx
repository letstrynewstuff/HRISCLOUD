// // src/components/admin/performance/AppraisalFormsView.tsx
// // Mobile: Appraisal Forms Builder — mirrors web AppraisalForms.jsx
// // Lists derived forms from review cycles, with create modal.

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
//   Plus,
//   RefreshCw,
//   AlertTriangle,
//   FileText,
//   X,
//   Loader2,
//   ChevronDown,
// } from "lucide-react-native";
// import C from "../../../styles/colors";
// import { getCycles } from "../../../api/service/performanceApi";

// const FORM_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
//   "Self Assessment": { bg: C.primaryLight, color: C.primary },
//   "Manager Review": { bg: "#d1fae5", color: "#059669" },
//   "360° Feedback": { bg: "#f3e8ff", color: "#7c3aed" },
//   "Peer Review": { bg: "#cffafe", color: "#0891b2" },
//   "Probation Review": { bg: "#fef3c7", color: "#d97706" },
// };

// function TypeBadge({ type }: { type: string }) {
//   const cfg = FORM_TYPE_COLORS[type] ?? {
//     bg: C.surfaceAlt,
//     color: C.textMuted,
//   };
//   return (
//     <View
//       style={{
//         backgroundColor: cfg.bg,
//         paddingHorizontal: 10,
//         paddingVertical: 4,
//         borderRadius: 12,
//         alignSelf: "flex-start",
//       }}
//     >
//       <Text style={{ color: cfg.color, fontSize: 10, fontWeight: "700" }}>
//         {type}
//       </Text>
//     </View>
//   );
// }

// function CreateFormModal({
//   cycles,
//   onClose,
//   onCreated,
// }: {
//   cycles: any[];
//   onClose: () => void;
//   onCreated: () => void;
// }) {
//   const [form, setForm] = useState({
//     name: "",
//     type: "Self Assessment",
//     cycleId: "",
//     sections: 3,
//   });
//   const [saving, setSaving] = useState(false);

//   const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

//   const handleSubmit = () => {
//     // Placeholder — wire to POST /performance/forms when backend ready
//     setSaving(true);
//     setTimeout(() => {
//       setSaving(false);
//       onCreated();
//     }, 800);
//   };

//   return (
//     <Modal visible animationType="slide" transparent onRequestClose={onClose}>
//       <View
//         style={{
//           flex: 1,
//           backgroundColor: "rgba(0,0,0,0.5)",
//           justifyContent: "flex-end",
//         }}
//       >
//         <View style={[styles.modalContainer, { maxHeight: "85%" }]}>
//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "space-between",
//               alignItems: "center",
//               marginBottom: 16,
//             }}
//           >
//             <Text
//               style={{
//                 fontSize: 16,
//                 fontWeight: "700",
//                 color: C.textPrimary,
//               }}
//             >
//               New Form Template
//             </Text>
//             <TouchableOpacity onPress={onClose}>
//               <X size={20} color={C.textMuted} />
//             </TouchableOpacity>
//           </View>

//           <ScrollView showsVerticalScrollIndicator={false}>
//             <Text style={styles.label}>Form Name</Text>
//             <TextInput
//               value={form.name}
//               onChangeText={(t) => set("name", t)}
//               placeholder="e.g. Annual Self Assessment 2026"
//               placeholderTextColor={C.textMuted}
//               style={styles.input}
//             />

//             <Text style={styles.label}>Review Type</Text>
//             <View style={styles.input}>
//               {Object.keys(FORM_TYPE_COLORS).map((t) => (
//                 <TouchableOpacity
//                   key={t}
//                   onPress={() => set("type", t)}
//                   style={{
//                     flexDirection: "row",
//                     alignItems: "center",
//                     paddingVertical: 8,
//                     borderBottomWidth: 1,
//                     borderBottomColor: C.border,
//                   }}
//                 >
//                   <View
//                     style={{
//                       width: 16,
//                       height: 16,
//                       borderRadius: 8,
//                       borderWidth: 2,
//                       borderColor: form.type === t ? C.primary : C.border,
//                       marginRight: 10,
//                       alignItems: "center",
//                       justifyContent: "center",
//                     }}
//                   >
//                     {form.type === t && (
//                       <View
//                         style={{
//                           width: 8,
//                           height: 8,
//                           borderRadius: 4,
//                           backgroundColor: C.primary,
//                         }}
//                       />
//                     )}
//                   </View>
//                   <Text
//                     style={{
//                       fontSize: 13,
//                       color: C.textPrimary,
//                     }}
//                   >
//                     {t}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             <Text style={styles.label}>Linked Cycle</Text>
//             <View style={styles.input}>
//               <TouchableOpacity
//                 onPress={() => set("cycleId", "")}
//                 style={{
//                   flexDirection: "row",
//                   alignItems: "center",
//                   paddingVertical: 8,
//                   borderBottomWidth: 1,
//                   borderBottomColor: C.border,
//                 }}
//               >
//                 <View
//                   style={{
//                     width: 16,
//                     height: 16,
//                     borderRadius: 8,
//                     borderWidth: 2,
//                     borderColor: form.cycleId === "" ? C.primary : C.border,
//                     marginRight: 10,
//                     alignItems: "center",
//                     justifyContent: "center",
//                   }}
//                 >
//                   {form.cycleId === "" && (
//                     <View
//                       style={{
//                         width: 8,
//                         height: 8,
//                         borderRadius: 4,
//                         backgroundColor: C.primary,
//                       }}
//                     />
//                   )}
//                 </View>
//                 <Text style={{ fontSize: 13, color: C.textPrimary }}>
//                   — No cycle —
//                 </Text>
//               </TouchableOpacity>
//               {cycles.map((c) => (
//                 <TouchableOpacity
//                   key={c.id}
//                   onPress={() => set("cycleId", c.id)}
//                   style={{
//                     flexDirection: "row",
//                     alignItems: "center",
//                     paddingVertical: 8,
//                     borderBottomWidth: 1,
//                     borderBottomColor: C.border,
//                   }}
//                 >
//                   <View
//                     style={{
//                       width: 16,
//                       height: 16,
//                       borderRadius: 8,
//                       borderWidth: 2,
//                       borderColor: form.cycleId === c.id ? C.primary : C.border,
//                       marginRight: 10,
//                       alignItems: "center",
//                       justifyContent: "center",
//                     }}
//                   >
//                     {form.cycleId === c.id && (
//                       <View
//                         style={{
//                           width: 8,
//                           height: 8,
//                           borderRadius: 4,
//                           backgroundColor: C.primary,
//                         }}
//                       />
//                     )}
//                   </View>
//                   <Text
//                     style={{
//                       fontSize: 13,
//                       color: C.textPrimary,
//                     }}
//                   >
//                     {c.name}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             <Text style={styles.label}>Number of Sections</Text>
//             <TextInput
//               value={String(form.sections)}
//               onChangeText={(t) =>
//                 set("sections", Math.min(10, Math.max(1, Number(t) || 1)))
//               }
//               keyboardType="numeric"
//               style={styles.input}
//             />

//             <View style={{ height: 20 }} />
//           </ScrollView>

//           <View
//             style={{
//               flexDirection: "row",
//               gap: 12,
//               paddingTop: 12,
//               borderTopWidth: 1,
//               borderTopColor: C.border,
//             }}
//           >
//             <TouchableOpacity
//               onPress={onClose}
//               style={{
//                 flex: 1,
//                 padding: 12,
//                 borderRadius: 12,
//                 backgroundColor: C.surfaceAlt,
//                 alignItems: "center",
//                 borderWidth: 1,
//                 borderColor: C.border,
//               }}
//             >
//               <Text style={{ color: C.textSecondary, fontWeight: "600" }}>
//                 Cancel
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={handleSubmit}
//               disabled={saving}
//               style={{
//                 flex: 1,
//                 padding: 12,
//                 borderRadius: 12,
//                 backgroundColor: C.primary,
//                 alignItems: "center",
//                 opacity: saving ? 0.7 : 1,
//               }}
//             >
//               <Text style={{ color: "#fff", fontWeight: "600" }}>
//                 {saving ? "Creating…" : "Create Form"}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// export default function AppraisalFormsView({
//   searchQuery,
// }: {
//   searchQuery: string;
// }) {
//   const [forms, setForms] = useState<any[]>([]);
//   const [cycles, setCycles] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showCreate, setShowCreate] = useState(false);

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const cycleRes = await getCycles();
//       const cycleList = cycleRes.data ?? [];
//       setCycles(cycleList);

//       const derived = cycleList.flatMap((c: any) => [
//         {
//           id: `${c.id}-self`,
//           name: `${c.name} — Self Assessment`,
//           type: "Self Assessment",
//           cycle: c.name,
//           status: c.status,
//         },
//         {
//           id: `${c.id}-mgr`,
//           name: `${c.name} — Manager Review`,
//           type: "Manager Review",
//           cycle: c.name,
//           status: c.status,
//         },
//       ]);
//       setForms(derived);
//     } catch {
//       setError("Failed to load appraisal forms.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     load();
//   }, [load]);

//   const filtered = forms.filter((f: any) => {
//     const q = searchQuery.toLowerCase();
//     return (
//       !q ||
//       f.name?.toLowerCase().includes(q) ||
//       f.cycle?.toLowerCase().includes(q) ||
//       f.type?.toLowerCase().includes(q)
//     );
//   });

//   return (
//     <View>
//       {/* Header */}
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
//             Appraisal Forms Builder
//           </Text>
//           <Text style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
//             {forms.length} form{forms.length !== 1 ? "s" : ""} from{" "}
//             {cycles.length} cycle{cycles.length !== 1 ? "s" : ""}
//           </Text>
//         </View>
//         <View style={{ flexDirection: "row", gap: 8 }}>
//           <TouchableOpacity onPress={load} style={styles.iconBtn}>
//             <RefreshCw size={14} color={C.textSecondary} />
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={() => setShowCreate(true)}
//             style={[styles.iconBtn, { backgroundColor: C.primary }]}
//           >
//             <Plus size={14} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {error && (
//         <View
//           style={{
//             backgroundColor: "#fee2e2",
//             padding: 12,
//             borderRadius: 12,
//             marginBottom: 12,
//             flexDirection: "row",
//             alignItems: "center",
//             gap: 8,
//           }}
//         >
//           <AlertTriangle size={16} color="#dc2626" />
//           <Text style={{ color: "#dc2626", fontSize: 13, flex: 1 }}>
//             {error}
//           </Text>
//         </View>
//       )}

//       {loading ? (
//         <ActivityIndicator color={C.primary} style={{ marginTop: 24 }} />
//       ) : filtered.length === 0 ? (
//         <View style={{ alignItems: "center", padding: 40, gap: 12 }}>
//           <FileText size={32} color={C.textMuted} />
//           <Text style={{ color: C.textPrimary, fontWeight: "600" }}>
//             No appraisal forms yet
//           </Text>
//           <Text
//             style={{
//               color: C.textMuted,
//               fontSize: 12,
//               textAlign: "center",
//             }}
//           >
//             Create a review cycle first, then build your form templates.
//           </Text>
//           <TouchableOpacity
//             onPress={() => setShowCreate(true)}
//             style={{
//               backgroundColor: C.primary,
//               paddingHorizontal: 16,
//               paddingVertical: 8,
//               borderRadius: 12,
//               marginTop: 4,
//             }}
//           >
//             <Text style={{ color: "#fff", fontWeight: "600" }}>
//               New Form Template
//             </Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <View style={{ gap: 10 }}>
//           {filtered.map((form) => (
//             <View
//               key={form.id}
//               style={{
//                 backgroundColor: C.surface,
//                 borderRadius: 16,
//                 padding: 14,
//                 borderWidth: 1,
//                 borderColor: C.border,
//               }}
//             >
//               <View
//                 style={{
//                   flexDirection: "row",
//                   justifyContent: "space-between",
//                   alignItems: "flex-start",
//                   marginBottom: 8,
//                 }}
//               >
//                 <View style={{ flex: 1, marginRight: 8 }}>
//                   <Text
//                     style={{
//                       fontSize: 14,
//                       fontWeight: "600",
//                       color: C.textPrimary,
//                     }}
//                   >
//                     {form.name}
//                   </Text>
//                   <Text
//                     style={{
//                       fontSize: 11,
//                       color: C.textMuted,
//                       marginTop: 2,
//                     }}
//                   >
//                     Cycle: {form.cycle}
//                   </Text>
//                 </View>
//                 <TypeBadge type={form.type} />
//               </View>

//               <View
//                 style={{
//                   flexDirection: "row",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   marginTop: 4,
//                 }}
//               >
//                 <View
//                   style={{
//                     backgroundColor:
//                       form.status === "Active" ? "#d1fae5" : C.surfaceAlt,
//                     paddingHorizontal: 10,
//                     paddingVertical: 4,
//                     borderRadius: 12,
//                   }}
//                 >
//                   <Text
//                     style={{
//                       fontSize: 10,
//                       fontWeight: "700",
//                       color: form.status === "Active" ? "#059669" : C.textMuted,
//                     }}
//                   >
//                     {form.status}
//                   </Text>
//                 </View>
//                 <TouchableOpacity
//                   style={{
//                     paddingHorizontal: 12,
//                     paddingVertical: 6,
//                     borderRadius: 10,
//                     backgroundColor: C.primaryLight,
//                   }}
//                 >
//                   <Text
//                     style={{
//                       fontSize: 12,
//                       fontWeight: "600",
//                       color: C.primary,
//                     }}
//                   >
//                     Open Builder
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           ))}
//         </View>
//       )}

//       {showCreate && (
//         <CreateFormModal
//           cycles={cycles}
//           onClose={() => setShowCreate(false)}
//           onCreated={() => {
//             setShowCreate(false);
//             load();
//           }}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   modalContainer: {
//     backgroundColor: C.surface,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 16,
//     maxHeight: "80%",
//   },
//   label: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: C.textPrimary,
//     marginBottom: 6,
//     marginTop: 12,
//   },
//   input: {
//     backgroundColor: C.surfaceAlt,
//     padding: 12,
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



// src/components/admin/performance/AppraisalFormsView.tsx
// Mobile: Appraisal Forms Builder — mirrors web AppraisalForms.jsx
// Lists derived forms from review cycles, with create modal.

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
  Plus,
  RefreshCw,
  AlertTriangle,
  FileText,
  X,
  Loader2,
  ChevronDown,
} from "lucide-react-native";
import C from "../../../styles/colors";
import { getCycles } from "../../../api/service/performanceApi";
import { Loader } from "../../../hooks/loaderManager";

const FORM_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  "Self Assessment": { bg: C.primaryLight, color: C.primary },
  "Manager Review": { bg: "#d1fae5", color: "#059669" },
  "360° Feedback": { bg: "#f3e8ff", color: "#7c3aed" },
  "Peer Review": { bg: "#cffafe", color: "#0891b2" },
  "Probation Review": { bg: "#fef3c7", color: "#d97706" },
};

function TypeBadge({ type }: { type: string }) {
  const cfg = FORM_TYPE_COLORS[type] ?? {
    bg: C.surfaceAlt,
    color: C.textMuted,
  };
  return (
    <View
      style={{
        backgroundColor: cfg.bg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color: cfg.color, fontSize: 10, fontWeight: "700" }}>
        {type}
      </Text>
    </View>
  );
}

function CreateFormModal({
  cycles,
  onClose,
  onCreated,
}: {
  cycles: any[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    type: "Self Assessment",
    cycleId: "",
    sections: 3,
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    // Placeholder — wire to POST /performance/forms when backend ready
    setSaving(true);
    Loader.show();
    setTimeout(() => {
      setSaving(false);
      Loader.hide();
      onCreated();
    }, 800);
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View style={[styles.modalContainer, { maxHeight: "85%" }]}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: C.textPrimary,
              }}
            >
              New Form Template
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={C.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Form Name</Text>
            <TextInput
              value={form.name}
              onChangeText={(t) => set("name", t)}
              placeholder="e.g. Annual Self Assessment 2026"
              placeholderTextColor={C.textMuted}
              style={styles.input}
            />

            <Text style={styles.label}>Review Type</Text>
            <View style={styles.input}>
              {Object.keys(FORM_TYPE_COLORS).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => set("type", t)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: C.border,
                  }}
                >
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: form.type === t ? C.primary : C.border,
                      marginRight: 10,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {form.type === t && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: C.primary,
                        }}
                      />
                    )}
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      color: C.textPrimary,
                    }}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Linked Cycle</Text>
            <View style={styles.input}>
              <TouchableOpacity
                onPress={() => set("cycleId", "")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: C.border,
                }}
              >
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: form.cycleId === "" ? C.primary : C.border,
                    marginRight: 10,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {form.cycleId === "" && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: C.primary,
                      }}
                    />
                  )}
                </View>
                <Text style={{ fontSize: 13, color: C.textPrimary }}>
                  — No cycle —
                </Text>
              </TouchableOpacity>
              {cycles.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => set("cycleId", c.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: C.border,
                  }}
                >
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: form.cycleId === c.id ? C.primary : C.border,
                      marginRight: 10,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {form.cycleId === c.id && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: C.primary,
                        }}
                      />
                    )}
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      color: C.textPrimary,
                    }}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Number of Sections</Text>
            <TextInput
              value={String(form.sections)}
              onChangeText={(t) =>
                set("sections", Math.min(10, Math.max(1, Number(t) || 1)))
              }
              keyboardType="numeric"
              style={styles.input}
            />

            <View style={{ height: 20 }} />
          </ScrollView>

          <View
            style={{
              flexDirection: "row",
              gap: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: C.border,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
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
              <Text style={{ color: C.textSecondary, fontWeight: "600" }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={saving}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 12,
                backgroundColor: C.primary,
                alignItems: "center",
                opacity: saving ? 0.7 : 1,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                {saving ? "Creating…" : "Create Form"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function AppraisalFormsView({
  searchQuery,
}: {
  searchQuery: string;
}) {
  const [forms, setForms] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    Loader.show();
    try {
      const cycleRes = await getCycles();
      const cycleList = cycleRes.data ?? [];
      setCycles(cycleList);

      const derived = cycleList.flatMap((c: any) => [
        {
          id: `${c.id}-self`,
          name: `${c.name} — Self Assessment`,
          type: "Self Assessment",
          cycle: c.name,
          status: c.status,
        },
        {
          id: `${c.id}-mgr`,
          name: `${c.name} — Manager Review`,
          type: "Manager Review",
          cycle: c.name,
          status: c.status,
        },
      ]);
      setForms(derived);
    } catch {
      setError("Failed to load appraisal forms.");
    } finally {
      setLoading(false);
      Loader.hide();
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = forms.filter((f: any) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      f.name?.toLowerCase().includes(q) ||
      f.cycle?.toLowerCase().includes(q) ||
      f.type?.toLowerCase().includes(q)
    );
  });

  return (
    <View>
      {/* Header */}
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
            Appraisal Forms Builder
          </Text>
          <Text style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
            {forms.length} form{forms.length !== 1 ? "s" : ""} from{" "}
            {cycles.length} cycle{cycles.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity onPress={load} style={styles.iconBtn}>
            <RefreshCw size={14} color={C.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowCreate(true)}
            style={[styles.iconBtn, { backgroundColor: C.primary }]}
          >
            <Plus size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View
          style={{
            backgroundColor: "#fee2e2",
            padding: 12,
            borderRadius: 12,
            marginBottom: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <AlertTriangle size={16} color="#dc2626" />
          <Text style={{ color: "#dc2626", fontSize: 13, flex: 1 }}>
            {error}
          </Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={C.primary} style={{ marginTop: 24 }} />
      ) : filtered.length === 0 ? (
        <View style={{ alignItems: "center", padding: 40, gap: 12 }}>
          <FileText size={32} color={C.textMuted} />
          <Text style={{ color: C.textPrimary, fontWeight: "600" }}>
            No appraisal forms yet
          </Text>
          <Text
            style={{
              color: C.textMuted,
              fontSize: 12,
              textAlign: "center",
            }}
          >
            Create a review cycle first, then build your form templates.
          </Text>
          <TouchableOpacity
            onPress={() => setShowCreate(true)}
            style={{
              backgroundColor: C.primary,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
              marginTop: 4,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              New Form Template
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {filtered.map((form) => (
            <View
              key={form.id}
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
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: C.textPrimary,
                    }}
                  >
                    {form.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: C.textMuted,
                      marginTop: 2,
                    }}
                  >
                    Cycle: {form.cycle}
                  </Text>
                </View>
                <TypeBadge type={form.type} />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <View
                  style={{
                    backgroundColor:
                      form.status === "Active" ? "#d1fae5" : C.surfaceAlt,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "700",
                      color: form.status === "Active" ? "#059669" : C.textMuted,
                    }}
                  >
                    {form.status}
                  </Text>
                </View>
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 10,
                    backgroundColor: C.primaryLight,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: C.primary,
                    }}
                  >
                    Open Builder
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {showCreate && (
        <CreateFormModal
          cycles={cycles}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: "80%",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: C.textPrimary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: C.surfaceAlt,
    padding: 12,
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