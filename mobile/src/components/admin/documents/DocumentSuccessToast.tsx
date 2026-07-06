// src/components/admin/documents/DocumentSuccessToast.tsx

import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { CheckCircle2 } from "lucide-react-native";

interface Props {
  count: number;
  onDone: () => void;
}

export default function DocumentSuccessToast({ count, onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <View style={styles.toast}>
      <CheckCircle2 size={20} color="#fff" />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Document sent for signature!</Text>
        <Text style={styles.sub}>
          {count} employee{count !== 1 ? "s" : ""} notified · status updates
          when signed
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#16A34A",
  },
  title: { color: "#fff", fontSize: 13, fontWeight: "800" },
  sub: { color: "rgba(255,255,255,0.85)", fontSize: 11, marginTop: 2 },
});
