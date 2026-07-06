// src/components/admin/employee/TabButton.tsx
import { Pressable, Text, StyleSheet } from "react-native";
import C from "../../../styles/colors";

type TabButtonProps = {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onPress: () => void;
};

export default function TabButton({
  label,
  icon,
  active,
  onPress,
}: TabButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        active && styles.btnActive,
        pressed && !active && { opacity: 0.7 },
      ]}
    >
      {icon}
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  btnActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
    shadowColor: C.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: C.textSecondary,
  },
  labelActive: {
    color: "#fff",
    fontWeight: "700",
  },
});
