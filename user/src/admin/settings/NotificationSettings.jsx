// import { useState } from "react";
// import { motion } from "framer-motion";

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
//   textSecondary: "#64748B",
//   textMuted: "#94A3B8",
// };

// const notificationTypes = [
//   "Payroll Processed",
//   "Leave Request Approved",
//   "New Employee Onboarded",
//   "Performance Review Due",
//   "Document Expiring",
//   "Employee Birthday",
// ];

// export default function NotificationSettings() {
//   const [preferences, setPreferences] = useState({
//     email: true,
//     inApp: true,
//     sms: false,
//   });

//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-8">Notification Settings</h2>

//       <div
//         className="rounded-2xl border p-8"
//         style={{ background: C.surface, borderColor: C.border }}
//       >
//         <table className="w-full">
//           <thead>
//             <tr style={{ background: C.surfaceAlt }}>
//               <th className="px-6 py-4 text-left">Notification Type</th>
//               <th className="px-6 py-4 text-center">Email</th>
//               <th className="px-6 py-4 text-center">In-App</th>
//               <th className="px-6 py-4 text-center">SMS</th>
//             </tr>
//           </thead>
//           <tbody>
//             {notificationTypes.map((type, i) => (
//               <tr
//                 key={i}
//                 className="border-b"
//                 style={{ borderColor: C.border }}
//               >
//                 <td className="px-6 py-5 font-medium">{type}</td>
//                 <td className="px-6 py-5 text-center">
//                   <input
//                     type="checkbox"
//                     defaultChecked
//                     className="accent-primary"
//                   />
//                 </td>
//                 <td className="px-6 py-5 text-center">
//                   <input
//                     type="checkbox"
//                     defaultChecked
//                     className="accent-primary"
//                   />
//                 </td>
//                 <td className="px-6 py-5 text-center">
//                   <input type="checkbox" className="accent-primary" />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }


// src/admin/settings/NotificationSettings.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, CheckCircle2, Save } from "lucide-react";
import { settingsApi } from "../../api/service/settingsApi";

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

// Fallback list if API returns empty/no preferences
const DEFAULT_PREFS = [
  { key: "payroll_processed",        label: "Payroll Processed",          email: true,  inApp: true,  sms: false },
  { key: "leave_approved",           label: "Leave Request Approved",      email: true,  inApp: true,  sms: false },
  { key: "new_employee",             label: "New Employee Onboarded",      email: true,  inApp: true,  sms: false },
  { key: "performance_review_due",   label: "Performance Review Due",      email: true,  inApp: true,  sms: false },
  { key: "document_expiring",        label: "Document Expiring",           email: true,  inApp: true,  sms: false },
  { key: "employee_birthday",        label: "Employee Birthday",           email: false, inApp: true,  sms: false },
  { key: "appraisal_submitted",      label: "Appraisal Submitted",         email: true,  inApp: true,  sms: false },
  { key: "attendance_anomaly",       label: "Attendance Anomaly Detected", email: true,  inApp: true,  sms: false },
];

function Toggle({ checked, onChange }) {
  return (
    <div onClick={onChange}
      className="w-9 h-5 rounded-full cursor-pointer transition-colors relative mx-auto shrink-0"
      style={{ background: checked ? C.primary : C.border }}>
      <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
        animate={{ left: checked ? "calc(100% - 18px)" : "2px" }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }} />
    </div>
  );
}

export default function NotificationSettings() {
  const [prefs,   setPrefs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);
  const [toast,   setToast]   = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    settingsApi.getNotificationPrefs()
      .then((d) => {
        const list = d.preferences ?? d.data ?? d ?? [];
        setPrefs(Array.isArray(list) && list.length ? list : DEFAULT_PREFS);
      })
      .catch(() => {
        setPrefs(DEFAULT_PREFS); // graceful fallback
      })
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key, channel) =>
    setPrefs((p) => p.map((pref) => pref.key === key ? { ...pref, [channel]: !pref[channel] } : pref));

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.updateNotificationPrefs(prefs);
      showToast("Notification preferences saved.");
    } catch (err) {
      showToast(err?.response?.data?.message ?? "Failed to save.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={26} className="animate-spin" color={C.primary} />
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}>
        Notification Settings
      </h2>

      {toast && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
          style={{ background: toast.type === "error" ? C.dangerLight : C.successLight,
                   border: `1px solid ${toast.type === "error" ? C.danger : C.success}33` }}>
          {toast.type === "error" ? <AlertCircle size={14} color={C.danger} /> : <CheckCircle2 size={14} color={C.success} />}
          <p className="text-sm" style={{ color: toast.type === "error" ? C.danger : C.success }}>{toast.msg}</p>
        </div>
      )}

      <div className="rounded-2xl border overflow-hidden mb-5" style={{ background: C.surface, borderColor: C.border }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: C.surfaceAlt }}>
              {["Notification Type", "Email", "In-App", "SMS"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide"
                  style={{ color: C.textMuted, textAlign: h === "Notification Type" ? "left" : "center" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {prefs.map((pref, i) => (
              <tr key={pref.key ?? i} style={{ borderBottom: `1px solid ${C.border}` }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceAlt)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <td className="px-5 py-4 text-sm font-medium" style={{ color: C.textPrimary }}>
                  {pref.label}
                </td>
                <td className="px-5 py-4 text-center">
                  <Toggle checked={!!pref.email} onChange={() => toggle(pref.key, "email")} />
                </td>
                <td className="px-5 py-4 text-center">
                  <Toggle checked={!!pref.inApp} onChange={() => toggle(pref.key, "inApp")} />
                </td>
                <td className="px-5 py-4 text-center">
                  <Toggle checked={!!pref.sms} onChange={() => toggle(pref.key, "sms")} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
        style={{ background: C.primary, opacity: saving ? 0.8 : 1 }}>
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {saving ? "Saving..." : "Save Preferences"}
      </motion.button>
    </div>
  );
}