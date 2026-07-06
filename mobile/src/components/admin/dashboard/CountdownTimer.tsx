// src/components/admin/CountdownTimer.tsx
import { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import C from "../../../styles/colors";

export default function CountdownTimer() {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + 1, 0, 17, 0, 0);
  const [time, setTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setTime({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const blocks = [
    { label: "Days", val: time.days },
    { label: "Hours", val: time.hours },
    { label: "Mins", val: time.mins },
    { label: "Secs", val: time.secs },
  ];

  return (
    <View style={styles.row}>
      {blocks.map(({ label, val }) => (
        <View key={label} style={styles.block}>
          <Text style={styles.val}>{String(val).padStart(2, "0")}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  block: {
    flex: 1,
    backgroundColor: C.surfaceAlt,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  val: {
    fontSize: 20,
    fontWeight: "800",
    color: C.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  label: {
    fontSize: 9,
    color: C.textMuted,
    textTransform: "uppercase",
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
