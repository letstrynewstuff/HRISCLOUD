// ─────────────────────────────────────────────────────────────
//  src/login/Login.jsx
//  Handles: Login · Forgot Password · Reset Password (OTP)
//  Single file, zero external auth deps — frontend only
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import BantaHRLogo from "../styles/BantaHRLogo";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Shield,
  Smartphone,
  KeyRound,
  Sparkles,
  ChevronRight,
  X,
} from "lucide-react";
import { authApi } from "../api/service/authApi";
import C from "../styles/colors";
import { useNavigate } from "react-router-dom";

/* ─── Framer variants ─── */
const panelIn = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, x: -32, transition: { duration: 0.25 } },
};

/* ─── Particle dot component ─── */
function Particles() {
  const [dots] = useState(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
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
          animate={{ y: [0, -18, 0], opacity: [0.15, 0.45, 0.15] }}
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

/* ─── Input field ─── */
function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  rightEl,
  autoFocus,
}) {
  return (
    <div>
      <label
        className="block text-xs font-semibold mb-1.5"
        style={{ color: C.textPrimary }}
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon size={15} color={value ? C.primary : C.textMuted} />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full rounded-2xl text-sm outline-none transition-all"
          style={{
            paddingLeft: Icon ? "2.75rem" : "1rem",
            paddingRight: rightEl ? "3rem" : "1rem",
            paddingTop: "0.75rem",
            paddingBottom: "0.75rem",
            background: C.surfaceAlt,
            border: `1.5px solid ${error ? C.danger : value ? C.primary + "66" : C.border}`,
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

/* ─── OTP digit input ─── */
function OtpInput({ value, onChange }) {
  const inputs = useRef([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      const next = value.slice(0, i) + value.slice(i + 1);
      onChange(next);
      if (i > 0) inputs.current[i - 1]?.focus();
    } else if (/^\d$/.test(e.key)) {
      const next = value.slice(0, i) + e.key + value.slice(i + 1);
      onChange(next.slice(0, 6));
      if (i < 5) inputs.current[i + 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) inputs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const txt = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(txt);
    inputs.current[Math.min(txt.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={() => {}}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="w-12 h-14 text-center text-xl font-bold rounded-2xl outline-none transition-all"
          style={{
            background: d ? C.primaryLight : C.surfaceAlt,
            border: `2px solid ${d ? C.primary : C.border}`,
            color: C.primary,
            boxShadow: d ? `0 0 0 3px ${C.primaryLight}` : "none",
            fontFamily: "Sora, sans-serif",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Role badge shown after login ─── */

const ROLE_CONFIG = {
  hr_admin: {
    label: "HR Admin",
    bg: C.primary,
    desc: "Redirecting to Admin Dashboard...",
  },
  admin: {
    label: "Admin",
    bg: C.primary,
    desc: "Redirecting to Admin Dashboard...",
  },
  hr: {
    label: "HR",
    bg: "#8B5CF6",
    desc: "Redirecting to HR Dashboard...",
  },
  employee: {
    label: "Employee",
    bg: C.success,
    desc: "Redirecting to Employee Portal...",
  },
};
/* ─── Left panel visuals ─── */
const LeftPanel = () => (
  <div
    className="hidden lg:flex flex-col relative overflow-hidden"
    style={{
      width: 440,
      minWidth: 440,
      background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 60%, ${C.navyLight} 100%)`,
    }}
  >
    <Particles />

    {/* Glowing orbs */}
    <div
      className="absolute"
      style={{
        top: -80,
        left: -80,
        width: 320,
        height: 320,
        background: `radial-gradient(circle, ${C.primary}55 0%, transparent 70%)`,
        borderRadius: "50%",
      }}
    />
    <div
      className="absolute"
      style={{
        bottom: -60,
        right: -60,
        width: 280,
        height: 280,
        background: `radial-gradient(circle, ${C.accent}44 0%, transparent 70%)`,
        borderRadius: "50%",
      }}
    />

    {/* Logo */}
   
    <BantaHRLogo variant="light" size="lg" />

    {/* Hero text */}
    <div className="relative z-10 flex-1 flex flex-col justify-center px-10">
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
      >
        <p
          className="text-4xl font-bold leading-tight mb-4 text-white"
          style={{ fontFamily: "Sora, sans-serif" }}
        >
          Your People,
          <br />
          <span style={{ color: C.accent }}>Your Platform.</span>
        </p>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          A single intelligent workspace for HR teams and employees — manage
          payroll, attendance, leaves, announcements, and more.
        </p>
      </Motion.div>

      {/* Feature chips */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 space-y-3"
      >
        {[
          { icon: "⚡", label: "Real-time Payroll Processing" },
          { icon: "📊", label: "Advanced HR Analytics" },
          { icon: "🔔", label: "Smart Announcements Engine" },
          { icon: "🌳", label: "Interactive Org Chart" },
        ].map((f, i) => (
          <Motion.div
            key={f.label}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 + i * 0.08 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span className="text-base">{f.icon}</span>
            <span
              className="text-sm font-medium"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              {f.label}
            </span>
          </Motion.div>
        ))}
      </Motion.div>
    </div>
  </div>
);

/* ════════════════════ LOGIN PAGE ════════════════════ */
export default function LoginPage() {
  /* view: "login" | "forgot" | "otp" | "reset" | "success" */
  const [view, setView] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(null);

  /* Forgot / OTP / Reset state */
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(60);
  const [otpRunning, setOtpRunning] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwErrors, setPwErrors] = useState({});
  const navigate = useNavigate();

  /* OTP countdown */
  useEffect(() => {
    if (!otpRunning) return;
    if (otpTimer <= 0) {
      setTimeout(() => setOtpRunning(false), 0);
      return;
    }
    const t = setTimeout(() => setOtpTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [otpRunning, otpTimer]);

  useEffect(() => {
    if (!loggedIn) return;

    const timer = setTimeout(() => {
      if (loggedIn.role === "hr_admin") {
        window.location.href = "/admin/dashboard";
      } else if (loggedIn.role === "employee") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/";
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [loggedIn]);

  /* ─── Login ─── */
  const handleLogin = async () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setLoggedIn({
        role: data.user.role, // "hr_admin" etc.
        name: `${data.user.firstName} ${data.user.lastName}`,
        initials: `${data.user.firstName[0]}${data.user.lastName[0]}`,
        email: data.user.email,
      });
    } catch (err) {
      setErrors({ general: err.message ?? "Invalid email or password." });
    } finally {
      setLoading(false);
    }
  };
  /* ─── Send OTP ─── */

  const handleSendOtp = async () => {
    if (!forgotEmail.trim() || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setErrors({ forgotEmail: "Enter a valid email address" });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await authApi.forgotPassword(forgotEmail);
      setOtpTimer(60);
      setOtpRunning(true);
      setView("otp");
    } catch (err) {
      setErrors({ forgotEmail: err.message });
    } finally {
      setLoading(false);
    }
  };
  /* ─── Verify OTP ─── */
  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      setErrors({ otp: "Enter all 6 digits" });
      return;
    }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    /* Mock: accept any 6-digit OTP */
    setView("reset");
  };

  /* ─── Reset password ─── */
  const pwStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const strength = pwStrength(newPw);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = [C.border, C.danger, C.warning, C.accent, C.success][
    strength
  ];

  //   const handleResetPw = async () => {
  //     const e = {};
  //     if (newPw.length < 8) e.newPw = "Password must be at least 8 characters";
  //     if (newPw !== confirmPw) e.confirmPw = "Passwords do not match";
  //     setPwErrors(e);
  //     if (Object.keys(e).length) return;
  //     setLoading(true);
  //     await new Promise((r) => setTimeout(r, 1600));
  //     setLoading(false);
  //     setView("success");
  //   };
  const handleResetPw = async () => {
    const e = {};
    if (newPw.length < 8) e.newPw = "Password must be at least 8 characters";
    if (newPw !== confirmPw) e.confirmPw = "Passwords do not match";
    setPwErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      // `otp` holds the reset token from the email link
      await authApi.resetPassword(otp, newPw);
      setView("success");
    } catch (err) {
      setPwErrors({ newPw: err.message });
    } finally {
      setLoading(false);
    }
  };

  /* ─── Post-login success overlay ─── */
  if (loggedIn) {
    const rc = ROLE_CONFIG[loggedIn.role] || ROLE_CONFIG.employee;
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`,
          fontFamily: "Sora, sans-serif",
        }}
      >
        <Particles />
        <Motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative z-10 text-center px-8 py-12 rounded-3xl"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(12px)",
            minWidth: 360,
          }}
        >
          <Motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 text-3xl font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${rc.bg}, ${rc.bg}bb)`,
              boxShadow: `0 8px 32px ${rc.bg}66`,
            }}
          >
            {loggedIn.initials}
          </Motion.div>
          <p className="text-2xl font-bold text-white mb-1">Welcome back!</p>
          <p className="text-white/70 mb-4">{loggedIn.name}</p>
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5"
            style={{
              background: `${rc.bg}33`,
              color: rc.bg === C.primary ? C.accent : "#fff",
              border: `1px solid ${rc.bg}55`,
            }}
          >
            {rc.label} Account
          </span>
          <p className="text-white/50 text-sm flex items-center justify-center gap-2">
            <RefreshCw size={13} className="animate-spin" />
            {rc.desc}
          </p>
        </Motion.div>
      </div>
    );
  }

  /* ─── Right panel: Login form ─── */
  const renderLogin = () => (
    <Motion.div
      key="login"
      variants={panelIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-4"
    >
      <div className="mb-6">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
        >
          Welcome back
        </h1>
        <p className="text-sm" style={{ color: C.textMuted }}>
          Sign in to your BantaHR account
        </p>
      </div>

      {/* General error */}
      <AnimatePresence>
        {errors.general && (
          <Motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2.5 p-3.5 rounded-2xl text-sm"
            style={{
              background: C.dangerLight,
              border: `1px solid ${C.danger}33`,
              color: C.danger,
            }}
          >
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{errors.general}</span>
          </Motion.div>
        )}
      </AnimatePresence>

      <Field
        label="Work Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your.name@bantahr.ng"
        error={errors.email}
        icon={Mail}
        autoFocus
      />

      <Field
        label="Password"
        type={showPw ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        error={errors.password}
        icon={Lock}
        rightEl={
          <button onClick={() => setShowPw((p) => !p)} className="p-1">
            {showPw ? (
              <EyeOff size={15} color={C.textMuted} />
            ) : (
              <Eye size={15} color={C.textMuted} />
            )}
          </button>
        }
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => setRemember((p) => !p)}
            className="w-4 h-4 rounded flex items-center justify-center transition-all"
            style={{
              background: remember ? C.primary : "transparent",
              border: `1.5px solid ${remember ? C.primary : C.border}`,
            }}
          >
            {remember && <Check size={10} color="#fff" />}
          </div>
          <span className="text-xs" style={{ color: C.textSecondary }}>
            Remember me
          </span>
        </label>
        <button
          onClick={() => setView("forgot")}
          className="text-xs font-semibold hover:underline"
          style={{ color: C.primary }}
        >
          Forgot password?
        </button>
      </div>

      <Motion.button
        whileHover={{ scale: 1.01, boxShadow: `0 8px 24px ${C.primary}55` }}
        whileTap={{ scale: 0.98 }}
        onClick={handleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white transition-all"
        style={{
          background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
          boxShadow: `0 4px 16px ${C.primary}44`,
          opacity: loading ? 0.8 : 1,
        }}
      >
        {loading ? (
          <>
            <RefreshCw size={15} className="animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Sign In <ArrowRight size={15} />
          </>
        )}
      </Motion.button>

      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px" style={{ background: C.border }} />
        <span className="text-xs" style={{ color: C.textMuted }}>
          or
        </span>
        <div className="flex-1 h-px" style={{ background: C.border }} />
      </div>

      <p className="text-center text-sm" style={{ color: C.textSecondary }}>
        Don't have an account?{" "}
        <a
          href="/register"
          className="font-bold hover:underline"
          style={{ color: C.primary }}
        >
          Request Access
        </a>
      </p>
    </Motion.div>
  );

  /* ─── Forgot password ─── */
  const renderForgot = () => (
    <Motion.div
      key="forgot"
      variants={panelIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-4"
    >
      <button
        onClick={() => setView("login")}
        className="flex items-center gap-1.5 text-xs font-semibold mb-4 hover:opacity-70 transition-opacity"
        style={{ color: C.textMuted }}
      >
        <ArrowLeft size={13} />
        Back to login
      </button>
      <div className="mb-2">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: C.primaryLight }}
        >
          <KeyRound size={22} color={C.primary} />
        </div>
        <h2
          className="text-2xl font-bold mb-1"
          style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
        >
          Forgot Password?
        </h2>
        <p className="text-sm" style={{ color: C.textMuted }}>
          Enter your work email and we'll send a 6-digit verification code.
        </p>
      </div>

      <Field
        label="Work Email"
        type="email"
        value={forgotEmail}
        onChange={(e) => setForgotEmail(e.target.value)}
        placeholder="your.name@bantahr.ng"
        error={errors.forgotEmail}
        icon={Mail}
        autoFocus
      />

      <Motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSendOtp}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white"
        style={{
          background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
          boxShadow: `0 4px 16px ${C.primary}44`,
          opacity: loading ? 0.8 : 1,
        }}
      >
        {loading ? (
          <>
            <RefreshCw size={15} className="animate-spin" />
            Sending...
          </>
        ) : (
          <>
            Send Verification Code <ArrowRight size={15} />
          </>
        )}
      </Motion.button>
    </Motion.div>
  );

  /* ─── OTP verification ─── */
  const renderOtp = () => (
    <Motion.div
      key="otp"
      variants={panelIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-5"
    >
      <button
        onClick={() => setView("forgot")}
        className="flex items-center gap-1.5 text-xs font-semibold mb-2 hover:opacity-70 transition-opacity"
        style={{ color: C.textMuted }}
      >
        <ArrowLeft size={13} />
        Back
      </button>
      <div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: C.accentLight }}
        >
          <Smartphone size={22} color={C.accent} />
        </div>
        <h2
          className="text-2xl font-bold mb-1"
          style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
        >
          Check Your Email
        </h2>
        <p className="text-sm" style={{ color: C.textMuted }}>
          We sent a 6-digit code to{" "}
          <strong style={{ color: C.textPrimary }}>{forgotEmail}</strong>. Enter
          it below.
        </p>
      </div>

      <OtpInput value={otp} onChange={setOtp} />

      <AnimatePresence>
        {errors.otp && (
          <Motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1 text-[12px] text-center justify-center font-medium"
            style={{ color: C.danger }}
          >
            <AlertCircle size={11} />
            {errors.otp}
          </Motion.p>
        )}
      </AnimatePresence>

      <Motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleVerifyOtp}
        disabled={loading || otp.length < 6}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white"
        style={{
          background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
          boxShadow: `0 4px 16px ${C.primary}44`,
          opacity: loading || otp.length < 6 ? 0.7 : 1,
        }}
      >
        {loading ? (
          <>
            <RefreshCw size={15} className="animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            Verify Code <ArrowRight size={15} />
          </>
        )}
      </Motion.button>

      <div className="text-center text-sm" style={{ color: C.textSecondary }}>
        {otpRunning ? (
          <span>
            Resend code in{" "}
            <strong style={{ color: C.primary }}>{otpTimer}s</strong>
          </span>
        ) : (
          <button
            onClick={handleSendOtp}
            className="font-semibold hover:underline"
            style={{ color: C.primary }}
          >
            Resend verification code
          </button>
        )}
      </div>

      <p className="text-center text-xs" style={{ color: C.textMuted }}>
        For demo, enter any 6 digits to continue.
      </p>
    </Motion.div>
  );

  /* ─── New password ─── */
  const renderReset = () => (
    <Motion.div
      key="reset"
      variants={panelIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-4"
    >
      <div className="mb-2">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: C.successLight }}
        >
          <Lock size={22} color={C.success} />
        </div>
        <h2
          className="text-2xl font-bold mb-1"
          style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
        >
          Set New Password
        </h2>
        <p className="text-sm" style={{ color: C.textMuted }}>
          Choose a strong password for your account.
        </p>
      </div>

      <Field
        label="New Password"
        type={showNewPw ? "text" : "password"}
        value={newPw}
        onChange={(e) => setNewPw(e.target.value)}
        placeholder="At least 8 characters"
        error={pwErrors.newPw}
        icon={Lock}
        rightEl={
          <button onClick={() => setShowNewPw((p) => !p)} className="p-1">
            {showNewPw ? (
              <EyeOff size={15} color={C.textMuted} />
            ) : (
              <Eye size={15} color={C.textMuted} />
            )}
          </button>
        }
      />

      {/* Strength meter */}
      {newPw && (
        <div>
          <div className="flex gap-1.5 mb-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-1 h-1.5 rounded-full transition-all duration-300"
                style={{ background: i <= strength ? strengthColor : C.border }}
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <p
              className="text-[11px] font-semibold"
              style={{ color: strengthColor }}
            >
              {strengthLabel}
            </p>
            <p className="text-[11px]" style={{ color: C.textMuted }}>
              Use uppercase, numbers & symbols
            </p>
          </div>
        </div>
      )}

      <Field
        label="Confirm Password"
        type={showConfirmPw ? "text" : "password"}
        value={confirmPw}
        onChange={(e) => setConfirmPw(e.target.value)}
        placeholder="Repeat your password"
        error={pwErrors.confirmPw}
        icon={Lock}
        rightEl={
          <button onClick={() => setShowConfirmPw((p) => !p)} className="p-1">
            {showConfirmPw ? (
              <EyeOff size={15} color={C.textMuted} />
            ) : (
              <Eye size={15} color={C.textMuted} />
            )}
          </button>
        }
      />

      {/* Password rules */}
      <div
        className="rounded-2xl p-3.5 space-y-1.5"
        style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}
      >
        {[
          { rule: "At least 8 characters", pass: newPw.length >= 8 },
          { rule: "One uppercase letter", pass: /[A-Z]/.test(newPw) },
          { rule: "One number", pass: /[0-9]/.test(newPw) },
          { rule: "One special character", pass: /[^A-Za-z0-9]/.test(newPw) },
        ].map((r) => (
          <div key={r.rule} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center"
              style={{
                background: r.pass ? C.successLight : C.surfaceAlt,
                border: `1px solid ${r.pass ? C.success : C.border}`,
              }}
            >
              {r.pass && <Check size={9} color={C.success} />}
            </div>
            <span
              className="text-[11px]"
              style={{ color: r.pass ? C.success : C.textMuted }}
            >
              {r.rule}
            </span>
          </div>
        ))}
      </div>

      <Motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleResetPw}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white"
        style={{
          background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
          boxShadow: `0 4px 16px ${C.primary}44`,
          opacity: loading ? 0.8 : 1,
        }}
      >
        {loading ? (
          <>
            <RefreshCw size={15} className="animate-spin" />
            Updating...
          </>
        ) : (
          <>
            Reset Password <ArrowRight size={15} />
          </>
        )}
      </Motion.button>
    </Motion.div>
  );

  /* ─── Reset success ─── */
  const renderSuccess = () => (
    <Motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="text-center py-4 space-y-4"
    >
      <Motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto"
        style={{ background: "linear-gradient(135deg,#D1FAE5,#ECFEFF)" }}
      >
        <CheckCircle2 size={40} color={C.success} />
      </Motion.div>
      <div>
        <h2
          className="text-2xl font-bold mb-1"
          style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
        >
          Password Updated!
        </h2>
        <p className="text-sm" style={{ color: C.textMuted }}>
          Your password has been reset successfully. You can now sign in with
          your new password.
        </p>
      </div>
      <Motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setView("login");
          setNewPw("");
          setConfirmPw("");
          setOtp("");
          setForgotEmail("");
        }}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white"
        style={{
          background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
          boxShadow: `0 4px 16px ${C.primary}44`,
        }}
      >
        Back to Login <ArrowRight size={15} />
      </Motion.button>
    </Motion.div>
  );

  const renderView = () => {
    switch (view) {
      case "login":
        return renderLogin();
      case "forgot":
        return renderForgot();
      case "otp":
        return renderOtp();
      case "reset":
        return renderReset();
      case "success":
        return renderSuccess();
      default:
        return renderLogin();
    }
  };

  /* ─── Progress indicator ─── */
  const FLOW_STEPS = ["forgot", "otp", "reset", "success"];
  const flowIdx = FLOW_STEPS.indexOf(view);

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "Sora, sans-serif" }}
    >
      <LeftPanel />

      {/* Right panel */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto"
        style={{ background: C.surface, minHeight: "100vh" }}
      >
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)" }}
          >
            <Shield size={15} color="#fff" />
          </div>
          <span
            className="font-bold text-lg"
            style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
          >
            BantaHR
          </span>
        </div>

        <div className="w-full max-w-sm">
          {/* Reset flow progress indicator */}
          {flowIdx >= 0 && (
            <div className="flex items-center gap-2 mb-6">
              {FLOW_STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      background:
                        i < flowIdx
                          ? C.success
                          : i === flowIdx
                            ? C.primary
                            : C.surfaceAlt,
                      color: i <= flowIdx ? "#fff" : C.textMuted,
                      border: `2px solid ${i < flowIdx ? C.success : i === flowIdx ? C.primary : C.border}`,
                    }}
                  >
                    {i < flowIdx ? <Check size={10} /> : i + 1}
                  </div>
                  {i < FLOW_STEPS.length - 1 && (
                    <div
                      className="flex-1 h-0.5 rounded-full"
                      style={{ background: i < flowIdx ? C.success : C.border }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">{renderView()}</AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ─── tiny Check icon used inline ─── */
function Check({ size, color }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
