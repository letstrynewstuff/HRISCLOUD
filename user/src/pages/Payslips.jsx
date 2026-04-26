// src/pages/employee/Payslips.jsx
// Employee payslips — list, detail modal, tax summary, compare
// Connects to: GET /api/payroll/payslip/me/:month/:year  +  GET /api/auth/me

import { useState, useEffect, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import SideNavbar from "../components/sideNavbar";
import {
  DollarSign,
  Download,
  Search,
  Menu,
  ChevronDown,
  X,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BarChart2,
  Lock,
  Printer,
  RefreshCw,
  Banknote,
} from "lucide-react";
import { getMyPayslip } from "../api/service/payrollApi";
import { authApi } from "../api/service/authApi";
import C from "../styles/colors";

/* ─── Helpers ─── */
const fmt = (n) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n ?? 0);
const fmtShort = (n) => {
  if (!n) return "₦0";
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n}`;
};
const mask = () => "₦ ••••••";

const MONTHS = [
  { label: "Jan", value: 1 },
  { label: "Feb", value: 2 },
  { label: "Mar", value: 3 },
  { label: "Apr", value: 4 },
  { label: "May", value: 5 },
  { label: "Jun", value: 6 },
  { label: "Jul", value: 7 },
  { label: "Aug", value: 8 },
  { label: "Sep", value: 9 },
  { label: "Oct", value: 10 },
  { label: "Nov", value: 11 },
  { label: "Dec", value: 12 },
];
const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const STATUS_CFG = {
  draft: { label: "Draft", bg: "#F1F5F9", color: "#64748B" },
  processing: { label: "Processing", bg: "#FEF3C7", color: "#F59E0B" },
  approved: { label: "Approved", bg: "#DBEAFE", color: "#2563EB" },
  paid: { label: "Paid", bg: "#D1FAE5", color: "#10B981" },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Mini bar chart ─── */
function MiniBar({ data, color }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-10">
      {data.map((v, i) => (
        <Motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ delay: 0.4 + i * 0.05, duration: 0.5, ease: "easeOut" }}
          className="flex-1 rounded-sm min-h-[2px]"
          style={{ background: i === data.length - 1 ? color : color + "55" }}
        />
      ))}
    </div>
  );
}

/* ─── Payslip detail row ─── */
function DetailRow({ label, value, bold, indent }) {
  return (
    <div
      className={`flex items-center justify-between py-1.5 ${indent ? "pl-4" : ""}`}
    >
      <span
        className="text-sm"
        style={{
          color: bold ? C.textPrimary : C.textSecondary,
          fontWeight: bold ? 600 : 400,
        }}
      >
        {label}
      </span>
      <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>
        {value}
      </span>
    </div>
  );
}

/* ════ MAIN ════ */
export default function PayslipsPage() {
  const [employee, setEmployee] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [masked, setMasked] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [activeTab, setActiveTab] = useState("payslips"); // payslips | tax
  const printRef = useRef(null);

  // Load employee profile first
  useEffect(() => {
    authApi
      .getMe()
      .then((me) => setEmployee(me))
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  // Load payslips for the selected year (all 12 months, ignore 404s)
  // useEffect(() => {
  //   if (!employee) return;
  //   const load = async () => {
  //     setFetching(true);
  //     const results = [];
  //     await Promise.allSettled(
  //       MONTHS.map(async (m) => {
  //         try {
  //           const res = await getMyPayslip(m.value, selectedYear);
  //           if (res?.data) results.push(res.data);
  //         } catch {
  //           // month has no payslip yet — skip
  //         }
  //       }),
  //     );
  //     setPayslips(results.sort((a, b) => b.month - a.month));
  //     setFetching(false);
  //   };
  //   load();
  // }, [employee, selectedYear]);
  useEffect(() => {
    if (!employee) return;

    const load = async () => {
      setFetching(true);
      const results = [];

      // Get current date context
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // getMonth() is 0-indexed

      // Filter months to avoid requesting future dates
      const validMonths = MONTHS.filter((m) => {
        if (selectedYear < currentYear) return true; // All months in past years are valid
        if (selectedYear === currentYear) return m.value <= currentMonth + 1; // Current month + 1 (allow for early runs like your May record)
        return false; // Don't fetch anything for future years
      });

      await Promise.allSettled(
        validMonths.map(async (m) => {
          try {
            const res = await getMyPayslip(m.value, selectedYear);
            if (res?.data) results.push(res.data);
          } catch (err) {
            // Silently handle 404s
          }
        }),
      );

      setPayslips(results.sort((a, b) => b.month - a.month));
      setFetching(false);
    };

    load();
  }, [employee, selectedYear]);

  /* ─── Derived ─── */
  const filtered = payslips.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      MONTH_NAMES[p.month]?.toLowerCase().includes(q) ||
      String(p.year).includes(q)
    );
  });

  const ytdGross = payslips.reduce((s, p) => s + (p.grossSalary ?? 0), 0);
  const ytdDeductions = payslips.reduce(
    (s, p) => s + (p.totalDeductions ?? 0),
    0,
  );
  const ytdNet = payslips.reduce((s, p) => s + (p.netSalary ?? 0), 0);
  const chartData = [...payslips]
    .reverse()
    .slice(-6)
    .map((p) => p.netSalary ?? 0);

  const disp = (n) => (masked ? mask() : fmt(n));
  const dispShort = (n) => (masked ? "••••" : fmtShort(n));

  const statusBadge = (status) =>
    STATUS_CFG[status] ?? {
      label: status,
      bg: C.surfaceAlt,
      color: C.textMuted,
    };

  const handleDownload = (payslip, e) => {
    e?.stopPropagation();
    setDownloadingId(payslip.id);
    // Build plain-text payslip and trigger download
    const content = [
      `PAYSLIP — ${MONTH_NAMES[payslip.month]} ${payslip.year}`,
      `Employee: ${payslip.employeeName ?? `${employee?.firstName} ${employee?.lastName}`}`,
      `Department: ${payslip.departmentName ?? "—"}`,
      ``,
      `Gross Salary:     ${fmt(payslip.grossSalary)}`,
      `Total Deductions: ${fmt(payslip.totalDeductions)}`,
      `Net Salary:       ${fmt(payslip.netSalary)}`,
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Payslip_${MONTH_NAMES[payslip.month]}_${payslip.year}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setDownloadingId(null), 1000);
  };

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i,
  );

  const initials = (me) =>
    me
      ? `${me.firstName?.[0] ?? ""}${me.lastName?.[0] ?? ""}`.toUpperCase()
      : "?";

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: C.bg }}
      >
        <RefreshCw
          size={26}
          className="animate-spin"
          style={{ color: C.primary }}
        />
      </div>
    );

  if (error)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: C.bg }}
      >
        <div className="text-center space-y-3">
          <AlertCircle
            size={32}
            style={{ color: C.danger, margin: "0 auto" }}
          />
          <p style={{ color: C.danger }}>{error}</p>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: C.bg, fontFamily: "'DM Sans','Sora',sans-serif" }}
    >
      <div className="flex h-screen overflow-hidden">
        <SideNavbar sidebarOpen={sidebarOpen} employee={employee} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
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
                placeholder="Search payslips…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{
                  background: C.surface,
                  border: `1.5px solid ${searchFocused ? C.primary : C.border}`,
                  color: C.textPrimary,
                }}
              />
            </Motion.div>

            <div className="ml-auto flex items-center gap-3">
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMasked((p) => !p)}
                className="p-2 rounded-xl"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
                title={masked ? "Show amounts" : "Hide amounts"}
              >
                {masked ? (
                  <Eye size={15} color={C.textSecondary} />
                ) : (
                  <EyeOff size={15} color={C.textSecondary} />
                )}
              </Motion.button>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg,#4F46E5,#06B6D4)",
                }}
              >
                {initials(employee)}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
            {/* Hero */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-7 text-white relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg,#1E1B4B 0%,#312E81 55%,#1E40AF 100%)",
              }}
            >
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
                    <DollarSign size={28} />
                  </div>
                  <div>
                    <h1
                      className="text-2xl font-bold"
                      style={{ fontFamily: "Sora,sans-serif" }}
                    >
                      My Payslips
                    </h1>
                    <p className="text-indigo-200 text-sm">
                      {employee
                        ? `${employee.firstName} ${employee.lastName} · ${employee.company?.name ?? ""}`
                        : ""}
                    </p>
                  </div>
                </div>

                {/* Year selector */}
                <div className="flex items-center gap-2">
                  {years.map((y) => (
                    <button
                      key={y}
                      onClick={() => setSelectedYear(y)}
                      className="px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background:
                          selectedYear === y
                            ? "rgba(255,255,255,0.25)"
                            : "rgba(255,255,255,0.1)",
                        color: "#fff",
                        border:
                          selectedYear === y
                            ? "1px solid rgba(255,255,255,0.4)"
                            : "1px solid transparent",
                      }}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* YTD stats */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                {[
                  { label: "YTD Gross", value: dispShort(ytdGross) },
                  { label: "YTD Deductions", value: dispShort(ytdDeductions) },
                  { label: "YTD Net", value: dispShort(ytdNet) },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl px-4 py-3 bg-white/10"
                  >
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-xs text-indigo-200">{s.label}</p>
                  </div>
                ))}
              </div>
            </Motion.div>

            {/* Tabs */}
            <div
              className="flex gap-1 p-1 rounded-2xl border"
              style={{ background: C.surface, borderColor: C.border }}
            >
              {[
                { id: "payslips", label: "Payslips" },
                { id: "tax", label: "Tax & Deductions" },
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="px-5 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: active ? C.primary : "transparent",
                      color: active ? "#fff" : C.textSecondary,
                      boxShadow: active
                        ? "0 2px 8px rgba(79,70,229,0.25)"
                        : "none",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Loading state */}
            {fetching && (
              <div className="flex items-center justify-center py-12">
                <RefreshCw
                  size={22}
                  className="animate-spin"
                  style={{ color: C.primary }}
                />
              </div>
            )}

            {/* ── PAYSLIPS TAB ── */}
            {!fetching && activeTab === "payslips" && (
              <>
                {filtered.length === 0 ? (
                  <div className="py-16 flex flex-col items-center gap-3">
                    <FileText size={36} style={{ color: C.textMuted }} />
                    <p className="text-sm" style={{ color: C.textMuted }}>
                      No payslips found for {selectedYear}.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filtered.map((p, i) => {
                      const badge = statusBadge(p.runStatus ?? p.status);
                      return (
                        <Motion.div
                          key={p.id ?? i}
                          custom={i}
                          variants={fadeUp}
                          initial="hidden"
                          animate="visible"
                          whileHover={{
                            y: -2,
                            boxShadow: "0 8px 32px rgba(79,70,229,0.10)",
                          }}
                          onClick={() => setSelectedPayslip(p)}
                          className="rounded-2xl p-5 flex items-center gap-4 cursor-pointer"
                          style={{
                            background: C.surface,
                            border: `1px solid ${C.border}`,
                          }}
                        >
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: C.primaryLight }}
                          >
                            <FileText size={18} color={C.primary} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className="font-semibold text-sm"
                              style={{ color: C.textPrimary }}
                            >
                              {MONTH_NAMES[p.month]} {p.year}
                            </p>
                            <p
                              className="text-xs mt-0.5"
                              style={{ color: C.textMuted }}
                            >
                              Gross: {disp(p.grossSalary)} · Deductions:{" "}
                              {disp(p.totalDeductions)}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p
                              className="font-bold text-sm"
                              style={{ color: C.primary }}
                            >
                              {disp(p.netSalary)}
                            </p>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{
                                background: badge.bg,
                                color: badge.color,
                              }}
                            >
                              {badge.label}
                            </span>
                          </div>

                          <Motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => handleDownload(p, e)}
                            className="p-2 rounded-xl ml-2"
                            style={{
                              background: C.surfaceAlt,
                              border: `1px solid ${C.border}`,
                            }}
                          >
                            {downloadingId === p.id ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                                color={C.primary}
                              />
                            ) : (
                              <Download size={14} color={C.textSecondary} />
                            )}
                          </Motion.button>
                        </Motion.div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* ── TAX & DEDUCTIONS TAB ── */}
            {!fetching && activeTab === "tax" && (
              <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  className="px-5 py-4"
                  style={{ borderBottom: `1px solid ${C.border}` }}
                >
                  <p
                    className="font-bold text-sm"
                    style={{ color: C.textPrimary }}
                  >
                    Tax & Statutory Deductions — {selectedYear} YTD
                  </p>
                </div>
                {payslips.length === 0 ? (
                  <div
                    className="py-12 text-center text-sm"
                    style={{ color: C.textMuted }}
                  >
                    No data for {selectedYear}.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ background: C.surfaceAlt }}>
                          {[
                            "Month",
                            "Gross",
                            "Income Tax",
                            "Pension",
                            "NHF",
                            "Net",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-5 py-3 text-left text-xs font-bold uppercase"
                              style={{ color: C.textMuted }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {payslips.map((p, i) => (
                          <tr
                            key={i}
                            className="border-b"
                            style={{ borderColor: C.border }}
                          >
                            <td
                              className="px-5 py-3 font-medium text-sm"
                              style={{ color: C.textPrimary }}
                            >
                              {MONTH_NAMES[p.month]}
                            </td>
                            <td className="px-5 py-3 text-sm">
                              {disp(p.grossSalary)}
                            </td>
                            <td
                              className="px-5 py-3 text-sm"
                              style={{ color: C.danger }}
                            >
                              {disp(p.incomeTax ?? p.taxAmount)}
                            </td>
                            <td
                              className="px-5 py-3 text-sm"
                              style={{ color: C.warning }}
                            >
                              {disp(p.pensionEmployee ?? p.pension)}
                            </td>
                            <td
                              className="px-5 py-3 text-sm"
                              style={{ color: "#8B5CF6" }}
                            >
                              {disp(p.nhf)}
                            </td>
                            <td
                              className="px-5 py-3 text-sm font-bold"
                              style={{ color: C.success }}
                            >
                              {disp(p.netSalary)}
                            </td>
                          </tr>
                        ))}
                        {/* Totals row */}
                        <tr style={{ background: C.surfaceAlt }}>
                          <td
                            className="px-5 py-3 font-bold text-sm"
                            style={{ color: C.textPrimary }}
                          >
                            Total
                          </td>
                          <td className="px-5 py-3 font-bold text-sm">
                            {disp(ytdGross)}
                          </td>
                          <td
                            className="px-5 py-3 font-bold text-sm"
                            style={{ color: C.danger }}
                          >
                            {disp(
                              payslips.reduce(
                                (s, p) => s + (p.incomeTax ?? p.taxAmount ?? 0),
                                0,
                              ),
                            )}
                          </td>
                          <td
                            className="px-5 py-3 font-bold text-sm"
                            style={{ color: C.warning }}
                          >
                            {disp(
                              payslips.reduce(
                                (s, p) =>
                                  s + (p.pensionEmployee ?? p.pension ?? 0),
                                0,
                              ),
                            )}
                          </td>
                          <td
                            className="px-5 py-3 font-bold text-sm"
                            style={{ color: "#8B5CF6" }}
                          >
                            {disp(
                              payslips.reduce((s, p) => s + (p.nhf ?? 0), 0),
                            )}
                          </td>
                          <td
                            className="px-5 py-3 font-bold text-sm"
                            style={{ color: C.success }}
                          >
                            {disp(ytdNet)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </Motion.div>
            )}
          </main>
        </div>
      </div>

      {/* ── Payslip Detail Modal ── */}
      <AnimatePresence>
        {selectedPayslip && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
              ref={printRef}
            >
              {/* Modal header */}
              <div
                className="px-6 py-5 flex items-center justify-between"
                style={{
                  background: "linear-gradient(135deg,#1E1B4B,#312E81)",
                  color: "#fff",
                }}
              >
                <div>
                  <p
                    className="font-bold text-lg"
                    style={{ fontFamily: "Sora,sans-serif" }}
                  >
                    {MONTH_NAMES[selectedPayslip.month]} {selectedPayslip.year}{" "}
                    Payslip
                  </p>
                  <p className="text-indigo-200 text-sm">
                    {selectedPayslip.employeeName ??
                      `${employee?.firstName} ${employee?.lastName}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleDownload(selectedPayslip, e)}
                    className="p-2 rounded-xl bg-white/15"
                    title="Download"
                  >
                    <Download size={15} color="#fff" />
                  </Motion.button>
                  <button
                    onClick={() => setSelectedPayslip(null)}
                    className="p-2 rounded-xl bg-white/15"
                  >
                    <X size={15} color="#fff" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Employee info */}
                <div
                  className="grid grid-cols-2 gap-3 text-xs"
                  style={{ color: C.textMuted }}
                >
                  <div>
                    <p className="font-semibold">Department</p>
                    <p style={{ color: C.textPrimary }}>
                      {selectedPayslip.departmentName ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Job Role</p>
                    <p style={{ color: C.textPrimary }}>
                      {selectedPayslip.jobRoleName ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Employee Code</p>
                    <p style={{ color: C.textPrimary }}>
                      {selectedPayslip.employeeCode ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Status</p>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background:
                          STATUS_CFG[selectedPayslip.runStatus]?.bg ??
                          C.surfaceAlt,
                        color:
                          STATUS_CFG[selectedPayslip.runStatus]?.color ??
                          C.textMuted,
                      }}
                    >
                      {STATUS_CFG[selectedPayslip.runStatus]?.label ??
                        selectedPayslip.runStatus ??
                        "—"}
                    </span>
                  </div>
                </div>

                {/* Earnings */}
                <div
                  className="rounded-xl p-4"
                  style={{ background: C.surfaceAlt }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-wide mb-3"
                    style={{ color: C.textMuted }}
                  >
                    Earnings
                  </p>
                  <DetailRow
                    label="Basic Salary"
                    value={disp(selectedPayslip.basicSalary)}
                    indent
                  />
                  <DetailRow
                    label="Housing Allowance"
                    value={disp(selectedPayslip.housingAllowance)}
                    indent
                  />
                  <DetailRow
                    label="Transport Allowance"
                    value={disp(selectedPayslip.transportAllowance)}
                    indent
                  />
                  <DetailRow
                    label="Utility Allowance"
                    value={disp(selectedPayslip.utilityAllowance)}
                    indent
                  />
                  <DetailRow
                    label="Meal Allowance"
                    value={disp(selectedPayslip.mealAllowance)}
                    indent
                  />
                  {selectedPayslip.overtimePay > 0 && (
                    <DetailRow
                      label="Overtime Pay"
                      value={disp(selectedPayslip.overtimePay)}
                      indent
                    />
                  )}
                  {selectedPayslip.bonusAmount > 0 && (
                    <DetailRow
                      label="Bonus"
                      value={disp(selectedPayslip.bonusAmount)}
                      indent
                    />
                  )}
                  <div
                    className="border-t mt-2 pt-2"
                    style={{ borderColor: C.border }}
                  >
                    <DetailRow
                      label="Gross Salary"
                      value={disp(selectedPayslip.grossSalary)}
                      bold
                    />
                  </div>
                </div>

                {/* Deductions */}
                <div
                  className="rounded-xl p-4"
                  style={{ background: "#FFF5F5" }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-wide mb-3"
                    style={{ color: C.danger }}
                  >
                    Deductions
                  </p>
                  <DetailRow
                    label="Income Tax (PAYE)"
                    value={disp(
                      selectedPayslip.incomeTax ?? selectedPayslip.taxAmount,
                    )}
                    indent
                  />
                  <DetailRow
                    label="Pension (Employee)"
                    value={disp(
                      selectedPayslip.pensionEmployee ??
                        selectedPayslip.pension,
                    )}
                    indent
                  />
                  <DetailRow
                    label="NHF"
                    value={disp(selectedPayslip.nhf)}
                    indent
                  />
                  {selectedPayslip.healthInsurance > 0 && (
                    <DetailRow
                      label="Health Insurance"
                      value={disp(selectedPayslip.healthInsurance)}
                      indent
                    />
                  )}
                  {selectedPayslip.loanDeduction > 0 && (
                    <DetailRow
                      label="Loan Deduction"
                      value={disp(selectedPayslip.loanDeduction)}
                      indent
                    />
                  )}
                  <div
                    className="border-t mt-2 pt-2"
                    style={{ borderColor: "#FCA5A5" }}
                  >
                    <DetailRow
                      label="Total Deductions"
                      value={disp(selectedPayslip.totalDeductions)}
                      bold
                    />
                  </div>
                </div>

                {/* Net */}
                <div
                  className="rounded-xl p-4 flex items-center justify-between"
                  style={{
                    background: C.successLight,
                    border: `1px solid #6EE7B7`,
                  }}
                >
                  <span className="font-bold" style={{ color: C.success }}>
                    Net Pay
                  </span>
                  <span
                    className="text-xl font-bold"
                    style={{ color: C.success }}
                  >
                    {disp(selectedPayslip.netSalary)}
                  </span>
                </div>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
