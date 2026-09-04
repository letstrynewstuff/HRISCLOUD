// src/pages/TrustCenter.jsx
// BantaHR — Trust Center.
//
// Layout follows the Metaview/SafeBase trust-portal pattern: a security-review
// banner, searchable control categories, a knowledge base, a gated document
// list and a sub-processor register. Expanding a card — via the ⤢ control or
// "View more" — opens a right-hand slide-over with the full detail.
//
// SOURCING RULE FOR THIS PAGE: every control, commitment and figure below is
// lifted from one of the four BantaHR legal documents, and each drawer detail
// names the document it comes from. A Trust Center is read by security
// reviewers as a set of binding claims, so nothing here is inferred, rounded
// or invented. If a control is not in the documents, it is not on this page —
// see the KNOWN GAPS note at the bottom of this file.

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Archive,
  ArrowRight,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Globe,
  Headphones,
  KeyRound,
  Lock,
  Mail,
  Maximize2,
  MonitorCheck,
  Scale,
  Search,
  Server,
  Shield,
  ShieldAlert,
  X,
} from "lucide-react";

import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";

// NB: .jpg copies, not the .jfif originals. Vite has no mime entry for .jfif,
// so any .jfif small enough to fall under assetsInlineLimit (4 KB) is inlined
// as `data:application/octet-stream`, which browsers will not render in an
// <img>. SupaBase.jfif is 3 KB and broke exactly that way; zoho.jfif is 4.3 KB
// and would break the moment it was optimised. .jpg is byte-identical here —
// JFIF *is* JPEG — and has a mime entry everywhere.
import ndpcBadge from "../assets/compliance/NDPC-copped.png";
import cacBadge from "../assets/compliance/CAC.jpg";
import dunsBadge from "../assets/compliance/Duns.png";
import awsLogo from "../assets/sub-processor/AWS.png";
import supabaseLogo from "../assets/sub-processor/SupaBase.jpg";
import cloudinaryLogo from "../assets/sub-processor/Cloudinary.png";
import zohoLogo from "../assets/sub-processor/zoho.jpg";

const CONTACT_EMAIL = "support@bantahr.com";

const OVERVIEW = [
  "BantaHR is a cloud-based Human Resource Information System delivered as SaaS and purpose-built for Nigerian and African businesses. The platform covers employee management, payroll, leave and attendance, documents, performance, team chat and offboarding.",
  "Under the Nigeria Data Protection Regulation, the subscribing organisation is the Data Controller and BantaHR is the Data Processor. We process employee personal data only on your documented instructions, and we do not sell, rent or trade it.",
  "This portal summarises the controls set out in our Data Processing Agreement, Privacy Policy, Service Level Agreement and Terms of Service. Copies of each are available on request — start a security review and we will send the full set.",
  "For any security or privacy question not answered here, contact us directly and we will respond in writing.",
];

/* Registrations and regulatory credentials. These are the three badge assets
   supplied; each is described by what the badge itself certifies, not by any
   broader compliance claim. */
const COMPLIANCE = [
  {
    logo: ndpcBadge,
    name: "NDPC",
    detail: "Nigeria Data Protection Commission",
    body: "BantaHR processes personal data in accordance with the Nigeria Data Protection Regulation. As Data Processor we process only on the Controller's documented instructions, assist with data subject rights requests, notify confirmed breaches within 72 hours, and maintain the technical and organisational measures set out in our DPA.",
  },
  {
    logo: cacBadge,
    name: "CAC",
    detail: "Corporate Affairs Commission",
    body: "BantaHR is a company registered with the Corporate Affairs Commission, the statutory registrar of companies in the Federal Republic of Nigeria. All BantaHR agreements are governed by Nigerian law, with disputes referred to arbitration in Lagos.",
  },
  {
    logo: dunsBadge,
    name: "D-U-N-S",
    detail: "Dun & Bradstreet registered",
    body: "BantaHR holds a D-U-N-S number, the Dun & Bradstreet global business identifier used in vendor onboarding and procurement checks. The number is available on request for supplier registration.",
  },
];

const CATEGORIES = [
  {
    icon: Shield,
    title: "Data Security",
    items: [
      {
        label: "Encryption at rest — AES-256",
        detail:
          "All stored data is encrypted at rest using AES-256, across every module — employee records, payroll, documents and message history. Listed in the security measures table of the DPA and repeated in the SLA.",
      },
      {
        label: "Encryption in transit — TLS 1.2/1.3",
        detail:
          "All data transmitted between your browser and the platform is protected with TLS 1.2 or 1.3, as set out in the DPA security measures.",
      },
      {
        label: "End-to-end encryption for team chat",
        detail:
          "Messages sent through BantaHR's team chat are end-to-end encrypted. BantaHR does not read, access or store the content of those messages in unencrypted form — stated in the Privacy Policy and the SLA.",
      },
      {
        label: "Tenant data isolation",
        detail:
          "The platform is multi-tenant with strict logical separation between subscribing organisations, so one tenant's records are not reachable from another tenant's session.",
      },
      {
        label: "Automated daily backups",
        detail:
          "Backups run automatically every day, per the DPA security measures.",
      },
      {
        label: "Point-in-time recovery",
        detail:
          "Backups support point-in-time recovery, allowing restoration to a specific moment rather than only the most recent snapshot.",
      },
      {
        label: "Audit logs and anomaly detection",
        detail:
          "Full access logs are retained and monitored with anomaly detection, giving a record of who accessed what and flagging unusual patterns.",
      },
    ],
  },
  {
    icon: KeyRound,
    title: "Access Control",
    items: [
      {
        label: "Role-Based Access Control across all modules",
        detail:
          "RBAC is applied across every module. Permissions follow the user's role, so an employee, a manager and an HR administrator each see a different slice of the same organisation's data.",
      },
      {
        label: "Least-privilege data access",
        detail:
          "Users only access data relevant to their role, as stated in the Privacy Policy security measures and the SLA.",
      },
      {
        label: "Personnel bound by confidentiality",
        detail:
          "Under the DPA, BantaHR ensures all personnel with access to personal data are bound by confidentiality obligations.",
      },
      {
        label: "Unique credentials, no sharing",
        detail:
          "The Terms of Service require customers to use a strong, unique password and not to share login credentials with unauthorised persons.",
      },
      {
        label: "Unauthorised-access reporting duty",
        detail: `Customers must notify BantaHR immediately at ${CONTACT_EMAIL} if they suspect unauthorised access to their account.`,
      },
    ],
  },
  {
    icon: Lock,
    title: "Data Privacy",
    items: [
      {
        label: "Processing only on documented instruction",
        detail:
          "BantaHR processes personal data only on the Data Controller's documented instructions, and will not process data in a way the Controller has not instructed.",
      },
      {
        label: "No sale, rent or trade of personal data",
        detail:
          "The Privacy Policy states plainly that BantaHR does not sell, rent or trade personal data to third parties. Sharing is limited to your organisation, regulated financial institutions for payroll disbursement, regulators such as FIRS and pension administrators where Nigerian law requires, and bound sub-processors.",
      },
      {
        label: "Data subject access & rectification",
        detail:
          "Data subjects may request a copy of the personal data held about them and request correction of inaccurate or incomplete records.",
      },
      {
        label: "Erasure and data portability",
        detail:
          "Data subjects may request deletion where there is no lawful basis to retain data, and may receive their data in a structured, machine-readable format.",
      },
      {
        label: "Right to object and withdraw consent",
        detail:
          "Data subjects may object to processing for direct marketing, and where processing rests on consent they may withdraw it at any time.",
      },
      {
        label: "30-day response to rights requests",
        detail: `Rights requests sent to ${CONTACT_EMAIL} are answered within 30 days, per the Privacy Policy.`,
      },
      {
        label: "Requests forwarded within 5 business days",
        detail:
          "Where a data subject contacts BantaHR directly, the request is forwarded to you as Data Controller within 5 business days. BantaHR does not respond directly without your authorisation, except where required by law.",
      },
      {
        label: "Essential cookies only — no ad tracking",
        detail:
          "BantaHR uses essential cookies to maintain sessions and platform functionality. No third-party advertising cookies are used.",
      },
    ],
  },
  {
    icon: ShieldAlert,
    title: "Incident Response",
    items: [
      {
        label: "Breach notification within 72 hours",
        detail:
          "On a confirmed personal data breach, BantaHR notifies the Data Controller without undue delay and within 72 hours of becoming aware.",
      },
      {
        label: "Regulator notification support",
        detail:
          "BantaHR provides enough information for you to notify the regulator and affected data subjects as required.",
      },
      {
        label: "Containment, investigation, remediation",
        detail:
          "Immediate steps are taken to contain, investigate and remediate any breach.",
      },
      {
        label: "Register of all breaches, including unreported",
        detail:
          "BantaHR maintains a record of all breaches, including those that did not meet the threshold for regulatory reporting.",
      },
      {
        label: "Full cooperation with regulatory investigation",
        detail:
          "BantaHR cooperates fully with any regulatory investigation arising from an incident.",
      },
      {
        label: "P1–P4 severity classification",
        detail:
          "Incidents are classified P1 to P4. P1 covers complete unavailability or payroll/data-loss risk; P2 a major feature outage; P3 a minor impairment with a workaround; P4 general enquiries and cosmetic issues. Response and resolution targets attach to each tier in the SLA.",
      },
    ],
  },
  {
    icon: Activity,
    title: "Availability",
    items: [
      {
        label: "99.5% monthly uptime — Growth",
        detail:
          "The Growth plan carries a 99.5% monthly uptime target, allowing roughly 3.6 hours of downtime per month.",
      },
      {
        label: "99.9% monthly uptime — Enterprise",
        detail:
          "The Enterprise plan carries a 99.9% monthly uptime target, allowing roughly 43 minutes of downtime per month.",
      },
      {
        label: "Maintenance 12:00–4:00 WAT, weekends",
        detail:
          "Scheduled maintenance runs outside peak business hours, typically between 12:00 AM and 4:00 AM West Africa Time at weekends.",
      },
      {
        label: "48 hours advance maintenance notice",
        detail:
          "Customers receive at least 48 hours' notice of planned maintenance by email and in-platform announcement. Announced maintenance is excluded from uptime calculations.",
      },
      {
        label: "Service credits for missed uptime",
        detail:
          "If BantaHR misses the uptime commitment, service credits of 10%, 20% or 30% of the monthly fee apply depending on the shortfall. Credit requests go to support within 30 days of the incident and are answered within 14 business days.",
      },
    ],
  },
  {
    icon: Server,
    title: "Infrastructure",
    items: [
      {
        label: "Multi-tenant with strict logical isolation",
        detail:
          "The platform runs on secure multi-tenant infrastructure with strict logical data isolation between organisations.",
      },
      {
        label: "Regular security audits",
        detail:
          "BantaHR performs regular security audits, as stated in the Privacy Policy and the DPA security measures.",
      },
      {
        label: "Vulnerability assessments",
        detail:
          "Regular vulnerability assessments are carried out alongside the security audit programme.",
      },
      {
        label: "Penetration testing",
        detail:
          "Penetration testing is listed in the DPA security measures table as part of the regular assurance programme.",
      },
    ],
  },
  {
    icon: MonitorCheck,
    title: "Product Security",
    items: [
      {
        label: "Role-based module access",
        detail:
          "Access to each product module is governed by the user's assigned role, so permissions are enforced consistently across payroll, leave, documents and performance.",
      },
      {
        label: "Full access logging",
        detail:
          "The platform maintains full access logs covering reads and changes to personal data.",
      },
      {
        label: "Anomaly detection monitoring",
        detail:
          "Access logs are monitored with anomaly detection to surface unusual access patterns.",
      },
      {
        label: "Encrypted in-platform messaging",
        detail:
          "All in-platform communications and messages are end-to-end encrypted.",
      },
    ],
  },
  {
    icon: Archive,
    title: "Data Retention",
    items: [
      {
        label: "Full data export within 30 days of termination",
        detail:
          "On termination you may request a complete export of your data, in a standard format, within 30 days.",
      },
      {
        label: "Secure deletion within 90 days",
        detail:
          "All personal data is securely deleted from BantaHR systems within 90 days of termination, other than records the law requires us to keep.",
      },
      {
        label: "Statutory payroll retention — 6 years",
        detail:
          "Records Nigerian law requires to be retained — payroll and tax records, typically 6 years — are held for the statutory period and then securely destroyed.",
      },
      {
        label: "Written confirmation of deletion on request",
        detail:
          "BantaHR provides written confirmation that data has been deleted, on request.",
      },
    ],
  },
  {
    icon: Globe,
    title: "Data Residency",
    items: [
      {
        label: "Stored in Nigeria or adequate jurisdictions",
        detail:
          "BantaHR stores and processes Customer data within Nigeria, or within jurisdictions recognised as providing an adequate level of data protection under the NDPR.",
      },
      {
        label: "Safeguards required before any transfer",
        detail:
          "No personal data is transferred outside Nigeria without appropriate safeguards in place.",
      },
      {
        label: "Controller notified of transfers",
        detail:
          "The Data Controller is notified before any transfer of personal data outside Nigeria.",
      },
    ],
  },
  {
    icon: Scale,
    title: "Legal",
    items: [
      {
        label: "Data Processing Agreement",
        detail:
          "A DPA forms part of the agreement between BantaHR as Data Processor and your organisation as Data Controller. Where it conflicts with the Terms of Service, the DPA prevails on data protection matters.",
      },
      {
        label: "Sub-processor register",
        detail:
          "You grant general authorisation for BantaHR to engage sub-processors. All are bound by agreements no less protective than the DPA, and a full list is available on request.",
      },
      {
        label: "30-day notice of sub-processor change",
        detail:
          "BantaHR notifies the Data Controller at least 30 days in advance of any intended change to sub-processors.",
      },
      {
        label: "Customer retains ownership of all data",
        detail:
          "Customers retain ownership of all data uploaded to the platform. BantaHR holds a limited, non-exclusive licence to process it solely to deliver the service.",
      },
      {
        label: "Governing law — Federal Republic of Nigeria",
        detail:
          "All BantaHR agreements are governed by the laws of the Federal Republic of Nigeria, including the NDPR.",
      },
      {
        label: "Arbitration in Lagos",
        detail:
          "Disputes are first addressed through good-faith negotiation. If unresolved within 30 days, they are referred to arbitration in Lagos under the Arbitration and Conciliation Act (Cap A18 LFN 2004).",
      },
    ],
  },
  {
    icon: Headphones,
    title: "Support",
    items: [
      {
        label: "Email support — all plans",
        detail: `Email support at ${CONTACT_EMAIL} is available on every plan.`,
      },
      {
        label: "In-app live chat — all plans",
        detail:
          "Live chat inside the BantaHR platform is available on every plan.",
      },
      {
        label: "Phone support — Enterprise",
        detail: "A dedicated phone line is available to Enterprise customers.",
      },
      {
        label: "Dedicated Customer Success Manager — Enterprise",
        detail:
          "Enterprise customers are assigned a named Customer Success Manager.",
      },
      {
        label: "On-site support on request — Enterprise",
        detail:
          "On-site support and training are available to Enterprise customers on request.",
      },
      {
        label: "Business hours 08:00–18:00 WAT, Mon–Fri",
        detail:
          "Business hours are 8:00 AM to 6:00 PM West Africa Time, Monday to Friday, excluding Nigerian public holidays. Enterprise customers receive 24/7 support.",
      },
    ],
  },
  {
    icon: ClipboardCheck,
    title: "Acceptable Use",
    items: [
      {
        label: "Lawful basis required for all uploaded data",
        detail:
          "Customers must not use the service to process data of individuals without their knowledge or a lawful basis, and must ensure employee consent is obtained where the NDPR requires it.",
      },
      {
        label: "No unauthorised access attempts",
        detail:
          "Attempting to gain unauthorised access to any part of the platform or its infrastructure is prohibited.",
      },
      {
        label: "No malicious code",
        detail:
          "Uploading malicious code, viruses or any software designed to disrupt the service is prohibited.",
      },
      {
        label: "No reverse engineering",
        detail:
          "Reverse engineering, decompiling or attempting to extract the platform's source code is prohibited.",
      },
      {
        label: "No resale or sublicensing",
        detail:
          "Reselling, sublicensing or providing third-party access to the service without written consent is prohibited. Breach may result in immediate suspension or termination without refund.",
      },
    ],
  },
];

/* Sub-processors. The DPA does not name these individually — it describes
   "cloud infrastructure providers and email delivery services" and states a
   full list is available on request. Purposes below stay at that level of
   description rather than detailing what each provider touches, and the
   processing region is deliberately omitted rather than guessed: residency is
   a binding claim under the DPA.
   `dark` marks logos supplied on a black background, which need no white tile. */
const SUBPROCESSORS = [
  {
    logo: awsLogo,
    name: "Amazon Web Services",
    purpose: "Cloud infrastructure hosting and storage",
  },
  {
    logo: supabaseLogo,
    name: "Supabase",
    purpose: "Managed database infrastructure",
    dark: true,
  },
  {
    logo: cloudinaryLogo,
    name: "Cloudinary",
    purpose: "Document and media storage and delivery",
  },
  { logo: zohoLogo, name: "Zoho", purpose: "Email delivery" },
];

const FAQS = [
  {
    q: "Where is our data stored?",
    a: "Within Nigeria, or within jurisdictions recognised as providing an adequate level of protection under the NDPR. BantaHR will not transfer personal data outside Nigeria without appropriate safeguards in place and notice to you as Data Controller.",
  },
  {
    q: "How is our data encrypted?",
    a: "AES-256 for data at rest and TLS 1.2/1.3 for data in transit. In-platform team chat is end-to-end encrypted — BantaHR does not read, access or store those message contents in unencrypted form.",
  },
  {
    q: "Who at BantaHR can access our employees' data?",
    a: "Access is governed by Role-Based Access Control, so users only reach data relevant to their role. BantaHR processes personal data solely on your documented instructions, and all personnel with access are bound by confidentiality obligations.",
  },
  {
    q: "How quickly are data breaches reported?",
    a: "Within 72 hours of BantaHR becoming aware of a confirmed breach. We provide enough detail for you to notify the regulator and affected data subjects, and we maintain a register of all breaches — including those not reported to regulators.",
  },
  {
    q: "What happens to our data if we leave?",
    a: "You may request a full data export within 30 days of termination. All personal data is securely deleted within 90 days, except records Nigerian law requires us to retain — payroll records for 6 years — which are held for the statutory period and then destroyed. Written confirmation of deletion is available on request.",
  },
  {
    q: "Do you use sub-processors, and will we be told about changes?",
    a: "Yes. You grant general authorisation for BantaHR to engage sub-processors, and we notify you at least 30 days before any intended change. All sub-processors are bound by agreements no less protective than our DPA.",
  },
  {
    q: "What uptime do you commit to?",
    a: "99.5% monthly uptime on Growth and 99.9% on Enterprise. Scheduled maintenance runs between 12:00 AM and 4:00 AM WAT at weekends with at least 48 hours' notice, and is excluded from uptime calculations. Service credits apply if we miss the target.",
  },
  {
    q: "How do we exercise data subject rights?",
    a: `Contact ${CONTACT_EMAIL}. Under the NDPR you have rights of access, rectification, erasure, portability, objection, and withdrawal of consent. We respond within 30 days. Requests reaching BantaHR directly are forwarded to you as Data Controller within 5 business days.`,
  },
];

/* Document register. `file` stays null until the PDFs are committed — drop
   them into public/docs/ and set the path to turn a row into a direct
   download. Nothing here links out yet, so no row can 404. */
const DOCUMENTS = [
  { category: "Legal", name: "Data Processing Agreement (DPA)", version: "v1.0", file: null },
  { category: "Legal", name: "Terms of Service", version: "v1.0", file: null },
  { category: "Privacy", name: "Privacy Policy", version: "v1.0", file: null },
  { category: "Reliability", name: "Service Level Agreement (SLA)", version: "v1.0", file: null },
];

const CARD =
  "rounded-2xl border border-white/10 bg-white/[0.03] transition-colors duration-200";
const PANEL = "rounded-xl border border-white/10 bg-white/[0.03] p-5";

/* ── Slide-over ────────────────────────────────────────────────────────────
   Mounted only while open; the enter transition is a keyframe animation
   (see --animate-drawer-in) rather than a toggled class, which keeps it out
   of an effect. Closing is immediate — an exit animation would need the panel
   to outlive `open`, and the extra state is not worth the 200ms. */
function Drawer({ open, onClose, icon: Icon, title, children }) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // Lock the page behind the panel so scrolling stays inside the drawer.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000]">
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0 animate-scrim-in cursor-default border-0 bg-black/60 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-y-0 right-0 flex w-full max-w-[680px] animate-drawer-in flex-col border-l border-white/10 bg-brand-navy shadow-[-30px_0_80px_rgba(0,0,0,0.5)]"
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-6 py-5">
          {Icon && <Icon size={19} className="shrink-0 text-white/60" />}
          <h2 className="m-0 font-display text-xl font-bold text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            autoFocus
            className="ml-auto flex cursor-pointer items-center rounded-lg border-0 bg-transparent p-1.5 text-white/50 transition-colors duration-200 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

function DrawerItem({ title, children, logo, dark }) {
  return (
    <div className={PANEL}>
      <div className="flex items-start gap-2.5">
        {logo ? (
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded p-0.5 ${
              dark ? "bg-black" : "bg-white"
            }`}
          >
            <img src={logo} alt="" className="max-h-full max-w-full object-contain" />
          </span>
        ) : (
          <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
            <Check size={11} strokeWidth={3} className="text-emerald-400" />
          </span>
        )}
        <h3 className="m-0 font-display text-base font-bold text-white">
          {title}
        </h3>
      </div>
      <div className="mt-3 flex flex-col gap-3 text-sm leading-[1.75] text-white/60">
        {children}
      </div>
    </div>
  );
}

function CategoryCard({ category, expanded, onExpand }) {
  const { icon: Icon, title, items } = category;

  // While a search is active every match is already shown, so there is nothing
  // left to reveal and the "view more" affordance would be misleading.
  const visible = expanded ? items : items.slice(0, 4);
  const hidden = items.length - visible.length;

  return (
    <div className={`${CARD} group flex flex-col p-6 hover:border-white/20`}>
      <div className="flex items-center gap-2.5">
        <Icon size={17} className="shrink-0 text-white/50" />
        <h3 className="m-0 font-display text-lg font-bold text-white">
          {title}
        </h3>
        <button
          type="button"
          onClick={onExpand}
          aria-label={`Expand ${title}`}
          // Plain hover, not group-hover + hover on one property — equal
          // specificity, so generated source order would decide the winner.
          className="ml-auto flex cursor-pointer items-center rounded-md border-0 bg-transparent p-1 text-white/40 transition-colors duration-200 hover:text-white"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-3.5">
        {visible.map(({ label }) => (
          <div key={label} className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
              <Check size={10} strokeWidth={3} className="text-emerald-400" />
            </span>
            <span className="text-sm leading-[1.5] text-white/80">{label}</span>
          </div>
        ))}
      </div>

      {hidden > 0 && (
        <button
          type="button"
          onClick={onExpand}
          className="mt-auto inline-flex cursor-pointer items-center gap-1.5 self-start border-0 bg-transparent pt-5 text-sm font-semibold text-white/70 transition-colors duration-200 hover:text-white"
        >
          View {hidden} more
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

function FaqRow({ item, open, onToggle, index }) {
  const panelId = `trust-faq-${index}`;

  return (
    <div className="border-b border-white/10">
      <h3 className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className={`flex w-full cursor-pointer items-center justify-between gap-5 border-0 bg-transparent py-5 text-left text-[15px] font-semibold transition-colors duration-200 ${
            open ? "text-white" : "text-white/70 hover:text-white"
          }`}
        >
          {item.q}
          <ChevronDown
            size={17}
            className={`shrink-0 text-white/40 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </h3>

      {open && (
        <div id={panelId} className="pb-5">
          <p className="m-0 max-w-[85ch] text-sm leading-[1.75] text-white/55">
            {item.a}
          </p>
        </div>
      )}
    </div>
  );
}

export default function TrustCenter() {
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  // null | { kind: "overview" | "compliance" | "category", title, icon, items }
  const [drawer, setDrawer] = useState(null);

  const q = query.trim().toLowerCase();
  const closeDrawer = () => setDrawer(null);

  const filtered = useMemo(() => {
    if (!q) return CATEGORIES;
    return CATEGORIES.map((c) => {
      // A category matching by title keeps all its controls; otherwise only
      // the controls that match survive.
      if (c.title.toLowerCase().includes(q)) return c;
      const items = c.items.filter((i) => i.label.toLowerCase().includes(q));
      return items.length ? { ...c, items } : null;
    }).filter(Boolean);
  }, [q]);

  const totalControls = CATEGORIES.reduce((n, c) => n + c.items.length, 0);
  const shownControls = filtered.reduce((n, c) => n + c.items.length, 0);

  return (
    <div className="min-h-screen overflow-x-hidden bg-brand-navy font-body">
      <MarketingNav heroTone="dark" />

      <main className="mx-auto max-w-[1180px] px-6 pt-36 pb-24">
        {/* ── Page heading ── */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-sm text-white/50">BantaHR</span>
            <h1 className="m-0 mt-2 font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.1] font-extrabold tracking-[-1.5px] text-white">
              Trust Center
            </h1>
          </div>
          <p className="m-0 max-w-[46ch] text-sm leading-[1.7] text-white/50">
            Security, privacy and compliance practices for the BantaHR HRIS
            platform — every control below is drawn from our published legal
            documents.
          </p>
        </div>

        {/* ── Security review banner ── */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-linear-135 from-brand-indigo to-brand-cyan" />
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h2 className="m-0 font-display text-xl font-bold text-white">
                Start your security review
              </h2>
              <p className="m-0 mt-2 text-sm text-white/55">
                Request the full document set · Ask a security question
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-navy no-underline transition-opacity duration-200 hover:opacity-90"
            >
              <Lock size={14} />
              Get access
            </Link>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5 focus-within:border-white/25">
          <Search size={17} className="shrink-0 text-white/40" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search controls, policies and commitments"
            aria-label="Search trust center controls"
            className="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
          />
          <span className="shrink-0 text-xs whitespace-nowrap text-white/35">
            {q ? `${shownControls} of ${totalControls}` : `${totalControls} controls`}
          </span>
        </div>

        {/* ── Overview + Registrations ── */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className={`${CARD} group p-6`}>
            <div className="flex items-center gap-2.5">
              <FileText size={17} className="text-white/50" />
              <h2 className="m-0 font-display text-lg font-bold text-white">
                Overview
              </h2>
              <button
                type="button"
                onClick={() => setDrawer({ kind: "overview" })}
                aria-label="Expand Overview"
                // Plain hover, not group-hover + hover on one property — equal
          // specificity, so generated source order would decide the winner.
          className="ml-auto flex cursor-pointer items-center rounded-md border-0 bg-transparent p-1 text-white/40 transition-colors duration-200 hover:text-white"
              >
                <Maximize2 size={14} />
              </button>
            </div>
            <p className="m-0 mt-4 text-sm leading-[1.75] text-white/60">
              BantaHR is a cloud-based HRIS built for Nigerian and African
              businesses. Under the NDPR, the subscribing organisation is the{" "}
              <strong className="font-semibold text-white/85">
                Data Controller
              </strong>{" "}
              and BantaHR is the{" "}
              <strong className="font-semibold text-white/85">
                Data Processor
              </strong>{" "}
              — we process employee data only on your documented instructions.
              This portal summarises the controls in our DPA, Privacy Policy,
              SLA and Terms of Service. Copies of each are available on request.
            </p>
          </div>

          <div className={`${CARD} group p-6`}>
            <div className="flex items-center gap-2.5">
              <Shield size={17} className="text-white/50" />
              <h2 className="m-0 font-display text-lg font-bold text-white">
                Compliance
              </h2>
              <button
                type="button"
                onClick={() => setDrawer({ kind: "compliance" })}
                aria-label="Expand Compliance"
                // Plain hover, not group-hover + hover on one property — equal
          // specificity, so generated source order would decide the winner.
          className="ml-auto flex cursor-pointer items-center rounded-md border-0 bg-transparent p-1 text-white/40 transition-colors duration-200 hover:text-white"
              >
                <Maximize2 size={14} />
              </button>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {COMPLIANCE.map(({ logo, name, detail }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setDrawer({ kind: "compliance" })}
                  className="cursor-pointer border-0 bg-transparent p-0 text-center"
                >
                  <span className="mx-auto flex h-16 w-full items-center justify-center rounded-xl bg-white p-2">
                    <img
                      src={logo}
                      alt=""
                      className="max-h-full max-w-full object-contain"
                    />
                  </span>
                  <span className="mt-3 block text-[13px] font-semibold text-white">
                    {name}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-[1.4] text-white/45">
                    {detail}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Control categories ── */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((category) => (
            <CategoryCard
              key={category.title}
              category={category}
              // A search already surfaces every match, so nothing is withheld.
              expanded={Boolean(q)}
              onExpand={() =>
                setDrawer({
                  kind: "category",
                  // Always open the full category, not the filtered subset.
                  category:
                    CATEGORIES.find((c) => c.title === category.title) ??
                    category,
                })
              }
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className={`${CARD} mt-4 p-10 text-center`}>
            <p className="m-0 text-sm text-white/55">
              No controls match “{query}”. Ask us directly at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-semibold text-brand-cyan no-underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>
        )}

        {/* ── Knowledge base ── */}
        <section className="mt-4">
          <div className={`${CARD} p-6 sm:p-8`}>
            <h2 className="m-0 mb-2 font-display text-xl font-bold text-white">
              Knowledge base
            </h2>
            <p className="m-0 mb-4 text-sm text-white/50">
              The questions security reviewers ask most, answered from our
              published documents.
            </p>
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

        {/* ── Documents ── */}
        <section className="mt-4">
          <div className={`${CARD} p-6 sm:p-8`}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="m-0 font-display text-xl font-bold text-white">
                Documents
              </h2>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold text-white no-underline transition-colors duration-200 hover:bg-white/20"
              >
                <Lock size={13} />
                Request access
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {DOCUMENTS.map(({ category, name, version, file }) => {
                const body = (
                  <>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
                      <FileText size={17} className="text-emerald-400" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-bold tracking-[0.08em] text-white/40 uppercase">
                        {category}
                      </span>
                      <span className="block text-sm font-semibold text-white">
                        {name}
                      </span>
                    </span>
                    <span className="ml-auto shrink-0 text-[11px] text-white/35">
                      {version}
                    </span>
                    {!file && <Lock size={13} className="shrink-0 text-white/35" />}
                  </>
                );

                return file ? (
                  <a
                    key={name}
                    href={file}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 no-underline transition-colors duration-200 hover:border-white/25"
                  >
                    {body}
                  </a>
                ) : (
                  <div
                    key={name}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    {body}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Sub-processors ── */}
        <section className="mt-4">
          <div className={`${CARD} p-6 sm:p-8`}>
            <h2 className="m-0 font-display text-xl font-bold text-white">
              Sub-processors
            </h2>
            <p className="m-0 mt-2 mb-6 max-w-[70ch] text-sm leading-[1.7] text-white/50">
              BantaHR notifies customers at least 30 days before adding or
              replacing a sub-processor. All sub-processors are bound by
              agreements no less protective than our DPA. A full list is
              available on request.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-3 text-[11px] font-bold tracking-[0.08em] text-white/40 uppercase">
                      Provider
                    </th>
                    <th className="pb-3 text-[11px] font-bold tracking-[0.08em] text-white/40 uppercase">
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SUBPROCESSORS.map(({ logo, name, purpose, dark }) => (
                    <tr key={name} className="border-b border-white/5">
                      <td className="py-4 pr-6">
                        <span className="flex items-center gap-3">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md p-1 ${
                              dark ? "bg-black" : "bg-white"
                            }`}
                          >
                            <img
                              src={logo}
                              alt=""
                              className="max-h-full max-w-full object-contain"
                            />
                          </span>
                          <span className="text-sm font-semibold whitespace-nowrap text-white">
                            {name}
                          </span>
                        </span>
                      </td>
                      <td className="py-4 text-sm text-white/60">{purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Help strip ── */}
        <section className="mt-4">
          <div className={`${CARD} flex flex-wrap items-center justify-between gap-4 p-6`}>
            <p className="m-0 text-sm text-white/60">
              Questions about this Trust Center, or reporting a vulnerability?
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-bold text-white no-underline transition-colors duration-200 hover:bg-white/10"
            >
              <Mail size={14} />
              {CONTACT_EMAIL}
            </a>
          </div>
        </section>
      </main>

      {/* ── Slide-over panels ── */}
      <Drawer
        open={drawer?.kind === "overview"}
        onClose={closeDrawer}
        icon={FileText}
        title="Overview"
      >
        <div className={PANEL}>
          <div className="flex flex-col gap-4 text-sm leading-[1.8] text-white/65">
            {OVERVIEW.map((p) => (
              <p key={p.slice(0, 40)} className="m-0">
                {p}
              </p>
            ))}
          </div>
          <Link
            to="/contact"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand-navy no-underline transition-opacity duration-200 hover:opacity-90"
          >
            <Lock size={13} />
            Get access
          </Link>
        </div>
      </Drawer>

      <Drawer
        open={drawer?.kind === "compliance"}
        onClose={closeDrawer}
        icon={Shield}
        title="Compliance"
      >
        {COMPLIANCE.map(({ logo, name, detail, body }) => (
          <DrawerItem key={name} title={name} logo={logo}>
            <p className="m-0 text-[13px] font-semibold text-white/45">
              {detail}
            </p>
            <p className="m-0">{body}</p>
          </DrawerItem>
        ))}
      </Drawer>

      <Drawer
        open={drawer?.kind === "category"}
        onClose={closeDrawer}
        icon={drawer?.category?.icon}
        title={drawer?.category?.title ?? ""}
      >
        {drawer?.category?.items.map(({ label, detail }) => (
          <DrawerItem key={label} title={label}>
            <p className="m-0">{detail}</p>
          </DrawerItem>
        ))}
      </Drawer>

      <MarketingFooter />
    </div>
  );
}

/* KNOWN GAPS — controls a security reviewer will look for that the BantaHR
   documents do not currently cover, and which are therefore absent above
   rather than assumed:
     • RPO / RTO targets (SLA gives resolution targets, not recovery objectives)
     • SOC 2, ISO 27001 or any third-party audit attestation
     • Named sub-processor regions (data residency is a binding claim)
     • SSO / SAML / MFA support
     • Cyber insurance, responsible disclosure programme, SBOM
     • Whether customer data is used to train AI models
   Add each to the source document first, then surface it here. */
