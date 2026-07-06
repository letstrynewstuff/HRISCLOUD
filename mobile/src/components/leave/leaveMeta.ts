// src/components/leave/leaveMeta.ts
// Maps leave_type strings to icon + color + label, mirroring the web LEAVE_META.

import {
  Plane,
  Heart,
  Baby,
  Users,
  Coffee,
  Umbrella,
  Briefcase,
  Calendar,
  LucideIcon,
} from "lucide-react-native";
import C from "../../styles/colors";

export type LeaveMeta = {
  Icon: LucideIcon;
  color: string;
  bg: string;
  label: string;
  desc: string;
};

const LEAVE_META: Record<string, LeaveMeta> = {
  annual: {
    Icon: Plane,
    color: C.primary,
    bg: C.primaryLight,
    label: "Annual Leave",
    desc: "General paid time off",
  },
  sick: {
    Icon: Heart,
    color: C.danger,
    bg: C.dangerLight,
    label: "Sick Leave",
    desc: "Medical & health related",
  },
  maternity: {
    Icon: Baby,
    color: "#EC4899",
    bg: "#FDF2F8",
    label: "Maternity Leave",
    desc: "Statutory maternity benefit",
  },
  paternity: {
    Icon: Baby,
    color: "#7C3AED",
    bg: "#EDE9FE",
    label: "Paternity Leave",
    desc: "Statutory paternity benefit",
  },
  compassionate: {
    Icon: Users,
    color: C.accent,
    bg: C.accentGlow ? "#ECFEFF" : C.surfaceAlt,
    label: "Compassionate Leave",
    desc: "Bereavement & family emergency",
  },
  study: {
    Icon: Briefcase,
    color: C.warning,
    bg: C.warningLight,
    label: "Study Leave",
    desc: "Exams & professional development",
  },
  casual: {
    Icon: Coffee,
    color: C.success,
    bg: C.successLight,
    label: "Casual Leave",
    desc: "Short personal matters",
  },
  unpaid: {
    Icon: Umbrella,
    color: C.textMuted,
    bg: C.surfaceAlt,
    label: "Unpaid Leave",
    desc: "Time off without pay",
  },
};

export function getLeaveMeta(leaveType?: string): LeaveMeta {
  return (
    LEAVE_META[leaveType?.toLowerCase() ?? ""] ?? {
      Icon: Calendar,
      color: C.primary,
      bg: C.primaryLight,
      label: leaveType ?? "Leave",
      desc: "",
    }
  );
}

export default LEAVE_META;
