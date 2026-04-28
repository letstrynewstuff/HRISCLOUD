// src/admin/employeemanagement/EditEmployee.jsx
// Route: /admin/employeemanagement/admin-editemployee/:id
// Features:
//  • Full profile edit (Personal, Job, Bank, Emergency, Access)
//  • Assign Manager / Line Manager role (sets role = "manager" on the user)
//  • Move department
//  • Field-level dirty tracking
//  • Audit trail sidebar
//  • No mock data — 100% API connected
//  • motion → Motion throughout

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
// import AdminSideNavbar from "../AdminSideNavbar";
import { useAuth } from "../../components/useAuth";
import {
  getEmployeeById,
  updateEmployee,
  getEmployeeHistory,
} from "../../api/service/employeeApi";
import { getEmployees } from "../../api/service/employeeApi";
import { departmentApi } from "../../api/service/departmentApi";
import { listJobRoles } from "../../api/service/jobRoleApi";
import C from "../../styles/colors";
import {
  ChevronRight,
  Save,
  X,
  Check,
  AlertCircle,
  User,
  Briefcase,
  CreditCard,
  Shield,
  Phone,
  Menu,
  History,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Building2,
  MapPin,
  Hash,
  Calendar,
  Mail,
  Users,
  Lock,
  Unlock,
  UserCog,
  Loader2,
  Award,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  }),
};

const TABS = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "job", label: "Job & Role", icon: Briefcase },
  { id: "bank", label: "Bank & Payroll", icon: CreditCard },
  { id: "emergency", label: "Emergency", icon: Phone },
  { id: "access", label: "Access & Role", icon: Shield },
];

const EMP_TYPES = ["full_time", "part_time", "contract", "intern"];
const STATUSES = ["active", "on_leave", "suspended", "terminated", "resigned"];
const GENDERS = ["male", "female", "other"];
const MARITAL = ["single", "married", "divorced", "widowed"];
const BANKS = [
  "Access Bank",
  "GTBank",
  "Zenith Bank",
  "First Bank",
  "UBA",
  "Stanbic IBTC",
  "FCMB",
  "Fidelity Bank",
  "Polaris Bank",
  "Wema Bank",
];
const LOCATIONS = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ibadan",
  "Kano",
  "Enugu",
  "Remote",
];

// ── Shared atoms ──
function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Label({ children, required }) {
  return (
    <label
      className="block text-xs font-bold uppercase tracking-wider mb-1.5"
      style={{ color: C.textSecondary }}
    >
      {children}
      {required && <span style={{ color: C.danger }}>*</span>}
    </label>
  );
}

function Inp({
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  disabled = false,
  mono = false,
}) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
      style={{
        border: `1.5px solid ${error ? C.danger : value ? C.primary : C.border}`,
        background: disabled ? C.surfaceAlt : C.surface,
        color: disabled ? C.textMuted : C.textPrimary,
        cursor: disabled ? "not-allowed" : "text",
        fontFamily: mono ? "monospace" : "inherit",
      }}
    />
  );
}

function Sel({
  value,
  onChange,
  options,
  error,
  disabled = false,
  labelKey = null,
  valueKey = null,
}) {
  return (
    <select
      value={value ?? ""}
      onChange={onChange}
      disabled={disabled}
      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all appearance-none"
      style={{
        border: `1.5px solid ${error ? C.danger : value ? C.primary : C.border}`,
        background: disabled ? C.surfaceAlt : C.surface,
        color: value ? C.textPrimary : C.textMuted,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <option value="">Select…</option>
      {options.map((o) => (
        <option
          key={valueKey ? o[valueKey] : o}
          value={valueKey ? o[valueKey] : o}
        >
          {labelKey ? o[labelKey] : o}
        </option>
      ))}
    </select>
  );
}

function FieldErr({ msg }) {
  if (!msg) return null;
  return (
    <Motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1 mt-1 text-[11px] font-medium"
      style={{ color: C.danger }}
    >
      <AlertCircle size={10} />
      {msg}
    </Motion.p>
  );
}

function Toggle({ on, onToggle, label, sub }) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-xl"
      style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}
    >
      <div>
        <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
          {label}
        </p>
        {sub && (
          <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
            {sub}
          </p>
        )}
      </div>
      <Motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        style={{
          width: 44,
          height: 24,
          borderRadius: 99,
          background: on ? C.success : C.border,
          border: "none",
          cursor: "pointer",
          position: "relative",
          transition: "background 0.25s",
        }}
      >
        <Motion.div
          animate={{ x: on ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#fff",
            position: "absolute",
            top: 3,
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          }}
        />
      </Motion.button>
    </div>
  );
}

// ── Section wrappers ──
function SectionCard({
  icon: Icon,
  title,
  color = C.primary,
  bg = C.primaryLight,
  children,
}) {
  return (
    <Card>
      <div
        className="flex items-center gap-3 p-4"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: bg }}
        >
          <Icon size={15} color={color} />
        </div>
        <p className="text-sm font-bold" style={{ color: C.textPrimary }}>
          {title}
        </p>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </Card>
  );
}

function Row({ label, required, error, children }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
      <FieldErr msg={error} />
    </div>
  );
}

const Grid2 = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
);

// ════════════════════════════ MAIN ════════════════════════════
export default function EditEmployee() {
  const { id: employeeId } = useParams();
  const navigate = useNavigate();
  const { employee: adminUser } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [emp, setEmp] = useState(null);
  const [form, setForm] = useState({});
  const [originalForm, setOriginalForm] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [showAudit, setShowAudit] = useState(false);
  const [audit, setAudit] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  // Reference data
  const [departments, setDepartments] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Flatten employee → form shape
  const flatten = (e) => ({
    firstName: e.first_name ?? "",
    lastName: e.last_name ?? "",
    middleName: e.middle_name ?? "",
    personalEmail: e.personal_email ?? "",
    phone: e.phone ?? "",
    gender: e.gender ?? "",
    dateOfBirth: e.date_of_birth ? e.date_of_birth.split("T")[0] : "",
    maritalStatus: e.marital_status ?? "",
    nationality: e.nationality ?? "",
    address: e.address ?? "",
    state: e.state ?? "",
    // Job
    departmentId: e.department_id ?? "",
    jobRoleId: e.job_role_id ?? "",
    managerId: e.manager_id ?? "",
    employmentType: e.employment_type ?? "",
    employmentStatus: e.employment_status ?? "",
    startDate: e.start_date ? e.start_date.split("T")[0] : "",
    confirmationDate: e.confirmation_date
      ? e.confirmation_date.split("T")[0]
      : "",
    location: e.location ?? "",
    payGrade: e.pay_grade ?? "",
    // Bank
    basicSalary: e.basic_salary ?? "",
    housingAllowance: e.housing_allowance ?? "",
    transportAllowance: e.transport_allowance ?? "",
    medicalAllowance: e.medical_allowance ?? "",
    otherAllowances: e.other_allowances ?? "",
    bankName: e.bank_name ?? "",
    accountNumber: e.account_number ?? "",
    accountName: e.account_name ?? "",
    pensionPin: e.pension_pin ?? "",
    taxId: e.tax_id ?? "",
    // Emergency
    nokName: e.nok_name ?? "",
    nokRelationship: e.nok_relationship ?? "",
    nokPhone: e.nok_phone ?? "",
    nokAddress: e.nok_address ?? "",
    // Access
    isManager: e.role === "manager" || e.employment_role === "manager",
    isActive: e.employment_status === "active",
    bio: e.bio ?? "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [empRes, auditRes, deptsRes, rolesRes, empsRes] = await Promise.all(
        [
          getEmployeeById(employeeId),
          getEmployeeHistory(employeeId).catch(() => ({ data: [] })),
          departmentApi.list().catch(() => ({ departments: [] })),
          listJobRoles().catch(() => ({ roles: [] })),
          getEmployees({ limit: 200 }).catch(() => ({ data: [] })),
        ],
      );
      const e = empRes.data ?? empRes;
      setEmp(e);
      const f = flatten(e);
      setForm(f);
      setOriginalForm(f);
      setAudit(auditRes.data ?? auditRes.rows ?? []);
      setDepartments(deptsRes.departments ?? deptsRes.data ?? []);
      setJobRoles(rolesRes.roles ?? rolesRes.data ?? []);
      setAllEmployees((empsRes.data ?? []).filter((x) => x.id !== employeeId));
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load employee.");
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // Dirty tracking
  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(originalForm),
    [form, originalForm],
  );
  const dirtyFields = useMemo(
    () => Object.keys(form).filter((k) => form[k] !== originalForm[k]),
    [form, originalForm],
  );

  // Validate
  const validate = () => {
    const e = {};
    if (!form.firstName?.trim()) e.firstName = "Required";
    if (!form.lastName?.trim()) e.lastName = "Required";
    if (!form.employmentType) e.employmentType = "Required";
    if (!form.employmentStatus) e.employmentStatus = "Required";
    if (form.accountNumber && !/^\d{10}$/.test(form.accountNumber))
      e.accountNumber = "Must be 10 digits";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = () => {
    if (!validate()) return;
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    setShowConfirm(false);
    setSaving(true);
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        middleName: form.middleName || undefined,
        personalEmail: form.personalEmail || undefined,
        phone: form.phone || undefined,
        gender: form.gender || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        maritalStatus: form.maritalStatus || undefined,
        nationality: form.nationality || undefined,
        address: form.address || undefined,
        state: form.state || undefined,
        departmentId: form.departmentId || undefined,
        jobRoleId: form.jobRoleId || undefined,
        managerId: form.managerId || undefined,
        employmentType: form.employmentType,
        employmentStatus: form.employmentStatus,
        startDate: form.startDate || undefined,
        confirmationDate: form.confirmationDate || undefined,
        location: form.location || undefined,
        payGrade: form.payGrade || undefined,
        basicSalary: form.basicSalary ? Number(form.basicSalary) : undefined,
        housingAllowance: form.housingAllowance
          ? Number(form.housingAllowance)
          : undefined,
        transportAllowance: form.transportAllowance
          ? Number(form.transportAllowance)
          : undefined,
        medicalAllowance: form.medicalAllowance
          ? Number(form.medicalAllowance)
          : undefined,
        otherAllowances: form.otherAllowances
          ? Number(form.otherAllowances)
          : undefined,
        bankName: form.bankName || undefined,
        accountNumber: form.accountNumber || undefined,
        accountName: form.accountName || undefined,
        pensionPin: form.pensionPin || undefined,
        taxId: form.taxId || undefined,
        nokName: form.nokName || undefined,
        nokRelationship: form.nokRelationship || undefined,
        nokPhone: form.nokPhone || undefined,
        nokAddress: form.nokAddress || undefined,
        bio: form.bio || undefined,
        // Manager role assignment — sets the user's role on the backend
        role: form.isManager ? "manager" : "employee",
        notes: dirtyFields.join(", "),
      };

      await updateEmployee(employeeId, payload);
      const refreshed = await getEmployeeById(employeeId);
      const e = refreshed.data ?? refreshed;
      setEmp(e);
      const f = flatten(e);
      setForm(f);
      setOriginalForm(f);
      showToast("Employee profile updated successfully.");
    } catch (e) {
      showToast(e?.response?.data?.message ?? "Save failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const filteredRoles = useMemo(
    () =>
      form.departmentId
        ? jobRoles.filter(
            (r) => r.departmentId === form.departmentId || !r.departmentId,
          )
        : jobRoles,
    [jobRoles, form.departmentId],
  );

  const name = emp
    ? `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim()
    : "Employee";

  // ── Tab panels ──
  const renderTab = () => {
    switch (activeTab) {
      case "personal":
        return (
          <div className="space-y-4">
            <SectionCard icon={User} title="Personal Information">
              <Grid2>
                <Row label="First Name" required error={errors.firstName}>
                  <Inp
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    error={errors.firstName}
                  />
                </Row>
                <Row label="Middle Name">
                  <Inp
                    value={form.middleName}
                    onChange={(e) => set("middleName", e.target.value)}
                  />
                </Row>
                <Row label="Last Name" required error={errors.lastName}>
                  <Inp
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    error={errors.lastName}
                  />
                </Row>
                <Row label="Date of Birth">
                  <Inp
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => set("dateOfBirth", e.target.value)}
                  />
                </Row>
                <Row label="Gender">
                  <Sel
                    value={form.gender}
                    onChange={(e) => set("gender", e.target.value)}
                    options={GENDERS}
                  />
                </Row>
                <Row label="Marital Status">
                  <Sel
                    value={form.maritalStatus}
                    onChange={(e) => set("maritalStatus", e.target.value)}
                    options={MARITAL}
                  />
                </Row>
                <Row label="Nationality">
                  <Inp
                    value={form.nationality}
                    onChange={(e) => set("nationality", e.target.value)}
                  />
                </Row>
                <Row label="Personal Email">
                  <Inp
                    type="email"
                    value={form.personalEmail}
                    onChange={(e) => set("personalEmail", e.target.value)}
                  />
                </Row>
                <Row label="Phone">
                  <Inp
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </Row>
                <Row label="Location">
                  <Sel
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    options={LOCATIONS}
                  />
                </Row>
              </Grid2>
              <Row label="Residential Address">
                <Inp
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                />
              </Row>
              <Row label="Bio">
                <textarea
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  rows={3}
                  placeholder="Brief bio…"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{
                    border: `1.5px solid ${form.bio ? C.primary : C.border}`,
                    background: C.surface,
                    color: C.textPrimary,
                  }}
                />
              </Row>
            </SectionCard>
          </div>
        );

      case "job":
        return (
          <div className="space-y-4">
            <SectionCard
              icon={Briefcase}
              title="Job Details"
              color={C.accent}
              bg={C.accentLight}
            >
              <Grid2>
                <Row label="Department">
                  <Sel
                    value={form.departmentId}
                    onChange={(e) => {
                      set("departmentId", e.target.value);
                      set("jobRoleId", "");
                    }}
                    options={departments}
                    valueKey="id"
                    labelKey="name"
                  />
                </Row>
                <Row label="Job Role">
                  <Sel
                    value={form.jobRoleId}
                    onChange={(e) => set("jobRoleId", e.target.value)}
                    options={filteredRoles}
                    valueKey="id"
                    labelKey="title"
                    disabled={!form.departmentId}
                  />
                </Row>
                <Row label="Line Manager">
                  <Sel
                    value={form.managerId}
                    onChange={(e) => set("managerId", e.target.value)}
                    options={allEmployees}
                    valueKey="id"
                    labelKey={null}
                  >
                    {allEmployees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.first_name} {e.last_name} ({e.employee_code})
                      </option>
                    ))}
                  </Sel>
                </Row>
                <Row
                  label="Employment Type"
                  required
                  error={errors.employmentType}
                >
                  <Sel
                    value={form.employmentType}
                    onChange={(e) => set("employmentType", e.target.value)}
                    options={EMP_TYPES}
                    error={errors.employmentType}
                  />
                </Row>
                <Row label="Start Date">
                  <Inp
                    type="date"
                    value={form.startDate}
                    onChange={(e) => set("startDate", e.target.value)}
                  />
                </Row>
                <Row label="Confirmation Date">
                  <Inp
                    type="date"
                    value={form.confirmationDate}
                    onChange={(e) => set("confirmationDate", e.target.value)}
                  />
                </Row>
                <Row label="Pay Grade">
                  <Inp
                    value={form.payGrade}
                    onChange={(e) => set("payGrade", e.target.value)}
                    placeholder="e.g. Grade 4 – Senior"
                  />
                </Row>
              </Grid2>
            </SectionCard>

            {/* Department Transfer notice */}
            {form.departmentId !== originalForm.departmentId && (
              <div
                className="flex items-start gap-3 p-4 rounded-2xl"
                style={{
                  background: C.warningLight,
                  border: `1px solid ${C.warning}33`,
                }}
              >
                <Building2
                  size={16}
                  color={C.warning}
                  className="mt-0.5 shrink-0"
                />
                <div>
                  <p className="text-sm font-bold" style={{ color: C.warning }}>
                    Department Transfer
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: C.textSecondary }}
                  >
                    This will log a department_change event in the employee's
                    history and notify the employee.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case "bank":
        return (
          <div className="space-y-4">
            <SectionCard
              icon={CreditCard}
              title="Compensation"
              color={C.success}
              bg={C.successLight}
            >
              <Grid2>
                <Row label="Basic Salary (₦)">
                  <Inp
                    type="number"
                    value={form.basicSalary}
                    onChange={(e) => set("basicSalary", e.target.value)}
                    placeholder="0"
                  />
                </Row>
                <Row label="Housing Allowance (₦)">
                  <Inp
                    type="number"
                    value={form.housingAllowance}
                    onChange={(e) => set("housingAllowance", e.target.value)}
                    placeholder="0"
                  />
                </Row>
                <Row label="Transport Allowance (₦)">
                  <Inp
                    type="number"
                    value={form.transportAllowance}
                    onChange={(e) => set("transportAllowance", e.target.value)}
                    placeholder="0"
                  />
                </Row>
                <Row label="Medical Allowance (₦)">
                  <Inp
                    type="number"
                    value={form.medicalAllowance}
                    onChange={(e) => set("medicalAllowance", e.target.value)}
                    placeholder="0"
                  />
                </Row>
              </Grid2>
            </SectionCard>
            <SectionCard
              icon={Hash}
              title="Bank Details"
              color={C.warning}
              bg={C.warningLight}
            >
              <Grid2>
                <Row label="Bank Name">
                  <Sel
                    value={form.bankName}
                    onChange={(e) => set("bankName", e.target.value)}
                    options={BANKS}
                  />
                </Row>
                <Row label="Account Name">
                  <Inp
                    value={form.accountName}
                    onChange={(e) => set("accountName", e.target.value)}
                  />
                </Row>
                <Row
                  label="Account Number (NUBAN)"
                  error={errors.accountNumber}
                >
                  <Inp
                    value={form.accountNumber}
                    onChange={(e) =>
                      set(
                        "accountNumber",
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    placeholder="0123456789"
                    mono
                    error={errors.accountNumber}
                  />
                </Row>
                <Row label="Pension PIN">
                  <Inp
                    value={form.pensionPin}
                    onChange={(e) => set("pensionPin", e.target.value)}
                    mono
                  />
                </Row>
                <Row label="Tax ID">
                  <Inp
                    value={form.taxId}
                    onChange={(e) => set("taxId", e.target.value)}
                    mono
                  />
                </Row>
              </Grid2>
            </SectionCard>
          </div>
        );

      case "emergency":
        return (
          <SectionCard
            icon={Phone}
            title="Emergency Contact / Next of Kin"
            color={C.danger}
            bg={C.dangerLight}
          >
            <Grid2>
              <Row label="Full Name">
                <Inp
                  value={form.nokName}
                  onChange={(e) => set("nokName", e.target.value)}
                />
              </Row>
              <Row label="Relationship">
                <Inp
                  value={form.nokRelationship}
                  onChange={(e) => set("nokRelationship", e.target.value)}
                  placeholder="e.g. Spouse"
                />
              </Row>
              <Row label="Phone">
                <Inp
                  type="tel"
                  value={form.nokPhone}
                  onChange={(e) => set("nokPhone", e.target.value)}
                />
              </Row>
              <Row label="Address">
                <Inp
                  value={form.nokAddress}
                  onChange={(e) => set("nokAddress", e.target.value)}
                />
              </Row>
            </Grid2>
          </SectionCard>
        );

      case "access":
        return (
          <div className="space-y-4">
            <SectionCard icon={Shield} title="System Access & Status">
              <Row
                label="Employment Status"
                required
                error={errors.employmentStatus}
              >
                <Sel
                  value={form.employmentStatus}
                  onChange={(e) => set("employmentStatus", e.target.value)}
                  options={STATUSES}
                  error={errors.employmentStatus}
                />
              </Row>
              {form.employmentStatus === "terminated" ||
              form.employmentStatus === "suspended" ? (
                <div
                  className="flex items-center gap-2 p-3 rounded-xl"
                  style={{
                    background: C.dangerLight,
                    border: `1px solid ${C.danger}22`,
                  }}
                >
                  <Lock size={13} color={C.danger} />
                  <p className="text-xs" style={{ color: C.danger }}>
                    Setting status to {form.employmentStatus} will revoke system
                    access immediately.
                  </p>
                </div>
              ) : null}
            </SectionCard>

            {/* Manager Assignment */}
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "#FEF3C7" }}
                >
                  <Award size={15} color="#D97706" />
                </div>
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{ color: C.textPrimary }}
                  >
                    Manager / Team Lead Assignment
                  </p>
                  <p className="text-xs" style={{ color: C.textMuted }}>
                    Assigning as manager grants team management access and the
                    manager dashboard.
                  </p>
                </div>
              </div>

              <Toggle
                on={form.isManager}
                onToggle={() => set("isManager", !form.isManager)}
                label="Assign as Manager / Line Manager"
                sub={
                  form.isManager
                    ? `${name} will have manager role and can manage their direct reports.`
                    : "Employee has standard access."
                }
              />

              {form.isManager && !originalForm.isManager && (
                <Motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-4 rounded-xl"
                  style={{
                    background: C.primaryLight,
                    border: `1px solid ${C.primary}33`,
                  }}
                >
                  <p className="text-xs font-bold" style={{ color: C.primary }}>
                    What happens when you save:
                  </p>
                  <ul className="mt-2 space-y-1">
                    {[
                      `${name}'s system role will be set to "manager"`,
                      "They will see the Manager Dashboard in the sidebar",
                      "They can view and manage their direct reports",
                      "They can approve leave requests from their team",
                      "They gain access to team attendance monitoring",
                    ].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-xs"
                        style={{ color: C.textSecondary }}
                      >
                        <Check size={10} color={C.primary} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Motion.div>
              )}

              {!form.isManager && originalForm.isManager && (
                <Motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 rounded-xl"
                  style={{
                    background: C.warningLight,
                    border: `1px solid ${C.warning}33`,
                  }}
                >
                  <p className="text-xs" style={{ color: C.warning }}>
                    Saving will remove manager role. {name} will lose access to
                    the Manager Dashboard.
                  </p>
                </Motion.div>
              )}
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: C.bg,
        fontFamily: "'DM Sans','Sora',sans-serif",
        color: C.textPrimary,
      }}
    >
      <div className="flex h-screen overflow-hidden">
        {/* <AdminSideNavbar
          sidebarOpen={sidebarOpen}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          ADMIN={adminUser}
          pendingApprovals={0}
        /> */}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header
            className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{
              background: "rgba(240,242,248,0.85)",
              backdropFilter: "blur(12px)",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen((p) => !p)}
              className="p-2 rounded-xl hidden md:flex"
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                cursor: "pointer",
              }}
            >
              <Menu size={15} color={C.textSecondary} />
            </Motion.button>
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: C.textSecondary }}
            >
              <button
                onClick={() =>
                  navigate(
                    `/admin/employeemanagement/admin-viewemployeesprofile/${employeeId}`,
                  )
                }
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: C.textSecondary,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <ArrowLeft size={11} /> {loading ? "Loading…" : name}
              </button>
              <ChevronRight size={11} />
              <span className="font-bold" style={{ color: C.textPrimary }}>
                Edit Profile
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAudit((p) => !p)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  color: C.textSecondary,
                  cursor: "pointer",
                }}
              >
                <History size={12} /> Audit Trail
              </Motion.button>
              {isDirty && (
                <span
                  className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{ background: C.warningLight, color: C.warning }}
                >
                  {dirtyFields.length} unsaved change
                  {dirtyFields.length > 1 ? "s" : ""}
                </span>
              )}
              <Motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving || !isDirty}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white"
                style={{
                  background: isDirty
                    ? `linear-gradient(135deg,${C.primary},#8B5CF6)`
                    : C.border,
                  border: "none",
                  cursor: isDirty ? "pointer" : "not-allowed",
                  boxShadow: isDirty ? `0 3px 12px ${C.primary}44` : "none",
                }}
              >
                {saving ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Save size={12} />
                )}
                {saving ? "Saving…" : "Save Changes"}
              </Motion.button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-6">
            {error && (
              <div
                className="flex items-center gap-3 p-4 rounded-2xl mb-4"
                style={{
                  background: C.dangerLight,
                  border: `1px solid ${C.danger}33`,
                }}
              >
                <AlertCircle size={16} color={C.danger} />
                <p className="text-sm flex-1" style={{ color: C.danger }}>
                  {error}
                </p>
                <button
                  onClick={load}
                  className="text-xs font-bold px-3 py-1 rounded-lg"
                  style={{
                    background: C.danger,
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            <div className="flex gap-5">
              {/* Left: Tabs + Content */}
              <div className="flex-1 min-w-0 space-y-4">
                {/* Tab bar */}
                <Motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0}
                  className="flex items-center gap-1 overflow-x-auto"
                  style={{ scrollbarWidth: "none" }}
                >
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
                        style={{
                          background: isActive ? C.primary : C.surface,
                          color: isActive ? "#fff" : C.textSecondary,
                          border: `1px solid ${isActive ? "transparent" : C.border}`,
                          boxShadow: isActive
                            ? `0 4px 12px ${C.primary}44`
                            : "none",
                          cursor: "pointer",
                        }}
                      >
                        <Icon size={12} />
                        {tab.label}
                      </button>
                    );
                  })}
                </Motion.div>

                {loading ? (
                  <div className="space-y-3">
                    {[80, 160, 80].map((h, i) => (
                      <div
                        key={i}
                        style={{
                          height: h,
                          borderRadius: 16,
                          background: "#E2E8F4",
                          animation: "shimmer 1.4s infinite linear",
                          backgroundSize: "200%",
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <Motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      {renderTab()}
                    </Motion.div>
                  </AnimatePresence>
                )}

                {/* Save bar */}
                {!loading && (
                  <Motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={3}
                    className="flex items-center justify-between p-4 rounded-2xl"
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <p className="text-xs" style={{ color: C.textMuted }}>
                      {isDirty ? (
                        <>
                          <span
                            className="font-semibold"
                            style={{ color: C.warning }}
                          >
                            {dirtyFields.length} change
                            {dirtyFields.length > 1 ? "s" : ""}
                          </span>{" "}
                          pending save
                        </>
                      ) : (
                        "All changes saved"
                      )}
                    </p>
                    <div className="flex gap-2">
                      <Motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setForm(originalForm)}
                        disabled={!isDirty}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                        style={{
                          background: C.surfaceAlt,
                          border: `1px solid ${C.border}`,
                          color: C.textSecondary,
                          cursor: isDirty ? "pointer" : "not-allowed",
                        }}
                      >
                        <RefreshCw size={11} /> Reset
                      </Motion.button>
                      <Motion.button
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSave}
                        disabled={saving || !isDirty}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white"
                        style={{
                          background: isDirty
                            ? `linear-gradient(135deg,${C.primary},#8B5CF6)`
                            : C.border,
                          border: "none",
                          cursor: isDirty ? "pointer" : "not-allowed",
                        }}
                      >
                        {saving ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <Save size={11} />
                        )}
                        {saving ? "Saving…" : "Save Changes"}
                      </Motion.button>
                    </div>
                  </Motion.div>
                )}
              </div>

              {/* Right: Audit Trail */}
              <AnimatePresence>
                {showAudit && (
                  <Motion.div
                    initial={{ opacity: 0, x: 20, width: 0 }}
                    animate={{ opacity: 1, x: 0, width: 280 }}
                    exit={{ opacity: 0, x: 20, width: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="shrink-0 overflow-hidden"
                  >
                    <Card style={{ width: 280 }}>
                      <div
                        className="flex items-center justify-between p-4"
                        style={{ borderBottom: `1px solid ${C.border}` }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: C.primaryLight }}
                          >
                            <History size={13} color={C.primary} />
                          </div>
                          <span
                            className="text-sm font-bold"
                            style={{ color: C.textPrimary }}
                          >
                            Audit Trail
                          </span>
                        </div>
                        <button
                          onClick={() => setShowAudit(false)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <X size={13} color={C.textMuted} />
                        </button>
                      </div>
                      <div
                        className="p-4 space-y-3 overflow-y-auto"
                        style={{ maxHeight: "calc(100vh - 180px)" }}
                      >
                        {audit.length === 0 ? (
                          <div className="text-center py-8">
                            <History
                              size={28}
                              color={C.textMuted}
                              className="mx-auto mb-2"
                            />
                            <p
                              className="text-xs"
                              style={{ color: C.textMuted }}
                            >
                              No audit history
                            </p>
                          </div>
                        ) : (
                          audit.map((e, i) => (
                            <div key={e.id ?? i} className="flex gap-3">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                style={{ background: C.primary }}
                              >
                                {(e.recorded_by_name ?? "?")[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p
                                  className="text-xs font-semibold"
                                  style={{ color: C.textPrimary }}
                                >
                                  {e.event_type ?? "Update"}
                                </p>
                                {e.notes && (
                                  <p
                                    className="text-[11px] mt-0.5"
                                    style={{ color: C.textSecondary }}
                                  >
                                    {e.notes}
                                  </p>
                                )}
                                <p
                                  className="text-[10px] mt-1"
                                  style={{ color: C.textMuted }}
                                >
                                  {e.effective_date
                                    ? new Date(
                                        e.effective_date,
                                      ).toLocaleDateString()
                                    : ""}{" "}
                                  · {e.recorded_by_name ?? "—"}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </Card>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>

      {/* Confirm modal */}
      <AnimatePresence>
        {showConfirm && (
          <>
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowConfirm(false)}
            />
            <Motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-4"
            >
              <div
                className="rounded-2xl p-6 shadow-2xl"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <h3
                  className="text-base font-bold mb-2"
                  style={{ color: C.textPrimary }}
                >
                  Confirm Changes
                </h3>
                <p className="text-sm mb-4" style={{ color: C.textSecondary }}>
                  {dirtyFields.length} field{dirtyFields.length > 1 ? "s" : ""}{" "}
                  will be updated for <strong>{name}</strong>.
                </p>
                {form.isManager !== originalForm.isManager && (
                  <div
                    className="p-3 rounded-xl mb-4"
                    style={{ background: C.primaryLight }}
                  >
                    <p
                      className="text-xs font-bold"
                      style={{ color: C.primary }}
                    >
                      {form.isManager
                        ? `✓ ${name} will be assigned Manager role`
                        : `✓ ${name}'s Manager role will be removed`}
                    </p>
                  </div>
                )}
                {form.departmentId !== originalForm.departmentId && (
                  <div
                    className="p-3 rounded-xl mb-4"
                    style={{ background: C.warningLight }}
                  >
                    <p
                      className="text-xs font-bold"
                      style={{ color: C.warning }}
                    >
                      ✓ Department transfer will be logged
                    </p>
                  </div>
                )}
                <div className="flex gap-3">
                  <Motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{
                      background: C.surfaceAlt,
                      color: C.textSecondary,
                      border: `1px solid ${C.border}`,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </Motion.button>
                  <Motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmSave}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                    style={{
                      background: `linear-gradient(135deg,${C.primary},#8B5CF6)`,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <Save size={13} /> Save Changes
                  </Motion.button>
                </div>
              </div>
            </Motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl z-50"
            style={{
              background: toast.type === "error" ? C.danger : C.navy,
              color: "#fff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              minWidth: 300,
            }}
          >
            {toast.type === "error" ? (
              <AlertCircle size={15} color="#fff" />
            ) : (
              <CheckCircle2 size={15} color={C.success} />
            )}
            <span className="text-sm">{toast.msg}</span>
            <button
              onClick={() => setToast(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                marginLeft: "auto",
              }}
            >
              <X size={13} color="rgba(255,255,255,0.5)" />
            </button>
          </Motion.div>
        )}
      </AnimatePresence>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}
