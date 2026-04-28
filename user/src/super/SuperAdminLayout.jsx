// src/superadmin/SuperAdminLayout.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SuperAdminSidebar from "./SuperAdminSidebar";
import Loader from "../components/Loader";
import C from "../styles/colors";
import {
  Menu,
  Search,
  Bell,
  ChevronRight,
  RefreshCw,
  Activity,
} from "lucide-react";

export default function SuperAdminLayout({
  children,
  title = "Dashboard",
  subtitle = "",
  loading = false,
  searchQuery = "",
  setSearchQuery = () => {},
  onRefresh,
  showHeader = true,
  headerContent = null,
}) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const handleLogout = async () => {
    try {
      const rt = localStorage.getItem("refreshToken");
      if (rt) {
        await fetch(`${SUPER_ADMIN_API}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: rt }),
        });
      }
    } catch {}
    localStorage.clear();
    navigate("/super-admin/login");
  };

  if (authLoading) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: C.bg }}
      >
        <Loader />
      </div>
    );
  }

  const initials = admin
    ? (
        (admin.first_name?.[0] ?? "S") + (admin.last_name?.[0] ?? "A")
      ).toUpperCase()
    : "SA";

  return (
    <div
      className="min-h-screen"
      style={{
        background: C.bg,
        color: C.textPrimary,
        fontFamily: "'DM Sans','Sora',sans-serif",
      }}
    >
      {/* Full-page loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(4px)",
            }}
          >
            <Loader />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex h-screen overflow-hidden">
        <SuperAdminSidebar
          sidebarOpen={sidebarOpen}
          admin={admin}
          onLogout={handleLogout}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top bar */}
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

            {/* Breadcrumb */}
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: C.textSecondary }}
            >
              <span>Super Admin</span>
              <ChevronRight size={11} />
              <span className="font-semibold" style={{ color: C.textPrimary }}>
                {title}
              </span>
            </div>

            {/* Search */}
            <motion.div
              className="flex-1 max-w-sm relative ml-4"
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
                placeholder={`Search ${title.toLowerCase()}…`}
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
              {onRefresh && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onRefresh}
                  className="p-2 rounded-xl"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <RefreshCw size={14} color={C.textSecondary} />
                </motion.button>
              )}
              <button
                className="relative p-2 rounded-xl"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <Bell size={16} color={C.textSecondary} />
              </button>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg,#6366F1,#06B6D4)",
                }}
              >
                {initials}
              </div>
            </div>
          </header>

          {/* Page Header (NOW CONDITIONAL) */}
          {showHeader &&
            (headerContent ? (
              headerContent
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mx-6 mt-6 rounded-2xl p-6 text-white relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
                }}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/15">
                      <Activity size={22} />
                    </div>

                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold">
                        {title}
                      </h1>
                      {subtitle && (
                        <p className="text-indigo-200 text-sm mt-0.5">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="md:ml-auto flex items-center gap-3">
                    {onRefresh && (
                      <button
                        onClick={onRefresh}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
                      >
                        <RefreshCw size={14} />
                        <span className="text-xs font-medium">Refresh</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

          {/* Main scrollable */}
          <main className="flex-1 overflow-y-auto px-2 pb-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
