// src/components/attendance/LiveTimer.jsx
//
// Ticking HH:MM:SS elapsed timer. Mirrors mobile's LiveTimer.tsx exactly
// — just counts up from `startTime`, no pause/resume offset math (the
// previous web version had that, but mobile's Hero never needs it since
// it only ever renders one timer chip at a time: the work timer OR the
// break timer, never both simultaneously combined into one number).

import { useEffect, useState } from "react";

const pad = (n) => String(n).padStart(2, "0");

export default function LiveTimer({ startTime, className = "", style = {} }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    const tick = () => {
      setElapsed(
        Math.max(0, Math.floor((Date.now() - startTime.getTime()) / 1000)),
      );
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [startTime]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;

  return (
    <span
      className={`tabular-nums font-bold font-mono ${className}`}
      style={style}
    >
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}
