// // src/components/admin/announcements/DeleteAnnouncementModal.tsx

// import {
//   Modal,
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   ActivityIndicator,
// } from "react-native";
// import { Trash2 } from "lucide-react-native";
// import C from "../../../styles/colors";

// interface Props {
//   visible: boolean;
//   announcement: any;
//   loading: boolean;
//   onConfirm: () => void;
//   onCancel: () => void;
// }

// export default function DeleteAnnouncementModal({
//   visible,
//   announcement,
//   loading,
//   onConfirm,
//   onCancel,
// }: Props) {
//   if (!announcement) return null;

//   return (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="fade"
//       onRequestClose={onCancel}
//     >
//       <View style={styles.backdrop}>
//         <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
//         <View style={styles.card}>
//           <View style={styles.iconWrap}>
//             <Trash2 size={22} color={C.danger} />
//           </View>
//           <Text style={styles.title}>Delete Announcement?</Text>
//           <Text style={styles.desc}>
//             "{announcement?.title}" will be permanently deleted. This action
//             cannot be undone.
//           </Text>

//           <View style={styles.actions}>
//             <Pressable
//               onPress={onConfirm}
//               disabled={loading}
//               style={[styles.deleteBtn, loading && { opacity: 0.7 }]}
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#fff" />
//               ) : (
//                 <>
//                   <Trash2 size={14} color="#fff" />
//                   <Text style={styles.deleteBtnText}>Delete</Text>
//                 </>
//               )}
//             </Pressable>
//             <Pressable
//               onPress={onCancel}
//               disabled={loading}
//               style={styles.cancelBtn}
//             >
//               <Text style={styles.cancelBtnText}>Cancel</Text>
//             </Pressable>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   backdrop: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "rgba(15,23,42,0.6)",
//     padding: 20,
//   },
//   card: {
//     width: "100%",
//     maxWidth: 340,
//     borderRadius: 20,
//     backgroundColor: C.surface,
//     padding: 22,
//     alignItems: "center",
//   },
//   iconWrap: {
//     width: 52,
//     height: 52,
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.dangerLight,
//     marginBottom: 12,
//   },
//   title: {
//     fontSize: 15,
//     fontWeight: "800",
//     color: C.textPrimary,
//     marginBottom: 6,
//   },
//   desc: {
//     fontSize: 13,
//     color: C.textSecondary,
//     textAlign: "center",
//     lineHeight: 19,
//     marginBottom: 18,
//   },
//   actions: { flexDirection: "row", gap: 10, width: "100%" },
//   deleteBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     paddingVertical: 12,
//     borderRadius: 14,
//     backgroundColor: C.danger,
//   },
//   deleteBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
//   cancelBtn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 14,
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   cancelBtnText: { color: C.textSecondary, fontWeight: "800", fontSize: 13 },
// });



// src/components/admin/announcements/DeleteAnnouncementModal.tsx

import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { Trash2 } from "lucide-react-native";
import C from "../../../styles/colors";
import { Loader } from "../../../hooks/loaderManager";

interface Props {
  visible: boolean;
  announcement: any;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteAnnouncementModal({
  visible,
  announcement,
  onConfirm,
  onCancel,
}: Props) {
  if (!announcement) return null;

  const handleConfirm = () => {
    Loader.show();
    onConfirm();
    // The parent should call Loader.hide() in its finally block
    // after the API call completes
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Trash2 size={22} color={C.danger} />
          </View>
          <Text style={styles.title}>Delete Announcement?</Text>
          <Text style={styles.desc}>
            "{announcement?.title}" will be permanently deleted. This action
            cannot be undone.
          </Text>

          <View style={styles.actions}>
            <Pressable
              onPress={handleConfirm}
              style={styles.deleteBtn}
            >
              <Trash2 size={14} color="#fff" />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </Pressable>
            <Pressable
              onPress={onCancel}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.6)",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    backgroundColor: C.surface,
    padding: 22,
    alignItems: "center",
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.dangerLight,
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    color: C.textPrimary,
    marginBottom: 6,
  },
  desc: {
    fontSize: 13,
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 18,
  },
  actions: { flexDirection: "row", gap: 10, width: "100%" },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: C.danger,
  },
  deleteBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: { color: C.textSecondary, fontWeight: "800", fontSize: 13 },
});