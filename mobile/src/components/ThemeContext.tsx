// src/components/ThemeContext.tsx
// Light/dark theme provider for the admin app. Defaults to the device's
// system appearance (via useColorScheme), but once the user picks a theme
// in Settings → Appearance, that explicit choice is persisted and takes
// priority over the system setting until they clear it.

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useColorScheme, Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ColorScheme = "light" | "dark";

const STORAGE_KEY = "@banta_hr/theme_preference"; // "light" | "dark" | (absent = follow system)

/* ─── Palettes ──────────────────────────────────────────────
   Keep these key names in sync with src/styles/colors.ts so
   screens that use the static, non-themed C import (attendance,
   employee, etc.) stay visually consistent with themed screens
   (settings) when both are on screen at once. */
const lightColors = {
  bg: "#F7F8FA",
  surface: "#FFFFFF",
  surfaceAlt: "#F1F3F6",
  border: "#E5E8EC",

  textPrimary: "#101828",
  textSecondary: "#475467",
  textMuted: "#98A2B3",

  primary: "#4F46E5",
  primaryLight: "#EEF2FF",

  accent: "#06B6D4",
  accentLight: "#ECFEFF",

  purple: "#8B5CF6",
  purpleLight: "#F3E8FF",

  success: "#10B981",
  successLight: "#D1FAE5",

  warning: "#D97706",
  warningLight: "#FEF3C7",

  danger: "#DC2626",
  dangerLight: "#FEE2E2",

  navy: "#0F172A",
};

const darkColors = {
  bg: "#0B0F17",
  surface: "#141A24",
  surfaceAlt: "#1C232F",
  border: "#262E3A",

  textPrimary: "#F3F4F6",
  textSecondary: "#B0B8C4",
  textMuted: "#6B7484",

  primary: "#6366F1",
  primaryLight: "#1E1B4B",

  accent: "#22D3EE",
  accentLight: "#083344",

  purple: "#A78BFA",
  purpleLight: "#2E1065",

  success: "#34D399",
  successLight: "#052E20",

  warning: "#FBBF24",
  warningLight: "#3A2A05",

  danger: "#F87171",
  dangerLight: "#3A0E0E",

  navy: "#0B1220",
};

export type ThemeColors = typeof lightColors;

interface ThemeContextValue {
  scheme: ColorScheme;
  colors: ThemeColors;
  /** true if the user has explicitly picked a theme (vs following system) */
  isOverridden: boolean;
  setScheme: (scheme: ColorScheme) => void;
  toggle: () => void;
  /** Removes the saved override and goes back to following the device setting */
  useSystemDefault: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme(); // "light" | "dark" | null
  const [override, setOverride] = useState<ColorScheme | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Load any saved preference once on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === "light" || saved === "dark") {
          setOverride(saved);
        }
      } catch {
        // ignore — fall back to system default
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  // Keep in sync if the user changes their phone's appearance mid-session
  // (only matters while there's no explicit override).
  useEffect(() => {
    const sub = Appearance.addChangeListener(() => {
      // no-op: useColorScheme() re-renders consumers automatically
    });
    return () => sub.remove();
  }, []);

  const scheme: ColorScheme =
    override ?? (systemScheme === "dark" ? "dark" : "light");

  const setScheme = useCallback((next: ColorScheme) => {
    setOverride(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setScheme(scheme === "dark" ? "light" : "dark");
  }, [scheme, setScheme]);

  const useSystemDefault = useCallback(() => {
    setOverride(null);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      scheme,
      colors: scheme === "dark" ? darkColors : lightColors,
      isOverridden: override !== null,
      setScheme,
      toggle,
      useSystemDefault,
    }),
    [scheme, override, setScheme, toggle, useSystemDefault],
  );

  // Avoid a flash of the wrong theme before AsyncStorage has been read
  if (!hydrated) return null;

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme() must be used inside a <ThemeProvider>");
  }
  return ctx;
}
