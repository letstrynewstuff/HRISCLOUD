import { Home, Menu, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import C from "../styles/colors";

export default function MobileBottomNav({ setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "Home", icon: Home, path: "/dashboard" },
    { label: "Menu", icon: Menu, action: () => setSidebarOpen(true) }, // Opens the sidebar
    { label: "Profile", icon: User, path: "/employeeprofile" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-6 pb-4 pt-3 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-between items-center shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
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
                color: isActive ? C.primary : "#94a3b8",
                background: isActive ? `${C.primary}15` : "transparent",
              }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span
              className="text-[9px] font-bold uppercase tracking-tighter"
              style={{ color: isActive ? C.primary : "#64748b" }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
