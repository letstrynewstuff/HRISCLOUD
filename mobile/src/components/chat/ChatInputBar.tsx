// // src/components/chat/ChatInputBar.tsx
// // Bottom input bar: file attach, text area, and send button.
// // No actual file picker library — uses Expo DocumentPicker for native.

// import { useState } from "react";
// import {
//   View,
//   TextInput,
//   Pressable,
//   StyleSheet,
//   Text,
//   ActivityIndicator,
//   Platform,
// } from "react-native";
// import { Paperclip, Send, X, FileText } from "lucide-react-native";
// import * as DocumentPicker from "expo-document-picker";
// import C from "../../styles/colors";

// export type PendingFile = {
//   file: {
//     uri: string;
//     name: string;
//     mimeType: string;
//     size?: number;
//   };
//   name: string;
// };

// type ChatInputBarProps = {
//   placeholder?: string;
//   sending?: boolean;
//   onSend: (text: string, file?: PendingFile) => void;
// };

// export default function ChatInputBar({
//   placeholder,
//   sending,
//   onSend,
// }: ChatInputBarProps) {
//   const [text, setText] = useState("");
//   const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);

//   const handleAttach = async () => {
//     try {
//       const res = await DocumentPicker.getDocumentAsync({
//         type: [
//           "image/*",
//           "application/pdf",
//           "application/msword",
//           "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//           "text/plain",
//           "text/csv",
//         ],
//         copyToCacheDirectory: true,
//       });
//       if (res.canceled || !res.assets?.length) return;
//       const asset = res.assets[0];
//       if ((asset.size ?? 0) > 10 * 1024 * 1024) {
//         // silently ignore >10MB
//         return;
//       }
//       setPendingFile({
//         file: {
//           uri: asset.uri,
//           name: asset.name,
//           mimeType: asset.mimeType ?? "application/octet-stream",
//           size: asset.size,
//         },
//         name: asset.name,
//       });
//     } catch {
//       /* cancelled */
//     }
//   };

//   const handleSend = () => {
//     const trimmed = text.trim();
//     if (!trimmed && !pendingFile) return;
//     onSend(trimmed, pendingFile ?? undefined);
//     setText("");
//     setPendingFile(null);
//   };

//   const canSend = (text.trim().length > 0 || !!pendingFile) && !sending;

//   return (
//     <View style={styles.wrap}>
//       {pendingFile && (
//         <View style={styles.filePreview}>
//           <FileText size={14} color={C.primary} />
//           <Text style={styles.fileName} numberOfLines={1}>
//             {pendingFile.name}
//           </Text>
//           <Pressable hitSlop={8} onPress={() => setPendingFile(null)}>
//             <X size={13} color={C.primary} />
//           </Pressable>
//         </View>
//       )}

//       <View style={styles.inputRow}>
//         <Pressable
//           onPress={handleAttach}
//           style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
//         >
//           <Paperclip size={18} color={C.textSecondary} />
//         </Pressable>

//         <TextInput
//           value={text}
//           onChangeText={setText}
//           placeholder={placeholder ?? "Message…"}
//           placeholderTextColor={C.textMuted}
//           multiline
//           style={styles.input}
//           onSubmitEditing={Platform.OS === "web" ? handleSend : undefined}
//           blurOnSubmit={false}
//         />

//         <Pressable
//           onPress={handleSend}
//           disabled={!canSend}
//           style={({ pressed }) => [
//             styles.sendBtn,
//             { backgroundColor: canSend ? C.primary : C.border },
//             pressed && canSend && { opacity: 0.85 },
//           ]}
//         >
//           {sending ? (
//             <ActivityIndicator size={14} color="#fff" />
//           ) : (
//             <Send size={16} color={canSend ? "#fff" : C.textMuted} />
//           )}
//         </Pressable>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrap: {
//     backgroundColor: C.surface,
//     borderTopWidth: 1,
//     borderTopColor: C.border,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     paddingBottom: 14,
//   },
//   filePreview: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     backgroundColor: C.primaryLight,
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     paddingVertical: 7,
//     marginBottom: 8,
//   },
//   fileName: {
//     flex: 1,
//     fontSize: 12,
//     fontWeight: "600",
//     color: C.primary,
//   },
//   inputRow: {
//     flexDirection: "row",
//     alignItems: "flex-end",
//     gap: 8,
//   },
//   iconBtn: {
//     width: 38,
//     height: 38,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   input: {
//     flex: 1,
//     minHeight: 38,
//     maxHeight: 110,
//     backgroundColor: C.surfaceAlt,
//     borderRadius: 14,
//     borderWidth: 1.5,
//     borderColor: C.border,
//     paddingHorizontal: 14,
//     paddingVertical: 9,
//     fontSize: 14,
//     color: C.textPrimary,
//   },
//   sendBtn: {
//     width: 38,
//     height: 38,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });


// src/components/chat/ChatInputBar.tsx
// Bottom input bar: file attach, text area, and send button.
// FIXED: KeyboardAvoidingView pushes input above keyboard.

import { useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Text,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Paperclip, Send, X, FileText } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import C from "../../styles/colors";

export type PendingFile = {
  file: {
    uri: string;
    name: string;
    mimeType: string;
    size?: number;
  };
  name: string;
};

type ChatInputBarProps = {
  placeholder?: string;
  sending?: boolean;
  onSend: (text: string, file?: PendingFile) => void;
};

export default function ChatInputBar({
  placeholder,
  sending,
  onSend,
}: ChatInputBarProps) {
  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);

  const handleAttach = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          "image/*",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
          "text/csv",
        ],
        copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets?.length) return;
      const asset = res.assets[0];
      if ((asset.size ?? 0) > 10 * 1024 * 1024) {
        return;
      }
      setPendingFile({
        file: {
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType ?? "application/octet-stream",
          size: asset.size,
        },
        name: asset.name,
      });
    } catch {
      /* cancelled */
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !pendingFile) return;
    onSend(trimmed, pendingFile ?? undefined);
    setText("");
    setPendingFile(null);
  };

  const canSend = (text.trim().length > 0 || !!pendingFile) && !sending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View style={styles.wrap}>
        {pendingFile && (
          <View style={styles.filePreview}>
            <FileText size={14} color={C.primary} />
            <Text style={styles.fileName} numberOfLines={1}>
              {pendingFile.name}
            </Text>
            <Pressable hitSlop={8} onPress={() => setPendingFile(null)}>
              <X size={13} color={C.primary} />
            </Pressable>
          </View>
        )}

        <View style={styles.inputRow}>
          <Pressable
            onPress={handleAttach}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
          >
            <Paperclip size={18} color={C.textSecondary} />
          </Pressable>

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={placeholder ?? "Message…"}
            placeholderTextColor={C.textMuted}
            multiline
            style={styles.input}
            onSubmitEditing={Platform.OS === "web" ? handleSend : undefined}
            blurOnSubmit={false}
          />

          <Pressable
            onPress={handleSend}
            disabled={!canSend}
            style={({ pressed }) => [
              styles.sendBtn,
              { backgroundColor: canSend ? C.primary : C.border },
              pressed && canSend && { opacity: 0.85 },
            ]}
          >
            {sending ? (
              <ActivityIndicator size={14} color="#fff" />
            ) : (
              <Send size={16} color={canSend ? "#fff" : C.textMuted} />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 14,
  },
  filePreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 8,
  },
  fileName: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: C.primary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  input: {
    flex: 1,
    minHeight: 38,
    maxHeight: 110,
    backgroundColor: C.surfaceAlt,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
    color: C.textPrimary,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
