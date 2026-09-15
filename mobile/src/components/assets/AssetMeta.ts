import {
  Briefcase,
  Package,
  MapPin,
  ChevronDown,
  Shield,
} from "lucide-react-native";
import C from "../../styles/colors";

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
