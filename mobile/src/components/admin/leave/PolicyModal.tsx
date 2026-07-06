// src/components/admin/leave/PolicyModal.tsx
// Create / Edit Leave Policy modal.

import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { ScrollText, X } from "lucide-react-native";
import C from "../../../styles/colors";
import { LEAVE_TYPE_UI } from "./leaveShared";
import MobileSelect from "../employee/MobileSelect";

const LEAVE_TYPE_OPTIONS = Object.keys(LEAVE_TYPE_UI).map((name) => ({
  label: name,
  value: name,
}));

export interface PolicyForm {
  name: string;
  leaveType: string;
  daysAllowed: number;
  carryOverDays: number;
  noticeDays: number;
  requiresApproval: boolean;
  isPaid: boolean;
  requiresDocument: boolean;
  minDaysPerRequest: number;
  maxDaysPerRequest: number;
  description: string;
}

const DEFAULT_FORM: PolicyForm = {
  name: "",
  leaveType: "Annual Leave",
  daysAllowed: 20,
  carryOverDays: 0,
  noticeDays: 0,
  requiresApproval: true,
  isPaid: true,
  requiresDocument: false,
  minDaysPerRequest: 1,
  maxDaysPerRequest: 15,
  description: "",
};

interface Props {
  visible: boolean;
  policy: any | null; // null = create mode
  saving?: boolean;
  onSave: (form: PolicyForm) => void;
  onClose: () => void;
}

export default function PolicyModal({
  visible,
  policy,
  saving,
  onSave,
  onClose,
}: Props) {
  const isNew = !policy;
  const [form, setForm] = useState<PolicyForm>(
    policy
      ? {
          name: policy.name ?? "",
          leaveType: policy.leave_type ?? "Annual Leave",
          daysAllowed: policy.days_allowed ?? 20,
          carryOverDays: policy.carry_over_days ?? 0,
          noticeDays: policy.notice_days ?? 0,
          requiresApproval: policy.requires_approval ?? true,
          isPaid: policy.is_paid ?? true,
          requiresDocument: policy.requires_document ?? false,
          minDaysPerRequest: policy.min_days_per_request ?? 1,
          maxDaysPerRequest: policy.max_days_per_request ?? 15,
          description: policy.description ?? "",
        }
      : DEFAULT_FORM,
  );

  const set = <K extends keyof PolicyForm>(k: K, v: PolicyForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const numField = (label: string, key: keyof PolicyForm, half = true) => (
    <View style={half ? s.half : s.full}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        value={String(form[key] ?? "")}
        onChangeText={(t) =>
          set(key, (Number(t.replace(/[^0-9]/g, "")) || 0) as any)
        }
        keyboardType="numeric"
        placeholderTextColor={C.textMuted}
        style={s.input}
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.header}>
            <View style={s.iconWrap}>
              <ScrollText size={16} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>
                {isNew ? "Create New Policy" : "Edit Policy"}
              </Text>
              <Text style={s.subtitle} numberOfLines={1}>
                {isNew ? "Define leave entitlements" : form.name}
              </Text>
            </View>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <X size={13} color={C.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            style={{ maxHeight: "72%" }}
            contentContainerStyle={s.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={s.full}>
              <Text style={s.label}>Policy Name</Text>
              <TextInput
                value={form.name}
                onChangeText={(t) => set("name", t)}
                placeholder="e.g. Annual Leave Policy"
                placeholderTextColor={C.textMuted}
                style={s.input}
              />
            </View>

            <View style={s.full}>
              <Text style={s.label}>Leave Type</Text>
              <MobileSelect
                value={form.leaveType}
                onChange={(v: string) => set("leaveType", v)}
                options={LEAVE_TYPE_OPTIONS}
                placeholder="Select leave type…"
              />
            </View>

            <View style={s.row}>
              {numField("Days Allowed", "daysAllowed")}
              {numField("Notice Days", "noticeDays")}
            </View>
            <View style={s.row}>
              {numField("Carry-Over Days", "carryOverDays")}
              {numField("Max Days / Request", "maxDaysPerRequest")}
            </View>

            {[
              { label: "Approval Required", key: "requiresApproval" as const },
              { label: "Paid Leave", key: "isPaid" as const },
              { label: "Document Required", key: "requiresDocument" as const },
            ].map((t) => (
              <View key={t.key} style={s.toggleRow}>
                <Text style={s.toggleLabel}>{t.label}</Text>
                <Switch
                  value={form[t.key] as boolean}
                  onValueChange={(v) => set(t.key, v as any)}
                  trackColor={{ false: C.border, true: C.primary }}
                  thumbColor="#fff"
                />
              </View>
            ))}

            <View style={s.full}>
              <Text style={s.label}>Description</Text>
              <TextInput
                value={form.description}
                onChangeText={(t) => set("description", t)}
                placeholder="Describe this leave policy…"
                placeholderTextColor={C.textMuted}
                multiline
                numberOfLines={3}
                style={[s.input, s.textarea]}
              />
            </View>
          </ScrollView>

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
              onPress={() => onSave(form)}
              disabled={saving}
              style={({ pressed }) => [
                s.saveBtn,
                (saving || pressed) && { opacity: 0.85 },
              ]}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.saveBtnText}>
                  {isNew ? "Create Policy" : "Save Changes"}
                </Text>
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
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    gap: 14,
    maxHeight: "92%",
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
  title: { fontSize: 15, fontWeight: "800", color: C.textPrimary },
  subtitle: { fontSize: 11, color: C.textMuted, marginTop: 2 },
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
  body: { gap: 14, paddingBottom: 8 },
  row: { flexDirection: "row", gap: 10 },
  half: { flex: 1, gap: 6 },
  full: { gap: 6 },
  label: { fontSize: 11, fontWeight: "700", color: C.textSecondary },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    fontSize: 13,
    color: C.textPrimary,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  textarea: { minHeight: 72, textAlignVertical: "top" },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  toggleLabel: { fontSize: 12, fontWeight: "600", color: C.textSecondary },
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
