// src/pages/Pricing.jsx
// BantaHR — standalone pricing page.
//
// Layout follows the Metaview pricing page: eyebrow + two-line headline,
// a segmented switcher that swaps the whole card set, a white card tray,
// a bordered "what you always get" grid, a dark FAQ accordion, and a
// dark closing CTA.
//
// ⚠️ PRICING DATA — there is NO free tier; do not reintroduce one. Growth and
// Enterprise are real plans. The "Scale" tier, the employee caps and every
// annual price are still PLACEHOLDERS invented to fill out the layout.
//
// These figures also contradict Terms of Service §4.1, which states Growth is
// ₦2,769 per employee/month with a minimum of 5 employees. /terms renders the
// contract faithfully, so the two public pages currently disagree. Reconcile
// before launch — the Terms are the binding instrument.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Check,
  Minus,
  Plus,
  Shield,
  Globe,
  LifeBuoy,
  Rocket,
  ArrowRight,
} from "lucide-react";

import MarketingNav, {
  handleSpotlightMove,
} from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";

import bg_blue4 from "../assets/blue_bg.png";

const BILLING = [
  { id: "monthly", label: "Monthly" },
  { id: "annual", label: "Annual — save 20%" },
];

const PLANS = [
  {
    id: "growth",
    eyebrow: "For growing teams",
    name: "Growth",
    price: { monthly: "₦999", annual: "₦799" },
    was: { monthly: "₦1,259", annual: "₦1,007" },
    unit: "monthly per employee",
    badge: "Most popular",
    highlighted: true,
    cta: "Request Demo",
    to: "/request-demo",
    blurb:
      "Full HR, payroll and performance for one predictable per-employee price. Minimum 1 employee, no setup fee.",
    features: [
      "Unlimited employees (min. 1)",
      "Payroll Processing (PAYE, PFA, NHF, NSITF)",
      "Document Management & e-signing",
      "Performance Management",
      "HR Analytics Dashboard",
      "Email & chat support",
    ],
  },
  {
    id: "scale",
    eyebrow: "For multi-site teams",
    name: "Scale",
    price: { monthly: "₦1,899", annual: "₦1,519" },
    unit: "monthly per employee",
    cta: "Request Demo",
    to: "/request-demo",
    blurb:
      "For organisations running several entities, complex approval chains and higher compliance obligations.",
    features: [
      "Everything in Growth",
      "Multi-entity / subsidiary support",
      "Custom approval workflows",
      "Advanced reporting & exports",
      "Offboarding automation",
      "Audit trail & access logs",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    eyebrow: "For organisations",
    name: "Enterprise",
    price: { monthly: "Tailored pricing", annual: "Tailored pricing" },
    unit: "",
    cta: "Contact Sales",
    to: "/request-demo",
    blurb:
      "Custom contracts, SLA guarantees and dedicated support for large organisations. Volume discounts available.",
    features: [
      "Everything in Scale",
      "Custom integrations & API access",
      "Dedicated Customer Success Manager",
      "SLA guarantee (99.9% uptime)",
      "On-site training & onboarding",
      "Custom reporting & exports",
      "Priority 24/7 support",
    ],
  },
];

const GUARANTEES = [
  {
    icon: Shield,
    title: "Bank-grade security.",
    desc: "Your employee data is encrypted at rest and in transit, with role-based access control and NDPR-aligned handling on every plan — not just Enterprise.",
  },
  {
    icon: Globe,
    title: "Nigerian compliance built in.",
    desc: "PAYE, pension (PFA), NHF and NSITF are calculated natively, not bolted on. When rates change, we update them for you — no plan surcharge.",
  },
  {
    icon: LifeBuoy,
    // Renamed off "Free onboarding" — on a page that now states there is no
    // free tier, the word invites exactly the wrong inference.
    title: "Onboarding & migration included.",
    desc: "We move your existing records in and configure your company for you. Every paid plan includes onboarding by our team, with no setup fee.",
  },
  {
    icon: Rocket,
    title: "No lock-in.",
    desc: "Month-to-month by default. Change plan, add employees, or export your data and leave whenever you want — your records belong to you.",
  },
];

const FAQS = [
  {
    q: "Who is BantaHR built for?",
    a: "Any Nigerian or African business with employees to manage — from a 5-person startup to a 5,000-person group. HR admins run the platform, managers approve leave and appraisals, and employees self-serve their own profiles, payslips and requests.",
  },
  {
    q: "How is BantaHR priced?",
    a: "Per employee, per month. You pay only for the people actually on your payroll that month — add someone mid-cycle and you are billed pro-rata; offboard someone and they drop off the next invoice. There is no platform fee on top.",
  },
  {
    q: "Is there a minimum number of employees?",
    a: "The Growth plan starts at a single employee. There is no free tier — every plan is paid — but you can see the platform running against your own data in a demo before you commit.",
  },
  {
    q: "Does BantaHR handle statutory deductions?",
    a: "Yes. PAYE, pension contributions (PFA), NHF and NSITF are calculated automatically on every payroll run, with payslips and audit-ready reports generated for each cycle. Compliance updates ship to every plan at no extra cost.",
  },
  {
    q: "How long does setup take?",
    a: "Most companies are live within 48 hours. Book a demo, we handle the data migration and company configuration, then we train your HR team. You do not need to prepare anything beyond your current employee records.",
  },
  {
    q: "Can I change or cancel my plan?",
    a: "Any time, from your admin settings. Upgrades apply immediately and are pro-rated; downgrades take effect at your next billing date. There is no cancellation fee and no long-term contract on Growth or Scale.",
  },
  {
    q: "Do I need a card to book a demo?",
    a: "No. A demo costs nothing and needs no payment details. We only ask for those when you subscribe, and we will always show you the exact monthly figure before you confirm.",
  },
];

function PlanCard({ plan, cycle }) {
  const price = plan.price[cycle];
  const was = plan.was?.[cycle];

  return (
    <div className="flex h-full flex-col">
      {/*
        Price tile — fixed height across the row so the CTAs below share a
        baseline. Height is only predictable because the price block always
        occupies exactly two lines: figure on one, unit on the next. The unit
        line is rendered even when empty (Enterprise quotes "Tailored pricing"
        with no unit) so it still reserves its row.

        The earlier flex-wrap layout put price and unit on one line and let
        them wrap, which made each tile a different height depending on how the
        text happened to break — that is what knocked the buttons out of line.
      */}
      <div
        className={`relative flex h-[188px] flex-col rounded-2xl p-6 transition-shadow duration-200 ${
          plan.highlighted
            ? "bg-brand-indigo/[0.07] ring-2 ring-brand-indigo"
            : "bg-brand-indigo/[0.04] ring-1 ring-brand-line"
        }`}
      >
        {plan.badge && (
          <span className="absolute -top-3 right-4 rounded-full bg-linear-135 from-brand-indigo to-brand-cyan px-3 py-1 text-[11px] font-bold text-white">
            {plan.badge}
          </span>
        )}

        <p className="m-0 truncate text-sm text-brand-ink-muted">
          {plan.eyebrow}
        </p>
        <p className="m-0 mt-1 truncate font-display text-[2rem] leading-tight font-extrabold text-brand-navy">
          {plan.name}
        </p>

        <div className="mt-auto">
          <div className="flex items-baseline gap-x-2">
            {was && (
              <span className="text-sm text-brand-ink-muted line-through">
                {was}
              </span>
            )}
            <span
              className={`truncate font-display leading-none font-extrabold text-brand-navy ${
                plan.unit ? "text-[2rem]" : "text-xl"
              }`}
            >
              {price}
            </span>
          </div>
          <p className="m-0 mt-1.5 h-5 truncate text-sm text-brand-ink-muted">
            {plan.unit}
          </p>
        </div>
      </div>

      {/* CTA */}
      <Link
        to={plan.to}
        className={`mt-4 block rounded-full px-6 py-3.5 text-center text-sm font-bold no-underline transition-opacity duration-200 hover:opacity-[0.88] ${
          plan.highlighted
            ? "bg-brand-indigo text-white"
            : "bg-brand-navy text-white"
        }`}
      >
        {plan.cta}
      </Link>

      {/* Reserved for the tallest blurb in the row so the tick lists start on
          the same line. Only from sm up — stacked cards have no row to match. */}
      <p className="mt-5 text-sm leading-[1.7] text-brand-ink-mid sm:min-h-[76px]">
        {plan.blurb}
      </p>

      <div className="mt-5 flex flex-col gap-2.5">
        {plan.features.map((f) => (
          <div key={f} className="flex items-start gap-2.5">
            <span className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <Check size={10} strokeWidth={3} className="text-emerald-600" />
            </span>
            <span className="text-[13px] leading-[1.6] text-brand-ink-mid">
              {f}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqRow({ item, open, onToggle, index }) {
  const panelId = `faq-panel-${index}`;
  const buttonId = `faq-button-${index}`;

  return (
    <div className="border-b border-white/10">
      <h3 className="m-0">
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className={`flex w-full cursor-pointer items-center gap-5 border-0 bg-transparent py-6 text-left font-display text-lg font-bold transition-colors duration-200 sm:text-xl ${
            open ? "text-white" : "text-white/45 hover:text-white/80"
          }`}
        >
          <span className="shrink-0">
            {open ? <Minus size={18} /> : <Plus size={18} />}
          </span>
          {item.q}
        </button>
      </h3>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="pb-6 pl-[38px]"
        >
          <p className="m-0 max-w-[70ch] text-[15px] leading-[1.8] text-white/55">
            {item.a}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Pricing() {
  const navigate = useNavigate();
  const [cycle, setCycle] = useState("monthly");
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="overflow-x-hidden bg-white font-body text-brand-ink">
      <MarketingNav />

      {/* ── HERO + PLAN TRAY ── */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#EEF2FF_0%,#F4F5FC_45%,#FFFFFF_100%)] px-6 pt-40 pb-24">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.10),transparent_70%)]" />
        <div className="pointer-events-none absolute top-40 -right-30 h-100 w-100 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.12),transparent_70%)]" />

        <div className="relative z-[1] mx-auto max-w-[1180px]">
          <div className="text-center">
            <span className="text-sm text-brand-ink-muted">Pricing</span>
            <h1 className="mx-auto mt-3 mb-0 max-w-[16ch] font-display text-[clamp(2.2rem,5.2vw,4rem)] leading-[1.08] font-extrabold tracking-[-1.5px] text-brand-navy">
              Pick what you need. Pay for who you employ.
            </h1>

            {/* Billing switcher — swaps the whole card set */}
            <div
              role="tablist"
              aria-label="Billing period"
              className="mt-10 inline-flex flex-wrap items-center justify-center gap-1 rounded-xl bg-white/60 p-1 ring-1 ring-brand-line"
            >
              {BILLING.map(({ id, label }) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={cycle === id}
                  onClick={() => setCycle(id)}
                  className={`cursor-pointer rounded-lg border-0 px-5 py-2.5 text-sm transition-colors duration-200 ${
                    cycle === id
                      ? "bg-brand-navy font-semibold text-white"
                      : "bg-transparent font-medium text-brand-ink-muted hover:text-brand-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Card tray */}
          <div className="mt-14 rounded-[32px] bg-white p-6 shadow-[0_24px_70px_rgba(15,22,41,0.10)] sm:p-8">
            {/* Three columns, not four — the Free tier is gone and a 4-col
                grid would leave a hole in the tray. */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {PLANS.map((plan) => (
                <PlanCard key={plan.id} plan={plan} cycle={cycle} />
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-sm leading-[1.7] text-brand-ink-muted">
            All plans include onboarding by our team at no extra cost. No
            setup fee, and no long-term lock-in — cancel anytime.
          </p>
        </div>
      </section>

      {/* ── GUARANTEES ── */}
      <section className="bg-white px-6 py-25">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="m-0 mb-16 text-center font-display text-[clamp(1.6rem,3.4vw,2.6rem)] font-extrabold tracking-[-0.8px] text-brand-navy">
            What you get{" "}
            <span className="text-brand-ink-muted">no matter the plan.</span>
          </h2>

          <div className="grid grid-cols-1 border-t border-brand-line md:grid-cols-2">
            {GUARANTEES.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className={`relative border-b border-brand-line px-2 py-10 md:px-8 ${
                  i % 2 === 0 ? "md:border-r" : ""
                }`}
              >
                <span className="absolute top-10 right-2 text-[11px] text-brand-ink-muted md:right-8">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Icon
                  size={22}
                  strokeWidth={1.6}
                  className="text-brand-ink-muted"
                />
                <h3 className="mt-6 mb-3 font-display text-xl font-bold text-brand-navy">
                  {title}
                </h3>
                <p className="m-0 max-w-[52ch] text-[15px] leading-[1.7] text-brand-ink-mid">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-brand-navy px-6 py-25">
        <div className="mx-auto max-w-[1000px]">
          <h2 className="m-0 mb-10 font-display text-[clamp(2rem,5vw,3.2rem)] font-extrabold tracking-[-1px] text-white">
            FAQ
          </h2>

          <div className="border-t border-white/10">
            {FAQS.map((item, i) => (
              <FaqRow
                key={item.q}
                item={item}
                index={i}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section className="relative overflow-hidden bg-linear-135 from-brand-indigo via-brand-indigo-light to-brand-cyan px-6 py-25 text-center">
        {/*
          Light burst along the bottom edge, same treatment as the landing
          page's final CTA. No blend mode here: blue_bg.png carries a real
          alpha channel and this section is dark, so it composites straight
          over the gradient — mix-blend-multiply would only muddy it.
        */}
        <img
          src={bg_blue4}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 w-full select-none opacity-70"
        />

        <div className="relative z-10 mx-auto max-w-[680px]">
          <h2 className="m-0 mb-5 font-display text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.8px] text-white">
            HR software your team will actually use.
          </h2>
          <p className="m-0 mb-10 text-lg leading-[1.7] text-white/80">
            Let us walk you through the platform with your own data, then get
            set up in 48 hours.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate("/request-demo")}
              onMouseMove={handleSpotlightMove}
              className="group relative isolate inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-full border-0 bg-white px-9 py-4 text-base font-extrabold text-brand-indigo shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(0,0,0,0.25)]"
            >
              <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(140px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(79,70,229,.18),transparent_70%)] opacity-0 transition-opacity duration-[250ms] ease-[ease] group-hover:opacity-100" />
              <span className="relative z-[2] flex items-center gap-2">
                Request a Demo
                <ArrowRight size={18} />
              </span>
            </button>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/70 px-9 py-4 text-base font-bold text-white no-underline transition-colors duration-200 hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>

      </section>

      <MarketingFooter />
    </div>
  );
}
