// // src/components/admin/documents/EmployeePickerList.tsx
// // Search + multi-select employee list used in Step 2 of SendDocumentModal.

// import {
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   TextInput,
//   ActivityIndicator,
//   ScrollView,
// } from "react-native";
// import { Search, X, UserCheck, CheckCircle2, Users } from "lucide-react-native";
// import C from "../../../styles/colors";
// import { getInitials } from "./documentsShared";

// interface Props {
//   employees: any[];
//   loading: boolean;
//   search: string;
//   onSearchChange: (v: string) => void;
//   selected: string[];
//   onToggle: (id: string) => void;
//   onToggleAll: () => void;
// }

// export default function EmployeePickerList({
//   employees,
//   loading,
//   search,
//   onSearchChange,
//   selected,
//   onToggle,
//   onToggleAll,
// }: Props) {
//   const filtered = employees.filter((e) => {
//     const q = search.toLowerCase();
//     return (
//       !q ||
//       `${e.first_name ?? ""} ${e.last_name ?? ""}`.toLowerCase().includes(q) ||
//       e.email?.toLowerCase().includes(q) ||
//       e.department?.toLowerCase().includes(q)
//     );
//   });

//   const allSelected =
//     filtered.length > 0 && selected.length === filtered.length;

//   return (
//     <View style={{ gap: 12 }}>
//       <View style={{ flexDirection: "row", gap: 8 }}>
//         <View style={styles.searchWrap}>
//           <Search size={13} color={C.textMuted} />
//           <TextInput
//             value={search}
//             onChangeText={onSearchChange}
//             placeholder="Search name, email, department…"
//             placeholderTextColor={C.textMuted}
//             style={styles.searchInput}
//           />
//           {search.length > 0 && (
//             <Pressable onPress={() => onSearchChange("")}>
//               <X size={13} color={C.textMuted} />
//             </Pressable>
//           )}
//         </View>
//         {filtered.length > 0 && !loading && (
//           <Pressable
//             onPress={onToggleAll}
//             style={[
//               styles.selectAllBtn,
//               allSelected && styles.selectAllBtnActive,
//             ]}
//           >
//             <Text
//               style={[styles.selectAllText, allSelected && { color: "#fff" }]}
//             >
//               {allSelected ? "Deselect All" : "Select All"}
//             </Text>
//           </Pressable>
//         )}
//       </View>

//       {selected.length > 0 && (
//         <View style={styles.selectionPill}>
//           <UserCheck size={13} color={C.primary} />
//           <Text style={styles.selectionPillText}>
//             {selected.length} employee{selected.length > 1 ? "s" : ""} selected
//           </Text>
//         </View>
//       )}

//       <View style={styles.listBox}>
//         {loading ? (
//           <View style={styles.centerBox}>
//             <ActivityIndicator size="small" color={C.primary} />
//             <Text style={styles.centerBoxText}>Loading employees…</Text>
//           </View>
//         ) : filtered.length === 0 ? (
//           <View style={styles.centerBox}>
//             <Users size={26} color={C.textMuted} />
//             <Text style={styles.centerBoxText}>
//               {employees.length === 0
//                 ? "No employees in this company"
//                 : "No employees match your search"}
//             </Text>
//           </View>
//         ) : (
//           <ScrollView style={{ maxHeight: 320 }} nestedScrollEnabled>
//             {filtered.map((emp) => {
//               const isSel = selected.includes(emp.id);
//               return (
//                 <Pressable
//                   key={emp.id}
//                   onPress={() => onToggle(emp.id)}
//                   style={[
//                     styles.row,
//                     isSel && { backgroundColor: C.primaryLight },
//                   ]}
//                 >
//                   <View
//                     style={[
//                       styles.avatar,
//                       { backgroundColor: isSel ? "#C7D2FE" : "#E2E8F0" },
//                     ]}
//                   >
//                     <Text
//                       style={[
//                         styles.avatarText,
//                         { color: isSel ? C.primary : "#475569" },
//                       ]}
//                     >
//                       {getInitials(emp.first_name, emp.last_name)}
//                     </Text>
//                   </View>
//                   <View style={{ flex: 1 }}>
//                     <Text style={styles.rowName} numberOfLines={1}>
//                       {emp.first_name} {emp.last_name}
//                     </Text>
//                     <Text style={styles.rowMeta} numberOfLines={1}>
//                       {emp.job_title ?? emp.position ?? "—"} ·{" "}
//                       {emp.department ?? "—"}
//                     </Text>
//                   </View>
//                   <View
//                     style={[
//                       styles.checkbox,
//                       {
//                         backgroundColor: isSel ? C.primary : C.surfaceAlt,
//                         borderColor: isSel ? C.primary : C.border,
//                       },
//                     ]}
//                   >
//                     {isSel && <CheckCircle2 size={11} color="#fff" />}
//                   </View>
//                 </Pressable>
//               );
//             })}
//           </ScrollView>
//         )}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   searchWrap: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderRadius: 14,
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 13,
//     color: C.textPrimary,
//     paddingVertical: 0,
//   },
//   selectAllBtn: {
//     paddingHorizontal: 12,
//     justifyContent: "center",
//     borderRadius: 14,
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   selectAllBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
//   selectAllText: { fontSize: 11, fontWeight: "800", color: C.textSecondary },

//   selectionPill: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 14,
//     backgroundColor: C.primaryLight,
//     borderWidth: 1,
//     borderColor: "#C7D2FE",
//   },
//   selectionPillText: { fontSize: 12, fontWeight: "800", color: C.primary },

//   listBox: {
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: C.border,
//     overflow: "hidden",
//   },
//   centerBox: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 40,
//     gap: 8,
//   },
//   centerBoxText: { fontSize: 12, color: C.textMuted, fontWeight: "600" },

//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: C.border,
//   },
//   avatar: {
//     width: 34,
//     height: 34,
//     borderRadius: 17,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   avatarText: { fontSize: 12, fontWeight: "800" },
//   rowName: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
//   rowMeta: { fontSize: 11, color: C.textMuted, marginTop: 1 },
//   checkbox: {
//     width: 20,
//     height: 20,
//     borderRadius: 6,
//     borderWidth: 2,
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });

// src/components/admin/documents/EmployeePickerList.tsx
// Search + multi-select employee list used in Step 2 of SendDocumentModal.

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Search, X, UserCheck, CheckCircle2, Users } from "lucide-react-native";
import C from "../../../styles/colors";
import { getInitials } from "./documentsShared";
import { Loader } from "../../../hooks/loaderManager";

interface Props {
  employees: any[];
  loading: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  selected: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}

export default function EmployeePickerList({
  employees,
  loading,
  search,
  onSearchChange,
  selected,
  onToggle,
  onToggleAll,
}: Props) {
  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      !q ||
      `${e.first_name ?? ""} ${e.last_name ?? ""}`.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.department?.toLowerCase().includes(q)
    );
  });

  const allSelected =
    filtered.length > 0 && selected.length === filtered.length;

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={styles.searchWrap}>
          <Search size={13} color={C.textMuted} />
          <TextInput
            value={search}
            onChangeText={onSearchChange}
            placeholder="Search name, email, department…"
            placeholderTextColor={C.textMuted}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable onPress={() => onSearchChange("")}>
              <X size={13} color={C.textMuted} />
            </Pressable>
          )}
        </View>
        {filtered.length > 0 && !loading && (
          <Pressable
            onPress={onToggleAll}
            style={[
              styles.selectAllBtn,
              allSelected && styles.selectAllBtnActive,
            ]}
          >
            <Text
              style={[styles.selectAllText, allSelected && { color: "#fff" }]}
            >
              {allSelected ? "Deselect All" : "Select All"}
            </Text>
          </Pressable>
        )}
      </View>

      {selected.length > 0 && (
        <View style={styles.selectionPill}>
          <UserCheck size={13} color={C.primary} />
          <Text style={styles.selectionPillText}>
            {selected.length} employee{selected.length > 1 ? "s" : ""} selected
          </Text>
        </View>
      )}

      <View style={styles.listBox}>
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="small" color={C.primary} />
            <Text style={styles.centerBoxText}>Loading employees…</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.centerBox}>
            <Users size={26} color={C.textMuted} />
            <Text style={styles.centerBoxText}>
              {employees.length === 0
                ? "No employees in this company"
                : "No employees match your search"}
            </Text>
          </View>
        ) : (
          <ScrollView style={{ maxHeight: 320 }} nestedScrollEnabled>
            {filtered.map((emp) => {
              const isSel = selected.includes(emp.id);
              return (
                <Pressable
                  key={emp.id}
                  onPress={() => onToggle(emp.id)}
                  style={[
                    styles.row,
                    isSel && { backgroundColor: C.primaryLight },
                  ]}
                >
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: isSel ? "#C7D2FE" : "#E2E8F0" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.avatarText,
                        { color: isSel ? C.primary : "#475569" },
                      ]}
                    >
                      {getInitials(emp.first_name, emp.last_name)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowName} numberOfLines={1}>
                      {emp.first_name} {emp.last_name}
                    </Text>
                    <Text style={styles.rowMeta} numberOfLines={1}>
                      {emp.job_title ?? emp.position ?? "—"} ·{" "}
                      {emp.department ?? "—"}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: isSel ? C.primary : C.surfaceAlt,
                        borderColor: isSel ? C.primary : C.border,
                      },
                    ]}
                  >
                    {isSel && <CheckCircle2 size={11} color="#fff" />}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: C.textPrimary,
    paddingVertical: 0,
  },
  selectAllBtn: {
    paddingHorizontal: 12,
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  selectAllBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  selectAllText: { fontSize: 11, fontWeight: "800", color: C.textSecondary },

  selectionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  selectionPillText: { fontSize: 12, fontWeight: "800", color: C.primary },

  listBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  centerBoxText: { fontSize: 12, color: C.textMuted, fontWeight: "600" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 12, fontWeight: "800" },
  rowName: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  rowMeta: { fontSize: 11, color: C.textMuted, marginTop: 1 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});