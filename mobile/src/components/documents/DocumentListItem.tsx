


// src/components/documents/DocumentListItem.tsx

import { View, Text, Pressable, StyleSheet } from "react-native";
import {
  FileText, FileType2, FileSpreadsheet, FileImage, File,
  Pen, Lock, LucideIcon,
} from "lucide-react-native";
import C from "../../styles/colors";
import DocStatusBadge from "./DocStatusBadge";
import { EmployeeDocument } from "../../types/document";

type Props = {
  doc: EmployeeDocument;
  onPress: (doc: EmployeeDocument) => void;
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

export default function DocumentListItem({ doc, onPress, onSign }: Props) {
  const cfg = getFileIcon(doc.mime_type);
  const docName = doc.document_name ?? doc.template_name ?? "Document";
  const isSent = doc.status === "sent";
  const isSigned = doc.status === "signed";

  return (
    <Pressable
      onPress={() => onPress(doc)}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
        <cfg.Icon size={17} color={cfg.color} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{docName}</Text>
          {isSent && (
            <View style={styles.actionFlag}>
              <Text style={styles.actionFlagText}>ACTION REQUIRED</Text>
            </View>
          )}
        </View>
        <Text style={styles.subtitle} numberOfLines={1}>
          {doc.category ?? "Document"}
          {doc.sent_by ? ` · From ${doc.sent_by}` : ""} ·{" "}
          {fmtDate(doc.sent_at ?? doc.created_at)}
        </Text>
        <View style={styles.bottomRow}>
          <DocStatusBadge status={doc.status} />
          {isSent && (
            <Pressable
              onPress={() => onSign(doc)}
              style={({ pressed }) => [styles.signBtn, pressed && { opacity: 0.85 }]}
            >
              <Pen size={10} color="#fff" />
              <Text style={styles.signBtnLabel}>Sign</Text>
            </Pressable>
          )}
          {isSigned && (
            <View style={styles.signedFlag}>
              <Lock size={10} color="#16A34A" />
              <Text style={styles.signedFlagText}>Signed</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", gap: 12, padding: 13, borderRadius: 16,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
  },
  iconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  title: { fontSize: 13, fontWeight: "700", color: C.textPrimary, flexShrink: 1 },
  actionFlag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, backgroundColor: C.dangerLight },
  actionFlagText: { fontSize: 8, fontWeight: "800", color: C.danger },
  subtitle: { fontSize: 11, color: C.textMuted, marginBottom: 8 },
  bottomRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  signBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, backgroundColor: C.primary,
  },
  signBtnLabel: { fontSize: 10, fontWeight: "700", color: "#fff" },
  signedFlag: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: "#F0FDF4",
  },
  signedFlagText: { fontSize: 10, fontWeight: "700", color: "#15803D" },
});