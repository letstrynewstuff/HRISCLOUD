// src/components/MobileBottomNav.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Menu, User, Clock, Plane, Award } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import C from "../styles/colors";
import { useAuth } from "./useAuth"; // same hook NavbarNew uses

export default function MobileBottomNav({ setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { employee } = useAuth();

  // Mirror the exact same manager check used in NavbarNew
  const isManager =
    employee?.role === "manager" || employee?.isManager === true;

  const profilePath = isManager ? "/managerprofile" : "/employeeprofile";
  const ProfileIcon = isManager ? Award : User;

  const tabs = [
    { label: "Home", icon: Home, path: "/dashboard" },
    { label: "Attendance", icon: Clock, path: "/attendance" },
    { label: "Menu", icon: Menu, action: () => setSidebarOpen(true) },
    { label: "Leave", icon: Plane, path: "/leave" },
    { label: "Profile", icon: ProfileIcon, path: profilePath },
  ];

  return (
    <>
      {/* Spacer — only on < lg */}
      <div
        className="lg:hidden shrink-0"
        style={{ height: 64 }}
        aria-hidden="true"
      />

      <Motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          delay: 0.12,
        }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
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
          const Icon = tab.icon;
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
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {/* Active indicator bar */}
              <AnimatePresence>
                {isActive && (
                  <Motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    exit={{ scaleX: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-full"
                    style={{
                      width: 28,
                      height: 3,
                      background:
                        isManager && tab.path === profilePath
                          ? "#F59E0B" // gold accent for manager tab
                          : C.primary,
                      transformOrigin: "center",
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Icon pill */}
              <div
                className="flex items-center justify-center rounded-2xl transition-all duration-200"
                style={{
                  width: 42,
                  height: 30,
                  background: isActive
                    ? isManager && tab.path === profilePath
                      ? "rgba(245,158,11,0.12)" // amber tint for manager
                      : C.primaryLight
                    : "transparent",
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  color={
                    isActive
                      ? isManager && tab.path === profilePath
                        ? "#F59E0B"
                        : C.primary
                      : "#94A3B8"
                  }
                />
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 500,
                  lineHeight: 1,
                  color: isActive
                    ? isManager && tab.path === profilePath
                      ? "#F59E0B"
                      : C.primary
                    : "#94A3B8",
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
