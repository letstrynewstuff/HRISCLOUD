// src/data/payslipMockData.ts
// Local mock data + helpers for the Payslips screen. No backend calls —
// shaped to match the web app's payslip API response so swapping in
// getMyPayslip() later is a drop-in replacement.

export type Payslip = {
  id: string;
  month: number; // 1-12
  year: number;
  employeeName?: string;
  employeeCode?: string;
  departmentName?: string;
  jobRoleName?: string;
  accountNumber?: string;
  bankName?: string;
  paymentDate?: string;
  paymentMethod?: string;
  runStatus: "draft" | "processing" | "approved" | "paid";

  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  utilityAllowance: number;
  mealAllowance: number;
  overtime?: number;
  bonus?: number;
  grossSalary: number;

  payeTax: number;
  pensionEmployee: number;
  nhfDeduction: number;
  totalDeductions: number;

  netSalary: number;
};

export const MONTHS = [
  { label: "Jan", value: 1 },
  { label: "Feb", value: 2 },
  { label: "Mar", value: 3 },
  { label: "Apr", value: 4 },
  { label: "May", value: 5 },
  { label: "Jun", value: 6 },
  { label: "Jul", value: 7 },
  { label: "Aug", value: 8 },
  { label: "Sep", value: 9 },
  { label: "Oct", value: 10 },
  { label: "Nov", value: 11 },
  { label: "Dec", value: 12 },
];

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

export const STATUS_CFG = {
  draft: { label: "Draft", bg: "#F1F5F9", color: "#64748B" },
  processing: { label: "Processing", bg: "#FEF3C7", color: "#F59E0B" },
  approved: { label: "Approved", bg: "#DBEAFE", color: "#2563EB" },
  paid: { label: "Paid", bg: "#D1FAE5", color: "#10B981" },
} as const;

export function fmt(n?: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n ?? 0);
}

export function fmtShort(n?: number) {
  if (!n) return "₦0";
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n}`;
}

function makePayslip(
  month: number,
  year: number,
  overrides: Partial<Payslip> = {},
): Payslip {
  const basicSalary = 350000;
  const housingAllowance = 80000;
  const transportAllowance = 40000;
  const utilityAllowance = 20000;
  const mealAllowance = 15000;
  const overtime = month % 3 === 0 ? 12000 : 0;
  const bonus = month === 12 ? 100000 : 0;
  const grossSalary =
    basicSalary +
    housingAllowance +
    transportAllowance +
    utilityAllowance +
    mealAllowance +
    overtime +
    bonus;

  const payeTax = Math.round(grossSalary * 0.07);
  const pensionEmployee = Math.round(basicSalary * 0.08);
  const nhfDeduction = Math.round(basicSalary * 0.025);
  const totalDeductions = payeTax + pensionEmployee + nhfDeduction;
  const netSalary = grossSalary - totalDeductions;

  return {
    id: `payslip-${year}-${month}`,
    month,
    year,
    employeeName: "Adaeze Okonkwo",
    employeeCode: "BHR-0042",
    departmentName: "Product Design",
    jobRoleName: "Product Designer",
    accountNumber: "0123456789",
    bankName: "GTBank",
    paymentDate: `${year}-${String(month).padStart(2, "0")}-28`,
    paymentMethod: "Bank Transfer",
    runStatus: "paid",
    basicSalary,
    housingAllowance,
    transportAllowance,
    utilityAllowance,
    mealAllowance,
    overtime,
    bonus,
    grossSalary,
    payeTax,
    pensionEmployee,
    nhfDeduction,
    totalDeductions,
    netSalary,
    ...overrides,
  };
}

export function seedPayslips(year: number): Payslip[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year > currentYear) return [];

  const lastMonth = year === currentYear ? currentMonth : 12;

  return Array.from({ length: lastMonth }, (_, i) => lastMonth - i).map(
    (m, idx) => {
      // Most recent month is still "processing" so the screen shows a mix
      if (year === currentYear && m === currentMonth) {
        return makePayslip(m, year, { runStatus: "processing" });
      }
      return makePayslip(m, year);
    },
  );
}
