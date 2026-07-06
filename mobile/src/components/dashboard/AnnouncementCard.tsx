// src/components/dashboard/AnnouncementCard.tsx
// Single announcement card with a category pill, title, snippet, relative
// time, and a row of pagination dots underneath (purely presentational —
// wire up to a horizontal ScrollView/FlatList paging index if needed).

import { View, Text, Pressable, StyleSheet } from "react-native";
import { Volume2, ChevronRight } from "lucide-react-native";
import C from "../../styles/colors";

type AnnouncementCardProps = {
  category: string;
  title: string;
  body: string;
  timeAgo: string;
  dotCount?: number;
  activeDot?: number;
  onPress?: () => void;
};

export default function AnnouncementCard({
  category,
  title,
  body,
  timeAgo,
  dotCount = 3,
  activeDot = 0,
  onPress,
}: AnnouncementCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.row}>
        <View style={styles.iconChip}>
          <Volume2 size={20} color={C.primary} strokeWidth={2} />
        </View>

        <View style={styles.content}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{category}</Text>
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {body}
          </Text>
        </View>

        <View style={styles.rightCol}>
          <Text style={styles.time}>{timeAgo}</Text>
          <ChevronRight size={16} color={C.textMuted} />
        </View>
      </View>

      <View style={styles.dots}>
        {Array.from({ length: dotCount }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeDot ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.violetBg,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  pill: {
    alignSelf: "flex-start",
    backgroundColor: C.violetBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  pillText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: C.primary,
  },
  title: {
    fontSize: 14.5,
    fontWeight: "700",
    color: C.textPrimary,
  },
  body: {
    fontSize: 12.5,
    color: C.textMuted,
    marginTop: 3,
    lineHeight: 17,
  },
  rightCol: {
    alignItems: "flex-end",
    gap: 4,
  },
  time: {
    fontSize: 11,
    color: C.textMuted,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    marginTop: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: C.primary,
  },
  dotInactive: {
    backgroundColor: C.border,
  },
});
