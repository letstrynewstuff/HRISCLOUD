

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Switch,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Save,
  X,
  Check,
  AlertCircle,
  User,
  Briefcase,
  CreditCard,
  Phone,
  Shield,
  History,
  Building2,
  Hash,
  Calendar,
  Mail,
  Lock,
  Unlock,
  Award,
  ChevronRight,
} from "lucide-react-native";

import C from "../../../styles/colors";
import {
  getEmployeeById,
  updateEmployee,
  getEmployeeHistory,
  getEmployees,
} from "../../../api/service/employeeApi";
import { departmentApi } from "../../../api/service/departmentApi";
import { listJobRoles } from "../../../api/service/jobRoleApi";
import { Loader } from "../../../hooks/loaderManager";

/* ─── Types ─────────────────────────────────────────────────── */
interface Props {
  employeeId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const TABS = [
  { id: "personal", label: "Personal", icon: User },
  { id: "job", label: "Job", icon: Briefcase },
  { id: "bank", label: "Bank", icon: CreditCard },
  { id: "emergency", label: "Emergency", icon: Phone },
  { id: "access", label: "Access", icon: Shield },
] as const;

const EMP_TYPES = [
  { label: "Full-Time", value: "full_time" },
  { label: "Part-Time", value: "part_time" },
  { label: "Contract", value: "contract" },
  { label: "Intern", value: "intern" },
];
const STATUSES = [
  { label: "Active", value: "active" },
  { label: "On Leave", value: "on_leave" },
  { label: "Suspended", value: "suspended" },
  { label: "Terminated", value: "terminated" },
  { label: "Resigned", value: "resigned" },
];
const GENDERS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];
const MARITAL = [
  { label: "Single", value: "single" },
  { label: "Married", value: "married" },
  { label: "Divorced", value: "divorced" },
  { label: "Widowed", value: "widowed" },
];
const BANKS = [
  "Access Bank",
  "GTBank",
  "Zenith Bank",
  "First Bank",
  "UBA",
  "Stanbic IBTC",
  "FCMB",
  "Fidelity Bank",
  "Polaris Bank",
  "Wema Bank",
];
const LOCATIONS = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ibadan",
  "Kano",
  "Enugu",
  "Remote",
];

/* ─── Helpers ───────────────────────────────────────────────── */
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
    <View style={[s.sectionCard, { borderColor: C.border }]}>
      <View style={[s.sectionHeader, { borderColor: C.border }]}>
        <View style={[s.sectionIcon, { backgroundColor: bg }]}>
          <Icon size={15} color={color} />
        </View>
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      <View style={s.sectionBody}>{children}</View>
    </View>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>
        {label}
        {required && <Text style={{ color: C.danger }}> *</Text>}
      </Text>
      {children}
      {error ? (
        <View style={s.fieldErr}>
          <AlertCircle size={10} color={C.danger} />
          <Text style={s.fieldErrText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

function Toggle({
  on,
  onToggle,
  label,
  sub,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
  sub?: string;
}) {
  return (
    <View style={[s.toggleRow, { borderColor: C.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={s.toggleLabel}>{label}</Text>
        {sub ? <Text style={s.toggleSub}>{sub}</Text> : null}
      </View>
      <Switch
        value={on}
        onValueChange={onToggle}
        trackColor={{ false: C.border, true: C.success }}
        thumbColor="#fff"
      />
    </View>
  );
}

/* ═══════════════════ MAIN ═══════════════════ */
export default function EditEmployeeView({
  employeeId,
  onClose,
  onSuccess,
}: Props) {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<string>("personal");
  const [emp, setEmp] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [originalForm, setOriginalForm] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [audit, setAudit] = useState<any[]>([]);

  const [departments, setDepartments] = useState<any[]>([]);
  const [jobRoles, setJobRoles] = useState<any[]>([]);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);

  const showToast = useCallback(
    (msg: string, type: "success" | "error" = "success") => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 4000);
    },
    [],
  );

  const flatten = (e: any) => ({
    firstName: e.first_name ?? "",
    lastName: e.last_name ?? "",
    middleName: e.middle_name ?? "",
    personalEmail: e.personal_email ?? "",
    phone: e.phone ?? "",
    gender: e.gender ?? "",
    dateOfBirth: e.date_of_birth ? e.date_of_birth.split("T")[0] : "",
    maritalStatus: e.marital_status ?? "",
    nationality: e.nationality ?? "Nigerian",
    address: e.address ?? "",
    state: e.state ?? "",
    departmentId: e.department_id ?? "",
    jobRoleId: e.job_role_id ?? "",
    managerId: e.manager_id ?? "",
    employmentType: e.employment_type ?? "",
    employmentStatus: e.employment_status ?? "",
    startDate: e.start_date ? e.start_date.split("T")[0] : "",
    confirmationDate: e.confirmation_date
      ? e.confirmation_date.split("T")[0]
      : "",
    location: e.location ?? "",
    payGrade: e.pay_grade ?? "",
    basicSalary: e.basic_salary ? String(e.basic_salary) : "",
    housingAllowance: e.housing_allowance ? String(e.housing_allowance) : "",
    transportAllowance: e.transport_allowance
      ? String(e.transport_allowance)
      : "",
    medicalAllowance: e.medical_allowance ? String(e.medical_allowance) : "",
    otherAllowances: e.other_allowances ? String(e.other_allowances) : "",
    bankName: e.bank_name ?? "",
    accountNumber: e.account_number ?? "",
    accountName: e.account_name ?? "",
    pensionPin: e.pension_pin ?? "",
    taxId: e.tax_id ?? "",
    nokName: e.nok_name ?? "",
    nokRelationship: e.nok_relationship ?? "",
    nokPhone: e.nok_phone ?? "",
    nokAddress: e.nok_address ?? "",
    isManager: e.role === "manager" || e.employment_role === "manager",
    isActive: e.employment_status === "active",
    bio: e.bio ?? "",
  });

  // const load = useCallback(async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const [empRes, auditRes, deptsRes, rolesRes, empsRes] = await Promise.all(
  //       [
  //         getEmployeeById(employeeId),
  //         getEmployeeHistory(employeeId).catch(() => ({ data: [] })),
  //         departmentApi.list().catch(() => ({ departments: [] })),
  //         listJobRoles().catch(() => ({ roles: [] })),
  //         getEmployees({ limit: 200 }).catch(() => ({ data: [] })),
  //       ],
  //     );
  //     const e = empRes.data ?? empRes;
  //     setEmp(e);
  //     const f = flatten(e);
  //     setForm(f);
  //     setOriginalForm(f);
  //     setAudit(auditRes.data ?? auditRes.rows ?? []);
  //     setDepartments(deptsRes.departments ?? deptsRes.data ?? []);
  //     setJobRoles(rolesRes.roles ?? rolesRes.data ?? []);
  //     setAllEmployees(
  //       (empsRes.data ?? []).filter((x: any) => x.id !== employeeId),
  //     );
  //   } catch (e: any) {
  //     setError(e?.response?.data?.message ?? "Failed to load employee.");
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [employeeId]);
const load = useCallback(async () => {
  setLoading(true);
  setError(null);
  Loader.show();
  try {
    const [empRes, auditRes, deptsRes, rolesRes, empsRes] = await Promise.all([
      getEmployeeById(employeeId),
      getEmployeeHistory(employeeId).catch(() => ({ data: [] })),
      departmentApi.list().catch(() => ({ departments: [] })),
      listJobRoles().catch(() => ({ roles: [] })),
      getEmployees({ limit: 200 }).catch(() => ({ data: [] })),
    ]);
    const e = empRes.data ?? empRes;
    setEmp(e);
    const f = flatten(e);
    setForm(f);
    setOriginalForm(f);
    setAudit(auditRes.data ?? auditRes.rows ?? []);
    setDepartments(deptsRes.departments ?? deptsRes.data ?? []);
    setJobRoles(rolesRes.roles ?? rolesRes.data ?? []);
    setAllEmployees(
      (empsRes.data ?? []).filter((x: any) => x.id !== employeeId),
    );
  } catch (e: any) {
    setError(e?.response?.data?.message ?? "Failed to load employee.");
  } finally {
    setLoading(false);
    Loader.hide();
  }
}, [employeeId]);
  useEffect(() => {
    load();
  }, [load]);

  const set = (key: string, val: any) => setForm((f) => ({ ...f, [key]: val }));

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(originalForm),
    [form, originalForm],
  );
  const dirtyFields = useMemo(
    () => Object.keys(form).filter((k) => form[k] !== originalForm[k]),
    [form, originalForm],
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName?.trim()) e.firstName = "Required";
    if (!form.lastName?.trim()) e.lastName = "Required";
    if (!form.employmentType) e.employmentType = "Required";
    if (!form.employmentStatus) e.employmentStatus = "Required";
    if (form.accountNumber && !/^\d{10}$/.test(form.accountNumber))
      e.accountNumber = "Must be 10 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setShowConfirm(true);
  };

  // const confirmSave = async () => {
  //   setShowConfirm(false);
  //   setSaving(true);
  //   try {
  //     const payload = {
  //       firstName: form.firstName,
  //       lastName: form.lastName,
  //       middleName: form.middleName || undefined,
  //       personalEmail: form.personalEmail || undefined,
  //       phone: form.phone || undefined,
  //       gender: form.gender || undefined,
  //       dateOfBirth: form.dateOfBirth || undefined,
  //       maritalStatus: form.maritalStatus || undefined,
  //       nationality: form.nationality || undefined,
  //       address: form.address || undefined,
  //       state: form.state || undefined,
  //       departmentId: form.departmentId || undefined,
  //       jobRoleId: form.jobRoleId || undefined,
  //       managerId: form.managerId || undefined,
  //       employmentType: form.employmentType,
  //       employmentStatus: form.employmentStatus,
  //       startDate: form.startDate || undefined,
  //       confirmationDate: form.confirmationDate || undefined,
  //       location: form.location || undefined,
  //       payGrade: form.payGrade || undefined,
  //       basicSalary: form.basicSalary ? Number(form.basicSalary) : undefined,
  //       housingAllowance: form.housingAllowance
  //         ? Number(form.housingAllowance)
  //         : undefined,
  //       transportAllowance: form.transportAllowance
  //         ? Number(form.transportAllowance)
  //         : undefined,
  //       medicalAllowance: form.medicalAllowance
  //         ? Number(form.medicalAllowance)
  //         : undefined,
  //       otherAllowances: form.otherAllowances
  //         ? Number(form.otherAllowances)
  //         : undefined,
  //       bankName: form.bankName || undefined,
  //       accountNumber: form.accountNumber || undefined,
  //       accountName: form.accountName || undefined,
  //       pensionPin: form.pensionPin || undefined,
  //       taxId: form.taxId || undefined,
  //       nokName: form.nokName || undefined,
  //       nokRelationship: form.nokRelationship || undefined,
  //       nokPhone: form.nokPhone || undefined,
  //       nokAddress: form.nokAddress || undefined,
  //       bio: form.bio || undefined,
  //       role: form.isManager ? "manager" : "employee",
  //       notes: dirtyFields.join(", "),
  //     };
  //     await updateEmployee(employeeId, payload);
  //     const refreshed = await getEmployeeById(employeeId);
  //     const e = refreshed.data ?? refreshed;
  //     setEmp(e);
  //     const f = flatten(e);
  //     setForm(f);
  //     setOriginalForm(f);
  //     showToast("Employee profile updated successfully.");
  //     onSuccess?.();
  //   } catch (e: any) {
  //     showToast(e?.response?.data?.message ?? "Save failed.", "error");
  //   } finally {
  //     setSaving(false);
  //   }
  // };
const confirmSave = async () => {
  setShowConfirm(false);
  setSaving(true);
  Loader.show();
  try {
        const payload = {
          firstName: form.firstName,
          lastName: form.lastName,
          middleName: form.middleName || undefined,
          personalEmail: form.personalEmail || undefined,
          phone: form.phone || undefined,
          gender: form.gender || undefined,
          dateOfBirth: form.dateOfBirth || undefined,
          maritalStatus: form.maritalStatus || undefined,
          nationality: form.nationality || undefined,
          address: form.address || undefined,
          state: form.state || undefined,
          departmentId: form.departmentId || undefined,
          jobRoleId: form.jobRoleId || undefined,
          managerId: form.managerId || undefined,
          employmentType: form.employmentType,
          employmentStatus: form.employmentStatus,
          startDate: form.startDate || undefined,
          confirmationDate: form.confirmationDate || undefined,
          location: form.location || undefined,
          payGrade: form.payGrade || undefined,
          basicSalary: form.basicSalary ? Number(form.basicSalary) : undefined,
          housingAllowance: form.housingAllowance
            ? Number(form.housingAllowance)
            : undefined,
          transportAllowance: form.transportAllowance
            ? Number(form.transportAllowance)
            : undefined,
          medicalAllowance: form.medicalAllowance
            ? Number(form.medicalAllowance)
            : undefined,
          otherAllowances: form.otherAllowances
            ? Number(form.otherAllowances)
            : undefined,
          bankName: form.bankName || undefined,
          accountNumber: form.accountNumber || undefined,
          accountName: form.accountName || undefined,
          pensionPin: form.pensionPin || undefined,
          taxId: form.taxId || undefined,
          nokName: form.nokName || undefined,
          nokRelationship: form.nokRelationship || undefined,
          nokPhone: form.nokPhone || undefined,
          nokAddress: form.nokAddress || undefined,
          bio: form.bio || undefined,
          role: form.isManager ? "manager" : "employee",
          notes: dirtyFields.join(", "),
        };
    
    await updateEmployee(employeeId, payload);
    const refreshed = await getEmployeeById(employeeId);
    const e = refreshed.data ?? refreshed;
    setEmp(e);
    const f = flatten(e);
    setForm(f);
    setOriginalForm(f);
    showToast("Employee profile updated successfully.");
    onSuccess?.();
  } catch (e: any) {
    showToast(e?.response?.data?.message ?? "Save failed.", "error");
  } finally {
    setSaving(false);
    Loader.hide();
  }
};
  const filteredRoles = useMemo(
    () =>
      form.departmentId
        ? jobRoles.filter(
            (r) => r.departmentId === form.departmentId || !r.departmentId,
          )
        : jobRoles,
    [jobRoles, form.departmentId],
  );

  const name = emp
    ? `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim()
    : "Employee";

  /* ── Render tabs ────────────────────────────────────────── */
  const renderTab = () => {
    switch (activeTab) {
      case "personal":
        return (
          <View style={s.tabContent}>
            <SectionCard icon={User} title="Personal Information">
              <Field label="First Name" required error={errors.firstName}>
                <TextInput
                  value={form.firstName}
                  onChangeText={(t) => set("firstName", t)}
                  style={[s.input, errors.firstName && s.inputErr]}
                  placeholderTextColor={C.textMuted}
                />
              </Field>
              <Field label="Middle Name">
                <TextInput
                  value={form.middleName}
                  onChangeText={(t) => set("middleName", t)}
                  style={s.input}
                  placeholderTextColor={C.textMuted}
                />
              </Field>
              <Field label="Last Name" required error={errors.lastName}>
                <TextInput
                  value={form.lastName}
                  onChangeText={(t) => set("lastName", t)}
                  style={[s.input, errors.lastName && s.inputErr]}
                  placeholderTextColor={C.textMuted}
                />
              </Field>
              <Field label="Date of Birth">
                <TextInput
                  value={form.dateOfBirth}
                  onChangeText={(t) => set("dateOfBirth", t)}
                  style={s.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={C.textMuted}
                />
              </Field>
              <Field label="Gender">
                <View style={[s.selectRow, { borderColor: C.border }]}>
                  {GENDERS.map((g) => (
                    <Pressable
                      key={g.value}
                      onPress={() => set("gender", g.value)}
                      style={[
                        s.selectChip,
                        form.gender === g.value && {
                          backgroundColor: C.primaryLight,
                          borderColor: C.primary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          s.selectChipText,
                          form.gender === g.value && {
                            color: C.primary,
                            fontWeight: "700",
                          },
                        ]}
                      >
                        {g.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Field>
              <Field label="Marital Status">
                <View style={[s.selectRow, { borderColor: C.border }]}>
                  {MARITAL.map((m) => (
                    <Pressable
                      key={m.value}
                      onPress={() => set("maritalStatus", m.value)}
                      style={[
                        s.selectChip,
                        form.maritalStatus === m.value && {
                          backgroundColor: C.primaryLight,
                          borderColor: C.primary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          s.selectChipText,
                          form.maritalStatus === m.value && {
                            color: C.primary,
                            fontWeight: "700",
                          },
                        ]}
                      >
                        {m.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Field>
              <Field label="Nationality">
                <TextInput
                  value={form.nationality}
                  onChangeText={(t) => set("nationality", t)}
                  style={s.input}
                  placeholderTextColor={C.textMuted}
                />
              </Field>
              <Field label="Personal Email">
                <TextInput
                  value={form.personalEmail}
                  onChangeText={(t) => set("personalEmail", t)}
                  style={s.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={C.textMuted}
                />
              </Field>
              <Field label="Phone">
                <TextInput
                  value={form.phone}
                  onChangeText={(t) => set("phone", t)}
                  style={s.input}
                  keyboardType="phone-pad"
                  placeholderTextColor={C.textMuted}
                />
              </Field>
              <Field label="Location">
                <View
                  style={[
                    s.selectRow,
                    { borderColor: C.border, flexWrap: "wrap" },
                  ]}
                >
                  {LOCATIONS.map((loc) => (
                    <Pressable
                      key={loc}
                      onPress={() => set("location", loc)}
                      style={[
                        s.selectChip,
                        form.location === loc && {
                          backgroundColor: C.primaryLight,
                          borderColor: C.primary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          s.selectChipText,
                          form.location === loc && {
                            color: C.primary,
                            fontWeight: "700",
                          },
                        ]}
                      >
                        {loc}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Field>
              <Field label="Residential Address">
                <TextInput
                  value={form.address}
                  onChangeText={(t) => set("address", t)}
                  style={[s.input, s.textarea]}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor={C.textMuted}
                />
              </Field>
              <Field label="Bio">
                <TextInput
                  value={form.bio}
                  onChangeText={(t) => set("bio", t)}
                  style={[s.input, s.textarea]}
                  multiline
                  numberOfLines={3}
                  placeholder="Brief bio…"
                  placeholderTextColor={C.textMuted}
                />
              </Field>
            </SectionCard>
          </View>
        );

      case "job":
        return (
          <View style={s.tabContent}>
            <SectionCard
              icon={Briefcase}
              title="Job Details"
              color={C.accent}
              bg={C.accentLight}
            >
              <Field label="Department">
                <View
                  style={[
                    s.selectRow,
                    { borderColor: C.border, flexWrap: "wrap" },
                  ]}
                >
                  {departments.map((d: any) => (
                    <Pressable
                      key={d.id}
                      onPress={() => {
                        set("departmentId", d.id);
                        set("jobRoleId", "");
                      }}
                      style={[
                        s.selectChip,
                        form.departmentId === d.id && {
                          backgroundColor: C.primaryLight,
                          borderColor: C.primary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          s.selectChipText,
                          form.departmentId === d.id && {
                            color: C.primary,
                            fontWeight: "700",
                          },
                        ]}
                      >
                        {d.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Field>
              <Field label="Job Role">
                <View
                  style={[
                    s.selectRow,
                    { borderColor: C.border, flexWrap: "wrap" },
                  ]}
                >
                  {filteredRoles.length === 0 ? (
                    <Text style={{ fontSize: 12, color: C.textMuted }}>
                      Select a department first
                    </Text>
                  ) : (
                    filteredRoles.map((r: any) => (
                      <Pressable
                        key={r.id}
                        onPress={() => set("jobRoleId", r.id)}
                        style={[
                          s.selectChip,
                          form.jobRoleId === r.id && {
                            backgroundColor: C.primaryLight,
                            borderColor: C.primary,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            s.selectChipText,
                            form.jobRoleId === r.id && {
                              color: C.primary,
                              fontWeight: "700",
                            },
                          ]}
                        >
                          {r.title || r.name}
                        </Text>
                      </Pressable>
                    ))
                  )}
                </View>
              </Field>
              <Field label="Line Manager">
                <View
                  style={[
                    s.selectRow,
                    { borderColor: C.border, flexWrap: "wrap" },
                  ]}
                >
                  <Pressable
                    onPress={() => set("managerId", "")}
                    style={[
                      s.selectChip,
                      !form.managerId && {
                        backgroundColor: C.primaryLight,
                        borderColor: C.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        s.selectChipText,
                        !form.managerId && {
                          color: C.primary,
                          fontWeight: "700",
                        },
                      ]}
                    >
                      None (Top Level)
                    </Text>
                  </Pressable>
                  {allEmployees.map((e: any) => (
                    <Pressable
                      key={e.id}
                      onPress={() => set("managerId", e.id)}
                      style={[
                        s.selectChip,
                        form.managerId === e.id && {
                          backgroundColor: C.primaryLight,
                          borderColor: C.primary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          s.selectChipText,
                          form.managerId === e.id && {
                            color: C.primary,
                            fontWeight: "700",
                          },
                        ]}
                      >
                        {e.first_name} {e.last_name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Field>
              <Field
                label="Employment Type"
                required
                error={errors.employmentType}
              >
                <View
                  style={[
                    s.selectRow,
                    { borderColor: C.border, flexWrap: "wrap" },
                  ]}
                >
                  {EMP_TYPES.map((t) => (
                    <Pressable
                      key={t.value}
                      onPress={() => set("employmentType", t.value)}
                      style={[
                        s.selectChip,
                        form.employmentType === t.value && {
                          backgroundColor: C.primaryLight,
                          borderColor: C.primary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          s.selectChipText,
                          form.employmentType === t.value && {
                            color: C.primary,
                            fontWeight: "700",
                          },
                        ]}
                      >
                        {t.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Field>
              <Field label="Start Date">
                <TextInput
                  value={form.startDate}
                  onChangeText={(t) => set("startDate", t)}
                  style={s.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={C.textMuted}
                />
              </Field>
              <Field label="Confirmation Date">
                <TextInput
                  value={form.confirmationDate}
                  onChangeText={(t) => set("confirmationDate", t)}
                  style={s.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={C.textMuted}
                />
              </Field>
              <Field label="Pay Grade">
                <TextInput
                  value={form.payGrade}
                  onChangeText={(t) => set("payGrade", t)}
                  style={s.input}
                  placeholder="e.g. Grade 4 – Senior"
                  placeholderTextColor={C.textMuted}
                />
              </Field>
            </SectionCard>

            {form.departmentId !== originalForm.departmentId && (
              <View
                style={[
                  s.noticeBox,
                  {
                    backgroundColor: C.warningLight,
                    borderColor: C.warning + "33",
                  },
                ]}
              >
                <Building2 size={16} color={C.warning} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.noticeTitle, { color: C.warning }]}>
                    Department Transfer
                  </Text>
                  <Text style={s.noticeText}>
                    This will log a department_change event in the employee's
                    history.
                  </Text>
                </View>
              </View>
            )}
          </View>
        );

      case "bank":
        return (
          <View style={s.tabContent}>
            <SectionCard
              icon={CreditCard}
              title="Compensation"
              color={C.success}
              bg={C.successLight}
            >
              <Field label="Basic Salary (₦)">
                <TextInput
                  value={form.basicSalary}
                  onChangeText={(t) =>
                    set("basicSalary", t.replace(/[^0-9]/g, ""))
                  }
                  style={s.input}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={C.textMuted}
                />
              </Field>
              <Field label="Housing Allowance (₦)">
                <TextInput
                  value={form.housingAllowance}
                  onChangeText={(t) =>
                    set("housingAllowance", t.replace(/[^0-9]/g, ""))
                  }
                  style={s.input}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={C.textMuted}
                />
              </Field>
              <Field label="Transport Allowance (₦)">
                <TextInput
                  value={form.transportAllowance}
                  onChangeText={(t) =>
                    set("transportAllowance", t.replace(/[^0-9]/g, ""))
                  }
                  style={s.input}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={C.textMuted}
                />
              </Field>
              <Field label="Medical Allowance (₦)">
                <TextInput
                  value={form.medicalAllowance}
                  onChangeText={(t) =>
                    set("medicalAllowance", t.replace(/[^0-9]/g, ""))
                  }
                  style={s.input}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={C.textMuted}
                />
              </Field>
            </SectionCard>

            <SectionCard
              icon={Hash}
              title="Bank Details"
              color={C.warning}
              bg={C.warningLight}
            >
              <Field label="Bank Name">
                <View
                  style={[
                    s.selectRow,
                    { borderColor: C.border, flexWrap: "wrap" },
                  ]}
                >
                  {BANKS.map((b) => (
                    <Pressable
                      key={b}
                      onPress={() => set("bankName", b)}
                      style={[
                        s.selectChip,
                        form.bankName === b && {
                          backgroundColor: C.primaryLight,
                          borderColor: C.primary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          s.selectChipText,
                          form.bankName === b && {
                            color: C.primary,
                            fontWeight: "700",
                          },
                        ]}
                      >
                        {b}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Field>
              <Field label="Account Name">
                <TextInput
                  value={form.accountName}
                  onChangeText={(t) => set("accountName", t)}
                  style={s.input}
                  placeholderTextColor={C.textMuted}
                />
              </Field>
              <Field
                label="Account Number (NUBAN)"
                error={errors.accountNumber}
              >
                <TextInput
                  value={form.accountNumber}
                  onChangeText={(t) =>
                    set("accountNumber", t.replace(/\D/g, "").slice(0, 10))
                  }
                  style={[s.input, errors.accountNumber && s.inputErr]}
                  keyboardType="numeric"
                  maxLength={10}
                  placeholder="0123456789"
                  placeholderTextColor={C.textMuted}
                />
              </Field>
              <Field label="Pension PIN">
                <TextInput
                  value={form.pensionPin}
                  onChangeText={(t) => set("pensionPin", t)}
                  style={s.input}
                  placeholderTextColor={C.textMuted}
                />
              </Field>
              <Field label="Tax ID">
                <TextInput
                  value={form.taxId}
                  onChangeText={(t) => set("taxId", t)}
                  style={s.input}
                  placeholderTextColor={C.textMuted}
                />
              </Field>
            </SectionCard>
          </View>
        );

      case "emergency":
        return (
          <View style={s.tabContent}>
            <SectionCard
              icon={Phone}
              title="Emergency Contact"
              color={C.danger}
              bg={C.dangerLight}
            >
              <Field label="Full Name">
                <TextInput
                  value={form.nokName}
                  onChangeText={(t) => set("nokName", t)}
                  style={s.input}
                  placeholderTextColor={C.textMuted}
                />
              </Field>
              <Field label="Relationship">
                <TextInput
                  value={form.nokRelationship}
                  onChangeText={(t) => set("nokRelationship", t)}
                  style={s.input}
                  placeholder="e.g. Spouse"
                  placeholderTextColor={C.textMuted}
                />
              </Field>
              <Field label="Phone">
                <TextInput
                  value={form.nokPhone}
                  onChangeText={(t) => set("nokPhone", t)}
                  style={s.input}
                  keyboardType="phone-pad"
                  placeholderTextColor={C.textMuted}
                />
              </Field>
              <Field label="Address">
                <TextInput
                  value={form.nokAddress}
                  onChangeText={(t) => set("nokAddress", t)}
                  style={[s.input, s.textarea]}
                  multiline
                  numberOfLines={2}
                  placeholderTextColor={C.textMuted}
                />
              </Field>
            </SectionCard>
          </View>
        );

      case "access":
        return (
          <View style={s.tabContent}>
            <SectionCard icon={Shield} title="System Access & Status">
              <Field
                label="Employment Status"
                required
                error={errors.employmentStatus}
              >
                <View
                  style={[
                    s.selectRow,
                    { borderColor: C.border, flexWrap: "wrap" },
                  ]}
                >
                  {STATUSES.map((st) => (
                    <Pressable
                      key={st.value}
                      onPress={() => set("employmentStatus", st.value)}
                      style={[
                        s.selectChip,
                        form.employmentStatus === st.value && {
                          backgroundColor: C.primaryLight,
                          borderColor: C.primary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          s.selectChipText,
                          form.employmentStatus === st.value && {
                            color: C.primary,
                            fontWeight: "700",
                          },
                        ]}
                      >
                        {st.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Field>
              {(form.employmentStatus === "terminated" ||
                form.employmentStatus === "suspended") && (
                <View
                  style={[
                    s.noticeBox,
                    {
                      backgroundColor: C.dangerLight,
                      borderColor: C.danger + "22",
                    },
                  ]}
                >
                  <Lock size={13} color={C.danger} />
                  <Text style={[s.noticeText, { color: C.danger }]}>
                    Setting status to {form.employmentStatus} will revoke system
                    access immediately.
                  </Text>
                </View>
              )}
            </SectionCard>

            <View style={[s.sectionCard, { borderColor: C.border }]}>
              <View style={[s.sectionHeader, { borderColor: C.border }]}>
                <View style={[s.sectionIcon, { backgroundColor: "#FEF3C7" }]}>
                  <Award size={15} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.sectionTitle}>Manager Assignment</Text>
                  <Text style={{ fontSize: 11, color: C.textMuted }}>
                    Grants team management access and the manager dashboard.
                  </Text>
                </View>
              </View>
              <View style={s.sectionBody}>
                <Toggle
                  on={form.isManager}
                  onToggle={() => set("isManager", !form.isManager)}
                  label="Assign as Manager / Line Manager"
                  sub={
                    form.isManager
                      ? `${name} will have manager role and can manage direct reports.`
                      : "Employee has standard access."
                  }
                />
                {form.isManager && !originalForm.isManager && (
                  <View
                    style={[
                      s.noticeBox,
                      {
                        backgroundColor: C.primaryLight,
                        borderColor: C.primary + "33",
                      },
                    ]}
                  >
                    <Text style={[s.noticeTitle, { color: C.primary }]}>
                      What happens when you save:
                    </Text>
                    {[
                      `${name}'s system role will be set to "manager"`,
                      "They will see the Manager Dashboard",
                      "They can view and manage their direct reports",
                      "They can approve leave requests from their team",
                    ].map((item, i) => (
                      <View
                        key={i}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                          marginTop: 6,
                        }}
                      >
                        <Check size={10} color={C.primary} />
                        <Text style={{ fontSize: 12, color: C.textSecondary }}>
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                {!form.isManager && originalForm.isManager && (
                  <View
                    style={[
                      s.noticeBox,
                      {
                        backgroundColor: C.warningLight,
                        borderColor: C.warning + "33",
                      },
                    ]}
                  >
                    <Text style={[s.noticeText, { color: C.warning }]}>
                      Saving will remove manager role. {name} will lose access
                      to the Manager Dashboard.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[s.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={onClose} style={s.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle} numberOfLines={1}>
            {loading ? "Loading…" : name}
          </Text>
          <Text style={s.headerSubtitle}>Edit Profile</Text>
        </View>
        <Pressable onPress={() => setShowAudit(true)} style={s.iconBtn}>
          <History size={16} color={C.textMuted} />
        </Pressable>
        <View style={s.headerAvatar}>
          <Text style={s.headerAvatarText}>
            {emp
              ? name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)
              : "??"}
          </Text>
        </View>
      </View>

      {/* Step Indicator */}
      <View style={s.stepIndicator}>
        {TABS.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          const currentIdx = TABS.findIndex((t) => t.id === activeTab);
          const isCompleted = currentIdx > idx;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={s.stepItem}
            >
              <View
                style={[
                  s.stepDot,
                  isActive && { backgroundColor: C.primary, width: 18 },
                  isCompleted && { backgroundColor: C.success },
                ]}
              />
              <Text
                style={[
                  s.stepLabel,
                  isActive && { color: C.primary, fontWeight: "700" },
                  isCompleted && { color: C.success },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {error && (
          <View
            style={[
              s.errorBanner,
              { backgroundColor: C.dangerLight, borderColor: C.danger + "33" },
            ]}
          >
            <AlertCircle size={16} color={C.danger} />
            <Text style={s.errorBannerText}>{error}</Text>
            <Pressable onPress={load}>
              <Text
                style={{ fontSize: 12, fontWeight: "700", color: C.danger }}
              >
                Retry
              </Text>
            </Pressable>
          </View>
        )}

        {loading ? (
          <View style={{ padding: 16, gap: 12 }}>
            {[100, 140, 100].map((h, i) => (
              <View
                key={i}
                style={[
                  s.skeleton,
                  { height: h, backgroundColor: C.surfaceAlt },
                ]}
              />
            ))}
          </View>
        ) : (
          renderTab()
        )}

        {!loading && (
          <View style={s.navRow}>
            <Pressable
              onPress={() => {
                const idx = TABS.findIndex((t) => t.id === activeTab);
                if (idx > 0) setActiveTab(TABS[idx - 1].id);
              }}
              disabled={activeTab === TABS[0].id}
              style={({ pressed }) => [
                s.backBtn,
                (activeTab === TABS[0].id || pressed) && {
                  opacity: activeTab === TABS[0].id ? 0.5 : 0.85,
                },
              ]}
            >
              <ChevronLeft size={16} color={C.textSecondary} />
              <Text style={s.backBtnText}>Back</Text>
            </Pressable>

            <View style={s.dotsRow}>
              {TABS.map((tab, idx) => {
                const isActive = activeTab === tab.id;
                const currentIdx = TABS.findIndex((t) => t.id === activeTab);
                const isCompleted = currentIdx > idx;
                return (
                  <View
                    key={tab.id}
                    style={[
                      s.dot,
                      isActive && { backgroundColor: C.primary, width: 18 },
                      isCompleted && { backgroundColor: C.success },
                    ]}
                  />
                );
              })}
            </View>

            {activeTab !== TABS[TABS.length - 1].id ? (
              <Pressable
                onPress={() => {
                  const idx = TABS.findIndex((t) => t.id === activeTab);
                  if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id);
                }}
                style={({ pressed }) => [
                  s.nextBtn,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={s.nextBtnText}>Next</Text>
                <ChevronRight size={16} color="#fff" />
              </Pressable>
            ) : (
              <Pressable
                onPress={handleSave}
                disabled={saving || !isDirty}
                style={({ pressed }) => [
                  s.submitBtn,
                  (saving || !isDirty || pressed) && {
                    opacity: saving || !isDirty ? 0.7 : 0.85,
                  },
                ]}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Save size={16} color="#fff" />
                    <Text style={s.submitBtnText}>Save</Text>
                  </>
                )}
              </Pressable>
            )}
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Confirm Modal */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, { borderColor: C.border }]}>
            <Text style={s.modalTitle}>Confirm Changes</Text>
            <Text style={s.modalDesc}>
              {dirtyFields.length} field{dirtyFields.length > 1 ? "s" : ""} will
              be updated for <Text style={{ fontWeight: "700" }}>{name}</Text>.
            </Text>
            {form.isManager !== originalForm.isManager && (
              <View style={[s.modalHint, { backgroundColor: C.primaryLight }]}>
                <Text
                  style={{ fontSize: 12, fontWeight: "700", color: C.primary }}
                >
                  {form.isManager
                    ? `✓ ${name} will be assigned Manager role`
                    : `✓ ${name}'s Manager role will be removed`}
                </Text>
              </View>
            )}
            {form.departmentId !== originalForm.departmentId && (
              <View style={[s.modalHint, { backgroundColor: C.warningLight }]}>
                <Text
                  style={{ fontSize: 12, fontWeight: "700", color: C.warning }}
                >
                  ✓ Department transfer will be logged
                </Text>
              </View>
            )}
            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <Pressable
                onPress={() => setShowConfirm(false)}
                style={[
                  s.modalBtn,
                  { backgroundColor: C.surfaceAlt, borderColor: C.border },
                ]}
              >
                <Text style={s.modalBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={confirmSave}
                style={[s.modalBtn, { backgroundColor: C.primary }]}
              >
                <Text style={[s.modalBtnText, { color: "#fff" }]}>
                  Save Changes
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Audit Trail Modal */}
      <Modal visible={showAudit} animationType="slide">
        <View style={[s.auditScreen, { paddingTop: insets.top }]}>
          <View style={[s.auditHeader, { borderColor: C.border }]}>
            <Pressable onPress={() => setShowAudit(false)} style={s.headerBack}>
              <ChevronLeft size={20} color={C.textSecondary} />
            </Pressable>
            <Text style={s.headerTitle}>Audit Trail</Text>
            <View style={{ width: 36 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
            {audit.length === 0 ? (
              <View style={s.emptyState}>
                <History size={28} color={C.textMuted} />
                <Text style={s.emptyDesc}>No audit history</Text>
              </View>
            ) : (
              audit.map((e: any, i: number) => (
                <View
                  key={e.id ?? i}
                  style={[s.auditRow, { borderColor: C.border }]}
                >
                  <View style={[s.auditAvatar, { backgroundColor: C.primary }]}>
                    <Text style={s.auditAvatarText}>
                      {(e.recorded_by_name ?? "?")[0]?.toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: C.textPrimary,
                      }}
                    >
                      {e.event_type ?? "Update"}
                    </Text>
                    {e.notes && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: C.textSecondary,
                          marginTop: 2,
                        }}
                      >
                        {e.notes}
                      </Text>
                    )}
                    <Text
                      style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}
                    >
                      {e.effective_date
                        ? new Date(e.effective_date).toLocaleDateString()
                        : ""}{" "}
                      · {e.recorded_by_name ?? "—"}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Toast */}
      {toast && (
        <View
          style={[
            s.toast,
            { backgroundColor: toast.type === "error" ? C.danger : C.navy },
          ]}
        >
          {toast.type === "error" ? (
            <AlertCircle size={15} color="#fff" />
          ) : (
            <Check size={15} color={C.success} />
          )}
          <Text style={s.toastText}>{toast.msg}</Text>
          <Pressable onPress={() => setToast(null)}>
            <X size={13} color="rgba(255,255,255,0.5)" />
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
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
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: C.textPrimary,
    flex: 1,
  },
  headerSubtitle: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
  },
  headerAvatarText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  stepItem: { alignItems: "center", gap: 6 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.border },
  stepLabel: { fontSize: 11, color: C.textMuted },

  scrollContent: { padding: 16, paddingBottom: 24 },
  tabContent: { gap: 14 },

  sectionCard: {
    borderRadius: 18,
    backgroundColor: C.surface,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderBottomWidth: 1,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: C.textPrimary },
  sectionBody: { padding: 14, gap: 14 },

  field: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: C.textPrimary },
  input: {
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    fontSize: 14,
    color: C.textPrimary,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  inputErr: { borderColor: C.danger },
  textarea: { height: 80, textAlignVertical: "top" },
  fieldErr: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  fieldErrText: { fontSize: 11, color: C.danger, fontWeight: "600" },

  selectRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 10,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
  },
  selectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  selectChipText: { fontSize: 12, color: C.textSecondary },

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
  },
  toggleLabel: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  toggleSub: { fontSize: 11, color: C.textMuted, marginTop: 2 },

  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  noticeTitle: { fontSize: 12, fontWeight: "800" },
  noticeText: { fontSize: 12, color: C.textSecondary, lineHeight: 18, flex: 1 },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: C.danger,
  },

  skeleton: { borderRadius: 16 },

  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  backBtnText: { fontSize: 13, fontWeight: "700", color: C.textSecondary },

  dotsRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.border },

  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.primary,
  },
  nextBtnText: { fontSize: 13, fontWeight: "800", color: "#fff" },

  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.success,
  },
  submitBtnText: { fontSize: 13, fontWeight: "800", color: "#fff" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalSheet: {
    width: "100%",
    maxWidth: 340,
    padding: 20,
    borderRadius: 24,
    backgroundColor: C.surface,
    borderWidth: 1,
    gap: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: C.textPrimary },
  modalDesc: { fontSize: 14, color: C.textSecondary, lineHeight: 20 },
  modalHint: { padding: 10, borderRadius: 12 },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  modalBtnText: { fontSize: 14, fontWeight: "700", color: C.textPrimary },

  auditScreen: { flex: 1, backgroundColor: C.bg },
  auditHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  auditRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: C.surface,
  },
  auditAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  auditAvatarText: { color: "#fff", fontSize: 12, fontWeight: "800" },

  emptyState: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyDesc: { fontSize: 13, color: C.textMuted },

  toast: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    zIndex: 100,
  },
  toastText: { flex: 1, fontSize: 13, fontWeight: "600", color: "#fff" },
});