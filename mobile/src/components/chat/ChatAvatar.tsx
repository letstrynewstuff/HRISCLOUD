// src/components/chat/ChatAvatar.tsx
// Deterministic color avatar used throughout the Team/Chat screens.

import { View, Text, StyleSheet, Image } from "react-native";
import { colorFor, getInitials } from "../../hooks/chatHelpers";

type ChatAvatarProps = {
  name?: string;
  uri?: string;
  size?: number;
};

export default function ChatAvatar({
  name = "",
  uri,
  size = 36,
}: ChatAvatarProps) {
  const fontSize = Math.round(size * 0.35);
  const borderRadius = size / 2;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{
          width: size,
          height: size,
          borderRadius,
          backgroundColor: "#E4E7F0",
        }}
      />
    );
  }

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: colorFor(name),
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: "#fff",
    fontWeight: "700",
  },
});
