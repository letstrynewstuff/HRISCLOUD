// src/pages/NotFound.jsx
//
// Until now App.jsx had 65 routes and no catch-all, so any unmatched URL — a
// typo, a stale bookmark, a renamed route — rendered a completely blank page
// with no error. Found by a Playwright sweep that flagged `/admin/settings`
// (the real path is /admin/settings/admin-settings) as rendering 0 characters.

import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import C from "../styles/colors";

export default function NotFound() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAdminPath = pathname.startsWith("/admin");

  return (
    <div
      className="min-h-screen grid place-items-center px-6"
      style={{ background: C.gradient.hero }}
    >
      <div
        className="w-full max-w-md text-center p-10 flex flex-col items-center gap-3"
        style={{
          background: C.surface,
          borderRadius: C.radius.card,
          boxShadow: C.shadow.lift,
        }}
      >
        <span
          className="w-16 h-16 grid place-items-center mb-1"
          style={{
            background: C.gradient.soft,
            color: C.primaryStrong,
            borderRadius: C.radius.card,
          }}
        >
          <Compass size={30} />
        </span>

        <p className="label-mono" style={{ color: C.primary }}>
          Error 404
        </p>
        <h1 className="display text-2xl">This page doesn&rsquo;t exist</h1>
        <p className="text-sm" style={{ color: C.textSecondary }}>
          We couldn&rsquo;t find anything at{" "}
          <code
            className="px-1.5 py-0.5"
            style={{
              background: C.bgMid,
              borderRadius: 6,
              fontFamily: C.font.mono,
              fontSize: "0.8125rem",
              color: C.textPrimary,
            }}
          >
            {pathname}
          </code>
          . It may have moved, or the link may be out of date.
        </p>

        <div className="flex flex-wrap gap-2 justify-center mt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-pill btn-quiet"
          >
            <ArrowLeft size={16} /> Go back
          </button>
          <Link
            to={isAdminPath ? "/admin/dashboard" : "/dashboard"}
            className="btn-pill btn-primary"
          >
            {isAdminPath ? "Admin dashboard" : "My dashboard"}
          </Link>
        </div>
      </div>
    </div>
  );
}
