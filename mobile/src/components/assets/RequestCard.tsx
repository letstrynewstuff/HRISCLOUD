import { View, Text, StyleSheet, Pressable } from "react-native";
import { Eye } from "lucide-react-native";
import C from "../../styles/colors";
import { getCatMeta } from "./AssetMeta";

type RequestCardProps = {
  request: any;
  onPress?: () => void;
};

export default function RequestCard({ request, onPress }: RequestCardProps) {
  const meta = getCatMeta(request.category);
  const Icon = meta.icon;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
          <Icon size={16} color={meta.color} />
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.title} numberOfLines={1}>
              {request.assetName ?? request.name ?? meta.label}
            </Text>
            {request.priority && request.priority !== "normal" && (
              <View
                style={[
                  styles.priorityBadge,
                  {
                    backgroundColor:
                      request.priority === "high"
                        ? C.dangerLight
                        : C.warningLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.priorityText,
                    {
                      color: request.priority === "high" ? C.danger : C.warning,
                    },
                  ]}
                >
                  {request.priority.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.meta} numberOfLines={1}>
            {new Date(request.createdAt).toLocaleDateString("en-NG", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {" · "}
            {request.reason}
          </Text>
        </View>

        <Eye size={14} color={C.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surfaceAlt,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textPrimary,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: "800",
  },
  meta: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 3,
  },
});
