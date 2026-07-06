


// src/components/leave/LeaveDetailModal.tsx
// Detail sheet shown when tapping a leave history row.

import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { X, AlertCircle } from "lucide-react-native";
import C from "../../styles/colors";
import { getLeaveMeta } from "./leaveMeta";
import StatusBadge from "./StatusBadge";
import { LeaveRequest } from "../../types/leave";

type LeaveDetailModalProps = {
  leave: LeaveRequest | null;
  onClose: () => void;
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function LeaveDetailModal({
  leave,
  onClose,
}: LeaveDetailModalProps) {
  if (!leave) return null;
  const meta = getLeaveMeta(leave.leaveType);

  const rows = [
    { label: "Start Date", value: fmtDate(leave.startDate) },
    { label: "End Date", value: fmtDate(leave.endDate) },
    { label: "Duration", value: `${leave.days} day${leave.days !== 1 ? "s" : ""}` },
    { label: "Approver", value: leave.approvedByName ?? "—" },
    { label: "Applied On", value: fmtDate(leave.createdAt) },
    { label: "Reason", value: leave.reason ?? "—" },
  ];

  return (
    <Modal
      visible={!!leave}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.header, { backgroundColor: meta.bg }]}>
            <View style={styles.headerLeft}>
              <View style={styles.iconWrap}>
                <meta.Icon size={18} color={meta.color} />
              </View>
              <View>
                <Text style={styles.headerTitle}>
                  {leave.policyName ?? meta.label}
                </Text>
                <Text style={styles.headerId}>
                  {leave.id.slice(0, 8).toUpperCase()}
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <X size={16} color={C.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <StatusBadge status={leave.status} />

            {leave.rejectionReason ? (
              <View style={styles.rejectionBox}>
                <AlertCircle size={13} color={C.danger} />
                <Text style={styles.rejectionText}>{leave.rejectionReason}</Text>
              </View>
            ) : null}

            <View style={styles.grid}>
              {rows.map((r) => (
                <View key={r.label} style={styles.gridCell}>
                  <Text style={styles.gridLabel}>{r.label}</Text>
                  <Text style={styles.gridValue}>{r.value}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center", padding: 16 },
  sheet: { width: "100%", maxWidth: 420, maxHeight: "82%", borderRadius: 22, overflow: "hidden", backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", padding: 16 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.6)" },
  headerTitle: { fontSize: 14.5, fontWeight: "700", color: C.textPrimary },
  headerId: { fontSize: 11, color: C.textSecondary, marginTop: 1 },
  closeBtn: { padding: 6, borderRadius: 10, backgroundColor: "rgba(0,0,0,0.08)" },
  body: { padding: 16 },
  rejectionBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 11, borderRadius: 14, backgroundColor: C.dangerLight, marginTop: 12 },
  rejectionText: { flex: 1, fontSize: 12, color: C.danger, lineHeight: 17 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  gridCell: { width: "47%", backgroundColor: C.surfaceAlt, borderRadius: 14, padding: 11 },
  gridLabel: { fontSize: 9.5, color: C.textMuted, marginBottom: 3 },
  gridValue: { fontSize: 12.5, fontWeight: "700", color: C.textPrimary },
});