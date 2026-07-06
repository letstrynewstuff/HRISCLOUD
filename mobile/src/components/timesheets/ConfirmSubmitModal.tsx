// src/components/timesheets/ConfirmSubmitModal.tsx
// Confirmation sheet shown before submitting one/many draft entries.

import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { Send, X } from "lucide-react-native";
import C from "../../styles/colors";

type ConfirmSubmitModalProps = {
  open: boolean;
  count: number;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
};

export default function ConfirmSubmitModal({
  open,
  count,
  onConfirm,
  onClose,
  loading,
}: ConfirmSubmitModalProps) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.headerRow}>
            <View style={styles.iconWrap}>
              <Send size={22} color={C.primary} />
            </View>
            <Pressable hitSlop={8} onPress={onClose} style={styles.closeBtn}>
              <X size={16} color={C.textMuted} />
            </Pressable>
          </View>

          <Text style={styles.title}>
            Submit {count} {count === 1 ? "entry" : "entries"}?
          </Text>
          <Text style={styles.body}>
            You're about to submit <Text style={styles.bold}>{count}</Text>{" "}
            {count === 1 ? "entry" : "entries"} for approval. You won't be able
            to edit {count === 1 ? "it" : "them"} after submitting. Continue?
          </Text>

          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.cancelBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.cancelLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              style={({ pressed }) => [
                styles.submitBtn,
                loading && styles.submitBtnDisabled,
                pressed && !loading && { opacity: 0.85 },
              ]}
            >
              <Send size={14} color="#fff" />
              <Text style={styles.submitLabel}>
                {loading ? "Submitting…" : "Submit for Approval"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  sheet: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 20,
    padding: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: C.textPrimary,
    marginBottom: 6,
  },
  body: {
    fontSize: 13.5,
    lineHeight: 19,
    color: C.textSecondary,
    marginBottom: 18,
  },
  bold: {
    fontWeight: "700",
    color: C.textPrimary,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: C.border,
  },
  cancelLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: C.textSecondary,
  },
  submitBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  submitBtnDisabled: {
    backgroundColor: "#C7D2FE",
  },
  submitLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#fff",
  },
});
