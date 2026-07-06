
// src/components/attendance/AttendanceHero.tsx
// FIXED: Matches Training Hero styling. Break button disappears after 3 uses.

import { View, Text, Pressable, StyleSheet } from "react-native";
import {
  LogIn,
  LogOut,
  CheckCircle2,
  Timer,
  RefreshCw,
  Coffee,
  Play,
} from "lucide-react-native";
import C from "../../styles/colors";
import LiveTimer from "./LiveTimer";

export type DayStatus = "not-started" | "active" | "on-break" | "done";

type AttendanceHeroProps = {
  employeeFirstName?: string;
  dayStatus: DayStatus;
  clockInTime: Date | null;
  clockOutTime: Date | null;
  breakStartTime?: Date | null;
  breakCount?: number; 
  actionLoading?: boolean;
  onPressClock: () => void;
  onPressBreak: () => void;
};

function statusMeta(dayStatus: DayStatus) {
  if (dayStatus === "active") {
    return { color: "#34D399", label: "Clocked In" };
  }
  if (dayStatus === "on-break") {
    return { color: "#F59E0B", label: "On Break" };
  }
  if (dayStatus === "done") {
    return { color: C.accent, label: "Day Complete" };
  }
  return { color: "#F87171", label: "Not Clocked In" };
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AttendanceHero({
  employeeFirstName,
  dayStatus,
  clockInTime,
  clockOutTime,
  breakStartTime,
  breakCount = 0,
  actionLoading,
  onPressClock,
  onPressBreak,
}: AttendanceHeroProps) {
  const { color: statusColor, label: statusLabel } = statusMeta(dayStatus);
  const clockedIn = dayStatus === "active";
  const onBreak = dayStatus === "on-break";
  const done = dayStatus === "done";

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // NEW: break button is hidden after 3 breaks (count reaches 3)
  const canShowBreak = breakCount < 3;

  return (
    <View style={styles.card}>
      <View style={styles.statusRow}>
        <View style={[styles.dot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusLabel, { color: statusColor }]}>
          {statusLabel.toUpperCase()}
        </Text>
      </View>

      <Text style={styles.dateText}>{today}</Text>
      <Text style={styles.subText}>
        {employeeFirstName
          ? `Welcome back, ${employeeFirstName}`
          : "Track your working hours"}
      </Text>

      <View style={styles.chipsRow}>
        {clockInTime && (
          <View style={styles.chip}>
            <LogIn size={12} color="rgba(255,255,255,0.7)" />
            <Text style={styles.chipText}>
              In:{" "}
              <Text style={styles.chipTextStrong}>{fmtTime(clockInTime)}</Text>
            </Text>
          </View>
        )}
        {clockOutTime && (
          <View style={styles.chip}>
            <LogOut size={12} color="rgba(255,255,255,0.7)" />
            <Text style={styles.chipText}>
              Out:{" "}
              <Text style={styles.chipTextStrong}>{fmtTime(clockOutTime)}</Text>
            </Text>
          </View>
        )}
        {clockedIn && clockInTime && (
          <View style={[styles.chip, styles.chipTimer]}>
            <Timer size={12} color="#6EE7B7" />
            <LiveTimer startTime={clockInTime} style={styles.timerText} />
          </View>
        )}
        {onBreak && breakStartTime && (
          <View style={[styles.chip, styles.chipBreakTimer]}>
            <Coffee size={12} color="#FCD34D" />
            <LiveTimer
              startTime={breakStartTime}
              style={styles.breakTimerText}
            />
          </View>
        )}
      </View>

      {/* Action buttons */}
      <View style={styles.actionsRow}>
        {/* Break button — shown when active or on break, max 3 times */}
        {(clockedIn || onBreak) && canShowBreak && (
          <Pressable
            onPress={onPressBreak}
            disabled={actionLoading}
            style={({ pressed }) => [
              styles.breakBtn,
              onBreak && styles.breakBtnActive,
              pressed && { opacity: 0.9 },
              actionLoading && { opacity: 0.6 },
            ]}
          >
            {actionLoading ? (
              <RefreshCw size={14} color="#fff" />
            ) : onBreak ? (
              <Play size={14} color="#fff" />
            ) : (
              <Coffee size={14} color="#fff" />
            )}
            <Text style={styles.breakBtnText}>
              {onBreak ? "End Break" : "Start Break"}
            </Text>
          </Pressable>
        )}

        {/* Main clock button */}
        <Pressable
          onPress={onPressClock}
          disabled={done || actionLoading}
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: done
                ? "rgba(255,255,255,0.12)"
                : onBreak
                  ? "#10B981"
                  : clockedIn
                    ? "#EF4444"
                    : "#10B981",
              opacity: done || actionLoading ? 0.6 : pressed ? 0.9 : 1,
              flex: (clockedIn || onBreak) && canShowBreak ? 1 : undefined,
            },
          ]}
        >
          {actionLoading ? (
            <RefreshCw size={14} color="#fff" />
          ) : done ? (
            <CheckCircle2 size={14} color="#fff" />
          ) : onBreak ? (
            <LogIn size={14} color="#fff" />
          ) : clockedIn ? (
            <LogOut size={14} color="#fff" />
          ) : (
            <LogIn size={14} color="#fff" />
          )}
          <Text style={styles.ctaText}>
            {done
              ? "Day Complete"
              : onBreak
                ? "Resume Work"
                : clockedIn
                  ? "Clock Out"
                  : "Clock In"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.navy,
    borderRadius: 20,
    padding: 18,
    gap: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  dateText: {
    fontSize: 21,
    fontWeight: "800",
    color: "#fff",
  },
  subText: {
    fontSize: 13,
    color: "rgba(224,225,255,0.85)",
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  chipTimer: {
    backgroundColor: "rgba(16,185,129,0.2)",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.3)",
  },
  chipBreakTimer: {
    backgroundColor: "rgba(245,158,11,0.2)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.3)",
  },
  chipText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  chipTextStrong: {
    color: "#fff",
    fontWeight: "700",
  },
  timerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6EE7B7",
    fontVariant: ["tabular-nums"],
  },
  breakTimerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FCD34D",
    fontVariant: ["tabular-nums"],
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
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
    minWidth: 120,
  },
  ctaText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
});
