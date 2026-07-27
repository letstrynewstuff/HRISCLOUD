// src/components/KpiTile.jsx
//
// The KPI tile from design/admin-dashboard-mockup.html: mono caption,
// display-weight value on tabular figures, a single-series indigo sparkline,
// and a delta chip that pairs colour with an arrow and a label — never colour
// alone (status colours sit below 3:1 against white).
//
// Sparkline is one series, so it needs no legend: the caption names it.

import C from "../styles/colors";
import { ArrowUp, ArrowDown } from "lucide-react";

/** Builds the area + line path for a single series scaled to the viewBox. */
function sparkPaths(values, w = 96, h = 34) {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => [
    +(i * step).toFixed(2),
    +(h - 4 - ((v - min) / span) * (h - 8)).toFixed(2),
  ]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  return { line, area: `${line} L${w} ${h} L0 ${h} Z`, last: pts[pts.length - 1] };
}

export default function KpiTile({
  label,
  value,
  sub,
  icon: Icon,
  series,
  delta,            // { direction: "up" | "down" | "flat", text: string, tone?: "good" | "bad" | "flat" }
  onClick,
}) {
  const sp = sparkPaths(series);
  const tone = delta?.tone ?? "flat";
  const chip =
    tone === "good"
      ? { bg: C.successLight, fg: C.successInk }
      : tone === "bad"
        ? { bg: C.dangerLight, fg: C.dangerInk }
        : { bg: C.primaryLight, fg: C.primaryStrong };
  const Arrow = delta?.direction === "down" ? ArrowDown : ArrowUp;

  const Root = onClick ? "button" : "div";

  return (
    <Root
      onClick={onClick}
      className={`flex flex-col gap-2 p-5 text-left w-full ${onClick ? "transition-colors" : ""}`}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: C.radius.card,
        boxShadow: C.shadow.card,
      }}
    >
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span
            className="w-8 h-8 shrink-0 grid place-items-center"
            style={{
              background: C.gradient.soft,
              color: C.primaryStrong,
              borderRadius: C.radius.input,
            }}
          >
            <Icon size={16} />
          </span>
        )}
        <span className="label-mono">{label}</span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p
            className="display tnum leading-none"
            style={{ fontSize: "2.25rem", color: C.textPrimary }}
          >
            {value}
          </p>
          {sub && (
            <p className="text-xs mt-1.5" style={{ color: C.textSecondary }}>
              {sub}
            </p>
          )}
        </div>

        {sp && (
          <svg
            width="96"
            height="34"
            viewBox="0 0 96 34"
            preserveAspectRatio="none"
            className="shrink-0"
            role="img"
            aria-label={`${label} trend`}
          >
            <path d={sp.area} fill={C.primaryTint} />
            <path
              d={sp.line}
              fill="none"
              stroke={C.primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx={sp.last[0]} cy={sp.last[1]} r="3" fill={C.primary} />
          </svg>
        )}
      </div>

      {delta && (
        <span
          className="chip-pill self-start"
          style={{ background: chip.bg, color: chip.fg }}
        >
          {delta.direction !== "flat" && <Arrow size={11} />}
          {delta.text}
        </span>
      )}
    </Root>
  );
}
