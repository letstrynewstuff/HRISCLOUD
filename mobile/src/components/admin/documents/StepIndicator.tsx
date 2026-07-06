// src/components/admin/documents/StepIndicator.tsx

import { View, Text, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";
import C from "../../../styles/colors";
import { STEPS } from "./documentsShared";

interface Props {
  current: number;
}

export default function StepIndicator({ current }: Props) {
  return (
    <View style={styles.row}>
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = current > n;
        const active = current === n;
        return (
          <View key={n} style={styles.stepWrap}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.circle,
                  {
                    backgroundColor: done
                      ? C.success
                      : active
                        ? C.primary
                        : C.surfaceAlt,
                    borderColor: done
                      ? C.success
                      : active
                        ? C.primary
                        : C.border,
                  },
                ]}
              >
                {done ? (
                  <Check size={13} color="#fff" />
                ) : (
                  <Text
                    style={[
                      styles.circleText,
                      { color: active ? "#fff" : C.textMuted },
                    ]}
                  >
                    {n}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  {
                    color: active ? C.primary : done ? C.success : C.textMuted,
                  },
                ]}
                numberOfLines={2}
              >
                {label}
              </Text>
            </View>
            {i < STEPS.length - 1 && (
              <View
                style={[
                  styles.connector,
                  { backgroundColor: done ? C.success : C.border },
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", marginBottom: 20 },
  stepWrap: { flexDirection: "row", alignItems: "flex-start", flex: 1 },
  stepItem: { alignItems: "center", gap: 6, width: 74 },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  circleText: { fontSize: 12, fontWeight: "800" },
  label: {
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 12,
  },
  connector: {
    flex: 1,
    height: 2,
    marginTop: 15,
    marginHorizontal: 4,
    borderRadius: 2,
  },
});
