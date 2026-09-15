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
  History,
  ChevronLeft,
  AlertTriangle,
  Clock,
  Users,
  RotateCcw,
  Trash2,
  Wrench,
  AlertCircle,
} from "lucide-react-native";
import C from "../../../styles/colors";
import { assetApi } from "../../../api/service/assetApi";

type Props = {
  onClose: () => void;
};

const ACTION_META: Record<
  string,
  { icon: any; color: string; bg: string; label: string }
> = {
  created: {
    icon: AlertCircle,
    color: C.primary,
    bg: C.primaryLight,
    label: "Created",
  },
  assigned: {
    icon: Users,
    color: C.success,
    bg: C.successLight,
    label: "Assigned",
  },
  returned: {
    icon: RotateCcw,
    color: "#B45309",
    bg: "#FEF3C7",
    label: "Returned",
  },
  retired: {
    icon: Trash2,
    color: C.danger,
    bg: C.dangerLight,
    label: "Retired",
  },
  repaired: {
    icon: Wrench,
    color: C.textMuted,
    bg: C.surfaceAlt,
    label: "Repaired",
  },
};

export default function ActivityLogView({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = (await assetApi.getActivity?.()) ?? { data: [] };
      setLogs(res.data ?? []);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load activity.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Activity Log</Text>
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
      ) : logs.length === 0 ? (
        <View style={styles.emptyBox}>
          <Clock size={44} color={C.textMuted} />
          <Text style={styles.emptyTitle}>No activity yet</Text>
          <Text style={styles.emptySub}>
            Asset assignments, returns and changes will appear here.
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
          {logs.map((item, i) => {
            const meta = ACTION_META[item.action] ?? ACTION_META.created;
            const Icon = meta.icon;
            return (
              <View key={item.id ?? i} style={styles.row}>
                <View style={[styles.dot, { backgroundColor: meta.bg }]}>
                  <Icon size={14} color={meta.color} />
                </View>
                <View style={styles.content}>
                  <View style={styles.topLine}>
                    <Text style={styles.action}>{meta.label}</Text>
                    <Text style={styles.date}>
                      {new Date(item.createdAt).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                  <Text style={styles.assetName}>
                    {item.assetName ?? item.asset?.name}
                  </Text>
                  {item.employeeName && (
                    <Text style={styles.meta}>
                      Employee: {item.employeeName}
                    </Text>
                  )}
                  {item.notes && <Text style={styles.meta}>{item.notes}</Text>}
                </View>
              </View>
            );
          })}
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

  listContent: { padding: 16, gap: 4 },
  row: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1, gap: 2 },
  topLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  action: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  date: { fontSize: 11, color: C.textMuted },
  assetName: { fontSize: 12.5, color: C.textSecondary },
  meta: { fontSize: 11.5, color: C.textMuted },
});
