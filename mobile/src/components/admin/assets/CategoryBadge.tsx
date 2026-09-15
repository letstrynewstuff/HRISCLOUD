import { View, Text, StyleSheet } from "react-native";
import { CATEGORY_CONFIG } from "./AssetMeta";

type Props = { category: string };

export default function CategoryBadge({ category }: Props) {
  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.other;
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
