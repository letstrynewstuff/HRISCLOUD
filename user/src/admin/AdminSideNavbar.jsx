// // src/admin/AdminSideNavbar.jsx

// import { useState } from "react";
// import { motion as Motion, AnimatePresence } from "framer-motion";
// import { NavLink } from "react-router-dom";
// import {
//   Shield,
//   LayoutDashboard,
//   Users,
//   Building2,
//   ClipboardCheck,
//   DollarSign,
//   Clock,
//   Plane,
//   GraduationCap,
//   BarChart2,
//   Heart,
//   TrendingUp,
//   FolderOpen,
//   Settings,
//   UserCog,
//   ChevronLeft,
//   LogOut,
//   Bell,
//   Loader2,
//   X,
// } from "lucide-react";

// /* ─── Theme ─── */
// const T = {
//   sidebar: "#1E1B4B",
//   sidebarMid: "#2D2A6E",
//   sidebarHover: "rgba(79,70,229,0.18)",
//   sidebarActive: "rgba(79,70,229,0.28)",
//   accent: "#4F46E5",
//   border: "rgba(255,255,255,0.10)",
//   textPrimary: "#FFFFFF",
//   textMuted: "rgba(255,255,255,0.40)",
// };

// /* ─── Nav Items ─── */
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
//   { label: "Leave", icon: Plane, path: "/admin/leave-management" },
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
//   { label: "Announcements", icon: Bell, path: "/admin/announcements" },
// ];

// /* ─── Safe NavItem (fallback built-in) ─── */
// function NavItem({ item, collapsed, badgeCount = 0 }) {
//   if (!item) return null;

//   const Icon = item.icon || LayoutDashboard;
//   const path = item.path || "/";

//   return (
//     <NavLink to={path}>
//       {({ isActive }) => (
//         <div
//           className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-xl text-sm relative`}
//           style={{
//             color: isActive ? "#fff" : T.textMuted,
//             background: isActive ? T.sidebarActive : "transparent",
//           }}
//         >
//           <Icon size={16} />

//           {!collapsed && <span>{item.label}</span>}

//           {!collapsed && badgeCount > 0 && (
//             <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white">
//               {badgeCount}
//             </span>
//           )}
//         </div>
//       )}
//     </NavLink>
//   );
// }

// /* ─── Main Component ─── */
// export default function AdminSideNavbar({
//   sidebarOpen = false,
//   setSidebarOpen,
//   collapsed = false,
//   setCollapsed,
//   admin,
//   ADMIN,
//   pendingApprovals = 0,
//   onLogout,
// }) {
//   const [loggingOut, setLoggingOut] = useState(false);

//   /* ─── Safe Admin Data ─── */
//   const adminData =
//     typeof admin === "object" && admin !== null
//       ? admin
//       : typeof ADMIN === "object" && ADMIN !== null
//         ? ADMIN
//         : {};

//   const initials = (
//     (adminData.first_name?.[0] ?? adminData.initials?.[0] ?? "A") +
//     (adminData.last_name?.[0] ?? adminData.initials?.[1] ?? "D")
//   ).toUpperCase();

//   const name = `${adminData.first_name ?? adminData.name ?? "Admin"} ${
//     adminData.last_name ?? ""
//   }`.trim();

//   const role = adminData.role ?? adminData.job_role_name ?? "HR Administrator";

//   /* ─── Logout ─── */
//   const handleLogout = async () => {
//     if (!onLogout) return;

//     setLoggingOut(true);
//     try {
//       await onLogout();
//       setSidebarOpen?.(false);
//     } catch (err) {
//       console.error("Logout failed:", err);
//     } finally {
//       setLoggingOut(false);
//     }
//   };

//   return (
//     <AnimatePresence>
//       {sidebarOpen && (
//         <Motion.aside
//           key="admin-sidebar"
//           initial={{ x: -280, opacity: 0 }}
//           animate={{ x: 0, opacity: 1 }}
//           exit={{ x: -280, opacity: 0 }}
//           transition={{ duration: 0.3 }}
//           className="flex flex-col h-full fixed inset-y-0 left-0 z-50 md:relative"
//           style={{
//             width: collapsed ? 64 : 256,
//             background: T.sidebar,
//             borderRight: `1px solid ${T.border}`,
//             transition: "width 0.3s ease",
//           }}
//         >
//           {/* ─── HEADER ─── */}
//           <div className="px-4 pt-6 pb-5 flex items-center gap-3">
//             <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-600">
//               <Shield size={16} color="#fff" />
//             </div>

//             {!collapsed && (
//               <div>
//                 <p className="text-white font-bold text-sm">HRISCloud</p>
//                 <p className="text-[10px] text-indigo-400 uppercase">
//                   Admin Panel
//                 </p>
//               </div>
//             )}

//             {/* Mobile Close */}
//             <button
//               onClick={() => setSidebarOpen?.(false)}
//               className="ml-auto md:hidden text-white/40"
//             >
//               <X size={20} />
//             </button>

//             {/* Collapse */}
//             <button
//               onClick={() => setCollapsed?.((p) => !p)}
//               className="ml-auto hidden md:flex"
//             >
//               <Motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
//                 <ChevronLeft size={14} color="white" />
//               </Motion.div>
//             </button>
//           </div>

//           {/* ─── NAV ─── */}
//           <nav className="flex-1 overflow-y-auto px-2 space-y-1">
//             {NAV_ITEMS.map((item, i) => (
//               <div
//                 key={item.label || i}
//                 onClick={() => setSidebarOpen?.(false)}
//               >
//                 <NavItem
//                   item={item}
//                   collapsed={collapsed}
//                   badgeCount={
//                     (item.path || "").includes("approvals")
//                       ? pendingApprovals
//                       : 0
//                   }
//                 />
//               </div>
//             ))}
//           </nav>

//           {/* ─── FOOTER ─── */}
//           <div className="p-2 border-t border-white/10 space-y-1">
//             <NavLink to="/admin/settings/admin-settings">
//               {({ isActive }) => (
//                 <div
//                   className={`flex items-center ${
//                     collapsed ? "justify-center" : "gap-3"
//                   } px-3 py-2 rounded-xl`}
//                   style={{
//                     color: isActive ? "#fff" : T.textMuted,
//                     background: isActive ? T.sidebarActive : "transparent",
//                   }}
//                 >
//                   <Settings size={16} />
//                   {!collapsed && "Settings"}
//                 </div>
//               )}
//             </NavLink>

//             {/* Logout */}
//             <button
//               onClick={handleLogout}
//               className={`w-full flex items-center ${
//                 collapsed ? "justify-center" : "gap-3"
//               } px-3 py-2 rounded-xl text-red-400`}
//             >
//               {loggingOut ? (
//                 <Loader2 className="animate-spin" size={16} />
//               ) : (
//                 <LogOut size={16} />
//               )}
//               {!collapsed && (loggingOut ? "Logging out..." : "Logout")}
//             </button>

//             {/* Profile */}
//             <div className="mt-2 flex items-center gap-2 bg-[#2D2A6E] p-2 rounded-xl">
//               <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
//                 {initials}
//               </div>

//               {!collapsed && (
//                 <div className="text-xs text-white">
//                   <p className="font-semibold truncate">{name}</p>
//                   <p className="text-indigo-400 truncate">
//                     {String(role).replace(/_/g, " ")}
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

import { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import { useAuth } from "../components/AuthContext"; 

import {
  Shield,
  LayoutDashboard,
  Users,
  Building2,
  ClipboardCheck,
  DollarSign,
  Clock,
  Plane,
  GraduationCap,
  BarChart2,
  Heart,
  TrendingUp,
  FolderOpen,
  Settings,
  UserCog,
  ChevronLeft,
  LogOut,
  Bell,
  Loader2,
  X,
} from "lucide-react";

/* ─── Theme ─── */
const T = {
  sidebar: "#1E1B4B",
  sidebarActive: "rgba(79,70,229,0.28)",
  border: "rgba(255,255,255,0.10)",
  textMuted: "rgba(255,255,255,0.40)",
};

/* ─── Nav Items ─── */
const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Employees", icon: Users, path: "/admin/employeemanagement/admin-employees" },
  { label: "Departments", icon: Building2, path: "/admin/employeemanagement/admin-departments" },
  { label: "Job Roles", icon: UserCog, path: "/admin/employeemanagement/admin-jobroles" },
  { label: "Approvals", icon: ClipboardCheck, path: "/admin/employeemanagement/admin-approvals" },
  { label: "Payroll", icon: DollarSign, path: "/admin/payroll/admin-payroll" },
  { label: "Attendance", icon: Clock, path: "/admin/attendance/admin-attendance" },
  { label: "Leave", icon: Plane, path: "/admin/leave-management" },
  { label: "Training", icon: GraduationCap, path: "/admin/training/admin-training" },
  { label: "Performance", icon: TrendingUp, path: "/admin/performance/admin-performance" },
  { label: "Documents", icon: FolderOpen, path: "/admin/documents/admin-documents" },
  { label: "Benefits", icon: Heart, path: "/admin/benefits/admin-benefits" },
  { label: "Reports", icon: BarChart2, path: "/admin/reports/admin-reports" },
  { label: "Announcements", icon: Bell, path: "/admin/announcements" },
];

/* ─── Nav Item ─── */
function NavItem({ item, collapsed, badgeCount = 0, onClick }) {
  const Icon = item.icon;

  return (
    <NavLink to={item.path} onClick={onClick}>
      {({ isActive }) => (
        <div
          className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-xl text-sm`}
          style={{
            color: isActive ? "#fff" : T.textMuted,
            background: isActive ? T.sidebarActive : "transparent",
          }}
        >
          <Icon size={16} />

          {!collapsed && <span>{item.label}</span>}

          {!collapsed && badgeCount > 0 && (
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white">
              {badgeCount}
            </span>
          )}
        </div>
      )}
    </NavLink>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function AdminSideNavbar({
  sidebarOpen = false,
  setSidebarOpen,
  collapsed = false,
  setCollapsed,
  pendingApprovals = 0,
}) {
  const { user, logout, loading } = useAuth(); // ✅ REAL BACKEND DATA
  const [loggingOut, setLoggingOut] = useState(false);

  /* ─── ADMIN DATA FROM BACKEND ─── */
  const admin = user ?? {};

  const firstName = admin.first_name || admin.firstName || "";
  const lastName = admin.last_name || admin.lastName || "";

  const name =
    `${firstName} ${lastName}`.trim() || admin.email || "Admin";

  const initials =
    (firstName[0] || "A") + (lastName[0] || "D");

  const role =
    admin.role ||
    admin.job_role_name ||
    "Administrator";

  /* ─── LOGOUT ─── */
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      setSidebarOpen?.(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <Motion.aside
          initial={{ x: -280 }}
          animate={{ x: 0 }}
          exit={{ x: -280 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col h-full fixed inset-y-0 left-0 z-50 md:relative"
          style={{
            width: collapsed ? 64 : 256,
            background: T.sidebar,
            borderRight: `1px solid ${T.border}`,
          }}
        >
          {/* ─── HEADER ─── */}
          <div className="px-4 pt-6 pb-5 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Shield size={16} color="#fff" />
            </div>

            {!collapsed && (
              <div>
                <p className="text-white font-bold text-sm">HRISCloud</p>
                <p className="text-xs text-indigo-400">Admin Panel</p>
              </div>
            )}

            <button
              onClick={() => setSidebarOpen?.(false)}
              className="ml-auto md:hidden text-white/40"
            >
              <X size={20} />
            </button>

            <button
              onClick={() => setCollapsed?.((p) => !p)}
              className="ml-auto hidden md:flex"
            >
              <Motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
                <ChevronLeft size={14} color="white" />
              </Motion.div>
            </button>
          </div>

          {/* ─── NAV ─── */}
          <nav className="flex-1 overflow-y-auto px-2 space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.label}
                item={item}
                collapsed={collapsed}
                onClick={() => setSidebarOpen?.(false)}
                badgeCount={
                  item.path.includes("approvals")
                    ? pendingApprovals
                    : 0
                }
              />
            ))}
          </nav>

          {/* ─── FOOTER ─── */}
          <div className="p-2 border-t border-white/10 space-y-1">
            <NavLink to="/admin/settings/admin-settings">
              {({ isActive }) => (
                <div
                  className={`flex items-center ${
                    collapsed ? "justify-center" : "gap-3"
                  } px-3 py-2 rounded-xl`}
                  style={{
                    color: isActive ? "#fff" : T.textMuted,
                    background: isActive ? T.sidebarActive : "transparent",
                  }}
                >
                  <Settings size={16} />
                  {!collapsed && "Settings"}
                </div>
              )}
            </NavLink>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`w-full flex items-center ${
                collapsed ? "justify-center" : "gap-3"
              } px-3 py-2 rounded-xl text-red-400`}
            >
              {loggingOut ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <LogOut size={16} />
              )}
              {!collapsed && (loggingOut ? "Logging out..." : "Logout")}
            </button>

            {/* ─── PROFILE (FROM BACKEND) ─── */}
            <div className="mt-2 flex items-center gap-2 bg-[#2D2A6E] p-2 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                {initials.toUpperCase()}
              </div>

              {!collapsed && (
                <div className="text-xs text-white min-w-0">
                  <p className="font-semibold truncate">
                    {loading ? "Loading..." : name}
                  </p>
                  <p className="text-indigo-400 truncate capitalize">
                    {role}
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