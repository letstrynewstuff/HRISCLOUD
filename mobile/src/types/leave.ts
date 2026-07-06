// src/types/leave.ts
// Shared leave domain types only. Policies are configured by Admin via
// the backend — employees only ever read this data through leaveApi.
// No mock/seed data anywhere in this file or anywhere else in the app.

export type LeaveStatus = "approved" | "pending" | "rejected" | "cancelled";

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
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus | string;
  reason?: string;
  createdAt: string;
  isPaid?: boolean;
  approvedByName?: string;
  rejectionReason?: string;
};
