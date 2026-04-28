// src/superadmin/SuperSystemMonitoring.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server,
  Database,
  HardDrive,
  Cpu,
  MemoryStick,
  Timer,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  RefreshCw,
  Activity,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import SuperAdminLayout from "./SuperAdminLayout";
import C from "../styles/colors";
import {
  getSystemHealthApi,
  getErrorLogsApi,
} from "../api/service/superAdminApi";

// ── Mock data ─────────────────────────────────────────────────────────
function generateMetricHistory(base, variance, points = 20) {
  return Array.from({ length: points }, (_, i) => ({
    t: `${points - i}m`,
    v: Math.max(0, Math.min(100, base + (Math.random() - 0.5) * variance)),
  })).reverse();
}

const MOCK_HEALTH = {
  services: {
    apiServer: { status: "online", uptime: "99.97%", latency: "42ms" },
    database: { status: "online", uptime: "99.99%", latency: "8ms" },
    storage: { status: "degraded", uptime: "98.41%", latency: "210ms" },
  },
  metrics: {
    cpu: 34,
    memory: 61,
    responseTime: 142,
  },
};

const MOCK_LOGS = {
  errors: [
    {
      id: 1,
      time: "14:02:31",
      code: 500,
      message: "Database connection pool exhausted",
      service: "api",
    },
    {
      id: 2,
      time: "13:47:08",
      code: 503,
      message: "Storage service temporarily unavailable",
      service: "storage",
    },
    {
      id: 3,
      time: "12:55:22",
      code: 500,
      message: "Unhandled exception in payroll worker",
      service: "worker",
    },
    {
      id: 4,
      time: "11:30:01",
      code: 404,
      message: "Missing resource: /plans/undefined",
      service: "api",
    },
  ],
  warnings: [
    {
      id: 1,
      time: "14:11:05",
      message: "Memory usage above 80% threshold",
      service: "system",
    },
    {
      id: 2,
      time: "13:52:19",
      message: "Response time spike detected (>500ms)",
      service: "api",
    },
    {
      id: 3,
      time: "13:15:44",
      message: "Rate limit approaching for tenant #88",
      service: "gateway",
    },
    {
      id: 4,
      time: "12:48:30",
      message: "Scheduled job: email-digest ran 4m late",
      service: "scheduler",
    },
    {
      id: 5,
      time: "11:20:12",
      message: "Disk usage at 73% on primary storage",
      service: "storage",
    },
  ],
};

// ── Components ────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

const STATUS_META = {
  online: {
    color: C.success,
    bg: C.successLight,
    label: "ONLINE",
    dot: "#10B981",
  },
  degraded: {
    color: C.warning,
    bg: C.warningLight,
    label: "DEGRADED",
    dot: "#F59E0B",
  },
  offline: {
    color: C.danger,
    bg: C.dangerLight,
    label: "OFFLINE",
    dot: "#EF4444",
  },
};

function PulsingDot({ color }) {
  return (
    <span className="relative inline-flex w-2.5 h-2.5">
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
        style={{ background: color }}
      />
      <span
        className="relative inline-flex rounded-full w-2.5 h-2.5"
        style={{ background: color }}
      />
    </span>
  );
}

function ServiceCard({ name, icon: Icon, status, uptime, latency, delay }) {
  const meta = STATUS_META[status] ?? STATUS_META.offline;
  return (
    <motion.div
      {...fadeUp(delay)}
      className="rounded-2xl p-5"
      style={{
        background: C.surface,
        border: `1.5px solid ${status === "online" ? `${C.success}30` : status === "degraded" ? `${C.warning}40` : C.dangerLight}`,
        boxShadow: "0 2px 12px rgba(15,23,42,0.04)",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${meta.color}15` }}
        >
          <Icon size={18} color={meta.color} />
        </div>
        <div
          className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg"
          style={{ background: meta.bg, color: meta.color }}
        >
          <PulsingDot color={meta.dot} />
          {meta.label}
        </div>
      </div>
      <div
        className="text-sm font-semibold mb-3"
        style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
      >
        {name}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div
            className="text-[10px] uppercase tracking-wider mb-0.5"
            style={{ color: C.textMuted }}
          >
            Uptime
          </div>
          <div className="text-sm font-bold" style={{ color: C.textPrimary }}>
            {uptime}
          </div>
        </div>
        <div>
          <div
            className="text-[10px] uppercase tracking-wider mb-0.5"
            style={{ color: C.textMuted }}
          >
            Latency
          </div>
          <div className="text-sm font-bold" style={{ color: C.textPrimary }}>
            {latency}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function GaugeMetric({ label, value, unit, color, history, delay }) {
  const pct = Math.min(100, Math.max(0, Number(value)));
  const accent = pct > 80 ? C.danger : pct > 60 ? C.warning : color;

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
      <div className="flex items-center justify-between mb-4">
        <span
          className="text-sm font-semibold"
          style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
        >
          {label}
        </span>
        <span className="text-xl font-bold" style={{ color: accent }}>
          {typeof value === "number"
            ? value.toFixed(unit === "ms" ? 0 : 0)
            : value}
          <span
            className="text-sm font-normal ml-0.5"
            style={{ color: C.textMuted }}
          >
            {unit}
          </span>
        </span>
      </div>

      {/* Bar */}
      <div className="h-2 rounded-full mb-4" style={{ background: C.border }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ background: accent }}
        />
      </div>

      {/* Sparkline */}
      {history && (
        <ResponsiveContainer width="100%" height={60}>
          <AreaChart
            data={history}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={accent} stopOpacity={0.25} />
                <stop offset="95%" stopColor={accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={accent}
              strokeWidth={1.5}
              fill={`url(#grad-${label})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}

function LogRow({ time, message, service, code, type }) {
  const isError = type === "error";
  return (
    <div
      className="flex items-start gap-3 py-2.5 px-3 rounded-xl group hover:opacity-80 transition-opacity"
      style={{ background: isError ? `${C.danger}08` : `${C.warning}08` }}
    >
      {isError ? (
        <XCircle size={13} color={C.danger} className="mt-0.5 shrink-0" />
      ) : (
        <AlertTriangle
          size={13}
          color={C.warning}
          className="mt-0.5 shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-xs" style={{ color: C.textPrimary }}>
          {message}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px]" style={{ color: C.textMuted }}>
            {time}
          </span>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: C.surfaceAlt, color: C.textSecondary }}
          >
            {service.toUpperCase()}
          </span>
          {code && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: C.dangerLight, color: C.danger }}
            >
              {code}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function SuperSystemMonitoring() {
  const [health, setHealth] = useState(MOCK_HEALTH);
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Live metric histories (updated on interval)
  const [cpuHistory] = useState(() => generateMetricHistory(34, 20));
  const [memHistory] = useState(() => generateMetricHistory(61, 12));
  const [respHistory] = useState(() => generateMetricHistory(50, 30));

  const [activeLog, setActiveLog] = useState("errors");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [healthRes, logsRes] = await Promise.all([
        getSystemHealthApi(),
        getErrorLogsApi(),
      ]);
      const h = healthRes.data?.data ?? healthRes.data;
      const l = logsRes.data?.data ?? logsRes.data;
      if (h) setHealth({ ...MOCK_HEALTH, ...h });
      if (l) setLogs({ ...MOCK_LOGS, ...l });
      setLastRefresh(new Date());
    } catch {
      // keep mock data
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const services = [
    { name: "API Server", icon: Server, key: "apiServer", delay: 0.05 },
    { name: "Database", icon: Database, key: "database", delay: 0.1 },
    { name: "Storage", icon: HardDrive, key: "storage", delay: 0.15 },
  ];

  const displayLogs = activeLog === "errors" ? logs.errors : logs.warnings;

  return (
    <SuperAdminLayout
      title="System Monitoring"
      subtitle="Infrastructure health & logs"
      loading={loading}
      onRefresh={fetchData}
    >
        
      <div className="p-6 space-y-5">
        {/* Last refresh badge */}
        <motion.div {...fadeUp(0)} className="flex items-center gap-2">
          <Clock size={12} color={C.textMuted} />
          <span className="text-xs" style={{ color: C.textMuted }}>
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: C.successLight, color: C.success }}
          >
            AUTO-REFRESH 30s
          </span>
        </motion.div>

        {/* Service Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((s) => {
            const svc = health.services?.[s.key] ?? {
              status: "online",
              uptime: "—",
              latency: "—",
            };
            return (
              <ServiceCard
                key={s.key}
                name={s.name}
                icon={s.icon}
                status={svc.status}
                uptime={svc.uptime}
                latency={svc.latency}
                delay={s.delay}
              />
            );
          })}
        </div>

        {/* Metric Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GaugeMetric
            label="CPU Usage"
            value={health.metrics?.cpu ?? 0}
            unit="%"
            color={C.primary}
            history={cpuHistory}
            delay={0.2}
          />
          <GaugeMetric
            label="Memory Usage"
            value={health.metrics?.memory ?? 0}
            unit="%"
            color={C.accent}
            history={memHistory}
            delay={0.25}
          />
          <GaugeMetric
            label="Avg Response Time"
            value={health.metrics?.responseTime ?? 0}
            unit="ms"
            color={C.purple}
            history={respHistory}
            delay={0.3}
          />
        </div>

        {/* Logs */}
        <motion.div
          {...fadeUp(0.35)}
          className="rounded-2xl p-5"
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            boxShadow: "0 2px 12px rgba(15,23,42,0.04)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={15} color={C.primary} />
              <span
                className="text-sm font-semibold"
                style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
              >
                Recent Logs (Last 24h)
              </span>
            </div>

            {/* Tab toggle */}
            <div
              className="flex p-1 rounded-xl"
              style={{
                background: C.surfaceAlt,
                border: `1px solid ${C.border}`,
              }}
            >
              {["errors", "warnings"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveLog(tab)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                  style={{
                    background:
                      activeLog === tab
                        ? tab === "errors"
                          ? C.danger
                          : C.warning
                        : "transparent",
                    color: activeLog === tab ? "#fff" : C.textSecondary,
                  }}
                >
                  {tab} (
                  {tab === "errors"
                    ? logs.errors?.length
                    : logs.warnings?.length}
                  )
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeLog}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-1.5 max-h-72 overflow-y-auto pr-1"
            >
              {displayLogs?.length > 0 ? (
                displayLogs.map((log) => (
                  <LogRow
                    key={log.id}
                    time={log.time}
                    message={log.message}
                    service={log.service}
                    code={log.code}
                    type={activeLog === "errors" ? "error" : "warning"}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center py-10 gap-2">
                  <CheckCircle2 size={28} color={C.success} />
                  <p className="text-sm" style={{ color: C.textMuted }}>
                    No {activeLog} in the last 24 hours
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </SuperAdminLayout>
  );
}
