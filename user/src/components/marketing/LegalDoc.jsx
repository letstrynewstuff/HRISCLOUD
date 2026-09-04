// src/components/marketing/LegalDoc.jsx
// Shared chrome and typography for the public legal documents
// (/privacy, /dpa, /terms). Layout follows the Metaview legal pages: a narrow
// centred measure, numbered sections, bold-led bullets and bordered tables.
//
// Each page supplies its own content; everything visual lives here so the
// three documents cannot drift apart typographically.

import { Link } from "react-router-dom";
import { ArrowUpRight, Mail } from "lucide-react";

import MarketingNav from "./MarketingNav";
import MarketingFooter from "./MarketingFooter";

export const CONTACT_EMAIL = "support@bantahr.com";

/* ── Typographic primitives ───────────────────────────────────────────── */

export const H2 = ({ id, children }) => (
  <h2
    id={id}
    className="m-0 scroll-mt-32 pt-14 font-display text-[clamp(1.45rem,2.6vw,1.8rem)] leading-[1.25] font-extrabold tracking-[-0.5px] text-brand-navy"
  >
    {children}
  </h2>
);

export const H3 = ({ children }) => (
  <h3 className="m-0 pt-8 font-display text-[1.05rem] font-bold text-brand-navy">
    {children}
  </h3>
);

export const P = ({ children }) => (
  <p className="m-0 pt-4 text-[15px] leading-[1.8] text-brand-ink-mid">
    {children}
  </p>
);

export const UL = ({ children }) => (
  <ul className="m-0 flex list-disc flex-col gap-2 pt-4 pl-5 marker:text-brand-ink-muted">
    {children}
  </ul>
);

export const LI = ({ children }) => (
  <li className="text-[15px] leading-[1.75] text-brand-ink-mid">{children}</li>
);

export const B = ({ children }) => (
  <strong className="font-semibold text-brand-navy">{children}</strong>
);

export const A = ({ to, href, children }) => {
  const cls =
    "font-medium text-brand-navy underline underline-offset-2 transition-colors duration-200 hover:text-brand-indigo";
  return to ? (
    <Link to={to} className={cls}>
      {children}
    </Link>
  ) : (
    <a href={href} className={cls}>
      {children}
    </a>
  );
};

/* Bordered data table. `nowrapFirst` keeps a short label column on one line;
   turn it off when the first column holds prose. */
export function Table({ head, rows, nowrapFirst = true }) {
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[460px] border-collapse overflow-hidden rounded-lg border border-brand-line text-left">
        <thead>
          <tr className="bg-brand-navy/[0.04]">
            {head.map((h) => (
              <th
                key={h}
                className="border-b border-brand-line px-4 py-3 text-[13px] font-bold text-brand-navy"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={String(row[0])} className="border-b border-brand-line last:border-0">
              {row.map((cell, i) => (
                <td
                  key={i}
                  className={`px-4 py-3.5 align-top text-[14px] leading-[1.65] ${
                    i === 0
                      ? `font-semibold text-brand-navy ${nowrapFirst ? "whitespace-nowrap" : ""}`
                      : "text-brand-ink-mid"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* Bordered callout used for contact blocks and signature panels. */
export const Panel = ({ title, children }) => (
  <div className="mt-5 rounded-xl border border-brand-line bg-white p-6">
    {title && (
      <p className="m-0 mb-4 font-display text-base font-bold text-brand-navy">
        {title}
      </p>
    )}
    {children}
  </div>
);

export const ContactBlock = () => (
  <Panel title="BantaHR">
    <div className="flex flex-col gap-2.5 text-[15px] text-brand-ink-mid">
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="inline-flex w-fit items-center gap-2 font-medium text-brand-indigo no-underline"
      >
        <Mail size={15} />
        {CONTACT_EMAIL}
      </a>
      <p className="m-0">No 1 Adetunji Adegbite Street, Ogudu, Lagos, Nigeria</p>
      <p className="m-0">Jurisdiction: Federal Republic of Nigeria</p>
    </div>
  </Panel>
);

/* ── Page shell ───────────────────────────────────────────────────────── */

export default function LegalDoc({ title, updated, seeAlso = [], children }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-brand-offwhite font-body">
      <MarketingNav />

      <main className="px-6 pt-36 pb-24">
        <article className="mx-auto max-w-[640px]">
          <h1 className="m-0 text-center font-display text-[clamp(2rem,4.6vw,2.9rem)] leading-[1.15] font-extrabold tracking-[-1.2px] text-brand-navy">
            {title}
          </h1>

          {updated && (
            <p className="m-0 pt-8 text-[15px] text-brand-ink-mid">
              <B>Last updated:</B> {updated}
            </p>
          )}

          {seeAlso.length > 0 && (
            <p className="m-0 pt-4 text-[15px] leading-[1.8] text-brand-ink-mid">
              See also our{" "}
              {seeAlso.map((doc, i) => (
                <span key={doc.to}>
                  <A to={doc.to}>{doc.label}</A>
                  {i < seeAlso.length - 2 ? ", " : ""}
                  {i === seeAlso.length - 2 ? " and " : ""}
                </span>
              ))}
              .
            </p>
          )}

          {children}

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              to="/trust"
              className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 text-sm font-bold text-white no-underline transition-opacity duration-200 hover:opacity-90"
            >
              Visit the Trust Center
              <ArrowUpRight size={15} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border-2 border-brand-navy/20 px-6 py-3 text-sm font-bold text-brand-navy no-underline transition-colors duration-200 hover:border-brand-navy/50"
            >
              Contact us
            </Link>
          </div>
        </article>
      </main>

      <MarketingFooter />
    </div>
  );
}

/* "On this page" index. Rendered by each document immediately after its intro
   so the anchor list sits below the preamble, as on the reference pages. */
export const Toc = ({ sections }) => (
  <nav
    aria-label="On this page"
    className="mt-10 rounded-xl border border-brand-line bg-white p-5"
  >
    <p className="m-0 mb-3 text-[11px] font-bold tracking-[0.1em] text-brand-ink-muted uppercase">
      On this page
    </p>
    <ol className="m-0 grid list-none grid-cols-1 gap-x-6 gap-y-2 p-0 sm:grid-cols-2">
      {sections.map(([id, label]) => (
        <li key={id}>
          <a
            href={`#${id}`}
            className="text-[13.5px] text-brand-ink-mid no-underline transition-colors duration-200 hover:text-brand-indigo"
          >
            {label}
          </a>
        </li>
      ))}
    </ol>
  </nav>
);
