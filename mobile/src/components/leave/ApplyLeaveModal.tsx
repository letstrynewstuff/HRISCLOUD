

// src/components/leave/ApplyLeaveModal.tsx
// Apply-for-leave form. Leave types (policies) and balances are entirely
// admin-configured and fetched live — employees only pick from what's
// already been set up; there is nothing here for them to define.

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
  Calendar,
  FileText,
  ChevronDown,
  ArrowRight,
  Check,
} from "lucide-react-native";
import C from "../../styles/colors";
import { getLeaveMeta } from "./leaveMeta";
import { LeavePolicy, LeaveBalance } from "../../types/leave";

type FormValues = {
  policyId: string;
  startDate: string;
  endDate: string;
  reason: string;
};

type ApplyLeaveModalProps = {
  open: boolean;
  policies: LeavePolicy[];
  balances: LeaveBalance[];
  initialPolicyId?: string;
  onClose: () => void;
  onSubmit: (form: FormValues) => void;
  submitting?: boolean;
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function countWorkdays(startStr: string, endStr: string) {
  if (!startStr || !endStr) return 0;
  const s = new Date(startStr);
  const e = new Date(endStr);
  if (e < s) return 0;
  let count = 0;
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

const emptyForm = (policyId = ""): FormValues => ({
  policyId,
  startDate: "",
  endDate: "",
  reason: "",
});

export default function ApplyLeaveModal({
  open,
  policies,
  balances,
  initialPolicyId,
  onClose,
  onSubmit,
  submitting,
}: ApplyLeaveModalProps) {
  const [form, setForm] = useState<FormValues>(emptyForm(initialPolicyId));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPicker, setShowPicker] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (open) {
      setForm(emptyForm(initialPolicyId));
      setErrors({});
      setStep(1);
    }
  }, [open, initialPolicyId]);

  const set = (k: keyof FormValues, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const selectedPolicy = policies.find((p) => p.id === form.policyId);
  const selectedBalance = balances.find(
    (b) => b.id === form.policyId || b.leaveType === selectedPolicy?.leaveType,
  );
  const remaining = selectedBalance?.remaining ?? 0;
  const workdays = countWorkdays(form.startDate, form.endDate);
  const afterBalance = remaining - workdays;
  const meta = selectedPolicy ? getLeaveMeta(selectedPolicy.leaveType) : null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.policyId) errs.policyId = "Please select a leave type";
    if (!form.startDate) errs.startDate = "Start date required (YYYY-MM-DD)";
    if (!form.endDate) errs.endDate = "End date required (YYYY-MM-DD)";
    const dateRe = /^\d{4}-\d{2}-\d{2}$/;
    if (form.startDate && !dateRe.test(form.startDate))
      errs.startDate = "Use format YYYY-MM-DD";
    if (form.endDate && !dateRe.test(form.endDate))
      errs.endDate = "Use format YYYY-MM-DD";
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      errs.endDate = "End must be after start";
    }
    if (form.startDate && form.startDate < todayStr()) {
      errs.startDate = "Start date cannot be in the past";
    }
    if (!form.reason.trim()) errs.reason = "Please provide a reason";
    if (workdays > remaining) {
      errs.balance = `Insufficient balance (${remaining} day${remaining !== 1 ? "s" : ""} remaining)`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReview = () => {
    if (validate()) setStep(2);
  };

  const handleConfirm = () => {
    onSubmit(form);
  };

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
              {step === 1 ? "Apply for Leave" : "Confirm Application"}
            </Text>
            <Pressable hitSlop={8} onPress={onClose} style={styles.closeBtn}>
              <X size={16} color={C.textMuted} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {step === 1 ? (
              <>
                {policies.length === 0 ? (
                  <View style={styles.noPoliciesBox}>
                    <Text style={styles.noPoliciesTitle}>
                      No leave policies available
                    </Text>
                    <Text style={styles.noPoliciesSubtitle}>
                      Your administrator hasn't set up any leave policies for
                      you yet. Contact HR/Admin to get started.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Leave Type *</Text>
                    <Pressable
                      onPress={() => setShowPicker((p) => !p)}
                      style={[
                        styles.selectBox,
                        errors.policyId && styles.inputError,
                        form.policyId && !errors.policyId && styles.inputFilled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.selectText,
                          { color: form.policyId ? C.textPrimary : C.textMuted },
                        ]}
                        numberOfLines={1}
                      >
                        {selectedPolicy
                          ? `${selectedPolicy.name} (${remaining} day${remaining !== 1 ? "s" : ""} available)`
                          : "Select leave type…"}
                      </Text>
                      <ChevronDown size={14} color={C.textMuted} />
                    </Pressable>

                    {showPicker && (
                      <View style={styles.pickerList}>
                        {policies.map((p) => {
                          const bal = balances.find(
                            (b) => b.id === p.id || b.leaveType === p.leaveType,
                          );
                          const avail = bal?.remaining ?? 0;
                          const disabled = avail === 0;
                          return (
                            <Pressable
                              key={p.id}
                              disabled={disabled}
                              onPress={() => {
                                set("policyId", p.id);
                                setShowPicker(false);
                              }}
                              style={({ pressed }) => [
                                styles.pickerItem,
                                disabled && { opacity: 0.4 },
                                pressed &&
                                  !disabled && { backgroundColor: C.surfaceAlt },
                              ]}
                            >
                              <Text style={styles.pickerItemText}>
                                {p.name} ({avail} day{avail !== 1 ? "s" : ""}{" "}
                                available)
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    )}

                    {errors.policyId ? (
                      <Text style={styles.errorText}>{errors.policyId}</Text>
                    ) : null}

                    {selectedPolicy && meta && (
                      <View
                        style={[
                          styles.balancePreview,
                          { backgroundColor: meta.bg },
                        ]}
                      >
                        <meta.Icon size={13} color={meta.color} />
                        <Text
                          style={[
                            styles.balancePreviewText,
                            { color: meta.color },
                          ]}
                        >
                          <Text style={styles.bold}>{remaining} days</Text>{" "}
                          available of {selectedPolicy.daysAllowed} total
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {policies.length > 0 && (
                  <>
                    {/* Dates */}
                    <View style={styles.dateRow}>
                      <View style={[styles.field, { flex: 1 }]}>
                        <View style={styles.fieldLabelRow}>
                          <Calendar size={12} color={C.textMuted} />
                          <Text style={styles.fieldLabel}>Start Date *</Text>
                        </View>
                        <TextInput
                          value={form.startDate}
                          onChangeText={(v) => set("startDate", v)}
                          placeholder="YYYY-MM-DD"
                          placeholderTextColor={C.textMuted}
                          style={[
                            styles.input,
                            errors.startDate && styles.inputError,
                          ]}
                        />
                        {errors.startDate ? (
                          <Text style={styles.errorText}>{errors.startDate}</Text>
                        ) : null}
                      </View>
                      <View style={[styles.field, { flex: 1 }]}>
                        <View style={styles.fieldLabelRow}>
                          <Calendar size={12} color={C.textMuted} />
                          <Text style={styles.fieldLabel}>End Date *</Text>
                        </View>
                        <TextInput
                          value={form.endDate}
                          onChangeText={(v) => set("endDate", v)}
                          placeholder="YYYY-MM-DD"
                          placeholderTextColor={C.textMuted}
                          style={[
                            styles.input,
                            errors.endDate && styles.inputError,
                          ]}
                        />
                        {errors.endDate ? (
                          <Text style={styles.errorText}>{errors.endDate}</Text>
                        ) : null}
                      </View>
                    </View>

                    {/* Working days preview */}
                    {form.startDate &&
                      form.endDate &&
                      form.startDate <= form.endDate && (
                        <View
                          style={[
                            styles.workdaysBox,
                            {
                              backgroundColor:
                                workdays > remaining
                                  ? C.dangerLight
                                  : C.successLight,
                            },
                          ]}
                        >
                          <Calendar
                            size={13}
                            color={workdays > remaining ? C.danger : C.success}
                          />
                          <Text
                            style={[
                              styles.workdaysText,
                              {
                                color: workdays > remaining ? C.danger : C.success,
                              },
                            ]}
                          >
                            <Text style={styles.bold}>
                              {workdays} working day{workdays !== 1 ? "s" : ""}
                            </Text>
                            {workdays > remaining
                              ? ` — exceeds your balance of ${remaining} days`
                              : " will be deducted"}
                          </Text>
                        </View>
                      )}
                    {errors.balance ? (
                      <Text style={styles.errorText}>{errors.balance}</Text>
                    ) : null}

                    {/* Reason */}
                    <View style={styles.field}>
                      <View style={styles.fieldLabelRow}>
                        <FileText size={12} color={C.textMuted} />
                        <Text style={styles.fieldLabel}>Reason *</Text>
                      </View>
                      <TextInput
                        value={form.reason}
                        onChangeText={(v) => set("reason", v)}
                        placeholder="Briefly describe the reason for your leave…"
                        placeholderTextColor={C.textMuted}
                        multiline
                        numberOfLines={3}
                        style={[
                          styles.input,
                          styles.textArea,
                          errors.reason && styles.inputError,
                        ]}
                      />
                      {errors.reason ? (
                        <Text style={styles.errorText}>{errors.reason}</Text>
                      ) : null}
                    </View>

                    <Pressable
                      onPress={handleReview}
                      style={({ pressed }) => [
                        styles.primaryBtn,
                        pressed && { opacity: 0.88 },
                      ]}
                    >
                      <Text style={styles.primaryLabel}>Review Application</Text>
                      <ArrowRight size={15} color="#fff" />
                    </Pressable>
                  </>
                )}
              </>
            ) : (
              <>
                <Text style={styles.confirmIntro}>
                  Please review your leave request before submitting.
                </Text>

                <View style={styles.summaryBox}>
                  {[
                    { label: "Leave Type", value: selectedPolicy?.name ?? "—" },
                    { label: "Start Date", value: form.startDate },
                    { label: "End Date", value: form.endDate },
                    {
                      label: "Duration",
                      value: `${workdays} working day${workdays !== 1 ? "s" : ""}`,
                    },
                    { label: "Reason", value: form.reason },
                  ].map((r, i) => (
                    <View
                      key={r.label}
                      style={[
                        styles.summaryRow,
                        {
                          backgroundColor:
                            i % 2 === 0 ? C.surfaceAlt : C.surface,
                        },
                      ]}
                    >
                      <Text style={styles.summaryLabel}>{r.label}</Text>
                      <Text style={styles.summaryValue} numberOfLines={2}>
                        {r.value}
                      </Text>
                    </View>
                  ))}
                </View>

                <View
                  style={[
                    styles.impactBox,
                    {
                      backgroundColor:
                        afterBalance <= 2 ? C.warningLight : C.successLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.impactTitle,
                      { color: afterBalance <= 2 ? C.warning : C.success },
                    ]}
                  >
                    Balance Impact
                  </Text>
                  <View style={styles.impactRow}>
                    <Text style={styles.impactText}>
                      Available:{" "}
                      <Text style={styles.bold}>{remaining} days</Text>
                    </Text>
                    <ArrowRight size={13} color={C.textMuted} />
                    <Text style={styles.impactText}>
                      After:{" "}
                      <Text
                        style={[
                          styles.bold,
                          { color: afterBalance <= 2 ? C.warning : C.success },
                        ]}
                      >
                        {afterBalance} days
                      </Text>
                    </Text>
                  </View>
                </View>

                <View style={styles.confirmActions}>
                  <Pressable
                    onPress={() => setStep(1)}
                    style={({ pressed }) => [
                      styles.editBtn,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text style={styles.editLabel}>← Edit</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleConfirm}
                    disabled={submitting}
                    style={({ pressed }) => [
                      styles.submitBtn,
                      submitting && { opacity: 0.8 },
                      pressed && !submitting && { opacity: 0.88 },
                    ]}
                  >
                    {submitting ? (
                      <Text style={styles.submitLabel}>Submitting…</Text>
                    ) : (
                      <>
                        <Check size={15} color="#fff" />
                        <Text style={styles.submitLabel}>Submit</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: { backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24, maxHeight: "90%" },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: "center", marginBottom: 14 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  title: { fontSize: 17, fontWeight: "700", color: C.textPrimary },
  closeBtn: { padding: 6, borderRadius: 10, backgroundColor: C.surfaceAlt },
  noPoliciesBox: { padding: 16, borderRadius: 14, backgroundColor: C.surfaceAlt, marginBottom: 14 },
  noPoliciesTitle: { fontSize: 13.5, fontWeight: "700", color: C.textPrimary, marginBottom: 4 },
  noPoliciesSubtitle: { fontSize: 12, color: C.textMuted, lineHeight: 17 },
  field: { marginBottom: 14 },
  fieldLabelRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
  fieldLabel: { fontSize: 11.5, fontWeight: "700", color: C.textSecondary, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 6 },
  input: { backgroundColor: C.surfaceAlt, borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: C.textPrimary },
  textArea: { minHeight: 76, textAlignVertical: "top" },
  inputError: { borderColor: C.danger },
  inputFilled: { borderColor: C.primary },
  errorText: { fontSize: 11.5, color: C.danger, fontWeight: "600", marginTop: 4 },
  selectBox: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.surfaceAlt, borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  selectText: { flex: 1, fontSize: 13.5 },
  pickerList: { marginTop: 6, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: "hidden", backgroundColor: C.surface },
  pickerItem: { paddingVertical: 11, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  pickerItemText: { fontSize: 13, color: C.textPrimary },
  balancePreview: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 8, paddingVertical: 8, paddingHorizontal: 11, borderRadius: 12 },
  balancePreviewText: { fontSize: 12, flex: 1 },
  bold: { fontWeight: "700" },
  dateRow: { flexDirection: "row", gap: 10 },
  workdaysBox: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 9, paddingHorizontal: 11, borderRadius: 12, marginBottom: 14 },
  workdaysText: { fontSize: 12, flex: 1 },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 14, backgroundColor: C.primary, marginTop: 4 },
  primaryLabel: { fontSize: 14, fontWeight: "700", color: "#fff" },
  confirmIntro: { fontSize: 12.5, color: C.textSecondary, marginBottom: 14 },
  summaryBox: { borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: C.border, marginBottom: 14 },
  summaryRow: { flexDirection: "row", paddingHorizontal: 13, paddingVertical: 11, gap: 10 },
  summaryLabel: { fontSize: 11, fontWeight: "700", color: C.textMuted, width: 78 },
  summaryValue: { fontSize: 12.5, fontWeight: "600", color: C.textPrimary, flex: 1 },
  impactBox: { borderRadius: 14, padding: 13, marginBottom: 16 },
  impactTitle: { fontSize: 11.5, fontWeight: "700", marginBottom: 6 },
  impactRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  impactText: { fontSize: 12.5, color: C.textSecondary },
  confirmActions: { flexDirection: "row", gap: 10 },
  editBtn: { flex: 1, paddingVertical: 13, borderRadius: 14, alignItems: "center", backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.border },
  editLabel: { fontSize: 13.5, fontWeight: "700", color: C.textSecondary },
  submitBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 13, borderRadius: 14, backgroundColor: C.success },
  submitLabel: { fontSize: 13.5, fontWeight: "700", color: "#fff" },
});