// src/components/admin/documents/DocumentCard.tsx

import { View, Text, StyleSheet, Pressable, Linking } from "react-native";
import { FileText, Download } from "lucide-react-native";
import C from "../../../styles/colors";
import { DocStatusBadge, fmtDate } from "./documentsShared";

interface Props {
  doc: any;
}

export default function DocumentCard({ doc }: Props) {
  const isSigned = doc.status?.toLowerCase() === "signed";
  const isAwaiting = ["sent", "pending"].includes(doc.status?.toLowerCase());

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.iconWrap}>
          <FileText size={16} color={C.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {doc.template_name ?? "Untitled Document"}
          </Text>
          <Text style={styles.employee} numberOfLines={1}>
            {doc.employee_name ?? "—"}
          </Text>
        </View>
        <DocStatusBadge status={doc.status} />
      </View>

      {doc.message ? (
        <Text style={styles.message} numberOfLines={2}>
          "{doc.message}"
        </Text>
      ) : null}

      <View style={styles.metaRow}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{doc.category ?? "—"}</Text>
        </View>
        <Text style={styles.dateText}>
          {fmtDate(doc.sent_at ?? doc.created_at)}
        </Text>
      </View>

      <View style={styles.footer}>
        {isSigned && doc.signed_at && (
          <Text style={styles.signedText}>Signed {fmtDate(doc.signed_at)}</Text>
        )}
        {isAwaiting && (
          <Text style={styles.awaitingText}>Waiting for employee…</Text>
        )}
        {doc.file_url ? (
          <Pressable
            onPress={() => Linking.openURL(doc.file_url)}
            style={styles.fileLink}
          >
            <Download size={11} color={C.primary} />
            <Text style={styles.fileLinkText}>View file</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 8,
    marginBottom: 10,
  },
  top: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  name: { fontSize: 13, fontWeight: "800", color: C.textPrimary },
  employee: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  message: {
    fontSize: 11,
    fontStyle: "italic",
    color: C.textMuted,
    lineHeight: 16,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    backgroundColor: C.primaryLight,
  },
  categoryText: { fontSize: 10, fontWeight: "700", color: C.primary },
  dateText: { fontSize: 11, color: C.textMuted },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  signedText: { fontSize: 10, fontWeight: "700", color: C.success },
  awaitingText: { fontSize: 10, fontWeight: "700", color: C.warning },
  fileLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
  },
  fileLinkText: { fontSize: 10, fontWeight: "700", color: C.primary },
});
