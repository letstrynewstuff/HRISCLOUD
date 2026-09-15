// src/components/attendance/StatTile.jsx
//
// One card in the stats grid: icon chip, big value, label. Mirrors
// mobile's StatTile.tsx — reused for both the 3-up "This Month" row
// and the 4-up compact secondary row.

import { C } from "./attendanceTheme";

export default function StatTile({
  label,
  value,
  icon,
  color,
  bg,
  compact = false,
}) {
  return (
    <div
      className="rounded-2xl border p-3"
      style={{
        flexBasis: compact ? "47%" : "31%",
        flexGrow: 1,
        background: C.surface,
        borderColor: C.border,
      }}
    >
      <div
        className="w-[30px] h-[30px] rounded-[10px] flex items-center justify-center mb-2.5"
        style={{ background: bg }}
      >
        {icon}
      </div>
      <p
        className="text-[19px] font-extrabold truncate"
        style={{ color: C.textPrimary, letterSpacing: "-0.3px" }}
      >
        {value}
      </p>
      <p className="text-[11px] font-bold mt-0.5 truncate" style={{ color }}>
        {label}
      </p>
    </div>
  );
}
