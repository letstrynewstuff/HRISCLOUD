// src/components/admin/settings/CompanyProfileView.tsx
// Company-wide configuration: Name, Logo, Address, Time Zone, Currency.
// This is deliberately the *only* company-wide config surface in Settings —
// everything else (deductions, salary bands, leave policies, etc.) lives in
// its own module.

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { Building2, AlertCircle, ImagePlus } from "lucide-react-native";
import { useTheme } from "../../ThemeContext";

import { getCompany, updateCompany } from "../../../api/service/settingsApi";
import SettingsHeader from "./SettingsHeader";
import FieldInput from "./FieldInput";
import FieldSelect from "./FieldSelect";
import { Loader } from "../../../hooks/loaderManager";

const TIMEZONES = [
  { label: "West Africa Time (WAT, UTC+1) — Lagos", value: "Africa/Lagos" },
  { label: "Greenwich Mean Time (GMT, UTC+0)", value: "GMT" },
  { label: "Central Africa Time (CAT, UTC+2)", value: "Africa/Johannesburg" },
  { label: "East Africa Time (EAT, UTC+3)", value: "Africa/Nairobi" },
  { label: "UTC", value: "UTC" },
];

const CURRENCIES = [
  { label: "Nigerian Naira (₦)", value: "NGN" },
  { label: "US Dollar ($)", value: "USD" },
  { label: "British Pound (£)", value: "GBP" },
  { label: "Euro (€)", value: "EUR" },
  { label: "Ghanaian Cedi (₵)", value: "GHS" },
  { label: "Kenyan Shilling (KSh)", value: "KES" },
];

type Props = { onClose: () => void };

export default function CompanyProfileView({ onClose }: Props) {
  const { colors: C } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    logo_url: "",
    address: "",
    timezone: "Africa/Lagos",
    currency: "NGN",
  });
  const [formErr, setFormErr] = useState<any>({});


useEffect(() => {
  (async () => {
    setLoading(true);
    setError(null);
    Loader.show();
    try {
      const res: any = await getCompany();
      const p = res.data ?? res ?? {};
      setForm({
        name: p.name ?? "",
        logo_url: p.logo_url ?? p.logoUrl ?? "",
        address: p.address ?? "",
        timezone: p.timezone ?? "Africa/Lagos",
        currency: p.currency ?? "NGN",
      });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load company profile.");
    } finally {
      setLoading(false);
      Loader.hide();
    }
  })();
}, []);
  const handleSave = async () => {
    const errs: any = {};
    if (!form.name.trim()) errs.name = "Required";
    setFormErr(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    setError(null);
    try {
      await updateCompany({
        name: form.name.trim(),
        address: form.address.trim(),
        timezone: form.timezone,
        currency: form.currency,
      });
      Alert.alert("Saved", "Company profile has been updated.");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to save company profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangeLogo = () => {
    // Wire up expo-image-picker here, then call uploadCompanyLogo(formData)
    // from settingsApi and set form.logo_url to the returned URL.
    Alert.alert(
      "Change Logo",
      "Hook this up to expo-image-picker to select an image, then upload it via settingsApi.uploadCompanyLogo().",
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: C.bg }]}>
      <SettingsHeader
        title="Company Profile"
        subtitle="Company-wide details used across the HRIS"
        onBack={onClose}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoSection}>
            <View
              style={[
                styles.logoWrap,
                { backgroundColor: C.surfaceAlt, borderColor: C.border },
              ]}
            >
              {form.logo_url ? (
                <Image
                  source={{ uri: form.logo_url }}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              ) : (
                <Building2 size={30} color={C.textMuted} />
              )}
            </View>
            <Pressable
              onPress={handleChangeLogo}
              style={[
                styles.changeLogoBtn,
                { borderColor: C.border, backgroundColor: C.surface },
              ]}
            >
              <ImagePlus size={13} color={C.textSecondary} />
              <Text style={[styles.changeLogoText, { color: C.textSecondary }]}>
                {form.logo_url ? "Change Logo" : "Upload Logo"}
              </Text>
            </Pressable>
          </View>

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

          <View
            style={[
              styles.card,
              { backgroundColor: C.surface, borderColor: C.border },
            ]}
          >
            <FieldInput
              label="Company Name *"
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="e.g. BantaHR Ltd"
              error={formErr.name}
            />
            <View style={{ height: 14 }} />
            <FieldInput
              label="Company Address"
              value={form.address}
              onChangeText={(v) => setForm((f) => ({ ...f, address: v }))}
              placeholder="e.g. 12 Admiralty Way, Lekki, Lagos"
              multiline
              numberOfLines={3}
              style={{ minHeight: 78, textAlignVertical: "top" }}
            />
            <View style={{ height: 14 }} />
            <FieldSelect
              label="Time Zone"
              value={form.timezone}
              options={TIMEZONES}
              onChange={(v) => setForm((f) => ({ ...f, timezone: v }))}
            />
            <View style={{ height: 14 }} />
            <FieldSelect
              label="Default Currency"
              value={form.currency}
              options={CURRENCIES}
              onChange={(v) => setForm((f) => ({ ...f, currency: v }))}
            />
          </View>

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[
              styles.saveBtn,
              { backgroundColor: C.primary, opacity: saving ? 0.7 : 1 },
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Save Changes</Text>
            )}
          </Pressable>

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
  logoSection: { alignItems: "center", marginBottom: 20 },
  logoWrap: {
    width: 84,
    height: 84,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  logoImage: { width: "100%", height: "100%" },
  changeLogoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  changeLogoText: { fontSize: 12, fontWeight: "700" },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  errorText: { flex: 1, fontSize: 12 },
  card: { borderWidth: 1, borderRadius: 18, padding: 16 },
  saveBtn: {
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
});
