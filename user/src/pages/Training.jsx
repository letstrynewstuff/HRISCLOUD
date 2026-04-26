

// src/pages/employee/Training.jsx
// Employee training portal — my trainings, certificates, progress
// Connects to: GET /api/trainings/my  +  GET /api/auth/me

import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import SideNavbar from "../components/sideNavbar";
import {
  BookOpen, Bell, Search, Menu, Award, CheckCircle2,
  Clock, ChevronRight, Download, AlertTriangle,
  TrendingUp, X, BarChart2, Loader2, GraduationCap,
  Sparkles, Timer, ArrowRight, RefreshCw, ExternalLink,
  BookMarked, Target, Trophy, AlertCircle,
} from "lucide-react";
import { getMyTrainings, getTrainingDashboard } from "../api/service/trainingApi";
import { authApi } from "../api/service/authApi";
import C from "../styles/colors";

/* ─── Helpers ─── */
const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  }),
};

function statusConfig(training) {
  const enrollment = training.enrollment_status ?? training.enrollmentStatus;
  const attendance = training.attendance_status ?? training.attendanceStatus;
  const trainingStatus = training.training_status ?? training.status;

  if (attendance === "attended" || enrollment === "completed" || trainingStatus === "completed") {
    return { label: "Completed", bg: C.successLight, color: C.success,  icon: CheckCircle2 };
  }
  if (trainingStatus === "ongoing" || enrollment === "enrolled") {
    return { label: "In Progress", bg: C.primaryLight, color: C.primary, icon: Clock };
  }
  if (trainingStatus === "upcoming") {
    return { label: "Upcoming", bg: "#FEF3C7", color: "#F59E0B", icon: Timer };
  }
  if (trainingStatus === "cancelled") {
    return { label: "Cancelled", bg: "#FEE2E2", color: "#EF4444", icon: X };
  }
  return { label: enrollment ?? trainingStatus ?? "Enrolled", bg: C.surfaceAlt, color: C.textMuted, icon: BookOpen };
}

function typeColor(type) {
  return type === "Internal"
    ? { bg: "#EDE9FE", color: "#7C3AED" }
    : { bg: "#ECFEFF",  color: "#0891B2" };
}

function initials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

/* ─── Training Card ─── */
function TrainingCard({ training, index, onOpen }) {
  const status  = statusConfig(training);
  const typeCfg = typeColor(training.type);
  const StatusIcon = status.icon;
  const hasCert = training.certificate_issued ?? training.certificateIssued;
  const startDate = training.start_date ?? training.startDate;
  const endDate   = training.end_date   ?? training.endDate;

  return (
    <Motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(79,70,229,0.10)" }}
      onClick={() => onOpen(training)}
      className="rounded-2xl p-5 cursor-pointer"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: typeCfg.bg, color: typeCfg.color }}
          >
            {training.type ?? "—"}
          </span>
          {training.mandatory && (
            <span
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
              style={{ background: "#FEE2E2", color: "#EF4444" }}
            >
              Mandatory
            </span>
          )}
          {hasCert && (
            <span
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: "#FEF3C7", color: "#D97706" }}
            >
              <Award size={9} /> Certified
            </span>
          )}
        </div>
        <span
          className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0"
          style={{ background: status.bg, color: status.color }}
        >
          <StatusIcon size={10} />
          {status.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-sm mb-1 line-clamp-2" style={{ color: C.textPrimary }}>
        {training.title}
      </h3>
      <p className="text-xs mb-3" style={{ color: C.textMuted }}>
        {training.provider ?? "—"}
      </p>

      {/* Dates */}
      <div className="flex items-center justify-between text-xs" style={{ color: C.textSecondary }}>
        <span>
          {startDate ? new Date(startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "TBD"}
          {endDate ? ` → ${new Date(endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}` : ""}
        </span>
        {training.location && (
          <span className="text-[11px] font-medium truncate max-w-[120px]" style={{ color: C.textMuted }}>
            📍 {training.location}
          </span>
        )}
      </div>

      {/* Certificate link */}
      {hasCert && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#D97706" }}>
          <Award size={12} />
          Certificate issued {training.completed_at ? `· ${new Date(training.completed_at).toLocaleDateString("en-GB")}` : ""}
        </div>
      )}
    </Motion.div>
  );
}

/* ════ MAIN ════ */
export default function TrainingPage() {
  const [employee,     setEmployee]     = useState(null);
  const [trainings,    setTrainings]    = useState([]);
  const [dashboard,    setDashboard]    = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [searchFocused,setSearchFocused]= useState(false);
  const [activeTab,    setActiveTab]    = useState("my");   // my | certificates | overview
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected,     setSelected]     = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [me, myRes, dashRes] = await Promise.all([
          authApi.getMe(),
          getMyTrainings(),
          getTrainingDashboard(),
        ]);
        setEmployee(me);
        setTrainings(myRes.data ?? []);
        setDashboard(dashRes.data ?? null);
      } catch {
        setError("Failed to load training data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ─── Derived ─── */
  const completed   = trainings.filter((t) => statusConfig(t).label === "Completed");
  const inProgress  = trainings.filter((t) => statusConfig(t).label === "In Progress");
  const upcoming    = trainings.filter((t) => statusConfig(t).label === "Upcoming");
  const withCerts   = trainings.filter((t) => t.certificate_issued ?? t.certificateIssued);

  const filtered = trainings.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchQ = !q || (t.title ?? "").toLowerCase().includes(q) || (t.provider ?? "").toLowerCase().includes(q);
    const matchS = filterStatus === "all" || statusConfig(t).label.toLowerCase() === filterStatus;
    return matchQ && matchS;
  });

  const empInitials = (me) => me ? `${me.firstName?.[0] ?? ""}${me.lastName?.[0] ?? ""}`.toUpperCase() : "?";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
      <RefreshCw size={26} className="animate-spin" style={{ color: C.primary }} />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
      <div className="text-center space-y-3">
        <AlertCircle size={32} style={{ color: C.danger, margin: "0 auto" }} />
        <p style={{ color: C.danger }}>{error}</p>
        <button onClick={() => window.location.reload()} className="text-sm underline" style={{ color: C.primary }}>Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: "'DM Sans','Sora',sans-serif" }}>
      <div className="flex h-screen overflow-hidden">
        <SideNavbar sidebarOpen={sidebarOpen} employee={employee} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header
            className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{ background: "rgba(240,242,248,0.9)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}` }}
          >
            <Motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen((p) => !p)}
              className="p-2 rounded-xl hidden md:flex"
              style={{ background: C.surface }}
            >
              <Menu size={16} color={C.textSecondary} />
            </Motion.button>

            <Motion.div
              className="flex-1 max-w-xs relative"
              animate={{ width: searchFocused ? "320px" : "240px" }}
              transition={{ duration: 0.3 }}
            >
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" color={C.textMuted} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search trainings…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{ background: C.surface, border: `1.5px solid ${searchFocused ? C.primary : C.border}`, color: C.textPrimary }}
              />
            </Motion.div>

            <div className="ml-auto flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: "linear-gradient(135deg,#4F46E5,#06B6D4)" }}
              >
                {empInitials(employee)}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
            {/* Hero */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-8 text-white"
              style={{ background: "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)" }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/15">
                  <GraduationCap size={28} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold" style={{ fontFamily: "Sora,sans-serif" }}>
                    My Training Portal
                  </h1>
                  <p className="text-indigo-200">
                    {employee ? `${employee.firstName} ${employee.lastName}` : ""}
                  </p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Assigned",    value: trainings.length    },
                  { label: "Completed",   value: completed.length    },
                  { label: "In Progress", value: inProgress.length   },
                  { label: "Certificates",value: withCerts.length    },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl px-4 py-3 bg-white/10 backdrop-blur-sm">
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-indigo-200">{s.label}</p>
                  </div>
                ))}
              </div>
            </Motion.div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-2xl border" style={{ background: C.surface, borderColor: C.border }}>
              {[
                { id: "my",           label: "My Trainings"  },
                { id: "certificates", label: "Certificates"  },
                { id: "overview",     label: "Overview"      },
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="px-5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
                    style={{
                      background: active ? C.primary : "transparent",
                      color:      active ? "#fff"    : C.textSecondary,
                      boxShadow:  active ? "0 2px 8px rgba(79,70,229,0.25)" : "none",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* ── MY TRAININGS TAB ── */}
            {activeTab === "my" && (
              <>
                {/* Filter pills */}
                <div className="flex flex-wrap gap-2">
                  {["all","completed","in progress","upcoming","cancelled"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all"
                      style={{
                        background: filterStatus === s ? C.primary : C.surfaceAlt,
                        color:      filterStatus === s ? "#fff"    : C.textSecondary,
                        border: `1px solid ${filterStatus === s ? C.primary : C.border}`,
                      }}
                    >
                      {s === "all" ? "All" : s}
                    </button>
                  ))}
                </div>

                {filtered.length === 0 ? (
                  <div className="py-16 flex flex-col items-center gap-3">
                    <BookOpen size={36} style={{ color: C.textMuted }} />
                    <p className="text-sm" style={{ color: C.textMuted }}>
                      {searchQuery ? "No trainings match your search." : "No trainings assigned yet."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((t, i) => (
                      <TrainingCard key={t.id} training={t} index={i} onOpen={setSelected} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── CERTIFICATES TAB ── */}
            {activeTab === "certificates" && (
              <Motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: C.surface, border: `1px solid ${C.border}` }}
              >
                <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <Award size={16} color="#D97706" />
                  <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
                    My Certificates ({withCerts.length})
                  </p>
                </div>
                {withCerts.length === 0 ? (
                  <div className="py-12 flex flex-col items-center gap-2">
                    <Trophy size={32} style={{ color: C.textMuted }} />
                    <p className="text-sm" style={{ color: C.textMuted }}>No certificates issued yet.</p>
                    <p className="text-xs" style={{ color: C.textMuted }}>Complete a training to earn your certificate.</p>
                  </div>
                ) : (
                  <div className="divide-y" style={{ borderColor: C.border }}>
                    {withCerts.map((t, i) => (
                      <Motion.div
                        key={t.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="px-5 py-4 flex items-center gap-4"
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FEF3C7" }}>
                          <Award size={18} color="#D97706" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate" style={{ color: C.textPrimary }}>{t.title}</p>
                          <p className="text-xs" style={{ color: C.textMuted }}>
                            {t.provider ?? "—"} ·{" "}
                            {t.completed_at ? new Date(t.completed_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Date unknown"}
                          </p>
                        </div>
                        <span
                          className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                          style={{ background: "#FEF3C7", color: "#D97706" }}
                        >
                          Certified
                        </span>
                      </Motion.div>
                    ))}
                  </div>
                )}
              </Motion.div>
            )}

            {/* ── OVERVIEW TAB ── */}
            {activeTab === "overview" && dashboard && (
              <Motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* Company-wide stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Trainings",  value: dashboard.totalTrainings,  color: C.primary,  light: C.primaryLight, icon: BookOpen    },
                    { label: "Employees Trained", value: dashboard.employeesTrained,color: C.success,  light: C.successLight, icon: TrendingUp  },
                    { label: "Completion Rate",  value: `${dashboard.completionRate}%`, color: "#8B5CF6", light: "#EDE9FE",  icon: Target      },
                    { label: "Upcoming",         value: dashboard.upcomingCount,   color: "#F59E0B",  light: "#FEF3C7",    icon: Timer       },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <Motion.div
                        key={s.label}
                        custom={i} variants={fadeUp} initial="hidden" animate="visible"
                        className="rounded-2xl p-5"
                        style={{ background: C.surface, border: `1px solid ${C.border}` }}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.light }}>
                          <Icon size={18} color={s.color} />
                        </div>
                        <p className="text-xl font-bold" style={{ color: C.textPrimary }}>{s.value}</p>
                        <p className="text-xs" style={{ color: C.textSecondary }}>{s.label}</p>
                      </Motion.div>
                    );
                  })}
                </div>

                {/* Upcoming trainings from dashboard */}
                {(dashboard.upcoming ?? []).length > 0 && (
                  <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div className="px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                      <p className="font-bold text-sm" style={{ color: C.textPrimary }}>Upcoming Company Trainings</p>
                    </div>
                    <div className="divide-y" style={{ borderColor: C.border }}>
                      {dashboard.upcoming.map((t, i) => (
                        <div key={t.id} className="px-5 py-3.5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: C.primaryLight }}>
                            <BookOpen size={14} color={C.primary} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: C.textPrimary }}>{t.title}</p>
                            <p className="text-xs" style={{ color: C.textMuted }}>
                              {t.start_date ? new Date(t.start_date).toLocaleDateString("en-GB") : "TBD"} · {t.enrolled_count ?? 0}/{t.max_attendees ?? "∞"} enrolled
                            </p>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FEF3C7", color: "#F59E0B" }}>
                            {t.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Motion.div>
            )}
          </main>
        </div>
      </div>

      {/* ── Training Detail Modal ── */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1,    opacity: 1 }}
              exit={{   scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              {/* Modal header */}
              <div
                className="px-6 py-5"
                style={{ background: "linear-gradient(135deg,#1E1B4B,#312E81)", color: "#fff" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-bold text-lg leading-snug" style={{ fontFamily: "Sora,sans-serif" }}>
                      {selected.title}
                    </p>
                    <p className="text-indigo-200 text-sm mt-1">{selected.provider ?? "—"}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-2 rounded-xl bg-white/15 shrink-0">
                    <X size={15} color="#fff" />
                  </button>
                </div>
              </div>

              {/* Modal body */}
              <div className="p-6 space-y-4">
                {/* Status + type row */}
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const st = statusConfig(selected);
                    const Icon = st.icon;
                    return (
                      <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>
                        <Icon size={11} /> {st.label}
                      </span>
                    );
                  })()}
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={typeColor(selected.type)}>
                    {selected.type}
                  </span>
                  {selected.mandatory && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "#FEE2E2", color: "#EF4444" }}>
                      Mandatory
                    </span>
                  )}
                </div>

                {/* Description */}
                {selected.description && (
                  <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>{selected.description}</p>
                )}

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { label: "Start Date",  value: selected.start_date ? new Date(selected.start_date).toLocaleDateString("en-GB") : "TBD" },
                    { label: "End Date",    value: selected.end_date   ? new Date(selected.end_date).toLocaleDateString("en-GB")   : "TBD" },
                    { label: "Location",    value: selected.location   ?? "Remote / TBD" },
                    { label: "Enrolled",    value: selected.enrolled_at ? new Date(selected.enrolled_at).toLocaleDateString("en-GB") : "—" },
                  ].map((d) => (
                    <div key={d.label} className="rounded-xl p-3" style={{ background: C.surfaceAlt }}>
                      <p style={{ color: C.textMuted }}>{d.label}</p>
                      <p className="font-semibold mt-0.5" style={{ color: C.textPrimary }}>{d.value}</p>
                    </div>
                  ))}
                </div>

                {/* Certificate */}
                {(selected.certificate_issued ?? selected.certificateIssued) && (
                  <div
                    className="rounded-xl p-4 flex items-center gap-3"
                    style={{ background: "#FEF3C7", border: "1px solid #FCD34D" }}
                  >
                    <Award size={20} color="#D97706" />
                    <div>
                      <p className="font-bold text-sm" style={{ color: "#92400E" }}>Certificate Issued</p>
                      <p className="text-xs" style={{ color: "#B45309" }}>
                        {selected.completed_at ? new Date(selected.completed_at).toLocaleDateString("en-GB", { dateStyle: "long" }) : ""}
                      </p>
                    </div>
                  </div>
                )}

                {/* External link */}
                {selected.link && (
                  <a
                    href={selected.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ background: C.primary }}
                  >
                    <ExternalLink size={14} /> Open Training Link
                  </a>
                )}

                <button
                  onClick={() => setSelected(null)}
                  className="w-full py-3 rounded-xl text-sm font-semibold"
                  style={{ background: C.surfaceAlt, color: C.textSecondary }}
                >
                  Close
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}