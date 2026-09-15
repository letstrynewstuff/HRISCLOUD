import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Package,
  Search,
  ChevronLeft,
  Plus,
  AlertTriangle,
  RotateCcw,
} from "lucide-react-native";
import C from "../../../styles/colors";
import { assetApi } from "../../../api/service/assetApi";
import AssetCard from "./AssetCard";
import CreateAssetModal from "./CreateAssetModal";
import AssignAssetModal from "./AssignAssetModal";
import ReturnAssetModal from "./ReturnAssetModal";
import RetireAssetModal from "./RetireAssetModal";
import AssetHistoryModal from "./AssetHistoryModal";

type Props = {
  onClose: () => void;
};

export default function AssetsListView({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [createVisible, setCreateVisible] = useState(false);
  const [assignAsset, setAssignAsset] = useState<any>(null);
  const [returnAsset, setReturnAsset] = useState<any>(null);
  const [retireAsset, setRetireAsset] = useState<any>(null);
  const [historyAsset, setHistoryAsset] = useState<any>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await assetApi.getAll({ search: search.trim() || undefined });
      setAssets(res.data ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load assets.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const filtered = assets.filter(
    (a) =>
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.assetTag?.toLowerCase().includes(search.toLowerCase()) ||
      a.serialNumber?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Asset Inventory</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchRow}>
          <Search size={14} color={C.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, tag or serial…"
            placeholderTextColor={C.textMuted}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <RotateCcw size={13} color={C.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={C.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <AlertTriangle size={18} color={C.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={load} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <Package size={44} color={C.textMuted} />
          <Text style={styles.emptyTitle}>No assets found</Text>
          <Text style={styles.emptySub}>
            {search
              ? "Try a different search term."
              : "Add your first asset to get started."}
          </Text>
          {!search && (
            <Pressable
              onPress={() => setCreateVisible(true)}
              style={styles.emptyCta}
            >
              <Plus size={14} color="#fff" />
              <Text style={styles.emptyCtaText}>Add Asset</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.primary}
            />
          }
        >
          <Text style={styles.resultsText}>
            {filtered.length} asset{filtered.length !== 1 ? "s" : ""}
          </Text>
          {filtered.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onAssign={setAssignAsset}
              onReturn={setReturnAsset}
              onRetire={setRetireAsset}
              onHistory={setHistoryAsset}
            />
          ))}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {/* FAB */}
      {!loading && !error && (
        <Pressable onPress={() => setCreateVisible(true)} style={styles.fab}>
          <Plus size={22} color="#fff" />
        </Pressable>
      )}

      {/* Modals */}
      <CreateAssetModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onSaved={() => {
          setCreateVisible(false);
          load();
        }}
      />
      <AssignAssetModal
        visible={!!assignAsset}
        asset={assignAsset}
        onClose={() => setAssignAsset(null)}
        onAssigned={() => {
          setAssignAsset(null);
          load();
        }}
      />
      <ReturnAssetModal
        visible={!!returnAsset}
        asset={returnAsset}
        onClose={() => setReturnAsset(null)}
        onReturned={() => {
          setReturnAsset(null);
          load();
        }}
      />
      <RetireAssetModal
        visible={!!retireAsset}
        asset={retireAsset}
        onClose={() => setRetireAsset(null)}
        onRetired={() => {
          setRetireAsset(null);
          load();
        }}
      />
      <AssetHistoryModal
        visible={!!historyAsset}
        asset={historyAsset}
        onClose={() => setHistoryAsset(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

  searchWrap: { paddingHorizontal: 16, paddingVertical: 12 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.textPrimary,
    paddingVertical: 0,
  },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  errorBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 24,
  },
  errorText: { fontSize: 14, color: C.danger, textAlign: "center" },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.primary,
  },
  retryText: { fontSize: 13, fontWeight: "700", color: "#fff" },

  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 24,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: C.textPrimary },
  emptySub: { fontSize: 13, color: C.textMuted, textAlign: "center" },
  emptyCta: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  emptyCtaText: { fontSize: 13, fontWeight: "700", color: "#fff" },

  listContent: { padding: 16, gap: 12 },
  resultsText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.textMuted,
    marginBottom: 4,
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: C.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
