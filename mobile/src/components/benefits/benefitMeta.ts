// src/components/benefits/benefitMeta.ts
// Maps benefit type strings to icon + color, mirroring the web BENEFIT_ICONS.

import {
  Heart,
  TrendingUp,
  Award,
  Shield,
  FileText,
  LucideIcon,
} from "lucide-react-native";
import C from "../../styles/colors";

export type BenefitMeta = {
  Icon: LucideIcon;
  color: string;
  bg: string;
};

const BENEFIT_ICONS: Record<string, BenefitMeta> = {
  insurance: { Icon: Heart, color: C.danger, bg: C.dangerLight },
  allowance: { Icon: TrendingUp, color: C.success, bg: C.successLight },
  pension: { Icon: Award, color: C.primary, bg: C.primaryLight },
  health: { Icon: Shield, color: "#2563EB", bg: "#DBEAFE" },
  custom: { Icon: FileText, color: C.accent, bg: "#ECFEFF" },
};

export function getBenefitMeta(type?: string): BenefitMeta {
  return (
    BENEFIT_ICONS[type?.toLowerCase() ?? ""] ?? {
      Icon: FileText,
      color: C.textMuted,
      bg: C.surfaceAlt,
    }
  );
}

export default BENEFIT_ICONS;
