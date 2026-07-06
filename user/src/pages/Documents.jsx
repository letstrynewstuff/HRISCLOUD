

// src/pages/Documents.jsx
// Employee self-service documents page.
// Fetches via documentApi.getMyDocuments() → GET /documents/my
// Supports: view · download (Cloudinary URL) · sign · status tracking

import { useState, useEffect, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Bell,
  Search,
  Menu,
  Download,
  Eye,
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
  FileType2,
  RefreshCw,
  AlertTriangle,
  Loader2,
  AlertCircle,
  Info,
  MessageSquare,
  User,
  Calendar,
  ExternalLink,
} from "lucide-react";
import C from "../styles/colors";
import { documentApi } from "../api/service/documentApi";
import { authApi } from "../api/service/authApi";

// ─── helpers ──────────────────────────────────────────────────
const fmtDate = (ds) =>
  ds
    ? new Date(ds).toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const getFileIcon = (mimeType) => {
  if (!mimeType) return { icon: File, color: "#64748B", bg: "#F1F5F9" };
  if (mimeType.includes("pdf"))
    return { icon: FileType2, color: "#DC2626", bg: "#FEF2F2" };
  if (mimeType.includes("word") || mimeType.includes("docx"))
    return { icon: FileText, color: C.primary, bg: C.primaryLight };
  if (mimeType.includes("sheet") || mimeType.includes("excel"))
    return { icon: FileSpreadsheet, color: "#16A34A", bg: "#F0FDF4" };
  if (mimeType.includes("image"))
    return { icon: FileImage, color: "#0891B2", bg: "#ECFEFF" };
  return { icon: File, color: "#64748B", bg: "#F1F5F9" };
};

// ── animations ────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ── Skeleton ──────────────────────────────────────────────────
function Skeleton({ h = 16, w = "100%" }) {
  return (
    <div
      style={{
        height: h,
        width: w,
        borderRadius: 8,
        background: "linear-gradient(90deg,#E4E7F0 25%,#F0F2F8 50%,#E4E7F0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite linear",
      }}
    />
  );
}

// ── Toast ─────────────────────────────────────────────────────
function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  const Icon = type === "success" ? CheckCircle2 : XCircle;
  const color = type === "success" ? "#22C55E" : "#EF4444";
  return (
    <Motion.div
      initial={{ opacity: 0, y: 40, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: 40, x: "-50%" }}
      className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl"
      style={{
        background: "#0F172A",
        boxShadow: "0 12px 40px rgba(15,23,42,0.35)",
        minWidth: 260,
      }}
    >
      <Icon size={16} color={color} />
      <span className="text-white text-sm font-semibold">{msg}</span>
    </Motion.div>
  );
}

// ── Status badge ──────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg =
    {
      pending: { bg: "#FFF7ED", color: "#C2410C", icon: Clock,        label: "Pending"  },
      sent:    { bg: "#EFF6FF", color: "#1D4ED8", icon: Shield,       label: "Awaiting Signature" },
      signed:  { bg: "#F0FDF4", color: "#15803D", icon: CheckCircle2, label: "Signed"   },
    }[status?.toLowerCase()] ?? {
      bg: "#F1F5F9", color: "#64748B", icon: File, label: status ?? "—",
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

// ─────────────────────────────────────────────────────────────
// SIGN MODAL
// ─────────────────────────────────────────────────────────────
function SignModal({ doc, onClose, onSigned }) {
  const [agreed,  setAgreed]  = useState(false);
  const [signing, setSigning] = useState(false);
  const [error,   setError]   = useState("");

  const docName  = doc.document_name  ?? doc.template_name ?? "Document";
  const category = doc.category       ?? "—";
  const sentBy   = doc.sent_by        ?? "HR";
  const hasFile  = !!doc.file_url;
  const hasContent = !!doc.final_content;

  const handleSign = async () => {
    if (!agreed) { setError("Please confirm you have read the document first."); return; }
    setSigning(true);
    setError("");
    try {
      await documentApi.sign(doc.id, { signature: "electronic_consent" });
      onSigned(doc.id);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to sign. Please try again.");
    } finally {
      setSigning(false);
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <Motion.div
        initial={{ scale: 0.93, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 20 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: C.surface, boxShadow: "0 24px 64px rgba(15,23,42,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: C.primaryLight }}
            >
              <Pen size={15} color={C.primary} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
                Sign Document
              </p>
              <p className="text-[10px] truncate max-w-[220px]" style={{ color: C.textMuted }}>
                {docName}
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
          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: C.dangerLight }}
            >
              <AlertTriangle size={13} color={C.danger} />
              <p className="text-xs" style={{ color: C.danger }}>{error}</p>
            </div>
          )}

          {/* Document summary card */}
          <div
            className="rounded-xl p-4 flex items-start gap-3"
            style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: C.primaryLight }}
            >
              <FileText size={15} color={C.primary} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: C.textPrimary }}>
                {docName}
              </p>
              <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                {category} · From {sentBy}
              </p>
              {doc.message && (
                <div
                  className="mt-2 flex items-start gap-1.5 p-2 rounded-lg"
                  style={{ background: C.primaryLight }}
                >
                  <MessageSquare size={11} color={C.primary} className="mt-0.5 flex-shrink-0" />
                  <p className="text-[11px]" style={{ color: C.primary }}>
                    {doc.message}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Preview / Download the actual file */}
          {hasFile && (
            <a
              href={doc.file_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{
                background: C.surfaceAlt,
                border: `1px solid ${C.border}`,
                textDecoration: "none",
              }}
            >
              <Download size={14} color={C.primary} />
              <span className="text-xs font-semibold flex-1 truncate" style={{ color: C.textPrimary }}>
                {doc.file_name ?? "Download document"}
              </span>
              <ExternalLink size={12} color={C.textMuted} />
            </a>
          )}

          {/* Template content preview */}
          {!hasFile && hasContent && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: C.textSecondary }}>
                Document Preview
              </p>
              <pre
                className="text-xs leading-relaxed whitespace-pre-wrap p-3 rounded-xl font-sans"
                style={{
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                  color: C.textPrimary,
                  maxHeight: 160,
                  overflowY: "auto",
                }}
              >
                {doc.final_content}
              </pre>
            </div>
          )}

          {/* Legal notice */}
          <div
            className="flex items-start gap-2 p-3 rounded-xl"
            style={{ background: "#FFFBEB", border: "1px solid #FCD34D44" }}
          >
            <Info size={13} color="#D97706" className="mt-0.5 flex-shrink-0" />
            <p className="text-[11px]" style={{ color: "#92400E" }}>
              Your electronic signature is legally binding. By signing you confirm
              you have read and understood this document.
            </p>
          </div>

          {/* Consent checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 accent-indigo-600"
            />
            <span className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>
              I have read and understood the contents of this document and agree
              to sign electronically.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 px-5 pb-5"
          style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}
        >
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
              background: "linear-gradient(135deg,#4F46E5,#6366F1)",
              opacity: !agreed || signing ? 0.55 : 1,
              cursor: !agreed || signing ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
            }}
          >
            {signing
              ? <><Loader2 size={13} className="animate-spin" /> Signing…</>
              : <><Pen size={13} /> Sign Document</>}
          </Motion.button>
        </div>
      </Motion.div>
    </Motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// PREVIEW DRAWER
// ─────────────────────────────────────────────────────────────
function PreviewDrawer({ doc, onClose, onSign }) {
  const docName  = doc.document_name ?? doc.template_name ?? "Document";
  const category = doc.category ?? "—";
  const sentBy   = doc.sent_by ?? "HR";
  const isSent   = doc.status?.toLowerCase() === "sent";
  const isSigned = doc.status?.toLowerCase() === "signed";
  const cfg      = getFileIcon(doc.mime_type);

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
        className="relative w-full max-w-md h-full overflow-y-auto flex flex-col"
        style={{ background: C.surface, boxShadow: "-8px 0 40px rgba(0,0,0,0.15)" }}
      >
        {/* Sticky header */}
        <div
          className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
          style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: cfg.bg }}
            >
              <cfg.icon size={16} color={cfg.color} />
            </div>
            <div>
              <p className="font-bold text-sm truncate max-w-[200px]" style={{ color: C.textPrimary }}>
                {docName}
              </p>
              <StatusBadge status={doc.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: C.surfaceAlt }}
          >
            <X size={14} color={C.textSecondary} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 flex-1">
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Category",  value: category },
              { label: "Sent By",   value: sentBy   },
              { label: "Sent On",   value: fmtDate(doc.sent_at ?? doc.created_at) },
              { label: "Signed At", value: doc.signed_at ? fmtDate(doc.signed_at) : isSent ? "Not yet signed" : "—" },
            ].map((r) => (
              <div
                key={r.label}
                className="rounded-xl p-3"
                style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}
              >
                <p className="text-[10px] font-semibold mb-0.5" style={{ color: C.textMuted }}>
                  {r.label}
                </p>
                <p className="text-xs font-semibold" style={{ color: C.textPrimary }}>
                  {r.value}
                </p>
              </div>
            ))}
          </div>

          {/* Message */}
          {doc.message && (
            <div
              className="rounded-xl p-3 flex items-start gap-2"
              style={{ background: C.primaryLight }}
            >
              <MessageSquare size={13} color={C.primary} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold mb-0.5" style={{ color: C.primary }}>
                  Message from HR
                </p>
                <p className="text-xs" style={{ color: C.primary }}>{doc.message}</p>
              </div>
            </div>
          )}

          {/* Download / Open file */}
          {doc.file_url && (
            <a
              href={doc.file_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 rounded-xl transition-all"
              style={{
                background: C.surfaceAlt,
                border: `1px solid ${C.border}`,
                textDecoration: "none",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: cfg.bg }}
              >
                <cfg.icon size={18} color={cfg.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: C.textPrimary }}>
                  {doc.file_name ?? "Open document"}
                </p>
                <p className="text-xs" style={{ color: C.textMuted }}>
                  Click to open · {doc.mime_type?.includes("pdf") ? "PDF" : "DOCX"}
                </p>
              </div>
              <ExternalLink size={14} color={C.textMuted} />
            </a>
          )}

          {/* Template content */}
          {!doc.file_url && doc.final_content && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: C.textSecondary }}>
                Document Content
              </p>
              <pre
                className="text-xs leading-relaxed whitespace-pre-wrap p-4 rounded-xl font-sans"
                style={{
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                  color: C.textPrimary,
                  maxHeight: 360,
                  overflowY: "auto",
                }}
              >
                {doc.final_content}
              </pre>
            </div>
          )}

          {/* Signed confirmation */}
          {isSigned && (
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}
            >
              <CheckCircle2 size={18} color="#16A34A" />
              <div>
                <p className="font-bold text-sm" style={{ color: "#15803D" }}>
                  You signed this document
                </p>
                <p className="text-xs" style={{ color: "#16A34A" }}>
                  {fmtDate(doc.signed_at)} · Electronic signature recorded
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        {isSent && (
          <div
            className="sticky bottom-0 p-4"
            style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}
          >
            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { onClose(); onSign(doc); }}
              className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg,#4F46E5,#6366F1)",
                boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
              }}
            >
              <Pen size={14} />
              Sign This Document
            </Motion.button>
          </div>
        )}
      </Motion.div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════
export default function DocumentsPage() {
  const [documents,    setDocuments]    = useState([]);
  const [employee,     setEmployee]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [searchFocused,setSearchFocused]= useState(false);
  const [activeTab,    setActiveTab]    = useState("all");
  const [signTarget,   setSignTarget]   = useState(null);
  const [previewTarget,setPreviewTarget]= useState(null);
  const [toast,        setToast]        = useState(null);
  const [sidebarOpen,  setSidebarOpen]  = useState(true);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // ── Load: use /documents/my — no employeeId needed, auth token does it ──
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Get identity for avatar / greeting
      const me = await authApi.getMe();
      setEmployee({
        name: `${me.firstName ?? me.first_name ?? ""} ${me.lastName ?? me.last_name ?? ""}`.trim(),
        initials: `${(me.firstName ?? me.first_name ?? "?")[0]}${(me.lastName ?? me.last_name ?? "?")[0]}`.toUpperCase(),
        email: me.email,
      });

      // ✅ Correct endpoint for employee documents
      const res = await documentApi.getMyDocuments();
      setDocuments(res.data ?? []);
    } catch (err) {
      setError(
        err?.response?.data?.message ?? err.message ?? "Failed to load documents.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Derived counts ─────────────────────────────────────────
  const needSign  = documents.filter((d) => d.status?.toLowerCase() === "sent");
  const signedDocs= documents.filter((d) => d.status?.toLowerCase() === "signed");

  const filtered = documents.filter((d) => {
    const q = searchQuery.toLowerCase();
    const name = (d.document_name ?? d.template_name ?? "").toLowerCase();
    const cat  = (d.category ?? "").toLowerCase();
    const matchSearch = !q || name.includes(q) || cat.includes(q);
    const matchTab =
      activeTab === "all"     ? true :
      activeTab === "pending" ? d.status?.toLowerCase() === "sent" :
      activeTab === "signed"  ? d.status?.toLowerCase() === "signed" :
      true;
    return matchSearch && matchTab;
  });

  const TABS = [
    { id: "all",     label: "All Documents", count: documents.length  },
    { id: "pending", label: "Needs Action",  count: needSign.length   },
    { id: "signed",  label: "Signed",        count: signedDocs.length },
  ];

  // ── Sign success ───────────────────────────────────────────
  const handleSigned = (id) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: "signed", signed_at: new Date().toISOString() }
          : d,
      ),
    );
    setSignTarget(null);
    showToast("Document signed successfully! HR has been notified.");
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: C.bg, color: C.textPrimary, fontFamily: "'DM Sans','Sora',sans-serif" }}
    >
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>

      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* ── TOP BAR ── */}
          <header
            className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{
              background: "rgba(240,242,248,0.85)",
              backdropFilter: "blur(12px)",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <button
              onClick={() => setSidebarOpen((p) => !p)}
              className="p-2 rounded-xl hidden md:flex"
              style={{ background: C.surface }}
            >
              <Menu size={16} color={C.textSecondary} />
            </button>

            <Motion.div
              className="flex-1 max-w-xs relative"
              animate={{ width: searchFocused ? "320px" : "240px" }}
            >
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" color={C.textMuted} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search documents…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{
                  background: C.surface,
                  border: `1.5px solid ${searchFocused ? C.primary : C.border}`,
                  color: C.textPrimary,
                }}
              />
            </Motion.div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={load}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: C.surface, border: `1px solid ${C.border}` }}
              >
                <RefreshCw size={14} color={C.textSecondary} />
              </button>
              {/* Notification bell — badge when docs need signing */}
              <div className="relative">
                <button
                  className="p-2 rounded-xl"
                  style={{ background: C.surface, border: `1px solid ${C.border}` }}
                >
                  <Bell size={16} color={C.textSecondary} />
                </button>
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
                  style={{ background: "linear-gradient(135deg,#4F46E5,#06B6D4)" }}
                >
                  {employee.initials}
                </div>
              )}
            </div>
          </header>

          {/* ── MAIN ── */}
          <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

            {/* Hero banner */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-6 text-white"
              style={{ background: "linear-gradient(135deg,#1E1B4B 0%,#312E81 55%,#1E40AF 100%)" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/15 shrink-0">
                  <FileText size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold" style={{ fontFamily: "Sora,sans-serif" }}>
                    My Documents
                  </h1>
                  <p className="text-indigo-200 text-sm mt-0.5">
                    {loading ? "Loading…" : (
                      <>
                        {documents.length} document{documents.length !== 1 ? "s" : ""}
                        {" · "}
                        {needSign.length > 0 ? (
                          <span className="font-semibold text-yellow-300">
                            {needSign.length} need{needSign.length === 1 ? "s" : ""} your signature
                          </span>
                        ) : (
                          "All up to date ✓"
                        )}
                      </>
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
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: C.danger }}>{error}</p>
                  <button
                    onClick={load}
                    className="text-xs underline mt-0.5"
                    style={{ color: C.danger }}
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {/* Needs signature alert */}
            {needSign.length > 0 && !loading && (
              <Motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
                style={{ background: "#FFF7ED", border: "1px solid #FCD34D55" }}
                onClick={() => setActiveTab("pending")}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "#F59E0B" }}
                >
                  <Pen size={15} color="#fff" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: C.textPrimary }}>
                    {needSign.length} document{needSign.length === 1 ? "" : "s"} awaiting your signature
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>
                    Click here to review and sign
                  </p>
                </div>
                <ChevronRight size={16} color="#F59E0B" />
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
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium"
                    style={{
                      background: active ? C.primary : "transparent",
                      color: active ? "#fff" : C.textSecondary,
                      boxShadow: active ? "0 2px 8px rgba(79,70,229,0.25)" : "none",
                    }}
                  >
                    {t.label}
                    {t.count > 0 && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: active ? "rgba(255,255,255,0.25)" : C.primaryLight,
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

            {/* Document list */}
            <Motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="rounded-2xl overflow-hidden"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              <div
                className="px-5 py-4"
                style={{ borderBottom: `1px solid ${C.border}` }}
              >
                <span className="font-semibold text-sm" style={{ color: C.textPrimary }}>
                  {loading ? "Loading documents…" : `${filtered.length} document${filtered.length !== 1 ? "s" : ""}`}
                </span>
              </div>

              {loading ? (
                <div className="p-5 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-xl"
                      style={{ background: C.surfaceAlt }}
                    >
                      <Skeleton h={40} w={40} />
                      <div className="flex-1 space-y-2">
                        <Skeleton h={12} w="55%" />
                        <Skeleton h={10} w="35%" />
                      </div>
                      <Skeleton h={32} w={80} />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-3">
                  <FileText size={40} color={C.textMuted} />
                  <p className="font-semibold text-sm" style={{ color: C.textSecondary }}>
                    {searchQuery
                      ? "No documents match your search"
                      : activeTab === "pending"
                      ? "No documents awaiting signature"
                      : activeTab === "signed"
                      ? "No signed documents yet"
                      : "No documents sent to you yet"}
                  </p>
                  {activeTab === "all" && !searchQuery && (
                    <p className="text-xs text-center max-w-[260px]" style={{ color: C.textMuted }}>
                      Documents sent by HR will appear here for review and signature.
                    </p>
                  )}
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: C.border }}>
                  {filtered.map((doc, i) => {
                    const cfg    = getFileIcon(doc.mime_type);
                    const isSent = doc.status?.toLowerCase() === "sent";
                    const isSigned = doc.status?.toLowerCase() === "signed";
                    const docName  = doc.document_name ?? doc.template_name ?? "Document";

                    return (
                      <Motion.div
                        key={doc.id}
                        custom={i}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        className="px-5 py-4 flex items-center gap-4 transition-colors"
                        style={{ cursor: "default" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceAlt)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
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
                            <p className="font-semibold text-sm truncate" style={{ color: C.textPrimary }}>
                              {docName}
                            </p>
                            <StatusBadge status={doc.status} />
                            {isSent && (
                              <span
                                className="text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                                style={{ background: C.dangerLight, color: C.danger }}
                              >
                                ACTION REQUIRED
                              </span>
                            )}
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                            {doc.category ?? "Document"}
                            {doc.sent_by ? ` · From ${doc.sent_by}` : ""}
                            {" · "}
                            {fmtDate(doc.sent_at ?? doc.created_at)}
                          </p>
                          {doc.message && (
                            <p
                              className="text-xs mt-1 truncate max-w-[300px]"
                              style={{ color: C.primary }}
                            >
                              💬 {doc.message}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Preview */}
                          <Motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setPreviewTarget(doc)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ background: C.primaryLight }}
                            title="Preview"
                          >
                            <Eye size={14} color={C.primary} />
                          </Motion.button>

                          {/* Download (uploaded docs) */}
                          {doc.file_url && (
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}
                              title="Download"
                            >
                              <Download size={14} color={C.textSecondary} />
                            </a>
                          )}

                          {/* Sign CTA */}
                          {isSent && (
                            <Motion.button
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setSignTarget(doc)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                              style={{
                                background: "linear-gradient(135deg,#4F46E5,#6366F1)",
                                boxShadow: "0 3px 10px rgba(79,70,229,0.3)",
                              }}
                            >
                              <Pen size={11} /> Sign
                            </Motion.button>
                          )}

                          {/* Signed lock */}
                          {isSigned && (
                            <div
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl"
                              style={{ background: "#F0FDF4" }}
                            >
                              <Lock size={11} color="#16A34A" />
                              <span className="text-[10px] font-bold" style={{ color: "#15803D" }}>
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
            onSigned={handleSigned}
          />
        )}
      </AnimatePresence>

      {/* Preview Drawer */}
      <AnimatePresence>
        {previewTarget && (
          <PreviewDrawer
            doc={previewTarget}
            onClose={() => setPreviewTarget(null)}
            onSign={(doc) => { setPreviewTarget(null); setSignTarget(doc); }}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}