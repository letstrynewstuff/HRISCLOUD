// src/components/admin/department/DeptToast.tsx
// Bottom toast — mirrors the Toast pattern used in EmployeeProfileView.tsx.

import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { CheckCircle2, AlertCircle, X } from "lucide-react-native";
import C from "../../../styles/colors";

interface Props {
  msg: string;
  type?: "success" | "error";
  onClose: () => void;
}

export default function DeptToast({ msg, type = "success", onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <View style={s.toast}>
      {type === "error" ? (
        <AlertCircle size={16} color={C.danger} />
      ) : (
        <CheckCircle2 size={16} color={C.success} />
      )}
      <Text style={s.text} numberOfLines={2}>
        {msg}
      </Text>
      <Pressable onPress={onClose} hitSlop={8}>
        <X size={14} color="rgba(255,255,255,0.5)" />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.navy,
    zIndex: 50,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  text: { flex: 1, fontSize: 13, color: "#fff", fontWeight: "600" },
});
