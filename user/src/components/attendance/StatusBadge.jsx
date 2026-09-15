// src/components/attendance/StatusBadge.jsx
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Minus,
} from "lucide-react";
import { C } from "./attendanceTheme";

const STATUS_MAP = {
  present: {
    label: "Present",
    bg: C.successLight,
    color: C.success,
    icon: CheckCircle2,
  },
  absent: {
    label: "Absent",
    bg: C.dangerLight,
    color: C.danger,
    icon: XCircle,
  },
  late: {
    label: "Late",
    bg: C.warningLight,
    color: C.warning,
    icon: AlertTriangle,
  },
  holiday: {
    label: "Holiday",
    bg: C.accentLight,
    color: C.accent,
    icon: Calendar,
  },
  weekend: { label: "Weekend", bg: "#F1F5F9", color: C.textMuted, icon: Minus },
};

export default function StatusBadge({ status }) {
  const {
    label,
    bg,
    color,
    icon: Icon,
  } = STATUS_MAP[status?.toLowerCase()] ?? STATUS_MAP.present;
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: bg, color }}
    >
      <Icon size={10} /> {label}
    </span>
  );
}
