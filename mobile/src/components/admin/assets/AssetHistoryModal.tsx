import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {
  History,
  X,
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
  visible: boolean;
  asset: any;
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

export default function AssetHistoryModal({ visible, asset, onClose }: Props) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible && asset) {
      setLoading(true);
      assetApi
        .getHistory(asset.id)
        .then((res) => setHistory(res.data ?? []))
        .catch(() => setError("Failed to load history."))
        .finally(() => setLoading(false));
    }
  }, [visible, asset]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[styles.headerIcon, { backgroundColor: C.primaryLight }]}
              >
                <History size={14} color={C.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Asset History</Text>
                <Text style={styles.headerSubtitle}>
                  {asset?.name} · {asset?.assetTag}
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={15} color={C.textMuted} />
            </Pressable>
          </View>

          <View style={styles.body}>
            {loading ? (
              <ActivityIndicator
                color={C.primary}
                style={{ marginVertical: 20 }}
              />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : history.length === 0 ? (
              <View style={styles.emptyBox}>
                <Clock size={32} color={C.textMuted} />
                <Text style={styles.emptyText}>No history recorded yet.</Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 320 }}
              >
                {history.map((item, i) => {
                  const meta = ACTION_META[item.action] ?? ACTION_META.created;
                  const Icon = meta.icon;
                  return (
                    <View key={item.id ?? i} style={styles.timelineRow}>
                      <View
                        style={[
                          styles.timelineDot,
                          { backgroundColor: meta.bg },
                        ]}
                      >
                        <Icon size={12} color={meta.color} />
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineTitle}>{meta.label}</Text>
                        {item.employeeName && (
                          <Text style={styles.timelineMeta}>
                            Employee: {item.employeeName}
                          </Text>
                        )}
                        {item.notes && (
                          <Text style={styles.timelineMeta}>{item.notes}</Text>
                        )}
                        <Text style={styles.timelineDate}>
                          {new Date(item.createdAt).toLocaleDateString(
                            "en-NG",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>

          <View style={styles.footer}>
            <Pressable onPress={onClose} style={styles.doneBtn}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.55)",
  },
  sheet: {
    width: "90%",
    maxWidth: 400,
    maxHeight: "85%",
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 15, fontWeight: "700", color: C.textPrimary },
  headerSubtitle: { fontSize: 11, color: C.textMuted, marginTop: 1 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
  },
  body: { padding: 16, minHeight: 120 },
  errorText: {
    fontSize: 12,
    color: C.danger,
    textAlign: "center",
    marginVertical: 20,
  },
  emptyBox: { alignItems: "center", gap: 8, paddingVertical: 24 },
  emptyText: { fontSize: 13, color: C.textMuted },
  timelineRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  timelineContent: { flex: 1, gap: 2 },
  timelineTitle: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  timelineMeta: { fontSize: 11.5, color: C.textSecondary },
  timelineDate: { fontSize: 10, color: C.textMuted, marginTop: 2 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  doneBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: C.primary,
  },
  doneText: { fontSize: 13, fontWeight: "700", color: "#fff" },
});
