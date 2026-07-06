// src/components/ui/Avatar.tsx
// Circular avatar with optional online-status dot, used on the dashboard
// header and anywhere a person needs to be represented compactly.

import { View, Image, Text, StyleSheet } from "react-native";
import C from "../../styles/colors";

type AvatarProps = {
  uri?: string;
  name?: string;
  size?: number;
  online?: boolean;
};

function initialsOf(name?: string) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function Avatar({ uri, name, size = 48, online }: AvatarProps) {
  const dotSize = Math.max(10, size * 0.22);

  return (
    <View style={{ width: size, height: size }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.36 }]}>
            {initialsOf(name)}
          </Text>
        </View>
      )}

      {online && (
        <View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              right: -1,
              bottom: -1,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: C.surfaceAlt,
  },
  fallback: {
    backgroundColor: C.violetBg,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: C.primary,
    fontWeight: "700",
  },
  dot: {
    position: "absolute",
    backgroundColor: C.success,
    borderWidth: 2,
    borderColor: C.bg,
  },
});
