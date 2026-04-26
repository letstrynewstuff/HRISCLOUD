export const SETTINGS_MOCK = {
  company: {
    name: "TechNova Nigeria Ltd",
    rcNumber: "RC-987654",
    address: "12 Adeola Odeku Street, Victoria Island, Lagos",
    industry: "Technology",
    size: "201-500 employees",
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    workingHours: { start: "08:00", end: "17:00" },
    logo: null,
  },

  payGroup: {
    frequency: "Monthly",
    payDay: "28th",
    currency: "NGN",
    components: [
      "Basic Salary",
      "Housing Allowance",
      "Transport Allowance",
      "Meal Allowance",
    ],
  },

  users: [
    {
      id: "U001",
      name: "Ngozi Adeleke",
      email: "ngozi@technova.ng",
      role: "Super Admin",
      status: "Active",
    },
    {
      id: "U002",
      name: "Emeka Obi",
      email: "emeka@technova.ng",
      role: "HR Admin",
      status: "Active",
    },
    {
      id: "U003",
      name: "Chioma Okafor",
      email: "chioma@technova.ng",
      role: "Manager",
      status: "Invited",
    },
  ],

  roles: [
    { name: "Super Admin", description: "Full system access", users: 2 },
    { name: "HR Admin", description: "HR operations & payroll", users: 5 },
    { name: "Manager", description: "Team-level access", users: 18 },
  ],

  integrations: [
    { name: "Slack", status: "Connected", lastSync: "2 hours ago" },
    { name: "Google Workspace", status: "Connected", lastSync: "Yesterday" },
    { name: "QuickBooks", status: "Not Connected" },
  ],

  auditLogs: [
    {
      user: "Ngozi Adeleke",
      action: "Updated payroll settings",
      module: "Payroll",
      timestamp: "Mar 29, 2026 09:14 AM",
    },
    {
      user: "Emeka Obi",
      action: "Approved leave request",
      module: "Leave",
      timestamp: "Mar 28, 2026 04:22 PM",
    },
  ],

  billing: {
    plan: "Enterprise",
    employees: 224,
    maxEmployees: 300,
    monthlyCost: 2450000,
    nextBilling: "Apr 15, 2026",
  },
};
