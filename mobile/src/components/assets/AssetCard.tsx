import { View, Text, StyleSheet, Pressable } from "react-native";
import { Calendar, Shield, MapPin } from "lucide-react-native";
import C from "../../styles/colors";
import { getCatMeta } from "./AssetMeta";
import AssetStatusBadge from "./AssetStatusBadge";

type AssetCardProps = {
  asset: any;
  onPress?: () => void;
};

export default function AssetCard({ asset, onPress }: AssetCardProps) {
  const meta = getCatMeta(asset.category);
  const Icon = meta.icon;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
          <Icon size={18} color={meta.color} />
        </View>
        <AssetStatusBadge status={asset.status} />
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {asset.name}
      </Text>

      <Text style={styles.subtitle} numberOfLines={1}>
        {asset.brand} {asset.model}
      </Text>

      <View style={styles.footer}>
        {asset.assignedAt && (
          <View style={styles.footerItem}>
            <Calendar size={11} color={C.textSecondary} />
            <Text style={styles.footerText}>
              {new Date(asset.assignedAt).toLocaleDateString("en-NG", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
        )}
        {asset.condition && (
          <View style={styles.footerItem}>
            <Shield size={11} color={C.textSecondary} />
            <Text style={styles.footerText}>{asset.condition}</Text>
          </View>
        )}
        {asset.location && (
          <View style={styles.footerItem}>
            <MapPin size={11} color={C.textSecondary} />
            <Text style={styles.footerText} numberOfLines={1}>
              {asset.location}
            </Text>
          </View>
        )}
      </View>
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
    minHeight: 150,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 13.5,
    fontWeight: "700",
    color: C.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
    marginBottom: 10,
  },
  footer: {
    marginTop: "auto",
    gap: 5,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  footerText: {
    fontSize: 10.5,
    color: C.textSecondary,
  },
});
