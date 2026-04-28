// src/pages/Benefits.jsx
// Employee self-service benefits page.
// All data from API — zero mock data.
// motion aliased as Motion throughout.

import { useState, useEffect, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";

// import SideNavbar from "../components/SideNavbar";
import {
  Heart,
  Shield,
  Users,
  Download,
  Eye,
  Plus,
  Award,
  Clock,
  CheckCircle2,
  Phone,
  TrendingUp,
  Menu,
  Bell,
  Search,
  ChevronDown,
  FileText,
  RefreshCw,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import C from "../styles/colors";
import { benefitsApi } from "../api/service/benefitsApi";
import { authApi } from "../api/service/authApi";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45 },
  }),
};

// ── Benefit type config ───────────────────────────────────────
const BENEFIT_ICONS = {
  insurance: { icon: Heart, color: C.danger, bg: C.dangerLight },
  allowance: { icon: TrendingUp, color: C.success, bg: C.successLight },
  pension: { icon: Award, color: C.primary, bg: C.primaryLight },
  health: { icon: Shield, color: "#2563EB", bg: "#DBEAFE" },
  custom: { icon: FileText, color: C.accent, bg: C.accentLight },
};
const getBenefitIcon = (type) =>
  BENEFIT_ICONS[type?.toLowerCase()] ?? {
    icon: FileText,
    color: C.textMuted,
    bg: C.surfaceAlt,
  };

// ── Skeleton ──────────────────────────────────────────────────
function Skeleton({ h = 16, w = "100%", rounded = "10px" }) {
  return (
    <div
      style={{
        height: h,
        width: w,
        borderRadius: rounded,
        background:
          "linear-gradient(90deg,#E4E7F0 25%,#F0F2F8 50%,#E4E7F0 75%)",
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
  const Icon = type === "success" ? CheckCircle2 : AlertTriangle;
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

// ── Status badge ──────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    active: { bg: C.successLight, color: C.success },
    inactive: { bg: C.dangerLight, color: C.danger },
    pending: { bg: C.warningLight, color: C.warning },
  }[status?.toLowerCase()] ?? { bg: C.surfaceAlt, color: C.textMuted };
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {status}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
export default function BenefitsPage() {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [expandedHowTo, setExpandedHowTo] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch current user from /auth/me
      const me = await authApi.getMe();
      setUser(me);

      // 2. Fetch employee profile (contains employee_id)
      // The employeeId comes from me.employee_id or via /employees/me
      const empId = me.employee_id ?? me.employeeId;
      if (!empId)
        throw new Error("No employee profile linked to this account.");

      setEmployee({
        id: empId,
        name: `${me.firstName ?? me.first_name} ${me.lastName ?? me.last_name}`,
        initials:
          `${(me.firstName ?? me.first_name ?? "?")[0]}${(me.lastName ?? me.last_name ?? "?")[0]}`.toUpperCase(),
        role: me.role,
        department: me.company?.name ?? "",
        email: me.email,
      });

      // 3. Fetch this employee's benefits
      const benRes = await benefitsApi.getForEmployee(empId);
      setBenefits(benRes.data ?? []);
    } catch (err) {
      setError(
        err?.response?.data?.message ??
          err.message ??
          "Failed to load benefits.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Insurance benefit (first one found)
  const insuranceBenefit = benefits.find(
    (b) =>
      b.is_insurance ||
      b.type?.toLowerCase() === "insurance" ||
      b.type?.toLowerCase() === "health",
  );

  // All other benefits
  const otherBenefits = benefits.filter((b) => b.id !== insuranceBenefit?.id);

  // Search filter
  const filtered = benefits.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      b.benefit_name?.toLowerCase().includes(q) ||
      b.type?.toLowerCase().includes(q) ||
      b.provider?.toLowerCase().includes(q)
    );
  });

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: C.bg }}
      >
        <Loader2
          size={28}
          className="animate-spin"
          style={{ color: C.primary }}
        />
      </div>
    );

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
        {/* <SideNavbar
          sidebarOpen={sidebarOpen}
          COLORS={C}
          EMPLOYEE={employee ?? {}}
        /> */}

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
                placeholder="Search benefits..."
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
              <Motion.button
                className="relative p-2 rounded-xl"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <Bell size={16} color={C.textSecondary} />
              </Motion.button>
              {employee && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
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
              className="rounded-2xl p-6 text-white relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
              }}
            >
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute top-0 right-0 w-64 h-64 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle,#fff 0%,transparent 70%)",
                    transform: "translate(30%,-30%)",
                  }}
                />
              </div>
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/15 shrink-0">
                  <Heart size={28} />
                </div>
                <div>
                  <h1
                    className="text-2xl font-bold"
                    style={{ fontFamily: "Sora,sans-serif" }}
                  >
                    Your Benefits
                  </h1>
                  <p className="text-indigo-200 text-sm mt-0.5">
                    {employee?.name ?? "Employee"} · {benefits.length} active
                    benefit{benefits.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </Motion.div>

            {/* Error state */}
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

            {/* Insurance card */}
            {!loading && insuranceBenefit && (
              <Motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0}
                className="rounded-2xl p-6"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: C.dangerLight }}
                  >
                    <Heart size={18} color={C.danger} />
                  </div>
                  <div>
                    <h2
                      className="font-bold text-base"
                      style={{ color: C.textPrimary }}
                    >
                      {insuranceBenefit.benefit_name}
                    </h2>
                    {insuranceBenefit.provider && (
                      <p className="text-xs" style={{ color: C.textMuted }}>
                        Provider: {insuranceBenefit.provider}
                      </p>
                    )}
                  </div>
                  <div className="ml-auto">
                    <StatusBadge status={insuranceBenefit.status ?? "active"} />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
                  {[
                    {
                      label: "Benefit Type",
                      value: insuranceBenefit.type ?? "—",
                    },
                    {
                      label: "Start Date",
                      value: insuranceBenefit.start_date ?? "—",
                    },
                    {
                      label: "End Date",
                      value: insuranceBenefit.end_date ?? "Ongoing",
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs" style={{ color: C.textSecondary }}>
                        {item.label}
                      </p>
                      <p
                        className="font-semibold text-sm mt-0.5"
                        style={{ color: C.textPrimary }}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {insuranceBenefit.description && (
                  <p
                    className="text-sm leading-relaxed mb-5"
                    style={{ color: C.textSecondary }}
                  >
                    {insuranceBenefit.description}
                  </p>
                )}

                {/* How to use accordion */}
                <div>
                  <button
                    onClick={() => setExpandedHowTo((p) => !p)}
                    className="flex items-center justify-between w-full text-left py-3 border-b"
                    style={{ borderColor: C.border }}
                  >
                    <span
                      className="font-medium text-sm"
                      style={{ color: C.textPrimary }}
                    >
                      How to use this benefit
                    </span>
                    <Motion.div animate={{ rotate: expandedHowTo ? 180 : 0 }}>
                      <ChevronDown size={16} color={C.textSecondary} />
                    </Motion.div>
                  </button>
                  <AnimatePresence>
                    {expandedHowTo && (
                      <Motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden text-sm pt-3 pb-1"
                        style={{ color: C.textSecondary }}
                      >
                        {insuranceBenefit.usage_instructions ??
                          "Contact HR or your provider directly for details on how to access this benefit."}
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {insuranceBenefit.provider && (
                  <div className="flex gap-3 pt-4">
                    <Motion.button
                      whileHover={{ scale: 1.02 }}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                      style={{ background: C.primary, color: "#fff" }}
                    >
                      <Phone size={15} /> Contact Provider
                    </Motion.button>
                    <Motion.button
                      whileHover={{ scale: 1.02 }}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold border"
                      style={{ borderColor: C.border, color: C.textPrimary }}
                    >
                      View Full Details
                    </Motion.button>
                  </div>
                )}
              </Motion.div>
            )}

            {/* All enrolled benefits */}
            <Motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="rounded-2xl p-6"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              <div className="flex items-center gap-2 mb-5">
                <Award size={18} color={C.primary} />
                <span
                  className="font-bold text-base"
                  style={{ color: C.textPrimary }}
                >
                  All Enrolled Benefits
                </span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: C.primaryLight, color: C.primary }}
                >
                  {benefits.length}
                </span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="rounded-xl p-5"
                      style={{ background: C.surfaceAlt }}
                    >
                      <Skeleton h={36} w={36} rounded="10px" />
                      <div className="mt-4 space-y-2">
                        <Skeleton h={12} w="60%" />
                        <Skeleton h={18} w="80%" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-3">
                  <Heart size={36} color={C.textMuted} />
                  <p
                    className="font-semibold text-sm"
                    style={{ color: C.textSecondary }}
                  >
                    {searchQuery
                      ? "No benefits match your search"
                      : "No benefits enrolled yet"}
                  </p>
                  <p className="text-xs" style={{ color: C.textMuted }}>
                    Contact HR to enrol in company benefit plans
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map((b, i) => {
                    const cfg = getBenefitIcon(b.type);
                    return (
                      <Motion.div
                        key={b.id}
                        custom={i}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        className="p-5 rounded-2xl"
                        style={{ background: C.surfaceAlt }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: cfg.bg }}
                          >
                            <cfg.icon size={18} color={cfg.color} />
                          </div>
                          <StatusBadge status={b.status ?? "active"} />
                        </div>
                        <p
                          className="text-sm font-semibold mb-0.5"
                          style={{ color: C.textPrimary }}
                        >
                          {b.benefit_name}
                        </p>
                        <p
                          className="text-xs mb-1 capitalize"
                          style={{ color: C.textMuted }}
                        >
                          {b.type}
                        </p>
                        {b.provider && (
                          <p
                            className="text-xs"
                            style={{ color: C.textSecondary }}
                          >
                            Provider: {b.provider}
                          </p>
                        )}
                        {b.description && (
                          <p
                            className="text-xs mt-2 line-clamp-2"
                            style={{ color: C.textMuted }}
                          >
                            {b.description}
                          </p>
                        )}
                        <div
                          className="flex items-center gap-3 mt-3 text-[10px]"
                          style={{ color: C.textMuted }}
                        >
                          {b.start_date && <span>From {b.start_date}</span>}
                          {b.end_date && <span>To {b.end_date}</span>}
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
