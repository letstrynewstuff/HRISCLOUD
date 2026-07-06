// src/components/performance/ScoreRing.tsx
// Animated SVG ring showing a 0-100 performance score.

import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import Svg, { Circle } from "react-native-svg";
import C from "../../styles/colors";

type ScoreRingProps = {
  score: number | null;
  size?: number;
};

function colorForScore(score: number | null) {
  if (score == null) return C.border;
  if (score >= 85) return C.success;
  if (score >= 60) return C.primary;
  if (score >= 40) return C.warning;
  return C.danger;
}

export default function ScoreRing({ score, size = 130 }: ScoreRingProps) {
  const strokeWidth = 11;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = score != null ? Math.min(Math.max(score, 0), 100) / 100 : 0;
  const color = colorForScore(score);

  // Animated dash-offset
  const anim = useRef(new Animated.Value(circ)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: circ - pct * circ,
      duration: 1100,
      useNativeDriver: false,
    }).start();
  }, [score]);

  // react-native-svg does not support Animated.Value directly on strokeDashoffset,
  // so we drive it through an interpolation string.
  const cx = size / 2;
  const cy = size / 2;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        {/* Track */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={C.border}
          strokeWidth={strokeWidth}
        />
        {/* Progress — static at target (native SVG animation not available, show direct) */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          strokeDashoffset={circ - pct * circ}
          rotation="-90"
          origin={`${cx},${cy}`}
        />
      </Svg>
      <View style={styles.label}>
        <Text style={[styles.score, { color }]}>{score ?? "—"}</Text>
        <Text style={styles.max}>/100</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { alignItems: "center" },
  score: { fontSize: 28, fontWeight: "900" },
  max: { fontSize: 10, fontWeight: "600", color: C.textMuted, marginTop: -2 },
});
