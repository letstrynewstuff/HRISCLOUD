// src/components/marketing/MarketingNav.jsx
// Shared floating pill nav for the public marketing pages.
//
// Section links resolve differently depending on where you are: on the landing
// page they are in-page anchors (smooth scroll); anywhere else they point back
// at "/" so the browser lands on the right section.

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

import BantaHRLogo from "../../styles/BantaHRLogo";

const NAV = [
  { label: "Features", hash: "features" },
  { label: "Pricing", to: "/pricing" },
  { label: "Testimonials", hash: "testimonials" },
  { label: "About", hash: "about" },
  { label: "Contact", to: "/contact" },
];

/* Mouse-follow spotlight: writes --mouse-x / --mouse-y that the
   radial-gradient background reads. Exported so page-level CTAs can reuse it. */
export const handleSpotlightMove = (e) => {
  const target = e.currentTarget;
  const rect = target.getBoundingClientRect();
  target.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
  target.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
};

/* `heroTone` describes the background sitting *behind* the nav before it
   scrolls — the bar is transparent up there, so it has to borrow the hero's
   contrast. Pages with a pale fold (pricing, contact) keep the default;
   the landing page's dark hero passes "dark". Once scrolled the bar has its
   own navy backdrop and both tones converge on white. */
export default function MarketingNav({ heroTone = "light" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const onLanding = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll(); // a route change can land us mid-page
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goDemo = () => navigate("/request-demo");

  const onDark = scrolled || heroTone === "dark";

  const linkClass = onDark
    ? "text-white hover:text-white/80"
    : "text-brand-indigo hover:text-brand-indigo/45";

  const renderLink = (item, className, onClick) =>
    item.to ? (
      <Link key={item.label} to={item.to} className={className} onClick={onClick}>
        {item.label}
      </Link>
    ) : (
      <a
        key={item.label}
        href={onLanding ? `#${item.hash}` : `/#${item.hash}`}
        className={className}
        onClick={onClick}
      >
        {item.label}
      </a>
    );

  return (
    <nav
      className={`fixed top-5 left-1/2 z-[1000] flex h-[72px] w-[min(1200px,calc(100%-40px))] -translate-x-1/2 items-center justify-between rounded-full border px-8 transition-all duration-[350ms] ease-[ease] ${
        scrolled
          ? "border-white/10 bg-brand-navy/75 shadow-[0_10px_30px_rgba(0,0,0,.18),inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-[18px]"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[68px] w-full max-w-[1200px] items-center gap-8">
        <Link to="/" aria-label="BantaHR home">
          <BantaHRLogo variant={onDark ? "light" : "dark"} size="md" />
        </Link>

        {/* Desktop nav */}
        <div className="ml-6 hidden flex-1 items-center gap-7 lg:flex">
          {NAV.map((item) =>
            renderLink(
              item,
              `text-sm font-semibold no-underline transition-colors duration-200 ${linkClass}`,
            ),
          )}
        </div>

        <div className="ml-auto flex items-center gap-4">
          <Link
            to="/login"
            className={`hidden text-sm font-semibold no-underline transition-colors duration-200 lg:inline ${linkClass}`}
          >
            Sign in
          </Link>

          <button
            onClick={goDemo}
            onMouseMove={handleSpotlightMove}
            className="
              group relative isolate hidden cursor-pointer items-center justify-center
              overflow-hidden rounded-[10px] border-0 bg-transparent px-[22px] py-[10px]
              transition-[transform,box-shadow] duration-200 ease-[ease]
              hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(79,70,229,.45)]
              lg:inline-flex
              before:absolute before:inset-0.5 before:-z-10 before:rounded-[inherit]
              before:bg-brand-indigo before:content-['']
              after:absolute after:inset-0 after:-z-20 after:animate-rotate-border
              after:rounded-[inherit] after:content-['']
              after:bg-[conic-gradient(from_var(--angle),transparent_0deg,transparent_260deg,#ffffff_300deg,#8b84ff_330deg,transparent_360deg)]
              after:[filter:drop-shadow(0_0_12px_rgba(79,70,229,.8))]
            "
          >
            <span className="pointer-events-none absolute inset-0.5 rounded-[inherit] bg-[radial-gradient(120px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,.25),transparent_70%)] opacity-0 transition-opacity duration-[250ms] ease-[ease] group-hover:opacity-100" />
            <span className="relative z-[2] text-sm font-semibold text-white">
              Request a Demo
            </span>
          </button>

          <button
            onClick={() => setMenuOpen((p) => !p)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className={`flex cursor-pointer items-center rounded-lg border-0 p-2 lg:hidden ${
              onDark ? "bg-white/10 text-white" : "bg-brand-navy/10 text-brand-navy"
            }`}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu — sits below the pill rather than inside it */}
      {menuOpen && (
        <div className="absolute top-full right-0 left-0 mt-2 flex flex-col gap-1 rounded-3xl border border-white/10 bg-brand-navy-mid p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] lg:hidden">
          {NAV.map((item) =>
            renderLink(
              item,
              "border-b border-white/5 py-3 text-base font-semibold text-white/80 no-underline",
              () => setMenuOpen(false),
            ),
          )}
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="border-b border-white/5 py-3 text-base font-semibold text-white/80 no-underline"
          >
            Sign in
          </Link>
          <button
            onClick={() => {
              setMenuOpen(false);
              goDemo();
            }}
            className="mt-4 cursor-pointer rounded-[10px] border-0 bg-brand-indigo py-3.5 text-[15px] font-semibold text-white"
          >
            Request a Demo
          </button>
        </div>
      )}
    </nav>
  );
}
