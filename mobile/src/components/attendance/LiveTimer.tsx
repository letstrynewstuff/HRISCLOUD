// src/components/attendance/LiveTimer.tsx
// Ticking HH:MM:SS elapsed timer, used in the attendance hero card while
// the user is clocked in. Pure presentational — driven by a startTime.

import { useEffect, useState } from "react";
import { Text, TextStyle } from "react-native";

type LiveTimerProps = {
  startTime: Date | null;
  style?: TextStyle | TextStyle[];
};

const pad = (n: number) => String(n).padStart(2, "0");

export default function LiveTimer({ startTime, style }: LiveTimerProps) {
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
    <Text style={style}>
      {pad(h)}:{pad(m)}:{pad(s)}
    </Text>
  );
}
