// import { useState } from "react";
// import { motion as Motion, AnimatePresence } from "framer-motion";
// import { NavLink } from "react-router-dom";
// import {
//   Shield,
//   LayoutDashboard,
//   Users,
//   UserPlus,
//   Building2,
//   ClipboardCheck,
//   DollarSign,
//   FileText,
//   Clock,
//   Plane,
//   GraduationCap,
//   BarChart2,
//   Heart,
//   TrendingUp,
//   FolderOpen,
//   Settings,
//   HelpCircle,
//   UserCog,
//   ScrollText,
//   Award,
//   ChevronLeft,
// } from "lucide-react";

// /* ─── Design tokens ─── */
// const T = {
//   sidebar: "#1E1B4B",
//   sidebarMid: "#2D2A6E",
//   sidebarHover: "rgba(79,70,229,0.18)",
//   sidebarActive: "rgba(79,70,229,0.28)",
//   accent: "#4F46E5",
//   accentGlow: "rgba(79,70,229,0.30)",
//   border: "rgba(255,255,255,0.10)",
//   textPrimary: "#FFFFFF",
//   textMuted: "rgba(255,255,255,0.40)",
//   textSub: "rgba(255,255,255,0.65)",
// };

// /* ─── Flat Nav Structure (NO CHILDREN) ─── */
// const NAV_ITEMS = [
//   { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },

//   {
//     label: "Employees",
//     icon: Users,
//     path: "/admin/employeemanagement/admin-employees",
//   },
//   {
//     label: "Departments",
//     icon: Building2,
//     path: "/admin/employeemanagement/admin-departments",
//   },
//   {
//     label: "Job Roles",
//     icon: UserCog,
//     path: "/admin/employeemanagement/admin-jobroles",
//   },
//   {
//     label: "Approvals",
//     icon: ClipboardCheck,
//     path: "/admin/employeemanagement/admin-approvals",
//   },

//   { label: "Payroll", icon: DollarSign, path: "/admin/payroll/admin-payroll" },
//   {
//     label: "Attendance",
//     icon: Clock,
//     path: "/admin/attendance/admin-attendance",
//   },
//   { label: "Leave Management", icon: Plane, path: "/admin/leave-management" },

//   {
//     label: "Training",
//     icon: GraduationCap,
//     path: "/admin/training/admin-training",
//   },
//   {
//     label: "Performance",
//     icon: TrendingUp,
//     path: "/admin/performance/admin-performance",
//   },

//   {
//     label: "Documents",
//     icon: FolderOpen,
//     path: "/admin/documents/admin-documents",
//   },
//   { label: "Benefits", icon: Heart, path: "/admin/benefits/admin-benefits" },
//   { label: "Reports", icon: BarChart2, path: "/admin/reports/admin-reports" },
// ];

// /* ─── Single Nav Item ─── */
// function NavItem({ item, collapsed }) {
//   const Icon = item.icon;

//   return (
//     <NavLink to={item.path}>
//       {({ isActive }) => (
//         <Motion.div
//           whileHover={{ x: collapsed ? 0 : 3 }}
//           whileTap={{ scale: 0.97 }}
//           className={`flex items-center ${
//             collapsed ? "justify-center" : "gap-3"
//           } px-3 py-2.5 rounded-xl text-sm font-medium`}
//           style={{
//             background: isActive ? T.sidebarActive : "transparent",
//             color: isActive ? "#fff" : T.textSub,
//             border: isActive
//               ? `1px solid ${T.accent}33`
//               : "1px solid transparent",
//           }}
//         >
//           <Icon size={15} />
//           {!collapsed && <span>{item.label}</span>}
//         </Motion.div>
//       )}
//     </NavLink>
//   );
// }

// /* ════════════════════ ADMIN SIDEBAR ════════════════════ */
// export default function AdminSideNavbar({
//   sidebarOpen,
//   collapsed,
//   setCollapsed,
//   ADMIN,
// }) {
//   return (
//     <AnimatePresence>
//       {sidebarOpen && (
//         <Motion.aside
//           initial={{ x: -280, opacity: 0 }}
//           animate={{ x: 0, opacity: 1 }}
//           exit={{ x: -280, opacity: 0 }}
//           transition={{ duration: 0.3 }}
//           className="hidden md:flex flex-col shrink-0 h-full z-20 relative"
//           style={{
//             width: collapsed ? 64 : 256,
//             background: T.sidebar,
//             borderRight: `1px solid ${T.border}`,
//             boxShadow: "4px 0 40px rgba(0,0,0,0.3)",
//             transition: "width 0.3s ease",
//           }}
//         >
//           {/* ─── LOGO ─── */}
//           <div className="px-4 pt-6 pb-5 flex items-center gap-3 overflow-hidden">
//             <div
//               className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
//               style={{
//                 background: "linear-gradient(135deg,#6366F1,#4F46E5)",
//                 boxShadow: `0 4px 12px ${T.accentGlow}`,
//               }}
//             >
//               <Shield size={16} color="#fff" />
//             </div>

//             {!collapsed && (
//               <div className="flex flex-col overflow-hidden">
//                 <span className="text-white font-bold text-sm">HRISCloud</span>
//                 <span
//                   className="text-[10px] font-semibold uppercase tracking-widest"
//                   style={{ color: T.accent }}
//                 >
//                   Admin Panel
//                 </span>
//               </div>
//             )}

//             {/* Collapse Toggle */}
//             <Motion.button
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//               onClick={() => setCollapsed((p) => !p)}
//               className="ml-auto w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
//               style={{
//                 background: T.sidebarMid,
//                 border: `1px solid ${T.border}`,
//               }}
//             >
//               <Motion.div
//                 animate={{ rotate: collapsed ? 180 : 0 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <ChevronLeft size={12} color={T.textMuted} />
//               </Motion.div>
//             </Motion.button>
//           </div>

//           {/* ─── NAV ITEMS ─── */}
//           <nav className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
//             {NAV_ITEMS.map((item) => (
//               <NavItem key={item.label} item={item} collapsed={collapsed} />
//             ))}
//           </nav>

//           {/* ─── FOOTER ─── */}
//           <div
//             className="px-2 pb-3"
//             style={{ borderTop: `1px solid ${T.border}` }}
//           >
//             <NavLink to="/admin/settings/admin-settings">
//               {({ isActive }) => (
//                 <Motion.div
//                   whileHover={{ x: collapsed ? 0 : 3 }}
//                   className={`flex items-center ${
//                     collapsed ? "justify-center" : "gap-3"
//                   } px-3 py-2.5 rounded-xl text-sm`}
//                   style={{
//                     color: isActive ? "#fff" : T.textMuted,
//                     background: isActive ? T.sidebarActive : "transparent",
//                   }}
//                 >
//                   <Settings size={14} />
//                   {!collapsed && <span>Settings</span>}
//                 </Motion.div>
//               )}
//             </NavLink>

//             {!collapsed && (
//               <Motion.div
//                 whileHover={{ x: 3 }}
//                 className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer"
//                 style={{ color: T.textMuted }}
//               >
//                 <HelpCircle size={14} />
//                 <span>Help & Support</span>
//               </Motion.div>
//             )}

//             {/* Admin Profile */}
//             <div
//               className="mt-3 rounded-xl p-2.5 flex items-center gap-2.5 overflow-hidden"
//               style={{
//                 background: T.sidebarMid,
//                 border: `1px solid ${T.border}`,
//               }}
//             >
//               <div
//                 className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
//                 style={{
//                   background: "linear-gradient(135deg,#6366F1,#06B6D4)",
//                 }}
//               >
//                 {ADMIN?.initials || "AD"}
//               </div>

//               {!collapsed && (
//                 <div className="min-w-0 flex-1">
//                   <p className="text-white text-xs font-semibold truncate">
//                     {ADMIN?.name || "Admin User"}
//                   </p>
//                   <p
//                     className="text-[10px] truncate"
//                     style={{ color: T.accent }}
//                   >
//                     HR Administrator
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </Motion.aside>
//       )}
//     </AnimatePresence>
//   );
// }


// src/admin/AdminSideNavbar.jsx
// Production-ready — shows real admin name from /auth/me
// Logout button calls onLogout prop (which clears tokens + navigates)
// Imports C from styles/colors for badge colors

import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import C from "../styles/colors";
import {
  Shield, LayoutDashboard, Users, Building2, ClipboardCheck,
  DollarSign, FileText, Clock, Plane, GraduationCap, BarChart2,
  Heart, TrendingUp, FolderOpen, Settings, HelpCircle, UserCog,
  ScrollText, Award, ChevronLeft, LogOut, Bell, Loader2,
} from "lucide-react";

/* ─── Sidebar design tokens ─── */
const T = {
  sidebar:      "#1E1B4B",
  sidebarMid:   "#2D2A6E",
  sidebarHover: "rgba(79,70,229,0.18)",
  sidebarActive:"rgba(79,70,229,0.28)",
  accent:       "#4F46E5",
  accentGlow:   "rgba(79,70,229,0.30)",
  border:       "rgba(255,255,255,0.10)",
  textPrimary:  "#FFFFFF",
  textMuted:    "rgba(255,255,255,0.40)",
  textSub:      "rgba(255,255,255,0.65)",
};

/* ─── Nav items ─── */
const NAV_ITEMS = [
  { label: "Dashboard",      icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Employees",      icon: Users,           path: "/admin/employeemanagement/admin-employees" },
  { label: "Departments",    icon: Building2,       path: "/admin/employeemanagement/admin-departments" },
  { label: "Job Roles",      icon: UserCog,         path: "/admin/employeemanagement/admin-jobroles" },
  { label: "Approvals",      icon: ClipboardCheck,  path: "/admin/employeemanagement/admin-approvals" },
  { label: "Payroll",        icon: DollarSign,      path: "/admin/payroll/admin-payroll" },
  { label: "Attendance",     icon: Clock,           path: "/admin/attendance/admin-attendance" },
  { label: "Leave",          icon: Plane,           path: "/admin/leave-management" },
  { label: "Training",       icon: GraduationCap,   path: "/admin/training/admin-training" },
  { label: "Performance",    icon: TrendingUp,      path: "/admin/performance/admin-performance" },
  { label: "Documents",      icon: FolderOpen,      path: "/admin/documents/admin-documents" },
  { label: "Benefits",       icon: Heart,           path: "/admin/benefits/admin-benefits" },
  { label: "Reports",        icon: BarChart2,       path: "/admin/reports/admin-reports" },
  { label: "Announcements",  icon: Bell,            path: "/admin/announcements" },
];

/* ─── Single nav item ─── */
function NavItem({ item, collapsed, badgeCount }) {
  const Icon = item.icon;
  return (
    <NavLink to={item.path}>
      {({ isActive }) => (
        <Motion.div
          whileHover={{ x: collapsed ? 0 : 3 }}
          whileTap={{ scale: 0.97 }}
          className={`relative flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-xl text-sm font-medium`}
          style={{
            background: isActive ? T.sidebarActive : "transparent",
            color:      isActive ? "#fff" : T.textSub,
            border:     isActive ? `1px solid ${T.accent}33` : "1px solid transparent",
          }}>
          <Icon size={15} />
          {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
          {/* Badge */}
          {badgeCount > 0 && (
            <span className={`${collapsed ? "absolute -top-0.5 -right-0.5" : ""} w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0`}
              style={{ background: C.danger }}>
              {badgeCount > 9 ? "9+" : badgeCount}
            </span>
          )}
        </Motion.div>
      )}
    </NavLink>
  );
}

/* ════════════════════ ADMIN SIDEBAR ════════════════════ */
export default function AdminSideNavbar({
  sidebarOpen,
  collapsed,
  setCollapsed,
  admin,          // real admin object from /auth/me
  ADMIN,          // fallback legacy prop
  pendingApprovals = 0,
  onLogout,       // callback — clears tokens + navigates
}) {
  const [loggingOut, setLoggingOut] = useState(false);

  // Support both real admin object and legacy ADMIN prop
  const adminData = admin ?? ADMIN;
  const initials  = adminData
    ? ((adminData.first_name?.[0] ?? adminData.initials?.[0] ?? "A") +
       (adminData.last_name?.[0]  ?? adminData.initials?.[1] ?? "D")).toUpperCase()
    : "AD";
  const name = adminData
    ? `${adminData.first_name ?? adminData.name ?? "Admin"} ${adminData.last_name ?? ""}`.trim()
    : "Admin User";
  const role = adminData?.role ?? adminData?.job_role_name ?? "HR Administrator";

  const handleLogout = async () => {
    if (!onLogout) return;
    setLoggingOut(true);
    try { await onLogout(); } finally { setLoggingOut(false); }
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <Motion.aside
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="hidden md:flex flex-col shrink-0 h-full z-20 relative"
          style={{
            width: collapsed ? 64 : 256,
            background: T.sidebar,
            borderRight: `1px solid ${T.border}`,
            boxShadow: "4px 0 40px rgba(0,0,0,0.3)",
            transition: "width 0.3s ease",
          }}>

          {/* ─── LOGO ─── */}
          <div className="px-4 pt-6 pb-5 flex items-center gap-3 overflow-hidden" style={{ borderBottom: `1px solid ${T.border}` }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)", boxShadow: `0 4px 12px ${T.accentGlow}` }}>
              <Shield size={16} color="#fff" />
            </div>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-white font-bold text-sm">HRISCloud</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: T.accent }}>Admin Panel</span>
              </div>
            )}
            <Motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setCollapsed(p => !p)}
              className="ml-auto w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: T.sidebarMid, border: `1px solid ${T.border}` }}>
              <Motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronLeft size={12} color={T.textMuted} />
              </Motion.div>
            </Motion.button>
          </div>

          {/* ─── NAV ─── */}
          <nav className="flex-1 overflow-y-auto px-2 pt-3 space-y-0.5 pb-4 scrollbar-thin scrollbar-thumb-white/10">
            {NAV_ITEMS.map(item => (
              <NavItem
                key={item.label}
                item={item}
                collapsed={collapsed}
                badgeCount={item.path.includes("approvals") ? pendingApprovals : 0}
              />
            ))}
          </nav>

          {/* ─── FOOTER ─── */}
          <div className="px-2 pb-3 space-y-0.5" style={{ borderTop: `1px solid ${T.border}`, paddingTop: 8 }}>
            {/* Settings */}
            <NavLink to="/admin/settings/admin-settings">
              {({ isActive }) => (
                <Motion.div whileHover={{ x: collapsed ? 0 : 3 }}
                  className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-xl text-sm`}
                  style={{ color: isActive ? "#fff" : T.textMuted, background: isActive ? T.sidebarActive : "transparent" }}>
                  <Settings size={14} />
                  {!collapsed && <span>Settings</span>}
                </Motion.div>
              )}
            </NavLink>

            {/* Help */}
            {!collapsed && (
              <Motion.div whileHover={{ x: 3 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer"
                style={{ color: T.textMuted }}>
                <HelpCircle size={14} />
                <span>Help & Support</span>
              </Motion.div>
            )}

            {/* Logout */}
            <Motion.button
              whileHover={{ x: collapsed ? 0 : 3, background: "rgba(239,68,68,0.12)" }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              disabled={loggingOut}
              className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-xl text-sm transition-colors`}
              style={{ color: "#EF4444", opacity: loggingOut ? 0.7 : 1 }}>
              {loggingOut
                ? <Loader2 size={14} className="animate-spin" />
                : <LogOut size={14} />}
              {!collapsed && <span>{loggingOut ? "Logging out…" : "Logout"}</span>}
            </Motion.button>

            {/* Admin profile card */}
            <div className="mt-2 rounded-xl p-2.5 flex items-center gap-2.5 overflow-hidden"
              style={{ background: T.sidebarMid, border: `1px solid ${T.border}` }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: "linear-gradient(135deg,#6366F1,#06B6D4)" }}>
                {initials}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs font-semibold truncate">{name}</p>
                  <p className="text-[10px] truncate capitalize" style={{ color: T.accent }}>
                    {role?.replace(/_/g, " ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Motion.aside>
      )}
    </AnimatePresence>
  );
}