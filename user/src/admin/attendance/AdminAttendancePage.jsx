// src/admin/attendance/AdminAttendancePage.jsx
import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
// import AdminSideNavbar from "../AdminSideNavbar";
import { Clock, Search, Menu } from "lucide-react";
import AttendanceLog from "./AttendanceLog";
import AttendanceCorrections from "./AttendanceCorrections";
import ShiftManagement from "./ShiftManagement";
import OvertimeManagement from "./OvertimeManagement";
import TimesheetApproval from "./TimesheetApproval";
import { attendanceApi } from "../../api/service/attendanceApi";
import { C } from "../employeemanagement/sharedData";

const TABS = [
  { id: "log", label: "Attendance Log" },
  { id: "corrections", label: "Corrections" },
  { id: "shifts", label: "Shift Management" },
  { id: "overtime", label: "Overtime" },
  { id: "timesheets", label: "Timesheets" },
];

export default function AdminAttendancePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState("log");

  const [todayData, setTodayData] = useState(null);

  useEffect(() => {
    attendanceApi
      .getToday()
      .then((d) => setTodayData(d))
      .catch(() => {});
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{
        background: C.bg ?? "#F0F2F8",
        fontFamily: "'DM Sans','Sora',sans-serif",
      }}
    >
      <div className="flex h-screen overflow-hidden">
        {/* <AdminSideNavbar
          sidebarOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          pendingApprovals={0}
        /> */}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
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
                placeholder="Search employee..."
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
            {/* Hero Banner */}
            <Motion.div
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
                  <Clock size={28} />
                </div>
                <div>
                  <h1
                    className="text-3xl font-bold"
                    style={{ fontFamily: "Sora,sans-serif" }}
                  >
                    Attendance Management
                  </h1>
                  <p className="text-indigo-200">
                    Real-time workforce time tracking • Payroll ready
                  </p>
                </div>
              </div>

              {todayData && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Present", value: todayData.present ?? 0 },
                    { label: "Late", value: todayData.late ?? 0 },
                    { label: "Absent", value: todayData.absent ?? 0 },
                    { label: "On Leave", value: todayData.onLeave ?? 0 },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl px-4 py-3 bg-white/10 backdrop-blur-sm"
                    >
                      <p className="text-2xl font-bold">{s.value}</p>
                      <p className="text-xs text-indigo-200">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </Motion.div>

            {/* Tabs */}
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
                return (
                  <Motion.button
                    key={tab.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab(tab.id)}
                    className="px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0"
                    style={{
                      background: active ? C.primary : "transparent",
                      color: active ? "#ffffff" : C.textSecondary,
                      boxShadow: active
                        ? "0 2px 8px rgba(79,70,229,0.25)"
                        : "none",
                      cursor: "pointer",
                    }}
                  >
                    {tab.label}
                  </Motion.button>
                );
              })}
            </Motion.div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {activeTab === "log" && (
                <AttendanceLog key="log" searchQuery={searchQuery} />
              )}
              {activeTab === "corrections" && (
                <AttendanceCorrections key="corrections" />
              )}
              {activeTab === "shifts" && <ShiftManagement key="shifts" />}
              {activeTab === "overtime" && (
                <OvertimeManagement key="overtime" />
              )}
              {activeTab === "timesheets" && (
                <TimesheetApproval key="timesheets" />
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
