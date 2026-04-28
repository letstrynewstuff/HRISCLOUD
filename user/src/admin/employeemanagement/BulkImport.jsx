// ─────────────────────────────────────────────────────────────
//  src/admin/employeemanagement/BulkImport.jsx
//  Route: /admin/employees/import
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import AdminSideNavbar from "../AdminSideNavbar";
import {
  Upload,
  Download,
  FileText,
  X,
  Check,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Bell,
  Menu,
  Users,
  Eye,
  Loader2,
  Info,
  Trash2,
  FileSpreadsheet,
  ArrowRight,
  ChevronDown,
  Shield,
  SkipForward,
  XCircle,
  Table,
  Zap,
  CornerDownRight,
} from "lucide-react";

/* ─── Design tokens ─── */
const C = {
  bg: "#F0F2F8",
  bgMid: "#E8EBF4",
  surface: "#FFFFFF",
  surfaceHover: "#F7F8FC",
  surfaceAlt: "#F7F8FC",
  border: "#E4E7F0",
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  primaryDark: "#3730A3",
  accent: "#06B6D4",
  accentLight: "#ECFEFF",
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  purple: "#8B5CF6",
  purpleLight: "#EDE9FE",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  navy: "#1E1B4B",
};

const ADMIN = {
  name: "Ngozi Adeleke",
  initials: "NA",
  role: "HR Administrator",
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Required CSV columns ─── */
const REQUIRED_COLS = [
  "first_name",
  "last_name",
  "email",
  "department",
  "role",
  "employment_type",
  "start_date",
  "basic_salary",
  "bank_name",
  "account_number",
];
const OPTIONAL_COLS = [
  "middle_name",
  "phone",
  "location",
  "manager",
  "grade",
  "housing_allowance",
  "transport_allowance",
];

/* ─── Mock parsed CSV rows (simulates file parse result) ─── */
const MOCK_PARSED = [
  {
    first_name: "Kelechi",
    last_name: "Amadi",
    email: "kelechi.a@hriscloud.ng",
    department: "Engineering",
    role: "Frontend Engineer",
    employment_type: "Full-time",
    start_date: "2025-02-01",
    basic_salary: "620000",
    bank_name: "GTBank",
    account_number: "0234567890",
    manager: "Chioma Okafor",
    grade: "Grade 3",
    location: "Lagos",
  },
  {
    first_name: "Nkechi",
    last_name: "Obi",
    email: "nkechi.o@hriscloud.ng",
    department: "Finance",
    role: "Accountant",
    employment_type: "Full-time",
    start_date: "2025-02-01",
    basic_salary: "540000",
    bank_name: "Access Bank",
    account_number: "0987654321",
    manager: "Emeka Obi",
    grade: "Grade 2",
    location: "Abuja",
  },
  {
    first_name: "Femi",
    last_name: "Adeyemi",
    email: "emeka.o@hriscloud.ng",
    department: "Marketing",
    role: "Content Strategist",
    employment_type: "Contract",
    start_date: "2025-02-15",
    basic_salary: "380000",
    bank_name: "Zenith Bank",
    account_number: "1122334455",
    manager: "",
    grade: "",
    location: "Remote",
  },
  {
    first_name: "Ayo",
    last_name: "Bello",
    email: "ayo.b@hriscloud.ng",
    department: "HR",
    role: "",
    employment_type: "Full-time",
    start_date: "2025-02-01",
    basic_salary: "480000",
    bank_name: "UBA",
    account_number: "5566778899",
    manager: "Ngozi Adeleke",
    grade: "Grade 2",
    location: "Lagos",
  },
  {
    first_name: "Tobi",
    last_name: "Okonkwo",
    email: "tobi.ok@hriscloud.ng",
    department: "Engineering",
    role: "Backend Engineer",
    employment_type: "Full-time",
    start_date: "bad-date",
    basic_salary: "680000",
    bank_name: "First Bank",
    account_number: "9988776655",
    manager: "Chioma Okafor",
    grade: "Grade 3",
    location: "Lagos",
  },
  {
    first_name: "Ada",
    last_name: "Nwosu",
    email: "ada.n@hriscloud.ng",
    department: "Legal",
    role: "Legal Counsel",
    employment_type: "Full-time",
    start_date: "2025-03-01",
    basic_salary: "750000",
    bank_name: "Stanbic IBTC",
    account_number: "3344556677",
    manager: "",
    grade: "Senior",
    location: "Lagos",
  },
  {
    first_name: "Emeka",
    last_name: "Chukwu",
    email: "emeka.ch@hriscloud.ng",
    department: "Operations",
    role: "Project Manager",
    employment_type: "Full-time",
    start_date: "2025-03-01",
    basic_salary: "590000",
    bank_name: "FCMB",
    account_number: "7788991122",
    manager: "Bola Adesanya",
    grade: "Grade 4",
    location: "Port Harcourt",
  },
];

/* ─── Existing emails to check duplicates ─── */
const EXISTING_EMAILS = new Set([
  "emeka.o@hriscloud.ng", // row 3 will be a duplicate
]);

/* ─── Validation engine ─── */
const validateRows = (rows) =>
  rows.map((row, idx) => {
    const errors = [];
    const warnings = [];

    REQUIRED_COLS.forEach((col) => {
      if (!row[col] || row[col].trim() === "")
        errors.push({ col, msg: `${col.replace(/_/g, " ")} is required` });
    });

    if (row.email && EXISTING_EMAILS.has(row.email.toLowerCase()))
      errors.push({ col: "email", msg: "Email already exists in system" });

    if (row.start_date && row.start_date !== "bad-date") {
      const d = new Date(row.start_date);
      if (isNaN(d.getTime()))
        errors.push({
          col: "start_date",
          msg: "Invalid date format (use YYYY-MM-DD)",
        });
    } else if (row.start_date === "bad-date") {
      errors.push({
        col: "start_date",
        msg: "Invalid date format (use YYYY-MM-DD)",
      });
    }

    if (row.basic_salary && isNaN(Number(row.basic_salary)))
      errors.push({ col: "basic_salary", msg: "Salary must be a number" });

    if (!row.manager || row.manager.trim() === "")
      warnings.push({
        col: "manager",
        msg: "Manager not assigned — will need to be set manually",
      });

    if (!row.grade || row.grade.trim() === "")
      warnings.push({ col: "grade", msg: "Grade not specified" });

    return {
      ...row,
      _idx: idx + 1,
      _status:
        errors.length > 0 ? "error" : warnings.length > 0 ? "warning" : "valid",
      _errors: errors,
      _warnings: warnings,
    };
  });

/* ─── Progress steps ─── */
const STEPS = [
  { id: 1, label: "Upload File", icon: Upload },
  { id: 2, label: "Preview & Validate", icon: Eye },
  { id: 3, label: "Confirm Import", icon: CheckCircle2 },
  { id: 4, label: "Done", icon: Zap },
];

/* ─── Helper components ─── */
const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center justify-center gap-0 mb-8">
    {STEPS.map((step, i) => {
      const Icon = step.icon;
      const done = currentStep > step.id;
      const active = currentStep === step.id;
      return (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300`}
              style={{
                background: done
                  ? C.success
                  : active
                    ? C.primary
                    : C.surfaceAlt,
                border: `2px solid ${done ? C.success : active ? C.primary : C.border}`,
                boxShadow: active ? `0 4px 12px ${C.primary}44` : "none",
              }}
            >
              {done ? (
                <Check size={15} color="#fff" />
              ) : (
                <Icon size={15} color={active ? "#fff" : C.textMuted} />
              )}
            </div>
            <span
              className="text-[11px] font-semibold whitespace-nowrap"
              style={{
                color: active ? C.primary : done ? C.success : C.textMuted,
              }}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className="w-16 h-0.5 mx-2 mb-5 rounded-full transition-all duration-500"
              style={{ background: done ? C.success : C.border }}
            />
          )}
        </div>
      );
    })}
  </div>
);

const ErrorCell = ({ errors, col }) => {
  const err = errors.find((e) => e.col === col);
  if (!err) return null;
  return (
    <div
      className="absolute inset-0 pointer-events-none rounded"
      style={{ border: `1.5px solid ${C.danger}`, background: `${C.danger}08` }}
    />
  );
};

/* ════════════════════ BULK IMPORT PAGE ════════════════════ */
export default function BulkImport() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [step, setStep] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [rows, setRows] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedRow, setExpandedRow] = useState(null);
  const [skipErrors, setSkipErrors] = useState(false);
  const fileRef = useRef();

  const validRows = rows.filter((r) => r._status === "valid");
  const warnRows = rows.filter((r) => r._status === "warning");
  const errorRows = rows.filter((r) => r._status === "error");
  const importableRows = skipErrors
    ? [...validRows, ...warnRows]
    : rows.filter((r) => r._status !== "error");

  const filteredRows =
    filterStatus === "all"
      ? rows
      : filterStatus === "valid"
        ? validRows
        : filterStatus === "warning"
          ? warnRows
          : errorRows;

  /* ─── File handling ─── */
  const handleFile = useCallback(async (f) => {
    if (!f) return;
    setFile(f);
    setParsing(true);
    await new Promise((r) => setTimeout(r, 1800)); // simulate parse
    const validated = validateRows(MOCK_PARSED);
    setRows(validated);
    setParsing(false);
    setStep(2);
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".csv") || f.name.endsWith(".xlsx")))
      handleFile(f);
  };

  /* ─── Import ─── */
  const handleImport = async () => {
    setStep(3);
    setImporting(true);
    for (let i = 0; i <= 100; i += 2) {
      await new Promise((r) => setTimeout(r, 40));
      setImportProgress(i);
    }
    setImporting(false);
    setImportResults({
      total: importableRows.length,
      success:
        importableRows.filter((r) => r._status === "valid").length +
        warnRows.length,
      skipped: errorRows.length,
    });
    setStep(4);
  };

  /* ─── Download template ─── */
  const downloadTemplate = () => {
    const header = [...REQUIRED_COLS, ...OPTIONAL_COLS].join(",");
    const sample =
      "John,Doe,john.d@hriscloud.ng,Engineering,Backend Engineer,Full-time,2025-03-01,600000,GTBank,0123456789,Jane,+234 801 000 0000,Lagos,Chioma Okafor,Grade 3,80000,40000";
    const blob = new Blob([header + "\n" + sample], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "employee_import_template.csv";
    a.click();
  };

  /* ─── Render step 1: Upload ─── */
  const renderUpload = () => (
    <motion.div
      key="upload"
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="max-w-2xl mx-auto"
    >
      {/* Template download */}
      <div
        className="rounded-2xl p-5 mb-5 flex items-center gap-4"
        style={{
          background: C.primaryLight,
          border: `1px solid ${C.primary}33`,
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: C.primary }}
        >
          <FileSpreadsheet size={18} color="#fff" />
        </div>
        <div className="flex-1">
          <p
            className="text-sm font-bold"
            style={{ color: C.primary, fontFamily: "Sora, sans-serif" }}
          >
            Download Import Template
          </p>
          <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>
            Use our pre-formatted CSV template to ensure all required fields are
            correct. Required: {REQUIRED_COLS.length} fields · Optional:{" "}
            {OPTIONAL_COLS.length} fields
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shrink-0"
          style={{
            background: C.primary,
            boxShadow: `0 4px 12px ${C.primary}44`,
          }}
        >
          <Download size={14} />
          Download Template
        </motion.button>
      </div>

      {/* Drop zone */}
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        animate={{
          scale: dragOver ? 1.01 : 1,
          borderColor: dragOver ? C.primary : C.border,
        }}
        className="rounded-2xl p-12 text-center cursor-pointer transition-all"
        style={{
          background: dragOver ? C.primaryLight : C.surface,
          border: `2px dashed ${dragOver ? C.primary : C.border}`,
          boxShadow: dragOver ? `0 0 0 4px ${C.primaryLight}` : "none",
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <motion.div
          animate={{ y: dragOver ? -4 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: dragOver ? C.primary : C.surfaceAlt }}
        >
          <Upload size={28} color={dragOver ? "#fff" : C.textMuted} />
        </motion.div>
        <p
          className="text-base font-bold mb-1"
          style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
        >
          {dragOver ? "Release to upload" : "Drag & drop your file here"}
        </p>
        <p className="text-sm mb-3" style={{ color: C.textSecondary }}>
          or{" "}
          <span style={{ color: C.primary, fontWeight: 600 }}>
            click to browse
          </span>
        </p>
        <p className="text-xs" style={{ color: C.textMuted }}>
          Supports .CSV and .XLSX · Max 10MB · Up to 500 employees
        </p>
      </motion.div>

      {/* Column guide */}
      <div
        className="mt-5 rounded-2xl overflow-hidden"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        <div
          className="px-5 py-3.5 flex items-center gap-2"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <Table size={14} color={C.textMuted} />
          <p
            className="text-sm font-bold"
            style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
          >
            Required Column Reference
          </p>
        </div>
        <div className="p-5 grid grid-cols-2 gap-3">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-wide mb-2"
              style={{ color: C.danger }}
            >
              Required Fields ({REQUIRED_COLS.length})
            </p>
            <div className="space-y-1.5">
              {REQUIRED_COLS.map((c) => (
                <div key={c} className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: C.danger }}
                  />
                  <code
                    className="text-xs font-mono px-2 py-0.5 rounded"
                    style={{ background: C.surfaceAlt, color: C.textPrimary }}
                  >
                    {c}
                  </code>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p
              className="text-xs font-bold uppercase tracking-wide mb-2"
              style={{ color: C.warning }}
            >
              Optional Fields ({OPTIONAL_COLS.length})
            </p>
            <div className="space-y-1.5">
              {OPTIONAL_COLS.map((c) => (
                <div key={c} className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: C.warning }}
                  />
                  <code
                    className="text-xs font-mono px-2 py-0.5 rounded"
                    style={{ background: C.surfaceAlt, color: C.textPrimary }}
                  >
                    {c}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  /* ─── Render step 2: Preview & Validate ─── */
  const renderPreview = () => (
    <motion.div
      key="preview"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Summary bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}
        >
          <FileText size={14} color={C.textMuted} />
          <span
            className="text-sm font-semibold"
            style={{ color: C.textPrimary }}
          >
            {file?.name}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: C.primaryLight, color: C.primary }}
          >
            {rows.length} rows
          </span>
        </div>
        {[
          {
            label: "Valid",
            count: validRows.length,
            color: C.success,
            bg: C.successLight,
            status: "valid",
          },
          {
            label: "Warnings",
            count: warnRows.length,
            color: C.warning,
            bg: C.warningLight,
            status: "warning",
          },
          {
            label: "Errors",
            count: errorRows.length,
            color: C.danger,
            bg: C.dangerLight,
            status: "error",
          },
        ].map((s) => (
          <button
            key={s.status}
            onClick={() =>
              setFilterStatus(filterStatus === s.status ? "all" : s.status)
            }
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: filterStatus === s.status ? s.bg : C.surface,
              border: `1.5px solid ${filterStatus === s.status ? s.color : C.border}`,
              color: s.color,
            }}
          >
            {s.status === "valid" ? (
              <CheckCircle2 size={13} />
            ) : s.status === "warning" ? (
              <AlertTriangle size={13} />
            ) : (
              <XCircle size={13} />
            )}
            {s.count} {s.label}
          </button>
        ))}
        <button
          onClick={() => setFilterStatus("all")}
          className="ml-auto text-xs font-semibold"
          style={{ color: filterStatus !== "all" ? C.primary : C.textMuted }}
        >
          {filterStatus !== "all" ? "Show all" : ""}
        </button>
      </div>

      {/* Error notice */}
      {errorRows.length > 0 && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl mb-4"
          style={{
            background: C.dangerLight,
            border: `1px solid ${C.danger}33`,
          }}
        >
          <AlertCircle size={15} color={C.danger} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: C.danger }}>
              {errorRows.length} row{errorRows.length > 1 ? "s" : ""} contain
              critical errors and cannot be imported
            </p>
            <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>
              Fix these in your file and re-upload, or enable "Skip errors" to
              import only valid rows.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer shrink-0">
            <div
              onClick={() => setSkipErrors((p) => !p)}
              className="w-9 h-5 rounded-full transition-all relative cursor-pointer"
              style={{ background: skipErrors ? C.danger : C.border }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                style={{ left: skipErrors ? "calc(100% - 18px)" : "2px" }}
              />
            </div>
            <span className="text-xs font-semibold" style={{ color: C.danger }}>
              Skip errors
            </span>
          </label>
        </div>
      )}

      {/* Data table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: 900 }}>
            <thead>
              <tr
                style={{
                  background: C.surfaceAlt,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <th
                  className="px-4 py-3 text-left font-bold uppercase tracking-wide w-8"
                  style={{ color: C.textMuted }}
                >
                  #
                </th>
                <th
                  className="px-4 py-3 text-left font-bold uppercase tracking-wide"
                  style={{ color: C.textMuted }}
                >
                  Status
                </th>
                {[
                  "Name",
                  "Email",
                  "Department",
                  "Role",
                  "Type",
                  "Start Date",
                  "Salary",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-bold uppercase tracking-wide"
                    style={{ color: C.textMuted }}
                  >
                    {h}
                  </th>
                ))}
                <th
                  className="px-4 py-3 text-left font-bold uppercase tracking-wide"
                  style={{ color: C.textMuted }}
                >
                  Issues
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, i) => {
                const isExpanded = expandedRow === row._idx;
                const rowBg =
                  row._status === "error"
                    ? `${C.danger}05`
                    : row._status === "warning"
                      ? `${C.warning}05`
                      : "transparent";
                return (
                  <>
                    <motion.tr
                      key={row._idx}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      onClick={() =>
                        setExpandedRow(isExpanded ? null : row._idx)
                      }
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                      style={{
                        borderBottom: `1px solid ${C.border}`,
                        background: rowBg,
                      }}
                    >
                      <td
                        className="px-4 py-3 font-mono"
                        style={{ color: C.textMuted }}
                      >
                        {row._idx}
                      </td>
                      <td className="px-4 py-3">
                        {row._status === "valid" && (
                          <span
                            className="flex items-center gap-1 text-[11px] font-bold"
                            style={{ color: C.success }}
                          >
                            <CheckCircle2 size={12} />
                            Valid
                          </span>
                        )}
                        {row._status === "warning" && (
                          <span
                            className="flex items-center gap-1 text-[11px] font-bold"
                            style={{ color: C.warning }}
                          >
                            <AlertTriangle size={12} />
                            Warning
                          </span>
                        )}
                        {row._status === "error" && (
                          <span
                            className="flex items-center gap-1 text-[11px] font-bold"
                            style={{ color: C.danger }}
                          >
                            <XCircle size={12} />
                            Error
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <span style={{ color: C.textPrimary }}>
                            {row.first_name} {row.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 relative">
                        {row._errors.find((e) => e.col === "email") && (
                          <div
                            className="absolute inset-1 rounded pointer-events-none"
                            style={{
                              background: `${C.danger}12`,
                              border: `1px solid ${C.danger}44`,
                            }}
                          />
                        )}
                        <span
                          style={{
                            color: row._errors.find((e) => e.col === "email")
                              ? C.danger
                              : C.textSecondary,
                            position: "relative",
                          }}
                        >
                          {row.email}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: C.textSecondary }}
                      >
                        {row.department}
                      </td>
                      <td className="px-4 py-3 relative">
                        {row._errors.find((e) => e.col === "role") && (
                          <div
                            className="absolute inset-1 rounded pointer-events-none"
                            style={{
                              background: `${C.danger}12`,
                              border: `1px solid ${C.danger}44`,
                            }}
                          />
                        )}
                        <span
                          style={{
                            color: row._errors.find((e) => e.col === "role")
                              ? C.danger
                              : C.textSecondary,
                            position: "relative",
                          }}
                        >
                          {row.role || (
                            <em style={{ color: C.danger }}>missing</em>
                          )}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: C.textSecondary }}
                      >
                        {row.employment_type}
                      </td>
                      <td className="px-4 py-3 relative">
                        {row._errors.find((e) => e.col === "start_date") && (
                          <div
                            className="absolute inset-1 rounded pointer-events-none"
                            style={{
                              background: `${C.danger}12`,
                              border: `1px solid ${C.danger}44`,
                            }}
                          />
                        )}
                        <span
                          style={{
                            color: row._errors.find(
                              (e) => e.col === "start_date",
                            )
                              ? C.danger
                              : C.textSecondary,
                            position: "relative",
                          }}
                        >
                          {row.start_date}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 font-mono"
                        style={{ color: C.textPrimary }}
                      >
                        ₦{Number(row.basic_salary || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {row._errors.length > 0 && (
                          <span
                            className="font-bold"
                            style={{ color: C.danger }}
                          >
                            {row._errors.length} error
                            {row._errors.length > 1 ? "s" : ""}
                          </span>
                        )}
                        {row._errors.length === 0 &&
                          row._warnings.length > 0 && (
                            <span
                              className="font-bold"
                              style={{ color: C.warning }}
                            >
                              {row._warnings.length} warning
                              {row._warnings.length > 1 ? "s" : ""}
                            </span>
                          )}
                        {row._errors.length === 0 &&
                          row._warnings.length === 0 && (
                            <span style={{ color: C.textMuted }}>—</span>
                          )}
                      </td>
                    </motion.tr>
                    {/* Expanded detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.tr
                          key={`exp-${row._idx}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <td
                            colSpan={10}
                            className="px-4 py-3"
                            style={{
                              background: C.surfaceAlt,
                              borderBottom: `1px solid ${C.border}`,
                            }}
                          >
                            <div className="flex gap-6">
                              {row._errors.length > 0 && (
                                <div>
                                  <p
                                    className="text-[11px] font-bold uppercase tracking-wide mb-2"
                                    style={{ color: C.danger }}
                                  >
                                    Errors
                                  </p>
                                  <div className="space-y-1">
                                    {row._errors.map((e, ei) => (
                                      <div
                                        key={ei}
                                        className="flex items-center gap-2"
                                      >
                                        <XCircle size={11} color={C.danger} />
                                        <code
                                          className="text-[11px]"
                                          style={{ color: C.danger }}
                                        >
                                          {e.col}:
                                        </code>
                                        <span
                                          className="text-[11px]"
                                          style={{ color: C.textSecondary }}
                                        >
                                          {e.msg}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {row._warnings.length > 0 && (
                                <div>
                                  <p
                                    className="text-[11px] font-bold uppercase tracking-wide mb-2"
                                    style={{ color: C.warning }}
                                  >
                                    Warnings
                                  </p>
                                  <div className="space-y-1">
                                    {row._warnings.map((w, wi) => (
                                      <div
                                        key={wi}
                                        className="flex items-center gap-2"
                                      >
                                        <AlertTriangle
                                          size={11}
                                          color={C.warning}
                                        />
                                        <code
                                          className="text-[11px]"
                                          style={{ color: C.warning }}
                                        >
                                          {w.col}:
                                        </code>
                                        <span
                                          className="text-[11px]"
                                          style={{ color: C.textSecondary }}
                                        >
                                          {w.msg}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {row._errors.length === 0 &&
                                row._warnings.length === 0 && (
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 size={13} color={C.success} />
                                    <span
                                      className="text-xs"
                                      style={{ color: C.success }}
                                    >
                                      All fields are valid. This row is ready to
                                      import.
                                    </span>
                                  </div>
                                )}
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-5">
        <button
          onClick={() => {
            setStep(1);
            setFile(null);
            setRows([]);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{
            background: C.surface,
            color: C.textSecondary,
            border: `1px solid ${C.border}`,
          }}
        >
          <X size={14} />
          Re-upload File
        </button>
        <div className="flex items-center gap-3">
          <div className="text-sm" style={{ color: C.textSecondary }}>
            <strong style={{ color: C.primary }}>
              {importableRows.length}
            </strong>{" "}
            rows ready to import
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleImport}
            disabled={importableRows.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{
              background: C.primary,
              boxShadow: `0 4px 12px ${C.primary}44`,
              opacity: importableRows.length === 0 ? 0.5 : 1,
            }}
          >
            Confirm & Import <ArrowRight size={14} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  /* ─── Render step 3: Importing (progress) ─── */
  const renderImporting = () => (
    <motion.div
      key="importing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-lg mx-auto text-center py-12"
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative"
        style={{ background: C.primaryLight }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        >
          <Loader2 size={36} color={C.primary} />
        </motion.div>
      </div>
      <h3
        className="text-lg font-bold mb-2"
        style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
      >
        Importing {importableRows.length} employees...
      </h3>
      <p className="text-sm mb-8" style={{ color: C.textSecondary }}>
        Creating profiles, generating credentials, and sending welcome emails.
      </p>
      <div
        className="w-full h-3 rounded-full overflow-hidden mb-2"
        style={{ background: C.border }}
      >
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${importProgress}%` }}
          style={{
            background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`,
          }}
          transition={{ duration: 0.1 }}
        />
      </div>
      <p className="text-sm font-bold" style={{ color: C.primary }}>
        {importProgress}%
      </p>
      <div className="mt-8 space-y-2 text-left">
        {[
          { label: "Validating employee data", done: importProgress > 20 },
          { label: "Creating employee profiles", done: importProgress > 45 },
          { label: "Generating login credentials", done: importProgress > 65 },
          { label: "Sending welcome emails", done: importProgress > 85 },
          { label: "Updating org chart", done: importProgress >= 100 },
        ].map((task, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
            style={{ background: task.done ? C.successLight : C.surfaceAlt }}
          >
            {task.done ? (
              <CheckCircle2 size={14} color={C.success} />
            ) : importProgress > i * 20 ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <RefreshCw size={14} color={C.primary} />
              </motion.div>
            ) : (
              <div
                className="w-3.5 h-3.5 rounded-full"
                style={{ border: `2px solid ${C.border}` }}
              />
            )}
            <span
              className="text-sm"
              style={{ color: task.done ? C.success : C.textSecondary }}
            >
              {task.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );

  /* ─── Render step 4: Done ─── */
  const renderDone = () => (
    <motion.div
      key="done"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-lg mx-auto text-center py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
        style={{ background: "linear-gradient(135deg,#D1FAE5,#ECFEFF)" }}
      >
        <CheckCircle2 size={40} color={C.success} />
      </motion.div>
      <h3
        className="text-xl font-bold mb-2"
        style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
      >
        Import Complete! 🎉
      </h3>
      <p className="text-sm mb-8" style={{ color: C.textSecondary }}>
        Employees have been added to the system and welcome emails sent.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          {
            label: "Successfully Imported",
            value: importResults?.success,
            color: C.success,
            bg: C.successLight,
          },
          {
            label: "Skipped (Errors)",
            value: importResults?.skipped,
            color: C.danger,
            bg: C.dangerLight,
          },
          {
            label: "Total Processed",
            value: importResults?.total,
            color: C.primary,
            bg: C.primaryLight,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4"
            style={{ background: s.bg }}
          >
            <p
              className="text-2xl font-bold"
              style={{ color: s.color, fontFamily: "Sora, sans-serif" }}
            >
              {s.value}
            </p>
            <p
              className="text-[11px] font-semibold mt-0.5"
              style={{ color: s.color }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setStep(1);
            setFile(null);
            setRows([]);
            setImportProgress(0);
            setImportResults(null);
          }}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
          style={{
            background: C.surfaceAlt,
            color: C.textSecondary,
            border: `1px solid ${C.border}`,
          }}
        >
          Import More
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{
            background: C.primary,
            boxShadow: `0 4px 12px ${C.primary}44`,
          }}
        >
          View Employees
        </motion.button>
      </div>
    </motion.div>
  );

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: C.bg, fontFamily: "Sora, sans-serif" }}
    >
      {/* <AdminSideNavbar
        sidebarOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        ADMIN={ADMIN}
      /> */}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="h-14 flex items-center px-5 gap-4 shrink-0"
          style={{
            background: C.surface,
            borderBottom: `1px solid ${C.border}`,
            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
          }}
        >
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
          >
            <Menu size={18} color={C.textSecondary} />
          </button>
          <div
            className="flex items-center gap-1.5 text-xs"
            style={{ color: C.textMuted }}
          >
            <span>Employees</span>
            <ChevronRight size={12} />
            <span style={{ color: C.primary, fontWeight: 600 }}>
              Bulk Import
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell size={16} color={C.textSecondary} />
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ background: C.danger }}
              />
            </button>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg,#6366F1,#06B6D4)" }}
            >
              {ADMIN.initials}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <main className="p-6 max-w-5xl mx-auto w-full">
            {/* Page header */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg,#4F46E5,#06B6D4)",
                    boxShadow: `0 4px 12px ${C.primary}44`,
                  }}
                >
                  <Upload size={17} color="#fff" />
                </div>
                <div>
                  <h1
                    className="text-xl font-bold leading-tight"
                    style={{
                      color: C.textPrimary,
                      fontFamily: "Sora, sans-serif",
                    }}
                  >
                    Bulk Employee Import
                  </h1>
                  <p className="text-xs" style={{ color: C.textMuted }}>
                    Upload a CSV or Excel file to add multiple employees at once
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Step indicator */}
            <StepIndicator currentStep={step} />

            {/* Parsing overlay */}
            <AnimatePresence>
              {parsing && (
                <motion.div
                  key="parsing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      ease: "linear",
                    }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: C.primaryLight }}
                  >
                    <Loader2 size={24} color={C.primary} />
                  </motion.div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: C.textPrimary }}
                  >
                    Parsing {file?.name}...
                  </p>
                  <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                    Validating columns and checking for errors
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step content */}
            {!parsing && (
              <AnimatePresence mode="wait">
                {step === 1 && renderUpload()}
                {step === 2 && renderPreview()}
                {step === 3 && renderImporting()}
                {step === 4 && renderDone()}
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
