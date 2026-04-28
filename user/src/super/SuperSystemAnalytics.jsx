// src/superadmin/SuperSystemAnalytics.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Users,
  Building2,
  TrendingUp,
  Zap,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import SuperAdminLayout from "./SuperAdminLayout";
import C from "../styles/colors";
import { getAnalyticsApi } from "../api/service/superAdminApi";

// ── Fallback mock data ────────────────────────────────────────────────
const MOCK = {
  totalUsers: 4821,
  activeUsers: 3104,
  totalCompanies: 217,
  conversionRate: 64.4,
  userGrowth: [
    { month: "Nov", users: 2900 },
    { month: "Dec", users: 3200 },
    { month: "Jan", users: 3500 },
    { month: "Feb", users: 3780 },
    { month: "Mar", users: 4300 },
    { month: "Apr", users: 4821 },
  ],
  revenueGrowth: [
    { month: "Nov", revenue: 41000 },
    { month: "Dec", revenue: 47000 },
    { month: "Jan", revenue: 53000 },
    { month: "Feb", revenue: 61000 },
    { month: "Mar", revenue: 74000 },
    { month: "Apr", revenue: 89000 },
  ],
  companyGrowth: [
    { month: "Nov", companies: 148 },
    { month: "Dec", companies: 162 },
    { month: "Jan", companies: 175 },
    { month: "Feb", companies: 189 },
    { month: "Mar", companies: 203 },
    { month: "Apr", companies: 217 },
  ],
  planBreakdown: [
    { name: "Starter", value: 38, color: C.accent },
    { name: "Growth", value: 31, color: C.primary },
    { name: "Enterprise", value: 19, color: C.purple },
    { name: "Free", value: 12, color: C.textMuted },
  ],
  topCompanies: [
    { name: "Acme Corp", users: 340, plan: "Enterprise", usage: 92 },
    { name: "TechBridge Ltd", users: 284, plan: "Enterprise", usage: 88 },
    { name: "NovaPay", users: 213, plan: "Growth", usage: 76 },
    { name: "SwiftHR", users: 198, plan: "Growth", usage: 71 },
    { name: "ClearOps", users: 156, plan: "Growth", usage: 65 },
    { name: "GridForce", users: 134, plan: "Starter", usage: 54 },
  ],
};

// ── Sub-components ────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

function StatCard({ icon: Icon, label, value, sub, subUp, color, delay }) {
  return (
    <motion.div
      {...fadeUp(delay)}
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        boxShadow: "0 2px 12px rgba(15,23,42,0.04)",
      }}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}
        >
          <Icon size={18} color={color} />
        </div>
        {sub != null && (
          <div
            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg"
            style={{
              background: subUp ? C.successLight : C.dangerLight,
              color: subUp ? C.success : C.danger,
            }}
          >
            {subUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {sub}
          </div>
        )}
      </div>
      <div>
        <div
          className="text-2xl font-bold"
          style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
        >
          {value}
        </div>
        <div className="text-xs mt-0.5" style={{ color: C.textSecondary }}>
          {label}
        </div>
      </div>
    </motion.div>
  );
}

function ChartCard({ title, delay, children }) {
  return (
    <motion.div
      {...fadeUp(delay)}
      className="rounded-2xl p-5"
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        boxShadow: "0 2px 12px rgba(15,23,42,0.04)",
      }}
    >
      <div
        className="text-sm font-semibold mb-4"
        style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
      >
        {title}
      </div>
      {children}
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label, prefix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs shadow-xl"
      style={{
        background: C.navy,
        color: "#fff",
        border: `1px solid ${C.navyMid}`,
      }}
    >
      <div style={{ color: C.textMuted }} className="mb-1">
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} className="font-semibold">
          {prefix}
          {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────
export default function SuperSystemAnalytics() {
  const [data, setData] = useState(MOCK);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAnalyticsApi();
      const d = res.data?.data ?? res.data;
      if (d) setData({ ...MOCK, ...d });
    } catch {
      // keep mock data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = data.topCompanies?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const statCards = [
    {
      icon: Users,
      label: "Total Users",
      value: data.totalUsers?.toLocaleString(),
      sub: "12.4%",
      subUp: true,
      color: C.primary,
      delay: 0.05,
    },
    {
      icon: Zap,
      label: "Active Users",
      value: data.activeUsers?.toLocaleString(),
      sub: "8.1%",
      subUp: true,
      color: C.accent,
      delay: 0.1,
    },
    {
      icon: Building2,
      label: "Total Companies",
      value: data.totalCompanies?.toLocaleString(),
      sub: "6.9%",
      subUp: true,
      color: C.purple,
      delay: 0.15,
    },
    {
      icon: TrendingUp,
      label: "Conversion Rate",
      value: `${data.conversionRate}%`,
      sub: "1.2%",
      subUp: false,
      color: C.warning,
      delay: 0.2,
    },
  ];

  return (
    <SuperAdminLayout
      title="System Analytics"
      subtitle="Platform metrics and growth"
      loading={loading}
      searchQuery={search}
      setSearchQuery={setSearch}
      onRefresh={fetchData}
    >
      <div className="p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Line Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title="Total Users Over Time" delay={0.25}>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.userGrowth}>
                <CartesianGrid
                  stroke={C.border}
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: C.textMuted }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: C.textMuted }}
                  axisLine={false}
                  tickLine={false}
                  width={38}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke={C.primary}
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Revenue Growth (₦)" delay={0.3}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.revenueGrowth} barSize={14}>
                <CartesianGrid
                  stroke={C.border}
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: C.textMuted }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: C.textMuted }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                  tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip prefix="₦" />} />
                <Bar dataKey="revenue" fill={C.accent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Companies Growth" delay={0.35}>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.companyGrowth}>
                <CartesianGrid
                  stroke={C.border}
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: C.textMuted }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: C.textMuted }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="companies"
                  stroke={C.purple}
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Breakdown Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Pie */}
          <ChartCard title="Users per Plan" delay={0.4}>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={data.planBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.planBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [`${v}%`, n]}
                    contentStyle={{
                      background: C.navy,
                      border: "none",
                      borderRadius: 10,
                      color: "#fff",
                      fontSize: 11,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 justify-center">
                {data.planBreakdown.map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: C.textSecondary }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ background: p.color }}
                    />
                    {p.name}{" "}
                    <span
                      className="font-semibold"
                      style={{ color: C.textPrimary }}
                    >
                      {p.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>

          {/* Top Companies Table */}
          <motion.div
            {...fadeUp(0.45)}
            className="lg:col-span-4 rounded-2xl p-5"
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              boxShadow: "0 2px 12px rgba(15,23,42,0.04)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="text-sm font-semibold"
                style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
              >
                Top Companies by Usage
              </div>
              <div className="text-xs" style={{ color: C.textMuted }}>
                {filtered?.length} companies
              </div>
            </div>
            <div className="space-y-3">
              {filtered?.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{
                      background: i < 3 ? C.primary : C.surfaceAlt,
                      color: i < 3 ? "#fff" : C.textMuted,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-xs font-semibold truncate"
                        style={{ color: C.textPrimary }}
                      >
                        {c.name}
                      </span>
                      <span
                        className="text-[10px] font-medium shrink-0 ml-2"
                        style={{ color: C.textSecondary }}
                      >
                        {c.users} users
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="flex-1 h-1.5 rounded-full"
                        style={{ background: C.border }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${c.usage}%`,
                            background:
                              i < 2 ? C.primary : i < 4 ? C.accent : C.purple,
                          }}
                        />
                      </div>
                      <span
                        className="text-[10px] font-semibold w-7 text-right"
                        style={{ color: C.textSecondary }}
                      >
                        {c.usage}%
                      </span>
                    </div>
                  </div>
                  <div
                    className="text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0"
                    style={{
                      background:
                        c.plan === "Enterprise"
                          ? C.primaryLight
                          : c.plan === "Growth"
                            ? "#EDE9FE"
                            : C.surfaceAlt,
                      color:
                        c.plan === "Enterprise"
                          ? C.primary
                          : c.plan === "Growth"
                            ? C.purple
                            : C.textMuted,
                    }}
                  >
                    {c.plan.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
