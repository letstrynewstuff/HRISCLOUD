// src/components/admin/reports/StatusUpdateModal.tsx

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
import { RefreshCw, X } from "lucide-react-native";
import C from "../../../styles/colors";
import {
  STATUS_OPTIONS,
  getStatusConfig,
} from "./reportShared";
import MobileSelect from "../employee/MobileSelect";

interface Props {
  visible: boolean;
  currentStatus?: string;
  saving?: boolean;
  onSave: (status: string, note: string) => void;
  onClose: () => void;
}

export default function StatusUpdateModal({
  visible,
  currentStatus,
  saving,
  onSave,
  onClose,
}: Props) {
  const [status, setStatus] = useState(currentStatus ?? "submitted");
  const [note, setNote] = useState("");
  const cfg = getStatusConfig(status);
  const isResolving = status === "resolved" || status === "dismissed";

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
            <View style={[s.iconWrap, { backgroundColor: cfg.light }]}>
              <RefreshCw size={16} color={cfg.color} />
            </View>
            <Text style={s.title}>Update Status</Text>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <X size={13} color={C.textSecondary} />
            </Pressable>
          </View>

          <Text style={s.label}>New Status</Text>
          <MobileSelect
            value={status}
            onChange={(v: string) => setStatus(v)}
            options={STATUS_OPTIONS}
            placeholder="Select status…"
          />

          <Text style={s.label}>
            {isResolving ? "Resolution Note (recommended)" : "Note (optional)"}
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={
              isResolving
                ? "Summarize the outcome and any action taken…"
                : "Add context for this status change…"
            }
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
              onPress={() => onSave(status, note)}
              disabled={saving}
              style={({ pressed }) => [
                s.saveBtn,
                { backgroundColor: cfg.color },
                (saving || pressed) && { opacity: 0.85 },
              ]}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.saveBtnText}>Save</Text>
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
    gap: 12,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 15, fontWeight: "800", color: C.textPrimary, flex: 1 },
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
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
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
  },
  saveBtnText: { fontSize: 13, fontWeight: "800", color: "#fff" },
});
