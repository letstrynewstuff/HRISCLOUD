// src/components/admin/benefits/InsuranceBanner.tsx

import { View, Text, StyleSheet, Pressable } from "react-native";
import { Shield, Award, Star, ExternalLink, X } from "lucide-react-native";

interface Props {
  onDismiss: () => void;
}

const BADGES = [
  { label: "NAICOM Certified", icon: Award },
  { label: "CIIN Certified", icon: Star },
  { label: "FCA Compliant", icon: Shield },
];

export default function InsuranceBanner({ onDismiss }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable onPress={onDismiss} style={styles.closeBtn}>
        <X size={13} color="rgba(255,255,255,0.7)" />
      </Pressable>

      <View style={styles.iconWrap}>
        <Shield size={26} color="#fff" />
      </View>

      <Text style={styles.title}>Benefits</Text>
      <Text style={styles.subtitle}>
        Protect Your Business, Staff & Equipment
      </Text>
      <Text style={styles.desc}>
        Get insured with trusted providers — comprehensive coverage for your
        entire workforce
      </Text>

      <View style={styles.badgeRow}>
        {BADGES.map(({ label, icon: Icon }) => (
          <View key={label} style={styles.badge}>
            <Icon size={11} color="#a5b4fc" />
            <Text style={styles.badgeText}>{label}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.cta}>
        <Text style={styles.ctaText}>View Insurance Providers</Text>
        <ExternalLink size={13} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: "#1E1B4B",
    overflow: "hidden",
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 26,
    height: 26,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    zIndex: 2,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    marginBottom: 12,
  },
  title: { fontSize: 13, fontWeight: "700", color: "#c7d2fe", marginBottom: 2 },
  subtitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
    lineHeight: 25,
  },
  desc: { fontSize: 13, color: "#c7d2fe", lineHeight: 19, marginBottom: 14 },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  badgeText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignSelf: "flex-start",
    paddingHorizontal: 18,
  },
  ctaText: { fontSize: 13, fontWeight: "700", color: "#fff" },
});
