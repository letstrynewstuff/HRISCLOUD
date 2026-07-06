

// src/components/benefits/FeaturedBenefitCard.tsx
// Updated to use snake_case fields like the web: benefit_name, start_date, etc.

import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Heart, ChevronDown, Phone, FileText } from "lucide-react-native";
import C from "../../styles/colors";
import StatusBadge from "./StatusBadge";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FeaturedBenefitCardProps = {
  benefit: any;
  onContactProvider?: () => void;
  onViewDetails?: () => void;
};

export default function FeaturedBenefitCard({
  benefit,
  onContactProvider,
  onViewDetails,
}: FeaturedBenefitCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Use snake_case fields like the web
  const benefitName = benefit.benefit_name ?? benefit.name ?? benefit.title ?? "Benefit";
  const provider = benefit.provider;
  const type = benefit.type ?? "—";
  const startDate = benefit.start_date ?? "—";
  const endDate = benefit.end_date ?? "Ongoing";
  const description = benefit.description;
  const usageInstructions = benefit.usage_instructions;
  const status = benefit.status ?? "active";

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((p) => !p);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Heart size={18} color={C.danger} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {benefitName}
          </Text>
          {!!provider && (
            <Text style={styles.provider}>Provider: {provider}</Text>
          )}
        </View>
        <StatusBadge status={status} />
      </View>

      <View style={styles.detailsGrid}>
        {[
          { label: "Benefit Type", value: type },
          { label: "Start Date", value: startDate },
          { label: "End Date", value: endDate },
        ].map((d) => (
          <View key={d.label} style={styles.detailCell}>
            <Text style={styles.detailLabel}>{d.label}</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {d.value}
            </Text>
          </View>
        ))}
      </View>

      {!!description && (
        <Text style={styles.description}>{description}</Text>
      )}

      <Pressable onPress={toggle} style={styles.accordionHeader}>
        <Text style={styles.accordionTitle}>How to use this benefit</Text>
        <View style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}>
          <ChevronDown size={16} color={C.textSecondary} />
        </View>
      </Pressable>

      {expanded && (
        <Text style={styles.accordionBody}>
          {usageInstructions ??
            "Contact HR or your provider directly for details on how to access this benefit."}
        </Text>
      )}

      {!!provider && (
        <View style={styles.actionsRow}>
          <Pressable
            onPress={onContactProvider}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && { opacity: 0.88 },
            ]}
          >
            <Phone size={14} color="#fff" />
            <Text style={styles.primaryLabel}>Contact Provider</Text>
          </Pressable>
          <Pressable
            onPress={onViewDetails}
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && { opacity: 0.8 },
            ]}
          >
            <FileText size={14} color={C.textPrimary} />
            <Text style={styles.secondaryLabel}>Full Details</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    marginBottom: 16,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.dangerLight,
  },
  title: {
    fontSize: 14.5,
    fontWeight: "700",
    color: C.textPrimary,
  },
  provider: {
    fontSize: 11.5,
    color: C.textMuted,
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 14,
  },
  detailCell: {
    minWidth: "28%",
  },
  detailLabel: {
    fontSize: 10.5,
    color: C.textSecondary,
  },
  detailValue: {
    fontSize: 12.5,
    fontWeight: "700",
    color: C.textPrimary,
    marginTop: 2,
  },
  description: {
    fontSize: 12.5,
    color: C.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  accordionTitle: {
    fontSize: 12.5,
    fontWeight: "600",
    color: C.textPrimary,
  },
  accordionBody: {
    fontSize: 12,
    color: C.textSecondary,
    lineHeight: 17,
    paddingBottom: 8,
    paddingTop: 2,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  primaryLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  secondaryLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textPrimary,
  },
});