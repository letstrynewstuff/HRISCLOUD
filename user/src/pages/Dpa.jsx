// src/pages/Dpa.jsx
// BantaHR — Data Processing Agreement.
//
// Content is BantaHR DPA v1.0, section for section. Chrome and typography come
// from components/marketing/LegalDoc.
//
// ⚠️ REGULATOR: the source PDF names NITDA (in the NDPR definition and in the
// breach-notification clause). This page names the NDPC instead, matching
// /privacy and the Trust Center. The PDF still says NITDA — update it so the
// two agree. Other divergences are listed in NOTES at the foot of this file.

import LegalDoc, {
  A,
  B,
  ContactBlock,
  CONTACT_EMAIL,
  H2,
  H3,
  LI,
  P,
  Panel,
  Table,
  Toc,
  UL,
} from "../components/marketing/LegalDoc";

const SECTIONS = [
  ["background", "1. Background & Purpose"],
  ["definitions", "2. Definitions"],
  ["scope", "3. Scope of Processing"],
  ["processor", "4. Obligations of BantaHR"],
  ["controller", "5. Obligations of the Controller"],
  ["security", "6. Security Measures"],
  ["subprocessors", "7. Sub-Processors"],
  ["breach", "8. Data Breach Notification"],
  ["rights", "9. Data Subject Rights"],
  ["retention", "10. Retention & Deletion"],
  ["transfers", "11. International Transfers"],
  ["term", "12. Term & Termination"],
  ["law", "13. Governing Law"],
  ["signatures", "14. Signatures"],
];

export default function Dpa() {
  return (
    <LegalDoc
      title="BantaHR Data Processing Agreement"
      updated="Version 1.0 · Effective 2025"
      seeAlso={[
        { to: "/privacy", label: "Privacy Policy" },
        { to: "/terms", label: "Terms of Service" },
      ]}
    >
      <P>
        This Data Processing Agreement (“DPA”) forms part of the agreement
        between BantaHR (<B>Data Processor</B>) and the subscribing organisation
        (<B>Data Controller</B>), and governs the processing of personal data by
        BantaHR on behalf of the Customer in connection with the BantaHR HRIS
        platform.
      </P>
      <P>
        It is required under the Nigeria Data Protection Regulation (NDPR),
        supervised by the <B>Nigeria Data Protection Commission (NDPC)</B>, and
        reflects the parties’ respective obligations. Where this DPA conflicts
        with the Terms of Service, <B>this DPA prevails</B> on data protection
        matters.
      </P>

      <Table
        head={["Item", "Detail"]}
        rows={[
          ["Data Processor", "BantaHR"],
          ["Data Controller", "Subscribing Organisation (Customer)"],
          [
            "Regulatory framework",
            "NDPR (Nigeria) and applicable data protection laws",
          ],
          ["Jurisdiction", "Federal Republic of Nigeria"],
        ]}
      />

      <Toc sections={SECTIONS} />

      {/* ── 1 ── */}
      <H2 id="background">1. Background & Purpose</H2>
      <P>
        BantaHR processes personal data on behalf of the Customer solely to
        deliver the HRIS platform services described in the Terms of Service.
        This DPA sets out how that processing is governed, what security
        measures apply, and what each party is responsible for.
      </P>

      {/* ── 2 ── */}
      <H2 id="definitions">2. Definitions</H2>
      <Table
        nowrapFirst={false}
        head={["Term", "Meaning"]}
        rows={[
          [
            "Personal Data",
            "Any information relating to an identified or identifiable natural person (“data subject”), including employee names, BVN, NIN, salary details and other HR-related data.",
          ],
          [
            "Processing",
            "Any operation performed on personal data, including collection, storage, retrieval, use, disclosure or deletion.",
          ],
          [
            "Data Controller",
            "The subscribing organisation that determines the purposes and means of processing employee personal data.",
          ],
          [
            "Data Processor",
            "BantaHR, which processes personal data on behalf of and under the instructions of the Data Controller.",
          ],
          [
            "Sub-Processor",
            "Any third party engaged by BantaHR to process personal data in connection with the Service.",
          ],
          [
            "Data Breach",
            "A security incident leading to accidental or unlawful destruction, loss, alteration or unauthorised disclosure of personal data.",
          ],
          [
            "NDPR",
            "The Nigeria Data Protection Regulation, as amended from time to time, supervised by the NDPC.",
          ],
        ]}
      />

      {/* ── 3 ── */}
      <H2 id="scope">3. Scope of Processing</H2>

      <H3>3.1 Subject matter</H3>
      <P>
        BantaHR processes personal data to provide the HRIS platform services
        described in the Terms of Service, including payroll processing, leave
        management, attendance tracking, document management and performance
        management.
      </P>

      <H3>3.2 Categories of data subjects</H3>
      <UL>
        <LI>Employees and contractors of the subscribing organisation</LI>
        <LI>Job applicants, where recruitment features are used</LI>
        <LI>
          Former employees, for the duration of data retention requirements
        </LI>
      </UL>

      <H3>3.3 Types of personal data processed</H3>
      <UL>
        <LI>
          <B>Identity data</B> — full name, date of birth, NIN, BVN
        </LI>
        <LI>
          <B>Contact data</B> — email address, phone number, home address
        </LI>
        <LI>
          <B>Employment data</B> — job title, department, salary, contract type
        </LI>
        <LI>
          <B>Financial data</B> — bank account details, tax ID, pension fund
          details
        </LI>
        <LI>
          <B>Payroll data</B> — gross pay, deductions (PAYE, pension, NHF,
          NSITF), net pay
        </LI>
        <LI>Leave and attendance records</LI>
        <LI>Performance and appraisal data</LI>
        <LI>
          <B>Documents</B> — contracts, certificates, identification documents
        </LI>
      </UL>

      {/* ── 4 ── */}
      <H2 id="processor">4. Obligations of BantaHR (Data Processor)</H2>
      <P>BantaHR agrees to:</P>
      <UL>
        <LI>
          Process personal data only on documented instructions from the Data
          Controller
        </LI>
        <LI>
          Ensure all personnel with access to personal data are bound by
          confidentiality obligations
        </LI>
        <LI>
          Implement and maintain appropriate technical and organisational
          security measures as described in <A href="#security">Section 6</A>
        </LI>
        <LI>
          Not engage sub-processors without the prior general or specific
          written consent of the Data Controller
        </LI>
        <LI>
          Assist the Data Controller in responding to data subject rights
          requests under the NDPR
        </LI>
        <LI>
          Assist the Data Controller in meeting its obligations on data
          security, breach notification and data protection impact assessments
        </LI>
        <LI>
          Delete or return all personal data to the Data Controller on
          termination of services
        </LI>
        <LI>
          Provide all information necessary to demonstrate compliance with this
          DPA
        </LI>
        <LI>
          Not transfer personal data outside Nigeria without ensuring adequate
          protections are in place
        </LI>
      </UL>

      {/* ── 5 ── */}
      <H2 id="controller">5. Obligations of the Data Controller</H2>
      <P>The Data Controller agrees to:</P>
      <UL>
        <LI>
          Ensure it has a lawful basis for providing employee personal data to
          BantaHR
        </LI>
        <LI>Provide accurate, relevant and up-to-date personal data</LI>
        <LI>
          Inform employees how their data is processed by BantaHR, including by
          reference to the <A to="/privacy">Privacy Policy</A>
        </LI>
        <LI>Ensure employee consent is obtained where the NDPR requires it</LI>
        <LI>Promptly notify BantaHR of any change to processing instructions</LI>
        <LI>
          Not instruct BantaHR to process data in a way that violates applicable
          law
        </LI>
      </UL>

      {/* ── 6 ── */}
      <H2 id="security">6. Security Measures</H2>
      <P>
        BantaHR maintains the following technical and organisational measures to
        secure personal data:
      </P>
      <Table
        head={["Measure", "Detail"]}
        rows={[
          ["Encryption at rest", "AES-256 encryption for all stored data"],
          ["Encryption in transit", "TLS 1.2/1.3 for all data transmissions"],
          [
            "End-to-end encryption",
            "E2EE for all in-platform communications",
          ],
          [
            "Access control",
            "Role-Based Access Control (RBAC) across all modules",
          ],
          [
            "Data isolation",
            "Strict logical separation between tenant organisations",
          ],
          [
            "Backups",
            "Automated daily backups with point-in-time recovery",
          ],
          ["Audit logs", "Full access logs and anomaly detection monitoring"],
          [
            "Penetration testing",
            "Regular security audits and vulnerability assessments",
          ],
        ]}
      />

      {/* ── 7 ── */}
      <H2 id="subprocessors">7. Sub-Processors</H2>
      <P>
        The Data Controller grants BantaHR general authorisation to engage
        sub-processors for delivery of the Service. BantaHR will notify the Data
        Controller of any intended change to sub-processors at least{" "}
        <B>30 days</B> in advance.
      </P>
      <P>
        All sub-processors are bound by data processing agreements with
        obligations no less protective than those in this DPA. The current
        register is published in our <A to="/trust">Trust Center</A>, and a full
        list is available on request.
      </P>

      {/* ── 8 ── */}
      <H2 id="breach">8. Data Breach Notification</H2>
      <P>On a confirmed personal data breach, BantaHR will:</P>
      <UL>
        <LI>
          Notify the Data Controller without undue delay and within{" "}
          <B>72 hours</B> of becoming aware of the breach
        </LI>
        <LI>
          Provide sufficient information to enable the Data Controller to notify
          the NDPC and affected data subjects as required
        </LI>
        <LI>
          Take immediate steps to contain, investigate and remediate the breach
        </LI>
        <LI>
          Maintain a record of all breaches, including those not reported to
          regulators
        </LI>
        <LI>Cooperate fully with any regulatory investigation</LI>
      </UL>

      {/* ── 9 ── */}
      <H2 id="rights">9. Data Subject Rights</H2>
      <P>
        BantaHR assists the Data Controller in fulfilling data subject rights
        requests under the NDPR, including access, rectification, erasure and
        data portability. BantaHR will:
      </P>
      <UL>
        <LI>
          Forward any data subject request received directly by BantaHR to the
          Data Controller within <B>5 business days</B>
        </LI>
        <LI>
          Provide technical assistance to help the Data Controller respond
          within the NDPR’s required timeframes
        </LI>
        <LI>
          Not respond directly to data subject requests without the Data
          Controller’s authorisation, except as required by law
        </LI>
      </UL>

      {/* ── 10 ── */}
      <H2 id="retention">10. Data Retention & Deletion</H2>
      <P>
        BantaHR retains personal data for the duration of the subscription. On
        termination:
      </P>
      <UL>
        <LI>
          The Data Controller may request a full data export within{" "}
          <B>30 days</B> of termination
        </LI>
        <LI>
          BantaHR will securely delete all personal data within <B>90 days</B>{" "}
          of termination
        </LI>
        <LI>
          Data required to be retained by Nigerian law — for example payroll
          records for six years — is held for the legally required period and
          then securely destroyed
        </LI>
        <LI>BantaHR will provide written confirmation of deletion on request</LI>
      </UL>

      {/* ── 11 ── */}
      <H2 id="transfers">11. International Data Transfers</H2>
      <P>
        BantaHR stores and processes all Customer data within Nigeria, or within
        jurisdictions that provide an adequate level of data protection as
        recognised under the NDPR. BantaHR will not transfer personal data to a
        country outside Nigeria without ensuring appropriate safeguards are in
        place and notifying the Data Controller.
      </P>

      {/* ── 12 ── */}
      <H2 id="term">12. Term & Termination</H2>
      <P>
        This DPA is effective from the date the Customer begins using the
        BantaHR platform and remains in force for the duration of the
        subscription. Termination of the Terms of Service automatically
        terminates this DPA, subject to the retention and deletion obligations
        in <A href="#retention">Section 10</A>.
      </P>

      {/* ── 13 ── */}
      <H2 id="law">13. Governing Law</H2>
      <P>
        This DPA is governed by the laws of the Federal Republic of Nigeria,
        including the NDPR. Disputes are resolved in accordance with the dispute
        resolution mechanism in the{" "}
        <A to="/terms">BantaHR Terms of Service</A>.
      </P>

      {/* ── 14 ── */}
      <H2 id="signatures">14. Signatures</H2>
      <P>
        By subscribing to BantaHR services, both parties agree to the terms of
        this Data Processing Agreement. A counter-signed copy for procurement or
        audit files is available on request — contact{" "}
        <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A>.
      </P>

      <Panel title="Execution copies">
        <p className="m-0 text-[15px] leading-[1.8] text-brand-ink-mid">
          Where your procurement process requires a signed DPA naming both
          parties, request one through the{" "}
          <A to="/trust">Trust Center</A> and we will return an execution copy
          for signature by an authorised signatory of each party.
        </p>
      </Panel>

      <H2 id="contact">Contact</H2>
      <P>For any question about this DPA or how your data is processed:</P>
      <ContactBlock />
    </LegalDoc>
  );
}

/* NOTES — where this page diverges from DPA v1.0, and why:
   1. Regulator: the PDF says NITDA in the NDPR definition (§2) and in the
      breach clause (§8). This page says NDPC, matching /privacy and the Trust
      Center. Update the PDF so they agree.
   2. Cross-reference: PDF §4 points to "Section 5" for security measures, but
      §5 is Controller obligations and the measures are in §6. Corrected here
      to Section 6 — fix it in the PDF too.
   3. "Effective Date: 2025" has no month or day. Rendered as "Effective 2025";
      replace with a real date.
   4. §14 in the PDF is a blank signature block. A web page cannot carry wet
      signatures, so this renders as an offer to send an execution copy rather
      than as empty ruled lines. */
