// ─────────────────────────────────────────────────────────────
//  src/admin/announcements/AnnouncementsCreate.jsx
//  Route: /admin/announcements/create
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSideNavbar from "../AdminSideNavbar";
import {
  Megaphone,
  Bell,
  Menu,
  ChevronRight,
  X,
  Check,
  Eye,
  EyeOff,
  Calendar,
  Users,
  Building2,
  Globe,
  Clock,
  Send,
  Save,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Image,
  Smile,
  Type,
  Hash,
  ChevronDown,
  Tag,
  Zap,
  Star,
  Info,
  FileText,
  Pin,
  Target,
  Layers,
  Sparkles,
  ArrowRight,
  Lock,
} from "lucide-react";

/* ─── Design tokens ─── */
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

const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Finance",
  "HR",
  "Operations",
  "Sales",
  "Marketing",
  "Legal",
];

const ANNOUNCEMENT_TYPES = [
  {
    id: "general",
    label: "General",
    icon: Megaphone,
    color: C.primary,
    bg: C.primaryLight,
    desc: "Company-wide updates",
  },
  {
    id: "urgent",
    label: "Urgent",
    icon: Zap,
    color: C.danger,
    bg: C.dangerLight,
    desc: "Requires immediate attention",
  },
  {
    id: "policy",
    label: "Policy",
    icon: FileText,
    color: C.purple,
    bg: C.purpleLight,
    desc: "Policy changes & updates",
  },
  {
    id: "event",
    label: "Event",
    icon: Star,
    color: C.warning,
    bg: C.warningLight,
    desc: "Company events & activities",
  },
  {
    id: "reminder",
    label: "Reminder",
    icon: Clock,
    color: C.accent,
    bg: C.accentLight,
    desc: "Deadlines & reminders",
  },
];

const PRIORITY_LEVELS = [
  { id: "low", label: "Low", color: C.success },
  { id: "medium", label: "Medium", color: C.warning },
  { id: "high", label: "High", color: C.danger },
];

const EMOJIS = [
  "📢",
  "🎉",
  "⚠️",
  "📋",
  "🗓️",
  "🏆",
  "💡",
  "🔔",
  "✅",
  "🚀",
  "❗",
  "📌",
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Rich Text Toolbar ─── */
const TOOLBAR_ACTIONS = [
  { icon: Bold, action: "bold", label: "Bold" },
  { icon: Italic, action: "italic", label: "Italic" },
  { icon: Underline, action: "underline", label: "Underline" },
  null, // separator
  { icon: AlignLeft, action: "justifyLeft", label: "Align Left" },
  { icon: AlignCenter, action: "justifyCenter", label: "Center" },
  { icon: AlignRight, action: "justifyRight", label: "Align Right" },
  null,
  { icon: List, action: "insertUnorderedList", label: "Bullet List" },
  { icon: Hash, action: "insertOrderedList", label: "Numbered List" },
];

function RichEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const [activeFormats, setActiveFormats] = useState(new Set());

  const execCmd = (cmd) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, null);
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    const formats = new Set();
    ["bold", "italic", "underline"].forEach((f) => {
      if (document.queryCommandState(f)) formats.add(f);
    });
    setActiveFormats(formats);
  };

  const handleInput = () => {
    onChange(editorRef.current?.innerHTML || "");
    updateActiveFormats();
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1.5px solid ${C.border}` }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-1 px-3 py-2.5 flex-wrap"
        style={{
          background: C.surfaceAlt,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        {TOOLBAR_ACTIONS.map((action, i) =>
          action === null ? (
            <div
              key={i}
              className="w-px h-5 mx-1"
              style={{ background: C.border }}
            />
          ) : (
            <motion.button
              key={action.action}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onMouseDown={(e) => {
                e.preventDefault();
                execCmd(action.action);
              }}
              title={action.label}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{
                background: activeFormats.has(action.action)
                  ? C.primaryLight
                  : "transparent",
                color: activeFormats.has(action.action)
                  ? C.primary
                  : C.textSecondary,
              }}
            >
              <action.icon size={13} />
            </motion.button>
          ),
        )}
        <div className="ml-auto flex items-center gap-1">
          <select
            className="text-xs px-2 py-1 rounded-lg outline-none"
            style={{
              background: "transparent",
              color: C.textSecondary,
              border: "none",
            }}
            onChange={(e) => {
              execCmd("fontSize");
            }}
          >
            <option>Normal</option>
            <option>Heading 1</option>
            <option>Heading 2</option>
          </select>
        </div>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        className="min-h-48 p-4 text-sm outline-none"
        style={{
          color: C.textPrimary,
          lineHeight: "1.75",
          fontFamily: "inherit",
        }}
        data-placeholder={placeholder}
      />
    </div>
  );
}

/* ─── Preview Modal ─── */
function PreviewModal({ form, onClose, onPublish, onDraft, publishing }) {
  const typeConfig =
    ANNOUNCEMENT_TYPES.find((t) => t.id === form.type) || ANNOUNCEMENT_TYPES[0];
  const TypeIcon = typeConfig.icon;
  const now = new Date();

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(15,23,42,0.5)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative h-full w-full max-w-lg flex flex-col"
        style={{ background: C.bg, boxShadow: "-8px 0 40px rgba(0,0,0,0.15)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{
            background: C.surface,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div className="flex items-center gap-2">
            <Eye size={16} color={C.primary} />
            <span
              className="text-sm font-bold"
              style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
            >
              Announcement Preview
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={15} color={C.textMuted} />
          </button>
        </div>

        {/* Preview content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Employee-view card */}
          <div
            className="mb-4 text-xs font-semibold uppercase tracking-wide"
            style={{ color: C.textMuted }}
          >
            How it appears to employees:
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            }}
          >
            {/* Type banner */}
            <div
              className="px-5 py-3 flex items-center gap-2.5"
              style={{
                background: `linear-gradient(135deg, ${typeConfig.color}, ${typeConfig.color}cc)`,
              }}
            >
              <TypeIcon size={16} color="#fff" />
              <span className="text-xs font-bold text-white uppercase tracking-wide">
                {typeConfig.label}
              </span>
              {form.priority === "high" && (
                <span className="ml-auto text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">
                  PRIORITY
                </span>
              )}
            </div>

            <div className="p-5">
              {/* Title */}
              <div className="flex items-start gap-2 mb-3">
                {form.emoji && (
                  <span className="text-2xl leading-none mt-0.5">
                    {form.emoji}
                  </span>
                )}
                <h2
                  className="text-lg font-bold leading-snug"
                  style={{
                    color: C.textPrimary,
                    fontFamily: "Sora, sans-serif",
                  }}
                >
                  {form.title || (
                    <span style={{ color: C.textMuted }}>
                      Untitled announcement
                    </span>
                  )}
                </h2>
              </div>

              {/* Meta */}
              <div
                className="flex items-center gap-3 mb-4 text-xs"
                style={{ color: C.textMuted }}
              >
                <span className="flex items-center gap-1">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-[9px] font-bold text-white">
                    NA
                  </div>
                  {ADMIN.name}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {now.toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  {form.audience === "all" ? (
                    <Globe size={10} />
                  ) : (
                    <Building2 size={10} />
                  )}
                  {form.audience === "all"
                    ? "All Employees"
                    : form.departments.length > 0
                      ? form.departments.join(", ")
                      : "Select departments"}
                </span>
              </div>

              {/* Body */}
              <div
                className="text-sm leading-relaxed prose prose-sm max-w-none"
                style={{ color: C.textSecondary }}
                dangerouslySetInnerHTML={{
                  __html:
                    form.body ||
                    "<p style='color:#94A3B8'>Your announcement body will appear here...</p>",
                }}
              />

              {/* Tags */}
              {form.tags.length > 0 && (
                <div
                  className="flex flex-wrap gap-1.5 mt-4 pt-4"
                  style={{ borderTop: `1px solid ${C.border}` }}
                >
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                      style={{ background: C.primaryLight, color: C.primary }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Audience summary */}
          <div
            className="mt-4 rounded-xl p-4"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wide mb-3"
              style={{ color: C.textMuted }}
            >
              Delivery Summary
            </p>
            <div className="space-y-2">
              {[
                {
                  label: "Recipients",
                  value:
                    form.audience === "all"
                      ? "All 127 employees"
                      : `${form.departments.length} department(s)`,
                },
                {
                  label: "Publish",
                  value:
                    form.schedule === "now"
                      ? "Immediately"
                      : form.scheduleDate || "Scheduled",
                },
                { label: "Channels", value: "Dashboard + Email Notification" },
                {
                  label: "Priority",
                  value:
                    form.priority.charAt(0).toUpperCase() +
                    form.priority.slice(1),
                },
              ].map((d) => (
                <div
                  key={d.label}
                  className="flex items-center justify-between text-xs"
                >
                  <span style={{ color: C.textMuted }}>{d.label}</span>
                  <span
                    className="font-semibold"
                    style={{ color: C.textPrimary }}
                  >
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action footer */}
        <div
          className="px-5 py-4 shrink-0 flex gap-3"
          style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDraft}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: C.surfaceAlt,
              color: C.textSecondary,
              border: `1px solid ${C.border}`,
            }}
          >
            <Save size={14} />
            Save Draft
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPublish}
            disabled={publishing}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{
              background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
              boxShadow: `0 4px 16px ${C.primary}44`,
              opacity: publishing ? 0.7 : 1,
            }}
          >
            {publishing ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            {publishing ? "Publishing..." : "Publish Now"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════ CREATE PAGE ════════════════════ */
export default function AnnouncementsCreate() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [charCount, setCharCount] = useState(0);

  const [form, setForm] = useState({
    title: "",
    body: "",
    type: "general",
    audience: "all",
    departments: [],
    schedule: "now",
    scheduleDate: "",
    scheduleTime: "09:00",
    priority: "medium",
    emoji: "",
    tags: [],
    pinToTop: false,
    requireAck: false,
    sendEmail: true,
    sendPushNotif: true,
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleDept = (dept) => {
    set(
      "departments",
      form.departments.includes(dept)
        ? form.departments.filter((d) => d !== dept)
        : [...form.departments, dept],
    );
  };

  const addTag = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput
        .trim()
        .replace(/^#/, "")
        .replace(/\s+/g, "-")
        .toLowerCase();
      if (!form.tags.includes(tag)) set("tags", [...form.tags, tag]);
      setTagInput("");
    }
  };

  const handlePublish = async () => {
    if (!form.title.trim()) {
      showToast("Please add a title", "error");
      return;
    }
    setPublishing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setPublishing(false);
    setShowPreview(false);
    showToast(
      form.schedule === "now"
        ? "Announcement published successfully!"
        : "Announcement scheduled successfully!",
    );
    setForm((p) => ({ ...p, title: "", body: "", emoji: "", tags: [] }));
  };

  const handleDraft = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setShowPreview(false);
    showToast("Draft saved successfully");
  };

  const typeConfig =
    ANNOUNCEMENT_TYPES.find((t) => t.id === form.type) || ANNOUNCEMENT_TYPES[0];
  const TypeIcon = typeConfig.icon;

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
            <span style={{ color: C.primary, fontWeight: 600 }}>Create</span>
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
          <main className="p-6 max-w-5xl mx-auto">
            {/* Page header */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex items-start justify-between mb-6"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
                    boxShadow: `0 4px 16px ${C.primary}44`,
                  }}
                >
                  <Megaphone size={18} color="#fff" />
                </div>
                <div>
                  <h1
                    className="text-xl font-bold"
                    style={{
                      color: C.textPrimary,
                      fontFamily: "Sora, sans-serif",
                    }}
                  >
                    Create Announcement
                  </h1>
                  <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                    Broadcast a message to your employees
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDraft}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{
                    background: C.surface,
                    color: C.textSecondary,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  {saving ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  {saving ? "Saving..." : "Save Draft"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: C.primaryLight, color: C.primary }}
                >
                  <Eye size={13} />
                  Preview
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePublish}
                  disabled={publishing}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
                    boxShadow: `0 4px 16px ${C.primary}44`,
                    opacity: publishing ? 0.7 : 1,
                  }}
                >
                  {publishing ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <Send size={13} />
                  )}
                  {publishing ? "Publishing..." : "Publish"}
                </motion.button>
              </div>
            </motion.div>

            <div className="grid grid-cols-3 gap-5">
              {/* ─── Left: Main form ─── */}
              <div className="col-span-2 space-y-4">
                {/* Announcement type */}
                <motion.div
                  custom={0}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="rounded-2xl p-5"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-wide mb-3"
                    style={{ color: C.textMuted }}
                  >
                    Announcement Type
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {ANNOUNCEMENT_TYPES.map((type) => {
                      const Icon = type.icon;
                      const active = form.type === type.id;
                      return (
                        <motion.button
                          key={type.id}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => set("type", type.id)}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all"
                          style={{
                            background: active ? type.bg : C.surfaceAlt,
                            border: `2px solid ${active ? type.color : C.border}`,
                            boxShadow: active
                              ? `0 4px 12px ${type.color}33`
                              : "none",
                          }}
                        >
                          <Icon
                            size={18}
                            color={active ? type.color : C.textMuted}
                          />
                          <span
                            className="text-[11px] font-bold"
                            style={{
                              color: active ? type.color : C.textSecondary,
                            }}
                          >
                            {type.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Title */}
                <motion.div
                  custom={1}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="rounded-2xl p-5"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p
                      className="text-xs font-bold uppercase tracking-wide"
                      style={{ color: C.textMuted }}
                    >
                      Title <span style={{ color: C.danger }}>*</span>
                    </p>
                    {/* Emoji picker */}
                    <div className="relative">
                      <button
                        onClick={() => setShowEmojiPicker((p) => !p)}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg"
                        style={{
                          background: C.surfaceAlt,
                          color: C.textSecondary,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        <span>{form.emoji || "😊"}</span>
                        {form.emoji ? "Change" : "Add Emoji"}
                      </button>
                      <AnimatePresence>
                        {showEmojiPicker && (
                          <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="absolute right-0 top-full mt-1 p-2 rounded-xl grid grid-cols-6 gap-1 z-10"
                            style={{
                              background: C.surface,
                              border: `1px solid ${C.border}`,
                              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                            }}
                          >
                            {EMOJIS.map((em) => (
                              <button
                                key={em}
                                onClick={() => {
                                  set("emoji", em);
                                  setShowEmojiPicker(false);
                                }}
                                className="w-8 h-8 text-lg hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
                              >
                                {em}
                              </button>
                            ))}
                            <button
                              onClick={() => {
                                set("emoji", "");
                                setShowEmojiPicker(false);
                              }}
                              className="col-span-6 text-[10px] text-center py-1 hover:bg-gray-100 rounded-lg transition-colors"
                              style={{ color: C.textMuted }}
                            >
                              Clear
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {form.emoji && (
                      <span className="text-2xl shrink-0">{form.emoji}</span>
                    )}
                    <input
                      value={form.title}
                      onChange={(e) => set("title", e.target.value)}
                      placeholder="Write a clear, descriptive title..."
                      className="w-full px-4 py-3 rounded-xl text-base font-semibold outline-none transition-all"
                      style={{
                        background: C.surfaceAlt,
                        border: `1.5px solid ${form.title ? C.primary + "66" : C.border}`,
                        color: C.textPrimary,
                        boxShadow: form.title
                          ? `0 0 0 3px ${C.primaryLight}`
                          : "none",
                        fontFamily: "Sora, sans-serif",
                      }}
                    />
                  </div>
                  <p
                    className="text-[11px] mt-1.5 text-right"
                    style={{ color: C.textMuted }}
                  >
                    {form.title.length}/100
                  </p>
                </motion.div>

                {/* Rich text body */}
                <motion.div
                  custom={2}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="rounded-2xl p-5"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p
                      className="text-xs font-bold uppercase tracking-wide"
                      style={{ color: C.textMuted }}
                    >
                      Message Body <span style={{ color: C.danger }}>*</span>
                    </p>
                    <span
                      className="text-[11px]"
                      style={{ color: C.textMuted }}
                    >
                      Use formatting toolbar below
                    </span>
                  </div>
                  <RichEditor
                    value={form.body}
                    onChange={(v) => {
                      set("body", v);
                      setCharCount(v.replace(/<[^>]+>/g, "").length);
                    }}
                    placeholder="Write your announcement here. Be clear, concise, and actionable..."
                  />
                  <p
                    className="text-[11px] mt-1.5 text-right"
                    style={{ color: C.textMuted }}
                  >
                    {charCount} characters
                  </p>
                </motion.div>

                {/* Tags */}
                <motion.div
                  custom={3}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="rounded-2xl p-5"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-wide mb-3"
                    style={{ color: C.textMuted }}
                  >
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ background: C.primaryLight, color: C.primary }}
                      >
                        #{tag}
                        <button
                          onClick={() =>
                            set(
                              "tags",
                              form.tags.filter((t) => t !== tag),
                            )
                          }
                          className="ml-0.5"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={addTag}
                      placeholder="Add tag + Enter"
                      className="text-xs px-3 py-1 rounded-full outline-none"
                      style={{
                        background: C.surfaceAlt,
                        border: `1.5px solid ${C.border}`,
                        color: C.textPrimary,
                        minWidth: 120,
                      }}
                    />
                  </div>
                  <p className="text-[11px]" style={{ color: C.textMuted }}>
                    Press Enter or comma to add a tag
                  </p>
                </motion.div>
              </div>

              {/* ─── Right: Settings ─── */}
              <div className="space-y-4">
                {/* Audience */}
                <motion.div
                  custom={0}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="rounded-2xl p-5"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-wide mb-3"
                    style={{ color: C.textMuted }}
                  >
                    Target Audience
                  </p>

                  <div className="space-y-2 mb-3">
                    {[
                      {
                        val: "all",
                        label: "All Employees",
                        icon: Globe,
                        sub: "127 employees",
                      },
                      {
                        val: "department",
                        label: "Specific Departments",
                        icon: Building2,
                        sub: "Choose below",
                      },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => set("audience", opt.val)}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all"
                        style={{
                          background:
                            form.audience === opt.val
                              ? C.primaryLight
                              : C.surfaceAlt,
                          border: `1.5px solid ${form.audience === opt.val ? C.primary : C.border}`,
                        }}
                      >
                        <opt.icon
                          size={15}
                          color={
                            form.audience === opt.val ? C.primary : C.textMuted
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-xs font-bold"
                            style={{
                              color:
                                form.audience === opt.val
                                  ? C.primary
                                  : C.textPrimary,
                            }}
                          >
                            {opt.label}
                          </p>
                          <p
                            className="text-[10px]"
                            style={{ color: C.textMuted }}
                          >
                            {opt.sub}
                          </p>
                        </div>
                        <div
                          className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                          style={{
                            borderColor:
                              form.audience === opt.val ? C.primary : C.border,
                            background:
                              form.audience === opt.val
                                ? C.primary
                                : "transparent",
                          }}
                        >
                          {form.audience === opt.val && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <AnimatePresence>
                    {form.audience === "department" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <p
                          className="text-[11px] font-semibold mb-2"
                          style={{ color: C.textMuted }}
                        >
                          Select departments:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {DEPARTMENTS.map((dept) => {
                            const active = form.departments.includes(dept);
                            return (
                              <button
                                key={dept}
                                onClick={() => toggleDept(dept)}
                                className="text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all"
                                style={{
                                  background: active ? C.primary : C.surfaceAlt,
                                  color: active ? "#fff" : C.textSecondary,
                                  border: `1px solid ${active ? C.primary : C.border}`,
                                }}
                              >
                                {dept}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Scheduling */}
                <motion.div
                  custom={1}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="rounded-2xl p-5"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-wide mb-3"
                    style={{ color: C.textMuted }}
                  >
                    Publish Time
                  </p>
                  <div className="space-y-2 mb-3">
                    {[
                      {
                        val: "now",
                        label: "Publish Immediately",
                        icon: Zap,
                        sub: "Goes live right now",
                      },
                      {
                        val: "scheduled",
                        label: "Schedule for Later",
                        icon: Calendar,
                        sub: "Pick date & time",
                      },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => set("schedule", opt.val)}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all"
                        style={{
                          background:
                            form.schedule === opt.val
                              ? C.accentLight
                              : C.surfaceAlt,
                          border: `1.5px solid ${form.schedule === opt.val ? C.accent : C.border}`,
                        }}
                      >
                        <opt.icon
                          size={15}
                          color={
                            form.schedule === opt.val ? C.accent : C.textMuted
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-xs font-bold"
                            style={{
                              color:
                                form.schedule === opt.val
                                  ? C.accent
                                  : C.textPrimary,
                            }}
                          >
                            {opt.label}
                          </p>
                          <p
                            className="text-[10px]"
                            style={{ color: C.textMuted }}
                          >
                            {opt.sub}
                          </p>
                        </div>
                        <div
                          className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                          style={{
                            borderColor:
                              form.schedule === opt.val ? C.accent : C.border,
                            background:
                              form.schedule === opt.val
                                ? C.accent
                                : "transparent",
                          }}
                        >
                          {form.schedule === opt.val && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <AnimatePresence>
                    {form.schedule === "scheduled" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <div>
                          <label
                            className="text-[11px] font-semibold mb-1 block"
                            style={{ color: C.textMuted }}
                          >
                            Date
                          </label>
                          <input
                            type="date"
                            value={form.scheduleDate}
                            onChange={(e) =>
                              set("scheduleDate", e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                            style={{
                              background: C.surfaceAlt,
                              border: `1.5px solid ${C.border}`,
                              color: C.textPrimary,
                            }}
                          />
                        </div>
                        <div>
                          <label
                            className="text-[11px] font-semibold mb-1 block"
                            style={{ color: C.textMuted }}
                          >
                            Time
                          </label>
                          <input
                            type="time"
                            value={form.scheduleTime}
                            onChange={(e) =>
                              set("scheduleTime", e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                            style={{
                              background: C.surfaceAlt,
                              border: `1.5px solid ${C.border}`,
                              color: C.textPrimary,
                            }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Priority */}
                <motion.div
                  custom={2}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="rounded-2xl p-5"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-wide mb-3"
                    style={{ color: C.textMuted }}
                  >
                    Priority Level
                  </p>
                  <div className="flex gap-2">
                    {PRIORITY_LEVELS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => set("priority", p.id)}
                        className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{
                          background:
                            form.priority === p.id
                              ? p.color + "18"
                              : C.surfaceAlt,
                          border: `1.5px solid ${form.priority === p.id ? p.color : C.border}`,
                          color:
                            form.priority === p.id ? p.color : C.textSecondary,
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Delivery options */}
                <motion.div
                  custom={3}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="rounded-2xl p-5"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-wide mb-3"
                    style={{ color: C.textMuted }}
                  >
                    Delivery Options
                  </p>
                  <div className="space-y-3">
                    {[
                      {
                        key: "pinToTop",
                        label: "Pin to Top",
                        sub: "Show at the top of announcements",
                        icon: Pin,
                      },
                      {
                        key: "requireAck",
                        label: "Require Acknowledgment",
                        sub: "Employees must confirm they read it",
                        icon: CheckCircle2,
                      },
                      {
                        key: "sendEmail",
                        label: "Send Email Notification",
                        sub: "Notify via work email",
                        icon: Bell,
                      },
                      {
                        key: "sendPushNotif",
                        label: "Push Notification",
                        sub: "In-app notification",
                        icon: Zap,
                      },
                    ].map((opt) => (
                      <div key={opt.key} className="flex items-center gap-3">
                        <opt.icon
                          size={13}
                          color={C.textMuted}
                          className="shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-xs font-semibold"
                            style={{ color: C.textPrimary }}
                          >
                            {opt.label}
                          </p>
                          <p
                            className="text-[10px]"
                            style={{ color: C.textMuted }}
                          >
                            {opt.sub}
                          </p>
                        </div>
                        <div
                          onClick={() => set(opt.key, !form[opt.key])}
                          className="w-9 h-5 rounded-full cursor-pointer transition-all relative shrink-0"
                          style={{
                            background: form[opt.key] ? C.primary : C.border,
                          }}
                        >
                          <motion.div
                            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                            animate={{
                              left: form[opt.key] ? "calc(100% - 18px)" : "2px",
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 25,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Preview slide-over */}
      <AnimatePresence>
        {showPreview && (
          <PreviewModal
            form={form}
            onClose={() => setShowPreview(false)}
            onPublish={handlePublish}
            onDraft={handleDraft}
            publishing={publishing}
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
              minWidth: 320,
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
