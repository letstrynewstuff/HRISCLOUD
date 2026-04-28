// src/pages/LandingPage.jsx
// BantaHR — All-in-one HRIS for African businesses
// No login link — only "Request a Demo"

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import BantaHRLogo from "../styles/BantaHRLogo";
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
  MessageSquare,
  Bell,
  UserCheck,
  FolderOpen,
  PieChart,
} from "lucide-react";

const T = {
  navy: "#0F1629",
  navyMid: "#1A2545",
  navyLight: "#243058",
  indigo: "#4F46E5",
  indigoLight: "#6366F1",
  indigoPale: "#EEF2FF",
  cyan: "#06B6D4",
  teal: "#0D9488",
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

const FEATURES = [
  {
    icon: Users,
    title: "Employee Management",
    desc: "Centralise every employee record — contracts, role history, org charts, onboarding checklists and offboarding flows — in one secure hub. HR admins get full visibility; employees can view and request updates to their own profiles.",
    color: T.indigo,
    bg: T.indigoPale,
  },
  {
    icon: Clock,
    title: "Attendance & Leave",
    desc: "Real-time clock-in with location awareness, automated leave balance calculations, and intelligent approval workflows. Managers approve or decline leave requests in one tap, and the system updates balances instantly.",
    color: T.cyan,
    bg: "#ECFEFF",
  },
  {
    icon: DollarSign,
    title: "Payroll Processing",
    desc: "Run fully compliant Nigerian payroll in minutes — PAYE, pension (PFA), NHF, and NSITF all automated. Generate payslips, process bulk payments, and stay audit-ready with detailed payroll reports every cycle.",
    color: T.success,
    bg: "#D1FAE5",
  },
  {
    icon: TrendingUp,
    title: "Performance Management",
    desc: "Set team and individual OKRs, run structured appraisal cycles, and track employee growth with real-time dashboards. Managers give continuous feedback; employees see exactly where they stand and what to improve.",
    color: "#F59E0B",
    bg: "#FEF3C7",
  },
  {
    icon: FileText,
    title: "Document Management",
    desc: "Create, send, and e-sign offer letters, contracts, and HR policy documents digitally. Employees receive documents in their portal, sign electronically, and all records are stored securely with full audit trails.",
    color: "#8B5CF6",
    bg: "#EDE9FE",
  },
  {
    icon: BarChart2,
    title: "HR Analytics",
    desc: "Live dashboards that turn your workforce data into strategic decisions — headcount trends, attrition rates, department costs, and custom reports. Export to PDF or Excel for board-level presentations.",
    color: "#EC4899",
    bg: "#FDF2F8",
  },
  {
    icon: MessageSquare,
    title: "Team Chat",
    desc: "Built-in messaging so your workforce stays connected. Managers create team channels for group announcements; employees send direct messages and share documents — all within the same platform, no external tools needed.",
    color: "#F97316",
    bg: "#FFF7ED",
  },
  {
    icon: Bell,
    title: "Announcements",
    desc: "HR admins broadcast company-wide or department-specific announcements with rich text, file attachments, and scheduled publishing. Pin important notices so they stay visible, and track who has read each announcement.",
    color: T.teal,
    bg: "#F0FDFA",
  },
  {
    icon: UserCheck,
    title: "Offboarding",
    desc: "Structure every exit with automated offboarding checklists — asset returns, system access revocation, exit interviews, and final payroll. Reduce admin chaos and ensure every departure is handled professionally.",
    color: "#6366F1",
    bg: "#EEF2FF",
  },
];

const STATS = [
  { value: "500+", label: "Companies onboarded" },
  { value: "95%", label: "Customer satisfaction" },
  { value: "40%", label: "HR time saved" },
  { value: "₦2B+", label: "Payroll processed" },
];

const TESTIMONIALS = [
  {
    quote:
      "BantaHR cut our monthly payroll processing from 3 days to 45 minutes. The ROI was immediate.",
    name: "Adaeze Okonkwo",
    // title: "Head of People Operations, Flutterwave",
    avatar: "AO",
    color: T.indigo,
    rating: 5,
  },
  {
    quote:
      "Finally an HR platform built for African businesses — the leave management alone is worth every kobo.",
    name: "Emeka Eze",
    // title: "HR Director, Da",
    avatar: "EE",
    color: T.cyan,
    rating: 5,
  },
  {
    quote:
      "Our team of 300 now manages their own HR needs. We've reduced admin overhead by 60%.",
    name: "Fatima Bello",
    // title: "COO, Kuda Bank",
    avatar: "FB",
    color: "#10B981",
    rating: 5,
  },
];

// ₦1,000 per employee per month · Custom Enterprise
const PLANS = [
  {
    name: "Growth",
    price: "₦1,000",
    per: "/ employee / month",
    minNote: "Minimum 1 employees",
    desc: "Everything your growing team needs to run HR professionally.",
    // example: "e.g. 50 employees = ₦50,000/mo",
    features: [
      "Unlimited employees (min. 10)",
      "Employee Management",
      "Attendance & Leave",
      "Payroll Processing",
      "Document Management",
      "Team Chat & Announcements",
      "HR Analytics Dashboard",
      "Email & chat support",
    ],
    cta: "Request Demo",
    highlighted: true,
    badge: "Simple Pricing",
  },
  {
    name: "Enterprise",
    price: "Let's Talk",
    per: "",
    // minNote: "For 500+ employees",
    desc: "Custom contracts, SLA guarantees, and dedicated support for large organisations.",
    example: "Volume discounts available",
    features: [
      "Everything in Growth",
      "Custom integrations & API access",
      "Dedicated Customer Success Manager",
      "SLA guarantee (99.9% uptime)",
      "On-site training & onboarding",
      "Custom reporting & exports",
      "Multi-entity / subsidiary support",
      "Priority 24/7 support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 },
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
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const goDemo = () => navigate("/request-demo");
  const NAV = ["Features", "Pricing", "Testimonials", "About"];

  return (
    <div
      style={{
        fontFamily: "'DM Sans','Sora',system-ui,sans-serif",
        color: T.text,
        background: T.white,
        overflowX: "hidden",
      }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Sora:wght@600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* ── NAVBAR ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: scrolled ? "rgba(15,22,41,0.97)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
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
          {/* Logo — actual image, sized to fit */}
          {/* <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <img
              src={logoImg}
              alt="BantaHR"
              style={{ height: 42, width: "auto", objectFit: "contain" }}
            />
          </div> */}
          <BantaHRLogo variant="light" size="md" />

          {/* Desktop nav */}
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

          {/* CTA — Request Demo only, no login */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginLeft: "auto",
            }}
          >
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
                boxShadow: "0 4px 14px rgba(79,70,229,0.4)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 6px 20px rgba(79,70,229,0.5)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 14px rgba(79,70,229,0.4)";
              }}
            >
              Request a Demo
            </button>

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
              borderTop: "1px solid rgba(255,255,255,0.08)",
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
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
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

      {/* ── HERO ── */}
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
        {/* Background decorations */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "-5%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(79,70,229,0.15),transparent 70%)",
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
            background:
              "radial-gradient(circle,rgba(6,182,212,0.12),transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
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
              fontFamily: "Sora,sans-serif",
              fontSize: "clamp(2.4rem,6vw,4.2rem)",
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
                background: `linear-gradient(135deg,${T.indigoLight},${T.cyan})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Actually Works
            </span>{" "}
            for Your Business
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem,2vw,1.2rem)",
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

          {/* Single CTA */}
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
                boxShadow: "0 8px 28px rgba(79,70,229,0.5)",
                transition: "transform 0.2s,box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 36px rgba(79,70,229,0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 28px rgba(79,70,229,0.5)";
              }}
            >
              Request a Demo <ArrowRight size={17} />
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

      {/* ── STATS BAND ── */}
      <section style={{ background: T.indigo, padding: "56px 1.5rem" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
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

      {/* ── FEATURES / ABOUT ── */}
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
                From hire to retire — BantaHR handles every step of the employee
                lifecycle with intelligence and ease.
              </p>
            </div>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
              gap: 24,
            }}
          >
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <Reveal key={title} delay={i * 50}>
                <div
                  style={{
                    background: T.white,
                    borderRadius: 20,
                    padding: "32px 28px",
                    border: `1px solid ${T.border}`,
                    boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                    transition: "transform 0.2s,box-shadow 0.2s",
                    cursor: "default",
                    height: "100%",
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
                      fontSize: 14,
                      color: T.textMid,
                      lineHeight: 1.75,
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

      {/* ── HOW IT WORKS ── */}
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
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: 40,
            }}
          >
            {[
              {
                step: "01",
                title: "Book Your Demo",
                desc: "Schedule a personalised walkthrough with our team.",
                icon: Calendar,
                color: T.indigo,
              },
              {
                step: "02",
                title: "We Set You Up",
                desc: "We handle your data migration and company configuration — zero spreadsheet chaos.",
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
                desc: "From 10 to 10,000 employees — BantaHR grows with your ambition.",
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
                        background: color + "18",
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
                      {step}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: "Sora,sans-serif",
                      fontSize: 17,
                      fontWeight: 700,
                      color: T.navy,
                      margin: "0 0 8px",
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: T.textMid,
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

      {/* ── TESTIMONIALS ── */}
      <section
        id="testimonials"
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
                Social Proof
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
                Trusted by HR Teams Across Africa
              </h2>
            </div>
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
              gap: 24,
            }}
          >
            {TESTIMONIALS.map(
              ({ quote, name, title, avatar, color, rating }, i) => (
                <Reveal key={name} delay={i * 80}>
                  <div
                    style={{
                      background: T.white,
                      borderRadius: 20,
                      padding: "32px 28px",
                      border: `1px solid ${T.border}`,
                      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                      {Array.from({ length: rating }).map((_, j) => (
                        <Star
                          key={j}
                          size={15}
                          fill="#F59E0B"
                          color="#F59E0B"
                        />
                      ))}
                    </div>
                    <p
                      style={{
                        fontSize: 15,
                        color: T.textMid,
                        lineHeight: 1.75,
                        margin: "0 0 24px",
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
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          background: color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {avatar}
                      </div>
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontWeight: 700,
                            fontSize: 14,
                            color: T.navy,
                          }}
                        >
                          {name}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            color: T.textMuted,
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

      {/* ── PRICING ── */}
      <section
        id="pricing"
        style={{ background: T.white, padding: "100px 1.5rem" }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
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
                Pay for What You Use
              </h2>
              <p
                style={{
                  fontSize: 17,
                  color: T.textMid,
                  maxWidth: 460,
                  margin: "0 auto",
                  lineHeight: 1.7,
                }}
              >
                Simple per-employee pricing — no hidden fees, no long-term
                lock-in. The bigger your team, the more you save.
              </p>
            </div>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
              gap: 28,
              alignItems: "start",
            }}
          >
            {PLANS.map(
              (
                {
                  name,
                  price,
                  per,
                  minNote,
                  desc,
                  example,
                  features,
                  cta,
                  highlighted,
                  badge,
                },
                i,
              ) => (
                <Reveal key={name} delay={i * 80}>
                  <div
                    style={{
                      borderRadius: 24,
                      padding: "36px 32px",
                      background: highlighted
                        ? `linear-gradient(145deg,${T.navy},${T.navyMid})`
                        : T.white,
                      border: highlighted ? "none" : `1px solid ${T.border}`,
                      boxShadow: highlighted
                        ? "0 24px 64px rgba(15,22,41,0.35)"
                        : "0 4px 20px rgba(0,0,0,0.06)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Decorative glow for highlighted */}
                    {highlighted && (
                      <div
                        style={{
                          position: "absolute",
                          top: -60,
                          right: -60,
                          width: 200,
                          height: 200,
                          borderRadius: "50%",
                          background:
                            "radial-gradient(circle,rgba(79,70,229,0.3),transparent 70%)",
                          pointerEvents: "none",
                        }}
                      />
                    )}
                    {badge && (
                      <div
                        style={{
                          position: "absolute",
                          top: 20,
                          right: 20,
                          background: `linear-gradient(135deg,${T.indigo},${T.cyan})`,
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "4px 12px",
                          borderRadius: 100,
                        }}
                      >
                        {badge}
                      </div>
                    )}
                    <p
                      style={{
                        fontFamily: "Sora,sans-serif",
                        fontSize: 20,
                        fontWeight: 800,
                        color: highlighted ? "#fff" : T.navy,
                        margin: "0 0 4px",
                      }}
                    >
                      {name}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: highlighted
                          ? "rgba(255,255,255,0.6)"
                          : T.textMuted,
                        margin: "0 0 20px",
                      }}
                    >
                      {desc}
                    </p>

                    {/* Price */}
                    <div style={{ marginBottom: 6 }}>
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
                      {per && (
                        <span
                          style={{
                            fontSize: 14,
                            color: highlighted
                              ? "rgba(255,255,255,0.6)"
                              : T.textMuted,
                            marginLeft: 4,
                          }}
                        >
                          {per}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: 12,
                        color: highlighted ? T.cyan : T.indigo,
                        fontWeight: 600,
                        margin: "0 0 4px",
                      }}
                    >
                      {minNote}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: highlighted
                          ? "rgba(255,255,255,0.5)"
                          : T.textMuted,
                        margin: "0 0 28px",
                        fontStyle: "italic",
                      }}
                    >
                      {example}
                    </p>

                    {/* Features */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
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
                          }}
                        >
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              background: highlighted
                                ? "rgba(16,185,129,0.2)"
                                : (T.successLight ?? "#D1FAE5"),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Check
                              size={11}
                              color={T.success}
                              strokeWidth={3}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 13,
                              color: highlighted
                                ? "rgba(255,255,255,0.8)"
                                : T.textMid,
                            }}
                          >
                            {f}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={goDemo}
                      style={{
                        width: "100%",
                        padding: "14px 0",
                        borderRadius: 12,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        background: highlighted ? T.indigo : "transparent",
                        color: highlighted ? "#fff" : T.indigo,
                        border: highlighted ? "none" : `2px solid ${T.indigo}`,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "0.88";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                    >
                      {cta}
                    </button>
                  </div>
                </Reveal>
              ),
            )}
          </div>

          {/* Pricing note */}
          <Reveal delay={200}>
            <p
              style={{
                textAlign: "center",
                fontSize: 14,
                color: T.textMuted,
                marginTop: 32,
                lineHeight: 1.7,
              }}
            >
              All plans include free onboarding by our team. No debit card
              required to start. Cancel anytime.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section
        id="about"
        style={{
          background: `linear-gradient(135deg,${T.navy},${T.navyMid})`,
          padding: "100px 1.5rem",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              {/* Logo in about section */}
              {/* <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 28,
                }}
              >
                <img
                  src={logoImg}
                  alt="BantaHR"
                  style={{ height: 56, width: "auto", objectFit: "contain" }}
                />
              </div> */}
              <div style={{ marginBottom: 16 }}>
                <BantaHRLogo variant="light" size="md" />
              </div>
              <h2
                style={{
                  fontFamily: "Sora,sans-serif",
                  fontSize: "clamp(1.8rem,3.5vw,2.6rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.8px",
                  color: "#fff",
                  margin: "0 0 20px",
                }}
              >
                Why We Built BantaHR
              </h2>
              <p
                style={{
                  fontSize: 17,
                  color: "rgba(255,255,255,0.7)",
                  maxWidth: 680,
                  margin: "0 auto",
                  lineHeight: 1.8,
                }}
              >
                Nigerian and African businesses deserve HR software built for
                their reality — not adapted from tools designed for Silicon
                Valley. We built BantaHR from the ground up for local payroll
                laws, local compliance requirements, and the way African teams
                actually work.
              </p>
            </div>
          </Reveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
              gap: 24,
            }}
          >
            {[
              {
                icon: Shield,
                title: "Security First",
                desc: "Bank-grade encryption, NDPR compliance, and role-based access control keep your sensitive employee data locked tight.",
                color: T.cyan,
              },
              {
                icon: Globe,
                title: "Built for Africa",
                desc: "Nigerian PAYE, pension fund deductions, NHF, and NSITF are built in — not bolt-ons. We know local compliance because we live it.",
                color: "#F59E0B",
              },
              {
                icon: Users,
                title: "People Obsessed",
                desc: "Every feature is designed around the employee experience — not just HR admin efficiency. Happy employees, better retention.",
                color: T.success,
              },
              {
                icon: Zap,
                title: "Always Improving",
                desc: "We ship updates every two weeks based on customer feedback. If you need a feature, tell us — it's probably already on the roadmap.",
                color: "#EC4899",
              },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <Reveal key={title} delay={i * 70}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 20,
                    padding: "28px 24px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: color + "20",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Icon size={22} color={color} />
                  </div>
                  <h3
                    style={{
                      fontFamily: "Sora,sans-serif",
                      fontSize: 17,
                      fontWeight: 700,
                      color: "#fff",
                      margin: "0 0 8px",
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.6)",
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

      {/* ── FINAL CTA ── */}
      <section
        style={{
          background: `linear-gradient(135deg,${T.indigo},#6366F1,${T.cyan})`,
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
              Join 500+ companies using BantaHR to build happier, more
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
                transition: "transform 0.2s,box-shadow 0.2s",
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
              No debit card required · Set up in 48 hours · We handle
              onboarding
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: T.navy, padding: "56px 1.5rem 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: 40,
              marginBottom: 48,
            }}
          >
            <div>
              {/* <div style={{ marginBottom: 16 }}>
                <img
                  src={logoImg}
                  alt="BantaHR"
                  style={{ height: 40, width: "auto", objectFit: "contain" }}
                />
              </div> */}
              <div style={{ marginBottom: 16 }}>
                <BantaHRLogo variant="light" size="md" />
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
              © {new Date().getFullYear()} BantaHR Ltd. All rights reserved.
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

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
