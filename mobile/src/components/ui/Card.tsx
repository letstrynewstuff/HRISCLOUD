// src/components/ui/Card.tsx
// Plain white rounded surface used as the base for every dashboard block.

import { View, StyleSheet, ViewStyle } from "react-native";
import C from "../../styles/colors";

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  padded?: boolean;
};

export default function Card({ children, style, padded = true }: CardProps) {
  return (
    <View style={[styles.card, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  padded: {
    padding: 16,
  },
});
