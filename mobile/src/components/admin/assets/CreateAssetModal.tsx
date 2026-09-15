import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Plus, X, AlertTriangle } from "lucide-react-native";
import C from "../../../styles/colors";
import { CATEGORY_CONFIG, CONDITION_OPTIONS } from "./AssetMeta";
import { assetApi } from "../../../api/service/assetApi";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSaved: (asset: any) => void;
};

export default function CreateAssetModal({ visible, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: "",
    category: "laptop",
    brand: "",
    model: "",
    serialNumber: "",
    condition: "good",
    purchaseDate: "",
    purchaseCost: "",
    location: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Asset name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await assetApi.create({
        ...form,
        purchaseCost: form.purchaseCost ? Number(form.purchaseCost) : null,
      });
      onSaved(res.data ?? res);
      setForm({
        name: "",
        category: "laptop",
        brand: "",
        model: "",
        serialNumber: "",
        condition: "good",
        purchaseDate: "",
        purchaseCost: "",
        location: "",
      });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to create asset.");
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
              <View
                style={[styles.headerIcon, { backgroundColor: C.primaryLight }]}
              >
                <Plus size={14} color={C.primary} />
              </View>
              <Text style={styles.headerTitle}>Add Asset</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={15} color={C.textMuted} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {error ? (
              <View style={styles.errorBanner}>
                <AlertTriangle size={14} color={C.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>Asset Name *</Text>
              <TextInput
                value={form.name}
                onChangeText={(t) => set("name", t)}
                placeholder='e.g. MacBook Pro 14"'
                placeholderTextColor={C.textMuted}
                style={styles.input}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.chipRow}>
                  {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                    <Pressable
                      key={k}
                      onPress={() => set("category", k)}
                      style={[
                        styles.chip,
                        form.category === k && {
                          backgroundColor: v.bg,
                          borderColor: v.color + "55",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          form.category === k && {
                            color: v.color,
                            fontWeight: "700",
                          },
                        ]}
                      >
                        {v.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Condition</Text>
                <View style={styles.chipRow}>
                  {CONDITION_OPTIONS.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => set("condition", c)}
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
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Brand</Text>
                <TextInput
                  value={form.brand}
                  onChangeText={(t) => set("brand", t)}
                  placeholder="e.g. Apple"
                  placeholderTextColor={C.textMuted}
                  style={styles.input}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Model</Text>
                <TextInput
                  value={form.model}
                  onChangeText={(t) => set("model", t)}
                  placeholder="e.g. M3 Pro"
                  placeholderTextColor={C.textMuted}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Serial Number</Text>
              <TextInput
                value={form.serialNumber}
                onChangeText={(t) => set("serialNumber", t)}
                placeholder="Optional"
                placeholderTextColor={C.textMuted}
                style={styles.input}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Purchase Date</Text>
                <TextInput
                  value={form.purchaseDate}
                  onChangeText={(t) => set("purchaseDate", t)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={C.textMuted}
                  style={styles.input}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Purchase Cost</Text>
                <TextInput
                  value={form.purchaseCost}
                  onChangeText={(t) => set("purchaseCost", t)}
                  placeholder="₦0.00"
                  placeholderTextColor={C.textMuted}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                value={form.location}
                onChangeText={(t) => set("location", t)}
                placeholder="e.g. Lagos HQ — IT Storage"
                placeholderTextColor={C.textMuted}
                style={styles.input}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
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
                  <Plus size={14} color="#fff" />
                  <Text style={styles.saveText}>Add Asset</Text>
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
    maxHeight: "85%",
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
  row: {
    flexDirection: "row",
    gap: 10,
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
    backgroundColor: C.primary,
  },
  saveText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
});
