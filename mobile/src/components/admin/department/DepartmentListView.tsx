// src/components/admin/department/DepartmentListView.tsx
// Main department list screen — mobile equivalent of DepartmentsPage.jsx's
// grid/list view, hero stats banner, and search bar.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Search,
  X,
  Plus,
  Building2,
  RefreshCw,
} from "lucide-react-native";

import C from "../../../styles/colors";
import { departmentApi } from "../../../api/service/departmentApi";
import { getEmployees } from "../../../api/service/employeeApi";
import DepartmentListItem from "./DepartmentListItem";
import { normalizeEmployee } from "./../../../hooks/deptHelpers";

interface Props {
  onClose: () => void;
  onCreate: () => void;
  onView: (dept: any) => void;
  onEdit: (dept: any) => void;
  onDelete: (dept: any) => void;
  onAssign: (dept: any) => void;
  showToast: (msg: string, type?: "success" | "error") => void;
  reloadToken?: number;
}

export default function DepartmentListView({
  onClose,
  onCreate,
  onView,
  onEdit,
  onDelete,
  onAssign,
  showToast,
  reloadToken,
}: Props) {
  const insets = useSafeAreaInsets();

  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [empLoading, setEmpLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDepts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await departmentApi.list();
      setDepartments(res?.departments ?? res?.data ?? res ?? []);
    } catch (err: any) {
      showToast(err?.message || "Failed to load departments", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchEmployees = useCallback(async () => {
    setEmpLoading(true);
    try {
      const res = await getEmployees({ limit: 200 });
      const raw = res?.data ?? res?.employees ?? res ?? [];
      const list = Array.isArray(raw) ? raw : [];
      setEmployees(list.map(normalizeEmployee));
    } catch (err: any) {
      showToast(err?.message || "Failed to load employees", "error");
    } finally {
      setEmpLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDepts();
    fetchEmployees();
  }, [fetchDepts, fetchEmployees, reloadToken]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchDepts(), fetchEmployees()]);
    setRefreshing(false);
  }, [fetchDepts, fetchEmployees]);

  const getEmployeesForDept = useCallback(
    (deptId: string, deptName?: string) =>
      employees.filter(
        (emp) =>
          emp.department_id === deptId ||
          emp.department_id === String(deptId) ||
          (deptName &&
            emp.department?.toLowerCase() === deptName.toLowerCase()),
      ),
    [employees],
  );

  const getHeadEmployee = useCallback(
    (dept: any) =>
      dept.head_id
        ? (employees.find((e) => e.id === dept.head_id) ?? null)
        : null,
    [employees],
  );

  const largest = departments.length
    ? departments.reduce((a, b) =>
        getEmployeesForDept(a.id, a.name).length >=
        getEmployeesForDept(b.id, b.name).length
          ? a
          : b,
      )
    : null;

  const filtered = useMemo(
    () =>
      departments.filter(
        (d) =>
          !searchQuery ||
          d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (d.head_name ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [departments, searchQuery],
  );

  const avgSize = departments.length
    ? Math.round(employees.length / departments.length)
    : 0;

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={onClose} style={s.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Departments</Text>
          <Text style={s.headerSubtitle}>
            {departments.length} departments · {employees.length} employees
          </Text>
        </View>
        <Pressable onPress={fetchEmployees} style={s.refreshBtn}>
          <RefreshCw
            size={15}
            color={C.textSecondary}
            style={empLoading ? { opacity: 0.5 } : undefined}
          />
        </Pressable>
        <Pressable onPress={onCreate} style={s.addBtn}>
          <Plus size={15} color="#fff" />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroTop}>
            <View style={s.heroIconWrap}>
              <Building2 size={22} color="#fff" />
            </View>
            <Text style={s.heroTitle}>Organisation Overview</Text>
          </View>
          <View style={s.statsRow}>
            {[
              { label: "Departments", value: departments.length },
              { label: "Employees", value: employees.length },
              { label: "Avg Size", value: avgSize },
              { label: "Largest", value: largest?.name ?? "—" },
            ].map((st) => (
              <View key={st.label} style={s.statPill}>
                <Text style={s.statPillValue}>{st.value}</Text>
                <Text style={s.statPillLabel}>{st.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Search */}
        <View style={s.searchRow}>
          <Search size={14} color={C.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search departments…"
            placeholderTextColor={C.textMuted}
            style={s.searchInput}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <X size={13} color={C.textMuted} />
            </Pressable>
          ) : null}
        </View>

        <Text style={s.countLabel}>
          {loading
            ? "Loading…"
            : `Showing ${filtered.length} of ${departments.length} departments`}
        </Text>

        {/* List */}
        {loading ? (
          <View style={{ gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={s.skeleton} />
            ))}
          </View>
        ) : filtered.length === 0 ? (
          <View style={s.empty}>
            <Building2 size={36} color={C.textMuted} />
            <Text style={s.emptyTitle}>No departments yet</Text>
            <Text style={s.emptyDesc}>
              Create your first department to get started.
            </Text>
            <Pressable onPress={onCreate} style={s.emptyBtn}>
              <Plus size={13} color="#fff" />
              <Text style={s.emptyBtnText}>New Department</Text>
            </Pressable>
          </View>
        ) : (
          filtered.map((dept, i) => (
            <DepartmentListItem
              key={dept.id}
              dept={dept}
              index={i}
              deptEmployees={getEmployeesForDept(dept.id, dept.name)}
              headEmployee={getHeadEmployee(dept)}
              onView={() => onView(dept)}
              onEdit={() => onEdit(dept)}
              onDelete={() => onDelete(dept)}
              onAssign={() => onAssign(dept)}
            />
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  headerSubtitle: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
  },

  scrollContent: { padding: 16, paddingBottom: 8, gap: 14 },

  hero: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: C.navy,
    gap: 14,
  },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  heroIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    fontFamily: Platform.OS === "ios" ? "Sora" : "sans-serif",
  },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statPill: {
    flexBasis: "47%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  statPillValue: { fontSize: 17, fontWeight: "800", color: "#fff" },
  statPillLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.textPrimary, padding: 0 },

  countLabel: { fontSize: 12, fontWeight: "600", color: C.textSecondary },

  skeleton: {
    height: 180,
    borderRadius: 18,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },

  empty: { alignItems: "center", gap: 8, paddingVertical: 48 },
  emptyTitle: { fontSize: 14, fontWeight: "700", color: C.textPrimary },
  emptyDesc: { fontSize: 12, color: C.textMuted, textAlign: "center" },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.primary,
  },
  emptyBtnText: { fontSize: 12, fontWeight: "800", color: "#fff" },
});
