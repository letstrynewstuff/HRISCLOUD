

// src/MainLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import NavbarNew from "./NavbarNew";
import MobileBottomNav from "./MobileBottomNav";
import C from "../styles/colors";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="flex w-full overflow-hidden relative"
      style={{ height: "100dvh", background: C.bg }}
    >
      <NavbarNew
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      <main
        className="flex-1 overflow-y-auto lg:pt-0 lg:pb-0"
        style={{
          paddingTop: "var(--top-bar-height, 4rem)",
          paddingBottom: "calc(var(--bottom-nav-height, 4rem) + env(safe-area-inset-bottom, 0px))",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Outlet />
      </main>

      <MobileBottomNav setSidebarOpen={setSidebarOpen} />
    </div>
  );
}