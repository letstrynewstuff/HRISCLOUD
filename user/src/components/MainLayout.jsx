// import { useState } from "react";
// import { Outlet } from "react-router-dom"; // This renders the current page
// // import SideNavbar from "./SideNavbar";
// import SideNavbar from "./NavbarNew";
// import MobileBottomNav from "./MobileBottomNav";
// import C from "../styles/colors";

// export default function MainLayout() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [collapsed, setCollapsed] = useState(false);

//   return (
//     <div className="flex h-screen w-full bg-slate-50 overflow-hidden relative">
//       {/* 1. The Sidebar (Hidden on mobile unless sidebarOpen is true) */}
//       <SideNavbar
//         sidebarOpen={sidebarOpen}
//         setSidebarOpen={setSidebarOpen}
//         collapsed={collapsed}
//         onToggleCollapse={() => setCollapsed(!collapsed)}
//       />

//       {/* 2. The Page Content Area */}
//       <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
//         <Outlet />{" "}
//         {/* This is where your pages like Dashboard, Attendance, etc. will show up */}
//       </main>

//       {/* 3. The Mobile Bottom Bar (Always visible on small screens) */}
//       <MobileBottomNav setSidebarOpen={setSidebarOpen} />
//     </div>
//   );
// }

import { useState } from "react";
import { Outlet } from "react-router-dom";
import NavbarNew from "./NavbarNew"; // Use the clean name
import MobileBottomNav from "./MobileBottomNav";
import C from "../styles/colors";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden relative">
      {/* 1. The Sidebar */}
      <NavbarNew
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* 2. The Page Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* 3. The Mobile Bottom Bar */}
      <MobileBottomNav setSidebarOpen={setSidebarOpen} />
    </div>
  );
}