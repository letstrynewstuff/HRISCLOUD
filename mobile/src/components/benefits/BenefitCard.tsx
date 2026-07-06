
// src/components/benefits/BenefitCard.tsx
// Updated to use snake_case fields like the web.

import { View, Text, StyleSheet, Pressable } from "react-native";
import C from "../../styles/colors";
import { getBenefitMeta } from "./benefitMeta";
import StatusBadge from "./StatusBadge";

type BenefitCardProps = {
  benefit: any;
  onPress?: () => void;
};

export default function BenefitCard({ benefit, onPress }: BenefitCardProps) {
  // Use snake_case fields like the web
  const benefitName = benefit.benefit_name ?? benefit.name ?? benefit.title ?? "—";
  const type = benefit.type ?? "";
  const provider = benefit.provider ?? "";
  const status = benefit.status ?? "active";

  const { Icon, color, bg } = getBenefitMeta(type);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: bg }]}>
          <Icon size={16} color={color} />
        </View>
        <StatusBadge status={status} />
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {benefitName}
      </Text>

      <Text style={styles.type}>
        {type
          ? type.charAt(0).toUpperCase() + type.slice(1)
          : "—"}
      </Text>

      {!!provider && (
        <Text style={styles.provider} numberOfLines={1}>
          {provider}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    width: "48.5%",
    minHeight: 125,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 13.5,
    fontWeight: "700",
    color: C.textPrimary,
  },
  type: {
    fontSize: 11,
    fontWeight: "500",
    color: C.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  provider: {
    fontSize: 10.5,
    color: C.textMuted,
    marginTop: "auto",
  },
});