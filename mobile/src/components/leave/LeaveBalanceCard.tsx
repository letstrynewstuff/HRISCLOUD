


// src/components/leave/LeaveBalanceCard.tsx
// One leave-type balance tile: icon, progress bar, used/remaining, and an
// "Apply for this leave" shortcut that pre-fills the apply form.
// Balance data comes entirely from the API (admin-configured policies).

import { View, Text, Pressable, StyleSheet } from "react-native";
import { AlertCircle, XCircle, Clock } from "lucide-react-native";
import C from "../../styles/colors";
import { getLeaveMeta } from "./leaveMeta";
import { LeaveBalance } from "../../types/leave";

export type { LeaveBalance };

type LeaveBalanceCardProps = {
  balance: LeaveBalance;
  onApply: (balance: LeaveBalance) => void;
};

export default function LeaveBalanceCard({
  balance,
  onApply,
}: LeaveBalanceCardProps) {
  const meta = getLeaveMeta(balance.leaveType);
  const used = balance.taken;
  const total = balance.entitled;
  const avail = balance.remaining;
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const exhausted = avail === 0;
  const low = avail > 0 && avail <= 2;

  const barColor = exhausted ? C.danger : low ? C.warning : meta.color;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
          <meta.Icon size={18} color={meta.color} />
        </View>
        {exhausted ? (
          <View style={[styles.flag, { backgroundColor: C.dangerLight }]}>
            <XCircle size={9} color={C.danger} />
            <Text style={[styles.flagText, { color: C.danger }]}>
              Exhausted
            </Text>
          </View>
        ) : low ? (
          <View style={[styles.flag, { backgroundColor: C.warningLight }]}>
            <AlertCircle size={9} color={C.warning} />
            <Text style={[styles.flagText, { color: C.warning }]}>
              Low Balance
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.title}>{balance.policyName ?? meta.label}</Text>
      {!!meta.desc && <Text style={styles.desc}>{meta.desc}</Text>}

      <View style={[styles.track, { backgroundColor: `${meta.color}22` }]}>
        <View
          style={[styles.fill, { width: `${pct}%`, backgroundColor: barColor }]}
        />
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.usedText}>{used} used</Text>
        <Text style={[styles.remainingText, { color: barColor }]}>
          {avail} / {total} days left
        </Text>
      </View>

      {!!balance.pendingDays && balance.pendingDays > 0 && (
        <View style={styles.pendingRow}>
          <Clock size={10} color={C.warning} />
          <Text style={styles.pendingText}>
            {balance.pendingDays} day{balance.pendingDays !== 1 ? "s" : ""}{" "}
            pending approval
          </Text>
        </View>
      )}

      <Pressable
        onPress={() => onApply(balance)}
        disabled={exhausted}
        style={({ pressed }) => [
          styles.applyBtn,
          {
            backgroundColor: exhausted ? C.border : meta.bg,
            opacity: pressed && !exhausted ? 0.85 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.applyLabel,
            { color: exhausted ? C.textMuted : meta.color },
          ]}
        >
          {exhausted ? "Balance Exhausted" : "Apply for this leave"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  flag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  flagText: { fontSize: 9.5, fontWeight: "700" },
  title: { fontSize: 13, fontWeight: "700", color: C.textPrimary, marginBottom: 2 },
  desc: { fontSize: 10.5, color: C.textMuted, marginBottom: 10 },
  track: { height: 7, borderRadius: 4, overflow: "hidden", marginBottom: 8 },
  fill: { height: "100%", borderRadius: 4 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  usedText: { fontSize: 11, color: C.textMuted },
  remainingText: { fontSize: 11.5, fontWeight: "700" },
  pendingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  pendingText: { fontSize: 10, color: C.warning },
  applyBtn: { marginTop: 10, paddingVertical: 9, borderRadius: 12, alignItems: "center" },
  applyLabel: { fontSize: 11.5, fontWeight: "700" },
});