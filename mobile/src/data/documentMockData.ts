// src/data/documentMockData.ts
// Local mock data + helpers for the Documents screen. No backend calls —
// shaped to match the web app's /documents/my response so swapping in
// documentApi.getMyDocuments() later is a drop-in replacement.

export type DocStatus = "pending" | "sent" | "signed";

export type EmployeeDocument = {
  id: string;
  document_name?: string;
  template_name?: string;
  category?: string;
  status: DocStatus;
  sent_by?: string;
  sent_at?: string;
  created_at?: string;
  signed_at?: string;
  message?: string;
  file_url?: string;
  file_name?: string;
  mime_type?: string;
  final_content?: string;
};

function daysAgoIso(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function seedDocuments(): EmployeeDocument[] {
  return [
    {
      id: "doc-1",
      document_name: "Offer Letter — Product Designer",
      category: "Onboarding",
      status: "signed",
      sent_by: "HR Team",
      sent_at: daysAgoIso(180),
      signed_at: daysAgoIso(178),
      file_name: "offer_letter.pdf",
      mime_type: "application/pdf",
      file_url: "https://example.com/offer_letter.pdf",
      message: "Welcome aboard! Please review and sign your offer letter.",
    },
    {
      id: "doc-2",
      document_name: "Employment Contract 2024",
      category: "Contracts",
      status: "signed",
      sent_by: "Adaeze Okonkwo",
      sent_at: daysAgoIso(175),
      signed_at: daysAgoIso(170),
      file_name: "employment_contract_2024.pdf",
      mime_type: "application/pdf",
      file_url: "https://example.com/employment_contract.pdf",
    },
    {
      id: "doc-3",
      document_name: "Updated NDA & Confidentiality Agreement",
      category: "Compliance",
      status: "sent",
      sent_by: "Tunde Bakare",
      sent_at: daysAgoIso(3),
      message:
        "Please review the updated confidentiality terms and sign by end of week.",
      final_content:
        "This Non-Disclosure Agreement is entered into between the Company and the Employee...\n\nThe Employee agrees to keep all proprietary information confidential during and after their employment...\n\nThis agreement remains in effect for 2 years following termination of employment.",
    },
    {
      id: "doc-4",
      document_name: "Annual Performance Review — 2024",
      category: "Performance",
      status: "sent",
      sent_by: "Adaeze Okonkwo",
      sent_at: daysAgoIso(1),
      message: "Please review your performance summary and acknowledge.",
      final_content:
        "Performance Summary for FY2024\n\nOverall Rating: Exceeds Expectations\n\nKey strengths: collaboration, design systems thinking, mentorship of junior designers...\n\nAreas for growth: delegation, public speaking.",
    },
    {
      id: "doc-5",
      document_name: "Pension Scheme Enrollment Form",
      category: "Benefits",
      status: "pending",
      sent_by: "HR Team",
      created_at: daysAgoIso(10),
    },
    {
      id: "doc-6",
      document_name: "ID Card Photo Submission",
      category: "Onboarding",
      status: "pending",
      sent_by: "HR Team",
      created_at: daysAgoIso(20),
    },
  ];
}
