// src/components/admin/benefits/BenefitsToast.tsx

import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { CheckCircle2, XCircle } from "lucide-react-native";
import C from "../../../styles/colors";

interface Props {
  msg: string;
  type?: "success" | "error";
  onDone: () => void;
}

export default function BenefitsToast({
  msg,
  type = "success",
  onDone,
}: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  const Icon = type === "success" ? CheckCircle2 : XCircle;

  return (
    <View style={styles.toast}>
      <Icon size={16} color={type === "success" ? C.success : C.danger} />
      <Text style={styles.text}>{msg}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 28,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: "#1E1B4B",
  },
  text: { color: "#fff", fontSize: 13, fontWeight: "700", flex: 1 },
});
