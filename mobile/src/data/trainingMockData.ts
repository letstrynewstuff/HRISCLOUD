// src/data/trainingMockData.ts
// Local mock data + helpers for the Training screen. No backend calls —
// shaped to match the web app's /trainings/my + dashboard responses so
// swapping in getMyTrainings()/getTrainingDashboard() later is a drop-in.

export type TrainingStatus =
  | "completed"
  | "in_progress"
  | "upcoming"
  | "cancelled";
export type TrainingType = "Internal" | "External";

export type Training = {
  id: string;
  title: string;
  provider?: string;
  type: TrainingType;
  mandatory?: boolean;
  status: TrainingStatus;
  description?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  enrolled_at?: string;
  completed_at?: string;
  certificate_issued?: boolean;
  link?: string;
};

export type TrainingDashboard = {
  totalTrainings: number;
  employeesTrained: number;
  completionRate: number;
  upcomingCount: number;
  upcoming: {
    id: string;
    title: string;
    start_date?: string;
    enrolled_count?: number;
    max_attendees?: number;
    type: TrainingType;
  }[];
};

function daysAgoIso(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function daysFromNowIso(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

export function statusConfigKey(status: TrainingStatus) {
  return status;
}

export function seedTrainings(): Training[] {
  return [
    {
      id: "tr-1",
      title: "Onboarding & Company Orientation",
      provider: "BantaHR Academy",
      type: "Internal",
      mandatory: true,
      status: "completed",
      description:
        "An introduction to company values, policies, and tools for new employees.",
      start_date: daysAgoIso(170),
      end_date: daysAgoIso(168),
      location: "Lagos HQ",
      enrolled_at: daysAgoIso(172),
      completed_at: daysAgoIso(168),
      certificate_issued: true,
    },
    {
      id: "tr-2",
      title: "Design Systems Fundamentals",
      provider: "Frontend Masters",
      type: "External",
      status: "completed",
      description:
        "Building and maintaining scalable design systems across product teams.",
      start_date: daysAgoIso(90),
      end_date: daysAgoIso(83),
      location: "Remote",
      enrolled_at: daysAgoIso(95),
      completed_at: daysAgoIso(83),
      certificate_issued: true,
      link: "https://example.com/training/design-systems",
    },
    {
      id: "tr-3",
      title: "Advanced Figma Prototyping",
      provider: "BantaHR Academy",
      type: "Internal",
      status: "in_progress",
      description:
        "Hands-on workshop covering advanced prototyping, variables, and component variants.",
      start_date: daysAgoIso(5),
      end_date: daysFromNowIso(9),
      location: "Virtual (Google Meet)",
      enrolled_at: daysAgoIso(12),
      link: "https://example.com/training/figma-advanced",
    },
    {
      id: "tr-4",
      title: "Data Privacy & Security Awareness",
      provider: "BantaHR Academy",
      type: "Internal",
      mandatory: true,
      status: "upcoming",
      description:
        "Annual mandatory training on data protection, NDPR compliance, and security best practices.",
      start_date: daysFromNowIso(14),
      end_date: daysFromNowIso(14),
      location: "Virtual (Google Meet)",
    },
    {
      id: "tr-5",
      title: "Leadership & Mentorship Bootcamp",
      provider: "Maven",
      type: "External",
      status: "upcoming",
      description:
        "A 3-week cohort program for employees moving into mentorship and lead roles.",
      start_date: daysFromNowIso(30),
      end_date: daysFromNowIso(44),
      location: "Remote",
    },
    {
      id: "tr-6",
      title: "Workplace Diversity & Inclusion",
      provider: "BantaHR Academy",
      type: "Internal",
      status: "cancelled",
      description: "Rescheduled — new date to be communicated by HR.",
      start_date: daysAgoIso(20),
      end_date: daysAgoIso(20),
      location: "Lagos HQ",
    },
  ];
}

export function seedDashboard(): TrainingDashboard {
  return {
    totalTrainings: 86,
    employeesTrained: 64,
    completionRate: 78,
    upcomingCount: 2,
    upcoming: [
      {
        id: "tr-4",
        title: "Data Privacy & Security Awareness",
        start_date: daysFromNowIso(14),
        enrolled_count: 38,
        max_attendees: 60,
        type: "Internal",
      },
      {
        id: "tr-5",
        title: "Leadership & Mentorship Bootcamp",
        start_date: daysFromNowIso(30),
        enrolled_count: 12,
        max_attendees: 20,
        type: "External",
      },
    ],
  };
}
