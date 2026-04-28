// src/pages/ManagerProfile.jsx
// Manager dashboard — only accessible when role === "manager".
// Tabs: Overview · Team · Approvals · Attendance · Activity
// All data from real API. No mock data.

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
// import SideNavbar from "../components/SideNavbar";
import { useAuth } from "../components/useAuth";
import { getEmployees, getEmployeeById } from "../api/service/employeeApi";
import { attendanceApi } from "../api/service/attendanceApi";
import { approvalApi } from "../api/service/approvalApi";
import { leaveApi } from "../api/service/leaveApi";
// import { performanceApi } from "../api/service/performanceApi";
import * as performanceApi from "../api/service/performanceApi";
import C from "../styles/colors";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Mail,
  Phone,
  Award,
  BarChart2,
  TrendingUp,
  AlertCircle,
  Bell,
  Activity,
  Edit3,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Star,
  Filter,
  Search,
  Calendar,
  Home,
  DollarSign,
  Plane,
  Shield,
  Menu,
  ChevronDown,
  UserCheck,
  RefreshCw,
  LogIn,
  MoreHorizontal,
  ArrowUpRight,
  Zap,
  Target,
  Loader2,
  X,
  Send,
  MessageSquare,
} from "lucide-react";

// ── Framer variants ──
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.065, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};
const slideIn = {
  hidden: { opacity: 0, x: -12 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ── Micro-components ──
const Skeleton = ({ w = "100%", h = 16 }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 8,
      background: "linear-gradient(90deg,#E2E8F4 25%,#EFF6FF 50%,#E2E8F4 75%)",
      backgroundSize: "200% 100%",
      animation: "mgr-shimmer 1.4s infinite linear",
    }}
  />
);

const AvatarEl = ({ initials, avatar, size = 44 }) => {
  if (avatar)
    return (
      <img
        src={avatar}
        alt={initials}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: `linear-gradient(135deg,${C.primary},${C.accent})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.34,
        fontFamily: "Sora,sans-serif",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
};

const Chip = ({
  label,
  color = C.primary,
  bg = C.primaryLight,
  dot = false,
  size = "sm",
}) => (
  <span
    style={{
      background: bg,
      color,
      fontSize: size === "xs" ? 9 : 10,
      fontWeight: 700,
      padding: size === "xs" ? "2px 7px" : "3px 10px",
      borderRadius: 99,
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
    }}
  >
    {dot && (
      <span
        style={{ width: 5, height: 5, borderRadius: "50%", background: color }}
      />
    )}
    {label}
  </span>
);

const Card = ({ children, style = {}, onClick }) => (
  <Motion.div
    whileHover={
      onClick ? { y: -2, boxShadow: "0 10px 36px rgba(37,99,235,0.09)" } : {}
    }
    transition={{ duration: 0.18 }}
    onClick={onClick}
    style={{
      background: C.surface,
      borderRadius: 16,
      border: `1px solid ${C.border}`,
      boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
      overflow: "hidden",
      cursor: onClick ? "pointer" : "default",
      ...style,
    }}
  >
    {children}
  </Motion.div>
);

const SectionHeader = ({
  icon: Icon,
  title,
  sub,
  color = C.primary,
  bg = C.primaryLight,
  action,
}) => (
  <div
    style={{
      padding: "14px 20px",
      borderBottom: `1px solid ${C.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={15} color={color} />
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>
          {title}
        </p>
        {sub && (
          <p style={{ fontSize: 10, color: C.textMuted, marginTop: 1 }}>
            {sub}
          </p>
        )}
      </div>
    </div>
    {action}
  </div>
);

const StatusBadge = ({ status }) => {
  const m = {
    active: { label: "Active", color: C.success, bg: C.successLight },
    on_leave: { label: "On Leave", color: C.warning, bg: C.warningLight },
    suspended: { label: "Suspended", color: C.danger, bg: C.dangerLight },
    terminated: { label: "Terminated", color: C.textMuted, bg: C.surfaceAlt },
  };
  const s = m[status] || m.active;
  return <Chip label={s.label} color={s.color} bg={s.bg} dot size="xs" />;
};

const TABS = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "team", label: "My Team", icon: Users },
  { id: "approvals", label: "Approvals", icon: CheckCircle2 },
  { id: "attendance", label: "Attendance", icon: Clock },
  { id: "performance", label: "Performance", icon: BarChart2 },
];

// ════════════════════════════ TAB PANELS ════════════════════════════

// ── Overview Tab ──
function OverviewTab({ team, pendingApprovals, attendanceSummary, manager }) {
  const present = attendanceSummary?.present ?? 0;
  const absent = attendanceSummary?.absent ?? 0;
  const late = attendanceSummary?.late ?? 0;
  const total = team.length;
  const rate = total ? Math.round((present / total) * 100) : 0;

  const stats = [
    {
      label: "Team Size",
      value: total,
      icon: Users,
      color: C.primary,
      bg: C.primaryLight,
    },
    {
      label: "Present Today",
      value: present,
      icon: CheckCircle2,
      color: C.success,
      bg: C.successLight,
    },
    {
      label: "Absent Today",
      value: absent,
      icon: XCircle,
      color: C.danger,
      bg: C.dangerLight,
    },
    {
      label: "Pending Approvals",
      value: pendingApprovals.length,
      icon: Clock,
      color: C.warning,
      bg: C.warningLight,
    },
    {
      label: "Attendance Rate",
      value: `${rate}%`,
      icon: TrendingUp,
      color: C.accent,
      bg: C.accentLight,
    },
  ];

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: 12,
        }}
      >
        {stats.map((s, i) => (
          <Motion.div
            key={s.label}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={i}
          >
            <Card>
              <div style={{ padding: "16px 18px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: s.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <s.icon size={16} color={s.color} />
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: C.textPrimary,
                    fontFamily: "Sora,sans-serif",
                  }}
                >
                  {s.value}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: s.color,
                    fontWeight: 600,
                    marginTop: 2,
                  }}
                >
                  {s.label}
                </p>
              </div>
            </Card>
          </Motion.div>
        ))}
      </div>

      {/* Team quick view */}
      <Card>
        <SectionHeader
          icon={Users}
          title="Team Members"
          sub={`${total} direct reports`}
        />
        {team.length === 0 ? (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              color: C.textMuted,
              fontSize: 13,
            }}
          >
            No direct reports found.
          </div>
        ) : (
          <div style={{ padding: "4px 20px 12px" }}>
            {team.slice(0, 5).map((emp, i) => {
              const ini =
                `${emp.first_name?.[0] ?? ""}${emp.last_name?.[0] ?? ""}`.toUpperCase();
              return (
                <div
                  key={emp.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom:
                      i < Math.min(team.length, 5) - 1
                        ? `1px solid ${C.border}`
                        : "none",
                  }}
                >
                  <AvatarEl initials={ini} avatar={emp.avatar} size={36} />
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.textPrimary,
                      }}
                    >
                      {emp.first_name} {emp.last_name}
                    </p>
                    <p style={{ fontSize: 11, color: C.textMuted }}>
                      {emp.job_role_name ?? "—"} · {emp.department_name ?? "—"}
                    </p>
                  </div>
                  <StatusBadge status={emp.employment_status} />
                </div>
              );
            })}
            {team.length > 5 && (
              <p
                style={{
                  fontSize: 12,
                  color: C.primary,
                  padding: "8px 0",
                  fontWeight: 600,
                }}
              >
                +{team.length - 5} more members
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Recent approvals */}
      {pendingApprovals.length > 0 && (
        <Card>
          <SectionHeader
            icon={Clock}
            title="Pending Approvals"
            sub="Requires your action"
            color={C.warning}
            bg={C.warningLight}
          />
          <div style={{ padding: "4px 20px 12px" }}>
            {pendingApprovals.slice(0, 3).map((a, i) => (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: i < 2 ? `1px solid ${C.border}` : "none",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: C.warningLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Clock size={14} color={C.warning} />
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.textPrimary,
                    }}
                  >
                    {a.type ?? a.requestType ?? "Request"}
                  </p>
                  <p style={{ fontSize: 11, color: C.textMuted }}>
                    {a.employeeName ?? a.employee_name ?? "Employee"} ·{" "}
                    {a.createdAt
                      ? new Date(a.createdAt).toLocaleDateString()
                      : ""}
                  </p>
                </div>
                <Chip
                  label="Pending"
                  color={C.warning}
                  bg={C.warningLight}
                  dot
                  size="xs"
                />
              </div>
            ))}
          </div>
        </Card>
      )}
    </Motion.div>
  );
}

// ── Team Tab ──
function TeamTab({ team, onViewProfile }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return !q
      ? team
      : team.filter(
          (e) =>
            `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
            (e.job_role_name ?? "").toLowerCase().includes(q) ||
            (e.department_name ?? "").toLowerCase().includes(q),
        );
  }, [team, search]);

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Search */}
      <div style={{ position: "relative", maxWidth: 340 }}>
        <Search
          size={13}
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: C.textMuted,
          }}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search team members…"
          style={{
            width: "100%",
            paddingLeft: 36,
            paddingRight: 12,
            paddingTop: 9,
            paddingBottom: 9,
            borderRadius: 10,
            border: `1.5px solid ${C.border}`,
            background: C.surface,
            fontSize: 13,
            outline: "none",
            color: C.textPrimary,
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            background: C.surface,
            borderRadius: 16,
            padding: 40,
            textAlign: "center",
            color: C.textMuted,
            fontSize: 13,
          }}
        >
          No team members found.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
            gap: 12,
          }}
        >
          {filtered.map((emp, i) => {
            const ini =
              `${emp.first_name?.[0] ?? ""}${emp.last_name?.[0] ?? ""}`.toUpperCase();
            return (
              <Motion.div
                key={emp.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={i}
              >
                <Card
                  onClick={() => onViewProfile(emp)}
                  style={{ cursor: "pointer" }}
                >
                  <div style={{ padding: "16px 18px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <AvatarEl initials={ini} avatar={emp.avatar} size={44} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: C.textPrimary,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {emp.first_name} {emp.last_name}
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: C.textMuted,
                            marginTop: 1,
                          }}
                        >
                          {emp.job_role_name ?? "—"}
                        </p>
                        <p style={{ fontSize: 11, color: C.textMuted }}>
                          {emp.department_name ?? "—"}
                        </p>
                      </div>
                      <StatusBadge status={emp.employment_status} />
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {emp.employment_type && (
                        <Chip
                          label={emp.employment_type.replace("_", "-")}
                          color={C.primary}
                          bg={C.primaryLight}
                          size="xs"
                        />
                      )}
                      {emp.location && (
                        <Chip
                          label={emp.location}
                          color={C.textSecondary}
                          bg={C.surfaceAlt}
                          size="xs"
                        />
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: `1px solid ${C.border}`,
                      }}
                    >
                      <Motion.button
                        whileHover={{ scale: 1.03 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewProfile(emp);
                        }}
                        style={{
                          flex: 1,
                          padding: "7px",
                          borderRadius: 8,
                          border: `1px solid ${C.border}`,
                          background: C.surfaceAlt,
                          fontSize: 11,
                          fontWeight: 600,
                          color: C.textSecondary,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 5,
                        }}
                      >
                        <Eye size={11} /> View Profile
                      </Motion.button>
                    </div>
                  </div>
                </Card>
              </Motion.div>
            );
          })}
        </div>
      )}
    </Motion.div>
  );
}

// ── Approvals Tab ──
function ApprovalsTab({ approvals, onApprove, onReject }) {
  const [actionLoading, setActionLoading] = useState({});
  const [filter, setFilter] = useState("All");
  const [err, setErr] = useState(null);

  const filtered =
    filter === "All"
      ? approvals
      : approvals.filter((a) => (a.type ?? a.requestType ?? "") === filter);
  const types = [
    "All",
    ...new Set(approvals.map((a) => a.type ?? a.requestType ?? "Request")),
  ];

  const handle = async (id, action) => {
    setActionLoading((p) => ({ ...p, [id]: action }));
    setErr(null);
    try {
      if (action === "approve") await approvalApi.approve(id);
      else await approvalApi.reject(id, "Rejected by manager.");
      onApprove();
    } catch (e) {
      setErr(e?.response?.data?.message ?? `${action} failed.`);
    } finally {
      setActionLoading((p) => ({ ...p, [id]: null }));
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {err && (
        <div
          style={{
            background: C.dangerLight,
            border: `1px solid ${C.danger}33`,
            borderRadius: 10,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <AlertCircle size={13} color={C.danger} />
          <p style={{ fontSize: 13, color: C.danger }}>{err}</p>
          <button
            onClick={() => setErr(null)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={13} color={C.danger} />
          </button>
        </div>
      )}

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              padding: "5px 12px",
              borderRadius: 99,
              border: `1px solid ${filter === t ? C.primary : C.border}`,
              background: filter === t ? C.primaryLight : C.surface,
              color: filter === t ? C.primary : C.textSecondary,
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: C.textMuted,
              fontSize: 13,
            }}
          >
            <CheckCircle2
              size={36}
              color={C.success}
              style={{ margin: "0 auto 8px" }}
            />
            <p>No pending approvals.</p>
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((a, i) => {
            const loading = actionLoading[a.id];
            return (
              <Motion.div
                key={a.id}
                variants={slideIn}
                initial="hidden"
                animate="visible"
                custom={i}
              >
                <Card>
                  <div style={{ padding: "16px 20px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: C.warningLight,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Clock size={16} color={C.warning} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: C.textPrimary,
                            }}
                          >
                            {a.type ?? a.requestType ?? "Request"}
                          </p>
                          <Chip
                            label="Pending"
                            color={C.warning}
                            bg={C.warningLight}
                            dot
                            size="xs"
                          />
                        </div>
                        <p
                          style={{
                            fontSize: 12,
                            color: C.textSecondary,
                            marginTop: 3,
                          }}
                        >
                          {a.employeeName ?? a.employee_name ?? "Employee"}
                        </p>
                        {a.reason && (
                          <p
                            style={{
                              fontSize: 12,
                              color: C.textMuted,
                              marginTop: 3,
                              fontStyle: "italic",
                            }}
                          >
                            "{a.reason}"
                          </p>
                        )}
                        {a.startDate && (
                          <p
                            style={{
                              fontSize: 11,
                              color: C.textMuted,
                              marginTop: 3,
                            }}
                          >
                            {new Date(
                              a.startDate ?? a.start_date,
                            ).toLocaleDateString()}{" "}
                            –{" "}
                            {new Date(
                              a.endDate ?? a.end_date,
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: 11,
                          color: C.textMuted,
                          flexShrink: 0,
                        }}
                      >
                        {a.createdAt
                          ? new Date(a.createdAt).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handle(a.id, "approve")}
                        disabled={!!loading}
                        style={{
                          flex: 1,
                          padding: "8px",
                          borderRadius: 9,
                          border: "none",
                          background: C.successLight,
                          color: C.success,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: loading ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 5,
                        }}
                      >
                        {loading === "approve" ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <ThumbsUp size={12} />
                        )}{" "}
                        Approve
                      </Motion.button>
                      <Motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handle(a.id, "reject")}
                        disabled={!!loading}
                        style={{
                          flex: 1,
                          padding: "8px",
                          borderRadius: 9,
                          border: "none",
                          background: C.dangerLight,
                          color: C.danger,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: loading ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 5,
                        }}
                      >
                        {loading === "reject" ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <ThumbsDown size={12} />
                        )}{" "}
                        Reject
                      </Motion.button>
                    </div>
                  </div>
                </Card>
              </Motion.div>
            );
          })}
        </div>
      )}
    </Motion.div>
  );
}

// ── Attendance Tab ──
function AttendanceTab({ team }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch today's attendance snapshot for HR/manager view
    attendanceApi
      .getToday()
      .then((r) => setRecords(r.data ?? r.records ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const teamIds = new Set(team.map((e) => e.id));
  const teamRecords = records.filter((r) =>
    teamIds.has(r.employeeId ?? r.employee_id),
  );

  return (
    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card>
        <SectionHeader
          icon={Clock}
          title="Team Attendance Today"
          sub={`${teamRecords.length} of ${team.length} recorded`}
        />
        {loading ? (
          <div
            style={{
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} h={44} />
            ))}
          </div>
        ) : team.length === 0 ? (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              color: C.textMuted,
              fontSize: 13,
            }}
          >
            No team members.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.surfaceAlt }}>
                  {["Employee", "Clock In", "Clock Out", "Hours", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 16px",
                          textAlign: "left",
                          fontSize: 10,
                          fontWeight: 700,
                          color: C.textMuted,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {team.map((emp, i) => {
                  const rec = teamRecords.find(
                    (r) => (r.employeeId ?? r.employee_id) === emp.id,
                  );
                  const ini =
                    `${emp.first_name?.[0] ?? ""}${emp.last_name?.[0] ?? ""}`.toUpperCase();
                  const statusColor =
                    { present: C.success, late: C.warning, absent: C.danger }[
                      rec?.status
                    ] ?? C.textMuted;
                  const statusBg =
                    {
                      present: C.successLight,
                      late: C.warningLight,
                      absent: C.dangerLight,
                    }[rec?.status] ?? C.surfaceAlt;
                  return (
                    <tr
                      key={emp.id}
                      style={{ borderBottom: `1px solid ${C.border}` }}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <AvatarEl
                            initials={ini}
                            avatar={emp.avatar}
                            size={32}
                          />
                          <div>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: C.textPrimary,
                              }}
                            >
                              {emp.first_name} {emp.last_name}
                            </p>
                            <p style={{ fontSize: 11, color: C.textMuted }}>
                              {emp.job_role_name ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          color: C.textPrimary,
                        }}
                      >
                        {rec?.clockIn
                          ? new Date(rec.clockIn).toLocaleTimeString("en-NG", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          color: C.textPrimary,
                        }}
                      >
                        {rec?.clockOut
                          ? new Date(rec.clockOut).toLocaleTimeString("en-NG", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          fontWeight: 600,
                          color: C.textPrimary,
                        }}
                      >
                        {rec?.hoursWorked
                          ? `${Number(rec.hoursWorked).toFixed(1)}h`
                          : "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Chip
                          label={rec?.status ?? "No Record"}
                          color={statusColor}
                          bg={statusBg}
                          dot
                          size="xs"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Motion.div>
  );
}

// ── Performance Tab ──
function PerformanceTab({ team }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    performanceApi
      .getDashboard()
      .then((r) => setData(r.topPerformers ?? r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card>
        <SectionHeader
          icon={BarChart2}
          title="Team Performance"
          sub="Based on latest review cycle"
          color={C.accent}
          bg={C.accentLight}
        />
        {loading ? (
          <div
            style={{
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} h={44} />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              color: C.textMuted,
              fontSize: 13,
            }}
          >
            No performance data yet.
          </div>
        ) : (
          <div style={{ padding: "4px 20px 12px" }}>
            {data.map((p, i) => (
              <div
                key={p.employeeId ?? i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: C.accentLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 800,
                    color: C.accent,
                    flexShrink: 0,
                  }}
                >
                  #{i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.textPrimary,
                    }}
                  >
                    {p.name ?? p.employeeName ?? "Employee"}
                  </p>
                  <p style={{ fontSize: 11, color: C.textMuted }}>
                    {p.role ?? p.jobRole ?? "—"}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: C.primary,
                      fontFamily: "Sora,sans-serif",
                    }}
                  >
                    {p.score ?? p.overallScore ?? "—"}
                  </p>
                  <p style={{ fontSize: 10, color: C.textMuted }}>score</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </Motion.div>
  );
}

// ── Employee Profile Drawer ──
function EmployeeDrawer({ emp, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const ini =
    `${emp.first_name?.[0] ?? ""}${emp.last_name?.[0] ?? ""}`.toUpperCase();

  useEffect(() => {
    getEmployeeById(emp.id)
      .then((r) => setProfile(r.data ?? r))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [emp.id]);

  const p = profile ?? emp;

  return (
    <>
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,23,42,0.35)",
          backdropFilter: "blur(4px)",
          zIndex: 40,
        }}
      />
      <Motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          width: "100%",
          maxWidth: 400,
          background: C.surface,
          boxShadow: "-8px 0 40px rgba(15,23,42,0.14)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 20px 16px",
            background: `linear-gradient(135deg,${C.navy},${C.primary})`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 12,
            }}
          >
            <Motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "rgba(255,255,255,0.15)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={14} color="#fff" />
            </Motion.button>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
            <AvatarEl initials={ini} avatar={p.avatar} size={60} />
            <div>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#fff",
                  fontFamily: "Sora,sans-serif",
                }}
              >
                {p.first_name} {p.last_name}
              </h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                {p.job_role_name ?? "—"} · {p.department_name ?? "—"}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.45)",
                  fontFamily: "monospace",
                }}
              >
                {p.employee_code}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} h={36} />
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Email", value: p.work_email ?? p.personal_email },
                { label: "Phone", value: p.phone },
                { label: "Location", value: p.location },
                {
                  label: "Employment Type",
                  value: p.employment_type?.replace("_", " "),
                },
                {
                  label: "Start Date",
                  value: p.start_date
                    ? new Date(p.start_date).toLocaleDateString()
                    : null,
                },
                { label: "Status", value: p.employment_status },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <span style={{ fontSize: 12, color: C.textMuted }}>
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: value ? C.textPrimary : C.textMuted,
                    }}
                  >
                    {value || "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Motion.div>
    </>
  );
}

// ════════════════════════════ MAIN COMPONENT ════════════════════════════
export default function ManagerProfile() {
  const navigate = useNavigate();
  const { employee: authEmployee } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [team, setTeam] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(null);

  const manager = authEmployee;
  const initials = manager?.initials ?? "?";

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Get direct reports (employees whose manager_id matches this user's employee ID)
      const [teamRes, approvalsRes, todayRes] = await Promise.all([
        getEmployees({ limit: 100 }),
        approvalApi.getAll({ status: "pending" }),
        attendanceApi.getToday().catch(() => ({ data: [] })),
      ]);

      const allEmployees = teamRes.data ?? [];
      // Filter to only this manager's direct reports
      const myId = manager?.id ?? authEmployee?.employeeId;
      const myTeam = allEmployees.filter(
        (e) => e.manager_id === myId || e.managerId === myId,
      );

      setTeam(myTeam);
      setApprovals(approvalsRes.data ?? approvalsRes.approvals ?? []);

      // Build attendance summary from today's records
      const todayRecords = todayRes.data ?? todayRes.records ?? [];
      const teamIds = new Set(myTeam.map((e) => e.id));
      const teamToday = todayRecords.filter((r) =>
        teamIds.has(r.employeeId ?? r.employee_id),
      );
      setAttendanceSummary({
        present: teamToday.filter((r) => r.status === "present").length,
        absent: teamToday.filter((r) => r.status === "absent").length,
        late: teamToday.filter((r) => r.status === "late").length,
      });
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load manager data.");
    } finally {
      setLoading(false);
    }
  }, [manager?.id, authEmployee?.employeeId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const pendingCount = approvals.filter(
    (a) => (a.status ?? "pending") === "pending",
  ).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "'DM Sans','Sora',sans-serif",
        color: C.textPrimary,
      }}
    >
      <style>{`@keyframes mgr-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        {/* <SideNavbar sidebarOpen={sidebarOpen} /> */}

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          {/* Header */}
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
              <Menu size={15} color={C.textSecondary} />
            </Motion.button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: C.textSecondary,
              }}
            >
              <span>Home</span>
              <ChevronRight size={11} />
              <span style={{ fontWeight: 700, color: C.textPrimary }}>
                Manager Dashboard
              </span>
            </div>

            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {pendingCount > 0 && (
                <Motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab("approvals")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    background: C.dangerLight,
                    border: `1px solid ${C.danger}33`,
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.danger,
                    cursor: "pointer",
                  }}
                >
                  <Clock size={11} /> {pendingCount} Pending
                </Motion.button>
              )}
              <Motion.button
                whileHover={{ scale: 1.05 }}
                onClick={fetchAll}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={13} color={C.textMuted} />
              </Motion.button>
              <Motion.button
                whileHover={{ scale: 1.03 }}
                onClick={() => navigate("/profile")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 10px",
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.textSecondary,
                  cursor: "pointer",
                }}
              >
                My Profile
              </Motion.button>
              <AvatarEl
                initials={initials}
                avatar={manager?.avatar}
                size={32}
              />
            </div>
          </header>

          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
            {/* Error */}
            {error && (
              <div
                style={{
                  marginBottom: 16,
                  background: C.dangerLight,
                  border: `1px solid ${C.danger}33`,
                  borderRadius: 12,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <AlertCircle size={14} color={C.danger} />
                <p style={{ fontSize: 13, color: C.danger, flex: 1 }}>
                  {error}
                </p>
                <button
                  onClick={fetchAll}
                  style={{
                    fontSize: 11,
                    color: C.danger,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Page title */}
            <Motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              style={{ marginBottom: 18 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 4,
                }}
              >
                <h1
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: C.textPrimary,
                    fontFamily: "Sora,sans-serif",
                  }}
                >
                  Manager Dashboard
                </h1>
                <span
                  style={{
                    background: "#FEF3C7",
                    color: "#92400E",
                    fontSize: 9,
                    fontWeight: 800,
                    padding: "3px 9px",
                    borderRadius: 99,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Award size={9} /> {manager?.name}
                </span>
              </div>
              <p style={{ fontSize: 13, color: C.textSecondary }}>
                Manage your team, review approvals, and track attendance — all
                in one place.
              </p>
            </Motion.div>

            {/* Tabs */}
            {loading ? (
              <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                {[70, 60, 80, 90, 80].map((w, i) => (
                  <Skeleton key={i} w={w} h={34} />
                ))}
              </div>
            ) : (
              <Motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={1}
                style={{
                  display: "flex",
                  gap: 4,
                  marginBottom: 18,
                  background: C.surface,
                  padding: 4,
                  borderRadius: 14,
                  border: `1px solid ${C.border}`,
                  overflowX: "auto",
                }}
              >
                {TABS.map(({ id, label, icon: Icon }) => {
                  const active = activeTab === id;
                  const count = id === "approvals" ? pendingCount : null;
                  return (
                    <Motion.button
                      key={id}
                      whileHover={{ scale: active ? 1 : 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveTab(id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 14px",
                        borderRadius: 10,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        background: active ? C.primary : "transparent",
                        color: active ? "#fff" : C.textSecondary,
                        boxShadow: active
                          ? "0 2px 8px rgba(79,70,229,0.25)"
                          : "none",
                        transition: "all 0.18s",
                      }}
                    >
                      <Icon size={12} />
                      {label}
                      {count > 0 && (
                        <span
                          style={{
                            background: active
                              ? "rgba(255,255,255,0.25)"
                              : C.danger,
                            color: "#fff",
                            fontSize: 9,
                            fontWeight: 800,
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {count}
                        </span>
                      )}
                    </Motion.button>
                  );
                })}
              </Motion.div>
            )}

            {/* Tab Panels */}
            {loading ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {[100, 220, 140].map((h, i) => (
                  <Skeleton key={i} w="100%" h={h} />
                ))}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <div key={activeTab}>
                  {activeTab === "overview" && (
                    <OverviewTab
                      team={team}
                      pendingApprovals={approvals.filter(
                        (a) => (a.status ?? "pending") === "pending",
                      )}
                      attendanceSummary={attendanceSummary}
                      manager={manager}
                    />
                  )}
                  {activeTab === "team" && (
                    <TeamTab team={team} onViewProfile={setSelectedEmp} />
                  )}
                  {activeTab === "approvals" && (
                    <ApprovalsTab
                      approvals={approvals.filter(
                        (a) => (a.status ?? "pending") === "pending",
                      )}
                      onApprove={fetchAll}
                      onReject={fetchAll}
                    />
                  )}
                  {activeTab === "attendance" && <AttendanceTab team={team} />}
                  {activeTab === "performance" && (
                    <PerformanceTab team={team} />
                  )}
                </div>
              </AnimatePresence>
            )}

            <div style={{ height: 28 }} />
          </div>
        </div>
      </div>

      {/* Employee profile drawer */}
      <AnimatePresence>
        {selectedEmp && (
          <EmployeeDrawer
            emp={selectedEmp}
            onClose={() => setSelectedEmp(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
