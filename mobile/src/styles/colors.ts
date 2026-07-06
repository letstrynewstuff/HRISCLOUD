// src/styles/colors.ts

const C = {
  /* Dark side (left panel + overall bg) */
  navy: "#1E1B4B",
  navyMid: "#2D2A6E",
  navyLight: "#3D3A8E",
  navyGlow: "rgba(79,70,229,0.35)",

  /* Brand colours */
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  accent: "#06B6D4",
  accentGlow: "rgba(6,182,212,0.3)",
  bg: "#F0F2F8",

  /* Surface */
  surface: "#FFFFFF",
  surfaceAlt: "#F7F8FC",
  border: "#E4E7F0",
  borderFocus: "#4F46E5",

//   bg: "#F6F5FB", // app background — soft lavender-grey
//   surface: "#FFFFFF", // cards
//   surfaceAlt: "#F3F2FA", // subtle alt surface (icon chips, pills)
//   border: "#ECEAF5",

  // Brand
//   primary: "#5B4FE9", // indigo/violet — Clock In button, active tab
  primaryDark: "#3D33C7",
//   navy: "#1E1B4B", // logo text
//   accent: "#06B6D4", // cyan accent (logo "HR")

  // Text
  textPrimary: "#15132B",
  textSecondary: "#6B6880",
  textMuted: "#9C99AC",
  textOnPrimary: "#FFFFFF",

  /* Semantic */
  success: "#10B981",
  successLight: "#D1FAE5",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  purple: "#8B5CF6",

  // Status
  //   success: "#1FA971",
  successBg: "#E6F7EF",
  //   warning: "#F5A524",
  warningBg: "#FEF3DD",
  //   danger: "#E5484D",
  dangerBg: "#FCE8E8",
  info: "#5B4FE9",
  infoBg: "#EEEDFB",

  // Misc accents used by quick-action tiles
  leafGreen: "#1FA971",
  leafBg: "#E7F7EE",
  violet: "#7C6FF0",
  violetBg: "#EFEDFC",
  blue: "#3B82F6",
  blueBg: "#E8F0FE",
  orange: "#F2994A",
  orangeBg: "#FDEEE0",
  amber: "#F5A524",
  amberBg: "#FEF3DD",
  rose: "#EF5A82",
  roseBg: "#FCE8EE",

  /* Text */
//   textPrimary: "#0F172A",
//   textSecondary: "#64748B",
//   textMuted: "#94A3B8",
} as const;

export type ColorKey = keyof typeof C;

export default C;



