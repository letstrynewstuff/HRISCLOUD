// src/components/admin/attendance/AttendanceToast.tsx
// Stacked bottom toasts — mobile equivalent of the web Toast component in
// TimesheetApproval.jsx (supports several concurrent toasts).

import { View, Text, StyleSheet } from "react-native";
import { CheckCircle2, XCircle, Clock } from "lucide-react-native";
import C from "../../../styles/colors";

export interface ToastItem {
  id: number;
  message: string;
  type?: "success" | "error" | "info";
}

export default function AttendanceToastStack({
  toasts,
}: {
  toasts: ToastItem[];
}) {
  if (!toasts.length) return null;
  return (
    <View style={s.wrap} pointerEvents="none">
      {toasts.map((t) => (
        <View key={t.id} style={[s.toast, colorsFor(t.type)]}>
          {t.type === "success" ? (
            <CheckCircle2 size={14} color={colorsFor(t.type).text.color} />
          ) : t.type === "error" ? (
            <XCircle size={14} color={colorsFor(t.type).text.color} />
          ) : (
            <Clock size={14} color={colorsFor(t.type).text.color} />
          )}
          <Text style={[s.msg, colorsFor(t.type).text]} numberOfLines={2}>
            {t.message}
          </Text>
        </View>
      ))}
    </View>
  );
}

function colorsFor(type?: string) {
  if (type === "success")
    return {
      bg: { backgroundColor: "#D1FAE5" },
      border: { borderColor: "#6EE7B7" },
      text: { color: "#059669" },
    };
  if (type === "error")
    return {
      bg: { backgroundColor: "#FEE2E2" },
      border: { borderColor: "#FCA5A5" },
      text: { color: "#DC2626" },
    };
  return {
    bg: { backgroundColor: "#EFF6FF" },
    border: { borderColor: "#BFDBFE" },
    text: { color: C.primary },
  };
}

const s = StyleSheet.create({
  wrap: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    gap: 8,
    zIndex: 999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  msg: { flex: 1, fontSize: 12, fontWeight: "700" },
});
