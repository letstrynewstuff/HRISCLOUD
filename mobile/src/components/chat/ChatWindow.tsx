// // src/components/chat/ChatWindow.tsx
// // Full conversation view: header, scrollable message list, input bar.
// // Used as a modal-style full screen inside both Manager and Employee chat.

// import { useCallback, useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   Pressable,
//   ActivityIndicator,
// } from "react-native";
// import { ArrowLeft, Hash } from "lucide-react-native";
// import Toast from "react-native-toast-message";
// import C from "../../styles/colors";
// import { chatApi } from "../../api/service/chatApi";
// import MessageBubble, { ChatMessage } from "./MessageBubble";
// import ChatInputBar, { PendingFile } from "./ChatInputBar";
// import ChatAvatar from "./ChatAvatar";

// export type ActiveConv = {
//   type: "channel" | "dm";
//   channelId: string; // real backend channel UUID (group or DM)
//   name: string; // display name
//   memberCount?: number;
// };

// type ChatWindowProps = {
//   conv: ActiveConv;
//   myEmployeeId: string;
//   myName: string;
//   onBack: () => void;
// };

// const POLL_MS = 3000;

// export default function ChatWindow({
//   conv,
//   myEmployeeId,
//   myName,
//   onBack,
// }: ChatWindowProps) {
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);
//   const scrollRef = useRef<ScrollView>(null);
//   const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const convRef = useRef(conv.channelId);

//   const scrollToBottom = () =>
//     setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

//   const fetchMessages = useCallback(async () => {
//     try {
//       const res = await chatApi.getMessages(conv.channelId, { limit: 60 });
//       if (convRef.current === conv.channelId) {
//         setMessages(res.messages ?? []);
//         scrollToBottom();
//       }
//     } catch {
//       // silent poll failure
//     } finally {
//       setLoading(false);
//     }
//   }, [conv.channelId]);

//   useEffect(() => {
//     convRef.current = conv.channelId;
//     setLoading(true);
//     setMessages([]);
//     fetchMessages();

//     pollRef.current = setInterval(fetchMessages, POLL_MS);
//     return () => {
//       if (pollRef.current) clearInterval(pollRef.current);
//     };
//   }, [fetchMessages]);

//   const handleSend = async (text: string, pendingFile?: PendingFile) => {
//     if (!text && !pendingFile) return;
//     setSending(true);

//     // Optimistic bubble
//     const tempMsg: ChatMessage = {
//       _tempId: `temp-${Date.now()}`,
//       senderId: myEmployeeId,
//       senderName: myName,
//       body: text,
//       contentType: pendingFile ? "document" : "text",
//       createdAt: new Date().toISOString(),
//     };
//     setMessages((p) => [...p, tempMsg]);
//     scrollToBottom();

//     try {
//       let res: { message?: ChatMessage } & Partial<ChatMessage>;

//       if (pendingFile) {
//         // Build a RN-compatible File blob for multipart upload
//         const blob = {
//           uri: pendingFile.file.uri,
//           name: pendingFile.file.name,
//           type: pendingFile.file.mimeType,
//         } as unknown as File;
//         res = await chatApi.sendDocument(conv.channelId, blob, text);
//       } else {
//         res = await chatApi.sendText(conv.channelId, text);
//       }

//       const real = res.message ?? (res as ChatMessage);
//       setMessages((p) => {
//         const idx = [...p].reverse().findIndex((m) => m._tempId);
//         if (idx === -1) return [...p, real];
//         const updated = [...p];
//         updated[p.length - 1 - idx] = real;
//         return updated;
//       });
//     } catch (err: any) {
//       setMessages((p) => p.filter((m) => !m._tempId));
//       Toast.show({
//         type: "error",
//         text1: err?.response?.data?.message ?? "Failed to send.",
//       });
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <View style={styles.screen}>
//       {/* Header */}
//       <View style={styles.header}>
//         <Pressable onPress={onBack} hitSlop={10} style={styles.backBtn}>
//           <ArrowLeft size={18} color={C.textSecondary} />
//         </Pressable>

//         <View
//           style={[
//             styles.convIcon,
//             {
//               backgroundColor:
//                 conv.type === "channel" ? C.primaryLight : `${C.primary}22`,
//             },
//           ]}
//         >
//           {conv.type === "channel" ? (
//             <Hash size={15} color={C.primary} />
//           ) : (
//             <ChatAvatar name={conv.name} size={34} />
//           )}
//         </View>

//         <View style={{ flex: 1 }}>
//           <Text style={styles.convName} numberOfLines={1}>
//             {conv.type === "channel" ? `# ${conv.name}` : conv.name}
//           </Text>
//           <Text style={styles.convSub}>
//             {conv.type === "channel"
//               ? conv.memberCount
//                 ? `${conv.memberCount} members`
//                 : "Group channel"
//               : "Direct Message"}
//           </Text>
//         </View>

//         <View style={styles.liveDot} />
//       </View>

//       {/* Messages */}
//       <ScrollView
//         ref={scrollRef}
//         style={styles.msgList}
//         contentContainerStyle={styles.msgContent}
//         showsVerticalScrollIndicator={false}
//         onContentSizeChange={scrollToBottom}
//       >
//         {loading ? (
//           <View style={styles.centerState}>
//             <ActivityIndicator color={C.primary} />
//           </View>
//         ) : messages.length === 0 ? (
//           <View style={styles.centerState}>
//             <Text style={styles.emptyText}>
//               {conv.type === "channel"
//                 ? `Start the conversation in #${conv.name}`
//                 : `Start a conversation with ${conv.name}`}
//             </Text>
//           </View>
//         ) : (
//           messages.map((msg, i) => {
//             const fromId = msg.senderId ?? "";
//             const isMine = fromId === myEmployeeId || !!msg._tempId;
//             const prevId = i > 0 ? (messages[i - 1].senderId ?? "") : "";
//             const showAvatar = !isMine && fromId !== prevId;
//             return (
//               <MessageBubble
//                 key={msg.id ?? msg._tempId ?? i}
//                 msg={msg}
//                 isMine={isMine}
//                 showAvatar={showAvatar}
//               />
//             );
//           })
//         )}
//       </ScrollView>

//       <ChatInputBar
//         placeholder={
//           conv.type === "channel"
//             ? `Message #${conv.name}…`
//             : `Message ${conv.name}…`
//         }
//         sending={sending}
//         onSend={handleSend}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//     backgroundColor: C.bg,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     backgroundColor: C.surface,
//     borderBottomWidth: 1,
//     borderBottomColor: C.border,
//   },
//   backBtn: {
//     width: 34,
//     height: 34,
//     borderRadius: 11,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   convIcon: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     overflow: "hidden",
//   },
//   convName: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: C.textPrimary,
//   },
//   convSub: {
//     fontSize: 10.5,
//     color: C.textMuted,
//     marginTop: 1,
//   },
//   liveDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: C.success,
//   },
//   msgList: {
//     flex: 1,
//   },
//   msgContent: {
//     padding: 14,
//     gap: 6,
//   },
//   centerState: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingTop: 60,
//   },
//   emptyText: {
//     fontSize: 13,
//     color: C.textMuted,
//     textAlign: "center",
//   },
// });


// src/components/chat/ChatWindow.tsx
// Full conversation view: header, scrollable message list, input bar.
// Used as a modal-style full screen inside both Manager and Employee chat.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Hash } from "lucide-react-native";
import Toast from "react-native-toast-message";
import C from "../../styles/colors";
import { chatApi } from "../../api/service/chatApi";
import MessageBubble, { ChatMessage } from "./MessageBubble";
import ChatInputBar, { PendingFile } from "./ChatInputBar";
import ChatAvatar from "./ChatAvatar";

export type ActiveConv = {
  type: "channel" | "dm";
  channelId: string; // real backend channel UUID (group or DM)
  name: string; // display name
  memberCount?: number;
};

type ChatWindowProps = {
  conv: ActiveConv;
  myEmployeeId: string;
  myName: string;
  onBack: () => void;
};

const POLL_MS = 3000;

export default function ChatWindow({
  conv,
  myEmployeeId,
  myName,
  onBack,
}: ChatWindowProps) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const convRef = useRef(conv.channelId);

  const scrollToBottom = () =>
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await chatApi.getMessages(conv.channelId, { limit: 60 });
      if (convRef.current === conv.channelId) {
        setMessages(res.messages ?? []);
        scrollToBottom();
      }
    } catch {
      // silent poll failure
    } finally {
      setLoading(false);
    }
  }, [conv.channelId]);

  useEffect(() => {
    convRef.current = conv.channelId;
    setLoading(true);
    setMessages([]);
    fetchMessages();

    pollRef.current = setInterval(fetchMessages, POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchMessages]);

  const handleSend = async (text: string, pendingFile?: PendingFile) => {
    if (!text && !pendingFile) return;
    setSending(true);

    // Optimistic bubble
    const tempMsg: ChatMessage = {
      _tempId: `temp-${Date.now()}`,
      senderId: myEmployeeId,
      senderName: myName,
      body: text,
      contentType: pendingFile ? "document" : "text",
      createdAt: new Date().toISOString(),
    };
    setMessages((p) => [...p, tempMsg]);
    scrollToBottom();

    try {
      let res: { message?: ChatMessage } & Partial<ChatMessage>;

      if (pendingFile) {
        // Build a RN-compatible File blob for multipart upload
        const blob = {
          uri: pendingFile.file.uri,
          name: pendingFile.file.name,
          type: pendingFile.file.mimeType,
        } as unknown as File;
        res = await chatApi.sendDocument(conv.channelId, blob, text);
      } else {
        res = await chatApi.sendText(conv.channelId, text);
      }

      const real = res.message ?? (res as ChatMessage);
      setMessages((p) => {
        const idx = [...p].reverse().findIndex((m) => m._tempId);
        if (idx === -1) return [...p, real];
        const updated = [...p];
        updated[p.length - 1 - idx] = real;
        return updated;
      });
    } catch (err: any) {
      setMessages((p) => p.filter((m) => !m._tempId));
      Toast.show({
        type: "error",
        text1: err?.response?.data?.message ?? "Failed to send.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={10} style={styles.backBtn}>
          <ArrowLeft size={18} color={C.textSecondary} />
        </Pressable>

        <View
          style={[
            styles.convIcon,
            {
              backgroundColor:
                conv.type === "channel" ? C.primaryLight : `${C.primary}22`,
            },
          ]}
        >
          {conv.type === "channel" ? (
            <Hash size={15} color={C.primary} />
          ) : (
            <ChatAvatar name={conv.name} size={34} />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.convName} numberOfLines={1}>
            {conv.type === "channel" ? `# ${conv.name}` : conv.name}
          </Text>
          <Text style={styles.convSub}>
            {conv.type === "channel"
              ? conv.memberCount
                ? `${conv.memberCount} members`
                : "Group channel"
              : "Direct Message"}
          </Text>
        </View>

        <View style={styles.liveDot} />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.msgList}
        contentContainerStyle={styles.msgContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
      >
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={C.primary} />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={styles.emptyText}>
              {conv.type === "channel"
                ? `Start the conversation in #${conv.name}`
                : `Start a conversation with ${conv.name}`}
            </Text>
          </View>
        ) : (
          messages.map((msg, i) => {
            const fromId = msg.senderId ?? "";
            const isMine = fromId === myEmployeeId || !!msg._tempId;
            const prevId = i > 0 ? (messages[i - 1].senderId ?? "") : "";
            const showAvatar = !isMine && fromId !== prevId;
            return (
              <MessageBubble
                key={msg.id ?? msg._tempId ?? i}
                msg={msg}
                isMine={isMine}
                showAvatar={showAvatar}
              />
            );
          })
        )}
      </ScrollView>

      <ChatInputBar
        placeholder={
          conv.type === "channel"
            ? `Message #${conv.name}…`
            : `Message ${conv.name}…`
        }
        sending={sending}
        onSend={handleSend}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  convIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  convName: {
    fontSize: 14,
    fontWeight: "700",
    color: C.textPrimary,
  },
  convSub: {
    fontSize: 10.5,
    color: C.textMuted,
    marginTop: 1,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.success,
  },
  msgList: {
    flex: 1,
  },
  msgContent: {
    padding: 14,
    gap: 6,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 13,
    color: C.textMuted,
    textAlign: "center",
  },
});