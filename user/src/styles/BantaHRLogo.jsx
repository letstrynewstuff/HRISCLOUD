// src/styles/BantaHRLogo.jsx


const SIZES = { sm: 32, md: 42, lg: 56 };

export default function BantaHRLogo({
  variant = "light",
  size = "md",
  showText = true,
  style = {},
}) {
  const h = SIZES[size] ?? 42;
  const iconSize = h;
  const markColor = variant === "dark" ? "#0F1629" : "#FFFFFF";
  const hrColor = variant === "dark" ? "#4F46E5" : "#06B6D4";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: h * 0.3,
        flexShrink: 0,
        ...style,
      }}
    >
      {/* ── Icon mark ── */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Rounded-square background */}
        <rect width="56" height="56" rx="14" fill="url(#banta-grad)" />

        {/* Subtle inner glow ring */}
        <rect
          x="1"
          y="1"
          width="54"
          height="54"
          rx="13"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.5"
          fill="none"
        />

        {/* — Left person (smaller, receding) — */}
        {/* Head */}
        <circle cx="14" cy="19" r="5" fill="rgba(255,255,255,0.55)" />
        {/* Body */}
        <path
          d="M6 38c0-5.523 3.582-10 8-10s8 4.477 8 10"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* — Right person (smaller, receding) — */}
        {/* Head */}
        <circle cx="42" cy="19" r="5" fill="rgba(255,255,255,0.55)" />
        {/* Body */}
        <path
          d="M34 38c0-5.523 3.582-10 8-10s8 4.477 8 10"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* — Centre person (foreground, full white) — */}
        {/* Head */}
        <circle cx="28" cy="17" r="6.5" fill="#FFFFFF" />
        {/* Body */}
        <path
          d="M18 40c0-6.627 4.477-12 10-12s10 5.373 10 12"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Subtle connection arc between three people */}
        <path
          d="M14 32 Q28 26 42 32"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Cyan accent dot — bottom right corner */}
        <circle cx="44" cy="44" r="5" fill="#06B6D4" />
        <path
          d="M41.5 44l1.8 1.8 3.2-3.2"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Gradient defs */}
        <defs>
          <linearGradient
            id="banta-grad"
            x1="0"
            y1="0"
            x2="56"
            y2="56"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#3730A3" />
            <stop offset="55%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>
        </defs>
      </svg>

      {/* ── Wordmark ── */}
      {showText && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          <span
            style={{
              fontFamily: "'Sora', 'DM Sans', sans-serif",
              fontWeight: 800,
              fontSize: h * 0.45,
              letterSpacing: "-0.03em",
              color: markColor,
              whiteSpace: "nowrap",
            }}
          >
            Banta
            <span style={{ color: hrColor }}>HR</span>
          </span>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              fontSize: h * 0.22,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color:
                variant === "dark"
                  ? "rgba(15,22,41,0.45)"
                  : "rgba(255,255,255,0.5)",
              marginTop: 1,
            }}
          >
            People Platform
          </span>
        </div>
      )}
    </div>
  );
}
