// src/pages/LandingPage.jsx
// BantaHR — All-in-one HRIS for African businesses
// No login link — only "Request a Demo"
//
// Styling: Tailwind only. Brand tokens (bg-brand-*, font-display,
// animate-typing, …) are declared in src/index.css under @theme.

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import BantaHRLogo from "../styles/BantaHRLogo";

import MarketingNav, { handleSpotlightMove} from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";

import BackImage1 from "../assets/20613.jpg";

import divider1 from "../assets/dvd/dvd1.png";
import divider2 from "../assets/dvd/dvd2.png";
import divider3 from "../assets/dvd/dvd3.png";
import divider5 from "../assets/dvd/dvd5.png";
import bg_texture from "../assets/dvd/bg-texture.png";

import roundel from "../assets/avatars/roundel.jpg";
import roundel_2 from "../assets/avatars/roundel_2.jpg";
import roundel_3 from "../assets/avatars/roundel_3.jpg";

import rectl from "../assets/pictured1.jfif";
import rectl_1 from "../assets/pictured4.jfif";
import rectl_2 from "../assets/pictured5.jfif";
import rectl_3 from "../assets/pictured6.jfif";

// Feature-marquee card backgrounds.
//
// These point at ../assets/feats/optimized, NOT ../assets/feats. The originals
// total 95 MB (one is 7000x4672) for cards that render at 380x480; the
// optimised set is the same images centre-cropped to 780x980, 626 KB for all
// ten. Regenerate from the originals if the crop needs to change.
import b_Img1 from "../assets/feats/optimized/20614.jpg";
import b_Img2 from "../assets/feats/optimized/8150248.jpg";
import b_Img3 from "../assets/feats/optimized/9165622.jpg";
import b_Img4 from "../assets/feats/optimized/abstract-gradient-neon-lights.jpg";
import b_Img5 from "../assets/feats/optimized/abstract-luxury-gradient-blue-background-smooth-dark-blue-with-black-vignette-studio-banner.jpg";
import b_Img6 from "../assets/feats/optimized/blue-smooth-wall-textured-background.jpg";
import b_Img7 from "../assets/feats/optimized/blue-wall-background.jpg";
import b_Img8 from "../assets/feats/optimized/v904-nunny-012.jpg";
import b_Img9 from "../assets/feats/optimized/v960-ning-30.jpg";
import b_Img10 from "../assets/feats/optimized/white.jpg";

import {
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
  Globe,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  BarChart2,
  FileText,
  Calendar,
  Award,
  GraduationCap,
  Zap,
  CheckCircle2,
  MessageSquare,
  Bell,
  UserCheck,
  BriefcaseBusiness,
  MessageSquareText,
  Wallet,
  BarChart3,
  ArrowLeft,
} from "lucide-react";

import managementImg from "../assets/Ui-HRM.png";
import chatImg from "../assets/Ui-HRMM1.png";
import payrollImg from "../assets/Ui-HRMM2.png";
import reportImg from "../assets/Ui-HRMM3.png";

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import bg_blue from "../assets/image.png"
import bg_blue2 from "../assets/Capone.png"
import bg_blue3 from "../assets/LoadingBall.png"

const featureData = [
  { id: 0, title: "Management", icon: BriefcaseBusiness, image: managementImg },
  { id: 1, title: "Team Chat", icon: MessageSquareText, image: chatImg },
  { id: 2, title: "Payroll", icon: Wallet, image: payrollImg },
  { id: 3, title: "Report Analysis", icon: BarChart3, image: reportImg },
];

const FEATURES = [
  {
    icon: Users,
    image: b_Img1,
    title: "Employee Management",
    desc: "Centralise every employee record — contracts, role history, org charts, onboarding checklists and offboarding flows — in one secure hub. HR admins get full visibility; employees can view and request updates to their own profiles.",
  },
  {
    icon: Clock,
    image: b_Img2,
    title: "Attendance & Leave",
    desc: "Real-time clock-in with location awareness, automated leave balance calculations, and intelligent approval workflows. Managers approve or decline leave requests in one tap, and the system updates balances instantly.",
  },
  {
    icon: DollarSign,
    image: b_Img3,
    title: "Payroll Processing",
    desc: "Run fully compliant Nigerian payroll in minutes — PAYE, pension (PFA), NHF, and NSITF all automated. Generate payslips, process bulk payments, and stay audit-ready with detailed payroll reports every cycle.",
  },
  {
    icon: TrendingUp,
    image: b_Img4,
    title: "Performance Management",
    desc: "Set team and individual OKRs, run structured appraisal cycles, and track employee growth with real-time dashboards. Managers give continuous feedback; employees see exactly where they stand and what to improve.",
  },
  {
    icon: FileText,
    image: b_Img5,
    title: "Document Management",
    desc: "Create, send, and e-sign offer letters, contracts, and HR policy documents digitally. Employees receive documents in their portal, sign electronically, and all records are stored securely with full audit trails.",
  },
  {
    icon: BarChart2,
    image: b_Img6,
    title: "HR Analytics",
    desc: "Live dashboards that turn your workforce data into strategic decisions — headcount trends, attrition rates, department costs, and custom reports. Export to PDF or Excel for board-level presentations.",
  },
  {
    icon: MessageSquare,
    image: b_Img7,
    title: "Team Chat",
    desc: "Built-in messaging so your workforce stays connected. Managers create team channels for group announcements; employees send direct messages and share documents — all within the same platform, no external tools needed.",
  },
  {
    icon: Bell,
    image: b_Img8,
    title: "Announcements",
    desc: "HR admins broadcast company-wide or department-specific announcements with rich text, file attachments, and scheduled publishing. Pin important notices so they stay visible, and track who has read each announcement.",
  },
  {
    icon: UserCheck,
    image: b_Img9,
    title: "Offboarding",
    desc: "Structure every exit with automated offboarding checklists — asset returns, system access revocation, exit interviews, and final payroll. Reduce admin chaos and ensure every departure is handled professionally.",
  },
  {
    icon: GraduationCap,
    image: b_Img10,
    title: "Training & Development",
    desc: "Assign courses, track completion and keep certification records against each employee profile. Managers see who is qualified for what, and compliance training never quietly lapses.",
  },
];

const STATS = [
  { value: "50+", label: "Companies onboarded" },
  { value: "95%", label: "Customer satisfaction" },
  { value: "40%", label: "HR time saved" },
  { value: "₦2B+", label: "Payroll processed" },
];

// Customer-story mosaic. Three card shapes, mirroring the reference layout:
//   quote — pull quote + attribution (avatar image, or initials as a fallback)
//   photo — full-bleed portrait with a sector + metric caption
//   stat  — metric only, no imagery
//
// ⚠️ PLACEHOLDER CONTENT — every quote, name, role and metric below is invented.
// Attribution deliberately uses sector + city rather than company names, so the
// page never implies a customer BantaHR does not have. Replace before launch.
const WALL = [
  {
    key: "Abiodun",
    type: "quote",
    quote:
      "BantaHR cut our monthly payroll from three days to forty-five minutes. The ROI was immediate we stopped needing a dedicated payroll temp entirely.",
    name: "Abiodun Inaolaji",
    role: "Project Manager · BantaHR tech, Lagos",
    avatar: roundel,
  },
  {
    key: "photo-1",
    type: "photo",
    image: rectl,
    org: "Logistics group, Ikeja",
    metric: "Payroll run cut by 94%",
  },
  {
    key: "stat-1",
    type: "stat",
    org: "Retail chain, Abuja",
    metric: "HR admin overhead down 60%",
  },
  {
    key: "mercy",
    type: "quote",
    quote:
      "Finally an HR platform built for how African businesses actually run. The leave management alone is worth every kobo.",
    name: "Mercy Adeyemi",
    role: "HR Manager · Logistics, Ikeja",
    avatar: roundel_2,
  },
  {
    key: "photo-2",
    type: "photo",
    image: rectl_1,
    org: "Healthcare group, Lagos",
    metric: "Onboarding time down 70%",
  },
  {
    key: "tinubu",
    type: "quote",
    quote:
      "Our team of 300 now manages their own HR needs. Payslips, leave, profile updates none of it lands on my desk anymore.",
    name: "Tinubu Aishat",
    role: "Operations Director · Retail, Abuja",
    avatar: roundel_3,
  },
  {
    key: "photo-3",
    type: "photo",
    image: rectl_2,
    org: "Manufacturing, Ogun",
    metric: "98% employee self-service adoption",
  },
  {
    key: "stat-2",
    type: "stat",
    org: "Professional services, Port Harcourt",
    metric: "Zero PAYE filing errors in 12 months",
  },
  {
    key: "stat-3",
    type: "stat",
    org: "Hospitality group, Lagos",
    metric: "4 hours saved per manager weekly",
  },
  {
    key: "photo-4",
    type: "photo",
    image: rectl_3,
    org: "Agritech, Ibadan",
    metric: "Attrition reporting in real time",
  },
  {
    key: "greg",
    type: "quote",
    quote:
      "PAYE, pension and NHF just work. I stopped double-checking the numbers after the second month, which says everything.",
    name: "Greg Aigde",
    role: "Finance Lead · Manufacturing, Ogun",
    initials: "GR",
  },
  {
    key: "stat-4",
    type: "stat",
    org: "Education group, Enugu",
    metric: "Leave approvals settled in under a day",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Book Your Demo",
    desc: "Schedule a personalised walkthrough with our team.",
    icon: Calendar,
    tint: "bg-brand-indigo/10",
    text: "text-brand-indigo",
    badge: "bg-brand-indigo",
  },
  {
    step: "02",
    title: "We Set You Up",
    desc: "We handle your data migration and company configuration — zero spreadsheet chaos.",
    icon: Globe,
    tint: "bg-brand-cyan/10",
    text: "text-brand-cyan",
    badge: "bg-brand-cyan",
  },
  {
    step: "03",
    title: "Train Your Team",
    desc: "Intuitive interface means your HR team is productive from day one.",
    icon: Award,
    tint: "bg-emerald-500/10",
    text: "text-emerald-500",
    badge: "bg-emerald-500",
  },
  {
    step: "04",
    title: "Scale Confidently",
    desc: "From 10 to 10,000 employees — BantaHR grows with your ambition.",
    icon: TrendingUp,
    tint: "bg-amber-500/10",
    text: "text-amber-500",
    badge: "bg-amber-500",
  },
];

const VALUES = [
  {
    icon: Shield,
    title: "Security First",
    desc: "Bank-grade encryption, NDPR compliance, and role-based access control keep your sensitive employee data locked tight.",
    tint: "bg-brand-cyan/12",
    text: "text-brand-cyan",
  },
  {
    icon: Globe,
    title: "Built for Africa",
    desc: "Nigerian PAYE, pension fund deductions, NHF, and NSITF are built in — not bolt-ons. We know local compliance because we live it.",
    tint: "bg-amber-500/12",
    text: "text-amber-500",
  },
  {
    icon: Users,
    title: "People Obsessed",
    desc: "Every feature is designed around the employee experience — not just HR admin efficiency. Happy employees, better retention.",
    tint: "bg-emerald-500/12",
    text: "text-emerald-500",
  },
  {
    icon: Zap,
    title: "Always Improving",
    desc: "We ship updates every two weeks based on customer feedback. If you need a feature, tell us — it's probably already on the roadmap.",
    tint: "bg-pink-500/12",
    text: "text-pink-500",
  },
];

// ₦1,000 per employee per month · Custom Enterprise
const SECTION_EYEBROW =
  "text-xs font-bold uppercase tracking-[0.1em] text-brand-indigo";
const SECTION_EYEBROWW =
  "text-xs font-bold uppercase tracking-[0.1em] text-brand-kindgreen";
const SECTION_HEADING =
  "font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold tracking-[-0.8px] text-brand-navy";

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
      // Only the stagger delay stays inline — it is data-driven, so Tailwind
      // cannot statically generate a class for it.
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-[opacity,transform] duration-[600ms] ease-[ease] ${
        visible ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* One tile in the customer-story mosaic. All three shapes share the same
   footprint so the grid rows stay flush. */
function WallCard({ card }) {
  const SHELL =
    "flex h-full min-h-[290px] flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-6";
  const CAPTION =
    "m-0 text-[11px] leading-[1.5] font-bold tracking-[0.06em] uppercase";

  if (card.type === "photo") {
    return (
      <div className="relative h-full min-h-[290px] overflow-hidden rounded-xl border border-white/10">
        {/* object-top so the crop eats the bottom of the frame, not the head */}
        <img
          src={card.image}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        {/* Scrim so the caption stays legible whatever the photo does */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,13,26,0.92)_0%,rgba(8,13,26,0.35)_45%,transparent_75%)]" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="m-0 text-sm font-semibold text-white">{card.org}</p>
          <p className={`${CAPTION} mt-1 text-white/60`}>{card.metric}</p>
        </div>
      </div>
    );
  }

  if (card.type === "stat") {
    return (
      <div className={SHELL}>
        <TrendingUp size={20} strokeWidth={1.6} className="text-white/30" />
        <div>
          <p className="m-0 text-sm font-semibold text-white">{card.org}</p>
          <p className={`${CAPTION} mt-1 text-white/60`}>{card.metric}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={SHELL}>
      <p className="m-0 text-[15px] leading-[1.65] text-white">
        &ldquo;{card.quote}&rdquo;
      </p>

      <div className="mt-8 flex items-center gap-3">
        {card.avatar ? (
          <img
            src={card.avatar}
            alt=""
            width={36}
            height={36}
            loading="lazy"
            decoding="async"
            className="h-9 w-9 shrink-0 rounded-md object-cover"
          />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-linear-135 from-brand-indigo to-brand-cyan text-[11px] font-bold text-white">
            {card.initials}
          </span>
        )}
        <div className="min-w-0">
          <p className={`${CAPTION} text-white`}>{card.name}</p>
          <p className={`${CAPTION} text-white/50`}>{card.role}</p>
        </div>
      </div>
    </div>
  );
}

/* One card in the feature marquee: full-bleed background, pill label on top,
   copy in a glass panel floated in the middle.

   Named group (`group/card`) rather than a bare `group` — the marquee track
   already owns an unnamed group for its hover-to-pause, and an unnamed group
   here would be captured by that one instead of the card. */
function FeatureCard({ icon: Icon, title, desc, image, ...rest }) {
  return (
    <article
      {...rest}
      className="group/card mr-6 h-100 w-75 shrink-0 overflow-hidden rounded-3xl transition-transform duration-500 ease-out hover:scale-[1.02] sm:h-110 sm:w-92"
    >
      <div className="relative h-full w-full">
        <img
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
        />
        {/* Fairly even darkening rather than a bottom-weighted scrim: the panel
            now floats mid-card, and the ten backgrounds run from near-white to
            near-black, so the glass needs a predictable base wherever it sits. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,22,41,0.34)_0%,rgba(15,22,41,0.22)_45%,rgba(15,22,41,0.40)_100%)]" />

        <div className="relative flex h-full flex-col p-5">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-brand-navy shadow-[0_4px_14px_rgba(15,22,41,0.18)]">
            <Icon size={16} className="text-brand-navy" />
            {title}
          </span>

          {/* Dark glass, not light: over `white.jpg` a white-tinted panel leaves
              nothing to read against. Navy at 50% lands ~5:1 on the palest
              background here and only improves on the darker ones. */}
          <div className="my-auto rounded-2xl border border-white/15 bg-brand-navy/50 p-5 shadow-[0_8px_28px_rgba(15,22,41,0.22)] backdrop-blur-md">
            <p className="m-0 text-sm leading-[1.65] text-white/90">{desc}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

const MARQUEE_SPEED = 56; // px per second

/* Continuous horizontal loop built on a native scroll container rather than a
   CSS keyframe animation. That swap is what makes it grabbable: a transform
   marquee can't be picked up mid-flight without first back-computing how far
   through its cycle it is, whereas `scrollLeft` can simply be written to.
   Scrolling also gives touch swipe — with real momentum — for free.

   The track holds the card list twice and `scrollLeft` wraps by exactly half
   the track width. Positions 0 and half render identically, so the wrap is
   invisible in both directions.

   Cards use `mr-6` instead of the track using `gap`, because with `gap` the
   half-width lands half a gap short and the seam visibly jumps. */
function FeatureMarquee() {
  const scrollerRef = useRef(null);
  const hoverRef = useRef(false);
  const dragRef = useRef(null);

  const track = [...FEATURES, ...FEATURES];

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf;
    let last = performance.now();

    const step = (now) => {
      // Clamp dt so returning to a backgrounded tab doesn't teleport the track.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!hoverRef.current && !dragRef.current) {
        el.scrollLeft += MARQUEE_SPEED * dt;
      }

      const half = el.scrollWidth / 2;
      if (half > 0) {
        if (el.scrollLeft >= half) el.scrollLeft -= half;
        else if (el.scrollLeft <= 0) el.scrollLeft += half;
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Mouse drag only — touch is left to the browser so swipes keep their
  // momentum, and so a vertical drag still scrolls the page rather than
  // being swallowed by the carousel.
  const startDrag = (e) => {
    if (e.pointerType !== "mouse") return;
    const el = scrollerRef.current;
    dragRef.current = { x: e.clientX, scroll: el.scrollLeft };
    el.setPointerCapture(e.pointerId);
  };

  const onDrag = (e) => {
    const d = dragRef.current;
    if (!d) return;
    scrollerRef.current.scrollLeft = d.scroll - (e.clientX - d.x);
  };

  const endDrag = (e) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    scrollerRef.current?.releasePointerCapture?.(e.pointerId);
  };

  return (
    <div className="relative" role="region" aria-label="BantaHR features">
      {/* Soft edge masks so cards fade in and out rather than being sliced */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-16 bg-[linear-gradient(to_right,var(--color-brand-offwhite),transparent)] sm:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-16 bg-[linear-gradient(to_left,var(--color-brand-offwhite),transparent)] sm:w-28" />

      <div
        ref={scrollerRef}
        tabIndex={0}
        // Hover-pause is mouse-only: on touch, pointerenter fires on tap and
        // pointerleave often never does, which would strand it paused.
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") hoverRef.current = true;
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") hoverRef.current = false;
        }}
        onPointerDown={startDrag}
        onPointerMove={onDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="cursor-grab overflow-x-auto overscroll-x-contain select-none [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-indigo active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max pl-6">
          {track.map((f, i) => (
            <FeatureCard
              key={`${f.title}-${i}`}
              // The second copy is decorative duplication — hide it from AT.
              aria-hidden={i >= FEATURES.length}
              {...f}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [heroVisible, setHeroVisible] = useState(false);

  // Hero screenshot switcher
  const [active, setActive] = useState(0);
  const nextFeature = () => setActive((p) => (p + 1) % featureData.length);
  const prevFeature = () =>
    setActive((p) => (p === 0 ? featureData.length - 1 : p - 1));

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const goDemo = () => navigate("/request-demo");

  return (
    <div className="overflow-x-hidden bg-white font-body text-brand-ink">
      <MarketingNav />

      {/* ── HERO ── */}
      <section
        // Bundler-hashed asset URL — has to stay inline.
        style={{ backgroundImage: `url(${BackImage1})` }}
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-30 pb-20"
      >
        {/* Background decorations */}
        {/* NOTE: green channel 439 is out of range and clamps to 255, so this
            renders mint rather than blue. Preserved verbatim from the original
            — likely a typo for 139. */}
        <div className="pointer-events-none absolute top-[10%] right-[-5%] h-125 w-125 rounded-full bg-[radial-gradient(circle,rgba(28,439,219,0.12),transparent_70%)]" />
        <div className="pointer-events-none absolute bottom-[5%] left-[-8%] h-100 w-100 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.12),transparent_70%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:48px_48px]" />

        {/* Widened from 860px to give the product panel room. The copy blocks
            below keep their own narrower measures so line breaks are unchanged
            — only the rail/panel grid actually uses the extra width. */}
        <div className="relative z-[1] max-w-[1120px] text-center">
          {/* Badge */}
          <div
            className={`mb-8 inline-flex items-center gap-2 rounded-full border border-brand-indigo-light/35 bg-brand-indigo/20 px-4 py-1.5 transition-all delay-100 duration-[600ms] ease-[ease] ${
              heroVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
            }`}
          >
            <Zap size={12} className="text-brand-indigo" />
            <span className="w-0 animate-typing overflow-hidden border-r-[6px] border-brand-indigo text-xs font-semibold tracking-[1px] whitespace-nowrap text-brand-indigo uppercase [text-shadow:3px_3px_7px_rgba(0,0,0,0.3)]">
              BUILT FOR AFRICAN BUSINESSES
            </span>
          </div>

          {/* Headline */}
          <h1
            className={`m-0 mx-auto mb-6 max-w-215 bg-linear-135 from-brand-indigo to-brand-cyan bg-clip-text font-body text-[clamp(2.4rem,6vw,4.2rem)] leading-[1.1] tracking-[-1.5px] text-transparent transition-all delay-200 duration-700 ease-[ease] [font-weight:1000] ${
              heroVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            The HR Platform That{" "}
            <span className="bg-linear-135 from-brand-indigo-light to-brand-cyan bg-clip-text text-transparent">
              Actually Works
            </span>{" "}
            for Your Business
          </h1>

          <p
            className={`mx-auto mb-12 max-w-[620px] font-body text-[clamp(1rem,2vw,1.2rem)] leading-[1.5] font-light tracking-[1px] text-brand-indigo transition-all delay-[350ms] duration-700 ease-[ease] ${
              heroVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            Automate payroll, manage attendance, track performance, and empower
            your people — all in one modern HRIS built for Nigeria and Africa.
          </p>

          {/* Single CTA */}
          <div
            className={`flex flex-wrap items-center justify-center gap-4 transition-all delay-500 duration-700 ease-[ease] ${
              heroVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            <button
              onClick={goDemo}
              onMouseMove={handleSpotlightMove}
              className="group relative isolate inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border-0 bg-brand-indigo px-9 py-4 text-base font-bold text-white shadow-[0_8px_28px_rgba(79,70,229,.5)] transition-[transform,box-shadow] duration-200 ease-[ease] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(79,70,229,.6)]"
            >
              {/* Mouse spotlight */}
              <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(140px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,.28),transparent_70%)] opacity-0 transition-opacity duration-[250ms] ease-[ease] group-hover:opacity-100" />
              <span className="relative z-[2] flex items-center gap-2">
                Request a Demo
                <ArrowRight size={17} />
              </span>
            </button>
          </div>

          {/* Product screenshots */}
          <div className="mt-15 hidden grid-cols-[220px_minmax(0,1fr)] items-center gap-20 md:grid">
            {/* LEFT */}
            <div className="flex h-full flex-col justify-between">
              <div className="space-y-2">
                {featureData.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.title}
                      onClick={() => setActive(index)}
                      className={`relative flex w-50 cursor-pointer items-center gap-3 px-5 py-3 text-left transition-all duration-300 ${
                        active === index
                          ? "rounded-xl bg-brand-graphite/10 text-brand-graphite"
                          : "text-brand-graphite/60 hover:bg-brand-graphite/5 hover:text-brand-graphite"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-custom">{item.title}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-20 flex gap-4">
                <button
                  onClick={prevFeature}
                  aria-label="Previous screenshot"
                  className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-brand-graphite text-white transition hover:scale-105"
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  onClick={nextFeature}
                  aria-label="Next screenshot"
                  className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-brand-graphite text-white transition hover:scale-105"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>

            {/* RIGHT */}
            <div className="relative ml-10 aspect-[1431/1099] w-full overflow-hidden rounded-[32px] bg-brand-graphite">
              <AnimatePresence mode="wait">
                <motion.img
                  key={active}
                  src={featureData[active].image}
                  alt={featureData[active].title}
                  className="absolute inset-0 h-full w-full object-contain"
                  initial={{ opacity: 0, x: 70, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -70, scale: 0.96 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </AnimatePresence>
            </div>
          </div>

          {/* Trust bar */}
          <div
            className={`mt-14 mb-12 flex flex-wrap items-center justify-center gap-8 transition-opacity delay-[800ms] duration-[800ms] ease-[ease] ${
              heroVisible ? "opacity-75" : "opacity-0"
            }`}
          >
            {["Secure & Compliant", "NDPR Ready", "99.9% Uptime", "No Setup Fee"].map(
              (t) => (
                <div
                  key={t}
                  className="flex items-center gap-[7px] text-[13px] text-brand-graphite"
                >
                  <CheckCircle2 size={14} />
                  <span>{t}</span>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="pointer-events-none absolute -bottom-8 left-0 w-full translate-y-px">
          <img src={divider1} className="h-auto w-full object-bottom" alt="" />
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section className="bg-brand-indigo px-6 py-14">
        <div className="mx-auto grid max-w-[1100px] grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-8">
          {STATS.map(({ value, label }, i) => (
            <Reveal key={label} delay={i * 80}>
              <div className="text-center">
                <p className="m-0 mb-1.5 font-display text-[clamp(2.2rem,4vw,3rem)] font-extrabold tracking-[-1px] text-white">
                  {value}
                </p>
                <p className="m-0 text-sm text-white/70">{label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        id="features"
        className="relative overflow-hidden bg-brand-offwhite py-25"
      >
        <div className="mx-auto mb-14 max-w-[1200px] px-6">
          <Reveal>
            <span className={SECTION_EYEBROW}>Everything You Need</span>
            <h2 className={`${SECTION_HEADING} mt-3 mb-4`}>
              One Platform. Every HR Function.
            </h2>
            <p className="max-w-[560px] text-[17px] leading-[1.7] text-brand-ink-mid">
              From hire to retire — BantaHR handles every step of the employee
              lifecycle with intelligence and ease.
            </p>
          </Reveal>
        </div>

        <FeatureMarquee />

        <div className="pointer-events-none absolute -bottom-8 left-0 w-full translate-y-px">
          <img src={divider2} className="h-auto w-full object-bottom" alt="" />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative overflow-hidden bg-white px-6 py-25">
        <div>
          <img
            src={bg_blue3}
            alt=""
            aria-hidden="true"
            className="mx-auto block w-full max-w-[480px] select-none"
          />
        </div>
        <div className="mx-auto max-w-[1000px]">
          <Reveal>
            <div className="mb-18 text-center">
              <span className={SECTION_EYEBROWW}>Simple Onboarding</span>
              <h2 className={`${SECTION_HEADING} mt-3`}>
                Up and Running in 48 Hours
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-10">
            {STEPS.map(
              ({ step, title, desc, icon: Icon, tint, text, badge }, i) => (
                <Reveal key={step} delay={i * 80}>
                  <div className="text-center">
                    <div className="relative mb-5 inline-flex">
                      <div
                        className={`flex h-16 w-16 items-center justify-center rounded-[18px] ${tint}`}
                      >
                        <Icon size={28} className={text} />
                      </div>
                      <span
                        className={`absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full font-display text-[11px] font-extrabold text-white ${badge}`}
                      >
                        {step}
                      </span>
                    </div>
                    <h3 className="m-0 mb-2 font-display text-[17px] font-bold text-brand-navy">
                      {title}
                    </h3>
                    <p className="m-0 mb-4 text-sm leading-[1.7] text-brand-ink-mid">
                      {desc}
                    </p>
                  </div>
                </Reveal>
              ),
            )}
          </div>
        </div>

        <div className="pointer-events-none absolute -bottom-0 left-0 w-full translate-y-px">
          <img src={divider3} className="h-auto w-full object-bottom" alt="" />
        </div>
      </section>

      {/* ── CUSTOMER STORIES ── */}
      <section
        id="testimonials"
        className="relative overflow-hidden bg-brand-navy px-6 py-25"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <span className="text-sm text-white/55">Customer stories</span>
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 border-b border-white/40 pb-1 text-sm font-semibold text-white no-underline transition-colors duration-200 hover:border-white"
            >
              Share your story
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <h2 className="m-0 mb-10 max-w-[24ch] font-display text-[clamp(1.7rem,3.6vw,2.7rem)] leading-[1.2] font-extrabold tracking-[-1px] text-white">
            Designed for people who care about their people.
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {WALL.map((card, i) => (
              <Reveal key={card.key} delay={(i % 4) * 70}>
                <WallCard card={card} />
              </Reveal>
            ))}
          </div>
        </div>
        
      </section>

      {/* ── ABOUT ── */}
      <section
        id="about"
        // Two background layers, one of which is a bundler-hashed URL, so the
        // whole shorthand stays inline. Colours still come from the theme.
        style={{
          backgroundImage: `url(${bg_texture}), linear-gradient(135deg, var(--color-brand-navy), var(--color-brand-navy-mid))`,
        }}
        className="relative overflow-hidden bg-cover bg-center bg-blend-overlay px-6 py-25"
      >
        <div className="pointer-events-none absolute top-0 left-0 w-full -translate-y-px">
          <img src={divider5} className="h-auto w-full object-bottom" alt="" />
        </div>

        {/*
          Colour bridge into the FINAL CTA. The ramp starts on a fully
          transparent navy-mid rather than `transparent` — the keyword resolves
          to rgba(0,0,0,0), which would fade the section through black on its
          way down. The last stop is the CTA's exact #ebf5ff, so the seam
          between the two sections disappears.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[280px] bg-[linear-gradient(180deg,rgba(26,37,69,0)_0%,rgba(26,37,69,0.85)_18%,#24406b_45%,#7fa8dd_78%,#ebf5ff_100%)]"
        />

        <div className="relative z-10 mx-auto max-w-[1000px]">
          <Reveal>
            <div className="mb-16 text-center">
              <div className="mb-4">
                <BantaHRLogo variant="light" size="md" />
              </div>
              <h2 className="m-0 mb-5 font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold tracking-[-0.8px] text-white">
                Why We Built BantaHR
              </h2>
              <p className="mx-auto max-w-[680px] text-[17px] leading-[1.8] text-white/70">
                Nigerian and African businesses deserve HR software built for
                their reality — not adapted from tools designed for Silicon
                Valley. We built BantaHR from the ground up for local payroll
                laws, local compliance requirements, and the way African teams
                actually work.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, desc, tint, text }, i) => (
              <Reveal
                key={title}
                delay={i * 70}
                className={
                  VALUES.length % 3 === 1 && i === VALUES.length - 1
                    ? "lg:col-start-2"
                    : ""
                }
              >
                <div className="h-full rounded-[20px] border border-white/10 bg-white/5 px-6 py-7">
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] ${tint}`}
                  >
                    <Icon size={22} className={text} />
                  </div>
                  <h3 className="m-0 mb-2 font-display text-[17px] font-bold text-white">
                    {title}
                  </h3>
                  <p className="m-0 text-sm leading-[1.7] text-white/60">
                    {desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative overflow-hidden bg-[#ebf5ff] px-6 py-25 text-center">
        <img
          src={bg_blue}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 w-full select-none mix-blend-multiply"
        />
        <img
          src={bg_blue2}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-[-10%] z-0 block w-[80%] max-w-none translate-y-[4%] select-none opacity-70 lg:right-[-8%] lg:w-[70%] lg:translate-y-[8%] lg:opacity-90"
        />

        <Reveal>
          <div className="relative z-10 mx-auto max-w-[680px]">
            <DotLottieReact
              src="https://lottie.host/47d8e667-1133-489a-b44c-77f54012565c/32KiwoiIuX.lottie"
              loop
              autoplay
            />

            <h2 className="m-0 mb-5 font-display text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.8px] text-brand-navy">
              Ready to Transform Your{" "}
              <span className="bg-[linear-gradient(120deg,var(--color-brand-indigo),#0ea5e9)] bg-clip-text text-transparent">
                HR?
              </span>
            </h2>
            <p className="m-0 mb-10 text-lg leading-[1.7] text-slate-600">
              Join 50+ companies using BantaHR to build happier, more
              productive teams.
            </p>
            <button
              onClick={goDemo}
              className="inline-flex cursor-pointer items-center gap-2 rounded-[14px] border-0 bg-brand-navy px-11 py-4.5 text-[17px] font-extrabold text-white shadow-[0_8px_30px_rgba(15,22,41,0.25)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(15,22,41,0.35)]"
            >
              Request Your Free Demo <ArrowRight size={18} />
            </button>
            <p className="mt-4 text-[13px] text-slate-500">
              No debit card required · Set up in 48 hours · We handle onboarding
            </p>
          </div>
        </Reveal>
      </section>

      <MarketingFooter />
    </div>
  );
}
