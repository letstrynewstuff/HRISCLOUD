import {
  Briefcase,
  Package,
  MapPin,
  ChevronDown,
  Shield,
} from "lucide-react-native";
import C from "../../../styles/colors";

// Fallback light bg for accent since C.accentLight isn't in the mobile palette yet
const ACCENT_LIGHT = "#ECFEFF";

export const CATEGORY_META: Record<
  string,
  {
    icon: typeof Package;
    color: string;
    bg: string;
    label: string;
  }
> = {
  laptop: {
    icon: Briefcase,
    color: C.primary,
    bg: C.primaryLight,
    label: "Laptop",
  },
  phone: {
    icon: Package,
    color: C.accent,
    bg: ACCENT_LIGHT,
    label: "Phone / Tablet",
  },
  furniture: {
    icon: MapPin,
    color: C.warning,
    bg: C.warningLight,
    label: "Furniture",
  },
  vehicle: {
    icon: ChevronDown,
    color: C.success,
    bg: C.successLight,
    label: "Vehicle",
  },
  electronics: {
    icon: Shield,
    color: C.info,
    bg: C.infoBg,
    label: "Electronics",
  },
  other: {
    icon: Package,
    color: C.textMuted,
    bg: C.surfaceAlt,
    label: "Other",
  },
};

export const getCatMeta = (cat?: string) =>
  CATEGORY_META[cat?.toLowerCase() ?? ""] ?? {
    icon: Package,
    color: C.primary,
    bg: C.primaryLight,
    label: cat ?? "Asset",
  };
// src/components/admin/assets/assetMeta.ts

export const CATEGORY_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  laptop:      { label: "Laptop",      bg: "#DBEAFE", color: "#2563EB" },
  phone:       { label: "Phone",       bg: "#D1FAE5", color: "#10B981" },
  monitor:     { label: "Monitor",     bg: "#F3E8FF", color: "#7C3AED" },
  access_card: { label: "Access Card", bg: "#FEF3C7", color: "#B45309" },
  vehicle:     { label: "Vehicle",     bg: "#FEE2E2", color: "#EF4444" },
  furniture:   { label: "Furniture",   bg: "#EEF2FF", color: "#4F46E5" },
  other:       { label: "Other",       bg: "#F7F8FC", color: "#9C99AC" },
};

export const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  available:    { label: "Available",    bg: "#D1FAE5", color: "#10B981" },
  assigned:     { label: "Assigned",     bg: "#DBEAFE", color: "#2563EB" },
  under_repair: { label: "Under Repair", bg: "#FEF3C7", color: "#B45309" },
  retired:      { label: "Retired",      bg: "#F7F8FC", color: "#9C99AC" },
  lost:         { label: "Lost",         bg: "#FEE2E2", color: "#EF4444" },
};

export const CONDITION_OPTIONS = ["good", "fair", "damaged", "lost"];