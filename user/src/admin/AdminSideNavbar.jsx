// // src/admin/AdminSideNavbar.jsx

// import { useState } from "react";
// import { motion as Motion, AnimatePresence } from "framer-motion";
// import { NavLink } from "react-router-dom";
// import { useAuth } from "../components/useAuth";
// import BantaHRLogo from "../styles/BantaHRLogo";

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
//   sidebarActive: "rgba(79,70,229,0.28)",
//   border: "rgba(255,255,255,0.10)",
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

// /* ─── Nav Item ─── */
// function NavItem({ item, collapsed, badgeCount = 0, onClick }) {
//   const Icon = item.icon;

//   return (
//     <NavLink to={item.path} onClick={onClick}>
//       {({ isActive }) => (
//         <div
//           className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-xl text-sm`}
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

// /* ─── MAIN COMPONENT ─── */
// export default function AdminSideNavbar({
//   sidebarOpen = false,
//   setSidebarOpen,
//   collapsed = false,
//   setCollapsed,
//   pendingApprovals = 0,
// }) {
//   const { user, logout, loading } = useAuth(); // ✅ REAL BACKEND DATA
//   const [loggingOut, setLoggingOut] = useState(false);

//   /* ─── ADMIN DATA FROM BACKEND ─── */
//   const admin = user ?? {};

//   const firstName = admin.first_name || admin.firstName || "";
//   const lastName = admin.last_name || admin.lastName || "";

//   const name = `${firstName} ${lastName}`.trim() || admin.email || "Admin";

//   const initials = (firstName[0] || "A") + (lastName[0] || "D");

//   const role = admin.role || admin.job_role_name || "Administrator";

//   /* ─── LOGOUT ─── */
//   const handleLogout = async () => {
//     setLoggingOut(true);
//     try {
//       await logout();
//       setSidebarOpen?.(false);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoggingOut(false);
//     }
//   };

//   return (
//     <AnimatePresence>
//       {sidebarOpen && (
//         <Motion.aside
//           initial={{ x: -280 }}
//           animate={{ x: 0 }}
//           exit={{ x: -280 }}
//           transition={{ duration: 0.3 }}
//           className="flex flex-col h-full fixed inset-y-0 left-0 z-50 md:relative"
//           style={{
//             width: collapsed ? 64 : 256,
//             background: T.sidebar,
//             borderRight: `1px solid ${T.border}`,
//           }}
//         >
//           {/* ─── HEADER ─── */}
//           <div className="px-4 pt-6 pb-5 flex items-center gap-3">
//             {/* <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
//               <Shield size={16} color="#fff" />
//             </div> */}

//             {!collapsed && (
//               <div>
//                 {/* <p className="text-white font-bold text-sm">BantaHR</p> */}
//                 <BantaHRLogo variant="light" size="md" />
//                 <p className="text-xs text-indigo-400">Admin Panel</p>
//               </div>
//             )}

//             <button
//               onClick={() => setSidebarOpen?.(false)}
//               className="ml-auto md:hidden text-white/40"
//             >
//               <X size={20} />
//             </button>

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
//             {NAV_ITEMS.map((item) => (
//               <NavItem
//                 key={item.label}
//                 item={item}
//                 collapsed={collapsed}
//                 onClick={() => setSidebarOpen?.(false)}
//                 badgeCount={
//                   item.path.includes("approvals") ? pendingApprovals : 0
//                 }
//               />
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
//                 <Loader2 size={16} className="animate-spin" />
//               ) : (
//                 <LogOut size={16} />
//               )}
//               {!collapsed && (loggingOut ? "Logging out..." : "Logout")}
//             </button>

//             {/* ─── PROFILE (FROM BACKEND) ─── */}
//             <div className="mt-2 flex items-center gap-2 bg-[#2D2A6E] p-2 rounded-xl">
//               <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
//                 {initials.toUpperCase()}
//               </div>

//               {!collapsed && (
//                 <div className="text-xs text-white min-w-0">
//                   <p className="font-semibold truncate">
//                     {loading ? "Loading..." : name}
//                   </p>
//                   <p className="text-indigo-400 truncate capitalize">{role}</p>
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
import { useAuth } from "../components/useAuth";
import BantaHRLogo from "../styles/BantaHRLogo";
import {
  LayoutDashboard, Users, Building2, ClipboardCheck,
  DollarSign, Clock, Plane, GraduationCap, BarChart2,
  Heart, TrendingUp, FolderOpen, Settings, UserCog,
  ChevronLeft, LogOut, Bell, Loader2, X,
} from "lucide-react";

const T = {
  sidebar: "#1E1B4B",
  sidebarActive: "rgba(79,70,229,0.28)",
  border: "rgba(255,255,255,0.10)",
  textMuted: "rgba(255,255,255,0.40)",
};

const NAV_ITEMS = [
  { label: "Dashboard",    icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Employees",    icon: Users,           path: "/admin/employeemanagement/admin-employees" },
  { label: "Departments",  icon: Building2,       path: "/admin/employeemanagement/admin-departments" },
  { label: "Job Roles",    icon: UserCog,         path: "/admin/employeemanagement/admin-jobroles" },
  { label: "Approvals",    icon: ClipboardCheck,  path: "/admin/employeemanagement/admin-approvals" },
  { label: "Payroll",      icon: DollarSign,      path: "/admin/payroll/admin-payroll" },
  { label: "Attendance",   icon: Clock,           path: "/admin/attendance/admin-attendance" },
  { label: "Leave",        icon: Plane,           path: "/admin/leave-management" },
  { label: "Training",     icon: GraduationCap,   path: "/admin/training/admin-training" },
  { label: "Performance",  icon: TrendingUp,      path: "/admin/performance/admin-performance" },
  { label: "Documents",    icon: FolderOpen,      path: "/admin/documents/admin-documents" },
  { label: "Benefits",     icon: Heart,           path: "/admin/benefits/admin-benefits" },
  { label: "Reports",      icon: BarChart2,       path: "/admin/reports/admin-reports" },
  { label: "Announcements",icon: Bell,            path: "/admin/announcements" },
];

function NavItem({ item, collapsed, badgeCount = 0, onClick }) {
  const Icon = item.icon;
  return (
    <NavLink to={item.path} onClick={onClick}>
      {({ isActive }) => (
        <div
          className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-colors`}
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

// The actual sidebar content — shared between mobile and desktop
function SidebarContent({ collapsed, setCollapsed, setSidebarOpen, pendingApprovals, isMobile }) {
  const { user, logout, loading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const admin     = user ?? {};
  const firstName = admin.first_name || admin.firstName || "";
  const lastName  = admin.last_name  || admin.lastName  || "";
  const name      = `${firstName} ${lastName}`.trim() || admin.email || "Admin";
  const initials  = (firstName[0] || "A") + (lastName[0] || "D");
  const role      = admin.role || admin.job_role_name || "Administrator";

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
    <div
      className="flex flex-col h-full"
      style={{ background: T.sidebar, borderRight: `1px solid ${T.border}` }}
    >
      {/* Header */}
      <div className="px-4 pt-6 pb-5 flex items-center gap-3 shrink-0">
        {!collapsed && (
          <div>
            <BantaHRLogo variant="light" size="md" />
            <p className="text-xs text-indigo-400">Admin Panel</p>
          </div>
        )}

        {/* Mobile close */}
        {isMobile && (
          <button onClick={() => setSidebarOpen?.(false)} className="ml-auto text-white/40 lg:hidden">
            <X size={20} />
          </button>
        )}

        {/* Desktop collapse toggle */}
        {!isMobile && (
          <button onClick={() => setCollapsed?.((p) => !p)} className="ml-auto hidden lg:flex">
            <Motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
              <ChevronLeft size={14} color="white" />
            </Motion.div>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-1" style={{ scrollbarWidth: "none" }}>
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.label}
            item={item}
            collapsed={collapsed}
            onClick={() => isMobile && setSidebarOpen?.(false)}
            badgeCount={item.path.includes("approvals") ? pendingApprovals : 0}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-white/10 space-y-1 shrink-0">
        <NavLink to="/admin/settings/admin-settings">
          {({ isActive }) => (
            <div
              className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2 rounded-xl cursor-pointer`}
              style={{ color: isActive ? "#fff" : T.textMuted, background: isActive ? T.sidebarActive : "transparent" }}
            >
              <Settings size={16} />
              {!collapsed && "Settings"}
            </div>
          )}
        </NavLink>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2 rounded-xl text-red-400`}
        >
          {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
          {!collapsed && (loggingOut ? "Logging out..." : "Logout")}
        </button>

        <div className="mt-2 flex items-center gap-2 bg-[#2D2A6E] p-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials.toUpperCase()}
          </div>
          {!collapsed && (
            <div className="text-xs text-white min-w-0">
              <p className="font-semibold truncate">{loading ? "Loading..." : name}</p>
              <p className="text-indigo-400 truncate capitalize">{role}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminSideNavbar({
  sidebarOpen = false,
  setSidebarOpen,
  collapsed = false,
  setCollapsed,
  pendingApprovals = 0,
}) {
  return (
    <>
      {/* ── DESKTOP: always visible on lg+ ─────────────────────── */}
      <aside
        className="hidden lg:flex flex-col h-full shrink-0 transition-all duration-300"
        style={{ width: collapsed ? 64 : 256 }}
      >
        <SidebarContent
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setSidebarOpen={setSidebarOpen}
          pendingApprovals={pendingApprovals}
          isMobile={false}
        />
      </aside>

      {/* ── MOBILE: slide-in drawer on < lg ────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <Motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSidebarOpen?.(false)}
              className="lg:hidden fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
            />

            {/* Drawer */}
            <Motion.aside
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 flex flex-col"
              style={{ width: 256 }}
            >
              <SidebarContent
                collapsed={false}
                setCollapsed={setCollapsed}
                setSidebarOpen={setSidebarOpen}
                pendingApprovals={pendingApprovals}
                isMobile={true}
              />
            </Motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}