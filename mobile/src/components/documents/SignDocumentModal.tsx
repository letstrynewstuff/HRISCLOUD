


// src/components/documents/SignDocumentModal.tsx
// Wired to documentApi.sign() — no mock timeouts.

import { useEffect, useState } from "react";
import {
  Modal, View, Text, Pressable, StyleSheet, ScrollView, Linking,
} from "react-native";
import {
  X, FileText, MessageSquare, Info, AlertTriangle,
  Pen, Check, ExternalLink, Download,
} from "lucide-react-native";
import C from "../../styles/colors";
import { EmployeeDocument } from "../../types/document";
import { documentApi } from "../../api/service/documentApi";

type Props = {
  doc: EmployeeDocument | null;
  onClose: () => void;
  onSigned: (id: string) => void;
};

export default function SignDocumentModal({ doc, onClose, onSigned }: Props) {
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (doc) {
      setAgreed(false);
      setSigning(false);
      setError("");
    }
  }, [doc]);

  if (!doc) return null;

  const docName = doc.document_name ?? doc.template_name ?? "Document";

  async function handleSign() {
    if (!agreed) {
      setError("Please confirm you have read the document first.");
      return;
    }
    setSigning(true);
    setError("");
    try {
      await documentApi.sign(doc.id);
      onSigned(doc.id);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? "Failed to sign document. Please try again."
      );
    } finally {
      setSigning(false);
    }
  }

  return (
    <Modal visible={!!doc} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconWrap}>
                <Pen size={15} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>Sign Document</Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>{docName}</Text>
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <X size={14} color={C.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {error ? (
              <View style={styles.errorBox}>
                <AlertTriangle size={13} color={C.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.summaryBox}>
              <View style={styles.summaryIconWrap}>
                <FileText size={15} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryTitle} numberOfLines={1}>{docName}</Text>
                <Text style={styles.summarySub}>
                  {doc.category ?? "—"} · From {doc.sent_by ?? "HR"}
                </Text>
                {doc.message ? (
                  <View style={styles.messageBox}>
                    <MessageSquare size={11} color={C.primary} />
                    <Text style={styles.messageText}>{doc.message}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {doc.file_url ? (
              <Pressable
                onPress={() => Linking.openURL(doc.file_url!)}
                style={({ pressed }) => [styles.fileRow, pressed && { opacity: 0.85 }]}
              >
                <Download size={14} color={C.primary} />
                <Text style={styles.fileRowLabel} numberOfLines={1}>
                  {doc.file_name ?? "Download document"}
                </Text>
                <ExternalLink size={12} color={C.textMuted} />
              </Pressable>
            ) : null}

            {!doc.file_url && doc.final_content ? (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.previewLabel}>Document Preview</Text>
                <ScrollView style={styles.previewScroll} nestedScrollEnabled>
                  <Text style={styles.previewText}>{doc.final_content}</Text>
                </ScrollView>
              </View>
            ) : null}

            <View style={styles.noticeBox}>
              <Info size={13} color="#D97706" />
              <Text style={styles.noticeText}>
                Your electronic signature is legally binding. By signing you
                confirm you have read and understood this document.
              </Text>
            </View>

            <Pressable onPress={() => setAgreed((p) => !p)} style={styles.consentRow}>
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Check size={12} color="#fff" strokeWidth={3} />}
              </View>
              <Text style={styles.consentText}>
                I have read and understood the contents of this document and
                agree to sign electronically.
              </Text>
            </Pressable>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.cancelLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSign}
              disabled={!agreed || signing}
              style={({ pressed }) => [
                styles.signBtn,
                (!agreed || signing) && { opacity: 0.55 },
                pressed && agreed && !signing && { opacity: 0.88 },
              ]}
            >
              {signing ? (
                <Text style={styles.signLabel}>Signing…</Text>
              ) : (
                <>
                  <Pen size={13} color="#fff" />
                  <Text style={styles.signLabel}>Sign Document</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.6)", alignItems: "center", justifyContent: "center", padding: 16 },
  sheet: { width: "100%", maxWidth: 420, maxHeight: "86%", borderRadius: 22, backgroundColor: C.surface, overflow: "hidden", padding: 18 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  iconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: C.primaryLight },
  headerTitle: { fontSize: 14.5, fontWeight: "700", color: C.textPrimary },
  headerSubtitle: { fontSize: 10.5, color: C.textMuted, marginTop: 1 },
  closeBtn: { width: 28, height: 28, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: C.surfaceAlt },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.dangerLight, borderRadius: 12, padding: 11, marginBottom: 12 },
  errorText: { flex: 1, fontSize: 12, color: C.danger },
  summaryBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 13, marginBottom: 12 },
  summaryIconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: C.primaryLight },
  summaryTitle: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  summarySub: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  messageBox: { flexDirection: "row", alignItems: "flex-start", gap: 6, backgroundColor: C.primaryLight, borderRadius: 10, padding: 8, marginTop: 8 },
  messageText: { flex: 1, fontSize: 10.5, color: C.primary, lineHeight: 15 },
  fileRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 12, marginBottom: 12 },
  fileRowLabel: { flex: 1, fontSize: 12, fontWeight: "600", color: C.textPrimary },
  previewLabel: { fontSize: 11.5, fontWeight: "700", color: C.textSecondary, marginBottom: 6 },
  previewScroll: { maxHeight: 140, backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 10 },
  previewText: { fontSize: 12, color: C.textPrimary, lineHeight: 17 },
  noticeBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FCD34D44", borderRadius: 12, padding: 11, marginBottom: 14 },
  noticeText: { flex: 1, fontSize: 10.5, color: "#92400E", lineHeight: 15 },
  consentRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 4 },
  checkbox: { width: 19, height: 19, borderRadius: 6, borderWidth: 1.5, borderColor: C.border, alignItems: "center", justifyContent: "center", marginTop: 1 },
  checkboxChecked: { backgroundColor: C.primary, borderColor: C.primary },
  consentText: { flex: 1, fontSize: 11.5, color: C.textSecondary, lineHeight: 16 },
  footer: { flexDirection: "row", gap: 10, marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.border },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: "center", backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.border },
  cancelLabel: { fontSize: 13, fontWeight: "700", color: C.textSecondary },
  signBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 12, borderRadius: 14, backgroundColor: C.primary },
  signLabel: { fontSize: 13, fontWeight: "700", color: "#fff" },
});