


// src/components/dashboard/ClockInCard.tsx
// Hero card at the top of the dashboard. Shows clock-in status, a primary
// CTA, and handles all states: not-started, active, on-break, done.
// Background matches training page EXACTLY: C.navy with white text.

import { View, Text, Pressable, StyleSheet } from "react-native";
import {
  Clock,
  ChevronDown,
  LogIn,
  LogOut,
  Coffee,
  Play,
  CheckCircle2,
} from "lucide-react-native";
import C from "../../styles/colors";

export type ClockStatus = "not-started" | "active" | "on-break" | "done";

type ClockInCardProps = {
  status: ClockStatus;
  clockInTime?: string | null;
  clockOutTime?: string | null;
  officeName: string;
  onPressClockIn: () => void;
  onPressBreak?: () => void;
  onPressOffice?: () => void;
};

function statusMeta(status: ClockStatus) {
  switch (status) {
    case "active":
      return { color: "#34D399", label: "Clocked In" };
    case "on-break":
      return { color: "#F59E0B", label: "On Break" };
    case "done":
      return { color: C.accent, label: "Day Complete" };
    default:
      return { color: "#F87171", label: "Not Clocked In" };
  }
}

function getButtonConfig(status: ClockStatus) {
  switch (status) {
    case "active":
      return { label: "Clock Out", icon: LogOut, bg: "#EF4444" };
    case "on-break":
      return { label: "Happy Break", icon: Coffee, bg: "#10B981" };
    case "done":
      return { label: "Day Complete", icon: CheckCircle2, bg: "rgba(255,255,255,0.12)" };
    default:
      return { label: "Clock In", icon: LogIn, bg: "#10B981" };
  }
}

export default function ClockInCard({
  status,
  clockInTime,
  clockOutTime,
  officeName,
  onPressClockIn,
  onPressBreak,
  onPressOffice,
}: ClockInCardProps) {
  const { color: statusColor, label: statusLabel } = statusMeta(status);
  const { label: btnLabel, icon: BtnIcon, bg: btnBg } = getButtonConfig(status);
  const isDone = status === "done";

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconChip}>
          <Clock size={20} color="#fff" strokeWidth={2} />
        </View>
        <View style={styles.statusCol}>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusLabel, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
          <Text style={styles.subtitle}>
            {status === "active" && clockInTime
              ? `Clocked in at ${clockInTime}`
              : status === "on-break"
                ? "You're on a break"
                : status === "done" && clockOutTime
                  ? `Clocked out at ${clockOutTime}`
                  : "You haven't clocked in yet"}
          </Text>
        </View>
      </View>

      {/* Action buttons row */}
      <View style={styles.actionsRow}>
        {/* Break button — shown when active or on break */}
        {(status === "active" || status === "on-break") && onPressBreak && (
          <Pressable
            onPress={onPressBreak}
            style={({ pressed }) => [
              styles.breakBtn,
              status === "on-break" && styles.breakBtnActive,
              pressed && { opacity: 0.9 },
            ]}
          >
            {status === "on-break" ? (
              <Play size={14} color="#fff" />
            ) : (
              <Coffee size={14} color="#fff" />
            )}
            <Text style={styles.breakBtnText}>
              {status === "on-break" ? "End Break" : "Start Break"}
            </Text>
          </Pressable>
        )}

        {/* Main clock button */}
        <Pressable
          onPress={onPressClockIn}
          disabled={isDone}
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: btnBg,
              opacity: isDone ? 0.6 : pressed ? 0.9 : 1,
              flex: status === "active" || status === "on-break" ? 1 : undefined,
            },
          ]}
        >
          <BtnIcon size={14} color="#fff" />
          <Text style={styles.ctaText}>{btnLabel}</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={onPressOffice}
        style={({ pressed }) => [styles.officeRow, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.officeText}>{officeName}</Text>
        <ChevronDown size={16} color="rgba(255,255,255,0.6)" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: C.navy, // ← EXACT same as training hero
    gap: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconChip: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  statusCol: {
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12.5,
    color: "rgba(224,225,255,0.85)",
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
  },
  breakBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: "rgba(245,158,11,0.9)",
  },
  breakBtnActive: {
    backgroundColor: "rgba(16,185,129,0.9)",
  },
  breakBtnText: {
    color: "#fff",
    fontSize: 12.5,
    fontWeight: "700",
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    minWidth: 130,
  },
  ctaText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  officeRow: {
    position: "absolute",
    right: 18,
    top: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  officeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
  },
});