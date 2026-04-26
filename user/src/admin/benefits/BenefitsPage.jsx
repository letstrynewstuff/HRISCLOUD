// src/admin/benefits/BenefitsPage.jsx
// Route: /admin/benefits
// Benefits management + assign + insurance recommendation banner.

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSideNavbar from "../AdminSideNavbar";
import {
  Heart,
  Plus,
  Users,
  Shield,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  RefreshCw,
  Menu,
  Search,
  AlertTriangle,
  Award,
  Star,
  ExternalLink,
  Building2,
} from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import { benefitsApi } from "../../api/service/benefitsApi";
import { getEmployees } from "../../api/service/employeeApi";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.36 },
  }),
};

const BENEFIT_TYPE_CONFIG = {
  insurance: { label: "Insurance", bg: "#DBEAFE", color: "#2563EB" },
  allowance: { label: "Allowance", bg: C.successLight, color: C.success },
  custom: { label: "Custom", bg: C.primaryLight, color: C.primary },
  pension: { label: "Pension", bg: "#F3E8FF", color: "#7C3AED" },
  health: { label: "Health", bg: C.dangerLight, color: C.danger },
};

// ── Atoms ─────────────────────────────────────────────────────
function TypeBadge({ type }) {
  const cfg = BENEFIT_TYPE_CONFIG[type?.toLowerCase()] ?? {
    label: type,
    bg: C.surfaceAlt,
    color: C.textMuted,
  };
  return (
    <span
      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  const Icon = type === "success" ? CheckCircle2 : XCircle;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: 40, x: "-50%" }}
      className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl"
      style={{
        background: "#1E1B4B",
        boxShadow: "0 12px 40px rgba(15,23,42,0.35)",
        minWidth: 260,
      }}
    >
      <Icon size={16} color={type === "success" ? C.success : C.danger} />
      <span className="text-white text-sm font-semibold">{msg}</span>
    </motion.div>
  );
}

// ── Create Benefit Modal ──────────────────────────────────────
function CreateBenefitModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    name: "",
    type: "allowance",
    provider: "",
    description: "",
    isInsurance: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Benefit name is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await benefitsApi.create(form);
      onSaved(res.data ?? res);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to create benefit.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
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
              style={{ background: C.dangerLight }}
            >
              <Heart size={14} color={C.danger} />
            </div>
            <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
              Create Benefit
            </p>
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
          {[
            {
              label: "Benefit Name *",
              key: "name",
              type: "text",
              placeholder: "e.g. Monthly Transport Allowance",
            },
            {
              label: "Provider (optional)",
              key: "provider",
              type: "text",
              placeholder: "e.g. AXA Mansard, GTBank",
            },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label
                className="block text-xs font-semibold mb-1"
                style={{ color: C.textPrimary }}
              >
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                placeholder={placeholder}
                onChange={(e) => set(key, e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1.5px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              />
            </div>
          ))}
          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: C.textPrimary }}
            >
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
                color: C.textPrimary,
              }}
            >
              {Object.entries(BENEFIT_TYPE_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: C.textPrimary }}
            >
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Describe this benefit..."
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
                color: C.textPrimary,
              }}
            />
          </div>
          {/* Insurance checkbox */}
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
            }}
          >
            <button
              onClick={() => set("isInsurance", !form.isInsurance)}
              className="w-9 h-5 rounded-full relative transition-colors shrink-0"
              style={{ background: form.isInsurance ? C.primary : C.border }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: form.isInsurance ? "calc(100% - 18px)" : "2px" }}
              />
            </button>
            <span
              className="text-xs font-medium"
              style={{ color: C.textSecondary }}
            >
              This is an insurance benefit
            </span>
          </div>
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
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: C.primary, opacity: saving ? 0.8 : 1 }}
          >
            {saving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Plus size={13} />
            )}
            Create Benefit
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Assign Benefit Modal ──────────────────────────────────────
function AssignModal({ benefit, onClose, onAssigned }) {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    employeeId: "",
    startDate: "",
    endDate: "",
  });
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    getEmployees({ limit: 200 })
      .then((res) => setEmployees(res.data ?? []))
      .catch(() => {});
  }, []);

  const handleAssign = async () => {
    if (!form.employeeId || !form.startDate) {
      setError("Employee and start date are required.");
      return;
    }
    setAssigning(true);
    try {
      await benefitsApi.assign({ benefitId: benefit.id, ...form });
      onAssigned();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to assign benefit.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
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
              style={{ background: C.successLight }}
            >
              <Users size={14} color={C.success} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
                Assign Benefit
              </p>
              <p className="text-[10px]" style={{ color: C.textMuted }}>
                {benefit.name}
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
          <div>
            <label
              className="block text-xs font-semibold mb-1"
              style={{ color: C.textPrimary }}
            >
              Select Employee *
            </label>
            <select
              value={form.employeeId}
              onChange={(e) => set("employeeId", e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
                color: C.textPrimary,
              }}
            >
              <option value="">— Choose employee —</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.first_name} {e.last_name} ({e.employee_code})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className="block text-xs font-semibold mb-1"
                style={{ color: C.textPrimary }}
              >
                Start Date *
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1.5px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              />
            </div>
            <div>
              <label
                className="block text-xs font-semibold mb-1"
                style={{ color: C.textPrimary }}
              >
                End Date (optional)
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1.5px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              />
            </div>
          </div>
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
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAssign}
            disabled={assigning}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: C.success, opacity: assigning ? 0.8 : 1 }}
          >
            {assigning ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Users size={13} />
            )}
            Assign Benefit
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Insurance Banner ──────────────────────────────────────────
function InsuranceBanner({ onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
      }}
    >
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 w-7 h-7 rounded-xl flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.15)" }}
      >
        <X size={13} color="rgba(255,255,255,0.7)" />
      </button>

      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/15 shrink-0">
          <Shield size={28} color="#fff" />
        </div>
        <div className="flex-1">
          <h3
            className="text-xl font-bold text-white mb-1"
            style={{ fontFamily: "Sora,sans-serif" }}
          >
            Protect Your Business, Staff & Equipment
          </h3>
          <p className="text-sm text-indigo-200 mb-4">
            Get insured with trusted providers — comprehensive coverage for your
            entire workforce
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { label: "NAICOM Certified", icon: Award },
              { label: "CIIN Certified", icon: Star },
              { label: "FCA Compliant", icon: Shield },
            ].map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.12)" }}
              >
                <Icon size={12} color="#a5b4fc" />
                <span className="text-xs font-semibold text-white">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            View Insurance Providers <ExternalLink size={13} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
export default function AdminBenefitsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [createModal, setCreateModal] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [showInsuranceAd, setShowInsuranceAd] = useState(true);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await benefitsApi.getAll();
      setBenefits(res.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load benefits.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreated = (benefit) => {
    setBenefits((prev) => [benefit, ...prev]);
    setCreateModal(false);
    showToast("Benefit created successfully.");
  };

  const filtered = benefits.filter((b) => {
    const q = search.toLowerCase();
    const matchS =
      !q ||
      b.name?.toLowerCase().includes(q) ||
      b.provider?.toLowerCase().includes(q);
    const matchT = typeFilter === "all" || b.type?.toLowerCase() === typeFilter;
    return matchS && matchT;
  });

  return (
    <div
      className="min-h-screen"
      style={{ background: C.bg, fontFamily: "'DM Sans','Sora',sans-serif" }}
    >
      <div className="flex h-screen overflow-hidden">
        <AdminSideNavbar
          sidebarOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* TOPBAR */}
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
            <div className="relative flex-1 max-w-xs">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                color={C.textMuted}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search benefits..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{
                  background: C.surface,
                  border: `1.5px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCreateModal(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: C.primary }}
              >
                <Plus size={14} /> Create Benefit
              </motion.button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
              >
                Benefits
              </h1>
              <p className="text-sm mt-0.5" style={{ color: C.textMuted }}>
                Manage company benefits and assign them to employees
              </p>
            </div>

            {/* Insurance banner */}
            <AnimatePresence>
              {showInsuranceAd && (
                <InsuranceBanner onDismiss={() => setShowInsuranceAd(false)} />
              )}
            </AnimatePresence>

            {/* Type filter */}
            <div className="flex gap-2 flex-wrap">
              {["all", ...Object.keys(BENEFIT_TYPE_CONFIG)].map((t) => {
                const cfg = BENEFIT_TYPE_CONFIG[t] ?? {
                  label: "All",
                  bg: C.primaryLight,
                  color: C.primary,
                };
                const active = typeFilter === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-full"
                    style={{
                      background: active
                        ? t === "all"
                          ? C.primary
                          : cfg.color
                        : C.surface,
                      color: active ? "#fff" : C.textSecondary,
                      border: `1px solid ${active ? (t === "all" ? C.primary : cfg.color) : C.border}`,
                    }}
                  >
                    {t === "all" ? "All Types" : cfg.label}
                  </button>
                );
              })}
            </div>

            {error && (
              <div
                className="rounded-xl p-4 flex items-center gap-2"
                style={{ background: C.dangerLight }}
              >
                <AlertTriangle size={15} color={C.danger} />
                <p className="text-sm" style={{ color: C.danger }}>
                  {error}
                </p>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-36 rounded-2xl animate-pulse"
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                    }}
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div
                className="rounded-2xl p-16 flex flex-col items-center gap-3"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <Heart size={36} color={C.textMuted} />
                <p className="font-semibold" style={{ color: C.textSecondary }}>
                  No benefits found
                </p>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ background: C.primary }}
                >
                  <Plus size={14} /> Create First Benefit
                </motion.button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((benefit, i) => (
                  <motion.div
                    key={benefit.id}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    whileHover={{
                      y: -3,
                      boxShadow: `0 8px 24px rgba(79,70,229,0.1)`,
                    }}
                    className="rounded-2xl p-5 flex flex-col gap-3"
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{
                            background: benefit.is_insurance
                              ? "#DBEAFE"
                              : C.dangerLight,
                          }}
                        >
                          {benefit.is_insurance ? (
                            <Shield size={18} color="#2563EB" />
                          ) : (
                            <Heart size={18} color={C.danger} />
                          )}
                        </div>
                        <div>
                          <p
                            className="font-bold text-sm"
                            style={{ color: C.textPrimary }}
                          >
                            {benefit.name}
                          </p>
                          <TypeBadge type={benefit.type} />
                        </div>
                      </div>
                    </div>

                    {benefit.provider && (
                      <div className="flex items-center gap-1.5">
                        <Building2 size={11} color={C.textMuted} />
                        <span
                          className="text-xs"
                          style={{ color: C.textSecondary }}
                        >
                          {benefit.provider}
                        </span>
                      </div>
                    )}

                    {benefit.description && (
                      <p
                        className="text-xs leading-relaxed line-clamp-2"
                        style={{ color: C.textMuted }}
                      >
                        {benefit.description}
                      </p>
                    )}

                    <div className="mt-auto">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setAssignTarget(benefit)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                        style={{
                          background: C.successLight,
                          color: C.success,
                          border: `1px solid ${C.success}33`,
                        }}
                      >
                        <Users size={14} /> Assign to Employee
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <AnimatePresence>
        {createModal && (
          <CreateBenefitModal
            onClose={() => setCreateModal(false)}
            onSaved={handleCreated}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {assignTarget && (
          <AssignModal
            benefit={assignTarget}
            onClose={() => setAssignTarget(null)}
            onAssigned={() => {
              setAssignTarget(null);
              showToast("Benefit assigned successfully.");
            }}
          />
        )}
      </AnimatePresence>
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
