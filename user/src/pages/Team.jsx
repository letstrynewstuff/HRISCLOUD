// src/pages/Team.jsx
//
// Changes:
//   • Added a `canCreateGroup` permission check.
//   • Injected a "Create Group" button in the header that only managers/admins see.
//   • Imported the `Plus` icon from lucide-react.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import SideNavbar from "../components/SideNavbar";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Mail,
  Phone,
  Calendar,
  Clock,
  Menu,
  Bell,
  Search,
  MessageSquare,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  MessageCircle,
  Plus,
} from "lucide-react";
import { getEmployees } from "../api/service/employeeApi";
import { chatApi } from "../api/service/chatApi";
import { useAuth } from "../components/useAuth";

const C = {
  bg: "#F0F2F8",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F8FC",
  border: "#E4E7F0",
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  primaryDark: "#3730A3",
  accent: "#06B6D4",
  accentLight: "#ECFEFF",
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  navy: "#1E1B4B",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

function StatusDot({ status }) {
  const colors = {
    active: C.success,
    onleave: C.warning,
    offline: C.textMuted,
  };
  return (
    <div
      className="w-2.5 h-2.5 rounded-full"
      style={{ background: colors[status] ?? C.textMuted }}
    />
  );
}

export default function TeamPage() {
  const navigate = useNavigate();
  const { user, employee } = useAuth();

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [lineManager, setLineManager] = useState(null);
  const [onLeave, setOnLeave] = useState([]);
  const [channels, setChannels] = useState([]);
  const [error, setError] = useState(null);

  const EMPLOYEE = {
    name: user ? `${user.firstName} ${user.lastName}` : "Employee",
    initials: user
      ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`
      : "??",
    id: employee?.employeeCode ?? user?.id ?? "",
    role: employee?.jobRoleName ?? user?.role ?? "",
    department: employee?.departmentName ?? "",
  };

  // ── Permission Check ───────────────────────────────────────────────────────
  const canCreateGroup =
    ["manager", "hr_admin", "super_admin"].includes(user?.role) ||
    employee?.is_manager;

  // ── Fetch team data ────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { status: "active", limit: 50 };
      if (employee?.departmentId) params.department_id = employee.departmentId;

      const [empRes, chanRes] = await Promise.all([
        getEmployees(params),
        chatApi.listChannels(),
      ]);

      const allEmps = empRes?.data ?? [];
      const myId = employee?.id ?? user?.employeeId;

      const manager = allEmps.find(
        (e) => e.is_manager || e.id === employee?.managerId,
      );
      const peers = allEmps.filter(
        (e) => e.id !== myId && e.id !== manager?.id,
      );
      const absent = allEmps.filter(
        (e) => e.employment_status === "on_leave" || e.on_leave === true,
      );

      setLineManager(manager ?? null);
      setTeamMembers(peers);
      setOnLeave(absent);
      setChannels((chanRes?.channels ?? []).filter((c) => c.type === "group"));
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load team data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [employee?.departmentId]);

  const filteredTeam = teamMembers.filter(
    (m) =>
      `${m.first_name} ${m.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (m.job_role_name ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ── Navigate to Chat and auto-open DM with this employee ──────────────────
  const openDMWith = (employeeId) => {
    navigate("/chat", { state: { openDM: employeeId } });
  };

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center h-screen gap-3"
        style={{ background: C.bg }}
      >
        <AlertCircle size={36} color={C.danger} />
        <p className="font-semibold" style={{ color: C.textPrimary }}>
          {error}
        </p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl"
          style={{ background: C.primaryLight, color: C.primary }}
        >
          <RefreshCw size={13} /> Retry
        </button>
      </div>
    );
  }

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
        {/* <SideNavbar sidebarOpen={sidebarOpen} COLORS={C} EMPLOYEE={EMPLOYEE} /> */}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top bar */}
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
              style={{ background: C.surface }}
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
                placeholder="Search team members..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{
                  background: C.surface,
                  border: `1.5px solid ${searchFocused ? C.primary : C.border}`,
                }}
              />
            </Motion.div>

            <div className="flex items-center gap-2 ml-auto">
              {/* Restricted Create Group Button */}
              {canCreateGroup && (
                <Motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    navigate("/chat", { state: { openCreateChannel: true } })
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold mr-2"
                  style={{
                    background: C.surface,
                    color: C.primary,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <Plus size={13} /> Create Group
                </Motion.button>
              )}

              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/chat")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ background: C.primary, color: "#fff" }}
              >
                <MessageSquare size={13} /> Team Chat
              </Motion.button>
              <Motion.button
                className="relative p-2 rounded-xl"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <Bell size={16} color={C.textSecondary} />
              </Motion.button>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg,#6366F1,#06B6D4)",
                }}
              >
                {EMPLOYEE.initials}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
            {/* Hero */}
            <Motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="rounded-2xl overflow-hidden p-8"
              style={{ background: "linear-gradient(135deg,#1E1B4B,#312E81)" }}
            >
              <h1
                className="text-white text-3xl font-bold"
                style={{ fontFamily: "Sora,sans-serif" }}
              >
                My Team
              </h1>
              <p className="text-indigo-200 mt-1">
                {EMPLOYEE.department || "Your Department"} ·{" "}
                {teamMembers.length + (lineManager ? 1 : 0)} members
              </p>
            </Motion.div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 size={32} color={C.primary} className="animate-spin" />
              </div>
            ) : (
              <>
                {/* Active channels banner */}
                {channels.length > 0 && (
                  <Motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={0}
                    className="rounded-2xl p-4 flex items-center justify-between"
                    style={{
                      background: C.primaryLight,
                      border: `1px solid ${C.primary}22`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: C.primary }}
                      >
                        <MessageSquare size={16} color="#fff" />
                      </div>
                      <div>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: C.primary }}
                        >
                          {channels.filter((c) => c.isActive).length} active
                          team channel
                          {channels.filter((c) => c.isActive).length !== 1
                            ? "s"
                            : ""}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: C.textSecondary }}
                        >
                          {channels.map((c) => c.name).join(" · ")}
                        </p>
                      </div>
                    </div>
                    <Motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate("/chat")}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: C.primary, color: "#fff" }}
                    >
                      Open Chat <ChevronRight size={12} />
                    </Motion.button>
                  </Motion.div>
                )}

                {/* Line Manager */}
                {lineManager && (
                  <Motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={1}
                    className="rounded-2xl bg-white p-6 border shadow-sm"
                    style={{ borderColor: C.border }}
                  >
                    <p
                      className="text-xs uppercase tracking-widest mb-3"
                      style={{ color: C.textMuted }}
                    >
                      Reporting To
                    </p>
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
                        style={{
                          background: "linear-gradient(135deg,#4F46E5,#8B5CF6)",
                        }}
                      >
                        {lineManager.first_name?.[0]}
                        {lineManager.last_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xl">
                          {lineManager.first_name} {lineManager.last_name}
                        </p>
                        <p style={{ color: C.textSecondary }}>
                          {lineManager.job_role_name}
                        </p>
                        {lineManager.email && (
                          <p
                            className="text-sm mt-0.5"
                            style={{ color: C.textMuted }}
                          >
                            {lineManager.email}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {/* Message manager directly */}
                        <Motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => openDMWith(lineManager.id)}
                          className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
                          style={{
                            background: C.primaryLight,
                            color: C.primary,
                          }}
                        >
                          <MessageCircle size={15} /> Message
                        </Motion.button>
                        {lineManager.email && (
                          <Motion.a
                            whileHover={{ scale: 1.05 }}
                            href={`mailto:${lineManager.email}`}
                            className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 border"
                            style={{ borderColor: C.border }}
                          >
                            <Mail size={15} /> Email
                          </Motion.a>
                        )}
                        {lineManager.phone && (
                          <Motion.a
                            whileHover={{ scale: 1.05 }}
                            href={`tel:${lineManager.phone}`}
                            className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 border"
                            style={{ borderColor: C.border }}
                          >
                            <Phone size={15} /> Call
                          </Motion.a>
                        )}
                      </div>
                    </div>
                  </Motion.div>
                )}

                {/* Team Members */}
                <Motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={2}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users size={18} color={C.primary} />
                      <span className="font-semibold text-lg">
                        Team Members
                      </span>
                    </div>
                    <span className="text-sm" style={{ color: C.textMuted }}>
                      {filteredTeam.length} colleague
                      {filteredTeam.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {filteredTeam.length === 0 ? (
                    <div
                      className="rounded-2xl bg-white p-12 flex flex-col items-center gap-3 border"
                      style={{ borderColor: C.border }}
                    >
                      <Users size={36} color={C.textMuted} />
                      <p
                        className="font-semibold"
                        style={{ color: C.textPrimary }}
                      >
                        No colleagues found
                      </p>
                      <p className="text-sm" style={{ color: C.textMuted }}>
                        {searchQuery
                          ? "Try a different search term."
                          : "Your team data is being set up."}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTeam.map((member, i) => {
                        const name = `${member.first_name} ${member.last_name}`;
                        const initials =
                          `${member.first_name?.[0] ?? ""}${member.last_name?.[0] ?? ""}`.toUpperCase();
                        return (
                          <Motion.div
                            key={member.id}
                            whileHover={{ y: -4 }}
                            className="rounded-2xl bg-white p-5 border shadow-sm"
                            style={{ borderColor: C.border }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
                                style={{
                                  background: `linear-gradient(135deg,hsl(${i * 47 + 200},65%,48%),hsl(${i * 47 + 240},65%,52%))`,
                                }}
                              >
                                {initials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{name}</p>
                                <p
                                  className="text-sm truncate"
                                  style={{ color: C.textSecondary }}
                                >
                                  {member.job_role_name ??
                                    member.role ??
                                    "Employee"}
                                </p>
                              </div>
                              <StatusDot
                                status={member.on_leave ? "onleave" : "active"}
                              />
                            </div>
                            <div className="mt-5 flex gap-2">
                              {/* Opens a 1-on-1 DM with this person */}
                              <Motion.button
                                whileHover={{ scale: 1.02 }}
                                onClick={() => openDMWith(member.id)}
                                className="flex-1 py-2 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5"
                                style={{
                                  background: C.primaryLight,
                                  color: C.primary,
                                }}
                              >
                                <MessageCircle size={13} /> Message
                              </Motion.button>
                              {member.email && (
                                <Motion.a
                                  whileHover={{ scale: 1.02 }}
                                  href={`mailto:${member.email}`}
                                  className="flex-1 py-2 text-xs font-medium rounded-xl flex items-center justify-center"
                                  style={{
                                    background: C.surfaceAlt,
                                    color: C.textSecondary,
                                  }}
                                >
                                  Email
                                </Motion.a>
                              )}
                            </div>
                          </Motion.div>
                        );
                      })}
                    </div>
                  )}
                </Motion.div>

                {/* On Leave */}
                {onLeave.length > 0 && (
                  <Motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={3}
                    className="rounded-2xl bg-white p-6 border shadow-sm"
                    style={{ borderColor: C.border }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar size={18} color={C.warning} />
                      <span className="font-semibold">On Leave</span>
                    </div>
                    <div className="space-y-2">
                      {onLeave.map((person, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 rounded-xl"
                          style={{ background: C.warningLight }}
                        >
                          <div className="flex items-center gap-3">
                            <Clock size={18} color={C.warning} />
                            <div>
                              <p className="font-medium">
                                {person.first_name} {person.last_name}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: C.textMuted }}
                              >
                                {person.leave_type ?? "On Leave"}
                              </p>
                            </div>
                          </div>
                          {person.return_date && (
                            <p
                              className="text-xs font-medium"
                              style={{ color: "#92400E" }}
                            >
                              Returns{" "}
                              {new Date(person.return_date).toLocaleDateString(
                                "en-NG",
                                { month: "short", day: "numeric" },
                              )}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </Motion.div>
                )}
              </>
            )}
            <div className="h-8" />
          </main>
        </div>
      </div>
    </div>
  );
}
