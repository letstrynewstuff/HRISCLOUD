// src/admin/AdminMobileBottomNav.jsx
import { LayoutDashboard, Menu, UserCog } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import C from "../styles/colors";

export default function AdminMobileBottomNav({ setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "Home", icon: LayoutDashboard, path: "/admin/dashboard" },
    { label: "Menu", icon: Menu, action: () => setSidebarOpen(true) },
    { label: "Profile", icon: UserCog, path: "/admin/settings/admin-settings" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-6 pb-5 pt-3 bg-[#1E1B4B]/95 backdrop-blur-lg border-t border-white/10 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      {tabs.map((tab, i) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path;

        return (
          <button
            key={i}
            onClick={tab.action ? tab.action : () => navigate(tab.path)}
            className="flex flex-col items-center gap-1 flex-1"
            style={{ background: "none", border: "none", outline: "none" }}
          >
            <div
              className="p-2 rounded-xl transition-all active:scale-90"
              style={{
                color: isActive ? "#6366F1" : "rgba(255,255,255,0.4)",
                background: isActive ? "rgba(99,102,241,0.15)" : "transparent",
              }}
            >
              <Icon size={24} />
            </div>
            <span
              className="text-[9px] font-bold uppercase tracking-wider"
              style={{ color: isActive ? "#6366F1" : "rgba(255,255,255,0.4)" }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
