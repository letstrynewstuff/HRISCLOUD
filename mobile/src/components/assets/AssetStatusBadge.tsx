import { View, Text, StyleSheet } from "react-native";
import C from "../../styles/colors";

type AssetStatusBadgeProps = {
  status: string;
};

const CONFIG: Record<string, { bg: string; color: string }> = {
  assigned: { bg: C.successLight, color: C.success },
  active: { bg: C.successLight, color: C.success },
  pending: { bg: C.warningLight, color: C.warning },
  approved: { bg: C.successLight, color: C.success },
  rejected: { bg: C.dangerLight, color: C.danger },
  returned: { bg: C.surfaceAlt, color: C.textMuted },
  inactive: { bg: C.dangerLight, color: C.danger },
};

export default function AssetStatusBadge({ status }: AssetStatusBadgeProps) {
  const key = status?.toLowerCase() ?? "active";
  const c = CONFIG[key] ?? { bg: C.surfaceAlt, color: C.textMuted };

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.label, { color: c.color }]}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Text>
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
  label: {
    fontSize: 10,
    fontWeight: "700",
  },
});
