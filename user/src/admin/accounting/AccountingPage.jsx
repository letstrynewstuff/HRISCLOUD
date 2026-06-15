// src/admin/accounting/AccountingPage.jsx
// Central hub — mirrors AdminAttendancePage exactly in structure.
// Sub-pages are rendered inline via tab switching (same pattern as Attendance).

import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Search,
  Menu,
  TrendingUp,
  DollarSign,
  FileText,
  Shield,
} from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import ChartOfAccounts from "./ChartOfAccounts";
import GeneralLedger from "./GeneralLedger";
import AuditTrail from "./AuditTrail";
import API from "../../api/axios";
import BankReconciliation from "./BankReconciliation";
import TaxManagement from "./TaxManagement";

const TABS = [
  { id: "chart", label: "Chart of Accounts", icon: BookOpen },
  { id: "ledger", label: "General Ledger", icon: FileText },
  { id: "audit", label: "Audit Trail", icon: Shield },
  { id: "reconciliation", label: "Bank Reconciliation", icon: TrendingUp },
  { id: "tax", label: "Tax Management", icon: DollarSign },
];

export default function AccountingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState("chart");
  const [summary, setSummary] = useState(null);

  // Fetch quick summary stats for hero
  useEffect(() => {
    API.get("/accounting/summary")
      .then((r) => setSummary(r.data))
      .catch(() => {});
  }, []);

  const fmt = (kobo) =>
    kobo != null
      ? `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`
      : "—";

  return (
    <div
      className="min-h-screen"
      style={{
        background: C.bg ?? "#F0F2F8",
        fontFamily: "'DM Sans','Sora',sans-serif",
      }}
    >
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* ── TOP HEADER — identical to AttendancePage ── */}
          <header
            className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{
              background: "rgba(240,242,248,0.9)",
              backdropFilter: "blur(12px)",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen((p) => !p)}
              className="p-2 rounded-xl"
              style={{ background: C.surface }}
            >
              <Menu size={16} color={C.textSecondary} />
            </Motion.button>

            <Motion.div
              className="flex-1 max-w-sm relative"
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
                placeholder="Search accounts, entries…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{
                  background: C.surface,
                  border: `1.5px solid ${searchFocused ? C.primary : C.border}`,
                  color: C.textPrimary,
                }}
              />
            </Motion.div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
            {/* ── HERO BANNER — same gradient/structure as Attendance ── */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-8 text-white"
              style={{
                background:
                  "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
              }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/15">
                  <BookOpen size={28} />
                </div>
                <div>
                  <h1
                    className="text-3xl font-bold"
                    style={{ fontFamily: "Sora,sans-serif" }}
                  >
                    Accounting
                  </h1>
                  <p className="text-indigo-200">
                    Double-entry bookkeeping • General Ledger • Audit Trail
                  </p>
                </div>
              </div>

              {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Assets", value: fmt(summary?.totalAssets) },
                  {
                    label: "Total Liabilities",
                    value: fmt(summary?.totalLiabilities),
                  },
                  { label: "Net Equity", value: fmt(summary?.netEquity) },
                  {
                    label: "Journal Entries",
                    value: summary?.journalEntries ?? "—",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl px-4 py-3 bg-white/10 backdrop-blur-sm"
                  >
                    <p
                      className="text-xl font-bold"
                      style={{ fontFamily: "Sora,sans-serif" }}
                    >
                      {s.value}
                    </p>
                    <p className="text-xs text-indigo-200">{s.label}</p>
                  </div>
                ))}
              </div> */}
            </Motion.div>

            {/* ── TAB STRIP — identical to Attendance ── */}
            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-1 p-1 rounded-2xl border overflow-x-auto"
              style={{
                background: C.surface,
                borderColor: C.border,
                scrollbarWidth: "none",
              }}
            >
              {TABS.map((tab) => {
                const active = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <Motion.button
                    key={tab.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0"
                    style={{
                      background: active ? C.primary : "transparent",
                      color: active ? "#ffffff" : C.textSecondary,
                      boxShadow: active
                        ? "0 2px 8px rgba(79,70,229,0.25)"
                        : "none",
                      cursor: "pointer",
                    }}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </Motion.button>
                );
              })}
            </Motion.div>

            {/* ── TAB CONTENT ── */}
            <AnimatePresence mode="wait">
              {activeTab === "chart" && (
                <ChartOfAccounts key="chart" searchQuery={searchQuery} />
              )}
              {activeTab === "ledger" && (
                <GeneralLedger key="ledger" searchQuery={searchQuery} />
              )}
              {activeTab === "audit" && (
                <AuditTrail key="audit" searchQuery={searchQuery} />
              )}
              {activeTab === "reconciliation" && (
                <BankReconciliation key="reconciliation" searchQuery={searchQuery} />
              )}
              {activeTab === "tax" && (
                <TaxManagement key="tax" searchQuery={searchQuery} />
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
