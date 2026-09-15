// src/pages/Sla.jsx
// BantaHR — Service Level Agreement.
//
// Content is BantaHR SLA v1.0, section for section. Chrome and typography come
// from components/marketing/LegalDoc.
//
// ⚠️ P1 RESPONSE TIME: the PDF contradicts itself. §4.2 gives P1 a flat 1-hour
// response; §8 gives Growth 2 hours and Enterprise 1 hour. Publishing either
// figure alone would misstate the other, so §4.2 below reads "1–2 hours by
// plan" and points at the plan table — true under both readings, and not a
// contradiction on a public page. Fix the PDF so one figure governs.

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
  ["intro", "1. Introduction"],
  ["definitions", "2. Definitions"],
  ["uptime", "3. Availability & Uptime"],
  ["support", "4. Support Services"],
  ["security", "5. Data Security & Privacy"],
  ["credits", "6. Service Credits"],
  ["responsibilities", "7. Customer Responsibilities"],
  ["plans", "8. Plans & SLA Applicability"],
  ["liability", "9. Limitation of Liability"],
  ["amendments", "10. Amendments & Termination"],
  ["law", "11. Governing Law"],
  ["acceptance", "12. Acceptance"],
];

export default function Sla() {
  return (
    <LegalDoc
      title="BantaHR Service Level Agreement"
      updated="Version 1.0 · Effective 2025"
      seeAlso={[
        { to: "/terms", label: "Terms of Service" },
        { to: "/dpa", label: "Data Processing Agreement" },
      ]}
    >
      <P>
        This Service Level Agreement (“SLA”) is entered into between BantaHR
        (“Provider”) and the subscribing organisation (“Customer”), and forms
        part of the <A to="/terms">BantaHR Terms of Service</A>. It defines the
        standards of service, availability commitments, support obligations and
        remedies BantaHR provides.
      </P>
      <P>
        BantaHR is a cloud-based HRIS delivered as Software-as-a-Service,
        purpose-built for Nigerian and African businesses, hosted on secure
        multi-tenant infrastructure. This SLA applies to{" "}
        <B>all BantaHR customers on the Growth and Enterprise plans</B>.
      </P>

      <Toc sections={SECTIONS} />

      {/* ── 1 ── */}
      <H2 id="intro">1. Introduction</H2>
      <P>
        This SLA sets out what you can expect from the BantaHR platform in terms
        of uptime, support responsiveness and remedies, and what BantaHR needs
        from you in order to deliver it. It is reviewed annually, or on any
        material change.
      </P>

      {/* ── 2 ── */}
      <H2 id="definitions">2. Definitions</H2>
      <Table
        nowrapFirst={false}
        head={["Term", "Meaning"]}
        rows={[
          [
            "Service",
            "The BantaHR platform, including all modules, APIs and associated infrastructure.",
          ],
          [
            "Downtime",
            "Any period during which the Service is unavailable and not accessible by the Customer, excluding Scheduled Maintenance.",
          ],
          [
            "Uptime",
            "The percentage of time the Service is available and operational within a given calendar month.",
          ],
          [
            "Scheduled Maintenance",
            "Pre-announced maintenance windows communicated at least 48 hours in advance.",
          ],
          ["Incident", "An unplanned interruption or degradation of the Service."],
          [
            "Response Time",
            "Time from an incident being reported to BantaHR acknowledging it.",
          ],
          [
            "Resolution Time",
            "Time from acknowledgement to full restoration of the Service.",
          ],
          [
            "Service Credits",
            "A monetary credit applied to the Customer's account as compensation for SLA breaches.",
          ],
        ]}
      />

      {/* ── 3 ── */}
      <H2 id="uptime">3. Service Availability & Uptime Commitment</H2>

      <H3>3.1 Uptime guarantee</H3>
      <Table
        head={["Plan", "Monthly uptime target", "Max downtime / month"]}
        rows={[
          ["Growth", "99.5%", "~3.6 hours"],
          ["Enterprise", "99.9%", "~43 minutes"],
        ]}
      />

      <H3>3.2 Exclusions</H3>
      <P>The following are excluded from uptime calculations:</P>
      <UL>
        <LI>Scheduled Maintenance, with at least 48 hours’ prior notice</LI>
        <LI>
          Downtime caused by the Customer’s own systems, network or third-party
          services
        </LI>
        <LI>
          Force majeure events, including natural disasters, power grid
          failures, government actions and internet backbone disruptions
        </LI>
        <LI>Customer-initiated actions that result in service degradation</LI>
        <LI>Beta or experimental features explicitly marked as such</LI>
      </UL>

      <H3>3.3 Scheduled maintenance</H3>
      <P>
        BantaHR performs scheduled maintenance outside peak business hours —
        typically between <B>12:00 AM and 4:00 AM WAT</B> at weekends.
        Customers receive notice by email and in-platform announcement at least{" "}
        <B>48 hours</B> before any planned maintenance.
      </P>

      {/* ── 4 ── */}
      <H2 id="support">4. Support Services</H2>

      <H3>4.1 Support channels</H3>
      <Table
        head={["Channel", "Detail", "Availability"]}
        rows={[
          ["Email support", CONTACT_EMAIL, "All plans"],
          ["In-app live chat", "Available within the platform", "All plans"],
          ["Phone support", "Dedicated line", "Enterprise only"],
          ["Dedicated CSM", "Customer Success Manager assigned", "Enterprise only"],
          ["On-site support", "Available upon request", "Enterprise only"],
        ]}
      />

      <H3>4.2 Incident severity & response times</H3>
      <Table
        head={["Severity", "Description", "Response", "Resolution target"]}
        rows={[
          [
            "P1 — Critical",
            "Complete service unavailability; payroll or data-loss risk",
            "1–2 hours by plan",
            "4 hours",
          ],
          [
            "P2 — High",
            "Major feature unavailable; significant business impact",
            "4 hours",
            "24 hours",
          ],
          [
            "P3 — Medium",
            "Minor feature impaired; workaround available",
            "8 business hours",
            "72 hours",
          ],
          [
            "P4 — Low",
            "General enquiry, cosmetic issue, feature request",
            "2 business days",
            "Best effort",
          ],
        ]}
      />
      <P>
        Business hours are <B>8:00 AM – 6:00 PM WAT, Monday to Friday</B>,
        excluding Nigerian public holidays. Enterprise customers receive
        response times outside business hours. Plan-specific P1 response times
        are set out in <A href="#plans">Section 8</A>.
      </P>

      {/* ── 5 ── */}
      <H2 id="security">5. Data Security & Privacy</H2>

      <H3>5.1 Data protection</H3>
      <UL>
        <LI>End-to-end encryption for all in-platform communications</LI>
        <LI>AES-256 encryption for data at rest</LI>
        <LI>TLS 1.2/1.3 for data in transit</LI>
        <LI>Role-Based Access Control across all modules</LI>
        <LI>Automated backups with point-in-time recovery</LI>
        <LI>
          Multi-tenant architecture with strict logical isolation between
          organisations
        </LI>
      </UL>

      <H3>5.2 NDPR compliance</H3>
      <P>
        BantaHR complies with the Nigeria Data Protection Regulation (NDPR),
        supervised by the <B>Nigeria Data Protection Commission (NDPC)</B>. As
        Data Processor, BantaHR will:
      </P>
      <UL>
        <LI>
          Process Customer employee data only as instructed by the Customer as
          Data Controller
        </LI>
        <LI>
          Not sell, share or disclose employee personal data to third parties
          without explicit Customer consent
        </LI>
        <LI>
          Notify Customers of any confirmed data breach within{" "}
          <B>72 hours</B> of discovery
        </LI>
        <LI>
          Assist Customers in fulfilling data subject access requests under the
          NDPR
        </LI>
        <LI>
          Maintain appropriate technical and organisational security measures
        </LI>
      </UL>
      <P>
        Full detail is in the <A to="/dpa">Data Processing Agreement</A>.
      </P>

      {/* ── 6 ── */}
      <H2 id="credits">6. Service Credits & Remedies</H2>
      <P>
        Where BantaHR fails to meet the uptime commitments in{" "}
        <A href="#uptime">Section 3</A>, Customers may request Service Credits:
      </P>
      <Table
        nowrapFirst={false}
        head={["Monthly uptime achieved", "Service credit (% of monthly fee)"]}
        rows={[
          ["99.0%–99.49% (Growth) / 99.5%–99.89% (Enterprise)", "10%"],
          ["95.0%–98.99%", "20%"],
          ["Below 95.0%", "30%"],
        ]}
      />

      <H3>6.1 Credit request process</H3>
      <UL>
        <LI>Submit a credit request within 30 days of the incident</LI>
        <LI>
          Send requests to <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A>{" "}
          with the subject line “SLA Credit Request”
        </LI>
        <LI>BantaHR reviews and responds within 14 business days</LI>
        <LI>Approved credits are applied to the next billing cycle</LI>
        <LI>
          Service Credits are the <B>sole and exclusive remedy</B> for SLA
          breaches
        </LI>
        <LI>
          Credits cannot be exchanged for cash or applied retroactively beyond
          one billing period
        </LI>
      </UL>

      {/* ── 7 ── */}
      <H2 id="responsibilities">7. Customer Responsibilities</H2>
      <P>To enable BantaHR to deliver the committed service levels, you agree to:</P>
      <UL>
        <LI>
          Maintain an internet connection adequate for cloud-based software
        </LI>
        <LI>
          Use supported, up-to-date browsers — Chrome, Firefox, Edge or Safari,
          latest two versions
        </LI>
        <LI>
          Promptly report incidents with sufficient information to enable
          investigation
        </LI>
        <LI>
          Designate at least one system administrator responsible for the
          account
        </LI>
        <LI>Ensure all users comply with the Acceptable Use Policy</LI>
        <LI>
          Keep account credentials confidential and report suspected
          unauthorised access immediately
        </LI>
        <LI>Maintain current and accurate billing and contact information</LI>
      </UL>

      {/* ── 8 ── */}
      <H2 id="plans">8. Subscription Plans & SLA Applicability</H2>
      <Table
        head={["Feature", "Growth", "Enterprise"]}
        rows={[
          ["Uptime SLA", "99.5%", "99.9%"],
          ["Support channels", "Email & chat", "Email, chat, phone, CSM"],
          ["Support hours", "Business hours (WAT)", "24/7"],
          ["P1 response time", "2 hours", "1 hour"],
          ["Service credits", "Yes", "Yes (enhanced)"],
          ["Dedicated CSM", "No", "Yes"],
          ["Custom SLA terms", "No", "Yes"],
          ["On-site training", "No", "Yes"],
          ["Custom integrations", "No", "Yes"],
        ]}
      />

      {/* ── 9 ── */}
      <H2 id="liability">9. Limitation of Liability</H2>
      <P>To the maximum extent permitted by applicable law:</P>
      <UL>
        <LI>
          BantaHR’s total aggregate liability under this SLA shall not exceed
          the total fees paid by the Customer in the <B>three months</B>{" "}
          immediately preceding the incident giving rise to the claim
        </LI>
        <LI>
          BantaHR is not liable for indirect, incidental, special,
          consequential or punitive damages, including loss of profits, loss of
          data or business interruption
        </LI>
        <LI>
          Service Credits represent the Customer’s sole remedy for service
          unavailability
        </LI>
      </UL>

      {/* ── 10 ── */}
      <H2 id="amendments">10. Amendments & Termination</H2>
      <P>
        BantaHR may update this SLA at any time. Customers are notified of
        material changes by email and in-platform notification at least{" "}
        <B>30 days</B> before they take effect. Continued use after the
        effective date constitutes acceptance.
      </P>
      <P>
        Either party may terminate the subscription in accordance with the{" "}
        <A to="/terms">Terms of Service</A>. On termination, BantaHR provides a
        data export within 30 days and securely deletes Customer data within 90
        days, unless retention is required by law.
      </P>

      {/* ── 11 ── */}
      <H2 id="law">11. Governing Law & Dispute Resolution</H2>
      <P>
        This SLA is governed by the laws of the Federal Republic of Nigeria.
        Disputes are first addressed through good-faith negotiation; if
        unresolved within <B>30 days</B>, they are referred to arbitration in
        Lagos, Nigeria, under the Arbitration and Conciliation Act (Cap A18 LFN
        2004).
      </P>

      {/* ── 12 ── */}
      <H2 id="acceptance">12. Acceptance</H2>
      <P>
        By subscribing to BantaHR services, the Customer acknowledges having
        read, understood and agreed to be bound by this Service Level Agreement.
        A counter-signed copy for procurement or audit files is available on
        request.
      </P>
      <ContactBlock />
    </LegalDoc>
  );
}

/* NOTES — issues in SLA v1.0 surfaced by this page:
   1. P1 response contradiction — §4.2 says 1 hour flat, §8 says Growth 2h /
      Enterprise 1h. Rendered as "1–2 hours by plan" pointing at §8. Fix the PDF.
   2. The PDF gives the platform URL as bantahr.vercel.app; the other three
      documents say BantaHR.com. Neither is rendered here — reconcile them.
   3. "Applicability: All BantaHR Customers (Growth & Enterprise)" confirms
      there is no free tier, consistent with Terms of Service §4.1.
   4. "Effective Date: 2025" has no month or day. Replace with a real date. */
