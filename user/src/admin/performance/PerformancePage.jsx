// src/admin/performance/PerformancePage.jsx
//  Route: /admin/performance
//  Container shell — sidebar, topbar, tab switcher.
//  All child tabs read from the API — zero mock data.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSideNavbar from "../AdminSideNavbar";
import { Target, Search, Menu } from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import PerformanceDashboard from "./PerformanceDashboard";
import ReviewCycles from "./ReviewCycles";
import AppraisalForms from "./AppraisalForms";
import GoalsManagement from "./GoalsManagement";
import AppraisalReview from "./AppraisalReview";
import PIPManagement from "./PIPManagement";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "cycles", label: "Review Cycles" },
  { id: "forms", label: "Appraisal Forms" },
  { id: "goals", label: "Goals" },
  { id: "reviews", label: "Appraisals" },
  { id: "pip", label: "PIP Management" },
];

export default function AdminPerformancePage() {
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
        <AdminSideNavbar
          sidebarOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* ── TOPBAR ── */}
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
                placeholder="Search performance..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{
                  background: C.surface,
                  border: `1.5px solid ${searchFocused ? C.primary : C.border}`,
                  color: C.textPrimary,
                }}
              />
            </motion.div>
          </header>

          {/* ── MAIN ── */}
          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
            {/* Hero banner */}
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
                  <Target size={28} />
                </div>
                <div>
                  <h1
                    className="text-3xl font-bold"
                    style={{ fontFamily: "Sora,sans-serif" }}
                  >
                    Performance Management
                  </h1>
                  <p className="text-indigo-200">
                    Drive growth • Track performance • Align goals
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Tab bar */}
            <motion.div
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
                return (
                  <motion.button
                    key={tab.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab(tab.id)}
                    className="px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0"
                    style={{
                      background: active ? C.primary : "transparent",
                      color: active ? "#fff" : C.textSecondary,
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

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <PerformanceDashboard key="dashboard" />
              )}
              {activeTab === "cycles" && <ReviewCycles key="cycles" />}
              {activeTab === "forms" && <AppraisalForms key="forms" />}
              {activeTab === "goals" && (
                <GoalsManagement key="goals" searchQuery={searchQuery} />
              )}
              {activeTab === "reviews" && <AppraisalReview key="reviews" />}
              {activeTab === "pip" && <PIPManagement key="pip" />}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
