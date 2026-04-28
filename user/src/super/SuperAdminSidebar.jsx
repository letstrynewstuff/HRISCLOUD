// src/superadmin/SuperAdminSidebar.jsx
// Fixed left sidebar for super admin — matches design image

import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import C from "../styles/colors";
import {
  Shield,
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  BarChart2,
  Settings,
  ScrollText,
  Activity,
  ChevronLeft,
  LogOut,
  Loader2,
  Crown,
} from "lucide-react";

const T = {
  sidebar: "#0F0C29",
  sidebarMid: "#1a1640",
  sidebarHover: "rgba(79,70,229,0.18)",
  sidebarActive: "rgba(79,70,229,0.30)",
  accent: "#4F46E5",
  accentGlow: "rgba(79,70,229,0.35)",
  border: "rgba(255,255,255,0.08)",
  textPrimary: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.40)",
  textSub: "rgba(255,255,255,0.65)",
};

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/super-admin/dashboard" },
  { label: "Companies", icon: Building2, path: "/super-admin/companies" },
  { label: "Global Users", icon: Users, path: "/super-admin/users" },
  {
    label: "Subscriptions",
    icon: CreditCard,
    path: "/super-admin/subscriptions",
  },
  { label: "Analytics", icon: BarChart2, path: "/super-admin/analytics" },
  {
    label: "Configuration",
    icon: Settings,
    path: "/super-admin/configuration",
  },
  { label: "Audit Logs", icon: ScrollText, path: "/super-admin/audit-logs" },
  {
    label: "System Monitoring",
    icon: Activity,
    path: "/super-admin/system-monitoring",
  },
];

const ROLE_HIERARCHY = [
  { label: "Super Admin (You)", icon: Crown, color: "#A78BFA" },
  { label: "HR Manager", icon: Shield, color: "#60A5FA" },
  { label: "Employees", icon: Users, color: T.textSub },
];

function NavItem({ item, collapsed }) {
  const Icon = item.icon;
  return (
    <NavLink to={item.path}>
      {({ isActive }) => (
        <Motion.div
          whileHover={{ x: collapsed ? 0 : 3 }}
          whileTap={{ scale: 0.97 }}
          className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer`}
          style={{
            background: isActive ? T.sidebarActive : "transparent",
            color: isActive ? "#fff" : T.textSub,
            border: isActive
              ? `1px solid ${T.accent}33`
              : "1px solid transparent",
          }}
        >
          <Icon size={15} />
          {!collapsed && <span>{item.label}</span>}
        </Motion.div>
      )}
    </NavLink>
  );
}

export default function SuperAdminSidebar({ sidebarOpen, admin, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const initials = admin
    ? (
        (admin.first_name?.[0] ?? "S") + (admin.last_name?.[0] ?? "A")
      ).toUpperCase()
    : "SA";
  const name = admin
    ? `${admin.first_name ?? "Super"} ${admin.last_name ?? "Admin"}`.trim()
    : "Super Admin";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await onLogout?.();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <Motion.aside
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ duration: 0.28 }}
          className="hidden md:flex flex-col shrink-0 h-full z-20 relative overflow-y-auto"
          style={{
            width: collapsed ? 64 : 240,
            background: T.sidebar,
            borderRight: `1px solid ${T.border}`,
            boxShadow: "4px 0 40px rgba(0,0,0,0.4)",
            transition: "width 0.3s ease",
          }}
        >
          {/* Logo */}
          <div
            className="px-4 pt-5 pb-4 flex items-center gap-3 overflow-hidden shrink-0"
            style={{ borderBottom: `1px solid ${T.border}` }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg,#6366F1,#4F46E5)",
                boxShadow: `0 4px 12px ${T.accentGlow}`,
              }}
            >
              <Crown size={18} color="#fff" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">
                  HRIS Cloud
                </p>
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: T.accent }}
                >
                  Super Admin
                </p>
              </div>
            )}
            <Motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCollapsed((p) => !p)}
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: T.sidebarMid,
                border: `1px solid ${T.border}`,
              }}
            >
              <Motion.div
                animate={{ rotate: collapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronLeft size={12} color={T.textMuted} />
              </Motion.div>
            </Motion.button>
          </div>

          {/* Super Admin badge */}
          {!collapsed && (
            <div
              className="mx-3 mt-3 mb-1 rounded-xl p-3"
              style={{
                background: "rgba(79,70,229,0.18)",
                border: `1px solid rgba(79,70,229,0.25)`,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Crown size={12} color="#A78BFA" />
                <p
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "#A78BFA" }}
                >
                  Super Admin
                </p>
              </div>
              <p className="text-[10px]" style={{ color: T.textMuted }}>
                Platform owner — manage entire HRIS SaaS across all companies.
              </p>
            </div>
          )}

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.label} item={item} collapsed={collapsed} />
            ))}
          </nav>

          {/* Role hierarchy */}
          {!collapsed && (
            <div
              className="mx-3 mb-3 rounded-xl overflow-hidden"
              style={{ border: `1px solid ${T.border}` }}
            >
              <p
                className="text-[9px] font-bold uppercase tracking-widest px-3 pt-2.5 pb-1.5"
                style={{ color: T.textMuted }}
              >
                Role Hierarchy
              </p>
              {ROLE_HIERARCHY.map((r, i) => (
                <div
                  key={r.label}
                  className="flex items-center gap-2.5 px-3 py-2"
                  style={{
                    background:
                      i === 0 ? "rgba(167,139,250,0.1)" : "transparent",
                    borderBottom: i < 2 ? `1px solid ${T.border}` : "none",
                  }}
                >
                  <r.icon size={12} color={r.color} />
                  <p
                    className="text-[10px] font-medium"
                    style={{ color: r.color }}
                  >
                    {r.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div
            className="px-2 pb-3 space-y-1"
            style={{ borderTop: `1px solid ${T.border}`, paddingTop: 8 }}
          >
            <Motion.button
              whileHover={{
                x: collapsed ? 0 : 3,
                background: "rgba(239,68,68,0.12)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              disabled={loggingOut}
              className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-xl text-sm`}
              style={{ color: "#EF4444", opacity: loggingOut ? 0.7 : 1 }}
            >
              {loggingOut ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <LogOut size={14} />
              )}
              {!collapsed && (
                <span>{loggingOut ? "Logging out…" : "Logout"}</span>
              )}
            </Motion.button>
            <div
              className="rounded-xl p-2.5 flex items-center gap-2.5 overflow-hidden"
              style={{
                background: T.sidebarMid,
                border: `1px solid ${T.border}`,
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{
                  background: "linear-gradient(135deg,#6366F1,#06B6D4)",
                }}
              >
                {initials}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs font-semibold truncate">
                    {name}
                  </p>
                  <p
                    className="text-[10px] truncate"
                    style={{ color: T.accent }}
                  >
                    Super Administrator
                  </p>
                </div>
              )}
            </div>
          </div>
        </Motion.aside>
      )}
    </AnimatePresence>
  );
}
