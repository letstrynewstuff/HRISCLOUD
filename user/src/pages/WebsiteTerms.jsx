// src/pages/WebsiteTerms.jsx
// BantaHR — Website Terms of Use.
//
// These govern the marketing website only. The platform itself is governed by
// the Terms of Service, DPA and SLA — §3 draws that line explicitly, because
// conflating the two is the usual failure mode of a website terms page.
//
// Unlike /privacy, /dpa, /terms and /sla, this document has no source PDF:
// BantaHR has no Website Terms of Use on file. The content below is newly
// written and reuses only facts already established in the other four
// documents (jurisdiction, arbitration forum, supported browsers, force
// majeure, contact address). Nothing is copied from any third party's terms.
//
// ⚠️ This has not been reviewed by counsel. See NOTES at the foot of the file.

import LegalDoc, {
  A,
  B,
  ContactBlock,
  CONTACT_EMAIL,
  H2,
  LI,
  P,
  Table,
  Toc,
  UL,
} from "../components/marketing/LegalDoc";

const SECTIONS = [
  ["about", "1. About These Terms"],
  ["who", "2. Who We Are"],
  ["other", "3. Other Agreements"],
  ["privacy", "4. Your Privacy"],
  ["using", "5. Using This Website"],
  ["ip", "6. Intellectual Property"],
  ["submissions", "7. Content You Submit"],
  ["acceptable", "8. Rules of Acceptable Use"],
  ["availability", "9. Website Availability"],
  ["links", "10. Links to Other Sites"],
  ["disclaimer", "11. Disclaimers"],
  ["liability", "12. Limitation of Liability"],
  ["ending", "13. Ending Your Use"],
  ["changes", "14. Changes"],
  ["law", "15. Governing Law"],
  ["contact", "16. Contact"],
];

export default function WebsiteTerms() {
  return (
    <LegalDoc
      title="BantaHR Website Terms of Use"
      updated="Version 1.0 · Effective 2025"
      seeAlso={[
        { to: "/terms", label: "Terms of Service" },
        { to: "/privacy", label: "Privacy Policy" },
      ]}
    >
      <P>
        These Website Terms of Use govern your access to and use of the BantaHR
        website. By browsing this website you agree to them. If you do not
        agree, please stop using the site.
      </P>
      <P>
        <B>
          These terms cover the website only — not the BantaHR platform.
        </B>{" "}
        If you subscribe to BantaHR, your use of the product is governed by the{" "}
        <A to="/terms">Terms of Service</A> and the agreements listed in{" "}
        <A href="#other">Section 3</A>.
      </P>

      <Toc sections={SECTIONS} />

      {/* ── 1 ── */}
      <H2 id="about">1. About These Terms</H2>
      <P>
        These terms apply to everyone who visits the BantaHR website —
        prospective customers, current customers, job applicants and general
        visitors. They apply whether or not you hold a BantaHR account.
      </P>

      {/* ── 2 ── */}
      <H2 id="who">2. Who We Are</H2>
      <P>
        BantaHR is a company registered with the Corporate Affairs Commission in
        the Federal Republic of Nigeria, operating from No 1 Adetunji Adegbite
        Street, Ogudu, Lagos. In these terms “BantaHR”, “we”, “our” and “us”
        refer to that company.
      </P>

      {/* ── 3 ── */}
      <H2 id="other">3. Other Agreements That May Apply</H2>
      <P>
        This website is one part of your relationship with BantaHR. Depending on
        what you do, other agreements take precedence:
      </P>
      <Table
        nowrapFirst={false}
        head={["Agreement", "What it governs"]}
        rows={[
          [
            <A key="tos" to="/terms">
              Terms of Service
            </A>,
            "Your subscription to, and use of, the BantaHR platform.",
          ],
          [
            <A key="dpa" to="/dpa">
              Data Processing Agreement
            </A>,
            "How BantaHR processes employee personal data on your behalf.",
          ],
          [
            <A key="sla" to="/sla">
              Service Level Agreement
            </A>,
            "Platform uptime, support response times and service credits.",
          ],
          [
            <A key="pp" to="/privacy">
              Privacy Policy
            </A>,
            "How we collect, use and protect personal data.",
          ],
        ]}
      />
      <P>
        Where these Website Terms of Use conflict with any of the above in
        relation to the platform, <B>the other agreement prevails</B>.
      </P>

      {/* ── 4 ── */}
      <H2 id="privacy">4. Your Privacy</H2>
      <P>
        Our <A to="/privacy">Privacy Policy</A> explains what we collect when
        you use this website — including IP address, device and browser
        information, pages visited and anything you submit through a form — and
        the basis on which we process it. BantaHR uses{" "}
        <B>essential cookies only</B> and does not use third-party advertising
        cookies.
      </P>

      {/* ── 5 ── */}
      <H2 id="using">5. Using This Website</H2>
      <P>
        This website is intended for business and professional use. It is not
        directed at individuals under the age of 18, and we do not knowingly
        collect personal data from minors.
      </P>
      <P>
        We grant you a personal, non-exclusive, non-transferable right to access
        and view this website for your own information and for evaluating
        BantaHR. That right does not extend to any commercial exploitation of
        the site or its content.
      </P>

      {/* ── 6 ── */}
      <H2 id="ip">6. Intellectual Property</H2>
      <P>
        The BantaHR name, logo, branding, page designs, text, graphics,
        screenshots and underlying software are owned by BantaHR or its
        licensors and are protected by Nigerian and international intellectual
        property law.
      </P>
      <P>
        You may not use the BantaHR name, logo or branding without prior written
        consent. You may quote short extracts from this website with clear
        attribution and a link back to the page you took them from.
      </P>

      {/* ── 7 ── */}
      <H2 id="submissions">7. Content You Submit</H2>
      <P>
        When you submit information through a form on this website — a demo
        request, a contact message, a security-review request or a job
        application — you confirm that the information is accurate and that you
        are entitled to provide it.
      </P>
      <P>
        You keep ownership of what you submit. You grant BantaHR a
        non-exclusive, royalty-free licence to use it for the purpose you
        submitted it for, and to retain it as described in our{" "}
        <A to="/privacy">Privacy Policy</A>. Please do not submit employee
        personal data through website forms — the platform, governed by the{" "}
        <A to="/dpa">DPA</A>, is the appropriate place for it.
      </P>
      <P>
        If you send us feedback or suggestions about BantaHR, we may use them
        without restriction and without owing you compensation.
      </P>

      {/* ── 8 ── */}
      <H2 id="acceptable">8. Rules of Acceptable Use</H2>
      <P>When using this website, you must not:</P>
      <UL>
        <LI>
          Collect or harvest data from the site by any automated or
          non-automated means, including <B>scraping</B>, crawling, spidering or
          data mining, other than by a search engine operating within our
          published robots directives
        </LI>
        <LI>
          Aggregate, copy, reproduce, republish or re-sell any part of the site
          or its content, except as permitted in{" "}
          <A href="#ip">Section 6</A>
        </LI>
        <LI>
          Attempt to gain unauthorised access to the site, its servers or any
          connected system, or probe or test its security
        </LI>
        <LI>
          Introduce malicious code, or anything designed to disrupt, damage or
          degrade the site
        </LI>
        <LI>
          Reverse engineer, decompile or attempt to derive the source code of
          any part of the site
        </LI>
        <LI>
          Impose an unreasonable load on our infrastructure, or interfere with
          anyone else’s use of the site
        </LI>
        <LI>
          Use the site to send unsolicited commercial communications, or to
          impersonate BantaHR or any other person
        </LI>
        <LI>
          Use the site to build, train or benchmark a competing product or
          service
        </LI>
        <LI>Use the site in a way that breaks any applicable law</LI>
      </UL>
      <P>
        We may suspend or block access to the website where we reasonably
        believe these rules have been broken.
      </P>

      {/* ── 9 ── */}
      <H2 id="availability">9. Website Availability</H2>
      <P>
        We aim to keep this website available, but we do not guarantee it.{" "}
        <B>
          The uptime commitments in our Service Level Agreement apply to the
          BantaHR platform, not to this marketing website.
        </B>
      </P>
      <P>
        We may suspend, withdraw or restrict all or part of the site for
        business or operational reasons, and we are not liable for periods of
        unavailability. This includes interruptions caused by events outside our
        reasonable control — natural disasters, power grid failures, government
        actions, and internet backbone disruptions.
      </P>
      <P>
        The site is built for current browsers. We support the latest two
        versions of Chrome, Firefox, Edge and Safari; older browsers may not
        display the site correctly.
      </P>

      {/* ── 10 ── */}
      <H2 id="links">10. Links to Other Sites</H2>
      <P>
        Where this website links to third-party sites or resources, those links
        are provided for information only. We do not control them, do not
        endorse them, and are not responsible for their content, availability or
        privacy practices. Follow them at your own risk and read their terms.
      </P>

      {/* ── 11 ── */}
      <H2 id="disclaimer">11. Disclaimers</H2>
      <P>
        The content of this website is provided <B>“as is”</B> and for general
        information only. It is not advice — legal, tax, payroll, employment or
        otherwise — and you should not act on it without taking appropriate
        professional advice.
      </P>
      <P>
        Product descriptions, screenshots and roadmap statements on this site
        describe BantaHR in general terms and may change. What you are entitled
        to receive as a customer is defined by your subscription and by the{" "}
        <A to="/terms">Terms of Service</A>, not by this website. Where the two
        differ, your contract governs.
      </P>

      {/* ── 12 ── */}
      <H2 id="liability">12. Limitation of Liability</H2>
      <P>
        To the maximum extent permitted by Nigerian law, BantaHR is not liable
        for any loss or damage arising from your use of, or inability to use,
        this website — including indirect, incidental, consequential or punitive
        damages, loss of profits, loss of data or business interruption.
      </P>
      <P>
        Nothing in these terms excludes or limits liability that cannot lawfully
        be excluded or limited. Liability arising from your subscription is
        governed by the <A to="/terms">Terms of Service</A>, which caps it at
        the fees paid in the three months preceding the claim.
      </P>

      {/* ── 13 ── */}
      <H2 id="ending">13. Ending Your Use</H2>
      <P>
        You may stop using this website at any time. We may end or restrict your
        access to it at any time, without notice, where we reasonably believe
        you have breached these terms. Sections that by their nature should
        survive — intellectual property, disclaimers, limitation of liability
        and governing law — continue to apply.
      </P>

      {/* ── 14 ── */}
      <H2 id="changes">14. Changes to the Website and These Terms</H2>
      <P>
        We may change the website, and these terms, at any time. The version
        published on this page is the version in force, and the “last updated”
        date at the top tells you when it last changed. Continued use of the
        site after a change constitutes acceptance.
      </P>
      <P>
        Changes to the <A to="/terms">Terms of Service</A>,{" "}
        <A to="/dpa">DPA</A> and <A to="/sla">SLA</A> are notified to customers
        separately, at least 30 days before taking effect.
      </P>

      {/* ── 15 ── */}
      <H2 id="law">15. Governing Law and Disputes</H2>
      <P>
        These terms are governed by the laws of the Federal Republic of Nigeria,
        and the Nigerian courts have jurisdiction over any dispute arising from
        your use of this website.
      </P>
      <P>
        Please contact us first at{" "}
        <A href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</A> — most issues
        are resolved quickly. Disputes arising from a BantaHR{" "}
        <B>subscription</B> follow the dispute resolution route in the{" "}
        <A to="/terms">Terms of Service</A>: good-faith negotiation, then
        arbitration in Lagos under the Arbitration and Conciliation Act (Cap A18
        LFN 2004).
      </P>

      {/* ── 16 ── */}
      <H2 id="contact">16. Contact</H2>
      <P>For any question about these Website Terms of Use:</P>
      <ContactBlock />
    </LegalDoc>
  );
}

/* NOTES — read before publishing:
   1. NO SOURCE DOCUMENT. The other four legal pages transcribe a BantaHR PDF.
      This one does not — BantaHR has no Website Terms of Use on file, so this
      was written from scratch. It has NOT been reviewed by a lawyer. Treat it
      as a solid draft, not as executed terms.
   2. Facts reused rather than invented: jurisdiction and CAC registration
      (DPA/ToS), arbitration forum (SLA §11), supported browsers (SLA §7),
      force majeure list (SLA §3.2), office address and contact email (all
      four documents), essential-cookies-only (Privacy §9).
   3. §9 deliberately separates website availability from the platform SLA.
      Without that line, a visitor could read the 99.5%/99.9% uptime figures as
      applying to the marketing site.
   4. §8 forbids scraping. If you later want AI crawlers or search engines to
      index the site, make sure robots.txt matches what this clause claims —
      a terms page and a permissive robots.txt that disagree is worse than
      neither.
   5. "Effective 2025" has no month or day, matching the other documents.
      Replace all five with real dates together. */
