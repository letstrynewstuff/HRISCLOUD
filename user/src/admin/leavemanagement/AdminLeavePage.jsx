// src/admin/leavemanagement/AdminLeavePage.jsx

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSideNavbar from "../AdminSideNavbar";
import Loader from "../../components/Loader";
import C from "../../styles/colors";
import { leaveApi } from "../../api/service/leaveApi";
import { authApi } from "../../api/service/authApi";
import {
  Plane,
  Search,
  Menu,
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Users,
  Bell,
  RefreshCw,
} from "lucide-react";
import LeaveDashboard from "./LeaveDashboard";
import LeaveRequests from "./LeaveRequests";
import LeavePolicies from "./LeavePolicies";
import LeaveBalances from "./LeaveBalances";

const LEAVE_TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "requests", label: "Leave Requests", icon: FileText },
  { id: "policies", label: "Policies", icon: ShieldCheck },
  { id: "balances", label: "Employee Balances", icon: Users },
];

const fadeTab = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function AdminLeavePage() {
  /* ── Layout ── */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  /* ── Active tab — pure React state, no router involved ── */
  const [activeTab, setActiveTab] = useState("dashboard");

  /* ── Search — shared across all tabs ── */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  /* ── Metadata ── */
  const [pendingCount, setPendingCount] = useState(0);
  const [admin, setAdmin] = useState(null);

  /* ── Full-page loader (only on very first mount) ── */
  const [pageLoading, setPageLoading] = useState(true);

  /* ── Load auth + pending count on mount ── */
  const loadMeta = useCallback(async () => {
    try {
      const [meRes, reqRes] = await Promise.allSettled([
        authApi.getMe(),
        leaveApi.getAllRequests({ status: "pending", limit: 1 }),
      ]);
      if (meRes.status === "fulfilled")
        setAdmin(meRes.value?.data ?? meRes.value ?? null);
      if (reqRes.status === "fulfilled") {
        // Server returns meta.total for count — fall back to data.length
        const res = reqRes.value;
        setPendingCount(res?.meta?.total ?? res?.data?.length ?? 0);
      }
    } catch (err) {
      console.error("AdminLeavePage meta error:", err);
    } finally {
      setTimeout(() => setPageLoading(false), 400);
    }
  }, []);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  /* ── Derived admin display ── */
  const adminInitials = admin
    ? (
        (admin.firstName?.[0] ?? admin.first_name?.[0] ?? "A") +
        (admin.lastName?.[0] ?? admin.last_name?.[0] ?? "D")
      ).toUpperCase()
    : "AD";
  const adminName = admin
    ? `${admin.firstName ?? admin.first_name ?? "Admin"} ${admin.lastName ?? admin.last_name ?? ""}`.trim()
    : "Admin";

  /* ── Full-page loader while auth resolves ── */
  if (pageLoading) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ background: C.bg }}
      >
        <Loader />
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div
      className="min-h-screen"
      style={{
        background: C.bg,
        fontFamily: "'DM Sans','Sora',sans-serif",
        color: C.textPrimary,
      }}
    >
      <div className="flex h-screen overflow-hidden">
        {/* ── Sidebar ── */}
        <AdminSideNavbar
          sidebarOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          admin={admin}
          pendingApprovals={pendingCount}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* ── Top Bar ── */}
          <header
            className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{
              background: "rgba(240,242,248,0.9)",
              backdropFilter: "blur(16px)",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen((p) => !p)}
              className="p-2 rounded-xl"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              <Menu size={16} color={C.textSecondary} />
            </motion.button>

            {/* Search */}
            <motion.div
              className="flex-1 max-w-sm relative"
              animate={{ width: searchFocused ? "360px" : "280px" }}
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
                placeholder="Search employees, leave type…"
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
            </motion.div>

            <div className="flex items-center gap-2 ml-auto">
              {/* Refresh */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadMeta}
                title="Refresh"
                className="p-2 rounded-xl"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <RefreshCw size={14} color={C.textSecondary} />
              </motion.button>
              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-xl"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <Bell size={16} color={C.textSecondary} />
                {pendingCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                    style={{ background: C.danger }}
                  >
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </motion.button>
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg,#6366F1,#06B6D4)",
                }}
              >
                {adminInitials}
              </div>
            </div>
          </header>

          {/* ── Scrollable content ── */}
          <main className="flex-1 overflow-y-auto">
            {/* Hero Banner */}
            <div className="px-5 pt-5 md:px-7 md:pt-7">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative rounded-2xl overflow-hidden p-6 md:p-8 text-white mb-5"
                style={{
                  background:
                    "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
                  minHeight: 130,
                }}
              >
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div
                    className="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-10"
                    style={{
                      background: "radial-gradient(circle,#818CF8,transparent)",
                    }}
                  />
                  <div
                    className="absolute -bottom-8 left-1/3 w-40 h-40 rounded-full opacity-10"
                    style={{
                      background: "radial-gradient(circle,#06B6D4,transparent)",
                    }}
                  />
                </div>
                <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.15)" }}
                    >
                      <Plane size={22} color="#fff" />
                    </div>
                    <div>
                      <h1
                        className="text-2xl md:text-3xl font-bold"
                        style={{ fontFamily: "Sora,sans-serif" }}
                      >
                        Leave Management
                      </h1>
                      <p className="text-indigo-300 text-sm mt-0.5">
                        Real-time workforce visibility
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {[
                      {
                        label: "Pending",
                        value: pendingCount,
                        color: "#FDE68A",
                      },
                    ].map(({ label, value, color }) => (
                      <div
                        key={label}
                        className="px-4 py-2.5 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.10)" }}
                      >
                        <p
                          className="text-xl font-bold"
                          style={{ color, fontFamily: "Sora,sans-serif" }}
                        >
                          {value}
                        </p>
                        <p className="text-[11px] text-white/60">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* ── TAB BAR ──────────────────────────────────────────────────
                  These are pure buttons calling setActiveTab.
                  NO NavLink, NO router. Clicking ONLY changes activeTab state.
              ─────────────────────────────────────────────────────────────── */}
              <div
                className="flex gap-1 p-1 rounded-xl w-fit mb-6 flex-wrap"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                {LEAVE_TABS.map(({ id, label, icon: Icon }) => {
                  const active = activeTab === id;
                  return (
                    <motion.button
                      key={id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setActiveTab(id); // ← This is ALL that happens
                        setSearchQuery(""); // ← Reset search on tab switch
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                      style={{
                        background: active ? C.primary : "transparent",
                        color: active ? "#fff" : C.textSecondary,
                      }}
                    >
                      <Icon size={15} />
                      <span className="hidden sm:inline">{label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* ── Tab Content ── */}
            <div className="px-5 pb-8 md:px-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={fadeTab}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                >
                  {activeTab === "dashboard" && (
                    <LeaveDashboard
                      onTabChange={setActiveTab} // ← correct prop: onTabChange
                      searchQuery={searchQuery}
                    />
                  )}
                  {activeTab === "requests" && (
                    <LeaveRequests
                      onTabChange={setActiveTab}
                      searchQuery={searchQuery}
                    />
                  )}
                  {activeTab === "policies" && (
                    <LeavePolicies
                      onTabChange={setActiveTab}
                      searchQuery={searchQuery}
                    />
                  )}
                  {activeTab === "balances" && (
                    <LeaveBalances
                      onTabChange={setActiveTab}
                      searchQuery={searchQuery}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
