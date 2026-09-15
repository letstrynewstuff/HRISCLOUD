

// src/employee/reports/EmployeeReportsPage.jsx
// Employee reports portal — same UI shell as Training.jsx
// List / New / Detail views with shared header, gradient hero, full-width layout.

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Search,
  Plus,
  ShieldAlert,
  RefreshCw,
  Send,
  Lock,
  AlertCircle,
  CheckCircle2,
  X,
  Calendar,
  MapPin,
  Users,
  Target,
  FileText,
  MessageSquarePlus,
  ChevronRight,
  Loader2,
} from "lucide-react";

import { C } from "../../admin/employeemanagement/sharedData";
import { reportApi } from "../../api/service/reportApi";
import { useAuth } from "../../components/useAuth";
import FormField from "../../components/reports/FormField";
import SelectField from "../../components/reports/SelectField";
import {
  CATEGORY_OPTIONS,
  SEVERITY_OPTIONS,
  CategoryPill,
  SeverityBadge,
  StatusBadge,
  ReportAvatar,
  getInitials,
  fmtDate,
  fmtDateTime,
} from "../../admin/reports/reportShared";

const EMPTY_FORM = {
  category: "",
  severity: "medium",
  subject: "",
  description: "",
  incidentDate: "",
  location: "",
  involvedParties: "",
  witnesses: "",
  desiredOutcome: "",
  isAnonymous: false,
};

const PAGE_SIZE = 15;

export default function EmployeeReportsPage() {
  const navigate = useNavigate();
  const { employee } = useAuth();

  const [view, setView] = useState("list"); // "list" | "new" | "detail"
  const [selectedId, setSelectedId] = useState(null);

  /* ── header shell ── */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  /* ── list state ── */
  const [reports, setReports] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  /* ── detail state ── */
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  /* ── form state ── */
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successModal, setSuccessModal] = useState(false);
  const [createdRef, setCreatedRef] = useState(null);

  const empInitials = (emp) => {
    if (!emp) return "?";
    return `${emp.firstName?.[0] ?? ""}${emp.lastName?.[0] ?? ""}`.toUpperCase();
  };

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportApi.getMyReports({ page, limit: PAGE_SIZE });
      setReports(res.data ?? []);
      setMeta(res.meta ?? { total: 0, totalPages: 1 });
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load your reports.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (view === "list") loadList();
  }, [view, loadList]);

  const openDetail = async (id) => {
    setSelectedId(id);
    setView("detail");
    setDetail(null);
    setDetailLoading(true);
    setDetailError(null);
    try {
      const res = await reportApi.getReport(id);
      setDetail(res.data ?? res);
    } catch {
      setDetailError("Failed to load this report.");
    } finally {
      setDetailLoading(false);
    }
  };

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.category) e.category = "Please select a category";
    if (!form.severity) e.severity = "Please select a severity";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.description.trim())
      e.description = "Please describe what happened";
    else if (form.description.trim().length < 20)
      e.description = "Please provide a bit more detail (min 20 characters)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        category: form.category,
        severity: form.severity,
        subject: form.subject.trim(),
        description: form.description.trim(),
        incidentDate: form.incidentDate.trim() || undefined,
        location: form.location.trim() || undefined,
        involvedParties: form.involvedParties.trim() || undefined,
        witnesses: form.witnesses.trim() || undefined,
        desiredOutcome: form.desiredOutcome.trim() || undefined,
        isAnonymous: form.isAnonymous,
      };
      const res = await reportApi.create(payload);
      setCreatedRef(res?.data?.referenceCode ?? res?.referenceCode ?? null);
      setSuccessModal(true);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit report. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitError(null);
  };

  const inputStyle = {
    background: C.surfaceAlt,
    border: `1.5px solid ${C.border}`,
    color: C.textPrimary,
  };

  const filteredReports = reports.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.subject ?? "").toLowerCase().includes(q) ||
      (r.description ?? "").toLowerCase().includes(q) ||
      (r.referenceCode ?? "").toLowerCase().includes(q)
    );
  });

  const pendingCount = reports.filter((r) =>
    ["pending", "open", "in-review"].includes(r.status),
  ).length;
  const resolvedCount = reports.filter((r) =>
    ["resolved", "closed"].includes(r.status),
  ).length;

  return (
    <div
      className="min-h-screen"
      style={{ background: C.bg, fontFamily: "'DM Sans','Sora',sans-serif" }}
    >
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* ════════════════════ SHARED HEADER ════════════════════ */}
          <header
            className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{
              background: "rgba(240,242,248,0.9)",
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

            <motion.div
              className="flex-1 max-w-xs relative"
              animate={{ width: searchFocused ? "320px" : "240px" }}
              transition={{ duration: 0.3 }}
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
                placeholder="Search reports…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{
                  background: C.surface,
                  border: `1.5px solid ${searchFocused ? C.primary : C.border}`,
                  color: C.textPrimary,
                }}
              />
            </motion.div>

            <div className="ml-auto flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg,#4F46E5,#06B6D4)",
                }}
              >
                {empInitials(employee)}
              </div>
            </div>
          </header>

          {/* ════════════════════ MAIN CONTENT ════════════════════ */}
          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
            {/* ─── LIST VIEW ─── */}
            {view === "list" && (
              <>
                {/* Hero banner */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-8 text-white"
                  style={{
                    background:
                      "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/15">
                        <ShieldAlert size={28} />
                      </div>
                      <div>
                        <h1
                          className="text-3xl font-bold"
                          style={{ fontFamily: "Sora,sans-serif" }}
                        >
                          My Reports
                        </h1>
               
                      </div>
                    </div>
                    <button
                      onClick={() => setView("new")}
                      className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                      style={{
                        background: "rgba(255,255,255,0.15)",
                        border: "1px solid rgba(255,255,255,0.25)",
                      }}
                    >
                      <Plus size={15} />
                      Submit New
                    </button>
                  </div>

                
                </motion.div>

                {/* Mobile CTA */}
                <div className="sm:hidden">
                  <button
                    onClick={() => setView("new")}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white"
                    style={{ background: C.primary }}
                  >
                    <Plus size={15} /> Submit New Report
                  </button>
                </div>

                {error && (
                  <div
                    className="flex items-center gap-2.5 p-3 rounded-xl"
                    style={{
                      background: C.dangerLight,
                      border: `1px solid ${C.danger}33`,
                    }}
                  >
                    <AlertCircle size={16} color={C.danger} />
                    <p
                      className="text-sm flex-1"
                      style={{ color: C.danger }}
                    >
                      {error}
                    </p>
                    <button onClick={loadList}>
                      <RefreshCw size={14} color={C.danger} />
                    </button>
                  </div>
                )}

                {loading ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-32 rounded-2xl animate-pulse"
                        style={{
                          background: C.surface,
                          border: `1px solid ${C.border}`,
                        }}
                      />
                    ))}
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="flex flex-col items-center py-16 gap-2">
                    <ShieldAlert size={40} color={C.textMuted} />
                    <p
                      className="text-sm font-bold"
                      style={{ color: C.textPrimary }}
                    >
                      {searchQuery
                        ? "No reports match your search"
                        : "No reports yet"}
                    </p>
                    <p className="text-xs" style={{ color: C.textMuted }}>
                      {searchQuery
                        ? "Try a different search term"
                        : "Anything you submit will show up here."}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={() => setView("new")}
                        className="flex items-center gap-1.5 mt-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white"
                        style={{ background: C.primary }}
                      >
                        <Plus size={13} /> Submit a Report
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {filteredReports.map((r) => (
                      <motion.button
                        key={r.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => openDetail(r.id)}
                        className="text-left rounded-2xl bg-white p-4 space-y-2 hover:-translate-y-0.5 transition-transform"
                        style={{ border: `1px solid ${C.border}` }}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <CategoryPill category={r.category} />
                          <div className="ml-auto flex gap-1.5">
                            <SeverityBadge severity={r.severity} />
                            <StatusBadge status={r.status} />
                          </div>
                        </div>
                        <p
                          className="text-sm font-extrabold truncate"
                          style={{ color: C.textPrimary }}
                        >
                          {r.subject}
                        </p>
                        <p
                          className="text-xs line-clamp-2"
                          style={{ color: C.textSecondary }}
                        >
                          {r.description}
                        </p>
                        <div
                          className="flex items-center justify-between pt-2"
                          style={{ borderTop: `1px solid ${C.border}` }}
                        >
                          <span
                            className="text-[10px] font-mono"
                            style={{ color: C.textMuted }}
                          >
                            {r.referenceCode}
                          </span>
                          <div className="flex items-center gap-1">
                            <span
                              className="text-[10px]"
                              style={{ color: C.textMuted }}
                            >
                              {fmtDate(r.createdAt)}
                            </span>
                            <ChevronRight size={13} color={C.textMuted} />
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {!loading && meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
                      style={{ background: C.primary, color: "#fff" }}
                    >
                      Prev
                    </button>
                    <span
                      className="text-xs font-bold"
                      style={{ color: C.textSecondary }}
                    >
                      {page} / {meta.totalPages}
                    </span>
                    <button
                      disabled={page === meta.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
                      style={{ background: C.primary, color: "#fff" }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ─── NEW REPORT ─── */}
            {view === "new" && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      resetForm();
                      setView("list");
                    }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <ChevronRight
                      size={18}
                      color={C.textSecondary}
                      className="rotate-180"
                    />
                  </button>
                  <div>
                    <p
                      className="text-base font-extrabold"
                      style={{ color: C.textPrimary }}
                    >
                      New Report
                    </p>
                    <p className="text-xs" style={{ color: C.textMuted }}>
                      Your report is handled confidentially
                    </p>
                  </div>
                </div>

                {submitError && (
                  <div
                    className="flex items-center gap-2.5 p-3 rounded-xl"
                    style={{
                      background: C.dangerLight,
                      border: `1px solid ${C.danger}33`,
                    }}
                  >
                    <AlertCircle size={16} color={C.danger} />
                    <p
                      className="text-sm flex-1"
                      style={{ color: C.danger }}
                    >
                      {submitError}
                    </p>
                    <button onClick={() => setSubmitError(null)}>
                      <X size={14} color={C.danger} />
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  <FormField label="Category" required error={errors.category}>
                    <SelectField
                      value={form.category}
                      onChange={(v) => setField("category", v)}
                      options={CATEGORY_OPTIONS}
                      placeholder="Select a category…"
                      error={errors.category}
                    />
                  </FormField>

                  <FormField label="Severity" required error={errors.severity}>
                    <SelectField
                      value={form.severity}
                      onChange={(v) => setField("severity", v)}
                      options={SEVERITY_OPTIONS}
                      placeholder="Select severity…"
                      error={errors.severity}
                    />
                  </FormField>

                  <FormField label="Subject" required error={errors.subject}>
                    <input
                      value={form.subject}
                      onChange={(e) => setField("subject", e.target.value)}
                      placeholder="Brief summary of the issue"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                      style={{
                        ...inputStyle,
                        borderColor: errors.subject ? C.danger : C.border,
                      }}
                    />
                  </FormField>

                  <FormField
                    label="Description"
                    required
                    error={errors.description}
                    hint={
                      !errors.description
                        ? "What happened? Be as specific as you can."
                        : undefined
                    }
                  >
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        setField("description", e.target.value)
                      }
                      placeholder="Describe the incident in detail…"
                      rows={5}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
                      style={{
                        ...inputStyle,
                        borderColor: errors.description ? C.danger : C.border,
                      }}
                    />
                  </FormField>
                </div>

                <p
                  className="text-[11px] font-extrabold uppercase tracking-wide"
                  style={{ color: C.textMuted }}
                >
                  Incident Details (optional)
                </p>
                <div className="space-y-4">
                  <FormField label="Incident Date">
                    <input
                      type="date"
                      value={form.incidentDate}
                      onChange={(e) =>
                        setField("incidentDate", e.target.value)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                      style={inputStyle}
                    />
                  </FormField>

                  <FormField label="Location">
                    <input
                      value={form.location}
                      onChange={(e) => setField("location", e.target.value)}
                      placeholder="e.g. 3rd floor office, Lagos HQ"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                      style={inputStyle}
                    />
                  </FormField>

                  <FormField label="Involved Parties">
                    <textarea
                      value={form.involvedParties}
                      onChange={(e) =>
                        setField("involvedParties", e.target.value)
                      }
                      placeholder="Who was involved?"
                      rows={2}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
                      style={inputStyle}
                    />
                  </FormField>

                  <FormField label="Witnesses">
                    <textarea
                      value={form.witnesses}
                      onChange={(e) =>
                        setField("witnesses", e.target.value)
                      }
                      placeholder="Anyone who saw what happened?"
                      rows={2}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
                      style={inputStyle}
                    />
                  </FormField>

                  <FormField label="Desired Outcome">
                    <textarea
                      value={form.desiredOutcome}
                      onChange={(e) =>
                        setField("desiredOutcome", e.target.value)
                      }
                      placeholder="What would you like to see happen?"
                      rows={2}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
                      style={inputStyle}
                    />
                  </FormField>
                </div>

                <label
                  className="flex items-start gap-3 p-3.5 rounded-2xl cursor-pointer"
                  style={{
                    background: C.surfaceAlt,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <Lock
                    size={16}
                    color={C.textSecondary}
                    className="mt-0.5 shrink-0"
                  />
                  <div className="flex-1">
                    <p
                      className="text-sm font-bold"
                      style={{ color: C.textPrimary }}
                    >
                      Submit anonymously
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                      Your name will be hidden from HR. Only a super admin can
                      reveal it, and only for serious cases — every reveal is
                      logged.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isAnonymous}
                    onChange={(e) =>
                      setField("isAnonymous", e.target.checked)
                    }
                    className="mt-1 w-4 h-4 shrink-0"
                    style={{ accentColor: C.primary }}
                  />
                </label>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-extrabold text-white"
                  style={{
                    background: C.primary,
                    opacity: submitting ? 0.8 : 1,
                  }}
                >
                  {submitting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={15} /> Submit Report
                    </>
                  )}
                </button>

                {/* Success modal */}
                <AnimatePresence>
                  {successModal && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/45"
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-4"
                      >
                        <div
                          className="rounded-3xl bg-white p-7 flex flex-col items-center text-center"
                          style={{ border: `1px solid ${C.border}` }}
                        >
                          <div
                            className="w-[60px] h-[60px] rounded-full flex items-center justify-center mb-3"
                            style={{ background: C.success }}
                          >
                            <CheckCircle2 size={32} color="#fff" />
                          </div>
                          <p
                            className="text-base font-extrabold"
                            style={{ color: C.textPrimary }}
                          >
                            Report Submitted
                          </p>
                          {createdRef && (
                            <p
                              className="text-xs font-bold mt-1.5 font-mono"
                              style={{ color: C.primary }}
                            >
                              Reference: {createdRef}
                            </p>
                          )}
                          <p
                            className="text-xs mt-2.5 leading-relaxed"
                            style={{ color: C.textMuted }}
                          >
                            HR has been notified and will review your report. You
                            can track its status from "My Reports".
                          </p>
                          <button
                            onClick={() => {
                              setSuccessModal(false);
                              resetForm();
                              setView("list");
                            }}
                            className="w-full mt-4 py-3 rounded-2xl text-sm font-extrabold text-white"
                            style={{ background: C.primary }}
                          >
                            Done
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ─── DETAIL VIEW ─── */}
            {view === "detail" && selectedId && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setView("list")}
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <ChevronRight
                      size={18}
                      color={C.textSecondary}
                      className="rotate-180"
                    />
                  </button>
                  <div className="flex-1">
                    <p
                      className="text-base font-extrabold font-mono"
                      style={{ color: C.textPrimary }}
                    >
                      {detail?.referenceCode ?? "Report"}
                    </p>
                    <p className="text-xs" style={{ color: C.textMuted }}>
                      Report Details
                    </p>
                  </div>
                  <button
                    onClick={() => openDetail(selectedId)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <RefreshCw size={15} color={C.textSecondary} />
                  </button>
                </div>

                {detailLoading ? (
                  <div className="flex justify-center py-24">
                    <Loader2
                      size={28}
                      className="animate-spin"
                      color={C.primary}
                    />
                  </div>
                ) : detailError || !detail ? (
                  <div className="flex flex-col items-center py-24 gap-2">
                    <AlertCircle size={28} color={C.danger} />
                    <p style={{ color: C.danger }}>
                      {detailError ?? "Report not found."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      className="p-4 rounded-2xl bg-white space-y-3"
                      style={{ border: `1px solid ${C.border}` }}
                    >
                      <div className="flex flex-wrap gap-1.5">
                        <CategoryPill category={detail.category} />
                        <SeverityBadge severity={detail.severity} />
                        <StatusBadge status={detail.status} />
                      </div>
                      <p
                        className="text-base font-extrabold"
                        style={{ color: C.textPrimary }}
                      >
                        {detail.subject}
                      </p>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: C.textSecondary }}
                      >
                        {detail.description}
                      </p>
                      <div
                        className="flex items-center justify-between pt-2"
                        style={{ borderTop: `1px solid ${C.border}` }}
                      >
                        <span
                          className="text-[11px]"
                          style={{ color: C.textMuted }}
                        >
                          Submitted {fmtDate(detail.createdAt)}
                        </span>
                        {detail.isAnonymous && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                            style={{
                              background: C.surfaceAlt,
                              color: C.textMuted,
                            }}
                          >
                            <Lock size={9} /> Submitted anonymously
                          </span>
                        )}
                      </div>
                    </div>

                    {(detail.incidentDate ||
                      detail.location ||
                      detail.involvedParties ||
                      detail.witnesses ||
                      detail.desiredOutcome) && (
                      <div
                        className="p-4 rounded-2xl bg-white space-y-3"
                        style={{ border: `1px solid ${C.border}` }}
                      >
                        <p
                          className="text-xs font-extrabold"
                          style={{ color: C.textPrimary }}
                        >
                          Incident Details
                        </p>
                        {detail.incidentDate && (
                          <div className="flex items-start gap-2.5">
                            <Calendar
                              size={13}
                              color={C.textMuted}
                              className="mt-0.5 shrink-0"
                            />
                            <div>
                              <p
                                className="text-[10px]"
                                style={{ color: C.textMuted }}
                              >
                                Incident Date
                              </p>
                              <p
                                className="text-xs font-semibold mt-0.5"
                                style={{ color: C.textPrimary }}
                              >
                                {detail.incidentDate}
                              </p>
                            </div>
                          </div>
                        )}
                        {detail.location && (
                          <div className="flex items-start gap-2.5">
                            <MapPin
                              size={13}
                              color={C.textMuted}
                              className="mt-0.5 shrink-0"
                            />
                            <div>
                              <p
                                className="text-[10px]"
                                style={{ color: C.textMuted }}
                              >
                                Location
                              </p>
                              <p
                                className="text-xs font-semibold mt-0.5"
                                style={{ color: C.textPrimary }}
                              >
                                {detail.location}
                              </p>
                            </div>
                          </div>
                        )}
                        {detail.involvedParties && (
                          <div className="flex items-start gap-2.5">
                            <Users
                              size={13}
                              color={C.textMuted}
                              className="mt-0.5 shrink-0"
                            />
                            <div>
                              <p
                                className="text-[10px]"
                                style={{ color: C.textMuted }}
                              >
                                Involved Parties
                              </p>
                              <p
                                className="text-xs font-semibold mt-0.5"
                                style={{ color: C.textPrimary }}
                              >
                                {detail.involvedParties}
                              </p>
                            </div>
                          </div>
                        )}
                        {detail.witnesses && (
                          <div className="flex items-start gap-2.5">
                            <FileText
                              size={13}
                              color={C.textMuted}
                              className="mt-0.5 shrink-0"
                            />
                            <div>
                              <p
                                className="text-[10px]"
                                style={{ color: C.textMuted }}
                              >
                                Witnesses
                              </p>
                              <p
                                className="text-xs font-semibold mt-0.5"
                                style={{ color: C.textPrimary }}
                              >
                                {detail.witnesses}
                              </p>
                            </div>
                          </div>
                        )}
                        {detail.desiredOutcome && (
                          <div className="flex items-start gap-2.5">
                            <Target
                              size={13}
                              color={C.textMuted}
                              className="mt-0.5 shrink-0"
                            />
                            <div>
                              <p
                                className="text-[10px]"
                                style={{ color: C.textMuted }}
                              >
                                Desired Outcome
                              </p>
                              <p
                                className="text-xs font-semibold mt-0.5"
                                style={{ color: C.textPrimary }}
                              >
                                {detail.desiredOutcome}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {detail.assignedTo && (
                      <div
                        className="p-4 rounded-2xl bg-white space-y-3"
                        style={{ border: `1px solid ${C.border}` }}
                      >
                        <p
                          className="text-xs font-extrabold"
                          style={{ color: C.textPrimary }}
                        >
                          Handled By
                        </p>
                        <div className="flex items-center gap-2.5">
                          <ReportAvatar
                            initials={getInitials(detail.assignedTo.name)}
                            size={34}
                          />
                          <p
                            className="text-sm font-extrabold"
                            style={{ color: C.textPrimary }}
                          >
                            {detail.assignedTo.name}
                          </p>
                        </div>
                      </div>
                    )}

                    <div
                      className="p-4 rounded-2xl bg-white space-y-3"
                      style={{ border: `1px solid ${C.border}` }}
                    >
                      <p
                        className="text-xs font-extrabold"
                        style={{ color: C.textPrimary }}
                      >
                        Updates
                      </p>
                      {(detail.notes ?? []).length === 0 ? (
                        <p
                          className="text-xs leading-relaxed"
                          style={{ color: C.textMuted }}
                        >
                          No updates yet. HR will post updates here as your
                          report is reviewed.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {detail.notes.map((n) => (
                            <div
                              key={n.id}
                              className="flex gap-2.5 items-start"
                            >
                              <div
                                className="w-[26px] h-[26px] rounded-full flex items-center justify-center shrink-0"
                                style={{
                                  background: n.isStatusChange
                                    ? C.primaryLight
                                    : C.surfaceAlt,
                                }}
                              >
                                <MessageSquarePlus
                                  size={12}
                                  color={
                                    n.isStatusChange
                                      ? C.primary
                                      : C.textMuted
                                  }
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-xs leading-relaxed"
                                  style={{ color: C.textPrimary }}
                                >
                                  {n.note}
                                </p>
                                <p
                                  className="text-[10px] mt-1"
                                  style={{ color: C.textMuted }}
                                >
                                  {fmtDateTime(n.createdAt)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
