// src/data/announcementConfig.ts
// Visual config keyed by `audience` — the real field returned by the backend.
// Replaces the old type/TYPE_CONFIG mock system entirely.

import C from "../styles/colors";

export type Audience = "all" | "department" | "role";

export type AnnouncementCfg = {
  label: string;
  icon: string;
  color: string;
  bg: string;
};

export const AUDIENCE_CONFIG: Record<Audience, AnnouncementCfg> = {
  all: {
    label: "Company-wide",
    icon: "📢",
    color: C.primary,
    bg: C.primaryLight,
  },
  department: {
    label: "Department",
    icon: "🏢",
    color: C.blue,
    bg: C.blueBg,
  },
  role: {
    label: "Role-based",
    icon: "👤",
    color: C.violet,
    bg: C.violetBg,
  },
};

export function audienceConfig(audience?: string | null): AnnouncementCfg {
  return (
    AUDIENCE_CONFIG[(audience as Audience) ?? "all"] ?? AUDIENCE_CONFIG.all
  );
}

// ─── Shared Announcement type (matches announcementApi normalizer) ──
export type Announcement = {
  id: string;
  companyId: string;
  title: string;
  body: string;
  audience: Audience;
  departmentId: string | null;
  departmentName: string | null;
  isPinned: boolean;
  publishAt: string | null;
  expiresAt: string | null;
  views: number;
  createdAt: string;
  updatedAt: string | null;
  createdById?: string | null;
  createdByName?: string | null;
  postedBy?: string | null;
};
