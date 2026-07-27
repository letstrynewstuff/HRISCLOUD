// import { useState } from "react";
// import { motion } from "framer-motion";
// import { Upload, Save } from "lucide-react";
// import { SETTINGS_MOCK } from "./SettingsMockData";

// const C = {
//   bg: "#F0F2F8",
//   surface: "#FFFFFF",
//   surfaceAlt: "#F7F8FC",
//   border: "#E4E7F0",
//   primary: "#4F46E5",
//   primaryLight: "#EEF2FF",
//   success: "#10B981",
//   successLight: "#D1FAE5",
//   warning: "#F59E0B",
//   warningLight: "#FEF3C7",
//   danger: "#EF4444",
//   dangerLight: "#FEE2E2",
//   textPrimary: "#0F172A",
//   textSecondary: "#5F6D7E",
//   textMuted: "#94A3B8",
// };

// export default function CompanyProfile() {
//   const [company, setCompany] = useState(SETTINGS_MOCK.company);
//   const [saving, setSaving] = useState(false);
//   const [logoPreview, setLogoPreview] = useState(null);

//   const handleSave = () => {
//     setSaving(true);
//     setTimeout(() => {
//       setSaving(false);
//       alert("Company profile saved successfully!");
//     }, 1200);
//   };

//   const handleLogoUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (ev) => setLogoPreview(ev.target.result);
//       reader.readAsDataURL(file);
//     }
//   };

//   return (
//     <div className="max-w-3xl">
//       <h2 className="text-2xl mb-8" style={{ color: C.textPrimary }}>
//         Company Profile
//       </h2>

//       <div className="space-y-8">
//         {/* Logo Upload */}
//         <div>
//           <label className="block text-sm font-semibold mb-3">
//             Company Logo
//           </label>
//           <div className="flex items-center gap-6">
//             <div
//               className="w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden"
//               style={{ borderColor: C.border }}
//             >
//               {logoPreview || company.logo ? (
//                 <img
//                   src={logoPreview || company.logo}
//                   alt="logo"
//                   className="w-full h-full object-contain"
//                 />
//               ) : (
//                 <Upload size={32} color={C.textMuted} />
//               )}
//             </div>
//             <div>
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleLogoUpload}
//                 className="hidden"
//                 id="logo-upload"
//               />
//               <label
//                 htmlFor="logo-upload"
//                 className="cursor-pointer px-5 py-2.5 rounded-xl text-sm font-semibold border"
//                 style={{ borderColor: C.primary, color: C.primary }}
//               >
//                 Upload New Logo
//               </label>
//               <p className="text-xs text-slate-500 mt-2">
//                 PNG or JPG • Max 2MB
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Company Details */}
//         <div className="grid grid-cols-2 gap-6">
//           <div>
//             <label className="block text-xs font-semibold mb-1.5">
//               Company Name
//             </label>
//             <input
//               value={company.name}
//               onChange={(e) => setCompany({ ...company, name: e.target.value })}
//               className="w-full px-4 py-3 rounded-xl"
//               style={{
//                 background: C.surfaceAlt,
//                 border: `1.5px solid ${C.border}`,
//               }}
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-semibold mb-1.5">
//               RC Number
//             </label>
//             <input
//               value={company.rcNumber}
//               onChange={(e) =>
//                 setCompany({ ...company, rcNumber: e.target.value })
//               }
//               className="w-full px-4 py-3 rounded-xl"
//               style={{
//                 background: C.surfaceAlt,
//                 border: `1.5px solid ${C.border}`,
//               }}
//             />
//           </div>
//         </div>

//         <div>
//           <label className="block text-xs font-semibold mb-1.5">Address</label>
//           <textarea
//             value={company.address}
//             onChange={(e) =>
//               setCompany({ ...company, address: e.target.value })
//             }
//             rows={3}
//             className="w-full px-4 py-3 rounded-xl"
//             style={{
//               background: C.surfaceAlt,
//               border: `1.5px solid ${C.border}`,
//             }}
//           />
//         </div>

//         <div className="grid grid-cols-2 gap-6">
//           <div>
//             <label className="block text-xs font-semibold mb-1.5">
//               Industry
//             </label>
//             <input
//               value={company.industry}
//               onChange={(e) =>
//                 setCompany({ ...company, industry: e.target.value })
//               }
//               className="w-full px-4 py-3 rounded-xl"
//               style={{
//                 background: C.surfaceAlt,
//                 border: `1.5px solid ${C.border}`,
//               }}
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-semibold mb-1.5">
//               Company Size
//             </label>
//             <select
//               value={company.size}
//               onChange={(e) => setCompany({ ...company, size: e.target.value })}
//               className="w-full px-4 py-3 rounded-xl"
//               style={{
//                 background: C.surfaceAlt,
//                 border: `1.5px solid ${C.border}`,
//               }}
//             >
//               <option>1-50 employees</option>
//               <option>51-200 employees</option>
//               <option>201-500 employees</option>
//               <option>501+ employees</option>
//             </select>
//           </div>
//         </div>

//         <motion.button
//           whileHover={{ scale: 1.02 }}
//           onClick={handleSave}
//           disabled={saving}
//           className="w-full py-4 rounded-full text-lg font-semibold text-white flex items-center justify-center gap-2"
//           style={{ background: C.primary }}
//         >
//           {saving ? "Saving..." : "Save Company Profile"}
//         </motion.button>
//       </div>
//     </div>
//   );
// }


// src/admin/settings/CompanyProfile.jsx
import { useState, useEffect } from "react";
import C from "../../styles/colors";
import { motion } from "framer-motion";
import { Upload, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { settingsApi } from "../../api/service/settingsApi";


const SIZES = [
  "1–50 employees",
  "51–200 employees",
  "201–500 employees",
  "501+ employees",
];

export default function CompanyProfile() {
  const [company, setCompany]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [saving,  setSaving]        = useState(false);
  const [logoFile, setLogoFile]     = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [toast,   setToast]         = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    settingsApi.getCompany()
      .then((d) => setCompany(d.company ?? d))
      .catch(() => showToast("Failed to load company profile.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setCompany((p) => ({ ...p, [k]: v }));

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (logoFile) {
        const res = await settingsApi.uploadLogo(logoFile);
        set("logo", res.logoUrl ?? res.logo ?? company.logo);
        setLogoFile(null);
      }
      await settingsApi.updateCompany({
        name:     company.name,
        rcNumber: company.rcNumber,
        address:  company.address,
        industry: company.industry,
        size:     company.size,
        email:    company.email,
        phone:    company.phone,
        website:  company.website,
      });
      showToast("Company profile saved successfully!");
    } catch (err) {
      showToast(err?.response?.data?.message ?? "Failed to save.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin" color={C.primary} />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: C.dangerLight }}>
        <AlertCircle size={16} color={C.danger} />
        <p className="text-sm" style={{ color: C.danger }}>Could not load company data.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl mb-8" style={{ color: C.textPrimary }}>
        Company Profile
      </h2>

      {toast && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6"
          style={{ background: toast.type === "error" ? C.dangerLight : C.successLight,
                   border: `1px solid ${toast.type === "error" ? C.danger : C.success}33` }}>
          {toast.type === "error"
            ? <AlertCircle size={14} color={C.danger} />
            : <CheckCircle2 size={14} color={C.success} />}
          <p className="text-sm font-medium" style={{ color: toast.type === "error" ? C.danger : C.success }}>
            {toast.msg}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Logo */}
        <div className="rounded-2xl p-6" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: C.textMuted }}>Company Logo</p>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden"
              style={{ borderColor: C.border, background: C.surfaceAlt }}>
              {logoPreview || company.logo ? (
                <img src={logoPreview || company.logo} alt="logo" className="w-full h-full object-contain" />
              ) : (
                <Upload size={28} color={C.textMuted} />
              )}
            </div>
            <div>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
              <label htmlFor="logo-upload"
                className="cursor-pointer px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: C.primaryLight, color: C.primary, border: `1px solid ${C.primary}33` }}>
                {logoFile ? "Change Logo" : "Upload Logo"}
              </label>
              {logoFile && (
                <p className="text-xs mt-2 font-medium" style={{ color: C.success }}> {logoFile.name}</p>
              )}
              <p className="text-xs mt-1.5" style={{ color: C.textMuted }}>PNG or JPG · Max 2 MB</p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: C.textMuted }}>Basic Information</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Company Name *", key: "name",     placeholder: "Acme Corp" },
              { label: "RC Number",      key: "rcNumber", placeholder: "RC1234567" },
              { label: "Email",          key: "email",    placeholder: "info@company.com" },
              { label: "Phone",          key: "phone",    placeholder: "+234 800 000 0000" },
              { label: "Website",        key: "website",  placeholder: "https://company.com" },
              { label: "Industry",       key: "industry", placeholder: "Technology" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textSecondary }}>{f.label}</label>
                <input
                  value={company[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }} />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textSecondary }}>Address</label>
            <textarea
              value={company.address ?? ""}
              onChange={(e) => set("address", e.target.value)}
              rows={3}
              placeholder="123 Main Street, Lagos, Nigeria"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }} />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textSecondary }}>Company Size</label>
            <select
              value={company.size ?? ""}
              onChange={(e) => set("size", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }}>
              <option value="">Select size</option>
              {SIZES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          onClick={handleSave} disabled={saving}
          className="w-full py-3.5 rounded-full text-sm font-semibold text-white flex items-center justify-center gap-2"
          style={{ background: C.primary, opacity: saving ? 0.8 : 1 }}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? "Saving..." : "Save Company Profile"}
        </motion.button>
      </div>
    </div>
  );
}