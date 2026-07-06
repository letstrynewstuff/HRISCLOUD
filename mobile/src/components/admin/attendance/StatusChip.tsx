// src/components/admin/attendance/StatusChip.tsx
import { View, Text, StyleSheet } from "react-native";

interface Props {
  label: string;
  color: string;
  bg: string;
}

export default function StatusChip({ label, color, bg }: Props) {
  return (
    <View style={[s.chip, { backgroundColor: bg }]}>
      <Text style={[s.text, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },
  text: { fontSize: 10, fontWeight: "700", textTransform: "capitalize" },
});
