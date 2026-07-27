


// src/employee/announcements/AnnouncementsFeed.jsx
// Route: /announcements  (employee-facing)
// Layout: matches AttendancePage — full-screen flex shell, sticky top nav, scrollable main.

import { useState, useEffect, useCallback } from "react";
import C from "../styles/colors";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Eye,
  Globe,
  Megaphone,
  Menu,
  PartyPopper,
  Pin,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import {
  getAnnouncementFeed,
  recordAnnouncementView,
} from "../api/service/announcementApi";
import { useAuth } from "../components/useAuth";

/* ─── Design tokens ─── */

const TYPE_CONFIG = {
  general: { label: "General", color: C.primary,  bg: C.primaryLight,  icon: Megaphone },
  urgent:  { label: "Urgent",  color: C.danger,   bg: C.dangerLight,   icon: AlertTriangle },
  policy:  { label: "Policy",  color: C.purple,   bg: C.purpleLight,   icon: ClipboardList },
  event:   { label: "Event",   color: C.warning,  bg: C.warningLight,  icon: PartyPopper },
  reminder:{ label: "Reminder",color: C.accent,   bg: C.accentLight,   icon: Bell },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "—";

/* ─── Detail Slide-over ─── */
function AnnouncementDetail({ ann, onClose }) {
  if (!ann) return null;
  const tc = TYPE_CONFIG[ann.type || "general"] || TYPE_CONFIG.general;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative h-full w-full max-w-xl flex flex-col"
        style={{ background: C.bg, boxShadow: C.shadow.card }}
      >
        {/* Banner */}
        <div
          className="px-6 py-4 flex items-center gap-3 shrink-0"
          style={{ background: `linear-gradient(135deg, ${tc.color}, ${tc.color}cc)` }}
        >
          <tc.icon size={20} />
          <span className="text-sm font-bold text-white uppercase tracking-wide">
            {tc.label}
          </span>
          {ann.isPinned && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-white/80 bg-white/20 px-2 py-0.5 rounded-full ml-1">
              <Pin size={9} /> Pinned
            </span>
          )}
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <X size={14} color="#fff" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div
            className="rounded-2xl overflow-hidden mb-4"
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              boxShadow: C.shadow.card,
            }}
          >
            <div className="p-6">
              <h2
                className="text-xl mb-3 leading-snug"
                style={{ color: C.textPrimary }}
              >
                {ann.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mb-5 text-xs" style={{ color: C.textMuted }}>
                <span className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-[9px] font-bold text-white">
                    {(ann.postedBy || ann.createdByName || "HR").split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  {ann.postedBy || ann.createdByName || "HR Team"}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {fmtDate(ann.publishAt || ann.createdAt)}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  {ann.audience === "all" ? <Globe size={11} /> : <Building2 size={11} />}
                  {ann.audience === "all" ? "All Employees" : ann.departmentName || "Your Department"}
                </span>
              </div>
              <div
                className="text-sm leading-[1.85] prose prose-sm max-w-none"
                style={{ color: C.textSecondary }}
                dangerouslySetInnerHTML={{ __html: ann.body }}
              />
            </div>
          </div>

          <div
            className="rounded-xl p-4 flex items-center gap-4"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
          >
            <div className="flex items-center gap-2 text-xs" style={{ color: C.textMuted }}>
              <Eye size={13} color={C.primary} />
              <span className="font-bold" style={{ color: C.primary }}>{ann.views ?? 0}</span>
              people viewed this
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Announcement Card ─── */
function AnnCard({ ann, index, onOpen, viewed }) {
  const tc = TYPE_CONFIG[ann.type || "general"] || TYPE_CONFIG.general;

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      onClick={onOpen}
      className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5"
      style={{
        background: C.surface,
        border: `2px solid ${viewed ? C.border : tc.color + "44"}`,
        boxShadow: ann.isPinned ? `0 4px 20px ${tc.color}22` : "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* Top strip */}
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{
          background: viewed ? C.surfaceAlt : tc.bg + "88",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: tc.bg, color: tc.color }}
        >
          <tc.icon size={14} /> {tc.label}
        </span>
        {ann.isPinned && (
          <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: C.warning }}>
            <Pin size={9} /> Pinned
          </span>
        )}
        {!viewed && (
          <span
            className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: tc.color, color: "#fff" }}
          >
            NEW
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <h3
          className="text-sm leading-snug mb-2"
          style={{ color: C.textPrimary }}
        >
          {ann.title}
        </h3>
        <p
          className="text-xs leading-relaxed line-clamp-3"
          style={{ color: C.textSecondary }}
          dangerouslySetInnerHTML={{ __html: ann.body?.replace(/<[^>]+>/g, " ") || "" }}
        />
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3 text-[11px]" style={{ color: C.textMuted }}>
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {fmtDate(ann.publishAt || ann.createdAt)}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              {ann.audience === "all" ? <Globe size={10} /> : <Building2 size={10} />}
              {ann.audience === "all" ? "Everyone" : ann.departmentName || "Your Dept."}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: tc.color }}>
            Read more <ChevronRight size={11} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Skeleton ─── */
function Skeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden animate-pulse"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}
        >
          <div className="h-10 m-4 rounded-xl" style={{ background: C.surfaceAlt }} />
          <div className="px-4 pb-4 space-y-2">
            <div className="h-4 rounded-lg w-4/5" style={{ background: C.surfaceAlt }} />
            <div className="h-3 rounded-lg" style={{ background: C.surfaceAlt }} />
            <div className="h-3 rounded-lg w-3/4" style={{ background: C.surfaceAlt }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════ MAIN ═══════════════════════════════════ */
export default function AnnouncementsFeed() {
  const { employee } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [viewed, setViewed] = useState(new Set());
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [filterType, setFilterType] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAnnouncementFeed({ page, limit: 12 });
      setAnnouncements(res.data || []);
      setMeta(res.meta || { total: 0, totalPages: 1 });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleOpen = async (ann) => {
    setSelected(ann);
    if (!viewed.has(ann.id)) {
      setViewed((p) => new Set([...p, ann.id]));
      try { await recordAnnouncementView(ann.id); } catch (_) {}
      setAnnouncements((p) =>
        p.map((a) => a.id === ann.id ? { ...a, views: (a.views ?? 0) + 1 } : a),
      );
    }
  };

  const filtered = announcements.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      a.title?.toLowerCase().includes(q) ||
      a.body?.replace(/<[^>]+>/g, "").toLowerCase().includes(q);
    const matchType = filterType === "all" || (a.type || "general") === filterType;
    return matchSearch && matchType;
  });

  const pinned  = filtered.filter((a) =>  a.isPinned);
  const regular = filtered.filter((a) => !a.isPinned);

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: C.bg, color: C.textPrimary }}
    >
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar injected by parent router/shell */}

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
              className="p-2 rounded-full hidden md:flex"
              style={{ background: C.surface, border: `1px solid ${C.border}`, cursor: "pointer" }}
            >
              <Menu size={16} color={C.textSecondary} />
            </motion.button>

            {/* Search */}
            <div className="flex-1 max-w-xs relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" color={C.textMuted} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search announcements…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{
                  background: C.surface,
                  border: `1.5px solid ${search ? C.primary + "66" : C.border}`,
                  color: C.textPrimary,
                }}
              />
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 ml-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchFeed}
                className="p-2 rounded-full"
                style={{ background: C.surface, border: `1px solid ${C.border}`, cursor: "pointer" }}
                title="Refresh"
              >
                <RefreshCw size={14} color={C.textMuted} className={loading ? "animate-spin" : ""} />
              </motion.button>
              <button className="relative p-2 rounded-full" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <Bell size={15} color={C.textSecondary} />
              </button>
              {employee?.avatar ? (
                <img src={employee.avatar} alt={employee.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: "linear-gradient(135deg,#6366F1,#4338CA)" }}
                >
                  {employee?.initials ?? "?"}
                </div>
              )}
            </div>
          </header>

          {/* ── SCROLLABLE MAIN ── */}
          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">

            {/* ── HERO ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: C.gradient.hero,
                minHeight: 130,
              }}
            >
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/15">
                    <Megaphone size={22} color="white" />
                  </div>
                  <div>
                    <h1 className="text-white text-2xl ">
                      Announcements
                    </h1>
                    <p className="text-indigo-200 text-sm">
                      Stay up to date with what's happening across the company
                    </p>
                  </div>
                </div>
                {/* live chips */}
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10">
                    <Megaphone size={12} color="rgba(255,255,255,0.7)" />
                    <span className="text-white/80 text-xs">
                      <strong className="text-white">{meta.total}</strong> total
                    </span>
                  </div>
                  {pinned.length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10">
                      <Pin size={12} color="rgba(255,255,255,0.7)" />
                      <span className="text-white/80 text-xs">
                        <strong className="text-white">{pinned.length}</strong> pinned
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* ── ERROR ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: C.dangerLight, border: `1px solid ${C.danger}33` }}
                >
                  <AlertCircle size={15} color={C.danger} />
                  <span className="text-sm flex-1" style={{ color: C.danger }}>{error}</span>
                  <button onClick={fetchFeed} className="text-xs font-semibold" style={{ color: C.danger }}>
                    Retry
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── TYPE FILTER CHIPS ── */}
            <div className="flex items-center gap-2 flex-wrap">
              {["all", ...Object.keys(TYPE_CONFIG)].map((t) => {
                const cfg = TYPE_CONFIG[t];
                return (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className="px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all capitalize"
                    style={{
                      background: filterType === t ? cfg?.color || C.primary : C.surface,
                      color: filterType === t ? "#fff" : C.textSecondary,
                      border: `1px solid ${filterType === t ? "transparent" : C.border}`,
                    }}
                  >
                    {t === "all" ? "All" : `${cfg.label}`}
                  </button>
                );
              })}
              <span className="text-xs ml-auto" style={{ color: C.textMuted }}>
                {filtered.length} announcement{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* ── CONTENT ── */}
            {loading ? (
              <Skeleton />
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-32 text-center"
              >
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{ background: C.surfaceAlt }}>
                  <Megaphone size={32} color={C.textMuted} />
                </div>
                <p className="text-base font-bold mb-1" style={{ color: C.textPrimary }}>No announcements</p>
                <p className="text-sm" style={{ color: C.textMuted }}>
                  {search ? "No results match your search." : "Nothing to show right now. Check back later."}
                </p>
                {search && (
                  <button onClick={() => setSearch("")} className="mt-3 text-sm font-semibold" style={{ color: C.primary }}>
                    Clear search
                  </button>
                )}
              </motion.div>
            ) : (
              <>
                {/* Pinned */}
                {pinned.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Pin size={13} color={C.warning} />
                      <span className="text-xs font-bold uppercase tracking-wide" style={{ color: C.warning }}>
                        Pinned
                      </span>
                    </div>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {pinned.map((ann, i) => (
                        <AnnCard key={ann.id} ann={ann} index={i} onOpen={() => handleOpen(ann)} viewed={viewed.has(ann.id)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Regular */}
                {regular.length > 0 && (
                  <div>
                    {pinned.length > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: C.textMuted }}>Recent</span>
                      </div>
                    )}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {regular.map((ann, i) => (
                        <AnnCard key={ann.id} ann={ann} index={i} onOpen={() => handleOpen(ann)} viewed={viewed.has(ann.id)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold disabled:opacity-40 transition-all"
                      style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textSecondary }}
                    >
                      <ChevronLeft size={13} /> Previous
                    </button>
                    <span className="text-xs px-3" style={{ color: C.textMuted }}>
                      {page} / {meta.totalPages}
                    </span>
                    <button
                      disabled={page >= meta.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="flex items-center gap-1 px-4 py-2 rounded-full text-xs font-semibold disabled:opacity-40 transition-all"
                      style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textSecondary }}
                    >
                      Next <ChevronRight size={13} />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* ── DETAIL SLIDE-OVER ── */}
      <AnimatePresence>
        {selected && <AnnouncementDetail ann={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}