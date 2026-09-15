
// src/pages/RequestDemo.jsx
// BantaHR — Demo request form
// Simple: Name, Email, Company, Employee count
// Sends to mavicmontez@icloud.com via mailto (no backend needed)
// Onboarding is handled manually by the BantaHR team

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoImg from "../assets/logo.png";
import BantaHRLogo from "../styles/BantaHRLogo";
import {
  ArrowLeft, CheckCircle2, User, Mail, Building2,
  Users, Loader2, ArrowRight, 
  BriefcaseBusiness, MessageSquareText, Wallet,  TrendingUp, CircleGauge,
} from "lucide-react";

const RECIPIENT_EMAIL = "mavicmontez@icloud.com";

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

const EMPLOYEE_RANGES = [
  "1–10 employees",
  "11–50 employees",
  "51–200 employees",
  "201–500 employees",
  "500+ employees",
];

const featureData = [
    { id: 0,
      emoji: CircleGauge, 
      text: "Live payroll run in under 2 minutes", },
    { id: 1,
      emoji: BriefcaseBusiness, 
      text: "Employee self-service portal demo", },
    { id: 2,
      emoji: TrendingUp, 
      text: "Real-time HR analytics dashboard", },
    { id: 3,
      emoji: MessageSquareText, 
      text: "Built-in team chat & announcements", },
    { id: 4,
      emoji: Wallet, 
      text: "Digital document signing workflow" },
];

// ── Input field wrapper ──────────────────────────────────────────
function Field({ label, icon: Icon, error, children, required }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: T.textMid }}>
        {label}{required && <span style={{ color: T.danger, marginLeft: 3 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        {Icon && (
          <Icon size={16} color={T.textMuted}
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        )}
        {children}
      </div>
      {error && <p style={{ fontSize: 12, color: T.danger, margin: 0 }}>{error}</p>}
    </div>
  );
}

const inp = (hasIcon = true, error = false, focused = false) => ({
  width: "100%",
  padding: hasIcon ? "13px 14px 13px 42px" : "13px 14px",
  border: `1.5px solid ${error ? T.danger : focused ? T.indigo : T.border}`,
  borderRadius: 12, fontSize: 15, color: T.text, background: T.white, outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box",
  boxShadow: focused ? `0 0 0 3px ${T.indigoPale}` : "none",
});

export default function RequestDemo() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = form, 2 = success
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(null);
  const [heroVisible, setHeroVisible] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    employeeCount: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => { setTimeout(() => setHeroVisible(true), 60); }, []);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Your name is required.";
    if (!form.email.trim())   e.email   = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email.";
    if (!form.company.trim()) e.company = "Company name is required.";
    if (!form.employeeCount)  e.employeeCount = "Please select your team size.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSubmitting(true);
    try {
      const body = [
        `Name: ${form.name}`,
        `Email: ${form.email}`,
        `Company: ${form.company}`,
        `Number of Employees: ${form.employeeCount}`,
      ].join("\n");

      const subject = `BantaHR Demo Request — ${form.company}`;
      const mailto  = `mailto:${RECIPIENT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;

      await new Promise((r) => setTimeout(r, 900));
      setStep(2);
    } catch {
      alert("Something went wrong. Please email us directly at mavicmontez@icloud.com");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────
  if (step === 2) {
    return (
      <div style={{ minHeight: "100vh", background: `linear-gradient(150deg,${T.navy},${T.navyMid})`, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "'DM Sans','Sora',sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap" rel="stylesheet" />
        <div style={{ background: T.white, borderRadius: 28, padding: "56px 48px", maxWidth: 500, width: "100%", textAlign: "center", boxShadow: "0 32px 80px rgba(0,0,0,0.35)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
            <CheckCircle2 size={40} color={T.success} />
          </div>
          <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: 28, fontWeight: 800, color: T.navy, margin: "0 0 12px" }}>
            Request Sent! 🎉
          </h2>
          <p style={{ fontSize: 16, color: T.textMid, lineHeight: 1.7, margin: "0 0 8px" }}>
            Thanks <strong>{form.name.split(" ")[0]}</strong>! We've received your demo request for <strong>{form.company}</strong>.
          </p>
          <p style={{ fontSize: 15, color: T.textMuted, lineHeight: 1.7, margin: "0 0 36px" }}>
            Our team will reach out to you at <strong>{form.email}</strong> within <strong>24 hours</strong> to schedule your personalised walkthrough.
          </p>
          <div style={{ background: T.offWhite, borderRadius: 14, padding: "16px 20px", marginBottom: 32, textAlign: "left" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: T.textMuted, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>What happens next</p>
            {["Our team reviews your request", "We schedule a personalised demo call", "We handle your setup & onboarding"].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: T.indigo, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{i + 1}</span>
                </div>
                <span style={{ fontSize: 14, color: T.textMid }}>{item}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/")}
            style={{ background: T.indigo, color: "#fff", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: T.offWhite }}>
      {/* <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@700;800&display=swap" rel="stylesheet" /> */}

      {/* Two-column layout */}
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* ── LEFT PANEL (desktop only) ── */}
        <div
          className="demo-left-panel"
          style={{
            width: "45%",
            flexShrink: 0,
            background: `linear-gradient(150deg,${T.navy} 0%,${T.navyMid} 100%)`,
            display: "none",
            flexDirection: "column",
            padding: "56px 48px",
            position: "sticky",
            top: 0,
            height: "100vh",
            overflowY: "auto",
          }}
        >
          {/* Logo */}
          {/* <div style={{ marginBottom: 48 }}>
            <img src={logoImg} alt="BantaHR" style={{ height: 44, width: "auto", objectFit: "contain" }} />
          </div> */}
          <BantaHRLogo variant="light" size="md" />

          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: T.cyan,
                border: "1px solid rgba(8,145,178,0.9)",
                boxShadow: "0 2px 8px rgba(6,182,212,0.35)",
                borderRadius: 100,
                padding: "5px 14px",
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "0.06em",
                }}
              >
                FREE DEMO
              </span>
            </div>
            <h1
              style={{
                fontFamily: "Plus Jakarta Sans,sans-serif",
                fontSize: "clamp(1.8rem,3vw,2.6rem)",
                fontWeight: 1000,
                color: "#fff",
                lineHeight: 1.15,
                letterSpacing: "-0.8px",
                margin: "0 0 20px",
              }}
            >
              See BantaHR in Action
            </h1>
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 300,
                fontSize: 16,
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.8,
                margin: "0 0 48px",
              }}
            >
              In a 30-minute personalised walkthrough, we'll show you exactly
              how BantaHR can simplify HR for your team — no sales pressure,
              just solutions.
            </p>

            {/* What you'll see */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                What you'll see
              </p>
              {featureData.map((emoji, text) =>{
                const Icon = emoji.emoji;

                return(
                  <div
                  key={emoji.id}
                  style={{ display: "flex", alignItems: "center", gap: 14,color: "rgba(255,255,255,0.75)"  }}
                  > 
                  <Icon size={20}/>
                  <span
                    style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}
                  >
                    {emoji.text}
                  </span>

                  </div>
                );
              })}

              {/* {featureData.map(({ emoji, text }) => (
                
                <div
                  key={text}
                  style={{ display: "flex", alignItems: "center", gap: 14 }}
                >
                  <span style={{ fontSize: 20 }}>{emoji}</span>
                  <span
                    style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}
                  >
                    {text}
                  </span>
                </div>
              ))} */}
            </div>
          </div>

          {/* Bottom trust */}
          <div
            style={{
              marginTop: 48,
              paddingTop: 32,
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                margin: "0 0 12px",
              }}
            >
              Trusted by 500+ African companies
            </p>
            <div style={{ display: "flex", gap: -8 }}>
              {["AO", "EE", "FB", "CK", "MJ"].map((init, i) => (
                <div
                  key={i}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: [
                      `#4F46E5`,
                      `#06B6D4`,
                      `#10B981`,
                      `#F59E0B`,
                      `#EC4899`,
                    ][i],
                    border: "2px solid rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#fff",
                    marginLeft: i === 0 ? 0 : -8,
                    zIndex: 5 - i,
                    position: "relative",
                  }}
                >
                  {init}
                </div>
              ))}
              <span
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.5)",
                  marginLeft: 12,
                  alignSelf: "center",
                }}
              >
                +490 companies
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — form ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          {/* Mobile header */}
          <div
            className="mobile-header"
            style={{
              display: "none",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1.25rem 1.5rem",
              borderBottom: `1px solid ${T.border}`,
              background: T.white,
            }}
          >
            {/* <img
              src={logoImg}
              alt="BantaHR"
              style={{ height: 36, width: "auto", objectFit: "contain" }}
            /> */}
            <BantaHRLogo variant="dark" size="md" />
            <button
              onClick={() => navigate("/")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: T.textMuted,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              padding: "3rem 1.5rem",
            }}
          >
            <div style={{ width: "100%", maxWidth: 480 }}>
              {/* Desktop back */}
              <button
                onClick={() => navigate("/")}
                className="desktop-back"
                style={{
                  display: "none",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: T.textMuted,
                  fontSize: 14,
                  fontWeight: 500,
                  marginBottom: 36,
                  padding: 0,
                }}
              >
                <ArrowLeft size={15} /> Back to BantaHR
              </button>

              {/* Form heading */}
              <div style={{ marginBottom: 36 }}>
                <h2
                  style={{
                    fontFamily: "Sora,sans-serif",
                    fontSize: 26,
                    fontWeight: 800,
                    color: T.navy,
                    margin: "0 0 8px",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Request a Free Demo
                </h2>
                <p
                  style={{
                    fontSize: 15,
                    color: T.textMuted,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  Just 4 quick questions — our team will take it from there.
                </p>
              </div>

              {/* Form fields */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                {/* Full name */}
                <Field
                  label="Your Full Name"
                  icon={User}
                  error={errors.name}
                  required
                >
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Adaeze Okonkwo"
                    onFocus={() => setFocused("name")}
                    onBlur={() => setFocused(null)}
                    style={inp(true, !!errors.name, focused === "name")}
                  />
                </Field>

                {/* Email */}
                <Field
                  label="Work Email"
                  icon={Mail}
                  error={errors.email}
                  required
                >
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@yourcompany.com"
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    style={inp(true, !!errors.email, focused === "email")}
                  />
                </Field>

                {/* Company name */}
                <Field
                  label="Company Name"
                  icon={Building2}
                  error={errors.company}
                  required
                >
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => set("company", e.target.value)}
                    placeholder="e.g. Acme Technologies Ltd"
                    onFocus={() => setFocused("company")}
                    onBlur={() => setFocused(null)}
                    style={inp(true, !!errors.company, focused === "company")}
                  />
                </Field>

                {/* Employee count */}
                <Field
                  label="Number of Employees"
                  icon={Users}
                  error={errors.employeeCount}
                  required
                >
                  <div style={{ position: "relative" }}>
                    <Users
                      size={16}
                      color={T.textMuted}
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                        zIndex: 1,
                      }}
                    />
                    <select
                      value={form.employeeCount}
                      onChange={(e) => set("employeeCount", e.target.value)}
                      onFocus={() => setFocused("employeeCount")}
                      onBlur={() => setFocused(null)}
                      style={{
                        ...inp(
                          true,
                          !!errors.employeeCount,
                          focused === "employeeCount",
                        ),
                        appearance: "none",
                        WebkitAppearance: "none",
                        cursor: "pointer",
                        background: T.white,
                        paddingRight: 40,
                      }}
                    >
                      <option value="" disabled>
                        Select team size
                      </option>
                      {EMPLOYEE_RANGES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    {/* Custom chevron */}
                    <div
                      style={{
                        position: "absolute",
                        right: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M4 6l4 4 4-4"
                          stroke={T.textMuted}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </Field>

                {/* Pricing hint */}
                {form.employeeCount && (
                  <div
                    style={{
                      background: T.indigoPale,
                      borderRadius: 12,
                      padding: "14px 16px",
                      border: `1px solid ${T.indigo}22`,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        color: T.indigo,
                        fontWeight: 600,
                        margin: "0 0 2px",
                      }}
                    >
                      💡 Estimated starting price
                    </p>
                    <p style={{ fontSize: 13, color: T.textMid, margin: 0 }}>
                      {form.employeeCount === "1–10 employees" &&
                        "₦10,000 / month (10 employees × ₦1,000)"}
                      {form.employeeCount === "11–50 employees" &&
                        "₦11,000 – ₦50,000 / month"}
                      {form.employeeCount === "51–200 employees" &&
                        "₦51,000 – ₦200,000 / month"}
                      {form.employeeCount === "201–500 employees" &&
                        "₦201,000 – ₦500,000 / month — volume discount available"}
                      {form.employeeCount === "500+ employees" &&
                        "Custom enterprise pricing — let's talk!"}
                    </p>
                  </div>
                )}

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
                    boxShadow: "0 6px 20px rgba(79,70,229,0.35)",
                    opacity: submitting ? 0.8 : 1,
                    transition: "transform 0.15s,box-shadow 0.15s",
                    marginTop: 8,
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 10px 28px rgba(79,70,229,0.45)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(79,70,229,0.35)";
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2
                        size={18}
                        style={{ animation: "spin 0.8s linear infinite" }}
                      />{" "}
                      Sending…
                    </>
                  ) : (
                    <>
                      Request My Free Demo <ArrowRight size={16} />
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
                  No credit card required. No commitment. Our team will
                  personally reach out within 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        @media (min-width: 900px) {
          .demo-left-panel { display: flex !important; }
          .mobile-header   { display: none !important; }
          .desktop-back    { display: flex !important; }
        }
        @media (max-width: 899px) {
          .demo-left-panel { display: none !important; }
          .mobile-header   { display: flex !important; }
          .desktop-back    { display: none !important; }
        }
        select option { color: #0F172A; }
        input::placeholder { color: #94A3B8; }
      `}</style>
    </div>
  );
}