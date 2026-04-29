// // src/admin/AdminMainLayout.jsx
// import { useState } from "react";
// import { Outlet } from "react-router-dom";
// import AdminSideNavbar from "./AdminSideNavbar";
// import AdminMobileBottomNav from "./AdminMobileBottomNav";

// export default function AdminMainLayout() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [collapsed, setCollapsed] = useState(false);

//   return (
//     <div className="flex h-screen w-full bg-slate-950 overflow-hidden relative">
//       <AdminSideNavbar
//         sidebarOpen={sidebarOpen}
//         setSidebarOpen={setSidebarOpen}
//         collapsed={collapsed}
//         setCollapsed={setCollapsed}
//       />

//       <main className="flex-1 overflow-y-auto pb-24 md:pb-0 bg-slate-50">
//         <Outlet />
//       </main>

//       <AdminMobileBottomNav setSidebarOpen={setSidebarOpen} />
//     </div>
//   );
// }


// src/admin/AdminMainLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSideNavbar from "./AdminSideNavbar";
import AdminMobileBottomNav from "./AdminMobileBottomNav";

export default function AdminMainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden relative">
      <AdminSideNavbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main className="flex-1 overflow-y-auto pb-16 lg:pb-0 bg-slate-50">
        <Outlet />
      </main>

      <AdminMobileBottomNav setSidebarOpen={setSidebarOpen} />
    </div>
  );
}