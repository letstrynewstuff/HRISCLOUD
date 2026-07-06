

// src/components/admin/employee/EmployeeProfileView.tsx
// Mobile Employee Profile — mirrors web EmployeeProfile.jsx

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  User,
  Briefcase,
  DollarSign,
  Clock,
  Plane,
  FileText,
  Shield,
  Edit3,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  AlertCircle,
  Download,
  Trash2,
  Eye,
  MoreVertical,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Building2,
  Users,
  UserX,
  Lock,
  RefreshCw,
  CheckCircle2,
  Hash,
  CreditCard,
  Activity,
  Loader2,
} from "lucide-react-native";

import C from "../../../styles/colors";
import { useAuth } from "../../../hooks/useAuth";
import {
  getEmployeeById,
  getEmployeeHistory,
  updateEmployee,
  deleteEmployee,
} from "../../../api/service/employeeApi";
import { leaveApi } from "../../../api/service/leaveApi";
import { attendanceApi } from "../../../api/service/attendanceApi";
import { getPayslip } from "../../../api/service/payrollApi";
import { documentApi } from "../../../api/service/documentApi";
import { Loader } from "../../../hooks/loaderManager";

/* ─── Helpers ─────────────────────────────────────────────── */
const fmt = (n: number | null | undefined) =>
  n ? `₦${Number(n).toLocaleString("en-NG")}` : "—";

const fmtDate = (d: string | null | undefined) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

function stringToColor(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360},65%,52%)`;
}

/* ─── Sub-components ──────────────────────────────────────── */
function AvatarEl({ name, size = 56 }: { name: string; size?: number }) {
  const ini = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "??";
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
    <View
      style={[
        styles.avatarWrap,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
          backgroundColor: bg,
        },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.3 }]}>{ini}</Text>
    </View>
  );
}

function Chip({
  label,
  color = C.primary,
  bg = C.primaryLight,
  dot = false,
}: {
  label: string;
  color?: string;
  bg?: string;
  dot?: boolean;
}) {
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      {dot && <View style={[styles.chipDot, { backgroundColor: color }]} />}
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const m: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: "Active", color: C.success, bg: C.successLight },
    on_leave: { label: "On Leave", color: C.warning, bg: C.warningLight },
    suspended: { label: "Suspended", color: C.danger, bg: C.dangerLight },
    terminated: { label: "Terminated", color: C.textMuted, bg: C.surfaceAlt },
    resigned: { label: "Resigned", color: C.textMuted, bg: C.surfaceAlt },
    inactive: { label: "Inactive", color: C.textMuted, bg: C.surfaceAlt },
  };
  const s = m[status?.toLowerCase() ?? ""] || m.active;
  return <Chip label={s.label} color={s.color} bg={s.bg} dot />;
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoRowLabel}>{label}</Text>
      <Text
        style={[
          styles.infoRowValue,
          !value && styles.infoRowValueEmpty,
          mono && styles.infoRowValueMono,
        ]}
      >
        {value || "—"}
      </Text>
    </View>
  );
}

function SectionCard({
  icon: Icon,
  title,
  color = C.primary,
  bg = C.primaryLight,
  children,
}: {
  icon: any;
  title: string;
  color?: string;
  bg?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionCardHeader}>
        <View style={[styles.sectionCardIconWrap, { backgroundColor: bg }]}>
          <Icon size={15} color={color} />
        </View>
        <Text style={styles.sectionCardTitle}>{title}</Text>
      </View>
      <View style={styles.sectionCardBody}>{children}</View>
    </View>
  );
}

/* ─── Tab Components ────────────────────────────────────── */
function PersonalTab({ emp }: { emp: any }) {
  return (
    <View style={styles.tabContent}>
      <SectionCard icon={User} title="Personal Details">
        <InfoRow label="First Name" value={emp.first_name} />
        <InfoRow label="Middle Name" value={emp.middle_name} />
        <InfoRow label="Last Name" value={emp.last_name} />
        <InfoRow label="Date of Birth" value={fmtDate(emp.date_of_birth)} />
        <InfoRow label="Gender" value={emp.gender} />
        <InfoRow label="Marital Status" value={emp.marital_status} />
        <InfoRow label="Nationality" value={emp.nationality} />
      </SectionCard>

      <SectionCard
        icon={Mail}
        title="Contact Information"
        color={C.accent}
        bg={C.accentLight}
      >
        <InfoRow label="Work Email" value={emp.work_email} />
        <InfoRow label="Personal Email" value={emp.personal_email} />
        <InfoRow label="Phone" value={emp.phone} />
        <InfoRow label="Address" value={emp.address} />
        <InfoRow label="State" value={emp.state} />
      </SectionCard>

      <SectionCard
        icon={Users}
        title="Next of Kin / Emergency Contact"
        color={C.warning}
        bg={C.warningLight}
      >
        <InfoRow label="Name" value={emp.nok_name} />
        <InfoRow label="Relationship" value={emp.nok_relationship} />
        <InfoRow label="Phone" value={emp.nok_phone} />
        <InfoRow label="Address" value={emp.nok_address} />
      </SectionCard>
    </View>
  );
}

function EmploymentTab({ history }: { history: any[] }) {
  if (!history?.length)
    return (
      <View style={styles.emptyTab}>
        <Briefcase size={36} color={C.textMuted} />
        <Text style={styles.emptyTabText}>No employment history found.</Text>
      </View>
    );

  return (
    <View style={styles.tabContent}>
      {history.map((h, i) => (
        <View key={h.id ?? i} style={styles.historyCard}>
          <View style={styles.historyCardHeader}>
            <View>
              <View style={styles.historyCardTitleRow}>
                <Text style={styles.historyCardTitle}>
                  {h.job_role_name ?? h.role ?? "—"}
                </Text>
                <Chip
                  label={h.event_type ?? h.eventType ?? "change"}
                  color={C.primary}
                  bg={C.primaryLight}
                />
              </View>
              <Text style={styles.historyCardSubtitle}>
                {h.department_name ?? h.department ?? "—"}
              </Text>
              <Text style={styles.historyCardDate}>
                {fmtDate(h.effective_date ?? h.startDate)}{" "}
                {h.endDate ? `— ${fmtDate(h.endDate)}` : "· Current"}
              </Text>
            </View>
            <View style={styles.historyCardMeta}>
              <Text style={styles.historyCardMetaLabel}>Changed by</Text>
              <Text style={styles.historyCardMetaValue}>
                {h.recorded_by_name ?? h.changedBy ?? "—"}
              </Text>
            </View>
          </View>
          {h.notes && <Text style={styles.historyCardNotes}>{h.notes}</Text>}
        </View>
      ))}
    </View>
  );
}

function PayrollTab({ empId }: { empId: string }) {
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!empId) return;
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
      <View style={styles.emptyTab}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );

  if (!runs.length)
    return (
      <View style={styles.emptyTab}>
        <Text style={styles.emptyTabText}>No payroll records found.</Text>
      </View>
    );

  return (
    <View style={styles.tabContent}>
      {runs.map((r, i) => (
        <View key={i} style={styles.payrollCard}>
          <View style={styles.payrollCardHeader}>
            <Text style={styles.payrollCardPeriod}>
              {r.period ?? `${r.month}/${r.year}`}
            </Text>
            <Chip label="Paid" color={C.success} bg={C.successLight} dot />
          </View>
          <View style={styles.payrollGrid}>
            <View style={styles.payrollItem}>
              <Text style={styles.payrollItemLabel}>Basic</Text>
              <Text style={styles.payrollItemValue}>{fmt(r.basic_salary)}</Text>
            </View>
            <View style={styles.payrollItem}>
              <Text style={styles.payrollItemLabel}>Allowances</Text>
              <Text style={styles.payrollItemValue}>
                {fmt(
                  (r.housing_allowance ?? 0) +
                    (r.transport_allowance ?? 0) +
                    (r.medical_allowance ?? 0),
                )}
              </Text>
            </View>
            <View style={styles.payrollItem}>
              <Text style={styles.payrollItemLabel}>Gross</Text>
              <Text
                style={[
                  styles.payrollItemValue,
                  { color: C.textPrimary, fontWeight: "800" },
                ]}
              >
                {fmt(r.gross_pay)}
              </Text>
            </View>
            <View style={styles.payrollItem}>
              <Text style={styles.payrollItemLabel}>Deductions</Text>
              <Text style={[styles.payrollItemValue, { color: C.danger }]}>
                {fmt(r.total_deductions)}
              </Text>
            </View>
            <View style={styles.payrollItem}>
              <Text style={styles.payrollItemLabel}>Net Pay</Text>
              <Text
                style={[
                  styles.payrollItemValue,
                  { color: C.success, fontWeight: "800" },
                ]}
              >
                {fmt(r.net_pay)}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

function LeaveTab({ empId }: { empId: string }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
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
      <View style={styles.emptyTab}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );

  return (
    <View style={styles.tabContent}>
      {/* Balances */}
      {balances.length > 0 && (
        <View style={styles.balanceGrid}>
          {balances.map((b) => (
            <View key={b.id} style={styles.balanceCard}>
              <Text style={styles.balanceValue}>
                {b.remaining_days ?? b.balance ?? 0}
              </Text>
              <Text style={styles.balanceLabel}>
                {b.leave_type ?? b.policy_name}
              </Text>
              <Text style={styles.balanceMeta}>of {b.entitled_days} days</Text>
            </View>
          ))}
        </View>
      )}

      {/* Requests */}
      <SectionCard
        icon={Plane}
        title="Leave Requests"
        color={C.accent}
        bg={C.accentLight}
      >
        {requests.length === 0 ? (
          <Text style={styles.emptyTabText}>No leave requests.</Text>
        ) : (
          <View style={styles.leaveList}>
            {requests.map((r, i) => (
              <View key={r.id ?? i} style={styles.leaveItem}>
                <View style={styles.leaveItemHeader}>
                  <Text style={styles.leaveItemType}>
                    {r.leave_type ?? r.type}
                  </Text>
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
                </View>
                <View style={styles.leaveItemDates}>
                  <Text style={styles.leaveItemDate}>
                    {fmtDate(r.start_date)}
                  </Text>
                  <ChevronRight size={12} color={C.textMuted} />
                  <Text style={styles.leaveItemDate}>
                    {fmtDate(r.end_date)}
                  </Text>
                  <Text style={styles.leaveItemDays}>({r.days} days)</Text>
                </View>
                {r.reason && (
                  <Text style={styles.leaveItemReason}>{r.reason}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </SectionCard>
    </View>
  );
}

function AttendanceTab({ empId }: { empId: string }) {
  const [records, setRecords] = useState<any[]>([]);
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
      <View style={styles.emptyTab}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );

  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const rate = records.length
    ? Math.round(((present + late) / records.length) * 100)
    : 0;

  return (
    <View style={styles.tabContent}>
      <View style={styles.attendanceStats}>
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
          <View
            key={s.label}
            style={[styles.attendanceStat, { backgroundColor: s.bg }]}
          >
            <Text style={[styles.attendanceStatValue, { color: s.color }]}>
              {s.value}
            </Text>
            <Text style={[styles.attendanceStatLabel, { color: s.color }]}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      <SectionCard icon={Clock} title="Attendance Records">
        {records.length === 0 ? (
          <Text style={styles.emptyTabText}>No attendance records.</Text>
        ) : (
          <View style={styles.attendanceList}>
            {records.map((r, i) => (
              <View key={r.id ?? i} style={styles.attendanceItem}>
                <View style={styles.attendanceItemLeft}>
                  <Text style={styles.attendanceItemDate}>
                    {fmtDate(r.attendanceDate ?? r.attendance_date)}
                  </Text>
                  <View style={styles.attendanceItemTimes}>
                    <Text style={styles.attendanceItemTime}>
                      {(r.clockIn ?? r.clock_in)
                        ? new Date(r.clockIn ?? r.clock_in).toLocaleTimeString(
                            "en-NG",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "—"}
                    </Text>
                    <Text style={styles.attendanceItemTimeSep}>→</Text>
                    <Text style={styles.attendanceItemTime}>
                      {(r.clockOut ?? r.clock_out)
                        ? new Date(
                            r.clockOut ?? r.clock_out,
                          ).toLocaleTimeString("en-NG", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </Text>
                  </View>
                </View>
                <View style={styles.attendanceItemRight}>
                  <Text style={styles.attendanceItemHours}>
                    {(r.hoursWorked ?? r.hours_worked)
                      ? `${Number(r.hoursWorked ?? r.hours_worked).toFixed(1)}h`
                      : "—"}
                  </Text>
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
                </View>
              </View>
            ))}
          </View>
        )}
      </SectionCard>
    </View>
  );
}

function DocumentsTab({ empId }: { empId: string }) {
  const [docs, setDocs] = useState<any[]>([]);
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
      <View style={styles.emptyTab}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );

  return (
    <SectionCard icon={FileText} title="Documents">
      {docs.length === 0 ? (
        <Text style={styles.emptyTabText}>No documents found.</Text>
      ) : (
        <View style={styles.docList}>
          {docs.map((d, i) => (
            <View key={d.id ?? i} style={styles.docItem}>
              <View style={styles.docIconWrap}>
                <FileText size={18} color={C.primary} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docTitle}>{d.title ?? d.name}</Text>
                <Text style={styles.docDate}>{fmtDate(d.created_at)}</Text>
              </View>
              <Chip
                label={d.status ?? "pending"}
                color={d.status === "signed" ? C.success : C.warning}
                bg={d.status === "signed" ? C.successLight : C.warningLight}
                dot
              />
            </View>
          ))}
        </View>
      )}
    </SectionCard>
  );
}

function AuditTab({ history }: { history: any[] }) {
  return (
    <SectionCard
      icon={Shield}
      title="Audit Trail"
      color={C.purple}
      bg={C.purpleLight}
    >
      {!history?.length ? (
        <Text style={styles.emptyTabText}>No audit records.</Text>
      ) : (
        <View style={styles.auditList}>
          {history.map((h, i) => (
            <View key={h.id ?? i} style={styles.auditItem}>
              <View style={styles.auditAvatar}>
                <Text style={styles.auditAvatarText}>
                  {(h.recorded_by_name ?? h.changedBy ?? "?")[0]?.toUpperCase()}
                </Text>
              </View>
              <View style={styles.auditContent}>
                <Text style={styles.auditEvent}>
                  {h.event_type ?? h.eventType ?? "Update"}
                </Text>
                {h.notes && <Text style={styles.auditNotes}>{h.notes}</Text>}
                <Text style={styles.auditMeta}>
                  {fmtDate(h.effective_date ?? h.created_at)} ·{" "}
                  {h.recorded_by_name ?? h.changedBy ?? "—"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </SectionCard>
  );
}

/* ─── Action Modal ──────────────────────────────────────── */
function ActionModal({
  action,
  emp,
  onConfirm,
  onClose,
  loading,
}: {
  action: string | null;
  emp: any;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  const cfg: Record<
    string,
    { title: string; msg: string; color: string; bg: string; icon: any }
  > = {
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
  const c = cfg[action ?? ""] || cfg.deactivate;
  const Icon = c.icon;

  return (
    <Modal
      visible={!!action}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={[styles.modalIconWrap, { backgroundColor: c.bg }]}>
            <Icon size={24} color={c.color} />
          </View>
          <Text style={styles.modalTitle}>{c.title}</Text>
          <Text style={styles.modalMsg}>{c.msg}</Text>
          <View style={styles.modalActions}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.modalBtnSecondary,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              style={({ pressed }) => [
                styles.modalBtnDanger,
                (loading || pressed) && { opacity: loading ? 0.7 : 0.85 },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalBtnDangerText}>Confirm</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ─── Toast ─────────────────────────────────────────────── */
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <View style={styles.toast}>
      <CheckCircle2 size={16} color={C.success} />
      <Text style={styles.toastText}>{msg}</Text>
      <Pressable onPress={onClose}>
        <X size={14} color="rgba(255,255,255,0.5)" />
      </Pressable>
    </View>
  );
}

/* ════════════════════════════ MAIN ════════════════════════════ */
interface Props {
  employeeId: string;
  onClose: () => void;
  onEdit?: (id: string) => void;
  onOffboarding?: (id: string, exitType: string) => void;
}

export default function EmployeeProfileView({
  employeeId,
  onClose,
  onEdit,
  onOffboarding,
}: Props) {
  const insets = useSafeAreaInsets();
  const { employee: adminUser } = useAuth();

  const [activeTab, setActiveTab] = useState("personal");
  const [emp, setEmp] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [moreMenu, setMoreMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const showToast = (msg: string) => setToast(msg);

  // const fetch = useCallback(async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const [empRes, histRes] = await Promise.all([
  //       getEmployeeById(employeeId),
  //       getEmployeeHistory(employeeId).catch(() => ({ data: [] })),
  //     ]);
  //     setEmp(empRes.data ?? empRes);
  //     setHistory(histRes.data ?? histRes.rows ?? []);
  //   } catch (e: any) {
  //     setError(
  //       e?.response?.data?.message ?? "Failed to load employee profile.",
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [employeeId]);
const fetch = useCallback(async () => {
  setLoading(true);
  setError(null);
  Loader.show();
  try {
    const [empRes, histRes] = await Promise.all([
      getEmployeeById(employeeId),
      getEmployeeHistory(employeeId).catch(() => ({ data: [] })),
    ]);
    setEmp(empRes.data ?? empRes);
    setHistory(histRes.data ?? histRes.rows ?? []);
  } catch (e: any) {
    setError(e?.response?.data?.message ?? "Failed to load employee profile.");
  } finally {
    setLoading(false);
    Loader.hide();
  }
}, [employeeId]);
  useEffect(() => {
    fetch();
  }, [fetch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  }, [fetch]);

  const handleAction = () => {
    setActionModal(null);
    if (actionModal === "deactivate") {
      onOffboarding?.(employeeId, "resigned");
    } else if (actionModal === "terminate") {
      onOffboarding?.(employeeId, "terminated");
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

  const TABS_CONFIG = [
    { id: "personal", label: "Personal", icon: User },
    { id: "employment", label: "Employment", icon: Briefcase },
    { id: "payroll", label: "Payroll", icon: DollarSign },
    { id: "leave", label: "Leave", icon: Plane },
    { id: "attendance", label: "Attendance", icon: Clock },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "audit", label: "Audit", icon: Shield },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{loading ? "Loading…" : name}</Text>
          <Text style={styles.headerSubtitle}>
            {emp
              ? `${emp.job_role_name ?? "—"} · ${emp.department_name ?? "—"}`
              : ""}
          </Text>
        </View>
        {emp && (
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => onEdit?.(employeeId)}
              style={({ pressed }) => [
                styles.headerBtnPrimary,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Edit3 size={14} color="#fff" />
              <Text style={styles.headerBtnPrimaryText}>Edit</Text>
            </Pressable>
            <Pressable
              onPress={() => setMoreMenu((p) => !p)}
              style={({ pressed }) => [
                styles.headerBtn,
                pressed && { opacity: 0.85 },
              ]}
            >
              <MoreVertical size={16} color={C.textSecondary} />
            </Pressable>
          </View>
        )}
      </View>

      {/* More Menu Dropdown */}
      {moreMenu && (
        <View style={styles.moreMenu}>
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
              danger: false,
            },
          ].map((item) => (
            <Pressable
              key={item.label}
              onPress={item.action}
              style={styles.moreMenuItem}
            >
              <item.icon
                size={14}
                color={item.danger ? C.danger : C.textSecondary}
              />
              <Text
                style={[
                  styles.moreMenuItemText,
                  item.danger && { color: C.danger },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View style={styles.errorBanner}>
            <AlertCircle size={16} color={C.danger} />
            <Text style={styles.errorBannerText}>{error}</Text>
            <Pressable onPress={fetch}>
              <RefreshCw size={14} color={C.danger} />
            </Pressable>
          </View>
        )}

        {loading ? (
          <View style={styles.skeletonWrap}>
            {[160, 120, 200].map((h, i) => (
              <View key={i} style={[styles.skeleton, { height: h }]} />
            ))}
          </View>
        ) : emp ? (
          <>
            {/* Profile Hero */}
            <View style={styles.hero}>
              <View style={[styles.heroGradient, { backgroundColor: C.navy }]}>
                <View style={styles.heroTop}>
                  <AvatarEl name={name} size={72} />
                  <View style={styles.heroInfo}>
                    <View style={styles.heroNameRow}>
                      <Text style={styles.heroName}>{name}</Text>
                      <StatusBadge status={emp.employment_status} />
                    </View>
                    <Text style={styles.heroRole}>
                      {emp.job_role_name ?? "—"} · {emp.department_name ?? "—"}
                    </Text>
                    <View style={styles.heroMetaRow}>
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
                          <View key={val} style={styles.heroMetaItem}>
                            <Icon size={11} color="rgba(255,255,255,0.55)" />
                            <Text style={styles.heroMetaText}>{val}</Text>
                          </View>
                        ))}
                    </View>
                  </View>
                </View>

                <View style={styles.heroStats}>
                  {[
                    {
                      label: "Monthly Gross",
                      value: fmt(totalComp),
                      color: C.success,
                    },
                    {
                      label: "Employment",
                      value: (emp.employment_type ?? "—").replace("_", " "),
                      color: C.accent,
                    },
                  ].map((s) => (
                    <View key={s.label} style={styles.heroStat}>
                      <Text style={styles.heroStatLabel}>{s.label}</Text>
                      <Text style={[styles.heroStatValue, { color: s.color }]}>
                        {s.value}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Tab bar */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabBar}
              >
                {TABS_CONFIG.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <Pressable
                      key={tab.id}
                      onPress={() => setActiveTab(tab.id)}
                      style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                    >
                      <Icon
                        size={12}
                        color={isActive ? "#fff" : C.textSecondary}
                      />
                      <Text
                        style={[
                          styles.tabBtnText,
                          isActive && styles.tabBtnTextActive,
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Tab Content */}
            {activeTab === "personal" && <PersonalTab emp={emp} />}
            {activeTab === "employment" && <EmploymentTab history={history} />}
            {activeTab === "payroll" && <PayrollTab empId={emp.id} />}
            {activeTab === "leave" && <LeaveTab empId={emp.id} />}
            {activeTab === "attendance" && <AttendanceTab empId={emp.id} />}
            {activeTab === "documents" && <DocumentsTab empId={emp.id} />}
            {activeTab === "audit" && <AuditTab history={history} />}
          </>
        ) : null}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Action Modal */}
      <ActionModal
        action={actionModal}
        emp={emp}
        onConfirm={handleAction}
        onClose={() => setActionModal(null)}
        loading={actionLoading}
      />

      {/* Toast */}
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.bg,
  },
  headerBack: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  headerTitle: { fontSize: 17, fontWeight: "800", color: C.textPrimary },
  headerSubtitle: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  headerBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: C.primary,
  },
  headerBtnPrimaryText: { fontSize: 12, fontWeight: "800", color: "#fff" },

  /* More Menu */
  moreMenu: {
    position: "absolute",
    top: 60,
    right: 16,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 8,
    minWidth: 200,
    zIndex: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  moreMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  moreMenuItemText: { fontSize: 13, color: C.textSecondary, fontWeight: "600" },

  /* Error */
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.dangerLight,
    borderWidth: 1,
    borderColor: C.danger + "33",
    marginBottom: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: C.danger,
  },

  /* Skeleton */
  skeletonWrap: { padding: 16, gap: 12 },
  skeleton: {
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },

  /* Hero */
  hero: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  heroGradient: {
    padding: 20,
    paddingBottom: 16,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  heroInfo: { flex: 1 },
  heroNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 4,
  },
  heroName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    fontFamily: Platform.OS === "ios" ? "Sora" : "sans-serif",
  },
  heroRole: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 8,
  },
  heroMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  heroMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  heroMetaText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
  },
  heroStats: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  heroStat: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
  },
  heroStatLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroStatValue: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 2,
  },

  /* Tab Bar */
  tabBar: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabBtnActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  tabBtnText: { fontSize: 11, fontWeight: "700", color: C.textSecondary },
  tabBtnTextActive: { color: "#fff" },

  /* Tab Content */
  tabContent: { padding: 16, gap: 12 },

  /* Section Card */
  sectionCard: {
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  sectionCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  sectionCardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionCardTitle: { fontSize: 14, fontWeight: "800", color: C.textPrimary },
  sectionCardBody: { paddingHorizontal: 14 },

  /* Info Row */
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  infoRowLabel: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: "600",
    minWidth: 120,
  },
  infoRowValue: {
    fontSize: 13,
    color: C.textPrimary,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
  infoRowValueEmpty: { color: C.textMuted, fontWeight: "400" },
  infoRowValueMono: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },

  /* Empty Tab */
  emptyTab: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyTabText: { fontSize: 14, color: C.textMuted, textAlign: "center" },

  /* History Card */
  historyCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    gap: 8,
  },
  historyCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  historyCardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 4,
  },
  historyCardTitle: { fontSize: 14, fontWeight: "700", color: C.textPrimary },
  historyCardSubtitle: { fontSize: 12, color: C.textSecondary },
  historyCardDate: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  historyCardMeta: { alignItems: "flex-end" },
  historyCardMetaLabel: { fontSize: 10, color: C.textMuted },
  historyCardMetaValue: {
    fontSize: 11,
    color: C.textSecondary,
    fontWeight: "600",
  },
  historyCardNotes: { fontSize: 12, color: C.textMuted, fontStyle: "italic" },

  /* Payroll Card */
  payrollCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    gap: 10,
  },
  payrollCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  payrollCardPeriod: { fontSize: 14, fontWeight: "700", color: C.textPrimary },
  payrollGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  payrollItem: {
    width: "30%",
    padding: 8,
    borderRadius: 10,
    backgroundColor: C.surfaceAlt,
  },
  payrollItemLabel: { fontSize: 10, color: C.textMuted, marginBottom: 2 },
  payrollItemValue: { fontSize: 13, fontWeight: "700", color: C.textPrimary },

  /* Balance Grid */
  balanceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  balanceCard: {
    flex: 1,
    minWidth: "45%",
    padding: 14,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: "800",
    color: C.primary,
    fontFamily: Platform.OS === "ios" ? "Sora" : "sans-serif",
  },
  balanceLabel: {
    fontSize: 12,
    color: C.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  balanceMeta: { fontSize: 10, color: C.textMuted, marginTop: 2 },

  /* Leave List */
  leaveList: { gap: 10 },
  leaveItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  leaveItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  leaveItemType: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  leaveItemDates: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  leaveItemDate: { fontSize: 12, color: C.textSecondary },
  leaveItemDays: { fontSize: 11, color: C.textMuted },
  leaveItemReason: { fontSize: 12, color: C.textMuted, marginTop: 4 },

  /* Attendance Stats */
  attendanceStats: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  attendanceStat: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  attendanceStatValue: {
    fontSize: 20,
    fontWeight: "800",
    fontFamily: Platform.OS === "ios" ? "Sora" : "sans-serif",
  },
  attendanceStatLabel: { fontSize: 11, fontWeight: "700", marginTop: 2 },

  /* Attendance List */
  attendanceList: { gap: 0 },
  attendanceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  attendanceItemLeft: { gap: 4 },
  attendanceItemDate: { fontSize: 13, fontWeight: "600", color: C.textPrimary },
  attendanceItemTimes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  attendanceItemTime: { fontSize: 12, color: C.textSecondary },
  attendanceItemTimeSep: { fontSize: 12, color: C.textMuted },
  attendanceItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  attendanceItemHours: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textPrimary,
  },

  /* Doc List */
  docList: { gap: 0 },
  docItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  docIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  docInfo: { flex: 1 },
  docTitle: { fontSize: 14, fontWeight: "600", color: C.textPrimary },
  docDate: { fontSize: 11, color: C.textMuted, marginTop: 2 },

  /* Audit List */
  auditList: { gap: 0 },
  auditItem: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  auditAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
    marginTop: 2,
  },
  auditAvatarText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  auditContent: { flex: 1, gap: 2 },
  auditEvent: { fontSize: 14, fontWeight: "700", color: C.textPrimary },
  auditNotes: { fontSize: 12, color: C.textSecondary, fontStyle: "italic" },
  auditMeta: { fontSize: 11, color: C.textMuted, marginTop: 2 },

  /* Avatar */
  avatarWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "800" },

  /* Chip */
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontSize: 10, fontWeight: "700" },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalSheet: {
    width: "100%",
    borderRadius: 24,
    backgroundColor: C.surface,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: C.textPrimary,
    marginBottom: 8,
  },
  modalMsg: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  modalActions: { flexDirection: "row", gap: 10, width: "100%" },
  modalBtnSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  modalBtnSecondaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.textSecondary,
  },
  modalBtnDanger: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.danger,
  },
  modalBtnDangerText: { fontSize: 14, fontWeight: "800", color: "#fff" },

  /* Toast */
  toast: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.navy,
    zIndex: 50,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  toastText: { flex: 1, fontSize: 13, color: "#fff", fontWeight: "600" },

  scrollContent: { paddingBottom: 24 },
});