// // src/components/admin/leave/ActionModal.tsx
// // Approve / Reject confirmation modal — shared by LeaveRequestsView and
// // LeaveRequestDetailView.

// import { useState } from "react";
// import {
//   Modal,
//   View,
//   Text,
//   TextInput,
//   Pressable,
//   StyleSheet,
//   ActivityIndicator,
// } from "react-native";
// import { CheckCircle2, XCircle, X } from "lucide-react-native";
// import C from "../../../styles/colors";

// interface Props {
//   visible: boolean;
//   action: "approve" | "reject" | null;
//   request: any;
//   loading?: boolean;
//   onConfirm: (comment: string) => void;
//   onClose: () => void;
// }

// export default function ActionModal({
//   visible,
//   action,
//   request,
//   loading,
//   onConfirm,
//   onClose,
// }: Props) {
//   const [comment, setComment] = useState("");
//   const isApprove = action === "approve";

//   if (!action) return null;

//   return (
//     <Modal
//       visible={visible}
//       animationType="fade"
//       transparent
//       statusBarTranslucent
//       onRequestClose={onClose}
//     >
//       <View style={s.overlay}>
//         <View style={s.sheet}>
//           <View style={s.header}>
//             <View
//               style={[
//                 s.iconWrap,
//                 { backgroundColor: isApprove ? C.successLight : C.dangerLight },
//               ]}
//             >
//               {isApprove ? (
//                 <CheckCircle2 size={20} color={C.success} />
//               ) : (
//                 <XCircle size={20} color={C.danger} />
//               )}
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={s.title}>
//                 {isApprove ? "Approve Leave" : "Reject Leave"}
//               </Text>
//               <Text style={s.subtitle} numberOfLines={1}>
//                 {request?.employee_name} · {request?.leave_type}
//               </Text>
//             </View>
//             <Pressable onPress={onClose} style={s.closeBtn}>
//               <X size={13} color={C.textSecondary} />
//             </Pressable>
//           </View>

//           <View style={s.summaryCard}>
//             <View style={s.summaryRow}>
//               <Text style={s.summaryLabel}>Duration</Text>
//               <Text style={s.summaryValue}>{request?.days} days</Text>
//             </View>
//             <View style={s.summaryRow}>
//               <Text style={s.summaryLabel}>Dates</Text>
//               <Text style={s.summaryValue}>
//                 {request?.start_date} → {request?.end_date}
//               </Text>
//             </View>
//           </View>

//           <Text style={s.label}>
//             {isApprove ? "Comment (optional)" : "Rejection Reason (required)"}
//           </Text>
//           <TextInput
//             value={comment}
//             onChangeText={setComment}
//             placeholder={
//               isApprove ? "Add an approval note…" : "Reason for rejection…"
//             }
//             placeholderTextColor={C.textMuted}
//             multiline
//             numberOfLines={3}
//             style={s.textarea}
//           />

//           <View style={s.actions}>
//             <Pressable
//               onPress={onClose}
//               style={({ pressed }) => [
//                 s.cancelBtn,
//                 pressed && { opacity: 0.85 },
//               ]}
//             >
//               <Text style={s.cancelBtnText}>Cancel</Text>
//             </Pressable>
//             <Pressable
//               onPress={() => onConfirm(comment)}
//               disabled={loading || (!isApprove && !comment.trim())}
//               style={({ pressed }) => [
//                 s.confirmBtn,
//                 { backgroundColor: isApprove ? C.success : C.danger },
//                 (loading || pressed) && { opacity: 0.85 },
//               ]}
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#fff" />
//               ) : (
//                 <Text style={s.confirmBtnText}>
//                   {isApprove ? "Approve" : "Reject"}
//                 </Text>
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
//     backgroundColor: "rgba(15,23,42,0.55)",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 20,
//   },
//   sheet: {
//     width: "100%",
//     maxWidth: 420,
//     borderRadius: 20,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     padding: 20,
//     gap: 14,
//   },
//   header: { flexDirection: "row", alignItems: "center", gap: 12 },
//   iconWrap: {
//     width: 40,
//     height: 40,
//     borderRadius: 14,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   title: { fontSize: 15, fontWeight: "800", color: C.textPrimary },
//   subtitle: { fontSize: 11, color: C.textMuted, marginTop: 2 },
//   closeBtn: {
//     width: 28,
//     height: 28,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   summaryCard: {
//     padding: 12,
//     borderRadius: 14,
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//     gap: 6,
//   },
//   summaryRow: { flexDirection: "row", justifyContent: "space-between" },
//   summaryLabel: { fontSize: 11, color: C.textMuted },
//   summaryValue: { fontSize: 11, fontWeight: "700", color: C.textPrimary },
//   label: { fontSize: 12, fontWeight: "700", color: C.textSecondary },
//   textarea: {
//     minHeight: 84,
//     borderRadius: 14,
//     borderWidth: 1.5,
//     borderColor: C.border,
//     backgroundColor: C.surfaceAlt,
//     padding: 12,
//     fontSize: 13,
//     color: C.textPrimary,
//     textAlignVertical: "top",
//   },
//   actions: { flexDirection: "row", gap: 10 },
//   cancelBtn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   cancelBtnText: { fontSize: 13, fontWeight: "700", color: C.textSecondary },
//   confirmBtn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 14,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   confirmBtnText: { fontSize: 13, fontWeight: "800", color: "#fff" },
// });


// src/components/admin/leave/ActionModal.tsx
// Approve / Reject confirmation modal — shared by LeaveRequestsView and
// LeaveRequestDetailView.

import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import { CheckCircle2, XCircle, X } from "lucide-react-native";
import C from "../../../styles/colors";

interface Props {
  visible: boolean;
  action: "approve" | "reject" | null;
  request: any;
  loading?: boolean;
  onConfirm: (comment: string) => void;
  onClose: () => void;
}

export default function ActionModal({
  visible,
  action,
  request,
  loading,
  onConfirm,
  onClose,
}: Props) {
  const [comment, setComment] = useState("");
  const isApprove = action === "approve";

  if (!action) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.header}>
            <View
              style={[
                s.iconWrap,
                { backgroundColor: isApprove ? C.successLight : C.dangerLight },
              ]}
            >
              {isApprove ? (
                <CheckCircle2 size={20} color={C.success} />
              ) : (
                <XCircle size={20} color={C.danger} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>
                {isApprove ? "Approve Leave" : "Reject Leave"}
              </Text>
              <Text style={s.subtitle} numberOfLines={1}>
                {request?.employee_name} · {request?.leave_type}
              </Text>
            </View>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <X size={13} color={C.textSecondary} />
            </Pressable>
          </View>

          <View style={s.summaryCard}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Duration</Text>
              <Text style={s.summaryValue}>{request?.days} days</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Dates</Text>
              <Text style={s.summaryValue}>
                {request?.start_date} → {request?.end_date}
              </Text>
            </View>
          </View>

          <Text style={s.label}>
            {isApprove ? "Comment (optional)" : "Rejection Reason (required)"}
          </Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder={
              isApprove ? "Add an approval note…" : "Reason for rejection…"
            }
            placeholderTextColor={C.textMuted}
            multiline
            numberOfLines={3}
            style={s.textarea}
          />

          <View style={s.actions}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                s.cancelBtn,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={s.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => onConfirm(comment)}
              disabled={loading || (!isApprove && !comment.trim())}
              style={({ pressed }) => [
                s.confirmBtn,
                { backgroundColor: isApprove ? C.success : C.danger },
                (loading || pressed) && { opacity: 0.85 },
              ]}
            >
              <Text style={s.confirmBtnText}>
                {loading
                  ? isApprove
                    ? "Approving…"
                    : "Rejecting…"
                  : isApprove
                    ? "Approve"
                    : "Reject"}
              </Text>
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
    backgroundColor: "rgba(15,23,42,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  sheet: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    gap: 14,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 15, fontWeight: "800", color: C.textPrimary },
  subtitle: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  summaryCard: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
    gap: 6,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 11, color: C.textMuted },
  summaryValue: { fontSize: 11, fontWeight: "700", color: C.textPrimary },
  label: { fontSize: 12, fontWeight: "700", color: C.textSecondary },
  textarea: {
    minHeight: 84,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surfaceAlt,
    padding: 12,
    fontSize: 13,
    color: C.textPrimary,
    textAlignVertical: "top",
  },
  actions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  cancelBtnText: { fontSize: 13, fontWeight: "700", color: C.textSecondary },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: { fontSize: 13, fontWeight: "800", color: "#fff" },
});