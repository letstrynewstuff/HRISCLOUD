

// src/admin/reports/ReportsListView.jsx

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  UserCheck,
} from "lucide-react";

import { C } from "../employeemanagement/sharedData";
import { reportApi } from "../../api/service/reportApi";
import {
  CATEGORY_OPTIONS,
  SEVERITY_OPTIONS,
  STATUS_OPTIONS,
  CategoryPill,
  SeverityBadge,
  StatusBadge,
  ReportAvatar,
  getInitials,
  fmtDate,
} from "./reportShared";

const PAGE_SIZE = 15;

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function ReportsListView({
  onViewReport,
  onStatsLoaded,
  onTotalLoaded,
}) {
  const [reports, setReports] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: PAGE_SIZE };
      if (search) params.search = search;
      if (status) params.status = status;
      if (category) params.category = category;
      if (severity) params.severity = severity;

      const [listRes, statsRes] = await Promise.all([
        reportApi.list(params),
        reportApi.getStats().catch(() => null),
      ]);
      setReports(listRes.data ?? []);
      setMeta(listRes.meta ?? { total: 0, totalPages: 1 });
      if (statsRes) setStats(statsRes.data ?? statsRes);
    } catch (err) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to load reports.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, status, category, severity]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, status, category, severity]);

  // Push stats up to parent for Header display
  useEffect(() => {
    if (!stats) return;
    const awaitingReview =
      (stats?.byStatus?.submitted ?? 0) + (stats?.byStatus?.under_review ?? 0);
    const highCritical =
      (stats?.bySeverity?.critical ?? 0) + (stats?.bySeverity?.high ?? 0);
    const resolvedCount = stats?.byStatus?.resolved ?? 0;

    onStatsLoaded?.([
      { label: "Awaiting Review", value: awaitingReview },
      { label: "High / Critical", value: highCritical },
      { label: "Resolved", value: resolvedCount },
    ]);
  }, [stats, onStatsLoaded]);

  // Push total count up to parent for subtitle
  useEffect(() => {
    onTotalLoaded?.(meta.total);
  }, [meta.total, onTotalLoaded]);

  const activeFilterCount = [category, severity].filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* Search + filter bar */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0}
        className="flex items-center gap-2"
      >
        <div className="flex-1 relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            color={C.textMuted}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject, description…"
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none"
            style={{
              background: C.surface,
              border: `1.5px solid ${search ? C.primary + "66" : C.border}`,
              color: C.textPrimary,
            }}
          />
        </div>
        <button
          onClick={() => setFilterOpen((p) => !p)}
          className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: filterOpen ? C.primaryLight : C.surface,
            border: `1px solid ${filterOpen ? C.primary + "44" : C.border}`,
          }}
        >
          <SlidersHorizontal
            size={16}
            color={filterOpen ? C.primary : C.textSecondary}
          />
          {activeFilterCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white"
              style={{ background: C.primary }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
        <button
          onClick={load}
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}
        >
          <RefreshCw size={15} color={C.textMuted} />
        </button>
      </motion.div>

      {/* Status tabs — same pattern as PayrollPage tab bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-1 p-1 rounded-2xl overflow-x-auto"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          scrollbarWidth: "none",
        }}
      >
        {["", ...STATUS_OPTIONS.map((o) => o.value)].map((st) => {
          const active = status === st;
          return (
            <motion.button
              key={st || "all"}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStatus(st)}
              className="px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors"
              style={{
                background: active ? C.primary : "transparent",
                color: active ? "#fff" : C.textSecondary,
                boxShadow: active
                  ? "0 2px 8px rgba(79,70,229,0.25)"
                  : "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {st ? STATUS_OPTIONS.find((o) => o.value === st)?.label : "All"}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Filter sheet */}
      {filterOpen && (
        <div
          className="p-4 rounded-2xl bg-white space-y-3"
          style={{ border: `1px solid ${C.border}` }}
        >
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-wide mb-2"
              style={{ color: C.textMuted }}
            >
              Category
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategory("")}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background: !category ? C.primaryLight : C.surfaceAlt,
                  color: !category ? C.primary : C.textSecondary,
                  border: `1px solid ${!category ? C.primary + "44" : C.border}`,
                }}
              >
                All
              </button>
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    background:
                      category === c.value ? C.primaryLight : C.surfaceAlt,
                    color: category === c.value ? C.primary : C.textSecondary,
                    border: `1px solid ${category === c.value ? C.primary + "44" : C.border}`,
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-wide mb-2"
              style={{ color: C.textMuted }}
            >
              Severity
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSeverity("")}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background: !severity ? C.primaryLight : C.surfaceAlt,
                  color: !severity ? C.primary : C.textSecondary,
                  border: `1px solid ${!severity ? C.primary + "44" : C.border}`,
                }}
              >
                All
              </button>
              {SEVERITY_OPTIONS.map((sv) => (
                <button
                  key={sv.value}
                  onClick={() => setSeverity(sv.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    background:
                      severity === sv.value ? C.primaryLight : C.surfaceAlt,
                    color: severity === sv.value ? C.primary : C.textSecondary,
                    border: `1px solid ${severity === sv.value ? C.primary + "44" : C.border}`,
                  }}
                >
                  {sv.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{
            background: C.dangerLight,
            border: `1px solid ${C.danger}33`,
          }}
        >
          <AlertCircle size={16} color={C.danger} />
          <p className="text-sm font-medium flex-1" style={{ color: C.danger }}>
            {error}
          </p>
          <button onClick={load}>
            <RefreshCw size={14} color={C.danger} />
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl animate-pulse"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <ShieldAlert size={40} color={C.textMuted} className="mb-3" />
          <p className="font-bold" style={{ color: C.textPrimary }}>
            No reports found
          </p>
          <p className="text-sm mt-1" style={{ color: C.textMuted }}>
            {search || activeFilterCount > 0 || status
              ? "Try a different search or filter"
              : "Employee reports will appear here"}
          </p>
        </div>
      ) : (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="grid sm:grid-cols-2 gap-3"
        >
          {reports.map((r) => (
            <button
              key={r.id}
              onClick={() => onViewReport(r.id)}
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <ReportAvatar
                    initials={getInitials(r.reporter?.name)}
                    anonymous={!r.reporter}
                    size={22}
                  />
                  <span
                    className="text-xs truncate"
                    style={{ color: C.textSecondary }}
                  >
                    {r.reporter?.name ?? "Anonymous"}
                  </span>
                </div>
                <span
                  className="text-[10px] shrink-0"
                  style={{ color: C.textMuted }}
                >
                  {fmtDate(r.createdAt)}
                </span>
              </div>
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
                {r.assignedTo ? (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold max-w-[140px] truncate"
                    style={{ background: C.primaryLight, color: C.primary }}
                  >
                    <UserCheck size={10} /> {r.assignedTo.name ?? "Assigned"}
                  </span>
                ) : (
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ background: C.surfaceAlt, color: C.textMuted }}
                  >
                    Unassigned
                  </span>
                )}
              </div>
            </button>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {!loading && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
          >
            <ChevronLeft size={16} color={C.textPrimary} />
          </button>
          <span
            className="text-xs font-bold"
            style={{ color: C.textSecondary }}
          >
            {page} / {meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
          >
            <ChevronRight size={16} color={C.textPrimary} />
          </button>
        </div>
      )}
    </div>
  );
}
