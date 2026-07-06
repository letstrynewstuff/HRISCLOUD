


// src/components/documents/DocumentPreviewModal.tsx

import {
  Modal, View, Text, Pressable, StyleSheet, ScrollView, Linking,
} from "react-native";
import {
  X, MessageSquare, ExternalLink, CheckCircle2, Pen,
  FileText, FileType2, FileSpreadsheet, FileImage, File, LucideIcon,
} from "lucide-react-native";
import C from "../../styles/colors";
import DocStatusBadge from "./DocStatusBadge";
import { EmployeeDocument } from "../../types/document";

type Props = {
  doc: EmployeeDocument | null;
  onClose: () => void;
  onSign: (doc: EmployeeDocument) => void;
};

function getFileIcon(mimeType?: string | null): {
  Icon: LucideIcon; color: string; bg: string;
} {
  if (!mimeType) return { Icon: File, color: "#64748B", bg: "#F1F5F9" };
  if (mimeType.includes("pdf"))
    return { Icon: FileType2, color: "#DC2626", bg: "#FEF2F2" };
  if (mimeType.includes("word") || mimeType.includes("docx"))
    return { Icon: FileText, color: C.primary, bg: C.primaryLight };
  if (mimeType.includes("sheet") || mimeType.includes("excel"))
    return { Icon: FileSpreadsheet, color: "#16A34A", bg: "#F0FDF4" };
  if (mimeType.includes("image"))
    return { Icon: FileImage, color: "#0891B2", bg: "#ECFEFF" };
  return { Icon: File, color: "#64748B", bg: "#F1F5F9" };
}

function fmtDate(ds?: string | null) {
  if (!ds) return "—";
  return new Date(ds).toLocaleDateString("en-NG", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function DocumentPreviewModal({ doc, onClose, onSign }: Props) {
  if (!doc) return null;
  const cfg = getFileIcon(doc.mime_type);
  const docName = doc.document_name ?? doc.template_name ?? "Document";
  const isSent = doc.status === "sent";
  const isSigned = doc.status === "signed";

  const rows = [
    { label: "Category", value: doc.category ?? "—" },
    { label: "Sent By", value: doc.sent_by ?? "—" },
    { label: "Sent On", value: fmtDate(doc.sent_at ?? doc.created_at) },
    {
      label: "Signed At",
      value: doc.signed_at ? fmtDate(doc.signed_at) : isSent ? "Not yet signed" : "—",
    },
  ];

  return (
    <Modal visible={!!doc} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
              <cfg.Icon size={17} color={cfg.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle} numberOfLines={2}>{docName}</Text>
              <View style={{ marginTop: 4 }}>
                <DocStatusBadge status={doc.status} />
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <X size={15} color={C.textSecondary} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {rows.map((r) => (
                <View key={r.label} style={styles.gridCell}>
                  <Text style={styles.gridLabel}>{r.label}</Text>
                  <Text style={styles.gridValue}>{r.value}</Text>
                </View>
              ))}
            </View>

            {doc.message ? (
              <View style={styles.messageBox}>
                <MessageSquare size={13} color={C.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.messageLabel}>Message from HR</Text>
                  <Text style={styles.messageText}>{doc.message}</Text>
                </View>
              </View>
            ) : null}

            {doc.file_url ? (
              <Pressable
                onPress={() => Linking.openURL(doc.file_url!)}
                style={({ pressed }) => [styles.fileRow, pressed && { opacity: 0.85 }]}
              >
                <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
                  <cfg.Icon size={17} color={cfg.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {doc.file_name ?? "Open document"}
                  </Text>
                  <Text style={styles.fileSub}>
                    Tap to open · {doc.mime_type?.includes("pdf") ? "PDF" : "DOCX"}
                  </Text>
                </View>
                <ExternalLink size={14} color={C.textMuted} />
              </Pressable>
            ) : null}

            {!doc.file_url && doc.final_content ? (
              <View style={styles.contentBox}>
                <Text style={styles.contentLabel}>Document Content</Text>
                <ScrollView style={styles.contentScroll} nestedScrollEnabled>
                  <Text style={styles.contentText}>{doc.final_content}</Text>
                </ScrollView>
              </View>
            ) : null}

            {isSigned && (
              <View style={styles.signedBox}>
                <CheckCircle2 size={18} color="#16A34A" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.signedTitle}>You signed this document</Text>
                  <Text style={styles.signedSub}>
                    {fmtDate(doc.signed_at)} · Electronic signature recorded
                  </Text>
                </View>
              </View>
            )}
            <View style={{ height: 8 }} />
          </ScrollView>

          {isSent && (
            <Pressable
              onPress={() => onSign(doc)}
              style={({ pressed }) => [styles.signCta, pressed && { opacity: 0.88 }]}
            >
              <Pen size={15} color="#fff" />
              <Text style={styles.signCtaLabel}>Sign This Document</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 22, maxHeight: "88%",
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: "center", marginBottom: 14 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 16 },
  iconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 14.5, fontWeight: "700", color: C.textPrimary },
  closeBtn: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: C.surfaceAlt },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  gridCell: { width: "47%", backgroundColor: C.surfaceAlt, borderRadius: 14, padding: 11 },
  gridLabel: { fontSize: 9.5, color: C.textMuted, marginBottom: 3 },
  gridValue: { fontSize: 12.5, fontWeight: "700", color: C.textPrimary },
  messageBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: C.primaryLight, borderRadius: 14, padding: 12, marginBottom: 12,
  },
  messageLabel: { fontSize: 10, fontWeight: "700", color: C.primary, marginBottom: 2 },
  messageText: { fontSize: 12, color: C.primary, lineHeight: 17 },
  fileRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: C.surfaceAlt, borderRadius: 14, borderWidth: 1,
    borderColor: C.border, padding: 12, marginBottom: 12,
  },
  fileName: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  fileSub: { fontSize: 11, color: C.textMuted, marginTop: 1 },
  contentBox: { marginBottom: 12 },
  contentLabel: { fontSize: 11.5, fontWeight: "700", color: C.textSecondary, marginBottom: 8 },
  contentScroll: {
    maxHeight: 200, backgroundColor: C.surfaceAlt, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, padding: 12,
  },
  contentText: { fontSize: 12.5, color: C.textPrimary, lineHeight: 19 },
  signedBox: {
    flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#F0FDF4",
    borderWidth: 1, borderColor: "#BBF7D0", borderRadius: 14, padding: 13,
  },
  signedTitle: { fontSize: 13, fontWeight: "700", color: "#15803D" },
  signedSub: { fontSize: 11, color: "#16A34A", marginTop: 1 },
  signCta: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: C.primary, marginTop: 14,
  },
  signCtaLabel: { fontSize: 14, fontWeight: "700", color: "#fff" },
});