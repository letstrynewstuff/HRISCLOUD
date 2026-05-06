
// // src/components/NavbarNew.jsx
// import { motion as Motion, AnimatePresence } from "framer-motion";
// import {
//   Shield, Settings, HelpCircle, Home, Clock, Plane,
//   DollarSign, FileText, BarChart2, Users, BookOpen,
//   Heart, ClipboardList, Bell, LogOut, ChevronLeft,
//   ChevronRight, User, Award, X,
// } from "lucide-react";
// import { NavLink } from "react-router-dom";
// import { useAuth } from "./useAuth";
// import C from "../styles/colors";
// import BantaHRLogo from "../styles/BantaHRLogo";

// const BASE_NAV = [
//   { label: "Home",          icon: Home,          path: "/dashboard"     },
//   { label: "Attendance",    icon: Clock,         path: "/attendance"    },
//   { label: "Leave",         icon: Plane,         path: "/leave"         },
//   { label: "Payslips",      icon: DollarSign,    path: "/payslips"      },
//   { label: "Documents",     icon: FileText,      path: "/documents"     },
//   { label: "Performance",   icon: BarChart2,     path: "/performance"   },
//   { label: "Team",          icon: Users,         path: "/team"          },
//   { label: "Training",      icon: BookOpen,      path: "/training"      },
//   { label: "Benefits",      icon: Heart,         path: "/benefits"      },
//   { label: "Requests",      icon: ClipboardList, path: "/requests"      },
//   { label: "Announcements", icon: Bell,          path: "/announcements" },
// ];

// // The actual sidebar content — shared between mobile and desktop
// function SidebarContent({ collapsed, onToggleCollapse, setSidebarOpen, isMobile }) {
//   const { employee, logout } = useAuth();
//   const emp = employee ?? { initials: "?", name: "Loading…", role: "Employee" };
//   const isManager = emp.role === "manager" || emp.isManager === true;

//   const navItems = [
//     ...BASE_NAV,
//     {
//       label: isManager ? "Manager Dashboard" : "My Profile",
//       icon:  isManager ? Award : User,
//       path:  isManager ? "/managerprofile" : "/employeeprofile",
//     },
//   ];

//   const close = () => setSidebarOpen?.(false);

//   return (
//     <div
//       className="flex flex-col h-full"
//       style={{ background: C.navy, transition: "width 0.3s ease" }}
//     >
//       {/* Header */}
//       <div className="px-4 pt-6 pb-5 flex items-center gap-3 shrink-0">
    

//         {!collapsed && (
//          <BantaHRLogo variant="light" size="md" />
//         )}

//         {/* Mobile close */}
//         {isMobile && (
//           <button onClick={close} className="ml-auto text-white/50 hover:text-white p-1">
//             <X size={24} />
//           </button>
//         )}

//         {/* Desktop collapse */}
//         {!isMobile && onToggleCollapse && (
//           <button
//             onClick={onToggleCollapse}
//             className="ml-auto text-white/40 hover:text-white/80 transition-colors"
//           >
//             {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
//           </button>
//         )}
//       </div>

//       {/* Nav */}
//       <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
//         {navItems.map((item) => {
//           const Icon = item.icon;
//           const isManagerItem = item.path === "/managerprofile";
//           return (
//             <NavLink
//               key={item.label}
//               to={item.path}
//               end={item.path === "/dashboard"}
//               onClick={isMobile ? close : undefined}
//             >
//               {({ isActive }) => (
//                 <Motion.div
//                   whileHover={{ x: collapsed ? 0 : 4 }}
//                   className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
//                   style={{
//                     background: isActive
//                       ? "rgba(79,70,229,0.30)"
//                       : isManagerItem && !isActive
//                         ? "rgba(245,158,11,0.10)"
//                         : "transparent",
//                     color: isActive ? "#fff" : isManagerItem ? "rgba(253,230,138,0.85)" : "rgba(255,255,255,0.55)",
//                     border: isManagerItem && !isActive ? "1px solid rgba(245,158,11,0.25)" : "1px solid transparent",
//                   }}
//                   title={collapsed ? item.label : undefined}
//                 >
//                   <Icon size={16} className="shrink-0" />
//                   {!collapsed && <span className="truncate">{item.label}</span>}
//                   {!collapsed && isManagerItem && isManager && (
//                     <span style={{
//                       marginLeft: "auto", background: "rgba(245,158,11,0.25)", color: "#FDE68A",
//                       fontSize: 8, fontWeight: 800, padding: "1px 6px", borderRadius: 99,
//                     }}>MGR</span>
//                   )}
//                 </Motion.div>
//               )}
//             </NavLink>
//           );
//         })}
//       </nav>

//       {/* Footer links */}
//       <div className="px-2 pb-2 space-y-0.5 shrink-0">
//         <NavLink to="/settings" onClick={isMobile ? close : undefined}>
//           {({ isActive }) => (
//             <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer"
//               style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.45)" }}
//               title={collapsed ? "Settings" : undefined}>
//               <Settings size={16} className="shrink-0" />
//               {!collapsed && <span>Settings</span>}
//             </div>
//           )}
//         </NavLink>
//         <NavLink to="/help" onClick={isMobile ? close : undefined}>
//           {({ isActive }) => (
//             <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer"
//               style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.35)" }}
//               title={collapsed ? "Help" : undefined}>
//               <HelpCircle size={16} className="shrink-0" />
//               {!collapsed && <span>Help</span>}
//             </div>
//           )}
//         </NavLink>
//       </div>

//       {/* User card */}
//       <div className="m-2 shrink-0">
//         <div className="p-3 rounded-xl flex gap-3 items-center" style={{ background: "rgba(255,255,255,0.08)" }}>
//           {emp.avatar ? (
//             <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
//           ) : (
//             <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
//               style={{ background: C.primary }}>
//               {emp.initials}
//             </div>
//           )}
//           {!collapsed && (
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center gap-1.5">
//                 <p className="text-white text-xs font-semibold truncate">{emp.name}</p>
//                 {isManager && (
//                   <span style={{
//                     background: "rgba(245,158,11,0.25)", color: "#FDE68A",
//                     fontSize: 7, fontWeight: 800, padding: "1px 5px", borderRadius: 99, flexShrink: 0,
//                   }}>MGR</span>
//                 )}
//               </div>
//               <p className="text-white/50 text-[11px] truncate">{emp.role}</p>
//             </div>
//           )}
//           <Motion.button
//             whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
//             onClick={() => { logout(); close(); }}
//             title="Logout"
//             className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
//             style={{ background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.25)", cursor: "pointer" }}
//           >
//             <LogOut size={13} color="#FCA5A5" />
//           </Motion.button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function NavbarNew({
//   sidebarOpen,
//   setSidebarOpen,
//   collapsed = false,
//   onToggleCollapse,
// }) {
//   return (
//     <>
//       {/* ── DESKTOP: always visible on lg+ ─────────────────────── */}
//       <aside
//         className="hidden lg:flex flex-col h-full shrink-0 transition-all duration-300"
//         style={{ width: collapsed ? 64 : 240 }}
//       >
//         <SidebarContent
//           collapsed={collapsed}
//           onToggleCollapse={onToggleCollapse}
//           setSidebarOpen={setSidebarOpen}
//           isMobile={false}
//         />
//       </aside>

//       {/* ── MOBILE: slide-in drawer on < lg ────────────────────── */}
//       <AnimatePresence>
//         {sidebarOpen && (
//           <>
//             {/* Backdrop */}
//             <Motion.div
//               key="backdrop"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.25 }}
//               onClick={() => setSidebarOpen?.(false)}
//               className="lg:hidden fixed inset-0 z-40"
//               style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
//             />

//             {/* Drawer */}
//             <Motion.aside
//               key="drawer"
//               initial={{ x: -260, opacity: 0 }}
//               animate={{ x: 0, opacity: 1 }}
//               exit={{ x: -260, opacity: 0 }}
//               transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
//               className="lg:hidden fixed inset-y-0 left-0 z-50 flex flex-col"
//               style={{ width: 240 }}
//             >
//               <SidebarContent
//                 collapsed={false}
//                 onToggleCollapse={onToggleCollapse}
//                 setSidebarOpen={setSidebarOpen}
//                 isMobile={true}
//               />
//             </Motion.aside>
//           </>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }

// src/components/NavbarNew.jsx
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Settings, HelpCircle, Home, Clock, Plane,
  DollarSign, FileText, BarChart2, Users, BookOpen,
  Heart, ClipboardList, Bell, LogOut, ChevronLeft,
  ChevronRight, User, Award, X, Menu,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "./useAuth";
import C from "../styles/colors";
import BantaHRLogo from "../styles/BantaHRLogo";

const BASE_NAV = [
  { label: "Home",          icon: Home,          path: "/dashboard"     },
  { label: "Attendance",    icon: Clock,         path: "/attendance"    },
  { label: "Leave",         icon: Plane,         path: "/leave"         },
  { label: "Payslips",      icon: DollarSign,    path: "/payslips"      },
  { label: "Documents",     icon: FileText,      path: "/documents"     },
  { label: "Performance",   icon: BarChart2,     path: "/performance"   },
  { label: "Team",          icon: Users,         path: "/team"          },
  { label: "Training",      icon: BookOpen,      path: "/training"      },
  { label: "Benefits",      icon: Heart,         path: "/benefits"      },
  { label: "Requests",      icon: ClipboardList, path: "/requests"      },
  { label: "Announcements", icon: Bell,          path: "/announcements" },
];

function SidebarContent({ collapsed, onToggleCollapse, setSidebarOpen, isMobile }) {
  const { employee, logout } = useAuth();
  const emp = employee ?? { initials: "?", name: "Loading…", role: "Employee" };
  const isManager = emp.role === "manager" || emp.isManager === true;

  const navItems = [
    ...BASE_NAV,
    {
      label: isManager ? "Manager Dashboard" : "My Profile",
      icon:  isManager ? Award : User,
      path:  isManager ? "/managerprofile" : "/employeeprofile",
    },
  ];

  const close = () => setSidebarOpen?.(false);

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: C.navy, transition: "width 0.3s ease" }}
    >
      {/* Sidebar Header */}
      <div className="px-4 pt-6 pb-5 flex items-center gap-3 shrink-0">
        {!collapsed && <BantaHRLogo variant="light" size="md" />}

        {/* Mobile close button (inside drawer) */}
        {isMobile && (
          <button onClick={close} className="ml-auto text-white/50 hover:text-white p-1">
            <X size={24} />
          </button>
        )}

        {/* Desktop collapse button */}
        {!isMobile && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="ml-auto text-white/40 hover:text-white/80 transition-colors"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isManagerItem = item.path === "/managerprofile";
          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === "/dashboard"}
              onClick={isMobile ? close : undefined}
            >
              {({ isActive }) => (
                <Motion.div
                  whileHover={{ x: collapsed ? 0 : 4 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
                  style={{
                    background: isActive
                      ? "rgba(79,70,229,0.30)"
                      : isManagerItem && !isActive
                        ? "rgba(245,158,11,0.10)"
                        : "transparent",
                    color: isActive ? "#fff" : isManagerItem ? "rgba(253,230,138,0.85)" : "rgba(255,255,255,0.55)",
                    border: isManagerItem && !isActive ? "1px solid rgba(245,158,11,0.25)" : "1px solid transparent",
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={16} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Motion.div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Settings/Help */}
      <div className="px-2 pb-2 space-y-0.5 shrink-0">
        <NavLink to="/settings" onClick={isMobile ? close : undefined}>
          {({ isActive }) => (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer"
              style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.45)" }}>
              <Settings size={16} />
              {!collapsed && <span>Settings</span>}
            </div>
          )}
        </NavLink>
        <NavLink to="/help" onClick={isMobile ? close : undefined}>
          {({ isActive }) => (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer"
              style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.35)" }}>
              <HelpCircle size={16} />
              {!collapsed && <span>Help</span>}
            </div>
          )}
        </NavLink>
      </div>

      {/* User card with Sidebar Logout button */}
      <div className="m-2 shrink-0">
        <div className="p-3 rounded-xl flex gap-3 items-center" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: C.primary }}>
            {emp.initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{emp.name}</p>
              <p className="text-white/50 text-[11px] truncate">{emp.role}</p>
            </div>
          )}
          <Motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => { logout(); close(); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.25)", cursor: "pointer" }}
          >
            <LogOut size={13} color="#FCA5A5" />
          </Motion.button>
        </div>
      </div>
    </div>
  );
}

export default function NavbarNew({
  sidebarOpen,
  setSidebarOpen,
  collapsed = false,
  onToggleCollapse,
}) {
  const { logout } = useAuth(); 
  return (
    <>
      {/* ── MOBILE TOP NAVBAR: Visible on Mobile and MD (< lg) ── */}
      <div 
        className="lg:hidden fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 z-[40]"
        style={{ 
          background: C.navy, 
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)"
        }}
      >
        {/* Menu Toggle */}
        {/* <button 
          onClick={() => setSidebarOpen(true)} 
          className="text-white/70 hover:text-white p-2"
        >
          <Menu size={24} />
        </button> */}

        {/* Logo */}
        <BantaHRLogo variant="light" size="sm" />

        {/* PERMANENT LOGOUT BUTTON (Mobile/MD) */}
        <button 
          onClick={() => logout()} 
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 active:scale-95 transition-transform"
          title="Logout"
        >
          <LogOut size={20} color="#FCA5A5" />
        </button>
      </div>

      {/* ── DESKTOP SIDEBAR: Hidden on < lg ── */}
      <aside
        className="hidden lg:flex flex-col h-full shrink-0 transition-all duration-300"
        style={{ width: collapsed ? 64 : 240 }}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          isMobile={false}
        />
      </aside>

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <Motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 z-[50]"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            />

            {/* Side Drawer */}
            <Motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 left-0 z-[60] flex flex-col"
              style={{ width: 260 }}
            >
              <SidebarContent
                collapsed={false}
                setSidebarOpen={setSidebarOpen}
                isMobile={true}
              />
            </Motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}