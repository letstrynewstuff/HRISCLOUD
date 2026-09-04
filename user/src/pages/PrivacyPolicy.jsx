// src/pages/PrivacyPolicy.jsx
// BantaHR — Privacy Policy.
//
// Content is BantaHR Privacy Policy v1.0, section for section. Chrome and
// typography come from components/marketing/LegalDoc.
//
// ⚠️ REGULATOR: the source PDF names NITDA as the supervisory authority. This
// page names the NDPC (Nigeria Data Protection Commission) instead, as
// requested. The PDF and this page now disagree; update the PDF so they match.
// See NOTES at the foot of this file for the other divergences.

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
  ["collect", "2. Information We Collect"],
  ["use", "3. How We Use Your Information"],
  ["basis", "4. Legal Basis for Processing"],
  ["sharing", "5. Data Sharing & Disclosure"],
  ["security", "6. Data Security"],
  ["retention", "7. Data Retention"],
  ["rights", "8. Your Rights"],
  ["cookies", "9. Cookies & Tracking"],
  ["children", "10. Children's Privacy"],
  ["changes", "11. Changes to This Policy"],
  ["contact", "12. Contact & Enquiries"],
];

export default function PrivacyPolicy() {
  return (
    <LegalDoc
      title="BantaHR Privacy Policy"
      updated="Version 1.0 · Effective 2025"
      seeAlso={[
        { to: "/terms", label: "Terms of Service" },
        { to: "/dpa", label: "Data Processing Agreement" },
      ]}
    >
      <P>
        BantaHR (“we”, “our”, “us”) is committed to protecting the privacy and
        security of all personal data we collect, process and store. This
        Privacy Policy explains how BantaHR collects, uses, shares and protects
        information in connection with our Human Resource Information System
        (HRIS) platform.
      </P>
      <P>
        It applies to everyone who uses BantaHR — HR administrators, employees
        of subscribing organisations, and visitors to our website. We operate
        under the Nigeria Data Protection Regulation (NDPR), supervised by the{" "}
        <B>Nigeria Data Protection Commission (NDPC)</B>.
      </P>

      <Toc sections={SECTIONS} />

      {/* ── 1 ── */}
      <H2 id="intro">1. Introduction</H2>
      <P>
        BantaHR is a cloud-based HRIS delivered as Software-as-a-Service and
        purpose-built for Nigerian and African businesses. By using BantaHR, you
        consent to the practices described in this Privacy Policy.
      </P>
      <P>
        Under the NDPR, the subscribing organisation is the{" "}
        <B>Data Controller</B> for its employees’ personal data and BantaHR acts
        as the <B>Data Processor</B>. We process employee data only on the
        Controller’s documented instructions. Where your data is held by your
        employer on BantaHR, contact your employer’s HR team in the first
        instance.
      </P>

      {/* ── 2 ── */}
      <H2 id="collect">2. Information We Collect</H2>

      <H3>2.1 Information provided by organisations</H3>
      <P>
        When an organisation subscribes to BantaHR, it may provide the following
        employee personal data:
      </P>
      <UL>
        <LI>Full name, job title, department and employment dates</LI>
        <LI>National Identification Number (NIN) or BVN where required</LI>
        <LI>Bank account details for payroll processing</LI>
        <LI>Tax Identification Number (TIN) and pension fund details</LI>
        <LI>Salary, allowances and payroll information</LI>
        <LI>Leave records and attendance data</LI>
        <LI>Performance reviews and appraisal records</LI>
        <LI>Employment contracts and documents</LI>
        <LI>Next of kin and emergency contact information</LI>
      </UL>

      <H3>2.2 Information collected automatically</H3>
      <P>When users access the platform, we automatically collect:</P>
      <UL>
        <LI>IP address and device information</LI>
        <LI>Browser type and version</LI>
        <LI>Login timestamps and session duration</LI>
        <LI>Pages visited and features used within the platform</LI>
        <LI>Error logs and performance data</LI>
      </UL>

      <H3>2.3 Communications data</H3>
      <P>
        Messages sent through BantaHR’s team chat are{" "}
        <B>end-to-end encrypted</B>. BantaHR does not read, access or store the
        content of these messages in unencrypted form.
      </P>

      {/* ── 3 ── */}
      <H2 id="use">3. How We Use Your Information</H2>
      <P>BantaHR processes personal data to:</P>
      <UL>
        <LI>Provide and maintain the HRIS platform and all its modules</LI>
        <LI>
          Process payroll, including PAYE, pension, NHF and NSITF calculations
        </LI>
        <LI>Generate and store payslips, contracts and HR documents</LI>
        <LI>Manage leave requests, attendance records and performance data</LI>
        <LI>
          Send platform notifications, system updates and product announcements
        </LI>
        <LI>Provide customer support and respond to enquiries</LI>
        <LI>Comply with Nigerian tax, pension and employment laws</LI>
        <LI>Improve platform performance, security and features</LI>
        <LI>Detect and prevent fraud</LI>
      </UL>

      {/* ── 4 ── */}
      <H2 id="basis">4. Legal Basis for Processing</H2>
      <P>
        BantaHR processes personal data under the following legal bases as
        defined by the NDPR:
      </P>
      <Table
        head={["Legal basis", "Purpose"]}
        rows={[
          [
            "Contractual necessity",
            "Processing required to deliver the subscribed HR services.",
          ],
          ["Legal obligation", "Payroll tax, pension and regulatory compliance."],
          [
            "Legitimate interests",
            "Platform security, fraud prevention and service improvement.",
          ],
          ["Consent", "Marketing communications and optional features."],
        ]}
      />

      {/* ── 5 ── */}
      <H2 id="sharing">5. Data Sharing & Disclosure</H2>
      <P>
        <B>
          BantaHR does not sell, rent or trade personal data to third parties.
        </B>{" "}
        We share data only in the following limited circumstances:
      </P>
      <UL>
        <LI>
          <B>With the subscribing organisation</B> — your employer, who is the
          Data Controller for their employees’ data
        </LI>
        <LI>
          <B>With regulated financial institutions</B> for payroll disbursement
        </LI>
        <LI>
          <B>With regulators</B> — the Federal Inland Revenue Service (FIRS),
          pension fund administrators and other bodies where Nigerian law
          requires
        </LI>
        <LI>
          <B>With trusted sub-processors</B> who help deliver the service, such
          as cloud hosting and email delivery — all bound by data protection
          agreements
        </LI>
        <LI>
          <B>Where legally compelled</B> by a valid court order or lawful
          government request
        </LI>
        <LI>
          <B>On merger or acquisition</B> — users will be notified in advance
        </LI>
      </UL>
      <P>
        The current sub-processor register is published in our{" "}
        <A to="/trust">Trust Center</A>. We notify customers at least 30 days
        before adding or replacing a sub-processor.
      </P>

      {/* ── 6 ── */}
      <H2 id="security">6. Data Security</H2>
      <P>
        BantaHR maintains the following technical and organisational measures:
      </P>
      <UL>
        <LI>AES-256 encryption for data at rest</LI>
        <LI>TLS 1.2/1.3 encryption for all data in transit</LI>
        <LI>End-to-end encryption for all team chat communications</LI>
        <LI>
          Role-Based Access Control — users only access data relevant to their
          role
        </LI>
        <LI>Automated backups with point-in-time recovery</LI>
        <LI>
          Multi-tenant architecture with strict logical isolation between
          organisations
        </LI>
        <LI>Regular security audits and vulnerability assessments</LI>
        <LI>Access logs and anomaly detection</LI>
      </UL>
      <P>
        In the event of a confirmed personal data breach, BantaHR notifies the
        affected Data Controller within <B>72 hours</B> of becoming aware, with
        sufficient information for them to notify the NDPC and affected data
        subjects.
      </P>

      {/* ── 7 ── */}
      <H2 id="retention">7. Data Retention</H2>
      <P>
        BantaHR retains personal data for as long as a subscription is active,
        and thereafter for any period required by Nigerian law — typically six
        years for payroll and tax records. On termination of a subscription:
      </P>
      <UL>
        <LI>
          Customers may request a full data export within <B>30 days</B> of
          termination
        </LI>
        <LI>
          All customer data is securely deleted from BantaHR systems within{" "}
          <B>90 days</B> of termination
        </LI>
        <LI>
          Data required to be retained by law is held for the legally mandated
          period and then destroyed
        </LI>
      </UL>

      {/* ── 8 ── */}
      <H2 id="rights">8. Your Rights Under the NDPR</H2>
      <P>
        As a data subject under Nigerian data protection law, you have the
        following rights:
      </P>
      <Table
        head={["Right", "What it means for you"]}
        rows={[
          ["Access", "Request a copy of the personal data we hold about you."],
          [
            "Rectification",
            "Request correction of inaccurate or incomplete data.",
          ],
          [
            "Erasure",
            "Request deletion of your data where there is no lawful basis to retain it.",
          ],
          [
            "Portability",
            "Receive your data in a structured, machine-readable format.",
          ],
          ["Object", "Object to processing of your data for direct marketing."],
          [
            "Withdraw consent",
            "Where processing is based on consent, withdraw it at any time.",
          ],
        ]}
      />
      <P>
        To exercise any of these rights, contact us at{" "}
        <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A>. We respond
        within <B>30 days</B>.
      </P>
      <P>
        Where your data is held on BantaHR by your employer, we forward requests
        received directly to them as Data Controller within five business days,
        and assist them in responding. You also have the right to lodge a
        complaint with the <B>Nigeria Data Protection Commission (NDPC)</B>.
      </P>

      {/* ── 9 ── */}
      <H2 id="cookies">9. Cookies & Tracking</H2>
      <P>
        BantaHR uses <B>essential cookies only</B> — to maintain user sessions
        and platform functionality. We do not use third-party advertising
        cookies. You may control cookie preferences through your browser
        settings, though disabling essential cookies may affect platform
        functionality.
      </P>

      {/* ── 10 ── */}
      <H2 id="children">10. Children’s Privacy</H2>
      <P>
        BantaHR is a business-to-business platform and is not directed at
        individuals under the age of 18. We do not knowingly collect personal
        data from minors. If you believe a minor’s data has been submitted to
        the platform, contact us immediately at{" "}
        <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A>.
      </P>

      {/* ── 11 ── */}
      <H2 id="changes">11. Changes to This Policy</H2>
      <P>
        BantaHR may update this Privacy Policy from time to time. Material
        changes are communicated by email and in-platform notification at least{" "}
        <B>30 days</B> before taking effect. Continued use of the platform after
        the effective date constitutes acceptance of the updated policy. This
        policy is reviewed annually, or on any material change.
      </P>

      {/* ── 12 ── */}
      <H2 id="contact">12. Contact & Data Protection Enquiries</H2>
      <P>
        For any question, concern or request regarding this Privacy Policy or
        your personal data, contact:
      </P>
      <ContactBlock />
      <P>
        You may also lodge a complaint directly with the Nigeria Data Protection
        Commission, the supervisory authority for data protection in Nigeria.
      </P>
    </LegalDoc>
  );
}

/* NOTES — where this page diverges from Privacy Policy v1.0, and why:
   1. Regulator: the PDF says NITDA; this page says NDPC throughout, as
      requested. The PDF needs the same change or the two disagree.
   2. Right to complain to the NDPC (§8) is not in the PDF. It is a standard
      data-subject right and was added deliberately — mirror it into the PDF.
   3. Breach notification (§6, 72 hours) comes from the DPA, not the Privacy
      Policy. Included because reviewers expect it in a privacy policy.
   4. "Effective Date: 2025" in the PDF has no month or day. Rendered as
      "Effective 2025"; replace with a real date — a privacy policy without a
      precise effective date is hard to rely on.
   5. The PDF cites the NDPR only. It does not mention the Nigeria Data
      Protection Act 2023, the statute that created the NDPC. Whether to cite
      the NDPA as well is a question for counsel, so no statute was added here
      that the source document does not already claim. */
