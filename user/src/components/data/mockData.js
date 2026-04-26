// ============================================================
//  HRISCloud — Shared Mock Data & Design Tokens
//  src/components/data/mockData.js
//
//  Import from any page:
//    import { EMPLOYEES, T, MOCK_REQUESTS, ... } from "../data/mockData";
// ============================================================

// ─────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────
export const T = {
  bg: "#F1F4FA",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F9FC",
  border: "#E2E8F4",
  primary: "#2563EB",
  primaryLight: "#EFF6FF",
  primaryMid: "#BFDBFE",
  primaryDark: "#1D4ED8",
  secondary: "#0EA5E9",
  accent: "#8B5CF6",
  accentLight: "#F5F3FF",
  success: "#059669",
  successLight: "#D1FAE5",
  warning: "#D97706",
  warningLight: "#FEF3C7",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  navy: "#0F1729",
  navyMid: "#1E2D4E",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  gold: "#F59E0B",
};

// ─────────────────────────────────────────
// EMPLOYEES
// ─────────────────────────────────────────
export const EMPLOYEES = [
  {
    id: "EMP-001",
    name: "Amara Johnson",
    initials: "AJ",
    role: "Senior Product Designer",
    department: "Product & Design",
    status: "Active",
    managerId: "EMP-003",
    grade: "L5",
    email: "amara.johnson@hriscloud.com",
    phone: "+234 801 234 5678",
    dob: "1990-03-15",
    gender: "Female",
    address: "14 Victoria Island, Lagos, Nigeria",
    employmentDate: "2021-06-01",
    location: "Lagos HQ",
    nextOfKin: {
      name: "Kwame Johnson",
      relationship: "Spouse",
      phone: "+234 802 345 6789",
    },
    bank: {
      name: "Zenith Bank",
      account: "2134567890",
      accountName: "Amara T. Johnson",
    },
    documents: [
      {
        id: 1,
        name: "National ID Card",
        type: "pdf",
        size: "1.2 MB",
        date: "2021-06-01",
        category: "Government ID",
      },
      {
        id: 2,
        name: "BSc Computer Science",
        type: "pdf",
        size: "856 KB",
        date: "2021-06-01",
        category: "Certificate",
      },
      {
        id: 3,
        name: "Employment Contract",
        type: "pdf",
        size: "2.1 MB",
        date: "2021-06-05",
        category: "Contract",
      },
    ],
    lastLogin: "2025-06-30 08:42 AM",
    twoFA: false,
    completionScore: 85,
  },
  {
    id: "EMP-002",
    name: "Tunde Adeyemi",
    initials: "TA",
    role: "UI/UX Designer",
    department: "Product & Design",
    status: "Active",
    managerId: "EMP-001",
    grade: "L3",
    email: "tunde.adeyemi@hriscloud.com",
    phone: "+234 803 456 7890",
    dob: "1995-07-22",
    gender: "Male",
    address: "3 Allen Avenue, Ikeja, Lagos",
    employmentDate: "2023-01-15",
    location: "Lagos HQ",
    nextOfKin: {
      name: "Funke Adeyemi",
      relationship: "Mother",
      phone: "+234 804 567 8901",
    },
    bank: {
      name: "GTBank",
      account: "0198765432",
      accountName: "Tunde O. Adeyemi",
    },
    documents: [
      {
        id: 1,
        name: "National ID Card",
        type: "pdf",
        size: "980 KB",
        date: "2023-01-15",
        category: "Government ID",
      },
    ],
    lastLogin: "2025-06-30 09:10 AM",
    twoFA: true,
    completionScore: 72,
  },
  {
    id: "EMP-003",
    name: "Chioma Okafor",
    initials: "CO",
    role: "Head of Product",
    department: "Product & Design",
    status: "Active",
    managerId: null,
    grade: "L7",
    email: "chioma.okafor@hriscloud.com",
    phone: "+234 805 678 9012",
    dob: "1985-11-04",
    gender: "Female",
    address: "28 Bourdillon Road, Ikoyi, Lagos",
    employmentDate: "2019-03-10",
    location: "Lagos HQ",
    nextOfKin: {
      name: "Emeka Okafor",
      relationship: "Husband",
      phone: "+234 806 789 0123",
    },
    bank: {
      name: "First Bank",
      account: "3012345678",
      accountName: "Chioma B. Okafor",
    },
    documents: [
      {
        id: 1,
        name: "National ID Card",
        type: "pdf",
        size: "1.1 MB",
        date: "2019-03-10",
        category: "Government ID",
      },
      {
        id: 2,
        name: "MBA Certificate",
        type: "pdf",
        size: "1.4 MB",
        date: "2019-03-10",
        category: "Certificate",
      },
      {
        id: 3,
        name: "Employment Contract",
        type: "pdf",
        size: "2.8 MB",
        date: "2019-03-12",
        category: "Contract",
      },
    ],
    lastLogin: "2025-06-30 07:55 AM",
    twoFA: true,
    completionScore: 98,
  },
  {
    id: "EMP-004",
    name: "Bola Fashola",
    initials: "BF",
    role: "Product Manager",
    department: "Product & Design",
    status: "Active",
    managerId: "EMP-001",
    grade: "L4",
    email: "bola.fashola@hriscloud.com",
    phone: "+234 807 890 1234",
    dob: "1992-05-30",
    gender: "Male",
    address: "7 Ozumba Mbadiwe, Victoria Island",
    employmentDate: "2022-08-01",
    location: "Lagos HQ",
    nextOfKin: {
      name: "Sade Fashola",
      relationship: "Wife",
      phone: "+234 808 901 2345",
    },
    bank: {
      name: "Access Bank",
      account: "1123456789",
      accountName: "Bola A. Fashola",
    },
    documents: [],
    lastLogin: "2025-06-29 04:30 PM",
    twoFA: false,
    completionScore: 60,
  },
  {
    id: "EMP-005",
    name: "Ngozi Eze",
    initials: "NE",
    role: "Design Researcher",
    department: "Product & Design",
    status: "On Leave",
    managerId: "EMP-001",
    grade: "L3",
    email: "ngozi.eze@hriscloud.com",
    phone: "+234 809 012 3456",
    dob: "1997-02-11",
    gender: "Female",
    address: "5 Lekki Phase 1, Lagos",
    employmentDate: "2023-06-01",
    location: "Lagos HQ",
    nextOfKin: {
      name: "Chidi Eze",
      relationship: "Brother",
      phone: "+234 810 123 4567",
    },
    bank: { name: "UBA", account: "2012345678", accountName: "Ngozi A. Eze" },
    documents: [
      {
        id: 1,
        name: "National ID Card",
        type: "pdf",
        size: "1.0 MB",
        date: "2023-06-01",
        category: "Government ID",
      },
    ],
    lastLogin: "2025-06-28 11:20 AM",
    twoFA: false,
    completionScore: 55,
  },
];

// ─────────────────────────────────────────
// UPDATE REQUESTS (for current user EMP-001)
// ─────────────────────────────────────────
export const MOCK_REQUESTS = [
  {
    id: "REQ-001",
    employeeId: "EMP-001",
    field: "Phone Number",
    oldVal: "+234 801 111 1111",
    newVal: "+234 801 234 5678",
    reason: "Number changed",
    status: "approved",
    date: "2025-05-12",
    reviewedBy: "HR Admin",
    reviewedDate: "2025-05-14",
    comment: "Verified and updated.",
  },
  {
    id: "REQ-002",
    employeeId: "EMP-001",
    field: "Residential Address",
    oldVal: "5 Eko Atlantic, Lagos",
    newVal: "14 Victoria Island, Lagos",
    reason: "Relocated",
    status: "pending",
    date: "2025-06-20",
    reviewedBy: null,
    reviewedDate: null,
    comment: null,
  },
  {
    id: "REQ-003",
    employeeId: "EMP-001",
    field: "Next of Kin Phone",
    oldVal: "+234 802 000 0000",
    newVal: "+234 802 345 6789",
    reason: "Updated contact",
    status: "rejected",
    date: "2025-06-10",
    reviewedBy: "HR Admin",
    reviewedDate: "2025-06-12",
    comment: "Supporting document required.",
  },
];

// ─────────────────────────────────────────
// PENDING APPROVALS (manager inbox)
// ─────────────────────────────────────────
export const PENDING_APPROVALS = [
  {
    id: "APR-001",
    type: "Leave Request",
    employeeId: "EMP-002",
    details: "Annual Leave — Jul 14 to Jul 18 (5 days)",
    submittedDate: "2025-06-28",
    urgency: "normal",
  },
  {
    id: "APR-002",
    type: "Profile Update",
    employeeId: "EMP-004",
    details: "Phone Number update request",
    submittedDate: "2025-06-29",
    urgency: "normal",
  },
  {
    id: "APR-003",
    type: "Overtime Claim",
    employeeId: "EMP-005",
    details: "3.5 hours overtime on Jun 27",
    submittedDate: "2025-06-27",
    urgency: "high",
  },
  {
    id: "APR-004",
    type: "Work From Home",
    employeeId: "EMP-002",
    details: "WFH request for Jul 7–11",
    submittedDate: "2025-06-30",
    urgency: "normal",
  },
];

// ─────────────────────────────────────────
// TEAM ANNOUNCEMENTS (manager-level)
// ─────────────────────────────────────────
export const TEAM_ANNOUNCEMENTS = [
  {
    id: 1,
    title: "Q3 Planning Sprint starts July 22",
    body: "All team members should prepare their individual goal proposals for review before the kickoff.",
    date: "Jun 30, 2025",
    tag: "Planning",
  },
  {
    id: 2,
    title: "Mandatory Compliance Training — Deadline July 15",
    body: "Ensure all direct reports complete the annual compliance module on the LMS by end of day July 15.",
    date: "Jun 27, 2025",
    tag: "Compliance",
  },
  {
    id: 3,
    title: "Ngozi Eze approved for Annual Leave",
    body: "Leave approved for July 1–12. Please redistribute design research tasks accordingly.",
    date: "Jun 25, 2025",
    tag: "Leave",
  },
];

// ─────────────────────────────────────────
// ACTIVITY LOG (per-user, icon names as strings for portability)
// ─────────────────────────────────────────
export const ACTIVITY_LOG = [
  {
    id: 1,
    action: "Profile photo updated",
    date: "Jun 28, 2025",
    iconName: "User",
    color: "#2563EB",
  },
  {
    id: 2,
    action: "Employment contract downloaded",
    date: "Jun 25, 2025",
    iconName: "Download",
    color: "#059669",
  },
  {
    id: 3,
    action: "Address update request submitted",
    date: "Jun 20, 2025",
    iconName: "Edit3",
    color: "#D97706",
  },
  {
    id: 4,
    action: "2FA disabled",
    date: "Jun 15, 2025",
    iconName: "Shield",
    color: "#DC2626",
  },
  {
    id: 5,
    action: "Logged in from new device",
    date: "Jun 10, 2025",
    iconName: "LogIn",
    color: "#8B5CF6",
  },
];

// Manager activity log
export const MANAGER_ACTIVITY_LOG = [
  {
    id: 1,
    action: "Approved leave for Tunde Adeyemi",
    date: "Jun 29, 2025",
    iconName: "CheckCircle2",
    color: "#059669",
  },
  {
    id: 2,
    action: "Rejected overtime claim for Bola Fashola",
    date: "Jun 27, 2025",
    iconName: "XCircle",
    color: "#DC2626",
  },
  {
    id: 3,
    action: "Reviewed Q2 appraisals for 4 reports",
    date: "Jun 25, 2025",
    iconName: "BarChart2",
    color: "#2563EB",
  },
  {
    id: 4,
    action: "Updated team attendance note",
    date: "Jun 20, 2025",
    iconName: "Edit3",
    color: "#D97706",
  },
  {
    id: 5,
    action: "Sent Q3 goal template to team",
    date: "Jun 18, 2025",
    iconName: "Send",
    color: "#8B5CF6",
  },
];

// ─────────────────────────────────────────
// FIELDS users can request updates for
// ─────────────────────────────────────────
export const UPDATABLE_FIELDS = [
  "Phone Number",
  "Email Address",
  "Residential Address",
  "Next of Kin Name",
  "Next of Kin Phone",
  "Next of Kin Relationship",
  "Bank Name",
  "Account Number",
  "Account Name",
  "Date of Birth",
  "Gender",
];

// ─────────────────────────────────────────
// SIDEBAR NAV ITEMS
// ─────────────────────────────────────────
export const NAV_ITEMS = [
  { iconName: "Home", label: "Home", path: "/" },
  { iconName: "Clock", label: "Attendance", path: "/attendance" },
  { iconName: "Plane", label: "Leave", path: "/leave" },
  { iconName: "DollarSign", label: "Payroll", path: "/payroll" },
  { iconName: "Users", label: "Team", path: "/team", managerOnly: true },
  { iconName: "BarChart2", label: "Reports", path: "/reports" },
];

// ─────────────────────────────────────────
// GRADE CONFIG
// ─────────────────────────────────────────
export const GRADE_CONFIG = {
  L7: { color: "#F59E0B", bg: "#FFFBEB", label: "Executive" },
  L6: { color: "#8B5CF6", bg: "#F5F3FF", label: "Director" },
  L5: { color: "#2563EB", bg: "#EFF6FF", label: "Senior" },
  L4: { color: "#0EA5E9", bg: "#E0F2FE", label: "Mid-Level" },
  L3: { color: "#059669", bg: "#D1FAE5", label: "Junior" },
  L2: { color: "#94A3B8", bg: "#F1F5F9", label: "Entry" },
};

// ─────────────────────────────────────────
// TEAM ATTENDANCE SUMMARY (mock)
// ─────────────────────────────────────────
export const TEAM_ATTENDANCE = [
  { day: "Mon", present: 4, absent: 0, late: 1 },
  { day: "Tue", present: 5, absent: 0, late: 0 },
  { day: "Wed", present: 3, absent: 1, late: 1 },
  { day: "Thu", present: 4, absent: 1, late: 0 },
  { day: "Fri", present: 5, absent: 0, late: 0 },
];
