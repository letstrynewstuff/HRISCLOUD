// src/components/benefits/StatusBadge.tsx
// Status pill for benefit enrollment status (active / inactive / pending).

import { View, Text, StyleSheet } from "react-native";
import C from "../../styles/colors";

export type BenefitStatus = "active" | "inactive" | "pending";

type StatusBadgeProps = {
  status: BenefitStatus | string;
};

const CONFIG: Record<BenefitStatus, { bg: string; color: string }> = {
  active: { bg: C.successLight, color: C.success },
  inactive: { bg: C.dangerLight, color: C.danger },
  pending: { bg: C.warningLight, color: C.warning },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const key = (status?.toLowerCase() as BenefitStatus) ?? "active";
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
