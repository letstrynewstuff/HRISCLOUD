// src/components/admin/employee/AddEmployeeForm.tsx
import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  Switch,
  Image,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  User,
  Briefcase,
  DollarSign,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Eye,
  EyeOff,
  Upload,
  AlertCircle,
  Mail,
  Hash,
  UserPlus,
  CheckCircle2,
  Copy,
  Shield,
  Key,
} from "lucide-react-native";

import C from "../../../styles/colors";
import { useAuth } from "../../../hooks/useAuth";
import { createEmployee, getEmployees } from "../../../api/service/employeeApi";
import { departmentApi } from "../../../api/service/departmentApi";
import { gradeApi } from "../../../api/service/gradeApi";
import { listJobRoles } from "../../../api/service/jobRoleApi";

import MobileFormField from "./MobileFormField";
import MobileSelect from "./MobileSelect";
import StepIndicator from "./AddEmployeeStepIndicator";
import { Loader } from "../../../hooks/loaderManager";

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
const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full-Time" },
  { value: "part_time", label: "Part-Time" },
  { value: "contract", label: "Contract" },
  { value: "intern", label: "Intern" },
];
const PROBATION_OPTS = ["0", "1", "2", "3", "6"].map((m) => ({
  label: m === "0" ? "None" : `${m} months`,
  value: m,
}));
const PAY_FREQS = ["Monthly", "Bi-weekly"].map((f) => ({ label: f, value: f }));
const CURRENCIES = ["NGN", "USD", "GBP", "EUR"].map((c) => ({
  label: c,
  value: c,
}));
const ACCT_TYPES = ["Savings", "Current"].map((t) => ({ label: t, value: t }));

interface Props {
  onClose: () => void;
  onSuccess?: (employee: any) => void;
}

export default function AddEmployeeForm({ onClose, onSuccess }: Props) {
  const insets = useSafeAreaInsets();
  const { employee } = useAuth();

  const [dbDepartments, setDbDepartments] = useState<any[]>([]);
  const [dbRoles, setDbRoles] = useState<any[]>([]);
  const [dbGrades, setDbGrades] = useState<any[]>([]);
  const [dbManagers, setDbManagers] = useState<any[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    personalEmail: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    maritalStatus: "",
    nationality: "Nigerian",
    address: "",
    location: "",
    nin: "",
    bvn: "",
    nokName: "",
    nokPhone: "",
    nokRelationship: "",
    nokAddress: "",
    departmentId: "",
    jobRoleId: "",
    employmentType: "full_time",
    managerId: "",
    startDate: "",
    payGrade: "",
    probationMonths: "3",
    workEmail: "",
    password: "",
    basicSalary: "",
    housingAllowance: "",
    transportAllowance: "",
    medicalAllowance: "",
    otherAllowance: "",
    payFrequency: "Monthly",
    currency: "NGN",
    bankName: "",
    accountName: "",
    accountNumber: "",
    accountType: "Savings",
    sendInvite: true,
    photo: null as any,
    _deptName: "",
    _roleName: "",
  });

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const [deptRes, gradeRes, roleRes, empRes] = await Promise.all([
  //         departmentApi.list(),
  //         gradeApi.list(),
  //         listJobRoles(),
  //         getEmployees({ limit: 1000, status: "active" }),
  //       ]);
  //       setDbDepartments(
  //         deptRes.data ||
  //           deptRes.departments ||
  //           (Array.isArray(deptRes) ? deptRes : []),
  //       );
  //       setDbGrades(
  //         gradeRes.data ||
  //           gradeRes.grades ||
  //           (Array.isArray(gradeRes) ? gradeRes : []),
  //       );
  //       setDbRoles(
  //         roleRes.data ||
  //           roleRes.roles ||
  //           (Array.isArray(roleRes) ? roleRes : []),
  //       );
  //       setDbManagers(
  //         empRes.employees || empRes.data?.employees || empRes.data || [],
  //       );
  //     } catch (e) {
  //       console.error("Failed to load dropdown data:", e);
  //     } finally {
  //       setLoadingRefs(false);
  //     }
  //   })();
  // }, []);
useEffect(() => {
  (async () => {
    Loader.show();
    try {
      const [deptRes, gradeRes, roleRes, empRes] = await Promise.all([
        departmentApi.list(),
        gradeApi.list(),
        listJobRoles(),
        getEmployees({ limit: 1000, status: "active" }),
      ]);
      setDbDepartments(
        deptRes.data ||
          deptRes.departments ||
          (Array.isArray(deptRes) ? deptRes : []),
      );
      setDbGrades(
        gradeRes.data ||
          gradeRes.grades ||
          (Array.isArray(gradeRes) ? gradeRes : []),
      );
      setDbRoles(
        roleRes.data ||
          roleRes.roles ||
          (Array.isArray(roleRes) ? roleRes : []),
      );
      setDbManagers(
        empRes.employees || empRes.data?.employees || empRes.data || [],
      );
    } catch (e) {
      console.error("Failed to load dropdown data:", e);
    } finally {
      setLoadingRefs(false);
      Loader.hide();
    }
  })();
}, []);
  const set = (field: string, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  const grossSalary = [
    form.basicSalary,
    form.housingAllowance,
    form.transportAllowance,
    form.medicalAllowance,
    form.otherAllowance,
  ].reduce((s, v) => s + (Number(v) || 0), 0);

  const validate = (step: number) => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!form.firstName.trim()) e.firstName = "First name is required";
      if (!form.lastName.trim()) e.lastName = "Last name is required";
      if (!form.personalEmail.trim()) e.personalEmail = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.personalEmail))
        e.personalEmail = "Invalid email address";
      if (!form.phone.trim()) e.phone = "Phone number is required";
      if (!form.gender) e.gender = "Please select a gender";
      if (!form.location.trim()) e.location = "Please enter a work location";
    }
    if (step === 2) {
      if (!form.departmentId) e.department = "Please select a department";
      if (!form.jobRoleId) e.role = "Please select a role";
      if (!form.startDate) e.startDate = "Start date is required";
      if (!form.employmentType)
        e.employmentType = "Please select employment type";
      if (!form.password) e.password = "Password is required";
      else if (form.password.length < 6)
        e.password = "Password must be at least 6 characters";
    }
    if (step === 3) {
      if (!form.basicSalary) e.basicSalary = "Basic salary is required";
      else if (Number(form.basicSalary) < 50000)
        e.basicSalary = "Minimum salary is ₦50,000";
    }
    if (step === 4) {
      if (!form.bankName.trim()) e.bankName = "Please enter a bank name";
      if (!form.accountName.trim()) e.accountName = "Account name is required";
      if (!form.accountNumber.trim())
        e.accountNumber = "Account number is required";
      else if (!/^\d{10}$/.test(form.accountNumber))
        e.accountNumber = "Account number must be 10 digits";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate(currentStep)) setCurrentStep((s) => s + 1);
  };
  const handleBack = () => {
    setErrors({});
    setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!validate(4)) return;
    setSubmitting(true);
    setApiError(null);
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        middleName: form.middleName || undefined,
        personalEmail: form.personalEmail,
        workEmail: form.workEmail || undefined,
        phone: form.phone,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth || undefined,
        maritalStatus: form.maritalStatus || undefined,
        nationality: form.nationality,
        address: form.address || undefined,
        location: form.location,
        nextOfKin: form.nokName
          ? {
              name: form.nokName,
              phone: form.nokPhone,
              relationship: form.nokRelationship,
              address: form.nokAddress,
            }
          : undefined,
        departmentId: form.departmentId || undefined,
        jobRoleId: form.jobRoleId || undefined,
        managerId: form.managerId || undefined,
        employmentType: form.employmentType,
        startDate: form.startDate,
        payGrade: form.payGrade || undefined,
        basicSalary: Number(form.basicSalary) || undefined,
        bankName: form.bankName,
        accountName: form.accountName,
        accountNumber: form.accountNumber,
        sendInvite: form.sendInvite,
        role: "employee",
        password: form.password,
      };
      const result = await createEmployee(payload);
      setCreatedEmployee({
        empId: result.employee?.employeeCode || result.employee?.id,
        name: `${form.firstName} ${form.lastName}`,
        email:
          form.workEmail ||
          `${form.firstName.toLowerCase()}.${form.lastName.toLowerCase().charAt(0)}@hriscloud.ng`,
        role: form._roleName,
        dept: form._deptName,
        id: result.employee?.id,
      });
      setSuccessModal(true);
      onSuccess?.(result.employee);
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message ||
          "Failed to create employee. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (_text: string, key: string) => {
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePhotoChange = () => {
    Alert.alert(
      "Photo Upload",
      "Integrate expo-image-picker to select a photo.",
    );
    setPhotoPreview("https://i.pravatar.cc/150?img=12");
  };

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      middleName: "",
      personalEmail: "",
      phone: "",
      gender: "",
      dateOfBirth: "",
      maritalStatus: "",
      nationality: "Nigerian",
      address: "",
      location: "",
      nin: "",
      bvn: "",
      nokName: "",
      nokPhone: "",
      nokRelationship: "",
      nokAddress: "",
      departmentId: "",
      jobRoleId: "",
      employmentType: "full_time",
      managerId: "",
      startDate: "",
      payGrade: "",
      probationMonths: "3",
      workEmail: "",
      password: "",
      basicSalary: "",
      housingAllowance: "",
      transportAllowance: "",
      medicalAllowance: "",
      otherAllowance: "",
      payFrequency: "Monthly",
      currency: "NGN",
      bankName: "",
      accountName: "",
      accountNumber: "",
      accountType: "Savings",
      sendInvite: true,
      photo: null,
      _deptName: "",
      _roleName: "",
    });
    setPhotoPreview(null);
    setCurrentStep(1);
    setErrors({});
    setApiError(null);
  };

  const deptOptions = dbDepartments.map((d) => ({
    label: d.name,
    value: d.id,
  }));
  const roleOptions = dbRoles
    .filter((r) => r.departmentId === form.departmentId)
    .map((r) => ({ label: r.title || r.name, value: r.id }));
  const gradeOptions = dbGrades.map((g) => ({
    label: g.level || g.name,
    value: g.id,
  }));
  const managerOptions = dbManagers.map((m) => {
    const f = m.firstName || m.first_name || "";
    const l = m.lastName || m.last_name || "";
    const t = m.job_role?.title || m.jobTitle || "Staff";
    return { label: `${f} ${l} — (${t})`, value: m.id };
  });

  const autoWorkEmail =
    form.firstName && form.lastName
      ? form.workEmail ||
        `${form.firstName.toLowerCase()}.${form.lastName.toLowerCase().charAt(0)}@hriscloud.ng`
      : "";

  const renderStep1 = () => (
    <View style={s.stepContent}>
      <View style={s.photoSection}>
        <View style={s.photoWrap}>
          {photoPreview ? (
            <Image source={{ uri: photoPreview }} style={s.photoImg} />
          ) : (
            <User size={32} color={C.primary} />
          )}
        </View>
        <Pressable onPress={handlePhotoChange} style={s.photoBtn}>
          <Upload size={14} color={C.primary} />
          <Text style={s.photoBtnText}>Upload Photo</Text>
        </Pressable>
        <Text style={s.photoHint}>JPG, PNG · Max 2MB</Text>
      </View>

      <MobileFormField label="First Name" required error={errors.firstName}>
        <TextInput
          value={form.firstName}
          onChangeText={(t) => set("firstName", t)}
          placeholder="e.g. Amara"
          placeholderTextColor={C.textMuted}
          style={[s.input, errors.firstName && s.inputError]}
        />
      </MobileFormField>

      <MobileFormField label="Middle Name">
        <TextInput
          value={form.middleName}
          onChangeText={(t) => set("middleName", t)}
          placeholder="Optional"
          placeholderTextColor={C.textMuted}
          style={s.input}
        />
      </MobileFormField>

      <MobileFormField label="Last Name" required error={errors.lastName}>
        <TextInput
          value={form.lastName}
          onChangeText={(t) => set("lastName", t)}
          placeholder="e.g. Johnson"
          placeholderTextColor={C.textMuted}
          style={[s.input, errors.lastName && s.inputError]}
        />
      </MobileFormField>

      <MobileFormField label="NIN">
        <TextInput
          value={form.nin}
          onChangeText={(t) => set("nin", t)}
          placeholder="00000000000"
          placeholderTextColor={C.textMuted}
          keyboardType="numeric"
          style={s.input}
        />
      </MobileFormField>

      <MobileFormField label="BVN">
        <TextInput
          value={form.bvn}
          onChangeText={(t) => set("bvn", t)}
          placeholder="00000000000"
          placeholderTextColor={C.textMuted}
          keyboardType="numeric"
          style={s.input}
        />
      </MobileFormField>

      <MobileFormField
        label="Personal Email"
        required
        error={errors.personalEmail}
        hint="Used to auto-generate work email"
      >
        <TextInput
          value={form.personalEmail}
          onChangeText={(t) => set("personalEmail", t)}
          placeholder="personal@email.com"
          placeholderTextColor={C.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[s.input, errors.personalEmail && s.inputError]}
        />
      </MobileFormField>

      <MobileFormField label="Phone Number" required error={errors.phone}>
        <TextInput
          value={form.phone}
          onChangeText={(t) => set("phone", t)}
          placeholder="+234 801 234 5678"
          placeholderTextColor={C.textMuted}
          keyboardType="phone-pad"
          style={[s.input, errors.phone && s.inputError]}
        />
      </MobileFormField>

      <MobileFormField
        label="Work Email (optional)"
        hint="Leave blank to auto-generate"
      >
        <TextInput
          value={form.workEmail}
          onChangeText={(t) => set("workEmail", t)}
          placeholder="firstname.l@company.ng"
          placeholderTextColor={C.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          style={s.input}
        />
      </MobileFormField>

      <MobileFormField label="Gender" required error={errors.gender}>
        <MobileSelect
          value={form.gender}
          onChange={(v) => set("gender", v)}
          options={GENDERS}
          placeholder="Select gender…"
          error={errors.gender}
        />
      </MobileFormField>

      <MobileFormField label="Date of Birth">
        <TextInput
          value={form.dateOfBirth}
          onChangeText={(t) => set("dateOfBirth", t)}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={C.textMuted}
          style={s.input}
        />
      </MobileFormField>

      <MobileFormField label="Marital Status">
        <MobileSelect
          value={form.maritalStatus}
          onChange={(v) => set("maritalStatus", v)}
          options={MARITAL}
          placeholder="Select status…"
        />
      </MobileFormField>

      <MobileFormField label="Nationality">
        <TextInput
          value={form.nationality}
          onChangeText={(t) => set("nationality", t)}
          placeholder="e.g. Nigerian"
          placeholderTextColor={C.textMuted}
          style={s.input}
        />
      </MobileFormField>

      <MobileFormField label="Work Location" required error={errors.location}>
        <TextInput
          value={form.location}
          onChangeText={(t) => set("location", t)}
          placeholder="e.g. Lagos, London, New York, Remote…"
          placeholderTextColor={C.textMuted}
          style={[s.input, errors.location && s.inputError]}
        />
      </MobileFormField>

      <MobileFormField label="Residential Address">
        <TextInput
          value={form.address}
          onChangeText={(t) => set("address", t)}
          placeholder="Full residential address…"
          placeholderTextColor={C.textMuted}
          multiline
          numberOfLines={3}
          style={[s.input, s.textarea]}
        />
      </MobileFormField>

      <Text style={s.sectionHeader}>Next of Kin / Emergency Contact</Text>

      <MobileFormField label="Full Name">
        <TextInput
          value={form.nokName}
          onChangeText={(t) => set("nokName", t)}
          placeholder="Contact person"
          placeholderTextColor={C.textMuted}
          style={s.input}
        />
      </MobileFormField>
      <MobileFormField label="Phone Number">
        <TextInput
          value={form.nokPhone}
          onChangeText={(t) => set("nokPhone", t)}
          placeholder="+234 …"
          placeholderTextColor={C.textMuted}
          keyboardType="phone-pad"
          style={s.input}
        />
      </MobileFormField>
      <MobileFormField label="Relationship">
        <TextInput
          value={form.nokRelationship}
          onChangeText={(t) => set("nokRelationship", t)}
          placeholder="e.g. Spouse"
          placeholderTextColor={C.textMuted}
          style={s.input}
        />
      </MobileFormField>
      <MobileFormField label="Address">
        <TextInput
          value={form.nokAddress}
          onChangeText={(t) => set("nokAddress", t)}
          placeholder="Contact address"
          placeholderTextColor={C.textMuted}
          style={s.input}
        />
      </MobileFormField>
    </View>
  );

  const renderStep2 = () => (
    <View style={s.stepContent}>
      <View style={s.infoBanner}>
        <Hash size={16} color={C.primary} />
        <View style={{ flex: 1 }}>
          <Text style={s.infoBannerTitle}>Auto-generated Employee ID</Text>
          <Text style={s.infoBannerValue}>EMP-XXXX</Text>
        </View>
        <Text style={s.infoBannerMeta}>Assigned on creation</Text>
      </View>

      <MobileFormField label="Department" required error={errors.department}>
        <MobileSelect
          value={form.departmentId}
          onChange={(v) => {
            const dept = dbDepartments.find((d) => d.id === v);
            setForm((p) => ({
              ...p,
              departmentId: v,
              _deptName: dept ? dept.name : "",
              jobRoleId: "",
            }));
          }}
          options={deptOptions}
          placeholder="Select department…"
          error={errors.department}
        />
      </MobileFormField>

      <MobileFormField label="Job Title / Role" required error={errors.role}>
        <MobileSelect
          value={form.jobRoleId}
          onChange={(v) => {
            const role = dbRoles.find((r) => r.id === v);
            setForm((p) => ({
              ...p,
              jobRoleId: v,
              _roleName: role ? role.title || role.name : "",
            }));
          }}
          options={roleOptions}
          placeholder={
            form.departmentId ? "Select role…" : "Select department first"
          }
          error={errors.role}
        />
      </MobileFormField>

      <MobileFormField label="Reporting Manager">
        <MobileSelect
          value={form.managerId}
          onChange={(v) => set("managerId", v)}
          options={[
            { label: "No Manager (Top Level)", value: "" },
            ...managerOptions,
          ]}
          placeholder="Select manager…"
        />
      </MobileFormField>

      <MobileFormField label="Grade / Level">
        <MobileSelect
          value={form.payGrade}
          onChange={(v) => set("payGrade", v)}
          options={gradeOptions}
          placeholder="Select grade…"
        />
      </MobileFormField>

      <Text style={s.sectionHeader}>Login Credentials</Text>

      <MobileFormField
        label="Work Email (optional)"
        hint="Leave blank to auto-generate"
      >
        <TextInput
          value={form.workEmail}
          onChangeText={(t) => set("workEmail", t)}
          placeholder="firstname.l@company.ng"
          placeholderTextColor={C.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          style={s.input}
        />
      </MobileFormField>

      <MobileFormField
        label="Assign Password"
        required
        error={errors.password}
        hint="Employee will use this to log in"
      >
        <View>
          <TextInput
            value={form.password}
            onChangeText={(t) => set("password", t)}
            placeholder="Enter secure password"
            placeholderTextColor={C.textMuted}
            secureTextEntry={!showPassword}
            style={[
              s.input,
              { paddingRight: 44 },
              errors.password && s.inputError,
            ]}
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={s.eyeBtn}
          >
            {showPassword ? (
              <EyeOff size={18} color={C.textMuted} />
            ) : (
              <Eye size={18} color={C.textMuted} />
            )}
          </Pressable>
        </View>
      </MobileFormField>

      <MobileFormField
        label="Employment Type"
        required
        error={errors.employmentType}
      >
        <MobileSelect
          value={form.employmentType}
          onChange={(v) => set("employmentType", v)}
          options={EMPLOYMENT_TYPES}
          placeholder="Select type…"
          error={errors.employmentType}
        />
      </MobileFormField>

      <MobileFormField label="Start Date" required error={errors.startDate}>
        <TextInput
          value={form.startDate}
          onChangeText={(t) => set("startDate", t)}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={C.textMuted}
          style={[s.input, errors.startDate && s.inputError]}
        />
      </MobileFormField>

      <MobileFormField label="Probation Period">
        <MobileSelect
          value={form.probationMonths}
          onChange={(v) => set("probationMonths", v)}
          options={PROBATION_OPTS}
        />
      </MobileFormField>

      <View style={s.toggleRow}>
        <Switch
          value={form.sendInvite}
          onValueChange={(v) => set("sendInvite", v)}
          trackColor={{ false: C.border, true: C.primary }}
          thumbColor="#fff"
        />
        <View style={{ flex: 1 }}>
          <Text style={s.toggleTitle}>Send Login Invite Email</Text>
          <Text style={s.toggleDesc}>
            Employee will receive an email with temporary credentials
          </Text>
        </View>
      </View>

      {autoWorkEmail ? (
        <View style={s.successBanner}>
          <Mail size={14} color={C.success} />
          <View style={{ flex: 1 }}>
            <Text style={s.successBannerTitle}>
              Work Email (Auto-generated)
            </Text>
            <Text style={s.successBannerValue}>{autoWorkEmail}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );

  const renderStep3 = () => (
    <View style={s.stepContent}>
      <View style={s.grossCard}>
        <Text style={s.grossLabel}>Gross Monthly Salary</Text>
        <Text style={s.grossValue}>₦{grossSalary.toLocaleString()}</Text>
        <Text style={s.grossMeta}>
          ≈ ₦{(grossSalary * 12).toLocaleString()} / year
        </Text>
      </View>

      <MobileFormField
        label="Basic Salary (₦)"
        required
        error={errors.basicSalary}
        hint="Net of taxes — before allowances"
      >
        <View style={s.currencyWrap}>
          <Text style={s.currencySym}>₦</Text>
          <TextInput
            value={form.basicSalary}
            onChangeText={(t) => set("basicSalary", t.replace(/[^0-9]/g, ""))}
            placeholder="0"
            placeholderTextColor={C.textMuted}
            keyboardType="numeric"
            style={[
              s.input,
              s.currencyInput,
              errors.basicSalary && s.inputError,
            ]}
          />
        </View>
      </MobileFormField>

      <Text style={s.sectionHeader}>Allowances</Text>

      {[
        { field: "housingAllowance", label: "Housing Allowance (₦)" },
        { field: "transportAllowance", label: "Transport Allowance (₦)" },
        { field: "medicalAllowance", label: "Medical Allowance (₦)" },
        { field: "otherAllowance", label: "Other Allowance (₦)" },
      ].map(({ field, label }) => (
        <MobileFormField key={field} label={label}>
          <View style={s.currencyWrap}>
            <Text style={s.currencySym}>₦</Text>
            <TextInput
              value={(form as any)[field]}
              onChangeText={(t) => set(field, t.replace(/[^0-9]/g, ""))}
              placeholder="0"
              placeholderTextColor={C.textMuted}
              keyboardType="numeric"
              style={[s.input, s.currencyInput]}
            />
          </View>
        </MobileFormField>
      ))}

      {grossSalary > 0 && (
        <View style={s.breakdownCard}>
          <Text style={s.breakdownHeader}>Salary Breakdown</Text>
          {[
            { label: "Basic Salary", value: form.basicSalary },
            { label: "Housing Allowance", value: form.housingAllowance },
            { label: "Transport Allowance", value: form.transportAllowance },
            { label: "Medical Allowance", value: form.medicalAllowance },
            { label: "Other", value: form.otherAllowance },
          ]
            .filter((r) => Number(r.value) > 0)
            .map((row, i) => (
              <View
                key={row.label}
                style={[
                  s.breakdownRow,
                  i % 2 === 0 && { backgroundColor: C.surface },
                ]}
              >
                <Text style={s.breakdownLabel}>{row.label}</Text>
                <Text style={s.breakdownValue}>
                  ₦{Number(row.value).toLocaleString()}
                </Text>
              </View>
            ))}
          <View style={s.breakdownTotal}>
            <Text style={s.breakdownTotalLabel}>Gross Total</Text>
            <Text style={s.breakdownTotalValue}>
              ₦{grossSalary.toLocaleString()}
            </Text>
          </View>
        </View>
      )}

      <MobileFormField label="Pay Frequency">
        <MobileSelect
          value={form.payFrequency}
          onChange={(v) => set("payFrequency", v)}
          options={PAY_FREQS}
        />
      </MobileFormField>

      <MobileFormField label="Currency">
        <MobileSelect
          value={form.currency}
          onChange={(v) => set("currency", v)}
          options={CURRENCIES}
        />
      </MobileFormField>
    </View>
  );

  const renderStep4 = () => (
    <View style={s.stepContent}>
      <View style={s.warningBanner}>
        <Shield size={14} color={C.warning} style={{ marginTop: 2 }} />
        <Text style={s.warningBannerText}>
          Bank details are encrypted and only accessible to authorized payroll
          officers.
        </Text>
      </View>

      <MobileFormField label="Bank Name" required error={errors.bankName}>
        <TextInput
          value={form.bankName}
          onChangeText={(t) => set("bankName", t)}
          placeholder="e.g. Access Bank, Chase, HSBC, Barclays…"
          placeholderTextColor={C.textMuted}
          style={[s.input, errors.bankName && s.inputError]}
        />
      </MobileFormField>

      <MobileFormField label="Account Type">
        <MobileSelect
          value={form.accountType}
          onChange={(v) => set("accountType", v)}
          options={ACCT_TYPES}
        />
      </MobileFormField>

      <MobileFormField
        label="Account Name"
        required
        error={errors.accountName}
        hint="Must match the name on the bank account exactly"
      >
        <TextInput
          value={form.accountName}
          onChangeText={(t) => set("accountName", t)}
          placeholder="e.g. JOHNSON AMARA CHIDINMA"
          placeholderTextColor={C.textMuted}
          autoCapitalize="characters"
          style={[s.input, errors.accountName && s.inputError]}
        />
      </MobileFormField>

      <MobileFormField
        label="Account Number (NUBAN)"
        required
        error={errors.accountNumber}
        hint="10-digit NUBAN account number"
      >
        <TextInput
          value={form.accountNumber}
          onChangeText={(t) =>
            set("accountNumber", t.replace(/\D/g, "").slice(0, 10))
          }
          placeholder="0123456789"
          placeholderTextColor={C.textMuted}
          keyboardType="numeric"
          maxLength={10}
          style={[s.input, errors.accountNumber && s.inputError]}
        />
      </MobileFormField>

      {form.firstName ? (
        <View style={s.reviewCard}>
          <Text style={s.reviewHeader}>Review Before Submitting</Text>
          <View style={s.reviewGrid}>
            {[
              { label: "Name", value: `${form.firstName} ${form.lastName}` },
              { label: "Department", value: form._deptName || "—" },
              { label: "Role", value: form._roleName || "—" },
              { label: "Start Date", value: form.startDate || "—" },
              {
                label: "Gross Salary",
                value: grossSalary ? `₦${grossSalary.toLocaleString()}` : "—",
              },
              { label: "Bank", value: form.bankName || "—" },
            ].map(({ label, value }) => (
              <View key={label} style={s.reviewItem}>
                <Text style={s.reviewItemLabel}>{label}</Text>
                <Text style={s.reviewItemValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[s.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={s.header}>
        <Pressable onPress={onClose} style={s.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Add New Employee</Text>
          <Text style={s.headerSubtitle}>Step {currentStep} of 4</Text>
        </View>
        <View style={s.headerAvatar}>
          <Text style={s.headerAvatarText}>
            {employee?.name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2) || "NA"}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {apiError && (
          <View style={s.errorBanner}>
            <AlertCircle size={16} color={C.danger} />
            <Text style={s.errorBannerText}>{apiError}</Text>
            <Pressable onPress={() => setApiError(null)}>
              <X size={14} color={C.danger} />
            </Pressable>
          </View>
        )}

        <StepIndicator currentStep={currentStep} />

        {loadingRefs && currentStep === 2 && (
          <View style={s.loadingPill}>
            <ActivityIndicator size="small" color={C.primary} />
            <Text style={s.loadingPillText}>Loading options…</Text>
          </View>
        )}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        <View style={s.navRow}>
          <Pressable
            onPress={handleBack}
            disabled={currentStep === 1}
            style={({ pressed }) => [
              s.backBtn,
              (currentStep === 1 || pressed) && {
                opacity: currentStep === 1 ? 0.5 : 0.85,
              },
            ]}
          >
            <ChevronLeft size={16} color={C.textSecondary} />
            <Text style={s.backBtnText}>Back</Text>
          </Pressable>

          <View style={s.dotsRow}>
            {[1, 2, 3, 4].map((d) => (
              <View
                key={d}
                style={[
                  s.dot,
                  d === currentStep && {
                    backgroundColor: C.primary,
                    width: 18,
                  },
                  d < currentStep && { backgroundColor: C.success },
                ]}
              />
            ))}
          </View>

          {currentStep < 4 ? (
            <Pressable
              onPress={handleNext}
              style={({ pressed }) => [s.nextBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={s.nextBtnText}>Next</Text>
              <ChevronRight size={16} color="#fff" />
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              style={({ pressed }) => [
                s.submitBtn,
                (submitting || pressed) && { opacity: submitting ? 0.7 : 0.85 },
              ]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <UserPlus size={16} color="#fff" />
                  <Text style={s.submitBtnText}>Create</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>

      <Modal
        visible={successModal}
        animationType="fade"
        transparent
        statusBarTranslucent
      >
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHeader}>
              <View style={s.modalIconWrap}>
                <CheckCircle2 size={32} color="#fff" />
              </View>
              <Text style={s.modalTitle}>Employee Created! 🎉</Text>
              <Text style={s.modalSubtitle}>
                {createdEmployee?.name} has been added to the system.
              </Text>
            </View>

            <View style={s.modalBody}>
              <View style={s.modalDetailCard}>
                <View style={s.modalDetailHeader}>
                  <Key size={13} color={C.warning} />
                  <Text style={s.modalDetailHeaderText}>Employee Details</Text>
                </View>

                {[
                  {
                    label: "Employee Code",
                    value: createdEmployee?.empId,
                    key: "id",
                  },
                  {
                    label: "Work Email",
                    value: createdEmployee?.email,
                    key: "email",
                  },
                ].map(({ label, value, key }) => (
                  <View key={key} style={s.modalDetailRow}>
                    <View>
                      <Text style={s.modalDetailLabel}>{label}</Text>
                      <Text style={s.modalDetailValue}>{value}</Text>
                    </View>
                    <Pressable
                      onPress={() => handleCopy(value, key)}
                      style={s.copyBtn}
                    >
                      {copied === key ? (
                        <Check size={14} color={C.success} />
                      ) : (
                        <Copy size={14} color={C.textMuted} />
                      )}
                    </Pressable>
                  </View>
                ))}

                {form.sendInvite && (
                  <Text style={s.modalInviteText}>
                    ✓ Login invite email will be sent to the employee.
                  </Text>
                )}
              </View>

              <Text style={s.modalSectionLabel}>What happens next</Text>
              {[
                "Employee profile created on self-service portal",
                form.sendInvite
                  ? "Welcome email sent with login credentials"
                  : "Login invite not sent (toggled off)",
                "Onboarding checklist assigned automatically",
                "Manager notified of new team member",
              ].map((step, i) => (
                <View key={i} style={s.modalNextRow}>
                  <View style={s.modalCheckWrap}>
                    <Check size={10} color={C.success} />
                  </View>
                  <Text style={s.modalNextText}>{step}</Text>
                </View>
              ))}

              <View style={s.modalActions}>
                <Pressable
                  onPress={() => {
                    setSuccessModal(false);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    s.modalPrimaryBtn,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={s.modalPrimaryBtnText}>Done</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setSuccessModal(false);
                    resetForm();
                  }}
                  style={({ pressed }) => [
                    s.modalSecondaryBtn,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={s.modalSecondaryBtnText}>Add Another</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },

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
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
  },
  headerAvatarText: { color: "#fff", fontSize: 12, fontWeight: "700" },

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

  stepContent: { gap: 14, marginTop: 8 },

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
  inputError: { borderColor: C.danger },
  textarea: { height: 80, textAlignVertical: "top" },
  eyeBtn: { position: "absolute", right: 12, top: 12 },

  photoSection: { alignItems: "center", gap: 10, marginBottom: 8 },
  photoWrap: {
    width: 80,
    height: 80,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: C.primary + "44",
  },
  photoImg: { width: 80, height: 80, resizeMode: "cover" },
  photoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
  },
  photoBtnText: { fontSize: 12, fontWeight: "700", color: C.primary },
  photoHint: { fontSize: 11, color: C.textMuted },

  sectionHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: -4,
  },

  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: C.primary + "22",
  },
  infoBannerTitle: { fontSize: 11, fontWeight: "700", color: C.primary },
  infoBannerValue: {
    fontSize: 14,
    fontWeight: "800",
    color: C.textPrimary,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  infoBannerMeta: { fontSize: 10, color: C.textMuted, marginLeft: "auto" },

  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.successLight,
    borderWidth: 1,
    borderColor: C.success + "22",
  },
  successBannerTitle: { fontSize: 11, fontWeight: "700", color: C.success },
  successBannerValue: { fontSize: 13, fontWeight: "800", color: C.textPrimary },

  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.warningLight,
    borderWidth: 1,
    borderColor: C.warning + "33",
  },
  warningBannerText: {
    flex: 1,
    fontSize: 12,
    color: C.textSecondary,
    lineHeight: 18,
  },

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  toggleTitle: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  toggleDesc: { fontSize: 11, color: C.textMuted, marginTop: 2 },

  grossCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: C.primaryLight,
    borderWidth: 1,
    borderColor: C.primary + "22",
  },
  grossLabel: { fontSize: 12, fontWeight: "700", color: C.primary },
  grossValue: {
    fontSize: 28,
    fontWeight: "800",
    color: C.textPrimary,
    marginTop: 4,
  },
  grossMeta: { fontSize: 12, color: C.textMuted, marginTop: 2 },

  currencyWrap: { flexDirection: "row", alignItems: "center" },
  currencySym: {
    position: "absolute",
    left: 14,
    fontSize: 14,
    fontWeight: "700",
    color: C.textMuted,
    zIndex: 1,
  },
  currencyInput: { paddingLeft: 28 },

  breakdownCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  breakdownHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: C.surfaceAlt,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: C.surface,
  },
  breakdownLabel: { fontSize: 13, color: C.textSecondary },
  breakdownValue: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  breakdownTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: C.primaryLight,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  breakdownTotalLabel: { fontSize: 13, fontWeight: "800", color: C.primary },
  breakdownTotalValue: { fontSize: 13, fontWeight: "800", color: C.primary },

  reviewCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  reviewHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  reviewGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  reviewItem: { width: "47%" },
  reviewItemLabel: { fontSize: 10, color: C.textMuted, marginBottom: 2 },
  reviewItemValue: { fontSize: 13, fontWeight: "700", color: C.textPrimary },

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

  loadingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    marginVertical: 8,
  },
  loadingPillText: { fontSize: 12, color: C.textSecondary },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalSheet: {
    width: "100%",
    maxHeight: "90%",
    borderRadius: 24,
    backgroundColor: C.surface,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.border,
  },
  modalHeader: {
    alignItems: "center",
    padding: 24,
    backgroundColor: C.successLight,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.success,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: C.textPrimary,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 13,
    color: C.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },

  modalBody: { padding: 20, gap: 14 },

  modalDetailCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.warningLight,
    borderWidth: 1,
    borderColor: C.warning + "33",
    gap: 10,
  },
  modalDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  modalDetailHeaderText: {
    fontSize: 11,
    fontWeight: "800",
    color: C.warning,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  modalDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
    backgroundColor: C.surface,
  },
  modalDetailLabel: { fontSize: 10, color: C.textMuted },
  modalDetailValue: {
    fontSize: 13,
    fontWeight: "800",
    color: C.textPrimary,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  copyBtn: { padding: 6, borderRadius: 8, backgroundColor: C.surfaceAlt },

  modalInviteText: { fontSize: 12, color: C.textSecondary, marginTop: 2 },

  modalSectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 4,
  },
  modalNextRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  modalCheckWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.successLight,
  },
  modalNextText: { flex: 1, fontSize: 12, color: C.textSecondary },

  modalActions: { flexDirection: "row", gap: 10, marginTop: 6 },
  modalPrimaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.primary,
  },
  modalPrimaryBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },
  modalSecondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  modalSecondaryBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.textSecondary,
  },
});
