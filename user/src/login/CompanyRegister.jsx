// ─────────────────────────────────────────────────────────────
//  src/pages/CompanyRegister.jsx
//  Route: /register  (company SaaS sign-up)
//  3 steps: Company Details → Admin Account → Review & Submit
//  Connects to: POST /auth/register-company
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import BantaHRLogo from "../styles/BantaHRLogo";
import {
  Building2,
  Globe,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Shield,
  Check,
  Sparkles,
  Users,
  BarChart3,
  Zap,
} from "lucide-react";
import C from "../styles/colors";
import { authApi } from "../api/service/authApi";

/* ─── Steps config ─── */
const STEPS = [
  { id: 1, label: "Company", icon: Building2 },
  { id: 2, label: "Account", icon: User },
  { id: 3, label: "Review", icon: Check },
];

/* ─── Framer variants (identical to Register.jsx) ─── */
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

/* ─── Password strength ─── */
const pwStrength = (pw) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};

/* ─── Slug generator ─── */
const toSlug = (name) =>
  name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 50);

/* ─── Particles (identical to Register.jsx) ─── */
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

/* ─── Shared Field (identical API to Register.jsx) ─── */
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

/* ─── Tiny checkmark icon ─── */
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
           <BantaHRLogo variant="dark" size="lg" />
      </div>

      {/* Hero copy */}
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
            Power Your <br />
            <span style={{ color: C.accent }}>HR Operations.</span>
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Set up your company workspace in minutes. Manage payroll,
            attendance, leave, and your entire workforce from one place.
          </p>
        </Motion.div>

        {/* Feature list */}
        <div className="mt-10 space-y-4">
          {[
            {
              icon: Users,
              label: "Team Management",
              desc: "Org charts, roles & departments",
            },
            {
              icon: BarChart3,
              label: "Payroll & Analytics",
              desc: "Real-time reports & processing",
            },
            {
              icon: Zap,
              label: "Fast Onboarding",
              desc: "Invite employees in seconds",
            },
            {
              icon: Shield,
              label: "Enterprise Security",
              desc: "Role-based access & audit logs",
            },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <Motion.div
                key={f.label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <Icon size={16} color="rgba(255,255,255,0.45)" />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "rgba(255,255,255,0.75)" }}
                  >
                    {f.label}
                  </p>
                  <p
                    className="text-[11px]"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    {f.desc}
                  </p>
                </div>
              </Motion.div>
            );
          })}
        </div>

        {/* Trust badge */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 p-4 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-start gap-2.5">
            <Sparkles size={14} color={C.accent} className="shrink-0 mt-0.5" />
            <p
              className="text-xs leading-relaxed"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Join{" "}
              <strong style={{ color: "rgba(255,255,255,0.75)" }}>
                hundreds of companies
              </strong>{" "}
              already managing their teams on BantaHR.
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

/* ════════════════════ COMPANY REGISTER PAGE ════════════════════ */
export default function CompanyRegister() {
  const [step, setStep] = useState(1);
  const [direction, setDir] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false); // track if user manually edited slug

  const [form, setForm] = useState({
    /* Step 1 — Company */
    companyName: "",
    companySlug: "",
    industry: "",
    companySize: "",

    /* Step 2 — HR Admin account */
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  /* Auto-generate slug from company name unless user has edited it */
  const handleCompanyName = (e) => {
    const name = e.target.value;
    set("companyName", name);
    if (!slugEdited) set("companySlug", toSlug(name));
  };

  const handleSlug = (e) => {
    setSlugEdited(true);
    set(
      "companySlug",
      e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 50),
    );
  };

  const str = pwStrength(form.password);
  const strLabel = ["", "Weak", "Fair", "Good", "Strong"][str];
  const strColor = [C.border, C.danger, C.warning, C.accent, C.success][str];

  /* ─── Validation ─── */
  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.companyName.trim()) e.companyName = "Company name is required";
      if (!form.companySlug.trim()) e.companySlug = "Slug is required";
      else if (!/^[a-z0-9-]+$/.test(form.companySlug))
        e.companySlug = "Only lowercase letters, numbers and hyphens";
      else if (form.companySlug.length < 2)
        e.companySlug = "Slug must be at least 2 characters";
    }
    if (s === 2) {
      if (!form.firstName.trim()) e.firstName = "First name is required";
      if (!form.lastName.trim()) e.lastName = "Last name is required";
      if (!form.email.trim()) e.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(form.email))
        e.email = "Enter a valid email";
      if (form.password.length < 8)
        e.password = "Password must be at least 8 characters";
      if (!/[A-Z]/.test(form.password))
        e.password = e.password ?? "Password must contain an uppercase letter";
      if (!/[0-9]/.test(form.password))
        e.password = e.password ?? "Password must contain a number";
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

  const handleSubmit = async () => {
    const e = validate(2); // re-validate step 2 fields as a safety net
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const data = await authApi.registerCompany({
        companyName: form.companyName,
        companySlug: form.companySlug,
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

  /* ─── Success screen ─── */
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
          <Motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-full max-w-sm text-center space-y-5"
          >
            <Motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto"
              style={{ background: "linear-gradient(135deg,#D1FAE5,#ECFEFF)" }}
            >
              <CheckCircle2 size={44} color={C.success} />
            </Motion.div>

            <div>
              <h2
                className="text-2xl font-bold mb-1"
                style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
              >
                Welcome to BantaHR! 🎉
              </h2>
              <p className="text-sm" style={{ color: C.textMuted }}>
                Your company workspace has been created. A verification email
                has been sent to{" "}
                <strong style={{ color: C.textPrimary }}>{form.email}</strong>.
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
                What's next
              </p>
              {[
                "Verify your email address",
                "Complete your company profile",
                "Invite your HR team members",
                "Start onboarding employees",
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
              href="/dashboard"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
                boxShadow: `0 4px 16px ${C.primary}44`,
                display: "flex",
              }}
            >
              Go to Dashboard <ArrowRight size={15} />
            </a>
          </Motion.div>
        </div>
      </div>
    );
  }

  /* ─── Step 1: Company Details ─── */
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
          Company Details
        </h2>
        <p className="text-sm" style={{ color: C.textMuted }}>
          Tell us about your organisation
        </p>
      </div>

      <Motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Field
          label="Company Name"
          required
          value={form.companyName}
          onChange={handleCompanyName}
          placeholder="e.g. Acme Corporation"
          error={errors.companyName}
          icon={Building2}
        />
      </Motion.div>

      <Motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Field
          label="Company Slug"
          required
          value={form.companySlug}
          onChange={handleSlug}
          placeholder="e.g. acme-corp"
          error={errors.companySlug}
          icon={Globe}
          hint={
            form.companySlug
              ? `Your workspace URL: bantahr.ng/${form.companySlug}`
              : "Auto-generated from company name"
          }
        />
      </Motion.div>

      <Motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <div>
          <label
            className="block text-xs font-semibold mb-1.5"
            style={{ color: C.textPrimary }}
          >
            Industry <span style={{ color: C.textMuted }}>(optional)</span>
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <BarChart3
                size={14}
                color={form.industry ? C.primary : C.textMuted}
              />
            </div>
            <select
              value={form.industry}
              onChange={(e) => set("industry", e.target.value)}
              className="w-full appearance-none rounded-2xl text-sm outline-none transition-all"
              style={{
                paddingLeft: "2.75rem",
                paddingRight: "1rem",
                paddingTop: "0.7rem",
                paddingBottom: "0.7rem",
                background: C.surfaceAlt,
                border: `1.5px solid ${form.industry ? C.primary + "55" : C.border}`,
                color: form.industry ? C.textPrimary : C.textMuted,
                boxShadow: form.industry
                  ? `0 0 0 3px ${C.primaryLight}`
                  : "none",
              }}
            >
              <option value="">Select industry...</option>
              {[
                "Technology",
                "Finance & Banking",
                "Healthcare",
                "Education",
                "Retail & E-commerce",
                "Manufacturing",
                "Media & Entertainment",
                "Logistics",
                "Real Estate",
                "Other",
              ].map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Motion.div>

      <Motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <div>
          <label
            className="block text-xs font-semibold mb-1.5"
            style={{ color: C.textPrimary }}
          >
            Company Size <span style={{ color: C.textMuted }}>(optional)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {["1–10", "11–50", "51–200", "201–500", "501–1000", "1000+"].map(
              (size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => set("companySize", size)}
                  className="py-2.5 rounded-2xl text-xs font-semibold transition-all"
                  style={{
                    background:
                      form.companySize === size ? C.primary : C.surfaceAlt,
                    color: form.companySize === size ? "#fff" : C.textSecondary,
                    border: `1.5px solid ${form.companySize === size ? C.primary : C.border}`,
                    boxShadow:
                      form.companySize === size
                        ? `0 0 0 3px ${C.primaryLight}`
                        : "none",
                  }}
                >
                  {size}
                </button>
              ),
            )}
          </div>
        </div>
      </Motion.div>
    </Motion.div>
  );

  /* ─── Step 2: Admin Account ─── */
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
          Your Account
        </h2>
        <p className="text-sm" style={{ color: C.textMuted }}>
          You'll be the HR Admin — the owner of your company workspace
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Field
            label="First Name"
            required
            value={form.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            placeholder="e.g. Ngozi"
            error={errors.firstName}
            icon={User}
          />
        </Motion.div>
        <Motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Field
            label="Last Name"
            required
            value={form.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            placeholder="e.g. Adeleke"
            error={errors.lastName}
            icon={User}
          />
        </Motion.div>
      </div>

      <Motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Field
          label="Work Email"
          required
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="you@yourcompany.com"
          error={errors.email}
          icon={Mail}
        />
      </Motion.div>

      <Motion.div
        custom={3}
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

      {/* Strength meter */}
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
        custom={4}
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
        custom={5}
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

      {/* Terms */}
      <Motion.div
        custom={6}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <label className="flex items-start gap-2.5 cursor-pointer">
          <div
            onClick={() => set("agreeTerms", !form.agreeTerms)}
            className="w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 transition-all"
            style={{
              background: form.agreeTerms ? C.primary : "transparent",
              border: `1.5px solid ${errors.agreeTerms ? C.danger : form.agreeTerms ? C.primary : C.border}`,
            }}
          >
            {form.agreeTerms && <CheckmarkIcon />}
          </div>
          <span className="text-xs" style={{ color: C.textSecondary }}>
            I agree to the{" "}
            <button
              type="button"
              className="font-semibold hover:underline"
              style={{ color: C.primary }}
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              className="font-semibold hover:underline"
              style={{ color: C.primary }}
            >
              Privacy Policy
            </button>
          </span>
        </label>
        {errors.agreeTerms && (
          <p
            className="text-[11px] mt-1 ml-6 font-medium flex items-center gap-1"
            style={{ color: C.danger }}
          >
            <AlertCircle size={10} />
            {errors.agreeTerms}
          </p>
        )}
      </Motion.div>
    </Motion.div>
  );

  /* ─── Step 3: Review & Submit ─── */
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
          Review & Submit
        </h2>
        <p className="text-sm" style={{ color: C.textMuted }}>
          Confirm your details before we create your workspace
        </p>
      </div>

      {/* Company summary */}
      <Motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-2xl p-4 space-y-3"
        style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between">
          <p
            className="text-xs font-bold uppercase tracking-wide"
            style={{ color: C.textMuted }}
          >
            Company
          </p>
          <button
            onClick={() => {
              setDir(-1);
              setStep(1);
            }}
            className="text-xs font-semibold hover:underline"
            style={{ color: C.primary }}
          >
            Edit
          </button>
        </div>
        <ReviewRow label="Company Name" value={form.companyName} />
        <ReviewRow
          label="Workspace URL"
          value={`Banta.ng/${form.companySlug}`}
        />
        {form.industry && <ReviewRow label="Industry" value={form.industry} />}
        {form.companySize && (
          <ReviewRow label="Company Size" value={form.companySize} />
        )}
      </Motion.div>

      {/* Account summary */}
      <Motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-2xl p-4 space-y-3"
        style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between">
          <p
            className="text-xs font-bold uppercase tracking-wide"
            style={{ color: C.textMuted }}
          >
            HR Admin Account
          </p>
          <button
            onClick={() => {
              setDir(-1);
              setStep(2);
            }}
            className="text-xs font-semibold hover:underline"
            style={{ color: C.primary }}
          >
            Edit
          </button>
        </div>
        <ReviewRow label="Name" value={`${form.firstName} ${form.lastName}`} />
        <ReviewRow label="Email" value={form.email} />
        <ReviewRow label="Password" value="••••••••" />
      </Motion.div>

      {/* Role info */}
      <Motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="rounded-2xl p-3.5 flex items-start gap-3"
        style={{ background: "#EEF2FF", border: `1px solid ${C.primary}33` }}
      >
        <Shield size={15} color={C.primary} className="shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed" style={{ color: C.primary }}>
          You'll be registered as the <strong>HR Admin</strong> — you can invite
          team members and manage your workspace after sign-up.
        </p>
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
      <LeftPanel />

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
            {/* Step indicator */}
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
                    Creating workspace...
                  </>
                ) : step < 3 ? (
                  <>
                    Continue <ArrowRight size={15} />
                  </>
                ) : (
                  <>
                    Create Workspace <ArrowRight size={15} />
                  </>
                )}
              </Motion.button>
            </div>

            {errors.general && (
              <p
                className="text-sm text-center font-medium mt-3"
                style={{ color: C.danger }}
              >
                {errors.general}
              </p>
            )}

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

/* ─── Review row helper ─── */
function ReviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: C.textMuted }}>
        {label}
      </span>
      <span className="text-xs font-semibold" style={{ color: C.textPrimary }}>
        {value}
      </span>
    </div>
  );
}
