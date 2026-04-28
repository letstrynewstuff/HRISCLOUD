// src/superadmin/SuperPlatformConfiguration.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  ToggleLeft,
  Globe,
  Mail,
  Key,
  Gauge,
  Save,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sliders,
} from "lucide-react";
import SuperAdminLayout from "./SuperAdminLayout";
import C from "../styles/colors";
import {
  getPlatformSettingsApi,
  updatePlatformSettingsApi,
} from "../api/service/superAdminApi";

// ── Default/fallback state ────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  modules: {
    attendance: true,
    payroll: true,
    chat: false,
  },
  global: {
    appName: "WorkBase",
    timezone: "Africa/Lagos",
    supportEmail: "support@workbase.io",
    smtpHost: "smtp.sendgrid.net",
    smtpPort: "587",
    smtpUser: "apikey",
  },
  api: {
    publicKey: "pk_live_••••••••••••••••••••••••",
    secretKey: "sk_live_••••••••••••••••••••••••",
    rateLimit: 500,
    rateLimitWindow: 60,
  },
};

const TIMEZONES = [
  "Africa/Lagos",
  "Africa/Nairobi",
  "Africa/Johannesburg",
  "Europe/London",
  "America/New_York",
  "Asia/Dubai",
  "UTC",
];

// ── Helper components ─────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

function SectionCard({ title, icon: Icon, delay, children }) {
  return (
    <motion.div
      {...fadeUp(delay)}
      className="rounded-2xl p-6"
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        boxShadow: "0 2px 12px rgba(15,23,42,0.04)",
      }}
    >
      <div
        className="flex items-center gap-2.5 mb-5 pb-4"
        style={{ borderBottom: `1px solid ${C.border}` }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${C.primary}15` }}
        >
          <Icon size={15} color={C.primary} />
        </div>
        <span
          className="font-semibold text-sm"
          style={{ color: C.textPrimary, fontFamily: "Sora, sans-serif" }}
        >
          {title}
        </span>
      </div>
      {children}
    </motion.div>
  );
}

function Toggle({ enabled, onToggle, label, description }) {
  return (
    <div
      className="flex items-center justify-between py-3"
      style={{ borderBottom: `1px solid ${C.border}` }}
    >
      <div>
        <div className="text-sm font-medium" style={{ color: C.textPrimary }}>
          {label}
        </div>
        {description && (
          <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>
            {description}
          </div>
        )}
      </div>
      <motion.button
        onClick={onToggle}
        className="relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0"
        style={{ background: enabled ? C.primary : C.border }}
        whileTap={{ scale: 0.93 }}
      >
        <motion.div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
          animate={{ x: enabled ? "22px" : "2px" }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      </motion.button>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  hint,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      <label
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: C.textSecondary }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{
          background: C.surfaceAlt,
          border: `1.5px solid ${focused ? C.primary : C.border}`,
          color: C.textPrimary,
          boxShadow: focused ? `0 0 0 3px ${C.primaryLight}` : "none",
        }}
      />
      {hint && (
        <p className="text-[10px]" style={{ color: C.textMuted }}>
          {hint}
        </p>
      )}
    </div>
  );
}

function FormSelect({ label, value, onChange, options }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      <label
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: C.textSecondary }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all appearance-none"
        style={{
          background: C.surfaceAlt,
          border: `1.5px solid ${focused ? C.primary : C.border}`,
          color: C.textPrimary,
          boxShadow: focused ? `0 0 0 3px ${C.primaryLight}` : "none",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);
  const isSuccess = type === "success";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
      style={{
        background: isSuccess ? C.navy : C.danger,
        color: "#fff",
        minWidth: 280,
      }}
    >
      {isSuccess ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      <span className="text-sm font-medium">{message}</span>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function SuperPlatformConfiguration() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [revealKey, setRevealKey] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await getPlatformSettingsApi();
      const d = res.data?.data ?? res.data;
      if (d) setSettings({ ...DEFAULT_SETTINGS, ...d });
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateModule = (key) => {
    setSettings((prev) => ({
      ...prev,
      modules: { ...prev.modules, [key]: !prev.modules[key] },
    }));
  };

  const updateGlobal = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      global: { ...prev.global, [key]: value },
    }));
  };

  const updateApi = (key, value) => {
    setSettings((prev) => ({ ...prev, api: { ...prev.api, [key]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePlatformSettingsApi(settings);
      setToast({ message: "Settings saved successfully!", type: "success" });
    } catch {
      setToast({
        message: "Failed to save settings. Please retry.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SuperAdminLayout
      title="Platform Configuration"
      subtitle="Manage platform-wide settings"
      loading={loading}
      onRefresh={fetchSettings}
    >
      <div className="p-6 space-y-5 max-w-5xl">
        {/* Feature Toggles */}
        <SectionCard title="Feature Toggles" icon={ToggleLeft} delay={0.05}>
          <Toggle
            label="Attendance Module"
            description="Enable time & attendance tracking for all companies"
            enabled={settings.modules.attendance}
            onToggle={() => updateModule("attendance")}
          />
          <Toggle
            label="Payroll Module"
            description="Allow companies to process and run payroll"
            enabled={settings.modules.payroll}
            onToggle={() => updateModule("payroll")}
          />
          <div style={{ borderBottom: "none" }}>
            <Toggle
              label="Chat Module"
              description="Enable in-app messaging and communication tools"
              enabled={settings.modules.chat}
              onToggle={() => updateModule("chat")}
            />
          </div>
        </SectionCard>

        {/* Global Settings */}
        <SectionCard title="Global Settings" icon={Globe} delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="App Name"
              value={settings.global.appName}
              onChange={(v) => updateGlobal("appName", v)}
              placeholder="e.g. WorkBase"
            />
            <FormSelect
              label="Default Timezone"
              value={settings.global.timezone}
              onChange={(v) => updateGlobal("timezone", v)}
              options={TIMEZONES}
            />
          </div>

          <div
            className="mt-5 pt-4"
            style={{ borderTop: `1px solid ${C.border}` }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Mail size={13} color={C.textMuted} />
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: C.textSecondary }}
              >
                Email / SMTP Settings
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <FormInput
                  label="Support Email"
                  value={settings.global.supportEmail}
                  onChange={(v) => updateGlobal("supportEmail", v)}
                  type="email"
                  placeholder="support@yourapp.io"
                />
              </div>
              <FormInput
                label="SMTP Host"
                value={settings.global.smtpHost}
                onChange={(v) => updateGlobal("smtpHost", v)}
                placeholder="smtp.sendgrid.net"
              />
              <FormInput
                label="SMTP Port"
                value={settings.global.smtpPort}
                onChange={(v) => updateGlobal("smtpPort", v)}
                placeholder="587"
              />
              <FormInput
                label="SMTP Username"
                value={settings.global.smtpUser}
                onChange={(v) => updateGlobal("smtpUser", v)}
                placeholder="apikey"
              />
            </div>
          </div>
        </SectionCard>

        {/* API Settings */}
        <SectionCard title="API Settings" icon={Key} delay={0.15}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: C.textSecondary }}
              >
                Public API Key
              </label>
              <div
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono"
                style={{
                  background: C.surfaceAlt,
                  border: `1.5px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              >
                {settings.api.publicKey}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: C.textSecondary }}
              >
                Secret API Key
              </label>
              <div className="relative">
                <div
                  className="w-full px-3.5 py-2.5 pr-20 rounded-xl text-sm font-mono"
                  style={{
                    background: C.surfaceAlt,
                    border: `1.5px solid ${C.border}`,
                    color: C.textPrimary,
                  }}
                >
                  {revealKey
                    ? settings.api.secretKey
                    : "sk_live_••••••••••••••••••••••••"}
                </div>
                <button
                  onClick={() => setRevealKey((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold px-2 py-1 rounded-lg"
                  style={{ background: C.primaryLight, color: C.primary }}
                >
                  {revealKey ? "HIDE" : "REVEAL"}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2 mb-4">
              <Gauge size={13} color={C.textMuted} />
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: C.textSecondary }}
              >
                Rate Limiting
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Max Requests per Window"
                value={settings.api.rateLimit}
                onChange={(v) => updateApi("rateLimit", v)}
                type="number"
                hint="Maximum API calls allowed per time window"
              />
              <FormInput
                label="Window Duration (seconds)"
                value={settings.api.rateLimitWindow}
                onChange={(v) => updateApi("rateLimitWindow", v)}
                type="number"
                hint="Time window for rate limit in seconds"
              />
            </div>
          </div>
        </SectionCard>

        {/* Save Button */}
        <motion.div {...fadeUp(0.2)} className="flex justify-end pb-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2.5 px-7 py-3 rounded-xl text-sm font-semibold text-white"
            style={{
              background: saving
                ? C.textMuted
                : `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
              boxShadow: saving ? "none" : `0 4px 20px ${C.navyGlow}`,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            <Save size={15} />
            {saving ? "Saving…" : "Save Configuration"}
          </motion.button>
        </motion.div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </SuperAdminLayout>
  );
}
