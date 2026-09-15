import { useState, useEffect } from "react";
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
import { Users, X, Search, AlertTriangle } from "lucide-react-native";
import C from "../../../styles/colors";
import { CONDITION_OPTIONS } from "./AssetMeta";
import { assetApi } from "../../../api/service/assetApi";
import { getEmployees } from "../../../api/service/employeeApi";

type Props = {
  visible: boolean;
  asset: any;
  onClose: () => void;
  onAssigned: () => void;
};

export default function AssignAssetModal({
  visible,
  asset,
  onClose,
  onAssigned,
}: Props) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    employeeId: "",
    condition: asset?.condition ?? "good",
    expectedReturnDate: "",
    notes: "",
  });
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      getEmployees({ limit: 200 })
        .then((res) => {
          const list = res.data ?? [];
          setEmployees(list);
          setFiltered(list);
        })
        .catch(() => {});
    }
  }, [visible]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      employees.filter((e) =>
        `${e.first_name} ${e.last_name} ${e.employee_code}`
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [search, employees]);

  const handleAssign = async () => {
    if (!form.employeeId) {
      setError("Choose an employee to assign this asset to.");
      return;
    }
    setAssigning(true);
    setError("");
    try {
      await assetApi.assign(asset.id, form);
      onAssigned();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to assign asset.");
    } finally {
      setAssigning(false);
    }
  };

  const selectedEmployee = employees.find(
    (e) => String(e.id) === String(form.employeeId),
  );

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
                style={[styles.headerIcon, { backgroundColor: C.successLight }]}
              >
                <Users size={14} color={C.success} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Assign Asset</Text>
                <Text style={styles.headerSubtitle}>
                  {asset?.name} · {asset?.assetTag}
                </Text>
              </View>
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
              <Text style={styles.label}>Select Employee *</Text>
              <View style={styles.searchRow}>
                <Search size={13} color={C.textMuted} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search employees..."
                  placeholderTextColor={C.textMuted}
                  style={styles.searchInput}
                />
              </View>
              <ScrollView
                style={styles.employeeList}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                {filtered.map((e) => {
                  const isSelected = String(form.employeeId) === String(e.id);
                  return (
                    <Pressable
                      key={e.id}
                      onPress={() =>
                        setForm((p) => ({ ...p, employeeId: String(e.id) }))
                      }
                      style={[
                        styles.employeeRow,
                        isSelected && {
                          backgroundColor: C.primaryLight,
                          borderColor: C.primary + "44",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.employeeName,
                          isSelected && { color: C.primary, fontWeight: "700" },
                        ]}
                      >
                        {e.first_name} {e.last_name}
                      </Text>
                      <Text style={styles.employeeCode}>{e.employee_code}</Text>
                    </Pressable>
                  );
                })}
                {filtered.length === 0 && (
                  <Text style={styles.noResults}>No employees found</Text>
                )}
              </ScrollView>
              {selectedEmployee && (
                <Text style={styles.selectedText}>
                  Selected: {selectedEmployee.first_name}{" "}
                  {selectedEmployee.last_name}
                </Text>
              )}
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Condition Given</Text>
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
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Expected Return</Text>
                <TextInput
                  value={form.expectedReturnDate}
                  onChangeText={(t) =>
                    setForm((p) => ({ ...p, expectedReturnDate: t }))
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={C.textMuted}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                value={form.notes}
                onChangeText={(t) => setForm((p) => ({ ...p, notes: t }))}
                placeholder="Optional — e.g. accessories included"
                placeholderTextColor={C.textMuted}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                style={[styles.input, { minHeight: 60 }]}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleAssign}
              disabled={assigning}
              style={({ pressed }) => [
                styles.saveBtn,
                pressed && { opacity: 0.9 },
                assigning && { opacity: 0.7 },
              ]}
            >
              {assigning ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Users size={14} color="#fff" />
                  <Text style={styles.saveText}>Assign to Employee</Text>
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: C.textPrimary,
    padding: 0,
  },
  employeeList: {
    maxHeight: 160,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    marginTop: 6,
  },
  employeeRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  employeeName: {
    fontSize: 12.5,
    color: C.textPrimary,
  },
  employeeCode: {
    fontSize: 11,
    color: C.textMuted,
  },
  noResults: {
    textAlign: "center",
    padding: 14,
    fontSize: 12,
    color: C.textMuted,
  },
  selectedText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.primary,
    marginTop: 4,
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
    backgroundColor: C.success,
  },
  saveText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
});
