// src/data/benefitsMockData.ts
export type Benefit = {
  id: string;
  benefitName: string;
  type: "insurance" | "allowance" | "pension" | "health" | "custom" | string;
  provider?: string;
  status?: "active" | "inactive" | "pending";
  startDate?: string;
  endDate?: string;
  description?: string;
  usageInstructions?: string;
  isInsurance?: boolean;
};

export function seedBenefits(): Benefit[] {
  return [
    {
      id: "1",
      benefitName: "Premium Health Coverage",
      type: "insurance",
      provider: "Blue Cross Alliance",
      status: "active",
      startDate: "Jan 01, 2026",
      endDate: "Ongoing",
      description:
        "Comprehensive medical protection including dental & vision coverages.",
      usageInstructions:
        "Present your digital ID card at any network hospital or claim via portal.",
      isInsurance: true,
    },
    {
      id: "2",
      benefitName: "Monthly Wellness Stipend",
      type: "allowance",
      provider: "Internal HR",
      status: "active",
      startDate: "Feb 15, 2026",
      description:
        "Gym memberships, fitness gear, and mental wellness reimbursement.",
    },
  ];
}
