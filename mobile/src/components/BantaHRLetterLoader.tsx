// import type { BantaHRLetterLoaderRef } from "../components/BantaHRLetterLoader";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Animated,
  Easing,
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";

const TEAL = "#00B5AD";
const NAVY = "#1A2E5A";

const LETTER_DURATION = 320;
const STAGGER_MS = 85;
const HOLD_MS = 550;
const FADE_MS = 260;
const PAUSE_MS = 260;

/* ── helpers ── */
function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const int = parseInt(full, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function lerpColor(hexA: string, hexB: string, t: number) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

/* ── types ── */
export interface BantaHRLetterLoaderRef {
  show: () => void;
  hide: () => void;
}

interface Props {
  text?: string;
  fontSize?: number;
  subtitle?: string;
  overlay?: boolean;
  overlayColor?: string;
  style?: StyleProp<ViewStyle>;
}

/* ── component ── */
const BantaHRLetterLoader = forwardRef<BantaHRLetterLoaderRef, Props>(
  (props, ref) => {
    const {
      text = "BANTAHR",
      fontSize = 30,
      subtitle,
      overlay = false,
      overlayColor = "rgba(11,22,40,0.92)",
      style,
    } = props;

    const [isVisible, setIsVisible] = useState(false);
    const letters = useMemo(() => text.split(""), [text]);
    const n = letters.length;

    // animated values (sized once; text prop is effectively static for a global loader)
    const baseOpacities = useRef(
      letters.map(() => new Animated.Value(0)),
    ).current;
    const translateYs = useRef(
      letters.map(() => new Animated.Value(8)),
    ).current;
    const scales = useRef(letters.map(() => new Animated.Value(0.6))).current;
    const masterFade = useRef(new Animated.Value(1)).current;
    const progress = useRef(new Animated.Value(0)).current;
    const cursorBlink = useRef(new Animated.Value(1)).current;
    const glowPulse = useRef(new Animated.Value(0)).current;

    const [trackWidth, setTrackWidth] = useState(() => fontSize * n * 0.65);

    /* imperative API */
    useImperativeHandle(ref, () => ({
      show: () => setIsVisible(true),
      hide: () => setIsVisible(false),
    }));

    /* animation loop – starts fresh every time the loader becomes visible */
    useEffect(() => {
      if (!isVisible) return;

      const blink = Animated.loop(
        Animated.sequence([
          Animated.timing(cursorBlink, {
            toValue: 0,
            duration: 420,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(cursorBlink, {
            toValue: 1,
            duration: 420,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      );

      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowPulse, {
            toValue: 1,
            duration: 1400,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(glowPulse, {
            toValue: 0,
            duration: 1400,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]),
      );

      blink.start();
      glow.start();

      const resetAll = Animated.parallel([
        ...letters.map((_, i) =>
          Animated.parallel([
            Animated.timing(baseOpacities[i], {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(translateYs[i], {
              toValue: 8,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(scales[i], {
              toValue: 0.6,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ),
        Animated.timing(masterFade, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]);

      const reveal = Animated.parallel([
        Animated.stagger(
          STAGGER_MS,
          letters.map((_, i) =>
            Animated.parallel([
              Animated.timing(baseOpacities[i], {
                toValue: 1,
                duration: LETTER_DURATION,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(translateYs[i], {
                toValue: 0,
                duration: LETTER_DURATION,
                easing: Easing.out(Easing.back(1.6)),
                useNativeDriver: true,
              }),
              Animated.timing(scales[i], {
                toValue: 1,
                duration: LETTER_DURATION,
                easing: Easing.out(Easing.back(1.6)),
                useNativeDriver: true,
              }),
            ]),
          ),
        ),
        Animated.timing(progress, {
          toValue: 1,
          duration: STAGGER_MS * (n - 1) + LETTER_DURATION,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ]);

      const hold = Animated.delay(HOLD_MS);

      const hide = Animated.parallel([
        Animated.timing(masterFade, {
          toValue: 0,
          duration: FADE_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: FADE_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: false,
        }),
      ]);

      const pause = Animated.delay(PAUSE_MS);

      const cycle = Animated.loop(
        Animated.sequence([resetAll, reveal, hold, hide, pause]),
      );
      cycle.start();

      return () => {
        blink.stop();
        glow.stop();
        cycle.stop();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible, text]);

    const glowScale = glowPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, 1.12],
    });
    const glowOpacity = glowPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.16, 0.38],
    });

    const letterColors = useMemo(
      () =>
        letters.map((_, i) => lerpColor(TEAL, NAVY, n <= 1 ? 0 : i / (n - 1))),
      [letters, n],
    );

    if (!isVisible) return null;

    const content = (
      <View style={[styles.wrap, style]}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glow,
            {
              width: fontSize * n * 1.1,
              height: fontSize * 2.2,
              borderRadius: fontSize,
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />

        <View
          style={styles.row}
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        >
          {letters.map((ch, i) => (
            <Animated.Text
              key={`${ch}-${i}`}
              style={[
                styles.letter,
                {
                  fontSize,
                  color: letterColors[i],
                  opacity: Animated.multiply(baseOpacities[i], masterFade),
                  transform: [
                    { translateY: translateYs[i] },
                    { scale: scales[i] },
                  ],
                },
              ]}
            >
              {ch}
            </Animated.Text>
          ))}
          <Animated.View
            style={[
              styles.cursor,
              {
                height: fontSize * 0.72,
                opacity: Animated.multiply(cursorBlink, masterFade),
              },
            ]}
          />
        </View>

        <View style={[styles.track, { width: trackWidth }]}>
          <Animated.View
            style={[
              styles.fill,
              {
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, trackWidth],
                }),
              },
            ]}
          />
        </View>

        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    );

    if (overlay) {
      return (
        <View
          style={[styles.overlay, { backgroundColor: overlayColor }]}
          pointerEvents="auto"
        >
          {content}
        </View>
      );
    }

    return content;
  },
);

BantaHRLetterLoader.displayName = "BantaHRLetterLoader";

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    backgroundColor: TEAL,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  letter: {
    fontWeight: "800",
    letterSpacing: 1,
  },
  cursor: {
    width: 3,
    borderRadius: 1.5,
    backgroundColor: TEAL,
    marginLeft: 3,
    marginBottom: 4,
  },
  track: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(26,46,90,0.12)",
    marginTop: 12,
    overflow: "hidden",
  },
  fill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: TEAL,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: "600",
    color: NAVY,
    letterSpacing: 0.3,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
});

export default BantaHRLetterLoader;
