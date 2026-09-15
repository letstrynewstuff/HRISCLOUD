// src/pages/Contact.jsx
// BantaHR — Contact page.
//
// Layout follows the SaneHQ contact page: breadcrumb, a split hero with a
// two-tone display headline and contact meta on the left and a boxed form on
// the right, then a split FAQ block with the questions always expanded.
//
// Submission uses the same mailto: handoff as RequestDemo.jsx — there is no
// contact endpoint on the server. CONTACT_EMAIL is both the mailto target and
// the address shown on the page.

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Loader2, Send } from "lucide-react";

import MarketingNav from "../components/marketing/MarketingNav";
import MarketingFooter from "../components/marketing/MarketingFooter";

const CONTACT_EMAIL = "support@bantahr.com";
const RESPONSE_TIME = "Within 1 business day";

const FAQS = [
  {
    q: "How do I contact BantaHR support?",
    a: `Email ${CONTACT_EMAIL} or use the form on this page. Existing customers can also reach us from the in-app chat, which routes straight to the team that knows your account.`,
  },
  {
    q: "What can I reach out about?",
    a: "Product questions, pricing, onboarding, partnership enquiries and bug reports are all welcome. If you are evaluating BantaHR for your company, ask for a demo and we will walk you through the platform with your own data.",
  },
  {
    q: "I need help migrating our employee records. Can you assist?",
    a: "Yes — data migration and company configuration are included with every paid plan at no extra cost. Send us your current records in whatever format you keep them and our team handles the import.",
  },
  {
    q: "Where is BantaHR based?",
    a: "We are in Lagos, Nigeria, and build specifically for Nigerian and African payroll and compliance. Our team works local hours, so you are not waiting overnight for a reply from another timezone.",
  },
];

const EYEBROW =
  "text-xs font-bold uppercase tracking-[0.18em] text-brand-indigo";
const DISPLAY =
  "m-0 font-body text-[clamp(2.8rem,6.5vw,5rem)] leading-[0.98] font-normal tracking-[-2.5px] text-brand-ink";
const META_LABEL =
  "m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-ink-muted";
const FIELD_LABEL = "mb-2 block text-sm font-bold text-brand-ink";
const FIELD =
  "w-full rounded-md border border-brand-line bg-white px-4 py-3 text-[15px] text-brand-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-brand-ink-muted/70 focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/15";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Your name is required.";
    if (!form.email.trim()) e.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Please enter a valid email.";
    if (!form.subject.trim()) e.subject = "Let us know what this is about.";
    if (!form.message.trim()) e.message = "Please write a message.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();

    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    setSubmitting(true);
    try {
      const body = [
        `Name: ${form.name}`,
        `Email: ${form.email}`,
        "",
        form.message,
      ].join("\n");

      const subject = `BantaHR — ${form.subject}`;
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(body)}`;

      await new Promise((r) => setTimeout(r, 700));
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overflow-x-hidden bg-white font-body text-brand-ink">
      <MarketingNav />

      {/* ── HERO + FORM ── */}
      <section className="px-6 pt-36 pb-24">
        <div className="mx-auto max-w-[1200px]">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-12 text-sm">
            <Link
              to="/"
              className="text-brand-ink-muted no-underline transition-colors duration-200 hover:text-brand-ink"
            >
              Home
            </Link>
            <span className="px-2 text-brand-ink-muted">/</span>
            <span className="font-medium text-brand-ink">Contact</span>
          </nav>

          <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20">
            {/* ── Left: pitch + contact meta ── */}
            <div>
              <span className={EYEBROW}>Contact</span>

              <h1 className={`${DISPLAY} mt-5`}>
                Get in
                <br />
                <span className="text-brand-ink-muted">touch.</span>
              </h1>

              <p className="mt-8 max-w-[42ch] text-lg leading-[1.6] text-brand-ink-mid">
                Questions, feedback, or partnerships. Our team is in Lagos and
                replies during local business hours.
              </p>

              <hr className="my-10 border-0 border-t border-brand-line" />

              <div className="flex flex-col gap-8">
                <div>
                  <p className={META_LABEL}>Email</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="group mt-2 inline-flex items-center gap-2 font-semibold text-brand-indigo no-underline"
                  >
                    {CONTACT_EMAIL}
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </a>
                </div>

                <div>
                  <p className={META_LABEL}>Typical response</p>
                  <p className="mt-2 m-0 text-brand-ink">{RESPONSE_TIME}</p>
                </div>

                <div>
                  <p className={META_LABEL}>Office</p>
                  <p className="mt-2 m-0 max-w-[32ch] text-brand-ink">
                    No 1 Adetunji Adegbite Street, Ogudu, Lagos, Nigeria
                  </p>
                </div>
              </div>
            </div>

            {/* ── Right: form ── */}
            <div className="rounded-lg border border-brand-line bg-brand-indigo/[0.03] p-6 sm:p-9">
              {sent ? (
                <div className="flex h-full flex-col items-start justify-center py-10">
                  <CheckCircle2
                    size={40}
                    strokeWidth={1.6}
                    className="text-emerald-500"
                  />
                  <h2 className="mt-5 mb-3 font-display text-2xl font-bold text-brand-navy">
                    Your email is ready to send.
                  </h2>
                  <p className="m-0 max-w-[42ch] text-[15px] leading-[1.7] text-brand-ink-mid">
                    We opened your mail app with the message pre-filled — hit
                    send there and it reaches us directly. If nothing opened,
                    email us at{" "}
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="font-semibold text-brand-indigo no-underline"
                    >
                      {CONTACT_EMAIL}
                    </a>
                    .
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="mt-7 cursor-pointer rounded-full border-2 border-brand-indigo bg-transparent px-6 py-2.5 text-sm font-bold text-brand-indigo transition-colors duration-200 hover:bg-brand-indigo hover:text-white"
                  >
                    Write another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className={FIELD_LABEL}>
                        Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        placeholder="Your name"
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        aria-invalid={!!errors.name}
                        className={FIELD}
                      />
                      {errors.name && (
                        <p className="mt-1.5 m-0 text-xs text-red-500">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contact-email" className={FIELD_LABEL}>
                        Email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        aria-invalid={!!errors.email}
                        className={FIELD}
                      />
                      {errors.email && (
                        <p className="mt-1.5 m-0 text-xs text-red-500">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5">
                    <label htmlFor="contact-subject" className={FIELD_LABEL}>
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      placeholder="What's this about?"
                      value={form.subject}
                      onChange={(e) => set("subject", e.target.value)}
                      aria-invalid={!!errors.subject}
                      className={FIELD}
                    />
                    {errors.subject && (
                      <p className="mt-1.5 m-0 text-xs text-red-500">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  <div className="mt-5">
                    <label htmlFor="contact-message" className={FIELD_LABEL}>
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows={7}
                      placeholder="Tell us what's on your mind..."
                      value={form.message}
                      onChange={(e) => set("message", e.target.value)}
                      aria-invalid={!!errors.message}
                      className={`${FIELD} min-h-[180px] resize-y`}
                    />
                    {errors.message && (
                      <p className="mt-1.5 m-0 text-xs text-red-500">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-full border-0 bg-brand-indigo px-8 py-4 text-[15px] font-bold text-white transition-opacity duration-200 hover:opacity-[0.9] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Send size={17} />
                    )}
                    {submitting ? "Opening your mail app…" : "Send message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 pb-28">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <span className={EYEBROW}>FAQ</span>
            <h2 className={`${DISPLAY} mt-5`}>
              Before you write.
              <br />
              <span className="text-brand-ink-muted">Quick answers.</span>
            </h2>
          </div>

          <div className="border-t border-brand-line">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="border-b border-brand-line py-7">
                <h3 className="m-0 mb-3 text-base font-bold text-brand-ink">
                  {q}
                </h3>
                <p className="m-0 text-[15px] leading-[1.8] text-brand-ink-mid">
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
