// src/components/attendance/AttendanceLogRow.jsx
//
// One row in the attendance history list: date, in/out times, hours,
// status badge, chevron. Tapping opens the detail modal. Mirrors
// mobile's AttendanceLogRow.tsx layout.

import { ChevronRight } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { C } from "./attendanceTheme";

export default function AttendanceLogRow({ entry, onPress }) {
  return (
    <button
      onClick={onPress}
      className="w-full flex items-center gap-2 py-3 px-1 border-b last:border-0 text-left transition-opacity hover:opacity-70"
      style={{ borderColor: C.border, background: "none", cursor: "pointer" }}
    >
      <div className="flex-[1.3] min-w-0">
        <p
          className="text-[13px] font-bold truncate"
          style={{ color: C.textPrimary }}
        >
          {entry.dateStr}
        </p>
        {entry.isManuallyEdited && (
          <span
            className="inline-block text-[9px] font-bold px-1.5 py-[1px] rounded-full mt-0.5"
            style={{ background: C.warningLight, color: C.warning }}
          >
            Edited
          </span>
        )}
        <p
          className="text-[11.5px] mt-0.5 truncate"
          style={{ color: C.textMuted }}
        >
          {entry.clockIn ?? "—"} – {entry.clockOut ?? "—"}
        </p>
      </div>

      <div className="flex-[0.8]">
        <p
          className="text-[13px] font-extrabold"
          style={{ color: C.textPrimary }}
        >
          {entry.hoursLabel}
        </p>
      </div>

      <div className="flex-1">
        <StatusBadge status={entry.status} />
      </div>

      <ChevronRight size={16} color={C.textMuted} />
    </button>
  );
}
