// src/pages/LandingPage.jsx
// BantaHR — All-in-one HRIS for African businesses
// No login link — only "Request a Demo"
//
// Rebranded onto the token layer (see REBRAND-MIGRATION.md). Styling lives in
// src/styles/marketing.css; this file holds content and behaviour only.
// Reference mockup: design/marketing-mockup.html

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  Users,
  Clock,
  TrendingUp,
  Shield,
  Globe,
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
  MessageSquare,
  Bell,
  UserCheck,
  Wallet,
  ChevronRight,
} from "lucide-react";

import "../styles/marketing.css";

const NAV = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "About", href: "#about" },
];

const FEATURES = [
  {
    icon: Users,
    title: "Employee Management",
    desc: "Centralise every employee record: contracts, role history, org charts, onboarding checklists and offboarding flows, all in one secure hub. HR admins get full visibility; employees can view and request updates to their own profiles.",
  },
  {
    icon: Clock,
    title: "Attendance & Leave",
    desc: "Real-time clock-in with location awareness, automated leave balance calculations, and intelligent approval workflows. Managers approve or decline leave requests in one tap, and the system updates balances instantly.",
  },
  {
    icon: Wallet,
    title: "Payroll Processing",
    desc: "Run fully compliant Nigerian payroll in minutes. PAYE, pension (PFA), NHF, and NSITF all automated. Generate payslips, process bulk payments, and stay audit-ready with detailed payroll reports every cycle.",
  },
  {
    icon: TrendingUp,
    title: "Performance Management",
    desc: "Set team and individual OKRs, run structured appraisal cycles, and track employee growth with real-time dashboards. Managers give continuous feedback; employees see exactly where they stand and what to improve.",
  },
  {
    icon: FileText,
    title: "Document Management",
    desc: "Create, send, and e-sign offer letters, contracts, and HR policy documents digitally. Employees receive documents in their portal, sign electronically, and all records are stored securely with full audit trails.",
  },
  {
    icon: BarChart2,
    title: "HR Analytics",
    desc: "Live dashboards that turn your workforce data into strategic decisions: headcount trends, attrition rates, department costs, and custom reports. Export to PDF or Excel for board-level presentations.",
  },
  {
    icon: MessageSquare,
    title: "Team Chat",
    desc: "Built-in messaging so your workforce stays connected. Managers create team channels for group announcements; employees send direct messages and share documents, all within the same platform, no external tools needed.",
  },
  {
    icon: Bell,
    title: "Announcements",
    desc: "HR admins broadcast company-wide or department-specific announcements with rich text, file attachments, and scheduled publishing. Pin important notices so they stay visible, and track who has read each announcement.",
  },
  {
    icon: UserCheck,
    title: "Offboarding",
    desc: "Structure every exit with automated offboarding checklists: asset returns, system access revocation, exit interviews, and final payroll. Reduce admin chaos and ensure every departure is handled professionally.",
  },
];

const STATS = [
  { value: "500+", label: "Companies onboarded" },
  { value: "95%", label: "Customer satisfaction" },
  { value: "40%", label: "HR time saved" },
  { value: "₦2B+", label: "Payroll processed" },
];

const STEPS = [
  {
    step: "01",
    title: "Book Your Demo",
    desc: "Schedule a personalised walkthrough with our team.",
    icon: Calendar,
  },
  {
    step: "02",
    title: "We Set You Up",
    desc: "We handle your data migration and company configuration, with zero spreadsheet chaos.",
    icon: Globe,
  },
  {
    step: "03",
    title: "Train Your Team",
    desc: "Intuitive interface means your HR team is productive from day one.",
    icon: Award,
  },
  {
    step: "04",
    title: "Scale Confidently",
    desc: "From 10 to 10,000 employees, BantaHR grows with your ambition.",
    icon: TrendingUp,
  },
];

const TESTIMONIALS = [
  {
    quote:
      "BantaHR cut our monthly payroll processing from 3 days to 45 minutes. The ROI was immediate.",
    name: "Adaeze Okonkwo",
    avatar: "AO",
    rating: 5,
  },
  {
    quote:
      "Finally an HR platform built for African businesses. The leave management alone is worth every kobo.",
    name: "Emeka Eze",
    avatar: "EE",
    rating: 5,
  },
  {
    quote:
      "Our team of 300 now manages their own HR needs. We've reduced admin overhead by 60%.",
    name: "Fatima Bello",
    avatar: "FB",
    rating: 5,
  },
];

const PLANS = [
  {
    name: "Growth",
    desc: "Everything your growing team needs to run HR professionally.",
    was: "₦1,259",
    price: "₦989",
    per: "/ employee / month",
    minNote: "Minimum 1 employee",
    features: [
      "Unlimited employees (min. 1)",
      "Employee Management",
      "Attendance & Leave",
      "Payroll Processing",
      "Document Management",
      "Team Chat & Announcements",
      "HR Analytics Dashboard",
      "Email & chat support",
    ],
    cta: "Request a Demo",
    highlighted: true,
    badge: "Limited Offer Pricing",
  },
  {
    name: "Enterprise",
    desc: "Custom contracts, SLA guarantees, and dedicated support for large organisations.",
    price: "Let's Talk",
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

const BELIEFS = [
  {
    icon: Shield,
    title: "Security First",
    desc: "Bank-grade encryption, NDPR compliance, and role-based access control keep your sensitive employee data locked tight.",
  },
  {
    icon: Globe,
    title: "Built for Africa",
    desc: "Nigerian PAYE, pension fund deductions, NHF, and NSITF are built in, not bolt-ons. We know local compliance because we live it.",
  },
  {
    icon: Users,
    title: "People Obsessed",
    desc: "Every feature is designed around the employee experience, not just HR admin efficiency. Happy employees, better retention.",
  },
  {
    icon: Zap,
    title: "Always Improving",
    desc: "We ship updates every two weeks based on customer feedback. If you need a feature, tell us. It's probably already on the roadmap.",
  },
];

const FOOTER = [
  { title: "Product", links: ["Features", "Pricing", "Security", "Changelog"] },
  { title: "Company", links: ["About Us", "Careers", "Blog", "Press"] },
  {
    title: "Support",
    links: ["Help Centre", "Contact Us", "Status", "Privacy Policy"],
  },
];

/* ── The BantaHR mark, recoloured to the brand indigo ── */
function Wordmark() {
  return (
    <span className="mk-logo">
      <svg width="40" height="40" viewBox="0 0 56 56" aria-hidden="true">
        <rect width="56" height="56" rx="14" fill="url(#mk-logo-grad)" />
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
        <path
          d="M14 32 Q28 26 42 32"
          stroke="#fff"
          strokeOpacity="0.22"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          fill="none"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="mk-logo-grad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--color-indigo-500)" />
            <stop offset="55%" stopColor="var(--color-indigo-600)" />
            <stop offset="100%" stopColor="var(--color-indigo-950)" />
          </linearGradient>
        </defs>
      </svg>
      <span>
        <span className="mk-logo__word">
          Banta<em>HR</em>
        </span>
        <span className="mk-logo__sub">People Platform</span>
      </span>
    </span>
  );
}

/* ── Scroll reveal ── */
function Reveal({ children, className = "" }) {
  const ref = useRef(null);
  // Reduced-motion and no-IO browsers start visible, so the effect never has
  // to set state synchronously on mount.
  const [shown, setShown] = useState(
    () =>
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [shown]);

  return (
    <div ref={ref} className={`mk-reveal ${shown ? "is-in" : ""} ${className}`}>
      {children}
    </div>
  );
}

/* ── Feature deck — advances right to left every 5s ── */
function FeatureDeck() {
  const total = FEATURES.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(() => !("IntersectionObserver" in window));
  const deckRef = useRef(null);

  const go = useCallback((next) => setActive((next + total) % total), [total]);

  useEffect(() => {
    const el = deckRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setActive((a) => (a + 1) % total), 5000);
    return () => clearInterval(t);
  }, [paused, inView, total, active]);

  // Slot 0 leads; prev/next flank it; everything else parks on the nearer side
  const slotFor = (i) => {
    const ahead = (i - active + total) % total;
    if (ahead === 0) return "0";
    if (ahead === 1) return "next";
    if (ahead === total - 1) return "prev";
    return ahead <= total / 2 ? "far-right" : "far-left";
  };

  return (
    <div
      ref={deckRef}
      className="mk-deck mk-body"
      role="region"
      aria-roledescription="carousel"
      aria-label="HR functions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { go(active + 1); e.preventDefault(); }
        if (e.key === "ArrowLeft") { go(active - 1); e.preventDefault(); }
      }}
    >
      <div className="mk-deck__stage">
        {FEATURES.map(({ icon: Icon, title, desc }, i) => {
          const slot = slotFor(i);
          return (
            <article
              key={title}
              className="mk-card"
              data-slot={slot}
              aria-hidden={slot !== "0"}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${total}: ${title}`}
              onClick={() => {
                if (slot === "next") go(active + 1);
                else if (slot === "prev") go(active - 1);
              }}
            >
              <span className="mk-card__icon">
                <Icon size={26} />
              </span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          );
        })}
      </div>

      <div className="mk-deck__controls">
        <button
          type="button"
          className="mk-deck__arrow"
          onClick={() => go(active - 1)}
          aria-label="Previous function"
        >
          <ChevronRight size={18} style={{ transform: "rotate(180deg)" }} />
        </button>

        <div className="mk-deck__dots">
          {FEATURES.map(({ title }, i) => (
            <button
              key={title}
              type="button"
              className="mk-deck__dot"
              aria-current={i === active ? "true" : undefined}
              aria-label={`Show ${title}`}
              onClick={() => go(i)}
            />
          ))}
        </div>

        <button
          type="button"
          className="mk-deck__arrow"
          onClick={() => go(active + 1)}
          aria-label="Next function"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <p className="mk-sr" aria-live="polite">
        {FEATURES[active].title}, {active + 1} of {total}
      </p>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goDemo = () => navigate("/request-demo");

  return (
    <div className="mk">
      {/* ── NAVBAR ── */}
      <header className={`mk-nav ${stuck ? "is-stuck" : ""}`}>
        <div className="mk-shell mk-nav__inner">
          <a href="#top" aria-label="BantaHR home">
            <Wordmark />
          </a>

          <nav className="mk-nav__links" aria-label="Primary">
            {NAV.map(({ label, href }) => (
              <a key={label} href={href}>
                {label}
              </a>
            ))}
          </nav>

          <div className="mk-nav__cta">
            <button
              type="button"
              className="mk-btn mk-btn--primary mk-btn--sm"
              onClick={goDemo}
            >
              Request a Demo
            </button>
            <button
              type="button"
              className="mk-nav__burger"
              onClick={() => setMenuOpen((p) => !p)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mk-nav__sheet">
            <div className="mk-shell">
              <ul>
                {NAV.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} onClick={() => setMenuOpen(false)}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mk-btn mk-btn--primary mk-btn--wide"
                onClick={() => {
                  setMenuOpen(false);
                  goDemo();
                }}
              >
                Request a Demo
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="mk-hero" id="top">
        <div className="mk-hero__glow" aria-hidden="true" />
        <div className="mk-shell mk-hero__inner">
          <Reveal>
            <span className="mk-hero__badge">
              <Zap size={12} /> Built for African Businesses
            </span>
          </Reveal>

          <Reveal>
            <h1>The HR Platform That Actually Works for Your Business</h1>
          </Reveal>

          <Reveal>
            <p className="mk-hero__sub">
              Automate payroll, manage attendance, track performance, and
              empower your people, all in one modern HRIS built for Nigeria and
              Africa.
            </p>
          </Reveal>

          <Reveal>
            <button
              type="button"
              className="mk-btn mk-btn--primary"
              onClick={goDemo}
            >
              Request a Demo
            </button>
          </Reveal>

          <Reveal>
            <ul className="mk-hero__trust">
              {["Secure & Compliant", "NDPR Ready", "99.9% Uptime", "No Setup Fee"].map(
                (t) => (
                  <li key={t}>
                    <Check size={14} /> {t}
                  </li>
                ),
              )}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section className="mk-band mk-band--up" style={{ padding: "4.5rem 0" }}>
        <div className="mk-shell">
          <Reveal>
            <div className="mk-stats">
              {STATS.map(({ value, label }) => (
                <div key={label}>
                  <b>{value}</b>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="mk-band mk-band--down" id="features">
        <div className="mk-shell">
          <Reveal>
            <div className="mk-head">
              <p className="mk-eyebrow">Everything You Need</p>
              <h2>One Platform. Every HR Function.</h2>
              <p>
                From hire to retire, BantaHR handles every step of the employee
                lifecycle with intelligence and ease.
              </p>
            </div>
          </Reveal>
          <FeatureDeck />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="mk-band">
        <div className="mk-shell">
          <Reveal>
            <div className="mk-head">
              <p className="mk-eyebrow">Simple Onboarding</p>
              <h2>Up and Running in 48 Hours</h2>
            </div>
          </Reveal>

          <Reveal className="mk-body">
            <div className="mk-steps">
              {STEPS.map(({ step, title, desc, icon: Icon }) => (
                <div className="mk-step" key={step}>
                  <span className="mk-step__badge">
                    <span>
                      <Icon size={28} />
                    </span>
                    <span className="mk-step__n">{step}</span>
                  </span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="mk-band mk-band--diag" id="testimonials">
        <div className="mk-shell">
          <Reveal>
            <div className="mk-head">
              <p className="mk-eyebrow">Social Proof</p>
              <h2>Trusted by HR Teams Across Africa</h2>
            </div>
          </Reveal>

          <Reveal className="mk-body">
            <div className="mk-quotes">
              {TESTIMONIALS.map(({ quote, name, avatar, rating }) => (
                <figure className="mk-quote" key={name}>
                  <span className="mk-stars" role="img" aria-label={`Rated ${rating} out of 5`}>
                    {Array.from({ length: rating }).map((_, j) => (
                      <Star key={j} size={15} fill="currentColor" strokeWidth={0} />
                    ))}
                  </span>
                  <blockquote>&ldquo;{quote}&rdquo;</blockquote>
                  <figcaption>
                    <span className="mk-avatar">{avatar}</span>
                    <b>{name}</b>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="mk-band mk-band--up" id="pricing">
        <div className="mk-shell">
          <Reveal>
            <div className="mk-head">
              <p className="mk-eyebrow">Transparent Pricing</p>
              <h2>Pay for What You Use</h2>
              <p>
                Simple per-employee pricing with no hidden fees and no long-term
                lock-in. The bigger your team, the more you save.
              </p>
            </div>
          </Reveal>

          <Reveal className="mk-body">
            <div className="mk-plans">
              {PLANS.map((p) => (
                <div
                  key={p.name}
                  className={`mk-plan ${p.highlighted ? "mk-plan--lead" : ""}`}
                >
                  {p.badge && <span className="mk-plan__badge">{p.badge}</span>}
                  <div>
                    <h3>{p.name}</h3>
                    <p className="mk-plan__desc">{p.desc}</p>
                  </div>

                  <div className="mk-plan__price">
                    {p.was && <del>{p.was}</del>}
                    <b>{p.price}</b>
                    {p.per && <span>{p.per}</span>}
                  </div>
                  {p.minNote && <p className="mk-plan__min">{p.minNote}</p>}
                  {p.example && <p className="mk-plan__eg">{p.example}</p>}

                  <ul>
                    {p.features.map((f) => (
                      <li key={f}>
                        <Check size={16} strokeWidth={2.4} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className={`mk-btn mk-btn--wide ${
                      p.highlighted ? "mk-btn--primary" : "mk-btn--ghost"
                    }`}
                    onClick={goDemo}
                  >
                    {p.cta}
                  </button>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <p className="mk-plans__note">
              All plans include free onboarding by our team. No debit card
              required to start. Cancel anytime.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="mk-band mk-band--diag" id="about">
        <div className="mk-shell">
          <Reveal>
            <div className="mk-head" style={{ maxWidth: "62ch" }}>
              <Wordmark />
              <h2>Why We Built BantaHR</h2>
              <p>
                Nigerian and African businesses deserve HR software built for
                their reality, not adapted from tools designed for Silicon
                Valley. We built BantaHR from the ground up for local payroll
                laws, local compliance requirements, and the way African teams
                actually work.
              </p>
            </div>
          </Reveal>

          <Reveal className="mk-body">
            <div className="mk-abouts">
              {BELIEFS.map(({ icon: Icon, title, desc }) => (
                <div className="mk-card" key={title}>
                  <span className="mk-card__icon">
                    <Icon size={22} />
                  </span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="mk-band" style={{ paddingTop: "4.5rem" }}>
        <div className="mk-shell">
          <Reveal>
            <div className="mk-close">
              <h2>Ready to Transform Your HR?</h2>
              <p>
                Join 500+ companies using BantaHR to build happier, more
                productive teams.
              </p>
              <button
                type="button"
                className="mk-btn mk-btn--onaccent"
                onClick={goDemo}
              >
                Request Your Free Demo <ArrowRight size={18} />
              </button>
              <small>
                No debit card required · Set up in 48 hours · We handle
                onboarding
              </small>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="mk-foot">
        <div className="mk-shell">
          <div className="mk-foot__cols">
            <div>
              <Wordmark />
              <p className="mk-foot__blurb">
                The all-in-one HR platform built for African businesses.
              </p>
            </div>
            {FOOTER.map(({ title, links }) => (
              <div key={title}>
                <h4>{title}</h4>
                <ul>
                  {links.map((l) => (
                    <li key={l}>
                      <a href="#top">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mk-foot__base">
            <p>© {new Date().getFullYear()} BantaHR Ltd. All rights reserved.</p>
            <p>No 1 Adetunji Adegbite Street, Ogudu, Lagos, Nigeria</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
