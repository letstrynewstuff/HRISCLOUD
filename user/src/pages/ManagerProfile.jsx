

// src/pages/ManagerProfile.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../components/useAuth";
import {
  getMyProfile,
  requestProfileChange,
} from "../api/service/employeeApi";
import { documentApi } from "../api/service/documentApi";
import { leaveApi } from "../api/service/leaveApi";
import { authApi } from "../api/service/authApi";
import C from "../styles/colors";
import {
  ChevronRight,
  Award,
  AlertCircle,
  Menu,
  User,
  Briefcase,
  CreditCard,
  FileText,
  Shield,
  Plane,
  Key,
  Lock,
  Copy,
  Check,
  Edit3,
  Save,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  UserCheck,
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
const tabAnim = {
  hidden: { opacity: 0, x: 10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
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

const SectionCard = ({ children, style = {} }) => (
  <div
    style={{
      background: C.surface,
      borderRadius: 16,
      border: `1px solid ${C.border}`,
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
      ...style,
    }}
  >
    {children}
  </div>
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

const InfoRow = ({ label, value, masked = false, mono = false }) => {
  const [copied, setCopied] = useState(false);
  const display =
    masked && value ? value.replace(/(\d{4})\d+(\d{4})/, "$1••••$2") : value;
  return (
    <div
      style={{
        padding: "10px 0",
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: C.textMuted,
          fontWeight: 500,
          minWidth: 140,
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontSize: 13,
            color: value ? C.textPrimary : C.textMuted,
            fontFamily: mono ? "monospace" : "inherit",
            fontWeight: value ? 500 : 400,
          }}
        >
          {display || "—"}
        </span>
        {masked && value && (
          <Motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              navigator.clipboard?.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 2,
            }}
          >
            {copied ? (
              <Check size={12} color={C.success} />
            ) : (
              <Copy size={12} color={C.textMuted} />
            )}
          </Motion.button>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════ SUB-TABS ════════════════════════════

const PROFILE_SUBTABS = [
  { id: "personal", label: "Personal", icon: User },
  { id: "job", label: "Job", icon: Briefcase },
  { id: "payroll", label: "Payroll", icon: CreditCard },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "leave", label: "Leave", icon: Plane },
  { id: "security", label: "Security", icon: Shield },
];

function PersonalSubTab({ emp }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState(null);

  const editableFields = [
    { key: "phone", label: "Phone" },
    { key: "personalEmail", label: "Personal Email" },
    { key: "address", label: "Address" },
    { key: "nokName", label: "Next of Kin Name" },
    { key: "nokRelationship", label: "NOK Relationship" },
    { key: "nokPhone", label: "NOK Phone" },
  ];

  const handleSubmit = async () => {
    setSaving(true);
    setErr(null);
    try {
      await requestProfileChange(form);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setErr(e?.response?.data?.message ?? "Failed to submit change request.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Motion.div
      variants={tabAnim}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {saved && (
        <div
          style={{
            background: C.successLight,
            border: `1px solid ${C.success}33`,
            borderRadius: 12,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CheckCircle2 size={14} color={C.success} />
          <p style={{ fontSize: 13, color: C.success, fontWeight: 600 }}>
            Change request submitted. HR will review shortly.
          </p>
        </div>
      )}
      {err && (
        <div
          style={{
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
          <p style={{ fontSize: 13, color: C.danger }}>{err}</p>
        </div>
      )}

      <SectionCard>
        <SectionHeader
          icon={User}
          title="Personal Information"
          sub="Contact and identity details"
          action={
            <Motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setEditing(!editing);
                setForm({});
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: editing ? C.dangerLight : C.primaryLight,
                border: "none",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                color: editing ? C.danger : C.primary,
                cursor: "pointer",
              }}
            >
              {editing ? (
                <>
                  <X size={11} /> Cancel
                </>
              ) : (
                <>
                  <Edit3 size={11} /> Request Change
                </>
              )}
            </Motion.button>
          }
        />
        <div style={{ padding: "4px 20px 12px" }}>
          {[
            { label: "First Name", value: emp.first_name },
            { label: "Last Name", value: emp.last_name },
            {
              label: "Date of Birth",
              value: emp.date_of_birth
                ? new Date(emp.date_of_birth).toLocaleDateString()
                : null,
            },
            { label: "Gender", value: emp.gender },
            { label: "Nationality", value: emp.nationality },
            { label: "Marital Status", value: emp.marital_status },
            { label: "Personal Email", value: emp.personal_email },
            { label: "Phone", value: emp.phone },
            { label: "Address", value: emp.address },
          ].map(({ label, value }) => {
            const editable = editableFields.find((f) => f.label === label);
            return editing && editable ? (
              <div
                key={label}
                style={{
                  padding: "10px 0",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <p
                  style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}
                >
                  {label}
                </p>
                <input
                  defaultValue={value || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [editable.key]: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: `1.5px solid ${C.primary}66`,
                    background: C.surfaceAlt,
                    fontSize: 13,
                    outline: "none",
                    color: C.textPrimary,
                  }}
                />
              </div>
            ) : (
              <InfoRow key={label} label={label} value={value} />
            );
          })}
        </div>
        {editing && (
          <div
            style={{
              padding: "12px 20px",
              borderTop: `1px solid ${C.border}`,
              display: "flex",
              gap: 8,
            }}
          >
            <Motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setEditing(false)}
              style={{
                flex: 1,
                padding: "9px",
                borderRadius: 10,
                border: `1px solid ${C.border}`,
                background: C.surfaceAlt,
                fontSize: 12,
                fontWeight: 600,
                color: C.textSecondary,
                cursor: "pointer",
              }}
            >
              Cancel
            </Motion.button>
            <Motion.button
              whileHover={{ scale: 1.02 }}
              onClick={handleSubmit}
              disabled={saving}
              style={{
                flex: 2,
                padding: "9px",
                borderRadius: 10,
                border: "none",
                background: C.primary,
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={12} className="animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  <Save size={12} /> Submit Change Request
                </>
              )}
            </Motion.button>
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <SectionHeader
          icon={UserCheck}
          title="Next of Kin"
          color={C.accent}
          bg={C.accentLight}
        />
        <div style={{ padding: "4px 20px 12px" }}>
          <InfoRow label="Name" value={emp.nok_name} />
          <InfoRow label="Relationship" value={emp.nok_relationship} />
          <InfoRow label="Phone" value={emp.nok_phone} />
          <InfoRow label="Address" value={emp.nok_address} />
        </div>
      </SectionCard>
    </Motion.div>
  );
}

function JobSubTab({ emp }) {
  return (
    <Motion.div variants={tabAnim} initial="hidden" animate="visible">
      <SectionCard>
        <SectionHeader
          icon={Briefcase}
          title="Employment Details"
          sub="Role, department, and employment info"
        />
        <div style={{ padding: "4px 20px 12px" }}>
          <InfoRow label="Employee Code" value={emp.employee_code} mono />
          <InfoRow label="Department" value={emp.department_name} />
          <InfoRow label="Job Role" value={emp.job_role_name} />
          <InfoRow label="Manager" value={emp.manager_name ?? emp.manager} />
          <InfoRow
            label="Employment Type"
            value={emp.employment_type?.replace("_", " ")}
          />
          <InfoRow
            label="Start Date"
            value={
              emp.start_date
                ? new Date(emp.start_date).toLocaleDateString()
                : null
            }
          />
          <InfoRow
            label="Confirmation"
            value={
              emp.confirmation_date
                ? new Date(emp.confirmation_date).toLocaleDateString()
                : null
            }
          />
          <InfoRow label="Location" value={emp.location} />
          <InfoRow label="Status" value={emp.employment_status} />
          <InfoRow label="Pay Grade" value={emp.pay_grade} />
        </div>
      </SectionCard>
    </Motion.div>
  );
}

function PayrollSubTab({ emp }) {
  return (
    <Motion.div variants={tabAnim} initial="hidden" animate="visible">
      <SectionCard>
        <SectionHeader
          icon={CreditCard}
          title="Bank & Payroll Details"
          sub="Salary and banking information"
          color={C.success}
          bg={C.successLight}
        />
        <div style={{ padding: "4px 20px 12px" }}>
          <InfoRow
            label="Basic Salary"
            value={
              emp.basic_salary
                ? `₦${Number(emp.basic_salary).toLocaleString()}`
                : null
            }
          />
          <InfoRow label="Pay Grade" value={emp.pay_grade} />
          <InfoRow label="Bank Name" value={emp.bank_name} />
          <InfoRow
            label="Account Number"
            value={emp.account_number}
            masked
            mono
          />
          <InfoRow label="Account Name" value={emp.account_name} />
          <InfoRow label="Pension PIN" value={emp.pension_pin} mono />
          <InfoRow label="Tax ID" value={emp.tax_id} mono />
        </div>
      </SectionCard>
    </Motion.div>
  );
}

function DocumentsSubTab() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    documentApi
      .getAll()
      .then((r) => setDocs(r.data ?? r.documents ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Motion.div variants={tabAnim} initial="hidden" animate="visible">
      <SectionCard>
        <SectionHeader
          icon={FileText}
          title="My Documents"
          sub="Signed and pending documents"
        />
        {loading ? (
          <div
            style={{
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} h={44} />
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: C.textMuted,
              fontSize: 13,
            }}
          >
            No documents found.
          </div>
        ) : (
          <div style={{ padding: "4px 20px 12px" }}>
            {docs.map((doc) => (
              <div
                key={doc.id}
                style={{
                  padding: "12px 0",
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
                      borderRadius: 8,
                      background: C.primaryLight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FileText size={14} color={C.primary} />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.textPrimary,
                      }}
                    >
                      {doc.title ?? doc.name}
                    </p>
                    <p style={{ fontSize: 11, color: C.textMuted }}>
                      {doc.status ?? "—"} ·{" "}
                      {doc.created_at
                        ? new Date(doc.created_at).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                </div>
                <Chip
                  label={doc.status === "signed" ? "Signed" : "Pending"}
                  color={doc.status === "signed" ? C.success : C.warning}
                  bg={doc.status === "signed" ? C.successLight : C.warningLight}
                  dot
                  size="xs"
                />
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </Motion.div>
  );
}

function LeaveSubTab() {
  const [balances, setBalances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      leaveApi.getMyBalances(),
      leaveApi.getMyRequests({ limit: 10 }),
    ])
      .then(([bal, req]) => {
        setBalances(bal.data ?? bal.balances ?? []);
        setRequests(req.data ?? req.requests ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Motion.div
      variants={tabAnim}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <SectionCard>
        <SectionHeader
          icon={Plane}
          title="Leave Balances"
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
              <Skeleton key={i} h={36} />
            ))}
          </div>
        ) : balances.length === 0 ? (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              color: C.textMuted,
              fontSize: 13,
            }}
          >
            No leave balances found.
          </div>
        ) : (
          <div style={{ padding: "4px 20px 12px" }}>
            {balances.map((b) => (
              <div
                key={b.id}
                style={{
                  padding: "10px 0",
                  borderBottom: `1px solid ${C.border}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.textPrimary,
                    }}
                  >
                    {b.leave_type ?? b.policy_name}
                  </p>
                  <p style={{ fontSize: 11, color: C.textMuted }}>
                    {b.entitled_days} days entitled
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: C.primary,
                      fontFamily: "Sora,sans-serif",
                    }}
                  >
                    {b.remaining_days ?? b.balance}
                  </p>
                  <p style={{ fontSize: 10, color: C.textMuted }}>days left</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <SectionHeader icon={Clock} title="Recent Leave Requests" />
        {loading ? (
          <div
            style={{
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {[1, 2].map((i) => (
              <Skeleton key={i} h={44} />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              color: C.textMuted,
              fontSize: 13,
            }}
          >
            No leave requests found.
          </div>
        ) : (
          <div style={{ padding: "4px 20px 12px" }}>
            {requests.map((r) => (
              <div
                key={r.id}
                style={{
                  padding: "10px 0",
                  borderBottom: `1px solid ${C.border}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.textPrimary,
                    }}
                  >
                    {r.leave_type ?? r.type}
                  </p>
                  <p style={{ fontSize: 11, color: C.textMuted }}>
                    {r.start_date
                      ? new Date(r.start_date).toLocaleDateString()
                      : ""}{" "}
                    —{" "}
                    {r.end_date
                      ? new Date(r.end_date).toLocaleDateString()
                      : ""}
                  </p>
                </div>
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
                  size="xs"
                />
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </Motion.div>
  );
}

function SecuritySubTab() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleChange = async () => {
    if (form.newPassword !== form.confirmPassword) {
      setMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (form.newPassword.length < 8) {
      setMsg({
        type: "error",
        text: "Password must be at least 8 characters.",
      });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setMsg({ type: "success", text: "Password changed successfully." });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      setMsg({
        type: "error",
        text: e?.response?.data?.message ?? "Password change failed.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Motion.div variants={tabAnim} initial="hidden" animate="visible">
      <SectionCard>
        <SectionHeader
          icon={Key}
          title="Change Password"
          color={C.warning}
          bg={C.warningLight}
        />
        <div style={{ padding: 20 }}>
          {msg && (
            <div
              style={{
                marginBottom: 16,
                padding: "10px 14px",
                borderRadius: 10,
                background:
                  msg.type === "success" ? C.successLight : C.dangerLight,
                border: `1px solid ${msg.type === "success" ? C.success : C.danger}33`,
                color: msg.type === "success" ? C.success : C.danger,
                fontSize: 13,
              }}
            >
              {msg.text}
            </div>
          )}
          {[
            { key: "currentPassword", label: "Current Password" },
            { key: "newPassword", label: "New Password" },
            { key: "confirmPassword", label: "Confirm New Password" },
          ].map(({ key, label }) => (
            <div key={key} style={{ marginBottom: 12 }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.textMuted,
                  marginBottom: 4,
                }}
              >
                {label}
              </p>
              <input
                type="password"
                value={form[key]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `1.5px solid ${C.border}`,
                  background: C.surfaceAlt,
                  fontSize: 13,
                  outline: "none",
                  color: C.textPrimary,
                }}
              />
            </div>
          ))}
          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleChange}
            disabled={saving}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: C.primary,
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Changing…
              </>
            ) : (
              <>
                <Lock size={13} /> Change Password
              </>
            )}
          </Motion.button>
        </div>
      </SectionCard>
    </Motion.div>
  );
}

// ── My Profile Tab ──
function MyProfileTab({ authEmployee }) {
  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("personal");

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyProfile();
      setEmp(res.data ?? res);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const initials = useMemo(() => {
    if (!emp) return authEmployee?.initials ?? "?";
    return (
      `${emp.first_name?.[0] ?? ""}${emp.last_name?.[0] ?? ""}`.toUpperCase() ||
      "?"
    );
  }, [emp, authEmployee]);

  const completionScore = emp
    ? [emp.phone, emp.address, emp.nok_name, emp.bank_name, emp.avatar].filter(
        Boolean,
      ).length * 20
    : 0;

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {error && (
        <div
          style={{
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
          <p style={{ fontSize: 13, color: C.danger, flex: 1 }}>{error}</p>
          <button
            onClick={fetchProfile}
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

      {/* Profile Hero Card */}
      {loading ? (
        <Skeleton h={160} />
      ) : (
        emp && (
          <Motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <SectionCard>
              <div
                style={{
                  background: `linear-gradient(135deg,${C.navy ?? "#1E1B4B"},${C.primary})`,
                  padding: "24px 24px 0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <AvatarEl
                      initials={initials}
                      avatar={emp.avatar}
                      size={72}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: -6,
                        right: -6,
                        background: "#F59E0B",
                        borderRadius: 6,
                        padding: "2px 7px",
                        fontSize: 8,
                        fontWeight: 800,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <Award size={8} /> MGR
                    </div>
                  </div>
                  <div style={{ paddingBottom: 16, flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <h2
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          color: "#fff",
                          fontFamily: "Sora,sans-serif",
                        }}
                      >
                        {emp.first_name} {emp.last_name}
                      </h2>
                      <Chip
                        label="Manager"
                        color="#F59E0B"
                        bg="rgba(245,158,11,0.18)"
                      />
                      <StatusBadge status={emp.employment_status} />
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.7)",
                        marginTop: 2,
                      }}
                    >
                      {emp.job_role_name} · {emp.department_name}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.45)",
                        marginTop: 2,
                        fontFamily: "monospace",
                      }}
                    >
                      {emp.employee_code}
                    </p>
                  </div>
                </div>
              </div>
              {/* Profile completion bar */}
              <div style={{ padding: "12px 24px", background: C.surfaceAlt }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 11, color: C.textMuted }}>
                    Profile completion
                  </span>
                  <span
                    style={{ fontSize: 11, fontWeight: 700, color: C.primary }}
                  >
                    {completionScore}%
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    borderRadius: 99,
                    background: C.border,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${completionScore}%`,
                      height: "100%",
                      background: `linear-gradient(90deg,${C.primary},${C.accent})`,
                      borderRadius: 99,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>
            </SectionCard>
          </Motion.div>
        )
      )}

      {/* Sub-tab bar */}
      {!loading && emp && (
        <Motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          style={{
            display: "flex",
            gap: 4,
            background: C.surface,
            padding: 4,
            borderRadius: 14,
            border: `1px solid ${C.border}`,
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {PROFILE_SUBTABS.map(({ id, label, icon: Icon }) => {
            const active = activeSubTab === id;
            return (
              <Motion.button
                key={id}
                whileHover={{ scale: active ? 1 : 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveSubTab(id)}
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
                  boxShadow: active ? "0 2px 8px rgba(79,70,229,0.25)" : "none",
                  transition: "all 0.18s",
                }}
              >
                <Icon size={12} /> {label}
              </Motion.button>
            );
          })}
        </Motion.div>
      )}

      {/* Sub-tab panels */}
      {!loading && emp && (
        <AnimatePresence mode="wait">
          <div key={activeSubTab}>
            {activeSubTab === "personal" && <PersonalSubTab emp={emp} />}
            {activeSubTab === "job" && <JobSubTab emp={emp} />}
            {activeSubTab === "payroll" && <PayrollSubTab emp={emp} />}
            {activeSubTab === "documents" && <DocumentsSubTab />}
            {activeSubTab === "leave" && <LeaveSubTab />}
            {activeSubTab === "security" && <SecuritySubTab />}
          </div>
        </AnimatePresence>
      )}
    </Motion.div>
  );
}

// ════════════════════════════ MAIN COMPONENT ════════════════════════════
export default function ManagerProfile() {
  const { employee: authEmployee } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const manager = authEmployee;
  const initials = manager?.initials ?? "?";

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        background: C.bg,
        color: C.textPrimary,
        fontFamily: "'DM Sans','Sora',sans-serif",
      }}
    >
      <style>{`@keyframes mgr-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* ── TOP NAV ── */}
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
              <span>Home</span>
              <ChevronRight size={11} />
              <span className="font-bold" style={{ color: C.textPrimary }}>
                My Profile
              </span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <AvatarEl
                initials={initials}
                avatar={manager?.avatar}
                size={32}
              />
            </div>
          </header>

          {/* ── SCROLLABLE MAIN ── */}
          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
            <MyProfileTab authEmployee={authEmployee} />
            <div style={{ height: 28 }} />
          </main>
        </div>
      </div>
    </div>
  );
}