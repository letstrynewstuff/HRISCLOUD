// // src/components/admin/department/DeleteDepartmentModal.tsx
// // Confirm deactivation of a department — mirrors ActionModal in
// // EmployeeProfileView.tsx.

// import {
//   View,
//   Text,
//   Pressable,
//   Modal,
//   ActivityIndicator,
//   StyleSheet,
// } from "react-native";
// import { AlertTriangle } from "lucide-react-native";
// import C from "../../../styles/colors";

// interface Props {
//   department: any | null;
//   loading: boolean;
//   onConfirm: () => void;
//   onClose: () => void;
// }

// export default function DeleteDepartmentModal({
//   department,
//   loading,
//   onConfirm,
//   onClose,
// }: Props) {
//   return (
//     <Modal
//       visible={!!department}
//       animationType="fade"
//       transparent
//       statusBarTranslucent
//       onRequestClose={onClose}
//     >
//       <View style={s.overlay}>
//         <View style={s.sheet}>
//           <View style={s.iconWrap}>
//             <AlertTriangle size={24} color={C.danger} />
//           </View>
//           <Text style={s.title}>Deactivate Department?</Text>
//           <Text style={s.msg}>
//             Are you sure you want to deactivate{" "}
//             <Text style={{ fontWeight: "800", color: C.textPrimary }}>
//               {department?.name}
//             </Text>
//             ?
//           </Text>
//           <Text style={s.warn}>
//             This will fail if the department still has active employees.
//           </Text>

//           <View style={s.actions}>
//             <Pressable
//               onPress={onClose}
//               style={({ pressed }) => [
//                 s.btnSecondary,
//                 pressed && { opacity: 0.85 },
//               ]}
//             >
//               <Text style={s.btnSecondaryText}>Cancel</Text>
//             </Pressable>
//             <Pressable
//               onPress={onConfirm}
//               disabled={loading}
//               style={({ pressed }) => [
//                 s.btnDanger,
//                 (loading || pressed) && { opacity: loading ? 0.7 : 0.85 },
//               ]}
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#fff" />
//               ) : (
//                 <Text style={s.btnDangerText}>Deactivate</Text>
//               )}
//             </Pressable>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const s = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.4)",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   sheet: {
//     width: "100%",
//     maxWidth: 340,
//     borderRadius: 24,
//     backgroundColor: C.surface,
//     padding: 24,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   iconWrap: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.dangerLight,
//     marginBottom: 14,
//   },
//   title: {
//     fontSize: 17,
//     fontWeight: "800",
//     color: C.textPrimary,
//     marginBottom: 6,
//   },
//   msg: { fontSize: 13, color: C.textSecondary, textAlign: "center" },
//   warn: {
//     fontSize: 12,
//     color: C.danger,
//     textAlign: "center",
//     marginTop: 6,
//     marginBottom: 18,
//   },
//   actions: { flexDirection: "row", gap: 10, width: "100%" },
//   btnSecondary: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   btnSecondaryText: { fontSize: 14, fontWeight: "700", color: C.textSecondary },
//   btnDanger: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//     backgroundColor: C.danger,
//   },
//   btnDangerText: { fontSize: 14, fontWeight: "800", color: "#fff" },
// });


// src/components/admin/department/DeleteDepartmentModal.tsx
// Confirm deactivation of a department — mirrors ActionModal in
// EmployeeProfileView.tsx.

import {
  View,
  Text,
  Pressable,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { AlertTriangle } from "lucide-react-native";
import C from "../../../styles/colors";
import { Loader } from "../../../hooks/loaderManager";

interface Props {
  department: any | null;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteDepartmentModal({
  department,
  loading,
  onConfirm,
  onClose,
}: Props) {
  return (
    <Modal
      visible={!!department}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.iconWrap}>
            <AlertTriangle size={24} color={C.danger} />
          </View>
          <Text style={s.title}>Deactivate Department?</Text>
          <Text style={s.msg}>
            Are you sure you want to deactivate{" "}
            <Text style={{ fontWeight: "800", color: C.textPrimary }}>
              {department?.name}
            </Text>
            ?
          </Text>
          <Text style={s.warn}>
            This will fail if the department still has active employees.
          </Text>

          <View style={s.actions}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                s.btnSecondary,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={s.btnSecondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Loader.show();
                onConfirm();
              }}
              disabled={loading}
              style={({ pressed }) => [
                s.btnDanger,
                (loading || pressed) && { opacity: loading ? 0.7 : 0.85 },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.btnDangerText}>Deactivate</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  sheet: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    backgroundColor: C.surface,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.dangerLight,
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: C.textPrimary,
    marginBottom: 6,
  },
  msg: { fontSize: 13, color: C.textSecondary, textAlign: "center" },
  warn: {
    fontSize: 12,
    color: C.danger,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18,
  },
  actions: { flexDirection: "row", gap: 10, width: "100%" },
  btnSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  btnSecondaryText: { fontSize: 14, fontWeight: "700", color: C.textSecondary },
  btnDanger: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.danger,
  },
  btnDangerText: { fontSize: 14, fontWeight: "800", color: "#fff" },
});