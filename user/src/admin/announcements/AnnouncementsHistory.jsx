// ─────────────────────────────────────────────────────────────
//  src/admin/announcements/AnnouncementsHistory.jsx
//  Route: /admin/announcements/history
// ─────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSideNavbar from "../AdminSideNavbar";
import {
  Megaphone,
  Bell,
  Menu,
  ChevronRight,
  Search,
  Filter,
  X,
  Check,
  Eye,
  Edit3,
  Trash2,
  RefreshCw,
  Send,
  MoreVertical,
  Calendar,
  Users,
  Building2,
  Globe,
  Clock,
  FileText,
  Zap,
  Star,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Download,
  ChevronDown,
  ChevronLeft,
  Pin,
  Hash,
  Tag,
  SlidersHorizontal,
  TrendingUp,
  ArrowUpRight,
  RotateCcw,
  Copy,
  ExternalLink,
  XCircle,
  Info,
} from "lucide-react";

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
  pink: "#EC4899",
  pinkLight: "#FDF2F8",
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
  general: {
    label: "General",
    color: C.primary,
    bg: C.primaryLight,
    icon: "📢",
  },
  urgent: { label: "Urgent", color: C.danger, bg: C.dangerLight, icon: "⚠️" },
  policy: { label: "Policy", color: C.purple, bg: C.purpleLight, icon: "📋" },
  event: { label: "Event", color: C.warning, bg: C.warningLight, icon: "🎉" },
  reminder: {
    label: "Reminder",
    color: C.accent,
    bg: C.accentLight,
    icon: "🔔",
  },
};

const STATUS_CONFIG = {
  published: { label: "Published", color: C.success, bg: C.successLight },
  draft: { label: "Draft", color: C.textMuted, bg: C.surfaceAlt },
  scheduled: { label: "Scheduled", color: C.accent, bg: C.accentLight },
  archived: { label: "Archived", color: C.warning, bg: C.warningLight },
};

/* ─── Mock announcements ─── */
const MOCK_ANNOUNCEMENTS = [
  {
    id: "ANN-001",
    emoji: "🎉",
    title: "Q1 2025 Performance Bonuses Announced",
    body: "We are pleased to announce that Q1 2025 performance bonuses have been approved by the board. All eligible employees will receive their bonuses by the end of this month. Please check your payslips in the HRIS portal for details.",
    type: "general",
    audience: "all",
    departments: [],
    status: "published",
    priority: "high",
    publishedAt: "2025-01-28T09:00:00",
    createdBy: "Ngozi Adeleke",
    views: 124,
    acks: 98,
    totalRecipients: 127,
    pinned: true,
    tags: ["bonus", "payroll"],
    scheduleDate: null,
  },
  {
    id: "ANN-002",
    emoji: "⚠️",
    title: "Mandatory Cybersecurity Training — Deadline Feb 14",
    body: "All employees must complete the mandatory cybersecurity awareness training on the learning portal by February 14th. Failure to complete will result in system access restrictions.",
    type: "urgent",
    audience: "all",
    departments: [],
    status: "published",
    priority: "high",
    publishedAt: "2025-01-22T08:30:00",
    createdBy: "Ngozi Adeleke",
    views: 119,
    acks: 87,
    totalRecipients: 127,
    pinned: false,
    tags: ["security", "training", "deadline"],
    scheduleDate: null,
  },
  {
    id: "ANN-003",
    emoji: "📋",
    title: "Updated Remote Work Policy — Effective March 1",
    body: "Following the leadership review, the remote work policy has been updated. Employees may now work remotely up to 3 days per week, subject to manager approval. The full policy document is available on the company intranet.",
    type: "policy",
    audience: "all",
    departments: [],
    status: "published",
    priority: "medium",
    publishedAt: "2025-01-18T10:00:00",
    createdBy: "Bola Adesanya",
    views: 127,
    acks: 121,
    totalRecipients: 127,
    pinned: false,
    tags: ["policy", "remote", "wfh"],
    scheduleDate: null,
  },
  {
    id: "ANN-004",
    emoji: "🎉",
    title: "Engineering All-Hands — February 7th",
    body: "The Engineering department will hold its quarterly all-hands meeting on Friday, February 7th at 2 PM WAT. Attendance is mandatory. The agenda includes roadmap updates, Q4 retrospective, and team recognitions.",
    type: "event",
    audience: "department",
    departments: ["Engineering"],
    status: "published",
    priority: "medium",
    publishedAt: "2025-01-15T11:00:00",
    createdBy: "Chioma Okafor",
    views: 34,
    acks: 32,
    totalRecipients: 38,
    pinned: false,
    tags: ["engineering", "all-hands"],
    scheduleDate: null,
  },
  {
    id: "ANN-005",
    emoji: "🔔",
    title: "Leave Application Deadline — End of Month",
    body: "Please note that all leave applications for February must be submitted and approved by January 31st. Late applications may not be approved. Use the self-service portal to apply.",
    type: "reminder",
    audience: "all",
    departments: [],
    status: "published",
    priority: "medium",
    publishedAt: "2025-01-10T09:00:00",
    createdBy: "Ngozi Adeleke",
    views: 98,
    acks: 71,
    totalRecipients: 127,
    pinned: false,
    tags: ["leave", "reminder"],
    scheduleDate: null,
  },
  {
    id: "ANN-006",
    emoji: "💡",
    title: "New Benefits Enrollment Period Open",
    body: "The annual benefits enrollment window is now open until February 28. Review your current benefits plan and make changes in the HR portal. Finance and HR teams are available for queries.",
    type: "general",
    audience: "all",
    departments: [],
    status: "draft",
    priority: "low",
    publishedAt: null,
    createdBy: "Ngozi Adeleke",
    views: 0,
    acks: 0,
    totalRecipients: 127,
    pinned: false,
    tags: ["benefits", "enrollment"],
    scheduleDate: "2025-02-03T09:00:00",
  },
  {
    id: "ANN-007",
    emoji: "📌",
    title: "Finance Team Budget Submission Reminder",
    body: "All department heads must submit their Q2 budget proposals to the Finance team by February 20th. Use the approved template available on the shared drive.",
    type: "reminder",
    audience: "department",
    departments: ["Finance", "Operations"],
    status: "scheduled",
    priority: "high",
    publishedAt: null,
    createdBy: "Ibrahim Musa",
    views: 0,
    acks: 0,
    totalRecipients: 22,
    pinned: false,
    tags: ["budget", "finance"],
    scheduleDate: "2025-02-03T08:00:00",
  },
  {
    id: "ANN-008",
    emoji: "🏆",
    title: "Employee of the Quarter — Congratulations to Emeka Okonkwo",
    body: "We are proud to recognize Emeka Okonkwo from Engineering as our Employee of the Quarter for Q4 2024! Emeka led the microservices migration with exceptional skill and mentored two junior engineers.",
    type: "general",
    audience: "all",
    departments: [],
    status: "archived",
    priority: "low",
    publishedAt: "2024-12-31T09:00:00",
    createdBy: "Bola Adesanya",
    views: 127,
    acks: 110,
    totalRecipients: 127,
    pinned: false,
    tags: ["recognition", "award"],
    scheduleDate: null,
  },
];

const DEPARTMENTS_LIST = [
  "Engineering",
  "Product",
  "Finance",
  "HR",
  "Operations",
  "Sales",
  "Marketing",
  "Legal",
];

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
const fmtTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

/* ─── Delete Modal ─── */
function DeleteModal({ ann, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    onConfirm();
  };
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
            "<strong>{ann?.title}</strong>" will be permanently deleted. This
            cannot be undone.
          </p>
          {ann?.status === "published" && (
            <div
              className="flex items-center gap-2 justify-center text-xs p-2 rounded-xl"
              style={{ background: C.warningLight, color: C.warning }}
            >
              <AlertCircle size={12} />
              Removing a published announcement affects {ann.views} views
            </div>
          )}
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handle}
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
  const tc = TYPE_CONFIG[ann.type] || TYPE_CONFIG.general;
  const sc = STATUS_CONFIG[ann.status] || STATUS_CONFIG.draft;
  const engRate =
    ann.totalRecipients > 0
      ? Math.round((ann.acks / ann.totalRecipients) * 100)
      : 0;
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
        {/* Type banner */}
        <div
          className="px-5 py-3.5 flex items-center gap-3 shrink-0"
          style={{
            background: `linear-gradient(135deg, ${tc.color}, ${tc.color}cc)`,
          }}
        >
          <span className="text-xl">{ann.emoji}</span>
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
              {fmtTime(ann.publishedAt || ann.scheduleDate)}
            </span>
            <span>·</span>
            <span>By {ann.createdBy}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              {ann.audience === "all" ? (
                <Globe size={11} />
              ) : (
                <Building2 size={11} />
              )}
              {ann.audience === "all"
                ? "All Employees"
                : ann.departments.join(", ")}
            </span>
          </div>

          <p
            className="text-sm leading-relaxed mb-5"
            style={{ color: C.textSecondary }}
          >
            {ann.body}
          </p>

          {ann.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {ann.tags.map((t) => (
                <span
                  key={t}
                  className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                  style={{ background: C.primaryLight, color: C.primary }}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          {ann.status === "published" && (
            <div
              className="grid grid-cols-3 gap-3 pt-4"
              style={{ borderTop: `1px solid ${C.border}` }}
            >
              {[
                { label: "Total Views", value: ann.views, color: C.primary },
                { label: "Acknowledged", value: ann.acks, color: C.success },
                { label: "Eng. Rate", value: `${engRate}%`, color: C.accent },
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
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Row actions menu ─── */
function RowMenu({
  ann,
  onView,
  onEdit,
  onDelete,
  onRepost,
  onArchive,
  onClose,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="absolute right-0 top-full mt-1 w-48 rounded-xl overflow-hidden z-20"
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
        { label: "Edit", icon: Edit3, action: onEdit, color: C.textSecondary },
        {
          label: "Repost",
          icon: RotateCcw,
          action: onRepost,
          color: C.primary,
        },
        {
          label: "Archive",
          icon: Download,
          action: onArchive,
          color: C.warning,
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
function AnnCard({
  ann,
  index,
  onView,
  onEdit,
  onDelete,
  onRepost,
  onArchive,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const tc = TYPE_CONFIG[ann.type] || TYPE_CONFIG.general;
  const sc = STATUS_CONFIG[ann.status] || STATUS_CONFIG.draft;
  const engRate =
    ann.totalRecipients > 0
      ? Math.round((ann.acks / ann.totalRecipients) * 100)
      : 0;
  const viewRate =
    ann.totalRecipients > 0
      ? Math.round((ann.views / ann.totalRecipients) * 100)
      : 0;

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
      {/* Top strip */}
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
          {tc.icon} {tc.label}
        </span>
        {ann.pinned && (
          <span
            className="flex items-center gap-1 text-[10px] font-bold"
            style={{ color: C.warning }}
          >
            <Pin size={10} />
            Pinned
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
                onEdit={onEdit}
                onDelete={onDelete}
                onRepost={onRepost}
                onArchive={onArchive}
                onClose={() => setMenuOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <div className="flex items-start gap-3 mb-2">
          <span className="text-xl leading-none mt-0.5 shrink-0">
            {ann.emoji}
          </span>
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-bold leading-snug mb-1 truncate"
              style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
            >
              {ann.title}
            </h3>
            <p
              className="text-xs leading-relaxed line-clamp-2"
              style={{ color: C.textSecondary }}
            >
              {ann.body}
            </p>
          </div>
        </div>

        {/* Meta row */}
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
              : ann.departments.length === 1
                ? ann.departments[0]
                : `${ann.departments.length} depts`}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {ann.status === "scheduled"
              ? `Scheduled ${fmtDate(ann.scheduleDate)}`
              : fmtDate(ann.publishedAt)}
          </span>
          <span>·</span>
          <span>By {ann.createdBy}</span>
        </div>

        {/* Tags */}
        {ann.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {ann.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: C.primaryLight, color: C.primary }}
              >
                #{tag}
              </span>
            ))}
            {ann.tags.length > 4 && (
              <span className="text-[10px]" style={{ color: C.textMuted }}>
                +{ann.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stats footer */}
      {ann.status === "published" && (
        <div
          className="flex items-center gap-0 px-5 py-3"
          style={{ borderTop: `1px solid ${C.border}` }}
        >
          {[
            {
              label: "Views",
              value: ann.views,
              pct: viewRate,
              color: C.primary,
            },
            {
              label: "Acknowledged",
              value: ann.acks,
              pct: engRate,
              color: C.success,
            },
            {
              label: "Recipients",
              value: ann.totalRecipients,
              pct: 100,
              color: C.accent,
            },
          ].map((s, i) => (
            <div
              key={s.label}
              className="flex-1 px-3 text-center"
              style={{ borderLeft: i > 0 ? `1px solid ${C.border}` : "none" }}
            >
              <p
                className="text-sm font-bold"
                style={{ color: s.color, fontFamily: "Sora, sans-serif" }}
              >
                {s.value}
              </p>
              <p className="text-[10px]" style={{ color: C.textMuted }}>
                {s.label}
              </p>
              <div
                className="mt-1 h-1 rounded-full"
                style={{ background: C.border }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${s.pct}%`, background: s.color }}
                />
              </div>
            </div>
          ))}
          <button
            onClick={onView}
            className="ml-3 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: C.primaryLight, color: C.primary }}
          >
            <Eye size={11} />
            View
          </button>
        </div>
      )}
      {ann.status !== "published" && (
        <div
          className="flex items-center gap-3 px-5 py-3"
          style={{ borderTop: `1px solid ${C.border}` }}
        >
          {ann.status === "draft" && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: C.primaryLight, color: C.primary }}
            >
              <Edit3 size={11} />
              Continue Editing
            </button>
          )}
          {ann.status === "scheduled" && (
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: C.accent }}
            >
              <Clock size={11} />
              Publishes {fmtTime(ann.scheduleDate)}
            </span>
          )}
          {ann.status === "archived" && (
            <button
              onClick={onRepost}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: C.warningLight, color: C.warning }}
            >
              <RotateCcw size={11} />
              Repost
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════ */
export default function AnnouncementsHistory() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [announcements, setAnnouncements] = useState(MOCK_ANNOUNCEMENTS);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [view, setView] = useState("card"); // "card" | "table"
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    let items = [...announcements];
    if (search)
      items = items.filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.body.toLowerCase().includes(search.toLowerCase()) ||
          a.tags.some((t) => t.includes(search.toLowerCase())),
      );
    if (filterType !== "all")
      items = items.filter((a) => a.type === filterType);
    if (filterStatus !== "all")
      items = items.filter((a) => a.status === filterStatus);
    if (filterDept !== "all")
      items = items.filter(
        (a) => a.audience === "all" || a.departments.includes(filterDept),
      );
    if (sortBy === "newest")
      items.sort(
        (a, b) =>
          new Date(b.publishedAt || b.scheduleDate || 0) -
          new Date(a.publishedAt || a.scheduleDate || 0),
      );
    if (sortBy === "oldest")
      items.sort(
        (a, b) =>
          new Date(a.publishedAt || a.scheduleDate || 0) -
          new Date(b.publishedAt || b.scheduleDate || 0),
      );
    if (sortBy === "mostViewed") items.sort((a, b) => b.views - a.views);
    // Pinned first
    items.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    return items;
  }, [announcements, search, filterType, filterStatus, filterDept, sortBy]);

  const handleDelete = (id) => {
    setAnnouncements((p) => p.filter((a) => a.id !== id));
    setDeleteModal(null);
    showToast("Announcement deleted");
  };

  const handleRepost = (id) => {
    setAnnouncements((p) =>
      p.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "published",
              publishedAt: new Date().toISOString(),
              views: 0,
              acks: 0,
            }
          : a,
      ),
    );
    showToast("Announcement reposted successfully");
  };

  const handleArchive = (id) => {
    setAnnouncements((p) =>
      p.map((a) => (a.id === id ? { ...a, status: "archived" } : a)),
    );
    showToast("Announcement archived");
  };

  const counts = useMemo(
    () => ({
      total: announcements.length,
      published: announcements.filter((a) => a.status === "published").length,
      draft: announcements.filter((a) => a.status === "draft").length,
      scheduled: announcements.filter((a) => a.status === "scheduled").length,
      totalViews: announcements.reduce((s, a) => s + a.views, 0),
    }),
    [announcements],
  );

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: C.bg, fontFamily: "Sora, sans-serif" }}
    >
      <AdminSideNavbar
        sidebarOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        ADMIN={ADMIN}
      />

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
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
          >
            <Menu size={18} color={C.textSecondary} />
          </button>
          <div
            className="flex items-center gap-1.5 text-xs"
            style={{ color: C.textMuted }}
          >
            <span>Announcements</span>
            <ChevronRight size={12} />
            <span style={{ color: C.primary, fontWeight: 600 }}>History</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <Bell size={16} color={C.textSecondary} />
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ background: C.danger }}
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
                    {counts.total} total announcements
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
                <Megaphone size={14} />
                New Announcement
              </motion.a>
            </motion.div>

            {/* Summary stats */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                {
                  label: "Published",
                  value: counts.published,
                  color: C.success,
                  bg: C.successLight,
                  icon: CheckCircle2,
                },
                {
                  label: "Drafts",
                  value: counts.draft,
                  color: C.textMuted,
                  bg: C.surfaceAlt,
                  icon: FileText,
                },
                {
                  label: "Scheduled",
                  value: counts.scheduled,
                  color: C.accent,
                  bg: C.accentLight,
                  icon: Clock,
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

            {/* Filters toolbar */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {/* Search */}
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

              {/* Type filter */}
              <div
                className="flex items-center gap-1.5 overflow-x-auto"
                style={{ scrollbarWidth: "none" }}
              >
                {["all", ...Object.keys(TYPE_CONFIG)].map((t) => {
                  const cfg = TYPE_CONFIG[t];
                  return (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all capitalize"
                      style={{
                        background:
                          filterType === t
                            ? cfg?.color || C.primary
                            : C.surface,
                        color: filterType === t ? "#fff" : C.textSecondary,
                        border: `1px solid ${filterType === t ? "transparent" : C.border}`,
                      }}
                    >
                      {t === "all" ? "All Types" : `${cfg.icon} ${cfg.label}`}
                    </button>
                  );
                })}
              </div>

              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none px-3 py-2.5 rounded-xl text-xs font-semibold outline-none"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  color: C.textSecondary,
                }}
              >
                <option value="all">All Status</option>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>

              {/* Sort */}
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

            {/* Loading skeletons */}
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
                        className="h-3 rounded-lg w-full"
                        style={{ background: C.surfaceAlt }}
                      />
                      <div
                        className="h-3 rounded-lg w-2/3"
                        style={{ background: C.surfaceAlt }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              /* Empty state */
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
                  No announcements yet
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
              <div className="grid grid-cols-2 gap-4">
                {filtered.map((ann, i) => (
                  <AnnCard
                    key={ann.id}
                    ann={ann}
                    index={i}
                    onView={() => setViewModal(ann)}
                    onEdit={() => {}}
                    onDelete={() => setDeleteModal(ann)}
                    onRepost={() => handleRepost(ann.id)}
                    onArchive={() => handleArchive(ann.id)}
                  />
                ))}
              </div>
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
            onConfirm={() => handleDelete(deleteModal.id)}
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
            <CheckCircle2 size={15} color={C.success} />
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
