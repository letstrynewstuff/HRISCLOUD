// src/components/admin/employee/EmployeeListView.tsx
// Mobile Employee List — mirrors web EmployeeList.jsx

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Users,
  UserPlus,
  Search,
  ChevronRight,
  ChevronLeft,
  Eye,
  Edit3,
  Building2,
  MapPin,
  RefreshCw,
  AlertCircle,
  SlidersHorizontal,
  X,
  Download,
} from "lucide-react-native";

import C from "../../../styles/colors";
import { getEmployees } from "../../../api/service/employeeApi";
import { Loader } from "../../../hooks/loaderManager";

/* ─── Helpers ─────────────────────────────────────────────── */
function stringToColor(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360},65%,52%)`;
}

function fullName(emp: any) {
  return [emp.first_name, emp.middle_name, emp.last_name]
    .filter(Boolean)
    .join(" ");
}

function initials(emp: any) {
  return (
    [emp.first_name?.[0], emp.last_name?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "??"
  );
}

/* ─── Sub-components ──────────────────────────────────────── */
function Avatar({ emp, size = 40 }: { emp: any; size?: number }) {
  const name = fullName(emp);
  const color = stringToColor(name);
  const initial = initials(emp);

  return (
    <View
      style={[
        styles.avatarWrap,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: color,
        },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>
        {initial}
      </Text>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: "Active", color: C.success, bg: C.successLight },
    on_leave: { label: "On Leave", color: C.warning, bg: C.warningLight },
    suspended: { label: "Suspended", color: C.danger, bg: C.dangerLight },
    terminated: { label: "Terminated", color: C.textMuted, bg: C.surfaceAlt },
    resigned: { label: "Resigned", color: C.textMuted, bg: C.surfaceAlt },
  };
  const s = map[status] ?? {
    label: status ?? "—",
    color: C.textMuted,
    bg: C.surfaceAlt,
  };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <View style={[styles.dot, { backgroundColor: s.color }]} />
      <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    full_time: { label: "Full-Time", color: C.primary, bg: C.primaryLight },
    part_time: { label: "Part-Time", color: C.accent, bg: C.primaryLight },
    contract: { label: "Contract", color: C.warning, bg: C.warningLight },
    intern: { label: "Intern", color: C.purple, bg: C.primaryLight },
  };
  const t = map[type] ?? {
    label: type ?? "—",
    color: C.textMuted,
    bg: C.surfaceAlt,
  };
  return (
    <View style={[styles.typeBadge, { backgroundColor: t.bg }]}>
      <Text style={[styles.typeBadgeText, { color: t.color }]}>{t.label}</Text>
    </View>
  );
}

/* ─── Filter Sheet Component ──────────────────────────────── */
function FilterSheet({
  visible,
  filters,
  onChange,
  onClear,
  onClose,
}: {
  visible: boolean;
  filters: { status: string; type: string; department: string };
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  if (!visible) return null;

  const filterGroups = [
    {
      key: "status",
      label: "Status",
      options: [
        ["", "All Status"],
        ["active", "Active"],
        ["on_leave", "On Leave"],
        ["suspended", "Suspended"],
        ["terminated", "Terminated"],
      ],
    },
    {
      key: "type",
      label: "Type",
      options: [
        ["", "All Types"],
        ["full_time", "Full-Time"],
        ["part_time", "Part-Time"],
        ["contract", "Contract"],
        ["intern", "Intern"],
      ],
    },
  ];

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <View style={styles.filterSheet}>
      <View style={styles.filterHeader}>
        <Text style={styles.filterTitle}>Filters</Text>
        <Pressable onPress={onClose} style={styles.filterClose}>
          <X size={18} color={C.textSecondary} />
        </Pressable>
      </View>

      {filterGroups.map((group) => (
        <View key={group.key} style={styles.filterGroup}>
          <Text style={styles.filterGroupLabel}>{group.label}</Text>
          <View style={styles.filterOptions}>
            {group.options.map(([val, label]) => (
              <Pressable
                key={val}
                onPress={() => onChange(group.key, val)}
                style={[
                  styles.filterChip,
                  filters[group.key as keyof typeof filters] === val &&
                    styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filters[group.key as keyof typeof filters] === val &&
                      styles.filterChipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      {activeCount > 0 && (
        <Pressable onPress={onClear} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Clear all filters</Text>
        </Pressable>
      )}
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════ */
interface Props {
  onClose: () => void;
  onViewEmployee?: (id: string) => void;
  onAddEmployee?: () => void;
}

export default function EmployeeListView({
  onClose,
  onViewEmployee,
  onAddEmployee,
}: Props) {
  const insets = useSafeAreaInsets();

  const [employees, setEmployees] = useState<any[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortCol, setSortCol] = useState("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    department: "",
  });
  const [refreshing, setRefreshing] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // const fetchEmployees = useCallback(async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const result = await getEmployees({
  //       page,
  //       limit: pageSize,
  //       sort: sortCol,
  //       order: sortDir,
  //       ...(debouncedSearch ? { search: debouncedSearch } : {}),
  //       ...(filters.status ? { status: filters.status } : {}),
  //       ...(filters.type ? { type: filters.type } : {}),
  //       ...(filters.department ? { department: filters.department } : {}),
  //     });
  //     setEmployees(result.data ?? []);
  //     setMeta(
  //       result.meta ?? { total: 0, page: 1, limit: pageSize, totalPages: 1 },
  //     );
  //   } catch (err: any) {
  //     setError(
  //       err?.response?.data?.message ??
  //         err?.message ??
  //         "Failed to load employees.",
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [page, pageSize, sortCol, sortDir, debouncedSearch, filters]);
const fetchEmployees = useCallback(async () => {
  setLoading(true);
  setError(null);
  Loader.show();
  try {
    const result = await getEmployees({
      page,
      limit: pageSize,
      sort: sortCol,
      order: sortDir,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.department ? { department: filters.department } : {}),
    });
    setEmployees(result.data ?? []);
    setMeta(
      result.meta ?? { total: 0, page: 1, limit: pageSize, totalPages: 1 },
    );
  } catch (err: any) {
    setError(
      err?.response?.data?.message ??
        err?.message ??
        "Failed to load employees.",
    );
  } finally {
    setLoading(false);
    Loader.hide();
  }
}, [page, pageSize, sortCol, sortDir, debouncedSearch, filters]);
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEmployees();
    setRefreshing(false);
  }, [fetchEmployees]);

  const toggleSort = (col: string) => {
    if (!col) return;
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const renderEmployeeCard = ({
    item: emp,
    index,
  }: {
    item: any;
    index: number;
  }) => (
    <Pressable
      //   onPress={() => onViewEmployee?.(emp.id)}
      onPress={() => onViewEmployee?.(emp.id)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.cardHeader}>
        <Avatar emp={emp} size={44} />
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.cardName}>
            {emp.first_name} {emp.last_name}
          </Text>
          <Text style={styles.cardCode}>{emp.employee_code ?? "—"}</Text>
        </View>
        <StatusBadge status={emp.employment_status} />
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.cardDetail}>
          <Building2 size={12} color={C.textMuted} />
          <Text style={styles.cardDetailText}>
            {emp.department_name ?? "—"}
          </Text>
        </View>
        <View style={styles.cardDetail}>
          <Text style={styles.cardDetailText}>{emp.job_role_name ?? "—"}</Text>
        </View>
        <View style={styles.cardDetail}>
          <MapPin size={12} color={C.textMuted} />
          <Text style={styles.cardDetailText}>{emp.location ?? "—"}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TypeBadge type={emp.employment_type} />
        <View style={styles.cardActions}>
          <Pressable
            onPress={() => onViewEmployee?.(emp.id)}
            style={styles.cardActionBtn}
          >
            <Eye size={14} color={C.primary} />
          </Pressable>
          <Pressable
            style={[styles.cardActionBtn, styles.cardActionBtnSecondary]}
          >
            <Edit3 size={14} color={C.textSecondary} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Users size={48} color={C.textMuted} />
      <Text style={styles.emptyTitle}>No employees found</Text>
      <Text style={styles.emptyDesc}>
        {debouncedSearch
          ? "Try a different search term"
          : "Add your first employee to get started"}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <>
      {/* Stats summary */}
      <View style={styles.statsSummary}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{meta.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxActive]}>
          <Text style={[styles.statValue, styles.statValueActive]}>
            {employees.filter((e) => e.employment_status === "active").length}
          </Text>
          <Text style={[styles.statLabel, styles.statLabelActive]}>Active</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {employees.filter((e) => e.employment_status === "on_leave").length}
          </Text>
          <Text style={styles.statLabel}>On Leave</Text>
        </View>
      </View>

      {/* Search & Filter bar */}
      <View style={styles.searchBar}>
        <View
          style={[
            styles.searchInputWrap,
            search.length > 0 && styles.searchInputWrapFocused,
          ]}
        >
          <Search size={16} color={C.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, code, email…"
            placeholderTextColor={C.textMuted}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <X size={16} color={C.textMuted} />
            </Pressable>
          )}
        </View>

        <Pressable
          onPress={() => setFilterOpen((p) => !p)}
          style={[
            styles.filterBtn,
            filterOpen && styles.filterBtnActive,
            activeFilterCount > 0 && styles.filterBtnHasBadge,
          ]}
        >
          <SlidersHorizontal
            size={18}
            color={filterOpen ? C.primary : C.textSecondary}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>

        <Pressable onPress={fetchEmployees} style={styles.iconBtn}>
          <RefreshCw size={16} color={C.textMuted} />
        </Pressable>

        <Pressable onPress={onAddEmployee} style={styles.addBtn}>
          <UserPlus size={16} color="#fff" />
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      </View>

      {/* Filter sheet */}
      <FilterSheet
        visible={filterOpen}
        filters={filters}
        onChange={(key, val) => {
          setFilters((p) => ({ ...p, [key]: val }));
          setPage(1);
        }}
        onClear={() => {
          setFilters({ status: "", type: "", department: "" });
          setPage(1);
        }}
        onClose={() => setFilterOpen(false)}
      />

      {/* Error banner */}
      {error && (
        <View style={styles.errorBanner}>
          <AlertCircle size={16} color={C.danger} />
          <Text style={styles.errorBannerText}>{error}</Text>
          <Pressable onPress={fetchEmployees}>
            <RefreshCw size={14} color={C.danger} />
          </Pressable>
        </View>
      )}

      {/* Sort bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortBar}
      >
        {[
          { key: "created_at", label: "Date" },
          { key: "last_name", label: "Name" },
          { key: "department_name", label: "Dept" },
          { key: "job_role_name", label: "Role" },
        ].map((col) => (
          <Pressable
            key={col.key}
            onPress={() => toggleSort(col.key)}
            style={[
              styles.sortChip,
              sortCol === col.key && styles.sortChipActive,
            ]}
          >
            <Text
              style={[
                styles.sortChipText,
                sortCol === col.key && styles.sortChipTextActive,
              ]}
            >
              {col.label}
            </Text>
            {sortCol === col.key && (
              <Text style={styles.sortDirText}>
                {sortDir === "asc" ? "↑" : "↓"}
              </Text>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </>
  );

  const renderFooter = () => {
    if (loading || meta.totalPages <= 1) return null;

    return (
      <View style={styles.pagination}>
        <Pressable
          onPress={() => setPage((p) => Math.max(1, p - 1))}
          disabled={meta.page === 1}
          style={[styles.pageBtn, meta.page === 1 && styles.pageBtnDisabled]}
        >
          <ChevronLeft
            size={16}
            color={meta.page === 1 ? C.textMuted : C.textPrimary}
          />
        </Pressable>

        <View style={styles.pageNumbers}>
          {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
            const p =
              meta.totalPages <= 5
                ? i + 1
                : meta.page <= 3
                  ? i + 1
                  : meta.page >= meta.totalPages - 2
                    ? meta.totalPages - 4 + i
                    : meta.page - 2 + i;
            return (
              <Pressable
                key={p}
                onPress={() => setPage(p)}
                style={[
                  styles.pageNumber,
                  p === meta.page && styles.pageNumberActive,
                ]}
              >
                <Text
                  style={[
                    styles.pageNumberText,
                    p === meta.page && styles.pageNumberTextActive,
                  ]}
                >
                  {p}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
          disabled={meta.page === meta.totalPages}
          style={[
            styles.pageBtn,
            meta.page === meta.totalPages && styles.pageBtnDisabled,
          ]}
        >
          <ChevronRight
            size={16}
            color={meta.page === meta.totalPages ? C.textMuted : C.textPrimary}
          />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>All Employees</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? "Loading…" : `${meta.total} total`}
          </Text>
        </View>
        <Pressable style={styles.iconBtn}>
          <Download size={16} color={C.textMuted} />
        </Pressable>
      </View>

      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        renderItem={renderEmployeeCard}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmpty : null}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
          />
        }
      />

      {loading && employees.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

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

  /* Stats */
  statsSummary: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  statBoxActive: {
    backgroundColor: C.primaryLight,
    borderColor: C.primary + "33",
  },
  statValue: { fontSize: 20, fontWeight: "800", color: C.textPrimary },
  statValueActive: { color: C.primary },
  statLabel: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  statLabelActive: { color: C.primary, fontWeight: "700" },

  /* Search */
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  searchInputWrapFocused: {
    borderColor: C.primary,
    shadowColor: C.primary,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.textPrimary,
    paddingVertical: 0,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterBtnActive: {
    backgroundColor: C.primaryLight,
    borderColor: C.primary + "44",
  },
  filterBtnHasBadge: { position: "relative" },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.primary,
  },
  addBtnText: { fontSize: 13, fontWeight: "800", color: "#fff" },

  /* Filter sheet */
  filterSheet: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 12,
    gap: 14,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterTitle: { fontSize: 16, fontWeight: "800", color: C.textPrimary },
  filterClose: { padding: 4 },
  filterGroup: { gap: 8 },
  filterGroupLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterChipActive: {
    backgroundColor: C.primaryLight,
    borderColor: C.primary + "44",
  },
  filterChipText: { fontSize: 12, color: C.textSecondary },
  filterChipTextActive: { color: C.primary, fontWeight: "700" },
  clearBtn: {
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.dangerLight,
    alignItems: "center",
  },
  clearBtnText: { fontSize: 13, fontWeight: "700", color: C.danger },

  /* Error */
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.dangerLight,
    borderWidth: 1,
    borderColor: C.danger + "33",
    marginBottom: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: C.danger,
  },

  /* Sort */
  sortBar: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 4,
    marginBottom: 12,
  },
  sortChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  sortChipActive: {
    backgroundColor: C.primaryLight,
    borderColor: C.primary + "44",
  },
  sortChipText: { fontSize: 12, color: C.textSecondary },
  sortChipTextActive: { color: C.primary, fontWeight: "700" },
  sortDirText: { fontSize: 12, color: C.primary, fontWeight: "800" },

  /* Cards */
  listContent: { padding: 16, paddingBottom: 24 },
  card: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardHeaderInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: "700", color: C.textPrimary },
  cardCode: {
    fontSize: 12,
    color: C.textMuted,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginTop: 2,
  },
  cardDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  cardDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardDetailText: { fontSize: 12, color: C.textSecondary },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  cardActions: { flexDirection: "row", gap: 8 },
  cardActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  cardActionBtnSecondary: {
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },

  /* Badges */
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: "700" },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: { fontSize: 10, fontWeight: "700" },

  /* Avatar */
  avatarWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "800" },

  /* Empty */
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: C.textPrimary },
  emptyDesc: { fontSize: 13, color: C.textMuted, textAlign: "center" },

  /* Pagination */
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageNumbers: { flexDirection: "row", gap: 6 },
  pageNumber: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  pageNumberActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  pageNumberText: { fontSize: 13, fontWeight: "700", color: C.textSecondary },
  pageNumberTextActive: { color: "#fff" },

  /* Loading */
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg + "cc",
  },
});
