import { View, Text, StyleSheet } from "react-native";
import { STATUS_CONFIG } from "./AssetMeta";

type Props = { status: string };

export default function StatusBadge({ status }: Props) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.available;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.text, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 10,
    fontWeight: "700",
  },
});
