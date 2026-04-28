// src/superadmin/pages/SubscriptionBillingPage.jsx
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Zap,
  Building2,
  TrendingUp,
  Check,
  ChevronDown,
  AlertCircle,
  RefreshCw,
  DollarSign,
  Users,
  ArrowUpRight,
  Layers,
} from "lucide-react";
import SuperAdminLayout from "./SuperAdminLayout";
import {
  getSubscriptionsApi,
  getPaymentsApi,
  getPlansApi,
  getAnalyticsApi,
} from "../api/service/superAdminApi";
import C from "../styles/colors";

// ─── Helpers ────────────────────────────────────────────────────────
const TABS = [
  { id: "plans", label: "Plans", icon: Layers },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "features", label: "Features", icon: Zap },
];

const PAYMENT_STATUS = {
  success: { bg: "#F0FDF4", text: "#16A34A" },
  pending: { bg: "#FFFBEB", text: "#D97706" },
  failed: { bg: "#FEF2F2", text: "#EF4444" },
  refunded: { bg: "#F8FAFC", text: "#64748B" },
};

const PLAN_GRADIENT = [
  "linear-gradient(135deg,#F8FAFC 0%,#EFF6FF 100%)",
  "linear-gradient(135deg,#F5F3FF 0%,#EEF2FF 100%)",
  "linear-gradient(135deg,#1E1B4B 0%,#312E81 100%)",
];

const PLAN_TEXT = ["#0F172A", "#4F46E5", "#ffffff"];

const DEFAULT_PLANS = [
  {
    _id: "free",
    name: "Free",
    price: 0,
    billing: "forever",
    activeCompanies: 0,
    features: ["5 users", "Basic analytics", "Email support", "1 GB storage"],
  },
  {
    _id: "pro",
    name: "Pro",
    price: 49,
    billing: "month",
    activeCompanies: 0,
    popular: true,
    features: [
      "Unlimited users",
      "Advanced analytics",
      "Priority support",
      "50 GB storage",
      "Custom integrations",
      "API access",
    ],
  },
  {
    _id: "enterprise",
    name: "Enterprise",
    price: 199,
    billing: "month",
    activeCompanies: 0,
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "SLA guarantee",
      "Unlimited storage",
      "White-label option",
      "Custom contracts",
    ],
  },
];

function fmtCurrency(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n ?? 0);
}

function fmtDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Plans Tab ───────────────────────────────────────────────────────
function PlansTab({ plans }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {plans.map((plan, i) => {
        const isDark = i === 2;
        return (
          <motion.div
            key={plan._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="relative rounded-2xl p-6 flex flex-col gap-4"
            style={{
              background: PLAN_GRADIENT[i],
              border: `1.5px solid ${plan.popular ? "#4F46E5" : C.border}`,
              color: PLAN_TEXT[i],
            }}
          >
            {plan.popular && (
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                style={{ background: "#4F46E5" }}
              >
                MOST POPULAR
              </div>
            )}

            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-1"
                style={{
                  color: isDark ? "rgba(255,255,255,0.5)" : C.textMuted,
                }}
              >
                {plan.name}
              </p>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-4xl font-bold"
                  style={{ fontFamily: "Sora,sans-serif" }}
                >
                  {plan.price === 0 ? "Free" : fmtCurrency(plan.price)}
                </span>
                {plan.price > 0 && (
                  <span
                    className="text-sm"
                    style={{
                      color: isDark ? "rgba(255,255,255,0.5)" : C.textMuted,
                    }}
                  >
                    /{plan.billing}
                  </span>
                )}
              </div>
            </div>

            {/* Companies on plan */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{
                background: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.04)",
              }}
            >
              <Building2
                size={14}
                color={isDark ? "rgba(255,255,255,0.6)" : C.textMuted}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: isDark ? "#fff" : C.textPrimary }}
              >
                {plan.activeCompanies ?? plan.companies_count ?? 0}
              </span>
              <span
                className="text-xs"
                style={{
                  color: isDark ? "rgba(255,255,255,0.5)" : C.textMuted,
                }}
              >
                active companies
              </span>
            </div>

            {/* <ul className="space-y-2 flex-1">
              {(plan.features ?? []).map((f, j) => (
                <li key={j} className="flex items-center gap-2 text-sm">
                  <Check
                    size={14}
                    style={{
                      color: isDark ? "#86EFAC" : "#4F46E5",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      color: isDark ? "rgba(255,255,255,0.8)" : C.textSecondary,
                    }}
                  >
                    {f}
                  </span>
                </li>
              ))}
            </ul> */}
            <ul className="space-y-2 flex-1">
              {Array.isArray(plan.features) ? (
                plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <Check
                      size={14}
                      style={{
                        color: isDark ? "#86EFAC" : "#4F46E5",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        color: isDark
                          ? "rgba(255,255,255,0.8)"
                          : C.textSecondary,
                      }}
                    >
                      {f}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-xs italic opacity-50">
                  No features listed
                </li>
              )}
            </ul>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Payments Tab ────────────────────────────────────────────────────
function PaymentsTab({ payments, loading }) {
  const [searchQ, setSearchQ] = useState("");
  const filtered = payments.filter((p) =>
    (p.company?.name ?? p.company ?? "")
      .toLowerCase()
      .includes(searchQ.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search company..."
            className="w-full pl-4 pr-4 py-2 text-sm rounded-xl outline-none"
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              color: C.textPrimary,
            }}
          />
        </div>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "#fff",
          border: `1px solid ${C.border}`,
          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        }}
      >
        <table className="w-full">
          <thead>
            <tr
              style={{
                borderBottom: `1px solid ${C.border}`,
                background: "#F8FAFC",
              }}
            >
              {["Company", "Amount", "Date", "Plan", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: C.textMuted }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div
                        className="h-4 rounded animate-pulse"
                        style={{ background: "#F1F5F9", width: "70%" }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-sm"
                  style={{ color: C.textMuted }}
                >
                  No payments found.
                </td>
              </tr>
            ) : (
              filtered.map((p, i) => {
                const status = p.status ?? "pending";
                const sc = PAYMENT_STATUS[status] ?? PAYMENT_STATUS.pending;
                return (
                  <motion.tr
                    key={p._id ?? i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="group hover:bg-slate-50 transition-colors"
                    style={{ borderBottom: `1px solid ${C.border}` }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: "#EEF2FF" }}
                        >
                          <Building2 size={14} color="#4F46E5" />
                        </div>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: C.textPrimary }}
                        >
                          {p.company?.name ?? p.company ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-sm font-bold"
                        style={{ color: "#059669" }}
                      >
                        {fmtCurrency(p.amount)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-sm"
                        style={{ color: C.textSecondary }}
                      >
                        {fmtDate(p.date ?? p.createdAt ?? p.paid_at)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-sm capitalize"
                        style={{ color: C.textSecondary }}
                      >
                        {p.plan ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize"
                        style={{ background: sc.bg, color: sc.text }}
                      >
                        {status}
                      </span>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Features Tab ────────────────────────────────────────────────────
const FEATURE_MATRIX = [
  {
    name: "User limit",
    free: "5 users",
    pro: "Unlimited",
    enterprise: "Unlimited",
  },
  { name: "Storage", free: "1 GB", pro: "50 GB", enterprise: "Unlimited" },
  {
    name: "Analytics",
    free: "Basic",
    pro: "Advanced",
    enterprise: "Full suite",
  },
  { name: "API access", free: false, pro: true, enterprise: true },
  { name: "Priority support", free: false, pro: true, enterprise: true },
  { name: "Custom integrations", free: false, pro: true, enterprise: true },
  { name: "Dedicated manager", free: false, pro: false, enterprise: true },
  { name: "SLA guarantee", free: false, pro: false, enterprise: true },
  { name: "White-label", free: false, pro: false, enterprise: true },
  { name: "Custom contracts", free: false, pro: false, enterprise: true },
];

function FeaturesTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: "#fff", border: `1px solid ${C.border}` }}
    >
      <table className="w-full">
        <thead>
          <tr
            style={{
              background: "#F8FAFC",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <th
              className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider"
              style={{ color: C.textMuted, width: "40%" }}
            >
              Feature
            </th>
            {["Free", "Pro", "Enterprise"].map((p, i) => (
              <th key={p} className="px-5 py-4 text-center">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background:
                      i === 2 ? "#1E1B4B" : i === 1 ? "#EEF2FF" : "#F8FAFC",
                    color:
                      i === 2 ? "#fff" : i === 1 ? "#4F46E5" : C.textSecondary,
                  }}
                >
                  {p}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FEATURE_MATRIX.map((row, i) => (
            <tr
              key={row.name}
              style={{
                borderBottom:
                  i < FEATURE_MATRIX.length - 1
                    ? `1px solid ${C.border}`
                    : "none",
                background: i % 2 === 0 ? "transparent" : "#FAFAFA",
              }}
            >
              <td
                className="px-5 py-3.5 text-sm font-medium"
                style={{ color: C.textPrimary }}
              >
                {row.name}
              </td>
              {[row.free, row.pro, row.enterprise].map((val, j) => (
                <td key={j} className="px-5 py-3.5 text-center">
                  {typeof val === "boolean" ? (
                    val ? (
                      <Check size={16} color="#22C55E" className="mx-auto" />
                    ) : (
                      <span className="text-slate-300 text-lg">—</span>
                    )
                  ) : (
                    <span
                      className="text-sm font-medium"
                      style={{ color: j === 2 ? "#4F46E5" : C.textSecondary }}
                    >
                      {val}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function SuperSubscriptionBillingPage() {
  const [activeTab, setActiveTab] = useState("plans");
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [payments, setPayments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [plansRes, paymentsRes, analyticsRes] = await Promise.allSettled([
        getPlansApi(),
        getPaymentsApi({}),
        getAnalyticsApi(),
      ]);

      if (plansRes.status === "fulfilled") {
        const d =
          plansRes.value.data?.data ??
          plansRes.value.data?.plans ??
          plansRes.value.data;
        if (Array.isArray(d) && d.length) setPlans(d);
      }

      if (paymentsRes.status === "fulfilled") {
        const d =
          paymentsRes.value.data?.data ??
          paymentsRes.value.data?.payments ??
          paymentsRes.value.data;
        if (Array.isArray(d)) setPayments(d);
      }

      if (analyticsRes.status === "fulfilled") {
        const d = analyticsRes.value.data?.data ?? analyticsRes.value.data;
        if (d) setAnalytics(d);
      }
    } catch (err) {
      setError("Failed to load billing data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const totalRevenue =
    analytics?.totalRevenue ??
    payments.reduce((s, p) => s + (p.amount ?? 0), 0);
  const activeSubscriptions =
    analytics?.activeSubscriptions ??
    plans.reduce((s, p) => s + (p.activeCompanies ?? 0), 0);

  return (
    <SuperAdminLayout
      title="Billing"
      subtitle="Subscriptions & Revenue"
      loading={loading}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onRefresh={fetchAll}
      showHeader={false}
    >
      <div className="px-5 md:px-7 pb-8 space-y-6">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-8 text-white relative overflow-hidden mt-6"
          style={{
            background:
              "linear-gradient(135deg,#064E3B 0%,#065F46 50%,#0F766E 100%)",
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/15">
                <CreditCard size={28} color="#fff" />
              </div>
              <div>
                <h1
                  className="text-3xl font-bold"
                  style={{ fontFamily: "Sora,sans-serif" }}
                >
                  Subscription & Billing
                </h1>
                <p className="text-emerald-200 mt-0.5">
                  Plans, payments & revenue management
                </p>
              </div>
            </div>

            <div className="md:ml-auto flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
                <span className="text-lg font-bold text-emerald-300">
                  {fmtCurrency(totalRevenue)}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-medium text-white/60">
                  Monthly Revenue
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm">
                <span className="text-lg font-bold">{activeSubscriptions}</span>
                <span className="text-[10px] uppercase tracking-wider font-medium text-white/60">
                  Active Subs
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Monthly Revenue",
              value: fmtCurrency(totalRevenue),
              icon: DollarSign,
              color: "#059669",
              bg: "#F0FDF4",
              delta: "+12.4%",
            },
            {
              label: "Active Subscriptions",
              value: activeSubscriptions,
              icon: Zap,
              color: "#4F46E5",
              bg: "#EEF2FF",
              delta: "+5",
            },
            {
              label: "Total Payments",
              value: payments.length,
              icon: CreditCard,
              color: "#0891B2",
              bg: "#F0F9FF",
              delta: null,
            },
            {
              label: "Avg. Revenue/Co.",
              value: fmtCurrency(
                activeSubscriptions
                  ? Math.round(totalRevenue / (activeSubscriptions || 1))
                  : 0,
              ),
              icon: TrendingUp,
              color: "#D97706",
              bg: "#FFFBEB",
              delta: null,
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl p-5"
              style={{
                background: "#fff",
                border: `1px solid ${C.border}`,
                boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: card.bg }}
                >
                  <card.icon size={17} color={card.color} />
                </div>
                {card.delta && (
                  <span
                    className="flex items-center gap-0.5 text-xs font-semibold"
                    style={{ color: "#059669" }}
                  >
                    <ArrowUpRight size={11} />
                    {card.delta}
                  </span>
                )}
              </div>
              <p className="text-xs mb-1" style={{ color: C.textMuted }}>
                {card.label}
              </p>
              <p
                className="text-xl font-bold"
                style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
              >
                {card.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-2xl"
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            width: "fit-content",
          }}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: active ? "#4F46E5" : "transparent",
                  color: active ? "#fff" : C.textSecondary,
                }}
              >
                <Icon size={14} />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Error Banner */}
        {error && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl"
            style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
          >
            <AlertCircle size={16} color="#EF4444" />
            <span className="text-sm" style={{ color: "#EF4444" }}>
              {error}
            </span>
            <button
              onClick={fetchAll}
              className="ml-auto text-xs underline"
              style={{ color: "#EF4444" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "plans" && <PlansTab plans={plans} />}
            {activeTab === "payments" && (
              <PaymentsTab payments={payments} loading={loading} />
            )}
            {activeTab === "features" && <FeaturesTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </SuperAdminLayout>
  );
}
