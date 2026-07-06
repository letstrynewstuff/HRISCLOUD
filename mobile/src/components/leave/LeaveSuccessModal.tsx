// src/components/leave/LeaveSuccessModal.tsx
// Confirmation shown right after a leave request is submitted.

import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import C from "../../styles/colors";

type LeaveSuccessModalProps = {
  open: boolean;
  onViewHistory: () => void;
  onApplyAnother: () => void;
};

export default function LeaveSuccessModal({
  open,
  onViewHistory,
  onApplyAnother,
}: LeaveSuccessModalProps) {
  return (
    <Modal visible={open} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.iconWrap}>
            <CheckCircle2 size={40} color={C.success} />
          </View>
          <Text style={styles.title}>Leave Applied! 🎉</Text>
          <Text style={styles.subtitle}>
            Your request has been submitted and is pending approval from your
            line manager.
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>What happens next?</Text>
            <Text style={styles.infoBody}>
              Your manager will review and approve within 1–2 business days.
              You'll be notified once a decision is made.
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onViewHistory}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && { opacity: 0.88 },
              ]}
            >
              <Text style={styles.primaryLabel}>View History</Text>
            </Pressable>
            <Pressable
              onPress={onApplyAnother}
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.secondaryLabel}>Apply Another</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  sheet: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    backgroundColor: C.surface,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.successLight,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: C.textPrimary,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 16,
  },
  infoBox: {
    width: "100%",
    borderRadius: 14,
    padding: 13,
    backgroundColor: C.successLight,
    marginBottom: 18,
  },
  infoTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: C.success,
    marginBottom: 4,
  },
  infoBody: {
    fontSize: 11.5,
    color: C.textSecondary,
    lineHeight: 16,
  },
  actions: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.primary,
  },
  primaryLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#fff",
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  secondaryLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: C.textSecondary,
  },
});
