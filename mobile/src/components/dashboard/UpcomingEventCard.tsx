// src/components/dashboard/UpcomingEventCard.tsx
// Upcoming event row: a calendar-style date chip, category pill, title,
// date/time, location, and a stacked-avatar attendee preview.

import { View, Text, Pressable, StyleSheet } from "react-native";
import { MapPin } from "lucide-react-native";
import Avatar from "../ui/Avatar";
import C from "../../styles/colors";

type Attendee = {
  id: string;
  name: string;
  avatarUri?: string;
};

type UpcomingEventCardProps = {
  category: string;
  title: string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  month: string; // e.g. "MAY"
  day: string; // e.g. "24"
  attendees: Attendee[];
  extraCount?: number;
  onPress?: () => void;
};

export default function UpcomingEventCard({
  category,
  title,
  dateLabel,
  timeLabel,
  location,
  month,
  day,
  attendees,
  extraCount = 0,
  onPress,
}: UpcomingEventCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.dateChip}>
        <Text style={styles.dateMonth}>{month}</Text>
        <Text style={styles.dateDay}>{day}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>{category}</Text>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <Text style={styles.meta} numberOfLines={1}>
          {dateLabel} · {timeLabel}
        </Text>

        <View style={styles.locationRow}>
          <MapPin size={12} color={C.textMuted} />
          <Text style={styles.locationText} numberOfLines={1}>
            {location}
          </Text>
        </View>
      </View>

      <View style={styles.avatarStack}>
        {attendees.slice(0, 3).map((a, i) => (
          <View
            key={a.id}
            style={[styles.stackedAvatar, { marginLeft: i === 0 ? 0 : -10 }]}
          >
            <Avatar uri={a.avatarUri} name={a.name} size={28} />
          </View>
        ))}
        {extraCount > 0 && (
          <View style={[styles.extraChip, { marginLeft: -10 }]}>
            <Text style={styles.extraText}>+{extraCount}</Text>
          </View>
        )}
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
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  dateChip: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: C.leafBg,
    alignItems: "center",
    justifyContent: "center",
  },
  dateMonth: {
    fontSize: 9,
    fontWeight: "800",
    color: C.leafGreen,
    letterSpacing: 0.4,
  },
  dateDay: {
    fontSize: 16,
    fontWeight: "800",
    color: C.leafGreen,
    marginTop: -1,
  },
  content: {
    flex: 1,
  },
  pill: {
    alignSelf: "flex-start",
    backgroundColor: C.leafBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  pillText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: C.leafGreen,
  },
  title: {
    fontSize: 14.5,
    fontWeight: "700",
    color: C.textPrimary,
  },
  meta: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 3,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: C.textMuted,
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
  },
  stackedAvatar: {
    borderWidth: 2,
    borderColor: C.surface,
    borderRadius: 16,
  },
  extraChip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.violetBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: C.surface,
  },
  extraText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: C.primary,
  },
});
