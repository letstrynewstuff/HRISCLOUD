// src/components/admin/department/AddDepartmentForm.tsx
// Create / edit a department — mirrors AddEmployeeForm.tsx patterns
// (header, KeyboardAvoidingView, MobileFormField, success modal).

import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Check,
  X,
  AlertCircle,
  Building2,
  CheckCircle2,
} from "lucide-react-native";

import C from "../../../styles/colors";
import { departmentApi } from "../../../api/service/departmentApi";
import MobileFormField from "../employee/MobileFormField";
import MobileSelect from "../employee/MobileSelect";
import EmployeeSearchSelect from "./EmployeeSearchSelect";
import { PALETTE, EMPTY_DEPT_FORM, DeptEmptyForm } from "../../../hooks/deptHelpers";

interface Props {
  mode: "create" | "edit";
  department?: any | null;
  departments: any[];
  employees: any[];
  onClose: () => void;
  onSuccess: (dept: any) => void;
}

export default function AddDepartmentForm({
  mode,
  department,
  departments,
  employees,
  onClose,
  onSuccess,
}: Props) {
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState<DeptEmptyForm>(EMPTY_DEPT_FORM);
  const [paletteIdx, setPaletteIdx] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    if (mode === "edit" && department) {
      setForm({
        name: department.name ?? "",
        description: department.description ?? "",
        head_id: department.head_id ?? "",
        parent_department_id: department.parent_department_id ?? "",
      });
      const idx = departments.findIndex((d) => d.id === department.id);
      setPaletteIdx(idx >= 0 ? idx % PALETTE.length : 0);
    } else {
      setForm(EMPTY_DEPT_FORM);
      setPaletteIdx(0);
    }
  }, [mode, department]);

  const set = (k: keyof DeptEmptyForm, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Department name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const parentOptions = departments
    .filter((d) => !department || d.id !== department.id)
    .map((d) => ({ label: d.name, value: d.id }));

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setApiError(null);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      head_id: form.head_id || null,
      parent_department_id: form.parent_department_id || null,
    };
    try {
      let result;
      if (mode === "create") {
        result = await departmentApi.create(payload);
      } else {
        result = await departmentApi.update(department.id, payload);
      }
      setSuccessModal(true);
      setTimeout(() => {
        setSuccessModal(false);
        onSuccess(result?.department ?? result);
      }, 1200);
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save department. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[s.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={s.header}>
        <Pressable onPress={onClose} style={s.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>
            {mode === "create"
              ? "New Department"
              : `Edit — ${department?.name ?? ""}`}
          </Text>
          <Text style={s.headerSubtitle}>
            {mode === "create"
              ? "Add a new organisational unit"
              : "Update department details"}
          </Text>
        </View>
        <View style={s.headerIconWrap}>
          <Building2 size={16} color={C.primary} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {apiError && (
          <View style={s.errorBanner}>
            <AlertCircle size={16} color={C.danger} />
            <Text style={s.errorBannerText}>{apiError}</Text>
            <Pressable onPress={() => setApiError(null)}>
              <X size={14} color={C.danger} />
            </Pressable>
          </View>
        )}

        <View style={s.stepContent}>
          <MobileFormField label="Accent Colour">
            <View style={s.paletteRow}>
              {PALETTE.map((p, i) => (
                <Pressable
                  key={i}
                  onPress={() => setPaletteIdx(i)}
                  style={[
                    s.paletteDot,
                    { backgroundColor: p.color },
                    paletteIdx === i && s.paletteDotActive,
                  ]}
                >
                  {paletteIdx === i && <Check size={13} color="#fff" />}
                </Pressable>
              ))}
            </View>
          </MobileFormField>

          <MobileFormField label="Department Name" required error={errors.name}>
            <TextInput
              value={form.name}
              onChangeText={(t) => set("name", t)}
              placeholder="e.g. Engineering"
              placeholderTextColor={C.textMuted}
              style={[s.input, errors.name && s.inputError]}
            />
          </MobileFormField>

          <MobileFormField label="Description">
            <TextInput
              value={form.description}
              onChangeText={(t) => set("description", t)}
              placeholder="Briefly describe what this department does…"
              placeholderTextColor={C.textMuted}
              multiline
              numberOfLines={3}
              style={[s.input, s.textarea]}
            />
          </MobileFormField>

          <EmployeeSearchSelect
            label="Department Head"
            value={form.head_id}
            onChange={(v) => set("head_id", v)}
            employees={employees}
            placeholder="Search and select head employee…"
            error={errors.head_id}
          />

          <MobileFormField label="Parent Department">
            <MobileSelect
              value={form.parent_department_id}
              onChange={(v) => set("parent_department_id", v)}
              options={[
                { label: "None (top-level)", value: "" },
                ...parentOptions,
              ]}
              placeholder="Select parent department…"
            />
          </MobileFormField>
        </View>

        <View style={s.navRow}>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [s.cancelBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={s.cancelBtnText}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            disabled={saving}
            style={({ pressed }) => [
              s.submitBtn,
              (saving || pressed) && { opacity: saving ? 0.7 : 0.85 },
            ]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Building2 size={15} color="#fff" />
                <Text style={s.submitBtnText}>
                  {mode === "create" ? "Create Department" : "Save Changes"}
                </Text>
              </>
            )}
          </Pressable>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>

      <Modal
        visible={successModal}
        animationType="fade"
        transparent
        statusBarTranslucent
      >
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalIconWrap}>
              <CheckCircle2 size={32} color="#fff" />
            </View>
            <Text style={s.modalTitle}>
              {mode === "create"
                ? "Department Created!"
                : "Department Updated!"}
            </Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.bg,
  },
  headerBack: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  headerTitle: { fontSize: 17, fontWeight: "800", color: C.textPrimary },
  headerSubtitle: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  headerIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.dangerLight,
    borderWidth: 1,
    borderColor: C.danger + "33",
    marginTop: 12,
    marginBottom: 4,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: C.danger,
  },

  stepContent: { gap: 14, marginTop: 12 },

  paletteRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  paletteDot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  paletteDotActive: {
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  input: {
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    fontSize: 14,
    color: C.textPrimary,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  inputError: { borderColor: C.danger },
  textarea: { height: 84, textAlignVertical: "top" },

  navRow: { flexDirection: "row", gap: 12, marginTop: 22 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  cancelBtnText: { fontSize: 14, fontWeight: "700", color: C.textSecondary },
  submitBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
  },
  submitBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalSheet: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 24,
    backgroundColor: C.surface,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.success,
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.textPrimary,
    textAlign: "center",
  },
});
