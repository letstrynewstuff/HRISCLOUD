import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { RotateCcw, X, AlertTriangle } from "lucide-react-native";
import C from "../../../styles/colors";
import { CONDITION_OPTIONS } from "./AssetMeta";
import { assetApi } from "../../../api/service/assetApi";

type Props = {
  visible: boolean;
  asset: any;
  onClose: () => void;
  onReturned: () => void;
};

export default function ReturnAssetModal({
  visible,
  asset,
  onClose,
  onReturned,
}: Props) {
  const [form, setForm] = useState({ condition: "good", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleReturn = async () => {
    setSaving(true);
    setError("");
    try {
      await assetApi.returnAsset(asset.id, form);
      onReturned();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to record return.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIcon, { backgroundColor: "#FEF3C7" }]}>
                <RotateCcw size={14} color="#B45309" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Return Asset</Text>
                <Text style={styles.headerSubtitle}>
                  {asset?.name} · currently with{" "}
                  {asset?.assignedTo?.name ?? "employee"}
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={15} color={C.textMuted} />
            </Pressable>
          </View>

          <View style={styles.body}>
            {error ? (
              <View style={styles.errorBanner}>
                <AlertTriangle size={14} color={C.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.hint}>
              Recording a "damaged" return sends the asset to under repair;
              "lost" retires it as lost. A "good" or "fair" return makes it
              available again.
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Condition on Return *</Text>
              <View style={styles.chipRow}>
                {CONDITION_OPTIONS.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setForm((p) => ({ ...p, condition: c }))}
                    style={[
                      styles.chip,
                      form.condition === c && styles.chipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        form.condition === c && styles.chipTextActive,
                      ]}
                    >
                      {c[0].toUpperCase() + c.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                value={form.notes}
                onChangeText={(t) => setForm((p) => ({ ...p, notes: t }))}
                placeholder="Optional"
                placeholderTextColor={C.textMuted}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                style={[styles.input, { minHeight: 60 }]}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleReturn}
              disabled={saving}
              style={({ pressed }) => [
                styles.saveBtn,
                pressed && { opacity: 0.9 },
                saving && { opacity: 0.7 },
              ]}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <RotateCcw size={14} color="#fff" />
                  <Text style={styles.saveText}>Mark Returned</Text>
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
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.55)",
  },
  sheet: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
  },
  body: {
    padding: 16,
    gap: 14,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: C.dangerLight,
  },
  errorText: {
    fontSize: 12,
    color: C.danger,
    flex: 1,
  },
  hint: {
    fontSize: 11.5,
    color: C.textSecondary,
    lineHeight: 17,
  },
  field: {
    gap: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: C.textPrimary,
  },
  input: {
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13,
    color: C.textPrimary,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "500",
    color: C.textSecondary,
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "700",
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
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textSecondary,
  },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#B45309",
  },
  saveText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
});
