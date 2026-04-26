import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSideNavbar from "../AdminSideNavbar";
import { GraduationCap, Search, Menu } from "lucide-react";
import TrainingDashboard from "./TrainingDashboard";
import TrainingCatalog from "./TrainingCatalog";
import TrainingAttendance from "./TrainingAttendance";
import TrainingBudget from "./TrainingBudget";
import CertificationTracker from "./CertificationTracker";

const C = {
  bg: "#F0F2F8",
  bgMid: "#E8EBF4",
  surface: "#FFFFFF",
  surfaceHover: "#F7F8FC",
  surfaceAlt: "#F7F8FC",
  border: "#E4E7F0",
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  primaryGlow: "rgba(79,70,229,0.20)",
  accent: "#06B6D4",
  accentLight: "#ECFEFF",
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  purple: "#8B5CF6",
  purpleLight: "#EDE9FE",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  navy: "#1E1B4B",
};

const ADMIN = {
  name: "Ngozi Adeleke",
  initials: "NA",
  role: "HR Administrator",
};

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "catalog", label: "Training Catalog" },
  { id: "attendance", label: "Attendance" },
  { id: "budget", label: "Budget" },
  { id: "certifications", label: "Certifications" },
];

export default function AdminTrainingPage() {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ background: C.bg, fontFamily: "'DM Sans','Sora',sans-serif" }}
    >
      <div className="flex h-screen overflow-hidden">
        <AdminSideNavbar
          sidebarOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          ADMIN={ADMIN}
          pendingApprovals={8}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* ── Top Header ── */}
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
            >
              <Menu size={16} color={C.textSecondary} />
            </motion.button>

            <motion.div
              className="flex-1 max-w-sm relative"
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
                placeholder="Search trainings..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{
                  background: C.surface,
                  border: `1.5px solid ${searchFocused ? C.primary : C.border}`,
                }}
              />
            </motion.div>

            <div className="flex items-center gap-2 ml-auto">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg,#4F46E5,#06B6D4)",
                }}
              >
                {ADMIN.initials}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
            {/* ── Hero Banner ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-8 text-white"
              style={{
                background:
                  "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/15">
                  <GraduationCap size={28} />
                </div>
                <div>
                  <h1
                    className="text-3xl font-bold"
                    style={{ fontFamily: "Sora,sans-serif" }}
                  >
                    Training & Development
                  </h1>
                  <p className="text-indigo-200">
                    Build skills • Track compliance • Drive growth
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ── Tabs ── */}
            {/*
              FIX: Do NOT mix the Tailwind "border" class with a separate
              borderColor in style — the Tailwind class sets border-color to
              currentColor (black) before the style prop resolves, producing a
              black outline. Instead, put the full border declaration in one
              inline style property so it resolves correctly.
            */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-1 p-1 rounded-2xl overflow-x-auto"
              style={{
                background: C.surface,
                border: `1px solid ${C.border}` /* ← single declaration, no Tailwind "border" class */,
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {TABS.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: active ? 1 : 1.02 }}
                    onClick={() => setActiveTab(tab.id)}
                    className="px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0"
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
                    {tab.label}
                  </motion.button>
                );
              })}
            </motion.div>

            {/* ── Tab content ── */}
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <TrainingDashboard key="dashboard" />
              )}
              {activeTab === "catalog" && (
                <TrainingCatalog key="catalog" searchQuery={searchQuery} />
              )}
              {activeTab === "attendance" && (
                <TrainingAttendance key="attendance" />
              )}
              {activeTab === "budget" && <TrainingBudget key="budget" />}
              {activeTab === "certifications" && (
                <CertificationTracker key="certifications" />
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
