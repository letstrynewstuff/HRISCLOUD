// src/pages/RequestDemo.jsx
// Demo booking form — sends email via EmailJS (free, no backend needed)
// or falls back to a mailto: link.
//
// To enable real email sending:
//  1. Create a free account at https://emailjs.com
//  2. npm install @emailjs/browser
//  3. Fill in YOUR_SERVICE_ID, YOUR_TEMPLATE_ID, YOUR_PUBLIC_KEY below
//  4. Uncomment the emailjs import and sendForm call

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  User,
  Mail,
  Phone,
  Building2,
  Users,
  Loader2,
  ChevronDown,
} from "lucide-react";

// ── To use EmailJS, uncomment this and install @emailjs/browser:
// import emailjs from "@emailjs/browser";

// ── EmailJS config — replace with your own credentials ──────────
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";

// ── The email that receives demo requests ──────────────────────
const RECIPIENT_EMAIL = "demo@hriscloud.ng"; // ← change to your email

const T = {
  navy: "#0F1629",
  navyMid: "#1A2545",
  indigo: "#4F46E5",
  indigoLight: "#6366F1",
  indigoPale: "#EEF2FF",
  cyan: "#06B6D4",
  white: "#FFFFFF",
  offWhite: "#F8F9FC",
  text: "#0F172A",
  textMid: "#334155",
  textMuted: "#64748B",
  border: "#E2E8F0",
  success: "#10B981",
  danger: "#EF4444",
};

const COMPANY_SIZES = [
  "1–10 employees",
  "11–50 employees",
  "51–200 employees",
  "201–500 employees",
  "500+ employees",
];

const INDUSTRIES = [
  "Banking & Finance",
  "Technology",
  "Healthcare",
  "Manufacturing",
  "Retail & FMCG",
  "Telecommunications",
  "Energy & Oil",
  "Education",
  "NGO / Non-profit",
  "Logistics",
  "Other",
];

// Generate next 30 available business days
function getAvailableDates() {
  const dates = [];
  const d = new Date();
  d.setDate(d.getDate() + 1); // start from tomorrow
  while (dates.length < 30) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      // skip weekends
      dates.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

const TIME_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
];

function Field({ label, icon: Icon, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: T.textMid }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        {Icon && (
          <Icon
            size={16}
            color={T.textMuted}
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
        )}
        {children}
      </div>
      {error && (
        <p style={{ fontSize: 12, color: T.danger, margin: 0 }}>{error}</p>
      )}
    </div>
  );
}

const inputStyle = (hasIcon = true, error = false) => ({
  width: "100%",
  padding: hasIcon ? "12px 14px 12px 42px" : "12px 14px",
  border: `1.5px solid ${error ? T.danger : T.border}`,
  borderRadius: 12,
  fontSize: 15,
  color: T.text,
  background: T.white,
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box",
});

export default function RequestDemo() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = form, 2 = success
  const [submitting, setSubmitting] = useState(false);
  const [availDates, setAvailDates] = useState([]);
  const [focusedField, setFocusedField] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    companySize: "",
    industry: "",
    demoDate: "",
    demoTime: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setAvailDates(getAvailableDates());
  }, []);

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Please enter a valid email.";
    if (!form.phone.trim()) e.phone = "Phone number is required.";
    if (!form.company.trim()) e.company = "Company name is required.";
    if (!form.companySize) e.companySize = "Please select a company size.";
    if (!form.demoDate) e.demoDate = "Please pick a date.";
    if (!form.demoTime) e.demoTime = "Please pick a time slot.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    setSubmitting(true);
    try {
      // ── Option A: EmailJS (uncomment when configured) ────────────
      // await emailjs.send(
      //   EMAILJS_SERVICE_ID,
      //   EMAILJS_TEMPLATE_ID,
      //   {
      //     to_email:    RECIPIENT_EMAIL,
      //     first_name:  form.firstName,
      //     last_name:   form.lastName,
      //     email:       form.email,
      //     phone:       form.phone,
      //     company:     form.company,
      //     company_size:form.companySize,
      //     industry:    form.industry,
      //     demo_date:   form.demoDate,
      //     demo_time:   form.demoTime,
      //     message:     form.message,
      //   },
      //   EMAILJS_PUBLIC_KEY
      // );

      // ── Option B: mailto fallback (works without EmailJS) ────────
      const body = [
        `Name: ${form.firstName} ${form.lastName}`,
        `Email: ${form.email}`,
        `Phone: ${form.phone}`,
        `Company: ${form.company}`,
        `Company Size: ${form.companySize}`,
        `Industry: ${form.industry}`,
        `Preferred Date: ${form.demoDate}`,
        `Preferred Time: ${form.demoTime}`,
        form.message ? `\nAdditional Notes:\n${form.message}` : "",
      ].join("\n");

      // Open mailto (silently attempt — fallback approach)
      const mailto = `mailto:${RECIPIENT_EMAIL}?subject=Demo Request — ${encodeURIComponent(form.company)}&body=${encodeURIComponent(body)}`;
      window.open(mailto, "_blank");

      // Simulate network delay
      await new Promise((r) => setTimeout(r, 800));

      setStep(2);
    } catch (err) {
      console.error("Failed to send demo request:", err);
      alert(
        "Something went wrong. Please email us directly at " + RECIPIENT_EMAIL,
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── SELECT component ─────────────────────────────────────────
  const Select = ({ value, onChange, placeholder, options, error }) => (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...inputStyle(false, !!error),
          appearance: "none",
          paddingRight: 40,
          color: value ? T.text : T.textMuted,
          cursor: "pointer",
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        color={T.textMuted}
        style={{
          position: "absolute",
          right: 14,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );

  const focusStyle = {
    borderColor: T.indigo,
    boxShadow: `0 0 0 3px ${T.indigoPale}`,
  };

  // ══════════════════════════════════════════════════════════════
  // SUCCESS STATE
  // ══════════════════════════════════════════════════════════════
  if (step === 2) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: `linear-gradient(150deg, ${T.navy} 0%, ${T.navyMid} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.5rem",
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap"
          rel="stylesheet"
        />
        <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(16,185,129,0.15)",
              border: "2px solid rgba(16,185,129,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 28px",
            }}
          >
            <CheckCircle2 size={40} color={T.success} />
          </div>
          <h1
            style={{
              fontFamily: "Sora,sans-serif",
              fontSize: "clamp(1.8rem,4vw,2.4rem)",
              fontWeight: 800,
              color: "#fff",
              margin: "0 0 16px",
              letterSpacing: "-0.5px",
            }}
          >
            You're all set, {form.firstName}!
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.7,
              margin: "0 0 12px",
            }}
          >
            We've received your demo request and will confirm your session at:
          </p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(79,70,229,0.2)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 12,
              padding: "10px 20px",
              margin: "0 0 36px",
            }}
          >
            <Calendar size={16} color={T.cyan} />
            <span style={{ color: T.cyan, fontWeight: 700, fontSize: 15 }}>
              {form.demoDate} at {form.demoTime}
            </span>
          </div>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.5)",
              margin: "0 0 40px",
            }}
          >
            A confirmation email is on its way to{" "}
            <strong style={{ color: "rgba(255,255,255,0.8)" }}>
              {form.email}
            </strong>
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => navigate("/")}
              style={{
                background: T.indigo,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "14px 28px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Back to Home
            </button>
            <button
              onClick={() => {
                setStep(1);
                setForm({
                  firstName: "",
                  lastName: "",
                  email: "",
                  phone: "",
                  company: "",
                  companySize: "",
                  industry: "",
                  demoDate: "",
                  demoTime: "",
                  message: "",
                });
              }}
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 12,
                padding: "14px 28px",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // FORM
  // ══════════════════════════════════════════════════════════════
  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.offWhite,
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap"
        rel="stylesheet"
      />

      {/* ── Left panel (hidden on mobile) ── */}
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <div
          style={{
            display: "none",
            width: 420,
            background: `linear-gradient(160deg, ${T.navy}, ${T.navyMid})`,
            padding: "56px 40px",
            flexDirection: "column",
            flexShrink: 0,
          }}
          className="demo-left-panel"
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 56,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: T.indigo,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={20} color="#fff" />
            </div>
            <span
              style={{
                fontFamily: "Sora,sans-serif",
                fontWeight: 700,
                fontSize: 19,
                color: "#fff",
              }}
            >
              HRISCloud
            </span>
          </div>

          <h2
            style={{
              fontFamily: "Sora,sans-serif",
              fontSize: 28,
              fontWeight: 800,
              color: "#fff",
              margin: "0 0 16px",
              lineHeight: 1.2,
            }}
          >
            Book your personalised demo
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.7,
              margin: "0 0 48px",
            }}
          >
            A real human expert will walk you through HRISCloud — no sales
            pressure, just answers tailored to your business.
          </p>

          {/* What to expect */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              {
                icon: "📋",
                title: "Tailored walkthrough",
                desc: "We demo only the features that matter to your team size and industry.",
              },
              {
                icon: "⏱️",
                title: "45 minutes max",
                desc: "Focused, no-fluff session that respects your time.",
              },
              {
                icon: "🎯",
                title: "Live Q&A",
                desc: "Ask anything. Get honest answers from our product team.",
              },
              {
                icon: "🆓",
                title: "No commitment",
                desc: "Completely free — we earn your trust before you ever pay.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ display: "flex", gap: 14 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
                <div>
                  <p
                    style={{
                      fontWeight: 700,
                      color: "#fff",
                      margin: "0 0 4px",
                      fontSize: 14,
                    }}
                  >
                    {title}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.5)",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "auto", paddingTop: 40 }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
              Trusted by 500+ companies across Nigeria & Africa
            </p>
          </div>
        </div>

        {/* ── Right panel (form) ── */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {/* Mobile header */}
          <div
            style={{
              background: T.navy,
              padding: "20px 1.5rem",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
            className="mobile-header"
          >
            <button
              onClick={() => navigate("/")}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: 8,
                padding: 8,
                cursor: "pointer",
                display: "flex",
              }}
            >
              <ArrowLeft size={18} color="#fff" />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: T.indigo,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Shield size={14} color="#fff" />
              </div>
              <span
                style={{
                  fontFamily: "Sora,sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#fff",
                }}
              >
                HRISCloud
              </span>
            </div>
          </div>

          <div
            style={{
              maxWidth: 640,
              margin: "0 auto",
              padding: "48px 1.5rem 80px",
            }}
          >
            {/* Back button (desktop) */}
            <button
              onClick={() => navigate("/")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                color: T.textMuted,
                fontSize: 14,
                cursor: "pointer",
                marginBottom: 32,
                fontWeight: 500,
                padding: 0,
              }}
              className="desktop-back"
              onMouseEnter={(e) => (e.currentTarget.style.color = T.indigo)}
              onMouseLeave={(e) => (e.currentTarget.style.color = T.textMuted)}
            >
              <ArrowLeft size={16} /> Back to home
            </button>

            <h1
              style={{
                fontFamily: "Sora,sans-serif",
                fontSize: "clamp(1.6rem,3.5vw,2.2rem)",
                fontWeight: 800,
                color: T.navy,
                margin: "0 0 8px",
                letterSpacing: "-0.5px",
              }}
            >
              Book Your Free Demo
            </h1>
            <p
              style={{
                fontSize: 16,
                color: T.textMid,
                margin: "0 0 40px",
                lineHeight: 1.6,
              }}
            >
              Fill in your details and we'll confirm a session that works for
              you — typically within one business day.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Name row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
                className="name-grid"
              >
                <Field
                  label="First Name *"
                  icon={User}
                  error={errors.firstName}
                >
                  <input
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    placeholder="Amara"
                    onFocus={() => setFocusedField("firstName")}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      ...inputStyle(true, !!errors.firstName),
                      ...(focusedField === "firstName" ? focusStyle : {}),
                    }}
                  />
                </Field>
                <Field label="Last Name *" icon={User} error={errors.lastName}>
                  <input
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    placeholder="Johnson"
                    onFocus={() => setFocusedField("lastName")}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      ...inputStyle(true, !!errors.lastName),
                      ...(focusedField === "lastName" ? focusStyle : {}),
                    }}
                  />
                </Field>
              </div>

              {/* Email */}
              <Field label="Work Email *" icon={Mail} error={errors.email}>
                <input
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  type="email"
                  placeholder="amara@company.com"
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputStyle(true, !!errors.email),
                    ...(focusedField === "email" ? focusStyle : {}),
                  }}
                />
              </Field>

              {/* Phone */}
              <Field label="Phone Number *" icon={Phone} error={errors.phone}>
                <input
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  type="tel"
                  placeholder="+234 803 000 0000"
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputStyle(true, !!errors.phone),
                    ...(focusedField === "phone" ? focusStyle : {}),
                  }}
                />
              </Field>

              {/* Company */}
              <Field
                label="Company Name *"
                icon={Building2}
                error={errors.company}
              >
                <input
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  placeholder="Acme Corp Ltd"
                  onFocus={() => setFocusedField("company")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputStyle(true, !!errors.company),
                    ...(focusedField === "company" ? focusStyle : {}),
                  }}
                />
              </Field>

              {/* Company size + Industry */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
                className="size-grid"
              >
                <Field label="Company Size *" error={errors.companySize}>
                  <Select
                    value={form.companySize}
                    onChange={(v) => set("companySize", v)}
                    placeholder="Select size"
                    options={COMPANY_SIZES}
                    error={errors.companySize}
                  />
                  {errors.companySize && (
                    <p
                      style={{
                        fontSize: 12,
                        color: T.danger,
                        margin: "4px 0 0",
                      }}
                    >
                      {errors.companySize}
                    </p>
                  )}
                </Field>
                <Field label="Industry" error={errors.industry}>
                  <Select
                    value={form.industry}
                    onChange={(v) => set("industry", v)}
                    placeholder="Select industry"
                    options={INDUSTRIES}
                  />
                </Field>
              </div>

              {/* Date picker */}
              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: T.textMid,
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Preferred Demo Date *
                  {errors.demoDate && (
                    <span
                      style={{
                        color: T.danger,
                        marginLeft: 8,
                        fontWeight: 400,
                      }}
                    >
                      {errors.demoDate}
                    </span>
                  )}
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(120px, 1fr))",
                    gap: 8,
                    maxHeight: 220,
                    overflowY: "auto",
                    padding: "4px 2px",
                  }}
                >
                  {availDates.slice(0, 20).map((d) => {
                    const label = d.toLocaleDateString("en-NG", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    });
                    const value = d.toLocaleDateString("en-GB");
                    const selected = form.demoDate === value;
                    return (
                      <button
                        key={value}
                        onClick={() => set("demoDate", value)}
                        style={{
                          padding: "10px 8px",
                          borderRadius: 10,
                          border: `1.5px solid ${selected ? T.indigo : T.border}`,
                          background: selected ? T.indigoPale : T.white,
                          color: selected ? T.indigo : T.textMid,
                          fontSize: 12,
                          fontWeight: selected ? 700 : 500,
                          cursor: "pointer",
                          textAlign: "center",
                          lineHeight: 1.4,
                          transition: "all 0.15s",
                        }}
                      >
                        {label.replace(",", "")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slots */}
              {form.demoDate && (
                <div>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: T.textMid,
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    Preferred Time (WAT) *
                    {errors.demoTime && (
                      <span
                        style={{
                          color: T.danger,
                          marginLeft: 8,
                          fontWeight: 400,
                        }}
                      >
                        {errors.demoTime}
                      </span>
                    )}
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {TIME_SLOTS.map((slot) => {
                      const selected = form.demoTime === slot;
                      return (
                        <button
                          key={slot}
                          onClick={() => set("demoTime", slot)}
                          style={{
                            padding: "9px 16px",
                            borderRadius: 10,
                            border: `1.5px solid ${selected ? T.indigo : T.border}`,
                            background: selected ? T.indigoPale : T.white,
                            color: selected ? T.indigo : T.textMid,
                            fontSize: 13,
                            fontWeight: selected ? 700 : 500,
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Message */}
              <Field label="Anything else we should know? (Optional)">
                <textarea
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder="Tell us about your current HR challenges, team size, or specific features you'd like to see..."
                  rows={4}
                  onFocus={() => setFocusedField("message")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputStyle(false),
                    resize: "vertical",
                    fontFamily: "inherit",
                    minHeight: 100,
                    ...(focusedField === "message" ? focusStyle : {}),
                  }}
                />
              </Field>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "16px 0",
                  background: T.indigo,
                  color: "#fff",
                  border: "none",
                  borderRadius: 14,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  boxShadow: `0 6px 20px rgba(79,70,229,0.35)`,
                  opacity: submitting ? 0.8 : 1,
                  transition: "transform 0.15s, box-shadow 0.15s",
                  marginTop: 8,
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = `0 10px 28px rgba(79,70,229,0.45)`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = `0 6px 20px rgba(79,70,229,0.35)`;
                }}
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={18}
                      style={{ animation: "spin 0.8s linear infinite" }}
                    />{" "}
                    Submitting your request…
                  </>
                ) : (
                  <>
                    Book My Demo — It's Free{" "}
                    <span style={{ fontSize: 17 }}>🎉</span>
                  </>
                )}
              </button>

              <p
                style={{
                  fontSize: 12,
                  color: T.textMuted,
                  textAlign: "center",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                By submitting this form you agree to our{" "}
                <a href="#" style={{ color: T.indigo, textDecoration: "none" }}>
                  Privacy Policy
                </a>
                . We will never share your information with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        @media (min-width: 900px) {
          .demo-left-panel { display: flex !important; }
          .mobile-header { display: none !important; }
          .desktop-back { display: flex !important; }
        }
        @media (max-width: 899px) {
          .demo-left-panel { display: none !important; }
          .mobile-header { display: flex !important; }
          .desktop-back { display: none !important; }
        }
        @media (max-width: 500px) {
          .name-grid { grid-template-columns: 1fr !important; }
          .size-grid { grid-template-columns: 1fr !important; }
        }
        select option { color: #0F172A; }
      `}</style>
    </div>
  );
}
