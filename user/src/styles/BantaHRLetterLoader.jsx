import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

const TEAL = "#00B5AD";
const NAVY = "#1A2E5A";
const LETTER_DURATION = 320;
const STAGGER_MS = 85;
const HOLD_MS = 550;
const FADE_MS = 260;
const PAUSE_MS = 260;

/* ── helpers ── */
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h.split("").map((c) => c + c).join("")
      : h;
  const int = parseInt(full, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function lerpColor(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

/* ── component ── */
const BantaHRLetterLoader = forwardRef((props, ref) => {
  const {
    text = "BANTAHR",
    fontSize = 30,
    subtitle,
    overlay = false,
    overlayColor = "rgba(11,22,40,0.92)",
    style = {},
    visible = true,
  } = props;

  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);
  const [cycleKey, setCycleKey] = useState(0);
  const letters = useMemo(() => text.split(""), [text]);
  const n = letters.length;
  const intervalRef = useRef(null);

  const revealDuration = STAGGER_MS * (n - 1) + LETTER_DURATION;
  const cycleDuration = revealDuration + HOLD_MS + FADE_MS + PAUSE_MS;

  /* imperative API */
  useImperativeHandle(ref, () => ({
    show: () => setIsVisible(true),
    hide: () => setIsVisible(false),
  }));

  /* animation loop */
  useEffect(() => {
    if (!isVisible) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    setCycleKey((k) => k + 1);
    intervalRef.current = setInterval(() => {
      setCycleKey((k) => k + 1);
    }, cycleDuration);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isVisible, cycleDuration]);

  const letterColors = useMemo(
    () =>
      letters.map((_, i) => lerpColor(TEAL, NAVY, n <= 1 ? 0 : i / (n - 1))),
    [letters, n]
  );

  if (!isVisible) return null;

  const wrapStyle = {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    ...style,
  };

  const content = (
    <div style={wrapStyle}>
      {/* glow */}
      <div
        style={{
          position: "absolute",
          width: fontSize * n * 1.1,
          height: fontSize * 2.2,
          borderRadius: fontSize,
          backgroundColor: TEAL,
          opacity: 0.25,
          animation: "glowPulse 2800ms cubic-bezier(0.4, 0, 0.2, 1) infinite",
          filter: "blur(20px)",
          zIndex: 0,
          transform: "translateZ(0)",
        }}
      />

      {/* cycling content */}
      <div
        key={cycleKey}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 1,
          position: "relative",
        }}
      >
        {/* letters + cursor */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            animation: `masterFade ${FADE_MS}ms cubic-bezier(0.32, 0, 0.67, 0) ${
              revealDuration + HOLD_MS
            }ms forwards`,
          }}
        >
          {letters.map((ch, i) => (
            <span
              key={i}
              style={{
                fontSize,
                color: letterColors[i],
                fontWeight: 800,
                letterSpacing: 1,
                lineHeight: 1,
                display: "inline-block",
                opacity: 0,
                transform: "translateY(8px) scale(0.6)",
                animation: `letterPop ${LETTER_DURATION}ms cubic-bezier(0.34, 1.56, 0.64, 1) ${
                  i * STAGGER_MS
                }ms forwards`,
              }}
            >
              {ch}
            </span>
          ))}
          <span
            style={{
              width: 3,
              height: fontSize * 0.72,
              borderRadius: 1.5,
              backgroundColor: TEAL,
              marginLeft: 3,
              marginBottom: 4,
              display: "inline-block",
              animation: "cursorBlink 840ms linear infinite",
            }}
          />
        </div>

        {/* progress track */}
        <div
          style={{
            height: 3,
            borderRadius: 2,
            backgroundColor: "rgba(26,46,90,0.12)",
            marginTop: 12,
            overflow: "hidden",
            width: fontSize * n * 0.65,
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 2,
              backgroundColor: TEAL,
              width: "0%",
              animation: `progressFill ${revealDuration}ms linear forwards`,
            }}
          />
        </div>
      </div>

      {/* subtitle */}
      {subtitle ? (
        <p
          style={{
            marginTop: 12,
            fontSize: 12,
            fontWeight: 600,
            color: NAVY,
            letterSpacing: 0.3,
            margin: 0,
            zIndex: 1,
          }}
        >
          {subtitle}
        </p>
      ) : null}

      <style>{`
        @keyframes letterPop {
          0%   { opacity: 0; transform: translateY(8px) scale(0.6); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes masterFade {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes progressFill {
          0%   { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.16; transform: scale(0.9); }
          50%      { opacity: 0.38; transform: scale(1.12); }
        }
      `}</style>
    </div>
  );

  if (overlay) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: overlayColor,
          zIndex: 9999,
        }}
      >
        {content}
      </div>
    );
  }

  return content;
});

BantaHRLetterLoader.displayName = "BantaHRLetterLoader";

export default BantaHRLetterLoader;