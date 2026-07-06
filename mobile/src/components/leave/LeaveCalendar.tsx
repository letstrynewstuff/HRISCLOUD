

// src/components/leave/LeaveCalendar.tsx
// Compact month calendar highlighting approved/pending leave days.
// Tapping a day with leave opens a small inline detail panel above the grid.

import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { ChevronLeft, ChevronRight, X } from "lucide-react-native";
import C from "../../styles/colors";
import { getLeaveMeta } from "./leaveMeta";
import StatusBadge from "./StatusBadge";
import { LeaveRequest } from "../../types/leave";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type LeaveCalendarProps = {
  history: LeaveRequest[];
};

function getDaysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
function getFirstDayOfMonth(y: number, m: number) {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1;
}
function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function todayStr() {
  const d = new Date();
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function LeaveCalendar({ history }: LeaveCalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<{
    ds: string;
    lv: LeaveRequest;
  } | null>(null);

  const leaveMap = useMemo(() => {
    const map: Record<string, LeaveRequest> = {};
    history.forEach((lv) => {
      const s = new Date(lv.startDate);
      const e = new Date(lv.endDate);
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        map[d.toISOString().slice(0, 10)] = lv;
      }
    });
    return map;
  }, [history]);

  const monthName = new Date(year, month, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1,
  );
  while (cells.length % 7 !== 0) cells.push(null);

  const goPrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const goNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };
  const goToday = () => {
    setMonth(now.getMonth());
    setYear(now.getFullYear());
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.monthLabel}>{monthName}</Text>
        <View style={styles.navRow}>
          <Pressable onPress={goPrev} style={styles.navBtn}>
            <ChevronLeft size={14} color={C.textSecondary} />
          </Pressable>
          <Pressable onPress={goToday} style={styles.todayBtn}>
            <Text style={styles.todayLabel}>Today</Text>
          </Pressable>
          <Pressable onPress={goNext} style={styles.navBtn}>
            <ChevronRight size={14} color={C.textSecondary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.dayNamesRow}>
        {DAY_NAMES.map((d) => (
          <Text key={d} style={styles.dayNameText}>
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (!day) return <View key={i} style={styles.cell} />;
          const ds = toDateStr(year, month, day);
          const lv = leaveMap[ds];
          const isToday = ds === todayStr();
          const isWeekend = i % 7 >= 5;

          const bg = isToday
            ? C.primary
            : lv?.status === "approved"
              ? C.successLight
              : lv?.status === "pending"
                ? C.warningLight
                : isWeekend
                  ? C.surfaceAlt
                  : "transparent";
          const fg = isToday
            ? "#fff"
            : lv?.status === "approved"
              ? C.success
              : lv?.status === "pending"
                ? C.warning
                : isWeekend
                  ? C.textMuted
                  : C.textPrimary;

          return (
            <Pressable
              key={i}
              disabled={!lv}
              onPress={() => lv && setSelected({ ds, lv })}
              style={[styles.cell, { backgroundColor: bg }]}
            >
              <Text style={[styles.dayNum, { color: fg }]}>{day}</Text>
              {lv && (
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        lv.status === "approved" ? C.success : C.warning,
                    },
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legend}>
        {[
          { color: C.success, bg: C.successLight, label: "Approved" },
          { color: C.warning, bg: C.warningLight, label: "Pending" },
          { color: "#fff", bg: C.primary, label: "Today" },
        ].map((l) => (
          <View key={l.label} style={styles.legendItem}>
            <View
              style={[
                styles.legendSwatch,
                { backgroundColor: l.bg, borderColor: `${l.color}55` },
              ]}
            />
            <Text style={styles.legendText}>{l.label}</Text>
          </View>
        ))}
      </View>

      {selected && (
        <View style={styles.detailPanel}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailDate}>
              {new Date(selected.ds).toLocaleDateString("en-GB", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <Pressable onPress={() => setSelected(null)} hitSlop={8}>
              <X size={14} color={C.textMuted} />
            </Pressable>
          </View>
          <StatusBadge status={selected.lv.status} />
          <Text style={styles.detailType}>
            {selected.lv.policyName ??
              getLeaveMeta(selected.lv.leaveType).label}
          </Text>
          <Text style={styles.detailReason}>
            {selected.lv.reason ?? "No reason provided"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.surface, borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  monthLabel: { fontSize: 14, fontWeight: "700", color: C.textPrimary },
  navRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  navBtn: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.border },
  todayBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: C.primaryLight },
  todayLabel: { fontSize: 11, fontWeight: "700", color: C.primary },
  dayNamesRow: { flexDirection: "row", marginBottom: 6 },
  dayNameText: { flex: 1, textAlign: "center", fontSize: 10, fontWeight: "700", color: C.textMuted, textTransform: "uppercase" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: "center", justifyContent: "center", borderRadius: 10, marginBottom: 3 },
  dayNum: { fontSize: 12, fontWeight: "700" },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },
  legend: { flexDirection: "row", gap: 14, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendSwatch: { width: 12, height: 12, borderRadius: 4, borderWidth: 1 },
  legendText: { fontSize: 10.5, color: C.textMuted },
  detailPanel: { marginTop: 12, padding: 12, borderRadius: 14, backgroundColor: C.surfaceAlt, gap: 6 },
  detailHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  detailDate: { fontSize: 12.5, fontWeight: "700", color: C.textPrimary },
  detailType: { fontSize: 12.5, fontWeight: "700", color: C.textPrimary },
  detailReason: { fontSize: 11.5, color: C.textSecondary },
});