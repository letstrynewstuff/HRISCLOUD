


// src/app/admin/benefits.tsx
// Benefits management hub — list, filter, create, assign, insurance banner.
// Header + hero banner styled to match training.tsx pattern exactly.

import { useState, useEffect, useCallback, useMemo } from "react";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Heart,
  Plus,
  Search,
  ChevronLeft,
  AlertTriangle,
  RefreshCw,
  X,
} from "lucide-react-native";

import C from "../../styles/colors";
import { benefitsApi } from "../../api/service/benefitsApi";
import BenefitsToast from "../../components/admin/benefits/BenefitsToast";
import { Loader } from "../../hooks/loaderManager";

// ─── Inline benefit type config (no external file needed) ─────
const BENEFIT_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: string }
> = {
  health: { label: "Health", color: "#EF4444", bg: "#FEE2E2", icon: "heart" },
  dental: { label: "Dental", color: "#3B82F6", bg: "#DBEAFE", icon: "smile" },
  vision: { label: "Vision", color: "#8B5CF6", bg: "#EDE9FE", icon: "eye" },
  life: { label: "Life", color: "#10B981", bg: "#D1FAE5", icon: "shield" },
  retirement: {
    label: "Retirement",
    color: "#F59E0B",
    bg: "#FEF3C7",
    icon: "landmark",
  },
  wellness: {
    label: "Wellness",
    color: "#EC4899",
    bg: "#FCE7F3",
    icon: "activity",
  },
  other: { label: "Other", color: "#64748B", bg: "#F1F5F9", icon: "box" },
};

function getBenefitTypeConfig(type: string) {
  return (
    BENEFIT_TYPE_CONFIG[type?.toLowerCase()] ?? BENEFIT_TYPE_CONFIG.other
  );
}

// ─── Stub components (replace with your real ones) ───────────
function InsuranceBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <View
      style={{
        padding: 14,
        borderRadius: 16,
        backgroundColor: C.primaryLight,
        borderWidth: 1,
        borderColor: C.primary + "33",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          backgroundColor: C.primary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Heart size={18} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: C.primary }}>
          Insurance Partner
        </Text>
        <Text style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>
          Explore group insurance plans for your team.
        </Text>
      </View>
      <Pressable onPress={onDismiss}>
        <X size={16} color={C.textMuted} />
      </Pressable>
    </View>
  );
}

function BenefitCard({
  benefit,
  onAssign,
}: {
  benefit: any;
  onAssign: () => void;
}) {
  const cfg = getBenefitTypeConfig(benefit.type);
  return (
    <View
      style={{
        padding: 14,
        borderRadius: 18,
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.border,
        marginBottom: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginBottom: 8,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: cfg.bg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Heart size={16} color={cfg.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 14, fontWeight: "700", color: C.textPrimary }}
          >
            {benefit.name}
          </Text>
          <Text style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>
            {benefit.provider ?? "No provider"}
          </Text>
        </View>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 8,
            backgroundColor: cfg.bg,
          }}
        >
          <Text
            style={{ fontSize: 10, fontWeight: "700", color: cfg.color }}
          >
            {cfg.label}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={onAssign}
        style={{
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 10,
          backgroundColor: C.primaryLight,
        }}
      >
        <Plus size={12} color={C.primary} />
        <Text style={{ fontSize: 11, fontWeight: "700", color: C.primary }}>
          Assign
        </Text>
      </Pressable>
    </View>
  );
}

function CreateBenefitModal({
  visible,
  onClose,
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  onSaved: (b: any) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("health");
  const [provider, setProvider] = useState("");
  const [saving, setSaving] = useState(false);

  if (!visible) return null;

  const handleCreate = async () => {
    setSaving(true);
    Loader.show();
    try {
      // Replace with actual API call when ready:
      // const res = await benefitsApi.create({ name, type, provider });
      const payload = {
        id: Math.random().toString(36).slice(2),
        name,
        type,
        provider,
        created_at: new Date().toISOString(),
      };
      onSaved(payload);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
      Loader.hide();
    }
  };

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          zIndex: 50,
        },
      ]}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 360,
          backgroundColor: C.surface,
          borderRadius: 24,
          padding: 20,
          borderWidth: 1,
          borderColor: C.border,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "800",
            color: C.textPrimary,
            marginBottom: 16,
          }}
        >
          Create Benefit
        </Text>

        <Text style={{ fontSize: 12, fontWeight: "700", color: C.textPrimary, marginBottom: 6 }}>
          Name
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Premium Health Plan"
          placeholderTextColor={C.textMuted}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 14,
            backgroundColor: C.surfaceAlt,
            borderWidth: 1.5,
            borderColor: C.border,
            color: C.textPrimary,
            fontSize: 14,
            marginBottom: 12,
          }}
        />

        <Text style={{ fontSize: 12, fontWeight: "700", color: C.textPrimary, marginBottom: 6 }}>
          Type
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, marginBottom: 12 }}
        >
          {Object.entries(BENEFIT_TYPE_CONFIG).map(([key, cfg]) => (
            <Pressable
              key={key}
              onPress={() => setType(key)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 12,
                backgroundColor: type === key ? cfg.color : cfg.bg,
                borderWidth: 1,
                borderColor: type === key ? cfg.color : C.border,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: type === key ? "#fff" : cfg.color,
                }}
              >
                {cfg.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={{ fontSize: 12, fontWeight: "700", color: C.textPrimary, marginBottom: 6 }}>
          Provider
        </Text>
        <TextInput
          value={provider}
          onChangeText={setProvider}
          placeholder="e.g. AXA Mansard"
          placeholderTextColor={C.textMuted}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 14,
            backgroundColor: C.surfaceAlt,
            borderWidth: 1.5,
            borderColor: C.border,
            color: C.textPrimary,
            fontSize: 14,
            marginBottom: 20,
          }}
        />

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={onClose}
            disabled={saving}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 14,
              alignItems: "center",
              backgroundColor: C.surfaceAlt,
              borderWidth: 1,
              borderColor: C.border,
              opacity: saving ? 0.6 : 1,
            }}
          >
            <Text
              style={{ fontSize: 14, fontWeight: "700", color: C.textSecondary }}
            >
              Cancel
            </Text>
          </Pressable>
          <Pressable
            onPress={handleCreate}
            disabled={saving || !name.trim()}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 14,
              alignItems: "center",
              backgroundColor: C.primary,
              opacity: saving || !name.trim() ? 0.6 : 1,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#fff" }}>
              {saving ? "Creating…" : "Create"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function AssignBenefitModal({
  visible,
  benefit,
  onClose,
  onAssigned,
}: {
  visible: boolean;
  benefit: any;
  onClose: () => void;
  onAssigned: () => void;
}) {
  const [assigning, setAssigning] = useState(false);

  if (!visible || !benefit) return null;

  const handleAssign = async () => {
    setAssigning(true);
    Loader.show();
    try {
      // Replace with actual API call when ready:
      // await benefitsApi.assign(benefit.id, employeeIds);
      onAssigned();
    } catch (err) {
      console.error(err);
    } finally {
      setAssigning(false);
      Loader.hide();
    }
  };

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          zIndex: 50,
        },
      ]}
    >
      <View
        style={{
          width: "100%",
          maxWidth: 360,
          backgroundColor: C.surface,
          borderRadius: 24,
          padding: 20,
          borderWidth: 1,
          borderColor: C.border,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "800",
            color: C.textPrimary,
            marginBottom: 8,
          }}
        >
          Assign Benefit
        </Text>
        <Text style={{ fontSize: 13, color: C.textSecondary, marginBottom: 20 }}>
          Assign <Text style={{ fontWeight: "700" }}>{benefit.name}</Text> to
          employees.
        </Text>

        <Pressable
          onPress={handleAssign}
          disabled={assigning}
          style={{
            paddingVertical: 12,
            borderRadius: 14,
            alignItems: "center",
            backgroundColor: C.primary,
            opacity: assigning ? 0.6 : 1,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "800", color: "#fff" }}>
            {assigning ? "Assigning…" : "Confirm Assignment"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ════════════════════ MAIN SCREEN ════════════════════
export default function AdminBenefitsScreen() {
  const insets = useSafeAreaInsets();

  const [benefits, setBenefits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<any | null>(null);
  const [showInsuranceAd, setShowInsuranceAd] = useState(true);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") =>
    setToast({ msg, type });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    Loader.show();
    try {
      const res = await benefitsApi.getAll();
      setBenefits(res.data ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load benefits.");
    } finally {
      setLoading(false);
      Loader.hide();
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Loader.show();
    try {
      await load();
    } finally {
      setRefreshing(false);
      Loader.hide();
    }
  }, [load]);

  const handleCreated = (benefit: any) => {
    setBenefits((prev) => [benefit, ...prev]);
    setCreateOpen(false);
    showToast("Benefit created successfully.");
  };

  const filtered = useMemo(() => {
    return benefits.filter((b) => {
      const q = search.toLowerCase();
      const matchS =
        !q ||
        b.name?.toLowerCase().includes(q) ||
        b.provider?.toLowerCase().includes(q);
      const matchT =
        typeFilter === "all" || b.type?.toLowerCase() === typeFilter;
      return matchS && matchT;
    });
  }, [benefits, search, typeFilter]);

  const renderHeader = () => (
    <>
      {/* ── Hero Banner ── */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroIconWrap}>
            <Heart size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.heroTitle}>Benefits</Text>
            <Text style={styles.heroSubtitle}>
              Health • Wellness • Retirement
            </Text>
          </View>
        </View>
      </View>

      {showInsuranceAd && (
        <View style={{ marginBottom: 16 }}>
          <InsuranceBanner onDismiss={() => setShowInsuranceAd(false)} />
        </View>
      )}

      <View style={styles.searchBar}>
        <View style={styles.searchInputWrap}>
          <Search size={16} color={C.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search benefits…"
            placeholderTextColor={C.textMuted}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <X size={16} color={C.textMuted} />
            </Pressable>
          )}
        </View>
        <Pressable onPress={load} style={styles.iconBtn}>
          <RefreshCw size={16} color={C.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {["all", ...Object.keys(BENEFIT_TYPE_CONFIG)].map((t) => {
          const active = typeFilter === t;
          const cfg = t === "all" ? null : getBenefitTypeConfig(t);
          return (
            <Pressable
              key={t}
              onPress={() => setTypeFilter(t)}
              style={[
                styles.chip,
                {
                  backgroundColor: active
                    ? t === "all"
                      ? C.primary
                      : cfg!.color
                    : C.surface,
                  borderColor: active
                    ? t === "all"
                      ? C.primary
                      : cfg!.color
                    : C.border,
                },
              ]}
            >
              <Text style={[styles.chipText, active && { color: "#fff" }]}>
                {t === "all" ? "All Types" : cfg!.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {error && (
        <View style={styles.errorBanner}>
          <AlertTriangle size={15} color={C.danger} />
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
      <Heart size={40} color={C.textMuted} />
      <Text style={styles.emptyTitle}>No benefits found</Text>
      <Pressable onPress={() => setCreateOpen(true)} style={styles.emptyBtn}>
        <Plus size={14} color="#fff" />
        <Text style={styles.emptyBtnText}>Create First Benefit</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header — matches training.tsx exactly */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Benefits</Text>
          <Text style={styles.headerSubtitle}>
            {loading ? "Loading…" : `${filtered.length} benefits`}
          </Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BenefitCard benefit={item} onAssign={() => setAssignTarget(item)} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmpty : null}
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

      {loading && benefits.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      )}

      <CreateBenefitModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={handleCreated}
      />

      <AssignBenefitModal
        visible={!!assignTarget}
        benefit={assignTarget}
        onClose={() => setAssignTarget(null)}
        onAssigned={() => {
          setAssignTarget(null);
          showToast("Benefit assigned successfully.");
        }}
      />

      {toast && (
        <BenefitsToast
          msg={toast.msg}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Header — matches training.tsx exactly
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

  // Hero banner — matches training.tsx
  hero: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: C.navy,
    marginBottom: 16,
  },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  heroTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  heroSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 },

  listContent: { padding: 16, paddingBottom: 24 },

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

  chipRow: { flexDirection: "row", gap: 8, paddingBottom: 14 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 11, fontWeight: "700", color: C.textSecondary },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.dangerLight,
    borderWidth: 1,
    borderColor: C.danger + "33",
    marginBottom: 14,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: C.danger,
  },

  emptyState: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: C.textPrimary },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  emptyBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg + "cc",
  },
});