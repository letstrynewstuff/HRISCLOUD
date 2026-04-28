// src/admin/employeemanagement/EmployeeProfile.jsx
// Route: /admin/employeemanagement/admin-viewemployeesprofile/:employeeId
// 100% API connected — zero mock data.
// motion → Motion throughout.

import { useState, useEffect, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
// import AdminSideNavbar from "../AdminSideNavbar";
import { useAuth } from "../../components/useAuth";
import {
  getEmployeeById,
  getEmployeeHistory,
  updateEmployee,
  deleteEmployee,
} from "../../api/service/employeeApi";
import { leaveApi } from "../../api/service/leaveApi";
import { attendanceApi } from "../../api/service/attendanceApi";
import { getPayslip } from "../../api/service/payrollApi";
import { documentApi } from "../../api/service/documentApi";
import C from "../../styles/colors";
import {
  User,
  Briefcase,
  DollarSign,
  Clock,
  Plane,
  TrendingUp,
  FileText,
  Shield,
  Edit3,
  ChevronRight,
  Menu,
  X,
  Check,
  AlertCircle,
  Download,
  Trash2,
  Eye,
  MoreVertical,
  Award,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Building2,
  Users,
  UserX,
  Lock,
  History,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Hash,
  CreditCard,
  Activity,
  Info,
  ExternalLink,
  Loader2,
  AlertTriangle,
  UserCog,
  ArrowLeft,
} from "lucide-react";

const TABS = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "employment", label: "Employment History", icon: Briefcase },
  { id: "payroll", label: "Payroll History", icon: DollarSign },
  { id: "leave", label: "Leave History", icon: Plane },
  { id: "attendance", label: "Attendance History", icon: Clock },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "audit", label: "Audit Trail", icon: Shield },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fmt = (n) => (n ? `₦${Number(n).toLocaleString("en-NG")}` : "—");
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

// ── Shared atoms ──
function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const Chip = ({
  label,
  color = C.primary,
  bg = C.primaryLight,
  dot = false,
}) => (
  <span
    className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
    style={{ background: bg, color }}
  >
    {dot && (
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: color }}
      />
    )}
    {label}
  </span>
);

function StatusBadge({ status }) {
  const m = {
    active: { label: "Active", color: C.success, bg: C.successLight },
    on_leave: { label: "On Leave", color: C.warning, bg: C.warningLight },
    suspended: { label: "Suspended", color: C.danger, bg: C.dangerLight },
    terminated: { label: "Terminated", color: C.textMuted, bg: C.surfaceAlt },
    resigned: { label: "Resigned", color: C.textMuted, bg: C.surfaceAlt },
    inactive: { label: "Inactive", color: C.textMuted, bg: C.surfaceAlt },
  };
  const s = m[status?.toLowerCase()] || m.active;
  return <Chip label={s.label} color={s.color} bg={s.bg} dot />;
}

function AvatarEl({ name, avatar, dept, size = 56 }) {
  const ini = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "??";
  if (avatar)
    return (
      <img
        src={avatar}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  const colors = [
    "#6366F1",
    "#06B6D4",
    "#10B981",
    "#F59E0B",
    "#EC4899",
    "#8B5CF6",
    "#EF4444",
    "#F97316",
  ];
  const bg = colors[ini.charCodeAt(0) % colors.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: `linear-gradient(135deg,${bg},${bg}bb)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.3,
        fontFamily: "Sora,sans-serif",
        flexShrink: 0,
      }}
    >
      {ini}
    </div>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div
      className="flex items-start justify-between py-2.5 border-b last:border-0"
      style={{ borderColor: C.border }}
    >
      <span
        className="text-xs font-medium"
        style={{ color: C.textMuted, minWidth: 140 }}
      >
        {label}
      </span>
      <span
        className="text-sm text-right"
        style={{
          color: value ? C.textPrimary : C.textMuted,
          fontFamily: mono ? "monospace" : "inherit",
          fontWeight: value ? 500 : 400,
        }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  color = C.primary,
  bg = C.primaryLight,
}) {
  return (
    <div
      className="flex items-center gap-3 p-4"
      style={{ borderBottom: `1px solid ${C.border}` }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: bg }}
      >
        <Icon size={15} color={color} />
      </div>
      <p className="text-sm font-bold" style={{ color: C.textPrimary }}>
        {title}
      </p>
    </div>
  );
}

// ── Tabs ──
function PersonalTab({ emp }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <SectionHeader icon={User} title="Personal Details" />
        <div className="px-5 py-2">
          <InfoRow label="First Name" value={emp.first_name} />
          <InfoRow label="Middle Name" value={emp.middle_name} />
          <InfoRow label="Last Name" value={emp.last_name} />
          <InfoRow label="Date of Birth" value={fmtDate(emp.date_of_birth)} />
          <InfoRow label="Gender" value={emp.gender} />
          <InfoRow label="Marital Status" value={emp.marital_status} />
          <InfoRow label="Nationality" value={emp.nationality} />
        </div>
      </Card>
      <Card>
        <SectionHeader
          icon={Mail}
          title="Contact Information"
          color={C.accent}
          bg={C.accentLight}
        />
        <div className="px-5 py-2">
          <InfoRow label="Work Email" value={emp.work_email} />
          <InfoRow label="Personal Email" value={emp.personal_email} />
          <InfoRow label="Phone" value={emp.phone} />
          <InfoRow label="Address" value={emp.address} />
          <InfoRow label="State" value={emp.state} />
        </div>
      </Card>
      <Card className="md:col-span-2">
        <SectionHeader
          icon={Users}
          title="Next of Kin / Emergency Contact"
          color={C.warning}
          bg={C.warningLight}
        />
        <div className="px-5 py-2 grid grid-cols-2 gap-x-8">
          <InfoRow label="Name" value={emp.nok_name} />
          <InfoRow label="Relationship" value={emp.nok_relationship} />
          <InfoRow label="Phone" value={emp.nok_phone} />
          <InfoRow label="Address" value={emp.nok_address} />
        </div>
      </Card>
    </div>
  );
}

function EmploymentTab({ history }) {
  if (!history?.length)
    return (
      <div className="py-16 text-center" style={{ color: C.textMuted }}>
        <Briefcase size={36} className="mx-auto mb-2" color={C.textMuted} />
        <p className="text-sm">No employment history found.</p>
      </div>
    );
  return (
    <div className="space-y-3">
      {history.map((h, i) => (
        <Card key={h.id ?? i} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p
                  className="text-sm font-bold"
                  style={{ color: C.textPrimary }}
                >
                  {h.job_role_name ?? h.role ?? "—"}
                </p>
                <Chip
                  label={h.event_type ?? h.eventType ?? "change"}
                  color={C.primary}
                  bg={C.primaryLight}
                />
              </div>
              <p className="text-xs" style={{ color: C.textSecondary }}>
                {h.department_name ?? h.department ?? "—"}
              </p>
              <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                {fmtDate(h.effective_date ?? h.startDate)}{" "}
                {h.endDate ? `— ${fmtDate(h.endDate)}` : "· Current"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: C.textMuted }}>
                Changed by
              </p>
              <p
                className="text-xs font-semibold"
                style={{ color: C.textSecondary }}
              >
                {h.recorded_by_name ?? h.changedBy ?? "—"}
              </p>
            </div>
          </div>
          {h.notes && (
            <p className="mt-2 text-xs italic" style={{ color: C.textMuted }}>
              {h.notes}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}

function PayrollTab({ empId }) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empId) return;
    // Fetch last 6 months of payslips
    const promises = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return getPayslip(empId, d.getMonth() + 1, d.getFullYear()).catch(
        () => null,
      );
    });
    Promise.all(promises)
      .then((results) =>
        setRuns(results.filter(Boolean).map((r) => r.data ?? r)),
      )
      .finally(() => setLoading(false));
  }, [empId]);

  if (loading)
    return (
      <div className="py-16 text-center">
        <Loader2 size={24} color={C.primary} className="animate-spin mx-auto" />
      </div>
    );
  if (!runs.length)
    return (
      <div className="py-16 text-center text-sm" style={{ color: C.textMuted }}>
        No payroll records found.
      </div>
    );

  return (
    <div className="overflow-x-auto">
      <Card>
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.surfaceAlt }}>
              {[
                "Period",
                "Basic",
                "Allowances",
                "Gross",
                "Deductions",
                "Net Pay",
                "Status",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-bold uppercase"
                  style={{ color: C.textMuted }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {runs.map((r, i) => (
              <tr
                key={i}
                className="border-b"
                style={{ borderColor: C.border }}
              >
                <td
                  className="px-4 py-3 text-sm font-medium"
                  style={{ color: C.textPrimary }}
                >
                  {r.period ?? `${r.month}/${r.year}`}
                </td>
                <td className="px-4 py-3 text-sm">{fmt(r.basic_salary)}</td>
                <td className="px-4 py-3 text-sm">
                  {fmt(
                    (r.housing_allowance ?? 0) +
                      (r.transport_allowance ?? 0) +
                      (r.medical_allowance ?? 0),
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-semibold">
                  {fmt(r.gross_pay)}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: C.danger }}>
                  {fmt(r.total_deductions)}
                </td>
                <td
                  className="px-4 py-3 text-sm font-bold"
                  style={{ color: C.success }}
                >
                  {fmt(r.net_pay)}
                </td>
                <td className="px-4 py-3">
                  <Chip label="Paid" color={C.success} bg={C.successLight} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function LeaveTab({ empId }) {
  const [requests, setRequests] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empId) return;
    Promise.all([
      leaveApi.getAllRequests({ employeeId: empId, limit: 20 }),
      leaveApi.getAllBalances({ employeeId: empId }),
    ])
      .then(([req, bal]) => {
        setRequests(req.data ?? req.requests ?? []);
        setBalances(bal.data ?? bal.balances ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [empId]);

  if (loading)
    return (
      <div className="py-16 text-center">
        <Loader2 size={24} color={C.primary} className="animate-spin mx-auto" />
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Balances */}
      {balances.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {balances.map((b) => (
            <Card key={b.id} className="p-4 text-center">
              <p
                className="text-2xl font-bold"
                style={{ color: C.primary, fontFamily: "Sora,sans-serif" }}
              >
                {b.remaining_days ?? b.balance ?? 0}
              </p>
              <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                {b.leave_type ?? b.policy_name}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>
                of {b.entitled_days} days
              </p>
            </Card>
          ))}
        </div>
      )}
      {/* Requests */}
      <Card>
        <SectionHeader
          icon={Plane}
          title="Leave Requests"
          color={C.accent}
          bg={C.accentLight}
        />
        {requests.length === 0 ? (
          <div
            className="py-12 text-center text-sm"
            style={{ color: C.textMuted }}
          >
            No leave requests.
          </div>
        ) : (
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceAlt }}>
                {["Type", "Start", "End", "Days", "Status", "Reason"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold uppercase"
                      style={{ color: C.textMuted }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {requests.map((r, i) => (
                <tr
                  key={r.id ?? i}
                  className="border-b"
                  style={{ borderColor: C.border }}
                >
                  <td className="px-4 py-3 text-sm font-medium">
                    {r.leave_type ?? r.type}
                  </td>
                  <td className="px-4 py-3 text-sm">{fmtDate(r.start_date)}</td>
                  <td className="px-4 py-3 text-sm">{fmtDate(r.end_date)}</td>
                  <td className="px-4 py-3 text-sm">{r.days}</td>
                  <td className="px-4 py-3">
                    <Chip
                      label={r.status}
                      color={
                        r.status === "approved"
                          ? C.success
                          : r.status === "rejected"
                            ? C.danger
                            : C.warning
                      }
                      bg={
                        r.status === "approved"
                          ? C.successLight
                          : r.status === "rejected"
                            ? C.dangerLight
                            : C.warningLight
                      }
                      dot
                    />
                  </td>
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: C.textSecondary }}
                  >
                    {r.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function AttendanceTab({ empId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empId) return;
    attendanceApi
      .getByEmployee(empId, { limit: 30 })
      .then((r) => setRecords(r.rows ?? r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [empId]);

  if (loading)
    return (
      <div className="py-16 text-center">
        <Loader2 size={24} color={C.primary} className="animate-spin mx-auto" />
      </div>
    );

  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const rate = records.length
    ? Math.round(((present + late) / records.length) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: "Present",
            value: present,
            color: C.success,
            bg: C.successLight,
          },
          { label: "Late", value: late, color: C.warning, bg: C.warningLight },
          {
            label: "Absent",
            value: absent,
            color: C.danger,
            bg: C.dangerLight,
          },
          {
            label: "Rate",
            value: `${rate}%`,
            color: C.primary,
            bg: C.primaryLight,
          },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p
              className="text-2xl font-bold"
              style={{ color: s.color, fontFamily: "Sora,sans-serif" }}
            >
              {s.value}
            </p>
            <p className="text-xs mt-1" style={{ color: s.color }}>
              {s.label}
            </p>
          </Card>
        ))}
      </div>
      <Card>
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.surfaceAlt }}>
              {["Date", "Clock In", "Clock Out", "Hours", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-bold uppercase"
                  style={{ color: C.textMuted }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr
                key={r.id ?? i}
                className="border-b"
                style={{ borderColor: C.border }}
              >
                <td className="px-4 py-3 text-sm">
                  {fmtDate(r.attendanceDate ?? r.attendance_date)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {(r.clockIn ?? r.clock_in)
                    ? new Date(r.clockIn ?? r.clock_in).toLocaleTimeString(
                        "en-NG",
                        { hour: "2-digit", minute: "2-digit" },
                      )
                    : "—"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {(r.clockOut ?? r.clock_out)
                    ? new Date(r.clockOut ?? r.clock_out).toLocaleTimeString(
                        "en-NG",
                        { hour: "2-digit", minute: "2-digit" },
                      )
                    : "—"}
                </td>
                <td className="px-4 py-3 text-sm font-semibold">
                  {(r.hoursWorked ?? r.hours_worked)
                    ? `${Number(r.hoursWorked ?? r.hours_worked).toFixed(1)}h`
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <Chip
                    label={r.status ?? "—"}
                    color={
                      r.status === "present"
                        ? C.success
                        : r.status === "late"
                          ? C.warning
                          : C.danger
                    }
                    bg={
                      r.status === "present"
                        ? C.successLight
                        : r.status === "late"
                          ? C.warningLight
                          : C.dangerLight
                    }
                    dot
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function DocumentsTab({ empId }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empId) return;
    documentApi
      .getAll({ employeeId: empId })
      .then((r) => setDocs(r.data ?? r.documents ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [empId]);

  if (loading)
    return (
      <div className="py-16 text-center">
        <Loader2 size={24} color={C.primary} className="animate-spin mx-auto" />
      </div>
    );

  return (
    <Card>
      <SectionHeader icon={FileText} title="Documents" />
      {docs.length === 0 ? (
        <div
          className="py-12 text-center text-sm"
          style={{ color: C.textMuted }}
        >
          No documents found.
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: C.border }}>
          {docs.map((d, i) => (
            <div key={d.id ?? i} className="flex items-center gap-3 px-5 py-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: C.primaryLight }}
              >
                <FileText size={14} color={C.primary} />
              </div>
              <div className="flex-1">
                <p
                  className="text-sm font-semibold"
                  style={{ color: C.textPrimary }}
                >
                  {d.title ?? d.name}
                </p>
                <p className="text-xs" style={{ color: C.textMuted }}>
                  {fmtDate(d.created_at)}
                </p>
              </div>
              <Chip
                label={d.status ?? "pending"}
                color={d.status === "signed" ? C.success : C.warning}
                bg={d.status === "signed" ? C.successLight : C.warningLight}
                dot
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function AuditTab({ history }) {
  return (
    <Card>
      <SectionHeader
        icon={Shield}
        title="Audit Trail"
        color={C.purple}
        bg={C.purpleLight}
      />
      {!history?.length ? (
        <div
          className="py-12 text-center text-sm"
          style={{ color: C.textMuted }}
        >
          No audit records.
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: C.border }}>
          {history.map((h, i) => (
            <div key={h.id ?? i} className="flex gap-4 px-5 py-4">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                style={{ background: C.primary }}
              >
                {(h.recorded_by_name ?? h.changedBy ?? "?")[0]?.toUpperCase()}
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: C.textPrimary }}
                >
                  {h.event_type ?? h.eventType ?? "Update"}
                </p>
                {h.notes && (
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: C.textSecondary }}
                  >
                    {h.notes}
                  </p>
                )}
                <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                  {fmtDate(h.effective_date ?? h.created_at)} ·{" "}
                  {h.recorded_by_name ?? h.changedBy ?? "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Deactivate / Action Modal ──
function ActionModal({ action, emp, onConfirm, onClose, loading }) {
  const cfg = {
    deactivate: {
      title: "Deactivate Employee",
      msg: `This will suspend ${emp?.first_name}'s access immediately.`,
      color: C.danger,
      bg: C.dangerLight,
      icon: UserX,
    },
    terminate: {
      title: "Terminate Employment",
      msg: `This permanently ends ${emp?.first_name}'s employment.`,
      color: C.danger,
      bg: C.dangerLight,
      icon: UserX,
    },
  };
  const c = cfg[action] || cfg.deactivate;
  const Icon = c.icon;
  return (
    <>
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <Motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95 }}
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-4"
      >
        <div
          className="rounded-2xl p-6 shadow-2xl"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: c.bg }}
          >
            <Icon size={22} color={c.color} />
          </div>
          <h3
            className="text-base font-bold text-center mb-2"
            style={{ color: C.textPrimary }}
          >
            {c.title}
          </h3>
          <p
            className="text-sm text-center mb-6"
            style={{ color: C.textSecondary }}
          >
            {c.msg}
          </p>
          <div className="flex gap-3">
            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                background: C.surfaceAlt,
                color: C.textSecondary,
                border: `1px solid ${C.border}`,
                cursor: "pointer",
              }}
            >
              Cancel
            </Motion.button>
            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
              style={{
                background: c.color,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                "Confirm"
              )}
            </Motion.button>
          </div>
        </div>
      </Motion.div>
    </>
  );
}

// ════════════════════════════ MAIN ════════════════════════════
export default function EmployeeProfile() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { employee: adminUser } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [emp, setEmp] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [moreMenu, setMoreMenu] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [empRes, histRes] = await Promise.all([
        getEmployeeById(employeeId),
        getEmployeeHistory(employeeId).catch(() => ({ data: [] })),
      ]);
      setEmp(empRes.data ?? empRes);
      setHistory(histRes.data ?? histRes.rows ?? []);
    } catch (e) {
      setError(
        e?.response?.data?.message ?? "Failed to load employee profile.",
      );
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (actionModal === "deactivate") {
        await updateEmployee(employeeId, { employmentStatus: "suspended" });
        setEmp((p) => ({ ...p, employment_status: "suspended" }));
        showToast("Employee suspended. Access revoked.");
      } else if (actionModal === "terminate") {
        await deleteEmployee(employeeId, "Terminated by HR admin.");
        setEmp((p) => ({ ...p, employment_status: "terminated" }));
        showToast("Employee terminated.");
      }
      setActionModal(null);
    } catch (e) {
      showToast(e?.response?.data?.message ?? "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const name = emp
    ? `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim()
    : "—";
  const totalComp = emp
    ? Number(emp.basic_salary ?? 0) +
      Number(emp.housing_allowance ?? 0) +
      Number(emp.transport_allowance ?? 0) +
      Number(emp.medical_allowance ?? 0)
    : 0;

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
        {/* <AdminSideNavbar
          sidebarOpen={sidebarOpen}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          ADMIN={adminUser}
          pendingApprovals={0}
        /> */}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
              className="flex items-center gap-1.5 text-xs"
              style={{ color: C.textSecondary }}
            >
              <span>Admin</span>
              <ChevronRight size={11} />
              <button
                onClick={() =>
                  navigate("/admin/employeemanagement/admin-employeeslist")
                }
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: C.textSecondary,
                }}
              >
                Employees
              </button>
              <ChevronRight size={11} />
              <span className="font-bold" style={{ color: C.textPrimary }}>
                {loading ? "Loading…" : name}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {emp && (
                <>
                  <Motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      navigate(
                        `/admin/employeemanagement/admin-editemployee/${employeeId}`,
                      )
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg,${C.primary},#8B5CF6)`,
                      border: "none",
                      cursor: "pointer",
                      boxShadow: `0 3px 12px ${C.primary}44`,
                    }}
                  >
                    <Edit3 size={12} /> Edit Profile
                  </Motion.button>
                  <div className="relative">
                    <Motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setMoreMenu((p) => !p)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        cursor: "pointer",
                      }}
                    >
                      <MoreVertical size={14} color={C.textSecondary} />
                    </Motion.button>
                    <AnimatePresence>
                      {moreMenu && (
                        <Motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-30"
                          style={{
                            background: C.surface,
                            border: `1px solid ${C.border}`,
                            boxShadow: "0 12px 40px rgba(15,23,42,0.14)",
                            minWidth: 180,
                          }}
                        >
                          {[
                            {
                              label: "Deactivate Account",
                              icon: Lock,
                              action: () => {
                                setActionModal("deactivate");
                                setMoreMenu(false);
                              },
                              danger: true,
                            },
                            {
                              label: "Terminate Employment",
                              icon: UserX,
                              action: () => {
                                setActionModal("terminate");
                                setMoreMenu(false);
                              },
                              danger: true,
                            },
                            {
                              label: "Refresh Data",
                              icon: RefreshCw,
                              action: () => {
                                fetch();
                                setMoreMenu(false);
                              },
                            },
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={item.action}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-slate-50"
                              style={{
                                color: item.danger ? C.danger : C.textSecondary,
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                              }}
                            >
                              <item.icon size={13} />
                              {item.label}
                            </button>
                          ))}
                        </Motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
              <Motion.button
                whileHover={{ scale: 1.05 }}
                onClick={fetch}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={13} color={C.textMuted} />
              </Motion.button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
            {error && (
              <div
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{
                  background: C.dangerLight,
                  border: `1px solid ${C.danger}33`,
                }}
              >
                <AlertCircle size={16} color={C.danger} />
                <p className="text-sm flex-1" style={{ color: C.danger }}>
                  {error}
                </p>
                <button
                  onClick={fetch}
                  className="text-xs font-bold px-3 py-1 rounded-lg"
                  style={{
                    background: C.danger,
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col gap-4">
                {[120, 80, 200].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      height: h,
                      borderRadius: 16,
                      background:
                        "linear-gradient(90deg,#E2E8F4 25%,#EFF6FF 50%,#E2E8F4 75%)",
                      backgroundSize: "200%",
                      animation: "shimmer 1.4s infinite",
                    }}
                  />
                ))}
              </div>
            ) : (
              emp && (
                <>
                  {/* Profile Hero */}
                  <Motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={0}
                  >
                    <Card>
                      <div
                        style={{
                          background: `linear-gradient(135deg,${C.navy},${C.primary})`,
                          padding: "24px 24px 0",
                        }}
                      >
                        <div className="flex items-end gap-4 flex-wrap pb-4">
                          <AvatarEl name={name} avatar={emp.avatar} size={72} />
                          <div className="flex-1 pb-2">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h1
                                className="text-xl font-bold text-white"
                                style={{ fontFamily: "Sora,sans-serif" }}
                              >
                                {name}
                              </h1>
                              <StatusBadge status={emp.employment_status} />
                            </div>
                            <p
                              className="text-sm"
                              style={{ color: "rgba(255,255,255,0.7)" }}
                            >
                              {emp.job_role_name ?? "—"} ·{" "}
                              {emp.department_name ?? "—"}
                            </p>
                            <div className="flex items-center gap-4 mt-2 flex-wrap">
                              {[
                                { icon: Hash, val: emp.employee_code },
                                {
                                  icon: Mail,
                                  val: emp.work_email ?? emp.personal_email,
                                },
                                { icon: MapPin, val: emp.location },
                                {
                                  icon: Calendar,
                                  val: emp.start_date
                                    ? `Joined ${fmtDate(emp.start_date)}`
                                    : null,
                                },
                              ]
                                .filter((x) => x.val)
                                .map(({ icon: Icon, val }) => (
                                  <span
                                    key={val}
                                    className="flex items-center gap-1 text-xs"
                                    style={{ color: "rgba(255,255,255,0.55)" }}
                                  >
                                    <Icon size={11} /> {val}
                                  </span>
                                ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 pb-4">
                            {[
                              {
                                label: "Monthly Gross",
                                value: fmt(totalComp),
                                color: C.success,
                              },
                              {
                                label: "Employment",
                                value: (emp.employment_type ?? "—").replace(
                                  "_",
                                  " ",
                                ),
                                color: C.accent,
                              },
                            ].map((s) => (
                              <div
                                key={s.label}
                                className="text-center px-4 py-2 rounded-xl"
                                style={{ background: "rgba(255,255,255,0.10)" }}
                              >
                                <p
                                  className="text-[10px] font-semibold uppercase tracking-wide mb-0.5"
                                  style={{ color: "rgba(255,255,255,0.5)" }}
                                >
                                  {s.label}
                                </p>
                                <p
                                  className="text-base font-bold"
                                  style={{
                                    color: s.color,
                                    fontFamily: "Sora,sans-serif",
                                  }}
                                >
                                  {s.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Tab bar */}
                      <div
                        className="flex items-center gap-1 overflow-x-auto px-4 py-3"
                        style={{ scrollbarWidth: "none" }}
                      >
                        {TABS.map((tab) => {
                          const Icon = tab.icon;
                          const isActive = activeTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
                              style={{
                                background: isActive ? C.primary : C.surface,
                                color: isActive ? "#fff" : C.textSecondary,
                                border: `1px solid ${isActive ? "transparent" : C.border}`,
                                boxShadow: isActive
                                  ? `0 4px 12px ${C.primary}44`
                                  : "none",
                                cursor: "pointer",
                              }}
                            >
                              <Icon size={12} />
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>
                    </Card>
                  </Motion.div>

                  {/* Tab content */}
                  <AnimatePresence mode="wait">
                    <Motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      {activeTab === "personal" && <PersonalTab emp={emp} />}
                      {activeTab === "employment" && (
                        <EmploymentTab history={history} />
                      )}
                      {activeTab === "payroll" && <PayrollTab empId={emp.id} />}
                      {activeTab === "leave" && <LeaveTab empId={emp.id} />}
                      {activeTab === "attendance" && (
                        <AttendanceTab empId={emp.id} />
                      )}
                      {activeTab === "documents" && (
                        <DocumentsTab empId={emp.id} />
                      )}
                      {activeTab === "audit" && <AuditTab history={history} />}
                    </Motion.div>
                  </AnimatePresence>
                </>
              )
            )}
            <div className="h-4" />
          </main>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {actionModal && emp && (
          <ActionModal
            action={actionModal}
            emp={emp}
            onConfirm={handleAction}
            onClose={() => setActionModal(null)}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl z-50"
            style={{
              background: C.navy,
              color: "#fff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              minWidth: 300,
            }}
          >
            <CheckCircle2 size={15} color={C.success} />
            <span className="text-sm">{toast}</span>
            <button
              onClick={() => setToast(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                marginLeft: "auto",
              }}
            >
              <X size={13} color="rgba(255,255,255,0.5)" />
            </button>
          </Motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}
