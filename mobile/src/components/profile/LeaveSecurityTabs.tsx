// src/components/profile/LeaveSecurityTabs.tsx
// LeaveProfileTab — leave balances + recent requests (calls real API)
// SecurityTab     — change password (calls real API)

import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  Plane,
  Clock,
  Key,
  Lock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react-native";
import C from "../../styles/colors";
import { leaveApi } from "../../api/service/leaveApi";
import { authApi } from "../../api/service/authApi";

// ─── Shared section shell ──────────────────────────────────────────────
function SectionShell({
  children,
  icon: Icon,
  title,
  sub,
  iconBg = C.primaryLight,
  iconColor = C.primary,
}: {
  children: React.ReactNode;
  icon: any;
  title: string;
  sub?: string;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <Icon size={14} color={iconColor} />
        </View>
        <View>
          <Text style={styles.sectionTitle}>{title}</Text>
          {!!sub && <Text style={styles.sectionSub}>{sub}</Text>}
        </View>
      </View>
      {children}
    </View>
  );
}

// ─── Status chip ──────────────────────────────────────────────────────
function StatusChip({ status }: { status: string }) {
  const cfgMap: Record<string, { bg: string; color: string }> = {
    approved: { bg: C.successLight, color: C.success },
    rejected: { bg: C.dangerLight, color: C.danger },
    pending: { bg: C.warningLight, color: C.warning },
    cancelled: { bg: C.surfaceAlt, color: C.textMuted },
  };
  const cfg = cfgMap[status?.toLowerCase()] ?? cfgMap.pending;
  return (
    <View style={[styles.chip, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.chipText, { color: cfg.color }]}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Text>
    </View>
  );
}

// ═══════════════════════ LEAVE TAB ════════════════════════════════════
export function LeaveProfileTab() {
  const [balances, setBalances] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [balRes, reqRes] = await Promise.all([
          leaveApi.getMyBalances(),
          leaveApi.getMyRequests({ limit: 10 }),
        ]);
        setBalances(balRes.data ?? balRes.balances ?? []);
        setRequests(reqRes.data ?? reqRes.requests ?? []);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "Failed to load leave data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fmtDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("en-NG", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={C.primary} />
      </View>
    );
  }

  return (
    <View style={styles.gap}>
      {error && (
        <View style={styles.errorBox}>
          <AlertCircle size={13} color={C.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Balances */}
      <SectionShell
        icon={Plane}
        title="Leave Balances"
        iconBg="#ECFEFF"
        iconColor={C.accent}
      >
        {balances.length === 0 ? (
          <Text style={styles.emptyText}>No leave balances found.</Text>
        ) : (
          <View style={styles.sectionBody}>
            {balances.map((b: any, i: number) => (
              <View
                key={b.id ?? i}
                style={[
                  styles.balanceRow,
                  i === balances.length - 1 && styles.lastRow,
                ]}
              >
                <View>
                  <Text style={styles.balanceName}>
                    {b.leave_type ?? b.policy_name ?? "Leave"}
                  </Text>
                  <Text style={styles.balanceSub}>
                    {b.entitled_days} days entitled
                  </Text>
                </View>
                <View style={styles.balanceRight}>
                  <Text style={styles.balanceDays}>
                    {b.remaining_days ?? b.balance ?? "—"}
                  </Text>
                  <Text style={styles.balanceDaysLabel}>days left</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </SectionShell>

      {/* Recent requests */}
      <SectionShell icon={Clock} title="Recent Leave Requests">
        {requests.length === 0 ? (
          <Text style={styles.emptyText}>No leave requests found.</Text>
        ) : (
          <View style={styles.sectionBody}>
            {requests.map((r: any, i: number) => (
              <View
                key={r.id ?? i}
                style={[
                  styles.reqRow,
                  i === requests.length - 1 && styles.lastRow,
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.reqType}>
                    {r.leave_type ?? r.type ?? "Leave"}
                  </Text>
                  <Text style={styles.reqDates}>
                    {fmtDate(r.start_date)} — {fmtDate(r.end_date)}
                  </Text>
                </View>
                <StatusChip status={r.status} />
              </View>
            ))}
          </View>
        )}
      </SectionShell>
    </View>
  );
}

// ═══════════════════════ SECURITY TAB ═════════════════════════════════
export function SecurityTab() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleChange() {
    setMsg(null);
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
    try {
      await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setMsg({ type: "success", text: "Password changed successfully." });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e: any) {
      setMsg({
        type: "error",
        text: e?.response?.data?.message ?? "Password change failed.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionShell
      icon={Key}
      title="Change Password"
      iconBg={C.warningLight}
      iconColor={C.warning}
    >
      <View style={styles.sectionBody}>
        {msg && (
          <View
            style={[
              styles.msgBox,
              {
                backgroundColor:
                  msg.type === "success" ? C.successLight : C.dangerLight,
              },
            ]}
          >
            {msg.type === "success" ? (
              <CheckCircle2 size={13} color={C.success} />
            ) : (
              <AlertCircle size={13} color={C.danger} />
            )}
            <Text
              style={[
                styles.msgText,
                { color: msg.type === "success" ? C.success : C.danger },
              ]}
            >
              {msg.text}
            </Text>
          </View>
        )}

        {[
          { key: "currentPassword", label: "Current Password" },
          { key: "newPassword", label: "New Password" },
          { key: "confirmPassword", label: "Confirm New Password" },
        ].map((f) => (
          <View key={f.key} style={styles.pwField}>
            <Text style={styles.pwLabel}>{f.label}</Text>
            <TextInput
              value={form[f.key as keyof typeof form]}
              onChangeText={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
              secureTextEntry
              style={styles.pwInput}
              placeholderTextColor={C.textMuted}
              placeholder="••••••••"
            />
          </View>
        ))}

        <Pressable
          onPress={handleChange}
          disabled={saving}
          style={({ pressed }) => [
            styles.pwBtn,
            saving && { opacity: 0.7 },
            pressed && { opacity: 0.88 },
          ]}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Lock size={14} color="#fff" />
              <Text style={styles.pwBtnLabel}>Change Password</Text>
            </>
          )}
        </Pressable>
      </View>
    </SectionShell>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 14 },
  centered: {
    paddingVertical: 40,
    alignItems: "center",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.dangerLight,
    borderRadius: 12,
    padding: 11,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: C.danger,
  },
  section: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: C.textPrimary,
  },
  sectionSub: {
    fontSize: 10,
    color: C.textMuted,
    marginTop: 1,
  },
  sectionBody: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  emptyText: {
    fontSize: 12.5,
    color: C.textMuted,
    textAlign: "center",
    paddingVertical: 24,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  balanceName: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textPrimary,
  },
  balanceSub: {
    fontSize: 10.5,
    color: C.textMuted,
    marginTop: 1,
  },
  balanceRight: {
    alignItems: "flex-end",
  },
  balanceDays: {
    fontSize: 17,
    fontWeight: "800",
    color: C.primary,
  },
  balanceDaysLabel: {
    fontSize: 9.5,
    color: C.textMuted,
  },
  reqRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 8,
  },
  reqType: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textPrimary,
  },
  reqDates: {
    fontSize: 10.5,
    color: C.textMuted,
    marginTop: 1,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 9.5,
    fontWeight: "700",
  },
  msgBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    padding: 11,
    marginBottom: 14,
  },
  msgText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "600",
  },
  pwField: {
    marginBottom: 12,
  },
  pwLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    marginBottom: 5,
  },
  pwInput: {
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 13.5,
    color: C.textPrimary,
  },
  pwBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: C.primary,
    marginTop: 4,
  },
  pwBtnLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#fff",
  },
});
