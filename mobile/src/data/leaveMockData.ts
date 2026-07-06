// src/data/leaveMockData.ts
// Local mock data + helpers for the Leave screen. No backend calls —
// everything lives in component state, seeded from here.

export type LeavePolicy = {
  id: string;
  name: string;
  leaveType: string;
  daysAllowed: number;
  requiresDocument?: boolean;
};

export type LeaveBalance = {
  id: string;
  leaveType: string;
  policyName?: string;
  taken: number;
  entitled: number;
  remaining: number;
  pendingDays?: number;
};

export type LeaveRequest = {
  id: string;
  leaveType: string;
  policyName?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  days: number;
  status: "approved" | "pending" | "rejected" | "cancelled";
  reason?: string;
  rejectionReason?: string;
  approvedByName?: string;
  createdAt: string;
  isPaid?: boolean;
};

let idCounter = 2000;
function nextId() {
  idCounter += 1;
  return `mock-leave-${idCounter}`;
}

function isoDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function isoDaysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function seedPolicies(): LeavePolicy[] {
  return [
    {
      id: "pol-annual",
      name: "Annual Leave",
      leaveType: "annual",
      daysAllowed: 20,
    },
    { id: "pol-sick", name: "Sick Leave", leaveType: "sick", daysAllowed: 10 },
    {
      id: "pol-casual",
      name: "Casual Leave",
      leaveType: "casual",
      daysAllowed: 6,
    },
    {
      id: "pol-compassionate",
      name: "Compassionate Leave",
      leaveType: "compassionate",
      daysAllowed: 5,
    },
    {
      id: "pol-study",
      name: "Study Leave",
      leaveType: "study",
      daysAllowed: 8,
      requiresDocument: true,
    },
    {
      id: "pol-unpaid",
      name: "Unpaid Leave",
      leaveType: "unpaid",
      daysAllowed: 30,
    },
  ];
}

export function seedBalances(): LeaveBalance[] {
  return [
    {
      id: "pol-annual",
      leaveType: "annual",
      policyName: "Annual Leave",
      taken: 6,
      entitled: 20,
      remaining: 14,
      pendingDays: 3,
    },
    {
      id: "pol-sick",
      leaveType: "sick",
      policyName: "Sick Leave",
      taken: 2,
      entitled: 10,
      remaining: 8,
    },
    {
      id: "pol-casual",
      leaveType: "casual",
      policyName: "Casual Leave",
      taken: 5,
      entitled: 6,
      remaining: 1,
    },
    {
      id: "pol-compassionate",
      leaveType: "compassionate",
      policyName: "Compassionate Leave",
      taken: 0,
      entitled: 5,
      remaining: 5,
    },
    {
      id: "pol-study",
      leaveType: "study",
      policyName: "Study Leave",
      taken: 8,
      entitled: 8,
      remaining: 0,
    },
    {
      id: "pol-unpaid",
      leaveType: "unpaid",
      policyName: "Unpaid Leave",
      taken: 0,
      entitled: 30,
      remaining: 30,
    },
  ];
}

export function seedHistory(): LeaveRequest[] {
  return [
    {
      id: nextId(),
      leaveType: "annual",
      policyName: "Annual Leave",
      startDate: isoDaysFromNow(10),
      endDate: isoDaysFromNow(13),
      days: 3,
      status: "pending",
      reason: "Family trip",
      createdAt: isoDaysAgo(1),
      isPaid: true,
    },
    {
      id: nextId(),
      leaveType: "annual",
      policyName: "Annual Leave",
      startDate: isoDaysAgo(40),
      endDate: isoDaysAgo(37),
      days: 4,
      status: "approved",
      reason: "Wedding ceremony",
      approvedByName: "Adaeze Okonkwo",
      createdAt: isoDaysAgo(50),
      isPaid: true,
    },
    {
      id: nextId(),
      leaveType: "sick",
      policyName: "Sick Leave",
      startDate: isoDaysAgo(20),
      endDate: isoDaysAgo(19),
      days: 2,
      status: "approved",
      reason: "Flu recovery",
      approvedByName: "Adaeze Okonkwo",
      createdAt: isoDaysAgo(21),
      isPaid: true,
    },
    {
      id: nextId(),
      leaveType: "casual",
      policyName: "Casual Leave",
      startDate: isoDaysAgo(8),
      endDate: isoDaysAgo(8),
      days: 1,
      status: "rejected",
      reason: "Personal errand",
      rejectionReason: "Team was short-staffed that day — please reschedule.",
      createdAt: isoDaysAgo(10),
      isPaid: true,
    },
    {
      id: nextId(),
      leaveType: "study",
      policyName: "Study Leave",
      startDate: isoDaysAgo(70),
      endDate: isoDaysAgo(63),
      days: 8,
      status: "approved",
      reason: "Professional certification exam prep",
      approvedByName: "Tunde Bakare",
      createdAt: isoDaysAgo(75),
      isPaid: true,
    },
  ];
}

export { nextId as nextMockLeaveId };
