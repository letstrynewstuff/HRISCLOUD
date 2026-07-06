// src/components/chat/MessageBubble.tsx
// Single message bubble — handles text, image attachments, and file attachments.

import { View, Text, StyleSheet, Pressable, Linking } from "react-native";
import { FileText, Download } from "lucide-react-native";
import C from "../../styles/colors";
import ChatAvatar from "./ChatAvatar";
import { fmtTime, isImageMime } from "../../hooks/chatHelpers";

export type ChatMessage = {
  id?: string;
  _tempId?: string;
  senderId?: string;
  senderName?: string;
  body?: string;
  text?: string;
  contentType?: string;
  fileMime?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  file?: { mimeType?: string; url?: string; name?: string; size?: number };
  createdAt?: string;
  isDeleted?: boolean;
};

type MessageBubbleProps = {
  msg: ChatMessage;
  isMine: boolean;
  showAvatar: boolean;
};

export default function MessageBubble({
  msg,
  isMine,
  showAvatar,
}: MessageBubbleProps) {
  const body = msg.body ?? msg.text ?? "";
  const fileMime = msg.fileMime ?? msg.file?.mimeType ?? "";
  const fileUrl = msg.fileUrl ?? msg.file?.url ?? "";
  const fileName = msg.fileName ?? msg.file?.name ?? "";
  const fileSize = msg.fileSize ?? msg.file?.size ?? 0;
  const hasFile = msg.contentType === "document" || !!fileUrl;
  const isImg = isImageMime(fileMime);

  return (
    <View style={[styles.row, isMine && styles.rowReverse]}>
      {!isMine && (
        <View style={styles.avatarSlot}>
          {showAvatar ? <ChatAvatar name={msg.senderName} size={28} /> : null}
        </View>
      )}

      <View style={[styles.col, isMine && styles.colRight]}>
        {!isMine && showAvatar && (
          <Text style={styles.senderName}>{msg.senderName}</Text>
        )}

        {msg.isDeleted ? (
          <View style={styles.deletedBubble}>
            <Text style={styles.deletedText}>This message was deleted</Text>
          </View>
        ) : (
          <View
            style={[
              styles.bubble,
              isMine ? styles.bubbleMine : styles.bubbleTheirs,
            ]}
          >
            {hasFile && !isImg && (
              <Pressable
                onPress={() => fileUrl && Linking.openURL(fileUrl)}
                style={[
                  styles.fileRow,
                  {
                    backgroundColor: isMine
                      ? "rgba(255,255,255,0.15)"
                      : C.border,
                  },
                ]}
              >
                <FileText size={16} color={isMine ? "#fff" : C.primary} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.fileName,
                      { color: isMine ? "#fff" : C.textPrimary },
                    ]}
                    numberOfLines={1}
                  >
                    {fileName}
                  </Text>
                  {!!fileSize && (
                    <Text style={styles.fileSize}>
                      {(fileSize / 1024).toFixed(1)} KB
                    </Text>
                  )}
                </View>
                <Download
                  size={13}
                  color={isMine ? "rgba(255,255,255,0.8)" : C.textMuted}
                />
              </Pressable>
            )}

            {!!body && (
              <Text style={[styles.bodyText, isMine && styles.bodyMine]}>
                {body}
              </Text>
            )}
            <Text style={[styles.timeText, isMine && styles.timeRight]}>
              {fmtTime(msg.createdAt)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    marginBottom: 4,
  },
  rowReverse: {
    flexDirection: "row-reverse",
  },
  avatarSlot: {
    width: 28,
    alignItems: "center",
  },
  col: {
    maxWidth: "72%",
    alignItems: "flex-start",
  },
  colRight: {
    alignItems: "flex-end",
  },
  senderName: {
    fontSize: 10,
    fontWeight: "600",
    color: C.textMuted,
    marginBottom: 3,
    marginLeft: 4,
  },
  deletedBubble: {
    backgroundColor: C.surfaceAlt,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deletedText: {
    fontSize: 12,
    fontStyle: "italic",
    color: C.textMuted,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  bubbleMine: {
    backgroundColor: C.primary,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: C.surfaceAlt,
    borderBottomLeftRadius: 4,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  fileName: {
    fontSize: 12,
    fontWeight: "600",
  },
  fileSize: {
    fontSize: 10,
    color: C.textMuted,
  },
  bodyText: {
    fontSize: 13.5,
    color: C.textPrimary,
    lineHeight: 19,
  },
  bodyMine: {
    color: "#fff",
  },
  timeText: {
    fontSize: 9.5,
    color: C.textMuted,
    marginTop: 2,
  },
  timeRight: {
    textAlign: "right",
    color: "rgba(255,255,255,0.65)",
  },
});
