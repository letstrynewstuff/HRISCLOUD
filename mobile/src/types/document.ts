// src/types/document.ts
// Shared document domain types. All documents are sent to employees by HR/Admin
// via the backend — employees only ever read and sign what's been sent to them.

export type DocStatus = "pending" | "sent" | "signed";

export type EmployeeDocument = {
  id: string;
  document_name?: string | null;
  template_name?: string | null;
  category?: string | null;
  status: DocStatus;
  sent_by?: string | null;
  sent_at?: string | null;
  created_at?: string | null;
  signed_at?: string | null;
  mime_type?: string | null;
  file_url?: string | null;
  file_name?: string | null;
  final_content?: string | null;
  message?: string | null;
};
