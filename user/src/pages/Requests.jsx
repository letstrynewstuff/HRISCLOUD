

// src/pages/employee/Requests.jsx
// Employee "My Requests" page — tracks all leave requests + status updates
// Production-ready — zero mock data
// Wired to: /auth/me, /leave/requests/me, /leave/balances/me, /leave/policies

import { useState, useEffect, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
// import SideNavbar from "../components/SideNavbar";
import {
  FileText, Search, Menu, Filter, RefreshCw, AlertCircle,
  CheckCircle2, XCircle, Clock, Calendar, ChevronRight,
  Plus, X, Eye, Download, Plane, Heart, Coffee, Briefcase,
  Users, Umbrella, Loader2, Bell,
} from "lucide-react";
import  C  from "../styles/colors";
import { authApi }  from "../api/service/authApi";
import { leaveApi } from "../api/service/leaveApi";

/* ─── Animations ─── */
const fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.38, ease: [0.22,1,0.36,1] } }),
};

/* ─── Skeleton ─── */
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-xl ${className}`} style={{ background: "#E8EBF4" }} />
);

/* ─── Status badge ─── */
function StatusBadge({ status }) {
  const map = {
    approved:  { label: "Approved",  bg: C.successLight, color: C.success,   icon: CheckCircle2 },
    pending:   { label: "Pending",   bg: C.warningLight, color: C.warning,   icon: Clock        },
    rejected:  { label: "Rejected",  bg: C.dangerLight,  color: C.danger,    icon: XCircle      },
    cancelled: { label: "Cancelled", bg: C.surfaceAlt,   color: C.textMuted, icon: XCircle      },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.color }}>
      <s.icon size={10} />{s.label}
    </span>
  );
}

/* ─── Leave icon ─── */
const LEAVE_META = {
  annual:        { icon: Plane,     color: "#4F46E5", bg: "#EEF2FF" },
  sick:          { icon: Heart,     color: "#EF4444", bg: "#FEE2E2" },
  casual:        { icon: Coffee,    color: "#10B981", bg: "#D1FAE5" },
  compassionate: { icon: Users,     color: "#06B6D4", bg: "#ECFEFF" },
  study:         { icon: Briefcase, color: "#F59E0B", bg: "#FEF3C7" },
  maternity:     { icon: Users,     color: "#EC4899", bg: "#FDF2F8" },
  paternity:     { icon: Users,     color: "#7C3AED", bg: "#EDE9FE" },
  unpaid:        { icon: Umbrella,  color: "#94A3B8", bg: "#F7F8FC" },
};
const getMeta = (lt) => LEAVE_META[lt?.toLowerCase()] ?? { icon: Calendar, color: "#4F46E5", bg: "#EEF2FF" };

/* ─── Detail modal ─── */
function RequestDetailModal({ req, onClose }) {
  const meta = getMeta(req.leave_type);
  return (
    <>
      <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <Motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.3, ease: [0.22,1,0.36,1] }}
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4">
        <div className="rounded-2xl bg-white shadow-2xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
          {/* Header */}
          <div className="p-5 flex items-start justify-between" style={{ background: meta.bg }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.6)" }}>
                <meta.icon size={18} color={meta.color} />
              </div>
              <div>
                <p className="font-bold" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>
                  {req.policy_name ?? req.leave_type ?? "Leave Request"}
                </p>
                <p className="text-xs" style={{ color: C.textSecondary }}>{req.id?.slice(0,8).toUpperCase()}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg" style={{ background: "rgba(0,0,0,0.08)" }}>
              <X size={16} color={C.textSecondary} />
            </button>
          </div>
          {/* Body */}
          <div className="p-5 space-y-3">
            <StatusBadge status={req.status} />
            {req.rejection_reason && (
              <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: C.dangerLight }}>
                <AlertCircle size={13} color={C.danger} className="mt-0.5 shrink-0" />
                <p className="text-xs" style={{ color: C.danger }}>{req.rejection_reason}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Start Date",  value: new Date(req.start_date).toLocaleDateString("en-NG", { weekday:"short", month:"short", day:"numeric" }) },
                { label: "End Date",    value: new Date(req.end_date).toLocaleDateString("en-NG",   { weekday:"short", month:"short", day:"numeric" }) },
                { label: "Duration",   value: `${req.days} working day${req.days !== 1 ? "s" : ""}` },
                { label: "Approver",   value: req.approved_by_name ?? "Pending" },
                { label: "Applied On", value: new Date(req.created_at).toLocaleDateString("en-NG", { month:"short", day:"numeric", year:"numeric" }) },
                { label: "Reason",     value: req.reason ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 rounded-xl" style={{ background: C.surfaceAlt }}>
                  <p className="text-[10px]" style={{ color: C.textMuted }}>{label}</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: C.textPrimary }}>{value}</p>
                </div>
              ))}
            </div>
            {req.is_paid !== null && req.is_paid !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: req.is_paid ? C.successLight : C.surfaceAlt, color: req.is_paid ? C.success : C.textMuted }}>
                  {req.is_paid ? "Paid Leave" : "Unpaid Leave"}
                </span>
              </div>
            )}
          </div>
        </div>
      </Motion.div>
    </>
  );
}

/* ════════════════════════ MAIN ════════════════════════ */
export default function RequestsPage() {
  /* ── Auth ── */
  const [profile,     setProfile]     = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* ── Data ── */
  const [requests,  setRequests]  = useState([]);
  const [balances,  setBalances]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  /* ── UI ── */
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [filterStatus,  setFilterStatus]  = useState("All");
  const [selectedReq,   setSelectedReq]   = useState(null);

  /* ── Profile ── */
  useEffect(() => {
    authApi.getMe()
      .then(r => setProfile(r.data ?? r))
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  /* ── Fetch ── */
  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [reqRes, balRes] = await Promise.all([
        leaveApi.getMyRequests(),
        leaveApi.getMyBalances(),
      ]);
      setRequests(reqRes.data ?? []);
      setBalances(balRes.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load your requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Derived ── */
  const filtered = requests.filter(req => {
    const statusMatch = filterStatus === "All" || req.status === filterStatus.toLowerCase();
    const searchMatch = !searchQuery ||
      (req.policy_name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.leave_type  ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.reason      ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const stats = {
    total:    requests.length,
    pending:  requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  const initials = profile ? ((profile.first_name?.[0] ?? "") + (profile.last_name?.[0] ?? "")).toUpperCase() : "..";

  /* ─────────────────────── RENDER ─────────────────────── */
  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.textPrimary, fontFamily: "'DM Sans','Sora',sans-serif" }}>
      <div className="flex h-screen overflow-hidden">
        {/* <SideNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} COLORS={C}
          EMPLOYEE={{ name: authLoading ? "…" : `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim(),
            role: profile?.job_role_name ?? "—", department: profile?.department_name ?? "—", initials, id: profile?.employee_code ?? "—" }} /> */}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* ── TOP NAV ── */}
          <header className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{ background: "rgba(240,242,248,0.85)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}` }}>
            <Motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(p => !p)}
              className="p-2 rounded-xl hidden md:flex" style={{ background: C.surface }}>
              <Menu size={16} color={C.textSecondary} />
            </Motion.button>

            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" color={C.textMuted} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
                placeholder="Search requests…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{ background: C.surface, border: `1.5px solid ${searchFocused ? C.primary : C.border}`, color: C.textPrimary,
                  boxShadow: searchFocused ? `0 0 0 3px ${C.primaryLight}` : "none" }} />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={loadData} className="p-2 rounded-xl" style={{ background: C.surface, border: `1px solid ${C.border}` }} title="Refresh">
                <RefreshCw size={14} color={C.textSecondary} />
              </Motion.button>
              <Motion.a href="/leave" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white"
                style={{ background: C.primary, boxShadow: `0 4px 12px ${C.primary}44` }}>
                <Plus size={13} />New Request
              </Motion.a>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: "linear-gradient(135deg,#6366F1,#06B6D4)" }}>
                {authLoading ? "…" : initials}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-5">

            {/* ── HERO ── */}
            <Motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
              className="relative rounded-2xl overflow-hidden p-6 md:p-8"
              style={{ background: "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)", minHeight: 140 }}>
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full opacity-10"
                  style={{ background: "radial-gradient(circle,#818CF8,transparent)" }} />
              </div>
              <div className="relative flex flex-col md:flex-row md:items-center gap-5">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                    <FileText size={22} color="#fff" />
                  </div>
                  <div>
                    <h1 className="text-white text-2xl md:text-3xl font-bold" style={{ fontFamily: "Sora,sans-serif" }}>My Requests</h1>
                    <p className="text-indigo-300 text-sm mt-0.5">Track all your leave requests and their status</p>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { label: "Total",    value: loading ? "—" : stats.total,    color: "#A5F3FC" },
                    { label: "Pending",  value: loading ? "—" : stats.pending,  color: "#FDE68A" },
                    { label: "Approved", value: loading ? "—" : stats.approved, color: "#BBF7D0" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="px-4 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.10)" }}>
                      <p className="text-2xl font-bold" style={{ color, fontFamily: "Sora,sans-serif" }}>{value}</p>
                      <p className="text-[11px] text-white/60">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Motion.div>

            {/* ── LEAVE BALANCE CARDS ── */}
            {!loading && balances.length > 0 && (
              <Motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.5}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {balances.map((bal, i) => {
                  const meta = getMeta(bal.leave_type);
                  const remaining = Number(bal.remaining_days ?? 0);
                  const total     = Number(bal.entitled_days ?? 0);
                  const pct       = total > 0 ? (remaining / total) * 100 : 0;
                  return (
                    <Motion.div key={bal.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-2xl p-3.5 text-center border" style={{ background: C.surface, borderColor: C.border }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: meta.bg }}>
                        <meta.icon size={14} color={meta.color} />
                      </div>
                      <p className="text-xl font-bold" style={{ color: remaining === 0 ? C.danger : C.textPrimary, fontFamily: "Sora,sans-serif" }}>{remaining}</p>
                      <p className="text-[10px] leading-tight mt-0.5" style={{ color: C.textMuted }}>
                        {bal.policy_name?.replace(" Leave", "") ?? bal.leave_type}
                      </p>
                      <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: C.border }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: remaining === 0 ? C.danger : meta.color }} />
                      </div>
                    </Motion.div>
                  );
                })}
              </Motion.div>
            )}

            {/* ── FILTER + SEARCH ── */}
            <Motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
              <div className="rounded-2xl p-4 border flex flex-wrap items-center gap-3" style={{ background: C.surface, borderColor: C.border }}>
                <div className="flex items-center gap-2">
                  <Filter size={13} color={C.textMuted} />
                  <span className="text-xs font-semibold" style={{ color: C.textMuted }}>Status:</span>
                </div>
                {["All", "Pending", "Approved", "Rejected", "Cancelled"].map(f => (
                  <Motion.button key={f} whileTap={{ scale: 0.95 }} onClick={() => setFilterStatus(f)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: filterStatus === f ? C.primary : C.surfaceAlt, color: filterStatus === f ? "#fff" : C.textSecondary,
                      border: `1px solid ${filterStatus === f ? C.primary : C.border}` }}>
                    {f}
                    {f === "Pending" && stats.pending > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                        style={{ background: filterStatus === "Pending" ? "rgba(255,255,255,0.3)" : C.warning, color: filterStatus === "Pending" ? "#fff" : "#fff" }}>
                        {stats.pending}
                      </span>
                    )}
                  </Motion.button>
                ))}
                <span className="ml-auto text-xs" style={{ color: C.textMuted }}>
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>
            </Motion.div>

            {/* ── Error ── */}
            <AnimatePresence>
              {error && (
                <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{ background: C.dangerLight, border: `1px solid ${C.danger}33` }}>
                  <AlertCircle size={15} color={C.danger} />
                  <p className="text-sm flex-1" style={{ color: C.danger }}>{error}</p>
                  <button onClick={loadData} className="text-xs font-semibold flex items-center gap-1" style={{ color: C.danger }}>
                    <RefreshCw size={12} />Retry
                  </button>
                </Motion.div>
              )}
            </AnimatePresence>

            {/* ── REQUESTS LIST ── */}
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="rounded-2xl p-4 border" style={{ background: C.surface, borderColor: C.border }}>
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20">
                <FileText size={40} color={C.textMuted} />
                <p className="font-semibold" style={{ color: C.textPrimary }}>
                  {searchQuery || filterStatus !== "All" ? "No matching requests" : "No leave requests yet"}
                </p>
                <p className="text-sm" style={{ color: C.textMuted }}>
                  {searchQuery ? "Try a different search" : filterStatus !== "All" ? "Try a different filter" : "Apply for leave to see your requests here."}
                </p>
                {!searchQuery && filterStatus === "All" && (
                  <Motion.a href="/leave" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white mt-2"
                    style={{ background: C.primary }}>
                    <Plus size={14} />Apply for Leave
                  </Motion.a>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {filtered.map((req, i) => {
                    const meta = getMeta(req.leave_type);
                    return (
                      <Motion.div key={req.id}
                        variants={fadeUp} initial="hidden" animate="visible" custom={i}
                        exit={{ opacity: 0, x: -10 }}
                        whileHover={{ y: -1, boxShadow: "0 6px 24px rgba(79,70,229,0.08)" }}
                        onClick={() => setSelectedReq(req)}
                        className="rounded-2xl border cursor-pointer group overflow-hidden"
                        style={{ background: C.surface, borderColor: C.border }}>
                        {/* Status stripe */}
                        <div className="h-0.5" style={{
                          background: req.status === "approved" ? C.success : req.status === "rejected" ? C.danger : req.status === "cancelled" ? C.border : C.warning
                        }} />
                        <div className="p-4 flex items-start gap-3">
                          {/* Icon */}
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: meta.bg }}>
                            <meta.icon size={17} color={meta.color} />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
                                {req.policy_name ?? req.leave_type ?? "Leave Request"}
                              </p>
                              <StatusBadge status={req.status} />
                              {req.is_paid === false && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                  style={{ background: C.surfaceAlt, color: C.textMuted, border: `1px solid ${C.border}` }}>Unpaid</span>
                              )}
                            </div>
                            <p className="text-xs" style={{ color: C.textMuted }}>
                              <span className="font-semibold" style={{ color: C.textSecondary }}>
                                {new Date(req.start_date).toLocaleDateString("en-NG", { weekday:"short", month:"short", day:"numeric" })}
                              </span>
                              {" — "}
                              <span className="font-semibold" style={{ color: C.textSecondary }}>
                                {new Date(req.end_date).toLocaleDateString("en-NG", { weekday:"short", month:"short", day:"numeric" })}
                              </span>
                              <span className="ml-1">· <strong>{req.days} day{req.days !== 1 ? "s" : ""}</strong></span>
                            </p>

                            {/* Reason snippet */}
                            {req.reason && (
                              <p className="text-[11px] mt-1 line-clamp-1" style={{ color: C.textMuted }}>
                                "{req.reason}"
                              </p>
                            )}

                            {/* Rejection reason */}
                            {req.rejection_reason && (
                              <div className="mt-2 flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg"
                                style={{ background: C.dangerLight, color: C.danger }}>
                                <AlertCircle size={11} />
                                <span className="line-clamp-1">{req.rejection_reason}</span>
                              </div>
                            )}
                          </div>

                          {/* Right meta */}
                          <div className="shrink-0 text-right">
                            <p className="text-[10px]" style={{ color: C.textMuted }}>
                              Applied {new Date(req.created_at).toLocaleDateString("en-NG", { month:"short", day:"numeric" })}
                            </p>
                            {req.approved_by_name && req.status === "approved" && (
                              <p className="text-[10px] mt-0.5" style={{ color: C.success }}>
                                ✓ {req.approved_by_name}
                              </p>
                            )}
                            <Eye size={14} color={C.textMuted} className="mt-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </Motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* ── New request CTA ── */}
            {!loading && requests.length > 0 && (
              <Motion.div variants={fadeUp} initial="hidden" animate="visible" custom={filtered.length + 1}>
                <div className="rounded-2xl p-5 border text-center" style={{ background: C.surface, borderColor: C.border }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: C.textPrimary }}>Need more time off?</p>
                  <p className="text-xs mb-4" style={{ color: C.textMuted }}>
                    You have {balances.reduce((s,b) => s + Number(b.remaining_days ?? 0), 0)} days available across all leave types.
                  </p>
                  <Motion.a href="/leave" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: C.primary }}>
                    <Plus size={14} />Apply for Leave
                  </Motion.a>
                </div>
              </Motion.div>
            )}

            <div className="h-4" />
          </main>
        </div>
      </div>

      {/* ── Detail modal ── */}
      <AnimatePresence>
        {selectedReq && <RequestDetailModal req={selectedReq} onClose={() => setSelectedReq(null)} />}
      </AnimatePresence>
    </div>
  );
}