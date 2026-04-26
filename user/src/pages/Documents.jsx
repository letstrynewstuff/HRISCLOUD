// src/pages/Documents.jsx
// Employee self-service documents page.
// All data from API — zero mock data.
// motion aliased as Motion throughout.

import { useState, useEffect, useRef, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import SideNavbar from "../components/sideNavbar";
import {
  FileText,
  Bell,
  Search,
  Menu,
  Download,
  Eye,
  Upload,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  ChevronRight,
  Shield,
  Pen,
  Lock,
  File,
  FileImage,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  AlertTriangle,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";
import C from "../styles/colors";
import { documentApi } from "../api/service/documentApi";
import { authApi } from "../api/service/authApi";

// ── File icon map ─────────────────────────────────────────────
const FILE_ICONS = {
  pdf: { icon: FileText, color: C.danger, bg: C.dangerLight },
  jpg: { icon: FileImage, color: "#06B6D4", bg: "#ECFEFF" },
  jpeg: { icon: FileImage, color: "#06B6D4", bg: "#ECFEFF" },
  png: { icon: FileImage, color: "#8B5CF6", bg: "#EDE9FE" },
  xlsx: { icon: FileSpreadsheet, color: C.success, bg: C.successLight },
  docx: { icon: FileText, color: C.primary, bg: C.primaryLight },
};
const getFileIcon = (type) =>
  FILE_ICONS[type?.toLowerCase()] ?? {
    icon: File,
    color: C.textMuted,
    bg: "#F1F5F9",
  };

const fmtDate = (ds) =>
  ds
    ? new Date(ds).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

// ── Animations ────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ── Atoms ─────────────────────────────────────────────────────
function Skeleton({ h = 16, w = "100%" }) {
  return (
    <div
      style={{
        height: h,
        width: w,
        borderRadius: 8,
        background:
          "linear-gradient(90deg,#E4E7F0 25%,#F0F2F8 50%,#E4E7F0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite linear",
      }}
    />
  );
}

function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  const Icon = type === "success" ? CheckCircle2 : XCircle;
  const color = type === "success" ? C.success : C.danger;
  return (
    <Motion.div
      initial={{ opacity: 0, y: 40, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: 40, x: "-50%" }}
      className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl"
      style={{
        background: C.navy,
        boxShadow: "0 12px 40px rgba(15,23,42,0.35)",
        minWidth: 260,
      }}
    >
      <Icon size={16} color={color} />
      <span className="text-white text-sm font-semibold">{msg}</span>
    </Motion.div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    pending: {
      bg: C.warningLight,
      color: C.warning,
      icon: Clock,
      label: "Pending",
    },
    signed: {
      bg: C.successLight,
      color: C.success,
      icon: CheckCircle2,
      label: "Signed",
    },
    sent: { bg: C.primaryLight, color: C.primary, icon: Shield, label: "Sent" },
    approved: {
      bg: C.successLight,
      color: C.success,
      icon: CheckCircle2,
      label: "Approved",
    },
    rejected: {
      bg: C.dangerLight,
      color: C.danger,
      icon: XCircle,
      label: "Rejected",
    },
    viewed: { bg: C.accentLight, color: C.accent, icon: Eye, label: "Viewed" },
    unviewed: {
      bg: C.surfaceAlt,
      color: C.textMuted,
      icon: AlertCircle,
      label: "Unread",
    },
  }[status?.toLowerCase()] ?? {
    bg: C.surfaceAlt,
    color: C.textMuted,
    icon: File,
    label: status,
  };
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon size={9} />
      {cfg.label}
    </span>
  );
}

// ── Sign Modal ────────────────────────────────────────────────
function SignModal({ doc, onClose, onSigned }) {
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState("");

  const handleSign = async () => {
    if (!agreed) {
      setError("You must acknowledge the document before signing.");
      return;
    }
    setSigning(true);
    try {
      await documentApi.sign(doc.id, { signature: "electronic_consent" });
      onSigned();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to sign document.");
    } finally {
      setSigning(false);
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <Motion.div
        initial={{ scale: 0.93, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 20 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: C.surface,
          boxShadow: "0 24px 64px rgba(15,23,42,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: C.primaryLight }}
            >
              <Pen size={14} color={C.primary} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
                Sign Document
              </p>
              <p
                className="text-[10px] truncate max-w-[220px]"
                style={{ color: C.textMuted }}
              >
                {doc.template_name ?? doc.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: C.surfaceAlt }}
          >
            <X size={13} color={C.textMuted} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: C.dangerLight }}
            >
              <AlertTriangle size={13} color={C.danger} />
              <p className="text-xs" style={{ color: C.danger }}>
                {error}
              </p>
            </div>
          )}

          <div
            className="rounded-xl p-4"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
            }}
          >
            <p
              className="text-xs font-semibold mb-1"
              style={{ color: C.textSecondary }}
            >
              Document Content Preview
            </p>
            <p
              className="text-xs leading-relaxed font-mono"
              style={{ color: C.textPrimary }}
            >
              {doc.final_content?.slice(0, 300)}
              {doc.final_content?.length > 300 ? "…" : ""}
            </p>
          </div>

          <div
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{
              background: C.warningLight,
              border: `1px solid ${C.warning}33`,
            }}
          >
            <Info size={14} color={C.warning} className="shrink-0 mt-0.5" />
            <p className="text-xs" style={{ color: C.warning }}>
              By signing, you confirm that you have read and understood this
              document. Your electronic signature is legally binding.
            </p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5"
            />
            <span className="text-xs" style={{ color: C.textSecondary }}>
              I have read and understood the contents of this document and agree
              to sign electronically.
            </span>
          </label>
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
              color: C.textSecondary,
            }}
          >
            Cancel
          </button>
          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSign}
            disabled={!agreed || signing}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{
              background: C.success,
              opacity: !agreed || signing ? 0.6 : 1,
            }}
          >
            {signing ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Pen size={13} />
            )}
            Sign Document
          </Motion.button>
        </div>
      </Motion.div>
    </Motion.div>
  );
}

// ── Preview Drawer ────────────────────────────────────────────
function PreviewDrawer({ doc, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <Motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-lg h-full overflow-y-auto"
        style={{
          background: C.surface,
          boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
        }}
      >
        <div
          className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
          style={{
            background: C.surface,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div>
            <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
              {doc.template_name ?? doc.category ?? "Document"}
            </p>
            <StatusBadge status={doc.status} />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: C.surfaceAlt }}
          >
            <X size={14} color={C.textSecondary} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Template", value: doc.template_name ?? "—" },
              { label: "Category", value: doc.category ?? "—" },
              { label: "Created", value: fmtDate(doc.created_at) },
              {
                label: "Signed At",
                value: doc.signed_at
                  ? fmtDate(doc.signed_at)
                  : "Not yet signed",
              },
            ].map((r) => (
              <div
                key={r.label}
                className="rounded-xl p-3"
                style={{
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                }}
              >
                <p
                  className="text-[10px] font-semibold mb-0.5"
                  style={{ color: C.textMuted }}
                >
                  {r.label}
                </p>
                <p
                  className="text-xs font-semibold"
                  style={{ color: C.textPrimary }}
                >
                  {r.value}
                </p>
              </div>
            ))}
          </div>

          {doc.final_content && (
            <div>
              <p
                className="text-xs font-semibold mb-2"
                style={{ color: C.textSecondary }}
              >
                Document Content
              </p>
              <pre
                className="text-xs leading-relaxed whitespace-pre-wrap p-4 rounded-xl font-sans"
                style={{
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                  color: C.textPrimary,
                  maxHeight: 400,
                  overflowY: "auto",
                }}
              >
                {doc.final_content}
              </pre>
            </div>
          )}
        </div>
      </Motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
export default function DocumentsPage() {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // all | pending | signed
  const [signTarget, setSignTarget] = useState(null);
  const [previewTarget, setPreviewTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await authApi.getMe();
      setUser(me);
      const empId = me.employee_id ?? me.employeeId;
      if (!empId) throw new Error("No employee profile linked.");

      setEmployee({
        id: empId,
        name: `${me.firstName ?? me.first_name} ${me.lastName ?? me.last_name}`,
        initials:
          `${(me.firstName ?? me.first_name ?? "?")[0]}${(me.lastName ?? me.last_name ?? "?")[0]}`.toUpperCase(),
        role: me.role,
        email: me.email,
      });

      const res = await documentApi.getAll({ employeeId: empId, limit: 100 });
      setDocuments(res.data ?? []);
    } catch (err) {
      setError(
        err?.response?.data?.message ??
          err.message ??
          "Failed to load documents.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Derive tab counts
  const pendingDocs = documents.filter((d) =>
    ["pending", "sent"].includes(d.status?.toLowerCase()),
  );
  const signedDocs = documents.filter(
    (d) => d.status?.toLowerCase() === "signed",
  );
  const needSign = documents.filter((d) => d.status?.toLowerCase() === "sent");

  const filtered = documents.filter((d) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      d.template_name?.toLowerCase().includes(q) ||
      d.category?.toLowerCase().includes(q);
    const matchTab =
      activeTab === "all"
        ? true
        : activeTab === "pending"
          ? ["pending", "sent"].includes(d.status?.toLowerCase())
          : activeTab === "signed"
            ? d.status?.toLowerCase() === "signed"
            : true;
    return matchSearch && matchTab;
  });

  const TABS = [
    { id: "all", label: "All", count: documents.length },
    { id: "pending", label: "Needs Action", count: pendingDocs.length },
    { id: "signed", label: "Signed", count: signedDocs.length },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        background: C.bg,
        color: C.textPrimary,
        fontFamily: "'DM Sans','Sora',sans-serif",
      }}
    >
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>

      <div className="flex h-screen overflow-hidden">
        <SideNavbar
          sidebarOpen={sidebarOpen}
          COLORS={C}
          EMPLOYEE={employee ?? {}}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* TOPBAR */}
          <header
            className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{
              background: "rgba(240,242,248,0.85)",
              backdropFilter: "blur(12px)",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen((p) => !p)}
              className="p-2 rounded-xl hidden md:flex"
              style={{ background: C.surface }}
            >
              <Menu size={16} color={C.textSecondary} />
            </Motion.button>

            <Motion.div
              className="flex-1 max-w-xs relative"
              animate={{ width: searchFocused ? "320px" : "240px" }}
            >
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
                placeholder="Search documents..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{
                  background: C.surface,
                  border: `1.5px solid ${searchFocused ? C.primary : C.border}`,
                  color: C.textPrimary,
                }}
              />
            </Motion.div>

            <div className="flex items-center gap-2 ml-auto">
              <Motion.button
                whileHover={{ scale: 1.05 }}
                onClick={load}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <RefreshCw size={14} color={C.textSecondary} />
              </Motion.button>
              <div className="relative">
                <Motion.button
                  className="relative p-2 rounded-xl"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <Bell size={16} color={C.textSecondary} />
                </Motion.button>
                {needSign.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                    style={{ background: C.danger }}
                  >
                    {needSign.length}
                  </span>
                )}
              </div>
              {employee && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    background: "linear-gradient(135deg,#4F46E5,#06B6D4)",
                  }}
                >
                  {employee.initials}
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {/* Hero */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-6 text-white"
              style={{
                background:
                  "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/15 shrink-0">
                  <FileText size={28} />
                </div>
                <div>
                  <h1
                    className="text-2xl font-bold"
                    style={{ fontFamily: "Sora,sans-serif" }}
                  >
                    My Documents
                  </h1>
                  <p className="text-indigo-200 text-sm mt-0.5">
                    {documents.length} document
                    {documents.length !== 1 ? "s" : ""} ·{" "}
                    {needSign.length > 0 ? (
                      <span className="font-semibold text-yellow-300">
                        {needSign.length} need{needSign.length === 1 ? "s" : ""}{" "}
                        signature
                      </span>
                    ) : (
                      "All up to date ✓"
                    )}
                  </p>
                </div>
              </div>
            </Motion.div>

            {/* Error */}
            {error && (
              <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{ background: C.dangerLight }}
              >
                <AlertTriangle size={16} color={C.danger} />
                <p className="text-sm" style={{ color: C.danger }}>
                  {error}
                </p>
              </div>
            )}

            {/* Needs signature alert */}
            {needSign.length > 0 && (
              <Motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{
                  background: C.warningLight,
                  border: `1px solid ${C.warning}44`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: C.warning }}
                >
                  <Pen size={15} color="#fff" />
                </div>
                <div className="flex-1">
                  <p
                    className="font-semibold text-sm"
                    style={{ color: C.textPrimary }}
                  >
                    {needSign.length} document{needSign.length === 1 ? "" : "s"}{" "}
                    awaiting your signature
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: C.textSecondary }}
                  >
                    Please review and sign the pending documents below.
                  </p>
                </div>
                <ChevronRight size={16} color={C.warning} />
              </Motion.div>
            )}

            {/* Tabs */}
            <div
              className="flex gap-1 p-1 rounded-2xl"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              {TABS.map((t) => {
                const active = activeTab === t.id;
                return (
                  <Motion.button
                    key={t.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab(t.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: active ? C.primary : "transparent",
                      color: active ? "#fff" : C.textSecondary,
                      boxShadow: active
                        ? "0 2px 8px rgba(79,70,229,0.25)"
                        : "none",
                    }}
                  >
                    {t.label}
                    {t.count > 0 && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: active
                            ? "rgba(255,255,255,0.25)"
                            : C.primaryLight,
                          color: active ? "#fff" : C.primary,
                        }}
                      >
                        {t.count}
                      </span>
                    )}
                  </Motion.button>
                );
              })}
            </div>

            {/* Documents list */}
            <Motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="rounded-2xl overflow-hidden"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              <div
                className="px-5 py-4"
                style={{ borderBottom: `1px solid ${C.border}` }}
              >
                <span
                  className="font-semibold text-sm"
                  style={{ color: C.textPrimary }}
                >
                  {filtered.length} document{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>

              {loading ? (
                <div className="p-5 space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-xl"
                      style={{ background: C.surfaceAlt }}
                    >
                      <Skeleton h={40} w={40} />
                      <div className="flex-1 space-y-2">
                        <Skeleton h={12} w="50%" />
                        <Skeleton h={10} w="30%" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-3">
                  <FileText size={40} color={C.textMuted} />
                  <p
                    className="font-semibold text-sm"
                    style={{ color: C.textSecondary }}
                  >
                    {searchQuery
                      ? "No documents match your search"
                      : `No ${activeTab === "all" ? "" : activeTab} documents`}
                  </p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: C.border }}>
                  {filtered.map((doc, i) => {
                    const ext =
                      doc.template_name?.split(".")?.pop()?.toLowerCase() ??
                      "pdf";
                    const cfg = getFileIcon(ext);
                    const isSent = doc.status?.toLowerCase() === "sent";
                    const isSigned = doc.status?.toLowerCase() === "signed";

                    return (
                      <Motion.div
                        key={doc.id}
                        custom={i}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        className="px-5 py-4 flex items-center gap-4"
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = C.surfaceAlt)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        {/* File icon */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: cfg.bg }}
                        >
                          <cfg.icon size={18} color={cfg.color} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p
                              className="font-semibold text-sm truncate"
                              style={{ color: C.textPrimary }}
                            >
                              {doc.template_name ?? "Document"}
                            </p>
                            <StatusBadge status={doc.status} />
                            {isSent && (
                              <span
                                className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                                style={{
                                  background: C.dangerLight,
                                  color: C.danger,
                                }}
                              >
                                SIGN REQUIRED
                              </span>
                            )}
                          </div>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: C.textMuted }}
                          >
                            {doc.category ?? "Document"} · Sent{" "}
                            {fmtDate(doc.created_at)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* View */}
                          <Motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setPreviewTarget(doc)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ background: C.primaryLight }}
                          >
                            <Eye size={14} color={C.primary} />
                          </Motion.button>

                          {/* Sign button for sent docs */}
                          {isSent && (
                            <Motion.button
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setSignTarget(doc)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                              style={{
                                background: `linear-gradient(135deg,${C.primary},#6366F1)`,
                                boxShadow: "0 3px 10px rgba(79,70,229,0.3)",
                              }}
                            >
                              <Pen size={11} /> Sign
                            </Motion.button>
                          )}

                          {/* Lock badge for signed */}
                          {isSigned && (
                            <div
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl"
                              style={{ background: C.successLight }}
                            >
                              <Lock size={11} color={C.success} />
                              <span
                                className="text-[10px] font-bold"
                                style={{ color: C.success }}
                              >
                                Signed
                              </span>
                            </div>
                          )}
                        </div>
                      </Motion.div>
                    );
                  })}
                </div>
              )}
            </Motion.div>

            <div className="h-4" />
          </main>
        </div>
      </div>

      {/* Sign Modal */}
      <AnimatePresence>
        {signTarget && (
          <SignModal
            doc={signTarget}
            onClose={() => setSignTarget(null)}
            onSigned={() => {
              setDocuments((prev) =>
                prev.map((d) =>
                  d.id === signTarget.id
                    ? {
                        ...d,
                        status: "signed",
                        signed_at: new Date().toISOString(),
                      }
                    : d,
                ),
              );
              setSignTarget(null);
              showToast("Document signed successfully.");
            }}
          />
        )}
      </AnimatePresence>

      {/* Preview Drawer */}
      <AnimatePresence>
        {previewTarget && (
          <PreviewDrawer
            doc={previewTarget}
            onClose={() => setPreviewTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            msg={toast.msg}
            type={toast.type}
            onDone={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
