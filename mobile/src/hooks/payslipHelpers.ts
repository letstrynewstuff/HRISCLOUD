// src/hooks/payslipHelpers.ts

export type Payslip = {
  id: string;
  month: number;
  year: number;
  employeeName?: string;
  employeeCode?: string;
  departmentName?: string;
  jobRoleName?: string;
  basicSalary?: number;
  housingAllowance?: number;
  transportAllowance?: number;
  utilityAllowance?: number;
  mealAllowance?: number;
  overtime?: number;
  bonus?: number;
  grossSalary?: number;
  payeTax?: number;
  pensionEmployee?: number;
  nhfDeduction?: number;
  totalDeductions?: number;
  netSalary?: number;
  runStatus?: string;
  status?: string;
  paymentDate?: string;
  paymentMethod?: string;
  accountNumber?: string;
  bankName?: string;
  isManuallyEdited?: boolean;
};

export const fmt = (n?: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n ?? 0);

export const fmtShort = (n?: number) => {
  if (!n) return "₦0";
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n}`;
};

export const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const STATUS_CFG: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  draft: { label: "Draft", bg: "#F1F5F9", color: "#64748B" },
  processing: { label: "Processing", bg: "#FEF3C7", color: "#F59E0B" },
  approved: { label: "Approved", bg: "#DBEAFE", color: "#2563EB" },
  paid: { label: "Paid", bg: "#D1FAE5", color: "#10B981" },
};
