

// src/components/admin/reports/ReportsListView.tsx
// Updated to add a hero banner after the header (icon + title + stat pills),
// matching the pattern used on DepartmentListView / the employees hub —
// replaces the old plain statBox row with the same navy hero treatment.

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ShieldAlert,
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  UserCheck,
} from "lucide-react-native";

import C from "../../../styles/colors";
import { reportApi } from "../../../api/service/reportApi";
import {
  CATEGORY_OPTIONS,
  SEVERITY_OPTIONS,
  STATUS_OPTIONS,
  CategoryPill,
  SeverityBadge,
  StatusBadge,
  ReportAvatar,
  getInitials,
  fmtDate,
} from "./reportShared";
import { Loader } from "../../../hooks/loaderManager";

interface Props {
  onClose: () => void;
  onViewReport: (id: string) => void;
}

const PAGE_SIZE = 15;

export default function ReportsListView({ onClose, onViewReport }: Props) {
  const insets = useSafeAreaInsets();

  const [reports, setReports] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const params: Record<string, any> = { page, limit: PAGE_SIZE };
//       if (search) params.search = search;
//       if (status) params.status = status;
//       if (category) params.category = category;
//       if (severity) params.severity = severity;

//       const [listRes, statsRes] = await Promise.all([
//         reportApi.list(params),
//         reportApi.getStats().catch(() => null),
//       ]);
//       setReports(listRes.data ?? []);
//       setMeta(listRes.meta ?? { total: 0, totalPages: 1 });
//       if (statsRes) setStats(statsRes.data ?? statsRes);
//     } catch (err: any) {
//       setError(
//         err?.response?.data?.message ??
//           err?.message ??
//           "Failed to load reports.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [page, search, status, category, severity]);

const load = useCallback(async () => {
  setLoading(true);
  setError(null);
  Loader.show();
  try {
    const params: Record<string, any> = { page, limit: PAGE_SIZE };
    if (search) params.search = search;
    if (status) params.status = status;
    if (category) params.category = category;
    if (severity) params.severity = severity;

    const [listRes, statsRes] = await Promise.all([
      reportApi.list(params),
      reportApi.getStats().catch(() => null),
    ]);
    setReports(listRes.data ?? []);
    setMeta(listRes.meta ?? { total: 0, totalPages: 1 });
    if (statsRes) setStats(statsRes.data ?? statsRes);
  } catch (err: any) {
    setError(
      err?.response?.data?.message ?? err?.message ?? "Failed to load reports.",
    );
  } finally {
    setLoading(false);
    Loader.hide();
  }
}, [page, search, status, category, severity]); 
useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, status, category, severity]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const activeFilterCount = [category, severity].filter(Boolean).length;

  const awaitingReview = (stats?.byStatus?.submitted ?? 0) + (stats?.byStatus?.under_review ?? 0);
  const highCritical = (stats?.bySeverity?.critical ?? 0) + (stats?.bySeverity?.high ?? 0);
  const resolvedCount = stats?.byStatus?.resolved ?? 0;

  const renderCard = ({ item: r }: { item: any }) => (
    <Pressable
      onPress={() => onViewReport(r.id)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.cardTop}>
        <CategoryPill category={r.category} />
        <View style={{ marginLeft: "auto", flexDirection: "row", gap: 6 }}>
          <SeverityBadge severity={r.severity} />
          <StatusBadge status={r.status} />
        </View>
      </View>

      <Text style={styles.subject} numberOfLines={1}>
        {r.subject}
      </Text>
      <Text style={styles.desc} numberOfLines={2}>
        {r.description}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.reporterRow}>
          <ReportAvatar
            initials={getInitials(r.reporter?.name)}
            anonymous={!r.reporter}
            size={24}
          />
          <Text style={styles.reporterText} numberOfLines={1}>
            {r.reporter?.name ?? "Anonymous"}
          </Text>
        </View>
        <Text style={styles.dateText}>{fmtDate(r.createdAt)}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.refCode}>{r.referenceCode}</Text>
        {r.assignedTo ? (
          <View style={styles.assignedChip}>
            <UserCheck size={10} color={C.primary} />
            <Text style={styles.assignedText} numberOfLines={1}>
              {r.assignedTo.name ?? "Assigned"}
            </Text>
          </View>
        ) : (
          <View style={styles.unassignedChip}>
            <Text style={styles.unassignedText}>Unassigned</Text>
          </View>
        )}
      </View>
    </Pressable>
  );

  const renderHeader = () => (
    <>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroIconWrap}>
            <ShieldAlert size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Reports</Text>
            <Text style={styles.heroSubtitle}>
              {loading ? "Loading…" : `${meta.total} total · handled in confidence`}
            </Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          {[
            { label: "Awaiting Review", value: awaitingReview, icon: Clock },
            { label: "High / Critical", value: highCritical, icon: ShieldAlert },
            { label: "Resolved", value: resolvedCount, icon: CheckCircle2 },
          ].map((st) => (
            <View key={st.label} style={styles.statPill}>
              <st.icon size={13} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statPillValue}>{st.value}</Text>
              <Text style={styles.statPillLabel}>{st.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.searchBar}>
        <View style={styles.searchInputWrap}>
          <Search size={16} color={C.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search subject, description…"
            placeholderTextColor={C.textMuted}
            style={styles.searchInput}
          />
        </View>
        <Pressable
          onPress={() => setFilterOpen((p) => !p)}
          style={[
            styles.iconBtn,
            filterOpen && {
              backgroundColor: C.primaryLight,
              borderColor: C.primary + "44",
            },
          ]}
        >
          <SlidersHorizontal
            size={17}
            color={filterOpen ? C.primary : C.textSecondary}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
        <Pressable onPress={load} style={styles.iconBtn}>
          <RefreshCw size={16} color={C.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statusRow}
      >
        {["", ...STATUS_OPTIONS.map((o) => o.value)].map((st) => (
          <Pressable
            key={st || "all"}
            onPress={() => setStatus(st)}
            style={[
              styles.statusChip,
              status === st && styles.statusChipActive,
            ]}
          >
            <Text
              style={[
                styles.statusChipText,
                status === st && styles.statusChipTextActive,
              ]}
            >
              {st ? STATUS_OPTIONS.find((o) => o.value === st)?.label : "All"}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {filterOpen && (
        <View style={styles.filterSheet}>
          <Text style={styles.filterGroupLabel}>Category</Text>
          <View style={styles.filterOptions}>
            <Pressable
              onPress={() => setCategory("")}
              style={[styles.filterChip, !category && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  !category && styles.filterChipTextActive,
                ]}
              >
                All
              </Text>
            </Pressable>
            {CATEGORY_OPTIONS.map((c) => (
              <Pressable
                key={c.value}
                onPress={() => setCategory(c.value)}
                style={[
                  styles.filterChip,
                  category === c.value && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    category === c.value && styles.filterChipTextActive,
                  ]}
                >
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.filterGroupLabel, { marginTop: 10 }]}>
            Severity
          </Text>
          <View style={styles.filterOptions}>
            <Pressable
              onPress={() => setSeverity("")}
              style={[styles.filterChip, !severity && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  !severity && styles.filterChipTextActive,
                ]}
              >
                All
              </Text>
            </Pressable>
            {SEVERITY_OPTIONS.map((sv) => (
              <Pressable
                key={sv.value}
                onPress={() => setSeverity(sv.value)}
                style={[
                  styles.filterChip,
                  severity === sv.value && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    severity === sv.value && styles.filterChipTextActive,
                  ]}
                >
                  {sv.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <AlertCircle size={16} color={C.danger} />
          <Text style={styles.errorBannerText}>{error}</Text>
          <Pressable onPress={load}>
            <RefreshCw size={14} color={C.danger} />
          </Pressable>
        </View>
      )}
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <ShieldAlert size={44} color={C.textMuted} />
      <Text style={styles.emptyTitle}>No reports found</Text>
      <Text style={styles.emptyDesc}>
        {search || activeFilterCount > 0 || status
          ? "Try a different search or filter"
          : "Employee reports will appear here"}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (loading || meta.totalPages <= 1) return null;
    return (
      <View style={styles.pagination}>
        <Pressable
          onPress={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
        >
          <ChevronLeft
            size={16}
            color={page === 1 ? C.textMuted : C.textPrimary}
          />
        </Pressable>
        <Text style={styles.pageIndicator}>
          {page} / {meta.totalPages}
        </Text>
        <Pressable
          onPress={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
          disabled={page === meta.totalPages}
          style={[
            styles.pageBtn,
            page === meta.totalPages && styles.pageBtnDisabled,
          ]}
        >
          <ChevronRight
            size={16}
            color={page === meta.totalPages ? C.textMuted : C.textPrimary}
          />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Reports</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? "Loading…" : `${meta.total} reports`}
          </Text>
        </View>
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
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

      {loading && reports.length === 0 && (
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

  listContent: { padding: 16, paddingBottom: 24 },

  // ── Hero ──
  hero: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: C.navy,
    gap: 14,
    marginBottom: 14,
  },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    fontFamily: Platform.OS === "ios" ? "Sora" : "sans-serif",
  },
  heroSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 8 },
  statPill: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    gap: 4,
  },
  statPillValue: { fontSize: 16, fontWeight: "800", color: "#fff" },
  statPillLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

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
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.textPrimary,
    paddingVertical: 0,
  },
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
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },

  statusRow: { flexDirection: "row", gap: 8, paddingBottom: 12 },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  statusChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  statusChipText: { fontSize: 11, fontWeight: "700", color: C.textSecondary },
  statusChipTextActive: { color: "#fff" },

  filterSheet: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 12,
  },
  filterGroupLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  filterOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
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
  filterChipText: { fontSize: 11, color: C.textSecondary },
  filterChipTextActive: { color: C.primary, fontWeight: "700" },

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

  card: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
    gap: 8,
  },
  cardTop: { flexDirection: "row", alignItems: "center" },
  subject: { fontSize: 13, fontWeight: "800", color: C.textPrimary },
  desc: { fontSize: 11, color: C.textSecondary, lineHeight: 16 },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reporterRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  reporterText: { fontSize: 11, color: C.textSecondary, flexShrink: 1 },
  dateText: { fontSize: 10, color: C.textMuted },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  refCode: { fontSize: 10, color: C.textMuted, fontFamily: "monospace" },
  assignedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: C.primaryLight,
    maxWidth: 140,
  },
  assignedText: { fontSize: 10, fontWeight: "700", color: C.primary },
  unassignedChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: C.surfaceAlt,
  },
  unassignedText: { fontSize: 10, fontWeight: "600", color: C.textMuted },

  emptyState: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: C.textPrimary },
  emptyDesc: { fontSize: 13, color: C.textMuted, textAlign: "center" },

  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
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
  pageIndicator: { fontSize: 12, fontWeight: "700", color: C.textSecondary },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg + "cc",
  },
});