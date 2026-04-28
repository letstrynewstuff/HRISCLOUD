// ─────────────────────────────────────────────────────────────
//  src/admin/employeemanagement/AdminEmployeeManagementPage.jsx
//
//  Central landing hub for the Employee Management module.
//  Route: /admin/employees
//
//  How it works:
//    • Renders the shared shell: sidebar + header + hero + tab strip
//    • Each tab calls navigate() to the corresponding sub-route
//    • Sub-pages are full standalone pages — they keep working
//      independently AND are reachable from this hub
//    • Active tab is inferred from the current pathname so the
//      tab highlight stays correct when navigating back
//
//  Sub-routes wired to tabs:
//    /admin/employees              → Employee List   (default)
//    /admin/employees/new          → Add Employee
//    /admin/employees/profile      → Employee Profile
//    /admin/employees/edit         → Edit Employee
//    /admin/employees/departments  → Departments
//    /admin/employees/roles        → Job Roles
//    /admin/employees/org-chart    → Org Chart
//    /admin/employees/bulk-import  → Bulk Import
//    /admin/employees/offboarding  → Offboarding
//    /admin/employees/approvals    → Approvals
//    /admin/employees/changes      → Profile Change Requests
//
//  Add to your router (App.jsx):
//    <Route path="/admin/employees" element={<AdminEmployeeManagementPage />} />
//    <Route path="/admin/employees/new" element={<AddEmployee />} />
//    <Route path="/admin/employees/profile" element={<EmployeeProfile />} />
//    <Route path="/admin/employees/:id/edit" element={<EditEmployee />} />
//    <Route path="/admin/employees/departments" element={<DepartmentsPage />} />
//    <Route path="/admin/employees/roles" element={<JobRolesPage />} />
//    <Route path="/admin/employees/org-chart" element={<OrgChart />} />
//    <Route path="/admin/employees/bulk-import" element={<BulkImport />} />
//    <Route path="/admin/employees/offboarding" element={<OffboardingPage />} />
//    <Route path="/admin/employees/approvals" element={<ApprovalsPage />} />
//    <Route path="/admin/employees/changes" element={<ProfileChangeRequests />} />
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
// import AdminSideNavbar from "../AdminSideNavbar";
import {
  Users,
  Search,
  Menu,
  Bell,
  ChevronRight,
  UserPlus,
  User,
  Edit3,
  Building2,
  Briefcase,
  GitBranch,
  Upload,
  LogOut,
  ClipboardCheck,
  UserCog,
  UserCheck,
  ArrowUpRight,
} from "lucide-react";

import { C, ADMIN, INITIAL_EMPLOYEES, INITIAL_REQUESTS } from "./sharedData";

/* ─────────────────────────────────────────
   TAB DEFINITIONS
   id must match a segment of the sub-route
   path is the full route navigate() will push
───────────────────────────────────────── */
const TABS = [
  {
    id: "list",
    label: "All Employees",
    icon: Users,
    path: "/admin/employeemanagement/admin-employeeslist",
    exact: true, // only active on exact match
    desc: "View, search and manage every employee record",
  },
  {
    id: "new",
    label: "Add Employee",
    icon: UserPlus,
    path: "/admin/employeemanagement/admin-addemployees",
    desc: "Onboard a new hire step-by-step",
  },
  {
    id: "profile",
    label: "Employee Profile",
    icon: User,
    path: "/admin/employeemanagement/admin-viewemployeesprofile",
    desc: "View full employee details and history",
  },
  {
    id: "edit",
    label: "Edit Employee",
    icon: Edit3,
    path: "/admin/employeemanagement/admin-approvals",
    desc: "Update employee information with audit trail",
  },
  {
    id: "departments",
    label: "Departments",
    icon: Building2,
    path: "/admin/employeemanagement/admin-departments",
    desc: "Manage company departments and headcount",
  },
  {
    id: "roles",
    label: "Job Roles",
    icon: Briefcase,
    path: "/admin/employeemanagement/admin-jobroles",
    desc: "Define and manage job roles and grades",
  },
  {
    id: "org-chart",
    label: "Org Chart",
    icon: GitBranch,
    path: "/admin/employeemanagement/admin-orgchart",
    desc: "Visualise the reporting hierarchy",
  },
  {
    id: "bulk-import",
    label: "Bulk Import",
    icon: Upload,
    path: "/admin/employeemanagement/admin-import",
    desc: "Import multiple employees via CSV",
  },
  {
    id: "offboarding",
    label: "Offboarding",
    icon: LogOut,
    path: "/admin/employeemanagement/admin-offboarding",
    desc: "Manage employee exits and clearances",
  },
  {
    id: "approvals",
    label: "Approvals",
    icon: ClipboardCheck,
    path: "/admin/employeemanagement/admin-approvals",
    desc: "Review and action pending HR approvals",
  },
  {
    id: "changes",
    label: "Change Requests",
    icon: UserCog,
    path: "/admin/employeemanagement/admin-profilechangerequests",
    desc: "Approve or reject employee profile update requests",
  },
];

/* ─────────────────────────────────────────
   QUICK STATS  (derived from sharedData)
───────────────────────────────────────── */
function useStats() {
  return {
    total: INITIAL_EMPLOYEES.length,
    active: INITIAL_EMPLOYEES.filter((e) => e.status === "Active").length,
    onLeave: INITIAL_EMPLOYEES.filter((e) => e.status === "On Leave").length,
    inactive: INITIAL_EMPLOYEES.filter((e) => e.status === "Inactive").length,
    pending: INITIAL_REQUESTS.filter((r) => r.status === "pending").length,
  };
}

/* ─────────────────────────────────────────
   ATOMS
───────────────────────────────────────── */
function StatPill({ label, value, color, bg }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-xl"
      style={{ background: "rgba(255,255,255,0.12)" }}
    >
      <span
        className="text-lg font-bold"
        style={{ fontFamily: "Sora,sans-serif", color }}
      >
        {value}
      </span>
      <span className="text-xs font-medium text-white/60">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────── */
export default function AdminEmployeeManagementPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const stats = useStats();

  /* ── Resolve which tab is active from the current URL ── */
  const activeTabId = (() => {
    const p = location.pathname;
    // Exact match for the root list page
    if (p === "/admin/employeemanagement" || p === "/admin/employeemanagement/")
      return "list";
    // Match the first path segment after /admin/employeemanagement/
    const segment = p.replace("/admin/employeemanagement/", "").split("/")[0];
    const found = TABS.find((t) => t.id === segment);
    return found ? found.id : "list";
  })();

  const activeTab = TABS.find((t) => t.id === activeTabId) || TABS[0];

  /* ── Navigate on tab click ── */
  const handleTabClick = (tab) => {
    navigate(tab.path);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: C.bg,
        color: C.textPrimary,
        fontFamily: "'DM Sans','Sora',sans-serif",
      }}
    >
      <div className="flex h-screen overflow-hidden">
        {/* ══ SIDEBAR ══ */}
        {/* <AdminSideNavbar
          sidebarOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          ADMIN={ADMIN}
          pendingApprovals={stats.pending}
        /> */}

        {/* ══ MAIN ══ */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* ── TOP NAV ── */}
          <header
            className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{
              background: "rgba(240,242,248,0.9)",
              backdropFilter: "blur(12px)",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            {/* Sidebar toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen((p) => !p)}
              className="p-2 rounded-xl hidden md:flex"
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
              }}
            >
              <Menu size={16} color={C.textSecondary} />
            </motion.button>

            {/* Breadcrumb */}
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: C.textSecondary }}
            >
              <span>Admin</span>
              <ChevronRight size={11} />
              <span className="font-semibold" style={{ color: C.textPrimary }}>
                Employee Management
              </span>
              {activeTabId !== "list" && (
                <>
                  <ChevronRight size={11} />
                  <span className="font-semibold" style={{ color: C.primary }}>
                    {activeTab.label}
                  </span>
                </>
              )}
            </div>

            {/* Search */}
            <motion.div
              className="flex-1 max-w-sm relative"
              animate={{ width: searchFocused ? "320px" : "240px" }}
              transition={{ duration: 0.25 }}
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
                placeholder="Search employees…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{
                  background: C.surface,
                  border: `1.5px solid ${searchFocused ? C.primary : C.border}`,
                  color: C.textPrimary,
                  boxShadow: searchFocused
                    ? `0 0 0 3px ${C.primaryLight}`
                    : "none",
                  transition: "all 0.2s",
                }}
              />
            </motion.div>

            {/* Right actions */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Add Employee shortcut */}
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  navigate("/admin/employeemanagement/admin-addemployees")
                }
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
                style={{
                  background: `linear-gradient(135deg,${C.primary},${C.purple})`,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: `0 3px 10px ${C.primaryGlow}`,
                }}
              >
                <UserPlus size={13} /> Add Employee
              </motion.button>

              {/* Pending badge */}
              {stats.pending > 0 && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    navigate(
                      "/admin/employeemanagement/admin-profilechangerequests",
                    )
                  }
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold"
                  style={{
                    background: C.warningLight,
                    color: C.warning,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Bell size={11} /> {stats.pending} Pending
                </motion.button>
              )}

              {/* Admin avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg,#6366F1,#06B6D4)",
                }}
              >
                {ADMIN.initials}
              </div>
            </div>
          </header>

          {/* ── SCROLLABLE CONTENT ── */}
          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
            {/* ── HERO BANNER ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl p-8 text-white relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
              }}
            >
              {/* Decorative blobs */}
              <div
                className="absolute -top-10 -right-10 w-52 h-52 rounded-full opacity-10 pointer-events-none"
                style={{
                  background: "radial-gradient(circle,#818CF8,transparent)",
                }}
              />
              <div
                className="absolute bottom-0 left-1/3 w-36 h-36 rounded-full opacity-10 pointer-events-none"
                style={{
                  background: "radial-gradient(circle,#06B6D4,transparent)",
                }}
              />

              <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                {/* Icon + title */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/15">
                    <Users size={28} color="#fff" />
                  </div>
                  <div>
                    <h1
                      className="text-3xl font-bold"
                      style={{ fontFamily: "Sora,sans-serif" }}
                    >
                      Employee Management
                    </h1>
                    <p className="text-indigo-200 mt-0.5">
                      Hire • Manage • Develop • Offboard
                    </p>
                  </div>
                </div>

                {/* Live stats row */}
                <div className="md:ml-auto flex flex-wrap gap-3">
                  <StatPill label="Total" value={stats.total} color="#fff" />
                  <StatPill
                    label="Active"
                    value={stats.active}
                    color="#6EE7B7"
                  />
                  <StatPill
                    label="On Leave"
                    value={stats.onLeave}
                    color="#FCD34D"
                  />
                  <StatPill
                    label="Inactive"
                    value={stats.inactive}
                    color="#FCA5A5"
                  />
                  {stats.pending > 0 && (
                    <StatPill
                      label="Pending"
                      value={stats.pending}
                      color="#FCD34D"
                    />
                  )}
                </div>
              </div>
            </motion.div>

            {/* ── TAB STRIP ── */}
            {/*
              Uses the correct pattern:
                - No Tailwind "border" class (causes black-border bug)
                - Full `border` in inline style with C.border token
                - Active state via inline style, NOT className utilities
                - overflow-x-auto + scrollbarWidth none for mobile
            */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1,
                duration: 0.38,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex gap-1 p-1 rounded-2xl overflow-x-auto"
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {TABS.map((tab) => {
                const active = activeTabId === tab.id;
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: active ? 1 : 1.02 }}
                    onClick={() => handleTabClick(tab)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0"
                    style={{
                      background: active ? C.primary : "transparent",
                      color: active ? "#ffffff" : C.textSecondary,
                      boxShadow: active
                        ? "0 2px 8px rgba(79,70,229,0.25)"
                        : "none",
                      border: "none",
                      cursor: "pointer",
                      transition:
                        "background 0.18s, color 0.18s, box-shadow 0.18s",
                    }}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </motion.button>
                );
              })}
            </motion.div>

            {/* ── ACTIVE TAB DESCRIPTION + QUICK ACTION ── */}
            <motion.div
              key={activeTabId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl"
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: C.primaryLight }}
                >
                  <activeTab.icon size={16} color={C.primary} />
                </div>
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{ color: C.textPrimary }}
                  >
                    {activeTab.label}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: C.textSecondary }}
                  >
                    {activeTab.desc}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03, x: 2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(activeTab.path)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shrink-0"
                style={{
                  background: `linear-gradient(135deg,${C.primary},${C.purple})`,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: `0 3px 10px ${C.primaryGlow}`,
                }}
              >
                Open {activeTab.label} <ArrowUpRight size={12} />
              </motion.button>
            </motion.div>

            {/* ── QUICK ACCESS GRID ── */}
            {/*
              Shows all module cards for discoverability.
              Clicking any card navigates to that route.
              This gives the page real utility as a hub —
              not just a tab strip.
            */}
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: C.textMuted }}
              >
                All Modules
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {TABS.map((tab, i) => {
                  const Icon = tab.icon;
                  const active = activeTabId === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.04, duration: 0.36 }}
                      whileHover={{
                        y: -3,
                        boxShadow: "0 10px 32px rgba(79,70,229,0.12)",
                      }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleTabClick(tab)}
                      className="flex flex-col items-start gap-3 p-4 rounded-2xl text-left"
                      style={{
                        background: active ? C.primaryLight : C.surface,
                        border: `1.5px solid ${active ? C.primary : C.border}`,
                        boxShadow: active
                          ? `0 4px 16px rgba(79,70,229,0.14)`
                          : "0 2px 8px rgba(15,23,42,0.04)",
                        cursor: "pointer",
                        transition: "border-color 0.18s, box-shadow 0.18s",
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{
                          background: active ? C.primary : C.primaryLight,
                        }}
                      >
                        <Icon
                          size={16}
                          color={active ? "#ffffff" : C.primary}
                        />
                      </div>
                      <div>
                        <p
                          className="text-xs font-bold leading-tight"
                          style={{ color: active ? C.primary : C.textPrimary }}
                        >
                          {tab.label}
                        </p>
                        <p
                          className="text-[10px] mt-1 leading-snug"
                          style={{ color: C.textMuted }}
                        >
                          {tab.desc}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="h-4" />
          </main>
        </div>
      </div>
    </div>
  );
}
