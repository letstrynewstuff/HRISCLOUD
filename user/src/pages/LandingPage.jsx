// src/pages/LandingPage.jsx
// HRISCloud — modern enterprise landing page
// No login / register links — only "Request a Demo"
// Fully mobile-responsive

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
  Globe,
  ChevronRight,
  ArrowRight,
  Check,
  Star,
  Menu,
  X,
  BarChart2,
  FileText,
  Calendar,
  Award,
  Zap,
  Heart,
  Play,
  CheckCircle2,
} from "lucide-react";

// ── Colour system ─────────────────────────────────────────────
const T = {
  navy: "#0F1629",
  navyMid: "#1A2545",
  navyLight: "#243058",
  indigo: "#4F46E5",
  indigoLight: "#6366F1",
  indigoPale: "#EEF2FF",
  cyan: "#06B6D4",
  sand: "#F5F0E8",
  sandDark: "#E8E0CC",
  white: "#FFFFFF",
  offWhite: "#F8F9FC",
  text: "#0F172A",
  textMid: "#334155",
  textMuted: "#64748B",
  border: "#E2E8F0",
  success: "#10B981",
};

// ── Feature data ──────────────────────────────────────────────
const FEATURES = [
  {
    icon: Users,
    title: "Employee Management",
    desc: "Centralise employee records, org charts, onboarding, and offboarding in one seamless hub.",
    color: T.indigo,
    bg: T.indigoPale,
  },
  {
    icon: Clock,
    title: "Attendance & Leave",
    desc: "Real-time clock-in with geofencing, automated leave balances, and smart approval workflows.",
    color: T.cyan,
    bg: "#ECFEFF",
  },
  {
    icon: DollarSign,
    title: "Payroll Processing",
    desc: "Run accurate, compliant Nigerian payroll in minutes — PAYE, pension, NHF all automated.",
    color: T.success,
    bg: "#D1FAE5",
  },
  {
    icon: TrendingUp,
    title: "Performance Management",
    desc: "Set OKRs and KPIs, run appraisal cycles, and track employee growth with actionable insights.",
    color: "#F59E0B",
    bg: "#FEF3C7",
  },
  {
    icon: FileText,
    title: "Document Management",
    desc: "Digital contracts, e-signatures, and secure document storage — all GDPR-compliant.",
    color: "#8B5CF6",
    bg: "#EDE9FE",
  },
  {
    icon: BarChart2,
    title: "HR Analytics",
    desc: "Live dashboards and reports that turn your workforce data into strategic business decisions.",
    color: "#EC4899",
    bg: "#FDF2F8",
  },
];

const STATS = [
  { value: "500+", label: "Companies onboarded", suffix: "" },
  { value: "95%", label: "Customer satisfaction", suffix: "" },
  { value: "40%", label: "HR time saved", suffix: "" },
  { value: "₦2B+", label: "Payroll processed", suffix: "" },
];

const TESTIMONIALS = [
  {
    quote:
      "HRISCloud cut our monthly payroll processing from 3 days to 45 minutes. The ROI was immediate.",
    name: "Adaeze Okonkwo",
    title: "Head of People Operations, Flutterwave",
    avatar: "AO",
    color: T.indigo,
    rating: 5,
  },
  {
    quote:
      "Finally an HR platform built for African businesses — the leave management alone is worth every kobo.",
    name: "Emeka Eze",
    title: "HR Director, Dangote Group",
    avatar: "EE",
    color: T.cyan,
    rating: 5,
  },
  {
    quote:
      "Our team of 300 now manage their own HR needs. We've reduced admin overhead by 60%.",
    name: "Fatima Bello",
    title: "COO, Kuda Bank",
    avatar: "FB",
    color: "#10B981",
    rating: 5,
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "₦15,000",
    per: "/ month",
    desc: "Perfect for growing teams up to 50 employees.",
    features: [
      "Up to 50 employees",
      "Core HR & Attendance",
      "Payroll processing",
      "Leave management",
      "Email support",
    ],
    cta: "Request Demo",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "₦35,000",
    per: "/ month",
    desc: "The complete HRIS suite for scaling businesses.",
    features: [
      "Up to 250 employees",
      "Everything in Starter",
      "Performance management",
      "Training & development",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Request Demo",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    per: "",
    desc: "Tailored solutions for large organisations.",
    features: [
      "Unlimited employees",
      "Everything in Growth",
      "Custom integrations",
      "Dedicated CSM",
      "SLA guarantee",
      "On-site training",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

// ── Helpers ───────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.12 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, visible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 80);
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const goDemo = () => navigate("/request-demo");

  const NAV = ["Features", "Pricing", "Testimonials", "About"];

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Sora', system-ui, sans-serif",
        color: T.text,
        background: T.white,
        overflowX: "hidden",
      }}
    >
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* ════════════════════════════════════
          NAVBAR
      ════════════════════════════════════ */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: scrolled ? "rgba(15,22,41,0.97)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? `1px solid rgba(255,255,255,0.08)` : "none",
          transition: "all 0.3s ease",
          padding: "0 1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            height: 68,
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg,#6366F1,#4F46E5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={18} color="#fff" />
            </div>
            <span
              style={{
                fontFamily: "Sora,sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color: "#fff",
                letterSpacing: "-0.3px",
              }}
            >
              HRISCloud
            </span>
          </div>

          {/* Desktop nav links */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
              marginLeft: 24,
              flex: 1,
            }}
            className="desktop-nav"
          >
            {NAV.map((n) => (
              <a
                key={n}
                href={`#${n.toLowerCase()}`}
                style={{
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 500,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) =>
                  (e.target.style.color = "rgba(255,255,255,0.7)")
                }
              >
                {n}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginLeft: "auto",
            }}
          >
            <a
              href="/login"
              style={{
                color: "rgba(255,255,255,0.75)",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
                display: "none",
              }}
              className="desktop-login"
            >
              Sign In
            </a>
            <button
              onClick={goDemo}
              style={{
                background: T.indigo,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 22px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: `0 4px 14px rgba(79,70,229,0.4)`,
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = `0 6px 20px rgba(79,70,229,0.5)`;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = `0 4px 14px rgba(79,70,229,0.4)`;
              }}
            >
              Request a Demo
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((p) => !p)}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: 8,
                padding: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
              className="mobile-menu-btn"
            >
              {menuOpen ? (
                <X size={20} color="#fff" />
              ) : (
                <Menu size={20} color="#fff" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            style={{
              background: T.navyMid,
              borderTop: `1px solid rgba(255,255,255,0.08)`,
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {NAV.map((n) => (
              <a
                key={n}
                href={`#${n.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                style={{
                  color: "rgba(255,255,255,0.8)",
                  textDecoration: "none",
                  fontSize: 16,
                  fontWeight: 500,
                  padding: "12px 0",
                  borderBottom: `1px solid rgba(255,255,255,0.06)`,
                }}
              >
                {n}
              </a>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false);
                goDemo();
              }}
              style={{
                marginTop: 16,
                background: T.indigo,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "14px 0",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Request a Demo
            </button>
          </div>
        )}
      </nav>

      {/* ════════════════════════════════════
          HERO
      ════════════════════════════════════ */}
      <section
        style={{
          background: `linear-gradient(150deg, ${T.navy} 0%, ${T.navyMid} 60%, ${T.navyLight} 100%)`,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 1.5rem 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorative circles */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "-5%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(79,70,229,0.15), transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            left: "-8%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(6,182,212,0.12), transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 860,
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(79,70,229,0.2)",
              border: "1px solid rgba(99,102,241,0.35)",
              borderRadius: 100,
              padding: "6px 16px",
              marginBottom: 32,
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(-16px)",
              transition: "all 0.6s ease 0.1s",
            }}
          >
            <Zap size={12} color={T.cyan} />
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: T.cyan,
                letterSpacing: "0.04em",
              }}
            >
              BUILT FOR AFRICAN BUSINESSES
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "Sora, sans-serif",
              fontSize: "clamp(2.4rem, 6vw, 4.2rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              color: "#fff",
              margin: "0 0 24px",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(24px)",
              transition: "all 0.7s ease 0.2s",
            }}
          >
            The HR Platform That{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${T.indigoLight}, ${T.cyan})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Actually Works
            </span>{" "}
            for Your Business
          </h1>

          {/* Sub */}
          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.7,
              maxWidth: 620,
              margin: "0 auto 48px",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(24px)",
              transition: "all 0.7s ease 0.35s",
            }}
          >
            Automate payroll, manage attendance, track performance, and empower
            your people — all in one modern HRIS built for Nigeria and Africa.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              flexWrap: "wrap",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(24px)",
              transition: "all 0.7s ease 0.5s",
            }}
          >
            <button
              onClick={goDemo}
              style={{
                background: T.indigo,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "16px 36px",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: `0 8px 28px rgba(79,70,229,0.5)`,
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 12px 36px rgba(79,70,229,0.6)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 8px 28px rgba(79,70,229,0.5)`;
              }}
            >
              Request a Demo <ArrowRight size={17} />
            </button>
            <button
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 12,
                padding: "16px 32px",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                backdropFilter: "blur(8px)",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.14)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
              }
            >
              <Play size={15} /> Watch 2-min Tour
            </button>
          </div>

          {/* Trust bar */}
          <div
            style={{
              marginTop: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 32,
              flexWrap: "wrap",
              opacity: heroVisible ? 0.75 : 0,
              transition: "opacity 0.8s ease 0.8s",
            }}
          >
            {[
              "Secure & Compliant",
              "NDPR Ready",
              "99.9% Uptime",
              "No Setup Fee",
            ].map((t) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 13,
                }}
              >
                <CheckCircle2 size={14} color={T.success} />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          STATS BAND
      ════════════════════════════════════ */}
      <section style={{ background: T.indigo, padding: "56px 1.5rem" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 32,
          }}
        >
          {STATS.map(({ value, label }, i) => (
            <Reveal key={label} delay={i * 80}>
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    fontFamily: "Sora,sans-serif",
                    fontSize: "clamp(2.2rem,4vw,3rem)",
                    fontWeight: 800,
                    color: "#fff",
                    margin: "0 0 6px",
                    letterSpacing: "-1px",
                  }}
                >
                  {value}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.7)",
                    margin: 0,
                  }}
                >
                  {label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════
          FEATURES
      ════════════════════════════════════ */}
      <section
        id="features"
        style={{ background: T.offWhite, padding: "100px 1.5rem" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: T.indigo,
                  textTransform: "uppercase",
                }}
              >
                Everything You Need
              </span>
              <h2
                style={{
                  fontFamily: "Sora,sans-serif",
                  fontSize: "clamp(1.8rem,3.5vw,2.8rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.8px",
                  margin: "12px 0 16px",
                  color: T.navy,
                }}
              >
                One Platform. Every HR Function.
              </h2>
              <p
                style={{
                  fontSize: 17,
                  color: T.textMid,
                  maxWidth: 540,
                  margin: "0 auto",
                  lineHeight: 1.7,
                }}
              >
                From hire to retire — HRISCloud handles every step of the
                employee lifecycle with intelligence and ease.
              </p>
            </div>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 24,
            }}
          >
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <Reveal key={title} delay={i * 60}>
                <div
                  style={{
                    background: T.white,
                    borderRadius: 20,
                    padding: "32px 28px",
                    border: `1px solid ${T.border}`,
                    boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 12px 40px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 16px rgba(0,0,0,0.05)";
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 20,
                    }}
                  >
                    <Icon size={24} color={color} />
                  </div>
                  <h3
                    style={{
                      fontFamily: "Sora,sans-serif",
                      fontSize: 18,
                      fontWeight: 700,
                      color: T.navy,
                      margin: "0 0 10px",
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontSize: 15,
                      color: T.textMid,
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {desc}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      marginTop: 20,
                      color,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Learn more <ChevronRight size={14} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════ */}
      <section style={{ background: T.white, padding: "100px 1.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 72 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: T.indigo,
                  textTransform: "uppercase",
                }}
              >
                Simple Onboarding
              </span>
              <h2
                style={{
                  fontFamily: "Sora,sans-serif",
                  fontSize: "clamp(1.8rem,3.5vw,2.8rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.8px",
                  margin: "12px 0 0",
                  color: T.navy,
                }}
              >
                Up and Running in 48 Hours
              </h2>
            </div>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 40,
            }}
          >
            {[
              {
                step: "01",
                title: "Book Your Demo",
                desc: "Schedule a personalised walkthrough with an HR technology expert.",
                icon: Calendar,
                color: T.indigo,
              },
              {
                step: "02",
                title: "Configure & Import",
                desc: "We help migrate your existing employee data — zero spreadsheet chaos.",
                icon: Globe,
                color: T.cyan,
              },
              {
                step: "03",
                title: "Train Your Team",
                desc: "Intuitive interface means your HR team is productive from day one.",
                icon: Award,
                color: T.success,
              },
              {
                step: "04",
                title: "Scale Confidently",
                desc: "From 10 to 10,000 employees — HRISCloud scales with your ambition.",
                icon: TrendingUp,
                color: "#F59E0B",
              },
            ].map(({ step, title, desc, icon: Icon, color }, i) => (
              <Reveal key={step} delay={i * 80}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      position: "relative",
                      display: "inline-flex",
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 18,
                        background: color + "15",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={28} color={color} />
                    </div>
                    <span
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: color,
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "Sora,sans-serif",
                      }}
                    >
                      {step.slice(1)}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: "Sora,sans-serif",
                      fontSize: 17,
                      fontWeight: 700,
                      color: T.navy,
                      margin: "0 0 10px",
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: T.textMuted,
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════ */}
      <section
        id="testimonials"
        style={{
          background: `linear-gradient(160deg, ${T.navy} 0%, ${T.navyMid} 100%)`,
          padding: "100px 1.5rem",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: T.cyan,
                  textTransform: "uppercase",
                }}
              >
                Customer Stories
              </span>
              <h2
                style={{
                  fontFamily: "Sora,sans-serif",
                  fontSize: "clamp(1.8rem,3.5vw,2.8rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.8px",
                  margin: "12px 0 0",
                  color: "#fff",
                }}
              >
                Trusted by Leading African Businesses
              </h2>
            </div>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 24,
            }}
          >
            {TESTIMONIALS.map(
              ({ quote, name, title, avatar, color, rating }, i) => (
                <Reveal key={name} delay={i * 80}>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      borderRadius: 20,
                      padding: "32px 28px",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div style={{ display: "flex", gap: 3, marginBottom: 20 }}>
                      {Array(rating)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            color="#F59E0B"
                            fill="#F59E0B"
                          />
                        ))}
                    </div>
                    <p
                      style={{
                        fontSize: 16,
                        color: "rgba(255,255,255,0.85)",
                        lineHeight: 1.75,
                        margin: "0 0 28px",
                        fontStyle: "italic",
                      }}
                    >
                      "{quote}"
                    </p>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          background: color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: 13,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {avatar}
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#fff",
                            margin: 0,
                          }}
                        >
                          {name}
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.5)",
                            margin: 0,
                          }}
                        >
                          {title}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          PRICING
      ════════════════════════════════════ */}
      <section
        id="pricing"
        style={{ background: T.offWhite, padding: "100px 1.5rem" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: T.indigo,
                  textTransform: "uppercase",
                }}
              >
                Transparent Pricing
              </span>
              <h2
                style={{
                  fontFamily: "Sora,sans-serif",
                  fontSize: "clamp(1.8rem,3.5vw,2.8rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.8px",
                  margin: "12px 0 16px",
                  color: T.navy,
                }}
              >
                Simple, Honest Pricing
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: T.textMid,
                  maxWidth: 460,
                  margin: "0 auto",
                }}
              >
                No hidden fees. No per-seat surprises. Cancel anytime.
              </p>
            </div>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
              alignItems: "start",
            }}
          >
            {PLANS.map(
              (
                { name, price, per, desc, features, cta, highlighted, badge },
                i,
              ) => (
                <Reveal key={name} delay={i * 80}>
                  <div
                    style={{
                      background: highlighted ? T.navy : T.white,
                      border: highlighted
                        ? "2px solid #4F46E5"
                        : `1px solid ${T.border}`,
                      borderRadius: 24,
                      padding: "40px 32px",
                      position: "relative",
                      boxShadow: highlighted
                        ? "0 20px 60px rgba(79,70,229,0.25)"
                        : "0 2px 16px rgba(0,0,0,0.05)",
                      transition: "transform 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "translateY(-4px)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    {badge && (
                      <div
                        style={{
                          position: "absolute",
                          top: -14,
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: T.indigo,
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 100,
                          padding: "4px 16px",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {badge}
                      </div>
                    )}
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: highlighted ? T.cyan : T.indigo,
                        margin: "0 0 8px",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {name}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 4,
                        margin: "0 0 8px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Sora,sans-serif",
                          fontSize: "clamp(2rem,4vw,2.8rem)",
                          fontWeight: 800,
                          color: highlighted ? "#fff" : T.navy,
                        }}
                      >
                        {price}
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          color: highlighted
                            ? "rgba(255,255,255,0.5)"
                            : T.textMuted,
                        }}
                      >
                        {per}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        color: highlighted
                          ? "rgba(255,255,255,0.6)"
                          : T.textMuted,
                        margin: "0 0 28px",
                        lineHeight: 1.6,
                      }}
                    >
                      {desc}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        marginBottom: 32,
                      }}
                    >
                      {features.map((f) => (
                        <div
                          key={f}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            fontSize: 14,
                            color: highlighted
                              ? "rgba(255,255,255,0.85)"
                              : T.textMid,
                          }}
                        >
                          <Check
                            size={15}
                            color={highlighted ? T.cyan : T.success}
                            style={{ flexShrink: 0 }}
                          />
                          {f}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={goDemo}
                      style={{
                        width: "100%",
                        padding: "14px 0",
                        borderRadius: 12,
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: "pointer",
                        border: "none",
                        background: highlighted ? T.indigo : "transparent",
                        color: highlighted ? "#fff" : T.indigo,
                        border: highlighted ? "none" : `2px solid ${T.indigo}`,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!highlighted) {
                          e.currentTarget.style.background = T.indigoPale;
                        } else {
                          e.currentTarget.style.opacity = "0.9";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!highlighted) {
                          e.currentTarget.style.background = "transparent";
                        } else {
                          e.currentTarget.style.opacity = "1";
                        }
                      }}
                    >
                      {cta}
                    </button>
                  </div>
                </Reveal>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          FINAL CTA
      ════════════════════════════════════ */}
      <section
        style={{
          background: `linear-gradient(135deg, ${T.indigo}, #6366F1, ${T.cyan})`,
          padding: "100px 1.5rem",
          textAlign: "center",
        }}
      >
        <Reveal>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <h2
              style={{
                fontFamily: "Sora,sans-serif",
                fontSize: "clamp(2rem,4vw,3rem)",
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.8px",
                margin: "0 0 20px",
              }}
            >
              Ready to Transform Your HR?
            </h2>
            <p
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.8)",
                margin: "0 0 40px",
                lineHeight: 1.7,
              }}
            >
              Join 500+ companies using HRISCloud to build happier, more
              productive teams.
            </p>
            <button
              onClick={goDemo}
              style={{
                background: "#fff",
                color: T.indigo,
                border: "none",
                borderRadius: 14,
                padding: "18px 44px",
                fontSize: 17,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
                transition: "transform 0.2s, box-shadow 0.2s",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 14px 40px rgba(0,0,0,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.2)";
              }}
            >
              Request Your Free Demo <ArrowRight size={18} />
            </button>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.6)",
                marginTop: 16,
              }}
            >
              No credit card required · Set up in 48 hours
            </p>
          </div>
        </Reveal>
      </section>

      {/* ════════════════════════════════════
          FOOTER
      ════════════════════════════════════ */}
      <footer style={{ background: T.navy, padding: "56px 1.5rem 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 40,
              marginBottom: 48,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: T.indigo,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Shield size={16} color="#fff" />
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
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                The all-in-one HR platform built for African businesses.
              </p>
            </div>
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Security", "Changelog"],
              },
              {
                title: "Company",
                links: ["About Us", "Careers", "Blog", "Press"],
              },
              {
                title: "Support",
                links: [
                  "Help Centre",
                  "Contact Us",
                  "Status",
                  "Privacy Policy",
                ],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    margin: "0 0 16px",
                  }}
                >
                  {title}
                </p>
                {links.map((l) => (
                  <a
                    key={l}
                    href="#"
                    style={{
                      display: "block",
                      fontSize: 14,
                      color: "rgba(255,255,255,0.6)",
                      textDecoration: "none",
                      marginBottom: 10,
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#fff")}
                    onMouseLeave={(e) =>
                      (e.target.style.color = "rgba(255,255,255,0.6)")
                    }
                  >
                    {l}
                  </a>
                ))}
              </div>
            ))}
          </div>
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.35)",
                margin: 0,
              }}
            >
              © {new Date().getFullYear()} HRISCloud Ltd. All rights reserved.
            </p>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.35)",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              Made with <Heart size={12} color="#EC4899" fill="#EC4899" /> in
              Lagos, Nigeria
            </p>
          </div>
        </div>
      </footer>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-login { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
          .desktop-login { display: block !important; }
        }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
