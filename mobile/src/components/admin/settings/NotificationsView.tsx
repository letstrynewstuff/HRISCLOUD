// src/components/admin/settings/NotificationsView.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react-native";
import { useTheme } from "../../ThemeContext";
// import {
//   getNotificationPreferences,
//   updateNotificationPreferences,
// } from "../../../api/service/settingsApi";
import {
  getNotificationPrefs,
  updateNotificationPrefs,
} from "../../../api/service/settingsApi";
import SettingsHeader from "./SettingsHeader";
import SettingsSection from "./SettingsSection";
import ToggleRow from "./ToggleRow";
import { Loader } from "../../../hooks/loaderManager";

const DEFAULTS = {
  email_leave_requests: true,
  email_payroll_runs: true,
  push_new_hires: true,
  push_approvals_pending: true,
  sms_critical_alerts: false,
};

type Props = { onClose: () => void };

export default function NotificationsView({ onClose }: Props) {
  const { colors: C } = useTheme();
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<Record<string, boolean>>(DEFAULTS);
  const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const res: any = await getNotificationPreferences();
//         setPrefs({ ...DEFAULTS, ...(res.data ?? res ?? {}) });
//       } catch (e: any) {
//         setError(e?.response?.data?.message ?? null);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);
useEffect(() => {
  (async () => {
    setLoading(true);
    setError(null);
    Loader.show();
    try {
      const res: any = await getNotificationPrefs();
      setPrefs({ ...DEFAULTS, ...(res.data ?? res ?? {}) });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? null);
    } finally {
      setLoading(false);
      Loader.hide();
    }
  })();
}, []);
  const update = async (key: string, value: boolean) => {
    const prev = prefs;
    setPrefs((p) => ({ ...p, [key]: value })); // optimistic
    try {
      await updateNotificationPrefs({ [key]: value });
    } catch {
      setPrefs(prev); // revert on failure
      Alert.alert("Couldn't save", "Please try again.");
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: C.bg }]}>
      <SettingsHeader
        title="Notifications"
        subtitle="Choose what you're notified about"
        onBack={onClose}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {error ? (
            <Text style={{ color: C.danger, fontSize: 12, marginBottom: 12 }}>
              {error}
            </Text>
          ) : null}

          <SettingsSection title="Email">
            <ToggleRow
              icon={Mail}
              label="Leave requests"
              sub="Get an email when staff submit or update leave requests"
              value={prefs.email_leave_requests}
              onChange={(v) => update("email_leave_requests", v)}
            />
            <ToggleRow
              icon={Mail}
              label="Payroll runs"
              sub="Get an email when a payroll run is processed or finalised"
              value={prefs.email_payroll_runs}
              onChange={(v) => update("email_payroll_runs", v)}
            />
          </SettingsSection>

          <SettingsSection title="Push">
            <ToggleRow
              icon={Bell}
              label="New hires"
              sub="Push notification when a new employee is onboarded"
              value={prefs.push_new_hires}
              onChange={(v) => update("push_new_hires", v)}
            />
            <ToggleRow
              icon={Bell}
              label="Pending approvals"
              sub="Push notification for anything awaiting your sign-off"
              value={prefs.push_approvals_pending}
              onChange={(v) => update("push_approvals_pending", v)}
            />
          </SettingsSection>

          <SettingsSection title="SMS">
            <ToggleRow
              icon={Smartphone}
              label="Critical alerts only"
              sub="Text message for time-sensitive issues (e.g. failed payroll export)"
              value={prefs.sms_critical_alerts}
              onChange={(v) => update("sms_critical_alerts", v)}
            />
          </SettingsSection>

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scrollContent: { padding: 16 },
});
