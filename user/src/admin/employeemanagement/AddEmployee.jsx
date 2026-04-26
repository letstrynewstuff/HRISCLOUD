// src/admin/employeemanagement/AddEmployee.jsx
// Route: /admin/employeemanagement/admin-addemployees
// API-connected — no mock data

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSideNavbar from "../AdminSideNavbar";
import { motion, AnimatePresence } from "framer-motion";
// import { createEmployee } from "../../api/service/employeeApi";

import {
  User,
  Briefcase,
  DollarSign,
  CreditCard,
  Bell,
  Menu,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Check,
  X,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  Upload,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Shield,
  Lock,
  Key,
  Hash,
  UserPlus,
  Globe,
  Star,
  Zap,
  Construction,
} from "lucide-react";
import { createEmployee, getEmployees } from "../../api/service/employeeApi";
import { departmentApi } from "../../api/service/departmentApi";
import { gradeApi } from "../../api/service/gradeApi";
import { listJobRoles } from "../../api/service/jobRoleApi";

/* ─── Palette ─── */
const C = {
  bg: "#F0F2F8",
  surface: "#FFFFFF",
  surfaceHover: "#F7F8FC",
  surfaceAlt: "#F7F8FC",
  border: "#E4E7F0",
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
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

/* ─── Static reference data ─── */
const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Finance",
  "HR",
  "Operations",
  "Sales",
  "Marketing",
  "Legal",
];
const ROLES_BY_DEPT = {
  Engineering: [
    "Frontend Developer",
    "Backend Engineer",
    "DevOps Engineer",
    "Engineering Manager",
    "QA Engineer",
  ],
  Product: [
    "Product Manager",
    "UX Designer",
    "UX Researcher",
    "Senior Product Designer",
  ],
  Finance: ["Financial Analyst", "Finance Manager", "Accountant", "CFO"],
  HR: ["HR Officer", "HR Generalist", "Talent Acquisition", "HR Manager"],
  Operations: ["Operations Manager", "Business Analyst", "Project Manager"],
  Sales: ["Sales Executive", "Head of Sales", "Account Manager"],
  Marketing: ["Content Strategist", "Marketing Lead", "Digital Marketer"],
  Legal: ["Legal Counsel", "Contract Manager", "Compliance Officer"],
  // Construction: ["Legal Counsel", "Contract Manager", "Compliance Officer"],
  // OilandGas: ["Legal Counsel", "Contract Manager", "Compliance Officer"],
};
const GRADES = [
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Senior",
  "Lead",
  "Manager",
  "Director",
];
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
  "Kaduna",
  "Remote",
];
const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full-Time" },
  { value: "part_time", label: "Part-Time" },
  { value: "contract", label: "Contract" },
  { value: "intern", label: "Intern" },
];
const GENDERS = ["male", "female", "other"];
const MARITAL = ["single", "married", "divorced", "widowed"];

const STEPS = [
  { id: 1, label: "Personal", icon: User, desc: "Basic info & contact" },
  {
    id: 2,
    label: "Job",
    icon: Briefcase,
    desc: "Role, department & reporting",
  },
  { id: 3, label: "Salary", icon: DollarSign, desc: "Compensation & grade" },
  { id: 4, label: "Bank", icon: CreditCard, desc: "Payment details" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Field components ─── */
const FormField = ({ label, required, error, children, hint }) => (
  <div>
    <label
      className="block text-xs font-semibold mb-1.5"
      style={{ color: C.textPrimary }}
    >
      {label} {required && <span style={{ color: C.danger }}>*</span>}
    </label>
    {children}
    {hint && !error && (
      <p className="text-[11px] mt-1" style={{ color: C.textMuted }}>
        {hint}
      </p>
    )}
    {error && (
      <p
        className="text-[11px] mt-1 flex items-center gap-1"
        style={{ color: C.danger }}
      >
        <AlertCircle size={10} /> {error}
      </p>
    )}
  </div>
);

const Input = ({ error, className = "", ...props }) => (
  <input
    className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all ${className}`}
    style={{
      background: C.surfaceAlt,
      border: `1.5px solid ${error ? C.danger : props.value ? C.primary + "66" : C.border}`,
      color: C.textPrimary,
      boxShadow: props.value ? `0 0 0 3px ${C.primaryLight}` : "none",
    }}
    {...props}
  />
);

const Select = ({ error, children, ...props }) => (
  <div className="relative">
    <select
      className="w-full appearance-none pl-3.5 pr-9 py-2.5 rounded-xl text-sm outline-none transition-all"
      style={{
        background: C.surfaceAlt,
        border: `1.5px solid ${error ? C.danger : props.value ? C.primary + "66" : C.border}`,
        color: props.value ? C.textPrimary : C.textMuted,
        boxShadow: props.value ? `0 0 0 3px ${C.primaryLight}` : "none",
      }}
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      size={14}
      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
      color={C.textMuted}
    />
  </div>
);

/* ─── Main ─── */
export default function AddEmployee() {
  const navigate = useNavigate();
  const [dbDepartments, setDbDepartments] = useState([]);
  const [dbRoles, setDbRoles] = useState([]);
  const [dbGrades, setDbGrades] = useState([]);
  const [dbManagers, setDbManagers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successModal, setSuccessModal] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(null);
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);

  // useEffect(() => {
  //   const fetchFormDependencies = async () => {
  //     try {
  //       // 1. Fetch Departments
  //       const deptRes = await departmentApi.list();
  //       setDbDepartments(deptRes.data || deptRes);

  //       // 2. Fetch Grades
  //       const gradeRes = await gradeApi.list();
  //       setDbGrades(gradeRes.data || gradeRes);

  //       // 3. Fetch active employees (for Managers)
  //       const empRes = await getEmployees({ limit: 1000, status: "active" });
  //       setDbManagers(empRes.employees || empRes.data?.employees || empRes);

  //       // 4. ✨ Fetch Job Roles using your specific API service!
  //       const roleRes = await listJobRoles();
  //       // Adjust this depending on if your backend returns { data: [...] } or just [...]
  //       setDbRoles(roleRes.data || roleRes);
  //     } catch (err) {
  //       console.error("Failed to load form dependencies:", err);
  //     }
  //   };

  //   fetchFormDependencies();
  // }, []);
  // Inside AddEmployee.jsx
  // useEffect(() => {
  //   const fetchFormDependencies = async () => {
  //     try {
  //       // Use Promise.all to load everything at once - much faster
  //       const [deptRes, gradeRes, empRes, roleRes] = await Promise.all([
  //         departmentApi.list(),
  //         gradeApi.list(),
  //         getEmployees({ limit: 1000, status: "active" }),
  //         listJobRoles(),
  //       ]);

  //       // Check your console to see the structure: console.log(deptRes)
  //       // We use || [] to ensure .map() never fails
  //       setDbDepartments(deptRes.data || deptRes || []);
  //       setDbGrades(gradeRes.data || gradeRes || []);
  //       setDbManagers(empRes.employees || empRes.data || []);
  //       setDbRoles(roleRes.data || roleRes || []);
  //     } catch (err) {
  //       console.error("Failed to load form dependencies:", err);
  //     }
  //   };

  //   fetchFormDependencies();
  // }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [deptRes, gradeRes, roleRes, empRes] = await Promise.all([
          departmentApi.list(),
          gradeApi.list(),
          listJobRoles(),
          getEmployees({ limit: 1000, status: "active" }),
        ]);

        // console.log("Dept Response:", deptRes); // DEBUG: Check this in your browser console!

        // 1. Fix Departments: Check if it's in .data or .departments
        const deptArray =
          deptRes.data ||
          deptRes.departments ||
          (Array.isArray(deptRes) ? deptRes : []);
        setDbDepartments(deptArray);

        // 2. Fix Grades
        const gradeArray =
          gradeRes.data ||
          gradeRes.grades ||
          (Array.isArray(gradeRes) ? gradeRes : []);
        setDbGrades(gradeArray);

        // 3. Fix Roles
        const roleArray =
          roleRes.data ||
          roleRes.roles ||
          (Array.isArray(roleRes) ? roleRes : []);
        setDbRoles(roleArray);

        // 4. Fix Managers: employeeApi returns { employees: [...] }
        // If it shows "Employee" but no name, the fields might be 'first_name' (snake_case)
        const managerArray =
          empRes.employees || empRes.data?.employees || empRes.data || [];
        setDbManagers(managerArray);
      } catch (err) {
        console.error("Failed to fetch dropdown data:", err);
      }
    };
    loadData();
  }, []);

  const [form, setForm] = useState({
    // Personal
    firstName: "",
    lastName: "",
    middleName: "",
    personalEmail: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    maritalStatus: "",
    nationality: "Nigerian",
    address: "",
    location: "",
    // Next of kin / emergency
    nokName: "",
    nokPhone: "",
    nokRelationship: "",
    nokAddress: "",
    // Job
    departmentId: "",
    jobRoleId: "",
    employmentType: "full_time",
    managerId: "",
    startDate: "",
    payGrade: "",
    probationMonths: "3",
    workEmail: "",
    password: "",
    // Salary
    basicSalary: "",
    housingAllowance: "",
    transportAllowance: "",
    medicalAllowance: "",
    otherAllowance: "",
    payFrequency: "Monthly",
    currency: "NGN",
    // Bank
    bankName: "",
    accountName: "",
    accountNumber: "",
    accountType: "Savings",
    // Options
    sendInvite: true,
    photo: null,
    // derived dept name for UI only
    _deptName: "",
    _roleName: "",
  });

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const grossSalary = [
    form.basicSalary,
    form.housingAllowance,
    form.transportAllowance,
    form.medicalAllowance,
    form.otherAllowance,
  ].reduce((s, v) => s + (Number(v) || 0), 0);

  const roles = ROLES_BY_DEPT[form._deptName] || [];

  /* ─── Validation per step ─── */
  const validate = (step) => {
    const errs = {};
    if (step === 1) {
      if (!form.firstName.trim()) errs.firstName = "First name is required";
      if (!form.lastName.trim()) errs.lastName = "Last name is required";
      if (!form.personalEmail.trim()) errs.personalEmail = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.personalEmail))
        errs.personalEmail = "Invalid email address";
      if (!form.phone.trim()) errs.phone = "Phone number is required";
      if (!form.gender) errs.gender = "Please select a gender";
      if (!form.location) errs.location = "Please select a location";
    }
    // if (step === 2) {
    //   if (!form._deptName) errs.department = "Please select a department";
    //   if (!form._roleName) errs.role = "Please select a role";
    //   if (!form.startDate) errs.startDate = "Start date is required";
    //   if (!form.employmentType)
    //     errs.employmentType = "Please select employment type";
    //   if (!form.password)
    //     errs.password = "Password is required for employee login";
    //   else if (form.password.length < 6)
    //     errs.password = "Password must be at least 6 characters";
    // }
    if (step === 2) {
      // ✨ FIX: Check the actual state keys used by your Select components
      if (!form.departmentId) errs.department = "Please select a department";
      if (!form.jobRoleId) errs.role = "Please select a role";

      if (!form.startDate) errs.startDate = "Start date is required";
      if (!form.employmentType)
        errs.employmentType = "Please select employment type";
      if (!form.password)
        errs.password = "Password is required for employee login";
      else if (form.password.length < 6)
        errs.password = "Password must be at least 6 characters";
    }
    if (step === 3) {
      if (!form.basicSalary) errs.basicSalary = "Basic salary is required";
      else if (Number(form.basicSalary) < 50000)
        errs.basicSalary = "Minimum salary is ₦50,000";
    }
    if (step === 4) {
      if (!form.bankName) errs.bankName = "Please select a bank";
      if (!form.accountName.trim())
        errs.accountName = "Account name is required";
      if (!form.accountNumber.trim())
        errs.accountNumber = "Account number is required";
      else if (!/^\d{10}$/.test(form.accountNumber))
        errs.accountNumber = "Account number must be 10 digits";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validate(currentStep)) setCurrentStep((s) => s + 1);
  };
  const handleBack = () => {
    setErrors({});
    setCurrentStep((s) => s - 1);
  };

  /* ─── Submit ─── */
  const handleSubmit = async () => {
    if (!validate(4)) return;
    setSubmitting(true);
    setApiError(null);

    try {
      const payload = {
        // Personal
        firstName: form.firstName,
        lastName: form.lastName,
        middleName: form.middleName || undefined,
        personalEmail: form.personalEmail,
        workEmail: form.workEmail || undefined,
        phone: form.phone,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth || undefined,
        maritalStatus: form.maritalStatus || undefined,
        nationality: form.nationality,
        address: form.address || undefined,
        location: form.location,
        // Next of kin
        nextOfKin: form.nokName
          ? {
              name: form.nokName,
              phone: form.nokPhone,
              relationship: form.nokRelationship,
              address: form.nokAddress,
            }
          : undefined,
        // Job — sending dept/role as names since we're using name-based selects
        // If your backend expects UUIDs, you'd need to look them up.
        // For now, pass as-is; adapt to UUID lookup if your departments API is available.
        departmentId: form.departmentId || undefined,
        jobRoleId: form.jobRoleId || undefined,
        managerId: form.managerId || undefined,
        employmentType: form.employmentType,
        startDate: form.startDate,
        payGrade: form.payGrade || undefined,
        // Salary
        basicSalary: Number(form.basicSalary) || undefined,
        // Bank
        bankName: form.bankName,
        accountName: form.accountName,
        accountNumber: form.accountNumber,
        // Options
        sendInvite: form.sendInvite,
        role: "employee",
        password: form.password,
      };

      const result = await createEmployee(payload);

      setCreatedEmployee({
        empId: result.employee?.employeeCode || result.employee?.id,
        name: `${form.firstName} ${form.lastName}`,
        email:
          form.workEmail ||
          `${form.firstName.toLowerCase()}.${form.lastName.toLowerCase().charAt(0)}@hriscloud.ng`,
        role: form._roleName,
        dept: form._deptName,
        id: result.employee?.id,
      });
      setSuccessModal(true);
    } catch (err) {
      setApiError(
        err?.response?.data?.message ||
          "Failed to create employee. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((f) => ({ ...f, photo: file }));
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      middleName: "",
      personalEmail: "",
      phone: "",
      gender: "",
      dateOfBirth: "",
      maritalStatus: "",
      nationality: "Nigerian",
      address: "",
      location: "",
      nokName: "",
      nokPhone: "",
      nokRelationship: "",
      nokAddress: "",
      departmentId: "",
      jobRoleId: "",
      employmentType: "full_time",
      managerId: "",
      startDate: "",
      payGrade: "",
      probationMonths: "3",
      workEmail: "",
      basicSalary: "",
      housingAllowance: "",
      transportAllowance: "",
      medicalAllowance: "",
      otherAllowance: "",
      payFrequency: "Monthly",
      currency: "NGN",
      bankName: "",
      accountName: "",
      accountNumber: "",
      accountType: "Savings",
      sendInvite: true,
      photo: null,
      _deptName: "",
      _roleName: "",
    });
    setPhotoPreview(null);
    setCurrentStep(1);
    setErrors({});
    setApiError(null);
  };

  const progressPct = ((currentStep - 1) / STEPS.length) * 100;

  return (
    <div
      className="min-h-screen"
      style={{
        background: C.bg,
        color: C.textPrimary,
        fontFamily: "'DM Sans','Sora',sans-serif",
      }}
    >
      <div className="flex h-screen overflow-hidden">
        <AdminSideNavbar
          sidebarOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          ADMIN={ADMIN}
          pendingApprovals={7}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar */}
          <header
            className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{
              background: "rgba(240,242,248,0.9)",
              backdropFilter: "blur(12px)",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen((p) => !p)}
              className="p-2 rounded-xl"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              <Menu size={16} color={C.textSecondary} />
            </motion.button>

            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: C.textMuted }}
            >
              <span>Admin</span>
              <ChevronRight size={12} />
              <span>Employees</span>
              <ChevronRight size={12} />
              <span className="font-semibold" style={{ color: C.textPrimary }}>
                Add New Employee
              </span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/admin/employeemanagement")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  color: C.textSecondary,
                }}
              >
                <ChevronLeft size={13} /> Back to Employees
              </motion.button>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg,#4F46E5,#06B6D4)",
                }}
              >
                {ADMIN.initials}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-5 md:p-7">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Page title */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0}
              >
                <h1
                  className="text-xl font-bold"
                  style={{
                    color: C.textPrimary,
                    fontFamily: "Sora,sans-serif",
                  }}
                >
                  Add New Employee
                </h1>
                <p
                  className="text-sm mt-0.5"
                  style={{ color: C.textSecondary }}
                >
                  Complete all sections to create the employee profile.
                </p>
              </motion.div>

              {/* API Error Banner */}
              <AnimatePresence>
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{
                      background: C.dangerLight,
                      border: `1px solid ${C.danger}33`,
                    }}
                  >
                    <AlertCircle size={16} color={C.danger} />
                    <p
                      className="text-sm font-semibold flex-1"
                      style={{ color: C.danger }}
                    >
                      {apiError}
                    </p>
                    <button
                      onClick={() => setApiError(null)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <X size={14} color={C.danger} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step Progress */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={1}
              >
                <div
                  className="bg-white rounded-2xl p-5 shadow-sm"
                  style={{ border: `1px solid ${C.border}` }}
                >
                  <div
                    className="h-1.5 rounded-full mb-5 overflow-hidden"
                    style={{ background: C.border }}
                  >
                    <motion.div
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg,${C.primary},${C.accent})`,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {STEPS.map((step) => {
                      const done = step.id < currentStep;
                      const active = step.id === currentStep;
                      const Icon = step.icon;
                      return (
                        <div
                          key={step.id}
                          className="flex flex-col items-center gap-1.5 text-center"
                        >
                          <motion.div
                            animate={{
                              background: done
                                ? C.success
                                : active
                                  ? C.primary
                                  : C.border,
                              scale: active ? 1.1 : 1,
                            }}
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{
                              boxShadow: active
                                ? `0 4px 12px ${C.primary}44`
                                : "none",
                            }}
                          >
                            {done ? (
                              <Check size={16} color="#fff" />
                            ) : (
                              <Icon
                                size={16}
                                color={active ? "#fff" : C.textMuted}
                              />
                            )}
                          </motion.div>
                          <p
                            className="text-xs font-semibold"
                            style={{
                              color: active
                                ? C.primary
                                : done
                                  ? C.success
                                  : C.textMuted,
                            }}
                          >
                            {step.label}
                          </p>
                          <p
                            className="text-[10px] hidden sm:block"
                            style={{ color: C.textMuted }}
                          >
                            {step.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Form Sections */}
              <AnimatePresence mode="wait">
                {/* STEP 1 — Personal */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div
                      className="bg-white rounded-2xl shadow-sm"
                      style={{ border: `1px solid ${C.border}` }}
                    >
                      <div
                        className="px-6 py-4 border-b flex items-center gap-3"
                        style={{ borderColor: C.border }}
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: C.primaryLight }}
                        >
                          <User size={15} color={C.primary} />
                        </div>
                        <div>
                          <p
                            className="font-semibold text-sm"
                            style={{ color: C.textPrimary }}
                          >
                            Personal Information
                          </p>
                          <p className="text-xs" style={{ color: C.textMuted }}>
                            Employee's basic personal details
                          </p>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Photo upload */}
                        <div className="flex items-center gap-5">
                          <div
                            className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center shrink-0"
                            style={{
                              background: C.primaryLight,
                              border: `2px dashed ${C.primary}44`,
                            }}
                          >
                            {photoPreview ? (
                              <img
                                src={photoPreview}
                                alt="preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={28} color={C.primary} />
                            )}
                          </div>
                          <div>
                            <label
                              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                              style={{
                                background: C.primaryLight,
                                color: C.primary,
                              }}
                            >
                              <Upload size={13} />
                              Upload Photo
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoChange}
                              />
                            </label>
                            <p
                              className="text-[11px] mt-1.5"
                              style={{ color: C.textMuted }}
                            >
                              JPG, PNG · Max 2MB · Square preferred
                            </p>
                          </div>
                        </div>

                        {/* Name */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            label="First Name"
                            required
                            error={errors.firstName}
                          >
                            <Input
                              value={form.firstName}
                              onChange={(e) => set("firstName", e.target.value)}
                              placeholder="e.g. Amara"
                              error={errors.firstName}
                            />
                          </FormField>
                          <FormField label="Middle Name">
                            <Input
                              value={form.middleName}
                              onChange={(e) =>
                                set("middleName", e.target.value)
                              }
                              placeholder="Optional"
                            />
                          </FormField>
                          <FormField
                            label="Last Name"
                            required
                            error={errors.lastName}
                          >
                            <Input
                              value={form.lastName}
                              onChange={(e) => set("lastName", e.target.value)}
                              placeholder="e.g. Johnson"
                              error={errors.lastName}
                            />
                          </FormField>
                          <FormField
                            label="NIN (National Identity No)"
                            error={errors.nin}
                          >
                            <Input
                              value={form.nin}
                              onChange={(e) => set("nin", e.target.value)}
                              placeholder="00000000000"
                            />
                          </FormField>

                          <FormField
                            label="BVN (Bank Verification No)"
                            error={errors.bvn}
                          >
                            <Input
                              value={form.bvn}
                              onChange={(e) => set("bvn", e.target.value)}
                              placeholder="00000000000"
                            />
                          </FormField>
                        </div>

                        {/* Email, Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            label="Personal Email"
                            required
                            error={errors.personalEmail}
                            hint="Used to auto-generate work email"
                          >
                            <Input
                              type="email"
                              value={form.personalEmail}
                              onChange={(e) =>
                                set("personalEmail", e.target.value)
                              }
                              placeholder="personal@email.com"
                              error={errors.personalEmail}
                            />
                          </FormField>
                          <FormField
                            label="Phone Number"
                            required
                            error={errors.phone}
                          >
                            <Input
                              type="tel"
                              value={form.phone}
                              onChange={(e) => set("phone", e.target.value)}
                              placeholder="+234 801 234 5678"
                              error={errors.phone}
                            />
                          </FormField>
                        </div>

                        {/* Work email override */}
                        <FormField
                          label="Work Email (optional override)"
                          hint="Leave blank to auto-generate from name"
                        >
                          <Input
                            type="email"
                            value={form.workEmail}
                            onChange={(e) => set("workEmail", e.target.value)}
                            placeholder="firstname.l@company.ng"
                          />
                        </FormField>

                        {/* Gender, DOB, Marital */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            label="Gender"
                            required
                            error={errors.gender}
                          >
                            <Select
                              value={form.gender}
                              onChange={(e) => set("gender", e.target.value)}
                              error={errors.gender}
                            >
                              <option value="">Select…</option>
                              {GENDERS.map((g) => (
                                <option key={g} value={g}>
                                  {g.charAt(0).toUpperCase() + g.slice(1)}
                                </option>
                              ))}
                            </Select>
                          </FormField>
                          <FormField label="Date of Birth">
                            <Input
                              type="date"
                              value={form.dateOfBirth}
                              onChange={(e) =>
                                set("dateOfBirth", e.target.value)
                              }
                            />
                          </FormField>
                          <FormField label="Marital Status">
                            <Select
                              value={form.maritalStatus}
                              onChange={(e) =>
                                set("maritalStatus", e.target.value)
                              }
                            >
                              <option value="">Select…</option>
                              {MARITAL.map((m) => (
                                <option key={m} value={m}>
                                  {m.charAt(0).toUpperCase() + m.slice(1)}
                                </option>
                              ))}
                            </Select>
                          </FormField>
                        </div>

                        {/* Nationality, Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField label="Nationality">
                            <Input
                              value={form.nationality}
                              onChange={(e) =>
                                set("nationality", e.target.value)
                              }
                              placeholder="e.g. Nigerian"
                            />
                          </FormField>
                          <FormField
                            label="Work Location"
                            required
                            error={errors.location}
                          >
                            <Select
                              value={form.location}
                              onChange={(e) => set("location", e.target.value)}
                              error={errors.location}
                            >
                              <option value="">Select location…</option>
                              {LOCATIONS.map((l) => (
                                <option key={l}>{l}</option>
                              ))}
                            </Select>
                          </FormField>
                        </div>

                        {/* Address */}
                        <FormField label="Residential Address">
                          <textarea
                            value={form.address}
                            onChange={(e) => set("address", e.target.value)}
                            rows={2}
                            placeholder="Full residential address…"
                            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
                            style={{
                              background: C.surfaceAlt,
                              border: `1.5px solid ${form.address ? C.primary + "66" : C.border}`,
                              color: C.textPrimary,
                            }}
                          />
                        </FormField>

                        {/* Next of kin */}
                        <div>
                          <p
                            className="text-xs font-bold uppercase tracking-wide mb-3"
                            style={{ color: C.textMuted }}
                          >
                            Next of Kin / Emergency Contact
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Full Name">
                              <Input
                                value={form.nokName}
                                onChange={(e) => set("nokName", e.target.value)}
                                placeholder="Contact person"
                              />
                            </FormField>
                            <FormField label="Phone Number">
                              <Input
                                type="tel"
                                value={form.nokPhone}
                                onChange={(e) =>
                                  set("nokPhone", e.target.value)
                                }
                                placeholder="+234 …"
                              />
                            </FormField>
                            <FormField label="Relationship">
                              <Input
                                value={form.nokRelationship}
                                onChange={(e) =>
                                  set("nokRelationship", e.target.value)
                                }
                                placeholder="e.g. Spouse"
                              />
                            </FormField>
                            <FormField label="Address">
                              <Input
                                value={form.nokAddress}
                                onChange={(e) =>
                                  set("nokAddress", e.target.value)
                                }
                                placeholder="Contact address"
                              />
                            </FormField>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2 — Job */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div
                      className="bg-white rounded-2xl shadow-sm"
                      style={{ border: `1px solid ${C.border}` }}
                    >
                      <div
                        className="px-6 py-4 border-b flex items-center gap-3"
                        style={{ borderColor: C.border }}
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: C.accentLight }}
                        >
                          <Briefcase size={15} color={C.accent} />
                        </div>
                        <div>
                          <p
                            className="font-semibold text-sm"
                            style={{ color: C.textPrimary }}
                          >
                            Job Details
                          </p>
                          <p className="text-xs" style={{ color: C.textMuted }}>
                            Role, department, and reporting structure
                          </p>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Auto ID preview */}
                        <div
                          className="flex items-center gap-3 p-4 rounded-xl"
                          style={{
                            background: C.primaryLight,
                            border: `1px solid ${C.primary}22`,
                          }}
                        >
                          <Hash size={15} color={C.primary} />
                          <div>
                            <p
                              className="text-xs font-semibold"
                              style={{ color: C.primary }}
                            >
                              Auto-generated Employee ID
                            </p>
                            <p
                              className="text-sm font-bold font-mono"
                              style={{ color: C.textPrimary }}
                            >
                              EMP-XXXX
                            </p>
                          </div>
                          <p
                            className="ml-auto text-[11px]"
                            style={{ color: C.textMuted }}
                          >
                            Assigned on creation
                          </p>
                        </div>

                        {/* Department + Role */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            label="Department"
                            required
                            error={errors.department}
                          >
                            {/* <Select
                              value={form.departmentId || ""} // Fallback to "" fixes "uncontrolled" warning
                              onChange={(e) => {
                                set("departmentId", e.target.value);
                                set("jobRoleId", ""); // Reset role when dept changes
                              }}
                            > */}
                            <Select
                              value={form.departmentId || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                // Find the name from our list to store it for the UI/Success Modal
                                const dept = dbDepartments.find(
                                  (d) => d.id === val,
                                );

                                setForm((prev) => ({
                                  ...prev,
                                  departmentId: val,
                                  _deptName: dept ? dept.name : "", // Store the name for the success modal
                                  jobRoleId: "", // Reset role
                                }));
                              }}
                            >
                              <option value="">Select department…</option>
                              {Array.isArray(dbDepartments) &&
                                dbDepartments.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.name}
                                  </option>
                                ))}
                            </Select>
                          </FormField>

                          {/* Job Title / Role */}

                          <FormField
                            label="Job Title / Role"
                            required
                            error={errors.role}
                          >
                            {/* <Select
                              value={form.jobRoleId || ""}
                              onChange={(e) => set("jobRoleId", e.target.value)}
                              disabled={!form.departmentId}
                            > */}
                            <Select
                              value={form.jobRoleId || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                const role = dbRoles.find((r) => r.id === val);

                                setForm((prev) => ({
                                  ...prev,
                                  jobRoleId: val,
                                  _roleName: role
                                    ? role.title || role.name
                                    : "", // Store the name for the success modal
                                }));
                              }}
                            >
                              <option value="">
                                {form.departmentId
                                  ? "Select role…"
                                  : "Select department first"}
                              </option>
                              {Array.isArray(dbRoles) &&
                                dbRoles
                                  .filter(
                                    (r) => r.departmentId === form.departmentId,
                                  )

                                  .map((r) => (
                                    <option key={r.id} value={r.id}>
                                      {r.title || r.name}
                                    </option>
                                  ))}
                            </Select>
                          </FormField>
                        </div>

                        {/* Manager + Grade */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* <FormField
                            label="Manager ID (UUID)"
                            hint="Enter manager's employee UUID if known"
                          >
                            <Input
                              value={form.managerId}
                              onChange={(e) => set("managerId", e.target.value)}
                              placeholder="uuid-of-manager"
                            />
                          </FormField>
                          <FormField label="Grade / Level">
                            <Select
                              value={form.payGrade}
                              onChange={(e) => set("payGrade", e.target.value)}
                            >
                              <option value="">Select grade…</option>
                              {GRADES.map((g) => (
                                <option key={g}>{g}</option>
                              ))}
                            </Select>
                          </FormField> */}
                          {/* Manager Dropdown */}
                          {/* <FormField
                            label="Line Manager"
                            hint="Select the employee they report to"
                          >
                            <Select
                              value={form.managerId}
                              onChange={(e) => set("managerId", e.target.value)}
                            >
                              <option value="">No Manager (Top Level)</option>
                              {dbManagers.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.firstName} {m.lastName} (
                                  {m.employeeCode || "Emp"})
                                </option>
                              ))}
                            </Select>
                          </FormField> */}
                          {/* <FormField label="Reporting Manager">
                            <Select
                              value={form.managerId || ""}
                              onChange={(e) => set("managerId", e.target.value)}
                            >
                              <option value="">No Manager (Top Level)</option>
                              {dbManagers.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.firstName} {m.lastName} (
                                  {m.job_role?.title || "Employee"})
                                </option>
                              ))}
                            </Select>
                          </FormField> */}
                          <FormField label="Reporting Manager">
                            <Select
                              value={form.managerId || ""}
                              onChange={(e) => set("managerId", e.target.value)}
                            >
                              <option value="">No Manager (Top Level)</option>
                              {dbManagers.map((m) => {
                                // Logic to handle different backend naming styles
                                const fName = m.firstName || m.first_name || "";
                                const lName = m.lastName || m.last_name || "";
                                const jobTitle =
                                  m.job_role?.title || m.jobTitle || "Staff";

                                return (
                                  <option key={m.id} value={m.id}>
                                    {fName} {lName} — ({jobTitle})
                                  </option>
                                );
                              })}
                            </Select>
                          </FormField>

                          {/* Grade Dropdown */}
                          <FormField label="Grade / Level">
                            <Select
                              value={form.payGrade}
                              onChange={(e) => set("payGrade", e.target.value)}
                            >
                              <option value="">Select grade…</option>
                              {dbGrades.map((g) => (
                                <option key={g.id} value={g.id}>
                                  {g.level || g.name}
                                </option>
                              ))}
                            </Select>
                          </FormField>
                        </div>
                        {/* Login Credentials */}
                        <div>
                          <p
                            className="text-xs font-bold uppercase tracking-wide mb-3"
                            style={{ color: C.textMuted }}
                          >
                            Login Credentials
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              label="Work Email (optional override)"
                              hint="Leave blank to auto-generate from name"
                            >
                              <Input
                                type="email"
                                value={form.workEmail}
                                onChange={(e) =>
                                  set("workEmail", e.target.value)
                                }
                                placeholder="firstname.l@company.ng"
                              />
                            </FormField>

                            <FormField
                              label="Assign Password"
                              required
                              error={errors.password}
                              hint="Employee will use this to log in"
                            >
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  value={form.password}
                                  onChange={(e) =>
                                    set("password", e.target.value)
                                  }
                                  placeholder="Enter secure password"
                                  error={errors.password}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 outline-none"
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                  }}
                                >
                                  {showPassword ? (
                                    <EyeOff size={16} color={C.textMuted} />
                                  ) : (
                                    <Eye size={16} color={C.textMuted} />
                                  )}
                                </button>
                              </div>
                            </FormField>
                          </div>
                        </div>

                        {/* Employment type + Start date + Probation */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            label="Employment Type"
                            required
                            error={errors.employmentType}
                          >
                            <Select
                              value={form.employmentType}
                              onChange={(e) =>
                                set("employmentType", e.target.value)
                              }
                              error={errors.employmentType}
                            >
                              {EMPLOYMENT_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </Select>
                          </FormField>
                          <FormField
                            label="Start Date"
                            required
                            error={errors.startDate}
                          >
                            <Input
                              type="date"
                              value={form.startDate}
                              onChange={(e) => set("startDate", e.target.value)}
                              min={new Date().toISOString().slice(0, 10)}
                              error={errors.startDate}
                            />
                          </FormField>
                          <FormField label="Probation Period (months)">
                            <Select
                              value={form.probationMonths}
                              onChange={(e) =>
                                set("probationMonths", e.target.value)
                              }
                            >
                              {["0", "1", "2", "3", "6"].map((m) => (
                                <option key={m} value={m}>
                                  {m} {m === "0" ? "(None)" : ""}
                                </option>
                              ))}
                            </Select>
                          </FormField>
                        </div>

                        {/* Send invite toggle */}
                        <div
                          className="flex items-center gap-3 p-4 rounded-xl"
                          style={{
                            background: C.surfaceAlt,
                            border: `1px solid ${C.border}`,
                          }}
                        >
                          <button
                            onClick={() => set("sendInvite", !form.sendInvite)}
                            className="w-11 h-6 rounded-full relative transition-all"
                            style={{
                              background: form.sendInvite
                                ? C.primary
                                : C.border,
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <motion.div
                              animate={{
                                left: form.sendInvite
                                  ? "calc(100% - 22px)"
                                  : "2px",
                              }}
                              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                              style={{ position: "absolute" }}
                            />
                          </button>
                          <div>
                            <p
                              className="text-sm font-semibold"
                              style={{ color: C.textPrimary }}
                            >
                              Send Login Invite Email
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: C.textMuted }}
                            >
                              Employee will receive an email with temporary
                              credentials
                            </p>
                          </div>
                        </div>

                        {/* Auto work email preview */}
                        {form.firstName && form.lastName && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-4 rounded-xl"
                            style={{
                              background: C.successLight,
                              border: `1px solid ${C.success}22`,
                            }}
                          >
                            <Mail size={14} color={C.success} />
                            <div>
                              <p
                                className="text-xs font-semibold"
                                style={{ color: C.success }}
                              >
                                Work Email (Auto-generated)
                              </p>
                              <p
                                className="text-sm font-bold"
                                style={{ color: C.textPrimary }}
                              >
                                {form.workEmail ||
                                  `${form.firstName.toLowerCase()}.${form.lastName.toLowerCase().charAt(0)}@hriscloud.ng`}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 — Salary */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div
                      className="bg-white rounded-2xl shadow-sm"
                      style={{ border: `1px solid ${C.border}` }}
                    >
                      <div
                        className="px-6 py-4 border-b flex items-center gap-3"
                        style={{ borderColor: C.border }}
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: C.successLight }}
                        >
                          <DollarSign size={15} color={C.success} />
                        </div>
                        <div>
                          <p
                            className="font-semibold text-sm"
                            style={{ color: C.textPrimary }}
                          >
                            Compensation Details
                          </p>
                          <p className="text-xs" style={{ color: C.textMuted }}>
                            Salary breakdown and pay schedule
                          </p>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Gross preview */}
                        <div
                          className="p-5 rounded-xl"
                          style={{
                            background:
                              "linear-gradient(135deg,#EEF2FF,#ECFEFF)",
                          }}
                        >
                          <p
                            className="text-xs font-semibold mb-1"
                            style={{ color: C.primary }}
                          >
                            Gross Monthly Salary
                          </p>
                          <p
                            className="text-3xl font-bold"
                            style={{
                              color: C.textPrimary,
                              fontFamily: "Sora,sans-serif",
                            }}
                          >
                            ₦{grossSalary.toLocaleString()}
                          </p>
                          <p
                            className="text-xs mt-1"
                            style={{ color: C.textMuted }}
                          >
                            ≈ ₦{(grossSalary * 12).toLocaleString()} / year
                          </p>
                        </div>

                        <FormField
                          label="Basic Salary (₦)"
                          required
                          error={errors.basicSalary}
                          hint="Net of taxes — before allowances"
                        >
                          <div className="relative">
                            <span
                              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold"
                              style={{ color: C.textMuted }}
                            >
                              ₦
                            </span>
                            <Input
                              type="number"
                              value={form.basicSalary}
                              onChange={(e) =>
                                set("basicSalary", e.target.value)
                              }
                              placeholder="0"
                              className="pl-8"
                              error={errors.basicSalary}
                            />
                          </div>
                        </FormField>

                        <div>
                          <p
                            className="text-xs font-bold uppercase tracking-wide mb-3"
                            style={{ color: C.textMuted }}
                          >
                            Allowances
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              {
                                field: "housingAllowance",
                                label: "Housing Allowance (₦)",
                              },
                              {
                                field: "transportAllowance",
                                label: "Transport Allowance (₦)",
                              },
                              {
                                field: "medicalAllowance",
                                label: "Medical Allowance (₦)",
                              },
                              {
                                field: "otherAllowance",
                                label: "Other Allowance (₦)",
                              },
                            ].map(({ field, label }) => (
                              <FormField key={field} label={label}>
                                <div className="relative">
                                  <span
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold"
                                    style={{ color: C.textMuted }}
                                  >
                                    ₦
                                  </span>
                                  <Input
                                    type="number"
                                    value={form[field]}
                                    onChange={(e) => set(field, e.target.value)}
                                    placeholder="0"
                                    className="pl-8"
                                  />
                                </div>
                              </FormField>
                            ))}
                          </div>
                        </div>

                        {/* Breakdown */}
                        {grossSalary > 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-xl overflow-hidden"
                            style={{ border: `1px solid ${C.border}` }}
                          >
                            <div
                              className="px-4 py-2.5"
                              style={{ background: C.surfaceAlt }}
                            >
                              <p
                                className="text-xs font-bold uppercase tracking-wide"
                                style={{ color: C.textMuted }}
                              >
                                Salary Breakdown
                              </p>
                            </div>
                            {[
                              {
                                label: "Basic Salary",
                                value: form.basicSalary,
                              },
                              {
                                label: "Housing Allowance",
                                value: form.housingAllowance,
                              },
                              {
                                label: "Transport Allowance",
                                value: form.transportAllowance,
                              },
                              {
                                label: "Medical Allowance",
                                value: form.medicalAllowance,
                              },
                              { label: "Other", value: form.otherAllowance },
                            ]
                              .filter((r) => Number(r.value) > 0)
                              .map((row, i) => (
                                <div
                                  key={row.label}
                                  className="flex justify-between px-4 py-2.5 text-sm"
                                  style={{
                                    background:
                                      i % 2 === 0 ? C.surface : C.surfaceAlt,
                                  }}
                                >
                                  <span style={{ color: C.textSecondary }}>
                                    {row.label}
                                  </span>
                                  <span
                                    className="font-semibold"
                                    style={{ color: C.textPrimary }}
                                  >
                                    ₦{Number(row.value).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            <div
                              className="flex justify-between px-4 py-3 font-bold text-sm"
                              style={{
                                background: C.primaryLight,
                                borderTop: `1px solid ${C.border}`,
                              }}
                            >
                              <span style={{ color: C.primary }}>
                                Gross Total
                              </span>
                              <span style={{ color: C.primary }}>
                                ₦{grossSalary.toLocaleString()}
                              </span>
                            </div>
                          </motion.div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <FormField label="Pay Frequency">
                            <Select
                              value={form.payFrequency}
                              onChange={(e) =>
                                set("payFrequency", e.target.value)
                              }
                            >
                              {["Monthly", "Bi-weekly"].map((f) => (
                                <option key={f}>{f}</option>
                              ))}
                            </Select>
                          </FormField>
                          <FormField label="Currency">
                            <Select
                              value={form.currency}
                              onChange={(e) => set("currency", e.target.value)}
                            >
                              {["NGN", "USD", "GBP", "EUR"].map((c) => (
                                <option key={c}>{c}</option>
                              ))}
                            </Select>
                          </FormField>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4 — Bank */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div
                      className="bg-white rounded-2xl shadow-sm"
                      style={{ border: `1px solid ${C.border}` }}
                    >
                      <div
                        className="px-6 py-4 border-b flex items-center gap-3"
                        style={{ borderColor: C.border }}
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: C.warningLight }}
                        >
                          <CreditCard size={15} color={C.warning} />
                        </div>
                        <div>
                          <p
                            className="font-semibold text-sm"
                            style={{ color: C.textPrimary }}
                          >
                            Bank Account Details
                          </p>
                          <p className="text-xs" style={{ color: C.textMuted }}>
                            For salary payment via bank transfer
                          </p>
                        </div>
                      </div>

                      <div className="p-6 space-y-5">
                        <div
                          className="flex items-start gap-2.5 p-3.5 rounded-xl"
                          style={{
                            background: C.warningLight,
                            border: `1px solid ${C.warning}33`,
                          }}
                        >
                          <Shield
                            size={14}
                            color={C.warning}
                            className="mt-0.5"
                          />
                          <p
                            className="text-xs"
                            style={{ color: C.textSecondary }}
                          >
                            Bank details are encrypted and only accessible to
                            authorized payroll officers.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <FormField
                            label="Bank Name"
                            required
                            error={errors.bankName}
                          >
                            <Select
                              value={form.bankName}
                              onChange={(e) => set("bankName", e.target.value)}
                              error={errors.bankName}
                            >
                              <option value="">Select bank…</option>
                              {BANKS.map((b) => (
                                <option key={b}>{b}</option>
                              ))}
                            </Select>
                          </FormField>
                          <FormField label="Account Type">
                            <Select
                              value={form.accountType}
                              onChange={(e) =>
                                set("accountType", e.target.value)
                              }
                            >
                              {["Savings", "Current"].map((t) => (
                                <option key={t}>{t}</option>
                              ))}
                            </Select>
                          </FormField>
                        </div>

                        <FormField
                          label="Account Name"
                          required
                          error={errors.accountName}
                          hint="Must match the name on the bank account exactly"
                        >
                          <Input
                            value={form.accountName}
                            onChange={(e) => set("accountName", e.target.value)}
                            placeholder="e.g. JOHNSON AMARA CHIDINMA"
                            error={errors.accountName}
                          />
                        </FormField>

                        <FormField
                          label="Account Number (NUBAN)"
                          required
                          error={errors.accountNumber}
                          hint="10-digit NUBAN account number"
                        >
                          <Input
                            type="text"
                            inputMode="numeric"
                            maxLength={10}
                            value={form.accountNumber}
                            onChange={(e) =>
                              set(
                                "accountNumber",
                                e.target.value.replace(/\D/g, ""),
                              )
                            }
                            placeholder="0123456789"
                            error={errors.accountNumber}
                          />
                        </FormField>

                        {/* Summary */}
                        {form.firstName && (
                          <div
                            className="p-5 rounded-xl"
                            style={{
                              background: C.surfaceAlt,
                              border: `1px solid ${C.border}`,
                            }}
                          >
                            <p
                              className="text-xs font-bold uppercase tracking-wide mb-3"
                              style={{ color: C.textMuted }}
                            >
                              Review Before Submitting
                            </p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              {[
                                {
                                  label: "Name",
                                  value: `${form.firstName} ${form.lastName}`,
                                },
                                {
                                  label: "Department",
                                  value: form._deptName || "—",
                                },
                                { label: "Role", value: form._roleName || "—" },
                                {
                                  label: "Start Date",
                                  value: form.startDate || "—",
                                },
                                {
                                  label: "Gross Salary",
                                  value: grossSalary
                                    ? `₦${grossSalary.toLocaleString()}`
                                    : "—",
                                },
                                { label: "Bank", value: form.bankName || "—" },
                              ].map(({ label, value }) => (
                                <div key={label}>
                                  <p
                                    className="text-[10px]"
                                    style={{ color: C.textMuted }}
                                  >
                                    {label}
                                  </p>
                                  <p
                                    className="font-semibold"
                                    style={{ color: C.textPrimary }}
                                  >
                                    {value}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={3}
                className="flex items-center justify-between gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
                  style={{
                    background: C.surface,
                    color: currentStep === 1 ? C.textMuted : C.textSecondary,
                    border: `1px solid ${C.border}`,
                    cursor: currentStep === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  <ChevronLeft size={15} /> Back
                </motion.button>

                <div className="flex items-center gap-2">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full transition-all"
                      style={{
                        background:
                          i + 1 === currentStep
                            ? C.primary
                            : i + 1 < currentStep
                              ? C.success
                              : C.border,
                      }}
                    />
                  ))}
                </div>

                {currentStep < 4 ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold"
                    style={{
                      background: C.primary,
                      color: "#fff",
                      boxShadow: `0 4px 14px ${C.primary}44`,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Next Step <ChevronRight size={15} />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold"
                    style={{
                      background: C.success,
                      color: "#fff",
                      boxShadow: `0 4px 14px ${C.success}44`,
                      border: "none",
                      cursor: submitting ? "not-allowed" : "pointer",
                      opacity: submitting ? 0.8 : 1,
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Creating
                        Employee…
                      </>
                    ) : (
                      <>
                        <UserPlus size={15} /> Create Employee
                      </>
                    )}
                  </motion.button>
                )}
              </motion.div>
            </div>
          </main>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {successModal && createdEmployee && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4"
            >
              <div
                className="rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  className="p-6 text-center"
                  style={{
                    background: "linear-gradient(135deg,#D1FAE5,#ECFEFF)",
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ background: C.success }}
                  >
                    <CheckCircle2 size={32} color="#fff" />
                  </motion.div>
                  <h2
                    className="text-xl font-bold mb-1"
                    style={{
                      color: C.textPrimary,
                      fontFamily: "Sora,sans-serif",
                    }}
                  >
                    Employee Created! 🎉
                  </h2>
                  <p className="text-sm" style={{ color: C.textSecondary }}>
                    {createdEmployee.name} has been added to the system.
                  </p>
                </div>

                <div className="p-5 space-y-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: C.warningLight,
                      border: `1px solid ${C.warning}33`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Key size={13} color={C.warning} />
                      <p
                        className="text-xs font-bold uppercase tracking-wide"
                        style={{ color: C.warning }}
                      >
                        Employee Details
                      </p>
                    </div>
                    {[
                      {
                        label: "Employee Code",
                        value: createdEmployee.empId,
                        key: "id",
                      },
                      {
                        label: "Work Email",
                        value: createdEmployee.email,
                        key: "email",
                      },
                    ].map(({ label, value, key }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between mb-2 p-2.5 rounded-lg"
                        style={{ background: C.surface }}
                      >
                        <div>
                          <p
                            className="text-[10px]"
                            style={{ color: C.textMuted }}
                          >
                            {label}
                          </p>
                          <p
                            className="text-sm font-bold font-mono"
                            style={{ color: C.textPrimary }}
                          >
                            {value}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleCopy(value, key)}
                          className="p-1.5 rounded-lg"
                          style={{
                            background:
                              copied === key ? C.successLight : C.surfaceAlt,
                            color: copied === key ? C.success : C.textMuted,
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          {copied === key ? (
                            <Check size={12} />
                          ) : (
                            <Copy size={12} />
                          )}
                        </motion.button>
                      </div>
                    ))}
                    {form.sendInvite && (
                      <p
                        className="text-xs mt-2"
                        style={{ color: C.textSecondary }}
                      >
                        ✓ Login invite email will be sent to the employee.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p
                      className="text-xs font-bold uppercase tracking-wide"
                      style={{ color: C.textMuted }}
                    >
                      What happens next
                    </p>
                    {[
                      "Employee profile created on self-service portal",
                      form.sendInvite
                        ? "Welcome email sent with login credentials"
                        : "Login invite not sent (toggled off)",
                      "Onboarding checklist assigned automatically",
                      "Manager notified of new team member",
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: C.successLight }}
                        >
                          <Check size={10} color={C.success} />
                        </div>
                        <p
                          className="text-xs"
                          style={{ color: C.textSecondary }}
                        >
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSuccessModal(false);
                        navigate(
                          `/admin/employeemanagement/admin-viewemployeesprofile/${createdEmployee.id}`,
                        );
                      }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                      style={{
                        background: C.primary,
                        color: "#fff",
                        boxShadow: `0 4px 12px ${C.primary}44`,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      View Employee
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSuccessModal(false);
                        resetForm();
                      }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                      style={{
                        background: C.surfaceAlt,
                        color: C.textSecondary,
                        border: `1px solid ${C.border}`,
                        cursor: "pointer",
                      }}
                    >
                      Add Another
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
