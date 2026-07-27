// src/components/PageHero.jsx
//
// The gradient page header used across the app. Extracted from the banner in
// components/Header.jsx (seen on /admin/documents/admin-documents) so every
// page gets the same treatment instead of building its own.
//
// Design rules it enforces:
//   · One saturated surface per page, on C.gradient.hero (D1)
//   · Title is display type at weight 500 (D3)
//   · Stat captions in DM Mono, uppercase
//   · Actions are pills (D4)
//   · Flat depth — the gradient carries the emphasis, not a shadow

import { motion as Motion } from "framer-motion";
import C from "../styles/colors";

export default function PageHero({
  title,
  subtitle,
  icon: Icon,
  stats = [],
  actions = null,
  eyebrow = null,
  className = "",
}) {
  return (
    <div className={`px-5 md:px-7 pt-6 ${className}`}>
      <Motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden p-7 md:p-8 text-white"
        style={{ background: C.gradient.hero, borderRadius: C.radius.card }}
      >
        {/* Soft bloom, the same one the marketing hero carries */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            left: "50%",
            top: "-70%",
            transform: "translateX(-50%)",
            width: "min(880px, 120%)",
            aspectRatio: "1.3",
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.20), transparent 66%)",
          }}
        />

        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-4 min-w-0">
            {Icon && (
              <div
                className="w-14 h-14 shrink-0 grid place-items-center"
                style={{
                  background: "rgba(255,255,255,0.16)",
                  border: "1px solid rgba(255,255,255,0.24)",
                  borderRadius: C.radius.card,
                }}
              >
                <Icon size={26} color="#fff" />
              </div>
            )}

            <div className="min-w-0">
              {eyebrow && (
                <p
                  className="label-mono mb-1"
                  style={{ color: C.indigo[200], fontSize: 11 }}
                >
                  {eyebrow}
                </p>
              )}
              <h1 className="display text-2xl md:text-3xl truncate">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.78)" }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="md:ml-auto flex flex-wrap items-center gap-3">
            {stats.map(({ label, value }, i) => (
              <div
                key={`${label}-${i}`}
                className="flex flex-col gap-0.5 px-4 py-2"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  borderRadius: C.radius.input,
                }}
              >
                <span
                  className="display tnum text-lg leading-none"
                  style={{ color: "#fff" }}
                >
                  {value}
                </span>
                <span
                  className="label-mono"
                  style={{ color: "rgba(255,255,255,0.66)", fontSize: 10 }}
                >
                  {label}
                </span>
              </div>
            ))}
            {actions}
          </div>
        </div>
      </Motion.div>
    </div>
  );
}
