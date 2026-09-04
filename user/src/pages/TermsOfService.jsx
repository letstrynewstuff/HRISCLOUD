// src/pages/TermsOfService.jsx
// BantaHR — Terms of Service.
//
// Content is BantaHR Terms of Service v1.0, section for section. Chrome and
// typography come from components/marketing/LegalDoc.
//
// ⚠️ PRICING: §4.1 below is reproduced exactly as the PDF states it —
// ₦2,769 per employee/month, minimum 5 employees. The /pricing page currently
// advertises ₦999 with a minimum of 1, plus a Free tier this document does not
// recognise. Those two public pages now contradict each other, and the Terms
// are the binding instrument. See NOTES at the foot of this file.

import LegalDoc, {
  A,
  B,
  ContactBlock,
  CONTACT_EMAIL,
  H2,
  H3,
  LI,
  P,
  Table,
  Toc,
  UL,
} from "../components/marketing/LegalDoc";

const SECTIONS = [
  ["acceptance", "1. Acceptance of Terms"],
  ["service", "2. Description of Service"],
  ["accounts", "3. Account Registration & Security"],
  ["plans", "4. Subscription Plans & Payment"],
  ["use", "5. Acceptable Use Policy"],
  ["ip", "6. Intellectual Property"],
  ["data", "7. Data Protection & Privacy"],
  ["availability", "8. Availability & Support"],
  ["liability", "9. Disclaimers & Liability"],
  ["termination", "10. Termination"],
  ["amendments", "11. Amendments"],
  ["law", "12. Governing Law"],
  ["contact", "13. Contact"],
];

export default function TermsOfService() {
  return (
    <LegalDoc
      title="BantaHR Terms of Service"
      updated="Version 1.0 · Effective 2025"
      seeAlso={[
        { to: "/privacy", label: "Privacy Policy" },
        { to: "/dpa", label: "Data Processing Agreement" },
      ]}
    >
      <P>
        These Terms of Service (“Terms”) govern your access to and use of the
        BantaHR platform. They apply to all users and subscribing organisations,
        and are governed by the laws of the Federal Republic of Nigeria.
      </P>
      <P>
        By registering for, accessing or using BantaHR, you agree to be bound by
        these Terms. If you are accepting on behalf of an organisation, you
        represent that you have authority to bind that organisation.{" "}
        <B>If you do not agree to these Terms, you must not use BantaHR.</B>
      </P>

      <Toc sections={SECTIONS} />

      {/* ── 1 ── */}
      <H2 id="acceptance">1. Acceptance of Terms</H2>
      <P>
        These Terms constitute a legally binding agreement between you and
        BantaHR. Your use of the platform is also subject to our{" "}
        <A to="/privacy">Privacy Policy</A> and, where applicable, our{" "}
        <A to="/dpa">Data Processing Agreement</A>.
      </P>

      {/* ── 2 ── */}
      <H2 id="service">2. Description of Service</H2>
      <P>
        BantaHR provides a cloud-based Human Resource Information System (HRIS)
        delivered as Software-as-a-Service. Subject to the plan selected, the
        Service includes:
      </P>
      <UL>
        <LI>Employee Management</LI>
        <LI>Payroll Processing (PAYE, pension, NHF, NSITF)</LI>
        <LI>Leave & Attendance Management</LI>
        <LI>Document Management & digital signatures</LI>
        <LI>HR Analytics Dashboard</LI>
        <LI>Encrypted Team Chat & Announcements</LI>
        <LI>Performance Management</LI>
        <LI>Offboarding Management</LI>
      </UL>
      <P>
        BantaHR reserves the right to modify, update or discontinue features
        with reasonable notice to customers.
      </P>

      {/* ── 3 ── */}
      <H2 id="accounts">3. Account Registration & Security</H2>

      <H3>3.1 Registration</H3>
      <P>
        To access BantaHR, the subscribing organisation must create an account
        and provide accurate, current and complete information, and keep that
        information updated.
      </P>

      <H3>3.2 Account security</H3>
      <P>
        You are responsible for maintaining the confidentiality of your account
        credentials. You agree to:
      </P>
      <UL>
        <LI>Use a strong, unique password for your BantaHR account</LI>
        <LI>Not share your login credentials with unauthorised persons</LI>
        <LI>
          Notify BantaHR immediately at{" "}
          <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A> if you suspect
          unauthorised access
        </LI>
        <LI>Accept responsibility for all activity under your account</LI>
      </UL>

      {/* ── 4 ── */}
      <H2 id="plans">4. Subscription Plans & Payment</H2>

      <H3>4.1 Plans</H3>
      <Table
        head={["Plan", "Pricing", "Terms"]}
        rows={[
          ["Growth", "₦2,769 per employee / month", "Minimum 5 employees"],
          ["Enterprise", "Custom pricing", "Custom contract required"],
        ]}
      />

      <H3>4.2 Billing</H3>
      <P>
        Subscriptions are billed monthly based on the number of active
        employees. Invoices are issued at the start of each billing cycle and
        are due within <B>14 days</B>. BantaHR reserves the right to suspend
        access for accounts with overdue payments.
      </P>

      <H3>4.3 Refunds</H3>
      <P>
        BantaHR does not offer refunds for partial months. If you cancel, you
        retain access until the end of the current billing period. Enterprise
        refund terms are governed by the individual contract.
      </P>

      {/* ── 5 ── */}
      <H2 id="use">5. Acceptable Use Policy</H2>
      <P>
        You agree to use BantaHR only for lawful purposes and in accordance with
        these Terms. You must not:
      </P>
      <UL>
        <LI>
          Use the Service to process data of individuals without their knowledge
          or a lawful basis
        </LI>
        <LI>
          Attempt to gain unauthorised access to any part of the platform or its
          infrastructure
        </LI>
        <LI>
          Upload malicious code, viruses or any software designed to disrupt the
          Service
        </LI>
        <LI>
          Use the Service to store, transmit or distribute unlawful, defamatory
          or harmful content
        </LI>
        <LI>
          Reverse engineer, decompile or attempt to extract the source code of
          the platform
        </LI>
        <LI>
          Resell, sublicense or provide access to the Service to third parties
          without written consent
        </LI>
        <LI>
          Use the Service in a way that violates any applicable Nigerian or
          international law
        </LI>
      </UL>
      <P>
        Violation of this policy may result in <B>immediate suspension or
        termination without refund</B>.
      </P>

      {/* ── 6 ── */}
      <H2 id="ip">6. Intellectual Property</H2>
      <P>
        BantaHR and its content, features, functionality, brand, logo and
        underlying technology are owned exclusively by BantaHR and protected by
        Nigerian and international intellectual property law.
      </P>
      <P>
        <B>Customers retain ownership of all data they upload</B> (“Customer
        Data”). By using BantaHR you grant a limited, non-exclusive licence to
        process Customer Data solely to provide the Service. You may not use the
        BantaHR name, logo or branding without prior written consent.
      </P>

      {/* ── 7 ── */}
      <H2 id="data">7. Data Protection & Privacy</H2>
      <P>
        BantaHR processes personal data in accordance with the Nigeria Data
        Protection Regulation (NDPR), supervised by the{" "}
        <B>Nigeria Data Protection Commission (NDPC)</B>. Full details are set
        out in our <A to="/privacy">Privacy Policy</A>.
      </P>
      <P>
        By subscribing, you acknowledge that you are the <B>Data Controller</B>{" "}
        for your employees’ personal data and BantaHR acts as the{" "}
        <B>Data Processor</B>. A{" "}
        <A to="/dpa">Data Processing Agreement</A> is available, and is required
        for Enterprise subscribers.
      </P>

      {/* ── 8 ── */}
      <H2 id="availability">8. Service Availability & Support</H2>
      <P>
        BantaHR targets <B>99.5%</B> monthly uptime for Growth customers and{" "}
        <B>99.9%</B> for Enterprise customers. Full availability commitments,
        support response times and service credits are set out in the BantaHR
        Service Level Agreement, available through the{" "}
        <A to="/trust">Trust Center</A>.
      </P>
      <P>
        Support is provided by email at{" "}
        <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A> and in-platform
        live chat during business hours (8:00 AM – 6:00 PM WAT, Monday to
        Friday). Enterprise customers receive 24/7 priority support.
      </P>

      {/* ── 9 ── */}
      <H2 id="liability">9. Disclaimers & Limitation of Liability</H2>
      <P>
        The platform is provided <B>“as is”</B> and <B>“as available”</B>. While
        we work to maintain a reliable, secure and accurate service, BantaHR
        makes no warranties, express or implied, as to completeness, accuracy or
        fitness for a particular purpose.
      </P>
      <P>
        To the maximum extent permitted by Nigerian law, BantaHR’s total
        liability shall not exceed the total fees paid by the Customer in the{" "}
        <B>three months</B> preceding the claim. BantaHR is not liable for
        indirect, incidental, consequential or punitive damages.
      </P>
      <P>
        BantaHR is a tool to assist with HR and payroll management.{" "}
        <B>
          It is the Customer’s responsibility to verify all payroll calculations
          and ensure compliance with applicable laws.
        </B>
      </P>

      {/* ── 10 ── */}
      <H2 id="termination">10. Termination</H2>

      <H3>10.1 Termination by Customer</H3>
      <P>
        You may cancel your subscription at any time by contacting{" "}
        <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A>. Cancellation
        takes effect at the end of the current billing cycle.
      </P>

      <H3>10.2 Termination by BantaHR</H3>
      <P>
        BantaHR may terminate or suspend your account immediately and without
        notice if you:
      </P>
      <UL>
        <LI>
          Materially breach these Terms and fail to remedy the breach within 14
          days of notice
        </LI>
        <LI>Use the Service for unlawful purposes</LI>
        <LI>Fail to pay outstanding invoices after reasonable notice</LI>
        <LI>Become insolvent or subject to insolvency proceedings</LI>
      </UL>

      <H3>10.3 Effect of termination</H3>
      <P>
        On termination your right to access the Service ceases immediately.
        BantaHR will provide a data export within <B>30 days</B> and permanently
        delete all Customer Data within <B>90 days</B>, subject to records
        Nigerian law requires us to retain.
      </P>

      {/* ── 11 ── */}
      <H2 id="amendments">11. Amendments</H2>
      <P>
        BantaHR may update these Terms at any time. Material changes are
        communicated by email and in-platform notification at least{" "}
        <B>30 days</B> before taking effect. Continued use after the effective
        date constitutes acceptance of the updated Terms.
      </P>

      {/* ── 12 ── */}
      <H2 id="law">12. Governing Law</H2>
      <P>
        These Terms are governed by the laws of the Federal Republic of Nigeria.
        Disputes are first addressed through good-faith negotiation; if
        unresolved within <B>30 days</B>, they are referred to arbitration in
        Lagos, Nigeria.
      </P>

      {/* ── 13 ── */}
      <H2 id="contact">13. Contact</H2>
      <P>For any question about these Terms:</P>
      <ContactBlock />
    </LegalDoc>
  );
}

/* NOTES — issues in Terms of Service v1.0 that this page surfaces:
   1. PRICING CONFLICT. §4.1 states ₦2,769 per employee/month with a minimum of
      5 employees. /pricing advertises ₦999 (was ₦1,259) with a minimum of 1,
      and a Free tier these Terms do not recognise. Both pages are now public
      and contradict each other; the Terms are the binding instrument.
   2. Uptime: §8 gives 99.5% to Growth and 99.9% to Enterprise. The landing
      page trust bar promises "99.9% Uptime" unqualified to every visitor.
   3. Regulator: the PDF cites the NDPR without naming a supervisory authority
      here; this page names the NDPC, consistent with /privacy and /dpa.
   4. "Effective Date: 2025" has no month or day. Rendered as "Effective 2025";
      replace with a real date.
   5. The SLA PDF gives the platform URL as bantahr.vercel.app while the other
      documents say BantaHR.com. Not surfaced on this page, but it should be
      reconciled before these documents are relied on. */
