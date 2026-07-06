// src/components/admin/department/EmployeeSearchSelect.tsx
// Searchable employee picker — mobile equivalent of the web
// EmployeeSearchDropdown used on DepartmentsPage.jsx.

import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import {
  Search,
  X,
  Check,
  UserCircle2,
  ChevronRight,
} from "lucide-react-native";

import C from "../../../styles/colors";
import { empFullName, empInitials } from "../../../hooks/deptHelpers";
import MobileFormField from "../employee/MobileFormField";

interface Props {
  label?: string;
  value: string;
  onChange: (id: string) => void;
  employees: any[];
  placeholder?: string;
  error?: string;
}

export default function EmployeeSearchSelect({
  label,
  value,
  onChange,
  employees,
  placeholder = "Search employees…",
  error,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = employees.find((e) => e.id === value);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        empFullName(e).toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        (e.job_title ?? e.position ?? "").toLowerCase().includes(q),
    );
  }, [employees, search]);

  const pick = (emp: any) => {
    onChange(emp.id);
    setSearch("");
    setOpen(false);
  };

  const clear = () => {
    onChange("");
    setSearch("");
  };

  const content = (
    <MobileFormField label={label ?? ""} error={error}>
      <Pressable
        onPress={() => setOpen(true)}
        style={[s.trigger, error && s.triggerError, value && s.triggerActive]}
      >
        {selected ? (
          <>
            <View style={s.avatarSm}>
              <Text style={s.avatarSmText}>{empInitials(selected)}</Text>
            </View>
            <Text style={s.triggerText} numberOfLines={1}>
              {empFullName(selected)}
            </Text>
            <Pressable
              onPress={clear}
              hitSlop={8}
              style={{ marginLeft: "auto" }}
            >
              <X size={14} color={C.textMuted} />
            </Pressable>
          </>
        ) : (
          <>
            <Search size={14} color={C.textMuted} />
            <Text style={s.placeholderText}>{placeholder}</Text>
            <ChevronRight
              size={14}
              color={C.textMuted}
              style={{ marginLeft: "auto" }}
            />
          </>
        )}
      </Pressable>
    </MobileFormField>
  );

  return (
    <>
      {content}
      <Modal
        visible={open}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>{label || "Select Employee"}</Text>
              <Pressable onPress={() => setOpen(false)} style={s.closeBtn}>
                <X size={16} color={C.textSecondary} />
              </Pressable>
            </View>

            <View style={s.searchRow}>
              <Search size={14} color={C.textMuted} />
              <TextInput
                autoFocus
                value={search}
                onChangeText={setSearch}
                placeholder="Type to filter…"
                placeholderTextColor={C.textMuted}
                style={s.searchInput}
              />
              {search ? (
                <Pressable onPress={() => setSearch("")} hitSlop={8}>
                  <X size={13} color={C.textMuted} />
                </Pressable>
              ) : null}
            </View>

            {value ? (
              <Pressable onPress={clear} style={s.clearRow}>
                <Text style={s.clearRowText}>Clear selection</Text>
              </Pressable>
            ) : null}

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 420 }}
              ListEmptyComponent={
                <View style={s.empty}>
                  <UserCircle2 size={28} color={C.textMuted} />
                  <Text style={s.emptyText}>No employees found</Text>
                </View>
              }
              renderItem={({ item }) => {
                const isSel = item.id === value;
                return (
                  <Pressable
                    onPress={() => pick(item)}
                    style={[s.row, isSel && s.rowActive]}
                  >
                    <View
                      style={[
                        s.avatarMd,
                        { backgroundColor: isSel ? C.primary : "#64748B" },
                      ]}
                    >
                      <Text style={s.avatarMdText}>{empInitials(item)}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={s.rowName} numberOfLines={1}>
                        {empFullName(item)}
                      </Text>
                      <Text style={s.rowMeta} numberOfLines={1}>
                        {item.job_title ?? item.position ?? "—"}
                        {item.department ? ` · ${item.department}` : ""}
                      </Text>
                    </View>
                    {isSel && <Check size={15} color={C.primary} />}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  triggerActive: { borderColor: C.primary + "66" },
  triggerError: { borderColor: C.danger },
  triggerText: { fontSize: 14, color: C.textPrimary, flexShrink: 1 },
  placeholderText: { fontSize: 14, color: C.textMuted, flex: 1 },

  avatarSm: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
  },
  avatarSmText: { color: "#fff", fontSize: 9, fontWeight: "800" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "82%",
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 14,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  sheetTitle: { fontSize: 15, fontWeight: "800", color: C.textPrimary },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.textPrimary, padding: 0 },

  clearRow: { paddingHorizontal: 18, paddingBottom: 8 },
  clearRowText: { fontSize: 12, fontWeight: "700", color: C.danger },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  rowActive: { backgroundColor: C.primaryLight },
  avatarMd: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarMdText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  rowName: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  rowMeta: { fontSize: 11, color: C.textMuted, marginTop: 1 },

  empty: { alignItems: "center", gap: 8, paddingVertical: 36 },
  emptyText: { fontSize: 13, color: C.textMuted },
});
