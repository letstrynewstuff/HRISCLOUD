// import { Home, Menu, User } from "lucide-react";
// import { useNavigate, useLocation } from "react-router-dom";
// import C from "../styles/colors";

// export default function MobileBottomNav({ setSidebarOpen }) {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const tabs = [
//     { label: "Home", icon: Home, path: "/dashboard" },
//     { label: "Menu", icon: Menu, action: () => setSidebarOpen(true) }, // Opens the sidebar
//     { label: "Profile", icon: User, path: "/employeeprofile" },
//   ];

//   return (
//     <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-6 pb-4 pt-3 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-between items-center shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
//       {tabs.map((tab, i) => {
//         const Icon = tab.icon;
//         const isActive = location.pathname === tab.path;

//         return (
//           <button
//             key={i}
//             onClick={tab.action ? tab.action : () => navigate(tab.path)}
//             className="flex flex-col items-center gap-1 flex-1"
//             style={{ background: "none", border: "none", outline: "none" }}
//           >
//             <div
//               className="p-2 rounded-xl transition-all active:scale-90"
//               style={{
//                 color: isActive ? C.primary : "#94a3b8",
//                 background: isActive ? `${C.primary}15` : "transparent",
//               }}
//             >
//               <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
//             </div>
//             <span
//               className="text-[9px] font-bold uppercase tracking-tighter"
//               style={{ color: isActive ? C.primary : "#64748b" }}
//             >
//               {tab.label}
//             </span>
//           </button>
//         );
//       })}
//     </div>
//   );
// }

// src/components/MobileBottomNav.jsx
// Full-width native-feeling bottom tab bar.
// — Spacer div pushes page content up so bar never overlaps
// — Covers full footer width edge-to-edge
// — iOS safe-area aware (home bar notch)
// — Labels + animated active pill + top indicator dot

import { useNavigate, useLocation } from "react-router-dom";
import { Home, Menu, User, Clock, Plane } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import C from "../styles/colors";

export default function MobileBottomNav({ setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "Home",       icon: Home,  path: "/dashboard"       },
    { label: "Attendance", icon: Clock, path: "/attendance"      },
    { label: "Menu",       icon: Menu,  action: () => setSidebarOpen(true) },
    { label: "Leave",      icon: Plane, path: "/leave"           },
    { label: "Profile",    icon: User,  path: "/employeeprofile" },
  ];

  return (
    <>
      {/*
        SPACER — same height as the bar.
        Sits inside the page scroll flow so the last content
        item is never hidden behind the fixed bar.
        aria-hidden so screen readers skip it.
      */}
      <div
        className="md:hidden shrink-0"
        style={{ height: 64 }}
        aria-hidden="true"
      />

      {/*
        BAR — fixed, full width, full footer.
        z-50 means it's always on top.
        env(safe-area-inset-bottom) handles the iPhone home indicator.
      */}
      <Motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.12 }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
        style={{
          height: 64,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: `1.5px solid ${C.border}`,
          boxShadow: "0 -6px 28px rgba(0,0,0,0.08)",
        }}
      >
        {tabs.map((tab, i) => {
          const Icon     = tab.icon;
          const isActive = !!tab.path && location.pathname === tab.path;

          return (
            <Motion.button
              key={i}
              whileTap={{ scale: 0.86 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              onClick={tab.action ?? (() => navigate(tab.path))}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative"
              style={{
                background: "none",
                border: "none",
                outline: "none",
                cursor: "pointer",
                // subtle press bg
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {/* Top accent line — animates in when active */}
              <AnimatePresence>
                {isActive && (
                  <Motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    exit={{ scaleX: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-full"
                    style={{ width: 28, height: 3, background: C.primary, transformOrigin: "center" }}
                  />
                )}
              </AnimatePresence>

              {/* Icon wrapper — active gets a soft tinted background pill */}
              <div
                className="flex items-center justify-center rounded-2xl transition-all duration-200"
                style={{
                  width: 42,
                  height: 30,
                  background: isActive ? C.primaryLight : "transparent",
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  color={isActive ? C.primary : "#94A3B8"}
                />
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 500,
                  lineHeight: 1,
                  color: isActive ? C.primary : "#94A3B8",
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "-0.01em",
                }}
              >
                {tab.label}
              </span>
            </Motion.button>
          );
        })}
      </Motion.nav>
    </>
  );
}