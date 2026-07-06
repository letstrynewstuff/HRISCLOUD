// src/components/admin/benefits/AssignBenefitModal.tsx

import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Users, X, AlertTriangle, Search, Check } from "lucide-react-native";
import C from "../../../styles/colors";
import { benefitsApi } from "../../../api/service/benefitsApi";
import { getEmployees } from "../../../api/service/employeeApi";

interface Props {
  visible: boolean;
  benefit: any;
  onClose: () => void;
  onAssigned: () => void;
}

// Simple text-input date field — YYYY-MM-DD. Swap for a native date
// picker (@react-native-community/datetimepicker) if you want a calendar UI.
function DateField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>
        {label} {required ? <Text style={{ color: C.danger }}>*</Text> : null}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={C.textMuted}
        style={styles.input}
      />
    </View>
  );
}

export default function AssignBenefitModal({
  visible,
  benefit,
  onClose,
  onAssigned,
}: Props) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLoadingEmployees(true);
    getEmployees({ limit: 200 })
      .then((res: any) => setEmployees(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingEmployees(false));
  }, [visible]);

  const reset = () => {
    setEmployeeId("");
    setStartDate("");
    setEndDate("");
    setEmployeeSearch("");
    setPickerOpen(false);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const selectedEmployee = employees.find((e) => e.id === employeeId);

  const filteredEmployees = employees.filter((e) => {
    if (!employeeSearch) return true;
    const q = employeeSearch.toLowerCase();
    const name = `${e.first_name ?? ""} ${e.last_name ?? ""}`.toLowerCase();
    return name.includes(q) || e.employee_code?.toLowerCase().includes(q);
  });

  const handleAssign = async () => {
    if (!employeeId || !startDate) {
      setError("Employee and start date are required.");
      return;
    }
    setAssigning(true);
    setError("");
    try {
      await benefitsApi.assign({
        benefitId: benefit.id,
        employeeId,
        startDate,
        endDate,
      });
      reset();
      onAssigned();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to assign benefit.");
    } finally {
      setAssigning(false);
    }
  };

  if (!benefit) return null;

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
                style={[styles.iconWrap, { backgroundColor: C.successLight }]}
              >
                <Users size={15} color={C.success} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Assign Benefit</Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {benefit.name}
                </Text>
              </View>
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

            <Text style={styles.label}>
              Select Employee <Text style={{ color: C.danger }}>*</Text>
            </Text>
            <Pressable
              onPress={() => setPickerOpen((p) => !p)}
              style={styles.selectField}
            >
              <Text
                style={[
                  styles.selectFieldText,
                  !selectedEmployee && { color: C.textMuted },
                ]}
                numberOfLines={1}
              >
                {selectedEmployee
                  ? `${selectedEmployee.first_name} ${selectedEmployee.last_name} (${selectedEmployee.employee_code})`
                  : "— Choose employee —"}
              </Text>
            </Pressable>

            {pickerOpen && (
              <View style={styles.pickerBox}>
                <View style={styles.pickerSearchRow}>
                  <Search size={13} color={C.textMuted} />
                  <TextInput
                    value={employeeSearch}
                    onChangeText={setEmployeeSearch}
                    placeholder="Search employees…"
                    placeholderTextColor={C.textMuted}
                    style={styles.pickerSearchInput}
                  />
                </View>
                {loadingEmployees ? (
                  <View style={{ paddingVertical: 16, alignItems: "center" }}>
                    <ActivityIndicator size="small" color={C.primary} />
                  </View>
                ) : (
                  <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
                    {filteredEmployees.map((e) => {
                      const active = e.id === employeeId;
                      return (
                        <Pressable
                          key={e.id}
                          onPress={() => {
                            setEmployeeId(e.id);
                            setPickerOpen(false);
                          }}
                          style={styles.pickerRow}
                        >
                          <Text style={styles.pickerRowText} numberOfLines={1}>
                            {e.first_name} {e.last_name} ({e.employee_code})
                          </Text>
                          {active && <Check size={14} color={C.primary} />}
                        </Pressable>
                      );
                    })}
                    {filteredEmployees.length === 0 && (
                      <Text style={styles.pickerEmpty}>No employees found</Text>
                    )}
                  </ScrollView>
                )}
              </View>
            )}

            <View style={styles.dateRow}>
              <DateField
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                required
              />
              <DateField
                label="End Date (optional)"
                value={endDate}
                onChange={setEndDate}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable onPress={handleClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleAssign}
              disabled={assigning}
              style={styles.saveBtn}
            >
              {assigning ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Users size={14} color="#fff" />
                  <Text style={styles.saveBtnText}>Assign Benefit</Text>
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
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 14, fontWeight: "800", color: C.textPrimary },
  headerSubtitle: { fontSize: 11, color: C.textMuted, marginTop: 1 },
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
  },
  input: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 13,
    color: C.textPrimary,
    backgroundColor: C.surfaceAlt,
  },

  selectField: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 12,
    backgroundColor: C.surfaceAlt,
  },
  selectFieldText: { fontSize: 14, color: C.textPrimary, fontWeight: "600" },

  pickerBox: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    overflow: "hidden",
  },
  pickerSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  pickerSearchInput: {
    flex: 1,
    fontSize: 13,
    color: C.textPrimary,
    paddingVertical: 0,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  pickerRowText: { fontSize: 13, color: C.textPrimary, flex: 1 },
  pickerEmpty: {
    textAlign: "center",
    padding: 16,
    fontSize: 12,
    color: C.textMuted,
  },

  dateRow: { flexDirection: "row", gap: 10, marginTop: 14 },

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
    backgroundColor: C.success,
  },
  saveBtnText: { fontSize: 13, fontWeight: "800", color: "#fff" },
});
