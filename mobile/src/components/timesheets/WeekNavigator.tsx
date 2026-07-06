// src/components/timesheets/WeekNavigator.tsx
// Week switcher (prev/next) plus a row of day tabs (Mon–Sun) showing
// entry counts and highlighting today / the active day.

import { View, Text, Pressable, StyleSheet } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import C from "../../styles/colors";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type WeekNavigatorProps = {
  weekLabel: string;
  isCurrentWeek: boolean;
  weekDates: Date[];
  activeDay: number;
  onChangeDay: (index: number) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  countsByDay: number[]; // entry count per day, aligned with weekDates
  todayIndex: number; // -1 if today isn't in this week
};

export default function WeekNavigator({
  weekLabel,
  isCurrentWeek,
  weekDates,
  activeDay,
  onChangeDay,
  onPrevWeek,
  onNextWeek,
  countsByDay,
  todayIndex,
}: WeekNavigatorProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={onPrevWeek}
          style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.7 }]}
        >
          <ChevronLeft size={16} color={C.textSecondary} />
        </Pressable>

        <View style={styles.weekLabelWrap}>
          <Text style={styles.weekLabel}>{weekLabel}</Text>
          {isCurrentWeek && <Text style={styles.thisWeek}>This week</Text>}
        </View>

        <Pressable
          onPress={onNextWeek}
          style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.7 }]}
        >
          <ChevronRight size={16} color={C.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.daysRow}>
        {weekDates.map((d, i) => {
          const active = i === activeDay;
          const today = i === todayIndex;
          const count = countsByDay[i] ?? 0;

          return (
            <Pressable
              key={d.toISOString()}
              onPress={() => onChangeDay(i)}
              style={[
                styles.dayTab,
                active && styles.dayTabActive,
                !active && today && styles.dayTabToday,
              ]}
            >
              <Text
                style={[
                  styles.dayName,
                  {
                    color: active
                      ? "#fff"
                      : today
                        ? C.primary
                        : C.textSecondary,
                  },
                ]}
              >
                {DAY_NAMES[i]}
              </Text>
              <Text
                style={[
                  styles.dayNum,
                  { color: active ? "#fff" : C.textPrimary },
                ]}
              >
                {d.getDate()}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.countDot,
                    {
                      backgroundColor: active
                        ? "rgba(255,255,255,0.3)"
                        : C.primary,
                    },
                  ]}
                >
                  <Text style={styles.countText}>{count}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  weekLabelWrap: {
    alignItems: "center",
  },
  weekLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: C.textPrimary,
  },
  thisWeek: {
    fontSize: 11,
    fontWeight: "600",
    color: C.primary,
    marginTop: 1,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayTab: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  dayTabActive: {
    backgroundColor: C.primary,
  },
  dayTabToday: {
    backgroundColor: C.primaryLight,
    borderWidth: 1.5,
    borderColor: `${C.primary}44`,
  },
  dayName: {
    fontSize: 11,
    fontWeight: "600",
  },
  dayNum: {
    fontSize: 14,
    fontWeight: "700",
  },
  countDot: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#fff",
  },
});
