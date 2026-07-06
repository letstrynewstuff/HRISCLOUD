// src/components/admin/settings/SecurityView.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ShieldCheck, KeyRound, AlertCircle } from "lucide-react-native";
import { useTheme } from "../../ThemeContext";
import {
  changePassword,
  toggleTwoFactor,
} from "../../../api/service/settingsApi";
import SettingsHeader from "./SettingsHeader";
import SettingsSection from "./SettingsSection";
import FieldInput from "./FieldInput";
import ToggleRow from "./ToggleRow";
import { Loader } from "../../../hooks/loaderManager";

type Props = { onClose: () => void };

export default function SecurityView({ onClose }: Props) {
  const { colors: C } = useTheme();
  const [twoFactor, setTwoFactor] = useState(false);
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [formErr, setFormErr] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle2FA = async (value: boolean) => {
    const prev = twoFactor;
    setTwoFactor(value); // optimistic
    try {
      await toggleTwoFactor(value);
    } catch {
      setTwoFactor(prev);
      Alert.alert("Couldn't update 2FA", "Please try again.");
    }
  };

//   const handleChangePassword = async () => {
//     const errs: any = {};
//     if (!form.current) errs.current = "Required";
//     if (!form.next) errs.next = "Required";
//     else if (form.next.length < 8) errs.next = "Must be at least 8 characters";
//     if (form.confirm !== form.next) errs.confirm = "Passwords don't match";
//     setFormErr(errs);
//     if (Object.keys(errs).length) return;

//     setSaving(true);
//     setError(null);
//     try {
//       await changePassword({
//         current_password: form.current,
//         new_password: form.next,
//       });
//       setForm({ current: "", next: "", confirm: "" });
//       Alert.alert(
//         "Password updated",
//         "Your password has been changed successfully.",
//       );
//     } catch (e: any) {
//       setError(e?.response?.data?.message ?? "Failed to change password.");
//     } finally {
//       setSaving(false);
//     }
//   };
const handleChangePassword = async () => {
  const errs: any = {};
  if (!form.current) errs.current = "Required";
  if (!form.next) errs.next = "Required";
  else if (form.next.length < 8) errs.next = "Must be at least 8 characters";
  if (form.confirm !== form.next) errs.confirm = "Passwords don't match";
  setFormErr(errs);
  if (Object.keys(errs).length) return;

  setSaving(true);
  setError(null);
  Loader.show();
  try {
    await changePassword({
      current_password: form.current,
      new_password: form.next,
    });
    setForm({ current: "", next: "", confirm: "" });
    Alert.alert(
      "Password updated",
      "Your password has been changed successfully.",
    );
  } catch (e: any) {
    setError(e?.response?.data?.message ?? "Failed to change password.");
  } finally {
    setSaving(false);
    Loader.hide();
  }
};
  return (
    <View style={[styles.screen, { backgroundColor: C.bg }]}>
      <SettingsHeader
        title="Security"
        subtitle="Password and account protection"
        onBack={onClose}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SettingsSection title="Two-Factor Authentication">
          <ToggleRow
            icon={ShieldCheck}
            label="Require a code at sign-in"
            sub="Adds an extra verification step when logging in from a new device"
            value={twoFactor}
            onChange={handleToggle2FA}
          />
        </SettingsSection>

        <Text style={[styles.sectionLabel, { color: C.textMuted }]}>
          Change Password
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: C.surface, borderColor: C.border },
          ]}
        >
          {error && (
            <View
              style={[styles.errorBanner, { backgroundColor: C.dangerLight }]}
            >
              <AlertCircle size={14} color={C.danger} />
              <Text style={[styles.errorText, { color: C.danger }]}>
                {error}
              </Text>
            </View>
          )}
          <FieldInput
            label="Current Password *"
            value={form.current}
            onChangeText={(v) => setForm((f) => ({ ...f, current: v }))}
            placeholder="••••••••"
            secureTextEntry
            error={formErr.current}
          />
          <View style={{ height: 14 }} />
          <FieldInput
            label="New Password *"
            value={form.next}
            onChangeText={(v) => setForm((f) => ({ ...f, next: v }))}
            placeholder="At least 8 characters"
            secureTextEntry
            error={formErr.next}
          />
          <View style={{ height: 14 }} />
          <FieldInput
            label="Confirm New Password *"
            value={form.confirm}
            onChangeText={(v) => setForm((f) => ({ ...f, confirm: v }))}
            placeholder="Re-enter new password"
            secureTextEntry
            error={formErr.confirm}
          />

          <Pressable
            onPress={handleChangePassword}
            disabled={saving}
            style={[
              styles.saveBtn,
              { backgroundColor: C.primary, opacity: saving ? 0.7 : 1 },
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <KeyRound size={14} color="#fff" />
                <Text style={styles.saveBtnText}>Update Password</Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { padding: 16 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 0 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  errorText: { flex: 1, fontSize: 12 },
  saveBtn: {
    marginTop: 18,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  saveBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
});
