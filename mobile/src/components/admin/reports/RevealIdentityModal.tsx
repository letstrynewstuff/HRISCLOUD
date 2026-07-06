// src/components/admin/reports/RevealIdentityModal.tsx
// Restricted to super_admin — matches the backend's revealReporterIdentity
// guard exactly. Every reveal requires a written reason and is logged.

import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { ShieldAlert, X } from "lucide-react-native";
import C from "../../../styles/colors";

interface Props {
  visible: boolean;
  saving?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export default function RevealIdentityModal({
  visible,
  saving,
  onConfirm,
  onClose,
}: Props) {
  const [reason, setReason] = useState("");

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
            <View style={s.iconWrap}>
              <ShieldAlert size={18} color={C.danger} />
            </View>
            <Text style={s.title}>Reveal Reporter Identity</Text>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <X size={13} color={C.textSecondary} />
            </Pressable>
          </View>

          <View style={s.warningBanner}>
            <Text style={s.warningText}>
              This action is permanently logged and cannot be undone. Only do
              this for serious cases that genuinely require it.
            </Text>
          </View>

          <Text style={s.label}>Reason (required)</Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Explain why identity disclosure is necessary…"
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
              onPress={() => onConfirm(reason.trim())}
              disabled={saving || !reason.trim()}
              style={({ pressed }) => [
                s.confirmBtn,
                (saving || pressed || !reason.trim()) && { opacity: 0.7 },
              ]}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.confirmBtnText}>Reveal Identity</Text>
              )}
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
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.dangerLight,
  },
  title: { fontSize: 14, fontWeight: "800", color: C.textPrimary, flex: 1 },
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
  warningBanner: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.dangerLight,
    borderWidth: 1,
    borderColor: C.danger + "33",
  },
  warningText: {
    fontSize: 11,
    lineHeight: 16,
    color: C.danger,
    fontWeight: "600",
  },
  label: { fontSize: 11, fontWeight: "700", color: C.textSecondary },
  textarea: {
    minHeight: 80,
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
    backgroundColor: C.danger,
  },
  confirmBtnText: { fontSize: 13, fontWeight: "800", color: "#fff" },
});
