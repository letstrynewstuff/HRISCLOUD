// src/components/ui/SectionHeader.tsx
// Title on the left, optional "View all" link on the right. Used to open
// every dashboard section (Today at a glance, Quick Actions, etc).

import { View, Text, Pressable, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";
import C from "../../styles/colors";

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
  showChevron?: boolean;
};

export default function SectionHeader({
  title,
  actionLabel,
  onPressAction,
  showChevron = true,
}: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel ? (
        <Pressable
          onPress={onPressAction}
          hitSlop={8}
          style={({ pressed }) => [
            styles.actionRow,
            pressed && { opacity: 0.6 },
          ]}
        >
          <Text style={styles.actionLabel}>{actionLabel}</Text>
          {showChevron && <ChevronRight size={16} color={C.primary} />}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: C.textPrimary,
    letterSpacing: -0.2,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: C.primary,
  },
});
