// src/components/marketing/MarketingFooter.jsx
// Shared footer for the public marketing pages.

import { Link } from "react-router-dom";

import BantaHRLogo from "../../styles/BantaHRLogo";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", to: "/pricing" },
      { label: "Security", href: "/#about" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/#about" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", to: "/contact" },
      // { label: "Status", href: "#" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Trust Center", to: "/trust" },
      { label: "Terms of Service", to: "/terms" },
      // { label: "Data Processing Agreement", to: "/dpa" },
      { label: "Website Terms of Use", to: "/website-terms" },


    ],
  },
];

const LINK_CLASS =
  "mb-2.5 block text-sm text-white/60 no-underline transition-colors duration-200 hover:text-white";

export default function MarketingFooter() {
  return (
    <footer className="bg-brand-navy px-6 pt-14 pb-8">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-12 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-10">
          <div>
            <div className="mb-4">
              <BantaHRLogo variant="light" size="md" />
            </div>
            <p className="m-0 text-sm leading-[1.7] text-white/50">
              The all-in-one HR platform built for African businesses.
            </p>
          </div>

          {FOOTER_LINKS.map(({ title, links }) => (
            <div key={title}>
              <p className="m-0 mb-4 text-[13px] font-bold tracking-[0.08em] text-white/40 uppercase">
                {title}
              </p>
              {links.map((l) =>
                l.to ? (
                  <Link key={l.label} to={l.to} className={LINK_CLASS}>
                    {l.label}
                  </Link>
                ) : (
                  <a key={l.label} href={l.href} className={LINK_CLASS}>
                    {l.label}
                  </a>
                ),
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
          <p className="m-0 text-[13px] text-white/35">
            © {new Date().getFullYear()} BantaHR Ltd. All rights reserved.
          </p>
          <p className="m-0 flex items-center gap-[5px] text-[13px] text-white/35">
            No 1 Adetunji Adegbite Street, Ogudu, Lagos, Nigeria
          </p>
        </div>
      </div>
    </footer>
  );
}
