// ─────────────────────────────────────────────────────────────
//  src/admin/announcements/AnnouncementsHistory.jsx
//  Route: /admin/announcements/history
//  Connected to: announcementApi.list(), .remove(), .update()
// ─────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Bell,
  Menu,
  ChevronRight,
  Search,
  X,
  Eye,
  Edit3,
  Trash2,
  RefreshCw,
  MoreVertical,
  Calendar,
  Building2,
  Globe,
  Clock,
  FileText,
  Zap,
  Star,
  CheckCircle2,
  AlertCircle,
  Download,
  Pin,
  RotateCcw,
  ChevronDown,
  TriangleAlert,
  Scale,
  CalendarSearch,
  BellRing,
} from "lucide-react";
import { announcementApi } from "../../api/service/announcementApi";

const C = {
  bg: "#F0F2F8",
  bgMid: "#E8EBF4",
  surface: "#FFFFFF",
  surfaceHover: "#F7F8FC",
  surfaceAlt: "#F7F8FC",
  border: "#E4E7F0",
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  primaryDark: "#3730A3",
  accent: "#06B6D4",
  accentLight: "#ECFEFF",
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  purple: "#8B5CF6",
  purpleLight: "#EDE9FE",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  navy: "#1E1B4B",
};

const ADMIN = {
  name: "Ngozi Adeleke",
  initials: "NA",
  role: "HR Administrator",
};

const TYPE_CONFIG = {
  general: { label: "General", color: C.primary,  bg: C.primaryLight,  icon: Megaphone },
  urgent:  { label: "Urgent",  color: C.danger,   bg: C.dangerLight,   icon: TriangleAlert },
  policy:  { label: "Policy",  color: C.purple,   bg: C.purpleLight,   icon: Scale },
  event:   { label: "Event",   color: C.warning,  bg: C.warningLight,  icon: CalendarSearch },
  reminder:{ label: "Reminder",color: C.accent,   bg: C.accentLight,   icon: BellRing },
};

// Map DB audience values to display status labels
// The backend `status` concept is derived from publish_at / expires_at.
// We display audience as audience and compute status from dates.
const STATUS_CONFIG = {
  active: { label: "Active", color: C.success, bg: C.successLight },
  scheduled: { label: "Scheduled", color: C.accent, bg: C.accentLight },
  expired: { label: "Expired", color: C.warning, bg: C.warningLight },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

/** Derive a status string from the normalised announcement object */
function deriveStatus(ann) {
  const now = new Date();
  const publishAt = ann.publishAt ? new Date(ann.publishAt) : null;
  const expiresAt = ann.expiresAt ? new Date(ann.expiresAt) : null;
  if (publishAt && publishAt > now) return "scheduled";
  if (expiresAt && expiresAt <= now) return "expired";
  return "active";
}

/* ─── Delete Modal ─── */
function DeleteModal({ ann, onConfirm, onCancel, loading }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(15,23,42,0.6)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onCancel}
      />
      <motion.div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        initial={{ scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
        }}
      >
        <div className="p-6 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: C.dangerLight }}
          >
            <Trash2 size={24} color={C.danger} />
          </div>
          <h3
            className="text-base font-bold mb-1"
            style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
          >
            Delete Announcement?
          </h3>
          <p className="text-sm mb-2" style={{ color: C.textSecondary }}>
            "<strong>{ann?.title}</strong>" will be permanently deleted.
          </p>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{
              background: C.danger,
              boxShadow: `0 4px 12px ${C.danger}44`,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
            {loading ? "Deleting..." : "Delete"}
          </motion.button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: C.surfaceAlt,
              color: C.textSecondary,
              border: `1px solid ${C.border}`,
            }}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── View Modal ─── */
function ViewModal({ ann, onClose }) {
  if (!ann) return null;
  const tc = TYPE_CONFIG[ann.type || "general"] || TYPE_CONFIG.general;
  const TypeIcon = tc?.icon || null;
  const status = deriveStatus(ann);
  const sc = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  const engRate = ann.views > 0 ? Math.round((ann.views / ann.views) * 100) : 0; // placeholder; extend with real ack data

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(15,23,42,0.6)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-xl rounded-2xl overflow-hidden"
        initial={{ scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="px-5 py-3.5 flex items-center gap-3 shrink-0"
          style={{
            background: `linear-gradient(135deg, ${tc.color}, ${tc.color}cc)`,
          }}
        >
          <span className="text-xl">
            {TypeIcon ? <TypeIcon size={20} /> : null}
          </span>
          <span className="text-sm font-bold text-white">{tc.label}</span>
          <span
            className="ml-auto text-[11px] font-bold text-white/70 px-2 py-0.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            {sc.label}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <X size={14} color="#fff" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <h2
            className="text-lg font-bold mb-2"
            style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
          >
            {ann.title}
          </h2>
          <div
            className="flex flex-wrap items-center gap-3 mb-4 text-xs"
            style={{ color: C.textMuted }}
          >
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {fmtDateTime(ann.publishAt || ann.createdAt)}
            </span>
            <span>·</span>
            <span>By {ann.createdByName || ann.postedBy || "—"}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              {ann.audience === "all" ? (
                <Globe size={11} />
              ) : (
                <Building2 size={11} />
              )}
              {ann.audience === "all"
                ? "All Employees"
                : ann.departmentName || "Dept."}
            </span>
          </div>
          <div
            className="text-sm leading-relaxed mb-5"
            style={{ color: C.textSecondary }}
            dangerouslySetInnerHTML={{ __html: ann.body }}
          />
          <div
            className="grid grid-cols-2 gap-3 pt-4"
            style={{ borderTop: `1px solid ${C.border}` }}
          >
            {[
              { label: "Total Views", value: ann.views ?? 0, color: C.primary },
              {
                label: "Audience",
                value: ann.audience === "all" ? "Company-wide" : "Department",
                color: C.accent,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="text-center rounded-xl p-3"
                style={{ background: C.surfaceAlt }}
              >
                <p
                  className="text-xl font-bold"
                  style={{ color: s.color, fontFamily: "Sora, sans-serif" }}
                >
                  {s.value}
                </p>
                <p
                  className="text-[10px] font-semibold mt-0.5"
                  style={{ color: C.textMuted }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Row actions menu ─── */
function RowMenu({ ann, onView, onDelete, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="absolute right-0 top-full mt-1 w-44 rounded-xl overflow-hidden z-20"
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      }}
    >
      {[
        {
          label: "View Details",
          icon: Eye,
          action: onView,
          color: C.textSecondary,
        },
        null,
        { label: "Delete", icon: Trash2, action: onDelete, color: C.danger },
      ].map((item, i) =>
        item === null ? (
          <div key={i} style={{ height: 1, background: C.border }} />
        ) : (
          <button
            key={item.label}
            onClick={() => {
              item.action();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left"
            style={{ color: item.color }}
          >
            <item.icon size={13} />
            {item.label}
          </button>
        ),
      )}
    </motion.div>
  );
}

/* ─── Announcement card ─── */
function AnnCard({ ann, index, onView, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const tc = TYPE_CONFIG[ann.type || "general"] || TYPE_CONFIG.general;
  const TypeIcon = tc?.icon || null;
  const status = deriveStatus(ann);
  const sc = STATUS_CONFIG[status] || STATUS_CONFIG.active;

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
      {/* Strip */}
      <div
        className="flex items-center gap-3 px-5 py-3"
        style={{
          background: C.surfaceAlt,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <span
          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
          style={{ background: tc.bg, color: tc.color }}
        >
          <span className="inline-flex items-center gap-1.5">
            {TypeIcon ? <TypeIcon size={10} /> : null}
            {tc.label}
          </span>
        </span>
        {ann.isPinned && (
          <span
            className="flex items-center gap-1 text-[10px] font-bold"
            style={{ color: C.warning }}
          >
            <Pin size={10} /> Pinned
          </span>
        )}
        <span
          className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: sc.bg, color: sc.color }}
        >
          {sc.label}
        </span>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="p-1.5 rounded-lg hover:bg-white transition-colors"
          >
            <MoreVertical size={14} color={C.textMuted} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <RowMenu
                ann={ann}
                onView={onView}
                onDelete={onDelete}
                onClose={() => setMenuOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <h3
          className="text-sm font-bold leading-snug mb-1 truncate"
          style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
        >
          {ann.title}
        </h3>
        <p
          className="text-xs leading-relaxed line-clamp-2"
          style={{ color: C.textSecondary }}
          dangerouslySetInnerHTML={{
            __html: ann.body?.replace(/<[^>]+>/g, " ") || "",
          }}
        />
        <div
          className="flex items-center gap-3 mt-3 text-[11px]"
          style={{ color: C.textMuted }}
        >
          <span className="flex items-center gap-1">
            {ann.audience === "all" ? (
              <Globe size={10} />
            ) : (
              <Building2 size={10} />
            )}
            {ann.audience === "all"
              ? "All Employees"
              : ann.departmentName || "Dept."}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {status === "scheduled"
              ? `Scheduled ${fmtDate(ann.publishAt)}`
              : fmtDate(ann.publishAt || ann.createdAt)}
          </span>
          <span>·</span>
          <span>By {ann.createdByName || "—"}</span>
        </div>
      </div>

      {/* Stats footer */}
      <div
        className="flex items-center gap-4 px-5 py-3"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        <div
          className="flex items-center gap-1.5 text-xs"
          style={{ color: C.primary }}
        >
          <Eye size={12} />
          <span className="font-bold">{ann.views ?? 0}</span>
          <span style={{ color: C.textMuted }}>views</span>
        </div>
        <button
          onClick={onView}
          className="ml-auto flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: C.primaryLight, color: C.primary }}
        >
          <Eye size={11} /> View
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════ */
export default function AnnouncementsHistory() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewModal, setViewModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 20 };
      if (filterStatus !== "all") params.status = filterStatus;
      const res = await announcementApi.list(params);
      setAnnouncements(res.data || []);
      setMeta(res.meta || { total: 0, totalPages: 1 });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await announcementApi.remove(deleteModal.id);
      setAnnouncements((p) => p.filter((a) => a.id !== deleteModal.id));
      setDeleteModal(null);
      showToast("Announcement deleted");
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to delete.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    let items = [...announcements];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.body
            ?.replace(/<[^>]+>/g, "")
            .toLowerCase()
            .includes(q),
      );
    }
    if (sortBy === "newest")
      items.sort(
        (a, b) =>
          new Date(b.publishAt || b.createdAt || 0) -
          new Date(a.publishAt || a.createdAt || 0),
      );
    if (sortBy === "oldest")
      items.sort(
        (a, b) =>
          new Date(a.publishAt || a.createdAt || 0) -
          new Date(b.publishAt || b.createdAt || 0),
      );
    if (sortBy === "mostViewed")
      items.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    items.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    return items;
  }, [announcements, search, sortBy]);

  const counts = useMemo(
    () => ({
      total: announcements.length,
      active: announcements.filter((a) => deriveStatus(a) === "active").length,
      scheduled: announcements.filter((a) => deriveStatus(a) === "scheduled")
        .length,
      expired: announcements.filter((a) => deriveStatus(a) === "expired")
        .length,
      totalViews: announcements.reduce((s, a) => s + (a.views ?? 0), 0),
    }),
    [announcements],
  );

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: C.bg, fontFamily: "Sora, sans-serif" }}
    >
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="h-14 flex items-center px-5 gap-4 shrink-0"
          style={{
            background: C.surface,
            borderBottom: `1px solid ${C.border}`,
            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div
            className="flex items-center gap-1.5 text-xs"
            style={{ color: C.textMuted }}
          >
            <span>Announcements</span>
            <ChevronRight size={12} />
            <span style={{ color: C.primary, fontWeight: 600 }}>History</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={fetchAnnouncements}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw
                size={15}
                color={C.textSecondary}
                className={loading ? "animate-spin" : ""}
              />
            </button>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg,#6366F1,#06B6D4)" }}
            >
              {ADMIN.initials}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <main className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex items-center justify-between mb-5"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
                    boxShadow: `0 4px 16px ${C.primary}44`,
                  }}
                >
                  <FileText size={18} color="#fff" />
                </div>
                <div>
                  <h1
                    className="text-xl font-bold"
                    style={{
                      color: C.textPrimary,
                      fontFamily: "Sora, sans-serif",
                    }}
                  >
                    Announcements History
                  </h1>
                  <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                    {meta.total} total
                  </p>
                </div>
              </div>
              <motion.a
                href="/admin/announcements/create"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{
                  background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
                  boxShadow: `0 4px 16px ${C.primary}44`,
                }}
              >
                <Megaphone size={14} /> New Announcement
              </motion.a>
            </motion.div>

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
                  style={{
                    background: C.dangerLight,
                    border: `1px solid ${C.danger}33`,
                  }}
                >
                  <AlertCircle size={15} color={C.danger} />
                  <span className="text-sm" style={{ color: C.danger }}>
                    {error}
                  </span>
                  <button onClick={() => setError(null)} className="ml-auto">
                    <X size={13} color={C.danger} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Summary stats */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                {
                  label: "Active",
                  value: counts.active,
                  color: C.success,
                  bg: C.successLight,
                  icon: CheckCircle2,
                },
                {
                  label: "Scheduled",
                  value: counts.scheduled,
                  color: C.accent,
                  bg: C.accentLight,
                  icon: Clock,
                },
                {
                  label: "Expired",
                  value: counts.expired,
                  color: C.warning,
                  bg: C.warningLight,
                  icon: AlertCircle,
                },
                {
                  label: "Total Views",
                  value: counts.totalViews.toLocaleString(),
                  color: C.primary,
                  bg: C.primaryLight,
                  icon: Eye,
                },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="rounded-2xl p-4 flex items-center gap-3"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: s.bg }}
                  >
                    <s.icon size={16} color={s.color} />
                  </div>
                  <div>
                    <p
                      className="text-xl font-bold"
                      style={{ color: s.color, fontFamily: "Sora, sans-serif" }}
                    >
                      {s.value}
                    </p>
                    <p className="text-[11px]" style={{ color: C.textMuted }}>
                      {s.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-56 max-w-72">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  color={C.textMuted}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search announcements..."
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: C.surface,
                    border: `1.5px solid ${search ? C.primary + "66" : C.border}`,
                    color: C.textPrimary,
                  }}
                />
              </div>
              {["all", "active", "scheduled", "expired"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setFilterStatus(s);
                    setPage(1);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                  style={{
                    background: filterStatus === s ? C.primary : C.surface,
                    color: filterStatus === s ? "#fff" : C.textSecondary,
                    border: `1px solid ${filterStatus === s ? "transparent" : C.border}`,
                  }}
                >
                  {s === "all" ? "All Status" : s}
                </button>
              ))}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-3 py-2.5 rounded-xl text-xs font-semibold outline-none"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  color: C.textSecondary,
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="mostViewed">Most Viewed</option>
              </select>
              <span className="text-xs ml-auto" style={{ color: C.textMuted }}>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Content */}
            {loading ? (
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl overflow-hidden animate-pulse"
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <div
                      className="h-10 m-4 rounded-xl"
                      style={{ background: C.surfaceAlt }}
                    />
                    <div className="px-4 pb-4 space-y-2">
                      <div
                        className="h-4 rounded-lg w-3/4"
                        style={{ background: C.surfaceAlt }}
                      />
                      <div
                        className="h-3 rounded-lg"
                        style={{ background: C.surfaceAlt }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: C.surfaceAlt }}
                >
                  <Megaphone size={32} color={C.textMuted} />
                </div>
                <p
                  className="text-base font-bold mb-1"
                  style={{ color: C.textPrimary }}
                >
                  No announcements found
                </p>
                <p className="text-sm mb-4" style={{ color: C.textMuted }}>
                  {search
                    ? "No results match your search."
                    : "Create your first announcement to get started."}
                </p>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-sm font-semibold"
                    style={{ color: C.primary }}
                  >
                    Clear search
                  </button>
                )}
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {filtered.map((ann, i) => (
                    <AnnCard
                      key={ann.id}
                      ann={ann}
                      index={i}
                      onView={() => setViewModal(ann)}
                      onDelete={() => setDeleteModal(ann)}
                    />
                  ))}
                </div>
                {/* Pagination */}
                {meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold disabled:opacity-40"
                      style={{
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        color: C.textSecondary,
                      }}
                    >
                      Previous
                    </button>
                    <span className="text-xs" style={{ color: C.textMuted }}>
                      Page {page} of {meta.totalPages}
                    </span>
                    <button
                      disabled={page >= meta.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold disabled:opacity-40"
                      style={{
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        color: C.textSecondary,
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {viewModal && (
          <ViewModal ann={viewModal} onClose={() => setViewModal(null)} />
        )}
        {deleteModal && (
          <DeleteModal
            ann={deleteModal}
            loading={deleting}
            onConfirm={handleDelete}
            onCancel={() => setDeleteModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl z-50"
            style={{
              background: C.navy,
              color: "#fff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              minWidth: 300,
            }}
          >
            {toast.type === "error" ? (
              <AlertCircle size={15} color={C.danger} />
            ) : (
              <CheckCircle2 size={15} color={C.success} />
            )}
            <span className="text-sm font-medium">{toast.msg}</span>
            <button onClick={() => setToast(null)} className="ml-auto">
              <X size={13} color="rgba(255,255,255,0.5)" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
