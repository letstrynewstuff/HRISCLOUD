import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ArrowLeft,
  Package,
  Plus,
  Clock,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Calendar,
  Shield,
  MapPin,
} from "lucide-react-native";
import Toast from "react-native-toast-message";

import C from "../../styles/colors";
import Card from "../../components/ui/Card";
import AssetCard from "../../components/assets/AssetCard";
import RequestCard from "../../components/assets/RequestCard";
import { getCatMeta } from "../../components/assets/AssetMeta";
import AssetStatusBadge from "../../components/assets/AssetStatusBadge";
import BantaHRLetterLoader, {
  BantaHRLetterLoaderRef,
} from "../../components/BantaHRLetterLoader";

import { assetApi } from "../../api/service/assetApi";
import { authApi } from "../../api/service/authApi";

export default function AssetsScreen() {
  const insets = useSafeAreaInsets();
  const loaderRef = useRef<BantaHRLetterLoaderRef>(null);

  /* ── Data state ─────────────────────────────────────────── */
  const [profile, setProfile] = useState<any>(null);
  const [myAssets, setMyAssets] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  /* ── UI state ───────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState<"assets" | "request" | "history">(
    "assets",
  );
  const [detailAsset, setDetailAsset] = useState<any>(null);
  const [detailRequest, setDetailRequest] = useState<any>(null);

  /* ── Form state ─────────────────────────────────────────── */
  const [reqForm, setReqForm] = useState({
    category: "",
    name: "",
    reason: "",
    priority: "normal",
  });
  const [reqErrors, setReqErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  /* ── Derived ────────────────────────────────────────────── */
  const activeCount = myAssets.filter((a) => a.status === "assigned").length;
  const pendingCount = myRequests.filter((r) => r.status === "pending").length;

  const displayName = profile
    ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
    : "Employee";

  /* ── Load profile ───────────────────────────────────────── */
  useEffect(() => {
    authApi
      .getMe()
      .then((res) => setProfile(res.data ?? res))
      .catch(() => setProfile(null));
  }, []);

  /* ── Load assets & requests ─────────────────────────────── */
  const loadData = useCallback(async () => {
    setDataLoading(true);
    setError(null);
    try {
      const [assetsRes, requestsRes] = await Promise.all([
        assetApi.getMyAssets(),
        assetApi.getMyRequests(),
      ]);
      setMyAssets(assetsRes.data ?? []);
      setMyRequests(requestsRes.data ?? []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Failed to load asset data. Please refresh.",
      );
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    setCategories([
      { id: "laptop", name: "Laptop / Computer" },
      { id: "phone", name: "Phone / Tablet" },
      { id: "furniture", name: "Furniture / Desk" },
      { id: "electronics", name: "Electronics / Peripherals" },
      { id: "vehicle", name: "Vehicle" },
      { id: "other", name: "Other" },
    ]);
  }, []);

  useEffect(() => {
    (async () => {
      loaderRef.current?.show();
      try {
        await loadData();
      } finally {
        loaderRef.current?.hide();
      }
    })();
  }, [loadData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  /* ── Form logic ─────────────────────────────────────────── */
  const validateRequest = () => {
    const errs: Record<string, string> = {};
    if (!reqForm.category) errs.category = "Select a category";
    if (!reqForm.name.trim()) errs.name = "Enter asset name / description";
    if (!reqForm.reason.trim()) errs.reason = "Provide a reason";
    setReqErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRequestSubmit = async () => {
    if (!validateRequest()) return;
    setSubmitting(true);
    try {
      await assetApi.requestAsset({
        category: reqForm.category,
        name: reqForm.name.trim(),
        reason: reqForm.reason.trim(),
        priority: reqForm.priority,
      });
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Asset request submitted successfully.",
      });
      setReqForm({ category: "", name: "", reason: "", priority: "normal" });
      setReqErrors({});
      await loadData();
      setActiveTab("history");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to submit request.";
      Toast.show({
        type: "error",
        text1: "Error",
        text2: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Render helpers ─────────────────────────────────────── */
  const renderAssetsTab = () => {
    if (dataLoading) {
      return (
        <View style={styles.grid}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.skeletonCard} />
          ))}
        </View>
      );
    }
    if (myAssets.length === 0) {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Package size={24} color={C.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No assigned assets</Text>
          <Text style={styles.emptySubtitle}>
            Assets assigned to you by HR will appear here.
          </Text>
          <Pressable
            onPress={() => setActiveTab("request")}
            style={styles.emptyBtn}
          >
            <Text style={styles.emptyBtnText}>Request an Asset</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.grid}>
        {myAssets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onPress={() => setDetailAsset(asset)}
          />
        ))}
      </View>
    );
  };

  const renderRequestTab = () => (
    <Card padded style={styles.formCard}>
      <Text style={styles.formTitle}>Request an Asset</Text>
      <Text style={styles.formSubtitle}>
        Submit a request to HR. You'll be notified once reviewed.
      </Text>

      {/* Category */}
      <View style={styles.field}>
        <Text style={styles.label}>Category *</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setReqForm((f) => ({ ...f, category: cat.id }))}
              style={[
                styles.categoryChip,
                reqForm.category === cat.id && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  reqForm.category === cat.id && styles.categoryChipTextActive,
                ]}
                numberOfLines={1}
              >
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </View>
        {reqErrors.category && (
          <Text style={styles.errorText}>{reqErrors.category}</Text>
        )}
      </View>

      {/* Asset Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Asset Name / Description *</Text>
        <TextInput
          value={reqForm.name}
          onChangeText={(text) => setReqForm((f) => ({ ...f, name: text }))}
          placeholder="e.g. MacBook Pro M3, 16GB RAM"
          placeholderTextColor={C.textMuted}
          style={[
            styles.input,
            {
              borderColor: reqErrors.name
                ? C.danger
                : reqForm.name
                  ? C.primary
                  : C.border,
            },
          ]}
        />
        {reqErrors.name && (
          <Text style={styles.errorText}>{reqErrors.name}</Text>
        )}
      </View>

      {/* Priority */}
      <View style={styles.field}>
        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityRow}>
          {["low", "normal", "high"].map((p) => (
            <Pressable
              key={p}
              onPress={() => setReqForm((f) => ({ ...f, priority: p }))}
              style={[
                styles.priorityBtn,
                reqForm.priority === p && styles.priorityBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.priorityBtnText,
                  reqForm.priority === p && styles.priorityBtnTextActive,
                ]}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Reason */}
      <View style={styles.field}>
        <Text style={styles.label}>Reason *</Text>
        <TextInput
          value={reqForm.reason}
          onChangeText={(text) => setReqForm((f) => ({ ...f, reason: text }))}
          placeholder="Why do you need this asset?"
          placeholderTextColor={C.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          style={[
            styles.textarea,
            {
              borderColor: reqErrors.reason
                ? C.danger
                : reqForm.reason
                  ? C.primary
                  : C.border,
            },
          ]}
        />
        {reqErrors.reason && (
          <Text style={styles.errorText}>{reqErrors.reason}</Text>
        )}
      </View>

      {/* Submit */}
      <Pressable
        onPress={handleRequestSubmit}
        disabled={submitting}
        style={({ pressed }) => [
          styles.submitBtn,
          pressed && { opacity: 0.9 },
          submitting && { opacity: 0.7 },
        ]}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Plus size={15} color="#fff" />
            <Text style={styles.submitBtnText}>Submit Request</Text>
          </>
        )}
      </Pressable>
    </Card>
  );

  const renderHistoryTab = () => {
    if (dataLoading) {
      return (
        <View style={styles.list}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonRow} />
          ))}
        </View>
      );
    }
    if (myRequests.length === 0) {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Clock size={24} color={C.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No requests yet</Text>
          <Text style={styles.emptySubtitle}>
            Your asset request history will appear here.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.list}>
        {myRequests.map((req) => (
          <RequestCard
            key={req.id}
            request={req}
            onPress={() => setDetailRequest(req)}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backBtn}
        >
          <ArrowLeft size={18} color={C.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>My Assets</Text>
        <Pressable onPress={loadData} style={styles.backBtn}>
          <RefreshCw size={16} color={C.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={C.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconWrap}>
              <Package size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Asset Hub</Text>
              <Text style={styles.heroSubtitle}>
                {displayName} · {myAssets.length} asset
                {myAssets.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: "#A5F3FC" }]}>
                {dataLoading ? "—" : activeCount}
              </Text>
              <Text style={styles.statLabel}>Assigned</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: "#FDE68A" }]}>
                {dataLoading ? "—" : pendingCount}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBanner}>
            <AlertCircle size={16} color={C.danger} />
            <Text style={styles.errorBannerText}>{error}</Text>
            <Pressable onPress={loadData}>
              <Text style={styles.errorBannerRetry}>Retry</Text>
            </Pressable>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabBar}>
          {[
            { id: "assets" as const, label: "My Assets", icon: Package },
            { id: "request" as const, label: "Request", icon: Plus },
            { id: "history" as const, label: "History", icon: Clock },
          ].map(({ id, label, icon: Icon }) => (
            <Pressable
              key={id}
              onPress={() => setActiveTab(id)}
              style={[styles.tabBtn, activeTab === id && styles.tabBtnActive]}
            >
              <Icon
                size={14}
                color={activeTab === id ? "#fff" : C.textSecondary}
              />
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === id && styles.tabBtnTextActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === "assets" && renderAssetsTab()}
        {activeTab === "request" && renderRequestTab()}
        {activeTab === "history" && renderHistoryTab()}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  Asset Detail Modal                                   */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Modal
        visible={!!detailAsset}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailAsset(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setDetailAsset(null)}
          />
          <View style={styles.modalContent}>
            {detailAsset &&
              (() => {
                const meta = getCatMeta(detailAsset.category);
                const Icon = meta.icon;
                return (
                  <View style={styles.modalCard}>
                    <View
                      style={[styles.modalHeader, { backgroundColor: meta.bg }]}
                    >
                      <View style={styles.modalHeaderRow}>
                        <View style={styles.modalIconWrap}>
                          <Icon size={22} color={meta.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.modalTitle}>
                            {detailAsset.name}
                          </Text>
                          <Text style={styles.modalSubtitle}>
                            {detailAsset.brand} {detailAsset.model}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => setDetailAsset(null)}
                          style={styles.modalCloseBtn}
                        >
                          <X size={16} color={C.textSecondary} />
                        </Pressable>
                      </View>
                    </View>

                    <View style={styles.modalBody}>
                      <View style={styles.detailGrid}>
                        {[
                          { label: "Category", value: meta.label },
                          {
                            label: "Serial",
                            value: detailAsset.serialNumber ?? "—",
                          },
                          {
                            label: "Condition",
                            value: detailAsset.condition ?? "—",
                          },
                          {
                            label: "Location",
                            value: detailAsset.location ?? "—",
                          },
                          {
                            label: "Assigned",
                            value: detailAsset.assignedAt
                              ? new Date(
                                  detailAsset.assignedAt,
                                ).toLocaleDateString("en-NG", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—",
                          },
                          {
                            label: "Notes",
                            value: detailAsset.notes ?? "—",
                          },
                        ].map(({ label, value }) => (
                          <View key={label} style={styles.detailCell}>
                            <Text style={styles.detailLabel}>{label}</Text>
                            <Text style={styles.detailValue}>{value}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                );
              })()}
          </View>
        </View>
      </Modal>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  Request Detail Modal                                 */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Modal
        visible={!!detailRequest}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailRequest(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setDetailRequest(null)}
          />
          <View style={styles.modalContent}>
            {detailRequest && (
              <View style={styles.modalCard}>
                <View style={styles.modalCardHeader}>
                  <Text style={styles.modalCardTitle}>Request Details</Text>
                  <Pressable
                    onPress={() => setDetailRequest(null)}
                    style={styles.modalCloseBtnAlt}
                  >
                    <X size={15} color={C.textMuted} />
                  </Pressable>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.detailGrid}>
                    {[
                      {
                        label: "Asset",
                        value:
                          detailRequest.assetName ?? detailRequest.name ?? "—",
                      },
                      {
                        label: "Category",
                        value: getCatMeta(detailRequest.category).label,
                      },
                      {
                        label: "Priority",
                        value: detailRequest.priority ?? "normal",
                      },
                      {
                        label: "Submitted",
                        value: new Date(
                          detailRequest.createdAt,
                        ).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }),
                      },
                    ].map(({ label, value }) => (
                      <View key={label} style={styles.detailCell}>
                        <Text style={styles.detailLabel}>{label}</Text>
                        <Text style={styles.detailValue}>{value}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.reasonBox}>
                    <Text style={styles.detailLabel}>Reason</Text>
                    <Text style={styles.reasonText}>
                      {detailRequest.reason}
                    </Text>
                  </View>

                  {detailRequest.rejectionReason && (
                    <View style={styles.rejectionBox}>
                      <AlertCircle size={13} color={C.danger} />
                      <Text style={styles.rejectionText}>
                        {detailRequest.rejectionReason}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Global loader */}
      <BantaHRLetterLoader
        ref={loaderRef}
        overlay
        subtitle="Loading assets..."
      />
    </View>
  );
}

/* ═════════════════════════════════════════════════════════════ */
/*  Styles                                                     */
/* ═════════════════════════════════════════════════════════════ */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: C.textPrimary,
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 14,
    paddingBottom: 12,
  },

  /* Hero */
  hero: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: C.navy,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  heroSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  statBox: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.60)",
    marginTop: 2,
  },

  /* Error */
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    padding: 14,
    backgroundColor: C.dangerLight,
  },
  errorBannerText: {
    fontSize: 13,
    color: C.danger,
    flex: 1,
  },
  errorBannerRetry: {
    fontSize: 12,
    fontWeight: "700",
    color: C.danger,
  },

  /* Tabs */
  tabBar: {
    flexDirection: "row",
    gap: 1,
    padding: 1,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: C.primary,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.textSecondary,
  },
  tabBtnTextActive: {
    color: "#fff",
  },

  /* Grid / List */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  list: {
    gap: 10,
  },

  /* Skeletons */
  skeletonCard: {
    width: "48.5%",
    height: 150,
    borderRadius: 16,
    backgroundColor: C.surfaceAlt,
  },
  skeletonRow: {
    height: 72,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
  },

  /* Empty state */
  emptyState: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 36,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.textPrimary,
  },
  emptySubtitle: {
    fontSize: 12,
    color: C.textMuted,
    textAlign: "center",
  },
  emptyBtn: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  emptyBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },

  /* Form */
  formCard: {
    gap: 14,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.textPrimary,
  },
  formSubtitle: {
    fontSize: 12.5,
    color: C.textSecondary,
    marginTop: 1,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: C.textPrimary,
  },
  input: {
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: C.textPrimary,
  },
  textarea: {
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: C.textPrimary,
    minHeight: 80,
  },
  errorText: {
    fontSize: 11,
    color: C.danger,
    marginTop: 2,
  },

  /* Category chips */
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  categoryChipActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  categoryChipText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: C.textSecondary,
  },
  categoryChipTextActive: {
    color: "#fff",
  },

  /* Priority */
  priorityRow: {
    flexDirection: "row",
    gap: 8,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  priorityBtnActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  priorityBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textSecondary,
  },
  priorityBtnTextActive: {
    color: "#fff",
  },

  /* Submit */
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: C.primary,
    marginTop: 4,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },

  /* Modals */
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalContent: {
    width: "90%",
    maxWidth: 380,
  },
  modalCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.border,
  },
  modalHeader: {
    padding: 16,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  modalBody: {
    padding: 16,
  },
  modalCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.textPrimary,
  },
  modalCloseBtnAlt: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: C.surfaceAlt,
  },

  /* Detail grid inside modals */
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  detailCell: {
    width: "47%",
    backgroundColor: C.surfaceAlt,
    borderRadius: 12,
    padding: 12,
  },
  detailLabel: {
    fontSize: 10,
    color: C.textMuted,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textPrimary,
  },

  /* Reason & rejection */
  reasonBox: {
    backgroundColor: C.surfaceAlt,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  reasonText: {
    fontSize: 13,
    color: C.textPrimary,
    lineHeight: 18,
    marginTop: 2,
  },
  rejectionBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: C.dangerLight,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  rejectionText: {
    fontSize: 12,
    color: C.danger,
    flex: 1,
    lineHeight: 17,
  },
});
