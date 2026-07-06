import { View, Text, StyleSheet } from "react-native";
import {
  User,
  Briefcase,
  DollarSign,
  CreditCard,
  Check,
} from "lucide-react-native";
import C from "../../../styles/colors";

const STEPS = [
  { id: 1, label: "Personal", icon: User, desc: "Basic info" },
  { id: 2, label: "Job", icon: Briefcase, desc: "Role & dept" },
  { id: 3, label: "Salary", icon: DollarSign, desc: "Compensation" },
  { id: 4, label: "Bank", icon: CreditCard, desc: "Payment details" },
];

export default function StepIndicator({
  currentStep,
}: {
  currentStep: number;
}) {
  const pct = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>
      <View style={styles.stepsRow}>
        {STEPS.map((step) => {
          const done = step.id < currentStep;
          const active = step.id === currentStep;
          const Icon = step.icon;
          return (
            <View key={step.id} style={styles.stepItem}>
              <View
                style={[
                  styles.iconWrap,
                  done && { backgroundColor: C.success },
                  active && {
                    backgroundColor: C.primary,
                    transform: [{ scale: 1.1 }],
                  },
                ]}
              >
                {done ? (
                  <Check size={14} color="#fff" />
                ) : (
                  <Icon size={14} color={active ? "#fff" : C.textMuted} />
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  active && { color: C.primary },
                  done && { color: C.success },
                ]}
              >
                {step.label}
              </Text>
              <Text style={styles.desc}>{step.desc}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    marginBottom: 4,
  },
  progressBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    marginBottom: 14,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: C.primary,
  },
  stepsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stepItem: { alignItems: "center", flex: 1 },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    marginTop: 6,
  },
  desc: {
    fontSize: 9,
    color: C.textMuted,
    marginTop: 2,
  },
});
