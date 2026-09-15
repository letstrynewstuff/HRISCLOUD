// src/components/admin/assets/AssetCard.tsx
import { View, Text, StyleSheet, Pressable } from "react-native";
import {
  Laptop,
  Tag,
  MapPin,
  Users,
  RotateCcw,
  Wrench,
  Trash2,
  History,
} from "lucide-react-native";
import C from "../../../styles/colors";
import { CATEGORY_CONFIG } from "./AssetMeta";
import CategoryBadge from "./CategoryBadge";
import StatusBadge from "./StatusBadge";

type Props = {
  asset: any;
  onAssign: (asset: any) => void;
  onReturn: (asset: any) => void;
  onRetire: (asset: any) => void;
  onHistory: (asset: any) => void;
};

export default function AssetCard({
  asset,
  onAssign,
  onReturn,
  onRetire,
  onHistory,
}: Props) {
  const isAvailable = asset.status === "available";
  const isAssigned = asset.status === "assigned";
  const canRetire = !isAssigned && asset.status !== "retired";

  const catCfg = CATEGORY_CONFIG[asset.category] ?? CATEGORY_CONFIG.other;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: catCfg.bg }]}>
          <Laptop size={18} color={catCfg.color} />
        </View>
        <Pressable onPress={() => onHistory(asset)} style={styles.iconBtn}>
          <History size={13} color={C.textMuted} />
        </Pressable>
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {asset.name}
      </Text>
      <View style={styles.tagRow}>
        <Tag size={10} color={C.textMuted} />
        <Text style={styles.tagText}>{asset.assetTag}</Text>
      </View>

      <View style={styles.badgeRow}>
        <CategoryBadge category={asset.category} />
        <StatusBadge status={asset.status} />
      </View>

      {asset.location && (
        <View style={styles.locationRow}>
          <MapPin size={11} color={C.textMuted} />
          <Text style={styles.locationText}>{asset.location}</Text>
        </View>
      )}

      {asset.assignedTo && (
        <View style={styles.assignedBox}>
          <Users size={12} color="#2563EB" />
          <View style={{ flex: 1 }}>
            <Text style={styles.assignedName} numberOfLines={1}>
              {asset.assignedTo.name}
            </Text>
            <Text style={styles.assignedDate}>
              Since {asset.assignedTo.assignedDate}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.actionsRow}>
        {isAvailable && (
          <Pressable
            onPress={() => onAssign(asset)}
            style={({ pressed }) => [
              styles.assignBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Users size={14} color={C.success} />
            <Text style={styles.assignText}>Assign</Text>
          </Pressable>
        )}
        {isAssigned && (
          <Pressable
            onPress={() => onReturn(asset)}
            style={({ pressed }) => [
              styles.returnBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <RotateCcw size={14} color="#B45309" />
            <Text style={styles.returnText}>Return</Text>
          </Pressable>
        )}
        {asset.status === "under_repair" && (
          <View style={styles.repairBtn}>
            <Wrench size={14} color={C.textMuted} />
            <Text style={styles.repairText}>In Repair</Text>
          </View>
        )}
        {canRetire && (
          <Pressable
            onPress={() => onRetire(asset)}
            style={({ pressed }) => [
              styles.retireBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Trash2 size={14} color={C.danger} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: C.textPrimary,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    color: C.textMuted,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  locationText: {
    fontSize: 12,
    color: C.textSecondary,
  },
  assignedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 10,
  },
  assignedName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  assignedDate: {
    fontSize: 10,
    color: "#3B82F6",
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  assignBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#D1FAE5",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.15)",
  },
  assignText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.success,
  },
  returnBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "rgba(180,83,9,0.15)",
  },
  returnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#B45309",
  },
  repairBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.surfaceAlt,
  },
  repairText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textMuted,
  },
  retireBtn: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.15)",
  },
});
