// src/components/admin/reports/AddNoteModal.tsx

import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MessageSquarePlus, X } from "lucide-react-native";
import C from "../../../styles/colors";

interface Props {
  visible: boolean;
  saving?: boolean;
  onSave: (note: string, visibleToReporter: boolean) => void;
  onClose: () => void;
}

export default function AddNoteModal({
  visible,
  saving,
  onSave,
  onClose,
}: Props) {
  const [note, setNote] = useState("");
  const [visibleToReporter, setVisibleToReporter] = useState(false);

  const handleSave = () => {
    if (!note.trim()) return;
    onSave(note.trim(), visibleToReporter);
    setNote("");
    setVisibleToReporter(false);
  };

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
              <MessageSquarePlus size={16} color={C.primary} />
            </View>
            <Text style={s.title}>Add Investigation Note</Text>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <X size={13} color={C.textSecondary} />
            </Pressable>
          </View>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Log findings, actions taken, or next steps…"
            placeholderTextColor={C.textMuted}
            multiline
            numberOfLines={4}
            style={s.textarea}
          />

          <View style={s.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.toggleLabel}>Visible to reporter</Text>
              <Text style={s.toggleSub}>
                The employee will see this note on their report timeline
              </Text>
            </View>
            <Switch
              value={visibleToReporter}
              onValueChange={setVisibleToReporter}
              trackColor={{ false: C.border, true: C.primary }}
              thumbColor="#fff"
            />
          </View>

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
              onPress={handleSave}
              disabled={saving || !note.trim()}
              style={({ pressed }) => [
                s.saveBtn,
                (saving || pressed || !note.trim()) && { opacity: 0.7 },
              ]}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.saveBtnText}>Add Note</Text>
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
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
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
  textarea: {
    minHeight: 100,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surfaceAlt,
    padding: 12,
    fontSize: 13,
    color: C.textPrimary,
    textAlignVertical: "top",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  toggleLabel: { fontSize: 12, fontWeight: "700", color: C.textPrimary },
  toggleSub: { fontSize: 10, color: C.textMuted, marginTop: 2, lineHeight: 14 },
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
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
  },
  saveBtnText: { fontSize: 13, fontWeight: "800", color: "#fff" },
});
