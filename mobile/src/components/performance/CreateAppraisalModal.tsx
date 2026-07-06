// src/components/performance/CreateAppraisalModal.tsx
// Manager-only modal to create or edit a draft appraisal for a team member.

import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  X,
  ChevronDown,
  Send,
  Check,
  AlertTriangle,
} from "lucide-react-native";
import C from "../../styles/colors";
import {
  createAppraisal,
  updateAppraisal,
} from "../../api/service/appraisal.api";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  department?: string | null;
};
type Template = { id: string; name: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  employees: Employee[];
  templates: Template[];
  editing?: Record<string, any> | null;
};

type Form = {
  employeeId: string;
  period: string;
  cycleName: string;
  templateId: string;
  managerFeedback: string;
};

const emptyForm = (editing?: Record<string, any> | null): Form => ({
  employeeId: editing?.employeeId ?? "",
  period: editing?.period ?? "",
  cycleName: editing?.cycleName ?? "",
  templateId: editing?.templateId ?? "",
  managerFeedback: editing?.managerFeedback ?? "",
});

export default function CreateAppraisalModal({
  open,
  onClose,
  onSaved,
  employees,
  templates,
  editing,
}: Props) {
  const [form, setForm] = useState<Form>(emptyForm(editing));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showEmpPicker, setShowEmpPicker] = useState(false);
  const [showTplPicker, setShowTplPicker] = useState(false);
  const [empSearch, setEmpSearch] = useState("");

  const isEdit = !!editing;

  useEffect(() => {
    if (open) {
      setForm(emptyForm(editing));
      setErrors({});
      setSaving(false);
      setShowEmpPicker(false);
      setShowTplPicker(false);
      setEmpSearch("");
    }
  }, [open, editing]);

  const set = (k: keyof Form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const selectedEmp = employees.find((e) => e.id === form.employeeId);
  const selectedTpl = templates.find((t) => t.id === form.templateId);

  const filteredEmps = employees.filter((e) => {
    const q = empSearch.toLowerCase();
    return (
      !q ||
      e.firstName.toLowerCase().includes(q) ||
      e.lastName.toLowerCase().includes(q) ||
      (e.department ?? "").toLowerCase().includes(q)
    );
  });

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.employeeId) errs.employeeId = "Select an employee";
    if (!form.period.trim()) errs.period = "Period is required (e.g. 2025-Q2)";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        period: form.period.trim(),
        cycleName: form.cycleName.trim() || undefined,
        templateId: form.templateId || undefined,
        managerFeedback: form.managerFeedback.trim() || undefined,
      };
      if (isEdit) {
        await updateAppraisal(editing!.id, payload);
      } else {
        await createAppraisal(form.employeeId, payload);
      }
      onSaved();
    } catch (err: any) {
      setErrors({
        _: err?.response?.data?.message ?? "Failed to save. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>
              {isEdit ? "Edit Appraisal" : "New Appraisal"}
            </Text>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <X size={15} color={C.textMuted} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 8, gap: 14 }}
          >
            {errors._ ? (
              <View style={styles.errorBanner}>
                <AlertTriangle size={13} color={C.danger} />
                <Text style={styles.errorBannerText}>{errors._}</Text>
              </View>
            ) : null}

            {/* Employee picker */}
            {!isEdit && (
              <View>
                <Text style={styles.fieldLabel}>Employee *</Text>
                <Pressable
                  onPress={() => {
                    setShowEmpPicker((p) => !p);
                    setShowTplPicker(false);
                  }}
                  style={[
                    styles.selectBox,
                    errors.employeeId && styles.inputError,
                  ]}
                >
                  <Text
                    style={[
                      styles.selectText,
                      { color: selectedEmp ? C.textPrimary : C.textMuted },
                    ]}
                    numberOfLines={1}
                  >
                    {selectedEmp
                      ? `${selectedEmp.firstName} ${selectedEmp.lastName}${selectedEmp.department ? ` · ${selectedEmp.department}` : ""}`
                      : "Select employee…"}
                  </Text>
                  <ChevronDown size={14} color={C.textMuted} />
                </Pressable>

                {showEmpPicker && (
                  <View style={styles.pickerList}>
                    <TextInput
                      value={empSearch}
                      onChangeText={setEmpSearch}
                      placeholder="Search employees…"
                      placeholderTextColor={C.textMuted}
                      style={styles.pickerSearch}
                    />
                    <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
                      {filteredEmps.map((e) => (
                        <Pressable
                          key={e.id}
                          onPress={() => {
                            set("employeeId", e.id);
                            setShowEmpPicker(false);
                            setEmpSearch("");
                          }}
                          style={({ pressed }) => [
                            styles.pickerItem,
                            pressed && { backgroundColor: C.surfaceAlt },
                          ]}
                        >
                          <Text style={styles.pickerItemText}>
                            {e.firstName} {e.lastName}
                          </Text>
                          {e.department ? (
                            <Text style={styles.pickerItemSub}>
                              {e.department}
                            </Text>
                          ) : null}
                        </Pressable>
                      ))}
                      {filteredEmps.length === 0 && (
                        <Text style={styles.pickerEmpty}>
                          No employees found
                        </Text>
                      )}
                    </ScrollView>
                  </View>
                )}
                {errors.employeeId ? (
                  <Text style={styles.errorText}>{errors.employeeId}</Text>
                ) : null}
              </View>
            )}

            {/* Period */}
            <View>
              <Text style={styles.fieldLabel}>Period * (e.g. 2025-Q2)</Text>
              <TextInput
                value={form.period}
                onChangeText={(v) => set("period", v)}
                placeholder="2025-Q2"
                placeholderTextColor={C.textMuted}
                style={[styles.input, errors.period && styles.inputError]}
              />
              {errors.period ? (
                <Text style={styles.errorText}>{errors.period}</Text>
              ) : null}
            </View>

            {/* Cycle name */}
            <View>
              <Text style={styles.fieldLabel}>Cycle Name (optional)</Text>
              <TextInput
                value={form.cycleName}
                onChangeText={(v) => set("cycleName", v)}
                placeholder="e.g. Annual Review 2025"
                placeholderTextColor={C.textMuted}
                style={styles.input}
              />
            </View>

            {/* Template picker */}
            {templates.length > 0 && (
              <View>
                <Text style={styles.fieldLabel}>Template (optional)</Text>
                <Pressable
                  onPress={() => {
                    setShowTplPicker((p) => !p);
                    setShowEmpPicker(false);
                  }}
                  style={styles.selectBox}
                >
                  <Text
                    style={[
                      styles.selectText,
                      { color: selectedTpl ? C.textPrimary : C.textMuted },
                    ]}
                    numberOfLines={1}
                  >
                    {selectedTpl?.name ?? "No template selected"}
                  </Text>
                  <ChevronDown size={14} color={C.textMuted} />
                </Pressable>
                {showTplPicker && (
                  <View style={styles.pickerList}>
                    <Pressable
                      onPress={() => {
                        set("templateId", "");
                        setShowTplPicker(false);
                      }}
                      style={({ pressed }) => [
                        styles.pickerItem,
                        pressed && { backgroundColor: C.surfaceAlt },
                      ]}
                    >
                      <Text
                        style={[styles.pickerItemText, { color: C.textMuted }]}
                      >
                        No template
                      </Text>
                    </Pressable>
                    {templates.map((t) => (
                      <Pressable
                        key={t.id}
                        onPress={() => {
                          set("templateId", t.id);
                          setShowTplPicker(false);
                        }}
                        style={({ pressed }) => [
                          styles.pickerItem,
                          pressed && { backgroundColor: C.surfaceAlt },
                        ]}
                      >
                        <View style={styles.pickerItemRow}>
                          {form.templateId === t.id && (
                            <Check size={11} color={C.primary} />
                          )}
                          <Text style={styles.pickerItemText}>{t.name}</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Manager feedback */}
            <View>
              <Text style={styles.fieldLabel}>Manager Feedback (optional)</Text>
              <TextInput
                value={form.managerFeedback}
                onChangeText={(v) => set("managerFeedback", v)}
                placeholder="Share your assessment of this employee's performance…"
                placeholderTextColor={C.textMuted}
                multiline
                numberOfLines={4}
                style={[styles.input, styles.textArea]}
              />
            </View>

            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={({ pressed }) => [
                styles.saveBtn,
                saving && { opacity: 0.7 },
                pressed && !saving && { opacity: 0.88 },
              ]}
            >
              <Send size={14} color="#fff" />
              <Text style={styles.saveBtnLabel}>
                {saving
                  ? isEdit
                    ? "Saving…"
                    : "Creating…"
                  : isEdit
                    ? "Save Changes"
                    : "Create Appraisal"}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    maxHeight: "92%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center",
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: { fontSize: 17, fontWeight: "700", color: C.textPrimary },
  closeBtn: { padding: 6, borderRadius: 10, backgroundColor: C.surfaceAlt },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.dangerLight,
    borderRadius: 12,
    padding: 11,
  },
  errorBannerText: { flex: 1, fontSize: 12, color: C.danger },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: C.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  input: {
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: C.textPrimary,
  },
  textArea: { minHeight: 90, textAlignVertical: "top" },
  inputError: { borderColor: C.danger },
  errorText: {
    fontSize: 11.5,
    color: C.danger,
    fontWeight: "600",
    marginTop: 4,
  },
  selectBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectText: { flex: 1, fontSize: 13.5 },
  pickerList: {
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    backgroundColor: C.surface,
  },
  pickerSearch: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: C.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  pickerItem: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  pickerItemRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  pickerItemText: { fontSize: 13, color: C.textPrimary },
  pickerItemSub: { fontSize: 10.5, color: C.textMuted, marginTop: 1 },
  pickerEmpty: {
    padding: 14,
    fontSize: 12.5,
    color: C.textMuted,
    textAlign: "center",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: C.primary,
    marginTop: 4,
  },
  saveBtnLabel: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
