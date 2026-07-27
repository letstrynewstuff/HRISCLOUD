// src/pages/RequestDemo.jsx
// Demo booking form. Composes a mailto: to RECIPIENT_EMAIL, then shows the
// confirmation screen.
//
// Rebranded onto the token layer (see REBRAND-MIGRATION.md). Styling lives in
// src/styles/marketing.css — the `.mk-split*` block — so this file carries
// content and behaviour only. Form logic is unchanged from the original.

import { useState, cloneElement } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  User,
  Mail,
  Building2,
  Users,
  Loader2,
  Check,
} from "lucide-react";

import "../styles/marketing.css";

const RECIPIENT_EMAIL = "mavicmontez@icloud.com";

const EMPLOYEE_RANGES = [
  "1–10 employees",
  "11–50 employees",
  "51–200 employees",
  "201–500 employees",
  "500+ employees",
];

const WALKTHROUGH = [
  "Live payroll run in under 2 minutes",
  "Employee self-service portal demo",
  "Real-time HR analytics dashboard",
  "Built-in team chat & announcements",
  "Digital document signing workflow",
];

const NEXT_STEPS = [
  "Our team reviews your request",
  "We schedule a personalised demo call",
  "We handle your setup & onboarding",
];

/* ── The BantaHR mark, on the gradient panel ── */
function Wordmark({ onDark = false }) {
  return (
    <span className="mk-logo">
      <svg width="40" height="40" viewBox="0 0 56 56" aria-hidden="true">
        <rect
          width="56"
          height="56"
          rx="14"
          fill={onDark ? "rgba(255,255,255,0.16)" : "url(#rd-logo-grad)"}
        />
        <circle cx="14" cy="19" r="5" fill="#fff" fillOpacity="0.55" />
        <path
          d="M6 38c0-5.523 3.582-10 8-10s8 4.477 8 10"
          stroke="#fff"
          strokeOpacity="0.55"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="42" cy="19" r="5" fill="#fff" fillOpacity="0.55" />
        <path
          d="M34 38c0-5.523 3.582-10 8-10s8 4.477 8 10"
          stroke="#fff"
          strokeOpacity="0.55"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="28" cy="17" r="6.5" fill="#fff" />
        <path
          d="M18 40c0-6.627 4.477-12 10-12s10 5.373 10 12"
          stroke="#fff"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
        <defs>
          <linearGradient id="rd-logo-grad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--color-indigo-500)" />
            <stop offset="55%" stopColor="var(--color-indigo-600)" />
            <stop offset="100%" stopColor="var(--color-indigo-950)" />
          </linearGradient>
        </defs>
      </svg>
      <span>
        <span
          className="mk-logo__word"
          style={onDark ? { color: "#fff" } : undefined}
        >
          Banta
          <em style={onDark ? { color: "var(--color-indigo-200)" } : undefined}>HR</em>
        </span>
        <span
          className="mk-logo__sub"
          style={onDark ? { color: "rgba(255,255,255,0.6)" } : undefined}
        >
          People Platform
        </span>
      </span>
    </span>
  );
}

/* ── Labelled input wrapper ── */
function Field({ id, label, icon: Icon, error, required, children }) {
  const errId = error ? `${id}-error` : undefined;
  return (
    <div
      className={`mk-field ${Icon ? "mk-field--icon" : ""} ${
        error ? "mk-field--error" : ""
      }`}
    >
      {/* htmlFor/id gives the control its accessible name; without it a
          <select> reports "Element does not have an implicit (wrapped) label" */}
      <label htmlFor={id}>
        {label}
        {required && <span className="mk-field__req">*</span>}
      </label>
      <div className="mk-field__wrap">
        {Icon && <Icon size={16} />}
        {cloneElement(children, {
          id,
          "aria-invalid": error ? "true" : undefined,
          "aria-describedby": errId,
          "aria-required": required ? "true" : undefined,
        })}
      </div>
      {error && (
        <p className="mk-field__err" id={errId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function RequestDemo() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = form, 2 = confirmation
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    employeeCount: "",
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Your name is required.";
    if (!form.email.trim()) e.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Please enter a valid email.";
    if (!form.company.trim()) e.company = "Company name is required.";
    if (!form.employeeCount) e.employeeCount = "Please select your team size.";
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
      const body = [
        `Name: ${form.name}`,
        `Email: ${form.email}`,
        `Company: ${form.company}`,
        `Number of Employees: ${form.employeeCount}`,
      ].join("\n");

      const subject = `BantaHR Demo Request — ${form.company}`;
      window.location.href = `mailto:${RECIPIENT_EMAIL}?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(body)}`;

      await new Promise((r) => setTimeout(r, 900));
      setStep(2);
    } catch {
      alert(
        `Something went wrong. Please email us directly at ${RECIPIENT_EMAIL}`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Confirmation ── */
  if (step === 2) {
    return (
      <div className="mk mk-done">
        <div className="mk-done__card">
          <span className="mk-done__mark">
            <CheckCircle2 size={36} />
          </span>
          <h2>Request Sent</h2>
          <p>
            Thanks <strong>{form.name.split(" ")[0]}</strong>. We&rsquo;ve
            received your demo request for <strong>{form.company}</strong>.
          </p>
          <p>
            Our team will reach out at <strong>{form.email}</strong> within{" "}
            <strong>24 hours</strong> to schedule your personalised walkthrough.
          </p>

          <div className="mk-done__next">
            <p className="mk-eyebrow">What happens next</p>
            <ol>
              {NEXT_STEPS.map((item, i) => (
                <li key={item}>
                  <span className="mk-done__n">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>

          <button
            type="button"
            className="mk-btn mk-btn--primary"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="mk mk-split">
      {/* ── LEFT PANEL (desktop) ── */}
      <aside className="mk-split__aside">
        <Wordmark onDark />

        <div>
          <span className="mk-split__badge">Free Demo</span>
          <h1>See BantaHR in Action</h1>
          <p className="mk-split__lede">
            In a 30-minute personalised walkthrough, we&rsquo;ll show you
            exactly how BantaHR can simplify HR for your team. No sales
            pressure, just solutions.
          </p>
        </div>

        <div>
          <p
            className="mk-eyebrow"
            style={{ color: "var(--color-indigo-200)", marginBottom: "0.9rem" }}
          >
            What you&rsquo;ll see
          </p>
          <ul className="mk-split__list">
            {WALKTHROUGH.map((item) => (
              <li key={item}>
                <Check size={16} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mk-split__trust">
          <p className="mk-eyebrow" style={{ color: "rgba(255,255,255,0.6)" }}>
            Trusted by 500+ African companies
          </p>
          <div className="mk-split__faces">
            {["AO", "EE", "FB", "CK", "MJ"].map((init) => (
              <span key={init}>{init}</span>
            ))}
            <em>and hundreds more</em>
          </div>
        </div>
      </aside>

      {/* ── RIGHT PANEL — form ── */}
      <div className="mk-split__main">
        <div className="mk-split__bar">
          <Wordmark />
          <button
            type="button"
            className="mk-split__back"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div className="mk-split__form">
          <div className="mk-split__card">
            <div>
              <h2>Request a Free Demo</h2>
              <p style={{ marginTop: "0.5rem" }}>
                Just 4 quick questions. Our team will take it from there.
              </p>
            </div>

            <div className="mk-fields">
              <Field id="rd-name" label="Your Full Name" icon={User} error={errors.name} required>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Adaeze Okonkwo"
                />
              </Field>

              <Field id="rd-email" label="Work Email" icon={Mail} error={errors.email} required>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@yourcompany.com"
                />
              </Field>

              <Field
                id="rd-company"
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
                />
              </Field>

              <Field
                id="rd-size"
                label="Number of Employees"
                icon={Users}
                error={errors.employeeCount}
                required
              >
                <select
                  value={form.employeeCount}
                  onChange={(e) => set("employeeCount", e.target.value)}
                >
                  <option value="">Select your team size</option>
                  {EMPLOYEE_RANGES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <button
              type="button"
              className="mk-btn mk-btn--primary mk-btn--wide"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Sending…
                </>
              ) : (
                <>
                  Request My Free Demo <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="mk-split__note">
              No credit card required. No commitment. Our team will personally
              reach out within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
