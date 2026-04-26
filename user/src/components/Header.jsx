import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Menu, ChevronRight, Bell } from "lucide-react";
import  C  from "../styles/colors";
import Loader from "./Loader"; 

export default function Header({
  title = "Dashboard",
  subtitle = "Manage your organization",
  icon: HeroIcon,
  tabs = [],
  stats = [],
  loading = false,
  searchQuery = "",
  setSearchQuery = () => {},
  setSidebarOpen = () => {},
  admin = { name: "Admin", initials: "AD" },
  pendingCount = 0,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchFocused, setSearchFocused] = useState(false);

  // Helper to determine active tab based on current URL path
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ── LOADER LAYER ── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-sm"
          >
            <Loader />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col w-full">
        {/* ── TOP NAV HEADER ── */}
        <header
          className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
          style={{
            background: "rgba(240,242,248,0.9)",
            backdropFilter: "blur(12px)",
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

          <div
            className="flex items-center gap-1.5 text-xs"
            style={{ color: C.textSecondary }}
          >
            <span>Admin</span>
            <ChevronRight size={11} />
            <span className="font-semibold" style={{ color: C.textPrimary }}>
              {title}
            </span>
          </div>

          <motion.div
            className="flex-1 max-w-sm relative ml-4"
            animate={{ width: searchFocused ? "320px" : "240px" }}
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
              placeholder={`Search ${title.toLowerCase()}...`}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
              style={{
                background: C.surface,
                border: `1.5px solid ${searchFocused ? C.primary : C.border}`,
                color: C.textPrimary,
              }}
            />
          </motion.div>

          <div className="flex items-center gap-3 ml-auto">
            {pendingCount > 0 && (
              <div
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold"
                style={{ background: C.warningLight, color: C.warning }}
              >
                {pendingCount} PENDING
              </div>
            )}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg,#4F46E5,#06B6D4)" }}
            >
              {admin.initials}
            </div>
          </div>
        </header>

        {/* ── HERO BANNER ── */}
        <div className="px-5 md:px-7 pt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-8 text-white relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
            }}
          >
            <div className="relative flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/15">
                  {HeroIcon && <HeroIcon size={28} color="#fff" />}
                </div>
                <div>
                  <h1
                    className="text-3xl font-bold"
                    style={{ fontFamily: "Sora,sans-serif" }}
                  >
                    {title}
                  </h1>
                  <p className="text-indigo-200 mt-0.5">{subtitle}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="md:ml-auto flex flex-wrap gap-3">
                {stats.map((stat, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm"
                  >
                    <span
                      className="text-lg font-bold"
                      style={{ color: stat.color || "#fff" }}
                    >
                      {stat.value}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-medium text-white/60">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── TAB STRIP ── */}
          {tabs.length > 0 && (
            <motion.div
              className="flex gap-1 p-1 mt-6 rounded-2xl overflow-x-auto no-scrollbar"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              {tabs.map((tab) => {
                const active = isActive(tab.path);
                const TabIcon = tab.icon;
                return (
                  <motion.button
                    key={tab.path}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(tab.path)}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
                    style={{
                      background: active ? C.primary : "transparent",
                      color: active ? "#ffffff" : C.textSecondary,
                    }}
                  >
                    {TabIcon && <TabIcon size={14} />}
                    {tab.label}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
