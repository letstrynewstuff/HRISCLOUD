// src/components/admin/DonutChart.tsx
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import C from "../../../styles/colors";

type DonutChartProps = {
  present: number;
  absent: number;
  late: number;
  total: number;
};

export default function DonutChart({
  present,
  absent,
  late,
  total,
}: DonutChartProps) {
  const r = 42;
  const cx = 52;
  const cy = 52;
  const stroke = 9;
  const circ = 2 * Math.PI * r;

  const pPct = present / total;
  const aPct = absent / total;

  return (
    <View style={styles.container}>
      <Svg width={104} height={104} viewBox="0 0 104 104">
        {/* Background */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={C.border}
          strokeWidth={stroke}
        />
        {/* Present */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={C.success}
          strokeWidth={stroke}
          strokeLinecap="butt"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pPct)}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        {/* Absent */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={C.danger}
          strokeWidth={stroke}
          strokeLinecap="butt"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - aPct)}
          transform={`rotate(${-90 + pPct * 360} ${cx} ${cy})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.pct}>
          {Math.round((present / total) * 100) || 0}%
        </Text>
        <Text style={styles.label}>present</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 104,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    position: "absolute",
    alignItems: "center",
  },
  pct: {
    fontSize: 16,
    fontWeight: "800",
    color: C.textPrimary,
  },
  label: {
    fontSize: 9,
    color: C.textMuted,
  },
});
