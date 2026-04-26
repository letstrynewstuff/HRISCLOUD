import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Save } from "lucide-react";
import { SETTINGS_MOCK } from "./SettingsMockData";

const C = {
  bg: "#F0F2F8",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F8FC",
  border: "#E4E7F0",
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
};

export default function CompanyProfile() {
  const [company, setCompany] = useState(SETTINGS_MOCK.company);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("Company profile saved successfully!");
    }, 1200);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold mb-8" style={{ color: C.textPrimary }}>
        Company Profile
      </h2>

      <div className="space-y-8">
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-semibold mb-3">
            Company Logo
          </label>
          <div className="flex items-center gap-6">
            <div
              className="w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden"
              style={{ borderColor: C.border }}
            >
              {logoPreview || company.logo ? (
                <img
                  src={logoPreview || company.logo}
                  alt="logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <Upload size={32} color={C.textMuted} />
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="cursor-pointer px-5 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ borderColor: C.primary, color: C.primary }}
              >
                Upload New Logo
              </label>
              <p className="text-xs text-slate-500 mt-2">
                PNG or JPG • Max 2MB
              </p>
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Company Name
            </label>
            <input
              value={company.name}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              RC Number
            </label>
            <input
              value={company.rcNumber}
              onChange={(e) =>
                setCompany({ ...company, rcNumber: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5">Address</label>
          <textarea
            value={company.address}
            onChange={(e) =>
              setCompany({ ...company, address: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-3 rounded-xl"
            style={{
              background: C.surfaceAlt,
              border: `1.5px solid ${C.border}`,
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Industry
            </label>
            <input
              value={company.industry}
              onChange={(e) =>
                setCompany({ ...company, industry: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
              }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              Company Size
            </label>
            <select
              value={company.size}
              onChange={(e) => setCompany({ ...company, size: e.target.value })}
              className="w-full px-4 py-3 rounded-xl"
              style={{
                background: C.surfaceAlt,
                border: `1.5px solid ${C.border}`,
              }}
            >
              <option>1-50 employees</option>
              <option>51-200 employees</option>
              <option>201-500 employees</option>
              <option>501+ employees</option>
            </select>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-2xl text-lg font-semibold text-white flex items-center justify-center gap-2"
          style={{ background: C.primary }}
        >
          {saving ? "Saving..." : "Save Company Profile"}
        </motion.button>
      </div>
    </div>
  );
}
