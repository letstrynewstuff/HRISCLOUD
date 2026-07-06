// src/components/profile/PersonalTab.tsx
// Personal information + Next of Kin. Includes a "Request Change" bottom
// sheet for editable fields — calls requestProfileChange() on submit.

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  Edit3,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  User,
  UserCheck,
} from "lucide-react-native";
import C from "../../styles/colors";
import InfoRow from "./InfoRow";
import { requestProfileChange } from "../../api/service/employeeApi";

type PersonalTabProps = {
  emp: Record<string, any>;
};

const EDITABLE = [
  { key: "phone", label: "Phone Number" },
  { key: "personalEmail", label: "Personal Email" },
  { key: "address", label: "Residential Address" },
  { key: "nokName", label: "Next of Kin Name" },
  { key: "nokRelationship", label: "NOK Relationship" },
  { key: "nokPhone", label: "NOK Phone" },
];

export default function PersonalTab({ emp }: PersonalTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    try {
      await requestProfileChange(form);
      setSaved(true);
      setModalOpen(false);
      setTimeout(() => setSaved(false), 3500);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ?? "Failed to submit change request.",
      );
    } finally {
      setSaving(false);
    }
  }

  const fmtDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-NG") : null;

  const PERSONAL_ROWS = [
    { label: "First Name", value: emp.first_name },
    { label: "Last Name", value: emp.last_name },
    { label: "Date of Birth", value: fmtDate(emp.date_of_birth) },
    { label: "Gender", value: emp.gender },
    { label: "Nationality", value: emp.nationality },
    { label: "Marital Status", value: emp.marital_status },
    { label: "Personal Email", value: emp.personal_email },
    { label: "Phone", value: emp.phone },
    { label: "Address", value: emp.address },
  ];

  const NOK_ROWS = [
    { label: "Name", value: emp.nok_name },
    { label: "Relationship", value: emp.nok_relationship },
    { label: "Phone", value: emp.nok_phone },
    { label: "Address", value: emp.nok_address },
  ];

  return (
    <View style={styles.container}>
      {saved && (
        <View style={styles.successBox}>
          <CheckCircle2 size={14} color={C.success} />
          <Text style={styles.successText}>
            Change request submitted. HR will review shortly.
          </Text>
        </View>
      )}

      {/* Personal Info */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <View
              style={[
                styles.sectionIconWrap,
                { backgroundColor: C.primaryLight },
              ]}
            >
              <User size={14} color={C.primary} />
            </View>
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>
          <Pressable
            onPress={() => {
              setForm({});
              setError(null);
              setModalOpen(true);
            }}
            style={styles.editBtn}
          >
            <Edit3 size={11} color={C.primary} />
            <Text style={styles.editBtnLabel}>Request Change</Text>
          </Pressable>
        </View>
        <View style={styles.sectionBody}>
          {PERSONAL_ROWS.map((r, i) => (
            <InfoRow
              key={r.label}
              label={r.label}
              value={r.value}
              last={i === PERSONAL_ROWS.length - 1}
            />
          ))}
        </View>
      </View>

      {/* Next of Kin */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <View
              style={[styles.sectionIconWrap, { backgroundColor: "#ECFEFF" }]}
            >
              <UserCheck size={14} color={C.accent} />
            </View>
            <Text style={styles.sectionTitle}>Next of Kin</Text>
          </View>
        </View>
        <View style={styles.sectionBody}>
          {NOK_ROWS.map((r, i) => (
            <InfoRow
              key={r.label}
              label={r.label}
              value={r.value}
              last={i === NOK_ROWS.length - 1}
            />
          ))}
        </View>
      </View>

      {/* Request Change Modal */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalOpen(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Profile Change</Text>
              <Pressable
                onPress={() => setModalOpen(false)}
                hitSlop={8}
                style={styles.modalCloseBtn}
              >
                <X size={15} color={C.textMuted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {error && (
                <View style={styles.errorBox}>
                  <AlertCircle size={13} color={C.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Text style={styles.modalInfo}>
                Fill in the fields you want to change. Empty fields will be
                ignored. HR will review your request.
              </Text>

              {EDITABLE.map((f) => (
                <View key={f.key} style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>{f.label}</Text>
                  <TextInput
                    value={form[f.key] ?? ""}
                    onChangeText={(v) =>
                      setForm((prev) => ({ ...prev, [f.key]: v }))
                    }
                    placeholder={`Current: ${emp[f.key.replace(/([A-Z])/g, "_$1").toLowerCase()] ?? "—"}`}
                    placeholderTextColor={C.textMuted}
                    style={styles.fieldInput}
                  />
                </View>
              ))}
              <View style={{ height: 16 }} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                onPress={() => setModalOpen(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelLabel}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                disabled={saving}
                style={[styles.submitBtn, saving && { opacity: 0.7 }]}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Save size={13} color="#fff" />
                    <Text style={styles.submitLabel}>Submit Request</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.successLight,
    borderRadius: 12,
    padding: 12,
  },
  successText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "600",
    color: C.success,
  },
  section: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  sectionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: C.textPrimary,
  },
  sectionBody: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: C.primaryLight,
  },
  editBtnLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.primary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalSheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    maxHeight: "85%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center",
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.textPrimary,
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
  },
  modalInfo: {
    fontSize: 12,
    color: C.textMuted,
    lineHeight: 17,
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.dangerLight,
    borderRadius: 12,
    padding: 11,
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: C.danger,
  },
  fieldWrap: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  fieldInput: {
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 13.5,
    color: C.textPrimary,
  },
  modalFooter: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  cancelLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textSecondary,
  },
  submitBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  submitLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
});
