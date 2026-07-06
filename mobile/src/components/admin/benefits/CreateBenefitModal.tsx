// src/components/admin/benefits/CreateBenefitModal.tsx

import { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Switch,
} from "react-native";
import { Heart, X, Plus, AlertTriangle } from "lucide-react-native";
import C from "../../../styles/colors";
import { benefitsApi } from "../../../api/service/benefitsApi";
import { BENEFIT_TYPE_CONFIG } from "./benefitsShared";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: (benefit: any) => void;
}

export default function CreateBenefitModal({
  visible,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    type: "allowance",
    provider: "",
    description: "",
    isInsurance: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const reset = () => {
    setForm({
      name: "",
      type: "allowance",
      provider: "",
      description: "",
      isInsurance: false,
    });
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Benefit name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await benefitsApi.create(form);
      onSaved(res.data ?? res);
      reset();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to create benefit.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[styles.iconWrap, { backgroundColor: C.dangerLight }]}
              >
                <Heart size={15} color={C.danger} />
              </View>
              <Text style={styles.headerTitle}>Create Benefit</Text>
            </View>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <X size={14} color={C.textMuted} />
            </Pressable>
          </View>

          <ScrollView
            style={{ maxHeight: 460 }}
            contentContainerStyle={styles.body}
          >
            {error ? (
              <View style={styles.errorBox}>
                <AlertTriangle size={13} color={C.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Benefit Name *</Text>
            <TextInput
              value={form.name}
              onChangeText={(v) => set("name", v)}
              placeholder="e.g. Monthly Transport Allowance"
              placeholderTextColor={C.textMuted}
              style={styles.input}
            />

            <Text style={styles.label}>Provider (optional)</Text>
            <TextInput
              value={form.provider}
              onChangeText={(v) => set("provider", v)}
              placeholder="e.g. AXA Mansard, GTBank"
              placeholderTextColor={C.textMuted}
              style={styles.input}
            />

            <Text style={styles.label}>Type</Text>
            <View style={styles.typeGrid}>
              {Object.entries(BENEFIT_TYPE_CONFIG).map(([key, cfg]) => {
                const active = form.type === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => set("type", key)}
                    style={[
                      styles.typeChip,
                      {
                        backgroundColor: active ? cfg.bg : C.surfaceAlt,
                        borderColor: active ? cfg.color : C.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        { color: active ? cfg.color : C.textSecondary },
                      ]}
                    >
                      {cfg.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput
              value={form.description}
              onChangeText={(v) => set("description", v)}
              placeholder="Describe this benefit…"
              placeholderTextColor={C.textMuted}
              style={[styles.input, styles.textarea]}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>
                This is an insurance benefit
              </Text>
              <Switch
                value={form.isInsurance}
                onValueChange={(v) => set("isInsurance", v)}
                trackColor={{ true: C.primary, false: C.border }}
                thumbColor="#fff"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable onPress={handleClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={saving}
              style={styles.saveBtn}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Plus size={14} color="#fff" />
                  <Text style={styles.saveBtnText}>Create Benefit</Text>
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
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15,23,42,0.55)",
  },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 14, fontWeight: "800", color: C.textPrimary },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
  },

  body: { padding: 18 },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.dangerLight,
    marginBottom: 14,
  },
  errorText: { fontSize: 12, color: C.danger, flex: 1 },

  label: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textPrimary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 14,
    color: C.textPrimary,
    backgroundColor: C.surfaceAlt,
  },
  textarea: { minHeight: 90 },

  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  typeChipText: { fontSize: 12, fontWeight: "700" },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  switchLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: C.textSecondary,
    flex: 1,
  },

  footer: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: { fontSize: 13, fontWeight: "700", color: C.textSecondary },
  saveBtn: {
    flex: 1.3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  saveBtnText: { fontSize: 13, fontWeight: "800", color: "#fff" },
});
