import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FileText,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Package,
} from "lucide-react-native";
import C from "../../../styles/colors";
import { assetApi } from "../../../api/service/assetApi";

type Props = {
  onClose: () => void;
};

export default function AssetRequestsView({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await assetApi.getRequests();
      setRequests(res.data ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load requests.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      await assetApi.approveRequest(id);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Failed to approve.");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionId(id);
    try {
      await assetApi.rejectRequest(id);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Failed to reject.");
    } finally {
      setActionId(null);
    }
  };

  const pending = requests.filter((r) => r.status === "pending");
  const processed = requests.filter((r) => r.status !== "pending");

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Asset Requests</Text>
        <View style={{ width: 36 }} />
      </View>

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
      ) : requests.length === 0 ? (
        <View style={styles.emptyBox}>
          <FileText size={44} color={C.textMuted} />
          <Text style={styles.emptyTitle}>No requests yet</Text>
          <Text style={styles.emptySub}>
            Employee asset requests will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={C.primary}
            />
          }
        >
          {pending.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>
                Pending ({pending.length})
              </Text>
              {pending.map((req) => (
                <View key={req.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIconWrap}>
                      <Package size={16} color={C.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>
                        {req.assetName ?? req.name}
                      </Text>
                      <Text style={styles.cardMeta}>
                        {req.employeeName} · {req.category}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: C.warningLight },
                      ]}
                    >
                      <Text style={[styles.badgeText, { color: C.warning }]}>
                        Pending
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardReason}>{req.reason}</Text>
                  <View style={styles.cardActions}>
                    <Pressable
                      onPress={() => handleReject(req.id)}
                      disabled={actionId === req.id}
                      style={[styles.actionBtn, styles.rejectBtn]}
                    >
                      {actionId === req.id ? (
                        <ActivityIndicator size="small" color={C.danger} />
                      ) : (
                        <>
                          <XCircle size={14} color={C.danger} />
                          <Text
                            style={[styles.actionText, { color: C.danger }]}
                          >
                            Reject
                          </Text>
                        </>
                      )}
                    </Pressable>
                    <Pressable
                      onPress={() => handleApprove(req.id)}
                      disabled={actionId === req.id}
                      style={[styles.actionBtn, styles.approveBtn]}
                    >
                      {actionId === req.id ? (
                        <ActivityIndicator size="small" color={C.success} />
                      ) : (
                        <>
                          <CheckCircle2 size={14} color={C.success} />
                          <Text
                            style={[styles.actionText, { color: C.success }]}
                          >
                            Approve
                          </Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                </View>
              ))}
            </>
          )}

          {processed.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
                History
              </Text>
              {processed.map((req) => (
                <View key={req.id} style={[styles.card, { opacity: 0.85 }]}>
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.cardIconWrap,
                        { backgroundColor: C.surfaceAlt },
                      ]}
                    >
                      <Clock size={16} color={C.textMuted} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>
                        {req.assetName ?? req.name}
                      </Text>
                      <Text style={styles.cardMeta}>
                        {req.employeeName} · {req.category}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor:
                            req.status === "approved"
                              ? C.successLight
                              : C.dangerLight,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          {
                            color:
                              req.status === "approved" ? C.success : C.danger,
                          },
                        ]}
                      >
                        {req.status[0].toUpperCase() + req.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardReason}>{req.reason}</Text>
                </View>
              ))}
            </>
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
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

  listContent: { padding: 16, gap: 12 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 10,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  cardTitle: { fontSize: 14, fontWeight: "700", color: C.textPrimary, flex: 1 },
  cardMeta: { fontSize: 11, color: C.textMuted, marginTop: 1 },
  cardReason: { fontSize: 12.5, color: C.textSecondary, lineHeight: 18 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 10, fontWeight: "700" },

  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  rejectBtn: {
    backgroundColor: C.dangerLight,
    borderColor: "rgba(239,68,68,0.15)",
  },
  approveBtn: {
    backgroundColor: C.successLight,
    borderColor: "rgba(16,185,129,0.15)",
  },
  actionText: { fontSize: 12, fontWeight: "700" },
});
