
// src/admin/AdminMainLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSideNavbar from "./AdminSideNavbar";
import AdminMobileBottomNav from "./AdminMobileBottomNav";
import C from "../styles/colors";

export default function AdminMainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="flex w-full overflow-hidden relative"
      style={{ height: "100dvh", background: C.navy }}
    >
      <AdminSideNavbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main
        className="flex-1 overflow-y-auto lg:pb-0"
        style={{
          background: C.bg,
          paddingBottom: "calc(var(--bottom-nav-height, 4rem) + env(safe-area-inset-bottom, 0px))",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Outlet />
      </main>

      <AdminMobileBottomNav setSidebarOpen={setSidebarOpen} />
    </div>
  );
}