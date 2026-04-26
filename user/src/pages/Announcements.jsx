// src/pages/employee/Announcements.jsx

// Wired to: /auth/me, /announcements/feed, /announcements/:id/view

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SideNavbar from "../components/sideNavbar";
import {
  Bell,
  Search,
  Menu,
  ChevronDown,
  ChevronRight,
  X,
  Pin,
  RefreshCw,
  AlertCircle,
  Loader2,
  Eye,
  Filter,
  Building2,
  Globe,
  Star,
} from "lucide-react";
import C from "../styles/colors";
import { authApi } from "../api/service/authApi";
import API from "../api/axios";

const announcementApi = {
  feed: (params = {}) =>
    API.get("/announcements/feed", { params }).then((r) => r.data),
  markView: (id) => API.put(`/announcements/${id}/view`).then((r) => r.data),
};

/* ─── Animations ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Skeleton ─── */
const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-xl ${className}`}
    style={{ background: "#E8EBF4" }}
  />
);

/* ─── Audience badge ─── */
function AudienceBadge({ ann }) {
  if (ann.audience === "department") {
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
        style={{ background: C.accentLight, color: C.accent }}
      >
        <Building2 size={9} />
        {ann.department_name ?? "Dept."}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: C.primaryLight, color: C.primary }}
    >
      <Globe size={9} />
      Company-wide
    </span>
  );
}

/* ─── Detail modal ─── */
function AnnouncementModal({ ann, onClose }) {
  useEffect(() => {
    announcementApi.markView(ann.id).catch(() => {});
  }, [ann.id]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg px-4"
      >
        <div
          className="rounded-2xl bg-white shadow-2xl overflow-hidden"
          style={{ border: `1px solid ${C.border}` }}
        >
          {/* Header */}
          <div
            className="px-5 py-4 flex items-start justify-between"
            style={{
              background: ann.is_pinned ? C.warningLight : C.primaryLight,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div className="flex-1 pr-3">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {ann.is_pinned && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: C.warning, color: "#fff" }}
                  >
                    📌 Pinned
                  </span>
                )}
                <AudienceBadge ann={ann} />
              </div>
              <h2
                className="font-bold text-base leading-snug"
                style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
              >
                {ann.title}
              </h2>
              <p className="text-xs mt-1" style={{ color: C.textSecondary }}>
                Posted by <strong>{ann.posted_by ?? "HR"}</strong> ·{" "}
                {ann.publish_at
                  ? new Date(ann.publish_at).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : new Date(ann.created_at).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg shrink-0"
              style={{ background: "rgba(0,0,0,0.07)" }}
            >
              <X size={16} color={C.textSecondary} />
            </button>
          </div>
          {/* Body */}
          <div className="p-5">
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: C.textPrimary }}
            >
              {ann.body}
            </p>
          </div>
          {/* Footer */}
          <div className="px-5 pb-4 flex items-center justify-between">
            <span
              className="text-xs flex items-center gap-1"
              style={{ color: C.textMuted }}
            >
              <Eye size={11} />
              {ann.views ?? 0} views
            </span>
            {ann.expires_at && (
              <span className="text-xs" style={{ color: C.textMuted }}>
                Expires{" "}
                {new Date(ann.expires_at).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ════════════════════════ MAIN ════════════════════════ */
export default function AnnouncementsPage() {
  /* ── Auth ── */
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* ── Data ── */
  const [announcements, setAnnouncements] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ── UI ── */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [filterAudience, setFilterAudience] = useState("all"); // "all" | "company" | "department"
  const [page, setPage] = useState(1);
  const [selectedAnn, setSelectedAnn] = useState(null);
  const loaderRef = useRef(null);

  /* ── Profile ── */
  useEffect(() => {
    authApi
      .getMe()
      .then((r) => setProfile(r.data ?? r))
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  /* ── Fetch announcements ── */
  const fetchAnnouncements = useCallback(
    async (reset = false) => {
      if (reset) setPage(1);
      const p = reset ? 1 : page;
      setLoading(true);
      setError(null);
      try {
        const res = await announcementApi.feed({ page: p, limit: 15 });
        const newData = res.data ?? [];
        setAnnouncements((prev) =>
          reset || p === 1 ? newData : [...prev, ...newData],
        );
        setMeta(res.meta ?? { total: 0, page: 1, totalPages: 1 });
      } catch (err) {
        setError(
          err?.response?.data?.message ?? "Failed to load announcements.",
        );
      } finally {
        setLoading(false);
      }
    },
    [page],
  );

  useEffect(() => {
    fetchAnnouncements();
  }, [page]);

  /* ── Filtered list (client-side search on what's loaded) ── */
  const filtered = announcements.filter((ann) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !searchQuery ||
      ann.title.toLowerCase().includes(q) ||
      ann.body.toLowerCase().includes(q);
    const matchAudience =
      filterAudience === "all" ||
      (filterAudience === "company" && ann.audience === "all") ||
      (filterAudience === "department" && ann.audience === "department");
    return matchSearch && matchAudience;
  });

  const pinned = filtered.filter((a) => a.is_pinned);
  const regular = filtered.filter((a) => !a.is_pinned);

  const initials = profile
    ? (
        (profile.first_name?.[0] ?? "") + (profile.last_name?.[0] ?? "")
      ).toUpperCase()
    : "..";

  const fmtDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /* ─────────────────────── RENDER ─────────────────────── */
  return (
    <div
      className="min-h-screen"
      style={{
        background: C.bg,
        color: C.textPrimary,
        fontFamily: "'DM Sans','Sora',sans-serif",
      }}
    >
      <div className="flex h-screen overflow-hidden">
        <SideNavbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          COLORS={C}
          EMPLOYEE={{
            name: authLoading
              ? "…"
              : `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim(),
            role: profile?.job_role_name ?? "—",
            department: profile?.department_name ?? "—",
            initials,
            id: profile?.employee_code ?? "—",
          }}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* ── TOP NAV ── */}
          <header
            className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{
              background: "rgba(240,242,248,0.85)",
              backdropFilter: "blur(12px)",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen((p) => !p)}
              className="p-2 rounded-xl hidden md:flex"
              style={{ background: C.surface }}
            >
              <Menu size={16} color={C.textSecondary} />
            </motion.button>

            <div className="relative flex-1 max-w-sm">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                color={C.textMuted}
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search announcements…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{
                  background: C.surface,
                  border: `1.5px solid ${searchFocused ? C.primary : C.border}`,
                  color: C.textPrimary,
                  boxShadow: searchFocused
                    ? `0 0 0 3px ${C.primaryLight}`
                    : "none",
                }}
              />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchAnnouncements(true)}
                className="p-2 rounded-xl"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
                title="Refresh"
              >
                <RefreshCw size={14} color={C.textSecondary} />
              </motion.button>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg,#6366F1,#06B6D4)",
                }}
              >
                {authLoading ? "…" : initials}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-5">
            {/* ── HERO ── */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="relative rounded-2xl overflow-hidden p-6 md:p-8"
              style={{
                background:
                  "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
                minHeight: 130,
              }}
            >
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                  className="absolute -top-10 -right-10 w-56 h-56 rounded-full opacity-10"
                  style={{
                    background: "radial-gradient(circle,#818CF8,transparent)",
                  }}
                />
              </div>
              <div className="relative flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <Bell size={22} color="#fff" />
                </div>
                <div>
                  <h1
                    className="text-white text-2xl md:text-3xl font-bold"
                    style={{ fontFamily: "Sora,sans-serif" }}
                  >
                    Announcements
                  </h1>
                  <p className="text-indigo-300 text-sm mt-0.5">
                    {loading
                      ? "Loading…"
                      : `${meta.total} announcement${meta.total !== 1 ? "s" : ""} for you`}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ── FILTERS ── */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.5}
            >
              <div
                className="flex gap-1 p-1 rounded-xl w-fit"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                {[
                  { val: "all", label: "All", icon: Globe },
                  { val: "company", label: "Company", icon: Globe },
                  { val: "department", label: "Department", icon: Building2 },
                ].map(({ val, label, icon: Icon }) => (
                  <motion.button
                    key={val}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setFilterAudience(val)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium"
                    style={{
                      background:
                        filterAudience === val ? C.primary : "transparent",
                      color: filterAudience === val ? "#fff" : C.textSecondary,
                    }}
                  >
                    <Icon size={13} />
                    {label}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* ── Error ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{
                    background: C.dangerLight,
                    border: `1px solid ${C.danger}33`,
                  }}
                >
                  <AlertCircle size={15} color={C.danger} />
                  <p className="text-sm flex-1" style={{ color: C.danger }}>
                    {error}
                  </p>
                  <button
                    onClick={() => fetchAnnouncements(true)}
                    className="text-xs font-semibold flex items-center gap-1"
                    style={{ color: C.danger }}
                  >
                    <RefreshCw size={12} />
                    Retry
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Pinned ── */}
            {!loading && pinned.length > 0 && (
              <div className="space-y-3">
                <p
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: C.textMuted }}
                >
                  📌 Pinned
                </p>
                {pinned.map((ann, i) => (
                  <AnnouncementCard
                    key={ann.id}
                    ann={ann}
                    index={i}
                    onOpen={() => setSelectedAnn(ann)}
                  />
                ))}
              </div>
            )}

            {/* ── Regular ── */}
            {loading && page === 1 ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-5 border"
                    style={{ background: C.surface, borderColor: C.border }}
                  >
                    <Skeleton className="h-4 w-2/3 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                ))}
              </div>
            ) : regular.length === 0 && pinned.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20">
                <Bell size={40} color={C.textMuted} />
                <p className="font-semibold" style={{ color: C.textPrimary }}>
                  {searchQuery ? "No results found" : "No announcements yet"}
                </p>
                <p className="text-sm" style={{ color: C.textMuted }}>
                  {searchQuery
                    ? "Try a different search term"
                    : "Check back later for company updates."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {regular.length > 0 && pinned.length > 0 && (
                  <p
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: C.textMuted }}
                  >
                    Latest
                  </p>
                )}
                {regular.map((ann, i) => (
                  <AnnouncementCard
                    key={ann.id}
                    ann={ann}
                    index={i}
                    onOpen={() => setSelectedAnn(ann)}
                  />
                ))}
              </div>
            )}

            {/* ── Load more ── */}
            {!loading && meta.page < meta.totalPages && (
              <div className="flex justify-center pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                  style={{
                    background: C.surface,
                    color: C.primary,
                    border: `1px solid ${C.primary}44`,
                  }}
                >
                  Load more <ChevronDown size={14} />
                </motion.button>
              </div>
            )}

            {loading && page > 1 && (
              <div className="flex justify-center py-4">
                <Loader2 size={20} color={C.primary} className="animate-spin" />
              </div>
            )}

            <div className="h-4" />
          </main>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {selectedAnn && (
          <AnnouncementModal
            ann={selectedAnn}
            onClose={() => setSelectedAnn(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Announcement card ─── */
function AnnouncementCard({ ann, index, onOpen }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(79,70,229,0.08)" }}
      onClick={onOpen}
      className="rounded-2xl p-5 border cursor-pointer group"
      style={{
        background: C.surface,
        borderColor: ann.is_pinned ? C.warning + "66" : C.border,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {ann.is_pinned && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: C.warningLight, color: C.warning }}
              >
                📌 Pinned
              </span>
            )}
            <AudienceBadge ann={ann} />
            <span className="text-[10px]" style={{ color: C.textMuted }}>
              {ann.publish_at
                ? new Date(ann.publish_at).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : new Date(ann.created_at).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
            </span>
          </div>
          <h3
            className="font-bold text-sm mb-1"
            style={{ color: C.textPrimary }}
          >
            {ann.title}
          </h3>
          <p
            className="text-xs line-clamp-2"
            style={{ color: C.textSecondary }}
          >
            {ann.body}
          </p>
        </div>
        <motion.div
          animate={{ x: 0 }}
          whileHover={{ x: 2 }}
          className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight size={16} color={C.primary} />
        </motion.div>
      </div>
      <div className="flex items-center gap-3 mt-3">
        <span
          className="text-[10px] flex items-center gap-1"
          style={{ color: C.textMuted }}
        >
          <Eye size={10} />
          {ann.views ?? 0} views
        </span>
        {ann.posted_by && (
          <span className="text-[10px]" style={{ color: C.textMuted }}>
            By {ann.posted_by}
          </span>
        )}
        {ann.expires_at && new Date(ann.expires_at) > new Date() && (
          <span className="text-[10px]" style={{ color: C.textMuted }}>
            Expires{" "}
            {new Date(ann.expires_at).toLocaleDateString("en-NG", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </motion.div>
  );
}
