
// src/admin/AdminMainLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSideNavbar from "./AdminSideNavbar";
import AdminMobileBottomNav from "./AdminMobileBottomNav";

export default function AdminMainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="flex w-full bg-slate-950 overflow-hidden relative"
      style={{ height: "100dvh" }}
    >
      <AdminSideNavbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main
        className="flex-1 overflow-y-auto bg-slate-50 lg:pb-0"
        style={{
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