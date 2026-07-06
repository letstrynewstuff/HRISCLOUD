


// src/components/training/TrainingCard.tsx
// One training card — type/mandatory/certified flags, status, title,
// dates and location. Tap to open the detail modal.
// Handles both snake_case and camelCase backend responses.

import { View, Text, Pressable, StyleSheet } from "react-native";
import { Award, MapPin } from "lucide-react-native";
import C from "../../styles/colors";
import { getStatusMeta, getTypeMeta } from "./trainingMeta";

type TrainingCardProps = {
  training: any;
  onPress: (t: any) => void;
};

function fmtDate(ds?: string) {
  if (!ds) return "TBD";
  return new Date(ds).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

export default function TrainingCard({ training, onPress }: TrainingCardProps) {
  // Handle both snake_case and camelCase from backend
  const hasCert = training.certificate_issued ?? training.certificateIssued;
  const startDate = training.start_date ?? training.startDate;
  const endDate = training.end_date ?? training.endDate;
  const location = training.location;
  const provider = training.provider;
  const title = training.title;
  const type = training.type;
  const mandatory = training.mandatory;
  const description = training.description;

  const status = getStatusMeta(training.status);
  const typeMeta = getTypeMeta(type);

  return (
    <Pressable
      onPress={() => onPress(training)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.88 }]}
    >
      <View style={styles.topRow}>
        <View style={styles.flagsRow}>
          <View style={[styles.flag, { backgroundColor: typeMeta.bg }]}>
            <Text style={[styles.flagText, { color: typeMeta.color }]}>
              {type}
            </Text>
          </View>
          {mandatory && (
            <View style={[styles.flag, { backgroundColor: "#FEE2E2" }]}>
              <Text style={[styles.flagText, { color: "#EF4444" }]}>
                Mandatory
              </Text>
            </View>
          )}
          {hasCert && (
            <View style={[styles.flag, styles.certFlag]}>
              <Award size={9} color="#D97706" />
              <Text style={[styles.flagText, { color: "#D97706" }]}>
                Certified
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
        <status.Icon size={10} color={status.color} strokeWidth={2.4} />
        <Text style={[styles.statusLabel, { color: status.color }]}>
          {status.label}
        </Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.provider} numberOfLines={1}>
        {provider ?? "—"}
      </Text>

      <View style={styles.bottomRow}>
        <Text style={styles.dateText}>
          {fmtDate(startDate)}
          {endDate ? ` → ${fmtDate(endDate)}` : ""}
        </Text>
        {location && (
          <View style={styles.locationRow}>
            <MapPin size={10} color={C.textMuted} />
            <Text style={styles.locationText} numberOfLines={1}>
              {location}
            </Text>
          </View>
        )}
      </View>

      {hasCert && (
        <View style={styles.certRow}>
          <Award size={11} color="#D97706" />
          <Text style={styles.certRowText}>
            Certificate issued
            {training.completed_at
              ? ` · ${new Date(training.completed_at).toLocaleDateString("en-GB")}`
              : ""}
          </Text>
        </View>
      )}
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
  },
  topRow: {
    marginBottom: 8,
  },
  flagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  flag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  certFlag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FEF3C7",
  },
  flagText: {
    fontSize: 9.5,
    fontWeight: "700",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 9.5,
    fontWeight: "700",
  },
  title: {
    fontSize: 13.5,
    fontWeight: "700",
    color: C.textPrimary,
    marginBottom: 2,
    lineHeight: 18,
  },
  provider: {
    fontSize: 11.5,
    color: C.textMuted,
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  dateText: {
    fontSize: 11,
    color: C.textSecondary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flexShrink: 1,
  },
  locationText: {
    fontSize: 10.5,
    color: C.textMuted,
    flexShrink: 1,
  },
  certRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  certRowText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#D97706",
  },
});