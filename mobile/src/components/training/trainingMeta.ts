// src/components/training/trainingMeta.ts
// Status/type color + icon mapping, mirroring the web app's statusConfig().

import {
  CheckCircle2,
  Clock,
  Timer,
  X,
  BookOpen,
  LucideIcon,
} from "lucide-react-native";
import C from "../../styles/colors";
import { TrainingStatus, TrainingType } from "../../data/trainingMockData";

export type StatusMeta = {
  label: string;
  bg: string;
  color: string;
  Icon: LucideIcon;
};

const STATUS_META: Record<TrainingStatus, StatusMeta> = {
  completed: {
    label: "Completed",
    bg: C.successLight,
    color: C.success,
    Icon: CheckCircle2,
  },
  in_progress: {
    label: "In Progress",
    bg: C.primaryLight,
    color: C.primary,
    Icon: Clock,
  },
  upcoming: {
    label: "Upcoming",
    bg: "#FEF3C7",
    color: "#F59E0B",
    Icon: Timer,
  },
  cancelled: {
    label: "Cancelled",
    bg: "#FEE2E2",
    color: "#EF4444",
    Icon: X,
  },
};

export function getStatusMeta(status: TrainingStatus): StatusMeta {
  return (
    STATUS_META[status] ?? {
      label: status,
      bg: C.surfaceAlt,
      color: C.textMuted,
      Icon: BookOpen,
    }
  );
}

export function getTypeMeta(type: TrainingType) {
  return type === "Internal"
    ? { bg: "#EDE9FE", color: "#7C3AED" }
    : { bg: "#ECFEFF", color: "#0891B2" };
}
