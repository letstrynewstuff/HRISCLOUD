// src/components/admin/department/AssignEmployeesView.tsx
// Mobile equivalent of the web AssignEmployeesModal — full-screen here
// since mobile forms are generally pushed as views rather than centered modals.

import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Search,
  X,
  Check,
  UserPlus,
  UserCheck,
  Users,
} from "lucide-react-native";

import C from "../../../styles/colors";
import { updateEmployee } from "../../../api/service/employeeApi";
import { empFullName, empInitials } from "../../../hooks/deptHelpers";

interface Props {
  department: any;
  employees: any[];
  onClose: () => void;
  onSuccess: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export default function AssignEmployeesView({
  department,
  employees,
  onClose,
  onSuccess,
  showToast,
}: Props) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const available = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter((e) => {
      const notInDept =
        e.department_id !== department.id && e.department !== department.name;
      const matchesSearch =
        !q ||
        empFullName(e).toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        (e.job_title ?? "").toLowerCase().includes(q);
      return notInDept && matchesSearch;
    });
  }, [employees, department, search]);

  const toggle = (id: string) =>
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );

  const toggleAll = () =>
    setSelected(
      selected.length === available.length ? [] : available.map((e) => e.id),
    );

  const handleAssign = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    try {
      await Promise.all(
        // camelCase `departmentId` — matches express-validator rules in the
        // employee controller (same convention used on the web version).
        selected.map((id) =>
          updateEmployee(id, { departmentId: department.id }),
        ),
      );
      showToast(
        `${selected.length} employee${selected.length > 1 ? "s" : ""} assigned to ${department.name}`,
      );
      onSuccess();
    } catch (err: any) {
      showToast(err?.message || "Failed to assign employees", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={onClose} style={s.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Assign Employees</Text>
          <Text style={s.headerSubtitle}>
            Add members to{" "}
            <Text style={{ fontWeight: "800" }}>{department.name}</Text>
          </Text>
        </View>
      </View>

      <View style={s.searchWrap}>
        <View style={s.searchRow}>
          <Search size={14} color={C.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, email or title…"
            placeholderTextColor={C.textMuted}
            style={s.searchInput}
          />
          {search ? (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <X size={13} color={C.textMuted} />
            </Pressable>
          ) : null}
        </View>
        {available.length > 0 && (
          <Pressable
            onPress={toggleAll}
            style={[
              s.selectAllBtn,
              selected.length === available.length && s.selectAllBtnActive,
            ]}
          >
            <Text
              style={[
                s.selectAllText,
                selected.length === available.length && s.selectAllTextActive,
              ]}
            >
              {selected.length === available.length
                ? "Deselect All"
                : "Select All"}
            </Text>
          </Pressable>
        )}
      </View>

      {selected.length > 0 && (
        <View style={s.selectionPill}>
          <UserCheck size={14} color={C.primary} />
          <Text style={s.selectionPillText}>
            {selected.length} employee{selected.length > 1 ? "s" : ""} selected
          </Text>
          <Pressable
            onPress={() => setSelected([])}
            style={{ marginLeft: "auto" }}
          >
            <Text style={s.clearAllText}>Clear all</Text>
          </Pressable>
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.listContent}>
        {available.length === 0 ? (
          <View style={s.empty}>
            <Users size={28} color={C.textMuted} />
            <Text style={s.emptyText}>
              {employees.length === 0
                ? "No employees found"
                : search
                  ? "No employees match your search"
                  : "All employees are already in this department"}
            </Text>
          </View>
        ) : (
          available.map((emp) => {
            const isSel = selected.includes(emp.id);
            return (
              <Pressable
                key={emp.id}
                onPress={() => toggle(emp.id)}
                style={[s.empRow, isSel && s.empRowActive]}
              >
                <View
                  style={[
                    s.empAvatar,
                    { backgroundColor: isSel ? C.primary : "#64748B" },
                  ]}
                >
                  <Text style={s.empAvatarText}>{empInitials(emp)}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.empName} numberOfLines={1}>
                    {empFullName(emp)}
                  </Text>
                  <Text style={s.empMeta} numberOfLines={1}>
                    {emp.job_title ?? emp.position ?? "—"}
                    {emp.department ? ` · Currently: ${emp.department}` : ""}
                  </Text>
                </View>
                <View style={[s.checkbox, isSel && s.checkboxActive]}>
                  {isSel && <Check size={11} color="#fff" />}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [s.cancelBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={s.cancelBtnText}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={handleAssign}
          disabled={saving || selected.length === 0}
          style={({ pressed }) => [
            s.assignBtn,
            (saving || selected.length === 0) && s.assignBtnDisabled,
            pressed && { opacity: 0.85 },
          ]}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <UserPlus
                size={14}
                color={selected.length === 0 ? "#818CF8" : "#fff"}
              />
              <Text
                style={[
                  s.assignBtnText,
                  selected.length === 0 && { color: "#818CF8" },
                ]}
              >
                Assign{" "}
                {selected.length > 0
                  ? `${selected.length} Employee${selected.length > 1 ? "s" : ""}`
                  : "Employees"}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
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

  searchWrap: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  searchRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.textPrimary, padding: 0 },
  selectAllBtn: {
    paddingHorizontal: 12,
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  selectAllBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  selectAllText: { fontSize: 11, fontWeight: "800", color: C.textSecondary },
  selectAllTextActive: { color: "#fff" },

  selectionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: C.primary + "33",
  },
  selectionPillText: { fontSize: 12, fontWeight: "800", color: C.primary },
  clearAllText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.primary,
    textDecorationLine: "underline",
  },

  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },

  empty: { alignItems: "center", gap: 10, paddingVertical: 48 },
  emptyText: { fontSize: 13, color: C.textMuted, textAlign: "center" },

  empRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 8,
  },
  empRowActive: {
    backgroundColor: C.primaryLight,
    borderColor: C.primary + "44",
  },
  empAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  empAvatarText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  empName: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  empMeta: { fontSize: 11, color: C.textMuted, marginTop: 1 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: C.border,
    backgroundColor: C.surfaceAlt,
  },
  checkboxActive: { backgroundColor: C.primary, borderColor: C.primary },

  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.bg,
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
  cancelBtnText: { fontSize: 14, fontWeight: "700", color: C.textSecondary },
  assignBtn: {
    flex: 1.4,
    flexDirection: "row",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
  },
  assignBtnDisabled: { backgroundColor: "#C7D2FE" },
  assignBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },
});
