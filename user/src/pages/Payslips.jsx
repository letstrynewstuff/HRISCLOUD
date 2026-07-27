


// src/pages/employee/Payslips.jsx
// Employee payslips — list, detail modal, tax summary, compare
// Connects to: GET /api/payroll/payslip/me/:month/:year  +  GET /api/auth/me

import { useState, useEffect, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";

import {
  DollarSign,
  Download,
  Search,
  Menu,
  X,
  Eye,
  EyeOff,
  FileText,
  AlertCircle,
  Loader2,
  RefreshCw,
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
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const STATUS_CFG = {
  draft:      { label: "Draft",      bg: C.bgMid, color: C.textSecondary },
  processing: { label: "Processing", bg: C.warningLight, color: C.warning },
  approved:   { label: "Approved",   bg: C.primaryTint, color: C.primary },
  paid:       { label: "Paid",       bg: C.successLight, color: C.success },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Payslip detail row ─── */
function DetailRow({ label, value, bold, indent }) {
  return (
    <div className={`flex items-center justify-between py-1.5 ${indent ? "pl-4" : ""}`}>
      <span
        className="text-sm"
        style={{ color: bold ? C.textPrimary : C.textSecondary, fontWeight: bold ? 600 : 400 }}
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
  const [employee, setEmployee]           = useState(null);
  const [payslips, setPayslips]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [fetching, setFetching]           = useState(false);
  const [error, setError]                 = useState(null);
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [searchQuery, setSearchQuery]     = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedYear, setSelectedYear]   = useState(new Date().getFullYear());
  const [masked, setMasked]               = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [activeTab, setActiveTab]         = useState("payslips");
  const printRef = useRef(null);

  // Load employee profile
  useEffect(() => {
    authApi
      .getMe()
      .then((me) => setEmployee(me))
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);


  useEffect(() => {
    if (!employee) return;
    const load = async () => {
      setFetching(true);
      const results = [];
      const now = new Date();
      const currentYear = now.getFullYear();

      // For current/past years, try all 12 months.
      // The API returns 404 for months with no payroll run — caught and skipped below.
      // No need to pre-filter: if HR ran payroll for August in June, it should show.
      const validMonths = selectedYear > currentYear ? [] : MONTHS;

      await Promise.allSettled(
        validMonths.map(async (m) => {
          try {
            const res = await getMyPayslip(m.value, selectedYear);
            if (res?.data) results.push(res.data);
          } catch {
            // 404 = no payslip for this month yet, skip silently
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

  const ytdGross      = payslips.reduce((s, p) => s + (p.grossSalary      ?? 0), 0);
  const ytdDeductions = payslips.reduce((s, p) => s + (p.totalDeductions  ?? 0), 0);
  const ytdNet        = payslips.reduce((s, p) => s + (p.netSalary        ?? 0), 0);

  const disp      = (n) => (masked ? mask()    : fmt(n));
  const dispShort = (n) => (masked ? "••••"    : fmtShort(n));

  const statusBadge = (status) =>
    STATUS_CFG[status] ?? { label: status, bg: C.surfaceAlt, color: C.textMuted };

  /* ─── PDF Download ─── */
  const handleDownload = (payslip, e) => {
    e?.stopPropagation();
    setDownloadingId(payslip.id);

    const script  = document.createElement("script");
    script.src    = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const W      = 210;
      const margin = 20;
      let y        = 0;

      const companyName = employee?.company?.name ?? "BantaHR";
      const fmt2 = (n) =>
        "NGN " + new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(n ?? 0);

      // Header banner
      doc.setFillColor(30, 27, 75);
      doc.rect(0, 0, W, 42, "F");
      doc.setFillColor(49, 46, 129);
      doc.rect(0, 28, W, 14, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text(companyName, margin, 16);
      doc.setFontSize(11);
      doc.text(`PAYSLIP — ${MONTH_NAMES[payslip.month].toUpperCase()} ${payslip.year}`, margin, 37);

      const badge = (payslip.runStatus ?? "paid").toUpperCase();
      doc.setFontSize(8);
      doc.setFillColor(16, 185, 129);
      doc.roundedRect(W - margin - 22, 31, 22, 8, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.text(badge, W - margin - 11, 36.5, { align: "center" });

      y = 52;

      // Employee details box
      doc.setFillColor(247, 248, 252);
      doc.roundedRect(margin, y, W - margin * 2, 38, 3, 3, "F");
      doc.setDrawColor(228, 231, 240);
      doc.roundedRect(margin, y, W - margin * 2, 38, 3, 3, "S");
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text("EMPLOYEE DETAILS", margin + 5, y + 7);

      const empName = payslip.employeeName ?? `${employee?.firstName ?? ""} ${employee?.lastName ?? ""}`;
      const details = [
        ["Employee Name",   empName],
        ["Employee Code",   payslip.employeeCode   ?? employee?.employeeCode ?? "—"],
        ["Department",      payslip.departmentName ?? employee?.department   ?? "—"],
        ["Job Title",       payslip.jobRoleName    ?? employee?.jobTitle     ?? "—"],
        ["Email",           employee?.email        ?? "—"],
        ["Account Number",  payslip.accountNumber  ?? employee?.accountNumber ?? "—"],
        ["Bank",            payslip.bankName       ?? employee?.bankName     ?? "—"],
        ["Pay Period",      `${MONTH_NAMES[payslip.month]} ${payslip.year}`],
      ];

      const col1 = details.slice(0, 4);
      const col2 = details.slice(4);
      const colX = [margin + 5, margin + (W - margin * 2) / 2 + 3];

      col1.forEach(([label, val], i) => {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(7);
        doc.text(label, colX[0], y + 15 + i * 7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(8);
        doc.text(String(val), colX[0], y + 19 + i * 7);
      });
      col2.forEach(([label, val], i) => {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(7);
        doc.text(label, colX[1], y + 15 + i * 7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(8);
        doc.text(String(val), colX[1], y + 19 + i * 7);
      });

      y += 46;

      // Earnings & Deductions side by side
      const colW = (W - margin * 2 - 5) / 2;

      doc.setFillColor(30, 27, 75);
      doc.roundedRect(margin, y, colW, 7, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("EARNINGS", margin + 4, y + 5);

      doc.setFillColor(239, 68, 68);
      doc.roundedRect(margin + colW + 5, y, colW, 7, 2, 2, "F");
      doc.text("DEDUCTIONS", margin + colW + 9, y + 5);

      y += 10;

      const earnings = [
        ["Basic Salary",        payslip.basicSalary],
        ["Housing Allowance",   payslip.housingAllowance],
        ["Transport Allowance", payslip.transportAllowance],
        ["Utility Allowance",   payslip.utilityAllowance],
        ["Meal Allowance",      payslip.mealAllowance],
        ...(payslip.overtime > 0 ? [["Overtime",  payslip.overtime]] : []),
        ...(payslip.bonus    > 0 ? [["Bonus",     payslip.bonus]]    : []),
      ];

      // ✅ FIXED: use correct API field names
      const deductions = [
        ["Income Tax (PAYE)",    payslip.payeTax],
        ["Pension (Employee 8%)", payslip.pensionEmployee],
        ["NHF (2.5%)",           payslip.nhfDeduction],
      ];

      const maxRows = Math.max(earnings.length, deductions.length);
      const rowH    = 8;

      for (let i = 0; i < maxRows; i++) {
        const bg = i % 2 === 0 ? [247, 248, 252] : [255, 255, 255];
        doc.setFillColor(...bg);
        doc.rect(margin,            y + i * rowH, colW, rowH, "F");
        doc.rect(margin + colW + 5, y + i * rowH, colW, rowH, "F");

        if (earnings[i]) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 116, 139);
          doc.setFontSize(7.5);
          doc.text(earnings[i][0], margin + 3, y + i * rowH + 5.5);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(15, 23, 42);
          doc.text(fmt2(earnings[i][1]), margin + colW - 3, y + i * rowH + 5.5, { align: "right" });
        }
        if (deductions[i]) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 116, 139);
          doc.setFontSize(7.5);
          doc.text(deductions[i][0], margin + colW + 8, y + i * rowH + 5.5);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(239, 68, 68);
          doc.text(fmt2(deductions[i][1]), margin + colW * 2 + 2, y + i * rowH + 5.5, { align: "right" });
        }
      }

      y += maxRows * rowH + 2;

      // Gross / Total deductions totals
      doc.setFillColor(238, 242, 255);
      doc.rect(margin, y, colW, 9, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(79, 70, 229);
      doc.text("Gross Salary", margin + 3, y + 6);
      doc.text(fmt2(payslip.grossSalary), margin + colW - 3, y + 6, { align: "right" });

      doc.setFillColor(254, 226, 226);
      doc.rect(margin + colW + 5, y, colW, 9, "F");
      doc.setTextColor(239, 68, 68);
      doc.text("Total Deductions", margin + colW + 8, y + 6);
      doc.text(fmt2(payslip.totalDeductions), margin + colW * 2 + 2, y + 6, { align: "right" });

      y += 14;

      // Net Pay
      doc.setFillColor(16, 185, 129);
      doc.roundedRect(margin, y, W - margin * 2, 14, 3, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("NET PAY", margin + 5, y + 9.5);
      doc.setFontSize(10);
      doc.text(fmt2(payslip.netSalary), W - margin - 3, y + 9.5, { align: "right" });

      y += 22;

      // Payment Summary
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("PAYMENT SUMMARY", margin, y);
      y += 5;

      const summaryRows = [
        ["Pay Period",      `${MONTH_NAMES[payslip.month]} ${payslip.year}`],
        ["Payment Date",    payslip.paymentDate ? new Date(payslip.paymentDate).toLocaleDateString("en-NG") : "—"],
        ["Payment Method",  payslip.paymentMethod ?? "Bank Transfer"],
        ["Account Number",  payslip.accountNumber ?? employee?.accountNumber ?? "—"],
        ["Bank Name",       payslip.bankName      ?? employee?.bankName      ?? "—"],
        ["Run Status",      (payslip.runStatus ?? "—").toUpperCase()],
      ];

      summaryRows.forEach(([label, val], i) => {
        const bg = i % 2 === 0 ? [247, 248, 252] : [255, 255, 255];
        doc.setFillColor(...bg);
        doc.rect(margin, y + i * 8, W - margin * 2, 8, "F");
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7.5);
        doc.text(label, margin + 4, y + i * 8 + 5.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text(String(val), W - margin - 4, y + i * 8 + 5.5, { align: "right" });
      });

      y += summaryRows.length * 8 + 10;

      // Footer
      doc.setFillColor(247, 248, 252);
      doc.rect(0, 272, W, 25, "F");
      doc.setDrawColor(228, 231, 240);
      doc.line(0, 272, W, 272);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(7.5);
      doc.text("This is a system-generated payslip and does not require a signature.", W / 2, 279, { align: "center" });
      doc.text("Powered by", W / 2 - 18, 289);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 27, 75);
      doc.text("Banta", W / 2 + 2, 289.5);
      doc.setTextColor(6, 182, 212);
      doc.text("HR", W / 2 + 14.5, 289.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(148, 163, 184);
      doc.text("PEOPLE PLATFORM", W / 2 + 21, 289.5);

      doc.save(`Payslip_${MONTH_NAMES[payslip.month]}_${payslip.year}_${empName.replace(/ /g, "_")}.pdf`);
      setTimeout(() => setDownloadingId(null), 1000);
    };

    document.head.appendChild(script);
  };

  const years    = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const initials = (me) =>
    me ? `${me.firstName?.[0] ?? ""}${me.lastName?.[0] ?? ""}`.toUpperCase() : "?";

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <RefreshCw size={26} className="animate-spin" style={{ color: C.primary }} />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="text-center space-y-3">
          <AlertCircle size={32} style={{ color: C.danger, margin: "0 auto" }} />
          <p style={{ color: C.danger }}>{error}</p>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: C.bg }}
    >
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* ── Header ── */}
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
              className="p-2 rounded-full hidden md:flex"
              style={{ background: C.surface }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="2">
                <line x1="3" y1="6"  x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
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
                className="p-2 rounded-full"
                style={{ background: C.surface, border: `1px solid ${C.border}` }}
                title={masked ? "Show amounts" : "Hide amounts"}
              >
                {masked
                  ? <Eye   size={15} color={C.textSecondary} />
                  : <EyeOff size={15} color={C.textSecondary} />}
              </Motion.button>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}
              >
                {initials(employee)}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">

            {/* ── Hero ── */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-7 text-white relative overflow-hidden"
              style={{ background: C.gradient.hero }}
            >
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
                    <DollarSign size={28} />
                  </div>
                  <div>
                    <h1 className="text-2xl ">
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
                      className="px-3 py-1.5 rounded-full text-sm font-semibold transition-all"
                      style={{
                        background: selectedYear === y ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)",
                        color: "#fff",
                        border: selectedYear === y ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent",
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
                  { label: "YTD Gross",       value: dispShort(ytdGross)      },
                  { label: "YTD Deductions",  value: dispShort(ytdDeductions) },
                  { label: "YTD Net",         value: dispShort(ytdNet)        },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl px-4 py-3 bg-white/10">
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-xs text-indigo-200">{s.label}</p>
                  </div>
                ))}
              </div>
            </Motion.div>

            {/* ── Tabs ── */}
            <div
              className="flex gap-1 p-1 rounded-2xl border"
              style={{ background: C.surface, borderColor: C.border }}
            >
              {[
                { id: "payslips", label: "Payslips" },
                { id: "tax",      label: "Tax & Deductions" },
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="px-5 py-2 rounded-full text-sm font-medium transition-all"
                    style={{
                      background:  active ? C.primary : "transparent",
                      color:       active ? "#fff"    : C.textSecondary,
                      boxShadow:   active ? "0 2px 8px rgba(79,70,229,0.25)" : "none",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Loading */}
            {fetching && (
              <div className="flex items-center justify-center py-12">
                <RefreshCw size={22} className="animate-spin" style={{ color: C.primary }} />
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
                          whileHover={{ y: -2, boxShadow: C.shadow.lift }}
                          onClick={() => setSelectedPayslip(p)}
                          className="rounded-2xl p-5 flex items-center gap-4 cursor-pointer"
                          style={{ background: C.surface, border: `1px solid ${C.border}` }}
                        >
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: C.primaryLight }}
                          >
                            <FileText size={18} color={C.primary} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm" style={{ color: C.textPrimary }}>
                              {MONTH_NAMES[p.month]} {p.year}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                              Gross: {disp(p.grossSalary)} · Deductions: {disp(p.totalDeductions)}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="font-bold text-sm" style={{ color: C.primary }}>
                              {disp(p.netSalary)}
                            </p>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: badge.bg, color: badge.color }}
                            >
                              {badge.label}
                            </span>
                          </div>

                          <Motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => handleDownload(p, e)}
                            className="p-2 rounded-full ml-2"
                            style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}
                          >
                            {downloadingId === p.id
                              ? <Loader2 size={14} className="animate-spin" color={C.primary} />
                              : <Download size={14} color={C.textSecondary} />}
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
                style={{ background: C.surface, border: `1px solid ${C.border}` }}
              >
                <div className="px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
                    Tax & Statutory Deductions — {selectedYear} YTD
                  </p>
                </div>

                {payslips.length === 0 ? (
                  <div className="py-12 text-center text-sm" style={{ color: C.textMuted }}>
                    No data for {selectedYear}.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ background: C.surfaceAlt }}>
                          {["Month", "Gross", "Income Tax (PAYE)", "Pension (8%)", "NHF (2.5%)", "Net"].map((h) => (
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
                          <tr key={i} className="border-b" style={{ borderColor: C.border }}>
                            <td className="px-5 py-3 font-medium text-sm" style={{ color: C.textPrimary }}>
                              {MONTH_NAMES[p.month]}
                            </td>
                            <td className="px-5 py-3 text-sm">
                              {disp(p.grossSalary)}
                            </td>
                            {/* FIXED: correct field names from API */}
                            <td className="px-5 py-3 text-sm" style={{ color: C.danger }}>
                              {disp(p.payeTax)}
                            </td>
                            <td className="px-5 py-3 text-sm" style={{ color: C.warning }}>
                              {disp(p.pensionEmployee)}
                            </td>
                            <td className="px-5 py-3 text-sm" style={{ color: "#6366F1" }}>
                              {disp(p.nhfDeduction)}
                            </td>
                            <td className="px-5 py-3 text-sm font-bold" style={{ color: C.success }}>
                              {disp(p.netSalary)}
                            </td>
                          </tr>
                        ))}

                        {/* Totals row */}
                        <tr style={{ background: C.surfaceAlt }}>
                          <td className="px-5 py-3 font-bold text-sm" style={{ color: C.textPrimary }}>
                            Total
                          </td>
                          <td className="px-5 py-3 font-bold text-sm">
                            {disp(ytdGross)}
                          </td>
                          {/* FIXED: correct field names in YTD totals */}
                          <td className="px-5 py-3 font-bold text-sm" style={{ color: C.danger }}>
                            {disp(payslips.reduce((s, p) => s + (p.payeTax       ?? 0), 0))}
                          </td>
                          <td className="px-5 py-3 font-bold text-sm" style={{ color: C.warning }}>
                            {disp(payslips.reduce((s, p) => s + (p.pensionEmployee ?? 0), 0))}
                          </td>
                          <td className="px-5 py-3 font-bold text-sm" style={{ color: "#6366F1" }}>
                            {disp(payslips.reduce((s, p) => s + (p.nhfDeduction  ?? 0), 0))}
                          </td>
                          <td className="px-5 py-3 font-bold text-sm" style={{ color: C.success }}>
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
              animate={{ scale: 1,    opacity: 1 }}
              exit={{    scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
              ref={printRef}
            >
              {/* Modal header */}
              <div
                className="px-6 py-5 flex items-center justify-between"
                style={{ background: C.gradient.hero, color: "#fff" }}
              >
                <div>
                  <p className="font-bold text-lg">
                    {MONTH_NAMES[selectedPayslip.month]} {selectedPayslip.year} Payslip
                  </p>
                  <p className="text-indigo-200 text-sm">
                    {selectedPayslip.employeeName ?? `${employee?.firstName} ${employee?.lastName}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleDownload(selectedPayslip, e)}
                    className="p-2 rounded-full bg-white/15"
                    title="Download PDF"
                  >
                    <Download size={15} color="#fff" />
                  </Motion.button>
                  <button
                    onClick={() => setSelectedPayslip(null)}
                    className="p-2 rounded-full bg-white/15"
                  >
                    <X size={15} color="#fff" />
                  </button>
                </div>
              </div>

              {/* Modal body */}
              <div className="p-6 space-y-5">

                {/* Employee info grid */}
                <div className="grid grid-cols-2 gap-3 text-xs" style={{ color: C.textMuted }}>
                  <div>
                    <p className="font-semibold">Department</p>
                    <p style={{ color: C.textPrimary }}>{selectedPayslip.departmentName ?? "—"}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Job Role</p>
                    <p style={{ color: C.textPrimary }}>{selectedPayslip.jobRoleName ?? "—"}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Employee Code</p>
                    <p style={{ color: C.textPrimary }}>{selectedPayslip.employeeCode ?? "—"}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Status</p>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: STATUS_CFG[selectedPayslip.runStatus]?.bg    ?? C.surfaceAlt,
                        color:      STATUS_CFG[selectedPayslip.runStatus]?.color ?? C.textMuted,
                      }}
                    >
                      {STATUS_CFG[selectedPayslip.runStatus]?.label ?? selectedPayslip.runStatus ?? "—"}
                    </span>
                  </div>
                </div>

                {/* Earnings */}
                <div className="rounded-xl p-4" style={{ background: C.surfaceAlt }}>
                  <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: C.textMuted }}>
                    Earnings
                  </p>
                  <DetailRow label="Basic Salary"        value={disp(selectedPayslip.basicSalary)}        indent />
                  <DetailRow label="Housing Allowance"   value={disp(selectedPayslip.housingAllowance)}   indent />
                  <DetailRow label="Transport Allowance" value={disp(selectedPayslip.transportAllowance)} indent />
                  <DetailRow label="Utility Allowance"   value={disp(selectedPayslip.utilityAllowance)}   indent />
                  <DetailRow label="Meal Allowance"      value={disp(selectedPayslip.mealAllowance)}      indent />
                  {selectedPayslip.overtime > 0 && (
                    <DetailRow label="Overtime" value={disp(selectedPayslip.overtime)} indent />
                  )}
                  {selectedPayslip.bonus > 0 && (
                    <DetailRow label="Bonus" value={disp(selectedPayslip.bonus)} indent />
                  )}
                  <div className="border-t mt-2 pt-2" style={{ borderColor: C.border }}>
                    <DetailRow label="Gross Salary" value={disp(selectedPayslip.grossSalary)} bold />
                  </div>
                </div>

                {/* Deductions — FIXED: all three use correct API field names */}
                <div className="rounded-xl p-4" style={{ background: "#FEE2E2" }}>
                  <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: C.danger }}>
                    Deductions
                  </p>
                  <DetailRow
                    label="Income Tax (PAYE)"
                    value={disp(selectedPayslip.payeTax)}
                    indent
                  />
                  <DetailRow
                    label="Pension (Employee 8%)"
                    value={disp(selectedPayslip.pensionEmployee)}
                    indent
                  />
                  <DetailRow
                    label="NHF (2.5% of Gross)"
                    value={disp(selectedPayslip.nhfDeduction)}
                    indent
                  />
                  <div className="border-t mt-2 pt-2" style={{ borderColor: "#EF4444" }}>
                    <DetailRow label="Total Deductions" value={disp(selectedPayslip.totalDeductions)} bold />
                  </div>
                </div>

                {/* Net Pay */}
                <div
                  className="rounded-xl p-4 flex items-center justify-between"
                  style={{ background: C.successLight, border: `1px solid #10B981` }}
                >
                  <span className="font-bold" style={{ color: C.success }}>Net Pay</span>
                  <span className="text-xl font-bold" style={{ color: C.success }}>
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