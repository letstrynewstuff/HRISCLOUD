// ─────────────────────────────────────────────────────────────
//  src/login/Register.jsx
//  Route: /register
//  "Request Access" form — submitted to HR for approval.
//  Frontend only. No auth deps.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import BantaHRLogo from "../styles/BantaHRLogo";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Shield,
  ChevronDown,
  Upload,
  Calendar,
  Globe,
  MapPin,
  Sparkles,
  FileText,
  UserPlus,
  X,
} from "lucide-react";
import { authApi } from "../api/service/authApi";
import C from "../styles/colors";

/* ─── Design tokens — exact match with Login.jsx ─── */
// const C = {
//   navy: "#1E1B4B",
//   navyMid: "#2D2A6E",
//   navyLight: "#3D3A8E",
//   navyGlow: "rgba(79,70,229,0.35)",
//   primary: "#4F46E5",
//   primaryLight: "#EEF2FF",
//   accent: "#06B6D4",
//   accentGlow: "rgba(6,182,212,0.3)",
//   surface: "#FFFFFF",
//   surfaceAlt: "#F7F8FC",
//   border: "#E4E7F0",
//   borderFocus: "#4F46E5",
//   success: "#10B981",
//   successLight: "#D1FAE5",
//   danger: "#EF4444",
//   dangerLight: "#FEE2E2",
//   warning: "#F59E0B",
//   warningLight: "#FEF3C7",
//   purple: "#8B5CF6",
//   textPrimary: "#0F172A",
//   textSecondary: "#64748B",
//   textMuted: "#94A3B8",
// };

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
    "QA Engineer",
    "Engineering Manager",
  ],
  Product: [
    "Product Manager",
    "UX Designer",
    "UX Researcher",
    "Senior Product Designer",
  ],
  Finance: ["Financial Analyst", "Finance Manager", "Accountant"],
  HR: ["HR Officer", "HR Generalist", "Talent Acquisition", "HR Manager"],
  Operations: ["Operations Manager", "Business Analyst", "Project Manager"],
  Sales: ["Sales Executive", "Account Manager", "Head of Sales"],
  Marketing: ["Content Strategist", "Digital Marketer", "Marketing Lead"],
  Legal: ["Legal Counsel", "Contract Manager", "Compliance Officer"],
};
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Intern"];
const LOCATIONS = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Kano",
  "Ibadan",
  "Remote",
];

/* ─── Steps ─── */
const STEPS = [
  { id: 1, label: "Personal", icon: User },
  { id: 2, label: "Employment", icon: Briefcase },
  { id: 3, label: "Security", icon: Lock },
];

/* ─── Framer variants ─── */
const slideIn = {
  hidden: (dir) => ({ opacity: 0, x: dir * 40 }),
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir) => ({ opacity: 0, x: dir * -40, transition: { duration: 0.22 } }),
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Particles (left panel) ─── */
function Particles() {
  const [dots] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 1,
      dur: Math.random() * 6 + 5,
      delay: Math.random() * 4,
    })),
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((d) => (
        <Motion.div
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            background: "rgba(255,255,255,0.18)",
          }}
          animate={{ y: [0, -14, 0], opacity: [0.12, 0.4, 0.12] }}
          transition={{
            duration: d.dur,
            delay: d.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Shared Field ─── */
function Field({
  label,
  required,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  rightEl,
  hint,
  children,
}) {
  return (
    <div>
      <label
        className="block text-xs font-semibold mb-1.5"
        style={{ color: C.textPrimary }}
      >
        {label}
        {required && <span style={{ color: C.danger }}> *</span>}
      </label>
      {children ? (
        children
      ) : (
        <div className="relative">
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon size={14} color={value ? C.primary : C.textMuted} />
            </div>
          )}
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full rounded-2xl text-sm outline-none transition-all"
            style={{
              paddingLeft: Icon ? "2.75rem" : "1rem",
              paddingRight: rightEl ? "3rem" : "1rem",
              paddingTop: "0.7rem",
              paddingBottom: "0.7rem",
              background: C.surfaceAlt,
              border: `1.5px solid ${error ? C.danger : value ? C.primary + "55" : C.border}`,
              color: C.textPrimary,
              boxShadow:
                value && !error
                  ? `0 0 0 3px ${C.primaryLight}`
                  : error
                    ? `0 0 0 3px ${C.dangerLight}`
                    : "none",
            }}
          />
          {rightEl && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {rightEl}
            </div>
          )}
        </div>
      )}
      {hint && !error && (
        <p className="text-[11px] mt-1" style={{ color: C.textMuted }}>
          {hint}
        </p>
      )}
      <AnimatePresence>
        {error && (
          <Motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1 text-[11px] mt-1.5 font-medium"
            style={{ color: C.danger }}
          >
            <AlertCircle size={10} />
            {error}
          </Motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function SelectField({
  label,
  required,
  value,
  onChange,
  error,
  icon: Icon,
  children,
  placeholder,
}) {
  return (
    <div>
      <label
        className="block text-xs font-semibold mb-1.5"
        style={{ color: C.textPrimary }}
      >
        {label}
        {required && <span style={{ color: C.danger }}> *</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon size={14} color={value ? C.primary : C.textMuted} />
          </div>
        )}
        <select
          value={value}
          onChange={onChange}
          className="w-full appearance-none rounded-2xl text-sm outline-none transition-all"
          style={{
            paddingLeft: Icon ? "2.75rem" : "1rem",
            paddingRight: "2.5rem",
            paddingTop: "0.7rem",
            paddingBottom: "0.7rem",
            background: C.surfaceAlt,
            border: `1.5px solid ${error ? C.danger : value ? C.primary + "55" : C.border}`,
            color: value ? C.textPrimary : C.textMuted,
            boxShadow: value && !error ? `0 0 0 3px ${C.primaryLight}` : "none",
          }}
        >
          <option value="">{placeholder || "Select..."}</option>
          {children}
        </select>
        <ChevronDown
          size={13}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          color={C.textMuted}
        />
      </div>
      <AnimatePresence>
        {error && (
          <Motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1 text-[11px] mt-1.5 font-medium"
            style={{ color: C.danger }}
          >
            <AlertCircle size={10} />
            {error}
          </Motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Password strength ─── */
const pwStrength = (pw) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};

/* ─── Left panel ─── */
function LeftPanel() {
  return (
    <div
      className="hidden lg:flex flex-col relative overflow-hidden"
      style={{
        width: 420,
        minWidth: 420,
        background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 60%, ${C.navyLight} 100%)`,
      }}
    >
      <Particles />
      <div
        className="absolute"
        style={{
          top: -80,
          right: -80,
          width: 300,
          height: 300,
          background: `radial-gradient(circle, ${C.primary}44, transparent 70%)`,
          borderRadius: "50%",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: -60,
          left: -60,
          width: 260,
          height: 260,
          background: `radial-gradient(circle, ${C.accent}33, transparent 70%)`,
          borderRadius: "50%",
        }}
      />

      {/* Logo */}
      <div className="relative z-10 px-10 pt-10">
        <BantaHRLogo variant="light" size="lg" />
      </div>

      {/* Main copy */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-10">
        <Motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          <p
            className="text-4xl font-bold leading-tight mb-3 text-white"
            style={{ fontFamily: "Sora, sans-serif" }}
          >
            Join Your
            <br />
            <span style={{ color: C.accent }}>Team Today.</span>
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Request access to the employee portal. Your HR team will review and
            activate your account within 24 hours.
          </p>
        </Motion.div>

        {/* Step progress visual */}
        <div className="mt-10 space-y-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Motion.div
                key={s.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    boxShadow: "none",
                    border: `1px solid rgba(255,255,255,0.12)`,
                  }}
                >
                  <Icon size={16} color="rgba(255,255,255,0.35)" />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: "rgba(255,255,255,0.35)",
                    }}
                  >
                    {s.label}
                  </p>
                  <p
                    className="text-[11px]"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    {s.id === 1
                      ? "Name, email & contact info"
                      : s.id === 2
                        ? "Department, role & start date"
                        : "Password & terms"}
                  </p>
                </div>
              </Motion.div>
            );
          })}
        </div>

        {/* Notice */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 p-4 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-start gap-2.5">
            <Shield size={14} color={C.accent} className="shrink-0 mt-0.5" />
            <p
              className="text-xs leading-relaxed"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Your request will be reviewed by HR within{" "}
              <strong style={{ color: "rgba(255,255,255,0.75)" }}>
                24 hours
              </strong>
              . You'll receive login credentials via email once approved.
            </p>
          </div>
        </Motion.div>
      </div>

      <div className="relative z-10 px-10 pb-8">
        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
          © 2025 BantaHR. All rights reserved.
        </p>
      </div>
    </div>
  );
}

/* ════════════════════ REGISTER PAGE ════════════════════ */
export default function Register() {
  const [step, setStep] = useState(1);
  const [direction, setDir] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);

  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);

  const [form, setForm] = useState({
    /* Step 1 — Personal */
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    location: "",
    photo: null,

    /* Step 2 — Employment */
    department: "",
    role: "",
    employmentType: "",
    startDate: "",
    staffId: "",
    managerEmail: "",

    /* Step 3 — Security */
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    agreePrivacy: false,
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const str = pwStrength(form.password);
  const strLabel = ["", "Weak", "Fair", "Good", "Strong"][str];
  const strColor = [C.border, C.danger, C.warning, C.accent, C.success][str];

  /* ─── Validation per step ─── */
  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.firstName.trim()) e.firstName = "First name is required";
      if (!form.lastName.trim()) e.lastName = "Last name is required";
      if (!form.email.trim()) e.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(form.email))
        e.email = "Enter a valid email";
      if (!form.phone.trim()) e.phone = "Phone number is required";
      if (!form.gender) e.gender = "Select your gender";
    }
    if (s === 2) {
      if (!form.department) e.department = "Select a department";
      if (!form.role) e.role = "Select your role";
      if (!form.employmentType) e.employmentType = "Select employment type";
      if (!form.startDate) e.startDate = "Expected start date is required";
    }
    if (s === 3) {
      if (form.password.length < 8)
        e.password = "Password must be at least 8 characters";
      if (form.password !== form.confirmPassword)
        e.confirmPassword = "Passwords do not match";
      if (!form.agreeTerms) e.agreeTerms = "You must accept the terms";
    }
    return e;
  };

  const goNext = () => {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length) return;
    setDir(1);
    setStep((p) => p + 1);
  };

  const goBack = () => {
    setDir(-1);
    setStep((p) => p - 1);
    setErrors({});
  };

  //   const handleSubmit = async () => {
  //     const e = validate(3);
  //     setErrors(e);
  //     if (Object.keys(e).length) return;
  //     setLoading(true);
  //     await new Promise((r) => setTimeout(r, 2200));
  //     setLoading(false);
  //     setSubmitted(true);
  //   };
  const handleSubmit = async () => {
    const e = validate(3);
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const data = await authApi.registerCompany({
        companyName: form.company,
        companySlug: form.company
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setSubmitted(true);
    } catch (err) {
      setErrors({
        general: err.message ?? "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ─── Photo upload ─── */
  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    set("photo", file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  /* ─── Submitted success screen ─── */
  if (submitted) {
    return (
      <div
        className="min-h-screen flex"
        style={{ fontFamily: "Sora, sans-serif" }}
      >
        <LeftPanel />
        <div
          className="flex-1 flex items-center justify-center p-8"
          style={{ background: C.surface }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-full max-w-sm text-center space-y-5"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto"
              style={{ background: "linear-gradient(135deg,#D1FAE5,#ECFEFF)" }}
            >
              <CheckCircle2 size={44} color={C.success} />
            </motion.div>
            <div>
              <h2
                className="text-2xl font-bold mb-1"
                style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
              >
                Request Submitted! 🎉
              </h2>
              <p className="text-sm" style={{ color: C.textMuted }}>
                Your access request has been sent to HR. You'll receive your
                login credentials at{" "}
                <strong style={{ color: C.textPrimary }}>{form.email}</strong>{" "}
                once approved.
              </p>
            </div>

            <div
              className="rounded-2xl p-4 text-left space-y-2"
              style={{
                background: C.surfaceAlt,
                border: `1px solid ${C.border}`,
              }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wide mb-2"
                style={{ color: C.textMuted }}
              >
                What happens next
              </p>
              {[
                "HR reviews your request (within 24 hours)",
                "Your employee profile is created",
                "Login credentials sent to your email",
                "You gain access to the employee portal",
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: C.successLight }}
                  >
                    <CheckmarkIcon />
                  </div>
                  <p className="text-xs" style={{ color: C.textSecondary }}>
                    {s}
                  </p>
                </div>
              ))}
            </div>

            <a
              href="/login"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
                boxShadow: `0 4px 16px ${C.primary}44`,
                display: "flex",
              }}
            >
              Back to Login <ArrowRight size={15} />
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ─── Step 1: Personal Info ─── */
  const renderStep1 = () => (
    <Motion.div
      key="s1"
      custom={direction}
      variants={slideIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-4"
    >
      <div className="mb-5">
        <h2
          className="text-2xl font-bold mb-1"
          style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
        >
          Personal Information
        </h2>
        <p className="text-sm" style={{ color: C.textMuted }}>
          Tell us a bit about yourself
        </p>
      </div>

      {/* Photo upload */}
      <Motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="flex items-center gap-4"
      >
        <div className="relative">
          <div
            className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{
              background: photoPreview ? "transparent" : C.surfaceAlt,
              border: `2px dashed ${C.border}`,
            }}
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={24} color={C.textMuted} />
            )}
          </div>
          <label
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
            style={{
              background: C.primary,
              boxShadow: `0 2px 8px ${C.primary}55`,
            }}
          >
            <Upload size={11} color="#fff" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhoto}
            />
          </label>
        </div>
        <div>
          <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>
            Profile Photo
          </p>
          <p className="text-[11px]" style={{ color: C.textMuted }}>
            Optional · JPG, PNG up to 2MB
          </p>
        </div>
      </Motion.div>

      <div className="grid grid-cols-2 gap-3">
        <Motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Field
            label="First Name"
            required
            value={form.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            placeholder="John"
            error={errors.firstName}
            icon={User}
          />
        </Motion.div>
        <Motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Field
            label="Last Name"
            required
            value={form.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            placeholder="Doe"
            error={errors.lastName}
          />
        </Motion.div>
      </div>

      <Motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Field
          label="Middle Name"
          value={form.middleName}
          onChange={(e) => set("middleName", e.target.value)}
          placeholder="Optional"
          hint="As it appears on your ID"
        />
      </Motion.div>

      <Motion.div
        custom={4}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Field
          label="Work / Personal Email"
          required
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="yourname@email.com"
          error={errors.email}
          icon={Mail}
          hint="HR will send your login credentials here"
        />
      </Motion.div>

      <div className="grid grid-cols-2 gap-3">
        <Motion.div
          custom={5}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Field
            label="Phone Number"
            required
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+234 801 234 5678"
            error={errors.phone}
            icon={Phone}
          />
        </Motion.div>
        <Motion.div
          custom={6}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Field
            label="Date of Birth"
            type="date"
            value={form.dob}
            onChange={(e) => set("dob", e.target.value)}
            icon={Calendar}
          />
        </Motion.div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Motion.div
          custom={7}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <SelectField
            label="Gender"
            required
            value={form.gender}
            onChange={(e) => set("gender", e.target.value)}
            error={errors.gender}
            icon={User}
            placeholder="Select gender"
          >
            {["Male", "Female", "Prefer not to say"].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </SelectField>
        </Motion.div>
        <Motion.div
          custom={8}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <SelectField
            label="Location"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            icon={MapPin}
            placeholder="Office location"
          >
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </SelectField>
        </Motion.div>
      </div>
    </Motion.div>
  );

  /* ─── Step 2: Employment ─── */
  const renderStep2 = () => (
    <Motion.div
      key="s2"
      custom={direction}
      variants={slideIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-4"
    >
      <div className="mb-5">
        <h2
          className="text-2xl font-bold mb-1"
          style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
        >
          Employment Details
        </h2>
        <p className="text-sm" style={{ color: C.textMuted }}>
          Tell us about your role at the company
        </p>
      </div>

      <Motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <SelectField
          label="Department"
          required
          value={form.department}
          onChange={(e) => {
            set("department", e.target.value);
            set("role", "");
          }}
          error={errors.department}
          icon={Building2}
          placeholder="Select department"
        >
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </SelectField>
      </Motion.div>

      <Motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <SelectField
          label="Role / Job Title"
          required
          value={form.role}
          onChange={(e) => set("role", e.target.value)}
          error={errors.role}
          icon={Briefcase}
          placeholder={
            form.department ? "Select your role" : "Select department first"
          }
        >
          {(ROLES_BY_DEPT[form.department] || []).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </SelectField>
      </Motion.div>

      <Motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <SelectField
          label="Employment Type"
          required
          value={form.employmentType}
          onChange={(e) => set("employmentType", e.target.value)}
          error={errors.employmentType}
          icon={FileText}
          placeholder="Select type"
        >
          {EMPLOYMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </SelectField>
      </Motion.div>

      <Motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Field
          label="Expected Start Date"
          required
          type="date"
          value={form.startDate}
          onChange={(e) => set("startDate", e.target.value)}
          error={errors.startDate}
          icon={Calendar}
        />
      </Motion.div>

      <Motion.div
        custom={4}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Field
          label="Staff / Employee ID"
          value={form.staffId}
          onChange={(e) => set("staffId", e.target.value)}
          placeholder="e.g. EMP-2025-001 (if already assigned)"
          hint="Leave blank if not yet assigned"
        />
      </Motion.div>

      <Motion.div
        custom={5}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Field
          label="Manager's Email"
          type="email"
          value={form.managerEmail}
          onChange={(e) => set("managerEmail", e.target.value)}
          placeholder="manager@bantahr.ng"
          icon={Mail}
          hint="Your direct line manager — helps HR route your request"
        />
      </Motion.div>

      {/* Info box */}
      <Motion.div
        custom={6}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-2xl p-3.5 flex items-start gap-2.5"
        style={{
          background: C.primaryLight,
          border: `1px solid ${C.primary}22`,
        }}
      >
        <AlertCircle size={14} color={C.primary} className="shrink-0 mt-0.5" />
        <p
          className="text-xs leading-relaxed"
          style={{ color: C.textSecondary }}
        >
          Your employment details will be verified with HR. Providing accurate
          information speeds up your approval.
        </p>
      </Motion.div>
    </Motion.div>
  );

  /* ─── Step 3: Security ─── */
  const renderStep3 = () => (
    <Motion.div
      key="s3"
      custom={direction}
      variants={slideIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-4"
    >
      <div className="mb-5">
        <h2
          className="text-2xl font-bold mb-1"
          style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
        >
          Secure Your Account
        </h2>
        <p className="text-sm" style={{ color: C.textMuted }}>
          Set a strong password to protect your account
        </p>
      </div>

      <Motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Field
          label="Password"
          required
          type={showPw ? "text" : "password"}
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          placeholder="Minimum 8 characters"
          error={errors.password}
          icon={Lock}
          rightEl={
            <button onClick={() => setShowPw((p) => !p)} className="p-1">
              {showPw ? (
                <EyeOff size={14} color={C.textMuted} />
              ) : (
                <Eye size={14} color={C.textMuted} />
              )}
            </button>
          }
        />
      </Motion.div>

      {/* Strength */}
      {form.password && (
        <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex gap-1.5 mb-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-1 h-1.5 rounded-full transition-all duration-300"
                style={{ background: i <= str ? strColor : C.border }}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold" style={{ color: strColor }}>
              {strLabel}
            </span>
            <span style={{ color: C.textMuted }}>
              Use uppercase, number & symbol
            </span>
          </div>
        </Motion.div>
      )}

      <Motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Field
          label="Confirm Password"
          required
          type={showCPw ? "text" : "password"}
          value={form.confirmPassword}
          onChange={(e) => set("confirmPassword", e.target.value)}
          placeholder="Repeat your password"
          error={errors.confirmPassword}
          icon={Lock}
          rightEl={
            <button onClick={() => setShowCPw((p) => !p)} className="p-1">
              {showCPw ? (
                <EyeOff size={14} color={C.textMuted} />
              ) : (
                <Eye size={14} color={C.textMuted} />
              )}
            </button>
          }
        />
      </Motion.div>

      {/* Password rules */}
      <Motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-2xl p-3.5 space-y-1.5"
        style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}
      >
        {[
          { rule: "At least 8 characters", pass: form.password.length >= 8 },
          { rule: "One uppercase letter", pass: /[A-Z]/.test(form.password) },
          { rule: "One number", pass: /[0-9]/.test(form.password) },
          {
            rule: "One special character",
            pass: /[^A-Za-z0-9]/.test(form.password),
          },
          {
            rule: "Passwords match",
            pass: form.password && form.password === form.confirmPassword,
          },
        ].map((r) => (
          <div key={r.rule} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center"
              style={{
                background: r.pass ? C.successLight : C.surfaceAlt,
                border: `1px solid ${r.pass ? C.success : C.border}`,
              }}
            >
              {r.pass && <CheckmarkIcon />}
            </div>
            <span
              className="text-[11px]"
              style={{ color: r.pass ? C.success : C.textMuted }}
            >
              {r.rule}
            </span>
          </div>
        ))}
      </Motion.div>

      {/* Terms & Privacy */}
      <Motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="space-y-2.5"
      >
        {[
          {
            key: "agreeTerms",
            label: "I agree to the ",
            link: "Terms of Service",
            err: errors.agreeTerms,
          },
          {
            key: "agreePrivacy",
            label: "I have read and accept the ",
            link: "Privacy Policy",
          },
        ].map((t) => (
          <div key={t.key}>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <div
                onClick={() => set(t.key, !form[t.key])}
                className="w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 transition-all"
                style={{
                  background: form[t.key] ? C.primary : "transparent",
                  border: `1.5px solid ${t.err ? C.danger : form[t.key] ? C.primary : C.border}`,
                }}
              >
                {form[t.key] && <CheckmarkIcon />}
              </div>
              <span className="text-xs" style={{ color: C.textSecondary }}>
                {t.label}
                <button
                  type="button"
                  className="font-semibold hover:underline"
                  style={{ color: C.primary }}
                >
                  {t.link}
                </button>
              </span>
            </label>
            {t.err && (
              <p
                className="text-[11px] mt-1 ml-6 font-medium flex items-center gap-1"
                style={{ color: C.danger }}
              >
                <AlertCircle size={10} />
                {t.err}
              </p>
            )}
          </div>
        ))}
      </Motion.div>
    </Motion.div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "Sora, sans-serif" }}
    >
      {/* <LeftPanel /> */}

      {/* Right panel */}
      <div
        className="flex-1 flex flex-col overflow-y-auto"
        style={{ background: C.surface }}
      >
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)" }}
            >
              <Shield size={15} color="#fff" />
            </div>
            <span
              className="font-bold text-lg"
              style={{ color: C.textPrimary }}
            >
              BantaHR
            </span>
          </div>

          <div className="w-full max-w-md">
            {/* Top step dots (mobile progress) */}
            <div className="flex items-center gap-2 mb-6">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 flex-1">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300"
                    style={{
                      background:
                        step > s.id
                          ? C.success
                          : step === s.id
                            ? C.primary
                            : C.surfaceAlt,
                      color: step >= s.id ? "#fff" : C.textMuted,
                      border: `2px solid ${step > s.id ? C.success : step === s.id ? C.primary : C.border}`,
                    }}
                  >
                    {step > s.id ? <CheckmarkIcon /> : s.id}
                  </div>
                  <span
                    className="text-xs font-semibold hidden sm:block"
                    style={{
                      color:
                        step === s.id
                          ? C.primary
                          : step > s.id
                            ? C.success
                            : C.textMuted,
                    }}
                  >
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div
                      className="flex-1 h-0.5 rounded-full"
                      style={{ background: step > s.id ? C.success : C.border }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait" custom={direction}>
              {renderCurrentStep()}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center gap-3 mt-6">
              {step > 1 && (
                <Motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={goBack}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold"
                  style={{
                    background: C.surfaceAlt,
                    color: C.textSecondary,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <ArrowLeft size={14} />
                  Back
                </Motion.button>
              )}
              <Motion.button
                whileHover={{
                  scale: 1.01,
                  boxShadow: `0 8px 24px ${C.primary}55`,
                }}
                whileTap={{ scale: 0.98 }}
                onClick={step < 3 ? goNext : handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white transition-all"
                style={{
                  background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
                  boxShadow: `0 4px 16px ${C.primary}44`,
                  opacity: loading ? 0.8 : 1,
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    Submitting...
                  </>
                ) : step < 3 ? (
                  <>
                    Continue <ArrowRight size={15} />
                  </>
                ) : (
                  <>
                    Submit Request <ArrowRight size={15} />
                  </>
                )}
              </Motion.button>
            </div>

            <p
              className="text-center text-sm mt-4"
              style={{ color: C.textSecondary }}
            >
              Already have an account?{" "}
              <a
                href="/login"
                className="font-bold hover:underline"
                style={{ color: C.primary }}
              >
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Tiny inline check icon ─── */
function CheckmarkIcon() {
  return (
    <svg
      width={10}
      height={10}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ─── Missing icon imports used ─── */
// function Phone(props) {
//   return (
//     <svg
//       width={props.size}
//       height={props.size}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke={props.color}
//       strokeWidth={2}
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 4.18 2 2 0 015 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
//     </svg>
//   );
// }
