// src/components/admin/benefits/BenefitCard.tsx

import { View, Text, StyleSheet, Pressable } from "react-native";
import { Heart, Shield, Building2, Users } from "lucide-react-native";
import C from "../../../styles/colors";
import { TypeBadge } from "./benefitsShared";

interface Props {
  benefit: any;
  onAssign: () => void;
}

export default function BenefitCard({ benefit, onAssign }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: benefit.is_insurance ? "#DBEAFE" : C.dangerLight,
            },
          ]}
        >
          {benefit.is_insurance ? (
            <Shield size={17} color="#2563EB" />
          ) : (
            <Heart size={17} color={C.danger} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {benefit.name}
          </Text>
          <TypeBadge type={benefit.type} />
        </View>
      </View>

      {benefit.provider ? (
        <View style={styles.providerRow}>
          <Building2 size={11} color={C.textMuted} />
          <Text style={styles.providerText}>{benefit.provider}</Text>
        </View>
      ) : null}

      {benefit.description ? (
        <Text style={styles.desc} numberOfLines={2}>
          {benefit.description}
        </Text>
      ) : null}

      <Pressable onPress={onAssign} style={styles.assignBtn}>
        <Users size={14} color={C.success} />
        <Text style={styles.assignBtnText}>Assign to Employee</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    padding: 15,
    gap: 10,
    marginBottom: 12,
  },
  top: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 14,
    fontWeight: "800",
    color: C.textPrimary,
    marginBottom: 4,
  },
  providerRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  providerText: { fontSize: 12, color: C.textSecondary },
  desc: { fontSize: 12, color: C.textMuted, lineHeight: 17 },
  assignBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 11,
    borderRadius: 13,
    backgroundColor: C.successLight,
    borderWidth: 1,
    borderColor: C.success + "33",
    marginTop: 2,
  },
  assignBtnText: { fontSize: 13, fontWeight: "700", color: C.success },
});
