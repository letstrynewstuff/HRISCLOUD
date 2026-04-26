// import { useState } from "react";
// import SideNavbar from "../components/sideNavbar";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Shield,
//   Bell,
//   Monitor,
//   Users,
//   LogOut,
//   Menu,
//   Search,
//   Eye,
//   EyeOff,
//   CheckCircle2,
// } from "lucide-react";

// const COLORS = {
//   bg: "#F0F2F8",
//   surface: "#FFFFFF",
//   surfaceAlt: "#F7F8FC",
//   border: "#E4E7F0",
//   primary: "#4F46E5",
//   primaryLight: "#EEF2FF",
//   primaryDark: "#3730A3",
//   accent: "#06B6D4",
//   accentLight: "#ECFEFF",
//   success: "#10B981",
//   successLight: "#D1FAE5",
//   warning: "#F59E0B",
//   warningLight: "#FEF3C7",
//   danger: "#EF4444",
//   dangerLight: "#FEE2E2",
//   textPrimary: "#0F172A",
//   textSecondary: "#64748B",
//   textMuted: "#94A3B8",
//   navy: "#1E1B4B",
// };

// /* ─── Dummy Data ─── */
// const EMPLOYEE = {
//   name: "Amara Johnson",
//   role: "Senior Product Designer",
//   department: "Product & Design",
//   avatar: null,
//   initials: "AJ",
//   id: "EMP-2041",
//   streak: 14,
// };

// const SETTINGS_SECTIONS = [
//   "Security",
//   "Notifications",
//   "Appearance",
//   "Profile Visibility",
//   "Sessions",
// ];

// export default function SettingsPage() {
//   const [activeSection, setActiveSection] = useState("Security");
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [searchFocused, setSearchFocused] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [toast, setToast] = useState(null);

//   const showToast = (message) => {
//     setToast(message);
//     setTimeout(() => setToast(null), 2500);
//   };

//   return (
//     <div
//       className="min-h-screen"
//       style={{
//         background: COLORS.bg,
//         color: COLORS.textPrimary,
//         fontFamily: "'DM Sans','Sora',sans-serif",
//       }}
//     >
//       <div className="flex h-screen overflow-hidden">
//         <SideNavbar
//           sidebarOpen={sidebarOpen}
//           COLORS={COLORS}
//           EMPLOYEE={EMPLOYEE}
//         />

//         <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
//           {/* Top Nav - Matching pattern */}
//           <header
//             className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
//             style={{
//               background: "rgba(240,242,248,0.85)",
//               backdropFilter: "blur(12px)",
//               borderBottom: `1px solid ${COLORS.border}`,
//             }}
//           >
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setSidebarOpen((p) => !p)}
//               className="p-2 rounded-xl hidden md:flex"
//               style={{ background: COLORS.surface }}
//             >
//               <Menu size={16} color={COLORS.textSecondary} />
//             </motion.button>

//             <motion.div
//               className="flex-1 max-w-xs relative"
//               animate={{ width: searchFocused ? "320px" : "240px" }}
//               transition={{ duration: 0.3 }}
//             >
//               <Search
//                 size={14}
//                 className="absolute left-3 top-1/2 -translate-y-1/2"
//                 color={COLORS.textMuted}
//               />
//               <input
//                 onFocus={() => setSearchFocused(true)}
//                 onBlur={() => setSearchFocused(false)}
//                 placeholder="Search settings..."
//                 className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
//                 style={{
//                   background: COLORS.surface,
//                   border: `1.5px solid ${searchFocused ? COLORS.primary : COLORS.border}`,
//                 }}
//               />
//             </motion.div>

//             <div className="flex items-center gap-2 ml-auto">
//               <div
//                 className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
//                 style={{
//                   background: "linear-gradient(135deg,#6366F1,#06B6D4)",
//                 }}
//               >
//                 {EMPLOYEE.initials}
//               </div>
//             </div>
//           </header>

//           <main className="flex-1 overflow-y-auto p-5 md:p-7">
//             {/* Hero Header - Consistent with Documents & Training */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="relative rounded-2xl overflow-hidden p-6 md:p-8 mb-8"
//               style={{
//                 background:
//                   "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
//               }}
//             >
//               <div className="flex items-center gap-4">
//                 <div
//                   className="w-14 h-14 rounded-2xl flex items-center justify-center"
//                   style={{ background: "rgba(255,255,255,0.15)" }}
//                 >
//                   <Shield size={28} color="#fff" />
//                 </div>
//                 <div>
//                   <h1
//                     className="text-white text-3xl font-bold"
//                     style={{ fontFamily: "Sora,sans-serif" }}
//                   >
//                     Settings
//                   </h1>
//                   <p className="text-indigo-300 text-sm mt-1">
//                     {EMPLOYEE.name} · {EMPLOYEE.id}
//                   </p>
//                 </div>
//               </div>
//             </motion.div>

//             <div className="flex flex-col lg:flex-row gap-6">
//               {/* Left Sidebar Navigation */}
//               <div
//                 className="lg:w-72 bg-white rounded-2xl border p-5 h-fit"
//                 style={{ borderColor: COLORS.border }}
//               >
//                 <div className="space-y-1">
//                   {SETTINGS_SECTIONS.map((sec) => (
//                     <motion.button
//                       key={sec}
//                       whileHover={{ x: 4 }}
//                       onClick={() => setActiveSection(sec)}
//                       className={`w-full text-left px-5 py-3.5 rounded-2xl flex items-center gap-3 text-sm font-medium transition-all ${
//                         activeSection === sec
//                           ? "bg-primary text-white shadow-sm"
//                           : "hover:bg-surfaceAlt"
//                       }`}
//                     >
//                       {sec === "Security" && <Shield size={18} />}
//                       {sec === "Notifications" && <Bell size={18} />}
//                       {sec === "Appearance" && <Monitor size={18} />}
//                       {sec === "Profile Visibility" && <Users size={18} />}
//                       {sec === "Sessions" && <LogOut size={18} />}
//                       {sec}
//                     </motion.button>
//                   ))}
//                 </div>
//               </div>

//               {/* Content Area */}
//               <div className="flex-1">
//                 <motion.div
//                   key={activeSection}
//                   initial={{ opacity: 0, y: 15 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="bg-white rounded-2xl border p-8 shadow-sm"
//                   style={{ borderColor: COLORS.border }}
//                 >
//                   <h2
//                     className="text-2xl font-bold mb-8"
//                     style={{ fontFamily: "Sora,sans-serif" }}
//                   >
//                     {activeSection}
//                   </h2>

//                   {activeSection === "Security" && (
//                     <div className="space-y-8 max-w-md">
//                       <div>
//                         <h3 className="font-semibold mb-4">Change Password</h3>
//                         <div className="space-y-4">
//                           <input
//                             type="password"
//                             placeholder="Current Password"
//                             className="w-full px-4 py-3 rounded-xl border text-sm"
//                             style={{ borderColor: COLORS.border }}
//                           />
//                           <div className="relative">
//                             <input
//                               type={showPassword ? "text" : "password"}
//                               placeholder="New Password"
//                               className="w-full px-4 py-3 rounded-xl border text-sm"
//                               style={{ borderColor: COLORS.border }}
//                             />
//                             <button
//                               onClick={() => setShowPassword(!showPassword)}
//                               className="absolute right-4 top-3.5"
//                             >
//                               {showPassword ? (
//                                 <EyeOff size={18} />
//                               ) : (
//                                 <Eye size={18} />
//                               )}
//                             </button>
//                           </div>
//                           <input
//                             type="password"
//                             placeholder="Confirm New Password"
//                             className="w-full px-4 py-3 rounded-xl border text-sm"
//                             style={{ borderColor: COLORS.border }}
//                           />
//                         </div>
//                         <motion.button
//                           whileHover={{ scale: 1.02 }}
//                           whileTap={{ scale: 0.98 }}
//                           onClick={() =>
//                             showToast("Password updated successfully")
//                           }
//                           className="mt-6 w-full py-3 rounded-2xl font-semibold text-white"
//                           style={{ background: COLORS.primary }}
//                         >
//                           Update Password
//                         </motion.button>
//                       </div>

//                       <div className="border-t pt-8">
//                         <div className="flex justify-between items-center">
//                           <div>
//                             <p className="font-medium">
//                               Two-Factor Authentication
//                             </p>
//                             <p className="text-sm text-slate-500 mt-1">
//                               Add an extra layer of security
//                             </p>
//                           </div>
//                           <div className="w-11 h-6 rounded-full relative cursor-pointer bg-emerald-500">
//                             <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {activeSection === "Notifications" && (
//                     <div>
//                       <p className="text-sm text-slate-500 mb-6">
//                         Choose how you want to receive notifications
//                       </p>
//                       <div className="space-y-4">
//                         {[
//                           "Request Approved",
//                           "New Announcement",
//                           "Payslip Ready",
//                           "Leave Reminder",
//                           "Training Due",
//                         ].map((item) => (
//                           <div
//                             key={item}
//                             className="flex items-center justify-between py-3 border-b"
//                             style={{ borderColor: COLORS.border }}
//                           >
//                             <p className="font-medium text-sm">{item}</p>
//                             <div className="flex gap-6">
//                               {["Email", "In-App", "SMS"].map((ch) => (
//                                 <label
//                                   key={ch}
//                                   className="flex items-center gap-2 text-xs cursor-pointer"
//                                 >
//                                   <input
//                                     type="checkbox"
//                                     defaultChecked
//                                     className="accent-primary"
//                                   />
//                                   {ch}
//                                 </label>
//                               ))}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                       <motion.button
//                         whileHover={{ scale: 1.02 }}
//                         onClick={() =>
//                           showToast("Notification preferences saved")
//                         }
//                         className="mt-8 px-8 py-3 bg-primary text-white rounded-2xl font-semibold"
//                       >
//                         Save Preferences
//                       </motion.button>
//                     </div>
//                   )}

//                   {/* Placeholder for other sections */}
//                   {(activeSection === "Appearance" ||
//                     activeSection === "Profile Visibility" ||
//                     activeSection === "Sessions") && (
//                     <div className="py-20 text-center">
//                       <div
//                         className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
//                         style={{ background: COLORS.primaryLight }}
//                       >
//                         <Monitor size={28} color={COLORS.primary} />
//                       </div>
//                       <p className="font-semibold text-lg">Coming Soon</p>
//                       <p className="text-sm text-slate-500 mt-2">
//                         This section is under development
//                       </p>
//                     </div>
//                   )}
//                 </motion.div>
//               </div>
//             </div>
//           </main>
//         </div>
//       </div>

//       {/* Toast */}
//       <AnimatePresence>
//         {toast && (
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 30 }}
//             className="fixed bottom-6 right-6 bg-white border rounded-2xl shadow-xl px-6 py-4 flex items-center gap-3 z-50"
//             style={{ borderColor: COLORS.successLight }}
//           >
//             <CheckCircle2 size={20} color={COLORS.success} />
//             <p className="font-medium text-sm">{toast}</p>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }


// src/pages/Settings.jsx
// Connected to backend — Security (change password) and Notifications
// are live. Everything else shows "Coming Soon".

import { useState, useEffect } from "react";
import SideNavbar from "../components/sideNavbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Bell, Monitor, Users, LogOut,
  Menu, Search, Eye, EyeOff, CheckCircle2,
  Loader2, AlertCircle, Save, Lock,
} from "lucide-react";
import { settingsApi } from "../api/service/settingsApi";
import { useAuth }     from "../components/AuthContext";

const C = {
  bg:            "#F0F2F8",
  surface:       "#FFFFFF",
  surfaceAlt:    "#F7F8FC",
  border:        "#E4E7F0",
  primary:       "#4F46E5",
  primaryLight:  "#EEF2FF",
  primaryDark:   "#3730A3",
  accent:        "#06B6D4",
  accentLight:   "#ECFEFF",
  success:       "#10B981",
  successLight:  "#D1FAE5",
  warning:       "#F59E0B",
  warningLight:  "#FEF3C7",
  danger:        "#EF4444",
  dangerLight:   "#FEE2E2",
  textPrimary:   "#0F172A",
  textSecondary: "#64748B",
  textMuted:     "#94A3B8",
  navy:          "#1E1B4B",
};

const SECTIONS = [
  { id: "Security",           icon: Shield,  live: true  },
  { id: "Notifications",      icon: Bell,    live: true  },
  { id: "Appearance",         icon: Monitor, live: false },
  { id: "Profile Visibility", icon: Users,   live: false },
  { id: "Sessions",           icon: LogOut,  live: false },
];

// ─── Notification row ─────────────────────────────────────────
function NotifRow({ label, channels, onChange }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b" style={{ borderColor: C.border }}>
      <p className="text-sm font-medium" style={{ color: C.textPrimary }}>{label}</p>
      <div className="flex gap-6">
        {["email", "inApp", "sms"].map((ch) => (
          <label key={ch} className="flex items-center gap-2 text-xs cursor-pointer select-none"
            style={{ color: C.textSecondary }}>
            <input type="checkbox" checked={channels[ch] ?? false}
              onChange={(e) => onChange(ch, e.target.checked)}
              className="w-4 h-4 rounded accent-indigo-600" />
            {ch === "inApp" ? "In-App" : ch.charAt(0).toUpperCase() + ch.slice(1)}
          </label>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
export default function SettingsPage() {
  const { user } = useAuth();

  const [activeSection,  setActiveSection]  = useState("Security");
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [searchFocused,  setSearchFocused]  = useState(false);
  const [toast,          setToast]          = useState(null);

  // ── Security state ──────────────────────────────────────────
  const [currentPw, setCurrentPw]   = useState("");
  const [newPw,     setNewPw]       = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [showPw,    setShowPw]      = useState(false);
  const [pwLoading, setPwLoading]   = useState(false);
  const [pwError,   setPwError]     = useState("");

  // ── Notification state ──────────────────────────────────────
  const [prefs,        setPrefs]        = useState(null);
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsSaving,  setPrefsSaving]  = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load notification prefs when switching to that tab
  useEffect(() => {
    if (activeSection === "Notifications" && !prefs) {
      setPrefsLoading(true);
      settingsApi.getNotificationPrefs()
        .then((res) => setPrefs(res.preferences))
        .catch(() => showToast("Failed to load notification preferences.", "error"))
        .finally(() => setPrefsLoading(false));
    }
  }, [activeSection]);

  // ── Change password ────────────────────────────────────────
  const handleChangePassword = async () => {
    setPwError("");
    if (!currentPw || !newPw || !confirmPw) {
      setPwError("All fields are required.");
      return;
    }
    if (newPw.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPw)) {
      setPwError("Password must include uppercase, lowercase, and a number.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("New passwords do not match.");
      return;
    }

    setPwLoading(true);
    try {
      const res = await settingsApi.changePassword(currentPw, newPw);
      showToast(res.message ?? "Password changed successfully.");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err) {
      setPwError(err?.response?.data?.message ?? "Failed to change password.");
    } finally {
      setPwLoading(false);
    }
  };

  // ── Save notification prefs ────────────────────────────────
  const handleSavePrefs = async () => {
    if (!prefs) return;
    setPrefsSaving(true);
    try {
      const res = await settingsApi.updateNotificationPrefs(prefs);
      setPrefs(res.preferences);
      showToast("Notification preferences saved.");
    } catch (err) {
      showToast(err?.response?.data?.message ?? "Failed to save preferences.", "error");
    } finally {
      setPrefsSaving(false);
    }
  };

  const updatePref = (eventKey, channel, value) => {
    setPrefs((prev) => ({
      ...prev,
      [eventKey]: { ...(prev?.[eventKey] ?? {}), [channel]: value },
    }));
  };

  const NOTIF_LABELS = {
    requestApproved: "Leave / Request Approved",
    newAnnouncement: "New Announcement",
    payslipReady:    "Payslip Ready",
    leaveReminder:   "Leave Reminder",
    trainingDue:     "Training Due",
    teamMessage:     "Team Chat Message",
  };

  const EMPLOYEE = {
    name:     user ? `${user.firstName} ${user.lastName}` : "Employee",
    initials: user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}` : "??",
    id:       user?.id ?? "",
    role:     user?.role ?? "",
  };

  return (
    <div className="min-h-screen"
      style={{ background: C.bg, color: C.textPrimary, fontFamily: "'DM Sans','Sora',sans-serif" }}>
      <div className="flex h-screen overflow-hidden">
        <SideNavbar sidebarOpen={sidebarOpen} COLORS={C} EMPLOYEE={EMPLOYEE} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top bar */}
          <header className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{ background: "rgba(240,242,248,0.85)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}` }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen((p) => !p)}
              className="p-2 rounded-xl hidden md:flex" style={{ background: C.surface }}>
              <Menu size={16} color={C.textSecondary} />
            </motion.button>

            <motion.div className="flex-1 max-w-xs relative"
              animate={{ width: searchFocused ? "320px" : "240px" }} transition={{ duration: 0.3 }}>
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" color={C.textMuted} />
              <input onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
                placeholder="Search settings..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={{ background: C.surface, border: `1.5px solid ${searchFocused ? C.primary : C.border}` }} />
            </motion.div>

            <div className="flex items-center gap-2 ml-auto">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: "linear-gradient(135deg,#6366F1,#06B6D4)" }}>
                {EMPLOYEE.initials}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-5 md:p-7">
            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl overflow-hidden p-6 md:p-8 mb-8"
              style={{ background: "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)" }}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.15)" }}>
                  <Shield size={28} color="#fff" />
                </div>
                <div>
                  <h1 className="text-white text-3xl font-bold" style={{ fontFamily: "Sora,sans-serif" }}>
                    Settings
                  </h1>
                  <p className="text-indigo-300 text-sm mt-1">
                    {EMPLOYEE.name} · {EMPLOYEE.id}
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left nav */}
              <div className="lg:w-72 bg-white rounded-2xl border p-3 h-fit" style={{ borderColor: C.border }}>
                <div className="space-y-1">
                  {SECTIONS.map(({ id, icon: Icon, live }) => (
                    <motion.button key={id} whileHover={{ x: 4 }}
                      onClick={() => setActiveSection(id)}
                      className="w-full text-left px-4 py-3 rounded-xl flex items-center justify-between gap-3 text-sm font-medium transition-all"
                      style={{
                        background: activeSection === id ? C.primaryLight : "transparent",
                        color:      activeSection === id ? C.primary      : C.textSecondary,
                      }}>
                      <div className="flex items-center gap-3">
                        <Icon size={16} />
                        {id}
                      </div>
                      {!live && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: C.warningLight, color: C.warning }}>
                          SOON
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <motion.div key={activeSection} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm" style={{ borderColor: C.border }}>
                  <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: "Sora,sans-serif" }}>
                    {activeSection}
                  </h2>

                  {/* ── Security ── */}
                  {activeSection === "Security" && (
                    <div className="space-y-8 max-w-md">
                      <div>
                        <div className="flex items-center gap-2 mb-5">
                          <Lock size={16} color={C.primary} />
                          <h3 className="font-semibold" style={{ color: C.textPrimary }}>Change Password</h3>
                        </div>

                        <div className="space-y-4">
                          {/* Current password */}
                          <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textSecondary }}>
                              Current Password
                            </label>
                            <input type="password" value={currentPw}
                              onChange={(e) => { setCurrentPw(e.target.value); setPwError(""); }}
                              placeholder="Enter current password"
                              className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                              style={{ borderColor: C.border, color: C.textPrimary }} />
                          </div>

                          {/* New password */}
                          <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textSecondary }}>
                              New Password
                            </label>
                            <div className="relative">
                              <input type={showPw ? "text" : "password"} value={newPw}
                                onChange={(e) => { setNewPw(e.target.value); setPwError(""); }}
                                placeholder="Minimum 8 characters"
                                className="w-full px-4 py-3 pr-11 rounded-xl border text-sm outline-none"
                                style={{ borderColor: C.border, color: C.textPrimary }} />
                              <button onClick={() => setShowPw((p) => !p)}
                                className="absolute right-3.5 top-3.5">
                                {showPw ? <EyeOff size={17} color={C.textMuted} /> : <Eye size={17} color={C.textMuted} />}
                              </button>
                            </div>
                            {/* Strength hint */}
                            {newPw && (
                              <div className="mt-1.5 flex gap-1">
                                {[
                                  newPw.length >= 8,
                                  /[A-Z]/.test(newPw),
                                  /[a-z]/.test(newPw),
                                  /\d/.test(newPw),
                                ].map((ok, i) => (
                                  <div key={i} className="flex-1 h-1 rounded-full"
                                    style={{ background: ok ? C.success : C.border }} />
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Confirm */}
                          <div>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: C.textSecondary }}>
                              Confirm New Password
                            </label>
                            <input type="password" value={confirmPw}
                              onChange={(e) => { setConfirmPw(e.target.value); setPwError(""); }}
                              placeholder="Re-enter new password"
                              className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                              style={{
                                borderColor: confirmPw && confirmPw !== newPw ? C.danger : C.border,
                                color: C.textPrimary,
                              }} />
                          </div>
                        </div>

                        {/* Error */}
                        {pwError && (
                          <div className="flex items-center gap-2 mt-3 p-3 rounded-xl"
                            style={{ background: C.dangerLight }}>
                            <AlertCircle size={14} color={C.danger} />
                            <p className="text-xs font-medium" style={{ color: C.danger }}>{pwError}</p>
                          </div>
                        )}

                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={handleChangePassword}
                          disabled={pwLoading}
                          className="mt-6 w-full py-3 rounded-2xl font-semibold text-white flex items-center justify-center gap-2"
                          style={{ background: C.primary, opacity: pwLoading ? 0.7 : 1 }}>
                          {pwLoading
                            ? <><Loader2 size={15} className="animate-spin" /> Updating…</>
                            : "Update Password"}
                        </motion.button>
                      </div>

                      {/* 2FA (coming soon) */}
                      <div className="border-t pt-8" style={{ borderColor: C.border }}>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold" style={{ color: C.textPrimary }}>Two-Factor Authentication</p>
                            <p className="text-sm mt-1" style={{ color: C.textMuted }}>
                              Extra layer of security · Coming soon
                            </p>
                          </div>
                          <div className="w-11 h-6 rounded-full relative"
                            style={{ background: C.border, cursor: "not-allowed" }}>
                            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Notifications ── */}
                  {activeSection === "Notifications" && (
                    <div>
                      <p className="text-sm mb-6" style={{ color: C.textMuted }}>
                        Choose how you'd like to receive notifications for each event.
                      </p>

                      {prefsLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 size={24} color={C.primary} className="animate-spin" />
                        </div>
                      ) : prefs ? (
                        <div>
                          {/* Column headers */}
                          <div className="flex items-center justify-between pb-2 mb-1"
                            style={{ borderBottom: `2px solid ${C.border}` }}>
                            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: C.textMuted }}>
                              Event
                            </span>
                            <div className="flex gap-6 text-xs font-bold uppercase tracking-wide" style={{ color: C.textMuted }}>
                              <span className="w-12 text-center">Email</span>
                              <span className="w-12 text-center">In-App</span>
                              <span className="w-10 text-center">SMS</span>
                            </div>
                          </div>

                          {Object.entries(NOTIF_LABELS).map(([key, label]) => (
                            <NotifRow
                              key={key}
                              label={label}
                              channels={prefs[key] ?? { email: false, inApp: false, sms: false }}
                              onChange={(ch, val) => updatePref(key, ch, val)}
                            />
                          ))}

                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={handleSavePrefs}
                            disabled={prefsSaving}
                            className="mt-7 flex items-center gap-2 px-7 py-3 rounded-2xl font-semibold text-white"
                            style={{ background: C.primary, opacity: prefsSaving ? 0.7 : 1 }}>
                            {prefsSaving
                              ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                              : <><Save size={14} /> Save Preferences</>}
                          </motion.button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-4 rounded-xl" style={{ background: C.dangerLight }}>
                          <AlertCircle size={15} color={C.danger} />
                          <p className="text-sm" style={{ color: C.danger }}>
                            Failed to load preferences. Please reload the page.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Coming Soon ── */}
                  {!["Security", "Notifications"].includes(activeSection) && (
                    <div className="py-20 text-center">
                      <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: C.primaryLight }}>
                        <Monitor size={28} color={C.primary} />
                      </div>
                      <p className="font-semibold text-lg" style={{ color: C.textPrimary }}>Coming Soon</p>
                      <p className="text-sm mt-2" style={{ color: C.textMuted }}>
                        We're building this section. Check back soon.
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 right-6 bg-white border rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3 z-50"
            style={{ borderColor: toast.type === "error" ? C.danger : C.successLight }}>
            {toast.type === "error"
              ? <AlertCircle size={18} color={C.danger} />
              : <CheckCircle2 size={18} color={C.success} />}
            <p className="font-medium text-sm" style={{ color: C.textPrimary }}>{toast.msg}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}