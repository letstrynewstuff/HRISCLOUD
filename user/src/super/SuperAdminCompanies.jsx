// src/superadmin/SuperAdminCompanies.jsx
// PAGE 2 — Company Management
// Connects to: getAllCompaniesApi, approveCompanyApi,
//              suspendCompanyApi, deleteCompanyApi, createCompanyApi

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import SuperAdminLayout from "./SuperAdminLayout";
import C from "../styles/colors";
import {
  Building2,
  Plus,
  Eye,
  ShieldOff,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  X,
  RefreshCw,
  Search,
  Users,
  BarChart2,
  Globe,
  Calendar,
  ChevronDown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  getAllCompaniesApi,
  approveCompanyApi,
  suspendCompanyApi,
  deleteCompanyApi,
  createCompanyApi,
} from "../api/service/superAdminApi";

/* ─── Animations ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Status config ─── */
const STATUS_CFG = {
  active: {
    label: "Active",
    bg: "#D1FAE5",
    color: "#059669",
    icon: CheckCircle2,
  },
  pending: { label: "Pending", bg: "#FEF3C7", color: "#D97706", icon: Clock },
  suspended: {
    label: "Suspended",
    bg: "#FEE2E2",
    color: "#DC2626",
    icon: XCircle,
  },
};
const statusCfg = (s) => STATUS_CFG[s?.toLowerCase()] ?? STATUS_CFG.pending;

/* ─── Plan badge ─── */
const PLAN_CFG = {
  free: { label: "Free", bg: "#F1F5F9", color: "#64748B" },
  starter: { label: "Starter", bg: "#EEF2FF", color: "#4F46E5" },
  growth: { label: "Growth", bg: "#ECFEFF", color: "#0891B2" },
  enterprise: { label: "Enterprise", bg: "#FEF3C7", color: "#D97706" },
};
const planCfg = (p) => PLAN_CFG[p?.toLowerCase()] ?? PLAN_CFG.free;

/* ─── Stat Card ─── */
function StatCard({ label, value, icon, color, light, index }) {
  const Icon = icon;
  return (
    <Motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="rounded-2xl p-5 flex items-center gap-4"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: light }}
      >
        <Icon size={20} color={color} />
      </div>
      <div>
        <p
          className="text-2xl font-bold"
          style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
        >
          {value ?? "—"}
        </p>
        <p className="text-xs font-medium" style={{ color: C.textSecondary }}>
          {label}
        </p>
      </div>
    </Motion.div>
  );
}

/* ─── Confirm dialog ─── */
function ConfirmModal({
  title,
  message,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
  loading,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)" }}
    >
      <Motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: danger ? C.dangerLight : C.warningLight }}
          >
            <AlertTriangle size={18} color={danger ? C.danger : C.warning} />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
              {title}
            </p>
            <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
              {message}
            </p>
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
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
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{
              background: danger ? C.danger : C.warning,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            {confirmLabel}
          </Motion.button>
        </div>
      </Motion.div>
    </div>
  );
}

/* ─── Create Company Modal ─── */
const EMPTY_FORM = {
  companyName: "",
  companySlug: "",
  industry: "",
  plan: "starter",
  adminFirstName: "",
  adminLastName: "",
  adminEmail: "",
  adminPassword: "",
};

function CreateCompanyModal({ onClose, onCreate }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const autoSlug = (name) =>
    name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 50);

  const handleCreate = async () => {
    if (
      !form.companyName.trim() ||
      !form.adminEmail.trim() ||
      !form.adminPassword
    ) {
      setError("Company name, admin email and password are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onCreate(form);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to create company.");
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, k, type = "text", placeholder }) => (
    <div>
      <label
        className="text-[10px] font-semibold block mb-1"
        style={{ color: C.textSecondary }}
      >
        {label}
      </label>
      <input
        type={type}
        value={form[k]}
        onChange={(e) => {
          set(k, e.target.value);
          if (k === "companyName") set("companySlug", autoSlug(e.target.value));
        }}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 text-sm rounded-xl outline-none"
        style={{
          background: C.surfaceAlt,
          border: `1px solid ${C.border}`,
          color: C.textPrimary,
        }}
      />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <Motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between shrink-0"
          style={{
            background: "linear-gradient(135deg,#0F0C29,#302B63)",
            color: "#fff",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Building2 size={18} />
            </div>
            <div>
              <p
                className="font-bold text-base"
                style={{ fontFamily: "Sora,sans-serif" }}
              >
                Create Company
              </p>
              <p className="text-[11px] text-indigo-200">
                Add a new company to HRISCloud
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/15">
            <X size={14} color="#fff" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <p
            className="text-[10px] font-bold uppercase tracking-wide"
            style={{ color: C.textMuted }}
          >
            Company Info
          </p>
          <Field
            label="Company Name *"
            k="companyName"
            placeholder="e.g. Acme Corporation"
          />
          <Field
            label="Company Slug *"
            k="companySlug"
            placeholder="e.g. acme-corp"
          />

          <div>
            <label
              className="text-[10px] font-semibold block mb-1"
              style={{ color: C.textSecondary }}
            >
              Industry
            </label>
            <select
              value={form.industry}
              onChange={(e) => set("industry", e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl outline-none appearance-none"
              style={{
                background: C.surfaceAlt,
                border: `1px solid ${C.border}`,
                color: C.textPrimary,
              }}
            >
              <option value="">Select industry…</option>
              {[
                "Technology",
                "Finance & Banking",
                "Healthcare",
                "Education",
                "Retail",
                "Manufacturing",
                "Logistics",
                "Real Estate",
                "Other",
              ].map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="text-[10px] font-semibold block mb-1"
              style={{ color: C.textSecondary }}
            >
              Plan
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["free", "starter", "growth", "enterprise"].map((p) => {
                const cfg = planCfg(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set("plan", p)}
                    className="py-2 rounded-xl text-[10px] font-bold capitalize"
                    style={{
                      background: form.plan === p ? cfg.color : C.surfaceAlt,
                      color: form.plan === p ? "#fff" : C.textSecondary,
                      border: `1px solid ${form.plan === p ? cfg.color : C.border}`,
                    }}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t pt-4" style={{ borderColor: C.border }}>
            <p
              className="text-[10px] font-bold uppercase tracking-wide mb-3"
              style={{ color: C.textMuted }}
            >
              HR Admin Account
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="First Name *"
                k="adminFirstName"
                placeholder="First name"
              />
              <Field
                label="Last Name *"
                k="adminLastName"
                placeholder="Last name"
              />
            </div>
            <div className="mt-3 space-y-3">
              <Field
                label="Work Email *"
                k="adminEmail"
                type="email"
                placeholder="admin@company.com"
              />
              <Field
                label="Password *"
                k="adminPassword"
                type="password"
                placeholder="Min 8 chars"
              />
            </div>
          </div>

          {error && (
            <p
              className="text-xs font-medium flex items-center gap-1.5"
              style={{ color: C.danger }}
            >
              <AlertCircle size={12} /> {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 pb-6 flex gap-3 shrink-0"
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
            whileTap={{ scale: 0.97 }}
            onClick={handleCreate}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg,#4F46E5,#6366F1)",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Creating…
              </>
            ) : (
              <>
                <Plus size={13} /> Create Company
              </>
            )}
          </Motion.button>
        </div>
      </Motion.div>
    </div>
  );
}

/* ─── Company Detail Drawer ─── */
function CompanyDrawer({ company, onClose }) {
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
        style={{
          background: C.surface,
          boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between sticky top-0 z-10"
          style={{
            background: "linear-gradient(135deg,#0F0C29,#302B63)",
            color: "#fff",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <p
                className="font-bold"
                style={{ fontFamily: "Sora,sans-serif" }}
              >
                {company.name}
              </p>
              <p className="text-[11px] text-indigo-200">{company.slug}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/15">
            <X size={14} color="#fff" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status + Plan */}
          <div className="flex gap-3">
            {(() => {
              const s = statusCfg(company.status);
              const Icon = s.icon;
              return (
                <span
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: s.bg, color: s.color }}
                >
                  <Icon size={12} />
                  {s.label}
                </span>
              );
            })()}
            {(() => {
              const p = planCfg(company.plan);
              return (
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: p.bg, color: p.color }}
                >
                  {p.label}
                </span>
              );
            })()}
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Industry", value: company.industry ?? "—" },
              {
                label: "Users",
                value: company.userCount ?? company.seats_used ?? "—",
              },
              { label: "Country", value: company.country ?? "—" },
              {
                label: "Created",
                value: company.createdAt
                  ? new Date(company.createdAt).toLocaleDateString("en-GB")
                  : "—",
              },
              {
                label: "Plan Expires",
                value: company.planExpiresAt
                  ? new Date(company.planExpiresAt).toLocaleDateString("en-GB")
                  : "—",
              },
              { label: "Email", value: company.email ?? "—" },
            ].map((d) => (
              <div
                key={d.label}
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
                  {d.label}
                </p>
                <p
                  className="text-xs font-semibold truncate"
                  style={{ color: C.textPrimary }}
                >
                  {d.value}
                </p>
              </div>
            ))}
          </div>

          {company.description && (
            <div
              className="rounded-xl p-4"
              style={{ background: C.surfaceAlt }}
            >
              <p
                className="text-[10px] font-semibold mb-1"
                style={{ color: C.textMuted }}
              >
                Description
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: C.textSecondary }}
              >
                {company.description}
              </p>
            </div>
          )}
        </div>
      </Motion.div>
    </div>
  );
}

/* ════ MAIN ════ */
const FILTERS = ["all", "active", "pending", "suspended"];

export default function SuperAdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [viewCompany, setViewCompany] = useState(null);
  const [confirm, setConfirm] = useState(null); // { type, company }
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllCompaniesApi({ limit: 500 });
      setCompanies(res.data?.data ?? res.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load companies.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ─── Stats ─── */
  const total = companies.length;
  const active = companies.filter(
    (c) => c.status?.toLowerCase() === "active",
  ).length;
  const pending = companies.filter(
    (c) => c.status?.toLowerCase() === "pending",
  ).length;
  const suspended = companies.filter(
    (c) => c.status?.toLowerCase() === "suspended",
  ).length;

  /* ─── Filtered list ─── */
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return companies.filter((c) => {
      const matchSearch =
        !q ||
        c.name?.toLowerCase().includes(q) ||
        c.slug?.toLowerCase().includes(q);
      const matchFilter =
        filter === "all" || c.status?.toLowerCase() === filter;
      return matchSearch && matchFilter;
    });
  }, [companies, searchQuery, filter]);

  /* ─── Actions ─── */
  const handleAction = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      const { type, company } = confirm;
      if (type === "approve") await approveCompanyApi(company.id);
      if (type === "suspend") await suspendCompanyApi(company.id);
      if (type === "delete") await deleteCompanyApi(company.id);
      showToast(`Company ${type}d successfully.`);
      setConfirm(null);
      await load();
    } catch (err) {
      showToast(err?.response?.data?.message ?? "Action failed.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreate = async (form) => {
    const res = await createCompanyApi({
      companyName: form.companyName,
      companySlug: form.companySlug,
      industry: form.industry,
      plan: form.plan,
      firstName: form.adminFirstName,
      lastName: form.adminLastName,
      email: form.adminEmail,
      password: form.adminPassword,
    });
    showToast("Company created successfully!");
    await load();
    return res;
  };

  /* ─── Confirm config ─── */
  const CONFIRM_CFG = {
    approve: {
      title: "Approve Company",
      confirmLabel: "Approve",
      danger: false,
      message: "This will activate the company account.",
    },
    suspend: {
      title: "Suspend Company",
      confirmLabel: "Suspend",
      danger: true,
      message: "The company will lose access until unsuspended.",
    },
    delete: {
      title: "Delete Company",
      confirmLabel: "Delete",
      danger: true,
      message: "This is permanent and cannot be undone.",
    },
  };

  return (
    <SuperAdminLayout
      title="Companies"
      subtitle="Manage all registered companies"
      loading={pageLoading}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onRefresh={load}
    >
      <div className="p-5 md:p-7 space-y-6">
        {/* ── Stat Cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Companies",
              value: total,
              icon: Building2,
              color: C.primary,
              light: C.primaryLight,
            },
            {
              label: "Active",
              value: active,
              icon: CheckCircle2,
              color: C.success,
              light: C.successLight,
            },
            {
              label: "Pending Approval",
              value: pending,
              icon: Clock,
              color: "#D97706",
              light: "#FEF3C7",
            },
            {
              label: "Suspended",
              value: suspended,
              icon: ShieldOff,
              color: C.danger,
              light: C.dangerLight,
            },
          ].map((s, i) => (
            <StatCard key={s.label} {...s} index={i} />
          ))}
        </div>

        {/* ── Toolbar ─────────────────────────────────────────── */}
        <Motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="flex flex-wrap items-center gap-3"
        >
          {/* Filter pills */}
          <div
            className="flex gap-1 p-1 rounded-2xl border"
            style={{ background: C.surface, borderColor: C.border }}
          >
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all"
                style={{
                  background: filter === f ? C.primary : "transparent",
                  color: filter === f ? "#fff" : C.textSecondary,
                }}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs" style={{ color: C.textMuted }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
            <Motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{
                background: `linear-gradient(135deg,${C.primary},#6366F1)`,
                boxShadow: `0 4px 14px rgba(79,70,229,0.3)`,
              }}
            >
              <Plus size={14} /> Add Company
            </Motion.button>
          </div>
        </Motion.div>

        {/* ── Table ───────────────────────────────────────────── */}
        <Motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
          className="rounded-2xl overflow-hidden"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-4">
                <RefreshCw
                  size={28}
                  className="animate-spin"
                  style={{ color: C.primary }}
                />
                <p className="text-sm" style={{ color: C.textMuted }}>
                  Loading companies…
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center space-y-3">
                <AlertCircle
                  size={28}
                  style={{ color: C.danger, margin: "0 auto" }}
                />
                <p className="text-sm" style={{ color: C.danger }}>
                  {error}
                </p>
                <button
                  onClick={load}
                  className="text-sm underline"
                  style={{ color: C.primary }}
                >
                  Retry
                </button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Building2 size={36} style={{ color: C.textMuted }} />
              <p className="text-sm" style={{ color: C.textMuted }}>
                {searchQuery
                  ? "No companies match your search."
                  : "No companies yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    style={{
                      background: C.surfaceAlt,
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    {[
                      "Company",
                      "Plan",
                      "Users",
                      "Status",
                      "Created",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: C.textMuted }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((company, i) => {
                    const status = statusCfg(company.status);
                    const plan = planCfg(company.plan);
                    const StatusIcon = status.icon;
                    return (
                      <Motion.tr
                        key={company.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.025 }}
                        className="border-b group"
                        style={{ borderColor: C.border }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = C.surfaceAlt)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        {/* Company */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                              style={{
                                background: `linear-gradient(135deg,${C.primary},#6366F1)`,
                              }}
                            >
                              {company.name?.[0]?.toUpperCase() ?? "?"}
                            </div>
                            <div>
                              <p
                                className="text-sm font-semibold"
                                style={{ color: C.textPrimary }}
                              >
                                {company.name}
                              </p>
                              <p
                                className="text-[11px]"
                                style={{ color: C.textMuted }}
                              >
                                {company.slug ?? company.subdomain ?? "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="px-5 py-4">
                          <span
                            className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                            style={{ background: plan.bg, color: plan.color }}
                          >
                            {plan.label}
                          </span>
                        </td>

                        {/* Users */}
                        <td className="px-5 py-4">
                          <div
                            className="flex items-center gap-1.5 text-sm"
                            style={{ color: C.textSecondary }}
                          >
                            <Users size={13} />
                            {company.userCount ?? company.seats_used ?? "—"}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                            style={{
                              background: status.bg,
                              color: status.color,
                            }}
                          >
                            <StatusIcon size={11} />
                            {status.label}
                          </span>
                        </td>

                        {/* Created */}
                        <td className="px-5 py-4">
                          <div
                            className="flex items-center gap-1.5 text-xs"
                            style={{ color: C.textSecondary }}
                          >
                            <Calendar size={12} />
                            {company.createdAt
                              ? new Date(company.createdAt).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "—"}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            {/* View */}
                            <Motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setViewCompany(company)}
                              className="w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{ background: C.primaryLight }}
                              title="View Details"
                            >
                              <Eye size={14} color={C.primary} />
                            </Motion.button>

                            {/* Approve (pending only) */}
                            {company.status?.toLowerCase() === "pending" && (
                              <Motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  setConfirm({ type: "approve", company })
                                }
                                className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ background: C.successLight }}
                                title="Approve"
                              >
                                <CheckCircle2 size={14} color={C.success} />
                              </Motion.button>
                            )}

                            {/* Suspend / Unsuspend */}
                            {company.status?.toLowerCase() !== "suspended" && (
                              <Motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  setConfirm({ type: "suspend", company })
                                }
                                className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ background: "#FEF3C7" }}
                                title="Suspend"
                              >
                                <ShieldOff size={14} color="#D97706" />
                              </Motion.button>
                            )}

                            {/* Delete */}
                            <Motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                setConfirm({ type: "delete", company })
                              }
                              className="w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{ background: C.dangerLight }}
                              title="Delete"
                            >
                              <Trash2 size={14} color={C.danger} />
                            </Motion.button>
                          </div>
                        </td>
                      </Motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Motion.div>
      </div>

      {/* ── Modals ─── */}
      <AnimatePresence>
        {showCreate && (
          <CreateCompanyModal
            onClose={() => setShowCreate(false)}
            onCreate={handleCreate}
          />
        )}
        {viewCompany && (
          <CompanyDrawer
            company={viewCompany}
            onClose={() => setViewCompany(null)}
          />
        )}
        {confirm && (
          <ConfirmModal
            {...CONFIRM_CFG[confirm.type]}
            message={`${CONFIRM_CFG[confirm.type].message} Company: ${confirm.company.name}`}
            onConfirm={handleAction}
            onCancel={() => setConfirm(null)}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ─── */}
      <AnimatePresence>
        {toast && (
          <Motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
            style={{ background: "#1E1B4B", color: "#fff", minWidth: 280 }}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={15} color={C.success} />
            ) : (
              <AlertCircle size={15} color={C.danger} />
            )}
            <span className="text-sm font-medium">{toast.msg}</span>
          </Motion.div>
        )}
      </AnimatePresence>
    </SuperAdminLayout>
  );
}
