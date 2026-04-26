export const TRAINING_MOCK = {
  dashboard: {
    completionRate: 87,
    upcomingCount: 12,
    totalEmployeesTrained: 184,
    quarterlySpend: 1248000,
  },

  catalog: [
    {
      id: "TR-001",
      title: "Advanced React & TypeScript",
      type: "Internal",
      provider: "HRISCloud Academy",
      status: "active",
      duration: "3 days",
      cost: 450000,
      attendees: 24,
      maxAttendees: 30,
    },
    {
      id: "TR-002",
      title: "Leadership Mastery Program",
      type: "External",
      provider: "Harvard Business Publishing",
      status: "active",
      duration: "6 weeks",
      cost: 1250000,
      attendees: 8,
      maxAttendees: 15,
    },
    // ... more realistic entries
  ],

  upcoming: [
    {
      id: "UP-001",
      title: "Cybersecurity Essentials",
      date: "Apr 5, 2026",
      type: "Virtual",
    },
    {
      id: "UP-002",
      title: "Finance for Non-Finance Managers",
      date: "Apr 12, 2026",
      type: "In-person",
    },
  ],

  attendance: [
    {
      id: "AT-001",
      training: "Advanced React",
      employee: "Amara Johnson",
      status: "Attended",
      date: "Mar 20",
    },
    {
      id: "AT-002",
      training: "Leadership Mastery",
      employee: "Tunde Bakare",
      status: "Missed",
      date: "Mar 18",
    },
  ],

  budget: {
    totalBudget: 8500000,
    spent: 3120000,
    departments: [
      { name: "Engineering", spent: 1450000, budget: 3000000 },
      { name: "Product", spent: 820000, budget: 1800000 },
      { name: "Sales", spent: 450000, budget: 1200000 },
    ],
  },

  certifications: [
    {
      id: "CERT-001",
      employee: "Chioma Okafor",
      cert: "PMP",
      expiry: "Jun 15, 2026",
      status: "Valid",
    },
    {
      id: "CERT-002",
      employee: "Emeka Eze",
      cert: "AWS Solutions Architect",
      expiry: "Apr 2, 2026",
      status: "Expiring",
    },
  ],
};
