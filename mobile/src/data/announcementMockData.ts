// src/data/announcementMockData.ts
// Local mock data + helpers for the Announcements screen. No backend calls —
// shaped to match the web app's getAnnouncementFeed() response so swapping
// in the real API later is a drop-in replacement. Body is plain text here
// (web strips/renders HTML; RN just shows the text directly).

export type AnnouncementType =
  | "general"
  | "urgent"
  | "policy"
  | "event"
  | "reminder";

export type Announcement = {
  id: string;
  title: string;
  body: string;
  type: AnnouncementType;
  isPinned?: boolean;
  audience: "all" | "department";
  departmentName?: string;
  postedBy?: string;
  publishAt?: string;
  createdAt?: string;
  views?: number;
};

export const TYPE_CONFIG: Record<
  AnnouncementType,
  { label: string; color: string; bg: string; icon: string }
> = {
  general: { label: "General", color: "#4F46E5", bg: "#EEF2FF", icon: "📢" },
  urgent: { label: "Urgent", color: "#EF4444", bg: "#FEE2E2", icon: "⚠️" },
  policy: { label: "Policy", color: "#8B5CF6", bg: "#EDE9FE", icon: "📋" },
  event: { label: "Event", color: "#F59E0B", bg: "#FEF3C7", icon: "🎉" },
  reminder: { label: "Reminder", color: "#06B6D4", bg: "#ECFEFF", icon: "🔔" },
};

function daysAgoIso(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function seedAnnouncements(): Announcement[] {
  return [
    {
      id: "ann-1",
      title: "Townhall Meeting Reminder",
      body: "Don't forget about the company-wide townhall meeting tomorrow at 10:00 AM. We'll be covering Q2 results, the new product roadmap, and a Q&A session with leadership. Attendance is highly encouraged — link will be shared in the #general Slack channel.",
      type: "reminder",
      isPinned: true,
      audience: "all",
      postedBy: "HR Team",
      publishAt: daysAgoIso(0),
      views: 142,
    },
    {
      id: "ann-2",
      title: "Updated Remote Work Policy",
      body: "Starting next month, employees may work remotely up to 3 days per week, up from 2. Please review the updated policy document in the Documents section and acknowledge receipt by Friday. Department heads will share team-specific guidelines separately.",
      type: "policy",
      isPinned: true,
      audience: "all",
      postedBy: "Tunde Bakare",
      publishAt: daysAgoIso(2),
      views: 98,
    },
    {
      id: "ann-3",
      title: "Payroll System Maintenance — This Weekend",
      body: "The payroll and timesheet system will be undergoing scheduled maintenance this Saturday from 12 AM to 6 AM. Clock-in/out and leave requests may be temporarily unavailable. We apologize for any inconvenience.",
      type: "urgent",
      isPinned: false,
      audience: "all",
      postedBy: "IT Team",
      publishAt: daysAgoIso(1),
      views: 76,
    },
    {
      id: "ann-4",
      title: "Design Team Offsite — Save the Date",
      body: "The Product Design team will be having an offsite at Lekki on the 24th. Activities include a design sprint workshop, lunch, and a team bonding session. Please RSVP by replying to the calendar invite.",
      type: "event",
      audience: "department",
      departmentName: "Product Design",
      postedBy: "Adaeze Okonkwo",
      publishAt: daysAgoIso(4),
      views: 21,
    },
    {
      id: "ann-5",
      title: "New Health Insurance Provider",
      body: "We're excited to announce a partnership with a new health insurance provider offering expanded coverage, including dental and optical. New ID cards will be issued within two weeks. Reach out to HR with any questions.",
      type: "general",
      audience: "all",
      postedBy: "HR Team",
      publishAt: daysAgoIso(7),
      views: 134,
    },
    {
      id: "ann-6",
      title: "Performance Review Cycle Opens Monday",
      body: "The annual performance review cycle opens next Monday. Employees should complete self-assessments by the 15th, and managers will follow up with 1:1 reviews shortly after. Reach out to your manager if you have questions about the process.",
      type: "reminder",
      audience: "all",
      postedBy: "HR Team",
      publishAt: daysAgoIso(10),
      views: 88,
    },
    {
      id: "ann-7",
      title: "Office Wi-Fi Upgrade Complete",
      body: "The Lagos HQ network infrastructure has been upgraded. You should notice significantly faster speeds across all floors. Please reconnect to 'BantaHR-5G' for the best experience.",
      type: "general",
      audience: "department",
      departmentName: "Engineering",
      postedBy: "IT Team",
      publishAt: daysAgoIso(14),
      views: 45,
    },
  ];
}
