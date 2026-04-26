export const REPORTS_MOCK = {
  dashboard: {
    totalHeadcount: 224,
    payrollCost: 124800000,
    turnoverRate: 8.4,
    attendanceRate: 94.2,
    leaveUtilization: 67,
  },

  headcount: {
    byDepartment: [
      { dept: "Engineering", count: 68, newHires: 12, exits: 3 },
      { dept: "Product", count: 42, newHires: 5, exits: 2 },
      { dept: "Finance", count: 28, newHires: 1, exits: 1 },
      { dept: "Sales", count: 51, newHires: 8, exits: 7 },
      { dept: "Marketing", count: 22, newHires: 4, exits: 0 },
      { dept: "HR", count: 13, newHires: 0, exits: 1 },
    ],
    gender: { male: 132, female: 92 },
  },

  payroll: {
    monthlyTrend: [
      { month: "Oct", gross: 112000000, net: 86500000 },
      { month: "Nov", gross: 118500000, net: 91200000 },
      { month: "Dec", gross: 121000000, net: 93500000 },
      { month: "Jan", gross: 124800000, net: 96300000 },
      { month: "Feb", gross: 126200000, net: 97500000 },
      { month: "Mar", gross: 124800000, net: 96300000 },
    ],
    taxPaid: 18500000,
    pensionPaid: 9800000,
  },

  attendance: {
    rate: 94.2,
    late: 14,
    absent: 23,
    departmentRates: [
      { dept: "Engineering", rate: 96.8 },
      { dept: "Sales", rate: 91.5 },
      { dept: "Product", rate: 95.2 },
    ],
  },

  leave: {
    totalTaken: 142,
    entitlementUsed: 67,
    byType: [
      { type: "Annual", taken: 68 },
      { type: "Sick", taken: 34 },
      { type: "Maternity", taken: 12 },
    ],
  },

  turnover: {
    rate: 8.4,
    exits: 19,
    byReason: [
      { reason: "Resignation", count: 12 },
      { reason: "Termination", count: 4 },
      { reason: "Redundancy", count: 3 },
    ],
    avgTenure: 2.8,
  },
};
