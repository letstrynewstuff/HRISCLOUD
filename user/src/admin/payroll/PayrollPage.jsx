// src/admin/payroll/PayrollPage.jsx
import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
// import AdminSideNavbar from "../AdminSideNavbar";
import { DollarSign, Search, Menu } from "lucide-react";
import { PayrollProvider } from "../../components/PayrollContext";
import { useAuth } from "../../components/useAuth";
import C from "../../styles/colors";

import PayrollDashboard from "./PayrollDashboard";
import RunPayroll from "./RunPayroll";
import PayrollHistory from "./PayrollHistory";
import SalaryConfiguration from "./SalaryConfiguration";
import DeductionsConfiguration from "./DeductionsConfiguration";
import StatutoryReports from "./StatutoryReports";
import PayslipViewer from "./PayslipViewer";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "run", label: "Run Payroll" },
  { id: "history", label: "History" },
  { id: "payslip", label: "Payslip Lookup" },
  { id: "salary", label: "Salary Config" },
  { id: "deductions", label: "Deductions" },
  { id: "reports", label: "Statutory Reports" },
];

const panelVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

function PayslipLookup() {
  const [employeeId, setEmployeeId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="space-y-5">
      <div
        className="p-5 rounded-2xl"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        <p
          className="text-sm font-semibold mb-3"
          style={{ color: C.textPrimary }}
        >
          Employee Payslip Lookup
        </p>
        <div className="flex gap-3 flex-wrap">
          <input
            value={employeeId}
            onChange={(e) => {
              setEmployeeId(e.target.value);
              setSubmitted(false);
            }}
            placeholder="Enter Employee ID (UUID)"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: C.surfaceAlt,
              border: `1.5px solid ${C.border}`,
              color: C.textPrimary,
              minWidth: 260,
            }}
          />
          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSubmitted(true)}
            disabled={!employeeId.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{
              background: C.primary,
              border: "none",
              cursor: employeeId.trim() ? "pointer" : "not-allowed",
              opacity: employeeId.trim() ? 1 : 0.5,
            }}
          >
            Load Payslip
          </Motion.button>
        </div>
      </div>
      {submitted && employeeId.trim() && (
        <PayslipViewer key={employeeId} employeeId={employeeId.trim()} />
      )}
    </div>
  );
}

function PayrollInner() {
  const { employee } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div
      className="min-h-screen"
      style={{ background: C.bg, fontFamily: "'DM Sans','Sora',sans-serif" }}
    >
      <div className="flex h-screen overflow-hidden">
        {/* <AdminSideNavbar
          sidebarOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          pendingApprovals={0}
        /> */}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                cursor: "pointer",
              }}
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
                placeholder="Search payroll…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{
                  background: C.surface,
                  border: `1.5px solid ${searchFocused ? C.primary : C.border}`,
                  color: C.textPrimary,
                  boxShadow: searchFocused
                    ? `0 0 0 3px ${C.primaryLight}`
                    : "none",
                }}
              />
            </Motion.div>
            <div className="flex items-center gap-2 ml-auto">
              {employee?.avatar ? (
                <img
                  src={employee.avatar}
                  alt={employee.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    background: "linear-gradient(135deg,#4F46E5,#06B6D4)",
                  }}
                >
                  {employee?.initials ?? "AD"}
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-5">
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl p-8 text-white"
              style={{
                background:
                  "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <DollarSign size={28} color="#fff" />
                </div>
                <div>
                  <h1
                    className="text-3xl font-bold"
                    style={{ fontFamily: "Sora,sans-serif" }}
                  >
                    Payroll Management
                  </h1>
                  <p className="text-indigo-200 text-sm mt-0.5">
                    Nigeria compliant · Manual & Assisted modes · Auto payslips
                  </p>
                </div>
              </div>
            </Motion.div>

            {/* ── Tab bar ── */}
            <Motion.div
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
              {TABS.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <Motion.button
                    key={tab.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab(tab.id)}
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
                    {tab.label}
                  </Motion.button>
                );
              })}
            </Motion.div>

            {/* ── Tab panel — single keyed wrapper ── */}
            <AnimatePresence mode="wait">
              <Motion.div
                key={activeTab}
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {activeTab === "dashboard" && (
                  <PayrollDashboard onRunPayroll={() => setActiveTab("run")} />
                )}
                {activeTab === "run" && (
                  <RunPayroll onComplete={() => setActiveTab("history")} />
                )}
                {activeTab === "history" && <PayrollHistory />}
                {activeTab === "payslip" && <PayslipLookup />}
                {activeTab === "salary" && <SalaryConfiguration />}
                {activeTab === "deductions" && <DeductionsConfiguration />}
                {activeTab === "reports" && <StatutoryReports />}
              </Motion.div>
            </AnimatePresence>

            <div className="h-6" />
          </main>
        </div>
      </div>
    </div>
  );
}

export default function AdminPayrollPage() {
  return (
    <PayrollProvider>
      <PayrollInner />
    </PayrollProvider>
  );
}
